import { _ as _extends } from './deepmerge-9adb393e.js';
import { c as createMuiTheme } from './createMuiTheme-0e5622a9.js';
import { w as withStyles$1 } from './withStyles-abfc6f73.js';

function toVal(mix) {
	var k, y, str='';

	if (typeof mix === 'string' || typeof mix === 'number') {
		str += mix;
	} else if (typeof mix === 'object') {
		if (Array.isArray(mix)) {
			for (k=0; k < mix.length; k++) {
				if (mix[k]) {
					if (y = toVal(mix[k])) {
						str && (str += ' ');
						str += y;
					}
				}
			}
		} else {
			for (k in mix) {
				if (mix[k]) {
					str && (str += ' ');
					str += k;
				}
			}
		}
	}

	return str;
}

function clsx () {
	var i=0, tmp, x, str='';
	while (i < arguments.length) {
		if (tmp = arguments[i++]) {
			if (x = toVal(tmp)) {
				str && (str += ' ');
				str += x;
			}
		}
	}
	return str;
}

var defaultTheme = createMuiTheme();

function withStyles(stylesOrCreator, options) {
  return withStyles$1(stylesOrCreator, _extends({
    defaultTheme: defaultTheme
  }, options));
}

export { clsx as c, defaultTheme as d, withStyles as w };
