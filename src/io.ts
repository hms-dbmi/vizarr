import * as zarr from "zarrita";
import { ZarrPixelSource } from "./ZarrPixelSource";
import { loadOmeMultiscales, loadPlate, loadWell } from "./ome";
import * as utils from "./utils";

import { DEFAULT_LABEL_OPACITY } from "./layers/label-layer";
import type { BaseLayerProps } from "./layers/viv-layers";
import type { ImageLayerConfig, LayerState, MultichannelConfig, SingleChannelConfig, SourceData } from "./state";

async function loadSingleChannel(config: SingleChannelConfig, data: Array<ZarrPixelSource>): Promise<SourceData> {
  const { color, contrast_limits, visibility, name, colormap = "", opacity = 1 } = config;
  const lowres = data[data.length - 1];
  const selection = Array(data[0].shape.length).fill(0);
  const limits = contrast_limits ?? (await (() => utils.calcDataRange(lowres, selection))());
  return {
    loader: data,
    name,
    channel_axis: null,
    colors: [color ?? utils.COLORS.white],
    names: ["channel_0"],
    contrast_limits: [limits],
    visibilities: [visibility ?? true],
    model_matrix: utils.parseMatrix(config.model_matrix),
    defaults: {
      selection,
      colormap,
      opacity,
    },
    axis_labels: data[0].labels,
  };
}

async function loadMultiChannel(
  config: MultichannelConfig,
  data: Array<ZarrPixelSource>,
  channelAxis: number,
): Promise<SourceData> {
  const { names, contrast_limits, name, model_matrix, opacity = 1, colormap = "" } = config;
  let { visibilities, colors } = config;
  const n = data[0].shape[channelAxis];

  for (const channelProp of [contrast_limits, visibilities, names, colors]) {
    if (channelProp) {
      const propertyName = Object.keys({ channelProp })[0];
      utils.assert(
        channelProp.length === n,
        `channel_axis is length ${n} and provided channel_axis property ${propertyName} is different size.`,
      );
    }
  }

  visibilities = visibilities || utils.getDefaultVisibilities(n);
  colors = colors || utils.getDefaultColors(n, visibilities);

  const contrastLimits =
    contrast_limits ?? (await (() => utils.calcConstrastLimits(data[data.length - 1], channelAxis, visibilities))());

  return {
    loader: data,
    name,
    channel_axis: channelAxis,
    colors,
    names: names ?? utils.range(n).map((i) => `channel_${i}`),
    contrast_limits: contrastLimits,
    visibilities,
    model_matrix: utils.parseMatrix(model_matrix),
    defaults: {
      selection: Array(data[0].shape.length).fill(0),
      colormap,
      opacity,
    },
    axis_labels: data[0].labels,
  };
}

export type SourceKind =
  | { kind: "plate"; plate: Ome.Plate }
  | { kind: "well"; well: Ome.Well }
  | { kind: "multiscales"; attrs: { multiscales: Ome.Multiscale[] } }
  | { kind: "bioformats2raw" }
  | { kind: "empty-group" }
  | { kind: "array" };

/** Classify a zarr node by its attributes to determine the loading strategy. */
export function classifySource(
  node: zarr.Group<zarr.Readable> | zarr.Array<zarr.DataType, zarr.Readable>,
  attrs: zarr.Attributes,
): SourceKind {
  if (!(node instanceof zarr.Group)) {
    return { kind: "array" };
  }
  if (utils.isOmePlate(attrs)) {
    return { kind: "plate", plate: attrs.plate };
  }
  if (utils.isOmeWell(attrs)) {
    return { kind: "well", well: attrs.well };
  }
  if (utils.isMultiscales(attrs)) {
    return { kind: "multiscales", attrs };
  }
  if (utils.isBioformats2rawlayout(attrs)) {
    return { kind: "bioformats2raw" };
  }
  if (Object.keys(attrs).length === 0 && node.path) {
    return { kind: "empty-group" };
  }
  return { kind: "multiscales", attrs: attrs as { multiscales: Ome.Multiscale[] } };
}

export async function createSourceData(config: ImageLayerConfig): Promise<SourceData> {
  const node = await utils.open(config.source);
  let data: zarr.Array<zarr.DataType, zarr.Readable>[];
  let axes: Ome.Axis[] | undefined;

  if (node instanceof zarr.Group) {
    let attrs = utils.resolveAttrs(node.attrs);
    let source = classifySource(node, attrs);

    // Empty group — check parent for plate metadata
    if (source.kind === "empty-group") {
      const parent = await zarr.open(node.resolve(".."), { kind: "group" });
      const parentAttrs = utils.resolveAttrs(parent.attrs);
      const parentSource = classifySource(parent, parentAttrs);
      if (parentSource.kind === "plate") {
        return loadPlate(config, parent, parentSource.plate);
      }
    }

    switch (source.kind) {
      case "plate":
        return loadPlate(config, node, source.plate);
      case "well":
        return loadWell(config, node, source.well);
      case "multiscales":
        return loadOmeMultiscales(config, node, source.attrs);
      case "bioformats2raw": {
        let toUrl = `${utils.OME_VALIDATOR_URL}?source=${config.source}`;
        throw new utils.RedirectError("Please open in ome-ngff-validator", toUrl);
      }
      case "empty-group":
        utils.assert(false, "Group is missing multiscales specification.");
    }

    utils.assert(utils.isMultiscales(attrs), "Group is missing multiscales specification.");
    data = await utils.loadMultiscales(node, attrs.multiscales);
    if (attrs.multiscales[0].axes) {
      axes = utils.getNgffAxes(attrs.multiscales);
    }
  } else {
    data = [node];
  }

  // explicit override in config > ngff > guessed from data shape
  const { channel_axis, labels } = getAxisLabelsAndChannelAxis(config, axes, data[0]);

  const tileSize = utils.guessTileSize(data[0]);
  const loader = data.map((d) => new ZarrPixelSource(d, { labels, tileSize }));
  const [base] = loader;

  // If explicit channel axis is provided, try to load as multichannel.

  if ("channel_axis" in config || channel_axis > -1) {
    config = config as MultichannelConfig;
    return loadMultiChannel(config, loader, Number(config.channel_axis ?? channel_axis));
  }

  const nDims = base.shape.length;
  if (nDims === 2 || !("channel_axis" in config)) {
    return loadSingleChannel(config as SingleChannelConfig, loader);
  }

  throw Error("Failed to load image.");
}

type Labels = [...string[], "y", "x"];
function getAxisLabelsAndChannelAxis(
  config: ImageLayerConfig,
  ngffAxes: Ome.Axis[] | undefined,
  arr: zarr.Array<zarr.DataType, zarr.Readable>,
): { labels: Labels; channel_axis: number } {
  // type cast string[] to Labels
  const maybeAxisLabels = config.axis_labels as undefined | Labels;
  // ensure numeric if provided
  const maybeChannelAxis = "channel_axis" in config ? Number(config.channel_axis) : undefined;
  // Use ngff axes metadata if labels or channel axis aren't explicitly provided
  if (ngffAxes) {
    const labels = maybeAxisLabels ?? utils.getNgffAxisLabels(ngffAxes);
    const channel_axis = maybeChannelAxis ?? ngffAxes.findIndex((axis) => axis.type === "channel");
    return { labels, channel_axis };
  }

  // create dummy axis labels if not provided and try to guess channel_axis if missing
  const labels = maybeAxisLabels ?? utils.getAxisLabels(arr);
  const channel_axis = maybeChannelAxis ?? labels.indexOf("c");
  return { labels, channel_axis };
}

export function initLayerStateFromSource(source: SourceData & { id: string }): LayerState {
  const { selection, opacity, colormap } = source.defaults;

  const selections: number[][] = [];
  const colors: [number, number, number][] = [];
  const contrastLimits: [start: number, end: number][] = [];
  const channelsVisible: boolean[] = [];

  const visibleIndices = source.visibilities.flatMap((bool, i) => (bool ? i : []));
  // Limit the number of initial channels to the max allowed
  for (const index of visibleIndices.slice(0, utils.MAX_CHANNELS)) {
    const channelSelection = [...selection];
    if (Number.isInteger(source.channel_axis)) {
      channelSelection[source.channel_axis as number] = index;
    }
    selections.push(channelSelection);
    colors.push(utils.hexToRGB(source.colors[index]));
    // TODO: should never be undefined
    contrastLimits.push(source.contrast_limits[index] ?? [0, 255]);
    channelsVisible.push(true);
  }

  const layerProps = {
    id: source.id,
    selections,
    colors,
    contrastLimits,
    contrastLimitsRange: [...contrastLimits],
    channelsVisible,
    opacity,
    colormap,
    modelMatrix: source.model_matrix,
    onClick: source.onClick,
  } satisfies BaseLayerProps;

  if (source.loaders) {
    return {
      kind: "grid",
      layerProps: {
        ...layerProps,
        loaders: source.loaders,
        columns: source.columns as number,
        rows: source.rows as number,
      },
      on: true,
    };
  }

  let labels = undefined;
  if (source.labels && source.labels.length > 0) {
    labels = source.labels.map((label, i) => ({
      on: false,
      transformSourceSelection: getSourceSelectionTransform(label.loader[0], source.loader[0]),
      layerProps: {
        id: `${source.id}_${i}`,
        loader: label.loader,
        modelMatrix: label.modelMatrix,
        opacity: DEFAULT_LABEL_OPACITY,
        colors: label.colors,
      },
    }));
  }

  if (source.loader.length === 1) {
    return {
      kind: "image",
      layerProps: {
        ...layerProps,
        loader: source.loader[0],
      },
      on: true,
      labels,
    };
  }

  return {
    kind: "multiscale",
    layerProps: {
      ...layerProps,
      loader: source.loader,
    },
    on: true,
    labels,
  };
}

function getSourceSelectionTransform(
  labels: { shape: Array<number>; labels: Array<string> },
  source: { shape: Array<number>; labels: Array<string> },
) {
  utils.assert(
    source.shape.length === source.labels.length,
    `Image source axes and shape are not same rank. Got ${JSON.stringify(source)}`,
  );
  utils.assert(
    labels.shape.length === labels.labels.length,
    `Label axes and shape are not same rank. Got ${JSON.stringify(labels)}`,
  );
  utils.assert(
    labels.labels.every((label) => source.labels.includes(label)),
    `Label axes MUST be a subset of source. Source: ${JSON.stringify(source.labels)} Labels: ${JSON.stringify(labels.labels)}`,
  );
  // Identify labels that should always map to 0, regardless of the source selection.
  const excludeFromTransformedSelection = new Set(
    utils
      .zip(labels.labels, labels.shape)
      .filter(([_, size]) => size === 1)
      .map(([name, _]) => name),
  );
  return (sourceSelection: Array<number>): Array<number> => {
    return labels.labels.map((name) =>
      excludeFromTransformedSelection.has(name) ? 0 : sourceSelection[source.labels.indexOf(name)],
    );
  };
}

if (import.meta.vitest) {
  const { describe, it, expect } = import.meta.vitest;

  describe("classifySource", () => {
    function fakeGroup(path: `/${string}` = "/") {
      const store = new Map<string, Uint8Array>();
      return new zarr.Group(store, path, { zarr_format: 3, node_type: "group", attributes: {} });
    }

    function fakeArray() {
      const store = new Map<string, Uint8Array>();
      return new zarr.Array(store, "/", {
        zarr_format: 3,
        node_type: "array",
        attributes: {},
        shape: [1],
        data_type: "uint8",
        chunk_grid: { name: "regular", configuration: { chunk_shape: [1] } },
        chunk_key_encoding: { name: "default", configuration: { separator: "/" } },
        codecs: [{ name: "bytes", configuration: { endian: "little" } }],
        fill_value: 0,
      });
    }

    it("classifies a plate (IDR 5966)", () => {
      const attrs = {
        plate: {
          columns: [{ name: "1" }, { name: "2" }],
          rows: [{ name: "A" }, { name: "B" }],
          wells: [{ path: "A/1" }, { path: "B/2" }],
          version: "0.1",
          name: "test_plate",
        },
      };
      const result = classifySource(fakeGroup(), attrs);
      expect(result.kind).toBe("plate");
      expect(result).toHaveProperty("plate");
    });

    it("classifies a well", () => {
      const attrs = {
        well: {
          images: [{ path: "0" }, { path: "1" }],
          version: "0.1",
        },
      };
      const result = classifySource(fakeGroup(), attrs);
      expect(result.kind).toBe("well");
      expect(result).toHaveProperty("well");
    });

    it("classifies multiscales v0.1 with omero", () => {
      const attrs = {
        multiscales: [
          {
            datasets: [{ path: "0" }, { path: "1" }],
            version: "0.1",
          },
        ],
        omero: {
          channels: [{ color: "0000FF", window: { start: 0, end: 255 } }],
          rdefs: { model: "color" },
        },
      };
      const result = classifySource(fakeGroup(), attrs);
      expect(result.kind).toBe("multiscales");
    });

    it("classifies multiscales v0.4 with axes", () => {
      const attrs = {
        multiscales: [
          {
            axes: [
              { name: "c", type: "channel" },
              { name: "z", type: "space" },
              { name: "y", type: "space" },
              { name: "x", type: "space" },
            ],
            datasets: [{ path: "0", coordinateTransformations: [{ type: "scale", scale: [1, 1, 0.5, 0.5] }] }],
            version: "0.4",
          },
        ],
      };
      const result = classifySource(fakeGroup(), attrs);
      expect(result.kind).toBe("multiscales");
    });

    it("classifies bioformats2raw layout", () => {
      const attrs = { "bioformats2raw.layout": 3 };
      const result = classifySource(fakeGroup(), attrs);
      expect(result.kind).toBe("bioformats2raw");
    });

    it("classifies empty group (no attrs, has path)", () => {
      const result = classifySource(fakeGroup("/A/1"), {});
      expect(result.kind).toBe("empty-group");
    });

    it("classifies a bare array", () => {
      const result = classifySource(fakeArray(), {});
      expect(result.kind).toBe("array");
    });

    it("plate takes priority over multiscales", () => {
      const attrs = {
        plate: { columns: [], rows: [], wells: [] },
        multiscales: [{ datasets: [{ path: "0" }] }],
      };
      const result = classifySource(fakeGroup(), attrs);
      expect(result.kind).toBe("plate");
    });

    it("well takes priority over multiscales", () => {
      const attrs = {
        well: { images: [{ path: "0" }] },
        multiscales: [{ datasets: [{ path: "0" }] }],
      };
      const result = classifySource(fakeGroup(), attrs);
      expect(result.kind).toBe("well");
    });
  });
}
