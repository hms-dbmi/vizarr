import { ImageLayer, MultiscaleImageLayer, ZarrPixelSource } from '@hms-dbmi/viv';
import * as zarr from '@zarrita/core';
import type { Readable } from '@zarrita/storage';
import GridLayer from './gridLayer';
import { loadOmeroMultiscales, loadPlate, loadWell } from './ome';
import type { ImageLayerConfig, LayerState, MultichannelConfig, SingleChannelConfig, SourceData } from './state';
import {
  COLORS,
  MAX_CHANNELS,
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
  createZarrArrayAdapter,
} from './utils';

async function loadSingleChannel(config: SingleChannelConfig, data: ZarrPixelSource<string[]>[]): Promise<SourceData> {
  const { color, contrast_limits, visibility, name, colormap = '', opacity = 1 } = config;
  const lowres = data[data.length - 1];
  const selection = Array(data[0].shape.length).fill(0);
  const limits = contrast_limits ?? (await (() => calcDataRange(lowres, selection))());
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
      selection,
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

function isOmePlate(attrs: zarr.Attributes): attrs is { plate: Ome.Plate } {
  return "plate" in attrs;
}

function isOmeWell(attrs: zarr.Attributes): attrs is { well: Ome.Well } {
  return "well" in attrs;
}

function isOmeroMultiscales(attrs: zarr.Attributes): attrs is { omero: Ome.Omero; multiscales: Ome.Multiscale[] } {
  return "omero" in attrs && "multiscales" in attrs;
}

function isMultiscales(attrs: zarr.Attributes): attrs is { multiscales: Ome.Multiscale[] } {
  return "multiscales" in attrs;
}

export async function createSourceData(config: ImageLayerConfig): Promise<SourceData> {
  const node = await open(config.source);
  let data: zarr.Array<zarr.DataType, Readable>[];
  let axes: Ome.Axis[] | undefined;

  if (node instanceof zarr.Group) {
    const attrs = node.attrs;

    if (isOmePlate(attrs)) {
      return loadPlate(config, node, attrs.plate);
    }

    if (isOmeWell(attrs)) {
      return loadWell(config, node, attrs.well as Ome.Well);
    }

    if (isOmeroMultiscales(attrs)) {
      return loadOmeroMultiscales(config, node, attrs as {
        omero: Ome.Omero;
        multiscales: Ome.Multiscale[];
      });
    }

    if (Object.keys(attrs).length === 0 && node.path) {
      // No rootAttrs in this group.
      const parent = await zarr.open(node.resolve('..'), { kind: 'group' });
      if ('plate' in parent.attrs) {
        return loadPlate(config, parent, parent.attrs.plate as Ome.Plate);
      }
    }

    if (!isMultiscales(attrs)) {
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
  const loader = data.map((d) => new ZarrPixelSource(createZarrArrayAdapter(d), labels, tileSize));
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
  arr: zarr.Array<zarr.DataType, Readable> 
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

export function initLayerStateFromSource(source: SourceData & { id: string }): LayerState {
  const { selection, opacity, colormap } = source.defaults;

  const selections: number[][] = [];
  const colors: [number, number, number][] = [];
  const contrastLimits: [start: number, end: number][] = [];
  const channelsVisible: boolean[] = [];

  const visibleIndices = source.visibilities.flatMap((bool, i) => (bool ? i : []));
  // Limit the number of initial channels to the max allowed
  for (const index of visibleIndices.slice(0, MAX_CHANNELS)) {
    const channelSelection = [...selection];
    if (Number.isInteger(source.channel_axis)) {
      channelSelection[source.channel_axis as number] = index;
    }
    selections.push(channelSelection);
    colors.push(hexToRGB(source.colors[index]));
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
  };

  if ('loaders' in source) {
    return {
      Layer: GridLayer,
      layerProps: {
        ...layerProps,
        loader: source.loader,
        loaders: source.loaders,
        columns: source.columns as number,
        rows: source.rows as number,
      },
      on: true,
    };
  }

  if (source.loader.length === 1) {
    return {
      Layer: ImageLayer,
      layerProps: {
        ...layerProps,
        loader: source.loader[0],
      },
      on: true,
    };
  }

  return {
    Layer: MultiscaleImageLayer,
    layerProps: {
      ...layerProps,
      loader: source.loader,
    },
    on: true,
  };
}
