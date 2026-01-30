import { type PrimitiveAtom, Provider, atom, useAtomValue } from "jotai";
import { useSetAtom } from "jotai";
import * as React from "react";
import ReactDOM from "react-dom/client";

import Menu from "./components/Menu";
import Viewer from "./components/Viewer";
import "./codecs/register";
import { ViewStateContext } from "./hooks";

import {
  type ImageLayerConfig,
  type ViewState,
  addImageAtom,
  redirectObjAtom,
  sourceErrorAtom,
  viewStateAtom,
} from "./state";
import { defer, typedEmitter } from "./utils";

export { version } from "../package.json";

import "./index.css";

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
  const shadowRoot = element.attachShadow({ mode: "open" });
  const link = Object.assign(document.createElement("link"), {
    rel: "stylesheet",
    href: new URL(/* @vite-ignore */ "index.css", import.meta.url).href,
  });
  shadowRoot.appendChild(link);

  const ref = React.createRef<VizarrViewer>();
  const emitter = typedEmitter<Events>();
  const viewStateAtomWithEffect: PrimitiveAtom<ViewState | null> = atom(
    (get) => get(viewStateAtom),
    (get, set, update) => {
      const viewState = typeof update === "function" ? update(get(viewStateAtom)) : update;
      if (viewState)
        emitter.emit("viewStateChange", {
          target: viewState.target,
          zoom: viewState.zoom,
        });
      set(viewStateAtom, update);
    },
  );
  const { promise, resolve } = defer<VizarrViewer>();

  function App() {
    const sourceError = useAtomValue(sourceErrorAtom);
    const redirectObj = useAtomValue(redirectObjAtom);
    const addImage = useSetAtom(addImageAtom);
    const setViewState = useSetAtom(viewStateAtomWithEffect);
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
      <>
        {sourceError === null && redirectObj === null && (
          <ViewStateContext.Provider value={viewStateAtomWithEffect}>
            <Menu open={options.menuOpen ?? true} />
            <Viewer />
          </ViewStateContext.Provider>
        )}
        {sourceError !== null && (
          <div className={""}>
            <p>{`Error: server replied with "${sourceError}" when loading the resource`}</p>
          </div>
        )}
        {redirectObj !== null && (
          <div className={""}>
            <span>
              {redirectObj.message}
              <a href={redirectObj.url}> {redirectObj.url} </a>
            </span>
          </div>
        )}
      </>
    );
  }
  let root = ReactDOM.createRoot(shadowRoot);
  root.render(
    <Provider>
      <App />
    </Provider>,
  );
  return promise;
}
