import { CompositeLayer } from '@deck.gl/core';
import { SolidPolygonLayer, TextLayer } from '@deck.gl/layers';
import type { CompositeLayerProps } from '@deck.gl/core/lib/composite-layer';
import pMap from 'p-map';

import { XRLayer, ZarrPixelSource, ColorPaletteExtension } from '@hms-dbmi/viv';
import type { BaseLayerProps } from './state';

export interface GridLoader {
  loader: ZarrPixelSource<string[]>;
  row: number;
  col: number;
  name: string;
}

export interface GridLayerProps
  extends Omit<CompositeLayerProps<any>, 'modelMatrix' | 'opacity' | 'onClick' | 'id'>,
    BaseLayerProps {
  loaders: GridLoader[];
  rows: number;
  columns: number;
  spacer?: number;
  text?: boolean;
  concurrency?: number;
}

const defaultProps = {
  ...(XRLayer as any).defaultProps,
  // Special grid props
  loaders: { type: 'array', value: [], compare: true },
  spacer: { type: 'number', value: 5, compare: true },
  rows: { type: 'number', value: 0, compare: true },
  columns: { type: 'number', value: 0, compare: true },
  concurrency: { type: 'number', value: 10, compare: false }, // set concurrency for queue
  text: { type: 'boolean', value: false, compare: true },
  // Deck.gl
  onClick: { type: 'function', value: null, compare: true },
  onHover: { type: 'function', value: null, compare: true },
};

function scaleBounds(width: number, height: number, translate = [0, 0], scale = 1) {
  const [left, top] = translate;
  const right = width * scale + left;
  const bottom = height * scale + top;
  return [left, bottom, right, top];
}

function validateWidthHeight(d: { data: { width: number; height: number } }[]) {
  const [first] = d;
  // Return early if no grid data. Maybe throw an error?
  const { width, height } = first.data;
  // Verify that all grid data is same shape (ignoring undefined)
  d.forEach(({ data }) => {
    if (data?.width !== width || data?.height !== height) {
      throw new Error('Grid data is not same shape.');
    }
  });
  return { width, height };
}

function refreshGridData(props: GridLayerProps) {
  const { loaders, selections = [] } = props;
  let { concurrency } = props;
  if (concurrency && selections.length > 0) {
    // There are `loaderSelection.length` requests per loader. This block scales
    // the provided concurrency to map to the number of actual requests.
    concurrency = Math.ceil(concurrency / selections.length);
  }
  const mapper = async (d: GridLoader) => {
    const promises = selections.map((selection) => d.loader.getRaster({ selection }));
    const tiles = await Promise.all(promises);
    return {
      ...d,
      data: {
        data: tiles.map((d) => d.data),
        width: tiles[0].width,
        height: tiles[0].height,
      },
    };
  };
  return pMap(loaders, mapper, { concurrency });
}

export default class GridLayer<P extends GridLayerProps = GridLayerProps> extends CompositeLayer<any, P> {
  initializeState() {
    this.state = { gridData: [], width: 0, height: 0 };
    refreshGridData(this.props).then((gridData) => {
      const { width, height } = validateWidthHeight(gridData);
      this.setState({ gridData, width, height });
    });
  }

  updateState({ props, oldProps, changeFlags }: { props: GridLayerProps; oldProps: GridLayerProps; changeFlags: any }) {
    const { propsChanged } = changeFlags;
    const loaderChanged = typeof propsChanged === 'string' && propsChanged.includes('props.loaders');
    const loaderSelectionChanged = props.selections !== oldProps.selections;
    if (loaderChanged || loaderSelectionChanged) {
      // Only fetch new data to render if loader has changed
      refreshGridData(this.props).then((gridData) => {
        this.setState({ gridData });
      });
    }
  }

  getPickingInfo({ info }: { info: any }) {
    // provide Grid row and column info for mouse events (hover & click)
    if (!info.coordinate) {
      return info;
    }
    const spacer = this.props.spacer || 0;
    const { width, height } = this.state;
    const [x, y] = info.coordinate;
    const row = Math.floor(y / (height + spacer));
    const column = Math.floor(x / (width + spacer));
    info.gridCoord = { row, column }; // add custom property
    return info;
  }

  renderLayers() {
    const { gridData, width, height } = this.state;
    if (width === 0 || height === 0) return null; // early return if no data

    const { rows, columns, spacer = 0, id = '' } = this.props;
    const layers = gridData.map((d: any) => {
      const y = d.row * (height + spacer);
      const x = d.col * (width + spacer);
      const layerProps = {
        channelData: d.data, // coerce to null if no data
        bounds: scaleBounds(width, height, [x, y]),
        id: `${id}-GridLayer-${d.row}-${d.col}`,
        dtype: d.loader.dtype || 'Uint16', // fallback if missing,
        pickable: false,
        extensions: [new ColorPaletteExtension()],
      };
      return new (XRLayer as any)({ ...this.props, ...layerProps });
    });

    if (this.props.pickable) {
      const [top, left] = [0, 0];
      const bottom = rows * (height + spacer);
      const right = columns * (width + spacer);
      const polygon = [
        [left, top],
        [right, top],
        [right, bottom],
        [left, bottom],
      ];
      const layerProps = {
        data: [{ polygon }],
        getPolygon: (d: any) => d.polygon,
        getFillColor: [0, 0, 0, 0], // transparent
        getLineColor: [0, 0, 0, 0],
        pickable: true, // enable picking
        id: `${id}-GridLayer-picking`,
      } as any; // I was having an issue with typescript here....
      const pickableLayer = new SolidPolygonLayer({ ...this.props, ...layerProps });
      layers.push(pickableLayer);
    }

    if (this.props.text) {
      const textLayer = new TextLayer({
        id: `${id}-GridLayer-text`,
        data: gridData,
        getPosition: (d: any) => [d.col * (width + spacer), d.row * (height + spacer)],
        getText: (d: any) => d.name,
        getColor: [255, 255, 255, 255],
        getSize: 16,
        getAngle: 0,
        getTextAnchor: 'start',
        getAlignmentBaseline: 'top',
      });
      layers.push(textLayer);
    }

    return layers;
  }
}

GridLayer.layerName = 'GridLayer';
GridLayer.defaultProps = defaultProps;
