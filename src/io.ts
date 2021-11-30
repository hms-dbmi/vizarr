import { DTYPE_VALUES, ImageLayer, MultiscaleImageLayer, ZarrPixelSource } from '@hms-dbmi/viv';
import { Group as ZarrGroup, openGroup, ZarrArray } from 'zarr';
import GridLayer from './gridLayer';
import { loadOmeroMultiscales, loadPlate, loadWell } from './ome';
import type {
  ImageLayerConfig,
  LayerState,
  MultichannelConfig,
  SingleChannelConfig,
  SourceData,
  LayerCtr,
} from './state';
import {
  COLORS,
  getDefaultColors,
  getDefaultVisibilities,
  getAxisLabels,
  guessTileSize,
  hexToRGB,
  loadMultiscales,
  open,
  parseMatrix,
  range,
} from './utils';

function loadSingleChannel(config: SingleChannelConfig, data: ZarrPixelSource<string[]>[], max: number): SourceData {
  const { color, contrast_limits, visibility, name, colormap = '', opacity = 1 } = config;
  return {
    loader: data,
    name,
    channel_axis: null,
    colors: [color ?? COLORS.white],
    names: ['channel_0'],
    contrast_limits: [contrast_limits ?? [0, max]],
    visibilities: [visibility ?? true],
    model_matrix: parseMatrix(config.model_matrix),
    defaults: {
      selection: Array(data[0].shape.length).fill(0),
      colormap,
      opacity,
    },
    axis_labels: data[0].labels,
  };
}

function loadMultiChannel(config: MultichannelConfig, data: ZarrPixelSource<string[]>[], max: number): SourceData {
  const { names, channel_axis, name, model_matrix, opacity = 1, colormap = '' } = config;
  let { contrast_limits, visibilities, colors } = config;
  const n = data[0].shape[channel_axis as number];
  for (const channelProp of [contrast_limits, visibilities, names, colors]) {
    if (channelProp && channelProp.length !== n) {
      const propertyName = Object.keys({ channelProp })[0];
      throw Error(`channel_axis is length ${n} and provided channel_axis property ${propertyName} is different size.`);
    }
  }

  visibilities = visibilities || getDefaultVisibilities(n);
  colors = colors || getDefaultColors(n, visibilities);

  return {
    loader: data,
    name,
    channel_axis: Number(channel_axis as number),
    colors,
    names: names ?? range(n).map((i) => `channel_${i}`),
    contrast_limits: contrast_limits ?? Array(n).fill([0, max]),
    visibilities,
    model_matrix: parseMatrix(config.model_matrix),
    defaults: {
      selection: Array(data[0].shape.length).fill(0),
      colormap,
      opacity,
    },
    axis_labels: data[0].labels,
  };
}

export async function createSourceData(config: ImageLayerConfig): Promise<SourceData> {
  const node = await open(config.source);
  let data: ZarrArray[];

  if (node instanceof ZarrGroup) {
    const attrs = (await node.attrs.asObject()) as Ome.Attrs;

    if ('plate' in attrs) {
      return loadPlate(config, node, attrs.plate);
    }

    if ('well' in attrs) {
      return loadWell(config, node, attrs.well);
    }

    if ('omero' in attrs) {
      return loadOmeroMultiscales(config, node, attrs);
    }

    if (Object.keys(attrs).length === 0 && node.path) {
      // No rootAttrs in this group.
      // if url is to a plate/acquisition/ check parent dir for 'plate' zattrs
      const parentPath = node.path.slice(0, node.path.lastIndexOf('/'));
      const parent = await openGroup(node.store, parentPath);
      const parentAttrs = (await parent.attrs.asObject()) as Ome.Attrs;
      if ('plate' in parentAttrs) {
        return loadPlate(config, parent, parentAttrs.plate);
      }
    }

    if (!('multiscales' in attrs)) {
      throw Error('Group is missing multiscales specification.');
    }

    data = await loadMultiscales(node, attrs.multiscales);
    if (!config.axis_labels) {
      // Update config axis_labels if present in multiscales
      config.axis_labels = attrs.multiscales[0].axes;
    }
  } else {
    data = [node];
  }

  const labels = getAxisLabels(data[0], config.axis_labels);
  const tileSize = guessTileSize(data[0]);
  const loader = data.map((d) => new ZarrPixelSource(d, labels, tileSize));
  const [base] = loader;

  // If contrast_limits not provided or are missing from omero metadata.
  const max = base.dtype === 'Float32' ? 1 : DTYPE_VALUES[base.dtype].max;
  // Now that we have data, try to figure out how to render initially.

  // If explicit channel axis is provided, try to load as multichannel.
  if ('channel_axis' in config || labels.includes('c')) {
    config = config as MultichannelConfig;
    config.channel_axis = config.channel_axis ?? labels.indexOf('c');
    return loadMultiChannel(config, loader, max);
  }

  const nDims = base.shape.length;
  if (nDims === 2 || !('channel_axis' in config)) {
    return loadSingleChannel(config as SingleChannelConfig, loader, max);
  }

  throw Error('Failed to load image.');
}

export function initLayerStateFromSource(sourceData: SourceData): LayerState {
  const {
    loader,
    channel_axis,
    colors,
    visibilities,
    contrast_limits,
    model_matrix,
    defaults,
    // Grid
    loaders,
    rows,
    columns,
    onClick,
  } = sourceData;
  const { selection, opacity, colormap } = defaults;

  const Layer = getLayer(sourceData);
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

  if (!(loader[0].dtype in DTYPE_VALUES)) {
    throw Error(`Dtype not supported, must be ${JSON.stringify(Object.keys(DTYPE_VALUES))}`);
  }

  return {
    Layer,
    layerProps: {
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
      onClick,
    },
    on: true,
  };
}

function getLayer(sourceData: SourceData): LayerCtr<typeof ImageLayer | typeof MultiscaleImageLayer | GridLayer> {
  return sourceData.loaders ? GridLayer : sourceData.loader.length > 1 ? MultiscaleImageLayer : ImageLayer;
}
