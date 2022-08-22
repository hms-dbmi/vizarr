import * as React from 'react';
import { useUpdateAtom } from 'jotai/utils';

import { addImageAtom, viewStateAtom } from './state';
import type { ImageLayerConfig, ViewState } from './state';

import Viewer from './components/Viewer';
import Menu from './components/Menu';
import { version } from '../package.json';

export interface VizarrApi {
  version: string;
  addImage(config: ImageLayerConfig): void;
  setViewState(viewState: ViewState): void;
}

export default React.forwardRef<VizarrApi>((_, ref) => {
  const addImage = useUpdateAtom(addImageAtom);
  const setViewState = useUpdateAtom(viewStateAtom);
  React.useImperativeHandle(ref, () => ({ version, addImage, setViewState }), []);
  return (
    <>
      <Menu />
      <Viewer />
    </>
  );
});
