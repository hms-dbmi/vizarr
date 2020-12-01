import { c as createCommonjsModule } from './common/_commonjsHelpers-37fa8da4.js';
import { a8 as _asyncToGenerator, a9 as regenerator, af as env, a7 as log, ag as register, ah as registerLoaders, _ as _inherits, ad as isWebGL2, z as hasFeatures, F as FEATURES, s as assert$1, b as _possibleConstructorReturn, a as _getPrototypeOf, ai as Resource$1, aj as log$1, ak as instrumentGLContext, al as isWebGL, am as resetParameters, an as resizeGLContext, ao as Framebuffer, ap as lumaStats, aq as createGLContext, ar as mod, as as WebMercatorViewport, aa as Vector3, C as COORDINATE_SYSTEM, P as PROJECTION_MODE, at as memoize, M as Matrix4, au as pixelsToWorld, av as ProgramManager, aw as setParameters, ax as withParameters, ay as clear, az as cssToDeviceRatio, ae as Texture2D, aA as Renderbuffer, k as _get, ac as load, n as debug, l as flatten, L as Layer, aB as LIFECYCLE, S as Stats, j as Viewport, o as assert$2, h as clamp, aC as WebMercatorViewport$1, aD as cssToDevicePixels, aE as readPixelsToArray, aF as EVENTS, y as defaultTypedArrayManager } from './common/layer-6e52c28c.js';
import { p as process } from './common/process-2545f00a.js';
import { _ as _typeof } from './common/typeof-c65245d2.js';
import { _ as _defineProperty } from './common/defineProperty-1b0b77a2.js';
import { _ as _classCallCheck } from './common/classCallCheck-4eda545c.js';
import { _ as _createClass, b as _assertThisInitialized, a as _toConsumableArray } from './common/assertThisInitialized-87ceda02.js';
import './common/_node-resolve:empty-0f7f843d.js';
import { _ as _slicedToArray } from './common/slicedToArray-14e71088.js';
import { p as project } from './common/project-9e8cb528.js';
import { d as deepEqual, L as LinearInterpolator, T as TRANSITION_EVENTS, V as ViewState, C as Controller, a as View } from './common/view-state-54332ffc.js';
import { r as react } from './common/index-aae33e1a.js';
import { p as propTypes$1 } from './common/index-c103191b.js';

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

var globals = {
  self: typeof self !== 'undefined' && self,
  window: typeof window !== 'undefined' && window,
  global: typeof global !== 'undefined' && global,
  document: typeof document !== 'undefined' && document
};
var global_ = globals.global || globals.self || globals.window;
var isBrowser = (typeof process === "undefined" ? "undefined" : _typeof(process)) !== 'object' || String(process) !== '[object process]' || process.browser;
var matches = typeof process !== 'undefined' && process.version && process.version.match(/v([0-9]*)/);
var nodeVersion = matches && parseFloat(matches[1]) || 0;

var _parseImageNode = global_._parseImageNode;
var IMAGE_SUPPORTED = typeof Image !== 'undefined';
var IMAGE_BITMAP_SUPPORTED = typeof ImageBitmap !== 'undefined';
var NODE_IMAGE_SUPPORTED = Boolean(_parseImageNode);
var DATA_SUPPORTED = isBrowser ? true : NODE_IMAGE_SUPPORTED;
function isImageTypeSupported(type) {
  switch (type) {
    case 'auto':
      return IMAGE_BITMAP_SUPPORTED || IMAGE_SUPPORTED || DATA_SUPPORTED;

    case 'imagebitmap':
      return IMAGE_BITMAP_SUPPORTED;

    case 'image':
      return IMAGE_SUPPORTED;

    case 'data':
      return DATA_SUPPORTED;

    case 'html':
      return IMAGE_SUPPORTED;

    case 'ndarray':
      return DATA_SUPPORTED;

    default:
      throw new Error("@loaders.gl/images: image ".concat(type, " not supported in this environment"));
  }
}
function getDefaultImageType() {
  if (IMAGE_BITMAP_SUPPORTED) {
    return 'imagebitmap';
  }

  if (IMAGE_SUPPORTED) {
    return 'image';
  }

  if (DATA_SUPPORTED) {
    return 'data';
  }

  throw new Error("Install '@loaders.gl/polyfills' to parse images under Node.js");
}

function getImageType(image) {
  var format = getImageTypeOrNull(image);

  if (!format) {
    throw new Error('Not an image');
  }

  return format;
}
function getImageData(image) {
  switch (getImageType(image)) {
    case 'data':
      return image;

    case 'image':
    case 'imagebitmap':
      var canvas = document.createElement('canvas');
      var context = canvas.getContext('2d');

      if (context) {
        canvas.width = image.width;
        canvas.height = image.height;
        context.drawImage(image, 0, 0);
        return context.getImageData(0, 0, image.width, image.height);
      }

    default:
      return assert(false);
  }
}

function getImageTypeOrNull(image) {
  if (typeof ImageBitmap !== 'undefined' && image instanceof ImageBitmap) {
    return 'imagebitmap';
  }

  if (typeof Image !== 'undefined' && image instanceof Image) {
    return 'image';
  }

  if (image && _typeof(image) === 'object' && image.data && image.width && image.height) {
    return 'data';
  }

  return null;
}

var SVG_DATA_URL_PATTERN = /^data:image\/svg\+xml/;
var SVG_URL_PATTERN = /\.svg((\?|#).*)?$/;
function isSVG(url) {
  return url && (SVG_DATA_URL_PATTERN.test(url) || SVG_URL_PATTERN.test(url));
}
function getBlobOrSVGDataUrl(arrayBuffer, url) {
  if (isSVG(url)) {
    var textDecoder = new TextDecoder();
    var xmlText = textDecoder.decode(arrayBuffer);
    var src = "data:image/svg+xml;base64,".concat(btoa(xmlText));
    return src;
  }

  return getBlob(arrayBuffer, url);
}
function getBlob(arrayBuffer, url) {
  if (isSVG(url)) {
    throw new Error('SVG cannot be parsed directly to imagebitmap');
  }

  return new Blob([new Uint8Array(arrayBuffer)]);
}

function parseToImage(_x, _x2, _x3) {
  return _parseToImage.apply(this, arguments);
}

function _parseToImage() {
  _parseToImage = _asyncToGenerator(regenerator.mark(function _callee(arrayBuffer, options, url) {
    var blobOrDataUrl, URL, objectUrl;
    return regenerator.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            blobOrDataUrl = getBlobOrSVGDataUrl(arrayBuffer, url);
            URL = self.URL || self.webkitURL;
            objectUrl = typeof blobOrDataUrl !== 'string' && URL.createObjectURL(blobOrDataUrl);
            _context.prev = 3;
            _context.next = 6;
            return loadToImage(objectUrl || blobOrDataUrl, options);

          case 6:
            return _context.abrupt("return", _context.sent);

          case 7:
            _context.prev = 7;

            if (objectUrl) {
              URL.revokeObjectURL(objectUrl);
            }

            return _context.finish(7);

          case 10:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, null, [[3,, 7, 10]]);
  }));
  return _parseToImage.apply(this, arguments);
}

function loadToImage(_x4, _x5) {
  return _loadToImage.apply(this, arguments);
}

function _loadToImage() {
  _loadToImage = _asyncToGenerator(regenerator.mark(function _callee2(url, options) {
    var image;
    return regenerator.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            image = new Image();
            image.src = url;

            if (!(options.image && options.image.decode && image.decode)) {
              _context2.next = 6;
              break;
            }

            _context2.next = 5;
            return image.decode();

          case 5:
            return _context2.abrupt("return", image);

          case 6:
            _context2.next = 8;
            return new Promise(function (resolve, reject) {
              try {
                image.onload = function () {
                  return resolve(image);
                };

                image.onerror = function (err) {
                  return reject(new Error("Could not load image ".concat(url, ": ").concat(err)));
                };
              } catch (error) {
                reject(error);
              }
            });

          case 8:
            return _context2.abrupt("return", _context2.sent);

          case 9:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  }));
  return _loadToImage.apply(this, arguments);
}

var EMPTY_OBJECT = {};
var imagebitmapOptionsSupported = true;
function parseToImageBitmap(_x, _x2, _x3) {
  return _parseToImageBitmap.apply(this, arguments);
}

function _parseToImageBitmap() {
  _parseToImageBitmap = _asyncToGenerator(regenerator.mark(function _callee(arrayBuffer, options, url) {
    var blob, image, imagebitmapOptions;
    return regenerator.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            if (!isSVG(url)) {
              _context.next = 7;
              break;
            }

            _context.next = 3;
            return parseToImage(arrayBuffer, options, url);

          case 3:
            image = _context.sent;
            blob = image;
            _context.next = 8;
            break;

          case 7:
            blob = getBlob(arrayBuffer, url);

          case 8:
            imagebitmapOptions = options && options.imagebitmap;
            _context.next = 11;
            return safeCreateImageBitmap(blob, imagebitmapOptions);

          case 11:
            return _context.abrupt("return", _context.sent);

          case 12:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));
  return _parseToImageBitmap.apply(this, arguments);
}

function safeCreateImageBitmap(_x4) {
  return _safeCreateImageBitmap.apply(this, arguments);
}

function _safeCreateImageBitmap() {
  _safeCreateImageBitmap = _asyncToGenerator(regenerator.mark(function _callee2(blob) {
    var imagebitmapOptions,
        _args2 = arguments;
    return regenerator.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            imagebitmapOptions = _args2.length > 1 && _args2[1] !== undefined ? _args2[1] : null;

            if (isEmptyObject(imagebitmapOptions) || !imagebitmapOptionsSupported) {
              imagebitmapOptions = null;
            }

            if (!imagebitmapOptions) {
              _context2.next = 13;
              break;
            }

            _context2.prev = 3;
            _context2.next = 6;
            return createImageBitmap(blob, imagebitmapOptions);

          case 6:
            return _context2.abrupt("return", _context2.sent);

          case 9:
            _context2.prev = 9;
            _context2.t0 = _context2["catch"](3);
            console.warn(_context2.t0);
            imagebitmapOptionsSupported = false;

          case 13:
            _context2.next = 15;
            return createImageBitmap(blob);

          case 15:
            return _context2.abrupt("return", _context2.sent);

          case 16:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, null, [[3, 9]]);
  }));
  return _safeCreateImageBitmap.apply(this, arguments);
}

function isEmptyObject(object) {
  for (var key in object || EMPTY_OBJECT) {
    return false;
  }

  return true;
}

var BIG_ENDIAN = false;
var LITTLE_ENDIAN = true;
function getBinaryImageMetadata(binaryData) {
  var dataView = toDataView(binaryData);
  return getPngMetadata(dataView) || getJpegMetadata(dataView) || getGifMetadata(dataView) || getBmpMetadata(dataView);
}

function getPngMetadata(binaryData) {
  var dataView = toDataView(binaryData);
  var isPng = dataView.byteLength >= 24 && dataView.getUint32(0, BIG_ENDIAN) === 0x89504e47;

  if (!isPng) {
    return null;
  }

  return {
    mimeType: 'image/png',
    width: dataView.getUint32(16, BIG_ENDIAN),
    height: dataView.getUint32(20, BIG_ENDIAN)
  };
}

function getGifMetadata(binaryData) {
  var dataView = toDataView(binaryData);
  var isGif = dataView.byteLength >= 10 && dataView.getUint32(0, BIG_ENDIAN) === 0x47494638;

  if (!isGif) {
    return null;
  }

  return {
    mimeType: 'image/gif',
    width: dataView.getUint16(6, LITTLE_ENDIAN),
    height: dataView.getUint16(8, LITTLE_ENDIAN)
  };
}

function getBmpMetadata(binaryData) {
  var dataView = toDataView(binaryData);
  var isBmp = dataView.byteLength >= 14 && dataView.getUint16(0, BIG_ENDIAN) === 0x424d && dataView.getUint32(2, LITTLE_ENDIAN) === dataView.byteLength;

  if (!isBmp) {
    return null;
  }

  return {
    mimeType: 'image/bmp',
    width: dataView.getUint32(18, LITTLE_ENDIAN),
    height: dataView.getUint32(22, LITTLE_ENDIAN)
  };
}

function getJpegMetadata(binaryData) {
  var dataView = toDataView(binaryData);
  var isJpeg = dataView.byteLength >= 3 && dataView.getUint16(0, BIG_ENDIAN) === 0xffd8 && dataView.getUint8(2) === 0xff;

  if (!isJpeg) {
    return null;
  }

  var _getJpegMarkers = getJpegMarkers(),
      tableMarkers = _getJpegMarkers.tableMarkers,
      sofMarkers = _getJpegMarkers.sofMarkers;

  var i = 2;

  while (i + 9 < dataView.byteLength) {
    var marker = dataView.getUint16(i, BIG_ENDIAN);

    if (sofMarkers.has(marker)) {
      return {
        mimeType: 'image/jpeg',
        height: dataView.getUint16(i + 5, BIG_ENDIAN),
        width: dataView.getUint16(i + 7, BIG_ENDIAN)
      };
    }

    if (!tableMarkers.has(marker)) {
      return null;
    }

    i += 2;
    i += dataView.getUint16(i, BIG_ENDIAN);
  }

  return null;
}

function getJpegMarkers() {
  var tableMarkers = new Set([0xffdb, 0xffc4, 0xffcc, 0xffdd, 0xfffe]);

  for (var i = 0xffe0; i < 0xfff0; ++i) {
    tableMarkers.add(i);
  }

  var sofMarkers = new Set([0xffc0, 0xffc1, 0xffc2, 0xffc3, 0xffc5, 0xffc6, 0xffc7, 0xffc9, 0xffca, 0xffcb, 0xffcd, 0xffce, 0xffcf, 0xffde]);
  return {
    tableMarkers: tableMarkers,
    sofMarkers: sofMarkers
  };
}

function toDataView(data) {
  if (data instanceof DataView) {
    return data;
  }

  if (ArrayBuffer.isView(data)) {
    return new DataView(data.buffer);
  }

  if (data instanceof ArrayBuffer) {
    return new DataView(data);
  }

  throw new Error('toDataView');
}

function parseToNodeImage(arrayBuffer, options) {
  var _ref = getBinaryImageMetadata(arrayBuffer) || {},
      mimeType = _ref.mimeType;

  var _parseImageNode = global_._parseImageNode;
  assert(_parseImageNode);
  return _parseImageNode(arrayBuffer, mimeType, options);
}

function parseImage(_x, _x2, _x3) {
  return _parseImage.apply(this, arguments);
}

function _parseImage() {
  _parseImage = _asyncToGenerator(regenerator.mark(function _callee(arrayBuffer, options, context) {
    var imageOptions, imageType, _ref, url, loadType, image;

    return regenerator.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            options = options || {};
            imageOptions = options.image || {};
            imageType = imageOptions.type || 'auto';
            _ref = context || {}, url = _ref.url;
            loadType = getLoadableImageType(imageType);
            _context.t0 = loadType;
            _context.next = _context.t0 === 'imagebitmap' ? 8 : _context.t0 === 'image' ? 12 : _context.t0 === 'data' ? 16 : 20;
            break;

          case 8:
            _context.next = 10;
            return parseToImageBitmap(arrayBuffer, options, url);

          case 10:
            image = _context.sent;
            return _context.abrupt("break", 21);

          case 12:
            _context.next = 14;
            return parseToImage(arrayBuffer, options, url);

          case 14:
            image = _context.sent;
            return _context.abrupt("break", 21);

          case 16:
            _context.next = 18;
            return parseToNodeImage(arrayBuffer, options);

          case 18:
            image = _context.sent;
            return _context.abrupt("break", 21);

          case 20:
            assert(false);

          case 21:
            if (imageType === 'data') {
              image = getImageData(image);
            }

            return _context.abrupt("return", image);

          case 23:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));
  return _parseImage.apply(this, arguments);
}

function getLoadableImageType(type) {
  switch (type) {
    case 'auto':
    case 'data':
      return getDefaultImageType();

    default:
      isImageTypeSupported(type);
      return type;
  }
}

var VERSION =  "2.3.6" ;
var EXTENSIONS = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp', 'ico', 'svg'];
var MIME_TYPES = ['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'image/bmp', 'image/vnd.microsoft.icon', 'image/svg+xml'];
var ImageLoader = {
  id: 'image',
  name: 'Images',
  version: VERSION,
  mimeTypes: MIME_TYPES,
  extensions: EXTENSIONS,
  parse: parseImage,
  tests: [function (arrayBuffer) {
    return Boolean(getBinaryImageMetadata(new DataView(arrayBuffer)));
  }],
  options: {
    image: {
      type: 'auto',
      decode: true
    }
  }
};

function isJSON(text) {
  var firstChar = text[0];
  var lastChar = text[text.length - 1];
  return firstChar === '{' && lastChar === '}' || firstChar === '[' && lastChar === ']';
}

var jsonLoader = {
  name: 'JSON',
  extensions: ['json', 'geojson'],
  mimeTypes: ['application/json', 'application/geo+json'],
  testText: isJSON,
  parseTextSync: JSON.parse
};

var version =  "8.3.10" ;
var existingVersion = env.global.deck && env.global.deck.VERSION;

if (existingVersion && existingVersion !== version) {
  throw new Error("deck.gl - multiple versions detected: ".concat(existingVersion, " vs ").concat(version));
}

if (!existingVersion) {

  env.global.deck = Object.assign(env.global.deck || {}, {
    VERSION: version,
    version: version,
    log: log,
    _registerLoggers: register
  });
  registerLoaders([jsonLoader, [ImageLoader, {
    imagebitmap: {
      premultiplyAlpha: 'none'
    }
  }]]);
}

var deckGlobal = env.global.deck;

function requestAnimationFrame$1(callback) {
  return typeof window !== 'undefined' && window.requestAnimationFrame ? window.requestAnimationFrame(callback) : setTimeout(callback, 1000 / 60);
}
function cancelAnimationFrame(timerId) {
  return typeof window !== 'undefined' && window.cancelAnimationFrame ? window.cancelAnimationFrame(timerId) : clearTimeout(timerId);
}

var GL_QUERY_RESULT = 0x8866;
var GL_QUERY_RESULT_AVAILABLE = 0x8867;
var GL_TIME_ELAPSED_EXT = 0x88bf;
var GL_GPU_DISJOINT_EXT = 0x8fbb;
var GL_TRANSFORM_FEEDBACK_PRIMITIVES_WRITTEN = 0x8c88;
var GL_ANY_SAMPLES_PASSED = 0x8c2f;
var GL_ANY_SAMPLES_PASSED_CONSERVATIVE = 0x8d6a;

var Query = function (_Resource) {
  _inherits(Query, _Resource);

  _createClass(Query, null, [{
    key: "isSupported",
    value: function isSupported(gl) {
      var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
      var webgl2 = isWebGL2(gl);
      var hasTimerQuery = hasFeatures(gl, FEATURES.TIMER_QUERY);
      var supported = webgl2 || hasTimerQuery;
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = opts[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var key = _step.value;

          switch (key) {
            case 'queries':
              supported = supported && webgl2;
              break;

            case 'timers':
              supported = supported && hasTimerQuery;
              break;

            default:
              assert$1(false);
          }
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator["return"] != null) {
            _iterator["return"]();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      return supported;
    }
  }]);

  function Query(gl) {
    var _this;

    var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    _classCallCheck(this, Query);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(Query).call(this, gl, opts));
    _this.target = null;
    _this._queryPending = false;
    _this._pollingPromise = null;
    Object.seal(_assertThisInitialized(_this));
    return _this;
  }

  _createClass(Query, [{
    key: "beginTimeElapsedQuery",
    value: function beginTimeElapsedQuery() {
      return this.begin(GL_TIME_ELAPSED_EXT);
    }
  }, {
    key: "beginOcclusionQuery",
    value: function beginOcclusionQuery() {
      var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          _ref$conservative = _ref.conservative,
          conservative = _ref$conservative === void 0 ? false : _ref$conservative;

      return this.begin(conservative ? GL_ANY_SAMPLES_PASSED_CONSERVATIVE : GL_ANY_SAMPLES_PASSED);
    }
  }, {
    key: "beginTransformFeedbackQuery",
    value: function beginTransformFeedbackQuery() {
      return this.begin(GL_TRANSFORM_FEEDBACK_PRIMITIVES_WRITTEN);
    }
  }, {
    key: "begin",
    value: function begin(target) {
      if (this._queryPending) {
        return this;
      }

      this.target = target;
      this.gl.beginQuery(this.target, this.handle);
      return this;
    }
  }, {
    key: "end",
    value: function end() {
      if (this._queryPending) {
        return this;
      }

      if (this.target) {
        this.gl.endQuery(this.target);
        this.target = null;
        this._queryPending = true;
      }

      return this;
    }
  }, {
    key: "isResultAvailable",
    value: function isResultAvailable() {
      if (!this._queryPending) {
        return false;
      }

      var resultAvailable = this.gl.getQueryParameter(this.handle, GL_QUERY_RESULT_AVAILABLE);

      if (resultAvailable) {
        this._queryPending = false;
      }

      return resultAvailable;
    }
  }, {
    key: "isTimerDisjoint",
    value: function isTimerDisjoint() {
      return this.gl.getParameter(GL_GPU_DISJOINT_EXT);
    }
  }, {
    key: "getResult",
    value: function getResult() {
      return this.gl.getQueryParameter(this.handle, GL_QUERY_RESULT);
    }
  }, {
    key: "getTimerMilliseconds",
    value: function getTimerMilliseconds() {
      return this.getResult() / 1e6;
    }
  }, {
    key: "createPoll",
    value: function createPoll() {
      var _this2 = this;

      var limit = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : Number.POSITIVE_INFINITY;

      if (this._pollingPromise) {
        return this._pollingPromise;
      }

      var counter = 0;
      this._pollingPromise = new Promise(function (resolve, reject) {
        var poll = function poll() {
          if (_this2.isResultAvailable()) {
            resolve(_this2.getResult());
            _this2._pollingPromise = null;
          } else if (counter++ > limit) {
            reject('Timed out');
            _this2._pollingPromise = null;
          } else {
            requestAnimationFrame(poll);
          }
        };

        requestAnimationFrame(poll);
      });
      return this._pollingPromise;
    }
  }, {
    key: "_createHandle",
    value: function _createHandle() {
      return Query.isSupported(this.gl) ? this.gl.createQuery() : null;
    }
  }, {
    key: "_deleteHandle",
    value: function _deleteHandle() {
      this.gl.deleteQuery(this.handle);
    }
  }]);

  return Query;
}(Resource$1);

var isPage = env.isBrowser() && typeof document !== 'undefined';
var statIdCounter = 0;

var AnimationLoop = function () {
  function AnimationLoop() {
    var props = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, AnimationLoop);

    var _props$onCreateContex = props.onCreateContext,
        onCreateContext = _props$onCreateContex === void 0 ? function (opts) {
      return createGLContext(opts);
    } : _props$onCreateContex,
        _props$onAddHTML = props.onAddHTML,
        onAddHTML = _props$onAddHTML === void 0 ? null : _props$onAddHTML,
        _props$onInitialize = props.onInitialize,
        onInitialize = _props$onInitialize === void 0 ? function () {} : _props$onInitialize,
        _props$onRender = props.onRender,
        onRender = _props$onRender === void 0 ? function () {} : _props$onRender,
        _props$onFinalize = props.onFinalize,
        onFinalize = _props$onFinalize === void 0 ? function () {} : _props$onFinalize,
        onError = props.onError,
        _props$gl = props.gl,
        gl = _props$gl === void 0 ? null : _props$gl,
        _props$glOptions = props.glOptions,
        glOptions = _props$glOptions === void 0 ? {} : _props$glOptions,
        _props$debug = props.debug,
        debug = _props$debug === void 0 ? false : _props$debug,
        _props$createFramebuf = props.createFramebuffer,
        createFramebuffer = _props$createFramebuf === void 0 ? false : _props$createFramebuf,
        _props$autoResizeView = props.autoResizeViewport,
        autoResizeViewport = _props$autoResizeView === void 0 ? true : _props$autoResizeView,
        _props$autoResizeDraw = props.autoResizeDrawingBuffer,
        autoResizeDrawingBuffer = _props$autoResizeDraw === void 0 ? true : _props$autoResizeDraw,
        _props$stats = props.stats,
        stats = _props$stats === void 0 ? lumaStats.get("animation-loop-".concat(statIdCounter++)) : _props$stats;
    var _props$useDevicePixel = props.useDevicePixels,
        useDevicePixels = _props$useDevicePixel === void 0 ? true : _props$useDevicePixel;

    if ('useDevicePixelRatio' in props) {
      log$1.deprecated('useDevicePixelRatio', 'useDevicePixels')();
      useDevicePixels = props.useDevicePixelRatio;
    }

    this.props = {
      onCreateContext: onCreateContext,
      onAddHTML: onAddHTML,
      onInitialize: onInitialize,
      onRender: onRender,
      onFinalize: onFinalize,
      onError: onError,
      gl: gl,
      glOptions: glOptions,
      debug: debug,
      createFramebuffer: createFramebuffer
    };
    this.gl = gl;
    this.needsRedraw = null;
    this.timeline = null;
    this.stats = stats;
    this.cpuTime = this.stats.get('CPU Time');
    this.gpuTime = this.stats.get('GPU Time');
    this.frameRate = this.stats.get('Frame Rate');
    this._initialized = false;
    this._running = false;
    this._animationFrameId = null;
    this._nextFramePromise = null;
    this._resolveNextFrame = null;
    this._cpuStartTime = 0;
    this.setProps({
      autoResizeViewport: autoResizeViewport,
      autoResizeDrawingBuffer: autoResizeDrawingBuffer,
      useDevicePixels: useDevicePixels
    });
    this.start = this.start.bind(this);
    this.stop = this.stop.bind(this);
    this._pageLoadPromise = null;
    this._onMousemove = this._onMousemove.bind(this);
    this._onMouseleave = this._onMouseleave.bind(this);
  }

  _createClass(AnimationLoop, [{
    key: "delete",
    value: function _delete() {
      this.stop();

      this._setDisplay(null);
    }
  }, {
    key: "setNeedsRedraw",
    value: function setNeedsRedraw(reason) {
      assert$1(typeof reason === 'string');
      this.needsRedraw = this.needsRedraw || reason;
      return this;
    }
  }, {
    key: "setProps",
    value: function setProps(props) {
      if ('autoResizeViewport' in props) {
        this.autoResizeViewport = props.autoResizeViewport;
      }

      if ('autoResizeDrawingBuffer' in props) {
        this.autoResizeDrawingBuffer = props.autoResizeDrawingBuffer;
      }

      if ('useDevicePixels' in props) {
        this.useDevicePixels = props.useDevicePixels;
      }

      return this;
    }
  }, {
    key: "start",
    value: function start() {
      var _this = this;

      var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      if (this._running) {
        return this;
      }

      this._running = true;

      var startPromise = this._getPageLoadPromise().then(function () {
        if (!_this._running || _this._initialized) {
          return null;
        }

        _this._createWebGLContext(opts);

        _this._createFramebuffer();

        _this._startEventHandling();

        _this._initializeCallbackData();

        _this._updateCallbackData();

        _this._resizeCanvasDrawingBuffer();

        _this._resizeViewport();

        _this._gpuTimeQuery = Query.isSupported(_this.gl, ['timers']) ? new Query(_this.gl) : null;
        _this._initialized = true;
        return _this.onInitialize(_this.animationProps);
      }).then(function (appContext) {
        if (_this._running) {
          _this._addCallbackData(appContext || {});

          if (appContext !== false) {
            _this._startLoop();
          }
        }
      });

      if (this.props.onError) {
        startPromise["catch"](this.props.onError);
      }

      return this;
    }
  }, {
    key: "redraw",
    value: function redraw() {
      this._beginTimers();

      this._setupFrame();

      this._updateCallbackData();

      this._renderFrame(this.animationProps);

      this._clearNeedsRedraw();

      if (this.offScreen && this.gl.commit) {
        this.gl.commit();
      }

      if (this._resolveNextFrame) {
        this._resolveNextFrame(this);

        this._nextFramePromise = null;
        this._resolveNextFrame = null;
      }

      this._endTimers();

      return this;
    }
  }, {
    key: "stop",
    value: function stop() {
      if (this._running) {
        this._finalizeCallbackData();

        cancelAnimationFrame(this._animationFrameId);
        this._nextFramePromise = null;
        this._resolveNextFrame = null;
        this._animationFrameId = null;
        this._running = false;
      }

      return this;
    }
  }, {
    key: "attachTimeline",
    value: function attachTimeline(timeline) {
      this.timeline = timeline;
      return this.timeline;
    }
  }, {
    key: "detachTimeline",
    value: function detachTimeline() {
      this.timeline = null;
    }
  }, {
    key: "waitForRender",
    value: function waitForRender() {
      var _this2 = this;

      this.setNeedsRedraw('waitForRender');

      if (!this._nextFramePromise) {
        this._nextFramePromise = new Promise(function (resolve) {
          _this2._resolveNextFrame = resolve;
        });
      }

      return this._nextFramePromise;
    }
  }, {
    key: "toDataURL",
    value: function () {
      var _toDataURL = _asyncToGenerator(regenerator.mark(function _callee() {
        return regenerator.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                this.setNeedsRedraw('toDataURL');
                _context.next = 3;
                return this.waitForRender();

              case 3:
                return _context.abrupt("return", this.gl.canvas.toDataURL());

              case 4:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function toDataURL() {
        return _toDataURL.apply(this, arguments);
      }

      return toDataURL;
    }()
  }, {
    key: "onCreateContext",
    value: function onCreateContext() {
      var _this$props;

      return (_this$props = this.props).onCreateContext.apply(_this$props, arguments);
    }
  }, {
    key: "onInitialize",
    value: function onInitialize() {
      var _this$props2;

      return (_this$props2 = this.props).onInitialize.apply(_this$props2, arguments);
    }
  }, {
    key: "onRender",
    value: function onRender() {
      var _this$props3;

      return (_this$props3 = this.props).onRender.apply(_this$props3, arguments);
    }
  }, {
    key: "onFinalize",
    value: function onFinalize() {
      var _this$props4;

      return (_this$props4 = this.props).onFinalize.apply(_this$props4, arguments);
    }
  }, {
    key: "getHTMLControlValue",
    value: function getHTMLControlValue(id) {
      var defaultValue = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
      var element = document.getElementById(id);
      return element ? Number(element.value) : defaultValue;
    }
  }, {
    key: "setViewParameters",
    value: function setViewParameters() {
      log$1.removed('AnimationLoop.setViewParameters', 'AnimationLoop.setProps')();
      return this;
    }
  }, {
    key: "_startLoop",
    value: function _startLoop() {
      var _this3 = this;

      var renderFrame = function renderFrame() {
        if (!_this3._running) {
          return;
        }

        _this3.redraw();

        _this3._animationFrameId = _this3._requestAnimationFrame(renderFrame);
      };

      cancelAnimationFrame(this._animationFrameId);
      this._animationFrameId = this._requestAnimationFrame(renderFrame);
    }
  }, {
    key: "_getPageLoadPromise",
    value: function _getPageLoadPromise() {
      if (!this._pageLoadPromise) {
        this._pageLoadPromise = isPage ? new Promise(function (resolve, reject) {
          if (isPage && document.readyState === 'complete') {
            resolve(document);
            return;
          }

          window.addEventListener('load', function () {
            resolve(document);
          });
        }) : Promise.resolve({});
      }

      return this._pageLoadPromise;
    }
  }, {
    key: "_setDisplay",
    value: function _setDisplay(display) {
      if (this.display) {
        this.display["delete"]();
        this.display.animationLoop = null;
      }

      if (display) {
        display.animationLoop = this;
      }

      this.display = display;
    }
  }, {
    key: "_requestAnimationFrame",
    value: function _requestAnimationFrame(renderFrameCallback) {
      if (this.display && this.display.requestAnimationFrame(renderFrameCallback)) {
        return;
      }

      requestAnimationFrame$1(renderFrameCallback);
    }
  }, {
    key: "_renderFrame",
    value: function _renderFrame() {
      if (this.display) {
        var _this$display;

        (_this$display = this.display)._renderFrame.apply(_this$display, arguments);

        return;
      }

      this.onRender.apply(this, arguments);
    }
  }, {
    key: "_clearNeedsRedraw",
    value: function _clearNeedsRedraw() {
      this.needsRedraw = null;
    }
  }, {
    key: "_setupFrame",
    value: function _setupFrame() {
      if (this._onSetupFrame) {
        this._onSetupFrame(this.animationProps);
      } else {
        this._resizeCanvasDrawingBuffer();

        this._resizeViewport();

        this._resizeFramebuffer();
      }
    }
  }, {
    key: "_initializeCallbackData",
    value: function _initializeCallbackData() {
      this.animationProps = {
        gl: this.gl,
        stop: this.stop,
        canvas: this.gl.canvas,
        framebuffer: this.framebuffer,
        useDevicePixels: this.useDevicePixels,
        needsRedraw: null,
        startTime: Date.now(),
        engineTime: 0,
        tick: 0,
        tock: 0,
        time: 0,
        _timeline: this.timeline,
        _loop: this,
        _animationLoop: this,
        _mousePosition: null
      };
    }
  }, {
    key: "_updateCallbackData",
    value: function _updateCallbackData() {
      var _this$_getSizeAndAspe = this._getSizeAndAspect(),
          width = _this$_getSizeAndAspe.width,
          height = _this$_getSizeAndAspe.height,
          aspect = _this$_getSizeAndAspe.aspect;

      if (width !== this.animationProps.width || height !== this.animationProps.height) {
        this.setNeedsRedraw('drawing buffer resized');
      }

      if (aspect !== this.animationProps.aspect) {
        this.setNeedsRedraw('drawing buffer aspect changed');
      }

      this.animationProps.width = width;
      this.animationProps.height = height;
      this.animationProps.aspect = aspect;
      this.animationProps.needsRedraw = this.needsRedraw;
      this.animationProps.engineTime = Date.now() - this.animationProps.startTime;

      if (this.timeline) {
        this.timeline.update(this.animationProps.engineTime);
      }

      this.animationProps.tick = Math.floor(this.animationProps.time / 1000 * 60);
      this.animationProps.tock++;
      this.animationProps.time = this.timeline ? this.timeline.getTime() : this.animationProps.engineTime;
      this.animationProps._offScreen = this.offScreen;
    }
  }, {
    key: "_finalizeCallbackData",
    value: function _finalizeCallbackData() {
      this.onFinalize(this.animationProps);
    }
  }, {
    key: "_addCallbackData",
    value: function _addCallbackData(appContext) {
      if (_typeof(appContext) === 'object' && appContext !== null) {
        this.animationProps = Object.assign({}, this.animationProps, appContext);
      }
    }
  }, {
    key: "_createWebGLContext",
    value: function _createWebGLContext(opts) {
      this.offScreen = opts.canvas && typeof OffscreenCanvas !== 'undefined' && opts.canvas instanceof OffscreenCanvas;
      opts = Object.assign({}, opts, this.props.glOptions);
      this.gl = this.props.gl ? instrumentGLContext(this.props.gl, opts) : this.onCreateContext(opts);

      if (!isWebGL(this.gl)) {
        throw new Error('AnimationLoop.onCreateContext - illegal context returned');
      }

      resetParameters(this.gl);

      this._createInfoDiv();
    }
  }, {
    key: "_createInfoDiv",
    value: function _createInfoDiv() {
      if (this.gl.canvas && this.props.onAddHTML) {
        var wrapperDiv = document.createElement('div');
        document.body.appendChild(wrapperDiv);
        wrapperDiv.style.position = 'relative';
        var div = document.createElement('div');
        div.style.position = 'absolute';
        div.style.left = '10px';
        div.style.bottom = '10px';
        div.style.width = '300px';
        div.style.background = 'white';
        wrapperDiv.appendChild(this.gl.canvas);
        wrapperDiv.appendChild(div);
        var html = this.props.onAddHTML(div);

        if (html) {
          div.innerHTML = html;
        }
      }
    }
  }, {
    key: "_getSizeAndAspect",
    value: function _getSizeAndAspect() {
      var width = this.gl.drawingBufferWidth;
      var height = this.gl.drawingBufferHeight;
      var aspect = 1;
      var canvas = this.gl.canvas;

      if (canvas && canvas.clientHeight) {
        aspect = canvas.clientWidth / canvas.clientHeight;
      } else if (width > 0 && height > 0) {
        aspect = width / height;
      }

      return {
        width: width,
        height: height,
        aspect: aspect
      };
    }
  }, {
    key: "_resizeViewport",
    value: function _resizeViewport() {
      if (this.autoResizeViewport) {
        this.gl.viewport(0, 0, this.gl.drawingBufferWidth, this.gl.drawingBufferHeight);
      }
    }
  }, {
    key: "_resizeCanvasDrawingBuffer",
    value: function _resizeCanvasDrawingBuffer() {
      if (this.autoResizeDrawingBuffer) {
        resizeGLContext(this.gl, {
          useDevicePixels: this.useDevicePixels
        });
      }
    }
  }, {
    key: "_createFramebuffer",
    value: function _createFramebuffer() {
      if (this.props.createFramebuffer) {
        this.framebuffer = new Framebuffer(this.gl);
      }
    }
  }, {
    key: "_resizeFramebuffer",
    value: function _resizeFramebuffer() {
      if (this.framebuffer) {
        this.framebuffer.resize({
          width: this.gl.drawingBufferWidth,
          height: this.gl.drawingBufferHeight
        });
      }
    }
  }, {
    key: "_beginTimers",
    value: function _beginTimers() {
      this.frameRate.timeEnd();
      this.frameRate.timeStart();

      if (this._gpuTimeQuery && this._gpuTimeQuery.isResultAvailable() && !this._gpuTimeQuery.isTimerDisjoint()) {
        this.stats.get('GPU Time').addTime(this._gpuTimeQuery.getTimerMilliseconds());
      }

      if (this._gpuTimeQuery) {
        this._gpuTimeQuery.beginTimeElapsedQuery();
      }

      this.cpuTime.timeStart();
    }
  }, {
    key: "_endTimers",
    value: function _endTimers() {
      this.cpuTime.timeEnd();

      if (this._gpuTimeQuery) {
        this._gpuTimeQuery.end();
      }
    }
  }, {
    key: "_startEventHandling",
    value: function _startEventHandling() {
      var canvas = this.gl.canvas;

      if (canvas) {
        canvas.addEventListener('mousemove', this._onMousemove);
        canvas.addEventListener('mouseleave', this._onMouseleave);
      }
    }
  }, {
    key: "_onMousemove",
    value: function _onMousemove(e) {
      this.animationProps._mousePosition = [e.offsetX, e.offsetY];
    }
  }, {
    key: "_onMouseleave",
    value: function _onMouseleave(e) {
      this.animationProps._mousePosition = null;
    }
  }]);

  return AnimationLoop;
}();

var channelHandles = 1;
var animationHandles = 1;
var Timeline = function () {
  function Timeline() {
    _classCallCheck(this, Timeline);

    this.time = 0;
    this.channels = new Map();
    this.animations = new Map();
    this.playing = false;
    this.lastEngineTime = -1;
  }

  _createClass(Timeline, [{
    key: "addChannel",
    value: function addChannel(props) {
      var _props$delay = props.delay,
          delay = _props$delay === void 0 ? 0 : _props$delay,
          _props$duration = props.duration,
          duration = _props$duration === void 0 ? Number.POSITIVE_INFINITY : _props$duration,
          _props$rate = props.rate,
          rate = _props$rate === void 0 ? 1 : _props$rate,
          _props$repeat = props.repeat,
          repeat = _props$repeat === void 0 ? 1 : _props$repeat;
      var handle = channelHandles++;
      var channel = {
        time: 0,
        delay: delay,
        duration: duration,
        rate: rate,
        repeat: repeat
      };

      this._setChannelTime(channel, this.time);

      this.channels.set(handle, channel);
      return handle;
    }
  }, {
    key: "removeChannel",
    value: function removeChannel(handle) {
      this.channels["delete"](handle);
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = this.animations[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var _step$value = _slicedToArray(_step.value, 2),
              animationHandle = _step$value[0],
              animation = _step$value[1];

          if (animation.channel === handle) {
            this.detachAnimation(animationHandle);
          }
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator["return"] != null) {
            _iterator["return"]();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }
    }
  }, {
    key: "isFinished",
    value: function isFinished(handle) {
      var channel = this.channels.get(handle);

      if (channel === undefined) {
        return false;
      }

      return this.time >= channel.delay + channel.duration * channel.repeat;
    }
  }, {
    key: "getTime",
    value: function getTime(handle) {
      if (handle === undefined) {
        return this.time;
      }

      var channel = this.channels.get(handle);

      if (channel === undefined) {
        return -1;
      }

      return channel.time;
    }
  }, {
    key: "setTime",
    value: function setTime(time) {
      this.time = Math.max(0, time);
      var channels = this.channels.values();
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = channels[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var channel = _step2.value;

          this._setChannelTime(channel, this.time);
        }
      } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion2 && _iterator2["return"] != null) {
            _iterator2["return"]();
          }
        } finally {
          if (_didIteratorError2) {
            throw _iteratorError2;
          }
        }
      }

      var animations = this.animations.values();
      var _iteratorNormalCompletion3 = true;
      var _didIteratorError3 = false;
      var _iteratorError3 = undefined;

      try {
        for (var _iterator3 = animations[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
          var animationData = _step3.value;
          var animation = animationData.animation,
              _channel = animationData.channel;
          animation.setTime(this.getTime(_channel));
        }
      } catch (err) {
        _didIteratorError3 = true;
        _iteratorError3 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion3 && _iterator3["return"] != null) {
            _iterator3["return"]();
          }
        } finally {
          if (_didIteratorError3) {
            throw _iteratorError3;
          }
        }
      }
    }
  }, {
    key: "play",
    value: function play() {
      this.playing = true;
    }
  }, {
    key: "pause",
    value: function pause() {
      this.playing = false;
      this.lastEngineTime = -1;
    }
  }, {
    key: "reset",
    value: function reset() {
      this.setTime(0);
    }
  }, {
    key: "attachAnimation",
    value: function attachAnimation(animation, channelHandle) {
      var animationHandle = animationHandles++;
      this.animations.set(animationHandle, {
        animation: animation,
        channel: channelHandle
      });
      animation.setTime(this.getTime(channelHandle));
      return animationHandle;
    }
  }, {
    key: "detachAnimation",
    value: function detachAnimation(handle) {
      this.animations["delete"](handle);
    }
  }, {
    key: "update",
    value: function update(engineTime) {
      if (this.playing) {
        if (this.lastEngineTime === -1) {
          this.lastEngineTime = engineTime;
        }

        this.setTime(this.time + (engineTime - this.lastEngineTime));
        this.lastEngineTime = engineTime;
      }
    }
  }, {
    key: "_setChannelTime",
    value: function _setChannelTime(channel, time) {
      var offsetTime = time - channel.delay;
      var totalDuration = channel.duration * channel.repeat;

      if (offsetTime >= totalDuration) {
        channel.time = channel.duration * channel.rate;
      } else {
        channel.time = Math.max(0, offsetTime) % channel.duration;
        channel.time *= channel.rate;
      }
    }
  }]);

  return Timeline;
}();

var vs = "\nstruct VertexGeometry {\n  vec4 position;\n  vec3 worldPosition;\n  vec3 worldPositionAlt;\n  vec3 normal;\n  vec2 uv;\n  vec3 pickingColor;\n} geometry;\n";
var fs = "\n#define SMOOTH_EDGE_RADIUS 0.5\n\nstruct FragmentGeometry {\n  vec2 uv;\n} geometry;\n\nfloat smoothedge(float edge, float x) {\n  return smoothstep(edge - SMOOTH_EDGE_RADIUS, edge + SMOOTH_EDGE_RADIUS, x);\n}\n";
var geometry = {
  name: 'geometry',
  vs: vs,
  fs: fs
};

var MAX_LATITUDE = 85.05113;
var MIN_LATITUDE = -85.05113;
function normalizeViewportProps(_ref) {
  var width = _ref.width,
      height = _ref.height,
      longitude = _ref.longitude,
      latitude = _ref.latitude,
      zoom = _ref.zoom,
      _ref$pitch = _ref.pitch,
      pitch = _ref$pitch === void 0 ? 0 : _ref$pitch,
      _ref$bearing = _ref.bearing,
      bearing = _ref$bearing === void 0 ? 0 : _ref$bearing;

  if (longitude < -180 || longitude > 180) {
    longitude = mod(longitude + 180, 360) - 180;
  }

  if (bearing < -180 || bearing > 180) {
    bearing = mod(bearing + 180, 360) - 180;
  }

  var flatViewport = new WebMercatorViewport({
    width: width,
    height: height,
    longitude: longitude,
    latitude: latitude,
    zoom: zoom
  });
  var topY = flatViewport.project([longitude, MAX_LATITUDE])[1];
  var bottomY = flatViewport.project([longitude, MIN_LATITUDE])[1];
  var shiftY = 0;

  if (bottomY - topY < height) {
    zoom += Math.log2(height / (bottomY - topY));
    flatViewport = new WebMercatorViewport({
      width: width,
      height: height,
      longitude: longitude,
      latitude: latitude,
      zoom: zoom
    });
    topY = flatViewport.project([longitude, MAX_LATITUDE])[1];
    bottomY = flatViewport.project([longitude, MIN_LATITUDE])[1];
  }

  if (topY > 0) {
    shiftY = topY;
  } else if (bottomY < height) {
    shiftY = bottomY - height;
  }

  if (shiftY) {
    latitude = flatViewport.unproject([width / 2, height / 2 + shiftY])[1];
  }

  return {
    width: width,
    height: height,
    longitude: longitude,
    latitude: latitude,
    zoom: zoom,
    pitch: pitch,
    bearing: bearing
  };
}

function _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }
var vs$1 = "\nconst int max_lights = 2;\nuniform mat4 shadow_uViewProjectionMatrices[max_lights];\nuniform vec4 shadow_uProjectCenters[max_lights];\nuniform bool shadow_uDrawShadowMap;\nuniform bool shadow_uUseShadowMap;\nuniform int shadow_uLightId;\nuniform float shadow_uLightCount;\n\nvarying vec3 shadow_vPosition[max_lights];\n\nvec4 shadow_setVertexPosition(vec4 position_commonspace) {\n  if (shadow_uDrawShadowMap) {\n    return project_common_position_to_clipspace(position_commonspace, shadow_uViewProjectionMatrices[shadow_uLightId], shadow_uProjectCenters[shadow_uLightId]);\n  }\n  if (shadow_uUseShadowMap) {\n    for (int i = 0; i < max_lights; i++) {\n      if(i < int(shadow_uLightCount)) {\n        vec4 shadowMap_position = project_common_position_to_clipspace(position_commonspace, shadow_uViewProjectionMatrices[i], shadow_uProjectCenters[i]);\n        shadow_vPosition[i] = (shadowMap_position.xyz / shadowMap_position.w + 1.0) / 2.0;\n      }\n    }\n  }\n  return gl_Position;\n}\n";
var fs$1 = "\nconst int max_lights = 2;\nuniform bool shadow_uDrawShadowMap;\nuniform bool shadow_uUseShadowMap;\nuniform sampler2D shadow_uShadowMap0;\nuniform sampler2D shadow_uShadowMap1;\nuniform vec4 shadow_uColor;\nuniform float shadow_uLightCount;\n\nvarying vec3 shadow_vPosition[max_lights];\n\nconst vec4 bitPackShift = vec4(1.0, 255.0, 65025.0, 16581375.0);\nconst vec4 bitUnpackShift = 1.0 / bitPackShift;\nconst vec4 bitMask = vec4(1.0 / 255.0, 1.0 / 255.0, 1.0 / 255.0,  0.0);\n\nfloat shadow_getShadowWeight(vec3 position, sampler2D shadowMap) {\n  vec4 rgbaDepth = texture2D(shadowMap, position.xy);\n\n  float z = dot(rgbaDepth, bitUnpackShift);\n  return smoothstep(0.001, 0.01, position.z - z);\n}\n\nvec4 shadow_filterShadowColor(vec4 color) {\n  if (shadow_uDrawShadowMap) {\n    vec4 rgbaDepth = fract(gl_FragCoord.z * bitPackShift);\n    rgbaDepth -= rgbaDepth.gbaa * bitMask;\n    return rgbaDepth;\n  }\n  if (shadow_uUseShadowMap) {\n    float shadowAlpha = 0.0;\n    shadowAlpha += shadow_getShadowWeight(shadow_vPosition[0], shadow_uShadowMap0);\n    if(shadow_uLightCount > 1.0) {\n      shadowAlpha += shadow_getShadowWeight(shadow_vPosition[1], shadow_uShadowMap1);\n    }\n    shadowAlpha *= shadow_uColor.a / shadow_uLightCount;\n    float blendedAlpha = shadowAlpha + color.a * (1.0 - shadowAlpha);\n\n    return vec4(\n      mix(color.rgb, shadow_uColor.rgb, shadowAlpha / blendedAlpha),\n      blendedAlpha\n    );\n  }\n  return color;\n}\n";
var getMemoizedViewportCenterPosition = memoize(getViewportCenterPosition);
var getMemoizedViewProjectionMatrices = memoize(getViewProjectionMatrices);
var DEFAULT_SHADOW_COLOR = [0, 0, 0, 1.0];
var VECTOR_TO_POINT_MATRIX = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0];

function screenToCommonSpace(xyz, pixelUnprojectionMatrix) {
  var _xyz = _slicedToArray(xyz, 3),
      x = _xyz[0],
      y = _xyz[1],
      z = _xyz[2];

  var coord = pixelsToWorld([x, y, z], pixelUnprojectionMatrix);

  if (Number.isFinite(z)) {
    return coord;
  }

  return [coord[0], coord[1], 0];
}

function getViewportCenterPosition(_ref) {
  var viewport = _ref.viewport,
      center = _ref.center;
  return new Matrix4(viewport.viewProjectionMatrix).invert().transform(center);
}

function getViewProjectionMatrices(_ref2) {
  var viewport = _ref2.viewport,
      shadowMatrices = _ref2.shadowMatrices;
  var projectionMatrices = [];
  var pixelUnprojectionMatrix = viewport.pixelUnprojectionMatrix;
  var farZ = viewport.isGeospatial ? undefined : 1;
  var corners = [[0, 0, farZ], [viewport.width, 0, farZ], [0, viewport.height, farZ], [viewport.width, viewport.height, farZ], [0, 0, -1], [viewport.width, 0, -1], [0, viewport.height, -1], [viewport.width, viewport.height, -1]].map(function (pixel) {
    return screenToCommonSpace(pixel, pixelUnprojectionMatrix);
  });

  var _iterator = _createForOfIteratorHelper(shadowMatrices),
      _step;

  try {
    var _loop = function _loop() {
      var shadowMatrix = _step.value;
      var viewMatrix = shadowMatrix.clone().translate(new Vector3(viewport.center).negate());
      var positions = corners.map(function (corner) {
        return viewMatrix.transform(corner);
      });
      var projectionMatrix = new Matrix4().ortho({
        left: Math.min.apply(Math, _toConsumableArray(positions.map(function (position) {
          return position[0];
        }))),
        right: Math.max.apply(Math, _toConsumableArray(positions.map(function (position) {
          return position[0];
        }))),
        bottom: Math.min.apply(Math, _toConsumableArray(positions.map(function (position) {
          return position[1];
        }))),
        top: Math.max.apply(Math, _toConsumableArray(positions.map(function (position) {
          return position[1];
        }))),
        near: Math.min.apply(Math, _toConsumableArray(positions.map(function (position) {
          return -position[2];
        }))),
        far: Math.max.apply(Math, _toConsumableArray(positions.map(function (position) {
          return -position[2];
        })))
      });
      projectionMatrices.push(projectionMatrix.multiplyRight(shadowMatrix));
    };

    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      _loop();
    }
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }

  return projectionMatrices;
}

function createShadowUniforms() {
  var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var context = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var uniforms = {
    shadow_uDrawShadowMap: Boolean(opts.drawToShadowMap),
    shadow_uUseShadowMap: opts.shadowMaps ? opts.shadowMaps.length > 0 : false,
    shadow_uColor: opts.shadowColor || DEFAULT_SHADOW_COLOR,
    shadow_uLightId: opts.shadowLightId || 0,
    shadow_uLightCount: opts.shadowMatrices.length
  };
  var center = getMemoizedViewportCenterPosition({
    viewport: opts.viewport,
    center: context.project_uCenter
  });
  var projectCenters = [];
  var viewProjectionMatrices = getMemoizedViewProjectionMatrices({
    shadowMatrices: opts.shadowMatrices,
    viewport: opts.viewport
  }).slice();

  for (var i = 0; i < opts.shadowMatrices.length; i++) {
    var viewProjectionMatrix = viewProjectionMatrices[i];
    var viewProjectionMatrixCentered = viewProjectionMatrix.clone().translate(new Vector3(opts.viewport.center).negate());

    if (context.project_uCoordinateSystem === COORDINATE_SYSTEM.LNGLAT && context.project_uProjectionMode === PROJECTION_MODE.WEB_MERCATOR) {
      viewProjectionMatrices[i] = viewProjectionMatrixCentered;
      projectCenters[i] = center;
    } else {
      viewProjectionMatrices[i] = viewProjectionMatrix.clone().multiplyRight(VECTOR_TO_POINT_MATRIX);
      projectCenters[i] = viewProjectionMatrixCentered.transform(center);
    }
  }

  for (var _i = 0; _i < viewProjectionMatrices.length; _i++) {
    uniforms["shadow_uViewProjectionMatrices[".concat(_i, "]")] = viewProjectionMatrices[_i];
    uniforms["shadow_uProjectCenters[".concat(_i, "]")] = projectCenters[_i];

    if (opts.shadowMaps && opts.shadowMaps.length > 0) {
      uniforms["shadow_uShadowMap".concat(_i)] = opts.shadowMaps[_i];
    } else {
      uniforms["shadow_uShadowMap".concat(_i)] = opts.dummyShadowMap;
    }
  }

  return uniforms;
}

var shadow = {
  name: 'shadow',
  dependencies: [project],
  vs: vs$1,
  fs: fs$1,
  inject: {
    'vs:DECKGL_FILTER_GL_POSITION': "\n    position = shadow_setVertexPosition(geometry.position);\n    ",
    'fs:DECKGL_FILTER_COLOR': "\n    color = shadow_filterShadowColor(color);\n    "
  },
  getUniforms: function getUniforms() {
    var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var context = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    if (opts.drawToShadowMap || opts.shadowMaps && opts.shadowMaps.length > 0) {
      var shadowUniforms = {};
      var _opts$shadowEnabled = opts.shadowEnabled,
          shadowEnabled = _opts$shadowEnabled === void 0 ? true : _opts$shadowEnabled;

      if (shadowEnabled && opts.shadowMatrices && opts.shadowMatrices.length > 0) {
        Object.assign(shadowUniforms, createShadowUniforms(opts, context));
      } else {
        Object.assign(shadowUniforms, {
          shadow_uDrawShadowMap: false,
          shadow_uUseShadowMap: false
        });
      }

      return shadowUniforms;
    }

    return {};
  }
};

function _createForOfIteratorHelper$1(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray$1(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray$1(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray$1(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray$1(o, minLen); }

function _arrayLikeToArray$1(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }
var DEFAULT_MODULES = [geometry, project];
var SHADER_HOOKS = ['vs:DECKGL_FILTER_SIZE(inout vec3 size, VertexGeometry geometry)', 'vs:DECKGL_FILTER_GL_POSITION(inout vec4 position, VertexGeometry geometry)', 'vs:DECKGL_FILTER_COLOR(inout vec4 color, VertexGeometry geometry)', 'fs:DECKGL_FILTER_COLOR(inout vec4 color, FragmentGeometry geometry)'];
function createProgramManager(gl) {
  var programManager = ProgramManager.getDefaultProgramManager(gl);

  var _iterator = _createForOfIteratorHelper$1(DEFAULT_MODULES),
      _step;

  try {
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      var shaderModule = _step.value;
      programManager.addDefaultModule(shaderModule);
    }
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }

  var _iterator2 = _createForOfIteratorHelper$1(SHADER_HOOKS),
      _step2;

  try {
    for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
      var shaderHook = _step2.value;
      programManager.addShaderHook(shaderHook);
    }
  } catch (err) {
    _iterator2.e(err);
  } finally {
    _iterator2.f();
  }

  return programManager;
}

var DEFAULT_LIGHT_COLOR = [255, 255, 255];
var DEFAULT_LIGHT_INTENSITY = 1.0;
var idCount = 0;
var AmbientLight = function AmbientLight() {
  var props = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  _classCallCheck(this, AmbientLight);

  var _props$color = props.color,
      color = _props$color === void 0 ? DEFAULT_LIGHT_COLOR : _props$color;
  var _props$intensity = props.intensity,
      intensity = _props$intensity === void 0 ? DEFAULT_LIGHT_INTENSITY : _props$intensity;
  this.id = props.id || "ambient-".concat(idCount++);
  this.color = color;
  this.intensity = intensity;
  this.type = 'ambient';
};

var DEFAULT_LIGHT_COLOR$1 = [255, 255, 255];
var DEFAULT_LIGHT_INTENSITY$1 = 1.0;
var DEFAULT_LIGHT_DIRECTION = [0.0, 0.0, -1.0];
var idCount$1 = 0;
var DirectionalLight = function () {
  function DirectionalLight() {
    var props = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, DirectionalLight);

    var _props$color = props.color,
        color = _props$color === void 0 ? DEFAULT_LIGHT_COLOR$1 : _props$color;
    var _props$intensity = props.intensity,
        intensity = _props$intensity === void 0 ? DEFAULT_LIGHT_INTENSITY$1 : _props$intensity;
    var _props$direction = props.direction,
        direction = _props$direction === void 0 ? DEFAULT_LIGHT_DIRECTION : _props$direction;

    var _props$_shadow = props._shadow,
        _shadow = _props$_shadow === void 0 ? false : _props$_shadow;

    this.id = props.id || "directional-".concat(idCount$1++);
    this.color = color;
    this.intensity = intensity;
    this.type = 'directional';
    this.direction = new Vector3(direction).normalize().toArray();
    this.shadow = _shadow;
  }

  _createClass(DirectionalLight, [{
    key: "getProjectedLight",
    value: function getProjectedLight() {
      return this;
    }
  }]);

  return DirectionalLight;
}();

var Effect = function () {
  function Effect() {
    var props = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, Effect);

    var _props$id = props.id,
        id = _props$id === void 0 ? 'effect' : _props$id;
    this.id = id;
    this.props = {};
    Object.assign(this.props, props);
  }

  _createClass(Effect, [{
    key: "preRender",
    value: function preRender() {}
  }, {
    key: "getModuleParameters",
    value: function getModuleParameters() {}
  }, {
    key: "cleanup",
    value: function cleanup() {}
  }]);

  return Effect;
}();

var Pass = function () {
  function Pass(gl) {
    var props = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    _classCallCheck(this, Pass);

    var _props$id = props.id,
        id = _props$id === void 0 ? 'pass' : _props$id;
    this.id = id;
    this.gl = gl;
    this.props = {};
    Object.assign(this.props, props);
  }

  _createClass(Pass, [{
    key: "setProps",
    value: function setProps(props) {
      Object.assign(this.props, props);
    }
  }, {
    key: "render",
    value: function render() {}
  }, {
    key: "cleanup",
    value: function cleanup() {}
  }]);

  return Pass;
}();

function _createForOfIteratorHelper$2(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray$2(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray$2(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray$2(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray$2(o, minLen); }

function _arrayLikeToArray$2(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

var LayersPass = function (_Pass) {
  _inherits(LayersPass, _Pass);

  var _super = _createSuper(LayersPass);

  function LayersPass() {
    _classCallCheck(this, LayersPass);

    return _super.apply(this, arguments);
  }

  _createClass(LayersPass, [{
    key: "render",
    value: function render(props) {
      var gl = this.gl;
      setParameters(gl, {
        framebuffer: props.target
      });
      return this._drawLayers(props);
    }
  }, {
    key: "_drawLayers",
    value: function _drawLayers(props) {
      var viewports = props.viewports,
          views = props.views,
          onViewportActive = props.onViewportActive,
          _props$clearCanvas = props.clearCanvas,
          clearCanvas = _props$clearCanvas === void 0 ? true : _props$clearCanvas;
      var gl = this.gl;

      if (clearCanvas) {
        clearGLCanvas(gl);
      }

      var renderStats = [];

      var _iterator = _createForOfIteratorHelper$2(viewports),
          _step;

      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var viewportOrDescriptor = _step.value;
          var viewport = viewportOrDescriptor.viewport || viewportOrDescriptor;
          var view = views && views[viewport.id];
          onViewportActive(viewport);

          var drawLayerParams = this._getDrawLayerParams(viewport, props);

          props.view = view;
          var subViewports = viewport.subViewports || [viewport];

          var _iterator2 = _createForOfIteratorHelper$2(subViewports),
              _step2;

          try {
            for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
              var subViewport = _step2.value;
              props.viewport = subViewport;

              var stats = this._drawLayersInViewport(gl, props, drawLayerParams);

              renderStats.push(stats);
            }
          } catch (err) {
            _iterator2.e(err);
          } finally {
            _iterator2.f();
          }
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }

      return renderStats;
    }
  }, {
    key: "_getDrawLayerParams",
    value: function _getDrawLayerParams(viewport, _ref) {
      var layers = _ref.layers,
          _ref$pass = _ref.pass,
          pass = _ref$pass === void 0 ? 'unknown' : _ref$pass,
          layerFilter = _ref.layerFilter,
          effects = _ref.effects,
          moduleParameters = _ref.moduleParameters;
      var drawLayerParams = [];
      var indexResolver = layerIndexResolver();

      for (var layerIndex = 0; layerIndex < layers.length; layerIndex++) {
        var layer = layers[layerIndex];

        var shouldDrawLayer = this._shouldDrawLayer(layer, viewport, pass, layerFilter);

        var layerRenderIndex = indexResolver(layer, shouldDrawLayer);
        var layerParam = {
          shouldDrawLayer: shouldDrawLayer,
          layerRenderIndex: layerRenderIndex
        };

        if (shouldDrawLayer) {
          layerParam.moduleParameters = this._getModuleParameters(layer, effects, pass, moduleParameters);
          layerParam.layerParameters = this.getLayerParameters(layer, layerIndex);
        }

        drawLayerParams[layerIndex] = layerParam;
      }

      return drawLayerParams;
    }
  }, {
    key: "_drawLayersInViewport",
    value: function _drawLayersInViewport(gl, _ref2, drawLayerParams) {
      var layers = _ref2.layers,
          onError = _ref2.onError,
          viewport = _ref2.viewport,
          view = _ref2.view;
      var glViewport = getGLViewport(gl, {
        viewport: viewport
      });

      if (view && view.props.clear) {
        var clearOpts = view.props.clear === true ? {
          color: true,
          depth: true
        } : view.props.clear;
        withParameters(gl, {
          scissorTest: true,
          scissor: glViewport
        }, function () {
          return clear(gl, clearOpts);
        });
      }

      var renderStatus = {
        totalCount: layers.length,
        visibleCount: 0,
        compositeCount: 0,
        pickableCount: 0
      };
      setParameters(gl, {
        viewport: glViewport
      });

      for (var layerIndex = 0; layerIndex < layers.length; layerIndex++) {
        var layer = layers[layerIndex];
        var _drawLayerParams$laye = drawLayerParams[layerIndex],
            shouldDrawLayer = _drawLayerParams$laye.shouldDrawLayer,
            layerRenderIndex = _drawLayerParams$laye.layerRenderIndex,
            moduleParameters = _drawLayerParams$laye.moduleParameters,
            layerParameters = _drawLayerParams$laye.layerParameters;

        if (shouldDrawLayer && layer.props.pickable) {
          renderStatus.pickableCount++;
        }

        if (layer.isComposite) {
          renderStatus.compositeCount++;
        } else if (shouldDrawLayer) {
          renderStatus.visibleCount++;
          moduleParameters.viewport = viewport;

          try {
            layer.drawLayer({
              moduleParameters: moduleParameters,
              uniforms: {
                layerIndex: layerRenderIndex
              },
              parameters: layerParameters
            });
          } catch (err) {
            if (onError) {
              onError(err, layer);
            } else {
              log.error("error during drawing of ".concat(layer), err)();
            }
          }
        }
      }

      return renderStatus;
    }
  }, {
    key: "shouldDrawLayer",
    value: function shouldDrawLayer(layer) {
      return true;
    }
  }, {
    key: "getModuleParameters",
    value: function getModuleParameters(layer, effects) {
      return null;
    }
  }, {
    key: "getLayerParameters",
    value: function getLayerParameters(layer, layerIndex) {
      return layer.props.parameters;
    }
  }, {
    key: "_shouldDrawLayer",
    value: function _shouldDrawLayer(layer, viewport, pass, layerFilter) {
      var shouldDrawLayer = this.shouldDrawLayer(layer) && layer.props.visible;

      if (shouldDrawLayer && layerFilter) {
        shouldDrawLayer = layerFilter({
          layer: layer,
          viewport: viewport,
          isPicking: pass.startsWith('picking'),
          renderPass: pass
        });
      }

      if (shouldDrawLayer) {
        layer.activateViewport(viewport);
      }

      return shouldDrawLayer;
    }
  }, {
    key: "_getModuleParameters",
    value: function _getModuleParameters(layer, effects, pass, overrides) {
      var moduleParameters = Object.assign(Object.create(layer.props), {
        autoWrapLongitude: layer.wrapLongitude,
        viewport: layer.context.viewport,
        mousePosition: layer.context.mousePosition,
        pickingActive: 0,
        devicePixelRatio: cssToDeviceRatio(this.gl)
      });

      if (effects) {
        var _iterator3 = _createForOfIteratorHelper$2(effects),
            _step3;

        try {
          for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
            var effect = _step3.value;
            Object.assign(moduleParameters, effect.getModuleParameters(layer));
          }
        } catch (err) {
          _iterator3.e(err);
        } finally {
          _iterator3.f();
        }
      }

      return Object.assign(moduleParameters, this.getModuleParameters(layer, effects), overrides);
    }
  }]);

  return LayersPass;
}(Pass);
function layerIndexResolver() {
  var startIndex = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
  var layerIndices = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var resolvers = {};

  var resolveLayerIndex = function resolveLayerIndex(layer, isDrawn) {
    var indexOverride = layer.props._offset;
    var layerId = layer.id;
    var parentId = layer.parent && layer.parent.id;
    var index;

    if (parentId && !(parentId in layerIndices)) {
      resolveLayerIndex(layer.parent, false);
    }

    if (parentId in resolvers) {
      var resolver = resolvers[parentId] = resolvers[parentId] || layerIndexResolver(layerIndices[parentId], layerIndices);
      index = resolver(layer, isDrawn);
      resolvers[layerId] = resolver;
    } else if (Number.isFinite(indexOverride)) {
      index = indexOverride + (layerIndices[parentId] || 0);
      resolvers[layerId] = null;
    } else {
      index = startIndex;
    }

    if (isDrawn && index >= startIndex) {
      startIndex = index + 1;
    }

    layerIndices[layerId] = index;
    return index;
  };

  return resolveLayerIndex;
}

function getGLViewport(gl, _ref3) {
  var viewport = _ref3.viewport;
  var height = gl.canvas ? gl.canvas.clientHeight || gl.canvas.height : 100;
  var dimensions = viewport;
  var pixelRatio = cssToDeviceRatio(gl);
  return [dimensions.x * pixelRatio, (height - dimensions.y - dimensions.height) * pixelRatio, dimensions.width * pixelRatio, dimensions.height * pixelRatio];
}

function clearGLCanvas(gl) {
  var width = gl.drawingBufferWidth;
  var height = gl.drawingBufferHeight;
  setParameters(gl, {
    viewport: [0, 0, width, height]
  });
  gl.clear(16384 | 256);
}

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _createSuper$1(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct$1(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _isNativeReflectConstruct$1() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

var ShadowPass = function (_LayersPass) {
  _inherits(ShadowPass, _LayersPass);

  var _super = _createSuper$1(ShadowPass);

  function ShadowPass(gl, props) {
    var _parameters, _attachments;

    var _this;

    _classCallCheck(this, ShadowPass);

    _this = _super.call(this, gl, props);
    _this.shadowMap = new Texture2D(gl, {
      width: 1,
      height: 1,
      parameters: (_parameters = {}, _defineProperty(_parameters, 10241, 9729), _defineProperty(_parameters, 10240, 9729), _defineProperty(_parameters, 10242, 33071), _defineProperty(_parameters, 10243, 33071), _parameters)
    });
    _this.depthBuffer = new Renderbuffer(gl, {
      format: 33189,
      width: 1,
      height: 1
    });
    _this.fbo = new Framebuffer(gl, {
      id: 'shadowmap',
      width: 1,
      height: 1,
      attachments: (_attachments = {}, _defineProperty(_attachments, 36064, _this.shadowMap), _defineProperty(_attachments, 36096, _this.depthBuffer), _attachments)
    });
    return _this;
  }

  _createClass(ShadowPass, [{
    key: "render",
    value: function render(params) {
      var _this2 = this;

      var target = this.fbo;
      withParameters(this.gl, {
        depthRange: [0, 1],
        depthTest: true,
        blend: false,
        clearColor: [1, 1, 1, 1]
      }, function () {
        var viewport = params.viewports[0];
        var pixelRatio = cssToDeviceRatio(_this2.gl);
        var width = viewport.width * pixelRatio;
        var height = viewport.height * pixelRatio;

        if (width !== target.width || height !== target.height) {
          target.resize({
            width: width,
            height: height
          });
        }

        _get(_getPrototypeOf(ShadowPass.prototype), "render", _this2).call(_this2, _objectSpread(_objectSpread({}, params), {}, {
          target: target,
          pass: 'shadow'
        }));
      });
    }
  }, {
    key: "shouldDrawLayer",
    value: function shouldDrawLayer(layer) {
      return layer.props.shadowEnabled !== false;
    }
  }, {
    key: "getModuleParameters",
    value: function getModuleParameters() {
      return {
        drawToShadowMap: true
      };
    }
  }, {
    key: "delete",
    value: function _delete() {
      if (this.fbo) {
        this.fbo["delete"]();
        this.fbo = null;
      }

      if (this.shadowMap) {
        this.shadowMap["delete"]();
        this.shadowMap = null;
      }

      if (this.depthBuffer) {
        this.depthBuffer["delete"]();
        this.depthBuffer = null;
      }
    }
  }]);

  return ShadowPass;
}(LayersPass);

function _createForOfIteratorHelper$3(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray$3(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray$3(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray$3(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray$3(o, minLen); }

function _arrayLikeToArray$3(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _createSuper$2(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct$2(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _isNativeReflectConstruct$2() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }
var DEFAULT_AMBIENT_LIGHT_PROPS = {
  color: [255, 255, 255],
  intensity: 1.0
};
var DEFAULT_DIRECTIONAL_LIGHT_PROPS = [{
  color: [255, 255, 255],
  intensity: 1.0,
  direction: [-1, 3, -1]
}, {
  color: [255, 255, 255],
  intensity: 0.9,
  direction: [1, -8, -2.5]
}];
var DEFAULT_SHADOW_COLOR$1 = [0, 0, 0, 200 / 255];

var LightingEffect = function (_Effect) {
  _inherits(LightingEffect, _Effect);

  var _super = _createSuper$2(LightingEffect);

  function LightingEffect(props) {
    var _this;

    _classCallCheck(this, LightingEffect);

    _this = _super.call(this, props);
    _this.ambientLight = null;
    _this.directionalLights = [];
    _this.pointLights = [];
    _this.shadowColor = DEFAULT_SHADOW_COLOR$1;
    _this.shadowPasses = [];
    _this.shadowMaps = [];
    _this.dummyShadowMap = null;
    _this.shadow = false;
    _this.programManager = null;

    for (var key in props) {
      var lightSource = props[key];

      switch (lightSource.type) {
        case 'ambient':
          _this.ambientLight = lightSource;
          break;

        case 'directional':
          _this.directionalLights.push(lightSource);

          break;

        case 'point':
          _this.pointLights.push(lightSource);

          break;
      }
    }

    _this._applyDefaultLights();

    _this.shadow = _this.directionalLights.some(function (light) {
      return light.shadow;
    });
    return _this;
  }

  _createClass(LightingEffect, [{
    key: "preRender",
    value: function preRender(gl, _ref) {
      var layers = _ref.layers,
          layerFilter = _ref.layerFilter,
          viewports = _ref.viewports,
          onViewportActive = _ref.onViewportActive,
          views = _ref.views;
      if (!this.shadow) return;
      this.shadowMatrices = this._createLightMatrix();

      if (this.shadowPasses.length === 0) {
        this._createShadowPasses(gl);
      }

      if (!this.programManager) {
        this.programManager = ProgramManager.getDefaultProgramManager(gl);

        if (shadow) {
          this.programManager.addDefaultModule(shadow);
        }
      }

      if (!this.dummyShadowMap) {
        this.dummyShadowMap = new Texture2D(gl, {
          width: 1,
          height: 1
        });
      }

      for (var i = 0; i < this.shadowPasses.length; i++) {
        var shadowPass = this.shadowPasses[i];
        shadowPass.render({
          layers: layers,
          layerFilter: layerFilter,
          viewports: viewports,
          onViewportActive: onViewportActive,
          views: views,
          moduleParameters: {
            shadowLightId: i,
            dummyShadowMap: this.dummyShadowMap,
            shadowMatrices: this.shadowMatrices
          }
        });
      }
    }
  }, {
    key: "getModuleParameters",
    value: function getModuleParameters(layer) {
      var parameters = this.shadow ? {
        shadowMaps: this.shadowMaps,
        dummyShadowMap: this.dummyShadowMap,
        shadowColor: this.shadowColor,
        shadowMatrices: this.shadowMatrices
      } : {};
      parameters.lightSources = {
        ambientLight: this.ambientLight,
        directionalLights: this.directionalLights.map(function (directionalLight) {
          return directionalLight.getProjectedLight({
            layer: layer
          });
        }),
        pointLights: this.pointLights.map(function (pointLight) {
          return pointLight.getProjectedLight({
            layer: layer
          });
        })
      };
      return parameters;
    }
  }, {
    key: "cleanup",
    value: function cleanup() {
      var _iterator = _createForOfIteratorHelper$3(this.shadowPasses),
          _step;

      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var shadowPass = _step.value;
          shadowPass["delete"]();
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }

      this.shadowPasses.length = 0;
      this.shadowMaps.length = 0;

      if (this.dummyShadowMap) {
        this.dummyShadowMap["delete"]();
        this.dummyShadowMap = null;
      }

      if (this.shadow && this.programManager) {
        this.programManager.removeDefaultModule(shadow);
        this.programManager = null;
      }
    }
  }, {
    key: "_createLightMatrix",
    value: function _createLightMatrix() {
      var lightMatrices = [];

      var _iterator2 = _createForOfIteratorHelper$3(this.directionalLights),
          _step2;

      try {
        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
          var light = _step2.value;
          var viewMatrix = new Matrix4().lookAt({
            eye: new Vector3(light.direction).negate()
          });
          lightMatrices.push(viewMatrix);
        }
      } catch (err) {
        _iterator2.e(err);
      } finally {
        _iterator2.f();
      }

      return lightMatrices;
    }
  }, {
    key: "_createShadowPasses",
    value: function _createShadowPasses(gl) {
      for (var i = 0; i < this.directionalLights.length; i++) {
        var shadowPass = new ShadowPass(gl);
        this.shadowPasses[i] = shadowPass;
        this.shadowMaps[i] = shadowPass.shadowMap;
      }
    }
  }, {
    key: "_applyDefaultLights",
    value: function _applyDefaultLights() {
      var ambientLight = this.ambientLight,
          pointLights = this.pointLights,
          directionalLights = this.directionalLights;

      if (!ambientLight && pointLights.length === 0 && directionalLights.length === 0) {
        this.ambientLight = new AmbientLight(DEFAULT_AMBIENT_LIGHT_PROPS);
        this.directionalLights.push(new DirectionalLight(DEFAULT_DIRECTIONAL_LIGHT_PROPS[0]), new DirectionalLight(DEFAULT_DIRECTIONAL_LIGHT_PROPS[1]));
      }
    }
  }]);

  return LightingEffect;
}(Effect);

function _createForOfIteratorHelper$4(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray$4(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray$4(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray$4(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray$4(o, minLen); }

function _arrayLikeToArray$4(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

var Resource = function () {
  function Resource(id, data, context) {
    _classCallCheck(this, Resource);

    this.id = id;
    this.context = context;
    this._loadCount = 0;
    this._subscribers = new Set();
    this.setData(data);
  }

  _createClass(Resource, [{
    key: "subscribe",
    value: function subscribe(consumer) {
      this._subscribers.add(consumer);
    }
  }, {
    key: "unsubscribe",
    value: function unsubscribe(consumer) {
      this._subscribers["delete"](consumer);
    }
  }, {
    key: "inUse",
    value: function inUse() {
      return this._subscribers.size > 0;
    }
  }, {
    key: "delete",
    value: function _delete() {}
  }, {
    key: "getData",
    value: function getData() {
      var _this = this;

      return this.isLoaded ? this._error ? Promise.reject(this._error) : this._content : this._loader.then(function () {
        return _this.getData();
      });
    }
  }, {
    key: "setData",
    value: function setData(data, forceUpdate) {
      var _this2 = this;

      if (data === this._data && !forceUpdate) {
        return;
      }

      this._data = data;
      var loadCount = ++this._loadCount;
      var loader = data;

      if (typeof data === 'string') {
        loader = load(data);
      }

      if (loader instanceof Promise) {
        this.isLoaded = false;
        this._loader = loader.then(function (result) {
          if (_this2._loadCount === loadCount) {
            _this2.isLoaded = true;
            _this2._error = null;
            _this2._content = result;
          }
        })["catch"](function (error) {
          if (_this2._loadCount === loadCount) {
            _this2.isLoaded = true;
            _this2._error = error || true;
          }
        });
      } else {
        this.isLoaded = true;
        this._error = null;
        this._content = data;
      }

      var _iterator = _createForOfIteratorHelper$4(this._subscribers),
          _step;

      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var subscriber = _step.value;
          subscriber.onChange(this.getData());
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
    }
  }]);

  return Resource;
}();

var ResourceManager = function () {
  function ResourceManager(_ref) {
    var gl = _ref.gl,
        protocol = _ref.protocol;

    _classCallCheck(this, ResourceManager);

    this.protocol = protocol || 'resource://';
    this._context = {
      gl: gl,
      resourceManager: this
    };
    this._resources = {};
    this._consumers = {};
    this._pruneRequest = null;
  }

  _createClass(ResourceManager, [{
    key: "contains",
    value: function contains(resourceId) {
      if (resourceId.startsWith(this.protocol)) {
        return true;
      }

      return resourceId in this._resources;
    }
  }, {
    key: "add",
    value: function add(_ref2) {
      var resourceId = _ref2.resourceId,
          data = _ref2.data,
          _ref2$forceUpdate = _ref2.forceUpdate,
          forceUpdate = _ref2$forceUpdate === void 0 ? false : _ref2$forceUpdate,
          _ref2$persistent = _ref2.persistent,
          persistent = _ref2$persistent === void 0 ? true : _ref2$persistent;
      var res = this._resources[resourceId];

      if (res) {
        res.setData(data, forceUpdate);
      } else {
        res = new Resource(resourceId, data, this._context);
        this._resources[resourceId] = res;
      }

      res.persistent = persistent;
    }
  }, {
    key: "remove",
    value: function remove(resourceId) {
      var res = this._resources[resourceId];

      if (res) {
        res["delete"]();
        delete this._resources[resourceId];
      }
    }
  }, {
    key: "unsubscribe",
    value: function unsubscribe(_ref3) {
      var consumerId = _ref3.consumerId;
      var consumer = this._consumers[consumerId];

      if (consumer) {
        for (var requestId in consumer) {
          var request = consumer[requestId];

          if (request.resource) {
            request.resource.unsubscribe(request);
          }
        }

        delete this._consumers[consumerId];
        this.prune();
      }
    }
  }, {
    key: "subscribe",
    value: function subscribe(_ref4) {
      var resourceId = _ref4.resourceId,
          onChange = _ref4.onChange,
          consumerId = _ref4.consumerId,
          _ref4$requestId = _ref4.requestId,
          requestId = _ref4$requestId === void 0 ? 'default' : _ref4$requestId;
      var resources = this._resources,
          protocol = this.protocol;

      if (resourceId.startsWith(protocol)) {
        resourceId = resourceId.replace(protocol, '');

        if (!resources[resourceId]) {
          this.add({
            resourceId: resourceId,
            data: null,
            persistent: false
          });
        }
      }

      var res = resources[resourceId];

      this._track(consumerId, requestId, res, onChange);

      if (res) {
        return res.getData();
      }

      return undefined;
    }
  }, {
    key: "prune",
    value: function prune() {
      var _this = this;

      if (!this._pruneRequest) {
        this._pruneRequest = setTimeout(function () {
          return _this._prune();
        }, 0);
      }
    }
  }, {
    key: "finalize",
    value: function finalize() {
      for (var key in this._resources) {
        this._resources[key]["delete"]();
      }
    }
  }, {
    key: "_track",
    value: function _track(consumerId, requestId, resource, onChange) {
      var consumers = this._consumers;
      var consumer = consumers[consumerId] = consumers[consumerId] || {};
      var request = consumer[requestId] || {};

      if (request.resource) {
        request.resource.unsubscribe(request);
        request.resource = null;
        this.prune();
      }

      if (resource) {
        consumer[requestId] = request;
        request.onChange = onChange;
        request.resource = resource;
        resource.subscribe(request);
      }
    }
  }, {
    key: "_prune",
    value: function _prune() {
      this._pruneRequest = null;

      for (var _i = 0, _Object$keys = Object.keys(this._resources); _i < _Object$keys.length; _i++) {
        var key = _Object$keys[_i];
        var res = this._resources[key];

        if (!res.persistent && !res.inUse()) {
          res["delete"]();
          delete this._resources[key];
        }
      }
    }
  }]);

  return ResourceManager;
}();

function _createForOfIteratorHelper$5(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray$5(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray$5(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray$5(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray$5(o, minLen); }

function _arrayLikeToArray$5(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }
var TRACE_SET_LAYERS = 'layerManager.setLayers';
var TRACE_ACTIVATE_VIEWPORT = 'layerManager.activateViewport';
var INITIAL_CONTEXT = Object.seal({
  layerManager: null,
  resourceManager: null,
  deck: null,
  gl: null,
  stats: null,
  shaderCache: null,
  pickingFBO: null,
  mousePosition: null,
  userData: {}
});

var layerName = function layerName(layer) {
  return layer instanceof Layer ? "".concat(layer) : !layer ? 'null' : 'invalid';
};

var LayerManager = function () {
  function LayerManager(gl) {
    var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
        deck = _ref.deck,
        stats = _ref.stats,
        viewport = _ref.viewport,
        timeline = _ref.timeline;

    _classCallCheck(this, LayerManager);

    this.lastRenderedLayers = [];
    this.layers = [];
    this.resourceManager = new ResourceManager({
      gl: gl,
      protocol: 'deck://'
    });
    this.context = Object.assign({}, INITIAL_CONTEXT, {
      layerManager: this,
      gl: gl,
      deck: deck,
      programManager: gl && createProgramManager(gl),
      stats: stats || new Stats({
        id: 'deck.gl'
      }),
      viewport: viewport || new Viewport({
        id: 'DEFAULT-INITIAL-VIEWPORT'
      }),
      timeline: timeline || new Timeline(),
      resourceManager: this.resourceManager
    });
    this._needsRedraw = 'Initial render';
    this._needsUpdate = false;
    this._debug = false;
    this._onError = null;
    this.activateViewport = this.activateViewport.bind(this);
    Object.seal(this);
  }

  _createClass(LayerManager, [{
    key: "finalize",
    value: function finalize() {
      this.resourceManager.finalize();

      var _iterator = _createForOfIteratorHelper$5(this.layers),
          _step;

      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var layer = _step.value;

          this._finalizeLayer(layer);
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
    }
  }, {
    key: "needsRedraw",
    value: function needsRedraw() {
      var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {
        clearRedrawFlags: false
      };
      var redraw = this._needsRedraw;

      if (opts.clearRedrawFlags) {
        this._needsRedraw = false;
      }

      var _iterator2 = _createForOfIteratorHelper$5(this.layers),
          _step2;

      try {
        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
          var layer = _step2.value;
          var layerNeedsRedraw = layer.getNeedsRedraw(opts);
          redraw = redraw || layerNeedsRedraw;
        }
      } catch (err) {
        _iterator2.e(err);
      } finally {
        _iterator2.f();
      }

      return redraw;
    }
  }, {
    key: "needsUpdate",
    value: function needsUpdate() {
      return this._needsUpdate;
    }
  }, {
    key: "setNeedsRedraw",
    value: function setNeedsRedraw(reason) {
      this._needsRedraw = this._needsRedraw || reason;
    }
  }, {
    key: "setNeedsUpdate",
    value: function setNeedsUpdate(reason) {
      this._needsUpdate = this._needsUpdate || reason;
    }
  }, {
    key: "getLayers",
    value: function getLayers() {
      var _ref2 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          _ref2$layerIds = _ref2.layerIds,
          layerIds = _ref2$layerIds === void 0 ? null : _ref2$layerIds;

      return layerIds ? this.layers.filter(function (layer) {
        return layerIds.find(function (layerId) {
          return layer.id.indexOf(layerId) === 0;
        });
      }) : this.layers;
    }
  }, {
    key: "setProps",
    value: function setProps(props) {
      if ('debug' in props) {
        this._debug = props.debug;
      }

      if ('userData' in props) {
        this.context.userData = props.userData;
      }

      if ('layers' in props) {
        this.setLayers(props.layers);
      }

      if ('onError' in props) {
        this._onError = props.onError;
      }
    }
  }, {
    key: "setLayers",
    value: function setLayers(newLayers) {
      var forceUpdate = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      var shouldUpdate = forceUpdate || newLayers !== this.lastRenderedLayers;
      debug(TRACE_SET_LAYERS, this, shouldUpdate, newLayers);

      if (!shouldUpdate) {
        return this;
      }

      this.lastRenderedLayers = newLayers;
      newLayers = flatten(newLayers, Boolean);

      var _iterator3 = _createForOfIteratorHelper$5(newLayers),
          _step3;

      try {
        for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
          var layer = _step3.value;
          layer.context = this.context;
        }
      } catch (err) {
        _iterator3.e(err);
      } finally {
        _iterator3.f();
      }

      this._updateLayers(this.layers, newLayers);

      return this;
    }
  }, {
    key: "updateLayers",
    value: function updateLayers() {
      var reason = this.needsUpdate();

      if (reason) {
        this.setNeedsRedraw("updating layers: ".concat(reason));
        var forceUpdate = true;
        this.setLayers(this.lastRenderedLayers, forceUpdate);
      }
    }
  }, {
    key: "activateViewport",
    value: function activateViewport(viewport) {
      debug(TRACE_ACTIVATE_VIEWPORT, this, viewport);

      if (viewport) {
        this.context.viewport = viewport;
      }

      return this;
    }
  }, {
    key: "_handleError",
    value: function _handleError(stage, error, layer) {
      if (this._onError) {
        this._onError(error, layer);
      } else {
        log.error("error during ".concat(stage, " of ").concat(layerName(layer)), error)();
      }
    }
  }, {
    key: "_updateLayers",
    value: function _updateLayers(oldLayers, newLayers) {
      var oldLayerMap = {};

      var _iterator4 = _createForOfIteratorHelper$5(oldLayers),
          _step4;

      try {
        for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
          var oldLayer = _step4.value;

          if (oldLayerMap[oldLayer.id]) {
            log.warn("Multiple old layers with same id ".concat(layerName(oldLayer)))();
          } else {
            oldLayerMap[oldLayer.id] = oldLayer;
          }
        }
      } catch (err) {
        _iterator4.e(err);
      } finally {
        _iterator4.f();
      }

      var generatedLayers = [];

      this._updateSublayersRecursively(newLayers, oldLayerMap, generatedLayers);

      this._finalizeOldLayers(oldLayerMap);

      var needsUpdate = false;

      for (var _i = 0, _generatedLayers = generatedLayers; _i < _generatedLayers.length; _i++) {
        var layer = _generatedLayers[_i];

        if (layer.hasUniformTransition()) {
          needsUpdate = true;
          break;
        }
      }

      this._needsUpdate = needsUpdate;
      this.layers = generatedLayers;
    }
  }, {
    key: "_updateSublayersRecursively",
    value: function _updateSublayersRecursively(newLayers, oldLayerMap, generatedLayers) {
      var _iterator5 = _createForOfIteratorHelper$5(newLayers),
          _step5;

      try {
        for (_iterator5.s(); !(_step5 = _iterator5.n()).done;) {
          var newLayer = _step5.value;
          newLayer.context = this.context;
          var oldLayer = oldLayerMap[newLayer.id];

          if (oldLayer === null) {
            log.warn("Multiple new layers with same id ".concat(layerName(newLayer)))();
          }

          oldLayerMap[newLayer.id] = null;
          var sublayers = null;

          try {
            if (this._debug && oldLayer !== newLayer) {
              newLayer.validateProps();
            }

            if (!oldLayer) {
              this._initializeLayer(newLayer);
            } else {
              this._transferLayerState(oldLayer, newLayer);

              this._updateLayer(newLayer);
            }

            generatedLayers.push(newLayer);
            sublayers = newLayer.isComposite && newLayer.getSubLayers();
          } catch (err) {
            this._handleError('matching', err, newLayer);
          }

          if (sublayers) {
            this._updateSublayersRecursively(sublayers, oldLayerMap, generatedLayers);
          }
        }
      } catch (err) {
        _iterator5.e(err);
      } finally {
        _iterator5.f();
      }
    }
  }, {
    key: "_finalizeOldLayers",
    value: function _finalizeOldLayers(oldLayerMap) {
      for (var layerId in oldLayerMap) {
        var layer = oldLayerMap[layerId];

        if (layer) {
          this._finalizeLayer(layer);
        }
      }
    }
  }, {
    key: "_initializeLayer",
    value: function _initializeLayer(layer) {
      try {
        layer._initialize();

        layer.lifecycle = LIFECYCLE.INITIALIZED;
      } catch (err) {
        this._handleError('initialization', err, layer);
      }
    }
  }, {
    key: "_transferLayerState",
    value: function _transferLayerState(oldLayer, newLayer) {
      newLayer._transferState(oldLayer);

      newLayer.lifecycle = LIFECYCLE.MATCHED;

      if (newLayer !== oldLayer) {
        oldLayer.lifecycle = LIFECYCLE.AWAITING_GC;
      }
    }
  }, {
    key: "_updateLayer",
    value: function _updateLayer(layer) {
      try {
        layer._update();
      } catch (err) {
        this._handleError('update', err, layer);
      }
    }
  }, {
    key: "_finalizeLayer",
    value: function _finalizeLayer(layer) {
      this._needsRedraw = this._needsRedraw || "finalized ".concat(layerName(layer));
      layer.lifecycle = LIFECYCLE.AWAITING_FINALIZATION;

      try {
        layer._finalize();

        layer.lifecycle = LIFECYCLE.FINALIZED;
      } catch (err) {
        this._handleError('finalization', err, layer);
      }
    }
  }]);

  return LayerManager;
}();

function ownKeys$1(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread$1(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys$1(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys$1(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

var ViewManager = function () {
  function ViewManager() {
    var props = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, ViewManager);

    this.views = [];
    this.width = 100;
    this.height = 100;
    this.viewState = {};
    this.controllers = {};
    this.timeline = props.timeline;
    this._viewports = [];
    this._viewportMap = {};
    this._isUpdating = false;
    this._needsRedraw = 'Initial render';
    this._needsUpdate = true;
    this._eventManager = props.eventManager;
    this._eventCallbacks = {
      onViewStateChange: props.onViewStateChange,
      onInteractiveStateChange: props.onInteractiveStateChange
    };
    Object.seal(this);
    this.setProps(props);
  }

  _createClass(ViewManager, [{
    key: "finalize",
    value: function finalize() {
      for (var key in this.controllers) {
        if (this.controllers[key]) {
          this.controllers[key].finalize();
        }
      }

      this.controllers = {};
    }
  }, {
    key: "needsRedraw",
    value: function needsRedraw() {
      var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {
        clearRedrawFlags: false
      };
      var redraw = this._needsRedraw;

      if (opts.clearRedrawFlags) {
        this._needsRedraw = false;
      }

      return redraw;
    }
  }, {
    key: "setNeedsUpdate",
    value: function setNeedsUpdate(reason) {
      this._needsUpdate = this._needsUpdate || reason;
      this._needsRedraw = this._needsRedraw || reason;
    }
  }, {
    key: "updateViewStates",
    value: function updateViewStates() {
      for (var viewId in this.controllers) {
        var controller = this.controllers[viewId];

        if (controller) {
          controller.updateTransition();
        }
      }
    }
  }, {
    key: "getViewports",
    value: function getViewports(rect) {
      if (rect) {
        return this._viewports.filter(function (viewport) {
          return viewport.containsPixel(rect);
        });
      }

      return this._viewports;
    }
  }, {
    key: "getViews",
    value: function getViews() {
      var viewMap = {};
      this.views.forEach(function (view) {
        viewMap[view.id] = view;
      });
      return viewMap;
    }
  }, {
    key: "getView",
    value: function getView(viewOrViewId) {
      return typeof viewOrViewId === 'string' ? this.views.find(function (view) {
        return view.id === viewOrViewId;
      }) : viewOrViewId;
    }
  }, {
    key: "getViewState",
    value: function getViewState(viewId) {
      var view = this.getView(viewId);
      var viewState = view && this.viewState[view.getViewStateId()] || this.viewState;
      return view ? view.filterViewState(viewState) : viewState;
    }
  }, {
    key: "getViewport",
    value: function getViewport(viewId) {
      return this._viewportMap[viewId];
    }
  }, {
    key: "unproject",
    value: function unproject(xyz, opts) {
      var viewports = this.getViewports();
      var pixel = {
        x: xyz[0],
        y: xyz[1]
      };

      for (var i = viewports.length - 1; i >= 0; --i) {
        var viewport = viewports[i];

        if (viewport.containsPixel(pixel)) {
          var p = xyz.slice();
          p[0] -= viewport.x;
          p[1] -= viewport.y;
          return viewport.unproject(p, opts);
        }
      }

      return null;
    }
  }, {
    key: "setProps",
    value: function setProps(props) {
      if ('views' in props) {
        this._setViews(props.views);
      }

      if ('viewState' in props) {
        this._setViewState(props.viewState);
      }

      if ('width' in props || 'height' in props) {
        this._setSize(props.width, props.height);
      }

      if (!this._isUpdating) {
        this._update();
      }
    }
  }, {
    key: "_update",
    value: function _update() {
      this._isUpdating = true;

      if (this._needsUpdate) {
        this._needsUpdate = false;

        this._rebuildViewports();
      }

      if (this._needsUpdate) {
        this._needsUpdate = false;

        this._rebuildViewports();
      }

      this._isUpdating = false;
    }
  }, {
    key: "_setSize",
    value: function _setSize(width, height) {
      assert$2(Number.isFinite(width) && Number.isFinite(height));

      if (width !== this.width || height !== this.height) {
        this.width = width;
        this.height = height;
        this.setNeedsUpdate('Size changed');
      }
    }
  }, {
    key: "_setViews",
    value: function _setViews(views) {
      views = flatten(views, Boolean);

      var viewsChanged = this._diffViews(views, this.views);

      if (viewsChanged) {
        this.setNeedsUpdate('views changed');
      }

      this.views = views;
    }
  }, {
    key: "_setViewState",
    value: function _setViewState(viewState) {
      if (viewState) {
        var viewStateChanged = !deepEqual(viewState, this.viewState);

        if (viewStateChanged) {
          this.setNeedsUpdate('viewState changed');
        }

        this.viewState = viewState;
      } else {
        log.warn('missing `viewState` or `initialViewState`')();
      }
    }
  }, {
    key: "_onViewStateChange",
    value: function _onViewStateChange(viewId, event) {
      event.viewId = viewId;

      this._eventCallbacks.onViewStateChange(event);
    }
  }, {
    key: "_createController",
    value: function _createController(view, props) {
      var Controller = props.type;
      var controller = new Controller(_objectSpread$1({
        timeline: this.timeline,
        eventManager: this._eventManager,
        onViewStateChange: this._onViewStateChange.bind(this, props.id),
        onStateChange: this._eventCallbacks.onInteractiveStateChange,
        makeViewport: view._getViewport.bind(view)
      }, props));
      return controller;
    }
  }, {
    key: "_updateController",
    value: function _updateController(view, viewState, viewport, controller) {
      var controllerProps = view.controller;

      if (controllerProps) {
        controllerProps = _objectSpread$1(_objectSpread$1(_objectSpread$1(_objectSpread$1({}, viewState), view.props), controllerProps), {}, {
          id: view.id,
          x: viewport.x,
          y: viewport.y,
          width: viewport.width,
          height: viewport.height
        });

        if (controller) {
          controller.setProps(controllerProps);
        } else {
          controller = this._createController(view, controllerProps);
        }

        return controller;
      }

      return null;
    }
  }, {
    key: "_rebuildViewports",
    value: function _rebuildViewports() {
      var width = this.width,
          height = this.height,
          views = this.views;
      var oldControllers = this.controllers;
      this._viewports = [];
      this.controllers = {};

      for (var i = views.length; i--;) {
        var view = views[i];
        var viewState = this.getViewState(view);
        var viewport = view.makeViewport({
          width: width,
          height: height,
          viewState: viewState
        });
        this.controllers[view.id] = this._updateController(view, viewState, viewport, oldControllers[view.id]);

        this._viewports.unshift(viewport);
      }

      for (var id in oldControllers) {
        if (oldControllers[id] && !this.controllers[id]) {
          oldControllers[id].finalize();
        }
      }

      this._buildViewportMap();
    }
  }, {
    key: "_buildViewportMap",
    value: function _buildViewportMap() {
      var _this = this;

      this._viewportMap = {};

      this._viewports.forEach(function (viewport) {
        if (viewport.id) {
          _this._viewportMap[viewport.id] = _this._viewportMap[viewport.id] || viewport;
        }
      });
    }
  }, {
    key: "_diffViews",
    value: function _diffViews(newViews, oldViews) {
      if (newViews.length !== oldViews.length) {
        return true;
      }

      return newViews.some(function (_, i) {
        return !newViews[i].equals(oldViews[i]);
      });
    }
  }]);

  return ViewManager;
}();

function ownKeys$2(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread$2(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys$2(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys$2(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _createSuper$3(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct$3(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _isNativeReflectConstruct$3() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }
var PITCH_MOUSE_THRESHOLD = 5;
var PITCH_ACCEL = 1.2;
var LINEAR_TRANSITION_PROPS = {
  transitionDuration: 300,
  transitionEasing: function transitionEasing(t) {
    return t;
  },
  transitionInterpolator: new LinearInterpolator(),
  transitionInterruption: TRANSITION_EVENTS.BREAK
};
var NO_TRANSITION_PROPS = {
  transitionDuration: 0
};
var MAPBOX_LIMITS = {
  minZoom: 0,
  maxZoom: 20,
  minPitch: 0,
  maxPitch: 60
};
var DEFAULT_STATE = {
  pitch: 0,
  bearing: 0,
  altitude: 1.5
};
var MapState = function (_ViewState) {
  _inherits(MapState, _ViewState);

  var _super = _createSuper$3(MapState);

  function MapState() {
    var _this;

    var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        makeViewport = _ref.makeViewport,
        width = _ref.width,
        height = _ref.height,
        latitude = _ref.latitude,
        longitude = _ref.longitude,
        zoom = _ref.zoom,
        _ref$bearing = _ref.bearing,
        bearing = _ref$bearing === void 0 ? DEFAULT_STATE.bearing : _ref$bearing,
        _ref$pitch = _ref.pitch,
        pitch = _ref$pitch === void 0 ? DEFAULT_STATE.pitch : _ref$pitch,
        _ref$altitude = _ref.altitude,
        altitude = _ref$altitude === void 0 ? DEFAULT_STATE.altitude : _ref$altitude,
        _ref$maxZoom = _ref.maxZoom,
        maxZoom = _ref$maxZoom === void 0 ? MAPBOX_LIMITS.maxZoom : _ref$maxZoom,
        _ref$minZoom = _ref.minZoom,
        minZoom = _ref$minZoom === void 0 ? MAPBOX_LIMITS.minZoom : _ref$minZoom,
        _ref$maxPitch = _ref.maxPitch,
        maxPitch = _ref$maxPitch === void 0 ? MAPBOX_LIMITS.maxPitch : _ref$maxPitch,
        _ref$minPitch = _ref.minPitch,
        minPitch = _ref$minPitch === void 0 ? MAPBOX_LIMITS.minPitch : _ref$minPitch,
        startPanLngLat = _ref.startPanLngLat,
        startZoomLngLat = _ref.startZoomLngLat,
        startBearing = _ref.startBearing,
        startPitch = _ref.startPitch,
        startZoom = _ref.startZoom;

    _classCallCheck(this, MapState);

    assert$2(Number.isFinite(longitude), '`longitude` must be supplied');
    assert$2(Number.isFinite(latitude), '`latitude` must be supplied');
    assert$2(Number.isFinite(zoom), '`zoom` must be supplied');
    _this = _super.call(this, {
      width: width,
      height: height,
      latitude: latitude,
      longitude: longitude,
      zoom: zoom,
      bearing: bearing,
      pitch: pitch,
      altitude: altitude,
      maxZoom: maxZoom,
      minZoom: minZoom,
      maxPitch: maxPitch,
      minPitch: minPitch
    });
    _this._interactiveState = {
      startPanLngLat: startPanLngLat,
      startZoomLngLat: startZoomLngLat,
      startBearing: startBearing,
      startPitch: startPitch,
      startZoom: startZoom
    };
    _this.makeViewport = makeViewport;
    return _this;
  }

  _createClass(MapState, [{
    key: "getViewportProps",
    value: function getViewportProps() {
      return this._viewportProps;
    }
  }, {
    key: "getInteractiveState",
    value: function getInteractiveState() {
      return this._interactiveState;
    }
  }, {
    key: "panStart",
    value: function panStart(_ref2) {
      var pos = _ref2.pos;
      return this._getUpdatedState({
        startPanLngLat: this._unproject(pos)
      });
    }
  }, {
    key: "pan",
    value: function pan(_ref3) {
      var pos = _ref3.pos,
          startPos = _ref3.startPos;

      var startPanLngLat = this._interactiveState.startPanLngLat || this._unproject(startPos);

      if (!startPanLngLat) {
        return this;
      }

      var _this$_calculateNewLn = this._calculateNewLngLat({
        startPanLngLat: startPanLngLat,
        pos: pos
      }),
          _this$_calculateNewLn2 = _slicedToArray(_this$_calculateNewLn, 2),
          longitude = _this$_calculateNewLn2[0],
          latitude = _this$_calculateNewLn2[1];

      return this._getUpdatedState({
        longitude: longitude,
        latitude: latitude
      });
    }
  }, {
    key: "panEnd",
    value: function panEnd() {
      return this._getUpdatedState({
        startPanLngLat: null
      });
    }
  }, {
    key: "rotateStart",
    value: function rotateStart(_ref4) {
      var pos = _ref4.pos;
      return this._getUpdatedState({
        startBearing: this._viewportProps.bearing,
        startPitch: this._viewportProps.pitch
      });
    }
  }, {
    key: "rotate",
    value: function rotate(_ref5) {
      var _ref5$deltaScaleX = _ref5.deltaScaleX,
          deltaScaleX = _ref5$deltaScaleX === void 0 ? 0 : _ref5$deltaScaleX,
          _ref5$deltaScaleY = _ref5.deltaScaleY,
          deltaScaleY = _ref5$deltaScaleY === void 0 ? 0 : _ref5$deltaScaleY;
      var _this$_interactiveSta = this._interactiveState,
          startBearing = _this$_interactiveSta.startBearing,
          startPitch = _this$_interactiveSta.startPitch;

      if (!Number.isFinite(startBearing) || !Number.isFinite(startPitch)) {
        return this;
      }

      var _this$_calculateNewPi = this._calculateNewPitchAndBearing({
        deltaScaleX: deltaScaleX,
        deltaScaleY: deltaScaleY,
        startBearing: startBearing,
        startPitch: startPitch
      }),
          pitch = _this$_calculateNewPi.pitch,
          bearing = _this$_calculateNewPi.bearing;

      return this._getUpdatedState({
        bearing: bearing,
        pitch: pitch
      });
    }
  }, {
    key: "rotateEnd",
    value: function rotateEnd() {
      return this._getUpdatedState({
        startBearing: null,
        startPitch: null
      });
    }
  }, {
    key: "zoomStart",
    value: function zoomStart(_ref6) {
      var pos = _ref6.pos;
      return this._getUpdatedState({
        startZoomLngLat: this._unproject(pos),
        startZoom: this._viewportProps.zoom
      });
    }
  }, {
    key: "zoom",
    value: function zoom(_ref7) {
      var pos = _ref7.pos,
          startPos = _ref7.startPos,
          scale = _ref7.scale;
      var _this$_interactiveSta2 = this._interactiveState,
          startZoom = _this$_interactiveSta2.startZoom,
          startZoomLngLat = _this$_interactiveSta2.startZoomLngLat;

      if (!Number.isFinite(startZoom)) {
        startZoom = this._viewportProps.zoom;
        startZoomLngLat = this._unproject(startPos) || this._unproject(pos);
      }

      var zoom = this._calculateNewZoom({
        scale: scale,
        startZoom: startZoom
      });

      var zoomedViewport = this.makeViewport(_objectSpread$2(_objectSpread$2({}, this._viewportProps), {}, {
        zoom: zoom
      }));

      var _zoomedViewport$getMa = zoomedViewport.getMapCenterByLngLatPosition({
        lngLat: startZoomLngLat,
        pos: pos
      }),
          _zoomedViewport$getMa2 = _slicedToArray(_zoomedViewport$getMa, 2),
          longitude = _zoomedViewport$getMa2[0],
          latitude = _zoomedViewport$getMa2[1];

      return this._getUpdatedState({
        zoom: zoom,
        longitude: longitude,
        latitude: latitude
      });
    }
  }, {
    key: "zoomEnd",
    value: function zoomEnd() {
      return this._getUpdatedState({
        startZoomLngLat: null,
        startZoom: null
      });
    }
  }, {
    key: "zoomIn",
    value: function zoomIn() {
      return this._zoomFromCenter(2);
    }
  }, {
    key: "zoomOut",
    value: function zoomOut() {
      return this._zoomFromCenter(0.5);
    }
  }, {
    key: "moveLeft",
    value: function moveLeft() {
      return this._panFromCenter([100, 0]);
    }
  }, {
    key: "moveRight",
    value: function moveRight() {
      return this._panFromCenter([-100, 0]);
    }
  }, {
    key: "moveUp",
    value: function moveUp() {
      return this._panFromCenter([0, 100]);
    }
  }, {
    key: "moveDown",
    value: function moveDown() {
      return this._panFromCenter([0, -100]);
    }
  }, {
    key: "rotateLeft",
    value: function rotateLeft() {
      return this._getUpdatedState({
        bearing: this._viewportProps.bearing - 15
      });
    }
  }, {
    key: "rotateRight",
    value: function rotateRight() {
      return this._getUpdatedState({
        bearing: this._viewportProps.bearing + 15
      });
    }
  }, {
    key: "rotateUp",
    value: function rotateUp() {
      return this._getUpdatedState({
        pitch: this._viewportProps.pitch + 10
      });
    }
  }, {
    key: "rotateDown",
    value: function rotateDown() {
      return this._getUpdatedState({
        pitch: this._viewportProps.pitch - 10
      });
    }
  }, {
    key: "shortestPathFrom",
    value: function shortestPathFrom(viewState) {
      var fromProps = viewState.getViewportProps();
      var props = Object.assign({}, this._viewportProps);
      var bearing = props.bearing,
          longitude = props.longitude;

      if (Math.abs(bearing - fromProps.bearing) > 180) {
        props.bearing = bearing < 0 ? bearing + 360 : bearing - 360;
      }

      if (Math.abs(longitude - fromProps.longitude) > 180) {
        props.longitude = longitude < 0 ? longitude + 360 : longitude - 360;
      }

      return props;
    }
  }, {
    key: "_zoomFromCenter",
    value: function _zoomFromCenter(scale) {
      var _this$_viewportProps = this._viewportProps,
          width = _this$_viewportProps.width,
          height = _this$_viewportProps.height;
      return this.zoom({
        pos: [width / 2, height / 2],
        scale: scale
      });
    }
  }, {
    key: "_panFromCenter",
    value: function _panFromCenter(offset) {
      var _this$_viewportProps2 = this._viewportProps,
          width = _this$_viewportProps2.width,
          height = _this$_viewportProps2.height;
      return this.pan({
        startPos: [width / 2, height / 2],
        pos: [width / 2 + offset[0], height / 2 + offset[1]]
      });
    }
  }, {
    key: "_getUpdatedState",
    value: function _getUpdatedState(newProps) {
      return new this.constructor(_objectSpread$2(_objectSpread$2(_objectSpread$2({
        makeViewport: this.makeViewport
      }, this._viewportProps), this._interactiveState), newProps));
    }
  }, {
    key: "_applyConstraints",
    value: function _applyConstraints(props) {
      var maxZoom = props.maxZoom,
          minZoom = props.minZoom,
          zoom = props.zoom;
      props.zoom = clamp(zoom, minZoom, maxZoom);
      var maxPitch = props.maxPitch,
          minPitch = props.minPitch,
          pitch = props.pitch;
      props.pitch = clamp(pitch, minPitch, maxPitch);
      Object.assign(props, normalizeViewportProps(props));
      return props;
    }
  }, {
    key: "_unproject",
    value: function _unproject(pos) {
      var viewport = this.makeViewport(this._viewportProps);
      return pos && viewport.unproject(pos);
    }
  }, {
    key: "_calculateNewLngLat",
    value: function _calculateNewLngLat(_ref8) {
      var startPanLngLat = _ref8.startPanLngLat,
          pos = _ref8.pos;
      var viewport = this.makeViewport(this._viewportProps);
      return viewport.getMapCenterByLngLatPosition({
        lngLat: startPanLngLat,
        pos: pos
      });
    }
  }, {
    key: "_calculateNewZoom",
    value: function _calculateNewZoom(_ref9) {
      var scale = _ref9.scale,
          startZoom = _ref9.startZoom;
      var _this$_viewportProps3 = this._viewportProps,
          maxZoom = _this$_viewportProps3.maxZoom,
          minZoom = _this$_viewportProps3.minZoom;
      var zoom = startZoom + Math.log2(scale);
      return clamp(zoom, minZoom, maxZoom);
    }
  }, {
    key: "_calculateNewPitchAndBearing",
    value: function _calculateNewPitchAndBearing(_ref10) {
      var deltaScaleX = _ref10.deltaScaleX,
          deltaScaleY = _ref10.deltaScaleY,
          startBearing = _ref10.startBearing,
          startPitch = _ref10.startPitch;
      deltaScaleY = clamp(deltaScaleY, -1, 1);
      var _this$_viewportProps4 = this._viewportProps,
          minPitch = _this$_viewportProps4.minPitch,
          maxPitch = _this$_viewportProps4.maxPitch;
      var bearing = startBearing + 180 * deltaScaleX;
      var pitch = startPitch;

      if (deltaScaleY > 0) {
        pitch = startPitch + deltaScaleY * (maxPitch - startPitch);
      } else if (deltaScaleY < 0) {
        pitch = startPitch - deltaScaleY * (minPitch - startPitch);
      }

      return {
        pitch: pitch,
        bearing: bearing
      };
    }
  }]);

  return MapState;
}(ViewState);

var MapController = function (_Controller) {
  _inherits(MapController, _Controller);

  var _super2 = _createSuper$3(MapController);

  function MapController(props) {
    var _this2;

    _classCallCheck(this, MapController);

    _this2 = _super2.call(this, MapState, props);
    _this2.invertPan = true;
    return _this2;
  }

  _createClass(MapController, [{
    key: "_getTransitionProps",
    value: function _getTransitionProps() {
      return LINEAR_TRANSITION_PROPS;
    }
  }, {
    key: "_onPanRotate",
    value: function _onPanRotate(event) {
      if (!this.dragRotate) {
        return false;
      }

      var deltaX = event.deltaX,
          deltaY = event.deltaY;

      var _this$getCenter = this.getCenter(event),
          _this$getCenter2 = _slicedToArray(_this$getCenter, 2),
          centerY = _this$getCenter2[1];

      var startY = centerY - deltaY;

      var _this$controllerState = this.controllerState.getViewportProps(),
          width = _this$controllerState.width,
          height = _this$controllerState.height;

      var deltaScaleX = deltaX / width;
      var deltaScaleY = 0;

      if (deltaY > 0) {
        if (Math.abs(height - startY) > PITCH_MOUSE_THRESHOLD) {
          deltaScaleY = deltaY / (startY - height) * PITCH_ACCEL;
        }
      } else if (deltaY < 0) {
        if (startY > PITCH_MOUSE_THRESHOLD) {
          deltaScaleY = 1 - centerY / startY;
        }
      }

      deltaScaleY = Math.min(1, Math.max(-1, deltaScaleY));
      var newControllerState = this.controllerState.rotate({
        deltaScaleX: deltaScaleX,
        deltaScaleY: deltaScaleY
      });
      return this.updateViewport(newControllerState, NO_TRANSITION_PROPS, {
        isDragging: true,
        isRotating: true
      });
    }
  }]);

  return MapController;
}(Controller);

function _createSuper$4(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct$4(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _isNativeReflectConstruct$4() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

var MapView = function (_View) {
  _inherits(MapView, _View);

  var _super = _createSuper$4(MapView);

  function MapView(props) {
    _classCallCheck(this, MapView);

    return _super.call(this, Object.assign({}, props, {
      type: WebMercatorViewport$1
    }));
  }

  _createClass(MapView, [{
    key: "controller",
    get: function get() {
      return this._getControllerProps({
        type: MapController
      });
    }
  }]);

  return MapView;
}(View);
MapView.displayName = 'MapView';

function _createForOfIteratorHelper$6(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray$6(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray$6(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray$6(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray$6(o, minLen); }

function _arrayLikeToArray$6(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }
var DEFAULT_LIGHTING_EFFECT = new LightingEffect();

var EffectManager = function () {
  function EffectManager() {
    _classCallCheck(this, EffectManager);

    this.effects = [];
    this._internalEffects = [];
    this._needsRedraw = 'Initial render';
    this.setEffects();
  }

  _createClass(EffectManager, [{
    key: "setProps",
    value: function setProps(props) {
      if ('effects' in props) {
        if (props.effects.length !== this.effects.length || !deepEqual(props.effects, this.effects)) {
          this.setEffects(props.effects);
          this._needsRedraw = 'effects changed';
        }
      }
    }
  }, {
    key: "needsRedraw",
    value: function needsRedraw() {
      var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {
        clearRedrawFlags: false
      };
      var redraw = this._needsRedraw;

      if (opts.clearRedrawFlags) {
        this._needsRedraw = false;
      }

      return redraw;
    }
  }, {
    key: "getEffects",
    value: function getEffects() {
      return this._internalEffects;
    }
  }, {
    key: "finalize",
    value: function finalize() {
      this.cleanup();
    }
  }, {
    key: "setEffects",
    value: function setEffects() {
      var effects = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
      this.cleanup();
      this.effects = effects;

      this._createInternalEffects();
    }
  }, {
    key: "cleanup",
    value: function cleanup() {
      var _iterator = _createForOfIteratorHelper$6(this.effects),
          _step;

      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var effect = _step.value;
          effect.cleanup();
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }

      var _iterator2 = _createForOfIteratorHelper$6(this._internalEffects),
          _step2;

      try {
        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
          var _effect = _step2.value;

          _effect.cleanup();
        }
      } catch (err) {
        _iterator2.e(err);
      } finally {
        _iterator2.f();
      }

      this.effects.length = 0;
      this._internalEffects.length = 0;
    }
  }, {
    key: "_createInternalEffects",
    value: function _createInternalEffects() {
      this._internalEffects = this.effects.slice();

      if (!this.effects.some(function (effect) {
        return effect instanceof LightingEffect;
      })) {
        this._internalEffects.push(DEFAULT_LIGHTING_EFFECT);
      }
    }
  }]);

  return EffectManager;
}();

function _createSuper$5(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct$5(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _isNativeReflectConstruct$5() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

var DrawLayersPass = function (_LayersPass) {
  _inherits(DrawLayersPass, _LayersPass);

  var _super = _createSuper$5(DrawLayersPass);

  function DrawLayersPass() {
    _classCallCheck(this, DrawLayersPass);

    return _super.apply(this, arguments);
  }

  return DrawLayersPass;
}(LayersPass);

function ownKeys$3(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread$3(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys$3(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys$3(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _createSuper$6(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct$6(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _isNativeReflectConstruct$6() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }
var PICKING_PARAMETERS = {
  blendFunc: [1, 0, 32771, 0],
  blendEquation: 32774
};

var PickLayersPass = function (_LayersPass) {
  _inherits(PickLayersPass, _LayersPass);

  var _super = _createSuper$6(PickLayersPass);

  function PickLayersPass() {
    _classCallCheck(this, PickLayersPass);

    return _super.apply(this, arguments);
  }

  _createClass(PickLayersPass, [{
    key: "render",
    value: function render(props) {
      if (props.pickingFBO) {
        this._drawPickingBuffer(props);
      } else {
        _get(_getPrototypeOf(PickLayersPass.prototype), "render", this).call(this, props);
      }
    }
  }, {
    key: "_drawPickingBuffer",
    value: function _drawPickingBuffer(_ref) {
      var _this = this;

      var layers = _ref.layers,
          layerFilter = _ref.layerFilter,
          views = _ref.views,
          viewports = _ref.viewports,
          onViewportActive = _ref.onViewportActive,
          pickingFBO = _ref.pickingFBO,
          _ref$deviceRect = _ref.deviceRect,
          x = _ref$deviceRect.x,
          y = _ref$deviceRect.y,
          width = _ref$deviceRect.width,
          height = _ref$deviceRect.height,
          _ref$pass = _ref.pass,
          pass = _ref$pass === void 0 ? 'picking' : _ref$pass,
          redrawReason = _ref.redrawReason,
          pickZ = _ref.pickZ;
      var gl = this.gl;
      this.pickZ = pickZ;
      return withParameters(gl, _objectSpread$3(_objectSpread$3({
        scissorTest: true,
        scissor: [x, y, width, height],
        clearColor: [0, 0, 0, 0],
        depthMask: true,
        depthTest: true,
        depthRange: [0, 1],
        colorMask: [true, true, true, true]
      }, PICKING_PARAMETERS), {}, {
        blend: !pickZ
      }), function () {
        _get(_getPrototypeOf(PickLayersPass.prototype), "render", _this).call(_this, {
          target: pickingFBO,
          layers: layers,
          layerFilter: layerFilter,
          views: views,
          viewports: viewports,
          onViewportActive: onViewportActive,
          pass: pass,
          redrawReason: redrawReason
        });
      });
    }
  }, {
    key: "shouldDrawLayer",
    value: function shouldDrawLayer(layer) {
      return layer.props.pickable;
    }
  }, {
    key: "getModuleParameters",
    value: function getModuleParameters() {
      return {
        pickingActive: 1,
        pickingAttribute: this.pickZ,
        lightSources: {}
      };
    }
  }, {
    key: "getLayerParameters",
    value: function getLayerParameters(layer, layerIndex) {
      var pickParameters = this.pickZ ? {
        blend: false
      } : _objectSpread$3(_objectSpread$3({}, PICKING_PARAMETERS), {}, {
        blend: true,
        blendColor: [0, 0, 0, (layerIndex + 1) / 255]
      });
      return Object.assign({}, layer.props.parameters, pickParameters);
    }
  }]);

  return PickLayersPass;
}(LayersPass);

function _createForOfIteratorHelper$7(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray$7(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray$7(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray$7(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray$7(o, minLen); }

function _arrayLikeToArray$7(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function ownKeys$4(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread$4(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys$4(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys$4(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }
var TRACE_RENDER_LAYERS = 'deckRenderer.renderLayers';

var DeckRenderer = function () {
  function DeckRenderer(gl) {
    _classCallCheck(this, DeckRenderer);

    this.gl = gl;
    this.layerFilter = null;
    this.drawPickingColors = false;
    this.drawLayersPass = new DrawLayersPass(gl);
    this.pickLayersPass = new PickLayersPass(gl);
    this.renderCount = 0;
    this._needsRedraw = 'Initial render';
    this.renderBuffers = [];
    this.lastPostProcessEffect = null;
    this._onError = null;
  }

  _createClass(DeckRenderer, [{
    key: "setProps",
    value: function setProps(props) {
      if ('layerFilter' in props && this.layerFilter !== props.layerFilter) {
        this.layerFilter = props.layerFilter;
        this._needsRedraw = 'layerFilter changed';
      }

      if ('drawPickingColors' in props && this.drawPickingColors !== props.drawPickingColors) {
        this.drawPickingColors = props.drawPickingColors;
        this._needsRedraw = 'drawPickingColors changed';
      }

      if ('onError' in props) {
        this._onError = props.onError;
      }
    }
  }, {
    key: "renderLayers",
    value: function renderLayers(opts) {
      var layerPass = this.drawPickingColors ? this.pickLayersPass : this.drawLayersPass;
      opts.layerFilter = this.layerFilter;
      opts.onError = this._onError;
      opts.effects = opts.effects || [];
      opts.target = opts.target || Framebuffer.getDefaultFramebuffer(this.gl);

      this._preRender(opts.effects, opts);

      var outputBuffer = this.lastPostProcessEffect ? this.renderBuffers[0] : opts.target;
      var renderStats = layerPass.render(_objectSpread$4(_objectSpread$4({}, opts), {}, {
        target: outputBuffer
      }));

      this._postRender(opts.effects, opts);

      this.renderCount++;
      debug(TRACE_RENDER_LAYERS, this, renderStats, opts);
    }
  }, {
    key: "needsRedraw",
    value: function needsRedraw() {
      var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {
        clearRedrawFlags: false
      };
      var redraw = this._needsRedraw;

      if (opts.clearRedrawFlags) {
        this._needsRedraw = false;
      }

      return redraw;
    }
  }, {
    key: "finalize",
    value: function finalize() {
      var renderBuffers = this.renderBuffers;

      var _iterator = _createForOfIteratorHelper$7(renderBuffers),
          _step;

      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var buffer = _step.value;
          buffer["delete"]();
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }

      renderBuffers.length = 0;
    }
  }, {
    key: "_preRender",
    value: function _preRender(effects, opts) {
      var lastPostProcessEffect = null;

      var _iterator2 = _createForOfIteratorHelper$7(effects),
          _step2;

      try {
        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
          var effect = _step2.value;
          effect.preRender(this.gl, opts);

          if (effect.postRender) {
            lastPostProcessEffect = effect;
          }
        }
      } catch (err) {
        _iterator2.e(err);
      } finally {
        _iterator2.f();
      }

      if (lastPostProcessEffect) {
        this._resizeRenderBuffers();
      }

      this.lastPostProcessEffect = lastPostProcessEffect;
    }
  }, {
    key: "_resizeRenderBuffers",
    value: function _resizeRenderBuffers() {
      var renderBuffers = this.renderBuffers;

      if (renderBuffers.length === 0) {
        renderBuffers.push(new Framebuffer(this.gl), new Framebuffer(this.gl));
      }

      var _iterator3 = _createForOfIteratorHelper$7(renderBuffers),
          _step3;

      try {
        for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
          var buffer = _step3.value;
          buffer.resize();
        }
      } catch (err) {
        _iterator3.e(err);
      } finally {
        _iterator3.f();
      }
    }
  }, {
    key: "_postRender",
    value: function _postRender(effects, opts) {
      var renderBuffers = this.renderBuffers;
      var params = {
        inputBuffer: renderBuffers[0],
        swapBuffer: renderBuffers[1],
        target: null
      };

      var _iterator4 = _createForOfIteratorHelper$7(effects),
          _step4;

      try {
        for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
          var effect = _step4.value;

          if (effect.postRender) {
            if (effect === this.lastPostProcessEffect) {
              params.target = opts.target;
              effect.postRender(this.gl, params);
              break;
            }

            var buffer = effect.postRender(this.gl, params);
            params.inputBuffer = buffer;
            params.swapBuffer = buffer === renderBuffers[0] ? renderBuffers[1] : renderBuffers[0];
          }
        }
      } catch (err) {
        _iterator4.e(err);
      } finally {
        _iterator4.f();
      }
    }
  }]);

  return DeckRenderer;
}();

var NO_PICKED_OBJECT = {
  pickedColor: null,
  pickedLayer: null,
  pickedObjectIndex: -1
};
function getClosestObject(_ref) {
  var pickedColors = _ref.pickedColors,
      layers = _ref.layers,
      deviceX = _ref.deviceX,
      deviceY = _ref.deviceY,
      deviceRadius = _ref.deviceRadius,
      deviceRect = _ref.deviceRect;

  if (pickedColors) {
    var x = deviceRect.x,
        y = deviceRect.y,
        width = deviceRect.width,
        height = deviceRect.height;
    var minSquareDistanceToCenter = deviceRadius * deviceRadius;
    var closestPixelIndex = -1;
    var i = 0;

    for (var row = 0; row < height; row++) {
      var dy = row + y - deviceY;
      var dy2 = dy * dy;

      if (dy2 > minSquareDistanceToCenter) {
        i += 4 * width;
      } else {
        for (var col = 0; col < width; col++) {
          var pickedLayerIndex = pickedColors[i + 3] - 1;

          if (pickedLayerIndex >= 0) {
            var dx = col + x - deviceX;
            var d2 = dx * dx + dy2;

            if (d2 <= minSquareDistanceToCenter) {
              minSquareDistanceToCenter = d2;
              closestPixelIndex = i;
            }
          }

          i += 4;
        }
      }
    }

    if (closestPixelIndex >= 0) {
      var _pickedLayerIndex = pickedColors[closestPixelIndex + 3] - 1;

      var pickedColor = pickedColors.slice(closestPixelIndex, closestPixelIndex + 4);
      var pickedLayer = layers[_pickedLayerIndex];

      if (pickedLayer) {
        var pickedObjectIndex = pickedLayer.decodePickingColor(pickedColor);

        var _dy = Math.floor(closestPixelIndex / 4 / width);

        var _dx = closestPixelIndex / 4 - _dy * width;

        return {
          pickedColor: pickedColor,
          pickedLayer: pickedLayer,
          pickedObjectIndex: pickedObjectIndex,
          pickedX: x + _dx,
          pickedY: y + _dy
        };
      }

      log.error('Picked non-existent layer. Is picking buffer corrupt?')();
    }
  }

  return NO_PICKED_OBJECT;
}
function getUniqueObjects(_ref2) {
  var pickedColors = _ref2.pickedColors,
      layers = _ref2.layers;
  var uniqueColors = new Map();

  if (pickedColors) {
    for (var i = 0; i < pickedColors.length; i += 4) {
      var pickedLayerIndex = pickedColors[i + 3] - 1;

      if (pickedLayerIndex >= 0) {
        var pickedColor = pickedColors.slice(i, i + 4);
        var colorKey = pickedColor.join(',');

        if (!uniqueColors.has(colorKey)) {
          var pickedLayer = layers[pickedLayerIndex];

          if (pickedLayer) {
            uniqueColors.set(colorKey, {
              pickedColor: pickedColor,
              pickedLayer: pickedLayer,
              pickedObjectIndex: pickedLayer.decodePickingColor(pickedColor)
            });
          } else {
            log.error('Picked non-existent layer. Is picking buffer corrupt?')();
          }
        }
      }
    }
  }

  return Array.from(uniqueColors.values());
}

function getEmptyPickingInfo(_ref) {
  var pickInfo = _ref.pickInfo,
      viewports = _ref.viewports,
      pixelRatio = _ref.pixelRatio,
      x = _ref.x,
      y = _ref.y,
      z = _ref.z;
  var viewport = getViewportFromCoordinates({
    viewports: viewports
  });
  var coordinate = viewport && viewport.unproject([x - viewport.x, y - viewport.y], {
    targetZ: z
  });
  return {
    color: null,
    layer: null,
    index: -1,
    picked: false,
    x: x,
    y: y,
    pixel: [x, y],
    coordinate: coordinate,
    lngLat: coordinate,
    devicePixel: pickInfo && [pickInfo.pickedX, pickInfo.pickedY],
    pixelRatio: pixelRatio
  };
}
function processPickInfo(opts) {
  var pickInfo = opts.pickInfo,
      lastPickedInfo = opts.lastPickedInfo,
      mode = opts.mode,
      layers = opts.layers;
  var pickedColor = pickInfo.pickedColor,
      pickedLayer = pickInfo.pickedLayer,
      pickedObjectIndex = pickInfo.pickedObjectIndex;
  var affectedLayers = pickedLayer ? [pickedLayer] : [];

  if (mode === 'hover') {
    var lastPickedObjectIndex = lastPickedInfo.index;
    var lastPickedLayerId = lastPickedInfo.layerId;
    var pickedLayerId = pickedLayer && pickedLayer.props.id;

    if (pickedLayerId !== lastPickedLayerId || pickedObjectIndex !== lastPickedObjectIndex) {
      if (pickedLayerId !== lastPickedLayerId) {
        var lastPickedLayer = layers.find(function (layer) {
          return layer.props.id === lastPickedLayerId;
        });

        if (lastPickedLayer) {
          affectedLayers.unshift(lastPickedLayer);
        }
      }

      lastPickedInfo.layerId = pickedLayerId;
      lastPickedInfo.index = pickedObjectIndex;
      lastPickedInfo.info = null;
    }
  }

  var baseInfo = getEmptyPickingInfo(opts);
  var infos = new Map();
  infos.set(null, baseInfo);
  affectedLayers.forEach(function (layer) {
    var info = Object.assign({}, baseInfo);

    if (layer === pickedLayer) {
      info.color = pickedColor;
      info.index = pickedObjectIndex;
      info.picked = true;
    }

    info = getLayerPickingInfo({
      layer: layer,
      info: info,
      mode: mode
    });

    if (layer === pickedLayer && mode === 'hover') {
      lastPickedInfo.info = info;
    }

    if (info) {
      infos.set(info.layer.id, info);
    }

    if (mode === 'hover' && layer.props.autoHighlight) {
      var pickingModuleParameters = {
        pickingSelectedColor: pickedLayer === layer ? pickedColor : null
      };
      var highlightColor = layer.props.highlightColor;

      if (pickedLayer === layer && typeof highlightColor === 'function') {
        pickingModuleParameters.pickingHighlightColor = highlightColor(info);
      }

      layer.setModuleParameters(pickingModuleParameters);
      layer.setNeedsRedraw();
    }
  });
  return infos;
}
function getLayerPickingInfo(_ref2) {
  var layer = _ref2.layer,
      info = _ref2.info,
      mode = _ref2.mode;

  while (layer && info) {
    var sourceLayer = info.layer || layer;
    info.layer = layer;
    info = layer.getPickingInfo({
      info: info,
      mode: mode,
      sourceLayer: sourceLayer
    });
    layer = layer.parent;
  }

  return info;
}

function getViewportFromCoordinates(_ref3) {
  var viewports = _ref3.viewports;
  var viewport = viewports[0];
  return viewport;
}

function _createForOfIteratorHelper$8(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray$8(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray$8(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray$8(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray$8(o, minLen); }

function _arrayLikeToArray$8(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

var DeckPicker = function () {
  function DeckPicker(gl) {
    _classCallCheck(this, DeckPicker);

    this.gl = gl;
    this.pickingFBO = null;
    this.pickLayersPass = new PickLayersPass(gl);
    this.layerFilter = null;
    this.lastPickedInfo = {
      index: -1,
      layerId: null,
      info: null
    };
    this._onError = null;
  }

  _createClass(DeckPicker, [{
    key: "setProps",
    value: function setProps(props) {
      if ('layerFilter' in props) {
        this.layerFilter = props.layerFilter;
      }

      if ('onError' in props) {
        this._onError = props.onError;
      }

      if ('_pickable' in props) {
        this._pickable = props._pickable;
      }
    }
  }, {
    key: "finalize",
    value: function finalize() {
      if (this.pickingFBO) {
        this.pickingFBO["delete"]();
      }

      if (this.depthFBO) {
        this.depthFBO.color["delete"]();
        this.depthFBO["delete"]();
      }
    }
  }, {
    key: "pickObject",
    value: function pickObject(opts) {
      return this._pickClosestObject(opts);
    }
  }, {
    key: "pickObjects",
    value: function pickObjects(opts) {
      return this._pickVisibleObjects(opts);
    }
  }, {
    key: "getLastPickedObject",
    value: function getLastPickedObject(_ref) {
      var x = _ref.x,
          y = _ref.y,
          layers = _ref.layers,
          viewports = _ref.viewports;
      var lastPickedInfo = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.lastPickedInfo.info;
      var lastPickedLayerId = lastPickedInfo && lastPickedInfo.layer && lastPickedInfo.layer.id;
      var layer = lastPickedLayerId ? layers.find(function (l) {
        return l.id === lastPickedLayerId;
      }) : null;
      var coordinate = viewports[0] && viewports[0].unproject([x, y]);
      var info = {
        x: x,
        y: y,
        coordinate: coordinate,
        lngLat: coordinate,
        layer: layer
      };

      if (layer) {
        return Object.assign({}, lastPickedInfo, info);
      }

      return Object.assign(info, {
        color: null,
        object: null,
        index: -1
      });
    }
  }, {
    key: "_resizeBuffer",
    value: function _resizeBuffer() {
      var gl = this.gl;

      if (!this.pickingFBO) {
        this.pickingFBO = new Framebuffer(gl);

        if (Framebuffer.isSupported(gl, {
          colorBufferFloat: true
        })) {
          this.depthFBO = new Framebuffer(gl);
          this.depthFBO.attach(_defineProperty({}, 36064, new Texture2D(gl, {
            format: isWebGL2(gl) ? 34836 : 6408,
            type: 5126
          })));
        }
      }

      this.pickingFBO.resize({
        width: gl.canvas.width,
        height: gl.canvas.height
      });

      if (this.depthFBO) {
        this.depthFBO.resize({
          width: gl.canvas.width,
          height: gl.canvas.height
        });
      }

      return this.pickingFBO;
    }
  }, {
    key: "_getPickable",
    value: function _getPickable(layers) {
      if (this._pickable === false) {
        return null;
      }

      var pickableLayers = layers.filter(function (layer) {
        return layer.isPickable() && !layer.isComposite;
      });

      if (pickableLayers.length > 255) {
        log.warn('Too many pickable layers, only picking the first 255')();
        return pickableLayers.slice(0, 255);
      }

      return pickableLayers.length ? pickableLayers : null;
    }
  }, {
    key: "_pickClosestObject",
    value: function _pickClosestObject(_ref2) {
      var layers = _ref2.layers,
          views = _ref2.views,
          viewports = _ref2.viewports,
          x = _ref2.x,
          y = _ref2.y,
          _ref2$radius = _ref2.radius,
          radius = _ref2$radius === void 0 ? 0 : _ref2$radius,
          _ref2$depth = _ref2.depth,
          depth = _ref2$depth === void 0 ? 1 : _ref2$depth,
          _ref2$mode = _ref2.mode,
          mode = _ref2$mode === void 0 ? 'query' : _ref2$mode,
          unproject3D = _ref2.unproject3D,
          onViewportActive = _ref2.onViewportActive;
      layers = this._getPickable(layers);

      if (!layers) {
        return {
          result: [],
          emptyInfo: getEmptyPickingInfo({
            viewports: viewports,
            x: x,
            y: y
          })
        };
      }

      this._resizeBuffer();

      var pixelRatio = cssToDeviceRatio(this.gl);
      var devicePixelRange = cssToDevicePixels(this.gl, [x, y], true);
      var devicePixel = [devicePixelRange.x + Math.floor(devicePixelRange.width / 2), devicePixelRange.y + Math.floor(devicePixelRange.height / 2)];
      var deviceRadius = Math.round(radius * pixelRatio);
      var _this$pickingFBO = this.pickingFBO,
          width = _this$pickingFBO.width,
          height = _this$pickingFBO.height;

      var deviceRect = this._getPickingRect({
        deviceX: devicePixel[0],
        deviceY: devicePixel[1],
        deviceRadius: deviceRadius,
        deviceWidth: width,
        deviceHeight: height
      });

      var infos;
      var result = [];
      var affectedLayers = {};

      for (var i = 0; i < depth; i++) {
        var pickedColors = deviceRect && this._drawAndSample({
          layers: layers,
          views: views,
          viewports: viewports,
          onViewportActive: onViewportActive,
          deviceRect: deviceRect,
          pass: "picking:".concat(mode),
          redrawReason: mode
        });

        var pickInfo = getClosestObject({
          pickedColors: pickedColors,
          layers: layers,
          deviceX: devicePixel[0],
          deviceY: devicePixel[1],
          deviceRadius: deviceRadius,
          deviceRect: deviceRect
        });
        var z = void 0;

        if (pickInfo.pickedLayer && unproject3D && this.depthFBO) {
          var zValues = this._drawAndSample({
            layers: [pickInfo.pickedLayer],
            views: views,
            viewports: viewports,
            onViewportActive: onViewportActive,
            deviceRect: {
              x: pickInfo.pickedX,
              y: pickInfo.pickedY,
              width: 1,
              height: 1
            },
            pass: "picking:".concat(mode),
            redrawReason: 'pick-z',
            pickZ: true
          });

          z = zValues[0] * viewports[0].distanceScales.metersPerUnit[2] + viewports[0].position[2];
        }

        if (pickInfo.pickedColor && i + 1 < depth) {
          var layerId = pickInfo.pickedColor[3] - 1;
          affectedLayers[layerId] = true;
          layers[layerId].clearPickingColor(pickInfo.pickedColor);
        }

        infos = processPickInfo({
          pickInfo: pickInfo,
          lastPickedInfo: this.lastPickedInfo,
          mode: mode,
          layers: layers,
          viewports: viewports,
          x: x,
          y: y,
          z: z,
          pixelRatio: pixelRatio
        });

        var _iterator = _createForOfIteratorHelper$8(infos.values()),
            _step;

        try {
          for (_iterator.s(); !(_step = _iterator.n()).done;) {
            var info = _step.value;

            if (info.layer) {
              result.push(info);
            }
          }
        } catch (err) {
          _iterator.e(err);
        } finally {
          _iterator.f();
        }

        if (!pickInfo.pickedColor) {
          break;
        }
      }

      for (var _layerId in affectedLayers) {
        layers[_layerId].restorePickingColors();
      }

      return {
        result: result,
        emptyInfo: infos && infos.get(null)
      };
    }
  }, {
    key: "_pickVisibleObjects",
    value: function _pickVisibleObjects(_ref3) {
      var layers = _ref3.layers,
          views = _ref3.views,
          viewports = _ref3.viewports,
          x = _ref3.x,
          y = _ref3.y,
          _ref3$width = _ref3.width,
          width = _ref3$width === void 0 ? 1 : _ref3$width,
          _ref3$height = _ref3.height,
          height = _ref3$height === void 0 ? 1 : _ref3$height,
          _ref3$mode = _ref3.mode,
          mode = _ref3$mode === void 0 ? 'query' : _ref3$mode,
          onViewportActive = _ref3.onViewportActive;
      layers = this._getPickable(layers);

      if (!layers) {
        return [];
      }

      this._resizeBuffer();

      var pixelRatio = cssToDeviceRatio(this.gl);
      var leftTop = cssToDevicePixels(this.gl, [x, y], true);
      var deviceLeft = leftTop.x;
      var deviceTop = leftTop.y + leftTop.height;
      var rightBottom = cssToDevicePixels(this.gl, [x + width, y + height], true);
      var deviceRight = rightBottom.x + rightBottom.width;
      var deviceBottom = rightBottom.y;
      var deviceRect = {
        x: deviceLeft,
        y: deviceBottom,
        width: deviceRight - deviceLeft,
        height: deviceTop - deviceBottom
      };

      var pickedColors = this._drawAndSample({
        layers: layers,
        views: views,
        viewports: viewports,
        onViewportActive: onViewportActive,
        deviceRect: deviceRect,
        pass: "picking:".concat(mode),
        redrawReason: mode
      });

      var pickInfos = getUniqueObjects({
        pickedColors: pickedColors,
        layers: layers
      });
      var uniqueInfos = new Map();
      pickInfos.forEach(function (pickInfo) {
        var info = {
          color: pickInfo.pickedColor,
          layer: null,
          index: pickInfo.pickedObjectIndex,
          picked: true,
          x: x,
          y: y,
          width: width,
          height: height,
          pixelRatio: pixelRatio
        };
        info = getLayerPickingInfo({
          layer: pickInfo.pickedLayer,
          info: info,
          mode: mode
        });

        if (!uniqueInfos.has(info.object)) {
          uniqueInfos.set(info.object, info);
        }
      });
      return Array.from(uniqueInfos.values());
    }
  }, {
    key: "_drawAndSample",
    value: function _drawAndSample(_ref4) {
      var layers = _ref4.layers,
          views = _ref4.views,
          viewports = _ref4.viewports,
          onViewportActive = _ref4.onViewportActive,
          deviceRect = _ref4.deviceRect,
          pass = _ref4.pass,
          redrawReason = _ref4.redrawReason,
          pickZ = _ref4.pickZ;
      assert$2(deviceRect.width > 0 && deviceRect.height > 0);

      if (layers.length < 1) {
        return null;
      }

      var pickingFBO = pickZ ? this.depthFBO : this.pickingFBO;
      this.pickLayersPass.render({
        layers: layers,
        layerFilter: this.layerFilter,
        onError: this._onError,
        views: views,
        viewports: viewports,
        onViewportActive: onViewportActive,
        pickingFBO: pickingFBO,
        deviceRect: deviceRect,
        pass: pass,
        redrawReason: redrawReason,
        pickZ: pickZ
      });
      var x = deviceRect.x,
          y = deviceRect.y,
          width = deviceRect.width,
          height = deviceRect.height;
      var pickedColors = new (pickZ ? Float32Array : Uint8Array)(width * height * 4);
      readPixelsToArray(pickingFBO, {
        sourceX: x,
        sourceY: y,
        sourceWidth: width,
        sourceHeight: height,
        target: pickedColors
      });
      return pickedColors;
    }
  }, {
    key: "_getPickingRect",
    value: function _getPickingRect(_ref5) {
      var deviceX = _ref5.deviceX,
          deviceY = _ref5.deviceY,
          deviceRadius = _ref5.deviceRadius,
          deviceWidth = _ref5.deviceWidth,
          deviceHeight = _ref5.deviceHeight;
      var x = Math.max(0, deviceX - deviceRadius);
      var y = Math.max(0, deviceY - deviceRadius);
      var width = Math.min(deviceWidth, deviceX + deviceRadius + 1) - x;
      var height = Math.min(deviceHeight, deviceY + deviceRadius + 1) - y;

      if (width <= 0 || height <= 0) {
        return null;
      }

      return {
        x: x,
        y: y,
        width: width,
        height: height
      };
    }
  }]);

  return DeckPicker;
}();

var defaultStyle = {
  zIndex: 1,
  position: 'absolute',
  pointerEvents: 'none',
  color: '#a0a7b4',
  backgroundColor: '#29323c',
  padding: '10px',
  top: 0,
  left: 0,
  display: 'none'
};

var Tooltip = function () {
  function Tooltip(canvas) {
    _classCallCheck(this, Tooltip);

    var canvasParent = canvas.parentElement;

    if (canvasParent) {
      this.el = document.createElement('div');
      this.el.className = 'deck-tooltip';
      Object.assign(this.el.style, defaultStyle);
      canvasParent.appendChild(this.el);
    }
  }

  _createClass(Tooltip, [{
    key: "setTooltip",
    value: function setTooltip(displayInfo, x, y) {
      var el = this.el;

      if (typeof displayInfo === 'string') {
        el.innerText = displayInfo;
      } else if (!displayInfo) {
        el.style.display = 'none';
        return;
      } else {
        if ('text' in displayInfo) {
          el.innerText = displayInfo.text;
        }

        if ('html' in displayInfo) {
          el.innerHTML = displayInfo.html;
        }

        if ('className' in displayInfo) {
          el.className = displayInfo.className;
        }

        Object.assign(el.style, displayInfo.style);
      }

      el.style.display = 'block';
      el.style.transform = "translate(".concat(x, "px, ").concat(y, "px)");
    }
  }, {
    key: "remove",
    value: function remove() {
      if (this.el) {
        this.el.remove();
      }
    }
  }]);

  return Tooltip;
}();

var hammer = createCommonjsModule(function (module) {
/*! Hammer.JS - v2.0.7 - 2016-04-22
 * http://hammerjs.github.io/
 *
 * Copyright (c) 2016 Jorik Tangelder;
 * Licensed under the MIT license */
(function(window, document, exportName, undefined$1) {

var VENDOR_PREFIXES = ['', 'webkit', 'Moz', 'MS', 'ms', 'o'];
var TEST_ELEMENT = document.createElement('div');

var TYPE_FUNCTION = 'function';

var round = Math.round;
var abs = Math.abs;
var now = Date.now;

/**
 * set a timeout with a given scope
 * @param {Function} fn
 * @param {Number} timeout
 * @param {Object} context
 * @returns {number}
 */
function setTimeoutContext(fn, timeout, context) {
    return setTimeout(bindFn(fn, context), timeout);
}

/**
 * if the argument is an array, we want to execute the fn on each entry
 * if it aint an array we don't want to do a thing.
 * this is used by all the methods that accept a single and array argument.
 * @param {*|Array} arg
 * @param {String} fn
 * @param {Object} [context]
 * @returns {Boolean}
 */
function invokeArrayArg(arg, fn, context) {
    if (Array.isArray(arg)) {
        each(arg, context[fn], context);
        return true;
    }
    return false;
}

/**
 * walk objects and arrays
 * @param {Object} obj
 * @param {Function} iterator
 * @param {Object} context
 */
function each(obj, iterator, context) {
    var i;

    if (!obj) {
        return;
    }

    if (obj.forEach) {
        obj.forEach(iterator, context);
    } else if (obj.length !== undefined$1) {
        i = 0;
        while (i < obj.length) {
            iterator.call(context, obj[i], i, obj);
            i++;
        }
    } else {
        for (i in obj) {
            obj.hasOwnProperty(i) && iterator.call(context, obj[i], i, obj);
        }
    }
}

/**
 * wrap a method with a deprecation warning and stack trace
 * @param {Function} method
 * @param {String} name
 * @param {String} message
 * @returns {Function} A new function wrapping the supplied method.
 */
function deprecate(method, name, message) {
    var deprecationMessage = 'DEPRECATED METHOD: ' + name + '\n' + message + ' AT \n';
    return function() {
        var e = new Error('get-stack-trace');
        var stack = e && e.stack ? e.stack.replace(/^[^\(]+?[\n$]/gm, '')
            .replace(/^\s+at\s+/gm, '')
            .replace(/^Object.<anonymous>\s*\(/gm, '{anonymous}()@') : 'Unknown Stack Trace';

        var log = window.console && (window.console.warn || window.console.log);
        if (log) {
            log.call(window.console, deprecationMessage, stack);
        }
        return method.apply(this, arguments);
    };
}

/**
 * extend object.
 * means that properties in dest will be overwritten by the ones in src.
 * @param {Object} target
 * @param {...Object} objects_to_assign
 * @returns {Object} target
 */
var assign;
if (typeof Object.assign !== 'function') {
    assign = function assign(target) {
        if (target === undefined$1 || target === null) {
            throw new TypeError('Cannot convert undefined or null to object');
        }

        var output = Object(target);
        for (var index = 1; index < arguments.length; index++) {
            var source = arguments[index];
            if (source !== undefined$1 && source !== null) {
                for (var nextKey in source) {
                    if (source.hasOwnProperty(nextKey)) {
                        output[nextKey] = source[nextKey];
                    }
                }
            }
        }
        return output;
    };
} else {
    assign = Object.assign;
}

/**
 * extend object.
 * means that properties in dest will be overwritten by the ones in src.
 * @param {Object} dest
 * @param {Object} src
 * @param {Boolean} [merge=false]
 * @returns {Object} dest
 */
var extend = deprecate(function extend(dest, src, merge) {
    var keys = Object.keys(src);
    var i = 0;
    while (i < keys.length) {
        if (!merge || (merge && dest[keys[i]] === undefined$1)) {
            dest[keys[i]] = src[keys[i]];
        }
        i++;
    }
    return dest;
}, 'extend', 'Use `assign`.');

/**
 * merge the values from src in the dest.
 * means that properties that exist in dest will not be overwritten by src
 * @param {Object} dest
 * @param {Object} src
 * @returns {Object} dest
 */
var merge = deprecate(function merge(dest, src) {
    return extend(dest, src, true);
}, 'merge', 'Use `assign`.');

/**
 * simple class inheritance
 * @param {Function} child
 * @param {Function} base
 * @param {Object} [properties]
 */
function inherit(child, base, properties) {
    var baseP = base.prototype,
        childP;

    childP = child.prototype = Object.create(baseP);
    childP.constructor = child;
    childP._super = baseP;

    if (properties) {
        assign(childP, properties);
    }
}

/**
 * simple function bind
 * @param {Function} fn
 * @param {Object} context
 * @returns {Function}
 */
function bindFn(fn, context) {
    return function boundFn() {
        return fn.apply(context, arguments);
    };
}

/**
 * let a boolean value also be a function that must return a boolean
 * this first item in args will be used as the context
 * @param {Boolean|Function} val
 * @param {Array} [args]
 * @returns {Boolean}
 */
function boolOrFn(val, args) {
    if (typeof val == TYPE_FUNCTION) {
        return val.apply(args ? args[0] || undefined$1 : undefined$1, args);
    }
    return val;
}

/**
 * use the val2 when val1 is undefined
 * @param {*} val1
 * @param {*} val2
 * @returns {*}
 */
function ifUndefined(val1, val2) {
    return (val1 === undefined$1) ? val2 : val1;
}

/**
 * addEventListener with multiple events at once
 * @param {EventTarget} target
 * @param {String} types
 * @param {Function} handler
 */
function addEventListeners(target, types, handler) {
    each(splitStr(types), function(type) {
        target.addEventListener(type, handler, false);
    });
}

/**
 * removeEventListener with multiple events at once
 * @param {EventTarget} target
 * @param {String} types
 * @param {Function} handler
 */
function removeEventListeners(target, types, handler) {
    each(splitStr(types), function(type) {
        target.removeEventListener(type, handler, false);
    });
}

/**
 * find if a node is in the given parent
 * @method hasParent
 * @param {HTMLElement} node
 * @param {HTMLElement} parent
 * @return {Boolean} found
 */
function hasParent(node, parent) {
    while (node) {
        if (node == parent) {
            return true;
        }
        node = node.parentNode;
    }
    return false;
}

/**
 * small indexOf wrapper
 * @param {String} str
 * @param {String} find
 * @returns {Boolean} found
 */
function inStr(str, find) {
    return str.indexOf(find) > -1;
}

/**
 * split string on whitespace
 * @param {String} str
 * @returns {Array} words
 */
function splitStr(str) {
    return str.trim().split(/\s+/g);
}

/**
 * find if a array contains the object using indexOf or a simple polyFill
 * @param {Array} src
 * @param {String} find
 * @param {String} [findByKey]
 * @return {Boolean|Number} false when not found, or the index
 */
function inArray(src, find, findByKey) {
    if (src.indexOf && !findByKey) {
        return src.indexOf(find);
    } else {
        var i = 0;
        while (i < src.length) {
            if ((findByKey && src[i][findByKey] == find) || (!findByKey && src[i] === find)) {
                return i;
            }
            i++;
        }
        return -1;
    }
}

/**
 * convert array-like objects to real arrays
 * @param {Object} obj
 * @returns {Array}
 */
function toArray(obj) {
    return Array.prototype.slice.call(obj, 0);
}

/**
 * unique array with objects based on a key (like 'id') or just by the array's value
 * @param {Array} src [{id:1},{id:2},{id:1}]
 * @param {String} [key]
 * @param {Boolean} [sort=False]
 * @returns {Array} [{id:1},{id:2}]
 */
function uniqueArray(src, key, sort) {
    var results = [];
    var values = [];
    var i = 0;

    while (i < src.length) {
        var val = key ? src[i][key] : src[i];
        if (inArray(values, val) < 0) {
            results.push(src[i]);
        }
        values[i] = val;
        i++;
    }

    if (sort) {
        if (!key) {
            results = results.sort();
        } else {
            results = results.sort(function sortUniqueArray(a, b) {
                return a[key] > b[key];
            });
        }
    }

    return results;
}

/**
 * get the prefixed property
 * @param {Object} obj
 * @param {String} property
 * @returns {String|Undefined} prefixed
 */
function prefixed(obj, property) {
    var prefix, prop;
    var camelProp = property[0].toUpperCase() + property.slice(1);

    var i = 0;
    while (i < VENDOR_PREFIXES.length) {
        prefix = VENDOR_PREFIXES[i];
        prop = (prefix) ? prefix + camelProp : property;

        if (prop in obj) {
            return prop;
        }
        i++;
    }
    return undefined$1;
}

/**
 * get a unique id
 * @returns {number} uniqueId
 */
var _uniqueId = 1;
function uniqueId() {
    return _uniqueId++;
}

/**
 * get the window object of an element
 * @param {HTMLElement} element
 * @returns {DocumentView|Window}
 */
function getWindowForElement(element) {
    var doc = element.ownerDocument || element;
    return (doc.defaultView || doc.parentWindow || window);
}

var MOBILE_REGEX = /mobile|tablet|ip(ad|hone|od)|android/i;

var SUPPORT_TOUCH = ('ontouchstart' in window);
var SUPPORT_POINTER_EVENTS = prefixed(window, 'PointerEvent') !== undefined$1;
var SUPPORT_ONLY_TOUCH = SUPPORT_TOUCH && MOBILE_REGEX.test(navigator.userAgent);

var INPUT_TYPE_TOUCH = 'touch';
var INPUT_TYPE_PEN = 'pen';
var INPUT_TYPE_MOUSE = 'mouse';
var INPUT_TYPE_KINECT = 'kinect';

var COMPUTE_INTERVAL = 25;

var INPUT_START = 1;
var INPUT_MOVE = 2;
var INPUT_END = 4;
var INPUT_CANCEL = 8;

var DIRECTION_NONE = 1;
var DIRECTION_LEFT = 2;
var DIRECTION_RIGHT = 4;
var DIRECTION_UP = 8;
var DIRECTION_DOWN = 16;

var DIRECTION_HORIZONTAL = DIRECTION_LEFT | DIRECTION_RIGHT;
var DIRECTION_VERTICAL = DIRECTION_UP | DIRECTION_DOWN;
var DIRECTION_ALL = DIRECTION_HORIZONTAL | DIRECTION_VERTICAL;

var PROPS_XY = ['x', 'y'];
var PROPS_CLIENT_XY = ['clientX', 'clientY'];

/**
 * create new input type manager
 * @param {Manager} manager
 * @param {Function} callback
 * @returns {Input}
 * @constructor
 */
function Input(manager, callback) {
    var self = this;
    this.manager = manager;
    this.callback = callback;
    this.element = manager.element;
    this.target = manager.options.inputTarget;

    // smaller wrapper around the handler, for the scope and the enabled state of the manager,
    // so when disabled the input events are completely bypassed.
    this.domHandler = function(ev) {
        if (boolOrFn(manager.options.enable, [manager])) {
            self.handler(ev);
        }
    };

    this.init();

}

Input.prototype = {
    /**
     * should handle the inputEvent data and trigger the callback
     * @virtual
     */
    handler: function() { },

    /**
     * bind the events
     */
    init: function() {
        this.evEl && addEventListeners(this.element, this.evEl, this.domHandler);
        this.evTarget && addEventListeners(this.target, this.evTarget, this.domHandler);
        this.evWin && addEventListeners(getWindowForElement(this.element), this.evWin, this.domHandler);
    },

    /**
     * unbind the events
     */
    destroy: function() {
        this.evEl && removeEventListeners(this.element, this.evEl, this.domHandler);
        this.evTarget && removeEventListeners(this.target, this.evTarget, this.domHandler);
        this.evWin && removeEventListeners(getWindowForElement(this.element), this.evWin, this.domHandler);
    }
};

/**
 * create new input type manager
 * called by the Manager constructor
 * @param {Hammer} manager
 * @returns {Input}
 */
function createInputInstance(manager) {
    var Type;
    var inputClass = manager.options.inputClass;

    if (inputClass) {
        Type = inputClass;
    } else if (SUPPORT_POINTER_EVENTS) {
        Type = PointerEventInput;
    } else if (SUPPORT_ONLY_TOUCH) {
        Type = TouchInput;
    } else if (!SUPPORT_TOUCH) {
        Type = MouseInput;
    } else {
        Type = TouchMouseInput;
    }
    return new (Type)(manager, inputHandler);
}

/**
 * handle input events
 * @param {Manager} manager
 * @param {String} eventType
 * @param {Object} input
 */
function inputHandler(manager, eventType, input) {
    var pointersLen = input.pointers.length;
    var changedPointersLen = input.changedPointers.length;
    var isFirst = (eventType & INPUT_START && (pointersLen - changedPointersLen === 0));
    var isFinal = (eventType & (INPUT_END | INPUT_CANCEL) && (pointersLen - changedPointersLen === 0));

    input.isFirst = !!isFirst;
    input.isFinal = !!isFinal;

    if (isFirst) {
        manager.session = {};
    }

    // source event is the normalized value of the domEvents
    // like 'touchstart, mouseup, pointerdown'
    input.eventType = eventType;

    // compute scale, rotation etc
    computeInputData(manager, input);

    // emit secret event
    manager.emit('hammer.input', input);

    manager.recognize(input);
    manager.session.prevInput = input;
}

/**
 * extend the data with some usable properties like scale, rotate, velocity etc
 * @param {Object} manager
 * @param {Object} input
 */
function computeInputData(manager, input) {
    var session = manager.session;
    var pointers = input.pointers;
    var pointersLength = pointers.length;

    // store the first input to calculate the distance and direction
    if (!session.firstInput) {
        session.firstInput = simpleCloneInputData(input);
    }

    // to compute scale and rotation we need to store the multiple touches
    if (pointersLength > 1 && !session.firstMultiple) {
        session.firstMultiple = simpleCloneInputData(input);
    } else if (pointersLength === 1) {
        session.firstMultiple = false;
    }

    var firstInput = session.firstInput;
    var firstMultiple = session.firstMultiple;
    var offsetCenter = firstMultiple ? firstMultiple.center : firstInput.center;

    var center = input.center = getCenter(pointers);
    input.timeStamp = now();
    input.deltaTime = input.timeStamp - firstInput.timeStamp;

    input.angle = getAngle(offsetCenter, center);
    input.distance = getDistance(offsetCenter, center);

    computeDeltaXY(session, input);
    input.offsetDirection = getDirection(input.deltaX, input.deltaY);

    var overallVelocity = getVelocity(input.deltaTime, input.deltaX, input.deltaY);
    input.overallVelocityX = overallVelocity.x;
    input.overallVelocityY = overallVelocity.y;
    input.overallVelocity = (abs(overallVelocity.x) > abs(overallVelocity.y)) ? overallVelocity.x : overallVelocity.y;

    input.scale = firstMultiple ? getScale(firstMultiple.pointers, pointers) : 1;
    input.rotation = firstMultiple ? getRotation(firstMultiple.pointers, pointers) : 0;

    input.maxPointers = !session.prevInput ? input.pointers.length : ((input.pointers.length >
        session.prevInput.maxPointers) ? input.pointers.length : session.prevInput.maxPointers);

    computeIntervalInputData(session, input);

    // find the correct target
    var target = manager.element;
    if (hasParent(input.srcEvent.target, target)) {
        target = input.srcEvent.target;
    }
    input.target = target;
}

function computeDeltaXY(session, input) {
    var center = input.center;
    var offset = session.offsetDelta || {};
    var prevDelta = session.prevDelta || {};
    var prevInput = session.prevInput || {};

    if (input.eventType === INPUT_START || prevInput.eventType === INPUT_END) {
        prevDelta = session.prevDelta = {
            x: prevInput.deltaX || 0,
            y: prevInput.deltaY || 0
        };

        offset = session.offsetDelta = {
            x: center.x,
            y: center.y
        };
    }

    input.deltaX = prevDelta.x + (center.x - offset.x);
    input.deltaY = prevDelta.y + (center.y - offset.y);
}

/**
 * velocity is calculated every x ms
 * @param {Object} session
 * @param {Object} input
 */
function computeIntervalInputData(session, input) {
    var last = session.lastInterval || input,
        deltaTime = input.timeStamp - last.timeStamp,
        velocity, velocityX, velocityY, direction;

    if (input.eventType != INPUT_CANCEL && (deltaTime > COMPUTE_INTERVAL || last.velocity === undefined$1)) {
        var deltaX = input.deltaX - last.deltaX;
        var deltaY = input.deltaY - last.deltaY;

        var v = getVelocity(deltaTime, deltaX, deltaY);
        velocityX = v.x;
        velocityY = v.y;
        velocity = (abs(v.x) > abs(v.y)) ? v.x : v.y;
        direction = getDirection(deltaX, deltaY);

        session.lastInterval = input;
    } else {
        // use latest velocity info if it doesn't overtake a minimum period
        velocity = last.velocity;
        velocityX = last.velocityX;
        velocityY = last.velocityY;
        direction = last.direction;
    }

    input.velocity = velocity;
    input.velocityX = velocityX;
    input.velocityY = velocityY;
    input.direction = direction;
}

/**
 * create a simple clone from the input used for storage of firstInput and firstMultiple
 * @param {Object} input
 * @returns {Object} clonedInputData
 */
function simpleCloneInputData(input) {
    // make a simple copy of the pointers because we will get a reference if we don't
    // we only need clientXY for the calculations
    var pointers = [];
    var i = 0;
    while (i < input.pointers.length) {
        pointers[i] = {
            clientX: round(input.pointers[i].clientX),
            clientY: round(input.pointers[i].clientY)
        };
        i++;
    }

    return {
        timeStamp: now(),
        pointers: pointers,
        center: getCenter(pointers),
        deltaX: input.deltaX,
        deltaY: input.deltaY
    };
}

/**
 * get the center of all the pointers
 * @param {Array} pointers
 * @return {Object} center contains `x` and `y` properties
 */
function getCenter(pointers) {
    var pointersLength = pointers.length;

    // no need to loop when only one touch
    if (pointersLength === 1) {
        return {
            x: round(pointers[0].clientX),
            y: round(pointers[0].clientY)
        };
    }

    var x = 0, y = 0, i = 0;
    while (i < pointersLength) {
        x += pointers[i].clientX;
        y += pointers[i].clientY;
        i++;
    }

    return {
        x: round(x / pointersLength),
        y: round(y / pointersLength)
    };
}

/**
 * calculate the velocity between two points. unit is in px per ms.
 * @param {Number} deltaTime
 * @param {Number} x
 * @param {Number} y
 * @return {Object} velocity `x` and `y`
 */
function getVelocity(deltaTime, x, y) {
    return {
        x: x / deltaTime || 0,
        y: y / deltaTime || 0
    };
}

/**
 * get the direction between two points
 * @param {Number} x
 * @param {Number} y
 * @return {Number} direction
 */
function getDirection(x, y) {
    if (x === y) {
        return DIRECTION_NONE;
    }

    if (abs(x) >= abs(y)) {
        return x < 0 ? DIRECTION_LEFT : DIRECTION_RIGHT;
    }
    return y < 0 ? DIRECTION_UP : DIRECTION_DOWN;
}

/**
 * calculate the absolute distance between two points
 * @param {Object} p1 {x, y}
 * @param {Object} p2 {x, y}
 * @param {Array} [props] containing x and y keys
 * @return {Number} distance
 */
function getDistance(p1, p2, props) {
    if (!props) {
        props = PROPS_XY;
    }
    var x = p2[props[0]] - p1[props[0]],
        y = p2[props[1]] - p1[props[1]];

    return Math.sqrt((x * x) + (y * y));
}

/**
 * calculate the angle between two coordinates
 * @param {Object} p1
 * @param {Object} p2
 * @param {Array} [props] containing x and y keys
 * @return {Number} angle
 */
function getAngle(p1, p2, props) {
    if (!props) {
        props = PROPS_XY;
    }
    var x = p2[props[0]] - p1[props[0]],
        y = p2[props[1]] - p1[props[1]];
    return Math.atan2(y, x) * 180 / Math.PI;
}

/**
 * calculate the rotation degrees between two pointersets
 * @param {Array} start array of pointers
 * @param {Array} end array of pointers
 * @return {Number} rotation
 */
function getRotation(start, end) {
    return getAngle(end[1], end[0], PROPS_CLIENT_XY) + getAngle(start[1], start[0], PROPS_CLIENT_XY);
}

/**
 * calculate the scale factor between two pointersets
 * no scale is 1, and goes down to 0 when pinched together, and bigger when pinched out
 * @param {Array} start array of pointers
 * @param {Array} end array of pointers
 * @return {Number} scale
 */
function getScale(start, end) {
    return getDistance(end[0], end[1], PROPS_CLIENT_XY) / getDistance(start[0], start[1], PROPS_CLIENT_XY);
}

var MOUSE_INPUT_MAP = {
    mousedown: INPUT_START,
    mousemove: INPUT_MOVE,
    mouseup: INPUT_END
};

var MOUSE_ELEMENT_EVENTS = 'mousedown';
var MOUSE_WINDOW_EVENTS = 'mousemove mouseup';

/**
 * Mouse events input
 * @constructor
 * @extends Input
 */
function MouseInput() {
    this.evEl = MOUSE_ELEMENT_EVENTS;
    this.evWin = MOUSE_WINDOW_EVENTS;

    this.pressed = false; // mousedown state

    Input.apply(this, arguments);
}

inherit(MouseInput, Input, {
    /**
     * handle mouse events
     * @param {Object} ev
     */
    handler: function MEhandler(ev) {
        var eventType = MOUSE_INPUT_MAP[ev.type];

        // on start we want to have the left mouse button down
        if (eventType & INPUT_START && ev.button === 0) {
            this.pressed = true;
        }

        if (eventType & INPUT_MOVE && ev.which !== 1) {
            eventType = INPUT_END;
        }

        // mouse must be down
        if (!this.pressed) {
            return;
        }

        if (eventType & INPUT_END) {
            this.pressed = false;
        }

        this.callback(this.manager, eventType, {
            pointers: [ev],
            changedPointers: [ev],
            pointerType: INPUT_TYPE_MOUSE,
            srcEvent: ev
        });
    }
});

var POINTER_INPUT_MAP = {
    pointerdown: INPUT_START,
    pointermove: INPUT_MOVE,
    pointerup: INPUT_END,
    pointercancel: INPUT_CANCEL,
    pointerout: INPUT_CANCEL
};

// in IE10 the pointer types is defined as an enum
var IE10_POINTER_TYPE_ENUM = {
    2: INPUT_TYPE_TOUCH,
    3: INPUT_TYPE_PEN,
    4: INPUT_TYPE_MOUSE,
    5: INPUT_TYPE_KINECT // see https://twitter.com/jacobrossi/status/480596438489890816
};

var POINTER_ELEMENT_EVENTS = 'pointerdown';
var POINTER_WINDOW_EVENTS = 'pointermove pointerup pointercancel';

// IE10 has prefixed support, and case-sensitive
if (window.MSPointerEvent && !window.PointerEvent) {
    POINTER_ELEMENT_EVENTS = 'MSPointerDown';
    POINTER_WINDOW_EVENTS = 'MSPointerMove MSPointerUp MSPointerCancel';
}

/**
 * Pointer events input
 * @constructor
 * @extends Input
 */
function PointerEventInput() {
    this.evEl = POINTER_ELEMENT_EVENTS;
    this.evWin = POINTER_WINDOW_EVENTS;

    Input.apply(this, arguments);

    this.store = (this.manager.session.pointerEvents = []);
}

inherit(PointerEventInput, Input, {
    /**
     * handle mouse events
     * @param {Object} ev
     */
    handler: function PEhandler(ev) {
        var store = this.store;
        var removePointer = false;

        var eventTypeNormalized = ev.type.toLowerCase().replace('ms', '');
        var eventType = POINTER_INPUT_MAP[eventTypeNormalized];
        var pointerType = IE10_POINTER_TYPE_ENUM[ev.pointerType] || ev.pointerType;

        var isTouch = (pointerType == INPUT_TYPE_TOUCH);

        // get index of the event in the store
        var storeIndex = inArray(store, ev.pointerId, 'pointerId');

        // start and mouse must be down
        if (eventType & INPUT_START && (ev.button === 0 || isTouch)) {
            if (storeIndex < 0) {
                store.push(ev);
                storeIndex = store.length - 1;
            }
        } else if (eventType & (INPUT_END | INPUT_CANCEL)) {
            removePointer = true;
        }

        // it not found, so the pointer hasn't been down (so it's probably a hover)
        if (storeIndex < 0) {
            return;
        }

        // update the event in the store
        store[storeIndex] = ev;

        this.callback(this.manager, eventType, {
            pointers: store,
            changedPointers: [ev],
            pointerType: pointerType,
            srcEvent: ev
        });

        if (removePointer) {
            // remove from the store
            store.splice(storeIndex, 1);
        }
    }
});

var SINGLE_TOUCH_INPUT_MAP = {
    touchstart: INPUT_START,
    touchmove: INPUT_MOVE,
    touchend: INPUT_END,
    touchcancel: INPUT_CANCEL
};

var SINGLE_TOUCH_TARGET_EVENTS = 'touchstart';
var SINGLE_TOUCH_WINDOW_EVENTS = 'touchstart touchmove touchend touchcancel';

/**
 * Touch events input
 * @constructor
 * @extends Input
 */
function SingleTouchInput() {
    this.evTarget = SINGLE_TOUCH_TARGET_EVENTS;
    this.evWin = SINGLE_TOUCH_WINDOW_EVENTS;
    this.started = false;

    Input.apply(this, arguments);
}

inherit(SingleTouchInput, Input, {
    handler: function TEhandler(ev) {
        var type = SINGLE_TOUCH_INPUT_MAP[ev.type];

        // should we handle the touch events?
        if (type === INPUT_START) {
            this.started = true;
        }

        if (!this.started) {
            return;
        }

        var touches = normalizeSingleTouches.call(this, ev, type);

        // when done, reset the started state
        if (type & (INPUT_END | INPUT_CANCEL) && touches[0].length - touches[1].length === 0) {
            this.started = false;
        }

        this.callback(this.manager, type, {
            pointers: touches[0],
            changedPointers: touches[1],
            pointerType: INPUT_TYPE_TOUCH,
            srcEvent: ev
        });
    }
});

/**
 * @this {TouchInput}
 * @param {Object} ev
 * @param {Number} type flag
 * @returns {undefined|Array} [all, changed]
 */
function normalizeSingleTouches(ev, type) {
    var all = toArray(ev.touches);
    var changed = toArray(ev.changedTouches);

    if (type & (INPUT_END | INPUT_CANCEL)) {
        all = uniqueArray(all.concat(changed), 'identifier', true);
    }

    return [all, changed];
}

var TOUCH_INPUT_MAP = {
    touchstart: INPUT_START,
    touchmove: INPUT_MOVE,
    touchend: INPUT_END,
    touchcancel: INPUT_CANCEL
};

var TOUCH_TARGET_EVENTS = 'touchstart touchmove touchend touchcancel';

/**
 * Multi-user touch events input
 * @constructor
 * @extends Input
 */
function TouchInput() {
    this.evTarget = TOUCH_TARGET_EVENTS;
    this.targetIds = {};

    Input.apply(this, arguments);
}

inherit(TouchInput, Input, {
    handler: function MTEhandler(ev) {
        var type = TOUCH_INPUT_MAP[ev.type];
        var touches = getTouches.call(this, ev, type);
        if (!touches) {
            return;
        }

        this.callback(this.manager, type, {
            pointers: touches[0],
            changedPointers: touches[1],
            pointerType: INPUT_TYPE_TOUCH,
            srcEvent: ev
        });
    }
});

/**
 * @this {TouchInput}
 * @param {Object} ev
 * @param {Number} type flag
 * @returns {undefined|Array} [all, changed]
 */
function getTouches(ev, type) {
    var allTouches = toArray(ev.touches);
    var targetIds = this.targetIds;

    // when there is only one touch, the process can be simplified
    if (type & (INPUT_START | INPUT_MOVE) && allTouches.length === 1) {
        targetIds[allTouches[0].identifier] = true;
        return [allTouches, allTouches];
    }

    var i,
        targetTouches,
        changedTouches = toArray(ev.changedTouches),
        changedTargetTouches = [],
        target = this.target;

    // get target touches from touches
    targetTouches = allTouches.filter(function(touch) {
        return hasParent(touch.target, target);
    });

    // collect touches
    if (type === INPUT_START) {
        i = 0;
        while (i < targetTouches.length) {
            targetIds[targetTouches[i].identifier] = true;
            i++;
        }
    }

    // filter changed touches to only contain touches that exist in the collected target ids
    i = 0;
    while (i < changedTouches.length) {
        if (targetIds[changedTouches[i].identifier]) {
            changedTargetTouches.push(changedTouches[i]);
        }

        // cleanup removed touches
        if (type & (INPUT_END | INPUT_CANCEL)) {
            delete targetIds[changedTouches[i].identifier];
        }
        i++;
    }

    if (!changedTargetTouches.length) {
        return;
    }

    return [
        // merge targetTouches with changedTargetTouches so it contains ALL touches, including 'end' and 'cancel'
        uniqueArray(targetTouches.concat(changedTargetTouches), 'identifier', true),
        changedTargetTouches
    ];
}

/**
 * Combined touch and mouse input
 *
 * Touch has a higher priority then mouse, and while touching no mouse events are allowed.
 * This because touch devices also emit mouse events while doing a touch.
 *
 * @constructor
 * @extends Input
 */

var DEDUP_TIMEOUT = 2500;
var DEDUP_DISTANCE = 25;

function TouchMouseInput() {
    Input.apply(this, arguments);

    var handler = bindFn(this.handler, this);
    this.touch = new TouchInput(this.manager, handler);
    this.mouse = new MouseInput(this.manager, handler);

    this.primaryTouch = null;
    this.lastTouches = [];
}

inherit(TouchMouseInput, Input, {
    /**
     * handle mouse and touch events
     * @param {Hammer} manager
     * @param {String} inputEvent
     * @param {Object} inputData
     */
    handler: function TMEhandler(manager, inputEvent, inputData) {
        var isTouch = (inputData.pointerType == INPUT_TYPE_TOUCH),
            isMouse = (inputData.pointerType == INPUT_TYPE_MOUSE);

        if (isMouse && inputData.sourceCapabilities && inputData.sourceCapabilities.firesTouchEvents) {
            return;
        }

        // when we're in a touch event, record touches to  de-dupe synthetic mouse event
        if (isTouch) {
            recordTouches.call(this, inputEvent, inputData);
        } else if (isMouse && isSyntheticEvent.call(this, inputData)) {
            return;
        }

        this.callback(manager, inputEvent, inputData);
    },

    /**
     * remove the event listeners
     */
    destroy: function destroy() {
        this.touch.destroy();
        this.mouse.destroy();
    }
});

function recordTouches(eventType, eventData) {
    if (eventType & INPUT_START) {
        this.primaryTouch = eventData.changedPointers[0].identifier;
        setLastTouch.call(this, eventData);
    } else if (eventType & (INPUT_END | INPUT_CANCEL)) {
        setLastTouch.call(this, eventData);
    }
}

function setLastTouch(eventData) {
    var touch = eventData.changedPointers[0];

    if (touch.identifier === this.primaryTouch) {
        var lastTouch = {x: touch.clientX, y: touch.clientY};
        this.lastTouches.push(lastTouch);
        var lts = this.lastTouches;
        var removeLastTouch = function() {
            var i = lts.indexOf(lastTouch);
            if (i > -1) {
                lts.splice(i, 1);
            }
        };
        setTimeout(removeLastTouch, DEDUP_TIMEOUT);
    }
}

function isSyntheticEvent(eventData) {
    var x = eventData.srcEvent.clientX, y = eventData.srcEvent.clientY;
    for (var i = 0; i < this.lastTouches.length; i++) {
        var t = this.lastTouches[i];
        var dx = Math.abs(x - t.x), dy = Math.abs(y - t.y);
        if (dx <= DEDUP_DISTANCE && dy <= DEDUP_DISTANCE) {
            return true;
        }
    }
    return false;
}

var PREFIXED_TOUCH_ACTION = prefixed(TEST_ELEMENT.style, 'touchAction');
var NATIVE_TOUCH_ACTION = PREFIXED_TOUCH_ACTION !== undefined$1;

// magical touchAction value
var TOUCH_ACTION_COMPUTE = 'compute';
var TOUCH_ACTION_AUTO = 'auto';
var TOUCH_ACTION_MANIPULATION = 'manipulation'; // not implemented
var TOUCH_ACTION_NONE = 'none';
var TOUCH_ACTION_PAN_X = 'pan-x';
var TOUCH_ACTION_PAN_Y = 'pan-y';
var TOUCH_ACTION_MAP = getTouchActionProps();

/**
 * Touch Action
 * sets the touchAction property or uses the js alternative
 * @param {Manager} manager
 * @param {String} value
 * @constructor
 */
function TouchAction(manager, value) {
    this.manager = manager;
    this.set(value);
}

TouchAction.prototype = {
    /**
     * set the touchAction value on the element or enable the polyfill
     * @param {String} value
     */
    set: function(value) {
        // find out the touch-action by the event handlers
        if (value == TOUCH_ACTION_COMPUTE) {
            value = this.compute();
        }

        if (NATIVE_TOUCH_ACTION && this.manager.element.style && TOUCH_ACTION_MAP[value]) {
            this.manager.element.style[PREFIXED_TOUCH_ACTION] = value;
        }
        this.actions = value.toLowerCase().trim();
    },

    /**
     * just re-set the touchAction value
     */
    update: function() {
        this.set(this.manager.options.touchAction);
    },

    /**
     * compute the value for the touchAction property based on the recognizer's settings
     * @returns {String} value
     */
    compute: function() {
        var actions = [];
        each(this.manager.recognizers, function(recognizer) {
            if (boolOrFn(recognizer.options.enable, [recognizer])) {
                actions = actions.concat(recognizer.getTouchAction());
            }
        });
        return cleanTouchActions(actions.join(' '));
    },

    /**
     * this method is called on each input cycle and provides the preventing of the browser behavior
     * @param {Object} input
     */
    preventDefaults: function(input) {
        var srcEvent = input.srcEvent;
        var direction = input.offsetDirection;

        // if the touch action did prevented once this session
        if (this.manager.session.prevented) {
            srcEvent.preventDefault();
            return;
        }

        var actions = this.actions;
        var hasNone = inStr(actions, TOUCH_ACTION_NONE) && !TOUCH_ACTION_MAP[TOUCH_ACTION_NONE];
        var hasPanY = inStr(actions, TOUCH_ACTION_PAN_Y) && !TOUCH_ACTION_MAP[TOUCH_ACTION_PAN_Y];
        var hasPanX = inStr(actions, TOUCH_ACTION_PAN_X) && !TOUCH_ACTION_MAP[TOUCH_ACTION_PAN_X];

        if (hasNone) {
            //do not prevent defaults if this is a tap gesture

            var isTapPointer = input.pointers.length === 1;
            var isTapMovement = input.distance < 2;
            var isTapTouchTime = input.deltaTime < 250;

            if (isTapPointer && isTapMovement && isTapTouchTime) {
                return;
            }
        }

        if (hasPanX && hasPanY) {
            // `pan-x pan-y` means browser handles all scrolling/panning, do not prevent
            return;
        }

        if (hasNone ||
            (hasPanY && direction & DIRECTION_HORIZONTAL) ||
            (hasPanX && direction & DIRECTION_VERTICAL)) {
            return this.preventSrc(srcEvent);
        }
    },

    /**
     * call preventDefault to prevent the browser's default behavior (scrolling in most cases)
     * @param {Object} srcEvent
     */
    preventSrc: function(srcEvent) {
        this.manager.session.prevented = true;
        srcEvent.preventDefault();
    }
};

/**
 * when the touchActions are collected they are not a valid value, so we need to clean things up. *
 * @param {String} actions
 * @returns {*}
 */
function cleanTouchActions(actions) {
    // none
    if (inStr(actions, TOUCH_ACTION_NONE)) {
        return TOUCH_ACTION_NONE;
    }

    var hasPanX = inStr(actions, TOUCH_ACTION_PAN_X);
    var hasPanY = inStr(actions, TOUCH_ACTION_PAN_Y);

    // if both pan-x and pan-y are set (different recognizers
    // for different directions, e.g. horizontal pan but vertical swipe?)
    // we need none (as otherwise with pan-x pan-y combined none of these
    // recognizers will work, since the browser would handle all panning
    if (hasPanX && hasPanY) {
        return TOUCH_ACTION_NONE;
    }

    // pan-x OR pan-y
    if (hasPanX || hasPanY) {
        return hasPanX ? TOUCH_ACTION_PAN_X : TOUCH_ACTION_PAN_Y;
    }

    // manipulation
    if (inStr(actions, TOUCH_ACTION_MANIPULATION)) {
        return TOUCH_ACTION_MANIPULATION;
    }

    return TOUCH_ACTION_AUTO;
}

function getTouchActionProps() {
    if (!NATIVE_TOUCH_ACTION) {
        return false;
    }
    var touchMap = {};
    var cssSupports = window.CSS && window.CSS.supports;
    ['auto', 'manipulation', 'pan-y', 'pan-x', 'pan-x pan-y', 'none'].forEach(function(val) {

        // If css.supports is not supported but there is native touch-action assume it supports
        // all values. This is the case for IE 10 and 11.
        touchMap[val] = cssSupports ? window.CSS.supports('touch-action', val) : true;
    });
    return touchMap;
}

/**
 * Recognizer flow explained; *
 * All recognizers have the initial state of POSSIBLE when a input session starts.
 * The definition of a input session is from the first input until the last input, with all it's movement in it. *
 * Example session for mouse-input: mousedown -> mousemove -> mouseup
 *
 * On each recognizing cycle (see Manager.recognize) the .recognize() method is executed
 * which determines with state it should be.
 *
 * If the recognizer has the state FAILED, CANCELLED or RECOGNIZED (equals ENDED), it is reset to
 * POSSIBLE to give it another change on the next cycle.
 *
 *               Possible
 *                  |
 *            +-----+---------------+
 *            |                     |
 *      +-----+-----+               |
 *      |           |               |
 *   Failed      Cancelled          |
 *                          +-------+------+
 *                          |              |
 *                      Recognized       Began
 *                                         |
 *                                      Changed
 *                                         |
 *                                  Ended/Recognized
 */
var STATE_POSSIBLE = 1;
var STATE_BEGAN = 2;
var STATE_CHANGED = 4;
var STATE_ENDED = 8;
var STATE_RECOGNIZED = STATE_ENDED;
var STATE_CANCELLED = 16;
var STATE_FAILED = 32;

/**
 * Recognizer
 * Every recognizer needs to extend from this class.
 * @constructor
 * @param {Object} options
 */
function Recognizer(options) {
    this.options = assign({}, this.defaults, options || {});

    this.id = uniqueId();

    this.manager = null;

    // default is enable true
    this.options.enable = ifUndefined(this.options.enable, true);

    this.state = STATE_POSSIBLE;

    this.simultaneous = {};
    this.requireFail = [];
}

Recognizer.prototype = {
    /**
     * @virtual
     * @type {Object}
     */
    defaults: {},

    /**
     * set options
     * @param {Object} options
     * @return {Recognizer}
     */
    set: function(options) {
        assign(this.options, options);

        // also update the touchAction, in case something changed about the directions/enabled state
        this.manager && this.manager.touchAction.update();
        return this;
    },

    /**
     * recognize simultaneous with an other recognizer.
     * @param {Recognizer} otherRecognizer
     * @returns {Recognizer} this
     */
    recognizeWith: function(otherRecognizer) {
        if (invokeArrayArg(otherRecognizer, 'recognizeWith', this)) {
            return this;
        }

        var simultaneous = this.simultaneous;
        otherRecognizer = getRecognizerByNameIfManager(otherRecognizer, this);
        if (!simultaneous[otherRecognizer.id]) {
            simultaneous[otherRecognizer.id] = otherRecognizer;
            otherRecognizer.recognizeWith(this);
        }
        return this;
    },

    /**
     * drop the simultaneous link. it doesnt remove the link on the other recognizer.
     * @param {Recognizer} otherRecognizer
     * @returns {Recognizer} this
     */
    dropRecognizeWith: function(otherRecognizer) {
        if (invokeArrayArg(otherRecognizer, 'dropRecognizeWith', this)) {
            return this;
        }

        otherRecognizer = getRecognizerByNameIfManager(otherRecognizer, this);
        delete this.simultaneous[otherRecognizer.id];
        return this;
    },

    /**
     * recognizer can only run when an other is failing
     * @param {Recognizer} otherRecognizer
     * @returns {Recognizer} this
     */
    requireFailure: function(otherRecognizer) {
        if (invokeArrayArg(otherRecognizer, 'requireFailure', this)) {
            return this;
        }

        var requireFail = this.requireFail;
        otherRecognizer = getRecognizerByNameIfManager(otherRecognizer, this);
        if (inArray(requireFail, otherRecognizer) === -1) {
            requireFail.push(otherRecognizer);
            otherRecognizer.requireFailure(this);
        }
        return this;
    },

    /**
     * drop the requireFailure link. it does not remove the link on the other recognizer.
     * @param {Recognizer} otherRecognizer
     * @returns {Recognizer} this
     */
    dropRequireFailure: function(otherRecognizer) {
        if (invokeArrayArg(otherRecognizer, 'dropRequireFailure', this)) {
            return this;
        }

        otherRecognizer = getRecognizerByNameIfManager(otherRecognizer, this);
        var index = inArray(this.requireFail, otherRecognizer);
        if (index > -1) {
            this.requireFail.splice(index, 1);
        }
        return this;
    },

    /**
     * has require failures boolean
     * @returns {boolean}
     */
    hasRequireFailures: function() {
        return this.requireFail.length > 0;
    },

    /**
     * if the recognizer can recognize simultaneous with an other recognizer
     * @param {Recognizer} otherRecognizer
     * @returns {Boolean}
     */
    canRecognizeWith: function(otherRecognizer) {
        return !!this.simultaneous[otherRecognizer.id];
    },

    /**
     * You should use `tryEmit` instead of `emit` directly to check
     * that all the needed recognizers has failed before emitting.
     * @param {Object} input
     */
    emit: function(input) {
        var self = this;
        var state = this.state;

        function emit(event) {
            self.manager.emit(event, input);
        }

        // 'panstart' and 'panmove'
        if (state < STATE_ENDED) {
            emit(self.options.event + stateStr(state));
        }

        emit(self.options.event); // simple 'eventName' events

        if (input.additionalEvent) { // additional event(panleft, panright, pinchin, pinchout...)
            emit(input.additionalEvent);
        }

        // panend and pancancel
        if (state >= STATE_ENDED) {
            emit(self.options.event + stateStr(state));
        }
    },

    /**
     * Check that all the require failure recognizers has failed,
     * if true, it emits a gesture event,
     * otherwise, setup the state to FAILED.
     * @param {Object} input
     */
    tryEmit: function(input) {
        if (this.canEmit()) {
            return this.emit(input);
        }
        // it's failing anyway
        this.state = STATE_FAILED;
    },

    /**
     * can we emit?
     * @returns {boolean}
     */
    canEmit: function() {
        var i = 0;
        while (i < this.requireFail.length) {
            if (!(this.requireFail[i].state & (STATE_FAILED | STATE_POSSIBLE))) {
                return false;
            }
            i++;
        }
        return true;
    },

    /**
     * update the recognizer
     * @param {Object} inputData
     */
    recognize: function(inputData) {
        // make a new copy of the inputData
        // so we can change the inputData without messing up the other recognizers
        var inputDataClone = assign({}, inputData);

        // is is enabled and allow recognizing?
        if (!boolOrFn(this.options.enable, [this, inputDataClone])) {
            this.reset();
            this.state = STATE_FAILED;
            return;
        }

        // reset when we've reached the end
        if (this.state & (STATE_RECOGNIZED | STATE_CANCELLED | STATE_FAILED)) {
            this.state = STATE_POSSIBLE;
        }

        this.state = this.process(inputDataClone);

        // the recognizer has recognized a gesture
        // so trigger an event
        if (this.state & (STATE_BEGAN | STATE_CHANGED | STATE_ENDED | STATE_CANCELLED)) {
            this.tryEmit(inputDataClone);
        }
    },

    /**
     * return the state of the recognizer
     * the actual recognizing happens in this method
     * @virtual
     * @param {Object} inputData
     * @returns {Const} STATE
     */
    process: function(inputData) { }, // jshint ignore:line

    /**
     * return the preferred touch-action
     * @virtual
     * @returns {Array}
     */
    getTouchAction: function() { },

    /**
     * called when the gesture isn't allowed to recognize
     * like when another is being recognized or it is disabled
     * @virtual
     */
    reset: function() { }
};

/**
 * get a usable string, used as event postfix
 * @param {Const} state
 * @returns {String} state
 */
function stateStr(state) {
    if (state & STATE_CANCELLED) {
        return 'cancel';
    } else if (state & STATE_ENDED) {
        return 'end';
    } else if (state & STATE_CHANGED) {
        return 'move';
    } else if (state & STATE_BEGAN) {
        return 'start';
    }
    return '';
}

/**
 * direction cons to string
 * @param {Const} direction
 * @returns {String}
 */
function directionStr(direction) {
    if (direction == DIRECTION_DOWN) {
        return 'down';
    } else if (direction == DIRECTION_UP) {
        return 'up';
    } else if (direction == DIRECTION_LEFT) {
        return 'left';
    } else if (direction == DIRECTION_RIGHT) {
        return 'right';
    }
    return '';
}

/**
 * get a recognizer by name if it is bound to a manager
 * @param {Recognizer|String} otherRecognizer
 * @param {Recognizer} recognizer
 * @returns {Recognizer}
 */
function getRecognizerByNameIfManager(otherRecognizer, recognizer) {
    var manager = recognizer.manager;
    if (manager) {
        return manager.get(otherRecognizer);
    }
    return otherRecognizer;
}

/**
 * This recognizer is just used as a base for the simple attribute recognizers.
 * @constructor
 * @extends Recognizer
 */
function AttrRecognizer() {
    Recognizer.apply(this, arguments);
}

inherit(AttrRecognizer, Recognizer, {
    /**
     * @namespace
     * @memberof AttrRecognizer
     */
    defaults: {
        /**
         * @type {Number}
         * @default 1
         */
        pointers: 1
    },

    /**
     * Used to check if it the recognizer receives valid input, like input.distance > 10.
     * @memberof AttrRecognizer
     * @param {Object} input
     * @returns {Boolean} recognized
     */
    attrTest: function(input) {
        var optionPointers = this.options.pointers;
        return optionPointers === 0 || input.pointers.length === optionPointers;
    },

    /**
     * Process the input and return the state for the recognizer
     * @memberof AttrRecognizer
     * @param {Object} input
     * @returns {*} State
     */
    process: function(input) {
        var state = this.state;
        var eventType = input.eventType;

        var isRecognized = state & (STATE_BEGAN | STATE_CHANGED);
        var isValid = this.attrTest(input);

        // on cancel input and we've recognized before, return STATE_CANCELLED
        if (isRecognized && (eventType & INPUT_CANCEL || !isValid)) {
            return state | STATE_CANCELLED;
        } else if (isRecognized || isValid) {
            if (eventType & INPUT_END) {
                return state | STATE_ENDED;
            } else if (!(state & STATE_BEGAN)) {
                return STATE_BEGAN;
            }
            return state | STATE_CHANGED;
        }
        return STATE_FAILED;
    }
});

/**
 * Pan
 * Recognized when the pointer is down and moved in the allowed direction.
 * @constructor
 * @extends AttrRecognizer
 */
function PanRecognizer() {
    AttrRecognizer.apply(this, arguments);

    this.pX = null;
    this.pY = null;
}

inherit(PanRecognizer, AttrRecognizer, {
    /**
     * @namespace
     * @memberof PanRecognizer
     */
    defaults: {
        event: 'pan',
        threshold: 10,
        pointers: 1,
        direction: DIRECTION_ALL
    },

    getTouchAction: function() {
        var direction = this.options.direction;
        var actions = [];
        if (direction & DIRECTION_HORIZONTAL) {
            actions.push(TOUCH_ACTION_PAN_Y);
        }
        if (direction & DIRECTION_VERTICAL) {
            actions.push(TOUCH_ACTION_PAN_X);
        }
        return actions;
    },

    directionTest: function(input) {
        var options = this.options;
        var hasMoved = true;
        var distance = input.distance;
        var direction = input.direction;
        var x = input.deltaX;
        var y = input.deltaY;

        // lock to axis?
        if (!(direction & options.direction)) {
            if (options.direction & DIRECTION_HORIZONTAL) {
                direction = (x === 0) ? DIRECTION_NONE : (x < 0) ? DIRECTION_LEFT : DIRECTION_RIGHT;
                hasMoved = x != this.pX;
                distance = Math.abs(input.deltaX);
            } else {
                direction = (y === 0) ? DIRECTION_NONE : (y < 0) ? DIRECTION_UP : DIRECTION_DOWN;
                hasMoved = y != this.pY;
                distance = Math.abs(input.deltaY);
            }
        }
        input.direction = direction;
        return hasMoved && distance > options.threshold && direction & options.direction;
    },

    attrTest: function(input) {
        return AttrRecognizer.prototype.attrTest.call(this, input) &&
            (this.state & STATE_BEGAN || (!(this.state & STATE_BEGAN) && this.directionTest(input)));
    },

    emit: function(input) {

        this.pX = input.deltaX;
        this.pY = input.deltaY;

        var direction = directionStr(input.direction);

        if (direction) {
            input.additionalEvent = this.options.event + direction;
        }
        this._super.emit.call(this, input);
    }
});

/**
 * Pinch
 * Recognized when two or more pointers are moving toward (zoom-in) or away from each other (zoom-out).
 * @constructor
 * @extends AttrRecognizer
 */
function PinchRecognizer() {
    AttrRecognizer.apply(this, arguments);
}

inherit(PinchRecognizer, AttrRecognizer, {
    /**
     * @namespace
     * @memberof PinchRecognizer
     */
    defaults: {
        event: 'pinch',
        threshold: 0,
        pointers: 2
    },

    getTouchAction: function() {
        return [TOUCH_ACTION_NONE];
    },

    attrTest: function(input) {
        return this._super.attrTest.call(this, input) &&
            (Math.abs(input.scale - 1) > this.options.threshold || this.state & STATE_BEGAN);
    },

    emit: function(input) {
        if (input.scale !== 1) {
            var inOut = input.scale < 1 ? 'in' : 'out';
            input.additionalEvent = this.options.event + inOut;
        }
        this._super.emit.call(this, input);
    }
});

/**
 * Press
 * Recognized when the pointer is down for x ms without any movement.
 * @constructor
 * @extends Recognizer
 */
function PressRecognizer() {
    Recognizer.apply(this, arguments);

    this._timer = null;
    this._input = null;
}

inherit(PressRecognizer, Recognizer, {
    /**
     * @namespace
     * @memberof PressRecognizer
     */
    defaults: {
        event: 'press',
        pointers: 1,
        time: 251, // minimal time of the pointer to be pressed
        threshold: 9 // a minimal movement is ok, but keep it low
    },

    getTouchAction: function() {
        return [TOUCH_ACTION_AUTO];
    },

    process: function(input) {
        var options = this.options;
        var validPointers = input.pointers.length === options.pointers;
        var validMovement = input.distance < options.threshold;
        var validTime = input.deltaTime > options.time;

        this._input = input;

        // we only allow little movement
        // and we've reached an end event, so a tap is possible
        if (!validMovement || !validPointers || (input.eventType & (INPUT_END | INPUT_CANCEL) && !validTime)) {
            this.reset();
        } else if (input.eventType & INPUT_START) {
            this.reset();
            this._timer = setTimeoutContext(function() {
                this.state = STATE_RECOGNIZED;
                this.tryEmit();
            }, options.time, this);
        } else if (input.eventType & INPUT_END) {
            return STATE_RECOGNIZED;
        }
        return STATE_FAILED;
    },

    reset: function() {
        clearTimeout(this._timer);
    },

    emit: function(input) {
        if (this.state !== STATE_RECOGNIZED) {
            return;
        }

        if (input && (input.eventType & INPUT_END)) {
            this.manager.emit(this.options.event + 'up', input);
        } else {
            this._input.timeStamp = now();
            this.manager.emit(this.options.event, this._input);
        }
    }
});

/**
 * Rotate
 * Recognized when two or more pointer are moving in a circular motion.
 * @constructor
 * @extends AttrRecognizer
 */
function RotateRecognizer() {
    AttrRecognizer.apply(this, arguments);
}

inherit(RotateRecognizer, AttrRecognizer, {
    /**
     * @namespace
     * @memberof RotateRecognizer
     */
    defaults: {
        event: 'rotate',
        threshold: 0,
        pointers: 2
    },

    getTouchAction: function() {
        return [TOUCH_ACTION_NONE];
    },

    attrTest: function(input) {
        return this._super.attrTest.call(this, input) &&
            (Math.abs(input.rotation) > this.options.threshold || this.state & STATE_BEGAN);
    }
});

/**
 * Swipe
 * Recognized when the pointer is moving fast (velocity), with enough distance in the allowed direction.
 * @constructor
 * @extends AttrRecognizer
 */
function SwipeRecognizer() {
    AttrRecognizer.apply(this, arguments);
}

inherit(SwipeRecognizer, AttrRecognizer, {
    /**
     * @namespace
     * @memberof SwipeRecognizer
     */
    defaults: {
        event: 'swipe',
        threshold: 10,
        velocity: 0.3,
        direction: DIRECTION_HORIZONTAL | DIRECTION_VERTICAL,
        pointers: 1
    },

    getTouchAction: function() {
        return PanRecognizer.prototype.getTouchAction.call(this);
    },

    attrTest: function(input) {
        var direction = this.options.direction;
        var velocity;

        if (direction & (DIRECTION_HORIZONTAL | DIRECTION_VERTICAL)) {
            velocity = input.overallVelocity;
        } else if (direction & DIRECTION_HORIZONTAL) {
            velocity = input.overallVelocityX;
        } else if (direction & DIRECTION_VERTICAL) {
            velocity = input.overallVelocityY;
        }

        return this._super.attrTest.call(this, input) &&
            direction & input.offsetDirection &&
            input.distance > this.options.threshold &&
            input.maxPointers == this.options.pointers &&
            abs(velocity) > this.options.velocity && input.eventType & INPUT_END;
    },

    emit: function(input) {
        var direction = directionStr(input.offsetDirection);
        if (direction) {
            this.manager.emit(this.options.event + direction, input);
        }

        this.manager.emit(this.options.event, input);
    }
});

/**
 * A tap is ecognized when the pointer is doing a small tap/click. Multiple taps are recognized if they occur
 * between the given interval and position. The delay option can be used to recognize multi-taps without firing
 * a single tap.
 *
 * The eventData from the emitted event contains the property `tapCount`, which contains the amount of
 * multi-taps being recognized.
 * @constructor
 * @extends Recognizer
 */
function TapRecognizer() {
    Recognizer.apply(this, arguments);

    // previous time and center,
    // used for tap counting
    this.pTime = false;
    this.pCenter = false;

    this._timer = null;
    this._input = null;
    this.count = 0;
}

inherit(TapRecognizer, Recognizer, {
    /**
     * @namespace
     * @memberof PinchRecognizer
     */
    defaults: {
        event: 'tap',
        pointers: 1,
        taps: 1,
        interval: 300, // max time between the multi-tap taps
        time: 250, // max time of the pointer to be down (like finger on the screen)
        threshold: 9, // a minimal movement is ok, but keep it low
        posThreshold: 10 // a multi-tap can be a bit off the initial position
    },

    getTouchAction: function() {
        return [TOUCH_ACTION_MANIPULATION];
    },

    process: function(input) {
        var options = this.options;

        var validPointers = input.pointers.length === options.pointers;
        var validMovement = input.distance < options.threshold;
        var validTouchTime = input.deltaTime < options.time;

        this.reset();

        if ((input.eventType & INPUT_START) && (this.count === 0)) {
            return this.failTimeout();
        }

        // we only allow little movement
        // and we've reached an end event, so a tap is possible
        if (validMovement && validTouchTime && validPointers) {
            if (input.eventType != INPUT_END) {
                return this.failTimeout();
            }

            var validInterval = this.pTime ? (input.timeStamp - this.pTime < options.interval) : true;
            var validMultiTap = !this.pCenter || getDistance(this.pCenter, input.center) < options.posThreshold;

            this.pTime = input.timeStamp;
            this.pCenter = input.center;

            if (!validMultiTap || !validInterval) {
                this.count = 1;
            } else {
                this.count += 1;
            }

            this._input = input;

            // if tap count matches we have recognized it,
            // else it has began recognizing...
            var tapCount = this.count % options.taps;
            if (tapCount === 0) {
                // no failing requirements, immediately trigger the tap event
                // or wait as long as the multitap interval to trigger
                if (!this.hasRequireFailures()) {
                    return STATE_RECOGNIZED;
                } else {
                    this._timer = setTimeoutContext(function() {
                        this.state = STATE_RECOGNIZED;
                        this.tryEmit();
                    }, options.interval, this);
                    return STATE_BEGAN;
                }
            }
        }
        return STATE_FAILED;
    },

    failTimeout: function() {
        this._timer = setTimeoutContext(function() {
            this.state = STATE_FAILED;
        }, this.options.interval, this);
        return STATE_FAILED;
    },

    reset: function() {
        clearTimeout(this._timer);
    },

    emit: function() {
        if (this.state == STATE_RECOGNIZED) {
            this._input.tapCount = this.count;
            this.manager.emit(this.options.event, this._input);
        }
    }
});

/**
 * Simple way to create a manager with a default set of recognizers.
 * @param {HTMLElement} element
 * @param {Object} [options]
 * @constructor
 */
function Hammer(element, options) {
    options = options || {};
    options.recognizers = ifUndefined(options.recognizers, Hammer.defaults.preset);
    return new Manager(element, options);
}

/**
 * @const {string}
 */
Hammer.VERSION = '2.0.7';

/**
 * default settings
 * @namespace
 */
Hammer.defaults = {
    /**
     * set if DOM events are being triggered.
     * But this is slower and unused by simple implementations, so disabled by default.
     * @type {Boolean}
     * @default false
     */
    domEvents: false,

    /**
     * The value for the touchAction property/fallback.
     * When set to `compute` it will magically set the correct value based on the added recognizers.
     * @type {String}
     * @default compute
     */
    touchAction: TOUCH_ACTION_COMPUTE,

    /**
     * @type {Boolean}
     * @default true
     */
    enable: true,

    /**
     * EXPERIMENTAL FEATURE -- can be removed/changed
     * Change the parent input target element.
     * If Null, then it is being set the to main element.
     * @type {Null|EventTarget}
     * @default null
     */
    inputTarget: null,

    /**
     * force an input class
     * @type {Null|Function}
     * @default null
     */
    inputClass: null,

    /**
     * Default recognizer setup when calling `Hammer()`
     * When creating a new Manager these will be skipped.
     * @type {Array}
     */
    preset: [
        // RecognizerClass, options, [recognizeWith, ...], [requireFailure, ...]
        [RotateRecognizer, {enable: false}],
        [PinchRecognizer, {enable: false}, ['rotate']],
        [SwipeRecognizer, {direction: DIRECTION_HORIZONTAL}],
        [PanRecognizer, {direction: DIRECTION_HORIZONTAL}, ['swipe']],
        [TapRecognizer],
        [TapRecognizer, {event: 'doubletap', taps: 2}, ['tap']],
        [PressRecognizer]
    ],

    /**
     * Some CSS properties can be used to improve the working of Hammer.
     * Add them to this method and they will be set when creating a new Manager.
     * @namespace
     */
    cssProps: {
        /**
         * Disables text selection to improve the dragging gesture. Mainly for desktop browsers.
         * @type {String}
         * @default 'none'
         */
        userSelect: 'none',

        /**
         * Disable the Windows Phone grippers when pressing an element.
         * @type {String}
         * @default 'none'
         */
        touchSelect: 'none',

        /**
         * Disables the default callout shown when you touch and hold a touch target.
         * On iOS, when you touch and hold a touch target such as a link, Safari displays
         * a callout containing information about the link. This property allows you to disable that callout.
         * @type {String}
         * @default 'none'
         */
        touchCallout: 'none',

        /**
         * Specifies whether zooming is enabled. Used by IE10>
         * @type {String}
         * @default 'none'
         */
        contentZooming: 'none',

        /**
         * Specifies that an entire element should be draggable instead of its contents. Mainly for desktop browsers.
         * @type {String}
         * @default 'none'
         */
        userDrag: 'none',

        /**
         * Overrides the highlight color shown when the user taps a link or a JavaScript
         * clickable element in iOS. This property obeys the alpha value, if specified.
         * @type {String}
         * @default 'rgba(0,0,0,0)'
         */
        tapHighlightColor: 'rgba(0,0,0,0)'
    }
};

var STOP = 1;
var FORCED_STOP = 2;

/**
 * Manager
 * @param {HTMLElement} element
 * @param {Object} [options]
 * @constructor
 */
function Manager(element, options) {
    this.options = assign({}, Hammer.defaults, options || {});

    this.options.inputTarget = this.options.inputTarget || element;

    this.handlers = {};
    this.session = {};
    this.recognizers = [];
    this.oldCssProps = {};

    this.element = element;
    this.input = createInputInstance(this);
    this.touchAction = new TouchAction(this, this.options.touchAction);

    toggleCssProps(this, true);

    each(this.options.recognizers, function(item) {
        var recognizer = this.add(new (item[0])(item[1]));
        item[2] && recognizer.recognizeWith(item[2]);
        item[3] && recognizer.requireFailure(item[3]);
    }, this);
}

Manager.prototype = {
    /**
     * set options
     * @param {Object} options
     * @returns {Manager}
     */
    set: function(options) {
        assign(this.options, options);

        // Options that need a little more setup
        if (options.touchAction) {
            this.touchAction.update();
        }
        if (options.inputTarget) {
            // Clean up existing event listeners and reinitialize
            this.input.destroy();
            this.input.target = options.inputTarget;
            this.input.init();
        }
        return this;
    },

    /**
     * stop recognizing for this session.
     * This session will be discarded, when a new [input]start event is fired.
     * When forced, the recognizer cycle is stopped immediately.
     * @param {Boolean} [force]
     */
    stop: function(force) {
        this.session.stopped = force ? FORCED_STOP : STOP;
    },

    /**
     * run the recognizers!
     * called by the inputHandler function on every movement of the pointers (touches)
     * it walks through all the recognizers and tries to detect the gesture that is being made
     * @param {Object} inputData
     */
    recognize: function(inputData) {
        var session = this.session;
        if (session.stopped) {
            return;
        }

        // run the touch-action polyfill
        this.touchAction.preventDefaults(inputData);

        var recognizer;
        var recognizers = this.recognizers;

        // this holds the recognizer that is being recognized.
        // so the recognizer's state needs to be BEGAN, CHANGED, ENDED or RECOGNIZED
        // if no recognizer is detecting a thing, it is set to `null`
        var curRecognizer = session.curRecognizer;

        // reset when the last recognizer is recognized
        // or when we're in a new session
        if (!curRecognizer || (curRecognizer && curRecognizer.state & STATE_RECOGNIZED)) {
            curRecognizer = session.curRecognizer = null;
        }

        var i = 0;
        while (i < recognizers.length) {
            recognizer = recognizers[i];

            // find out if we are allowed try to recognize the input for this one.
            // 1.   allow if the session is NOT forced stopped (see the .stop() method)
            // 2.   allow if we still haven't recognized a gesture in this session, or the this recognizer is the one
            //      that is being recognized.
            // 3.   allow if the recognizer is allowed to run simultaneous with the current recognized recognizer.
            //      this can be setup with the `recognizeWith()` method on the recognizer.
            if (session.stopped !== FORCED_STOP && ( // 1
                    !curRecognizer || recognizer == curRecognizer || // 2
                    recognizer.canRecognizeWith(curRecognizer))) { // 3
                recognizer.recognize(inputData);
            } else {
                recognizer.reset();
            }

            // if the recognizer has been recognizing the input as a valid gesture, we want to store this one as the
            // current active recognizer. but only if we don't already have an active recognizer
            if (!curRecognizer && recognizer.state & (STATE_BEGAN | STATE_CHANGED | STATE_ENDED)) {
                curRecognizer = session.curRecognizer = recognizer;
            }
            i++;
        }
    },

    /**
     * get a recognizer by its event name.
     * @param {Recognizer|String} recognizer
     * @returns {Recognizer|Null}
     */
    get: function(recognizer) {
        if (recognizer instanceof Recognizer) {
            return recognizer;
        }

        var recognizers = this.recognizers;
        for (var i = 0; i < recognizers.length; i++) {
            if (recognizers[i].options.event == recognizer) {
                return recognizers[i];
            }
        }
        return null;
    },

    /**
     * add a recognizer to the manager
     * existing recognizers with the same event name will be removed
     * @param {Recognizer} recognizer
     * @returns {Recognizer|Manager}
     */
    add: function(recognizer) {
        if (invokeArrayArg(recognizer, 'add', this)) {
            return this;
        }

        // remove existing
        var existing = this.get(recognizer.options.event);
        if (existing) {
            this.remove(existing);
        }

        this.recognizers.push(recognizer);
        recognizer.manager = this;

        this.touchAction.update();
        return recognizer;
    },

    /**
     * remove a recognizer by name or instance
     * @param {Recognizer|String} recognizer
     * @returns {Manager}
     */
    remove: function(recognizer) {
        if (invokeArrayArg(recognizer, 'remove', this)) {
            return this;
        }

        recognizer = this.get(recognizer);

        // let's make sure this recognizer exists
        if (recognizer) {
            var recognizers = this.recognizers;
            var index = inArray(recognizers, recognizer);

            if (index !== -1) {
                recognizers.splice(index, 1);
                this.touchAction.update();
            }
        }

        return this;
    },

    /**
     * bind event
     * @param {String} events
     * @param {Function} handler
     * @returns {EventEmitter} this
     */
    on: function(events, handler) {
        if (events === undefined$1) {
            return;
        }
        if (handler === undefined$1) {
            return;
        }

        var handlers = this.handlers;
        each(splitStr(events), function(event) {
            handlers[event] = handlers[event] || [];
            handlers[event].push(handler);
        });
        return this;
    },

    /**
     * unbind event, leave emit blank to remove all handlers
     * @param {String} events
     * @param {Function} [handler]
     * @returns {EventEmitter} this
     */
    off: function(events, handler) {
        if (events === undefined$1) {
            return;
        }

        var handlers = this.handlers;
        each(splitStr(events), function(event) {
            if (!handler) {
                delete handlers[event];
            } else {
                handlers[event] && handlers[event].splice(inArray(handlers[event], handler), 1);
            }
        });
        return this;
    },

    /**
     * emit event to the listeners
     * @param {String} event
     * @param {Object} data
     */
    emit: function(event, data) {
        // we also want to trigger dom events
        if (this.options.domEvents) {
            triggerDomEvent(event, data);
        }

        // no handlers, so skip it all
        var handlers = this.handlers[event] && this.handlers[event].slice();
        if (!handlers || !handlers.length) {
            return;
        }

        data.type = event;
        data.preventDefault = function() {
            data.srcEvent.preventDefault();
        };

        var i = 0;
        while (i < handlers.length) {
            handlers[i](data);
            i++;
        }
    },

    /**
     * destroy the manager and unbinds all events
     * it doesn't unbind dom events, that is the user own responsibility
     */
    destroy: function() {
        this.element && toggleCssProps(this, false);

        this.handlers = {};
        this.session = {};
        this.input.destroy();
        this.element = null;
    }
};

/**
 * add/remove the css properties as defined in manager.options.cssProps
 * @param {Manager} manager
 * @param {Boolean} add
 */
function toggleCssProps(manager, add) {
    var element = manager.element;
    if (!element.style) {
        return;
    }
    var prop;
    each(manager.options.cssProps, function(value, name) {
        prop = prefixed(element.style, name);
        if (add) {
            manager.oldCssProps[prop] = element.style[prop];
            element.style[prop] = value;
        } else {
            element.style[prop] = manager.oldCssProps[prop] || '';
        }
    });
    if (!add) {
        manager.oldCssProps = {};
    }
}

/**
 * trigger dom event
 * @param {String} event
 * @param {Object} data
 */
function triggerDomEvent(event, data) {
    var gestureEvent = document.createEvent('Event');
    gestureEvent.initEvent(event, true, true);
    gestureEvent.gesture = data;
    data.target.dispatchEvent(gestureEvent);
}

assign(Hammer, {
    INPUT_START: INPUT_START,
    INPUT_MOVE: INPUT_MOVE,
    INPUT_END: INPUT_END,
    INPUT_CANCEL: INPUT_CANCEL,

    STATE_POSSIBLE: STATE_POSSIBLE,
    STATE_BEGAN: STATE_BEGAN,
    STATE_CHANGED: STATE_CHANGED,
    STATE_ENDED: STATE_ENDED,
    STATE_RECOGNIZED: STATE_RECOGNIZED,
    STATE_CANCELLED: STATE_CANCELLED,
    STATE_FAILED: STATE_FAILED,

    DIRECTION_NONE: DIRECTION_NONE,
    DIRECTION_LEFT: DIRECTION_LEFT,
    DIRECTION_RIGHT: DIRECTION_RIGHT,
    DIRECTION_UP: DIRECTION_UP,
    DIRECTION_DOWN: DIRECTION_DOWN,
    DIRECTION_HORIZONTAL: DIRECTION_HORIZONTAL,
    DIRECTION_VERTICAL: DIRECTION_VERTICAL,
    DIRECTION_ALL: DIRECTION_ALL,

    Manager: Manager,
    Input: Input,
    TouchAction: TouchAction,

    TouchInput: TouchInput,
    MouseInput: MouseInput,
    PointerEventInput: PointerEventInput,
    TouchMouseInput: TouchMouseInput,
    SingleTouchInput: SingleTouchInput,

    Recognizer: Recognizer,
    AttrRecognizer: AttrRecognizer,
    Tap: TapRecognizer,
    Pan: PanRecognizer,
    Swipe: SwipeRecognizer,
    Pinch: PinchRecognizer,
    Rotate: RotateRecognizer,
    Press: PressRecognizer,

    on: addEventListeners,
    off: removeEventListeners,
    each: each,
    merge: merge,
    extend: extend,
    assign: assign,
    inherit: inherit,
    bindFn: bindFn,
    prefixed: prefixed
});

// this prevents errors when Hammer is loaded in the presence of an AMD
//  style loader but by script tag, not by the loader.
var freeGlobal = (typeof window !== 'undefined' ? window : (typeof self !== 'undefined' ? self : {})); // jshint ignore:line
freeGlobal.Hammer = Hammer;

if (typeof undefined$1 === 'function' && undefined$1.amd) {
    undefined$1(function() {
        return Hammer;
    });
} else if ( module.exports) {
    module.exports = Hammer;
} else {
    window[exportName] = Hammer;
}

})(window, document, 'Hammer');
});

var INPUT_START = 1;
var INPUT_MOVE = 2;
var INPUT_END = 4;
var MOUSE_INPUT_MAP = {
  mousedown: INPUT_START,
  mousemove: INPUT_MOVE,
  mouseup: INPUT_END
};

function some(array, predict) {
  for (var i = 0; i < array.length; i++) {
    if (predict(array[i])) {
      return true;
    }
  }

  return false;
}

function enhancePointerEventInput(PointerEventInput) {
  var oldHandler = PointerEventInput.prototype.handler;

  PointerEventInput.prototype.handler = function handler(ev) {
    var store = this.store;

    if (ev.button > 0) {
      if (!some(store, function (e) {
        return e.pointerId === ev.pointerId;
      })) {
        store.push(ev);
      }
    }

    oldHandler.call(this, ev);
  };
}
function enhanceMouseInput(MouseInput) {
  MouseInput.prototype.handler = function handler(ev) {
    var eventType = MOUSE_INPUT_MAP[ev.type];

    if (eventType & INPUT_START && ev.button >= 0) {
      this.pressed = true;
    }

    if (eventType & INPUT_MOVE && ev.which === 0) {
      eventType = INPUT_END;
    }

    if (!this.pressed) {
      return;
    }

    if (eventType & INPUT_END) {
      this.pressed = false;
    }

    this.callback(this.manager, eventType, {
      pointers: [ev],
      changedPointers: [ev],
      pointerType: 'mouse',
      srcEvent: ev
    });
  };
}

enhancePointerEventInput(hammer.PointerEventInput);
enhanceMouseInput(hammer.MouseInput);
var Manager = hammer.Manager;

var RECOGNIZERS = hammer ? [[hammer.Rotate, {
  enable: false
}], [hammer.Pinch, {
  enable: false
}], [hammer.Swipe, {
  enable: false
}], [hammer.Pan, {
  threshold: 0,
  enable: false
}], [hammer.Press, {
  enable: false
}], [hammer.Tap, {
  event: 'doubletap',
  taps: 2,
  enable: false
}], [hammer.Tap, {
  event: 'anytap',
  enable: false
}], [hammer.Tap, {
  enable: false
}]] : null;
var RECOGNIZER_COMPATIBLE_MAP = {
  rotate: ['pinch'],
  pinch: ['pan'],
  pan: ['press', 'doubletap', 'anytap', 'tap'],
  doubletap: ['anytap'],
  anytap: ['tap']
};
var RECOGNIZER_FALLBACK_MAP = {
  doubletap: ['tap']
};
var BASIC_EVENT_ALIASES = {
  pointerdown: 'pointerdown',
  pointermove: 'pointermove',
  pointerup: 'pointerup',
  touchstart: 'pointerdown',
  touchmove: 'pointermove',
  touchend: 'pointerup',
  mousedown: 'pointerdown',
  mousemove: 'pointermove',
  mouseup: 'pointerup'
};
var INPUT_EVENT_TYPES = {
  KEY_EVENTS: ['keydown', 'keyup'],
  MOUSE_EVENTS: ['mousedown', 'mousemove', 'mouseup', 'mouseover', 'mouseout', 'mouseleave'],
  WHEEL_EVENTS: ['wheel', 'mousewheel', 'DOMMouseScroll']
};
var EVENT_RECOGNIZER_MAP = {
  tap: 'tap',
  anytap: 'anytap',
  doubletap: 'doubletap',
  press: 'press',
  pinch: 'pinch',
  pinchin: 'pinch',
  pinchout: 'pinch',
  pinchstart: 'pinch',
  pinchmove: 'pinch',
  pinchend: 'pinch',
  pinchcancel: 'pinch',
  rotate: 'rotate',
  rotatestart: 'rotate',
  rotatemove: 'rotate',
  rotateend: 'rotate',
  rotatecancel: 'rotate',
  pan: 'pan',
  panstart: 'pan',
  panmove: 'pan',
  panup: 'pan',
  pandown: 'pan',
  panleft: 'pan',
  panright: 'pan',
  panend: 'pan',
  pancancel: 'pan',
  swipe: 'swipe',
  swipeleft: 'swipe',
  swiperight: 'swipe',
  swipeup: 'swipe',
  swipedown: 'swipe'
};
var GESTURE_EVENT_ALIASES = {
  click: 'tap',
  anyclick: 'anytap',
  dblclick: 'doubletap',
  mousedown: 'pointerdown',
  mousemove: 'pointermove',
  mouseup: 'pointerup',
  mouseover: 'pointerover',
  mouseout: 'pointerout',
  mouseleave: 'pointerleave'
};

var userAgent = typeof navigator !== 'undefined' && navigator.userAgent ? navigator.userAgent.toLowerCase() : '';
var window_ = typeof window !== 'undefined' ? window : global;
var passiveSupported = false;

try {
  var options = {
    get passive() {
      passiveSupported = true;
      return true;
    }

  };
  window_.addEventListener('test', options, options);
  window_.removeEventListener('test', options, options);
} catch (err) {}

var firefox = userAgent.indexOf('firefox') !== -1;
var WHEEL_EVENTS = INPUT_EVENT_TYPES.WHEEL_EVENTS;
var EVENT_TYPE = 'wheel';
var WHEEL_DELTA_MAGIC_SCALER = 4.000244140625;
var WHEEL_DELTA_PER_LINE = 40;
var SHIFT_MULTIPLIER = 0.25;

var WheelInput = function () {
  function WheelInput(element, callback) {
    var _this = this;

    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

    _classCallCheck(this, WheelInput);

    this.element = element;
    this.callback = callback;
    this.options = Object.assign({
      enable: true
    }, options);
    this.events = WHEEL_EVENTS.concat(options.events || []);
    this.handleEvent = this.handleEvent.bind(this);
    this.events.forEach(function (event) {
      return element.addEventListener(event, _this.handleEvent, passiveSupported ? {
        passive: false
      } : false);
    });
  }

  _createClass(WheelInput, [{
    key: "destroy",
    value: function destroy() {
      var _this2 = this;

      this.events.forEach(function (event) {
        return _this2.element.removeEventListener(event, _this2.handleEvent);
      });
    }
  }, {
    key: "enableEventType",
    value: function enableEventType(eventType, enabled) {
      if (eventType === EVENT_TYPE) {
        this.options.enable = enabled;
      }
    }
  }, {
    key: "handleEvent",
    value: function handleEvent(event) {
      if (!this.options.enable) {
        return;
      }

      var value = event.deltaY;

      if (window_.WheelEvent) {
        if (firefox && event.deltaMode === window_.WheelEvent.DOM_DELTA_PIXEL) {
          value /= window_.devicePixelRatio;
        }

        if (event.deltaMode === window_.WheelEvent.DOM_DELTA_LINE) {
          value *= WHEEL_DELTA_PER_LINE;
        }
      }

      var wheelPosition = {
        x: event.clientX,
        y: event.clientY
      };

      if (value !== 0 && value % WHEEL_DELTA_MAGIC_SCALER === 0) {
        value = Math.floor(value / WHEEL_DELTA_MAGIC_SCALER);
      }

      if (event.shiftKey && value) {
        value = value * SHIFT_MULTIPLIER;
      }

      this._onWheel(event, -value, wheelPosition);
    }
  }, {
    key: "_onWheel",
    value: function _onWheel(srcEvent, delta, position) {
      this.callback({
        type: EVENT_TYPE,
        center: position,
        delta: delta,
        srcEvent: srcEvent,
        pointerType: 'mouse',
        target: srcEvent.target
      });
    }
  }]);

  return WheelInput;
}();

var MOUSE_EVENTS = INPUT_EVENT_TYPES.MOUSE_EVENTS;
var MOVE_EVENT_TYPE = 'pointermove';
var OVER_EVENT_TYPE = 'pointerover';
var OUT_EVENT_TYPE = 'pointerout';
var LEAVE_EVENT_TYPE = 'pointerleave';

var MoveInput = function () {
  function MoveInput(element, callback) {
    var _this = this;

    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

    _classCallCheck(this, MoveInput);

    this.element = element;
    this.callback = callback;
    this.pressed = false;
    this.options = Object.assign({
      enable: true
    }, options);
    this.enableMoveEvent = this.options.enable;
    this.enableLeaveEvent = this.options.enable;
    this.enableOutEvent = this.options.enable;
    this.enableOverEvent = this.options.enable;
    this.events = MOUSE_EVENTS.concat(options.events || []);
    this.handleEvent = this.handleEvent.bind(this);
    this.events.forEach(function (event) {
      return element.addEventListener(event, _this.handleEvent);
    });
  }

  _createClass(MoveInput, [{
    key: "destroy",
    value: function destroy() {
      var _this2 = this;

      this.events.forEach(function (event) {
        return _this2.element.removeEventListener(event, _this2.handleEvent);
      });
    }
  }, {
    key: "enableEventType",
    value: function enableEventType(eventType, enabled) {
      if (eventType === MOVE_EVENT_TYPE) {
        this.enableMoveEvent = enabled;
      }

      if (eventType === OVER_EVENT_TYPE) {
        this.enableOverEvent = enabled;
      }

      if (eventType === OUT_EVENT_TYPE) {
        this.enableOutEvent = enabled;
      }

      if (eventType === LEAVE_EVENT_TYPE) {
        this.enableLeaveEvent = enabled;
      }
    }
  }, {
    key: "handleEvent",
    value: function handleEvent(event) {
      this.handleOverEvent(event);
      this.handleOutEvent(event);
      this.handleLeaveEvent(event);
      this.handleMoveEvent(event);
    }
  }, {
    key: "handleOverEvent",
    value: function handleOverEvent(event) {
      if (this.enableOverEvent) {
        if (event.type === 'mouseover') {
          this.callback({
            type: OVER_EVENT_TYPE,
            srcEvent: event,
            pointerType: 'mouse',
            target: event.target
          });
        }
      }
    }
  }, {
    key: "handleOutEvent",
    value: function handleOutEvent(event) {
      if (this.enableOutEvent) {
        if (event.type === 'mouseout') {
          this.callback({
            type: OUT_EVENT_TYPE,
            srcEvent: event,
            pointerType: 'mouse',
            target: event.target
          });
        }
      }
    }
  }, {
    key: "handleLeaveEvent",
    value: function handleLeaveEvent(event) {
      if (this.enableLeaveEvent) {
        if (event.type === 'mouseleave') {
          this.callback({
            type: LEAVE_EVENT_TYPE,
            srcEvent: event,
            pointerType: 'mouse',
            target: event.target
          });
        }
      }
    }
  }, {
    key: "handleMoveEvent",
    value: function handleMoveEvent(event) {
      if (this.enableMoveEvent) {
        switch (event.type) {
          case 'mousedown':
            if (event.button >= 0) {
              this.pressed = true;
            }

            break;

          case 'mousemove':
            if (event.which === 0) {
              this.pressed = false;
            }

            if (!this.pressed) {
              this.callback({
                type: MOVE_EVENT_TYPE,
                srcEvent: event,
                pointerType: 'mouse',
                target: event.target
              });
            }

            break;

          case 'mouseup':
            this.pressed = false;
            break;
        }
      }
    }
  }]);

  return MoveInput;
}();

var KEY_EVENTS = INPUT_EVENT_TYPES.KEY_EVENTS;
var DOWN_EVENT_TYPE = 'keydown';
var UP_EVENT_TYPE = 'keyup';

var KeyInput = function () {
  function KeyInput(element, callback) {
    var _this = this;

    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

    _classCallCheck(this, KeyInput);

    this.element = element;
    this.callback = callback;
    this.options = Object.assign({
      enable: true
    }, options);
    this.enableDownEvent = this.options.enable;
    this.enableUpEvent = this.options.enable;
    this.events = KEY_EVENTS.concat(options.events || []);
    this.handleEvent = this.handleEvent.bind(this);
    element.tabIndex = options.tabIndex || 0;
    element.style.outline = 'none';
    this.events.forEach(function (event) {
      return element.addEventListener(event, _this.handleEvent);
    });
  }

  _createClass(KeyInput, [{
    key: "destroy",
    value: function destroy() {
      var _this2 = this;

      this.events.forEach(function (event) {
        return _this2.element.removeEventListener(event, _this2.handleEvent);
      });
    }
  }, {
    key: "enableEventType",
    value: function enableEventType(eventType, enabled) {
      if (eventType === DOWN_EVENT_TYPE) {
        this.enableDownEvent = enabled;
      }

      if (eventType === UP_EVENT_TYPE) {
        this.enableUpEvent = enabled;
      }
    }
  }, {
    key: "handleEvent",
    value: function handleEvent(event) {
      var targetElement = event.target || event.srcElement;

      if (targetElement.tagName === 'INPUT' && targetElement.type === 'text' || targetElement.tagName === 'TEXTAREA') {
        return;
      }

      if (this.enableDownEvent && event.type === 'keydown') {
        this.callback({
          type: DOWN_EVENT_TYPE,
          srcEvent: event,
          key: event.key,
          target: event.target
        });
      }

      if (this.enableUpEvent && event.type === 'keyup') {
        this.callback({
          type: UP_EVENT_TYPE,
          srcEvent: event,
          key: event.key,
          target: event.target
        });
      }
    }
  }]);

  return KeyInput;
}();

var EVENT_TYPE$1 = 'contextmenu';

var ContextmenuInput = function () {
  function ContextmenuInput(element, callback) {
    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

    _classCallCheck(this, ContextmenuInput);

    this.element = element;
    this.callback = callback;
    this.options = Object.assign({
      enable: true
    }, options);
    this.handleEvent = this.handleEvent.bind(this);
    element.addEventListener('contextmenu', this.handleEvent);
  }

  _createClass(ContextmenuInput, [{
    key: "destroy",
    value: function destroy() {
      this.element.removeEventListener('contextmenu', this.handleEvent);
    }
  }, {
    key: "enableEventType",
    value: function enableEventType(eventType, enabled) {
      if (eventType === EVENT_TYPE$1) {
        this.options.enable = enabled;
      }
    }
  }, {
    key: "handleEvent",
    value: function handleEvent(event) {
      if (!this.options.enable) {
        return;
      }

      this.callback({
        type: EVENT_TYPE$1,
        center: {
          x: event.clientX,
          y: event.clientY
        },
        srcEvent: event,
        pointerType: 'mouse',
        target: event.target
      });
    }
  }]);

  return ContextmenuInput;
}();

var DOWN_EVENT = 1;
var MOVE_EVENT = 2;
var UP_EVENT = 4;
var MOUSE_EVENTS$1 = {
  pointerdown: DOWN_EVENT,
  pointermove: MOVE_EVENT,
  pointerup: UP_EVENT,
  mousedown: DOWN_EVENT,
  mousemove: MOVE_EVENT,
  mouseup: UP_EVENT
};
var MOUSE_EVENT_WHICH_LEFT = 1;
var MOUSE_EVENT_WHICH_MIDDLE = 2;
var MOUSE_EVENT_WHICH_RIGHT = 3;
var MOUSE_EVENT_BUTTON_LEFT = 0;
var MOUSE_EVENT_BUTTON_MIDDLE = 1;
var MOUSE_EVENT_BUTTON_RIGHT = 2;
var MOUSE_EVENT_BUTTONS_LEFT_MASK = 1;
var MOUSE_EVENT_BUTTONS_RIGHT_MASK = 2;
var MOUSE_EVENT_BUTTONS_MIDDLE_MASK = 4;
function whichButtons(event) {
  var eventType = MOUSE_EVENTS$1[event.srcEvent.type];

  if (!eventType) {
    return null;
  }

  var _event$srcEvent = event.srcEvent,
      buttons = _event$srcEvent.buttons,
      button = _event$srcEvent.button,
      which = _event$srcEvent.which;
  var leftButton = false;
  var middleButton = false;
  var rightButton = false;

  if (eventType === UP_EVENT || eventType === MOVE_EVENT && !Number.isFinite(buttons)) {
    leftButton = which === MOUSE_EVENT_WHICH_LEFT;
    middleButton = which === MOUSE_EVENT_WHICH_MIDDLE;
    rightButton = which === MOUSE_EVENT_WHICH_RIGHT;
  } else if (eventType === MOVE_EVENT) {
    leftButton = Boolean(buttons & MOUSE_EVENT_BUTTONS_LEFT_MASK);
    middleButton = Boolean(buttons & MOUSE_EVENT_BUTTONS_MIDDLE_MASK);
    rightButton = Boolean(buttons & MOUSE_EVENT_BUTTONS_RIGHT_MASK);
  } else if (eventType === DOWN_EVENT) {
    leftButton = button === MOUSE_EVENT_BUTTON_LEFT;
    middleButton = button === MOUSE_EVENT_BUTTON_MIDDLE;
    rightButton = button === MOUSE_EVENT_BUTTON_RIGHT;
  }

  return {
    leftButton: leftButton,
    middleButton: middleButton,
    rightButton: rightButton
  };
}
function getOffsetPosition(event, rootElement) {
  var srcEvent = event.srcEvent;

  if (!event.center && !Number.isFinite(srcEvent.clientX)) {
    return null;
  }

  var center = event.center || {
    x: srcEvent.clientX,
    y: srcEvent.clientY
  };
  var rect = rootElement.getBoundingClientRect();
  var scaleX = rect.width / rootElement.offsetWidth;
  var scaleY = rect.height / rootElement.offsetHeight;
  var offsetCenter = {
    x: (center.x - rect.left - rootElement.clientLeft) / scaleX,
    y: (center.y - rect.top - rootElement.clientTop) / scaleY
  };
  return {
    center: center,
    offsetCenter: offsetCenter
  };
}

var DEFAULT_OPTIONS = {
  srcElement: 'root',
  priority: 0
};

var EventRegistrar = function () {
  function EventRegistrar(eventManager) {
    _classCallCheck(this, EventRegistrar);

    this.eventManager = eventManager;
    this.handlers = [];
    this.handlersByElement = new Map();
    this.handleEvent = this.handleEvent.bind(this);
    this._active = false;
  }

  _createClass(EventRegistrar, [{
    key: "isEmpty",
    value: function isEmpty() {
      return !this._active;
    }
  }, {
    key: "add",
    value: function add(type, handler, opts) {
      var once = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
      var passive = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : false;
      var handlers = this.handlers,
          handlersByElement = this.handlersByElement;

      if (opts && (_typeof(opts) !== 'object' || opts.addEventListener)) {
        opts = {
          srcElement: opts
        };
      }

      opts = opts ? Object.assign({}, DEFAULT_OPTIONS, opts) : DEFAULT_OPTIONS;
      var entries = handlersByElement.get(opts.srcElement);

      if (!entries) {
        entries = [];
        handlersByElement.set(opts.srcElement, entries);
      }

      var entry = {
        type: type,
        handler: handler,
        srcElement: opts.srcElement,
        priority: opts.priority
      };

      if (once) {
        entry.once = true;
      }

      if (passive) {
        entry.passive = true;
      }

      handlers.push(entry);
      this._active = this._active || !entry.passive;
      var insertPosition = entries.length - 1;

      while (insertPosition >= 0) {
        if (entries[insertPosition].priority >= entry.priority) {
          break;
        }

        insertPosition--;
      }

      entries.splice(insertPosition + 1, 0, entry);
    }
  }, {
    key: "remove",
    value: function remove(type, handler) {
      var handlers = this.handlers,
          handlersByElement = this.handlersByElement;

      for (var i = handlers.length - 1; i >= 0; i--) {
        var entry = handlers[i];

        if (entry.type === type && entry.handler === handler) {
          handlers.splice(i, 1);
          var entries = handlersByElement.get(entry.srcElement);
          entries.splice(entries.indexOf(entry), 1);

          if (entries.length === 0) {
            handlersByElement["delete"](entry.srcElement);
          }
        }
      }

      this._active = handlers.some(function (entry) {
        return !entry.passive;
      });
    }
  }, {
    key: "handleEvent",
    value: function handleEvent(event) {
      if (this.isEmpty()) {
        return;
      }

      var mjolnirEvent = this._normalizeEvent(event);

      var target = event.srcEvent.target;

      while (target && target !== mjolnirEvent.rootElement) {
        this._emit(mjolnirEvent, target);

        if (mjolnirEvent.handled) {
          return;
        }

        target = target.parentNode;
      }

      this._emit(mjolnirEvent, 'root');
    }
  }, {
    key: "_emit",
    value: function _emit(event, srcElement) {
      var entries = this.handlersByElement.get(srcElement);

      if (entries) {
        var immediatePropagationStopped = false;

        var stopPropagation = function stopPropagation() {
          event.handled = true;
        };

        var stopImmediatePropagation = function stopImmediatePropagation() {
          event.handled = true;
          immediatePropagationStopped = true;
        };

        var entriesToRemove = [];

        for (var i = 0; i < entries.length; i++) {
          var _entries$i = entries[i],
              type = _entries$i.type,
              handler = _entries$i.handler,
              once = _entries$i.once;
          handler(Object.assign({}, event, {
            type: type,
            stopPropagation: stopPropagation,
            stopImmediatePropagation: stopImmediatePropagation
          }));

          if (once) {
            entriesToRemove.push(entries[i]);
          }

          if (immediatePropagationStopped) {
            break;
          }
        }

        for (var _i = 0; _i < entriesToRemove.length; _i++) {
          var _entriesToRemove$_i = entriesToRemove[_i],
              type = _entriesToRemove$_i.type,
              handler = _entriesToRemove$_i.handler;
          this.remove(type, handler);
        }
      }
    }
  }, {
    key: "_normalizeEvent",
    value: function _normalizeEvent(event) {
      var rootElement = this.eventManager.element;
      return Object.assign({}, event, whichButtons(event), getOffsetPosition(event, rootElement), {
        handled: false,
        rootElement: rootElement
      });
    }
  }]);

  return EventRegistrar;
}();

var DEFAULT_OPTIONS$1 = {
  events: null,
  recognizers: null,
  recognizerOptions: {},
  Manager: Manager,
  touchAction: 'none',
  tabIndex: 0
};

var EventManager = function () {
  function EventManager() {
    var element = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    _classCallCheck(this, EventManager);

    this.options = Object.assign({}, DEFAULT_OPTIONS$1, options);
    this.events = new Map();
    this._onBasicInput = this._onBasicInput.bind(this);
    this._onOtherEvent = this._onOtherEvent.bind(this);
    this.setElement(element);
    var events = options.events;

    if (events) {
      this.on(events);
    }
  }

  _createClass(EventManager, [{
    key: "setElement",
    value: function setElement(element) {
      var _this = this;

      if (this.element) {
        this.destroy();
      }

      this.element = element;

      if (!element) {
        return;
      }

      var options = this.options;
      var ManagerClass = options.Manager;
      this.manager = new ManagerClass(element, {
        touchAction: options.touchAction,
        recognizers: options.recognizers || RECOGNIZERS
      }).on('hammer.input', this._onBasicInput);

      if (!options.recognizers) {
        Object.keys(RECOGNIZER_COMPATIBLE_MAP).forEach(function (name) {
          var recognizer = _this.manager.get(name);

          if (recognizer) {
            RECOGNIZER_COMPATIBLE_MAP[name].forEach(function (otherName) {
              recognizer.recognizeWith(otherName);
            });
          }
        });
      }

      for (var recognizerName in options.recognizerOptions) {
        var recognizer = this.manager.get(recognizerName);

        if (recognizer) {
          var recognizerOption = options.recognizerOptions[recognizerName];
          delete recognizerOption.enable;
          recognizer.set(recognizerOption);
        }
      }

      this.wheelInput = new WheelInput(element, this._onOtherEvent, {
        enable: false
      });
      this.moveInput = new MoveInput(element, this._onOtherEvent, {
        enable: false
      });
      this.keyInput = new KeyInput(element, this._onOtherEvent, {
        enable: false,
        tabIndex: options.tabIndex
      });
      this.contextmenuInput = new ContextmenuInput(element, this._onOtherEvent, {
        enable: false
      });
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = this.events[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var _step$value = _slicedToArray(_step.value, 2),
              eventAlias = _step$value[0],
              eventRegistrar = _step$value[1];

          if (!eventRegistrar.isEmpty()) {
            this._toggleRecognizer(eventRegistrar.recognizerName, true);

            this.manager.on(eventAlias, eventRegistrar.handleEvent);
          }
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator["return"] != null) {
            _iterator["return"]();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }
    }
  }, {
    key: "destroy",
    value: function destroy() {
      if (this.element) {
        this.wheelInput.destroy();
        this.moveInput.destroy();
        this.keyInput.destroy();
        this.contextmenuInput.destroy();
        this.manager.destroy();
        this.wheelInput = null;
        this.moveInput = null;
        this.keyInput = null;
        this.contextmenuInput = null;
        this.manager = null;
        this.element = null;
      }
    }
  }, {
    key: "on",
    value: function on(event, handler, opts) {
      this._addEventHandler(event, handler, opts, false);
    }
  }, {
    key: "once",
    value: function once(event, handler, opts) {
      this._addEventHandler(event, handler, opts, true);
    }
  }, {
    key: "watch",
    value: function watch(event, handler, opts) {
      this._addEventHandler(event, handler, opts, false, true);
    }
  }, {
    key: "off",
    value: function off(event, handler) {
      this._removeEventHandler(event, handler);
    }
  }, {
    key: "_toggleRecognizer",
    value: function _toggleRecognizer(name, enabled) {
      var manager = this.manager;

      if (!manager) {
        return;
      }

      var recognizer = manager.get(name);

      if (recognizer && recognizer.options.enable !== enabled) {
        recognizer.set({
          enable: enabled
        });
        var fallbackRecognizers = RECOGNIZER_FALLBACK_MAP[name];

        if (fallbackRecognizers && !this.options.recognizers) {
          fallbackRecognizers.forEach(function (otherName) {
            var otherRecognizer = manager.get(otherName);

            if (enabled) {
              otherRecognizer.requireFailure(name);
              recognizer.dropRequireFailure(otherName);
            } else {
              otherRecognizer.dropRequireFailure(name);
            }
          });
        }
      }

      this.wheelInput.enableEventType(name, enabled);
      this.moveInput.enableEventType(name, enabled);
      this.keyInput.enableEventType(name, enabled);
      this.contextmenuInput.enableEventType(name, enabled);
    }
  }, {
    key: "_addEventHandler",
    value: function _addEventHandler(event, handler, opts, once, passive) {
      if (typeof event !== 'string') {
        opts = handler;

        for (var eventName in event) {
          this._addEventHandler(eventName, event[eventName], opts, once, passive);
        }

        return;
      }

      var manager = this.manager,
          events = this.events;
      var eventAlias = GESTURE_EVENT_ALIASES[event] || event;
      var eventRegistrar = events.get(eventAlias);

      if (!eventRegistrar) {
        eventRegistrar = new EventRegistrar(this);
        events.set(eventAlias, eventRegistrar);
        eventRegistrar.recognizerName = EVENT_RECOGNIZER_MAP[eventAlias] || eventAlias;

        if (manager) {
          manager.on(eventAlias, eventRegistrar.handleEvent);
        }
      }

      eventRegistrar.add(event, handler, opts, once, passive);

      if (!eventRegistrar.isEmpty()) {
        this._toggleRecognizer(eventRegistrar.recognizerName, true);
      }
    }
  }, {
    key: "_removeEventHandler",
    value: function _removeEventHandler(event, handler) {
      if (typeof event !== 'string') {
        for (var eventName in event) {
          this._removeEventHandler(eventName, event[eventName]);
        }

        return;
      }

      var events = this.events;
      var eventAlias = GESTURE_EVENT_ALIASES[event] || event;
      var eventRegistrar = events.get(eventAlias);

      if (!eventRegistrar) {
        return;
      }

      eventRegistrar.remove(event, handler);

      if (eventRegistrar.isEmpty()) {
        var recognizerName = eventRegistrar.recognizerName;
        var isRecognizerUsed = false;
        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
          for (var _iterator2 = events.values()[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var eh = _step2.value;

            if (eh.recognizerName === recognizerName && !eh.isEmpty()) {
              isRecognizerUsed = true;
              break;
            }
          }
        } catch (err) {
          _didIteratorError2 = true;
          _iteratorError2 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion2 && _iterator2["return"] != null) {
              _iterator2["return"]();
            }
          } finally {
            if (_didIteratorError2) {
              throw _iteratorError2;
            }
          }
        }

        if (!isRecognizerUsed) {
          this._toggleRecognizer(recognizerName, false);
        }
      }
    }
  }, {
    key: "_onBasicInput",
    value: function _onBasicInput(event) {
      var srcEvent = event.srcEvent;
      var alias = BASIC_EVENT_ALIASES[srcEvent.type];

      if (alias) {
        this.manager.emit(alias, event);
      }
    }
  }, {
    key: "_onOtherEvent",
    value: function _onOtherEvent(event) {
      this.manager.emit(event.type, event);
    }
  }]);

  return EventManager;
}();

function ownKeys$5(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread$5(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys$5(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys$5(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _createForOfIteratorHelper$9(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray$9(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray$9(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray$9(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray$9(o, minLen); }

function _arrayLikeToArray$9(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function noop() {}

var getCursor = function getCursor(_ref) {
  var isDragging = _ref.isDragging;
  return isDragging ? 'grabbing' : 'grab';
};

function getPropTypes(PropTypes) {
  return {
    id: PropTypes.string,
    width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    layers: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
    layerFilter: PropTypes.func,
    views: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
    viewState: PropTypes.object,
    effects: PropTypes.arrayOf(PropTypes.instanceOf(Effect)),
    controller: PropTypes.oneOfType([PropTypes.func, PropTypes.bool, PropTypes.object]),
    gl: PropTypes.object,
    glOptions: PropTypes.object,
    parameters: PropTypes.object,
    pickingRadius: PropTypes.number,
    useDevicePixels: PropTypes.oneOfType([PropTypes.bool, PropTypes.number]),
    touchAction: PropTypes.string,
    onWebGLInitialized: PropTypes.func,
    onResize: PropTypes.func,
    onViewStateChange: PropTypes.func,
    onBeforeRender: PropTypes.func,
    onAfterRender: PropTypes.func,
    onLoad: PropTypes.func,
    onError: PropTypes.func,
    debug: PropTypes.bool,
    drawPickingColors: PropTypes.bool,
    _framebuffer: PropTypes.object,
    _animate: PropTypes.bool,
    _pickable: PropTypes.bool,
    _typedArrayManagerProps: PropTypes.object
  };
}

var defaultProps = {
  id: 'deckgl-overlay',
  width: '100%',
  height: '100%',
  pickingRadius: 0,
  layerFilter: null,
  glOptions: {},
  gl: null,
  layers: [],
  effects: [],
  views: null,
  controller: null,
  useDevicePixels: true,
  touchAction: 'none',
  _framebuffer: null,
  _animate: false,
  _pickable: true,
  _typedArrayManagerProps: {},
  onWebGLInitialized: noop,
  onResize: noop,
  onViewStateChange: noop,
  onBeforeRender: noop,
  onAfterRender: noop,
  onLoad: noop,
  onError: null,
  _onMetrics: null,
  getCursor: getCursor,
  debug: false,
  drawPickingColors: false
};

var Deck = function () {
  function Deck(props) {
    _classCallCheck(this, Deck);

    props = Object.assign({}, defaultProps, props);
    this.props = {};
    this.width = 0;
    this.height = 0;
    this.viewManager = null;
    this.layerManager = null;
    this.effectManager = null;
    this.deckRenderer = null;
    this.deckPicker = null;
    this._needsRedraw = true;
    this._pickRequest = {};
    this._lastPointerDownInfo = null;
    this.viewState = null;
    this.interactiveState = {
      isDragging: false
    };
    this._onEvent = this._onEvent.bind(this);
    this._onPointerDown = this._onPointerDown.bind(this);
    this._onPointerMove = this._onPointerMove.bind(this);
    this._pickAndCallback = this._pickAndCallback.bind(this);
    this._onRendererInitialized = this._onRendererInitialized.bind(this);
    this._onRenderFrame = this._onRenderFrame.bind(this);
    this._onViewStateChange = this._onViewStateChange.bind(this);
    this._onInteractiveStateChange = this._onInteractiveStateChange.bind(this);

    if (props.viewState && props.initialViewState) {
      log.warn('View state tracking is disabled. Use either `initialViewState` for auto update or `viewState` for manual update.')();
    }

    if (env.getBrowser() === 'IE') {
      log.warn('IE 11 support will be deprecated in v8.0')();
    }

    if (!props.gl) {
      if (typeof document !== 'undefined') {
        this.canvas = this._createCanvas(props);
      }
    }

    this.animationLoop = this._createAnimationLoop(props);
    this.stats = new Stats({
      id: 'deck.gl'
    });
    this.metrics = {
      fps: 0,
      setPropsTime: 0,
      updateAttributesTime: 0,
      framesRedrawn: 0,
      pickTime: 0,
      pickCount: 0,
      gpuTime: 0,
      gpuTimePerFrame: 0,
      cpuTime: 0,
      cpuTimePerFrame: 0,
      bufferMemory: 0,
      textureMemory: 0,
      renderbufferMemory: 0,
      gpuMemory: 0
    };
    this._metricsCounter = 0;
    this.setProps(props);

    if (props._typedArrayManagerProps) {
      defaultTypedArrayManager.setProps(props._typedArrayManagerProps);
    }

    this.animationLoop.start();
  }

  _createClass(Deck, [{
    key: "finalize",
    value: function finalize() {
      this.animationLoop.stop();
      this.animationLoop = null;
      this._lastPointerDownInfo = null;

      if (this.layerManager) {
        this.layerManager.finalize();
        this.layerManager = null;
        this.viewManager.finalize();
        this.viewManager = null;
        this.effectManager.finalize();
        this.effectManager = null;
        this.deckRenderer.finalize();
        this.deckRenderer = null;
        this.deckPicker.finalize();
        this.deckPicker = null;
        this.eventManager.destroy();
        this.eventManager = null;
        this.tooltip.remove();
        this.tooltip = null;
      }

      if (!this.props.canvas && !this.props.gl && this.canvas) {
        this.canvas.parentElement.removeChild(this.canvas);
        this.canvas = null;
      }
    }
  }, {
    key: "setProps",
    value: function setProps(props) {
      this.stats.get('setProps Time').timeStart();

      if ('onLayerHover' in props) {
        log.removed('onLayerHover', 'onHover')();
      }

      if ('onLayerClick' in props) {
        log.removed('onLayerClick', 'onClick')();
      }

      if (props.initialViewState && !deepEqual(this.props.initialViewState, props.initialViewState)) {
        this.viewState = props.initialViewState;
      }

      Object.assign(this.props, props);

      this._setCanvasSize(this.props);

      var resolvedProps = Object.create(this.props);
      Object.assign(resolvedProps, {
        views: this._getViews(),
        width: this.width,
        height: this.height,
        viewState: this._getViewState()
      });
      this.animationLoop.setProps(resolvedProps);

      if (this.layerManager) {
        this.viewManager.setProps(resolvedProps);
        this.layerManager.activateViewport(this.getViewports()[0]);
        this.layerManager.setProps(resolvedProps);
        this.effectManager.setProps(resolvedProps);
        this.deckRenderer.setProps(resolvedProps);
        this.deckPicker.setProps(resolvedProps);
      }

      this.stats.get('setProps Time').timeEnd();
    }
  }, {
    key: "needsRedraw",
    value: function needsRedraw() {
      var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {
        clearRedrawFlags: false
      };

      if (this.props._animate) {
        return 'Deck._animate';
      }

      var redraw = this._needsRedraw;

      if (opts.clearRedrawFlags) {
        this._needsRedraw = false;
      }

      var viewManagerNeedsRedraw = this.viewManager.needsRedraw(opts);
      var layerManagerNeedsRedraw = this.layerManager.needsRedraw(opts);
      var effectManagerNeedsRedraw = this.effectManager.needsRedraw(opts);
      var deckRendererNeedsRedraw = this.deckRenderer.needsRedraw(opts);
      redraw = redraw || viewManagerNeedsRedraw || layerManagerNeedsRedraw || effectManagerNeedsRedraw || deckRendererNeedsRedraw;
      return redraw;
    }
  }, {
    key: "redraw",
    value: function redraw(force) {
      if (!this.layerManager) {
        return;
      }

      var redrawReason = force || this.needsRedraw({
        clearRedrawFlags: true
      });

      if (!redrawReason) {
        return;
      }

      this.stats.get('Redraw Count').incrementCount();

      if (this.props._customRender) {
        this.props._customRender(redrawReason);
      } else {
        this._drawLayers(redrawReason);
      }
    }
  }, {
    key: "getViews",
    value: function getViews() {
      return this.viewManager.views;
    }
  }, {
    key: "getViewports",
    value: function getViewports(rect) {
      return this.viewManager.getViewports(rect);
    }
  }, {
    key: "pickObject",
    value: function pickObject(opts) {
      var infos = this._pick('pickObject', 'pickObject Time', opts).result;

      return infos.length ? infos[0] : null;
    }
  }, {
    key: "pickMultipleObjects",
    value: function pickMultipleObjects(opts) {
      opts.depth = opts.depth || 10;
      return this._pick('pickObject', 'pickMultipleObjects Time', opts).result;
    }
  }, {
    key: "pickObjects",
    value: function pickObjects(opts) {
      return this._pick('pickObjects', 'pickObjects Time', opts);
    }
  }, {
    key: "_addResources",
    value: function _addResources(resources) {
      var forceUpdate = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

      for (var id in resources) {
        this.layerManager.resourceManager.add({
          resourceId: id,
          data: resources[id],
          forceUpdate: forceUpdate
        });
      }
    }
  }, {
    key: "_removeResources",
    value: function _removeResources(resourceIds) {
      var _iterator = _createForOfIteratorHelper$9(resourceIds),
          _step;

      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var id = _step.value;
          this.layerManager.resourceManager.remove(id);
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
    }
  }, {
    key: "_pick",
    value: function _pick(method, statKey, opts) {
      var stats = this.stats;
      stats.get('Pick Count').incrementCount();
      stats.get(statKey).timeStart();
      var infos = this.deckPicker[method](Object.assign({
        layers: this.layerManager.getLayers(opts),
        views: this.viewManager.getViews(),
        viewports: this.getViewports(opts),
        onViewportActive: this.layerManager.activateViewport
      }, opts));
      stats.get(statKey).timeEnd();
      return infos;
    }
  }, {
    key: "_createCanvas",
    value: function _createCanvas(props) {
      var canvas = props.canvas;

      if (typeof canvas === 'string') {
        canvas = document.getElementById(canvas);
        assert$2(canvas);
      }

      if (!canvas) {
        canvas = document.createElement('canvas');
        var parent = props.parent || document.body;
        parent.appendChild(canvas);
      }

      var id = props.id,
          style = props.style;
      canvas.id = id;
      Object.assign(canvas.style, style);
      return canvas;
    }
  }, {
    key: "_setCanvasSize",
    value: function _setCanvasSize(props) {
      if (!this.canvas) {
        return;
      }

      var width = props.width,
          height = props.height;

      if (width || width === 0) {
        width = Number.isFinite(width) ? "".concat(width, "px") : width;
        this.canvas.style.width = width;
      }

      if (height || height === 0) {
        height = Number.isFinite(height) ? "".concat(height, "px") : height;
        this.canvas.style.position = 'absolute';
        this.canvas.style.height = height;
      }
    }
  }, {
    key: "_updateCanvasSize",
    value: function _updateCanvasSize() {
      if (this._checkForCanvasSizeChange()) {
        var width = this.width,
            height = this.height;
        this.viewManager.setProps({
          width: width,
          height: height
        });
        this.props.onResize({
          width: this.width,
          height: this.height
        });
      }
    }
  }, {
    key: "_checkForCanvasSizeChange",
    value: function _checkForCanvasSizeChange() {
      var canvas = this.canvas;

      if (!canvas) {
        return false;
      }

      var newWidth = canvas.clientWidth || canvas.width;
      var newHeight = canvas.clientHeight || canvas.height;

      if (newWidth !== this.width || newHeight !== this.height) {
        this.width = newWidth;
        this.height = newHeight;
        return true;
      }

      return false;
    }
  }, {
    key: "_createAnimationLoop",
    value: function _createAnimationLoop(props) {
      var _this = this;

      var width = props.width,
          height = props.height,
          gl = props.gl,
          glOptions = props.glOptions,
          debug = props.debug,
          useDevicePixels = props.useDevicePixels,
          autoResizeDrawingBuffer = props.autoResizeDrawingBuffer;
      return new AnimationLoop({
        width: width,
        height: height,
        useDevicePixels: useDevicePixels,
        autoResizeDrawingBuffer: autoResizeDrawingBuffer,
        autoResizeViewport: false,
        gl: gl,
        onCreateContext: function onCreateContext(opts) {
          return createGLContext(Object.assign({}, glOptions, opts, {
            canvas: _this.canvas,
            debug: debug
          }));
        },
        onInitialize: this._onRendererInitialized,
        onRender: this._onRenderFrame,
        onBeforeRender: props.onBeforeRender,
        onAfterRender: props.onAfterRender
      });
    }
  }, {
    key: "_getViewState",
    value: function _getViewState() {
      return this.props.viewState || this.viewState;
    }
  }, {
    key: "_getViews",
    value: function _getViews() {
      var views = this.props.views || [new MapView({
        id: 'default-view'
      })];
      views = Array.isArray(views) ? views : [views];

      if (views.length && this.props.controller) {
        views[0].props.controller = this.props.controller;
      }

      return views;
    }
  }, {
    key: "_onPointerMove",
    value: function _onPointerMove(event) {
      var _pickRequest = this._pickRequest;

      if (event.type === 'pointerleave') {
        _pickRequest.x = -1;
        _pickRequest.y = -1;
        _pickRequest.radius = 0;
      } else if (event.leftButton || event.rightButton) {
        return;
      } else {
        var pos = event.offsetCenter;

        if (!pos) {
          return;
        }

        _pickRequest.x = pos.x;
        _pickRequest.y = pos.y;
        _pickRequest.radius = this.props.pickingRadius;
      }

      if (this.layerManager) {
        this.layerManager.context.mousePosition = {
          x: _pickRequest.x,
          y: _pickRequest.y
        };
      }

      _pickRequest.event = event;
      _pickRequest.mode = 'hover';
    }
  }, {
    key: "_pickAndCallback",
    value: function _pickAndCallback() {
      var _pickRequest = this._pickRequest;

      if (_pickRequest.event) {
        var _this$_pick = this._pick('pickObject', 'pickObject Time', _pickRequest),
            result = _this$_pick.result,
            emptyInfo = _this$_pick.emptyInfo;

        var pickedInfo = emptyInfo;
        var handled = false;

        var _iterator2 = _createForOfIteratorHelper$9(result),
            _step2;

        try {
          for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
            var info = _step2.value;
            pickedInfo = info;
            handled = info.layer.onHover(info, _pickRequest.event);
          }
        } catch (err) {
          _iterator2.e(err);
        } finally {
          _iterator2.f();
        }

        if (!handled && this.props.onHover) {
          this.props.onHover(pickedInfo, _pickRequest.event);
        }

        if (this.props.getTooltip) {
          var displayInfo = this.props.getTooltip(pickedInfo);
          this.tooltip.setTooltip(displayInfo, pickedInfo.x, pickedInfo.y);
        }

        _pickRequest.event = null;
      }
    }
  }, {
    key: "_updateCursor",
    value: function _updateCursor() {
      var container = this.props.parent || this.canvas;

      if (container) {
        container.style.cursor = this.props.getCursor(this.interactiveState);
      }
    }
  }, {
    key: "_setGLContext",
    value: function _setGLContext(gl) {
      if (this.layerManager) {
        return;
      }

      if (!this.canvas) {
        this.canvas = gl.canvas;
        instrumentGLContext(gl, {
          enable: true,
          copyState: true
        });
      }

      this.tooltip = new Tooltip(this.canvas);
      setParameters(gl, {
        blend: true,
        blendFunc: [770, 771, 1, 771],
        polygonOffsetFill: true,
        depthTest: true,
        depthFunc: 515
      });
      this.props.onWebGLInitialized(gl);
      var timeline = new Timeline();
      timeline.play();
      this.animationLoop.attachTimeline(timeline);
      this.eventManager = new EventManager(this.props.parent || gl.canvas, {
        touchAction: this.props.touchAction,
        events: {
          pointerdown: this._onPointerDown,
          pointermove: this._onPointerMove,
          pointerleave: this._onPointerMove
        }
      });

      for (var eventType in EVENTS) {
        this.eventManager.on(eventType, this._onEvent);
      }

      this.viewManager = new ViewManager({
        timeline: timeline,
        eventManager: this.eventManager,
        onViewStateChange: this._onViewStateChange,
        onInteractiveStateChange: this._onInteractiveStateChange,
        views: this._getViews(),
        viewState: this._getViewState(),
        width: this.width,
        height: this.height
      });
      var viewport = this.viewManager.getViewports()[0];
      this.layerManager = new LayerManager(gl, {
        deck: this,
        stats: this.stats,
        viewport: viewport,
        timeline: timeline
      });
      this.effectManager = new EffectManager();
      this.deckRenderer = new DeckRenderer(gl);
      this.deckPicker = new DeckPicker(gl);
      this.setProps(this.props);

      this._updateCanvasSize();

      this.props.onLoad();
    }
  }, {
    key: "_drawLayers",
    value: function _drawLayers(redrawReason, renderOptions) {
      var gl = this.layerManager.context.gl;
      setParameters(gl, this.props.parameters);
      this.props.onBeforeRender({
        gl: gl
      });
      this.deckRenderer.renderLayers(Object.assign({
        target: this.props._framebuffer,
        layers: this.layerManager.getLayers(),
        viewports: this.viewManager.getViewports(),
        onViewportActive: this.layerManager.activateViewport,
        views: this.viewManager.getViews(),
        pass: 'screen',
        redrawReason: redrawReason,
        effects: this.effectManager.getEffects()
      }, renderOptions));
      this.props.onAfterRender({
        gl: gl
      });
    }
  }, {
    key: "_onRendererInitialized",
    value: function _onRendererInitialized(_ref2) {
      var gl = _ref2.gl;

      this._setGLContext(gl);
    }
  }, {
    key: "_onRenderFrame",
    value: function _onRenderFrame(animationProps) {
      this._getFrameStats();

      if (this._metricsCounter++ % 60 === 0) {
        this._getMetrics();

        this.stats.reset();
        log.table(4, this.metrics)();

        if (this.props._onMetrics) {
          this.props._onMetrics(this.metrics);
        }
      }

      this._updateCanvasSize();

      this._updateCursor();

      this.layerManager.updateLayers();

      this._pickAndCallback();

      this.redraw(false);

      if (this.viewManager) {
        this.viewManager.updateViewStates();
      }
    }
  }, {
    key: "_onViewStateChange",
    value: function _onViewStateChange(params) {
      var viewState = this.props.onViewStateChange(params) || params.viewState;

      if (this.viewState) {
        this.viewState = _objectSpread$5(_objectSpread$5({}, this.viewState), {}, _defineProperty({}, params.viewId, viewState));

        if (!this.props.viewState) {
          this.viewManager.setProps({
            viewState: this.viewState
          });
        }
      }
    }
  }, {
    key: "_onInteractiveStateChange",
    value: function _onInteractiveStateChange(_ref3) {
      var _ref3$isDragging = _ref3.isDragging,
          isDragging = _ref3$isDragging === void 0 ? false : _ref3$isDragging;

      if (isDragging !== this.interactiveState.isDragging) {
        this.interactiveState.isDragging = isDragging;
      }
    }
  }, {
    key: "_onEvent",
    value: function _onEvent(event) {
      var eventOptions = EVENTS[event.type];
      var pos = event.offsetCenter;

      if (!eventOptions || !pos) {
        return;
      }

      var layers = this.layerManager.getLayers();
      var info = this.deckPicker.getLastPickedObject({
        x: pos.x,
        y: pos.y,
        layers: layers,
        viewports: this.getViewports(pos)
      }, this._lastPointerDownInfo);
      var layer = info.layer;
      var layerHandler = layer && (layer[eventOptions.handler] || layer.props[eventOptions.handler]);
      var rootHandler = this.props[eventOptions.handler];
      var handled = false;

      if (layerHandler) {
        handled = layerHandler.call(layer, info, event);
      }

      if (!handled && rootHandler) {
        rootHandler(info, event);
      }
    }
  }, {
    key: "_onPointerDown",
    value: function _onPointerDown(event) {
      var pos = event.offsetCenter;
      this._lastPointerDownInfo = this.pickObject({
        x: pos.x,
        y: pos.y,
        radius: this.props.pickingRadius
      });
    }
  }, {
    key: "_getFrameStats",
    value: function _getFrameStats() {
      var stats = this.stats;
      stats.get('frameRate').timeEnd();
      stats.get('frameRate').timeStart();
      var animationLoopStats = this.animationLoop.stats;
      stats.get('GPU Time').addTime(animationLoopStats.get('GPU Time').lastTiming);
      stats.get('CPU Time').addTime(animationLoopStats.get('CPU Time').lastTiming);
    }
  }, {
    key: "_getMetrics",
    value: function _getMetrics() {
      var metrics = this.metrics,
          stats = this.stats;
      metrics.fps = stats.get('frameRate').getHz();
      metrics.setPropsTime = stats.get('setProps Time').time;
      metrics.updateAttributesTime = stats.get('Update Attributes').time;
      metrics.framesRedrawn = stats.get('Redraw Count').count;
      metrics.pickTime = stats.get('pickObject Time').time + stats.get('pickMultipleObjects Time').time + stats.get('pickObjects Time').time;
      metrics.pickCount = stats.get('Pick Count').count;
      metrics.gpuTime = stats.get('GPU Time').time;
      metrics.cpuTime = stats.get('CPU Time').time;
      metrics.gpuTimePerFrame = stats.get('GPU Time').getAverageTime();
      metrics.cpuTimePerFrame = stats.get('CPU Time').getAverageTime();
      var memoryStats = lumaStats.get('Memory Usage');
      metrics.bufferMemory = memoryStats.get('Buffer Memory').count;
      metrics.textureMemory = memoryStats.get('Texture Memory').count;
      metrics.renderbufferMemory = memoryStats.get('Renderbuffer Memory').count;
      metrics.gpuMemory = memoryStats.get('GPU Memory').count;
    }
  }]);

  return Deck;
}();
Deck.getPropTypes = getPropTypes;
Deck.defaultProps = defaultProps;
Deck.VERSION = deckGlobal.VERSION;

function inheritsFrom(Type, ParentType) {
  while (Type) {
    if (Type === ParentType) {
      return true;
    }

    Type = Object.getPrototypeOf(Type);
  }

  return false;
}

function wrapInView(node) {
  if (!node) {
    return node;
  }

  if (typeof node === 'function') {
    return react.createElement(View, {}, node);
  }

  if (Array.isArray(node)) {
    return node.map(wrapInView);
  }

  if (node.type === react.Fragment) {
    return wrapInView(node.props.children);
  }

  if (inheritsFrom(node.type, View)) {
    return node;
  }

  return node;
}

function extractJSXLayers(_ref) {
  var children = _ref.children,
      layers = _ref.layers,
      views = _ref.views;
  var reactChildren = [];
  var jsxLayers = [];
  var jsxViews = {};
  react.Children.forEach(wrapInView(children), function (reactElement) {
    if (reactElement) {
      var ElementType = reactElement.type;

      if (inheritsFrom(ElementType, Layer)) {
        var layer = createLayer(ElementType, reactElement.props);
        jsxLayers.push(layer);
      } else {
        reactChildren.push(reactElement);
      }

      if (ElementType !== View && inheritsFrom(ElementType, View) && reactElement.props.id) {
        var view = new ElementType(reactElement.props);
        jsxViews[view.id] = view;
      }
    }
  });

  if (Object.keys(jsxViews).length > 0) {
    if (Array.isArray(views)) {
      views.forEach(function (view) {
        jsxViews[view.id] = view;
      });
    } else if (views) {
      jsxViews[views.id] = views;
    }

    views = Object.values(jsxViews);
  }

  layers = jsxLayers.length > 0 ? [].concat(jsxLayers, _toConsumableArray(layers)) : layers;
  return {
    layers: layers,
    children: reactChildren,
    views: views
  };
}

function createLayer(LayerType, reactProps) {
  var props = {};
  var defaultProps = LayerType.defaultProps || {};

  for (var key in reactProps) {
    if (defaultProps[key] !== reactProps[key]) {
      props[key] = reactProps[key];
    }
  }

  return new LayerType(props);
}

var MAP_STYLE = {
  position: 'absolute',
  zIndex: -1
};
function evaluateChildren(children, childProps) {
  if (!children) {
    return children;
  }

  if (typeof children === 'function') {
    return children(childProps);
  }

  if (Array.isArray(children)) {
    return children.map(function (child) {
      return evaluateChildren(child, childProps);
    });
  }

  if (isReactMap(children)) {
    childProps.style = MAP_STYLE;
    return react.cloneElement(children, childProps);
  }

  if (needsDeckGLViewProps(children)) {
    return react.cloneElement(children, childProps);
  }

  return children;
}

function isReactMap(child) {
  var componentClass = child && child.type;
  var componentProps = componentClass && componentClass.defaultProps;
  return componentProps && componentProps.mapStyle;
}

function needsDeckGLViewProps(child) {
  var componentClass = child && child.type;
  return componentClass && componentClass.deckGLViewProps;
}

function _createForOfIteratorHelper$a(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray$a(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray$a(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray$a(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray$a(o, minLen); }

function _arrayLikeToArray$a(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }
function positionChildrenUnderViews(_ref) {
  var children = _ref.children,
      viewports = _ref.viewports,
      deck = _ref.deck,
      ContextProvider = _ref.ContextProvider;

  var _ref2 = deck || {},
      viewManager = _ref2.viewManager;

  if (!viewManager || !viewManager.views.length) {
    return [];
  }

  var views = {};
  var defaultViewId = viewManager.views[0].id;

  var _iterator = _createForOfIteratorHelper$a(children),
      _step;

  try {
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      var child = _step.value;
      var viewId = defaultViewId;
      var viewChildren = child;

      if (inheritsFrom(child.type, View)) {
        viewId = child.props.id || defaultViewId;
        viewChildren = child.props.children;
      }

      var viewport = viewManager.getViewport(viewId);
      var viewState = viewManager.getViewState(viewId);

      if (viewport) {
        var x = viewport.x,
            y = viewport.y,
            width = viewport.width,
            height = viewport.height;
        viewChildren = evaluateChildren(viewChildren, {
          x: x,
          y: y,
          width: width,
          height: height,
          viewport: viewport,
          viewState: viewState
        });

        if (!views[viewId]) {
          views[viewId] = {
            viewport: viewport,
            children: []
          };
        }

        views[viewId].children.push(viewChildren);
      }
    }
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }

  return Object.keys(views).map(function (viewId) {
    var _views$viewId = views[viewId],
        viewport = _views$viewId.viewport,
        viewChildren = _views$viewId.children;
    var x = viewport.x,
        y = viewport.y,
        width = viewport.width,
        height = viewport.height;
    var style = {
      position: 'absolute',
      left: x,
      top: y,
      width: width,
      height: height
    };
    var key = "view-".concat(viewId);
    var viewElement = react.createElement.apply(void 0, ['div', {
      key: key,
      id: key,
      style: style
    }].concat(_toConsumableArray(viewChildren)));

    if (ContextProvider) {
      var contextValue = {
        viewport: viewport,
        container: deck.canvas.offsetParent,
        eventManager: deck.eventManager,
        onViewStateChange: function onViewStateChange(params) {
          params.viewId = viewId;

          deck._onViewStateChange(params);
        }
      };
      return react.createElement(ContextProvider, {
        key: key,
        value: contextValue
      }, viewElement);
    }

    return viewElement;
  });
}

var CANVAS_ONLY_STYLES = {
  mixBlendMode: null
};
function extractStyles(_ref) {
  var width = _ref.width,
      height = _ref.height,
      style = _ref.style;
  var containerStyle = {
    position: 'absolute',
    zIndex: 0,
    left: 0,
    top: 0,
    width: width,
    height: height
  };
  var canvasStyle = {
    left: 0,
    top: 0
  };

  if (style) {
    for (var key in style) {
      if (key in CANVAS_ONLY_STYLES) {
        canvasStyle[key] = style[key];
      } else {
        containerStyle[key] = style[key];
      }
    }
  }

  return {
    containerStyle: containerStyle,
    canvasStyle: canvasStyle
  };
}

function _createSuper$7(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct$7(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _isNativeReflectConstruct$7() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }
var propTypes = Deck.getPropTypes(propTypes$1);
var defaultProps$1 = Deck.defaultProps;

var DeckGL = function (_React$Component) {
  _inherits(DeckGL, _React$Component);

  var _super = _createSuper$7(DeckGL);

  function DeckGL(props) {
    var _this;

    _classCallCheck(this, DeckGL);

    _this = _super.call(this, props);
    _this.viewports = null;
    _this.children = null;
    _this._needsRedraw = null;
    _this._containerRef = react.createRef();
    _this._canvasRef = react.createRef();
    _this.pickObject = _this.pickObject.bind(_assertThisInitialized(_this));
    _this.pickMultipleObjects = _this.pickMultipleObjects.bind(_assertThisInitialized(_this));
    _this.pickObjects = _this.pickObjects.bind(_assertThisInitialized(_this));
    _this._extractJSXLayers = memoize(extractJSXLayers);
    _this._positionChildrenUnderViews = memoize(positionChildrenUnderViews);
    _this._extractStyles = memoize(extractStyles);
    return _this;
  }

  _createClass(DeckGL, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      var DeckClass = this.props.Deck || Deck;
      this.deck = this.deck || new DeckClass(Object.assign({}, this.props, {
        parent: this._containerRef.current,
        canvas: this._canvasRef.current,
        style: null,
        width: '100%',
        height: '100%',
        _customRender: this._customRender.bind(this)
      }));

      this._updateFromProps(this.props);
    }
  }, {
    key: "shouldComponentUpdate",
    value: function shouldComponentUpdate(nextProps) {
      this._updateFromProps(nextProps);

      var childrenChanged = this.children !== this._parseJSX(nextProps).children;

      var viewsChanged = this.deck.viewManager && this.deck.viewManager.needsRedraw();
      return childrenChanged && !viewsChanged;
    }
  }, {
    key: "componentDidUpdate",
    value: function componentDidUpdate() {
      this._redrawDeck();
    }
  }, {
    key: "componentWillUnmount",
    value: function componentWillUnmount() {
      this.deck.finalize();
    }
  }, {
    key: "pickObject",
    value: function pickObject(opts) {
      return this.deck.pickObject(opts);
    }
  }, {
    key: "pickMultipleObjects",
    value: function pickMultipleObjects(opts) {
      return this.deck.pickMultipleObjects(opts);
    }
  }, {
    key: "pickObjects",
    value: function pickObjects(opts) {
      return this.deck.pickObjects(opts);
    }
  }, {
    key: "_redrawDeck",
    value: function _redrawDeck() {
      if (this._needsRedraw) {
        this.deck._drawLayers(this._needsRedraw);

        this._needsRedraw = null;
      }
    }
  }, {
    key: "_customRender",
    value: function _customRender(redrawReason) {
      this._needsRedraw = redrawReason;
      var viewports = this.deck.viewManager.getViewports();

      if (viewports !== this.viewports) {
        this.forceUpdate();
      } else {
        this._redrawDeck();
      }
    }
  }, {
    key: "_parseJSX",
    value: function _parseJSX(props) {
      return this._extractJSXLayers({
        layers: props.layers,
        views: props.views,
        children: props.children
      });
    }
  }, {
    key: "_updateFromProps",
    value: function _updateFromProps(props) {
      var _this$_parseJSX = this._parseJSX(props),
          layers = _this$_parseJSX.layers,
          views = _this$_parseJSX.views;

      var deckProps = Object.assign({}, props, {
        style: null,
        width: '100%',
        height: '100%',
        layers: layers,
        views: views
      });
      this.deck.setProps(deckProps);
    }
  }, {
    key: "render",
    value: function render() {
      var _this$props = this.props,
          ContextProvider = _this$props.ContextProvider,
          width = _this$props.width,
          height = _this$props.height,
          style = _this$props.style;

      var _ref = this.deck || {},
          viewManager = _ref.viewManager;

      this.viewports = viewManager && viewManager.getViewports();
      this.children = this._parseJSX(this.props).children;

      var children = this._positionChildrenUnderViews({
        children: this.children,
        viewports: this.viewports,
        deck: this.deck,
        ContextProvider: ContextProvider
      });

      var _this$_extractStyles = this._extractStyles({
        width: width,
        height: height,
        style: style
      }),
          containerStyle = _this$_extractStyles.containerStyle,
          canvasStyle = _this$_extractStyles.canvasStyle;

      var canvas = react.createElement('canvas', {
        key: 'canvas',
        ref: this._canvasRef,
        style: canvasStyle
      });
      return react.createElement('div', {
        id: 'deckgl-wrapper',
        ref: this._containerRef,
        style: containerStyle
      }, [canvas, children]);
    }
  }]);

  return DeckGL;
}(react.Component);
DeckGL.propTypes = propTypes;
DeckGL.defaultProps = defaultProps$1;

export default DeckGL;
