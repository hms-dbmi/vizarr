import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useSetRecoilState } from 'recoil';

import { version as vizarrVersion } from '../../package.json';
import { layerIdsState, sourceInfoState, viewerViewState } from '../state';

const Viewer = dynamic(() => import('../components/Viewer'));
const Menu = dynamic(() => import('../components/Menu'));

function App() {
  const router = useRouter();
  const setViewState = useSetRecoilState(viewerViewState);
  const setLayerIds = useSetRecoilState(layerIdsState);
  const setSourceInfo = useSetRecoilState(sourceInfoState);

  async function addImage(props) {
    const { createSourceData } = await import('../utils');
    const id = Math.random().toString(36).slice(2);
    const sourceData = await createSourceData(props);
    setLayerIds((prevIds) => [...prevIds, id]);
    setSourceInfo((prevSourceInfo) => {
      if (!sourceData.name) {
        sourceData.name = `image_${Object.keys(prevSourceInfo).length}`;
      }
      return { ...prevSourceInfo, [id]: sourceData };
    });
  }

  useEffect(() => {
    if ('source' in router.query) {
      // If a source is provided in the URL, pass all params to load image.
      addImage(router.query);
    }
  }, [router]);

  useEffect(() => {
    async function initImjoy() {
      const { setupRPC } = await import('imjoy-rpc');
      const api = await setupRPC({ 
        name: 'vizarr',
        description: 'A minimal, purely client-side program for viewing Zarr-based images with Viv & ImJoy',
        version: vizarrVersion,
      });
      const add_image = async (props) => addImage(props);
      const set_view_state = async (vs) => setViewState(vs);
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
