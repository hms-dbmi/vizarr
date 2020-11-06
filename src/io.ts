import { openArray, ZarrArray, HTTPStore } from 'zarr';
import { ZarrLoader, ImageLayer, MultiscaleImageLayer, DTYPE_VALUES } from 'viv';
import pMap from 'p-map';

import type { RootAttrs, OmeroImageData, OmeWellData, OmePlateData } from './types/rootAttrs';
import type { SourceData, ImageLayerConfig, LayerState, SingleChannelConfig, MultichannelConfig } from './state';

import { getJson, MAX_CHANNELS, COLORS, MAGENTA_GREEN, RGB, CYMRGB, normalizeStore, hexToRGB, range } from './utils';
import GridLayer from './gridLayer';

function getAxisLabels(config: SingleChannelConfig | MultichannelConfig, loader: ZarrLoader): string[] {
  let { axis_labels } = config;
  if (!axis_labels || axis_labels.length != loader.base.shape.length) {
    // default axis_labels are e.g. ['0', '1', 'y', 'x']
    const nonXYaxisLabels = loader.base.shape.slice(0, -2).map((d, i) => "" + i);
    axis_labels = nonXYaxisLabels.concat(['y', 'x']);
  }
  return axis_labels;
}

function loadSingleChannel(config: SingleChannelConfig, loader: ZarrLoader, max: number): SourceData {
  const { color, contrast_limits, visibility, name, colormap = '', opacity = 1, translate } = config;
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
    axis_labels: getAxisLabels(config, loader),
    translate: translate ?? [0, 0],
  };
}

function loadMultiChannel(config: MultichannelConfig, loader: ZarrLoader, max: number): SourceData {
  const { names, channel_axis, name, opacity = 1, colormap = '', translate } = config;
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
  let axis_labels = getAxisLabels(config, loader);
  axis_labels[channel_axis as number] = 'c';
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
    axis_labels: axis_labels,
    translate: translate ?? [0, 0],
  };
}

// Create loader for every Well. Some loaders may be undefined if Wells are missing.
async function createLoaderFromPath(store: HTTPStore, path: string): Promise<ZarrLoader | undefined> {
  try {
    const data = await openArray({ store, path });
    let l = createLoader([data]);
    return l;
  } catch (err) {
    console.log(`Missing Well at ${path}`);
  }
}

async function loadOMEWell(config: ImageLayerConfig, store: HTTPStore, rootAttrs: RootAttrs): Promise<SourceData> {
  const wellAttrs = rootAttrs.well as OmeWellData;
  if (!wellAttrs.images) {
    throw Error(`Well .zattrs missing images`);
  }
  const [row, col] = store.url.split('/').filter(Boolean).slice(-2);

  const imagePaths = wellAttrs.images.map(img => img.path + (img.path.endsWith('/') ? '' : '/'));
  // Use first image for rendering settings, resolutions etc.
  let imageAttrs = await getJson(store, `${imagePaths[0]}.zattrs`)
  // Lowest resolution is the 'path' of the first 'dataset' from the first multiscales
  let resolution = imageAttrs.multiscales[0].datasets[0].path;

  // Create loader for every Image.
  const promises = imagePaths.map(p => createLoaderFromPath(store, `${p}${resolution}/`));
  let loaders = await Promise.all(promises);
  const loader = loaders.find(Boolean);

  // Load Image to use for channel names, rendering settings, sizeZ, sizeT etc.
  const sourceData: SourceData = loadOME(config, imageAttrs.omero, loader as ZarrLoader);
  const cols = Math.ceil(Math.sqrt(imagePaths.length));

  sourceData.loaders = loaders;
  sourceData.name = `Well ${row}${col}`;
  sourceData.rows = Math.ceil(imagePaths.length/cols);
  sourceData.columns = cols;
  sourceData.onClick = (info: any) => {
    let layerId = info.sourceLayer.id as string;
    // Get the info we need from the layerId
    const [row, col] = layerId.split('-GridLayer-')[1].split('-').map((x: string) => parseInt(x));
    let { source } = sourceData;
    if (typeof source === 'string' && !isNaN(row) && !isNaN(col)) {
      const field = (row * cols) + col;
      if (source.endsWith('/')) {
        source = source.slice(0, -1);
      }
      let imgSource = `${source}/${imagePaths[field]}`;
      window.open(window.location.origin + '?source=' + imgSource);
    }
  }

  return sourceData;
}

async function loadOMEPlate(config: ImageLayerConfig, store: HTTPStore, rootAttrs: RootAttrs): Promise<SourceData> {
  const plateAttrs = rootAttrs.plate as OmePlateData;
  if (!('columns' in plateAttrs) || !('rows' in plateAttrs)) {
    throw Error(`Plate .zattrs missing columns or rows`);
  }

  let rows: number = plateAttrs.rows.length;
  let columns: number = plateAttrs.columns.length;
  let rowNames: string[] = plateAttrs.rows.map(row => row.name);
  let columnNames: string[] = plateAttrs.columns.map(col => col.name);
  let wellPaths = plateAttrs.wells.map(well => well.path);

  let acquisitions = ['0'];
  if (plateAttrs?.acquisitions) {
    acquisitions = plateAttrs.acquisitions.map(pa => pa.path);
  }

  let acquisition = acquisitions[0];
  // Fields are by index and we assume at least 1 per Well
  let field = '0';

  // imagePaths covers whole plate (not sparse) - but some will be '' if no Well
  const imagePaths = rowNames.flatMap(row => {
    return columnNames.map(col => {
      let wellPath = `${acquisition}/${row}/${col}/`;
      return wellPaths.includes(wellPath) ? `${wellPath}${field}/` : '';
    });
  })

  // Find first valid Image, loading each Well in turn...
  let imageAttrs = undefined;
  async function getImageAttrs(path: string): Promise<any> {
    if (path === '') return
    try {
      return await getJson(store, `${path}.zattrs`);
    } catch (err) {
    }
  }
  for (let i = 0; i < imagePaths.length; i++) {
    imageAttrs = await getImageAttrs(imagePaths[i]);
    if (imageAttrs) {
      break;
    }
  }

  // Lowest resolution is the 'path' of the last 'dataset' from the first multiscales
  let resolution = imageAttrs.multiscales[0].datasets.slice(-1)[0].path;

  // Create loader for every Well. Some loaders may be undefined if Wells are missing.
  async function createLoaderFromPath(path: string): Promise<ZarrLoader | undefined> {
    try {
      const data = await openArray({ store, path: `${path}${resolution}/` });
      let l = createLoader([data]);
      return l;
    } catch (err) {
      console.log(`Missing Well at ${path}`);
    }
  }
  const promises = await pMap(imagePaths, createLoaderFromPath, { concurrency: 10 });
  let loaders = await Promise.all(promises);

  const loader = loaders.find(Boolean);

  // Load Image to use for channel names, rendering settings, sizeZ, sizeT etc.
  const sourceData: SourceData = loadOME(config, imageAttrs.omero, loader as ZarrLoader);

  sourceData.loaders = loaders;
  sourceData.name = plateAttrs.name || "Plate";
  sourceData.rows = rows;
  sourceData.columns = columns;
  // Us onClick from image config or Open Well in new window
  sourceData.onClick = config.onClick || ((info: any) => {
    let layerId = info.sourceLayer.id as string;
    // Shouldn't need this check now?
    if (!layerId.includes('-GridLayer-')){
      return;
    }
    // Get the info we need from the layerId
    const [row, col] = layerId.split('-GridLayer-')[1].split('-').map((x: string) => parseInt(x));
    let { source } = sourceData;
    if (typeof source === 'string' && !isNaN(row) && !isNaN(col) && acquisitions) {
      if (source.endsWith('/')){
        source = source.slice(0, -1);
      }
      let imgSource = `${source}/${acquisitions[0]}/${rowNames[row]}/${columnNames[col]}/`;
      window.open(window.location.origin + '?source=' + imgSource);
    }
  })
  return sourceData;
}

function loadOME(config: ImageLayerConfig, imageData: OmeroImageData, loader: ZarrLoader): SourceData {
  const { name, opacity = 1, colormap = '', translate, source } = config;
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
    source,
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
    axis_labels: ["t", "c", "z", "y", "x"],
    translate: translate ?? [0, 0],
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

async function openMultiResolutionData(store: HTTPStore, rootAttrs: RootAttrs): Promise<ZarrArray[]> {
  let resolutions = ['0'];
  if ('multiscales' in rootAttrs) {
    const { datasets } = rootAttrs.multiscales[0];
    resolutions = datasets.map((d) => d.path);
  }
  const promises = resolutions.map((path) => openArray({ store, path }));
  const data = await Promise.all(promises);
  return data;
}

export async function createSourceData(config: ImageLayerConfig): Promise<SourceData> {
  const { source } = config;
  let data: ZarrArray[];
  let rootAttrs: RootAttrs | undefined;

  const store = normalizeStore(source);
  if (await store.containsItem('.zgroup')) {
    try {
      rootAttrs = (await getJson(store, '.zattrs'));
      if (rootAttrs?.plate) {
        return loadOMEPlate(config, store, rootAttrs as RootAttrs);
      } else if (rootAttrs?.well) {
        return loadOMEWell(config, store, rootAttrs as RootAttrs);
      }
      data = await openMultiResolutionData(store, rootAttrs as RootAttrs);
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
  const {
    loader,
    source,
    channel_axis,
    colors,
    visibilities,
    contrast_limits,
    defaults,
    // Grid
    loaders,
    rows,
    columns,
    onClick,
  } = sourceData;
  const { selection, opacity, colormap } = defaults;

  const Layer = loaders ? GridLayer : loader.numLevels > 1 ? MultiscaleImageLayer : ImageLayer;
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
      loaders,
      source,
      loaderSelection,
      colorValues,
      sliderValues,
      contrastLimits,
      channelIsOn,
      opacity,
      colormap,
      rows,
      columns,
      onClick,
    },
    on: true,
  };
}
