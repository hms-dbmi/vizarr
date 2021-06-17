import React, { useEffect } from 'react';
import { useUpdateAtom } from 'jotai/utils';

import { sourceInfoAtom, viewStateAtom } from './state';
import type { ImageLayerConfig } from './state';

import Viewer from './components/Viewer';
import Menu from './components/Menu';

function App() {
  const setSourceInfo = useUpdateAtom(sourceInfoAtom);
  const setViewState = useUpdateAtom(viewStateAtom);

  async function addImage(config: ImageLayerConfig) {
    const { createSourceData } = await import('./io');
    const id = Math.random().toString(36).slice(2);
    const sourceData = await createSourceData(config);
    setSourceInfo((prevSourceInfo) => {
      if (!sourceData.name) {
        sourceData.name = `image_${Object.keys(prevSourceInfo).length}`;
      }
      return [...prevSourceInfo, { id, ...sourceData }];
    });
  }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    // If a source is provided in the URL, cast params to config object and load image.
    if (params.has('source')) {
      const config = {} as any;
      for (const [key, value] of params) {
        config[key] = value;
      }
      // Make sure the source URL is decoded.
      config.source = decodeURIComponent(config.source);
      addImage(config as ImageLayerConfig);

      // Update URL in history with correctly encoded source url.
      const href = new URL(window.location.href);
      href.searchParams.set('source', config.source);
      const newLocation = decodeURIComponent(href.toString());

      // Only update history if the new loacation is different from the current
      if (window.location.href !== newLocation) {
        window.history.pushState(null, '', newLocation);
      }
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
