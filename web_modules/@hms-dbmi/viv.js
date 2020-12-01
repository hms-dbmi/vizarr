import { c as createCommonjsModule } from '../common/_commonjsHelpers-37fa8da4.js';
import { S as Stats, E as ARRAY_TYPE, _ as _inherits, a as _getPrototypeOf, b as _possibleConstructorReturn, G as vec4_transformMat3, H as transformMat3, e as transformMat3$1, I as checkVector, J as deprecated, K as Matrix, N as create$2, O as fromValues, Q as dot$1, R as cross, U as len, W as normalize$1, X as add$1, Y as scale$2, Z as dot$2, $ as lerp$1, a0 as length$1, a1 as squaredLength$1, a2 as normalize$2, a3 as EPSILON, a4 as assert, a5 as transformQuat, d as checkNumber, a6 as MathArray, k as _get, A as Model, L as Layer, a7 as log, a8 as _asyncToGenerator, a9 as regenerator, aa as Vector3, ab as getScaling, p as equals, M as Matrix4, l as flatten, ac as load, ad as isWebGL2, ae as Texture2D, C as COORDINATE_SYSTEM } from '../common/layer-6e52c28c.js';
import '../common/process-2545f00a.js';
import '../common/typeof-c65245d2.js';
import { _ as _defineProperty } from '../common/defineProperty-1b0b77a2.js';
import { _ as _classCallCheck } from '../common/classCallCheck-4eda545c.js';
import { _ as _createClass, a as _toConsumableArray } from '../common/assertThisInitialized-87ceda02.js';
import '../common/_node-resolve:empty-0f7f843d.js';
import { _ as _slicedToArray } from '../common/slicedToArray-14e71088.js';
import '../common/project-9e8cb528.js';
import { p as project32, a as picking, G as Geometry, c as cutPolylineByGrid, b as cutPolylineByMercatorBounds, T as Tesselator, S as SolidPolygonLayer } from '../common/solid-polygon-layer-e2a7f59c.js';
import { C as CompositeLayer } from '../common/composite-layer-d77b2c59.js';
import '../common/index-aae33e1a.js';
import { B as BoundsCheckError, K as KeyError, H as HTTPError } from '../common/zarr.es6-03aa202b.js';

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

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }
var IDENTITY = Object.freeze([1, 0, 0, 0, 1, 0, 0, 0, 1]);
var ZERO = Object.freeze([0, 0, 0, 0, 0, 0, 0, 0, 0]);
var INDICES = Object.freeze({
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
var constants = {};

var Matrix3 = function (_Matrix) {
  _inherits(Matrix3, _Matrix);

  var _super = _createSuper(Matrix3);

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
      return INDICES;
    }
  }], [{
    key: "IDENTITY",
    get: function get() {
      constants.IDENTITY = constants.IDENTITY || Object.freeze(new Matrix3(IDENTITY));
      return constants.IDENTITY;
    }
  }, {
    key: "ZERO",
    get: function get() {
      constants.ZERO = constants.ZERO || Object.freeze(new Matrix3(ZERO));
      return constants.ZERO;
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
      return this.copy(IDENTITY);
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

      checkVector(result, vector.length);
      return result;
    }
  }, {
    key: "transformVector",
    value: function transformVector(vector, result) {
      deprecated('Matrix3.transformVector');
      return this.transform(vector, result);
    }
  }, {
    key: "transformVector2",
    value: function transformVector2(vector, result) {
      deprecated('Matrix3.transformVector');
      return this.transform(vector, result);
    }
  }, {
    key: "transformVector3",
    value: function transformVector3(vector, result) {
      deprecated('Matrix3.transformVector');
      return this.transform(vector, result);
    }
  }]);

  return Matrix3;
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


  if (1.0 - cosom > EPSILON) {
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

var add = add$1;
/**
 * Scales a quat by a scalar number
 *
 * @param {quat} out the receiving vector
 * @param {ReadonlyQuat} a the vector to scale
 * @param {Number} b amount to scale the vector by
 * @returns {quat} out
 * @function
 */

var scale$1 = scale$2;
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

var lerp = lerp$1;
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

var normalize = normalize$2;
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
      normalize$1(tmpvec3, tmpvec3);
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

function _createSuper$1(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct$1(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _isNativeReflectConstruct$1() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }
var IDENTITY_QUATERNION = [0, 0, 0, 1];

var Quaternion = function (_MathArray) {
  _inherits(Quaternion, _MathArray);

  var _super = _createSuper$1(Quaternion);

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
    value: function lerp$1(a, b, t) {
      lerp(this, a, b, t);
      return this.check();
    }
  }, {
    key: "multiplyRight",
    value: function multiplyRight(a, b) {
      assert(!b);
      multiply$1(this, this, a);
      return this.check();
    }
  }, {
    key: "multiplyLeft",
    value: function multiplyLeft(a, b) {
      assert(!b);
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
      transformQuat(result, vector, this);
      return checkVector(result, 4);
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
  }, {
    key: "z",
    get: function get() {
      return this[2];
    },
    set: function set(value) {
      this[2] = checkNumber(value);
    }
  }, {
    key: "w",
    get: function get() {
      return this[3];
    },
    set: function set(value) {
      this[3] = checkNumber(value);
    }
  }]);

  return Quaternion;
}(MathArray);

var vs = "#define SHADER_NAME scatterplot-layer-vertex-shader\n\nattribute vec3 positions;\n\nattribute vec3 instancePositions;\nattribute vec3 instancePositions64Low;\nattribute float instanceRadius;\nattribute float instanceLineWidths;\nattribute vec4 instanceFillColors;\nattribute vec4 instanceLineColors;\nattribute vec3 instancePickingColors;\n\nuniform float opacity;\nuniform float radiusScale;\nuniform float radiusMinPixels;\nuniform float radiusMaxPixels;\nuniform float lineWidthScale;\nuniform float lineWidthMinPixels;\nuniform float lineWidthMaxPixels;\nuniform float stroked;\nuniform bool filled;\n\nvarying vec4 vFillColor;\nvarying vec4 vLineColor;\nvarying vec2 unitPosition;\nvarying float innerUnitRadius;\nvarying float outerRadiusPixels;\n\nvoid main(void) {\n  geometry.worldPosition = instancePositions;\n  outerRadiusPixels = clamp(\n    project_size_to_pixel(radiusScale * instanceRadius),\n    radiusMinPixels, radiusMaxPixels\n  );\n  float lineWidthPixels = clamp(\n    project_size_to_pixel(lineWidthScale * instanceLineWidths),\n    lineWidthMinPixels, lineWidthMaxPixels\n  );\n  outerRadiusPixels += stroked * lineWidthPixels / 2.0;\n  unitPosition = positions.xy;\n  geometry.uv = unitPosition;\n  geometry.pickingColor = instancePickingColors;\n\n  innerUnitRadius = 1.0 - stroked * lineWidthPixels / outerRadiusPixels;\n  \n  vec3 offset = positions * project_pixel_size(outerRadiusPixels);\n  DECKGL_FILTER_SIZE(offset, geometry);\n  gl_Position = project_position_to_clipspace(instancePositions, instancePositions64Low, offset, geometry.position);\n  DECKGL_FILTER_GL_POSITION(gl_Position, geometry);\n  vFillColor = vec4(instanceFillColors.rgb, instanceFillColors.a * opacity);\n  DECKGL_FILTER_COLOR(vFillColor, geometry);\n  vLineColor = vec4(instanceLineColors.rgb, instanceLineColors.a * opacity);\n  DECKGL_FILTER_COLOR(vLineColor, geometry);\n}\n";

var fs = "#define SHADER_NAME scatterplot-layer-fragment-shader\n\nprecision highp float;\n\nuniform bool filled;\nuniform float stroked;\n\nvarying vec4 vFillColor;\nvarying vec4 vLineColor;\nvarying vec2 unitPosition;\nvarying float innerUnitRadius;\nvarying float outerRadiusPixels;\n\nvoid main(void) {\n  geometry.uv = unitPosition;\n\n  float distToCenter = length(unitPosition) * outerRadiusPixels;\n  float inCircle = smoothedge(distToCenter, outerRadiusPixels);\n\n  if (inCircle == 0.0) {\n    discard;\n  }\n\n  if (stroked > 0.5) {\n    float isLine = smoothedge(innerUnitRadius * outerRadiusPixels, distToCenter);\n    if (filled) {\n      gl_FragColor = mix(vFillColor, vLineColor, isLine);\n    } else {\n      if (isLine == 0.0) {\n        discard;\n      }\n      gl_FragColor = vec4(vLineColor.rgb, vLineColor.a * isLine);\n    }\n  } else if (filled) {\n    gl_FragColor = vFillColor;\n  } else {\n    discard;\n  }\n\n  gl_FragColor.a *= inCircle;\n  DECKGL_FILTER_COLOR(gl_FragColor, geometry);\n}\n";

function _createSuper$2(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct$2(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _isNativeReflectConstruct$2() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }
var DEFAULT_COLOR = [0, 0, 0, 255];
var defaultProps = {
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

  var _super = _createSuper$2(ScatterplotLayer);

  function ScatterplotLayer() {
    _classCallCheck(this, ScatterplotLayer);

    return _super.apply(this, arguments);
  }

  _createClass(ScatterplotLayer, [{
    key: "getShaders",
    value: function getShaders(id) {
      return _get(_getPrototypeOf(ScatterplotLayer.prototype), "getShaders", this).call(this, {
        vs: vs,
        fs: fs,
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
ScatterplotLayer.defaultProps = defaultProps;

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

function _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function ownKeys$1(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread$1(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys$1(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys$1(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _createSuper$3(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct$3(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _isNativeReflectConstruct$3() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }
var START_CAP = 1;
var END_CAP = 2;
var INVALID = 4;

var PathTesselator = function (_Tesselator) {
  _inherits(PathTesselator, _Tesselator);

  var _super = _createSuper$3(PathTesselator);

  function PathTesselator(opts) {
    _classCallCheck(this, PathTesselator);

    return _super.call(this, _objectSpread$1(_objectSpread$1({}, opts), {}, {
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

        var _iterator = _createForOfIteratorHelper(path),
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
        var _iterator2 = _createForOfIteratorHelper(path),
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

var vs$1 = "#define SHADER_NAME path-layer-vertex-shader\n\nattribute vec2 positions;\n\nattribute float instanceTypes;\nattribute vec3 instanceStartPositions;\nattribute vec3 instanceEndPositions;\nattribute vec3 instanceLeftPositions;\nattribute vec3 instanceRightPositions;\nattribute vec3 instanceLeftPositions64Low;\nattribute vec3 instanceStartPositions64Low;\nattribute vec3 instanceEndPositions64Low;\nattribute vec3 instanceRightPositions64Low;\nattribute float instanceStrokeWidths;\nattribute vec4 instanceColors;\nattribute vec3 instancePickingColors;\n\nuniform float widthScale;\nuniform float widthMinPixels;\nuniform float widthMaxPixels;\nuniform float jointType;\nuniform float miterLimit;\nuniform bool billboard;\n\nuniform float opacity;\n\nvarying vec4 vColor;\nvarying vec2 vCornerOffset;\nvarying float vMiterLength;\nvarying vec2 vPathPosition;\nvarying float vPathLength;\n\nconst float EPSILON = 0.001;\nconst vec3 ZERO_OFFSET = vec3(0.0);\n\nfloat flipIfTrue(bool flag) {\n  return -(float(flag) * 2. - 1.);\n}\nvec3 lineJoin(\n  vec3 prevPoint, vec3 currPoint, vec3 nextPoint,\n  vec2 width\n) {\n  bool isEnd = positions.x > 0.0;\n  float sideOfPath = positions.y;\n  float isJoint = float(sideOfPath == 0.0);\n\n  vec3 deltaA3 = (currPoint - prevPoint);\n  vec3 deltaB3 = (nextPoint - currPoint);\n\n  mat3 rotationMatrix;\n  bool needsRotation = !billboard && project_needs_rotation(currPoint, rotationMatrix);\n  if (needsRotation) {\n    deltaA3 = deltaA3 * rotationMatrix;\n    deltaB3 = deltaB3 * rotationMatrix;\n  }\n  vec2 deltaA = deltaA3.xy / width;\n  vec2 deltaB = deltaB3.xy / width;\n\n  float lenA = length(deltaA);\n  float lenB = length(deltaB);\n\n  vec2 dirA = lenA > 0. ? normalize(deltaA) : vec2(0.0, 0.0);\n  vec2 dirB = lenB > 0. ? normalize(deltaB) : vec2(0.0, 0.0);\n\n  vec2 perpA = vec2(-dirA.y, dirA.x);\n  vec2 perpB = vec2(-dirB.y, dirB.x);\n  vec2 tangent = dirA + dirB;\n  tangent = length(tangent) > 0. ? normalize(tangent) : perpA;\n  vec2 miterVec = vec2(-tangent.y, tangent.x);\n  vec2 dir = isEnd ? dirA : dirB;\n  vec2 perp = isEnd ? perpA : perpB;\n  float L = isEnd ? lenA : lenB;\n  float sinHalfA = abs(dot(miterVec, perp));\n  float cosHalfA = abs(dot(dirA, miterVec));\n  float turnDirection = flipIfTrue(dirA.x * dirB.y >= dirA.y * dirB.x);\n  float cornerPosition = sideOfPath * turnDirection;\n\n  float miterSize = 1.0 / max(sinHalfA, EPSILON);\n  miterSize = mix(\n    min(miterSize, max(lenA, lenB) / max(cosHalfA, EPSILON)),\n    miterSize,\n    step(0.0, cornerPosition)\n  );\n\n  vec2 offsetVec = mix(miterVec * miterSize, perp, step(0.5, cornerPosition))\n    * (sideOfPath + isJoint * turnDirection);\n  bool isStartCap = lenA == 0.0 || (!isEnd && (instanceTypes == 1.0 || instanceTypes == 3.0));\n  bool isEndCap = lenB == 0.0 || (isEnd && (instanceTypes == 2.0 || instanceTypes == 3.0));\n  bool isCap = isStartCap || isEndCap;\n  if (isCap) {\n    offsetVec = mix(perp * sideOfPath, dir * jointType * 4.0 * flipIfTrue(isStartCap), isJoint);\n  }\n  vPathLength = L;\n  vCornerOffset = offsetVec;\n  vMiterLength = dot(vCornerOffset, miterVec * turnDirection);\n  vMiterLength = isCap ? isJoint : vMiterLength;\n\n  vec2 offsetFromStartOfPath = vCornerOffset + deltaA * float(isEnd);\n  vPathPosition = vec2(\n    dot(offsetFromStartOfPath, perp),\n    dot(offsetFromStartOfPath, dir)\n  );\n  geometry.uv = vPathPosition;\n\n  float isValid = step(instanceTypes, 3.5);\n  vec3 offset = vec3(offsetVec * width * isValid, 0.0);\n\n  if (needsRotation) {\n    offset = rotationMatrix * offset;\n  }\n  return currPoint + offset;\n}\nvoid clipLine(inout vec4 position, vec4 refPosition) {\n  if (position.w < EPSILON) {\n    float r = (EPSILON - refPosition.w) / (position.w - refPosition.w);\n    position = refPosition + (position - refPosition) * r;\n  }\n}\n\nvoid main() {\n  geometry.worldPosition = instanceStartPositions;\n  geometry.worldPositionAlt = instanceEndPositions;\n  geometry.pickingColor = instancePickingColors;\n\n  vec2 widthPixels = vec2(clamp(project_size_to_pixel(instanceStrokeWidths * widthScale),\n    widthMinPixels, widthMaxPixels) / 2.0);\n  vec3 width;\n\n  vColor = vec4(instanceColors.rgb, instanceColors.a * opacity);\n\n  float isEnd = positions.x;\n\n  vec3 prevPosition = mix(instanceLeftPositions, instanceStartPositions, isEnd);\n  vec3 prevPosition64Low = mix(instanceLeftPositions64Low, instanceStartPositions64Low, isEnd);\n\n  vec3 currPosition = mix(instanceStartPositions, instanceEndPositions, isEnd);\n  vec3 currPosition64Low = mix(instanceStartPositions64Low, instanceEndPositions64Low, isEnd);\n\n  vec3 nextPosition = mix(instanceEndPositions, instanceRightPositions, isEnd);\n  vec3 nextPosition64Low = mix(instanceEndPositions64Low, instanceRightPositions64Low, isEnd);\n\n  if (billboard) {\n    vec4 prevPositionScreen = project_position_to_clipspace(prevPosition, prevPosition64Low, ZERO_OFFSET);\n    vec4 currPositionScreen = project_position_to_clipspace(currPosition, currPosition64Low, ZERO_OFFSET, geometry.position);\n    vec4 nextPositionScreen = project_position_to_clipspace(nextPosition, nextPosition64Low, ZERO_OFFSET);\n\n    clipLine(prevPositionScreen, currPositionScreen);\n    clipLine(nextPositionScreen, currPositionScreen);\n    clipLine(currPositionScreen, mix(nextPositionScreen, prevPositionScreen, isEnd));\n\n    width = vec3(widthPixels, 0.0);\n    DECKGL_FILTER_SIZE(width, geometry);\n\n    vec3 pos = lineJoin(\n      prevPositionScreen.xyz / prevPositionScreen.w,\n      currPositionScreen.xyz / currPositionScreen.w,\n      nextPositionScreen.xyz / nextPositionScreen.w,\n      project_pixel_size_to_clipspace(width.xy)\n    );\n\n    gl_Position = vec4(pos * currPositionScreen.w, currPositionScreen.w);\n  } else {\n    prevPosition = project_position(prevPosition, prevPosition64Low);\n    currPosition = project_position(currPosition, currPosition64Low);\n    nextPosition = project_position(nextPosition, nextPosition64Low);\n\n    width = vec3(project_pixel_size(widthPixels), 0.0);\n    DECKGL_FILTER_SIZE(width, geometry);\n\n    vec4 pos = vec4(\n      lineJoin(prevPosition, currPosition, nextPosition, width.xy),\n      1.0);\n    geometry.position = pos;\n    gl_Position = project_common_position_to_clipspace(pos);\n  }\n  DECKGL_FILTER_GL_POSITION(gl_Position, geometry);\n  DECKGL_FILTER_COLOR(vColor, geometry);\n}\n";

var fs$1 = "#define SHADER_NAME path-layer-fragment-shader\n\nprecision highp float;\n\nuniform float jointType;\nuniform float miterLimit;\n\nvarying vec4 vColor;\nvarying vec2 vCornerOffset;\nvarying float vMiterLength;\nvarying vec2 vPathPosition;\nvarying float vPathLength;\n\nvoid main(void) {\n  geometry.uv = vPathPosition;\n\n  if (vPathPosition.y < 0.0 || vPathPosition.y > vPathLength) {\n    if (jointType > 0.0 && length(vCornerOffset) > 1.0) {\n      discard;\n    }\n    if (jointType == 0.0 && vMiterLength > miterLimit + 1.0) {\n      discard;\n    }\n  }\n  gl_FragColor = vColor;\n\n  DECKGL_FILTER_COLOR(gl_FragColor, geometry);\n}\n";

function _createSuper$4(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct$4(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _isNativeReflectConstruct$4() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }
var DEFAULT_COLOR$1 = [0, 0, 0, 255];
var defaultProps$1 = {
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

  var _super = _createSuper$4(PathLayer);

  function PathLayer() {
    _classCallCheck(this, PathLayer);

    return _super.apply(this, arguments);
  }

  _createClass(PathLayer, [{
    key: "getShaders",
    value: function getShaders() {
      return _get(_getPrototypeOf(PathLayer.prototype), "getShaders", this).call(this, {
        vs: vs$1,
        fs: fs$1,
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
PathLayer.defaultProps = defaultProps$1;

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

function _createForOfIteratorHelper$1(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray$1(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray$1(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray$1(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray$1(o, minLen); }

function _arrayLikeToArray$1(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _createSuper$5(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct$5(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _isNativeReflectConstruct$5() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }
var defaultLineColor = [0, 0, 0, 255];
var defaultFillColor = [0, 0, 0, 255];
var defaultProps$2 = {
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

  var _super = _createSuper$5(GeoJsonLayer);

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

        var _iterator = _createForOfIteratorHelper$1(changeFlags.dataChanged),
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
GeoJsonLayer.defaultProps = defaultProps$2;

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
      assert(Number.isFinite(distance));
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
      assert(equals(this.normal.len(), 1));
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
    value: function equals$1(right) {
      return equals(this.distance, right.distance) && equals(this.normal, right.normal);
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

function _createForOfIteratorHelper$2(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray$2(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray$2(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray$2(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray$2(o, minLen); }

function _arrayLikeToArray$2(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }
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
    assert(this.planes.every(function (plane) {
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

      var _iterator = _createForOfIteratorHelper$2(faces),
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
      assert(boundingVolume);
      var intersect = INTERSECTION.INSIDE;

      var _iterator2 = _createForOfIteratorHelper$2(this.planes),
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
      assert(boundingVolume, 'boundingVolume is required.');
      assert(Number.isFinite(parentPlaneMask), 'parentPlaneMask is required.');

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

function ownKeys$2(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread$2(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys$2(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys$2(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }
var scratchPlaneUpVector = new Vector3();
var scratchPlaneRightVector = new Vector3();
var scratchPlaneNearCenter = new Vector3();
var scratchPlaneFarCenter = new Vector3();
var scratchPlaneNormal$1 = new Vector3();

var PerspectiveOffCenterFrustum = function () {
  function PerspectiveOffCenterFrustum() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, PerspectiveOffCenterFrustum);

    options = _objectSpread$2({
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
    this._perspectiveMatrix = new Matrix4();
    this._infinitePerspective = new Matrix4();
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
      assert(position, 'position is required.');
      assert(direction, 'direction is required.');
      assert(up, 'up is required.');
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
      assert(Number.isFinite(drawingBufferWidth) && Number.isFinite(drawingBufferHeight));
      assert(drawingBufferWidth > 0);
      assert(drawingBufferHeight > 0);
      assert(distance > 0);
      assert(result);
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
  assert(Number.isFinite(frustum.right) && Number.isFinite(frustum.left) && Number.isFinite(frustum.top) && Number.isFinite(frustum.bottom) && Number.isFinite(frustum.near) && Number.isFinite(frustum.far));
  var top = frustum.top,
      bottom = frustum.bottom,
      right = frustum.right,
      left = frustum.left,
      near = frustum.near,
      far = frustum.far;

  if (top !== frustum._top || bottom !== frustum._bottom || left !== frustum._left || right !== frustum._right || near !== frustum._near || far !== frustum._far) {
    assert(frustum.near > 0 && frustum.near < frustum.far, 'near must be greater than zero and less than far.');
    frustum._left = left;
    frustum._right = right;
    frustum._top = top;
    frustum._bottom = bottom;
    frustum._near = near;
    frustum._far = far;
    frustum._perspectiveMatrix = new Matrix4().frustum({
      left: left,
      right: right,
      bottom: bottom,
      top: top,
      near: near,
      far: far
    });
    frustum._infinitePerspective = new Matrix4().frustum({
      left: left,
      right: right,
      bottom: bottom,
      top: top,
      near: near,
      far: Infinity
    });
  }
}

function ownKeys$3(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread$3(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys$3(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys$3(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

var defined = function defined(val) {
  return val !== null && typeof val !== 'undefined';
};

var PerspectiveFrustum = function () {
  function PerspectiveFrustum() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, PerspectiveFrustum);

    options = _objectSpread$3({
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
  assert(Number.isFinite(frustum.fov) && Number.isFinite(frustum.aspectRatio) && Number.isFinite(frustum.near) && Number.isFinite(frustum.far));
  var f = frustum._offCenterFrustum;

  if (frustum.fov !== frustum._fov || frustum.aspectRatio !== frustum._aspectRatio || frustum.near !== frustum._near || frustum.far !== frustum._far || frustum.xOffset !== frustum._xOffset || frustum.yOffset !== frustum._yOffset) {
    assert(frustum.fov >= 0 && frustum.fov < Math.PI);
    assert(frustum.aspectRatio > 0);
    assert(frustum.near >= 0 && frustum.near < frustum.far);
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

function _createForOfIteratorHelper$3(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray$3(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray$3(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray$3(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray$3(o, minLen); }

function _arrayLikeToArray$3(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }
var TILE_SIZE = 512;
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

      var _iterator = _createForOfIteratorHelper$3(this.children),
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
        var _iterator2 = _createForOfIteratorHelper$3(this._children),
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
      var extent = TILE_SIZE / scale;
      var originX = this.x * extent + worldOffset * TILE_SIZE;
      var originY = TILE_SIZE - (this.y + 1) * extent;
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

var TILE_SIZE$1 = 512;
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

function getBoundingBox(viewport, zRange, extent) {
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

  return [Math.max(bounds[0], extent[0]), Math.max(bounds[1], extent[1]), Math.min(bounds[2], extent[2]), Math.min(bounds[3], extent[3])];
}

function getTileIndex(_ref, scale) {
  var _ref2 = _slicedToArray(_ref, 2),
      x = _ref2[0],
      y = _ref2[1];

  return [x * scale / TILE_SIZE$1, y * scale / TILE_SIZE$1];
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
  return [x / scale * TILE_SIZE$1, y / scale * TILE_SIZE$1];
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

function getIdentityTileIndices(viewport, z, extent) {
  var bbox = getBoundingBox(viewport, null, extent);
  var scale = getScale(z);

  var _getTileIndex = getTileIndex([bbox[0], bbox[1]], scale),
      _getTileIndex2 = _slicedToArray(_getTileIndex, 2),
      minX = _getTileIndex2[0],
      minY = _getTileIndex2[1];

  var _getTileIndex3 = getTileIndex([bbox[2], bbox[3]], scale),
      _getTileIndex4 = _slicedToArray(_getTileIndex3, 2),
      maxX = _getTileIndex4[0],
      maxY = _getTileIndex4[1];

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

function getTileIndices(_ref3) {
  var viewport = _ref3.viewport,
      maxZoom = _ref3.maxZoom,
      minZoom = _ref3.minZoom,
      zRange = _ref3.zRange,
      extent = _ref3.extent,
      _ref3$tileSize = _ref3.tileSize,
      tileSize = _ref3$tileSize === void 0 ? TILE_SIZE$1 : _ref3$tileSize;
  var z = Math.round(viewport.zoom + Math.log2(TILE_SIZE$1 / tileSize));

  if (Number.isFinite(minZoom) && z < minZoom) {
    if (!extent) {
      return [];
    }

    z = minZoom;
  }

  if (Number.isFinite(maxZoom) && z > maxZoom) {
    z = maxZoom;
  }

  return viewport.isGeospatial ? getOSMTileIndices(viewport, z, zRange) : getIdentityTileIndices(viewport, z, extent || DEFAULT_EXTENT);
}

function _createForOfIteratorHelper$4(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray$4(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray$4(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray$4(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray$4(o, minLen); }

function _arrayLikeToArray$4(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }
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
          zRange = _ref.zRange;

      if (!viewport.equals(this._viewport)) {
        this._viewport = viewport;
        var tileIndices = this.getTileIndices({
          viewport: viewport,
          maxZoom: this._maxZoom,
          minZoom: this._minZoom,
          zRange: zRange
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
          zRange = _ref2.zRange;
      var _this$opts = this.opts,
          tileSize = _this$opts.tileSize,
          extent = _this$opts.extent;
      return getTileIndices({
        viewport: viewport,
        maxZoom: maxZoom,
        minZoom: minZoom,
        zRange: zRange,
        tileSize: tileSize,
        extent: extent
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

      var _iterator = _createForOfIteratorHelper$4(this._cache.values()),
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

      var _iterator2 = _createForOfIteratorHelper$4(_cache.values()),
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

      var _iterator3 = _createForOfIteratorHelper$4(_cache.values()),
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

      var _iterator4 = _createForOfIteratorHelper$4(_cache.values()),
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

      var _iterator5 = _createForOfIteratorHelper$4(selectedTiles),
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

      var _iterator6 = _createForOfIteratorHelper$4(selectedTiles),
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

      var _iterator7 = _createForOfIteratorHelper$4(selectedTiles),
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
        var _iterator8 = _createForOfIteratorHelper$4(_cache),
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
  var _iterator9 = _createForOfIteratorHelper$4(tile.children),
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

function _createSuper$6(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct$6(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _isNativeReflectConstruct$6() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function ownKeys$4(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread$4(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys$4(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys$4(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }
var defaultProps$3 = {
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

      var loadOptions = _objectSpread$4({
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

  var _super = _createSuper$6(TileLayer);

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
        var maxZoom = props.maxZoom,
            minZoom = props.minZoom,
            tileSize = props.tileSize,
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
          onViewportLoad = _this$props.onViewportLoad,
          zRange = _this$props.zRange;
      var frameNumber = tileset.update(this.context.viewport, {
        zRange: zRange
      });
      var isLoaded = tileset.isLoaded;
      var loadingStateChanged = this.state.isLoaded !== isLoaded;
      var tilesetChanged = this.state.frameNumber !== frameNumber;

      if (isLoaded && onViewportLoad && (loadingStateChanged || tilesetChanged)) {
        onViewportLoad(tileset.selectedTiles.map(function (tile) {
          return tile.data;
        }));
      }

      if (tilesetChanged) {
        this.setState({
          frameNumber: frameNumber
        });
      }

      this.state.isLoaded = isLoaded;
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
TileLayer.defaultProps = defaultProps$3;

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
        jObj[tagname].push(convertToJson(node.child[tagname][tag], options));
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
  xmlData = xmlData.replace(/(\r\n)|\n/, " ");
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
          tagName = tagExp.substr(0, separatorIndex).trimRight();
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
var validate = function (xmlData, options) {
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
	validate: validate
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

var fs$2 = "#define GLSLIFY 1\nvec4 jet(float x_17){const float e0=0.0;const vec4 v0=vec4(0,0,0.5137254901960784,1);const float e1=0.125;const vec4 v1=vec4(0,0.23529411764705882,0.6666666666666666,1);const float e2=0.375;const vec4 v2=vec4(0.0196078431372549,1,1,1);const float e3=0.625;const vec4 v3=vec4(1,1,0,1);const float e4=0.875;const vec4 v4=vec4(0.9803921568627451,0,0,1);const float e5=1.0;const vec4 v5=vec4(0.5019607843137255,0,0,1);float a0=smoothstep(e0,e1,x_17);float a1=smoothstep(e1,e2,x_17);float a2=smoothstep(e2,e3,x_17);float a3=smoothstep(e3,e4,x_17);float a4=smoothstep(e4,e5,x_17);return max(mix(v0,v1,a0)*step(e0,x_17)*step(x_17,e1),max(mix(v1,v2,a1)*step(e1,x_17)*step(x_17,e2),max(mix(v2,v3,a2)*step(e2,x_17)*step(x_17,e3),max(mix(v3,v4,a3)*step(e3,x_17)*step(x_17,e4),mix(v4,v5,a4)*step(e4,x_17)*step(x_17,e5)))));}vec4 hsv_0(float x_18){const float e0=0.0;const vec4 v0=vec4(1,0,0,1);const float e1=0.169;const vec4 v1=vec4(0.9921568627450981,1,0.00784313725490196,1);const float e2=0.173;const vec4 v2=vec4(0.9686274509803922,1,0.00784313725490196,1);const float e3=0.337;const vec4 v3=vec4(0,0.9882352941176471,0.01568627450980392,1);const float e4=0.341;const vec4 v4=vec4(0,0.9882352941176471,0.0392156862745098,1);const float e5=0.506;const vec4 v5=vec4(0.00392156862745098,0.9764705882352941,1,1);const float e6=0.671;const vec4 v6=vec4(0.00784313725490196,0,0.9921568627450981,1);const float e7=0.675;const vec4 v7=vec4(0.03137254901960784,0,0.9921568627450981,1);const float e8=0.839;const vec4 v8=vec4(1,0,0.984313725490196,1);const float e9=0.843;const vec4 v9=vec4(1,0,0.9607843137254902,1);const float e10=1.0;const vec4 v10=vec4(1,0,0.023529411764705882,1);float a0=smoothstep(e0,e1,x_18);float a1=smoothstep(e1,e2,x_18);float a2=smoothstep(e2,e3,x_18);float a3=smoothstep(e3,e4,x_18);float a4=smoothstep(e4,e5,x_18);float a5=smoothstep(e5,e6,x_18);float a6=smoothstep(e6,e7,x_18);float a7=smoothstep(e7,e8,x_18);float a8=smoothstep(e8,e9,x_18);float a9=smoothstep(e9,e10,x_18);return max(mix(v0,v1,a0)*step(e0,x_18)*step(x_18,e1),max(mix(v1,v2,a1)*step(e1,x_18)*step(x_18,e2),max(mix(v2,v3,a2)*step(e2,x_18)*step(x_18,e3),max(mix(v3,v4,a3)*step(e3,x_18)*step(x_18,e4),max(mix(v4,v5,a4)*step(e4,x_18)*step(x_18,e5),max(mix(v5,v6,a5)*step(e5,x_18)*step(x_18,e6),max(mix(v6,v7,a6)*step(e6,x_18)*step(x_18,e7),max(mix(v7,v8,a7)*step(e7,x_18)*step(x_18,e8),max(mix(v8,v9,a8)*step(e8,x_18)*step(x_18,e9),mix(v9,v10,a9)*step(e9,x_18)*step(x_18,e10))))))))));}vec4 hot(float x_13){const float e0=0.0;const vec4 v0=vec4(0,0,0,1);const float e1=0.3;const vec4 v1=vec4(0.9019607843137255,0,0,1);const float e2=0.6;const vec4 v2=vec4(1,0.8235294117647058,0,1);const float e3=1.0;const vec4 v3=vec4(1,1,1,1);float a0=smoothstep(e0,e1,x_13);float a1=smoothstep(e1,e2,x_13);float a2=smoothstep(e2,e3,x_13);return max(mix(v0,v1,a0)*step(e0,x_13)*step(x_13,e1),max(mix(v1,v2,a1)*step(e1,x_13)*step(x_13,e2),mix(v2,v3,a2)*step(e2,x_13)*step(x_13,e3)));}vec4 cool(float x_24){const float e0=0.0;const vec4 v0=vec4(0.49019607843137253,0,0.7019607843137254,1);const float e1=0.13;const vec4 v1=vec4(0.4549019607843137,0,0.8549019607843137,1);const float e2=0.25;const vec4 v2=vec4(0.3843137254901961,0.2901960784313726,0.9294117647058824,1);const float e3=0.38;const vec4 v3=vec4(0.26666666666666666,0.5725490196078431,0.9058823529411765,1);const float e4=0.5;const vec4 v4=vec4(0,0.8,0.7725490196078432,1);const float e5=0.63;const vec4 v5=vec4(0,0.9686274509803922,0.5725490196078431,1);const float e6=0.75;const vec4 v6=vec4(0,1,0.34509803921568627,1);const float e7=0.88;const vec4 v7=vec4(0.1568627450980392,1,0.03137254901960784,1);const float e8=1.0;const vec4 v8=vec4(0.5764705882352941,1,0,1);float a0=smoothstep(e0,e1,x_24);float a1=smoothstep(e1,e2,x_24);float a2=smoothstep(e2,e3,x_24);float a3=smoothstep(e3,e4,x_24);float a4=smoothstep(e4,e5,x_24);float a5=smoothstep(e5,e6,x_24);float a6=smoothstep(e6,e7,x_24);float a7=smoothstep(e7,e8,x_24);return max(mix(v0,v1,a0)*step(e0,x_24)*step(x_24,e1),max(mix(v1,v2,a1)*step(e1,x_24)*step(x_24,e2),max(mix(v2,v3,a2)*step(e2,x_24)*step(x_24,e3),max(mix(v3,v4,a3)*step(e3,x_24)*step(x_24,e4),max(mix(v4,v5,a4)*step(e4,x_24)*step(x_24,e5),max(mix(v5,v6,a5)*step(e5,x_24)*step(x_24,e6),max(mix(v6,v7,a6)*step(e6,x_24)*step(x_24,e7),mix(v7,v8,a7)*step(e7,x_24)*step(x_24,e8))))))));}vec4 spring(float x_5){const float e0=0.0;const vec4 v0=vec4(1,0,1,1);const float e1=1.0;const vec4 v1=vec4(1,1,0,1);float a0=smoothstep(e0,e1,x_5);return mix(v0,v1,a0)*step(e0,x_5)*step(x_5,e1);}vec4 summer(float x_12){const float e0=0.0;const vec4 v0=vec4(0,0.5019607843137255,0.4,1);const float e1=1.0;const vec4 v1=vec4(1,1,0.4,1);float a0=smoothstep(e0,e1,x_12);return mix(v0,v1,a0)*step(e0,x_12)*step(x_12,e1);}vec4 autumn(float x_25){const float e0=0.0;const vec4 v0=vec4(1,0,0,1);const float e1=1.0;const vec4 v1=vec4(1,1,0,1);float a0=smoothstep(e0,e1,x_25);return mix(v0,v1,a0)*step(e0,x_25)*step(x_25,e1);}vec4 winter(float x_16){const float e0=0.0;const vec4 v0=vec4(0,0,1,1);const float e1=1.0;const vec4 v1=vec4(0,1,0.5019607843137255,1);float a0=smoothstep(e0,e1,x_16);return mix(v0,v1,a0)*step(e0,x_16)*step(x_16,e1);}vec4 bone(float x_15){const float e0=0.0;const vec4 v0=vec4(0,0,0,1);const float e1=0.376;const vec4 v1=vec4(0.32941176470588235,0.32941176470588235,0.4549019607843137,1);const float e2=0.753;const vec4 v2=vec4(0.6627450980392157,0.7843137254901961,0.7843137254901961,1);const float e3=1.0;const vec4 v3=vec4(1,1,1,1);float a0=smoothstep(e0,e1,x_15);float a1=smoothstep(e1,e2,x_15);float a2=smoothstep(e2,e3,x_15);return max(mix(v0,v1,a0)*step(e0,x_15)*step(x_15,e1),max(mix(v1,v2,a1)*step(e1,x_15)*step(x_15,e2),mix(v2,v3,a2)*step(e2,x_15)*step(x_15,e3)));}vec4 copper(float x_10){const float e0=0.0;const vec4 v0=vec4(0,0,0,1);const float e1=0.804;const vec4 v1=vec4(1,0.6274509803921569,0.4,1);const float e2=1.0;const vec4 v2=vec4(1,0.7803921568627451,0.4980392156862745,1);float a0=smoothstep(e0,e1,x_10);float a1=smoothstep(e1,e2,x_10);return max(mix(v0,v1,a0)*step(e0,x_10)*step(x_10,e1),mix(v1,v2,a1)*step(e1,x_10)*step(x_10,e2));}vec4 greys(float x_4){const float e0=0.0;const vec4 v0=vec4(0,0,0,1);const float e1=1.0;const vec4 v1=vec4(1,1,1,1);float a0=smoothstep(e0,e1,x_4);return mix(v0,v1,a0)*step(e0,x_4)*step(x_4,e1);}vec4 yignbu(float x_32){const float e0=0.0;const vec4 v0=vec4(0.03137254901960784,0.11372549019607843,0.34509803921568627,1);const float e1=0.125;const vec4 v1=vec4(0.1450980392156863,0.20392156862745098,0.5803921568627451,1);const float e2=0.25;const vec4 v2=vec4(0.13333333333333333,0.3686274509803922,0.6588235294117647,1);const float e3=0.375;const vec4 v3=vec4(0.11372549019607843,0.5686274509803921,0.7529411764705882,1);const float e4=0.5;const vec4 v4=vec4(0.2549019607843137,0.7137254901960784,0.7686274509803922,1);const float e5=0.625;const vec4 v5=vec4(0.4980392156862745,0.803921568627451,0.7333333333333333,1);const float e6=0.75;const vec4 v6=vec4(0.7803921568627451,0.9137254901960784,0.7058823529411765,1);const float e7=0.875;const vec4 v7=vec4(0.9294117647058824,0.9725490196078431,0.8509803921568627,1);const float e8=1.0;const vec4 v8=vec4(1,1,0.8509803921568627,1);float a0=smoothstep(e0,e1,x_32);float a1=smoothstep(e1,e2,x_32);float a2=smoothstep(e2,e3,x_32);float a3=smoothstep(e3,e4,x_32);float a4=smoothstep(e4,e5,x_32);float a5=smoothstep(e5,e6,x_32);float a6=smoothstep(e6,e7,x_32);float a7=smoothstep(e7,e8,x_32);return max(mix(v0,v1,a0)*step(e0,x_32)*step(x_32,e1),max(mix(v1,v2,a1)*step(e1,x_32)*step(x_32,e2),max(mix(v2,v3,a2)*step(e2,x_32)*step(x_32,e3),max(mix(v3,v4,a3)*step(e3,x_32)*step(x_32,e4),max(mix(v4,v5,a4)*step(e4,x_32)*step(x_32,e5),max(mix(v5,v6,a5)*step(e5,x_32)*step(x_32,e6),max(mix(v6,v7,a6)*step(e6,x_32)*step(x_32,e7),mix(v7,v8,a7)*step(e7,x_32)*step(x_32,e8))))))));}vec4 greens(float x_34){const float e0=0.0;const vec4 v0=vec4(0,0.26666666666666666,0.10588235294117647,1);const float e1=0.125;const vec4 v1=vec4(0,0.42745098039215684,0.17254901960784313,1);const float e2=0.25;const vec4 v2=vec4(0.13725490196078433,0.5450980392156862,0.27058823529411763,1);const float e3=0.375;const vec4 v3=vec4(0.2549019607843137,0.6705882352941176,0.36470588235294116,1);const float e4=0.5;const vec4 v4=vec4(0.4549019607843137,0.7686274509803922,0.4627450980392157,1);const float e5=0.625;const vec4 v5=vec4(0.6313725490196078,0.8509803921568627,0.6078431372549019,1);const float e6=0.75;const vec4 v6=vec4(0.7803921568627451,0.9137254901960784,0.7529411764705882,1);const float e7=0.875;const vec4 v7=vec4(0.8980392156862745,0.9607843137254902,0.8784313725490196,1);const float e8=1.0;const vec4 v8=vec4(0.9686274509803922,0.9882352941176471,0.9607843137254902,1);float a0=smoothstep(e0,e1,x_34);float a1=smoothstep(e1,e2,x_34);float a2=smoothstep(e2,e3,x_34);float a3=smoothstep(e3,e4,x_34);float a4=smoothstep(e4,e5,x_34);float a5=smoothstep(e5,e6,x_34);float a6=smoothstep(e6,e7,x_34);float a7=smoothstep(e7,e8,x_34);return max(mix(v0,v1,a0)*step(e0,x_34)*step(x_34,e1),max(mix(v1,v2,a1)*step(e1,x_34)*step(x_34,e2),max(mix(v2,v3,a2)*step(e2,x_34)*step(x_34,e3),max(mix(v3,v4,a3)*step(e3,x_34)*step(x_34,e4),max(mix(v4,v5,a4)*step(e4,x_34)*step(x_34,e5),max(mix(v5,v6,a5)*step(e5,x_34)*step(x_34,e6),max(mix(v6,v7,a6)*step(e6,x_34)*step(x_34,e7),mix(v7,v8,a7)*step(e7,x_34)*step(x_34,e8))))))));}vec4 yiorrd(float x_41){const float e0=0.0;const vec4 v0=vec4(0.5019607843137255,0,0.14901960784313725,1);const float e1=0.125;const vec4 v1=vec4(0.7411764705882353,0,0.14901960784313725,1);const float e2=0.25;const vec4 v2=vec4(0.8901960784313725,0.10196078431372549,0.10980392156862745,1);const float e3=0.375;const vec4 v3=vec4(0.9882352941176471,0.3058823529411765,0.16470588235294117,1);const float e4=0.5;const vec4 v4=vec4(0.9921568627450981,0.5529411764705883,0.23529411764705882,1);const float e5=0.625;const vec4 v5=vec4(0.996078431372549,0.6980392156862745,0.2980392156862745,1);const float e6=0.75;const vec4 v6=vec4(0.996078431372549,0.8509803921568627,0.4627450980392157,1);const float e7=0.875;const vec4 v7=vec4(1,0.9294117647058824,0.6274509803921569,1);const float e8=1.0;const vec4 v8=vec4(1,1,0.8,1);float a0=smoothstep(e0,e1,x_41);float a1=smoothstep(e1,e2,x_41);float a2=smoothstep(e2,e3,x_41);float a3=smoothstep(e3,e4,x_41);float a4=smoothstep(e4,e5,x_41);float a5=smoothstep(e5,e6,x_41);float a6=smoothstep(e6,e7,x_41);float a7=smoothstep(e7,e8,x_41);return max(mix(v0,v1,a0)*step(e0,x_41)*step(x_41,e1),max(mix(v1,v2,a1)*step(e1,x_41)*step(x_41,e2),max(mix(v2,v3,a2)*step(e2,x_41)*step(x_41,e3),max(mix(v3,v4,a3)*step(e3,x_41)*step(x_41,e4),max(mix(v4,v5,a4)*step(e4,x_41)*step(x_41,e5),max(mix(v5,v6,a5)*step(e5,x_41)*step(x_41,e6),max(mix(v6,v7,a6)*step(e6,x_41)*step(x_41,e7),mix(v7,v8,a7)*step(e7,x_41)*step(x_41,e8))))))));}vec4 bluered(float x_23){const float e0=0.0;const vec4 v0=vec4(0,0,1,1);const float e1=1.0;const vec4 v1=vec4(1,0,0,1);float a0=smoothstep(e0,e1,x_23);return mix(v0,v1,a0)*step(e0,x_23)*step(x_23,e1);}vec4 rdbu(float x_1){const float e0=0.0;const vec4 v0=vec4(0.0196078431372549,0.0392156862745098,0.6745098039215687,1);const float e1=0.35;const vec4 v1=vec4(0.41568627450980394,0.5372549019607843,0.9686274509803922,1);const float e2=0.5;const vec4 v2=vec4(0.7450980392156863,0.7450980392156863,0.7450980392156863,1);const float e3=0.6;const vec4 v3=vec4(0.8627450980392157,0.6666666666666666,0.5176470588235295,1);const float e4=0.7;const vec4 v4=vec4(0.9019607843137255,0.5686274509803921,0.35294117647058826,1);const float e5=1.0;const vec4 v5=vec4(0.6980392156862745,0.0392156862745098,0.10980392156862745,1);float a0=smoothstep(e0,e1,x_1);float a1=smoothstep(e1,e2,x_1);float a2=smoothstep(e2,e3,x_1);float a3=smoothstep(e3,e4,x_1);float a4=smoothstep(e4,e5,x_1);return max(mix(v0,v1,a0)*step(e0,x_1)*step(x_1,e1),max(mix(v1,v2,a1)*step(e1,x_1)*step(x_1,e2),max(mix(v2,v3,a2)*step(e2,x_1)*step(x_1,e3),max(mix(v3,v4,a3)*step(e3,x_1)*step(x_1,e4),mix(v4,v5,a4)*step(e4,x_1)*step(x_1,e5)))));}vec4 picnic(float x_42){const float e0=0.0;const vec4 v0=vec4(0,0,1,1);const float e1=0.1;const vec4 v1=vec4(0.2,0.6,1,1);const float e2=0.2;const vec4 v2=vec4(0.4,0.8,1,1);const float e3=0.3;const vec4 v3=vec4(0.6,0.8,1,1);const float e4=0.4;const vec4 v4=vec4(0.8,0.8,1,1);const float e5=0.5;const vec4 v5=vec4(1,1,1,1);const float e6=0.6;const vec4 v6=vec4(1,0.8,1,1);const float e7=0.7;const vec4 v7=vec4(1,0.6,1,1);const float e8=0.8;const vec4 v8=vec4(1,0.4,0.8,1);const float e9=0.9;const vec4 v9=vec4(1,0.4,0.4,1);const float e10=1.0;const vec4 v10=vec4(1,0,0,1);float a0=smoothstep(e0,e1,x_42);float a1=smoothstep(e1,e2,x_42);float a2=smoothstep(e2,e3,x_42);float a3=smoothstep(e3,e4,x_42);float a4=smoothstep(e4,e5,x_42);float a5=smoothstep(e5,e6,x_42);float a6=smoothstep(e6,e7,x_42);float a7=smoothstep(e7,e8,x_42);float a8=smoothstep(e8,e9,x_42);float a9=smoothstep(e9,e10,x_42);return max(mix(v0,v1,a0)*step(e0,x_42)*step(x_42,e1),max(mix(v1,v2,a1)*step(e1,x_42)*step(x_42,e2),max(mix(v2,v3,a2)*step(e2,x_42)*step(x_42,e3),max(mix(v3,v4,a3)*step(e3,x_42)*step(x_42,e4),max(mix(v4,v5,a4)*step(e4,x_42)*step(x_42,e5),max(mix(v5,v6,a5)*step(e5,x_42)*step(x_42,e6),max(mix(v6,v7,a6)*step(e6,x_42)*step(x_42,e7),max(mix(v7,v8,a7)*step(e7,x_42)*step(x_42,e8),max(mix(v8,v9,a8)*step(e8,x_42)*step(x_42,e9),mix(v9,v10,a9)*step(e9,x_42)*step(x_42,e10))))))))));}vec4 rainbow(float x_31){const float e0=0.0;const vec4 v0=vec4(0.5882352941176471,0,0.35294117647058826,1);const float e1=0.125;const vec4 v1=vec4(0,0,0.7843137254901961,1);const float e2=0.25;const vec4 v2=vec4(0,0.09803921568627451,1,1);const float e3=0.375;const vec4 v3=vec4(0,0.596078431372549,1,1);const float e4=0.5;const vec4 v4=vec4(0.17254901960784313,1,0.5882352941176471,1);const float e5=0.625;const vec4 v5=vec4(0.592156862745098,1,0,1);const float e6=0.75;const vec4 v6=vec4(1,0.9176470588235294,0,1);const float e7=0.875;const vec4 v7=vec4(1,0.43529411764705883,0,1);const float e8=1.0;const vec4 v8=vec4(1,0,0,1);float a0=smoothstep(e0,e1,x_31);float a1=smoothstep(e1,e2,x_31);float a2=smoothstep(e2,e3,x_31);float a3=smoothstep(e3,e4,x_31);float a4=smoothstep(e4,e5,x_31);float a5=smoothstep(e5,e6,x_31);float a6=smoothstep(e6,e7,x_31);float a7=smoothstep(e7,e8,x_31);return max(mix(v0,v1,a0)*step(e0,x_31)*step(x_31,e1),max(mix(v1,v2,a1)*step(e1,x_31)*step(x_31,e2),max(mix(v2,v3,a2)*step(e2,x_31)*step(x_31,e3),max(mix(v3,v4,a3)*step(e3,x_31)*step(x_31,e4),max(mix(v4,v5,a4)*step(e4,x_31)*step(x_31,e5),max(mix(v5,v6,a5)*step(e5,x_31)*step(x_31,e6),max(mix(v6,v7,a6)*step(e6,x_31)*step(x_31,e7),mix(v7,v8,a7)*step(e7,x_31)*step(x_31,e8))))))));}vec4 portland(float x_21){const float e0=0.0;const vec4 v0=vec4(0.047058823529411764,0.2,0.5137254901960784,1);const float e1=0.25;const vec4 v1=vec4(0.0392156862745098,0.5333333333333333,0.7294117647058823,1);const float e2=0.5;const vec4 v2=vec4(0.9490196078431372,0.8274509803921568,0.2196078431372549,1);const float e3=0.75;const vec4 v3=vec4(0.9490196078431372,0.5607843137254902,0.2196078431372549,1);const float e4=1.0;const vec4 v4=vec4(0.8509803921568627,0.11764705882352941,0.11764705882352941,1);float a0=smoothstep(e0,e1,x_21);float a1=smoothstep(e1,e2,x_21);float a2=smoothstep(e2,e3,x_21);float a3=smoothstep(e3,e4,x_21);return max(mix(v0,v1,a0)*step(e0,x_21)*step(x_21,e1),max(mix(v1,v2,a1)*step(e1,x_21)*step(x_21,e2),max(mix(v2,v3,a2)*step(e2,x_21)*step(x_21,e3),mix(v3,v4,a3)*step(e3,x_21)*step(x_21,e4))));}vec4 blackbody(float x_38){const float e0=0.0;const vec4 v0=vec4(0,0,0,1);const float e1=0.2;const vec4 v1=vec4(0.9019607843137255,0,0,1);const float e2=0.4;const vec4 v2=vec4(0.9019607843137255,0.8235294117647058,0,1);const float e3=0.7;const vec4 v3=vec4(1,1,1,1);const float e4=1.0;const vec4 v4=vec4(0.6274509803921569,0.7843137254901961,1,1);float a0=smoothstep(e0,e1,x_38);float a1=smoothstep(e1,e2,x_38);float a2=smoothstep(e2,e3,x_38);float a3=smoothstep(e3,e4,x_38);return max(mix(v0,v1,a0)*step(e0,x_38)*step(x_38,e1),max(mix(v1,v2,a1)*step(e1,x_38)*step(x_38,e2),max(mix(v2,v3,a2)*step(e2,x_38)*step(x_38,e3),mix(v3,v4,a3)*step(e3,x_38)*step(x_38,e4))));}vec4 earth(float x_29){const float e0=0.0;const vec4 v0=vec4(0,0,0.5098039215686274,1);const float e1=0.1;const vec4 v1=vec4(0,0.7058823529411765,0.7058823529411765,1);const float e2=0.2;const vec4 v2=vec4(0.1568627450980392,0.8235294117647058,0.1568627450980392,1);const float e3=0.4;const vec4 v3=vec4(0.9019607843137255,0.9019607843137255,0.19607843137254902,1);const float e4=0.6;const vec4 v4=vec4(0.47058823529411764,0.27450980392156865,0.0784313725490196,1);const float e5=1.0;const vec4 v5=vec4(1,1,1,1);float a0=smoothstep(e0,e1,x_29);float a1=smoothstep(e1,e2,x_29);float a2=smoothstep(e2,e3,x_29);float a3=smoothstep(e3,e4,x_29);float a4=smoothstep(e4,e5,x_29);return max(mix(v0,v1,a0)*step(e0,x_29)*step(x_29,e1),max(mix(v1,v2,a1)*step(e1,x_29)*step(x_29,e2),max(mix(v2,v3,a2)*step(e2,x_29)*step(x_29,e3),max(mix(v3,v4,a3)*step(e3,x_29)*step(x_29,e4),mix(v4,v5,a4)*step(e4,x_29)*step(x_29,e5)))));}vec4 electric(float x_9){const float e0=0.0;const vec4 v0=vec4(0,0,0,1);const float e1=0.15;const vec4 v1=vec4(0.11764705882352941,0,0.39215686274509803,1);const float e2=0.4;const vec4 v2=vec4(0.47058823529411764,0,0.39215686274509803,1);const float e3=0.6;const vec4 v3=vec4(0.6274509803921569,0.35294117647058826,0,1);const float e4=0.8;const vec4 v4=vec4(0.9019607843137255,0.7843137254901961,0,1);const float e5=1.0;const vec4 v5=vec4(1,0.9803921568627451,0.8627450980392157,1);float a0=smoothstep(e0,e1,x_9);float a1=smoothstep(e1,e2,x_9);float a2=smoothstep(e2,e3,x_9);float a3=smoothstep(e3,e4,x_9);float a4=smoothstep(e4,e5,x_9);return max(mix(v0,v1,a0)*step(e0,x_9)*step(x_9,e1),max(mix(v1,v2,a1)*step(e1,x_9)*step(x_9,e2),max(mix(v2,v3,a2)*step(e2,x_9)*step(x_9,e3),max(mix(v3,v4,a3)*step(e3,x_9)*step(x_9,e4),mix(v4,v5,a4)*step(e4,x_9)*step(x_9,e5)))));}vec4 alpha(float x_0){const float e0=0.0;const vec4 v0=vec4(1,1,1,0);const float e1=1.0;const vec4 v1=vec4(1,1,1,1);float a0=smoothstep(e0,e1,x_0);return mix(v0,v1,a0)*step(e0,x_0)*step(x_0,e1);}vec4 viridis(float x_22){const float e0=0.0;const vec4 v0=vec4(0.26666666666666666,0.00392156862745098,0.32941176470588235,1);const float e1=0.13;const vec4 v1=vec4(0.2784313725490196,0.17254901960784313,0.47843137254901963,1);const float e2=0.25;const vec4 v2=vec4(0.23137254901960785,0.3176470588235294,0.5450980392156862,1);const float e3=0.38;const vec4 v3=vec4(0.17254901960784313,0.44313725490196076,0.5568627450980392,1);const float e4=0.5;const vec4 v4=vec4(0.12941176470588237,0.5647058823529412,0.5529411764705883,1);const float e5=0.63;const vec4 v5=vec4(0.15294117647058825,0.6784313725490196,0.5058823529411764,1);const float e6=0.75;const vec4 v6=vec4(0.3607843137254902,0.7843137254901961,0.38823529411764707,1);const float e7=0.88;const vec4 v7=vec4(0.6666666666666666,0.8627450980392157,0.19607843137254902,1);const float e8=1.0;const vec4 v8=vec4(0.9921568627450981,0.9058823529411765,0.1450980392156863,1);float a0=smoothstep(e0,e1,x_22);float a1=smoothstep(e1,e2,x_22);float a2=smoothstep(e2,e3,x_22);float a3=smoothstep(e3,e4,x_22);float a4=smoothstep(e4,e5,x_22);float a5=smoothstep(e5,e6,x_22);float a6=smoothstep(e6,e7,x_22);float a7=smoothstep(e7,e8,x_22);return max(mix(v0,v1,a0)*step(e0,x_22)*step(x_22,e1),max(mix(v1,v2,a1)*step(e1,x_22)*step(x_22,e2),max(mix(v2,v3,a2)*step(e2,x_22)*step(x_22,e3),max(mix(v3,v4,a3)*step(e3,x_22)*step(x_22,e4),max(mix(v4,v5,a4)*step(e4,x_22)*step(x_22,e5),max(mix(v5,v6,a5)*step(e5,x_22)*step(x_22,e6),max(mix(v6,v7,a6)*step(e6,x_22)*step(x_22,e7),mix(v7,v8,a7)*step(e7,x_22)*step(x_22,e8))))))));}vec4 inferno(float x_30){const float e0=0.0;const vec4 v0=vec4(0,0,0.01568627450980392,1);const float e1=0.13;const vec4 v1=vec4(0.12156862745098039,0.047058823529411764,0.2823529411764706,1);const float e2=0.25;const vec4 v2=vec4(0.3333333333333333,0.058823529411764705,0.42745098039215684,1);const float e3=0.38;const vec4 v3=vec4(0.5333333333333333,0.13333333333333333,0.41568627450980394,1);const float e4=0.5;const vec4 v4=vec4(0.7294117647058823,0.21176470588235294,0.3333333333333333,1);const float e5=0.63;const vec4 v5=vec4(0.8901960784313725,0.34901960784313724,0.2,1);const float e6=0.75;const vec4 v6=vec4(0.9764705882352941,0.5490196078431373,0.0392156862745098,1);const float e7=0.88;const vec4 v7=vec4(0.9764705882352941,0.788235294117647,0.19607843137254902,1);const float e8=1.0;const vec4 v8=vec4(0.9882352941176471,1,0.6431372549019608,1);float a0=smoothstep(e0,e1,x_30);float a1=smoothstep(e1,e2,x_30);float a2=smoothstep(e2,e3,x_30);float a3=smoothstep(e3,e4,x_30);float a4=smoothstep(e4,e5,x_30);float a5=smoothstep(e5,e6,x_30);float a6=smoothstep(e6,e7,x_30);float a7=smoothstep(e7,e8,x_30);return max(mix(v0,v1,a0)*step(e0,x_30)*step(x_30,e1),max(mix(v1,v2,a1)*step(e1,x_30)*step(x_30,e2),max(mix(v2,v3,a2)*step(e2,x_30)*step(x_30,e3),max(mix(v3,v4,a3)*step(e3,x_30)*step(x_30,e4),max(mix(v4,v5,a4)*step(e4,x_30)*step(x_30,e5),max(mix(v5,v6,a5)*step(e5,x_30)*step(x_30,e6),max(mix(v6,v7,a6)*step(e6,x_30)*step(x_30,e7),mix(v7,v8,a7)*step(e7,x_30)*step(x_30,e8))))))));}vec4 magma(float x_33){const float e0=0.0;const vec4 v0=vec4(0,0,0.01568627450980392,1);const float e1=0.13;const vec4 v1=vec4(0.10980392156862745,0.06274509803921569,0.26666666666666666,1);const float e2=0.25;const vec4 v2=vec4(0.30980392156862746,0.07058823529411765,0.4823529411764706,1);const float e3=0.38;const vec4 v3=vec4(0.5058823529411764,0.1450980392156863,0.5058823529411764,1);const float e4=0.5;const vec4 v4=vec4(0.7098039215686275,0.21176470588235294,0.47843137254901963,1);const float e5=0.63;const vec4 v5=vec4(0.8980392156862745,0.3137254901960784,0.39215686274509803,1);const float e6=0.75;const vec4 v6=vec4(0.984313725490196,0.5294117647058824,0.3803921568627451,1);const float e7=0.88;const vec4 v7=vec4(0.996078431372549,0.7607843137254902,0.5294117647058824,1);const float e8=1.0;const vec4 v8=vec4(0.9882352941176471,0.9921568627450981,0.7490196078431373,1);float a0=smoothstep(e0,e1,x_33);float a1=smoothstep(e1,e2,x_33);float a2=smoothstep(e2,e3,x_33);float a3=smoothstep(e3,e4,x_33);float a4=smoothstep(e4,e5,x_33);float a5=smoothstep(e5,e6,x_33);float a6=smoothstep(e6,e7,x_33);float a7=smoothstep(e7,e8,x_33);return max(mix(v0,v1,a0)*step(e0,x_33)*step(x_33,e1),max(mix(v1,v2,a1)*step(e1,x_33)*step(x_33,e2),max(mix(v2,v3,a2)*step(e2,x_33)*step(x_33,e3),max(mix(v3,v4,a3)*step(e3,x_33)*step(x_33,e4),max(mix(v4,v5,a4)*step(e4,x_33)*step(x_33,e5),max(mix(v5,v6,a5)*step(e5,x_33)*step(x_33,e6),max(mix(v6,v7,a6)*step(e6,x_33)*step(x_33,e7),mix(v7,v8,a7)*step(e7,x_33)*step(x_33,e8))))))));}vec4 plasma(float x_3){const float e0=0.0;const vec4 v0=vec4(0.050980392156862744,0.03137254901960784,0.5294117647058824,1);const float e1=0.13;const vec4 v1=vec4(0.29411764705882354,0.011764705882352941,0.6313725490196078,1);const float e2=0.25;const vec4 v2=vec4(0.49019607843137253,0.011764705882352941,0.6588235294117647,1);const float e3=0.38;const vec4 v3=vec4(0.6588235294117647,0.13333333333333333,0.5882352941176471,1);const float e4=0.5;const vec4 v4=vec4(0.796078431372549,0.27450980392156865,0.4745098039215686,1);const float e5=0.63;const vec4 v5=vec4(0.8980392156862745,0.4196078431372549,0.36470588235294116,1);const float e6=0.75;const vec4 v6=vec4(0.9725490196078431,0.5803921568627451,0.2549019607843137,1);const float e7=0.88;const vec4 v7=vec4(0.9921568627450981,0.7647058823529411,0.1568627450980392,1);const float e8=1.0;const vec4 v8=vec4(0.9411764705882353,0.9764705882352941,0.12941176470588237,1);float a0=smoothstep(e0,e1,x_3);float a1=smoothstep(e1,e2,x_3);float a2=smoothstep(e2,e3,x_3);float a3=smoothstep(e3,e4,x_3);float a4=smoothstep(e4,e5,x_3);float a5=smoothstep(e5,e6,x_3);float a6=smoothstep(e6,e7,x_3);float a7=smoothstep(e7,e8,x_3);return max(mix(v0,v1,a0)*step(e0,x_3)*step(x_3,e1),max(mix(v1,v2,a1)*step(e1,x_3)*step(x_3,e2),max(mix(v2,v3,a2)*step(e2,x_3)*step(x_3,e3),max(mix(v3,v4,a3)*step(e3,x_3)*step(x_3,e4),max(mix(v4,v5,a4)*step(e4,x_3)*step(x_3,e5),max(mix(v5,v6,a5)*step(e5,x_3)*step(x_3,e6),max(mix(v6,v7,a6)*step(e6,x_3)*step(x_3,e7),mix(v7,v8,a7)*step(e7,x_3)*step(x_3,e8))))))));}vec4 warm(float x_43){const float e0=0.0;const vec4 v0=vec4(0.49019607843137253,0,0.7019607843137254,1);const float e1=0.13;const vec4 v1=vec4(0.6745098039215687,0,0.7333333333333333,1);const float e2=0.25;const vec4 v2=vec4(0.8588235294117647,0,0.6666666666666666,1);const float e3=0.38;const vec4 v3=vec4(1,0,0.5098039215686274,1);const float e4=0.5;const vec4 v4=vec4(1,0.24705882352941178,0.2901960784313726,1);const float e5=0.63;const vec4 v5=vec4(1,0.4823529411764706,0,1);const float e6=0.75;const vec4 v6=vec4(0.9176470588235294,0.6901960784313725,0,1);const float e7=0.88;const vec4 v7=vec4(0.7450980392156863,0.8941176470588236,0,1);const float e8=1.0;const vec4 v8=vec4(0.5764705882352941,1,0,1);float a0=smoothstep(e0,e1,x_43);float a1=smoothstep(e1,e2,x_43);float a2=smoothstep(e2,e3,x_43);float a3=smoothstep(e3,e4,x_43);float a4=smoothstep(e4,e5,x_43);float a5=smoothstep(e5,e6,x_43);float a6=smoothstep(e6,e7,x_43);float a7=smoothstep(e7,e8,x_43);return max(mix(v0,v1,a0)*step(e0,x_43)*step(x_43,e1),max(mix(v1,v2,a1)*step(e1,x_43)*step(x_43,e2),max(mix(v2,v3,a2)*step(e2,x_43)*step(x_43,e3),max(mix(v3,v4,a3)*step(e3,x_43)*step(x_43,e4),max(mix(v4,v5,a4)*step(e4,x_43)*step(x_43,e5),max(mix(v5,v6,a5)*step(e5,x_43)*step(x_43,e6),max(mix(v6,v7,a6)*step(e6,x_43)*step(x_43,e7),mix(v7,v8,a7)*step(e7,x_43)*step(x_43,e8))))))));}vec4 rainbow_soft_1310269270(float x_14){const float e0=0.0;const vec4 v0=vec4(0.49019607843137253,0,0.7019607843137254,1);const float e1=0.1;const vec4 v1=vec4(0.7803921568627451,0,0.7058823529411765,1);const float e2=0.2;const vec4 v2=vec4(1,0,0.4745098039215686,1);const float e3=0.3;const vec4 v3=vec4(1,0.4235294117647059,0,1);const float e4=0.4;const vec4 v4=vec4(0.8705882352941177,0.7607843137254902,0,1);const float e5=0.5;const vec4 v5=vec4(0.5882352941176471,1,0,1);const float e6=0.6;const vec4 v6=vec4(0,1,0.21568627450980393,1);const float e7=0.7;const vec4 v7=vec4(0,0.9647058823529412,0.5882352941176471,1);const float e8=0.8;const vec4 v8=vec4(0.19607843137254902,0.6549019607843137,0.8705882352941177,1);const float e9=0.9;const vec4 v9=vec4(0.403921568627451,0.2,0.9215686274509803,1);const float e10=1.0;const vec4 v10=vec4(0.48627450980392156,0,0.7294117647058823,1);float a0=smoothstep(e0,e1,x_14);float a1=smoothstep(e1,e2,x_14);float a2=smoothstep(e2,e3,x_14);float a3=smoothstep(e3,e4,x_14);float a4=smoothstep(e4,e5,x_14);float a5=smoothstep(e5,e6,x_14);float a6=smoothstep(e6,e7,x_14);float a7=smoothstep(e7,e8,x_14);float a8=smoothstep(e8,e9,x_14);float a9=smoothstep(e9,e10,x_14);return max(mix(v0,v1,a0)*step(e0,x_14)*step(x_14,e1),max(mix(v1,v2,a1)*step(e1,x_14)*step(x_14,e2),max(mix(v2,v3,a2)*step(e2,x_14)*step(x_14,e3),max(mix(v3,v4,a3)*step(e3,x_14)*step(x_14,e4),max(mix(v4,v5,a4)*step(e4,x_14)*step(x_14,e5),max(mix(v5,v6,a5)*step(e5,x_14)*step(x_14,e6),max(mix(v6,v7,a6)*step(e6,x_14)*step(x_14,e7),max(mix(v7,v8,a7)*step(e7,x_14)*step(x_14,e8),max(mix(v8,v9,a8)*step(e8,x_14)*step(x_14,e9),mix(v9,v10,a9)*step(e9,x_14)*step(x_14,e10))))))))));}vec4 bathymetry(float x_36){const float e0=0.0;const vec4 v0=vec4(0.1568627450980392,0.10196078431372549,0.17254901960784313,1);const float e1=0.13;const vec4 v1=vec4(0.23137254901960785,0.19215686274509805,0.35294117647058826,1);const float e2=0.25;const vec4 v2=vec4(0.25098039215686274,0.2980392156862745,0.5450980392156862,1);const float e3=0.38;const vec4 v3=vec4(0.24705882352941178,0.43137254901960786,0.592156862745098,1);const float e4=0.5;const vec4 v4=vec4(0.2823529411764706,0.5568627450980392,0.6196078431372549,1);const float e5=0.63;const vec4 v5=vec4(0.3333333333333333,0.6823529411764706,0.6392156862745098,1);const float e6=0.75;const vec4 v6=vec4(0.47058823529411764,0.807843137254902,0.6392156862745098,1);const float e7=0.88;const vec4 v7=vec4(0.7333333333333333,0.9019607843137255,0.6745098039215687,1);const float e8=1.0;const vec4 v8=vec4(0.9921568627450981,0.996078431372549,0.8,1);float a0=smoothstep(e0,e1,x_36);float a1=smoothstep(e1,e2,x_36);float a2=smoothstep(e2,e3,x_36);float a3=smoothstep(e3,e4,x_36);float a4=smoothstep(e4,e5,x_36);float a5=smoothstep(e5,e6,x_36);float a6=smoothstep(e6,e7,x_36);float a7=smoothstep(e7,e8,x_36);return max(mix(v0,v1,a0)*step(e0,x_36)*step(x_36,e1),max(mix(v1,v2,a1)*step(e1,x_36)*step(x_36,e2),max(mix(v2,v3,a2)*step(e2,x_36)*step(x_36,e3),max(mix(v3,v4,a3)*step(e3,x_36)*step(x_36,e4),max(mix(v4,v5,a4)*step(e4,x_36)*step(x_36,e5),max(mix(v5,v6,a5)*step(e5,x_36)*step(x_36,e6),max(mix(v6,v7,a6)*step(e6,x_36)*step(x_36,e7),mix(v7,v8,a7)*step(e7,x_36)*step(x_36,e8))))))));}vec4 cdom(float x_7){const float e0=0.0;const vec4 v0=vec4(0.1843137254901961,0.058823529411764705,0.24313725490196078,1);const float e1=0.13;const vec4 v1=vec4(0.3411764705882353,0.09019607843137255,0.33725490196078434,1);const float e2=0.25;const vec4 v2=vec4(0.5098039215686274,0.10980392156862745,0.38823529411764707,1);const float e3=0.38;const vec4 v3=vec4(0.6705882352941176,0.1607843137254902,0.3764705882352941,1);const float e4=0.5;const vec4 v4=vec4(0.807843137254902,0.2627450980392157,0.33725490196078434,1);const float e5=0.63;const vec4 v5=vec4(0.9019607843137255,0.41568627450980394,0.32941176470588235,1);const float e6=0.75;const vec4 v6=vec4(0.9490196078431372,0.5843137254901961,0.403921568627451,1);const float e7=0.88;const vec4 v7=vec4(0.9764705882352941,0.7568627450980392,0.5294117647058824,1);const float e8=1.0;const vec4 v8=vec4(0.996078431372549,0.9294117647058824,0.6901960784313725,1);float a0=smoothstep(e0,e1,x_7);float a1=smoothstep(e1,e2,x_7);float a2=smoothstep(e2,e3,x_7);float a3=smoothstep(e3,e4,x_7);float a4=smoothstep(e4,e5,x_7);float a5=smoothstep(e5,e6,x_7);float a6=smoothstep(e6,e7,x_7);float a7=smoothstep(e7,e8,x_7);return max(mix(v0,v1,a0)*step(e0,x_7)*step(x_7,e1),max(mix(v1,v2,a1)*step(e1,x_7)*step(x_7,e2),max(mix(v2,v3,a2)*step(e2,x_7)*step(x_7,e3),max(mix(v3,v4,a3)*step(e3,x_7)*step(x_7,e4),max(mix(v4,v5,a4)*step(e4,x_7)*step(x_7,e5),max(mix(v5,v6,a5)*step(e5,x_7)*step(x_7,e6),max(mix(v6,v7,a6)*step(e6,x_7)*step(x_7,e7),mix(v7,v8,a7)*step(e7,x_7)*step(x_7,e8))))))));}vec4 chlorophyll(float x_6){const float e0=0.0;const vec4 v0=vec4(0.07058823529411765,0.1411764705882353,0.0784313725490196,1);const float e1=0.13;const vec4 v1=vec4(0.09803921568627451,0.24705882352941178,0.1607843137254902,1);const float e2=0.25;const vec4 v2=vec4(0.09411764705882353,0.3568627450980392,0.23137254901960785,1);const float e3=0.38;const vec4 v3=vec4(0.050980392156862744,0.4666666666666667,0.2823529411764706,1);const float e4=0.5;const vec4 v4=vec4(0.07058823529411765,0.5803921568627451,0.3137254901960784,1);const float e5=0.63;const vec4 v5=vec4(0.3137254901960784,0.6784313725490196,0.34901960784313724,1);const float e6=0.75;const vec4 v6=vec4(0.5176470588235295,0.7686274509803922,0.47843137254901963,1);const float e7=0.88;const vec4 v7=vec4(0.6862745098039216,0.8666666666666667,0.6352941176470588,1);const float e8=1.0;const vec4 v8=vec4(0.8431372549019608,0.9764705882352941,0.8156862745098039,1);float a0=smoothstep(e0,e1,x_6);float a1=smoothstep(e1,e2,x_6);float a2=smoothstep(e2,e3,x_6);float a3=smoothstep(e3,e4,x_6);float a4=smoothstep(e4,e5,x_6);float a5=smoothstep(e5,e6,x_6);float a6=smoothstep(e6,e7,x_6);float a7=smoothstep(e7,e8,x_6);return max(mix(v0,v1,a0)*step(e0,x_6)*step(x_6,e1),max(mix(v1,v2,a1)*step(e1,x_6)*step(x_6,e2),max(mix(v2,v3,a2)*step(e2,x_6)*step(x_6,e3),max(mix(v3,v4,a3)*step(e3,x_6)*step(x_6,e4),max(mix(v4,v5,a4)*step(e4,x_6)*step(x_6,e5),max(mix(v5,v6,a5)*step(e5,x_6)*step(x_6,e6),max(mix(v6,v7,a6)*step(e6,x_6)*step(x_6,e7),mix(v7,v8,a7)*step(e7,x_6)*step(x_6,e8))))))));}vec4 density(float x_19){const float e0=0.0;const vec4 v0=vec4(0.21176470588235294,0.054901960784313725,0.1411764705882353,1);const float e1=0.13;const vec4 v1=vec4(0.34901960784313724,0.09019607843137255,0.3137254901960784,1);const float e2=0.25;const vec4 v2=vec4(0.43137254901960786,0.17647058823529413,0.5176470588235295,1);const float e3=0.38;const vec4 v3=vec4(0.47058823529411764,0.30196078431372547,0.6980392156862745,1);const float e4=0.5;const vec4 v4=vec4(0.47058823529411764,0.44313725490196076,0.8352941176470589,1);const float e5=0.63;const vec4 v5=vec4(0.45098039215686275,0.592156862745098,0.8941176470588236,1);const float e6=0.75;const vec4 v6=vec4(0.5254901960784314,0.7254901960784313,0.8901960784313725,1);const float e7=0.88;const vec4 v7=vec4(0.6941176470588235,0.8392156862745098,0.8901960784313725,1);const float e8=1.0;const vec4 v8=vec4(0.9019607843137255,0.9450980392156862,0.9450980392156862,1);float a0=smoothstep(e0,e1,x_19);float a1=smoothstep(e1,e2,x_19);float a2=smoothstep(e2,e3,x_19);float a3=smoothstep(e3,e4,x_19);float a4=smoothstep(e4,e5,x_19);float a5=smoothstep(e5,e6,x_19);float a6=smoothstep(e6,e7,x_19);float a7=smoothstep(e7,e8,x_19);return max(mix(v0,v1,a0)*step(e0,x_19)*step(x_19,e1),max(mix(v1,v2,a1)*step(e1,x_19)*step(x_19,e2),max(mix(v2,v3,a2)*step(e2,x_19)*step(x_19,e3),max(mix(v3,v4,a3)*step(e3,x_19)*step(x_19,e4),max(mix(v4,v5,a4)*step(e4,x_19)*step(x_19,e5),max(mix(v5,v6,a5)*step(e5,x_19)*step(x_19,e6),max(mix(v6,v7,a6)*step(e6,x_19)*step(x_19,e7),mix(v7,v8,a7)*step(e7,x_19)*step(x_19,e8))))))));}vec4 freesurface_blue_3154355989(float x_35){const float e0=0.0;const vec4 v0=vec4(0.11764705882352941,0.01568627450980392,0.43137254901960786,1);const float e1=0.13;const vec4 v1=vec4(0.1843137254901961,0.054901960784313725,0.6901960784313725,1);const float e2=0.25;const vec4 v2=vec4(0.1607843137254902,0.17647058823529413,0.9254901960784314,1);const float e3=0.38;const vec4 v3=vec4(0.09803921568627451,0.38823529411764707,0.8313725490196079,1);const float e4=0.5;const vec4 v4=vec4(0.26666666666666666,0.5137254901960784,0.7843137254901961,1);const float e5=0.63;const vec4 v5=vec4(0.4470588235294118,0.611764705882353,0.7725490196078432,1);const float e6=0.75;const vec4 v6=vec4(0.615686274509804,0.7098039215686275,0.796078431372549,1);const float e7=0.88;const vec4 v7=vec4(0.7843137254901961,0.8156862745098039,0.8470588235294118,1);const float e8=1.0;const vec4 v8=vec4(0.9450980392156862,0.9294117647058824,0.9254901960784314,1);float a0=smoothstep(e0,e1,x_35);float a1=smoothstep(e1,e2,x_35);float a2=smoothstep(e2,e3,x_35);float a3=smoothstep(e3,e4,x_35);float a4=smoothstep(e4,e5,x_35);float a5=smoothstep(e5,e6,x_35);float a6=smoothstep(e6,e7,x_35);float a7=smoothstep(e7,e8,x_35);return max(mix(v0,v1,a0)*step(e0,x_35)*step(x_35,e1),max(mix(v1,v2,a1)*step(e1,x_35)*step(x_35,e2),max(mix(v2,v3,a2)*step(e2,x_35)*step(x_35,e3),max(mix(v3,v4,a3)*step(e3,x_35)*step(x_35,e4),max(mix(v4,v5,a4)*step(e4,x_35)*step(x_35,e5),max(mix(v5,v6,a5)*step(e5,x_35)*step(x_35,e6),max(mix(v6,v7,a6)*step(e6,x_35)*step(x_35,e7),mix(v7,v8,a7)*step(e7,x_35)*step(x_35,e8))))))));}vec4 freesurface_red_1679163293(float x_20){const float e0=0.0;const vec4 v0=vec4(0.23529411764705882,0.03529411764705882,0.07058823529411765,1);const float e1=0.13;const vec4 v1=vec4(0.39215686274509803,0.06666666666666667,0.10588235294117647,1);const float e2=0.25;const vec4 v2=vec4(0.5568627450980392,0.0784313725490196,0.11372549019607843,1);const float e3=0.38;const vec4 v3=vec4(0.6941176470588235,0.16862745098039217,0.10588235294117647,1);const float e4=0.5;const vec4 v4=vec4(0.7529411764705882,0.3411764705882353,0.24705882352941178,1);const float e5=0.63;const vec4 v5=vec4(0.803921568627451,0.49019607843137253,0.4117647058823529,1);const float e6=0.75;const vec4 v6=vec4(0.8470588235294118,0.6352941176470588,0.5803921568627451,1);const float e7=0.88;const vec4 v7=vec4(0.8901960784313725,0.7803921568627451,0.7568627450980392,1);const float e8=1.0;const vec4 v8=vec4(0.9450980392156862,0.9294117647058824,0.9254901960784314,1);float a0=smoothstep(e0,e1,x_20);float a1=smoothstep(e1,e2,x_20);float a2=smoothstep(e2,e3,x_20);float a3=smoothstep(e3,e4,x_20);float a4=smoothstep(e4,e5,x_20);float a5=smoothstep(e5,e6,x_20);float a6=smoothstep(e6,e7,x_20);float a7=smoothstep(e7,e8,x_20);return max(mix(v0,v1,a0)*step(e0,x_20)*step(x_20,e1),max(mix(v1,v2,a1)*step(e1,x_20)*step(x_20,e2),max(mix(v2,v3,a2)*step(e2,x_20)*step(x_20,e3),max(mix(v3,v4,a3)*step(e3,x_20)*step(x_20,e4),max(mix(v4,v5,a4)*step(e4,x_20)*step(x_20,e5),max(mix(v5,v6,a5)*step(e5,x_20)*step(x_20,e6),max(mix(v6,v7,a6)*step(e6,x_20)*step(x_20,e7),mix(v7,v8,a7)*step(e7,x_20)*step(x_20,e8))))))));}vec4 oxygen(float x_11){const float e0=0.0;const vec4 v0=vec4(0.25098039215686274,0.0196078431372549,0.0196078431372549,1);const float e1=0.13;const vec4 v1=vec4(0.41568627450980394,0.023529411764705882,0.058823529411764705,1);const float e2=0.25;const vec4 v2=vec4(0.5647058823529412,0.10196078431372549,0.027450980392156862,1);const float e3=0.38;const vec4 v3=vec4(0.6588235294117647,0.25098039215686274,0.011764705882352941,1);const float e4=0.5;const vec4 v4=vec4(0.7372549019607844,0.39215686274509803,0.01568627450980392,1);const float e5=0.63;const vec4 v5=vec4(0.807843137254902,0.5333333333333333,0.043137254901960784,1);const float e6=0.75;const vec4 v6=vec4(0.8627450980392157,0.6823529411764706,0.09803921568627451,1);const float e7=0.88;const vec4 v7=vec4(0.9058823529411765,0.8431372549019608,0.17254901960784313,1);const float e8=1.0;const vec4 v8=vec4(0.9725490196078431,0.996078431372549,0.4117647058823529,1);float a0=smoothstep(e0,e1,x_11);float a1=smoothstep(e1,e2,x_11);float a2=smoothstep(e2,e3,x_11);float a3=smoothstep(e3,e4,x_11);float a4=smoothstep(e4,e5,x_11);float a5=smoothstep(e5,e6,x_11);float a6=smoothstep(e6,e7,x_11);float a7=smoothstep(e7,e8,x_11);return max(mix(v0,v1,a0)*step(e0,x_11)*step(x_11,e1),max(mix(v1,v2,a1)*step(e1,x_11)*step(x_11,e2),max(mix(v2,v3,a2)*step(e2,x_11)*step(x_11,e3),max(mix(v3,v4,a3)*step(e3,x_11)*step(x_11,e4),max(mix(v4,v5,a4)*step(e4,x_11)*step(x_11,e5),max(mix(v5,v6,a5)*step(e5,x_11)*step(x_11,e6),max(mix(v6,v7,a6)*step(e6,x_11)*step(x_11,e7),mix(v7,v8,a7)*step(e7,x_11)*step(x_11,e8))))))));}vec4 par(float x_28){const float e0=0.0;const vec4 v0=vec4(0.2,0.0784313725490196,0.09411764705882353,1);const float e1=0.13;const vec4 v1=vec4(0.35294117647058826,0.12549019607843137,0.13725490196078433,1);const float e2=0.25;const vec4 v2=vec4(0.5058823529411764,0.17254901960784313,0.13333333333333333,1);const float e3=0.38;const vec4 v3=vec4(0.6235294117647059,0.26666666666666666,0.09803921568627451,1);const float e4=0.5;const vec4 v4=vec4(0.7137254901960784,0.38823529411764707,0.07450980392156863,1);const float e5=0.63;const vec4 v5=vec4(0.7803921568627451,0.5254901960784314,0.08627450980392157,1);const float e6=0.75;const vec4 v6=vec4(0.8313725490196079,0.6705882352941176,0.13725490196078433,1);const float e7=0.88;const vec4 v7=vec4(0.8666666666666667,0.8235294117647058,0.21176470588235294,1);const float e8=1.0;const vec4 v8=vec4(0.8823529411764706,0.9921568627450981,0.29411764705882354,1);float a0=smoothstep(e0,e1,x_28);float a1=smoothstep(e1,e2,x_28);float a2=smoothstep(e2,e3,x_28);float a3=smoothstep(e3,e4,x_28);float a4=smoothstep(e4,e5,x_28);float a5=smoothstep(e5,e6,x_28);float a6=smoothstep(e6,e7,x_28);float a7=smoothstep(e7,e8,x_28);return max(mix(v0,v1,a0)*step(e0,x_28)*step(x_28,e1),max(mix(v1,v2,a1)*step(e1,x_28)*step(x_28,e2),max(mix(v2,v3,a2)*step(e2,x_28)*step(x_28,e3),max(mix(v3,v4,a3)*step(e3,x_28)*step(x_28,e4),max(mix(v4,v5,a4)*step(e4,x_28)*step(x_28,e5),max(mix(v5,v6,a5)*step(e5,x_28)*step(x_28,e6),max(mix(v6,v7,a6)*step(e6,x_28)*step(x_28,e7),mix(v7,v8,a7)*step(e7,x_28)*step(x_28,e8))))))));}vec4 phase(float x_39){const float e0=0.0;const vec4 v0=vec4(0.5686274509803921,0.4117647058823529,0.07058823529411765,1);const float e1=0.13;const vec4 v1=vec4(0.7215686274509804,0.2784313725490196,0.14901960784313725,1);const float e2=0.25;const vec4 v2=vec4(0.7294117647058823,0.22745098039215686,0.45098039215686275,1);const float e3=0.38;const vec4 v3=vec4(0.6274509803921569,0.2784313725490196,0.7254901960784313,1);const float e4=0.5;const vec4 v4=vec4(0.43137254901960786,0.3803921568627451,0.8549019607843137,1);const float e5=0.63;const vec4 v5=vec4(0.19607843137254902,0.4823529411764706,0.6431372549019608,1);const float e6=0.75;const vec4 v6=vec4(0.12156862745098039,0.5137254901960784,0.43137254901960786,1);const float e7=0.88;const vec4 v7=vec4(0.30196078431372547,0.5058823529411764,0.13333333333333333,1);const float e8=1.0;const vec4 v8=vec4(0.5686274509803921,0.4117647058823529,0.07058823529411765,1);float a0=smoothstep(e0,e1,x_39);float a1=smoothstep(e1,e2,x_39);float a2=smoothstep(e2,e3,x_39);float a3=smoothstep(e3,e4,x_39);float a4=smoothstep(e4,e5,x_39);float a5=smoothstep(e5,e6,x_39);float a6=smoothstep(e6,e7,x_39);float a7=smoothstep(e7,e8,x_39);return max(mix(v0,v1,a0)*step(e0,x_39)*step(x_39,e1),max(mix(v1,v2,a1)*step(e1,x_39)*step(x_39,e2),max(mix(v2,v3,a2)*step(e2,x_39)*step(x_39,e3),max(mix(v3,v4,a3)*step(e3,x_39)*step(x_39,e4),max(mix(v4,v5,a4)*step(e4,x_39)*step(x_39,e5),max(mix(v5,v6,a5)*step(e5,x_39)*step(x_39,e6),max(mix(v6,v7,a6)*step(e6,x_39)*step(x_39,e7),mix(v7,v8,a7)*step(e7,x_39)*step(x_39,e8))))))));}vec4 salinity(float x_26){const float e0=0.0;const vec4 v0=vec4(0.16470588235294117,0.09411764705882353,0.4235294117647059,1);const float e1=0.13;const vec4 v1=vec4(0.12941176470588237,0.19607843137254902,0.6352941176470588,1);const float e2=0.25;const vec4 v2=vec4(0.058823529411764705,0.35294117647058826,0.5686274509803921,1);const float e3=0.38;const vec4 v3=vec4(0.1568627450980392,0.4627450980392157,0.5372549019607843,1);const float e4=0.5;const vec4 v4=vec4(0.23137254901960785,0.5725490196078431,0.5294117647058824,1);const float e5=0.63;const vec4 v5=vec4(0.30980392156862746,0.6862745098039216,0.49411764705882355,1);const float e6=0.75;const vec4 v6=vec4(0.47058823529411764,0.796078431372549,0.40784313725490196,1);const float e7=0.88;const vec4 v7=vec4(0.7568627450980392,0.8666666666666667,0.39215686274509803,1);const float e8=1.0;const vec4 v8=vec4(0.9921568627450981,0.9372549019607843,0.6039215686274509,1);float a0=smoothstep(e0,e1,x_26);float a1=smoothstep(e1,e2,x_26);float a2=smoothstep(e2,e3,x_26);float a3=smoothstep(e3,e4,x_26);float a4=smoothstep(e4,e5,x_26);float a5=smoothstep(e5,e6,x_26);float a6=smoothstep(e6,e7,x_26);float a7=smoothstep(e7,e8,x_26);return max(mix(v0,v1,a0)*step(e0,x_26)*step(x_26,e1),max(mix(v1,v2,a1)*step(e1,x_26)*step(x_26,e2),max(mix(v2,v3,a2)*step(e2,x_26)*step(x_26,e3),max(mix(v3,v4,a3)*step(e3,x_26)*step(x_26,e4),max(mix(v4,v5,a4)*step(e4,x_26)*step(x_26,e5),max(mix(v5,v6,a5)*step(e5,x_26)*step(x_26,e6),max(mix(v6,v7,a6)*step(e6,x_26)*step(x_26,e7),mix(v7,v8,a7)*step(e7,x_26)*step(x_26,e8))))))));}vec4 temperature(float x_8){const float e0=0.0;const vec4 v0=vec4(0.01568627450980392,0.13725490196078433,0.2,1);const float e1=0.13;const vec4 v1=vec4(0.09019607843137255,0.2,0.47843137254901963,1);const float e2=0.25;const vec4 v2=vec4(0.3333333333333333,0.23137254901960785,0.615686274509804,1);const float e3=0.38;const vec4 v3=vec4(0.5058823529411764,0.30980392156862746,0.5607843137254902,1);const float e4=0.5;const vec4 v4=vec4(0.6862745098039216,0.37254901960784315,0.5098039215686274,1);const float e5=0.63;const vec4 v5=vec4(0.8705882352941177,0.4392156862745098,0.396078431372549,1);const float e6=0.75;const vec4 v6=vec4(0.9764705882352941,0.5725490196078431,0.25882352941176473,1);const float e7=0.88;const vec4 v7=vec4(0.9764705882352941,0.7686274509803922,0.2549019607843137,1);const float e8=1.0;const vec4 v8=vec4(0.9098039215686274,0.9803921568627451,0.3568627450980392,1);float a0=smoothstep(e0,e1,x_8);float a1=smoothstep(e1,e2,x_8);float a2=smoothstep(e2,e3,x_8);float a3=smoothstep(e3,e4,x_8);float a4=smoothstep(e4,e5,x_8);float a5=smoothstep(e5,e6,x_8);float a6=smoothstep(e6,e7,x_8);float a7=smoothstep(e7,e8,x_8);return max(mix(v0,v1,a0)*step(e0,x_8)*step(x_8,e1),max(mix(v1,v2,a1)*step(e1,x_8)*step(x_8,e2),max(mix(v2,v3,a2)*step(e2,x_8)*step(x_8,e3),max(mix(v3,v4,a3)*step(e3,x_8)*step(x_8,e4),max(mix(v4,v5,a4)*step(e4,x_8)*step(x_8,e5),max(mix(v5,v6,a5)*step(e5,x_8)*step(x_8,e6),max(mix(v6,v7,a6)*step(e6,x_8)*step(x_8,e7),mix(v7,v8,a7)*step(e7,x_8)*step(x_8,e8))))))));}vec4 turbidity(float x_40){const float e0=0.0;const vec4 v0=vec4(0.13333333333333333,0.12156862745098039,0.10588235294117647,1);const float e1=0.13;const vec4 v1=vec4(0.2549019607843137,0.19607843137254902,0.1607843137254902,1);const float e2=0.25;const vec4 v2=vec4(0.3843137254901961,0.27058823529411763,0.20392156862745098,1);const float e3=0.38;const vec4 v3=vec4(0.5137254901960784,0.34901960784313724,0.2235294117647059,1);const float e4=0.5;const vec4 v4=vec4(0.6313725490196078,0.4392156862745098,0.23137254901960785,1);const float e5=0.63;const vec4 v5=vec4(0.7254901960784313,0.5490196078431373,0.25882352941176473,1);const float e6=0.75;const vec4 v6=vec4(0.792156862745098,0.6823529411764706,0.34509803921568627,1);const float e7=0.88;const vec4 v7=vec4(0.8470588235294118,0.8196078431372549,0.49411764705882355,1);const float e8=1.0;const vec4 v8=vec4(0.9137254901960784,0.9647058823529412,0.6705882352941176,1);float a0=smoothstep(e0,e1,x_40);float a1=smoothstep(e1,e2,x_40);float a2=smoothstep(e2,e3,x_40);float a3=smoothstep(e3,e4,x_40);float a4=smoothstep(e4,e5,x_40);float a5=smoothstep(e5,e6,x_40);float a6=smoothstep(e6,e7,x_40);float a7=smoothstep(e7,e8,x_40);return max(mix(v0,v1,a0)*step(e0,x_40)*step(x_40,e1),max(mix(v1,v2,a1)*step(e1,x_40)*step(x_40,e2),max(mix(v2,v3,a2)*step(e2,x_40)*step(x_40,e3),max(mix(v3,v4,a3)*step(e3,x_40)*step(x_40,e4),max(mix(v4,v5,a4)*step(e4,x_40)*step(x_40,e5),max(mix(v5,v6,a5)*step(e5,x_40)*step(x_40,e6),max(mix(v6,v7,a6)*step(e6,x_40)*step(x_40,e7),mix(v7,v8,a7)*step(e7,x_40)*step(x_40,e8))))))));}vec4 velocity_blue_297387650(float x_2){const float e0=0.0;const vec4 v0=vec4(0.06666666666666667,0.12549019607843137,0.25098039215686274,1);const float e1=0.13;const vec4 v1=vec4(0.13725490196078433,0.20392156862745098,0.4549019607843137,1);const float e2=0.25;const vec4 v2=vec4(0.11372549019607843,0.3176470588235294,0.611764705882353,1);const float e3=0.38;const vec4 v3=vec4(0.12156862745098039,0.44313725490196076,0.6352941176470588,1);const float e4=0.5;const vec4 v4=vec4(0.19607843137254902,0.5647058823529412,0.6627450980392157,1);const float e5=0.63;const vec4 v5=vec4(0.3411764705882353,0.6784313725490196,0.6901960784313725,1);const float e6=0.75;const vec4 v6=vec4(0.5843137254901961,0.7686274509803922,0.7411764705882353,1);const float e7=0.88;const vec4 v7=vec4(0.796078431372549,0.8666666666666667,0.8274509803921568,1);const float e8=1.0;const vec4 v8=vec4(0.996078431372549,0.984313725490196,0.9019607843137255,1);float a0=smoothstep(e0,e1,x_2);float a1=smoothstep(e1,e2,x_2);float a2=smoothstep(e2,e3,x_2);float a3=smoothstep(e3,e4,x_2);float a4=smoothstep(e4,e5,x_2);float a5=smoothstep(e5,e6,x_2);float a6=smoothstep(e6,e7,x_2);float a7=smoothstep(e7,e8,x_2);return max(mix(v0,v1,a0)*step(e0,x_2)*step(x_2,e1),max(mix(v1,v2,a1)*step(e1,x_2)*step(x_2,e2),max(mix(v2,v3,a2)*step(e2,x_2)*step(x_2,e3),max(mix(v3,v4,a3)*step(e3,x_2)*step(x_2,e4),max(mix(v4,v5,a4)*step(e4,x_2)*step(x_2,e5),max(mix(v5,v6,a5)*step(e5,x_2)*step(x_2,e6),max(mix(v6,v7,a6)*step(e6,x_2)*step(x_2,e7),mix(v7,v8,a7)*step(e7,x_2)*step(x_2,e8))))))));}vec4 velocity_green_2558432129(float x_27){const float e0=0.0;const vec4 v0=vec4(0.09019607843137255,0.13725490196078433,0.07450980392156863,1);const float e1=0.13;const vec4 v1=vec4(0.09411764705882353,0.25098039215686274,0.14901960784313725,1);const float e2=0.25;const vec4 v2=vec4(0.043137254901960784,0.37254901960784315,0.17647058823529413,1);const float e3=0.38;const vec4 v3=vec4(0.15294117647058825,0.4823529411764706,0.13725490196078433,1);const float e4=0.5;const vec4 v4=vec4(0.37254901960784315,0.5725490196078431,0.047058823529411764,1);const float e5=0.63;const vec4 v5=vec4(0.596078431372549,0.6470588235294118,0.07058823529411765,1);const float e6=0.75;const vec4 v6=vec4(0.788235294117647,0.7294117647058823,0.27058823529411763,1);const float e7=0.88;const vec4 v7=vec4(0.9137254901960784,0.8470588235294118,0.5372549019607843,1);const float e8=1.0;const vec4 v8=vec4(1,0.9921568627450981,0.803921568627451,1);float a0=smoothstep(e0,e1,x_27);float a1=smoothstep(e1,e2,x_27);float a2=smoothstep(e2,e3,x_27);float a3=smoothstep(e3,e4,x_27);float a4=smoothstep(e4,e5,x_27);float a5=smoothstep(e5,e6,x_27);float a6=smoothstep(e6,e7,x_27);float a7=smoothstep(e7,e8,x_27);return max(mix(v0,v1,a0)*step(e0,x_27)*step(x_27,e1),max(mix(v1,v2,a1)*step(e1,x_27)*step(x_27,e2),max(mix(v2,v3,a2)*step(e2,x_27)*step(x_27,e3),max(mix(v3,v4,a3)*step(e3,x_27)*step(x_27,e4),max(mix(v4,v5,a4)*step(e4,x_27)*step(x_27,e5),max(mix(v5,v6,a5)*step(e5,x_27)*step(x_27,e6),max(mix(v6,v7,a6)*step(e6,x_27)*step(x_27,e7),mix(v7,v8,a7)*step(e7,x_27)*step(x_27,e8))))))));}vec4 cubehelix(float x_37){const float e0=0.0;const vec4 v0=vec4(0,0,0,1);const float e1=0.07;const vec4 v1=vec4(0.08627450980392157,0.0196078431372549,0.23137254901960785,1);const float e2=0.13;const vec4 v2=vec4(0.23529411764705882,0.01568627450980392,0.4117647058823529,1);const float e3=0.2;const vec4 v3=vec4(0.42745098039215684,0.00392156862745098,0.5294117647058824,1);const float e4=0.27;const vec4 v4=vec4(0.6313725490196078,0,0.5764705882352941,1);const float e5=0.33;const vec4 v5=vec4(0.8235294117647058,0.00784313725490196,0.5568627450980392,1);const float e6=0.4;const vec4 v6=vec4(0.984313725490196,0.043137254901960784,0.4823529411764706,1);const float e7=0.47;const vec4 v7=vec4(1,0.11372549019607843,0.3803921568627451,1);const float e8=0.53;const vec4 v8=vec4(1,0.21176470588235294,0.27058823529411763,1);const float e9=0.6;const vec4 v9=vec4(1,0.3333333333333333,0.1803921568627451,1);const float e10=0.67;const vec4 v10=vec4(1,0.47058823529411764,0.13333333333333333,1);const float e11=0.73;const vec4 v11=vec4(1,0.615686274509804,0.1450980392156863,1);const float e12=0.8;const vec4 v12=vec4(0.9450980392156862,0.7490196078431373,0.2235294117647059,1);const float e13=0.87;const vec4 v13=vec4(0.8784313725490196,0.8627450980392157,0.36470588235294116,1);const float e14=0.93;const vec4 v14=vec4(0.8549019607843137,0.9450980392156862,0.5568627450980392,1);const float e15=1.0;const vec4 v15=vec4(0.8901960784313725,0.9921568627450981,0.7764705882352941,1);float a0=smoothstep(e0,e1,x_37);float a1=smoothstep(e1,e2,x_37);float a2=smoothstep(e2,e3,x_37);float a3=smoothstep(e3,e4,x_37);float a4=smoothstep(e4,e5,x_37);float a5=smoothstep(e5,e6,x_37);float a6=smoothstep(e6,e7,x_37);float a7=smoothstep(e7,e8,x_37);float a8=smoothstep(e8,e9,x_37);float a9=smoothstep(e9,e10,x_37);float a10=smoothstep(e10,e11,x_37);float a11=smoothstep(e11,e12,x_37);float a12=smoothstep(e12,e13,x_37);float a13=smoothstep(e13,e14,x_37);float a14=smoothstep(e14,e15,x_37);return max(mix(v0,v1,a0)*step(e0,x_37)*step(x_37,e1),max(mix(v1,v2,a1)*step(e1,x_37)*step(x_37,e2),max(mix(v2,v3,a2)*step(e2,x_37)*step(x_37,e3),max(mix(v3,v4,a3)*step(e3,x_37)*step(x_37,e4),max(mix(v4,v5,a4)*step(e4,x_37)*step(x_37,e5),max(mix(v5,v6,a5)*step(e5,x_37)*step(x_37,e6),max(mix(v6,v7,a6)*step(e6,x_37)*step(x_37,e7),max(mix(v7,v8,a7)*step(e7,x_37)*step(x_37,e8),max(mix(v8,v9,a8)*step(e8,x_37)*step(x_37,e9),max(mix(v9,v10,a9)*step(e9,x_37)*step(x_37,e10),max(mix(v10,v11,a10)*step(e10,x_37)*step(x_37,e11),max(mix(v11,v12,a11)*step(e11,x_37)*step(x_37,e12),max(mix(v12,v13,a12)*step(e12,x_37)*step(x_37,e13),max(mix(v13,v14,a13)*step(e13,x_37)*step(x_37,e14),mix(v14,v15,a14)*step(e14,x_37)*step(x_37,e15)))))))))))))));}vec3 hsv_to_rgb(vec3 c){vec4 K=vec4(1.0,2.0/3.0,1.0/3.0,3.0);vec3 p=abs(fract(c.xxx+K.xyz)*6.0-K.www);return c.z*mix(K.xxx,clamp(p-K.xxx,0.0,1.0),c.y);}vec3 rgb_to_hsv(vec3 rgb){float Cmax=max(rgb.r,max(rgb.g,rgb.b));float Cmin=min(rgb.r,min(rgb.g,rgb.b));float delta=Cmax-Cmin;vec3 hsv=vec3(0.,0.,Cmax);if(Cmax>Cmin){hsv.y=delta/Cmax;if(rgb.r==Cmax){hsv.x=(rgb.g-rgb.b)/delta;}else{if(rgb.g==Cmax){hsv.x=2.+(rgb.b-rgb.r)/delta;}else{hsv.x=4.+(rgb.r-rgb.g)/delta;}}hsv.x=fract(hsv.x/6.);}return hsv;}float sample_and_apply_sliders(SAMPLER_TYPE channel,vec2 vTexCoord,vec2 sliderValues){float fragIntensity=float(texture(channel,vTexCoord).r);float slidersAppliedToIntensity=(fragIntensity-sliderValues[0])/max(0.0005,(sliderValues[1]-sliderValues[0]));return max(0.0,slidersAppliedToIntensity);}vec3 process_channel_intensity(float intensity,vec3 colorValues,int channelIndex,bool inLensAndUseLens,int lensSelection){float useColorValue=float(int((inLensAndUseLens&&channelIndex==lensSelection)||(!inLensAndUseLens)));vec3 hsvCombo=rgb_to_hsv(max(vec3(colorValues),(1.0-useColorValue)*vec3(255,255,255)));hsvCombo=vec3(hsvCombo.xy,max(0.0,intensity));return hsv_to_rgb(hsvCombo);}vec4 colormap(float intensity,float opacity){return vec4(COLORMAP_FUNCTION(min(1.0,intensity)).xyz,opacity);}"; // eslint-disable-line

var channels = {
  name: 'channel-intensity-module',
  defines: {
    SAMPLER_TYPE: 'usampler2D',
    COLORMAP_FUNCTION: ''
  },
  fs: fs$2
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

function getNearestPowerOf2(width, height) {
  return 2 ** Math.ceil(Math.log2(Math.max(width, height)));
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

const defaultProps$4 = {
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
XRLayer.defaultProps = defaultProps$4;

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
    onClick
  } = props;
  // Only render in positive coorinate system
  if ([left, bottom, right, top].some(v => v < 0)) {
    return null;
  }
  const xrl = new XRLayer(props, {
    id: `XRLayer-${left}-${bottom}-${right}-${top}-${id}`,
    bounds: [left, bottom, right, top],
    channelData: data,
    pickable,
    // Uncomment to help debugging - shades the tile being hovered over.
    // autoHighlight: true,
    // highlightColor: [80, 80, 80, 50],
    data: null,
    sliderValues,
    colorValues,
    channelIsOn,
    opacity,
    visible,
    dtype,
    colormap,
    onHover,
    unprojectLensBounds,
    isLensOn,
    lensSelection,
    tileId: { x, y, z },
    onClick
  });
  return xrl;
}

const defaultProps$1$1 = {
  ...TileLayer.defaultProps,
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
MultiscaleImageLayerBase.defaultProps = defaultProps$1$1;

function guessRgb(shape) {
  const lastDimSize = shape[shape.length - 1];
  return shape.length > 2 && (lastDimSize === 3 || lastDimSize === 4);
}

/**
 * Pads TypedArray on right and bottom with zeros out to target width
 * and target height respectively.
 * @param {Object} tile { data: TypedArray, width: number, height: number}
 * @param {Object} targetWidth number
 * @param {Object} targetHeight number
 * @returns {TypedArray} TypedArray
 */
function padTileWithZeros(tile, targetWidth, targetHeight) {
  const { data, width, height } = tile;
  // Create new TypedArray with same constructor as source
  const padded = new data.constructor(targetWidth * targetHeight);
  // Take strips (rows) from original tile data and fill padded tile using
  // multiples of the tileSize as the offset.
  for (let i = 0; i < height; i += 1) {
    const offset = i * width;
    const strip = data.subarray(offset, offset + width);
    padded.set(strip, i * targetWidth);
  }
  return padded;
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

const defaultProps$2$1 = {
  pickable: true,
  coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
  sliderValues: { type: 'array', value: [], compare: true },
  channelIsOn: { type: 'array', value: [], compare: true },
  colorValues: { type: 'array', value: [], compare: true },
  loaderSelection: { type: 'array', value: [], compare: true },
  colormap: { type: 'string', value: '', compare: true },
  domain: { type: 'array', value: [], compare: true },
  translate: { type: 'array', value: [0, 0], compare: true },
  scale: { type: 'number', value: 1, compare: true },
  boxSize: { type: 'number', value: 0, compare: true },
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

function scaleBounds({ width, height, translate, scale }) {
  const [left, top] = translate;
  const right = width * scale + left;
  const bottom = height * scale + top;
  return [left, bottom, right, top];
}

/*
 * For some reason data of uneven length fails to be converted to a texture (Issue #144).
 * Here we pad the width of tile by one if the data is uneven in length, which seemingly
 * fixes the rendering. This is not ideal since padding the tile makes a copy of underlying
 * buffer, but without digging deeper into the WebGL it is a reasonable fix.
 */
function padEven(data, width, height, boxSize) {
  const targetWidth = boxSize || (width % 2 === 0 ? width : width + 1);
  const targetHeight = boxSize || height;
  const padded = data.map(d =>
    padTileWithZeros({ data: d, width, height }, targetWidth, targetHeight)
  );
  return { data: padded, width: targetWidth, height: targetHeight };
}

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
 * @param {Array} props.translate Translate transformation to be applied to the bounds after scaling.
 * @param {number} props.scale Scaling factor for this layer to be used against the dimensions of the loader's `getRaster`.
 * @param {Object} props.loader Loader to be used for fetching data.  It must implement/return `getRaster` and `dtype`.
 * @param {String} props.onHover Hook function from deck.gl to handle hover objects.
 * @param {String} props.boxSize If you want to pad an incoming tile to be a certain squared pixel size, pass the number here (only used by OverviewLayer/VivViewerLayer for now).
 * @param {boolean} props.isLensOn Whether or not to use the lens.
 * @param {number} props.lensSelection Numeric index of the channel to be focused on by the lens.
 * @param {number} props.lensRadius Pixel radius of the lens (default: 100).
 * @param {number} props.lensBorderColor RGB color of the border of the lens.
 * @param {number} props.lensBorderRadius Percentage of the radius of the lens for a border (default 0.02).
 * @param {number} props.onClick Hook function from deck.gl to handle clicked-on objects.
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
      const { loader, z, loaderSelection, boxSize } = this.props;
      loader
        .getRaster({ z, loaderSelection })
        .then(({ data, width, height }) => {
          this.setState(
            padEven(
              !isWebGL2(this.context.gl) ? to32BitFloat(data) : data,
              width,
              height,
              boxSize
            )
          );
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
      translate,
      scale,
      z,
      domain,
      pickable,
      isLensOn,
      lensSelection,
      lensBorderColor,
      lensRadius,
      id,
      onClick,
      onHover
    } = this.props;
    const { dtype } = loader;
    const { data, width, height, unprojectLensBounds } = this.state;
    if (!(width && height)) return null;
    const bounds = scaleBounds({
      width,
      height,
      translate,
      scale
    });
    return new XRLayer(this.props, {
      channelData: { data, width, height },
      pickable,
      bounds,
      sliderValues,
      colorValues,
      channelIsOn,
      domain,
      id: `XR-Static-Layer-${0}-${height}-${width}-${0}-${z}-${id}`,
      coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
      opacity,
      visible,
      dtype,
      colormap,
      unprojectLensBounds,
      isLensOn,
      lensSelection,
      lensBorderColor,
      lensRadius,
      onClick,
      onHover
    });
  }
}

ImageLayer.layerName = 'ImageLayer';
ImageLayer.defaultProps = defaultProps$2$1;

const defaultProps$3$1 = {
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
      onClick
    } = this.props;
    const { tileSize, numLevels, dtype } = loader;
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
      if (tile) {
        tile.data = noWebGl2 ? to32BitFloat(tile.data) : tile.data;
        if (tile.width !== tileSize || tile.height !== tileSize) {
          console.warn(
            `Tile data  { width: ${tile.width}, height: ${tile.height} } does not match tilesize: ${tileSize}`
          );
        }
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
      lensBorderRadius
    });
    // This gives us a background image and also solves the current
    // minZoom funny business.  We don't use it for the background if we have an opacity
    // paramteter set to anything but 1, but we always use it for situations where
    // we are zoomed out too far.
    const implementsGetRaster = typeof loader.getRaster === 'function';
    const { width: lowResWidth, height: lowResHeight } = loader.getRasterSize({
      z: numLevels - 1
    });
    const baseLayer =
      implementsGetRaster &&
      new ImageLayer(this.props, {
        id: `Background-Image-${id}`,
        scale: 2 ** (numLevels - 1),
        visible:
          opacity === 1 ||
          (-numLevels > this.context.viewport.zoom &&
            (!viewportId || this.context.viewport.id === viewportId)),
        z: numLevels - 1,
        pickable: true,
        onHover,
        onClick,
        boxSize: getNearestPowerOf2(lowResWidth, lowResHeight)
      });
    const layers = [baseLayer, tiledLayer];
    return layers;
  }
}

MultiscaleImageLayer.layerName = 'MultiscaleImageLayer';
MultiscaleImageLayer.defaultProps = defaultProps$3$1;

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
   * @param {number} x positive integer
   * @param {number} y positive integer
   * @param {number} z positive integer (0 === highest zoom level)
   * @param {Array} loaderSelection, Array of valid dimension selections
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
      const width = source.chunks[xIndex];
      const height = source.chunks[yIndex];
      if (height < this.tileSize || width < this.tileSize) {
        return padTileWithZeros(
          { data, width, height },
          this.tileSize,
          this.tileSize
        );
      }
      return data;
    });
    const data = await Promise.all(dataRequests);
    if (source.store instanceof HTTPStore && _optionalChain$1([signal, 'optionalAccess', _ => _.aborted])) return null;
    return {
      data,
      width: this.tileSize,
      height: this.tileSize
    };
  }

  /**
   * Returns full image panes (at level z if pyramid)
   * @param {number} z positive integer (0 === highest zoom level)
   * @param {Array} loaderSelection, Array of valid dimension selections
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
   * @param {number} z positive integer (0 === highest zoom level)
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
