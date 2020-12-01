import {CompositeLayer, COORDINATE_SYSTEM} from "../web_modules/@deck.gl/core.js";
import {SolidPolygonLayer} from "../web_modules/@deck.gl/layers.js";
import pMap from "../web_modules/p-map.js";
import {XRLayer} from "../web_modules/@hms-dbmi/viv.js";
import {range} from "./utils.js";
import {padTileWithZeros} from "../web_modules/@hms-dbmi/viv/src/loaders/utils.js";
const defaultProps = {
  sliderValues: {type: "array", value: [], compare: true},
  channelIsOn: {type: "array", value: [], compare: true},
  colorValues: {type: "array", value: [], compare: true},
  loaderSelection: {type: "array", value: [], compare: true},
  colormap: {type: "string", value: "", compare: true},
  domain: {type: "array", value: [], compare: true},
  viewportId: {type: "string", value: "", compare: true},
  z: {type: "number", value: 0, compare: true},
  loaders: {type: "array", value: [], compare: true},
  spacer: {type: "number", value: 5, compare: true},
  rows: {type: "number", value: 0, compare: true},
  columns: {type: "number", value: 0, compare: true},
  concurrency: {type: "number", value: 10, compare: false},
  isLensOn: {type: "boolean", value: false, compare: true},
  lensSelection: {type: "number", value: 0, compare: true},
  lensRadius: {type: "number", value: 100, compare: true},
  lensBorderColor: {type: "array", value: [255, 255, 255], compare: true},
  lensBorderRadius: {type: "number", value: 0.02, compare: true},
  pickable: true,
  onClick: {type: "function", value: null, compare: true},
  onHover: {type: "function", value: null, compare: true},
  coordinateSystem: COORDINATE_SYSTEM.CARTESIAN
};
function scaleBounds(width, height, translate = [0, 0], scale = 1) {
  const [left, top] = translate;
  const right = width * scale + left;
  const bottom = height * scale + top;
  return [left, bottom, right, top];
}
function validateWidthHeight(gridData) {
  const first = gridData.find(Boolean);
  if (!first)
    return {width: 0, height: 0};
  const {width, height} = first;
  gridData.forEach((d) => {
    if (d && (d?.width !== width || d?.height !== height)) {
      throw new Error("Grid data is not same shape.");
    }
  });
  return {width, height};
}
function refreshGridData(props) {
  const {loaders = [], loaderSelection = [], z = 0} = props;
  let {concurrency} = props;
  if (concurrency && loaderSelection.length > 0) {
    concurrency = Math.ceil(concurrency / loaderSelection.length);
  }
  const mapper = async (loader) => {
    if (!loader)
      return;
    const tile = await loader.getRaster({loaderSelection, z});
    if (tile.width % 4 !== 0) {
      const {width, height} = tile;
      const newWidth = 4 * Math.ceil(width / 4);
      return {
        data: tile.data.map((data) => padTileWithZeros({data, width, height}, newWidth, height)),
        height,
        width: newWidth
      };
    }
    return tile;
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
  updateState({
    props,
    oldProps,
    changeFlags
  }) {
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
    const {rows, columns} = this.props;
    const spacer = this.props.spacer || 0;
    const {width, height} = this.state;
    const gridWidth = columns * width + (columns - 1) * spacer;
    const gridHeight = rows * height + (rows - 1) * spacer;
    const gridX = info.coordinate[0] + gridWidth / 2;
    const gridY = info.coordinate[1] + gridHeight / 2;
    const row = Math.floor(gridY / (height + spacer));
    const column = Math.floor(gridX / (width + spacer));
    info.gridCoord = {row, column};
    return info;
  }
  renderLayers() {
    const {gridData, width, height} = this.state;
    if (width === 0 || height === 0)
      return null;
    const {loaders, rows, columns, spacer, id = ""} = this.props;
    const top = -(rows * (height + spacer)) / 2;
    const left = -(columns * (width + spacer)) / 2;
    const gridLayers = range(rows).flatMap((row) => {
      return range(columns).map((col) => {
        const y = top + row * (height + spacer);
        const x = left + col * (width + spacer);
        const offset = col + row * columns;
        const layerProps = {
          channelData: gridData[offset] || null,
          bounds: scaleBounds(width, height, [x, y]),
          id: `${id}-GridLayer-${row}-${col}`,
          dtype: loaders[offset]?.dtype || "<u2"
        };
        return new XRLayer({...this.props, ...layerProps});
      });
    });
    if (this.props.pickable) {
      const bottom = top + rows * (height + spacer);
      const right = left + columns * (width + spacer);
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
      return [pickableLayer, ...gridLayers];
    }
    return gridLayers;
  }
}
GridLayer.layerName = "GridLayer";
GridLayer.defaultProps = defaultProps;
