import {DTYPE_VALUES, ImageLayer, MultiscaleImageLayer, ZarrPixelSource} from "../_snowpack/pkg/@hms-dbmi/viv.js";
import {Group as ZarrGroup, HTTPStore, openGroup} from "../_snowpack/pkg/zarr.js";
import GridLayer from "./gridLayer.js";
import {loadOmeroMultiscales, loadPlate, loadWell} from "./ome.js";
import {
  COLORS,
  CYMRGB,
  guessTileSize,
  hexToRGB,
  loadMultiscales,
  MAGENTA_GREEN,
  MAX_CHANNELS,
  nested,
  open,
  parseMatrix,
  range,
  RGB
} from "./utils.js";
function getAxisLabels(arr, axis_labels, channel_axis) {
  if (!axis_labels || axis_labels.length != arr.shape.length) {
    const nonXYaxisLabels = arr.shape.slice(0, -2).map((d, i) => "" + i);
    axis_labels = nonXYaxisLabels.concat(["y", "x"]);
  }
  if (channel_axis) {
    axis_labels[channel_axis] = "c";
  }
  return axis_labels;
}
function loadSingleChannel(config, data, max) {
  const {color, contrast_limits, visibility, name, colormap = "", opacity = 1} = config;
  return {
    loader: data,
    name,
    channel_axis: null,
    colors: [color ?? COLORS.white],
    names: ["channel_0"],
    contrast_limits: [contrast_limits ?? [0, max]],
    visibilities: [visibility ?? true],
    model_matrix: parseMatrix(config.model_matrix),
    defaults: {
      selection: Array(data[0].shape.length).fill(0),
      colormap,
      opacity
    },
    axis_labels: data[0].labels
  };
}
function loadMultiChannel(config, data, max) {
  const {names, channel_axis, name, model_matrix, opacity = 1, colormap = ""} = config;
  let {contrast_limits, visibilities, colors} = config;
  const n = data[0].shape[channel_axis];
  for (const channelProp of [contrast_limits, visibilities, names, colors]) {
    if (channelProp && channelProp.length !== n) {
      const propertyName = Object.keys({channelProp})[0];
      throw Error(`channel_axis is length ${n} and provided channel_axis property ${propertyName} is different size.`);
    }
  }
  if (!visibilities) {
    if (n <= MAX_CHANNELS) {
      visibilities = Array(n).fill(true);
    } else {
      visibilities = [...Array(MAX_CHANNELS).fill(true), ...Array(n - MAX_CHANNELS).fill(false)];
    }
  }
  if (!colors) {
    if (n == 1) {
      colors = [COLORS.white];
    } else if (n == 2) {
      colors = MAGENTA_GREEN;
    } else if (n === 3) {
      colors = RGB;
    } else if (n <= MAX_CHANNELS) {
      colors = CYMRGB.slice(0, n);
    } else {
      colors = Array(n).fill(COLORS.white);
      const visibleIndices = visibilities.flatMap((bool, i) => bool ? i : []);
      for (const [i, visibleIndex] of visibleIndices.entries()) {
        colors[visibleIndex] = CYMRGB[i];
      }
    }
  }
  return {
    loader: data,
    name,
    channel_axis: Number(channel_axis),
    colors,
    names: names ?? range(n).map((i) => `channel_${i}`),
    contrast_limits: contrast_limits ?? Array(n).fill([0, max]),
    visibilities,
    model_matrix: parseMatrix(config.model_matrix),
    defaults: {
      selection: Array(data[0].shape.length).fill(0),
      colormap,
      opacity
    },
    axis_labels: data[0].labels
  };
}
function isNested(attrs) {
  let version;
  if ("plate" in attrs) {
    version = attrs.plate.version;
  } else if ("omero" in attrs) {
    version = attrs.multiscales[0].version;
  } else if ("well" in attrs) {
    version = attrs.well.version;
  }
  return version && version !== "0.1";
}
export async function createSourceData(config) {
  const node = await open(config.source);
  let data;
  if (node instanceof ZarrGroup) {
    const attrs = await node.attrs.asObject();
    if (isNested(attrs)) {
      node.store = nested(node.store);
    }
    if ("plate" in attrs) {
      return loadPlate(config, node, attrs.plate);
    }
    if ("well" in attrs) {
      return loadWell(config, node, attrs.well);
    }
    if ("omero" in attrs) {
      return loadOmeroMultiscales(config, node, attrs);
    }
    if (Object.keys(attrs).length === 0 && node.store instanceof HTTPStore) {
      const parentUrl = node.store.url.slice(0, node.store.url.lastIndexOf("/"));
      const parent = await openGroup(new HTTPStore(parentUrl));
      const parentAttrs = await parent.attrs.asObject();
      if ("plate" in parentAttrs) {
        return loadPlate(config, parent, parentAttrs.plate);
      }
    }
    if (!("multiscales" in attrs)) {
      throw Error("Group is missing multiscales specification.");
    }
    data = await loadMultiscales(node, attrs.multiscales);
  } else {
    data = [node];
  }
  const labels = getAxisLabels(data[0], config.axis_labels);
  const tileSize = guessTileSize(data[0]);
  const loader = data.map((d) => new ZarrPixelSource(d, labels, tileSize));
  const [base] = loader;
  const max = base.dtype === "Float32" ? 1 : DTYPE_VALUES[base.dtype].max;
  if ("channel_axis" in config) {
    return loadMultiChannel(config, loader, max);
  }
  const nDims = base.shape.length;
  if (nDims === 2 || !("channel_axis" in config)) {
    return loadSingleChannel(config, loader, max);
  }
  throw Error("Failed to load image.");
}
export function initLayerStateFromSource(sourceData, layerId) {
  const {
    loader,
    channel_axis,
    colors,
    visibilities,
    contrast_limits,
    model_matrix,
    defaults,
    loaders,
    rows,
    columns,
    onClick
  } = sourceData;
  const {selection, opacity, colormap} = defaults;
  const Layer = getLayer(sourceData);
  const loaderSelection = [];
  const colorValues = [];
  const contrastLimits = [];
  const channelIsOn = [];
  const visibleIndices = visibilities.flatMap((bool, i) => bool ? i : []);
  for (const index of visibleIndices) {
    if (Number.isInteger(channel_axis)) {
      const channelSelection = [...selection];
      channelSelection[channel_axis] = index;
      loaderSelection.push(channelSelection);
    } else {
      loaderSelection.push(selection);
    }
    colorValues.push(hexToRGB(colors[index]));
    contrastLimits.push(contrast_limits[index]);
    channelIsOn.push(true);
  }
  const sliderValues = [...contrastLimits];
  if (!(loader[0].dtype in DTYPE_VALUES)) {
    throw Error(`Dtype not supported, must be ${JSON.stringify(Object.keys(DTYPE_VALUES))}`);
  }
  return {
    Layer,
    layerProps: {
      id: layerId,
      loader: loader.length === 1 ? loader[0] : loader,
      loaders,
      rows,
      columns,
      loaderSelection,
      colorValues,
      sliderValues,
      contrastLimits,
      channelIsOn,
      opacity,
      colormap,
      modelMatrix: model_matrix,
      onClick
    },
    on: true
  };
}
function getLayer(sourceData) {
  return sourceData.loaders ? GridLayer : sourceData.loader.length > 1 ? MultiscaleImageLayer : ImageLayer;
}
