import { Link, Typography } from "@material-ui/core";
import { ThemeProvider, makeStyles } from "@material-ui/styles";
import { type PrimitiveAtom, Provider, atom } from "jotai";
import { useAtomValue, useSetAtom } from "jotai";
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
import theme from "./theme";
import { defer, typedEmitter } from "./utils";

export { version } from "../package.json";

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

const useStyles = makeStyles({
  errorContainer: {
    position: "fixed",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    color: "#fff",
    display: "flex",
    alignItems: "center",
    textAlign: "center",
    justifyContent: "center",
    fontSize: "120%",
  },
});

export function createViewer(element: HTMLElement, options: { menuOpen?: boolean } = {}): Promise<VizarrViewer> {
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
    const classes = useStyles();
    return (
      <>
        {sourceError === null && redirectObj === null && (
          <ViewStateContext.Provider value={viewStateAtomWithEffect}>
            <Menu open={options.menuOpen ?? true} />
            <Viewer />
          </ViewStateContext.Provider>
        )}
        {sourceError !== null && (
          <div className={classes.errorContainer}>
            <p>{`Error: server replied with "${sourceError}" when loading the resource`}</p>
          </div>
        )}
        {redirectObj !== null && (
          <div className={classes.errorContainer}>
            <Typography variant="h5">
              {redirectObj.message}
              <Link href={redirectObj.url}> {redirectObj.url} </Link>
            </Typography>
          </div>
        )}
      </>
    );
  }
  let root = ReactDOM.createRoot(element);
  root.render(
    <ThemeProvider theme={theme}>
      <Provider>
        <ViewStateContext.Provider value={viewStateAtomWithEffect}>
          <App />
        </ViewStateContext.Provider>
      </Provider>
    </ThemeProvider>,
  );
  return promise;
}
