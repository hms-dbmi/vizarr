import { p as project32, a as picking, G as Geometry } from '../common/solid-polygon-layer-90f3f599.js';
export { S as SolidPolygonLayer } from '../common/solid-polygon-layer-90f3f599.js';
import { _ as _slicedToArray } from '../common/slicedToArray-cdb146e7.js';
import { _ as _defineProperty } from '../common/defineProperty-1b0b77a2.js';
import { _ as _classCallCheck } from '../common/classCallCheck-4eda545c.js';
import { _ as _createClass } from '../common/setPrototypeOf-d164daa3.js';
import { _ as _inherits, a as _getPrototypeOf, b as _possibleConstructorReturn } from '../common/matrix4-e4e8695c.js';
import { c as Texture2D, l as load, e as cloneTextureFrom, g as copyToTexture, h as createIterable, _ as _get, M as Model, i as log, L as Layer } from '../common/layer-660a8390.js';
import { I as ImageLoader } from '../common/image-loader-9298f69e.js';
import { C as CompositeLayer } from '../common/composite-layer-1bf9b89a.js';
import '../common/project-ae3b3777.js';
import '../common/toConsumableArray-06af309a.js';
import '../common/process-2545f00a.js';
import '../common/_commonjsHelpers-37fa8da4.js';
import '../common/interopRequireDefault-0a992762.js';
import '../common/interopRequireWildcard-7a8da193.js';
import '../common/_node-resolve:empty-0f7f843d.js';

var vs = "#define SHADER_NAME icon-layer-vertex-shader\n\nattribute vec2 positions;\n\nattribute vec3 instancePositions;\nattribute vec3 instancePositions64Low;\nattribute float instanceSizes;\nattribute float instanceAngles;\nattribute vec4 instanceColors;\nattribute vec3 instancePickingColors;\nattribute vec4 instanceIconFrames;\nattribute float instanceColorModes;\nattribute vec2 instanceOffsets;\nattribute vec2 instancePixelOffset;\n\nuniform float sizeScale;\nuniform vec2 iconsTextureDim;\nuniform float sizeMinPixels;\nuniform float sizeMaxPixels;\nuniform bool billboard;\n\nvarying float vColorMode;\nvarying vec4 vColor;\nvarying vec2 vTextureCoords;\nvarying vec2 uv;\n\nvec2 rotate_by_angle(vec2 vertex, float angle) {\n  float angle_radian = angle * PI / 180.0;\n  float cos_angle = cos(angle_radian);\n  float sin_angle = sin(angle_radian);\n  mat2 rotationMatrix = mat2(cos_angle, -sin_angle, sin_angle, cos_angle);\n  return rotationMatrix * vertex;\n}\n\nvoid main(void) {\n  geometry.worldPosition = instancePositions;\n  geometry.uv = positions;\n  geometry.pickingColor = instancePickingColors;\n  uv = positions;\n\n  vec2 iconSize = instanceIconFrames.zw;\n  float sizePixels = clamp(\n    project_size_to_pixel(instanceSizes * sizeScale), \n    sizeMinPixels, sizeMaxPixels\n  );\n  float instanceScale = iconSize.y == 0.0 ? 0.0 : sizePixels / iconSize.y;\n  vec2 pixelOffset = positions / 2.0 * iconSize + instanceOffsets;\n  pixelOffset = rotate_by_angle(pixelOffset, instanceAngles) * instanceScale;\n  pixelOffset += instancePixelOffset;\n  pixelOffset.y *= -1.0;\n\n  if (billboard)  {\n    gl_Position = project_position_to_clipspace(instancePositions, instancePositions64Low, vec3(0.0), geometry.position);\n    vec3 offset = vec3(pixelOffset, 0.0);\n    DECKGL_FILTER_SIZE(offset, geometry);\n    gl_Position.xy += project_pixel_size_to_clipspace(offset.xy);\n\n  } else {\n    vec3 offset_common = vec3(project_pixel_size(pixelOffset), 0.0);\n    DECKGL_FILTER_SIZE(offset_common, geometry);\n    gl_Position = project_position_to_clipspace(instancePositions, instancePositions64Low, offset_common, geometry.position); \n  }\n  DECKGL_FILTER_GL_POSITION(gl_Position, geometry);\n\n  vTextureCoords = mix(\n    instanceIconFrames.xy,\n    instanceIconFrames.xy + iconSize,\n    (positions.xy + 1.0) / 2.0\n  ) / iconsTextureDim;\n\n  vColor = instanceColors;\n  DECKGL_FILTER_COLOR(vColor, geometry);\n\n  vColorMode = instanceColorModes;\n}\n";

var fs = "#define SHADER_NAME icon-layer-fragment-shader\n\nprecision highp float;\n\nuniform float opacity;\nuniform sampler2D iconsTexture;\nuniform float alphaCutoff;\n\nvarying float vColorMode;\nvarying vec4 vColor;\nvarying vec2 vTextureCoords;\nvarying vec2 uv;\n\nvoid main(void) {\n  geometry.uv = uv;\n\n  vec4 texColor = texture2D(iconsTexture, vTextureCoords);\n  vec3 color = mix(texColor.rgb, vColor.rgb, vColorMode);\n  float a = texColor.a * opacity * vColor.a;\n\n  if (a < alphaCutoff) {\n    discard;\n  }\n\n  gl_FragColor = vec4(color, a);\n  DECKGL_FILTER_COLOR(gl_FragColor, geometry);\n}\n";

var _DEFAULT_TEXTURE_PARA;

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }
var DEFAULT_CANVAS_WIDTH = 1024;
var DEFAULT_BUFFER = 4;

var noop = function noop() {};

var DEFAULT_TEXTURE_PARAMETERS = (_DEFAULT_TEXTURE_PARA = {}, _defineProperty(_DEFAULT_TEXTURE_PARA, 10241, 9987), _defineProperty(_DEFAULT_TEXTURE_PARA, 10240, 9729), _defineProperty(_DEFAULT_TEXTURE_PARA, 10242, 33071), _defineProperty(_DEFAULT_TEXTURE_PARA, 10243, 33071), _DEFAULT_TEXTURE_PARA);

function nextPowOfTwo(number) {
  return Math.pow(2, Math.ceil(Math.log2(number)));
}

function resizeImage(ctx, imageData, width, height) {
  if (width === imageData.width && height === imageData.height) {
    return imageData;
  }

  ctx.canvas.height = height;
  ctx.canvas.width = width;
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.drawImage(imageData, 0, 0, imageData.width, imageData.height, 0, 0, width, height);
  return ctx.canvas;
}

function getIconId(icon) {
  return icon && (icon.id || icon.url);
}

function resizeTexture(gl, texture, width, height) {
  var oldWidth = texture.width;
  var oldHeight = texture.height;
  var newTexture = cloneTextureFrom(texture, {
    width: width,
    height: height
  });
  copyToTexture(texture, newTexture, {
    targetY: 0,
    width: oldWidth,
    height: oldHeight
  });
  texture["delete"]();
  return newTexture;
}

function buildRowMapping(mapping, columns, yOffset) {
  for (var i = 0; i < columns.length; i++) {
    var _columns$i = columns[i],
        icon = _columns$i.icon,
        xOffset = _columns$i.xOffset;
    var id = getIconId(icon);
    mapping[id] = Object.assign({}, icon, {
      x: xOffset,
      y: yOffset
    });
  }
}

function buildMapping(_ref) {
  var icons = _ref.icons,
      buffer = _ref.buffer,
      _ref$mapping = _ref.mapping,
      mapping = _ref$mapping === void 0 ? {} : _ref$mapping,
      _ref$xOffset = _ref.xOffset,
      xOffset = _ref$xOffset === void 0 ? 0 : _ref$xOffset,
      _ref$yOffset = _ref.yOffset,
      yOffset = _ref$yOffset === void 0 ? 0 : _ref$yOffset,
      _ref$rowHeight = _ref.rowHeight,
      rowHeight = _ref$rowHeight === void 0 ? 0 : _ref$rowHeight,
      canvasWidth = _ref.canvasWidth;
  var columns = [];

  for (var i = 0; i < icons.length; i++) {
    var icon = icons[i];
    var id = getIconId(icon);

    if (!mapping[id]) {
      var height = icon.height,
          width = icon.width;

      if (xOffset + width + buffer > canvasWidth) {
        buildRowMapping(mapping, columns, yOffset);
        xOffset = 0;
        yOffset = rowHeight + yOffset + buffer;
        rowHeight = 0;
        columns = [];
      }

      columns.push({
        icon: icon,
        xOffset: xOffset
      });
      xOffset = xOffset + width + buffer;
      rowHeight = Math.max(rowHeight, height);
    }
  }

  if (columns.length > 0) {
    buildRowMapping(mapping, columns, yOffset);
  }

  return {
    mapping: mapping,
    rowHeight: rowHeight,
    xOffset: xOffset,
    yOffset: yOffset,
    canvasWidth: canvasWidth,
    canvasHeight: nextPowOfTwo(rowHeight + yOffset + buffer)
  };
}
function getDiffIcons(data, getIcon, cachedIcons) {
  if (!data || !getIcon) {
    return null;
  }

  cachedIcons = cachedIcons || {};
  var icons = {};

  var _createIterable = createIterable(data),
      iterable = _createIterable.iterable,
      objectInfo = _createIterable.objectInfo;

  var _iterator = _createForOfIteratorHelper(iterable),
      _step;

  try {
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      var object = _step.value;
      objectInfo.index++;
      var icon = getIcon(object, objectInfo);
      var id = getIconId(icon);

      if (!icon) {
        throw new Error('Icon is missing.');
      }

      if (!icon.url) {
        throw new Error('Icon url is missing.');
      }

      if (!icons[id] && (!cachedIcons[id] || icon.url !== cachedIcons[id].url)) {
        icons[id] = _objectSpread(_objectSpread({}, icon), {}, {
          source: object,
          sourceIndex: objectInfo.index
        });
      }
    }
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }

  return icons;
}

var IconManager = function () {
  function IconManager(gl, _ref2) {
    var _ref2$onUpdate = _ref2.onUpdate,
        onUpdate = _ref2$onUpdate === void 0 ? noop : _ref2$onUpdate,
        _ref2$onError = _ref2.onError,
        onError = _ref2$onError === void 0 ? noop : _ref2$onError;

    _classCallCheck(this, IconManager);

    this.gl = gl;
    this.onUpdate = onUpdate;
    this.onError = onError;
    this._loadOptions = null;
    this._getIcon = null;
    this._texture = null;
    this._externalTexture = null;
    this._mapping = {};
    this._pendingCount = 0;
    this._autoPacking = false;
    this._xOffset = 0;
    this._yOffset = 0;
    this._rowHeight = 0;
    this._buffer = DEFAULT_BUFFER;
    this._canvasWidth = DEFAULT_CANVAS_WIDTH;
    this._canvasHeight = 0;
    this._canvas = null;
  }

  _createClass(IconManager, [{
    key: "finalize",
    value: function finalize() {
      if (this._texture) {
        this._texture["delete"]();
      }
    }
  }, {
    key: "getTexture",
    value: function getTexture() {
      return this._texture || this._externalTexture;
    }
  }, {
    key: "getIconMapping",
    value: function getIconMapping(icon) {
      var id = this._autoPacking ? getIconId(icon) : icon;
      return this._mapping[id] || {};
    }
  }, {
    key: "setProps",
    value: function setProps(_ref3) {
      var loadOptions = _ref3.loadOptions,
          autoPacking = _ref3.autoPacking,
          iconAtlas = _ref3.iconAtlas,
          iconMapping = _ref3.iconMapping,
          data = _ref3.data,
          getIcon = _ref3.getIcon;

      if (loadOptions) {
        this._loadOptions = loadOptions;
      }

      if (autoPacking !== undefined) {
        this._autoPacking = autoPacking;
      }

      if (getIcon) {
        this._getIcon = getIcon;
      }

      if (iconMapping) {
        this._mapping = iconMapping;
      }

      if (iconAtlas) {
        this._updateIconAtlas(iconAtlas);
      }

      if (this._autoPacking && (data || getIcon) && typeof document !== 'undefined') {
        this._canvas = this._canvas || document.createElement('canvas');

        this._updateAutoPacking(data);
      }
    }
  }, {
    key: "_updateIconAtlas",
    value: function _updateIconAtlas(iconAtlas) {
      if (this._texture) {
        this._texture["delete"]();

        this._texture = null;
      }

      this._externalTexture = iconAtlas;
      this.onUpdate();
    }
  }, {
    key: "_updateAutoPacking",
    value: function _updateAutoPacking(data) {
      var icons = Object.values(getDiffIcons(data, this._getIcon, this._mapping) || {});

      if (icons.length > 0) {
        var _buildMapping = buildMapping({
          icons: icons,
          buffer: this._buffer,
          canvasWidth: this._canvasWidth,
          mapping: this._mapping,
          rowHeight: this._rowHeight,
          xOffset: this._xOffset,
          yOffset: this._yOffset
        }),
            mapping = _buildMapping.mapping,
            xOffset = _buildMapping.xOffset,
            yOffset = _buildMapping.yOffset,
            rowHeight = _buildMapping.rowHeight,
            canvasHeight = _buildMapping.canvasHeight;

        this._rowHeight = rowHeight;
        this._mapping = mapping;
        this._xOffset = xOffset;
        this._yOffset = yOffset;
        this._canvasHeight = canvasHeight;

        if (!this._texture) {
          this._texture = new Texture2D(this.gl, {
            width: this._canvasWidth,
            height: this._canvasHeight,
            parameters: DEFAULT_TEXTURE_PARAMETERS
          });
        }

        if (this._texture.height !== this._canvasHeight) {
          this._texture = resizeTexture(this.gl, this._texture, this._canvasWidth, this._canvasHeight);
        }

        this.onUpdate();

        this._loadIcons(icons);
      }
    }
  }, {
    key: "_loadIcons",
    value: function _loadIcons(icons) {
      var _this = this;

      var ctx = this._canvas.getContext('2d');

      var _iterator2 = _createForOfIteratorHelper(icons),
          _step2;

      try {
        var _loop = function _loop() {
          var icon = _step2.value;
          _this._pendingCount++;
          load(icon.url, ImageLoader, _this._loadOptions).then(function (imageData) {
            var id = getIconId(icon);
            var _this$_mapping$id = _this._mapping[id],
                x = _this$_mapping$id.x,
                y = _this$_mapping$id.y,
                width = _this$_mapping$id.width,
                height = _this$_mapping$id.height;
            var data = resizeImage(ctx, imageData, width, height);

            _this._texture.setSubImageData({
              data: data,
              x: x,
              y: y,
              width: width,
              height: height
            });

            _this._texture.generateMipmap();

            _this.onUpdate();
          })["catch"](function (error) {
            _this.onError({
              url: icon.url,
              source: icon.source,
              sourceIndex: icon.sourceIndex,
              loadOptions: _this._loadOptions,
              error: error
            });
          })["finally"](function () {
            _this._pendingCount--;
          });
        };

        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
          _loop();
        }
      } catch (err) {
        _iterator2.e(err);
      } finally {
        _iterator2.f();
      }
    }
  }, {
    key: "isLoaded",
    get: function get() {
      return this._pendingCount === 0;
    }
  }]);

  return IconManager;
}();

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }
var DEFAULT_COLOR = [0, 0, 0, 255];
var defaultProps = {
  iconAtlas: {
    type: 'image',
    value: null,
    async: true
  },
  iconMapping: {
    type: 'object',
    value: {},
    async: true
  },
  sizeScale: {
    type: 'number',
    value: 1,
    min: 0
  },
  billboard: true,
  sizeUnits: 'pixels',
  sizeMinPixels: {
    type: 'number',
    min: 0,
    value: 0
  },
  sizeMaxPixels: {
    type: 'number',
    min: 0,
    value: Number.MAX_SAFE_INTEGER
  },
  alphaCutoff: {
    type: 'number',
    value: 0.05,
    min: 0,
    max: 1
  },
  getPosition: {
    type: 'accessor',
    value: function value(x) {
      return x.position;
    }
  },
  getIcon: {
    type: 'accessor',
    value: function value(x) {
      return x.icon;
    }
  },
  getColor: {
    type: 'accessor',
    value: DEFAULT_COLOR
  },
  getSize: {
    type: 'accessor',
    value: 1
  },
  getAngle: {
    type: 'accessor',
    value: 0
  },
  getPixelOffset: {
    type: 'accessor',
    value: [0, 0]
  },
  onIconError: {
    type: 'function',
    value: null,
    compare: false,
    optional: true
  }
};

var IconLayer = function (_Layer) {
  _inherits(IconLayer, _Layer);

  var _super = _createSuper(IconLayer);

  function IconLayer() {
    _classCallCheck(this, IconLayer);

    return _super.apply(this, arguments);
  }

  _createClass(IconLayer, [{
    key: "getShaders",
    value: function getShaders() {
      return _get(_getPrototypeOf(IconLayer.prototype), "getShaders", this).call(this, {
        vs: vs,
        fs: fs,
        modules: [project32, picking]
      });
    }
  }, {
    key: "initializeState",
    value: function initializeState() {
      this.state = {
        iconManager: new IconManager(this.context.gl, {
          onUpdate: this._onUpdate.bind(this),
          onError: this._onError.bind(this)
        })
      };
      var attributeManager = this.getAttributeManager();
      attributeManager.addInstanced({
        instancePositions: {
          size: 3,
          type: 5130,
          fp64: this.use64bitPositions(),
          transition: true,
          accessor: 'getPosition'
        },
        instanceSizes: {
          size: 1,
          transition: true,
          accessor: 'getSize',
          defaultValue: 1
        },
        instanceOffsets: {
          size: 2,
          accessor: 'getIcon',
          transform: this.getInstanceOffset
        },
        instanceIconFrames: {
          size: 4,
          accessor: 'getIcon',
          transform: this.getInstanceIconFrame
        },
        instanceColorModes: {
          size: 1,
          type: 5121,
          accessor: 'getIcon',
          transform: this.getInstanceColorMode
        },
        instanceColors: {
          size: this.props.colorFormat.length,
          type: 5121,
          normalized: true,
          transition: true,
          accessor: 'getColor',
          defaultValue: DEFAULT_COLOR
        },
        instanceAngles: {
          size: 1,
          transition: true,
          accessor: 'getAngle'
        },
        instancePixelOffset: {
          size: 2,
          transition: true,
          accessor: 'getPixelOffset'
        }
      });
    }
  }, {
    key: "updateState",
    value: function updateState(_ref) {
      var oldProps = _ref.oldProps,
          props = _ref.props,
          changeFlags = _ref.changeFlags;

      _get(_getPrototypeOf(IconLayer.prototype), "updateState", this).call(this, {
        props: props,
        oldProps: oldProps,
        changeFlags: changeFlags
      });

      var attributeManager = this.getAttributeManager();
      var iconAtlas = props.iconAtlas,
          iconMapping = props.iconMapping,
          data = props.data,
          getIcon = props.getIcon;
      var iconManager = this.state.iconManager;
      iconManager.setProps({
        loadOptions: props.loadOptions
      });
      var iconMappingChanged = false;
      var prePacked = iconAtlas || this.internalState.isAsyncPropLoading('iconAtlas');

      if (prePacked) {
        if (oldProps.iconAtlas !== props.iconAtlas) {
          iconManager.setProps({
            iconAtlas: iconAtlas,
            autoPacking: false
          });
        }

        if (oldProps.iconMapping !== props.iconMapping) {
          iconManager.setProps({
            iconMapping: iconMapping
          });
          iconMappingChanged = true;
        }
      } else {
        iconManager.setProps({
          autoPacking: true
        });
      }

      if (changeFlags.dataChanged || changeFlags.updateTriggersChanged && (changeFlags.updateTriggersChanged.all || changeFlags.updateTriggersChanged.getIcon)) {
        iconManager.setProps({
          data: data,
          getIcon: getIcon
        });
      }

      if (iconMappingChanged) {
        attributeManager.invalidate('instanceOffsets');
        attributeManager.invalidate('instanceIconFrames');
        attributeManager.invalidate('instanceColorModes');
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
    key: "finalizeState",
    value: function finalizeState() {
      _get(_getPrototypeOf(IconLayer.prototype), "finalizeState", this).call(this);

      this.state.iconManager.finalize();
    }
  }, {
    key: "draw",
    value: function draw(_ref2) {
      var uniforms = _ref2.uniforms;
      var _this$props = this.props,
          sizeScale = _this$props.sizeScale,
          sizeMinPixels = _this$props.sizeMinPixels,
          sizeMaxPixels = _this$props.sizeMaxPixels,
          sizeUnits = _this$props.sizeUnits,
          billboard = _this$props.billboard,
          alphaCutoff = _this$props.alphaCutoff;
      var iconManager = this.state.iconManager;
      var viewport = this.context.viewport;
      var iconsTexture = iconManager.getTexture();

      if (iconsTexture) {
        this.state.model.setUniforms(Object.assign({}, uniforms, {
          iconsTexture: iconsTexture,
          iconsTextureDim: [iconsTexture.width, iconsTexture.height],
          sizeScale: sizeScale * (sizeUnits === 'pixels' ? viewport.metersPerPixel : 1),
          sizeMinPixels: sizeMinPixels,
          sizeMaxPixels: sizeMaxPixels,
          billboard: billboard,
          alphaCutoff: alphaCutoff
        })).draw();
      }
    }
  }, {
    key: "_getModel",
    value: function _getModel(gl) {
      var positions = [-1, -1, -1, 1, 1, 1, 1, -1];
      return new Model(gl, Object.assign({}, this.getShaders(), {
        id: this.props.id,
        geometry: new Geometry({
          drawMode: 6,
          attributes: {
            positions: {
              size: 2,
              value: new Float32Array(positions)
            }
          }
        }),
        isInstanced: true
      }));
    }
  }, {
    key: "_onUpdate",
    value: function _onUpdate() {
      this.setNeedsRedraw();
    }
  }, {
    key: "_onError",
    value: function _onError(evt) {
      var onIconError = this.getCurrentLayer().props.onIconError;

      if (onIconError) {
        onIconError(evt);
      } else {
        log.error(evt.error)();
      }
    }
  }, {
    key: "getInstanceOffset",
    value: function getInstanceOffset(icon) {
      var rect = this.state.iconManager.getIconMapping(icon);
      return [rect.width / 2 - rect.anchorX || 0, rect.height / 2 - rect.anchorY || 0];
    }
  }, {
    key: "getInstanceColorMode",
    value: function getInstanceColorMode(icon) {
      var mapping = this.state.iconManager.getIconMapping(icon);
      return mapping.mask ? 1 : 0;
    }
  }, {
    key: "getInstanceIconFrame",
    value: function getInstanceIconFrame(icon) {
      var rect = this.state.iconManager.getIconMapping(icon);
      return [rect.x || 0, rect.y || 0, rect.width || 0, rect.height || 0];
    }
  }, {
    key: "isLoaded",
    get: function get() {
      return _get(_getPrototypeOf(IconLayer.prototype), "isLoaded", this) && this.state.iconManager.isLoaded;
    }
  }]);

  return IconLayer;
}(Layer);
IconLayer.layerName = 'IconLayer';
IconLayer.defaultProps = defaultProps;

var fs$1 = "#define SHADER_NAME multi-icon-layer-fragment-shader\n\nprecision highp float;\n\nuniform float opacity;\nuniform sampler2D iconsTexture;\nuniform float buffer;\nuniform bool sdf;\nuniform float alphaCutoff;\nuniform bool shouldDrawBackground;\nuniform vec3 backgroundColor;\n\nvarying vec4 vColor;\nvarying vec2 vTextureCoords;\nvarying float vGamma;\nvarying vec2 uv;\n\nvoid main(void) {\n  geometry.uv = uv;\n\n  if (!picking_uActive) {\n    float alpha = texture2D(iconsTexture, vTextureCoords).a;\n    if (sdf) {\n      alpha = smoothstep(buffer - vGamma, buffer + vGamma, alpha);\n    }\n    float a = alpha * vColor.a;\n    \n    if (a < alphaCutoff) {\n      if (shouldDrawBackground) {\n        gl_FragColor = vec4(backgroundColor, vColor.a);\n      } else {\n        discard;\n      }\n    } else {\n      if (shouldDrawBackground) {\n        gl_FragColor = vec4(mix(backgroundColor, vColor.rgb, alpha), vColor.a * opacity);\n      } else {\n        gl_FragColor = vec4(vColor.rgb, a * opacity);\n      }\n      DECKGL_FILTER_COLOR(gl_FragColor, geometry);\n    }\n  } else {\n    DECKGL_FILTER_COLOR(gl_FragColor, geometry);\n  }\n}\n";

function _createSuper$1(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct$1(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _isNativeReflectConstruct$1() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }
var DEFAULT_GAMMA = 0.2;
var DEFAULT_BUFFER$1 = 192.0 / 256;
var EMPTY_ARRAY = [];
var defaultProps$1 = {
  backgroundColor: {
    type: 'color',
    value: null,
    optional: true
  },
  getIconOffsets: {
    type: 'accessor',
    value: function value(x) {
      return x.offsets;
    }
  },
  alphaCutoff: 0.001
};

var MultiIconLayer = function (_IconLayer) {
  _inherits(MultiIconLayer, _IconLayer);

  var _super = _createSuper$1(MultiIconLayer);

  function MultiIconLayer() {
    _classCallCheck(this, MultiIconLayer);

    return _super.apply(this, arguments);
  }

  _createClass(MultiIconLayer, [{
    key: "getShaders",
    value: function getShaders() {
      return Object.assign({}, _get(_getPrototypeOf(MultiIconLayer.prototype), "getShaders", this).call(this), {
        inject: {
          'vs:#decl': "\n  uniform float gamma;\n  varying float vGamma;\n",
          'vs:#main-end': "\n  vGamma = gamma / (sizeScale * iconSize.y);\n"
        },
        fs: fs$1
      });
    }
  }, {
    key: "initializeState",
    value: function initializeState() {
      var _this = this;

      _get(_getPrototypeOf(MultiIconLayer.prototype), "initializeState", this).call(this);

      var attributeManager = this.getAttributeManager();
      attributeManager.addInstanced({
        instanceOffsets: {
          size: 2,
          accessor: 'getIconOffsets'
        },
        instancePickingColors: {
          type: 5121,
          size: 3,
          accessor: function accessor(object, _ref) {
            var index = _ref.index,
                value = _ref.target;
            return _this.encodePickingColor(index, value);
          }
        }
      });
    }
  }, {
    key: "updateState",
    value: function updateState(updateParams) {
      _get(_getPrototypeOf(MultiIconLayer.prototype), "updateState", this).call(this, updateParams);

      var oldProps = updateParams.oldProps,
          props = updateParams.props;

      if (props.backgroundColor !== oldProps.backgroundColor) {
        var backgroundColor = Array.isArray(props.backgroundColor) ? props.backgroundColor.map(function (c) {
          return c / 255.0;
        }).slice(0, 3) : null;
        this.setState({
          backgroundColor: backgroundColor
        });
      }
    }
  }, {
    key: "draw",
    value: function draw(_ref2) {
      var uniforms = _ref2.uniforms;
      var sdf = this.props.sdf;
      var backgroundColor = this.state.backgroundColor;
      var shouldDrawBackground = Array.isArray(backgroundColor);

      _get(_getPrototypeOf(MultiIconLayer.prototype), "draw", this).call(this, {
        uniforms: Object.assign({}, uniforms, {
          buffer: DEFAULT_BUFFER$1,
          gamma: DEFAULT_GAMMA,
          sdf: Boolean(sdf),
          backgroundColor: backgroundColor || [0, 0, 0],
          shouldDrawBackground: shouldDrawBackground
        })
      });
    }
  }, {
    key: "getInstanceOffset",
    value: function getInstanceOffset(icons) {
      var _this2 = this;

      return icons ? Array.from(icons).map(function (icon) {
        return _get(_getPrototypeOf(MultiIconLayer.prototype), "getInstanceOffset", _this2).call(_this2, icon);
      }) : EMPTY_ARRAY;
    }
  }, {
    key: "getInstanceColorMode",
    value: function getInstanceColorMode(icons) {
      return 1;
    }
  }, {
    key: "getInstanceIconFrame",
    value: function getInstanceIconFrame(icons) {
      var _this3 = this;

      return icons ? Array.from(icons).map(function (icon) {
        return _get(_getPrototypeOf(MultiIconLayer.prototype), "getInstanceIconFrame", _this3).call(_this3, icon);
      }) : EMPTY_ARRAY;
    }
  }]);

  return MultiIconLayer;
}(IconLayer);
MultiIconLayer.layerName = 'MultiIconLayer';
MultiIconLayer.defaultProps = defaultProps$1;

var tinySdf = TinySDF;
var _default = TinySDF;

var INF = 1e20;

function TinySDF(fontSize, buffer, radius, cutoff, fontFamily, fontWeight) {
    this.fontSize = fontSize || 24;
    this.buffer = buffer === undefined ? 3 : buffer;
    this.cutoff = cutoff || 0.25;
    this.fontFamily = fontFamily || 'sans-serif';
    this.fontWeight = fontWeight || 'normal';
    this.radius = radius || 8;

    // For backwards compatibility, we honor the implicit contract that the
    // size of the returned bitmap will be fontSize + buffer * 2
    var size = this.size = this.fontSize + this.buffer * 2;
    // Glyphs may be slightly larger than their fontSize. The canvas already
    // has buffer space, but create extra buffer space in the output grid for the
    // "halo" to extend into (if metric extraction is enabled)
    var gridSize = size + this.buffer * 2;

    this.canvas = document.createElement('canvas');
    this.canvas.width = this.canvas.height = size;

    this.ctx = this.canvas.getContext('2d');
    this.ctx.font = this.fontWeight + ' ' + this.fontSize + 'px ' + this.fontFamily;
    this.ctx.textBaseline = 'middle';
    this.ctx.textAlign = 'left'; // Necessary so that RTL text doesn't have different alignment
    this.ctx.fillStyle = 'black';

    // temporary arrays for the distance transform
    this.gridOuter = new Float64Array(gridSize * gridSize);
    this.gridInner = new Float64Array(gridSize * gridSize);
    this.f = new Float64Array(gridSize);
    this.z = new Float64Array(gridSize + 1);
    this.v = new Uint16Array(gridSize);

    // hack around https://bugzilla.mozilla.org/show_bug.cgi?id=737852
    this.middle = Math.round((size / 2) * (navigator.userAgent.indexOf('Gecko/') >= 0 ? 1.2 : 1));
}

function prepareGrids(imgData, width, height, glyphWidth, glyphHeight, gridOuter, gridInner) {
    // Initialize grids outside the glyph range to alpha 0
    gridOuter.fill(INF, 0, width * height);
    gridInner.fill(0, 0, width * height);

    var offset = (width - glyphWidth) / 2; // This is zero if we're not extracting metrics

    for (var y = 0; y < glyphHeight; y++) {
        for (var x = 0; x < glyphWidth; x++) {
            var j = (y + offset) * width + x + offset;
            var a = imgData.data[4 * (y * glyphWidth + x) + 3] / 255; // alpha value
            if (a === 1) {
                gridOuter[j] = 0;
                gridInner[j] = INF;
            } else if (a === 0) {
                gridOuter[j] = INF;
                gridInner[j] = 0;
            } else {
                var b = Math.max(0, 0.5 - a);
                var c = Math.max(0, a - 0.5);
                gridOuter[j] = b * b;
                gridInner[j] = c * c;
            }
        }
    }
}

function extractAlpha(alphaChannel, width, height, gridOuter, gridInner, radius, cutoff) {
    for (var i = 0; i < width * height; i++) {
        var d = Math.sqrt(gridOuter[i]) - Math.sqrt(gridInner[i]);
        alphaChannel[i] = Math.round(255 - 255 * (d / radius + cutoff));
    }
}

TinySDF.prototype._draw = function (char, getMetrics) {
    var textMetrics = this.ctx.measureText(char);
    // Older browsers only expose the glyph width
    // This is enough for basic layout with all glyphs using the same fixed size
    var advance = textMetrics.width;

    var doubleBuffer = 2 * this.buffer;
    var width, glyphWidth, height, glyphHeight, top;

    var imgTop, imgLeft;
    // If the browser supports bounding box metrics, we can generate a smaller
    // SDF. This is a significant performance win.
    if (getMetrics && textMetrics.actualBoundingBoxLeft !== undefined) {
        // The integer/pixel part of the top alignment is encoded in metrics.top
        // The remainder is implicitly encoded in the rasterization
        top = Math.floor(textMetrics.actualBoundingBoxAscent) - this.middle;
        imgTop = Math.max(0, this.middle - Math.ceil(textMetrics.actualBoundingBoxAscent));
        imgLeft = this.buffer;

        // If the glyph overflows the canvas size, it will be clipped at the
        // bottom/right
        glyphWidth = Math.min(this.size,
            Math.ceil(textMetrics.actualBoundingBoxRight - textMetrics.actualBoundingBoxLeft));
        glyphHeight = Math.min(this.size - imgTop,
            Math.ceil(textMetrics.actualBoundingBoxAscent + textMetrics.actualBoundingBoxDescent));

        width = glyphWidth + doubleBuffer;
        height = glyphHeight + doubleBuffer;
    } else {
        width = glyphWidth = this.size;
        height = glyphHeight = this.size;
        top = 0;
        imgTop = imgLeft = 0;
    }

    var imgData;
    if (glyphWidth && glyphHeight) {
        this.ctx.clearRect(imgLeft, imgTop, glyphWidth, glyphHeight);
        this.ctx.fillText(char, this.buffer, this.middle);
        imgData = this.ctx.getImageData(imgLeft, imgTop, glyphWidth, glyphHeight);
    }

    var alphaChannel = new Uint8ClampedArray(width * height);

    prepareGrids(imgData, width, height, glyphWidth, glyphHeight, this.gridOuter, this.gridInner);

    edt(this.gridOuter, width, height, this.f, this.v, this.z);
    edt(this.gridInner, width, height, this.f, this.v, this.z);

    extractAlpha(alphaChannel, width, height, this.gridOuter, this.gridInner, this.radius, this.cutoff);

    return {
        data: alphaChannel,
        metrics: {
            width: glyphWidth,
            height: glyphHeight,
            sdfWidth: width,
            sdfHeight: height,
            top: top,
            left: 0,
            advance: advance,
            fontAscent: textMetrics.fontBoundingBoxAscent
        }
    };
};

TinySDF.prototype.draw = function (char) {
    return this._draw(char, false).data;
};

TinySDF.prototype.drawWithMetrics = function (char) {
    return this._draw(char, true);
};

// 2D Euclidean squared distance transform by Felzenszwalb & Huttenlocher https://cs.brown.edu/~pff/papers/dt-final.pdf
function edt(data, width, height, f, v, z) {
    for (var x = 0; x < width; x++) edt1d(data, x, width, height, f, v, z);
    for (var y = 0; y < height; y++) edt1d(data, y * width, 1, width, f, v, z);
}

// 1D squared distance transform
function edt1d(grid, offset, stride, length, f, v, z) {
    var q, k, s, r;
    v[0] = 0;
    z[0] = -INF;
    z[1] = INF;

    for (q = 0; q < length; q++) f[q] = grid[offset + q * stride];

    for (q = 1, k = 0, s = 0; q < length; q++) {
        do {
            r = v[k];
            s = (f[q] - f[r] + q * q - r * r) / (q - r) / 2;
        } while (s <= z[k] && --k > -1);

        k++;
        v[k] = q;
        z[k] = s;
        z[k + 1] = INF;
    }

    for (q = 0, k = 0; q < length; q++) {
        while (z[k + 1] < q) k++;
        r = v[k];
        grid[offset + q * stride] = f[r] + (q - r) * (q - r);
    }
}
tinySdf.default = _default;

function _createForOfIteratorHelper$1(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray$1(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray$1(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray$1(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray$1(o, minLen); }

function _arrayLikeToArray$1(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }
var MISSING_CHAR_WIDTH = 32;
var SINGLE_LINE = [];
function nextPowOfTwo$1(number) {
  return Math.pow(2, Math.ceil(Math.log2(number)));
}
function buildMapping$1(_ref) {
  var characterSet = _ref.characterSet,
      getFontWidth = _ref.getFontWidth,
      fontHeight = _ref.fontHeight,
      buffer = _ref.buffer,
      maxCanvasWidth = _ref.maxCanvasWidth,
      _ref$mapping = _ref.mapping,
      mapping = _ref$mapping === void 0 ? {} : _ref$mapping,
      _ref$xOffset = _ref.xOffset,
      xOffset = _ref$xOffset === void 0 ? 0 : _ref$xOffset,
      _ref$yOffset = _ref.yOffset,
      yOffset = _ref$yOffset === void 0 ? 0 : _ref$yOffset;
  var row = 0;
  var x = xOffset;
  var i = 0;

  var _iterator = _createForOfIteratorHelper$1(characterSet),
      _step;

  try {
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      var _char = _step.value;

      if (!mapping[_char]) {
        var width = getFontWidth(_char, i++);

        if (x + width + buffer * 2 > maxCanvasWidth) {
          x = 0;
          row++;
        }

        mapping[_char] = {
          x: x + buffer,
          y: yOffset + row * (fontHeight + buffer * 2) + buffer,
          width: width,
          height: fontHeight
        };
        x += width + buffer * 2;
      }
    }
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }

  var rowHeight = fontHeight + buffer * 2;
  return {
    mapping: mapping,
    xOffset: x,
    yOffset: yOffset + row * rowHeight,
    canvasHeight: nextPowOfTwo$1(yOffset + (row + 1) * rowHeight)
  };
}

function getTextWidth(text, startIndex, endIndex, mapping) {
  var width = 0;

  for (var i = startIndex; i < endIndex; i++) {
    var character = text[i];
    var frameWidth = null;
    var frame = mapping && mapping[character];

    if (frame) {
      frameWidth = frame.width;
    }

    width += frameWidth;
  }

  return width;
}

function breakAll(text, startIndex, endIndex, maxWidth, iconMapping, target) {
  var rowStartCharIndex = startIndex;
  var rowOffsetLeft = 0;

  for (var i = startIndex; i < endIndex; i++) {
    var textWidth = getTextWidth(text, i, i + 1, iconMapping);

    if (rowOffsetLeft + textWidth > maxWidth) {
      if (rowStartCharIndex < i) {
        target.push(i);
      }

      rowStartCharIndex = i;
      rowOffsetLeft = 0;
    }

    rowOffsetLeft += textWidth;
  }

  return rowOffsetLeft;
}

function breakWord(text, startIndex, endIndex, maxWidth, iconMapping, target) {
  var rowStartCharIndex = startIndex;
  var groupStartCharIndex = startIndex;
  var groupEndCharIndex = startIndex;
  var rowOffsetLeft = 0;

  for (var i = startIndex; i < endIndex; i++) {
    if (text[i] === ' ') {
      groupEndCharIndex = i + 1;
    } else if (text[i + 1] === ' ' || i + 1 === endIndex) {
      groupEndCharIndex = i + 1;
    }

    if (groupEndCharIndex > groupStartCharIndex) {
      var groupWidth = getTextWidth(text, groupStartCharIndex, groupEndCharIndex, iconMapping);

      if (rowOffsetLeft + groupWidth > maxWidth) {
        if (rowStartCharIndex < groupStartCharIndex) {
          target.push(groupStartCharIndex);
          rowStartCharIndex = groupStartCharIndex;
          rowOffsetLeft = 0;
        }

        if (groupWidth > maxWidth) {
          groupWidth = breakAll(text, groupStartCharIndex, groupEndCharIndex, maxWidth, iconMapping, target);
          rowStartCharIndex = target[target.length - 1];
        }
      }

      groupStartCharIndex = groupEndCharIndex;
      rowOffsetLeft += groupWidth;
    }
  }

  return rowOffsetLeft;
}

function autoWrapping(text, wordBreak, maxWidth, iconMapping) {
  var startIndex = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 0;
  var endIndex = arguments.length > 5 ? arguments[5] : undefined;

  if (endIndex === undefined) {
    endIndex = text.length;
  }

  var result = [];

  if (wordBreak === 'break-all') {
    breakAll(text, startIndex, endIndex, maxWidth, iconMapping, result);
  } else {
    breakWord(text, startIndex, endIndex, maxWidth, iconMapping, result);
  }

  return result;
}

function transformRow(line, startIndex, endIndex, iconMapping, leftOffsets, rowSize) {
  var x = 0;
  var rowHeight = 0;

  for (var i = startIndex; i < endIndex; i++) {
    var character = line[i];
    var frame = iconMapping[character];

    if (frame) {
      if (!rowHeight) {
        rowHeight = frame.height;
      }

      leftOffsets[i] = x + frame.width / 2;
      x += frame.width;
    } else {
      log.warn("Missing character: ".concat(character, " (").concat(character.codePointAt(0), ")"))();
      leftOffsets[i] = x;
      x += MISSING_CHAR_WIDTH;
    }
  }

  rowSize[0] = x;
  rowSize[1] = rowHeight;
}

function transformParagraph(paragraph, lineHeight, wordBreak, maxWidth, iconMapping) {
  paragraph = Array.from(paragraph);
  var numCharacters = paragraph.length;
  var x = new Array(numCharacters);
  var y = new Array(numCharacters);
  var rowWidth = new Array(numCharacters);
  var autoWrappingEnabled = (wordBreak === 'break-word' || wordBreak === 'break-all') && isFinite(maxWidth) && maxWidth > 0;
  var size = [0, 0];
  var rowSize = [];
  var rowOffsetTop = 0;
  var lineStartIndex = 0;
  var lineEndIndex = 0;

  for (var i = 0; i <= numCharacters; i++) {
    var _char2 = paragraph[i];

    if (_char2 === '\n' || i === numCharacters) {
      lineEndIndex = i;
    }

    if (lineEndIndex > lineStartIndex) {
      var rows = autoWrappingEnabled ? autoWrapping(paragraph, wordBreak, maxWidth, iconMapping, lineStartIndex, lineEndIndex) : SINGLE_LINE;

      for (var rowIndex = 0; rowIndex <= rows.length; rowIndex++) {
        var rowStart = rowIndex === 0 ? lineStartIndex : rows[rowIndex - 1];
        var rowEnd = rowIndex < rows.length ? rows[rowIndex] : lineEndIndex;
        transformRow(paragraph, rowStart, rowEnd, iconMapping, x, rowSize);

        for (var j = rowStart; j < rowEnd; j++) {
          y[j] = rowOffsetTop + rowSize[1] / 2;
          rowWidth[j] = rowSize[0];
        }

        rowOffsetTop = rowOffsetTop + rowSize[1] * lineHeight;
        size[0] = autoWrappingEnabled ? maxWidth : Math.max(size[0], rowSize[0]);
      }

      lineStartIndex = lineEndIndex;
    }

    if (_char2 === '\n') {
      x[lineStartIndex] = 0;
      y[lineStartIndex] = 0;
      rowWidth[lineStartIndex] = 0;
      lineStartIndex++;
    }
  }

  size[1] = rowOffsetTop;
  return {
    x: x,
    y: y,
    rowWidth: rowWidth,
    size: size
  };
}
function getTextFromBuffer(_ref2) {
  var value = _ref2.value,
      length = _ref2.length,
      stride = _ref2.stride,
      offset = _ref2.offset,
      startIndices = _ref2.startIndices;
  var bytesPerElement = value.BYTES_PER_ELEMENT;
  var elementStride = stride ? stride / bytesPerElement : 1;
  var elementOffset = offset ? offset / bytesPerElement : 0;
  var characterCount = startIndices[length] || Math.floor((value.length - elementOffset - bytesPerElement) / elementStride) + 1;
  var texts = new Array(length);
  var codes = value;

  if (elementStride > 1 || elementOffset > 0) {
    codes = new value.constructor(characterCount);

    for (var i = 0; i < characterCount; i++) {
      codes[i] = value[i * elementStride + elementOffset];
    }
  }

  for (var index = 0; index < length; index++) {
    var startIndex = startIndices[index];
    var endIndex = startIndices[index + 1] || characterCount;
    texts[index] = String.fromCodePoint.apply(null, codes.subarray(startIndex, endIndex));
  }

  return {
    texts: texts,
    characterCount: characterCount
  };
}

var LRUCache = function () {
  function LRUCache() {
    var limit = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 5;

    _classCallCheck(this, LRUCache);

    this.limit = limit;
    this.clear();
  }

  _createClass(LRUCache, [{
    key: "clear",
    value: function clear() {
      this._cache = {};
      this._order = [];
    }
  }, {
    key: "get",
    value: function get(key) {
      var value = this._cache[key];

      if (value) {
        this._deleteOrder(key);

        this._appendOrder(key);
      }

      return value;
    }
  }, {
    key: "set",
    value: function set(key, value) {
      if (!this._cache[key]) {
        if (Object.keys(this._cache).length === this.limit) {
          this["delete"](this._order[0]);
        }

        this._cache[key] = value;

        this._appendOrder(key);
      } else {
        this["delete"](key);
        this._cache[key] = value;

        this._appendOrder(key);
      }
    }
  }, {
    key: "delete",
    value: function _delete(key) {
      var value = this._cache[key];

      if (value) {
        this._deleteCache(key);

        this._deleteOrder(key);
      }
    }
  }, {
    key: "_deleteCache",
    value: function _deleteCache(key) {
      delete this._cache[key];
    }
  }, {
    key: "_deleteOrder",
    value: function _deleteOrder(key) {
      var index = this._order.findIndex(function (o) {
        return o === key;
      });

      if (index >= 0) {
        this._order.splice(index, 1);
      }
    }
  }, {
    key: "_appendOrder",
    value: function _appendOrder(key) {
      this._order.push(key);
    }
  }]);

  return LRUCache;
}();

function _createForOfIteratorHelper$2(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray$2(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray$2(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray$2(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray$2(o, minLen); }

function _arrayLikeToArray$2(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function getDefaultCharacterSet() {
  var charSet = [];

  for (var i = 32; i < 128; i++) {
    charSet.push(String.fromCharCode(i));
  }

  return charSet;
}

var DEFAULT_CHAR_SET = getDefaultCharacterSet();
var DEFAULT_FONT_FAMILY = 'Monaco, monospace';
var DEFAULT_FONT_WEIGHT = 'normal';
var DEFAULT_FONT_SIZE = 64;
var DEFAULT_BUFFER$2 = 2;
var DEFAULT_CUTOFF = 0.25;
var DEFAULT_RADIUS = 3;
var MAX_CANVAS_WIDTH = 1024;
var BASELINE_SCALE = 0.9;
var HEIGHT_SCALE = 1.2;
var CACHE_LIMIT = 3;
var cache = new LRUCache(CACHE_LIMIT);
var VALID_PROPS = ['fontFamily', 'fontWeight', 'characterSet', 'fontSize', 'sdf', 'buffer', 'cutoff', 'radius'];

function getNewChars(key, characterSet) {
  var cachedFontAtlas = cache.get(key);

  if (!cachedFontAtlas) {
    return characterSet;
  }

  var newChars = [];
  var cachedMapping = cachedFontAtlas.mapping;
  var cachedCharSet = Object.keys(cachedMapping);
  cachedCharSet = new Set(cachedCharSet);
  var charSet = characterSet;

  if (charSet instanceof Array) {
    charSet = new Set(charSet);
  }

  charSet.forEach(function (_char) {
    if (!cachedCharSet.has(_char)) {
      newChars.push(_char);
    }
  });
  return newChars;
}

function populateAlphaChannel(alphaChannel, imageData) {
  for (var i = 0; i < alphaChannel.length; i++) {
    imageData.data[4 * i + 3] = alphaChannel[i];
  }
}

function setTextStyle(ctx, fontFamily, fontSize, fontWeight) {
  ctx.font = "".concat(fontWeight, " ").concat(fontSize, "px ").concat(fontFamily);
  ctx.fillStyle = '#000';
  ctx.textBaseline = 'baseline';
  ctx.textAlign = 'left';
}

var FontAtlasManager = function () {
  function FontAtlasManager() {
    _classCallCheck(this, FontAtlasManager);

    this.props = {
      fontFamily: DEFAULT_FONT_FAMILY,
      fontWeight: DEFAULT_FONT_WEIGHT,
      characterSet: DEFAULT_CHAR_SET,
      fontSize: DEFAULT_FONT_SIZE,
      buffer: DEFAULT_BUFFER$2,
      sdf: false,
      cutoff: DEFAULT_CUTOFF,
      radius: DEFAULT_RADIUS
    };
    this._key = null;
    this._atlas = null;
  }

  _createClass(FontAtlasManager, [{
    key: "setProps",
    value: function setProps() {
      var _this = this;

      var props = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      VALID_PROPS.forEach(function (prop) {
        if (prop in props) {
          _this.props[prop] = props[prop];
        }
      });
      var oldKey = this._key;
      this._key = this._getKey();
      var charSet = getNewChars(this._key, this.props.characterSet);
      var cachedFontAtlas = cache.get(this._key);

      if (cachedFontAtlas && charSet.length === 0) {
        if (this._key !== oldKey) {
          this._atlas = cachedFontAtlas;
        }

        return;
      }

      var fontAtlas = this._generateFontAtlas(this._key, charSet, cachedFontAtlas);

      this._atlas = fontAtlas;
      cache.set(this._key, fontAtlas);
    }
  }, {
    key: "_generateFontAtlas",
    value: function _generateFontAtlas(key, characterSet, cachedFontAtlas) {
      var _this$props = this.props,
          fontFamily = _this$props.fontFamily,
          fontWeight = _this$props.fontWeight,
          fontSize = _this$props.fontSize,
          buffer = _this$props.buffer,
          sdf = _this$props.sdf,
          radius = _this$props.radius,
          cutoff = _this$props.cutoff;
      var canvas = cachedFontAtlas && cachedFontAtlas.data;

      if (!canvas) {
        canvas = document.createElement('canvas');
        canvas.width = MAX_CANVAS_WIDTH;
      }

      var ctx = canvas.getContext('2d');
      setTextStyle(ctx, fontFamily, fontSize, fontWeight);

      var _buildMapping = buildMapping$1(Object.assign({
        getFontWidth: function getFontWidth(_char2) {
          return ctx.measureText(_char2).width;
        },
        fontHeight: fontSize * HEIGHT_SCALE,
        buffer: buffer,
        characterSet: characterSet,
        maxCanvasWidth: MAX_CANVAS_WIDTH
      }, cachedFontAtlas && {
        mapping: cachedFontAtlas.mapping,
        xOffset: cachedFontAtlas.xOffset,
        yOffset: cachedFontAtlas.yOffset
      })),
          mapping = _buildMapping.mapping,
          canvasHeight = _buildMapping.canvasHeight,
          xOffset = _buildMapping.xOffset,
          yOffset = _buildMapping.yOffset;

      if (canvas.height !== canvasHeight) {
        var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        canvas.height = canvasHeight;
        ctx.putImageData(imageData, 0, 0);
      }

      setTextStyle(ctx, fontFamily, fontSize, fontWeight);

      if (sdf) {
        var tinySDF = new tinySdf(fontSize, buffer, radius, cutoff, fontFamily, fontWeight);

        var _imageData = ctx.getImageData(0, 0, tinySDF.size, tinySDF.size);

        var _iterator = _createForOfIteratorHelper$2(characterSet),
            _step;

        try {
          for (_iterator.s(); !(_step = _iterator.n()).done;) {
            var _char3 = _step.value;
            populateAlphaChannel(tinySDF.draw(_char3), _imageData);
            ctx.putImageData(_imageData, mapping[_char3].x - buffer, mapping[_char3].y - buffer);
          }
        } catch (err) {
          _iterator.e(err);
        } finally {
          _iterator.f();
        }
      } else {
        var _iterator2 = _createForOfIteratorHelper$2(characterSet),
            _step2;

        try {
          for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
            var _char4 = _step2.value;
            ctx.fillText(_char4, mapping[_char4].x, mapping[_char4].y + fontSize * BASELINE_SCALE);
          }
        } catch (err) {
          _iterator2.e(err);
        } finally {
          _iterator2.f();
        }
      }

      return {
        xOffset: xOffset,
        yOffset: yOffset,
        mapping: mapping,
        data: canvas,
        width: canvas.width,
        height: canvas.height
      };
    }
  }, {
    key: "_getKey",
    value: function _getKey() {
      var _this$props2 = this.props,
          fontFamily = _this$props2.fontFamily,
          fontWeight = _this$props2.fontWeight,
          fontSize = _this$props2.fontSize,
          buffer = _this$props2.buffer,
          sdf = _this$props2.sdf,
          radius = _this$props2.radius,
          cutoff = _this$props2.cutoff;

      if (sdf) {
        return "".concat(fontFamily, " ").concat(fontWeight, " ").concat(fontSize, " ").concat(buffer, " ").concat(radius, " ").concat(cutoff);
      }

      return "".concat(fontFamily, " ").concat(fontWeight, " ").concat(fontSize, " ").concat(buffer);
    }
  }, {
    key: "texture",
    get: function get() {
      return this._atlas;
    }
  }, {
    key: "mapping",
    get: function get() {
      return this._atlas && this._atlas.mapping;
    }
  }, {
    key: "scale",
    get: function get() {
      return HEIGHT_SCALE;
    }
  }]);

  return FontAtlasManager;
}();

function _createForOfIteratorHelper$3(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray$3(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray$3(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray$3(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray$3(o, minLen); }

function _arrayLikeToArray$3(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function ownKeys$1(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread$1(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys$1(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys$1(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _createSuper$2(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct$2(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _isNativeReflectConstruct$2() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }
var DEFAULT_FONT_SETTINGS = {
  fontSize: DEFAULT_FONT_SIZE,
  buffer: DEFAULT_BUFFER$2,
  sdf: false,
  radius: DEFAULT_RADIUS,
  cutoff: DEFAULT_CUTOFF
};
var TEXT_ANCHOR = {
  start: 1,
  middle: 0,
  end: -1
};
var ALIGNMENT_BASELINE = {
  top: 1,
  center: 0,
  bottom: -1
};
var DEFAULT_COLOR$1 = [0, 0, 0, 255];
var DEFAULT_LINE_HEIGHT = 1.0;
var FONT_SETTINGS_PROPS = ['fontSize', 'buffer', 'sdf', 'radius', 'cutoff'];
var defaultProps$2 = {
  billboard: true,
  sizeScale: 1,
  sizeUnits: 'pixels',
  sizeMinPixels: 0,
  sizeMaxPixels: Number.MAX_SAFE_INTEGER,
  backgroundColor: {
    type: 'color',
    value: null,
    optional: true
  },
  characterSet: DEFAULT_CHAR_SET,
  fontFamily: DEFAULT_FONT_FAMILY,
  fontWeight: DEFAULT_FONT_WEIGHT,
  lineHeight: DEFAULT_LINE_HEIGHT,
  fontSettings: {},
  wordBreak: 'break-word',
  maxWidth: {
    type: 'number',
    value: -1
  },
  getText: {
    type: 'accessor',
    value: function value(x) {
      return x.text;
    }
  },
  getPosition: {
    type: 'accessor',
    value: function value(x) {
      return x.position;
    }
  },
  getColor: {
    type: 'accessor',
    value: DEFAULT_COLOR$1
  },
  getSize: {
    type: 'accessor',
    value: 32
  },
  getAngle: {
    type: 'accessor',
    value: 0
  },
  getTextAnchor: {
    type: 'accessor',
    value: 'middle'
  },
  getAlignmentBaseline: {
    type: 'accessor',
    value: 'center'
  },
  getPixelOffset: {
    type: 'accessor',
    value: [0, 0]
  }
};

var TextLayer = function (_CompositeLayer) {
  _inherits(TextLayer, _CompositeLayer);

  var _super = _createSuper$2(TextLayer);

  function TextLayer() {
    _classCallCheck(this, TextLayer);

    return _super.apply(this, arguments);
  }

  _createClass(TextLayer, [{
    key: "initializeState",
    value: function initializeState() {
      this.state = {
        styleVersion: 0,
        fontAtlasManager: new FontAtlasManager()
      };
    }
  }, {
    key: "updateState",
    value: function updateState(_ref) {
      var props = _ref.props,
          oldProps = _ref.oldProps,
          changeFlags = _ref.changeFlags;

      var fontChanged = this._fontChanged(oldProps, props);

      if (fontChanged) {
        this._updateFontAtlas(oldProps, props);
      }

      var styleChanged = fontChanged || props.lineHeight !== oldProps.lineHeight || props.wordBreak !== oldProps.wordBreak || props.maxWidth !== oldProps.maxWidth;
      var textChanged = changeFlags.dataChanged || changeFlags.updateTriggersChanged && (changeFlags.updateTriggersChanged.all || changeFlags.updateTriggersChanged.getText);

      if (textChanged) {
        this._updateText();
      }

      if (styleChanged) {
        this.setState({
          styleVersion: this.state.styleVersion + 1
        });
      }
    }
  }, {
    key: "getPickingInfo",
    value: function getPickingInfo(_ref2) {
      var info = _ref2.info;
      return Object.assign(info, {
        object: info.index >= 0 ? this.props.data[info.index] : null
      });
    }
  }, {
    key: "_updateFontAtlas",
    value: function _updateFontAtlas(oldProps, props) {
      var characterSet = props.characterSet,
          fontSettings = props.fontSettings,
          fontFamily = props.fontFamily,
          fontWeight = props.fontWeight;
      var fontAtlasManager = this.state.fontAtlasManager;
      fontAtlasManager.setProps(Object.assign({}, DEFAULT_FONT_SETTINGS, fontSettings, {
        characterSet: characterSet,
        fontFamily: fontFamily,
        fontWeight: fontWeight
      }));
      this.setNeedsRedraw(true);
    }
  }, {
    key: "_fontChanged",
    value: function _fontChanged(oldProps, props) {
      if (oldProps.fontFamily !== props.fontFamily || oldProps.characterSet !== props.characterSet || oldProps.fontWeight !== props.fontWeight) {
        return true;
      }

      if (oldProps.fontSettings === props.fontSettings) {
        return false;
      }

      var oldFontSettings = oldProps.fontSettings || {};
      var fontSettings = props.fontSettings || {};
      return FONT_SETTINGS_PROPS.some(function (prop) {
        return oldFontSettings[prop] !== fontSettings[prop];
      });
    }
  }, {
    key: "_updateText",
    value: function _updateText() {
      var data = this.props.data;
      var textBuffer = data.attributes && data.attributes.getText;
      var getText = this.props.getText;
      var startIndices = data.startIndices;
      var numInstances;

      if (textBuffer && startIndices) {
        var _getTextFromBuffer = getTextFromBuffer(_objectSpread$1(_objectSpread$1({}, ArrayBuffer.isView(textBuffer) ? {
          value: textBuffer
        } : textBuffer), {}, {
          length: data.length,
          startIndices: startIndices
        })),
            texts = _getTextFromBuffer.texts,
            characterCount = _getTextFromBuffer.characterCount;

        numInstances = characterCount;

        getText = function getText(_, _ref3) {
          var index = _ref3.index;
          return texts[index];
        };
      } else {
        var _createIterable = createIterable(data),
            iterable = _createIterable.iterable,
            objectInfo = _createIterable.objectInfo;

        startIndices = [0];
        numInstances = 0;

        var _iterator = _createForOfIteratorHelper$3(iterable),
            _step;

        try {
          for (_iterator.s(); !(_step = _iterator.n()).done;) {
            var object = _step.value;
            objectInfo.index++;
            var text = getText(object, objectInfo) || '';
            numInstances += Array.from(text).length;
            startIndices.push(numInstances);
          }
        } catch (err) {
          _iterator.e(err);
        } finally {
          _iterator.f();
        }
      }

      this.setState({
        getText: getText,
        startIndices: startIndices,
        numInstances: numInstances
      });
    }
  }, {
    key: "getIconOffsets",
    value: function getIconOffsets(object, objectInfo) {
      var iconMapping = this.state.fontAtlasManager.mapping;
      var getText = this.state.getText;
      var _this$props = this.props,
          wordBreak = _this$props.wordBreak,
          maxWidth = _this$props.maxWidth,
          lineHeight = _this$props.lineHeight,
          getTextAnchor = _this$props.getTextAnchor,
          getAlignmentBaseline = _this$props.getAlignmentBaseline;
      var paragraph = getText(object, objectInfo) || '';

      var _transformParagraph = transformParagraph(paragraph, lineHeight, wordBreak, maxWidth, iconMapping),
          x = _transformParagraph.x,
          y = _transformParagraph.y,
          rowWidth = _transformParagraph.rowWidth,
          _transformParagraph$s = _slicedToArray(_transformParagraph.size, 2),
          width = _transformParagraph$s[0],
          height = _transformParagraph$s[1];

      var anchorX = TEXT_ANCHOR[typeof getTextAnchor === 'function' ? getTextAnchor(object, objectInfo) : getTextAnchor];
      var anchorY = ALIGNMENT_BASELINE[typeof getAlignmentBaseline === 'function' ? getAlignmentBaseline(object, objectInfo) : getAlignmentBaseline];
      var numCharacters = x.length;
      var offsets = new Array(numCharacters * 2);
      var index = 0;

      for (var i = 0; i < numCharacters; i++) {
        var rowOffset = (1 - anchorX) * (width - rowWidth[i]) / 2;
        offsets[index++] = (anchorX - 1) * width / 2 + rowOffset + x[i];
        offsets[index++] = (anchorY - 1) * height / 2 + y[i];
      }

      return offsets;
    }
  }, {
    key: "renderLayers",
    value: function renderLayers() {
      var _this$state = this.state,
          startIndices = _this$state.startIndices,
          numInstances = _this$state.numInstances,
          getText = _this$state.getText,
          _this$state$fontAtlas = _this$state.fontAtlasManager,
          scale = _this$state$fontAtlas.scale,
          texture = _this$state$fontAtlas.texture,
          mapping = _this$state$fontAtlas.mapping,
          styleVersion = _this$state.styleVersion;
      var _this$props2 = this.props,
          data = _this$props2.data,
          _dataDiff = _this$props2._dataDiff,
          backgroundColor = _this$props2.backgroundColor,
          getPosition = _this$props2.getPosition,
          getColor = _this$props2.getColor,
          getSize = _this$props2.getSize,
          getAngle = _this$props2.getAngle,
          getPixelOffset = _this$props2.getPixelOffset,
          billboard = _this$props2.billboard,
          fontSettings = _this$props2.fontSettings,
          sizeScale = _this$props2.sizeScale,
          sizeUnits = _this$props2.sizeUnits,
          sizeMinPixels = _this$props2.sizeMinPixels,
          sizeMaxPixels = _this$props2.sizeMaxPixels,
          transitions = _this$props2.transitions,
          updateTriggers = _this$props2.updateTriggers;
      var getIconOffsets = this.getIconOffsets.bind(this);
      var SubLayerClass = this.getSubLayerClass('characters', MultiIconLayer);
      return new SubLayerClass({
        sdf: fontSettings.sdf,
        iconAtlas: texture,
        iconMapping: mapping,
        backgroundColor: backgroundColor,
        getPosition: getPosition,
        getColor: getColor,
        getSize: getSize,
        getAngle: getAngle,
        getPixelOffset: getPixelOffset,
        billboard: billboard,
        sizeScale: sizeScale * scale,
        sizeUnits: sizeUnits,
        sizeMinPixels: sizeMinPixels * scale,
        sizeMaxPixels: sizeMaxPixels * scale,
        transitions: transitions && {
          getPosition: transitions.getPosition,
          getAngle: transitions.getAngle,
          getColor: transitions.getColor,
          getSize: transitions.getSize,
          getPixelOffset: transitions.getPixelOffset
        }
      }, this.getSubLayerProps({
        id: 'characters',
        updateTriggers: {
          getIcon: updateTriggers.getText,
          getPosition: updateTriggers.getPosition,
          getAngle: updateTriggers.getAngle,
          getColor: updateTriggers.getColor,
          getSize: updateTriggers.getSize,
          getPixelOffset: updateTriggers.getPixelOffset,
          getIconOffsets: {
            getText: updateTriggers.getText,
            getTextAnchor: updateTriggers.getTextAnchor,
            getAlignmentBaseline: updateTriggers.getAlignmentBaseline,
            styleVersion: styleVersion
          }
        }
      }), {
        data: data,
        _dataDiff: _dataDiff,
        startIndices: startIndices,
        numInstances: numInstances,
        getIconOffsets: getIconOffsets,
        getIcon: getText
      });
    }
  }]);

  return TextLayer;
}(CompositeLayer);
TextLayer.layerName = 'TextLayer';
TextLayer.defaultProps = defaultProps$2;

export { TextLayer };
