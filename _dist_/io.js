import {openArray} from "../web_modules/zarr.js";
import {ZarrLoader, ImageLayer, MultiscaleImageLayer, DTYPE_VALUES} from "../web_modules/@hms-dbmi/viv.js";
import {loadOME, loadOMEPlate, loadOMEWell} from "./ome.js";
import {
  getJson,
  MAX_CHANNELS,
  COLORS,
  MAGENTA_GREEN,
  RGB,
  CYMRGB,
  normalizeStore,
  hexToRGB,
  range,
  rstrip
} from "./utils.js";
import GridLayer from "./gridLayer.js";
function getAxisLabels(config, loader) {
  let {axis_labels} = config;
  if (!axis_labels || axis_labels.length != loader.base.shape.length) {
    const nonXYaxisLabels = loader.base.shape.slice(0, -2).map((d, i) => "" + i);
    axis_labels = nonXYaxisLabels.concat(["y", "x"]);
  }
  return axis_labels;
}
function loadSingleChannel(config, loader, max) {
  const {color, contrast_limits, visibility, name, colormap = "", opacity = 1, translate} = config;
  return {
    loader,
    name,
    channel_axis: null,
    colors: [color ?? COLORS.white],
    names: ["channel_0"],
    contrast_limits: [contrast_limits ?? [0, max]],
    visibilities: [visibility ?? true],
    defaults: {
      selection: Array(loader.base.shape.length).fill(0),
      colormap,
      opacity
    },
    axis_labels: getAxisLabels(config, loader),
    translate: translate ?? [0, 0]
  };
}
function loadMultiChannel(config, loader, max) {
  const {names, channel_axis, name, opacity = 1, colormap = "", translate} = config;
  let {contrast_limits, visibilities, colors} = config;
  const {base} = loader;
  const n = base.shape[channel_axis];
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
  let axis_labels = getAxisLabels(config, loader);
  axis_labels[channel_axis] = "c";
  return {
    loader,
    name,
    channel_axis,
    colors,
    names: names ?? range(n).map((i) => `channel_${i}`),
    contrast_limits: contrast_limits ?? Array(n).fill([0, max]),
    visibilities,
    defaults: {
      selection: Array(loader.base.shape.length).fill(0),
      colormap,
      opacity
    },
    axis_labels,
    translate: translate ?? [0, 0]
  };
}
export function createLoader(dataArr) {
  const base = dataArr[0];
  const {chunks, shape} = base;
  const [tileHeight, tileWidth] = chunks.slice(-2);
  const data = dataArr.length === 1 || tileHeight !== tileWidth ? base : dataArr;
  const dimensions = [...range(shape.length - 2), "y", "x"].map((field) => ({field}));
  return new ZarrLoader({data, dimensions});
}
async function openMultiResolutionData(store, rootAttrs) {
  let resolutions = ["0"];
  if ("multiscales" in rootAttrs) {
    const {datasets} = rootAttrs.multiscales[0];
    resolutions = datasets.map((d) => d.path);
  }
  const promises = resolutions.map((path) => openArray({store, path}));
  const data = await Promise.all(promises);
  return data;
}
export async function createSourceData(config) {
  const {source} = config;
  let data;
  let rootAttrs;
  const store = normalizeStore(source);
  if (await store.containsItem(".zgroup")) {
    try {
      rootAttrs = await getJson(store, ".zattrs");
      if (rootAttrs?.plate) {
        return loadOMEPlate(config, store, rootAttrs);
      } else if (rootAttrs?.well) {
        return loadOMEWell(config, store, rootAttrs);
      }
      data = await openMultiResolutionData(store, rootAttrs);
    } catch (err) {
      const url = rstrip(store.url, "/");
      const parentUrl = url.slice(0, url.lastIndexOf("/"));
      const parentStore = normalizeStore(parentUrl);
      const parentAttrs = await getJson(parentStore, ".zattrs");
      if (parentAttrs?.plate) {
        return loadOMEPlate(config, parentStore, parentAttrs);
      } else {
        throw Error(`Failed to open arrays in zarr.Group. Make sure group implements multiscales extension.`);
      }
    }
  } else {
    data = [await openArray({store})];
  }
  const loader = createLoader(data);
  const {base, dtype} = loader;
  if (!(dtype in DTYPE_VALUES)) {
    throw Error("Dtype not supported, must be u1, u2, u4, or f4");
  }
  const max = dtype === "<f4" ? 1 : DTYPE_VALUES[dtype].max;
  const nDims = base.shape.length;
  if (nDims === 2 || config.channel_axis === void 0 && !rootAttrs?.omero) {
    return loadSingleChannel(config, loader, max);
  }
  if (Number.isInteger(config.channel_axis)) {
    return loadMultiChannel(config, loader, max);
  }
  if (rootAttrs?.omero) {
    return loadOME(config, rootAttrs.omero, loader);
  }
  throw Error("Failed to load image.");
}
export function initLayerStateFromSource(sourceData, layerId) {
  const {
    loader,
    source,
    channel_axis,
    colors,
    visibilities,
    contrast_limits,
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
  return {
    Layer,
    layerProps: {
      id: layerId,
      loader,
      loaders,
      loaderSelection,
      colorValues,
      sliderValues,
      contrastLimits,
      channelIsOn,
      opacity,
      colormap,
      rows,
      columns,
      onClick
    },
    on: true
  };
}
function getLayer(sourceData) {
  return sourceData.loaders ? GridLayer : sourceData.loader.numLevels > 1 ? MultiscaleImageLayer : ImageLayer;
}
