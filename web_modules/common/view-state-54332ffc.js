import { o as assert, j as Viewport, p as equals, _ as _inherits, a as _getPrototypeOf, b as _possibleConstructorReturn, q as lerp, T as Transition } from './layer-6e52c28c.js';
import { _ as _typeof } from './typeof-c65245d2.js';
import { _ as _defineProperty } from './defineProperty-1b0b77a2.js';
import { _ as _classCallCheck } from './classCallCheck-4eda545c.js';
import { _ as _createClass } from './assertThisInitialized-87ceda02.js';

function deepEqual(a, b) {
  if (a === b) {
    return true;
  }

  if (!a || !b) {
    return false;
  }

  for (var key in a) {
    var aValue = a[key];
    var bValue = b[key];
    var equals = aValue === bValue || Array.isArray(aValue) && Array.isArray(bValue) && deepEqual(aValue, bValue);

    if (!equals) {
      return false;
    }
  }

  return true;
}

var PERCENT_OR_PIXELS_REGEX = /([0-9]+\.?[0-9]*)(%|px)/;
function parsePosition(value) {
  switch (_typeof(value)) {
    case 'number':
      return {
        position: value,
        relative: false
      };

    case 'string':
      var match = value.match(PERCENT_OR_PIXELS_REGEX);

      if (match && match.length >= 3) {
        var relative = match[2] === '%';
        var position = parseFloat(match[1]);
        return {
          position: relative ? position / 100 : position,
          relative: relative
        };
      }

    default:
      throw new Error("Could not parse position string ".concat(value));
  }
}
function getPosition(position, extent) {
  return position.relative ? Math.round(position.position * extent) : position.position;
}

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

var View = function () {
  function View() {
    var props = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, View);

    var _props$id = props.id,
        id = _props$id === void 0 ? null : _props$id,
        _props$x = props.x,
        x = _props$x === void 0 ? 0 : _props$x,
        _props$y = props.y,
        y = _props$y === void 0 ? 0 : _props$y,
        _props$width = props.width,
        width = _props$width === void 0 ? '100%' : _props$width,
        _props$height = props.height,
        height = _props$height === void 0 ? '100%' : _props$height,
        _props$projectionMatr = props.projectionMatrix,
        projectionMatrix = _props$projectionMatr === void 0 ? null : _props$projectionMatr,
        _props$fovy = props.fovy,
        fovy = _props$fovy === void 0 ? 50 : _props$fovy,
        _props$near = props.near,
        near = _props$near === void 0 ? 0.1 : _props$near,
        _props$far = props.far,
        far = _props$far === void 0 ? 1000 : _props$far,
        _props$modelMatrix = props.modelMatrix,
        modelMatrix = _props$modelMatrix === void 0 ? null : _props$modelMatrix,
        _props$viewportInstan = props.viewportInstance,
        viewportInstance = _props$viewportInstan === void 0 ? null : _props$viewportInstan,
        _props$type = props.type,
        type = _props$type === void 0 ? Viewport : _props$type;
    assert(!viewportInstance || viewportInstance instanceof Viewport);
    this.viewportInstance = viewportInstance;
    this.id = id || this.constructor.displayName || 'view';
    this.type = type;
    this.props = Object.assign({}, props, {
      id: this.id,
      projectionMatrix: projectionMatrix,
      fovy: fovy,
      near: near,
      far: far,
      modelMatrix: modelMatrix
    });

    this._parseDimensions({
      x: x,
      y: y,
      width: width,
      height: height
    });

    this.equals = this.equals.bind(this);
    Object.seal(this);
  }

  _createClass(View, [{
    key: "equals",
    value: function equals(view) {
      if (this === view) {
        return true;
      }

      if (this.viewportInstance) {
        return view.viewportInstance && this.viewportInstance.equals(view.viewportInstance);
      }

      var viewChanged = deepEqual(this.props, view.props);
      return viewChanged;
    }
  }, {
    key: "makeViewport",
    value: function makeViewport(_ref) {
      var width = _ref.width,
          height = _ref.height,
          viewState = _ref.viewState;

      if (this.viewportInstance) {
        return this.viewportInstance;
      }

      viewState = this.filterViewState(viewState);
      var viewportDimensions = this.getDimensions({
        width: width,
        height: height
      });

      var props = _objectSpread(_objectSpread(_objectSpread({}, viewState), this.props), viewportDimensions);

      return this._getViewport(props);
    }
  }, {
    key: "getViewStateId",
    value: function getViewStateId() {
      switch (_typeof(this.props.viewState)) {
        case 'string':
          return this.props.viewState;

        case 'object':
          return this.props.viewState && this.props.viewState.id;

        default:
          return this.id;
      }
    }
  }, {
    key: "filterViewState",
    value: function filterViewState(viewState) {
      if (this.props.viewState && _typeof(this.props.viewState) === 'object') {
        if (!this.props.viewState.id) {
          return this.props.viewState;
        }

        var newViewState = Object.assign({}, viewState);

        for (var key in this.props.viewState) {
          if (key !== 'id') {
            newViewState[key] = this.props.viewState[key];
          }
        }

        return newViewState;
      }

      return viewState;
    }
  }, {
    key: "getDimensions",
    value: function getDimensions(_ref2) {
      var width = _ref2.width,
          height = _ref2.height;
      return {
        x: getPosition(this._x, width),
        y: getPosition(this._y, height),
        width: getPosition(this._width, width),
        height: getPosition(this._height, height)
      };
    }
  }, {
    key: "_getControllerProps",
    value: function _getControllerProps(defaultOpts) {
      var opts = this.props.controller;

      if (!opts) {
        return null;
      }

      if (opts === true) {
        return defaultOpts;
      }

      if (typeof opts === 'function') {
        opts = {
          type: opts
        };
      }

      return Object.assign({}, defaultOpts, opts);
    }
  }, {
    key: "_getViewport",
    value: function _getViewport(props) {
      var ViewportType = this.type;
      return new ViewportType(props);
    }
  }, {
    key: "_parseDimensions",
    value: function _parseDimensions(_ref3) {
      var x = _ref3.x,
          y = _ref3.y,
          width = _ref3.width,
          height = _ref3.height;
      this._x = parsePosition(x);
      this._y = parsePosition(y);
      this._width = parsePosition(width);
      this._height = parsePosition(height);
    }
  }]);

  return View;
}();

function _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

var TransitionInterpolator = function () {
  function TransitionInterpolator() {
    var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, TransitionInterpolator);

    if (Array.isArray(opts)) {
      opts = {
        compare: opts,
        extract: opts,
        required: opts
      };
    }

    var _opts = opts,
        compare = _opts.compare,
        extract = _opts.extract,
        required = _opts.required;
    this._propsToCompare = compare;
    this._propsToExtract = extract;
    this._requiredProps = required;
  }

  _createClass(TransitionInterpolator, [{
    key: "arePropsEqual",
    value: function arePropsEqual(currentProps, nextProps) {
      var _iterator = _createForOfIteratorHelper(this._propsToCompare || Object.keys(nextProps)),
          _step;

      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var key = _step.value;

          if (!(key in currentProps) || !(key in nextProps) || !equals(currentProps[key], nextProps[key])) {
            return false;
          }
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }

      return true;
    }
  }, {
    key: "initializeProps",
    value: function initializeProps(startProps, endProps) {
      var result;

      if (this._propsToExtract) {
        var startViewStateProps = {};
        var endViewStateProps = {};

        var _iterator2 = _createForOfIteratorHelper(this._propsToExtract),
            _step2;

        try {
          for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
            var key = _step2.value;
            startViewStateProps[key] = startProps[key];
            endViewStateProps[key] = endProps[key];
          }
        } catch (err) {
          _iterator2.e(err);
        } finally {
          _iterator2.f();
        }

        result = {
          start: startViewStateProps,
          end: endViewStateProps
        };
      } else {
        result = {
          start: startProps,
          end: endProps
        };
      }

      this._checkRequiredProps(result.start);

      this._checkRequiredProps(result.end);

      return result;
    }
  }, {
    key: "interpolateProps",
    value: function interpolateProps(startProps, endProps, t) {
      return endProps;
    }
  }, {
    key: "getDuration",
    value: function getDuration(startProps, endProps) {
      return endProps.transitionDuration;
    }
  }, {
    key: "_checkRequiredProps",
    value: function _checkRequiredProps(props) {
      if (!this._requiredProps) {
        return;
      }

      this._requiredProps.forEach(function (propName) {
        var value = props[propName];
        assert(Number.isFinite(value) || Array.isArray(value), "".concat(propName, " is required for transition"));
      });
    }
  }]);

  return TransitionInterpolator;
}();

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }
var DEFAULT_PROPS = ['longitude', 'latitude', 'zoom', 'bearing', 'pitch'];
var DEFAULT_REQUIRED_PROPS = ['longitude', 'latitude', 'zoom'];

var LinearInterpolator = function (_TransitionInterpolat) {
  _inherits(LinearInterpolator, _TransitionInterpolat);

  var _super = _createSuper(LinearInterpolator);

  function LinearInterpolator(transitionProps) {
    _classCallCheck(this, LinearInterpolator);

    return _super.call(this, transitionProps || {
      compare: DEFAULT_PROPS,
      extract: DEFAULT_PROPS,
      required: DEFAULT_REQUIRED_PROPS
    });
  }

  _createClass(LinearInterpolator, [{
    key: "interpolateProps",
    value: function interpolateProps(startProps, endProps, t) {
      var viewport = {};

      for (var key in endProps) {
        viewport[key] = lerp(startProps[key] || 0, endProps[key] || 0, t);
      }

      return viewport;
    }
  }]);

  return LinearInterpolator;
}(TransitionInterpolator);

var noop = function noop() {};

var TRANSITION_EVENTS = {
  BREAK: 1,
  SNAP_TO_END: 2,
  IGNORE: 3
};
var DEFAULT_PROPS$1 = {
  transitionDuration: 0,
  transitionEasing: function transitionEasing(t) {
    return t;
  },
  transitionInterpolator: new LinearInterpolator(),
  transitionInterruption: TRANSITION_EVENTS.BREAK,
  onTransitionStart: noop,
  onTransitionInterrupt: noop,
  onTransitionEnd: noop
};

var TransitionManager = function () {
  function TransitionManager(ControllerState) {
    var props = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    _classCallCheck(this, TransitionManager);

    this.ControllerState = ControllerState;
    this.props = Object.assign({}, DEFAULT_PROPS$1, props);
    this.propsInTransition = null;
    this.transition = new Transition(props.timeline);
    this.onViewStateChange = props.onViewStateChange;
    this._onTransitionUpdate = this._onTransitionUpdate.bind(this);
  }

  _createClass(TransitionManager, [{
    key: "finalize",
    value: function finalize() {
      this.transition.cancel();
    }
  }, {
    key: "getViewportInTransition",
    value: function getViewportInTransition() {
      return this.propsInTransition;
    }
  }, {
    key: "processViewStateChange",
    value: function processViewStateChange(nextProps) {
      var transitionTriggered = false;
      var currentProps = this.props;
      nextProps = Object.assign({}, DEFAULT_PROPS$1, nextProps);
      this.props = nextProps;

      if (this._shouldIgnoreViewportChange(currentProps, nextProps)) {
        return transitionTriggered;
      }

      if (this._isTransitionEnabled(nextProps)) {
        var _this$transition$sett = this.transition.settings,
            interruption = _this$transition$sett.interruption,
            endProps = _this$transition$sett.endProps;
        var startProps = Object.assign({}, currentProps, interruption === TRANSITION_EVENTS.SNAP_TO_END ? endProps : this.propsInTransition || currentProps);

        this._triggerTransition(startProps, nextProps);

        transitionTriggered = true;
      } else {
        this.transition.cancel();
      }

      return transitionTriggered;
    }
  }, {
    key: "updateTransition",
    value: function updateTransition() {
      this.transition.update();
    }
  }, {
    key: "_isTransitionEnabled",
    value: function _isTransitionEnabled(props) {
      var transitionDuration = props.transitionDuration,
          transitionInterpolator = props.transitionInterpolator;
      return (transitionDuration > 0 || transitionDuration === 'auto') && Boolean(transitionInterpolator);
    }
  }, {
    key: "_isUpdateDueToCurrentTransition",
    value: function _isUpdateDueToCurrentTransition(props) {
      if (this.transition.inProgress) {
        return this.transition.settings.interpolator.arePropsEqual(props, this.propsInTransition);
      }

      return false;
    }
  }, {
    key: "_shouldIgnoreViewportChange",
    value: function _shouldIgnoreViewportChange(currentProps, nextProps) {
      if (this.transition.inProgress) {
        return this.transition.settings.interruption === TRANSITION_EVENTS.IGNORE || this._isUpdateDueToCurrentTransition(nextProps);
      } else if (this._isTransitionEnabled(nextProps)) {
        return nextProps.transitionInterpolator.arePropsEqual(currentProps, nextProps);
      }

      return true;
    }
  }, {
    key: "_triggerTransition",
    value: function _triggerTransition(startProps, endProps) {
      var startViewstate = new this.ControllerState(startProps);
      var endViewStateProps = new this.ControllerState(endProps).shortestPathFrom(startViewstate);
      var transitionInterpolator = endProps.transitionInterpolator;
      var duration = transitionInterpolator.getDuration ? transitionInterpolator.getDuration(startProps, endProps) : endProps.transitionDuration;

      if (duration === 0) {
        return;
      }

      var initialProps = endProps.transitionInterpolator.initializeProps(startProps, endViewStateProps);
      this.propsInTransition = {};
      this.duration = duration;
      this.transition.start({
        duration: duration,
        easing: endProps.transitionEasing,
        interpolator: endProps.transitionInterpolator,
        interruption: endProps.transitionInterruption,
        startProps: initialProps.start,
        endProps: initialProps.end,
        onStart: endProps.onTransitionStart,
        onUpdate: this._onTransitionUpdate,
        onInterrupt: this._onTransitionEnd(endProps.onTransitionInterrupt),
        onEnd: this._onTransitionEnd(endProps.onTransitionEnd)
      });
      this.updateTransition();
    }
  }, {
    key: "_onTransitionEnd",
    value: function _onTransitionEnd(callback) {
      var _this = this;

      return function (transition) {
        _this.propsInTransition = null;
        callback(transition);
      };
    }
  }, {
    key: "_onTransitionUpdate",
    value: function _onTransitionUpdate(transition) {
      var time = transition.time,
          _transition$settings = transition.settings,
          interpolator = _transition$settings.interpolator,
          startProps = _transition$settings.startProps,
          endProps = _transition$settings.endProps,
          duration = _transition$settings.duration,
          easing = _transition$settings.easing;
      var t = easing(time / duration);
      var viewport = interpolator.interpolateProps(startProps, endProps, t);
      this.propsInTransition = new this.ControllerState(Object.assign({}, this.props, viewport)).getViewportProps();

      if (this.onViewStateChange) {
        this.onViewStateChange({
          viewState: this.propsInTransition,
          interactionState: {
            inTransition: true
          },
          oldViewState: this.props
        });
      }
    }
  }]);

  return TransitionManager;
}();
TransitionManager.defaultProps = DEFAULT_PROPS$1;

function ownKeys$1(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread$1(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys$1(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys$1(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }
var NO_TRANSITION_PROPS = {
  transitionDuration: 0
};
var ZOOM_ACCEL = 0.01;
var EVENT_TYPES = {
  WHEEL: ['wheel'],
  PAN: ['panstart', 'panmove', 'panend'],
  PINCH: ['pinchstart', 'pinchmove', 'pinchend'],
  DOUBLE_TAP: ['doubletap'],
  KEYBOARD: ['keydown']
};

var Controller = function () {
  function Controller(ControllerState) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    _classCallCheck(this, Controller);

    assert(ControllerState);
    this.ControllerState = ControllerState;
    this.controllerState = null;
    this.controllerStateProps = null;
    this.eventManager = null;
    this.transitionManager = new TransitionManager(ControllerState, options);
    this._events = null;
    this._state = {
      isDragging: false
    };
    this._customEvents = [];
    this.onViewStateChange = null;
    this.onStateChange = null;
    this.invertPan = false;
    this.handleEvent = this.handleEvent.bind(this);
    this.setProps(options);
  }

  _createClass(Controller, [{
    key: "finalize",
    value: function finalize() {
      for (var eventName in this._events) {
        if (this._events[eventName]) {
          this.eventManager.off(eventName, this.handleEvent);
        }
      }

      this.transitionManager.finalize();
    }
  }, {
    key: "handleEvent",
    value: function handleEvent(event) {
      var ControllerState = this.ControllerState;
      this.controllerState = new ControllerState(_objectSpread$1(_objectSpread$1({
        makeViewport: this.makeViewport
      }, this.controllerStateProps), this._state));

      switch (event.type) {
        case 'panstart':
          return this._onPanStart(event);

        case 'panmove':
          return this._onPan(event);

        case 'panend':
          return this._onPanEnd(event);

        case 'pinchstart':
          return this._onPinchStart(event);

        case 'pinchmove':
          return this._onPinch(event);

        case 'pinchend':
          return this._onPinchEnd(event);

        case 'doubletap':
          return this._onDoubleTap(event);

        case 'wheel':
          return this._onWheel(event);

        case 'keydown':
          return this._onKeyDown(event);

        default:
          return false;
      }
    }
  }, {
    key: "getCenter",
    value: function getCenter(event) {
      var _this$controllerState = this.controllerStateProps,
          x = _this$controllerState.x,
          y = _this$controllerState.y;
      var offsetCenter = event.offsetCenter;
      return [offsetCenter.x - x, offsetCenter.y - y];
    }
  }, {
    key: "isPointInBounds",
    value: function isPointInBounds(pos, event) {
      var _this$controllerState2 = this.controllerStateProps,
          width = _this$controllerState2.width,
          height = _this$controllerState2.height;

      if (event && event.handled) {
        return false;
      }

      var inside = pos[0] >= 0 && pos[0] <= width && pos[1] >= 0 && pos[1] <= height;

      if (inside && event) {
        event.stopPropagation();
      }

      return inside;
    }
  }, {
    key: "isFunctionKeyPressed",
    value: function isFunctionKeyPressed(event) {
      var srcEvent = event.srcEvent;
      return Boolean(srcEvent.metaKey || srcEvent.altKey || srcEvent.ctrlKey || srcEvent.shiftKey);
    }
  }, {
    key: "isDragging",
    value: function isDragging() {
      return this._state.isDragging;
    }
  }, {
    key: "setProps",
    value: function setProps(props) {
      if ('onViewStateChange' in props) {
        this.onViewStateChange = props.onViewStateChange;
      }

      if ('onStateChange' in props) {
        this.onStateChange = props.onStateChange;
      }

      if ('makeViewport' in props) {
        this.makeViewport = props.makeViewport;
      }

      this.controllerStateProps = props;

      if ('eventManager' in props && this.eventManager !== props.eventManager) {
        this.eventManager = props.eventManager;
        this._events = {};
        this.toggleEvents(this._customEvents, true);
      }

      this.transitionManager.processViewStateChange(this.controllerStateProps);
      var _props$scrollZoom = props.scrollZoom,
          scrollZoom = _props$scrollZoom === void 0 ? true : _props$scrollZoom,
          _props$dragPan = props.dragPan,
          dragPan = _props$dragPan === void 0 ? true : _props$dragPan,
          _props$dragRotate = props.dragRotate,
          dragRotate = _props$dragRotate === void 0 ? true : _props$dragRotate,
          _props$doubleClickZoo = props.doubleClickZoom,
          doubleClickZoom = _props$doubleClickZoo === void 0 ? true : _props$doubleClickZoo,
          _props$touchZoom = props.touchZoom,
          touchZoom = _props$touchZoom === void 0 ? true : _props$touchZoom,
          _props$touchRotate = props.touchRotate,
          touchRotate = _props$touchRotate === void 0 ? false : _props$touchRotate,
          _props$keyboard = props.keyboard,
          keyboard = _props$keyboard === void 0 ? true : _props$keyboard;
      var isInteractive = Boolean(this.onViewStateChange);
      this.toggleEvents(EVENT_TYPES.WHEEL, isInteractive && scrollZoom);
      this.toggleEvents(EVENT_TYPES.PAN, isInteractive && (dragPan || dragRotate));
      this.toggleEvents(EVENT_TYPES.PINCH, isInteractive && (touchZoom || touchRotate));
      this.toggleEvents(EVENT_TYPES.DOUBLE_TAP, isInteractive && doubleClickZoom);
      this.toggleEvents(EVENT_TYPES.KEYBOARD, isInteractive && keyboard);
      this.scrollZoom = scrollZoom;
      this.dragPan = dragPan;
      this.dragRotate = dragRotate;
      this.doubleClickZoom = doubleClickZoom;
      this.touchZoom = touchZoom;
      this.touchRotate = touchRotate;
      this.keyboard = keyboard;
    }
  }, {
    key: "updateTransition",
    value: function updateTransition() {
      this.transitionManager.updateTransition();
    }
  }, {
    key: "toggleEvents",
    value: function toggleEvents(eventNames, enabled) {
      var _this = this;

      if (this.eventManager) {
        eventNames.forEach(function (eventName) {
          if (_this._events[eventName] !== enabled) {
            _this._events[eventName] = enabled;

            if (enabled) {
              _this.eventManager.on(eventName, _this.handleEvent);
            } else {
              _this.eventManager.off(eventName, _this.handleEvent);
            }
          }
        });
      }
    }
  }, {
    key: "updateViewport",
    value: function updateViewport(newControllerState) {
      var extraProps = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var interactionState = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
      var viewState = Object.assign({}, newControllerState.getViewportProps(), extraProps);
      var changed = this.controllerState !== newControllerState;

      if (changed) {
        var oldViewState = this.controllerState ? this.controllerState.getViewportProps() : null;

        if (this.onViewStateChange) {
          this.onViewStateChange({
            viewState: viewState,
            interactionState: interactionState,
            oldViewState: oldViewState
          });
        }
      }

      Object.assign(this._state, newControllerState.getInteractiveState(), interactionState);

      if (this.onStateChange) {
        this.onStateChange(this._state);
      }
    }
  }, {
    key: "_onPanStart",
    value: function _onPanStart(event) {
      var pos = this.getCenter(event);

      if (!this.isPointInBounds(pos, event)) {
        return false;
      }

      var newControllerState = this.controllerState.panStart({
        pos: pos
      }).rotateStart({
        pos: pos
      });
      this.updateViewport(newControllerState, NO_TRANSITION_PROPS, {
        isDragging: true
      });
      return true;
    }
  }, {
    key: "_onPan",
    value: function _onPan(event) {
      if (!this.isDragging()) {
        return false;
      }

      var alternateMode = this.isFunctionKeyPressed(event) || event.rightButton;
      alternateMode = this.invertPan ? !alternateMode : alternateMode;
      return alternateMode ? this._onPanMove(event) : this._onPanRotate(event);
    }
  }, {
    key: "_onPanEnd",
    value: function _onPanEnd(event) {
      var newControllerState = this.controllerState.panEnd().rotateEnd();
      this.updateViewport(newControllerState, null, {
        isDragging: false,
        isPanning: false,
        isRotating: false
      });
      return true;
    }
  }, {
    key: "_onPanMove",
    value: function _onPanMove(event) {
      if (!this.dragPan) {
        return false;
      }

      var pos = this.getCenter(event);
      var newControllerState = this.controllerState.pan({
        pos: pos
      });
      this.updateViewport(newControllerState, NO_TRANSITION_PROPS, {
        isDragging: true,
        isPanning: true
      });
      return true;
    }
  }, {
    key: "_onPanRotate",
    value: function _onPanRotate(event) {
      if (!this.dragRotate) {
        return false;
      }

      var deltaX = event.deltaX,
          deltaY = event.deltaY;

      var _this$controllerState3 = this.controllerState.getViewportProps(),
          width = _this$controllerState3.width,
          height = _this$controllerState3.height;

      var deltaScaleX = deltaX / width;
      var deltaScaleY = deltaY / height;
      var newControllerState = this.controllerState.rotate({
        deltaScaleX: deltaScaleX,
        deltaScaleY: deltaScaleY
      });
      this.updateViewport(newControllerState, NO_TRANSITION_PROPS, {
        isDragging: true,
        isRotating: true
      });
      return true;
    }
  }, {
    key: "_onWheel",
    value: function _onWheel(event) {
      if (!this.scrollZoom) {
        return false;
      }

      event.preventDefault();
      var pos = this.getCenter(event);

      if (!this.isPointInBounds(pos, event)) {
        return false;
      }

      var delta = event.delta;
      var scale = 2 / (1 + Math.exp(-Math.abs(delta * ZOOM_ACCEL)));

      if (delta < 0 && scale !== 0) {
        scale = 1 / scale;
      }

      var newControllerState = this.controllerState.zoom({
        pos: pos,
        scale: scale
      });
      this.updateViewport(newControllerState, NO_TRANSITION_PROPS, {
        isZooming: true,
        isPanning: true
      });
      return true;
    }
  }, {
    key: "_onPinchStart",
    value: function _onPinchStart(event) {
      var pos = this.getCenter(event);

      if (!this.isPointInBounds(pos, event)) {
        return false;
      }

      var newControllerState = this.controllerState.zoomStart({
        pos: pos
      }).rotateStart({
        pos: pos
      });
      this._state.startPinchRotation = event.rotation;
      this.updateViewport(newControllerState, NO_TRANSITION_PROPS, {
        isDragging: true
      });
      return true;
    }
  }, {
    key: "_onPinch",
    value: function _onPinch(event) {
      if (!this.touchZoom && !this.touchRotate) {
        return false;
      }

      if (!this.isDragging()) {
        return false;
      }

      var newControllerState = this.controllerState;

      if (this.touchZoom) {
        var scale = event.scale;
        var pos = this.getCenter(event);
        newControllerState = newControllerState.zoom({
          pos: pos,
          scale: scale
        });
      }

      if (this.touchRotate) {
        var rotation = event.rotation;
        var startPinchRotation = this._state.startPinchRotation;
        newControllerState = newControllerState.rotate({
          deltaScaleX: -(rotation - startPinchRotation) / 180
        });
      }

      this.updateViewport(newControllerState, NO_TRANSITION_PROPS, {
        isDragging: true,
        isPanning: this.touchZoom,
        isZooming: this.touchZoom,
        isRotating: this.touchRotate
      });
      return true;
    }
  }, {
    key: "_onPinchEnd",
    value: function _onPinchEnd(event) {
      var newControllerState = this.controllerState.zoomEnd().rotateEnd();
      this._state.startPinchRotation = 0;
      this.updateViewport(newControllerState, null, {
        isDragging: false,
        isPanning: false,
        isZooming: false,
        isRotating: false
      });
      return true;
    }
  }, {
    key: "_onDoubleTap",
    value: function _onDoubleTap(event) {
      if (!this.doubleClickZoom) {
        return false;
      }

      var pos = this.getCenter(event);

      if (!this.isPointInBounds(pos, event)) {
        return false;
      }

      var isZoomOut = this.isFunctionKeyPressed(event);
      var newControllerState = this.controllerState.zoom({
        pos: pos,
        scale: isZoomOut ? 0.5 : 2
      });
      this.updateViewport(newControllerState, this._getTransitionProps(), {
        isZooming: true,
        isPanning: true
      });
      return true;
    }
  }, {
    key: "_onKeyDown",
    value: function _onKeyDown(event) {
      if (!this.keyboard) {
        return false;
      }

      var funcKey = this.isFunctionKeyPressed(event);
      var controllerState = this.controllerState;
      var newControllerState;
      var interactionState = {};

      switch (event.srcEvent.code) {
        case 'Minus':
          newControllerState = funcKey ? controllerState.zoomOut().zoomOut() : controllerState.zoomOut();
          interactionState.isZooming = true;
          break;

        case 'Equal':
          newControllerState = funcKey ? controllerState.zoomIn().zoomIn() : controllerState.zoomIn();
          interactionState.isZooming = true;
          break;

        case 'ArrowLeft':
          if (funcKey) {
            newControllerState = controllerState.rotateLeft();
            interactionState.isRotating = true;
          } else {
            newControllerState = controllerState.moveLeft();
            interactionState.isPanning = true;
          }

          break;

        case 'ArrowRight':
          if (funcKey) {
            newControllerState = controllerState.rotateRight();
            interactionState.isRotating = true;
          } else {
            newControllerState = controllerState.moveRight();
            interactionState.isPanning = true;
          }

          break;

        case 'ArrowUp':
          if (funcKey) {
            newControllerState = controllerState.rotateUp();
            interactionState.isRotating = true;
          } else {
            newControllerState = controllerState.moveUp();
            interactionState.isPanning = true;
          }

          break;

        case 'ArrowDown':
          if (funcKey) {
            newControllerState = controllerState.rotateDown();
            interactionState.isRotating = true;
          } else {
            newControllerState = controllerState.moveDown();
            interactionState.isPanning = true;
          }

          break;

        default:
          return false;
      }

      this.updateViewport(newControllerState, this._getTransitionProps(), interactionState);
      return true;
    }
  }, {
    key: "_getTransitionProps",
    value: function _getTransitionProps() {
      return NO_TRANSITION_PROPS;
    }
  }, {
    key: "events",
    set: function set(customEvents) {
      this.toggleEvents(this._customEvents, false);
      this.toggleEvents(customEvents, true);
      this._customEvents = customEvents;
      this.setProps(this.controllerStateProps);
    }
  }]);

  return Controller;
}();

var ViewState = function () {
  function ViewState(opts) {
    _classCallCheck(this, ViewState);

    assert(Number.isFinite(opts.width), '`width` must be supplied');
    assert(Number.isFinite(opts.height), '`height` must be supplied');
    this._viewportProps = this._applyConstraints(opts);
  }

  _createClass(ViewState, [{
    key: "getViewportProps",
    value: function getViewportProps() {
      return this._viewportProps;
    }
  }, {
    key: "shortestPathFrom",
    value: function shortestPathFrom(viewState) {
      return this._viewportProps;
    }
  }, {
    key: "_applyConstraints",
    value: function _applyConstraints(props) {
      return props;
    }
  }]);

  return ViewState;
}();

export { Controller as C, LinearInterpolator as L, TRANSITION_EVENTS as T, ViewState as V, View as a, deepEqual as d };
