import { r as _objectSpread$1, s as assert, u as uid, o as assert$1, w as getAccessorFromBuffer, x as createIterable, B as Buffer, y as defaultTypedArrayManager, p as equals$1, _ as _inherits, a as _getPrototypeOf, b as _possibleConstructorReturn, k as _get, C as COORDINATE_SYSTEM, z as hasFeatures, A as Model, L as Layer, F as FEATURES } from './layer-6e52c28c.js';
import { _ as _defineProperty } from './defineProperty-1b0b77a2.js';
import { _ as _classCallCheck } from './classCallCheck-4eda545c.js';
import { _ as _createClass } from './assertThisInitialized-87ceda02.js';
import { p as project } from './project-9e8cb528.js';

var lightingShader = "#if (defined(SHADER_TYPE_FRAGMENT) && defined(LIGHTING_FRAGMENT)) || (defined(SHADER_TYPE_VERTEX) && defined(LIGHTING_VERTEX))\n\nstruct AmbientLight {\n vec3 color;\n};\n\nstruct PointLight {\n vec3 color;\n vec3 position;\n vec3 attenuation;\n};\n\nstruct DirectionalLight {\n  vec3 color;\n  vec3 direction;\n};\n\nuniform AmbientLight lighting_uAmbientLight;\nuniform PointLight lighting_uPointLight[MAX_LIGHTS];\nuniform DirectionalLight lighting_uDirectionalLight[MAX_LIGHTS];\nuniform int lighting_uPointLightCount;\nuniform int lighting_uDirectionalLightCount;\n\nuniform bool lighting_uEnabled;\n\nfloat getPointLightAttenuation(PointLight pointLight, float distance) {\n  return pointLight.attenuation.x\n       + pointLight.attenuation.y * distance\n       + pointLight.attenuation.z * distance * distance;\n}\n\n#endif\n";

var lights = {
  name: 'lights',
  vs: lightingShader,
  fs: lightingShader,
  getUniforms: getUniforms,
  defines: {
    MAX_LIGHTS: 3
  }
};
var INITIAL_MODULE_OPTIONS = {};

function convertColor() {
  var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
      _ref$color = _ref.color,
      color = _ref$color === void 0 ? [0, 0, 0] : _ref$color,
      _ref$intensity = _ref.intensity,
      intensity = _ref$intensity === void 0 ? 1.0 : _ref$intensity;

  return color.map(function (component) {
    return component * intensity / 255.0;
  });
}

function getLightSourceUniforms(_ref2) {
  var ambientLight = _ref2.ambientLight,
      _ref2$pointLights = _ref2.pointLights,
      pointLights = _ref2$pointLights === void 0 ? [] : _ref2$pointLights,
      _ref2$directionalLigh = _ref2.directionalLights,
      directionalLights = _ref2$directionalLigh === void 0 ? [] : _ref2$directionalLigh;
  var lightSourceUniforms = {};

  if (ambientLight) {
    lightSourceUniforms['lighting_uAmbientLight.color'] = convertColor(ambientLight);
  } else {
    lightSourceUniforms['lighting_uAmbientLight.color'] = [0, 0, 0];
  }

  pointLights.forEach(function (pointLight, index) {
    lightSourceUniforms["lighting_uPointLight[".concat(index, "].color")] = convertColor(pointLight);
    lightSourceUniforms["lighting_uPointLight[".concat(index, "].position")] = pointLight.position;
    lightSourceUniforms["lighting_uPointLight[".concat(index, "].attenuation")] = pointLight.attenuation || [1, 0, 0];
  });
  lightSourceUniforms.lighting_uPointLightCount = pointLights.length;
  directionalLights.forEach(function (directionalLight, index) {
    lightSourceUniforms["lighting_uDirectionalLight[".concat(index, "].color")] = convertColor(directionalLight);
    lightSourceUniforms["lighting_uDirectionalLight[".concat(index, "].direction")] = directionalLight.direction;
  });
  lightSourceUniforms.lighting_uDirectionalLightCount = directionalLights.length;
  return lightSourceUniforms;
}

function getUniforms() {
  var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : INITIAL_MODULE_OPTIONS;

  if ('lightSources' in opts) {
    var _ref3 = opts.lightSources || {},
        ambientLight = _ref3.ambientLight,
        pointLights = _ref3.pointLights,
        directionalLights = _ref3.directionalLights;

    var hasLights = ambientLight || pointLights && pointLights.length > 0 || directionalLights && directionalLights.length > 0;

    if (!hasLights) {
      return {
        lighting_uEnabled: false
      };
    }

    return Object.assign({}, getLightSourceUniforms({
      ambientLight: ambientLight,
      pointLights: pointLights,
      directionalLights: directionalLights
    }), {
      lighting_uEnabled: true
    });
  }

  if ('lights' in opts) {
    var lightSources = {
      pointLights: [],
      directionalLights: []
    };
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = (opts.lights || [])[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var light = _step.value;

        switch (light.type) {
          case 'ambient':
            lightSources.ambientLight = light;
            break;

          case 'directional':
            lightSources.directionalLights.push(light);
            break;

          case 'point':
            lightSources.pointLights.push(light);
            break;

          default:
        }
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator["return"] != null) {
          _iterator["return"]();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }

    return getUniforms({
      lightSources: lightSources
    });
  }

  return {};
}

var DEFAULT_HIGHLIGHT_COLOR = new Uint8Array([0, 255, 255, 255]);
var DEFAULT_MODULE_OPTIONS = {
  pickingSelectedColor: null,
  pickingHighlightColor: DEFAULT_HIGHLIGHT_COLOR,
  pickingActive: false,
  pickingAttribute: false
};

function getUniforms$1() {
  var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : DEFAULT_MODULE_OPTIONS;
  var uniforms = {};

  if (opts.pickingSelectedColor !== undefined) {
    if (!opts.pickingSelectedColor) {
      uniforms.picking_uSelectedColorValid = 0;
    } else {
      var selectedColor = opts.pickingSelectedColor.slice(0, 3);
      uniforms.picking_uSelectedColorValid = 1;
      uniforms.picking_uSelectedColor = selectedColor;
    }
  }

  if (opts.pickingHighlightColor) {
    var color = Array.from(opts.pickingHighlightColor, function (x) {
      return x / 255;
    });

    if (!Number.isFinite(color[3])) {
      color[3] = 1;
    }

    uniforms.picking_uHighlightColor = color;
  }

  if (opts.pickingActive !== undefined) {
    uniforms.picking_uActive = Boolean(opts.pickingActive);
    uniforms.picking_uAttribute = Boolean(opts.pickingAttribute);
  }

  return uniforms;
}

var vs = "uniform bool picking_uActive;\nuniform bool picking_uAttribute;\nuniform vec3 picking_uSelectedColor;\nuniform bool picking_uSelectedColorValid;\n\nout vec4 picking_vRGBcolor_Avalid;\n\nconst float COLOR_SCALE = 1. / 255.;\n\nbool picking_isColorValid(vec3 color) {\n  return dot(color, vec3(1.0)) > 0.001;\n}\n\nbool isVertexPicked(vec3 vertexColor) {\n  return\n    picking_uSelectedColorValid &&\n    !picking_isColorValid(abs(vertexColor - picking_uSelectedColor));\n}\n\nvoid picking_setPickingColor(vec3 pickingColor) {\n  if (picking_uActive) {\n    picking_vRGBcolor_Avalid.a = float(picking_isColorValid(pickingColor));\n\n    if (!picking_uAttribute) {\n      picking_vRGBcolor_Avalid.rgb = pickingColor * COLOR_SCALE;\n    }\n  } else {\n    picking_vRGBcolor_Avalid.a = float(isVertexPicked(pickingColor));\n  }\n}\n\nvoid picking_setPickingAttribute(float value) {\n  if (picking_uAttribute) {\n    picking_vRGBcolor_Avalid.r = value;\n  }\n}\nvoid picking_setPickingAttribute(vec2 value) {\n  if (picking_uAttribute) {\n    picking_vRGBcolor_Avalid.rg = value;\n  }\n}\nvoid picking_setPickingAttribute(vec3 value) {\n  if (picking_uAttribute) {\n    picking_vRGBcolor_Avalid.rgb = value;\n  }\n}\n";
var fs = "uniform bool picking_uActive;\nuniform vec3 picking_uSelectedColor;\nuniform vec4 picking_uHighlightColor;\n\nin vec4 picking_vRGBcolor_Avalid;\nvec4 picking_filterHighlightColor(vec4 color) {\n  if (picking_uActive) {\n    return color;\n  }\n  bool selected = bool(picking_vRGBcolor_Avalid.a);\n\n  if (selected) {\n    float highLightAlpha = picking_uHighlightColor.a;\n    float blendedAlpha = highLightAlpha + color.a * (1.0 - highLightAlpha);\n    float highLightRatio = highLightAlpha / blendedAlpha;\n\n    vec3 blendedRGB = mix(color.rgb, picking_uHighlightColor.rgb, highLightRatio);\n    return vec4(blendedRGB, blendedAlpha);\n  } else {\n    return color;\n  }\n}\nvec4 picking_filterPickingColor(vec4 color) {\n  if (picking_uActive) {\n    if (picking_vRGBcolor_Avalid.a == 0.0) {\n      discard;\n    }\n    return picking_vRGBcolor_Avalid;\n  }\n  return color;\n}\nvec4 picking_filterColor(vec4 color) {\n  vec4 highightColor = picking_filterHighlightColor(color);\n  return picking_filterPickingColor(highightColor);\n}\n\n";
var picking = {
  name: 'picking',
  vs: vs,
  fs: fs,
  getUniforms: getUniforms$1
};

var lightingShader$1 = "\nuniform float lighting_uAmbient;\nuniform float lighting_uDiffuse;\nuniform float lighting_uShininess;\nuniform vec3  lighting_uSpecularColor;\n\nvec3 lighting_getLightColor(vec3 surfaceColor, vec3 light_direction, vec3 view_direction, vec3 normal_worldspace, vec3 color) {\n    vec3 halfway_direction = normalize(light_direction + view_direction);\n    float lambertian = dot(light_direction, normal_worldspace);\n    float specular = 0.0;\n    if (lambertian > 0.0) {\n      float specular_angle = max(dot(normal_worldspace, halfway_direction), 0.0);\n      specular = pow(specular_angle, lighting_uShininess);\n    }\n    lambertian = max(lambertian, 0.0);\n    return (lambertian * lighting_uDiffuse * surfaceColor + specular * lighting_uSpecularColor) * color;\n}\n\nvec3 lighting_getLightColor(vec3 surfaceColor, vec3 cameraPosition, vec3 position_worldspace, vec3 normal_worldspace) {\n  vec3 lightColor = surfaceColor;\n\n  if (lighting_uEnabled) {\n    vec3 view_direction = normalize(cameraPosition - position_worldspace);\n    lightColor = lighting_uAmbient * surfaceColor * lighting_uAmbientLight.color;\n\n    for (int i = 0; i < MAX_LIGHTS; i++) {\n      if (i >= lighting_uPointLightCount) {\n        break;\n      }\n      PointLight pointLight = lighting_uPointLight[i];\n      vec3 light_position_worldspace = pointLight.position;\n      vec3 light_direction = normalize(light_position_worldspace - position_worldspace);\n      lightColor += lighting_getLightColor(surfaceColor, light_direction, view_direction, normal_worldspace, pointLight.color);\n    }\n\n    for (int i = 0; i < MAX_LIGHTS; i++) {\n      if (i >= lighting_uDirectionalLightCount) {\n        break;\n      }\n      DirectionalLight directionalLight = lighting_uDirectionalLight[i];\n      lightColor += lighting_getLightColor(surfaceColor, -directionalLight.direction, view_direction, normal_worldspace, directionalLight.color);\n    }\n  }\n  return lightColor;\n}\n\nvec3 lighting_getSpecularLightColor(vec3 cameraPosition, vec3 position_worldspace, vec3 normal_worldspace) {\n  vec3 lightColor = vec3(0, 0, 0);\n  vec3 surfaceColor = vec3(0, 0, 0);\n\n  if (lighting_uEnabled) {\n    vec3 view_direction = normalize(cameraPosition - position_worldspace);\n\n    for (int i = 0; i < MAX_LIGHTS; i++) {\n      if (i >= lighting_uPointLightCount) {\n        break;\n      }\n      PointLight pointLight = lighting_uPointLight[i];\n      vec3 light_position_worldspace = pointLight.position;\n      vec3 light_direction = normalize(light_position_worldspace - position_worldspace);\n      lightColor += lighting_getLightColor(surfaceColor, light_direction, view_direction, normal_worldspace, pointLight.color);\n    }\n\n    for (int i = 0; i < MAX_LIGHTS; i++) {\n      if (i >= lighting_uDirectionalLightCount) {\n        break;\n      }\n      DirectionalLight directionalLight = lighting_uDirectionalLight[i];\n      lightColor += lighting_getLightColor(surfaceColor, -directionalLight.direction, view_direction, normal_worldspace, directionalLight.color);\n    }\n  }\n  return lightColor;\n}\n";

var gouraudLighting = {
  name: 'gouraud-lighting',
  dependencies: [lights],
  vs: lightingShader$1,
  defines: {
    LIGHTING_VERTEX: 1
  },
  getUniforms: getUniforms$2
};
var INITIAL_MODULE_OPTIONS$1 = {};

function getMaterialUniforms(material) {
  var _material$ambient = material.ambient,
      ambient = _material$ambient === void 0 ? 0.35 : _material$ambient,
      _material$diffuse = material.diffuse,
      diffuse = _material$diffuse === void 0 ? 0.6 : _material$diffuse,
      _material$shininess = material.shininess,
      shininess = _material$shininess === void 0 ? 32 : _material$shininess,
      _material$specularCol = material.specularColor,
      specularColor = _material$specularCol === void 0 ? [30, 30, 30] : _material$specularCol;
  return {
    lighting_uAmbient: ambient,
    lighting_uDiffuse: diffuse,
    lighting_uShininess: shininess,
    lighting_uSpecularColor: specularColor.map(function (x) {
      return x / 255;
    })
  };
}

function getUniforms$2() {
  var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : INITIAL_MODULE_OPTIONS$1;

  if (!('material' in opts)) {
    return {};
  }

  var material = opts.material;

  if (!material) {
    return {
      lighting_uEnabled: false
    };
  }

  return getMaterialUniforms(material);
}

var DRAW_MODE = {
  POINTS: 0x0000,
  LINES: 0x0001,
  LINE_LOOP: 0x0002,
  LINE_STRIP: 0x0003,
  TRIANGLES: 0x0004,
  TRIANGLE_STRIP: 0x0005,
  TRIANGLE_FAN: 0x0006
};

var Geometry = function () {
  _createClass(Geometry, null, [{
    key: "DRAW_MODE",
    get: function get() {
      return DRAW_MODE;
    }
  }]);

  function Geometry() {
    var props = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, Geometry);

    var _props$id = props.id,
        id = _props$id === void 0 ? uid('geometry') : _props$id,
        _props$drawMode = props.drawMode,
        drawMode = _props$drawMode === void 0 ? DRAW_MODE.TRIANGLES : _props$drawMode,
        _props$attributes = props.attributes,
        attributes = _props$attributes === void 0 ? {} : _props$attributes,
        _props$indices = props.indices,
        indices = _props$indices === void 0 ? null : _props$indices,
        _props$vertexCount = props.vertexCount,
        vertexCount = _props$vertexCount === void 0 ? null : _props$vertexCount;
    this.id = id;
    this.drawMode = drawMode | 0;
    this.attributes = {};
    this.userData = {};

    this._setAttributes(attributes, indices);

    this.vertexCount = vertexCount || this._calculateVertexCount(this.attributes, this.indices);
  }

  _createClass(Geometry, [{
    key: "getVertexCount",
    value: function getVertexCount() {
      return this.vertexCount;
    }
  }, {
    key: "getAttributes",
    value: function getAttributes() {
      return this.indices ? _objectSpread$1({
        indices: this.indices
      }, this.attributes) : this.attributes;
    }
  }, {
    key: "_print",
    value: function _print(attributeName) {
      return "Geometry ".concat(this.id, " attribute ").concat(attributeName);
    }
  }, {
    key: "_setAttributes",
    value: function _setAttributes(attributes, indices) {
      if (indices) {
        this.indices = ArrayBuffer.isView(indices) ? {
          value: indices,
          size: 1
        } : indices;
      }

      for (var attributeName in attributes) {
        var attribute = attributes[attributeName];
        attribute = ArrayBuffer.isView(attribute) ? {
          value: attribute
        } : attribute;
        assert(ArrayBuffer.isView(attribute.value), "".concat(this._print(attributeName), ": must be typed array or object with value as typed array"));

        if ((attributeName === 'POSITION' || attributeName === 'positions') && !attribute.size) {
          attribute.size = 3;
        }

        if (attributeName === 'indices') {
          assert(!this.indices);
          this.indices = attribute;
        } else {
          this.attributes[attributeName] = attribute;
        }
      }

      if (this.indices && this.indices.isIndexed !== undefined) {
        this.indices = Object.assign({}, this.indices);
        delete this.indices.isIndexed;
      }

      return this;
    }
  }, {
    key: "_calculateVertexCount",
    value: function _calculateVertexCount(attributes, indices) {
      if (indices) {
        return indices.value.length;
      }

      var vertexCount = Infinity;

      for (var attributeName in attributes) {
        var attribute = attributes[attributeName];
        var value = attribute.value,
            size = attribute.size,
            constant = attribute.constant;

        if (!constant && value && size >= 1) {
          vertexCount = Math.min(vertexCount, value.length / size);
        }
      }

      assert(Number.isFinite(vertexCount));
      return vertexCount;
    }
  }, {
    key: "mode",
    get: function get() {
      return this.drawMode;
    }
  }]);

  return Geometry;
}();

var vs$1 = "\nvec4 project_position_to_clipspace(\n  vec3 position, vec3 position64Low, vec3 offset, out vec4 commonPosition\n) {\n  vec3 projectedPosition = project_position(position, position64Low);\n  if (project_uProjectionMode == PROJECTION_MODE_GLOBE) {\n    // offset is specified as ENU\n    // when in globe projection, rotate offset so that the ground alighs with the surface of the globe\n    mat3 rotation = project_get_orientation_matrix(projectedPosition);\n    offset = rotation * offset;\n  }\n  commonPosition = vec4(projectedPosition + offset, 1.0);\n  return project_common_position_to_clipspace(commonPosition);\n}\n\nvec4 project_position_to_clipspace(\n  vec3 position, vec3 position64Low, vec3 offset\n) {\n  vec4 commonPosition;\n  return project_position_to_clipspace(position, position64Low, offset, commonPosition);\n}\n";
var project32 = {
  name: 'project32',
  dependencies: [project],
  vs: vs$1
};

var picking$1 = Object.assign({
  inject: {
    'vs:DECKGL_FILTER_COLOR': "\n    picking_setPickingColor(geometry.pickingColor);\n    // for picking depth values\n    picking_setPickingAttribute(geometry.position.z);\n    ",
    'fs:DECKGL_FILTER_COLOR': {
      order: 99,
      injection: "\n    // use highlight color if this fragment belongs to the selected object.\n    color = picking_filterHighlightColor(color);\n\n    // use picking color if rendering to picking FBO.\n    color = picking_filterPickingColor(color);\n      "
    }
  }
}, picking);

function _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

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
        var _iterator = _createForOfIteratorHelper(dataChanged),
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

      var _iterator2 = _createForOfIteratorHelper(iterable),
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
          polygonLow.pos = polygonLow.pos.concat(parts[0].pos);

          if (edgeTypes) {
            polygonLow.types = polygonLow.types.concat(parts[0].types);
          }
        }

        if (parts[1]) {
          polygonHigh.holes.push(polygonHigh.pos.length);
          polygonHigh.pos = polygonHigh.pos.concat(parts[1].pos);

          if (edgeTypes) {
            polygonHigh.types = polygonHigh.types.concat(parts[1].types);
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

function _createForOfIteratorHelper$1(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray$1(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray$1(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray$1(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray$1(o, minLen); }

function _arrayLikeToArray$1(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }
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
    var _iterator = _createForOfIteratorHelper$1(parts),
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
    var _iterator2 = _createForOfIteratorHelper$1(parts),
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

var earcut_1 = earcut;
var _default = earcut;

function earcut(data, holeIndices, dim) {

    dim = dim || 2;

    var hasHoles = holeIndices && holeIndices.length,
        outerLen = hasHoles ? holeIndices[0] * dim : data.length,
        outerNode = linkedList(data, 0, outerLen, dim, true),
        triangles = [];

    if (!outerNode || outerNode.next === outerNode.prev) return triangles;

    var minX, minY, maxX, maxY, x, y, invSize;

    if (hasHoles) outerNode = eliminateHoles(data, holeIndices, outerNode, dim);

    // if the shape is not too simple, we'll use z-order curve hash later; calculate polygon bbox
    if (data.length > 80 * dim) {
        minX = maxX = data[0];
        minY = maxY = data[1];

        for (var i = dim; i < outerLen; i += dim) {
            x = data[i];
            y = data[i + 1];
            if (x < minX) minX = x;
            if (y < minY) minY = y;
            if (x > maxX) maxX = x;
            if (y > maxY) maxY = y;
        }

        // minX, minY and invSize are later used to transform coords into integers for z-order calculation
        invSize = Math.max(maxX - minX, maxY - minY);
        invSize = invSize !== 0 ? 1 / invSize : 0;
    }

    earcutLinked(outerNode, triangles, dim, minX, minY, invSize);

    return triangles;
}

// create a circular doubly linked list from polygon points in the specified winding order
function linkedList(data, start, end, dim, clockwise) {
    var i, last;

    if (clockwise === (signedArea(data, start, end, dim) > 0)) {
        for (i = start; i < end; i += dim) last = insertNode(i, data[i], data[i + 1], last);
    } else {
        for (i = end - dim; i >= start; i -= dim) last = insertNode(i, data[i], data[i + 1], last);
    }

    if (last && equals(last, last.next)) {
        removeNode(last);
        last = last.next;
    }

    return last;
}

// eliminate colinear or duplicate points
function filterPoints(start, end) {
    if (!start) return start;
    if (!end) end = start;

    var p = start,
        again;
    do {
        again = false;

        if (!p.steiner && (equals(p, p.next) || area(p.prev, p, p.next) === 0)) {
            removeNode(p);
            p = end = p.prev;
            if (p === p.next) break;
            again = true;

        } else {
            p = p.next;
        }
    } while (again || p !== end);

    return end;
}

// main ear slicing loop which triangulates a polygon (given as a linked list)
function earcutLinked(ear, triangles, dim, minX, minY, invSize, pass) {
    if (!ear) return;

    // interlink polygon nodes in z-order
    if (!pass && invSize) indexCurve(ear, minX, minY, invSize);

    var stop = ear,
        prev, next;

    // iterate through ears, slicing them one by one
    while (ear.prev !== ear.next) {
        prev = ear.prev;
        next = ear.next;

        if (invSize ? isEarHashed(ear, minX, minY, invSize) : isEar(ear)) {
            // cut off the triangle
            triangles.push(prev.i / dim);
            triangles.push(ear.i / dim);
            triangles.push(next.i / dim);

            removeNode(ear);

            // skipping the next vertex leads to less sliver triangles
            ear = next.next;
            stop = next.next;

            continue;
        }

        ear = next;

        // if we looped through the whole remaining polygon and can't find any more ears
        if (ear === stop) {
            // try filtering points and slicing again
            if (!pass) {
                earcutLinked(filterPoints(ear), triangles, dim, minX, minY, invSize, 1);

            // if this didn't work, try curing all small self-intersections locally
            } else if (pass === 1) {
                ear = cureLocalIntersections(filterPoints(ear), triangles, dim);
                earcutLinked(ear, triangles, dim, minX, minY, invSize, 2);

            // as a last resort, try splitting the remaining polygon into two
            } else if (pass === 2) {
                splitEarcut(ear, triangles, dim, minX, minY, invSize);
            }

            break;
        }
    }
}

// check whether a polygon node forms a valid ear with adjacent nodes
function isEar(ear) {
    var a = ear.prev,
        b = ear,
        c = ear.next;

    if (area(a, b, c) >= 0) return false; // reflex, can't be an ear

    // now make sure we don't have other points inside the potential ear
    var p = ear.next.next;

    while (p !== ear.prev) {
        if (pointInTriangle(a.x, a.y, b.x, b.y, c.x, c.y, p.x, p.y) &&
            area(p.prev, p, p.next) >= 0) return false;
        p = p.next;
    }

    return true;
}

function isEarHashed(ear, minX, minY, invSize) {
    var a = ear.prev,
        b = ear,
        c = ear.next;

    if (area(a, b, c) >= 0) return false; // reflex, can't be an ear

    // triangle bbox; min & max are calculated like this for speed
    var minTX = a.x < b.x ? (a.x < c.x ? a.x : c.x) : (b.x < c.x ? b.x : c.x),
        minTY = a.y < b.y ? (a.y < c.y ? a.y : c.y) : (b.y < c.y ? b.y : c.y),
        maxTX = a.x > b.x ? (a.x > c.x ? a.x : c.x) : (b.x > c.x ? b.x : c.x),
        maxTY = a.y > b.y ? (a.y > c.y ? a.y : c.y) : (b.y > c.y ? b.y : c.y);

    // z-order range for the current triangle bbox;
    var minZ = zOrder(minTX, minTY, minX, minY, invSize),
        maxZ = zOrder(maxTX, maxTY, minX, minY, invSize);

    var p = ear.prevZ,
        n = ear.nextZ;

    // look for points inside the triangle in both directions
    while (p && p.z >= minZ && n && n.z <= maxZ) {
        if (p !== ear.prev && p !== ear.next &&
            pointInTriangle(a.x, a.y, b.x, b.y, c.x, c.y, p.x, p.y) &&
            area(p.prev, p, p.next) >= 0) return false;
        p = p.prevZ;

        if (n !== ear.prev && n !== ear.next &&
            pointInTriangle(a.x, a.y, b.x, b.y, c.x, c.y, n.x, n.y) &&
            area(n.prev, n, n.next) >= 0) return false;
        n = n.nextZ;
    }

    // look for remaining points in decreasing z-order
    while (p && p.z >= minZ) {
        if (p !== ear.prev && p !== ear.next &&
            pointInTriangle(a.x, a.y, b.x, b.y, c.x, c.y, p.x, p.y) &&
            area(p.prev, p, p.next) >= 0) return false;
        p = p.prevZ;
    }

    // look for remaining points in increasing z-order
    while (n && n.z <= maxZ) {
        if (n !== ear.prev && n !== ear.next &&
            pointInTriangle(a.x, a.y, b.x, b.y, c.x, c.y, n.x, n.y) &&
            area(n.prev, n, n.next) >= 0) return false;
        n = n.nextZ;
    }

    return true;
}

// go through all polygon nodes and cure small local self-intersections
function cureLocalIntersections(start, triangles, dim) {
    var p = start;
    do {
        var a = p.prev,
            b = p.next.next;

        if (!equals(a, b) && intersects(a, p, p.next, b) && locallyInside(a, b) && locallyInside(b, a)) {

            triangles.push(a.i / dim);
            triangles.push(p.i / dim);
            triangles.push(b.i / dim);

            // remove two nodes involved
            removeNode(p);
            removeNode(p.next);

            p = start = b;
        }
        p = p.next;
    } while (p !== start);

    return filterPoints(p);
}

// try splitting polygon into two and triangulate them independently
function splitEarcut(start, triangles, dim, minX, minY, invSize) {
    // look for a valid diagonal that divides the polygon into two
    var a = start;
    do {
        var b = a.next.next;
        while (b !== a.prev) {
            if (a.i !== b.i && isValidDiagonal(a, b)) {
                // split the polygon in two by the diagonal
                var c = splitPolygon(a, b);

                // filter colinear points around the cuts
                a = filterPoints(a, a.next);
                c = filterPoints(c, c.next);

                // run earcut on each half
                earcutLinked(a, triangles, dim, minX, minY, invSize);
                earcutLinked(c, triangles, dim, minX, minY, invSize);
                return;
            }
            b = b.next;
        }
        a = a.next;
    } while (a !== start);
}

// link every hole into the outer loop, producing a single-ring polygon without holes
function eliminateHoles(data, holeIndices, outerNode, dim) {
    var queue = [],
        i, len, start, end, list;

    for (i = 0, len = holeIndices.length; i < len; i++) {
        start = holeIndices[i] * dim;
        end = i < len - 1 ? holeIndices[i + 1] * dim : data.length;
        list = linkedList(data, start, end, dim, false);
        if (list === list.next) list.steiner = true;
        queue.push(getLeftmost(list));
    }

    queue.sort(compareX);

    // process holes from left to right
    for (i = 0; i < queue.length; i++) {
        eliminateHole(queue[i], outerNode);
        outerNode = filterPoints(outerNode, outerNode.next);
    }

    return outerNode;
}

function compareX(a, b) {
    return a.x - b.x;
}

// find a bridge between vertices that connects hole with an outer ring and and link it
function eliminateHole(hole, outerNode) {
    outerNode = findHoleBridge(hole, outerNode);
    if (outerNode) {
        var b = splitPolygon(outerNode, hole);

        // filter collinear points around the cuts
        filterPoints(outerNode, outerNode.next);
        filterPoints(b, b.next);
    }
}

// David Eberly's algorithm for finding a bridge between hole and outer polygon
function findHoleBridge(hole, outerNode) {
    var p = outerNode,
        hx = hole.x,
        hy = hole.y,
        qx = -Infinity,
        m;

    // find a segment intersected by a ray from the hole's leftmost point to the left;
    // segment's endpoint with lesser x will be potential connection point
    do {
        if (hy <= p.y && hy >= p.next.y && p.next.y !== p.y) {
            var x = p.x + (hy - p.y) * (p.next.x - p.x) / (p.next.y - p.y);
            if (x <= hx && x > qx) {
                qx = x;
                if (x === hx) {
                    if (hy === p.y) return p;
                    if (hy === p.next.y) return p.next;
                }
                m = p.x < p.next.x ? p : p.next;
            }
        }
        p = p.next;
    } while (p !== outerNode);

    if (!m) return null;

    if (hx === qx) return m; // hole touches outer segment; pick leftmost endpoint

    // look for points inside the triangle of hole point, segment intersection and endpoint;
    // if there are no points found, we have a valid connection;
    // otherwise choose the point of the minimum angle with the ray as connection point

    var stop = m,
        mx = m.x,
        my = m.y,
        tanMin = Infinity,
        tan;

    p = m;

    do {
        if (hx >= p.x && p.x >= mx && hx !== p.x &&
                pointInTriangle(hy < my ? hx : qx, hy, mx, my, hy < my ? qx : hx, hy, p.x, p.y)) {

            tan = Math.abs(hy - p.y) / (hx - p.x); // tangential

            if (locallyInside(p, hole) &&
                (tan < tanMin || (tan === tanMin && (p.x > m.x || (p.x === m.x && sectorContainsSector(m, p)))))) {
                m = p;
                tanMin = tan;
            }
        }

        p = p.next;
    } while (p !== stop);

    return m;
}

// whether sector in vertex m contains sector in vertex p in the same coordinates
function sectorContainsSector(m, p) {
    return area(m.prev, m, p.prev) < 0 && area(p.next, m, m.next) < 0;
}

// interlink polygon nodes in z-order
function indexCurve(start, minX, minY, invSize) {
    var p = start;
    do {
        if (p.z === null) p.z = zOrder(p.x, p.y, minX, minY, invSize);
        p.prevZ = p.prev;
        p.nextZ = p.next;
        p = p.next;
    } while (p !== start);

    p.prevZ.nextZ = null;
    p.prevZ = null;

    sortLinked(p);
}

// Simon Tatham's linked list merge sort algorithm
// http://www.chiark.greenend.org.uk/~sgtatham/algorithms/listsort.html
function sortLinked(list) {
    var i, p, q, e, tail, numMerges, pSize, qSize,
        inSize = 1;

    do {
        p = list;
        list = null;
        tail = null;
        numMerges = 0;

        while (p) {
            numMerges++;
            q = p;
            pSize = 0;
            for (i = 0; i < inSize; i++) {
                pSize++;
                q = q.nextZ;
                if (!q) break;
            }
            qSize = inSize;

            while (pSize > 0 || (qSize > 0 && q)) {

                if (pSize !== 0 && (qSize === 0 || !q || p.z <= q.z)) {
                    e = p;
                    p = p.nextZ;
                    pSize--;
                } else {
                    e = q;
                    q = q.nextZ;
                    qSize--;
                }

                if (tail) tail.nextZ = e;
                else list = e;

                e.prevZ = tail;
                tail = e;
            }

            p = q;
        }

        tail.nextZ = null;
        inSize *= 2;

    } while (numMerges > 1);

    return list;
}

// z-order of a point given coords and inverse of the longer side of data bbox
function zOrder(x, y, minX, minY, invSize) {
    // coords are transformed into non-negative 15-bit integer range
    x = 32767 * (x - minX) * invSize;
    y = 32767 * (y - minY) * invSize;

    x = (x | (x << 8)) & 0x00FF00FF;
    x = (x | (x << 4)) & 0x0F0F0F0F;
    x = (x | (x << 2)) & 0x33333333;
    x = (x | (x << 1)) & 0x55555555;

    y = (y | (y << 8)) & 0x00FF00FF;
    y = (y | (y << 4)) & 0x0F0F0F0F;
    y = (y | (y << 2)) & 0x33333333;
    y = (y | (y << 1)) & 0x55555555;

    return x | (y << 1);
}

// find the leftmost node of a polygon ring
function getLeftmost(start) {
    var p = start,
        leftmost = start;
    do {
        if (p.x < leftmost.x || (p.x === leftmost.x && p.y < leftmost.y)) leftmost = p;
        p = p.next;
    } while (p !== start);

    return leftmost;
}

// check if a point lies within a convex triangle
function pointInTriangle(ax, ay, bx, by, cx, cy, px, py) {
    return (cx - px) * (ay - py) - (ax - px) * (cy - py) >= 0 &&
           (ax - px) * (by - py) - (bx - px) * (ay - py) >= 0 &&
           (bx - px) * (cy - py) - (cx - px) * (by - py) >= 0;
}

// check if a diagonal between two polygon nodes is valid (lies in polygon interior)
function isValidDiagonal(a, b) {
    return a.next.i !== b.i && a.prev.i !== b.i && !intersectsPolygon(a, b) && // dones't intersect other edges
           (locallyInside(a, b) && locallyInside(b, a) && middleInside(a, b) && // locally visible
            (area(a.prev, a, b.prev) || area(a, b.prev, b)) || // does not create opposite-facing sectors
            equals(a, b) && area(a.prev, a, a.next) > 0 && area(b.prev, b, b.next) > 0); // special zero-length case
}

// signed area of a triangle
function area(p, q, r) {
    return (q.y - p.y) * (r.x - q.x) - (q.x - p.x) * (r.y - q.y);
}

// check if two points are equal
function equals(p1, p2) {
    return p1.x === p2.x && p1.y === p2.y;
}

// check if two segments intersect
function intersects(p1, q1, p2, q2) {
    var o1 = sign(area(p1, q1, p2));
    var o2 = sign(area(p1, q1, q2));
    var o3 = sign(area(p2, q2, p1));
    var o4 = sign(area(p2, q2, q1));

    if (o1 !== o2 && o3 !== o4) return true; // general case

    if (o1 === 0 && onSegment(p1, p2, q1)) return true; // p1, q1 and p2 are collinear and p2 lies on p1q1
    if (o2 === 0 && onSegment(p1, q2, q1)) return true; // p1, q1 and q2 are collinear and q2 lies on p1q1
    if (o3 === 0 && onSegment(p2, p1, q2)) return true; // p2, q2 and p1 are collinear and p1 lies on p2q2
    if (o4 === 0 && onSegment(p2, q1, q2)) return true; // p2, q2 and q1 are collinear and q1 lies on p2q2

    return false;
}

// for collinear points p, q, r, check if point q lies on segment pr
function onSegment(p, q, r) {
    return q.x <= Math.max(p.x, r.x) && q.x >= Math.min(p.x, r.x) && q.y <= Math.max(p.y, r.y) && q.y >= Math.min(p.y, r.y);
}

function sign(num) {
    return num > 0 ? 1 : num < 0 ? -1 : 0;
}

// check if a polygon diagonal intersects any polygon segments
function intersectsPolygon(a, b) {
    var p = a;
    do {
        if (p.i !== a.i && p.next.i !== a.i && p.i !== b.i && p.next.i !== b.i &&
                intersects(p, p.next, a, b)) return true;
        p = p.next;
    } while (p !== a);

    return false;
}

// check if a polygon diagonal is locally inside the polygon
function locallyInside(a, b) {
    return area(a.prev, a, a.next) < 0 ?
        area(a, b, a.next) >= 0 && area(a, a.prev, b) >= 0 :
        area(a, b, a.prev) < 0 || area(a, a.next, b) < 0;
}

// check if the middle point of a polygon diagonal is inside the polygon
function middleInside(a, b) {
    var p = a,
        inside = false,
        px = (a.x + b.x) / 2,
        py = (a.y + b.y) / 2;
    do {
        if (((p.y > py) !== (p.next.y > py)) && p.next.y !== p.y &&
                (px < (p.next.x - p.x) * (py - p.y) / (p.next.y - p.y) + p.x))
            inside = !inside;
        p = p.next;
    } while (p !== a);

    return inside;
}

// link two polygon vertices with a bridge; if the vertices belong to the same ring, it splits polygon into two;
// if one belongs to the outer ring and another to a hole, it merges it into a single ring
function splitPolygon(a, b) {
    var a2 = new Node(a.i, a.x, a.y),
        b2 = new Node(b.i, b.x, b.y),
        an = a.next,
        bp = b.prev;

    a.next = b;
    b.prev = a;

    a2.next = an;
    an.prev = a2;

    b2.next = a2;
    a2.prev = b2;

    bp.next = b2;
    b2.prev = bp;

    return b2;
}

// create a node and optionally link it with previous one (in a circular doubly linked list)
function insertNode(i, x, y, last) {
    var p = new Node(i, x, y);

    if (!last) {
        p.prev = p;
        p.next = p;

    } else {
        p.next = last.next;
        p.prev = last;
        last.next.prev = p;
        last.next = p;
    }
    return p;
}

function removeNode(p) {
    p.next.prev = p.prev;
    p.prev.next = p.next;

    if (p.prevZ) p.prevZ.nextZ = p.nextZ;
    if (p.nextZ) p.nextZ.prevZ = p.prevZ;
}

function Node(i, x, y) {
    // vertex index in coordinates array
    this.i = i;

    // vertex coordinates
    this.x = x;
    this.y = y;

    // previous and next vertex nodes in a polygon ring
    this.prev = null;
    this.next = null;

    // z-order curve value
    this.z = null;

    // previous and next nodes in z-order
    this.prevZ = null;
    this.nextZ = null;

    // indicates whether this is a steiner point
    this.steiner = false;
}

// return a percentage difference between the polygon area and its triangulation area;
// used to verify correctness of triangulation
earcut.deviation = function (data, holeIndices, dim, triangles) {
    var hasHoles = holeIndices && holeIndices.length;
    var outerLen = hasHoles ? holeIndices[0] * dim : data.length;

    var polygonArea = Math.abs(signedArea(data, 0, outerLen, dim));
    if (hasHoles) {
        for (var i = 0, len = holeIndices.length; i < len; i++) {
            var start = holeIndices[i] * dim;
            var end = i < len - 1 ? holeIndices[i + 1] * dim : data.length;
            polygonArea -= Math.abs(signedArea(data, start, end, dim));
        }
    }

    var trianglesArea = 0;
    for (i = 0; i < triangles.length; i += 3) {
        var a = triangles[i] * dim;
        var b = triangles[i + 1] * dim;
        var c = triangles[i + 2] * dim;
        trianglesArea += Math.abs(
            (data[a] - data[c]) * (data[b + 1] - data[a + 1]) -
            (data[a] - data[b]) * (data[c + 1] - data[a + 1]));
    }

    return polygonArea === 0 && trianglesArea === 0 ? 0 :
        Math.abs((trianglesArea - polygonArea) / polygonArea);
};

function signedArea(data, start, end, dim) {
    var sum = 0;
    for (var i = start, j = end - dim; i < end; i += dim) {
        sum += (data[j] - data[i]) * (data[i + 1] + data[j + 1]);
        j = i;
    }
    return sum;
}

// turn a polygon in a multi-dimensional array form (e.g. as in GeoJSON) into a form Earcut accepts
earcut.flatten = function (data) {
    var dim = data[0][0].length,
        result = {vertices: [], holes: [], dimensions: dim},
        holeIndex = 0;

    for (var i = 0; i < data.length; i++) {
        for (var j = 0; j < data[i].length; j++) {
            for (var d = 0; d < dim; d++) result.vertices.push(data[i][j][d]);
        }
        if (i > 0) {
            holeIndex += data[i - 1].length;
            result.holes.push(holeIndex);
        }
    }
    return result;
};
earcut_1.default = _default;

function _createForOfIteratorHelper$2(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray$2(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray$2(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray$2(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray$2(o, minLen); }

function _arrayLikeToArray$2(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

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

function normalize(polygon, positionSize) {
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

    var _iterator = _createForOfIteratorHelper$2(polygon),
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

function _createForOfIteratorHelper$3(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray$3(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray$3(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray$3(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray$3(o, minLen); }

function _arrayLikeToArray$3(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

var PolygonTesselator = function (_Tesselator) {
  _inherits(PolygonTesselator, _Tesselator);

  var _super = _createSuper(PolygonTesselator);

  function PolygonTesselator(opts) {
    _classCallCheck(this, PolygonTesselator);

    var fp64 = opts.fp64,
        _opts$IndexType = opts.IndexType,
        IndexType = _opts$IndexType === void 0 ? Uint32Array : _opts$IndexType;
    return _super.call(this, _objectSpread(_objectSpread({}, opts), {}, {
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
        polygon = normalize(polygon, this.positionSize);

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

        var _iterator = _createForOfIteratorHelper$3(polygon),
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
        var _iterator2 = _createForOfIteratorHelper$3(polygon),
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

var main = "\nattribute vec2 vertexPositions;\nattribute float vertexValid;\n\nuniform bool extruded;\nuniform bool isWireframe;\nuniform float elevationScale;\nuniform float opacity;\n\nvarying vec4 vColor;\nvarying float isValid;\n\nstruct PolygonProps {\n  vec4 fillColors;\n  vec4 lineColors;\n  vec3 positions;\n  vec3 nextPositions;\n  vec3 pickingColors;\n  vec3 positions64Low;\n  vec3 nextPositions64Low;\n  float elevations;\n};\n\nvec3 project_offset_normal(vec3 vector) {\n  if (project_uCoordinateSystem == COORDINATE_SYSTEM_LNGLAT ||\n    project_uCoordinateSystem == COORDINATE_SYSTEM_LNGLAT_OFFSETS) {\n    return normalize(vector * project_uCommonUnitsPerWorldUnit);\n  }\n  return project_normal(vector);\n}\n\nvoid calculatePosition(PolygonProps props) {\n  vec3 pos;\n  vec3 pos64Low;\n  vec3 normal;\n  vec4 colors = isWireframe ? props.lineColors : props.fillColors;\n\n  geometry.worldPosition = props.positions;\n  geometry.worldPositionAlt = props.nextPositions;\n  geometry.pickingColor = props.pickingColors;\n\n#ifdef IS_SIDE_VERTEX\n  pos = mix(props.positions, props.nextPositions, vertexPositions.x);\n  pos64Low = mix(props.positions64Low, props.nextPositions64Low, vertexPositions.x);\n  isValid = vertexValid;\n#else\n  pos = props.positions;\n  pos64Low = props.positions64Low;\n  isValid = 1.0;\n#endif\n\n  if (extruded) {\n    pos.z += props.elevations * vertexPositions.y * elevationScale;\n\n#ifdef IS_SIDE_VERTEX\n    normal = vec3(\n      props.positions.y - props.nextPositions.y + (props.positions64Low.y - props.nextPositions64Low.y),\n      props.nextPositions.x - props.positions.x + (props.nextPositions64Low.x - props.positions64Low.x),\n      0.0);\n    normal = project_offset_normal(normal);\n#else\n    normal = vec3(0.0, 0.0, 1.0);\n#endif\n    geometry.normal = normal;\n  }\n\n  gl_Position = project_position_to_clipspace(pos, pos64Low, vec3(0.), geometry.position);\n  DECKGL_FILTER_GL_POSITION(gl_Position, geometry);\n\n  if (extruded) {\n    vec3 lightColor = lighting_getLightColor(colors.rgb, project_uCameraPosition, geometry.position.xyz, normal);\n    vColor = vec4(lightColor, colors.a * opacity);\n  } else {\n    vColor = vec4(colors.rgb, colors.a * opacity);\n  }\n  DECKGL_FILTER_COLOR(vColor, geometry);\n}\n";

var vsTop = "#define SHADER_NAME solid-polygon-layer-vertex-shader\n\nattribute vec3 positions;\nattribute vec3 positions64Low;\nattribute float elevations;\nattribute vec4 fillColors;\nattribute vec4 lineColors;\nattribute vec3 pickingColors;\n\n".concat(main, "\n\nvoid main(void) {\n  PolygonProps props;\n\n  props.positions = positions;\n  props.positions64Low = positions64Low;\n  props.elevations = elevations;\n  props.fillColors = fillColors;\n  props.lineColors = lineColors;\n  props.pickingColors = pickingColors;\n\n  calculatePosition(props);\n}\n");

var vsSide = "#define SHADER_NAME solid-polygon-layer-vertex-shader-side\n#define IS_SIDE_VERTEX\n\n\nattribute vec3 instancePositions;\nattribute vec3 nextPositions;\nattribute vec3 instancePositions64Low;\nattribute vec3 nextPositions64Low;\nattribute float instanceElevations;\nattribute vec4 instanceFillColors;\nattribute vec4 instanceLineColors;\nattribute vec3 instancePickingColors;\n\n".concat(main, "\n\nvoid main(void) {\n  PolygonProps props;\n\n  props.positions = instancePositions;\n  props.positions64Low = instancePositions64Low;\n  props.elevations = instanceElevations;\n  props.fillColors = instanceFillColors;\n  props.lineColors = instanceLineColors;\n  props.pickingColors = instancePickingColors;\n  props.nextPositions = nextPositions;\n  props.nextPositions64Low = nextPositions64Low;\n\n  calculatePosition(props);\n}\n");

var fs$1 = "#define SHADER_NAME solid-polygon-layer-fragment-shader\n\nprecision highp float;\n\nvarying vec4 vColor;\nvarying float isValid;\n\nvoid main(void) {\n  if (isValid < 0.5) {\n    discard;\n  }\n\n  gl_FragColor = vColor;\n\n  DECKGL_FILTER_COLOR(gl_FragColor, geometry);\n}\n";

function _createSuper$1(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct$1(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _isNativeReflectConstruct$1() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }
var DEFAULT_COLOR = [0, 0, 0, 255];
var defaultProps = {
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
    value: DEFAULT_COLOR
  },
  getLineColor: {
    type: 'accessor',
    value: DEFAULT_COLOR
  },
  material: true
};
var ATTRIBUTE_TRANSITION = {
  enter: function enter(value, chunk) {
    return chunk.length ? chunk.subarray(chunk.length - value.length) : value;
  }
};

var SolidPolygonLayer = function (_Layer) {
  _inherits(SolidPolygonLayer, _Layer);

  var _super = _createSuper$1(SolidPolygonLayer);

  function SolidPolygonLayer() {
    _classCallCheck(this, SolidPolygonLayer);

    return _super.apply(this, arguments);
  }

  _createClass(SolidPolygonLayer, [{
    key: "getShaders",
    value: function getShaders(vs) {
      return _get(_getPrototypeOf(SolidPolygonLayer.prototype), "getShaders", this).call(this, {
        vs: vs,
        fs: fs$1,
        defines: {},
        modules: [project32, gouraudLighting, picking$1]
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
          transition: ATTRIBUTE_TRANSITION,
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
          transition: ATTRIBUTE_TRANSITION,
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
          transition: ATTRIBUTE_TRANSITION,
          accessor: 'getFillColor',
          defaultValue: DEFAULT_COLOR,
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
          transition: ATTRIBUTE_TRANSITION,
          accessor: 'getLineColor',
          defaultValue: DEFAULT_COLOR,
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
        var shaders = this.getShaders(vsTop);
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
        sideModel = new Model(gl, Object.assign({}, this.getShaders(vsSide), {
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
SolidPolygonLayer.defaultProps = defaultProps;

export { Geometry as G, SolidPolygonLayer as S, Tesselator as T, picking$1 as a, cutPolylineByMercatorBounds as b, cutPolylineByGrid as c, project32 as p };
