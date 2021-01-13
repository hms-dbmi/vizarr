import { c as createCommonjsModule } from '../common/_commonjsHelpers-37fa8da4.js';
import { a5 as Stats, _ as _inherits, a as _getPrototypeOf, b as _possibleConstructorReturn, h as _wrapNativeSuper, a6 as ARRAY_TYPE, q as fromQuat$1, s as frustum, u as lookAt, v as ortho, w as perspective, x as determinant$1, y as transpose$1, z as invert$2, m as multiply$2, A as rotateX$1, B as rotateY$1, C as rotateZ$1, D as rotate$1, E as scale$2, F as translate$1, g as transformMat4, n as transformMat4$1, t as transformMat4$2, a7 as create$2, a8 as fromValues, a9 as dot$1, j as cross, aa as len, ab as normalize$2, ac as add$2, G as scale$3, ad as dot$2, ae as lerp$3, af as length$1, ag as squaredLength$1, ah as normalize$3, ai as EPSILON$1, L as Log, i as angle, r as rotateX$2, k as rotateY$2, l as rotateZ$2, o as transformMat3, p as transformQuat, c as transformMat3$1, aj as transformQuat$1, H as lerp$4, I as negate, J as equals$2, K as add$3, M as negate$1, N as sub, O as Buffer, P as hasFeature, Q as FEATURES, f as _get, T as Transform, R as readPixelsToArray, S as Texture2D, U as Framebuffer, V as _asyncToGenerator, W as regenerator, X as _asyncIterator, Y as setParameters, Z as withParameters, $ as load, a1 as Model, a0 as hasFeatures, ak as getScaling, al as isWebGL2 } from '../common/transform-35a4c5f8.js';
import '../common/process-2545f00a.js';
import { _ as _typeof } from '../common/typeof-c65245d2.js';
import { _ as _defineProperty } from '../common/defineProperty-1b0b77a2.js';
import { _ as _classCallCheck } from '../common/classCallCheck-4eda545c.js';
import { _ as _createClass, a as _toConsumableArray, b as _assertThisInitialized } from '../common/assertThisInitialized-87ceda02.js';
import '../common/_node-resolve:empty-0f7f843d.js';
import { _ as _slicedToArray } from '../common/slicedToArray-14e71088.js';
import { f as fp32 } from '../common/fp32-cb4e18c9.js';
import { p as picking$1, G as Geometry, e as earcut_1, g as gouraudLighting } from '../common/earcut-60cbfb1d.js';
import '../common/index-aae33e1a.js';
import { B as BoundsCheckError, K as KeyError, H as HTTPError } from '../common/zarr.es6-11baea90.js';

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }
var STAT_QUEUED_REQUESTS = 'Queued Requests';
var STAT_ACTIVE_REQUESTS = 'Active Requests';
var STAT_CANCELLED_REQUESTS = 'Cancelled Requests';
var STAT_QUEUED_REQUESTS_EVER = 'Queued Requests Ever';
var STAT_ACTIVE_REQUESTS_EVER = 'Active Requests Ever';
var DEFAULT_PROPS = {
  id: 'request-scheduler',
  throttleRequests: true,
  maxRequests: 6
};

var RequestScheduler = function () {
  function RequestScheduler() {
    var props = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, RequestScheduler);

    this.props = _objectSpread(_objectSpread({}, DEFAULT_PROPS), props);
    this.requestQueue = [];
    this.activeRequestCount = 0;
    this.requestMap = new Map();
    this.stats = new Stats({
      id: props.id
    });
    this.stats.get(STAT_QUEUED_REQUESTS);
    this.stats.get(STAT_ACTIVE_REQUESTS);
    this.stats.get(STAT_CANCELLED_REQUESTS);
    this.stats.get(STAT_QUEUED_REQUESTS_EVER);
    this.stats.get(STAT_ACTIVE_REQUESTS_EVER);
    this._deferredUpdate = null;
  }

  _createClass(RequestScheduler, [{
    key: "scheduleRequest",
    value: function scheduleRequest(handle) {
      var getPriority = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : function () {
        return 0;
      };

      if (!this.props.throttleRequests) {
        return Promise.resolve({
          done: function done() {}
        });
      }

      if (this.requestMap.has(handle)) {
        return this.requestMap.get(handle);
      }

      var request = {
        handle: handle,
        getPriority: getPriority
      };
      var promise = new Promise(function (resolve) {
        request.resolve = resolve;
        return request;
      });
      this.requestQueue.push(request);
      this.requestMap.set(handle, promise);

      this._issueNewRequests();

      return promise;
    }
  }, {
    key: "_issueRequest",
    value: function _issueRequest(request) {
      var _this = this;

      var handle = request.handle,
          resolve = request.resolve;
      var isDone = false;

      var done = function done() {
        if (!isDone) {
          isDone = true;

          _this.requestMap["delete"](handle);

          _this.activeRequestCount--;

          _this._issueNewRequests();
        }
      };

      this.activeRequestCount++;
      return resolve ? resolve({
        done: done
      }) : Promise.resolve({
        done: done
      });
    }
  }, {
    key: "_issueNewRequests",
    value: function _issueNewRequests() {
      var _this2 = this;

      if (!this._deferredUpdate) {
        this._deferredUpdate = setTimeout(function () {
          return _this2._issueNewRequestsAsync();
        }, 0);
      }
    }
  }, {
    key: "_issueNewRequestsAsync",
    value: function _issueNewRequestsAsync() {
      this._deferredUpdate = null;
      var freeSlots = Math.max(this.props.maxRequests - this.activeRequestCount, 0);

      if (freeSlots === 0) {
        return;
      }

      this._updateAllRequests();

      for (var i = 0; i < freeSlots; ++i) {
        if (this.requestQueue.length > 0) {
          var request = this.requestQueue.shift();

          this._issueRequest(request);
        }
      }
    }
  }, {
    key: "_updateAllRequests",
    value: function _updateAllRequests() {
      var requestQueue = this.requestQueue;

      for (var i = 0; i < requestQueue.length; ++i) {
        var request = requestQueue[i];

        if (!this._updateRequest(request)) {
          requestQueue.splice(i, 1);
          this.requestMap["delete"](request.handle);
          i--;
        }
      }

      requestQueue.sort(function (a, b) {
        return a.priority - b.priority;
      });
    }
  }, {
    key: "_updateRequest",
    value: function _updateRequest(request) {
      request.priority = request.getPriority(request.handle);

      if (request.priority < 0) {
        request.resolve(null);
        return false;
      }

      return true;
    }
  }]);

  return RequestScheduler;
}();

function assert(condition, message) {
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
      assert(false);
      return 0;
    }
  }, {
    key: "RANK",
    get: function get() {
      assert(false);
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
var map = {};
function deprecated(method, version) {
  if (!map[method]) {
    map[method] = true;
    console.warn("".concat(method, " has been removed in version ").concat(version, ", see upgrade guide for more information"));
  }
}

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

function _createSuper$1(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct$1(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _isNativeReflectConstruct$1() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

var Matrix = function (_MathArray) {
  _inherits(Matrix, _MathArray);

  var _super = _createSuper$1(Matrix);

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

/**
 * 3x3 Matrix
 * @module mat3
 */

/**
 * Creates a new identity mat3
 *
 * @returns {mat3} a new 3x3 matrix
 */

function create() {
  var out = new ARRAY_TYPE(9);

  if (ARRAY_TYPE != Float32Array) {
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[5] = 0;
    out[6] = 0;
    out[7] = 0;
  }

  out[0] = 1;
  out[4] = 1;
  out[8] = 1;
  return out;
}
/**
 * Transpose the values of a mat3
 *
 * @param {mat3} out the receiving matrix
 * @param {ReadonlyMat3} a the source matrix
 * @returns {mat3} out
 */

function transpose(out, a) {
  // If we are transposing ourselves we can skip a few steps but have to cache some values
  if (out === a) {
    var a01 = a[1],
        a02 = a[2],
        a12 = a[5];
    out[1] = a[3];
    out[2] = a[6];
    out[3] = a01;
    out[5] = a[7];
    out[6] = a02;
    out[7] = a12;
  } else {
    out[0] = a[0];
    out[1] = a[3];
    out[2] = a[6];
    out[3] = a[1];
    out[4] = a[4];
    out[5] = a[7];
    out[6] = a[2];
    out[7] = a[5];
    out[8] = a[8];
  }

  return out;
}
/**
 * Inverts a mat3
 *
 * @param {mat3} out the receiving matrix
 * @param {ReadonlyMat3} a the source matrix
 * @returns {mat3} out
 */

function invert(out, a) {
  var a00 = a[0],
      a01 = a[1],
      a02 = a[2];
  var a10 = a[3],
      a11 = a[4],
      a12 = a[5];
  var a20 = a[6],
      a21 = a[7],
      a22 = a[8];
  var b01 = a22 * a11 - a12 * a21;
  var b11 = -a22 * a10 + a12 * a20;
  var b21 = a21 * a10 - a11 * a20; // Calculate the determinant

  var det = a00 * b01 + a01 * b11 + a02 * b21;

  if (!det) {
    return null;
  }

  det = 1.0 / det;
  out[0] = b01 * det;
  out[1] = (-a22 * a01 + a02 * a21) * det;
  out[2] = (a12 * a01 - a02 * a11) * det;
  out[3] = b11 * det;
  out[4] = (a22 * a00 - a02 * a20) * det;
  out[5] = (-a12 * a00 + a02 * a10) * det;
  out[6] = b21 * det;
  out[7] = (-a21 * a00 + a01 * a20) * det;
  out[8] = (a11 * a00 - a01 * a10) * det;
  return out;
}
/**
 * Calculates the determinant of a mat3
 *
 * @param {ReadonlyMat3} a the source matrix
 * @returns {Number} determinant of a
 */

function determinant(a) {
  var a00 = a[0],
      a01 = a[1],
      a02 = a[2];
  var a10 = a[3],
      a11 = a[4],
      a12 = a[5];
  var a20 = a[6],
      a21 = a[7],
      a22 = a[8];
  return a00 * (a22 * a11 - a12 * a21) + a01 * (-a22 * a10 + a12 * a20) + a02 * (a21 * a10 - a11 * a20);
}
/**
 * Multiplies two mat3's
 *
 * @param {mat3} out the receiving matrix
 * @param {ReadonlyMat3} a the first operand
 * @param {ReadonlyMat3} b the second operand
 * @returns {mat3} out
 */

function multiply(out, a, b) {
  var a00 = a[0],
      a01 = a[1],
      a02 = a[2];
  var a10 = a[3],
      a11 = a[4],
      a12 = a[5];
  var a20 = a[6],
      a21 = a[7],
      a22 = a[8];
  var b00 = b[0],
      b01 = b[1],
      b02 = b[2];
  var b10 = b[3],
      b11 = b[4],
      b12 = b[5];
  var b20 = b[6],
      b21 = b[7],
      b22 = b[8];
  out[0] = b00 * a00 + b01 * a10 + b02 * a20;
  out[1] = b00 * a01 + b01 * a11 + b02 * a21;
  out[2] = b00 * a02 + b01 * a12 + b02 * a22;
  out[3] = b10 * a00 + b11 * a10 + b12 * a20;
  out[4] = b10 * a01 + b11 * a11 + b12 * a21;
  out[5] = b10 * a02 + b11 * a12 + b12 * a22;
  out[6] = b20 * a00 + b21 * a10 + b22 * a20;
  out[7] = b20 * a01 + b21 * a11 + b22 * a21;
  out[8] = b20 * a02 + b21 * a12 + b22 * a22;
  return out;
}
/**
 * Translate a mat3 by the given vector
 *
 * @param {mat3} out the receiving matrix
 * @param {ReadonlyMat3} a the matrix to translate
 * @param {ReadonlyVec2} v vector to translate by
 * @returns {mat3} out
 */

function translate(out, a, v) {
  var a00 = a[0],
      a01 = a[1],
      a02 = a[2],
      a10 = a[3],
      a11 = a[4],
      a12 = a[5],
      a20 = a[6],
      a21 = a[7],
      a22 = a[8],
      x = v[0],
      y = v[1];
  out[0] = a00;
  out[1] = a01;
  out[2] = a02;
  out[3] = a10;
  out[4] = a11;
  out[5] = a12;
  out[6] = x * a00 + y * a10 + a20;
  out[7] = x * a01 + y * a11 + a21;
  out[8] = x * a02 + y * a12 + a22;
  return out;
}
/**
 * Rotates a mat3 by the given angle
 *
 * @param {mat3} out the receiving matrix
 * @param {ReadonlyMat3} a the matrix to rotate
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat3} out
 */

function rotate(out, a, rad) {
  var a00 = a[0],
      a01 = a[1],
      a02 = a[2],
      a10 = a[3],
      a11 = a[4],
      a12 = a[5],
      a20 = a[6],
      a21 = a[7],
      a22 = a[8],
      s = Math.sin(rad),
      c = Math.cos(rad);
  out[0] = c * a00 + s * a10;
  out[1] = c * a01 + s * a11;
  out[2] = c * a02 + s * a12;
  out[3] = c * a10 - s * a00;
  out[4] = c * a11 - s * a01;
  out[5] = c * a12 - s * a02;
  out[6] = a20;
  out[7] = a21;
  out[8] = a22;
  return out;
}
/**
 * Scales the mat3 by the dimensions in the given vec2
 *
 * @param {mat3} out the receiving matrix
 * @param {ReadonlyMat3} a the matrix to rotate
 * @param {ReadonlyVec2} v the vec2 to scale the matrix by
 * @returns {mat3} out
 **/

function scale(out, a, v) {
  var x = v[0],
      y = v[1];
  out[0] = x * a[0];
  out[1] = x * a[1];
  out[2] = x * a[2];
  out[3] = y * a[3];
  out[4] = y * a[4];
  out[5] = y * a[5];
  out[6] = a[6];
  out[7] = a[7];
  out[8] = a[8];
  return out;
}
/**
 * Calculates a 3x3 matrix from the given quaternion
 *
 * @param {mat3} out mat3 receiving operation result
 * @param {ReadonlyQuat} q Quaternion to create matrix from
 *
 * @returns {mat3} out
 */

function fromQuat(out, q) {
  var x = q[0],
      y = q[1],
      z = q[2],
      w = q[3];
  var x2 = x + x;
  var y2 = y + y;
  var z2 = z + z;
  var xx = x * x2;
  var yx = y * x2;
  var yy = y * y2;
  var zx = z * x2;
  var zy = z * y2;
  var zz = z * z2;
  var wx = w * x2;
  var wy = w * y2;
  var wz = w * z2;
  out[0] = 1 - yy - zz;
  out[3] = yx - wz;
  out[6] = zx + wy;
  out[1] = yx + wz;
  out[4] = 1 - xx - zz;
  out[7] = zy - wx;
  out[2] = zx - wy;
  out[5] = zy + wx;
  out[8] = 1 - xx - yy;
  return out;
}

function _createSuper$2(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct$2(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _isNativeReflectConstruct$2() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }
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
var constants = {};

var Matrix4 = function (_Matrix) {
  _inherits(Matrix4, _Matrix);

  var _super = _createSuper$2(Matrix4);

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
      constants.IDENTITY = constants.IDENTITY || Object.freeze(new Matrix4(IDENTITY));
      return constants.IDENTITY;
    }
  }, {
    key: "ZERO",
    get: function get() {
      constants.ZERO = constants.ZERO || Object.freeze(new Matrix4(ZERO));
      return constants.ZERO;
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
      fromQuat$1(this, q);
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
    value: function determinant() {
      return determinant$1(this);
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
    value: function transpose() {
      transpose$1(this, this);
      return this.check();
    }
  }, {
    key: "invert",
    value: function invert() {
      invert$2(this, this);
      return this.check();
    }
  }, {
    key: "multiplyLeft",
    value: function multiplyLeft(a) {
      multiply$2(this, a, this);
      return this.check();
    }
  }, {
    key: "multiplyRight",
    value: function multiplyRight(a) {
      multiply$2(this, this, a);
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
      rotate$1(this, this, radians, axis);
      return this.check();
    }
  }, {
    key: "scale",
    value: function scale(factor) {
      if (Array.isArray(factor)) {
        scale$2(this, this, factor);
      } else {
        scale$2(this, this, [factor, factor, factor]);
      }

      return this.check();
    }
  }, {
    key: "translate",
    value: function translate(vec) {
      translate$1(this, this, vec);
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

/**
 * Quaternion
 * @module quat
 */

/**
 * Creates a new identity quat
 *
 * @returns {quat} a new quaternion
 */

function create$1() {
  var out = new ARRAY_TYPE(4);

  if (ARRAY_TYPE != Float32Array) {
    out[0] = 0;
    out[1] = 0;
    out[2] = 0;
  }

  out[3] = 1;
  return out;
}
/**
 * Set a quat to the identity quaternion
 *
 * @param {quat} out the receiving quaternion
 * @returns {quat} out
 */

function identity(out) {
  out[0] = 0;
  out[1] = 0;
  out[2] = 0;
  out[3] = 1;
  return out;
}
/**
 * Sets a quat from the given angle and rotation axis,
 * then returns it.
 *
 * @param {quat} out the receiving quaternion
 * @param {ReadonlyVec3} axis the axis around which to rotate
 * @param {Number} rad the angle in radians
 * @returns {quat} out
 **/

function setAxisAngle(out, axis, rad) {
  rad = rad * 0.5;
  var s = Math.sin(rad);
  out[0] = s * axis[0];
  out[1] = s * axis[1];
  out[2] = s * axis[2];
  out[3] = Math.cos(rad);
  return out;
}
/**
 * Multiplies two quat's
 *
 * @param {quat} out the receiving quaternion
 * @param {ReadonlyQuat} a the first operand
 * @param {ReadonlyQuat} b the second operand
 * @returns {quat} out
 */

function multiply$1(out, a, b) {
  var ax = a[0],
      ay = a[1],
      az = a[2],
      aw = a[3];
  var bx = b[0],
      by = b[1],
      bz = b[2],
      bw = b[3];
  out[0] = ax * bw + aw * bx + ay * bz - az * by;
  out[1] = ay * bw + aw * by + az * bx - ax * bz;
  out[2] = az * bw + aw * bz + ax * by - ay * bx;
  out[3] = aw * bw - ax * bx - ay * by - az * bz;
  return out;
}
/**
 * Rotates a quaternion by the given angle about the X axis
 *
 * @param {quat} out quat receiving operation result
 * @param {ReadonlyQuat} a quat to rotate
 * @param {number} rad angle (in radians) to rotate
 * @returns {quat} out
 */

function rotateX(out, a, rad) {
  rad *= 0.5;
  var ax = a[0],
      ay = a[1],
      az = a[2],
      aw = a[3];
  var bx = Math.sin(rad),
      bw = Math.cos(rad);
  out[0] = ax * bw + aw * bx;
  out[1] = ay * bw + az * bx;
  out[2] = az * bw - ay * bx;
  out[3] = aw * bw - ax * bx;
  return out;
}
/**
 * Rotates a quaternion by the given angle about the Y axis
 *
 * @param {quat} out quat receiving operation result
 * @param {ReadonlyQuat} a quat to rotate
 * @param {number} rad angle (in radians) to rotate
 * @returns {quat} out
 */

function rotateY(out, a, rad) {
  rad *= 0.5;
  var ax = a[0],
      ay = a[1],
      az = a[2],
      aw = a[3];
  var by = Math.sin(rad),
      bw = Math.cos(rad);
  out[0] = ax * bw - az * by;
  out[1] = ay * bw + aw * by;
  out[2] = az * bw + ax * by;
  out[3] = aw * bw - ay * by;
  return out;
}
/**
 * Rotates a quaternion by the given angle about the Z axis
 *
 * @param {quat} out quat receiving operation result
 * @param {ReadonlyQuat} a quat to rotate
 * @param {number} rad angle (in radians) to rotate
 * @returns {quat} out
 */

function rotateZ(out, a, rad) {
  rad *= 0.5;
  var ax = a[0],
      ay = a[1],
      az = a[2],
      aw = a[3];
  var bz = Math.sin(rad),
      bw = Math.cos(rad);
  out[0] = ax * bw + ay * bz;
  out[1] = ay * bw - ax * bz;
  out[2] = az * bw + aw * bz;
  out[3] = aw * bw - az * bz;
  return out;
}
/**
 * Calculates the W component of a quat from the X, Y, and Z components.
 * Assumes that quaternion is 1 unit in length.
 * Any existing W component will be ignored.
 *
 * @param {quat} out the receiving quaternion
 * @param {ReadonlyQuat} a quat to calculate W component of
 * @returns {quat} out
 */

function calculateW(out, a) {
  var x = a[0],
      y = a[1],
      z = a[2];
  out[0] = x;
  out[1] = y;
  out[2] = z;
  out[3] = Math.sqrt(Math.abs(1.0 - x * x - y * y - z * z));
  return out;
}
/**
 * Performs a spherical linear interpolation between two quat
 *
 * @param {quat} out the receiving quaternion
 * @param {ReadonlyQuat} a the first operand
 * @param {ReadonlyQuat} b the second operand
 * @param {Number} t interpolation amount, in the range [0-1], between the two inputs
 * @returns {quat} out
 */

function slerp(out, a, b, t) {
  // benchmarks:
  //    http://jsperf.com/quaternion-slerp-implementations
  var ax = a[0],
      ay = a[1],
      az = a[2],
      aw = a[3];
  var bx = b[0],
      by = b[1],
      bz = b[2],
      bw = b[3];
  var omega, cosom, sinom, scale0, scale1; // calc cosine

  cosom = ax * bx + ay * by + az * bz + aw * bw; // adjust signs (if necessary)

  if (cosom < 0.0) {
    cosom = -cosom;
    bx = -bx;
    by = -by;
    bz = -bz;
    bw = -bw;
  } // calculate coefficients


  if (1.0 - cosom > EPSILON$1) {
    // standard case (slerp)
    omega = Math.acos(cosom);
    sinom = Math.sin(omega);
    scale0 = Math.sin((1.0 - t) * omega) / sinom;
    scale1 = Math.sin(t * omega) / sinom;
  } else {
    // "from" and "to" quaternions are very close
    //  ... so we can do a linear interpolation
    scale0 = 1.0 - t;
    scale1 = t;
  } // calculate final values


  out[0] = scale0 * ax + scale1 * bx;
  out[1] = scale0 * ay + scale1 * by;
  out[2] = scale0 * az + scale1 * bz;
  out[3] = scale0 * aw + scale1 * bw;
  return out;
}
/**
 * Calculates the inverse of a quat
 *
 * @param {quat} out the receiving quaternion
 * @param {ReadonlyQuat} a quat to calculate inverse of
 * @returns {quat} out
 */

function invert$1(out, a) {
  var a0 = a[0],
      a1 = a[1],
      a2 = a[2],
      a3 = a[3];
  var dot = a0 * a0 + a1 * a1 + a2 * a2 + a3 * a3;
  var invDot = dot ? 1.0 / dot : 0; // TODO: Would be faster to return [0,0,0,0] immediately if dot == 0

  out[0] = -a0 * invDot;
  out[1] = -a1 * invDot;
  out[2] = -a2 * invDot;
  out[3] = a3 * invDot;
  return out;
}
/**
 * Calculates the conjugate of a quat
 * If the quaternion is normalized, this function is faster than quat.inverse and produces the same result.
 *
 * @param {quat} out the receiving quaternion
 * @param {ReadonlyQuat} a quat to calculate conjugate of
 * @returns {quat} out
 */

function conjugate(out, a) {
  out[0] = -a[0];
  out[1] = -a[1];
  out[2] = -a[2];
  out[3] = a[3];
  return out;
}
/**
 * Creates a quaternion from the given 3x3 rotation matrix.
 *
 * NOTE: The resultant quaternion is not normalized, so you should be sure
 * to renormalize the quaternion yourself where necessary.
 *
 * @param {quat} out the receiving quaternion
 * @param {ReadonlyMat3} m rotation matrix
 * @returns {quat} out
 * @function
 */

function fromMat3(out, m) {
  // Algorithm in Ken Shoemake's article in 1987 SIGGRAPH course notes
  // article "Quaternion Calculus and Fast Animation".
  var fTrace = m[0] + m[4] + m[8];
  var fRoot;

  if (fTrace > 0.0) {
    // |w| > 1/2, may as well choose w > 1/2
    fRoot = Math.sqrt(fTrace + 1.0); // 2w

    out[3] = 0.5 * fRoot;
    fRoot = 0.5 / fRoot; // 1/(4w)

    out[0] = (m[5] - m[7]) * fRoot;
    out[1] = (m[6] - m[2]) * fRoot;
    out[2] = (m[1] - m[3]) * fRoot;
  } else {
    // |w| <= 1/2
    var i = 0;
    if (m[4] > m[0]) i = 1;
    if (m[8] > m[i * 3 + i]) i = 2;
    var j = (i + 1) % 3;
    var k = (i + 2) % 3;
    fRoot = Math.sqrt(m[i * 3 + i] - m[j * 3 + j] - m[k * 3 + k] + 1.0);
    out[i] = 0.5 * fRoot;
    fRoot = 0.5 / fRoot;
    out[3] = (m[j * 3 + k] - m[k * 3 + j]) * fRoot;
    out[j] = (m[j * 3 + i] + m[i * 3 + j]) * fRoot;
    out[k] = (m[k * 3 + i] + m[i * 3 + k]) * fRoot;
  }

  return out;
}
/**
 * Adds two quat's
 *
 * @param {quat} out the receiving quaternion
 * @param {ReadonlyQuat} a the first operand
 * @param {ReadonlyQuat} b the second operand
 * @returns {quat} out
 * @function
 */

var add = add$2;
/**
 * Scales a quat by a scalar number
 *
 * @param {quat} out the receiving vector
 * @param {ReadonlyQuat} a the vector to scale
 * @param {Number} b amount to scale the vector by
 * @returns {quat} out
 * @function
 */

var scale$1 = scale$3;
/**
 * Calculates the dot product of two quat's
 *
 * @param {ReadonlyQuat} a the first operand
 * @param {ReadonlyQuat} b the second operand
 * @returns {Number} dot product of a and b
 * @function
 */

var dot = dot$2;
/**
 * Performs a linear interpolation between two quat's
 *
 * @param {quat} out the receiving quaternion
 * @param {ReadonlyQuat} a the first operand
 * @param {ReadonlyQuat} b the second operand
 * @param {Number} t interpolation amount, in the range [0-1], between the two inputs
 * @returns {quat} out
 * @function
 */

var lerp$1 = lerp$3;
/**
 * Calculates the length of a quat
 *
 * @param {ReadonlyQuat} a vector to calculate length of
 * @returns {Number} length of a
 */

var length = length$1;
/**
 * Calculates the squared length of a quat
 *
 * @param {ReadonlyQuat} a vector to calculate squared length of
 * @returns {Number} squared length of a
 * @function
 */

var squaredLength = squaredLength$1;
/**
 * Normalize a quat
 *
 * @param {quat} out the receiving quaternion
 * @param {ReadonlyQuat} a quaternion to normalize
 * @returns {quat} out
 * @function
 */

var normalize = normalize$3;
/**
 * Sets a quaternion to represent the shortest rotation from one
 * vector to another.
 *
 * Both vectors are assumed to be unit length.
 *
 * @param {quat} out the receiving quaternion.
 * @param {ReadonlyVec3} a the initial vector
 * @param {ReadonlyVec3} b the destination vector
 * @returns {quat} out
 */

var rotationTo = function () {
  var tmpvec3 = create$2();
  var xUnitVec3 = fromValues(1, 0, 0);
  var yUnitVec3 = fromValues(0, 1, 0);
  return function (out, a, b) {
    var dot = dot$1(a, b);

    if (dot < -0.999999) {
      cross(tmpvec3, xUnitVec3, a);
      if (len(tmpvec3) < 0.000001) cross(tmpvec3, yUnitVec3, a);
      normalize$2(tmpvec3, tmpvec3);
      setAxisAngle(out, tmpvec3, Math.PI);
      return out;
    } else if (dot > 0.999999) {
      out[0] = 0;
      out[1] = 0;
      out[2] = 0;
      out[3] = 1;
      return out;
    } else {
      cross(tmpvec3, a, b);
      out[0] = tmpvec3[0];
      out[1] = tmpvec3[1];
      out[2] = tmpvec3[2];
      out[3] = 1 + dot;
      return normalize(out, out);
    }
  };
}();
/**
 * Performs a spherical linear interpolation with two control points
 *
 * @param {quat} out the receiving quaternion
 * @param {ReadonlyQuat} a the first operand
 * @param {ReadonlyQuat} b the second operand
 * @param {ReadonlyQuat} c the third operand
 * @param {ReadonlyQuat} d the fourth operand
 * @param {Number} t interpolation amount, in the range [0-1], between the two inputs
 * @returns {quat} out
 */

var sqlerp = function () {
  var temp1 = create$1();
  var temp2 = create$1();
  return function (out, a, b, c, d, t) {
    slerp(temp1, a, d, t);
    slerp(temp2, b, c, t);
    slerp(out, temp1, temp2, 2 * t * (1 - t));
    return out;
  };
}();
/**
 * Sets the specified quaternion with values corresponding to the given
 * axes. Each axis is a vec3 and is expected to be unit length and
 * perpendicular to all other specified axes.
 *
 * @param {ReadonlyVec3} view  the vector representing the viewing direction
 * @param {ReadonlyVec3} right the vector representing the local "right" direction
 * @param {ReadonlyVec3} up    the vector representing the local "up" direction
 * @returns {quat} out
 */

var setAxes = function () {
  var matr = create();
  return function (out, view, right, up) {
    matr[0] = right[0];
    matr[3] = right[1];
    matr[6] = right[2];
    matr[1] = up[0];
    matr[4] = up[1];
    matr[7] = up[2];
    matr[2] = -view[0];
    matr[5] = -view[1];
    matr[8] = -view[2];
    return normalize(out, fromMat3(out, matr));
  };
}();

var log = new Log({
  id: 'deck'
});

var loggers = {};
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

var COORDINATE_SYSTEM_GLSL_CONSTANTS = Object.keys(COORDINATE_SYSTEM).map(function (key) {
  return "const int COORDINATE_SYSTEM_".concat(key, " = ").concat(COORDINATE_SYSTEM[key], ";");
}).join('');
var PROJECTION_MODE_GLSL_CONSTANTS = Object.keys(PROJECTION_MODE).map(function (key) {
  return "const int PROJECTION_MODE_".concat(key, " = ").concat(PROJECTION_MODE[key], ";");
}).join('');
var projectShader = "".concat(COORDINATE_SYSTEM_GLSL_CONSTANTS, "\n").concat(PROJECTION_MODE_GLSL_CONSTANTS, "\n\nuniform int project_uCoordinateSystem;\nuniform int project_uProjectionMode;\nuniform float project_uScale;\nuniform bool project_uWrapLongitude;\nuniform vec3 project_uCommonUnitsPerMeter;\nuniform vec3 project_uCommonUnitsPerWorldUnit;\nuniform vec3 project_uCommonUnitsPerWorldUnit2;\nuniform vec4 project_uCenter;\nuniform mat4 project_uModelMatrix;\nuniform mat4 project_uViewProjectionMatrix;\nuniform vec2 project_uViewportSize;\nuniform float project_uDevicePixelRatio;\nuniform float project_uFocalDistance;\nuniform vec3 project_uCameraPosition;\nuniform vec3 project_uCoordinateOrigin;\n\nconst float TILE_SIZE = 512.0;\nconst float PI = 3.1415926536;\nconst float WORLD_SCALE = TILE_SIZE / (PI * 2.0);\nconst vec3 ZERO_64_LOW = vec3(0.0);\nconst float EARTH_RADIUS = 6370972.0;\nconst float GLOBE_RADIUS = 256.0;\nfloat project_size(float meters) {\n  return meters * project_uCommonUnitsPerMeter.z;\n}\n\nvec2 project_size(vec2 meters) {\n  return meters * project_uCommonUnitsPerMeter.xy;\n}\n\nvec3 project_size(vec3 meters) {\n  return meters * project_uCommonUnitsPerMeter;\n}\n\nvec4 project_size(vec4 meters) {\n  return vec4(meters.xyz * project_uCommonUnitsPerMeter, meters.w);\n}\nvec3 project_normal(vec3 vector) {\n  vec4 normal_modelspace = project_uModelMatrix * vec4(vector, 0.0);\n  return normalize(normal_modelspace.xyz * project_uCommonUnitsPerMeter);\n}\n\nvec4 project_offset_(vec4 offset) {\n  float dy = offset.y;\n  if (project_uCoordinateSystem == COORDINATE_SYSTEM_LNGLAT) {\n    dy = clamp(dy, -1., 1.);\n  }\n  vec3 commonUnitsPerWorldUnit = project_uCommonUnitsPerWorldUnit + project_uCommonUnitsPerWorldUnit2 * dy;\n  return vec4(offset.xyz * commonUnitsPerWorldUnit, offset.w);\n}\nvec2 project_mercator_(vec2 lnglat) {\n  float x = lnglat.x;\n  if (project_uWrapLongitude) {\n    x = mod(x + 180., 360.0) - 180.;\n  }\n  float y = clamp(lnglat.y, -89.9, 89.9);\n  return vec2(\n    radians(x) + PI,\n    PI + log(tan_fp32(PI * 0.25 + radians(y) * 0.5))\n  );\n}\n\nvec3 project_globe_(vec3 lnglatz) {\n  float lambda = radians(lnglatz.x);\n  float phi = radians(lnglatz.y);\n  float cosPhi = cos(phi);\n  float D = (lnglatz.z / EARTH_RADIUS + 1.0) * GLOBE_RADIUS;\n\n  return vec3(\n    sin(lambda) * cosPhi,\n    -cos(lambda) * cosPhi,\n    sin(phi)\n  ) * D;\n}\nvec4 project_position(vec4 position, vec3 position64Low) {\n  vec4 position_world = project_uModelMatrix * position;\n  if (project_uProjectionMode == PROJECTION_MODE_WEB_MERCATOR) {\n    if (project_uCoordinateSystem == COORDINATE_SYSTEM_LNGLAT) {\n      return vec4(\n        project_mercator_(position_world.xy) * WORLD_SCALE,\n        project_size(position_world.z),\n        position_world.w\n      );\n    }\n    if (project_uCoordinateSystem == COORDINATE_SYSTEM_CARTESIAN) {\n      position_world.xyz += project_uCoordinateOrigin;\n    }\n  }\n  if (project_uProjectionMode == PROJECTION_MODE_GLOBE) {\n    if (project_uCoordinateSystem == COORDINATE_SYSTEM_LNGLAT) {\n      return vec4(\n        project_globe_(position_world.xyz),\n        position_world.w\n      );\n    }\n  }\n  if (project_uProjectionMode == PROJECTION_MODE_IDENTITY ||\n    (project_uProjectionMode == PROJECTION_MODE_WEB_MERCATOR_AUTO_OFFSET &&\n    (project_uCoordinateSystem == COORDINATE_SYSTEM_LNGLAT ||\n     project_uCoordinateSystem == COORDINATE_SYSTEM_CARTESIAN))) {\n    position_world.xyz -= project_uCoordinateOrigin;\n  }\n  return project_offset_(position_world + project_uModelMatrix * vec4(position64Low, 0.0));\n}\n\nvec4 project_position(vec4 position) {\n  return project_position(position, ZERO_64_LOW);\n}\n\nvec3 project_position(vec3 position, vec3 position64Low) {\n  vec4 projected_position = project_position(vec4(position, 1.0), position64Low);\n  return projected_position.xyz;\n}\n\nvec3 project_position(vec3 position) {\n  vec4 projected_position = project_position(vec4(position, 1.0), ZERO_64_LOW);\n  return projected_position.xyz;\n}\n\nvec2 project_position(vec2 position) {\n  vec4 projected_position = project_position(vec4(position, 0.0, 1.0), ZERO_64_LOW);\n  return projected_position.xy;\n}\n\nvec4 project_common_position_to_clipspace(vec4 position, mat4 viewProjectionMatrix, vec4 center) {\n  return viewProjectionMatrix * position + center;\n}\nvec4 project_common_position_to_clipspace(vec4 position) {\n  return project_common_position_to_clipspace(position, project_uViewProjectionMatrix, project_uCenter);\n}\nvec2 project_pixel_size_to_clipspace(vec2 pixels) {\n  vec2 offset = pixels / project_uViewportSize * project_uDevicePixelRatio * 2.0;\n  return offset * project_uFocalDistance;\n}\n\nfloat project_size_to_pixel(float meters) {\n  return project_size(meters) * project_uScale;\n}\nfloat project_pixel_size(float pixels) {\n  return pixels / project_uScale;\n}\nvec2 project_pixel_size(vec2 pixels) {\n  return pixels / project_uScale;\n}\nmat3 project_get_orientation_matrix(vec3 up) {\n  vec3 uz = normalize(up);\n  vec3 ux = abs(uz.z) == 1.0 ? vec3(1.0, 0.0, 0.0) : normalize(vec3(uz.y, -uz.x, 0));\n  vec3 uy = cross(uz, ux);\n  return mat3(ux, uy, uz);\n}\n\nbool project_needs_rotation(vec3 commonPosition, out mat3 transform) {\n  if (project_uProjectionMode == PROJECTION_MODE_GLOBE) {\n    transform = project_get_orientation_matrix(commonPosition);\n    return true;\n  }\n  return false;\n}\n");

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

function assert$1(condition, message) {
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
    viewProjectionMatrix = multiply$2([], projectionMatrix, viewMatrix);
    viewProjectionMatrix = multiply$2([], viewProjectionMatrix, VECTOR_TO_POINT_MATRIX);
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

  assert$1(viewport);

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

var INITIAL_MODULE_OPTIONS = {};

function getUniforms() {
  var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : INITIAL_MODULE_OPTIONS;

  if (opts.viewport) {
    return getUniformsFromViewport(opts);
  }

  return {};
}

var project = {
  name: 'project',
  dependencies: [fp32],
  vs: projectShader,
  getUniforms: getUniforms
};

var vs = "\nvec4 project_position_to_clipspace(\n  vec3 position, vec3 position64Low, vec3 offset, out vec4 commonPosition\n) {\n  vec3 projectedPosition = project_position(position, position64Low);\n  if (project_uProjectionMode == PROJECTION_MODE_GLOBE) {\n    // offset is specified as ENU\n    // when in globe projection, rotate offset so that the ground alighs with the surface of the globe\n    mat3 rotation = project_get_orientation_matrix(projectedPosition);\n    offset = rotation * offset;\n  }\n  commonPosition = vec4(projectedPosition + offset, 1.0);\n  return project_common_position_to_clipspace(commonPosition);\n}\n\nvec4 project_position_to_clipspace(\n  vec3 position, vec3 position64Low, vec3 offset\n) {\n  vec4 commonPosition;\n  return project_position_to_clipspace(position, position64Low, offset, commonPosition);\n}\n";
var project32 = {
  name: 'project32',
  dependencies: [project],
  vs: vs
};

function assert$2(condition, message) {
  if (!condition) {
    throw new Error("math.gl assertion ".concat(message));
  }
}

var config$1 = {};
config$1.EPSILON = 1e-12;
config$1.debug = false;
config$1.precision = 4;
config$1.printTypes = false;
config$1.printDegrees = false;
config$1.printRowMajor = true;

function round$1(value) {
  return Math.round(value / config$1.EPSILON) * config$1.EPSILON;
}

function formatValue$1(value) {
  var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
      _ref$precision = _ref.precision,
      precision = _ref$precision === void 0 ? config$1.precision || 4 : _ref$precision;

  value = round$1(value);
  return "".concat(parseFloat(value.toPrecision(precision)));
}
function isArray$1(value) {
  return Array.isArray(value) || ArrayBuffer.isView(value) && !(value instanceof DataView);
}
function lerp$2(a, b, t) {
  if (isArray$1(a)) {
    return a.map(function (ai, i) {
      return lerp$2(ai, b[i], t);
    });
  }

  return t * b + (1 - t) * a;
}
function equals$1(a, b, epsilon) {
  var oldEpsilon = config$1.EPSILON;

  if (epsilon) {
    config$1.EPSILON = epsilon;
  }

  try {
    if (a === b) {
      return true;
    }

    if (isArray$1(a) && isArray$1(b)) {
      if (a.length !== b.length) {
        return false;
      }

      for (var i = 0; i < a.length; ++i) {
        if (!equals$1(a[i], b[i])) {
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
      return Math.abs(a - b) <= config$1.EPSILON * Math.max(1.0, Math.abs(a), Math.abs(b));
    }

    return false;
  } finally {
    config$1.EPSILON = oldEpsilon;
  }
}

function _createSuper$3(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct$3(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _isNativeReflectConstruct$3() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

var MathArray$1 = function (_Array) {
  _inherits(MathArray, _Array);

  var _super = _createSuper$3(MathArray);

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

      return isArray$1(arrayOrObject) ? this.toArray(arrayOrObject) : this.toObject(arrayOrObject);
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
      return this.formatString(config$1);
    }
  }, {
    key: "formatString",
    value: function formatString(opts) {
      var string = '';

      for (var i = 0; i < this.ELEMENTS; ++i) {
        string += (i > 0 ? ', ' : '') + formatValue$1(this[i], opts);
      }

      return "".concat(opts.printTypes ? this.constructor.name : '', "[").concat(string, "]");
    }
  }, {
    key: "equals",
    value: function equals(array) {
      if (!array || this.length !== array.length) {
        return false;
      }

      for (var i = 0; i < this.ELEMENTS; ++i) {
        if (!equals$1(this[i], array[i])) {
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
      if (config$1.debug && !this.validate()) {
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
      assert$2(false);
      return 0;
    }
  }, {
    key: "RANK",
    get: function get() {
      assert$2(false);
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

function validateVector$1(v, length) {
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
function checkNumber$1(value) {
  if (!Number.isFinite(value)) {
    throw new Error("Invalid number ".concat(value));
  }

  return value;
}
function checkVector$1(v, length) {
  var callerName = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '';

  if (config$1.debug && !validateVector$1(v, length)) {
    throw new Error("math.gl: ".concat(callerName, " some fields set to invalid numbers'"));
  }

  return v;
}
var map$1 = {};
function deprecated$1(method, version) {
  if (!map$1[method]) {
    map$1[method] = true;
    console.warn("".concat(method, " has been removed in version ").concat(version, ", see upgrade guide for more information"));
  }
}

function _createSuper$4(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct$4(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _isNativeReflectConstruct$4() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

var Vector = function (_MathArray) {
  _inherits(Vector, _MathArray);

  var _super = _createSuper$4(Vector);

  function Vector() {
    _classCallCheck(this, Vector);

    return _super.apply(this, arguments);
  }

  _createClass(Vector, [{
    key: "copy",
    value: function copy(vector) {
      assert$2(false);
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

      return checkNumber$1(length);
    }
  }, {
    key: "dot",
    value: function dot(mathArray) {
      var product = 0;

      for (var i = 0; i < this.ELEMENTS; ++i) {
        product += this[i] * mathArray[i];
      }

      return checkNumber$1(product);
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
      assert$2(i >= 0 && i < this.ELEMENTS, 'index is out of range');
      return checkNumber$1(this[i]);
    }
  }, {
    key: "setComponent",
    value: function setComponent(i, value) {
      assert$2(i >= 0 && i < this.ELEMENTS, 'index is out of range');
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
      this[0] = checkNumber$1(value);
    }
  }, {
    key: "y",
    get: function get() {
      return this[1];
    },
    set: function set(value) {
      this[1] = checkNumber$1(value);
    }
  }]);

  return Vector;
}(MathArray$1);

function vec2_transformMat4AsVector$1(out, a, m) {
  var x = a[0];
  var y = a[1];
  var w = m[3] * x + m[7] * y || 1.0;
  out[0] = (m[0] * x + m[4] * y) / w;
  out[1] = (m[1] * x + m[5] * y) / w;
  return out;
}
function vec3_transformMat4AsVector$1(out, a, m) {
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
function vec4_transformMat3(out, a, m) {
  var x = a[0];
  var y = a[1];
  var z = a[2];
  out[0] = m[0] * x + m[3] * y + m[6] * z;
  out[1] = m[1] * x + m[4] * y + m[7] * z;
  out[2] = m[2] * x + m[5] * y + m[8] * z;
  out[3] = a[3];
  return out;
}

function _createSuper$5(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct$5(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _isNativeReflectConstruct$5() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }
var ORIGIN = [0, 0, 0];
var constants$1 = {};

var Vector3 = function (_Vector) {
  _inherits(Vector3, _Vector);

  var _super = _createSuper$5(Vector3);

  _createClass(Vector3, null, [{
    key: "ZERO",
    get: function get() {
      return constants$1.ZERO = constants$1.ZERO || Object.freeze(new Vector3(0, 0, 0, 0));
    }
  }]);

  function Vector3() {
    var _this;

    var x = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
    var y = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
    var z = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;

    _classCallCheck(this, Vector3);

    _this = _super.call(this, -0, -0, -0);

    if (arguments.length === 1 && isArray$1(x)) {
      _this.copy(x);
    } else {
      if (config$1.debug) {
        checkNumber$1(x);
        checkNumber$1(y);
        checkNumber$1(z);
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
      if (config$1.debug) {
        checkNumber$1(object.x);
        checkNumber$1(object.y);
        checkNumber$1(object.z);
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
    value: function rotateX(_ref) {
      var radians = _ref.radians,
          _ref$origin = _ref.origin,
          origin = _ref$origin === void 0 ? ORIGIN : _ref$origin;
      rotateX$2(this, this, origin, radians);
      return this.check();
    }
  }, {
    key: "rotateY",
    value: function rotateY(_ref2) {
      var radians = _ref2.radians,
          _ref2$origin = _ref2.origin,
          origin = _ref2$origin === void 0 ? ORIGIN : _ref2$origin;
      rotateY$2(this, this, origin, radians);
      return this.check();
    }
  }, {
    key: "rotateZ",
    value: function rotateZ(_ref3) {
      var radians = _ref3.radians,
          _ref3$origin = _ref3.origin,
          origin = _ref3$origin === void 0 ? ORIGIN : _ref3$origin;
      rotateZ$2(this, this, origin, radians);
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
      vec3_transformMat4AsVector$1(this, this, matrix4);
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
      this[2] = checkNumber$1(value);
    }
  }]);

  return Vector3;
}(Vector);

function _createSuper$6(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct$6(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _isNativeReflectConstruct$6() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

var Matrix$1 = function (_MathArray) {
  _inherits(Matrix, _MathArray);

  var _super = _createSuper$6(Matrix);

  function Matrix() {
    _classCallCheck(this, Matrix);

    return _super.apply(this, arguments);
  }

  _createClass(Matrix, [{
    key: "toString",
    value: function toString() {
      var string = '[';

      if (config$1.printRowMajor) {
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
      this[col * this.RANK + row] = checkNumber$1(value);
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
}(MathArray$1);

function _createSuper$7(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct$7(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _isNativeReflectConstruct$7() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }
var IDENTITY$1 = Object.freeze([1, 0, 0, 0, 1, 0, 0, 0, 1]);
var ZERO$1 = Object.freeze([0, 0, 0, 0, 0, 0, 0, 0, 0]);
var INDICES$1 = Object.freeze({
  COL0ROW0: 0,
  COL0ROW1: 1,
  COL0ROW2: 2,
  COL1ROW0: 3,
  COL1ROW1: 4,
  COL1ROW2: 5,
  COL2ROW0: 6,
  COL2ROW1: 7,
  COL2ROW2: 8
});
var constants$2 = {};

var Matrix3 = function (_Matrix) {
  _inherits(Matrix3, _Matrix);

  var _super = _createSuper$7(Matrix3);

  _createClass(Matrix3, [{
    key: "ELEMENTS",
    get: function get() {
      return 9;
    }
  }, {
    key: "RANK",
    get: function get() {
      return 3;
    }
  }, {
    key: "INDICES",
    get: function get() {
      return INDICES$1;
    }
  }], [{
    key: "IDENTITY",
    get: function get() {
      constants$2.IDENTITY = constants$2.IDENTITY || Object.freeze(new Matrix3(IDENTITY$1));
      return constants$2.IDENTITY;
    }
  }, {
    key: "ZERO",
    get: function get() {
      constants$2.ZERO = constants$2.ZERO || Object.freeze(new Matrix3(ZERO$1));
      return constants$2.ZERO;
    }
  }]);

  function Matrix3(array) {
    var _this;

    _classCallCheck(this, Matrix3);

    _this = _super.call(this, -0, -0, -0, -0, -0, -0, -0, -0, -0);

    if (arguments.length === 1 && Array.isArray(array)) {
      _this.copy(array);
    } else {
      _this.identity();
    }

    return _this;
  }

  _createClass(Matrix3, [{
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
      return this.check();
    }
  }, {
    key: "set",
    value: function set(m00, m10, m20, m01, m11, m21, m02, m12, m22) {
      this[0] = m00;
      this[1] = m10;
      this[2] = m20;
      this[3] = m01;
      this[4] = m11;
      this[5] = m21;
      this[6] = m02;
      this[7] = m12;
      this[8] = m22;
      return this.check();
    }
  }, {
    key: "setRowMajor",
    value: function setRowMajor(m00, m01, m02, m10, m11, m12, m20, m21, m22) {
      this[0] = m00;
      this[1] = m10;
      this[2] = m20;
      this[3] = m01;
      this[4] = m11;
      this[5] = m21;
      this[6] = m02;
      this[7] = m12;
      this[8] = m22;
      return this.check();
    }
  }, {
    key: "determinant",
    value: function determinant$1() {
      return determinant(this);
    }
  }, {
    key: "identity",
    value: function identity() {
      return this.copy(IDENTITY$1);
    }
  }, {
    key: "fromQuaternion",
    value: function fromQuaternion(q) {
      fromQuat(this, q);
      return this.check();
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
    key: "rotate",
    value: function rotate$1(radians) {
      rotate(this, this, radians);
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
      switch (vector.length) {
        case 2:
          result = transformMat3$1(result || [-0, -0], vector, this);
          break;

        case 3:
          result = transformMat3(result || [-0, -0, -0], vector, this);
          break;

        case 4:
          result = vec4_transformMat3(result || [-0, -0, -0, -0], vector, this);
          break;

        default:
          throw new Error('Illegal vector');
      }

      checkVector$1(result, vector.length);
      return result;
    }
  }, {
    key: "transformVector",
    value: function transformVector(vector, result) {
      deprecated$1('Matrix3.transformVector');
      return this.transform(vector, result);
    }
  }, {
    key: "transformVector2",
    value: function transformVector2(vector, result) {
      deprecated$1('Matrix3.transformVector');
      return this.transform(vector, result);
    }
  }, {
    key: "transformVector3",
    value: function transformVector3(vector, result) {
      deprecated$1('Matrix3.transformVector');
      return this.transform(vector, result);
    }
  }]);

  return Matrix3;
}(Matrix$1);

function _createSuper$8(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct$8(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _isNativeReflectConstruct$8() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }
var IDENTITY$2 = Object.freeze([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
var ZERO$2 = Object.freeze([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
var INDICES$2 = Object.freeze({
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
var constants$3 = {};

var Matrix4$1 = function (_Matrix) {
  _inherits(Matrix4, _Matrix);

  var _super = _createSuper$8(Matrix4);

  _createClass(Matrix4, [{
    key: "INDICES",
    get: function get() {
      return INDICES$2;
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
      constants$3.IDENTITY = constants$3.IDENTITY || Object.freeze(new Matrix4(IDENTITY$2));
      return constants$3.IDENTITY;
    }
  }, {
    key: "ZERO",
    get: function get() {
      constants$3.ZERO = constants$3.ZERO || Object.freeze(new Matrix4(ZERO$2));
      return constants$3.ZERO;
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
      return this.copy(IDENTITY$2);
    }
  }, {
    key: "fromQuaternion",
    value: function fromQuaternion(q) {
      fromQuat$1(this, q);
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
    value: function determinant() {
      return determinant$1(this);
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
    value: function transpose() {
      transpose$1(this, this);
      return this.check();
    }
  }, {
    key: "invert",
    value: function invert() {
      invert$2(this, this);
      return this.check();
    }
  }, {
    key: "multiplyLeft",
    value: function multiplyLeft(a) {
      multiply$2(this, a, this);
      return this.check();
    }
  }, {
    key: "multiplyRight",
    value: function multiplyRight(a) {
      multiply$2(this, this, a);
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
      rotate$1(this, this, radians, axis);
      return this.check();
    }
  }, {
    key: "scale",
    value: function scale(factor) {
      if (Array.isArray(factor)) {
        scale$2(this, this, factor);
      } else {
        scale$2(this, this, [factor, factor, factor]);
      }

      return this.check();
    }
  }, {
    key: "translate",
    value: function translate(vec) {
      translate$1(this, this, vec);
      return this.check();
    }
  }, {
    key: "transform",
    value: function transform(vector, result) {
      if (vector.length === 4) {
        result = transformMat4(result || [-0, -0, -0, -0], vector, this);
        checkVector$1(result, 4);
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

      checkVector$1(result, vector.length);
      return result;
    }
  }, {
    key: "transformAsVector",
    value: function transformAsVector(vector, result) {
      switch (vector.length) {
        case 2:
          result = vec2_transformMat4AsVector$1(result || [-0, -0], vector, this);
          break;

        case 3:
          result = vec3_transformMat4AsVector$1(result || [-0, -0, -0], vector, this);
          break;

        default:
          throw new Error('Illegal vector');
      }

      checkVector$1(result, vector.length);
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
      deprecated$1('Matrix4.transformPoint', '3.0');
      return this.transformAsPoint(vector, result);
    }
  }, {
    key: "transformVector",
    value: function transformVector(vector, result) {
      deprecated$1('Matrix4.transformVector', '3.0');
      return this.transformAsPoint(vector, result);
    }
  }, {
    key: "transformDirection",
    value: function transformDirection(vector, result) {
      deprecated$1('Matrix4.transformDirection', '3.0');
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
}(Matrix$1);

function _createSuper$9(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct$9(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _isNativeReflectConstruct$9() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }
var IDENTITY_QUATERNION = [0, 0, 0, 1];

var Quaternion = function (_MathArray) {
  _inherits(Quaternion, _MathArray);

  var _super = _createSuper$9(Quaternion);

  function Quaternion() {
    var _this;

    var x = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
    var y = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
    var z = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
    var w = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 1;

    _classCallCheck(this, Quaternion);

    _this = _super.call(this, -0, -0, -0, -0);

    if (Array.isArray(x) && arguments.length === 1) {
      _this.copy(x);
    } else {
      _this.set(x, y, z, w);
    }

    return _this;
  }

  _createClass(Quaternion, [{
    key: "copy",
    value: function copy(array) {
      this[0] = array[0];
      this[1] = array[1];
      this[2] = array[2];
      this[3] = array[3];
      return this.check();
    }
  }, {
    key: "set",
    value: function set(x, y, z, w) {
      this[0] = x;
      this[1] = y;
      this[2] = z;
      this[3] = w;
      return this.check();
    }
  }, {
    key: "fromMatrix3",
    value: function fromMatrix3(m) {
      fromMat3(this, m);
      return this.check();
    }
  }, {
    key: "identity",
    value: function identity$1() {
      identity(this);
      return this.check();
    }
  }, {
    key: "fromAxisRotation",
    value: function fromAxisRotation(axis, rad) {
      setAxisAngle(this, axis, rad);
      return this.check();
    }
  }, {
    key: "setAxisAngle",
    value: function setAxisAngle(axis, rad) {
      return this.fromAxisRotation(axis, rad);
    }
  }, {
    key: "len",
    value: function len() {
      return length(this);
    }
  }, {
    key: "lengthSquared",
    value: function lengthSquared() {
      return squaredLength(this);
    }
  }, {
    key: "dot",
    value: function dot$1(a, b) {
      if (b !== undefined) {
        throw new Error('Quaternion.dot only takes one argument');
      }

      return dot(this, a);
    }
  }, {
    key: "rotationTo",
    value: function rotationTo$1(vectorA, vectorB) {
      rotationTo(this, vectorA, vectorB);
      return this.check();
    }
  }, {
    key: "add",
    value: function add$1(a, b) {
      if (b !== undefined) {
        throw new Error('Quaternion.add only takes one argument');
      }

      add(this, this, a);
      return this.check();
    }
  }, {
    key: "calculateW",
    value: function calculateW$1() {
      calculateW(this, this);
      return this.check();
    }
  }, {
    key: "conjugate",
    value: function conjugate$1() {
      conjugate(this, this);
      return this.check();
    }
  }, {
    key: "invert",
    value: function invert() {
      invert$1(this, this);
      return this.check();
    }
  }, {
    key: "lerp",
    value: function lerp(a, b, t) {
      lerp$1(this, a, b, t);
      return this.check();
    }
  }, {
    key: "multiplyRight",
    value: function multiplyRight(a, b) {
      assert$2(!b);
      multiply$1(this, this, a);
      return this.check();
    }
  }, {
    key: "multiplyLeft",
    value: function multiplyLeft(a, b) {
      assert$2(!b);
      multiply$1(this, a, this);
      return this.check();
    }
  }, {
    key: "normalize",
    value: function normalize() {
      var length = this.len();
      var l = length > 0 ? 1 / length : 0;
      this[0] = this[0] * l;
      this[1] = this[1] * l;
      this[2] = this[2] * l;
      this[3] = this[3] * l;

      if (length === 0) {
        this[3] = 1;
      }

      return this.check();
    }
  }, {
    key: "rotateX",
    value: function rotateX$1(rad) {
      rotateX(this, this, rad);
      return this.check();
    }
  }, {
    key: "rotateY",
    value: function rotateY$1(rad) {
      rotateY(this, this, rad);
      return this.check();
    }
  }, {
    key: "rotateZ",
    value: function rotateZ$1(rad) {
      rotateZ(this, this, rad);
      return this.check();
    }
  }, {
    key: "scale",
    value: function scale(b) {
      scale$1(this, this, b);
      return this.check();
    }
  }, {
    key: "slerp",
    value: function slerp$1(start, target, ratio) {
      switch (arguments.length) {
        case 1:
          var _arguments$ = arguments[0];
          var _arguments$$start = _arguments$.start;
          start = _arguments$$start === void 0 ? IDENTITY_QUATERNION : _arguments$$start;
          target = _arguments$.target;
          ratio = _arguments$.ratio;
          break;

        case 2:
          var _arguments = Array.prototype.slice.call(arguments);

          target = _arguments[0];
          ratio = _arguments[1];
          start = this;
          break;
      }

      slerp(this, start, target, ratio);
      return this.check();
    }
  }, {
    key: "transformVector4",
    value: function transformVector4(vector) {
      var result = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : vector;
      transformQuat$1(result, vector, this);
      return checkVector$1(result, 4);
    }
  }, {
    key: "lengthSq",
    value: function lengthSq() {
      return this.lengthSquared();
    }
  }, {
    key: "setFromAxisAngle",
    value: function setFromAxisAngle(axis, rad) {
      return this.setAxisAngle(axis, rad);
    }
  }, {
    key: "premultiply",
    value: function premultiply(a, b) {
      return this.multiplyLeft(a, b);
    }
  }, {
    key: "multiply",
    value: function multiply(a, b) {
      return this.multiplyRight(a, b);
    }
  }, {
    key: "ELEMENTS",
    get: function get() {
      return 4;
    }
  }, {
    key: "x",
    get: function get() {
      return this[0];
    },
    set: function set(value) {
      this[0] = checkNumber$1(value);
    }
  }, {
    key: "y",
    get: function get() {
      return this[1];
    },
    set: function set(value) {
      this[1] = checkNumber$1(value);
    }
  }, {
    key: "z",
    get: function get() {
      return this[2];
    },
    set: function set(value) {
      this[2] = checkNumber$1(value);
    }
  }, {
    key: "w",
    get: function get() {
      return this[3];
    },
    set: function set(value) {
      this[3] = checkNumber$1(value);
    }
  }]);

  return Quaternion;
}(MathArray$1);

function createMat4() {
  return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
}
function transformVector(matrix, vector) {
  var result = transformMat4([], vector, matrix);
  scale$3(result, result, 1 / result[3]);
  return result;
}

function assert$3(condition, message) {
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

  assert$3(Number.isFinite(lng));
  assert$3(Number.isFinite(lat) && lat >= -90 && lat <= 90, 'invalid latitude');
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
  assert$3(Number.isFinite(latitude));
  var latCosine = Math.cos(latitude * DEGREES_TO_RADIANS);
  return scaleToZoom(EARTH_CIRCUMFERENCE * latCosine) - 9;
}
function getDistanceScales(_ref6) {
  var latitude = _ref6.latitude,
      longitude = _ref6.longitude,
      _ref6$highPrecision = _ref6.highPrecision,
      highPrecision = _ref6$highPrecision === void 0 ? false : _ref6$highPrecision;
  assert$3(Number.isFinite(latitude) && Number.isFinite(longitude));
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
      scale = _ref7.scale,
      _ref7$center = _ref7.center,
      center = _ref7$center === void 0 ? null : _ref7$center;
  var vm = createMat4();
  translate$1(vm, vm, [0, 0, -altitude]);
  rotateX$1(vm, vm, -pitch * DEGREES_TO_RADIANS);
  rotateZ$1(vm, vm, bearing * DEGREES_TO_RADIANS);
  scale /= height;
  scale$2(vm, vm, [scale, scale, scale]);

  if (center) {
    translate$1(vm, vm, negate([], center));
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

  assert$3(Number.isFinite(x) && Number.isFinite(y) && Number.isFinite(z));
  return transformVector(pixelProjectionMatrix, [x, y, z, 1]);
}
function pixelsToWorld(xyz, pixelUnprojectionMatrix) {
  var targetZ = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;

  var _xyz3 = _slicedToArray(xyz, 3),
      x = _xyz3[0],
      y = _xyz3[1],
      z = _xyz3[2];

  assert$3(Number.isFinite(x) && Number.isFinite(y), 'invalid pixel coordinate');

  if (Number.isFinite(z)) {
    var coord = transformVector(pixelUnprojectionMatrix, [x, y, z, 1]);
    return coord;
  }

  var coord0 = transformVector(pixelUnprojectionMatrix, [x, y, 0, 1]);
  var coord1 = transformVector(pixelUnprojectionMatrix, [x, y, 1, 1]);
  var z0 = coord0[2];
  var z1 = coord1[2];
  var t = z0 === z1 ? 0 : ((targetZ || 0) - z0) / (z1 - z0);
  return lerp$4([], coord0, coord1, t);
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
    assert$3(Number.isFinite(padding.top) && Number.isFinite(padding.bottom) && Number.isFinite(padding.left) && Number.isFinite(padding.right));
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
  assert$3(targetSize[0] > 0 && targetSize[1] > 0);
  var scaleX = targetSize[0] / size[0];
  var scaleY = targetSize[1] / size[1];
  var offsetX = (padding.right - padding.left) / 2 / scaleX;
  var offsetY = (padding.bottom - padding.top) / 2 / scaleY;
  var center = [(se[0] + nw[0]) / 2 + offsetX, (se[1] + nw[1]) / 2 + offsetY];
  var centerLngLat = viewport.unproject(center);
  var zoom = Math.min(maxZoom, viewport.zoom + Math.log2(Math.abs(Math.min(scaleX, scaleY))));
  assert$3(Number.isFinite(zoom));
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
  var coord = lerp$4([], coord0, coord1, t);
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
      multiply$2(vpm, vpm, projectionMatrix);
      multiply$2(vpm, vpm, viewMatrix);
      this.viewProjectionMatrix = vpm;
      var m = createMat4();
      scale$2(m, m, [width / 2, -height / 2, 1]);
      translate$1(m, m, [1, -1, 0]);
      multiply$2(m, m, vpm);
      var mInverse = invert$2(createMat4(), m);

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

      return viewport.width === this.width && viewport.height === this.height && equals$2(viewport.projectionMatrix, this.projectionMatrix) && equals$2(viewport.viewMatrix, this.viewMatrix);
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
      var translate = add$3([], toLocation, negate$1([], fromLocation));
      var newCenter = add$3([], this.center, translate);
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

var picking = Object.assign({
  inject: {
    'vs:DECKGL_FILTER_COLOR': "\n    picking_setPickingColor(geometry.pickingColor);\n    // for picking depth values\n    picking_setPickingAttribute(geometry.position.z);\n    ",
    'fs:DECKGL_FILTER_COLOR': {
      order: 99,
      injection: "\n    // use highlight color if this fragment belongs to the selected object.\n    color = picking_filterHighlightColor(color);\n\n    // use picking color if rendering to picking FBO.\n    color = picking_filterPickingColor(color);\n      "
    }
  }
}, picking$1);

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
var IDENTITY$3 = createMat4$1();
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
    value: function equals(viewport) {
      if (!(viewport instanceof Viewport)) {
        return false;
      }

      if (this === viewport) {
        return true;
      }

      return viewport.width === this.width && viewport.height === this.height && viewport.scale === this.scale && equals$1(viewport.projectionMatrix, this.projectionMatrix) && equals$1(viewport.viewMatrix, this.viewMatrix);
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
      return orthographic ? new Matrix4$1().orthographic({
        fovy: fovyRadians,
        aspect: aspect,
        focalDistance: focalDistance,
        near: near,
        far: far
      }) : new Matrix4$1().perspective({
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
          viewMatrix = _opts$viewMatrix === void 0 ? IDENTITY$3 : _opts$viewMatrix,
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
      this.viewMatrix = new Matrix4$1().multiplyRight(this.viewMatrixUncentered).translate(new Vector3(this.center || ZERO_VECTOR$1).negate());
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
      multiply$2(vpm, vpm, this.projectionMatrix);
      multiply$2(vpm, vpm, this.viewMatrix);
      this.viewProjectionMatrix = vpm;
      this.viewMatrixInverse = invert$2([], this.viewMatrix) || this.viewMatrix;

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
      scale$2(viewportMatrix, viewportMatrix, [this.width / 2, -this.height / 2, 1]);
      translate$1(viewportMatrix, viewportMatrix, [1, -1, 0]);
      multiply$2(pixelProjectionMatrix, viewportMatrix, this.viewProjectionMatrix);
      this.pixelProjectionMatrix = pixelProjectionMatrix;
      this.viewportMatrix = viewportMatrix;
      this.pixelUnprojectionMatrix = invert$2(createMat4$1(), this.pixelProjectionMatrix);

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

function ownKeys$1(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread$1(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys$1(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys$1(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _createSuper$a(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct$a(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _isNativeReflectConstruct$a() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

var WebMercatorViewport$1 = function (_Viewport) {
  _inherits(WebMercatorViewport, _Viewport);

  var _super = _createSuper$a(WebMercatorViewport);

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
      var viewOffset = new Matrix4$1().translate([512 * worldOffset, 0, 0]);
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
      var translate = add$3([], toLocation, negate$1([], fromLocation));
      var newCenter = add$3([], this.center, translate);
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
          var offsetViewport = x ? new WebMercatorViewport(_objectSpread$1(_objectSpread$1({}, this), {}, {
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

function ownKeys$2(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread$2(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys$2(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys$2(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

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
      return _objectSpread$2(_objectSpread$2({}, this.source.getAccessor()), this.opts);
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

function ownKeys$3(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread$3(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys$3(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys$3(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

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
  return _objectSpread$3(_objectSpread$3({}, shaderAttributeOptions), {}, {
    offset: offset,
    stride: stride
  });
}

function resolveDoublePrecisionShaderAttributes(baseAccessor, shaderAttributeOptions) {
  var resolvedOptions = resolveShaderAttribute(baseAccessor, shaderAttributeOptions);
  return {
    high: resolvedOptions,
    low: _objectSpread$3(_objectSpread$3({}, resolvedOptions), {}, {
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

      var accessor = _objectSpread$3(_objectSpread$3({}, this.settings), opts);

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
function add$1(rangeList, range) {
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

function _createSuper$b(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct$b(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _isNativeReflectConstruct$b() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

var Attribute = function (_DataColumn) {
  _inherits(Attribute, _DataColumn);

  var _super = _createSuper$b(Attribute);

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
        this.state.updateRanges = add$1(this.state.updateRanges, [startRow, endRow]);
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
        assert$1(Number.isFinite(numInstances));

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
        assert$1(ArrayBuffer.isView(buffer.value), "invalid ".concat(settings.accessor));
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
      assert$1(typeof accessorFunc === 'function', "accessor \"".concat(accessor, "\" is not a function"));
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

function ownKeys$4(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread$4(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys$4(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys$4(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

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
var vs$1 = "\n#define SHADER_NAME interpolation-transition-vertex-shader\n\nuniform float time;\nattribute ATTRIBUTE_TYPE aFrom;\nattribute ATTRIBUTE_TYPE aTo;\nvarying ATTRIBUTE_TYPE vCurrent;\n\nvoid main(void) {\n  vCurrent = mix(aFrom, aTo, time);\n  gl_Position = vec4(0.0);\n}\n";

function getTransform(gl, attribute) {
  var attributeType = getAttributeTypeFromSize(attribute.size);
  return new Transform(gl, {
    vs: vs$1,
    defines: {
      ATTRIBUTE_TYPE: attributeType
    },
    varyings: ['vCurrent']
  });
}

function ownKeys$5(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread$5(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys$5(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys$5(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

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
          padBuffer(_objectSpread$5({
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

function _createSuper$c(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct$c(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _isNativeReflectConstruct$c() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

var CPUInterpolationTransition = function (_Transition) {
  _inherits(CPUInterpolationTransition, _Transition);

  var _super = _createSuper$c(CPUInterpolationTransition);

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
      this._value = lerp$2(fromValue, toValue, t);
    }
  }, {
    key: "value",
    get: function get() {
      return this._value;
    }
  }]);

  return CPUInterpolationTransition;
}(Transition);

function _createSuper$d(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct$d(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _isNativeReflectConstruct$d() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }
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

  var _super = _createSuper$d(CPUSpringTransition);

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

function ownKeys$6(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread$6(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys$6(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys$6(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }
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
      transition.start(_objectSpread$6(_objectSpread$6({}, settings), {}, {
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

function ownKeys$7(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread$7(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys$7(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys$7(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

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
      var mergedInjection = _objectSpread$7({}, target.inject);

      for (var key in source.inject) {
        mergedInjection[key] = (mergedInjection[key] || '') + source.inject[key];
      }

      result.inject = mergedInjection;
    }
  }

  return result;
}

var _DEFAULT_TEXTURE_PARA;

function ownKeys$8(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread$8(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys$8(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys$8(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }
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

  var texture = new Texture2D(gl, _objectSpread$8(_objectSpread$8({}, image), {}, {
    parameters: _objectSpread$8(_objectSpread$8({}, DEFAULT_TEXTURE_PARAMETERS), layer.props.textureParameters)
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
      return propType.optional && !value || isArray$2(value) && (value.length === 3 || value.length === 4);
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
      return propType.optional && !value || isArray$2(value);
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

  if (!isArray$2(array1) || !isArray$2(array2)) {
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

function isArray$2(value) {
  return Array.isArray(value) || ArrayBuffer.isView(value);
}

function getTypeOf(value) {
  if (isArray$2(value)) {
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

function _createSuper$e(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct$e(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _isNativeReflectConstruct$e() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

var LayerState = function (_ComponentState) {
  _inherits(LayerState, _ComponentState);

  var _super = _createSuper$e(LayerState);

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

function _createSuper$f(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct$f(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _isNativeReflectConstruct$f() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }
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

  var _super = _createSuper$f(Layer);

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
      assert$1(color instanceof Uint8Array);

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
      assert$1(this.internalState && this.state);
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
      assert$1(!this.internalState && !this.state);
      assert$1(isFinite(this.props.coordinateSystem), "".concat(this.id, ": invalid coordinateSystem"));

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
      assert$1(state && internalState);

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

function _createForOfIteratorHelper$6(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray$6(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray$6(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray$6(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray$6(o, minLen); }

function _arrayLikeToArray$6(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _createSuper$g(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct$g(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _isNativeReflectConstruct$g() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }
var TRACE_RENDER_LAYERS = 'compositeLayer.renderLayers';

var CompositeLayer = function (_Layer) {
  _inherits(CompositeLayer, _Layer);

  var _super = _createSuper$g(CompositeLayer);

  function CompositeLayer() {
    _classCallCheck(this, CompositeLayer);

    return _super.apply(this, arguments);
  }

  _createClass(CompositeLayer, [{
    key: "getSubLayers",
    value: function getSubLayers() {
      return this.internalState && this.internalState.subLayers || [];
    }
  }, {
    key: "initializeState",
    value: function initializeState() {}
  }, {
    key: "setState",
    value: function setState(updateObject) {
      _get(_getPrototypeOf(CompositeLayer.prototype), "setState", this).call(this, updateObject);

      this.setNeedsUpdate();
    }
  }, {
    key: "getPickingInfo",
    value: function getPickingInfo(_ref) {
      var info = _ref.info;
      var object = info.object;
      var isDataWrapped = object && object.__source && object.__source.parent && object.__source.parent.id === this.id;

      if (!isDataWrapped) {
        return info;
      }

      return Object.assign(info, {
        object: object.__source.object,
        index: object.__source.index
      });
    }
  }, {
    key: "renderLayers",
    value: function renderLayers() {
      return null;
    }
  }, {
    key: "shouldRenderSubLayer",
    value: function shouldRenderSubLayer(id, data) {
      var overridingProps = this.props._subLayerProps;
      return data && data.length || overridingProps && overridingProps[id];
    }
  }, {
    key: "getSubLayerClass",
    value: function getSubLayerClass(id, DefaultLayerClass) {
      var overridingProps = this.props._subLayerProps;
      return overridingProps && overridingProps[id] && overridingProps[id].type || DefaultLayerClass;
    }
  }, {
    key: "getSubLayerRow",
    value: function getSubLayerRow(row, sourceObject, sourceObjectIndex) {
      row.__source = {
        parent: this,
        object: sourceObject,
        index: sourceObjectIndex
      };
      return row;
    }
  }, {
    key: "getSubLayerAccessor",
    value: function getSubLayerAccessor(accessor) {
      if (typeof accessor === 'function') {
        var objectInfo = {
          data: this.props.data,
          target: []
        };
        return function (x, i) {
          if (x.__source) {
            objectInfo.index = x.__source.index;
            return accessor(x.__source.object, objectInfo);
          }

          return accessor(x, i);
        };
      }

      return accessor;
    }
  }, {
    key: "getSubLayerProps",
    value: function getSubLayerProps() {
      var sublayerProps = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var _this$props = this.props,
          opacity = _this$props.opacity,
          pickable = _this$props.pickable,
          visible = _this$props.visible,
          parameters = _this$props.parameters,
          getPolygonOffset = _this$props.getPolygonOffset,
          highlightedObjectIndex = _this$props.highlightedObjectIndex,
          autoHighlight = _this$props.autoHighlight,
          highlightColor = _this$props.highlightColor,
          coordinateSystem = _this$props.coordinateSystem,
          coordinateOrigin = _this$props.coordinateOrigin,
          wrapLongitude = _this$props.wrapLongitude,
          positionFormat = _this$props.positionFormat,
          modelMatrix = _this$props.modelMatrix,
          extensions = _this$props.extensions,
          overridingProps = _this$props._subLayerProps;
      var newProps = {
        opacity: opacity,
        pickable: pickable,
        visible: visible,
        parameters: parameters,
        getPolygonOffset: getPolygonOffset,
        highlightedObjectIndex: highlightedObjectIndex,
        autoHighlight: autoHighlight,
        highlightColor: highlightColor,
        coordinateSystem: coordinateSystem,
        coordinateOrigin: coordinateOrigin,
        wrapLongitude: wrapLongitude,
        positionFormat: positionFormat,
        modelMatrix: modelMatrix,
        extensions: extensions
      };
      var overridingSublayerProps = overridingProps && overridingProps[sublayerProps.id];
      var overridingSublayerTriggers = overridingSublayerProps && overridingSublayerProps.updateTriggers;
      var sublayerId = sublayerProps.id || 'sublayer';

      if (overridingSublayerProps) {
        var propTypes = this.constructor._propTypes;

        for (var key in overridingSublayerProps) {
          var propType = propTypes[key];

          if (propType && propType.type === 'accessor') {
            overridingSublayerProps[key] = this.getSubLayerAccessor(overridingSublayerProps[key]);
          }
        }
      }

      Object.assign(newProps, sublayerProps, overridingSublayerProps, {
        id: "".concat(this.props.id, "-").concat(sublayerId),
        updateTriggers: Object.assign({
          all: this.props.updateTriggers.all
        }, sublayerProps.updateTriggers, overridingSublayerTriggers)
      });

      var _iterator = _createForOfIteratorHelper$6(extensions),
          _step;

      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var extension = _step.value;
          var passThroughProps = extension.getSubLayerProps.call(this, extension);

          if (passThroughProps) {
            Object.assign(newProps, passThroughProps, {
              updateTriggers: Object.assign(newProps.updateTriggers, passThroughProps.updateTriggers)
            });
          }
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }

      return newProps;
    }
  }, {
    key: "_getAttributeManager",
    value: function _getAttributeManager() {
      return null;
    }
  }, {
    key: "_renderLayers",
    value: function _renderLayers() {
      var subLayers = this.internalState.subLayers;
      var shouldUpdate = !subLayers || this.needsUpdate();

      if (shouldUpdate) {
        subLayers = this.renderLayers();
        subLayers = flatten(subLayers, Boolean);
        this.internalState.subLayers = subLayers;
      }

      debug(TRACE_RENDER_LAYERS, this, shouldUpdate, subLayers);

      var _iterator2 = _createForOfIteratorHelper$6(subLayers),
          _step2;

      try {
        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
          var layer = _step2.value;
          layer.parent = this;
        }
      } catch (err) {
        _iterator2.e(err);
      } finally {
        _iterator2.f();
      }
    }
  }, {
    key: "isComposite",
    get: function get() {
      return true;
    }
  }, {
    key: "isLoaded",
    get: function get() {
      return _get(_getPrototypeOf(CompositeLayer.prototype), "isLoaded", this) && this.getSubLayers().every(function (layer) {
        return layer.isLoaded;
      });
    }
  }]);

  return CompositeLayer;
}(Layer);
CompositeLayer.layerName = 'CompositeLayer';

function _createForOfIteratorHelper$7(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray$7(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray$7(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray$7(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray$7(o, minLen); }

function _arrayLikeToArray$7(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

var Tesselator = function () {
  function Tesselator() {
    var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, Tesselator);

    var _opts$attributes = opts.attributes,
        attributes = _opts$attributes === void 0 ? {} : _opts$attributes;
    this.typedArrayManager = defaultTypedArrayManager;
    this.indexStarts = null;
    this.vertexStarts = null;
    this.vertexCount = 0;
    this.instanceCount = 0;
    this.attributes = {};
    this._attributeDefs = attributes;
    this.opts = opts;
    this.updateGeometry(opts);
    Object.seal(this);
  }

  _createClass(Tesselator, [{
    key: "updateGeometry",
    value: function updateGeometry(opts) {
      Object.assign(this.opts, opts);
      var _this$opts = this.opts,
          data = _this$opts.data,
          _this$opts$buffers = _this$opts.buffers,
          buffers = _this$opts$buffers === void 0 ? {} : _this$opts$buffers,
          getGeometry = _this$opts.getGeometry,
          geometryBuffer = _this$opts.geometryBuffer,
          positionFormat = _this$opts.positionFormat,
          dataChanged = _this$opts.dataChanged,
          _this$opts$normalize = _this$opts.normalize,
          normalize = _this$opts$normalize === void 0 ? true : _this$opts$normalize;
      this.data = data;
      this.getGeometry = getGeometry;
      this.positionSize = geometryBuffer && geometryBuffer.size || (positionFormat === 'XY' ? 2 : 3);
      this.buffers = buffers;
      this.normalize = normalize;

      if (geometryBuffer) {
        assert$1(data.startIndices, 'binary data missing startIndices');
        this.getGeometry = this.getGeometryFromBuffer(geometryBuffer);

        if (!normalize) {
          buffers.positions = geometryBuffer;
        }
      }

      this.geometryBuffer = buffers.positions;

      if (Array.isArray(dataChanged)) {
        var _iterator = _createForOfIteratorHelper$7(dataChanged),
            _step;

        try {
          for (_iterator.s(); !(_step = _iterator.n()).done;) {
            var dataRange = _step.value;

            this._rebuildGeometry(dataRange);
          }
        } catch (err) {
          _iterator.e(err);
        } finally {
          _iterator.f();
        }
      } else {
        this._rebuildGeometry();
      }
    }
  }, {
    key: "updatePartialGeometry",
    value: function updatePartialGeometry(_ref) {
      var startRow = _ref.startRow,
          endRow = _ref.endRow;

      this._rebuildGeometry({
        startRow: startRow,
        endRow: endRow
      });
    }
  }, {
    key: "normalizeGeometry",
    value: function normalizeGeometry(geometry) {
      return geometry;
    }
  }, {
    key: "updateGeometryAttributes",
    value: function updateGeometryAttributes(geometry, startIndex, size) {
      throw new Error('Not implemented');
    }
  }, {
    key: "getGeometrySize",
    value: function getGeometrySize(geometry) {
      throw new Error('Not implemented');
    }
  }, {
    key: "getGeometryFromBuffer",
    value: function getGeometryFromBuffer(geometryBuffer) {
      var value = geometryBuffer.value || geometryBuffer;
      assert$1(ArrayBuffer.isView(value), 'cannot read geometries');
      return getAccessorFromBuffer(value, {
        size: this.positionSize,
        offset: geometryBuffer.offset,
        stride: geometryBuffer.stride,
        startIndices: this.data.startIndices
      });
    }
  }, {
    key: "_allocate",
    value: function _allocate(instanceCount, copy) {
      var attributes = this.attributes,
          buffers = this.buffers,
          _attributeDefs = this._attributeDefs,
          typedArrayManager = this.typedArrayManager;

      for (var name in _attributeDefs) {
        if (name in buffers) {
          typedArrayManager.release(attributes[name]);
          attributes[name] = null;
        } else {
          var def = _attributeDefs[name];
          def.copy = copy;
          attributes[name] = typedArrayManager.allocate(attributes[name], instanceCount, def);
        }
      }
    }
  }, {
    key: "_forEachGeometry",
    value: function _forEachGeometry(visitor, startRow, endRow) {
      var data = this.data,
          getGeometry = this.getGeometry;

      var _createIterable = createIterable(data, startRow, endRow),
          iterable = _createIterable.iterable,
          objectInfo = _createIterable.objectInfo;

      var _iterator2 = _createForOfIteratorHelper$7(iterable),
          _step2;

      try {
        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
          var object = _step2.value;
          objectInfo.index++;
          var geometry = getGeometry(object, objectInfo);
          visitor(geometry, objectInfo.index);
        }
      } catch (err) {
        _iterator2.e(err);
      } finally {
        _iterator2.f();
      }
    }
  }, {
    key: "_rebuildGeometry",
    value: function _rebuildGeometry(dataRange) {
      var _this = this;

      if (!this.data || !this.getGeometry) {
        return;
      }

      var indexStarts = this.indexStarts,
          vertexStarts = this.vertexStarts,
          instanceCount = this.instanceCount;
      var data = this.data,
          geometryBuffer = this.geometryBuffer;

      var _ref2 = dataRange || {},
          _ref2$startRow = _ref2.startRow,
          startRow = _ref2$startRow === void 0 ? 0 : _ref2$startRow,
          _ref2$endRow = _ref2.endRow,
          endRow = _ref2$endRow === void 0 ? Infinity : _ref2$endRow;

      var normalizedData = {};

      if (!dataRange) {
        indexStarts = [0];
        vertexStarts = [0];
      }

      if (this.normalize || !geometryBuffer) {
        this._forEachGeometry(function (geometry, dataIndex) {
          geometry = _this.normalizeGeometry(geometry);
          normalizedData[dataIndex] = geometry;
          vertexStarts[dataIndex + 1] = vertexStarts[dataIndex] + _this.getGeometrySize(geometry);
        }, startRow, endRow);

        instanceCount = vertexStarts[vertexStarts.length - 1];
      } else if (geometryBuffer.buffer instanceof Buffer) {
        var byteStride = geometryBuffer.stride || this.positionSize * 4;
        vertexStarts = data.startIndices;
        instanceCount = vertexStarts[data.length] || geometryBuffer.buffer.byteLength / byteStride;
      } else {
        var bufferValue = geometryBuffer.value || geometryBuffer;
        var elementStride = geometryBuffer.stride / bufferValue.BYTES_PER_ELEMENT || this.positionSize;
        vertexStarts = data.startIndices;
        instanceCount = vertexStarts[data.length] || bufferValue.length / elementStride;
      }

      this._allocate(instanceCount, Boolean(dataRange));

      this.indexStarts = indexStarts;
      this.vertexStarts = vertexStarts;
      this.instanceCount = instanceCount;
      var context = {};

      this._forEachGeometry(function (geometry, dataIndex) {
        geometry = normalizedData[dataIndex] || geometry;
        context.vertexStart = vertexStarts[dataIndex];
        context.indexStart = indexStarts[dataIndex];
        var vertexEnd = dataIndex < vertexStarts.length - 1 ? vertexStarts[dataIndex + 1] : instanceCount;
        context.geometrySize = vertexEnd - vertexStarts[dataIndex];
        context.geometryIndex = dataIndex;

        _this.updateGeometryAttributes(geometry, context);
      }, startRow, endRow);

      this.vertexCount = indexStarts[indexStarts.length - 1];
    }
  }]);

  return Tesselator;
}();

var GL = {
  DEPTH_BUFFER_BIT: 0x00000100,
  STENCIL_BUFFER_BIT: 0x00000400,
  COLOR_BUFFER_BIT: 0x00004000,
  POINTS: 0x0000,
  LINES: 0x0001,
  LINE_LOOP: 0x0002,
  LINE_STRIP: 0x0003,
  TRIANGLES: 0x0004,
  TRIANGLE_STRIP: 0x0005,
  TRIANGLE_FAN: 0x0006,
  ZERO: 0,
  ONE: 1,
  SRC_COLOR: 0x0300,
  ONE_MINUS_SRC_COLOR: 0x0301,
  SRC_ALPHA: 0x0302,
  ONE_MINUS_SRC_ALPHA: 0x0303,
  DST_ALPHA: 0x0304,
  ONE_MINUS_DST_ALPHA: 0x0305,
  DST_COLOR: 0x0306,
  ONE_MINUS_DST_COLOR: 0x0307,
  SRC_ALPHA_SATURATE: 0x0308,
  CONSTANT_COLOR: 0x8001,
  ONE_MINUS_CONSTANT_COLOR: 0x8002,
  CONSTANT_ALPHA: 0x8003,
  ONE_MINUS_CONSTANT_ALPHA: 0x8004,
  FUNC_ADD: 0x8006,
  FUNC_SUBTRACT: 0x800a,
  FUNC_REVERSE_SUBTRACT: 0x800b,
  BLEND_EQUATION: 0x8009,
  BLEND_EQUATION_RGB: 0x8009,
  BLEND_EQUATION_ALPHA: 0x883d,
  BLEND_DST_RGB: 0x80c8,
  BLEND_SRC_RGB: 0x80c9,
  BLEND_DST_ALPHA: 0x80ca,
  BLEND_SRC_ALPHA: 0x80cb,
  BLEND_COLOR: 0x8005,
  ARRAY_BUFFER_BINDING: 0x8894,
  ELEMENT_ARRAY_BUFFER_BINDING: 0x8895,
  LINE_WIDTH: 0x0b21,
  ALIASED_POINT_SIZE_RANGE: 0x846d,
  ALIASED_LINE_WIDTH_RANGE: 0x846e,
  CULL_FACE_MODE: 0x0b45,
  FRONT_FACE: 0x0b46,
  DEPTH_RANGE: 0x0b70,
  DEPTH_WRITEMASK: 0x0b72,
  DEPTH_CLEAR_VALUE: 0x0b73,
  DEPTH_FUNC: 0x0b74,
  STENCIL_CLEAR_VALUE: 0x0b91,
  STENCIL_FUNC: 0x0b92,
  STENCIL_FAIL: 0x0b94,
  STENCIL_PASS_DEPTH_FAIL: 0x0b95,
  STENCIL_PASS_DEPTH_PASS: 0x0b96,
  STENCIL_REF: 0x0b97,
  STENCIL_VALUE_MASK: 0x0b93,
  STENCIL_WRITEMASK: 0x0b98,
  STENCIL_BACK_FUNC: 0x8800,
  STENCIL_BACK_FAIL: 0x8801,
  STENCIL_BACK_PASS_DEPTH_FAIL: 0x8802,
  STENCIL_BACK_PASS_DEPTH_PASS: 0x8803,
  STENCIL_BACK_REF: 0x8ca3,
  STENCIL_BACK_VALUE_MASK: 0x8ca4,
  STENCIL_BACK_WRITEMASK: 0x8ca5,
  VIEWPORT: 0x0ba2,
  SCISSOR_BOX: 0x0c10,
  COLOR_CLEAR_VALUE: 0x0c22,
  COLOR_WRITEMASK: 0x0c23,
  UNPACK_ALIGNMENT: 0x0cf5,
  PACK_ALIGNMENT: 0x0d05,
  MAX_TEXTURE_SIZE: 0x0d33,
  MAX_VIEWPORT_DIMS: 0x0d3a,
  SUBPIXEL_BITS: 0x0d50,
  RED_BITS: 0x0d52,
  GREEN_BITS: 0x0d53,
  BLUE_BITS: 0x0d54,
  ALPHA_BITS: 0x0d55,
  DEPTH_BITS: 0x0d56,
  STENCIL_BITS: 0x0d57,
  POLYGON_OFFSET_UNITS: 0x2a00,
  POLYGON_OFFSET_FACTOR: 0x8038,
  TEXTURE_BINDING_2D: 0x8069,
  SAMPLE_BUFFERS: 0x80a8,
  SAMPLES: 0x80a9,
  SAMPLE_COVERAGE_VALUE: 0x80aa,
  SAMPLE_COVERAGE_INVERT: 0x80ab,
  COMPRESSED_TEXTURE_FORMATS: 0x86a3,
  VENDOR: 0x1f00,
  RENDERER: 0x1f01,
  VERSION: 0x1f02,
  IMPLEMENTATION_COLOR_READ_TYPE: 0x8b9a,
  IMPLEMENTATION_COLOR_READ_FORMAT: 0x8b9b,
  BROWSER_DEFAULT_WEBGL: 0x9244,
  STATIC_DRAW: 0x88e4,
  STREAM_DRAW: 0x88e0,
  DYNAMIC_DRAW: 0x88e8,
  ARRAY_BUFFER: 0x8892,
  ELEMENT_ARRAY_BUFFER: 0x8893,
  BUFFER_SIZE: 0x8764,
  BUFFER_USAGE: 0x8765,
  CURRENT_VERTEX_ATTRIB: 0x8626,
  VERTEX_ATTRIB_ARRAY_ENABLED: 0x8622,
  VERTEX_ATTRIB_ARRAY_SIZE: 0x8623,
  VERTEX_ATTRIB_ARRAY_STRIDE: 0x8624,
  VERTEX_ATTRIB_ARRAY_TYPE: 0x8625,
  VERTEX_ATTRIB_ARRAY_NORMALIZED: 0x886a,
  VERTEX_ATTRIB_ARRAY_POINTER: 0x8645,
  VERTEX_ATTRIB_ARRAY_BUFFER_BINDING: 0x889f,
  CULL_FACE: 0x0b44,
  FRONT: 0x0404,
  BACK: 0x0405,
  FRONT_AND_BACK: 0x0408,
  BLEND: 0x0be2,
  DEPTH_TEST: 0x0b71,
  DITHER: 0x0bd0,
  POLYGON_OFFSET_FILL: 0x8037,
  SAMPLE_ALPHA_TO_COVERAGE: 0x809e,
  SAMPLE_COVERAGE: 0x80a0,
  SCISSOR_TEST: 0x0c11,
  STENCIL_TEST: 0x0b90,
  NO_ERROR: 0,
  INVALID_ENUM: 0x0500,
  INVALID_VALUE: 0x0501,
  INVALID_OPERATION: 0x0502,
  OUT_OF_MEMORY: 0x0505,
  CONTEXT_LOST_WEBGL: 0x9242,
  CW: 0x0900,
  CCW: 0x0901,
  DONT_CARE: 0x1100,
  FASTEST: 0x1101,
  NICEST: 0x1102,
  GENERATE_MIPMAP_HINT: 0x8192,
  BYTE: 0x1400,
  UNSIGNED_BYTE: 0x1401,
  SHORT: 0x1402,
  UNSIGNED_SHORT: 0x1403,
  INT: 0x1404,
  UNSIGNED_INT: 0x1405,
  FLOAT: 0x1406,
  DOUBLE: 0x140a,
  DEPTH_COMPONENT: 0x1902,
  ALPHA: 0x1906,
  RGB: 0x1907,
  RGBA: 0x1908,
  LUMINANCE: 0x1909,
  LUMINANCE_ALPHA: 0x190a,
  UNSIGNED_SHORT_4_4_4_4: 0x8033,
  UNSIGNED_SHORT_5_5_5_1: 0x8034,
  UNSIGNED_SHORT_5_6_5: 0x8363,
  FRAGMENT_SHADER: 0x8b30,
  VERTEX_SHADER: 0x8b31,
  COMPILE_STATUS: 0x8b81,
  DELETE_STATUS: 0x8b80,
  LINK_STATUS: 0x8b82,
  VALIDATE_STATUS: 0x8b83,
  ATTACHED_SHADERS: 0x8b85,
  ACTIVE_ATTRIBUTES: 0x8b89,
  ACTIVE_UNIFORMS: 0x8b86,
  MAX_VERTEX_ATTRIBS: 0x8869,
  MAX_VERTEX_UNIFORM_VECTORS: 0x8dfb,
  MAX_VARYING_VECTORS: 0x8dfc,
  MAX_COMBINED_TEXTURE_IMAGE_UNITS: 0x8b4d,
  MAX_VERTEX_TEXTURE_IMAGE_UNITS: 0x8b4c,
  MAX_TEXTURE_IMAGE_UNITS: 0x8872,
  MAX_FRAGMENT_UNIFORM_VECTORS: 0x8dfd,
  SHADER_TYPE: 0x8b4f,
  SHADING_LANGUAGE_VERSION: 0x8b8c,
  CURRENT_PROGRAM: 0x8b8d,
  NEVER: 0x0200,
  ALWAYS: 0x0207,
  LESS: 0x0201,
  EQUAL: 0x0202,
  LEQUAL: 0x0203,
  GREATER: 0x0204,
  GEQUAL: 0x0206,
  NOTEQUAL: 0x0205,
  KEEP: 0x1e00,
  REPLACE: 0x1e01,
  INCR: 0x1e02,
  DECR: 0x1e03,
  INVERT: 0x150a,
  INCR_WRAP: 0x8507,
  DECR_WRAP: 0x8508,
  NEAREST: 0x2600,
  LINEAR: 0x2601,
  NEAREST_MIPMAP_NEAREST: 0x2700,
  LINEAR_MIPMAP_NEAREST: 0x2701,
  NEAREST_MIPMAP_LINEAR: 0x2702,
  LINEAR_MIPMAP_LINEAR: 0x2703,
  TEXTURE_MAG_FILTER: 0x2800,
  TEXTURE_MIN_FILTER: 0x2801,
  TEXTURE_WRAP_S: 0x2802,
  TEXTURE_WRAP_T: 0x2803,
  TEXTURE_2D: 0x0de1,
  TEXTURE: 0x1702,
  TEXTURE_CUBE_MAP: 0x8513,
  TEXTURE_BINDING_CUBE_MAP: 0x8514,
  TEXTURE_CUBE_MAP_POSITIVE_X: 0x8515,
  TEXTURE_CUBE_MAP_NEGATIVE_X: 0x8516,
  TEXTURE_CUBE_MAP_POSITIVE_Y: 0x8517,
  TEXTURE_CUBE_MAP_NEGATIVE_Y: 0x8518,
  TEXTURE_CUBE_MAP_POSITIVE_Z: 0x8519,
  TEXTURE_CUBE_MAP_NEGATIVE_Z: 0x851a,
  MAX_CUBE_MAP_TEXTURE_SIZE: 0x851c,
  TEXTURE0: 0x84c0,
  ACTIVE_TEXTURE: 0x84e0,
  REPEAT: 0x2901,
  CLAMP_TO_EDGE: 0x812f,
  MIRRORED_REPEAT: 0x8370,
  TEXTURE_WIDTH: 0x1000,
  TEXTURE_HEIGHT: 0x1001,
  FLOAT_VEC2: 0x8b50,
  FLOAT_VEC3: 0x8b51,
  FLOAT_VEC4: 0x8b52,
  INT_VEC2: 0x8b53,
  INT_VEC3: 0x8b54,
  INT_VEC4: 0x8b55,
  BOOL: 0x8b56,
  BOOL_VEC2: 0x8b57,
  BOOL_VEC3: 0x8b58,
  BOOL_VEC4: 0x8b59,
  FLOAT_MAT2: 0x8b5a,
  FLOAT_MAT3: 0x8b5b,
  FLOAT_MAT4: 0x8b5c,
  SAMPLER_2D: 0x8b5e,
  SAMPLER_CUBE: 0x8b60,
  LOW_FLOAT: 0x8df0,
  MEDIUM_FLOAT: 0x8df1,
  HIGH_FLOAT: 0x8df2,
  LOW_INT: 0x8df3,
  MEDIUM_INT: 0x8df4,
  HIGH_INT: 0x8df5,
  FRAMEBUFFER: 0x8d40,
  RENDERBUFFER: 0x8d41,
  RGBA4: 0x8056,
  RGB5_A1: 0x8057,
  RGB565: 0x8d62,
  DEPTH_COMPONENT16: 0x81a5,
  STENCIL_INDEX: 0x1901,
  STENCIL_INDEX8: 0x8d48,
  DEPTH_STENCIL: 0x84f9,
  RENDERBUFFER_WIDTH: 0x8d42,
  RENDERBUFFER_HEIGHT: 0x8d43,
  RENDERBUFFER_INTERNAL_FORMAT: 0x8d44,
  RENDERBUFFER_RED_SIZE: 0x8d50,
  RENDERBUFFER_GREEN_SIZE: 0x8d51,
  RENDERBUFFER_BLUE_SIZE: 0x8d52,
  RENDERBUFFER_ALPHA_SIZE: 0x8d53,
  RENDERBUFFER_DEPTH_SIZE: 0x8d54,
  RENDERBUFFER_STENCIL_SIZE: 0x8d55,
  FRAMEBUFFER_ATTACHMENT_OBJECT_TYPE: 0x8cd0,
  FRAMEBUFFER_ATTACHMENT_OBJECT_NAME: 0x8cd1,
  FRAMEBUFFER_ATTACHMENT_TEXTURE_LEVEL: 0x8cd2,
  FRAMEBUFFER_ATTACHMENT_TEXTURE_CUBE_MAP_FACE: 0x8cd3,
  COLOR_ATTACHMENT0: 0x8ce0,
  DEPTH_ATTACHMENT: 0x8d00,
  STENCIL_ATTACHMENT: 0x8d20,
  DEPTH_STENCIL_ATTACHMENT: 0x821a,
  NONE: 0,
  FRAMEBUFFER_COMPLETE: 0x8cd5,
  FRAMEBUFFER_INCOMPLETE_ATTACHMENT: 0x8cd6,
  FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT: 0x8cd7,
  FRAMEBUFFER_INCOMPLETE_DIMENSIONS: 0x8cd9,
  FRAMEBUFFER_UNSUPPORTED: 0x8cdd,
  FRAMEBUFFER_BINDING: 0x8ca6,
  RENDERBUFFER_BINDING: 0x8ca7,
  READ_FRAMEBUFFER: 0x8ca8,
  DRAW_FRAMEBUFFER: 0x8ca9,
  MAX_RENDERBUFFER_SIZE: 0x84e8,
  INVALID_FRAMEBUFFER_OPERATION: 0x0506,
  UNPACK_FLIP_Y_WEBGL: 0x9240,
  UNPACK_PREMULTIPLY_ALPHA_WEBGL: 0x9241,
  UNPACK_COLORSPACE_CONVERSION_WEBGL: 0x9243,
  READ_BUFFER: 0x0c02,
  UNPACK_ROW_LENGTH: 0x0cf2,
  UNPACK_SKIP_ROWS: 0x0cf3,
  UNPACK_SKIP_PIXELS: 0x0cf4,
  PACK_ROW_LENGTH: 0x0d02,
  PACK_SKIP_ROWS: 0x0d03,
  PACK_SKIP_PIXELS: 0x0d04,
  TEXTURE_BINDING_3D: 0x806a,
  UNPACK_SKIP_IMAGES: 0x806d,
  UNPACK_IMAGE_HEIGHT: 0x806e,
  MAX_3D_TEXTURE_SIZE: 0x8073,
  MAX_ELEMENTS_VERTICES: 0x80e8,
  MAX_ELEMENTS_INDICES: 0x80e9,
  MAX_TEXTURE_LOD_BIAS: 0x84fd,
  MAX_FRAGMENT_UNIFORM_COMPONENTS: 0x8b49,
  MAX_VERTEX_UNIFORM_COMPONENTS: 0x8b4a,
  MAX_ARRAY_TEXTURE_LAYERS: 0x88ff,
  MIN_PROGRAM_TEXEL_OFFSET: 0x8904,
  MAX_PROGRAM_TEXEL_OFFSET: 0x8905,
  MAX_VARYING_COMPONENTS: 0x8b4b,
  FRAGMENT_SHADER_DERIVATIVE_HINT: 0x8b8b,
  RASTERIZER_DISCARD: 0x8c89,
  VERTEX_ARRAY_BINDING: 0x85b5,
  MAX_VERTEX_OUTPUT_COMPONENTS: 0x9122,
  MAX_FRAGMENT_INPUT_COMPONENTS: 0x9125,
  MAX_SERVER_WAIT_TIMEOUT: 0x9111,
  MAX_ELEMENT_INDEX: 0x8d6b,
  RED: 0x1903,
  RGB8: 0x8051,
  RGBA8: 0x8058,
  RGB10_A2: 0x8059,
  TEXTURE_3D: 0x806f,
  TEXTURE_WRAP_R: 0x8072,
  TEXTURE_MIN_LOD: 0x813a,
  TEXTURE_MAX_LOD: 0x813b,
  TEXTURE_BASE_LEVEL: 0x813c,
  TEXTURE_MAX_LEVEL: 0x813d,
  TEXTURE_COMPARE_MODE: 0x884c,
  TEXTURE_COMPARE_FUNC: 0x884d,
  SRGB: 0x8c40,
  SRGB8: 0x8c41,
  SRGB8_ALPHA8: 0x8c43,
  COMPARE_REF_TO_TEXTURE: 0x884e,
  RGBA32F: 0x8814,
  RGB32F: 0x8815,
  RGBA16F: 0x881a,
  RGB16F: 0x881b,
  TEXTURE_2D_ARRAY: 0x8c1a,
  TEXTURE_BINDING_2D_ARRAY: 0x8c1d,
  R11F_G11F_B10F: 0x8c3a,
  RGB9_E5: 0x8c3d,
  RGBA32UI: 0x8d70,
  RGB32UI: 0x8d71,
  RGBA16UI: 0x8d76,
  RGB16UI: 0x8d77,
  RGBA8UI: 0x8d7c,
  RGB8UI: 0x8d7d,
  RGBA32I: 0x8d82,
  RGB32I: 0x8d83,
  RGBA16I: 0x8d88,
  RGB16I: 0x8d89,
  RGBA8I: 0x8d8e,
  RGB8I: 0x8d8f,
  RED_INTEGER: 0x8d94,
  RGB_INTEGER: 0x8d98,
  RGBA_INTEGER: 0x8d99,
  R8: 0x8229,
  RG8: 0x822b,
  R16F: 0x822d,
  R32F: 0x822e,
  RG16F: 0x822f,
  RG32F: 0x8230,
  R8I: 0x8231,
  R8UI: 0x8232,
  R16I: 0x8233,
  R16UI: 0x8234,
  R32I: 0x8235,
  R32UI: 0x8236,
  RG8I: 0x8237,
  RG8UI: 0x8238,
  RG16I: 0x8239,
  RG16UI: 0x823a,
  RG32I: 0x823b,
  RG32UI: 0x823c,
  R8_SNORM: 0x8f94,
  RG8_SNORM: 0x8f95,
  RGB8_SNORM: 0x8f96,
  RGBA8_SNORM: 0x8f97,
  RGB10_A2UI: 0x906f,
  TEXTURE_IMMUTABLE_FORMAT: 0x912f,
  TEXTURE_IMMUTABLE_LEVELS: 0x82df,
  UNSIGNED_INT_2_10_10_10_REV: 0x8368,
  UNSIGNED_INT_10F_11F_11F_REV: 0x8c3b,
  UNSIGNED_INT_5_9_9_9_REV: 0x8c3e,
  FLOAT_32_UNSIGNED_INT_24_8_REV: 0x8dad,
  UNSIGNED_INT_24_8: 0x84fa,
  HALF_FLOAT: 0x140b,
  RG: 0x8227,
  RG_INTEGER: 0x8228,
  INT_2_10_10_10_REV: 0x8d9f,
  CURRENT_QUERY: 0x8865,
  QUERY_RESULT: 0x8866,
  QUERY_RESULT_AVAILABLE: 0x8867,
  ANY_SAMPLES_PASSED: 0x8c2f,
  ANY_SAMPLES_PASSED_CONSERVATIVE: 0x8d6a,
  MAX_DRAW_BUFFERS: 0x8824,
  DRAW_BUFFER0: 0x8825,
  DRAW_BUFFER1: 0x8826,
  DRAW_BUFFER2: 0x8827,
  DRAW_BUFFER3: 0x8828,
  DRAW_BUFFER4: 0x8829,
  DRAW_BUFFER5: 0x882a,
  DRAW_BUFFER6: 0x882b,
  DRAW_BUFFER7: 0x882c,
  DRAW_BUFFER8: 0x882d,
  DRAW_BUFFER9: 0x882e,
  DRAW_BUFFER10: 0x882f,
  DRAW_BUFFER11: 0x8830,
  DRAW_BUFFER12: 0x8831,
  DRAW_BUFFER13: 0x8832,
  DRAW_BUFFER14: 0x8833,
  DRAW_BUFFER15: 0x8834,
  MAX_COLOR_ATTACHMENTS: 0x8cdf,
  COLOR_ATTACHMENT1: 0x8ce1,
  COLOR_ATTACHMENT2: 0x8ce2,
  COLOR_ATTACHMENT3: 0x8ce3,
  COLOR_ATTACHMENT4: 0x8ce4,
  COLOR_ATTACHMENT5: 0x8ce5,
  COLOR_ATTACHMENT6: 0x8ce6,
  COLOR_ATTACHMENT7: 0x8ce7,
  COLOR_ATTACHMENT8: 0x8ce8,
  COLOR_ATTACHMENT9: 0x8ce9,
  COLOR_ATTACHMENT10: 0x8cea,
  COLOR_ATTACHMENT11: 0x8ceb,
  COLOR_ATTACHMENT12: 0x8cec,
  COLOR_ATTACHMENT13: 0x8ced,
  COLOR_ATTACHMENT14: 0x8cee,
  COLOR_ATTACHMENT15: 0x8cef,
  SAMPLER_3D: 0x8b5f,
  SAMPLER_2D_SHADOW: 0x8b62,
  SAMPLER_2D_ARRAY: 0x8dc1,
  SAMPLER_2D_ARRAY_SHADOW: 0x8dc4,
  SAMPLER_CUBE_SHADOW: 0x8dc5,
  INT_SAMPLER_2D: 0x8dca,
  INT_SAMPLER_3D: 0x8dcb,
  INT_SAMPLER_CUBE: 0x8dcc,
  INT_SAMPLER_2D_ARRAY: 0x8dcf,
  UNSIGNED_INT_SAMPLER_2D: 0x8dd2,
  UNSIGNED_INT_SAMPLER_3D: 0x8dd3,
  UNSIGNED_INT_SAMPLER_CUBE: 0x8dd4,
  UNSIGNED_INT_SAMPLER_2D_ARRAY: 0x8dd7,
  MAX_SAMPLES: 0x8d57,
  SAMPLER_BINDING: 0x8919,
  PIXEL_PACK_BUFFER: 0x88eb,
  PIXEL_UNPACK_BUFFER: 0x88ec,
  PIXEL_PACK_BUFFER_BINDING: 0x88ed,
  PIXEL_UNPACK_BUFFER_BINDING: 0x88ef,
  COPY_READ_BUFFER: 0x8f36,
  COPY_WRITE_BUFFER: 0x8f37,
  COPY_READ_BUFFER_BINDING: 0x8f36,
  COPY_WRITE_BUFFER_BINDING: 0x8f37,
  FLOAT_MAT2x3: 0x8b65,
  FLOAT_MAT2x4: 0x8b66,
  FLOAT_MAT3x2: 0x8b67,
  FLOAT_MAT3x4: 0x8b68,
  FLOAT_MAT4x2: 0x8b69,
  FLOAT_MAT4x3: 0x8b6a,
  UNSIGNED_INT_VEC2: 0x8dc6,
  UNSIGNED_INT_VEC3: 0x8dc7,
  UNSIGNED_INT_VEC4: 0x8dc8,
  UNSIGNED_NORMALIZED: 0x8c17,
  SIGNED_NORMALIZED: 0x8f9c,
  VERTEX_ATTRIB_ARRAY_INTEGER: 0x88fd,
  VERTEX_ATTRIB_ARRAY_DIVISOR: 0x88fe,
  TRANSFORM_FEEDBACK_BUFFER_MODE: 0x8c7f,
  MAX_TRANSFORM_FEEDBACK_SEPARATE_COMPONENTS: 0x8c80,
  TRANSFORM_FEEDBACK_VARYINGS: 0x8c83,
  TRANSFORM_FEEDBACK_BUFFER_START: 0x8c84,
  TRANSFORM_FEEDBACK_BUFFER_SIZE: 0x8c85,
  TRANSFORM_FEEDBACK_PRIMITIVES_WRITTEN: 0x8c88,
  MAX_TRANSFORM_FEEDBACK_INTERLEAVED_COMPONENTS: 0x8c8a,
  MAX_TRANSFORM_FEEDBACK_SEPARATE_ATTRIBS: 0x8c8b,
  INTERLEAVED_ATTRIBS: 0x8c8c,
  SEPARATE_ATTRIBS: 0x8c8d,
  TRANSFORM_FEEDBACK_BUFFER: 0x8c8e,
  TRANSFORM_FEEDBACK_BUFFER_BINDING: 0x8c8f,
  TRANSFORM_FEEDBACK: 0x8e22,
  TRANSFORM_FEEDBACK_PAUSED: 0x8e23,
  TRANSFORM_FEEDBACK_ACTIVE: 0x8e24,
  TRANSFORM_FEEDBACK_BINDING: 0x8e25,
  FRAMEBUFFER_ATTACHMENT_COLOR_ENCODING: 0x8210,
  FRAMEBUFFER_ATTACHMENT_COMPONENT_TYPE: 0x8211,
  FRAMEBUFFER_ATTACHMENT_RED_SIZE: 0x8212,
  FRAMEBUFFER_ATTACHMENT_GREEN_SIZE: 0x8213,
  FRAMEBUFFER_ATTACHMENT_BLUE_SIZE: 0x8214,
  FRAMEBUFFER_ATTACHMENT_ALPHA_SIZE: 0x8215,
  FRAMEBUFFER_ATTACHMENT_DEPTH_SIZE: 0x8216,
  FRAMEBUFFER_ATTACHMENT_STENCIL_SIZE: 0x8217,
  FRAMEBUFFER_DEFAULT: 0x8218,
  DEPTH24_STENCIL8: 0x88f0,
  DRAW_FRAMEBUFFER_BINDING: 0x8ca6,
  READ_FRAMEBUFFER_BINDING: 0x8caa,
  RENDERBUFFER_SAMPLES: 0x8cab,
  FRAMEBUFFER_ATTACHMENT_TEXTURE_LAYER: 0x8cd4,
  FRAMEBUFFER_INCOMPLETE_MULTISAMPLE: 0x8d56,
  UNIFORM_BUFFER: 0x8a11,
  UNIFORM_BUFFER_BINDING: 0x8a28,
  UNIFORM_BUFFER_START: 0x8a29,
  UNIFORM_BUFFER_SIZE: 0x8a2a,
  MAX_VERTEX_UNIFORM_BLOCKS: 0x8a2b,
  MAX_FRAGMENT_UNIFORM_BLOCKS: 0x8a2d,
  MAX_COMBINED_UNIFORM_BLOCKS: 0x8a2e,
  MAX_UNIFORM_BUFFER_BINDINGS: 0x8a2f,
  MAX_UNIFORM_BLOCK_SIZE: 0x8a30,
  MAX_COMBINED_VERTEX_UNIFORM_COMPONENTS: 0x8a31,
  MAX_COMBINED_FRAGMENT_UNIFORM_COMPONENTS: 0x8a33,
  UNIFORM_BUFFER_OFFSET_ALIGNMENT: 0x8a34,
  ACTIVE_UNIFORM_BLOCKS: 0x8a36,
  UNIFORM_TYPE: 0x8a37,
  UNIFORM_SIZE: 0x8a38,
  UNIFORM_BLOCK_INDEX: 0x8a3a,
  UNIFORM_OFFSET: 0x8a3b,
  UNIFORM_ARRAY_STRIDE: 0x8a3c,
  UNIFORM_MATRIX_STRIDE: 0x8a3d,
  UNIFORM_IS_ROW_MAJOR: 0x8a3e,
  UNIFORM_BLOCK_BINDING: 0x8a3f,
  UNIFORM_BLOCK_DATA_SIZE: 0x8a40,
  UNIFORM_BLOCK_ACTIVE_UNIFORMS: 0x8a42,
  UNIFORM_BLOCK_ACTIVE_UNIFORM_INDICES: 0x8a43,
  UNIFORM_BLOCK_REFERENCED_BY_VERTEX_SHADER: 0x8a44,
  UNIFORM_BLOCK_REFERENCED_BY_FRAGMENT_SHADER: 0x8a46,
  OBJECT_TYPE: 0x9112,
  SYNC_CONDITION: 0x9113,
  SYNC_STATUS: 0x9114,
  SYNC_FLAGS: 0x9115,
  SYNC_FENCE: 0x9116,
  SYNC_GPU_COMMANDS_COMPLETE: 0x9117,
  UNSIGNALED: 0x9118,
  SIGNALED: 0x9119,
  ALREADY_SIGNALED: 0x911a,
  TIMEOUT_EXPIRED: 0x911b,
  CONDITION_SATISFIED: 0x911c,
  WAIT_FAILED: 0x911d,
  SYNC_FLUSH_COMMANDS_BIT: 0x00000001,
  COLOR: 0x1800,
  DEPTH: 0x1801,
  STENCIL: 0x1802,
  MIN: 0x8007,
  MAX: 0x8008,
  DEPTH_COMPONENT24: 0x81a6,
  STREAM_READ: 0x88e1,
  STREAM_COPY: 0x88e2,
  STATIC_READ: 0x88e5,
  STATIC_COPY: 0x88e6,
  DYNAMIC_READ: 0x88e9,
  DYNAMIC_COPY: 0x88ea,
  DEPTH_COMPONENT32F: 0x8cac,
  DEPTH32F_STENCIL8: 0x8cad,
  INVALID_INDEX: 0xffffffff,
  TIMEOUT_IGNORED: -1,
  MAX_CLIENT_WAIT_TIMEOUT_WEBGL: 0x9247,
  VERTEX_ATTRIB_ARRAY_DIVISOR_ANGLE: 0x88fe,
  UNMASKED_VENDOR_WEBGL: 0x9245,
  UNMASKED_RENDERER_WEBGL: 0x9246,
  MAX_TEXTURE_MAX_ANISOTROPY_EXT: 0x84ff,
  TEXTURE_MAX_ANISOTROPY_EXT: 0x84fe,
  COMPRESSED_RGB_S3TC_DXT1_EXT: 0x83f0,
  COMPRESSED_RGBA_S3TC_DXT1_EXT: 0x83f1,
  COMPRESSED_RGBA_S3TC_DXT3_EXT: 0x83f2,
  COMPRESSED_RGBA_S3TC_DXT5_EXT: 0x83f3,
  COMPRESSED_R11_EAC: 0x9270,
  COMPRESSED_SIGNED_R11_EAC: 0x9271,
  COMPRESSED_RG11_EAC: 0x9272,
  COMPRESSED_SIGNED_RG11_EAC: 0x9273,
  COMPRESSED_RGB8_ETC2: 0x9274,
  COMPRESSED_RGBA8_ETC2_EAC: 0x9275,
  COMPRESSED_SRGB8_ETC2: 0x9276,
  COMPRESSED_SRGB8_ALPHA8_ETC2_EAC: 0x9277,
  COMPRESSED_RGB8_PUNCHTHROUGH_ALPHA1_ETC2: 0x9278,
  COMPRESSED_SRGB8_PUNCHTHROUGH_ALPHA1_ETC2: 0x9279,
  COMPRESSED_RGB_PVRTC_4BPPV1_IMG: 0x8c00,
  COMPRESSED_RGBA_PVRTC_4BPPV1_IMG: 0x8c02,
  COMPRESSED_RGB_PVRTC_2BPPV1_IMG: 0x8c01,
  COMPRESSED_RGBA_PVRTC_2BPPV1_IMG: 0x8c03,
  COMPRESSED_RGB_ETC1_WEBGL: 0x8d64,
  COMPRESSED_RGB_ATC_WEBGL: 0x8c92,
  COMPRESSED_RGBA_ATC_EXPLICIT_ALPHA_WEBGL: 0x8c92,
  COMPRESSED_RGBA_ATC_INTERPOLATED_ALPHA_WEBGL: 0x87ee,
  UNSIGNED_INT_24_8_WEBGL: 0x84fa,
  HALF_FLOAT_OES: 0x8d61,
  RGBA32F_EXT: 0x8814,
  RGB32F_EXT: 0x8815,
  FRAMEBUFFER_ATTACHMENT_COMPONENT_TYPE_EXT: 0x8211,
  UNSIGNED_NORMALIZED_EXT: 0x8c17,
  MIN_EXT: 0x8007,
  MAX_EXT: 0x8008,
  SRGB_EXT: 0x8c40,
  SRGB_ALPHA_EXT: 0x8c42,
  SRGB8_ALPHA8_EXT: 0x8c43,
  FRAMEBUFFER_ATTACHMENT_COLOR_ENCODING_EXT: 0x8210,
  FRAGMENT_SHADER_DERIVATIVE_HINT_OES: 0x8b8b,
  COLOR_ATTACHMENT0_WEBGL: 0x8ce0,
  COLOR_ATTACHMENT1_WEBGL: 0x8ce1,
  COLOR_ATTACHMENT2_WEBGL: 0x8ce2,
  COLOR_ATTACHMENT3_WEBGL: 0x8ce3,
  COLOR_ATTACHMENT4_WEBGL: 0x8ce4,
  COLOR_ATTACHMENT5_WEBGL: 0x8ce5,
  COLOR_ATTACHMENT6_WEBGL: 0x8ce6,
  COLOR_ATTACHMENT7_WEBGL: 0x8ce7,
  COLOR_ATTACHMENT8_WEBGL: 0x8ce8,
  COLOR_ATTACHMENT9_WEBGL: 0x8ce9,
  COLOR_ATTACHMENT10_WEBGL: 0x8cea,
  COLOR_ATTACHMENT11_WEBGL: 0x8ceb,
  COLOR_ATTACHMENT12_WEBGL: 0x8cec,
  COLOR_ATTACHMENT13_WEBGL: 0x8ced,
  COLOR_ATTACHMENT14_WEBGL: 0x8cee,
  COLOR_ATTACHMENT15_WEBGL: 0x8cef,
  DRAW_BUFFER0_WEBGL: 0x8825,
  DRAW_BUFFER1_WEBGL: 0x8826,
  DRAW_BUFFER2_WEBGL: 0x8827,
  DRAW_BUFFER3_WEBGL: 0x8828,
  DRAW_BUFFER4_WEBGL: 0x8829,
  DRAW_BUFFER5_WEBGL: 0x882a,
  DRAW_BUFFER6_WEBGL: 0x882b,
  DRAW_BUFFER7_WEBGL: 0x882c,
  DRAW_BUFFER8_WEBGL: 0x882d,
  DRAW_BUFFER9_WEBGL: 0x882e,
  DRAW_BUFFER10_WEBGL: 0x882f,
  DRAW_BUFFER11_WEBGL: 0x8830,
  DRAW_BUFFER12_WEBGL: 0x8831,
  DRAW_BUFFER13_WEBGL: 0x8832,
  DRAW_BUFFER14_WEBGL: 0x8833,
  DRAW_BUFFER15_WEBGL: 0x8834,
  MAX_COLOR_ATTACHMENTS_WEBGL: 0x8cdf,
  MAX_DRAW_BUFFERS_WEBGL: 0x8824,
  VERTEX_ARRAY_BINDING_OES: 0x85b5,
  QUERY_COUNTER_BITS_EXT: 0x8864,
  CURRENT_QUERY_EXT: 0x8865,
  QUERY_RESULT_EXT: 0x8866,
  QUERY_RESULT_AVAILABLE_EXT: 0x8867,
  TIME_ELAPSED_EXT: 0x88bf,
  TIMESTAMP_EXT: 0x8e28,
  GPU_DISJOINT_EXT: 0x8fbb
};

var DEFAULT_INDICES = new Uint16Array([0, 2, 1, 0, 3, 2]);
var DEFAULT_TEX_COORDS = new Float32Array([0, 1, 0, 0, 1, 0, 1, 1]);
function createMesh(bounds, resolution) {
  if (!resolution) {
    return createQuad(bounds);
  }

  var maxXSpan = Math.max(Math.abs(bounds[0][0] - bounds[3][0]), Math.abs(bounds[1][0] - bounds[2][0]));
  var maxYSpan = Math.max(Math.abs(bounds[1][1] - bounds[0][1]), Math.abs(bounds[2][1] - bounds[3][1]));
  var uCount = Math.ceil(maxXSpan / resolution) + 1;
  var vCount = Math.ceil(maxYSpan / resolution) + 1;
  var vertexCount = (uCount - 1) * (vCount - 1) * 6;
  var indices = new Uint32Array(vertexCount);
  var texCoords = new Float32Array(uCount * vCount * 2);
  var positions = new Float64Array(uCount * vCount * 3);
  var vertex = 0;
  var index = 0;

  for (var u = 0; u < uCount; u++) {
    var ut = u / (uCount - 1);

    for (var v = 0; v < vCount; v++) {
      var vt = v / (vCount - 1);
      var p = interpolateQuad(bounds, ut, vt);
      positions[vertex * 3 + 0] = p[0];
      positions[vertex * 3 + 1] = p[1];
      positions[vertex * 3 + 2] = p[2] || 0;
      texCoords[vertex * 2 + 0] = ut;
      texCoords[vertex * 2 + 1] = 1 - vt;

      if (u > 0 && v > 0) {
        indices[index++] = vertex - vCount;
        indices[index++] = vertex - vCount - 1;
        indices[index++] = vertex - 1;
        indices[index++] = vertex - vCount;
        indices[index++] = vertex - 1;
        indices[index++] = vertex;
      }

      vertex++;
    }
  }

  return {
    vertexCount: vertexCount,
    positions: positions,
    indices: indices,
    texCoords: texCoords
  };
}

function createQuad(bounds) {
  var positions = new Float64Array(12);

  for (var i = 0; i < bounds.length; i++) {
    positions[i * 3 + 0] = bounds[i][0];
    positions[i * 3 + 1] = bounds[i][1];
    positions[i * 3 + 2] = bounds[i][2] || 0;
  }

  return {
    vertexCount: 6,
    positions: positions,
    indices: DEFAULT_INDICES,
    texCoords: DEFAULT_TEX_COORDS
  };
}

function interpolateQuad(quad, ut, vt) {
  return lerp(lerp(quad[0], quad[1], vt), lerp(quad[3], quad[2], vt), ut);
}

var vs$2 = "\n#define SHADER_NAME bitmap-layer-vertex-shader\n\nattribute vec2 texCoords;\nattribute vec3 positions;\nattribute vec3 positions64Low;\n\nvarying vec2 vTexCoord;\nvarying vec2 vTexPos;\n\nuniform float coordinateConversion;\n\nconst vec3 pickingColor = vec3(1.0, 0.0, 0.0);\n\nvoid main(void) {\n  geometry.worldPosition = positions;\n  geometry.uv = texCoords;\n  geometry.pickingColor = pickingColor;\n\n  gl_Position = project_position_to_clipspace(positions, positions64Low, vec3(0.0), geometry.position);\n  DECKGL_FILTER_GL_POSITION(gl_Position, geometry);\n\n  vTexCoord = texCoords;\n\n  if (coordinateConversion < -0.5) {\n    vTexPos = geometry.position.xy;\n  } else if (coordinateConversion > 0.5) {\n    vTexPos = geometry.worldPosition.xy;\n  }\n\n  vec4 color = vec4(0.0);\n  DECKGL_FILTER_COLOR(color, geometry);\n}\n";

var fs = "\n#define SHADER_NAME bitmap-layer-fragment-shader\n\n#ifdef GL_ES\nprecision highp float;\n#endif\n\nuniform sampler2D bitmapTexture;\n\nvarying vec2 vTexCoord;\nvarying vec2 vTexPos;\n\nuniform float desaturate;\nuniform vec4 transparentColor;\nuniform vec3 tintColor;\nuniform float opacity;\n\nuniform float coordinateConversion;\nuniform vec4 bounds;\n\n/* projection utils */\nconst float TILE_SIZE = 512.0;\nconst float PI = 3.1415926536;\nconst float WORLD_SCALE = TILE_SIZE / PI / 2.0;\n\n// from degrees to Web Mercator\nvec2 lnglat_to_mercator(vec2 lnglat) {\n  float x = lnglat.x;\n  float y = clamp(lnglat.y, -89.9, 89.9);\n  return vec2(\n    radians(x) + PI,\n    PI + log(tan(PI * 0.25 + radians(y) * 0.5))\n  ) * WORLD_SCALE;\n}\n\n// from Web Mercator to degrees\nvec2 mercator_to_lnglat(vec2 xy) {\n  xy /= WORLD_SCALE;\n  return degrees(vec2(\n    xy.x - PI,\n    atan(exp(xy.y - PI)) * 2.0 - PI * 0.5\n  ));\n}\n/* End projection utils */\n\n// apply desaturation\nvec3 color_desaturate(vec3 color) {\n  float luminance = (color.r + color.g + color.b) * 0.333333333;\n  return mix(color, vec3(luminance), desaturate);\n}\n\n// apply tint\nvec3 color_tint(vec3 color) {\n  return color * tintColor;\n}\n\n// blend with background color\nvec4 apply_opacity(vec3 color, float alpha) {\n  return mix(transparentColor, vec4(color, 1.0), alpha);\n}\n\nvec2 getUV(vec2 pos) {\n  return vec2(\n    (pos.x - bounds[0]) / (bounds[2] - bounds[0]),\n    (pos.y - bounds[3]) / (bounds[1] - bounds[3])\n  );\n}\n\nvoid main(void) {\n  vec2 uv = vTexCoord;\n  if (coordinateConversion < -0.5) {\n    vec2 lnglat = mercator_to_lnglat(vTexPos);\n    uv = getUV(lnglat);\n  } else if (coordinateConversion > 0.5) {\n    vec2 commonPos = lnglat_to_mercator(vTexPos);\n    uv = getUV(commonPos);\n  }\n  vec4 bitmapColor = texture2D(bitmapTexture, uv);\n\n  gl_FragColor = apply_opacity(color_tint(color_desaturate(bitmapColor.rgb)), bitmapColor.a * opacity);\n\n  geometry.uv = uv;\n  DECKGL_FILTER_COLOR(gl_FragColor, geometry);\n}\n";

function ownKeys$9(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread$9(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys$9(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys$9(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _createSuper$h(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct$h(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _isNativeReflectConstruct$h() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }
var defaultProps$2 = {
  image: {
    type: 'image',
    value: null,
    async: true
  },
  bounds: {
    type: 'array',
    value: [1, 0, 0, 1],
    compare: true
  },
  _imageCoordinateSystem: COORDINATE_SYSTEM.DEFAULT,
  desaturate: {
    type: 'number',
    min: 0,
    max: 1,
    value: 0
  },
  transparentColor: {
    type: 'color',
    value: [0, 0, 0, 0]
  },
  tintColor: {
    type: 'color',
    value: [255, 255, 255]
  }
};

var BitmapLayer = function (_Layer) {
  _inherits(BitmapLayer, _Layer);

  var _super = _createSuper$h(BitmapLayer);

  function BitmapLayer() {
    _classCallCheck(this, BitmapLayer);

    return _super.apply(this, arguments);
  }

  _createClass(BitmapLayer, [{
    key: "getShaders",
    value: function getShaders() {
      return _get(_getPrototypeOf(BitmapLayer.prototype), "getShaders", this).call(this, {
        vs: vs$2,
        fs: fs,
        modules: [project32, picking]
      });
    }
  }, {
    key: "initializeState",
    value: function initializeState() {
      var _this = this;

      var attributeManager = this.getAttributeManager();
      attributeManager.remove(['instancePickingColors']);
      var noAlloc = true;
      attributeManager.add({
        indices: {
          size: 1,
          isIndexed: true,
          update: function update(attribute) {
            return attribute.value = _this.state.mesh.indices;
          },
          noAlloc: noAlloc
        },
        positions: {
          size: 3,
          type: 5130,
          fp64: this.use64bitPositions(),
          update: function update(attribute) {
            return attribute.value = _this.state.mesh.positions;
          },
          noAlloc: noAlloc
        },
        texCoords: {
          size: 2,
          update: function update(attribute) {
            return attribute.value = _this.state.mesh.texCoords;
          },
          noAlloc: noAlloc
        }
      });
    }
  }, {
    key: "updateState",
    value: function updateState(_ref) {
      var props = _ref.props,
          oldProps = _ref.oldProps,
          changeFlags = _ref.changeFlags;

      if (changeFlags.extensionsChanged) {
        var gl = this.context.gl;

        if (this.state.model) {
          this.state.model["delete"]();
        }

        this.setState({
          model: this._getModel(gl)
        });
        this.getAttributeManager().invalidateAll();
      }

      var attributeManager = this.getAttributeManager();

      if (props.bounds !== oldProps.bounds) {
        var oldMesh = this.state.mesh;

        var mesh = this._createMesh();

        this.state.model.setVertexCount(mesh.vertexCount);

        for (var key in mesh) {
          if (oldMesh && oldMesh[key] !== mesh[key]) {
            attributeManager.invalidate(key);
          }
        }

        this.setState(_objectSpread$9({
          mesh: mesh
        }, this._getCoordinateUniforms()));
      } else if (props._imageCoordinateSystem !== oldProps._imageCoordinateSystem) {
        this.setState(this._getCoordinateUniforms());
      }
    }
  }, {
    key: "_createMesh",
    value: function _createMesh() {
      var bounds = this.props.bounds;
      var normalizedBounds = bounds;

      if (Number.isFinite(bounds[0])) {
        normalizedBounds = [[bounds[0], bounds[1]], [bounds[0], bounds[3]], [bounds[2], bounds[3]], [bounds[2], bounds[1]]];
      }

      return createMesh(normalizedBounds, this.context.viewport.resolution);
    }
  }, {
    key: "_getModel",
    value: function _getModel(gl) {
      if (!gl) {
        return null;
      }

      return new Model(gl, Object.assign({}, this.getShaders(), {
        id: this.props.id,
        geometry: new Geometry({
          drawMode: 4,
          vertexCount: 6
        }),
        isInstanced: false
      }));
    }
  }, {
    key: "draw",
    value: function draw(opts) {
      var uniforms = opts.uniforms;
      var _this$state = this.state,
          model = _this$state.model,
          coordinateConversion = _this$state.coordinateConversion,
          bounds = _this$state.bounds;
      var _this$props = this.props,
          image = _this$props.image,
          desaturate = _this$props.desaturate,
          transparentColor = _this$props.transparentColor,
          tintColor = _this$props.tintColor;

      if (image && model) {
        model.setUniforms(uniforms).setUniforms({
          bitmapTexture: image,
          desaturate: desaturate,
          transparentColor: transparentColor.map(function (x) {
            return x / 255;
          }),
          tintColor: tintColor.slice(0, 3).map(function (x) {
            return x / 255;
          }),
          coordinateConversion: coordinateConversion,
          bounds: bounds
        }).draw();
      }
    }
  }, {
    key: "_getCoordinateUniforms",
    value: function _getCoordinateUniforms() {
      var LNGLAT = COORDINATE_SYSTEM.LNGLAT,
          CARTESIAN = COORDINATE_SYSTEM.CARTESIAN,
          DEFAULT = COORDINATE_SYSTEM.DEFAULT;
      var imageCoordinateSystem = this.props._imageCoordinateSystem;

      if (imageCoordinateSystem !== DEFAULT) {
        var bounds = this.props.bounds;

        if (!Number.isFinite(bounds[0])) {
          throw new Error('_imageCoordinateSystem only supports rectangular bounds');
        }

        var defaultImageCoordinateSystem = this.context.viewport.resolution ? LNGLAT : CARTESIAN;
        imageCoordinateSystem = imageCoordinateSystem === LNGLAT ? LNGLAT : CARTESIAN;

        if (imageCoordinateSystem === LNGLAT && defaultImageCoordinateSystem === CARTESIAN) {
          return {
            coordinateConversion: -1,
            bounds: bounds
          };
        }

        if (imageCoordinateSystem === CARTESIAN && defaultImageCoordinateSystem === LNGLAT) {
          var bottomLeft = lngLatToWorld([bounds[0], bounds[1]]);
          var topRight = lngLatToWorld([bounds[2], bounds[3]]);
          return {
            coordinateConversion: 1,
            bounds: [bottomLeft[0], bottomLeft[1], topRight[0], topRight[1]]
          };
        }
      }

      return {
        coordinateConversion: 0,
        bounds: [0, 0, 0, 0]
      };
    }
  }]);

  return BitmapLayer;
}(Layer);
BitmapLayer.layerName = 'BitmapLayer';
BitmapLayer.defaultProps = defaultProps$2;

var vs$3 = "#define SHADER_NAME scatterplot-layer-vertex-shader\n\nattribute vec3 positions;\n\nattribute vec3 instancePositions;\nattribute vec3 instancePositions64Low;\nattribute float instanceRadius;\nattribute float instanceLineWidths;\nattribute vec4 instanceFillColors;\nattribute vec4 instanceLineColors;\nattribute vec3 instancePickingColors;\n\nuniform float opacity;\nuniform float radiusScale;\nuniform float radiusMinPixels;\nuniform float radiusMaxPixels;\nuniform float lineWidthScale;\nuniform float lineWidthMinPixels;\nuniform float lineWidthMaxPixels;\nuniform float stroked;\nuniform bool filled;\n\nvarying vec4 vFillColor;\nvarying vec4 vLineColor;\nvarying vec2 unitPosition;\nvarying float innerUnitRadius;\nvarying float outerRadiusPixels;\n\nvoid main(void) {\n  geometry.worldPosition = instancePositions;\n  outerRadiusPixels = clamp(\n    project_size_to_pixel(radiusScale * instanceRadius),\n    radiusMinPixels, radiusMaxPixels\n  );\n  float lineWidthPixels = clamp(\n    project_size_to_pixel(lineWidthScale * instanceLineWidths),\n    lineWidthMinPixels, lineWidthMaxPixels\n  );\n  outerRadiusPixels += stroked * lineWidthPixels / 2.0;\n  unitPosition = positions.xy;\n  geometry.uv = unitPosition;\n  geometry.pickingColor = instancePickingColors;\n\n  innerUnitRadius = 1.0 - stroked * lineWidthPixels / outerRadiusPixels;\n  \n  vec3 offset = positions * project_pixel_size(outerRadiusPixels);\n  DECKGL_FILTER_SIZE(offset, geometry);\n  gl_Position = project_position_to_clipspace(instancePositions, instancePositions64Low, offset, geometry.position);\n  DECKGL_FILTER_GL_POSITION(gl_Position, geometry);\n  vFillColor = vec4(instanceFillColors.rgb, instanceFillColors.a * opacity);\n  DECKGL_FILTER_COLOR(vFillColor, geometry);\n  vLineColor = vec4(instanceLineColors.rgb, instanceLineColors.a * opacity);\n  DECKGL_FILTER_COLOR(vLineColor, geometry);\n}\n";

var fs$1 = "#define SHADER_NAME scatterplot-layer-fragment-shader\n\nprecision highp float;\n\nuniform bool filled;\nuniform float stroked;\n\nvarying vec4 vFillColor;\nvarying vec4 vLineColor;\nvarying vec2 unitPosition;\nvarying float innerUnitRadius;\nvarying float outerRadiusPixels;\n\nvoid main(void) {\n  geometry.uv = unitPosition;\n\n  float distToCenter = length(unitPosition) * outerRadiusPixels;\n  float inCircle = smoothedge(distToCenter, outerRadiusPixels);\n\n  if (inCircle == 0.0) {\n    discard;\n  }\n\n  if (stroked > 0.5) {\n    float isLine = smoothedge(innerUnitRadius * outerRadiusPixels, distToCenter);\n    if (filled) {\n      gl_FragColor = mix(vFillColor, vLineColor, isLine);\n    } else {\n      if (isLine == 0.0) {\n        discard;\n      }\n      gl_FragColor = vec4(vLineColor.rgb, vLineColor.a * isLine);\n    }\n  } else if (filled) {\n    gl_FragColor = vFillColor;\n  } else {\n    discard;\n  }\n\n  gl_FragColor.a *= inCircle;\n  DECKGL_FILTER_COLOR(gl_FragColor, geometry);\n}\n";

function _createSuper$i(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct$i(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _isNativeReflectConstruct$i() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }
var DEFAULT_COLOR = [0, 0, 0, 255];
var defaultProps$3 = {
  radiusUnits: 'meters',
  radiusScale: {
    type: 'number',
    min: 0,
    value: 1
  },
  radiusMinPixels: {
    type: 'number',
    min: 0,
    value: 0
  },
  radiusMaxPixels: {
    type: 'number',
    min: 0,
    value: Number.MAX_SAFE_INTEGER
  },
  lineWidthUnits: 'meters',
  lineWidthScale: {
    type: 'number',
    min: 0,
    value: 1
  },
  lineWidthMinPixels: {
    type: 'number',
    min: 0,
    value: 0
  },
  lineWidthMaxPixels: {
    type: 'number',
    min: 0,
    value: Number.MAX_SAFE_INTEGER
  },
  stroked: false,
  filled: true,
  getPosition: {
    type: 'accessor',
    value: function value(x) {
      return x.position;
    }
  },
  getRadius: {
    type: 'accessor',
    value: 1
  },
  getFillColor: {
    type: 'accessor',
    value: DEFAULT_COLOR
  },
  getLineColor: {
    type: 'accessor',
    value: DEFAULT_COLOR
  },
  getLineWidth: {
    type: 'accessor',
    value: 1
  },
  strokeWidth: {
    deprecatedFor: 'getLineWidth'
  },
  outline: {
    deprecatedFor: 'stroked'
  },
  getColor: {
    deprecatedFor: ['getFillColor', 'getLineColor']
  }
};

var ScatterplotLayer = function (_Layer) {
  _inherits(ScatterplotLayer, _Layer);

  var _super = _createSuper$i(ScatterplotLayer);

  function ScatterplotLayer() {
    _classCallCheck(this, ScatterplotLayer);

    return _super.apply(this, arguments);
  }

  _createClass(ScatterplotLayer, [{
    key: "getShaders",
    value: function getShaders() {
      return _get(_getPrototypeOf(ScatterplotLayer.prototype), "getShaders", this).call(this, {
        vs: vs$3,
        fs: fs$1,
        modules: [project32, picking]
      });
    }
  }, {
    key: "initializeState",
    value: function initializeState() {
      this.getAttributeManager().addInstanced({
        instancePositions: {
          size: 3,
          type: 5130,
          fp64: this.use64bitPositions(),
          transition: true,
          accessor: 'getPosition'
        },
        instanceRadius: {
          size: 1,
          transition: true,
          accessor: 'getRadius',
          defaultValue: 1
        },
        instanceFillColors: {
          size: this.props.colorFormat.length,
          transition: true,
          normalized: true,
          type: 5121,
          accessor: 'getFillColor',
          defaultValue: [0, 0, 0, 255]
        },
        instanceLineColors: {
          size: this.props.colorFormat.length,
          transition: true,
          normalized: true,
          type: 5121,
          accessor: 'getLineColor',
          defaultValue: [0, 0, 0, 255]
        },
        instanceLineWidths: {
          size: 1,
          transition: true,
          accessor: 'getLineWidth',
          defaultValue: 1
        }
      });
    }
  }, {
    key: "updateState",
    value: function updateState(_ref) {
      var props = _ref.props,
          oldProps = _ref.oldProps,
          changeFlags = _ref.changeFlags;

      _get(_getPrototypeOf(ScatterplotLayer.prototype), "updateState", this).call(this, {
        props: props,
        oldProps: oldProps,
        changeFlags: changeFlags
      });

      if (changeFlags.extensionsChanged) {
        var gl = this.context.gl;

        if (this.state.model) {
          this.state.model["delete"]();
        }

        this.setState({
          model: this._getModel(gl)
        });
        this.getAttributeManager().invalidateAll();
      }
    }
  }, {
    key: "draw",
    value: function draw(_ref2) {
      var uniforms = _ref2.uniforms;
      var viewport = this.context.viewport;
      var _this$props = this.props,
          radiusUnits = _this$props.radiusUnits,
          radiusScale = _this$props.radiusScale,
          radiusMinPixels = _this$props.radiusMinPixels,
          radiusMaxPixels = _this$props.radiusMaxPixels,
          stroked = _this$props.stroked,
          filled = _this$props.filled,
          lineWidthUnits = _this$props.lineWidthUnits,
          lineWidthScale = _this$props.lineWidthScale,
          lineWidthMinPixels = _this$props.lineWidthMinPixels,
          lineWidthMaxPixels = _this$props.lineWidthMaxPixels;
      var pointRadiusMultiplier = radiusUnits === 'pixels' ? viewport.metersPerPixel : 1;
      var lineWidthMultiplier = lineWidthUnits === 'pixels' ? viewport.metersPerPixel : 1;
      this.state.model.setUniforms(uniforms).setUniforms({
        stroked: stroked ? 1 : 0,
        filled: filled,
        radiusScale: radiusScale * pointRadiusMultiplier,
        radiusMinPixels: radiusMinPixels,
        radiusMaxPixels: radiusMaxPixels,
        lineWidthScale: lineWidthScale * lineWidthMultiplier,
        lineWidthMinPixels: lineWidthMinPixels,
        lineWidthMaxPixels: lineWidthMaxPixels
      }).draw();
    }
  }, {
    key: "_getModel",
    value: function _getModel(gl) {
      var positions = [-1, -1, 0, 1, -1, 0, 1, 1, 0, -1, 1, 0];
      return new Model(gl, Object.assign(this.getShaders(), {
        id: this.props.id,
        geometry: new Geometry({
          drawMode: 6,
          vertexCount: 4,
          attributes: {
            positions: {
              size: 3,
              value: new Float32Array(positions)
            }
          }
        }),
        isInstanced: true
      }));
    }
  }]);

  return ScatterplotLayer;
}(Layer);
ScatterplotLayer.layerName = 'ScatterplotLayer';
ScatterplotLayer.defaultProps = defaultProps$3;

var Polygon = function () {
  function Polygon(points) {
    _classCallCheck(this, Polygon);

    this.points = points;
    this.isClosed = equals$1(this.points[this.points.length - 1], this.points[0]);
    Object.freeze(this);
  }

  _createClass(Polygon, [{
    key: "getSignedArea",
    value: function getSignedArea() {
      var area = 0;
      this.forEachSegment(function (p1, p2) {
        area += (p1[0] + p2[0]) * (p1[1] - p2[1]);
      });
      return area / 2;
    }
  }, {
    key: "getArea",
    value: function getArea() {
      return Math.abs(this.getSignedArea());
    }
  }, {
    key: "getWindingDirection",
    value: function getWindingDirection() {
      return Math.sign(this.getSignedArea());
    }
  }, {
    key: "forEachSegment",
    value: function forEachSegment(visitor) {
      var length = this.points.length;

      for (var i = 0; i < length - 1; i++) {
        visitor(this.points[i], this.points[i + 1], i, i + 1);
      }

      if (!this.isClosed) {
        visitor(this.points[length - 1], this.points[0], length - 1, 0);
      }
    }
  }]);

  return Polygon;
}();

function push(target, source) {
  var size = source.length;
  var startIndex = target.length;

  if (startIndex > 0) {
    var isDuplicate = true;

    for (var i = 0; i < size; i++) {
      if (target[startIndex - size + i] !== source[i]) {
        isDuplicate = false;
        break;
      }
    }

    if (isDuplicate) {
      return false;
    }
  }

  for (var _i = 0; _i < size; _i++) {
    target[startIndex + _i] = source[_i];
  }

  return true;
}
function copy(target, source) {
  var size = source.length;

  for (var i = 0; i < size; i++) {
    target[i] = source[i];
  }
}
function getPointAtIndex(positions, index, size, offset) {
  var out = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : [];
  var startI = offset + index * size;

  for (var i = 0; i < size; i++) {
    out[i] = positions[startI + i];
  }

  return out;
}

function intersect(a, b, edge, bbox) {
  var out = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : [];
  var t;
  var snap;

  if (edge & 8) {
    t = (bbox[3] - a[1]) / (b[1] - a[1]);
    snap = 3;
  } else if (edge & 4) {
    t = (bbox[1] - a[1]) / (b[1] - a[1]);
    snap = 1;
  } else if (edge & 2) {
    t = (bbox[2] - a[0]) / (b[0] - a[0]);
    snap = 2;
  } else if (edge & 1) {
    t = (bbox[0] - a[0]) / (b[0] - a[0]);
    snap = 0;
  } else {
    return null;
  }

  for (var i = 0; i < a.length; i++) {
    out[i] = (snap & 1) === i ? bbox[snap] : t * (b[i] - a[i]) + a[i];
  }

  return out;
}
function bitCode(p, bbox) {
  var code = 0;
  if (p[0] < bbox[0]) code |= 1;else if (p[0] > bbox[2]) code |= 2;
  if (p[1] < bbox[1]) code |= 4;else if (p[1] > bbox[3]) code |= 8;
  return code;
}

function cutPolylineByGrid(positions) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var _options$size = options.size,
      size = _options$size === void 0 ? 2 : _options$size,
      _options$broken = options.broken,
      broken = _options$broken === void 0 ? false : _options$broken,
      _options$gridResoluti = options.gridResolution,
      gridResolution = _options$gridResoluti === void 0 ? 10 : _options$gridResoluti,
      _options$gridOffset = options.gridOffset,
      gridOffset = _options$gridOffset === void 0 ? [0, 0] : _options$gridOffset,
      _options$startIndex = options.startIndex,
      startIndex = _options$startIndex === void 0 ? 0 : _options$startIndex,
      _options$endIndex = options.endIndex,
      endIndex = _options$endIndex === void 0 ? positions.length : _options$endIndex;
  var numPoints = (endIndex - startIndex) / size;
  var part = [];
  var result = [part];
  var a = getPointAtIndex(positions, 0, size, startIndex);
  var b;
  var codeB;
  var cell = getGridCell(a, gridResolution, gridOffset, []);
  var scratchPoint = [];
  push(part, a);

  for (var i = 1; i < numPoints; i++) {
    b = getPointAtIndex(positions, i, size, startIndex, b);
    codeB = bitCode(b, cell);

    while (codeB) {
      intersect(a, b, codeB, cell, scratchPoint);
      var codeAlt = bitCode(scratchPoint, cell);

      if (codeAlt) {
        intersect(a, scratchPoint, codeAlt, cell, scratchPoint);
        codeB = codeAlt;
      }

      push(part, scratchPoint);
      copy(a, scratchPoint);
      moveToNeighborCell(cell, gridResolution, codeB);

      if (broken && part.length > size) {
        part = [];
        result.push(part);
        push(part, a);
      }

      codeB = bitCode(b, cell);
    }

    push(part, b);
    copy(a, b);
  }

  return broken ? result : result[0];
}
var TYPE_INSIDE = 0;
var TYPE_BORDER = 1;

function concatInPlace(arr1, arr2) {
  for (var i = 0; i < arr2.length; i++) {
    arr1.push(arr2[i]);
  }

  return arr1;
}

function cutPolygonByGrid(positions, holeIndices) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  if (!positions.length) {
    return [];
  }

  var _options$size2 = options.size,
      size = _options$size2 === void 0 ? 2 : _options$size2,
      _options$gridResoluti2 = options.gridResolution,
      gridResolution = _options$gridResoluti2 === void 0 ? 10 : _options$gridResoluti2,
      _options$gridOffset2 = options.gridOffset,
      gridOffset = _options$gridOffset2 === void 0 ? [0, 0] : _options$gridOffset2,
      _options$edgeTypes = options.edgeTypes,
      edgeTypes = _options$edgeTypes === void 0 ? false : _options$edgeTypes;
  var result = [];
  var queue = [{
    pos: positions,
    types: edgeTypes && new Array(positions.length / size).fill(TYPE_BORDER),
    holes: holeIndices || []
  }];
  var bbox = [[], []];
  var cell = [];

  while (queue.length) {
    var _queue$shift = queue.shift(),
        pos = _queue$shift.pos,
        types = _queue$shift.types,
        holes = _queue$shift.holes;

    getBoundingBox(pos, size, holes[0] || pos.length, bbox);
    cell = getGridCell(bbox[0], gridResolution, gridOffset, cell);
    var code = bitCode(bbox[1], cell);

    if (code) {
      var parts = bisectPolygon(pos, types, size, 0, holes[0] || pos.length, cell, code);
      var polygonLow = {
        pos: parts[0].pos,
        types: parts[0].types,
        holes: []
      };
      var polygonHigh = {
        pos: parts[1].pos,
        types: parts[1].types,
        holes: []
      };
      queue.push(polygonLow, polygonHigh);

      for (var i = 0; i < holes.length; i++) {
        parts = bisectPolygon(pos, types, size, holes[i], holes[i + 1] || pos.length, cell, code);

        if (parts[0]) {
          polygonLow.holes.push(polygonLow.pos.length);
          polygonLow.pos = concatInPlace(polygonLow.pos, parts[0].pos);

          if (edgeTypes) {
            polygonLow.types = concatInPlace(polygonLow.types, parts[0].types);
          }
        }

        if (parts[1]) {
          polygonHigh.holes.push(polygonHigh.pos.length);
          polygonHigh.pos = concatInPlace(polygonHigh.pos, parts[1].pos);

          if (edgeTypes) {
            polygonHigh.types = concatInPlace(polygonHigh.types, parts[1].types);
          }
        }
      }
    } else {
      var polygon = {
        positions: pos
      };

      if (edgeTypes) {
        polygon.edgeTypes = types;
      }

      if (holes.length) {
        polygon.holeIndices = holes;
      }

      result.push(polygon);
    }
  }

  return result;
}

function bisectPolygon(positions, edgeTypes, size, startIndex, endIndex, bbox, edge) {
  var numPoints = (endIndex - startIndex) / size;
  var resultLow = [];
  var resultHigh = [];
  var typesLow = [];
  var typesHigh = [];
  var scratchPoint = [];
  var p;
  var side;
  var type;
  var prev = getPointAtIndex(positions, numPoints - 1, size, startIndex);
  var prevSide = Math.sign(edge & 8 ? prev[1] - bbox[3] : prev[0] - bbox[2]);
  var prevType = edgeTypes && edgeTypes[numPoints - 1];
  var lowPointCount = 0;
  var highPointCount = 0;

  for (var i = 0; i < numPoints; i++) {
    p = getPointAtIndex(positions, i, size, startIndex, p);
    side = Math.sign(edge & 8 ? p[1] - bbox[3] : p[0] - bbox[2]);
    type = edgeTypes && edgeTypes[startIndex / size + i];

    if (side && prevSide && prevSide !== side) {
      intersect(prev, p, edge, bbox, scratchPoint);
      push(resultLow, scratchPoint) && typesLow.push(prevType);
      push(resultHigh, scratchPoint) && typesHigh.push(prevType);
    }

    if (side <= 0) {
      push(resultLow, p) && typesLow.push(type);
      lowPointCount -= side;
    } else if (typesLow.length) {
      typesLow[typesLow.length - 1] = TYPE_INSIDE;
    }

    if (side >= 0) {
      push(resultHigh, p) && typesHigh.push(type);
      highPointCount += side;
    } else if (typesHigh.length) {
      typesHigh[typesHigh.length - 1] = TYPE_INSIDE;
    }

    copy(prev, p);
    prevSide = side;
    prevType = type;
  }

  return [lowPointCount ? {
    pos: resultLow,
    types: edgeTypes && typesLow
  } : null, highPointCount ? {
    pos: resultHigh,
    types: edgeTypes && typesHigh
  } : null];
}

function getGridCell(p, gridResolution, gridOffset, out) {
  var left = Math.floor((p[0] - gridOffset[0]) / gridResolution) * gridResolution + gridOffset[0];
  var bottom = Math.floor((p[1] - gridOffset[1]) / gridResolution) * gridResolution + gridOffset[1];
  out[0] = left;
  out[1] = bottom;
  out[2] = left + gridResolution;
  out[3] = bottom + gridResolution;
  return out;
}

function moveToNeighborCell(cell, gridResolution, edge) {
  if (edge & 8) {
    cell[1] += gridResolution;
    cell[3] += gridResolution;
  } else if (edge & 4) {
    cell[1] -= gridResolution;
    cell[3] -= gridResolution;
  } else if (edge & 2) {
    cell[0] += gridResolution;
    cell[2] += gridResolution;
  } else if (edge & 1) {
    cell[0] -= gridResolution;
    cell[2] -= gridResolution;
  }
}

function getBoundingBox(positions, size, endIndex, out) {
  var minX = Infinity;
  var maxX = -Infinity;
  var minY = Infinity;
  var maxY = -Infinity;

  for (var i = 0; i < endIndex; i += size) {
    var x = positions[i];
    var y = positions[i + 1];
    minX = x < minX ? x : minX;
    maxX = x > maxX ? x : maxX;
    minY = y < minY ? y : minY;
    maxY = y > maxY ? y : maxY;
  }

  out[0][0] = minX;
  out[0][1] = minY;
  out[1][0] = maxX;
  out[1][1] = maxY;
  return out;
}

function _createForOfIteratorHelper$8(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray$8(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray$8(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray$8(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray$8(o, minLen); }

function _arrayLikeToArray$8(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }
var DEFAULT_MAX_LATITUDE = 85.051129;
function cutPolylineByMercatorBounds(positions) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var _options$size = options.size,
      size = _options$size === void 0 ? 2 : _options$size,
      _options$startIndex = options.startIndex,
      startIndex = _options$startIndex === void 0 ? 0 : _options$startIndex,
      _options$endIndex = options.endIndex,
      endIndex = _options$endIndex === void 0 ? positions.length : _options$endIndex,
      _options$normalize = options.normalize,
      normalize = _options$normalize === void 0 ? true : _options$normalize;
  var newPositions = positions.slice(startIndex, endIndex);
  wrapLongitudesForShortestPath(newPositions, size, 0, endIndex - startIndex);
  var parts = cutPolylineByGrid(newPositions, {
    size: size,
    broken: true,
    gridResolution: 360,
    gridOffset: [-180, -180]
  });

  if (normalize) {
    var _iterator = _createForOfIteratorHelper$8(parts),
        _step;

    try {
      for (_iterator.s(); !(_step = _iterator.n()).done;) {
        var part = _step.value;
        shiftLongitudesIntoRange(part, size);
      }
    } catch (err) {
      _iterator.e(err);
    } finally {
      _iterator.f();
    }
  }

  return parts;
}
function cutPolygonByMercatorBounds(positions, holeIndices) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  var _options$size2 = options.size,
      size = _options$size2 === void 0 ? 2 : _options$size2,
      _options$normalize2 = options.normalize,
      normalize = _options$normalize2 === void 0 ? true : _options$normalize2,
      _options$edgeTypes = options.edgeTypes,
      edgeTypes = _options$edgeTypes === void 0 ? false : _options$edgeTypes;
  holeIndices = holeIndices || [];
  var newPositions = [];
  var newHoleIndices = [];
  var srcStartIndex = 0;
  var targetIndex = 0;

  for (var ringIndex = 0; ringIndex <= holeIndices.length; ringIndex++) {
    var srcEndIndex = holeIndices[ringIndex] || positions.length;
    var targetStartIndex = targetIndex;
    var splitIndex = findSplitIndex(positions, size, srcStartIndex, srcEndIndex);

    for (var i = splitIndex; i < srcEndIndex; i++) {
      newPositions[targetIndex++] = positions[i];
    }

    for (var _i = srcStartIndex; _i < splitIndex; _i++) {
      newPositions[targetIndex++] = positions[_i];
    }

    wrapLongitudesForShortestPath(newPositions, size, targetStartIndex, targetIndex);
    insertPoleVertices(newPositions, size, targetStartIndex, targetIndex, options.maxLatitude);
    srcStartIndex = srcEndIndex;
    newHoleIndices[ringIndex] = targetIndex;
  }

  newHoleIndices.pop();
  var parts = cutPolygonByGrid(newPositions, newHoleIndices, {
    size: size,
    gridResolution: 360,
    gridOffset: [-180, -180],
    edgeTypes: edgeTypes
  });

  if (normalize) {
    var _iterator2 = _createForOfIteratorHelper$8(parts),
        _step2;

    try {
      for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
        var part = _step2.value;
        shiftLongitudesIntoRange(part.positions, size);
      }
    } catch (err) {
      _iterator2.e(err);
    } finally {
      _iterator2.f();
    }
  }

  return parts;
}

function findSplitIndex(positions, size, startIndex, endIndex) {
  var maxLat = -1;
  var pointIndex = -1;

  for (var i = startIndex + 1; i < endIndex; i += size) {
    var lat = Math.abs(positions[i]);

    if (lat > maxLat) {
      maxLat = lat;
      pointIndex = i - 1;
    }
  }

  return pointIndex;
}

function insertPoleVertices(positions, size, startIndex, endIndex) {
  var maxLatitude = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : DEFAULT_MAX_LATITUDE;
  var firstLng = positions[startIndex];
  var lastLng = positions[endIndex - size];

  if (Math.abs(firstLng - lastLng) > 180) {
    var p = getPointAtIndex(positions, 0, size, startIndex);
    p[0] += Math.round((lastLng - firstLng) / 360) * 360;
    push(positions, p);
    p[1] = Math.sign(p[1]) * maxLatitude;
    push(positions, p);
    p[0] = firstLng;
    push(positions, p);
  }
}

function wrapLongitudesForShortestPath(positions, size, startIndex, endIndex) {
  var prevLng = positions[0];
  var lng;

  for (var i = startIndex; i < endIndex; i += size) {
    lng = positions[i];
    var delta = lng - prevLng;

    if (delta > 180 || delta < -180) {
      lng -= Math.round(delta / 360) * 360;
    }

    positions[i] = prevLng = lng;
  }
}

function shiftLongitudesIntoRange(positions, size) {
  var refLng;
  var pointCount = positions.length / size;

  for (var i = 0; i < pointCount; i++) {
    refLng = positions[i * size];

    if ((refLng + 180) % 360 !== 0) {
      break;
    }
  }

  var delta = -Math.round(refLng / 360) * 360;

  if (delta === 0) {
    return;
  }

  for (var _i2 = 0; _i2 < pointCount; _i2++) {
    positions[_i2 * size] += delta;
  }
}

function normalizePath(path, size, gridResolution, wrapLongitude) {
  var flatPath = path;

  if (Array.isArray(path[0])) {
    var length = path.length * size;
    flatPath = new Array(length);

    for (var i = 0; i < path.length; i++) {
      for (var j = 0; j < size; j++) {
        flatPath[i * size + j] = path[i][j] || 0;
      }
    }
  }

  if (gridResolution) {
    return cutPolylineByGrid(flatPath, {
      size: size,
      gridResolution: gridResolution
    });
  }

  if (wrapLongitude) {
    return cutPolylineByMercatorBounds(flatPath, {
      size: size
    });
  }

  return flatPath;
}

function _createForOfIteratorHelper$9(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray$9(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray$9(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray$9(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray$9(o, minLen); }

function _arrayLikeToArray$9(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function ownKeys$a(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread$a(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys$a(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys$a(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _createSuper$j(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct$j(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _isNativeReflectConstruct$j() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }
var START_CAP = 1;
var END_CAP = 2;
var INVALID = 4;

var PathTesselator = function (_Tesselator) {
  _inherits(PathTesselator, _Tesselator);

  var _super = _createSuper$j(PathTesselator);

  function PathTesselator(opts) {
    _classCallCheck(this, PathTesselator);

    return _super.call(this, _objectSpread$a(_objectSpread$a({}, opts), {}, {
      attributes: {
        positions: {
          size: 3,
          padding: 18,
          initialize: true,
          type: opts.fp64 ? Float64Array : Float32Array
        },
        segmentTypes: {
          size: 1,
          type: Uint8ClampedArray
        }
      }
    }));
  }

  _createClass(PathTesselator, [{
    key: "getGeometryFromBuffer",
    value: function getGeometryFromBuffer(buffer) {
      if (this.normalize) {
        return _get(_getPrototypeOf(PathTesselator.prototype), "getGeometryFromBuffer", this).call(this, buffer);
      }

      return function () {
        return null;
      };
    }
  }, {
    key: "normalizeGeometry",
    value: function normalizeGeometry(path) {
      if (this.normalize) {
        return normalizePath(path, this.positionSize, this.opts.resolution, this.opts.wrapLongitude);
      }

      return path;
    }
  }, {
    key: "get",
    value: function get(attributeName) {
      return this.attributes[attributeName];
    }
  }, {
    key: "getGeometrySize",
    value: function getGeometrySize(path) {
      if (Array.isArray(path[0])) {
        var size = 0;

        var _iterator = _createForOfIteratorHelper$9(path),
            _step;

        try {
          for (_iterator.s(); !(_step = _iterator.n()).done;) {
            var subPath = _step.value;
            size += this.getGeometrySize(subPath);
          }
        } catch (err) {
          _iterator.e(err);
        } finally {
          _iterator.f();
        }

        return size;
      }

      var numPoints = this.getPathLength(path);

      if (numPoints < 2) {
        return 0;
      }

      if (this.isClosed(path)) {
        return numPoints < 3 ? 0 : numPoints + 2;
      }

      return numPoints;
    }
  }, {
    key: "updateGeometryAttributes",
    value: function updateGeometryAttributes(path, context) {
      if (context.geometrySize === 0) {
        return;
      }

      if (path && Array.isArray(path[0])) {
        var _iterator2 = _createForOfIteratorHelper$9(path),
            _step2;

        try {
          for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
            var subPath = _step2.value;
            var geometrySize = this.getGeometrySize(subPath);
            context.geometrySize = geometrySize;
            this.updateGeometryAttributes(subPath, context);
            context.vertexStart += geometrySize;
          }
        } catch (err) {
          _iterator2.e(err);
        } finally {
          _iterator2.f();
        }
      } else {
        this._updateSegmentTypes(path, context);

        this._updatePositions(path, context);
      }
    }
  }, {
    key: "_updateSegmentTypes",
    value: function _updateSegmentTypes(path, context) {
      var segmentTypes = this.attributes.segmentTypes;
      var isPathClosed = this.isClosed(path);
      var vertexStart = context.vertexStart,
          geometrySize = context.geometrySize;
      segmentTypes.fill(0, vertexStart, vertexStart + geometrySize);

      if (isPathClosed) {
        segmentTypes[vertexStart] = INVALID;
        segmentTypes[vertexStart + geometrySize - 2] = INVALID;
      } else {
        segmentTypes[vertexStart] += START_CAP;
        segmentTypes[vertexStart + geometrySize - 2] += END_CAP;
      }

      segmentTypes[vertexStart + geometrySize - 1] = INVALID;
    }
  }, {
    key: "_updatePositions",
    value: function _updatePositions(path, context) {
      var positions = this.attributes.positions;

      if (!positions) {
        return;
      }

      var vertexStart = context.vertexStart,
          geometrySize = context.geometrySize;
      var p = new Array(3);

      for (var i = vertexStart, ptIndex = 0; ptIndex < geometrySize; i++, ptIndex++) {
        this.getPointOnPath(path, ptIndex, p);
        positions[i * 3] = p[0];
        positions[i * 3 + 1] = p[1];
        positions[i * 3 + 2] = p[2];
      }
    }
  }, {
    key: "getPathLength",
    value: function getPathLength(path) {
      return path.length / this.positionSize;
    }
  }, {
    key: "getPointOnPath",
    value: function getPointOnPath(path, index) {
      var target = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];
      var positionSize = this.positionSize;

      if (index * positionSize >= path.length) {
        index += 1 - path.length / positionSize;
      }

      var i = index * positionSize;
      target[0] = path[i];
      target[1] = path[i + 1];
      target[2] = positionSize === 3 && path[i + 2] || 0;
      return target;
    }
  }, {
    key: "isClosed",
    value: function isClosed(path) {
      if (!this.normalize) {
        return this.opts.loop;
      }

      var positionSize = this.positionSize;
      var lastPointIndex = path.length - positionSize;
      return path[0] === path[lastPointIndex] && path[1] === path[lastPointIndex + 1] && (positionSize === 2 || path[2] === path[lastPointIndex + 2]);
    }
  }]);

  return PathTesselator;
}(Tesselator);

var vs$4 = "#define SHADER_NAME path-layer-vertex-shader\n\nattribute vec2 positions;\n\nattribute float instanceTypes;\nattribute vec3 instanceStartPositions;\nattribute vec3 instanceEndPositions;\nattribute vec3 instanceLeftPositions;\nattribute vec3 instanceRightPositions;\nattribute vec3 instanceLeftPositions64Low;\nattribute vec3 instanceStartPositions64Low;\nattribute vec3 instanceEndPositions64Low;\nattribute vec3 instanceRightPositions64Low;\nattribute float instanceStrokeWidths;\nattribute vec4 instanceColors;\nattribute vec3 instancePickingColors;\n\nuniform float widthScale;\nuniform float widthMinPixels;\nuniform float widthMaxPixels;\nuniform float jointType;\nuniform float miterLimit;\nuniform bool billboard;\n\nuniform float opacity;\n\nvarying vec4 vColor;\nvarying vec2 vCornerOffset;\nvarying float vMiterLength;\nvarying vec2 vPathPosition;\nvarying float vPathLength;\n\nconst float EPSILON = 0.001;\nconst vec3 ZERO_OFFSET = vec3(0.0);\n\nfloat flipIfTrue(bool flag) {\n  return -(float(flag) * 2. - 1.);\n}\nvec3 lineJoin(\n  vec3 prevPoint, vec3 currPoint, vec3 nextPoint,\n  vec2 width\n) {\n  bool isEnd = positions.x > 0.0;\n  float sideOfPath = positions.y;\n  float isJoint = float(sideOfPath == 0.0);\n\n  vec3 deltaA3 = (currPoint - prevPoint);\n  vec3 deltaB3 = (nextPoint - currPoint);\n\n  mat3 rotationMatrix;\n  bool needsRotation = !billboard && project_needs_rotation(currPoint, rotationMatrix);\n  if (needsRotation) {\n    deltaA3 = deltaA3 * rotationMatrix;\n    deltaB3 = deltaB3 * rotationMatrix;\n  }\n  vec2 deltaA = deltaA3.xy / width;\n  vec2 deltaB = deltaB3.xy / width;\n\n  float lenA = length(deltaA);\n  float lenB = length(deltaB);\n\n  vec2 dirA = lenA > 0. ? normalize(deltaA) : vec2(0.0, 0.0);\n  vec2 dirB = lenB > 0. ? normalize(deltaB) : vec2(0.0, 0.0);\n\n  vec2 perpA = vec2(-dirA.y, dirA.x);\n  vec2 perpB = vec2(-dirB.y, dirB.x);\n  vec2 tangent = dirA + dirB;\n  tangent = length(tangent) > 0. ? normalize(tangent) : perpA;\n  vec2 miterVec = vec2(-tangent.y, tangent.x);\n  vec2 dir = isEnd ? dirA : dirB;\n  vec2 perp = isEnd ? perpA : perpB;\n  float L = isEnd ? lenA : lenB;\n  float sinHalfA = abs(dot(miterVec, perp));\n  float cosHalfA = abs(dot(dirA, miterVec));\n  float turnDirection = flipIfTrue(dirA.x * dirB.y >= dirA.y * dirB.x);\n  float cornerPosition = sideOfPath * turnDirection;\n\n  float miterSize = 1.0 / max(sinHalfA, EPSILON);\n  miterSize = mix(\n    min(miterSize, max(lenA, lenB) / max(cosHalfA, EPSILON)),\n    miterSize,\n    step(0.0, cornerPosition)\n  );\n\n  vec2 offsetVec = mix(miterVec * miterSize, perp, step(0.5, cornerPosition))\n    * (sideOfPath + isJoint * turnDirection);\n  bool isStartCap = lenA == 0.0 || (!isEnd && (instanceTypes == 1.0 || instanceTypes == 3.0));\n  bool isEndCap = lenB == 0.0 || (isEnd && (instanceTypes == 2.0 || instanceTypes == 3.0));\n  bool isCap = isStartCap || isEndCap;\n  if (isCap) {\n    offsetVec = mix(perp * sideOfPath, dir * jointType * 4.0 * flipIfTrue(isStartCap), isJoint);\n  }\n  vPathLength = L;\n  vCornerOffset = offsetVec;\n  vMiterLength = dot(vCornerOffset, miterVec * turnDirection);\n  vMiterLength = isCap ? isJoint : vMiterLength;\n\n  vec2 offsetFromStartOfPath = vCornerOffset + deltaA * float(isEnd);\n  vPathPosition = vec2(\n    dot(offsetFromStartOfPath, perp),\n    dot(offsetFromStartOfPath, dir)\n  );\n  geometry.uv = vPathPosition;\n\n  float isValid = step(instanceTypes, 3.5);\n  vec3 offset = vec3(offsetVec * width * isValid, 0.0);\n\n  if (needsRotation) {\n    offset = rotationMatrix * offset;\n  }\n  return currPoint + offset;\n}\nvoid clipLine(inout vec4 position, vec4 refPosition) {\n  if (position.w < EPSILON) {\n    float r = (EPSILON - refPosition.w) / (position.w - refPosition.w);\n    position = refPosition + (position - refPosition) * r;\n  }\n}\n\nvoid main() {\n  geometry.worldPosition = instanceStartPositions;\n  geometry.worldPositionAlt = instanceEndPositions;\n  geometry.pickingColor = instancePickingColors;\n\n  vec2 widthPixels = vec2(clamp(project_size_to_pixel(instanceStrokeWidths * widthScale),\n    widthMinPixels, widthMaxPixels) / 2.0);\n  vec3 width;\n\n  vColor = vec4(instanceColors.rgb, instanceColors.a * opacity);\n\n  float isEnd = positions.x;\n\n  vec3 prevPosition = mix(instanceLeftPositions, instanceStartPositions, isEnd);\n  vec3 prevPosition64Low = mix(instanceLeftPositions64Low, instanceStartPositions64Low, isEnd);\n\n  vec3 currPosition = mix(instanceStartPositions, instanceEndPositions, isEnd);\n  vec3 currPosition64Low = mix(instanceStartPositions64Low, instanceEndPositions64Low, isEnd);\n\n  vec3 nextPosition = mix(instanceEndPositions, instanceRightPositions, isEnd);\n  vec3 nextPosition64Low = mix(instanceEndPositions64Low, instanceRightPositions64Low, isEnd);\n\n  if (billboard) {\n    vec4 prevPositionScreen = project_position_to_clipspace(prevPosition, prevPosition64Low, ZERO_OFFSET);\n    vec4 currPositionScreen = project_position_to_clipspace(currPosition, currPosition64Low, ZERO_OFFSET, geometry.position);\n    vec4 nextPositionScreen = project_position_to_clipspace(nextPosition, nextPosition64Low, ZERO_OFFSET);\n\n    clipLine(prevPositionScreen, currPositionScreen);\n    clipLine(nextPositionScreen, currPositionScreen);\n    clipLine(currPositionScreen, mix(nextPositionScreen, prevPositionScreen, isEnd));\n\n    width = vec3(widthPixels, 0.0);\n    DECKGL_FILTER_SIZE(width, geometry);\n\n    vec3 pos = lineJoin(\n      prevPositionScreen.xyz / prevPositionScreen.w,\n      currPositionScreen.xyz / currPositionScreen.w,\n      nextPositionScreen.xyz / nextPositionScreen.w,\n      project_pixel_size_to_clipspace(width.xy)\n    );\n\n    gl_Position = vec4(pos * currPositionScreen.w, currPositionScreen.w);\n  } else {\n    prevPosition = project_position(prevPosition, prevPosition64Low);\n    currPosition = project_position(currPosition, currPosition64Low);\n    nextPosition = project_position(nextPosition, nextPosition64Low);\n\n    width = vec3(project_pixel_size(widthPixels), 0.0);\n    DECKGL_FILTER_SIZE(width, geometry);\n\n    vec4 pos = vec4(\n      lineJoin(prevPosition, currPosition, nextPosition, width.xy),\n      1.0);\n    geometry.position = pos;\n    gl_Position = project_common_position_to_clipspace(pos);\n  }\n  DECKGL_FILTER_GL_POSITION(gl_Position, geometry);\n  DECKGL_FILTER_COLOR(vColor, geometry);\n}\n";

var fs$2 = "#define SHADER_NAME path-layer-fragment-shader\n\nprecision highp float;\n\nuniform float jointType;\nuniform float miterLimit;\n\nvarying vec4 vColor;\nvarying vec2 vCornerOffset;\nvarying float vMiterLength;\nvarying vec2 vPathPosition;\nvarying float vPathLength;\n\nvoid main(void) {\n  geometry.uv = vPathPosition;\n\n  if (vPathPosition.y < 0.0 || vPathPosition.y > vPathLength) {\n    if (jointType > 0.0 && length(vCornerOffset) > 1.0) {\n      discard;\n    }\n    if (jointType == 0.0 && vMiterLength > miterLimit + 1.0) {\n      discard;\n    }\n  }\n  gl_FragColor = vColor;\n\n  DECKGL_FILTER_COLOR(gl_FragColor, geometry);\n}\n";

function _createSuper$k(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct$k(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _isNativeReflectConstruct$k() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }
var DEFAULT_COLOR$1 = [0, 0, 0, 255];
var defaultProps$4 = {
  widthUnits: 'meters',
  widthScale: {
    type: 'number',
    min: 0,
    value: 1
  },
  widthMinPixels: {
    type: 'number',
    min: 0,
    value: 0
  },
  widthMaxPixels: {
    type: 'number',
    min: 0,
    value: Number.MAX_SAFE_INTEGER
  },
  rounded: false,
  miterLimit: {
    type: 'number',
    min: 0,
    value: 4
  },
  billboard: false,
  _pathType: null,
  getPath: {
    type: 'accessor',
    value: function value(object) {
      return object.path;
    }
  },
  getColor: {
    type: 'accessor',
    value: DEFAULT_COLOR$1
  },
  getWidth: {
    type: 'accessor',
    value: 1
  }
};
var ATTRIBUTE_TRANSITION = {
  enter: function enter(value, chunk) {
    return chunk.length ? chunk.subarray(chunk.length - value.length) : value;
  }
};

var PathLayer = function (_Layer) {
  _inherits(PathLayer, _Layer);

  var _super = _createSuper$k(PathLayer);

  function PathLayer() {
    _classCallCheck(this, PathLayer);

    return _super.apply(this, arguments);
  }

  _createClass(PathLayer, [{
    key: "getShaders",
    value: function getShaders() {
      return _get(_getPrototypeOf(PathLayer.prototype), "getShaders", this).call(this, {
        vs: vs$4,
        fs: fs$2,
        modules: [project32, picking]
      });
    }
  }, {
    key: "initializeState",
    value: function initializeState() {
      var _this = this;

      var noAlloc = true;
      var attributeManager = this.getAttributeManager();
      attributeManager.addInstanced({
        positions: {
          size: 3,
          vertexOffset: 1,
          type: 5130,
          fp64: this.use64bitPositions(),
          transition: ATTRIBUTE_TRANSITION,
          accessor: 'getPath',
          update: this.calculatePositions,
          noAlloc: noAlloc,
          shaderAttributes: {
            instanceLeftPositions: {
              vertexOffset: 0
            },
            instanceStartPositions: {
              vertexOffset: 1
            },
            instanceEndPositions: {
              vertexOffset: 2
            },
            instanceRightPositions: {
              vertexOffset: 3
            }
          }
        },
        instanceTypes: {
          size: 1,
          type: 5121,
          update: this.calculateSegmentTypes,
          noAlloc: noAlloc
        },
        instanceStrokeWidths: {
          size: 1,
          accessor: 'getWidth',
          transition: ATTRIBUTE_TRANSITION,
          defaultValue: 1
        },
        instanceColors: {
          size: this.props.colorFormat.length,
          type: 5121,
          normalized: true,
          accessor: 'getColor',
          transition: ATTRIBUTE_TRANSITION,
          defaultValue: DEFAULT_COLOR$1
        },
        instancePickingColors: {
          size: 3,
          type: 5121,
          accessor: function accessor(object, _ref) {
            var index = _ref.index,
                value = _ref.target;
            return _this.encodePickingColor(object && object.__source ? object.__source.index : index, value);
          }
        }
      });
      this.setState({
        pathTesselator: new PathTesselator({
          fp64: this.use64bitPositions()
        })
      });

      if (this.props.getDashArray && !this.props.extensions.length) {
        log.removed('getDashArray', 'PathStyleExtension')();
      }
    }
  }, {
    key: "updateState",
    value: function updateState(_ref2) {
      var oldProps = _ref2.oldProps,
          props = _ref2.props,
          changeFlags = _ref2.changeFlags;

      _get(_getPrototypeOf(PathLayer.prototype), "updateState", this).call(this, {
        props: props,
        oldProps: oldProps,
        changeFlags: changeFlags
      });

      var attributeManager = this.getAttributeManager();
      var geometryChanged = changeFlags.dataChanged || changeFlags.updateTriggersChanged && (changeFlags.updateTriggersChanged.all || changeFlags.updateTriggersChanged.getPath);

      if (geometryChanged) {
        var pathTesselator = this.state.pathTesselator;
        var buffers = props.data.attributes || {};
        pathTesselator.updateGeometry({
          data: props.data,
          geometryBuffer: buffers.getPath,
          buffers: buffers,
          normalize: !props._pathType,
          loop: props._pathType === 'loop',
          getGeometry: props.getPath,
          positionFormat: props.positionFormat,
          wrapLongitude: props.wrapLongitude,
          resolution: this.context.viewport.resolution,
          dataChanged: changeFlags.dataChanged
        });
        this.setState({
          numInstances: pathTesselator.instanceCount,
          startIndices: pathTesselator.vertexStarts
        });

        if (!changeFlags.dataChanged) {
          attributeManager.invalidateAll();
        }
      }

      if (changeFlags.extensionsChanged) {
        var gl = this.context.gl;

        if (this.state.model) {
          this.state.model["delete"]();
        }

        this.setState({
          model: this._getModel(gl)
        });
        attributeManager.invalidateAll();
      }
    }
  }, {
    key: "getPickingInfo",
    value: function getPickingInfo(params) {
      var info = _get(_getPrototypeOf(PathLayer.prototype), "getPickingInfo", this).call(this, params);

      var index = info.index;
      var data = this.props.data;

      if (data[0] && data[0].__source) {
        info.object = data.find(function (d) {
          return d.__source.index === index;
        });
      }

      return info;
    }
  }, {
    key: "draw",
    value: function draw(_ref3) {
      var uniforms = _ref3.uniforms;
      var viewport = this.context.viewport;
      var _this$props = this.props,
          rounded = _this$props.rounded,
          billboard = _this$props.billboard,
          miterLimit = _this$props.miterLimit,
          widthUnits = _this$props.widthUnits,
          widthScale = _this$props.widthScale,
          widthMinPixels = _this$props.widthMinPixels,
          widthMaxPixels = _this$props.widthMaxPixels;
      var widthMultiplier = widthUnits === 'pixels' ? viewport.metersPerPixel : 1;
      this.state.model.setUniforms(Object.assign({}, uniforms, {
        jointType: Number(rounded),
        billboard: billboard,
        widthScale: widthScale * widthMultiplier,
        miterLimit: miterLimit,
        widthMinPixels: widthMinPixels,
        widthMaxPixels: widthMaxPixels
      })).draw();
    }
  }, {
    key: "_getModel",
    value: function _getModel(gl) {
      var SEGMENT_INDICES = [0, 1, 2, 1, 4, 2, 1, 3, 4, 3, 5, 4];
      var SEGMENT_POSITIONS = [0, 0, 0, -1, 0, 1, 1, -1, 1, 1, 1, 0];
      return new Model(gl, Object.assign({}, this.getShaders(), {
        id: this.props.id,
        geometry: new Geometry({
          drawMode: 4,
          attributes: {
            indices: new Uint16Array(SEGMENT_INDICES),
            positions: {
              value: new Float32Array(SEGMENT_POSITIONS),
              size: 2
            }
          }
        }),
        isInstanced: true
      }));
    }
  }, {
    key: "calculatePositions",
    value: function calculatePositions(attribute) {
      var pathTesselator = this.state.pathTesselator;
      attribute.startIndices = pathTesselator.vertexStarts;
      attribute.value = pathTesselator.get('positions');
    }
  }, {
    key: "calculateSegmentTypes",
    value: function calculateSegmentTypes(attribute) {
      var pathTesselator = this.state.pathTesselator;
      attribute.startIndices = pathTesselator.vertexStarts;
      attribute.value = pathTesselator.get('segmentTypes');
    }
  }, {
    key: "wrapLongitude",
    get: function get() {
      return false;
    }
  }]);

  return PathLayer;
}(Layer);
PathLayer.layerName = 'PathLayer';
PathLayer.defaultProps = defaultProps$4;

function _createForOfIteratorHelper$a(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray$a(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray$a(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray$a(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray$a(o, minLen); }

function _arrayLikeToArray$a(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function validate(polygon) {
  polygon = polygon && polygon.positions || polygon;

  if (!Array.isArray(polygon) && !ArrayBuffer.isView(polygon)) {
    throw new Error('invalid polygon');
  }
}

function isSimple(polygon) {
  return polygon.length >= 1 && polygon[0].length >= 2 && Number.isFinite(polygon[0][0]);
}

function isNestedRingClosed(simplePolygon) {
  var p0 = simplePolygon[0];
  var p1 = simplePolygon[simplePolygon.length - 1];
  return p0[0] === p1[0] && p0[1] === p1[1] && p0[2] === p1[2];
}

function isFlatRingClosed(positions, size, startIndex, endIndex) {
  for (var i = 0; i < size; i++) {
    if (positions[startIndex + i] !== positions[endIndex - size + i]) {
      return false;
    }
  }

  return true;
}

function copyNestedRing(target, targetStartIndex, simplePolygon, size) {
  var targetIndex = targetStartIndex;
  var len = simplePolygon.length;

  for (var i = 0; i < len; i++) {
    for (var j = 0; j < size; j++) {
      target[targetIndex++] = simplePolygon[i][j] || 0;
    }
  }

  if (!isNestedRingClosed(simplePolygon)) {
    for (var _j = 0; _j < size; _j++) {
      target[targetIndex++] = simplePolygon[0][_j] || 0;
    }
  }

  return targetIndex;
}

function copyFlatRing(target, targetStartIndex, positions, size) {
  var srcStartIndex = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 0;
  var srcEndIndex = arguments.length > 5 ? arguments[5] : undefined;
  srcEndIndex = srcEndIndex || positions.length;
  var srcLength = srcEndIndex - srcStartIndex;

  if (srcLength <= 0) {
    return targetStartIndex;
  }

  var targetIndex = targetStartIndex;

  for (var i = 0; i < srcLength; i++) {
    target[targetIndex++] = positions[srcStartIndex + i];
  }

  if (!isFlatRingClosed(positions, size, srcStartIndex, srcEndIndex)) {
    for (var _i = 0; _i < size; _i++) {
      target[targetIndex++] = positions[srcStartIndex + _i];
    }
  }

  return targetIndex;
}

function normalize$1(polygon, positionSize) {
  validate(polygon);
  var positions = [];
  var holeIndices = [];

  if (polygon.positions) {
    var _polygon = polygon,
        srcPositions = _polygon.positions,
        srcHoleIndices = _polygon.holeIndices;

    if (srcHoleIndices) {
      var targetIndex = 0;

      for (var i = 0; i <= srcHoleIndices.length; i++) {
        targetIndex = copyFlatRing(positions, targetIndex, srcPositions, positionSize, srcHoleIndices[i - 1], srcHoleIndices[i]);
        holeIndices.push(targetIndex);
      }

      holeIndices.pop();
      return {
        positions: positions,
        holeIndices: holeIndices
      };
    }

    polygon = srcPositions;
  }

  if (Number.isFinite(polygon[0])) {
    copyFlatRing(positions, 0, polygon, positionSize);
    return positions;
  }

  if (!isSimple(polygon)) {
    var _targetIndex = 0;

    var _iterator = _createForOfIteratorHelper$a(polygon),
        _step;

    try {
      for (_iterator.s(); !(_step = _iterator.n()).done;) {
        var simplePolygon = _step.value;
        _targetIndex = copyNestedRing(positions, _targetIndex, simplePolygon, positionSize);
        holeIndices.push(_targetIndex);
      }
    } catch (err) {
      _iterator.e(err);
    } finally {
      _iterator.f();
    }

    holeIndices.pop();
    return {
      positions: positions,
      holeIndices: holeIndices
    };
  }

  copyNestedRing(positions, 0, polygon, positionSize);
  return positions;
}
function getSurfaceIndices(normalizedPolygon, positionSize, preproject) {
  var holeIndices = null;

  if (normalizedPolygon.holeIndices) {
    holeIndices = normalizedPolygon.holeIndices.map(function (positionIndex) {
      return positionIndex / positionSize;
    });
  }

  var positions = normalizedPolygon.positions || normalizedPolygon;

  if (preproject) {
    var n = positions.length;
    positions = positions.slice();
    var p = [];

    for (var i = 0; i < n; i += positionSize) {
      p[0] = positions[i];
      p[1] = positions[i + 1];
      var xy = preproject(p);
      positions[i] = xy[0];
      positions[i + 1] = xy[1];
    }
  }

  return earcut_1(positions, holeIndices, positionSize);
}

function _createForOfIteratorHelper$b(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray$b(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray$b(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray$b(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray$b(o, minLen); }

function _arrayLikeToArray$b(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function ownKeys$b(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread$b(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys$b(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys$b(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _createSuper$l(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct$l(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _isNativeReflectConstruct$l() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

var PolygonTesselator = function (_Tesselator) {
  _inherits(PolygonTesselator, _Tesselator);

  var _super = _createSuper$l(PolygonTesselator);

  function PolygonTesselator(opts) {
    _classCallCheck(this, PolygonTesselator);

    var fp64 = opts.fp64,
        _opts$IndexType = opts.IndexType,
        IndexType = _opts$IndexType === void 0 ? Uint32Array : _opts$IndexType;
    return _super.call(this, _objectSpread$b(_objectSpread$b({}, opts), {}, {
      attributes: {
        positions: {
          size: 3,
          type: fp64 ? Float64Array : Float32Array
        },
        vertexValid: {
          type: Uint8ClampedArray,
          size: 1
        },
        indices: {
          type: IndexType,
          size: 1
        }
      }
    }));
  }

  _createClass(PolygonTesselator, [{
    key: "get",
    value: function get(attributeName) {
      var attributes = this.attributes;

      if (attributeName === 'indices') {
        return attributes.indices && attributes.indices.subarray(0, this.vertexCount);
      }

      return attributes[attributeName];
    }
  }, {
    key: "updateGeometry",
    value: function updateGeometry(opts) {
      _get(_getPrototypeOf(PolygonTesselator.prototype), "updateGeometry", this).call(this, opts);

      var externalIndices = this.buffers.indices;

      if (externalIndices) {
        this.vertexCount = (externalIndices.value || externalIndices).length;
      }
    }
  }, {
    key: "normalizeGeometry",
    value: function normalizeGeometry(polygon) {
      if (this.normalize) {
        polygon = normalize$1(polygon, this.positionSize);

        if (this.opts.resolution) {
          return cutPolygonByGrid(polygon.positions || polygon, polygon.holeIndices, {
            size: this.positionSize,
            gridResolution: this.opts.resolution,
            edgeTypes: true
          });
        }

        if (this.opts.wrapLongitude) {
          return cutPolygonByMercatorBounds(polygon.positions || polygon, polygon.holeIndices, {
            size: this.positionSize,
            maxLatitude: 86,
            edgeTypes: true
          });
        }
      }

      return polygon;
    }
  }, {
    key: "getGeometrySize",
    value: function getGeometrySize(polygon) {
      if (Array.isArray(polygon) && !Number.isFinite(polygon[0])) {
        var size = 0;

        var _iterator = _createForOfIteratorHelper$b(polygon),
            _step;

        try {
          for (_iterator.s(); !(_step = _iterator.n()).done;) {
            var subPolygon = _step.value;
            size += this.getGeometrySize(subPolygon);
          }
        } catch (err) {
          _iterator.e(err);
        } finally {
          _iterator.f();
        }

        return size;
      }

      return (polygon.positions || polygon).length / this.positionSize;
    }
  }, {
    key: "getGeometryFromBuffer",
    value: function getGeometryFromBuffer(buffer) {
      if (this.normalize || !this.buffers.indices) {
        return _get(_getPrototypeOf(PolygonTesselator.prototype), "getGeometryFromBuffer", this).call(this, buffer);
      }

      return function () {
        return null;
      };
    }
  }, {
    key: "updateGeometryAttributes",
    value: function updateGeometryAttributes(polygon, context) {
      if (Array.isArray(polygon) && !Number.isFinite(polygon[0])) {
        var _iterator2 = _createForOfIteratorHelper$b(polygon),
            _step2;

        try {
          for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
            var subPolygon = _step2.value;
            var geometrySize = this.getGeometrySize(subPolygon);
            context.geometrySize = geometrySize;
            this.updateGeometryAttributes(subPolygon, context);
            context.vertexStart += geometrySize;
            context.indexStart = this.indexStarts[context.geometryIndex + 1];
          }
        } catch (err) {
          _iterator2.e(err);
        } finally {
          _iterator2.f();
        }
      } else {
        this._updateIndices(polygon, context);

        this._updatePositions(polygon, context);

        this._updateVertexValid(polygon, context);
      }
    }
  }, {
    key: "_updateIndices",
    value: function _updateIndices(polygon, _ref) {
      var geometryIndex = _ref.geometryIndex,
          offset = _ref.vertexStart,
          indexStart = _ref.indexStart;
      var attributes = this.attributes,
          indexStarts = this.indexStarts,
          typedArrayManager = this.typedArrayManager;
      var target = attributes.indices;

      if (!target) {
        return;
      }

      var i = indexStart;
      var indices = getSurfaceIndices(polygon, this.positionSize, this.opts.preproject);
      target = typedArrayManager.allocate(target, indexStart + indices.length, {
        copy: true
      });

      for (var j = 0; j < indices.length; j++) {
        target[i++] = indices[j] + offset;
      }

      indexStarts[geometryIndex + 1] = indexStart + indices.length;
      attributes.indices = target;
    }
  }, {
    key: "_updatePositions",
    value: function _updatePositions(polygon, _ref2) {
      var vertexStart = _ref2.vertexStart,
          geometrySize = _ref2.geometrySize;
      var positions = this.attributes.positions,
          positionSize = this.positionSize;

      if (!positions) {
        return;
      }

      var polygonPositions = polygon.positions || polygon;

      for (var i = vertexStart, j = 0; j < geometrySize; i++, j++) {
        var x = polygonPositions[j * positionSize];
        var y = polygonPositions[j * positionSize + 1];
        var z = positionSize > 2 ? polygonPositions[j * positionSize + 2] : 0;
        positions[i * 3] = x;
        positions[i * 3 + 1] = y;
        positions[i * 3 + 2] = z;
      }
    }
  }, {
    key: "_updateVertexValid",
    value: function _updateVertexValid(polygon, _ref3) {
      var vertexStart = _ref3.vertexStart,
          geometrySize = _ref3.geometrySize;
      var vertexValid = this.attributes.vertexValid,
          positionSize = this.positionSize;
      var holeIndices = polygon && polygon.holeIndices;

      if (polygon && polygon.edgeTypes) {
        vertexValid.set(polygon.edgeTypes, vertexStart);
      } else {
        vertexValid.fill(1, vertexStart, vertexStart + geometrySize);
      }

      if (holeIndices) {
        for (var j = 0; j < holeIndices.length; j++) {
          vertexValid[vertexStart + holeIndices[j] / positionSize - 1] = 0;
        }
      }

      vertexValid[vertexStart + geometrySize - 1] = 0;
    }
  }]);

  return PolygonTesselator;
}(Tesselator);

var main = "\nattribute vec2 vertexPositions;\nattribute float vertexValid;\n\nuniform bool extruded;\nuniform bool isWireframe;\nuniform float elevationScale;\nuniform float opacity;\n\nvarying vec4 vColor;\n\nstruct PolygonProps {\n  vec4 fillColors;\n  vec4 lineColors;\n  vec3 positions;\n  vec3 nextPositions;\n  vec3 pickingColors;\n  vec3 positions64Low;\n  vec3 nextPositions64Low;\n  float elevations;\n};\n\nvec3 project_offset_normal(vec3 vector) {\n  if (project_uCoordinateSystem == COORDINATE_SYSTEM_LNGLAT ||\n    project_uCoordinateSystem == COORDINATE_SYSTEM_LNGLAT_OFFSETS) {\n    return normalize(vector * project_uCommonUnitsPerWorldUnit);\n  }\n  return project_normal(vector);\n}\n\nvoid calculatePosition(PolygonProps props) {\n#ifdef IS_SIDE_VERTEX\n  if(vertexValid < 0.5){\n    gl_Position = vec4(0.);\n    return;\n  }\n#endif\n\n  vec3 pos;\n  vec3 pos64Low;\n  vec3 normal;\n  vec4 colors = isWireframe ? props.lineColors : props.fillColors;\n\n  geometry.worldPosition = props.positions;\n  geometry.worldPositionAlt = props.nextPositions;\n  geometry.pickingColor = props.pickingColors;\n\n#ifdef IS_SIDE_VERTEX\n  pos = mix(props.positions, props.nextPositions, vertexPositions.x);\n  pos64Low = mix(props.positions64Low, props.nextPositions64Low, vertexPositions.x);\n#else\n  pos = props.positions;\n  pos64Low = props.positions64Low;\n#endif\n\n  if (extruded) {\n    pos.z += props.elevations * vertexPositions.y * elevationScale;\n\n#ifdef IS_SIDE_VERTEX\n    normal = vec3(\n      props.positions.y - props.nextPositions.y + (props.positions64Low.y - props.nextPositions64Low.y),\n      props.nextPositions.x - props.positions.x + (props.nextPositions64Low.x - props.positions64Low.x),\n      0.0);\n    normal = project_offset_normal(normal);\n#else\n    normal = vec3(0.0, 0.0, 1.0);\n#endif\n    geometry.normal = normal;\n  }\n\n  gl_Position = project_position_to_clipspace(pos, pos64Low, vec3(0.), geometry.position);\n  DECKGL_FILTER_GL_POSITION(gl_Position, geometry);\n\n  if (extruded) {\n    vec3 lightColor = lighting_getLightColor(colors.rgb, project_uCameraPosition, geometry.position.xyz, normal);\n    vColor = vec4(lightColor, colors.a * opacity);\n  } else {\n    vColor = vec4(colors.rgb, colors.a * opacity);\n  }\n  DECKGL_FILTER_COLOR(vColor, geometry);\n}\n";

var vsTop = "#define SHADER_NAME solid-polygon-layer-vertex-shader\n\nattribute vec3 positions;\nattribute vec3 positions64Low;\nattribute float elevations;\nattribute vec4 fillColors;\nattribute vec4 lineColors;\nattribute vec3 pickingColors;\n\n".concat(main, "\n\nvoid main(void) {\n  PolygonProps props;\n\n  props.positions = positions;\n  props.positions64Low = positions64Low;\n  props.elevations = elevations;\n  props.fillColors = fillColors;\n  props.lineColors = lineColors;\n  props.pickingColors = pickingColors;\n\n  calculatePosition(props);\n}\n");

var vsSide = "#define SHADER_NAME solid-polygon-layer-vertex-shader-side\n#define IS_SIDE_VERTEX\n\n\nattribute vec3 instancePositions;\nattribute vec3 nextPositions;\nattribute vec3 instancePositions64Low;\nattribute vec3 nextPositions64Low;\nattribute float instanceElevations;\nattribute vec4 instanceFillColors;\nattribute vec4 instanceLineColors;\nattribute vec3 instancePickingColors;\n\n".concat(main, "\n\nvoid main(void) {\n  PolygonProps props;\n\n  props.positions = instancePositions;\n  props.positions64Low = instancePositions64Low;\n  props.elevations = instanceElevations;\n  props.fillColors = instanceFillColors;\n  props.lineColors = instanceLineColors;\n  props.pickingColors = instancePickingColors;\n  props.nextPositions = nextPositions;\n  props.nextPositions64Low = nextPositions64Low;\n\n  calculatePosition(props);\n}\n");

var fs$3 = "#define SHADER_NAME solid-polygon-layer-fragment-shader\n\nprecision highp float;\n\nvarying vec4 vColor;\n\nvoid main(void) {\n  gl_FragColor = vColor;\n\n  DECKGL_FILTER_COLOR(gl_FragColor, geometry);\n}\n";

function _createSuper$m(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct$m(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _isNativeReflectConstruct$m() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }
var DEFAULT_COLOR$2 = [0, 0, 0, 255];
var defaultProps$5 = {
  filled: true,
  extruded: false,
  wireframe: false,
  _normalize: true,
  elevationScale: {
    type: 'number',
    min: 0,
    value: 1
  },
  getPolygon: {
    type: 'accessor',
    value: function value(f) {
      return f.polygon;
    }
  },
  getElevation: {
    type: 'accessor',
    value: 1000
  },
  getFillColor: {
    type: 'accessor',
    value: DEFAULT_COLOR$2
  },
  getLineColor: {
    type: 'accessor',
    value: DEFAULT_COLOR$2
  },
  material: true
};
var ATTRIBUTE_TRANSITION$1 = {
  enter: function enter(value, chunk) {
    return chunk.length ? chunk.subarray(chunk.length - value.length) : value;
  }
};

var SolidPolygonLayer = function (_Layer) {
  _inherits(SolidPolygonLayer, _Layer);

  var _super = _createSuper$m(SolidPolygonLayer);

  function SolidPolygonLayer() {
    _classCallCheck(this, SolidPolygonLayer);

    return _super.apply(this, arguments);
  }

  _createClass(SolidPolygonLayer, [{
    key: "getShaders",
    value: function getShaders(type) {
      return _get(_getPrototypeOf(SolidPolygonLayer.prototype), "getShaders", this).call(this, {
        vs: type === 'top' ? vsTop : vsSide,
        fs: fs$3,
        defines: {},
        modules: [project32, gouraudLighting, picking]
      });
    }
  }, {
    key: "initializeState",
    value: function initializeState() {
      var _this = this;

      var _this$context = this.context,
          gl = _this$context.gl,
          viewport = _this$context.viewport;
      var coordinateSystem = this.props.coordinateSystem;

      if (viewport.isGeospatial && coordinateSystem === COORDINATE_SYSTEM.DEFAULT) {
        coordinateSystem = COORDINATE_SYSTEM.LNGLAT;
      }

      this.setState({
        numInstances: 0,
        polygonTesselator: new PolygonTesselator({
          preproject: coordinateSystem === COORDINATE_SYSTEM.LNGLAT && viewport.projectFlat,
          fp64: this.use64bitPositions(),
          IndexType: !gl || hasFeatures(gl, FEATURES.ELEMENT_INDEX_UINT32) ? Uint32Array : Uint16Array
        })
      });
      var attributeManager = this.getAttributeManager();
      var noAlloc = true;
      attributeManager.remove(['instancePickingColors']);
      attributeManager.add({
        indices: {
          size: 1,
          isIndexed: true,
          update: this.calculateIndices,
          noAlloc: noAlloc
        },
        positions: {
          size: 3,
          type: 5130,
          fp64: this.use64bitPositions(),
          transition: ATTRIBUTE_TRANSITION$1,
          accessor: 'getPolygon',
          update: this.calculatePositions,
          noAlloc: noAlloc,
          shaderAttributes: {
            positions: {
              vertexOffset: 0,
              divisor: 0
            },
            instancePositions: {
              vertexOffset: 0,
              divisor: 1
            },
            nextPositions: {
              vertexOffset: 1,
              divisor: 1
            }
          }
        },
        vertexValid: {
          size: 1,
          divisor: 1,
          type: 5121,
          update: this.calculateVertexValid,
          noAlloc: noAlloc
        },
        elevations: {
          size: 1,
          transition: ATTRIBUTE_TRANSITION$1,
          accessor: 'getElevation',
          shaderAttributes: {
            elevations: {
              divisor: 0
            },
            instanceElevations: {
              divisor: 1
            }
          }
        },
        fillColors: {
          alias: 'colors',
          size: this.props.colorFormat.length,
          type: 5121,
          normalized: true,
          transition: ATTRIBUTE_TRANSITION$1,
          accessor: 'getFillColor',
          defaultValue: DEFAULT_COLOR$2,
          shaderAttributes: {
            fillColors: {
              divisor: 0
            },
            instanceFillColors: {
              divisor: 1
            }
          }
        },
        lineColors: {
          alias: 'colors',
          size: this.props.colorFormat.length,
          type: 5121,
          normalized: true,
          transition: ATTRIBUTE_TRANSITION$1,
          accessor: 'getLineColor',
          defaultValue: DEFAULT_COLOR$2,
          shaderAttributes: {
            lineColors: {
              divisor: 0
            },
            instanceLineColors: {
              divisor: 1
            }
          }
        },
        pickingColors: {
          size: 3,
          type: 5121,
          accessor: function accessor(object, _ref) {
            var index = _ref.index,
                value = _ref.target;
            return _this.encodePickingColor(object && object.__source ? object.__source.index : index, value);
          },
          shaderAttributes: {
            pickingColors: {
              divisor: 0
            },
            instancePickingColors: {
              divisor: 1
            }
          }
        }
      });
    }
  }, {
    key: "getPickingInfo",
    value: function getPickingInfo(params) {
      var info = _get(_getPrototypeOf(SolidPolygonLayer.prototype), "getPickingInfo", this).call(this, params);

      var index = info.index;
      var data = this.props.data;

      if (data[0] && data[0].__source) {
        info.object = data.find(function (d) {
          return d.__source.index === index;
        });
      }

      return info;
    }
  }, {
    key: "draw",
    value: function draw(_ref2) {
      var uniforms = _ref2.uniforms;
      var _this$props = this.props,
          extruded = _this$props.extruded,
          filled = _this$props.filled,
          wireframe = _this$props.wireframe,
          elevationScale = _this$props.elevationScale;
      var _this$state = this.state,
          topModel = _this$state.topModel,
          sideModel = _this$state.sideModel,
          polygonTesselator = _this$state.polygonTesselator;
      var renderUniforms = Object.assign({}, uniforms, {
        extruded: Boolean(extruded),
        elevationScale: elevationScale
      });

      if (sideModel) {
        sideModel.setInstanceCount(polygonTesselator.instanceCount - 1);
        sideModel.setUniforms(renderUniforms);

        if (wireframe) {
          sideModel.setDrawMode(3);
          sideModel.setUniforms({
            isWireframe: true
          }).draw();
        }

        if (filled) {
          sideModel.setDrawMode(6);
          sideModel.setUniforms({
            isWireframe: false
          }).draw();
        }
      }

      if (topModel) {
        topModel.setVertexCount(polygonTesselator.vertexCount);
        topModel.setUniforms(renderUniforms).draw();
      }
    }
  }, {
    key: "updateState",
    value: function updateState(updateParams) {
      _get(_getPrototypeOf(SolidPolygonLayer.prototype), "updateState", this).call(this, updateParams);

      this.updateGeometry(updateParams);
      var props = updateParams.props,
          oldProps = updateParams.oldProps,
          changeFlags = updateParams.changeFlags;
      var attributeManager = this.getAttributeManager();
      var regenerateModels = changeFlags.extensionsChanged || props.filled !== oldProps.filled || props.extruded !== oldProps.extruded;

      if (regenerateModels) {
        if (this.state.models) {
          this.state.models.forEach(function (model) {
            return model["delete"]();
          });
        }

        this.setState(this._getModels(this.context.gl));
        attributeManager.invalidateAll();
      }
    }
  }, {
    key: "updateGeometry",
    value: function updateGeometry(_ref3) {
      var props = _ref3.props,
          oldProps = _ref3.oldProps,
          changeFlags = _ref3.changeFlags;
      var geometryConfigChanged = changeFlags.dataChanged || changeFlags.updateTriggersChanged && (changeFlags.updateTriggersChanged.all || changeFlags.updateTriggersChanged.getPolygon);

      if (geometryConfigChanged) {
        var polygonTesselator = this.state.polygonTesselator;
        var buffers = props.data.attributes || {};
        polygonTesselator.updateGeometry({
          data: props.data,
          normalize: props._normalize,
          geometryBuffer: buffers.getPolygon,
          buffers: buffers,
          getGeometry: props.getPolygon,
          positionFormat: props.positionFormat,
          wrapLongitude: props.wrapLongitude,
          resolution: this.context.viewport.resolution,
          fp64: this.use64bitPositions(),
          dataChanged: changeFlags.dataChanged
        });
        this.setState({
          numInstances: polygonTesselator.instanceCount,
          startIndices: polygonTesselator.vertexStarts
        });

        if (!changeFlags.dataChanged) {
          this.getAttributeManager().invalidateAll();
        }
      }
    }
  }, {
    key: "_getModels",
    value: function _getModels(gl) {
      var _this$props2 = this.props,
          id = _this$props2.id,
          filled = _this$props2.filled,
          extruded = _this$props2.extruded;
      var topModel;
      var sideModel;

      if (filled) {
        var shaders = this.getShaders('top');
        shaders.defines.NON_INSTANCED_MODEL = 1;
        topModel = new Model(gl, Object.assign({}, shaders, {
          id: "".concat(id, "-top"),
          drawMode: 4,
          attributes: {
            vertexPositions: new Float32Array([0, 1])
          },
          uniforms: {
            isWireframe: false,
            isSideVertex: false
          },
          vertexCount: 0,
          isIndexed: true
        }));
      }

      if (extruded) {
        sideModel = new Model(gl, Object.assign({}, this.getShaders('side'), {
          id: "".concat(id, "-side"),
          geometry: new Geometry({
            drawMode: 1,
            vertexCount: 4,
            attributes: {
              vertexPositions: {
                size: 2,
                value: new Float32Array([1, 0, 0, 0, 0, 1, 1, 1])
              }
            }
          }),
          instanceCount: 0,
          isInstanced: 1
        }));
        sideModel.userData.excludeAttributes = {
          indices: true
        };
      }

      return {
        models: [sideModel, topModel].filter(Boolean),
        topModel: topModel,
        sideModel: sideModel
      };
    }
  }, {
    key: "calculateIndices",
    value: function calculateIndices(attribute) {
      var polygonTesselator = this.state.polygonTesselator;
      attribute.startIndices = polygonTesselator.indexStarts;
      attribute.value = polygonTesselator.get('indices');
    }
  }, {
    key: "calculatePositions",
    value: function calculatePositions(attribute) {
      var polygonTesselator = this.state.polygonTesselator;
      attribute.startIndices = polygonTesselator.vertexStarts;
      attribute.value = polygonTesselator.get('positions');
    }
  }, {
    key: "calculateVertexValid",
    value: function calculateVertexValid(attribute) {
      attribute.value = this.state.polygonTesselator.get('vertexValid');
    }
  }, {
    key: "wrapLongitude",
    get: function get() {
      return false;
    }
  }]);

  return SolidPolygonLayer;
}(Layer);
SolidPolygonLayer.layerName = 'SolidPolygonLayer';
SolidPolygonLayer.defaultProps = defaultProps$5;

function replaceInRange(_ref) {
  var data = _ref.data,
      getIndex = _ref.getIndex,
      dataRange = _ref.dataRange,
      replace = _ref.replace;
  var _dataRange$startRow = dataRange.startRow,
      startRow = _dataRange$startRow === void 0 ? 0 : _dataRange$startRow,
      _dataRange$endRow = dataRange.endRow,
      endRow = _dataRange$endRow === void 0 ? Infinity : _dataRange$endRow;
  var count = data.length;
  var replaceStart = count;
  var replaceEnd = count;

  for (var i = 0; i < count; i++) {
    var row = getIndex(data[i]);

    if (replaceStart > i && row >= startRow) {
      replaceStart = i;
    }

    if (row >= endRow) {
      replaceEnd = i;
      break;
    }
  }

  var index = replaceStart;
  var dataLengthChanged = replaceEnd - replaceStart !== replace.length;
  var endChunk = dataLengthChanged && data.slice(replaceEnd);

  for (var _i = 0; _i < replace.length; _i++) {
    data[index++] = replace[_i];
  }

  if (dataLengthChanged) {
    for (var _i2 = 0; _i2 < endChunk.length; _i2++) {
      data[index++] = endChunk[_i2];
    }

    data.length = index;
  }

  return {
    startRow: replaceStart,
    endRow: replaceStart + replace.length
  };
}

function getGeojsonFeatures(geojson) {
  if (Array.isArray(geojson)) {
    return geojson;
  }

  log.assert(geojson.type, 'GeoJSON does not have type');

  switch (geojson.type) {
    case 'Feature':
      return [geojson];

    case 'FeatureCollection':
      log.assert(Array.isArray(geojson.features), 'GeoJSON does not have features array');
      return geojson.features;

    default:
      return [{
        geometry: geojson
      }];
  }
}
function separateGeojsonFeatures(features, wrapFeature) {
  var dataRange = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  var separated = {
    pointFeatures: [],
    lineFeatures: [],
    polygonFeatures: [],
    polygonOutlineFeatures: []
  };
  var _dataRange$startRow = dataRange.startRow,
      startRow = _dataRange$startRow === void 0 ? 0 : _dataRange$startRow,
      _dataRange$endRow = dataRange.endRow,
      endRow = _dataRange$endRow === void 0 ? features.length : _dataRange$endRow;

  for (var featureIndex = startRow; featureIndex < endRow; featureIndex++) {
    var feature = features[featureIndex];
    log.assert(feature && feature.geometry, 'GeoJSON does not have geometry');
    var geometry = feature.geometry;

    if (geometry.type === 'GeometryCollection') {
      log.assert(Array.isArray(geometry.geometries), 'GeoJSON does not have geometries array');
      var geometries = geometry.geometries;

      for (var i = 0; i < geometries.length; i++) {
        var subGeometry = geometries[i];
        separateGeometry(subGeometry, separated, wrapFeature, feature, featureIndex);
      }
    } else {
      separateGeometry(geometry, separated, wrapFeature, feature, featureIndex);
    }
  }

  return separated;
}

function separateGeometry(geometry, separated, wrapFeature, sourceFeature, sourceFeatureIndex) {
  var type = geometry.type,
      coordinates = geometry.coordinates;
  var pointFeatures = separated.pointFeatures,
      lineFeatures = separated.lineFeatures,
      polygonFeatures = separated.polygonFeatures,
      polygonOutlineFeatures = separated.polygonOutlineFeatures;

  if (!validateGeometry(type, coordinates)) {
    log.warn("".concat(type, " coordinates are malformed"))();
    return;
  }

  switch (type) {
    case 'Point':
      pointFeatures.push(wrapFeature({
        geometry: geometry
      }, sourceFeature, sourceFeatureIndex));
      break;

    case 'MultiPoint':
      coordinates.forEach(function (point) {
        pointFeatures.push(wrapFeature({
          geometry: {
            type: 'Point',
            coordinates: point
          }
        }, sourceFeature, sourceFeatureIndex));
      });
      break;

    case 'LineString':
      lineFeatures.push(wrapFeature({
        geometry: geometry
      }, sourceFeature, sourceFeatureIndex));
      break;

    case 'MultiLineString':
      coordinates.forEach(function (path) {
        lineFeatures.push(wrapFeature({
          geometry: {
            type: 'LineString',
            coordinates: path
          }
        }, sourceFeature, sourceFeatureIndex));
      });
      break;

    case 'Polygon':
      polygonFeatures.push(wrapFeature({
        geometry: geometry
      }, sourceFeature, sourceFeatureIndex));
      coordinates.forEach(function (path) {
        polygonOutlineFeatures.push(wrapFeature({
          geometry: {
            type: 'LineString',
            coordinates: path
          }
        }, sourceFeature, sourceFeatureIndex));
      });
      break;

    case 'MultiPolygon':
      coordinates.forEach(function (polygon) {
        polygonFeatures.push(wrapFeature({
          geometry: {
            type: 'Polygon',
            coordinates: polygon
          }
        }, sourceFeature, sourceFeatureIndex));
        polygon.forEach(function (path) {
          polygonOutlineFeatures.push(wrapFeature({
            geometry: {
              type: 'LineString',
              coordinates: path
            }
          }, sourceFeature, sourceFeatureIndex));
        });
      });
      break;
  }
}

var COORDINATE_NEST_LEVEL = {
  Point: 1,
  MultiPoint: 2,
  LineString: 2,
  MultiLineString: 3,
  Polygon: 3,
  MultiPolygon: 4
};
function validateGeometry(type, coordinates) {
  var nestLevel = COORDINATE_NEST_LEVEL[type];
  log.assert(nestLevel, "Unknown GeoJSON type ".concat(type));

  while (coordinates && --nestLevel > 0) {
    coordinates = coordinates[0];
  }

  return coordinates && Number.isFinite(coordinates[0]);
}

function _createForOfIteratorHelper$c(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray$c(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray$c(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray$c(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray$c(o, minLen); }

function _arrayLikeToArray$c(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _createSuper$n(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct$n(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _isNativeReflectConstruct$n() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }
var defaultLineColor = [0, 0, 0, 255];
var defaultFillColor = [0, 0, 0, 255];
var defaultProps$6 = {
  stroked: true,
  filled: true,
  extruded: false,
  wireframe: false,
  lineWidthUnits: 'meters',
  lineWidthScale: 1,
  lineWidthMinPixels: 0,
  lineWidthMaxPixels: Number.MAX_SAFE_INTEGER,
  lineJointRounded: false,
  lineMiterLimit: 4,
  elevationScale: 1,
  pointRadiusUnits: 'meters',
  pointRadiusScale: 1,
  pointRadiusMinPixels: 0,
  pointRadiusMaxPixels: Number.MAX_SAFE_INTEGER,
  getLineColor: {
    type: 'accessor',
    value: defaultLineColor
  },
  getFillColor: {
    type: 'accessor',
    value: defaultFillColor
  },
  getRadius: {
    type: 'accessor',
    value: 1
  },
  getLineWidth: {
    type: 'accessor',
    value: 1
  },
  getElevation: {
    type: 'accessor',
    value: 1000
  },
  material: true
};

function getCoordinates(f) {
  return f.geometry.coordinates;
}

var GeoJsonLayer = function (_CompositeLayer) {
  _inherits(GeoJsonLayer, _CompositeLayer);

  var _super = _createSuper$n(GeoJsonLayer);

  function GeoJsonLayer() {
    _classCallCheck(this, GeoJsonLayer);

    return _super.apply(this, arguments);
  }

  _createClass(GeoJsonLayer, [{
    key: "initializeState",
    value: function initializeState() {
      this.state = {
        features: {}
      };

      if (this.props.getLineDashArray) {
        log.removed('getLineDashArray', 'PathStyleExtension')();
      }
    }
  }, {
    key: "updateState",
    value: function updateState(_ref) {
      var props = _ref.props,
          changeFlags = _ref.changeFlags;

      if (!changeFlags.dataChanged) {
        return;
      }

      var features = getGeojsonFeatures(props.data);
      var wrapFeature = this.getSubLayerRow.bind(this);

      if (Array.isArray(changeFlags.dataChanged)) {
        var oldFeatures = this.state.features;
        var newFeatures = {};
        var featuresDiff = {};

        for (var key in oldFeatures) {
          newFeatures[key] = oldFeatures[key].slice();
          featuresDiff[key] = [];
        }

        var _iterator = _createForOfIteratorHelper$c(changeFlags.dataChanged),
            _step;

        try {
          for (_iterator.s(); !(_step = _iterator.n()).done;) {
            var dataRange = _step.value;
            var partialFeatures = separateGeojsonFeatures(features, wrapFeature, dataRange);

            for (var _key in oldFeatures) {
              featuresDiff[_key].push(replaceInRange({
                data: newFeatures[_key],
                getIndex: function getIndex(f) {
                  return f.__source.index;
                },
                dataRange: dataRange,
                replace: partialFeatures[_key]
              }));
            }
          }
        } catch (err) {
          _iterator.e(err);
        } finally {
          _iterator.f();
        }

        this.setState({
          features: newFeatures,
          featuresDiff: featuresDiff
        });
      } else {
        this.setState({
          features: separateGeojsonFeatures(features, wrapFeature),
          featuresDiff: {}
        });
      }
    }
  }, {
    key: "renderLayers",
    value: function renderLayers() {
      var _this$state = this.state,
          features = _this$state.features,
          featuresDiff = _this$state.featuresDiff;
      var pointFeatures = features.pointFeatures,
          lineFeatures = features.lineFeatures,
          polygonFeatures = features.polygonFeatures,
          polygonOutlineFeatures = features.polygonOutlineFeatures;
      var _this$props = this.props,
          stroked = _this$props.stroked,
          filled = _this$props.filled,
          extruded = _this$props.extruded,
          wireframe = _this$props.wireframe,
          material = _this$props.material,
          transitions = _this$props.transitions;
      var _this$props2 = this.props,
          lineWidthUnits = _this$props2.lineWidthUnits,
          lineWidthScale = _this$props2.lineWidthScale,
          lineWidthMinPixels = _this$props2.lineWidthMinPixels,
          lineWidthMaxPixels = _this$props2.lineWidthMaxPixels,
          lineJointRounded = _this$props2.lineJointRounded,
          lineMiterLimit = _this$props2.lineMiterLimit,
          pointRadiusUnits = _this$props2.pointRadiusUnits,
          pointRadiusScale = _this$props2.pointRadiusScale,
          pointRadiusMinPixels = _this$props2.pointRadiusMinPixels,
          pointRadiusMaxPixels = _this$props2.pointRadiusMaxPixels,
          elevationScale = _this$props2.elevationScale,
          lineDashJustified = _this$props2.lineDashJustified;
      var _this$props3 = this.props,
          getLineColor = _this$props3.getLineColor,
          getFillColor = _this$props3.getFillColor,
          getRadius = _this$props3.getRadius,
          getLineWidth = _this$props3.getLineWidth,
          getLineDashArray = _this$props3.getLineDashArray,
          getElevation = _this$props3.getElevation,
          updateTriggers = _this$props3.updateTriggers;
      var PolygonFillLayer = this.getSubLayerClass('polygons-fill', SolidPolygonLayer);
      var PolygonStrokeLayer = this.getSubLayerClass('polygons-stroke', PathLayer);
      var LineStringsLayer = this.getSubLayerClass('line-strings', PathLayer);
      var PointsLayer = this.getSubLayerClass('points', ScatterplotLayer);
      var polygonFillLayer = this.shouldRenderSubLayer('polygons-fill', polygonFeatures) && new PolygonFillLayer({
        _dataDiff: featuresDiff.polygonFeatures && function () {
          return featuresDiff.polygonFeatures;
        },
        extruded: extruded,
        elevationScale: elevationScale,
        filled: filled,
        wireframe: wireframe,
        material: material,
        getElevation: this.getSubLayerAccessor(getElevation),
        getFillColor: this.getSubLayerAccessor(getFillColor),
        getLineColor: this.getSubLayerAccessor(extruded && wireframe ? getLineColor : defaultLineColor),
        transitions: transitions && {
          getPolygon: transitions.geometry,
          getElevation: transitions.getElevation,
          getFillColor: transitions.getFillColor,
          getLineColor: transitions.getLineColor
        }
      }, this.getSubLayerProps({
        id: 'polygons-fill',
        updateTriggers: {
          getElevation: updateTriggers.getElevation,
          getFillColor: updateTriggers.getFillColor,
          lineColors: extruded && wireframe,
          getLineColor: updateTriggers.getLineColor
        }
      }), {
        data: polygonFeatures,
        getPolygon: getCoordinates
      });
      var polygonLineLayer = !extruded && stroked && this.shouldRenderSubLayer('polygons-stroke', polygonOutlineFeatures) && new PolygonStrokeLayer({
        _dataDiff: featuresDiff.polygonOutlineFeatures && function () {
          return featuresDiff.polygonOutlineFeatures;
        },
        widthUnits: lineWidthUnits,
        widthScale: lineWidthScale,
        widthMinPixels: lineWidthMinPixels,
        widthMaxPixels: lineWidthMaxPixels,
        rounded: lineJointRounded,
        miterLimit: lineMiterLimit,
        dashJustified: lineDashJustified,
        getColor: this.getSubLayerAccessor(getLineColor),
        getWidth: this.getSubLayerAccessor(getLineWidth),
        getDashArray: this.getSubLayerAccessor(getLineDashArray),
        transitions: transitions && {
          getPath: transitions.geometry,
          getColor: transitions.getLineColor,
          getWidth: transitions.getLineWidth
        }
      }, this.getSubLayerProps({
        id: 'polygons-stroke',
        updateTriggers: {
          getColor: updateTriggers.getLineColor,
          getWidth: updateTriggers.getLineWidth,
          getDashArray: updateTriggers.getLineDashArray
        }
      }), {
        data: polygonOutlineFeatures,
        getPath: getCoordinates
      });
      var pathLayer = this.shouldRenderSubLayer('linestrings', lineFeatures) && new LineStringsLayer({
        _dataDiff: featuresDiff.lineFeatures && function () {
          return featuresDiff.lineFeatures;
        },
        widthUnits: lineWidthUnits,
        widthScale: lineWidthScale,
        widthMinPixels: lineWidthMinPixels,
        widthMaxPixels: lineWidthMaxPixels,
        rounded: lineJointRounded,
        miterLimit: lineMiterLimit,
        dashJustified: lineDashJustified,
        getColor: this.getSubLayerAccessor(getLineColor),
        getWidth: this.getSubLayerAccessor(getLineWidth),
        getDashArray: this.getSubLayerAccessor(getLineDashArray),
        transitions: transitions && {
          getPath: transitions.geometry,
          getColor: transitions.getLineColor,
          getWidth: transitions.getLineWidth
        }
      }, this.getSubLayerProps({
        id: 'line-strings',
        updateTriggers: {
          getColor: updateTriggers.getLineColor,
          getWidth: updateTriggers.getLineWidth,
          getDashArray: updateTriggers.getLineDashArray
        }
      }), {
        data: lineFeatures,
        getPath: getCoordinates
      });
      var pointLayer = this.shouldRenderSubLayer('points', pointFeatures) && new PointsLayer({
        _dataDiff: featuresDiff.pointFeatures && function () {
          return featuresDiff.pointFeatures;
        },
        stroked: stroked,
        filled: filled,
        radiusUnits: pointRadiusUnits,
        radiusScale: pointRadiusScale,
        radiusMinPixels: pointRadiusMinPixels,
        radiusMaxPixels: pointRadiusMaxPixels,
        lineWidthUnits: lineWidthUnits,
        lineWidthScale: lineWidthScale,
        lineWidthMinPixels: lineWidthMinPixels,
        lineWidthMaxPixels: lineWidthMaxPixels,
        getFillColor: this.getSubLayerAccessor(getFillColor),
        getLineColor: this.getSubLayerAccessor(getLineColor),
        getRadius: this.getSubLayerAccessor(getRadius),
        getLineWidth: this.getSubLayerAccessor(getLineWidth),
        transitions: transitions && {
          getPosition: transitions.geometry,
          getFillColor: transitions.getFillColor,
          getLineColor: transitions.getLineColor,
          getRadius: transitions.getRadius,
          getLineWidth: transitions.getLineWidth
        }
      }, this.getSubLayerProps({
        id: 'points',
        updateTriggers: {
          getFillColor: updateTriggers.getFillColor,
          getLineColor: updateTriggers.getLineColor,
          getRadius: updateTriggers.getRadius,
          getLineWidth: updateTriggers.getLineWidth
        }
      }), {
        data: pointFeatures,
        getPosition: getCoordinates,
        highlightedObjectIndex: this._getHighlightedIndex(pointFeatures)
      });
      return [!extruded && polygonFillLayer, polygonLineLayer, pathLayer, pointLayer, extruded && polygonFillLayer];
    }
  }, {
    key: "_getHighlightedIndex",
    value: function _getHighlightedIndex(data) {
      var highlightedObjectIndex = this.props.highlightedObjectIndex;
      return Number.isFinite(highlightedObjectIndex) ? data.findIndex(function (d) {
        return d.__source.index === highlightedObjectIndex;
      }) : null;
    }
  }]);

  return GeoJsonLayer;
}(CompositeLayer);
GeoJsonLayer.layerName = 'GeoJsonLayer';
GeoJsonLayer.defaultProps = defaultProps$6;

var Tile2DHeader = function () {
  function Tile2DHeader(_ref) {
    var x = _ref.x,
        y = _ref.y,
        z = _ref.z,
        onTileLoad = _ref.onTileLoad,
        onTileError = _ref.onTileError;

    _classCallCheck(this, Tile2DHeader);

    this.x = x;
    this.y = y;
    this.z = z;
    this.isVisible = false;
    this.isSelected = false;
    this.parent = null;
    this.children = [];
    this.content = null;
    this._isLoaded = false;
    this._isCancelled = false;
    this.onTileLoad = onTileLoad;
    this.onTileError = onTileError;
  }

  _createClass(Tile2DHeader, [{
    key: "_loadData",
    value: function () {
      var _loadData2 = _asyncToGenerator(regenerator.mark(function _callee(getTileData, requestScheduler) {
        var x, y, z, bbox, signal, requestToken, tileData, error;
        return regenerator.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                x = this.x, y = this.y, z = this.z, bbox = this.bbox;
                this._abortController = new AbortController();
                signal = this._abortController.signal;
                _context.next = 5;
                return requestScheduler.scheduleRequest(this, function (tile) {
                  return tile.isSelected ? 1 : -1;
                });

              case 5:
                requestToken = _context.sent;

                if (requestToken) {
                  _context.next = 9;
                  break;
                }

                this._isCancelled = true;
                return _context.abrupt("return");

              case 9:
                if (!this._isCancelled) {
                  _context.next = 12;
                  break;
                }

                requestToken.done();
                return _context.abrupt("return");

              case 12:
                _context.prev = 12;
                _context.next = 15;
                return getTileData({
                  x: x,
                  y: y,
                  z: z,
                  bbox: bbox,
                  signal: signal
                });

              case 15:
                tileData = _context.sent;
                _context.next = 21;
                break;

              case 18:
                _context.prev = 18;
                _context.t0 = _context["catch"](12);
                error = _context.t0 || true;

              case 21:
                _context.prev = 21;
                requestToken.done();

                if (this._isCancelled && !tileData) {
                  this._isLoaded = false;
                } else {
                  this._isLoaded = true;
                  this._isCancelled = false;
                }

                return _context.finish(21);

              case 25:
                if (this._isLoaded) {
                  _context.next = 27;
                  break;
                }

                return _context.abrupt("return");

              case 27:
                if (error) {
                  this.onTileError(error, this);
                } else {
                  this.content = tileData;
                  this.onTileLoad(this);
                }

              case 28:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this, [[12, 18, 21, 25]]);
      }));

      function _loadData(_x, _x2) {
        return _loadData2.apply(this, arguments);
      }

      return _loadData;
    }()
  }, {
    key: "loadData",
    value: function loadData(getTileData, requestScheduler) {
      var _this = this;

      if (!getTileData) {
        return;
      }

      this._isCancelled = false;
      this._loader = this._loadData(getTileData, requestScheduler);

      this._loader["finally"](function () {
        _this._loader = undefined;
      });
    }
  }, {
    key: "abort",
    value: function abort() {
      if (this.isLoaded) {
        return;
      }

      this._isCancelled = true;

      this._abortController.abort();
    }
  }, {
    key: "data",
    get: function get() {
      return this._isLoaded ? this.content : this._loader;
    }
  }, {
    key: "isLoaded",
    get: function get() {
      return this._isLoaded;
    }
  }, {
    key: "isLoading",
    get: function get() {
      return Boolean(this._loader);
    }
  }, {
    key: "isCancelled",
    get: function get() {
      return this._isCancelled;
    }
  }, {
    key: "byteLength",
    get: function get() {
      var result = this.content ? this.content.byteLength : 0;

      if (!Number.isFinite(result)) {
        log.error('byteLength not defined in tile data')();
      }

      return result;
    }
  }]);

  return Tile2DHeader;
}();

var INTERSECTION = Object.freeze({
  OUTSIDE: -1,
  INTERSECTING: 0,
  INSIDE: 1
});

var scratchVector = new Vector3();
var scratchNormal = new Vector3();

var AxisAlignedBoundingBox = function () {
  function AxisAlignedBoundingBox() {
    var minimum = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [0, 0, 0];
    var maximum = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [0, 0, 0];
    var center = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

    _classCallCheck(this, AxisAlignedBoundingBox);

    center = center || scratchVector.copy(minimum).add(maximum).scale(0.5);
    this.center = new Vector3(center);
    this.halfDiagonal = new Vector3(maximum).subtract(this.center);
    this.minimum = new Vector3(minimum);
    this.maximum = new Vector3(maximum);
  }

  _createClass(AxisAlignedBoundingBox, [{
    key: "clone",
    value: function clone() {
      return new AxisAlignedBoundingBox(this.minimum, this.maximum, this.center);
    }
  }, {
    key: "equals",
    value: function equals(right) {
      return this === right || Boolean(right) && this.minimum.equals(right.minimum) && this.maximum.equals(right.maximum);
    }
  }, {
    key: "intersectPlane",
    value: function intersectPlane(plane) {
      var halfDiagonal = this.halfDiagonal;
      var normal = scratchNormal.from(plane.normal);
      var e = halfDiagonal.x * Math.abs(normal.x) + halfDiagonal.y * Math.abs(normal.y) + halfDiagonal.z * Math.abs(normal.z);
      var s = this.center.dot(normal) + plane.distance;

      if (s - e > 0) {
        return INTERSECTION.INSIDE;
      }

      if (s + e < 0) {
        return INTERSECTION.OUTSIDE;
      }

      return INTERSECTION.INTERSECTING;
    }
  }, {
    key: "distanceTo",
    value: function distanceTo(point) {
      return Math.sqrt(this.distanceSquaredTo(point));
    }
  }, {
    key: "distanceSquaredTo",
    value: function distanceSquaredTo(point) {
      var offset = scratchVector.from(point).subtract(this.center);
      var halfDiagonal = this.halfDiagonal;
      var distanceSquared = 0.0;
      var d;
      d = Math.abs(offset.x) - halfDiagonal.x;

      if (d > 0) {
        distanceSquared += d * d;
      }

      d = Math.abs(offset.y) - halfDiagonal.y;

      if (d > 0) {
        distanceSquared += d * d;
      }

      d = Math.abs(offset.z) - halfDiagonal.z;

      if (d > 0) {
        distanceSquared += d * d;
      }

      return distanceSquared;
    }
  }]);

  return AxisAlignedBoundingBox;
}();

var scratchVector$1 = new Vector3();
var scratchVector2 = new Vector3();

var BoundingSphere = function () {
  function BoundingSphere() {
    var center = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [0, 0, 0];
    var radius = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0.0;

    _classCallCheck(this, BoundingSphere);

    this.radius = -0;
    this.center = new Vector3();
    this.fromCenterRadius(center, radius);
  }

  _createClass(BoundingSphere, [{
    key: "fromCenterRadius",
    value: function fromCenterRadius(center, radius) {
      this.center.from(center);
      this.radius = radius;
      return this;
    }
  }, {
    key: "fromCornerPoints",
    value: function fromCornerPoints(corner, oppositeCorner) {
      oppositeCorner = scratchVector$1.from(oppositeCorner);
      this.center = new Vector3().from(corner).add(oppositeCorner).scale(0.5);
      this.radius = this.center.distance(oppositeCorner);
      return this;
    }
  }, {
    key: "equals",
    value: function equals(right) {
      return this === right || Boolean(right) && this.center.equals(right.center) && this.radius === right.radius;
    }
  }, {
    key: "clone",
    value: function clone() {
      return new BoundingSphere(this.center, this.radius);
    }
  }, {
    key: "union",
    value: function union(boundingSphere) {
      var leftCenter = this.center;
      var leftRadius = this.radius;
      var rightCenter = boundingSphere.center;
      var rightRadius = boundingSphere.radius;
      var toRightCenter = scratchVector$1.copy(rightCenter).subtract(leftCenter);
      var centerSeparation = toRightCenter.magnitude();

      if (leftRadius >= centerSeparation + rightRadius) {
        return this.clone();
      }

      if (rightRadius >= centerSeparation + leftRadius) {
        return boundingSphere.clone();
      }

      var halfDistanceBetweenTangentPoints = (leftRadius + centerSeparation + rightRadius) * 0.5;
      scratchVector2.copy(toRightCenter).scale((-leftRadius + halfDistanceBetweenTangentPoints) / centerSeparation).add(leftCenter);
      this.center.copy(scratchVector2);
      this.radius = halfDistanceBetweenTangentPoints;
      return this;
    }
  }, {
    key: "expand",
    value: function expand(point) {
      point = scratchVector$1.from(point);
      var radius = point.subtract(this.center).magnitude();

      if (radius > this.radius) {
        this.radius = radius;
      }

      return this;
    }
  }, {
    key: "intersectPlane",
    value: function intersectPlane(plane) {
      var center = this.center;
      var radius = this.radius;
      var normal = plane.normal;
      var distanceToPlane = normal.dot(center) + plane.distance;

      if (distanceToPlane < -radius) {
        return INTERSECTION.OUTSIDE;
      }

      if (distanceToPlane < radius) {
        return INTERSECTION.INTERSECTING;
      }

      return INTERSECTION.INSIDE;
    }
  }, {
    key: "transform",
    value: function transform(_transform) {
      this.center.transform(_transform);
      var scale = getScaling(scratchVector$1, _transform);
      this.radius = Math.max(scale[0], Math.max(scale[1], scale[2])) * this.radius;
      return this;
    }
  }, {
    key: "distanceSquaredTo",
    value: function distanceSquaredTo(point) {
      point = scratchVector$1.from(point);
      var delta = point.subtract(this.center);
      return delta.lengthSquared() - this.radius * this.radius;
    }
  }, {
    key: "distanceTo",
    value: function distanceTo(point) {
      return Math.sqrt(this.distanceSquaredTo(point));
    }
  }]);

  return BoundingSphere;
}();

var scratchVector$2 = new Vector3();
var scratchOffset = new Vector3();
var scratchVectorU = new Vector3();
var scratchVectorV = new Vector3();
var scratchVectorW = new Vector3();
var scratchCorner = new Vector3();
var scratchToCenter = new Vector3();
var fromOrientedBoundingBoxScratchU = new Vector3();
var fromOrientedBoundingBoxScratchV = new Vector3();
var fromOrientedBoundingBoxScratchW = new Vector3();
var MATRIX3 = {
  COLUMN0ROW0: 0,
  COLUMN0ROW1: 1,
  COLUMN0ROW2: 2,
  COLUMN1ROW0: 3,
  COLUMN1ROW1: 4,
  COLUMN1ROW2: 5,
  COLUMN2ROW0: 6,
  COLUMN2ROW1: 7,
  COLUMN2ROW2: 8
};

var OrientedBoundingBox = function () {
  function OrientedBoundingBox() {
    var center = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [0, 0, 0];
    var halfAxes = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [0, 0, 0, 0, 0, 0, 0, 0, 0];

    _classCallCheck(this, OrientedBoundingBox);

    this.center = new Vector3().from(center);
    this.halfAxes = new Matrix3(halfAxes);
  }

  _createClass(OrientedBoundingBox, [{
    key: "fromCenterHalfSizeQuaternion",
    value: function fromCenterHalfSizeQuaternion(center, halfSize, quaternion) {
      var quaternionObject = new Quaternion(quaternion);
      var directionsMatrix = new Matrix3().fromQuaternion(quaternionObject);
      directionsMatrix[0] = directionsMatrix[0] * halfSize[0];
      directionsMatrix[1] = directionsMatrix[1] * halfSize[0];
      directionsMatrix[2] = directionsMatrix[2] * halfSize[0];
      directionsMatrix[3] = directionsMatrix[3] * halfSize[1];
      directionsMatrix[4] = directionsMatrix[4] * halfSize[1];
      directionsMatrix[5] = directionsMatrix[5] * halfSize[1];
      directionsMatrix[6] = directionsMatrix[6] * halfSize[2];
      directionsMatrix[7] = directionsMatrix[7] * halfSize[2];
      directionsMatrix[8] = directionsMatrix[8] * halfSize[2];
      this.center = new Vector3().from(center);
      this.halfAxes = directionsMatrix;
      return this;
    }
  }, {
    key: "clone",
    value: function clone() {
      return new OrientedBoundingBox(this.center, this.halfAxes);
    }
  }, {
    key: "equals",
    value: function equals(right) {
      return this === right || Boolean(right) && this.center.equals(right.center) && this.halfAxes.equals(right.halfAxes);
    }
  }, {
    key: "getBoundingSphere",
    value: function getBoundingSphere() {
      var result = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : new BoundingSphere();
      var halfAxes = this.halfAxes;
      var u = halfAxes.getColumn(0, fromOrientedBoundingBoxScratchU);
      var v = halfAxes.getColumn(1, fromOrientedBoundingBoxScratchV);
      var w = halfAxes.getColumn(2, fromOrientedBoundingBoxScratchW);
      var cornerVector = scratchVector$2.copy(u).add(v).add(w);
      result.center.copy(this.center);
      result.radius = cornerVector.magnitude();
      return result;
    }
  }, {
    key: "intersectPlane",
    value: function intersectPlane(plane) {
      var center = this.center;
      var normal = plane.normal;
      var halfAxes = this.halfAxes;
      var normalX = normal.x;
      var normalY = normal.y;
      var normalZ = normal.z;
      var radEffective = Math.abs(normalX * halfAxes[MATRIX3.COLUMN0ROW0] + normalY * halfAxes[MATRIX3.COLUMN0ROW1] + normalZ * halfAxes[MATRIX3.COLUMN0ROW2]) + Math.abs(normalX * halfAxes[MATRIX3.COLUMN1ROW0] + normalY * halfAxes[MATRIX3.COLUMN1ROW1] + normalZ * halfAxes[MATRIX3.COLUMN1ROW2]) + Math.abs(normalX * halfAxes[MATRIX3.COLUMN2ROW0] + normalY * halfAxes[MATRIX3.COLUMN2ROW1] + normalZ * halfAxes[MATRIX3.COLUMN2ROW2]);
      var distanceToPlane = normal.dot(center) + plane.distance;

      if (distanceToPlane <= -radEffective) {
        return INTERSECTION.OUTSIDE;
      } else if (distanceToPlane >= radEffective) {
        return INTERSECTION.INSIDE;
      }

      return INTERSECTION.INTERSECTING;
    }
  }, {
    key: "distanceTo",
    value: function distanceTo(point) {
      return Math.sqrt(this.distanceSquaredTo(point));
    }
  }, {
    key: "distanceSquaredTo",
    value: function distanceSquaredTo(point) {
      var offset = scratchOffset.from(point).subtract(this.center);
      var halfAxes = this.halfAxes;
      var u = halfAxes.getColumn(0, scratchVectorU);
      var v = halfAxes.getColumn(1, scratchVectorV);
      var w = halfAxes.getColumn(2, scratchVectorW);
      var uHalf = u.magnitude();
      var vHalf = v.magnitude();
      var wHalf = w.magnitude();
      u.normalize();
      v.normalize();
      w.normalize();
      var distanceSquared = 0.0;
      var d;
      d = Math.abs(offset.dot(u)) - uHalf;

      if (d > 0) {
        distanceSquared += d * d;
      }

      d = Math.abs(offset.dot(v)) - vHalf;

      if (d > 0) {
        distanceSquared += d * d;
      }

      d = Math.abs(offset.dot(w)) - wHalf;

      if (d > 0) {
        distanceSquared += d * d;
      }

      return distanceSquared;
    }
  }, {
    key: "computePlaneDistances",
    value: function computePlaneDistances(position, direction) {
      var result = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [-0, -0];
      var minDist = Number.POSITIVE_INFINITY;
      var maxDist = Number.NEGATIVE_INFINITY;
      var center = this.center;
      var halfAxes = this.halfAxes;
      var u = halfAxes.getColumn(0, scratchVectorU);
      var v = halfAxes.getColumn(1, scratchVectorV);
      var w = halfAxes.getColumn(2, scratchVectorW);
      var corner = scratchCorner.copy(u).add(v).add(w).add(center);
      var toCenter = scratchToCenter.copy(corner).subtract(position);
      var mag = direction.dot(toCenter);
      minDist = Math.min(mag, minDist);
      maxDist = Math.max(mag, maxDist);
      corner.copy(center).add(u).add(v).subtract(w);
      toCenter.copy(corner).subtract(position);
      mag = direction.dot(toCenter);
      minDist = Math.min(mag, minDist);
      maxDist = Math.max(mag, maxDist);
      corner.copy(center).add(u).subtract(v).add(w);
      toCenter.copy(corner).subtract(position);
      mag = direction.dot(toCenter);
      minDist = Math.min(mag, minDist);
      maxDist = Math.max(mag, maxDist);
      corner.copy(center).add(u).subtract(v).subtract(w);
      toCenter.copy(corner).subtract(position);
      mag = direction.dot(toCenter);
      minDist = Math.min(mag, minDist);
      maxDist = Math.max(mag, maxDist);
      center.copy(corner).subtract(u).add(v).add(w);
      toCenter.copy(corner).subtract(position);
      mag = direction.dot(toCenter);
      minDist = Math.min(mag, minDist);
      maxDist = Math.max(mag, maxDist);
      center.copy(corner).subtract(u).add(v).subtract(w);
      toCenter.copy(corner).subtract(position);
      mag = direction.dot(toCenter);
      minDist = Math.min(mag, minDist);
      maxDist = Math.max(mag, maxDist);
      center.copy(corner).subtract(u).subtract(v).add(w);
      toCenter.copy(corner).subtract(position);
      mag = direction.dot(toCenter);
      minDist = Math.min(mag, minDist);
      maxDist = Math.max(mag, maxDist);
      center.copy(corner).subtract(u).subtract(v).subtract(w);
      toCenter.copy(corner).subtract(position);
      mag = direction.dot(toCenter);
      minDist = Math.min(mag, minDist);
      maxDist = Math.max(mag, maxDist);
      result[0] = minDist;
      result[1] = maxDist;
      return result;
    }
  }, {
    key: "getTransform",
    value: function getTransform() {}
  }, {
    key: "halfSize",
    get: function get() {
      var xAxis = this.halfAxes.getColumn(0);
      var yAxis = this.halfAxes.getColumn(1);
      var zAxis = this.halfAxes.getColumn(2);
      return [new Vector3(xAxis).len(), new Vector3(yAxis).len(), new Vector3(zAxis).len()];
    }
  }, {
    key: "quaternion",
    get: function get() {
      var xAxis = this.halfAxes.getColumn(0);
      var yAxis = this.halfAxes.getColumn(1);
      var zAxis = this.halfAxes.getColumn(2);
      var normXAxis = new Vector3(xAxis).normalize();
      var normYAxis = new Vector3(yAxis).normalize();
      var normZAxis = new Vector3(zAxis).normalize();
      return new Quaternion().fromMatrix3(new Matrix3([].concat(_toConsumableArray(normXAxis), _toConsumableArray(normYAxis), _toConsumableArray(normZAxis))));
    }
  }]);

  return OrientedBoundingBox;
}();

var scratchPosition = new Vector3();
var scratchNormal$1 = new Vector3();

var Plane = function () {
  function Plane() {
    var normal = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [0, 0, 1];
    var distance = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

    _classCallCheck(this, Plane);

    this.normal = new Vector3();
    this.distance = -0;
    this.fromNormalDistance(normal, distance);
  }

  _createClass(Plane, [{
    key: "fromNormalDistance",
    value: function fromNormalDistance(normal, distance) {
      assert$2(Number.isFinite(distance));
      this.normal.from(normal).normalize();
      this.distance = distance;
      return this;
    }
  }, {
    key: "fromPointNormal",
    value: function fromPointNormal(point, normal) {
      point = scratchPosition.from(point);
      this.normal.from(normal).normalize();
      var distance = -this.normal.dot(point);
      this.distance = distance;
      return this;
    }
  }, {
    key: "fromCoefficients",
    value: function fromCoefficients(a, b, c, d) {
      this.normal.set(a, b, c);
      assert$2(equals$1(this.normal.len(), 1));
      this.distance = d;
      return this;
    }
  }, {
    key: "clone",
    value: function clone(plane) {
      return new Plane(this.normal, this.distance);
    }
  }, {
    key: "equals",
    value: function equals(right) {
      return equals$1(this.distance, right.distance) && equals$1(this.normal, right.normal);
    }
  }, {
    key: "getPointDistance",
    value: function getPointDistance(point) {
      return this.normal.dot(point) + this.distance;
    }
  }, {
    key: "transform",
    value: function transform(matrix4) {
      var normal = scratchNormal$1.copy(this.normal).transformAsVector(matrix4).normalize();
      var point = this.normal.scale(-this.distance).transform(matrix4);
      return this.fromPointNormal(point, normal);
    }
  }, {
    key: "projectPointOntoPlane",
    value: function projectPointOntoPlane(point) {
      var result = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [0, 0, 0];
      point = scratchPosition.from(point);
      var pointDistance = this.getPointDistance(point);
      var scaledNormal = scratchNormal$1.copy(this.normal).scale(pointDistance);
      return point.subtract(scaledNormal).to(result);
    }
  }]);

  return Plane;
}();

function _createForOfIteratorHelper$d(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray$d(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray$d(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray$d(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray$d(o, minLen); }

function _arrayLikeToArray$d(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }
var faces = [new Vector3([1, 0, 0]), new Vector3([0, 1, 0]), new Vector3([0, 0, 1])];
var scratchPlaneCenter = new Vector3();
var scratchPlaneNormal = new Vector3();
var scratchPlane = new Plane(new Vector3(1.0, 0.0, 0.0), 0.0);

var CullingVolume = function () {
  _createClass(CullingVolume, null, [{
    key: "MASK_OUTSIDE",
    get: function get() {
      return 0xffffffff;
    }
  }, {
    key: "MASK_INSIDE",
    get: function get() {
      return 0x00000000;
    }
  }, {
    key: "MASK_INDETERMINATE",
    get: function get() {
      return 0x7fffffff;
    }
  }]);

  function CullingVolume() {
    var planes = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

    _classCallCheck(this, CullingVolume);

    this.planes = planes;
    assert$2(this.planes.every(function (plane) {
      return plane instanceof Plane;
    }));
  }

  _createClass(CullingVolume, [{
    key: "fromBoundingSphere",
    value: function fromBoundingSphere(boundingSphere) {
      this.planes.length = 2 * faces.length;
      var center = boundingSphere.center;
      var radius = boundingSphere.radius;
      var planeIndex = 0;

      var _iterator = _createForOfIteratorHelper$d(faces),
          _step;

      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var faceNormal = _step.value;
          var plane0 = this.planes[planeIndex];
          var plane1 = this.planes[planeIndex + 1];

          if (!plane0) {
            plane0 = this.planes[planeIndex] = new Plane();
          }

          if (!plane1) {
            plane1 = this.planes[planeIndex + 1] = new Plane();
          }

          var plane0Center = scratchPlaneCenter.copy(faceNormal).scale(-radius).add(center);
          var plane0Distance = -faceNormal.dot(plane0Center);
          plane0.fromPointNormal(plane0Center, faceNormal);
          var plane1Center = scratchPlaneCenter.copy(faceNormal).scale(radius).add(center);
          var negatedFaceNormal = scratchPlaneNormal.copy(faceNormal).negate();
          var plane1Distance = -negatedFaceNormal.dot(plane1Center);
          plane1.fromPointNormal(plane1Center, negatedFaceNormal);
          planeIndex += 2;
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }

      return this;
    }
  }, {
    key: "computeVisibility",
    value: function computeVisibility(boundingVolume) {
      assert$2(boundingVolume);
      var intersect = INTERSECTION.INSIDE;

      var _iterator2 = _createForOfIteratorHelper$d(this.planes),
          _step2;

      try {
        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
          var plane = _step2.value;
          var result = boundingVolume.intersectPlane(plane);

          switch (result) {
            case INTERSECTION.OUTSIDE:
              return INTERSECTION.OUTSIDE;

            case INTERSECTION.INTERSECTING:
              intersect = INTERSECTION.INTERSECTING;
              break;

            default:
          }
        }
      } catch (err) {
        _iterator2.e(err);
      } finally {
        _iterator2.f();
      }

      return intersect;
    }
  }, {
    key: "computeVisibilityWithPlaneMask",
    value: function computeVisibilityWithPlaneMask(boundingVolume, parentPlaneMask) {
      assert$2(boundingVolume, 'boundingVolume is required.');
      assert$2(Number.isFinite(parentPlaneMask), 'parentPlaneMask is required.');

      if (parentPlaneMask === CullingVolume.MASK_OUTSIDE || parentPlaneMask === CullingVolume.MASK_INSIDE) {
        return parentPlaneMask;
      }

      var mask = CullingVolume.MASK_INSIDE;
      var planes = this.planes;

      for (var k = 0; k < this.planes.length; ++k) {
        var flag = k < 31 ? 1 << k : 0;

        if (k < 31 && (parentPlaneMask & flag) === 0) {
          continue;
        }

        var plane = planes[k];
        var result = boundingVolume.intersectPlane(plane);

        if (result === INTERSECTION.OUTSIDE) {
          return CullingVolume.MASK_OUTSIDE;
        } else if (result === INTERSECTION.INTERSECTING) {
          mask |= flag;
        }
      }

      return mask;
    }
  }]);

  return CullingVolume;
}();

function ownKeys$c(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread$c(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys$c(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys$c(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }
var scratchPlaneUpVector = new Vector3();
var scratchPlaneRightVector = new Vector3();
var scratchPlaneNearCenter = new Vector3();
var scratchPlaneFarCenter = new Vector3();
var scratchPlaneNormal$1 = new Vector3();

var PerspectiveOffCenterFrustum = function () {
  function PerspectiveOffCenterFrustum() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, PerspectiveOffCenterFrustum);

    options = _objectSpread$c({
      near: 1.0,
      far: 500000000.0
    }, options);
    this.left = options.left;
    this._left = undefined;
    this.right = options.right;
    this._right = undefined;
    this.top = options.top;
    this._top = undefined;
    this.bottom = options.bottom;
    this._bottom = undefined;
    this.near = options.near;
    this._near = this.near;
    this.far = options.far;
    this._far = this.far;
    this._cullingVolume = new CullingVolume([new Plane(), new Plane(), new Plane(), new Plane(), new Plane(), new Plane()]);
    this._perspectiveMatrix = new Matrix4$1();
    this._infinitePerspective = new Matrix4$1();
  }

  _createClass(PerspectiveOffCenterFrustum, [{
    key: "clone",
    value: function clone() {
      return new PerspectiveOffCenterFrustum({
        right: this.right,
        left: this.left,
        top: this.top,
        bottom: this.bottom,
        near: this.near,
        far: this.far
      });
    }
  }, {
    key: "equals",
    value: function equals(other) {
      return other && other instanceof PerspectiveOffCenterFrustum && this.right === other.right && this.left === other.left && this.top === other.top && this.bottom === other.bottom && this.near === other.near && this.far === other.far;
    }
  }, {
    key: "computeCullingVolume",
    value: function computeCullingVolume(position, direction, up) {
      assert$2(position, 'position is required.');
      assert$2(direction, 'direction is required.');
      assert$2(up, 'up is required.');
      var planes = this._cullingVolume.planes;
      up = scratchPlaneUpVector.copy(up).normalize();
      var right = scratchPlaneRightVector.copy(direction).cross(up).normalize();
      var nearCenter = scratchPlaneNearCenter.copy(direction).multiplyByScalar(this.near).add(position);
      var farCenter = scratchPlaneFarCenter.copy(direction).multiplyByScalar(this.far).add(position);
      var normal = scratchPlaneNormal$1;
      normal.copy(right).multiplyByScalar(this.left).add(nearCenter).subtract(position).cross(up);
      planes[0].fromPointNormal(position, normal);
      normal.copy(right).multiplyByScalar(this.right).add(nearCenter).subtract(position).cross(up).negate();
      planes[1].fromPointNormal(position, normal);
      normal.copy(up).multiplyByScalar(this.bottom).add(nearCenter).subtract(position).cross(right).negate();
      planes[2].fromPointNormal(position, normal);
      normal.copy(up).multiplyByScalar(this.top).add(nearCenter).subtract(position).cross(right);
      planes[3].fromPointNormal(position, normal);
      normal = new Vector3().copy(direction);
      planes[4].fromPointNormal(nearCenter, normal);
      normal.negate();
      planes[5].fromPointNormal(farCenter, normal);
      return this._cullingVolume;
    }
  }, {
    key: "getPixelDimensions",
    value: function getPixelDimensions(drawingBufferWidth, drawingBufferHeight, distance, result) {
      update(this);
      assert$2(Number.isFinite(drawingBufferWidth) && Number.isFinite(drawingBufferHeight));
      assert$2(drawingBufferWidth > 0);
      assert$2(drawingBufferHeight > 0);
      assert$2(distance > 0);
      assert$2(result);
      var inverseNear = 1.0 / this.near;
      var tanTheta = this.top * inverseNear;
      var pixelHeight = 2.0 * distance * tanTheta / drawingBufferHeight;
      tanTheta = this.right * inverseNear;
      var pixelWidth = 2.0 * distance * tanTheta / drawingBufferWidth;
      result.x = pixelWidth;
      result.y = pixelHeight;
      return result;
    }
  }, {
    key: "projectionMatrix",
    get: function get() {
      update(this);
      return this._perspectiveMatrix;
    }
  }, {
    key: "infiniteProjectionMatrix",
    get: function get() {
      update(this);
      return this._infinitePerspective;
    }
  }]);

  return PerspectiveOffCenterFrustum;
}();

function update(frustum) {
  assert$2(Number.isFinite(frustum.right) && Number.isFinite(frustum.left) && Number.isFinite(frustum.top) && Number.isFinite(frustum.bottom) && Number.isFinite(frustum.near) && Number.isFinite(frustum.far));
  var top = frustum.top,
      bottom = frustum.bottom,
      right = frustum.right,
      left = frustum.left,
      near = frustum.near,
      far = frustum.far;

  if (top !== frustum._top || bottom !== frustum._bottom || left !== frustum._left || right !== frustum._right || near !== frustum._near || far !== frustum._far) {
    assert$2(frustum.near > 0 && frustum.near < frustum.far, 'near must be greater than zero and less than far.');
    frustum._left = left;
    frustum._right = right;
    frustum._top = top;
    frustum._bottom = bottom;
    frustum._near = near;
    frustum._far = far;
    frustum._perspectiveMatrix = new Matrix4$1().frustum({
      left: left,
      right: right,
      bottom: bottom,
      top: top,
      near: near,
      far: far
    });
    frustum._infinitePerspective = new Matrix4$1().frustum({
      left: left,
      right: right,
      bottom: bottom,
      top: top,
      near: near,
      far: Infinity
    });
  }
}

function ownKeys$d(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread$d(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys$d(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys$d(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

var defined = function defined(val) {
  return val !== null && typeof val !== 'undefined';
};

var PerspectiveFrustum = function () {
  function PerspectiveFrustum() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, PerspectiveFrustum);

    options = _objectSpread$d({
      near: 1.0,
      far: 500000000.0,
      xOffset: 0.0,
      yOffset: 0.0
    }, options);
    this._offCenterFrustum = new PerspectiveOffCenterFrustum();
    this.fov = options.fov;
    this._fov = undefined;
    this._fovy = undefined;
    this._sseDenominator = undefined;
    this.aspectRatio = options.aspectRatio;
    this._aspectRatio = undefined;
    this.near = options.near;
    this._near = this.near;
    this.far = options.far;
    this._far = this.far;
    this.xOffset = options.xOffset;
    this._xOffset = this.xOffset;
    this.yOffset = options.yOffset;
    this._yOffset = this.yOffset;
  }

  _createClass(PerspectiveFrustum, [{
    key: "clone",
    value: function clone() {
      return new PerspectiveFrustum({
        aspectRatio: this.aspectRatio,
        fov: this.fov,
        near: this.near,
        far: this.far
      });
    }
  }, {
    key: "equals",
    value: function equals(other) {
      if (!defined(other) || !(other instanceof PerspectiveFrustum)) {
        return false;
      }

      update$1(this);
      update$1(other);
      return this.fov === other.fov && this.aspectRatio === other.aspectRatio && this.near === other.near && this.far === other.far && this._offCenterFrustum.equals(other._offCenterFrustum);
    }
  }, {
    key: "computeCullingVolume",
    value: function computeCullingVolume(position, direction, up) {
      update$1(this);
      return this._offCenterFrustum.computeCullingVolume(position, direction, up);
    }
  }, {
    key: "getPixelDimensions",
    value: function getPixelDimensions(drawingBufferWidth, drawingBufferHeight, distance, result) {
      update$1(this);
      return this._offCenterFrustum.getPixelDimensions(drawingBufferWidth, drawingBufferHeight, distance, result);
    }
  }, {
    key: "projectionMatrix",
    get: function get() {
      update$1(this);
      return this._offCenterFrustum.projectionMatrix;
    }
  }, {
    key: "infiniteProjectionMatrix",
    get: function get() {
      update$1(this);
      return this._offCenterFrustum.infiniteProjectionMatrix;
    }
  }, {
    key: "fovy",
    get: function get() {
      update$1(this);
      return this._fovy;
    }
  }, {
    key: "sseDenominator",
    get: function get() {
      update$1(this);
      return this._sseDenominator;
    }
  }]);

  return PerspectiveFrustum;
}();

function update$1(frustum) {
  assert$2(Number.isFinite(frustum.fov) && Number.isFinite(frustum.aspectRatio) && Number.isFinite(frustum.near) && Number.isFinite(frustum.far));
  var f = frustum._offCenterFrustum;

  if (frustum.fov !== frustum._fov || frustum.aspectRatio !== frustum._aspectRatio || frustum.near !== frustum._near || frustum.far !== frustum._far || frustum.xOffset !== frustum._xOffset || frustum.yOffset !== frustum._yOffset) {
    assert$2(frustum.fov >= 0 && frustum.fov < Math.PI);
    assert$2(frustum.aspectRatio > 0);
    assert$2(frustum.near >= 0 && frustum.near < frustum.far);
    frustum._aspectRatio = frustum.aspectRatio;
    frustum._fov = frustum.fov;
    frustum._fovy = frustum.aspectRatio <= 1 ? frustum.fov : Math.atan(Math.tan(frustum.fov * 0.5) / frustum.aspectRatio) * 2.0;
    frustum._near = frustum.near;
    frustum._far = frustum.far;
    frustum._sseDenominator = 2.0 * Math.tan(0.5 * frustum._fovy);
    frustum._xOffset = frustum.xOffset;
    frustum._yOffset = frustum.yOffset;
    f.top = frustum.near * Math.tan(0.5 * frustum._fovy);
    f.bottom = -f.top;
    f.right = frustum.aspectRatio * f.top;
    f.left = -f.right;
    f.near = frustum.near;
    f.far = frustum.far;
    f.right += frustum.xOffset;
    f.left += frustum.xOffset;
    f.top += frustum.yOffset;
    f.bottom += frustum.yOffset;
  }
}

var fromPointsXMin = new Vector3();
var fromPointsYMin = new Vector3();
var fromPointsZMin = new Vector3();
var fromPointsXMax = new Vector3();
var fromPointsYMax = new Vector3();
var fromPointsZMax = new Vector3();
var fromPointsCurrentPos = new Vector3();
var fromPointsScratch = new Vector3();
var fromPointsRitterCenter = new Vector3();
var fromPointsMinBoxPt = new Vector3();
var fromPointsMaxBoxPt = new Vector3();
var fromPointsNaiveCenterScratch = new Vector3();

var scratchMatrix = new Matrix3();
var scratchUnitary = new Matrix3();
var scratchDiagonal = new Matrix3();
var jMatrix = new Matrix3();
var jMatrixTranspose = new Matrix3();

var scratchVector2$1 = new Vector3();
var scratchVector3 = new Vector3();
var scratchVector4 = new Vector3();
var scratchVector5 = new Vector3();
var scratchVector6 = new Vector3();
var scratchCovarianceResult = new Matrix3();
var scratchEigenResult = {
  diagonal: new Matrix3(),
  unitary: new Matrix3()
};

function _createForOfIteratorHelper$e(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray$e(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray$e(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray$e(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray$e(o, minLen); }

function _arrayLikeToArray$e(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }
var TILE_SIZE$1 = 512;
var MAX_MAPS = 3;

var OSMNode = function () {
  function OSMNode(x, y, z) {
    _classCallCheck(this, OSMNode);

    this.x = x;
    this.y = y;
    this.z = z;
  }

  _createClass(OSMNode, [{
    key: "update",
    value: function update(params) {
      var viewport = params.viewport,
          cullingVolume = params.cullingVolume,
          elevationBounds = params.elevationBounds,
          minZ = params.minZ,
          maxZ = params.maxZ,
          offset = params.offset,
          project = params.project;
      var boundingVolume = this.getBoundingVolume(elevationBounds, offset, project);
      var isInside = cullingVolume.computeVisibility(boundingVolume);

      if (isInside < 0) {
        return false;
      }

      if (!this.childVisible) {
        var z = this.z;

        if (z < maxZ && z >= minZ) {
          var distance = boundingVolume.distanceTo(viewport.cameraPosition) * viewport.scale / viewport.height;
          z += Math.floor(Math.log2(distance));
        }

        if (z >= maxZ) {
          this.selected = true;
          return true;
        }
      }

      this.selected = false;
      this.childVisible = true;

      var _iterator = _createForOfIteratorHelper$e(this.children),
          _step;

      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var child = _step.value;
          child.update(params);
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }

      return true;
    }
  }, {
    key: "getSelected",
    value: function getSelected() {
      var result = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

      if (this.selected) {
        result.push(this);
      }

      if (this._children) {
        var _iterator2 = _createForOfIteratorHelper$e(this._children),
            _step2;

        try {
          for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
            var node = _step2.value;
            node.getSelected(result);
          }
        } catch (err) {
          _iterator2.e(err);
        } finally {
          _iterator2.f();
        }
      }

      return result;
    }
  }, {
    key: "getBoundingVolume",
    value: function getBoundingVolume(zRange, worldOffset, project) {
      if (project) {
        var corner0 = osmTile2lngLat(this.x, this.y, this.z);
        var corner1 = osmTile2lngLat(this.x + 1, this.y + 1, this.z);
        var center = osmTile2lngLat(this.x + 0.5, this.y + 0.5, this.z);
        corner0.z = zRange[1];
        corner1.z = zRange[1];
        center.z = zRange[0];
        var cornerPos0 = project(corner0);
        var cornerPos1 = project(corner1);
        var centerPos = new Vector3(project(center));
        var R = Math.max(centerPos.distance(cornerPos0), centerPos.distance(cornerPos1));
        return new BoundingSphere(centerPos, R);
      }

      var scale = Math.pow(2, this.z);
      var extent = TILE_SIZE$1 / scale;
      var originX = this.x * extent + worldOffset * TILE_SIZE$1;
      var originY = TILE_SIZE$1 - (this.y + 1) * extent;
      return new AxisAlignedBoundingBox([originX, originY, zRange[0]], [originX + extent, originY + extent, zRange[1]]);
    }
  }, {
    key: "children",
    get: function get() {
      if (!this._children) {
        var x = this.x * 2;
        var y = this.y * 2;
        var z = this.z + 1;
        this._children = [new OSMNode(x, y, z), new OSMNode(x, y + 1, z), new OSMNode(x + 1, y, z), new OSMNode(x + 1, y + 1, z)];
      }

      return this._children;
    }
  }]);

  return OSMNode;
}();

function getOSMTileIndices(viewport, maxZ, zRange) {
  var project = viewport.resolution ? viewport.projectPosition : null;
  var planes = Object.values(viewport.getFrustumPlanes()).map(function (_ref) {
    var normal = _ref.normal,
        distance = _ref.distance;
    return new Plane(normal.clone().negate(), distance);
  });
  var cullingVolume = new CullingVolume(planes);
  var unitsPerMeter = viewport.distanceScales.unitsPerMeter[2];
  var elevationMin = zRange && zRange[0] * unitsPerMeter || 0;
  var elevationMax = zRange && zRange[1] * unitsPerMeter || 0;
  var minZ = viewport.pitch <= 60 ? maxZ : 0;
  var root = new OSMNode(0, 0, 0);
  var traversalParams = {
    viewport: viewport,
    project: project,
    cullingVolume: cullingVolume,
    elevationBounds: [elevationMin, elevationMax],
    minZ: minZ,
    maxZ: maxZ,
    offset: 0
  };
  root.update(traversalParams);

  if (viewport.subViewports && viewport.subViewports.length > 1) {
    traversalParams.offset = -1;

    while (root.update(traversalParams)) {
      if (--traversalParams.offset < -MAX_MAPS) {
        break;
      }
    }

    traversalParams.offset = 1;

    while (root.update(traversalParams)) {
      if (++traversalParams.offset > MAX_MAPS) {
        break;
      }
    }
  }

  return root.getSelected();
}

var TILE_SIZE$2 = 512;
var DEFAULT_EXTENT = [-Infinity, -Infinity, Infinity, Infinity];
var urlType = {
  type: 'url',
  value: '',
  validate: function validate(value) {
    return typeof value === 'string' || Array.isArray(value) && value.every(function (url) {
      return typeof url === 'string';
    });
  },
  equals: function equals(value1, value2) {
    if (value1 === value2) {
      return true;
    }

    if (!Array.isArray(value1) || !Array.isArray(value2)) {
      return false;
    }

    var len = value1.length;

    if (len !== value2.length) {
      return false;
    }

    for (var i = 0; i < len; i++) {
      if (value1[i] !== value2[i]) {
        return false;
      }
    }

    return true;
  }
};

function transformBox(bbox, modelMatrix) {
  var transformedCoords = [modelMatrix.transformPoint([bbox[0], bbox[1]]), modelMatrix.transformPoint([bbox[2], bbox[1]]), modelMatrix.transformPoint([bbox[0], bbox[3]]), modelMatrix.transformPoint([bbox[2], bbox[3]])];
  var transformedBox = [Math.min.apply(Math, _toConsumableArray(transformedCoords.map(function (i) {
    return i[0];
  }))), Math.min.apply(Math, _toConsumableArray(transformedCoords.map(function (i) {
    return i[1];
  }))), Math.max.apply(Math, _toConsumableArray(transformedCoords.map(function (i) {
    return i[0];
  }))), Math.max.apply(Math, _toConsumableArray(transformedCoords.map(function (i) {
    return i[1];
  })))];
  return transformedBox;
}

function getURLFromTemplate(template, properties) {
  if (!template || !template.length) {
    return null;
  }

  if (Array.isArray(template)) {
    var index = Math.abs(properties.x + properties.y) % template.length;
    template = template[index];
  }

  var x = properties.x,
      y = properties.y,
      z = properties.z;
  return template.replace('{x}', x).replace('{y}', y).replace('{z}', z).replace('{-y}', Math.pow(2, z) - y - 1);
}

function getBoundingBox$1(viewport, zRange, extent) {
  var bounds;

  if (zRange && zRange.length === 2) {
    var _zRange = _slicedToArray(zRange, 2),
        minZ = _zRange[0],
        maxZ = _zRange[1];

    var bounds0 = viewport.getBounds({
      z: minZ
    });
    var bounds1 = viewport.getBounds({
      z: maxZ
    });
    bounds = [Math.min(bounds0[0], bounds1[0]), Math.min(bounds0[1], bounds1[1]), Math.max(bounds0[2], bounds1[2]), Math.max(bounds0[3], bounds1[3])];
  } else {
    bounds = viewport.getBounds();
  }

  if (!viewport.isGeospatial) {
    return [Math.max(Math.min(bounds[0], extent[2]), extent[0]), Math.max(Math.min(bounds[1], extent[3]), extent[1]), Math.min(Math.max(bounds[2], extent[0]), extent[2]), Math.min(Math.max(bounds[3], extent[1]), extent[3])];
  }

  return [Math.max(bounds[0], extent[0]), Math.max(bounds[1], extent[1]), Math.min(bounds[2], extent[2]), Math.min(bounds[3], extent[3])];
}

function getIndexingCoords(bbox, scale, modelMatrixInverse) {
  if (modelMatrixInverse) {
    var transformedTileIndex = transformBox(bbox, modelMatrixInverse).map(function (i) {
      return i * scale / TILE_SIZE$2;
    });
    return transformedTileIndex;
  }

  return bbox.map(function (i) {
    return i * scale / TILE_SIZE$2;
  });
}

function getScale(z) {
  return Math.pow(2, z);
}

function osmTile2lngLat(x, y, z) {
  var scale = getScale(z);
  var lng = x / scale * 360 - 180;
  var n = Math.PI - 2 * Math.PI * y / scale;
  var lat = 180 / Math.PI * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));
  return [lng, lat];
}

function tile2XY(x, y, z) {
  var scale = getScale(z);
  return [x / scale * TILE_SIZE$2, y / scale * TILE_SIZE$2];
}

function tileToBoundingBox(viewport, x, y, z) {
  if (viewport.isGeospatial) {
    var _osmTile2lngLat = osmTile2lngLat(x, y, z),
        _osmTile2lngLat2 = _slicedToArray(_osmTile2lngLat, 2),
        west = _osmTile2lngLat2[0],
        north = _osmTile2lngLat2[1];

    var _osmTile2lngLat3 = osmTile2lngLat(x + 1, y + 1, z),
        _osmTile2lngLat4 = _slicedToArray(_osmTile2lngLat3, 2),
        east = _osmTile2lngLat4[0],
        south = _osmTile2lngLat4[1];

    return {
      west: west,
      north: north,
      east: east,
      south: south
    };
  }

  var _tile2XY = tile2XY(x, y, z),
      _tile2XY2 = _slicedToArray(_tile2XY, 2),
      left = _tile2XY2[0],
      top = _tile2XY2[1];

  var _tile2XY3 = tile2XY(x + 1, y + 1, z),
      _tile2XY4 = _slicedToArray(_tile2XY3, 2),
      right = _tile2XY4[0],
      bottom = _tile2XY4[1];

  return {
    left: left,
    top: top,
    right: right,
    bottom: bottom
  };
}

function getIdentityTileIndices(viewport, z, extent, modelMatrixInverse) {
  var bbox = getBoundingBox$1(viewport, null, extent);
  var scale = getScale(z);

  var _getIndexingCoords = getIndexingCoords(bbox, scale, modelMatrixInverse),
      _getIndexingCoords2 = _slicedToArray(_getIndexingCoords, 4),
      minX = _getIndexingCoords2[0],
      minY = _getIndexingCoords2[1],
      maxX = _getIndexingCoords2[2],
      maxY = _getIndexingCoords2[3];

  var indices = [];

  for (var x = Math.floor(minX); x < maxX; x++) {
    for (var y = Math.floor(minY); y < maxY; y++) {
      indices.push({
        x: x,
        y: y,
        z: z
      });
    }
  }

  return indices;
}

function getTileIndices(_ref) {
  var viewport = _ref.viewport,
      maxZoom = _ref.maxZoom,
      minZoom = _ref.minZoom,
      zRange = _ref.zRange,
      extent = _ref.extent,
      _ref$tileSize = _ref.tileSize,
      tileSize = _ref$tileSize === void 0 ? TILE_SIZE$2 : _ref$tileSize,
      modelMatrix = _ref.modelMatrix,
      modelMatrixInverse = _ref.modelMatrixInverse;
  var z = Math.round(viewport.zoom + Math.log2(TILE_SIZE$2 / tileSize));

  if (Number.isFinite(minZoom) && z < minZoom) {
    if (!extent) {
      return [];
    }

    z = minZoom;
  }

  if (Number.isFinite(maxZoom) && z > maxZoom) {
    z = maxZoom;
  }

  var transformedExtent = extent;

  if (modelMatrix && modelMatrixInverse && extent && !viewport.isGeospatial) {
    transformedExtent = transformBox(extent, modelMatrix);
  }

  return viewport.isGeospatial ? getOSMTileIndices(viewport, z, zRange) : getIdentityTileIndices(viewport, z, transformedExtent || DEFAULT_EXTENT, modelMatrixInverse);
}

function _createForOfIteratorHelper$f(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray$f(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray$f(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray$f(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray$f(o, minLen); }

function _arrayLikeToArray$f(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }
var TILE_STATE_UNKNOWN = 0;
var TILE_STATE_VISIBLE = 1;
var TILE_STATE_PLACEHOLDER = 3;
var TILE_STATE_HIDDEN = 4;
var TILE_STATE_SELECTED = 5;
var STRATEGY_NEVER = 'never';
var STRATEGY_DEFAULT = 'best-available';
var DEFAULT_CACHE_SCALE = 5;

var Tileset2D = function () {
  function Tileset2D(opts) {
    var _this = this;

    _classCallCheck(this, Tileset2D);

    this.opts = opts;
    this._getTileData = opts.getTileData;
    this.onTileError = opts.onTileError;

    this.onTileLoad = function (tile) {
      opts.onTileLoad(tile);

      if (_this.opts.maxCacheByteSize) {
        _this._cacheByteSize += tile.byteLength;

        _this._resizeCache();
      }
    };

    this.onTileUnload = opts.onTileUnload;
    this._requestScheduler = new RequestScheduler({
      maxRequests: opts.maxRequests,
      throttleRequests: opts.maxRequests > 0
    });
    this._cache = new Map();
    this._tiles = [];
    this._dirty = false;
    this._cacheByteSize = 0;
    this._viewport = null;
    this._selectedTiles = null;
    this._frameNumber = 0;
    this.setOptions(opts);
  }

  _createClass(Tileset2D, [{
    key: "setOptions",
    value: function setOptions(opts) {
      Object.assign(this.opts, opts);

      if (Number.isFinite(opts.maxZoom)) {
        this._maxZoom = Math.floor(opts.maxZoom);
      }

      if (Number.isFinite(opts.minZoom)) {
        this._minZoom = Math.ceil(opts.minZoom);
      }
    }
  }, {
    key: "update",
    value: function update(viewport) {
      var _this2 = this;

      var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
          zRange = _ref.zRange,
          modelMatrix = _ref.modelMatrix;

      var modelMatrixAsMatrix4 = new Matrix4$1(modelMatrix);
      var isModelMatrixNew = !modelMatrixAsMatrix4.equals(this._modelMatrix);

      if (!viewport.equals(this._viewport) || isModelMatrixNew) {
        if (isModelMatrixNew) {
          this._modelMatrixInverse = modelMatrix && modelMatrixAsMatrix4.clone().invert();
          this._modelMatrix = modelMatrix && modelMatrixAsMatrix4;
        }

        this._viewport = viewport;
        var tileIndices = this.getTileIndices({
          viewport: viewport,
          maxZoom: this._maxZoom,
          minZoom: this._minZoom,
          zRange: zRange,
          modelMatrix: this._modelMatrix,
          modelMatrixInverse: this._modelMatrixInverse
        });
        this._selectedTiles = tileIndices.map(function (index) {
          return _this2._getTile(index, true);
        });

        if (this._dirty) {
          this._rebuildTree();
        }
      }

      var changed = this.updateTileStates();

      if (this._dirty) {
        this._resizeCache();
      }

      if (changed) {
        this._frameNumber++;
      }

      return this._frameNumber;
    }
  }, {
    key: "getTileIndices",
    value: function getTileIndices$1(_ref2) {
      var viewport = _ref2.viewport,
          maxZoom = _ref2.maxZoom,
          minZoom = _ref2.minZoom,
          zRange = _ref2.zRange,
          modelMatrix = _ref2.modelMatrix,
          modelMatrixInverse = _ref2.modelMatrixInverse;
      var _this$opts = this.opts,
          tileSize = _this$opts.tileSize,
          extent = _this$opts.extent;
      return getTileIndices({
        viewport: viewport,
        maxZoom: maxZoom,
        minZoom: minZoom,
        zRange: zRange,
        tileSize: tileSize,
        extent: extent,
        modelMatrix: modelMatrix,
        modelMatrixInverse: modelMatrixInverse
      });
    }
  }, {
    key: "getTileMetadata",
    value: function getTileMetadata(_ref3) {
      var x = _ref3.x,
          y = _ref3.y,
          z = _ref3.z;
      return {
        bbox: tileToBoundingBox(this._viewport, x, y, z)
      };
    }
  }, {
    key: "getParentIndex",
    value: function getParentIndex(tileIndex) {
      tileIndex.x = Math.floor(tileIndex.x / 2);
      tileIndex.y = Math.floor(tileIndex.y / 2);
      tileIndex.z -= 1;
      return tileIndex;
    }
  }, {
    key: "updateTileStates",
    value: function updateTileStates() {
      this._updateTileStates(this.selectedTiles);

      var maxRequests = this.opts.maxRequests;
      var abortCandidates = [];
      var ongoingRequestCount = 0;
      var changed = false;

      var _iterator = _createForOfIteratorHelper$f(this._cache.values()),
          _step;

      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var _tile = _step.value;
          var isVisible = Boolean(_tile.state & TILE_STATE_VISIBLE);

          if (_tile.isVisible !== isVisible) {
            changed = true;
            _tile.isVisible = isVisible;
          }

          _tile.isSelected = _tile.state === TILE_STATE_SELECTED;

          if (_tile.isLoading) {
            ongoingRequestCount++;

            if (!_tile.isSelected) {
              abortCandidates.push(_tile);
            }
          }
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }

      if (maxRequests > 0) {
        while (ongoingRequestCount > maxRequests && abortCandidates.length > 0) {
          var tile = abortCandidates.shift();
          tile.abort();
          ongoingRequestCount--;
        }
      }

      return changed;
    }
  }, {
    key: "_rebuildTree",
    value: function _rebuildTree() {
      var _cache = this._cache;

      var _iterator2 = _createForOfIteratorHelper$f(_cache.values()),
          _step2;

      try {
        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
          var tile = _step2.value;
          tile.parent = null;
          tile.children.length = 0;
        }
      } catch (err) {
        _iterator2.e(err);
      } finally {
        _iterator2.f();
      }

      var _iterator3 = _createForOfIteratorHelper$f(_cache.values()),
          _step3;

      try {
        for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
          var _tile2 = _step3.value;

          var parent = this._getNearestAncestor(_tile2.x, _tile2.y, _tile2.z);

          _tile2.parent = parent;

          if (parent) {
            parent.children.push(_tile2);
          }
        }
      } catch (err) {
        _iterator3.e(err);
      } finally {
        _iterator3.f();
      }
    }
  }, {
    key: "_updateTileStates",
    value: function _updateTileStates(selectedTiles) {
      var _cache = this._cache;
      var refinementStrategy = this.opts.refinementStrategy || STRATEGY_DEFAULT;

      var _iterator4 = _createForOfIteratorHelper$f(_cache.values()),
          _step4;

      try {
        for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
          var tile = _step4.value;
          tile.state = TILE_STATE_UNKNOWN;
        }
      } catch (err) {
        _iterator4.e(err);
      } finally {
        _iterator4.f();
      }

      var _iterator5 = _createForOfIteratorHelper$f(selectedTiles),
          _step5;

      try {
        for (_iterator5.s(); !(_step5 = _iterator5.n()).done;) {
          var _tile3 = _step5.value;
          _tile3.state = TILE_STATE_SELECTED;
        }
      } catch (err) {
        _iterator5.e(err);
      } finally {
        _iterator5.f();
      }

      if (refinementStrategy === STRATEGY_NEVER) {
        return;
      }

      var _iterator6 = _createForOfIteratorHelper$f(selectedTiles),
          _step6;

      try {
        for (_iterator6.s(); !(_step6 = _iterator6.n()).done;) {
          var _tile4 = _step6.value;
          getPlaceholderInAncestors(_tile4, refinementStrategy);
        }
      } catch (err) {
        _iterator6.e(err);
      } finally {
        _iterator6.f();
      }

      var _iterator7 = _createForOfIteratorHelper$f(selectedTiles),
          _step7;

      try {
        for (_iterator7.s(); !(_step7 = _iterator7.n()).done;) {
          var _tile5 = _step7.value;

          if (needsPlaceholder(_tile5)) {
            getPlaceholderInChildren(_tile5);
          }
        }
      } catch (err) {
        _iterator7.e(err);
      } finally {
        _iterator7.f();
      }
    }
  }, {
    key: "_resizeCache",
    value: function _resizeCache() {
      var _cache = this._cache,
          opts = this.opts;
      var maxCacheSize = opts.maxCacheSize || (opts.maxCacheByteSize ? Infinity : DEFAULT_CACHE_SCALE * this.selectedTiles.length);
      var maxCacheByteSize = opts.maxCacheByteSize || Infinity;
      var overflown = _cache.size > maxCacheSize || this._cacheByteSize > maxCacheByteSize;

      if (overflown) {
        var _iterator8 = _createForOfIteratorHelper$f(_cache),
            _step8;

        try {
          for (_iterator8.s(); !(_step8 = _iterator8.n()).done;) {
            var _step8$value = _slicedToArray(_step8.value, 2),
                tileId = _step8$value[0],
                tile = _step8$value[1];

            if (!tile.isVisible) {
              this._cacheByteSize -= opts.maxCacheByteSize ? tile.byteLength : 0;

              _cache["delete"](tileId);

              this.onTileUnload(tile);
            }

            if (_cache.size <= maxCacheSize && this._cacheByteSize <= maxCacheByteSize) {
              break;
            }
          }
        } catch (err) {
          _iterator8.e(err);
        } finally {
          _iterator8.f();
        }

        this._rebuildTree();

        this._dirty = true;
      }

      if (this._dirty) {
        this._tiles = Array.from(this._cache.values()).sort(function (t1, t2) {
          return t1.z - t2.z;
        });
        this._dirty = false;
      }
    }
  }, {
    key: "_getTile",
    value: function _getTile(_ref4, create) {
      var x = _ref4.x,
          y = _ref4.y,
          z = _ref4.z;
      var tileId = "".concat(x, ",").concat(y, ",").concat(z);

      var tile = this._cache.get(tileId);

      if (!tile && create) {
        tile = new Tile2DHeader({
          x: x,
          y: y,
          z: z,
          onTileLoad: this.onTileLoad,
          onTileError: this.onTileError
        });
        Object.assign(tile, this.getTileMetadata(tile));
        tile.loadData(this._getTileData, this._requestScheduler);

        this._cache.set(tileId, tile);

        this._dirty = true;
      } else if (tile && tile.isCancelled && !tile.isLoading) {
        tile.loadData(this._getTileData, this._requestScheduler);
      }

      return tile;
    }
  }, {
    key: "_getNearestAncestor",
    value: function _getNearestAncestor(x, y, z) {
      var _this$_minZoom = this._minZoom,
          _minZoom = _this$_minZoom === void 0 ? 0 : _this$_minZoom;

      var index = {
        x: x,
        y: y,
        z: z
      };

      while (index.z > _minZoom) {
        index = this.getParentIndex(index);

        var parent = this._getTile(index);

        if (parent) {
          return parent;
        }
      }

      return null;
    }
  }, {
    key: "tiles",
    get: function get() {
      return this._tiles;
    }
  }, {
    key: "selectedTiles",
    get: function get() {
      return this._selectedTiles;
    }
  }, {
    key: "isLoaded",
    get: function get() {
      return this._selectedTiles.every(function (tile) {
        return tile.isLoaded;
      });
    }
  }]);

  return Tileset2D;
}();

function needsPlaceholder(tile) {
  var t = tile;

  while (t) {
    if (t.state & TILE_STATE_VISIBLE === 0) {
      return true;
    }

    if (t.isLoaded) {
      return false;
    }

    t = t.parent;
  }

  return true;
}

function getPlaceholderInAncestors(tile, refinementStrategy) {
  var parent;
  var state = TILE_STATE_PLACEHOLDER;

  while (parent = tile.parent) {
    if (tile.isLoaded) {
      state = TILE_STATE_HIDDEN;

      if (refinementStrategy === STRATEGY_DEFAULT) {
        return;
      }
    }

    parent.state = Math.max(parent.state, state);
    tile = parent;
  }
}

function getPlaceholderInChildren(tile) {
  var _iterator9 = _createForOfIteratorHelper$f(tile.children),
      _step9;

  try {
    for (_iterator9.s(); !(_step9 = _iterator9.n()).done;) {
      var child = _step9.value;
      child.state = Math.max(child.state, TILE_STATE_PLACEHOLDER);

      if (!child.isLoaded) {
        getPlaceholderInChildren(child);
      }
    }
  } catch (err) {
    _iterator9.e(err);
  } finally {
    _iterator9.f();
  }
}

function _createSuper$o(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct$o(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _isNativeReflectConstruct$o() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function ownKeys$e(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread$e(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys$e(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys$e(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }
var defaultProps$7 = {
  data: [],
  dataComparator: urlType.equals,
  renderSubLayers: {
    type: 'function',
    value: function value(props) {
      return new GeoJsonLayer(props);
    },
    compare: false
  },
  getTileData: {
    type: 'function',
    optional: true,
    value: null,
    compare: false
  },
  onViewportLoad: {
    type: 'function',
    optional: true,
    value: null,
    compare: false
  },
  onTileLoad: {
    type: 'function',
    value: function value(tile) {},
    compare: false
  },
  onTileUnload: {
    type: 'function',
    value: function value(tile) {},
    compare: false
  },
  onTileError: {
    type: 'function',
    value: function value(err) {
      return console.error(err);
    },
    compare: false
  },
  extent: {
    type: 'array',
    optional: true,
    value: null,
    compare: true
  },
  tileSize: 512,
  maxZoom: null,
  minZoom: 0,
  maxCacheSize: null,
  maxCacheByteSize: null,
  refinementStrategy: STRATEGY_DEFAULT,
  zRange: null,
  fetch: {
    type: 'function',
    value: function value(url, _ref) {
      var layer = _ref.layer,
          signal = _ref.signal;

      var loadOptions = _objectSpread$e({
        signal: signal
      }, layer.getLoadOptions() || {});

      return load(url, loadOptions);
    },
    compare: false
  },
  maxRequests: 6
};

var TileLayer = function (_CompositeLayer) {
  _inherits(TileLayer, _CompositeLayer);

  var _super = _createSuper$o(TileLayer);

  function TileLayer() {
    _classCallCheck(this, TileLayer);

    return _super.apply(this, arguments);
  }

  _createClass(TileLayer, [{
    key: "initializeState",
    value: function initializeState() {
      this.state = {
        tiles: [],
        isLoaded: false
      };
    }
  }, {
    key: "shouldUpdateState",
    value: function shouldUpdateState(_ref2) {
      var changeFlags = _ref2.changeFlags;
      return changeFlags.somethingChanged;
    }
  }, {
    key: "updateState",
    value: function updateState(_ref3) {
      var props = _ref3.props,
          oldProps = _ref3.oldProps,
          context = _ref3.context,
          changeFlags = _ref3.changeFlags;
      var tileset = this.state.tileset;
      var createTileCache = !tileset || changeFlags.dataChanged || changeFlags.updateTriggersChanged && (changeFlags.updateTriggersChanged.all || changeFlags.updateTriggersChanged.getTileData);

      if (createTileCache) {
        var maxZoom = Number.isFinite(this.state.maxZoom) ? this.state.maxZoom : props.maxZoom;
        var minZoom = Number.isFinite(this.state.minZoom) ? this.state.minZoom : props.minZoom;
        var tileSize = props.tileSize,
            maxCacheSize = props.maxCacheSize,
            maxCacheByteSize = props.maxCacheByteSize,
            refinementStrategy = props.refinementStrategy,
            extent = props.extent,
            maxRequests = props.maxRequests;
        tileset = new Tileset2D({
          getTileData: this.getTileData.bind(this),
          maxCacheSize: maxCacheSize,
          maxCacheByteSize: maxCacheByteSize,
          maxZoom: maxZoom,
          minZoom: minZoom,
          tileSize: tileSize,
          refinementStrategy: refinementStrategy,
          extent: extent,
          onTileLoad: this._onTileLoad.bind(this),
          onTileError: this._onTileError.bind(this),
          onTileUnload: this._onTileUnload.bind(this),
          maxRequests: maxRequests
        });
        this.setState({
          tileset: tileset
        });
      } else if (changeFlags.propsChanged || changeFlags.updateTriggersChanged) {
        tileset.setOptions(props);
        this.state.tileset.tiles.forEach(function (tile) {
          tile.layers = null;
        });
      }

      this._updateTileset();
    }
  }, {
    key: "_updateTileset",
    value: function _updateTileset() {
      var tileset = this.state.tileset;
      var _this$props = this.props,
          zRange = _this$props.zRange,
          modelMatrix = _this$props.modelMatrix;
      var frameNumber = tileset.update(this.context.viewport, {
        zRange: zRange,
        modelMatrix: modelMatrix
      });
      var isLoaded = tileset.isLoaded;
      var loadingStateChanged = this.state.isLoaded !== isLoaded;
      var tilesetChanged = this.state.frameNumber !== frameNumber;

      if (isLoaded && (loadingStateChanged || tilesetChanged)) {
        this._onViewportLoad();
      }

      if (tilesetChanged) {
        this.setState({
          frameNumber: frameNumber
        });
      }

      this.state.isLoaded = isLoaded;
    }
  }, {
    key: "_onViewportLoad",
    value: function _onViewportLoad() {
      var tileset = this.state.tileset;
      var onViewportLoad = this.props.onViewportLoad;

      if (onViewportLoad) {
        onViewportLoad(tileset.selectedTiles.map(function (tile) {
          return tile.data;
        }));
      }
    }
  }, {
    key: "_onTileLoad",
    value: function _onTileLoad(tile) {
      var layer = this.getCurrentLayer();
      layer.props.onTileLoad(tile);

      if (tile.isVisible) {
        this.setNeedsUpdate();
      }
    }
  }, {
    key: "_onTileError",
    value: function _onTileError(error, tile) {
      var layer = this.getCurrentLayer();
      layer.props.onTileError(error);

      layer._updateTileset();

      if (tile.isVisible) {
        this.setNeedsUpdate();
      }
    }
  }, {
    key: "_onTileUnload",
    value: function _onTileUnload(tile) {
      var layer = this.getCurrentLayer();
      layer.props.onTileUnload(tile);
    }
  }, {
    key: "getTileData",
    value: function getTileData(tile) {
      var data = this.props.data;
      var _this$getCurrentLayer = this.getCurrentLayer().props,
          getTileData = _this$getCurrentLayer.getTileData,
          fetch = _this$getCurrentLayer.fetch;
      var signal = tile.signal;
      tile.url = getURLFromTemplate(data, tile);

      if (getTileData) {
        return getTileData(tile);
      }

      if (tile.url) {
        return fetch(tile.url, {
          layer: this,
          signal: signal
        });
      }

      return null;
    }
  }, {
    key: "renderSubLayers",
    value: function renderSubLayers(props) {
      return this.props.renderSubLayers(props);
    }
  }, {
    key: "getHighlightedObjectIndex",
    value: function getHighlightedObjectIndex() {
      return -1;
    }
  }, {
    key: "getPickingInfo",
    value: function getPickingInfo(_ref4) {
      var info = _ref4.info,
          sourceLayer = _ref4.sourceLayer;
      info.sourceLayer = sourceLayer;
      info.tile = sourceLayer.props.tile;
      return info;
    }
  }, {
    key: "renderLayers",
    value: function renderLayers() {
      var _this = this;

      var visible = this.props.visible;
      return this.state.tileset.tiles.map(function (tile) {
        var isVisible = visible && tile.isVisible;

        var highlightedObjectIndex = _this.getHighlightedObjectIndex(tile);

        if (!tile.isLoaded) ; else if (!tile.layers) {
          var layers = _this.renderSubLayers(Object.assign({}, _this.props, {
            id: "".concat(_this.id, "-").concat(tile.x, "-").concat(tile.y, "-").concat(tile.z),
            data: tile.data,
            visible: isVisible,
            _offset: 0,
            tile: tile,
            highlightedObjectIndex: highlightedObjectIndex
          }));

          tile.layers = flatten(layers, Boolean);
        } else if (tile.layers[0] && (tile.layers[0].props.visible !== isVisible || tile.layers[0].props.highlightedObjectIndex !== highlightedObjectIndex)) {
          tile.layers = tile.layers.map(function (layer) {
            return layer.clone({
              visible: isVisible,
              highlightedObjectIndex: highlightedObjectIndex
            });
          });
        }

        return tile.layers;
      });
    }
  }, {
    key: "isLoaded",
    get: function get() {
      var tileset = this.state.tileset;
      return tileset.selectedTiles.every(function (tile) {
        return tile.layers && tile.layers.every(function (layer) {
          return layer.isLoaded;
        });
      });
    }
  }]);

  return TileLayer;
}(CompositeLayer);
TileLayer.layerName = 'TileLayer';
TileLayer.defaultProps = defaultProps$7;

var util = createCommonjsModule(function (module, exports) {

const nameStartChar = ':A-Za-z_\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD';
const nameChar = nameStartChar + '\\-.\\d\\u00B7\\u0300-\\u036F\\u203F-\\u2040';
const nameRegexp = '[' + nameStartChar + '][' + nameChar + ']*';
const regexName = new RegExp('^' + nameRegexp + '$');

const getAllMatches = function(string, regex) {
  const matches = [];
  let match = regex.exec(string);
  while (match) {
    const allmatches = [];
    const len = match.length;
    for (let index = 0; index < len; index++) {
      allmatches.push(match[index]);
    }
    matches.push(allmatches);
    match = regex.exec(string);
  }
  return matches;
};

const isName = function(string) {
  const match = regexName.exec(string);
  return !(match === null || typeof match === 'undefined');
};

exports.isExist = function(v) {
  return typeof v !== 'undefined';
};

exports.isEmptyObject = function(obj) {
  return Object.keys(obj).length === 0;
};

/**
 * Copy all the properties of a into b.
 * @param {*} target
 * @param {*} a
 */
exports.merge = function(target, a, arrayMode) {
  if (a) {
    const keys = Object.keys(a); // will return an array of own properties
    const len = keys.length; //don't make it inline
    for (let i = 0; i < len; i++) {
      if(arrayMode === 'strict'){
        target[keys[i]] = [ a[keys[i]] ];
      }else {
        target[keys[i]] = a[keys[i]];
      }
    }
  }
};
/* exports.merge =function (b,a){
  return Object.assign(b,a);
} */

exports.getValue = function(v) {
  if (exports.isExist(v)) {
    return v;
  } else {
    return '';
  }
};

// const fakeCall = function(a) {return a;};
// const fakeCallNoReturn = function() {};

exports.buildOptions = function(options, defaultOptions, props) {
  var newOptions = {};
  if (!options) {
    return defaultOptions; //if there are not options
  }

  for (let i = 0; i < props.length; i++) {
    if (options[props[i]] !== undefined) {
      newOptions[props[i]] = options[props[i]];
    } else {
      newOptions[props[i]] = defaultOptions[props[i]];
    }
  }
  return newOptions;
};

exports.isName = isName;
exports.getAllMatches = getAllMatches;
exports.nameRegexp = nameRegexp;
});

const convertToJson = function(node, options) {
  const jObj = {};

  //when no child node or attr is present
  if ((!node.child || util.isEmptyObject(node.child)) && (!node.attrsMap || util.isEmptyObject(node.attrsMap))) {
    return util.isExist(node.val) ? node.val : '';
  } else {
    //otherwise create a textnode if node has some text
    if (util.isExist(node.val)) {
      if (!(typeof node.val === 'string' && (node.val === '' || node.val === options.cdataPositionChar))) {
        if(options.arrayMode === "strict"){
          jObj[options.textNodeName] = [ node.val ];
        }else {
          jObj[options.textNodeName] = node.val;
        }
      }
    }
  }

  util.merge(jObj, node.attrsMap, options.arrayMode);

  const keys = Object.keys(node.child);
  for (let index = 0; index < keys.length; index++) {
    var tagname = keys[index];
    if (node.child[tagname] && node.child[tagname].length > 1) {
      jObj[tagname] = [];
      for (var tag in node.child[tagname]) {
        if (node.child[tagname].hasOwnProperty(tag)){
          jObj[tagname].push(convertToJson(node.child[tagname][tag], options));}
        }
    } else {
      if(options.arrayMode === true){
        const result = convertToJson(node.child[tagname][0], options);
        if(typeof result === 'object')
          jObj[tagname] = [ result ];
        else
          jObj[tagname] = result;
      }else if(options.arrayMode === "strict"){
        jObj[tagname] = [convertToJson(node.child[tagname][0], options) ];
      }else {
        jObj[tagname] = convertToJson(node.child[tagname][0], options);
      }
    }
  }

  //add value
  return jObj;
};

var convertToJson_1 = convertToJson;

var node2json = {
	convertToJson: convertToJson_1
};

var xmlNode = function(tagname, parent, val) {
  this.tagname = tagname;
  this.parent = parent;
  this.child = {}; //child tags
  this.attrsMap = {}; //attributes map
  this.val = val; //text only
  this.addChild = function(child) {
    if (Array.isArray(this.child[child.tagname])) {
      //already presents
      this.child[child.tagname].push(child);
    } else {
      this.child[child.tagname] = [child];
    }
  };
};

const buildOptions = util.buildOptions;

const regx =
  '<((!\\[CDATA\\[([\\s\\S]*?)(]]>))|((NAME:)?(NAME))([^>]*)>|((\\/)(NAME)\\s*>))([^<]*)'
  .replace(/NAME/g, util.nameRegexp);

//const tagsRegx = new RegExp("<(\\/?[\\w:\\-\._]+)([^>]*)>(\\s*"+cdataRegx+")*([^<]+)?","g");
//const tagsRegx = new RegExp("<(\\/?)((\\w*:)?([\\w:\\-\._]+))([^>]*)>([^<]*)("+cdataRegx+"([^<]*))*([^<]+)?","g");

//polyfill
if (!Number.parseInt && window.parseInt) {
  Number.parseInt = window.parseInt;
}
if (!Number.parseFloat && window.parseFloat) {
  Number.parseFloat = window.parseFloat;
}

const defaultOptions = {
  attributeNamePrefix: '@_',
  attrNodeName: false,
  textNodeName: '#text',
  ignoreAttributes: true,
  ignoreNameSpace: false,
  allowBooleanAttributes: false, //a tag can have attributes without any value
  //ignoreRootElement : false,
  parseNodeValue: true,
  parseAttributeValue: false,
  arrayMode: false,
  trimValues: true, //Trim string values of tag and attributes
  cdataTagName: false,
  cdataPositionChar: '\\c',
  tagValueProcessor: function(a, tagName) {
    return a;
  },
  attrValueProcessor: function(a, attrName) {
    return a;
  },
  stopNodes: []
  //decodeStrict: false,
};

var defaultOptions_1 = defaultOptions;

const props = [
  'attributeNamePrefix',
  'attrNodeName',
  'textNodeName',
  'ignoreAttributes',
  'ignoreNameSpace',
  'allowBooleanAttributes',
  'parseNodeValue',
  'parseAttributeValue',
  'arrayMode',
  'trimValues',
  'cdataTagName',
  'cdataPositionChar',
  'tagValueProcessor',
  'attrValueProcessor',
  'parseTrueNumberOnly',
  'stopNodes'
];
var props_1 = props;

/**
 * Trim -> valueProcessor -> parse value
 * @param {string} tagName
 * @param {string} val
 * @param {object} options
 */
function processTagValue(tagName, val, options) {
  if (val) {
    if (options.trimValues) {
      val = val.trim();
    }
    val = options.tagValueProcessor(val, tagName);
    val = parseValue(val, options.parseNodeValue, options.parseTrueNumberOnly);
  }

  return val;
}

function resolveNameSpace(tagname, options) {
  if (options.ignoreNameSpace) {
    const tags = tagname.split(':');
    const prefix = tagname.charAt(0) === '/' ? '/' : '';
    if (tags[0] === 'xmlns') {
      return '';
    }
    if (tags.length === 2) {
      tagname = prefix + tags[1];
    }
  }
  return tagname;
}

function parseValue(val, shouldParse, parseTrueNumberOnly) {
  if (shouldParse && typeof val === 'string') {
    let parsed;
    if (val.trim() === '' || isNaN(val)) {
      parsed = val === 'true' ? true : val === 'false' ? false : val;
    } else {
      if (val.indexOf('0x') !== -1) {
        //support hexa decimal
        parsed = Number.parseInt(val, 16);
      } else if (val.indexOf('.') !== -1) {
        parsed = Number.parseFloat(val);
        val = val.replace(/\.?0+$/, "");
      } else {
        parsed = Number.parseInt(val, 10);
      }
      if (parseTrueNumberOnly) {
        parsed = String(parsed) === val ? parsed : val;
      }
    }
    return parsed;
  } else {
    if (util.isExist(val)) {
      return val;
    } else {
      return '';
    }
  }
}

//TODO: change regex to capture NS
//const attrsRegx = new RegExp("([\\w\\-\\.\\:]+)\\s*=\\s*(['\"])((.|\n)*?)\\2","gm");
const attrsRegx = new RegExp('([^\\s=]+)\\s*(=\\s*([\'"])(.*?)\\3)?', 'g');

function buildAttributesMap(attrStr, options) {
  if (!options.ignoreAttributes && typeof attrStr === 'string') {
    attrStr = attrStr.replace(/\r?\n/g, ' ');
    //attrStr = attrStr || attrStr.trim();

    const matches = util.getAllMatches(attrStr, attrsRegx);
    const len = matches.length; //don't make it inline
    const attrs = {};
    for (let i = 0; i < len; i++) {
      const attrName = resolveNameSpace(matches[i][1], options);
      if (attrName.length) {
        if (matches[i][4] !== undefined) {
          if (options.trimValues) {
            matches[i][4] = matches[i][4].trim();
          }
          matches[i][4] = options.attrValueProcessor(matches[i][4], attrName);
          attrs[options.attributeNamePrefix + attrName] = parseValue(
            matches[i][4],
            options.parseAttributeValue,
            options.parseTrueNumberOnly
          );
        } else if (options.allowBooleanAttributes) {
          attrs[options.attributeNamePrefix + attrName] = true;
        }
      }
    }
    if (!Object.keys(attrs).length) {
      return;
    }
    if (options.attrNodeName) {
      const attrCollection = {};
      attrCollection[options.attrNodeName] = attrs;
      return attrCollection;
    }
    return attrs;
  }
}

const getTraversalObj = function(xmlData, options) {
  xmlData = xmlData.replace(/\r\n?/g, "\n");
  options = buildOptions(options, defaultOptions, props);
  const xmlObj = new xmlNode('!xml');
  let currentNode = xmlObj;
  let textData = "";

//function match(xmlData){
  for(let i=0; i< xmlData.length; i++){
    const ch = xmlData[i];
    if(ch === '<'){
      if( xmlData[i+1] === '/') {//Closing Tag
        const closeIndex = findClosingIndex(xmlData, ">", i, "Closing Tag is not closed.");
        let tagName = xmlData.substring(i+2,closeIndex).trim();

        if(options.ignoreNameSpace){
          const colonIndex = tagName.indexOf(":");
          if(colonIndex !== -1){
            tagName = tagName.substr(colonIndex+1);
          }
        }

        /* if (currentNode.parent) {
          currentNode.parent.val = util.getValue(currentNode.parent.val) + '' + processTagValue2(tagName, textData , options);
        } */
        if(currentNode){
          if(currentNode.val){
            currentNode.val = util.getValue(currentNode.val) + '' + processTagValue(tagName, textData , options);
          }else {
            currentNode.val = processTagValue(tagName, textData , options);
          }
        }

        if (options.stopNodes.length && options.stopNodes.includes(currentNode.tagname)) {
          currentNode.child = [];
          if (currentNode.attrsMap == undefined) { currentNode.attrsMap = {};}
          currentNode.val = xmlData.substr(currentNode.startIndex + 1, i - currentNode.startIndex - 1);
        }
        currentNode = currentNode.parent;
        textData = "";
        i = closeIndex;
      } else if( xmlData[i+1] === '?') {
        i = findClosingIndex(xmlData, "?>", i, "Pi Tag is not closed.");
      } else if(xmlData.substr(i + 1, 3) === '!--') {
        i = findClosingIndex(xmlData, "-->", i, "Comment is not closed.");
      } else if( xmlData.substr(i + 1, 2) === '!D') {
        const closeIndex = findClosingIndex(xmlData, ">", i, "DOCTYPE is not closed.");
        const tagExp = xmlData.substring(i, closeIndex);
        if(tagExp.indexOf("[") >= 0){
          i = xmlData.indexOf("]>", i) + 1;
        }else {
          i = closeIndex;
        }
      }else if(xmlData.substr(i + 1, 2) === '![') {
        const closeIndex = findClosingIndex(xmlData, "]]>", i, "CDATA is not closed.") - 2;
        const tagExp = xmlData.substring(i + 9,closeIndex);

        //considerations
        //1. CDATA will always have parent node
        //2. A tag with CDATA is not a leaf node so it's value would be string type.
        if(textData){
          currentNode.val = util.getValue(currentNode.val) + '' + processTagValue(currentNode.tagname, textData , options);
          textData = "";
        }

        if (options.cdataTagName) {
          //add cdata node
          const childNode = new xmlNode(options.cdataTagName, currentNode, tagExp);
          currentNode.addChild(childNode);
          //for backtracking
          currentNode.val = util.getValue(currentNode.val) + options.cdataPositionChar;
          //add rest value to parent node
          if (tagExp) {
            childNode.val = tagExp;
          }
        } else {
          currentNode.val = (currentNode.val || '') + (tagExp || '');
        }

        i = closeIndex + 2;
      }else {//Opening tag
        const result = closingIndexForOpeningTag(xmlData, i+1);
        let tagExp = result.data;
        const closeIndex = result.index;
        const separatorIndex = tagExp.indexOf(" ");
        let tagName = tagExp;
        if(separatorIndex !== -1){
          tagName = tagExp.substr(0, separatorIndex).replace(/\s\s*$/, '');
          tagExp = tagExp.substr(separatorIndex + 1);
        }

        if(options.ignoreNameSpace){
          const colonIndex = tagName.indexOf(":");
          if(colonIndex !== -1){
            tagName = tagName.substr(colonIndex+1);
          }
        }

        //save text to parent node
        if (currentNode && textData) {
          if(currentNode.tagname !== '!xml'){
            currentNode.val = util.getValue(currentNode.val) + '' + processTagValue( currentNode.tagname, textData, options);
          }
        }

        if(tagExp.length > 0 && tagExp.lastIndexOf("/") === tagExp.length - 1){//selfClosing tag

          if(tagName[tagName.length - 1] === "/"){ //remove trailing '/'
            tagName = tagName.substr(0, tagName.length - 1);
            tagExp = tagName;
          }else {
            tagExp = tagExp.substr(0, tagExp.length - 1);
          }

          const childNode = new xmlNode(tagName, currentNode, '');
          if(tagName !== tagExp){
            childNode.attrsMap = buildAttributesMap(tagExp, options);
          }
          currentNode.addChild(childNode);
        }else {//opening tag

          const childNode = new xmlNode( tagName, currentNode );
          if (options.stopNodes.length && options.stopNodes.includes(childNode.tagname)) {
            childNode.startIndex=closeIndex;
          }
          if(tagName !== tagExp){
            childNode.attrsMap = buildAttributesMap(tagExp, options);
          }
          currentNode.addChild(childNode);
          currentNode = childNode;
        }
        textData = "";
        i = closeIndex;
      }
    }else {
      textData += xmlData[i];
    }
  }
  return xmlObj;
};

function closingIndexForOpeningTag(data, i){
  let attrBoundary;
  let tagExp = "";
  for (let index = i; index < data.length; index++) {
    let ch = data[index];
    if (attrBoundary) {
        if (ch === attrBoundary) attrBoundary = "";//reset
    } else if (ch === '"' || ch === "'") {
        attrBoundary = ch;
    } else if (ch === '>') {
        return {
          data: tagExp,
          index: index
        }
    } else if (ch === '\t') {
      ch = " ";
    }
    tagExp += ch;
  }
}

function findClosingIndex(xmlData, str, i, errMsg){
  const closingIndex = xmlData.indexOf(str, i);
  if(closingIndex === -1){
    throw new Error(errMsg)
  }else {
    return closingIndex + str.length - 1;
  }
}

var getTraversalObj_1 = getTraversalObj;

var xmlstr2xmlnode = {
	defaultOptions: defaultOptions_1,
	props: props_1,
	getTraversalObj: getTraversalObj_1
};

const defaultOptions$1 = {
  allowBooleanAttributes: false, //A tag can have attributes without any value
};

const props$1 = ['allowBooleanAttributes'];

//const tagsPattern = new RegExp("<\\/?([\\w:\\-_\.]+)\\s*\/?>","g");
var validate$1 = function (xmlData, options) {
  options = util.buildOptions(options, defaultOptions$1, props$1);

  //xmlData = xmlData.replace(/(\r\n|\n|\r)/gm,"");//make it single line
  //xmlData = xmlData.replace(/(^\s*<\?xml.*?\?>)/g,"");//Remove XML starting tag
  //xmlData = xmlData.replace(/(<!DOCTYPE[\s\w\"\.\/\-\:]+(\[.*\])*\s*>)/g,"");//Remove DOCTYPE
  const tags = [];
  let tagFound = false;

  //indicates that the root tag has been closed (aka. depth 0 has been reached)
  let reachedRoot = false;

  if (xmlData[0] === '\ufeff') {
    // check for byte order mark (BOM)
    xmlData = xmlData.substr(1);
  }

  for (let i = 0; i < xmlData.length; i++) {
    if (xmlData[i] === '<') {
      //starting of tag
      //read until you reach to '>' avoiding any '>' in attribute value

      i++;
      if (xmlData[i] === '?') {
        i = readPI(xmlData, ++i);
        if (i.err) {
          return i;
        }
      } else if (xmlData[i] === '!') {
        i = readCommentAndCDATA(xmlData, i);
        continue;
      } else {
        let closingTag = false;
        if (xmlData[i] === '/') {
          //closing tag
          closingTag = true;
          i++;
        }
        //read tagname
        let tagName = '';
        for (; i < xmlData.length &&
          xmlData[i] !== '>' &&
          xmlData[i] !== ' ' &&
          xmlData[i] !== '\t' &&
          xmlData[i] !== '\n' &&
          xmlData[i] !== '\r'; i++
        ) {
          tagName += xmlData[i];
        }
        tagName = tagName.trim();
        //console.log(tagName);

        if (tagName[tagName.length - 1] === '/') {
          //self closing tag without attributes
          tagName = tagName.substring(0, tagName.length - 1);
          //continue;
          i--;
        }
        if (!validateTagName(tagName)) {
          let msg;
          if (tagName.trim().length === 0) {
            msg = "There is an unnecessary space between tag name and backward slash '</ ..'.";
          } else {
            msg = "Tag '"+tagName+"' is an invalid name.";
          }
          return getErrorObject('InvalidTag', msg, getLineNumberForPosition(xmlData, i));
        }

        const result = readAttributeStr(xmlData, i);
        if (result === false) {
          return getErrorObject('InvalidAttr', "Attributes for '"+tagName+"' have open quote.", getLineNumberForPosition(xmlData, i));
        }
        let attrStr = result.value;
        i = result.index;

        if (attrStr[attrStr.length - 1] === '/') {
          //self closing tag
          attrStr = attrStr.substring(0, attrStr.length - 1);
          const isValid = validateAttributeString(attrStr, options);
          if (isValid === true) {
            tagFound = true;
            //continue; //text may presents after self closing tag
          } else {
            //the result from the nested function returns the position of the error within the attribute
            //in order to get the 'true' error line, we need to calculate the position where the attribute begins (i - attrStr.length) and then add the position within the attribute
            //this gives us the absolute index in the entire xml, which we can use to find the line at last
            return getErrorObject(isValid.err.code, isValid.err.msg, getLineNumberForPosition(xmlData, i - attrStr.length + isValid.err.line));
          }
        } else if (closingTag) {
          if (!result.tagClosed) {
            return getErrorObject('InvalidTag', "Closing tag '"+tagName+"' doesn't have proper closing.", getLineNumberForPosition(xmlData, i));
          } else if (attrStr.trim().length > 0) {
            return getErrorObject('InvalidTag', "Closing tag '"+tagName+"' can't have attributes or invalid starting.", getLineNumberForPosition(xmlData, i));
          } else {
            const otg = tags.pop();
            if (tagName !== otg) {
              return getErrorObject('InvalidTag', "Closing tag '"+otg+"' is expected inplace of '"+tagName+"'.", getLineNumberForPosition(xmlData, i));
            }

            //when there are no more tags, we reached the root level.
            if (tags.length == 0) {
              reachedRoot = true;
            }
          }
        } else {
          const isValid = validateAttributeString(attrStr, options);
          if (isValid !== true) {
            //the result from the nested function returns the position of the error within the attribute
            //in order to get the 'true' error line, we need to calculate the position where the attribute begins (i - attrStr.length) and then add the position within the attribute
            //this gives us the absolute index in the entire xml, which we can use to find the line at last
            return getErrorObject(isValid.err.code, isValid.err.msg, getLineNumberForPosition(xmlData, i - attrStr.length + isValid.err.line));
          }

          //if the root level has been reached before ...
          if (reachedRoot === true) {
            return getErrorObject('InvalidXml', 'Multiple possible root nodes found.', getLineNumberForPosition(xmlData, i));
          } else {
            tags.push(tagName);
          }
          tagFound = true;
        }

        //skip tag text value
        //It may include comments and CDATA value
        for (i++; i < xmlData.length; i++) {
          if (xmlData[i] === '<') {
            if (xmlData[i + 1] === '!') {
              //comment or CADATA
              i++;
              i = readCommentAndCDATA(xmlData, i);
              continue;
            } else {
              break;
            }
          } else if (xmlData[i] === '&') {
            const afterAmp = validateAmpersand(xmlData, i);
            if (afterAmp == -1)
              return getErrorObject('InvalidChar', "char '&' is not expected.", getLineNumberForPosition(xmlData, i));
            i = afterAmp;
          }
        } //end of reading tag text value
        if (xmlData[i] === '<') {
          i--;
        }
      }
    } else {
      if (xmlData[i] === ' ' || xmlData[i] === '\t' || xmlData[i] === '\n' || xmlData[i] === '\r') {
        continue;
      }
      return getErrorObject('InvalidChar', "char '"+xmlData[i]+"' is not expected.", getLineNumberForPosition(xmlData, i));
    }
  }

  if (!tagFound) {
    return getErrorObject('InvalidXml', 'Start tag expected.', 1);
  } else if (tags.length > 0) {
    return getErrorObject('InvalidXml', "Invalid '"+JSON.stringify(tags, null, 4).replace(/\r?\n/g, '')+"' found.", 1);
  }

  return true;
};

/**
 * Read Processing insstructions and skip
 * @param {*} xmlData
 * @param {*} i
 */
function readPI(xmlData, i) {
  var start = i;
  for (; i < xmlData.length; i++) {
    if (xmlData[i] == '?' || xmlData[i] == ' ') {
      //tagname
      var tagname = xmlData.substr(start, i - start);
      if (i > 5 && tagname === 'xml') {
        return getErrorObject('InvalidXml', 'XML declaration allowed only at the start of the document.', getLineNumberForPosition(xmlData, i));
      } else if (xmlData[i] == '?' && xmlData[i + 1] == '>') {
        //check if valid attribut string
        i++;
        break;
      } else {
        continue;
      }
    }
  }
  return i;
}

function readCommentAndCDATA(xmlData, i) {
  if (xmlData.length > i + 5 && xmlData[i + 1] === '-' && xmlData[i + 2] === '-') {
    //comment
    for (i += 3; i < xmlData.length; i++) {
      if (xmlData[i] === '-' && xmlData[i + 1] === '-' && xmlData[i + 2] === '>') {
        i += 2;
        break;
      }
    }
  } else if (
    xmlData.length > i + 8 &&
    xmlData[i + 1] === 'D' &&
    xmlData[i + 2] === 'O' &&
    xmlData[i + 3] === 'C' &&
    xmlData[i + 4] === 'T' &&
    xmlData[i + 5] === 'Y' &&
    xmlData[i + 6] === 'P' &&
    xmlData[i + 7] === 'E'
  ) {
    let angleBracketsCount = 1;
    for (i += 8; i < xmlData.length; i++) {
      if (xmlData[i] === '<') {
        angleBracketsCount++;
      } else if (xmlData[i] === '>') {
        angleBracketsCount--;
        if (angleBracketsCount === 0) {
          break;
        }
      }
    }
  } else if (
    xmlData.length > i + 9 &&
    xmlData[i + 1] === '[' &&
    xmlData[i + 2] === 'C' &&
    xmlData[i + 3] === 'D' &&
    xmlData[i + 4] === 'A' &&
    xmlData[i + 5] === 'T' &&
    xmlData[i + 6] === 'A' &&
    xmlData[i + 7] === '['
  ) {
    for (i += 8; i < xmlData.length; i++) {
      if (xmlData[i] === ']' && xmlData[i + 1] === ']' && xmlData[i + 2] === '>') {
        i += 2;
        break;
      }
    }
  }

  return i;
}

var doubleQuote = '"';
var singleQuote = "'";

/**
 * Keep reading xmlData until '<' is found outside the attribute value.
 * @param {string} xmlData
 * @param {number} i
 */
function readAttributeStr(xmlData, i) {
  let attrStr = '';
  let startChar = '';
  let tagClosed = false;
  for (; i < xmlData.length; i++) {
    if (xmlData[i] === doubleQuote || xmlData[i] === singleQuote) {
      if (startChar === '') {
        startChar = xmlData[i];
      } else if (startChar !== xmlData[i]) {
        //if vaue is enclosed with double quote then single quotes are allowed inside the value and vice versa
        continue;
      } else {
        startChar = '';
      }
    } else if (xmlData[i] === '>') {
      if (startChar === '') {
        tagClosed = true;
        break;
      }
    }
    attrStr += xmlData[i];
  }
  if (startChar !== '') {
    return false;
  }

  return {
    value: attrStr,
    index: i,
    tagClosed: tagClosed
  };
}

/**
 * Select all the attributes whether valid or invalid.
 */
const validAttrStrRegxp = new RegExp('(\\s*)([^\\s=]+)(\\s*=)?(\\s*([\'"])(([\\s\\S])*?)\\5)?', 'g');

//attr, ="sd", a="amit's", a="sd"b="saf", ab  cd=""

function validateAttributeString(attrStr, options) {
  //console.log("start:"+attrStr+":end");

  //if(attrStr.trim().length === 0) return true; //empty string

  const matches = util.getAllMatches(attrStr, validAttrStrRegxp);
  const attrNames = {};

  for (let i = 0; i < matches.length; i++) {
    if (matches[i][1].length === 0) {
      //nospace before attribute name: a="sd"b="saf"
      return getErrorObject('InvalidAttr', "Attribute '"+matches[i][2]+"' has no space in starting.", getPositionFromMatch(attrStr, matches[i][0]))
    } else if (matches[i][3] === undefined && !options.allowBooleanAttributes) {
      //independent attribute: ab
      return getErrorObject('InvalidAttr', "boolean attribute '"+matches[i][2]+"' is not allowed.", getPositionFromMatch(attrStr, matches[i][0]));
    }
    /* else if(matches[i][6] === undefined){//attribute without value: ab=
                    return { err: { code:"InvalidAttr",msg:"attribute " + matches[i][2] + " has no value assigned."}};
                } */
    const attrName = matches[i][2];
    if (!validateAttrName(attrName)) {
      return getErrorObject('InvalidAttr', "Attribute '"+attrName+"' is an invalid name.", getPositionFromMatch(attrStr, matches[i][0]));
    }
    if (!attrNames.hasOwnProperty(attrName)) {
      //check for duplicate attribute.
      attrNames[attrName] = 1;
    } else {
      return getErrorObject('InvalidAttr', "Attribute '"+attrName+"' is repeated.", getPositionFromMatch(attrStr, matches[i][0]));
    }
  }

  return true;
}

function validateNumberAmpersand(xmlData, i) {
  let re = /\d/;
  if (xmlData[i] === 'x') {
    i++;
    re = /[\da-fA-F]/;
  }
  for (; i < xmlData.length; i++) {
    if (xmlData[i] === ';')
      return i;
    if (!xmlData[i].match(re))
      break;
  }
  return -1;
}

function validateAmpersand(xmlData, i) {
  // https://www.w3.org/TR/xml/#dt-charref
  i++;
  if (xmlData[i] === ';')
    return -1;
  if (xmlData[i] === '#') {
    i++;
    return validateNumberAmpersand(xmlData, i);
  }
  let count = 0;
  for (; i < xmlData.length; i++, count++) {
    if (xmlData[i].match(/\w/) && count < 20)
      continue;
    if (xmlData[i] === ';')
      break;
    return -1;
  }
  return i;
}

function getErrorObject(code, message, lineNumber) {
  return {
    err: {
      code: code,
      msg: message,
      line: lineNumber,
    },
  };
}

function validateAttrName(attrName) {
  return util.isName(attrName);
}

// const startsWithXML = /^xml/i;

function validateTagName(tagname) {
  return util.isName(tagname) /* && !tagname.match(startsWithXML) */;
}

//this function returns the line number for the character at the given index
function getLineNumberForPosition(xmlData, index) {
  var lines = xmlData.substring(0, index).split(/\r?\n/);
  return lines.length;
}

//this function returns the position of the last character of match within attrStr
function getPositionFromMatch(attrStr, match) {
  return attrStr.indexOf(match) + match.length;
}

var validator = {
	validate: validate$1
};

const char = function(a) {
  return String.fromCharCode(a);
};

const chars = {
  nilChar: char(176),
  missingChar: char(201),
  nilPremitive: char(175),
  missingPremitive: char(200),

  emptyChar: char(178),
  emptyValue: char(177), //empty Premitive

  boundryChar: char(179),

  objStart: char(198),
  arrStart: char(204),
  arrayEnd: char(185),
};

const charsArr = [
  chars.nilChar,
  chars.nilPremitive,
  chars.missingChar,
  chars.missingPremitive,
  chars.boundryChar,
  chars.emptyChar,
  chars.emptyValue,
  chars.arrayEnd,
  chars.objStart,
  chars.arrStart,
];

const _e = function(node, e_schema, options) {
  if (typeof e_schema === 'string') {
    //premitive
    if (node && node[0] && node[0].val !== undefined) {
      return getValue(node[0].val);
    } else {
      return getValue(node);
    }
  } else {
    const hasValidData = hasData(node);
    if (hasValidData === true) {
      let str = '';
      if (Array.isArray(e_schema)) {
        //attributes can't be repeated. hence check in children tags only
        str += chars.arrStart;
        const itemSchema = e_schema[0];
        //var itemSchemaType = itemSchema;
        const arr_len = node.length;

        if (typeof itemSchema === 'string') {
          for (let arr_i = 0; arr_i < arr_len; arr_i++) {
            const r = getValue(node[arr_i].val);
            str = processValue(str, r);
          }
        } else {
          for (let arr_i = 0; arr_i < arr_len; arr_i++) {
            const r = _e(node[arr_i], itemSchema, options);
            str = processValue(str, r);
          }
        }
        str += chars.arrayEnd; //indicates that next item is not array item
      } else {
        //object
        str += chars.objStart;
        const keys = Object.keys(e_schema);
        if (Array.isArray(node)) {
          node = node[0];
        }
        for (let i in keys) {
          const key = keys[i];
          //a property defined in schema can be present either in attrsMap or children tags
          //options.textNodeName will not present in both maps, take it's value from val
          //options.attrNodeName will be present in attrsMap
          let r;
          if (!options.ignoreAttributes && node.attrsMap && node.attrsMap[key]) {
            r = _e(node.attrsMap[key], e_schema[key], options);
          } else if (key === options.textNodeName) {
            r = _e(node.val, e_schema[key], options);
          } else {
            r = _e(node.child[key], e_schema[key], options);
          }
          str = processValue(str, r);
        }
      }
      return str;
    } else {
      return hasValidData;
    }
  }
};

const getValue = function(a /*, type*/) {
  switch (a) {
    case undefined:
      return chars.missingPremitive;
    case null:
      return chars.nilPremitive;
    case '':
      return chars.emptyValue;
    default:
      return a;
  }
};

const processValue = function(str, r) {
  if (!isAppChar(r[0]) && !isAppChar(str[str.length - 1])) {
    str += chars.boundryChar;
  }
  return str + r;
};

const isAppChar = function(ch) {
  return charsArr.indexOf(ch) !== -1;
};

function hasData(jObj) {
  if (jObj === undefined) {
    return chars.missingChar;
  } else if (jObj === null) {
    return chars.nilChar;
  } else if (
    jObj.child &&
    Object.keys(jObj.child).length === 0 &&
    (!jObj.attrsMap || Object.keys(jObj.attrsMap).length === 0)
  ) {
    return chars.emptyChar;
  } else {
    return true;
  }
}


const buildOptions$1 = util.buildOptions;

const convert2nimn = function(node, e_schema, options) {
  options = buildOptions$1(options, xmlstr2xmlnode.defaultOptions, xmlstr2xmlnode.props);
  return _e(node, e_schema, options);
};

var convert2nimn_1 = convert2nimn;

var nimndata = {
	convert2nimn: convert2nimn_1
};

const buildOptions$2 = util.buildOptions;


//TODO: do it later
const convertToJsonString = function(node, options) {
  options = buildOptions$2(options, xmlstr2xmlnode.defaultOptions, xmlstr2xmlnode.props);

  options.indentBy = options.indentBy || '';
  return _cToJsonStr(node, options);
};

const _cToJsonStr = function(node, options, level) {
  let jObj = '{';

  //traver through all the children
  const keys = Object.keys(node.child);

  for (let index = 0; index < keys.length; index++) {
    var tagname = keys[index];
    if (node.child[tagname] && node.child[tagname].length > 1) {
      jObj += '"' + tagname + '" : [ ';
      for (var tag in node.child[tagname]) {
        jObj += _cToJsonStr(node.child[tagname][tag], options) + ' , ';
      }
      jObj = jObj.substr(0, jObj.length - 1) + ' ] '; //remove extra comma in last
    } else {
      jObj += '"' + tagname + '" : ' + _cToJsonStr(node.child[tagname][0], options) + ' ,';
    }
  }
  util.merge(jObj, node.attrsMap);
  //add attrsMap as new children
  if (util.isEmptyObject(jObj)) {
    return util.isExist(node.val) ? node.val : '';
  } else {
    if (util.isExist(node.val)) {
      if (!(typeof node.val === 'string' && (node.val === '' || node.val === options.cdataPositionChar))) {
        jObj += '"' + options.textNodeName + '" : ' + stringval(node.val);
      }
    }
  }
  //add value
  if (jObj[jObj.length - 1] === ',') {
    jObj = jObj.substr(0, jObj.length - 2);
  }
  return jObj + '}';
};

function stringval(v) {
  if (v === true || v === false || !isNaN(v)) {
    return v;
  } else {
    return '"' + v + '"';
  }
}

var convertToJsonString_1 = convertToJsonString;

var node2json_str = {
	convertToJsonString: convertToJsonString_1
};

//parse Empty Node as self closing node
const buildOptions$3 = util.buildOptions;

const defaultOptions$2 = {
  attributeNamePrefix: '@_',
  attrNodeName: false,
  textNodeName: '#text',
  ignoreAttributes: true,
  cdataTagName: false,
  cdataPositionChar: '\\c',
  format: false,
  indentBy: '  ',
  supressEmptyNode: false,
  tagValueProcessor: function(a) {
    return a;
  },
  attrValueProcessor: function(a) {
    return a;
  },
};

const props$2 = [
  'attributeNamePrefix',
  'attrNodeName',
  'textNodeName',
  'ignoreAttributes',
  'cdataTagName',
  'cdataPositionChar',
  'format',
  'indentBy',
  'supressEmptyNode',
  'tagValueProcessor',
  'attrValueProcessor',
];

function Parser(options) {
  this.options = buildOptions$3(options, defaultOptions$2, props$2);
  if (this.options.ignoreAttributes || this.options.attrNodeName) {
    this.isAttribute = function(/*a*/) {
      return false;
    };
  } else {
    this.attrPrefixLen = this.options.attributeNamePrefix.length;
    this.isAttribute = isAttribute;
  }
  if (this.options.cdataTagName) {
    this.isCDATA = isCDATA;
  } else {
    this.isCDATA = function(/*a*/) {
      return false;
    };
  }
  this.replaceCDATAstr = replaceCDATAstr;
  this.replaceCDATAarr = replaceCDATAarr;

  if (this.options.format) {
    this.indentate = indentate;
    this.tagEndChar = '>\n';
    this.newLine = '\n';
  } else {
    this.indentate = function() {
      return '';
    };
    this.tagEndChar = '>';
    this.newLine = '';
  }

  if (this.options.supressEmptyNode) {
    this.buildTextNode = buildEmptyTextNode;
    this.buildObjNode = buildEmptyObjNode;
  } else {
    this.buildTextNode = buildTextValNode;
    this.buildObjNode = buildObjectNode;
  }

  this.buildTextValNode = buildTextValNode;
  this.buildObjectNode = buildObjectNode;
}

Parser.prototype.parse = function(jObj) {
  return this.j2x(jObj, 0).val;
};

Parser.prototype.j2x = function(jObj, level) {
  let attrStr = '';
  let val = '';
  const keys = Object.keys(jObj);
  const len = keys.length;
  for (let i = 0; i < len; i++) {
    const key = keys[i];
    if (typeof jObj[key] === 'undefined') ; else if (jObj[key] === null) {
      val += this.indentate(level) + '<' + key + '/' + this.tagEndChar;
    } else if (jObj[key] instanceof Date) {
      val += this.buildTextNode(jObj[key], key, '', level);
    } else if (typeof jObj[key] !== 'object') {
      //premitive type
      const attr = this.isAttribute(key);
      if (attr) {
        attrStr += ' ' + attr + '="' + this.options.attrValueProcessor('' + jObj[key]) + '"';
      } else if (this.isCDATA(key)) {
        if (jObj[this.options.textNodeName]) {
          val += this.replaceCDATAstr(jObj[this.options.textNodeName], jObj[key]);
        } else {
          val += this.replaceCDATAstr('', jObj[key]);
        }
      } else {
        //tag value
        if (key === this.options.textNodeName) {
          if (jObj[this.options.cdataTagName]) ; else {
            val += this.options.tagValueProcessor('' + jObj[key]);
          }
        } else {
          val += this.buildTextNode(jObj[key], key, '', level);
        }
      }
    } else if (Array.isArray(jObj[key])) {
      //repeated nodes
      if (this.isCDATA(key)) {
        val += this.indentate(level);
        if (jObj[this.options.textNodeName]) {
          val += this.replaceCDATAarr(jObj[this.options.textNodeName], jObj[key]);
        } else {
          val += this.replaceCDATAarr('', jObj[key]);
        }
      } else {
        //nested nodes
        const arrLen = jObj[key].length;
        for (let j = 0; j < arrLen; j++) {
          const item = jObj[key][j];
          if (typeof item === 'undefined') ; else if (item === null) {
            val += this.indentate(level) + '<' + key + '/' + this.tagEndChar;
          } else if (typeof item === 'object') {
            const result = this.j2x(item, level + 1);
            val += this.buildObjNode(result.val, key, result.attrStr, level);
          } else {
            val += this.buildTextNode(item, key, '', level);
          }
        }
      }
    } else {
      //nested node
      if (this.options.attrNodeName && key === this.options.attrNodeName) {
        const Ks = Object.keys(jObj[key]);
        const L = Ks.length;
        for (let j = 0; j < L; j++) {
          attrStr += ' ' + Ks[j] + '="' + this.options.attrValueProcessor('' + jObj[key][Ks[j]]) + '"';
        }
      } else {
        const result = this.j2x(jObj[key], level + 1);
        val += this.buildObjNode(result.val, key, result.attrStr, level);
      }
    }
  }
  return {attrStr: attrStr, val: val};
};

function replaceCDATAstr(str, cdata) {
  str = this.options.tagValueProcessor('' + str);
  if (this.options.cdataPositionChar === '' || str === '') {
    return str + '<![CDATA[' + cdata + ']]' + this.tagEndChar;
  } else {
    return str.replace(this.options.cdataPositionChar, '<![CDATA[' + cdata + ']]' + this.tagEndChar);
  }
}

function replaceCDATAarr(str, cdata) {
  str = this.options.tagValueProcessor('' + str);
  if (this.options.cdataPositionChar === '' || str === '') {
    return str + '<![CDATA[' + cdata.join(']]><![CDATA[') + ']]' + this.tagEndChar;
  } else {
    for (let v in cdata) {
      str = str.replace(this.options.cdataPositionChar, '<![CDATA[' + cdata[v] + ']]>');
    }
    return str + this.newLine;
  }
}

function buildObjectNode(val, key, attrStr, level) {
  if (attrStr && !val.includes('<')) {
    return (
      this.indentate(level) +
      '<' +
      key +
      attrStr +
      '>' +
      val +
      //+ this.newLine
      // + this.indentate(level)
      '</' +
      key +
      this.tagEndChar
    );
  } else {
    return (
      this.indentate(level) +
      '<' +
      key +
      attrStr +
      this.tagEndChar +
      val +
      //+ this.newLine
      this.indentate(level) +
      '</' +
      key +
      this.tagEndChar
    );
  }
}

function buildEmptyObjNode(val, key, attrStr, level) {
  if (val !== '') {
    return this.buildObjectNode(val, key, attrStr, level);
  } else {
    return this.indentate(level) + '<' + key + attrStr + '/' + this.tagEndChar;
    //+ this.newLine
  }
}

function buildTextValNode(val, key, attrStr, level) {
  return (
    this.indentate(level) +
    '<' +
    key +
    attrStr +
    '>' +
    this.options.tagValueProcessor(val) +
    '</' +
    key +
    this.tagEndChar
  );
}

function buildEmptyTextNode(val, key, attrStr, level) {
  if (val !== '') {
    return this.buildTextValNode(val, key, attrStr, level);
  } else {
    return this.indentate(level) + '<' + key + attrStr + '/' + this.tagEndChar;
  }
}

function indentate(level) {
  return this.options.indentBy.repeat(level);
}

function isAttribute(name /*, options*/) {
  if (name.startsWith(this.options.attributeNamePrefix)) {
    return name.substr(this.attrPrefixLen);
  } else {
    return false;
  }
}

function isCDATA(name) {
  return name === this.options.cdataTagName;
}

//formatting
//indentation
//\n after each closing or self closing tag

var json2xml = Parser;

var parser = createCommonjsModule(function (module, exports) {



const x2xmlnode = xmlstr2xmlnode;
const buildOptions = util.buildOptions;


exports.parse = function(xmlData, options, validationOption) {
  if( validationOption){
    if(validationOption === true) validationOption = {};
    
    const result = validator.validate(xmlData, validationOption);
    if (result !== true) {
      throw Error( result.err.msg)
    }
  }
  options = buildOptions(options, x2xmlnode.defaultOptions, x2xmlnode.props);
  const traversableObj = xmlstr2xmlnode.getTraversalObj(xmlData, options);
  //print(traversableObj, "  ");
  return node2json.convertToJson(traversableObj, options);
};
exports.convertTonimn = nimndata.convert2nimn;
exports.getTraversalObj = xmlstr2xmlnode.getTraversalObj;
exports.convertToJson = node2json.convertToJson;
exports.convertToJsonString = node2json_str.convertToJsonString;
exports.validate = validator.validate;
exports.j2xParser = json2xml;
exports.parseToNimn = function(xmlData, schema, options) {
  return exports.convertTonimn(exports.getTraversalObj(xmlData, options), schema, options);
};
});

var fsColormap1 = "#define SHADER_NAME xr-layer-fragment-shader-colormap\nprecision highp float;\n#define GLSLIFY 1\nuniform sampler2D channel0;uniform sampler2D channel1;uniform sampler2D channel2;uniform sampler2D channel3;uniform sampler2D channel4;uniform sampler2D channel5;uniform vec2 sliderValues[6];uniform float opacity;uniform float divisor;varying vec2 vTexCoord;void main(){float intensityValue0=sample_and_apply_sliders(channel0,vTexCoord,sliderValues[0]);float intensityValue1=sample_and_apply_sliders(channel1,vTexCoord,sliderValues[1]);float intensityValue2=sample_and_apply_sliders(channel2,vTexCoord,sliderValues[2]);float intensityValue3=sample_and_apply_sliders(channel3,vTexCoord,sliderValues[3]);float intensityValue4=sample_and_apply_sliders(channel4,vTexCoord,sliderValues[4]);float intensityValue5=sample_and_apply_sliders(channel5,vTexCoord,sliderValues[5]);float intensityCombo=0.0;intensityCombo+=max(0.0,intensityValue0);intensityCombo+=max(0.0,intensityValue1);intensityCombo+=max(0.0,intensityValue2);intensityCombo+=max(0.0,intensityValue3);intensityCombo+=max(0.0,intensityValue4);intensityCombo+=max(0.0,intensityValue5);gl_FragColor=colormap(intensityCombo,opacity);geometry.uv=vTexCoord;DECKGL_FILTER_COLOR(gl_FragColor,geometry);}"; // eslint-disable-line

var fsColormap2 = "#version 300 es\n#define SHADER_NAME xr-layer-fragment-shader\nprecision highp float;precision highp int;precision highp SAMPLER_TYPE;\n#define GLSLIFY 1\nuniform SAMPLER_TYPE channel0;uniform SAMPLER_TYPE channel1;uniform SAMPLER_TYPE channel2;uniform SAMPLER_TYPE channel3;uniform SAMPLER_TYPE channel4;uniform SAMPLER_TYPE channel5;uniform vec2 sliderValues[6];uniform float opacity;in vec2 vTexCoord;out vec4 color;void main(){float intensityValue0=sample_and_apply_sliders(channel0,vTexCoord,sliderValues[0]);float intensityValue1=sample_and_apply_sliders(channel1,vTexCoord,sliderValues[1]);float intensityValue2=sample_and_apply_sliders(channel2,vTexCoord,sliderValues[2]);float intensityValue3=sample_and_apply_sliders(channel3,vTexCoord,sliderValues[3]);float intensityValue4=sample_and_apply_sliders(channel4,vTexCoord,sliderValues[4]);float intensityValue5=sample_and_apply_sliders(channel5,vTexCoord,sliderValues[5]);float intensityArray[6]=float[6](intensityValue0,intensityValue1,intensityValue2,intensityValue3,intensityValue4,intensityValue5);float intensityCombo=0.0;for(int i=0;i<6;i++){intensityCombo+=max(0.0,intensityArray[i]);}color=colormap(intensityCombo,opacity);geometry.uv=vTexCoord;DECKGL_FILTER_COLOR(color,geometry);}"; // eslint-disable-line

var fs1 = "#define SHADER_NAME xr-layer-fragment-shader\nprecision highp float;\n#define GLSLIFY 1\nuniform sampler2D channel0;uniform sampler2D channel1;uniform sampler2D channel2;uniform sampler2D channel3;uniform sampler2D channel4;uniform sampler2D channel5;uniform vec2 sliderValues[6];uniform vec3 colorValues[6];uniform float intensityArray[6];uniform float opacity;uniform float majorLensAxis;uniform float minorLensAxis;uniform vec2 lensCenter;uniform bool isLensOn;uniform int lensSelection;uniform vec3 lensBorderColor;uniform float lensBorderRadius;varying vec2 vTexCoord;void main(){float intensityValue0=sample_and_apply_sliders(channel0,vTexCoord,sliderValues[0]);float intensityValue1=sample_and_apply_sliders(channel1,vTexCoord,sliderValues[1]);float intensityValue2=sample_and_apply_sliders(channel2,vTexCoord,sliderValues[2]);float intensityValue3=sample_and_apply_sliders(channel3,vTexCoord,sliderValues[3]);float intensityValue4=sample_and_apply_sliders(channel4,vTexCoord,sliderValues[4]);float intensityValue5=sample_and_apply_sliders(channel5,vTexCoord,sliderValues[5]);bool isFragInLensBounds=frag_in_lens_bounds(lensCenter,vTexCoord,majorLensAxis,minorLensAxis,lensBorderRadius);bool isFragOnLensBounds=frag_on_lens_bounds(lensCenter,vTexCoord,majorLensAxis,minorLensAxis,lensBorderRadius);bool inLensAndUseLens=isLensOn&&isFragInLensBounds;vec3 rgbCombo=process_channel_intensity(intensityValue0,colorValues[0],0,inLensAndUseLens,lensSelection);rgbCombo+=process_channel_intensity(intensityValue1,colorValues[1],1,inLensAndUseLens,lensSelection);rgbCombo+=process_channel_intensity(intensityValue2,colorValues[2],2,inLensAndUseLens,lensSelection);rgbCombo+=process_channel_intensity(intensityValue3,colorValues[3],3,inLensAndUseLens,lensSelection);rgbCombo+=process_channel_intensity(intensityValue4,colorValues[4],4,inLensAndUseLens,lensSelection);rgbCombo+=process_channel_intensity(intensityValue5,colorValues[5],5,inLensAndUseLens,lensSelection);rgbCombo=(isLensOn&&isFragOnLensBounds)? lensBorderColor : rgbCombo;gl_FragColor=vec4(rgbCombo,opacity);geometry.uv=vTexCoord;DECKGL_FILTER_COLOR(gl_FragColor,geometry);}"; // eslint-disable-line

var fs2 = "#version 300 es\n#define SHADER_NAME xr-layer-fragment-shader\nprecision highp float;precision highp int;precision highp SAMPLER_TYPE;\n#define GLSLIFY 1\nuniform SAMPLER_TYPE channel0;uniform SAMPLER_TYPE channel1;uniform SAMPLER_TYPE channel2;uniform SAMPLER_TYPE channel3;uniform SAMPLER_TYPE channel4;uniform SAMPLER_TYPE channel5;uniform vec2 sliderValues[6];uniform vec3 colorValues[6];uniform float opacity;uniform float majorLensAxis;uniform float minorLensAxis;uniform vec2 lensCenter;uniform bool isLensOn;uniform int lensSelection;uniform vec3 lensBorderColor;uniform float lensBorderRadius;in vec2 vTexCoord;out vec4 color;void main(){float intensityValue0=sample_and_apply_sliders(channel0,vTexCoord,sliderValues[0]);float intensityValue1=sample_and_apply_sliders(channel1,vTexCoord,sliderValues[1]);float intensityValue2=sample_and_apply_sliders(channel2,vTexCoord,sliderValues[2]);float intensityValue3=sample_and_apply_sliders(channel3,vTexCoord,sliderValues[3]);float intensityValue4=sample_and_apply_sliders(channel4,vTexCoord,sliderValues[4]);float intensityValue5=sample_and_apply_sliders(channel5,vTexCoord,sliderValues[5]);float intensityArray[6]=float[6](intensityValue0,intensityValue1,intensityValue2,intensityValue3,intensityValue4,intensityValue5);bool isFragInLensBounds=frag_in_lens_bounds(lensCenter,vTexCoord,majorLensAxis,minorLensAxis,lensBorderRadius);bool isFragOnLensBounds=frag_on_lens_bounds(lensCenter,vTexCoord,majorLensAxis,minorLensAxis,lensBorderRadius);bool inLensAndUseLens=isLensOn&&isFragInLensBounds;vec3 rgbCombo=vec3(0.0);for(int i=0;i<6;i++){rgbCombo+=process_channel_intensity(intensityArray[i],colorValues[i],i,inLensAndUseLens,lensSelection);}rgbCombo=(isLensOn&&isFragOnLensBounds)? lensBorderColor : rgbCombo;color=vec4(rgbCombo,opacity);geometry.uv=vTexCoord;DECKGL_FILTER_COLOR(color,geometry);}"; // eslint-disable-line

var vs1 = "#define GLSLIFY 1\n#define SHADER_NAME xr-layer-vertex-shader\nattribute vec2 texCoords;attribute vec3 positions;attribute vec3 positions64Low;attribute vec3 instancePickingColors;varying vec2 vTexCoord;void main(void){geometry.worldPosition=positions;geometry.uv=texCoords;geometry.pickingColor=instancePickingColors;gl_Position=project_position_to_clipspace(positions,positions64Low,vec3(0.0),geometry.position);DECKGL_FILTER_GL_POSITION(gl_Position,geometry);vTexCoord=texCoords;vec4 color=vec4(0.0);DECKGL_FILTER_COLOR(color,geometry);}"; // eslint-disable-line

var vs2 = "#version 300 es\n#define GLSLIFY 1\n#define SHADER_NAME xr-layer-vertex-shader\nin vec2 texCoords;in vec3 positions;in vec3 positions64Low;in vec3 instancePickingColors;out vec2 vTexCoord;void main(void){geometry.worldPosition=positions;geometry.uv=texCoords;geometry.pickingColor=instancePickingColors;gl_Position=project_position_to_clipspace(positions,positions64Low,vec3(0.0),geometry.position);DECKGL_FILTER_GL_POSITION(gl_Position,geometry);vTexCoord=texCoords;vec4 color=vec4(0.0);DECKGL_FILTER_COLOR(color,geometry);}"; // eslint-disable-line

var fs$4 = "#define GLSLIFY 1\nvec4 jet(float x_17){const float e0=0.0;const vec4 v0=vec4(0,0,0.5137254901960784,1);const float e1=0.125;const vec4 v1=vec4(0,0.23529411764705882,0.6666666666666666,1);const float e2=0.375;const vec4 v2=vec4(0.0196078431372549,1,1,1);const float e3=0.625;const vec4 v3=vec4(1,1,0,1);const float e4=0.875;const vec4 v4=vec4(0.9803921568627451,0,0,1);const float e5=1.0;const vec4 v5=vec4(0.5019607843137255,0,0,1);float a0=smoothstep(e0,e1,x_17);float a1=smoothstep(e1,e2,x_17);float a2=smoothstep(e2,e3,x_17);float a3=smoothstep(e3,e4,x_17);float a4=smoothstep(e4,e5,x_17);return max(mix(v0,v1,a0)*step(e0,x_17)*step(x_17,e1),max(mix(v1,v2,a1)*step(e1,x_17)*step(x_17,e2),max(mix(v2,v3,a2)*step(e2,x_17)*step(x_17,e3),max(mix(v3,v4,a3)*step(e3,x_17)*step(x_17,e4),mix(v4,v5,a4)*step(e4,x_17)*step(x_17,e5)))));}vec4 hsv_0(float x_18){const float e0=0.0;const vec4 v0=vec4(1,0,0,1);const float e1=0.169;const vec4 v1=vec4(0.9921568627450981,1,0.00784313725490196,1);const float e2=0.173;const vec4 v2=vec4(0.9686274509803922,1,0.00784313725490196,1);const float e3=0.337;const vec4 v3=vec4(0,0.9882352941176471,0.01568627450980392,1);const float e4=0.341;const vec4 v4=vec4(0,0.9882352941176471,0.0392156862745098,1);const float e5=0.506;const vec4 v5=vec4(0.00392156862745098,0.9764705882352941,1,1);const float e6=0.671;const vec4 v6=vec4(0.00784313725490196,0,0.9921568627450981,1);const float e7=0.675;const vec4 v7=vec4(0.03137254901960784,0,0.9921568627450981,1);const float e8=0.839;const vec4 v8=vec4(1,0,0.984313725490196,1);const float e9=0.843;const vec4 v9=vec4(1,0,0.9607843137254902,1);const float e10=1.0;const vec4 v10=vec4(1,0,0.023529411764705882,1);float a0=smoothstep(e0,e1,x_18);float a1=smoothstep(e1,e2,x_18);float a2=smoothstep(e2,e3,x_18);float a3=smoothstep(e3,e4,x_18);float a4=smoothstep(e4,e5,x_18);float a5=smoothstep(e5,e6,x_18);float a6=smoothstep(e6,e7,x_18);float a7=smoothstep(e7,e8,x_18);float a8=smoothstep(e8,e9,x_18);float a9=smoothstep(e9,e10,x_18);return max(mix(v0,v1,a0)*step(e0,x_18)*step(x_18,e1),max(mix(v1,v2,a1)*step(e1,x_18)*step(x_18,e2),max(mix(v2,v3,a2)*step(e2,x_18)*step(x_18,e3),max(mix(v3,v4,a3)*step(e3,x_18)*step(x_18,e4),max(mix(v4,v5,a4)*step(e4,x_18)*step(x_18,e5),max(mix(v5,v6,a5)*step(e5,x_18)*step(x_18,e6),max(mix(v6,v7,a6)*step(e6,x_18)*step(x_18,e7),max(mix(v7,v8,a7)*step(e7,x_18)*step(x_18,e8),max(mix(v8,v9,a8)*step(e8,x_18)*step(x_18,e9),mix(v9,v10,a9)*step(e9,x_18)*step(x_18,e10))))))))));}vec4 hot(float x_13){const float e0=0.0;const vec4 v0=vec4(0,0,0,1);const float e1=0.3;const vec4 v1=vec4(0.9019607843137255,0,0,1);const float e2=0.6;const vec4 v2=vec4(1,0.8235294117647058,0,1);const float e3=1.0;const vec4 v3=vec4(1,1,1,1);float a0=smoothstep(e0,e1,x_13);float a1=smoothstep(e1,e2,x_13);float a2=smoothstep(e2,e3,x_13);return max(mix(v0,v1,a0)*step(e0,x_13)*step(x_13,e1),max(mix(v1,v2,a1)*step(e1,x_13)*step(x_13,e2),mix(v2,v3,a2)*step(e2,x_13)*step(x_13,e3)));}vec4 cool(float x_24){const float e0=0.0;const vec4 v0=vec4(0.49019607843137253,0,0.7019607843137254,1);const float e1=0.13;const vec4 v1=vec4(0.4549019607843137,0,0.8549019607843137,1);const float e2=0.25;const vec4 v2=vec4(0.3843137254901961,0.2901960784313726,0.9294117647058824,1);const float e3=0.38;const vec4 v3=vec4(0.26666666666666666,0.5725490196078431,0.9058823529411765,1);const float e4=0.5;const vec4 v4=vec4(0,0.8,0.7725490196078432,1);const float e5=0.63;const vec4 v5=vec4(0,0.9686274509803922,0.5725490196078431,1);const float e6=0.75;const vec4 v6=vec4(0,1,0.34509803921568627,1);const float e7=0.88;const vec4 v7=vec4(0.1568627450980392,1,0.03137254901960784,1);const float e8=1.0;const vec4 v8=vec4(0.5764705882352941,1,0,1);float a0=smoothstep(e0,e1,x_24);float a1=smoothstep(e1,e2,x_24);float a2=smoothstep(e2,e3,x_24);float a3=smoothstep(e3,e4,x_24);float a4=smoothstep(e4,e5,x_24);float a5=smoothstep(e5,e6,x_24);float a6=smoothstep(e6,e7,x_24);float a7=smoothstep(e7,e8,x_24);return max(mix(v0,v1,a0)*step(e0,x_24)*step(x_24,e1),max(mix(v1,v2,a1)*step(e1,x_24)*step(x_24,e2),max(mix(v2,v3,a2)*step(e2,x_24)*step(x_24,e3),max(mix(v3,v4,a3)*step(e3,x_24)*step(x_24,e4),max(mix(v4,v5,a4)*step(e4,x_24)*step(x_24,e5),max(mix(v5,v6,a5)*step(e5,x_24)*step(x_24,e6),max(mix(v6,v7,a6)*step(e6,x_24)*step(x_24,e7),mix(v7,v8,a7)*step(e7,x_24)*step(x_24,e8))))))));}vec4 spring(float x_5){const float e0=0.0;const vec4 v0=vec4(1,0,1,1);const float e1=1.0;const vec4 v1=vec4(1,1,0,1);float a0=smoothstep(e0,e1,x_5);return mix(v0,v1,a0)*step(e0,x_5)*step(x_5,e1);}vec4 summer(float x_12){const float e0=0.0;const vec4 v0=vec4(0,0.5019607843137255,0.4,1);const float e1=1.0;const vec4 v1=vec4(1,1,0.4,1);float a0=smoothstep(e0,e1,x_12);return mix(v0,v1,a0)*step(e0,x_12)*step(x_12,e1);}vec4 autumn(float x_25){const float e0=0.0;const vec4 v0=vec4(1,0,0,1);const float e1=1.0;const vec4 v1=vec4(1,1,0,1);float a0=smoothstep(e0,e1,x_25);return mix(v0,v1,a0)*step(e0,x_25)*step(x_25,e1);}vec4 winter(float x_16){const float e0=0.0;const vec4 v0=vec4(0,0,1,1);const float e1=1.0;const vec4 v1=vec4(0,1,0.5019607843137255,1);float a0=smoothstep(e0,e1,x_16);return mix(v0,v1,a0)*step(e0,x_16)*step(x_16,e1);}vec4 bone(float x_15){const float e0=0.0;const vec4 v0=vec4(0,0,0,1);const float e1=0.376;const vec4 v1=vec4(0.32941176470588235,0.32941176470588235,0.4549019607843137,1);const float e2=0.753;const vec4 v2=vec4(0.6627450980392157,0.7843137254901961,0.7843137254901961,1);const float e3=1.0;const vec4 v3=vec4(1,1,1,1);float a0=smoothstep(e0,e1,x_15);float a1=smoothstep(e1,e2,x_15);float a2=smoothstep(e2,e3,x_15);return max(mix(v0,v1,a0)*step(e0,x_15)*step(x_15,e1),max(mix(v1,v2,a1)*step(e1,x_15)*step(x_15,e2),mix(v2,v3,a2)*step(e2,x_15)*step(x_15,e3)));}vec4 copper(float x_10){const float e0=0.0;const vec4 v0=vec4(0,0,0,1);const float e1=0.804;const vec4 v1=vec4(1,0.6274509803921569,0.4,1);const float e2=1.0;const vec4 v2=vec4(1,0.7803921568627451,0.4980392156862745,1);float a0=smoothstep(e0,e1,x_10);float a1=smoothstep(e1,e2,x_10);return max(mix(v0,v1,a0)*step(e0,x_10)*step(x_10,e1),mix(v1,v2,a1)*step(e1,x_10)*step(x_10,e2));}vec4 greys(float x_4){const float e0=0.0;const vec4 v0=vec4(0,0,0,1);const float e1=1.0;const vec4 v1=vec4(1,1,1,1);float a0=smoothstep(e0,e1,x_4);return mix(v0,v1,a0)*step(e0,x_4)*step(x_4,e1);}vec4 yignbu(float x_32){const float e0=0.0;const vec4 v0=vec4(0.03137254901960784,0.11372549019607843,0.34509803921568627,1);const float e1=0.125;const vec4 v1=vec4(0.1450980392156863,0.20392156862745098,0.5803921568627451,1);const float e2=0.25;const vec4 v2=vec4(0.13333333333333333,0.3686274509803922,0.6588235294117647,1);const float e3=0.375;const vec4 v3=vec4(0.11372549019607843,0.5686274509803921,0.7529411764705882,1);const float e4=0.5;const vec4 v4=vec4(0.2549019607843137,0.7137254901960784,0.7686274509803922,1);const float e5=0.625;const vec4 v5=vec4(0.4980392156862745,0.803921568627451,0.7333333333333333,1);const float e6=0.75;const vec4 v6=vec4(0.7803921568627451,0.9137254901960784,0.7058823529411765,1);const float e7=0.875;const vec4 v7=vec4(0.9294117647058824,0.9725490196078431,0.8509803921568627,1);const float e8=1.0;const vec4 v8=vec4(1,1,0.8509803921568627,1);float a0=smoothstep(e0,e1,x_32);float a1=smoothstep(e1,e2,x_32);float a2=smoothstep(e2,e3,x_32);float a3=smoothstep(e3,e4,x_32);float a4=smoothstep(e4,e5,x_32);float a5=smoothstep(e5,e6,x_32);float a6=smoothstep(e6,e7,x_32);float a7=smoothstep(e7,e8,x_32);return max(mix(v0,v1,a0)*step(e0,x_32)*step(x_32,e1),max(mix(v1,v2,a1)*step(e1,x_32)*step(x_32,e2),max(mix(v2,v3,a2)*step(e2,x_32)*step(x_32,e3),max(mix(v3,v4,a3)*step(e3,x_32)*step(x_32,e4),max(mix(v4,v5,a4)*step(e4,x_32)*step(x_32,e5),max(mix(v5,v6,a5)*step(e5,x_32)*step(x_32,e6),max(mix(v6,v7,a6)*step(e6,x_32)*step(x_32,e7),mix(v7,v8,a7)*step(e7,x_32)*step(x_32,e8))))))));}vec4 greens(float x_34){const float e0=0.0;const vec4 v0=vec4(0,0.26666666666666666,0.10588235294117647,1);const float e1=0.125;const vec4 v1=vec4(0,0.42745098039215684,0.17254901960784313,1);const float e2=0.25;const vec4 v2=vec4(0.13725490196078433,0.5450980392156862,0.27058823529411763,1);const float e3=0.375;const vec4 v3=vec4(0.2549019607843137,0.6705882352941176,0.36470588235294116,1);const float e4=0.5;const vec4 v4=vec4(0.4549019607843137,0.7686274509803922,0.4627450980392157,1);const float e5=0.625;const vec4 v5=vec4(0.6313725490196078,0.8509803921568627,0.6078431372549019,1);const float e6=0.75;const vec4 v6=vec4(0.7803921568627451,0.9137254901960784,0.7529411764705882,1);const float e7=0.875;const vec4 v7=vec4(0.8980392156862745,0.9607843137254902,0.8784313725490196,1);const float e8=1.0;const vec4 v8=vec4(0.9686274509803922,0.9882352941176471,0.9607843137254902,1);float a0=smoothstep(e0,e1,x_34);float a1=smoothstep(e1,e2,x_34);float a2=smoothstep(e2,e3,x_34);float a3=smoothstep(e3,e4,x_34);float a4=smoothstep(e4,e5,x_34);float a5=smoothstep(e5,e6,x_34);float a6=smoothstep(e6,e7,x_34);float a7=smoothstep(e7,e8,x_34);return max(mix(v0,v1,a0)*step(e0,x_34)*step(x_34,e1),max(mix(v1,v2,a1)*step(e1,x_34)*step(x_34,e2),max(mix(v2,v3,a2)*step(e2,x_34)*step(x_34,e3),max(mix(v3,v4,a3)*step(e3,x_34)*step(x_34,e4),max(mix(v4,v5,a4)*step(e4,x_34)*step(x_34,e5),max(mix(v5,v6,a5)*step(e5,x_34)*step(x_34,e6),max(mix(v6,v7,a6)*step(e6,x_34)*step(x_34,e7),mix(v7,v8,a7)*step(e7,x_34)*step(x_34,e8))))))));}vec4 yiorrd(float x_41){const float e0=0.0;const vec4 v0=vec4(0.5019607843137255,0,0.14901960784313725,1);const float e1=0.125;const vec4 v1=vec4(0.7411764705882353,0,0.14901960784313725,1);const float e2=0.25;const vec4 v2=vec4(0.8901960784313725,0.10196078431372549,0.10980392156862745,1);const float e3=0.375;const vec4 v3=vec4(0.9882352941176471,0.3058823529411765,0.16470588235294117,1);const float e4=0.5;const vec4 v4=vec4(0.9921568627450981,0.5529411764705883,0.23529411764705882,1);const float e5=0.625;const vec4 v5=vec4(0.996078431372549,0.6980392156862745,0.2980392156862745,1);const float e6=0.75;const vec4 v6=vec4(0.996078431372549,0.8509803921568627,0.4627450980392157,1);const float e7=0.875;const vec4 v7=vec4(1,0.9294117647058824,0.6274509803921569,1);const float e8=1.0;const vec4 v8=vec4(1,1,0.8,1);float a0=smoothstep(e0,e1,x_41);float a1=smoothstep(e1,e2,x_41);float a2=smoothstep(e2,e3,x_41);float a3=smoothstep(e3,e4,x_41);float a4=smoothstep(e4,e5,x_41);float a5=smoothstep(e5,e6,x_41);float a6=smoothstep(e6,e7,x_41);float a7=smoothstep(e7,e8,x_41);return max(mix(v0,v1,a0)*step(e0,x_41)*step(x_41,e1),max(mix(v1,v2,a1)*step(e1,x_41)*step(x_41,e2),max(mix(v2,v3,a2)*step(e2,x_41)*step(x_41,e3),max(mix(v3,v4,a3)*step(e3,x_41)*step(x_41,e4),max(mix(v4,v5,a4)*step(e4,x_41)*step(x_41,e5),max(mix(v5,v6,a5)*step(e5,x_41)*step(x_41,e6),max(mix(v6,v7,a6)*step(e6,x_41)*step(x_41,e7),mix(v7,v8,a7)*step(e7,x_41)*step(x_41,e8))))))));}vec4 bluered(float x_23){const float e0=0.0;const vec4 v0=vec4(0,0,1,1);const float e1=1.0;const vec4 v1=vec4(1,0,0,1);float a0=smoothstep(e0,e1,x_23);return mix(v0,v1,a0)*step(e0,x_23)*step(x_23,e1);}vec4 rdbu(float x_1){const float e0=0.0;const vec4 v0=vec4(0.0196078431372549,0.0392156862745098,0.6745098039215687,1);const float e1=0.35;const vec4 v1=vec4(0.41568627450980394,0.5372549019607843,0.9686274509803922,1);const float e2=0.5;const vec4 v2=vec4(0.7450980392156863,0.7450980392156863,0.7450980392156863,1);const float e3=0.6;const vec4 v3=vec4(0.8627450980392157,0.6666666666666666,0.5176470588235295,1);const float e4=0.7;const vec4 v4=vec4(0.9019607843137255,0.5686274509803921,0.35294117647058826,1);const float e5=1.0;const vec4 v5=vec4(0.6980392156862745,0.0392156862745098,0.10980392156862745,1);float a0=smoothstep(e0,e1,x_1);float a1=smoothstep(e1,e2,x_1);float a2=smoothstep(e2,e3,x_1);float a3=smoothstep(e3,e4,x_1);float a4=smoothstep(e4,e5,x_1);return max(mix(v0,v1,a0)*step(e0,x_1)*step(x_1,e1),max(mix(v1,v2,a1)*step(e1,x_1)*step(x_1,e2),max(mix(v2,v3,a2)*step(e2,x_1)*step(x_1,e3),max(mix(v3,v4,a3)*step(e3,x_1)*step(x_1,e4),mix(v4,v5,a4)*step(e4,x_1)*step(x_1,e5)))));}vec4 picnic(float x_42){const float e0=0.0;const vec4 v0=vec4(0,0,1,1);const float e1=0.1;const vec4 v1=vec4(0.2,0.6,1,1);const float e2=0.2;const vec4 v2=vec4(0.4,0.8,1,1);const float e3=0.3;const vec4 v3=vec4(0.6,0.8,1,1);const float e4=0.4;const vec4 v4=vec4(0.8,0.8,1,1);const float e5=0.5;const vec4 v5=vec4(1,1,1,1);const float e6=0.6;const vec4 v6=vec4(1,0.8,1,1);const float e7=0.7;const vec4 v7=vec4(1,0.6,1,1);const float e8=0.8;const vec4 v8=vec4(1,0.4,0.8,1);const float e9=0.9;const vec4 v9=vec4(1,0.4,0.4,1);const float e10=1.0;const vec4 v10=vec4(1,0,0,1);float a0=smoothstep(e0,e1,x_42);float a1=smoothstep(e1,e2,x_42);float a2=smoothstep(e2,e3,x_42);float a3=smoothstep(e3,e4,x_42);float a4=smoothstep(e4,e5,x_42);float a5=smoothstep(e5,e6,x_42);float a6=smoothstep(e6,e7,x_42);float a7=smoothstep(e7,e8,x_42);float a8=smoothstep(e8,e9,x_42);float a9=smoothstep(e9,e10,x_42);return max(mix(v0,v1,a0)*step(e0,x_42)*step(x_42,e1),max(mix(v1,v2,a1)*step(e1,x_42)*step(x_42,e2),max(mix(v2,v3,a2)*step(e2,x_42)*step(x_42,e3),max(mix(v3,v4,a3)*step(e3,x_42)*step(x_42,e4),max(mix(v4,v5,a4)*step(e4,x_42)*step(x_42,e5),max(mix(v5,v6,a5)*step(e5,x_42)*step(x_42,e6),max(mix(v6,v7,a6)*step(e6,x_42)*step(x_42,e7),max(mix(v7,v8,a7)*step(e7,x_42)*step(x_42,e8),max(mix(v8,v9,a8)*step(e8,x_42)*step(x_42,e9),mix(v9,v10,a9)*step(e9,x_42)*step(x_42,e10))))))))));}vec4 rainbow(float x_31){const float e0=0.0;const vec4 v0=vec4(0.5882352941176471,0,0.35294117647058826,1);const float e1=0.125;const vec4 v1=vec4(0,0,0.7843137254901961,1);const float e2=0.25;const vec4 v2=vec4(0,0.09803921568627451,1,1);const float e3=0.375;const vec4 v3=vec4(0,0.596078431372549,1,1);const float e4=0.5;const vec4 v4=vec4(0.17254901960784313,1,0.5882352941176471,1);const float e5=0.625;const vec4 v5=vec4(0.592156862745098,1,0,1);const float e6=0.75;const vec4 v6=vec4(1,0.9176470588235294,0,1);const float e7=0.875;const vec4 v7=vec4(1,0.43529411764705883,0,1);const float e8=1.0;const vec4 v8=vec4(1,0,0,1);float a0=smoothstep(e0,e1,x_31);float a1=smoothstep(e1,e2,x_31);float a2=smoothstep(e2,e3,x_31);float a3=smoothstep(e3,e4,x_31);float a4=smoothstep(e4,e5,x_31);float a5=smoothstep(e5,e6,x_31);float a6=smoothstep(e6,e7,x_31);float a7=smoothstep(e7,e8,x_31);return max(mix(v0,v1,a0)*step(e0,x_31)*step(x_31,e1),max(mix(v1,v2,a1)*step(e1,x_31)*step(x_31,e2),max(mix(v2,v3,a2)*step(e2,x_31)*step(x_31,e3),max(mix(v3,v4,a3)*step(e3,x_31)*step(x_31,e4),max(mix(v4,v5,a4)*step(e4,x_31)*step(x_31,e5),max(mix(v5,v6,a5)*step(e5,x_31)*step(x_31,e6),max(mix(v6,v7,a6)*step(e6,x_31)*step(x_31,e7),mix(v7,v8,a7)*step(e7,x_31)*step(x_31,e8))))))));}vec4 portland(float x_21){const float e0=0.0;const vec4 v0=vec4(0.047058823529411764,0.2,0.5137254901960784,1);const float e1=0.25;const vec4 v1=vec4(0.0392156862745098,0.5333333333333333,0.7294117647058823,1);const float e2=0.5;const vec4 v2=vec4(0.9490196078431372,0.8274509803921568,0.2196078431372549,1);const float e3=0.75;const vec4 v3=vec4(0.9490196078431372,0.5607843137254902,0.2196078431372549,1);const float e4=1.0;const vec4 v4=vec4(0.8509803921568627,0.11764705882352941,0.11764705882352941,1);float a0=smoothstep(e0,e1,x_21);float a1=smoothstep(e1,e2,x_21);float a2=smoothstep(e2,e3,x_21);float a3=smoothstep(e3,e4,x_21);return max(mix(v0,v1,a0)*step(e0,x_21)*step(x_21,e1),max(mix(v1,v2,a1)*step(e1,x_21)*step(x_21,e2),max(mix(v2,v3,a2)*step(e2,x_21)*step(x_21,e3),mix(v3,v4,a3)*step(e3,x_21)*step(x_21,e4))));}vec4 blackbody(float x_38){const float e0=0.0;const vec4 v0=vec4(0,0,0,1);const float e1=0.2;const vec4 v1=vec4(0.9019607843137255,0,0,1);const float e2=0.4;const vec4 v2=vec4(0.9019607843137255,0.8235294117647058,0,1);const float e3=0.7;const vec4 v3=vec4(1,1,1,1);const float e4=1.0;const vec4 v4=vec4(0.6274509803921569,0.7843137254901961,1,1);float a0=smoothstep(e0,e1,x_38);float a1=smoothstep(e1,e2,x_38);float a2=smoothstep(e2,e3,x_38);float a3=smoothstep(e3,e4,x_38);return max(mix(v0,v1,a0)*step(e0,x_38)*step(x_38,e1),max(mix(v1,v2,a1)*step(e1,x_38)*step(x_38,e2),max(mix(v2,v3,a2)*step(e2,x_38)*step(x_38,e3),mix(v3,v4,a3)*step(e3,x_38)*step(x_38,e4))));}vec4 earth(float x_29){const float e0=0.0;const vec4 v0=vec4(0,0,0.5098039215686274,1);const float e1=0.1;const vec4 v1=vec4(0,0.7058823529411765,0.7058823529411765,1);const float e2=0.2;const vec4 v2=vec4(0.1568627450980392,0.8235294117647058,0.1568627450980392,1);const float e3=0.4;const vec4 v3=vec4(0.9019607843137255,0.9019607843137255,0.19607843137254902,1);const float e4=0.6;const vec4 v4=vec4(0.47058823529411764,0.27450980392156865,0.0784313725490196,1);const float e5=1.0;const vec4 v5=vec4(1,1,1,1);float a0=smoothstep(e0,e1,x_29);float a1=smoothstep(e1,e2,x_29);float a2=smoothstep(e2,e3,x_29);float a3=smoothstep(e3,e4,x_29);float a4=smoothstep(e4,e5,x_29);return max(mix(v0,v1,a0)*step(e0,x_29)*step(x_29,e1),max(mix(v1,v2,a1)*step(e1,x_29)*step(x_29,e2),max(mix(v2,v3,a2)*step(e2,x_29)*step(x_29,e3),max(mix(v3,v4,a3)*step(e3,x_29)*step(x_29,e4),mix(v4,v5,a4)*step(e4,x_29)*step(x_29,e5)))));}vec4 electric(float x_9){const float e0=0.0;const vec4 v0=vec4(0,0,0,1);const float e1=0.15;const vec4 v1=vec4(0.11764705882352941,0,0.39215686274509803,1);const float e2=0.4;const vec4 v2=vec4(0.47058823529411764,0,0.39215686274509803,1);const float e3=0.6;const vec4 v3=vec4(0.6274509803921569,0.35294117647058826,0,1);const float e4=0.8;const vec4 v4=vec4(0.9019607843137255,0.7843137254901961,0,1);const float e5=1.0;const vec4 v5=vec4(1,0.9803921568627451,0.8627450980392157,1);float a0=smoothstep(e0,e1,x_9);float a1=smoothstep(e1,e2,x_9);float a2=smoothstep(e2,e3,x_9);float a3=smoothstep(e3,e4,x_9);float a4=smoothstep(e4,e5,x_9);return max(mix(v0,v1,a0)*step(e0,x_9)*step(x_9,e1),max(mix(v1,v2,a1)*step(e1,x_9)*step(x_9,e2),max(mix(v2,v3,a2)*step(e2,x_9)*step(x_9,e3),max(mix(v3,v4,a3)*step(e3,x_9)*step(x_9,e4),mix(v4,v5,a4)*step(e4,x_9)*step(x_9,e5)))));}vec4 alpha(float x_0){const float e0=0.0;const vec4 v0=vec4(1,1,1,0);const float e1=1.0;const vec4 v1=vec4(1,1,1,1);float a0=smoothstep(e0,e1,x_0);return mix(v0,v1,a0)*step(e0,x_0)*step(x_0,e1);}vec4 viridis(float x_22){const float e0=0.0;const vec4 v0=vec4(0.26666666666666666,0.00392156862745098,0.32941176470588235,1);const float e1=0.13;const vec4 v1=vec4(0.2784313725490196,0.17254901960784313,0.47843137254901963,1);const float e2=0.25;const vec4 v2=vec4(0.23137254901960785,0.3176470588235294,0.5450980392156862,1);const float e3=0.38;const vec4 v3=vec4(0.17254901960784313,0.44313725490196076,0.5568627450980392,1);const float e4=0.5;const vec4 v4=vec4(0.12941176470588237,0.5647058823529412,0.5529411764705883,1);const float e5=0.63;const vec4 v5=vec4(0.15294117647058825,0.6784313725490196,0.5058823529411764,1);const float e6=0.75;const vec4 v6=vec4(0.3607843137254902,0.7843137254901961,0.38823529411764707,1);const float e7=0.88;const vec4 v7=vec4(0.6666666666666666,0.8627450980392157,0.19607843137254902,1);const float e8=1.0;const vec4 v8=vec4(0.9921568627450981,0.9058823529411765,0.1450980392156863,1);float a0=smoothstep(e0,e1,x_22);float a1=smoothstep(e1,e2,x_22);float a2=smoothstep(e2,e3,x_22);float a3=smoothstep(e3,e4,x_22);float a4=smoothstep(e4,e5,x_22);float a5=smoothstep(e5,e6,x_22);float a6=smoothstep(e6,e7,x_22);float a7=smoothstep(e7,e8,x_22);return max(mix(v0,v1,a0)*step(e0,x_22)*step(x_22,e1),max(mix(v1,v2,a1)*step(e1,x_22)*step(x_22,e2),max(mix(v2,v3,a2)*step(e2,x_22)*step(x_22,e3),max(mix(v3,v4,a3)*step(e3,x_22)*step(x_22,e4),max(mix(v4,v5,a4)*step(e4,x_22)*step(x_22,e5),max(mix(v5,v6,a5)*step(e5,x_22)*step(x_22,e6),max(mix(v6,v7,a6)*step(e6,x_22)*step(x_22,e7),mix(v7,v8,a7)*step(e7,x_22)*step(x_22,e8))))))));}vec4 inferno(float x_30){const float e0=0.0;const vec4 v0=vec4(0,0,0.01568627450980392,1);const float e1=0.13;const vec4 v1=vec4(0.12156862745098039,0.047058823529411764,0.2823529411764706,1);const float e2=0.25;const vec4 v2=vec4(0.3333333333333333,0.058823529411764705,0.42745098039215684,1);const float e3=0.38;const vec4 v3=vec4(0.5333333333333333,0.13333333333333333,0.41568627450980394,1);const float e4=0.5;const vec4 v4=vec4(0.7294117647058823,0.21176470588235294,0.3333333333333333,1);const float e5=0.63;const vec4 v5=vec4(0.8901960784313725,0.34901960784313724,0.2,1);const float e6=0.75;const vec4 v6=vec4(0.9764705882352941,0.5490196078431373,0.0392156862745098,1);const float e7=0.88;const vec4 v7=vec4(0.9764705882352941,0.788235294117647,0.19607843137254902,1);const float e8=1.0;const vec4 v8=vec4(0.9882352941176471,1,0.6431372549019608,1);float a0=smoothstep(e0,e1,x_30);float a1=smoothstep(e1,e2,x_30);float a2=smoothstep(e2,e3,x_30);float a3=smoothstep(e3,e4,x_30);float a4=smoothstep(e4,e5,x_30);float a5=smoothstep(e5,e6,x_30);float a6=smoothstep(e6,e7,x_30);float a7=smoothstep(e7,e8,x_30);return max(mix(v0,v1,a0)*step(e0,x_30)*step(x_30,e1),max(mix(v1,v2,a1)*step(e1,x_30)*step(x_30,e2),max(mix(v2,v3,a2)*step(e2,x_30)*step(x_30,e3),max(mix(v3,v4,a3)*step(e3,x_30)*step(x_30,e4),max(mix(v4,v5,a4)*step(e4,x_30)*step(x_30,e5),max(mix(v5,v6,a5)*step(e5,x_30)*step(x_30,e6),max(mix(v6,v7,a6)*step(e6,x_30)*step(x_30,e7),mix(v7,v8,a7)*step(e7,x_30)*step(x_30,e8))))))));}vec4 magma(float x_33){const float e0=0.0;const vec4 v0=vec4(0,0,0.01568627450980392,1);const float e1=0.13;const vec4 v1=vec4(0.10980392156862745,0.06274509803921569,0.26666666666666666,1);const float e2=0.25;const vec4 v2=vec4(0.30980392156862746,0.07058823529411765,0.4823529411764706,1);const float e3=0.38;const vec4 v3=vec4(0.5058823529411764,0.1450980392156863,0.5058823529411764,1);const float e4=0.5;const vec4 v4=vec4(0.7098039215686275,0.21176470588235294,0.47843137254901963,1);const float e5=0.63;const vec4 v5=vec4(0.8980392156862745,0.3137254901960784,0.39215686274509803,1);const float e6=0.75;const vec4 v6=vec4(0.984313725490196,0.5294117647058824,0.3803921568627451,1);const float e7=0.88;const vec4 v7=vec4(0.996078431372549,0.7607843137254902,0.5294117647058824,1);const float e8=1.0;const vec4 v8=vec4(0.9882352941176471,0.9921568627450981,0.7490196078431373,1);float a0=smoothstep(e0,e1,x_33);float a1=smoothstep(e1,e2,x_33);float a2=smoothstep(e2,e3,x_33);float a3=smoothstep(e3,e4,x_33);float a4=smoothstep(e4,e5,x_33);float a5=smoothstep(e5,e6,x_33);float a6=smoothstep(e6,e7,x_33);float a7=smoothstep(e7,e8,x_33);return max(mix(v0,v1,a0)*step(e0,x_33)*step(x_33,e1),max(mix(v1,v2,a1)*step(e1,x_33)*step(x_33,e2),max(mix(v2,v3,a2)*step(e2,x_33)*step(x_33,e3),max(mix(v3,v4,a3)*step(e3,x_33)*step(x_33,e4),max(mix(v4,v5,a4)*step(e4,x_33)*step(x_33,e5),max(mix(v5,v6,a5)*step(e5,x_33)*step(x_33,e6),max(mix(v6,v7,a6)*step(e6,x_33)*step(x_33,e7),mix(v7,v8,a7)*step(e7,x_33)*step(x_33,e8))))))));}vec4 plasma(float x_3){const float e0=0.0;const vec4 v0=vec4(0.050980392156862744,0.03137254901960784,0.5294117647058824,1);const float e1=0.13;const vec4 v1=vec4(0.29411764705882354,0.011764705882352941,0.6313725490196078,1);const float e2=0.25;const vec4 v2=vec4(0.49019607843137253,0.011764705882352941,0.6588235294117647,1);const float e3=0.38;const vec4 v3=vec4(0.6588235294117647,0.13333333333333333,0.5882352941176471,1);const float e4=0.5;const vec4 v4=vec4(0.796078431372549,0.27450980392156865,0.4745098039215686,1);const float e5=0.63;const vec4 v5=vec4(0.8980392156862745,0.4196078431372549,0.36470588235294116,1);const float e6=0.75;const vec4 v6=vec4(0.9725490196078431,0.5803921568627451,0.2549019607843137,1);const float e7=0.88;const vec4 v7=vec4(0.9921568627450981,0.7647058823529411,0.1568627450980392,1);const float e8=1.0;const vec4 v8=vec4(0.9411764705882353,0.9764705882352941,0.12941176470588237,1);float a0=smoothstep(e0,e1,x_3);float a1=smoothstep(e1,e2,x_3);float a2=smoothstep(e2,e3,x_3);float a3=smoothstep(e3,e4,x_3);float a4=smoothstep(e4,e5,x_3);float a5=smoothstep(e5,e6,x_3);float a6=smoothstep(e6,e7,x_3);float a7=smoothstep(e7,e8,x_3);return max(mix(v0,v1,a0)*step(e0,x_3)*step(x_3,e1),max(mix(v1,v2,a1)*step(e1,x_3)*step(x_3,e2),max(mix(v2,v3,a2)*step(e2,x_3)*step(x_3,e3),max(mix(v3,v4,a3)*step(e3,x_3)*step(x_3,e4),max(mix(v4,v5,a4)*step(e4,x_3)*step(x_3,e5),max(mix(v5,v6,a5)*step(e5,x_3)*step(x_3,e6),max(mix(v6,v7,a6)*step(e6,x_3)*step(x_3,e7),mix(v7,v8,a7)*step(e7,x_3)*step(x_3,e8))))))));}vec4 warm(float x_43){const float e0=0.0;const vec4 v0=vec4(0.49019607843137253,0,0.7019607843137254,1);const float e1=0.13;const vec4 v1=vec4(0.6745098039215687,0,0.7333333333333333,1);const float e2=0.25;const vec4 v2=vec4(0.8588235294117647,0,0.6666666666666666,1);const float e3=0.38;const vec4 v3=vec4(1,0,0.5098039215686274,1);const float e4=0.5;const vec4 v4=vec4(1,0.24705882352941178,0.2901960784313726,1);const float e5=0.63;const vec4 v5=vec4(1,0.4823529411764706,0,1);const float e6=0.75;const vec4 v6=vec4(0.9176470588235294,0.6901960784313725,0,1);const float e7=0.88;const vec4 v7=vec4(0.7450980392156863,0.8941176470588236,0,1);const float e8=1.0;const vec4 v8=vec4(0.5764705882352941,1,0,1);float a0=smoothstep(e0,e1,x_43);float a1=smoothstep(e1,e2,x_43);float a2=smoothstep(e2,e3,x_43);float a3=smoothstep(e3,e4,x_43);float a4=smoothstep(e4,e5,x_43);float a5=smoothstep(e5,e6,x_43);float a6=smoothstep(e6,e7,x_43);float a7=smoothstep(e7,e8,x_43);return max(mix(v0,v1,a0)*step(e0,x_43)*step(x_43,e1),max(mix(v1,v2,a1)*step(e1,x_43)*step(x_43,e2),max(mix(v2,v3,a2)*step(e2,x_43)*step(x_43,e3),max(mix(v3,v4,a3)*step(e3,x_43)*step(x_43,e4),max(mix(v4,v5,a4)*step(e4,x_43)*step(x_43,e5),max(mix(v5,v6,a5)*step(e5,x_43)*step(x_43,e6),max(mix(v6,v7,a6)*step(e6,x_43)*step(x_43,e7),mix(v7,v8,a7)*step(e7,x_43)*step(x_43,e8))))))));}vec4 rainbow_soft_1310269270(float x_14){const float e0=0.0;const vec4 v0=vec4(0.49019607843137253,0,0.7019607843137254,1);const float e1=0.1;const vec4 v1=vec4(0.7803921568627451,0,0.7058823529411765,1);const float e2=0.2;const vec4 v2=vec4(1,0,0.4745098039215686,1);const float e3=0.3;const vec4 v3=vec4(1,0.4235294117647059,0,1);const float e4=0.4;const vec4 v4=vec4(0.8705882352941177,0.7607843137254902,0,1);const float e5=0.5;const vec4 v5=vec4(0.5882352941176471,1,0,1);const float e6=0.6;const vec4 v6=vec4(0,1,0.21568627450980393,1);const float e7=0.7;const vec4 v7=vec4(0,0.9647058823529412,0.5882352941176471,1);const float e8=0.8;const vec4 v8=vec4(0.19607843137254902,0.6549019607843137,0.8705882352941177,1);const float e9=0.9;const vec4 v9=vec4(0.403921568627451,0.2,0.9215686274509803,1);const float e10=1.0;const vec4 v10=vec4(0.48627450980392156,0,0.7294117647058823,1);float a0=smoothstep(e0,e1,x_14);float a1=smoothstep(e1,e2,x_14);float a2=smoothstep(e2,e3,x_14);float a3=smoothstep(e3,e4,x_14);float a4=smoothstep(e4,e5,x_14);float a5=smoothstep(e5,e6,x_14);float a6=smoothstep(e6,e7,x_14);float a7=smoothstep(e7,e8,x_14);float a8=smoothstep(e8,e9,x_14);float a9=smoothstep(e9,e10,x_14);return max(mix(v0,v1,a0)*step(e0,x_14)*step(x_14,e1),max(mix(v1,v2,a1)*step(e1,x_14)*step(x_14,e2),max(mix(v2,v3,a2)*step(e2,x_14)*step(x_14,e3),max(mix(v3,v4,a3)*step(e3,x_14)*step(x_14,e4),max(mix(v4,v5,a4)*step(e4,x_14)*step(x_14,e5),max(mix(v5,v6,a5)*step(e5,x_14)*step(x_14,e6),max(mix(v6,v7,a6)*step(e6,x_14)*step(x_14,e7),max(mix(v7,v8,a7)*step(e7,x_14)*step(x_14,e8),max(mix(v8,v9,a8)*step(e8,x_14)*step(x_14,e9),mix(v9,v10,a9)*step(e9,x_14)*step(x_14,e10))))))))));}vec4 bathymetry(float x_36){const float e0=0.0;const vec4 v0=vec4(0.1568627450980392,0.10196078431372549,0.17254901960784313,1);const float e1=0.13;const vec4 v1=vec4(0.23137254901960785,0.19215686274509805,0.35294117647058826,1);const float e2=0.25;const vec4 v2=vec4(0.25098039215686274,0.2980392156862745,0.5450980392156862,1);const float e3=0.38;const vec4 v3=vec4(0.24705882352941178,0.43137254901960786,0.592156862745098,1);const float e4=0.5;const vec4 v4=vec4(0.2823529411764706,0.5568627450980392,0.6196078431372549,1);const float e5=0.63;const vec4 v5=vec4(0.3333333333333333,0.6823529411764706,0.6392156862745098,1);const float e6=0.75;const vec4 v6=vec4(0.47058823529411764,0.807843137254902,0.6392156862745098,1);const float e7=0.88;const vec4 v7=vec4(0.7333333333333333,0.9019607843137255,0.6745098039215687,1);const float e8=1.0;const vec4 v8=vec4(0.9921568627450981,0.996078431372549,0.8,1);float a0=smoothstep(e0,e1,x_36);float a1=smoothstep(e1,e2,x_36);float a2=smoothstep(e2,e3,x_36);float a3=smoothstep(e3,e4,x_36);float a4=smoothstep(e4,e5,x_36);float a5=smoothstep(e5,e6,x_36);float a6=smoothstep(e6,e7,x_36);float a7=smoothstep(e7,e8,x_36);return max(mix(v0,v1,a0)*step(e0,x_36)*step(x_36,e1),max(mix(v1,v2,a1)*step(e1,x_36)*step(x_36,e2),max(mix(v2,v3,a2)*step(e2,x_36)*step(x_36,e3),max(mix(v3,v4,a3)*step(e3,x_36)*step(x_36,e4),max(mix(v4,v5,a4)*step(e4,x_36)*step(x_36,e5),max(mix(v5,v6,a5)*step(e5,x_36)*step(x_36,e6),max(mix(v6,v7,a6)*step(e6,x_36)*step(x_36,e7),mix(v7,v8,a7)*step(e7,x_36)*step(x_36,e8))))))));}vec4 cdom(float x_7){const float e0=0.0;const vec4 v0=vec4(0.1843137254901961,0.058823529411764705,0.24313725490196078,1);const float e1=0.13;const vec4 v1=vec4(0.3411764705882353,0.09019607843137255,0.33725490196078434,1);const float e2=0.25;const vec4 v2=vec4(0.5098039215686274,0.10980392156862745,0.38823529411764707,1);const float e3=0.38;const vec4 v3=vec4(0.6705882352941176,0.1607843137254902,0.3764705882352941,1);const float e4=0.5;const vec4 v4=vec4(0.807843137254902,0.2627450980392157,0.33725490196078434,1);const float e5=0.63;const vec4 v5=vec4(0.9019607843137255,0.41568627450980394,0.32941176470588235,1);const float e6=0.75;const vec4 v6=vec4(0.9490196078431372,0.5843137254901961,0.403921568627451,1);const float e7=0.88;const vec4 v7=vec4(0.9764705882352941,0.7568627450980392,0.5294117647058824,1);const float e8=1.0;const vec4 v8=vec4(0.996078431372549,0.9294117647058824,0.6901960784313725,1);float a0=smoothstep(e0,e1,x_7);float a1=smoothstep(e1,e2,x_7);float a2=smoothstep(e2,e3,x_7);float a3=smoothstep(e3,e4,x_7);float a4=smoothstep(e4,e5,x_7);float a5=smoothstep(e5,e6,x_7);float a6=smoothstep(e6,e7,x_7);float a7=smoothstep(e7,e8,x_7);return max(mix(v0,v1,a0)*step(e0,x_7)*step(x_7,e1),max(mix(v1,v2,a1)*step(e1,x_7)*step(x_7,e2),max(mix(v2,v3,a2)*step(e2,x_7)*step(x_7,e3),max(mix(v3,v4,a3)*step(e3,x_7)*step(x_7,e4),max(mix(v4,v5,a4)*step(e4,x_7)*step(x_7,e5),max(mix(v5,v6,a5)*step(e5,x_7)*step(x_7,e6),max(mix(v6,v7,a6)*step(e6,x_7)*step(x_7,e7),mix(v7,v8,a7)*step(e7,x_7)*step(x_7,e8))))))));}vec4 chlorophyll(float x_6){const float e0=0.0;const vec4 v0=vec4(0.07058823529411765,0.1411764705882353,0.0784313725490196,1);const float e1=0.13;const vec4 v1=vec4(0.09803921568627451,0.24705882352941178,0.1607843137254902,1);const float e2=0.25;const vec4 v2=vec4(0.09411764705882353,0.3568627450980392,0.23137254901960785,1);const float e3=0.38;const vec4 v3=vec4(0.050980392156862744,0.4666666666666667,0.2823529411764706,1);const float e4=0.5;const vec4 v4=vec4(0.07058823529411765,0.5803921568627451,0.3137254901960784,1);const float e5=0.63;const vec4 v5=vec4(0.3137254901960784,0.6784313725490196,0.34901960784313724,1);const float e6=0.75;const vec4 v6=vec4(0.5176470588235295,0.7686274509803922,0.47843137254901963,1);const float e7=0.88;const vec4 v7=vec4(0.6862745098039216,0.8666666666666667,0.6352941176470588,1);const float e8=1.0;const vec4 v8=vec4(0.8431372549019608,0.9764705882352941,0.8156862745098039,1);float a0=smoothstep(e0,e1,x_6);float a1=smoothstep(e1,e2,x_6);float a2=smoothstep(e2,e3,x_6);float a3=smoothstep(e3,e4,x_6);float a4=smoothstep(e4,e5,x_6);float a5=smoothstep(e5,e6,x_6);float a6=smoothstep(e6,e7,x_6);float a7=smoothstep(e7,e8,x_6);return max(mix(v0,v1,a0)*step(e0,x_6)*step(x_6,e1),max(mix(v1,v2,a1)*step(e1,x_6)*step(x_6,e2),max(mix(v2,v3,a2)*step(e2,x_6)*step(x_6,e3),max(mix(v3,v4,a3)*step(e3,x_6)*step(x_6,e4),max(mix(v4,v5,a4)*step(e4,x_6)*step(x_6,e5),max(mix(v5,v6,a5)*step(e5,x_6)*step(x_6,e6),max(mix(v6,v7,a6)*step(e6,x_6)*step(x_6,e7),mix(v7,v8,a7)*step(e7,x_6)*step(x_6,e8))))))));}vec4 density(float x_19){const float e0=0.0;const vec4 v0=vec4(0.21176470588235294,0.054901960784313725,0.1411764705882353,1);const float e1=0.13;const vec4 v1=vec4(0.34901960784313724,0.09019607843137255,0.3137254901960784,1);const float e2=0.25;const vec4 v2=vec4(0.43137254901960786,0.17647058823529413,0.5176470588235295,1);const float e3=0.38;const vec4 v3=vec4(0.47058823529411764,0.30196078431372547,0.6980392156862745,1);const float e4=0.5;const vec4 v4=vec4(0.47058823529411764,0.44313725490196076,0.8352941176470589,1);const float e5=0.63;const vec4 v5=vec4(0.45098039215686275,0.592156862745098,0.8941176470588236,1);const float e6=0.75;const vec4 v6=vec4(0.5254901960784314,0.7254901960784313,0.8901960784313725,1);const float e7=0.88;const vec4 v7=vec4(0.6941176470588235,0.8392156862745098,0.8901960784313725,1);const float e8=1.0;const vec4 v8=vec4(0.9019607843137255,0.9450980392156862,0.9450980392156862,1);float a0=smoothstep(e0,e1,x_19);float a1=smoothstep(e1,e2,x_19);float a2=smoothstep(e2,e3,x_19);float a3=smoothstep(e3,e4,x_19);float a4=smoothstep(e4,e5,x_19);float a5=smoothstep(e5,e6,x_19);float a6=smoothstep(e6,e7,x_19);float a7=smoothstep(e7,e8,x_19);return max(mix(v0,v1,a0)*step(e0,x_19)*step(x_19,e1),max(mix(v1,v2,a1)*step(e1,x_19)*step(x_19,e2),max(mix(v2,v3,a2)*step(e2,x_19)*step(x_19,e3),max(mix(v3,v4,a3)*step(e3,x_19)*step(x_19,e4),max(mix(v4,v5,a4)*step(e4,x_19)*step(x_19,e5),max(mix(v5,v6,a5)*step(e5,x_19)*step(x_19,e6),max(mix(v6,v7,a6)*step(e6,x_19)*step(x_19,e7),mix(v7,v8,a7)*step(e7,x_19)*step(x_19,e8))))))));}vec4 freesurface_blue_3154355989(float x_35){const float e0=0.0;const vec4 v0=vec4(0.11764705882352941,0.01568627450980392,0.43137254901960786,1);const float e1=0.13;const vec4 v1=vec4(0.1843137254901961,0.054901960784313725,0.6901960784313725,1);const float e2=0.25;const vec4 v2=vec4(0.1607843137254902,0.17647058823529413,0.9254901960784314,1);const float e3=0.38;const vec4 v3=vec4(0.09803921568627451,0.38823529411764707,0.8313725490196079,1);const float e4=0.5;const vec4 v4=vec4(0.26666666666666666,0.5137254901960784,0.7843137254901961,1);const float e5=0.63;const vec4 v5=vec4(0.4470588235294118,0.611764705882353,0.7725490196078432,1);const float e6=0.75;const vec4 v6=vec4(0.615686274509804,0.7098039215686275,0.796078431372549,1);const float e7=0.88;const vec4 v7=vec4(0.7843137254901961,0.8156862745098039,0.8470588235294118,1);const float e8=1.0;const vec4 v8=vec4(0.9450980392156862,0.9294117647058824,0.9254901960784314,1);float a0=smoothstep(e0,e1,x_35);float a1=smoothstep(e1,e2,x_35);float a2=smoothstep(e2,e3,x_35);float a3=smoothstep(e3,e4,x_35);float a4=smoothstep(e4,e5,x_35);float a5=smoothstep(e5,e6,x_35);float a6=smoothstep(e6,e7,x_35);float a7=smoothstep(e7,e8,x_35);return max(mix(v0,v1,a0)*step(e0,x_35)*step(x_35,e1),max(mix(v1,v2,a1)*step(e1,x_35)*step(x_35,e2),max(mix(v2,v3,a2)*step(e2,x_35)*step(x_35,e3),max(mix(v3,v4,a3)*step(e3,x_35)*step(x_35,e4),max(mix(v4,v5,a4)*step(e4,x_35)*step(x_35,e5),max(mix(v5,v6,a5)*step(e5,x_35)*step(x_35,e6),max(mix(v6,v7,a6)*step(e6,x_35)*step(x_35,e7),mix(v7,v8,a7)*step(e7,x_35)*step(x_35,e8))))))));}vec4 freesurface_red_1679163293(float x_20){const float e0=0.0;const vec4 v0=vec4(0.23529411764705882,0.03529411764705882,0.07058823529411765,1);const float e1=0.13;const vec4 v1=vec4(0.39215686274509803,0.06666666666666667,0.10588235294117647,1);const float e2=0.25;const vec4 v2=vec4(0.5568627450980392,0.0784313725490196,0.11372549019607843,1);const float e3=0.38;const vec4 v3=vec4(0.6941176470588235,0.16862745098039217,0.10588235294117647,1);const float e4=0.5;const vec4 v4=vec4(0.7529411764705882,0.3411764705882353,0.24705882352941178,1);const float e5=0.63;const vec4 v5=vec4(0.803921568627451,0.49019607843137253,0.4117647058823529,1);const float e6=0.75;const vec4 v6=vec4(0.8470588235294118,0.6352941176470588,0.5803921568627451,1);const float e7=0.88;const vec4 v7=vec4(0.8901960784313725,0.7803921568627451,0.7568627450980392,1);const float e8=1.0;const vec4 v8=vec4(0.9450980392156862,0.9294117647058824,0.9254901960784314,1);float a0=smoothstep(e0,e1,x_20);float a1=smoothstep(e1,e2,x_20);float a2=smoothstep(e2,e3,x_20);float a3=smoothstep(e3,e4,x_20);float a4=smoothstep(e4,e5,x_20);float a5=smoothstep(e5,e6,x_20);float a6=smoothstep(e6,e7,x_20);float a7=smoothstep(e7,e8,x_20);return max(mix(v0,v1,a0)*step(e0,x_20)*step(x_20,e1),max(mix(v1,v2,a1)*step(e1,x_20)*step(x_20,e2),max(mix(v2,v3,a2)*step(e2,x_20)*step(x_20,e3),max(mix(v3,v4,a3)*step(e3,x_20)*step(x_20,e4),max(mix(v4,v5,a4)*step(e4,x_20)*step(x_20,e5),max(mix(v5,v6,a5)*step(e5,x_20)*step(x_20,e6),max(mix(v6,v7,a6)*step(e6,x_20)*step(x_20,e7),mix(v7,v8,a7)*step(e7,x_20)*step(x_20,e8))))))));}vec4 oxygen(float x_11){const float e0=0.0;const vec4 v0=vec4(0.25098039215686274,0.0196078431372549,0.0196078431372549,1);const float e1=0.13;const vec4 v1=vec4(0.41568627450980394,0.023529411764705882,0.058823529411764705,1);const float e2=0.25;const vec4 v2=vec4(0.5647058823529412,0.10196078431372549,0.027450980392156862,1);const float e3=0.38;const vec4 v3=vec4(0.6588235294117647,0.25098039215686274,0.011764705882352941,1);const float e4=0.5;const vec4 v4=vec4(0.7372549019607844,0.39215686274509803,0.01568627450980392,1);const float e5=0.63;const vec4 v5=vec4(0.807843137254902,0.5333333333333333,0.043137254901960784,1);const float e6=0.75;const vec4 v6=vec4(0.8627450980392157,0.6823529411764706,0.09803921568627451,1);const float e7=0.88;const vec4 v7=vec4(0.9058823529411765,0.8431372549019608,0.17254901960784313,1);const float e8=1.0;const vec4 v8=vec4(0.9725490196078431,0.996078431372549,0.4117647058823529,1);float a0=smoothstep(e0,e1,x_11);float a1=smoothstep(e1,e2,x_11);float a2=smoothstep(e2,e3,x_11);float a3=smoothstep(e3,e4,x_11);float a4=smoothstep(e4,e5,x_11);float a5=smoothstep(e5,e6,x_11);float a6=smoothstep(e6,e7,x_11);float a7=smoothstep(e7,e8,x_11);return max(mix(v0,v1,a0)*step(e0,x_11)*step(x_11,e1),max(mix(v1,v2,a1)*step(e1,x_11)*step(x_11,e2),max(mix(v2,v3,a2)*step(e2,x_11)*step(x_11,e3),max(mix(v3,v4,a3)*step(e3,x_11)*step(x_11,e4),max(mix(v4,v5,a4)*step(e4,x_11)*step(x_11,e5),max(mix(v5,v6,a5)*step(e5,x_11)*step(x_11,e6),max(mix(v6,v7,a6)*step(e6,x_11)*step(x_11,e7),mix(v7,v8,a7)*step(e7,x_11)*step(x_11,e8))))))));}vec4 par(float x_28){const float e0=0.0;const vec4 v0=vec4(0.2,0.0784313725490196,0.09411764705882353,1);const float e1=0.13;const vec4 v1=vec4(0.35294117647058826,0.12549019607843137,0.13725490196078433,1);const float e2=0.25;const vec4 v2=vec4(0.5058823529411764,0.17254901960784313,0.13333333333333333,1);const float e3=0.38;const vec4 v3=vec4(0.6235294117647059,0.26666666666666666,0.09803921568627451,1);const float e4=0.5;const vec4 v4=vec4(0.7137254901960784,0.38823529411764707,0.07450980392156863,1);const float e5=0.63;const vec4 v5=vec4(0.7803921568627451,0.5254901960784314,0.08627450980392157,1);const float e6=0.75;const vec4 v6=vec4(0.8313725490196079,0.6705882352941176,0.13725490196078433,1);const float e7=0.88;const vec4 v7=vec4(0.8666666666666667,0.8235294117647058,0.21176470588235294,1);const float e8=1.0;const vec4 v8=vec4(0.8823529411764706,0.9921568627450981,0.29411764705882354,1);float a0=smoothstep(e0,e1,x_28);float a1=smoothstep(e1,e2,x_28);float a2=smoothstep(e2,e3,x_28);float a3=smoothstep(e3,e4,x_28);float a4=smoothstep(e4,e5,x_28);float a5=smoothstep(e5,e6,x_28);float a6=smoothstep(e6,e7,x_28);float a7=smoothstep(e7,e8,x_28);return max(mix(v0,v1,a0)*step(e0,x_28)*step(x_28,e1),max(mix(v1,v2,a1)*step(e1,x_28)*step(x_28,e2),max(mix(v2,v3,a2)*step(e2,x_28)*step(x_28,e3),max(mix(v3,v4,a3)*step(e3,x_28)*step(x_28,e4),max(mix(v4,v5,a4)*step(e4,x_28)*step(x_28,e5),max(mix(v5,v6,a5)*step(e5,x_28)*step(x_28,e6),max(mix(v6,v7,a6)*step(e6,x_28)*step(x_28,e7),mix(v7,v8,a7)*step(e7,x_28)*step(x_28,e8))))))));}vec4 phase(float x_39){const float e0=0.0;const vec4 v0=vec4(0.5686274509803921,0.4117647058823529,0.07058823529411765,1);const float e1=0.13;const vec4 v1=vec4(0.7215686274509804,0.2784313725490196,0.14901960784313725,1);const float e2=0.25;const vec4 v2=vec4(0.7294117647058823,0.22745098039215686,0.45098039215686275,1);const float e3=0.38;const vec4 v3=vec4(0.6274509803921569,0.2784313725490196,0.7254901960784313,1);const float e4=0.5;const vec4 v4=vec4(0.43137254901960786,0.3803921568627451,0.8549019607843137,1);const float e5=0.63;const vec4 v5=vec4(0.19607843137254902,0.4823529411764706,0.6431372549019608,1);const float e6=0.75;const vec4 v6=vec4(0.12156862745098039,0.5137254901960784,0.43137254901960786,1);const float e7=0.88;const vec4 v7=vec4(0.30196078431372547,0.5058823529411764,0.13333333333333333,1);const float e8=1.0;const vec4 v8=vec4(0.5686274509803921,0.4117647058823529,0.07058823529411765,1);float a0=smoothstep(e0,e1,x_39);float a1=smoothstep(e1,e2,x_39);float a2=smoothstep(e2,e3,x_39);float a3=smoothstep(e3,e4,x_39);float a4=smoothstep(e4,e5,x_39);float a5=smoothstep(e5,e6,x_39);float a6=smoothstep(e6,e7,x_39);float a7=smoothstep(e7,e8,x_39);return max(mix(v0,v1,a0)*step(e0,x_39)*step(x_39,e1),max(mix(v1,v2,a1)*step(e1,x_39)*step(x_39,e2),max(mix(v2,v3,a2)*step(e2,x_39)*step(x_39,e3),max(mix(v3,v4,a3)*step(e3,x_39)*step(x_39,e4),max(mix(v4,v5,a4)*step(e4,x_39)*step(x_39,e5),max(mix(v5,v6,a5)*step(e5,x_39)*step(x_39,e6),max(mix(v6,v7,a6)*step(e6,x_39)*step(x_39,e7),mix(v7,v8,a7)*step(e7,x_39)*step(x_39,e8))))))));}vec4 salinity(float x_26){const float e0=0.0;const vec4 v0=vec4(0.16470588235294117,0.09411764705882353,0.4235294117647059,1);const float e1=0.13;const vec4 v1=vec4(0.12941176470588237,0.19607843137254902,0.6352941176470588,1);const float e2=0.25;const vec4 v2=vec4(0.058823529411764705,0.35294117647058826,0.5686274509803921,1);const float e3=0.38;const vec4 v3=vec4(0.1568627450980392,0.4627450980392157,0.5372549019607843,1);const float e4=0.5;const vec4 v4=vec4(0.23137254901960785,0.5725490196078431,0.5294117647058824,1);const float e5=0.63;const vec4 v5=vec4(0.30980392156862746,0.6862745098039216,0.49411764705882355,1);const float e6=0.75;const vec4 v6=vec4(0.47058823529411764,0.796078431372549,0.40784313725490196,1);const float e7=0.88;const vec4 v7=vec4(0.7568627450980392,0.8666666666666667,0.39215686274509803,1);const float e8=1.0;const vec4 v8=vec4(0.9921568627450981,0.9372549019607843,0.6039215686274509,1);float a0=smoothstep(e0,e1,x_26);float a1=smoothstep(e1,e2,x_26);float a2=smoothstep(e2,e3,x_26);float a3=smoothstep(e3,e4,x_26);float a4=smoothstep(e4,e5,x_26);float a5=smoothstep(e5,e6,x_26);float a6=smoothstep(e6,e7,x_26);float a7=smoothstep(e7,e8,x_26);return max(mix(v0,v1,a0)*step(e0,x_26)*step(x_26,e1),max(mix(v1,v2,a1)*step(e1,x_26)*step(x_26,e2),max(mix(v2,v3,a2)*step(e2,x_26)*step(x_26,e3),max(mix(v3,v4,a3)*step(e3,x_26)*step(x_26,e4),max(mix(v4,v5,a4)*step(e4,x_26)*step(x_26,e5),max(mix(v5,v6,a5)*step(e5,x_26)*step(x_26,e6),max(mix(v6,v7,a6)*step(e6,x_26)*step(x_26,e7),mix(v7,v8,a7)*step(e7,x_26)*step(x_26,e8))))))));}vec4 temperature(float x_8){const float e0=0.0;const vec4 v0=vec4(0.01568627450980392,0.13725490196078433,0.2,1);const float e1=0.13;const vec4 v1=vec4(0.09019607843137255,0.2,0.47843137254901963,1);const float e2=0.25;const vec4 v2=vec4(0.3333333333333333,0.23137254901960785,0.615686274509804,1);const float e3=0.38;const vec4 v3=vec4(0.5058823529411764,0.30980392156862746,0.5607843137254902,1);const float e4=0.5;const vec4 v4=vec4(0.6862745098039216,0.37254901960784315,0.5098039215686274,1);const float e5=0.63;const vec4 v5=vec4(0.8705882352941177,0.4392156862745098,0.396078431372549,1);const float e6=0.75;const vec4 v6=vec4(0.9764705882352941,0.5725490196078431,0.25882352941176473,1);const float e7=0.88;const vec4 v7=vec4(0.9764705882352941,0.7686274509803922,0.2549019607843137,1);const float e8=1.0;const vec4 v8=vec4(0.9098039215686274,0.9803921568627451,0.3568627450980392,1);float a0=smoothstep(e0,e1,x_8);float a1=smoothstep(e1,e2,x_8);float a2=smoothstep(e2,e3,x_8);float a3=smoothstep(e3,e4,x_8);float a4=smoothstep(e4,e5,x_8);float a5=smoothstep(e5,e6,x_8);float a6=smoothstep(e6,e7,x_8);float a7=smoothstep(e7,e8,x_8);return max(mix(v0,v1,a0)*step(e0,x_8)*step(x_8,e1),max(mix(v1,v2,a1)*step(e1,x_8)*step(x_8,e2),max(mix(v2,v3,a2)*step(e2,x_8)*step(x_8,e3),max(mix(v3,v4,a3)*step(e3,x_8)*step(x_8,e4),max(mix(v4,v5,a4)*step(e4,x_8)*step(x_8,e5),max(mix(v5,v6,a5)*step(e5,x_8)*step(x_8,e6),max(mix(v6,v7,a6)*step(e6,x_8)*step(x_8,e7),mix(v7,v8,a7)*step(e7,x_8)*step(x_8,e8))))))));}vec4 turbidity(float x_40){const float e0=0.0;const vec4 v0=vec4(0.13333333333333333,0.12156862745098039,0.10588235294117647,1);const float e1=0.13;const vec4 v1=vec4(0.2549019607843137,0.19607843137254902,0.1607843137254902,1);const float e2=0.25;const vec4 v2=vec4(0.3843137254901961,0.27058823529411763,0.20392156862745098,1);const float e3=0.38;const vec4 v3=vec4(0.5137254901960784,0.34901960784313724,0.2235294117647059,1);const float e4=0.5;const vec4 v4=vec4(0.6313725490196078,0.4392156862745098,0.23137254901960785,1);const float e5=0.63;const vec4 v5=vec4(0.7254901960784313,0.5490196078431373,0.25882352941176473,1);const float e6=0.75;const vec4 v6=vec4(0.792156862745098,0.6823529411764706,0.34509803921568627,1);const float e7=0.88;const vec4 v7=vec4(0.8470588235294118,0.8196078431372549,0.49411764705882355,1);const float e8=1.0;const vec4 v8=vec4(0.9137254901960784,0.9647058823529412,0.6705882352941176,1);float a0=smoothstep(e0,e1,x_40);float a1=smoothstep(e1,e2,x_40);float a2=smoothstep(e2,e3,x_40);float a3=smoothstep(e3,e4,x_40);float a4=smoothstep(e4,e5,x_40);float a5=smoothstep(e5,e6,x_40);float a6=smoothstep(e6,e7,x_40);float a7=smoothstep(e7,e8,x_40);return max(mix(v0,v1,a0)*step(e0,x_40)*step(x_40,e1),max(mix(v1,v2,a1)*step(e1,x_40)*step(x_40,e2),max(mix(v2,v3,a2)*step(e2,x_40)*step(x_40,e3),max(mix(v3,v4,a3)*step(e3,x_40)*step(x_40,e4),max(mix(v4,v5,a4)*step(e4,x_40)*step(x_40,e5),max(mix(v5,v6,a5)*step(e5,x_40)*step(x_40,e6),max(mix(v6,v7,a6)*step(e6,x_40)*step(x_40,e7),mix(v7,v8,a7)*step(e7,x_40)*step(x_40,e8))))))));}vec4 velocity_blue_297387650(float x_2){const float e0=0.0;const vec4 v0=vec4(0.06666666666666667,0.12549019607843137,0.25098039215686274,1);const float e1=0.13;const vec4 v1=vec4(0.13725490196078433,0.20392156862745098,0.4549019607843137,1);const float e2=0.25;const vec4 v2=vec4(0.11372549019607843,0.3176470588235294,0.611764705882353,1);const float e3=0.38;const vec4 v3=vec4(0.12156862745098039,0.44313725490196076,0.6352941176470588,1);const float e4=0.5;const vec4 v4=vec4(0.19607843137254902,0.5647058823529412,0.6627450980392157,1);const float e5=0.63;const vec4 v5=vec4(0.3411764705882353,0.6784313725490196,0.6901960784313725,1);const float e6=0.75;const vec4 v6=vec4(0.5843137254901961,0.7686274509803922,0.7411764705882353,1);const float e7=0.88;const vec4 v7=vec4(0.796078431372549,0.8666666666666667,0.8274509803921568,1);const float e8=1.0;const vec4 v8=vec4(0.996078431372549,0.984313725490196,0.9019607843137255,1);float a0=smoothstep(e0,e1,x_2);float a1=smoothstep(e1,e2,x_2);float a2=smoothstep(e2,e3,x_2);float a3=smoothstep(e3,e4,x_2);float a4=smoothstep(e4,e5,x_2);float a5=smoothstep(e5,e6,x_2);float a6=smoothstep(e6,e7,x_2);float a7=smoothstep(e7,e8,x_2);return max(mix(v0,v1,a0)*step(e0,x_2)*step(x_2,e1),max(mix(v1,v2,a1)*step(e1,x_2)*step(x_2,e2),max(mix(v2,v3,a2)*step(e2,x_2)*step(x_2,e3),max(mix(v3,v4,a3)*step(e3,x_2)*step(x_2,e4),max(mix(v4,v5,a4)*step(e4,x_2)*step(x_2,e5),max(mix(v5,v6,a5)*step(e5,x_2)*step(x_2,e6),max(mix(v6,v7,a6)*step(e6,x_2)*step(x_2,e7),mix(v7,v8,a7)*step(e7,x_2)*step(x_2,e8))))))));}vec4 velocity_green_2558432129(float x_27){const float e0=0.0;const vec4 v0=vec4(0.09019607843137255,0.13725490196078433,0.07450980392156863,1);const float e1=0.13;const vec4 v1=vec4(0.09411764705882353,0.25098039215686274,0.14901960784313725,1);const float e2=0.25;const vec4 v2=vec4(0.043137254901960784,0.37254901960784315,0.17647058823529413,1);const float e3=0.38;const vec4 v3=vec4(0.15294117647058825,0.4823529411764706,0.13725490196078433,1);const float e4=0.5;const vec4 v4=vec4(0.37254901960784315,0.5725490196078431,0.047058823529411764,1);const float e5=0.63;const vec4 v5=vec4(0.596078431372549,0.6470588235294118,0.07058823529411765,1);const float e6=0.75;const vec4 v6=vec4(0.788235294117647,0.7294117647058823,0.27058823529411763,1);const float e7=0.88;const vec4 v7=vec4(0.9137254901960784,0.8470588235294118,0.5372549019607843,1);const float e8=1.0;const vec4 v8=vec4(1,0.9921568627450981,0.803921568627451,1);float a0=smoothstep(e0,e1,x_27);float a1=smoothstep(e1,e2,x_27);float a2=smoothstep(e2,e3,x_27);float a3=smoothstep(e3,e4,x_27);float a4=smoothstep(e4,e5,x_27);float a5=smoothstep(e5,e6,x_27);float a6=smoothstep(e6,e7,x_27);float a7=smoothstep(e7,e8,x_27);return max(mix(v0,v1,a0)*step(e0,x_27)*step(x_27,e1),max(mix(v1,v2,a1)*step(e1,x_27)*step(x_27,e2),max(mix(v2,v3,a2)*step(e2,x_27)*step(x_27,e3),max(mix(v3,v4,a3)*step(e3,x_27)*step(x_27,e4),max(mix(v4,v5,a4)*step(e4,x_27)*step(x_27,e5),max(mix(v5,v6,a5)*step(e5,x_27)*step(x_27,e6),max(mix(v6,v7,a6)*step(e6,x_27)*step(x_27,e7),mix(v7,v8,a7)*step(e7,x_27)*step(x_27,e8))))))));}vec4 cubehelix(float x_37){const float e0=0.0;const vec4 v0=vec4(0,0,0,1);const float e1=0.07;const vec4 v1=vec4(0.08627450980392157,0.0196078431372549,0.23137254901960785,1);const float e2=0.13;const vec4 v2=vec4(0.23529411764705882,0.01568627450980392,0.4117647058823529,1);const float e3=0.2;const vec4 v3=vec4(0.42745098039215684,0.00392156862745098,0.5294117647058824,1);const float e4=0.27;const vec4 v4=vec4(0.6313725490196078,0,0.5764705882352941,1);const float e5=0.33;const vec4 v5=vec4(0.8235294117647058,0.00784313725490196,0.5568627450980392,1);const float e6=0.4;const vec4 v6=vec4(0.984313725490196,0.043137254901960784,0.4823529411764706,1);const float e7=0.47;const vec4 v7=vec4(1,0.11372549019607843,0.3803921568627451,1);const float e8=0.53;const vec4 v8=vec4(1,0.21176470588235294,0.27058823529411763,1);const float e9=0.6;const vec4 v9=vec4(1,0.3333333333333333,0.1803921568627451,1);const float e10=0.67;const vec4 v10=vec4(1,0.47058823529411764,0.13333333333333333,1);const float e11=0.73;const vec4 v11=vec4(1,0.615686274509804,0.1450980392156863,1);const float e12=0.8;const vec4 v12=vec4(0.9450980392156862,0.7490196078431373,0.2235294117647059,1);const float e13=0.87;const vec4 v13=vec4(0.8784313725490196,0.8627450980392157,0.36470588235294116,1);const float e14=0.93;const vec4 v14=vec4(0.8549019607843137,0.9450980392156862,0.5568627450980392,1);const float e15=1.0;const vec4 v15=vec4(0.8901960784313725,0.9921568627450981,0.7764705882352941,1);float a0=smoothstep(e0,e1,x_37);float a1=smoothstep(e1,e2,x_37);float a2=smoothstep(e2,e3,x_37);float a3=smoothstep(e3,e4,x_37);float a4=smoothstep(e4,e5,x_37);float a5=smoothstep(e5,e6,x_37);float a6=smoothstep(e6,e7,x_37);float a7=smoothstep(e7,e8,x_37);float a8=smoothstep(e8,e9,x_37);float a9=smoothstep(e9,e10,x_37);float a10=smoothstep(e10,e11,x_37);float a11=smoothstep(e11,e12,x_37);float a12=smoothstep(e12,e13,x_37);float a13=smoothstep(e13,e14,x_37);float a14=smoothstep(e14,e15,x_37);return max(mix(v0,v1,a0)*step(e0,x_37)*step(x_37,e1),max(mix(v1,v2,a1)*step(e1,x_37)*step(x_37,e2),max(mix(v2,v3,a2)*step(e2,x_37)*step(x_37,e3),max(mix(v3,v4,a3)*step(e3,x_37)*step(x_37,e4),max(mix(v4,v5,a4)*step(e4,x_37)*step(x_37,e5),max(mix(v5,v6,a5)*step(e5,x_37)*step(x_37,e6),max(mix(v6,v7,a6)*step(e6,x_37)*step(x_37,e7),max(mix(v7,v8,a7)*step(e7,x_37)*step(x_37,e8),max(mix(v8,v9,a8)*step(e8,x_37)*step(x_37,e9),max(mix(v9,v10,a9)*step(e9,x_37)*step(x_37,e10),max(mix(v10,v11,a10)*step(e10,x_37)*step(x_37,e11),max(mix(v11,v12,a11)*step(e11,x_37)*step(x_37,e12),max(mix(v12,v13,a12)*step(e12,x_37)*step(x_37,e13),max(mix(v13,v14,a13)*step(e13,x_37)*step(x_37,e14),mix(v14,v15,a14)*step(e14,x_37)*step(x_37,e15)))))))))))))));}vec3 hsv_to_rgb(vec3 c){vec4 K=vec4(1.0,2.0/3.0,1.0/3.0,3.0);vec3 p=abs(fract(c.xxx+K.xyz)*6.0-K.www);return c.z*mix(K.xxx,clamp(p-K.xxx,0.0,1.0),c.y);}vec3 rgb_to_hsv(vec3 rgb){float Cmax=max(rgb.r,max(rgb.g,rgb.b));float Cmin=min(rgb.r,min(rgb.g,rgb.b));float delta=Cmax-Cmin;vec3 hsv=vec3(0.,0.,Cmax);if(Cmax>Cmin){hsv.y=delta/Cmax;if(rgb.r==Cmax){hsv.x=(rgb.g-rgb.b)/delta;}else{if(rgb.g==Cmax){hsv.x=2.+(rgb.b-rgb.r)/delta;}else{hsv.x=4.+(rgb.r-rgb.g)/delta;}}hsv.x=fract(hsv.x/6.);}return hsv;}float sample_and_apply_sliders(SAMPLER_TYPE channel,vec2 vTexCoord,vec2 sliderValues){float fragIntensity=float(texture(channel,vTexCoord).r);float slidersAppliedToIntensity=(fragIntensity-sliderValues[0])/max(0.0005,(sliderValues[1]-sliderValues[0]));return max(0.0,slidersAppliedToIntensity);}vec3 process_channel_intensity(float intensity,vec3 colorValues,int channelIndex,bool inLensAndUseLens,int lensSelection){float useColorValue=float(int((inLensAndUseLens&&channelIndex==lensSelection)||(!inLensAndUseLens)));vec3 hsvCombo=rgb_to_hsv(max(vec3(colorValues),(1.0-useColorValue)*vec3(255,255,255)));hsvCombo=vec3(hsvCombo.xy,max(0.0,intensity));return hsv_to_rgb(hsvCombo);}vec4 colormap(float intensity,float opacity){return vec4(COLORMAP_FUNCTION(min(1.0,intensity)).xyz,opacity);}"; // eslint-disable-line

var channels = {
  name: 'channel-intensity-module',
  defines: {
    SAMPLER_TYPE: 'usampler2D',
    COLORMAP_FUNCTION: ''
  },
  fs: fs$4
};

var fs$1$1 = "#define GLSLIFY 1\nbool frag_in_lens_bounds(vec2 lensCenter,vec2 vTexCoord,float majorLensAxis,float minorLensAxis,float lensBorderRadius){return pow((lensCenter.x-vTexCoord.x)/majorLensAxis,2.0)+pow((lensCenter.y-vTexCoord.y)/minorLensAxis,2.0)<(1.0-lensBorderRadius);}bool frag_on_lens_bounds(vec2 lensCenter,vec2 vTexCoord,float majorLensAxis,float minorLensAxis,float lensBorderRadius){float ellipseDistance=pow((lensCenter.x-vTexCoord.x)/majorLensAxis,2.0)+pow((lensCenter.y-vTexCoord.y)/minorLensAxis,2.0);return ellipseDistance<=1.0&&ellipseDistance>=(1.0-lensBorderRadius);}"; // eslint-disable-line

var lens = {
  name: 'lens-module',
  defines: {
    SAMPLER_TYPE: 'usampler2D'
  },
  fs: fs$1$1
};

const MAX_COLOR_INTENSITY = 255;

const DEFAULT_COLOR_OFF = [0, 0, 0];

const MAX_SLIDERS_AND_CHANNELS = 6;

const DTYPE_VALUES = {
  '<u1': {
    format: GL.R8UI,
    dataFormat: GL.RED_INTEGER,
    type: GL.UNSIGNED_BYTE,
    max: 2 ** 8 - 1,
    TypedArray: Uint8Array
  },
  '<u2': {
    format: GL.R16UI,
    dataFormat: GL.RED_INTEGER,
    type: GL.UNSIGNED_SHORT,
    max: 2 ** 16 - 1,
    TypedArray: Uint16Array
  },
  '<u4': {
    format: GL.R32UI,
    dataFormat: GL.RED_INTEGER,
    type: GL.UNSIGNED_INT,
    max: 2 ** 32 - 1,
    TypedArray: Uint32Array
  },
  '<f4': {
    format: GL.R32F,
    dataFormat: GL.RED,
    type: GL.FLOAT,
    // Not sure what to do about this one - a good use case for channel stats, I suppose:
    // https://en.wikipedia.org/wiki/Single-precision_floating-point_format.
    max: 3.4 * 10 ** 38,
    TypedArray: Float32Array
  }
};

function padWithDefault(arr, defaultValue, padWidth) {
  for (let i = 0; i < padWidth; i += 1) {
    arr.push(defaultValue);
  }
  return arr;
}

function padColorsAndSliders({
  sliderValues,
  colorValues,
  channelIsOn,
  domain,
  dtype
}) {
  const lengths = [sliderValues.length, colorValues.length];
  if (lengths.every(l => l !== lengths[0])) {
    throw Error('Inconsistent number of slider values and colors provided');
  }

  const colors = colorValues.map((color, i) =>
    channelIsOn[i] ? color.map(c => c / MAX_COLOR_INTENSITY) : DEFAULT_COLOR_OFF
  );
  const maxSliderValue = (domain && domain[1]) || DTYPE_VALUES[dtype].max;
  const sliders = sliderValues.map((slider, i) =>
    channelIsOn[i] ? slider : [maxSliderValue, maxSliderValue]
  );
  // Need to pad sliders and colors with default values (required by shader)
  const padSize = MAX_SLIDERS_AND_CHANNELS - colors.length;
  if (padSize < 0) {
    throw Error(`${lengths} channels passed in, but only 6 are allowed.`);
  }

  const paddedColorValues = padWithDefault(colors, DEFAULT_COLOR_OFF, padSize);
  const paddedSliderValues = padWithDefault(
    sliders,
    [maxSliderValue, maxSliderValue],
    padSize
  );
  const paddedColorsAndSliders = {
    paddedSliderValues: paddedSliderValues.reduce(
      (acc, val) => acc.concat(val),
      []
    ), // flatten for use on shaders
    paddedColorValues: paddedColorValues.reduce(
      (acc, val) => acc.concat(val),
      []
    )
  };

  return paddedColorsAndSliders;
}

function to32BitFloat(data) {
  const data32bit = data.map(arr => {
    return new Float32Array(arr);
  });
  return data32bit;
}

function onPointer(layer) {
  const { viewportId, lensRadius } = layer.props;
  // If there is no viewportId, don't try to do anything.
  if (!viewportId) {
    layer.setState({ unprojectLensBounds: [0, 0, 0, 0] });
    return;
  }
  const { mousePosition } = layer.context;
  const layerView = layer.context.deck.viewManager.views.filter(
    view => view.id === viewportId
  )[0];
  const viewState = layer.context.deck.viewManager.viewState[viewportId];
  const viewport = layerView.makeViewport({
    ...viewState,
    viewState
  });
  // If the mouse is in the viewport and the mousePosition exists, set
  // the state with the bounding box of the circle that will render as a lens.
  if (mousePosition && viewport.containsPixel(mousePosition)) {
    const offsetMousePosition = {
      x: mousePosition.x - viewport.x,
      y: mousePosition.y - viewport.y
    };
    const mousePositionBounds = [
      // left
      [offsetMousePosition.x - lensRadius, offsetMousePosition.y],
      // bottom
      [offsetMousePosition.x, offsetMousePosition.y + lensRadius],
      // right
      [offsetMousePosition.x + lensRadius, offsetMousePosition.y],
      // top
      [offsetMousePosition.x, offsetMousePosition.y - lensRadius]
    ];
    // Unproject from screen to world coordinates.
    const unprojectLensBounds = mousePositionBounds.map(
      (bounds, i) => viewport.unproject(bounds)[i % 2]
    );
    layer.setState({ unprojectLensBounds });
  } else {
    layer.setState({ unprojectLensBounds: [0, 0, 0, 0] });
  }
}

function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }/* eslint-disable prefer-destructuring */

const SHADER_MODULES = [
  { fs: fs1, fscmap: fsColormap1, vs: vs1 },
  { fs: fs2, fscmap: fsColormap2, vs: vs2 }
];

function getShaderProps({ colormap, dtype }, gl) {
  const isWebGL1 = !isWebGL2(gl);
  const mod = isWebGL1 ? SHADER_MODULES[0] : SHADER_MODULES[1];
  return {
    fs: colormap ? mod.fscmap : mod.fs,
    vs: mod.vs,
    defines: {
      SAMPLER_TYPE: dtype === '<f4' || isWebGL1 ? 'sampler2D' : 'usampler2D',
      COLORMAP_FUNCTION: colormap || 'viridis'
    },
    modules: [project32, picking, channels, lens]
  };
}

const defaultProps$8 = {
  pickable: true,
  coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
  channelData: { type: 'object', value: {}, compare: true },
  bounds: { type: 'array', value: [0, 0, 1, 1], compare: true },
  colorValues: { type: 'array', value: [], compare: true },
  sliderValues: { type: 'array', value: [], compare: true },
  channelIsOn: { type: 'array', value: [], compare: true },
  opacity: { type: 'number', value: 1, compare: true },
  dtype: { type: 'string', value: '<u2', compare: true },
  colormap: { type: 'string', value: '', compare: true },
  isLensOn: { type: 'boolean', value: false, compare: true },
  lensSelection: { type: 'number', value: 0, compare: true },
  lensBorderColor: { type: 'array', value: [255, 255, 255], compare: true },
  lensBorderRadius: { type: 'number', value: 0.02, compare: true },
  unprojectLensBounds: { type: 'array', value: [0, 0, 0, 0], compare: true }
};

/**
 * This layer serves as the workhorse of the project, handling all the rendering.  Much of it is
 * adapted from BitmapLayer in DeckGL.
 * XR = eXtended Range i.e more than the standard 8-bit RGBA data format
 * (16/32 bit floats/ints/uints with more than 3/4 channels).
 */
class XRLayer extends Layer {
  /**
   * This function chooses a shader (colormapping or not) and
   * replaces `usampler` with `sampler` if the data is not an unsigned integer
   */
  getShaders() {
    const shaderProps = getShaderProps(this.props, this.context.gl);
    return super.getShaders(shaderProps);
  }

  /**
   * This function initializes the internal state.
   */
  initializeState() {
    const { gl } = this.context;
    // This tells WebGL how to read row data from the texture.  For example, the default here is 4 (i.e for RGBA, one byte per channel) so
    // each row of data is expected to be a multiple of 4.  This setting (i.e 1) allows us to have non-multiple-of-4 row sizes.  For example, for 2 byte (16 bit data),
    // we could use 2 as the value and it would still work, but 1 also works fine (and is more flexible for 8 bit - 1 byte - textures as well).
    // https://stackoverflow.com/questions/42789896/webgl-error-arraybuffer-not-big-enough-for-request-in-case-of-gl-luminance
    gl.pixelStorei(GL.UNPACK_ALIGNMENT, 1);
    gl.pixelStorei(GL.PACK_ALIGNMENT, 1);
    const attributeManager = this.getAttributeManager();
    attributeManager.add({
      positions: {
        size: 3,
        type: GL.DOUBLE,
        fp64: this.use64bitPositions(),
        update: this.calculatePositions,
        noAlloc: true
      }
    });
    this.setState({
      numInstances: 1,
      positions: new Float64Array(12)
    });
  }

  /**
   * This function finalizes state by clearing all textures from the WebGL context
   */
  finalizeState() {
    super.finalizeState();

    if (this.state.textures) {
      Object.values(this.state.textures).forEach(tex => tex && tex.delete());
    }
  }

  /**
   * This function updates state by retriggering model creation (shader compilation and attribute binding)
   * and loading any textures that need be loading.
   */
  updateState({ props, oldProps, changeFlags }) {
    // setup model first
    if (changeFlags.extensionsChanged || props.colormap !== oldProps.colormap) {
      const { gl } = this.context;
      if (this.state.model) {
        this.state.model.delete();
      }
      this.setState({ model: this._getModel(gl) });

      this.getAttributeManager().invalidateAll();
    }
    if (
      props.channelData !== oldProps.channelData &&
      _optionalChain([props, 'access', _ => _.channelData, 'optionalAccess', _2 => _2.data]) !== _optionalChain([oldProps, 'access', _3 => _3.channelData, 'optionalAccess', _4 => _4.data])
    ) {
      this.loadChannelTextures(props.channelData);
    }
    const attributeManager = this.getAttributeManager();
    if (props.bounds !== oldProps.bounds) {
      attributeManager.invalidate('positions');
    }
  }

  /**
   * This function creates the luma.gl model.
   */
  _getModel(gl) {
    if (!gl) {
      return null;
    }

    /*
       0,0 --- 1,0
        |       |
       0,1 --- 1,1
     */
    return new Model(gl, {
      ...this.getShaders(),
      id: this.props.id,
      geometry: new Geometry({
        drawMode: GL.TRIANGLE_FAN,
        vertexCount: 4,
        attributes: {
          texCoords: new Float32Array([0, 1, 0, 0, 1, 0, 1, 1])
        }
      }),
      isInstanced: false
    });
  }

  /**
   * This function generates view positions for use as a vec3 in the shader
   */
  calculatePositions(attributes) {
    const { positions } = this.state;
    const { bounds } = this.props;
    // bounds as [minX, minY, maxX, maxY]
    /*
      (minX0, maxY3) ---- (maxX2, maxY3)
             |                  |
             |                  |
             |                  |
      (minX0, minY1) ---- (maxX2, minY1)
   */
    positions[0] = bounds[0];
    positions[1] = bounds[1];
    positions[2] = 0;

    positions[3] = bounds[0];
    positions[4] = bounds[3];
    positions[5] = 0;

    positions[6] = bounds[2];
    positions[7] = bounds[3];
    positions[8] = 0;

    positions[9] = bounds[2];
    positions[10] = bounds[1];
    positions[11] = 0;

    // eslint-disable-next-line  no-param-reassign
    attributes.value = positions;
  }

  /**
   * This function runs the shaders and draws to the canvas
   */
  draw({ uniforms }) {
    const { textures, model } = this.state;
    if (textures && model) {
      const {
        sliderValues,
        colorValues,
        opacity,
        domain,
        dtype,
        channelIsOn,
        unprojectLensBounds,
        bounds,
        isLensOn,
        lensSelection,
        lensBorderColor,
        lensBorderRadius
      } = this.props;
      // Check number of textures not null.
      const numTextures = Object.values(textures).filter(t => t).length;
      // Slider values and color values can come in before textures since their data is async.
      // Thus we pad based on the number of textures bound.
      const { paddedSliderValues, paddedColorValues } = padColorsAndSliders({
        sliderValues: sliderValues.slice(0, numTextures),
        colorValues: colorValues.slice(0, numTextures),
        channelIsOn: channelIsOn.slice(0, numTextures),
        domain,
        dtype
      });
      // Creating a unit-square scaled intersection box for rendering the lens.
      // It is ok if these coordinates are outside the unit square since
      // we check membership in or out of the lens on the fragment shader.
      const [
        leftMouseBound,
        bottomMouseBound,
        rightMouseBound,
        topMouseBound
      ] = unprojectLensBounds;
      const [left, bottom, right, top] = bounds;
      const leftMouseBoundScaled = (leftMouseBound - left) / (right - left);
      const bottomMouseBoundScaled = (bottomMouseBound - top) / (bottom - top);
      const rightMouseBoundScaled = (rightMouseBound - left) / (right - left);
      const topMouseBoundScaled = (topMouseBound - top) / (bottom - top);
      model
        .setUniforms({
          ...uniforms,
          colorValues: paddedColorValues,
          sliderValues: paddedSliderValues,
          opacity,
          majorLensAxis: (rightMouseBoundScaled - leftMouseBoundScaled) / 2,
          minorLensAxis: (bottomMouseBoundScaled - topMouseBoundScaled) / 2,
          lensCenter: [
            (rightMouseBoundScaled + leftMouseBoundScaled) / 2,
            (bottomMouseBoundScaled + topMouseBoundScaled) / 2
          ],
          isLensOn,
          lensSelection,
          lensBorderColor,
          lensBorderRadius,
          ...textures
        })
        .draw();
    }
  }

  /**
   * This function loads all channel textures from incoming resolved promises/data from the loaders by calling `dataToTexture`
   */
  loadChannelTextures(channelData) {
    const textures = {
      channel0: null,
      channel1: null,
      channel2: null,
      channel3: null,
      channel4: null,
      channel5: null
    };
    if (this.state.textures) {
      Object.values(this.state.textures).forEach(tex => tex && tex.delete());
    }
    if (
      channelData &&
      Object.keys(channelData).length > 0 &&
      channelData.data
    ) {
      channelData.data.forEach((d, i) => {
        textures[`channel${i}`] = this.dataToTexture(
          d,
          channelData.width,
          channelData.height
        );
      }, this);
      this.setState({ textures });
    }
  }

  /**
   * This function creates textures from the data
   */
  dataToTexture(data, width, height) {
    const { gl } = this.context;
    const noWebGL2 = !isWebGL2(gl);
    const { dtype } = this.props;
    const { format, dataFormat, type } = DTYPE_VALUES[dtype];
    const texture = new Texture2D(this.context.gl, {
      width,
      height,
      data,
      // we don't want or need mimaps
      mipmaps: false,
      parameters: {
        // NEAREST for integer data
        [GL.TEXTURE_MIN_FILTER]: GL.NEAREST,
        [GL.TEXTURE_MAG_FILTER]: GL.NEAREST,
        // CLAMP_TO_EDGE to remove tile artifacts
        [GL.TEXTURE_WRAP_S]: GL.CLAMP_TO_EDGE,
        [GL.TEXTURE_WRAP_T]: GL.CLAMP_TO_EDGE
      },
      format: noWebGL2 ? GL.LUMINANCE : format,
      dataFormat: noWebGL2 ? GL.LUMINANCE : dataFormat,
      type: noWebGL2 ? GL.FLOAT : type
    });
    return texture;
  }
}

XRLayer.layerName = 'XRLayer';
XRLayer.defaultProps = defaultProps$8;

const PHOTOMETRIC_INTERPRETATIONS = {
  WhiteIsZero: 0,
  BlackIsZero: 1,
  RGB: 2,
  Palette: 3,
  TransparencyMask: 4,
  CMYK: 5,
  YCbCr: 6,
  CIELab: 8,
  ICCLab: 9
};

const defaultProps$1$1 = {
  pickable: true,
  coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
  bounds: { type: 'array', value: [0, 0, 1, 1], compare: true },
  opacity: { type: 'number', value: 1, compare: true }
};

const getPhotometricInterpretationShader = photometricInterpretation => {
  switch (photometricInterpretation) {
    case PHOTOMETRIC_INTERPRETATIONS.RGB:
      return '';
    case PHOTOMETRIC_INTERPRETATIONS.WhiteIsZero:
      return `\
          float value = 1.0 - (color.r / 256.0);
          color = vec4(value, value, value, color.a);
        `;
    case PHOTOMETRIC_INTERPRETATIONS.BlackIsZero:
      return `\
          float value = (color.r / 256.0);
          color = vec4(value, value, value, color.a);
        `;
    case PHOTOMETRIC_INTERPRETATIONS.YCbCr:
      return `\
          float y = color[0];
          float cb = color[1];
          float cr = color[2];
          color[0] = (y + (1.40200 * (cr - .5)));
          color[1] = (y - (0.34414 * (cb - .5)) - (0.71414 * (cr - .5)));
          color[2] = (y + (1.77200 * (cb - .5)));
        `;
    default:
      console.error(
        'Unsupported photometric interpretation or none provided.  No transformation will be done to image data'
      );
      return '';
  }
};

class BitmapLayer$1 extends BitmapLayer {
  _getModel(gl) {
    const { photometricInterpretation } = this.props;
    // This is a port to the GPU of a subset of https://github.com/geotiffjs/geotiff.js/blob/master/src/rgb.js
    // Safari was too slow doing this off of the GPU and it is noticably faster on other browsers as well.
    const photometricInterpretationShader = getPhotometricInterpretationShader(
      photometricInterpretation
    );
    if (!gl) {
      return null;
    }
    // This tells WebGL how to read row data from the texture.  For example, the default here is 4 (i.e for RGBA, one byte per channel) so
    // each row of data is expected to be a multiple of 4.  This setting (i.e 1) allows us to have non-multiple-of-4 row sizes.  For example, for 2 byte (16 bit data),
    // we could use 2 as the value and it would still work, but 1 also works fine (and is more flexible for 8 bit - 1 byte - textures as well).
    // https://stackoverflow.com/questions/42789896/webgl-error-arraybuffer-not-big-enough-for-request-in-case-of-gl-luminance
    gl.pixelStorei(GL.UNPACK_ALIGNMENT, 1);
    gl.pixelStorei(GL.PACK_ALIGNMENT, 1);

    /*
      0,0 --- 1,0
       |       |
      0,1 --- 1,1
    */
    return new Model(gl, {
      ...this.getShaders(),
      id: this.props.id,
      geometry: new Geometry({
        drawMode: GL.TRIANGLES,
        vertexCount: 6
      }),
      isInstanced: false,
      inject: {
        'fs:DECKGL_FILTER_COLOR': photometricInterpretationShader
      }
    });
  }
}

BitmapLayer$1.layerName = 'BitmapLayer';
// From https://github.com/geotiffjs/geotiff.js/blob/8ef472f41b51d18074aece2300b6a8ad91a21ae1/src/globals.js#L202-L213
BitmapLayer$1.PHOTOMETRIC_INTERPRETATIONS = PHOTOMETRIC_INTERPRETATIONS;
BitmapLayer$1.defaultProps = defaultProps$1$1;

function renderSubLayers(props) {
  const {
    bbox: { left, top, right, bottom },
    x,
    y,
    z
  } = props.tile;
  const {
    colorValues,
    sliderValues,
    channelIsOn,
    visible,
    opacity,
    data,
    colormap,
    dtype,
    id,
    onHover,
    pickable,
    unprojectLensBounds,
    isLensOn,
    lensSelection,
    onClick,
    loader,
    modelMatrix
  } = props;
  // Only render in positive coorinate system
  if ([left, bottom, right, top].some(v => v < 0) || !data) {
    return null;
  }
  const { height, width } = loader.getRasterSize({ z: 0 });
  // Tiles are exactly fitted to have height and width such that their bounds match that of the actual image (not some padded version).
  // Thus the right/bottom given by deck.gl are incorrect since they assume tiles are of uniform sizes, which is not the case for us.
  const bounds = [
    left,
    data.height < loader.tileSize ? height : bottom,
    data.width < loader.tileSize ? width : right,
    top
  ];
  const { isRgb, isInterleaved, photometricInterpretation } = loader;
  if (isRgb && isInterleaved) {
    return new BitmapLayer$1(props, {
      image: data,
      photometricInterpretation,
      // Shared props with XRLayer:
      bounds,
      id: `tile-sub-layer-${bounds}-${id}`,
      tileId: { x, y, z },
      onHover,
      pickable,
      onClick,
      modelMatrix,
      opacity,
      visible
    });
  }
  return new XRLayer(props, {
    channelData: data,
    // Uncomment to help debugging - shades the tile being hovered over.
    // autoHighlight: true,
    // highlightColor: [80, 80, 80, 50],
    data: null,
    sliderValues,
    colorValues,
    channelIsOn,
    dtype,
    colormap,
    unprojectLensBounds,
    isLensOn,
    lensSelection,
    // Shared props with BitmapLayer:
    bounds,
    id: `tile-sub-layer-${bounds}-${id}`,
    tileId: { x, y, z },
    onHover,
    pickable,
    onClick,
    modelMatrix,
    opacity,
    visible
  });
}

const defaultProps$2$1 = {
  pickable: true,
  coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
  sliderValues: { type: 'array', value: [], compare: true },
  colorValues: { type: 'array', value: [], compare: true },
  channelIsOn: { type: 'array', value: [], compare: true },
  minZoom: { type: 'number', value: 0, compare: true },
  maxZoom: { type: 'number', value: 0, compare: true },
  renderSubLayers: { type: 'function', value: renderSubLayers, compare: false },
  opacity: { type: 'number', value: 1, compare: true },
  colormap: { type: 'string', value: '', compare: true },
  dtype: { type: 'string', value: '<u2', compare: true },
  domain: { type: 'array', value: [], compare: true },
  viewportId: { type: 'string', value: '', compare: true },
  unprojectLensBounds: { type: 'array', value: [0, 0, 0, 0], compare: true },
  isLensOn: { type: 'boolean', value: false, compare: true },
  lensSelection: { type: 'number', value: 0, compare: true },
  lensRadius: { type: 'number', value: 100, compare: true },
  lensBorderColor: { type: 'array', value: [255, 255, 255], compare: true },
  lensBorderRadius: { type: 'number', value: 0.02, compare: true }
};

/**
 * This layer serves as a proxy of sorts to the rendering done in renderSubLayers, reacting to viewport changes in a custom manner.
 */
class MultiscaleImageLayerBase extends TileLayer {
  /**
   * This function allows us to controls which viewport gets to update the Tileset2D.
   * This is a uniquely TileLayer issue since it updates based on viewport updates thanks
   * to its ability to handle zoom-pan loading.  Essentially, with a picture-in-picture,
   * this prevents it from detecting the update of some other viewport that is unwanted.
   */
  _updateTileset() {
    if (!this.props.viewportId) {
      super._updateTileset();
    }
    if (
      (this.props.viewportId &&
        this.context.viewport.id === this.props.viewportId) ||
      // I don't know why, but DeckGL doesn't recognize multiple views on the first pass
      // so we force update on the first pass by checking if there is a viewport in the tileset.
      !this.state.tileset._viewport
    ) {
      super._updateTileset();
    }
  }
}

MultiscaleImageLayerBase.layerName = 'MultiscaleImageLayerBase';
MultiscaleImageLayerBase.defaultProps = defaultProps$2$1;

const defaultProps$3$1 = {
  pickable: true,
  coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
  sliderValues: { type: 'array', value: [], compare: true },
  channelIsOn: { type: 'array', value: [], compare: true },
  colorValues: { type: 'array', value: [], compare: true },
  loaderSelection: { type: 'array', value: [], compare: true },
  colormap: { type: 'string', value: '', compare: true },
  domain: { type: 'array', value: [], compare: true },
  viewportId: { type: 'string', value: '', compare: true },
  loader: {
    type: 'object',
    value: {
      getRaster: async () => ({ data: [], height: 0, width: 0 }),
      dtype: '<u2'
    },
    compare: true
  },
  z: { type: 'number', value: 0, compare: true },
  isLensOn: { type: 'boolean', value: false, compare: true },
  lensSelection: { type: 'number', value: 0, compare: true },
  lensRadius: { type: 'number', value: 100, compare: true },
  lensBorderColor: { type: 'array', value: [255, 255, 255], compare: true },
  lensBorderRadius: { type: 'number', value: 0.02, compare: true },
  onClick: { type: 'function', value: null, compare: true }
};

/**
 * This layer wraps XRLayer and generates a static image
 * @param {Object} props
 * @param {Array} props.sliderValues List of [begin, end] values to control each channel's ramp function.
 * @param {Array} props.colorValues List of [r, g, b] values for each channel.
 * @param {Array} props.channelIsOn List of boolean values for each channel for whether or not it is visible.
 * @param {number} props.opacity Opacity of the layer.
 * @param {string} props.colormap String indicating a colormap (default: '').  The full list of options is here: https://github.com/glslify/glsl-colormap#glsl-colormap
 * @param {Array} props.domain Override for the possible max/min values (i.e something different than 65535 for uint16/'<u2').
 * @param {string} props.viewportId Id for the current view.  This needs to match the viewState id in deck.gl and is necessary for the lens.
 * @param {Object} props.loader Loader to be used for fetching data.  It must implement/return `getRaster` and `dtype`.
 * @param {String} props.onHover Hook function from deck.gl to handle hover objects.
 * @param {boolean} props.isLensOn Whether or not to use the lens.
 * @param {number} props.lensSelection Numeric index of the channel to be focused on by the lens.
 * @param {number} props.lensRadius Pixel radius of the lens (default: 100).
 * @param {number} props.lensBorderColor RGB color of the border of the lens.
 * @param {number} props.lensBorderRadius Percentage of the radius of the lens for a border (default 0.02).
 * @param {number} props.onClick Hook function from deck.gl to handle clicked-on objects.
 * @param {number} props.modelMatrix Math.gl Matrix4 object containing an affine transformation to be applied to the image.
 */
class ImageLayer extends CompositeLayer {
  initializeState() {
    this.state = {
      unprojectLensBounds: [0, 0, 0, 0],
      width: 0,
      height: 0,
      data: []
    };
    if (this.context.deck) {
      this.context.deck.eventManager.on({
        pointermove: () => onPointer(this),
        pointerleave: () => onPointer(this),
        wheel: () => onPointer(this)
      });
    }
  }

  updateState({ changeFlags, props, oldProps }) {
    const { propsChanged } = changeFlags;
    const loaderChanged =
      typeof propsChanged === 'string' && propsChanged.includes('props.loader');
    const loaderSelectionChanged =
      props.loaderSelection !== oldProps.loaderSelection;
    if (loaderChanged || loaderSelectionChanged) {
      // Only fetch new data to render if loader has changed
      const { loader, z, loaderSelection } = this.props;
      loader.getRaster({ z, loaderSelection }).then(raster => {
        /* eslint-disable no-param-reassign */
        if (loader.isInterleaved && loader.isRgb) {
          // data is for BitmapLayer and needs to be of form { data: Uint8Array, width, height };
          // eslint-disable-next-line prefer-destructuring
          raster.data = raster.data[0];
          if (raster.data.length === raster.width * raster.height * 3) {
            // data is RGB (not RGBA) and need to update texture formats
            raster.format = GL.RGB;
            raster.dataFormat = GL.RGB;
          }
        } else if (!isWebGL2(this.context.gl)) {
          // data is for XLRLayer in non-WebGL2 evironment
          // we need to convert data to compatible textures
          raster.data = to32BitFloat(raster.data);
        }
        this.setState({ ...raster });
        /* eslint-disable no-param-reassign */
      });
    }
  }

  // eslint-disable-next-line class-methods-use-this
  getPickingInfo({ info, sourceLayer }) {
    // eslint-disable-next-line no-param-reassign
    info.sourceLayer = sourceLayer;
    // eslint-disable-next-line no-param-reassign
    info.tile = sourceLayer.props.tile;
    return info;
  }

  renderLayers() {
    const {
      loader,
      visible,
      opacity,
      colormap,
      sliderValues,
      colorValues,
      channelIsOn,
      z,
      domain,
      pickable,
      isLensOn,
      lensSelection,
      lensBorderColor,
      lensRadius,
      id,
      onClick,
      onHover,
      modelMatrix
    } = this.props;
    const { dtype } = loader;
    const { width, height, data, unprojectLensBounds } = this.state;
    if (!(width && height)) return null;
    const bounds = [0, height, width, 0];
    const { isRgb, isInterleaved, photometricInterpretation } = loader;
    if (isRgb && isInterleaved) {
      return new BitmapLayer$1(this.props, {
        image: this.state,
        photometricInterpretation,
        // Shared props with XRLayer:
        bounds,
        id: `image-sub-layer-${bounds}-${id}-${z}`,
        onHover,
        pickable,
        onClick,
        modelMatrix,
        opacity,
        visible
      });
    }
    return new XRLayer(this.props, {
      channelData: { data, height, width },
      sliderValues,
      colorValues,
      channelIsOn,
      domain,
      dtype,
      colormap,
      unprojectLensBounds,
      isLensOn,
      lensSelection,
      lensBorderColor,
      lensRadius,
      // Shared props with BitmapLayer:
      bounds,
      id: `image-sub-layer-${bounds}-${id}-${z}`,
      onHover,
      pickable,
      onClick,
      modelMatrix,
      opacity,
      visible
    });
  }
}

ImageLayer.layerName = 'ImageLayer';
ImageLayer.defaultProps = defaultProps$3$1;

const defaultProps$4$1 = {
  pickable: true,
  onHover: { type: 'function', value: null, compare: false },
  sliderValues: { type: 'array', value: [], compare: true },
  colorValues: { type: 'array', value: [], compare: true },
  channelIsOn: { type: 'array', value: [], compare: true },
  opacity: { type: 'number', value: 1, compare: true },
  colormap: { type: 'string', value: '', compare: true },
  domain: { type: 'array', value: [], compare: true },
  viewportId: { type: 'string', value: '', compare: true },
  isLensOn: { type: 'boolean', value: false, compare: true },
  lensSelection: { type: 'number', value: 0, compare: true },
  lensRadius: { type: 'number', value: 100, compare: true },
  lensBorderColor: { type: 'array', value: [255, 255, 255], compare: true },
  lensBorderRadius: { type: 'number', value: 0.02, compare: true },
  maxRequests: { type: 'number', value: 10, compare: true },
  onClick: { type: 'function', value: null, compare: true }
};

/**
 * This layer generates a MultiscaleImageLayer (tiled) and a ImageLayer (background for the tiled layer)
 * @param {Object} props
 * @param {Array} props.sliderValues List of [begin, end] values to control each channel's ramp function.
 * @param {Array} props.colorValues List of [r, g, b] values for each channel.
 * @param {Array} props.channelIsOn List of boolean values for each channel for whether or not it is visible.
 * @param {number} props.opacity Opacity of the layer.
 * @param {string} props.colormap String indicating a colormap (default: '').  The full list of options is here: https://github.com/glslify/glsl-colormap#glsl-colormap
 * @param {Array} props.domain Override for the possible max/min values (i.e something different than 65535 for uint16/'<u2').
 * @param {string} props.viewportId Id for the current view.  This needs to match the viewState id in deck.gl and is necessary for the lens.
 * @param {Object} props.loader Loader to be used for fetching data.  It must implement/return `getTile`, `dtype`, `numLevels`, and `tileSize`, and `getRaster`.
 * @param {Array} props.loaderSelection Selection to be used for fetching data.
 * @param {String} props.id Unique identifier for this layer.
 * @param {String} props.onTileError Custom override for handle tile fetching errors.
 * @param {String} props.onHover Hook function from deck.gl to handle hover objects.
 * @param {boolean} props.isLensOn Whether or not to use the lens.
 * @param {number} props.lensSelection Numeric index of the channel to be focused on by the lens.
 * @param {number} props.lensRadius Pixel radius of the lens (default: 100).
 * @param {number} props.lensBorderColor RGB color of the border of the lens (default [255, 255, 255]).
 * @param {number} props.lensBorderRadius Percentage of the radius of the lens for a border (default 0.02).
 * @param {number} props.maxRequests Maximum parallel ongoing requests allowed before aborting.
 * @param {number} props.onClick Hook function from deck.gl to handle clicked-on objects.
 * @param {number} props.modelMatrix Math.gl Matrix4 object containing an affine transformation to be applied to the image.
 */

class MultiscaleImageLayer extends CompositeLayer {
  initializeState() {
    this.state = {
      unprojectLensBounds: [0, 0, 0, 0]
    };
    if (this.context.deck) {
      this.context.deck.eventManager.on({
        pointermove: () => onPointer(this),
        pointerleave: () => onPointer(this),
        wheel: () => onPointer(this)
      });
    }
  }

  renderLayers() {
    const {
      loader,
      sliderValues,
      colorValues,
      channelIsOn,
      loaderSelection,
      domain,
      opacity,
      colormap,
      viewportId,
      onTileError,
      onHover,
      pickable,
      id,
      isLensOn,
      lensSelection,
      lensBorderColor,
      lensBorderRadius,
      maxRequests,
      onClick,
      modelMatrix
    } = this.props;
    const { tileSize, numLevels, dtype, isInterleaved, isRgb } = loader;
    const { unprojectLensBounds } = this.state;
    const noWebGl2 = !isWebGL2(this.context.gl);
    const getTileData = async ({ x, y, z, signal }) => {
      const tile = await loader.getTile({
        x,
        y,
        // I don't fully undertstand why this works, but I have a sense.
        // It's basically to cancel out:
        // https://github.com/visgl/deck.gl/pull/4616/files#diff-4d6a2e500c0e79e12e562c4f1217dc80R128,
        // which felt odd to me to beign with.
        // The image-tile example works without, this but I have a feeling there is something
        // going on with our pyramids and/or rendering that is different.
        z: Math.round(-z + Math.log2(512 / tileSize)),
        loaderSelection,
        signal
      });
      if (isInterleaved && isRgb) {
        // eslint-disable-next-line prefer-destructuring
        tile.data = tile.data[0];
        if (tile.data.length === tile.width * tile.height * 3) {
          tile.format = GL.RGB;
          tile.dataFormat = GL.RGB; // is this not properly inferred?
        }
        // can just return early, no need  to check for webgl2
        return tile;
      }
      if (noWebGl2) {
        tile.data = to32BitFloat(tile.data);
      }
      return tile;
    };
    const { height, width } = loader.getRasterSize({ z: 0 });
    const tiledLayer = new MultiscaleImageLayerBase(this.props, {
      id: `Tiled-Image-${id}`,
      getTileData,
      dtype,
      tileSize,
      onClick,
      extent: [0, 0, width, height],
      minZoom: -(numLevels - 1),
      maxZoom: Math.min(0, Math.round(Math.log2(512 / tileSize))),
      colorValues,
      sliderValues,
      channelIsOn,
      maxRequests,
      domain,
      // We want a no-overlap caching strategy with an opacity < 1 to prevent
      // multiple rendered sublayers (some of which have been cached) from overlapping
      refinementStrategy: opacity === 1 ? 'best-available' : 'no-overlap',
      // TileLayer checks `changeFlags.updateTriggersChanged.getTileData` to see if tile cache
      // needs to be re-created. We want to trigger this behavior if the loader changes.
      // https://github.com/uber/deck.gl/blob/3f67ea6dfd09a4d74122f93903cb6b819dd88d52/modules/geo-layers/src/tile-layer/tile-layer.js#L50
      updateTriggers: {
        getTileData: [loader, loaderSelection]
      },
      onTileError: onTileError || loader.onTileError,
      opacity,
      colormap,
      viewportId,
      onHover,
      pickable,
      unprojectLensBounds,
      isLensOn,
      lensSelection,
      lensBorderColor,
      lensBorderRadius,
      modelMatrix
    });
    // This gives us a background image and also solves the current
    // minZoom funny business.  We don't use it for the background if we have an opacity
    // paramteter set to anything but 1, but we always use it for situations where
    // we are zoomed out too far.
    const implementsGetRaster = typeof loader.getRaster === 'function';
    const layerModelMatrix = modelMatrix ? modelMatrix.clone() : new Matrix4();
    const baseLayer =
      implementsGetRaster &&
      new ImageLayer(this.props, {
        id: `Background-Image-${id}`,
        modelMatrix: layerModelMatrix.scale(2 ** (numLevels - 1)),
        visible:
          opacity === 1 ||
          (-numLevels > this.context.viewport.zoom &&
            (!viewportId || this.context.viewport.id === viewportId)),
        z: numLevels - 1,
        pickable: true,
        onHover,
        onClick
      });
    const layers = [baseLayer, tiledLayer];
    return layers;
  }
}

MultiscaleImageLayer.layerName = 'MultiscaleImageLayer';
MultiscaleImageLayer.defaultProps = defaultProps$4$1;

function guessRgb(shape) {
  const lastDimSize = shape[shape.length - 1];
  return shape.length > 2 && (lastDimSize === 3 || lastDimSize === 4);
}

/**
 * Flips the bytes of TypedArray in place. Used to flipendianess
 * Adapted from https://github.com/zbjornson/node-bswap/blob/master/bswap.js
 * @param {TypedArray} src
 * @returns {void}
 */
function byteSwapInplace(src) {
  const b = src.BYTES_PER_ELEMENT;
  const flipper = new Uint8Array(src.buffer, src.byteOffset, src.length * b);
  const numFlips = b / 2;
  const endByteIndex = b - 1;
  let t = 0;
  for (let i = 0; i < flipper.length; i += b) {
    for (let j = 0; j < numFlips; j += 1) {
      t = flipper[i + j];
      flipper[i + j] = flipper[i + endByteIndex - j];
      flipper[i + endByteIndex - j] = t;
    }
  }
}

/**
 * Preserves (double) slashes earlier in the path, so this works better
 * for URLs. From https://stackoverflow.com/a/46427607/4178400
 * @param args parts of a path or URL to join.
 */
function joinUrlParts(...args) {
  return args
    .map((part, i) => {
      if (i === 0) return part.trim().replace(/[/]*$/g, '');
      return part.trim().replace(/(^[/]*|[/]*$)/g, '');
    })
    .filter(x => x.length)
    .join('/');
}

class HTTPStore {
  constructor(url, options = {}) {
    this.url = url;
    this.options = options;
  }

  async getItem(key, options = {}) {
    const url = joinUrlParts(this.url, key);
    const value = await fetch(url, { ...this.options, ...options });
    if (value.status === 404) {
      throw new KeyError(key);
    } else if (value.status !== 200) {
      throw new HTTPError(String(value.status));
    }
    return value.arrayBuffer();
  }

  async containsItem(key, options = {}) {
    const url = joinUrlParts(this.url, key);
    const value = await fetch(url, { ...this.options, ...options });
    return value.status === 200;
  }
}

function _optionalChain$1(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }
/**
 * This class serves as a wrapper for fetching zarr data from a file server.
 * */
class ZarrLoader {
  constructor({
    data,
    dimensions,
    isRgb,
    scale = 1,
    translate = { x: 0, y: 0 }
  }) {
    let base;
    if (Array.isArray(data)) {
      [base] = data;
      this.numLevels = data.length;
    } else {
      base = data;
      this.numLevels = 1;
    }
    this.type = 'zarr';
    this.scale = scale;
    this.translate = translate;
    this.isRgb = isRgb || guessRgb(base.shape);
    this.dimensions = dimensions;

    this._data = data;
    this._dimIndices = new Map();
    dimensions.forEach(({ field }, i) => this._dimIndices.set(field, i));

    const { dtype, chunks } = base;
    /* TODO: Use better dtype convention in DTYPE_LOOKUP.
     * https://github.com/hms-dbmi/viv/issues/203
     *
     * This convension should probably _not_ describe endianness,
     * since endianness is resolved when decoding the source arrayBuffers
     * into TypedArrays. The dtype of the zarr array describes the dtype of the
     * source but this is different from how the bytes end up being represented in
     * memory client-side.
     */
    this.dtype = `<${dtype.slice(1)}`;
    this.tileSize = chunks[this._dimIndices.get('x')];
  }

  get isPyramid() {
    return Array.isArray(this._data);
  }

  get base() {
    return this.isPyramid ? this._data[0] : this._data;
  }

  /**
   * Returns image tiles at tile-position (x, y) at pyramidal level z.
   * @param {number} args
   * @param {number} args.x positive integer
   * @param {number} args.y positive integer
   * @param {number} args.z positive integer (0 === highest zoom level)
   * @param {Array} args.loaderSelection Array of valid dimension selections
   * @param {Array} args.signal AbortSignal object
   * @returns {Object} data: TypedArray[], width: number (tileSize), height: number (tileSize)
   */
  async getTile({ x, y, z, loaderSelection = [], signal }) {
    const { TypedArray } = DTYPE_VALUES[this.dtype];
    const source = this._getSource(z);
    const [xIndex, yIndex] = ['x', 'y'].map(k => this._dimIndices.get(k));

    const dataRequests = loaderSelection.map(async sel => {
      const chunkKey = this._serializeSelection(sel);
      chunkKey[yIndex] = y;
      chunkKey[xIndex] = x;

      const key = source.keyPrefix + chunkKey.join('.');
      let buffer;
      try {
        buffer = await source.store.getItem(key, { signal });
      } catch (err) {
        if (err.name !== 'AbortError') {
          throw err;
        }
        return null;
      }
      let bytes = new Uint8Array(buffer);
      if (source.compressor) {
        bytes = await source.compressor.decode(bytes);
      }
      const data = new TypedArray(bytes.buffer);
      if (source.dtype[0] === '>') {
        // big endian
        byteSwapInplace(data);
      }
      return data;
    });
    const data = await Promise.all(dataRequests);
    if (source.store instanceof HTTPStore && _optionalChain$1([signal, 'optionalAccess', _ => _.aborted])) return null;
    const width = source.chunks[xIndex];
    const height = source.chunks[yIndex];
    return { data, width, height };
  }

  /**
   * Returns full image panes (at level z if pyramid)
   * @param {number} args
   * @param {number} args.z positive integer (0 === highest zoom level)
   * @param {Array} args.loaderSelection, Array of valid dimension selections
   * @returns {Object} data: TypedArray[], width: number, height: number
   */
  async getRaster({ z, loaderSelection = [] }) {
    const source = this._getSource(z);
    const [xIndex, yIndex] = ['x', 'y'].map(k => this._dimIndices.get(k));

    const dataRequests = loaderSelection.map(async sel => {
      const chunkKey = this._serializeSelection(sel);
      chunkKey[yIndex] = null;
      chunkKey[xIndex] = null;
      if (this.isRgb) {
        chunkKey[chunkKey.length - 1] = null;
      }
      const { data } = await source.getRaw(chunkKey);
      return data;
    });

    const data = await Promise.all(dataRequests);
    const { shape } = source;
    const width = shape[xIndex];
    const height = shape[yIndex];
    return { data, width, height };
  }

  /**
   * Handles `onTileError` within deck.gl
   * @param {Error} err Error thrown in tile layer
   */
  // eslint-disable-next-line class-methods-use-this
  onTileError(err) {
    if (!(err instanceof BoundsCheckError)) {
      // Rethrow error if something other than tile being requested is out of bounds.
      throw err;
    }
  }

  /**
   * Returns image width and height (at pyramid level z) without fetching data
   * @param {Object} args
   * @param {number} args.z positive integer (0 === highest zoom level)
   * @returns {Object} width: number, height: number
   */
  getRasterSize({ z }) {
    const { shape } = this._getSource(z);
    const [height, width] = ['y', 'x'].map(k => shape[this._dimIndices.get(k)]);
    return { height, width };
  }

  /**
   * Get the metadata associated with a Zarr image layer, in a human-readable format.
   * @returns {Object} Metadata keys mapped to values.
   */
  // eslint-disable-next-line class-methods-use-this
  getMetadata() {
    return {};
  }

  _getSource(z) {
    return typeof z === 'number' && this.isPyramid ? this._data[z] : this._data;
  }

  /**
   * Returns valid zarr.js selection for ZarrArray.getRaw or ZarrArray.getRawChunk
   * @param {Object} selection valid dimension selection
   * @returns {Array} Array of indicies
   *
   * Valid dimension selections include:
   *   - Direct zarr.js selection: [1, 0, 0, 0]
   *   - Named selection object: { channel: 0, time: 2 } or { channel: "DAPI", time: 2 }
   */
  _serializeSelection(selection) {
    // Just return copy if array-like zarr.js selection
    if (Array.isArray(selection)) return [...selection];

    const serialized = Array(this.dimensions.length).fill(0);
    Object.entries(selection).forEach(([dimName, value]) => {
      if (!this._dimIndices.has(dimName)) {
        throw Error(
          `Dimension "${dimName}" does not exist on loader.
           Must be one of "${this.dimensions.map(d => d.field)}."`
        );
      }
      const dimIndex = this._dimIndices.get(dimName);
      switch (typeof value) {
        case 'number': {
          // ex. { channel: 0 }
          serialized[dimIndex] = value;
          break;
        }
        case 'string': {
          const { values, type } = this.dimensions[dimIndex];
          if (type === 'nominal' || type === 'ordinal') {
            // ex. { channel: 'DAPI' }
            serialized[dimIndex] = values.indexOf(value);
            break;
          } else {
            // { z: 'DAPI' }
            throw Error(
              `Cannot use selection "${value}" for dimension "${dimName}" with type "${type}".`
            );
          }
        }
        default: {
          throw Error(
            `Named selection must be a string or number. Got ${value} for ${dimName}.`
          );
        }
      }
    });
    return serialized;
  }
}

export { DTYPE_VALUES, ImageLayer, MultiscaleImageLayer, XRLayer, ZarrLoader };
