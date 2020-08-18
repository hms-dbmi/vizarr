import { openArray, ZarrArray, HTTPStore } from 'zarr';
import { ZarrLoader, ImageLayer, MultiscaleImageLayer, DTYPE_VALUES } from 'viv';
import type { RootAttrs, OmeroImageData } from './types/rootAttrs';
import type { SourceData, ImageLayerConfig, LayerState, SingleChannelConfig, MultichannelConfig } from './state';

import { getJson, MAX_CHANNELS, COLORS, MAGENTA_GREEN, RGB, CYMRGB, normalizeStore, hexToRGB, range } from './utils';

function loadSingleChannel(config: SingleChannelConfig, loader: ZarrLoader, max: number): SourceData {
  const { color, contrast_limits, visibility, name, colormap = '', opacity = 1 } = config;
  return {
    loader,
    name,
    channel_axis: null,
    colors: [color ?? COLORS.white],
    names: ['channel_0'],
    contrast_limits: [contrast_limits ?? [0, max]],
    visibilities: [visibility ?? true],
    defaults: {
      selection: Array(loader.base.shape.length).fill(0),
      colormap,
      opacity,
    },
  };
}

function loadMultiChannel(config: MultichannelConfig, loader: ZarrLoader, max: number): SourceData {
  const { names, channel_axis, name, opacity = 1, colormap = '' } = config;
  let { contrast_limits, visibilities, colors } = config;
  const { base } = loader;

  const n = base.shape[channel_axis as number];
  for (const channelProp of [contrast_limits, visibilities, names, colors]) {
    if (channelProp && channelProp.length !== n) {
      const propertyName = Object.keys({ channelProp })[0];
      throw Error(`channel_axis is length ${n} and provided channel_axis property ${propertyName} is different size.`);
    }
  }

  if (!visibilities) {
    if (n <= MAX_CHANNELS) {
      // Default to all on if visibilities not specified and less than 6 channels.
      visibilities = Array(n).fill(true);
    } else {
      // If more than MAX_CHANNELS, only make first set on by default.
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
      // Default color for non-visible is white
      colors = Array(n).fill(COLORS.white);
      // Get visible indices
      const visibleIndices = visibilities.flatMap((bool, i) => (bool ? i : []));
      // Set visible indices to CYMRGB colors. visibleIndices.length === MAX_CHANNELS from above.
      for (const [i, visibleIndex] of visibleIndices.entries()) {
        colors[visibleIndex] = CYMRGB[i];
      }
    }
  }
  return {
    loader,
    name,
    channel_axis: channel_axis as number,
    colors,
    names: names ?? range(n).map((i) => `channel_${i}`),
    contrast_limits: contrast_limits ?? Array(n).fill([0, max]),
    visibilities,
    defaults: {
      selection: Array(loader.base.shape.length).fill(0),
      colormap,
      opacity,
    },
  };
}

function loadOME(config: ImageLayerConfig, imageData: OmeroImageData, loader: ZarrLoader): SourceData {
  const { name, opacity = 1, colormap = '' } = config;
  const { rdefs, channels } = imageData;
  const t = rdefs.defaultT ?? 0;
  const z = rdefs.defaultZ ?? 0;

  const colors: string[] = [];
  const contrast_limits: number[][] = [];
  const visibilities: boolean[] = [];
  const names: string[] = [];

  channels.forEach((c) => {
    colors.push(c.color);
    contrast_limits.push([c.window.start, c.window.end]);
    visibilities.push(c.active);
    names.push(c.label);
  });

  return {
    loader,
    name: imageData.name ?? name,
    channel_axis: 1,
    colors,
    names,
    contrast_limits,
    visibilities,
    defaults: {
      selection: [t, 0, z, 0, 0],
      colormap,
      opacity,
    },
  };
}

function createLoader(dataArr: ZarrArray[]) {
  // TODO: There should be a much better way to do this.
  // If base image is small, we don't need to fetch data for the
  // top levels of the pyramid. For large images, the tile sizes (chunks)
  // will be the same size for x/y. We check the chunksize here for this edge case.
  const base = dataArr[0];
  const { chunks, shape } = base;
  const [tileHeight, tileWidth] = chunks.slice(-2);
  // TODO: Need function to trim pyramidal levels that aren't chunked w/ even tile sizes.
  // Lowest resolution doesn't need to have square chunks, but all others do.
  const data = dataArr.length === 1 || tileHeight !== tileWidth ? base : dataArr;
  // need to make dimensions to use ZarrLoader, but not necessary
  const dimensions = [...range(shape.length - 2), 'y', 'x'].map((field) => ({ field }));
  return new ZarrLoader({ data, dimensions });
}

async function openRootGroup(store: HTTPStore): Promise<{ rootAttrs: RootAttrs; data: ZarrArray[] }> {
  let resolutions = ['0'];
  const rootAttrs = (await getJson(store, '.zattrs')) as RootAttrs;
  if ('multiscales' in rootAttrs) {
    const { datasets } = rootAttrs.multiscales[0];
    resolutions = datasets.map((d) => d.path);
  }
  const promises = resolutions.map((path) => openArray({ store, path }));
  const data = await Promise.all(promises);
  return { data, rootAttrs };
}

export async function createSourceData(config: ImageLayerConfig): Promise<SourceData> {
  const { source } = config;
  let data: ZarrArray[];
  let rootAttrs: RootAttrs | undefined;

  const store = normalizeStore(source);
  if (await store.containsItem('.zgroup')) {
    try {
      const res = await openRootGroup(store);
      data = res.data;
      rootAttrs = res.rootAttrs;
    } catch (err) {
      throw Error(`Failed to open arrays in zarr.Group. Make sure group implements multiscales extension.`);
    }
  } else {
    // Try to open as zarr.Array
    data = [await openArray({ store })];
  }

  const loader = createLoader(data);
  const { base, dtype } = loader;
  if (!(dtype in DTYPE_VALUES)) {
    throw Error('Dtype not supported, must be u1, u2, u4, or f4');
  }

  // If contrast_limits not provided or are missing from omero metadata.
  const max = dtype === '<f4' ? 1 : DTYPE_VALUES[dtype].max;
  // Now that we have data, try to figure out how to render initially.

  const nDims = base.shape.length;
  if (nDims === 2 || (config.channel_axis === undefined && !rootAttrs?.omero)) {
    return loadSingleChannel(config as SingleChannelConfig, loader, max);
  }

  // If explicit channel axis is provided, try to load as multichannel.
  if (Number.isInteger(config.channel_axis)) {
    return loadMultiChannel(config as MultichannelConfig, loader, max);
  }

  if (rootAttrs?.omero) {
    return loadOME(config, rootAttrs.omero, loader);
  }

  throw Error('Failed to load image.');
}

export function initLayerStateFromSource(sourceData: SourceData, layerId: string): LayerState {
  const { loader, channel_axis, colors, visibilities, contrast_limits, defaults } = sourceData;
  const { selection, opacity, colormap } = defaults;

  const Layer = loader.numLevels > 1 ? MultiscaleImageLayer : ImageLayer;
  const loaderSelection: number[][] = [];
  const colorValues: number[][] = [];
  const contrastLimits: number[][] = [];
  const channelIsOn: boolean[] = [];

  const visibleIndices = visibilities.flatMap((bool, i) => (bool ? i : []));
  for (const index of visibleIndices) {
    if (Number.isInteger(channel_axis)) {
      const channelSelection = [...selection];
      channelSelection[channel_axis as number] = index;
      loaderSelection.push(channelSelection);
    } else {
      loaderSelection.push(selection);
    }
    colorValues.push(hexToRGB(colors[index]));
    contrastLimits.push(contrast_limits[index]);
    channelIsOn.push(true);
  }
  // set initial slider values to contrast_limits
  const sliderValues = [...contrastLimits];
  return {
    Layer,
    layerProps: {
      id: layerId,
      loader,
      loaderSelection,
      colorValues,
      sliderValues,
      contrastLimits,
      channelIsOn,
      opacity,
      colormap,
    },
    on: true,
  };
}
