import { q as _asyncToGenerator, r as regenerator } from './layer-660a8390.js';
import { p as process } from './process-2545f00a.js';
import { a as _typeof } from './setPrototypeOf-d164daa3.js';

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

var VERSION =  "2.3.12" ;
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

export { ImageLoader as I };
