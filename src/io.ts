import { openArray, ZarrArray, HTTPStore } from 'zarr';
import { ZarrLoader, ImageLayer, MultiscaleImageLayer, DTYPE_VALUES } from 'viv';
import type { RootAttrs, OmeroImageData } from './types/rootAttrs';
import type { BaseConfig, Source2DConfig, SourceNdConfig, ImageLayerConfig, LayerState } from './state';

import { getJson, MAGENTA_GREEN, RGB, CYMRGB, normalizeStore, hexToRGB, range } from './utils';

function load2d(props: BaseConfig & Source2DConfig, layerId: string, loader: ZarrLoader, max: number): LayerState {
  const Layer = loader.numLevels === 1 ? ImageLayer : MultiscaleImageLayer;
  const { color, contrast_limits, visibility, label, name, colormap = '', opacity = 1 } = props;
  const sliderValues = [contrast_limits ?? [0, max]];
  return {
    Layer,
    layerProps: {
      id: layerId,
      loader,
      colormap,
      opacity,
      loaderSelection: [[0, 0]],
      colorValues: [color ? hexToRGB(color) : [255, 255, 255]],
      sliderValues,
      channelIsOn: [visibility ?? true],
    },
    metadata: {
      name: name ?? undefined,
      on: true,
      channel_axis: null,
      contrastLimits: sliderValues,
      labels: [label ?? 'channel_0'],
    },
  };
}

function loadNd(props: BaseConfig & SourceNdConfig, layerId: string, loader: ZarrLoader, max: number): LayerState {
  const Layer = loader.numLevels === 1 ? ImageLayer : MultiscaleImageLayer;
  const { contrast_limits, visibilities, labels, channel_axis, name, colors, opacity = 1, colormap = '' } = props;
  const { base } = loader;
  const n = base.shape[channel_axis];
  for (let k of [contrast_limits, visibilities, labels, colors]) {
    if (k && k.length !== n) {
      throw Error(`Channel axis is of length ${n} and rendering metadata is different size.`);
    }
  }
  const loaderSelection = range(n).map((i) => {
    const sel = Array(loader.base.shape.length).fill(0);
    sel[channel_axis] = i;
    return sel;
  });

  let colorValues;
  if (colors) {
    colorValues = colors.map(hexToRGB);
  } else if (n === 2) {
    colorValues = MAGENTA_GREEN;
  } else if (n === 3) {
    colorValues = RGB;
  } else {
    colorValues = CYMRGB.slice(0, n);
  }

  const sliderValues = contrast_limits ?? Array(n).fill([0, max]);
  return {
    Layer,
    layerProps: {
      id: layerId,
      loader,
      colormap,
      opacity,
      loaderSelection,
      colorValues,
      sliderValues,
      channelIsOn: visibilities ?? Array(n).fill(true),
    },
    metadata: {
      name: name ?? undefined,
      on: true,
      channel_axis,
      contrastLimits: sliderValues,
      labels: labels ?? range(n).map((i) => `channel_${i}`),
    },
  };
}

function loadOME(config: BaseConfig, layerId: string, imageData: OmeroImageData, loader: ZarrLoader): LayerState {
  const Layer = loader.numLevels === 1 ? ImageLayer : MultiscaleImageLayer;
  const { name, opacity = 1, colormap = '' } = config;
  const { rdefs, channels } = imageData;
  const t = rdefs.defaultT ?? 0;
  const z = rdefs.defaultZ ?? 0;
  const nChannels = channels.length;
  const loaderSelection = range(nChannels).map((c) => [t, c, z, 0, 0]);

  const colorValues: number[][] = [];
  const sliderValues: number[][] = [];
  const channelIsOn: boolean[] = [];
  const labels: string[] = [];

  channels.forEach((c) => {
    colorValues.push(hexToRGB(c.color));
    sliderValues.push([c.window.start, c.window.end]);
    channelIsOn.push(c.active);
    labels.push(c.label);
  });

  return {
    Layer,
    layerProps: {
      id: layerId,
      loader,
      colormap,
      opacity,
      loaderSelection,
      colorValues,
      sliderValues,
      channelIsOn,
    },
    metadata: {
      name: name ?? imageData.name ?? undefined,
      on: true,
      channel_axis: 1,
      contrastLimits: sliderValues,
      labels,
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

export async function loadImageConfig(config: ImageLayerConfig, layerId: string): Promise<LayerState> {
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
  if (nDims === 2) {
    return load2d(config as BaseConfig & Source2DConfig, layerId, loader, max);
  }

  // If explicit channel axis is provided, other metadata is necessary.
  if (Number.isInteger((config as BaseConfig & SourceNdConfig).channel_axis)) {
    return loadNd(config as BaseConfig & SourceNdConfig, layerId, loader, max);
  }

  if (rootAttrs?.omero) {
    return loadOME(config, layerId, rootAttrs.omero, loader);
  }

  throw Error('Failed to load image.');
}
