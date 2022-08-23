import * as React from 'react';
import ReactDOM from 'react-dom';
import { Provider, atom } from 'jotai';
import { useUpdateAtom } from 'jotai/utils';
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

export function createViewer(element: HTMLElement): VizarrViewer {
  const ref = React.createRef<VizarrViewer>();
  const emitter = mitt<Events>();
  const viewStateAtom = atomWithEffect<ViewState | undefined, ViewState>(
    atom<ViewState | undefined>(undefined),
    ({ zoom, target }) => emitter.emit('viewStateChange', { zoom, target })
  );

  function App() {
    const addImage = useUpdateAtom(addImageAtom);
    const setViewState = useUpdateAtom(viewStateAtom);
    React.useImperativeHandle(ref, () => ({ addImage, setViewState, on: emitter.on }), []);
    return (
      <>
        <Menu />
        <Viewer viewStateAtom={viewStateAtom} />
      </>
    );
  }

  ReactDOM.render(
    <ThemeProvider theme={theme}>
      <Provider>
        <App />
      </Provider>
    </ThemeProvider>,
    element
  );

  return ref.current!;
}
