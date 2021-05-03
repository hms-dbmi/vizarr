export { C as CompositeLayer } from '../common/composite-layer-1bf9b89a.js';
import { _ as _createClass } from '../common/setPrototypeOf-d164daa3.js';
import { _ as _defineProperty } from '../common/defineProperty-1b0b77a2.js';
import { _ as _classCallCheck } from '../common/classCallCheck-4eda545c.js';
import { _ as _inherits, a as _getPrototypeOf, b as _possibleConstructorReturn, i as isArray, c as config, d as checkNumber, t as transformMat4, v as vec2_transformMat4AsVector, e as transformMat3, f as transformMat2d, g as transformMat2, h as clamp, M as Matrix4 } from '../common/matrix4-e4e8695c.js';
import { L as LinearInterpolator, T as TRANSITION_EVENTS, V as ViewState, C as Controller, a as View } from '../common/linear-interpolator-68e3af6c.js';
import { V as Vector, m as mod, a as Viewport } from '../common/layer-660a8390.js';
import '../common/slicedToArray-cdb146e7.js';
import '../common/toConsumableArray-06af309a.js';
import '../common/process-2545f00a.js';
import '../common/_commonjsHelpers-37fa8da4.js';
import '../common/interopRequireDefault-0a992762.js';
import '../common/interopRequireWildcard-7a8da193.js';
import '../common/_node-resolve:empty-0f7f843d.js';

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

var Vector2 = function (_Vector) {
  _inherits(Vector2, _Vector);

  var _super = _createSuper(Vector2);

  function Vector2() {
    var _this;

    var x = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
    var y = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

    _classCallCheck(this, Vector2);

    _this = _super.call(this, 2);

    if (isArray(x) && arguments.length === 1) {
      _this.copy(x);
    } else {
      if (config.debug) {
        checkNumber(x);
        checkNumber(y);
      }

      _this[0] = x;
      _this[1] = y;
    }

    return _this;
  }

  _createClass(Vector2, [{
    key: "set",
    value: function set(x, y) {
      this[0] = x;
      this[1] = y;
      return this.check();
    }
  }, {
    key: "copy",
    value: function copy(array) {
      this[0] = array[0];
      this[1] = array[1];
      return this.check();
    }
  }, {
    key: "fromObject",
    value: function fromObject(object) {
      if (config.debug) {
        checkNumber(object.x);
        checkNumber(object.y);
      }

      this[0] = object.x;
      this[1] = object.y;
      return this.check();
    }
  }, {
    key: "toObject",
    value: function toObject(object) {
      object.x = this[0];
      object.y = this[1];
      return object;
    }
  }, {
    key: "horizontalAngle",
    value: function horizontalAngle() {
      return Math.atan2(this.y, this.x);
    }
  }, {
    key: "verticalAngle",
    value: function verticalAngle() {
      return Math.atan2(this.x, this.y);
    }
  }, {
    key: "transform",
    value: function transform(matrix4) {
      return this.transformAsPoint(matrix4);
    }
  }, {
    key: "transformAsPoint",
    value: function transformAsPoint(matrix4) {
      transformMat4(this, this, matrix4);
      return this.check();
    }
  }, {
    key: "transformAsVector",
    value: function transformAsVector(matrix4) {
      vec2_transformMat4AsVector(this, this, matrix4);
      return this.check();
    }
  }, {
    key: "transformByMatrix3",
    value: function transformByMatrix3(matrix3) {
      transformMat3(this, this, matrix3);
      return this.check();
    }
  }, {
    key: "transformByMatrix2x3",
    value: function transformByMatrix2x3(matrix2x3) {
      transformMat2d(this, this, matrix2x3);
      return this.check();
    }
  }, {
    key: "transformByMatrix2",
    value: function transformByMatrix2(matrix2) {
      transformMat2(this, this, matrix2);
      return this.check();
    }
  }, {
    key: "ELEMENTS",
    get: function get() {
      return 2;
    }
  }]);

  return Vector2;
}(Vector);

function _createSuper$1(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct$1(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _isNativeReflectConstruct$1() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }
var DEFAULT_STATE = {
  orbitAxis: 'Z',
  rotationX: 0,
  rotationOrbit: 0,
  zoom: 0,
  target: [0, 0, 0],
  minRotationX: -90,
  maxRotationX: 90,
  minZoom: -Infinity,
  maxZoom: Infinity
};
var LINEAR_TRANSITION_PROPS = {
  transitionDuration: 300,
  transitionEasing: function transitionEasing(t) {
    return t;
  },
  transitionInterpolator: new LinearInterpolator(['target', 'zoom', 'rotationX', 'rotationOrbit']),
  transitionInterruption: TRANSITION_EVENTS.BREAK
};

var zoom2Scale = function zoom2Scale(zoom) {
  return Math.pow(2, zoom);
};

var OrbitState = function (_ViewState) {
  _inherits(OrbitState, _ViewState);

  var _super = _createSuper$1(OrbitState);

  function OrbitState(_ref) {
    var _this;

    var makeViewport = _ref.makeViewport,
        width = _ref.width,
        height = _ref.height,
        _ref$orbitAxis = _ref.orbitAxis,
        orbitAxis = _ref$orbitAxis === void 0 ? DEFAULT_STATE.orbitAxis : _ref$orbitAxis,
        _ref$rotationX = _ref.rotationX,
        rotationX = _ref$rotationX === void 0 ? DEFAULT_STATE.rotationX : _ref$rotationX,
        _ref$rotationOrbit = _ref.rotationOrbit,
        rotationOrbit = _ref$rotationOrbit === void 0 ? DEFAULT_STATE.rotationOrbit : _ref$rotationOrbit,
        _ref$target = _ref.target,
        target = _ref$target === void 0 ? DEFAULT_STATE.target : _ref$target,
        _ref$zoom = _ref.zoom,
        zoom = _ref$zoom === void 0 ? DEFAULT_STATE.zoom : _ref$zoom,
        _ref$minRotationX = _ref.minRotationX,
        minRotationX = _ref$minRotationX === void 0 ? DEFAULT_STATE.minRotationX : _ref$minRotationX,
        _ref$maxRotationX = _ref.maxRotationX,
        maxRotationX = _ref$maxRotationX === void 0 ? DEFAULT_STATE.maxRotationX : _ref$maxRotationX,
        _ref$minZoom = _ref.minZoom,
        minZoom = _ref$minZoom === void 0 ? DEFAULT_STATE.minZoom : _ref$minZoom,
        _ref$maxZoom = _ref.maxZoom,
        maxZoom = _ref$maxZoom === void 0 ? DEFAULT_STATE.maxZoom : _ref$maxZoom,
        startPanPosition = _ref.startPanPosition,
        startTarget = _ref.startTarget,
        startRotatePos = _ref.startRotatePos,
        startRotationX = _ref.startRotationX,
        startRotationOrbit = _ref.startRotationOrbit,
        startZoomPosition = _ref.startZoomPosition,
        startZoom = _ref.startZoom;

    _classCallCheck(this, OrbitState);

    _this = _super.call(this, {
      width: width,
      height: height,
      orbitAxis: orbitAxis,
      rotationX: rotationX,
      rotationOrbit: rotationOrbit,
      target: target,
      zoom: zoom,
      minRotationX: minRotationX,
      maxRotationX: maxRotationX,
      minZoom: minZoom,
      maxZoom: maxZoom
    });
    _this._state = {
      startPanPosition: startPanPosition,
      startTarget: startTarget,
      startRotatePos: startRotatePos,
      startRotationX: startRotationX,
      startRotationOrbit: startRotationOrbit,
      startZoomPosition: startZoomPosition,
      startZoom: startZoom
    };
    _this.makeViewport = makeViewport;
    return _this;
  }

  _createClass(OrbitState, [{
    key: "panStart",
    value: function panStart(_ref2) {
      var pos = _ref2.pos;
      var target = this._viewportProps.target;
      return this._getUpdatedState({
        startPanPosition: pos,
        startTarget: target
      });
    }
  }, {
    key: "pan",
    value: function pan(_ref3) {
      var pos = _ref3.pos,
          startPos = _ref3.startPos;
      var _this$_state = this._state,
          startPanPosition = _this$_state.startPanPosition,
          startTarget = _this$_state.startTarget;
      var delta = new Vector2(pos).subtract(startPanPosition);
      return this._getUpdatedState({
        target: this._calculateNewTarget({
          startTarget: startTarget,
          pixelOffset: delta
        })
      });
    }
  }, {
    key: "panEnd",
    value: function panEnd() {
      return this._getUpdatedState({
        startPanPosition: null,
        startTarget: null
      });
    }
  }, {
    key: "rotateStart",
    value: function rotateStart(_ref4) {
      var pos = _ref4.pos;
      return this._getUpdatedState({
        startRotatePos: pos,
        startRotationX: this._viewportProps.rotationX,
        startRotationOrbit: this._viewportProps.rotationOrbit
      });
    }
  }, {
    key: "rotate",
    value: function rotate(_ref5) {
      var pos = _ref5.pos,
          _ref5$deltaAngleX = _ref5.deltaAngleX,
          deltaAngleX = _ref5$deltaAngleX === void 0 ? 0 : _ref5$deltaAngleX,
          _ref5$deltaAngleY = _ref5.deltaAngleY,
          deltaAngleY = _ref5$deltaAngleY === void 0 ? 0 : _ref5$deltaAngleY;
      var _this$_state2 = this._state,
          startRotatePos = _this$_state2.startRotatePos,
          startRotationX = _this$_state2.startRotationX,
          startRotationOrbit = _this$_state2.startRotationOrbit;
      var _this$_viewportProps = this._viewportProps,
          width = _this$_viewportProps.width,
          height = _this$_viewportProps.height;

      if (!startRotatePos || !Number.isFinite(startRotationX) || !Number.isFinite(startRotationOrbit)) {
        return this;
      }

      var newRotation;

      if (pos) {
        var deltaScaleX = (pos[0] - startRotatePos[0]) / width;
        var deltaScaleY = (pos[1] - startRotatePos[1]) / height;

        if (startRotationX < -90 || startRotationX > 90) {
          deltaScaleX *= -1;
        }

        newRotation = {
          rotationX: startRotationX + deltaScaleY * 180,
          rotationOrbit: startRotationOrbit + deltaScaleX * 180
        };
      } else {
        newRotation = {
          rotationX: startRotationX + deltaAngleY,
          rotationOrbit: startRotationOrbit + deltaAngleX
        };
      }

      return this._getUpdatedState(newRotation);
    }
  }, {
    key: "rotateEnd",
    value: function rotateEnd() {
      return this._getUpdatedState({
        startRotationX: null,
        startRotationOrbit: null
      });
    }
  }, {
    key: "shortestPathFrom",
    value: function shortestPathFrom(viewState) {
      var fromProps = viewState.getViewportProps();
      var props = Object.assign({}, this._viewportProps);
      var rotationOrbit = props.rotationOrbit;

      if (Math.abs(rotationOrbit - fromProps.rotationOrbit) > 180) {
        props.rotationOrbit = rotationOrbit < 0 ? rotationOrbit + 360 : rotationOrbit - 360;
      }

      return props;
    }
  }, {
    key: "zoomStart",
    value: function zoomStart(_ref6) {
      var pos = _ref6.pos;
      return this._getUpdatedState({
        startZoomPosition: pos,
        startTarget: this._viewportProps.target,
        startZoom: this._viewportProps.zoom
      });
    }
  }, {
    key: "zoom",
    value: function zoom(_ref7) {
      var pos = _ref7.pos,
          startPos = _ref7.startPos,
          scale = _ref7.scale;
      var _this$_viewportProps2 = this._viewportProps,
          zoom = _this$_viewportProps2.zoom,
          width = _this$_viewportProps2.width,
          height = _this$_viewportProps2.height,
          target = _this$_viewportProps2.target;
      var _this$_state3 = this._state,
          startZoom = _this$_state3.startZoom,
          startZoomPosition = _this$_state3.startZoomPosition,
          startTarget = _this$_state3.startTarget;

      if (!Number.isFinite(startZoom)) {
        startZoom = zoom;
        startTarget = target;
        startZoomPosition = startPos || pos;
      }

      var newZoom = this._calculateNewZoom({
        scale: scale,
        startZoom: startZoom
      });

      var startScale = zoom2Scale(startZoom);
      var newScale = zoom2Scale(newZoom);
      var dX = (width / 2 - startZoomPosition[0]) * (newScale / startScale - 1);
      var dY = (height / 2 - startZoomPosition[1]) * (newScale / startScale - 1);
      return this._getUpdatedState({
        zoom: newZoom,
        target: this._calculateNewTarget({
          startTarget: startTarget,
          zoom: newZoom,
          pixelOffset: [dX, dY]
        })
      });
    }
  }, {
    key: "zoomEnd",
    value: function zoomEnd() {
      return this._getUpdatedState({
        startZoomPosition: null,
        startTarget: null,
        startZoom: null
      });
    }
  }, {
    key: "zoomIn",
    value: function zoomIn() {
      var speed = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 2;
      return this._getUpdatedState({
        zoom: this._calculateNewZoom({
          scale: speed
        })
      });
    }
  }, {
    key: "zoomOut",
    value: function zoomOut() {
      var speed = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 2;
      return this._getUpdatedState({
        zoom: this._calculateNewZoom({
          scale: 1 / speed
        })
      });
    }
  }, {
    key: "moveLeft",
    value: function moveLeft() {
      var speed = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 50;
      var pixelOffset = [-speed, 0];
      return this._getUpdatedState({
        target: this._calculateNewTarget({
          pixelOffset: pixelOffset
        })
      });
    }
  }, {
    key: "moveRight",
    value: function moveRight() {
      var speed = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 50;
      var pixelOffset = [speed, 0];
      return this._getUpdatedState({
        target: this._calculateNewTarget({
          pixelOffset: pixelOffset
        })
      });
    }
  }, {
    key: "moveUp",
    value: function moveUp() {
      var speed = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 50;
      var pixelOffset = [0, -speed];
      return this._getUpdatedState({
        target: this._calculateNewTarget({
          pixelOffset: pixelOffset
        })
      });
    }
  }, {
    key: "moveDown",
    value: function moveDown() {
      var speed = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 50;
      var pixelOffset = [0, speed];
      return this._getUpdatedState({
        target: this._calculateNewTarget({
          pixelOffset: pixelOffset
        })
      });
    }
  }, {
    key: "rotateLeft",
    value: function rotateLeft() {
      var speed = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 15;
      return this._getUpdatedState({
        rotationOrbit: this._viewportProps.rotationOrbit - speed
      });
    }
  }, {
    key: "rotateRight",
    value: function rotateRight() {
      var speed = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 15;
      return this._getUpdatedState({
        rotationOrbit: this._viewportProps.rotationOrbit + speed
      });
    }
  }, {
    key: "rotateUp",
    value: function rotateUp() {
      var speed = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 10;
      return this._getUpdatedState({
        rotationX: this._viewportProps.rotationX - speed
      });
    }
  }, {
    key: "rotateDown",
    value: function rotateDown() {
      var speed = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 10;
      return this._getUpdatedState({
        rotationX: this._viewportProps.rotationX + speed
      });
    }
  }, {
    key: "_calculateNewZoom",
    value: function _calculateNewZoom(_ref8) {
      var scale = _ref8.scale,
          startZoom = _ref8.startZoom;
      var _this$_viewportProps3 = this._viewportProps,
          maxZoom = _this$_viewportProps3.maxZoom,
          minZoom = _this$_viewportProps3.minZoom;

      if (!Number.isFinite(startZoom)) {
        startZoom = this._viewportProps.zoom;
      }

      var zoom = startZoom + Math.log2(scale);
      return clamp(zoom, minZoom, maxZoom);
    }
  }, {
    key: "_calculateNewTarget",
    value: function _calculateNewTarget(_ref9) {
      var startTarget = _ref9.startTarget,
          zoom = _ref9.zoom,
          pixelOffset = _ref9.pixelOffset;
      var viewportProps = Object.assign({}, this._viewportProps);

      if (Number.isFinite(zoom)) {
        viewportProps.zoom = zoom;
      }

      if (startTarget) {
        viewportProps.target = startTarget;
      }

      var viewport = this.makeViewport(viewportProps);
      var center = viewport.project(viewportProps.target);
      return viewport.unproject([center[0] - pixelOffset[0], center[1] - pixelOffset[1], center[2]]);
    }
  }, {
    key: "_getUpdatedState",
    value: function _getUpdatedState(newProps) {
      return new OrbitState(Object.assign({}, this._viewportProps, this._state, newProps));
    }
  }, {
    key: "_applyConstraints",
    value: function _applyConstraints(props) {
      var maxZoom = props.maxZoom,
          minZoom = props.minZoom,
          zoom = props.zoom,
          maxRotationX = props.maxRotationX,
          minRotationX = props.minRotationX,
          rotationOrbit = props.rotationOrbit;
      props.zoom = clamp(zoom, minZoom, maxZoom);
      props.rotationX = clamp(props.rotationX, minRotationX, maxRotationX);

      if (rotationOrbit < -180 || rotationOrbit > 180) {
        props.rotationOrbit = mod(rotationOrbit + 180, 360) - 180;
      }

      return props;
    }
  }]);

  return OrbitState;
}(ViewState);

var OrbitController = function (_Controller) {
  _inherits(OrbitController, _Controller);

  var _super2 = _createSuper$1(OrbitController);

  function OrbitController(props) {
    _classCallCheck(this, OrbitController);

    return _super2.call(this, OrbitState, props);
  }

  _createClass(OrbitController, [{
    key: "_getTransitionProps",
    value: function _getTransitionProps() {
      return LINEAR_TRANSITION_PROPS;
    }
  }]);

  return OrbitController;
}(Controller);

function _createSuper$2(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct$2(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _isNativeReflectConstruct$2() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }
var LINEAR_TRANSITION_PROPS$1 = {
  transitionDuration: 300,
  transitionEasing: function transitionEasing(t) {
    return t;
  },
  transitionInterpolator: new LinearInterpolator(['target', 'zoom']),
  transitionInterruption: TRANSITION_EVENTS.BREAK
};

var OrthographicController = function (_Controller) {
  _inherits(OrthographicController, _Controller);

  var _super = _createSuper$2(OrthographicController);

  function OrthographicController(props) {
    _classCallCheck(this, OrthographicController);

    props.dragMode = props.dragMode || 'pan';
    return _super.call(this, OrbitState, props);
  }

  _createClass(OrthographicController, [{
    key: "_onPanRotate",
    value: function _onPanRotate(event) {
      return false;
    }
  }, {
    key: "_getTransitionProps",
    value: function _getTransitionProps() {
      return LINEAR_TRANSITION_PROPS$1;
    }
  }]);

  return OrthographicController;
}(Controller);

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _createSuper$3(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct$3(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _isNativeReflectConstruct$3() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }
var viewMatrix = new Matrix4().lookAt({
  eye: [0, 0, 1]
});

function getProjectionMatrix(_ref) {
  var width = _ref.width,
      height = _ref.height,
      near = _ref.near,
      far = _ref.far;
  width = width || 1;
  height = height || 1;
  return new Matrix4().ortho({
    left: -width / 2,
    right: width / 2,
    bottom: -height / 2,
    top: height / 2,
    near: near,
    far: far
  });
}

var OrthographicViewport = function (_Viewport) {
  _inherits(OrthographicViewport, _Viewport);

  var _super = _createSuper$3(OrthographicViewport);

  function OrthographicViewport(props) {
    _classCallCheck(this, OrthographicViewport);

    var width = props.width,
        height = props.height,
        _props$near = props.near,
        near = _props$near === void 0 ? 0.1 : _props$near,
        _props$far = props.far,
        far = _props$far === void 0 ? 1000 : _props$far,
        _props$zoom = props.zoom,
        zoom = _props$zoom === void 0 ? 0 : _props$zoom,
        _props$target = props.target,
        target = _props$target === void 0 ? [0, 0, 0] : _props$target,
        _props$flipY = props.flipY,
        flipY = _props$flipY === void 0 ? true : _props$flipY;
    var scale = Math.pow(2, zoom);
    return _super.call(this, _objectSpread(_objectSpread({}, props), {}, {
      position: target,
      viewMatrix: viewMatrix.clone().scale([scale, scale * (flipY ? -1 : 1), scale]),
      projectionMatrix: getProjectionMatrix({
        width: width,
        height: height,
        near: near,
        far: far
      }),
      zoom: zoom
    }));
  }

  return OrthographicViewport;
}(Viewport);

var OrthographicView = function (_View) {
  _inherits(OrthographicView, _View);

  var _super2 = _createSuper$3(OrthographicView);

  function OrthographicView(props) {
    _classCallCheck(this, OrthographicView);

    return _super2.call(this, Object.assign({}, props, {
      type: OrthographicViewport
    }));
  }

  _createClass(OrthographicView, [{
    key: "controller",
    get: function get() {
      return this._getControllerProps({
        type: OrthographicController
      });
    }
  }]);

  return OrthographicView;
}(View);
OrthographicView.displayName = 'OrthographicView';

export { OrthographicView };
