import {CompositeLayer} from "../_snowpack/pkg/@deck.gl/core.js";
import {SolidPolygonLayer, TextLayer} from "../_snowpack/pkg/@deck.gl/layers.js";
import pMap from "../_snowpack/pkg/p-map.js";
import {XRLayer} from "../_snowpack/pkg/@hms-dbmi/viv.js";
const defaultProps = {
  ...XRLayer.defaultProps,
  loaders: {type: "array", value: [], compare: true},
  spacer: {type: "number", value: 5, compare: true},
  rows: {type: "number", value: 0, compare: true},
  columns: {type: "number", value: 0, compare: true},
  concurrency: {type: "number", value: 10, compare: false},
  text: {type: "boolean", value: false, compare: true},
  onClick: {type: "function", value: null, compare: true},
  onHover: {type: "function", value: null, compare: true}
};
function scaleBounds(width, height, translate = [0, 0], scale = 1) {
  const [left, top] = translate;
  const right = width * scale + left;
  const bottom = height * scale + top;
  return [left, bottom, right, top];
}
function validateWidthHeight(d) {
  const [first] = d;
  const {width, height} = first.data;
  d.forEach(({data}) => {
    if (data?.width !== width || data?.height !== height) {
      throw new Error("Grid data is not same shape.");
    }
  });
  return {width, height};
}
function refreshGridData(props) {
  const {loaders, loaderSelection = []} = props;
  let {concurrency} = props;
  if (concurrency && loaderSelection.length > 0) {
    concurrency = Math.ceil(concurrency / loaderSelection.length);
  }
  const mapper = async (d) => {
    const promises = loaderSelection.map((selection) => d.loader.getRaster({selection}));
    const tiles = await Promise.all(promises);
    return {
      ...d,
      data: {
        data: tiles.map((d2) => d2.data),
        width: tiles[0].width,
        height: tiles[0].height
      }
    };
  };
  return pMap(loaders, mapper, {concurrency});
}
export default class GridLayer extends CompositeLayer {
  initializeState() {
    this.state = {gridData: [], width: 0, height: 0};
    refreshGridData(this.props).then((gridData) => {
      const {width, height} = validateWidthHeight(gridData);
      this.setState({gridData, width, height});
    });
  }
  updateState({props, oldProps, changeFlags}) {
    const {propsChanged} = changeFlags;
    const loaderChanged = typeof propsChanged === "string" && propsChanged.includes("props.loaders");
    const loaderSelectionChanged = props.loaderSelection !== oldProps.loaderSelection;
    if (loaderChanged || loaderSelectionChanged) {
      refreshGridData(this.props).then((gridData) => {
        this.setState({gridData});
      });
    }
  }
  getPickingInfo({info}) {
    if (!info.coordinate) {
      return info;
    }
    const spacer = this.props.spacer || 0;
    const {width, height} = this.state;
    const [x, y] = info.coordinate;
    const row = Math.floor(y / (height + spacer));
    const column = Math.floor(x / (width + spacer));
    info.gridCoord = {row, column};
    return info;
  }
  renderLayers() {
    const {gridData, width, height} = this.state;
    if (width === 0 || height === 0)
      return null;
    const {rows, columns, spacer = 0, id = ""} = this.props;
    const layers = gridData.map((d) => {
      const y = d.row * (height + spacer);
      const x = d.col * (width + spacer);
      const layerProps = {
        channelData: d.data,
        bounds: scaleBounds(width, height, [x, y]),
        id: `${id}-GridLayer-${d.row}-${d.col}`,
        dtype: d.loader.dtype || "Uint16",
        pickable: false
      };
      return new XRLayer({...this.props, ...layerProps});
    });
    if (this.props.pickable) {
      const [top, left] = [0, 0];
      const bottom = rows * (height + spacer);
      const right = columns * (width + spacer);
      const polygon = [
        [left, top],
        [right, top],
        [right, bottom],
        [left, bottom]
      ];
      const layerProps = {
        data: [{polygon}],
        getPolygon: (d) => d.polygon,
        getFillColor: [0, 0, 0, 0],
        getLineColor: [0, 0, 0, 0],
        pickable: true,
        id: `${id}-GridLayer-picking`
      };
      const pickableLayer = new SolidPolygonLayer({...this.props, ...layerProps});
      layers.push(pickableLayer);
    }
    if (this.props.text) {
      const textLayer = new TextLayer({
        id: `${id}-GridLayer-text`,
        data: gridData,
        getPosition: (d) => [d.col * (width + spacer), d.row * (height + spacer)],
        getText: (d) => d.name,
        getColor: [255, 255, 255, 255],
        getSize: 16,
        getAngle: 0,
        getTextAnchor: "start",
        getAlignmentBaseline: "top"
      });
      layers.push(textLayer);
    }
    return layers;
  }
}
GridLayer.layerName = "GridLayer";
GridLayer.defaultProps = defaultProps;
