import { CompositeLayer, COORDINATE_SYSTEM } from '@deck.gl/core';
import { SolidPolygonLayer } from '@deck.gl/layers';
import type { CompositeLayerProps } from '@deck.gl/core/lib/composite-layer';
import pMap from 'p-map';

import { TypedArray, XRLayer } from 'viv';
import type { ZarrLoader, SelectionData, RasterSelection } from 'viv';
import { range } from './utils';

// @ts-ignore
import { padTileWithZeros } from '@hms-dbmi/viv/src/loaders/utils';

export interface GridLayerProps<D> extends CompositeLayerProps<D> {
  loaders: ZarrLoader[];
  spacer?: number;
  rows: number;
  columns: number;
  sliderValues: number[][];
  channelIsOn: boolean[];
  colorValues: number[][];
  loaderSelection: number[][];
  colormap: string;
  z: number;
  concurrency?: number;
}

const defaultProps = {
  // VivProps
  sliderValues: { type: 'array', value: [], compare: true },
  channelIsOn: { type: 'array', value: [], compare: true },
  colorValues: { type: 'array', value: [], compare: true },
  loaderSelection: { type: 'array', value: [], compare: true },
  colormap: { type: 'string', value: '', compare: true },
  domain: { type: 'array', value: [], compare: true },
  viewportId: { type: 'string', value: '', compare: true },
  z: { type: 'number', value: 0, compare: true },
  // Special grid props
  loaders: { type: 'array', value: [], compare: true },
  spacer: { type: 'number', value: 5, compare: true },
  rows: { type: 'number', value: 0, compare: true },
  columns: { type: 'number', value: 0, compare: true },
  concurrency: { type: 'number', value: 10, compare: false }, // set concurrency for queue
  // Defaults XRL expects for "lens" (not used in vizarr)
  isLensOn: { type: 'boolean', value: false, compare: true },
  lensSelection: { type: 'number', value: 0, compare: true },
  lensRadius: { type: 'number', value: 100, compare: true },
  lensBorderColor: { type: 'array', value: [255, 255, 255], compare: true },
  lensBorderRadius: { type: 'number', value: 0.02, compare: true }, 
  // Deck.gl
  pickable: true,
  onClick: { type: 'function', value: null, compare: true },
  onHover: { type: 'function', value: null, compare: true },
  coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
};

function scaleBounds(width: number, height: number, translate = [0, 0], scale = 1) {
  const [left, top] = translate;
  const right = width * scale + left;
  const bottom = height * scale + top;
  return [left, bottom, right, top];
}

function validateWidthHeight(gridData: (SelectionData | undefined)[]): { width: number, height: number } {
  const first = gridData.find(Boolean);
  // Return early if no grid data. Maybe throw an error?
  if (!first) return { width: 0 , height: 0 }
  const { width, height } = first;
  // Verify that all grid data is same shape (ignoring undefined)
  gridData.forEach(d => {
    if (d && (d?.width !== width || d?.height !== height)) {
      throw new Error("Grid data is not same shape.");
    }
  });
  return { width, height };
}

function refreshGridData(props: { loaders: (ZarrLoader | undefined)[], concurrency?: number } & RasterSelection): Promise<(SelectionData | undefined)[]> {
  const { loaders = [], loaderSelection = [], z = 0 } = props;
  let { concurrency } = props;
  if (concurrency && loaderSelection.length > 0) {
    // There are `loaderSelection.length` requests per loader. This block scales
    // the provided concurrency to map to the number of actual requests.
    concurrency = Math.ceil(concurrency / loaderSelection.length);
  }
  const mapper = async (loader: ZarrLoader | undefined) => {
    if (!loader) return; // No data
    const tile = await loader.getRaster({ loaderSelection, z });
    if (tile.width % 4 !== 0) {
      // If width if not a multiple of 4, there are issues with textures
      // https://stackoverflow.com/questions/42789896/webgl-error-arraybuffer-not-big-enough-for-request-in-case-of-gl-luminance
      const { width, height } = tile;
      const newWidth = 4 * Math.ceil(width / 4);
      return {
        data: tile.data.map(data => padTileWithZeros({ data, width, height}, newWidth, height) as TypedArray),
        height,
        width: newWidth,
      }
    }
    return tile;
  };
  return pMap(loaders, mapper, { concurrency });
}

export default class GridLayer<D, P extends GridLayerProps<D> = GridLayerProps<D>> extends CompositeLayer<D, P> {
  initializeState() {
    this.state = { gridData: [], width: 0, height: 0 };
    refreshGridData(this.props).then(gridData => {
      const { width, height } = validateWidthHeight(gridData);
      this.setState({ gridData, width, height })
    });
  }

  updateState({ props, oldProps, changeFlags }: { props: GridLayerProps<D>, oldProps: GridLayerProps<D>, changeFlags: any }) {
    const { propsChanged } = changeFlags;
    const loaderChanged = typeof propsChanged === 'string' && propsChanged.includes('props.loaders');
    const loaderSelectionChanged = props.loaderSelection !== oldProps.loaderSelection;
    if (loaderChanged || loaderSelectionChanged) {
      // Only fetch new data to render if loader has changed
      refreshGridData(this.props).then(gridData => {
        this.setState({ gridData });
      });
    }
  }

  getPickingInfo({ info }: { info: any }) {
    // provide Grid row and column info for mouse events (hover & click)
    if (!info.coordinate) {
      return info;
    }
    const { rows, columns } = this.props;
    const spacer = this.props.spacer || 0;
    const { width, height } = this.state;
    const gridWidth = (columns * width) + ((columns - 1) * spacer);
    const gridHeight = (rows * height) + ((rows - 1) * spacer);
    const gridX = info.coordinate[0] + (gridWidth / 2);
    const gridY = info.coordinate[1] + (gridHeight / 2);
    const row = Math.floor(gridY / (height + spacer));
    const column = Math.floor(gridX / (width + spacer));
    info.gridCoord = { row, column }; // add custom property
    return info;
  }

  renderLayers() {
    const { gridData, width, height } = this.state;
    if (width === 0 || height === 0) return null; // early return if no data

    const { loaders, rows, columns, spacer, id = '' } = this.props;
    const top = -(rows * (height + spacer)) / 2;
    const left = -(columns * (width + spacer)) / 2;
    const gridLayers = range(rows).flatMap((row) => {
      return range(columns).map((col) => {
        const y = top + (row * (height + spacer));
        const x = left + (col * (width + spacer));
        const offset = col + (row * columns);
        const layerProps = {
          channelData: gridData[offset] || null, // coerce to null if no data 
          bounds: scaleBounds(width, height, [x, y]),
          id: `${id}-GridLayer-${row}-${col}`,
          dtype: loaders[offset]?.dtype || '<u2', // fallback if missing,
        };
        return new XRLayer({ ...this.props, ...layerProps });
      });
    });

    if (this.props.pickable) {
      const bottom = top + (rows * (height + spacer));
      const right = left + (columns * (width + spacer));
      const polygon = [[left, top], [right, top], [right, bottom], [left, bottom]];
      const layerProps = {
        data: [{ polygon }],
        getPolygon: (d: any) => d.polygon,
        getFillColor: [0, 0, 0, 0], // transparent
        getLineColor: [0, 0, 0, 0],
        pickable: true, // enable picking
        id: `${id}-GridLayer-picking`,
      } as any; // I was having an issue with typescript here....
      const pickableLayer = new SolidPolygonLayer({ ...this.props, ...layerProps });
      return [pickableLayer, ...gridLayers];
    }

    return gridLayers;
  }
}
  
  GridLayer.layerName = 'GridLayer';
  GridLayer.defaultProps = defaultProps;