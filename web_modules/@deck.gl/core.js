import '../common/_commonjsHelpers-37fa8da4.js';
import { _ as _inherits, a as _getPrototypeOf, b as _possibleConstructorReturn, i as isArray, c as config, d as checkNumber, t as transformMat4, v as vec2_transformMat4AsVector, e as transformMat3, f as transformMat2d, g as transformMat2, V as Vector, h as clamp, m as mod, M as Matrix4, j as Viewport } from '../common/layer-6e52c28c.js';
export { C as COORDINATE_SYSTEM } from '../common/layer-6e52c28c.js';
import '../common/process-2545f00a.js';
import '../common/typeof-c65245d2.js';
import '../common/defineProperty-1b0b77a2.js';
import { _ as _classCallCheck } from '../common/classCallCheck-4eda545c.js';
import { _ as _createClass } from '../common/assertThisInitialized-87ceda02.js';
import '../common/_node-resolve:empty-0f7f843d.js';
import '../common/slicedToArray-14e71088.js';
import { L as LinearInterpolator, T as TRANSITION_EVENTS, V as ViewState, C as Controller, a as View } from '../common/view-state-54332ffc.js';
export { C as CompositeLayer } from '../common/composite-layer-d77b2c59.js';

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
var MOVEMENT_SPEED = 50;
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
    _this._interactiveState = {
      startPanPosition: startPanPosition,
      startTarget: startTarget,
      startRotationX: startRotationX,
      startRotationOrbit: startRotationOrbit,
      startZoomPosition: startZoomPosition,
      startZoom: startZoom
    };
    _this.makeViewport = makeViewport;
    return _this;
  }

  _createClass(OrbitState, [{
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
      var _this$_interactiveSta = this._interactiveState,
          startPanPosition = _this$_interactiveSta.startPanPosition,
          startTarget = _this$_interactiveSta.startTarget;
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
        startRotationX: this._viewportProps.rotationX,
        startRotationOrbit: this._viewportProps.rotationOrbit
      });
    }
  }, {
    key: "rotate",
    value: function rotate(_ref5) {
      var deltaScaleX = _ref5.deltaScaleX,
          deltaScaleY = _ref5.deltaScaleY;
      var _this$_interactiveSta2 = this._interactiveState,
          startRotationX = _this$_interactiveSta2.startRotationX,
          startRotationOrbit = _this$_interactiveSta2.startRotationOrbit;

      if (!Number.isFinite(startRotationX) || !Number.isFinite(startRotationOrbit)) {
        return this;
      }

      if (startRotationX < -90 || startRotationX > 90) {
        deltaScaleX *= -1;
      }

      return this._getUpdatedState({
        rotationX: startRotationX + deltaScaleY * 180,
        rotationOrbit: startRotationOrbit + deltaScaleX * 180,
        isRotating: true
      });
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
      var _this$_viewportProps = this._viewportProps,
          zoom = _this$_viewportProps.zoom,
          width = _this$_viewportProps.width,
          height = _this$_viewportProps.height,
          target = _this$_viewportProps.target;
      var _this$_interactiveSta3 = this._interactiveState,
          startZoom = _this$_interactiveSta3.startZoom,
          startZoomPosition = _this$_interactiveSta3.startZoomPosition,
          startTarget = _this$_interactiveSta3.startTarget;

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
      return this._getUpdatedState({
        zoom: this._calculateNewZoom({
          scale: 2
        })
      });
    }
  }, {
    key: "zoomOut",
    value: function zoomOut() {
      return this._getUpdatedState({
        zoom: this._calculateNewZoom({
          scale: 0.5
        })
      });
    }
  }, {
    key: "moveLeft",
    value: function moveLeft() {
      var pixelOffset = [-MOVEMENT_SPEED, 0];
      return this._getUpdatedState({
        target: this._calculateNewTarget({
          pixelOffset: pixelOffset
        })
      });
    }
  }, {
    key: "moveRight",
    value: function moveRight() {
      var pixelOffset = [MOVEMENT_SPEED, 0];
      return this._getUpdatedState({
        target: this._calculateNewTarget({
          pixelOffset: pixelOffset
        })
      });
    }
  }, {
    key: "moveUp",
    value: function moveUp() {
      var pixelOffset = [0, -MOVEMENT_SPEED];
      return this._getUpdatedState({
        target: this._calculateNewTarget({
          pixelOffset: pixelOffset
        })
      });
    }
  }, {
    key: "moveDown",
    value: function moveDown() {
      var pixelOffset = [0, MOVEMENT_SPEED];
      return this._getUpdatedState({
        target: this._calculateNewTarget({
          pixelOffset: pixelOffset
        })
      });
    }
  }, {
    key: "rotateLeft",
    value: function rotateLeft() {
      return this._getUpdatedState({
        rotationOrbit: this._viewportProps.rotationOrbit - 15
      });
    }
  }, {
    key: "rotateRight",
    value: function rotateRight() {
      return this._getUpdatedState({
        rotationOrbit: this._viewportProps.rotationOrbit + 15
      });
    }
  }, {
    key: "rotateUp",
    value: function rotateUp() {
      return this._getUpdatedState({
        rotationX: this._viewportProps.rotationX - 10
      });
    }
  }, {
    key: "rotateDown",
    value: function rotateDown() {
      return this._getUpdatedState({
        rotationX: this._viewportProps.rotationX + 10
      });
    }
  }, {
    key: "_calculateNewZoom",
    value: function _calculateNewZoom(_ref8) {
      var scale = _ref8.scale,
          startZoom = _ref8.startZoom;
      var _this$_viewportProps2 = this._viewportProps,
          maxZoom = _this$_viewportProps2.maxZoom,
          minZoom = _this$_viewportProps2.minZoom;

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
      return new OrbitState(Object.assign({}, this._viewportProps, this._interactiveState, newProps));
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
    var _this;

    _classCallCheck(this, OrthographicController);

    _this = _super.call(this, OrbitState, props);
    _this.invertPan = true;
    return _this;
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
    bottom: height / 2,
    top: -height / 2,
    near: near,
    far: far
  });
}

var OrthographicViewport = function (_Viewport) {
  _inherits(OrthographicViewport, _Viewport);

  var _super = _createSuper$3(OrthographicViewport);

  function OrthographicViewport(_ref2) {
    var _this;

    var id = _ref2.id,
        x = _ref2.x,
        y = _ref2.y,
        width = _ref2.width,
        height = _ref2.height,
        _ref2$near = _ref2.near,
        near = _ref2$near === void 0 ? 0.1 : _ref2$near,
        _ref2$far = _ref2.far,
        far = _ref2$far === void 0 ? 1000 : _ref2$far,
        _ref2$zoom = _ref2.zoom,
        zoom = _ref2$zoom === void 0 ? 0 : _ref2$zoom,
        _ref2$target = _ref2.target,
        target = _ref2$target === void 0 ? [0, 0, 0] : _ref2$target;

    _classCallCheck(this, OrthographicViewport);

    var scale = Math.pow(2, zoom);
    return _possibleConstructorReturn(_this, new Viewport({
      id: id,
      x: x,
      y: y,
      width: width,
      height: height,
      position: target,
      viewMatrix: viewMatrix.clone().scale(scale),
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
