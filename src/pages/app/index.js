import dynamic from 'next/dynamic';
import { useEffect } from 'react';
import { useSetRecoilState } from 'recoil';

import { layerIdsState, sourceInfoState, viewerViewState } from '../../state';

const Viewer = dynamic(() => import('../../components/Viewer'));
const Menu = dynamic(() => import('../../components/Menu'));

function App() {
  const setViewState = useSetRecoilState(viewerViewState);
  const setLayerIds = useSetRecoilState(layerIdsState);
  const setSourceInfo = useSetRecoilState(sourceInfoState);

  useEffect(() => {
    async function init() {
      // enable imjoy api when loaded as an iframe
      if (window.self !== window.top) {
        const { setupRPC } = await import('imjoy-rpc');
        const api = await setupRPC({ name: 'viv-plugin' });
        const { createSourceData } = await import('../../utils');

        async function add_image(props) {
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
      <Menu />
      <Viewer />
    </>
  );
}

export default App;
