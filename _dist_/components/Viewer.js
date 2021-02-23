import React, {useRef} from "../../_snowpack/pkg/react.js";
import {useRecoilState, useRecoilValue} from "../../_snowpack/pkg/recoil.js";
import DeckGL from "../../_snowpack/pkg/deck.gl.js";
import {OrthographicView} from "../../_snowpack/pkg/@deck.gl/core.js";
import {viewerViewState, layersSelector} from "../state.js";
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
  const [viewState, setViewState] = useRecoilState(viewerViewState);
  const deckRef = useRef(null);
  const views = [new OrthographicView({id: "ortho", controller: true})];
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
    views
  });
}
function Viewer() {
  const layerConstructors = useRecoilValue(layersSelector);
  const layers = layerConstructors.map((l) => {
    const {Layer, layerProps, on} = l;
    return !Layer || !on ? null : new Layer(layerProps);
  });
  return /* @__PURE__ */ React.createElement(WrappedViewStateDeck, {
    layers
  });
}
export default Viewer;
