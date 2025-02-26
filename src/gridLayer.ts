import { CompositeLayer, SolidPolygonLayer, TextLayer } from "deck.gl";
import pMap from "p-map";

import { ColorPaletteExtension, XRLayer } from "@hms-dbmi/viv";
import type { SupportedTypedArray } from "@vivjs/types";
import type { CompositeLayerProps, PickingInfo, SolidPolygonLayerProps, TextLayerProps } from "deck.gl";
import type { ZarrPixelSource } from "./ZarrPixelSource";
import type { BaseLayerProps } from "./state";
import { assert } from "./utils";

export interface GridLoader {
  loader: ZarrPixelSource<string[]>;
  row: number;
  col: number;
  name: string;
}

type Polygon = Array<[number, number]>;

export interface GridLayerProps
  extends Omit<CompositeLayerProps, "loaders" | "modelMatrix" | "opacity" | "onClick" | "id">,
    BaseLayerProps {
  loaders: GridLoader[];
  rows: number;
  columns: number;
  spacer?: number;
  text?: boolean;
  concurrency?: number;
}

const defaultProps = {
  // @ts-expect-error - XRLayer props are not typed
  ...XRLayer.defaultProps,
  // Special grid props
  loaders: { type: "array", value: [], compare: true },
  spacer: { type: "number", value: 5, compare: true },
  rows: { type: "number", value: 0, compare: true },
  columns: { type: "number", value: 0, compare: true },
  concurrency: { type: "number", value: 10, compare: false }, // set concurrency for queue
  text: { type: "boolean", value: false, compare: true },
  // Deck.gl
  onClick: { type: "function", value: null, compare: true },
  onHover: { type: "function", value: null, compare: true },
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
  for (const { data } of d) {
    if (!data) continue;
    assert(data.width === width && data.height === height, "Grid data is not same shape.");
  }
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

type SharedLayerState = {
  gridData: Awaited<ReturnType<typeof refreshGridData>>;
  width: number;
  height: number;
};

export default class GridLayer extends CompositeLayer<CompositeLayerProps & GridLayerProps> {
  get #state(): SharedLayerState {
    // @ts-expect-error - typed as any by deck
    return this.state;
  }

  set #state(state: SharedLayerState) {
    this.state = state;
  }

  initializeState() {
    this.#state = { gridData: [], width: 0, height: 0 };
    refreshGridData(this.props).then((gridData) => {
      const { width, height } = validateWidthHeight(gridData);
      this.setState({ gridData, width, height });
    });
  }

  updateState({
    props,
    oldProps,
    changeFlags,
  }: {
    props: GridLayerProps;
    oldProps: GridLayerProps;
    changeFlags: {
      propsChanged: string | boolean | null;
    };
  }) {
    const { propsChanged } = changeFlags;
    const loaderChanged = typeof propsChanged === "string" && propsChanged.includes("props.loaders");
    const loaderSelectionChanged = props.selections !== oldProps.selections;
    if (loaderChanged || loaderSelectionChanged) {
      // Only fetch new data to render if loader has changed
      refreshGridData(this.props).then((gridData) => {
        this.setState({ gridData });
      });
    }
  }

  getPickingInfo({ info }: { info: PickingInfo }) {
    // provide Grid row and column info for mouse events (hover & click)
    if (!info.coordinate) {
      return info;
    }
    const spacer = this.props.spacer || 0;
    const { width, height } = this.#state;
    const [x, y] = info.coordinate;
    const row = Math.floor(y / (height + spacer));
    const column = Math.floor(x / (width + spacer));
    return {
      ...info,
      gridCoord: { row, column },
    };
  }

  renderLayers() {
    const { gridData, width, height } = this.#state;
    if (width === 0 || height === 0) return null; // early return if no data

    const { rows, columns, spacer = 0, id = "" } = this.props;
    type Data = { row: number; col: number; loader: Pick<ZarrPixelSource, "dtype">; data: Array<SupportedTypedArray> };
    const layers = gridData.map((d) => {
      const y = d.row * (height + spacer);
      const x = d.col * (width + spacer);
      const layerProps = {
        channelData: d.data, // coerce to null if no data
        bounds: scaleBounds(width, height, [x, y]),
        id: `${id}-GridLayer-${d.row}-${d.col}`,
        dtype: d.loader.dtype || "Uint16", // fallback if missing,
        pickable: false,
        extensions: [new ColorPaletteExtension()],
      };
      // @ts-expect-error - XRLayer props are not well typed
      return new XRLayer({ ...this.props, ...layerProps });
    });

    if (this.props.pickable) {
      type Data = { polygon: Polygon };
      const bottom = rows * (height + spacer);
      const right = columns * (width + spacer);
      const polygon = [
        [0, 0],
        [right, 0],
        [right, bottom],
        [0, bottom],
      ] satisfies Polygon;
      const layerProps = {
        data: [{ polygon }],
        getPolygon: (d) => d.polygon,
        getFillColor: [0, 0, 0, 0], // transparent
        getLineColor: [0, 0, 0, 0],
        pickable: true, // enable picking
        id: `${id}-GridLayer-picking`,
      } satisfies SolidPolygonLayerProps<Data>;
      const layer = new SolidPolygonLayer<Data, SolidPolygonLayerProps<Data>>({ ...this.props, ...layerProps });
      layers.push(layer);
    }

    if (this.props.text) {
      type Data = { col: number; row: number; name: string };
      const layer = new TextLayer<Data, TextLayerProps<Data>>({
        id: `${id}-GridLayer-text`,
        data: gridData,
        getPosition: (d) => [d.col * (width + spacer), d.row * (height + spacer)],
        getText: (d) => d.name,
        getColor: [255, 255, 255, 255],
        getSize: 16,
        getAngle: 0,
        getTextAnchor: "start",
        getAlignmentBaseline: "top",
      });
      layers.push(layer);
    }

    return layers;
  }
}

GridLayer.layerName = "GridLayer";
GridLayer.defaultProps = defaultProps;
