import { _ as _defineProperty } from './defineProperty-1b0b77a2.js';
import { _ as _typeof } from './typeof-c65245d2.js';
import { _ as _classCallCheck } from './classCallCheck-4eda545c.js';
import { _ as _createClass } from './setPrototypeOf-f270a38e.js';
import { b as assert, a as Viewport, T as Transition, _ as _get } from './layer-8f126b7a.js';
import { _ as _slicedToArray } from './slicedToArray-4a4de7f2.js';
import { j as equals, _ as _inherits, a as _getPrototypeOf, b as _possibleConstructorReturn, l as lerp } from './matrix4-3a7b6be3.js';

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
      return this._getViewport(viewState, viewportDimensions);
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
    value: function _getViewport(viewState, viewportDimensions) {
      var ViewportType = this.type;
      return new ViewportType(_objectSpread(_objectSpread(_objectSpread({}, viewState), this.props), viewportDimensions));
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

var noop = function noop() {};

var TRANSITION_EVENTS = {
  BREAK: 1,
  SNAP_TO_END: 2,
  IGNORE: 3
};
var DEFAULT_PROPS = {
  transitionEasing: function transitionEasing(t) {
    return t;
  },
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
    this.props = Object.assign({}, DEFAULT_PROPS, props);
    this.propsInTransition = null;
    this.transition = new Transition(props.timeline);
    this.onViewStateChange = props.onViewStateChange || noop;
    this.onStateChange = props.onStateChange || noop;
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
      nextProps = Object.assign({}, DEFAULT_PROPS, nextProps);
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
      this.onStateChange({
        inTransition: true
      });
      this.updateTransition();
    }
  }, {
    key: "_onTransitionEnd",
    value: function _onTransitionEnd(callback) {
      var _this = this;

      return function (transition) {
        _this.propsInTransition = null;

        _this.onStateChange({
          inTransition: false,
          isZooming: false,
          isPanning: false,
          isRotating: false
        });

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
      this.onViewStateChange({
        viewState: this.propsInTransition,
        oldViewState: this.props
      });
    }
  }]);

  return TransitionManager;
}();

function ownKeys$1(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread$1(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys$1(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys$1(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }
var NO_TRANSITION_PROPS = {
  transitionDuration: 0
};
var DEFAULT_INERTIA = 300;

var INERTIA_EASING = function INERTIA_EASING(t) {
  return 1 - (1 - t) * (1 - t);
};

var EVENT_TYPES = {
  WHEEL: ['wheel'],
  PAN: ['panstart', 'panmove', 'panend'],
  PINCH: ['pinchstart', 'pinchmove', 'pinchend'],
  TRIPLE_PAN: ['tripanstart', 'tripanmove', 'tripanend'],
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
    this.transitionManager = new TransitionManager(ControllerState, _objectSpread$1(_objectSpread$1({}, options), {}, {
      onViewStateChange: this._onTransition.bind(this),
      onStateChange: this._setInteractionState.bind(this)
    }));
    this._events = null;
    this._interactionState = {
      isDragging: false
    };
    this._customEvents = [];
    this.onViewStateChange = null;
    this.onStateChange = null;
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
      var eventStartBlocked = this._eventStartBlocked;

      switch (event.type) {
        case 'panstart':
          return eventStartBlocked ? false : this._onPanStart(event);

        case 'panmove':
          return this._onPan(event);

        case 'panend':
          return this._onPanEnd(event);

        case 'pinchstart':
          return eventStartBlocked ? false : this._onPinchStart(event);

        case 'pinchmove':
          return this._onPinch(event);

        case 'pinchend':
          return this._onPinchEnd(event);

        case 'tripanstart':
          return eventStartBlocked ? false : this._onTriplePanStart(event);

        case 'tripanmove':
          return this._onTriplePan(event);

        case 'tripanend':
          return this._onTriplePanEnd(event);

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
      return this._interactionState.isDragging;
    }
  }, {
    key: "blockEvents",
    value: function blockEvents(timeout) {
      var _this = this;

      var timer = setTimeout(function () {
        if (_this._eventStartBlocked === timer) {
          _this._eventStartBlocked = null;
        }
      }, timeout);
      this._eventStartBlocked = timer;
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

      if ('dragMode' in props) {
        this.dragMode = props.dragMode;
      }

      this.controllerStateProps = props;

      if ('eventManager' in props && this.eventManager !== props.eventManager) {
        this.eventManager = props.eventManager;
        this._events = {};
        this.toggleEvents(this._customEvents, true);
      }

      if (!('transitionInterpolator' in props)) {
        props.transitionInterpolator = this._getTransitionProps().transitionInterpolator;
      }

      this.transitionManager.processViewStateChange(props);
      var inertia = props.inertia;

      if (inertia === true) {
        inertia = DEFAULT_INERTIA;
      }

      this.inertia = inertia;
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
      this.toggleEvents(EVENT_TYPES.TRIPLE_PAN, isInteractive && touchRotate);
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
      var _this2 = this;

      if (this.eventManager) {
        eventNames.forEach(function (eventName) {
          if (_this2._events[eventName] !== enabled) {
            _this2._events[eventName] = enabled;

            if (enabled) {
              _this2.eventManager.on(eventName, _this2.handleEvent);
            } else {
              _this2.eventManager.off(eventName, _this2.handleEvent);
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
      this._state = newControllerState.getState();

      this._setInteractionState(interactionState);

      if (changed) {
        var oldViewState = this.controllerState ? this.controllerState.getViewportProps() : null;

        if (this.onViewStateChange) {
          this.onViewStateChange({
            viewState: viewState,
            interactionState: this._interactionState,
            oldViewState: oldViewState
          });
        }
      }
    }
  }, {
    key: "_onTransition",
    value: function _onTransition(params) {
      if (this.onViewStateChange) {
        params.interactionState = this._interactionState;
        this.onViewStateChange(params);
      }
    }
  }, {
    key: "_setInteractionState",
    value: function _setInteractionState(newStates) {
      Object.assign(this._interactionState, newStates);

      if (this.onStateChange) {
        this.onStateChange(this._interactionState);
      }
    }
  }, {
    key: "_onPanStart",
    value: function _onPanStart(event) {
      var pos = this.getCenter(event);

      if (!this.isPointInBounds(pos, event)) {
        return false;
      }

      var alternateMode = this.isFunctionKeyPressed(event) || event.rightButton;

      if (this.invertPan || this.dragMode === 'pan') {
        alternateMode = !alternateMode;
      }

      var newControllerState = this.controllerState[alternateMode ? 'panStart' : 'rotateStart']({
        pos: pos
      });
      this._panMove = alternateMode;
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

      return this._panMove ? this._onPanMove(event) : this._onPanRotate(event);
    }
  }, {
    key: "_onPanEnd",
    value: function _onPanEnd(event) {
      if (!this.isDragging()) {
        return false;
      }

      return this._panMove ? this._onPanMoveEnd(event) : this._onPanRotateEnd(event);
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
    key: "_onPanMoveEnd",
    value: function _onPanMoveEnd(event) {
      var inertia = this.inertia;

      if (this.dragPan && inertia && event.velocity) {
        var pos = this.getCenter(event);
        var endPos = [pos[0] + event.velocityX * inertia / 2, pos[1] + event.velocityY * inertia / 2];
        var newControllerState = this.controllerState.pan({
          pos: endPos
        }).panEnd();
        this.updateViewport(newControllerState, _objectSpread$1(_objectSpread$1({}, this._getTransitionProps()), {}, {
          transitionDuration: inertia,
          transitionEasing: INERTIA_EASING
        }), {
          isDragging: false,
          isPanning: true
        });
      } else {
        var _newControllerState = this.controllerState.panEnd();

        this.updateViewport(_newControllerState, null, {
          isDragging: false,
          isPanning: false
        });
      }

      return true;
    }
  }, {
    key: "_onPanRotate",
    value: function _onPanRotate(event) {
      if (!this.dragRotate) {
        return false;
      }

      var pos = this.getCenter(event);
      var newControllerState = this.controllerState.rotate({
        pos: pos
      });
      this.updateViewport(newControllerState, NO_TRANSITION_PROPS, {
        isDragging: true,
        isRotating: true
      });
      return true;
    }
  }, {
    key: "_onPanRotateEnd",
    value: function _onPanRotateEnd(event) {
      var inertia = this.inertia;

      if (this.dragRotate && inertia && event.velocity) {
        var pos = this.getCenter(event);
        var endPos = [pos[0] + event.velocityX * inertia / 2, pos[1] + event.velocityY * inertia / 2];
        var newControllerState = this.controllerState.rotate({
          pos: endPos
        }).rotateEnd();
        this.updateViewport(newControllerState, _objectSpread$1(_objectSpread$1({}, this._getTransitionProps()), {}, {
          transitionDuration: inertia,
          transitionEasing: INERTIA_EASING
        }), {
          isDragging: false,
          isRotating: true
        });
      } else {
        var _newControllerState2 = this.controllerState.rotateEnd();

        this.updateViewport(_newControllerState2, null, {
          isDragging: false,
          isRotating: false
        });
      }

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

      var _this$scrollZoom = this.scrollZoom,
          _this$scrollZoom$spee = _this$scrollZoom.speed,
          speed = _this$scrollZoom$spee === void 0 ? 0.01 : _this$scrollZoom$spee,
          _this$scrollZoom$smoo = _this$scrollZoom.smooth,
          smooth = _this$scrollZoom$smoo === void 0 ? false : _this$scrollZoom$smoo;
      var delta = event.delta;
      var scale = 2 / (1 + Math.exp(-Math.abs(delta * speed)));

      if (delta < 0 && scale !== 0) {
        scale = 1 / scale;
      }

      var newControllerState = this.controllerState.zoom({
        pos: pos,
        scale: scale
      });
      this.updateViewport(newControllerState, _objectSpread$1(_objectSpread$1({}, this._getTransitionProps({
        around: pos
      })), {}, {
        transitionDuration: smooth ? 250 : 1
      }), {
        isZooming: true,
        isPanning: true
      });
      return true;
    }
  }, {
    key: "_onTriplePanStart",
    value: function _onTriplePanStart(event) {
      var pos = this.getCenter(event);

      if (!this.isPointInBounds(pos, event)) {
        return false;
      }

      var newControllerState = this.controllerState.rotateStart({
        pos: pos
      });
      this.updateViewport(newControllerState, NO_TRANSITION_PROPS, {
        isDragging: true
      });
      return true;
    }
  }, {
    key: "_onTriplePan",
    value: function _onTriplePan(event) {
      if (!this.touchRotate) {
        return false;
      }

      if (!this.isDragging()) {
        return false;
      }

      var pos = this.getCenter(event);
      pos[0] -= event.deltaX;
      var newControllerState = this.controllerState.rotate({
        pos: pos
      });
      this.updateViewport(newControllerState, NO_TRANSITION_PROPS, {
        isDragging: true,
        isRotating: true
      });
      return true;
    }
  }, {
    key: "_onTriplePanEnd",
    value: function _onTriplePanEnd(event) {
      if (!this.isDragging()) {
        return false;
      }

      var inertia = this.inertia;

      if (this.touchRotate && inertia && event.velocityY) {
        var pos = this.getCenter(event);
        var endPos = [pos[0], pos[1] += event.velocityY * inertia / 2];
        var newControllerState = this.controllerState.rotate({
          pos: endPos
        });
        this.updateViewport(newControllerState, _objectSpread$1(_objectSpread$1({}, this._getTransitionProps()), {}, {
          transitionDuration: inertia,
          transitionEasing: INERTIA_EASING
        }), {
          isDragging: false,
          isRotating: true
        });
        this.blockEvents(inertia);
      } else {
        var _newControllerState3 = this.controllerState.rotateEnd();

        this.updateViewport(_newControllerState3, null, {
          isDragging: false,
          isRotating: false
        });
      }

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
      this._startPinchRotation = event.rotation;
      this._lastPinchEvent = event;
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
        newControllerState = newControllerState.rotate({
          deltaAngleX: this._startPinchRotation - rotation
        });
      }

      this.updateViewport(newControllerState, NO_TRANSITION_PROPS, {
        isDragging: true,
        isPanning: this.touchZoom,
        isZooming: this.touchZoom,
        isRotating: this.touchRotate
      });
      this._lastPinchEvent = event;
      return true;
    }
  }, {
    key: "_onPinchEnd",
    value: function _onPinchEnd(event) {
      if (!this.isDragging()) {
        return false;
      }

      var inertia = this.inertia,
          _lastPinchEvent = this._lastPinchEvent;

      if (this.touchZoom && inertia && _lastPinchEvent && event.scale !== _lastPinchEvent.scale) {
        var pos = this.getCenter(event);
        var newControllerState = this.controllerState.rotateEnd();
        var z = Math.log2(event.scale);

        var velocityZ = (z - Math.log2(_lastPinchEvent.scale)) / (event.deltaTime - _lastPinchEvent.deltaTime);

        var endScale = Math.pow(2, z + velocityZ * inertia / 2);
        newControllerState = newControllerState.zoom({
          pos: pos,
          scale: endScale
        }).zoomEnd();
        this.updateViewport(newControllerState, _objectSpread$1(_objectSpread$1({}, this._getTransitionProps({
          around: pos
        })), {}, {
          transitionDuration: inertia,
          transitionEasing: INERTIA_EASING
        }), {
          isDragging: false,
          isPanning: this.touchZoom,
          isZooming: this.touchZoom,
          isRotating: false
        });
        this.blockEvents(inertia);
      } else {
        var _newControllerState4 = this.controllerState.zoomEnd().rotateEnd();

        this.updateViewport(_newControllerState4, null, {
          isDragging: false,
          isPanning: false,
          isZooming: false,
          isRotating: false
        });
      }

      this._startPinchRotation = null;
      this._lastPinchEvent = null;
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
      this.updateViewport(newControllerState, this._getTransitionProps({
        around: pos
      }), {
        isZooming: true,
        isPanning: true
      });
      this.blockEvents(100);
      return true;
    }
  }, {
    key: "_onKeyDown",
    value: function _onKeyDown(event) {
      if (!this.keyboard) {
        return false;
      }

      var funcKey = this.isFunctionKeyPressed(event);
      var _this$keyboard = this.keyboard,
          zoomSpeed = _this$keyboard.zoomSpeed,
          moveSpeed = _this$keyboard.moveSpeed,
          rotateSpeedX = _this$keyboard.rotateSpeedX,
          rotateSpeedY = _this$keyboard.rotateSpeedY;
      var controllerState = this.controllerState;
      var newControllerState;
      var interactionState = {};

      switch (event.srcEvent.code) {
        case 'Minus':
          newControllerState = funcKey ? controllerState.zoomOut(zoomSpeed).zoomOut(zoomSpeed) : controllerState.zoomOut(zoomSpeed);
          interactionState.isZooming = true;
          break;

        case 'Equal':
          newControllerState = funcKey ? controllerState.zoomIn(zoomSpeed).zoomIn(zoomSpeed) : controllerState.zoomIn(zoomSpeed);
          interactionState.isZooming = true;
          break;

        case 'ArrowLeft':
          if (funcKey) {
            newControllerState = controllerState.rotateLeft(rotateSpeedX);
            interactionState.isRotating = true;
          } else {
            newControllerState = controllerState.moveLeft(moveSpeed);
            interactionState.isPanning = true;
          }

          break;

        case 'ArrowRight':
          if (funcKey) {
            newControllerState = controllerState.rotateRight(rotateSpeedX);
            interactionState.isRotating = true;
          } else {
            newControllerState = controllerState.moveRight(moveSpeed);
            interactionState.isPanning = true;
          }

          break;

        case 'ArrowUp':
          if (funcKey) {
            newControllerState = controllerState.rotateUp(rotateSpeedY);
            interactionState.isRotating = true;
          } else {
            newControllerState = controllerState.moveUp(moveSpeed);
            interactionState.isPanning = true;
          }

          break;

        case 'ArrowDown':
          if (funcKey) {
            newControllerState = controllerState.rotateDown(rotateSpeedY);
            interactionState.isRotating = true;
          } else {
            newControllerState = controllerState.moveDown(moveSpeed);
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
    key: "getState",
    value: function getState() {
      return this._state;
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

function ownKeys$2(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread$2(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys$2(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys$2(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _createForOfIteratorHelper$1(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray$1(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray$1(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray$1(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray$1(o, minLen); }

function _arrayLikeToArray$1(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }
var DEFAULT_PROPS$1 = ['longitude', 'latitude', 'zoom', 'bearing', 'pitch'];
var DEFAULT_REQUIRED_PROPS = ['longitude', 'latitude', 'zoom'];

var LinearInterpolator = function (_TransitionInterpolat) {
  _inherits(LinearInterpolator, _TransitionInterpolat);

  var _super = _createSuper(LinearInterpolator);

  function LinearInterpolator() {
    var _this;

    var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, LinearInterpolator);

    var transitionProps = Array.isArray(opts) ? opts : opts.transitionProps;
    _this = _super.call(this, transitionProps || {
      compare: DEFAULT_PROPS$1,
      extract: DEFAULT_PROPS$1,
      required: DEFAULT_REQUIRED_PROPS
    });
    _this.opts = opts;
    return _this;
  }

  _createClass(LinearInterpolator, [{
    key: "initializeProps",
    value: function initializeProps(startProps, endProps) {
      var result = _get(_getPrototypeOf(LinearInterpolator.prototype), "initializeProps", this).call(this, startProps, endProps);

      var _this$opts = this.opts,
          makeViewport = _this$opts.makeViewport,
          around = _this$opts.around;

      if (makeViewport && around) {
        var startViewport = makeViewport(startProps);
        var endViewport = makeViewport(endProps);
        var aroundLngLat = startViewport.unproject(around);
        result.start.around = around;
        Object.assign(result.end, {
          around: endViewport.project(aroundLngLat),
          aroundLngLat: aroundLngLat,
          width: endProps.width,
          height: endProps.height
        });
      }

      return result;
    }
  }, {
    key: "interpolateProps",
    value: function interpolateProps(startProps, endProps, t) {
      var propsInTransition = {};

      var _iterator = _createForOfIteratorHelper$1(this._propsToExtract),
          _step;

      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var key = _step.value;
          propsInTransition[key] = lerp(startProps[key] || 0, endProps[key] || 0, t);
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }

      if (endProps.aroundLngLat) {
        var viewport = this.opts.makeViewport(_objectSpread$2(_objectSpread$2({}, endProps), propsInTransition));

        var _viewport$getMapCente = viewport.getMapCenterByLngLatPosition({
          lngLat: endProps.aroundLngLat,
          pos: lerp(startProps.around, endProps.around, t)
        }),
            _viewport$getMapCente2 = _slicedToArray(_viewport$getMapCente, 2),
            longitude = _viewport$getMapCente2[0],
            latitude = _viewport$getMapCente2[1];

        propsInTransition.longitude = longitude;
        propsInTransition.latitude = latitude;
      }

      return propsInTransition;
    }
  }]);

  return LinearInterpolator;
}(TransitionInterpolator);

export { Controller as C, LinearInterpolator as L, TRANSITION_EVENTS as T, ViewState as V, View as a, deepEqual as d };
