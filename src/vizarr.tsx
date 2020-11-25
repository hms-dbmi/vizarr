import React, { useEffect } from 'react';
import { useSetRecoilState } from 'recoil';

import { layerIdsState, sourceInfoState, viewerViewState } from './state';
import type { ImageLayerConfig } from './state';

import Viewer from './components/Viewer';
import Menu from './components/Menu';

function App() {
  const setViewState = useSetRecoilState(viewerViewState);
  const setLayerIds = useSetRecoilState(layerIdsState);
  const setSourceInfo = useSetRecoilState(sourceInfoState);

  async function addImage(config: ImageLayerConfig) {
    const { createSourceData } = await import('./io');
    const id = Math.random().toString(36).slice(2);
    const sourceData = await createSourceData(config);
    setSourceInfo((prevSourceInfo) => {
      if (!sourceData.name) {
        sourceData.name = `image_${Object.keys(prevSourceInfo).length}`;
      }
      return { ...prevSourceInfo, [id]: sourceData };
    });
    setLayerIds((prevIds) => [...prevIds, id]);
  }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.has('source')) {
      // If a source is provided in the URL, cast params to config object and load image.
      const config = {} as any;
      for (const [key, value] of params) {
        config[key] = value;
      }
      addImage(config as ImageLayerConfig);
    }
  }, []);

  useEffect(() => {
    async function initImjoy() {
      const { default: imjoy } = await import('imjoy-rpc');
      const api = await imjoy.setupRPC({
        name: 'vizarr',
        description: 'A minimal, purely client-side program for viewing Zarr-based images with Viv & ImJoy.',
        version: import.meta.env.SNOWPACK_PUBLIC_PACKAGE_VERSION as string,
      });
      const add_image = async (props: ImageLayerConfig) => addImage(props);
      const set_view_state = async (vs: { zoom: number; target: number[] }) => setViewState(vs);
      api.export({ add_image, set_view_state });
    }
    // enable imjoy api when loaded as an iframe
    if (window.self !== window.top) {
      initImjoy();
    }
  }, []);

  return (
    <>
      <Menu />
      <Viewer />
    </>
  );
}

export default App;
