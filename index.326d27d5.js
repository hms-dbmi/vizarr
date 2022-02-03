function _mergeNamespaces(f,u){return u.forEach(function(c){c&&typeof c!="string"&&!Array.isArray(c)&&Object.keys(c).forEach(function(l){if(l!=="default"&&!(l in f)){var b=Object.getOwnPropertyDescriptor(c,l);Object.defineProperty(f,l,b.get?b:{enumerable:!0,get:function(){return c[l]}})}})}),Object.freeze(f)}var imjoyRpc$1={exports:{}};(function(module,exports){(function(u,c){module.exports=c()})(window,function(){return function(f){var u={};function c(l){if(u[l])return u[l].exports;var b=u[l]={i:l,l:!1,exports:{}};return f[l].call(b.exports,b,b.exports,c),b.l=!0,b.exports}return c.m=f,c.c=u,c.d=function(l,b,w){c.o(l,b)||Object.defineProperty(l,b,{enumerable:!0,get:w})},c.r=function(l){typeof Symbol!="undefined"&&Symbol.toStringTag&&Object.defineProperty(l,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(l,"__esModule",{value:!0})},c.t=function(l,b){if(b&1&&(l=c(l)),b&8||b&4&&typeof l=="object"&&l&&l.__esModule)return l;var w=Object.create(null);if(c.r(w),Object.defineProperty(w,"default",{enumerable:!0,value:l}),b&2&&typeof l!="string")for(var p in l)c.d(w,p,function(y){return l[y]}.bind(null,p));return w},c.n=function(l){var b=l&&l.__esModule?function(){return l.default}:function(){return l};return c.d(b,"a",b),b},c.o=function(l,b){return Object.prototype.hasOwnProperty.call(l,b)},c.p="",c(c.s="./src/main.js")}({"./node_modules/worker-loader/dist/workers/InlineWorker.js":function(f,u,c){var l=window.URL||window.webkitURL;f.exports=function(b,w){try{try{var p;try{var y=window.BlobBuilder||window.WebKitBlobBuilder||window.MozBlobBuilder||window.MSBlobBuilder;p=new y,p.append(b),p=p.getBlob()}catch{p=new Blob([b])}return new Worker(l.createObjectURL(p))}catch{return new Worker("data:application/javascript,"+encodeURIComponent(b))}}catch{if(!w)throw Error("Inline worker is not supported");return new Worker(w)}}},"./package.json":function(f){f.exports=JSON.parse('{"name":"imjoy-rpc","version":"0.2.42","description":"Remote procedure calls for ImJoy.","module":"index.js","scripts":{"build":"rm -rf dist && npm run build-umd","build-umd":"webpack --config webpack.config.js --mode development && NODE_ENV=production webpack --config webpack.config.js --mode production --devtool source-map ","watch":"NODE_ENV=production webpack --watch --progress --config webpack.config.js --mode production --devtool source-map","publish-npm":"npm install && npm run build && npm publish","serve":"webpack-dev-server","stats":"webpack --profile --json > stats.json","stats-prod":"webpack --profile --json --mode production > stats-prod.json","analyze":"webpack-bundle-analyzer -p 9999 stats.json","analyze-prod":"webpack-bundle-analyzer -p 9999 stats-prod.json","clean":"rimraf dist/*","deploy":"npm run build && node deploy-site.js","format":"prettier --write \\"{src,tests}/**/**\\"","check-format":"prettier --check \\"{src,tests}/**/**\\"","test":"karma start --single-run --browsers ChromeHeadless,FirefoxHeadless karma.conf.js","test-watch":"karma start --auto-watch --browsers Chrome,FirefoxHeadless karma.conf.js --debug"},"repository":{"type":"git","url":"git+https://github.com/imjoy-team/imjoy-rpc.git"},"keywords":["imjoy","rpc"],"author":"imjoy-team <imjoy.team@gmail.com>","license":"MIT","bugs":{"url":"https://github.com/imjoy-team/imjoy-rpc/issues"},"homepage":"https://github.com/imjoy-team/imjoy-rpc","dependencies":{"socket.io-client":"^4.0.1"},"devDependencies":{"@babel/core":"^7.0.0-beta.39","@babel/plugin-syntax-dynamic-import":"^7.0.0-beta.39","@babel/polyfill":"^7.0.0-beta.39","@babel/preset-env":"^7.0.0-beta.39","@types/requirejs":"^2.1.28","babel-core":"^6.26.0","babel-eslint":"^10.1.0","babel-loader":"^8.1.0","babel-runtime":"^6.26.0","chai":"^4.2.0","clean-webpack-plugin":"^0.1.19","copy-webpack-plugin":"^5.0.5","eslint":"^6.8.0","eslint-config-prettier":"^4.2.0","eslint-loader":"^4.0.2","file-loader":"^0.11.2","fs-extra":"^0.30.0","gh-pages":"^2.0.1","html-loader":"^0.5.5","html-webpack-plugin":"^3.2.0","json-loader":"^0.5.4","karma":"^4.4.1","karma-chrome-launcher":"^3.1.0","karma-firefox-launcher":"^1.3.0","karma-mocha":"^1.3.0","karma-spec-reporter":"0.0.32","karma-webpack":"^4.0.2","lerna":"^3.8.0","lodash.debounce":"^4.0.8","mocha":"^7.1.2","postcss":"^6.0.2","prettier":"^1.6.1","rimraf":"^2.6.2","schema-utils":"^0.4.3","socket.io-client":"^2.3.0","style-loader":"^0.18.1","url-loader":"^0.5.9","webpack":"^4.0.0","webpack-bundle-analyzer":"^3.3.2","webpack-cli":"^3.1.2","webpack-dev-server":"^3.1.1","webpack-merge":"^4.1.1","workbox-webpack-plugin":"^4.3.1","worker-loader":"^2.0.0","write-file-webpack-plugin":"^4.5.1"},"eslintConfig":{"globals":{"document":true,"window":true}}}')},"./src/main.js":function(f,u,c){c.r(u),c.d(u,"waitForInitialization",function(){return e}),c.d(u,"setupRPC",function(){return n});var l=c("./src/plugin.webworker.js"),b=c.n(l),w=c("./src/pluginIframe.js"),p=c("./src/utils.js"),y=c("./src/rpc.js");c.d(u,"RPC",function(){return y.RPC}),c.d(u,"API_VERSION",function(){return y.API_VERSION});var g=c("./package.json");c.d(u,"VERSION",function(){return g.version});function j(){try{return window.self!==window.top}catch{return!0}}function a(t){if(!t.allow_execution)throw new Error("web-worker plugin can only work with allow_execution=true");const s=new b.a,d=setTimeout(function(){s.terminate(),console.warn("Plugin failed to start as a web-worker, running in an iframe instead."),Object(w.default)(t)},2e3),_=Object(p.randId)();s.addEventListener("message",function(v){let k;const E=v.data;if(E.type==="worker-ready"){s.postMessage({type:"connectRPC",config:t}),clearTimeout(d);return}else E.type==="initialized"?(E.config=Object.assign({},t,E.config),E.origin=window.location.origin,E.peer_id=_):E.type==="imjoy_remote_api_ready"?window.dispatchEvent(new CustomEvent("imjoy_remote_api_ready",{detail:null})):E.type==="cacheRequirements"&&typeof cache_requirements=="function"?cache_requirements(E.requirements):E.type==="disconnect"?s.terminate():E.__transferables__&&(k=E.__transferables__,delete E.__transferables__);parent.postMessage(E,t.target_origin||"*",k)}),window.addEventListener("message",function(v){let k;const E=v.data;E.__transferables__&&(k=E.__transferables__,delete E.__transferables__),E.peer_id===_?s.postMessage(E,k):t.debug&&console.log(`connection peer id mismatch ${E.peer_id} !== ${_}`)})}function e(t){if(!j())throw new Error("waitForInitialization (imjoy-rpc) should only run inside an iframe.");t=t||{};const s=t.target_origin||"*";if(t.credential_required&&typeof t.verify_credential!="function")throw new Error("Please also provide the `verify_credential` function with `credential_required`.");if(t.credential_required&&s==="*")throw new Error("`target_origin` was set to `*` with `credential_required=true`, there is a security risk that you may leak the credential to website from other origin. Please specify the `target_origin` explicitly.");const d=()=>{window.removeEventListener("message",v)},_=Object(p.randId)(),v=k=>{if(k.type==="message"&&(s==="*"||k.origin===s))if(k.data.type==="initialize"){d(),k.data.peer_id!==_&&console.warn(`${k.data.config&&k.data.config.name}: connection peer id mismatch ${k.data.peer_id} !== ${_}`);const E=k.data.config;s!=="*"&&(E.target_origin=s),t.credential_required?t.verify_credential(E.credential).then(P=>{if(P&&P.auth&&!P.error)E.auth=P.auth,n(E).then(()=>{console.log("ImJoy RPC loaded successfully!")});else throw new Error("Failed to verify the credentail:"+(P&&P.error))}):n(E).then(()=>{console.log("ImJoy RPC loaded successfully!")})}else throw new Error(`unrecognized message: ${k.data}`)};window.addEventListener("message",v),parent.postMessage({type:"imjoyRPCReady",config:t,peer_id:_},"*")}function n(t){if(t=t||{},!t.name)throw new Error("Please specify a name for your app.");return t=Object(p.normalizeConfig)(t),new Promise((s,d)=>{const _=v=>{const k=v.detail;t.expose_api_globally&&(window.api=k),s(k),window.removeEventListener("imjoy_remote_api_ready",_)};if(j()){if(t.type==="web-worker")try{a(t)}catch{Object(w.default)(t)}else if(["rpc-window","rpc-worker","iframe","window"].includes(t.type))Object(w.default)(t);else{console.error("Unsupported plugin type: "+t.type),d("Unsupported plugin type: "+t.type);return}window.addEventListener("imjoy_remote_api_ready",_)}else d(new Error("imjoy-rpc should only run inside an iframe."))})}},"./src/plugin.webworker.js":function(f,u,c){f.exports=function(){return c("./node_modules/worker-loader/dist/workers/InlineWorker.js")(`/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/plugin.webworker.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/plugin.webworker.js":
/*!*********************************!*\\
  !*** ./src/plugin.webworker.js ***!
  \\*********************************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _pluginCore_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./pluginCore.js */ "./src/pluginCore.js");
/* harmony import */ var _rpc_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./rpc.js */ "./src/rpc.js");
/* harmony import */ var _utils_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./utils.js */ "./src/utils.js");
/**
 * Contains the routines loaded by the plugin Worker under web-browser.
 *
 * Initializes the web environment version of the platform-dependent
 * connection object for the plugin site
 */




(function() {
  // make sure this runs inside a webworker
  if (
    typeof WorkerGlobalScope === "undefined" ||
    !self ||
    !(self instanceof WorkerGlobalScope)
  ) {
    throw new Error("This script can only loaded in a webworker");
  }
  /**
   * Connection object provided to the RPC constructor,
   * plugin site implementation for the web-based environment.
   * Global will be then cleared to prevent exposure into the
   * Worker, so we put this local connection object into a closure
   */
  class Connection extends _utils_js__WEBPACK_IMPORTED_MODULE_2__["MessageEmitter"] {
    constructor(config) {
      super(config && config.debug);
      this.config = config || {};
    }
    connect() {
      self.addEventListener("message", e => {
        this._fire(e.data.type, e.data);
      });
      this.emit({
        type: "initialized",
        config: this.config
      });
    }
    disconnect() {
      this._fire("beforeDisconnect");
      self.close();
      this._fire("disconnected");
    }
    emit(data) {
      let transferables = undefined;
      if (data.__transferables__) {
        transferables = data.__transferables__;
        delete data.__transferables__;
      }
      self.postMessage(data, transferables);
    }
    async execute(code) {
      if (code.type === "requirements") {
        try {
          if (
            code.requirements &&
            (Array.isArray(code.requirements) ||
              typeof code.requirements === "string")
          ) {
            try {
              if (!Array.isArray(code.requirements)) {
                code.requirements = [code.requirements];
              }
              for (var i = 0; i < code.requirements.length; i++) {
                if (
                  code.requirements[i].toLowerCase().endsWith(".css") ||
                  code.requirements[i].startsWith("css:")
                ) {
                  throw "unable to import css in a webworker";
                } else if (
                  code.requirements[i].toLowerCase().endsWith(".js") ||
                  code.requirements[i].startsWith("js:")
                ) {
                  if (code.requirements[i].startsWith("js:")) {
                    code.requirements[i] = code.requirements[i].slice(3);
                  }
                  importScripts(code.requirements[i]);
                } else if (code.requirements[i].startsWith("http")) {
                  importScripts(code.requirements[i]);
                } else if (code.requirements[i].startsWith("cache:")) {
                  //ignore cache
                } else {
                  console.log(
                    "Unprocessed requirements url: " + code.requirements[i]
                  );
                }
              }
            } catch (e) {
              throw "failed to import required scripts: " +
                code.requirements.toString();
            }
          }
        } catch (e) {
          throw e;
        }
      } else if (code.type === "script") {
        try {
          if (
            code.requirements &&
            (Array.isArray(code.requirements) ||
              typeof code.requirements === "string")
          ) {
            try {
              if (Array.isArray(code.requirements)) {
                for (let i = 0; i < code.requirements.length; i++) {
                  importScripts(code.requirements[i]);
                }
              } else {
                importScripts(code.requirements);
              }
            } catch (e) {
              throw "failed to import required scripts: " +
                code.requirements.toString();
            }
          }
          eval(code.content);
        } catch (e) {
          console.error(e.message, e.stack);
          throw e;
        }
      } else {
        throw "unsupported code type.";
      }
      if (code.type === "requirements") {
        self.postMessage({
          type: "cacheRequirements",
          requirements: code.requirements
        });
      }
    }
  }
  const config = {
    type: "web-worker",
    dedicated_thread: true,
    allow_execution: true,
    lang: "javascript",
    api_version: _rpc_js__WEBPACK_IMPORTED_MODULE_1__["API_VERSION"]
  };
  const conn = new Connection(config);
  conn.on("connectRPC", data => {
    Object(_pluginCore_js__WEBPACK_IMPORTED_MODULE_0__["connectRPC"])(conn, Object.assign(data.config, config));
  });
  conn.connect();
  self.postMessage({
    type: "worker-ready"
  });
})();


/***/ }),

/***/ "./src/pluginCore.js":
/*!***************************!*\\
  !*** ./src/pluginCore.js ***!
  \\***************************/
/*! exports provided: connectRPC */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "connectRPC", function() { return connectRPC; });
/* harmony import */ var _rpc_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./rpc.js */ "./src/rpc.js");
/**
 * Core plugin script loaded into the plugin process/thread.
 *
 * Initializes the plugin-site API global methods.
 */

function connectRPC(connection, config) {
  config = config || {};
  const codecs = {};
  const rpc = new _rpc_js__WEBPACK_IMPORTED_MODULE_0__["RPC"](connection, config, codecs);
  rpc.on("getInterface", function () {
    launchConnected();
  });
  rpc.on("remoteReady", function () {
    const api = rpc.getRemote() || {};

    api.registerCodec = function (config) {
      if (!config["name"] || !config["encoder"] && !config["decoder"]) {
        throw new Error("Invalid codec format, please make sure you provide a name, type, encoder and decoder.");
      } else {
        if (config.type) {
          for (let k of Object.keys(codecs)) {
            if (codecs[k].type === config.type || k === config.name) {
              delete codecs[k];
              console.warn("Remove duplicated codec: " + k);
            }
          }
        }

        codecs[config["name"]] = config;
      }
    };

    api.init = function (config) {
      // register a minimal plugin api
      rpc.setInterface({
        setup() {}

      }, config);
    };

    api.disposeObject = function (obj) {
      rpc.disposeObject(obj);
    };

    api.export = function (_interface, config) {
      rpc.setInterface(_interface, config);
    };

    api.onLoad = function (handler) {
      handler = checkHandler(handler);

      if (connected) {
        handler();
      } else {
        connectedHandlers.push(handler);
      }
    };

    api.dispose = function (_interface) {
      rpc.disconnect();
    };

    if (typeof WorkerGlobalScope !== "undefined" && self instanceof WorkerGlobalScope) {
      self.api = api;
      self.postMessage({
        type: "imjoy_remote_api_ready"
      });
    } else if (typeof window) {
      window.dispatchEvent(new CustomEvent("imjoy_remote_api_ready", {
        detail: api
      }));
    }
  });
  let connected = false;
  const connectedHandlers = [];

  const launchConnected = function () {
    if (!connected) {
      connected = true;
      let handler;

      while (handler = connectedHandlers.pop()) {
        handler();
      }
    }
  };

  const checkHandler = function (handler) {
    const type = typeof handler;

    if (type !== "function") {
      const msg = "A function may only be subsribed to the event, " + type + " was provided instead";
      throw new Error(msg);
    }

    return handler;
  };

  return rpc;
}

/***/ }),

/***/ "./src/rpc.js":
/*!********************!*\\
  !*** ./src/rpc.js ***!
  \\********************/
/*! exports provided: API_VERSION, RPC */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "API_VERSION", function() { return API_VERSION; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "RPC", function() { return RPC; });
/* harmony import */ var _utils_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./utils.js */ "./src/utils.js");
/**
 * Contains the RPC object used both by the application
 * site, and by each plugin
 */

const API_VERSION = "0.2.3";
const ArrayBufferView = Object.getPrototypeOf(Object.getPrototypeOf(new Uint8Array())).constructor;

function _appendBuffer(buffer1, buffer2) {
  const tmp = new Uint8Array(buffer1.byteLength + buffer2.byteLength);
  tmp.set(new Uint8Array(buffer1), 0);
  tmp.set(new Uint8Array(buffer2), buffer1.byteLength);
  return tmp.buffer;
}

function indexObject(obj, is) {
  if (!is) throw new Error("undefined index");
  if (typeof is === "string") return indexObject(obj, is.split("."));else if (is.length === 0) return obj;else return indexObject(obj[is[0]], is.slice(1));
}
/**
 * RPC object represents a single site in the
 * communication protocol between the application and the plugin
 *
 * @param {Object} connection a special object allowing to send
 * and receive messages from the opposite site (basically it
 * should only provide send() and onMessage() methods)
 */


class RPC extends _utils_js__WEBPACK_IMPORTED_MODULE_0__["MessageEmitter"] {
  constructor(connection, config, codecs) {
    super(config && config.debug);
    this._connection = connection;
    this.config = config || {};
    this._codecs = codecs || {};
    this._object_store = {};
    this._method_weakmap = new WeakMap();
    this._object_weakmap = new WeakMap();
    this._local_api = null; // make sure there is an execute function

    const name = this.config.name;

    this._connection.execute = this._connection.execute || function () {
      throw new Error(\`connection.execute not implemented (in "\${name}")\`);
    };

    this._store = new ReferenceStore();
    this._method_refs = new ReferenceStore();

    this._method_refs.onReady(() => {
      this._fire("remoteIdle");
    });

    this._method_refs.onBusy(() => {
      this._fire("remoteBusy");
    });

    this._setupMessageHanlders();
  }

  init() {
    this._connection.emit({
      type: "initialized",
      config: this.config,
      peer_id: this._connection.peer_id
    });
  }

  setConfig(config) {
    if (config) for (const k of Object.keys(config)) {
      this.config[k] = config[k];
    }
  }
  /**
   * Set a handler to be called when received a responce from the
   * remote site reporting that the previously provided interface
   * has been successfully set as remote for that site
   *
   * @param {Function} handler
   */


  getRemoteCallStack() {
    return this._method_refs.getStack();
  }
  /**
   * @returns {Object} set of remote interface methods
   */


  getRemote() {
    return this._remote_interface;
  }
  /**
   * Sets the interface of this site making it available to the
   * remote site by sending a message with a set of methods names
   *
   * @param {Object} _interface to set
   */


  setInterface(_interface, config) {
    config = config || {};
    this.config.name = config.name || this.config.name;
    this.config.description = config.description || this.config.description;

    if (this.config.forwarding_functions) {
      for (let func_name of this.config.forwarding_functions) {
        const _remote = this._remote_interface;

        if (_remote[func_name]) {
          if (_interface.constructor === Object) {
            if (!_interface[func_name]) {
              _interface[func_name] = (...args) => {
                _remote[func_name](...args);
              };
            }
          } else if (_interface.constructor.constructor === Function) {
            if (!_interface.constructor.prototype[func_name]) {
              _interface.constructor.prototype[func_name] = (...args) => {
                _remote[func_name](...args);
              };
            }
          }
        }
      }
    }

    this._local_api = _interface;

    this._fire("interfaceAvailable");
  }
  /**
   * Sends the actual interface to the remote site upon it was
   * updated or by a special request of the remote site
   */


  sendInterface() {
    if (!this._local_api) {
      throw new Error("interface is not set.");
    }

    this._encode(this._local_api, true).then(api => {
      this._connection.emit({
        type: "setInterface",
        api: api
      });
    });
  }

  _disposeObject(objectId) {
    if (this._object_store[objectId]) {
      delete this._object_store[objectId];
    } else {
      throw new Error(\`Object (id=\${objectId}) not found.\`);
    }
  }

  disposeObject(obj) {
    return new Promise((resolve, reject) => {
      if (this._object_weakmap.has(obj)) {
        const objectId = this._object_weakmap.get(obj);

        this._connection.once("disposed", data => {
          if (data.error) reject(new Error(data.error));else resolve();
        });

        this._connection.emit({
          type: "disposeObject",
          object_id: objectId
        });
      } else {
        throw new Error("Invalid object");
      }
    });
  }
  /**
   * Handles a message from the remote site
   */


  _setupMessageHanlders() {
    this._connection.on("init", this.init);

    this._connection.on("execute", data => {
      Promise.resolve(this._connection.execute(data.code)).then(() => {
        this._connection.emit({
          type: "executed"
        });
      }).catch(e => {
        console.error(e);

        this._connection.emit({
          type: "executed",
          error: String(e)
        });
      });
    });

    this._connection.on("method", async data => {
      let resolve, reject, method, method_this, args, result;

      try {
        if (data.promise) {
          [resolve, reject] = await this._unwrap(data.promise, false);
        }

        const _interface = this._object_store[data.object_id];
        method = indexObject(_interface, data.name);

        if (data.name.includes(".")) {
          const tmp = data.name.split(".");
          const intf_index = tmp.slice(0, tmp.length - 1).join(".");
          method_this = indexObject(_interface, intf_index);
        } else {
          method_this = _interface;
        }

        args = await this._unwrap(data.args, true);

        if (data.promise) {
          result = method.apply(method_this, args);

          if (result instanceof Promise || method.constructor && method.constructor.name === "AsyncFunction") {
            result.then(resolve).catch(reject);
          } else {
            resolve(result);
          }
        } else {
          method.apply(method_this, args);
        }
      } catch (err) {
        console.error(this.config.name, err);

        if (reject) {
          reject(err);
        }
      }
    });

    this._connection.on("callback", async data => {
      let resolve, reject, method, args, result;

      try {
        if (data.promise) {
          [resolve, reject] = await this._unwrap(data.promise, false);
        }

        if (data.promise) {
          method = this._store.fetch(data.id);
          args = await this._unwrap(data.args, true);

          if (!method) {
            throw new Error("Callback function can only called once, if you want to call a function for multiple times, please make it as a plugin api function. See https://imjoy.io/docs for more details.");
          }

          result = method.apply(null, args);

          if (result instanceof Promise || method.constructor && method.constructor.name === "AsyncFunction") {
            result.then(resolve).catch(reject);
          } else {
            resolve(result);
          }
        } else {
          method = this._store.fetch(data.id);
          args = await this._unwrap(data.args, true);

          if (!method) {
            throw new Error("Please notice that callback function can only called once, if you want to call a function for multiple times, please make it as a plugin api function. See https://imjoy.io/docs for more details.");
          }

          method.apply(null, args);
        }
      } catch (err) {
        console.error(this.config.name, err);

        if (reject) {
          reject(err);
        }
      }
    });

    this._connection.on("disposeObject", data => {
      try {
        this._disposeObject(data.object_id);

        this._connection.emit({
          type: "disposed"
        });
      } catch (e) {
        console.error(e);

        this._connection.emit({
          type: "disposed",
          error: String(e)
        });
      }
    });

    this._connection.on("setInterface", data => {
      this._setRemoteInterface(data.api);
    });

    this._connection.on("getInterface", () => {
      this._fire("getInterface");

      if (this._local_api) {
        this.sendInterface();
      } else {
        this.once("interfaceAvailable", () => {
          this.sendInterface();
        });
      }
    });

    this._connection.on("interfaceSetAsRemote", () => {
      this._fire("interfaceSetAsRemote");
    });

    this._connection.on("disconnect", () => {
      this._fire("beforeDisconnect");

      this._connection.disconnect();

      this._fire("disconnected");
    });
  }
  /**
   * Sends a requests to the remote site asking it to provide its
   * current interface
   */


  requestRemote() {
    this._connection.emit({
      type: "getInterface"
    });
  }

  _ndarray(typedArray, shape, dtype) {
    const _dtype = Object(_utils_js__WEBPACK_IMPORTED_MODULE_0__["typedArrayToDtype"])(typedArray);

    if (dtype && dtype !== _dtype) {
      throw "dtype doesn't match the type of the array: " + _dtype + " != " + dtype;
    }

    shape = shape || [typedArray.length];
    return {
      _rtype: "ndarray",
      _rvalue: typedArray.buffer,
      _rshape: shape,
      _rdtype: _dtype
    };
  }
  /**
   * Sets the new remote interface provided by the other site
   *
   * @param {Array} names list of function names
   */


  _setRemoteInterface(api) {
    this._decode(api).then(intf => {
      // update existing interface instead of recreating it
      if (this._remote_interface) {
        Object.assign(this._remote_interface, intf);
      } else this._remote_interface = intf;

      this._fire("remoteReady");

      this._reportRemoteSet();
    });
  }
  /**
   * Generates the wrapped function corresponding to a single remote
   * method. When the generated function is called, it will send the
   * corresponding message to the remote site asking it to execute
   * the particular method of its interface
   *
   * @param {String} name of the remote method
   *
   * @returns {Function} wrapped remote method
   */


  _genRemoteMethod(targetId, name, objectId) {
    const me = this;

    const remoteMethod = function () {
      return new Promise(async (resolve, reject) => {
        let id = null;

        try {
          id = me._method_refs.put(objectId ? objectId + "/" + name : name);

          const wrapped_resolve = function () {
            if (id !== null) me._method_refs.fetch(id);
            return resolve.apply(this, arguments);
          };

          const wrapped_reject = function () {
            if (id !== null) me._method_refs.fetch(id);
            return reject.apply(this, arguments);
          };

          const encodedPromise = await me._wrap([wrapped_resolve, wrapped_reject]); // store the key id for removing them from the reference store together

          wrapped_resolve.__promise_pair = encodedPromise[1]._rvalue;
          wrapped_reject.__promise_pair = encodedPromise[0]._rvalue;
          let args = Array.prototype.slice.call(arguments);

          if (name === "register" || name === "registerService" || name === "export" || name === "on") {
            args = await me._wrap(args, true);
          } else {
            args = await me._wrap(args);
          }

          const transferables = args.__transferables__;
          if (transferables) delete args.__transferables__;

          me._connection.emit({
            type: "method",
            target_id: targetId,
            name: name,
            object_id: objectId,
            args: args,
            promise: encodedPromise
          }, transferables);
        } catch (e) {
          if (id) me._method_refs.fetch(id);
          reject(\`Failed to exectue remote method (interface: \${objectId || me.id}, method: \${name}), error: \${e}\`);
        }
      });
    };

    remoteMethod.__remote_method = true;
    return remoteMethod;
  }
  /**
   * Sends a responce reporting that interface just provided by the
   * remote site was successfully set by this site as remote
   */


  _reportRemoteSet() {
    this._connection.emit({
      type: "interfaceSetAsRemote"
    });
  }
  /**
   * Prepares the provided set of remote method arguments for
   * sending to the remote site, replaces all the callbacks with
   * identifiers
   *
   * @param {Array} args to wrap
   *
   * @returns {Array} wrapped arguments
   */


  async _encode(aObject, asInterface, objectId) {
    const aType = typeof aObject;

    if (aType === "number" || aType === "string" || aType === "boolean" || aObject === null || aObject === undefined || aObject instanceof ArrayBuffer) {
      return aObject;
    }

    let bObject;

    if (typeof aObject === "function") {
      if (asInterface) {
        if (!objectId) throw new Error("objectId is not specified.");
        bObject = {
          _rtype: "interface",
          _rtarget_id: this._connection.peer_id,
          _rintf: objectId,
          _rvalue: asInterface
        };

        this._method_weakmap.set(aObject, bObject);
      } else if (this._method_weakmap.has(aObject)) {
        bObject = this._method_weakmap.get(aObject);
      } else {
        const cid = this._store.put(aObject);

        bObject = {
          _rtype: "callback",
          _rtarget_id: this._connection.peer_id,
          _rname: aObject.constructor && aObject.constructor.name || cid,
          _rvalue: cid
        };
      }

      return bObject;
    } // skip if already encoded


    if (aObject.constructor instanceof Object && aObject._rtype) {
      // make sure the interface functions are encoded
      if (aObject._rintf) {
        const temp = aObject._rtype;
        delete aObject._rtype;
        bObject = await this._encode(aObject, asInterface, objectId);
        bObject._rtype = temp;
      } else {
        bObject = aObject;
      }

      return bObject;
    }

    const transferables = [];
    const _transfer = aObject._transfer;
    const isarray = Array.isArray(aObject);

    for (let tp of Object.keys(this._codecs)) {
      const codec = this._codecs[tp];

      if (codec.encoder && aObject instanceof codec.type) {
        // TODO: what if multiple encoders found
        let encodedObj = await Promise.resolve(codec.encoder(aObject));
        if (encodedObj && !encodedObj._rtype) encodedObj._rtype = codec.name; // encode the functions in the interface object

        if (encodedObj && encodedObj._rintf) {
          const temp = encodedObj._rtype;
          delete encodedObj._rtype;
          encodedObj = await this._encode(encodedObj, asInterface, objectId);
          encodedObj._rtype = temp;
        }

        bObject = encodedObj;
        return bObject;
      }
    }

    if (
    /*global tf*/
    typeof tf !== "undefined" && tf.Tensor && aObject instanceof tf.Tensor) {
      const v_buffer = aObject.dataSync();

      if (aObject._transfer || _transfer) {
        transferables.push(v_buffer.buffer);
        delete aObject._transfer;
      }

      bObject = {
        _rtype: "ndarray",
        _rvalue: v_buffer.buffer,
        _rshape: aObject.shape,
        _rdtype: aObject.dtype
      };
    } else if (
    /*global nj*/
    typeof nj !== "undefined" && nj.NdArray && aObject instanceof nj.NdArray) {
      const dtype = Object(_utils_js__WEBPACK_IMPORTED_MODULE_0__["typedArrayToDtype"])(aObject.selection.data);

      if (aObject._transfer || _transfer) {
        transferables.push(aObject.selection.data.buffer);
        delete aObject._transfer;
      }

      bObject = {
        _rtype: "ndarray",
        _rvalue: aObject.selection.data.buffer,
        _rshape: aObject.shape,
        _rdtype: dtype
      };
    } else if (aObject instanceof Error) {
      console.error(aObject);
      bObject = {
        _rtype: "error",
        _rvalue: aObject.toString()
      };
    } else if (typeof File !== "undefined" && aObject instanceof File) {
      bObject = {
        _rtype: "file",
        _rvalue: aObject,
        _rpath: aObject._path || aObject.webkitRelativePath
      };
    } // send objects supported by structure clone algorithm
    // https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm
    else if (aObject !== Object(aObject) || aObject instanceof Boolean || aObject instanceof String || aObject instanceof Date || aObject instanceof RegExp || aObject instanceof ImageData || typeof FileList !== "undefined" && aObject instanceof FileList || typeof FileSystemDirectoryHandle !== "undefined" && aObject instanceof FileSystemDirectoryHandle || typeof FileSystemFileHandle !== "undefined" && aObject instanceof FileSystemFileHandle || typeof FileSystemHandle !== "undefined" && aObject instanceof FileSystemHandle || typeof FileSystemWritableFileStream !== "undefined" && aObject instanceof FileSystemWritableFileStream) {
        bObject = aObject; // TODO: avoid object such as DynamicPlugin instance.
      } else if (typeof File !== "undefined" && aObject instanceof File) {
        bObject = {
          _rtype: "file",
          _rname: aObject.name,
          _rmime: aObject.type,
          _rvalue: aObject,
          _rpath: aObject._path || aObject.webkitRelativePath
        };
      } else if (aObject instanceof Blob) {
        bObject = {
          _rtype: "blob",
          _rvalue: aObject
        };
      } else if (aObject instanceof ArrayBufferView) {
        if (aObject._transfer || _transfer) {
          transferables.push(aObject.buffer);
          delete aObject._transfer;
        }

        const dtype = Object(_utils_js__WEBPACK_IMPORTED_MODULE_0__["typedArrayToDtype"])(aObject);
        bObject = {
          _rtype: "typedarray",
          _rvalue: aObject.buffer,
          _rdtype: dtype
        };
      } else if (aObject instanceof DataView) {
        if (aObject._transfer || _transfer) {
          transferables.push(aObject.buffer);
          delete aObject._transfer;
        }

        bObject = {
          _rtype: "memoryview",
          _rvalue: aObject.buffer
        };
      } else if (aObject instanceof Set) {
        bObject = {
          _rtype: "set",
          _rvalue: await this._encode(Array.from(aObject), asInterface)
        };
      } else if (aObject instanceof Map) {
        bObject = {
          _rtype: "orderedmap",
          _rvalue: await this._encode(Array.from(aObject), asInterface)
        };
      } else if (aObject.constructor instanceof Object || Array.isArray(aObject)) {
        bObject = isarray ? [] : {};
        let keys; // an object/array

        if (aObject.constructor === Object || Array.isArray(aObject)) {
          keys = Object.keys(aObject);
        } // a class
        else if (aObject.constructor === Function) {
            throw new Error("Please instantiate the class before exportting it.");
          } // instance of a class
          else if (aObject.constructor.constructor === Function) {
              keys = Object.getOwnPropertyNames(Object.getPrototypeOf(aObject)).concat(Object.keys(aObject)); // TODO: use a proxy object to represent the actual object
              // always encode class instance as interface

              asInterface = true;
            } else {
              throw Error("Unsupported interface type");
            }

        let hasFunction = false; // encode interfaces

        if (aObject._rintf || asInterface) {
          if (!objectId) {
            objectId = Object(_utils_js__WEBPACK_IMPORTED_MODULE_0__["randId"])();
            this._object_store[objectId] = aObject;
          }

          for (let k of keys) {
            if (k === "constructor") continue;

            if (k.startsWith("_")) {
              continue;
            }

            bObject[k] = await this._encode(aObject[k], typeof asInterface === "string" ? asInterface + "." + k : k, objectId);

            if (typeof aObject[k] === "function") {
              hasFunction = true;
            }
          } // object id for dispose the object remotely


          if (hasFunction) bObject._rintf = objectId; // remove interface when closed

          if (aObject.on && typeof aObject.on === "function") {
            aObject.on("close", () => {
              delete this._object_store[objectId];
            });
          }
        } else {
          for (let k of keys) {
            if (["hasOwnProperty", "constructor"].includes(k)) continue;
            bObject[k] = await this._encode(aObject[k]);
          }
        } // for example, browserFS object

      } else if (typeof aObject === "object") {
        const keys = Object.getOwnPropertyNames(Object.getPrototypeOf(aObject)).concat(Object.keys(aObject));
        const objectId = Object(_utils_js__WEBPACK_IMPORTED_MODULE_0__["randId"])();

        for (let k of keys) {
          if (["hasOwnProperty", "constructor"].includes(k)) continue; // encode as interface

          bObject[k] = await this._encode(aObject[k], k, bObject);
        } // object id, used for dispose the object


        bObject._rintf = objectId;
      } else {
        throw "imjoy-rpc: Unsupported data type:" + aObject;
      }

    if (transferables.length > 0) {
      bObject.__transferables__ = transferables;
    }

    if (!bObject) {
      throw new Error("Failed to encode object");
    }

    return bObject;
  }

  async _decode(aObject, withPromise) {
    if (!aObject) {
      return aObject;
    }

    let bObject;

    if (aObject["_rtype"]) {
      if (this._codecs[aObject._rtype] && this._codecs[aObject._rtype].decoder) {
        if (aObject._rintf) {
          const temp = aObject._rtype;
          delete aObject._rtype;
          aObject = await this._decode(aObject, withPromise);
          aObject._rtype = temp;
        }

        bObject = await Promise.resolve(this._codecs[aObject._rtype].decoder(aObject));
      } else if (aObject._rtype === "callback") {
        bObject = this._genRemoteCallback(aObject._rtarget_id, aObject._rvalue, withPromise);
      } else if (aObject._rtype === "interface") {
        bObject = this._genRemoteMethod(aObject._rtarget_id, aObject._rvalue, aObject._rintf);
      } else if (aObject._rtype === "ndarray") {
        /*global nj tf*/
        //create build array/tensor if used in the plugin
        if (typeof nj !== "undefined" && nj.array) {
          if (Array.isArray(aObject._rvalue)) {
            aObject._rvalue = aObject._rvalue.reduce(_appendBuffer);
          }

          bObject = nj.array(new Uint8(aObject._rvalue), aObject._rdtype).reshape(aObject._rshape);
        } else if (typeof tf !== "undefined" && tf.Tensor) {
          if (Array.isArray(aObject._rvalue)) {
            aObject._rvalue = aObject._rvalue.reduce(_appendBuffer);
          }

          const arraytype = _utils_js__WEBPACK_IMPORTED_MODULE_0__["dtypeToTypedArray"][aObject._rdtype];
          bObject = tf.tensor(new arraytype(aObject._rvalue), aObject._rshape, aObject._rdtype);
        } else {
          //keep it as regular if transfered to the main app
          bObject = aObject;
        }
      } else if (aObject._rtype === "error") {
        bObject = new Error(aObject._rvalue);
      } else if (aObject._rtype === "file") {
        if (aObject._rvalue instanceof File) {
          bObject = aObject._rvalue; //patch _path

          bObject._path = aObject._rpath;
        } else {
          bObject = new File([aObject._rvalue], aObject._rname, {
            type: aObject._rmime
          });
          bObject._path = aObject._rpath;
        }
      } else if (aObject._rtype === "typedarray") {
        const arraytype = _utils_js__WEBPACK_IMPORTED_MODULE_0__["dtypeToTypedArray"][aObject._rdtype];
        if (!arraytype) throw new Error("unsupported dtype: " + aObject._rdtype);
        bObject = new arraytype(aObject._rvalue);
      } else if (aObject._rtype === "memoryview") {
        bObject = new DataView(aObject._rvalue);
      } else if (aObject._rtype === "blob") {
        if (aObject._rvalue instanceof Blob) {
          bObject = aObject._rvalue;
        } else {
          bObject = new Blob([aObject._rvalue], {
            type: aObject._rmime
          });
        }
      } else if (aObject._rtype === "orderedmap") {
        bObject = new Map((await this._decode(aObject._rvalue, withPromise)));
      } else if (aObject._rtype === "set") {
        bObject = new Set((await this._decode(aObject._rvalue, withPromise)));
      } else {
        // make sure all the interface functions are decoded
        if (aObject._rintf) {
          const temp = aObject._rtype;
          delete aObject._rtype;
          bObject = await this._decode(aObject, withPromise);
          bObject._rtype = temp;
        } else bObject = aObject;
      }
    } else if (aObject.constructor === Object || Array.isArray(aObject)) {
      const isarray = Array.isArray(aObject);
      bObject = isarray ? [] : {};

      for (let k of Object.keys(aObject)) {
        if (isarray || aObject.hasOwnProperty(k)) {
          const v = aObject[k];
          bObject[k] = await this._decode(v, withPromise);
        }
      }
    } else {
      bObject = aObject;
    }

    if (bObject === undefined) {
      throw new Error("Failed to decode object");
    } // store the object id for dispose


    if (aObject._rintf) {
      this._object_weakmap.set(bObject, aObject._rintf);
    }

    return bObject;
  }

  async _wrap(args, asInterface) {
    return await this._encode(args, asInterface);
  }
  /**
   * Unwraps the set of arguments delivered from the remote site,
   * replaces all callback identifiers with a function which will
   * initiate sending that callback identifier back to other site
   *
   * @param {Object} args to unwrap
   *
   * @param {Boolean} withPromise is true means this the callback should contain a promise
   *
   * @returns {Array} unwrapped args
   */


  async _unwrap(args, withPromise) {
    return await this._decode(args, withPromise);
  }
  /**
   * Generates the wrapped function corresponding to a single remote
   * callback. When the generated function is called, it will send
   * the corresponding message to the remote site asking it to
   * execute the particular callback previously saved during a call
   * by the remote site a method from the interface of this site
   *
   * @param {Number} id of the remote callback to execute
   * @param {Number} argNum argument index of the callback
   * @param {Boolean} withPromise is true means this the callback should contain a promise
   *
   * @returns {Function} wrapped remote callback
   */


  _genRemoteCallback(targetId, cid, withPromise) {
    const me = this;
    let remoteCallback;

    if (withPromise) {
      remoteCallback = function () {
        return new Promise(async (resolve, reject) => {
          const args = await me._wrap(Array.prototype.slice.call(arguments));
          const transferables = args.__transferables__;
          if (transferables) delete args.__transferables__;
          const encodedPromise = await me._wrap([resolve, reject]); // store the key id for removing them from the reference store together

          resolve.__promise_pair = encodedPromise[1]._rvalue;
          reject.__promise_pair = encodedPromise[0]._rvalue;

          try {
            me._connection.emit({
              type: "callback",
              target_id: targetId,
              id: cid,
              args: args,
              promise: encodedPromise
            }, transferables);
          } catch (e) {
            reject(\`Failed to exectue remote callback ( id: \${cid}).\`);
          }
        });
      };

      return remoteCallback;
    } else {
      remoteCallback = async function () {
        const args = await me._wrap(Array.prototype.slice.call(arguments));
        const transferables = args.__transferables__;
        if (transferables) delete args.__transferables__;
        return me._connection.emit({
          type: "callback",
          target_id: targetId,
          id: cid,
          args: args
        }, transferables);
      };

      return remoteCallback;
    }
  }

  reset() {
    this._event_handlers = {};
    this._once_handlers = {};
    this._remote_interface = null;
    this._object_store = {};
    this._method_weakmap = new WeakMap();
    this._object_weakmap = new WeakMap();
    this._local_api = null;
    this._store = new ReferenceStore();
    this._method_refs = new ReferenceStore();
  }
  /**
   * Sends the notification message and breaks the connection
   */


  disconnect() {
    this._connection.emit({
      type: "disconnect"
    });

    this.reset();
    setTimeout(() => {
      this._connection.disconnect();
    }, 2000);
  }

}
/**
 * ReferenceStore is a special object which stores other objects
 * and provides the references (number) instead. This reference
 * may then be sent over a json-based communication channel (IPC
 * to another Node.js process or a message to the Worker). Other
 * site may then provide the reference in the responce message
 * implying the given object should be activated.
 *
 * Primary usage for the ReferenceStore is a storage for the
 * callbacks, which therefore makes it possible to initiate a
 * callback execution by the opposite site (which normally cannot
 * directly execute functions over the communication channel).
 *
 * Each stored object can only be fetched once and is not
 * available for the second time. Each stored object must be
 * fetched, since otherwise it will remain stored forever and
 * consume memory.
 *
 * Stored object indeces are simply the numbers, which are however
 * released along with the objects, and are later reused again (in
 * order to postpone the overflow, which should not likely happen,
 * but anyway).
 */

class ReferenceStore {
  constructor() {
    this._store = {}; // stored object

    this._indices = [0]; // smallest available indices

    this._readyHandler = function () {};

    this._busyHandler = function () {};

    this._readyHandler();
  }
  /**
   * call handler when the store is empty
   *
   * @param {FUNCTION} id of a handler
   */


  onReady(readyHandler) {
    this._readyHandler = readyHandler || function () {};
  }
  /**
   * call handler when the store is not empty
   *
   * @param {FUNCTION} id of a handler
   */


  onBusy(busyHandler) {
    this._busyHandler = busyHandler || function () {};
  }
  /**
   * get the length of the store
   *
   */


  getStack() {
    return Object.keys(this._store).length;
  }
  /**
   * @function _genId() generates the new reference id
   *
   * @returns {Number} smallest available id and reserves it
   */


  _genId() {
    let id;

    if (this._indices.length === 1) {
      id = this._indices[0]++;
    } else {
      id = this._indices.shift();
    }

    return id;
  }
  /**
   * Releases the given reference id so that it will be available by
   * another object stored
   *
   * @param {Number} id to release
   */


  _releaseId(id) {
    for (let i = 0; i < this._indices.length; i++) {
      if (id < this._indices[i]) {
        this._indices.splice(i, 0, id);

        break;
      }
    } // cleaning-up the sequence tail


    for (let i = this._indices.length - 1; i >= 0; i--) {
      if (this._indices[i] - 1 === this._indices[i - 1]) {
        this._indices.pop();
      } else {
        break;
      }
    }
  }
  /**
   * Stores the given object and returns the refernce id instead
   *
   * @param {Object} obj to store
   *
   * @returns {Number} reference id of the stored object
   */


  put(obj) {
    if (this._busyHandler && Object.keys(this._store).length === 0) {
      this._busyHandler();
    }

    const id = this._genId();

    this._store[id] = obj;
    return id;
  }
  /**
   * Retrieves previously stored object and releases its reference
   *
   * @param {Number} id of an object to retrieve
   */


  fetch(id) {
    const obj = this._store[id];

    if (obj && !obj.__remote_method) {
      delete this._store[id];

      this._releaseId(id);

      if (this._readyHandler && Object.keys(this._store).length === 0) {
        this._readyHandler();
      }
    }

    if (obj && obj.__promise_pair) {
      this.fetch(obj.__promise_pair);
    }

    return obj;
  }

}

/***/ }),

/***/ "./src/utils.js":
/*!**********************!*\\
  !*** ./src/utils.js ***!
  \\**********************/
/*! exports provided: randId, dtypeToTypedArray, normalizeConfig, typedArrayToDtypeMapping, typedArrayToDtype, cacheRequirements, setupServiceWorker, urlJoin, MessageEmitter */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "randId", function() { return randId; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "dtypeToTypedArray", function() { return dtypeToTypedArray; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "normalizeConfig", function() { return normalizeConfig; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "typedArrayToDtypeMapping", function() { return typedArrayToDtypeMapping; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "typedArrayToDtype", function() { return typedArrayToDtype; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "cacheRequirements", function() { return cacheRequirements; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "setupServiceWorker", function() { return setupServiceWorker; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "urlJoin", function() { return urlJoin; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "MessageEmitter", function() { return MessageEmitter; });
function randId() {
  return Math.random().toString(36).substr(2, 10) + new Date().getTime();
}
const dtypeToTypedArray = {
  int8: Int8Array,
  int16: Int16Array,
  int32: Int32Array,
  uint8: Uint8Array,
  uint16: Uint16Array,
  uint32: Uint32Array,
  float32: Float32Array,
  float64: Float64Array,
  array: Array
};
function normalizeConfig(config) {
  config.version = config.version || "0.1.0";
  config.description = config.description || \`[TODO: add description for \${config.name} ]\`;
  config.type = config.type || "rpc-window";
  config.id = config.id || randId();
  config.allow_execution = config.allow_execution || false;

  if (config.enable_service_worker) {
    setupServiceWorker(config.base_url, config.target_origin, config.cache_requirements);
  }

  if (config.cache_requirements) {
    delete config.cache_requirements;
  } // remove functions


  config = Object.keys(config).reduce((p, c) => {
    if (typeof config[c] !== "function") p[c] = config[c];
    return p;
  }, {});
  return config;
}
const typedArrayToDtypeMapping = {
  Int8Array: "int8",
  Int16Array: "int16",
  Int32Array: "int32",
  Uint8Array: "uint8",
  Uint16Array: "uint16",
  Uint32Array: "uint32",
  Float32Array: "float32",
  Float64Array: "float64",
  Array: "array"
};
const typedArrayToDtypeKeys = [];

for (const arrType of Object.keys(typedArrayToDtypeMapping)) {
  typedArrayToDtypeKeys.push(eval(arrType));
}

function typedArrayToDtype(obj) {
  let dtype = typedArrayToDtypeMapping[obj.constructor.name];

  if (!dtype) {
    const pt = Object.getPrototypeOf(obj);

    for (const arrType of typedArrayToDtypeKeys) {
      if (pt instanceof arrType) {
        dtype = typedArrayToDtypeMapping[arrType.name];
        break;
      }
    }
  }

  return dtype;
}

function cacheUrlInServiceWorker(url) {
  return new Promise(function (resolve, reject) {
    const message = {
      command: "add",
      url: url
    };

    if (!navigator.serviceWorker || !navigator.serviceWorker.register) {
      reject("Service worker is not supported.");
      return;
    }

    const messageChannel = new MessageChannel();

    messageChannel.port1.onmessage = function (event) {
      if (event.data && event.data.error) {
        reject(event.data.error);
      } else {
        resolve(event.data && event.data.result);
      }
    };

    if (navigator.serviceWorker && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage(message, [messageChannel.port2]);
    } else {
      reject("Service worker controller is not available");
    }
  });
}

async function cacheRequirements(requirements) {
  if (!Array.isArray(requirements)) {
    requirementsm.code.requirements = [requirements];
  }

  if (requirements && requirements.length > 0) {
    for (let req of requirements) {
      //remove prefix
      if (req.startsWith("js:")) req = req.slice(3);
      if (req.startsWith("css:")) req = req.slice(4);
      if (req.startsWith("cache:")) req = req.slice(6);
      if (!req.startsWith("http")) continue;
      await cacheUrlInServiceWorker(req).catch(e => {
        console.error(e);
      });
    }
  }
}
function setupServiceWorker(baseUrl, targetOrigin, cacheCallback) {
  // register service worker for offline access
  if ("serviceWorker" in navigator) {
    baseUrl = baseUrl || "/";
    navigator.serviceWorker.register(baseUrl + "plugin-service-worker.js").then(function (registration) {
      // Registration was successful
      console.log("ServiceWorker registration successful with scope: ", registration.scope);
    }, function (err) {
      // registration failed :(
      console.log("ServiceWorker registration failed: ", err);
    });
    targetOrigin = targetOrigin || "*";
    cacheCallback = cacheCallback || cacheRequirements;

    if (cacheCallback && typeof cacheCallback !== "function") {
      throw new Error("config.cache_requirements must be a function");
    }

    window.addEventListener("message", function (e) {
      if (targetOrigin === "*" || e.origin === targetOrigin) {
        const m = e.data;

        if (m.type === "cacheRequirements") {
          cacheCallback(m.requirements);
        }
      }
    });
  }
} //#Source https://bit.ly/2neWfJ2

function urlJoin(...args) {
  return args.join("/").replace(/[\\/]+/g, "/").replace(/^(.+):\\//, "$1://").replace(/^file:/, "file:/").replace(/\\/(\\?|&|#[^!])/g, "$1").replace(/\\?/g, "&").replace("&", "?");
}
class MessageEmitter {
  constructor(debug) {
    this._event_handlers = {};
    this._once_handlers = {};
    this._debug = debug;
  }

  emit() {
    throw new Error("emit is not implemented");
  }

  on(event, handler) {
    if (!this._event_handlers[event]) {
      this._event_handlers[event] = [];
    }

    this._event_handlers[event].push(handler);
  }

  once(event, handler) {
    handler.___event_run_once = true;
    this.on(event, handler);
  }

  off(event, handler) {
    if (!event && !handler) {
      // remove all events handlers
      this._event_handlers = {};
    } else if (event && !handler) {
      // remove all hanlders for the event
      if (this._event_handlers[event]) this._event_handlers[event] = [];
    } else {
      // remove a specific handler
      if (this._event_handlers[event]) {
        const idx = this._event_handlers[event].indexOf(handler);

        if (idx >= 0) {
          this._event_handlers[event].splice(idx, 1);
        }
      }
    }
  }

  _fire(event, data) {
    if (this._event_handlers[event]) {
      var i = this._event_handlers[event].length;

      while (i--) {
        const handler = this._event_handlers[event][i];

        try {
          handler(data);
        } catch (e) {
          console.error(e);
        } finally {
          if (handler.___event_run_once) {
            this._event_handlers[event].splice(i, 1);
          }
        }
      }
    } else {
      if (this._debug) {
        console.warn("unhandled event", event, data);
      }
    }
  }

}

/***/ })

/******/ });
//# sourceMappingURL=plugin.webworker.js.map`,null)}},"./src/pluginCore.js":function(f,u,c){c.r(u),c.d(u,"connectRPC",function(){return b});var l=c("./src/rpc.js");function b(w,p){p=p||{};const y={},g=new l.RPC(w,p,y);g.on("getInterface",function(){e()}),g.on("remoteReady",function(){const t=g.getRemote()||{};t.registerCodec=function(s){if(!s.name||!s.encoder&&!s.decoder)throw new Error("Invalid codec format, please make sure you provide a name, type, encoder and decoder.");if(s.type)for(let d of Object.keys(y))(y[d].type===s.type||d===s.name)&&(delete y[d],console.warn("Remove duplicated codec: "+d));y[s.name]=s},t.init=function(s){g.setInterface({setup(){}},s)},t.disposeObject=function(s){g.disposeObject(s)},t.export=function(s,d){g.setInterface(s,d)},t.onLoad=function(s){s=n(s),j?s():a.push(s)},t.dispose=function(s){g.disconnect()},typeof WorkerGlobalScope!="undefined"&&self instanceof WorkerGlobalScope?(self.api=t,self.postMessage({type:"imjoy_remote_api_ready"})):window.dispatchEvent(new CustomEvent("imjoy_remote_api_ready",{detail:t}))});let j=!1;const a=[],e=function(){if(!j){j=!0;let t;for(;t=a.pop();)t()}},n=function(t){const s=typeof t;if(s!=="function"){const d="A function may only be subsribed to the event, "+s+" was provided instead";throw new Error(d)}return t};return g}},"./src/pluginIframe.js":function(module,__webpack_exports__,__webpack_require__){__webpack_require__.r(__webpack_exports__),__webpack_require__.d(__webpack_exports__,"Connection",function(){return Connection}),__webpack_require__.d(__webpack_exports__,"default",function(){return setupIframe});var _pluginCore_js__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__("./src/pluginCore.js"),_rpc_js__WEBPACK_IMPORTED_MODULE_1__=__webpack_require__("./src/rpc.js"),_utils_js__WEBPACK_IMPORTED_MODULE_2__=__webpack_require__("./src/utils.js");function _htmlToElement(f){var u=document.createElement("template");return f=f.trim(),u.innerHTML=f,u.content.firstChild}var _importScript=function(f){return new Promise((u,c)=>{var l=document.createElement("script");l.src=f,l.type="text/javascript",l.onload=u,l.onreadystatechange=function(){(this.readyState==="loaded"||this.readyState==="complete")&&u()},l.onerror=c,document.head.appendChild(l)})};async function importScripts(){for(var f=Array.prototype.slice.call(arguments),u=f.length,c=0;c<u;c++)await _importScript(f[c])}class Connection extends _utils_js__WEBPACK_IMPORTED_MODULE_2__.MessageEmitter{constructor(f){super(f&&f.debug);this.config=f||{},this.peer_id=Object(_utils_js__WEBPACK_IMPORTED_MODULE_2__.randId)()}connect(){this.config.target_origin=this.config.target_origin||"*",window.addEventListener("message",this),this.emit({type:"initialized",config:this.config,origin:window.location.origin,peer_id:this.peer_id}),this._fire("connected")}handleEvent(f){f.type==="message"&&(this.config.target_origin==="*"||f.origin===this.config.target_origin)&&(f.data.peer_id===this.peer_id?this._fire(f.data.type,f.data):this.config.debug&&console.log(`connection peer id mismatch ${f.data.peer_id} !== ${this.peer_id}`))}disconnect(){this._fire("beforeDisconnect"),window.removeEventListener("message",this),this._fire("disconnected")}emit(f){let u;f.__transferables__&&(u=f.__transferables__,delete f.__transferables__),parent.postMessage(f,this.config.target_origin,u)}async execute(code){try{if(code.type==="requirements"){if(code.requirements&&(Array.isArray(code.requirements)||typeof code.requirements=="string"))try{var link_node;if(code.requirements=typeof code.requirements=="string"?[code.requirements]:code.requirements,Array.isArray(code.requirements))for(var i=0;i<code.requirements.length;i++)code.requirements[i].toLowerCase().endsWith(".css")||code.requirements[i].startsWith("css:")?(code.requirements[i].startsWith("css:")&&(code.requirements[i]=code.requirements[i].slice(4)),link_node=document.createElement("link"),link_node.rel="stylesheet",link_node.href=code.requirements[i],document.head.appendChild(link_node)):code.requirements[i].toLowerCase().endsWith(".js")||code.requirements[i].startsWith("js:")?(code.requirements[i].startsWith("js:")&&(code.requirements[i]=code.requirements[i].slice(3)),await importScripts(code.requirements[i])):code.requirements[i].startsWith("http")?await importScripts(code.requirements[i]):code.requirements[i].startsWith("cache:")||console.log("Unprocessed requirements url: "+code.requirements[i]);else throw"unsupported requirements definition"}catch{throw"failed to import required scripts: "+code.requirements.toString()}}else if(code.type==="script")if(code.src){var script_node=document.createElement("script");script_node.setAttribute("type",code.attrs.type),script_node.setAttribute("src",code.src),document.head.appendChild(script_node)}else if(code.content&&(!code.attrs.type||code.attrs.type==="text/javascript"))eval(code.content);else{var node=document.createElement("script");node.setAttribute("type",code.attrs.type),node.appendChild(document.createTextNode(code.content)),document.body.appendChild(node)}else if(code.type==="style"){const f=document.createElement("style");code.src&&(f.src=code.src),f.innerHTML=code.content,document.head.appendChild(f)}else if(code.type==="link"){const f=document.createElement("link");code.rel&&(f.rel=code.rel),code.href&&(f.href=code.href),code.attrs&&code.attrs.type&&(f.type=code.attrs.type),document.head.appendChild(f)}else if(code.type==="html")document.body.appendChild(_htmlToElement(code.content));else throw"unsupported code type.";parent.postMessage({type:"executed"},this.config.target_origin)}catch(f){console.error("failed to execute scripts: ",code,f),parent.postMessage({type:"executed",error:f.stack||String(f)},this.config.target_origin)}}}function setupIframe(f){f=f||{},f.dedicated_thread=!1,f.lang="javascript",f.api_version=_rpc_js__WEBPACK_IMPORTED_MODULE_1__.API_VERSION;const u=new Connection(f);Object(_pluginCore_js__WEBPACK_IMPORTED_MODULE_0__.connectRPC)(u,f),u.connect()}},"./src/rpc.js":function(f,u,c){c.r(u),c.d(u,"API_VERSION",function(){return b}),c.d(u,"RPC",function(){return g});var l=c("./src/utils.js");const b="0.2.3",w=Object.getPrototypeOf(Object.getPrototypeOf(new Uint8Array)).constructor;function p(a,e){const n=new Uint8Array(a.byteLength+e.byteLength);return n.set(new Uint8Array(a),0),n.set(new Uint8Array(e),a.byteLength),n.buffer}function y(a,e){if(!e)throw new Error("undefined index");return typeof e=="string"?y(a,e.split(".")):e.length===0?a:y(a[e[0]],e.slice(1))}class g extends l.MessageEmitter{constructor(e,n,t){super(n&&n.debug);this._connection=e,this.config=n||{},this._codecs=t||{},this._object_store={},this._method_weakmap=new WeakMap,this._object_weakmap=new WeakMap,this._local_api=null;const s=this.config.name;this._connection.execute=this._connection.execute||function(){throw new Error(`connection.execute not implemented (in "${s}")`)},this._store=new j,this._method_refs=new j,this._method_refs.onReady(()=>{this._fire("remoteIdle")}),this._method_refs.onBusy(()=>{this._fire("remoteBusy")}),this._setupMessageHanlders()}init(){this._connection.emit({type:"initialized",config:this.config,peer_id:this._connection.peer_id})}setConfig(e){if(e)for(const n of Object.keys(e))this.config[n]=e[n]}getRemoteCallStack(){return this._method_refs.getStack()}getRemote(){return this._remote_interface}setInterface(e,n){if(n=n||{},this.config.name=n.name||this.config.name,this.config.description=n.description||this.config.description,this.config.forwarding_functions)for(let t of this.config.forwarding_functions){const s=this._remote_interface;s[t]&&(e.constructor===Object?e[t]||(e[t]=(...d)=>{s[t](...d)}):e.constructor.constructor===Function&&(e.constructor.prototype[t]||(e.constructor.prototype[t]=(...d)=>{s[t](...d)})))}this._local_api=e,this._fire("interfaceAvailable")}sendInterface(){if(!this._local_api)throw new Error("interface is not set.");this._encode(this._local_api,!0).then(e=>{this._connection.emit({type:"setInterface",api:e})})}_disposeObject(e){if(this._object_store[e])delete this._object_store[e];else throw new Error(`Object (id=${e}) not found.`)}disposeObject(e){return new Promise((n,t)=>{if(this._object_weakmap.has(e)){const s=this._object_weakmap.get(e);this._connection.once("disposed",d=>{d.error?t(new Error(d.error)):n()}),this._connection.emit({type:"disposeObject",object_id:s})}else throw new Error("Invalid object")})}_setupMessageHanlders(){this._connection.on("init",this.init),this._connection.on("execute",e=>{Promise.resolve(this._connection.execute(e.code)).then(()=>{this._connection.emit({type:"executed"})}).catch(n=>{console.error(n),this._connection.emit({type:"executed",error:String(n)})})}),this._connection.on("method",async e=>{let n,t,s,d,_,v;try{e.promise&&([n,t]=await this._unwrap(e.promise,!1));const k=this._object_store[e.object_id];if(s=y(k,e.name),e.name.includes(".")){const E=e.name.split("."),P=E.slice(0,E.length-1).join(".");d=y(k,P)}else d=k;_=await this._unwrap(e.args,!0),e.promise?(v=s.apply(d,_),v instanceof Promise||s.constructor&&s.constructor.name==="AsyncFunction"?v.then(n).catch(t):n(v)):s.apply(d,_)}catch(k){console.error(this.config.name,k),t&&t(k)}}),this._connection.on("callback",async e=>{let n,t,s,d,_;try{if(e.promise&&([n,t]=await this._unwrap(e.promise,!1)),e.promise){if(s=this._store.fetch(e.id),d=await this._unwrap(e.args,!0),!s)throw new Error("Callback function can only called once, if you want to call a function for multiple times, please make it as a plugin api function. See https://imjoy.io/docs for more details.");_=s.apply(null,d),_ instanceof Promise||s.constructor&&s.constructor.name==="AsyncFunction"?_.then(n).catch(t):n(_)}else{if(s=this._store.fetch(e.id),d=await this._unwrap(e.args,!0),!s)throw new Error("Please notice that callback function can only called once, if you want to call a function for multiple times, please make it as a plugin api function. See https://imjoy.io/docs for more details.");s.apply(null,d)}}catch(v){console.error(this.config.name,v),t&&t(v)}}),this._connection.on("disposeObject",e=>{try{this._disposeObject(e.object_id),this._connection.emit({type:"disposed"})}catch(n){console.error(n),this._connection.emit({type:"disposed",error:String(n)})}}),this._connection.on("setInterface",e=>{this._setRemoteInterface(e.api)}),this._connection.on("getInterface",()=>{this._fire("getInterface"),this._local_api?this.sendInterface():this.once("interfaceAvailable",()=>{this.sendInterface()})}),this._connection.on("interfaceSetAsRemote",()=>{this._fire("interfaceSetAsRemote")}),this._connection.on("disconnect",()=>{this._fire("beforeDisconnect"),this._connection.disconnect(),this._fire("disconnected")})}requestRemote(){this._connection.emit({type:"getInterface"})}_ndarray(e,n,t){const s=Object(l.typedArrayToDtype)(e);if(t&&t!==s)throw"dtype doesn't match the type of the array: "+s+" != "+t;return n=n||[e.length],{_rtype:"ndarray",_rvalue:e.buffer,_rshape:n,_rdtype:s}}_setRemoteInterface(e){this._decode(e).then(n=>{this._remote_interface?Object.assign(this._remote_interface,n):this._remote_interface=n,this._fire("remoteReady"),this._reportRemoteSet()})}_genRemoteMethod(e,n,t){const s=this,d=function(){return new Promise(async(_,v)=>{let k=null;try{k=s._method_refs.put(t?t+"/"+n:n);const E=function(){return k!==null&&s._method_refs.fetch(k),_.apply(this,arguments)},P=function(){return k!==null&&s._method_refs.fetch(k),v.apply(this,arguments)},x=await s._wrap([E,P]);E.__promise_pair=x[1]._rvalue,P.__promise_pair=x[0]._rvalue;let R=Array.prototype.slice.call(arguments);n==="register"||n==="registerService"||n==="export"||n==="on"?R=await s._wrap(R,!0):R=await s._wrap(R);const I=R.__transferables__;I&&delete R.__transferables__,s._connection.emit({type:"method",target_id:e,name:n,object_id:t,args:R,promise:x},I)}catch(E){k&&s._method_refs.fetch(k),v(`Failed to exectue remote method (interface: ${t||s.id}, method: ${n}), error: ${E}`)}})};return d.__remote_method=!0,d}_reportRemoteSet(){this._connection.emit({type:"interfaceSetAsRemote"})}async _encode(e,n,t){const s=typeof e;if(s==="number"||s==="string"||s==="boolean"||e===null||e===void 0||e instanceof ArrayBuffer)return e;let d;if(typeof e=="function"){if(n){if(!t)throw new Error("objectId is not specified.");d={_rtype:"interface",_rtarget_id:this._connection.peer_id,_rintf:t,_rvalue:n},this._method_weakmap.set(e,d)}else if(this._method_weakmap.has(e))d=this._method_weakmap.get(e);else{const E=this._store.put(e);d={_rtype:"callback",_rtarget_id:this._connection.peer_id,_rname:e.constructor&&e.constructor.name||E,_rvalue:E}}return d}if(e.constructor instanceof Object&&e._rtype){if(e._rintf){const E=e._rtype;delete e._rtype,d=await this._encode(e,n,t),d._rtype=E}else d=e;return d}const _=[],v=e._transfer,k=Array.isArray(e);for(let E of Object.keys(this._codecs)){const P=this._codecs[E];if(P.encoder&&e instanceof P.type){let x=await Promise.resolve(P.encoder(e));if(x&&!x._rtype&&(x._rtype=P.name),x&&x._rintf){const R=x._rtype;delete x._rtype,x=await this._encode(x,n,t),x._rtype=R}return d=x,d}}if(typeof tf!="undefined"&&tf.Tensor&&e instanceof tf.Tensor){const E=e.dataSync();(e._transfer||v)&&(_.push(E.buffer),delete e._transfer),d={_rtype:"ndarray",_rvalue:E.buffer,_rshape:e.shape,_rdtype:e.dtype}}else if(typeof nj!="undefined"&&nj.NdArray&&e instanceof nj.NdArray){const E=Object(l.typedArrayToDtype)(e.selection.data);(e._transfer||v)&&(_.push(e.selection.data.buffer),delete e._transfer),d={_rtype:"ndarray",_rvalue:e.selection.data.buffer,_rshape:e.shape,_rdtype:E}}else if(e instanceof Error)console.error(e),d={_rtype:"error",_rvalue:e.toString()};else if(typeof File!="undefined"&&e instanceof File)d={_rtype:"file",_rvalue:e,_rpath:e._path||e.webkitRelativePath};else if(e!==Object(e)||e instanceof Boolean||e instanceof String||e instanceof Date||e instanceof RegExp||e instanceof ImageData||typeof FileList!="undefined"&&e instanceof FileList||typeof FileSystemDirectoryHandle!="undefined"&&e instanceof FileSystemDirectoryHandle||typeof FileSystemFileHandle!="undefined"&&e instanceof FileSystemFileHandle||typeof FileSystemHandle!="undefined"&&e instanceof FileSystemHandle||typeof FileSystemWritableFileStream!="undefined"&&e instanceof FileSystemWritableFileStream)d=e;else if(typeof File!="undefined"&&e instanceof File)d={_rtype:"file",_rname:e.name,_rmime:e.type,_rvalue:e,_rpath:e._path||e.webkitRelativePath};else if(e instanceof Blob)d={_rtype:"blob",_rvalue:e};else if(e instanceof w){(e._transfer||v)&&(_.push(e.buffer),delete e._transfer);const E=Object(l.typedArrayToDtype)(e);d={_rtype:"typedarray",_rvalue:e.buffer,_rdtype:E}}else if(e instanceof DataView)(e._transfer||v)&&(_.push(e.buffer),delete e._transfer),d={_rtype:"memoryview",_rvalue:e.buffer};else if(e instanceof Set)d={_rtype:"set",_rvalue:await this._encode(Array.from(e),n)};else if(e instanceof Map)d={_rtype:"orderedmap",_rvalue:await this._encode(Array.from(e),n)};else if(e.constructor instanceof Object||Array.isArray(e)){d=k?[]:{};let E;if(e.constructor===Object||Array.isArray(e))E=Object.keys(e);else{if(e.constructor===Function)throw new Error("Please instantiate the class before exportting it.");if(e.constructor.constructor===Function)E=Object.getOwnPropertyNames(Object.getPrototypeOf(e)).concat(Object.keys(e)),n=!0;else throw Error("Unsupported interface type")}let P=!1;if(e._rintf||n){t||(t=Object(l.randId)(),this._object_store[t]=e);for(let x of E)x!=="constructor"&&(x.startsWith("_")||(d[x]=await this._encode(e[x],typeof n=="string"?n+"."+x:x,t),typeof e[x]=="function"&&(P=!0)));P&&(d._rintf=t),e.on&&typeof e.on=="function"&&e.on("close",()=>{delete this._object_store[t]})}else for(let x of E)["hasOwnProperty","constructor"].includes(x)||(d[x]=await this._encode(e[x]))}else if(typeof e=="object"){const E=Object.getOwnPropertyNames(Object.getPrototypeOf(e)).concat(Object.keys(e)),P=Object(l.randId)();for(let x of E)["hasOwnProperty","constructor"].includes(x)||(d[x]=await this._encode(e[x],x,d));d._rintf=P}else throw"imjoy-rpc: Unsupported data type:"+e;if(_.length>0&&(d.__transferables__=_),!d)throw new Error("Failed to encode object");return d}async _decode(e,n){if(!e)return e;let t;if(e._rtype)if(this._codecs[e._rtype]&&this._codecs[e._rtype].decoder){if(e._rintf){const s=e._rtype;delete e._rtype,e=await this._decode(e,n),e._rtype=s}t=await Promise.resolve(this._codecs[e._rtype].decoder(e))}else if(e._rtype==="callback")t=this._genRemoteCallback(e._rtarget_id,e._rvalue,n);else if(e._rtype==="interface")t=this._genRemoteMethod(e._rtarget_id,e._rvalue,e._rintf);else if(e._rtype==="ndarray")if(typeof nj!="undefined"&&nj.array)Array.isArray(e._rvalue)&&(e._rvalue=e._rvalue.reduce(p)),t=nj.array(new Uint8(e._rvalue),e._rdtype).reshape(e._rshape);else if(typeof tf!="undefined"&&tf.Tensor){Array.isArray(e._rvalue)&&(e._rvalue=e._rvalue.reduce(p));const s=l.dtypeToTypedArray[e._rdtype];t=tf.tensor(new s(e._rvalue),e._rshape,e._rdtype)}else t=e;else if(e._rtype==="error")t=new Error(e._rvalue);else if(e._rtype==="file")e._rvalue instanceof File?(t=e._rvalue,t._path=e._rpath):(t=new File([e._rvalue],e._rname,{type:e._rmime}),t._path=e._rpath);else if(e._rtype==="typedarray"){const s=l.dtypeToTypedArray[e._rdtype];if(!s)throw new Error("unsupported dtype: "+e._rdtype);t=new s(e._rvalue)}else if(e._rtype==="memoryview")t=new DataView(e._rvalue);else if(e._rtype==="blob")e._rvalue instanceof Blob?t=e._rvalue:t=new Blob([e._rvalue],{type:e._rmime});else if(e._rtype==="orderedmap")t=new Map(await this._decode(e._rvalue,n));else if(e._rtype==="set")t=new Set(await this._decode(e._rvalue,n));else if(e._rintf){const s=e._rtype;delete e._rtype,t=await this._decode(e,n),t._rtype=s}else t=e;else if(e.constructor===Object||Array.isArray(e)){const s=Array.isArray(e);t=s?[]:{};for(let d of Object.keys(e))if(s||e.hasOwnProperty(d)){const _=e[d];t[d]=await this._decode(_,n)}}else t=e;if(t===void 0)throw new Error("Failed to decode object");return e._rintf&&this._object_weakmap.set(t,e._rintf),t}async _wrap(e,n){return await this._encode(e,n)}async _unwrap(e,n){return await this._decode(e,n)}_genRemoteCallback(e,n,t){const s=this;let d;return t?(d=function(){return new Promise(async(_,v)=>{const k=await s._wrap(Array.prototype.slice.call(arguments)),E=k.__transferables__;E&&delete k.__transferables__;const P=await s._wrap([_,v]);_.__promise_pair=P[1]._rvalue,v.__promise_pair=P[0]._rvalue;try{s._connection.emit({type:"callback",target_id:e,id:n,args:k,promise:P},E)}catch{v(`Failed to exectue remote callback ( id: ${n}).`)}})},d):(d=async function(){const _=await s._wrap(Array.prototype.slice.call(arguments)),v=_.__transferables__;return v&&delete _.__transferables__,s._connection.emit({type:"callback",target_id:e,id:n,args:_},v)},d)}reset(){this._event_handlers={},this._once_handlers={},this._remote_interface=null,this._object_store={},this._method_weakmap=new WeakMap,this._object_weakmap=new WeakMap,this._local_api=null,this._store=new j,this._method_refs=new j}disconnect(){this._connection.emit({type:"disconnect"}),this.reset(),setTimeout(()=>{this._connection.disconnect()},2e3)}}class j{constructor(){this._store={},this._indices=[0],this._readyHandler=function(){},this._busyHandler=function(){},this._readyHandler()}onReady(e){this._readyHandler=e||function(){}}onBusy(e){this._busyHandler=e||function(){}}getStack(){return Object.keys(this._store).length}_genId(){let e;return this._indices.length===1?e=this._indices[0]++:e=this._indices.shift(),e}_releaseId(e){for(let n=0;n<this._indices.length;n++)if(e<this._indices[n]){this._indices.splice(n,0,e);break}for(let n=this._indices.length-1;n>=0&&this._indices[n]-1===this._indices[n-1];n--)this._indices.pop()}put(e){this._busyHandler&&Object.keys(this._store).length===0&&this._busyHandler();const n=this._genId();return this._store[n]=e,n}fetch(e){const n=this._store[e];return n&&!n.__remote_method&&(delete this._store[e],this._releaseId(e),this._readyHandler&&Object.keys(this._store).length===0&&this._readyHandler()),n&&n.__promise_pair&&this.fetch(n.__promise_pair),n}}},"./src/utils.js":function(module,__webpack_exports__,__webpack_require__){__webpack_require__.r(__webpack_exports__),__webpack_require__.d(__webpack_exports__,"randId",function(){return randId}),__webpack_require__.d(__webpack_exports__,"dtypeToTypedArray",function(){return dtypeToTypedArray}),__webpack_require__.d(__webpack_exports__,"normalizeConfig",function(){return normalizeConfig}),__webpack_require__.d(__webpack_exports__,"typedArrayToDtypeMapping",function(){return typedArrayToDtypeMapping}),__webpack_require__.d(__webpack_exports__,"typedArrayToDtype",function(){return typedArrayToDtype}),__webpack_require__.d(__webpack_exports__,"cacheRequirements",function(){return cacheRequirements}),__webpack_require__.d(__webpack_exports__,"setupServiceWorker",function(){return setupServiceWorker}),__webpack_require__.d(__webpack_exports__,"urlJoin",function(){return urlJoin}),__webpack_require__.d(__webpack_exports__,"MessageEmitter",function(){return MessageEmitter});function randId(){return Math.random().toString(36).substr(2,10)+new Date().getTime()}const dtypeToTypedArray={int8:Int8Array,int16:Int16Array,int32:Int32Array,uint8:Uint8Array,uint16:Uint16Array,uint32:Uint32Array,float32:Float32Array,float64:Float64Array,array:Array};function normalizeConfig(f){return f.version=f.version||"0.1.0",f.description=f.description||`[TODO: add description for ${f.name} ]`,f.type=f.type||"rpc-window",f.id=f.id||randId(),f.allow_execution=f.allow_execution||!1,f.enable_service_worker&&setupServiceWorker(f.base_url,f.target_origin,f.cache_requirements),f.cache_requirements&&delete f.cache_requirements,f=Object.keys(f).reduce((u,c)=>(typeof f[c]!="function"&&(u[c]=f[c]),u),{}),f}const typedArrayToDtypeMapping={Int8Array:"int8",Int16Array:"int16",Int32Array:"int32",Uint8Array:"uint8",Uint16Array:"uint16",Uint32Array:"uint32",Float32Array:"float32",Float64Array:"float64",Array:"array"},typedArrayToDtypeKeys=[];for(const arrType of Object.keys(typedArrayToDtypeMapping))typedArrayToDtypeKeys.push(eval(arrType));function typedArrayToDtype(f){let u=typedArrayToDtypeMapping[f.constructor.name];if(!u){const c=Object.getPrototypeOf(f);for(const l of typedArrayToDtypeKeys)if(c instanceof l){u=typedArrayToDtypeMapping[l.name];break}}return u}function cacheUrlInServiceWorker(f){return new Promise(function(u,c){const l={command:"add",url:f};if(!navigator.serviceWorker||!navigator.serviceWorker.register){c("Service worker is not supported.");return}const b=new MessageChannel;b.port1.onmessage=function(w){w.data&&w.data.error?c(w.data.error):u(w.data&&w.data.result)},navigator.serviceWorker&&navigator.serviceWorker.controller?navigator.serviceWorker.controller.postMessage(l,[b.port2]):c("Service worker controller is not available")})}async function cacheRequirements(f){if(Array.isArray(f)||(requirementsm.code.requirements=[f]),f&&f.length>0)for(let u of f)u.startsWith("js:")&&(u=u.slice(3)),u.startsWith("css:")&&(u=u.slice(4)),u.startsWith("cache:")&&(u=u.slice(6)),!!u.startsWith("http")&&await cacheUrlInServiceWorker(u).catch(c=>{console.error(c)})}function setupServiceWorker(f,u,c){if("serviceWorker"in navigator){if(f=f||"/",navigator.serviceWorker.register(f+"plugin-service-worker.js").then(function(l){console.log("ServiceWorker registration successful with scope: ",l.scope)},function(l){console.log("ServiceWorker registration failed: ",l)}),u=u||"*",c=c||cacheRequirements,c&&typeof c!="function")throw new Error("config.cache_requirements must be a function");window.addEventListener("message",function(l){if(u==="*"||l.origin===u){const b=l.data;b.type==="cacheRequirements"&&c(b.requirements)}})}}function urlJoin(...f){return f.join("/").replace(/[\/]+/g,"/").replace(/^(.+):\//,"$1://").replace(/^file:/,"file:/").replace(/\/(\?|&|#[^!])/g,"$1").replace(/\?/g,"&").replace("&","?")}class MessageEmitter{constructor(u){this._event_handlers={},this._once_handlers={},this._debug=u}emit(){throw new Error("emit is not implemented")}on(u,c){this._event_handlers[u]||(this._event_handlers[u]=[]),this._event_handlers[u].push(c)}once(u,c){c.___event_run_once=!0,this.on(u,c)}off(u,c){if(!u&&!c)this._event_handlers={};else if(u&&!c)this._event_handlers[u]&&(this._event_handlers[u]=[]);else if(this._event_handlers[u]){const l=this._event_handlers[u].indexOf(c);l>=0&&this._event_handlers[u].splice(l,1)}}_fire(u,c){if(this._event_handlers[u])for(var l=this._event_handlers[u].length;l--;){const b=this._event_handlers[u][l];try{b(c)}catch(w){console.error(w)}finally{b.___event_run_once&&this._event_handlers[u].splice(l,1)}}else this._debug&&console.warn("unhandled event",u,c)}}}})})})(imjoyRpc$1);var imjoyRpcSocketio={exports:{}};(function(module,exports){(function(u,c){module.exports=c()})(window,function(){return function(f){var u={};function c(l){if(u[l])return u[l].exports;var b=u[l]={i:l,l:!1,exports:{}};return f[l].call(b.exports,b,b.exports,c),b.l=!0,b.exports}return c.m=f,c.c=u,c.d=function(l,b,w){c.o(l,b)||Object.defineProperty(l,b,{enumerable:!0,get:w})},c.r=function(l){typeof Symbol!="undefined"&&Symbol.toStringTag&&Object.defineProperty(l,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(l,"__esModule",{value:!0})},c.t=function(l,b){if(b&1&&(l=c(l)),b&8||b&4&&typeof l=="object"&&l&&l.__esModule)return l;var w=Object.create(null);if(c.r(w),Object.defineProperty(w,"default",{enumerable:!0,value:l}),b&2&&typeof l!="string")for(var p in l)c.d(w,p,function(y){return l[y]}.bind(null,p));return w},c.n=function(l){var b=l&&l.__esModule?function(){return l.default}:function(){return l};return c.d(b,"a",b),b},c.o=function(l,b){return Object.prototype.hasOwnProperty.call(l,b)},c.p="",c(c.s="./src/socketIOMain.js")}({"./node_modules/backo2/index.js":function(f,u){f.exports=c;function c(l){l=l||{},this.ms=l.min||100,this.max=l.max||1e4,this.factor=l.factor||2,this.jitter=l.jitter>0&&l.jitter<=1?l.jitter:0,this.attempts=0}c.prototype.duration=function(){var l=this.ms*Math.pow(this.factor,this.attempts++);if(this.jitter){var b=Math.random(),w=Math.floor(b*this.jitter*l);l=(Math.floor(b*10)&1)==0?l-w:l+w}return Math.min(l,this.max)|0},c.prototype.reset=function(){this.attempts=0},c.prototype.setMin=function(l){this.ms=l},c.prototype.setMax=function(l){this.max=l},c.prototype.setJitter=function(l){this.jitter=l}},"./node_modules/base64-js/index.js":function(f,u,c){u.byteLength=a,u.toByteArray=n,u.fromByteArray=d;for(var l=[],b=[],w=typeof Uint8Array!="undefined"?Uint8Array:Array,p="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",y=0,g=p.length;y<g;++y)l[y]=p[y],b[p.charCodeAt(y)]=y;b["-".charCodeAt(0)]=62,b["_".charCodeAt(0)]=63;function j(_){var v=_.length;if(v%4>0)throw new Error("Invalid string. Length must be a multiple of 4");var k=_.indexOf("=");k===-1&&(k=v);var E=k===v?0:4-k%4;return[k,E]}function a(_){var v=j(_),k=v[0],E=v[1];return(k+E)*3/4-E}function e(_,v,k){return(v+k)*3/4-k}function n(_){var v,k=j(_),E=k[0],P=k[1],x=new w(e(_,E,P)),R=0,I=P>0?E-4:E,T;for(T=0;T<I;T+=4)v=b[_.charCodeAt(T)]<<18|b[_.charCodeAt(T+1)]<<12|b[_.charCodeAt(T+2)]<<6|b[_.charCodeAt(T+3)],x[R++]=v>>16&255,x[R++]=v>>8&255,x[R++]=v&255;return P===2&&(v=b[_.charCodeAt(T)]<<2|b[_.charCodeAt(T+1)]>>4,x[R++]=v&255),P===1&&(v=b[_.charCodeAt(T)]<<10|b[_.charCodeAt(T+1)]<<4|b[_.charCodeAt(T+2)]>>2,x[R++]=v>>8&255,x[R++]=v&255),x}function t(_){return l[_>>18&63]+l[_>>12&63]+l[_>>6&63]+l[_&63]}function s(_,v,k){for(var E,P=[],x=v;x<k;x+=3)E=(_[x]<<16&16711680)+(_[x+1]<<8&65280)+(_[x+2]&255),P.push(t(E));return P.join("")}function d(_){for(var v,k=_.length,E=k%3,P=[],x=16383,R=0,I=k-E;R<I;R+=x)P.push(s(_,R,R+x>I?I:R+x));return E===1?(v=_[k-1],P.push(l[v>>2]+l[v<<4&63]+"==")):E===2&&(v=(_[k-2]<<8)+_[k-1],P.push(l[v>>10]+l[v>>4&63]+l[v<<2&63]+"=")),P.join("")}},"./node_modules/buffer/index.js":function(f,u,c){(function(l){/*!
* The buffer module from node.js, for the browser.
*
* @author   Feross Aboukhadijeh <http://feross.org>
* @license  MIT
*/var b=c("./node_modules/base64-js/index.js"),w=c("./node_modules/ieee754/index.js"),p=c("./node_modules/isarray/index.js");u.Buffer=a,u.SlowBuffer=P,u.INSPECT_MAX_BYTES=50,a.TYPED_ARRAY_SUPPORT=l.TYPED_ARRAY_SUPPORT!==void 0?l.TYPED_ARRAY_SUPPORT:y(),u.kMaxLength=g();function y(){try{var h=new Uint8Array(1);return h.__proto__={__proto__:Uint8Array.prototype,foo:function(){return 42}},h.foo()===42&&typeof h.subarray=="function"&&h.subarray(1,1).byteLength===0}catch{return!1}}function g(){return a.TYPED_ARRAY_SUPPORT?2147483647:1073741823}function j(h,r){if(g()<r)throw new RangeError("Invalid typed array length");return a.TYPED_ARRAY_SUPPORT?(h=new Uint8Array(r),h.__proto__=a.prototype):(h===null&&(h=new a(r)),h.length=r),h}function a(h,r,o){if(!a.TYPED_ARRAY_SUPPORT&&!(this instanceof a))return new a(h,r,o);if(typeof h=="number"){if(typeof r=="string")throw new Error("If encoding is specified then the first argument must be a string");return s(this,h)}return e(this,h,r,o)}a.poolSize=8192,a._augment=function(h){return h.__proto__=a.prototype,h};function e(h,r,o,m){if(typeof r=="number")throw new TypeError('"value" argument must not be a number');return typeof ArrayBuffer!="undefined"&&r instanceof ArrayBuffer?v(h,r,o,m):typeof r=="string"?d(h,r,o):k(h,r)}a.from=function(h,r,o){return e(null,h,r,o)},a.TYPED_ARRAY_SUPPORT&&(a.prototype.__proto__=Uint8Array.prototype,a.__proto__=Uint8Array,typeof Symbol!="undefined"&&Symbol.species&&a[Symbol.species]===a&&Object.defineProperty(a,Symbol.species,{value:null,configurable:!0}));function n(h){if(typeof h!="number")throw new TypeError('"size" argument must be a number');if(h<0)throw new RangeError('"size" argument must not be negative')}function t(h,r,o,m){return n(r),r<=0?j(h,r):o!==void 0?typeof m=="string"?j(h,r).fill(o,m):j(h,r).fill(o):j(h,r)}a.alloc=function(h,r,o){return t(null,h,r,o)};function s(h,r){if(n(r),h=j(h,r<0?0:E(r)|0),!a.TYPED_ARRAY_SUPPORT)for(var o=0;o<r;++o)h[o]=0;return h}a.allocUnsafe=function(h){return s(null,h)},a.allocUnsafeSlow=function(h){return s(null,h)};function d(h,r,o){if((typeof o!="string"||o==="")&&(o="utf8"),!a.isEncoding(o))throw new TypeError('"encoding" must be a valid string encoding');var m=x(r,o)|0;h=j(h,m);var O=h.write(r,o);return O!==m&&(h=h.slice(0,O)),h}function _(h,r){var o=r.length<0?0:E(r.length)|0;h=j(h,o);for(var m=0;m<o;m+=1)h[m]=r[m]&255;return h}function v(h,r,o,m){if(r.byteLength,o<0||r.byteLength<o)throw new RangeError("'offset' is out of bounds");if(r.byteLength<o+(m||0))throw new RangeError("'length' is out of bounds");return o===void 0&&m===void 0?r=new Uint8Array(r):m===void 0?r=new Uint8Array(r,o):r=new Uint8Array(r,o,m),a.TYPED_ARRAY_SUPPORT?(h=r,h.__proto__=a.prototype):h=_(h,r),h}function k(h,r){if(a.isBuffer(r)){var o=E(r.length)|0;return h=j(h,o),h.length===0||r.copy(h,0,0,o),h}if(r){if(typeof ArrayBuffer!="undefined"&&r.buffer instanceof ArrayBuffer||"length"in r)return typeof r.length!="number"||be(r.length)?j(h,0):_(h,r);if(r.type==="Buffer"&&p(r.data))return _(h,r.data)}throw new TypeError("First argument must be a string, Buffer, ArrayBuffer, Array, or array-like object.")}function E(h){if(h>=g())throw new RangeError("Attempt to allocate Buffer larger than maximum size: 0x"+g().toString(16)+" bytes");return h|0}function P(h){return+h!=h&&(h=0),a.alloc(+h)}a.isBuffer=function(r){return!!(r!=null&&r._isBuffer)},a.compare=function(r,o){if(!a.isBuffer(r)||!a.isBuffer(o))throw new TypeError("Arguments must be Buffers");if(r===o)return 0;for(var m=r.length,O=o.length,C=0,A=Math.min(m,O);C<A;++C)if(r[C]!==o[C]){m=r[C],O=o[C];break}return m<O?-1:O<m?1:0},a.isEncoding=function(r){switch(String(r).toLowerCase()){case"hex":case"utf8":case"utf-8":case"ascii":case"latin1":case"binary":case"base64":case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return!0;default:return!1}},a.concat=function(r,o){if(!p(r))throw new TypeError('"list" argument must be an Array of Buffers');if(r.length===0)return a.alloc(0);var m;if(o===void 0)for(o=0,m=0;m<r.length;++m)o+=r[m].length;var O=a.allocUnsafe(o),C=0;for(m=0;m<r.length;++m){var A=r[m];if(!a.isBuffer(A))throw new TypeError('"list" argument must be an Array of Buffers');A.copy(O,C),C+=A.length}return O};function x(h,r){if(a.isBuffer(h))return h.length;if(typeof ArrayBuffer!="undefined"&&typeof ArrayBuffer.isView=="function"&&(ArrayBuffer.isView(h)||h instanceof ArrayBuffer))return h.byteLength;typeof h!="string"&&(h=""+h);var o=h.length;if(o===0)return 0;for(var m=!1;;)switch(r){case"ascii":case"latin1":case"binary":return o;case"utf8":case"utf-8":case void 0:return z(h).length;case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return o*2;case"hex":return o>>>1;case"base64":return ee(h).length;default:if(m)return z(h).length;r=(""+r).toLowerCase(),m=!0}}a.byteLength=x;function R(h,r,o){var m=!1;if((r===void 0||r<0)&&(r=0),r>this.length||((o===void 0||o>this.length)&&(o=this.length),o<=0)||(o>>>=0,r>>>=0,o<=r))return"";for(h||(h="utf8");;)switch(h){case"hex":return de(this,r,o);case"utf8":case"utf-8":return J(this,r,o);case"ascii":return ce(this,r,o);case"latin1":case"binary":return le(this,r,o);case"base64":return se(this,r,o);case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return ue(this,r,o);default:if(m)throw new TypeError("Unknown encoding: "+h);h=(h+"").toLowerCase(),m=!0}}a.prototype._isBuffer=!0;function I(h,r,o){var m=h[r];h[r]=h[o],h[o]=m}a.prototype.swap16=function(){var r=this.length;if(r%2!=0)throw new RangeError("Buffer size must be a multiple of 16-bits");for(var o=0;o<r;o+=2)I(this,o,o+1);return this},a.prototype.swap32=function(){var r=this.length;if(r%4!=0)throw new RangeError("Buffer size must be a multiple of 32-bits");for(var o=0;o<r;o+=4)I(this,o,o+3),I(this,o+1,o+2);return this},a.prototype.swap64=function(){var r=this.length;if(r%8!=0)throw new RangeError("Buffer size must be a multiple of 64-bits");for(var o=0;o<r;o+=8)I(this,o,o+7),I(this,o+1,o+6),I(this,o+2,o+5),I(this,o+3,o+4);return this},a.prototype.toString=function(){var r=this.length|0;return r===0?"":arguments.length===0?J(this,0,r):R.apply(this,arguments)},a.prototype.equals=function(r){if(!a.isBuffer(r))throw new TypeError("Argument must be a Buffer");return this===r?!0:a.compare(this,r)===0},a.prototype.inspect=function(){var r="",o=u.INSPECT_MAX_BYTES;return this.length>0&&(r=this.toString("hex",0,o).match(/.{2}/g).join(" "),this.length>o&&(r+=" ... ")),"<Buffer "+r+">"},a.prototype.compare=function(r,o,m,O,C){if(!a.isBuffer(r))throw new TypeError("Argument must be a Buffer");if(o===void 0&&(o=0),m===void 0&&(m=r?r.length:0),O===void 0&&(O=0),C===void 0&&(C=this.length),o<0||m>r.length||O<0||C>this.length)throw new RangeError("out of range index");if(O>=C&&o>=m)return 0;if(O>=C)return-1;if(o>=m)return 1;if(o>>>=0,m>>>=0,O>>>=0,C>>>=0,this===r)return 0;for(var A=C-O,S=m-o,F=Math.min(A,S),M=this.slice(O,C),B=r.slice(o,m),D=0;D<F;++D)if(M[D]!==B[D]){A=M[D],S=B[D];break}return A<S?-1:S<A?1:0};function T(h,r,o,m,O){if(h.length===0)return-1;if(typeof o=="string"?(m=o,o=0):o>2147483647?o=2147483647:o<-2147483648&&(o=-2147483648),o=+o,isNaN(o)&&(o=O?0:h.length-1),o<0&&(o=h.length+o),o>=h.length){if(O)return-1;o=h.length-1}else if(o<0)if(O)o=0;else return-1;if(typeof r=="string"&&(r=a.from(r,m)),a.isBuffer(r))return r.length===0?-1:U(h,r,o,m,O);if(typeof r=="number")return r=r&255,a.TYPED_ARRAY_SUPPORT&&typeof Uint8Array.prototype.indexOf=="function"?O?Uint8Array.prototype.indexOf.call(h,r,o):Uint8Array.prototype.lastIndexOf.call(h,r,o):U(h,[r],o,m,O);throw new TypeError("val must be string, number or Buffer")}function U(h,r,o,m,O){var C=1,A=h.length,S=r.length;if(m!==void 0&&(m=String(m).toLowerCase(),m==="ucs2"||m==="ucs-2"||m==="utf16le"||m==="utf-16le")){if(h.length<2||r.length<2)return-1;C=2,A/=2,S/=2,o/=2}function F(ne,te){return C===1?ne[te]:ne.readUInt16BE(te*C)}var M;if(O){var B=-1;for(M=o;M<A;M++)if(F(h,M)===F(r,B===-1?0:M-B)){if(B===-1&&(B=M),M-B+1===S)return B*C}else B!==-1&&(M-=M-B),B=-1}else for(o+S>A&&(o=A-S),M=o;M>=0;M--){for(var D=!0,V=0;V<S;V++)if(F(h,M+V)!==F(r,V)){D=!1;break}if(D)return M}return-1}a.prototype.includes=function(r,o,m){return this.indexOf(r,o,m)!==-1},a.prototype.indexOf=function(r,o,m){return T(this,r,o,m,!0)},a.prototype.lastIndexOf=function(r,o,m){return T(this,r,o,m,!1)};function L(h,r,o,m){o=Number(o)||0;var O=h.length-o;m?(m=Number(m),m>O&&(m=O)):m=O;var C=r.length;if(C%2!=0)throw new TypeError("Invalid hex string");m>C/2&&(m=C/2);for(var A=0;A<m;++A){var S=parseInt(r.substr(A*2,2),16);if(isNaN(S))return A;h[o+A]=S}return A}function N(h,r,o,m){return $(z(r,h.length-o),h,o,m)}function Y(h,r,o,m){return $(me(r),h,o,m)}function re(h,r,o,m){return Y(h,r,o,m)}function ie(h,r,o,m){return $(ee(r),h,o,m)}function oe(h,r,o,m){return $(ye(r,h.length-o),h,o,m)}a.prototype.write=function(r,o,m,O){if(o===void 0)O="utf8",m=this.length,o=0;else if(m===void 0&&typeof o=="string")O=o,m=this.length,o=0;else if(isFinite(o))o=o|0,isFinite(m)?(m=m|0,O===void 0&&(O="utf8")):(O=m,m=void 0);else throw new Error("Buffer.write(string, encoding, offset[, length]) is no longer supported");var C=this.length-o;if((m===void 0||m>C)&&(m=C),r.length>0&&(m<0||o<0)||o>this.length)throw new RangeError("Attempt to write outside buffer bounds");O||(O="utf8");for(var A=!1;;)switch(O){case"hex":return L(this,r,o,m);case"utf8":case"utf-8":return N(this,r,o,m);case"ascii":return Y(this,r,o,m);case"latin1":case"binary":return re(this,r,o,m);case"base64":return ie(this,r,o,m);case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return oe(this,r,o,m);default:if(A)throw new TypeError("Unknown encoding: "+O);O=(""+O).toLowerCase(),A=!0}},a.prototype.toJSON=function(){return{type:"Buffer",data:Array.prototype.slice.call(this._arr||this,0)}};function se(h,r,o){return r===0&&o===h.length?b.fromByteArray(h):b.fromByteArray(h.slice(r,o))}function J(h,r,o){o=Math.min(h.length,o);for(var m=[],O=r;O<o;){var C=h[O],A=null,S=C>239?4:C>223?3:C>191?2:1;if(O+S<=o){var F,M,B,D;switch(S){case 1:C<128&&(A=C);break;case 2:F=h[O+1],(F&192)==128&&(D=(C&31)<<6|F&63,D>127&&(A=D));break;case 3:F=h[O+1],M=h[O+2],(F&192)==128&&(M&192)==128&&(D=(C&15)<<12|(F&63)<<6|M&63,D>2047&&(D<55296||D>57343)&&(A=D));break;case 4:F=h[O+1],M=h[O+2],B=h[O+3],(F&192)==128&&(M&192)==128&&(B&192)==128&&(D=(C&15)<<18|(F&63)<<12|(M&63)<<6|B&63,D>65535&&D<1114112&&(A=D))}}A===null?(A=65533,S=1):A>65535&&(A-=65536,m.push(A>>>10&1023|55296),A=56320|A&1023),m.push(A),O+=S}return ae(m)}var X=4096;function ae(h){var r=h.length;if(r<=X)return String.fromCharCode.apply(String,h);for(var o="",m=0;m<r;)o+=String.fromCharCode.apply(String,h.slice(m,m+=X));return o}function ce(h,r,o){var m="";o=Math.min(h.length,o);for(var O=r;O<o;++O)m+=String.fromCharCode(h[O]&127);return m}function le(h,r,o){var m="";o=Math.min(h.length,o);for(var O=r;O<o;++O)m+=String.fromCharCode(h[O]);return m}function de(h,r,o){var m=h.length;(!r||r<0)&&(r=0),(!o||o<0||o>m)&&(o=m);for(var O="",C=r;C<o;++C)O+=_e(h[C]);return O}function ue(h,r,o){for(var m=h.slice(r,o),O="",C=0;C<m.length;C+=2)O+=String.fromCharCode(m[C]+m[C+1]*256);return O}a.prototype.slice=function(r,o){var m=this.length;r=~~r,o=o===void 0?m:~~o,r<0?(r+=m,r<0&&(r=0)):r>m&&(r=m),o<0?(o+=m,o<0&&(o=0)):o>m&&(o=m),o<r&&(o=r);var O;if(a.TYPED_ARRAY_SUPPORT)O=this.subarray(r,o),O.__proto__=a.prototype;else{var C=o-r;O=new a(C,void 0);for(var A=0;A<C;++A)O[A]=this[A+r]}return O};function q(h,r,o){if(h%1!=0||h<0)throw new RangeError("offset is not uint");if(h+r>o)throw new RangeError("Trying to access beyond buffer length")}a.prototype.readUIntLE=function(r,o,m){r=r|0,o=o|0,m||q(r,o,this.length);for(var O=this[r],C=1,A=0;++A<o&&(C*=256);)O+=this[r+A]*C;return O},a.prototype.readUIntBE=function(r,o,m){r=r|0,o=o|0,m||q(r,o,this.length);for(var O=this[r+--o],C=1;o>0&&(C*=256);)O+=this[r+--o]*C;return O},a.prototype.readUInt8=function(r,o){return o||q(r,1,this.length),this[r]},a.prototype.readUInt16LE=function(r,o){return o||q(r,2,this.length),this[r]|this[r+1]<<8},a.prototype.readUInt16BE=function(r,o){return o||q(r,2,this.length),this[r]<<8|this[r+1]},a.prototype.readUInt32LE=function(r,o){return o||q(r,4,this.length),(this[r]|this[r+1]<<8|this[r+2]<<16)+this[r+3]*16777216},a.prototype.readUInt32BE=function(r,o){return o||q(r,4,this.length),this[r]*16777216+(this[r+1]<<16|this[r+2]<<8|this[r+3])},a.prototype.readIntLE=function(r,o,m){r=r|0,o=o|0,m||q(r,o,this.length);for(var O=this[r],C=1,A=0;++A<o&&(C*=256);)O+=this[r+A]*C;return C*=128,O>=C&&(O-=Math.pow(2,8*o)),O},a.prototype.readIntBE=function(r,o,m){r=r|0,o=o|0,m||q(r,o,this.length);for(var O=o,C=1,A=this[r+--O];O>0&&(C*=256);)A+=this[r+--O]*C;return C*=128,A>=C&&(A-=Math.pow(2,8*o)),A},a.prototype.readInt8=function(r,o){return o||q(r,1,this.length),this[r]&128?(255-this[r]+1)*-1:this[r]},a.prototype.readInt16LE=function(r,o){o||q(r,2,this.length);var m=this[r]|this[r+1]<<8;return m&32768?m|4294901760:m},a.prototype.readInt16BE=function(r,o){o||q(r,2,this.length);var m=this[r+1]|this[r]<<8;return m&32768?m|4294901760:m},a.prototype.readInt32LE=function(r,o){return o||q(r,4,this.length),this[r]|this[r+1]<<8|this[r+2]<<16|this[r+3]<<24},a.prototype.readInt32BE=function(r,o){return o||q(r,4,this.length),this[r]<<24|this[r+1]<<16|this[r+2]<<8|this[r+3]},a.prototype.readFloatLE=function(r,o){return o||q(r,4,this.length),w.read(this,r,!0,23,4)},a.prototype.readFloatBE=function(r,o){return o||q(r,4,this.length),w.read(this,r,!1,23,4)},a.prototype.readDoubleLE=function(r,o){return o||q(r,8,this.length),w.read(this,r,!0,52,8)},a.prototype.readDoubleBE=function(r,o){return o||q(r,8,this.length),w.read(this,r,!1,52,8)};function W(h,r,o,m,O,C){if(!a.isBuffer(h))throw new TypeError('"buffer" argument must be a Buffer instance');if(r>O||r<C)throw new RangeError('"value" argument is out of bounds');if(o+m>h.length)throw new RangeError("Index out of range")}a.prototype.writeUIntLE=function(r,o,m,O){if(r=+r,o=o|0,m=m|0,!O){var C=Math.pow(2,8*m)-1;W(this,r,o,m,C,0)}var A=1,S=0;for(this[o]=r&255;++S<m&&(A*=256);)this[o+S]=r/A&255;return o+m},a.prototype.writeUIntBE=function(r,o,m,O){if(r=+r,o=o|0,m=m|0,!O){var C=Math.pow(2,8*m)-1;W(this,r,o,m,C,0)}var A=m-1,S=1;for(this[o+A]=r&255;--A>=0&&(S*=256);)this[o+A]=r/S&255;return o+m},a.prototype.writeUInt8=function(r,o,m){return r=+r,o=o|0,m||W(this,r,o,1,255,0),a.TYPED_ARRAY_SUPPORT||(r=Math.floor(r)),this[o]=r&255,o+1};function H(h,r,o,m){r<0&&(r=65535+r+1);for(var O=0,C=Math.min(h.length-o,2);O<C;++O)h[o+O]=(r&255<<8*(m?O:1-O))>>>(m?O:1-O)*8}a.prototype.writeUInt16LE=function(r,o,m){return r=+r,o=o|0,m||W(this,r,o,2,65535,0),a.TYPED_ARRAY_SUPPORT?(this[o]=r&255,this[o+1]=r>>>8):H(this,r,o,!0),o+2},a.prototype.writeUInt16BE=function(r,o,m){return r=+r,o=o|0,m||W(this,r,o,2,65535,0),a.TYPED_ARRAY_SUPPORT?(this[o]=r>>>8,this[o+1]=r&255):H(this,r,o,!1),o+2};function K(h,r,o,m){r<0&&(r=4294967295+r+1);for(var O=0,C=Math.min(h.length-o,4);O<C;++O)h[o+O]=r>>>(m?O:3-O)*8&255}a.prototype.writeUInt32LE=function(r,o,m){return r=+r,o=o|0,m||W(this,r,o,4,4294967295,0),a.TYPED_ARRAY_SUPPORT?(this[o+3]=r>>>24,this[o+2]=r>>>16,this[o+1]=r>>>8,this[o]=r&255):K(this,r,o,!0),o+4},a.prototype.writeUInt32BE=function(r,o,m){return r=+r,o=o|0,m||W(this,r,o,4,4294967295,0),a.TYPED_ARRAY_SUPPORT?(this[o]=r>>>24,this[o+1]=r>>>16,this[o+2]=r>>>8,this[o+3]=r&255):K(this,r,o,!1),o+4},a.prototype.writeIntLE=function(r,o,m,O){if(r=+r,o=o|0,!O){var C=Math.pow(2,8*m-1);W(this,r,o,m,C-1,-C)}var A=0,S=1,F=0;for(this[o]=r&255;++A<m&&(S*=256);)r<0&&F===0&&this[o+A-1]!==0&&(F=1),this[o+A]=(r/S>>0)-F&255;return o+m},a.prototype.writeIntBE=function(r,o,m,O){if(r=+r,o=o|0,!O){var C=Math.pow(2,8*m-1);W(this,r,o,m,C-1,-C)}var A=m-1,S=1,F=0;for(this[o+A]=r&255;--A>=0&&(S*=256);)r<0&&F===0&&this[o+A+1]!==0&&(F=1),this[o+A]=(r/S>>0)-F&255;return o+m},a.prototype.writeInt8=function(r,o,m){return r=+r,o=o|0,m||W(this,r,o,1,127,-128),a.TYPED_ARRAY_SUPPORT||(r=Math.floor(r)),r<0&&(r=255+r+1),this[o]=r&255,o+1},a.prototype.writeInt16LE=function(r,o,m){return r=+r,o=o|0,m||W(this,r,o,2,32767,-32768),a.TYPED_ARRAY_SUPPORT?(this[o]=r&255,this[o+1]=r>>>8):H(this,r,o,!0),o+2},a.prototype.writeInt16BE=function(r,o,m){return r=+r,o=o|0,m||W(this,r,o,2,32767,-32768),a.TYPED_ARRAY_SUPPORT?(this[o]=r>>>8,this[o+1]=r&255):H(this,r,o,!1),o+2},a.prototype.writeInt32LE=function(r,o,m){return r=+r,o=o|0,m||W(this,r,o,4,2147483647,-2147483648),a.TYPED_ARRAY_SUPPORT?(this[o]=r&255,this[o+1]=r>>>8,this[o+2]=r>>>16,this[o+3]=r>>>24):K(this,r,o,!0),o+4},a.prototype.writeInt32BE=function(r,o,m){return r=+r,o=o|0,m||W(this,r,o,4,2147483647,-2147483648),r<0&&(r=4294967295+r+1),a.TYPED_ARRAY_SUPPORT?(this[o]=r>>>24,this[o+1]=r>>>16,this[o+2]=r>>>8,this[o+3]=r&255):K(this,r,o,!1),o+4};function G(h,r,o,m,O,C){if(o+m>h.length)throw new RangeError("Index out of range");if(o<0)throw new RangeError("Index out of range")}function Z(h,r,o,m,O){return O||G(h,r,o,4),w.write(h,r,o,m,23,4),o+4}a.prototype.writeFloatLE=function(r,o,m){return Z(this,r,o,!0,m)},a.prototype.writeFloatBE=function(r,o,m){return Z(this,r,o,!1,m)};function Q(h,r,o,m,O){return O||G(h,r,o,8),w.write(h,r,o,m,52,8),o+8}a.prototype.writeDoubleLE=function(r,o,m){return Q(this,r,o,!0,m)},a.prototype.writeDoubleBE=function(r,o,m){return Q(this,r,o,!1,m)},a.prototype.copy=function(r,o,m,O){if(m||(m=0),!O&&O!==0&&(O=this.length),o>=r.length&&(o=r.length),o||(o=0),O>0&&O<m&&(O=m),O===m||r.length===0||this.length===0)return 0;if(o<0)throw new RangeError("targetStart out of bounds");if(m<0||m>=this.length)throw new RangeError("sourceStart out of bounds");if(O<0)throw new RangeError("sourceEnd out of bounds");O>this.length&&(O=this.length),r.length-o<O-m&&(O=r.length-o+m);var C=O-m,A;if(this===r&&m<o&&o<O)for(A=C-1;A>=0;--A)r[A+o]=this[A+m];else if(C<1e3||!a.TYPED_ARRAY_SUPPORT)for(A=0;A<C;++A)r[A+o]=this[A+m];else Uint8Array.prototype.set.call(r,this.subarray(m,m+C),o);return C},a.prototype.fill=function(r,o,m,O){if(typeof r=="string"){if(typeof o=="string"?(O=o,o=0,m=this.length):typeof m=="string"&&(O=m,m=this.length),r.length===1){var C=r.charCodeAt(0);C<256&&(r=C)}if(O!==void 0&&typeof O!="string")throw new TypeError("encoding must be a string");if(typeof O=="string"&&!a.isEncoding(O))throw new TypeError("Unknown encoding: "+O)}else typeof r=="number"&&(r=r&255);if(o<0||this.length<o||this.length<m)throw new RangeError("Out of range index");if(m<=o)return this;o=o>>>0,m=m===void 0?this.length:m>>>0,r||(r=0);var A;if(typeof r=="number")for(A=o;A<m;++A)this[A]=r;else{var S=a.isBuffer(r)?r:z(new a(r,O).toString()),F=S.length;for(A=0;A<m-o;++A)this[A+o]=S[A%F]}return this};var fe=/[^+\/0-9A-Za-z-_]/g;function pe(h){if(h=he(h).replace(fe,""),h.length<2)return"";for(;h.length%4!=0;)h=h+"=";return h}function he(h){return h.trim?h.trim():h.replace(/^\s+|\s+$/g,"")}function _e(h){return h<16?"0"+h.toString(16):h.toString(16)}function z(h,r){r=r||1/0;for(var o,m=h.length,O=null,C=[],A=0;A<m;++A){if(o=h.charCodeAt(A),o>55295&&o<57344){if(!O){if(o>56319){(r-=3)>-1&&C.push(239,191,189);continue}else if(A+1===m){(r-=3)>-1&&C.push(239,191,189);continue}O=o;continue}if(o<56320){(r-=3)>-1&&C.push(239,191,189),O=o;continue}o=(O-55296<<10|o-56320)+65536}else O&&(r-=3)>-1&&C.push(239,191,189);if(O=null,o<128){if((r-=1)<0)break;C.push(o)}else if(o<2048){if((r-=2)<0)break;C.push(o>>6|192,o&63|128)}else if(o<65536){if((r-=3)<0)break;C.push(o>>12|224,o>>6&63|128,o&63|128)}else if(o<1114112){if((r-=4)<0)break;C.push(o>>18|240,o>>12&63|128,o>>6&63|128,o&63|128)}else throw new Error("Invalid code point")}return C}function me(h){for(var r=[],o=0;o<h.length;++o)r.push(h.charCodeAt(o)&255);return r}function ye(h,r){for(var o,m,O,C=[],A=0;A<h.length&&!((r-=2)<0);++A)o=h.charCodeAt(A),m=o>>8,O=o%256,C.push(O),C.push(m);return C}function ee(h){return b.toByteArray(pe(h))}function $(h,r,o,m){for(var O=0;O<m&&!(O+o>=r.length||O>=h.length);++O)r[O+o]=h[O];return O}function be(h){return h!==h}}).call(this,c("./node_modules/webpack/buildin/global.js"))},"./node_modules/component-emitter/index.js":function(f,u,c){f.exports=l;function l(w){if(w)return b(w)}function b(w){for(var p in l.prototype)w[p]=l.prototype[p];return w}l.prototype.on=l.prototype.addEventListener=function(w,p){return this._callbacks=this._callbacks||{},(this._callbacks["$"+w]=this._callbacks["$"+w]||[]).push(p),this},l.prototype.once=function(w,p){function y(){this.off(w,y),p.apply(this,arguments)}return y.fn=p,this.on(w,y),this},l.prototype.off=l.prototype.removeListener=l.prototype.removeAllListeners=l.prototype.removeEventListener=function(w,p){if(this._callbacks=this._callbacks||{},arguments.length==0)return this._callbacks={},this;var y=this._callbacks["$"+w];if(!y)return this;if(arguments.length==1)return delete this._callbacks["$"+w],this;for(var g,j=0;j<y.length;j++)if(g=y[j],g===p||g.fn===p){y.splice(j,1);break}return y.length===0&&delete this._callbacks["$"+w],this},l.prototype.emit=function(w){this._callbacks=this._callbacks||{};for(var p=new Array(arguments.length-1),y=this._callbacks["$"+w],g=1;g<arguments.length;g++)p[g-1]=arguments[g];if(y){y=y.slice(0);for(var g=0,j=y.length;g<j;++g)y[g].apply(this,p)}return this},l.prototype.listeners=function(w){return this._callbacks=this._callbacks||{},this._callbacks["$"+w]||[]},l.prototype.hasListeners=function(w){return!!this.listeners(w).length}},"./node_modules/engine.io-client/lib/globalThis.browser.js":function(f,u){f.exports=(()=>typeof self!="undefined"?self:typeof window!="undefined"?window:Function("return this")())()},"./node_modules/engine.io-client/lib/index.js":function(f,u,c){const l=c("./node_modules/engine.io-client/lib/socket.js");f.exports=(b,w)=>new l(b,w),f.exports.Socket=l,f.exports.protocol=l.protocol,f.exports.Transport=c("./node_modules/engine.io-client/lib/transport.js"),f.exports.transports=c("./node_modules/engine.io-client/lib/transports/index.js"),f.exports.parser=c("./node_modules/engine.io-client/node_modules/engine.io-parser/lib/index.js")},"./node_modules/engine.io-client/lib/socket.js":function(f,u,c){const l=c("./node_modules/engine.io-client/lib/transports/index.js"),b=c("./node_modules/component-emitter/index.js"),w=c("./node_modules/engine.io-client/node_modules/debug/src/browser.js")("engine.io-client:socket"),p=c("./node_modules/engine.io-client/node_modules/engine.io-parser/lib/index.js"),y=c("./node_modules/engine.io-client/node_modules/parseuri/index.js"),g=c("./node_modules/engine.io-client/node_modules/parseqs/index.js");class j extends b{constructor(n,t={}){super();n&&typeof n=="object"&&(t=n,n=null),n?(n=y(n),t.hostname=n.host,t.secure=n.protocol==="https"||n.protocol==="wss",t.port=n.port,n.query&&(t.query=n.query)):t.host&&(t.hostname=y(t.host).host),this.secure=t.secure!=null?t.secure:typeof location!="undefined"&&location.protocol==="https:",t.hostname&&!t.port&&(t.port=this.secure?"443":"80"),this.hostname=t.hostname||(typeof location!="undefined"?location.hostname:"localhost"),this.port=t.port||(typeof location!="undefined"&&location.port?location.port:this.secure?443:80),this.transports=t.transports||["polling","websocket"],this.readyState="",this.writeBuffer=[],this.prevBufferLen=0,this.opts=Object.assign({path:"/engine.io",agent:!1,withCredentials:!1,upgrade:!0,jsonp:!0,timestampParam:"t",rememberUpgrade:!1,rejectUnauthorized:!0,perMessageDeflate:{threshold:1024},transportOptions:{}},t),this.opts.path=this.opts.path.replace(/\/$/,"")+"/",typeof this.opts.query=="string"&&(this.opts.query=g.decode(this.opts.query)),this.id=null,this.upgrades=null,this.pingInterval=null,this.pingTimeout=null,this.pingTimeoutTimer=null,typeof addEventListener=="function"&&(addEventListener("beforeunload",()=>{this.transport&&(this.transport.removeAllListeners(),this.transport.close())},!1),this.hostname!=="localhost"&&(this.offlineEventListener=()=>{this.onClose("transport close")},addEventListener("offline",this.offlineEventListener,!1))),this.open()}createTransport(n){w('creating transport "%s"',n);const t=a(this.opts.query);t.EIO=p.protocol,t.transport=n,this.id&&(t.sid=this.id);const s=Object.assign({},this.opts.transportOptions[n],this.opts,{query:t,socket:this,hostname:this.hostname,secure:this.secure,port:this.port});return w("options: %j",s),new l[n](s)}open(){let n;if(this.opts.rememberUpgrade&&j.priorWebsocketSuccess&&this.transports.indexOf("websocket")!==-1)n="websocket";else if(this.transports.length===0){const t=this;setTimeout(function(){t.emit("error","No transports available")},0);return}else n=this.transports[0];this.readyState="opening";try{n=this.createTransport(n)}catch(t){w("error while creating transport: %s",t),this.transports.shift(),this.open();return}n.open(),this.setTransport(n)}setTransport(n){w("setting transport %s",n.name);const t=this;this.transport&&(w("clearing existing transport %s",this.transport.name),this.transport.removeAllListeners()),this.transport=n,n.on("drain",function(){t.onDrain()}).on("packet",function(s){t.onPacket(s)}).on("error",function(s){t.onError(s)}).on("close",function(){t.onClose("transport close")})}probe(n){w('probing transport "%s"',n);let t=this.createTransport(n,{probe:1}),s=!1;const d=this;j.priorWebsocketSuccess=!1;function _(){if(d.onlyBinaryUpgrades){const I=!this.supportsBinary&&d.transport.supportsBinary;s=s||I}s||(w('probe transport "%s" opened',n),t.send([{type:"ping",data:"probe"}]),t.once("packet",function(I){if(!s)if(I.type==="pong"&&I.data==="probe"){if(w('probe transport "%s" pong',n),d.upgrading=!0,d.emit("upgrading",t),!t)return;j.priorWebsocketSuccess=t.name==="websocket",w('pausing current transport "%s"',d.transport.name),d.transport.pause(function(){s||d.readyState!=="closed"&&(w("changing transport and sending upgrade packet"),R(),d.setTransport(t),t.send([{type:"upgrade"}]),d.emit("upgrade",t),t=null,d.upgrading=!1,d.flush())})}else{w('probe transport "%s" failed',n);const T=new Error("probe error");T.transport=t.name,d.emit("upgradeError",T)}}))}function v(){s||(s=!0,R(),t.close(),t=null)}function k(I){const T=new Error("probe error: "+I);T.transport=t.name,v(),w('probe transport "%s" failed because of error: %s',n,I),d.emit("upgradeError",T)}function E(){k("transport closed")}function P(){k("socket closed")}function x(I){t&&I.name!==t.name&&(w('"%s" works - aborting "%s"',I.name,t.name),v())}function R(){t.removeListener("open",_),t.removeListener("error",k),t.removeListener("close",E),d.removeListener("close",P),d.removeListener("upgrading",x)}t.once("open",_),t.once("error",k),t.once("close",E),this.once("close",P),this.once("upgrading",x),t.open()}onOpen(){if(w("socket open"),this.readyState="open",j.priorWebsocketSuccess=this.transport.name==="websocket",this.emit("open"),this.flush(),this.readyState==="open"&&this.opts.upgrade&&this.transport.pause){w("starting upgrade probes");let n=0;const t=this.upgrades.length;for(;n<t;n++)this.probe(this.upgrades[n])}}onPacket(n){if(this.readyState==="opening"||this.readyState==="open"||this.readyState==="closing")switch(w('socket receive: type "%s", data "%s"',n.type,n.data),this.emit("packet",n),this.emit("heartbeat"),n.type){case"open":this.onHandshake(JSON.parse(n.data));break;case"ping":this.resetPingTimeout(),this.sendPacket("pong"),this.emit("pong");break;case"error":const t=new Error("server error");t.code=n.data,this.onError(t);break;case"message":this.emit("data",n.data),this.emit("message",n.data);break}else w('packet received with socket readyState "%s"',this.readyState)}onHandshake(n){this.emit("handshake",n),this.id=n.sid,this.transport.query.sid=n.sid,this.upgrades=this.filterUpgrades(n.upgrades),this.pingInterval=n.pingInterval,this.pingTimeout=n.pingTimeout,this.onOpen(),this.readyState!=="closed"&&this.resetPingTimeout()}resetPingTimeout(){clearTimeout(this.pingTimeoutTimer),this.pingTimeoutTimer=setTimeout(()=>{this.onClose("ping timeout")},this.pingInterval+this.pingTimeout),this.opts.autoUnref&&this.pingTimeoutTimer.unref()}onDrain(){this.writeBuffer.splice(0,this.prevBufferLen),this.prevBufferLen=0,this.writeBuffer.length===0?this.emit("drain"):this.flush()}flush(){this.readyState!=="closed"&&this.transport.writable&&!this.upgrading&&this.writeBuffer.length&&(w("flushing %d packets in socket",this.writeBuffer.length),this.transport.send(this.writeBuffer),this.prevBufferLen=this.writeBuffer.length,this.emit("flush"))}write(n,t,s){return this.sendPacket("message",n,t,s),this}send(n,t,s){return this.sendPacket("message",n,t,s),this}sendPacket(n,t,s,d){if(typeof t=="function"&&(d=t,t=void 0),typeof s=="function"&&(d=s,s=null),this.readyState==="closing"||this.readyState==="closed")return;s=s||{},s.compress=s.compress!==!1;const _={type:n,data:t,options:s};this.emit("packetCreate",_),this.writeBuffer.push(_),d&&this.once("flush",d),this.flush()}close(){const n=this;(this.readyState==="opening"||this.readyState==="open")&&(this.readyState="closing",this.writeBuffer.length?this.once("drain",function(){this.upgrading?d():t()}):this.upgrading?d():t());function t(){n.onClose("forced close"),w("socket closing - telling transport to close"),n.transport.close()}function s(){n.removeListener("upgrade",s),n.removeListener("upgradeError",s),t()}function d(){n.once("upgrade",s),n.once("upgradeError",s)}return this}onError(n){w("socket error %j",n),j.priorWebsocketSuccess=!1,this.emit("error",n),this.onClose("transport error",n)}onClose(n,t){if(this.readyState==="opening"||this.readyState==="open"||this.readyState==="closing"){w('socket close with reason: "%s"',n);const s=this;clearTimeout(this.pingIntervalTimer),clearTimeout(this.pingTimeoutTimer),this.transport.removeAllListeners("close"),this.transport.close(),this.transport.removeAllListeners(),typeof removeEventListener=="function"&&removeEventListener("offline",this.offlineEventListener,!1),this.readyState="closed",this.id=null,this.emit("close",n,t),s.writeBuffer=[],s.prevBufferLen=0}}filterUpgrades(n){const t=[];let s=0;const d=n.length;for(;s<d;s++)~this.transports.indexOf(n[s])&&t.push(n[s]);return t}}j.priorWebsocketSuccess=!1,j.protocol=p.protocol;function a(e){const n={};for(let t in e)e.hasOwnProperty(t)&&(n[t]=e[t]);return n}f.exports=j},"./node_modules/engine.io-client/lib/transport.js":function(f,u,c){const l=c("./node_modules/engine.io-client/node_modules/engine.io-parser/lib/index.js"),b=c("./node_modules/component-emitter/index.js"),w=c("./node_modules/engine.io-client/node_modules/debug/src/browser.js")("engine.io-client:transport");class p extends b{constructor(g){super();this.opts=g,this.query=g.query,this.readyState="",this.socket=g.socket}onError(g,j){const a=new Error(g);return a.type="TransportError",a.description=j,this.emit("error",a),this}open(){return(this.readyState==="closed"||this.readyState==="")&&(this.readyState="opening",this.doOpen()),this}close(){return(this.readyState==="opening"||this.readyState==="open")&&(this.doClose(),this.onClose()),this}send(g){this.readyState==="open"?this.write(g):w("transport is not open, discarding packets")}onOpen(){this.readyState="open",this.writable=!0,this.emit("open")}onData(g){const j=l.decodePacket(g,this.socket.binaryType);this.onPacket(j)}onPacket(g){this.emit("packet",g)}onClose(){this.readyState="closed",this.emit("close")}}f.exports=p},"./node_modules/engine.io-client/lib/transports/index.js":function(f,u,c){const l=c("./node_modules/engine.io-client/lib/xmlhttprequest.js"),b=c("./node_modules/engine.io-client/lib/transports/polling-xhr.js"),w=c("./node_modules/engine.io-client/lib/transports/polling-jsonp.js"),p=c("./node_modules/engine.io-client/lib/transports/websocket.js");u.polling=y,u.websocket=p;function y(g){let j,a=!1,e=!1;const n=g.jsonp!==!1;if(typeof location!="undefined"){const t=location.protocol==="https:";let s=location.port;s||(s=t?443:80),a=g.hostname!==location.hostname||s!==g.port,e=g.secure!==t}if(g.xdomain=a,g.xscheme=e,j=new l(g),"open"in j&&!g.forceJSONP)return new b(g);if(!n)throw new Error("JSONP disabled");return new w(g)}},"./node_modules/engine.io-client/lib/transports/polling-jsonp.js":function(f,u,c){const l=c("./node_modules/engine.io-client/lib/transports/polling.js"),b=c("./node_modules/engine.io-client/lib/globalThis.browser.js"),w=/\n/g,p=/\\n/g;let y;class g extends l{constructor(a){super(a);this.query=this.query||{},y||(y=b.___eio=b.___eio||[]),this.index=y.length;const e=this;y.push(function(n){e.onData(n)}),this.query.j=this.index}get supportsBinary(){return!1}doClose(){this.script&&(this.script.onerror=()=>{},this.script.parentNode.removeChild(this.script),this.script=null),this.form&&(this.form.parentNode.removeChild(this.form),this.form=null,this.iframe=null),super.doClose()}doPoll(){const a=this,e=document.createElement("script");this.script&&(this.script.parentNode.removeChild(this.script),this.script=null),e.async=!0,e.src=this.uri(),e.onerror=function(s){a.onError("jsonp poll error",s)};const n=document.getElementsByTagName("script")[0];n?n.parentNode.insertBefore(e,n):(document.head||document.body).appendChild(e),this.script=e,typeof navigator!="undefined"&&/gecko/i.test(navigator.userAgent)&&setTimeout(function(){const s=document.createElement("iframe");document.body.appendChild(s),document.body.removeChild(s)},100)}doWrite(a,e){const n=this;let t;if(!this.form){const _=document.createElement("form"),v=document.createElement("textarea"),k=this.iframeId="eio_iframe_"+this.index;_.className="socketio",_.style.position="absolute",_.style.top="-1000px",_.style.left="-1000px",_.target=k,_.method="POST",_.setAttribute("accept-charset","utf-8"),v.name="d",_.appendChild(v),document.body.appendChild(_),this.form=_,this.area=v}this.form.action=this.uri();function s(){d(),e()}function d(){if(n.iframe)try{n.form.removeChild(n.iframe)}catch(_){n.onError("jsonp polling iframe removal error",_)}try{const _='<iframe src="javascript:0" name="'+n.iframeId+'">';t=document.createElement(_)}catch{t=document.createElement("iframe"),t.name=n.iframeId,t.src="javascript:0"}t.id=n.iframeId,n.form.appendChild(t),n.iframe=t}d(),a=a.replace(p,`\\
`),this.area.value=a.replace(w,"\\n");try{this.form.submit()}catch{}this.iframe.attachEvent?this.iframe.onreadystatechange=function(){n.iframe.readyState==="complete"&&s()}:this.iframe.onload=s}}f.exports=g},"./node_modules/engine.io-client/lib/transports/polling-xhr.js":function(f,u,c){const l=c("./node_modules/engine.io-client/lib/xmlhttprequest.js"),b=c("./node_modules/engine.io-client/lib/transports/polling.js"),w=c("./node_modules/component-emitter/index.js"),{pick:p}=c("./node_modules/engine.io-client/lib/util.js"),y=c("./node_modules/engine.io-client/lib/globalThis.browser.js"),g=c("./node_modules/engine.io-client/node_modules/debug/src/browser.js")("engine.io-client:polling-xhr");function j(){}const a=function(){return new l({xdomain:!1}).responseType!=null}();class e extends b{constructor(d){super(d);if(typeof location!="undefined"){const v=location.protocol==="https:";let k=location.port;k||(k=v?443:80),this.xd=typeof location!="undefined"&&d.hostname!==location.hostname||k!==d.port,this.xs=d.secure!==v}const _=d&&d.forceBase64;this.supportsBinary=a&&!_}request(d={}){return Object.assign(d,{xd:this.xd,xs:this.xs},this.opts),new n(this.uri(),d)}doWrite(d,_){const v=this.request({method:"POST",data:d}),k=this;v.on("success",_),v.on("error",function(E){k.onError("xhr post error",E)})}doPoll(){g("xhr poll");const d=this.request(),_=this;d.on("data",function(v){_.onData(v)}),d.on("error",function(v){_.onError("xhr poll error",v)}),this.pollXhr=d}}class n extends w{constructor(d,_){super();this.opts=_,this.method=_.method||"GET",this.uri=d,this.async=_.async!==!1,this.data=_.data!==void 0?_.data:null,this.create()}create(){const d=p(this.opts,"agent","enablesXDR","pfx","key","passphrase","cert","ca","ciphers","rejectUnauthorized","autoUnref");d.xdomain=!!this.opts.xd,d.xscheme=!!this.opts.xs;const _=this.xhr=new l(d),v=this;try{g("xhr open %s: %s",this.method,this.uri),_.open(this.method,this.uri,this.async);try{if(this.opts.extraHeaders){_.setDisableHeaderCheck&&_.setDisableHeaderCheck(!0);for(let k in this.opts.extraHeaders)this.opts.extraHeaders.hasOwnProperty(k)&&_.setRequestHeader(k,this.opts.extraHeaders[k])}}catch{}if(this.method==="POST")try{_.setRequestHeader("Content-type","text/plain;charset=UTF-8")}catch{}try{_.setRequestHeader("Accept","*/*")}catch{}"withCredentials"in _&&(_.withCredentials=this.opts.withCredentials),this.opts.requestTimeout&&(_.timeout=this.opts.requestTimeout),this.hasXDR()?(_.onload=function(){v.onLoad()},_.onerror=function(){v.onError(_.responseText)}):_.onreadystatechange=function(){_.readyState===4&&(_.status===200||_.status===1223?v.onLoad():setTimeout(function(){v.onError(typeof _.status=="number"?_.status:0)},0))},g("xhr data %s",this.data),_.send(this.data)}catch(k){setTimeout(function(){v.onError(k)},0);return}typeof document!="undefined"&&(this.index=n.requestsCount++,n.requests[this.index]=this)}onSuccess(){this.emit("success"),this.cleanup()}onData(d){this.emit("data",d),this.onSuccess()}onError(d){this.emit("error",d),this.cleanup(!0)}cleanup(d){if(!(typeof this.xhr=="undefined"||this.xhr===null)){if(this.hasXDR()?this.xhr.onload=this.xhr.onerror=j:this.xhr.onreadystatechange=j,d)try{this.xhr.abort()}catch{}typeof document!="undefined"&&delete n.requests[this.index],this.xhr=null}}onLoad(){const d=this.xhr.responseText;d!==null&&this.onData(d)}hasXDR(){return typeof XDomainRequest!="undefined"&&!this.xs&&this.enablesXDR}abort(){this.cleanup()}}if(n.requestsCount=0,n.requests={},typeof document!="undefined"){if(typeof attachEvent=="function")attachEvent("onunload",t);else if(typeof addEventListener=="function"){const s="onpagehide"in y?"pagehide":"unload";addEventListener(s,t,!1)}}function t(){for(let s in n.requests)n.requests.hasOwnProperty(s)&&n.requests[s].abort()}f.exports=e,f.exports.Request=n},"./node_modules/engine.io-client/lib/transports/polling.js":function(f,u,c){const l=c("./node_modules/engine.io-client/lib/transport.js"),b=c("./node_modules/engine.io-client/node_modules/parseqs/index.js"),w=c("./node_modules/engine.io-client/node_modules/engine.io-parser/lib/index.js"),p=c("./node_modules/yeast/index.js"),y=c("./node_modules/engine.io-client/node_modules/debug/src/browser.js")("engine.io-client:polling");class g extends l{get name(){return"polling"}doOpen(){this.poll()}pause(a){const e=this;this.readyState="pausing";function n(){y("paused"),e.readyState="paused",a()}if(this.polling||!this.writable){let t=0;this.polling&&(y("we are currently polling - waiting to pause"),t++,this.once("pollComplete",function(){y("pre-pause polling complete"),--t||n()})),this.writable||(y("we are currently writing - waiting to pause"),t++,this.once("drain",function(){y("pre-pause writing complete"),--t||n()}))}else n()}poll(){y("polling"),this.polling=!0,this.doPoll(),this.emit("poll")}onData(a){const e=this;y("polling got data %s",a);const n=function(t,s,d){if(e.readyState==="opening"&&t.type==="open"&&e.onOpen(),t.type==="close")return e.onClose(),!1;e.onPacket(t)};w.decodePayload(a,this.socket.binaryType).forEach(n),this.readyState!=="closed"&&(this.polling=!1,this.emit("pollComplete"),this.readyState==="open"?this.poll():y('ignoring poll - transport state "%s"',this.readyState))}doClose(){const a=this;function e(){y("writing close packet"),a.write([{type:"close"}])}this.readyState==="open"?(y("transport open - closing"),e()):(y("transport not open - deferring close"),this.once("open",e))}write(a){this.writable=!1,w.encodePayload(a,e=>{this.doWrite(e,()=>{this.writable=!0,this.emit("drain")})})}uri(){let a=this.query||{};const e=this.opts.secure?"https":"http";let n="";this.opts.timestampRequests!==!1&&(a[this.opts.timestampParam]=p()),!this.supportsBinary&&!a.sid&&(a.b64=1),a=b.encode(a),this.opts.port&&(e==="https"&&Number(this.opts.port)!==443||e==="http"&&Number(this.opts.port)!==80)&&(n=":"+this.opts.port),a.length&&(a="?"+a);const t=this.opts.hostname.indexOf(":")!==-1;return e+"://"+(t?"["+this.opts.hostname+"]":this.opts.hostname)+n+this.opts.path+a}}f.exports=g},"./node_modules/engine.io-client/lib/transports/websocket-constructor.browser.js":function(f,u,c){const l=c("./node_modules/engine.io-client/lib/globalThis.browser.js");f.exports={WebSocket:l.WebSocket||l.MozWebSocket,usingBrowserWebSocket:!0,defaultBinaryType:"arraybuffer"}},"./node_modules/engine.io-client/lib/transports/websocket.js":function(f,u,c){(function(l){const b=c("./node_modules/engine.io-client/lib/transport.js"),w=c("./node_modules/engine.io-client/node_modules/engine.io-parser/lib/index.js"),p=c("./node_modules/engine.io-client/node_modules/parseqs/index.js"),y=c("./node_modules/yeast/index.js"),{pick:g}=c("./node_modules/engine.io-client/lib/util.js"),{WebSocket:j,usingBrowserWebSocket:a,defaultBinaryType:e}=c("./node_modules/engine.io-client/lib/transports/websocket-constructor.browser.js"),n=c("./node_modules/engine.io-client/node_modules/debug/src/browser.js")("engine.io-client:websocket"),t=typeof navigator!="undefined"&&typeof navigator.product=="string"&&navigator.product.toLowerCase()==="reactnative";class s extends b{constructor(_){super(_);this.supportsBinary=!_.forceBase64}get name(){return"websocket"}doOpen(){if(!this.check())return;const _=this.uri(),v=this.opts.protocols,k=t?{}:g(this.opts,"agent","perMessageDeflate","pfx","key","passphrase","cert","ca","ciphers","rejectUnauthorized","localAddress","protocolVersion","origin","maxPayload","family","checkServerIdentity");this.opts.extraHeaders&&(k.headers=this.opts.extraHeaders);try{this.ws=a&&!t?v?new j(_,v):new j(_):new j(_,v,k)}catch(E){return this.emit("error",E)}this.ws.binaryType=this.socket.binaryType||e,this.addEventListeners()}addEventListeners(){this.ws.onopen=()=>{this.opts.autoUnref&&this.ws._socket.unref(),this.onOpen()},this.ws.onclose=this.onClose.bind(this),this.ws.onmessage=_=>this.onData(_.data),this.ws.onerror=_=>this.onError("websocket error",_)}write(_){const v=this;this.writable=!1;let k=_.length,E=0;const P=k;for(;E<P;E++)(function(R){w.encodePacket(R,v.supportsBinary,function(I){const T={};a||(R.options&&(T.compress=R.options.compress),v.opts.perMessageDeflate&&(typeof I=="string"?l.byteLength(I):I.length)<v.opts.perMessageDeflate.threshold&&(T.compress=!1));try{a?v.ws.send(I):v.ws.send(I,T)}catch{n("websocket closed before onclose event")}--k||x()})})(_[E]);function x(){v.emit("flush"),setTimeout(function(){v.writable=!0,v.emit("drain")},0)}}onClose(){b.prototype.onClose.call(this)}doClose(){typeof this.ws!="undefined"&&(this.ws.close(),this.ws=null)}uri(){let _=this.query||{};const v=this.opts.secure?"wss":"ws";let k="";this.opts.port&&(v==="wss"&&Number(this.opts.port)!==443||v==="ws"&&Number(this.opts.port)!==80)&&(k=":"+this.opts.port),this.opts.timestampRequests&&(_[this.opts.timestampParam]=y()),this.supportsBinary||(_.b64=1),_=p.encode(_),_.length&&(_="?"+_);const E=this.opts.hostname.indexOf(":")!==-1;return v+"://"+(E?"["+this.opts.hostname+"]":this.opts.hostname)+k+this.opts.path+_}check(){return!!j&&!("__initialize"in j&&this.name===s.prototype.name)}}f.exports=s}).call(this,c("./node_modules/buffer/index.js").Buffer)},"./node_modules/engine.io-client/lib/util.js":function(f,u){f.exports.pick=(c,...l)=>l.reduce((b,w)=>(c.hasOwnProperty(w)&&(b[w]=c[w]),b),{})},"./node_modules/engine.io-client/lib/xmlhttprequest.js":function(f,u,c){const l=c("./node_modules/has-cors/index.js"),b=c("./node_modules/engine.io-client/lib/globalThis.browser.js");f.exports=function(w){const p=w.xdomain,y=w.xscheme,g=w.enablesXDR;try{if(typeof XMLHttpRequest!="undefined"&&(!p||l))return new XMLHttpRequest}catch{}try{if(typeof XDomainRequest!="undefined"&&!y&&g)return new XDomainRequest}catch{}if(!p)try{return new b[["Active"].concat("Object").join("X")]("Microsoft.XMLHTTP")}catch{}}},"./node_modules/engine.io-client/node_modules/base64-arraybuffer/lib/base64-arraybuffer.js":function(f,u){(function(c){u.encode=function(l){var b=new Uint8Array(l),w,p=b.length,y="";for(w=0;w<p;w+=3)y+=c[b[w]>>2],y+=c[(b[w]&3)<<4|b[w+1]>>4],y+=c[(b[w+1]&15)<<2|b[w+2]>>6],y+=c[b[w+2]&63];return p%3==2?y=y.substring(0,y.length-1)+"=":p%3==1&&(y=y.substring(0,y.length-2)+"=="),y},u.decode=function(l){var b=l.length*.75,w=l.length,p,y=0,g,j,a,e;l[l.length-1]==="="&&(b--,l[l.length-2]==="="&&b--);var n=new ArrayBuffer(b),t=new Uint8Array(n);for(p=0;p<w;p+=4)g=c.indexOf(l[p]),j=c.indexOf(l[p+1]),a=c.indexOf(l[p+2]),e=c.indexOf(l[p+3]),t[y++]=g<<2|j>>4,t[y++]=(j&15)<<4|a>>2,t[y++]=(a&3)<<6|e&63;return n}})("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/")},"./node_modules/engine.io-client/node_modules/debug/src/browser.js":function(f,u,c){(function(l){u.formatArgs=w,u.save=p,u.load=y,u.useColors=b,u.storage=g(),u.destroy=(()=>{let a=!1;return()=>{a||(a=!0,console.warn("Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`."))}})(),u.colors=["#0000CC","#0000FF","#0033CC","#0033FF","#0066CC","#0066FF","#0099CC","#0099FF","#00CC00","#00CC33","#00CC66","#00CC99","#00CCCC","#00CCFF","#3300CC","#3300FF","#3333CC","#3333FF","#3366CC","#3366FF","#3399CC","#3399FF","#33CC00","#33CC33","#33CC66","#33CC99","#33CCCC","#33CCFF","#6600CC","#6600FF","#6633CC","#6633FF","#66CC00","#66CC33","#9900CC","#9900FF","#9933CC","#9933FF","#99CC00","#99CC33","#CC0000","#CC0033","#CC0066","#CC0099","#CC00CC","#CC00FF","#CC3300","#CC3333","#CC3366","#CC3399","#CC33CC","#CC33FF","#CC6600","#CC6633","#CC9900","#CC9933","#CCCC00","#CCCC33","#FF0000","#FF0033","#FF0066","#FF0099","#FF00CC","#FF00FF","#FF3300","#FF3333","#FF3366","#FF3399","#FF33CC","#FF33FF","#FF6600","#FF6633","#FF9900","#FF9933","#FFCC00","#FFCC33"];function b(){return typeof window!="undefined"&&window.process&&(window.process.type==="renderer"||window.process.__nwjs)?!0:typeof navigator!="undefined"&&navigator.userAgent&&navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/)?!1:typeof document!="undefined"&&document.documentElement&&document.documentElement.style&&document.documentElement.style.WebkitAppearance||typeof window!="undefined"&&window.console&&(window.console.firebug||window.console.exception&&window.console.table)||typeof navigator!="undefined"&&navigator.userAgent&&navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/)&&parseInt(RegExp.$1,10)>=31||typeof navigator!="undefined"&&navigator.userAgent&&navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/)}function w(a){if(a[0]=(this.useColors?"%c":"")+this.namespace+(this.useColors?" %c":" ")+a[0]+(this.useColors?"%c ":" ")+"+"+f.exports.humanize(this.diff),!this.useColors)return;const e="color: "+this.color;a.splice(1,0,e,"color: inherit");let n=0,t=0;a[0].replace(/%[a-zA-Z%]/g,s=>{s!=="%%"&&(n++,s==="%c"&&(t=n))}),a.splice(t,0,e)}u.log=console.debug||console.log||(()=>{});function p(a){try{a?u.storage.setItem("debug",a):u.storage.removeItem("debug")}catch{}}function y(){let a;try{a=u.storage.getItem("debug")}catch{}return!a&&typeof l!="undefined"&&"env"in l&&(a={}.DEBUG),a}function g(){try{return localStorage}catch{}}f.exports=c("./node_modules/engine.io-client/node_modules/debug/src/common.js")(u);const{formatters:j}=f.exports;j.j=function(a){try{return JSON.stringify(a)}catch(e){return"[UnexpectedJSONParseError]: "+e.message}}}).call(this,c("./node_modules/process/browser.js"))},"./node_modules/engine.io-client/node_modules/debug/src/common.js":function(f,u,c){function l(b){p.debug=p,p.default=p,p.coerce=n,p.disable=j,p.enable=g,p.enabled=a,p.humanize=c("./node_modules/ms/index.js"),p.destroy=t,Object.keys(b).forEach(s=>{p[s]=b[s]}),p.names=[],p.skips=[],p.formatters={};function w(s){let d=0;for(let _=0;_<s.length;_++)d=(d<<5)-d+s.charCodeAt(_),d|=0;return p.colors[Math.abs(d)%p.colors.length]}p.selectColor=w;function p(s){let d,_=null;function v(...k){if(!v.enabled)return;const E=v,P=Number(new Date),x=P-(d||P);E.diff=x,E.prev=d,E.curr=P,d=P,k[0]=p.coerce(k[0]),typeof k[0]!="string"&&k.unshift("%O");let R=0;k[0]=k[0].replace(/%([a-zA-Z%])/g,(T,U)=>{if(T==="%%")return"%";R++;const L=p.formatters[U];if(typeof L=="function"){const N=k[R];T=L.call(E,N),k.splice(R,1),R--}return T}),p.formatArgs.call(E,k),(E.log||p.log).apply(E,k)}return v.namespace=s,v.useColors=p.useColors(),v.color=p.selectColor(s),v.extend=y,v.destroy=p.destroy,Object.defineProperty(v,"enabled",{enumerable:!0,configurable:!1,get:()=>_===null?p.enabled(s):_,set:k=>{_=k}}),typeof p.init=="function"&&p.init(v),v}function y(s,d){const _=p(this.namespace+(typeof d=="undefined"?":":d)+s);return _.log=this.log,_}function g(s){p.save(s),p.names=[],p.skips=[];let d;const _=(typeof s=="string"?s:"").split(/[\s,]+/),v=_.length;for(d=0;d<v;d++)!_[d]||(s=_[d].replace(/\*/g,".*?"),s[0]==="-"?p.skips.push(new RegExp("^"+s.substr(1)+"$")):p.names.push(new RegExp("^"+s+"$")))}function j(){const s=[...p.names.map(e),...p.skips.map(e).map(d=>"-"+d)].join(",");return p.enable(""),s}function a(s){if(s[s.length-1]==="*")return!0;let d,_;for(d=0,_=p.skips.length;d<_;d++)if(p.skips[d].test(s))return!1;for(d=0,_=p.names.length;d<_;d++)if(p.names[d].test(s))return!0;return!1}function e(s){return s.toString().substring(2,s.toString().length-2).replace(/\.\*\?$/,"*")}function n(s){return s instanceof Error?s.stack||s.message:s}function t(){console.warn("Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.")}return p.enable(p.load()),p}f.exports=l},"./node_modules/engine.io-client/node_modules/engine.io-parser/lib/commons.js":function(f,u){const c=Object.create(null);c.open="0",c.close="1",c.ping="2",c.pong="3",c.message="4",c.upgrade="5",c.noop="6";const l=Object.create(null);Object.keys(c).forEach(w=>{l[c[w]]=w});const b={type:"error",data:"parser error"};f.exports={PACKET_TYPES:c,PACKET_TYPES_REVERSE:l,ERROR_PACKET:b}},"./node_modules/engine.io-client/node_modules/engine.io-parser/lib/decodePacket.browser.js":function(f,u,c){const{PACKET_TYPES_REVERSE:l,ERROR_PACKET:b}=c("./node_modules/engine.io-client/node_modules/engine.io-parser/lib/commons.js"),w=typeof ArrayBuffer=="function";let p;w&&(p=c("./node_modules/engine.io-client/node_modules/base64-arraybuffer/lib/base64-arraybuffer.js"));const y=(a,e)=>{if(typeof a!="string")return{type:"message",data:j(a,e)};const n=a.charAt(0);return n==="b"?{type:"message",data:g(a.substring(1),e)}:l[n]?a.length>1?{type:l[n],data:a.substring(1)}:{type:l[n]}:b},g=(a,e)=>{if(p){const n=p.decode(a);return j(n,e)}else return{base64:!0,data:a}},j=(a,e)=>{switch(e){case"blob":return a instanceof ArrayBuffer?new Blob([a]):a;case"arraybuffer":default:return a}};f.exports=y},"./node_modules/engine.io-client/node_modules/engine.io-parser/lib/encodePacket.browser.js":function(f,u,c){const{PACKET_TYPES:l}=c("./node_modules/engine.io-client/node_modules/engine.io-parser/lib/commons.js"),b=typeof Blob=="function"||typeof Blob!="undefined"&&Object.prototype.toString.call(Blob)==="[object BlobConstructor]",w=typeof ArrayBuffer=="function",p=j=>typeof ArrayBuffer.isView=="function"?ArrayBuffer.isView(j):j&&j.buffer instanceof ArrayBuffer,y=({type:j,data:a},e,n)=>b&&a instanceof Blob?e?n(a):g(a,n):w&&(a instanceof ArrayBuffer||p(a))?e?n(a instanceof ArrayBuffer?a:a.buffer):g(new Blob([a]),n):n(l[j]+(a||"")),g=(j,a)=>{const e=new FileReader;return e.onload=function(){const n=e.result.split(",")[1];a("b"+n)},e.readAsDataURL(j)};f.exports=y},"./node_modules/engine.io-client/node_modules/engine.io-parser/lib/index.js":function(f,u,c){const l=c("./node_modules/engine.io-client/node_modules/engine.io-parser/lib/encodePacket.browser.js"),b=c("./node_modules/engine.io-client/node_modules/engine.io-parser/lib/decodePacket.browser.js"),w=String.fromCharCode(30),p=(g,j)=>{const a=g.length,e=new Array(a);let n=0;g.forEach((t,s)=>{l(t,!1,d=>{e[s]=d,++n===a&&j(e.join(w))})})},y=(g,j)=>{const a=g.split(w),e=[];for(let n=0;n<a.length;n++){const t=b(a[n],j);if(e.push(t),t.type==="error")break}return e};f.exports={protocol:4,encodePacket:l,encodePayload:p,decodePacket:b,decodePayload:y}},"./node_modules/engine.io-client/node_modules/parseqs/index.js":function(f,u){u.encode=function(c){var l="";for(var b in c)c.hasOwnProperty(b)&&(l.length&&(l+="&"),l+=encodeURIComponent(b)+"="+encodeURIComponent(c[b]));return l},u.decode=function(c){for(var l={},b=c.split("&"),w=0,p=b.length;w<p;w++){var y=b[w].split("=");l[decodeURIComponent(y[0])]=decodeURIComponent(y[1])}return l}},"./node_modules/engine.io-client/node_modules/parseuri/index.js":function(f,u){var c=/^(?:(?![^:@]+:[^:@\/]*@)(http|https|ws|wss):\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?((?:[a-f0-9]{0,4}:){2,7}[a-f0-9]{0,4}|[^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/,l=["source","protocol","authority","userInfo","user","password","host","port","relative","path","directory","file","query","anchor"];f.exports=function(y){var g=y,j=y.indexOf("["),a=y.indexOf("]");j!=-1&&a!=-1&&(y=y.substring(0,j)+y.substring(j,a).replace(/:/g,";")+y.substring(a,y.length));for(var e=c.exec(y||""),n={},t=14;t--;)n[l[t]]=e[t]||"";return j!=-1&&a!=-1&&(n.source=g,n.host=n.host.substring(1,n.host.length-1).replace(/;/g,":"),n.authority=n.authority.replace("[","").replace("]","").replace(/;/g,":"),n.ipv6uri=!0),n.pathNames=b(n,n.path),n.queryKey=w(n,n.query),n};function b(p,y){var g=/\/{2,9}/g,j=y.replace(g,"/").split("/");return(y.substr(0,1)=="/"||y.length===0)&&j.splice(0,1),y.substr(y.length-1,1)=="/"&&j.splice(j.length-1,1),j}function w(p,y){var g={};return y.replace(/(?:^|&)([^&=]*)=?([^&]*)/g,function(j,a,e){a&&(g[a]=e)}),g}},"./node_modules/has-cors/index.js":function(f,u){try{f.exports=typeof XMLHttpRequest!="undefined"&&"withCredentials"in new XMLHttpRequest}catch{f.exports=!1}},"./node_modules/ieee754/index.js":function(f,u){u.read=function(c,l,b,w,p){var y,g,j=p*8-w-1,a=(1<<j)-1,e=a>>1,n=-7,t=b?p-1:0,s=b?-1:1,d=c[l+t];for(t+=s,y=d&(1<<-n)-1,d>>=-n,n+=j;n>0;y=y*256+c[l+t],t+=s,n-=8);for(g=y&(1<<-n)-1,y>>=-n,n+=w;n>0;g=g*256+c[l+t],t+=s,n-=8);if(y===0)y=1-e;else{if(y===a)return g?NaN:(d?-1:1)*(1/0);g=g+Math.pow(2,w),y=y-e}return(d?-1:1)*g*Math.pow(2,y-w)},u.write=function(c,l,b,w,p,y){var g,j,a,e=y*8-p-1,n=(1<<e)-1,t=n>>1,s=p===23?Math.pow(2,-24)-Math.pow(2,-77):0,d=w?0:y-1,_=w?1:-1,v=l<0||l===0&&1/l<0?1:0;for(l=Math.abs(l),isNaN(l)||l===1/0?(j=isNaN(l)?1:0,g=n):(g=Math.floor(Math.log(l)/Math.LN2),l*(a=Math.pow(2,-g))<1&&(g--,a*=2),g+t>=1?l+=s/a:l+=s*Math.pow(2,1-t),l*a>=2&&(g++,a/=2),g+t>=n?(j=0,g=n):g+t>=1?(j=(l*a-1)*Math.pow(2,p),g=g+t):(j=l*Math.pow(2,t-1)*Math.pow(2,p),g=0));p>=8;c[b+d]=j&255,d+=_,j/=256,p-=8);for(g=g<<p|j,e+=p;e>0;c[b+d]=g&255,d+=_,g/=256,e-=8);c[b+d-_]|=v*128}},"./node_modules/isarray/index.js":function(f,u){var c={}.toString;f.exports=Array.isArray||function(l){return c.call(l)=="[object Array]"}},"./node_modules/ms/index.js":function(f,u){var c=1e3,l=c*60,b=l*60,w=b*24,p=w*7,y=w*365.25;f.exports=function(n,t){t=t||{};var s=typeof n;if(s==="string"&&n.length>0)return g(n);if(s==="number"&&isFinite(n))return t.long?a(n):j(n);throw new Error("val is not a non-empty string or a valid number. val="+JSON.stringify(n))};function g(n){if(n=String(n),!(n.length>100)){var t=/^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(n);if(!!t){var s=parseFloat(t[1]),d=(t[2]||"ms").toLowerCase();switch(d){case"years":case"year":case"yrs":case"yr":case"y":return s*y;case"weeks":case"week":case"w":return s*p;case"days":case"day":case"d":return s*w;case"hours":case"hour":case"hrs":case"hr":case"h":return s*b;case"minutes":case"minute":case"mins":case"min":case"m":return s*l;case"seconds":case"second":case"secs":case"sec":case"s":return s*c;case"milliseconds":case"millisecond":case"msecs":case"msec":case"ms":return s;default:return}}}}function j(n){var t=Math.abs(n);return t>=w?Math.round(n/w)+"d":t>=b?Math.round(n/b)+"h":t>=l?Math.round(n/l)+"m":t>=c?Math.round(n/c)+"s":n+"ms"}function a(n){var t=Math.abs(n);return t>=w?e(n,t,w,"day"):t>=b?e(n,t,b,"hour"):t>=l?e(n,t,l,"minute"):t>=c?e(n,t,c,"second"):n+" ms"}function e(n,t,s,d){var _=t>=s*1.5;return Math.round(n/s)+" "+d+(_?"s":"")}},"./node_modules/process/browser.js":function(f,u){var c=f.exports={},l,b;function w(){throw new Error("setTimeout has not been defined")}function p(){throw new Error("clearTimeout has not been defined")}(function(){try{typeof setTimeout=="function"?l=setTimeout:l=w}catch{l=w}try{typeof clearTimeout=="function"?b=clearTimeout:b=p}catch{b=p}})();function y(v){if(l===setTimeout)return setTimeout(v,0);if((l===w||!l)&&setTimeout)return l=setTimeout,setTimeout(v,0);try{return l(v,0)}catch{try{return l.call(null,v,0)}catch{return l.call(this,v,0)}}}function g(v){if(b===clearTimeout)return clearTimeout(v);if((b===p||!b)&&clearTimeout)return b=clearTimeout,clearTimeout(v);try{return b(v)}catch{try{return b.call(null,v)}catch{return b.call(this,v)}}}var j=[],a=!1,e,n=-1;function t(){!a||!e||(a=!1,e.length?j=e.concat(j):n=-1,j.length&&s())}function s(){if(!a){var v=y(t);a=!0;for(var k=j.length;k;){for(e=j,j=[];++n<k;)e&&e[n].run();n=-1,k=j.length}e=null,a=!1,g(v)}}c.nextTick=function(v){var k=new Array(arguments.length-1);if(arguments.length>1)for(var E=1;E<arguments.length;E++)k[E-1]=arguments[E];j.push(new d(v,k)),j.length===1&&!a&&y(s)};function d(v,k){this.fun=v,this.array=k}d.prototype.run=function(){this.fun.apply(null,this.array)},c.title="browser",c.browser=!0,c.env={},c.argv=[],c.version="",c.versions={};function _(){}c.on=_,c.addListener=_,c.once=_,c.off=_,c.removeListener=_,c.removeAllListeners=_,c.emit=_,c.prependListener=_,c.prependOnceListener=_,c.listeners=function(v){return[]},c.binding=function(v){throw new Error("process.binding is not supported")},c.cwd=function(){return"/"},c.chdir=function(v){throw new Error("process.chdir is not supported")},c.umask=function(){return 0}},"./node_modules/socket.io-client/build/index.js":function(f,u,c){Object.defineProperty(u,"__esModule",{value:!0}),u.Socket=u.io=u.Manager=u.protocol=void 0;const l=c("./node_modules/socket.io-client/build/url.js"),b=c("./node_modules/socket.io-client/build/manager.js"),w=c("./node_modules/socket.io-client/build/socket.js");Object.defineProperty(u,"Socket",{enumerable:!0,get:function(){return w.Socket}});const p=c("./node_modules/socket.io-client/node_modules/debug/src/browser.js")("socket.io-client");f.exports=u=g;const y=u.managers={};function g(e,n){typeof e=="object"&&(n=e,e=void 0),n=n||{};const t=l.url(e,n.path),s=t.source,d=t.id,_=t.path,v=y[d]&&_ in y[d].nsps,k=n.forceNew||n["force new connection"]||n.multiplex===!1||v;let E;return k?(p("ignoring socket cache for %s",s),E=new b.Manager(s,n)):(y[d]||(p("new io instance for %s",s),y[d]=new b.Manager(s,n)),E=y[d]),t.query&&!n.query&&(n.query=t.queryKey),E.socket(t.path,n)}u.io=g;var j=c("./node_modules/socket.io-client/node_modules/socket.io-parser/dist/index.js");Object.defineProperty(u,"protocol",{enumerable:!0,get:function(){return j.protocol}}),u.connect=g;var a=c("./node_modules/socket.io-client/build/manager.js");Object.defineProperty(u,"Manager",{enumerable:!0,get:function(){return a.Manager}}),u.default=g},"./node_modules/socket.io-client/build/manager.js":function(f,u,c){Object.defineProperty(u,"__esModule",{value:!0}),u.Manager=void 0;const l=c("./node_modules/engine.io-client/lib/index.js"),b=c("./node_modules/socket.io-client/build/socket.js"),w=c("./node_modules/socket.io-client/node_modules/socket.io-parser/dist/index.js"),p=c("./node_modules/socket.io-client/build/on.js"),y=c("./node_modules/backo2/index.js"),g=c("./node_modules/socket.io-client/build/typed-events.js"),j=c("./node_modules/socket.io-client/node_modules/debug/src/browser.js")("socket.io-client:manager");class a extends g.StrictEventEmitter{constructor(n,t){super();this.nsps={},this.subs=[],n&&typeof n=="object"&&(t=n,n=void 0),t=t||{},t.path=t.path||"/socket.io",this.opts=t,this.reconnection(t.reconnection!==!1),this.reconnectionAttempts(t.reconnectionAttempts||1/0),this.reconnectionDelay(t.reconnectionDelay||1e3),this.reconnectionDelayMax(t.reconnectionDelayMax||5e3),this.randomizationFactor(t.randomizationFactor||.5),this.backoff=new y({min:this.reconnectionDelay(),max:this.reconnectionDelayMax(),jitter:this.randomizationFactor()}),this.timeout(t.timeout==null?2e4:t.timeout),this._readyState="closed",this.uri=n;const s=t.parser||w;this.encoder=new s.Encoder,this.decoder=new s.Decoder,this._autoConnect=t.autoConnect!==!1,this._autoConnect&&this.open()}reconnection(n){return arguments.length?(this._reconnection=!!n,this):this._reconnection}reconnectionAttempts(n){return n===void 0?this._reconnectionAttempts:(this._reconnectionAttempts=n,this)}reconnectionDelay(n){var t;return n===void 0?this._reconnectionDelay:(this._reconnectionDelay=n,(t=this.backoff)===null||t===void 0||t.setMin(n),this)}randomizationFactor(n){var t;return n===void 0?this._randomizationFactor:(this._randomizationFactor=n,(t=this.backoff)===null||t===void 0||t.setJitter(n),this)}reconnectionDelayMax(n){var t;return n===void 0?this._reconnectionDelayMax:(this._reconnectionDelayMax=n,(t=this.backoff)===null||t===void 0||t.setMax(n),this)}timeout(n){return arguments.length?(this._timeout=n,this):this._timeout}maybeReconnectOnOpen(){!this._reconnecting&&this._reconnection&&this.backoff.attempts===0&&this.reconnect()}open(n){if(j("readyState %s",this._readyState),~this._readyState.indexOf("open"))return this;j("opening %s",this.uri),this.engine=l(this.uri,this.opts);const t=this.engine,s=this;this._readyState="opening",this.skipReconnect=!1;const d=p.on(t,"open",function(){s.onopen(),n&&n()}),_=p.on(t,"error",v=>{j("error"),s.cleanup(),s._readyState="closed",this.emitReserved("error",v),n?n(v):s.maybeReconnectOnOpen()});if(this._timeout!==!1){const v=this._timeout;j("connect attempt will timeout after %d",v),v===0&&d();const k=setTimeout(()=>{j("connect attempt timed out after %d",v),d(),t.close(),t.emit("error",new Error("timeout"))},v);this.opts.autoUnref&&k.unref(),this.subs.push(function(){clearTimeout(k)})}return this.subs.push(d),this.subs.push(_),this}connect(n){return this.open(n)}onopen(){j("open"),this.cleanup(),this._readyState="open",this.emitReserved("open");const n=this.engine;this.subs.push(p.on(n,"ping",this.onping.bind(this)),p.on(n,"data",this.ondata.bind(this)),p.on(n,"error",this.onerror.bind(this)),p.on(n,"close",this.onclose.bind(this)),p.on(this.decoder,"decoded",this.ondecoded.bind(this)))}onping(){this.emitReserved("ping")}ondata(n){this.decoder.add(n)}ondecoded(n){this.emitReserved("packet",n)}onerror(n){j("error",n),this.emitReserved("error",n)}socket(n,t){let s=this.nsps[n];return s||(s=new b.Socket(this,n,t),this.nsps[n]=s),s}_destroy(n){const t=Object.keys(this.nsps);for(const s of t)if(this.nsps[s].active){j("socket %s is still active, skipping close",s);return}this._close()}_packet(n){j("writing packet %j",n);const t=this.encoder.encode(n);for(let s=0;s<t.length;s++)this.engine.write(t[s],n.options)}cleanup(){j("cleanup"),this.subs.forEach(n=>n()),this.subs.length=0,this.decoder.destroy()}_close(){j("disconnect"),this.skipReconnect=!0,this._reconnecting=!1,this._readyState==="opening"&&this.cleanup(),this.backoff.reset(),this._readyState="closed",this.engine&&this.engine.close()}disconnect(){return this._close()}onclose(n){j("onclose"),this.cleanup(),this.backoff.reset(),this._readyState="closed",this.emitReserved("close",n),this._reconnection&&!this.skipReconnect&&this.reconnect()}reconnect(){if(this._reconnecting||this.skipReconnect)return this;const n=this;if(this.backoff.attempts>=this._reconnectionAttempts)j("reconnect failed"),this.backoff.reset(),this.emitReserved("reconnect_failed"),this._reconnecting=!1;else{const t=this.backoff.duration();j("will wait %dms before reconnect attempt",t),this._reconnecting=!0;const s=setTimeout(()=>{n.skipReconnect||(j("attempting reconnect"),this.emitReserved("reconnect_attempt",n.backoff.attempts),!n.skipReconnect&&n.open(d=>{d?(j("reconnect attempt error"),n._reconnecting=!1,n.reconnect(),this.emitReserved("reconnect_error",d)):(j("reconnect success"),n.onreconnect())}))},t);this.opts.autoUnref&&s.unref(),this.subs.push(function(){clearTimeout(s)})}}onreconnect(){const n=this.backoff.attempts;this._reconnecting=!1,this.backoff.reset(),this.emitReserved("reconnect",n)}}u.Manager=a},"./node_modules/socket.io-client/build/on.js":function(f,u,c){Object.defineProperty(u,"__esModule",{value:!0}),u.on=void 0;function l(b,w,p){return b.on(w,p),function(){b.off(w,p)}}u.on=l},"./node_modules/socket.io-client/build/socket.js":function(f,u,c){Object.defineProperty(u,"__esModule",{value:!0}),u.Socket=void 0;const l=c("./node_modules/socket.io-client/node_modules/socket.io-parser/dist/index.js"),b=c("./node_modules/socket.io-client/build/on.js"),w=c("./node_modules/socket.io-client/build/typed-events.js"),p=c("./node_modules/socket.io-client/node_modules/debug/src/browser.js")("socket.io-client:socket"),y=Object.freeze({connect:1,connect_error:1,disconnect:1,disconnecting:1,newListener:1,removeListener:1});class g extends w.StrictEventEmitter{constructor(a,e,n){super();this.receiveBuffer=[],this.sendBuffer=[],this.ids=0,this.acks={},this.flags={},this.io=a,this.nsp=e,this.ids=0,this.acks={},this.receiveBuffer=[],this.sendBuffer=[],this.connected=!1,this.disconnected=!0,this.flags={},n&&n.auth&&(this.auth=n.auth),this.io._autoConnect&&this.open()}subEvents(){if(this.subs)return;const a=this.io;this.subs=[b.on(a,"open",this.onopen.bind(this)),b.on(a,"packet",this.onpacket.bind(this)),b.on(a,"error",this.onerror.bind(this)),b.on(a,"close",this.onclose.bind(this))]}get active(){return!!this.subs}connect(){return this.connected?this:(this.subEvents(),this.io._reconnecting||this.io.open(),this.io._readyState==="open"&&this.onopen(),this)}open(){return this.connect()}send(...a){return a.unshift("message"),this.emit.apply(this,a),this}emit(a,...e){if(y.hasOwnProperty(a))throw new Error('"'+a+'" is a reserved event name');e.unshift(a);const n={type:l.PacketType.EVENT,data:e};n.options={},n.options.compress=this.flags.compress!==!1,typeof e[e.length-1]=="function"&&(p("emitting packet with ack id %d",this.ids),this.acks[this.ids]=e.pop(),n.id=this.ids++);const t=this.io.engine&&this.io.engine.transport&&this.io.engine.transport.writable;return this.flags.volatile&&(!t||!this.connected)?p("discard packet as the transport is not currently writable"):this.connected?this.packet(n):this.sendBuffer.push(n),this.flags={},this}packet(a){a.nsp=this.nsp,this.io._packet(a)}onopen(){p("transport is open - connecting"),typeof this.auth=="function"?this.auth(a=>{this.packet({type:l.PacketType.CONNECT,data:a})}):this.packet({type:l.PacketType.CONNECT,data:this.auth})}onerror(a){this.connected||this.emitReserved("connect_error",a)}onclose(a){p("close (%s)",a),this.connected=!1,this.disconnected=!0,delete this.id,this.emitReserved("disconnect",a)}onpacket(a){if(a.nsp===this.nsp)switch(a.type){case l.PacketType.CONNECT:if(a.data&&a.data.sid){const t=a.data.sid;this.onconnect(t)}else this.emitReserved("connect_error",new Error("It seems you are trying to reach a Socket.IO server in v2.x with a v3.x client, but they are not compatible (more information here: https://socket.io/docs/v3/migrating-from-2-x-to-3-0/)"));break;case l.PacketType.EVENT:this.onevent(a);break;case l.PacketType.BINARY_EVENT:this.onevent(a);break;case l.PacketType.ACK:this.onack(a);break;case l.PacketType.BINARY_ACK:this.onack(a);break;case l.PacketType.DISCONNECT:this.ondisconnect();break;case l.PacketType.CONNECT_ERROR:const n=new Error(a.data.message);n.data=a.data.data,this.emitReserved("connect_error",n);break}}onevent(a){const e=a.data||[];p("emitting event %j",e),a.id!=null&&(p("attaching ack callback to event"),e.push(this.ack(a.id))),this.connected?this.emitEvent(e):this.receiveBuffer.push(Object.freeze(e))}emitEvent(a){if(this._anyListeners&&this._anyListeners.length){const e=this._anyListeners.slice();for(const n of e)n.apply(this,a)}super.emit.apply(this,a)}ack(a){const e=this;let n=!1;return function(...t){n||(n=!0,p("sending ack %j",t),e.packet({type:l.PacketType.ACK,id:a,data:t}))}}onack(a){const e=this.acks[a.id];typeof e=="function"?(p("calling ack %s with %j",a.id,a.data),e.apply(this,a.data),delete this.acks[a.id]):p("bad ack %s",a.id)}onconnect(a){p("socket connected with id %s",a),this.id=a,this.connected=!0,this.disconnected=!1,this.emitReserved("connect"),this.emitBuffered()}emitBuffered(){this.receiveBuffer.forEach(a=>this.emitEvent(a)),this.receiveBuffer=[],this.sendBuffer.forEach(a=>this.packet(a)),this.sendBuffer=[]}ondisconnect(){p("server disconnect (%s)",this.nsp),this.destroy(),this.onclose("io server disconnect")}destroy(){this.subs&&(this.subs.forEach(a=>a()),this.subs=void 0),this.io._destroy(this)}disconnect(){return this.connected&&(p("performing disconnect (%s)",this.nsp),this.packet({type:l.PacketType.DISCONNECT})),this.destroy(),this.connected&&this.onclose("io client disconnect"),this}close(){return this.disconnect()}compress(a){return this.flags.compress=a,this}get volatile(){return this.flags.volatile=!0,this}onAny(a){return this._anyListeners=this._anyListeners||[],this._anyListeners.push(a),this}prependAny(a){return this._anyListeners=this._anyListeners||[],this._anyListeners.unshift(a),this}offAny(a){if(!this._anyListeners)return this;if(a){const e=this._anyListeners;for(let n=0;n<e.length;n++)if(a===e[n])return e.splice(n,1),this}else this._anyListeners=[];return this}listenersAny(){return this._anyListeners||[]}}u.Socket=g},"./node_modules/socket.io-client/build/typed-events.js":function(f,u,c){Object.defineProperty(u,"__esModule",{value:!0}),u.StrictEventEmitter=void 0;const l=c("./node_modules/component-emitter/index.js");class b extends l{on(p,y){return super.on(p,y),this}once(p,y){return super.once(p,y),this}emit(p,...y){return super.emit(p,...y),this}emitReserved(p,...y){return super.emit(p,...y),this}listeners(p){return super.listeners(p)}}u.StrictEventEmitter=b},"./node_modules/socket.io-client/build/url.js":function(f,u,c){Object.defineProperty(u,"__esModule",{value:!0}),u.url=void 0;const l=c("./node_modules/socket.io-client/node_modules/parseuri/index.js"),b=c("./node_modules/socket.io-client/node_modules/debug/src/browser.js")("socket.io-client:url");function w(p,y="",g){let j=p;g=g||typeof location!="undefined"&&location,p==null&&(p=g.protocol+"//"+g.host),typeof p=="string"&&(p.charAt(0)==="/"&&(p.charAt(1)==="/"?p=g.protocol+p:p=g.host+p),/^(https?|wss?):\/\//.test(p)||(b("protocol-less url %s",p),typeof g!="undefined"?p=g.protocol+"//"+p:p="https://"+p),b("parse %s",p),j=l(p)),j.port||(/^(http|ws)$/.test(j.protocol)?j.port="80":/^(http|ws)s$/.test(j.protocol)&&(j.port="443")),j.path=j.path||"/";const e=j.host.indexOf(":")!==-1?"["+j.host+"]":j.host;return j.id=j.protocol+"://"+e+":"+j.port+y,j.href=j.protocol+"://"+e+(g&&g.port===j.port?"":":"+j.port),j}u.url=w},"./node_modules/socket.io-client/node_modules/debug/src/browser.js":function(f,u,c){(function(l){u.formatArgs=w,u.save=p,u.load=y,u.useColors=b,u.storage=g(),u.destroy=(()=>{let a=!1;return()=>{a||(a=!0,console.warn("Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`."))}})(),u.colors=["#0000CC","#0000FF","#0033CC","#0033FF","#0066CC","#0066FF","#0099CC","#0099FF","#00CC00","#00CC33","#00CC66","#00CC99","#00CCCC","#00CCFF","#3300CC","#3300FF","#3333CC","#3333FF","#3366CC","#3366FF","#3399CC","#3399FF","#33CC00","#33CC33","#33CC66","#33CC99","#33CCCC","#33CCFF","#6600CC","#6600FF","#6633CC","#6633FF","#66CC00","#66CC33","#9900CC","#9900FF","#9933CC","#9933FF","#99CC00","#99CC33","#CC0000","#CC0033","#CC0066","#CC0099","#CC00CC","#CC00FF","#CC3300","#CC3333","#CC3366","#CC3399","#CC33CC","#CC33FF","#CC6600","#CC6633","#CC9900","#CC9933","#CCCC00","#CCCC33","#FF0000","#FF0033","#FF0066","#FF0099","#FF00CC","#FF00FF","#FF3300","#FF3333","#FF3366","#FF3399","#FF33CC","#FF33FF","#FF6600","#FF6633","#FF9900","#FF9933","#FFCC00","#FFCC33"];function b(){return typeof window!="undefined"&&window.process&&(window.process.type==="renderer"||window.process.__nwjs)?!0:typeof navigator!="undefined"&&navigator.userAgent&&navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/)?!1:typeof document!="undefined"&&document.documentElement&&document.documentElement.style&&document.documentElement.style.WebkitAppearance||typeof window!="undefined"&&window.console&&(window.console.firebug||window.console.exception&&window.console.table)||typeof navigator!="undefined"&&navigator.userAgent&&navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/)&&parseInt(RegExp.$1,10)>=31||typeof navigator!="undefined"&&navigator.userAgent&&navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/)}function w(a){if(a[0]=(this.useColors?"%c":"")+this.namespace+(this.useColors?" %c":" ")+a[0]+(this.useColors?"%c ":" ")+"+"+f.exports.humanize(this.diff),!this.useColors)return;const e="color: "+this.color;a.splice(1,0,e,"color: inherit");let n=0,t=0;a[0].replace(/%[a-zA-Z%]/g,s=>{s!=="%%"&&(n++,s==="%c"&&(t=n))}),a.splice(t,0,e)}u.log=console.debug||console.log||(()=>{});function p(a){try{a?u.storage.setItem("debug",a):u.storage.removeItem("debug")}catch{}}function y(){let a;try{a=u.storage.getItem("debug")}catch{}return!a&&typeof l!="undefined"&&"env"in l&&(a={}.DEBUG),a}function g(){try{return localStorage}catch{}}f.exports=c("./node_modules/socket.io-client/node_modules/debug/src/common.js")(u);const{formatters:j}=f.exports;j.j=function(a){try{return JSON.stringify(a)}catch(e){return"[UnexpectedJSONParseError]: "+e.message}}}).call(this,c("./node_modules/process/browser.js"))},"./node_modules/socket.io-client/node_modules/debug/src/common.js":function(f,u,c){function l(b){p.debug=p,p.default=p,p.coerce=n,p.disable=j,p.enable=g,p.enabled=a,p.humanize=c("./node_modules/ms/index.js"),p.destroy=t,Object.keys(b).forEach(s=>{p[s]=b[s]}),p.names=[],p.skips=[],p.formatters={};function w(s){let d=0;for(let _=0;_<s.length;_++)d=(d<<5)-d+s.charCodeAt(_),d|=0;return p.colors[Math.abs(d)%p.colors.length]}p.selectColor=w;function p(s){let d,_=null;function v(...k){if(!v.enabled)return;const E=v,P=Number(new Date),x=P-(d||P);E.diff=x,E.prev=d,E.curr=P,d=P,k[0]=p.coerce(k[0]),typeof k[0]!="string"&&k.unshift("%O");let R=0;k[0]=k[0].replace(/%([a-zA-Z%])/g,(T,U)=>{if(T==="%%")return"%";R++;const L=p.formatters[U];if(typeof L=="function"){const N=k[R];T=L.call(E,N),k.splice(R,1),R--}return T}),p.formatArgs.call(E,k),(E.log||p.log).apply(E,k)}return v.namespace=s,v.useColors=p.useColors(),v.color=p.selectColor(s),v.extend=y,v.destroy=p.destroy,Object.defineProperty(v,"enabled",{enumerable:!0,configurable:!1,get:()=>_===null?p.enabled(s):_,set:k=>{_=k}}),typeof p.init=="function"&&p.init(v),v}function y(s,d){const _=p(this.namespace+(typeof d=="undefined"?":":d)+s);return _.log=this.log,_}function g(s){p.save(s),p.names=[],p.skips=[];let d;const _=(typeof s=="string"?s:"").split(/[\s,]+/),v=_.length;for(d=0;d<v;d++)!_[d]||(s=_[d].replace(/\*/g,".*?"),s[0]==="-"?p.skips.push(new RegExp("^"+s.substr(1)+"$")):p.names.push(new RegExp("^"+s+"$")))}function j(){const s=[...p.names.map(e),...p.skips.map(e).map(d=>"-"+d)].join(",");return p.enable(""),s}function a(s){if(s[s.length-1]==="*")return!0;let d,_;for(d=0,_=p.skips.length;d<_;d++)if(p.skips[d].test(s))return!1;for(d=0,_=p.names.length;d<_;d++)if(p.names[d].test(s))return!0;return!1}function e(s){return s.toString().substring(2,s.toString().length-2).replace(/\.\*\?$/,"*")}function n(s){return s instanceof Error?s.stack||s.message:s}function t(){console.warn("Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.")}return p.enable(p.load()),p}f.exports=l},"./node_modules/socket.io-client/node_modules/parseuri/index.js":function(f,u){var c=/^(?:(?![^:@]+:[^:@\/]*@)(http|https|ws|wss):\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?((?:[a-f0-9]{0,4}:){2,7}[a-f0-9]{0,4}|[^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/,l=["source","protocol","authority","userInfo","user","password","host","port","relative","path","directory","file","query","anchor"];f.exports=function(y){var g=y,j=y.indexOf("["),a=y.indexOf("]");j!=-1&&a!=-1&&(y=y.substring(0,j)+y.substring(j,a).replace(/:/g,";")+y.substring(a,y.length));for(var e=c.exec(y||""),n={},t=14;t--;)n[l[t]]=e[t]||"";return j!=-1&&a!=-1&&(n.source=g,n.host=n.host.substring(1,n.host.length-1).replace(/;/g,":"),n.authority=n.authority.replace("[","").replace("]","").replace(/;/g,":"),n.ipv6uri=!0),n.pathNames=b(n,n.path),n.queryKey=w(n,n.query),n};function b(p,y){var g=/\/{2,9}/g,j=y.replace(g,"/").split("/");return(y.substr(0,1)=="/"||y.length===0)&&j.splice(0,1),y.substr(y.length-1,1)=="/"&&j.splice(j.length-1,1),j}function w(p,y){var g={};return y.replace(/(?:^|&)([^&=]*)=?([^&]*)/g,function(j,a,e){a&&(g[a]=e)}),g}},"./node_modules/socket.io-client/node_modules/socket.io-parser/dist/binary.js":function(f,u,c){Object.defineProperty(u,"__esModule",{value:!0}),u.reconstructPacket=u.deconstructPacket=void 0;const l=c("./node_modules/socket.io-client/node_modules/socket.io-parser/dist/is-binary.js");function b(g){const j=[],a=g.data,e=g;return e.data=w(a,j),e.attachments=j.length,{packet:e,buffers:j}}u.deconstructPacket=b;function w(g,j){if(!g)return g;if(l.isBinary(g)){const a={_placeholder:!0,num:j.length};return j.push(g),a}else if(Array.isArray(g)){const a=new Array(g.length);for(let e=0;e<g.length;e++)a[e]=w(g[e],j);return a}else if(typeof g=="object"&&!(g instanceof Date)){const a={};for(const e in g)g.hasOwnProperty(e)&&(a[e]=w(g[e],j));return a}return g}function p(g,j){return g.data=y(g.data,j),g.attachments=void 0,g}u.reconstructPacket=p;function y(g,j){if(!g)return g;if(g&&g._placeholder)return j[g.num];if(Array.isArray(g))for(let a=0;a<g.length;a++)g[a]=y(g[a],j);else if(typeof g=="object")for(const a in g)g.hasOwnProperty(a)&&(g[a]=y(g[a],j));return g}},"./node_modules/socket.io-client/node_modules/socket.io-parser/dist/index.js":function(f,u,c){Object.defineProperty(u,"__esModule",{value:!0}),u.Decoder=u.Encoder=u.PacketType=u.protocol=void 0;const l=c("./node_modules/component-emitter/index.js"),b=c("./node_modules/socket.io-client/node_modules/socket.io-parser/dist/binary.js"),w=c("./node_modules/socket.io-client/node_modules/socket.io-parser/dist/is-binary.js"),p=c("./node_modules/socket.io-client/node_modules/debug/src/browser.js")("socket.io-parser");u.protocol=5;var y;(function(n){n[n.CONNECT=0]="CONNECT",n[n.DISCONNECT=1]="DISCONNECT",n[n.EVENT=2]="EVENT",n[n.ACK=3]="ACK",n[n.CONNECT_ERROR=4]="CONNECT_ERROR",n[n.BINARY_EVENT=5]="BINARY_EVENT",n[n.BINARY_ACK=6]="BINARY_ACK"})(y=u.PacketType||(u.PacketType={}));class g{encode(t){return p("encoding packet %j",t),(t.type===y.EVENT||t.type===y.ACK)&&w.hasBinary(t)?(t.type=t.type===y.EVENT?y.BINARY_EVENT:y.BINARY_ACK,this.encodeAsBinary(t)):[this.encodeAsString(t)]}encodeAsString(t){let s=""+t.type;return(t.type===y.BINARY_EVENT||t.type===y.BINARY_ACK)&&(s+=t.attachments+"-"),t.nsp&&t.nsp!=="/"&&(s+=t.nsp+","),t.id!=null&&(s+=t.id),t.data!=null&&(s+=JSON.stringify(t.data)),p("encoded %j as %s",t,s),s}encodeAsBinary(t){const s=b.deconstructPacket(t),d=this.encodeAsString(s.packet),_=s.buffers;return _.unshift(d),_}}u.Encoder=g;class j extends l{constructor(){super()}add(t){let s;if(typeof t=="string")s=this.decodeString(t),s.type===y.BINARY_EVENT||s.type===y.BINARY_ACK?(this.reconstructor=new e(s),s.attachments===0&&super.emit("decoded",s)):super.emit("decoded",s);else if(w.isBinary(t)||t.base64)if(this.reconstructor)s=this.reconstructor.takeBinaryData(t),s&&(this.reconstructor=null,super.emit("decoded",s));else throw new Error("got binary data when not reconstructing a packet");else throw new Error("Unknown type: "+t)}decodeString(t){let s=0;const d={type:Number(t.charAt(0))};if(y[d.type]===void 0)throw new Error("unknown packet type "+d.type);if(d.type===y.BINARY_EVENT||d.type===y.BINARY_ACK){const v=s+1;for(;t.charAt(++s)!=="-"&&s!=t.length;);const k=t.substring(v,s);if(k!=Number(k)||t.charAt(s)!=="-")throw new Error("Illegal attachments");d.attachments=Number(k)}if(t.charAt(s+1)==="/"){const v=s+1;for(;++s&&!(t.charAt(s)===","||s===t.length););d.nsp=t.substring(v,s)}else d.nsp="/";const _=t.charAt(s+1);if(_!==""&&Number(_)==_){const v=s+1;for(;++s;){const k=t.charAt(s);if(k==null||Number(k)!=k){--s;break}if(s===t.length)break}d.id=Number(t.substring(v,s+1))}if(t.charAt(++s)){const v=a(t.substr(s));if(j.isPayloadValid(d.type,v))d.data=v;else throw new Error("invalid payload")}return p("decoded %s as %j",t,d),d}static isPayloadValid(t,s){switch(t){case y.CONNECT:return typeof s=="object";case y.DISCONNECT:return s===void 0;case y.CONNECT_ERROR:return typeof s=="string"||typeof s=="object";case y.EVENT:case y.BINARY_EVENT:return Array.isArray(s)&&s.length>0;case y.ACK:case y.BINARY_ACK:return Array.isArray(s)}}destroy(){this.reconstructor&&this.reconstructor.finishedReconstruction()}}u.Decoder=j;function a(n){try{return JSON.parse(n)}catch{return!1}}class e{constructor(t){this.packet=t,this.buffers=[],this.reconPack=t}takeBinaryData(t){if(this.buffers.push(t),this.buffers.length===this.reconPack.attachments){const s=b.reconstructPacket(this.reconPack,this.buffers);return this.finishedReconstruction(),s}return null}finishedReconstruction(){this.reconPack=null,this.buffers=[]}}},"./node_modules/socket.io-client/node_modules/socket.io-parser/dist/is-binary.js":function(f,u,c){Object.defineProperty(u,"__esModule",{value:!0}),u.hasBinary=u.isBinary=void 0;const l=typeof ArrayBuffer=="function",b=a=>typeof ArrayBuffer.isView=="function"?ArrayBuffer.isView(a):a.buffer instanceof ArrayBuffer,w=Object.prototype.toString,p=typeof Blob=="function"||typeof Blob!="undefined"&&w.call(Blob)==="[object BlobConstructor]",y=typeof File=="function"||typeof File!="undefined"&&w.call(File)==="[object FileConstructor]";function g(a){return l&&(a instanceof ArrayBuffer||b(a))||p&&a instanceof Blob||y&&a instanceof File}u.isBinary=g;function j(a,e){if(!a||typeof a!="object")return!1;if(Array.isArray(a)){for(let n=0,t=a.length;n<t;n++)if(j(a[n]))return!0;return!1}if(g(a))return!0;if(a.toJSON&&typeof a.toJSON=="function"&&arguments.length===1)return j(a.toJSON(),!0);for(const n in a)if(Object.prototype.hasOwnProperty.call(a,n)&&j(a[n]))return!0;return!1}u.hasBinary=j},"./node_modules/webpack/buildin/global.js":function(f,u){var c;c=function(){return this}();try{c=c||new Function("return this")()}catch{typeof window=="object"&&(c=window)}f.exports=c},"./node_modules/worker-loader/dist/workers/InlineWorker.js":function(f,u,c){var l=window.URL||window.webkitURL;f.exports=function(b,w){try{try{var p;try{var y=window.BlobBuilder||window.WebKitBlobBuilder||window.MozBlobBuilder||window.MSBlobBuilder;p=new y,p.append(b),p=p.getBlob()}catch{p=new Blob([b])}return new Worker(l.createObjectURL(p))}catch{return new Worker("data:application/javascript,"+encodeURIComponent(b))}}catch{if(!w)throw Error("Inline worker is not supported");return new Worker(w)}}},"./node_modules/yeast/index.js":function(f,u,c){var l="0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_".split(""),b=64,w={},p=0,y=0,g;function j(n){var t="";do t=l[n%b]+t,n=Math.floor(n/b);while(n>0);return t}function a(n){var t=0;for(y=0;y<n.length;y++)t=t*b+w[n.charAt(y)];return t}function e(){var n=j(+new Date);return n!==g?(p=0,g=n):n+"."+j(p++)}for(;y<b;y++)w[l[y]]=y;e.encode=j,e.decode=a,f.exports=e},"./package.json":function(f){f.exports=JSON.parse('{"name":"imjoy-rpc","version":"0.2.42","description":"Remote procedure calls for ImJoy.","module":"index.js","scripts":{"build":"rm -rf dist && npm run build-umd","build-umd":"webpack --config webpack.config.js --mode development && NODE_ENV=production webpack --config webpack.config.js --mode production --devtool source-map ","watch":"NODE_ENV=production webpack --watch --progress --config webpack.config.js --mode production --devtool source-map","publish-npm":"npm install && npm run build && npm publish","serve":"webpack-dev-server","stats":"webpack --profile --json > stats.json","stats-prod":"webpack --profile --json --mode production > stats-prod.json","analyze":"webpack-bundle-analyzer -p 9999 stats.json","analyze-prod":"webpack-bundle-analyzer -p 9999 stats-prod.json","clean":"rimraf dist/*","deploy":"npm run build && node deploy-site.js","format":"prettier --write \\"{src,tests}/**/**\\"","check-format":"prettier --check \\"{src,tests}/**/**\\"","test":"karma start --single-run --browsers ChromeHeadless,FirefoxHeadless karma.conf.js","test-watch":"karma start --auto-watch --browsers Chrome,FirefoxHeadless karma.conf.js --debug"},"repository":{"type":"git","url":"git+https://github.com/imjoy-team/imjoy-rpc.git"},"keywords":["imjoy","rpc"],"author":"imjoy-team <imjoy.team@gmail.com>","license":"MIT","bugs":{"url":"https://github.com/imjoy-team/imjoy-rpc/issues"},"homepage":"https://github.com/imjoy-team/imjoy-rpc","dependencies":{"socket.io-client":"^4.0.1"},"devDependencies":{"@babel/core":"^7.0.0-beta.39","@babel/plugin-syntax-dynamic-import":"^7.0.0-beta.39","@babel/polyfill":"^7.0.0-beta.39","@babel/preset-env":"^7.0.0-beta.39","@types/requirejs":"^2.1.28","babel-core":"^6.26.0","babel-eslint":"^10.1.0","babel-loader":"^8.1.0","babel-runtime":"^6.26.0","chai":"^4.2.0","clean-webpack-plugin":"^0.1.19","copy-webpack-plugin":"^5.0.5","eslint":"^6.8.0","eslint-config-prettier":"^4.2.0","eslint-loader":"^4.0.2","file-loader":"^0.11.2","fs-extra":"^0.30.0","gh-pages":"^2.0.1","html-loader":"^0.5.5","html-webpack-plugin":"^3.2.0","json-loader":"^0.5.4","karma":"^4.4.1","karma-chrome-launcher":"^3.1.0","karma-firefox-launcher":"^1.3.0","karma-mocha":"^1.3.0","karma-spec-reporter":"0.0.32","karma-webpack":"^4.0.2","lerna":"^3.8.0","lodash.debounce":"^4.0.8","mocha":"^7.1.2","postcss":"^6.0.2","prettier":"^1.6.1","rimraf":"^2.6.2","schema-utils":"^0.4.3","socket.io-client":"^2.3.0","style-loader":"^0.18.1","url-loader":"^0.5.9","webpack":"^4.0.0","webpack-bundle-analyzer":"^3.3.2","webpack-cli":"^3.1.2","webpack-dev-server":"^3.1.1","webpack-merge":"^4.1.1","workbox-webpack-plugin":"^4.3.1","worker-loader":"^2.0.0","write-file-webpack-plugin":"^4.5.1"},"eslintConfig":{"globals":{"document":true,"window":true}}}')},"./src/main.js":function(f,u,c){c.r(u),c.d(u,"waitForInitialization",function(){return e}),c.d(u,"setupRPC",function(){return n});var l=c("./src/plugin.webworker.js"),b=c.n(l),w=c("./src/pluginIframe.js"),p=c("./src/utils.js"),y=c("./src/rpc.js");c.d(u,"RPC",function(){return y.RPC}),c.d(u,"API_VERSION",function(){return y.API_VERSION});var g=c("./package.json");c.d(u,"VERSION",function(){return g.version});function j(){try{return window.self!==window.top}catch{return!0}}function a(t){if(!t.allow_execution)throw new Error("web-worker plugin can only work with allow_execution=true");const s=new b.a,d=setTimeout(function(){s.terminate(),console.warn("Plugin failed to start as a web-worker, running in an iframe instead."),Object(w.default)(t)},2e3),_=Object(p.randId)();s.addEventListener("message",function(v){let k;const E=v.data;if(E.type==="worker-ready"){s.postMessage({type:"connectRPC",config:t}),clearTimeout(d);return}else E.type==="initialized"?(E.config=Object.assign({},t,E.config),E.origin=window.location.origin,E.peer_id=_):E.type==="imjoy_remote_api_ready"?window.dispatchEvent(new CustomEvent("imjoy_remote_api_ready",{detail:null})):E.type==="cacheRequirements"&&typeof cache_requirements=="function"?cache_requirements(E.requirements):E.type==="disconnect"?s.terminate():E.__transferables__&&(k=E.__transferables__,delete E.__transferables__);parent.postMessage(E,t.target_origin||"*",k)}),window.addEventListener("message",function(v){let k;const E=v.data;E.__transferables__&&(k=E.__transferables__,delete E.__transferables__),E.peer_id===_?s.postMessage(E,k):t.debug&&console.log(`connection peer id mismatch ${E.peer_id} !== ${_}`)})}function e(t){if(!j())throw new Error("waitForInitialization (imjoy-rpc) should only run inside an iframe.");t=t||{};const s=t.target_origin||"*";if(t.credential_required&&typeof t.verify_credential!="function")throw new Error("Please also provide the `verify_credential` function with `credential_required`.");if(t.credential_required&&s==="*")throw new Error("`target_origin` was set to `*` with `credential_required=true`, there is a security risk that you may leak the credential to website from other origin. Please specify the `target_origin` explicitly.");const d=()=>{window.removeEventListener("message",v)},_=Object(p.randId)(),v=k=>{if(k.type==="message"&&(s==="*"||k.origin===s))if(k.data.type==="initialize"){d(),k.data.peer_id!==_&&console.warn(`${k.data.config&&k.data.config.name}: connection peer id mismatch ${k.data.peer_id} !== ${_}`);const E=k.data.config;s!=="*"&&(E.target_origin=s),t.credential_required?t.verify_credential(E.credential).then(P=>{if(P&&P.auth&&!P.error)E.auth=P.auth,n(E).then(()=>{console.log("ImJoy RPC loaded successfully!")});else throw new Error("Failed to verify the credentail:"+(P&&P.error))}):n(E).then(()=>{console.log("ImJoy RPC loaded successfully!")})}else throw new Error(`unrecognized message: ${k.data}`)};window.addEventListener("message",v),parent.postMessage({type:"imjoyRPCReady",config:t,peer_id:_},"*")}function n(t){if(t=t||{},!t.name)throw new Error("Please specify a name for your app.");return t=Object(p.normalizeConfig)(t),new Promise((s,d)=>{const _=v=>{const k=v.detail;t.expose_api_globally&&(window.api=k),s(k),window.removeEventListener("imjoy_remote_api_ready",_)};if(j()){if(t.type==="web-worker")try{a(t)}catch{Object(w.default)(t)}else if(["rpc-window","rpc-worker","iframe","window"].includes(t.type))Object(w.default)(t);else{console.error("Unsupported plugin type: "+t.type),d("Unsupported plugin type: "+t.type);return}window.addEventListener("imjoy_remote_api_ready",_)}else d(new Error("imjoy-rpc should only run inside an iframe."))})}},"./src/plugin.webworker.js":function(f,u,c){f.exports=function(){return c("./node_modules/worker-loader/dist/workers/InlineWorker.js")(`/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/plugin.webworker.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/plugin.webworker.js":
/*!*********************************!*\\
  !*** ./src/plugin.webworker.js ***!
  \\*********************************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _pluginCore_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./pluginCore.js */ "./src/pluginCore.js");
/* harmony import */ var _rpc_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./rpc.js */ "./src/rpc.js");
/* harmony import */ var _utils_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./utils.js */ "./src/utils.js");
/**
 * Contains the routines loaded by the plugin Worker under web-browser.
 *
 * Initializes the web environment version of the platform-dependent
 * connection object for the plugin site
 */




(function() {
  // make sure this runs inside a webworker
  if (
    typeof WorkerGlobalScope === "undefined" ||
    !self ||
    !(self instanceof WorkerGlobalScope)
  ) {
    throw new Error("This script can only loaded in a webworker");
  }
  /**
   * Connection object provided to the RPC constructor,
   * plugin site implementation for the web-based environment.
   * Global will be then cleared to prevent exposure into the
   * Worker, so we put this local connection object into a closure
   */
  class Connection extends _utils_js__WEBPACK_IMPORTED_MODULE_2__["MessageEmitter"] {
    constructor(config) {
      super(config && config.debug);
      this.config = config || {};
    }
    connect() {
      self.addEventListener("message", e => {
        this._fire(e.data.type, e.data);
      });
      this.emit({
        type: "initialized",
        config: this.config
      });
    }
    disconnect() {
      this._fire("beforeDisconnect");
      self.close();
      this._fire("disconnected");
    }
    emit(data) {
      let transferables = undefined;
      if (data.__transferables__) {
        transferables = data.__transferables__;
        delete data.__transferables__;
      }
      self.postMessage(data, transferables);
    }
    async execute(code) {
      if (code.type === "requirements") {
        try {
          if (
            code.requirements &&
            (Array.isArray(code.requirements) ||
              typeof code.requirements === "string")
          ) {
            try {
              if (!Array.isArray(code.requirements)) {
                code.requirements = [code.requirements];
              }
              for (var i = 0; i < code.requirements.length; i++) {
                if (
                  code.requirements[i].toLowerCase().endsWith(".css") ||
                  code.requirements[i].startsWith("css:")
                ) {
                  throw "unable to import css in a webworker";
                } else if (
                  code.requirements[i].toLowerCase().endsWith(".js") ||
                  code.requirements[i].startsWith("js:")
                ) {
                  if (code.requirements[i].startsWith("js:")) {
                    code.requirements[i] = code.requirements[i].slice(3);
                  }
                  importScripts(code.requirements[i]);
                } else if (code.requirements[i].startsWith("http")) {
                  importScripts(code.requirements[i]);
                } else if (code.requirements[i].startsWith("cache:")) {
                  //ignore cache
                } else {
                  console.log(
                    "Unprocessed requirements url: " + code.requirements[i]
                  );
                }
              }
            } catch (e) {
              throw "failed to import required scripts: " +
                code.requirements.toString();
            }
          }
        } catch (e) {
          throw e;
        }
      } else if (code.type === "script") {
        try {
          if (
            code.requirements &&
            (Array.isArray(code.requirements) ||
              typeof code.requirements === "string")
          ) {
            try {
              if (Array.isArray(code.requirements)) {
                for (let i = 0; i < code.requirements.length; i++) {
                  importScripts(code.requirements[i]);
                }
              } else {
                importScripts(code.requirements);
              }
            } catch (e) {
              throw "failed to import required scripts: " +
                code.requirements.toString();
            }
          }
          eval(code.content);
        } catch (e) {
          console.error(e.message, e.stack);
          throw e;
        }
      } else {
        throw "unsupported code type.";
      }
      if (code.type === "requirements") {
        self.postMessage({
          type: "cacheRequirements",
          requirements: code.requirements
        });
      }
    }
  }
  const config = {
    type: "web-worker",
    dedicated_thread: true,
    allow_execution: true,
    lang: "javascript",
    api_version: _rpc_js__WEBPACK_IMPORTED_MODULE_1__["API_VERSION"]
  };
  const conn = new Connection(config);
  conn.on("connectRPC", data => {
    Object(_pluginCore_js__WEBPACK_IMPORTED_MODULE_0__["connectRPC"])(conn, Object.assign(data.config, config));
  });
  conn.connect();
  self.postMessage({
    type: "worker-ready"
  });
})();


/***/ }),

/***/ "./src/pluginCore.js":
/*!***************************!*\\
  !*** ./src/pluginCore.js ***!
  \\***************************/
/*! exports provided: connectRPC */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "connectRPC", function() { return connectRPC; });
/* harmony import */ var _rpc_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./rpc.js */ "./src/rpc.js");
/**
 * Core plugin script loaded into the plugin process/thread.
 *
 * Initializes the plugin-site API global methods.
 */

function connectRPC(connection, config) {
  config = config || {};
  const codecs = {};
  const rpc = new _rpc_js__WEBPACK_IMPORTED_MODULE_0__["RPC"](connection, config, codecs);
  rpc.on("getInterface", function () {
    launchConnected();
  });
  rpc.on("remoteReady", function () {
    const api = rpc.getRemote() || {};

    api.registerCodec = function (config) {
      if (!config["name"] || !config["encoder"] && !config["decoder"]) {
        throw new Error("Invalid codec format, please make sure you provide a name, type, encoder and decoder.");
      } else {
        if (config.type) {
          for (let k of Object.keys(codecs)) {
            if (codecs[k].type === config.type || k === config.name) {
              delete codecs[k];
              console.warn("Remove duplicated codec: " + k);
            }
          }
        }

        codecs[config["name"]] = config;
      }
    };

    api.init = function (config) {
      // register a minimal plugin api
      rpc.setInterface({
        setup() {}

      }, config);
    };

    api.disposeObject = function (obj) {
      rpc.disposeObject(obj);
    };

    api.export = function (_interface, config) {
      rpc.setInterface(_interface, config);
    };

    api.onLoad = function (handler) {
      handler = checkHandler(handler);

      if (connected) {
        handler();
      } else {
        connectedHandlers.push(handler);
      }
    };

    api.dispose = function (_interface) {
      rpc.disconnect();
    };

    if (typeof WorkerGlobalScope !== "undefined" && self instanceof WorkerGlobalScope) {
      self.api = api;
      self.postMessage({
        type: "imjoy_remote_api_ready"
      });
    } else if (typeof window) {
      window.dispatchEvent(new CustomEvent("imjoy_remote_api_ready", {
        detail: api
      }));
    }
  });
  let connected = false;
  const connectedHandlers = [];

  const launchConnected = function () {
    if (!connected) {
      connected = true;
      let handler;

      while (handler = connectedHandlers.pop()) {
        handler();
      }
    }
  };

  const checkHandler = function (handler) {
    const type = typeof handler;

    if (type !== "function") {
      const msg = "A function may only be subsribed to the event, " + type + " was provided instead";
      throw new Error(msg);
    }

    return handler;
  };

  return rpc;
}

/***/ }),

/***/ "./src/rpc.js":
/*!********************!*\\
  !*** ./src/rpc.js ***!
  \\********************/
/*! exports provided: API_VERSION, RPC */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "API_VERSION", function() { return API_VERSION; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "RPC", function() { return RPC; });
/* harmony import */ var _utils_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./utils.js */ "./src/utils.js");
/**
 * Contains the RPC object used both by the application
 * site, and by each plugin
 */

const API_VERSION = "0.2.3";
const ArrayBufferView = Object.getPrototypeOf(Object.getPrototypeOf(new Uint8Array())).constructor;

function _appendBuffer(buffer1, buffer2) {
  const tmp = new Uint8Array(buffer1.byteLength + buffer2.byteLength);
  tmp.set(new Uint8Array(buffer1), 0);
  tmp.set(new Uint8Array(buffer2), buffer1.byteLength);
  return tmp.buffer;
}

function indexObject(obj, is) {
  if (!is) throw new Error("undefined index");
  if (typeof is === "string") return indexObject(obj, is.split("."));else if (is.length === 0) return obj;else return indexObject(obj[is[0]], is.slice(1));
}
/**
 * RPC object represents a single site in the
 * communication protocol between the application and the plugin
 *
 * @param {Object} connection a special object allowing to send
 * and receive messages from the opposite site (basically it
 * should only provide send() and onMessage() methods)
 */


class RPC extends _utils_js__WEBPACK_IMPORTED_MODULE_0__["MessageEmitter"] {
  constructor(connection, config, codecs) {
    super(config && config.debug);
    this._connection = connection;
    this.config = config || {};
    this._codecs = codecs || {};
    this._object_store = {};
    this._method_weakmap = new WeakMap();
    this._object_weakmap = new WeakMap();
    this._local_api = null; // make sure there is an execute function

    const name = this.config.name;

    this._connection.execute = this._connection.execute || function () {
      throw new Error(\`connection.execute not implemented (in "\${name}")\`);
    };

    this._store = new ReferenceStore();
    this._method_refs = new ReferenceStore();

    this._method_refs.onReady(() => {
      this._fire("remoteIdle");
    });

    this._method_refs.onBusy(() => {
      this._fire("remoteBusy");
    });

    this._setupMessageHanlders();
  }

  init() {
    this._connection.emit({
      type: "initialized",
      config: this.config,
      peer_id: this._connection.peer_id
    });
  }

  setConfig(config) {
    if (config) for (const k of Object.keys(config)) {
      this.config[k] = config[k];
    }
  }
  /**
   * Set a handler to be called when received a responce from the
   * remote site reporting that the previously provided interface
   * has been successfully set as remote for that site
   *
   * @param {Function} handler
   */


  getRemoteCallStack() {
    return this._method_refs.getStack();
  }
  /**
   * @returns {Object} set of remote interface methods
   */


  getRemote() {
    return this._remote_interface;
  }
  /**
   * Sets the interface of this site making it available to the
   * remote site by sending a message with a set of methods names
   *
   * @param {Object} _interface to set
   */


  setInterface(_interface, config) {
    config = config || {};
    this.config.name = config.name || this.config.name;
    this.config.description = config.description || this.config.description;

    if (this.config.forwarding_functions) {
      for (let func_name of this.config.forwarding_functions) {
        const _remote = this._remote_interface;

        if (_remote[func_name]) {
          if (_interface.constructor === Object) {
            if (!_interface[func_name]) {
              _interface[func_name] = (...args) => {
                _remote[func_name](...args);
              };
            }
          } else if (_interface.constructor.constructor === Function) {
            if (!_interface.constructor.prototype[func_name]) {
              _interface.constructor.prototype[func_name] = (...args) => {
                _remote[func_name](...args);
              };
            }
          }
        }
      }
    }

    this._local_api = _interface;

    this._fire("interfaceAvailable");
  }
  /**
   * Sends the actual interface to the remote site upon it was
   * updated or by a special request of the remote site
   */


  sendInterface() {
    if (!this._local_api) {
      throw new Error("interface is not set.");
    }

    this._encode(this._local_api, true).then(api => {
      this._connection.emit({
        type: "setInterface",
        api: api
      });
    });
  }

  _disposeObject(objectId) {
    if (this._object_store[objectId]) {
      delete this._object_store[objectId];
    } else {
      throw new Error(\`Object (id=\${objectId}) not found.\`);
    }
  }

  disposeObject(obj) {
    return new Promise((resolve, reject) => {
      if (this._object_weakmap.has(obj)) {
        const objectId = this._object_weakmap.get(obj);

        this._connection.once("disposed", data => {
          if (data.error) reject(new Error(data.error));else resolve();
        });

        this._connection.emit({
          type: "disposeObject",
          object_id: objectId
        });
      } else {
        throw new Error("Invalid object");
      }
    });
  }
  /**
   * Handles a message from the remote site
   */


  _setupMessageHanlders() {
    this._connection.on("init", this.init);

    this._connection.on("execute", data => {
      Promise.resolve(this._connection.execute(data.code)).then(() => {
        this._connection.emit({
          type: "executed"
        });
      }).catch(e => {
        console.error(e);

        this._connection.emit({
          type: "executed",
          error: String(e)
        });
      });
    });

    this._connection.on("method", async data => {
      let resolve, reject, method, method_this, args, result;

      try {
        if (data.promise) {
          [resolve, reject] = await this._unwrap(data.promise, false);
        }

        const _interface = this._object_store[data.object_id];
        method = indexObject(_interface, data.name);

        if (data.name.includes(".")) {
          const tmp = data.name.split(".");
          const intf_index = tmp.slice(0, tmp.length - 1).join(".");
          method_this = indexObject(_interface, intf_index);
        } else {
          method_this = _interface;
        }

        args = await this._unwrap(data.args, true);

        if (data.promise) {
          result = method.apply(method_this, args);

          if (result instanceof Promise || method.constructor && method.constructor.name === "AsyncFunction") {
            result.then(resolve).catch(reject);
          } else {
            resolve(result);
          }
        } else {
          method.apply(method_this, args);
        }
      } catch (err) {
        console.error(this.config.name, err);

        if (reject) {
          reject(err);
        }
      }
    });

    this._connection.on("callback", async data => {
      let resolve, reject, method, args, result;

      try {
        if (data.promise) {
          [resolve, reject] = await this._unwrap(data.promise, false);
        }

        if (data.promise) {
          method = this._store.fetch(data.id);
          args = await this._unwrap(data.args, true);

          if (!method) {
            throw new Error("Callback function can only called once, if you want to call a function for multiple times, please make it as a plugin api function. See https://imjoy.io/docs for more details.");
          }

          result = method.apply(null, args);

          if (result instanceof Promise || method.constructor && method.constructor.name === "AsyncFunction") {
            result.then(resolve).catch(reject);
          } else {
            resolve(result);
          }
        } else {
          method = this._store.fetch(data.id);
          args = await this._unwrap(data.args, true);

          if (!method) {
            throw new Error("Please notice that callback function can only called once, if you want to call a function for multiple times, please make it as a plugin api function. See https://imjoy.io/docs for more details.");
          }

          method.apply(null, args);
        }
      } catch (err) {
        console.error(this.config.name, err);

        if (reject) {
          reject(err);
        }
      }
    });

    this._connection.on("disposeObject", data => {
      try {
        this._disposeObject(data.object_id);

        this._connection.emit({
          type: "disposed"
        });
      } catch (e) {
        console.error(e);

        this._connection.emit({
          type: "disposed",
          error: String(e)
        });
      }
    });

    this._connection.on("setInterface", data => {
      this._setRemoteInterface(data.api);
    });

    this._connection.on("getInterface", () => {
      this._fire("getInterface");

      if (this._local_api) {
        this.sendInterface();
      } else {
        this.once("interfaceAvailable", () => {
          this.sendInterface();
        });
      }
    });

    this._connection.on("interfaceSetAsRemote", () => {
      this._fire("interfaceSetAsRemote");
    });

    this._connection.on("disconnect", () => {
      this._fire("beforeDisconnect");

      this._connection.disconnect();

      this._fire("disconnected");
    });
  }
  /**
   * Sends a requests to the remote site asking it to provide its
   * current interface
   */


  requestRemote() {
    this._connection.emit({
      type: "getInterface"
    });
  }

  _ndarray(typedArray, shape, dtype) {
    const _dtype = Object(_utils_js__WEBPACK_IMPORTED_MODULE_0__["typedArrayToDtype"])(typedArray);

    if (dtype && dtype !== _dtype) {
      throw "dtype doesn't match the type of the array: " + _dtype + " != " + dtype;
    }

    shape = shape || [typedArray.length];
    return {
      _rtype: "ndarray",
      _rvalue: typedArray.buffer,
      _rshape: shape,
      _rdtype: _dtype
    };
  }
  /**
   * Sets the new remote interface provided by the other site
   *
   * @param {Array} names list of function names
   */


  _setRemoteInterface(api) {
    this._decode(api).then(intf => {
      // update existing interface instead of recreating it
      if (this._remote_interface) {
        Object.assign(this._remote_interface, intf);
      } else this._remote_interface = intf;

      this._fire("remoteReady");

      this._reportRemoteSet();
    });
  }
  /**
   * Generates the wrapped function corresponding to a single remote
   * method. When the generated function is called, it will send the
   * corresponding message to the remote site asking it to execute
   * the particular method of its interface
   *
   * @param {String} name of the remote method
   *
   * @returns {Function} wrapped remote method
   */


  _genRemoteMethod(targetId, name, objectId) {
    const me = this;

    const remoteMethod = function () {
      return new Promise(async (resolve, reject) => {
        let id = null;

        try {
          id = me._method_refs.put(objectId ? objectId + "/" + name : name);

          const wrapped_resolve = function () {
            if (id !== null) me._method_refs.fetch(id);
            return resolve.apply(this, arguments);
          };

          const wrapped_reject = function () {
            if (id !== null) me._method_refs.fetch(id);
            return reject.apply(this, arguments);
          };

          const encodedPromise = await me._wrap([wrapped_resolve, wrapped_reject]); // store the key id for removing them from the reference store together

          wrapped_resolve.__promise_pair = encodedPromise[1]._rvalue;
          wrapped_reject.__promise_pair = encodedPromise[0]._rvalue;
          let args = Array.prototype.slice.call(arguments);

          if (name === "register" || name === "registerService" || name === "export" || name === "on") {
            args = await me._wrap(args, true);
          } else {
            args = await me._wrap(args);
          }

          const transferables = args.__transferables__;
          if (transferables) delete args.__transferables__;

          me._connection.emit({
            type: "method",
            target_id: targetId,
            name: name,
            object_id: objectId,
            args: args,
            promise: encodedPromise
          }, transferables);
        } catch (e) {
          if (id) me._method_refs.fetch(id);
          reject(\`Failed to exectue remote method (interface: \${objectId || me.id}, method: \${name}), error: \${e}\`);
        }
      });
    };

    remoteMethod.__remote_method = true;
    return remoteMethod;
  }
  /**
   * Sends a responce reporting that interface just provided by the
   * remote site was successfully set by this site as remote
   */


  _reportRemoteSet() {
    this._connection.emit({
      type: "interfaceSetAsRemote"
    });
  }
  /**
   * Prepares the provided set of remote method arguments for
   * sending to the remote site, replaces all the callbacks with
   * identifiers
   *
   * @param {Array} args to wrap
   *
   * @returns {Array} wrapped arguments
   */


  async _encode(aObject, asInterface, objectId) {
    const aType = typeof aObject;

    if (aType === "number" || aType === "string" || aType === "boolean" || aObject === null || aObject === undefined || aObject instanceof ArrayBuffer) {
      return aObject;
    }

    let bObject;

    if (typeof aObject === "function") {
      if (asInterface) {
        if (!objectId) throw new Error("objectId is not specified.");
        bObject = {
          _rtype: "interface",
          _rtarget_id: this._connection.peer_id,
          _rintf: objectId,
          _rvalue: asInterface
        };

        this._method_weakmap.set(aObject, bObject);
      } else if (this._method_weakmap.has(aObject)) {
        bObject = this._method_weakmap.get(aObject);
      } else {
        const cid = this._store.put(aObject);

        bObject = {
          _rtype: "callback",
          _rtarget_id: this._connection.peer_id,
          _rname: aObject.constructor && aObject.constructor.name || cid,
          _rvalue: cid
        };
      }

      return bObject;
    } // skip if already encoded


    if (aObject.constructor instanceof Object && aObject._rtype) {
      // make sure the interface functions are encoded
      if (aObject._rintf) {
        const temp = aObject._rtype;
        delete aObject._rtype;
        bObject = await this._encode(aObject, asInterface, objectId);
        bObject._rtype = temp;
      } else {
        bObject = aObject;
      }

      return bObject;
    }

    const transferables = [];
    const _transfer = aObject._transfer;
    const isarray = Array.isArray(aObject);

    for (let tp of Object.keys(this._codecs)) {
      const codec = this._codecs[tp];

      if (codec.encoder && aObject instanceof codec.type) {
        // TODO: what if multiple encoders found
        let encodedObj = await Promise.resolve(codec.encoder(aObject));
        if (encodedObj && !encodedObj._rtype) encodedObj._rtype = codec.name; // encode the functions in the interface object

        if (encodedObj && encodedObj._rintf) {
          const temp = encodedObj._rtype;
          delete encodedObj._rtype;
          encodedObj = await this._encode(encodedObj, asInterface, objectId);
          encodedObj._rtype = temp;
        }

        bObject = encodedObj;
        return bObject;
      }
    }

    if (
    /*global tf*/
    typeof tf !== "undefined" && tf.Tensor && aObject instanceof tf.Tensor) {
      const v_buffer = aObject.dataSync();

      if (aObject._transfer || _transfer) {
        transferables.push(v_buffer.buffer);
        delete aObject._transfer;
      }

      bObject = {
        _rtype: "ndarray",
        _rvalue: v_buffer.buffer,
        _rshape: aObject.shape,
        _rdtype: aObject.dtype
      };
    } else if (
    /*global nj*/
    typeof nj !== "undefined" && nj.NdArray && aObject instanceof nj.NdArray) {
      const dtype = Object(_utils_js__WEBPACK_IMPORTED_MODULE_0__["typedArrayToDtype"])(aObject.selection.data);

      if (aObject._transfer || _transfer) {
        transferables.push(aObject.selection.data.buffer);
        delete aObject._transfer;
      }

      bObject = {
        _rtype: "ndarray",
        _rvalue: aObject.selection.data.buffer,
        _rshape: aObject.shape,
        _rdtype: dtype
      };
    } else if (aObject instanceof Error) {
      console.error(aObject);
      bObject = {
        _rtype: "error",
        _rvalue: aObject.toString()
      };
    } else if (typeof File !== "undefined" && aObject instanceof File) {
      bObject = {
        _rtype: "file",
        _rvalue: aObject,
        _rpath: aObject._path || aObject.webkitRelativePath
      };
    } // send objects supported by structure clone algorithm
    // https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm
    else if (aObject !== Object(aObject) || aObject instanceof Boolean || aObject instanceof String || aObject instanceof Date || aObject instanceof RegExp || aObject instanceof ImageData || typeof FileList !== "undefined" && aObject instanceof FileList || typeof FileSystemDirectoryHandle !== "undefined" && aObject instanceof FileSystemDirectoryHandle || typeof FileSystemFileHandle !== "undefined" && aObject instanceof FileSystemFileHandle || typeof FileSystemHandle !== "undefined" && aObject instanceof FileSystemHandle || typeof FileSystemWritableFileStream !== "undefined" && aObject instanceof FileSystemWritableFileStream) {
        bObject = aObject; // TODO: avoid object such as DynamicPlugin instance.
      } else if (typeof File !== "undefined" && aObject instanceof File) {
        bObject = {
          _rtype: "file",
          _rname: aObject.name,
          _rmime: aObject.type,
          _rvalue: aObject,
          _rpath: aObject._path || aObject.webkitRelativePath
        };
      } else if (aObject instanceof Blob) {
        bObject = {
          _rtype: "blob",
          _rvalue: aObject
        };
      } else if (aObject instanceof ArrayBufferView) {
        if (aObject._transfer || _transfer) {
          transferables.push(aObject.buffer);
          delete aObject._transfer;
        }

        const dtype = Object(_utils_js__WEBPACK_IMPORTED_MODULE_0__["typedArrayToDtype"])(aObject);
        bObject = {
          _rtype: "typedarray",
          _rvalue: aObject.buffer,
          _rdtype: dtype
        };
      } else if (aObject instanceof DataView) {
        if (aObject._transfer || _transfer) {
          transferables.push(aObject.buffer);
          delete aObject._transfer;
        }

        bObject = {
          _rtype: "memoryview",
          _rvalue: aObject.buffer
        };
      } else if (aObject instanceof Set) {
        bObject = {
          _rtype: "set",
          _rvalue: await this._encode(Array.from(aObject), asInterface)
        };
      } else if (aObject instanceof Map) {
        bObject = {
          _rtype: "orderedmap",
          _rvalue: await this._encode(Array.from(aObject), asInterface)
        };
      } else if (aObject.constructor instanceof Object || Array.isArray(aObject)) {
        bObject = isarray ? [] : {};
        let keys; // an object/array

        if (aObject.constructor === Object || Array.isArray(aObject)) {
          keys = Object.keys(aObject);
        } // a class
        else if (aObject.constructor === Function) {
            throw new Error("Please instantiate the class before exportting it.");
          } // instance of a class
          else if (aObject.constructor.constructor === Function) {
              keys = Object.getOwnPropertyNames(Object.getPrototypeOf(aObject)).concat(Object.keys(aObject)); // TODO: use a proxy object to represent the actual object
              // always encode class instance as interface

              asInterface = true;
            } else {
              throw Error("Unsupported interface type");
            }

        let hasFunction = false; // encode interfaces

        if (aObject._rintf || asInterface) {
          if (!objectId) {
            objectId = Object(_utils_js__WEBPACK_IMPORTED_MODULE_0__["randId"])();
            this._object_store[objectId] = aObject;
          }

          for (let k of keys) {
            if (k === "constructor") continue;

            if (k.startsWith("_")) {
              continue;
            }

            bObject[k] = await this._encode(aObject[k], typeof asInterface === "string" ? asInterface + "." + k : k, objectId);

            if (typeof aObject[k] === "function") {
              hasFunction = true;
            }
          } // object id for dispose the object remotely


          if (hasFunction) bObject._rintf = objectId; // remove interface when closed

          if (aObject.on && typeof aObject.on === "function") {
            aObject.on("close", () => {
              delete this._object_store[objectId];
            });
          }
        } else {
          for (let k of keys) {
            if (["hasOwnProperty", "constructor"].includes(k)) continue;
            bObject[k] = await this._encode(aObject[k]);
          }
        } // for example, browserFS object

      } else if (typeof aObject === "object") {
        const keys = Object.getOwnPropertyNames(Object.getPrototypeOf(aObject)).concat(Object.keys(aObject));
        const objectId = Object(_utils_js__WEBPACK_IMPORTED_MODULE_0__["randId"])();

        for (let k of keys) {
          if (["hasOwnProperty", "constructor"].includes(k)) continue; // encode as interface

          bObject[k] = await this._encode(aObject[k], k, bObject);
        } // object id, used for dispose the object


        bObject._rintf = objectId;
      } else {
        throw "imjoy-rpc: Unsupported data type:" + aObject;
      }

    if (transferables.length > 0) {
      bObject.__transferables__ = transferables;
    }

    if (!bObject) {
      throw new Error("Failed to encode object");
    }

    return bObject;
  }

  async _decode(aObject, withPromise) {
    if (!aObject) {
      return aObject;
    }

    let bObject;

    if (aObject["_rtype"]) {
      if (this._codecs[aObject._rtype] && this._codecs[aObject._rtype].decoder) {
        if (aObject._rintf) {
          const temp = aObject._rtype;
          delete aObject._rtype;
          aObject = await this._decode(aObject, withPromise);
          aObject._rtype = temp;
        }

        bObject = await Promise.resolve(this._codecs[aObject._rtype].decoder(aObject));
      } else if (aObject._rtype === "callback") {
        bObject = this._genRemoteCallback(aObject._rtarget_id, aObject._rvalue, withPromise);
      } else if (aObject._rtype === "interface") {
        bObject = this._genRemoteMethod(aObject._rtarget_id, aObject._rvalue, aObject._rintf);
      } else if (aObject._rtype === "ndarray") {
        /*global nj tf*/
        //create build array/tensor if used in the plugin
        if (typeof nj !== "undefined" && nj.array) {
          if (Array.isArray(aObject._rvalue)) {
            aObject._rvalue = aObject._rvalue.reduce(_appendBuffer);
          }

          bObject = nj.array(new Uint8(aObject._rvalue), aObject._rdtype).reshape(aObject._rshape);
        } else if (typeof tf !== "undefined" && tf.Tensor) {
          if (Array.isArray(aObject._rvalue)) {
            aObject._rvalue = aObject._rvalue.reduce(_appendBuffer);
          }

          const arraytype = _utils_js__WEBPACK_IMPORTED_MODULE_0__["dtypeToTypedArray"][aObject._rdtype];
          bObject = tf.tensor(new arraytype(aObject._rvalue), aObject._rshape, aObject._rdtype);
        } else {
          //keep it as regular if transfered to the main app
          bObject = aObject;
        }
      } else if (aObject._rtype === "error") {
        bObject = new Error(aObject._rvalue);
      } else if (aObject._rtype === "file") {
        if (aObject._rvalue instanceof File) {
          bObject = aObject._rvalue; //patch _path

          bObject._path = aObject._rpath;
        } else {
          bObject = new File([aObject._rvalue], aObject._rname, {
            type: aObject._rmime
          });
          bObject._path = aObject._rpath;
        }
      } else if (aObject._rtype === "typedarray") {
        const arraytype = _utils_js__WEBPACK_IMPORTED_MODULE_0__["dtypeToTypedArray"][aObject._rdtype];
        if (!arraytype) throw new Error("unsupported dtype: " + aObject._rdtype);
        bObject = new arraytype(aObject._rvalue);
      } else if (aObject._rtype === "memoryview") {
        bObject = new DataView(aObject._rvalue);
      } else if (aObject._rtype === "blob") {
        if (aObject._rvalue instanceof Blob) {
          bObject = aObject._rvalue;
        } else {
          bObject = new Blob([aObject._rvalue], {
            type: aObject._rmime
          });
        }
      } else if (aObject._rtype === "orderedmap") {
        bObject = new Map((await this._decode(aObject._rvalue, withPromise)));
      } else if (aObject._rtype === "set") {
        bObject = new Set((await this._decode(aObject._rvalue, withPromise)));
      } else {
        // make sure all the interface functions are decoded
        if (aObject._rintf) {
          const temp = aObject._rtype;
          delete aObject._rtype;
          bObject = await this._decode(aObject, withPromise);
          bObject._rtype = temp;
        } else bObject = aObject;
      }
    } else if (aObject.constructor === Object || Array.isArray(aObject)) {
      const isarray = Array.isArray(aObject);
      bObject = isarray ? [] : {};

      for (let k of Object.keys(aObject)) {
        if (isarray || aObject.hasOwnProperty(k)) {
          const v = aObject[k];
          bObject[k] = await this._decode(v, withPromise);
        }
      }
    } else {
      bObject = aObject;
    }

    if (bObject === undefined) {
      throw new Error("Failed to decode object");
    } // store the object id for dispose


    if (aObject._rintf) {
      this._object_weakmap.set(bObject, aObject._rintf);
    }

    return bObject;
  }

  async _wrap(args, asInterface) {
    return await this._encode(args, asInterface);
  }
  /**
   * Unwraps the set of arguments delivered from the remote site,
   * replaces all callback identifiers with a function which will
   * initiate sending that callback identifier back to other site
   *
   * @param {Object} args to unwrap
   *
   * @param {Boolean} withPromise is true means this the callback should contain a promise
   *
   * @returns {Array} unwrapped args
   */


  async _unwrap(args, withPromise) {
    return await this._decode(args, withPromise);
  }
  /**
   * Generates the wrapped function corresponding to a single remote
   * callback. When the generated function is called, it will send
   * the corresponding message to the remote site asking it to
   * execute the particular callback previously saved during a call
   * by the remote site a method from the interface of this site
   *
   * @param {Number} id of the remote callback to execute
   * @param {Number} argNum argument index of the callback
   * @param {Boolean} withPromise is true means this the callback should contain a promise
   *
   * @returns {Function} wrapped remote callback
   */


  _genRemoteCallback(targetId, cid, withPromise) {
    const me = this;
    let remoteCallback;

    if (withPromise) {
      remoteCallback = function () {
        return new Promise(async (resolve, reject) => {
          const args = await me._wrap(Array.prototype.slice.call(arguments));
          const transferables = args.__transferables__;
          if (transferables) delete args.__transferables__;
          const encodedPromise = await me._wrap([resolve, reject]); // store the key id for removing them from the reference store together

          resolve.__promise_pair = encodedPromise[1]._rvalue;
          reject.__promise_pair = encodedPromise[0]._rvalue;

          try {
            me._connection.emit({
              type: "callback",
              target_id: targetId,
              id: cid,
              args: args,
              promise: encodedPromise
            }, transferables);
          } catch (e) {
            reject(\`Failed to exectue remote callback ( id: \${cid}).\`);
          }
        });
      };

      return remoteCallback;
    } else {
      remoteCallback = async function () {
        const args = await me._wrap(Array.prototype.slice.call(arguments));
        const transferables = args.__transferables__;
        if (transferables) delete args.__transferables__;
        return me._connection.emit({
          type: "callback",
          target_id: targetId,
          id: cid,
          args: args
        }, transferables);
      };

      return remoteCallback;
    }
  }

  reset() {
    this._event_handlers = {};
    this._once_handlers = {};
    this._remote_interface = null;
    this._object_store = {};
    this._method_weakmap = new WeakMap();
    this._object_weakmap = new WeakMap();
    this._local_api = null;
    this._store = new ReferenceStore();
    this._method_refs = new ReferenceStore();
  }
  /**
   * Sends the notification message and breaks the connection
   */


  disconnect() {
    this._connection.emit({
      type: "disconnect"
    });

    this.reset();
    setTimeout(() => {
      this._connection.disconnect();
    }, 2000);
  }

}
/**
 * ReferenceStore is a special object which stores other objects
 * and provides the references (number) instead. This reference
 * may then be sent over a json-based communication channel (IPC
 * to another Node.js process or a message to the Worker). Other
 * site may then provide the reference in the responce message
 * implying the given object should be activated.
 *
 * Primary usage for the ReferenceStore is a storage for the
 * callbacks, which therefore makes it possible to initiate a
 * callback execution by the opposite site (which normally cannot
 * directly execute functions over the communication channel).
 *
 * Each stored object can only be fetched once and is not
 * available for the second time. Each stored object must be
 * fetched, since otherwise it will remain stored forever and
 * consume memory.
 *
 * Stored object indeces are simply the numbers, which are however
 * released along with the objects, and are later reused again (in
 * order to postpone the overflow, which should not likely happen,
 * but anyway).
 */

class ReferenceStore {
  constructor() {
    this._store = {}; // stored object

    this._indices = [0]; // smallest available indices

    this._readyHandler = function () {};

    this._busyHandler = function () {};

    this._readyHandler();
  }
  /**
   * call handler when the store is empty
   *
   * @param {FUNCTION} id of a handler
   */


  onReady(readyHandler) {
    this._readyHandler = readyHandler || function () {};
  }
  /**
   * call handler when the store is not empty
   *
   * @param {FUNCTION} id of a handler
   */


  onBusy(busyHandler) {
    this._busyHandler = busyHandler || function () {};
  }
  /**
   * get the length of the store
   *
   */


  getStack() {
    return Object.keys(this._store).length;
  }
  /**
   * @function _genId() generates the new reference id
   *
   * @returns {Number} smallest available id and reserves it
   */


  _genId() {
    let id;

    if (this._indices.length === 1) {
      id = this._indices[0]++;
    } else {
      id = this._indices.shift();
    }

    return id;
  }
  /**
   * Releases the given reference id so that it will be available by
   * another object stored
   *
   * @param {Number} id to release
   */


  _releaseId(id) {
    for (let i = 0; i < this._indices.length; i++) {
      if (id < this._indices[i]) {
        this._indices.splice(i, 0, id);

        break;
      }
    } // cleaning-up the sequence tail


    for (let i = this._indices.length - 1; i >= 0; i--) {
      if (this._indices[i] - 1 === this._indices[i - 1]) {
        this._indices.pop();
      } else {
        break;
      }
    }
  }
  /**
   * Stores the given object and returns the refernce id instead
   *
   * @param {Object} obj to store
   *
   * @returns {Number} reference id of the stored object
   */


  put(obj) {
    if (this._busyHandler && Object.keys(this._store).length === 0) {
      this._busyHandler();
    }

    const id = this._genId();

    this._store[id] = obj;
    return id;
  }
  /**
   * Retrieves previously stored object and releases its reference
   *
   * @param {Number} id of an object to retrieve
   */


  fetch(id) {
    const obj = this._store[id];

    if (obj && !obj.__remote_method) {
      delete this._store[id];

      this._releaseId(id);

      if (this._readyHandler && Object.keys(this._store).length === 0) {
        this._readyHandler();
      }
    }

    if (obj && obj.__promise_pair) {
      this.fetch(obj.__promise_pair);
    }

    return obj;
  }

}

/***/ }),

/***/ "./src/utils.js":
/*!**********************!*\\
  !*** ./src/utils.js ***!
  \\**********************/
/*! exports provided: randId, dtypeToTypedArray, normalizeConfig, typedArrayToDtypeMapping, typedArrayToDtype, cacheRequirements, setupServiceWorker, urlJoin, MessageEmitter */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "randId", function() { return randId; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "dtypeToTypedArray", function() { return dtypeToTypedArray; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "normalizeConfig", function() { return normalizeConfig; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "typedArrayToDtypeMapping", function() { return typedArrayToDtypeMapping; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "typedArrayToDtype", function() { return typedArrayToDtype; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "cacheRequirements", function() { return cacheRequirements; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "setupServiceWorker", function() { return setupServiceWorker; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "urlJoin", function() { return urlJoin; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "MessageEmitter", function() { return MessageEmitter; });
function randId() {
  return Math.random().toString(36).substr(2, 10) + new Date().getTime();
}
const dtypeToTypedArray = {
  int8: Int8Array,
  int16: Int16Array,
  int32: Int32Array,
  uint8: Uint8Array,
  uint16: Uint16Array,
  uint32: Uint32Array,
  float32: Float32Array,
  float64: Float64Array,
  array: Array
};
function normalizeConfig(config) {
  config.version = config.version || "0.1.0";
  config.description = config.description || \`[TODO: add description for \${config.name} ]\`;
  config.type = config.type || "rpc-window";
  config.id = config.id || randId();
  config.allow_execution = config.allow_execution || false;

  if (config.enable_service_worker) {
    setupServiceWorker(config.base_url, config.target_origin, config.cache_requirements);
  }

  if (config.cache_requirements) {
    delete config.cache_requirements;
  } // remove functions


  config = Object.keys(config).reduce((p, c) => {
    if (typeof config[c] !== "function") p[c] = config[c];
    return p;
  }, {});
  return config;
}
const typedArrayToDtypeMapping = {
  Int8Array: "int8",
  Int16Array: "int16",
  Int32Array: "int32",
  Uint8Array: "uint8",
  Uint16Array: "uint16",
  Uint32Array: "uint32",
  Float32Array: "float32",
  Float64Array: "float64",
  Array: "array"
};
const typedArrayToDtypeKeys = [];

for (const arrType of Object.keys(typedArrayToDtypeMapping)) {
  typedArrayToDtypeKeys.push(eval(arrType));
}

function typedArrayToDtype(obj) {
  let dtype = typedArrayToDtypeMapping[obj.constructor.name];

  if (!dtype) {
    const pt = Object.getPrototypeOf(obj);

    for (const arrType of typedArrayToDtypeKeys) {
      if (pt instanceof arrType) {
        dtype = typedArrayToDtypeMapping[arrType.name];
        break;
      }
    }
  }

  return dtype;
}

function cacheUrlInServiceWorker(url) {
  return new Promise(function (resolve, reject) {
    const message = {
      command: "add",
      url: url
    };

    if (!navigator.serviceWorker || !navigator.serviceWorker.register) {
      reject("Service worker is not supported.");
      return;
    }

    const messageChannel = new MessageChannel();

    messageChannel.port1.onmessage = function (event) {
      if (event.data && event.data.error) {
        reject(event.data.error);
      } else {
        resolve(event.data && event.data.result);
      }
    };

    if (navigator.serviceWorker && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage(message, [messageChannel.port2]);
    } else {
      reject("Service worker controller is not available");
    }
  });
}

async function cacheRequirements(requirements) {
  if (!Array.isArray(requirements)) {
    requirementsm.code.requirements = [requirements];
  }

  if (requirements && requirements.length > 0) {
    for (let req of requirements) {
      //remove prefix
      if (req.startsWith("js:")) req = req.slice(3);
      if (req.startsWith("css:")) req = req.slice(4);
      if (req.startsWith("cache:")) req = req.slice(6);
      if (!req.startsWith("http")) continue;
      await cacheUrlInServiceWorker(req).catch(e => {
        console.error(e);
      });
    }
  }
}
function setupServiceWorker(baseUrl, targetOrigin, cacheCallback) {
  // register service worker for offline access
  if ("serviceWorker" in navigator) {
    baseUrl = baseUrl || "/";
    navigator.serviceWorker.register(baseUrl + "plugin-service-worker.js").then(function (registration) {
      // Registration was successful
      console.log("ServiceWorker registration successful with scope: ", registration.scope);
    }, function (err) {
      // registration failed :(
      console.log("ServiceWorker registration failed: ", err);
    });
    targetOrigin = targetOrigin || "*";
    cacheCallback = cacheCallback || cacheRequirements;

    if (cacheCallback && typeof cacheCallback !== "function") {
      throw new Error("config.cache_requirements must be a function");
    }

    window.addEventListener("message", function (e) {
      if (targetOrigin === "*" || e.origin === targetOrigin) {
        const m = e.data;

        if (m.type === "cacheRequirements") {
          cacheCallback(m.requirements);
        }
      }
    });
  }
} //#Source https://bit.ly/2neWfJ2

function urlJoin(...args) {
  return args.join("/").replace(/[\\/]+/g, "/").replace(/^(.+):\\//, "$1://").replace(/^file:/, "file:/").replace(/\\/(\\?|&|#[^!])/g, "$1").replace(/\\?/g, "&").replace("&", "?");
}
class MessageEmitter {
  constructor(debug) {
    this._event_handlers = {};
    this._once_handlers = {};
    this._debug = debug;
  }

  emit() {
    throw new Error("emit is not implemented");
  }

  on(event, handler) {
    if (!this._event_handlers[event]) {
      this._event_handlers[event] = [];
    }

    this._event_handlers[event].push(handler);
  }

  once(event, handler) {
    handler.___event_run_once = true;
    this.on(event, handler);
  }

  off(event, handler) {
    if (!event && !handler) {
      // remove all events handlers
      this._event_handlers = {};
    } else if (event && !handler) {
      // remove all hanlders for the event
      if (this._event_handlers[event]) this._event_handlers[event] = [];
    } else {
      // remove a specific handler
      if (this._event_handlers[event]) {
        const idx = this._event_handlers[event].indexOf(handler);

        if (idx >= 0) {
          this._event_handlers[event].splice(idx, 1);
        }
      }
    }
  }

  _fire(event, data) {
    if (this._event_handlers[event]) {
      var i = this._event_handlers[event].length;

      while (i--) {
        const handler = this._event_handlers[event][i];

        try {
          handler(data);
        } catch (e) {
          console.error(e);
        } finally {
          if (handler.___event_run_once) {
            this._event_handlers[event].splice(i, 1);
          }
        }
      }
    } else {
      if (this._debug) {
        console.warn("unhandled event", event, data);
      }
    }
  }

}

/***/ })

/******/ });
//# sourceMappingURL=plugin.webworker.js.map`,null)}},"./src/pluginCore.js":function(f,u,c){c.r(u),c.d(u,"connectRPC",function(){return b});var l=c("./src/rpc.js");function b(w,p){p=p||{};const y={},g=new l.RPC(w,p,y);g.on("getInterface",function(){e()}),g.on("remoteReady",function(){const t=g.getRemote()||{};t.registerCodec=function(s){if(!s.name||!s.encoder&&!s.decoder)throw new Error("Invalid codec format, please make sure you provide a name, type, encoder and decoder.");if(s.type)for(let d of Object.keys(y))(y[d].type===s.type||d===s.name)&&(delete y[d],console.warn("Remove duplicated codec: "+d));y[s.name]=s},t.init=function(s){g.setInterface({setup(){}},s)},t.disposeObject=function(s){g.disposeObject(s)},t.export=function(s,d){g.setInterface(s,d)},t.onLoad=function(s){s=n(s),j?s():a.push(s)},t.dispose=function(s){g.disconnect()},typeof WorkerGlobalScope!="undefined"&&self instanceof WorkerGlobalScope?(self.api=t,self.postMessage({type:"imjoy_remote_api_ready"})):window.dispatchEvent(new CustomEvent("imjoy_remote_api_ready",{detail:t}))});let j=!1;const a=[],e=function(){if(!j){j=!0;let t;for(;t=a.pop();)t()}},n=function(t){const s=typeof t;if(s!=="function"){const d="A function may only be subsribed to the event, "+s+" was provided instead";throw new Error(d)}return t};return g}},"./src/pluginIframe.js":function(module,__webpack_exports__,__webpack_require__){__webpack_require__.r(__webpack_exports__),__webpack_require__.d(__webpack_exports__,"Connection",function(){return Connection}),__webpack_require__.d(__webpack_exports__,"default",function(){return setupIframe});var _pluginCore_js__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__("./src/pluginCore.js"),_rpc_js__WEBPACK_IMPORTED_MODULE_1__=__webpack_require__("./src/rpc.js"),_utils_js__WEBPACK_IMPORTED_MODULE_2__=__webpack_require__("./src/utils.js");function _htmlToElement(f){var u=document.createElement("template");return f=f.trim(),u.innerHTML=f,u.content.firstChild}var _importScript=function(f){return new Promise((u,c)=>{var l=document.createElement("script");l.src=f,l.type="text/javascript",l.onload=u,l.onreadystatechange=function(){(this.readyState==="loaded"||this.readyState==="complete")&&u()},l.onerror=c,document.head.appendChild(l)})};async function importScripts(){for(var f=Array.prototype.slice.call(arguments),u=f.length,c=0;c<u;c++)await _importScript(f[c])}class Connection extends _utils_js__WEBPACK_IMPORTED_MODULE_2__.MessageEmitter{constructor(f){super(f&&f.debug);this.config=f||{},this.peer_id=Object(_utils_js__WEBPACK_IMPORTED_MODULE_2__.randId)()}connect(){this.config.target_origin=this.config.target_origin||"*",window.addEventListener("message",this),this.emit({type:"initialized",config:this.config,origin:window.location.origin,peer_id:this.peer_id}),this._fire("connected")}handleEvent(f){f.type==="message"&&(this.config.target_origin==="*"||f.origin===this.config.target_origin)&&(f.data.peer_id===this.peer_id?this._fire(f.data.type,f.data):this.config.debug&&console.log(`connection peer id mismatch ${f.data.peer_id} !== ${this.peer_id}`))}disconnect(){this._fire("beforeDisconnect"),window.removeEventListener("message",this),this._fire("disconnected")}emit(f){let u;f.__transferables__&&(u=f.__transferables__,delete f.__transferables__),parent.postMessage(f,this.config.target_origin,u)}async execute(code){try{if(code.type==="requirements"){if(code.requirements&&(Array.isArray(code.requirements)||typeof code.requirements=="string"))try{var link_node;if(code.requirements=typeof code.requirements=="string"?[code.requirements]:code.requirements,Array.isArray(code.requirements))for(var i=0;i<code.requirements.length;i++)code.requirements[i].toLowerCase().endsWith(".css")||code.requirements[i].startsWith("css:")?(code.requirements[i].startsWith("css:")&&(code.requirements[i]=code.requirements[i].slice(4)),link_node=document.createElement("link"),link_node.rel="stylesheet",link_node.href=code.requirements[i],document.head.appendChild(link_node)):code.requirements[i].toLowerCase().endsWith(".js")||code.requirements[i].startsWith("js:")?(code.requirements[i].startsWith("js:")&&(code.requirements[i]=code.requirements[i].slice(3)),await importScripts(code.requirements[i])):code.requirements[i].startsWith("http")?await importScripts(code.requirements[i]):code.requirements[i].startsWith("cache:")||console.log("Unprocessed requirements url: "+code.requirements[i]);else throw"unsupported requirements definition"}catch{throw"failed to import required scripts: "+code.requirements.toString()}}else if(code.type==="script")if(code.src){var script_node=document.createElement("script");script_node.setAttribute("type",code.attrs.type),script_node.setAttribute("src",code.src),document.head.appendChild(script_node)}else if(code.content&&(!code.attrs.type||code.attrs.type==="text/javascript"))eval(code.content);else{var node=document.createElement("script");node.setAttribute("type",code.attrs.type),node.appendChild(document.createTextNode(code.content)),document.body.appendChild(node)}else if(code.type==="style"){const f=document.createElement("style");code.src&&(f.src=code.src),f.innerHTML=code.content,document.head.appendChild(f)}else if(code.type==="link"){const f=document.createElement("link");code.rel&&(f.rel=code.rel),code.href&&(f.href=code.href),code.attrs&&code.attrs.type&&(f.type=code.attrs.type),document.head.appendChild(f)}else if(code.type==="html")document.body.appendChild(_htmlToElement(code.content));else throw"unsupported code type.";parent.postMessage({type:"executed"},this.config.target_origin)}catch(f){console.error("failed to execute scripts: ",code,f),parent.postMessage({type:"executed",error:f.stack||String(f)},this.config.target_origin)}}}function setupIframe(f){f=f||{},f.dedicated_thread=!1,f.lang="javascript",f.api_version=_rpc_js__WEBPACK_IMPORTED_MODULE_1__.API_VERSION;const u=new Connection(f);Object(_pluginCore_js__WEBPACK_IMPORTED_MODULE_0__.connectRPC)(u,f),u.connect()}},"./src/rpc.js":function(f,u,c){c.r(u),c.d(u,"API_VERSION",function(){return b}),c.d(u,"RPC",function(){return g});var l=c("./src/utils.js");const b="0.2.3",w=Object.getPrototypeOf(Object.getPrototypeOf(new Uint8Array)).constructor;function p(a,e){const n=new Uint8Array(a.byteLength+e.byteLength);return n.set(new Uint8Array(a),0),n.set(new Uint8Array(e),a.byteLength),n.buffer}function y(a,e){if(!e)throw new Error("undefined index");return typeof e=="string"?y(a,e.split(".")):e.length===0?a:y(a[e[0]],e.slice(1))}class g extends l.MessageEmitter{constructor(e,n,t){super(n&&n.debug);this._connection=e,this.config=n||{},this._codecs=t||{},this._object_store={},this._method_weakmap=new WeakMap,this._object_weakmap=new WeakMap,this._local_api=null;const s=this.config.name;this._connection.execute=this._connection.execute||function(){throw new Error(`connection.execute not implemented (in "${s}")`)},this._store=new j,this._method_refs=new j,this._method_refs.onReady(()=>{this._fire("remoteIdle")}),this._method_refs.onBusy(()=>{this._fire("remoteBusy")}),this._setupMessageHanlders()}init(){this._connection.emit({type:"initialized",config:this.config,peer_id:this._connection.peer_id})}setConfig(e){if(e)for(const n of Object.keys(e))this.config[n]=e[n]}getRemoteCallStack(){return this._method_refs.getStack()}getRemote(){return this._remote_interface}setInterface(e,n){if(n=n||{},this.config.name=n.name||this.config.name,this.config.description=n.description||this.config.description,this.config.forwarding_functions)for(let t of this.config.forwarding_functions){const s=this._remote_interface;s[t]&&(e.constructor===Object?e[t]||(e[t]=(...d)=>{s[t](...d)}):e.constructor.constructor===Function&&(e.constructor.prototype[t]||(e.constructor.prototype[t]=(...d)=>{s[t](...d)})))}this._local_api=e,this._fire("interfaceAvailable")}sendInterface(){if(!this._local_api)throw new Error("interface is not set.");this._encode(this._local_api,!0).then(e=>{this._connection.emit({type:"setInterface",api:e})})}_disposeObject(e){if(this._object_store[e])delete this._object_store[e];else throw new Error(`Object (id=${e}) not found.`)}disposeObject(e){return new Promise((n,t)=>{if(this._object_weakmap.has(e)){const s=this._object_weakmap.get(e);this._connection.once("disposed",d=>{d.error?t(new Error(d.error)):n()}),this._connection.emit({type:"disposeObject",object_id:s})}else throw new Error("Invalid object")})}_setupMessageHanlders(){this._connection.on("init",this.init),this._connection.on("execute",e=>{Promise.resolve(this._connection.execute(e.code)).then(()=>{this._connection.emit({type:"executed"})}).catch(n=>{console.error(n),this._connection.emit({type:"executed",error:String(n)})})}),this._connection.on("method",async e=>{let n,t,s,d,_,v;try{e.promise&&([n,t]=await this._unwrap(e.promise,!1));const k=this._object_store[e.object_id];if(s=y(k,e.name),e.name.includes(".")){const E=e.name.split("."),P=E.slice(0,E.length-1).join(".");d=y(k,P)}else d=k;_=await this._unwrap(e.args,!0),e.promise?(v=s.apply(d,_),v instanceof Promise||s.constructor&&s.constructor.name==="AsyncFunction"?v.then(n).catch(t):n(v)):s.apply(d,_)}catch(k){console.error(this.config.name,k),t&&t(k)}}),this._connection.on("callback",async e=>{let n,t,s,d,_;try{if(e.promise&&([n,t]=await this._unwrap(e.promise,!1)),e.promise){if(s=this._store.fetch(e.id),d=await this._unwrap(e.args,!0),!s)throw new Error("Callback function can only called once, if you want to call a function for multiple times, please make it as a plugin api function. See https://imjoy.io/docs for more details.");_=s.apply(null,d),_ instanceof Promise||s.constructor&&s.constructor.name==="AsyncFunction"?_.then(n).catch(t):n(_)}else{if(s=this._store.fetch(e.id),d=await this._unwrap(e.args,!0),!s)throw new Error("Please notice that callback function can only called once, if you want to call a function for multiple times, please make it as a plugin api function. See https://imjoy.io/docs for more details.");s.apply(null,d)}}catch(v){console.error(this.config.name,v),t&&t(v)}}),this._connection.on("disposeObject",e=>{try{this._disposeObject(e.object_id),this._connection.emit({type:"disposed"})}catch(n){console.error(n),this._connection.emit({type:"disposed",error:String(n)})}}),this._connection.on("setInterface",e=>{this._setRemoteInterface(e.api)}),this._connection.on("getInterface",()=>{this._fire("getInterface"),this._local_api?this.sendInterface():this.once("interfaceAvailable",()=>{this.sendInterface()})}),this._connection.on("interfaceSetAsRemote",()=>{this._fire("interfaceSetAsRemote")}),this._connection.on("disconnect",()=>{this._fire("beforeDisconnect"),this._connection.disconnect(),this._fire("disconnected")})}requestRemote(){this._connection.emit({type:"getInterface"})}_ndarray(e,n,t){const s=Object(l.typedArrayToDtype)(e);if(t&&t!==s)throw"dtype doesn't match the type of the array: "+s+" != "+t;return n=n||[e.length],{_rtype:"ndarray",_rvalue:e.buffer,_rshape:n,_rdtype:s}}_setRemoteInterface(e){this._decode(e).then(n=>{this._remote_interface?Object.assign(this._remote_interface,n):this._remote_interface=n,this._fire("remoteReady"),this._reportRemoteSet()})}_genRemoteMethod(e,n,t){const s=this,d=function(){return new Promise(async(_,v)=>{let k=null;try{k=s._method_refs.put(t?t+"/"+n:n);const E=function(){return k!==null&&s._method_refs.fetch(k),_.apply(this,arguments)},P=function(){return k!==null&&s._method_refs.fetch(k),v.apply(this,arguments)},x=await s._wrap([E,P]);E.__promise_pair=x[1]._rvalue,P.__promise_pair=x[0]._rvalue;let R=Array.prototype.slice.call(arguments);n==="register"||n==="registerService"||n==="export"||n==="on"?R=await s._wrap(R,!0):R=await s._wrap(R);const I=R.__transferables__;I&&delete R.__transferables__,s._connection.emit({type:"method",target_id:e,name:n,object_id:t,args:R,promise:x},I)}catch(E){k&&s._method_refs.fetch(k),v(`Failed to exectue remote method (interface: ${t||s.id}, method: ${n}), error: ${E}`)}})};return d.__remote_method=!0,d}_reportRemoteSet(){this._connection.emit({type:"interfaceSetAsRemote"})}async _encode(e,n,t){const s=typeof e;if(s==="number"||s==="string"||s==="boolean"||e===null||e===void 0||e instanceof ArrayBuffer)return e;let d;if(typeof e=="function"){if(n){if(!t)throw new Error("objectId is not specified.");d={_rtype:"interface",_rtarget_id:this._connection.peer_id,_rintf:t,_rvalue:n},this._method_weakmap.set(e,d)}else if(this._method_weakmap.has(e))d=this._method_weakmap.get(e);else{const E=this._store.put(e);d={_rtype:"callback",_rtarget_id:this._connection.peer_id,_rname:e.constructor&&e.constructor.name||E,_rvalue:E}}return d}if(e.constructor instanceof Object&&e._rtype){if(e._rintf){const E=e._rtype;delete e._rtype,d=await this._encode(e,n,t),d._rtype=E}else d=e;return d}const _=[],v=e._transfer,k=Array.isArray(e);for(let E of Object.keys(this._codecs)){const P=this._codecs[E];if(P.encoder&&e instanceof P.type){let x=await Promise.resolve(P.encoder(e));if(x&&!x._rtype&&(x._rtype=P.name),x&&x._rintf){const R=x._rtype;delete x._rtype,x=await this._encode(x,n,t),x._rtype=R}return d=x,d}}if(typeof tf!="undefined"&&tf.Tensor&&e instanceof tf.Tensor){const E=e.dataSync();(e._transfer||v)&&(_.push(E.buffer),delete e._transfer),d={_rtype:"ndarray",_rvalue:E.buffer,_rshape:e.shape,_rdtype:e.dtype}}else if(typeof nj!="undefined"&&nj.NdArray&&e instanceof nj.NdArray){const E=Object(l.typedArrayToDtype)(e.selection.data);(e._transfer||v)&&(_.push(e.selection.data.buffer),delete e._transfer),d={_rtype:"ndarray",_rvalue:e.selection.data.buffer,_rshape:e.shape,_rdtype:E}}else if(e instanceof Error)console.error(e),d={_rtype:"error",_rvalue:e.toString()};else if(typeof File!="undefined"&&e instanceof File)d={_rtype:"file",_rvalue:e,_rpath:e._path||e.webkitRelativePath};else if(e!==Object(e)||e instanceof Boolean||e instanceof String||e instanceof Date||e instanceof RegExp||e instanceof ImageData||typeof FileList!="undefined"&&e instanceof FileList||typeof FileSystemDirectoryHandle!="undefined"&&e instanceof FileSystemDirectoryHandle||typeof FileSystemFileHandle!="undefined"&&e instanceof FileSystemFileHandle||typeof FileSystemHandle!="undefined"&&e instanceof FileSystemHandle||typeof FileSystemWritableFileStream!="undefined"&&e instanceof FileSystemWritableFileStream)d=e;else if(typeof File!="undefined"&&e instanceof File)d={_rtype:"file",_rname:e.name,_rmime:e.type,_rvalue:e,_rpath:e._path||e.webkitRelativePath};else if(e instanceof Blob)d={_rtype:"blob",_rvalue:e};else if(e instanceof w){(e._transfer||v)&&(_.push(e.buffer),delete e._transfer);const E=Object(l.typedArrayToDtype)(e);d={_rtype:"typedarray",_rvalue:e.buffer,_rdtype:E}}else if(e instanceof DataView)(e._transfer||v)&&(_.push(e.buffer),delete e._transfer),d={_rtype:"memoryview",_rvalue:e.buffer};else if(e instanceof Set)d={_rtype:"set",_rvalue:await this._encode(Array.from(e),n)};else if(e instanceof Map)d={_rtype:"orderedmap",_rvalue:await this._encode(Array.from(e),n)};else if(e.constructor instanceof Object||Array.isArray(e)){d=k?[]:{};let E;if(e.constructor===Object||Array.isArray(e))E=Object.keys(e);else{if(e.constructor===Function)throw new Error("Please instantiate the class before exportting it.");if(e.constructor.constructor===Function)E=Object.getOwnPropertyNames(Object.getPrototypeOf(e)).concat(Object.keys(e)),n=!0;else throw Error("Unsupported interface type")}let P=!1;if(e._rintf||n){t||(t=Object(l.randId)(),this._object_store[t]=e);for(let x of E)x!=="constructor"&&(x.startsWith("_")||(d[x]=await this._encode(e[x],typeof n=="string"?n+"."+x:x,t),typeof e[x]=="function"&&(P=!0)));P&&(d._rintf=t),e.on&&typeof e.on=="function"&&e.on("close",()=>{delete this._object_store[t]})}else for(let x of E)["hasOwnProperty","constructor"].includes(x)||(d[x]=await this._encode(e[x]))}else if(typeof e=="object"){const E=Object.getOwnPropertyNames(Object.getPrototypeOf(e)).concat(Object.keys(e)),P=Object(l.randId)();for(let x of E)["hasOwnProperty","constructor"].includes(x)||(d[x]=await this._encode(e[x],x,d));d._rintf=P}else throw"imjoy-rpc: Unsupported data type:"+e;if(_.length>0&&(d.__transferables__=_),!d)throw new Error("Failed to encode object");return d}async _decode(e,n){if(!e)return e;let t;if(e._rtype)if(this._codecs[e._rtype]&&this._codecs[e._rtype].decoder){if(e._rintf){const s=e._rtype;delete e._rtype,e=await this._decode(e,n),e._rtype=s}t=await Promise.resolve(this._codecs[e._rtype].decoder(e))}else if(e._rtype==="callback")t=this._genRemoteCallback(e._rtarget_id,e._rvalue,n);else if(e._rtype==="interface")t=this._genRemoteMethod(e._rtarget_id,e._rvalue,e._rintf);else if(e._rtype==="ndarray")if(typeof nj!="undefined"&&nj.array)Array.isArray(e._rvalue)&&(e._rvalue=e._rvalue.reduce(p)),t=nj.array(new Uint8(e._rvalue),e._rdtype).reshape(e._rshape);else if(typeof tf!="undefined"&&tf.Tensor){Array.isArray(e._rvalue)&&(e._rvalue=e._rvalue.reduce(p));const s=l.dtypeToTypedArray[e._rdtype];t=tf.tensor(new s(e._rvalue),e._rshape,e._rdtype)}else t=e;else if(e._rtype==="error")t=new Error(e._rvalue);else if(e._rtype==="file")e._rvalue instanceof File?(t=e._rvalue,t._path=e._rpath):(t=new File([e._rvalue],e._rname,{type:e._rmime}),t._path=e._rpath);else if(e._rtype==="typedarray"){const s=l.dtypeToTypedArray[e._rdtype];if(!s)throw new Error("unsupported dtype: "+e._rdtype);t=new s(e._rvalue)}else if(e._rtype==="memoryview")t=new DataView(e._rvalue);else if(e._rtype==="blob")e._rvalue instanceof Blob?t=e._rvalue:t=new Blob([e._rvalue],{type:e._rmime});else if(e._rtype==="orderedmap")t=new Map(await this._decode(e._rvalue,n));else if(e._rtype==="set")t=new Set(await this._decode(e._rvalue,n));else if(e._rintf){const s=e._rtype;delete e._rtype,t=await this._decode(e,n),t._rtype=s}else t=e;else if(e.constructor===Object||Array.isArray(e)){const s=Array.isArray(e);t=s?[]:{};for(let d of Object.keys(e))if(s||e.hasOwnProperty(d)){const _=e[d];t[d]=await this._decode(_,n)}}else t=e;if(t===void 0)throw new Error("Failed to decode object");return e._rintf&&this._object_weakmap.set(t,e._rintf),t}async _wrap(e,n){return await this._encode(e,n)}async _unwrap(e,n){return await this._decode(e,n)}_genRemoteCallback(e,n,t){const s=this;let d;return t?(d=function(){return new Promise(async(_,v)=>{const k=await s._wrap(Array.prototype.slice.call(arguments)),E=k.__transferables__;E&&delete k.__transferables__;const P=await s._wrap([_,v]);_.__promise_pair=P[1]._rvalue,v.__promise_pair=P[0]._rvalue;try{s._connection.emit({type:"callback",target_id:e,id:n,args:k,promise:P},E)}catch{v(`Failed to exectue remote callback ( id: ${n}).`)}})},d):(d=async function(){const _=await s._wrap(Array.prototype.slice.call(arguments)),v=_.__transferables__;return v&&delete _.__transferables__,s._connection.emit({type:"callback",target_id:e,id:n,args:_},v)},d)}reset(){this._event_handlers={},this._once_handlers={},this._remote_interface=null,this._object_store={},this._method_weakmap=new WeakMap,this._object_weakmap=new WeakMap,this._local_api=null,this._store=new j,this._method_refs=new j}disconnect(){this._connection.emit({type:"disconnect"}),this.reset(),setTimeout(()=>{this._connection.disconnect()},2e3)}}class j{constructor(){this._store={},this._indices=[0],this._readyHandler=function(){},this._busyHandler=function(){},this._readyHandler()}onReady(e){this._readyHandler=e||function(){}}onBusy(e){this._busyHandler=e||function(){}}getStack(){return Object.keys(this._store).length}_genId(){let e;return this._indices.length===1?e=this._indices[0]++:e=this._indices.shift(),e}_releaseId(e){for(let n=0;n<this._indices.length;n++)if(e<this._indices[n]){this._indices.splice(n,0,e);break}for(let n=this._indices.length-1;n>=0&&this._indices[n]-1===this._indices[n-1];n--)this._indices.pop()}put(e){this._busyHandler&&Object.keys(this._store).length===0&&this._busyHandler();const n=this._genId();return this._store[n]=e,n}fetch(e){const n=this._store[e];return n&&!n.__remote_method&&(delete this._store[e],this._releaseId(e),this._readyHandler&&Object.keys(this._store).length===0&&this._readyHandler()),n&&n.__promise_pair&&this.fetch(n.__promise_pair),n}}},"./src/socketIOMain.js":function(f,u,c){c.r(u),c.d(u,"Connection",function(){return a}),c.d(u,"connectToServer",function(){return e});var l=c("./src/pluginCore.js"),b=c("./src/rpc.js");c.d(u,"RPC",function(){return b.RPC}),c.d(u,"API_VERSION",function(){return b.API_VERSION});var w=c("./src/utils.js"),p=c("./node_modules/socket.io-client/build/index.js"),y=c.n(p),g=c("./src/main.js");c.d(u,"setupRPC",function(){return g.setupRPC}),c.d(u,"waitForInitialization",function(){return g.waitForInitialization});var j=c("./package.json");c.d(u,"VERSION",function(){return j.version});class a extends w.MessageEmitter{constructor(t){super(t&&t.debug);this.config=t||{},this.peer_id=Object(w.randId)()}init(){return new Promise((t,s)=>{const d=this.config,_=d.server_url.replace("http://localhost","http://127.0.0.1"),v={};d.server_token&&(v.Authorization="Bearer "+d.server_token);const k=y()(_,{transports:["websocket","polling","flashsocket"],withCredentials:!1,extraHeaders:v,path:d.server_path||"/socket.io"});k.on("connect",()=>{k.emit("register_plugin",d,E=>{if(!E.success){console.error(E.detail),s(E.detail);return}this.plugin_id=E.plugin_id,k.on("plugin_message",P=>{P.peer_id===this.peer_id?this._fire(P.type,P):this.config.debug&&console.log(`connection peer id mismatch ${P.peer_id} !== ${this.peer_id}`)}),this.once("initialize",()=>{this.rpc?this.rpc.once("remoteReady",()=>{this.rpc.sendInterface()}):this.rpc=Object(l.connectRPC)(this,d),this.connect(),t()}),this.emit({type:"imjoyRPCReady",config:d,peer_id:this.peer_id})}),this._disconnected=!1}),k.on("connect_error",()=>{s("connection error"),this._fire("connectFailure")}),k.on("disconnect",()=>{s("disconnected"),this.disconnect(),this._fire("disconnected")}),this.socket=k})}connect(){this.emit({type:"initialized",config:this.config,origin:window.location.origin,peer_id:this.peer_id}),this._fire("connected")}reset(){this._event_handlers={},this._once_handlers={}}execute(){throw new Error("Execution is not allowed for socketio connection")}disconnect(){this._fire("beforeDisconnect"),this.socket.disconnect(),this.init(),this._fire("disconnected")}emit(t){t.plugin_id=this.plugin_id,this.socket.emit("plugin_message",t,s=>{s.success||this._fire("error",t.detail)})}}function e(n){if(n=n||{},!n.name)throw new Error("Plugin name is not specified.");if(!n.server_url)throw new Error("Server URL is not specified.");return n=Object(w.normalizeConfig)(n),new Promise((t,s)=>{const d=v=>{const k=v.detail;n.expose_api_globally&&(window.api=k),t(k),window.removeEventListener("imjoy_remote_api_ready",d)};window.addEventListener("imjoy_remote_api_ready",d),n=n||{},n.dedicated_thread=!1,n.lang="javascript",n.api_version=b.API_VERSION,new a(n).init().catch(s)})}},"./src/utils.js":function(module,__webpack_exports__,__webpack_require__){__webpack_require__.r(__webpack_exports__),__webpack_require__.d(__webpack_exports__,"randId",function(){return randId}),__webpack_require__.d(__webpack_exports__,"dtypeToTypedArray",function(){return dtypeToTypedArray}),__webpack_require__.d(__webpack_exports__,"normalizeConfig",function(){return normalizeConfig}),__webpack_require__.d(__webpack_exports__,"typedArrayToDtypeMapping",function(){return typedArrayToDtypeMapping}),__webpack_require__.d(__webpack_exports__,"typedArrayToDtype",function(){return typedArrayToDtype}),__webpack_require__.d(__webpack_exports__,"cacheRequirements",function(){return cacheRequirements}),__webpack_require__.d(__webpack_exports__,"setupServiceWorker",function(){return setupServiceWorker}),__webpack_require__.d(__webpack_exports__,"urlJoin",function(){return urlJoin}),__webpack_require__.d(__webpack_exports__,"MessageEmitter",function(){return MessageEmitter});function randId(){return Math.random().toString(36).substr(2,10)+new Date().getTime()}const dtypeToTypedArray={int8:Int8Array,int16:Int16Array,int32:Int32Array,uint8:Uint8Array,uint16:Uint16Array,uint32:Uint32Array,float32:Float32Array,float64:Float64Array,array:Array};function normalizeConfig(f){return f.version=f.version||"0.1.0",f.description=f.description||`[TODO: add description for ${f.name} ]`,f.type=f.type||"rpc-window",f.id=f.id||randId(),f.allow_execution=f.allow_execution||!1,f.enable_service_worker&&setupServiceWorker(f.base_url,f.target_origin,f.cache_requirements),f.cache_requirements&&delete f.cache_requirements,f=Object.keys(f).reduce((u,c)=>(typeof f[c]!="function"&&(u[c]=f[c]),u),{}),f}const typedArrayToDtypeMapping={Int8Array:"int8",Int16Array:"int16",Int32Array:"int32",Uint8Array:"uint8",Uint16Array:"uint16",Uint32Array:"uint32",Float32Array:"float32",Float64Array:"float64",Array:"array"},typedArrayToDtypeKeys=[];for(const arrType of Object.keys(typedArrayToDtypeMapping))typedArrayToDtypeKeys.push(eval(arrType));function typedArrayToDtype(f){let u=typedArrayToDtypeMapping[f.constructor.name];if(!u){const c=Object.getPrototypeOf(f);for(const l of typedArrayToDtypeKeys)if(c instanceof l){u=typedArrayToDtypeMapping[l.name];break}}return u}function cacheUrlInServiceWorker(f){return new Promise(function(u,c){const l={command:"add",url:f};if(!navigator.serviceWorker||!navigator.serviceWorker.register){c("Service worker is not supported.");return}const b=new MessageChannel;b.port1.onmessage=function(w){w.data&&w.data.error?c(w.data.error):u(w.data&&w.data.result)},navigator.serviceWorker&&navigator.serviceWorker.controller?navigator.serviceWorker.controller.postMessage(l,[b.port2]):c("Service worker controller is not available")})}async function cacheRequirements(f){if(Array.isArray(f)||(requirementsm.code.requirements=[f]),f&&f.length>0)for(let u of f)u.startsWith("js:")&&(u=u.slice(3)),u.startsWith("css:")&&(u=u.slice(4)),u.startsWith("cache:")&&(u=u.slice(6)),!!u.startsWith("http")&&await cacheUrlInServiceWorker(u).catch(c=>{console.error(c)})}function setupServiceWorker(f,u,c){if("serviceWorker"in navigator){if(f=f||"/",navigator.serviceWorker.register(f+"plugin-service-worker.js").then(function(l){console.log("ServiceWorker registration successful with scope: ",l.scope)},function(l){console.log("ServiceWorker registration failed: ",l)}),u=u||"*",c=c||cacheRequirements,c&&typeof c!="function")throw new Error("config.cache_requirements must be a function");window.addEventListener("message",function(l){if(u==="*"||l.origin===u){const b=l.data;b.type==="cacheRequirements"&&c(b.requirements)}})}}function urlJoin(...f){return f.join("/").replace(/[\/]+/g,"/").replace(/^(.+):\//,"$1://").replace(/^file:/,"file:/").replace(/\/(\?|&|#[^!])/g,"$1").replace(/\?/g,"&").replace("&","?")}class MessageEmitter{constructor(u){this._event_handlers={},this._once_handlers={},this._debug=u}emit(){throw new Error("emit is not implemented")}on(u,c){this._event_handlers[u]||(this._event_handlers[u]=[]),this._event_handlers[u].push(c)}once(u,c){c.___event_run_once=!0,this.on(u,c)}off(u,c){if(!u&&!c)this._event_handlers={};else if(u&&!c)this._event_handlers[u]&&(this._event_handlers[u]=[]);else if(this._event_handlers[u]){const l=this._event_handlers[u].indexOf(c);l>=0&&this._event_handlers[u].splice(l,1)}}_fire(u,c){if(this._event_handlers[u])for(var l=this._event_handlers[u].length;l--;){const b=this._event_handlers[u][l];try{b(c)}catch(w){console.error(w)}finally{b.___event_run_once&&this._event_handlers[u].splice(l,1)}}else this._debug&&console.warn("unhandled event",u,c)}}}})})})(imjoyRpcSocketio);var imjoyRpc={imjoyRPC:imjoyRpc$1.exports,imjoyRPCSocketIO:imjoyRpcSocketio.exports},index=Object.freeze(_mergeNamespaces({__proto__:null,[Symbol.toStringTag]:"Module",default:imjoyRpc},[imjoyRpc]));export{index as i};
