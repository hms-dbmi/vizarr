import { CompositeLayer } from '@deck.gl/core';
import { SolidPolygonLayer, TextLayer } from '@deck.gl/layers';
import type { CompositeLayerProps } from '@deck.gl/core/lib/composite-layer';
import { Matrix4 } from '@math.gl/core/dist/esm';
import { MultiscaleImageLayer } from '@hms-dbmi/viv';
import type { GridLoader } from './state';

export interface GridLayerProps extends CompositeLayerProps<any> {
  loaders: GridLoader[];
  rows: number;
  columns: number;
  spacer?: number;
  text?: boolean;
  sliderValues: number[][];
  channelIsOn: boolean[];
  colorValues: number[][];
  loaderSelection: number[][];
  colormap: string;
  concurrency?: number;
}

const defaultProps = {
  ...MultiscaleImageLayer.defaultProps,
  // Special grid props
  loaders: { type: 'array', value: [], compare: true },
  spacer: { type: 'number', value: 5, compare: true },
  rows: { type: 'number', value: 0, compare: true },
  columns: { type: 'number', value: 0, compare: true },
  concurrency: { type: 'number', value: 10, compare: false }, // set concurrency for queue
  text: { type: 'boolean', value: true, compare: true },
  // Deck.gl
  onClick: { type: 'function', value: null, compare: true },
  onHover: { type: 'function', value: null, compare: true },
};

export default class GridLayer<P extends GridLayerProps = GridLayerProps> extends CompositeLayer<any, P> {
  getPickingInfo({ info }: { info: any }) {
    // provide Grid row and column info for mouse events (hover & click)
    if (!info.coordinate) {
      return info;
    }
    const spacer = this.props.spacer || 0;
    const [height, width] = this.props.loaders[0].loader[0].shape.slice(-2);
    const [x, y] = info.coordinate;
    const row = Math.floor(y / (height + spacer));
    const column = Math.floor(x / (width + spacer));
    info.gridCoord = { row, column }; // add custom property
    return info;
  }

  renderLayers() {
    if (this.props.loaders.length === 0) return null;
    const [height, width] = this.props.loaders[0].loader[0].shape.slice(-2);
    const { rows, columns, spacer = 0, id = '' } = this.props;
    const layers = this.props.loaders.map((d: any) => {
      const y = d.row * (height + spacer);
      const x = d.col * (width + spacer);
      const layerProps = {
        loader: d.loader,
        modelMatrix: new Matrix4().translate([x, y, 0]),
        id: `${id}-GridLayer-${d.row}-${d.col}`,
        pickable: false,
      };
      return new (MultiscaleImageLayer as any)({ ...this.props, ...layerProps });
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
        data: this.props.loaders,
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
