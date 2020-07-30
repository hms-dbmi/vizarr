import { useEffect } from 'react';
import { useSetRecoilState } from 'recoil';

import Viewer from '../components/Viewer'
import Menu from '../components/Menu';
import { layerIdsState, sourceInfoState, viewerViewState } from '../state';

function App() {
  const setViewState = useSetRecoilState(viewerViewState);
  const setLayerIds = useSetRecoilState(layerIdsState);
  const setSourceInfo = useSetRecoilState(sourceInfoState);

  useEffect(() => {
    async function init() {
      // enable imjoy api when loaded as an iframe
      if (window.self !== window.top) {
        const { setupRPC } = await import('imjoy-rpc');
        const api = await setupRPC({ name: "vitessce-image-viewer-plugin" });

        async function add_image({ 
          source,
          name,
          channels,
          dimensions,
          colormap = null,
          opacity = 1
        }) { 
          const id = Math.random().toString(36).slice(2);
          setLayerIds(prevIds => [...prevIds, id]);
          setSourceInfo(prevSourceInfo => {
            if (!name) name = `image_${Object.keys(prevSourceInfo).length}`;
            return {
              ...prevSourceInfo,
              [id]: { source, name, channels, dimensions, colormap, opacity }
            }
          });
        }

        async function set_view_state(nextViewState) {
          setViewState(nextViewState);
        }

        api.export({ add_image, set_view_state });
      }
    }
    init();
  }, []); 

  return (
    <>
      <Menu/>
      <Viewer/>
    </>
  );
}

export default App;
