import { Provider, atom } from "jotai";
import { useSetAtom } from "jotai";
import * as React from "react";
import ReactDOM from "react-dom/client";

import Menu from "./components/Menu";
import Viewer from "./components/Viewer";
import "./codecs/register";
import { type ImageLayerConfig, type ViewState, addImageAtom } from "./state";
import { defer, typedEmitter } from "./utils";

export { version } from "../package.json";

import "./index.css";
import { ViewStateContext } from "./hooks";

type Events = {
  viewStateChange: ViewState;
};

export type { ViewState, ImageLayerConfig };

export interface VizarrViewer {
  addImage(config: ImageLayerConfig): void;
  setViewState(viewState: ViewState): void;
  on<E extends keyof Events>(event: E, cb: (data: Events[E]) => void): void;
  destroy(): void;
}

export function createViewer(element: HTMLElement, options: { menuOpen?: boolean } = {}): Promise<VizarrViewer> {
  const ref = React.createRef<VizarrViewer>();
  const emitter = typedEmitter<Events>();
  const viewStateAtom = atom<ViewState | undefined>(undefined);
  const viewStateAtomWithUrlSync = atom(
    (get) => get(viewStateAtom),
    (get, set, update) => {
      const next = typeof update === "function" ? update(get(viewStateAtom)) : update;
      next && emitter.emit("viewStateChange", { target: next.target, zoom: next.zoom });
      set(viewStateAtom, next);
    },
  );
  const { promise, resolve } = defer<VizarrViewer>();

  function App() {
    const addImage = useSetAtom(addImageAtom);
    const setViewState = useSetAtom(viewStateAtom);
    React.useImperativeHandle(
      ref,
      () => ({
        addImage,
        setViewState,
        on: emitter.on.bind(emitter),
        destroy: () => root.unmount(),
      }),
      [setViewState, addImage],
    );
    React.useEffect(() => {
      if (ref.current) {
        resolve(ref.current);
      }
    }, []);
    return (
      <ViewStateContext.Provider value={viewStateAtomWithUrlSync}>
        <Menu open={options.menuOpen ?? true} />
        <Viewer />
      </ViewStateContext.Provider>
    );
  }
  let root = ReactDOM.createRoot(element);
  root.render(
    <Provider>
      <App />
    </Provider>,
  );
  return promise;
}
