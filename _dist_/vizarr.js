import * as __SNOWPACK_ENV__ from '../_snowpack/env.js';

import React, {useEffect} from "../_snowpack/pkg/react.js";
import {useSetRecoilState} from "../_snowpack/pkg/recoil.js";
import {layerIdsState, sourceInfoState, viewerViewState} from "./state.js";
import Viewer from "./components/Viewer.js";
import Menu from "./components/Menu.js";
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
      const {default: imjoy} = await import("../_snowpack/pkg/imjoy-rpc.js");
      const api = await imjoy.setupRPC({
        name: "vizarr",
        description: "A minimal, purely client-side program for viewing Zarr-based images with Viv & ImJoy.",
        version: __SNOWPACK_ENV__.SNOWPACK_PUBLIC_PACKAGE_VERSION
      });
      const add_image = async (props) => addImage(props);
      const set_view_state = async (vs) => setViewState(vs);
      api.export({add_image, set_view_state});
    }
    if (window.self !== window.top) {
      initImjoy();
    }
  }, []);
  return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Menu, null), /* @__PURE__ */ React.createElement(Viewer, null));
}
export default App;
