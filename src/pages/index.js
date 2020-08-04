import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';

import { useEffect } from 'react';
import { useSetRecoilState } from 'recoil';

import { layerIdsState, sourceInfoState, viewerViewState } from '../state';

const Viewer = dynamic(() => import('../components/Viewer'));
const Menu = dynamic(() => import('../components/Menu'));

function App() {
  const router = useRouter()
  const setViewState = useSetRecoilState(viewerViewState);
  const setLayerIds = useSetRecoilState(layerIdsState);
  const setSourceInfo = useSetRecoilState(sourceInfoState);

  useEffect(() => {
    async function load() {
      const { createSourceData } = await import('../utils');
      if ('source' in router.query) {
        const { source } = router.query;
        const id = Math.random().toString(36).slice(2);
        const sourceData = await createSourceData({ source });
        setLayerIds((prevIds) => [...prevIds, id]);
        setSourceInfo((prevSourceInfo) => {
          if (!sourceData.name) {
            sourceData.name = `image_${Object.keys(prevSourceInfo).length}`;
          }
          return { ...prevSourceInfo, [id]: sourceData };
        });
      }
      if ('viewState' in router.query) {
        setViewState(router.query.viewState);
      }
      console.log(router.query);
    }
    load();
  }, []);
  
  return (
    <>
      <Menu />
      <Viewer />
    </>
  );
}

export default App;
