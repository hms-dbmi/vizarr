import { ImageLayer, MultiscaleImageLayer, ZarrPixelSource } from '@hms-dbmi/viv';
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
  getNgffAxes,
  getNgffAxisLabels,
  guessTileSize,
  hexToRGB,
  loadMultiscales,
  open,
  parseMatrix,
  range,
  calcDataRange,
  calcConstrastLimits,
} from './utils';

async function loadSingleChannel(config: SingleChannelConfig, data: ZarrPixelSource<string[]>[]): Promise<SourceData> {
  const { color, contrast_limits, visibility, name, colormap = '', opacity = 1 } = config;
  const limits = contrast_limits ?? (await (() => calcDataRange(data[data.length - 1], [0, 0, 0]))());
  return {
    loader: data,
    name,
    channel_axis: null,
    colors: [color ?? COLORS.white],
    names: ['channel_0'],
    contrast_limits: [limits],
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

async function loadMultiChannel(
  config: MultichannelConfig,
  data: ZarrPixelSource<string[]>[],
  channelAxis: number
): Promise<SourceData> {
  const { names, contrast_limits, name, model_matrix, opacity = 1, colormap = '' } = config;
  let { visibilities, colors } = config;
  const n = data[0].shape[channelAxis];
  for (const channelProp of [contrast_limits, visibilities, names, colors]) {
    if (channelProp && channelProp.length !== n) {
      const propertyName = Object.keys({ channelProp })[0];
      throw Error(`channel_axis is length ${n} and provided channel_axis property ${propertyName} is different size.`);
    }
  }

  visibilities = visibilities || getDefaultVisibilities(n);
  colors = colors || getDefaultColors(n, visibilities);

  const contrastLimits =
    contrast_limits ?? (await (() => calcConstrastLimits(data[data.length - 1], channelAxis, visibilities))());

  return {
    loader: data,
    name,
    channel_axis: channelAxis,
    colors,
    names: names ?? range(n).map((i) => `channel_${i}`),
    contrast_limits: contrastLimits,
    visibilities,
    model_matrix: parseMatrix(model_matrix),
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
  let axes: Ome.Axis[] | undefined;

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
    if (attrs.multiscales[0].axes) {
      axes = getNgffAxes(attrs.multiscales);
    }
  } else {
    data = [node];
  }

  // explicit override in config > ngff > guessed from data shape
  const { channel_axis, labels } = getAxisLabelsAndChannelAxis(config, axes, data[0]);

  const tileSize = guessTileSize(data[0]);
  const loader = data.map((d) => new ZarrPixelSource(d, labels, tileSize));
  const [base] = loader;

  // If explicit channel axis is provided, try to load as multichannel.
  if ('channel_axis' in config || channel_axis > -1) {
    config = config as MultichannelConfig;
    return loadMultiChannel(config, loader, Number(config.channel_axis ?? channel_axis));
  }

  const nDims = base.shape.length;
  if (nDims === 2 || !('channel_axis' in config)) {
    return loadSingleChannel(config as SingleChannelConfig, loader);
  }

  throw Error('Failed to load image.');
}

type Labels = [...string[], 'y', 'x'];
function getAxisLabelsAndChannelAxis(
  config: ImageLayerConfig,
  ngffAxes: Ome.Axis[] | undefined,
  arr: ZarrArray
): { labels: Labels; channel_axis: number } {
  // type cast string[] to Labels
  const maybeAxisLabels = config.axis_labels as undefined | Labels;
  // ensure numeric if provided
  const maybeChannelAxis = 'channel_axis' in config ? Number(config.channel_axis) : undefined;

  // Use ngff axes metadata if labels or channel axis aren't explicitly provided
  if (ngffAxes) {
    const labels = maybeAxisLabels ?? getNgffAxisLabels(ngffAxes);
    const channel_axis = maybeChannelAxis ?? ngffAxes.findIndex((axis) => axis.type === 'channel');
    return { labels, channel_axis };
  }

  // create dummy axis labels if not provided and try to guess channel_axis if missing
  const labels = maybeAxisLabels ?? getAxisLabels(arr);
  const channel_axis = maybeChannelAxis ?? labels.indexOf('c');
  return { labels, channel_axis };
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
    const channelSelection = [...selection];
    if (Number.isInteger(channel_axis)) {
      channelSelection[channel_axis as number] = index;
    }
    loaderSelection.push(channelSelection);
    colorValues.push(hexToRGB(colors[index]));
    // TODO: should never be undefined
    contrastLimits.push(contrast_limits[index] ?? [0, 255]);
    channelIsOn.push(true);
  }
  // set initial slider values to contrast_limits
  const sliderValues = [...contrastLimits];

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
