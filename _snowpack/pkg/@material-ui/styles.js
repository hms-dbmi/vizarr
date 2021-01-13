import '../common/_commonjsHelpers-37fa8da4.js';
import '../common/typeof-c65245d2.js';
import '../common/assertThisInitialized-87ceda02.js';
import { _ as _extends } from '../common/deepmerge-9adb393e.js';
import { r as react } from '../common/index-aae33e1a.js';
import '../common/index-c103191b.js';
import { u as useTheme, n as nested, T as ThemeContext } from '../common/withStyles-abfc6f73.js';
export { m as makeStyles, w as withStyles } from '../common/withStyles-abfc6f73.js';

function mergeOuterLocalTheme(outerTheme, localTheme) {
  if (typeof localTheme === 'function') {
    var mergedTheme = localTheme(outerTheme);

    return mergedTheme;
  }

  return _extends({}, outerTheme, localTheme);
}
/**
 * This component takes a `theme` prop.
 * It makes the `theme` available down the React tree thanks to React context.
 * This component should preferably be used at **the root of your component tree**.
 */


function ThemeProvider(props) {
  var children = props.children,
      localTheme = props.theme;
  var outerTheme = useTheme();

  var theme = react.useMemo(function () {
    var output = outerTheme === null ? localTheme : mergeOuterLocalTheme(outerTheme, localTheme);

    if (output != null) {
      output[nested] = outerTheme !== null;
    }

    return output;
  }, [localTheme, outerTheme]);
  return /*#__PURE__*/react.createElement(ThemeContext.Provider, {
    value: theme
  }, children);
}

export { ThemeProvider };
