import React from "../../_snowpack/pkg/react.js";
import {useRecoilState, useRecoilValue} from "../../_snowpack/pkg/recoil.js";
import DeckGL from "../../_snowpack/pkg/deck.gl.js";
import {OrthographicView} from "../../_snowpack/pkg/@deck.gl/core.js";
import {viewerViewState, layersSelector} from "../state.js";
function WrappedViewStateDeck({layers}) {
  const [viewState, setViewState] = useRecoilState(viewerViewState);
  if (viewState?.default && layers[0]?.props?.loader?.base) {
    const loader = layers[0].props.loader;
    const [height, width] = loader.base.shape.slice(-2);
    const zoom = -loader.numLevels;
    const target = [width / 2, height / 2, 0];
    setViewState({zoom, target});
  }
  const views = [new OrthographicView({id: "ortho", controller: true})];
  return /* @__PURE__ */ React.createElement(DeckGL, {
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
