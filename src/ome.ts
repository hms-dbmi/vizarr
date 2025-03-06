import pMap from "p-map";
import * as zarr from "zarrita";
import type { ImageLabels, ImageLayerConfig, OnClickData, SourceData } from "./state";

import { ZarrPixelSource } from "./ZarrPixelSource";
import type { OmeColor } from "./layers/label-layer";
import * as utils from "./utils";

export async function loadWell(
  config: ImageLayerConfig,
  grp: zarr.Group<zarr.Readable>,
  wellAttrs: Ome.Well,
): Promise<SourceData> {
  // Can filter Well fields by URL query ?acquisition=ID
  const acquisitionId: number | undefined = config.acquisition ? Number.parseInt(config.acquisition) : undefined;
  let acquisitions: Ome.Acquisition[] = [];

  utils.assert(wellAttrs?.images, "Well .zattrs missing images");
  utils.assert(grp.path, "Cannot inspect zarr path to open well.");

  const [row, col] = grp.path.split("/").filter(Boolean).slice(-2);

  let { images } = wellAttrs;

  // Do we have more than 1 Acquisition?
  const acqIds = images.flatMap((img) => (img.acquisition ? [img.acquisition] : []));

  if (acqIds.length > 1) {
    // Need to get acquisitions metadata from parent Plate
    const platePath = grp.path.replace(`${row}/${col}`, "");
    const plate = await zarr.open(grp.resolve(platePath));
    const plateAttrs = utils.resolveAttrs(plate.attrs) as { plate: Ome.Plate };
    acquisitions = plateAttrs.plate.acquisitions ?? [];
    // filter imagePaths by acquisition
    if (acquisitionId && acqIds.includes(acquisitionId)) {
      images = images.filter((img) => img.acquisition === acquisitionId);
    }
  }

  const imgPaths = images.map((img) => img.path);
  const cols = Math.ceil(Math.sqrt(imgPaths.length));
  const rows = Math.ceil(imgPaths.length / cols);

  // Use first image for rendering settings, resolutions etc.
  const first = await zarr.open(grp.resolve(imgPaths[0]), { kind: "group" });
  const imgAttrs = utils.resolveAttrs(first.attrs);

  utils.assert(utils.isMultiscales(imgAttrs), "Path for image is not valid.");
  let resolution = imgAttrs.multiscales[0].datasets[0].path;

  // Create loader for every Image.
  const promises = imgPaths.map((p) => {
    const loc = grp.resolve(utils.join(p, resolution));
    // @ts-expect-error - ok flag to avoid loading unused attrs
    const arr: zarr.Array<zarr.DataType, zarr.Readable> = zarr.open(loc, { kind: "array", attrs: false });
    return arr;
  });
  const data = await Promise.all(promises);
  const axes = utils.getNgffAxes(imgAttrs.multiscales);
  const axis_labels = utils.getNgffAxisLabels(axes);

  const tileSize = utils.guessTileSize(data[0]);
  const loaders = utils.range(rows).flatMap((row) => {
    // filter to remove any empty row/col position
    return utils
      .range(cols)
      .filter((col) => col + row * cols < data.length)
      .map((col) => {
        const offset = col + row * cols;
        return {
          name: String(offset),
          row,
          col,
          loader: new ZarrPixelSource(data[offset], { labels: axis_labels, tileSize }),
        };
      });
  });

  let meta: Meta;
  if (utils.isOmeMultiscales(imgAttrs)) {
    meta = parseOmeroMeta(imgAttrs.omero, axes);
  } else {
    meta = await defaultMeta(loaders[0].loader, axis_labels);
  }

  const sourceData: SourceData = {
    loaders,
    ...meta,
    axis_labels,
    loader: [loaders[0].loader],
    model_matrix: utils.parseMatrix(config.model_matrix),
    defaults: {
      selection: meta.defaultSelection,
      colormap: config.colormap ?? "",
      opacity: config.opacity ?? 1,
    },
    name: `Well ${row}${col}`,
  };

  if (acquisitions.length > 0) {
    // To show acquisition chooser in UI
    sourceData.acquisitions = acquisitions;
    sourceData.acquisitionId = acquisitionId || -1;
  }

  sourceData.rows = rows;
  sourceData.columns = cols;
  sourceData.onClick = (info: OnClickData) => {
    let gridCoord = info.gridCoord;
    if (!gridCoord) {
      return;
    }
    const { row, column } = gridCoord;
    let imgSource = undefined;
    if (typeof config.source === "string" && grp.path && !Number.isNaN(row) && !Number.isNaN(column)) {
      const field = row * cols + column;
      imgSource = utils.join(config.source, imgPaths[field]);
    }
    if (config.onClick) {
      info.layer = undefined;
      info.imageSource = imgSource;
      config.onClick(info);
    } else if (imgSource) {
      window.open(`${window.location.origin + window.location.pathname}?source=${imgSource}`);
    }
  };

  return sourceData;
}

export async function loadPlate(
  config: ImageLayerConfig,
  grp: zarr.Group<zarr.Readable>,
  plateAttrs: Ome.Plate,
): Promise<SourceData> {
  utils.assert(plateAttrs?.rows || plateAttrs?.columns, "Plate .zattrs missing rows, columns or wells");

  const rows = plateAttrs.rows.map((row) => row.name);
  const columns = plateAttrs.columns.map((row) => row.name);

  // Fields are by index and we assume at least 1 per Well
  const wellPaths = plateAttrs.wells.map((well) => well.path);
  const zarrVersion = await utils.guessZarrVersion(grp);

  // Use first image as proxy for others.
  const wellAttrs = await utils.getAttrsOnly<{ well: Ome.Well }>(grp, {
    path: wellPaths[0],
    zarrVersion,
  });
  utils.assert("well" in wellAttrs, "Path for image is not valid, not a well.");

  const imgPath = wellAttrs.well.images[0].path;
  const imgAttrs = await utils.getAttrsOnly<Ome.Attrs>(grp, {
    path: utils.join(wellPaths[0], imgPath),
    zarrVersion,
  });
  utils.assert("multiscales" in imgAttrs, "Path for image is not valid.");

  // Lowest resolution is the 'path' of the last 'dataset' from the first multiscales
  const { datasets } = imgAttrs.multiscales[0];
  const resolution = datasets[datasets.length - 1].path;

  async function getImgPath(wellPath: string) {
    const wellAttrs = await utils.getAttrsOnly<{ well: Ome.Well }>(grp, {
      path: wellPath,
      zarrVersion,
    });
    utils.assert("well" in wellAttrs, "Path for image is not valid, not a well.");
    return utils.join(wellPath, wellAttrs.well.images[0].path);
  }
  const wellImagePaths = await Promise.all(wellPaths.map(getImgPath));

  // Create loader for every Well. Some loaders may be undefined if Wells are missing.
  const mapper = async ([key, path]: string[]) => {
    // @ts-expect-error - we don't need the meta for these arrays
    let arr: zarr.Array<zarr.DataType, zarr.Readable> = await zarr.open(grp.resolve(path), {
      kind: "array",
      attrs: false,
    });
    return [key, arr] as const;
  };

  const promises = await pMap(
    wellImagePaths.map((p) => [p, utils.join(p, resolution)]),
    mapper,
    { concurrency: 10 },
  );
  const data = await Promise.all(promises);
  const axes = utils.getNgffAxes(imgAttrs.multiscales);
  const axis_labels = utils.getNgffAxisLabels(axes);
  const tileSize = utils.guessTileSize(data[0][1]);
  const loaders = data.map((d) => {
    const [row, col] = d[0].split("/");
    return {
      name: `${row}${col}`,
      row: rows.indexOf(row),
      col: columns.indexOf(col),
      loader: new ZarrPixelSource(d[1], { labels: axis_labels, tileSize }),
    };
  });
  let meta: Meta;
  if ("omero" in imgAttrs) {
    meta = parseOmeroMeta(imgAttrs.omero, axes);
  } else {
    meta = await defaultMeta(loaders[0].loader, axis_labels);
  }

  // Load Image to use for channel names, rendering settings, sizeZ, sizeT etc.
  const sourceData: SourceData = {
    loaders,
    ...meta,
    axis_labels,
    loader: [loaders[0].loader],
    model_matrix: utils.parseMatrix(config.model_matrix),
    defaults: {
      selection: meta.defaultSelection,
      colormap: config.colormap ?? "",
      opacity: config.opacity ?? 1,
    },
    name: plateAttrs.name || "Plate",
    rows: rows.length,
    columns: columns.length,
  };
  // Us onClick from image config or Open Well in new window
  sourceData.onClick = (info: OnClickData) => {
    let gridCoord = info.gridCoord;
    if (!gridCoord) {
      return;
    }
    const { row, column } = gridCoord;
    let imgSource = undefined;
    if (typeof config.source === "string" && grp.path && !Number.isNaN(row) && !Number.isNaN(column)) {
      imgSource = utils.join(config.source, rows[row], columns[column]);
    }
    if (config.onClick) {
      info.layer = undefined;
      info.imageSource = imgSource;
      config.onClick(info);
    } else if (imgSource) {
      window.open(`${window.location.origin + window.location.pathname}?source=${imgSource}`);
    }
  };
  return sourceData;
}

export async function loadOmeMultiscales(
  config: ImageLayerConfig,
  grp: zarr.Group<zarr.Readable>,
  attrs: { multiscales: Ome.Multiscale[]; omero: Ome.Omero },
): Promise<SourceData> {
  const { name, opacity = 1, colormap = "" } = config;
  const data = await utils.loadMultiscales(grp, attrs.multiscales);
  const axes = utils.getNgffAxes(attrs.multiscales);
  const axis_labels = utils.getNgffAxisLabels(axes);
  const meta = parseOmeroMeta(attrs.omero, axes);
  const tileSize = utils.guessTileSize(data[0]);
  const loader = data.map((arr) => new ZarrPixelSource(arr, { labels: axis_labels, tileSize }));
  const labels = await resolveOmeLabelsFromMultiscales(grp);
  return {
    loader: loader,
    axis_labels,
    model_matrix: config.model_matrix
      ? utils.parseMatrix(config.model_matrix)
      : utils.coordinateTransformationsToMatrix(attrs.multiscales),
    defaults: {
      selection: meta.defaultSelection,
      colormap,
      opacity,
    },
    ...meta,
    name: meta.name ?? name,
    labels: await Promise.all(labels.map((name) => loadOmeImageLabel(grp.resolve("labels"), name))),
  };
}

async function loadOmeImageLabel(root: zarr.Location<zarr.Readable>, name: string): Promise<ImageLabels[number]> {
  const grp = await zarr.open(root.resolve(name), { kind: "group" });
  const attrs = utils.resolveAttrs(grp.attrs);
  utils.assert(utils.isOmeImageLabel(attrs), "No 'image-label' metadata.");
  const data = await utils.loadMultiscales(grp, attrs.multiscales);
  const baseResolution = data.at(0);
  utils.assert(baseResolution, "No base resolution found for multiscale labels.");
  const tileSize = utils.guessTileSize(baseResolution);
  const axes = utils.getNgffAxes(attrs.multiscales);
  const labels = utils.getNgffAxisLabels(axes);
  const colors = (attrs["image-label"].colors ?? []).map((d) => ({ labelValue: d["label-value"], rgba: d.rgba }));
  return {
    name,
    modelMatrix: utils.coordinateTransformationsToMatrix(attrs.multiscales),
    loader: data.map((arr) => new ZarrPixelSource(arr, { labels, tileSize })),
    colors: colors.length > 0 ? colors : undefined,
  };
}

async function resolveOmeLabelsFromMultiscales(grp: zarr.Group<zarr.Readable>): Promise<Array<string>> {
  return zarr
    .open(grp.resolve("labels"), { kind: "group" })
    .then(({ attrs }) => (attrs.labels ?? []) as Array<string>)
    .catch((e) => {
      utils.rethrowUnless(e, zarr.NodeNotFoundError);
      return [];
    });
}

type Meta = {
  name: string | undefined;
  names: Array<string>;
  colors: Array<string>;
  contrast_limits: Array<[number, number] | undefined>;
  visibilities: Array<boolean>;
  channel_axis: number | null;
  defaultSelection: Array<number>;
};

async function defaultMeta(loader: ZarrPixelSource, axis_labels: string[]): Promise<Meta> {
  const channel_axis = axis_labels.indexOf("c");
  const channel_count = channel_axis === -1 ? 1 : loader.shape[channel_axis];
  const visibilities = utils.getDefaultVisibilities(channel_count);
  const contrast_limits = await utils.calcConstrastLimits(loader, channel_axis, visibilities);
  const colors = utils.getDefaultColors(channel_count, visibilities);
  return {
    name: "Image",
    names: utils.range(channel_count).map((i) => `channel_${i}`),
    colors,
    contrast_limits,
    visibilities,
    channel_axis: axis_labels.includes("c") ? axis_labels.indexOf("c") : null,
    defaultSelection: axis_labels.map(() => 0),
  };
}

function parseOmeroMeta({ rdefs, channels, name }: Ome.Omero, axes: Ome.Axis[]): Meta {
  const t = rdefs?.defaultT ?? 0;
  const z = rdefs?.defaultZ ?? 0;

  const colors: string[] = [];
  const contrast_limits: [min: number, max: number][] = [];
  const visibilities: boolean[] = [];
  const names: string[] = [];

  channels.forEach((c, index) => {
    colors.push(c.color);
    contrast_limits.push([c.window.start, c.window.end]);
    visibilities.push(c.active);
    names.push(c.label || `${index}`);
  });

  const defaultSelection = axes.map((axis) => {
    if (axis.type === "time") return t;
    if (axis.name === "z") return z;
    return 0;
  });
  const channel_axis = axes.findIndex((axis) => axis.type === "channel");

  return {
    name,
    names,
    colors,
    contrast_limits,
    visibilities,
    channel_axis,
    defaultSelection,
  };
}
