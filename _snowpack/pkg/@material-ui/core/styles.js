import { c as createCommonjsModule } from '../../common/_commonjsHelpers-37fa8da4.js';
import { i as interopRequireDefault } from '../../common/interopRequireDefault-0a992762.js';
import { c as createMuiTheme_1, e as esm, a as esm$1, _ as _extends_1, d as defaultTheme_1, b as defineProperty, f as colorManipulator, t as transitions, w as withStyles_1 } from '../../common/withStyles-5f9429f1.js';
import { r as react } from '../../common/index-aae33e1a.js';
import '../../common/withStyles-1776452a.js';
import '../../common/index-c103191b.js';
import '../../common/setPrototypeOf-d164daa3.js';
import '../../common/toConsumableArray-06af309a.js';
import '../../common/clsx.m-a5a7580e.js';
import '../../common/slicedToArray-cdb146e7.js';
import '../../common/classCallCheck-4eda545c.js';
import '../../common/ThemeProvider-7c5c7350.js';
import '../../common/grey-6923bd1c.js';
import '../../common/defineProperty-1b0b77a2.js';

var createMuiStrictModeTheme_1 = createCommonjsModule(function (module, exports) {



Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = createMuiStrictModeTheme;



var _createMuiTheme = interopRequireDefault(createMuiTheme_1);

function createMuiStrictModeTheme(options) {
  for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    args[_key - 1] = arguments[_key];
  }

  return _createMuiTheme.default.apply(void 0, [(0, esm.deepmerge)({
    unstable_strictMode: true
  }, options)].concat(args));
}
});

var createStyles_1 = createCommonjsModule(function (module, exports) {

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = createStyles;



// let warnOnce = false;
// To remove in v5
function createStyles(styles) {
  // warning(
  //   warnOnce,
  //   [
  //     'Material-UI: createStyles from @material-ui/core/styles is deprecated.',
  //     'Please use @material-ui/styles/createStyles',
  //   ].join('\n'),
  // );
  // warnOnce = true;
  return (0, esm$1.createStyles)(styles);
}
});

var makeStyles_1 = createCommonjsModule(function (module, exports) {



Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _extends2 = interopRequireDefault(_extends_1);



var _defaultTheme = interopRequireDefault(defaultTheme_1);

function makeStyles(stylesOrCreator) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  return (0, esm$1.makeStyles)(stylesOrCreator, (0, _extends2.default)({
    defaultTheme: _defaultTheme.default
  }, options));
}

var _default = makeStyles;
exports.default = _default;
});

var cssUtils = createCommonjsModule(function (module, exports) {



Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isUnitless = isUnitless;
exports.getUnit = getUnit;
exports.toUnitless = toUnitless;
exports.convertLength = convertLength;
exports.alignProperty = alignProperty;
exports.fontGrid = fontGrid;
exports.responsiveProperty = responsiveProperty;

var _defineProperty2 = interopRequireDefault(defineProperty);

function isUnitless(value) {
  return String(parseFloat(value)).length === String(value).length;
} // Ported from Compass
// https://github.com/Compass/compass/blob/master/core/stylesheets/compass/typography/_units.scss
// Emulate the sass function "unit"


function getUnit(input) {
  return String(input).match(/[\d.\-+]*\s*(.*)/)[1] || '';
} // Emulate the sass function "unitless"


function toUnitless(length) {
  return parseFloat(length);
} // Convert any CSS <length> or <percentage> value to any another.
// From https://github.com/KyleAMathews/convert-css-length


function convertLength(baseFontSize) {
  return function (length, toUnit) {
    var fromUnit = getUnit(length); // Optimize for cases where `from` and `to` units are accidentally the same.

    if (fromUnit === toUnit) {
      return length;
    } // Convert input length to pixels.


    var pxLength = toUnitless(length);

    if (fromUnit !== 'px') {
      if (fromUnit === 'em') {
        pxLength = toUnitless(length) * toUnitless(baseFontSize);
      } else if (fromUnit === 'rem') {
        pxLength = toUnitless(length) * toUnitless(baseFontSize);
        return length;
      }
    } // Convert length in pixels to the output unit


    var outputLength = pxLength;

    if (toUnit !== 'px') {
      if (toUnit === 'em') {
        outputLength = pxLength / toUnitless(baseFontSize);
      } else if (toUnit === 'rem') {
        outputLength = pxLength / toUnitless(baseFontSize);
      } else {
        return length;
      }
    }

    return parseFloat(outputLength.toFixed(5)) + toUnit;
  };
}

function alignProperty(_ref) {
  var size = _ref.size,
      grid = _ref.grid;
  var sizeBelow = size - size % grid;
  var sizeAbove = sizeBelow + grid;
  return size - sizeBelow < sizeAbove - size ? sizeBelow : sizeAbove;
} // fontGrid finds a minimal grid (in rem) for the fontSize values so that the
// lineHeight falls under a x pixels grid, 4px in the case of Material Design,
// without changing the relative line height


function fontGrid(_ref2) {
  var lineHeight = _ref2.lineHeight,
      pixels = _ref2.pixels,
      htmlFontSize = _ref2.htmlFontSize;
  return pixels / (lineHeight * htmlFontSize);
}
/**
 * generate a responsive version of a given CSS property
 * @example
 * responsiveProperty({
 *   cssProperty: 'fontSize',
 *   min: 15,
 *   max: 20,
 *   unit: 'px',
 *   breakpoints: [300, 600],
 * })
 *
 * // this returns
 *
 * {
 *   fontSize: '15px',
 *   '@media (min-width:300px)': {
 *     fontSize: '17.5px',
 *   },
 *   '@media (min-width:600px)': {
 *     fontSize: '20px',
 *   },
 * }
 *
 * @param {Object} params
 * @param {string} params.cssProperty - The CSS property to be made responsive
 * @param {number} params.min - The smallest value of the CSS property
 * @param {number} params.max - The largest value of the CSS property
 * @param {string} [params.unit] - The unit to be used for the CSS property
 * @param {Array.number} [params.breakpoints]  - An array of breakpoints
 * @param {number} [params.alignStep] - Round scaled value to fall under this grid
 * @returns {Object} responsive styles for {params.cssProperty}
 */


function responsiveProperty(_ref3) {
  var cssProperty = _ref3.cssProperty,
      min = _ref3.min,
      max = _ref3.max,
      _ref3$unit = _ref3.unit,
      unit = _ref3$unit === void 0 ? 'rem' : _ref3$unit,
      _ref3$breakpoints = _ref3.breakpoints,
      breakpoints = _ref3$breakpoints === void 0 ? [600, 960, 1280] : _ref3$breakpoints,
      _ref3$transform = _ref3.transform,
      transform = _ref3$transform === void 0 ? null : _ref3$transform;
  var output = (0, _defineProperty2.default)({}, cssProperty, "".concat(min).concat(unit));
  var factor = (max - min) / breakpoints[breakpoints.length - 1];
  breakpoints.forEach(function (breakpoint) {
    var value = min + factor * breakpoint;

    if (transform !== null) {
      value = transform(value);
    }

    output["@media (min-width:".concat(breakpoint, "px)")] = (0, _defineProperty2.default)({}, cssProperty, "".concat(Math.round(value * 10000) / 10000).concat(unit));
  });
  return output;
}
});

var responsiveFontSizes_1 = createCommonjsModule(function (module, exports) {



Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = responsiveFontSizes;

var _extends2 = interopRequireDefault(_extends_1);





function responsiveFontSizes(themeInput) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var _options$breakpoints = options.breakpoints,
      breakpoints = _options$breakpoints === void 0 ? ['sm', 'md', 'lg'] : _options$breakpoints,
      _options$disableAlign = options.disableAlign,
      disableAlign = _options$disableAlign === void 0 ? false : _options$disableAlign,
      _options$factor = options.factor,
      factor = _options$factor === void 0 ? 2 : _options$factor,
      _options$variants = options.variants,
      variants = _options$variants === void 0 ? ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'subtitle1', 'subtitle2', 'body1', 'body2', 'caption', 'button', 'overline'] : _options$variants;
  var theme = (0, _extends2.default)({}, themeInput);
  theme.typography = (0, _extends2.default)({}, theme.typography);
  var typography = theme.typography; // Convert between css lengths e.g. em->px or px->rem
  // Set the baseFontSize for your project. Defaults to 16px (also the browser default).

  var convert = (0, cssUtils.convertLength)(typography.htmlFontSize);
  var breakpointValues = breakpoints.map(function (x) {
    return theme.breakpoints.values[x];
  });
  variants.forEach(function (variant) {
    var style = typography[variant];
    var remFontSize = parseFloat(convert(style.fontSize, 'rem'));

    if (remFontSize <= 1) {
      return;
    }

    var maxFontSize = remFontSize;
    var minFontSize = 1 + (maxFontSize - 1) / factor;
    var lineHeight = style.lineHeight;

    if (!(0, cssUtils.isUnitless)(lineHeight) && !disableAlign) {
      throw new Error( (0, esm.formatMuiErrorMessage)(6));
    }

    if (!(0, cssUtils.isUnitless)(lineHeight)) {
      // make it unitless
      lineHeight = parseFloat(convert(lineHeight, 'rem')) / parseFloat(remFontSize);
    }

    var transform = null;

    if (!disableAlign) {
      transform = function transform(value) {
        return (0, cssUtils.alignProperty)({
          size: value,
          grid: (0, cssUtils.fontGrid)({
            pixels: 4,
            lineHeight: lineHeight,
            htmlFontSize: typography.htmlFontSize
          })
        });
      };
    }

    typography[variant] = (0, _extends2.default)({}, style, (0, cssUtils.responsiveProperty)({
      cssProperty: 'fontSize',
      min: minFontSize,
      max: maxFontSize,
      unit: 'rem',
      breakpoints: breakpointValues,
      transform: transform
    }));
  });
  return theme;
}
});

var styled_1 = createCommonjsModule(function (module, exports) {



Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _extends2 = interopRequireDefault(_extends_1);



var _defaultTheme = interopRequireDefault(defaultTheme_1);

var styled = function styled(Component) {
  var componentCreator = (0, esm$1.styled)(Component);
  return function (style, options) {
    return componentCreator(style, (0, _extends2.default)({
      defaultTheme: _defaultTheme.default
    }, options));
  };
};

var _default = styled;
exports.default = _default;
});

var useTheme_1 = createCommonjsModule(function (module, exports) {



Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = useTheme;



var _react = interopRequireDefault(react);

var _defaultTheme = interopRequireDefault(defaultTheme_1);

function useTheme() {
  var theme = (0, esm$1.useTheme)() || _defaultTheme.default;

  return theme;
}
});

var withTheme_1 = createCommonjsModule(function (module, exports) {



Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;



var _defaultTheme = interopRequireDefault(defaultTheme_1);

var withTheme = (0, esm$1.withThemeCreator)({
  defaultTheme: _defaultTheme.default
});
var _default = withTheme;
exports.default = _default;
});

var styles = createCommonjsModule(function (module, exports) {



Object.defineProperty(exports, "__esModule", {
  value: true
});
var _exportNames = {
  createMuiTheme: true,
  unstable_createMuiStrictModeTheme: true,
  createStyles: true,
  makeStyles: true,
  responsiveFontSizes: true,
  styled: true,
  useTheme: true,
  withStyles: true,
  withTheme: true,
  createGenerateClassName: true,
  jssPreset: true,
  ServerStyleSheets: true,
  StylesProvider: true,
  MuiThemeProvider: true,
  ThemeProvider: true
};
Object.defineProperty(exports, "createMuiTheme", {
  enumerable: true,
  get: function get() {
    return _createMuiTheme.default;
  }
});
Object.defineProperty(exports, "unstable_createMuiStrictModeTheme", {
  enumerable: true,
  get: function get() {
    return _createMuiStrictModeTheme.default;
  }
});
Object.defineProperty(exports, "createStyles", {
  enumerable: true,
  get: function get() {
    return _createStyles.default;
  }
});
Object.defineProperty(exports, "makeStyles", {
  enumerable: true,
  get: function get() {
    return _makeStyles.default;
  }
});
Object.defineProperty(exports, "responsiveFontSizes", {
  enumerable: true,
  get: function get() {
    return _responsiveFontSizes.default;
  }
});
Object.defineProperty(exports, "styled", {
  enumerable: true,
  get: function get() {
    return _styled.default;
  }
});
Object.defineProperty(exports, "useTheme", {
  enumerable: true,
  get: function get() {
    return _useTheme.default;
  }
});
Object.defineProperty(exports, "withStyles", {
  enumerable: true,
  get: function get() {
    return _withStyles.default;
  }
});
Object.defineProperty(exports, "withTheme", {
  enumerable: true,
  get: function get() {
    return _withTheme.default;
  }
});
Object.defineProperty(exports, "createGenerateClassName", {
  enumerable: true,
  get: function get() {
    return esm$1.createGenerateClassName;
  }
});
Object.defineProperty(exports, "jssPreset", {
  enumerable: true,
  get: function get() {
    return esm$1.jssPreset;
  }
});
Object.defineProperty(exports, "ServerStyleSheets", {
  enumerable: true,
  get: function get() {
    return esm$1.ServerStyleSheets;
  }
});
Object.defineProperty(exports, "StylesProvider", {
  enumerable: true,
  get: function get() {
    return esm$1.StylesProvider;
  }
});
Object.defineProperty(exports, "MuiThemeProvider", {
  enumerable: true,
  get: function get() {
    return esm$1.ThemeProvider;
  }
});
Object.defineProperty(exports, "ThemeProvider", {
  enumerable: true,
  get: function get() {
    return esm$1.ThemeProvider;
  }
});



Object.keys(colorManipulator).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return colorManipulator[key];
    }
  });
});

var _createMuiTheme = interopRequireDefault(createMuiTheme_1);

var _createMuiStrictModeTheme = interopRequireDefault(createMuiStrictModeTheme_1);

var _createStyles = interopRequireDefault(createStyles_1);

var _makeStyles = interopRequireDefault(makeStyles_1);

var _responsiveFontSizes = interopRequireDefault(responsiveFontSizes_1);

var _styled = interopRequireDefault(styled_1);



Object.keys(transitions).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return transitions[key];
    }
  });
});

var _useTheme = interopRequireDefault(useTheme_1);

var _withStyles = interopRequireDefault(withStyles_1);

var _withTheme = interopRequireDefault(withTheme_1);
});

var createMuiTheme = styles.createMuiTheme;
export { createMuiTheme };
