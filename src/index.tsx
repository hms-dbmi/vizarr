import * as React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider, atom } from 'jotai';
import { useSetAtom } from 'jotai';
import { ThemeProvider } from '@material-ui/styles';

import Menu from './components/Menu';
import Viewer from './components/Viewer';
import './codecs/register';
import { addImageAtom, ImageLayerConfig, ViewState, atomWithEffect } from './state';
import { defer, typedEmitter } from './utils';
import theme from './theme';

export { version } from '../package.json';

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

export function createViewer(element: HTMLElement): Promise<VizarrViewer> {
  const ref = React.createRef<VizarrViewer>();
  const emitter = typedEmitter<Events>();
  const viewStateAtom = atomWithEffect<ViewState | undefined, ViewState>(
    atom<ViewState | undefined>(undefined),
    ({ zoom, target }) => emitter.emit('viewStateChange', { zoom, target })
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
      []
    );
    React.useEffect(() => {
      if (ref.current) {
        resolve(ref.current);
      }
    }, []);
    return (
      <>
        <Menu />
        <Viewer viewStateAtom={viewStateAtom} />
      </>
    );
  }
  let root = ReactDOM.createRoot(element);
  root.render(
    <ThemeProvider theme={theme}>
      <Provider>
        <App />
      </Provider>
    </ThemeProvider>
  );
  return promise;
}
