import { _ as _inherits, a as _getPrototypeOf, b as _possibleConstructorReturn, k as _get, l as flatten, n as debug, L as Layer } from './layer-6e52c28c.js';
import { _ as _classCallCheck } from './classCallCheck-4eda545c.js';
import { _ as _createClass } from './assertThisInitialized-87ceda02.js';

function _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }
var TRACE_RENDER_LAYERS = 'compositeLayer.renderLayers';

var CompositeLayer = function (_Layer) {
  _inherits(CompositeLayer, _Layer);

  var _super = _createSuper(CompositeLayer);

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

      var _iterator = _createForOfIteratorHelper(extensions),
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

      var _iterator2 = _createForOfIteratorHelper(subLayers),
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

export { CompositeLayer as C };
