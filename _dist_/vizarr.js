import __SNOWPACK_ENV__ from '../__snowpack__/env.js';
import.meta.env = __SNOWPACK_ENV__;

import React, {useEffect} from "../web_modules/react.js";
import {useSetRecoilState} from "../web_modules/recoil.js";
import {layerIdsState, sourceInfoState, viewerViewState} from "./state.js";
import Viewer2 from "./components/Viewer.js";
import Menu2 from "./components/Menu.js";
function App() {
  const setViewState = useSetRecoilState(viewerViewState);
  const setLayerIds = useSetRecoilState(layerIdsState);
  const setSourceInfo = useSetRecoilState(sourceInfoState);
  async function addImage(config) {
    const {createSourceData} = await import("./io.js");
    const id = Math.random().toString(36).slice(2);
    const sourceData = await createSourceData(config);
    setSourceInfo((prevSourceInfo) => {
      if (!sourceData.name) {
        sourceData.name = `image_${Object.keys(prevSourceInfo).length}`;
      }
      return {...prevSourceInfo, [id]: sourceData};
    });
    setLayerIds((prevIds) => [...prevIds, id]);
  }
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.has("source")) {
      const config = {};
      for (const [key, value] of params) {
        config[key] = value;
      }
      config.source = decodeURIComponent(config.source);
      addImage(config);
      const href = new URL(window.location.href);
      href.searchParams.set("source", config.source);
      const newLocation = decodeURIComponent(href.toString());
      if (window.location.href !== newLocation) {
        window.history.pushState(null, "", newLocation);
      }
    }
  }, []);
  useEffect(() => {
    async function initImjoy() {
      const {default: imjoy} = await import("../web_modules/imjoy-rpc.js");
      const api = await imjoy.setupRPC({
        name: "vizarr",
        description: "A minimal, purely client-side program for viewing Zarr-based images with Viv & ImJoy.",
        version: import.meta.env.SNOWPACK_PUBLIC_PACKAGE_VERSION
      });
      const add_image = async (props) => addImage(props);
      const set_view_state = async (vs) => setViewState(vs);
      api.export({add_image, set_view_state});
    }
    if (window.self !== window.top) {
      initImjoy();
    }
  }, []);
  return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Menu2, null), /* @__PURE__ */ React.createElement(Viewer2, null));
}
export default App;
