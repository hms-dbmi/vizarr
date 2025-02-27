import DeckGL from "deck.gl";
import { OrthographicView } from "deck.gl";
import { useAtomValue } from "jotai";
import * as React from "react";

import type { DeckGLRef, Layer, LayerProps, OrthographicViewState } from "deck.gl";
import type { ZarrPixelSource } from "../ZarrPixelSource";
import { useViewState } from "../hooks";
import { layerAtoms } from "../state";
import { fitBounds, isInterleaved } from "../utils";

type Data = { loader: ZarrPixelSource; rows: number; columns: number };
type VizarrLayer = Layer<LayerProps & Data>;

function getLayerSize(props: Data) {
  const { loader } = props;
  const [base, maxZoom] = Array.isArray(loader) ? [loader[0], loader.length] : [loader, 0];
  const interleaved = isInterleaved(base.shape);
  let [height, width] = base.shape.slice(interleaved ? -3 : -2);
  if ("loaders" in props && props.rows && props.columns) {
    // TODO: Don't hardcode spacer size. Probably best to inspect the deck.gl Layers rather than
    // the Layer Props.
    const spacer = 5;
    height = (height + spacer) * props.rows;
    width = (width + spacer) * props.columns;
  }
  return { height, width, maxZoom };
}

function WrappedViewStateDeck(props: { layers: Array<VizarrLayer | null> }) {
  const deckRef = React.useRef<DeckGLRef>(null);
  const [viewState, setViewState] = useViewState();
  const firstLayerProps = props.layers[0]?.props;

  // If viewState hasn't been updated, use the first loader to guess viewState
  // TODO: There is probably a better place / way to set the intital view and this is a hack.
  if (deckRef.current?.deck && !viewState && firstLayerProps?.loader) {
    const { deck } = deckRef.current;
    const { width, height, maxZoom } = getLayerSize(firstLayerProps);
    const padding = deck.width < 400 ? 10 : deck.width < 600 ? 30 : 50; // Adjust depending on viewport width.
    const bounds = fitBounds([width, height], [deck.width, deck.height], maxZoom, padding);
    setViewState(bounds);
  }

  // Enables screenshots of the canvas: https://github.com/visgl/deck.gl/issues/2200
  const glOptions: WebGLContextAttributes = {
    preserveDrawingBuffer: true,
  };

  return (
    <DeckGL
      ref={deckRef}
      layers={props.layers}
      viewState={viewState && { ortho: viewState }}
      onViewStateChange={(e: { viewState: OrthographicViewState }) =>
        // @ts-expect-error - deck doesn't know this should be ok
        setViewState(e.viewState)
      }
      views={[new OrthographicView({ id: "ortho", controller: true })]}
      glOptions={glOptions}
    />
  );
}

function Viewer() {
  const layerConstructors = useAtomValue(layerAtoms);
  // @ts-expect-error - Viv types are giving up an issue
  const layers: Array<VizarrLayer | null> = layerConstructors.map((layer) => {
    return !layer.on ? null : new layer.Layer(layer.layerProps);
  });
  return <WrappedViewStateDeck layers={layers} />;
}

export default Viewer;
