import '../common/_commonjsHelpers-37fa8da4.js';
import { O as Buffer, _ as _inherits, a as _getPrototypeOf, b as _possibleConstructorReturn, f as _get, a0 as hasFeatures, a1 as Model, Q as FEATURES } from '../common/transform-35a4c5f8.js';
import '../common/process-2545f00a.js';
import '../common/typeof-c65245d2.js';
import { _ as _defineProperty } from '../common/defineProperty-1b0b77a2.js';
import { _ as _classCallCheck } from '../common/classCallCheck-4eda545c.js';
import { _ as _createClass } from '../common/assertThisInitialized-87ceda02.js';
import '../common/_node-resolve:empty-0f7f843d.js';
import { g as assert, j as getAccessorFromBuffer, k as createIterable, n as defaultTypedArrayManager, C as COORDINATE_SYSTEM, L as Layer } from '../common/layer-4d223d3d.js';
import '../common/slicedToArray-14e71088.js';
import '../common/fp32-cb4e18c9.js';
import { p as picking$1, e as earcut_1, g as gouraudLighting, G as Geometry } from '../common/earcut-60cbfb1d.js';
import { p as project } from '../common/project-b311f9be.js';

var vs = "\nvec4 project_position_to_clipspace(\n  vec3 position, vec3 position64Low, vec3 offset, out vec4 commonPosition\n) {\n  vec3 projectedPosition = project_position(position, position64Low);\n  if (project_uProjectionMode == PROJECTION_MODE_GLOBE) {\n    // offset is specified as ENU\n    // when in globe projection, rotate offset so that the ground alighs with the surface of the globe\n    mat3 rotation = project_get_orientation_matrix(projectedPosition);\n    offset = rotation * offset;\n  }\n  commonPosition = vec4(projectedPosition + offset, 1.0);\n  return project_common_position_to_clipspace(commonPosition);\n}\n\nvec4 project_position_to_clipspace(\n  vec3 position, vec3 position64Low, vec3 offset\n) {\n  vec4 commonPosition;\n  return project_position_to_clipspace(position, position64Low, offset, commonPosition);\n}\n";
var project32 = {
  name: 'project32',
  dependencies: [project],
  vs: vs
};

var picking = Object.assign({
  inject: {
    'vs:DECKGL_FILTER_COLOR': "\n    picking_setPickingColor(geometry.pickingColor);\n    // for picking depth values\n    picking_setPickingAttribute(geometry.position.z);\n    ",
    'fs:DECKGL_FILTER_COLOR': {
      order: 99,
      injection: "\n    // use highlight color if this fragment belongs to the selected object.\n    color = picking_filterHighlightColor(color);\n\n    // use picking color if rendering to picking FBO.\n    color = picking_filterPickingColor(color);\n      "
    }
  }
}, picking$1);

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
        assert(data.startIndices, 'binary data missing startIndices');
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
      assert(ArrayBuffer.isView(value), 'cannot read geometries');
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

var config = {};
config.EPSILON = 1e-12;
config.debug = false;
config.precision = 4;
config.printTypes = false;
config.printDegrees = false;
config.printRowMajor = true;
function isArray(value) {
  return Array.isArray(value) || ArrayBuffer.isView(value) && !(value instanceof DataView);
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

var Polygon = function () {
  function Polygon(points) {
    _classCallCheck(this, Polygon);

    this.points = points;
    this.isClosed = equals(this.points[this.points.length - 1], this.points[0]);
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

var main = "\nattribute vec2 vertexPositions;\nattribute float vertexValid;\n\nuniform bool extruded;\nuniform bool isWireframe;\nuniform float elevationScale;\nuniform float opacity;\n\nvarying vec4 vColor;\n\nstruct PolygonProps {\n  vec4 fillColors;\n  vec4 lineColors;\n  vec3 positions;\n  vec3 nextPositions;\n  vec3 pickingColors;\n  vec3 positions64Low;\n  vec3 nextPositions64Low;\n  float elevations;\n};\n\nvec3 project_offset_normal(vec3 vector) {\n  if (project_uCoordinateSystem == COORDINATE_SYSTEM_LNGLAT ||\n    project_uCoordinateSystem == COORDINATE_SYSTEM_LNGLAT_OFFSETS) {\n    return normalize(vector * project_uCommonUnitsPerWorldUnit);\n  }\n  return project_normal(vector);\n}\n\nvoid calculatePosition(PolygonProps props) {\n#ifdef IS_SIDE_VERTEX\n  if(vertexValid < 0.5){\n    gl_Position = vec4(0.);\n    return;\n  }\n#endif\n\n  vec3 pos;\n  vec3 pos64Low;\n  vec3 normal;\n  vec4 colors = isWireframe ? props.lineColors : props.fillColors;\n\n  geometry.worldPosition = props.positions;\n  geometry.worldPositionAlt = props.nextPositions;\n  geometry.pickingColor = props.pickingColors;\n\n#ifdef IS_SIDE_VERTEX\n  pos = mix(props.positions, props.nextPositions, vertexPositions.x);\n  pos64Low = mix(props.positions64Low, props.nextPositions64Low, vertexPositions.x);\n#else\n  pos = props.positions;\n  pos64Low = props.positions64Low;\n#endif\n\n  if (extruded) {\n    pos.z += props.elevations * vertexPositions.y * elevationScale;\n\n#ifdef IS_SIDE_VERTEX\n    normal = vec3(\n      props.positions.y - props.nextPositions.y + (props.positions64Low.y - props.nextPositions64Low.y),\n      props.nextPositions.x - props.positions.x + (props.nextPositions64Low.x - props.positions64Low.x),\n      0.0);\n    normal = project_offset_normal(normal);\n#else\n    normal = vec3(0.0, 0.0, 1.0);\n#endif\n    geometry.normal = normal;\n  }\n\n  gl_Position = project_position_to_clipspace(pos, pos64Low, vec3(0.), geometry.position);\n  DECKGL_FILTER_GL_POSITION(gl_Position, geometry);\n\n  if (extruded) {\n    vec3 lightColor = lighting_getLightColor(colors.rgb, project_uCameraPosition, geometry.position.xyz, normal);\n    vColor = vec4(lightColor, colors.a * opacity);\n  } else {\n    vColor = vec4(colors.rgb, colors.a * opacity);\n  }\n  DECKGL_FILTER_COLOR(vColor, geometry);\n}\n";

var vsTop = "#define SHADER_NAME solid-polygon-layer-vertex-shader\n\nattribute vec3 positions;\nattribute vec3 positions64Low;\nattribute float elevations;\nattribute vec4 fillColors;\nattribute vec4 lineColors;\nattribute vec3 pickingColors;\n\n".concat(main, "\n\nvoid main(void) {\n  PolygonProps props;\n\n  props.positions = positions;\n  props.positions64Low = positions64Low;\n  props.elevations = elevations;\n  props.fillColors = fillColors;\n  props.lineColors = lineColors;\n  props.pickingColors = pickingColors;\n\n  calculatePosition(props);\n}\n");

var vsSide = "#define SHADER_NAME solid-polygon-layer-vertex-shader-side\n#define IS_SIDE_VERTEX\n\n\nattribute vec3 instancePositions;\nattribute vec3 nextPositions;\nattribute vec3 instancePositions64Low;\nattribute vec3 nextPositions64Low;\nattribute float instanceElevations;\nattribute vec4 instanceFillColors;\nattribute vec4 instanceLineColors;\nattribute vec3 instancePickingColors;\n\n".concat(main, "\n\nvoid main(void) {\n  PolygonProps props;\n\n  props.positions = instancePositions;\n  props.positions64Low = instancePositions64Low;\n  props.elevations = instanceElevations;\n  props.fillColors = instanceFillColors;\n  props.lineColors = instanceLineColors;\n  props.pickingColors = instancePickingColors;\n  props.nextPositions = nextPositions;\n  props.nextPositions64Low = nextPositions64Low;\n\n  calculatePosition(props);\n}\n");

var fs = "#define SHADER_NAME solid-polygon-layer-fragment-shader\n\nprecision highp float;\n\nvarying vec4 vColor;\n\nvoid main(void) {\n  gl_FragColor = vColor;\n\n  DECKGL_FILTER_COLOR(gl_FragColor, geometry);\n}\n";

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
    value: function getShaders(type) {
      return _get(_getPrototypeOf(SolidPolygonLayer.prototype), "getShaders", this).call(this, {
        vs: type === 'top' ? vsTop : vsSide,
        fs: fs,
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
SolidPolygonLayer.defaultProps = defaultProps;

export { SolidPolygonLayer };
