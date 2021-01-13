import { c as createCommonjsModule } from './common/_commonjsHelpers-37fa8da4.js';

var imjoyRpc = createCommonjsModule(function (module, exports) {
(function webpackUniversalModuleDefinition(root, factory) {
	module.exports = factory();
})(window, function() {
return /******/ (function(modules) { // webpackBootstrap
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
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/main.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./node_modules/worker-loader/dist/workers/InlineWorker.js":
/*!*****************************************************************!*\
  !*** ./node_modules/worker-loader/dist/workers/InlineWorker.js ***!
  \*****************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {


// http://stackoverflow.com/questions/10343913/how-to-create-a-web-worker-from-a-string

var URL = window.URL || window.webkitURL;

module.exports = function (content, url) {
  try {
    try {
      var blob;

      try {
        // BlobBuilder = Deprecated, but widely implemented
        var BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder || window.MSBlobBuilder;

        blob = new BlobBuilder();

        blob.append(content);

        blob = blob.getBlob();
      } catch (e) {
        // The proposed API
        blob = new Blob([content]);
      }

      return new Worker(URL.createObjectURL(blob));
    } catch (e) {
      return new Worker('data:application/javascript,' + encodeURIComponent(content));
    }
  } catch (e) {
    if (!url) {
      throw Error('Inline worker is not supported');
    }

    return new Worker(url);
  }
};

/***/ }),

/***/ "./package.json":
/*!**********************!*\
  !*** ./package.json ***!
  \**********************/
/*! exports provided: name, version, description, module, scripts, repository, keywords, author, license, bugs, homepage, dependencies, devDependencies, eslintConfig, default */
/***/ (function(module) {

module.exports = JSON.parse("{\"name\":\"imjoy-rpc\",\"version\":\"0.2.23\",\"description\":\"Remote procedure calls for ImJoy.\",\"module\":\"index.js\",\"scripts\":{\"build\":\"rm -rf dist && npm run build-umd\",\"build-umd\":\"webpack --config webpack.config.js --mode development && NODE_ENV=production webpack --config webpack.config.js --mode production --devtool source-map \",\"watch\":\"NODE_ENV=production webpack --watch --progress --config webpack.config.js --mode production --devtool source-map\",\"publish-npm\":\"npm install && npm run build && npm publish\",\"serve\":\"webpack-dev-server\",\"stats\":\"webpack --profile --json > stats.json\",\"stats-prod\":\"webpack --profile --json --mode production > stats-prod.json\",\"analyze\":\"webpack-bundle-analyzer -p 9999 stats.json\",\"analyze-prod\":\"webpack-bundle-analyzer -p 9999 stats-prod.json\",\"clean\":\"rimraf dist/*\",\"deploy\":\"npm run build && node deploy-site.js\",\"format\":\"prettier --write \\\"{src,tests}/**/**\\\"\",\"check-format\":\"prettier --check \\\"{src,tests}/**/**\\\"\",\"test\":\"karma start --single-run --browsers ChromeHeadless,FirefoxHeadless karma.conf.js\",\"test-watch\":\"karma start --auto-watch --browsers Chrome,FirefoxHeadless karma.conf.js --debug\"},\"repository\":{\"type\":\"git\",\"url\":\"git+https://github.com/imjoy-team/imjoy-rpc.git\"},\"keywords\":[\"imjoy\",\"rpc\"],\"author\":\"imjoy-team <imjoy.team@gmail.com>\",\"license\":\"MIT\",\"bugs\":{\"url\":\"https://github.com/imjoy-team/imjoy-rpc/issues\"},\"homepage\":\"https://github.com/imjoy-team/imjoy-rpc\",\"dependencies\":{},\"devDependencies\":{\"@babel/core\":\"^7.0.0-beta.39\",\"@babel/plugin-syntax-dynamic-import\":\"^7.0.0-beta.39\",\"@babel/polyfill\":\"^7.0.0-beta.39\",\"@babel/preset-env\":\"^7.0.0-beta.39\",\"@types/requirejs\":\"^2.1.28\",\"babel-core\":\"^6.26.0\",\"babel-eslint\":\"^10.1.0\",\"babel-loader\":\"^8.1.0\",\"babel-runtime\":\"^6.26.0\",\"chai\":\"^4.2.0\",\"clean-webpack-plugin\":\"^0.1.19\",\"copy-webpack-plugin\":\"^5.0.5\",\"eslint\":\"^6.8.0\",\"eslint-config-prettier\":\"^4.2.0\",\"eslint-loader\":\"^4.0.2\",\"file-loader\":\"^0.11.2\",\"fs-extra\":\"^0.30.0\",\"gh-pages\":\"^2.0.1\",\"html-loader\":\"^0.5.5\",\"html-webpack-plugin\":\"^3.2.0\",\"json-loader\":\"^0.5.4\",\"karma\":\"^4.4.1\",\"karma-chrome-launcher\":\"^3.1.0\",\"karma-firefox-launcher\":\"^1.3.0\",\"karma-mocha\":\"^1.3.0\",\"karma-spec-reporter\":\"0.0.32\",\"karma-webpack\":\"^4.0.2\",\"lerna\":\"^3.8.0\",\"lodash.debounce\":\"^4.0.8\",\"mocha\":\"^7.1.2\",\"postcss\":\"^6.0.2\",\"prettier\":\"^1.6.1\",\"rimraf\":\"^2.6.2\",\"schema-utils\":\"^0.4.3\",\"socket.io-client\":\"^2.3.0\",\"style-loader\":\"^0.18.1\",\"url-loader\":\"^0.5.9\",\"webpack\":\"^4.0.0\",\"webpack-bundle-analyzer\":\"^3.3.2\",\"webpack-cli\":\"^3.1.2\",\"webpack-dev-server\":\"^3.1.1\",\"webpack-merge\":\"^4.1.1\",\"workbox-webpack-plugin\":\"^4.3.1\",\"worker-loader\":\"^2.0.0\",\"write-file-webpack-plugin\":\"^4.5.1\"},\"eslintConfig\":{\"globals\":{\"document\":true,\"window\":true}}}");

/***/ }),

/***/ "./src/main.js":
/*!*********************!*\
  !*** ./src/main.js ***!
  \*********************/
/*! exports provided: RPC, API_VERSION, VERSION, waitForInitialization, setupRPC */
/***/ (function(module, __webpack_exports__, __webpack_require__) {
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "waitForInitialization", function() { return waitForInitialization; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "setupRPC", function() { return setupRPC; });
/* harmony import */ var _plugin_webworker_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./plugin.webworker.js */ "./src/plugin.webworker.js");
/* harmony import */ var _plugin_webworker_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_plugin_webworker_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _pluginIframe_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./pluginIframe.js */ "./src/pluginIframe.js");
/* harmony import */ var _pluginWebPython_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./pluginWebPython.js */ "./src/pluginWebPython.js");
/* harmony import */ var _utils_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./utils.js */ "./src/utils.js");
/* harmony import */ var _rpc_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./rpc.js */ "./src/rpc.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "RPC", function() { return _rpc_js__WEBPACK_IMPORTED_MODULE_4__["RPC"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "API_VERSION", function() { return _rpc_js__WEBPACK_IMPORTED_MODULE_4__["API_VERSION"]; });

/* harmony import */ var _package_json__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../package.json */ "./package.json");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "VERSION", function() { return _package_json__WEBPACK_IMPORTED_MODULE_5__["version"]; });

/**
 * Contains the code executed in the sandboxed frame under web-browser
 *
 * Tries to create a Web-Worker inside the frame and set up the
 * communication between the worker and the parent window. Some
 * browsers restrict creating a worker inside a sandboxed iframe - if
 * this happens, the plugin initialized right inside the frame (in the
 * same thread)
 */







function _inIframe() {
  try {
    return window.self !== window.top;
  } catch (e) {
    return true;
  }
}
/**
 * Initializes the plugin inside a web worker. May throw an exception
 * in case this was not permitted by the browser.
 */


function setupWebWorker(config) {
  if (!config.allow_execution) throw new Error("web-worker plugin can only work with allow_execution=true");
  const worker = new _plugin_webworker_js__WEBPACK_IMPORTED_MODULE_0___default.a(); // mixed content warning in Chrome silently skips worker
  // initialization without exception, handling this with timeout

  const fallbackTimeout = setTimeout(function () {
    worker.terminate();
    console.warn(`Plugin failed to start as a web-worker, running in an iframe instead.`);
    Object(_pluginIframe_js__WEBPACK_IMPORTED_MODULE_1__["default"])(config);
  }, 2000);
  const peer_id = Object(_utils_js__WEBPACK_IMPORTED_MODULE_3__["randId"])(); // forwarding messages between the worker and parent window

  worker.addEventListener("message", function (e) {
    let transferables = undefined;
    const m = e.data;

    if (m.type === "worker-ready") {
      // send config to the worker
      worker.postMessage({
        type: "connectRPC",
        config: config
      });
      clearTimeout(fallbackTimeout);
      return;
    } else if (m.type === "initialized") {
      // complete the missing fields
      m.config = Object.assign({}, config, m.config);
      m.origin = window.location.origin;
      m.peer_id = peer_id;
    } else if (m.type === "imjoy_remote_api_ready") {
      // if it's a webworker, there will be no api object returned
      window.dispatchEvent(new CustomEvent("imjoy_remote_api_ready", {
        detail: null
      }));
    } else if (m.type === "cacheRequirements" && typeof cache_requirements === "function") {
      cache_requirements(m.requirements);
    } else if (m.type === "disconnect") {
      worker.terminate();
    } else {
      if (m.__transferables__) {
        transferables = m.__transferables__;
        delete m.__transferables__;
      }
    }

    parent.postMessage(m, config.target_origin || "*", transferables);
  });
  window.addEventListener("message", function (e) {
    let transferables = undefined;
    const m = e.data;

    if (m.__transferables__) {
      transferables = m.__transferables__;
      delete m.__transferables__;
    }

    if (m.peer_id === peer_id) {
      worker.postMessage(m, transferables);
    } else if (config.debug) {
      console.log(`connection peer id mismatch ${m.peer_id} !== ${peer_id}`);
    }
  });
}

function waitForInitialization(config) {
  if (!_inIframe()) {
    throw new Error("waitForInitialization (imjoy-rpc) should only run inside an iframe.");
  }

  config = config || {};
  const targetOrigin = config.target_origin || "*";

  if (config.credential_required && typeof config.verify_credential !== "function") {
    throw new Error("Please also provide the `verify_credential` function with `credential_required`.");
  }

  if (config.credential_required && targetOrigin === "*") {
    throw new Error("`target_origin` was set to `*` with `credential_required=true`, there is a security risk that you may leak the credential to website from other origin. Please specify the `target_origin` explicitly.");
  }

  const done = () => {
    window.removeEventListener("message", handleEvent);
  };

  const peer_id = Object(_utils_js__WEBPACK_IMPORTED_MODULE_3__["randId"])();

  const handleEvent = e => {
    if (e.type === "message" && (targetOrigin === "*" || e.origin === targetOrigin)) {
      if (e.data.type === "initialize") {
        done();

        if (e.data.peer_id !== peer_id) {
          // TODO: throw an error when we are sure all the peers will send the peer_id
          console.warn(`${e.data.config && e.data.config.name}: connection peer id mismatch ${e.data.peer_id} !== ${peer_id}`);
        }

        const cfg = e.data.config; // override the target_origin setting if it's configured by the rpc client
        // otherwise take the setting from the core

        if (targetOrigin !== "*") {
          cfg.target_origin = targetOrigin;
        }

        if (config.credential_required) {
          config.verify_credential(cfg.credential).then(result => {
            if (result && result.auth && !result.error) {
              // pass the authentication information with tokens
              cfg.auth = result.auth;
              setupRPC(cfg).then(() => {
                console.log("ImJoy RPC loaded successfully!");
              });
            } else {
              throw new Error("Failed to verify the credentail:" + (result && result.error));
            }
          });
        } else {
          setupRPC(cfg).then(() => {
            console.log("ImJoy RPC loaded successfully!");
          });
        }
      } else {
        throw new Error(`unrecognized message: ${e.data}`);
      }
    }
  };

  window.addEventListener("message", handleEvent);
  parent.postMessage({
    type: "imjoyRPCReady",
    config: config,
    peer_id: peer_id
  }, "*");
}
function setupRPC(config) {
  config = config || {};
  if (!config.name) throw new Error("Please specify a name for your app.");
  config.version = config.version || "0.1.0";
  config.description = config.description || `[TODO: add description for ${config.name} ]`;
  config.type = config.type || "rpc-window";
  config.id = config.id || Object(_utils_js__WEBPACK_IMPORTED_MODULE_3__["randId"])();
  config.allow_execution = config.allow_execution || false;

  if (config.enable_service_worker) {
    Object(_utils_js__WEBPACK_IMPORTED_MODULE_3__["setupServiceWorker"])(config.base_url, config.target_origin, config.cache_requirements);
  }

  if (config.cache_requirements) {
    delete config.cache_requirements;
  } // remove functions


  config = Object.keys(config).reduce((p, c) => {
    if (typeof config[c] !== "function") p[c] = config[c];
    return p;
  }, {});
  return new Promise((resolve, reject) => {
    if (_inIframe()) {
      if (config.type === "web-worker") {
        try {
          setupWebWorker(config);
        } catch (e) {
          // fallback to iframe
          Object(_pluginIframe_js__WEBPACK_IMPORTED_MODULE_1__["default"])(config);
        }
      } else if (config.type === "web-python" || config.type === "web-python-window") {
        Object(_pluginWebPython_js__WEBPACK_IMPORTED_MODULE_2__["default"])(config);
      } else if (["rpc-window", "rpc-worker", "iframe", "window"].includes(config.type)) {
        Object(_pluginIframe_js__WEBPACK_IMPORTED_MODULE_1__["default"])(config);
      } else {
        console.error("Unsupported plugin type: " + config.type);
        reject("Unsupported plugin type: " + config.type);
      }

      try {
        const handleEvent = e => {
          const api = e.detail;

          if (config.expose_api_globally) {
            window.api = api;
          } // imjoy plugin api


          resolve(api);
          window.removeEventListener("imjoy_remote_api_ready", handleEvent);
        };

        window.addEventListener("imjoy_remote_api_ready", handleEvent);
      } catch (e) {
        reject(e);
      }
    } else {
      reject(new Error("imjoy-rpc should only run inside an iframe."));
    }
  });
}

/***/ }),

/***/ "./src/plugin.webworker.js":
/*!*********************************!*\
  !*** ./src/plugin.webworker.js ***!
  \*********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

module.exports = function() {
  return __webpack_require__(/*! !./node_modules/worker-loader/dist/workers/InlineWorker.js */ "./node_modules/worker-loader/dist/workers/InlineWorker.js")("/******/ (function(modules) { // webpackBootstrap\n/******/ \t// The module cache\n/******/ \tvar installedModules = {};\n/******/\n/******/ \t// The require function\n/******/ \tfunction __webpack_require__(moduleId) {\n/******/\n/******/ \t\t// Check if module is in cache\n/******/ \t\tif(installedModules[moduleId]) {\n/******/ \t\t\treturn installedModules[moduleId].exports;\n/******/ \t\t}\n/******/ \t\t// Create a new module (and put it into the cache)\n/******/ \t\tvar module = installedModules[moduleId] = {\n/******/ \t\t\ti: moduleId,\n/******/ \t\t\tl: false,\n/******/ \t\t\texports: {}\n/******/ \t\t};\n/******/\n/******/ \t\t// Execute the module function\n/******/ \t\tmodules[moduleId].call(module.exports, module, module.exports, __webpack_require__);\n/******/\n/******/ \t\t// Flag the module as loaded\n/******/ \t\tmodule.l = true;\n/******/\n/******/ \t\t// Return the exports of the module\n/******/ \t\treturn module.exports;\n/******/ \t}\n/******/\n/******/\n/******/ \t// expose the modules object (__webpack_modules__)\n/******/ \t__webpack_require__.m = modules;\n/******/\n/******/ \t// expose the module cache\n/******/ \t__webpack_require__.c = installedModules;\n/******/\n/******/ \t// define getter function for harmony exports\n/******/ \t__webpack_require__.d = function(exports, name, getter) {\n/******/ \t\tif(!__webpack_require__.o(exports, name)) {\n/******/ \t\t\tObject.defineProperty(exports, name, { enumerable: true, get: getter });\n/******/ \t\t}\n/******/ \t};\n/******/\n/******/ \t// define __esModule on exports\n/******/ \t__webpack_require__.r = function(exports) {\n/******/ \t\tif(typeof Symbol !== 'undefined' && Symbol.toStringTag) {\n/******/ \t\t\tObject.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });\n/******/ \t\t}\n/******/ \t\tObject.defineProperty(exports, '__esModule', { value: true });\n/******/ \t};\n/******/\n/******/ \t// create a fake namespace object\n/******/ \t// mode & 1: value is a module id, require it\n/******/ \t// mode & 2: merge all properties of value into the ns\n/******/ \t// mode & 4: return value when already ns object\n/******/ \t// mode & 8|1: behave like require\n/******/ \t__webpack_require__.t = function(value, mode) {\n/******/ \t\tif(mode & 1) value = __webpack_require__(value);\n/******/ \t\tif(mode & 8) return value;\n/******/ \t\tif((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;\n/******/ \t\tvar ns = Object.create(null);\n/******/ \t\t__webpack_require__.r(ns);\n/******/ \t\tObject.defineProperty(ns, 'default', { enumerable: true, value: value });\n/******/ \t\tif(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));\n/******/ \t\treturn ns;\n/******/ \t};\n/******/\n/******/ \t// getDefaultExport function for compatibility with non-harmony modules\n/******/ \t__webpack_require__.n = function(module) {\n/******/ \t\tvar getter = module && module.__esModule ?\n/******/ \t\t\tfunction getDefault() { return module['default']; } :\n/******/ \t\t\tfunction getModuleExports() { return module; };\n/******/ \t\t__webpack_require__.d(getter, 'a', getter);\n/******/ \t\treturn getter;\n/******/ \t};\n/******/\n/******/ \t// Object.prototype.hasOwnProperty.call\n/******/ \t__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };\n/******/\n/******/ \t// __webpack_public_path__\n/******/ \t__webpack_require__.p = \"\";\n/******/\n/******/\n/******/ \t// Load entry module and return exports\n/******/ \treturn __webpack_require__(__webpack_require__.s = \"./src/plugin.webworker.js\");\n/******/ })\n/************************************************************************/\n/******/ ({\n\n/***/ \"./src/plugin.webworker.js\":\n/*!*********************************!*\\\n  !*** ./src/plugin.webworker.js ***!\n  \\*********************************/\n/*! no exports provided */\n/***/ (function(module, __webpack_exports__, __webpack_require__) {\n\n\"use strict\";\n__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _pluginCore_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./pluginCore.js */ \"./src/pluginCore.js\");\n/* harmony import */ var _rpc_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./rpc.js */ \"./src/rpc.js\");\n/* harmony import */ var _utils_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./utils.js */ \"./src/utils.js\");\n/**\n * Contains the routines loaded by the plugin Worker under web-browser.\n *\n * Initializes the web environment version of the platform-dependent\n * connection object for the plugin site\n */\n\n\n\n\n(function() {\n  // make sure this runs inside a webworker\n  if (\n    typeof WorkerGlobalScope === \"undefined\" ||\n    !self ||\n    !(self instanceof WorkerGlobalScope)\n  ) {\n    throw new Error(\"This script can only loaded in a webworker\");\n  }\n  /**\n   * Connection object provided to the RPC constructor,\n   * plugin site implementation for the web-based environment.\n   * Global will be then cleared to prevent exposure into the\n   * Worker, so we put this local connection object into a closure\n   */\n  class Connection extends _utils_js__WEBPACK_IMPORTED_MODULE_2__[\"MessageEmitter\"] {\n    constructor(config) {\n      super(config && config.debug);\n      this.config = config || {};\n    }\n    connect() {\n      self.addEventListener(\"message\", e => {\n        this._fire(e.data.type, e.data);\n      });\n      this.emit({\n        type: \"initialized\",\n        config: this.config\n      });\n    }\n    disconnect() {\n      this._fire(\"beforeDisconnect\");\n      self.close();\n      this._fire(\"disconnected\");\n    }\n    emit(data) {\n      let transferables = undefined;\n      if (data.__transferables__) {\n        transferables = data.__transferables__;\n        delete data.__transferables__;\n      }\n      self.postMessage(data, transferables);\n    }\n    async execute(code) {\n      if (code.type === \"requirements\") {\n        try {\n          if (\n            code.requirements &&\n            (Array.isArray(code.requirements) ||\n              typeof code.requirements === \"string\")\n          ) {\n            try {\n              if (!Array.isArray(code.requirements)) {\n                code.requirements = [code.requirements];\n              }\n              for (var i = 0; i < code.requirements.length; i++) {\n                if (\n                  code.requirements[i].toLowerCase().endsWith(\".css\") ||\n                  code.requirements[i].startsWith(\"css:\")\n                ) {\n                  throw \"unable to import css in a webworker\";\n                } else if (\n                  code.requirements[i].toLowerCase().endsWith(\".js\") ||\n                  code.requirements[i].startsWith(\"js:\")\n                ) {\n                  if (code.requirements[i].startsWith(\"js:\")) {\n                    code.requirements[i] = code.requirements[i].slice(3);\n                  }\n                  importScripts(code.requirements[i]);\n                } else if (code.requirements[i].startsWith(\"http\")) {\n                  importScripts(code.requirements[i]);\n                } else if (code.requirements[i].startsWith(\"cache:\")) {\n                  //ignore cache\n                } else {\n                  console.log(\n                    \"Unprocessed requirements url: \" + code.requirements[i]\n                  );\n                }\n              }\n            } catch (e) {\n              throw \"failed to import required scripts: \" +\n                code.requirements.toString();\n            }\n          }\n        } catch (e) {\n          throw e;\n        }\n      } else if (code.type === \"script\") {\n        try {\n          if (\n            code.requirements &&\n            (Array.isArray(code.requirements) ||\n              typeof code.requirements === \"string\")\n          ) {\n            try {\n              if (Array.isArray(code.requirements)) {\n                for (let i = 0; i < code.requirements.length; i++) {\n                  importScripts(code.requirements[i]);\n                }\n              } else {\n                importScripts(code.requirements);\n              }\n            } catch (e) {\n              throw \"failed to import required scripts: \" +\n                code.requirements.toString();\n            }\n          }\n          eval(code.content);\n        } catch (e) {\n          console.error(e.message, e.stack);\n          throw e;\n        }\n      } else {\n        throw \"unsupported code type.\";\n      }\n      if (code.type === \"requirements\") {\n        self.postMessage({\n          type: \"cacheRequirements\",\n          requirements: code.requirements\n        });\n      }\n    }\n  }\n  const config = {\n    type: \"web-worker\",\n    dedicated_thread: true,\n    allow_execution: true,\n    lang: \"javascript\",\n    api_version: _rpc_js__WEBPACK_IMPORTED_MODULE_1__[\"API_VERSION\"]\n  };\n  const conn = new Connection(config);\n  conn.on(\"connectRPC\", data => {\n    Object(_pluginCore_js__WEBPACK_IMPORTED_MODULE_0__[\"connectRPC\"])(conn, Object.assign(data.config, config));\n  });\n  conn.connect();\n  self.postMessage({\n    type: \"worker-ready\"\n  });\n})();\n\n\n/***/ }),\n\n/***/ \"./src/pluginCore.js\":\n/*!***************************!*\\\n  !*** ./src/pluginCore.js ***!\n  \\***************************/\n/*! exports provided: connectRPC */\n/***/ (function(module, __webpack_exports__, __webpack_require__) {\n\n\"use strict\";\n__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"connectRPC\", function() { return connectRPC; });\n/* harmony import */ var _rpc_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./rpc.js */ \"./src/rpc.js\");\n/**\n * Core plugin script loaded into the plugin process/thread.\n *\n * Initializes the plugin-site API global methods.\n */\n\nfunction connectRPC(connection, config) {\n  config = config || {};\n  const codecs = {};\n  const rpc = new _rpc_js__WEBPACK_IMPORTED_MODULE_0__[\"RPC\"](connection, config, codecs);\n  rpc.on(\"getInterface\", function () {\n    launchConnected();\n  });\n  rpc.on(\"remoteReady\", function () {\n    const api = rpc.getRemote() || {};\n\n    if (api.export) {\n      throw new Error(\"`export` is a reserved function name\");\n    }\n\n    if (api.onload) {\n      throw new Error(\"`onload` is a reserved function name\");\n    }\n\n    if (api.dispose) {\n      throw new Error(\"`dispose` is a reserved function name\");\n    }\n\n    api.registerCodec = function (config) {\n      if (!config[\"name\"] || !config[\"encoder\"] && !config[\"decoder\"]) {\n        throw new Error(\"Invalid codec format, please make sure you provide a name, type, encoder and decoder.\");\n      } else {\n        if (config.type) {\n          for (let k of Object.keys(codecs)) {\n            if (codecs[k].type === config.type || k === config.name) {\n              delete codecs[k];\n              console.warn(\"Remove duplicated codec: \" + k);\n            }\n          }\n        }\n\n        codecs[config[\"name\"]] = config;\n      }\n    };\n\n    api.disposeObject = function (obj) {\n      rpc.disposeObject(obj);\n    };\n\n    api.export = function (_interface, config) {\n      rpc.setInterface(_interface, config);\n    };\n\n    api.onLoad = function (handler) {\n      handler = checkHandler(handler);\n\n      if (connected) {\n        handler();\n      } else {\n        connectedHandlers.push(handler);\n      }\n    };\n\n    api.dispose = function (_interface) {\n      rpc.disconnect();\n    };\n\n    if (typeof WorkerGlobalScope !== \"undefined\" && self instanceof WorkerGlobalScope) {\n      self.api = api;\n      self.postMessage({\n        type: \"imjoy_remote_api_ready\"\n      });\n    } else if (typeof window) {\n      window.dispatchEvent(new CustomEvent(\"imjoy_remote_api_ready\", {\n        detail: api\n      }));\n    }\n  });\n  let connected = false;\n  const connectedHandlers = [];\n\n  const launchConnected = function () {\n    if (!connected) {\n      connected = true;\n      let handler;\n\n      while (handler = connectedHandlers.pop()) {\n        handler();\n      }\n    }\n  };\n\n  const checkHandler = function (handler) {\n    const type = typeof handler;\n\n    if (type !== \"function\") {\n      const msg = \"A function may only be subsribed to the event, \" + type + \" was provided instead\";\n      throw new Error(msg);\n    }\n\n    return handler;\n  };\n\n  return rpc;\n}\n\n/***/ }),\n\n/***/ \"./src/rpc.js\":\n/*!********************!*\\\n  !*** ./src/rpc.js ***!\n  \\********************/\n/*! exports provided: API_VERSION, RPC */\n/***/ (function(module, __webpack_exports__, __webpack_require__) {\n\n\"use strict\";\n__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"API_VERSION\", function() { return API_VERSION; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"RPC\", function() { return RPC; });\n/* harmony import */ var _utils_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./utils.js */ \"./src/utils.js\");\n/**\n * Contains the RPC object used both by the application\n * site, and by each plugin\n */\n\nconst API_VERSION = \"0.2.3\";\nconst ArrayBufferView = Object.getPrototypeOf(Object.getPrototypeOf(new Uint8Array())).constructor;\n\nfunction _appendBuffer(buffer1, buffer2) {\n  const tmp = new Uint8Array(buffer1.byteLength + buffer2.byteLength);\n  tmp.set(new Uint8Array(buffer1), 0);\n  tmp.set(new Uint8Array(buffer2), buffer1.byteLength);\n  return tmp.buffer;\n}\n\nfunction indexObject(obj, is) {\n  if (!is) throw new Error(\"undefined index\");\n  if (typeof is === \"string\") return indexObject(obj, is.split(\".\"));else if (is.length === 0) return obj;else return indexObject(obj[is[0]], is.slice(1));\n}\n/**\n * RPC object represents a single site in the\n * communication protocol between the application and the plugin\n *\n * @param {Object} connection a special object allowing to send\n * and receive messages from the opposite site (basically it\n * should only provide send() and onMessage() methods)\n */\n\n\nclass RPC extends _utils_js__WEBPACK_IMPORTED_MODULE_0__[\"MessageEmitter\"] {\n  constructor(connection, config, codecs) {\n    super(config && config.debug);\n    this._connection = connection;\n    this.config = config || {};\n    this._codecs = codecs || {};\n    this._object_store = {};\n    this._method_weakmap = new WeakMap();\n    this._object_weakmap = new WeakMap();\n    this._local_api = null; // make sure there is an execute function\n\n    const name = this.config.name;\n\n    this._connection.execute = this._connection.execute || function () {\n      throw new Error(`connection.execute not implemented (in \"${name}\")`);\n    };\n\n    this._store = new ReferenceStore();\n    this._method_refs = new ReferenceStore();\n\n    this._method_refs.onReady(() => {\n      this._fire(\"remoteIdle\");\n    });\n\n    this._method_refs.onBusy(() => {\n      this._fire(\"remoteBusy\");\n    });\n\n    this._setupMessageHanlders();\n  }\n\n  init() {\n    this._connection.emit({\n      type: \"initialized\",\n      config: this.config,\n      peer_id: this._connection.peer_id\n    });\n  }\n  /**\n   * Set a handler to be called when received a responce from the\n   * remote site reporting that the previously provided interface\n   * has been successfully set as remote for that site\n   *\n   * @param {Function} handler\n   */\n\n\n  getRemoteCallStack() {\n    return this._method_refs.getStack();\n  }\n  /**\n   * @returns {Object} set of remote interface methods\n   */\n\n\n  getRemote() {\n    return this._remote_interface;\n  }\n  /**\n   * Sets the interface of this site making it available to the\n   * remote site by sending a message with a set of methods names\n   *\n   * @param {Object} _interface to set\n   */\n\n\n  setInterface(_interface, config) {\n    config = config || {};\n    this.config.name = config.name || this.config.name;\n    this.config.description = config.description || this.config.description;\n\n    if (this.config.forwarding_functions) {\n      for (let func_name of this.config.forwarding_functions) {\n        const _remote = this._remote_interface;\n\n        if (_remote[func_name]) {\n          if (_interface.constructor === Object) {\n            if (!_interface[func_name]) {\n              _interface[func_name] = (...args) => {\n                _remote[func_name](...args);\n              };\n            }\n          } else if (_interface.constructor.constructor === Function) {\n            if (!_interface.constructor.prototype[func_name]) {\n              _interface.constructor.prototype[func_name] = (...args) => {\n                _remote[func_name](...args);\n              };\n            }\n          }\n        }\n      }\n    }\n\n    this._local_api = _interface;\n\n    this._fire(\"interfaceAvailable\");\n  }\n  /**\n   * Sends the actual interface to the remote site upon it was\n   * updated or by a special request of the remote site\n   */\n\n\n  sendInterface() {\n    if (!this._local_api) {\n      throw new Error(\"interface is not set.\");\n    }\n\n    this._encode(this._local_api, true).then(api => {\n      this._connection.emit({\n        type: \"setInterface\",\n        api: api\n      });\n    });\n  }\n\n  _disposeObject(objectId) {\n    if (this._object_store[objectId]) {\n      delete this._object_store[objectId];\n    } else {\n      throw new Error(`Object (id=${objectId}) not found.`);\n    }\n  }\n\n  disposeObject(obj) {\n    return new Promise((resolve, reject) => {\n      if (this._object_weakmap.has(obj)) {\n        const objectId = this._object_weakmap.get(obj);\n\n        this._connection.once(\"disposed\", data => {\n          if (data.error) reject(new Error(data.error));else resolve();\n        });\n\n        this._connection.emit({\n          type: \"disposeObject\",\n          object_id: objectId\n        });\n      } else {\n        throw new Error(\"Invalid object\");\n      }\n    });\n  }\n  /**\n   * Handles a message from the remote site\n   */\n\n\n  _setupMessageHanlders() {\n    this._connection.on(\"init\", this.init);\n\n    this._connection.on(\"execute\", data => {\n      Promise.resolve(this._connection.execute(data.code)).then(() => {\n        this._connection.emit({\n          type: \"executed\"\n        });\n      }).catch(e => {\n        console.error(e);\n\n        this._connection.emit({\n          type: \"executed\",\n          error: String(e)\n        });\n      });\n    });\n\n    this._connection.on(\"method\", async data => {\n      let resolve, reject, method, method_this, args, result;\n\n      try {\n        if (data.promise) {\n          [resolve, reject] = await this._unwrap(data.promise, false);\n        }\n\n        const _interface = this._object_store[data.object_id];\n        method = indexObject(_interface, data.name);\n\n        if (data.name.includes(\".\")) {\n          const tmp = data.name.split(\".\");\n          const intf_index = tmp.slice(0, tmp.length - 1).join(\".\");\n          method_this = indexObject(_interface, intf_index);\n        } else {\n          method_this = _interface;\n        }\n\n        args = await this._unwrap(data.args, true);\n\n        if (data.promise) {\n          result = method.apply(method_this, args);\n\n          if (result instanceof Promise || method.constructor && method.constructor.name === \"AsyncFunction\") {\n            result.then(resolve).catch(reject);\n          } else {\n            resolve(result);\n          }\n        } else {\n          method.apply(method_this, args);\n        }\n      } catch (err) {\n        console.error(this.config.name, err);\n\n        if (reject) {\n          reject(err);\n        }\n      }\n    });\n\n    this._connection.on(\"callback\", async data => {\n      let resolve, reject, method, args, result;\n\n      try {\n        if (data.promise) {\n          [resolve, reject] = await this._unwrap(data.promise, false);\n        }\n\n        if (data.promise) {\n          method = this._store.fetch(data.id);\n          args = await this._unwrap(data.args, true);\n\n          if (!method) {\n            throw new Error(\"Callback function can only called once, if you want to call a function for multiple times, please make it as a plugin api function. See https://imjoy.io/docs for more details.\");\n          }\n\n          result = method.apply(null, args);\n\n          if (result instanceof Promise || method.constructor && method.constructor.name === \"AsyncFunction\") {\n            result.then(resolve).catch(reject);\n          } else {\n            resolve(result);\n          }\n        } else {\n          method = this._store.fetch(data.id);\n          args = await this._unwrap(data.args, true);\n\n          if (!method) {\n            throw new Error(\"Please notice that callback function can only called once, if you want to call a function for multiple times, please make it as a plugin api function. See https://imjoy.io/docs for more details.\");\n          }\n\n          method.apply(null, args);\n        }\n      } catch (err) {\n        console.error(this.config.name, err);\n\n        if (reject) {\n          reject(err);\n        }\n      }\n    });\n\n    this._connection.on(\"disposeObject\", data => {\n      try {\n        this._disposeObject(data.object_id);\n\n        this._connection.emit({\n          type: \"disposed\"\n        });\n      } catch (e) {\n        console.error(e);\n\n        this._connection.emit({\n          type: \"disposed\",\n          error: String(e)\n        });\n      }\n    });\n\n    this._connection.on(\"setInterface\", data => {\n      this._setRemoteInterface(data.api);\n    });\n\n    this._connection.on(\"getInterface\", () => {\n      this._fire(\"getInterface\");\n\n      if (this._local_api) {\n        this.sendInterface();\n      } else {\n        this.once(\"interfaceAvailable\", () => {\n          this.sendInterface();\n        });\n      }\n    });\n\n    this._connection.on(\"interfaceSetAsRemote\", () => {\n      this._fire(\"interfaceSetAsRemote\");\n    });\n\n    this._connection.on(\"disconnect\", () => {\n      this._fire(\"beforeDisconnect\");\n\n      this._connection.disconnect();\n\n      this._fire(\"disconnected\");\n    });\n  }\n  /**\n   * Sends a requests to the remote site asking it to provide its\n   * current interface\n   */\n\n\n  requestRemote() {\n    this._connection.emit({\n      type: \"getInterface\"\n    });\n  }\n\n  _ndarray(typedArray, shape, dtype) {\n    const _dtype = _utils_js__WEBPACK_IMPORTED_MODULE_0__[\"typedArrayToDtype\"][typedArray.constructor.name];\n\n    if (dtype && dtype !== _dtype) {\n      throw \"dtype doesn't match the type of the array: \" + _dtype + \" != \" + dtype;\n    }\n\n    shape = shape || [typedArray.length];\n    return {\n      _rtype: \"ndarray\",\n      _rvalue: typedArray.buffer,\n      _rshape: shape,\n      _rdtype: _dtype\n    };\n  }\n  /**\n   * Sets the new remote interface provided by the other site\n   *\n   * @param {Array} names list of function names\n   */\n\n\n  _setRemoteInterface(api) {\n    this._decode(api).then(intf => {\n      this._remote_interface = intf;\n\n      this._fire(\"remoteReady\");\n\n      this._reportRemoteSet();\n    });\n  }\n  /**\n   * Generates the wrapped function corresponding to a single remote\n   * method. When the generated function is called, it will send the\n   * corresponding message to the remote site asking it to execute\n   * the particular method of its interface\n   *\n   * @param {String} name of the remote method\n   *\n   * @returns {Function} wrapped remote method\n   */\n\n\n  _genRemoteMethod(targetId, name, objectId) {\n    const me = this;\n\n    const remoteMethod = function () {\n      return new Promise(async (resolve, reject) => {\n        let id = null;\n\n        try {\n          id = me._method_refs.put(objectId ? objectId + \"/\" + name : name);\n\n          const wrapped_resolve = function () {\n            if (id !== null) me._method_refs.fetch(id);\n            return resolve.apply(this, arguments);\n          };\n\n          const wrapped_reject = function () {\n            if (id !== null) me._method_refs.fetch(id);\n            return reject.apply(this, arguments);\n          };\n\n          const encodedPromise = await me._wrap([wrapped_resolve, wrapped_reject]); // store the key id for removing them from the reference store together\n\n          wrapped_resolve.__promise_pair = encodedPromise[1]._rvalue;\n          wrapped_reject.__promise_pair = encodedPromise[0]._rvalue;\n          let args = Array.prototype.slice.call(arguments);\n\n          if (name === \"register\" || name === \"export\" || name === \"on\") {\n            args = await me._wrap(args, true);\n          } else {\n            args = await me._wrap(args);\n          }\n\n          const transferables = args.__transferables__;\n          if (transferables) delete args.__transferables__;\n\n          me._connection.emit({\n            type: \"method\",\n            target_id: targetId,\n            name: name,\n            object_id: objectId,\n            args: args,\n            promise: encodedPromise\n          }, transferables);\n        } catch (e) {\n          if (id) me._method_refs.fetch(id);\n          reject(`Failed to exectue remote method (interface: ${objectId || me.id}, method: ${name}), error: ${e}`);\n        }\n      });\n    };\n\n    remoteMethod.__remote_method = true;\n    return remoteMethod;\n  }\n  /**\n   * Sends a responce reporting that interface just provided by the\n   * remote site was successfully set by this site as remote\n   */\n\n\n  _reportRemoteSet() {\n    this._connection.emit({\n      type: \"interfaceSetAsRemote\"\n    });\n  }\n  /**\n   * Prepares the provided set of remote method arguments for\n   * sending to the remote site, replaces all the callbacks with\n   * identifiers\n   *\n   * @param {Array} args to wrap\n   *\n   * @returns {Array} wrapped arguments\n   */\n\n\n  async _encode(aObject, asInterface, objectId) {\n    const aType = typeof aObject;\n\n    if (aType === \"number\" || aType === \"string\" || aType === \"boolean\" || aObject === null || aObject === undefined || aObject instanceof ArrayBuffer) {\n      return aObject;\n    }\n\n    let bObject;\n\n    if (typeof aObject === \"function\") {\n      if (asInterface) {\n        if (!objectId) throw new Error(\"objectId is not specified.\");\n        bObject = {\n          _rtype: \"interface\",\n          _rtarget_id: this._connection.peer_id,\n          _rintf: objectId,\n          _rvalue: asInterface\n        };\n\n        this._method_weakmap.set(aObject, bObject);\n      } else if (this._method_weakmap.has(aObject)) {\n        bObject = this._method_weakmap.get(aObject);\n      } else {\n        const cid = this._store.put(aObject);\n\n        bObject = {\n          _rtype: \"callback\",\n          _rtarget_id: this._connection.peer_id,\n          _rname: aObject.constructor && aObject.constructor.name || cid,\n          _rvalue: cid\n        };\n      }\n\n      return bObject;\n    } // skip if already encoded\n\n\n    if (aObject.constructor instanceof Object && aObject._rtype) {\n      // make sure the interface functions are encoded\n      if (aObject._rintf) {\n        const temp = aObject._rtype;\n        delete aObject._rtype;\n        bObject = await this._encode(aObject, asInterface, objectId);\n        bObject._rtype = temp;\n      } else {\n        bObject = aObject;\n      }\n\n      return bObject;\n    }\n\n    const transferables = [];\n    const _transfer = aObject._transfer;\n    const isarray = Array.isArray(aObject);\n\n    for (let tp of Object.keys(this._codecs)) {\n      const codec = this._codecs[tp];\n\n      if (codec.encoder && aObject instanceof codec.type) {\n        // TODO: what if multiple encoders found\n        let encodedObj = await Promise.resolve(codec.encoder(aObject));\n        if (encodedObj && !encodedObj._rtype) encodedObj._rtype = codec.name; // encode the functions in the interface object\n\n        if (encodedObj && encodedObj._rintf) {\n          const temp = encodedObj._rtype;\n          delete encodedObj._rtype;\n          encodedObj = await this._encode(encodedObj, asInterface, objectId);\n          encodedObj._rtype = temp;\n        }\n\n        bObject = encodedObj;\n        return bObject;\n      }\n    }\n\n    if (\n    /*global tf*/\n    typeof tf !== \"undefined\" && tf.Tensor && aObject instanceof tf.Tensor) {\n      const v_buffer = aObject.dataSync();\n\n      if (aObject._transfer || _transfer) {\n        transferables.push(v_buffer.buffer);\n        delete aObject._transfer;\n      }\n\n      bObject = {\n        _rtype: \"ndarray\",\n        _rvalue: v_buffer.buffer,\n        _rshape: aObject.shape,\n        _rdtype: aObject.dtype\n      };\n    } else if (\n    /*global nj*/\n    typeof nj !== \"undefined\" && nj.NdArray && aObject instanceof nj.NdArray) {\n      const dtype = _utils_js__WEBPACK_IMPORTED_MODULE_0__[\"typedArrayToDtype\"][aObject.selection.data.constructor.name];\n\n      if (aObject._transfer || _transfer) {\n        transferables.push(aObject.selection.data.buffer);\n        delete aObject._transfer;\n      }\n\n      bObject = {\n        _rtype: \"ndarray\",\n        _rvalue: aObject.selection.data.buffer,\n        _rshape: aObject.shape,\n        _rdtype: dtype\n      };\n    } else if (aObject instanceof Error) {\n      console.error(aObject);\n      bObject = {\n        _rtype: \"error\",\n        _rvalue: aObject.toString()\n      };\n    } else if (typeof File !== \"undefined\" && aObject instanceof File) {\n      bObject = {\n        _rtype: \"file\",\n        _rvalue: aObject,\n        _rpath: aObject._path || aObject.webkitRelativePath\n      };\n    } // send objects supported by structure clone algorithm\n    // https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm\n    else if (aObject !== Object(aObject) || aObject instanceof Boolean || aObject instanceof String || aObject instanceof Date || aObject instanceof RegExp || aObject instanceof ImageData || typeof FileList !== \"undefined\" && aObject instanceof FileList) {\n        bObject = aObject; // TODO: avoid object such as DynamicPlugin instance.\n      } else if (typeof File !== \"undefined\" && aObject instanceof File) {\n        bObject = {\n          _rtype: \"file\",\n          _rname: aObject.name,\n          _rmime: aObject.type,\n          _rvalue: aObject,\n          _rpath: aObject._path || aObject.webkitRelativePath\n        };\n      } else if (aObject instanceof Blob) {\n        bObject = {\n          _rtype: \"blob\",\n          _rvalue: aObject\n        };\n      } else if (aObject instanceof ArrayBufferView) {\n        if (aObject._transfer || _transfer) {\n          transferables.push(aObject.buffer);\n          delete aObject._transfer;\n        }\n\n        const dtype = _utils_js__WEBPACK_IMPORTED_MODULE_0__[\"typedArrayToDtype\"][aObject.constructor.name];\n        bObject = {\n          _rtype: \"typedarray\",\n          _rvalue: aObject.buffer,\n          _rdtype: dtype\n        };\n      } else if (aObject instanceof DataView) {\n        if (aObject._transfer || _transfer) {\n          transferables.push(aObject.buffer);\n          delete aObject._transfer;\n        }\n\n        bObject = {\n          _rtype: \"memoryview\",\n          _rvalue: aObject.buffer\n        };\n      } else if (aObject instanceof Set) {\n        bObject = {\n          _rtype: \"set\",\n          _rvalue: await this._encode(Array.from(aObject), asInterface)\n        };\n      } else if (aObject instanceof Map) {\n        bObject = {\n          _rtype: \"orderedmap\",\n          _rvalue: await this._encode(Array.from(aObject), asInterface)\n        };\n      } else if (aObject.constructor instanceof Object || Array.isArray(aObject)) {\n        bObject = isarray ? [] : {};\n        let keys; // an object/array\n\n        if (aObject.constructor === Object || Array.isArray(aObject)) {\n          keys = Object.keys(aObject);\n        } // a class\n        else if (aObject.constructor === Function) {\n            throw new Error(\"Please instantiate the class before exportting it.\");\n          } // instance of a class\n          else if (aObject.constructor.constructor === Function) {\n              keys = Object.getOwnPropertyNames(Object.getPrototypeOf(aObject)).concat(Object.keys(aObject)); // TODO: use a proxy object to represent the actual object\n              // always encode class instance as interface\n\n              asInterface = true;\n            } else {\n              throw Error(\"Unsupported interface type\");\n            }\n\n        let hasFunction = false; // encode interfaces\n\n        if (aObject._rintf || asInterface) {\n          if (!objectId) {\n            objectId = Object(_utils_js__WEBPACK_IMPORTED_MODULE_0__[\"randId\"])();\n            this._object_store[objectId] = aObject;\n          }\n\n          for (let k of keys) {\n            if (k === \"constructor\") continue;\n\n            if (k.startsWith(\"_\")) {\n              continue;\n            }\n\n            bObject[k] = await this._encode(aObject[k], typeof asInterface === \"string\" ? asInterface + \".\" + k : k, objectId);\n\n            if (typeof aObject[k] === \"function\") {\n              hasFunction = true;\n            }\n          } // object id for dispose the object remotely\n\n\n          if (hasFunction) bObject._rintf = objectId; // remove interface when closed\n\n          if (aObject.on && typeof aObject.on === \"function\") {\n            aObject.on(\"close\", () => {\n              delete this._object_store[objectId];\n            });\n          }\n        } else {\n          for (let k of keys) {\n            if ([\"hasOwnProperty\", \"constructor\"].includes(k)) continue;\n            bObject[k] = await this._encode(aObject[k]);\n          }\n        } // for example, browserFS object\n\n      } else if (typeof aObject === \"object\") {\n        const keys = Object.getOwnPropertyNames(Object.getPrototypeOf(aObject)).concat(Object.keys(aObject));\n        const objectId = Object(_utils_js__WEBPACK_IMPORTED_MODULE_0__[\"randId\"])();\n\n        for (let k of keys) {\n          if ([\"hasOwnProperty\", \"constructor\"].includes(k)) continue; // encode as interface\n\n          bObject[k] = await this._encode(aObject[k], k, bObject);\n        } // object id, used for dispose the object\n\n\n        bObject._rintf = objectId;\n      } else {\n        throw \"imjoy-rpc: Unsupported data type:\" + aObject;\n      }\n\n    if (transferables.length > 0) {\n      bObject.__transferables__ = transferables;\n    }\n\n    if (!bObject) {\n      throw new Error(\"Failed to encode object\");\n    }\n\n    return bObject;\n  }\n\n  async _decode(aObject, withPromise) {\n    if (!aObject) {\n      return aObject;\n    }\n\n    let bObject;\n\n    if (aObject[\"_rtype\"]) {\n      if (this._codecs[aObject._rtype] && this._codecs[aObject._rtype].decoder) {\n        if (aObject._rintf) {\n          const temp = aObject._rtype;\n          delete aObject._rtype;\n          aObject = await this._decode(aObject, withPromise);\n          aObject._rtype = temp;\n        }\n\n        bObject = await Promise.resolve(this._codecs[aObject._rtype].decoder(aObject));\n      } else if (aObject._rtype === \"callback\") {\n        bObject = this._genRemoteCallback(aObject._rtarget_id, aObject._rvalue, withPromise);\n      } else if (aObject._rtype === \"interface\") {\n        bObject = this._genRemoteMethod(aObject._rtarget_id, aObject._rvalue, aObject._rintf);\n      } else if (aObject._rtype === \"ndarray\") {\n        /*global nj tf*/\n        //create build array/tensor if used in the plugin\n        if (typeof nj !== \"undefined\" && nj.array) {\n          if (Array.isArray(aObject._rvalue)) {\n            aObject._rvalue = aObject._rvalue.reduce(_appendBuffer);\n          }\n\n          bObject = nj.array(new Uint8(aObject._rvalue), aObject._rdtype).reshape(aObject._rshape);\n        } else if (typeof tf !== \"undefined\" && tf.Tensor) {\n          if (Array.isArray(aObject._rvalue)) {\n            aObject._rvalue = aObject._rvalue.reduce(_appendBuffer);\n          }\n\n          const arraytype = eval(_utils_js__WEBPACK_IMPORTED_MODULE_0__[\"dtypeToTypedArray\"][aObject._rdtype]);\n          bObject = tf.tensor(new arraytype(aObject._rvalue), aObject._rshape, aObject._rdtype);\n        } else {\n          //keep it as regular if transfered to the main app\n          bObject = aObject;\n        }\n      } else if (aObject._rtype === \"error\") {\n        bObject = new Error(aObject._rvalue);\n      } else if (aObject._rtype === \"file\") {\n        if (aObject._rvalue instanceof File) {\n          bObject = aObject._rvalue; //patch _path\n\n          bObject._path = aObject._rpath;\n        } else {\n          bObject = new File([aObject._rvalue], aObject._rname, {\n            type: aObject._rmime\n          });\n          bObject._path = aObject._rpath;\n        }\n      } else if (aObject._rtype === \"typedarray\") {\n        const arraytype = eval(_utils_js__WEBPACK_IMPORTED_MODULE_0__[\"dtypeToTypedArray\"][aObject._rdtype]);\n        if (!arraytype) throw new Error(\"unsupported dtype: \" + aObject._rdtype);\n        bObject = new arraytype(aObject._rvalue);\n      } else if (aObject._rtype === \"memoryview\") {\n        bObject = new DataView(aObject._rvalue);\n      } else if (aObject._rtype === \"blob\") {\n        if (aObject._rvalue instanceof Blob) {\n          bObject = aObject._rvalue;\n        } else {\n          bObject = new Blob([aObject._rvalue], {\n            type: aObject._rmime\n          });\n        }\n      } else if (aObject._rtype === \"orderedmap\") {\n        bObject = new Map((await this._decode(aObject._rvalue, withPromise)));\n      } else if (aObject._rtype === \"set\") {\n        bObject = new Set((await this._decode(aObject._rvalue, withPromise)));\n      } else {\n        // make sure all the interface functions are decoded\n        if (aObject._rintf) {\n          const temp = aObject._rtype;\n          delete aObject._rtype;\n          aObject = await this._decode(aObject, withPromise);\n          aObject._rtype = temp;\n        }\n\n        delete aObject._rintf;\n        bObject = aObject;\n      }\n    } else if (aObject.constructor === Object || Array.isArray(aObject)) {\n      const isarray = Array.isArray(aObject);\n      bObject = isarray ? [] : {};\n\n      for (let k of Object.keys(aObject)) {\n        if (isarray || aObject.hasOwnProperty(k)) {\n          const v = aObject[k];\n          bObject[k] = await this._decode(v, withPromise);\n        }\n      }\n    } else {\n      bObject = aObject;\n    }\n\n    if (bObject === undefined) {\n      throw new Error(\"Failed to decode object\");\n    } // store the object id for dispose\n\n\n    if (aObject._rintf) {\n      this._object_weakmap.set(bObject, aObject._rintf);\n    }\n\n    return bObject;\n  }\n\n  async _wrap(args, asInterface) {\n    return await this._encode(args, asInterface);\n  }\n  /**\n   * Unwraps the set of arguments delivered from the remote site,\n   * replaces all callback identifiers with a function which will\n   * initiate sending that callback identifier back to other site\n   *\n   * @param {Object} args to unwrap\n   *\n   * @param {Boolean} withPromise is true means this the callback should contain a promise\n   *\n   * @returns {Array} unwrapped args\n   */\n\n\n  async _unwrap(args, withPromise) {\n    return await this._decode(args, withPromise);\n  }\n  /**\n   * Generates the wrapped function corresponding to a single remote\n   * callback. When the generated function is called, it will send\n   * the corresponding message to the remote site asking it to\n   * execute the particular callback previously saved during a call\n   * by the remote site a method from the interface of this site\n   *\n   * @param {Number} id of the remote callback to execute\n   * @param {Number} argNum argument index of the callback\n   * @param {Boolean} withPromise is true means this the callback should contain a promise\n   *\n   * @returns {Function} wrapped remote callback\n   */\n\n\n  _genRemoteCallback(targetId, cid, withPromise) {\n    const me = this;\n    let remoteCallback;\n\n    if (withPromise) {\n      remoteCallback = function () {\n        return new Promise(async (resolve, reject) => {\n          const args = await me._wrap(Array.prototype.slice.call(arguments));\n          const transferables = args.__transferables__;\n          if (transferables) delete args.__transferables__;\n          const encodedPromise = await me._wrap([resolve, reject]); // store the key id for removing them from the reference store together\n\n          resolve.__promise_pair = encodedPromise[1]._rvalue;\n          reject.__promise_pair = encodedPromise[0]._rvalue;\n\n          try {\n            me._connection.emit({\n              type: \"callback\",\n              target_id: targetId,\n              id: cid,\n              args: args,\n              promise: encodedPromise\n            }, transferables);\n          } catch (e) {\n            reject(`Failed to exectue remote callback ( id: ${cid}).`);\n          }\n        });\n      };\n\n      return remoteCallback;\n    } else {\n      remoteCallback = async function () {\n        const args = await me._wrap(Array.prototype.slice.call(arguments));\n        const transferables = args.__transferables__;\n        if (transferables) delete args.__transferables__;\n        return me._connection.emit({\n          type: \"callback\",\n          target_id: targetId,\n          id: cid,\n          args: args\n        }, transferables);\n      };\n\n      return remoteCallback;\n    }\n  }\n  /**\n   * Sends the notification message and breaks the connection\n   */\n\n\n  disconnect() {\n    this._connection.emit({\n      type: \"disconnect\"\n    });\n\n    setTimeout(() => {\n      this._connection.disconnect();\n    }, 2000);\n  }\n\n}\n/**\n * ReferenceStore is a special object which stores other objects\n * and provides the references (number) instead. This reference\n * may then be sent over a json-based communication channel (IPC\n * to another Node.js process or a message to the Worker). Other\n * site may then provide the reference in the responce message\n * implying the given object should be activated.\n *\n * Primary usage for the ReferenceStore is a storage for the\n * callbacks, which therefore makes it possible to initiate a\n * callback execution by the opposite site (which normally cannot\n * directly execute functions over the communication channel).\n *\n * Each stored object can only be fetched once and is not\n * available for the second time. Each stored object must be\n * fetched, since otherwise it will remain stored forever and\n * consume memory.\n *\n * Stored object indeces are simply the numbers, which are however\n * released along with the objects, and are later reused again (in\n * order to postpone the overflow, which should not likely happen,\n * but anyway).\n */\n\nclass ReferenceStore {\n  constructor() {\n    this._store = {}; // stored object\n\n    this._indices = [0]; // smallest available indices\n\n    this._readyHandler = function () {};\n\n    this._busyHandler = function () {};\n\n    this._readyHandler();\n  }\n  /**\n   * call handler when the store is empty\n   *\n   * @param {FUNCTION} id of a handler\n   */\n\n\n  onReady(readyHandler) {\n    this._readyHandler = readyHandler || function () {};\n  }\n  /**\n   * call handler when the store is not empty\n   *\n   * @param {FUNCTION} id of a handler\n   */\n\n\n  onBusy(busyHandler) {\n    this._busyHandler = busyHandler || function () {};\n  }\n  /**\n   * get the length of the store\n   *\n   */\n\n\n  getStack() {\n    return Object.keys(this._store).length;\n  }\n  /**\n   * @function _genId() generates the new reference id\n   *\n   * @returns {Number} smallest available id and reserves it\n   */\n\n\n  _genId() {\n    let id;\n\n    if (this._indices.length === 1) {\n      id = this._indices[0]++;\n    } else {\n      id = this._indices.shift();\n    }\n\n    return id;\n  }\n  /**\n   * Releases the given reference id so that it will be available by\n   * another object stored\n   *\n   * @param {Number} id to release\n   */\n\n\n  _releaseId(id) {\n    for (let i = 0; i < this._indices.length; i++) {\n      if (id < this._indices[i]) {\n        this._indices.splice(i, 0, id);\n\n        break;\n      }\n    } // cleaning-up the sequence tail\n\n\n    for (let i = this._indices.length - 1; i >= 0; i--) {\n      if (this._indices[i] - 1 === this._indices[i - 1]) {\n        this._indices.pop();\n      } else {\n        break;\n      }\n    }\n  }\n  /**\n   * Stores the given object and returns the refernce id instead\n   *\n   * @param {Object} obj to store\n   *\n   * @returns {Number} reference id of the stored object\n   */\n\n\n  put(obj) {\n    if (this._busyHandler && Object.keys(this._store).length === 0) {\n      this._busyHandler();\n    }\n\n    const id = this._genId();\n\n    this._store[id] = obj;\n    return id;\n  }\n  /**\n   * Retrieves previously stored object and releases its reference\n   *\n   * @param {Number} id of an object to retrieve\n   */\n\n\n  fetch(id) {\n    const obj = this._store[id];\n\n    if (obj && !obj.__remote_method) {\n      delete this._store[id];\n\n      this._releaseId(id);\n\n      if (this._readyHandler && Object.keys(this._store).length === 0) {\n        this._readyHandler();\n      }\n    }\n\n    if (obj && obj.__promise_pair) {\n      this.fetch(obj.__promise_pair);\n    }\n\n    return obj;\n  }\n\n}\n\n/***/ }),\n\n/***/ \"./src/utils.js\":\n/*!**********************!*\\\n  !*** ./src/utils.js ***!\n  \\**********************/\n/*! exports provided: randId, dtypeToTypedArray, typedArrayToDtype, cacheRequirements, setupServiceWorker, urlJoin, MessageEmitter */\n/***/ (function(module, __webpack_exports__, __webpack_require__) {\n\n\"use strict\";\n__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"randId\", function() { return randId; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"dtypeToTypedArray\", function() { return dtypeToTypedArray; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"typedArrayToDtype\", function() { return typedArrayToDtype; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"cacheRequirements\", function() { return cacheRequirements; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"setupServiceWorker\", function() { return setupServiceWorker; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"urlJoin\", function() { return urlJoin; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"MessageEmitter\", function() { return MessageEmitter; });\nfunction randId() {\n  return Math.random().toString(36).substr(2, 10) + new Date().getTime();\n}\nconst dtypeToTypedArray = {\n  int8: \"Int8Array\",\n  int16: \"Int16Array\",\n  int32: \"Int32Array\",\n  uint8: \"Uint8Array\",\n  uint16: \"Uint16Array\",\n  uint32: \"Uint32Array\",\n  float32: \"Float32Array\",\n  float64: \"Float64Array\",\n  array: \"Array\"\n};\nconst typedArrayToDtype = {\n  Int8Array: \"int8\",\n  Int16Array: \"int16\",\n  Int32Array: \"int32\",\n  Uint8Array: \"uint8\",\n  Uint16Array: \"uint16\",\n  Uint32Array: \"uint32\",\n  Float32Array: \"float32\",\n  Float64Array: \"float64\",\n  Array: \"array\"\n};\n\nfunction cacheUrlInServiceWorker(url) {\n  return new Promise(function (resolve, reject) {\n    const message = {\n      command: \"add\",\n      url: url\n    };\n\n    if (!navigator.serviceWorker || !navigator.serviceWorker.register) {\n      reject(\"Service worker is not supported.\");\n      return;\n    }\n\n    const messageChannel = new MessageChannel();\n\n    messageChannel.port1.onmessage = function (event) {\n      if (event.data && event.data.error) {\n        reject(event.data.error);\n      } else {\n        resolve(event.data && event.data.result);\n      }\n    };\n\n    if (navigator.serviceWorker && navigator.serviceWorker.controller) {\n      navigator.serviceWorker.controller.postMessage(message, [messageChannel.port2]);\n    } else {\n      reject(\"Service worker controller is not available\");\n    }\n  });\n}\n\nasync function cacheRequirements(requirements) {\n  if (!Array.isArray(requirements)) {\n    requirementsm.code.requirements = [requirements];\n  }\n\n  if (requirements && requirements.length > 0) {\n    for (let req of requirements) {\n      //remove prefix\n      if (req.startsWith(\"js:\")) req = req.slice(3);\n      if (req.startsWith(\"css:\")) req = req.slice(4);\n      if (req.startsWith(\"cache:\")) req = req.slice(6);\n      if (!req.startsWith(\"http\")) continue;\n      await cacheUrlInServiceWorker(req).catch(e => {\n        console.error(e);\n      });\n    }\n  }\n}\nfunction setupServiceWorker(baseUrl, targetOrigin, cacheCallback) {\n  // register service worker for offline access\n  if (\"serviceWorker\" in navigator) {\n    baseUrl = baseUrl || \"/\";\n    navigator.serviceWorker.register(baseUrl + \"plugin-service-worker.js\").then(function (registration) {\n      // Registration was successful\n      console.log(\"ServiceWorker registration successful with scope: \", registration.scope);\n    }, function (err) {\n      // registration failed :(\n      console.log(\"ServiceWorker registration failed: \", err);\n    });\n    targetOrigin = targetOrigin || \"*\";\n    cacheCallback = cacheCallback || cacheRequirements;\n\n    if (cacheCallback && typeof cacheCallback !== \"function\") {\n      throw new Error(\"config.cache_requirements must be a function\");\n    }\n\n    window.addEventListener(\"message\", function (e) {\n      if (targetOrigin === \"*\" || e.origin === targetOrigin) {\n        const m = e.data;\n\n        if (m.type === \"cacheRequirements\") {\n          cacheCallback(m.requirements);\n        }\n      }\n    });\n  }\n} //#Source https://bit.ly/2neWfJ2\n\nfunction urlJoin(...args) {\n  return args.join(\"/\").replace(/[\\/]+/g, \"/\").replace(/^(.+):\\//, \"$1://\").replace(/^file:/, \"file:/\").replace(/\\/(\\?|&|#[^!])/g, \"$1\").replace(/\\?/g, \"&\").replace(\"&\", \"?\");\n}\nclass MessageEmitter {\n  constructor(debug) {\n    this._event_handlers = {};\n    this._once_handlers = {};\n    this._debug = debug;\n  }\n\n  emit() {\n    throw new Error(\"emit is not implemented\");\n  }\n\n  on(event, handler) {\n    if (!this._event_handlers[event]) {\n      this._event_handlers[event] = [];\n    }\n\n    this._event_handlers[event].push(handler);\n  }\n\n  once(event, handler) {\n    handler.___event_run_once = true;\n    this.on(event, handler);\n  }\n\n  off(event, handler) {\n    if (!event && !handler) {\n      // remove all events handlers\n      this._event_handlers = {};\n    } else if (event && !handler) {\n      // remove all hanlders for the event\n      if (this._event_handlers[event]) this._event_handlers[event] = [];\n    } else {\n      // remove a specific handler\n      if (this._event_handlers[event]) {\n        const idx = this._event_handlers[event].indexOf(handler);\n\n        if (idx >= 0) {\n          this._event_handlers[event].splice(idx, 1);\n        }\n      }\n    }\n  }\n\n  _fire(event, data) {\n    if (this._event_handlers[event]) {\n      var i = this._event_handlers[event].length;\n\n      while (i--) {\n        const handler = this._event_handlers[event][i];\n\n        try {\n          handler(data);\n        } catch (e) {\n          console.error(e);\n        } finally {\n          if (handler.___event_run_once) {\n            this._event_handlers[event].splice(i, 1);\n          }\n        }\n      }\n    } else {\n      if (this._debug) {\n        console.warn(\"unhandled event\", event, data);\n      }\n    }\n  }\n\n}\n\n/***/ })\n\n/******/ });\n//# sourceMappingURL=plugin.webworker.js.map", null);
};

/***/ }),

/***/ "./src/pluginCore.js":
/*!***************************!*\
  !*** ./src/pluginCore.js ***!
  \***************************/
/*! exports provided: connectRPC */
/***/ (function(module, __webpack_exports__, __webpack_require__) {
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

    if (api.export) {
      throw new Error("`export` is a reserved function name");
    }

    if (api.onload) {
      throw new Error("`onload` is a reserved function name");
    }

    if (api.dispose) {
      throw new Error("`dispose` is a reserved function name");
    }

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

/***/ "./src/pluginIframe.js":
/*!*****************************!*\
  !*** ./src/pluginIframe.js ***!
  \*****************************/
/*! exports provided: Connection, default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Connection", function() { return Connection; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return setupIframe; });
/* harmony import */ var _pluginCore_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./pluginCore.js */ "./src/pluginCore.js");
/* harmony import */ var _rpc_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./rpc.js */ "./src/rpc.js");
/* harmony import */ var _utils_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./utils.js */ "./src/utils.js");
/**
 * Contains the routines loaded by the plugin iframe under web-browser
 * in case when worker failed to initialize
 *
 * Initializes the web environment version of the platform-dependent
 * connection object for the plugin site
 */


 // Create a new, plain <span> element

function _htmlToElement(html) {
  var template = document.createElement("template");
  html = html.trim(); // Never return a text node of whitespace as the result

  template.innerHTML = html;
  return template.content.firstChild;
}

var _importScript = function (url) {
  //url is URL of external file, implementationCode is the code
  //to be called from the file, location is the location to
  //insert the <script> element
  return new Promise((resolve, reject) => {
    var scriptTag = document.createElement("script");
    scriptTag.src = url;
    scriptTag.type = "text/javascript";
    scriptTag.onload = resolve;

    scriptTag.onreadystatechange = function () {
      if (this.readyState === "loaded" || this.readyState === "complete") {
        resolve();
      }
    };

    scriptTag.onerror = reject;
    document.head.appendChild(scriptTag);
  });
}; // support importScripts outside web worker


async function importScripts() {
  var args = Array.prototype.slice.call(arguments),
      len = args.length,
      i = 0;

  for (; i < len; i++) {
    await _importScript(args[i]);
  }
}

class Connection extends _utils_js__WEBPACK_IMPORTED_MODULE_2__["MessageEmitter"] {
  constructor(config) {
    super(config && config.debug);
    this.config = config || {};
    this.peer_id = Object(_utils_js__WEBPACK_IMPORTED_MODULE_2__["randId"])();
  }

  connect() {
    this.config.target_origin = this.config.target_origin || "*"; // this will call handleEvent function

    window.addEventListener("message", this);
    this.emit({
      type: "initialized",
      config: this.config,
      origin: window.location.origin,
      peer_id: this.peer_id
    });

    this._fire("connected");
  }

  handleEvent(e) {
    if (e.type === "message" && (this.config.target_origin === "*" || e.origin === this.config.target_origin)) {
      if (e.data.peer_id === this.peer_id) {
        this._fire(e.data.type, e.data);
      } else if (this.config.debug) {
        console.log(`connection peer id mismatch ${e.data.peer_id} !== ${this.peer_id}`);
      }
    }
  }

  disconnect() {
    this._fire("beforeDisconnect");

    window.removeEventListener("message", this);

    this._fire("disconnected");
  }

  emit(data) {
    let transferables;

    if (data.__transferables__) {
      transferables = data.__transferables__;
      delete data.__transferables__;
    }

    parent.postMessage(data, this.config.target_origin, transferables);
  }

  async execute(code) {
    try {
      if (code.type === "requirements") {
        if (code.requirements && (Array.isArray(code.requirements) || typeof code.requirements === "string")) {
          try {
            var link_node;
            code.requirements = typeof code.requirements === "string" ? [code.requirements] : code.requirements;

            if (Array.isArray(code.requirements)) {
              for (var i = 0; i < code.requirements.length; i++) {
                if (code.requirements[i].toLowerCase().endsWith(".css") || code.requirements[i].startsWith("css:")) {
                  if (code.requirements[i].startsWith("css:")) {
                    code.requirements[i] = code.requirements[i].slice(4);
                  }

                  link_node = document.createElement("link");
                  link_node.rel = "stylesheet";
                  link_node.href = code.requirements[i];
                  document.head.appendChild(link_node);
                } else if (code.requirements[i].toLowerCase().endsWith(".js") || code.requirements[i].startsWith("js:")) {
                  if (code.requirements[i].startsWith("js:")) {
                    code.requirements[i] = code.requirements[i].slice(3);
                  }

                  await importScripts(code.requirements[i]);
                } else if (code.requirements[i].startsWith("http")) {
                  await importScripts(code.requirements[i]);
                } else if (code.requirements[i].startsWith("cache:")) {//ignore cache
                } else {
                  console.log("Unprocessed requirements url: " + code.requirements[i]);
                }
              }
            } else {
              throw "unsupported requirements definition";
            }
          } catch (e) {
            throw "failed to import required scripts: " + code.requirements.toString();
          }
        }
      } else if (code.type === "script") {
        if (code.src) {
          var script_node = document.createElement("script");
          script_node.setAttribute("type", code.attrs.type);
          script_node.setAttribute("src", code.src);
          document.head.appendChild(script_node);
        } else {
          if (code.content && (!code.attrs.type || code.attrs.type === "text/javascript")) {
            // document.addEventListener("DOMContentLoaded", function(){
            eval(code.content); // });
          } else {
            var node = document.createElement("script");
            node.setAttribute("type", code.attrs.type);
            node.appendChild(document.createTextNode(code.content));
            document.body.appendChild(node);
          }
        }
      } else if (code.type === "style") {
        const style_node = document.createElement("style");

        if (code.src) {
          style_node.src = code.src;
        }

        style_node.innerHTML = code.content;
        document.head.appendChild(style_node);
      } else if (code.type === "link") {
        const link_node_ = document.createElement("link");

        if (code.rel) {
          link_node_.rel = code.rel;
        }

        if (code.href) {
          link_node_.href = code.href;
        }

        if (code.attrs && code.attrs.type) {
          link_node_.type = code.attrs.type;
        }

        document.head.appendChild(link_node_);
      } else if (code.type === "html") {
        document.body.appendChild(_htmlToElement(code.content));
      } else {
        throw "unsupported code type.";
      }

      parent.postMessage({
        type: "executed"
      }, this.config.target_origin);
    } catch (e) {
      console.error("failed to execute scripts: ", code, e);
      parent.postMessage({
        type: "executed",
        error: e.stack || String(e)
      }, this.config.target_origin);
    }
  }

}
function setupIframe(config) {
  config = config || {};
  config.dedicated_thread = false;
  config.lang = "javascript";
  config.api_version = _rpc_js__WEBPACK_IMPORTED_MODULE_1__["API_VERSION"];
  const conn = new Connection(config);
  Object(_pluginCore_js__WEBPACK_IMPORTED_MODULE_0__["connectRPC"])(conn, config);
  conn.connect();
}

/***/ }),

/***/ "./src/pluginWebPython.js":
/*!********************************!*\
  !*** ./src/pluginWebPython.js ***!
  \********************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return setupWebPython; });
/* harmony import */ var _pluginCore_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./pluginCore.js */ "./src/pluginCore.js");
/* harmony import */ var _rpc_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./rpc.js */ "./src/rpc.js");
/* harmony import */ var _pluginIframe__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./pluginIframe */ "./src/pluginIframe.js");
/**
 * Contains the routines loaded by the plugin iframe under web-browser
 * in case when worker failed to initialize
 *
 * Initializes the web environment version of the platform-dependent
 * connection object for the plugin site
 */


 // Create a new, plain <span> element

function _htmlToElement(html) {
  var template = document.createElement("template");
  html = html.trim(); // Never return a text node of whitespace as the result

  template.innerHTML = html;
  return template.content.firstChild;
}

const _importScript = function (url) {
  //url is URL of external file, implementationCode is the code
  //to be called from the file, location is the location to
  //insert the <script> element
  return new Promise((resolve, reject) => {
    var scriptTag = document.createElement("script");
    scriptTag.src = url;
    scriptTag.onload = resolve;

    scriptTag.onreadystatechange = function () {
      if (this.readyState === "loaded" || this.readyState === "complete") {
        resolve();
      }
    };

    scriptTag.onerror = reject;
    document.head.appendChild(scriptTag);
  });
}; // support importScripts outside web worker


async function importScripts() {
  var args = Array.prototype.slice.call(arguments),
      len = args.length,
      i = 0;

  for (; i < len; i++) {
    await _importScript(args[i]);
  }
}

const startup_script = `
from js import api
import sys
from types import ModuleType
m = ModuleType("imjoy")
sys.modules[m.__name__] = m
m.__file__ = m.__name__ + ".py"
m.api = api
`;
let _export_plugin_api = null;

const execute_python_code = function (code) {
  try {
    if (!_export_plugin_api) {
      _export_plugin_api = window.api.export;

      window.api.export = function (p) {
        if (typeof p === "object") {
          const _api = {};

          for (let k in p) {
            if (!k.startsWith("_")) {
              _api[k] = p[k];
            }
          }

          _export_plugin_api(_api);
        } else if (typeof p === "function") {
          const _api = {};
          const getattr = window.pyodide.pyimport("getattr");
          const hasattr = window.pyodide.pyimport("hasattr");

          for (let k of Object.getOwnPropertyNames(p)) {
            if (!k.startsWith("_") && hasattr(p, k)) {
              const func = getattr(p, k);

              _api[k] = function () {
                return func(...Array.prototype.slice.call(arguments));
              };
            }
          }

          _export_plugin_api(_api);
        } else {
          throw "unsupported api export";
        }
      };
    }

    window.pyodide.runPython(startup_script);
    window.pyodide.runPython(code.content);
  } catch (e) {
    throw e;
  }
};

function setupPyodide() {
  return new Promise((resolve, reject) => {
    window.languagePluginUrl = "https://static.imjoy.io/pyodide/";
    importScripts("https://static.imjoy.io/pyodide/pyodide.js").then(() => {
      // hack for matplotlib etc.
      window.iodide = {
        output: {
          element: function element(type) {
            const div = document.createElement(type);
            const output = document.getElementById("output") || document.body;
            output.appendChild(div);
            return div;
          }
        }
      };
      window.languagePluginLoader.then(() => {
        // pyodide is now ready to use...
        console.log(window.pyodide.runPython("import sys\nsys.version"));
        resolve();
      }).catch(reject);
    });
  });
} // connection object for the RPC constructor


class Connection extends _pluginIframe__WEBPACK_IMPORTED_MODULE_2__["Connection"] {
  constructor(config) {
    super(config);
  }

  async execute(code) {
    if (code.type === "requirements") {
      if (code.requirements) {
        code.requirements = typeof code.requirements === "string" ? [code.requirements] : code.requirements;

        if (Array.isArray(code.requirements)) {
          const python_packages = [];

          for (var i = 0; i < code.requirements.length; i++) {
            if (code.requirements[i].toLowerCase().endsWith(".css") || code.requirements[i].startsWith("css:")) {
              if (code.requirements[i].startsWith("css:")) {
                code.requirements[i] = code.requirements[i].slice(4);
              }

              link_node = document.createElement("link");
              link_node.rel = "stylesheet";
              link_node.href = code.requirements[i];
              document.head.appendChild(link_node);
            } else if ( // code.requirements[i].toLowerCase().endsWith(".js") ||
            code.requirements[i].startsWith("js:")) {
              if (code.requirements[i].startsWith("js:")) {
                code.requirements[i] = code.requirements[i].slice(3);
              }

              await importScripts(code.requirements[i]);
            } else if (code.requirements[i].startsWith("cache:")) ; else if (code.requirements[i].toLowerCase().endsWith(".js") || code.requirements[i].startsWith("package:")) {
              if (code.requirements[i].startsWith("package:")) {
                code.requirements[i] = code.requirements[i].slice(8);
              }

              python_packages.push(code.requirements[i]);
            } else if (code.requirements[i].startsWith("http:") || code.requirements[i].startsWith("https:")) {
              console.log("Unprocessed requirements url: " + code.requirements[i]);
            } else {
              python_packages.push(code.requirements[i]);
            }
          }

          await window.pyodide.loadPackage(python_packages);
        } else {
          throw "unsupported requirements definition";
        }
      }
    } else if (code.type === "script") {
      if (code.src) {
        var script_node = document.createElement("script");
        script_node.setAttribute("type", code.attrs.type);
        script_node.setAttribute("src", code.src);
        document.head.appendChild(script_node);
      } else {
        if (code.content && code.lang === "python") {
          execute_python_code(code);
        } else if (code.content && code.lang === "javascript") {
          try {
            eval(code.content);
          } catch (e) {
            console.error(e.message, e.stack);
            throw e;
          }
        } else {
          const node = document.createElement("script");
          node.setAttribute("type", code.attrs.type);
          node.appendChild(document.createTextNode(code.content));
          document.body.appendChild(node);
        }
      }
    } else if (code.type === "style") {
      const style_node = document.createElement("style");

      if (code.src) {
        style_node.src = code.src;
      }

      style_node.innerHTML = code.content;
      document.head.appendChild(style_node);
    } else if (code.type === "link") {
      const link_node = document.createElement("link");

      if (code.rel) {
        link_node.rel = code.rel;
      }

      if (code.href) {
        link_node.href = code.href;
      }

      if (code.attrs && code.attrs.type) {
        link_node.type = code.attrs.type;
      }

      document.head.appendChild(link_node);
    } else if (code.type === "html") {
      document.body.appendChild(_htmlToElement(code.content));
    } else {
      throw "unsupported code type.";
    }
  }

}

function setupWebPython(config) {
  config = config || {};
  config.debug = true;
  config.dedicated_thread = false;
  config.lang = "python";
  config.api_version = _rpc_js__WEBPACK_IMPORTED_MODULE_1__["API_VERSION"];
  const conn = new Connection(config);
  setupPyodide().then(() => {
    Object(_pluginCore_js__WEBPACK_IMPORTED_MODULE_0__["connectRPC"])(conn, config);
    conn.connect();
  });
}

/***/ }),

/***/ "./src/rpc.js":
/*!********************!*\
  !*** ./src/rpc.js ***!
  \********************/
/*! exports provided: API_VERSION, RPC */
/***/ (function(module, __webpack_exports__, __webpack_require__) {
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
      throw new Error(`connection.execute not implemented (in "${name}")`);
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
      throw new Error(`Object (id=${objectId}) not found.`);
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
    const _dtype = _utils_js__WEBPACK_IMPORTED_MODULE_0__["typedArrayToDtype"][typedArray.constructor.name];

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
      this._remote_interface = intf;

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

          if (name === "register" || name === "export" || name === "on") {
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
          reject(`Failed to exectue remote method (interface: ${objectId || me.id}, method: ${name}), error: ${e}`);
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
      const dtype = _utils_js__WEBPACK_IMPORTED_MODULE_0__["typedArrayToDtype"][aObject.selection.data.constructor.name];

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
    else if (aObject !== Object(aObject) || aObject instanceof Boolean || aObject instanceof String || aObject instanceof Date || aObject instanceof RegExp || aObject instanceof ImageData || typeof FileList !== "undefined" && aObject instanceof FileList) {
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

        const dtype = _utils_js__WEBPACK_IMPORTED_MODULE_0__["typedArrayToDtype"][aObject.constructor.name];
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

          const arraytype = eval(_utils_js__WEBPACK_IMPORTED_MODULE_0__["dtypeToTypedArray"][aObject._rdtype]);
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
        const arraytype = eval(_utils_js__WEBPACK_IMPORTED_MODULE_0__["dtypeToTypedArray"][aObject._rdtype]);
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
          aObject = await this._decode(aObject, withPromise);
          aObject._rtype = temp;
        }

        delete aObject._rintf;
        bObject = aObject;
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
            reject(`Failed to exectue remote callback ( id: ${cid}).`);
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
  /**
   * Sends the notification message and breaks the connection
   */


  disconnect() {
    this._connection.emit({
      type: "disconnect"
    });

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
/*!**********************!*\
  !*** ./src/utils.js ***!
  \**********************/
/*! exports provided: randId, dtypeToTypedArray, typedArrayToDtype, cacheRequirements, setupServiceWorker, urlJoin, MessageEmitter */
/***/ (function(module, __webpack_exports__, __webpack_require__) {
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "randId", function() { return randId; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "dtypeToTypedArray", function() { return dtypeToTypedArray; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "typedArrayToDtype", function() { return typedArrayToDtype; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "cacheRequirements", function() { return cacheRequirements; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "setupServiceWorker", function() { return setupServiceWorker; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "urlJoin", function() { return urlJoin; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "MessageEmitter", function() { return MessageEmitter; });
function randId() {
  return Math.random().toString(36).substr(2, 10) + new Date().getTime();
}
const dtypeToTypedArray = {
  int8: "Int8Array",
  int16: "Int16Array",
  int32: "Int32Array",
  uint8: "Uint8Array",
  uint16: "Uint16Array",
  uint32: "Uint32Array",
  float32: "Float32Array",
  float64: "Float64Array",
  array: "Array"
};
const typedArrayToDtype = {
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
  return args.join("/").replace(/[\/]+/g, "/").replace(/^(.+):\//, "$1://").replace(/^file:/, "file:/").replace(/\/(\?|&|#[^!])/g, "$1").replace(/\?/g, "&").replace("&", "?");
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
});

});

var imjoyRpc$1 = imjoyRpc;

export default imjoyRpc$1;
var imjoyRPC = imjoyRpc$1.imjoyRPC;
export { imjoyRpc$1 as __moduleExports, imjoyRPC };
