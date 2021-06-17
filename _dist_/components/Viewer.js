import React, {useRef} from "../../_snowpack/pkg/react.js";
import {useAtom} from "../../_snowpack/pkg/jotai.js";
import {useAtomValue} from "../../_snowpack/pkg/jotai/utils.js";
import DeckGL from "../../_snowpack/pkg/deck.gl.js";
import {OrthographicView} from "../../_snowpack/pkg/@deck.gl/core.js";
import {layerAtoms, viewStateAtom} from "../state.js";
import {isInterleaved, fitBounds} from "../utils.js";
function getLayerSize(props) {
  const {loader, rows, columns} = props;
  const [base, maxZoom] = Array.isArray(loader) ? [loader[0], loader.length] : [loader, 0];
  const interleaved = isInterleaved(base.shape);
  let [height, width] = base.shape.slice(interleaved ? -3 : -2);
  if (rows && columns) {
    const spacer = 5;
    height = (height + spacer) * rows;
    width = (width + spacer) * columns;
  }
  return {height, width, maxZoom};
}
function WrappedViewStateDeck({layers}) {
  const [viewState, setViewState] = useAtom(viewStateAtom);
  const deckRef = useRef(null);
  if (deckRef.current && viewState?.default && layers[0]?.props?.loader) {
    const {deck} = deckRef.current;
    const {width, height, maxZoom} = getLayerSize(layers[0].props);
    const padding = deck.width < 400 ? 10 : deck.width < 600 ? 30 : 50;
    const {zoom, target} = fitBounds([width, height], [deck.width, deck.height], maxZoom, padding);
    setViewState({zoom, target});
  }
  return /* @__PURE__ */ React.createElement(DeckGL, {
    ref: deckRef,
    layers,
    viewState,
    onViewStateChange: (e) => setViewState(e.viewState),
    views: [new OrthographicView({id: "ortho", controller: true})]
  });
}
function Viewer() {
  const layerConstructors = useAtomValue(layerAtoms);
  const layers = layerConstructors.map((layer) => {
    return !layer.on ? null : new layer.Layer(layer.layerProps);
  });
  return /* @__PURE__ */ React.createElement(WrappedViewStateDeck, {
    layers
  });
}
export default Viewer;
