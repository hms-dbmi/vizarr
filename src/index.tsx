import { ThemeProvider, makeStyles } from "@material-ui/styles";
import { Provider, atom } from "jotai";
import { useAtomValue, useSetAtom } from "jotai";
import * as React from "react";
import ReactDOM from "react-dom/client";

import Menu from "./components/Menu";
import Viewer from "./components/Viewer";
import "./codecs/register";
import { type ImageLayerConfig, type ViewState, addImageAtom, atomWithEffect, sourceErrorAtom } from "./state";
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
  const viewStateAtom = atomWithEffect<ViewState | undefined, ViewState>(
    atom<ViewState | undefined>(undefined),
    ({ zoom, target }) => emitter.emit("viewStateChange", { zoom, target }),
  );
  const { promise, resolve } = defer<VizarrViewer>();

  function App() {
    const sourceError = useAtomValue(sourceErrorAtom);
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
    const classes = useStyles();
    return (
      <>
        {sourceError === null && (
          <>
            <Menu open={options.menuOpen ?? true} />
            <Viewer viewStateAtom={viewStateAtom} />
          </>
        )}
        {sourceError !== null && (
          <div className={classes.errorContainer}>
            <p>{`Error: server replied with "${sourceError}" when loading the resource`}</p>
          </div>
        )}
      </>
    );
  }
  let root = ReactDOM.createRoot(element);
  root.render(
    <ThemeProvider theme={theme}>
      <Provider>
        <App />
      </Provider>
    </ThemeProvider>,
  );
  return promise;
}
