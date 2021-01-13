import { L as Log, g as transformMat4, m as multiply, _ as _inherits, a as _getPrototypeOf, b as _possibleConstructorReturn, h as _wrapNativeSuper, i as angle, j as cross, r as rotateX, k as rotateY, l as rotateZ, n as transformMat4$1, o as transformMat3, p as transformQuat, q as fromQuat, s as frustum, u as lookAt, v as ortho, w as perspective, x as determinant, y as transpose, z as invert, A as rotateX$1, B as rotateY$1, C as rotateZ$1, D as rotate, E as scale, F as translate, t as transformMat4$2, G as scale$1, H as lerp$1, I as negate, J as equals$1, K as add$1, M as negate$1, N as sub, O as Buffer, P as hasFeature, Q as FEATURES, f as _get, T as Transform, R as readPixelsToArray, S as Texture2D, U as Framebuffer, V as _asyncToGenerator, W as regenerator, X as _asyncIterator, Y as setParameters, Z as withParameters, $ as load } from './transform-35a4c5f8.js';
import { _ as _typeof } from './typeof-c65245d2.js';
import { _ as _defineProperty } from './defineProperty-1b0b77a2.js';
import { _ as _classCallCheck } from './classCallCheck-4eda545c.js';
import { _ as _createClass, a as _toConsumableArray, b as _assertThisInitialized } from './assertThisInitialized-87ceda02.js';
import { _ as _slicedToArray } from './slicedToArray-14e71088.js';

var log = new Log({
  id: 'deck'
});

var loggers = {};

function register(handlers) {
  loggers = handlers;
}
function debug(eventType) {
  if (log.level > 0 && loggers[eventType]) {
    var _loggers$eventType;

    (_loggers$eventType = loggers[eventType]).call.apply(_loggers$eventType, arguments);
  }
}

var COORDINATE_SYSTEM = {
  DEFAULT: -1,
  LNGLAT: 1,
  METER_OFFSETS: 2,
  LNGLAT_OFFSETS: 3,
  CARTESIAN: 0
};
Object.defineProperty(COORDINATE_SYSTEM, 'IDENTITY', {
  get: function get() {
    return log.deprecated('COORDINATE_SYSTEM.IDENTITY', 'COORDINATE_SYSTEM.CARTESIAN')() || 0;
  }
});
var PROJECTION_MODE = {
  WEB_MERCATOR: 1,
  GLOBE: 2,
  WEB_MERCATOR_AUTO_OFFSET: 4,
  IDENTITY: 0
};
var EVENTS = {
  click: {
    handler: 'onClick'
  },
  panstart: {
    handler: 'onDragStart'
  },
  panmove: {
    handler: 'onDrag'
  },
  panend: {
    handler: 'onDragEnd'
  }
};

function isEqual(a, b) {
  if (a === b) {
    return true;
  }

  if (Array.isArray(a)) {
    var len = a.length;

    if (!b || b.length !== len) {
      return false;
    }

    for (var i = 0; i < len; i++) {
      if (a[i] !== b[i]) {
        return false;
      }
    }

    return true;
  }

  return false;
}

function memoize(compute) {
  var cachedArgs = {};
  var cachedResult;
  return function (args) {
    for (var key in args) {
      if (!isEqual(args[key], cachedArgs[key])) {
        cachedResult = compute(args);
        cachedArgs = args;
        break;
      }
    }

    return cachedResult;
  };
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'deck.gl: assertion failed.');
  }
}

var ZERO_VECTOR = [0, 0, 0, 0];
var VECTOR_TO_POINT_MATRIX = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0];
var IDENTITY_MATRIX = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
var DEFAULT_PIXELS_PER_UNIT2 = [0, 0, 0];
var DEFAULT_COORDINATE_ORIGIN = [0, 0, 0];
var getMemoizedViewportUniforms = memoize(calculateViewportUniforms);
function getOffsetOrigin(viewport, coordinateSystem) {
  var coordinateOrigin = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : DEFAULT_COORDINATE_ORIGIN;
  var shaderCoordinateOrigin = coordinateOrigin;
  var geospatialOrigin;
  var offsetMode = true;

  if (coordinateSystem === COORDINATE_SYSTEM.LNGLAT_OFFSETS || coordinateSystem === COORDINATE_SYSTEM.METER_OFFSETS) {
    geospatialOrigin = coordinateOrigin;
  } else {
    geospatialOrigin = viewport.isGeospatial ? [Math.fround(viewport.longitude), Math.fround(viewport.latitude), 0] : null;
  }

  switch (viewport.projectionMode) {
    case PROJECTION_MODE.WEB_MERCATOR:
      if (coordinateSystem === COORDINATE_SYSTEM.LNGLAT || coordinateSystem === COORDINATE_SYSTEM.CARTESIAN) {
        offsetMode = false;
      }

      break;

    case PROJECTION_MODE.WEB_MERCATOR_AUTO_OFFSET:
      if (coordinateSystem === COORDINATE_SYSTEM.LNGLAT) {
        shaderCoordinateOrigin = geospatialOrigin;
      } else if (coordinateSystem === COORDINATE_SYSTEM.CARTESIAN) {
        shaderCoordinateOrigin = [Math.fround(viewport.center[0]), Math.fround(viewport.center[1]), 0];
        geospatialOrigin = viewport.unprojectPosition(shaderCoordinateOrigin);
        shaderCoordinateOrigin[0] -= coordinateOrigin[0];
        shaderCoordinateOrigin[1] -= coordinateOrigin[1];
        shaderCoordinateOrigin[2] -= coordinateOrigin[2];
      }

      break;

    case PROJECTION_MODE.IDENTITY:
      shaderCoordinateOrigin = viewport.position.map(Math.fround);
      break;

    case PROJECTION_MODE.GLOBE:
      offsetMode = false;
      geospatialOrigin = null;
      break;

    default:
      offsetMode = false;
  }

  shaderCoordinateOrigin[2] = shaderCoordinateOrigin[2] || 0;
  return {
    geospatialOrigin: geospatialOrigin,
    shaderCoordinateOrigin: shaderCoordinateOrigin,
    offsetMode: offsetMode
  };
}

function calculateMatrixAndOffset(viewport, coordinateSystem, coordinateOrigin) {
  var viewMatrixUncentered = viewport.viewMatrixUncentered,
      projectionMatrix = viewport.projectionMatrix;
  var viewMatrix = viewport.viewMatrix,
      viewProjectionMatrix = viewport.viewProjectionMatrix;
  var projectionCenter = ZERO_VECTOR;
  var cameraPosCommon = viewport.cameraPosition;

  var _getOffsetOrigin = getOffsetOrigin(viewport, coordinateSystem, coordinateOrigin),
      geospatialOrigin = _getOffsetOrigin.geospatialOrigin,
      shaderCoordinateOrigin = _getOffsetOrigin.shaderCoordinateOrigin,
      offsetMode = _getOffsetOrigin.offsetMode;

  if (offsetMode) {
    var positionCommonSpace = viewport.projectPosition(geospatialOrigin || shaderCoordinateOrigin);
    cameraPosCommon = [cameraPosCommon[0] - positionCommonSpace[0], cameraPosCommon[1] - positionCommonSpace[1], cameraPosCommon[2] - positionCommonSpace[2]];
    positionCommonSpace[3] = 1;
    projectionCenter = transformMat4([], positionCommonSpace, viewProjectionMatrix);
    viewMatrix = viewMatrixUncentered || viewMatrix;
    viewProjectionMatrix = multiply([], projectionMatrix, viewMatrix);
    viewProjectionMatrix = multiply([], viewProjectionMatrix, VECTOR_TO_POINT_MATRIX);
  }

  return {
    viewMatrix: viewMatrix,
    viewProjectionMatrix: viewProjectionMatrix,
    projectionCenter: projectionCenter,
    cameraPosCommon: cameraPosCommon,
    shaderCoordinateOrigin: shaderCoordinateOrigin,
    geospatialOrigin: geospatialOrigin
  };
}

function getUniformsFromViewport() {
  var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
      viewport = _ref.viewport,
      _ref$devicePixelRatio = _ref.devicePixelRatio,
      devicePixelRatio = _ref$devicePixelRatio === void 0 ? 1 : _ref$devicePixelRatio,
      _ref$modelMatrix = _ref.modelMatrix,
      modelMatrix = _ref$modelMatrix === void 0 ? null : _ref$modelMatrix,
      _ref$coordinateSystem = _ref.coordinateSystem,
      coordinateSystem = _ref$coordinateSystem === void 0 ? COORDINATE_SYSTEM.DEFAULT : _ref$coordinateSystem,
      coordinateOrigin = _ref.coordinateOrigin,
      _ref$autoWrapLongitud = _ref.autoWrapLongitude,
      autoWrapLongitude = _ref$autoWrapLongitud === void 0 ? false : _ref$autoWrapLongitud,
      projectionMode = _ref.projectionMode,
      positionOrigin = _ref.positionOrigin;

  assert(viewport);

  if (coordinateSystem === COORDINATE_SYSTEM.DEFAULT) {
    coordinateSystem = viewport.isGeospatial ? COORDINATE_SYSTEM.LNGLAT : COORDINATE_SYSTEM.CARTESIAN;
  }

  var uniforms = getMemoizedViewportUniforms({
    viewport: viewport,
    devicePixelRatio: devicePixelRatio,
    coordinateSystem: coordinateSystem,
    coordinateOrigin: coordinateOrigin
  });
  uniforms.project_uWrapLongitude = autoWrapLongitude;
  uniforms.project_uModelMatrix = modelMatrix || IDENTITY_MATRIX;
  return uniforms;
}

function calculateViewportUniforms(_ref2) {
  var viewport = _ref2.viewport,
      devicePixelRatio = _ref2.devicePixelRatio,
      coordinateSystem = _ref2.coordinateSystem,
      coordinateOrigin = _ref2.coordinateOrigin;

  var _calculateMatrixAndOf = calculateMatrixAndOffset(viewport, coordinateSystem, coordinateOrigin),
      projectionCenter = _calculateMatrixAndOf.projectionCenter,
      viewProjectionMatrix = _calculateMatrixAndOf.viewProjectionMatrix,
      cameraPosCommon = _calculateMatrixAndOf.cameraPosCommon,
      shaderCoordinateOrigin = _calculateMatrixAndOf.shaderCoordinateOrigin,
      geospatialOrigin = _calculateMatrixAndOf.geospatialOrigin;

  var distanceScales = viewport.getDistanceScales();
  var viewportSize = [viewport.width * devicePixelRatio, viewport.height * devicePixelRatio];
  var uniforms = {
    project_uCoordinateSystem: coordinateSystem,
    project_uProjectionMode: viewport.projectionMode,
    project_uCoordinateOrigin: shaderCoordinateOrigin,
    project_uCenter: projectionCenter,
    project_uViewportSize: viewportSize,
    project_uDevicePixelRatio: devicePixelRatio,
    project_uFocalDistance: viewport.focalDistance || 1,
    project_uCommonUnitsPerMeter: distanceScales.unitsPerMeter,
    project_uCommonUnitsPerWorldUnit: distanceScales.unitsPerMeter,
    project_uCommonUnitsPerWorldUnit2: DEFAULT_PIXELS_PER_UNIT2,
    project_uScale: viewport.scale,
    project_uViewProjectionMatrix: viewProjectionMatrix,
    project_uCameraPosition: cameraPosCommon
  };

  if (geospatialOrigin) {
    var distanceScalesAtOrigin = viewport.getDistanceScales(geospatialOrigin);

    switch (coordinateSystem) {
      case COORDINATE_SYSTEM.METER_OFFSETS:
        uniforms.project_uCommonUnitsPerWorldUnit = distanceScalesAtOrigin.unitsPerMeter;
        uniforms.project_uCommonUnitsPerWorldUnit2 = distanceScalesAtOrigin.unitsPerMeter2;
        break;

      case COORDINATE_SYSTEM.LNGLAT:
      case COORDINATE_SYSTEM.LNGLAT_OFFSETS:
        uniforms.project_uCommonUnitsPerWorldUnit = distanceScalesAtOrigin.unitsPerDegree;
        uniforms.project_uCommonUnitsPerWorldUnit2 = distanceScalesAtOrigin.unitsPerDegree2;
        break;

      case COORDINATE_SYSTEM.CARTESIAN:
        uniforms.project_uCommonUnitsPerWorldUnit = [1, 1, distanceScalesAtOrigin.unitsPerMeter[2]];
        uniforms.project_uCommonUnitsPerWorldUnit2 = [0, 0, distanceScalesAtOrigin.unitsPerMeter2[2]];
        break;
    }
  }

  return uniforms;
}

function assert$1(condition, message) {
  if (!condition) {
    throw new Error("math.gl assertion ".concat(message));
  }
}

var config = {};
config.EPSILON = 1e-12;
config.debug = false;
config.precision = 4;
config.printTypes = false;
config.printDegrees = false;
config.printRowMajor = true;

function round(value) {
  return Math.round(value / config.EPSILON) * config.EPSILON;
}

function formatValue(value) {
  var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
      _ref$precision = _ref.precision,
      precision = _ref$precision === void 0 ? config.precision || 4 : _ref$precision;

  value = round(value);
  return "".concat(parseFloat(value.toPrecision(precision)));
}
function isArray(value) {
  return Array.isArray(value) || ArrayBuffer.isView(value) && !(value instanceof DataView);
}

function duplicateArray(array) {
  return array.clone ? array.clone() : new Array(array.length);
}

function map(value, func, result) {
  if (isArray(value)) {
    result = result || duplicateArray(value);

    for (var i = 0; i < result.length && i < value.length; ++i) {
      result[i] = func(value[i], i, result);
    }

    return result;
  }

  return func(value);
}
function clamp(value, min, max) {
  return map(value, function (value) {
    return Math.max(min, Math.min(max, value));
  });
}
function lerp(a, b, t) {
  if (isArray(a)) {
    return a.map(function (ai, i) {
      return lerp(ai, b[i], t);
    });
  }

  return t * b + (1 - t) * a;
}
function equals(a, b, epsilon) {
  var oldEpsilon = config.EPSILON;

  if (epsilon) {
    config.EPSILON = epsilon;
  }

  try {
    if (a === b) {
      return true;
    }

    if (isArray(a) && isArray(b)) {
      if (a.length !== b.length) {
        return false;
      }

      for (var i = 0; i < a.length; ++i) {
        if (!equals(a[i], b[i])) {
          return false;
        }
      }

      return true;
    }

    if (a && a.equals) {
      return a.equals(b);
    }

    if (b && b.equals) {
      return b.equals(a);
    }

    if (Number.isFinite(a) && Number.isFinite(b)) {
      return Math.abs(a - b) <= config.EPSILON * Math.max(1.0, Math.abs(a), Math.abs(b));
    }

    return false;
  } finally {
    config.EPSILON = oldEpsilon;
  }
}

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

var MathArray = function (_Array) {
  _inherits(MathArray, _Array);

  var _super = _createSuper(MathArray);

  function MathArray() {
    _classCallCheck(this, MathArray);

    return _super.apply(this, arguments);
  }

  _createClass(MathArray, [{
    key: "clone",
    value: function clone() {
      return new this.constructor().copy(this);
    }
  }, {
    key: "from",
    value: function from(arrayOrObject) {
      return Array.isArray(arrayOrObject) ? this.copy(arrayOrObject) : this.fromObject(arrayOrObject);
    }
  }, {
    key: "fromArray",
    value: function fromArray(array) {
      var offset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

      for (var i = 0; i < this.ELEMENTS; ++i) {
        this[i] = array[i + offset];
      }

      return this.check();
    }
  }, {
    key: "to",
    value: function to(arrayOrObject) {
      if (arrayOrObject === this) {
        return this;
      }

      return isArray(arrayOrObject) ? this.toArray(arrayOrObject) : this.toObject(arrayOrObject);
    }
  }, {
    key: "toTarget",
    value: function toTarget(target) {
      return target ? this.to(target) : this;
    }
  }, {
    key: "toArray",
    value: function toArray() {
      var array = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
      var offset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

      for (var i = 0; i < this.ELEMENTS; ++i) {
        array[offset + i] = this[i];
      }

      return array;
    }
  }, {
    key: "toFloat32Array",
    value: function toFloat32Array() {
      return new Float32Array(this);
    }
  }, {
    key: "toString",
    value: function toString() {
      return this.formatString(config);
    }
  }, {
    key: "formatString",
    value: function formatString(opts) {
      var string = '';

      for (var i = 0; i < this.ELEMENTS; ++i) {
        string += (i > 0 ? ', ' : '') + formatValue(this[i], opts);
      }

      return "".concat(opts.printTypes ? this.constructor.name : '', "[").concat(string, "]");
    }
  }, {
    key: "equals",
    value: function equals$1(array) {
      if (!array || this.length !== array.length) {
        return false;
      }

      for (var i = 0; i < this.ELEMENTS; ++i) {
        if (!equals(this[i], array[i])) {
          return false;
        }
      }

      return true;
    }
  }, {
    key: "exactEquals",
    value: function exactEquals(array) {
      if (!array || this.length !== array.length) {
        return false;
      }

      for (var i = 0; i < this.ELEMENTS; ++i) {
        if (this[i] !== array[i]) {
          return false;
        }
      }

      return true;
    }
  }, {
    key: "negate",
    value: function negate() {
      for (var i = 0; i < this.ELEMENTS; ++i) {
        this[i] = -this[i];
      }

      return this.check();
    }
  }, {
    key: "lerp",
    value: function lerp(a, b, t) {
      if (t === undefined) {
        t = b;
        b = a;
        a = this;
      }

      for (var i = 0; i < this.ELEMENTS; ++i) {
        var ai = a[i];
        this[i] = ai + t * (b[i] - ai);
      }

      return this.check();
    }
  }, {
    key: "min",
    value: function min(vector) {
      for (var i = 0; i < this.ELEMENTS; ++i) {
        this[i] = Math.min(vector[i], this[i]);
      }

      return this.check();
    }
  }, {
    key: "max",
    value: function max(vector) {
      for (var i = 0; i < this.ELEMENTS; ++i) {
        this[i] = Math.max(vector[i], this[i]);
      }

      return this.check();
    }
  }, {
    key: "clamp",
    value: function clamp(minVector, maxVector) {
      for (var i = 0; i < this.ELEMENTS; ++i) {
        this[i] = Math.min(Math.max(this[i], minVector[i]), maxVector[i]);
      }

      return this.check();
    }
  }, {
    key: "add",
    value: function add() {
      for (var _len = arguments.length, vectors = new Array(_len), _key = 0; _key < _len; _key++) {
        vectors[_key] = arguments[_key];
      }

      for (var _i = 0, _vectors = vectors; _i < _vectors.length; _i++) {
        var vector = _vectors[_i];

        for (var i = 0; i < this.ELEMENTS; ++i) {
          this[i] += vector[i];
        }
      }

      return this.check();
    }
  }, {
    key: "subtract",
    value: function subtract() {
      for (var _len2 = arguments.length, vectors = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        vectors[_key2] = arguments[_key2];
      }

      for (var _i2 = 0, _vectors2 = vectors; _i2 < _vectors2.length; _i2++) {
        var vector = _vectors2[_i2];

        for (var i = 0; i < this.ELEMENTS; ++i) {
          this[i] -= vector[i];
        }
      }

      return this.check();
    }
  }, {
    key: "scale",
    value: function scale(_scale) {
      if (Array.isArray(_scale)) {
        return this.multiply(_scale);
      }

      for (var i = 0; i < this.ELEMENTS; ++i) {
        this[i] *= _scale;
      }

      return this.check();
    }
  }, {
    key: "sub",
    value: function sub(a) {
      return this.subtract(a);
    }
  }, {
    key: "setScalar",
    value: function setScalar(a) {
      for (var i = 0; i < this.ELEMENTS; ++i) {
        this[i] = a;
      }

      return this.check();
    }
  }, {
    key: "addScalar",
    value: function addScalar(a) {
      for (var i = 0; i < this.ELEMENTS; ++i) {
        this[i] += a;
      }

      return this.check();
    }
  }, {
    key: "subScalar",
    value: function subScalar(a) {
      return this.addScalar(-a);
    }
  }, {
    key: "multiplyScalar",
    value: function multiplyScalar(scalar) {
      for (var i = 0; i < this.ELEMENTS; ++i) {
        this[i] *= scalar;
      }

      return this.check();
    }
  }, {
    key: "divideScalar",
    value: function divideScalar(a) {
      return this.scale(1 / a);
    }
  }, {
    key: "clampScalar",
    value: function clampScalar(min, max) {
      for (var i = 0; i < this.ELEMENTS; ++i) {
        this[i] = Math.min(Math.max(this[i], min), max);
      }

      return this.check();
    }
  }, {
    key: "multiplyByScalar",
    value: function multiplyByScalar(scalar) {
      return this.scale(scalar);
    }
  }, {
    key: "check",
    value: function check() {
      if (config.debug && !this.validate()) {
        throw new Error("math.gl: ".concat(this.constructor.name, " some fields set to invalid numbers'"));
      }

      return this;
    }
  }, {
    key: "validate",
    value: function validate() {
      var valid = this.length === this.ELEMENTS;

      for (var i = 0; i < this.ELEMENTS; ++i) {
        valid = valid && Number.isFinite(this[i]);
      }

      return valid;
    }
  }, {
    key: "ELEMENTS",
    get: function get() {
      assert$1(false);
      return 0;
    }
  }, {
    key: "RANK",
    get: function get() {
      assert$1(false);
      return 0;
    }
  }, {
    key: "elements",
    get: function get() {
      return this;
    }
  }]);

  return MathArray;
}(_wrapNativeSuper(Array));

function validateVector(v, length) {
  if (v.length !== length) {
    return false;
  }

  for (var i = 0; i < v.length; ++i) {
    if (!Number.isFinite(v[i])) {
      return false;
    }
  }

  return true;
}
function checkNumber(value) {
  if (!Number.isFinite(value)) {
    throw new Error("Invalid number ".concat(value));
  }

  return value;
}
function checkVector(v, length) {
  var callerName = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '';

  if (config.debug && !validateVector(v, length)) {
    throw new Error("math.gl: ".concat(callerName, " some fields set to invalid numbers'"));
  }

  return v;
}
var map$1 = {};
function deprecated(method, version) {
  if (!map$1[method]) {
    map$1[method] = true;
    console.warn("".concat(method, " has been removed in version ").concat(version, ", see upgrade guide for more information"));
  }
}

function _createSuper$1(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct$1(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _isNativeReflectConstruct$1() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

var Vector = function (_MathArray) {
  _inherits(Vector, _MathArray);

  var _super = _createSuper$1(Vector);

  function Vector() {
    _classCallCheck(this, Vector);

    return _super.apply(this, arguments);
  }

  _createClass(Vector, [{
    key: "copy",
    value: function copy(vector) {
      assert$1(false);
      return this;
    }
  }, {
    key: "len",
    value: function len() {
      return Math.sqrt(this.lengthSquared());
    }
  }, {
    key: "magnitude",
    value: function magnitude() {
      return this.len();
    }
  }, {
    key: "lengthSquared",
    value: function lengthSquared() {
      var length = 0;

      for (var i = 0; i < this.ELEMENTS; ++i) {
        length += this[i] * this[i];
      }

      return length;
    }
  }, {
    key: "magnitudeSquared",
    value: function magnitudeSquared() {
      return this.lengthSquared();
    }
  }, {
    key: "distance",
    value: function distance(mathArray) {
      return Math.sqrt(this.distanceSquared(mathArray));
    }
  }, {
    key: "distanceSquared",
    value: function distanceSquared(mathArray) {
      var length = 0;

      for (var i = 0; i < this.ELEMENTS; ++i) {
        var dist = this[i] - mathArray[i];
        length += dist * dist;
      }

      return checkNumber(length);
    }
  }, {
    key: "dot",
    value: function dot(mathArray) {
      var product = 0;

      for (var i = 0; i < this.ELEMENTS; ++i) {
        product += this[i] * mathArray[i];
      }

      return checkNumber(product);
    }
  }, {
    key: "normalize",
    value: function normalize() {
      var length = this.magnitude();

      if (length !== 0) {
        for (var i = 0; i < this.ELEMENTS; ++i) {
          this[i] /= length;
        }
      }

      return this.check();
    }
  }, {
    key: "multiply",
    value: function multiply() {
      for (var _len = arguments.length, vectors = new Array(_len), _key = 0; _key < _len; _key++) {
        vectors[_key] = arguments[_key];
      }

      for (var _i = 0, _vectors = vectors; _i < _vectors.length; _i++) {
        var vector = _vectors[_i];

        for (var i = 0; i < this.ELEMENTS; ++i) {
          this[i] *= vector[i];
        }
      }

      return this.check();
    }
  }, {
    key: "divide",
    value: function divide() {
      for (var _len2 = arguments.length, vectors = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        vectors[_key2] = arguments[_key2];
      }

      for (var _i2 = 0, _vectors2 = vectors; _i2 < _vectors2.length; _i2++) {
        var vector = _vectors2[_i2];

        for (var i = 0; i < this.ELEMENTS; ++i) {
          this[i] /= vector[i];
        }
      }

      return this.check();
    }
  }, {
    key: "lengthSq",
    value: function lengthSq() {
      return this.lengthSquared();
    }
  }, {
    key: "distanceTo",
    value: function distanceTo(vector) {
      return this.distance(vector);
    }
  }, {
    key: "distanceToSquared",
    value: function distanceToSquared(vector) {
      return this.distanceSquared(vector);
    }
  }, {
    key: "getComponent",
    value: function getComponent(i) {
      assert$1(i >= 0 && i < this.ELEMENTS, 'index is out of range');
      return checkNumber(this[i]);
    }
  }, {
    key: "setComponent",
    value: function setComponent(i, value) {
      assert$1(i >= 0 && i < this.ELEMENTS, 'index is out of range');
      this[i] = value;
      return this.check();
    }
  }, {
    key: "addVectors",
    value: function addVectors(a, b) {
      return this.copy(a).add(b);
    }
  }, {
    key: "subVectors",
    value: function subVectors(a, b) {
      return this.copy(a).subtract(b);
    }
  }, {
    key: "multiplyVectors",
    value: function multiplyVectors(a, b) {
      return this.copy(a).multiply(b);
    }
  }, {
    key: "addScaledVector",
    value: function addScaledVector(a, b) {
      return this.add(new this.constructor(a).multiplyScalar(b));
    }
  }, {
    key: "x",
    get: function get() {
      return this[0];
    },
    set: function set(value) {
      this[0] = checkNumber(value);
    }
  }, {
    key: "y",
    get: function get() {
      return this[1];
    },
    set: function set(value) {
      this[1] = checkNumber(value);
    }
  }]);

  return Vector;
}(MathArray);

function vec2_transformMat4AsVector(out, a, m) {
  var x = a[0];
  var y = a[1];
  var w = m[3] * x + m[7] * y || 1.0;
  out[0] = (m[0] * x + m[4] * y) / w;
  out[1] = (m[1] * x + m[5] * y) / w;
  return out;
}
function vec3_transformMat4AsVector(out, a, m) {
  var x = a[0];
  var y = a[1];
  var z = a[2];
  var w = m[3] * x + m[7] * y + m[11] * z || 1.0;
  out[0] = (m[0] * x + m[4] * y + m[8] * z) / w;
  out[1] = (m[1] * x + m[5] * y + m[9] * z) / w;
  out[2] = (m[2] * x + m[6] * y + m[10] * z) / w;
  return out;
}
function vec3_transformMat2(out, a, m) {
  var x = a[0];
  var y = a[1];
  out[0] = m[0] * x + m[2] * y;
  out[1] = m[1] * x + m[3] * y;
  out[2] = a[2];
  return out;
}

function _createSuper$2(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct$2(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _isNativeReflectConstruct$2() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }
var ORIGIN = [0, 0, 0];
var constants = {};

var Vector3 = function (_Vector) {
  _inherits(Vector3, _Vector);

  var _super = _createSuper$2(Vector3);

  _createClass(Vector3, null, [{
    key: "ZERO",
    get: function get() {
      return constants.ZERO = constants.ZERO || Object.freeze(new Vector3(0, 0, 0, 0));
    }
  }]);

  function Vector3() {
    var _this;

    var x = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
    var y = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
    var z = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;

    _classCallCheck(this, Vector3);

    _this = _super.call(this, -0, -0, -0);

    if (arguments.length === 1 && isArray(x)) {
      _this.copy(x);
    } else {
      if (config.debug) {
        checkNumber(x);
        checkNumber(y);
        checkNumber(z);
      }

      _this[0] = x;
      _this[1] = y;
      _this[2] = z;
    }

    return _this;
  }

  _createClass(Vector3, [{
    key: "set",
    value: function set(x, y, z) {
      this[0] = x;
      this[1] = y;
      this[2] = z;
      return this.check();
    }
  }, {
    key: "copy",
    value: function copy(array) {
      this[0] = array[0];
      this[1] = array[1];
      this[2] = array[2];
      return this.check();
    }
  }, {
    key: "fromObject",
    value: function fromObject(object) {
      if (config.debug) {
        checkNumber(object.x);
        checkNumber(object.y);
        checkNumber(object.z);
      }

      this[0] = object.x;
      this[1] = object.y;
      this[2] = object.z;
      return this.check();
    }
  }, {
    key: "toObject",
    value: function toObject(object) {
      object.x = this[0];
      object.y = this[1];
      object.z = this[2];
      return object;
    }
  }, {
    key: "angle",
    value: function angle$1(vector) {
      return angle(this, vector);
    }
  }, {
    key: "cross",
    value: function cross$1(vector) {
      cross(this, this, vector);
      return this.check();
    }
  }, {
    key: "rotateX",
    value: function rotateX$1(_ref) {
      var radians = _ref.radians,
          _ref$origin = _ref.origin,
          origin = _ref$origin === void 0 ? ORIGIN : _ref$origin;
      rotateX(this, this, origin, radians);
      return this.check();
    }
  }, {
    key: "rotateY",
    value: function rotateY$1(_ref2) {
      var radians = _ref2.radians,
          _ref2$origin = _ref2.origin,
          origin = _ref2$origin === void 0 ? ORIGIN : _ref2$origin;
      rotateY(this, this, origin, radians);
      return this.check();
    }
  }, {
    key: "rotateZ",
    value: function rotateZ$1(_ref3) {
      var radians = _ref3.radians,
          _ref3$origin = _ref3.origin,
          origin = _ref3$origin === void 0 ? ORIGIN : _ref3$origin;
      rotateZ(this, this, origin, radians);
      return this.check();
    }
  }, {
    key: "transform",
    value: function transform(matrix4) {
      return this.transformAsPoint(matrix4);
    }
  }, {
    key: "transformAsPoint",
    value: function transformAsPoint(matrix4) {
      transformMat4$1(this, this, matrix4);
      return this.check();
    }
  }, {
    key: "transformAsVector",
    value: function transformAsVector(matrix4) {
      vec3_transformMat4AsVector(this, this, matrix4);
      return this.check();
    }
  }, {
    key: "transformByMatrix3",
    value: function transformByMatrix3(matrix3) {
      transformMat3(this, this, matrix3);
      return this.check();
    }
  }, {
    key: "transformByMatrix2",
    value: function transformByMatrix2(matrix2) {
      vec3_transformMat2(this, this, matrix2);
      return this.check();
    }
  }, {
    key: "transformByQuaternion",
    value: function transformByQuaternion(quaternion) {
      transformQuat(this, this, quaternion);
      return this.check();
    }
  }, {
    key: "ELEMENTS",
    get: function get() {
      return 3;
    }
  }, {
    key: "z",
    get: function get() {
      return this[2];
    },
    set: function set(value) {
      this[2] = checkNumber(value);
    }
  }]);

  return Vector3;
}(Vector);

function _createSuper$3(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct$3(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _isNativeReflectConstruct$3() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

var Matrix = function (_MathArray) {
  _inherits(Matrix, _MathArray);

  var _super = _createSuper$3(Matrix);

  function Matrix() {
    _classCallCheck(this, Matrix);

    return _super.apply(this, arguments);
  }

  _createClass(Matrix, [{
    key: "toString",
    value: function toString() {
      var string = '[';

      if (config.printRowMajor) {
        string += 'row-major:';

        for (var row = 0; row < this.RANK; ++row) {
          for (var col = 0; col < this.RANK; ++col) {
            string += " ".concat(this[col * this.RANK + row]);
          }
        }
      } else {
        string += 'column-major:';

        for (var i = 0; i < this.ELEMENTS; ++i) {
          string += " ".concat(this[i]);
        }
      }

      string += ']';
      return string;
    }
  }, {
    key: "getElementIndex",
    value: function getElementIndex(row, col) {
      return col * this.RANK + row;
    }
  }, {
    key: "getElement",
    value: function getElement(row, col) {
      return this[col * this.RANK + row];
    }
  }, {
    key: "setElement",
    value: function setElement(row, col, value) {
      this[col * this.RANK + row] = checkNumber(value);
      return this;
    }
  }, {
    key: "getColumn",
    value: function getColumn(columnIndex) {
      var result = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : new Array(this.RANK).fill(-0);
      var firstIndex = columnIndex * this.RANK;

      for (var i = 0; i < this.RANK; ++i) {
        result[i] = this[firstIndex + i];
      }

      return result;
    }
  }, {
    key: "setColumn",
    value: function setColumn(columnIndex, columnVector) {
      var firstIndex = columnIndex * this.RANK;

      for (var i = 0; i < this.RANK; ++i) {
        this[firstIndex + i] = columnVector[i];
      }

      return this;
    }
  }]);

  return Matrix;
}(MathArray);

function _createSuper$4(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct$4(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _isNativeReflectConstruct$4() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }
var IDENTITY = Object.freeze([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
var ZERO = Object.freeze([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
var INDICES = Object.freeze({
  COL0ROW0: 0,
  COL0ROW1: 1,
  COL0ROW2: 2,
  COL0ROW3: 3,
  COL1ROW0: 4,
  COL1ROW1: 5,
  COL1ROW2: 6,
  COL1ROW3: 7,
  COL2ROW0: 8,
  COL2ROW1: 9,
  COL2ROW2: 10,
  COL2ROW3: 11,
  COL3ROW0: 12,
  COL3ROW1: 13,
  COL3ROW2: 14,
  COL3ROW3: 15
});
var constants$1 = {};

var Matrix4 = function (_Matrix) {
  _inherits(Matrix4, _Matrix);

  var _super = _createSuper$4(Matrix4);

  _createClass(Matrix4, [{
    key: "INDICES",
    get: function get() {
      return INDICES;
    }
  }, {
    key: "ELEMENTS",
    get: function get() {
      return 16;
    }
  }, {
    key: "RANK",
    get: function get() {
      return 4;
    }
  }], [{
    key: "IDENTITY",
    get: function get() {
      constants$1.IDENTITY = constants$1.IDENTITY || Object.freeze(new Matrix4(IDENTITY));
      return constants$1.IDENTITY;
    }
  }, {
    key: "ZERO",
    get: function get() {
      constants$1.ZERO = constants$1.ZERO || Object.freeze(new Matrix4(ZERO));
      return constants$1.ZERO;
    }
  }]);

  function Matrix4(array) {
    var _this;

    _classCallCheck(this, Matrix4);

    _this = _super.call(this, -0, -0, -0, -0, -0, -0, -0, -0, -0, -0, -0, -0, -0, -0, -0, -0);

    if (arguments.length === 1 && Array.isArray(array)) {
      _this.copy(array);
    } else {
      _this.identity();
    }

    return _this;
  }

  _createClass(Matrix4, [{
    key: "copy",
    value: function copy(array) {
      this[0] = array[0];
      this[1] = array[1];
      this[2] = array[2];
      this[3] = array[3];
      this[4] = array[4];
      this[5] = array[5];
      this[6] = array[6];
      this[7] = array[7];
      this[8] = array[8];
      this[9] = array[9];
      this[10] = array[10];
      this[11] = array[11];
      this[12] = array[12];
      this[13] = array[13];
      this[14] = array[14];
      this[15] = array[15];
      return this.check();
    }
  }, {
    key: "set",
    value: function set(m00, m10, m20, m30, m01, m11, m21, m31, m02, m12, m22, m32, m03, m13, m23, m33) {
      this[0] = m00;
      this[1] = m10;
      this[2] = m20;
      this[3] = m30;
      this[4] = m01;
      this[5] = m11;
      this[6] = m21;
      this[7] = m31;
      this[8] = m02;
      this[9] = m12;
      this[10] = m22;
      this[11] = m32;
      this[12] = m03;
      this[13] = m13;
      this[14] = m23;
      this[15] = m33;
      return this.check();
    }
  }, {
    key: "setRowMajor",
    value: function setRowMajor(m00, m01, m02, m03, m10, m11, m12, m13, m20, m21, m22, m23, m30, m31, m32, m33) {
      this[0] = m00;
      this[1] = m10;
      this[2] = m20;
      this[3] = m30;
      this[4] = m01;
      this[5] = m11;
      this[6] = m21;
      this[7] = m31;
      this[8] = m02;
      this[9] = m12;
      this[10] = m22;
      this[11] = m32;
      this[12] = m03;
      this[13] = m13;
      this[14] = m23;
      this[15] = m33;
      return this.check();
    }
  }, {
    key: "toRowMajor",
    value: function toRowMajor(result) {
      result[0] = this[0];
      result[1] = this[4];
      result[2] = this[8];
      result[3] = this[12];
      result[4] = this[1];
      result[5] = this[5];
      result[6] = this[9];
      result[7] = this[13];
      result[8] = this[2];
      result[9] = this[6];
      result[10] = this[10];
      result[11] = this[14];
      result[12] = this[3];
      result[13] = this[7];
      result[14] = this[11];
      result[15] = this[15];
      return result;
    }
  }, {
    key: "identity",
    value: function identity() {
      return this.copy(IDENTITY);
    }
  }, {
    key: "fromQuaternion",
    value: function fromQuaternion(q) {
      fromQuat(this, q);
      return this.check();
    }
  }, {
    key: "frustum",
    value: function frustum$1(_ref) {
      var left = _ref.left,
          right = _ref.right,
          bottom = _ref.bottom,
          top = _ref.top,
          near = _ref.near,
          far = _ref.far;

      if (far === Infinity) {
        Matrix4._computeInfinitePerspectiveOffCenter(this, left, right, bottom, top, near);
      } else {
        frustum(this, left, right, bottom, top, near, far);
      }

      return this.check();
    }
  }, {
    key: "lookAt",
    value: function lookAt$1(eye, center, up) {
      if (arguments.length === 1) {
        var _eye = eye;
        eye = _eye.eye;
        center = _eye.center;
        up = _eye.up;
      }

      center = center || [0, 0, 0];
      up = up || [0, 1, 0];
      lookAt(this, eye, center, up);
      return this.check();
    }
  }, {
    key: "ortho",
    value: function ortho$1(_ref2) {
      var left = _ref2.left,
          right = _ref2.right,
          bottom = _ref2.bottom,
          top = _ref2.top,
          _ref2$near = _ref2.near,
          near = _ref2$near === void 0 ? 0.1 : _ref2$near,
          _ref2$far = _ref2.far,
          far = _ref2$far === void 0 ? 500 : _ref2$far;
      ortho(this, left, right, bottom, top, near, far);
      return this.check();
    }
  }, {
    key: "orthographic",
    value: function orthographic(_ref3) {
      var _ref3$fovy = _ref3.fovy,
          fovy = _ref3$fovy === void 0 ? 45 * Math.PI / 180 : _ref3$fovy,
          _ref3$aspect = _ref3.aspect,
          aspect = _ref3$aspect === void 0 ? 1 : _ref3$aspect,
          _ref3$focalDistance = _ref3.focalDistance,
          focalDistance = _ref3$focalDistance === void 0 ? 1 : _ref3$focalDistance,
          _ref3$near = _ref3.near,
          near = _ref3$near === void 0 ? 0.1 : _ref3$near,
          _ref3$far = _ref3.far,
          far = _ref3$far === void 0 ? 500 : _ref3$far;

      if (fovy > Math.PI * 2) {
        throw Error('radians');
      }

      var halfY = fovy / 2;
      var top = focalDistance * Math.tan(halfY);
      var right = top * aspect;
      return new Matrix4().ortho({
        left: -right,
        right: right,
        bottom: -top,
        top: top,
        near: near,
        far: far
      });
    }
  }, {
    key: "perspective",
    value: function perspective$1() {
      var _ref4 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          _ref4$fovy = _ref4.fovy,
          fovy = _ref4$fovy === void 0 ? undefined : _ref4$fovy,
          _ref4$fov = _ref4.fov,
          fov = _ref4$fov === void 0 ? 45 * Math.PI / 180 : _ref4$fov,
          _ref4$aspect = _ref4.aspect,
          aspect = _ref4$aspect === void 0 ? 1 : _ref4$aspect,
          _ref4$near = _ref4.near,
          near = _ref4$near === void 0 ? 0.1 : _ref4$near,
          _ref4$far = _ref4.far,
          far = _ref4$far === void 0 ? 500 : _ref4$far;

      fovy = fovy || fov;

      if (fovy > Math.PI * 2) {
        throw Error('radians');
      }

      perspective(this, fovy, aspect, near, far);
      return this.check();
    }
  }, {
    key: "determinant",
    value: function determinant$1() {
      return determinant(this);
    }
  }, {
    key: "getScale",
    value: function getScale() {
      var result = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [-0, -0, -0];
      result[0] = Math.sqrt(this[0] * this[0] + this[1] * this[1] + this[2] * this[2]);
      result[1] = Math.sqrt(this[4] * this[4] + this[5] * this[5] + this[6] * this[6]);
      result[2] = Math.sqrt(this[8] * this[8] + this[9] * this[9] + this[10] * this[10]);
      return result;
    }
  }, {
    key: "getTranslation",
    value: function getTranslation() {
      var result = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [-0, -0, -0];
      result[0] = this[12];
      result[1] = this[13];
      result[2] = this[14];
      return result;
    }
  }, {
    key: "getRotation",
    value: function getRotation() {
      var result = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [-0, -0, -0, -0, -0, -0, -0, -0, -0, -0, -0, -0, -0, -0, -0, -0];
      var scaleResult = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
      var scale = this.getScale(scaleResult || [-0, -0, -0]);
      var inverseScale0 = 1 / scale[0];
      var inverseScale1 = 1 / scale[1];
      var inverseScale2 = 1 / scale[2];
      result[0] = this[0] * inverseScale0;
      result[1] = this[1] * inverseScale1;
      result[2] = this[2] * inverseScale2;
      result[3] = 0;
      result[4] = this[4] * inverseScale0;
      result[5] = this[5] * inverseScale1;
      result[6] = this[6] * inverseScale2;
      result[7] = 0;
      result[8] = this[8] * inverseScale0;
      result[9] = this[9] * inverseScale1;
      result[10] = this[10] * inverseScale2;
      result[11] = 0;
      result[12] = 0;
      result[13] = 0;
      result[14] = 0;
      result[15] = 1;
      return result;
    }
  }, {
    key: "getRotationMatrix3",
    value: function getRotationMatrix3() {
      var result = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [-0, -0, -0, -0, -0, -0, -0, -0, -0];
      var scaleResult = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
      var scale = this.getScale(scaleResult || [-0, -0, -0]);
      var inverseScale0 = 1 / scale[0];
      var inverseScale1 = 1 / scale[1];
      var inverseScale2 = 1 / scale[2];
      result[0] = this[0] * inverseScale0;
      result[1] = this[1] * inverseScale1;
      result[2] = this[2] * inverseScale2;
      result[3] = this[4] * inverseScale0;
      result[4] = this[5] * inverseScale1;
      result[5] = this[6] * inverseScale2;
      result[6] = this[8] * inverseScale0;
      result[7] = this[9] * inverseScale1;
      result[8] = this[10] * inverseScale2;
      return result;
    }
  }, {
    key: "transpose",
    value: function transpose$1() {
      transpose(this, this);
      return this.check();
    }
  }, {
    key: "invert",
    value: function invert$1() {
      invert(this, this);
      return this.check();
    }
  }, {
    key: "multiplyLeft",
    value: function multiplyLeft(a) {
      multiply(this, a, this);
      return this.check();
    }
  }, {
    key: "multiplyRight",
    value: function multiplyRight(a) {
      multiply(this, this, a);
      return this.check();
    }
  }, {
    key: "rotateX",
    value: function rotateX(radians) {
      rotateX$1(this, this, radians);
      return this.check();
    }
  }, {
    key: "rotateY",
    value: function rotateY(radians) {
      rotateY$1(this, this, radians);
      return this.check();
    }
  }, {
    key: "rotateZ",
    value: function rotateZ(radians) {
      rotateZ$1(this, this, radians);
      return this.check();
    }
  }, {
    key: "rotateXYZ",
    value: function rotateXYZ(_ref5) {
      var _ref6 = _slicedToArray(_ref5, 3),
          rx = _ref6[0],
          ry = _ref6[1],
          rz = _ref6[2];

      return this.rotateX(rx).rotateY(ry).rotateZ(rz);
    }
  }, {
    key: "rotateAxis",
    value: function rotateAxis(radians, axis) {
      rotate(this, this, radians, axis);
      return this.check();
    }
  }, {
    key: "scale",
    value: function scale$1(factor) {
      if (Array.isArray(factor)) {
        scale(this, this, factor);
      } else {
        scale(this, this, [factor, factor, factor]);
      }

      return this.check();
    }
  }, {
    key: "translate",
    value: function translate$1(vec) {
      translate(this, this, vec);
      return this.check();
    }
  }, {
    key: "transform",
    value: function transform(vector, result) {
      if (vector.length === 4) {
        result = transformMat4(result || [-0, -0, -0, -0], vector, this);
        checkVector(result, 4);
        return result;
      }

      return this.transformAsPoint(vector, result);
    }
  }, {
    key: "transformAsPoint",
    value: function transformAsPoint(vector, result) {
      var length = vector.length;

      switch (length) {
        case 2:
          result = transformMat4$2(result || [-0, -0], vector, this);
          break;

        case 3:
          result = transformMat4$1(result || [-0, -0, -0], vector, this);
          break;

        default:
          throw new Error('Illegal vector');
      }

      checkVector(result, vector.length);
      return result;
    }
  }, {
    key: "transformAsVector",
    value: function transformAsVector(vector, result) {
      switch (vector.length) {
        case 2:
          result = vec2_transformMat4AsVector(result || [-0, -0], vector, this);
          break;

        case 3:
          result = vec3_transformMat4AsVector(result || [-0, -0, -0], vector, this);
          break;

        default:
          throw new Error('Illegal vector');
      }

      checkVector(result, vector.length);
      return result;
    }
  }, {
    key: "makeRotationX",
    value: function makeRotationX(radians) {
      return this.identity().rotateX(radians);
    }
  }, {
    key: "makeTranslation",
    value: function makeTranslation(x, y, z) {
      return this.identity().translate([x, y, z]);
    }
  }, {
    key: "transformPoint",
    value: function transformPoint(vector, result) {
      deprecated('Matrix4.transformPoint', '3.0');
      return this.transformAsPoint(vector, result);
    }
  }, {
    key: "transformVector",
    value: function transformVector(vector, result) {
      deprecated('Matrix4.transformVector', '3.0');
      return this.transformAsPoint(vector, result);
    }
  }, {
    key: "transformDirection",
    value: function transformDirection(vector, result) {
      deprecated('Matrix4.transformDirection', '3.0');
      return this.transformAsVector(vector, result);
    }
  }], [{
    key: "_computeInfinitePerspectiveOffCenter",
    value: function _computeInfinitePerspectiveOffCenter(result, left, right, bottom, top, near) {
      var column0Row0 = 2.0 * near / (right - left);
      var column1Row1 = 2.0 * near / (top - bottom);
      var column2Row0 = (right + left) / (right - left);
      var column2Row1 = (top + bottom) / (top - bottom);
      var column2Row2 = -1.0;
      var column2Row3 = -1.0;
      var column3Row2 = -2.0 * near;
      result[0] = column0Row0;
      result[1] = 0.0;
      result[2] = 0.0;
      result[3] = 0.0;
      result[4] = 0.0;
      result[5] = column1Row1;
      result[6] = 0.0;
      result[7] = 0.0;
      result[8] = column2Row0;
      result[9] = column2Row1;
      result[10] = column2Row2;
      result[11] = column2Row3;
      result[12] = 0.0;
      result[13] = 0.0;
      result[14] = column3Row2;
      result[15] = 0.0;
      return result;
    }
  }]);

  return Matrix4;
}(Matrix);

function createMat4() {
  return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
}
function transformVector(matrix, vector) {
  var result = transformMat4([], vector, matrix);
  scale$1(result, result, 1 / result[3]);
  return result;
}
function mod(value, divisor) {
  var modulus = value % divisor;
  return modulus < 0 ? divisor + modulus : modulus;
}

function assert$2(condition, message) {
  if (!condition) {
    throw new Error(message || '@math.gl/web-mercator: assertion failed.');
  }
}

var PI = Math.PI;
var PI_4 = PI / 4;
var DEGREES_TO_RADIANS = PI / 180;
var RADIANS_TO_DEGREES = 180 / PI;
var TILE_SIZE = 512;
var EARTH_CIRCUMFERENCE = 40.03e6;
var DEFAULT_ALTITUDE = 1.5;
function zoomToScale(zoom) {
  return Math.pow(2, zoom);
}
function scaleToZoom(scale) {
  return Math.log2(scale);
}
function lngLatToWorld(_ref) {
  var _ref2 = _slicedToArray(_ref, 2),
      lng = _ref2[0],
      lat = _ref2[1];

  assert$2(Number.isFinite(lng));
  assert$2(Number.isFinite(lat) && lat >= -90 && lat <= 90, 'invalid latitude');
  var lambda2 = lng * DEGREES_TO_RADIANS;
  var phi2 = lat * DEGREES_TO_RADIANS;
  var x = TILE_SIZE * (lambda2 + PI) / (2 * PI);
  var y = TILE_SIZE * (PI + Math.log(Math.tan(PI_4 + phi2 * 0.5))) / (2 * PI);
  return [x, y];
}
function worldToLngLat(_ref3) {
  var _ref4 = _slicedToArray(_ref3, 2),
      x = _ref4[0],
      y = _ref4[1];

  var lambda2 = x / TILE_SIZE * (2 * PI) - PI;
  var phi2 = 2 * (Math.atan(Math.exp(y / TILE_SIZE * (2 * PI) - PI)) - PI_4);
  return [lambda2 * RADIANS_TO_DEGREES, phi2 * RADIANS_TO_DEGREES];
}
function getMeterZoom(_ref5) {
  var latitude = _ref5.latitude;
  assert$2(Number.isFinite(latitude));
  var latCosine = Math.cos(latitude * DEGREES_TO_RADIANS);
  return scaleToZoom(EARTH_CIRCUMFERENCE * latCosine) - 9;
}
function getDistanceScales(_ref6) {
  var latitude = _ref6.latitude,
      longitude = _ref6.longitude,
      _ref6$highPrecision = _ref6.highPrecision,
      highPrecision = _ref6$highPrecision === void 0 ? false : _ref6$highPrecision;
  assert$2(Number.isFinite(latitude) && Number.isFinite(longitude));
  var result = {};
  var worldSize = TILE_SIZE;
  var latCosine = Math.cos(latitude * DEGREES_TO_RADIANS);
  var unitsPerDegreeX = worldSize / 360;
  var unitsPerDegreeY = unitsPerDegreeX / latCosine;
  var altUnitsPerMeter = worldSize / EARTH_CIRCUMFERENCE / latCosine;
  result.unitsPerMeter = [altUnitsPerMeter, altUnitsPerMeter, altUnitsPerMeter];
  result.metersPerUnit = [1 / altUnitsPerMeter, 1 / altUnitsPerMeter, 1 / altUnitsPerMeter];
  result.unitsPerDegree = [unitsPerDegreeX, unitsPerDegreeY, altUnitsPerMeter];
  result.degreesPerUnit = [1 / unitsPerDegreeX, 1 / unitsPerDegreeY, 1 / altUnitsPerMeter];

  if (highPrecision) {
    var latCosine2 = DEGREES_TO_RADIANS * Math.tan(latitude * DEGREES_TO_RADIANS) / latCosine;
    var unitsPerDegreeY2 = unitsPerDegreeX * latCosine2 / 2;
    var altUnitsPerDegree2 = worldSize / EARTH_CIRCUMFERENCE * latCosine2;
    var altUnitsPerMeter2 = altUnitsPerDegree2 / unitsPerDegreeY * altUnitsPerMeter;
    result.unitsPerDegree2 = [0, unitsPerDegreeY2, altUnitsPerDegree2];
    result.unitsPerMeter2 = [altUnitsPerMeter2, 0, altUnitsPerMeter2];
  }

  return result;
}
function addMetersToLngLat(lngLatZ, xyz) {
  var _lngLatZ = _slicedToArray(lngLatZ, 3),
      longitude = _lngLatZ[0],
      latitude = _lngLatZ[1],
      z0 = _lngLatZ[2];

  var _xyz = _slicedToArray(xyz, 3),
      x = _xyz[0],
      y = _xyz[1],
      z = _xyz[2];

  var _getDistanceScales = getDistanceScales({
    longitude: longitude,
    latitude: latitude,
    highPrecision: true
  }),
      unitsPerMeter = _getDistanceScales.unitsPerMeter,
      unitsPerMeter2 = _getDistanceScales.unitsPerMeter2;

  var worldspace = lngLatToWorld(lngLatZ);
  worldspace[0] += x * (unitsPerMeter[0] + unitsPerMeter2[0] * y);
  worldspace[1] += y * (unitsPerMeter[1] + unitsPerMeter2[1] * y);
  var newLngLat = worldToLngLat(worldspace);
  var newZ = (z0 || 0) + (z || 0);
  return Number.isFinite(z0) || Number.isFinite(z) ? [newLngLat[0], newLngLat[1], newZ] : newLngLat;
}
function getViewMatrix(_ref7) {
  var height = _ref7.height,
      pitch = _ref7.pitch,
      bearing = _ref7.bearing,
      altitude = _ref7.altitude,
      scale$1 = _ref7.scale,
      _ref7$center = _ref7.center,
      center = _ref7$center === void 0 ? null : _ref7$center;
  var vm = createMat4();
  translate(vm, vm, [0, 0, -altitude]);
  rotateX$1(vm, vm, -pitch * DEGREES_TO_RADIANS);
  rotateZ$1(vm, vm, bearing * DEGREES_TO_RADIANS);
  scale$1 /= height;
  scale(vm, vm, [scale$1, scale$1, scale$1]);

  if (center) {
    translate(vm, vm, negate([], center));
  }

  return vm;
}
function getProjectionParameters(_ref8) {
  var width = _ref8.width,
      height = _ref8.height,
      _ref8$altitude = _ref8.altitude,
      altitude = _ref8$altitude === void 0 ? DEFAULT_ALTITUDE : _ref8$altitude,
      _ref8$pitch = _ref8.pitch,
      pitch = _ref8$pitch === void 0 ? 0 : _ref8$pitch,
      _ref8$nearZMultiplier = _ref8.nearZMultiplier,
      nearZMultiplier = _ref8$nearZMultiplier === void 0 ? 1 : _ref8$nearZMultiplier,
      _ref8$farZMultiplier = _ref8.farZMultiplier,
      farZMultiplier = _ref8$farZMultiplier === void 0 ? 1 : _ref8$farZMultiplier;
  var pitchRadians = pitch * DEGREES_TO_RADIANS;
  var halfFov = Math.atan(0.5 / altitude);
  var topHalfSurfaceDistance = Math.sin(halfFov) * altitude / Math.sin(Math.min(Math.max(Math.PI / 2 - pitchRadians - halfFov, 0.01), Math.PI - 0.01));
  var farZ = Math.sin(pitchRadians) * topHalfSurfaceDistance + altitude;
  return {
    fov: 2 * halfFov,
    aspect: width / height,
    focalDistance: altitude,
    near: nearZMultiplier,
    far: farZ * farZMultiplier
  };
}
function getProjectionMatrix(_ref9) {
  var width = _ref9.width,
      height = _ref9.height,
      pitch = _ref9.pitch,
      altitude = _ref9.altitude,
      nearZMultiplier = _ref9.nearZMultiplier,
      farZMultiplier = _ref9.farZMultiplier;

  var _getProjectionParamet = getProjectionParameters({
    width: width,
    height: height,
    altitude: altitude,
    pitch: pitch,
    nearZMultiplier: nearZMultiplier,
    farZMultiplier: farZMultiplier
  }),
      fov = _getProjectionParamet.fov,
      aspect = _getProjectionParamet.aspect,
      near = _getProjectionParamet.near,
      far = _getProjectionParamet.far;

  var projectionMatrix = perspective([], fov, aspect, near, far);
  return projectionMatrix;
}
function worldToPixels(xyz, pixelProjectionMatrix) {
  var _xyz2 = _slicedToArray(xyz, 3),
      x = _xyz2[0],
      y = _xyz2[1],
      _xyz2$ = _xyz2[2],
      z = _xyz2$ === void 0 ? 0 : _xyz2$;

  assert$2(Number.isFinite(x) && Number.isFinite(y) && Number.isFinite(z));
  return transformVector(pixelProjectionMatrix, [x, y, z, 1]);
}
function pixelsToWorld(xyz, pixelUnprojectionMatrix) {
  var targetZ = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;

  var _xyz3 = _slicedToArray(xyz, 3),
      x = _xyz3[0],
      y = _xyz3[1],
      z = _xyz3[2];

  assert$2(Number.isFinite(x) && Number.isFinite(y), 'invalid pixel coordinate');

  if (Number.isFinite(z)) {
    var coord = transformVector(pixelUnprojectionMatrix, [x, y, z, 1]);
    return coord;
  }

  var coord0 = transformVector(pixelUnprojectionMatrix, [x, y, 0, 1]);
  var coord1 = transformVector(pixelUnprojectionMatrix, [x, y, 1, 1]);
  var z0 = coord0[2];
  var z1 = coord1[2];
  var t = z0 === z1 ? 0 : ((targetZ || 0) - z0) / (z1 - z0);
  return lerp$1([], coord0, coord1, t);
}

function fitBounds(_ref) {
  var width = _ref.width,
      height = _ref.height,
      bounds = _ref.bounds,
      _ref$minExtent = _ref.minExtent,
      minExtent = _ref$minExtent === void 0 ? 0 : _ref$minExtent,
      _ref$maxZoom = _ref.maxZoom,
      maxZoom = _ref$maxZoom === void 0 ? 24 : _ref$maxZoom,
      _ref$padding = _ref.padding,
      padding = _ref$padding === void 0 ? 0 : _ref$padding,
      _ref$offset = _ref.offset,
      offset = _ref$offset === void 0 ? [0, 0] : _ref$offset;

  var _bounds = _slicedToArray(bounds, 2),
      _bounds$ = _slicedToArray(_bounds[0], 2),
      west = _bounds$[0],
      south = _bounds$[1],
      _bounds$2 = _slicedToArray(_bounds[1], 2),
      east = _bounds$2[0],
      north = _bounds$2[1];

  if (Number.isFinite(padding)) {
    var p = padding;
    padding = {
      top: p,
      bottom: p,
      left: p,
      right: p
    };
  } else {
    assert$2(Number.isFinite(padding.top) && Number.isFinite(padding.bottom) && Number.isFinite(padding.left) && Number.isFinite(padding.right));
  }

  var viewport = new WebMercatorViewport({
    width: width,
    height: height,
    longitude: 0,
    latitude: 0,
    zoom: 0
  });
  var nw = viewport.project([west, north]);
  var se = viewport.project([east, south]);
  var size = [Math.max(Math.abs(se[0] - nw[0]), minExtent), Math.max(Math.abs(se[1] - nw[1]), minExtent)];
  var targetSize = [width - padding.left - padding.right - Math.abs(offset[0]) * 2, height - padding.top - padding.bottom - Math.abs(offset[1]) * 2];
  assert$2(targetSize[0] > 0 && targetSize[1] > 0);
  var scaleX = targetSize[0] / size[0];
  var scaleY = targetSize[1] / size[1];
  var offsetX = (padding.right - padding.left) / 2 / scaleX;
  var offsetY = (padding.bottom - padding.top) / 2 / scaleY;
  var center = [(se[0] + nw[0]) / 2 + offsetX, (se[1] + nw[1]) / 2 + offsetY];
  var centerLngLat = viewport.unproject(center);
  var zoom = Math.min(maxZoom, viewport.zoom + Math.log2(Math.abs(Math.min(scaleX, scaleY))));
  assert$2(Number.isFinite(zoom));
  return {
    longitude: centerLngLat[0],
    latitude: centerLngLat[1],
    zoom: zoom
  };
}

var DEGREES_TO_RADIANS$1 = Math.PI / 180;
function getBounds(viewport) {
  var z = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
  var width = viewport.width,
      height = viewport.height,
      unproject = viewport.unproject;
  var unprojectOps = {
    targetZ: z
  };
  var bottomLeft = unproject([0, height], unprojectOps);
  var bottomRight = unproject([width, height], unprojectOps);
  var topLeft;
  var topRight;
  var halfFov = Math.atan(0.5 / viewport.altitude);
  var angleToGround = (90 - viewport.pitch) * DEGREES_TO_RADIANS$1;

  if (halfFov > angleToGround - 0.01) {
    topLeft = unprojectOnFarPlane(viewport, 0, z);
    topRight = unprojectOnFarPlane(viewport, width, z);
  } else {
    topLeft = unproject([0, 0], unprojectOps);
    topRight = unproject([width, 0], unprojectOps);
  }

  return [bottomLeft, bottomRight, topRight, topLeft];
}

function unprojectOnFarPlane(viewport, x, targetZ) {
  var pixelUnprojectionMatrix = viewport.pixelUnprojectionMatrix;
  var coord0 = transformVector(pixelUnprojectionMatrix, [x, 0, 1, 1]);
  var coord1 = transformVector(pixelUnprojectionMatrix, [x, viewport.height, 1, 1]);
  var z = targetZ * viewport.distanceScales.unitsPerMeter[2];
  var t = (z - coord0[2]) / (coord1[2] - coord0[2]);
  var coord = lerp$1([], coord0, coord1, t);
  var result = worldToLngLat(coord);
  result[2] = targetZ;
  return result;
}

var WebMercatorViewport = function () {
  function WebMercatorViewport() {
    var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {
      width: 1,
      height: 1
    },
        width = _ref.width,
        height = _ref.height,
        _ref$latitude = _ref.latitude,
        latitude = _ref$latitude === void 0 ? 0 : _ref$latitude,
        _ref$longitude = _ref.longitude,
        longitude = _ref$longitude === void 0 ? 0 : _ref$longitude,
        _ref$zoom = _ref.zoom,
        zoom = _ref$zoom === void 0 ? 0 : _ref$zoom,
        _ref$pitch = _ref.pitch,
        pitch = _ref$pitch === void 0 ? 0 : _ref$pitch,
        _ref$bearing = _ref.bearing,
        bearing = _ref$bearing === void 0 ? 0 : _ref$bearing,
        _ref$altitude = _ref.altitude,
        altitude = _ref$altitude === void 0 ? 1.5 : _ref$altitude,
        _ref$nearZMultiplier = _ref.nearZMultiplier,
        nearZMultiplier = _ref$nearZMultiplier === void 0 ? 0.02 : _ref$nearZMultiplier,
        _ref$farZMultiplier = _ref.farZMultiplier,
        farZMultiplier = _ref$farZMultiplier === void 0 ? 1.01 : _ref$farZMultiplier;

    _classCallCheck(this, WebMercatorViewport);

    width = width || 1;
    height = height || 1;
    var scale = zoomToScale(zoom);
    altitude = Math.max(0.75, altitude);
    var center = lngLatToWorld([longitude, latitude]);
    center[2] = 0;
    this.projectionMatrix = getProjectionMatrix({
      width: width,
      height: height,
      pitch: pitch,
      altitude: altitude,
      nearZMultiplier: nearZMultiplier,
      farZMultiplier: farZMultiplier
    });
    this.viewMatrix = getViewMatrix({
      height: height,
      scale: scale,
      center: center,
      pitch: pitch,
      bearing: bearing,
      altitude: altitude
    });
    this.width = width;
    this.height = height;
    this.scale = scale;
    this.latitude = latitude;
    this.longitude = longitude;
    this.zoom = zoom;
    this.pitch = pitch;
    this.bearing = bearing;
    this.altitude = altitude;
    this.center = center;
    this.distanceScales = getDistanceScales(this);

    this._initMatrices();

    this.equals = this.equals.bind(this);
    this.project = this.project.bind(this);
    this.unproject = this.unproject.bind(this);
    this.projectPosition = this.projectPosition.bind(this);
    this.unprojectPosition = this.unprojectPosition.bind(this);
    Object.freeze(this);
  }

  _createClass(WebMercatorViewport, [{
    key: "_initMatrices",
    value: function _initMatrices() {
      var width = this.width,
          height = this.height,
          projectionMatrix = this.projectionMatrix,
          viewMatrix = this.viewMatrix;
      var vpm = createMat4();
      multiply(vpm, vpm, projectionMatrix);
      multiply(vpm, vpm, viewMatrix);
      this.viewProjectionMatrix = vpm;
      var m = createMat4();
      scale(m, m, [width / 2, -height / 2, 1]);
      translate(m, m, [1, -1, 0]);
      multiply(m, m, vpm);
      var mInverse = invert(createMat4(), m);

      if (!mInverse) {
        throw new Error('Pixel project matrix not invertible');
      }

      this.pixelProjectionMatrix = m;
      this.pixelUnprojectionMatrix = mInverse;
    }
  }, {
    key: "equals",
    value: function equals(viewport) {
      if (!(viewport instanceof WebMercatorViewport)) {
        return false;
      }

      return viewport.width === this.width && viewport.height === this.height && equals$1(viewport.projectionMatrix, this.projectionMatrix) && equals$1(viewport.viewMatrix, this.viewMatrix);
    }
  }, {
    key: "project",
    value: function project(xyz) {
      var _ref2 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
          _ref2$topLeft = _ref2.topLeft,
          topLeft = _ref2$topLeft === void 0 ? true : _ref2$topLeft;

      var worldPosition = this.projectPosition(xyz);
      var coord = worldToPixels(worldPosition, this.pixelProjectionMatrix);

      var _coord = _slicedToArray(coord, 2),
          x = _coord[0],
          y = _coord[1];

      var y2 = topLeft ? y : this.height - y;
      return xyz.length === 2 ? [x, y2] : [x, y2, coord[2]];
    }
  }, {
    key: "unproject",
    value: function unproject(xyz) {
      var _ref3 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
          _ref3$topLeft = _ref3.topLeft,
          topLeft = _ref3$topLeft === void 0 ? true : _ref3$topLeft,
          _ref3$targetZ = _ref3.targetZ,
          targetZ = _ref3$targetZ === void 0 ? undefined : _ref3$targetZ;

      var _xyz = _slicedToArray(xyz, 3),
          x = _xyz[0],
          y = _xyz[1],
          z = _xyz[2];

      var y2 = topLeft ? y : this.height - y;
      var targetZWorld = targetZ && targetZ * this.distanceScales.unitsPerMeter[2];
      var coord = pixelsToWorld([x, y2, z], this.pixelUnprojectionMatrix, targetZWorld);

      var _this$unprojectPositi = this.unprojectPosition(coord),
          _this$unprojectPositi2 = _slicedToArray(_this$unprojectPositi, 3),
          X = _this$unprojectPositi2[0],
          Y = _this$unprojectPositi2[1],
          Z = _this$unprojectPositi2[2];

      if (Number.isFinite(z)) {
        return [X, Y, Z];
      }

      return Number.isFinite(targetZ) ? [X, Y, targetZ] : [X, Y];
    }
  }, {
    key: "projectPosition",
    value: function projectPosition(xyz) {
      var _lngLatToWorld = lngLatToWorld(xyz),
          _lngLatToWorld2 = _slicedToArray(_lngLatToWorld, 2),
          X = _lngLatToWorld2[0],
          Y = _lngLatToWorld2[1];

      var Z = (xyz[2] || 0) * this.distanceScales.unitsPerMeter[2];
      return [X, Y, Z];
    }
  }, {
    key: "unprojectPosition",
    value: function unprojectPosition(xyz) {
      var _worldToLngLat = worldToLngLat(xyz),
          _worldToLngLat2 = _slicedToArray(_worldToLngLat, 2),
          X = _worldToLngLat2[0],
          Y = _worldToLngLat2[1];

      var Z = (xyz[2] || 0) * this.distanceScales.metersPerUnit[2];
      return [X, Y, Z];
    }
  }, {
    key: "projectFlat",
    value: function projectFlat(lngLat) {
      return lngLatToWorld(lngLat);
    }
  }, {
    key: "unprojectFlat",
    value: function unprojectFlat(xy) {
      return worldToLngLat(xy);
    }
  }, {
    key: "getMapCenterByLngLatPosition",
    value: function getMapCenterByLngLatPosition(_ref4) {
      var lngLat = _ref4.lngLat,
          pos = _ref4.pos;
      var fromLocation = pixelsToWorld(pos, this.pixelUnprojectionMatrix);
      var toLocation = lngLatToWorld(lngLat);
      var translate = add$1([], toLocation, negate$1([], fromLocation));
      var newCenter = add$1([], this.center, translate);
      return worldToLngLat(newCenter);
    }
  }, {
    key: "getLocationAtPoint",
    value: function getLocationAtPoint(_ref5) {
      var lngLat = _ref5.lngLat,
          pos = _ref5.pos;
      return this.getMapCenterByLngLatPosition({
        lngLat: lngLat,
        pos: pos
      });
    }
  }, {
    key: "fitBounds",
    value: function fitBounds$1(bounds) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var width = this.width,
          height = this.height;

      var _fitBounds2 = fitBounds(Object.assign({
        width: width,
        height: height,
        bounds: bounds
      }, options)),
          longitude = _fitBounds2.longitude,
          latitude = _fitBounds2.latitude,
          zoom = _fitBounds2.zoom;

      return new WebMercatorViewport({
        width: width,
        height: height,
        longitude: longitude,
        latitude: latitude,
        zoom: zoom
      });
    }
  }, {
    key: "getBounds",
    value: function getBounds(options) {
      var corners = this.getBoundingRegion(options);
      var west = Math.min.apply(Math, _toConsumableArray(corners.map(function (p) {
        return p[0];
      })));
      var east = Math.max.apply(Math, _toConsumableArray(corners.map(function (p) {
        return p[0];
      })));
      var south = Math.min.apply(Math, _toConsumableArray(corners.map(function (p) {
        return p[1];
      })));
      var north = Math.max.apply(Math, _toConsumableArray(corners.map(function (p) {
        return p[1];
      })));
      return [[west, south], [east, north]];
    }
  }, {
    key: "getBoundingRegion",
    value: function getBoundingRegion() {
      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      return getBounds(this, options.z || 0);
    }
  }]);

  return WebMercatorViewport;
}();

var TypedArrayManager = function () {
  function TypedArrayManager(props) {
    _classCallCheck(this, TypedArrayManager);

    this._pool = [];
    this.props = {
      overAlloc: 2,
      poolSize: 100
    };
    this.setProps(props);
  }

  _createClass(TypedArrayManager, [{
    key: "setProps",
    value: function setProps(props) {
      Object.assign(this.props, props);
    }
  }, {
    key: "allocate",
    value: function allocate(typedArray, count, _ref) {
      var _ref$size = _ref.size,
          size = _ref$size === void 0 ? 1 : _ref$size,
          type = _ref.type,
          _ref$padding = _ref.padding,
          padding = _ref$padding === void 0 ? 0 : _ref$padding,
          _ref$copy = _ref.copy,
          copy = _ref$copy === void 0 ? false : _ref$copy,
          _ref$initialize = _ref.initialize,
          initialize = _ref$initialize === void 0 ? false : _ref$initialize,
          maxCount = _ref.maxCount;
      var Type = type || typedArray && typedArray.constructor || Float32Array;
      var newSize = count * size + padding;

      if (ArrayBuffer.isView(typedArray)) {
        if (newSize <= typedArray.length) {
          return typedArray;
        }

        if (newSize * typedArray.BYTES_PER_ELEMENT <= typedArray.buffer.byteLength) {
          return new Type(typedArray.buffer, 0, newSize);
        }
      }

      var maxSize;

      if (maxCount) {
        maxSize = maxCount * size + padding;
      }

      var newArray = this._allocate(Type, newSize, initialize, maxSize);

      if (typedArray && copy) {
        newArray.set(typedArray);
      } else if (!initialize) {
        newArray.fill(0, 0, 4);
      }

      this._release(typedArray);

      return newArray;
    }
  }, {
    key: "release",
    value: function release(typedArray) {
      this._release(typedArray);
    }
  }, {
    key: "_allocate",
    value: function _allocate(Type, size, initialize, maxSize) {
      var sizeToAllocate = Math.max(Math.ceil(size * this.props.overAlloc), 1);

      if (sizeToAllocate > maxSize) {
        sizeToAllocate = maxSize;
      }

      var pool = this._pool;
      var byteLength = Type.BYTES_PER_ELEMENT * sizeToAllocate;
      var i = pool.findIndex(function (b) {
        return b.byteLength >= byteLength;
      });

      if (i >= 0) {
        var array = new Type(pool.splice(i, 1)[0], 0, sizeToAllocate);

        if (initialize) {
          array.fill(0);
        }

        return array;
      }

      return new Type(sizeToAllocate);
    }
  }, {
    key: "_release",
    value: function _release(typedArray) {
      if (!ArrayBuffer.isView(typedArray)) {
        return;
      }

      var pool = this._pool;
      var buffer = typedArray.buffer;
      var byteLength = buffer.byteLength;
      var i = pool.findIndex(function (b) {
        return b.byteLength >= byteLength;
      });

      if (i < 0) {
        pool.push(buffer);
      } else if (i > 0 || pool.length < this.props.poolSize) {
        pool.splice(i, 0, buffer);
      }

      if (pool.length > this.props.poolSize) {
        pool.shift();
      }
    }
  }]);

  return TypedArrayManager;
}();
var defaultTypedArrayManager = new TypedArrayManager();

function createMat4$1() {
  return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
}
function mod$1(value, divisor) {
  var modulus = value % divisor;
  return modulus < 0 ? divisor + modulus : modulus;
}
function extractCameraVectors(_ref) {
  var viewMatrix = _ref.viewMatrix,
      viewMatrixInverse = _ref.viewMatrixInverse;
  return {
    eye: [viewMatrixInverse[12], viewMatrixInverse[13], viewMatrixInverse[14]],
    direction: [-viewMatrix[2], -viewMatrix[6], -viewMatrix[10]],
    up: [viewMatrix[1], viewMatrix[5], viewMatrix[9]],
    right: [viewMatrix[0], viewMatrix[4], viewMatrix[8]]
  };
}
var cameraPosition = new Vector3();
var cameraDirection = new Vector3();
var cameraUp = new Vector3();
var cameraRight = new Vector3();
var nearCenter = new Vector3();
var farCenter = new Vector3();
var a = new Vector3();
function getFrustumPlanes(_ref2) {
  var aspect = _ref2.aspect,
      near = _ref2.near,
      far = _ref2.far,
      fovyRadians = _ref2.fovyRadians,
      position = _ref2.position,
      direction = _ref2.direction,
      up = _ref2.up,
      right = _ref2.right;
  cameraDirection.copy(direction);
  var nearFarScale = 1 / cameraDirection.len();
  cameraDirection.normalize();
  cameraPosition.copy(position);
  cameraUp.copy(up);
  var widthScale = 1 / cameraUp.len();
  cameraUp.normalize();
  cameraRight.copy(right).normalize();
  var nearHeight = 2 * Math.tan(fovyRadians / 2) * near * widthScale;
  var nearWidth = nearHeight * aspect;
  nearCenter.copy(cameraDirection).scale(near * nearFarScale).add(cameraPosition);
  farCenter.copy(cameraDirection).scale(far * nearFarScale).add(cameraPosition);
  var normal = cameraDirection.clone().negate();
  var distance = normal.dot(nearCenter);
  var planes = {
    near: {
      distance: distance,
      normal: normal
    },
    far: {
      distance: cameraDirection.dot(farCenter),
      normal: cameraDirection.clone()
    }
  };
  a.copy(cameraRight).scale(nearWidth * 0.5).add(nearCenter).subtract(cameraPosition).normalize();
  normal = new Vector3(a).cross(cameraUp);
  distance = cameraPosition.dot(normal);
  planes.right = {
    normal: normal,
    distance: distance
  };
  a.copy(cameraRight).scale(-nearWidth * 0.5).add(nearCenter).subtract(cameraPosition).normalize();
  normal = new Vector3(cameraUp).cross(a);
  distance = cameraPosition.dot(normal);
  planes.left = {
    normal: normal,
    distance: distance
  };
  a.copy(cameraUp).scale(nearHeight * 0.5).add(nearCenter).subtract(cameraPosition).normalize();
  normal = new Vector3(cameraRight).cross(a);
  distance = cameraPosition.dot(normal);
  planes.top = {
    normal: normal,
    distance: distance
  };
  a.copy(cameraUp).scale(-nearHeight * 0.5).add(nearCenter).subtract(cameraPosition).normalize();
  normal = new Vector3(a).cross(cameraRight);
  distance = cameraPosition.dot(normal);
  planes.bottom = {
    normal: normal,
    distance: distance
  };
  return planes;
}
function fp64LowPart(x) {
  return x - Math.fround(x);
}
var scratchArray;
function toDoublePrecisionArray(typedArray, _ref3) {
  var _ref3$size = _ref3.size,
      size = _ref3$size === void 0 ? 1 : _ref3$size,
      _ref3$startIndex = _ref3.startIndex,
      startIndex = _ref3$startIndex === void 0 ? 0 : _ref3$startIndex,
      endIndex = _ref3.endIndex;

  if (!Number.isFinite(endIndex)) {
    endIndex = typedArray.length;
  }

  var count = (endIndex - startIndex) / size;
  scratchArray = defaultTypedArrayManager.allocate(scratchArray, count, {
    type: Float32Array,
    size: size * 2
  });
  var sourceIndex = startIndex;
  var targetIndex = 0;

  while (sourceIndex < endIndex) {
    for (var j = 0; j < size; j++) {
      var value = typedArray[sourceIndex++];
      scratchArray[targetIndex + j] = value;
      scratchArray[targetIndex + j + size] = fp64LowPart(value);
    }

    targetIndex += size * 2;
  }

  return scratchArray.subarray(0, count * size * 2);
}

var DEGREES_TO_RADIANS$2 = Math.PI / 180;
var IDENTITY$1 = createMat4$1();
var ZERO_VECTOR$1 = [0, 0, 0];
var DEFAULT_ZOOM = 0;
var DEFAULT_DISTANCE_SCALES = {
  unitsPerMeter: [1, 1, 1],
  metersPerUnit: [1, 1, 1]
};

var Viewport = function () {
  function Viewport() {
    var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, Viewport);

    var _opts$id = opts.id,
        id = _opts$id === void 0 ? null : _opts$id,
        _opts$x = opts.x,
        x = _opts$x === void 0 ? 0 : _opts$x,
        _opts$y = opts.y,
        y = _opts$y === void 0 ? 0 : _opts$y,
        _opts$width = opts.width,
        width = _opts$width === void 0 ? 1 : _opts$width,
        _opts$height = opts.height,
        height = _opts$height === void 0 ? 1 : _opts$height;
    this.id = id || this.constructor.displayName || 'viewport';
    this.x = x;
    this.y = y;
    this.width = width || 1;
    this.height = height || 1;
    this._frustumPlanes = {};

    this._initViewMatrix(opts);

    this._initProjectionMatrix(opts);

    this._initPixelMatrices();

    this.equals = this.equals.bind(this);
    this.project = this.project.bind(this);
    this.unproject = this.unproject.bind(this);
    this.projectPosition = this.projectPosition.bind(this);
    this.unprojectPosition = this.unprojectPosition.bind(this);
    this.projectFlat = this.projectFlat.bind(this);
    this.unprojectFlat = this.unprojectFlat.bind(this);
  }

  _createClass(Viewport, [{
    key: "equals",
    value: function equals$1(viewport) {
      if (!(viewport instanceof Viewport)) {
        return false;
      }

      if (this === viewport) {
        return true;
      }

      return viewport.width === this.width && viewport.height === this.height && viewport.scale === this.scale && equals(viewport.projectionMatrix, this.projectionMatrix) && equals(viewport.viewMatrix, this.viewMatrix);
    }
  }, {
    key: "project",
    value: function project(xyz) {
      var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
          _ref$topLeft = _ref.topLeft,
          topLeft = _ref$topLeft === void 0 ? true : _ref$topLeft;

      var worldPosition = this.projectPosition(xyz);
      var coord = worldToPixels(worldPosition, this.pixelProjectionMatrix);

      var _coord = _slicedToArray(coord, 2),
          x = _coord[0],
          y = _coord[1];

      var y2 = topLeft ? y : this.height - y;
      return xyz.length === 2 ? [x, y2] : [x, y2, coord[2]];
    }
  }, {
    key: "unproject",
    value: function unproject(xyz) {
      var _ref2 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
          _ref2$topLeft = _ref2.topLeft,
          topLeft = _ref2$topLeft === void 0 ? true : _ref2$topLeft,
          targetZ = _ref2.targetZ;

      var _xyz = _slicedToArray(xyz, 3),
          x = _xyz[0],
          y = _xyz[1],
          z = _xyz[2];

      var y2 = topLeft ? y : this.height - y;
      var targetZWorld = targetZ && targetZ * this.distanceScales.unitsPerMeter[2];
      var coord = pixelsToWorld([x, y2, z], this.pixelUnprojectionMatrix, targetZWorld);

      var _this$unprojectPositi = this.unprojectPosition(coord),
          _this$unprojectPositi2 = _slicedToArray(_this$unprojectPositi, 3),
          X = _this$unprojectPositi2[0],
          Y = _this$unprojectPositi2[1],
          Z = _this$unprojectPositi2[2];

      if (Number.isFinite(z)) {
        return [X, Y, Z];
      }

      return Number.isFinite(targetZ) ? [X, Y, targetZ] : [X, Y];
    }
  }, {
    key: "projectPosition",
    value: function projectPosition(xyz) {
      var _this$projectFlat = this.projectFlat(xyz),
          _this$projectFlat2 = _slicedToArray(_this$projectFlat, 2),
          X = _this$projectFlat2[0],
          Y = _this$projectFlat2[1];

      var Z = (xyz[2] || 0) * this.distanceScales.unitsPerMeter[2];
      return [X, Y, Z];
    }
  }, {
    key: "unprojectPosition",
    value: function unprojectPosition(xyz) {
      var _this$unprojectFlat = this.unprojectFlat(xyz),
          _this$unprojectFlat2 = _slicedToArray(_this$unprojectFlat, 2),
          X = _this$unprojectFlat2[0],
          Y = _this$unprojectFlat2[1];

      var Z = (xyz[2] || 0) * this.distanceScales.metersPerUnit[2];
      return [X, Y, Z];
    }
  }, {
    key: "projectFlat",
    value: function projectFlat(xyz) {
      if (this.isGeospatial) {
        return lngLatToWorld(xyz);
      }

      return xyz;
    }
  }, {
    key: "unprojectFlat",
    value: function unprojectFlat(xyz) {
      if (this.isGeospatial) {
        return worldToLngLat(xyz);
      }

      return xyz;
    }
  }, {
    key: "getBounds",
    value: function getBounds() {
      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var unprojectOption = {
        targetZ: options.z || 0
      };
      var topLeft = this.unproject([0, 0], unprojectOption);
      var topRight = this.unproject([this.width, 0], unprojectOption);
      var bottomLeft = this.unproject([0, this.height], unprojectOption);
      var bottomRight = this.unproject([this.width, this.height], unprojectOption);
      return [Math.min(topLeft[0], topRight[0], bottomLeft[0], bottomRight[0]), Math.min(topLeft[1], topRight[1], bottomLeft[1], bottomRight[1]), Math.max(topLeft[0], topRight[0], bottomLeft[0], bottomRight[0]), Math.max(topLeft[1], topRight[1], bottomLeft[1], bottomRight[1])];
    }
  }, {
    key: "getDistanceScales",
    value: function getDistanceScales$1() {
      var coordinateOrigin = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

      if (coordinateOrigin) {
        return getDistanceScales({
          longitude: coordinateOrigin[0],
          latitude: coordinateOrigin[1],
          highPrecision: true
        });
      }

      return this.distanceScales;
    }
  }, {
    key: "containsPixel",
    value: function containsPixel(_ref3) {
      var x = _ref3.x,
          y = _ref3.y,
          _ref3$width = _ref3.width,
          width = _ref3$width === void 0 ? 1 : _ref3$width,
          _ref3$height = _ref3.height,
          height = _ref3$height === void 0 ? 1 : _ref3$height;
      return x < this.x + this.width && this.x < x + width && y < this.y + this.height && this.y < y + height;
    }
  }, {
    key: "getFrustumPlanes",
    value: function getFrustumPlanes$1() {
      if (this._frustumPlanes.near) {
        return this._frustumPlanes;
      }

      var _this$projectionProps = this.projectionProps,
          near = _this$projectionProps.near,
          far = _this$projectionProps.far,
          fovyRadians = _this$projectionProps.fovyRadians,
          aspect = _this$projectionProps.aspect;
      Object.assign(this._frustumPlanes, getFrustumPlanes({
        aspect: aspect,
        near: near,
        far: far,
        fovyRadians: fovyRadians,
        position: this.cameraPosition,
        direction: this.cameraDirection,
        up: this.cameraUp,
        right: this.cameraRight
      }));
      return this._frustumPlanes;
    }
  }, {
    key: "getCameraPosition",
    value: function getCameraPosition() {
      return this.cameraPosition;
    }
  }, {
    key: "getCameraDirection",
    value: function getCameraDirection() {
      return this.cameraDirection;
    }
  }, {
    key: "getCameraUp",
    value: function getCameraUp() {
      return this.cameraUp;
    }
  }, {
    key: "_createProjectionMatrix",
    value: function _createProjectionMatrix(_ref4) {
      var orthographic = _ref4.orthographic,
          fovyRadians = _ref4.fovyRadians,
          aspect = _ref4.aspect,
          focalDistance = _ref4.focalDistance,
          near = _ref4.near,
          far = _ref4.far;
      return orthographic ? new Matrix4().orthographic({
        fovy: fovyRadians,
        aspect: aspect,
        focalDistance: focalDistance,
        near: near,
        far: far
      }) : new Matrix4().perspective({
        fovy: fovyRadians,
        aspect: aspect,
        near: near,
        far: far
      });
    }
  }, {
    key: "_initViewMatrix",
    value: function _initViewMatrix(opts) {
      var _opts$viewMatrix = opts.viewMatrix,
          viewMatrix = _opts$viewMatrix === void 0 ? IDENTITY$1 : _opts$viewMatrix,
          _opts$longitude = opts.longitude,
          longitude = _opts$longitude === void 0 ? null : _opts$longitude,
          _opts$latitude = opts.latitude,
          latitude = _opts$latitude === void 0 ? null : _opts$latitude,
          _opts$zoom = opts.zoom,
          zoom = _opts$zoom === void 0 ? null : _opts$zoom,
          _opts$position = opts.position,
          position = _opts$position === void 0 ? null : _opts$position,
          _opts$modelMatrix = opts.modelMatrix,
          modelMatrix = _opts$modelMatrix === void 0 ? null : _opts$modelMatrix,
          _opts$focalDistance = opts.focalDistance,
          focalDistance = _opts$focalDistance === void 0 ? 1 : _opts$focalDistance,
          _opts$distanceScales = opts.distanceScales,
          distanceScales = _opts$distanceScales === void 0 ? null : _opts$distanceScales;
      this.isGeospatial = Number.isFinite(latitude) && Number.isFinite(longitude);
      this.zoom = zoom;

      if (!Number.isFinite(this.zoom)) {
        this.zoom = this.isGeospatial ? getMeterZoom({
          latitude: latitude
        }) + Math.log2(focalDistance) : DEFAULT_ZOOM;
      }

      var scale = Math.pow(2, this.zoom);
      this.scale = scale;
      this.distanceScales = this.isGeospatial ? getDistanceScales({
        latitude: latitude,
        longitude: longitude
      }) : distanceScales || DEFAULT_DISTANCE_SCALES;
      this.focalDistance = focalDistance;
      this.distanceScales.metersPerUnit = new Vector3(this.distanceScales.metersPerUnit);
      this.distanceScales.unitsPerMeter = new Vector3(this.distanceScales.unitsPerMeter);
      this.position = ZERO_VECTOR$1;
      this.meterOffset = ZERO_VECTOR$1;

      if (position) {
        this.position = position;
        this.modelMatrix = modelMatrix;
        this.meterOffset = modelMatrix ? modelMatrix.transformVector(position) : position;
      }

      if (this.isGeospatial) {
        this.longitude = longitude;
        this.latitude = latitude;
        this.center = this._getCenterInWorld({
          longitude: longitude,
          latitude: latitude
        });
      } else {
        this.center = position ? this.projectPosition(position) : [0, 0, 0];
      }

      this.viewMatrixUncentered = viewMatrix;
      this.viewMatrix = new Matrix4().multiplyRight(this.viewMatrixUncentered).translate(new Vector3(this.center || ZERO_VECTOR$1).negate());
    }
  }, {
    key: "_getCenterInWorld",
    value: function _getCenterInWorld(_ref5) {
      var longitude = _ref5.longitude,
          latitude = _ref5.latitude;
      var meterOffset = this.meterOffset,
          distanceScales = this.distanceScales;
      var center = new Vector3(this.projectPosition([longitude, latitude, 0]));

      if (meterOffset) {
        var commonPosition = new Vector3(meterOffset).scale(distanceScales.unitsPerMeter);
        center.add(commonPosition);
      }

      return center;
    }
  }, {
    key: "_initProjectionMatrix",
    value: function _initProjectionMatrix(opts) {
      var _opts$projectionMatri = opts.projectionMatrix,
          projectionMatrix = _opts$projectionMatri === void 0 ? null : _opts$projectionMatri,
          _opts$orthographic = opts.orthographic,
          orthographic = _opts$orthographic === void 0 ? false : _opts$orthographic,
          fovyRadians = opts.fovyRadians,
          _opts$fovy = opts.fovy,
          fovy = _opts$fovy === void 0 ? 75 : _opts$fovy,
          _opts$near = opts.near,
          near = _opts$near === void 0 ? 0.1 : _opts$near,
          _opts$far = opts.far,
          far = _opts$far === void 0 ? 1000 : _opts$far,
          _opts$focalDistance2 = opts.focalDistance,
          focalDistance = _opts$focalDistance2 === void 0 ? 1 : _opts$focalDistance2;
      this.projectionProps = {
        orthographic: orthographic,
        fovyRadians: fovyRadians || fovy * DEGREES_TO_RADIANS$2,
        aspect: this.width / this.height,
        focalDistance: focalDistance,
        near: near,
        far: far
      };
      this.projectionMatrix = projectionMatrix || this._createProjectionMatrix(this.projectionProps);
    }
  }, {
    key: "_initPixelMatrices",
    value: function _initPixelMatrices() {
      var vpm = createMat4$1();
      multiply(vpm, vpm, this.projectionMatrix);
      multiply(vpm, vpm, this.viewMatrix);
      this.viewProjectionMatrix = vpm;
      this.viewMatrixInverse = invert([], this.viewMatrix) || this.viewMatrix;

      var _extractCameraVectors = extractCameraVectors({
        viewMatrix: this.viewMatrix,
        viewMatrixInverse: this.viewMatrixInverse
      }),
          eye = _extractCameraVectors.eye,
          direction = _extractCameraVectors.direction,
          up = _extractCameraVectors.up,
          right = _extractCameraVectors.right;

      this.cameraPosition = eye;
      this.cameraDirection = direction;
      this.cameraUp = up;
      this.cameraRight = right;
      var viewportMatrix = createMat4$1();
      var pixelProjectionMatrix = createMat4$1();
      scale(viewportMatrix, viewportMatrix, [this.width / 2, -this.height / 2, 1]);
      translate(viewportMatrix, viewportMatrix, [1, -1, 0]);
      multiply(pixelProjectionMatrix, viewportMatrix, this.viewProjectionMatrix);
      this.pixelProjectionMatrix = pixelProjectionMatrix;
      this.viewportMatrix = viewportMatrix;
      this.pixelUnprojectionMatrix = invert(createMat4$1(), this.pixelProjectionMatrix);

      if (!this.pixelUnprojectionMatrix) {
        log.warn('Pixel project matrix not invertible')();
      }
    }
  }, {
    key: "metersPerPixel",
    get: function get() {
      return this.distanceScales.metersPerUnit[2] / this.scale;
    }
  }, {
    key: "projectionMode",
    get: function get() {
      if (this.isGeospatial) {
        return this.zoom < 12 ? PROJECTION_MODE.WEB_MERCATOR : PROJECTION_MODE.WEB_MERCATOR_AUTO_OFFSET;
      }

      return PROJECTION_MODE.IDENTITY;
    }
  }]);

  return Viewport;
}();
Viewport.displayName = 'Viewport';

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _createSuper$5(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct$5(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _isNativeReflectConstruct$5() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

var WebMercatorViewport$1 = function (_Viewport) {
  _inherits(WebMercatorViewport, _Viewport);

  var _super = _createSuper$5(WebMercatorViewport);

  function WebMercatorViewport() {
    var _this;

    var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, WebMercatorViewport);

    var _opts$latitude = opts.latitude,
        latitude = _opts$latitude === void 0 ? 0 : _opts$latitude,
        _opts$longitude = opts.longitude,
        longitude = _opts$longitude === void 0 ? 0 : _opts$longitude,
        _opts$zoom = opts.zoom,
        zoom = _opts$zoom === void 0 ? 11 : _opts$zoom,
        _opts$pitch = opts.pitch,
        pitch = _opts$pitch === void 0 ? 0 : _opts$pitch,
        _opts$bearing = opts.bearing,
        bearing = _opts$bearing === void 0 ? 0 : _opts$bearing,
        _opts$nearZMultiplier = opts.nearZMultiplier,
        nearZMultiplier = _opts$nearZMultiplier === void 0 ? 0.1 : _opts$nearZMultiplier,
        _opts$farZMultiplier = opts.farZMultiplier,
        farZMultiplier = _opts$farZMultiplier === void 0 ? 1.01 : _opts$farZMultiplier,
        _opts$orthographic = opts.orthographic,
        orthographic = _opts$orthographic === void 0 ? false : _opts$orthographic,
        _opts$repeat = opts.repeat,
        repeat = _opts$repeat === void 0 ? false : _opts$repeat,
        _opts$worldOffset = opts.worldOffset,
        worldOffset = _opts$worldOffset === void 0 ? 0 : _opts$worldOffset;
    var width = opts.width,
        height = opts.height,
        _opts$altitude = opts.altitude,
        altitude = _opts$altitude === void 0 ? 1.5 : _opts$altitude;
    var scale = Math.pow(2, zoom);
    width = width || 1;
    height = height || 1;
    altitude = Math.max(0.75, altitude);

    var _getProjectionParamet = getProjectionParameters({
      width: width,
      height: height,
      pitch: pitch,
      altitude: altitude,
      nearZMultiplier: nearZMultiplier,
      farZMultiplier: farZMultiplier
    }),
        fov = _getProjectionParamet.fov,
        aspect = _getProjectionParamet.aspect,
        focalDistance = _getProjectionParamet.focalDistance,
        near = _getProjectionParamet.near,
        far = _getProjectionParamet.far;

    var viewMatrixUncentered = getViewMatrix({
      height: height,
      pitch: pitch,
      bearing: bearing,
      scale: scale,
      altitude: altitude
    });

    if (worldOffset) {
      var viewOffset = new Matrix4().translate([512 * worldOffset, 0, 0]);
      viewMatrixUncentered = viewOffset.multiplyLeft(viewMatrixUncentered);
    }

    var viewportOpts = Object.assign({}, opts, {
      width: width,
      height: height,
      viewMatrix: viewMatrixUncentered,
      longitude: longitude,
      latitude: latitude,
      zoom: zoom,
      orthographic: orthographic,
      fovyRadians: fov,
      aspect: aspect,
      focalDistance: orthographic ? focalDistance : 1,
      near: near,
      far: far
    });
    _this = _super.call(this, viewportOpts);
    _this.latitude = latitude;
    _this.longitude = longitude;
    _this.zoom = zoom;
    _this.pitch = pitch;
    _this.bearing = bearing;
    _this.altitude = altitude;
    _this.orthographic = orthographic;
    _this._subViewports = repeat ? [] : null;
    Object.freeze(_assertThisInitialized(_this));
    return _this;
  }

  _createClass(WebMercatorViewport, [{
    key: "addMetersToLngLat",
    value: function addMetersToLngLat$1(lngLatZ, xyz) {
      return addMetersToLngLat(lngLatZ, xyz);
    }
  }, {
    key: "getMapCenterByLngLatPosition",
    value: function getMapCenterByLngLatPosition(_ref) {
      var lngLat = _ref.lngLat,
          pos = _ref.pos;
      var fromLocation = pixelsToWorld(pos, this.pixelUnprojectionMatrix);
      var toLocation = this.projectFlat(lngLat);
      var translate = add$1([], toLocation, negate$1([], fromLocation));
      var newCenter = add$1([], this.center, translate);
      return this.unprojectFlat(newCenter);
    }
  }, {
    key: "getBounds",
    value: function getBounds$1() {
      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      var corners = getBounds(this, options.z || 0);

      return [Math.min(corners[0][0], corners[1][0], corners[2][0], corners[3][0]), Math.min(corners[0][1], corners[1][1], corners[2][1], corners[3][1]), Math.max(corners[0][0], corners[1][0], corners[2][0], corners[3][0]), Math.max(corners[0][1], corners[1][1], corners[2][1], corners[3][1])];
    }
  }, {
    key: "fitBounds",
    value: function fitBounds$1(bounds) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var width = this.width,
          height = this.height;

      var _fitBounds2 = fitBounds(Object.assign({
        width: width,
        height: height,
        bounds: bounds
      }, options)),
          longitude = _fitBounds2.longitude,
          latitude = _fitBounds2.latitude,
          zoom = _fitBounds2.zoom;

      return new WebMercatorViewport({
        width: width,
        height: height,
        longitude: longitude,
        latitude: latitude,
        zoom: zoom
      });
    }
  }, {
    key: "subViewports",
    get: function get() {
      if (this._subViewports && !this._subViewports.length) {
        var bounds = this.getBounds();
        var minOffset = Math.floor((bounds[0] + 180) / 360);
        var maxOffset = Math.ceil((bounds[2] - 180) / 360);

        for (var x = minOffset; x <= maxOffset; x++) {
          var offsetViewport = x ? new WebMercatorViewport(_objectSpread(_objectSpread({}, this), {}, {
            worldOffset: x
          })) : this;

          this._subViewports.push(offsetViewport);
        }
      }

      return this._subViewports;
    }
  }]);

  return WebMercatorViewport;
}(Viewport);
WebMercatorViewport$1.displayName = 'WebMercatorViewport';

function lngLatZToWorldPosition(lngLatZ, viewport) {
  var offsetMode = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
  var p = viewport.projectPosition(lngLatZ);

  if (offsetMode && viewport instanceof WebMercatorViewport$1) {
    var _lngLatZ = _slicedToArray(lngLatZ, 3),
        longitude = _lngLatZ[0],
        latitude = _lngLatZ[1],
        _lngLatZ$ = _lngLatZ[2],
        z = _lngLatZ$ === void 0 ? 0 : _lngLatZ$;

    var distanceScales = viewport.getDistanceScales([longitude, latitude]);
    p[2] = z * distanceScales.unitsPerMeter[2];
  }

  return p;
}

function normalizeParameters(opts) {
  var normalizedParams = Object.assign({}, opts);
  var coordinateSystem = opts.coordinateSystem;
  var viewport = opts.viewport,
      coordinateOrigin = opts.coordinateOrigin,
      fromCoordinateSystem = opts.fromCoordinateSystem,
      fromCoordinateOrigin = opts.fromCoordinateOrigin;

  if (coordinateSystem === COORDINATE_SYSTEM.DEFAULT) {
    coordinateSystem = viewport.isGeospatial ? COORDINATE_SYSTEM.LNGLAT : COORDINATE_SYSTEM.CARTESIAN;
  }

  if (fromCoordinateSystem === undefined) {
    normalizedParams.fromCoordinateSystem = coordinateSystem;
  }

  if (fromCoordinateOrigin === undefined) {
    normalizedParams.fromCoordinateOrigin = coordinateOrigin;
  }

  normalizedParams.coordinateSystem = coordinateSystem;
  return normalizedParams;
}

function getWorldPosition(position, _ref) {
  var viewport = _ref.viewport,
      modelMatrix = _ref.modelMatrix,
      coordinateSystem = _ref.coordinateSystem,
      coordinateOrigin = _ref.coordinateOrigin,
      offsetMode = _ref.offsetMode;

  var _position = _slicedToArray(position, 3),
      x = _position[0],
      y = _position[1],
      _position$ = _position[2],
      z = _position$ === void 0 ? 0 : _position$;

  if (modelMatrix) {
    var _vec4$transformMat = transformMat4([], [x, y, z, 1.0], modelMatrix);

    var _vec4$transformMat2 = _slicedToArray(_vec4$transformMat, 3);

    x = _vec4$transformMat2[0];
    y = _vec4$transformMat2[1];
    z = _vec4$transformMat2[2];
  }

  switch (coordinateSystem) {
    case COORDINATE_SYSTEM.LNGLAT:
      return lngLatZToWorldPosition([x, y, z], viewport, offsetMode);

    case COORDINATE_SYSTEM.LNGLAT_OFFSETS:
      return lngLatZToWorldPosition([x + coordinateOrigin[0], y + coordinateOrigin[1], z + (coordinateOrigin[2] || 0)], viewport, offsetMode);

    case COORDINATE_SYSTEM.METER_OFFSETS:
      return lngLatZToWorldPosition(addMetersToLngLat(coordinateOrigin, [x, y, z]), viewport, offsetMode);

    case COORDINATE_SYSTEM.CARTESIAN:
    default:
      return viewport.isGeospatial ? [x + coordinateOrigin[0], y + coordinateOrigin[1], z + coordinateOrigin[2]] : viewport.projectPosition([x, y, z]);
  }
}
function projectPosition(position, params) {
  var _normalizeParameters = normalizeParameters(params),
      viewport = _normalizeParameters.viewport,
      coordinateSystem = _normalizeParameters.coordinateSystem,
      coordinateOrigin = _normalizeParameters.coordinateOrigin,
      modelMatrix = _normalizeParameters.modelMatrix,
      fromCoordinateSystem = _normalizeParameters.fromCoordinateSystem,
      fromCoordinateOrigin = _normalizeParameters.fromCoordinateOrigin;

  var _getOffsetOrigin = getOffsetOrigin(viewport, coordinateSystem, coordinateOrigin),
      geospatialOrigin = _getOffsetOrigin.geospatialOrigin,
      shaderCoordinateOrigin = _getOffsetOrigin.shaderCoordinateOrigin,
      offsetMode = _getOffsetOrigin.offsetMode;

  var worldPosition = getWorldPosition(position, {
    viewport: viewport,
    modelMatrix: modelMatrix,
    coordinateSystem: fromCoordinateSystem,
    coordinateOrigin: fromCoordinateOrigin,
    offsetMode: offsetMode
  });

  if (offsetMode) {
    var positionCommonSpace = viewport.projectPosition(geospatialOrigin || shaderCoordinateOrigin);
    sub(worldPosition, worldPosition, positionCommonSpace);
  }

  return worldPosition;
}

function ownKeys$1(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread$1(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys$1(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys$1(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

var ShaderAttribute = function () {
  function ShaderAttribute(dataColumn, opts) {
    _classCallCheck(this, ShaderAttribute);

    this.opts = opts;
    this.source = dataColumn;
  }

  _createClass(ShaderAttribute, [{
    key: "getValue",
    value: function getValue() {
      var buffer = this.source.getBuffer();
      var accessor = this.getAccessor();

      if (buffer) {
        return [buffer, accessor];
      }

      var value = this.source.value;
      var size = accessor.size;
      var constantValue = value;

      if (value && value.length !== size) {
        constantValue = new Float32Array(size);
        var index = accessor.elementOffset || 0;

        for (var i = 0; i < size; ++i) {
          constantValue[i] = value[index + i];
        }
      }

      return constantValue;
    }
  }, {
    key: "getAccessor",
    value: function getAccessor() {
      return _objectSpread$1(_objectSpread$1({}, this.source.getAccessor()), this.opts);
    }
  }, {
    key: "value",
    get: function get() {
      return this.source.value;
    }
  }]);

  return ShaderAttribute;
}();

function glArrayFromType(glType) {
  switch (glType) {
    case 5126:
      return Float32Array;

    case 5130:
      return Float64Array;

    case 5123:
    case 33635:
    case 32819:
    case 32820:
      return Uint16Array;

    case 5125:
      return Uint32Array;

    case 5121:
      return Uint8ClampedArray;

    case 5120:
      return Int8Array;

    case 5122:
      return Int16Array;

    case 5124:
      return Int32Array;

    default:
      throw new Error('Unknown GL type');
  }
}

function ownKeys$2(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread$2(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys$2(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys$2(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function getStride(accessor) {
  return accessor.stride || accessor.size * accessor.bytesPerElement;
}

function resolveShaderAttribute(baseAccessor, shaderAttributeOptions) {
  if (shaderAttributeOptions.offset) {
    log.removed('shaderAttribute.offset', 'vertexOffset, elementOffset')();
  }

  var stride = getStride(baseAccessor);
  var vertexOffset = 'vertexOffset' in shaderAttributeOptions ? shaderAttributeOptions.vertexOffset : baseAccessor.vertexOffset || 0;
  var elementOffset = shaderAttributeOptions.elementOffset || 0;
  var offset = vertexOffset * stride + elementOffset * baseAccessor.bytesPerElement + (baseAccessor.offset || 0);
  return _objectSpread$2(_objectSpread$2({}, shaderAttributeOptions), {}, {
    offset: offset,
    stride: stride
  });
}

function resolveDoublePrecisionShaderAttributes(baseAccessor, shaderAttributeOptions) {
  var resolvedOptions = resolveShaderAttribute(baseAccessor, shaderAttributeOptions);
  return {
    high: resolvedOptions,
    low: _objectSpread$2(_objectSpread$2({}, resolvedOptions), {}, {
      offset: resolvedOptions.offset + baseAccessor.size * 4
    })
  };
}

var DataColumn = function () {
  function DataColumn(gl, opts) {
    _classCallCheck(this, DataColumn);

    this.gl = gl;
    this.id = opts.id;
    this.size = opts.size;
    var logicalType = opts.logicalType || opts.type;
    var doublePrecision = logicalType === 5130;
    var defaultValue = opts.defaultValue;
    defaultValue = Number.isFinite(defaultValue) ? [defaultValue] : defaultValue || new Array(this.size).fill(0);
    opts.defaultValue = defaultValue;
    var bufferType = logicalType;

    if (doublePrecision) {
      bufferType = 5126;
    } else if (!bufferType && opts.isIndexed) {
      bufferType = gl && hasFeature(gl, FEATURES.ELEMENT_INDEX_UINT32) ? 5125 : 5123;
    } else if (!bufferType) {
      bufferType = 5126;
    }

    opts.logicalType = logicalType;
    opts.type = bufferType;
    var defaultType = glArrayFromType(logicalType || bufferType || 5126);
    this.shaderAttributes = {};
    this.doublePrecision = doublePrecision;

    if (doublePrecision && opts.fp64 === false) {
      defaultType = Float32Array;
    }

    opts.bytesPerElement = defaultType.BYTES_PER_ELEMENT;
    this.defaultType = defaultType;
    this.value = null;
    this.settings = opts;
    this.state = {
      externalBuffer: null,
      bufferAccessor: opts,
      allocatedValue: null,
      constant: false
    };
    this._buffer = null;
    this.setData(opts);
  }

  _createClass(DataColumn, [{
    key: "delete",
    value: function _delete() {
      if (this._buffer) {
        this._buffer["delete"]();

        this._buffer = null;
      }

      defaultTypedArrayManager.release(this.state.allocatedValue);
    }
  }, {
    key: "getShaderAttributes",
    value: function getShaderAttributes(id, options) {
      if (this.doublePrecision) {
        var shaderAttributes = {};
        var isBuffer64Bit = this.value instanceof Float64Array;
        var doubleShaderAttributeDefs = resolveDoublePrecisionShaderAttributes(this.getAccessor(), options || {});
        shaderAttributes[id] = new ShaderAttribute(this, doubleShaderAttributeDefs.high);
        shaderAttributes["".concat(id, "64Low")] = isBuffer64Bit ? new ShaderAttribute(this, doubleShaderAttributeDefs.low) : new Float32Array(this.size);
        return shaderAttributes;
      }

      if (options) {
        var shaderAttributeDef = resolveShaderAttribute(this.getAccessor(), options);
        return _defineProperty({}, id, new ShaderAttribute(this, shaderAttributeDef));
      }

      return _defineProperty({}, id, this);
    }
  }, {
    key: "getBuffer",
    value: function getBuffer() {
      if (this.state.constant) {
        return null;
      }

      return this.state.externalBuffer || this._buffer;
    }
  }, {
    key: "getValue",
    value: function getValue() {
      if (this.state.constant) {
        return this.value;
      }

      return [this.getBuffer(), this.getAccessor()];
    }
  }, {
    key: "getAccessor",
    value: function getAccessor() {
      return this.state.bufferAccessor;
    }
  }, {
    key: "setData",
    value: function setData(opts) {
      var state = this.state;

      if (ArrayBuffer.isView(opts)) {
        opts = {
          value: opts
        };
      } else if (opts instanceof Buffer) {
        opts = {
          buffer: opts
        };
      }

      var accessor = _objectSpread$2(_objectSpread$2({}, this.settings), opts);

      state.bufferAccessor = accessor;

      if (opts.constant) {
        var value = opts.value;
        value = this._normalizeValue(value, [], 0);

        if (this.settings.normalized) {
          value = this._normalizeConstant(value);
        }

        var hasChanged = !state.constant || !this._areValuesEqual(value, this.value);

        if (!hasChanged) {
          return false;
        }

        state.externalBuffer = null;
        state.constant = true;
        this.value = value;
      } else if (opts.buffer) {
        var buffer = opts.buffer;
        state.externalBuffer = buffer;
        state.constant = false;
        this.value = opts.value;
        var isBuffer64Bit = opts.value instanceof Float64Array;
        accessor.type = opts.type || buffer.accessor.type;
        accessor.bytesPerElement = buffer.accessor.BYTES_PER_ELEMENT * (isBuffer64Bit ? 2 : 1);
        accessor.stride = getStride(accessor);
      } else if (opts.value) {
        this._checkExternalBuffer(opts);

        var _value = opts.value;
        state.externalBuffer = null;
        state.constant = false;
        this.value = _value;
        accessor.bytesPerElement = _value.BYTES_PER_ELEMENT;
        accessor.stride = getStride(accessor);
        var _buffer = this.buffer,
            byteOffset = this.byteOffset;

        if (this.doublePrecision && _value instanceof Float64Array) {
          _value = toDoublePrecisionArray(_value, accessor);
        }

        var requiredBufferSize = _value.byteLength + byteOffset + accessor.stride * 2;

        if (_buffer.byteLength < requiredBufferSize) {
          _buffer.reallocate(requiredBufferSize);
        }

        _buffer.setAccessor(null);

        _buffer.subData({
          data: _value,
          offset: byteOffset
        });

        accessor.type = opts.type || _buffer.accessor.type;
      }

      return true;
    }
  }, {
    key: "updateSubBuffer",
    value: function updateSubBuffer() {
      var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var value = this.value;
      var _opts$startOffset = opts.startOffset,
          startOffset = _opts$startOffset === void 0 ? 0 : _opts$startOffset,
          endOffset = opts.endOffset;
      this.buffer.subData({
        data: this.doublePrecision && value instanceof Float64Array ? toDoublePrecisionArray(value, {
          size: this.size,
          startIndex: startOffset,
          endIndex: endOffset
        }) : value.subarray(startOffset, endOffset),
        offset: startOffset * value.BYTES_PER_ELEMENT + this.byteOffset
      });
    }
  }, {
    key: "allocate",
    value: function allocate(_ref3) {
      var numInstances = _ref3.numInstances,
          _ref3$copy = _ref3.copy,
          copy = _ref3$copy === void 0 ? false : _ref3$copy;
      var state = this.state;
      var oldValue = state.allocatedValue;
      var value = defaultTypedArrayManager.allocate(oldValue, numInstances + 1, {
        size: this.size,
        type: this.defaultType,
        copy: copy
      });
      this.value = value;
      var buffer = this.buffer,
          byteOffset = this.byteOffset;

      if (buffer.byteLength < value.byteLength + byteOffset) {
        buffer.reallocate(value.byteLength + byteOffset);

        if (copy && oldValue) {
          buffer.subData({
            data: oldValue instanceof Float64Array ? toDoublePrecisionArray(oldValue, this) : oldValue,
            offset: byteOffset
          });
        }
      }

      state.allocatedValue = value;
      state.constant = false;
      state.externalBuffer = null;
      state.bufferAccessor = this.settings;
      return true;
    }
  }, {
    key: "_checkExternalBuffer",
    value: function _checkExternalBuffer(opts) {
      var value = opts.value;

      if (!opts.constant && value) {
        var ArrayType = this.defaultType;
        var illegalArrayType = false;

        if (this.doublePrecision) {
          illegalArrayType = value.BYTES_PER_ELEMENT < 4;
        }

        if (illegalArrayType) {
          throw new Error("Attribute ".concat(this.id, " does not support ").concat(value.constructor.name));
        }

        if (!(value instanceof ArrayType) && this.settings.normalized && !('normalized' in opts)) {
          log.warn("Attribute ".concat(this.id, " is normalized"))();
        }
      }
    }
  }, {
    key: "_normalizeConstant",
    value: function _normalizeConstant(value) {
      switch (this.settings.type) {
        case 5120:
          return new Float32Array(value).map(function (x) {
            return (x + 128) / 255 * 2 - 1;
          });

        case 5122:
          return new Float32Array(value).map(function (x) {
            return (x + 32768) / 65535 * 2 - 1;
          });

        case 5121:
          return new Float32Array(value).map(function (x) {
            return x / 255;
          });

        case 5123:
          return new Float32Array(value).map(function (x) {
            return x / 65535;
          });

        default:
          return value;
      }
    }
  }, {
    key: "_normalizeValue",
    value: function _normalizeValue(value, out, start) {
      var _this$settings = this.settings,
          defaultValue = _this$settings.defaultValue,
          size = _this$settings.size;

      if (Number.isFinite(value)) {
        out[start] = value;
        return out;
      }

      if (!value) {
        out[start] = defaultValue[0];
        return out;
      }

      switch (size) {
        case 4:
          out[start + 3] = Number.isFinite(value[3]) ? value[3] : defaultValue[3];

        case 3:
          out[start + 2] = Number.isFinite(value[2]) ? value[2] : defaultValue[2];

        case 2:
          out[start + 1] = Number.isFinite(value[1]) ? value[1] : defaultValue[1];

        case 1:
          out[start + 0] = Number.isFinite(value[0]) ? value[0] : defaultValue[0];
          break;

        default:
          var i = size;

          while (--i >= 0) {
            out[start + i] = Number.isFinite(value[i]) ? value[i] : defaultValue[i];
          }

      }

      return out;
    }
  }, {
    key: "_areValuesEqual",
    value: function _areValuesEqual(value1, value2) {
      if (!value1 || !value2) {
        return false;
      }

      var size = this.size;

      for (var i = 0; i < size; i++) {
        if (value1[i] !== value2[i]) {
          return false;
        }
      }

      return true;
    }
  }, {
    key: "buffer",
    get: function get() {
      if (!this._buffer) {
        var _this$settings2 = this.settings,
            isIndexed = _this$settings2.isIndexed,
            type = _this$settings2.type;
        this._buffer = new Buffer(this.gl, {
          id: this.id,
          target: isIndexed ? 34963 : 34962,
          accessor: {
            type: type
          }
        });
      }

      return this._buffer;
    }
  }, {
    key: "byteOffset",
    get: function get() {
      var accessor = this.getAccessor();

      if (accessor.vertexOffset) {
        return accessor.vertexOffset * getStride(accessor);
      }

      return 0;
    }
  }]);

  return DataColumn;
}();

var EMPTY_ARRAY = [];
var placeholderArray = [];
function createIterable(data) {
  var startRow = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
  var endRow = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : Infinity;
  var iterable = EMPTY_ARRAY;
  var objectInfo = {
    index: -1,
    data: data,
    target: []
  };

  if (!data) {
    iterable = EMPTY_ARRAY;
  } else if (typeof data[Symbol.iterator] === 'function') {
    iterable = data;
  } else if (data.length > 0) {
    placeholderArray.length = data.length;
    iterable = placeholderArray;
  }

  if (startRow > 0 || Number.isFinite(endRow)) {
    iterable = (Array.isArray(iterable) ? iterable : Array.from(iterable)).slice(startRow, endRow);
    objectInfo.index = startRow - 1;
  }

  return {
    iterable: iterable,
    objectInfo: objectInfo
  };
}
function isAsyncIterable(data) {
  return data && data[Symbol.asyncIterator];
}
function getAccessorFromBuffer(typedArray, _ref) {
  var size = _ref.size,
      stride = _ref.stride,
      offset = _ref.offset,
      startIndices = _ref.startIndices,
      nested = _ref.nested;
  var bytesPerElement = typedArray.BYTES_PER_ELEMENT;
  var elementStride = stride ? stride / bytesPerElement : size;
  var elementOffset = offset ? offset / bytesPerElement : 0;
  var vertexCount = Math.floor((typedArray.length - elementOffset) / elementStride);
  return function (_, _ref2) {
    var index = _ref2.index,
        target = _ref2.target;

    if (!startIndices) {
      var sourceIndex = index * elementStride + elementOffset;

      for (var j = 0; j < size; j++) {
        target[j] = typedArray[sourceIndex + j];
      }

      return target;
    }

    var startIndex = startIndices[index];
    var endIndex = startIndices[index + 1] || vertexCount;
    var result;

    if (nested) {
      result = new Array(endIndex - startIndex);

      for (var i = startIndex; i < endIndex; i++) {
        var _sourceIndex = i * elementStride + elementOffset;

        target = new Array(size);

        for (var _j = 0; _j < size; _j++) {
          target[_j] = typedArray[_sourceIndex + _j];
        }

        result[i - startIndex] = target;
      }
    } else if (elementStride === size) {
      result = typedArray.subarray(startIndex * size + elementOffset, endIndex * size + elementOffset);
    } else {
      result = new typedArray.constructor((endIndex - startIndex) * size);
      var targetIndex = 0;

      for (var _i = startIndex; _i < endIndex; _i++) {
        var _sourceIndex2 = _i * elementStride + elementOffset;

        for (var _j2 = 0; _j2 < size; _j2++) {
          result[targetIndex++] = typedArray[_sourceIndex2 + _j2];
        }
      }
    }

    return result;
  };
}

function flatten(array) {
  var filter = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : function () {
    return true;
  };

  if (!Array.isArray(array)) {
    return filter(array) ? [array] : [];
  }

  return flattenArray(array, filter, []);
}

function flattenArray(array, filter, result) {
  var index = -1;

  while (++index < array.length) {
    var value = array[index];

    if (Array.isArray(value)) {
      flattenArray(value, filter, result);
    } else if (filter(value)) {
      result.push(value);
    }
  }

  return result;
}

function fillArray(_ref) {
  var target = _ref.target,
      source = _ref.source,
      _ref$start = _ref.start,
      start = _ref$start === void 0 ? 0 : _ref$start,
      _ref$count = _ref.count,
      count = _ref$count === void 0 ? 1 : _ref$count;
  var length = source.length;
  var total = count * length;
  var copied = 0;

  for (var i = start; copied < length; copied++) {
    target[i++] = source[copied];
  }

  while (copied < total) {
    if (copied < total - copied) {
      target.copyWithin(start + copied, start, start + copied);
      copied *= 2;
    } else {
      target.copyWithin(start + copied, start, start + total - copied);
      copied = total;
    }
  }

  return target;
}

var EMPTY = [];
var FULL = [[0, Infinity]];
function add(rangeList, range) {
  if (rangeList === FULL) {
    return rangeList;
  }

  if (range[0] < 0) {
    range[0] = 0;
  }

  if (range[0] >= range[1]) {
    return rangeList;
  }

  var newRangeList = [];
  var len = rangeList.length;
  var insertPosition = 0;

  for (var i = 0; i < len; i++) {
    var range0 = rangeList[i];

    if (range0[1] < range[0]) {
      newRangeList.push(range0);
      insertPosition = i + 1;
    } else if (range0[0] > range[1]) {
      newRangeList.push(range0);
    } else {
      range = [Math.min(range0[0], range[0]), Math.max(range0[1], range[1])];
    }
  }

  newRangeList.splice(insertPosition, 0, range);
  return newRangeList;
}

function padArrayChunk(_ref) {
  var source = _ref.source,
      target = _ref.target,
      _ref$start = _ref.start,
      start = _ref$start === void 0 ? 0 : _ref$start,
      end = _ref.end,
      size = _ref.size,
      getData = _ref.getData;
  end = end || target.length;
  var sourceLength = source.length;
  var targetLength = end - start;

  if (sourceLength > targetLength) {
    target.set(source.subarray(0, targetLength), start);
    return;
  }

  target.set(source, start);

  if (!getData) {
    return;
  }

  var i = sourceLength;

  while (i < targetLength) {
    var datum = getData(i, source);

    for (var j = 0; j < size; j++) {
      target[start + i] = datum[j] || 0;
      i++;
    }
  }
}

function padArray(_ref2) {
  var source = _ref2.source,
      target = _ref2.target,
      size = _ref2.size,
      getData = _ref2.getData,
      sourceStartIndices = _ref2.sourceStartIndices,
      targetStartIndices = _ref2.targetStartIndices;

  if (!Array.isArray(targetStartIndices)) {
    padArrayChunk({
      source: source,
      target: target,
      size: size,
      getData: getData
    });
    return target;
  }

  var sourceIndex = 0;
  var targetIndex = 0;

  var getChunkData = getData && function (i, chunk) {
    return getData(i + targetIndex, chunk);
  };

  var n = Math.min(sourceStartIndices.length, targetStartIndices.length);

  for (var i = 1; i < n; i++) {
    var nextSourceIndex = sourceStartIndices[i] * size;
    var nextTargetIndex = targetStartIndices[i] * size;
    padArrayChunk({
      source: source.subarray(sourceIndex, nextSourceIndex),
      target: target,
      start: targetIndex,
      end: nextTargetIndex,
      size: size,
      getData: getChunkData
    });
    sourceIndex = nextSourceIndex;
    targetIndex = nextTargetIndex;
  }

  if (targetIndex < target.length) {
    padArrayChunk({
      source: [],
      target: target,
      start: targetIndex,
      size: size,
      getData: getChunkData
    });
  }

  return target;
}

var DEFAULT_TRANSITION_SETTINGS = {
  interpolation: {
    duration: 0,
    easing: function easing(t) {
      return t;
    }
  },
  spring: {
    stiffness: 0.05,
    damping: 0.5
  }
};
function normalizeTransitionSettings(userSettings, layerSettings) {
  if (!userSettings) {
    return null;
  }

  if (Number.isFinite(userSettings)) {
    userSettings = {
      duration: userSettings
    };
  }

  userSettings.type = userSettings.type || 'interpolation';
  return Object.assign({}, DEFAULT_TRANSITION_SETTINGS[userSettings.type], layerSettings, userSettings);
}
function getSourceBufferAttribute(gl, attribute) {
  var buffer = attribute.getBuffer();

  if (buffer) {
    return [attribute.getBuffer(), {
      divisor: 0,
      size: attribute.size,
      normalized: attribute.settings.normalized
    }];
  }

  return attribute.value;
}
function getAttributeTypeFromSize(size) {
  switch (size) {
    case 1:
      return 'float';

    case 2:
      return 'vec2';

    case 3:
      return 'vec3';

    case 4:
      return 'vec4';

    default:
      throw new Error("No defined attribute type for size \"".concat(size, "\""));
  }
}
function cycleBuffers(buffers) {
  buffers.push(buffers.shift());
}
function getAttributeBufferLength(attribute, numInstances) {
  var doublePrecision = attribute.doublePrecision,
      settings = attribute.settings,
      value = attribute.value,
      size = attribute.size;
  var multiplier = doublePrecision && value instanceof Float64Array ? 2 : 1;
  return (settings.noAlloc ? value.length : numInstances * size) * multiplier;
}
function padBuffer(_ref) {
  var buffer = _ref.buffer,
      numInstances = _ref.numInstances,
      attribute = _ref.attribute,
      fromLength = _ref.fromLength,
      fromStartIndices = _ref.fromStartIndices,
      _ref$getData = _ref.getData,
      getData = _ref$getData === void 0 ? function (x) {
    return x;
  } : _ref$getData;
  var precisionMultiplier = attribute.doublePrecision && attribute.value instanceof Float64Array ? 2 : 1;
  var size = attribute.size * precisionMultiplier;
  var byteOffset = attribute.byteOffset;
  var toStartIndices = attribute.startIndices;
  var hasStartIndices = fromStartIndices && toStartIndices;
  var toLength = getAttributeBufferLength(attribute, numInstances);
  var isConstant = attribute.state.constant;

  if (!hasStartIndices && fromLength >= toLength) {
    return;
  }

  var toData = isConstant ? attribute.value : attribute.getBuffer().getData({
    srcByteOffset: byteOffset
  });

  if (attribute.settings.normalized && !isConstant) {
    var getter = getData;

    getData = function getData(value, chunk) {
      return attribute._normalizeConstant(getter(value, chunk));
    };
  }

  var getMissingData = isConstant ? function (i, chunk) {
    return getData(toData, chunk);
  } : function (i, chunk) {
    return getData(toData.subarray(i, i + size), chunk);
  };
  var source = buffer.getData({
    length: fromLength
  });
  var data = new Float32Array(toLength);
  padArray({
    source: source,
    target: data,
    sourceStartIndices: fromStartIndices,
    targetStartIndices: toStartIndices,
    size: size,
    getData: getMissingData
  });

  if (buffer.byteLength < data.byteLength + byteOffset) {
    buffer.reallocate(data.byteLength + byteOffset);
  }

  buffer.subData({
    data: data,
    offset: byteOffset
  });
}

function _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _createSuper$6(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct$6(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _isNativeReflectConstruct$6() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

var Attribute = function (_DataColumn) {
  _inherits(Attribute, _DataColumn);

  var _super = _createSuper$6(Attribute);

  function Attribute(gl) {
    var _this;

    var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    _classCallCheck(this, Attribute);

    _this = _super.call(this, gl, opts);
    var _opts$transition = opts.transition,
        transition = _opts$transition === void 0 ? false : _opts$transition,
        _opts$noAlloc = opts.noAlloc,
        noAlloc = _opts$noAlloc === void 0 ? false : _opts$noAlloc,
        _opts$update = opts.update,
        update = _opts$update === void 0 ? null : _opts$update,
        _opts$accessor = opts.accessor,
        accessor = _opts$accessor === void 0 ? null : _opts$accessor,
        _opts$transform = opts.transform,
        transform = _opts$transform === void 0 ? null : _opts$transform,
        _opts$startIndices = opts.startIndices,
        startIndices = _opts$startIndices === void 0 ? null : _opts$startIndices;
    Object.assign(_this.settings, {
      transition: transition,
      noAlloc: noAlloc,
      update: update || accessor && _this._autoUpdater,
      accessor: accessor,
      transform: transform
    });
    Object.assign(_this.state, {
      lastExternalBuffer: null,
      binaryValue: null,
      binaryAccessor: null,
      needsUpdate: true,
      needsRedraw: false,
      updateRanges: FULL,
      startIndices: startIndices
    });
    Object.seal(_this.settings);
    Object.seal(_this.state);

    _this._validateAttributeUpdaters();

    return _this;
  }

  _createClass(Attribute, [{
    key: "needsUpdate",
    value: function needsUpdate() {
      return this.state.needsUpdate;
    }
  }, {
    key: "needsRedraw",
    value: function needsRedraw() {
      var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          _ref$clearChangedFlag = _ref.clearChangedFlags,
          clearChangedFlags = _ref$clearChangedFlag === void 0 ? false : _ref$clearChangedFlag;

      var needsRedraw = this.state.needsRedraw;
      this.state.needsRedraw = needsRedraw && !clearChangedFlags;
      return needsRedraw;
    }
  }, {
    key: "getUpdateTriggers",
    value: function getUpdateTriggers() {
      var accessor = this.settings.accessor;
      return [this.id].concat(typeof accessor !== 'function' && accessor || []);
    }
  }, {
    key: "supportsTransition",
    value: function supportsTransition() {
      return Boolean(this.settings.transition);
    }
  }, {
    key: "getTransitionSetting",
    value: function getTransitionSetting(opts) {
      if (!opts || !this.supportsTransition()) {
        return null;
      }

      var accessor = this.settings.accessor;
      var layerSettings = this.settings.transition;
      var userSettings = Array.isArray(accessor) ? opts[accessor.find(function (a) {
        return opts[a];
      })] : opts[accessor];
      return normalizeTransitionSettings(userSettings, layerSettings);
    }
  }, {
    key: "setNeedsUpdate",
    value: function setNeedsUpdate() {
      var reason = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.id;
      var dataRange = arguments.length > 1 ? arguments[1] : undefined;
      this.state.needsUpdate = this.state.needsUpdate || reason;
      this.setNeedsRedraw(reason);

      if (dataRange) {
        var _dataRange$startRow = dataRange.startRow,
            startRow = _dataRange$startRow === void 0 ? 0 : _dataRange$startRow,
            _dataRange$endRow = dataRange.endRow,
            endRow = _dataRange$endRow === void 0 ? Infinity : _dataRange$endRow;
        this.state.updateRanges = add(this.state.updateRanges, [startRow, endRow]);
      } else {
        this.state.updateRanges = FULL;
      }
    }
  }, {
    key: "clearNeedsUpdate",
    value: function clearNeedsUpdate() {
      this.state.needsUpdate = false;
      this.state.updateRanges = EMPTY;
    }
  }, {
    key: "setNeedsRedraw",
    value: function setNeedsRedraw() {
      var reason = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.id;
      this.state.needsRedraw = this.state.needsRedraw || reason;
    }
  }, {
    key: "update",
    value: function update(opts) {
      this.setData(opts);
    }
  }, {
    key: "allocate",
    value: function allocate(numInstances) {
      var state = this.state,
          settings = this.settings;

      if (settings.noAlloc) {
        return false;
      }

      if (settings.update) {
        assert(Number.isFinite(numInstances));

        _get(_getPrototypeOf(Attribute.prototype), "allocate", this).call(this, {
          numInstances: numInstances,
          copy: state.updateRanges !== FULL
        });

        return true;
      }

      return false;
    }
  }, {
    key: "updateBuffer",
    value: function updateBuffer(_ref2) {
      var numInstances = _ref2.numInstances,
          data = _ref2.data,
          props = _ref2.props,
          context = _ref2.context;

      if (!this.needsUpdate()) {
        return false;
      }

      var updateRanges = this.state.updateRanges,
          _this$settings = this.settings,
          update = _this$settings.update,
          noAlloc = _this$settings.noAlloc;
      var updated = true;

      if (update) {
        var _iterator = _createForOfIteratorHelper(updateRanges),
            _step;

        try {
          for (_iterator.s(); !(_step = _iterator.n()).done;) {
            var _step$value = _slicedToArray(_step.value, 2),
                _startRow = _step$value[0],
                _endRow = _step$value[1];

            update.call(context, this, {
              data: data,
              startRow: _startRow,
              endRow: _endRow,
              props: props,
              numInstances: numInstances
            });
          }
        } catch (err) {
          _iterator.e(err);
        } finally {
          _iterator.f();
        }

        if (!this.value) ; else if (this.constant || this.buffer.byteLength < this.value.byteLength + this.byteOffset) {
          this.setData({
            value: this.value,
            constant: this.constant
          });
        } else {
          var _iterator2 = _createForOfIteratorHelper(updateRanges),
              _step2;

          try {
            for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
              var _step2$value = _slicedToArray(_step2.value, 2),
                  startRow = _step2$value[0],
                  endRow = _step2$value[1];

              var startOffset = Number.isFinite(startRow) ? this.getVertexOffset(startRow) : 0;
              var endOffset = Number.isFinite(endRow) ? this.getVertexOffset(endRow) : noAlloc || !Number.isFinite(numInstances) ? this.value.length : numInstances * this.size;

              _get(_getPrototypeOf(Attribute.prototype), "updateSubBuffer", this).call(this, {
                startOffset: startOffset,
                endOffset: endOffset
              });
            }
          } catch (err) {
            _iterator2.e(err);
          } finally {
            _iterator2.f();
          }
        }

        this._checkAttributeArray();
      } else {
        updated = false;
      }

      this.clearNeedsUpdate();
      this.setNeedsRedraw();
      return updated;
    }
  }, {
    key: "setConstantValue",
    value: function setConstantValue(value) {
      if (value === undefined || typeof value === 'function') {
        return false;
      }

      var hasChanged = this.setData({
        constant: true,
        value: value
      });

      if (hasChanged) {
        this.setNeedsRedraw();
      }

      this.clearNeedsUpdate();
      return true;
    }
  }, {
    key: "setExternalBuffer",
    value: function setExternalBuffer(buffer) {
      var state = this.state;

      if (!buffer) {
        state.lastExternalBuffer = null;
        return false;
      }

      this.clearNeedsUpdate();

      if (state.lastExternalBuffer === buffer) {
        return true;
      }

      state.lastExternalBuffer = buffer;
      this.setNeedsRedraw();
      this.setData(buffer);
      return true;
    }
  }, {
    key: "setBinaryValue",
    value: function setBinaryValue(buffer) {
      var startIndices = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
      var state = this.state,
          settings = this.settings;

      if (!buffer) {
        state.binaryValue = null;
        state.binaryAccessor = null;
        return false;
      }

      if (settings.noAlloc) {
        return false;
      }

      if (state.binaryValue === buffer) {
        this.clearNeedsUpdate();
        return true;
      }

      state.binaryValue = buffer;
      this.setNeedsRedraw();

      if (ArrayBuffer.isView(buffer)) {
        buffer = {
          value: buffer
        };
      }

      var needsUpdate = settings.transform || startIndices !== this.startIndices;

      if (needsUpdate) {
        assert(ArrayBuffer.isView(buffer.value), "invalid ".concat(settings.accessor));
        var needsNormalize = buffer.size && buffer.size !== this.size;
        state.binaryAccessor = getAccessorFromBuffer(buffer.value, {
          size: buffer.size || this.size,
          stride: buffer.stride,
          offset: buffer.offset,
          startIndices: startIndices,
          nested: needsNormalize
        });
        return false;
      }

      this.clearNeedsUpdate();
      this.setData(buffer);
      return true;
    }
  }, {
    key: "getVertexOffset",
    value: function getVertexOffset(row) {
      var startIndices = this.startIndices;
      var vertexIndex = startIndices ? startIndices[row] : row;
      return vertexIndex * this.size;
    }
  }, {
    key: "getShaderAttributes",
    value: function getShaderAttributes() {
      var shaderAttributeDefs = this.settings.shaderAttributes || _defineProperty({}, this.id, null);

      var shaderAttributes = {};

      for (var shaderAttributeName in shaderAttributeDefs) {
        Object.assign(shaderAttributes, _get(_getPrototypeOf(Attribute.prototype), "getShaderAttributes", this).call(this, shaderAttributeName, shaderAttributeDefs[shaderAttributeName]));
      }

      return shaderAttributes;
    }
  }, {
    key: "_autoUpdater",
    value: function _autoUpdater(attribute, _ref4) {
      var data = _ref4.data,
          startRow = _ref4.startRow,
          endRow = _ref4.endRow,
          props = _ref4.props,
          numInstances = _ref4.numInstances;

      if (attribute.constant) {
        return;
      }

      var settings = attribute.settings,
          state = attribute.state,
          value = attribute.value,
          size = attribute.size,
          startIndices = attribute.startIndices;
      var accessor = settings.accessor,
          transform = settings.transform;
      var accessorFunc = state.binaryAccessor || (typeof accessor === 'function' ? accessor : props[accessor]);
      assert(typeof accessorFunc === 'function', "accessor \"".concat(accessor, "\" is not a function"));
      var i = attribute.getVertexOffset(startRow);

      var _createIterable = createIterable(data, startRow, endRow),
          iterable = _createIterable.iterable,
          objectInfo = _createIterable.objectInfo;

      var _iterator3 = _createForOfIteratorHelper(iterable),
          _step3;

      try {
        for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
          var object = _step3.value;
          objectInfo.index++;
          var objectValue = accessorFunc(object, objectInfo);

          if (transform) {
            objectValue = transform.call(this, objectValue);
          }

          if (startIndices) {
            var numVertices = (objectInfo.index < startIndices.length - 1 ? startIndices[objectInfo.index + 1] : numInstances) - startIndices[objectInfo.index];

            if (objectValue && Array.isArray(objectValue[0])) {
              var startIndex = i;

              var _iterator4 = _createForOfIteratorHelper(objectValue),
                  _step4;

              try {
                for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
                  var item = _step4.value;

                  attribute._normalizeValue(item, value, startIndex);

                  startIndex += size;
                }
              } catch (err) {
                _iterator4.e(err);
              } finally {
                _iterator4.f();
              }
            } else if (objectValue && objectValue.length > size) {
              value.set(objectValue, i);
            } else {
              attribute._normalizeValue(objectValue, objectInfo.target, 0);

              fillArray({
                target: value,
                source: objectInfo.target,
                start: i,
                count: numVertices
              });
            }

            i += numVertices * size;
          } else {
            attribute._normalizeValue(objectValue, value, i);

            i += size;
          }
        }
      } catch (err) {
        _iterator3.e(err);
      } finally {
        _iterator3.f();
      }
    }
  }, {
    key: "_validateAttributeUpdaters",
    value: function _validateAttributeUpdaters() {
      var settings = this.settings;
      var hasUpdater = settings.noAlloc || typeof settings.update === 'function';

      if (!hasUpdater) {
        throw new Error("Attribute ".concat(this.id, " missing update or accessor"));
      }
    }
  }, {
    key: "_checkAttributeArray",
    value: function _checkAttributeArray() {
      var value = this.value;
      var limit = Math.min(4, this.size);

      if (value && value.length >= limit) {
        var valid = true;

        switch (limit) {
          case 4:
            valid = valid && Number.isFinite(value[3]);

          case 3:
            valid = valid && Number.isFinite(value[2]);

          case 2:
            valid = valid && Number.isFinite(value[1]);

          case 1:
            valid = valid && Number.isFinite(value[0]);
            break;

          default:
            valid = false;
        }

        if (!valid) {
          throw new Error("Illegal attribute generated for ".concat(this.id));
        }
      }
    }
  }, {
    key: "startIndices",
    get: function get() {
      return this.state.startIndices;
    },
    set: function set(layout) {
      this.state.startIndices = layout;
    }
  }]);

  return Attribute;
}(DataColumn);

function noop() {}

var DEFAULT_SETTINGS = {
  onStart: noop,
  onUpdate: noop,
  onInterrupt: noop,
  onEnd: noop
};

var Transition = function () {
  function Transition(timeline) {
    _classCallCheck(this, Transition);

    this._inProgress = false;
    this._handle = null;
    this.timeline = timeline;
    this.settings = {};
  }

  _createClass(Transition, [{
    key: "start",
    value: function start(props) {
      this.cancel();
      this.settings = Object.assign({}, DEFAULT_SETTINGS, props);
      this._inProgress = true;
      this.settings.onStart(this);
    }
  }, {
    key: "end",
    value: function end() {
      if (this._inProgress) {
        this.timeline.removeChannel(this._handle);
        this._handle = null;
        this._inProgress = false;
        this.settings.onEnd(this);
      }
    }
  }, {
    key: "cancel",
    value: function cancel() {
      if (this._inProgress) {
        this.settings.onInterrupt(this);
        this.timeline.removeChannel(this._handle);
        this._handle = null;
        this._inProgress = false;
      }
    }
  }, {
    key: "update",
    value: function update() {
      if (!this._inProgress) {
        return false;
      }

      if (this._handle === null) {
        var timeline = this.timeline,
            settings = this.settings;
        this._handle = timeline.addChannel({
          delay: timeline.getTime(),
          duration: settings.duration
        });
      }

      this.time = this.timeline.getTime(this._handle);

      this._onUpdate();

      this.settings.onUpdate(this);

      if (this.timeline.isFinished(this._handle)) {
        this.end();
      }

      return true;
    }
  }, {
    key: "_onUpdate",
    value: function _onUpdate() {}
  }, {
    key: "inProgress",
    get: function get() {
      return this._inProgress;
    }
  }]);

  return Transition;
}();

function ownKeys$3(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread$3(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys$3(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys$3(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _createForOfIteratorHelper$1(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray$1(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray$1(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray$1(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray$1(o, minLen); }

function _arrayLikeToArray$1(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

var GPUInterpolationTransition = function () {
  function GPUInterpolationTransition(_ref) {
    var gl = _ref.gl,
        attribute = _ref.attribute,
        timeline = _ref.timeline;

    _classCallCheck(this, GPUInterpolationTransition);

    this.gl = gl;
    this.type = 'interpolation';
    this.transition = new Transition(timeline);
    this.attribute = attribute;
    this.attributeInTransition = new Attribute(gl, attribute.settings);
    this.currentStartIndices = attribute.startIndices;
    this.currentLength = 0;
    this.transform = getTransform(gl, attribute);
    var bufferOpts = {
      byteLength: 0,
      usage: 35050
    };
    this.buffers = [new Buffer(gl, bufferOpts), new Buffer(gl, bufferOpts)];
  }

  _createClass(GPUInterpolationTransition, [{
    key: "start",
    value: function start(transitionSettings, numInstances) {
      if (transitionSettings.duration <= 0) {
        this.transition.cancel();
        return;
      }

      var gl = this.gl,
          buffers = this.buffers,
          attribute = this.attribute;
      cycleBuffers(buffers);
      var padBufferOpts = {
        numInstances: numInstances,
        attribute: attribute,
        fromLength: this.currentLength,
        fromStartIndices: this.currentStartIndices,
        getData: transitionSettings.enter
      };

      var _iterator = _createForOfIteratorHelper$1(buffers),
          _step;

      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var buffer = _step.value;
          padBuffer(_objectSpread$3({
            buffer: buffer
          }, padBufferOpts));
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }

      this.currentStartIndices = attribute.startIndices;
      this.currentLength = getAttributeBufferLength(attribute, numInstances);
      this.attributeInTransition.update({
        buffer: buffers[1],
        value: attribute.value
      });
      this.transition.start(transitionSettings);
      this.transform.update({
        elementCount: Math.floor(this.currentLength / attribute.size),
        sourceBuffers: {
          aFrom: buffers[0],
          aTo: getSourceBufferAttribute(gl, attribute)
        },
        feedbackBuffers: {
          vCurrent: buffers[1]
        }
      });
    }
  }, {
    key: "update",
    value: function update() {
      var updated = this.transition.update();

      if (updated) {
        var _this$transition = this.transition,
            time = _this$transition.time,
            _this$transition$sett = _this$transition.settings,
            duration = _this$transition$sett.duration,
            easing = _this$transition$sett.easing;
        var t = easing(time / duration);
        this.transform.run({
          uniforms: {
            time: t
          }
        });
      }

      return updated;
    }
  }, {
    key: "cancel",
    value: function cancel() {
      this.transition.cancel();
      this.transform["delete"]();

      while (this.buffers.length) {
        this.buffers.pop()["delete"]();
      }
    }
  }, {
    key: "inProgress",
    get: function get() {
      return this.transition.inProgress;
    }
  }]);

  return GPUInterpolationTransition;
}();
var vs = "\n#define SHADER_NAME interpolation-transition-vertex-shader\n\nuniform float time;\nattribute ATTRIBUTE_TYPE aFrom;\nattribute ATTRIBUTE_TYPE aTo;\nvarying ATTRIBUTE_TYPE vCurrent;\n\nvoid main(void) {\n  vCurrent = mix(aFrom, aTo, time);\n  gl_Position = vec4(0.0);\n}\n";

function getTransform(gl, attribute) {
  var attributeType = getAttributeTypeFromSize(attribute.size);
  return new Transform(gl, {
    vs: vs,
    defines: {
      ATTRIBUTE_TYPE: attributeType
    },
    varyings: ['vCurrent']
  });
}

function ownKeys$4(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread$4(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys$4(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys$4(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _createForOfIteratorHelper$2(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray$2(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray$2(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray$2(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray$2(o, minLen); }

function _arrayLikeToArray$2(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

var GPUSpringTransition = function () {
  function GPUSpringTransition(_ref) {
    var gl = _ref.gl,
        attribute = _ref.attribute,
        timeline = _ref.timeline;

    _classCallCheck(this, GPUSpringTransition);

    this.gl = gl;
    this.type = 'spring';
    this.transition = new Transition(timeline);
    this.attribute = attribute;
    this.attributeInTransition = new Attribute(gl, Object.assign({}, attribute.settings, {
      normalized: false
    }));
    this.currentStartIndices = attribute.startIndices;
    this.currentLength = 0;
    this.texture = getTexture(gl);
    this.framebuffer = getFramebuffer(gl, this.texture);
    this.transform = getTransform$1(gl, attribute, this.framebuffer);
    var bufferOpts = {
      byteLength: 0,
      usage: 35050
    };
    this.buffers = [new Buffer(gl, bufferOpts), new Buffer(gl, bufferOpts), new Buffer(gl, bufferOpts)];
  }

  _createClass(GPUSpringTransition, [{
    key: "start",
    value: function start(transitionSettings, numInstances) {
      var gl = this.gl,
          buffers = this.buffers,
          attribute = this.attribute;
      var padBufferOpts = {
        numInstances: numInstances,
        attribute: attribute,
        fromLength: this.currentLength,
        fromStartIndices: this.currentStartIndices,
        getData: transitionSettings.enter
      };

      var _iterator = _createForOfIteratorHelper$2(buffers),
          _step;

      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var buffer = _step.value;
          padBuffer(_objectSpread$4({
            buffer: buffer
          }, padBufferOpts));
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }

      this.currentStartIndices = attribute.startIndices;
      this.currentLength = getAttributeBufferLength(attribute, numInstances);
      this.attributeInTransition.update({
        buffer: buffers[1],
        value: attribute.value
      });
      this.transition.start(transitionSettings);
      this.transform.update({
        elementCount: Math.floor(this.currentLength / attribute.size),
        sourceBuffers: {
          aTo: getSourceBufferAttribute(gl, attribute)
        }
      });
    }
  }, {
    key: "update",
    value: function update() {
      var buffers = this.buffers,
          transform = this.transform,
          framebuffer = this.framebuffer,
          transition = this.transition;
      var updated = transition.update();

      if (!updated) {
        return false;
      }

      transform.update({
        sourceBuffers: {
          aPrev: buffers[0],
          aCur: buffers[1]
        },
        feedbackBuffers: {
          vNext: buffers[2]
        }
      });
      transform.run({
        framebuffer: framebuffer,
        discard: false,
        clearRenderTarget: true,
        uniforms: {
          stiffness: transition.settings.stiffness,
          damping: transition.settings.damping
        },
        parameters: {
          depthTest: false,
          blend: true,
          viewport: [0, 0, 1, 1],
          blendFunc: [1, 1],
          blendEquation: [32776, 32776]
        }
      });
      cycleBuffers(buffers);
      this.attributeInTransition.update({
        buffer: buffers[1],
        value: this.attribute.value
      });
      var isTransitioning = readPixelsToArray(framebuffer)[0] > 0;

      if (!isTransitioning) {
        transition.end();
      }

      return true;
    }
  }, {
    key: "cancel",
    value: function cancel() {
      this.transition.cancel();
      this.transform["delete"]();

      while (this.buffers.length) {
        this.buffers.pop()["delete"]();
      }

      this.texture["delete"]();
      this.texture = null;
      this.framebuffer["delete"]();
      this.framebuffer = null;
    }
  }, {
    key: "inProgress",
    get: function get() {
      return this.transition.inProgress;
    }
  }]);

  return GPUSpringTransition;
}();

function getTransform$1(gl, attribute, framebuffer) {
  var attributeType = getAttributeTypeFromSize(attribute.size);
  return new Transform(gl, {
    framebuffer: framebuffer,
    vs: "\n#define SHADER_NAME spring-transition-vertex-shader\n\n#define EPSILON 0.00001\n\nuniform float stiffness;\nuniform float damping;\nattribute ATTRIBUTE_TYPE aPrev;\nattribute ATTRIBUTE_TYPE aCur;\nattribute ATTRIBUTE_TYPE aTo;\nvarying ATTRIBUTE_TYPE vNext;\nvarying float vIsTransitioningFlag;\n\nATTRIBUTE_TYPE getNextValue(ATTRIBUTE_TYPE cur, ATTRIBUTE_TYPE prev, ATTRIBUTE_TYPE dest) {\n  ATTRIBUTE_TYPE velocity = cur - prev;\n  ATTRIBUTE_TYPE delta = dest - cur;\n  ATTRIBUTE_TYPE spring = delta * stiffness;\n  ATTRIBUTE_TYPE damper = velocity * -1.0 * damping;\n  return spring + damper + velocity + cur;\n}\n\nvoid main(void) {\n  bool isTransitioning = length(aCur - aPrev) > EPSILON || length(aTo - aCur) > EPSILON;\n  vIsTransitioningFlag = isTransitioning ? 1.0 : 0.0;\n\n  vNext = getNextValue(aCur, aPrev, aTo);\n  gl_Position = vec4(0, 0, 0, 1);\n  gl_PointSize = 100.0;\n}\n",
    fs: "\n#define SHADER_NAME spring-transition-is-transitioning-fragment-shader\n\nvarying float vIsTransitioningFlag;\n\nvoid main(void) {\n  if (vIsTransitioningFlag == 0.0) {\n    discard;\n  }\n  gl_FragColor = vec4(1.0);\n}",
    defines: {
      ATTRIBUTE_TYPE: attributeType
    },
    varyings: ['vNext']
  });
}

function getTexture(gl) {
  return new Texture2D(gl, {
    data: new Uint8Array(4),
    format: 6408,
    type: 5121,
    border: 0,
    mipmaps: false,
    dataFormat: 6408,
    width: 1,
    height: 1
  });
}

function getFramebuffer(gl, texture) {
  return new Framebuffer(gl, {
    id: 'spring-transition-is-transitioning-framebuffer',
    width: 1,
    height: 1,
    attachments: _defineProperty({}, 36064, texture)
  });
}

var TRANSITION_TYPES = {
  interpolation: GPUInterpolationTransition,
  spring: GPUSpringTransition
};

var AttributeTransitionManager = function () {
  function AttributeTransitionManager(gl, _ref) {
    var id = _ref.id,
        timeline = _ref.timeline;

    _classCallCheck(this, AttributeTransitionManager);

    this.id = id;
    this.gl = gl;
    this.timeline = timeline;
    this.transitions = {};
    this.needsRedraw = false;
    this.numInstances = 1;
    this.isSupported = Transform.isSupported(gl);
  }

  _createClass(AttributeTransitionManager, [{
    key: "finalize",
    value: function finalize() {
      for (var attributeName in this.transitions) {
        this._removeTransition(attributeName);
      }
    }
  }, {
    key: "update",
    value: function update(_ref2) {
      var attributes = _ref2.attributes,
          transitions = _ref2.transitions,
          numInstances = _ref2.numInstances;
      this.numInstances = numInstances || 1;

      for (var attributeName in attributes) {
        var attribute = attributes[attributeName];
        var settings = attribute.getTransitionSetting(transitions);
        if (!settings) continue;

        this._updateAttribute(attributeName, attribute, settings);
      }

      for (var _attributeName in this.transitions) {
        var _attribute = attributes[_attributeName];

        if (!_attribute || !_attribute.getTransitionSetting(transitions)) {
          this._removeTransition(_attributeName);
        }
      }
    }
  }, {
    key: "hasAttribute",
    value: function hasAttribute(attributeName) {
      var transition = this.transitions[attributeName];
      return transition && transition.inProgress;
    }
  }, {
    key: "getAttributes",
    value: function getAttributes() {
      var animatedAttributes = {};

      for (var attributeName in this.transitions) {
        var transition = this.transitions[attributeName];

        if (transition.inProgress) {
          animatedAttributes[attributeName] = transition.attributeInTransition;
        }
      }

      return animatedAttributes;
    }
  }, {
    key: "run",
    value: function run() {
      if (!this.isSupported || this.numInstances === 0) {
        return false;
      }

      for (var attributeName in this.transitions) {
        var updated = this.transitions[attributeName].update();

        if (updated) {
          this.needsRedraw = true;
        }
      }

      var needsRedraw = this.needsRedraw;
      this.needsRedraw = false;
      return needsRedraw;
    }
  }, {
    key: "_removeTransition",
    value: function _removeTransition(attributeName) {
      this.transitions[attributeName].cancel();
      delete this.transitions[attributeName];
    }
  }, {
    key: "_updateAttribute",
    value: function _updateAttribute(attributeName, attribute, settings) {
      var transition = this.transitions[attributeName];
      var isNew = !transition || transition.type !== settings.type;

      if (isNew) {
        if (!this.isSupported) {
          log.warn("WebGL2 not supported by this browser. Transition for ".concat(attributeName, " is disabled."))();
          return;
        }

        if (transition) {
          this._removeTransition(attributeName);
        }

        var TransitionType = TRANSITION_TYPES[settings.type];

        if (TransitionType) {
          this.transitions[attributeName] = new TransitionType({
            attribute: attribute,
            timeline: this.timeline,
            gl: this.gl
          });
        } else {
          log.error("unsupported transition type '".concat(settings.type, "'"))();
          isNew = false;
        }
      }

      if (isNew || attribute.needsRedraw()) {
        this.needsRedraw = true;
        this.transitions[attributeName].start(settings, this.numInstances);
      }
    }
  }]);

  return AttributeTransitionManager;
}();

var TRACE_INVALIDATE = 'attributeManager.invalidate';
var TRACE_UPDATE_START = 'attributeManager.updateStart';
var TRACE_UPDATE_END = 'attributeManager.updateEnd';
var TRACE_ATTRIBUTE_UPDATE_START = 'attribute.updateStart';
var TRACE_ATTRIBUTE_ALLOCATE = 'attribute.allocate';
var TRACE_ATTRIBUTE_UPDATE_END = 'attribute.updateEnd';

var AttributeManager = function () {
  function AttributeManager(gl) {
    var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
        _ref$id = _ref.id,
        id = _ref$id === void 0 ? 'attribute-manager' : _ref$id,
        stats = _ref.stats,
        timeline = _ref.timeline;

    _classCallCheck(this, AttributeManager);

    this.id = id;
    this.gl = gl;
    this.attributes = {};
    this.updateTriggers = {};
    this.accessors = {};
    this.needsRedraw = true;
    this.userData = {};
    this.stats = stats;
    this.attributeTransitionManager = new AttributeTransitionManager(gl, {
      id: "".concat(id, "-transitions"),
      timeline: timeline
    });
    Object.seal(this);
  }

  _createClass(AttributeManager, [{
    key: "finalize",
    value: function finalize() {
      for (var attributeName in this.attributes) {
        this.attributes[attributeName]["delete"]();
      }

      this.attributeTransitionManager.finalize();
    }
  }, {
    key: "getNeedsRedraw",
    value: function getNeedsRedraw() {
      var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {
        clearRedrawFlags: false
      };
      var redraw = this.needsRedraw;
      this.needsRedraw = this.needsRedraw && !opts.clearRedrawFlags;
      return redraw && this.id;
    }
  }, {
    key: "setNeedsRedraw",
    value: function setNeedsRedraw() {
      this.needsRedraw = true;
      return this;
    }
  }, {
    key: "add",
    value: function add(attributes, updaters) {
      this._add(attributes, updaters);
    }
  }, {
    key: "addInstanced",
    value: function addInstanced(attributes, updaters) {
      this._add(attributes, updaters, {
        instanced: 1
      });
    }
  }, {
    key: "remove",
    value: function remove(attributeNameArray) {
      for (var i = 0; i < attributeNameArray.length; i++) {
        var name = attributeNameArray[i];

        if (this.attributes[name] !== undefined) {
          this.attributes[name]["delete"]();
          delete this.attributes[name];
        }
      }
    }
  }, {
    key: "invalidate",
    value: function invalidate(triggerName, dataRange) {
      var invalidatedAttributes = this._invalidateTrigger(triggerName, dataRange);

      debug(TRACE_INVALIDATE, this, triggerName, invalidatedAttributes);
    }
  }, {
    key: "invalidateAll",
    value: function invalidateAll(dataRange) {
      for (var attributeName in this.attributes) {
        this.attributes[attributeName].setNeedsUpdate(attributeName, dataRange);
      }

      debug(TRACE_INVALIDATE, this, 'all');
    }
  }, {
    key: "update",
    value: function update() {
      var _ref2 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          data = _ref2.data,
          numInstances = _ref2.numInstances,
          _ref2$startIndices = _ref2.startIndices,
          startIndices = _ref2$startIndices === void 0 ? null : _ref2$startIndices,
          transitions = _ref2.transitions,
          _ref2$props = _ref2.props,
          props = _ref2$props === void 0 ? {} : _ref2$props,
          _ref2$buffers = _ref2.buffers,
          buffers = _ref2$buffers === void 0 ? {} : _ref2$buffers,
          _ref2$context = _ref2.context,
          context = _ref2$context === void 0 ? {} : _ref2$context;

      var updated = false;
      debug(TRACE_UPDATE_START, this);

      if (this.stats) {
        this.stats.get('Update Attributes').timeStart();
      }

      for (var attributeName in this.attributes) {
        var attribute = this.attributes[attributeName];
        var accessorName = attribute.settings.accessor;
        attribute.startIndices = startIndices;

        if (props[attributeName]) {
          log.removed("props.".concat(attributeName), "data.attributes.".concat(attributeName))();
        }

        if (attribute.setExternalBuffer(buffers[attributeName])) ; else if (attribute.setBinaryValue(buffers[accessorName], data.startIndices)) ; else if (!buffers[accessorName] && attribute.setConstantValue(props[accessorName])) ; else if (attribute.needsUpdate()) {
          updated = true;

          this._updateAttribute({
            attribute: attribute,
            numInstances: numInstances,
            data: data,
            props: props,
            context: context
          });
        }

        this.needsRedraw |= attribute.needsRedraw();
      }

      if (updated) {
        debug(TRACE_UPDATE_END, this, numInstances);
      }

      if (this.stats) {
        this.stats.get('Update Attributes').timeEnd();
      }

      this.attributeTransitionManager.update({
        attributes: this.attributes,
        numInstances: numInstances,
        transitions: transitions
      });
    }
  }, {
    key: "updateTransition",
    value: function updateTransition() {
      var attributeTransitionManager = this.attributeTransitionManager;
      var transitionUpdated = attributeTransitionManager.run();
      this.needsRedraw = this.needsRedraw || transitionUpdated;
      return transitionUpdated;
    }
  }, {
    key: "getAttributes",
    value: function getAttributes() {
      return this.attributes;
    }
  }, {
    key: "getChangedAttributes",
    value: function getChangedAttributes() {
      var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {
        clearChangedFlags: false
      };
      var attributes = this.attributes,
          attributeTransitionManager = this.attributeTransitionManager;
      var changedAttributes = Object.assign({}, attributeTransitionManager.getAttributes());

      for (var attributeName in attributes) {
        var attribute = attributes[attributeName];

        if (attribute.needsRedraw(opts) && !attributeTransitionManager.hasAttribute(attributeName)) {
          changedAttributes[attributeName] = attribute;
        }
      }

      return changedAttributes;
    }
  }, {
    key: "getShaderAttributes",
    value: function getShaderAttributes(attributes) {
      var excludeAttributes = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      if (!attributes) {
        attributes = this.getAttributes();
      }

      var shaderAttributes = {};

      for (var attributeName in attributes) {
        if (!excludeAttributes[attributeName]) {
          Object.assign(shaderAttributes, attributes[attributeName].getShaderAttributes());
        }
      }

      return shaderAttributes;
    }
  }, {
    key: "getAccessors",
    value: function getAccessors() {
      return this.updateTriggers;
    }
  }, {
    key: "_add",
    value: function _add(attributes, updaters) {
      var extraProps = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

      if (updaters) {
        log.warn('AttributeManager.add({updaters}) - updater map no longer supported')();
      }

      var newAttributes = {};

      for (var attributeName in attributes) {
        var attribute = attributes[attributeName];

        var newAttribute = this._createAttribute(attributeName, attribute, extraProps);

        newAttributes[attributeName] = newAttribute;
      }

      Object.assign(this.attributes, newAttributes);

      this._mapUpdateTriggersToAttributes();
    }
  }, {
    key: "_createAttribute",
    value: function _createAttribute(name, attribute, extraProps) {
      var props = {
        id: name,
        constant: attribute.constant || false,
        isIndexed: attribute.isIndexed || attribute.elements,
        size: attribute.elements && 1 || attribute.size,
        value: attribute.value || null,
        divisor: attribute.instanced || extraProps.instanced ? 1 : attribute.divisor
      };
      return new Attribute(this.gl, Object.assign({}, attribute, props));
    }
  }, {
    key: "_mapUpdateTriggersToAttributes",
    value: function _mapUpdateTriggersToAttributes() {
      var _this = this;

      var triggers = {};

      var _loop = function _loop(attributeName) {
        var attribute = _this.attributes[attributeName];
        attribute.getUpdateTriggers().forEach(function (triggerName) {
          if (!triggers[triggerName]) {
            triggers[triggerName] = [];
          }

          triggers[triggerName].push(attributeName);
        });
      };

      for (var attributeName in this.attributes) {
        _loop(attributeName);
      }

      this.updateTriggers = triggers;
    }
  }, {
    key: "_invalidateTrigger",
    value: function _invalidateTrigger(triggerName, dataRange) {
      var attributes = this.attributes,
          updateTriggers = this.updateTriggers;
      var invalidatedAttributes = updateTriggers[triggerName];

      if (invalidatedAttributes) {
        invalidatedAttributes.forEach(function (name) {
          var attribute = attributes[name];

          if (attribute) {
            attribute.setNeedsUpdate(attribute.id, dataRange);
          }
        });
      }

      return invalidatedAttributes;
    }
  }, {
    key: "_updateAttribute",
    value: function _updateAttribute(opts) {
      var attribute = opts.attribute,
          numInstances = opts.numInstances;
      debug(TRACE_ATTRIBUTE_UPDATE_START, attribute);

      if (attribute.allocate(numInstances)) {
        debug(TRACE_ATTRIBUTE_ALLOCATE, attribute, numInstances);
      }

      var updated = attribute.updateBuffer(opts);

      if (updated) {
        this.needsRedraw = true;
        debug(TRACE_ATTRIBUTE_UPDATE_END, attribute, numInstances);
      }
    }
  }]);

  return AttributeManager;
}();

function _createSuper$7(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct$7(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _isNativeReflectConstruct$7() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

var CPUInterpolationTransition = function (_Transition) {
  _inherits(CPUInterpolationTransition, _Transition);

  var _super = _createSuper$7(CPUInterpolationTransition);

  function CPUInterpolationTransition() {
    _classCallCheck(this, CPUInterpolationTransition);

    return _super.apply(this, arguments);
  }

  _createClass(CPUInterpolationTransition, [{
    key: "_onUpdate",
    value: function _onUpdate() {
      var time = this.time,
          _this$settings = this.settings,
          fromValue = _this$settings.fromValue,
          toValue = _this$settings.toValue,
          duration = _this$settings.duration,
          easing = _this$settings.easing;
      var t = easing(time / duration);
      this._value = lerp(fromValue, toValue, t);
    }
  }, {
    key: "value",
    get: function get() {
      return this._value;
    }
  }]);

  return CPUInterpolationTransition;
}(Transition);

function _createSuper$8(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct$8(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _isNativeReflectConstruct$8() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }
var EPSILON = 1e-5;

function updateSpringElement(prev, cur, dest, damping, stiffness) {
  var velocity = cur - prev;
  var delta = dest - cur;
  var spring = delta * stiffness;
  var damper = -velocity * damping;
  return spring + damper + velocity + cur;
}

function updateSpring(prev, cur, dest, damping, stiffness) {
  if (Array.isArray(dest)) {
    var next = [];

    for (var i = 0; i < dest.length; i++) {
      next[i] = updateSpringElement(prev[i], cur[i], dest[i], damping, stiffness);
    }

    return next;
  }

  return updateSpringElement(prev, cur, dest, damping, stiffness);
}

function distance(value1, value2) {
  if (Array.isArray(value1)) {
    var distanceSquare = 0;

    for (var i = 0; i < value1.length; i++) {
      var d = value1[i] - value2[i];
      distanceSquare += d * d;
    }

    return Math.sqrt(distanceSquare);
  }

  return Math.abs(value1 - value2);
}

var CPUSpringTransition = function (_Transition) {
  _inherits(CPUSpringTransition, _Transition);

  var _super = _createSuper$8(CPUSpringTransition);

  function CPUSpringTransition() {
    _classCallCheck(this, CPUSpringTransition);

    return _super.apply(this, arguments);
  }

  _createClass(CPUSpringTransition, [{
    key: "_onUpdate",
    value: function _onUpdate() {
      var _this$settings = this.settings,
          fromValue = _this$settings.fromValue,
          toValue = _this$settings.toValue,
          damping = _this$settings.damping,
          stiffness = _this$settings.stiffness;

      var _this$_prevValue = this._prevValue,
          _prevValue = _this$_prevValue === void 0 ? fromValue : _this$_prevValue,
          _this$_currValue = this._currValue,
          _currValue = _this$_currValue === void 0 ? fromValue : _this$_currValue;

      var nextValue = updateSpring(_prevValue, _currValue, toValue, damping, stiffness);
      var delta = distance(nextValue, toValue);
      var velocity = distance(nextValue, _currValue);

      if (delta < EPSILON && velocity < EPSILON) {
        nextValue = toValue;
        this.end();
      }

      this._prevValue = _currValue;
      this._currValue = nextValue;
    }
  }, {
    key: "value",
    get: function get() {
      return this._currValue;
    }
  }]);

  return CPUSpringTransition;
}(Transition);

function _createForOfIteratorHelper$3(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray$3(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray$3(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray$3(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray$3(o, minLen); }

function _arrayLikeToArray$3(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function ownKeys$5(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread$5(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys$5(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys$5(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }
var TRANSITION_TYPES$1 = {
  interpolation: CPUInterpolationTransition,
  spring: CPUSpringTransition
};

var UniformTransitionManager = function () {
  function UniformTransitionManager(timeline) {
    _classCallCheck(this, UniformTransitionManager);

    this.transitions = new Map();
    this.timeline = timeline;
  }

  _createClass(UniformTransitionManager, [{
    key: "add",
    value: function add(key, fromValue, toValue, settings) {
      var transitions = this.transitions;

      if (transitions.has(key)) {
        var _transition = transitions.get(key);

        var _transition$value = _transition.value,
            value = _transition$value === void 0 ? _transition.settings.fromValue : _transition$value;
        fromValue = value;
        this.remove(key);
      }

      settings = normalizeTransitionSettings(settings);

      if (!settings) {
        return;
      }

      var TransitionType = TRANSITION_TYPES$1[settings.type];

      if (!TransitionType) {
        log.error("unsupported transition type '".concat(settings.type, "'"))();
        return;
      }

      var transition = new TransitionType(this.timeline);
      transition.start(_objectSpread$5(_objectSpread$5({}, settings), {}, {
        fromValue: fromValue,
        toValue: toValue
      }));
      transitions.set(key, transition);
    }
  }, {
    key: "remove",
    value: function remove(key) {
      var transitions = this.transitions;

      if (transitions.has(key)) {
        transitions.get(key).cancel();
        transitions["delete"](key);
      }
    }
  }, {
    key: "update",
    value: function update() {
      var propsInTransition = {};

      var _iterator = _createForOfIteratorHelper$3(this.transitions),
          _step;

      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var _step$value = _slicedToArray(_step.value, 2),
              key = _step$value[0],
              transition = _step$value[1];

          transition.update();
          propsInTransition[key] = transition.value;

          if (!transition.inProgress) {
            this.remove(key);
          }
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }

      return propsInTransition;
    }
  }, {
    key: "clear",
    value: function clear() {
      var _iterator2 = _createForOfIteratorHelper$3(this.transitions.keys()),
          _step2;

      try {
        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
          var key = _step2.value;
          this.remove(key);
        }
      } catch (err) {
        _iterator2.e(err);
      } finally {
        _iterator2.f();
      }
    }
  }, {
    key: "active",
    get: function get() {
      return this.transitions.size > 0;
    }
  }]);

  return UniformTransitionManager;
}();

var LIFECYCLE = {
  NO_STATE: 'Awaiting state',
  MATCHED: 'Matched. State transferred from previous layer',
  INITIALIZED: 'Initialized',
  AWAITING_GC: 'Discarded. Awaiting garbage collection',
  AWAITING_FINALIZATION: 'No longer matched. Awaiting garbage collection',
  FINALIZED: 'Finalized! Awaiting garbage collection'
};
var PROP_SYMBOLS = {
  COMPONENT: Symbol["for"]('component'),
  ASYNC_DEFAULTS: Symbol["for"]('asyncPropDefaults'),
  ASYNC_ORIGINAL: Symbol["for"]('asyncPropOriginal'),
  ASYNC_RESOLVED: Symbol["for"]('asyncPropResolved')
};

var COMPONENT = PROP_SYMBOLS.COMPONENT;
function validateProps(props) {
  var propTypes = getPropTypes(props);

  for (var propName in propTypes) {
    var propType = propTypes[propName];
    var validate = propType.validate;

    if (validate && !validate(props[propName], propType)) {
      throw new Error("Invalid prop ".concat(propName, ": ").concat(props[propName]));
    }
  }
}
function diffProps(props, oldProps) {
  var propsChangedReason = compareProps({
    newProps: props,
    oldProps: oldProps,
    propTypes: getPropTypes(props),
    ignoreProps: {
      data: null,
      updateTriggers: null,
      extensions: null,
      transitions: null
    }
  });
  var dataChangedReason = diffDataProps(props, oldProps);
  var updateTriggersChangedReason = false;

  if (!dataChangedReason) {
    updateTriggersChangedReason = diffUpdateTriggers(props, oldProps);
  }

  return {
    dataChanged: dataChangedReason,
    propsChanged: propsChangedReason,
    updateTriggersChanged: updateTriggersChangedReason,
    extensionsChanged: diffExtensions(props, oldProps),
    transitionsChanged: diffTransitions(props, oldProps)
  };
}

function diffTransitions(props, oldProps) {
  if (!props.transitions) {
    return null;
  }

  var result = {};
  var propTypes = getPropTypes(props);

  for (var key in props.transitions) {
    var propType = propTypes[key];
    var type = propType && propType.type;
    var isTransitionable = type === 'number' || type === 'color' || type === 'array';

    if (isTransitionable && comparePropValues(props[key], oldProps[key], propType)) {
      result[key] = true;
    }
  }

  return result;
}

function compareProps() {
  var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
      newProps = _ref.newProps,
      oldProps = _ref.oldProps,
      _ref$ignoreProps = _ref.ignoreProps,
      ignoreProps = _ref$ignoreProps === void 0 ? {} : _ref$ignoreProps,
      _ref$propTypes = _ref.propTypes,
      propTypes = _ref$propTypes === void 0 ? {} : _ref$propTypes,
      _ref$triggerName = _ref.triggerName,
      triggerName = _ref$triggerName === void 0 ? 'props' : _ref$triggerName;

  if (oldProps === newProps) {
    return null;
  }

  if (_typeof(newProps) !== 'object' || newProps === null) {
    return "".concat(triggerName, " changed shallowly");
  }

  if (_typeof(oldProps) !== 'object' || oldProps === null) {
    return "".concat(triggerName, " changed shallowly");
  }

  for (var _i = 0, _Object$keys = Object.keys(newProps); _i < _Object$keys.length; _i++) {
    var key = _Object$keys[_i];

    if (!(key in ignoreProps)) {
      if (!(key in oldProps)) {
        return "".concat(triggerName, ".").concat(key, " added");
      }

      var changed = comparePropValues(newProps[key], oldProps[key], propTypes[key]);

      if (changed) {
        return "".concat(triggerName, ".").concat(key, " ").concat(changed);
      }
    }
  }

  for (var _i2 = 0, _Object$keys2 = Object.keys(oldProps); _i2 < _Object$keys2.length; _i2++) {
    var _key = _Object$keys2[_i2];

    if (!(_key in ignoreProps)) {
      if (!(_key in newProps)) {
        return "".concat(triggerName, ".").concat(_key, " dropped");
      }

      if (!Object.hasOwnProperty.call(newProps, _key)) {
        var _changed = comparePropValues(newProps[_key], oldProps[_key], propTypes[_key]);

        if (_changed) {
          return "".concat(triggerName, ".").concat(_key, " ").concat(_changed);
        }
      }
    }
  }

  return null;
}

function comparePropValues(newProp, oldProp, propType) {
  var equal = propType && propType.equal;

  if (equal && !equal(newProp, oldProp, propType)) {
    return 'changed deeply';
  }

  if (!equal) {
    equal = newProp && oldProp && newProp.equals;

    if (equal && !equal.call(newProp, oldProp)) {
      return 'changed deeply';
    }
  }

  if (!equal && oldProp !== newProp) {
    return 'changed shallowly';
  }

  return null;
}

function diffDataProps(props, oldProps) {
  if (oldProps === null) {
    return 'oldProps is null, initial diff';
  }

  var dataChanged = null;
  var dataComparator = props.dataComparator,
      _dataDiff = props._dataDiff;

  if (dataComparator) {
    if (!dataComparator(props.data, oldProps.data)) {
      dataChanged = 'Data comparator detected a change';
    }
  } else if (props.data !== oldProps.data) {
    dataChanged = 'A new data container was supplied';
  }

  if (dataChanged && _dataDiff) {
    dataChanged = _dataDiff(props.data, oldProps.data) || dataChanged;
  }

  return dataChanged;
}

function diffUpdateTriggers(props, oldProps) {
  if (oldProps === null) {
    return 'oldProps is null, initial diff';
  }

  if ('all' in props.updateTriggers) {
    var diffReason = diffUpdateTrigger(props, oldProps, 'all');

    if (diffReason) {
      return {
        all: true
      };
    }
  }

  var triggerChanged = {};
  var reason = false;

  for (var triggerName in props.updateTriggers) {
    if (triggerName !== 'all') {
      var _diffReason = diffUpdateTrigger(props, oldProps, triggerName);

      if (_diffReason) {
        triggerChanged[triggerName] = true;
        reason = triggerChanged;
      }
    }
  }

  return reason;
}

function diffExtensions(props, oldProps) {
  if (oldProps === null) {
    return 'oldProps is null, initial diff';
  }

  var oldExtensions = oldProps.extensions;
  var extensions = props.extensions;

  if (extensions === oldExtensions) {
    return false;
  }

  if (extensions.length !== oldExtensions.length) {
    return true;
  }

  for (var i = 0; i < extensions.length; i++) {
    if (!extensions[i].equals(oldExtensions[i])) {
      return true;
    }
  }

  return false;
}

function diffUpdateTrigger(props, oldProps, triggerName) {
  var newTriggers = props.updateTriggers[triggerName];
  newTriggers = newTriggers === undefined || newTriggers === null ? {} : newTriggers;
  var oldTriggers = oldProps.updateTriggers[triggerName];
  oldTriggers = oldTriggers === undefined || oldTriggers === null ? {} : oldTriggers;
  var diffReason = compareProps({
    oldProps: oldTriggers,
    newProps: newTriggers,
    triggerName: triggerName
  });
  return diffReason;
}

function getPropTypes(props) {
  var layer = props[COMPONENT];
  var LayerType = layer && layer.constructor;
  return LayerType ? LayerType._propTypes : {};
}

var ERR_NOT_OBJECT = 'count(): argument not an object';
var ERR_NOT_CONTAINER = 'count(): argument not a container';
function count(container) {
  if (!isObject(container)) {
    throw new Error(ERR_NOT_OBJECT);
  }

  if (typeof container.count === 'function') {
    return container.count();
  }

  if (Number.isFinite(container.size)) {
    return container.size;
  }

  if (Number.isFinite(container.length)) {
    return container.length;
  }

  if (isPlainObject(container)) {
    return Object.keys(container).length;
  }

  throw new Error(ERR_NOT_CONTAINER);
}

function isPlainObject(value) {
  return value !== null && _typeof(value) === 'object' && value.constructor === Object;
}

function isObject(value) {
  return value !== null && _typeof(value) === 'object';
}

function ownKeys$6(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread$6(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys$6(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys$6(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function mergeShaders(target, source) {
  if (!source) {
    return target;
  }

  var result = Object.assign({}, target, source);

  if ('defines' in source) {
    result.defines = Object.assign({}, target.defines, source.defines);
  }

  if ('modules' in source) {
    result.modules = (target.modules || []).concat(source.modules);

    if (source.modules.some(function (module) {
      return module.name === 'project64';
    })) {
      var index = result.modules.findIndex(function (module) {
        return module.name === 'project32';
      });

      if (index >= 0) {
        result.modules.splice(index, 1);
      }
    }
  }

  if ('inject' in source) {
    if (!target.inject) {
      result.inject = source.inject;
    } else {
      var mergedInjection = _objectSpread$6({}, target.inject);

      for (var key in source.inject) {
        mergedInjection[key] = (mergedInjection[key] || '') + source.inject[key];
      }

      result.inject = mergedInjection;
    }
  }

  return result;
}

var _DEFAULT_TEXTURE_PARA;

function ownKeys$7(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread$7(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys$7(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys$7(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }
var DEFAULT_TEXTURE_PARAMETERS = (_DEFAULT_TEXTURE_PARA = {}, _defineProperty(_DEFAULT_TEXTURE_PARA, 10241, 9987), _defineProperty(_DEFAULT_TEXTURE_PARA, 10240, 9729), _defineProperty(_DEFAULT_TEXTURE_PARA, 10242, 33071), _defineProperty(_DEFAULT_TEXTURE_PARA, 10243, 33071), _DEFAULT_TEXTURE_PARA);
var internalTextures = {};
function createTexture(layer, image) {
  var gl = layer.context && layer.context.gl;

  if (!gl || !image) {
    return null;
  }

  if (image instanceof Texture2D) {
    return image;
  } else if (image.constructor && image.constructor.name !== 'Object') {
    image = {
      data: image
    };
  }

  var texture = new Texture2D(gl, _objectSpread$7(_objectSpread$7({}, image), {}, {
    parameters: _objectSpread$7(_objectSpread$7({}, DEFAULT_TEXTURE_PARAMETERS), layer.props.textureParameters)
  }));
  internalTextures[texture.id] = true;
  return texture;
}
function destroyTexture(texture) {
  if (!texture || !(texture instanceof Texture2D)) {
    return;
  }

  if (internalTextures[texture.id]) {
    texture["delete"]();
    delete internalTextures[texture.id];
  }
}

var TYPE_DEFINITIONS = {
  "boolean": {
    validate: function validate(value, propType) {
      return true;
    },
    equal: function equal(value1, value2, propType) {
      return Boolean(value1) === Boolean(value2);
    }
  },
  number: {
    validate: function validate(value, propType) {
      return Number.isFinite(value) && (!('max' in propType) || value <= propType.max) && (!('min' in propType) || value >= propType.min);
    }
  },
  color: {
    validate: function validate(value, propType) {
      return propType.optional && !value || isArray$1(value) && (value.length === 3 || value.length === 4);
    },
    equal: function equal(value1, value2, propType) {
      return arrayEqual(value1, value2);
    }
  },
  accessor: {
    validate: function validate(value, propType) {
      var valueType = getTypeOf(value);
      return valueType === 'function' || valueType === getTypeOf(propType.value);
    },
    equal: function equal(value1, value2, propType) {
      if (typeof value2 === 'function') {
        return true;
      }

      return arrayEqual(value1, value2);
    }
  },
  array: {
    validate: function validate(value, propType) {
      return propType.optional && !value || isArray$1(value);
    },
    equal: function equal(value1, value2, propType) {
      return propType.compare ? arrayEqual(value1, value2) : value1 === value2;
    }
  },
  "function": {
    validate: function validate(value, propType) {
      return propType.optional && !value || typeof value === 'function';
    },
    equal: function equal(value1, value2, propType) {
      return !propType.compare || value1 === value2;
    }
  },
  data: {
    transform: function transform(value, propType, component) {
      var _ref = component ? component.props : {},
          dataTransform = _ref.dataTransform;

      return dataTransform && value ? dataTransform(value) : value;
    }
  },
  image: {
    transform: function transform(value, propType, component) {
      return createTexture(component, value);
    },
    release: function release(value) {
      destroyTexture(value);
    }
  }
};

function arrayEqual(array1, array2) {
  if (array1 === array2) {
    return true;
  }

  if (!isArray$1(array1) || !isArray$1(array2)) {
    return false;
  }

  var len = array1.length;

  if (len !== array2.length) {
    return false;
  }

  for (var i = 0; i < len; i++) {
    if (array1[i] !== array2[i]) {
      return false;
    }
  }

  return true;
}

function parsePropTypes(propDefs) {
  var propTypes = {};
  var defaultProps = {};
  var deprecatedProps = {};

  for (var _i = 0, _Object$entries = Object.entries(propDefs); _i < _Object$entries.length; _i++) {
    var _Object$entries$_i = _slicedToArray(_Object$entries[_i], 2),
        propName = _Object$entries$_i[0],
        propDef = _Object$entries$_i[1];

    if (propDef && propDef.deprecatedFor) {
      deprecatedProps[propName] = Array.isArray(propDef.deprecatedFor) ? propDef.deprecatedFor : [propDef.deprecatedFor];
    } else {
      var propType = parsePropType(propName, propDef);
      propTypes[propName] = propType;
      defaultProps[propName] = propType.value;
    }
  }

  return {
    propTypes: propTypes,
    defaultProps: defaultProps,
    deprecatedProps: deprecatedProps
  };
}

function parsePropType(name, propDef) {
  switch (getTypeOf(propDef)) {
    case 'object':
      return normalizePropDefinition(name, propDef);

    case 'array':
      return normalizePropDefinition(name, {
        type: 'array',
        value: propDef,
        compare: false
      });

    case 'boolean':
      return normalizePropDefinition(name, {
        type: 'boolean',
        value: propDef
      });

    case 'number':
      return normalizePropDefinition(name, {
        type: 'number',
        value: propDef
      });

    case 'function':
      return normalizePropDefinition(name, {
        type: 'function',
        value: propDef,
        compare: true
      });

    default:
      return {
        name: name,
        type: 'unknown',
        value: propDef
      };
  }
}

function normalizePropDefinition(name, propDef) {
  if (!('type' in propDef)) {
    if (!('value' in propDef)) {
      return {
        name: name,
        type: 'object',
        value: propDef
      };
    }

    return Object.assign({
      name: name,
      type: getTypeOf(propDef.value)
    }, propDef);
  }

  return Object.assign({
    name: name
  }, TYPE_DEFINITIONS[propDef.type], propDef);
}

function isArray$1(value) {
  return Array.isArray(value) || ArrayBuffer.isView(value);
}

function getTypeOf(value) {
  if (isArray$1(value)) {
    return 'array';
  }

  if (value === null) {
    return 'null';
  }

  return _typeof(value);
}

function _createForOfIteratorHelper$4(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray$4(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray$4(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray$4(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray$4(o, minLen); }

function _arrayLikeToArray$4(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }
var COMPONENT$1 = PROP_SYMBOLS.COMPONENT,
    ASYNC_ORIGINAL = PROP_SYMBOLS.ASYNC_ORIGINAL,
    ASYNC_RESOLVED = PROP_SYMBOLS.ASYNC_RESOLVED,
    ASYNC_DEFAULTS = PROP_SYMBOLS.ASYNC_DEFAULTS;
function createProps() {
  var component = this;
  var propsPrototype = getPropsPrototype(component.constructor);
  var propsInstance = Object.create(propsPrototype);
  propsInstance[COMPONENT$1] = component;
  propsInstance[ASYNC_ORIGINAL] = {};
  propsInstance[ASYNC_RESOLVED] = {};

  for (var i = 0; i < arguments.length; ++i) {
    var props = arguments[i];

    for (var key in props) {
      propsInstance[key] = props[key];
    }
  }

  Object.freeze(propsInstance);
  return propsInstance;
}

function getPropsPrototype(componentClass) {
  var defaultProps = getOwnProperty(componentClass, '_mergedDefaultProps');

  if (!defaultProps) {
    createPropsPrototypeAndTypes(componentClass);
    return componentClass._mergedDefaultProps;
  }

  return defaultProps;
}

function createPropsPrototypeAndTypes(componentClass) {
  var parent = componentClass.prototype;

  if (!parent) {
    return;
  }

  var parentClass = Object.getPrototypeOf(componentClass);
  var parentDefaultProps = getPropsPrototype(parentClass);
  var componentDefaultProps = getOwnProperty(componentClass, 'defaultProps') || {};
  var componentPropDefs = parsePropTypes(componentDefaultProps);
  var defaultProps = createPropsPrototype(componentPropDefs.defaultProps, parentDefaultProps, componentClass);
  var propTypes = Object.assign({}, parentClass._propTypes, componentPropDefs.propTypes);
  addAsyncPropsToPropPrototype(defaultProps, propTypes);
  var deprecatedProps = Object.assign({}, parentClass._deprecatedProps, componentPropDefs.deprecatedProps);
  addDeprecatedPropsToPropPrototype(defaultProps, deprecatedProps);
  componentClass._mergedDefaultProps = defaultProps;
  componentClass._propTypes = propTypes;
  componentClass._deprecatedProps = deprecatedProps;
}

function createPropsPrototype(props, parentProps, componentClass) {
  var defaultProps = Object.create(null);
  Object.assign(defaultProps, parentProps, props);
  var id = getComponentName(componentClass);
  delete props.id;
  Object.defineProperties(defaultProps, {
    id: {
      writable: true,
      value: id
    }
  });
  return defaultProps;
}

function addDeprecatedPropsToPropPrototype(defaultProps, deprecatedProps) {
  var _loop = function _loop(propName) {
    Object.defineProperty(defaultProps, propName, {
      enumerable: false,
      set: function set(newValue) {
        var nameStr = "".concat(this.id, ": ").concat(propName);

        var _iterator = _createForOfIteratorHelper$4(deprecatedProps[propName]),
            _step;

        try {
          for (_iterator.s(); !(_step = _iterator.n()).done;) {
            var newPropName = _step.value;

            if (!hasOwnProperty(this, newPropName)) {
              this[newPropName] = newValue;
            }
          }
        } catch (err) {
          _iterator.e(err);
        } finally {
          _iterator.f();
        }

        log.deprecated(nameStr, deprecatedProps[propName].join('/'))();
      }
    });
  };

  for (var propName in deprecatedProps) {
    _loop(propName);
  }
}

function addAsyncPropsToPropPrototype(defaultProps, propTypes) {
  var defaultValues = {};
  var descriptors = {};

  for (var propName in propTypes) {
    var propType = propTypes[propName];
    var name = propType.name,
        value = propType.value;

    if (propType.async) {
      defaultValues[name] = value;
      descriptors[name] = getDescriptorForAsyncProp(name);
    }
  }

  defaultProps[ASYNC_DEFAULTS] = defaultValues;
  defaultProps[ASYNC_ORIGINAL] = {};
  Object.defineProperties(defaultProps, descriptors);
}

function getDescriptorForAsyncProp(name) {
  return {
    enumerable: true,
    set: function set(newValue) {
      if (typeof newValue === 'string' || newValue instanceof Promise || isAsyncIterable(newValue)) {
        this[ASYNC_ORIGINAL][name] = newValue;
      } else {
        this[ASYNC_RESOLVED][name] = newValue;
      }
    },
    get: function get() {
      if (this[ASYNC_RESOLVED]) {
        if (name in this[ASYNC_RESOLVED]) {
          var value = this[ASYNC_RESOLVED][name];
          return value || this[ASYNC_DEFAULTS][name];
        }

        if (name in this[ASYNC_ORIGINAL]) {
          var state = this[COMPONENT$1] && this[COMPONENT$1].internalState;

          if (state && state.hasAsyncProp(name)) {
            return state.getAsyncProp(name) || this[ASYNC_DEFAULTS][name];
          }
        }
      }

      return this[ASYNC_DEFAULTS][name];
    }
  };
}

function hasOwnProperty(object, prop) {
  return Object.prototype.hasOwnProperty.call(object, prop);
}

function getOwnProperty(object, prop) {
  return hasOwnProperty(object, prop) && object[prop];
}

function getComponentName(componentClass) {
  var componentName = getOwnProperty(componentClass, 'layerName') || getOwnProperty(componentClass, 'componentName');

  if (!componentName) {
    log.once(0, "".concat(componentClass.name, ".componentName not specified"))();
  }

  return componentName || componentClass.name;
}

var ASYNC_ORIGINAL$1 = PROP_SYMBOLS.ASYNC_ORIGINAL,
    ASYNC_RESOLVED$1 = PROP_SYMBOLS.ASYNC_RESOLVED,
    ASYNC_DEFAULTS$1 = PROP_SYMBOLS.ASYNC_DEFAULTS;
var EMPTY_PROPS = Object.freeze({});

var ComponentState = function () {
  function ComponentState() {
    var component = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

    _classCallCheck(this, ComponentState);

    this.component = component;
    this.asyncProps = {};

    this.onAsyncPropUpdated = function () {};

    this.oldProps = EMPTY_PROPS;
    this.oldAsyncProps = null;
  }

  _createClass(ComponentState, [{
    key: "finalize",
    value: function finalize() {
      for (var propName in this.asyncProps) {
        var asyncProp = this.asyncProps[propName];

        if (asyncProp.type && asyncProp.type.release) {
          asyncProp.type.release(asyncProp.resolvedValue, asyncProp.type, this.component);
        }
      }
    }
  }, {
    key: "getOldProps",
    value: function getOldProps() {
      return this.oldAsyncProps || this.oldProps;
    }
  }, {
    key: "resetOldProps",
    value: function resetOldProps() {
      this.oldAsyncProps = null;
      this.oldProps = this.component.props;
    }
  }, {
    key: "freezeAsyncOldProps",
    value: function freezeAsyncOldProps() {
      if (!this.oldAsyncProps) {
        this.oldProps = this.oldProps || this.component.props;
        this.oldAsyncProps = Object.create(this.oldProps);

        for (var propName in this.asyncProps) {
          Object.defineProperty(this.oldAsyncProps, propName, {
            enumerable: true,
            value: this.oldProps[propName]
          });
        }
      }
    }
  }, {
    key: "hasAsyncProp",
    value: function hasAsyncProp(propName) {
      return propName in this.asyncProps;
    }
  }, {
    key: "getAsyncProp",
    value: function getAsyncProp(propName) {
      var asyncProp = this.asyncProps[propName];
      return asyncProp && asyncProp.resolvedValue;
    }
  }, {
    key: "isAsyncPropLoading",
    value: function isAsyncPropLoading(propName) {
      if (propName) {
        var asyncProp = this.asyncProps[propName];
        return Boolean(asyncProp && asyncProp.pendingLoadCount > 0 && asyncProp.pendingLoadCount !== asyncProp.resolvedLoadCount);
      }

      for (var key in this.asyncProps) {
        if (this.isAsyncPropLoading(key)) {
          return true;
        }
      }

      return false;
    }
  }, {
    key: "reloadAsyncProp",
    value: function reloadAsyncProp(propName, value) {
      this._watchPromise(propName, Promise.resolve(value));
    }
  }, {
    key: "setAsyncProps",
    value: function setAsyncProps(props) {
      var resolvedValues = props[ASYNC_RESOLVED$1] || {};
      var originalValues = props[ASYNC_ORIGINAL$1] || props;
      var defaultValues = props[ASYNC_DEFAULTS$1] || {};

      for (var propName in resolvedValues) {
        var value = resolvedValues[propName];

        this._createAsyncPropData(propName, defaultValues[propName]);

        this._updateAsyncProp(propName, value);

        resolvedValues[propName] = this.getAsyncProp(propName);
      }

      for (var _propName in originalValues) {
        var _value2 = originalValues[_propName];

        this._createAsyncPropData(_propName, defaultValues[_propName]);

        this._updateAsyncProp(_propName, _value2);
      }
    }
  }, {
    key: "_updateAsyncProp",
    value: function _updateAsyncProp(propName, value) {
      if (!this._didAsyncInputValueChange(propName, value)) {
        return;
      }

      if (typeof value === 'string') {
        var fetch = this.layer && this.layer.props.fetch;
        var url = value;

        if (fetch) {
          value = fetch(url, {
            propName: propName,
            layer: this.layer
          });
        }
      }

      if (value instanceof Promise) {
        this._watchPromise(propName, value);

        return;
      }

      if (isAsyncIterable(value)) {
        this._resolveAsyncIterable(propName, value);

        return;
      }

      this._setPropValue(propName, value);
    }
  }, {
    key: "_didAsyncInputValueChange",
    value: function _didAsyncInputValueChange(propName, value) {
      var asyncProp = this.asyncProps[propName];

      if (value === asyncProp.resolvedValue || value === asyncProp.lastValue) {
        return false;
      }

      asyncProp.lastValue = value;
      return true;
    }
  }, {
    key: "_setPropValue",
    value: function _setPropValue(propName, value) {
      var asyncProp = this.asyncProps[propName];
      value = this._postProcessValue(asyncProp, value);
      asyncProp.resolvedValue = value;
      asyncProp.pendingLoadCount++;
      asyncProp.resolvedLoadCount = asyncProp.pendingLoadCount;
    }
  }, {
    key: "_setAsyncPropValue",
    value: function _setAsyncPropValue(propName, value, loadCount) {
      var asyncProp = this.asyncProps[propName];

      if (asyncProp && loadCount >= asyncProp.resolvedLoadCount && value !== undefined) {
        this.freezeAsyncOldProps();
        asyncProp.resolvedValue = value;
        asyncProp.resolvedLoadCount = loadCount;
        this.onAsyncPropUpdated(propName, value);
      }
    }
  }, {
    key: "_watchPromise",
    value: function _watchPromise(propName, promise) {
      var _this = this;

      var asyncProp = this.asyncProps[propName];
      asyncProp.pendingLoadCount++;
      var loadCount = asyncProp.pendingLoadCount;
      promise.then(function (data) {
        data = _this._postProcessValue(asyncProp, data);

        _this._setAsyncPropValue(propName, data, loadCount);

        var onDataLoad = _this.layer && _this.layer.props.onDataLoad;

        if (propName === 'data' && onDataLoad) {
          onDataLoad(data, {
            propName: propName,
            layer: _this.layer
          });
        }
      })["catch"](function (error) {
        return log.error(error)();
      });
    }
  }, {
    key: "_resolveAsyncIterable",
    value: function () {
      var _resolveAsyncIterable2 = _asyncToGenerator(regenerator.mark(function _callee(propName, iterable) {
        var asyncProp, loadCount, data, count, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, _value, chunk, _ref, dataTransform, onDataLoad;

        return regenerator.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                if (propName !== 'data') {
                  this._setPropValue(propName, iterable);
                }

                asyncProp = this.asyncProps[propName];
                asyncProp.pendingLoadCount++;
                loadCount = asyncProp.pendingLoadCount;
                data = [];
                count = 0;
                _iteratorNormalCompletion = true;
                _didIteratorError = false;
                _context.prev = 8;
                _iterator = _asyncIterator(iterable);

              case 10:
                _context.next = 12;
                return _iterator.next();

              case 12:
                _step = _context.sent;
                _iteratorNormalCompletion = _step.done;
                _context.next = 16;
                return _step.value;

              case 16:
                _value = _context.sent;

                if (_iteratorNormalCompletion) {
                  _context.next = 27;
                  break;
                }

                chunk = _value;
                _ref = this.component ? this.component.props : {}, dataTransform = _ref.dataTransform;

                if (dataTransform) {
                  data = dataTransform(chunk, data);
                } else {
                  data = data.concat(chunk);
                }

                Object.defineProperty(data, '__diff', {
                  enumerable: false,
                  value: [{
                    startRow: count,
                    endRow: data.length
                  }]
                });
                count = data.length;

                this._setAsyncPropValue(propName, data, loadCount);

              case 24:
                _iteratorNormalCompletion = true;
                _context.next = 10;
                break;

              case 27:
                _context.next = 33;
                break;

              case 29:
                _context.prev = 29;
                _context.t0 = _context["catch"](8);
                _didIteratorError = true;
                _iteratorError = _context.t0;

              case 33:
                _context.prev = 33;
                _context.prev = 34;

                if (!(!_iteratorNormalCompletion && _iterator["return"] != null)) {
                  _context.next = 38;
                  break;
                }

                _context.next = 38;
                return _iterator["return"]();

              case 38:
                _context.prev = 38;

                if (!_didIteratorError) {
                  _context.next = 41;
                  break;
                }

                throw _iteratorError;

              case 41:
                return _context.finish(38);

              case 42:
                return _context.finish(33);

              case 43:
                onDataLoad = this.layer && this.layer.props.onDataLoad;

                if (onDataLoad) {
                  onDataLoad(data, {
                    propName: propName,
                    layer: this.layer
                  });
                }

              case 45:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this, [[8, 29, 33, 43], [34,, 38, 42]]);
      }));

      function _resolveAsyncIterable(_x, _x2) {
        return _resolveAsyncIterable2.apply(this, arguments);
      }

      return _resolveAsyncIterable;
    }()
  }, {
    key: "_postProcessValue",
    value: function _postProcessValue(asyncProp, value) {
      var propType = asyncProp.type;

      if (propType) {
        if (propType.release) {
          propType.release(asyncProp.resolvedValue, propType, this.component);
        }

        if (propType.transform) {
          return propType.transform(value, propType, this.component);
        }
      }

      return value;
    }
  }, {
    key: "_createAsyncPropData",
    value: function _createAsyncPropData(propName, defaultValue) {
      var asyncProp = this.asyncProps[propName];

      if (!asyncProp) {
        var propTypes = this.component && this.component.constructor._propTypes;
        this.asyncProps[propName] = {
          type: propTypes && propTypes[propName],
          lastValue: null,
          resolvedValue: defaultValue,
          pendingLoadCount: 0,
          resolvedLoadCount: 0
        };
      }
    }
  }]);

  return ComponentState;
}();

var ASYNC_ORIGINAL$2 = PROP_SYMBOLS.ASYNC_ORIGINAL,
    ASYNC_RESOLVED$2 = PROP_SYMBOLS.ASYNC_RESOLVED,
    ASYNC_DEFAULTS$2 = PROP_SYMBOLS.ASYNC_DEFAULTS;
var defaultProps = {};
var counter = 0;

var Component = function () {
  function Component() {
    _classCallCheck(this, Component);

    this.props = createProps.apply(this, arguments);
    this.id = this.props.id;
    this.count = counter++;
    this.lifecycle = LIFECYCLE.NO_STATE;
    this.parent = null;
    this.context = null;
    this.state = null;
    this.internalState = null;
    Object.seal(this);
  }

  _createClass(Component, [{
    key: "clone",
    value: function clone(newProps) {
      var props = this.props;
      var asyncProps = {};

      for (var key in props[ASYNC_DEFAULTS$2]) {
        if (key in props[ASYNC_RESOLVED$2]) {
          asyncProps[key] = props[ASYNC_RESOLVED$2][key];
        } else if (key in props[ASYNC_ORIGINAL$2]) {
          asyncProps[key] = props[ASYNC_ORIGINAL$2][key];
        }
      }

      return new this.constructor(Object.assign({}, props, asyncProps, newProps));
    }
  }, {
    key: "_initState",
    value: function _initState() {
      this.internalState = new ComponentState({});
    }
  }, {
    key: "stats",
    get: function get() {
      return this.internalState.stats;
    }
  }]);

  return Component;
}();
Component.componentName = 'Component';
Component.defaultProps = defaultProps;

function _createSuper$9(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct$9(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _isNativeReflectConstruct$9() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

var LayerState = function (_ComponentState) {
  _inherits(LayerState, _ComponentState);

  var _super = _createSuper$9(LayerState);

  function LayerState(_ref) {
    var _this;

    var attributeManager = _ref.attributeManager,
        layer = _ref.layer;

    _classCallCheck(this, LayerState);

    _this = _super.call(this, layer);
    _this.attributeManager = attributeManager;
    _this.model = null;
    _this.needsRedraw = true;
    _this.subLayers = null;
    return _this;
  }

  _createClass(LayerState, [{
    key: "layer",
    get: function get() {
      return this.component;
    },
    set: function set(layer) {
      this.component = layer;
    }
  }]);

  return LayerState;
}(ComponentState);

function _createForOfIteratorHelper$5(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray$5(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray$5(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray$5(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray$5(o, minLen); }

function _arrayLikeToArray$5(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _createSuper$a(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct$a(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _isNativeReflectConstruct$a() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }
var TRACE_CHANGE_FLAG = 'layer.changeFlag';
var TRACE_INITIALIZE = 'layer.initialize';
var TRACE_UPDATE = 'layer.update';
var TRACE_FINALIZE = 'layer.finalize';
var TRACE_MATCHED = 'layer.matched';
var MAX_PICKING_COLOR_CACHE_SIZE = Math.pow(2, 24) - 1;
var EMPTY_ARRAY$1 = Object.freeze([]);
var areViewportsEqual = memoize(function (_ref) {
  var oldViewport = _ref.oldViewport,
      viewport = _ref.viewport;
  return oldViewport.equals(viewport);
});
var pickingColorCache = new Uint8ClampedArray(0);
var defaultProps$1 = {
  data: {
    type: 'data',
    value: EMPTY_ARRAY$1,
    async: true
  },
  dataComparator: null,
  _dataDiff: {
    type: 'function',
    value: function value(data) {
      return data && data.__diff;
    },
    compare: false,
    optional: true
  },
  dataTransform: {
    type: 'function',
    value: null,
    compare: false,
    optional: true
  },
  onDataLoad: {
    type: 'function',
    value: null,
    compare: false,
    optional: true
  },
  fetch: {
    type: 'function',
    value: function value(url, _ref2) {
      var propName = _ref2.propName,
          layer = _ref2.layer;
      var resourceManager = layer.context.resourceManager;
      var loadOptions = layer.getLoadOptions();
      var inResourceManager = resourceManager.contains(url);

      if (!inResourceManager && !loadOptions) {
        resourceManager.add({
          resourceId: url,
          data: url,
          persistent: false
        });
        inResourceManager = true;
      }

      if (inResourceManager) {
        return resourceManager.subscribe({
          resourceId: url,
          onChange: function onChange(data) {
            return layer.internalState.reloadAsyncProp(propName, data);
          },
          consumerId: layer.id,
          requestId: propName
        });
      }

      return load(url, loadOptions);
    },
    compare: false
  },
  updateTriggers: {},
  visible: true,
  pickable: false,
  opacity: {
    type: 'number',
    min: 0,
    max: 1,
    value: 1
  },
  onHover: {
    type: 'function',
    value: null,
    compare: false,
    optional: true
  },
  onClick: {
    type: 'function',
    value: null,
    compare: false,
    optional: true
  },
  onDragStart: {
    type: 'function',
    value: null,
    compare: false,
    optional: true
  },
  onDrag: {
    type: 'function',
    value: null,
    compare: false,
    optional: true
  },
  onDragEnd: {
    type: 'function',
    value: null,
    compare: false,
    optional: true
  },
  coordinateSystem: COORDINATE_SYSTEM.DEFAULT,
  coordinateOrigin: {
    type: 'array',
    value: [0, 0, 0],
    compare: true
  },
  modelMatrix: {
    type: 'array',
    value: null,
    compare: true,
    optional: true
  },
  wrapLongitude: false,
  positionFormat: 'XYZ',
  colorFormat: 'RGBA',
  parameters: {},
  transitions: null,
  extensions: [],
  getPolygonOffset: {
    type: 'function',
    value: function value(_ref3) {
      var layerIndex = _ref3.layerIndex;
      return [0, -layerIndex * 100];
    },
    compare: false
  },
  highlightedObjectIndex: -1,
  autoHighlight: false,
  highlightColor: {
    type: 'accessor',
    value: [0, 0, 128, 128]
  }
};

var Layer = function (_Component) {
  _inherits(Layer, _Component);

  var _super = _createSuper$a(Layer);

  function Layer() {
    _classCallCheck(this, Layer);

    return _super.apply(this, arguments);
  }

  _createClass(Layer, [{
    key: "toString",
    value: function toString() {
      var className = this.constructor.layerName || this.constructor.name;
      return "".concat(className, "({id: '").concat(this.props.id, "'})");
    }
  }, {
    key: "setState",
    value: function setState(updateObject) {
      this.setChangeFlags({
        stateChanged: true
      });
      Object.assign(this.state, updateObject);
      this.setNeedsRedraw();
    }
  }, {
    key: "setNeedsRedraw",
    value: function setNeedsRedraw() {
      var redraw = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;

      if (this.internalState) {
        this.internalState.needsRedraw = redraw;
      }
    }
  }, {
    key: "setNeedsUpdate",
    value: function setNeedsUpdate() {
      this.context.layerManager.setNeedsUpdate(String(this));
      this.internalState.needsUpdate = true;
    }
  }, {
    key: "getNeedsRedraw",
    value: function getNeedsRedraw() {
      var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {
        clearRedrawFlags: false
      };
      return this._getNeedsRedraw(opts);
    }
  }, {
    key: "needsUpdate",
    value: function needsUpdate() {
      return this.internalState.needsUpdate || this.hasUniformTransition() || this.shouldUpdateState(this._getUpdateParams());
    }
  }, {
    key: "hasUniformTransition",
    value: function hasUniformTransition() {
      return this.internalState.uniformTransitions.active;
    }
  }, {
    key: "isPickable",
    value: function isPickable() {
      return this.props.pickable && this.props.visible;
    }
  }, {
    key: "getModels",
    value: function getModels() {
      return this.state && (this.state.models || (this.state.model ? [this.state.model] : []));
    }
  }, {
    key: "getAttributeManager",
    value: function getAttributeManager() {
      return this.internalState && this.internalState.attributeManager;
    }
  }, {
    key: "getCurrentLayer",
    value: function getCurrentLayer() {
      return this.internalState && this.internalState.layer;
    }
  }, {
    key: "getLoadOptions",
    value: function getLoadOptions() {
      return this.props.loadOptions;
    }
  }, {
    key: "project",
    value: function project(xyz) {
      var viewport = this.context.viewport;
      var worldPosition = getWorldPosition(xyz, {
        viewport: viewport,
        modelMatrix: this.props.modelMatrix,
        coordinateOrigin: this.props.coordinateOrigin,
        coordinateSystem: this.props.coordinateSystem
      });

      var _worldToPixels = worldToPixels(worldPosition, viewport.pixelProjectionMatrix),
          _worldToPixels2 = _slicedToArray(_worldToPixels, 3),
          x = _worldToPixels2[0],
          y = _worldToPixels2[1],
          z = _worldToPixels2[2];

      return xyz.length === 2 ? [x, y] : [x, y, z];
    }
  }, {
    key: "unproject",
    value: function unproject(xy) {
      var viewport = this.context.viewport;
      return viewport.unproject(xy);
    }
  }, {
    key: "projectPosition",
    value: function projectPosition$1(xyz) {
      return projectPosition(xyz, {
        viewport: this.context.viewport,
        modelMatrix: this.props.modelMatrix,
        coordinateOrigin: this.props.coordinateOrigin,
        coordinateSystem: this.props.coordinateSystem
      });
    }
  }, {
    key: "use64bitPositions",
    value: function use64bitPositions() {
      var coordinateSystem = this.props.coordinateSystem;
      return coordinateSystem === COORDINATE_SYSTEM.DEFAULT || coordinateSystem === COORDINATE_SYSTEM.LNGLAT || coordinateSystem === COORDINATE_SYSTEM.CARTESIAN;
    }
  }, {
    key: "onHover",
    value: function onHover(info, pickingEvent) {
      if (this.props.onHover) {
        return this.props.onHover(info, pickingEvent);
      }

      return false;
    }
  }, {
    key: "onClick",
    value: function onClick(info, pickingEvent) {
      if (this.props.onClick) {
        return this.props.onClick(info, pickingEvent);
      }

      return false;
    }
  }, {
    key: "nullPickingColor",
    value: function nullPickingColor() {
      return [0, 0, 0];
    }
  }, {
    key: "encodePickingColor",
    value: function encodePickingColor(i) {
      var target = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
      target[0] = i + 1 & 255;
      target[1] = i + 1 >> 8 & 255;
      target[2] = i + 1 >> 8 >> 8 & 255;
      return target;
    }
  }, {
    key: "decodePickingColor",
    value: function decodePickingColor(color) {
      assert(color instanceof Uint8Array);

      var _color = _slicedToArray(color, 3),
          i1 = _color[0],
          i2 = _color[1],
          i3 = _color[2];

      var index = i1 + i2 * 256 + i3 * 65536 - 1;
      return index;
    }
  }, {
    key: "initializeState",
    value: function initializeState() {
      throw new Error("Layer ".concat(this, " has not defined initializeState"));
    }
  }, {
    key: "getShaders",
    value: function getShaders(shaders) {
      var _iterator = _createForOfIteratorHelper$5(this.props.extensions),
          _step;

      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var extension = _step.value;
          shaders = mergeShaders(shaders, extension.getShaders.call(this, extension));
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }

      return shaders;
    }
  }, {
    key: "shouldUpdateState",
    value: function shouldUpdateState(_ref4) {
      var oldProps = _ref4.oldProps,
          props = _ref4.props,
          context = _ref4.context,
          changeFlags = _ref4.changeFlags;
      return changeFlags.propsOrDataChanged;
    }
  }, {
    key: "updateState",
    value: function updateState(_ref5) {
      var oldProps = _ref5.oldProps,
          props = _ref5.props,
          context = _ref5.context,
          changeFlags = _ref5.changeFlags;
      var attributeManager = this.getAttributeManager();

      if (changeFlags.dataChanged && attributeManager) {
        var dataChanged = changeFlags.dataChanged;

        if (Array.isArray(dataChanged)) {
          var _iterator2 = _createForOfIteratorHelper$5(dataChanged),
              _step2;

          try {
            for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
              var dataRange = _step2.value;
              attributeManager.invalidateAll(dataRange);
            }
          } catch (err) {
            _iterator2.e(err);
          } finally {
            _iterator2.f();
          }
        } else {
          attributeManager.invalidateAll();
        }
      }

      var neededPickingBuffer = oldProps.highlightedObjectIndex >= 0 || oldProps.pickable;
      var needPickingBuffer = props.highlightedObjectIndex >= 0 || props.pickable;

      if (neededPickingBuffer !== needPickingBuffer && attributeManager) {
        var _attributeManager$att = attributeManager.attributes,
            pickingColors = _attributeManager$att.pickingColors,
            instancePickingColors = _attributeManager$att.instancePickingColors;
        var pickingColorsAttribute = pickingColors || instancePickingColors;

        if (pickingColorsAttribute) {
          if (needPickingBuffer && pickingColorsAttribute.constant) {
            pickingColorsAttribute.constant = false;
            attributeManager.invalidate(pickingColorsAttribute.id);
          }

          if (!pickingColorsAttribute.value && !needPickingBuffer) {
            pickingColorsAttribute.constant = true;
            pickingColorsAttribute.value = [0, 0, 0];
          }
        }
      }
    }
  }, {
    key: "finalizeState",
    value: function finalizeState() {
      var _iterator3 = _createForOfIteratorHelper$5(this.getModels()),
          _step3;

      try {
        for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
          var model = _step3.value;
          model["delete"]();
        }
      } catch (err) {
        _iterator3.e(err);
      } finally {
        _iterator3.f();
      }

      var attributeManager = this.getAttributeManager();

      if (attributeManager) {
        attributeManager.finalize();
      }

      this.context.resourceManager.unsubscribe({
        consumerId: this.id
      });
      this.internalState.uniformTransitions.clear();
      this.internalState.finalize();
    }
  }, {
    key: "draw",
    value: function draw(opts) {
      var _iterator4 = _createForOfIteratorHelper$5(this.getModels()),
          _step4;

      try {
        for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
          var model = _step4.value;
          model.draw(opts);
        }
      } catch (err) {
        _iterator4.e(err);
      } finally {
        _iterator4.f();
      }
    }
  }, {
    key: "getPickingInfo",
    value: function getPickingInfo(_ref6) {
      var info = _ref6.info,
          mode = _ref6.mode;
      var index = info.index;

      if (index >= 0) {
        if (Array.isArray(this.props.data)) {
          info.object = this.props.data[index];
        }
      }

      return info;
    }
  }, {
    key: "activateViewport",
    value: function activateViewport(viewport) {
      var oldViewport = this.internalState.viewport;
      this.internalState.viewport = viewport;

      if (!oldViewport || !areViewportsEqual({
        oldViewport: oldViewport,
        viewport: viewport
      })) {
        this.setChangeFlags({
          viewportChanged: true
        });

        if (this.isComposite) {
          if (this.needsUpdate()) {
            this.setNeedsUpdate();
          }
        } else {
          this._update();
        }
      }
    }
  }, {
    key: "invalidateAttribute",
    value: function invalidateAttribute() {
      var name = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'all';
      var attributeManager = this.getAttributeManager();

      if (!attributeManager) {
        return;
      }

      if (name === 'all') {
        attributeManager.invalidateAll();
      } else {
        attributeManager.invalidate(name);
      }
    }
  }, {
    key: "updateAttributes",
    value: function updateAttributes(changedAttributes) {
      var _iterator5 = _createForOfIteratorHelper$5(this.getModels()),
          _step5;

      try {
        for (_iterator5.s(); !(_step5 = _iterator5.n()).done;) {
          var model = _step5.value;

          this._setModelAttributes(model, changedAttributes);
        }
      } catch (err) {
        _iterator5.e(err);
      } finally {
        _iterator5.f();
      }
    }
  }, {
    key: "_updateAttributes",
    value: function _updateAttributes(props) {
      var attributeManager = this.getAttributeManager();

      if (!attributeManager) {
        return;
      }

      var numInstances = this.getNumInstances(props);
      var startIndices = this.getStartIndices(props);
      attributeManager.update({
        data: props.data,
        numInstances: numInstances,
        startIndices: startIndices,
        props: props,
        transitions: props.transitions,
        buffers: props.data.attributes,
        context: this,
        ignoreUnknownAttributes: true
      });
      var changedAttributes = attributeManager.getChangedAttributes({
        clearChangedFlags: true
      });
      this.updateAttributes(changedAttributes);
    }
  }, {
    key: "_updateAttributeTransition",
    value: function _updateAttributeTransition() {
      var attributeManager = this.getAttributeManager();

      if (attributeManager) {
        attributeManager.updateTransition();
      }
    }
  }, {
    key: "_updateUniformTransition",
    value: function _updateUniformTransition() {
      var uniformTransitions = this.internalState.uniformTransitions;

      if (uniformTransitions.active) {
        var propsInTransition = uniformTransitions.update();
        var props = Object.create(this.props);

        for (var key in propsInTransition) {
          Object.defineProperty(props, key, {
            value: propsInTransition[key]
          });
        }

        return props;
      }

      return this.props;
    }
  }, {
    key: "calculateInstancePickingColors",
    value: function calculateInstancePickingColors(attribute, _ref7) {
      var numInstances = _ref7.numInstances;

      if (attribute.constant) {
        return;
      }

      var cacheSize = pickingColorCache.length / 3;

      if (cacheSize < numInstances) {
        if (numInstances > MAX_PICKING_COLOR_CACHE_SIZE) {
          log.warn('Layer has too many data objects. Picking might not be able to distinguish all objects.')();
        }

        pickingColorCache = defaultTypedArrayManager.allocate(pickingColorCache, numInstances, {
          size: 3,
          copy: true,
          maxCount: Math.max(numInstances, MAX_PICKING_COLOR_CACHE_SIZE)
        });
        var newCacheSize = pickingColorCache.length / 3;
        var pickingColor = [];

        for (var i = cacheSize; i < newCacheSize; i++) {
          this.encodePickingColor(i, pickingColor);
          pickingColorCache[i * 3 + 0] = pickingColor[0];
          pickingColorCache[i * 3 + 1] = pickingColor[1];
          pickingColorCache[i * 3 + 2] = pickingColor[2];
        }
      }

      attribute.value = pickingColorCache.subarray(0, numInstances * 3);
    }
  }, {
    key: "_setModelAttributes",
    value: function _setModelAttributes(model, changedAttributes) {
      var attributeManager = this.getAttributeManager();
      var excludeAttributes = model.userData.excludeAttributes || {};
      var shaderAttributes = attributeManager.getShaderAttributes(changedAttributes, excludeAttributes);
      model.setAttributes(shaderAttributes);
    }
  }, {
    key: "clearPickingColor",
    value: function clearPickingColor(color) {
      var _this$getAttributeMan = this.getAttributeManager().attributes,
          pickingColors = _this$getAttributeMan.pickingColors,
          instancePickingColors = _this$getAttributeMan.instancePickingColors;
      var colors = pickingColors || instancePickingColors;
      var i = this.decodePickingColor(color);
      var start = colors.getVertexOffset(i);
      var end = colors.getVertexOffset(i + 1);
      colors.buffer.subData({
        data: new Uint8Array(end - start),
        offset: start
      });
    }
  }, {
    key: "restorePickingColors",
    value: function restorePickingColors() {
      var _this$getAttributeMan2 = this.getAttributeManager().attributes,
          pickingColors = _this$getAttributeMan2.pickingColors,
          instancePickingColors = _this$getAttributeMan2.instancePickingColors;
      var colors = pickingColors || instancePickingColors;
      colors.updateSubBuffer({
        startOffset: 0
      });
    }
  }, {
    key: "getNumInstances",
    value: function getNumInstances(props) {
      props = props || this.props;

      if (props.numInstances !== undefined) {
        return props.numInstances;
      }

      if (this.state && this.state.numInstances !== undefined) {
        return this.state.numInstances;
      }

      return count(props.data);
    }
  }, {
    key: "getStartIndices",
    value: function getStartIndices(props) {
      props = props || this.props;

      if (props.startIndices !== undefined) {
        return props.startIndices;
      }

      if (this.state && this.state.startIndices) {
        return this.state.startIndices;
      }

      return null;
    }
  }, {
    key: "_initialize",
    value: function _initialize() {
      debug(TRACE_INITIALIZE, this);

      this._initState();

      this.initializeState(this.context);

      var _iterator6 = _createForOfIteratorHelper$5(this.props.extensions),
          _step6;

      try {
        for (_iterator6.s(); !(_step6 = _iterator6.n()).done;) {
          var extension = _step6.value;
          extension.initializeState.call(this, this.context, extension);
        }
      } catch (err) {
        _iterator6.e(err);
      } finally {
        _iterator6.f();
      }

      this.setChangeFlags({
        dataChanged: true,
        propsChanged: true,
        viewportChanged: true,
        extensionsChanged: true
      });

      this._updateState();
    }
  }, {
    key: "_update",
    value: function _update() {
      var stateNeedsUpdate = this.needsUpdate();
      debug(TRACE_UPDATE, this, stateNeedsUpdate);

      if (stateNeedsUpdate) {
        this._updateState();
      }
    }
  }, {
    key: "_updateState",
    value: function _updateState() {
      var currentProps = this.props;
      var currentViewport = this.context.viewport;

      var propsInTransition = this._updateUniformTransition();

      this.internalState.propsInTransition = propsInTransition;
      this.context.viewport = this.internalState.viewport || currentViewport;
      this.props = propsInTransition;

      var updateParams = this._getUpdateParams();

      var oldModels = this.getModels();

      if (this.context.gl) {
        this.updateState(updateParams);
      } else {
        try {
          this.updateState(updateParams);
        } catch (error) {}
      }

      var _iterator7 = _createForOfIteratorHelper$5(this.props.extensions),
          _step7;

      try {
        for (_iterator7.s(); !(_step7 = _iterator7.n()).done;) {
          var extension = _step7.value;
          extension.updateState.call(this, updateParams, extension);
        }
      } catch (err) {
        _iterator7.e(err);
      } finally {
        _iterator7.f();
      }

      var modelChanged = this.getModels()[0] !== oldModels[0];

      this._updateModules(updateParams, modelChanged);

      if (this.isComposite) {
        this._renderLayers(updateParams);
      } else {
        this.setNeedsRedraw();

        this._updateAttributes(this.props);

        if (this.state.model) {
          this.state.model.setInstanceCount(this.getNumInstances());
        }
      }

      this.context.viewport = currentViewport;
      this.props = currentProps;
      this.clearChangeFlags();
      this.internalState.needsUpdate = false;
      this.internalState.resetOldProps();
    }
  }, {
    key: "_finalize",
    value: function _finalize() {
      debug(TRACE_FINALIZE, this);
      assert(this.internalState && this.state);
      this.finalizeState(this.context);

      var _iterator8 = _createForOfIteratorHelper$5(this.props.extensions),
          _step8;

      try {
        for (_iterator8.s(); !(_step8 = _iterator8.n()).done;) {
          var extension = _step8.value;
          extension.finalizeState.call(this, extension);
        }
      } catch (err) {
        _iterator8.e(err);
      } finally {
        _iterator8.f();
      }
    }
  }, {
    key: "drawLayer",
    value: function drawLayer(_ref8) {
      var _this = this;

      var _ref8$moduleParameter = _ref8.moduleParameters,
          moduleParameters = _ref8$moduleParameter === void 0 ? null : _ref8$moduleParameter,
          _ref8$uniforms = _ref8.uniforms,
          uniforms = _ref8$uniforms === void 0 ? {} : _ref8$uniforms,
          _ref8$parameters = _ref8.parameters,
          parameters = _ref8$parameters === void 0 ? {} : _ref8$parameters;

      this._updateAttributeTransition();

      var currentProps = this.props;
      this.props = this.internalState.propsInTransition || currentProps;
      var opacity = this.props.opacity;
      uniforms.opacity = Math.pow(opacity, 1 / 2.2);

      if (moduleParameters) {
        this.setModuleParameters(moduleParameters);
      }

      var getPolygonOffset = this.props.getPolygonOffset;
      var offsets = getPolygonOffset && getPolygonOffset(uniforms) || [0, 0];
      setParameters(this.context.gl, {
        polygonOffset: offsets
      });
      withParameters(this.context.gl, parameters, function () {
        var opts = {
          moduleParameters: moduleParameters,
          uniforms: uniforms,
          parameters: parameters,
          context: _this.context
        };

        var _iterator9 = _createForOfIteratorHelper$5(_this.props.extensions),
            _step9;

        try {
          for (_iterator9.s(); !(_step9 = _iterator9.n()).done;) {
            var extension = _step9.value;
            extension.draw.call(_this, opts, extension);
          }
        } catch (err) {
          _iterator9.e(err);
        } finally {
          _iterator9.f();
        }

        _this.draw(opts);
      });
      this.props = currentProps;
    }
  }, {
    key: "getChangeFlags",
    value: function getChangeFlags() {
      return this.internalState.changeFlags;
    }
  }, {
    key: "setChangeFlags",
    value: function setChangeFlags(flags) {
      var changeFlags = this.internalState.changeFlags;

      for (var key in flags) {
        if (flags[key]) {
          var flagChanged = false;

          switch (key) {
            case 'dataChanged':
              if (Array.isArray(changeFlags[key])) {
                changeFlags[key] = Array.isArray(flags[key]) ? changeFlags[key].concat(flags[key]) : flags[key];
                flagChanged = true;
              }

            default:
              if (!changeFlags[key]) {
                changeFlags[key] = flags[key];
                flagChanged = true;
              }

          }

          if (flagChanged) {
            debug(TRACE_CHANGE_FLAG, this, key, flags);
          }
        }
      }

      var propsOrDataChanged = changeFlags.dataChanged || changeFlags.updateTriggersChanged || changeFlags.propsChanged || changeFlags.extensionsChanged;
      changeFlags.propsOrDataChanged = propsOrDataChanged;
      changeFlags.somethingChanged = propsOrDataChanged || flags.viewportChanged || flags.stateChanged;
    }
  }, {
    key: "clearChangeFlags",
    value: function clearChangeFlags() {
      this.internalState.changeFlags = {
        dataChanged: false,
        propsChanged: false,
        updateTriggersChanged: false,
        viewportChanged: false,
        stateChanged: false,
        extensionsChanged: false,
        propsOrDataChanged: false,
        somethingChanged: false
      };
    }
  }, {
    key: "diffProps",
    value: function diffProps$1(newProps, oldProps) {
      var changeFlags = diffProps(newProps, oldProps);

      if (changeFlags.updateTriggersChanged) {
        for (var key in changeFlags.updateTriggersChanged) {
          if (changeFlags.updateTriggersChanged[key]) {
            this.invalidateAttribute(key);
          }
        }
      }

      if (changeFlags.transitionsChanged) {
        for (var _key in changeFlags.transitionsChanged) {
          this.internalState.uniformTransitions.add(_key, oldProps[_key], newProps[_key], newProps.transitions[_key]);
        }
      }

      return this.setChangeFlags(changeFlags);
    }
  }, {
    key: "validateProps",
    value: function validateProps$1() {
      validateProps(this.props);
    }
  }, {
    key: "setModuleParameters",
    value: function setModuleParameters(moduleParameters) {
      var _iterator10 = _createForOfIteratorHelper$5(this.getModels()),
          _step10;

      try {
        for (_iterator10.s(); !(_step10 = _iterator10.n()).done;) {
          var model = _step10.value;
          model.updateModuleSettings(moduleParameters);
        }
      } catch (err) {
        _iterator10.e(err);
      } finally {
        _iterator10.f();
      }
    }
  }, {
    key: "_updateModules",
    value: function _updateModules(_ref9, forceUpdate) {
      var props = _ref9.props,
          oldProps = _ref9.oldProps;
      var autoHighlight = props.autoHighlight,
          highlightedObjectIndex = props.highlightedObjectIndex,
          highlightColor = props.highlightColor;

      if (forceUpdate || oldProps.autoHighlight !== autoHighlight || oldProps.highlightedObjectIndex !== highlightedObjectIndex || oldProps.highlightColor !== highlightColor) {
        var parameters = {};

        if (!autoHighlight) {
          parameters.pickingSelectedColor = null;
        }

        if (Array.isArray(highlightColor)) {
          parameters.pickingHighlightColor = highlightColor;
        }

        if (Number.isInteger(highlightedObjectIndex)) {
          parameters.pickingSelectedColor = highlightedObjectIndex >= 0 ? this.encodePickingColor(highlightedObjectIndex) : null;
        }

        this.setModuleParameters(parameters);
      }
    }
  }, {
    key: "_getUpdateParams",
    value: function _getUpdateParams() {
      return {
        props: this.props,
        oldProps: this.internalState.getOldProps(),
        context: this.context,
        changeFlags: this.internalState.changeFlags
      };
    }
  }, {
    key: "_getNeedsRedraw",
    value: function _getNeedsRedraw(opts) {
      if (!this.internalState) {
        return false;
      }

      var redraw = false;
      redraw = redraw || this.internalState.needsRedraw && this.id;
      this.internalState.needsRedraw = this.internalState.needsRedraw && !opts.clearRedrawFlags;
      var attributeManager = this.getAttributeManager();
      var attributeManagerNeedsRedraw = attributeManager && attributeManager.getNeedsRedraw(opts);
      redraw = redraw || attributeManagerNeedsRedraw;
      return redraw;
    }
  }, {
    key: "_getAttributeManager",
    value: function _getAttributeManager() {
      return new AttributeManager(this.context.gl, {
        id: this.props.id,
        stats: this.context.stats,
        timeline: this.context.timeline
      });
    }
  }, {
    key: "_initState",
    value: function _initState() {
      assert(!this.internalState && !this.state);
      assert(isFinite(this.props.coordinateSystem), "".concat(this.id, ": invalid coordinateSystem"));

      var attributeManager = this._getAttributeManager();

      if (attributeManager) {
        attributeManager.addInstanced({
          instancePickingColors: {
            type: 5121,
            size: 3,
            noAlloc: true,
            update: this.calculateInstancePickingColors
          }
        });
      }

      this.internalState = new LayerState({
        attributeManager: attributeManager,
        layer: this
      });
      this.clearChangeFlags();
      this.state = {};
      Object.defineProperty(this.state, 'attributeManager', {
        get: function get() {
          log.deprecated('layer.state.attributeManager', 'layer.getAttributeManager()');
          return attributeManager;
        }
      });
      this.internalState.layer = this;
      this.internalState.uniformTransitions = new UniformTransitionManager(this.context.timeline);
      this.internalState.onAsyncPropUpdated = this._onAsyncPropUpdated.bind(this);
      this.internalState.setAsyncProps(this.props);
    }
  }, {
    key: "_transferState",
    value: function _transferState(oldLayer) {
      debug(TRACE_MATCHED, this, this === oldLayer);
      var state = oldLayer.state,
          internalState = oldLayer.internalState;
      assert(state && internalState);

      if (this === oldLayer) {
        return;
      }

      this.internalState = internalState;
      this.internalState.layer = this;
      this.state = state;
      this.internalState.setAsyncProps(this.props);
      this.diffProps(this.props, this.internalState.getOldProps());
    }
  }, {
    key: "_onAsyncPropUpdated",
    value: function _onAsyncPropUpdated() {
      this.diffProps(this.props, this.internalState.getOldProps());
      this.setNeedsUpdate();
    }
  }, {
    key: "isLoaded",
    get: function get() {
      return this.internalState && !this.internalState.isAsyncPropLoading();
    }
  }, {
    key: "wrapLongitude",
    get: function get() {
      return this.props.wrapLongitude;
    }
  }]);

  return Layer;
}(Component);
Layer.layerName = 'Layer';
Layer.defaultProps = defaultProps$1;

export { COORDINATE_SYSTEM as C, EVENTS as E, Layer as L, Matrix4 as M, PROJECTION_MODE as P, Transition as T, Vector as V, WebMercatorViewport as W, checkNumber as a, clamp as b, config as c, debug as d, Viewport as e, flatten as f, assert as g, equals as h, isArray as i, getAccessorFromBuffer as j, createIterable as k, lerp as l, mod$1 as m, defaultTypedArrayManager as n, getUniformsFromViewport as o, log as p, mod as q, register as r, Vector3 as s, memoize as t, pixelsToWorld as u, vec2_transformMat4AsVector as v, LIFECYCLE as w, WebMercatorViewport$1 as x };
