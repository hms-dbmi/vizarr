import * as React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider, atom } from 'jotai';
import { useSetAtom } from 'jotai';
import { ThemeProvider } from '@material-ui/styles';
import mitt from 'mitt';

import Menu from './components/Menu';
import Viewer from './components/Viewer';
import './codecs/register';
import { addImageAtom, ImageLayerConfig, ViewState, atomWithEffect } from './state';
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
}

/** switch to Promise.withResolvers when it's available */
function defer<T>() {
  let resolve: (value: T | PromiseLike<T>) => void;
  let reject: (reason?: any) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  // @ts-expect-error - resolve and reject are OK
  return { promise, resolve, reject };
}

export function createViewer(element: HTMLElement): Promise<VizarrViewer> {
  const ref = React.createRef<VizarrViewer>();
  const emitter = mitt<Events>();
  const viewStateAtom = atomWithEffect<ViewState | undefined, ViewState>(
    atom<ViewState | undefined>(undefined),
    ({ zoom, target }) => emitter.emit('viewStateChange', { zoom, target })
  );
  let { promise, resolve } = defer<VizarrViewer>();

  function App() {
    const addImage = useSetAtom(addImageAtom);
    const setViewState = useSetAtom(viewStateAtom);
    React.useImperativeHandle(ref, () => ({ addImage, setViewState, on: emitter.on }), []);
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
  ReactDOM.createRoot(element).render(
    <ThemeProvider theme={theme}>
      <Provider>
        <App />
      </Provider>
    </ThemeProvider>
  );

  return promise;
}
