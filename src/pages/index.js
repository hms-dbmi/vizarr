import { useEffect } from 'react';
import { useSetRecoilState } from 'recoil';

import Viewer from '../components/Viewer'
import Menu from '../components/Menu';
import { layerIdsState, sourceInfoState, viewerViewState } from '../state';

import { openArray } from 'zarr';
import { DTYPE_VALUES } from '@hms-dbmi/viv';
import { normalizeStore, OMEZarrReader, isOMEZarr, range } from '../utils';

async function createSourceData({ 
  source,
  name,
  dimensions,
  channelDim = 'c',
  layers = [],
  colormap = '',
  opacity = 1,
}) {
  let imageData;

  const store = normalizeStore(source);

  if (await isOMEZarr(store)) {

    const reader = await OMEZarrReader.fromStore(store);
    if (!name && 'name' in reader.imageData) {
      name = reader.imageData.name;
    }
    imageData = reader.imageData;

  } else {

    if (!dimensions) {
      throw Error('Must supply dimensions if not OME-Zarr');
    }

    const channelAxis = dimensions.indexOf(channelDim);
    if (channelAxis < 0) {
      throw Error(`Channel dimension ${channelDim} not found in dimensions ${dimensions}`);
    }
    
    if (await store.containsItem('.zgroup')) {
      // Should support multiscale group but for now throw and only handle arrays.
      throw Error('Source must be a zarr.Array if not OME-Zarr; found zarr.Group.');
    }

    const z = await openArray({ store });
    
    // Internal to how viv (doesn't) handle endianness;
    // https://github.com/hubmapconsortium/vitessce-image-viewer/issues/203
    const dtype = `<${z.dtype.slice(1)}`;
    if (!(dtype in DTYPE_VALUES)) {
      throw Error('Dtype not supported, must be u1, u2, u4, or f4');
    }

    const channels = range(z.shape[channelAxis]).map(i => {
      return {
        active: true,
        color: 'FFFFFF',
        label: `channel_${i}`,
        window: {
          start: 0,
          end: dtype === "<f4" ? 1 : DTYPE_VALUES[dtype].max,
        }
      }
    });

    imageData = { 
      channels,
      rdefs: { 
        model: 'color'
      },
    };
  }

  return {
    store,
    name,
    imageData,
    dimensions,
    renderSettings: {
      layers,
      colormap, 
      opacity,
    }
  }
}

function App() {
  const setViewState = useSetRecoilState(viewerViewState);
  const setLayerIds = useSetRecoilState(layerIdsState);
  const setSourceInfo = useSetRecoilState(sourceInfoState);

  useEffect(() => {
    async function init() {
      // enable imjoy api when loaded as an iframe
      if (window.self !== window.top) {
        const { setupRPC } = await import('imjoy-rpc');
        const api = await setupRPC({ name: 'vitessce-image-viewer-plugin' });

        async function add_image(props) { 
          const id = Math.random().toString(36).slice(2);
          const sourceData = await createSourceData(props);
          setLayerIds(prevIds => [...prevIds, id]);
          setSourceInfo(prevSourceInfo => {
            if (!sourceData.name) sourceData.name = `image_${Object.keys(prevSourceInfo).length}`;
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
