import { p as process } from './process-2545f00a.js';

function createProxy(mapping) {
    return new Proxy(mapping, {
        set(target, key, value, _receiver) {
            return target.setItem(key, value);
        },
        get(target, key, _receiver) {
            return target.getItem(key);
        },
        deleteProperty(target, key) {
            return target.deleteItem(key);
        },
        has(target, key) {
            return target.containsItem(key);
        }
    });
}

/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */

function __awaiter(thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

function unwrapExports (x) {
	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
}

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var util = createCommonjsModule(function (module, exports) {
var __extends = (commonjsGlobal && commonjsGlobal.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Error thrown by validation. Besides an informative message, it includes the path to the
 * property which triggered the failure.
 */
var VError = /** @class */ (function (_super) {
    __extends(VError, _super);
    function VError(path, message) {
        var _this = _super.call(this, message) || this;
        _this.path = path;
        return _this;
    }
    return VError;
}(Error));
exports.VError = VError;
/**
 * Fast implementation of IContext used for first-pass validation. If that fails, we can validate
 * using DetailContext to collect error messages. That's faster for the common case when messages
 * normally pass validation.
 */
var NoopContext = /** @class */ (function () {
    function NoopContext() {
    }
    NoopContext.prototype.fail = function (relPath, message, score) {
        return false;
    };
    NoopContext.prototype.unionResolver = function () { return this; };
    NoopContext.prototype.createContext = function () { return this; };
    NoopContext.prototype.resolveUnion = function (ur) { };
    return NoopContext;
}());
exports.NoopContext = NoopContext;
/**
 * Complete implementation of IContext that collects meaningfull errors.
 */
var DetailContext = /** @class */ (function () {
    function DetailContext() {
        // Stack of property names and associated messages for reporting helpful error messages.
        this._propNames = [""];
        this._messages = [null];
        // Score is used to choose the best union member whose DetailContext to use for reporting.
        // Higher score means better match (or rather less severe mismatch).
        this._score = 0;
    }
    DetailContext.prototype.fail = function (relPath, message, score) {
        this._propNames.push(relPath);
        this._messages.push(message);
        this._score += score;
        return false;
    };
    DetailContext.prototype.unionResolver = function () {
        return new DetailUnionResolver();
    };
    DetailContext.prototype.resolveUnion = function (unionResolver) {
        var u = unionResolver;
        var best = null;
        for (var _i = 0, _a = u.contexts; _i < _a.length; _i++) {
            var ctx = _a[_i];
            if (!best || ctx._score >= best._score) {
                best = ctx;
            }
        }
        if (best && best._score > 0) {
            (_b = this._propNames).push.apply(_b, best._propNames);
            (_c = this._messages).push.apply(_c, best._messages);
        }
        var _b, _c;
    };
    DetailContext.prototype.getError = function (path) {
        var msgParts = [];
        for (var i = this._propNames.length - 1; i >= 0; i--) {
            var p = this._propNames[i];
            path += (typeof p === "number") ? "[" + p + "]" : (p ? "." + p : "");
            var m = this._messages[i];
            if (m) {
                msgParts.push(path + " " + m);
            }
        }
        return new VError(path, msgParts.join("; "));
    };
    DetailContext.prototype.getErrorDetail = function (path) {
        var details = [];
        for (var i = this._propNames.length - 1; i >= 0; i--) {
            var p = this._propNames[i];
            path += (typeof p === "number") ? "[" + p + "]" : (p ? "." + p : "");
            var message = this._messages[i];
            if (message) {
                details.push({ path: path, message: message });
            }
        }
        var detail = null;
        for (var i = details.length - 1; i >= 0; i--) {
            if (detail) {
                details[i].nested = [detail];
            }
            detail = details[i];
        }
        return detail;
    };
    return DetailContext;
}());
exports.DetailContext = DetailContext;
var DetailUnionResolver = /** @class */ (function () {
    function DetailUnionResolver() {
        this.contexts = [];
    }
    DetailUnionResolver.prototype.createContext = function () {
        var ctx = new DetailContext();
        this.contexts.push(ctx);
        return ctx;
    };
    return DetailUnionResolver;
}());
});

unwrapExports(util);
var util_1 = util.VError;
var util_2 = util.NoopContext;
var util_3 = util.DetailContext;

var types = createCommonjsModule(function (module, exports) {
/**
 * This module defines nodes used to define types and validations for objects and interfaces.
 */
// tslint:disable:no-shadowed-variable prefer-for-of
var __extends = (commonjsGlobal && commonjsGlobal.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });

/** Node that represents a type. */
var TType = /** @class */ (function () {
    function TType() {
    }
    return TType;
}());
exports.TType = TType;
/** Parses a type spec into a TType node. */
function parseSpec(typeSpec) {
    return typeof typeSpec === "string" ? name(typeSpec) : typeSpec;
}
function getNamedType(suite, name) {
    var ttype = suite[name];
    if (!ttype) {
        throw new Error("Unknown type " + name);
    }
    return ttype;
}
/**
 * Defines a type name, either built-in, or defined in this suite. It can typically be included in
 * the specs as just a plain string.
 */
function name(value) { return new TName(value); }
exports.name = name;
var TName = /** @class */ (function (_super) {
    __extends(TName, _super);
    function TName(name) {
        var _this = _super.call(this) || this;
        _this.name = name;
        _this._failMsg = "is not a " + name;
        return _this;
    }
    TName.prototype.getChecker = function (suite, strict) {
        var _this = this;
        var ttype = getNamedType(suite, this.name);
        var checker = ttype.getChecker(suite, strict);
        if (ttype instanceof BasicType || ttype instanceof TName) {
            return checker;
        }
        // For complex types, add an additional "is not a <Type>" message on failure.
        return function (value, ctx) { return checker(value, ctx) ? true : ctx.fail(null, _this._failMsg, 0); };
    };
    return TName;
}(TType));
exports.TName = TName;
/**
 * Defines a literal value, e.g. lit('hello') or lit(123).
 */
function lit(value) { return new TLiteral(value); }
exports.lit = lit;
var TLiteral = /** @class */ (function (_super) {
    __extends(TLiteral, _super);
    function TLiteral(value) {
        var _this = _super.call(this) || this;
        _this.value = value;
        _this.name = JSON.stringify(value);
        _this._failMsg = "is not " + _this.name;
        return _this;
    }
    TLiteral.prototype.getChecker = function (suite, strict) {
        var _this = this;
        return function (value, ctx) { return (value === _this.value) ? true : ctx.fail(null, _this._failMsg, -1); };
    };
    return TLiteral;
}(TType));
exports.TLiteral = TLiteral;
/**
 * Defines an array type, e.g. array('number').
 */
function array(typeSpec) { return new TArray(parseSpec(typeSpec)); }
exports.array = array;
var TArray = /** @class */ (function (_super) {
    __extends(TArray, _super);
    function TArray(ttype) {
        var _this = _super.call(this) || this;
        _this.ttype = ttype;
        return _this;
    }
    TArray.prototype.getChecker = function (suite, strict) {
        var itemChecker = this.ttype.getChecker(suite, strict);
        return function (value, ctx) {
            if (!Array.isArray(value)) {
                return ctx.fail(null, "is not an array", 0);
            }
            for (var i = 0; i < value.length; i++) {
                var ok = itemChecker(value[i], ctx);
                if (!ok) {
                    return ctx.fail(i, null, 1);
                }
            }
            return true;
        };
    };
    return TArray;
}(TType));
exports.TArray = TArray;
/**
 * Defines a tuple type, e.g. tuple('string', 'number').
 */
function tuple() {
    var typeSpec = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        typeSpec[_i] = arguments[_i];
    }
    return new TTuple(typeSpec.map(function (t) { return parseSpec(t); }));
}
exports.tuple = tuple;
var TTuple = /** @class */ (function (_super) {
    __extends(TTuple, _super);
    function TTuple(ttypes) {
        var _this = _super.call(this) || this;
        _this.ttypes = ttypes;
        return _this;
    }
    TTuple.prototype.getChecker = function (suite, strict) {
        var itemCheckers = this.ttypes.map(function (t) { return t.getChecker(suite, strict); });
        var checker = function (value, ctx) {
            if (!Array.isArray(value)) {
                return ctx.fail(null, "is not an array", 0);
            }
            for (var i = 0; i < itemCheckers.length; i++) {
                var ok = itemCheckers[i](value[i], ctx);
                if (!ok) {
                    return ctx.fail(i, null, 1);
                }
            }
            return true;
        };
        if (!strict) {
            return checker;
        }
        return function (value, ctx) {
            if (!checker(value, ctx)) {
                return false;
            }
            return value.length <= itemCheckers.length ? true :
                ctx.fail(itemCheckers.length, "is extraneous", 2);
        };
    };
    return TTuple;
}(TType));
exports.TTuple = TTuple;
/**
 * Defines a union type, e.g. union('number', 'null').
 */
function union() {
    var typeSpec = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        typeSpec[_i] = arguments[_i];
    }
    return new TUnion(typeSpec.map(function (t) { return parseSpec(t); }));
}
exports.union = union;
var TUnion = /** @class */ (function (_super) {
    __extends(TUnion, _super);
    function TUnion(ttypes) {
        var _this = _super.call(this) || this;
        _this.ttypes = ttypes;
        var names = ttypes.map(function (t) { return t instanceof TName || t instanceof TLiteral ? t.name : null; })
            .filter(function (n) { return n; });
        var otherTypes = ttypes.length - names.length;
        if (names.length) {
            if (otherTypes > 0) {
                names.push(otherTypes + " more");
            }
            _this._failMsg = "is none of " + names.join(", ");
        }
        else {
            _this._failMsg = "is none of " + otherTypes + " types";
        }
        return _this;
    }
    TUnion.prototype.getChecker = function (suite, strict) {
        var _this = this;
        var itemCheckers = this.ttypes.map(function (t) { return t.getChecker(suite, strict); });
        return function (value, ctx) {
            var ur = ctx.unionResolver();
            for (var i = 0; i < itemCheckers.length; i++) {
                var ok = itemCheckers[i](value, ur.createContext());
                if (ok) {
                    return true;
                }
            }
            ctx.resolveUnion(ur);
            return ctx.fail(null, _this._failMsg, 0);
        };
    };
    return TUnion;
}(TType));
exports.TUnion = TUnion;
/**
 * Defines an enum type, e.g. enum({'A': 1, 'B': 2}).
 */
function enumtype(values) {
    return new TEnumType(values);
}
exports.enumtype = enumtype;
var TEnumType = /** @class */ (function (_super) {
    __extends(TEnumType, _super);
    function TEnumType(members) {
        var _this = _super.call(this) || this;
        _this.members = members;
        _this.validValues = new Set();
        _this._failMsg = "is not a valid enum value";
        _this.validValues = new Set(Object.keys(members).map(function (name) { return members[name]; }));
        return _this;
    }
    TEnumType.prototype.getChecker = function (suite, strict) {
        var _this = this;
        return function (value, ctx) {
            return (_this.validValues.has(value) ? true : ctx.fail(null, _this._failMsg, 0));
        };
    };
    return TEnumType;
}(TType));
exports.TEnumType = TEnumType;
/**
 * Defines a literal enum value, such as Direction.Up, specified as enumlit("Direction", "Up").
 */
function enumlit(name, prop) {
    return new TEnumLiteral(name, prop);
}
exports.enumlit = enumlit;
var TEnumLiteral = /** @class */ (function (_super) {
    __extends(TEnumLiteral, _super);
    function TEnumLiteral(enumName, prop) {
        var _this = _super.call(this) || this;
        _this.enumName = enumName;
        _this.prop = prop;
        _this._failMsg = "is not " + enumName + "." + prop;
        return _this;
    }
    TEnumLiteral.prototype.getChecker = function (suite, strict) {
        var _this = this;
        var ttype = getNamedType(suite, this.enumName);
        if (!(ttype instanceof TEnumType)) {
            throw new Error("Type " + this.enumName + " used in enumlit is not an enum type");
        }
        var val = ttype.members[this.prop];
        if (!ttype.members.hasOwnProperty(this.prop)) {
            throw new Error("Unknown value " + this.enumName + "." + this.prop + " used in enumlit");
        }
        return function (value, ctx) { return (value === val) ? true : ctx.fail(null, _this._failMsg, -1); };
    };
    return TEnumLiteral;
}(TType));
exports.TEnumLiteral = TEnumLiteral;
function makeIfaceProps(props) {
    return Object.keys(props).map(function (name) { return makeIfaceProp(name, props[name]); });
}
function makeIfaceProp(name, prop) {
    return prop instanceof TOptional ?
        new TProp(name, prop.ttype, true) :
        new TProp(name, parseSpec(prop), false);
}
/**
 * Defines an interface. The first argument is an array of interfaces that it extends, and the
 * second is an array of properties.
 */
function iface(bases, props) {
    return new TIface(bases, makeIfaceProps(props));
}
exports.iface = iface;
var TIface = /** @class */ (function (_super) {
    __extends(TIface, _super);
    function TIface(bases, props) {
        var _this = _super.call(this) || this;
        _this.bases = bases;
        _this.props = props;
        _this.propSet = new Set(props.map(function (p) { return p.name; }));
        return _this;
    }
    TIface.prototype.getChecker = function (suite, strict) {
        var _this = this;
        var baseCheckers = this.bases.map(function (b) { return getNamedType(suite, b).getChecker(suite, strict); });
        var propCheckers = this.props.map(function (prop) { return prop.ttype.getChecker(suite, strict); });
        var testCtx = new util.NoopContext();
        // Consider a prop required if it's not optional AND does not allow for undefined as a value.
        var isPropRequired = this.props.map(function (prop, i) {
            return !prop.isOpt && !propCheckers[i](undefined, testCtx);
        });
        var checker = function (value, ctx) {
            if (typeof value !== "object" || value === null) {
                return ctx.fail(null, "is not an object", 0);
            }
            for (var i = 0; i < baseCheckers.length; i++) {
                if (!baseCheckers[i](value, ctx)) {
                    return false;
                }
            }
            for (var i = 0; i < propCheckers.length; i++) {
                var name_1 = _this.props[i].name;
                var v = value[name_1];
                if (v === undefined) {
                    if (isPropRequired[i]) {
                        return ctx.fail(name_1, "is missing", 1);
                    }
                }
                else {
                    var ok = propCheckers[i](v, ctx);
                    if (!ok) {
                        return ctx.fail(name_1, null, 1);
                    }
                }
            }
            return true;
        };
        if (!strict) {
            return checker;
        }
        // In strict mode, check also for unknown enumerable properties.
        return function (value, ctx) {
            if (!checker(value, ctx)) {
                return false;
            }
            for (var prop in value) {
                if (!_this.propSet.has(prop)) {
                    return ctx.fail(prop, "is extraneous", 2);
                }
            }
            return true;
        };
    };
    return TIface;
}(TType));
exports.TIface = TIface;
/**
 * Defines an optional property on an interface.
 */
function opt(typeSpec) { return new TOptional(parseSpec(typeSpec)); }
exports.opt = opt;
var TOptional = /** @class */ (function (_super) {
    __extends(TOptional, _super);
    function TOptional(ttype) {
        var _this = _super.call(this) || this;
        _this.ttype = ttype;
        return _this;
    }
    TOptional.prototype.getChecker = function (suite, strict) {
        var itemChecker = this.ttype.getChecker(suite, strict);
        return function (value, ctx) {
            return value === undefined || itemChecker(value, ctx);
        };
    };
    return TOptional;
}(TType));
exports.TOptional = TOptional;
/**
 * Defines a property in an interface.
 */
var TProp = /** @class */ (function () {
    function TProp(name, ttype, isOpt) {
        this.name = name;
        this.ttype = ttype;
        this.isOpt = isOpt;
    }
    return TProp;
}());
exports.TProp = TProp;
/**
 * Defines a function. The first argument declares the function's return type, the rest declare
 * its parameters.
 */
function func(resultSpec) {
    var params = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        params[_i - 1] = arguments[_i];
    }
    return new TFunc(new TParamList(params), parseSpec(resultSpec));
}
exports.func = func;
var TFunc = /** @class */ (function (_super) {
    __extends(TFunc, _super);
    function TFunc(paramList, result) {
        var _this = _super.call(this) || this;
        _this.paramList = paramList;
        _this.result = result;
        return _this;
    }
    TFunc.prototype.getChecker = function (suite, strict) {
        return function (value, ctx) {
            return typeof value === "function" ? true : ctx.fail(null, "is not a function", 0);
        };
    };
    return TFunc;
}(TType));
exports.TFunc = TFunc;
/**
 * Defines a function parameter.
 */
function param(name, typeSpec, isOpt) {
    return new TParam(name, parseSpec(typeSpec), Boolean(isOpt));
}
exports.param = param;
var TParam = /** @class */ (function () {
    function TParam(name, ttype, isOpt) {
        this.name = name;
        this.ttype = ttype;
        this.isOpt = isOpt;
    }
    return TParam;
}());
exports.TParam = TParam;
/**
 * Defines a function parameter list.
 */
var TParamList = /** @class */ (function (_super) {
    __extends(TParamList, _super);
    function TParamList(params) {
        var _this = _super.call(this) || this;
        _this.params = params;
        return _this;
    }
    TParamList.prototype.getChecker = function (suite, strict) {
        var _this = this;
        var itemCheckers = this.params.map(function (t) { return t.ttype.getChecker(suite, strict); });
        var testCtx = new util.NoopContext();
        var isParamRequired = this.params.map(function (param, i) {
            return !param.isOpt && !itemCheckers[i](undefined, testCtx);
        });
        var checker = function (value, ctx) {
            if (!Array.isArray(value)) {
                return ctx.fail(null, "is not an array", 0);
            }
            for (var i = 0; i < itemCheckers.length; i++) {
                var p = _this.params[i];
                if (value[i] === undefined) {
                    if (isParamRequired[i]) {
                        return ctx.fail(p.name, "is missing", 1);
                    }
                }
                else {
                    var ok = itemCheckers[i](value[i], ctx);
                    if (!ok) {
                        return ctx.fail(p.name, null, 1);
                    }
                }
            }
            return true;
        };
        if (!strict) {
            return checker;
        }
        return function (value, ctx) {
            if (!checker(value, ctx)) {
                return false;
            }
            return value.length <= itemCheckers.length ? true :
                ctx.fail(itemCheckers.length, "is extraneous", 2);
        };
    };
    return TParamList;
}(TType));
exports.TParamList = TParamList;
/**
 * Single TType implementation for all basic built-in types.
 */
var BasicType = /** @class */ (function (_super) {
    __extends(BasicType, _super);
    function BasicType(validator, message) {
        var _this = _super.call(this) || this;
        _this.validator = validator;
        _this.message = message;
        return _this;
    }
    BasicType.prototype.getChecker = function (suite, strict) {
        var _this = this;
        return function (value, ctx) { return _this.validator(value) ? true : ctx.fail(null, _this.message, 0); };
    };
    return BasicType;
}(TType));
exports.BasicType = BasicType;
/**
 * Defines the suite of basic types.
 */
exports.basicTypes = {
    any: new BasicType(function (v) { return true; }, "is invalid"),
    number: new BasicType(function (v) { return (typeof v === "number"); }, "is not a number"),
    object: new BasicType(function (v) { return (typeof v === "object" && v); }, "is not an object"),
    boolean: new BasicType(function (v) { return (typeof v === "boolean"); }, "is not a boolean"),
    string: new BasicType(function (v) { return (typeof v === "string"); }, "is not a string"),
    symbol: new BasicType(function (v) { return (typeof v === "symbol"); }, "is not a symbol"),
    void: new BasicType(function (v) { return (v == null); }, "is not void"),
    undefined: new BasicType(function (v) { return (v === undefined); }, "is not undefined"),
    null: new BasicType(function (v) { return (v === null); }, "is not null"),
    never: new BasicType(function (v) { return false; }, "is unexpected"),
    Date: new BasicType(getIsNativeChecker("[object Date]"), "is not a Date"),
    RegExp: new BasicType(getIsNativeChecker("[object RegExp]"), "is not a RegExp"),
};
// This approach for checking native object types mirrors that of lodash. Its advantage over
// `isinstance` is that it can still return true for native objects created in different JS
// execution environments.
var nativeToString = Object.prototype.toString;
function getIsNativeChecker(tag) {
    return function (v) { return typeof v === "object" && v && nativeToString.call(v) === tag; };
}
if (typeof Buffer !== "undefined") {
    exports.basicTypes.Buffer = new BasicType(function (v) { return Buffer.isBuffer(v); }, "is not a Buffer");
}
var _loop_1 = function (array_1) {
    exports.basicTypes[array_1.name] = new BasicType(function (v) { return (v instanceof array_1); }, "is not a " + array_1.name);
};
// Support typed arrays of various flavors
for (var _i = 0, _a = [Int8Array, Uint8Array, Uint8ClampedArray, Int16Array, Uint16Array,
    Int32Array, Uint32Array, Float32Array, Float64Array, ArrayBuffer]; _i < _a.length; _i++) {
    var array_1 = _a[_i];
    _loop_1(array_1);
}
});

unwrapExports(types);
var types_1 = types.TType;
var types_2 = types.name;
var types_3 = types.TName;
var types_4 = types.lit;
var types_5 = types.TLiteral;
var types_6 = types.array;
var types_7 = types.TArray;
var types_8 = types.tuple;
var types_9 = types.TTuple;
var types_10 = types.union;
var types_11 = types.TUnion;
var types_12 = types.enumtype;
var types_13 = types.TEnumType;
var types_14 = types.enumlit;
var types_15 = types.TEnumLiteral;
var types_16 = types.iface;
var types_17 = types.TIface;
var types_18 = types.opt;
var types_19 = types.TOptional;
var types_20 = types.TProp;
var types_21 = types.func;
var types_22 = types.TFunc;
var types_23 = types.param;
var types_24 = types.TParam;
var types_25 = types.TParamList;
var types_26 = types.BasicType;
var types_27 = types.basicTypes;

var dist = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });


/**
 * Export functions used to define interfaces.
 */
var types_2 = types;
exports.TArray = types_2.TArray;
exports.TEnumType = types_2.TEnumType;
exports.TEnumLiteral = types_2.TEnumLiteral;
exports.TFunc = types_2.TFunc;
exports.TIface = types_2.TIface;
exports.TLiteral = types_2.TLiteral;
exports.TName = types_2.TName;
exports.TOptional = types_2.TOptional;
exports.TParam = types_2.TParam;
exports.TParamList = types_2.TParamList;
exports.TProp = types_2.TProp;
exports.TTuple = types_2.TTuple;
exports.TType = types_2.TType;
exports.TUnion = types_2.TUnion;
exports.array = types_2.array;
exports.enumlit = types_2.enumlit;
exports.enumtype = types_2.enumtype;
exports.func = types_2.func;
exports.iface = types_2.iface;
exports.lit = types_2.lit;
exports.name = types_2.name;
exports.opt = types_2.opt;
exports.param = types_2.param;
exports.tuple = types_2.tuple;
exports.union = types_2.union;
exports.BasicType = types_2.BasicType;
/**
 * Takes one of more type suites (e.g. a module generated by `ts-interface-builder`), and combines
 * them into a suite of interface checkers. If a type is used by name, that name should be present
 * among the passed-in type suites.
 *
 * The returned object maps type names to Checker objects.
 */
function createCheckers() {
    var typeSuite = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        typeSuite[_i] = arguments[_i];
    }
    var fullSuite = Object.assign.apply(Object, [{}, types.basicTypes].concat(typeSuite));
    var checkers = {};
    for (var _a = 0, typeSuite_1 = typeSuite; _a < typeSuite_1.length; _a++) {
        var suite_1 = typeSuite_1[_a];
        for (var _b = 0, _c = Object.keys(suite_1); _b < _c.length; _b++) {
            var name = _c[_b];
            checkers[name] = new Checker(fullSuite, suite_1[name]);
        }
    }
    return checkers;
}
exports.createCheckers = createCheckers;
/**
 * Checker implements validation of objects, and also includes accessors to validate method calls.
 * Checkers should be created using `createCheckers()`.
 */
var Checker = /** @class */ (function () {
    // Create checkers by using `createCheckers()` function.
    function Checker(suite, ttype, _path) {
        if (_path === void 0) { _path = 'value'; }
        this.suite = suite;
        this.ttype = ttype;
        this._path = _path;
        this.props = new Map();
        if (ttype instanceof types.TIface) {
            for (var _i = 0, _a = ttype.props; _i < _a.length; _i++) {
                var p = _a[_i];
                this.props.set(p.name, p.ttype);
            }
        }
        this.checkerPlain = this.ttype.getChecker(suite, false);
        this.checkerStrict = this.ttype.getChecker(suite, true);
    }
    /**
     * Set the path to report in errors, instead of the default "value". (E.g. if the Checker is for
     * a "person" interface, set path to "person" to report e.g. "person.name is not a string".)
     */
    Checker.prototype.setReportedPath = function (path) {
        this._path = path;
    };
    /**
     * Check that the given value satisfies this checker's type, or throw Error.
     */
    Checker.prototype.check = function (value) { return this._doCheck(this.checkerPlain, value); };
    /**
     * A fast check for whether or not the given value satisfies this Checker's type. This returns
     * true or false, does not produce an error message, and is fast both on success and on failure.
     */
    Checker.prototype.test = function (value) {
        return this.checkerPlain(value, new util.NoopContext());
    };
    /**
     * Returns an error object describing the errors if the given value does not satisfy this
     * Checker's type, or null if it does.
     */
    Checker.prototype.validate = function (value) {
        return this._doValidate(this.checkerPlain, value);
    };
    /**
     * Check that the given value satisfies this checker's type strictly. This checks that objects
     * and tuples have no extra members. Note that this prevents backward compatibility, so usually
     * a plain check() is more appropriate.
     */
    Checker.prototype.strictCheck = function (value) { return this._doCheck(this.checkerStrict, value); };
    /**
     * A fast strict check for whether or not the given value satisfies this Checker's type. Returns
     * true or false, does not produce an error message, and is fast both on success and on failure.
     */
    Checker.prototype.strictTest = function (value) {
        return this.checkerStrict(value, new util.NoopContext());
    };
    /**
     * Returns an error object describing the errors if the given value does not satisfy this
     * Checker's type strictly, or null if it does.
     */
    Checker.prototype.strictValidate = function (value) {
        return this._doValidate(this.checkerStrict, value);
    };
    /**
     * If this checker is for an interface, returns a Checker for the type required for the given
     * property of this interface.
     */
    Checker.prototype.getProp = function (prop) {
        var ttype = this.props.get(prop);
        if (!ttype) {
            throw new Error("Type has no property " + prop);
        }
        return new Checker(this.suite, ttype, this._path + "." + prop);
    };
    /**
     * If this checker is for an interface, returns a Checker for the argument-list required to call
     * the given method of this interface. E.g. if this Checker is for the interface:
     *    interface Foo {
     *      find(s: string, pos?: number): number;
     *    }
     * Then methodArgs("find").check(...) will succeed for ["foo"] and ["foo", 3], but not for [17].
     */
    Checker.prototype.methodArgs = function (methodName) {
        var tfunc = this._getMethod(methodName);
        return new Checker(this.suite, tfunc.paramList);
    };
    /**
     * If this checker is for an interface, returns a Checker for the return value of the given
     * method of this interface.
     */
    Checker.prototype.methodResult = function (methodName) {
        var tfunc = this._getMethod(methodName);
        return new Checker(this.suite, tfunc.result);
    };
    /**
     * If this checker is for a function, returns a Checker for its argument-list.
     */
    Checker.prototype.getArgs = function () {
        if (!(this.ttype instanceof types.TFunc)) {
            throw new Error("getArgs() applied to non-function");
        }
        return new Checker(this.suite, this.ttype.paramList);
    };
    /**
     * If this checker is for a function, returns a Checker for its result.
     */
    Checker.prototype.getResult = function () {
        if (!(this.ttype instanceof types.TFunc)) {
            throw new Error("getResult() applied to non-function");
        }
        return new Checker(this.suite, this.ttype.result);
    };
    /**
     * Return the type for which this is a checker.
     */
    Checker.prototype.getType = function () {
        return this.ttype;
    };
    /**
     * Actual implementation of check() and strictCheck().
     */
    Checker.prototype._doCheck = function (checkerFunc, value) {
        var noopCtx = new util.NoopContext();
        if (!checkerFunc(value, noopCtx)) {
            var detailCtx = new util.DetailContext();
            checkerFunc(value, detailCtx);
            throw detailCtx.getError(this._path);
        }
    };
    Checker.prototype._doValidate = function (checkerFunc, value) {
        var noopCtx = new util.NoopContext();
        if (checkerFunc(value, noopCtx)) {
            return null;
        }
        var detailCtx = new util.DetailContext();
        checkerFunc(value, detailCtx);
        return detailCtx.getErrorDetail(this._path);
    };
    Checker.prototype._getMethod = function (methodName) {
        var ttype = this.props.get(methodName);
        if (!ttype) {
            throw new Error("Type has no property " + methodName);
        }
        if (!(ttype instanceof types.TFunc)) {
            throw new Error("Property " + methodName + " is not a method");
        }
        return ttype;
    };
    return Checker;
}());
exports.Checker = Checker;
});

unwrapExports(dist);
var dist_1 = dist.TArray;
var dist_2 = dist.TEnumType;
var dist_3 = dist.TEnumLiteral;
var dist_4 = dist.TFunc;
var dist_5 = dist.TIface;
var dist_6 = dist.TLiteral;
var dist_7 = dist.TName;
var dist_8 = dist.TOptional;
var dist_9 = dist.TParam;
var dist_10 = dist.TParamList;
var dist_11 = dist.TProp;
var dist_12 = dist.TTuple;
var dist_13 = dist.TType;
var dist_14 = dist.TUnion;
var dist_15 = dist.array;
var dist_16 = dist.enumlit;
var dist_17 = dist.enumtype;
var dist_18 = dist.func;
var dist_19 = dist.iface;
var dist_20 = dist.lit;
var dist_21 = dist.name;
var dist_22 = dist.opt;
var dist_23 = dist.param;
var dist_24 = dist.tuple;
var dist_25 = dist.union;
var dist_26 = dist.BasicType;
var dist_27 = dist.createCheckers;
var dist_28 = dist.Checker;

/**
 * This module was automatically generated by `ts-interface-builder`
 */
// tslint:disable:object-literal-key-quotes
const ZarrMetadataType = dist_25("ZarrArrayMetadata", "ZarrGroupMetadata");
const UserAttributes = dist_21("object");
const FillType = dist_25("number", dist_20("NaN"), dist_20("Infinity"), dist_20("-Infinity"), "null");
const Order = dist_25(dist_20("C"), dist_20("F"));
const DtypeString = dist_25(dist_20("<u1"), dist_20("<i1"), dist_20("<i4"), dist_20("<f4"), dist_20("<f8"), dist_20("<b"), dist_20("<B"));
const ChunksArgument = dist_25("number", dist_15(dist_25("number", "null")), "boolean", "null");
const Compressor = dist_19([], {
    "id": "string",
});
const Filter = dist_19([], {
    "id": "string",
});
const ZarrArrayMetadata = dist_19([], {
    "zarr_format": dist_25(dist_20(1), dist_20(2)),
    "shape": dist_15("number"),
    "chunks": dist_15("number"),
    "dtype": "DtypeString",
    "compressor": dist_25("null", dist_19([], {
        "id": "string",
    })),
    "fill_value": "FillType",
    "order": "Order",
    "filters": dist_25("null", dist_15("Filter")),
});
const ZarrGroupMetadata = dist_19([], {
    "zarr_format": dist_25(dist_20(1), dist_20(2)),
});
const exportedTypeSuite = {
    ZarrMetadataType,
    UserAttributes,
    FillType,
    Order,
    DtypeString,
    ChunksArgument,
    Compressor,
    Filter,
    ZarrArrayMetadata,
    ZarrGroupMetadata,
};

// Custom error messages, note we have to patch the prototype of the
// errors to fix `instanceof` calls, see:
// https://github.com/Microsoft/TypeScript/wiki/Breaking-Changes#extending-built-ins-like-error-array-and-map-may-no-longer-work
class ContainsArrayError extends Error {
    constructor(path) {
        super(`path ${path} contains an array`);
        Object.setPrototypeOf(this, ContainsArrayError.prototype);
    }
}
class ContainsGroupError extends Error {
    constructor(path) {
        super(`path ${path} contains a group`);
        Object.setPrototypeOf(this, ContainsGroupError.prototype);
    }
}
class ArrayNotFoundError extends Error {
    constructor(path) {
        super(`array not found at path ${path}`);
        Object.setPrototypeOf(this, ArrayNotFoundError.prototype);
    }
}
class PermissionError extends Error {
    constructor(message) {
        super(message);
        Object.setPrototypeOf(this, PermissionError.prototype);
    }
}
class KeyError extends Error {
    constructor(key) {
        super(`key ${key} not present`);
        Object.setPrototypeOf(this, KeyError.prototype);
    }
}
class TooManyIndicesError extends RangeError {
    constructor(selection, shape) {
        super(`too many indices for array; expected ${shape.length}, got ${selection.length}`);
        Object.setPrototypeOf(this, TooManyIndicesError.prototype);
    }
}
class BoundsCheckError extends RangeError {
    constructor(message) {
        super(message);
        Object.setPrototypeOf(this, BoundsCheckError.prototype);
    }
}
class InvalidSliceError extends RangeError {
    constructor(from, to, stepSize, reason) {
        super(`slice arguments slice(${from}, ${to}, ${stepSize}) invalid: ${reason}`);
        Object.setPrototypeOf(this, InvalidSliceError.prototype);
    }
}
class NegativeStepError extends Error {
    constructor() {
        super(`Negative step size is not supported when indexing.`);
        Object.setPrototypeOf(this, NegativeStepError.prototype);
    }
}
class ValueError extends Error {
    constructor(message) {
        super(message);
        Object.setPrototypeOf(this, ValueError.prototype);
    }
}
class HTTPError extends Error {
    constructor(code) {
        super(code);
        Object.setPrototypeOf(this, HTTPError.prototype);
    }
}

function slice(start, stop = undefined, step = null) {
    // tslint:disable-next-line: strict-type-predicates
    if (start === undefined) { // Not possible in typescript
        throw new InvalidSliceError(start, stop, step, "The first argument must not be undefined");
    }
    if ((typeof start === "string" && start !== ":") || (typeof stop === "string" && stop !== ":")) { // Note in typescript this will never happen with type checking.
        throw new InvalidSliceError(start, stop, step, "Arguments can only be integers, \":\" or null");
    }
    // slice(5) === slice(null, 5)
    if (stop === undefined) {
        stop = start;
        start = null;
    }
    // if (start !== null && stop !== null && start > stop) {
    //     throw new InvalidSliceError(start, stop, step, "to is higher than from");
    // }
    return {
        start: start === ":" ? null : start,
        stop: stop === ":" ? null : stop,
        step,
        _slice: true,
    };
}
/**
 * Port of adjustIndices
 * https://github.com/python/cpython/blob/master/Objects/sliceobject.c#L243
 */
function adjustIndices(start, stop, step, length) {
    if (start < 0) {
        start += length;
        if (start < 0) {
            start = (step < 0) ? -1 : 0;
        }
    }
    else if (start >= length) {
        start = (step < 0) ? length - 1 : length;
    }
    if (stop < 0) {
        stop += length;
        if (stop < 0) {
            stop = (step < 0) ? -1 : 0;
        }
    }
    else if (stop >= length) {
        stop = (step < 0) ? length - 1 : length;
    }
    if (step < 0) {
        if (stop < start) {
            const length = Math.floor((start - stop - 1) / (-step) + 1);
            return [start, stop, step, length];
        }
    }
    else {
        if (start < stop) {
            const length = Math.floor((stop - start - 1) / step + 1);
            return [start, stop, step, length];
        }
    }
    return [start, stop, step, 0];
}
/**
 * Port of slice.indices(n) and PySlice_Unpack
 * https://github.com/python/cpython/blob/master/Objects/sliceobject.c#L166
 *  https://github.com/python/cpython/blob/master/Objects/sliceobject.c#L198
 *
 * Behaviour might be slightly different as it's a weird hybrid implementation.
 */
function sliceIndices(slice, length) {
    let start;
    let stop;
    let step;
    if (slice.step === null) {
        step = 1;
    }
    else {
        step = slice.step;
    }
    if (slice.start === null) {
        start = step < 0 ? Number.MAX_SAFE_INTEGER : 0;
    }
    else {
        start = slice.start;
        if (start < 0) {
            start += length;
        }
    }
    if (slice.stop === null) {
        stop = step < 0 ? -Number.MAX_SAFE_INTEGER : Number.MAX_SAFE_INTEGER;
    }
    else {
        stop = slice.stop;
        if (stop < 0) {
            stop += length;
        }
    }
    // This clips out of bounds slices
    const s = adjustIndices(start, stop, step, length);
    start = s[0];
    stop = s[1];
    step = s[2];
    // The output length
    length = s[3];
    // With out of bounds slicing these two assertions are not useful.
    // if (stop > length) throw new Error("Stop greater than length");
    // if (start >= length) throw new Error("Start greater than or equal to length");
    if (step === 0)
        throw new Error("Step size 0 is invalid");
    return [start, stop, step, length];
}

function ensureArray(selection) {
    if (!Array.isArray(selection)) {
        return [selection];
    }
    return selection;
}
function checkSelectionLength(selection, shape) {
    if (selection.length > shape.length) {
        throw new TooManyIndicesError(selection, shape);
    }
}
/**
 * Returns both the sliceIndices per dimension and the output shape after slicing.
 */
function selectionToSliceIndices(selection, shape) {
    const sliceIndicesResult = [];
    const outShape = [];
    for (let i = 0; i < selection.length; i++) {
        const s = selection[i];
        if (typeof s === "number") {
            sliceIndicesResult.push(s);
        }
        else {
            const x = sliceIndices(s, shape[i]);
            const dimLength = x[3];
            outShape.push(dimLength);
            sliceIndicesResult.push(x);
        }
    }
    return [sliceIndicesResult, outShape];
}
/**
 * This translates "...", ":", null into a list of slices or non-negative integer selections of length shape
 */
function normalizeArraySelection(selection, shape, convertIntegerSelectionToSlices = false) {
    selection = replaceEllipsis(selection, shape);
    for (let i = 0; i < selection.length; i++) {
        const dimSelection = selection[i];
        if (typeof dimSelection === "number") {
            if (convertIntegerSelectionToSlices) {
                selection[i] = slice(dimSelection, dimSelection + 1, 1);
            }
            else {
                selection[i] = normalizeIntegerSelection(dimSelection, shape[i]);
            }
        }
        else if (isIntegerArray(dimSelection)) {
            throw new TypeError("Integer array selections are not supported (yet)");
        }
        else if (dimSelection === ":" || dimSelection === null) {
            selection[i] = slice(null, null, 1);
        }
    }
    return selection;
}
function replaceEllipsis(selection, shape) {
    selection = ensureArray(selection);
    let ellipsisIndex = -1;
    let numEllipsis = 0;
    for (let i = 0; i < selection.length; i++) {
        if (selection[i] === "...") {
            ellipsisIndex = i;
            numEllipsis += 1;
        }
    }
    if (numEllipsis > 1) {
        throw new RangeError("an index can only have a single ellipsis ('...')");
    }
    if (numEllipsis === 1) {
        // count how many items to left and right of ellipsis
        const numItemsLeft = ellipsisIndex;
        const numItemsRight = selection.length - (numItemsLeft + 1);
        const numItems = selection.length - 1; // All non-ellipsis items
        if (numItems >= shape.length) {
            // Ellipsis does nothing, just remove it
            selection = selection.filter((x) => x !== "...");
        }
        else {
            // Replace ellipsis with as many slices are needed for number of dims
            const numNewItems = shape.length - numItems;
            let newItem = selection.slice(0, numItemsLeft).concat(new Array(numNewItems).fill(null));
            if (numItemsRight > 0) {
                newItem = newItem.concat(selection.slice(selection.length - numItemsRight));
            }
            selection = newItem;
        }
    }
    // Fill out selection if not completely specified
    if (selection.length < shape.length) {
        const numMissing = shape.length - selection.length;
        selection = selection.concat(new Array(numMissing).fill(null));
    }
    checkSelectionLength(selection, shape);
    return selection;
}
function normalizeIntegerSelection(dimSelection, dimLength) {
    // Note: Maybe we should convert to integer or warn if dimSelection is not an integer
    // handle wraparound
    if (dimSelection < 0) {
        dimSelection = dimLength + dimSelection;
    }
    // handle out of bounds
    if (dimSelection >= dimLength || dimSelection < 0) {
        throw new BoundsCheckError(`index out of bounds for dimension with length ${dimLength}`);
    }
    return dimSelection;
}
function isInteger(s) {
    return typeof s === "number";
}
function isIntegerArray(s) {
    if (!Array.isArray(s)) {
        return false;
    }
    for (const e of s) {
        if (typeof e !== "number") {
            return false;
        }
    }
    return true;
}
function isSlice(s) {
    if (s !== null && s["_slice"] === true) {
        return true;
    }
    return false;
}
function isContiguousSlice(s) {
    return isSlice(s) && (s.step === null || s.step === 1);
}
function isContiguousSelection(selection) {
    selection = ensureArray(selection);
    for (let i = 0; i < selection.length; i++) {
        const s = selection[i];
        if (!(isIntegerArray(s) || isContiguousSlice(s) || s === "...")) {
            return false;
        }
    }
    return true;
}
function* product(...iterables) {
    if (iterables.length === 0) {
        return;
    }
    // make a list of iterators from the iterables
    const iterators = iterables.map(it => it());
    const results = iterators.map(it => it.next());
    // Disabled to allow empty inputs
    // if (results.some(r => r.done)) {
    //     throw new Error("Input contains an empty iterator.");
    // }
    for (let i = 0;;) {
        if (results[i].done) {
            // reset the current iterator
            iterators[i] = iterables[i]();
            results[i] = iterators[i].next();
            // advance, and exit if we've reached the end
            if (++i >= iterators.length) {
                return;
            }
        }
        else {
            yield results.map(({ value }) => value);
            i = 0;
        }
        results[i] = iterators[i].next();
    }
}
class BasicIndexer {
    constructor(selection, array) {
        selection = normalizeArraySelection(selection, array.shape);
        // Setup per-dimension indexers
        this.dimIndexers = [];
        const arrayShape = array.shape;
        for (let i = 0; i < arrayShape.length; i++) {
            let dimSelection = selection[i];
            const dimLength = arrayShape[i];
            const dimChunkLength = array.chunks[i];
            if (dimSelection === null) {
                dimSelection = slice(null);
            }
            if (isInteger(dimSelection)) {
                this.dimIndexers.push(new IntDimIndexer(dimSelection, dimLength, dimChunkLength));
            }
            else if (isSlice(dimSelection)) {
                this.dimIndexers.push(new SliceDimIndexer(dimSelection, dimLength, dimChunkLength));
            }
            else {
                throw new RangeError(`Unspported selection item for basic indexing; expected integer or slice, got ${dimSelection}`);
            }
        }
        this.shape = [];
        for (const d of this.dimIndexers) {
            if (d instanceof SliceDimIndexer) {
                this.shape.push(d.numItems);
            }
        }
        this.dropAxes = null;
    }
    *iter() {
        const dimIndexerIterables = this.dimIndexers.map(x => (() => x.iter()));
        const dimIndexerProduct = product(...dimIndexerIterables);
        for (const dimProjections of dimIndexerProduct) {
            // TODO fix this, I think the product outputs too many combinations
            const chunkCoords = [];
            const chunkSelection = [];
            const outSelection = [];
            for (const p of dimProjections) {
                chunkCoords.push((p).dimChunkIndex);
                chunkSelection.push((p).dimChunkSelection);
                if ((p).dimOutSelection !== null) {
                    outSelection.push((p).dimOutSelection);
                }
            }
            yield {
                chunkCoords,
                chunkSelection,
                outSelection,
            };
        }
    }
}
class IntDimIndexer {
    constructor(dimSelection, dimLength, dimChunkLength) {
        dimSelection = normalizeIntegerSelection(dimSelection, dimLength);
        this.dimSelection = dimSelection;
        this.dimLength = dimLength;
        this.dimChunkLength = dimChunkLength;
        this.numItems = 1;
    }
    *iter() {
        const dimChunkIndex = Math.floor(this.dimSelection / this.dimChunkLength);
        const dimOffset = dimChunkIndex * this.dimChunkLength;
        const dimChunkSelection = this.dimSelection - dimOffset;
        const dimOutSelection = null;
        yield {
            dimChunkIndex,
            dimChunkSelection,
            dimOutSelection,
        };
    }
}
class SliceDimIndexer {
    constructor(dimSelection, dimLength, dimChunkLength) {
        // Normalize
        const [start, stop, step] = sliceIndices(dimSelection, dimLength);
        this.start = start;
        this.stop = stop;
        this.step = step;
        if (this.step < 1) {
            throw new NegativeStepError();
        }
        this.dimLength = dimLength;
        this.dimChunkLength = dimChunkLength;
        this.numItems = Math.max(0, Math.ceil((this.stop - this.start) / this.step));
        this.numChunks = Math.ceil(this.dimLength / this.dimChunkLength);
    }
    *iter() {
        const dimChunkIndexFrom = Math.floor(this.start / this.dimChunkLength);
        const dimChunkIndexTo = Math.ceil(this.stop / this.dimChunkLength);
        // Iterate over chunks in range
        for (let dimChunkIndex = dimChunkIndexFrom; dimChunkIndex < dimChunkIndexTo; dimChunkIndex++) {
            // Compute offsets for chunk within overall array
            const dimOffset = dimChunkIndex * this.dimChunkLength;
            const dimLimit = Math.min(this.dimLength, (dimChunkIndex + 1) * this.dimChunkLength);
            // Determine chunk length, accounting for trailing chunk
            const dimChunkLength = dimLimit - dimOffset;
            let dimChunkSelStart;
            let dimChunkSelStop;
            let dimOutOffset;
            if (this.start < dimOffset) {
                // Selection starts before current chunk
                dimChunkSelStart = 0;
                const remainder = (dimOffset - this.start) % this.step;
                if (remainder > 0) {
                    dimChunkSelStart += this.step - remainder;
                }
                // Compute number of previous items, provides offset into output array
                dimOutOffset = Math.ceil((dimOffset - this.start) / this.step);
            }
            else {
                // Selection starts within current chunk
                dimChunkSelStart = this.start - dimOffset;
                dimOutOffset = 0;
            }
            if (this.stop > dimLimit) {
                // Selection ends after current chunk
                dimChunkSelStop = dimChunkLength;
            }
            else {
                // Selection ends within current chunk
                dimChunkSelStop = this.stop - dimOffset;
            }
            const dimChunkSelection = slice(dimChunkSelStart, dimChunkSelStop, this.step);
            const dimChunkNumItems = Math.ceil((dimChunkSelStop - dimChunkSelStart) / this.step);
            const dimOutSelection = slice(dimOutOffset, dimOutOffset + dimChunkNumItems);
            yield {
                dimChunkIndex,
                dimChunkSelection,
                dimOutSelection,
            };
        }
    }
}

const TypeCheckSuite = dist_27(exportedTypeSuite);
/**
 * This should be true only if this javascript is getting executed in Node.
 */
const IS_NODE = typeof process !== "undefined" && process.versions && process.versions.node;
// eslint-disable-next-line @typescript-eslint/ban-types
function normalizeStoragePath(path) {
    if (path === null) {
        return "";
    }
    if (path instanceof String) {
        path = path.valueOf();
    }
    // convert backslash to forward slash
    path = path.replace(/\\/g, "/");
    // ensure no leading slash
    while (path.length > 0 && path[0] === '/') {
        path = path.slice(1);
    }
    // ensure no trailing slash
    while (path.length > 0 && path[path.length - 1] === '/') {
        path = path.slice(0, path.length - 1);
    }
    // collapse any repeated slashes
    path = path.replace(/\/\/+/g, "/");
    // don't allow path segments with just '.' or '..'
    const segments = path.split('/');
    for (const s of segments) {
        if (s === "." || s === "..") {
            throw Error("path containing '.' or '..' segment not allowed");
        }
    }
    return path;
}
function normalizeShape(shape) {
    if (typeof shape === "number") {
        shape = [shape];
    }
    return shape.map(x => Math.floor(x));
}
function normalizeChunks(chunks, shape) {
    // Assume shape is already normalized
    TypeCheckSuite.ChunksArgument.check(chunks);
    if (chunks === null || chunks === true) {
        throw new Error("Chunk guessing is not supported yet");
    }
    if (chunks === false) {
        return shape;
    }
    if (typeof chunks === "number") {
        chunks = [chunks];
    }
    // handle underspecified chunks
    if (chunks.length < shape.length) {
        // assume chunks across remaining dimensions
        chunks = chunks.concat(shape.slice(chunks.length));
    }
    return chunks.map((x, idx) => {
        // handle null or -1 in chunks
        if (x === -1 || x === null) {
            return shape[idx];
        }
        else {
            return Math.floor(x);
        }
    });
}
function normalizeOrder(order) {
    order = order.toUpperCase();
    TypeCheckSuite.Order.check(order);
    return order;
}
function normalizeDtype(dtype) {
    TypeCheckSuite.DtypeString.check(dtype);
    return dtype;
}
function normalizeFillValue(fillValue) {
    TypeCheckSuite.FillType.check(fillValue);
    return fillValue;
}
/**
 * Determine whether `item` specifies a complete slice of array with the
 *  given `shape`. Used to optimize __setitem__ operations on chunks
 * @param item
 * @param shape
 */
function isTotalSlice(item, shape) {
    if (item === null) {
        return true;
    }
    if (!Array.isArray(item)) {
        item = [item];
    }
    for (let i = 0; i < Math.min(item.length, shape.length); i++) {
        const it = item[i];
        if (it === null)
            continue;
        if (isSlice(it)) {
            const s = it;
            const isStepOne = s.step === 1 || s.step === null;
            if (s.start === null && s.stop === null && isStepOne) {
                continue;
            }
            if ((s.stop - s.start) === shape[i] && isStepOne) {
                continue;
            }
            return false;
        }
        return false;
        // } else {
        //     console.error(`isTotalSlice unexpected non-slice, got ${it}`);
        //     return false;
        // }
    }
    return true;
}
/**
 * Checks for === equality of all elements.
 */
function arrayEquals1D(a, b) {
    if (a.length !== b.length) {
        return false;
    }
    for (let i = 0; i < a.length; i++) {
        if (a[i] !== b[i]) {
            return false;
        }
    }
    return true;
}
/*
 * Determines "C" order strides for a given shape array.
 * Strides provide integer steps in each dimention to traverse an ndarray.
 *
 * NOTE: - These strides here are distinct from numpy.ndarray.strides, which describe actual byte steps.
 *       - Strides are assumed to be contiguous, so initial step is 1. Thus, output will always be [XX, XX, 1].
 */
function getStrides(shape) {
    // adapted from https://github.com/scijs/ndarray/blob/master/ndarray.js#L326-L330
    const ndim = shape.length;
    const strides = Array(ndim);
    let step = 1; // init step
    for (let i = ndim - 1; i >= 0; i--) {
        strides[i] = step;
        step *= shape[i];
    }
    return strides;
}
/**
 * Preserves (double) slashes earlier in the path, so this works better
 * for URLs. From https://stackoverflow.com/a/46427607/4178400
 * @param args parts of a path or URL to join.
 */
function joinUrlParts(...args) {
    return args.map((part, i) => {
        if (i === 0) {
            return part.trim().replace(/[\/]*$/g, '');
        }
        else {
            return part.trim().replace(/(^[\/]*|[\/]*$)/g, '');
        }
    }).filter(x => x.length).join('/');
}
/**
 * Swaps byte order in-place for a given TypedArray.
 * Used to flip endian-ness when getting/setting chunks from/to zarr store.
 * @param src TypedArray
 */
function byteSwapInplace(src) {
    const b = src.BYTES_PER_ELEMENT;
    if (b === 1)
        return; // no swapping needed
    if (IS_NODE) {
        // Use builtin methods for swapping if in Node environment
        const bytes = Buffer.from(src.buffer, src.byteOffset, src.length * b);
        if (b === 2)
            bytes.swap16();
        if (b === 4)
            bytes.swap32();
        if (b === 8)
            bytes.swap64();
        return;
    }
    // In browser, need to flip manually
    // Adapted from https://github.com/zbjornson/node-bswap/blob/master/bswap.js
    const flipper = new Uint8Array(src.buffer, src.byteOffset, src.length * b);
    const numFlips = b / 2;
    const endByteIndex = b - 1;
    let t;
    for (let i = 0; i < flipper.length; i += b) {
        for (let j = 0; j < numFlips; j++) {
            t = flipper[i + j];
            flipper[i + j] = flipper[i + endByteIndex - j];
            flipper[i + endByteIndex - j] = t;
        }
    }
}
/**
 * Creates a copy of a TypedArray and swaps bytes.
 * Used to flip endian-ness when getting/setting chunks from/to zarr store.
 * @param src TypedArray
 */
function byteSwap(src) {
    const copy = src.slice();
    byteSwapInplace(copy);
    return copy;
}

const ARRAY_META_KEY = ".zarray";
const GROUP_META_KEY = ".zgroup";
const ATTRS_META_KEY = ".zattributes";

/**
 * Return true if the store contains an array at the given logical path.
 */
function containsArray(store, path = null) {
    return __awaiter(this, void 0, void 0, function* () {
        path = normalizeStoragePath(path);
        const prefix = pathToPrefix(path);
        const key = prefix + ARRAY_META_KEY;
        return store.containsItem(key);
    });
}
/**
 * Return true if the store contains a group at the given logical path.
 */
function containsGroup(store, path = null) {
    return __awaiter(this, void 0, void 0, function* () {
        path = normalizeStoragePath(path);
        const prefix = pathToPrefix(path);
        const key = prefix + GROUP_META_KEY;
        return store.containsItem(key);
    });
}
function pathToPrefix(path) {
    // assume path already normalized
    if (path.length > 0) {
        return path + '/';
    }
    return '';
}
function requireParentGroup(store, path, chunkStore, overwrite) {
    return __awaiter(this, void 0, void 0, function* () {
        // Assume path is normalized
        if (path.length === 0) {
            return;
        }
        const segments = path.split("/");
        let p = "";
        for (const s of segments.slice(0, segments.length - 1)) {
            p += s;
            if (yield containsArray(store, p)) {
                yield initGroupMetadata(store, p, overwrite);
            }
            else if (!(yield containsGroup(store, p))) {
                yield initGroupMetadata(store, p);
            }
            p += "/";
        }
    });
}
function initGroupMetadata(store, path = null, overwrite = false) {
    return __awaiter(this, void 0, void 0, function* () {
        path = normalizeStoragePath(path);
        // Guard conditions
        if (overwrite) {
            throw Error("Group overwriting not implemented yet :(");
        }
        else if (yield containsArray(store, path)) {
            throw new ContainsArrayError(path);
        }
        else if (yield containsGroup(store, path)) {
            throw new ContainsGroupError(path);
        }
        const metadata = { zarr_format: 2 };
        const key = pathToPrefix(path) + GROUP_META_KEY;
        yield store.setItem(key, JSON.stringify(metadata));
    });
}
function initArrayMetadata(store, shape, chunks, dtype, path, compressor, fillValue, order, overwrite, chunkStore, filters) {
    return __awaiter(this, void 0, void 0, function* () {
        // Guard conditions
        if (overwrite) {
            throw Error("Array overwriting not implemented yet :(");
        }
        else if (yield containsArray(store, path)) {
            throw new ContainsArrayError(path);
        }
        else if (yield containsGroup(store, path)) {
            throw new ContainsGroupError(path);
        }
        // Normalize metadata,  does type checking too.
        dtype = normalizeDtype(dtype);
        shape = normalizeShape(shape);
        chunks = normalizeChunks(chunks, shape);
        order = normalizeOrder(order);
        fillValue = normalizeFillValue(fillValue);
        if (filters !== null && filters.length > 0) {
            throw Error("Filters are not supported yet");
        }
        let serializedFillValue = fillValue;
        if (typeof fillValue === "number") {
            if (Number.isNaN(fillValue))
                serializedFillValue = "NaN";
            if (Number.POSITIVE_INFINITY === fillValue)
                serializedFillValue = "Infinity";
            if (Number.NEGATIVE_INFINITY === fillValue)
                serializedFillValue = "-Infinity";
        }
        filters = null;
        const metadata = {
            zarr_format: 2,
            shape: shape,
            chunks: chunks,
            dtype: dtype,
            fill_value: serializedFillValue,
            order: order,
            compressor: compressor,
            filters: filters,
        };
        const metaKey = pathToPrefix(path) + ARRAY_META_KEY;
        yield store.setItem(metaKey, JSON.stringify(metadata));
    });
}
/**
 *
 * Initialize an array store with the given configuration. Note that this is a low-level
 * function and there should be no need to call this directly from user code
 */
function initArray(store, shape, chunks, dtype, path = null, compressor = null, fillValue = null, order = "C", overwrite = false, chunkStore = null, filters = null) {
    return __awaiter(this, void 0, void 0, function* () {
        path = normalizeStoragePath(path);
        yield requireParentGroup(store, path, chunkStore, overwrite);
        yield initArrayMetadata(store, shape, chunks, dtype, path, compressor, fillValue, order, overwrite, chunkStore, filters);
    });
}

function parseMetadata(s) {
    // Here we allow that a store may return an already-parsed metadata object,
    // or a string of JSON that we will parse here. We allow for an already-parsed
    // object to accommodate a consolidated metadata store, where all the metadata for
    // all groups and arrays will already have been parsed from JSON.
    if (typeof s !== 'string') {
        // tslint:disable-next-line: strict-type-predicates
        if (IS_NODE && Buffer.isBuffer(s)) {
            return JSON.parse(s.toString());
        }
        else if (s instanceof ArrayBuffer) {
            const utf8Decoder = new TextDecoder();
            const bytes = new Uint8Array(s);
            return JSON.parse(utf8Decoder.decode(bytes));
        }
        else {
            return s;
        }
    }
    return JSON.parse(s);
}

/**
 * Class providing access to user attributes on an array or group. Should not be
 * instantiated directly, will be available via the `.attrs` property of an array or
 * group.
 */
class Attributes {
    constructor(store, key, readOnly, cache = true) {
        this.store = store;
        this.key = key;
        this.readOnly = readOnly;
        this.cache = cache;
        this.cachedValue = null;
    }
    /**
     * Retrieve all attributes as a JSON object.
     */
    asObject() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.cache && this.cachedValue !== null) {
                return this.cachedValue;
            }
            const o = yield this.getNoSync();
            if (this.cache) {
                this.cachedValue = o;
            }
            return o;
        });
    }
    getNoSync() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const data = yield this.store.getItem(this.key);
                // TODO fix typing?
                return parseMetadata(data);
            }
            catch (error) {
                return {};
            }
        });
    }
    setNoSync(key, value) {
        return __awaiter(this, void 0, void 0, function* () {
            const d = yield this.getNoSync();
            d[key] = value;
            yield this.putNoSync(d);
            return true;
        });
    }
    putNoSync(m) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.store.setItem(this.key, JSON.stringify(m));
            if (this.cache) {
                this.cachedValue = m;
            }
        });
    }
    delNoSync(key) {
        return __awaiter(this, void 0, void 0, function* () {
            const d = yield this.getNoSync();
            delete d[key];
            yield this.putNoSync(d);
            return true;
        });
    }
    /**
     * Overwrite all attributes with the provided object in a single operation
     */
    put(d) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.readOnly) {
                throw new PermissionError("attributes are read-only");
            }
            return this.putNoSync(d);
        });
    }
    setItem(key, value) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.readOnly) {
                throw new PermissionError("attributes are read-only");
            }
            return this.setNoSync(key, value);
        });
    }
    getItem(key) {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.asObject())[key];
        });
    }
    deleteItem(key) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.readOnly) {
                throw new PermissionError("attributes are read-only");
            }
            return this.delNoSync(key);
        });
    }
    containsItem(key) {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.asObject())[key] !== undefined;
        });
    }
    proxy() {
        return createProxy(this);
    }
}

const DTYPE_TYPEDARRAY_MAPPING = {
    '|b': Int8Array,
    '|B': Uint8Array,
    '|u1': Uint8Array,
    '|i1': Int8Array,
    '<b': Int8Array,
    '<B': Uint8Array,
    '<u1': Uint8Array,
    '<i1': Int8Array,
    '<u2': Uint16Array,
    '<i2': Int16Array,
    '<u4': Uint32Array,
    '<i4': Int32Array,
    '<f4': Float32Array,
    '<f8': Float64Array,
    '>b': Int8Array,
    '>B': Uint8Array,
    '>u1': Uint8Array,
    '>i1': Int8Array,
    '>u2': Uint16Array,
    '>i2': Int16Array,
    '>u4': Uint32Array,
    '>i4': Int32Array,
    '>f4': Float32Array,
    '>f8': Float64Array
};
/*
 * Called by NestedArray and RawArray constructors only.
 * We byte-swap the buffer of a store after decoding
 * since TypedArray views are little endian only.
 *
 * This means NestedArrays and RawArrays will always be little endian,
 * unless a numpy-like library comes around and can handle endianess
 * for buffer views.
 */
function getTypedArrayDtypeString(t) {
    // Favour the types below instead of small and big B
    if (t instanceof Uint8Array)
        return '|u1';
    if (t instanceof Int8Array)
        return '|i1';
    if (t instanceof Uint16Array)
        return '<u2';
    if (t instanceof Int16Array)
        return '<i2';
    if (t instanceof Uint32Array)
        return '<u4';
    if (t instanceof Int32Array)
        return '<i4';
    if (t instanceof Float32Array)
        return '<f4';
    if (t instanceof Float64Array)
        return '<f8';
    throw new ValueError('Mapping for TypedArray to Dtypestring not known');
}

/**
 * Digs down into the dimensions of given array to find the TypedArray and returns its constructor.
 * Better to use sparingly.
 */
function getNestedArrayConstructor(arr) {
    // TODO fix typing
    // tslint:disable-next-line: strict-type-predicates
    if (arr.byteLength !== undefined) {
        return (arr).constructor;
    }
    return getNestedArrayConstructor(arr[0]);
}
/**
 * Returns both the slice result and new output shape
 * @param arr NestedArray to slice
 * @param shape The shape of the NestedArray
 * @param selection
 */
function sliceNestedArray(arr, shape, selection) {
    // This translates "...", ":", null into a list of slices or integer selections
    const normalizedSelection = normalizeArraySelection(selection, shape);
    const [sliceIndices, outShape] = selectionToSliceIndices(normalizedSelection, shape);
    const outArray = _sliceNestedArray(arr, shape, sliceIndices);
    return [outArray, outShape];
}
function _sliceNestedArray(arr, shape, selection) {
    const currentSlice = selection[0];
    // Is this necessary?
    // // This is possible when a slice list is passed shorter than the amount of dimensions
    // // tslint:disable-next-line: strict-type-predicates
    // if (currentSlice === undefined) {
    //     return arr.slice();
    // }
    // When a number is passed that dimension is squeezed
    if (typeof currentSlice === "number") {
        // Assume already normalized integer selection here.
        if (shape.length === 1) {
            return arr[currentSlice];
        }
        else {
            return _sliceNestedArray(arr[currentSlice], shape.slice(1), selection.slice(1));
        }
    }
    const [from, to, step, outputSize] = currentSlice;
    if (outputSize === 0) {
        return new (getNestedArrayConstructor(arr))(0);
    }
    if (shape.length === 1) {
        if (step === 1) {
            return arr.slice(from, to);
        }
        const newArrData = new arr.constructor(outputSize);
        for (let i = 0; i < outputSize; i++) {
            newArrData[i] = arr[from + i * step];
        }
        return newArrData;
    }
    let newArr = new Array(outputSize);
    for (let i = 0; i < outputSize; i++) {
        newArr[i] = _sliceNestedArray(arr[from + i * step], shape.slice(1), selection.slice(1));
    }
    // This is necessary to ensure that the return value is a NestedArray if the last dimension is squeezed
    // e.g. shape [2,1] with slice [:, 0] would otherwise result in a list of numbers instead of a valid NestedArray
    if (outputSize > 0 && typeof newArr[0] === "number") {
        const typedArrayConstructor = arr[0].constructor;
        newArr = typedArrayConstructor.from(newArr);
    }
    return newArr;
}
function setNestedArrayToScalar(dstArr, value, destShape, selection) {
    // This translates "...", ":", null, etc into a list of slices.
    const normalizedSelection = normalizeArraySelection(selection, destShape, true);
    // Above we force the results to be SliceIndicesIndices only, without integer selections making this cast is safe.
    const [sliceIndices, _outShape] = selectionToSliceIndices(normalizedSelection, destShape);
    _setNestedArrayToScalar(dstArr, value, destShape, sliceIndices);
}
function setNestedArray(dstArr, sourceArr, destShape, sourceShape, selection) {
    // This translates "...", ":", null, etc into a list of slices.
    const normalizedSelection = normalizeArraySelection(selection, destShape, false);
    const [sliceIndices, outShape] = selectionToSliceIndices(normalizedSelection, destShape);
    // TODO: replace with non stringify equality check
    if (JSON.stringify(outShape) !== JSON.stringify(sourceShape)) {
        throw new ValueError(`Shape mismatch in target and source NestedArray: ${outShape} and ${sourceShape}`);
    }
    _setNestedArray(dstArr, sourceArr, destShape, sliceIndices);
}
function _setNestedArray(dstArr, sourceArr, shape, selection) {
    const currentSlice = selection[0];
    if (typeof sourceArr === "number") {
        _setNestedArrayToScalar(dstArr, sourceArr, shape, selection.map(x => typeof x === "number" ? [x, x + 1, 1, 1] : x));
        return;
    }
    // This dimension is squeezed.
    if (typeof currentSlice === "number") {
        _setNestedArray(dstArr[currentSlice], sourceArr, shape.slice(1), selection.slice(1));
        return;
    }
    const [from, _to, step, outputSize] = currentSlice;
    if (shape.length === 1) {
        if (step === 1) {
            dstArr.set(sourceArr, from);
        }
        else {
            for (let i = 0; i < outputSize; i++) {
                dstArr[from + i * step] = (sourceArr)[i];
            }
        }
        return;
    }
    for (let i = 0; i < outputSize; i++) {
        _setNestedArray(dstArr[from + i * step], sourceArr[i], shape.slice(1), selection.slice(1));
    }
}
function _setNestedArrayToScalar(dstArr, value, shape, selection) {
    const currentSlice = selection[0];
    const [from, to, step, outputSize] = currentSlice;
    if (shape.length === 1) {
        if (step === 1) {
            dstArr.fill(value, from, to);
        }
        else {
            for (let i = 0; i < outputSize; i++) {
                dstArr[from + i * step] = value;
            }
        }
        return;
    }
    for (let i = 0; i < outputSize; i++) {
        _setNestedArrayToScalar(dstArr[from + i * step], value, shape.slice(1), selection.slice(1));
    }
}
function flattenNestedArray(arr, shape, constr) {
    if (constr === undefined) {
        constr = getNestedArrayConstructor(arr);
    }
    const size = shape.reduce((x, y) => x * y, 1);
    const outArr = new constr(size);
    _flattenNestedArray(arr, shape, outArr, 0);
    return outArr;
}
function _flattenNestedArray(arr, shape, outArr, offset) {
    if (shape.length === 1) {
        // This is only ever reached if called with rank 1 shape, never reached through recursion.
        // We just slice set the array directly from one level above to save some function calls.
        outArr.set(arr, offset);
        return;
    }
    if (shape.length === 2) {
        for (let i = 0; i < shape[0]; i++) {
            outArr.set(arr[i], offset + shape[1] * i);
        }
        return arr;
    }
    const nextShape = shape.slice(1);
    // Small optimization possible here: this can be precomputed for different levels of depth and passed on.
    const mult = nextShape.reduce((x, y) => x * y, 1);
    for (let i = 0; i < shape[0]; i++) {
        _flattenNestedArray(arr[i], nextShape, outArr, offset + mult * i);
    }
    return arr;
}

class NestedArray {
    constructor(data, shape, dtype) {
        const dataIsTypedArray = data !== null && !!data.BYTES_PER_ELEMENT;
        if (shape === undefined) {
            if (!dataIsTypedArray) {
                throw new ValueError("Shape argument is required unless you pass in a TypedArray");
            }
            shape = [data.length];
        }
        if (dtype === undefined) {
            if (!dataIsTypedArray) {
                throw new ValueError("Dtype argument is required unless you pass in a TypedArray");
            }
            dtype = getTypedArrayDtypeString(data);
        }
        shape = normalizeShape(shape);
        this.shape = shape;
        this.dtype = dtype;
        if (dataIsTypedArray && shape.length !== 1) {
            data = data.buffer;
        }
        // Zero dimension array.. they are a bit weirdly represented now, they will only ever occur internally
        if (this.shape.length === 0) {
            this.data = new DTYPE_TYPEDARRAY_MAPPING[dtype](1);
        }
        else if (
        // tslint:disable-next-line: strict-type-predicates
        (IS_NODE && Buffer.isBuffer(data))
            || data instanceof ArrayBuffer
            || data === null
            || data.toString().startsWith("[object ArrayBuffer]") // Necessary for Node.js for some reason..
        ) {
            // Create from ArrayBuffer or Buffer
            const numShapeElements = shape.reduce((x, y) => x * y, 1);
            if (data === null) {
                data = new ArrayBuffer(numShapeElements * parseInt(dtype[dtype.length - 1], 10));
            }
            const numDataElements = data.byteLength / parseInt(dtype[dtype.length - 1], 10);
            if (numShapeElements !== numDataElements) {
                throw new Error(`Buffer has ${numDataElements} of dtype ${dtype}, shape is too large or small ${shape} (flat=${numShapeElements})`);
            }
            const typeConstructor = DTYPE_TYPEDARRAY_MAPPING[dtype];
            this.data = createNestedArray(data, typeConstructor, shape);
        }
        else {
            this.data = data;
        }
    }
    get(selection) {
        const [sliceResult, outShape] = sliceNestedArray(this.data, this.shape, selection);
        if (outShape.length === 0) {
            return sliceResult;
        }
        else {
            return new NestedArray(sliceResult, outShape, this.dtype);
        }
    }
    set(selection = null, value) {
        if (selection === null) {
            selection = [slice(null)];
        }
        if (typeof value === "number") {
            if (this.shape.length === 0) {
                // Zero dimension array..
                this.data[0] = value;
            }
            else {
                setNestedArrayToScalar(this.data, value, this.shape, selection);
            }
        }
        else {
            setNestedArray(this.data, value.data, this.shape, value.shape, selection);
        }
    }
    flatten() {
        if (this.shape.length === 1) {
            return this.data;
        }
        return flattenNestedArray(this.data, this.shape, DTYPE_TYPEDARRAY_MAPPING[this.dtype]);
    }
    /**
     * Currently only supports a single integer as the size, TODO: support start, stop, step.
     */
    static arange(size, dtype = "<i4") {
        const constr = DTYPE_TYPEDARRAY_MAPPING[dtype];
        const data = rangeTypedArray([size], constr);
        return new NestedArray(data, [size], dtype);
    }
}
/**
 * Creates a TypedArray with values 0 through N where N is the product of the shape.
 */
function rangeTypedArray(shape, tContructor) {
    const size = shape.reduce((x, y) => x * y, 1);
    const data = new tContructor(size);
    data.set([...Array(size).keys()]); // Sets range 0,1,2,3,4,5
    return data;
}
/**
 * Creates multi-dimensional (rank > 1) array given input data and shape recursively.
 * What it does is create a Array<Array<...<Array<Uint8Array>>> or some other typed array.
 * This is for internal use, there should be no need to call this from user code.
 * @param data a buffer containing the data for this array.
 * @param t constructor for the datatype of choice
 * @param shape list of numbers describing the size in each dimension
 * @param offset in bytes for this dimension
 */
function createNestedArray(data, t, shape, offset = 0) {
    if (shape.length === 1) {
        // This is only ever reached if called with rank 1 shape, never reached through recursion.
        // We just slice set the array directly from one level above to save some function calls.
        return new t(data.slice(offset, offset + shape[0] * t.BYTES_PER_ELEMENT));
    }
    const arr = new Array(shape[0]);
    if (shape.length === 2) {
        for (let i = 0; i < shape[0]; i++) {
            arr[i] = new t(data.slice(offset + shape[1] * i * t.BYTES_PER_ELEMENT, offset + shape[1] * (i + 1) * t.BYTES_PER_ELEMENT));
        }
        return arr;
    }
    const nextShape = shape.slice(1);
    // Small optimization possible here: this can be precomputed for different levels of depth and passed on.
    const mult = nextShape.reduce((x, y) => x * y, 1);
    for (let i = 0; i < shape[0]; i++) {
        arr[i] = createNestedArray(data, t, nextShape, offset + mult * i * t.BYTES_PER_ELEMENT);
    }
    return arr;
}

function setRawArrayToScalar(dstArr, dstStrides, dstShape, dstSelection, value) {
    // This translates "...", ":", null, etc into a list of slices.
    const normalizedSelection = normalizeArraySelection(dstSelection, dstShape, true);
    const [sliceIndices] = selectionToSliceIndices(normalizedSelection, dstShape);
    // Above we force the results to be SliceIndicesIndices only, without integer selections making this cast is safe.
    _setRawArrayToScalar(value, dstArr, dstStrides, sliceIndices);
}
function setRawArray(dstArr, dstStrides, dstShape, dstSelection, sourceArr, sourceStrides, sourceShape) {
    // This translates "...", ":", null, etc into a list of slices.
    const normalizedDstSelection = normalizeArraySelection(dstSelection, dstShape, false);
    const [dstSliceIndices, outShape] = selectionToSliceIndices(normalizedDstSelection, dstShape);
    // TODO: replace with non stringify equality check
    if (JSON.stringify(outShape) !== JSON.stringify(sourceShape)) {
        throw new ValueError(`Shape mismatch in target and source RawArray: ${outShape} and ${sourceShape}`);
    }
    _setRawArray(dstArr, dstStrides, dstSliceIndices, sourceArr, sourceStrides);
}
function setRawArrayFromChunkItem(dstArr, dstStrides, dstShape, dstSelection, sourceArr, sourceStrides, sourceShape, sourceSelection) {
    // This translates "...", ":", null, etc into a list of slices.
    const normalizedDstSelection = normalizeArraySelection(dstSelection, dstShape, true);
    // Above we force the results to be dstSliceIndices only, without integer selections making this cast is safe.
    const [dstSliceIndices] = selectionToSliceIndices(normalizedDstSelection, dstShape);
    const normalizedSourceSelection = normalizeArraySelection(sourceSelection, sourceShape, false);
    const [sourceSliceIndicies] = selectionToSliceIndices(normalizedSourceSelection, sourceShape);
    // TODO check to ensure chunk and dest selection are same shape?
    // As is, this only gets called in ZarrArray.getRaw where this condition should be ensured, and check might hinder performance.
    _setRawArrayFromChunkItem(dstArr, dstStrides, dstSliceIndices, sourceArr, sourceStrides, sourceSliceIndicies);
}
function _setRawArrayToScalar(value, dstArr, dstStrides, dstSliceIndices) {
    const [currentDstSlice, ...nextDstSliceIndices] = dstSliceIndices;
    const [currentDstStride, ...nextDstStrides] = dstStrides;
    const [from, _to, step, outputSize] = currentDstSlice;
    if (dstStrides.length === 1) {
        if (step === 1 && currentDstStride === 1) {
            dstArr.fill(value, from, from + outputSize);
        }
        else {
            for (let i = 0; i < outputSize; i++) {
                dstArr[currentDstStride * (from + (step * i))] = value;
            }
        }
        return;
    }
    for (let i = 0; i < outputSize; i++) {
        _setRawArrayToScalar(value, dstArr.subarray(currentDstStride * (from + (step * i))), nextDstStrides, nextDstSliceIndices);
    }
}
function _setRawArray(dstArr, dstStrides, dstSliceIndices, sourceArr, sourceStrides) {
    if (dstSliceIndices.length === 0) {
        dstArr.set(sourceArr);
        return;
    }
    const [currentDstSlice, ...nextDstSliceIndices] = dstSliceIndices;
    const [currentDstStride, ...nextDstStrides] = dstStrides;
    // This dimension is squeezed.
    if (typeof currentDstSlice === "number") {
        _setRawArray(dstArr.subarray(currentDstSlice * currentDstStride), nextDstStrides, nextDstSliceIndices, sourceArr, sourceStrides);
        return;
    }
    const [currentSourceStride, ...nextSourceStrides] = sourceStrides;
    const [from, _to, step, outputSize] = currentDstSlice;
    if (dstStrides.length === 1) {
        if (step === 1 && currentDstStride === 1 && currentSourceStride === 1) {
            dstArr.set(sourceArr.subarray(0, outputSize), from);
        }
        else {
            for (let i = 0; i < outputSize; i++) {
                dstArr[currentDstStride * (from + (step * i))] = sourceArr[currentSourceStride * i];
            }
        }
        return;
    }
    for (let i = 0; i < outputSize; i++) {
        // Apply strides as above, using both destination and source-specific strides.
        _setRawArray(dstArr.subarray(currentDstStride * (from + (i * step))), nextDstStrides, nextDstSliceIndices, sourceArr.subarray(currentSourceStride * i), nextSourceStrides);
    }
}
function _setRawArrayFromChunkItem(dstArr, dstStrides, dstSliceIndices, sourceArr, sourceStrides, sourceSliceIndices) {
    if (sourceSliceIndices.length === 0) {
        // Case when last source dimension is squeezed
        dstArr.set(sourceArr.subarray(0, dstArr.length));
        return;
    }
    // Get current indicies and strides for both destination and source arrays
    const [currentDstSlice, ...nextDstSliceIndices] = dstSliceIndices;
    const [currentSourceSlice, ...nextSourceSliceIndices] = sourceSliceIndices;
    const [currentDstStride, ...nextDstStrides] = dstStrides;
    const [currentSourceStride, ...nextSourceStrides] = sourceStrides;
    // This source dimension is squeezed
    if (typeof currentSourceSlice === "number") {
        /*
        Sets dimension offset for squeezed dimension.

        Ex. if 0th dimension is squeezed to 2nd index (numpy : arr[2,i])

            sourceArr[stride[0]* 2 + i] --> sourceArr.subarray(stride[0] * 2)[i] (sourceArr[i] in next call)

        Thus, subsequent squeezed dims are appended to the source offset.
        */
        _setRawArrayFromChunkItem(
        // Don't update destination offset/slices, just source
        dstArr, dstStrides, dstSliceIndices, sourceArr.subarray(currentSourceStride * currentSourceSlice), nextSourceStrides, nextSourceSliceIndices);
        return;
    }
    const [from, _to, step, outputSize] = currentDstSlice; // just need start and size
    const [sfrom, _sto, sstep, _soutputSize] = currentSourceSlice; // Will always be subset of dst, so don't need output size just start
    if (dstStrides.length === 1 && sourceStrides.length === 1) {
        if (step === 1 && currentDstStride === 1 && sstep === 1 && currentSourceStride === 1) {
            dstArr.set(sourceArr.subarray(sfrom, sfrom + outputSize), from);
        }
        else {
            for (let i = 0; i < outputSize; i++) {
                dstArr[currentDstStride * (from + (step * i))] = sourceArr[currentSourceStride * (sfrom + (sstep * i))];
            }
        }
        return;
    }
    for (let i = 0; i < outputSize; i++) {
        // Apply strides as above, using both destination and source-specific strides.
        _setRawArrayFromChunkItem(dstArr.subarray(currentDstStride * (from + (i * step))), nextDstStrides, nextDstSliceIndices, sourceArr.subarray(currentSourceStride * (sfrom + (i * sstep))), nextSourceStrides, nextSourceSliceIndices);
    }
}

class RawArray {
    constructor(data, shape, dtype, strides) {
        const dataIsTypedArray = data !== null && !!data.BYTES_PER_ELEMENT;
        if (shape === undefined) {
            if (!dataIsTypedArray) {
                throw new ValueError("Shape argument is required unless you pass in a TypedArray");
            }
            shape = [data.length];
        }
        shape = normalizeShape(shape);
        if (dtype === undefined) {
            if (!dataIsTypedArray) {
                throw new ValueError("Dtype argument is required unless you pass in a TypedArray");
            }
            dtype = getTypedArrayDtypeString(data);
        }
        if (strides === undefined) {
            strides = getStrides(shape);
        }
        this.shape = shape;
        this.dtype = dtype;
        this.strides = strides;
        if (dataIsTypedArray && shape.length !== 1) {
            data = data.buffer;
        }
        // Zero dimension array.. they are a bit weirdly represented now, they will only ever occur internally
        if (this.shape.length === 0) {
            this.data = new DTYPE_TYPEDARRAY_MAPPING[dtype](1);
        }
        else if (
        // tslint:disable-next-line: strict-type-predicates
        (IS_NODE && Buffer.isBuffer(data))
            || data instanceof ArrayBuffer
            || data === null
            || data.toString().startsWith("[object ArrayBuffer]") // Necessary for Node.js for some reason..
        ) {
            // Create from ArrayBuffer or Buffer
            const numShapeElements = shape.reduce((x, y) => x * y, 1);
            if (data === null) {
                data = new ArrayBuffer(numShapeElements * parseInt(dtype[dtype.length - 1], 10));
            }
            const numDataElements = data.byteLength / parseInt(dtype[dtype.length - 1], 10);
            if (numShapeElements !== numDataElements) {
                throw new Error(`Buffer has ${numDataElements} of dtype ${dtype}, shape is too large or small ${shape} (flat=${numShapeElements})`);
            }
            const typeConstructor = DTYPE_TYPEDARRAY_MAPPING[dtype];
            this.data = new typeConstructor(data);
        }
        else {
            this.data = data;
        }
    }
    set(selection = null, value, chunkSelection) {
        if (selection === null) {
            selection = [slice(null)];
        }
        if (typeof value === "number") {
            if (this.shape.length === 0) {
                // Zero dimension array..
                this.data[0] = value;
            }
            else {
                setRawArrayToScalar(this.data, this.strides, this.shape, selection, value);
            }
        }
        else if (value instanceof RawArray && chunkSelection) {
            // Copy directly from decoded chunk to destination array
            setRawArrayFromChunkItem(this.data, this.strides, this.shape, selection, value.data, value.strides, value.shape, chunkSelection);
        }
        else {
            setRawArray(this.data, this.strides, this.shape, selection, value.data, value.strides, value.shape);
        }
    }
}

function createCommonjsModule$1(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var common = createCommonjsModule$1(function (module, exports) {


var TYPED_OK =  (typeof Uint8Array !== 'undefined') &&
                (typeof Uint16Array !== 'undefined') &&
                (typeof Int32Array !== 'undefined');

function _has(obj, key) {
  return Object.prototype.hasOwnProperty.call(obj, key);
}

exports.assign = function (obj /*from1, from2, from3, ...*/) {
  var sources = Array.prototype.slice.call(arguments, 1);
  while (sources.length) {
    var source = sources.shift();
    if (!source) { continue; }

    if (typeof source !== 'object') {
      throw new TypeError(source + 'must be non-object');
    }

    for (var p in source) {
      if (_has(source, p)) {
        obj[p] = source[p];
      }
    }
  }

  return obj;
};


// reduce buffer size, avoiding mem copy
exports.shrinkBuf = function (buf, size) {
  if (buf.length === size) { return buf; }
  if (buf.subarray) { return buf.subarray(0, size); }
  buf.length = size;
  return buf;
};


var fnTyped = {
  arraySet: function (dest, src, src_offs, len, dest_offs) {
    if (src.subarray && dest.subarray) {
      dest.set(src.subarray(src_offs, src_offs + len), dest_offs);
      return;
    }
    // Fallback to ordinary array
    for (var i = 0; i < len; i++) {
      dest[dest_offs + i] = src[src_offs + i];
    }
  },
  // Join array of chunks to single array.
  flattenChunks: function (chunks) {
    var i, l, len, pos, chunk, result;

    // calculate data length
    len = 0;
    for (i = 0, l = chunks.length; i < l; i++) {
      len += chunks[i].length;
    }

    // join chunks
    result = new Uint8Array(len);
    pos = 0;
    for (i = 0, l = chunks.length; i < l; i++) {
      chunk = chunks[i];
      result.set(chunk, pos);
      pos += chunk.length;
    }

    return result;
  }
};

var fnUntyped = {
  arraySet: function (dest, src, src_offs, len, dest_offs) {
    for (var i = 0; i < len; i++) {
      dest[dest_offs + i] = src[src_offs + i];
    }
  },
  // Join array of chunks to single array.
  flattenChunks: function (chunks) {
    return [].concat.apply([], chunks);
  }
};


// Enable/Disable typed arrays use, for testing
//
exports.setTyped = function (on) {
  if (on) {
    exports.Buf8  = Uint8Array;
    exports.Buf16 = Uint16Array;
    exports.Buf32 = Int32Array;
    exports.assign(exports, fnTyped);
  } else {
    exports.Buf8  = Array;
    exports.Buf16 = Array;
    exports.Buf32 = Array;
    exports.assign(exports, fnUntyped);
  }
};

exports.setTyped(TYPED_OK);
});
var common_1 = common.assign;
var common_2 = common.shrinkBuf;
var common_3 = common.setTyped;
var common_4 = common.Buf8;
var common_5 = common.Buf16;
var common_6 = common.Buf32;

// (C) 1995-2013 Jean-loup Gailly and Mark Adler
// (C) 2014-2017 Vitaly Puzrin and Andrey Tupitsin
//
// This software is provided 'as-is', without any express or implied
// warranty. In no event will the authors be held liable for any damages
// arising from the use of this software.
//
// Permission is granted to anyone to use this software for any purpose,
// including commercial applications, and to alter it and redistribute it
// freely, subject to the following restrictions:
//
// 1. The origin of this software must not be misrepresented; you must not
//   claim that you wrote the original software. If you use this software
//   in a product, an acknowledgment in the product documentation would be
//   appreciated but is not required.
// 2. Altered source versions must be plainly marked as such, and must not be
//   misrepresented as being the original software.
// 3. This notice may not be removed or altered from any source distribution.

/* eslint-disable space-unary-ops */



/* Public constants ==========================================================*/
/* ===========================================================================*/


//var Z_FILTERED          = 1;
//var Z_HUFFMAN_ONLY      = 2;
//var Z_RLE               = 3;
var Z_FIXED               = 4;
//var Z_DEFAULT_STRATEGY  = 0;

/* Possible values of the data_type field (though see inflate()) */
var Z_BINARY              = 0;
var Z_TEXT                = 1;
//var Z_ASCII             = 1; // = Z_TEXT
var Z_UNKNOWN             = 2;

/*============================================================================*/


function zero(buf) { var len = buf.length; while (--len >= 0) { buf[len] = 0; } }

// From zutil.h

var STORED_BLOCK = 0;
var STATIC_TREES = 1;
var DYN_TREES    = 2;
/* The three kinds of block type */

var MIN_MATCH    = 3;
var MAX_MATCH    = 258;
/* The minimum and maximum match lengths */

// From deflate.h
/* ===========================================================================
 * Internal compression state.
 */

var LENGTH_CODES  = 29;
/* number of length codes, not counting the special END_BLOCK code */

var LITERALS      = 256;
/* number of literal bytes 0..255 */

var L_CODES       = LITERALS + 1 + LENGTH_CODES;
/* number of Literal or Length codes, including the END_BLOCK code */

var D_CODES       = 30;
/* number of distance codes */

var BL_CODES      = 19;
/* number of codes used to transfer the bit lengths */

var HEAP_SIZE     = 2 * L_CODES + 1;
/* maximum heap size */

var MAX_BITS      = 15;
/* All codes must not exceed MAX_BITS bits */

var Buf_size      = 16;
/* size of bit buffer in bi_buf */


/* ===========================================================================
 * Constants
 */

var MAX_BL_BITS = 7;
/* Bit length codes must not exceed MAX_BL_BITS bits */

var END_BLOCK   = 256;
/* end of block literal code */

var REP_3_6     = 16;
/* repeat previous bit length 3-6 times (2 bits of repeat count) */

var REPZ_3_10   = 17;
/* repeat a zero length 3-10 times  (3 bits of repeat count) */

var REPZ_11_138 = 18;
/* repeat a zero length 11-138 times  (7 bits of repeat count) */

/* eslint-disable comma-spacing,array-bracket-spacing */
var extra_lbits =   /* extra bits for each length code */
  [0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0];

var extra_dbits =   /* extra bits for each distance code */
  [0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13];

var extra_blbits =  /* extra bits for each bit length code */
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,3,7];

var bl_order =
  [16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15];
/* eslint-enable comma-spacing,array-bracket-spacing */

/* The lengths of the bit length codes are sent in order of decreasing
 * probability, to avoid transmitting the lengths for unused bit length codes.
 */

/* ===========================================================================
 * Local data. These are initialized only once.
 */

// We pre-fill arrays with 0 to avoid uninitialized gaps

var DIST_CODE_LEN = 512; /* see definition of array dist_code below */

// !!!! Use flat array instead of structure, Freq = i*2, Len = i*2+1
var static_ltree  = new Array((L_CODES + 2) * 2);
zero(static_ltree);
/* The static literal tree. Since the bit lengths are imposed, there is no
 * need for the L_CODES extra codes used during heap construction. However
 * The codes 286 and 287 are needed to build a canonical tree (see _tr_init
 * below).
 */

var static_dtree  = new Array(D_CODES * 2);
zero(static_dtree);
/* The static distance tree. (Actually a trivial tree since all codes use
 * 5 bits.)
 */

var _dist_code    = new Array(DIST_CODE_LEN);
zero(_dist_code);
/* Distance codes. The first 256 values correspond to the distances
 * 3 .. 258, the last 256 values correspond to the top 8 bits of
 * the 15 bit distances.
 */

var _length_code  = new Array(MAX_MATCH - MIN_MATCH + 1);
zero(_length_code);
/* length code for each normalized match length (0 == MIN_MATCH) */

var base_length   = new Array(LENGTH_CODES);
zero(base_length);
/* First normalized length for each code (0 = MIN_MATCH) */

var base_dist     = new Array(D_CODES);
zero(base_dist);
/* First normalized distance for each code (0 = distance of 1) */


function StaticTreeDesc(static_tree, extra_bits, extra_base, elems, max_length) {

  this.static_tree  = static_tree;  /* static tree or NULL */
  this.extra_bits   = extra_bits;   /* extra bits for each code or NULL */
  this.extra_base   = extra_base;   /* base index for extra_bits */
  this.elems        = elems;        /* max number of elements in the tree */
  this.max_length   = max_length;   /* max bit length for the codes */

  // show if `static_tree` has data or dummy - needed for monomorphic objects
  this.has_stree    = static_tree && static_tree.length;
}


var static_l_desc;
var static_d_desc;
var static_bl_desc;


function TreeDesc(dyn_tree, stat_desc) {
  this.dyn_tree = dyn_tree;     /* the dynamic tree */
  this.max_code = 0;            /* largest code with non zero frequency */
  this.stat_desc = stat_desc;   /* the corresponding static tree */
}



function d_code(dist) {
  return dist < 256 ? _dist_code[dist] : _dist_code[256 + (dist >>> 7)];
}


/* ===========================================================================
 * Output a short LSB first on the stream.
 * IN assertion: there is enough room in pendingBuf.
 */
function put_short(s, w) {
//    put_byte(s, (uch)((w) & 0xff));
//    put_byte(s, (uch)((ush)(w) >> 8));
  s.pending_buf[s.pending++] = (w) & 0xff;
  s.pending_buf[s.pending++] = (w >>> 8) & 0xff;
}


/* ===========================================================================
 * Send a value on a given number of bits.
 * IN assertion: length <= 16 and value fits in length bits.
 */
function send_bits(s, value, length) {
  if (s.bi_valid > (Buf_size - length)) {
    s.bi_buf |= (value << s.bi_valid) & 0xffff;
    put_short(s, s.bi_buf);
    s.bi_buf = value >> (Buf_size - s.bi_valid);
    s.bi_valid += length - Buf_size;
  } else {
    s.bi_buf |= (value << s.bi_valid) & 0xffff;
    s.bi_valid += length;
  }
}


function send_code(s, c, tree) {
  send_bits(s, tree[c * 2]/*.Code*/, tree[c * 2 + 1]/*.Len*/);
}


/* ===========================================================================
 * Reverse the first len bits of a code, using straightforward code (a faster
 * method would use a table)
 * IN assertion: 1 <= len <= 15
 */
function bi_reverse(code, len) {
  var res = 0;
  do {
    res |= code & 1;
    code >>>= 1;
    res <<= 1;
  } while (--len > 0);
  return res >>> 1;
}


/* ===========================================================================
 * Flush the bit buffer, keeping at most 7 bits in it.
 */
function bi_flush(s) {
  if (s.bi_valid === 16) {
    put_short(s, s.bi_buf);
    s.bi_buf = 0;
    s.bi_valid = 0;

  } else if (s.bi_valid >= 8) {
    s.pending_buf[s.pending++] = s.bi_buf & 0xff;
    s.bi_buf >>= 8;
    s.bi_valid -= 8;
  }
}


/* ===========================================================================
 * Compute the optimal bit lengths for a tree and update the total bit length
 * for the current block.
 * IN assertion: the fields freq and dad are set, heap[heap_max] and
 *    above are the tree nodes sorted by increasing frequency.
 * OUT assertions: the field len is set to the optimal bit length, the
 *     array bl_count contains the frequencies for each bit length.
 *     The length opt_len is updated; static_len is also updated if stree is
 *     not null.
 */
function gen_bitlen(s, desc)
//    deflate_state *s;
//    tree_desc *desc;    /* the tree descriptor */
{
  var tree            = desc.dyn_tree;
  var max_code        = desc.max_code;
  var stree           = desc.stat_desc.static_tree;
  var has_stree       = desc.stat_desc.has_stree;
  var extra           = desc.stat_desc.extra_bits;
  var base            = desc.stat_desc.extra_base;
  var max_length      = desc.stat_desc.max_length;
  var h;              /* heap index */
  var n, m;           /* iterate over the tree elements */
  var bits;           /* bit length */
  var xbits;          /* extra bits */
  var f;              /* frequency */
  var overflow = 0;   /* number of elements with bit length too large */

  for (bits = 0; bits <= MAX_BITS; bits++) {
    s.bl_count[bits] = 0;
  }

  /* In a first pass, compute the optimal bit lengths (which may
   * overflow in the case of the bit length tree).
   */
  tree[s.heap[s.heap_max] * 2 + 1]/*.Len*/ = 0; /* root of the heap */

  for (h = s.heap_max + 1; h < HEAP_SIZE; h++) {
    n = s.heap[h];
    bits = tree[tree[n * 2 + 1]/*.Dad*/ * 2 + 1]/*.Len*/ + 1;
    if (bits > max_length) {
      bits = max_length;
      overflow++;
    }
    tree[n * 2 + 1]/*.Len*/ = bits;
    /* We overwrite tree[n].Dad which is no longer needed */

    if (n > max_code) { continue; } /* not a leaf node */

    s.bl_count[bits]++;
    xbits = 0;
    if (n >= base) {
      xbits = extra[n - base];
    }
    f = tree[n * 2]/*.Freq*/;
    s.opt_len += f * (bits + xbits);
    if (has_stree) {
      s.static_len += f * (stree[n * 2 + 1]/*.Len*/ + xbits);
    }
  }
  if (overflow === 0) { return; }

  // Trace((stderr,"\nbit length overflow\n"));
  /* This happens for example on obj2 and pic of the Calgary corpus */

  /* Find the first bit length which could increase: */
  do {
    bits = max_length - 1;
    while (s.bl_count[bits] === 0) { bits--; }
    s.bl_count[bits]--;      /* move one leaf down the tree */
    s.bl_count[bits + 1] += 2; /* move one overflow item as its brother */
    s.bl_count[max_length]--;
    /* The brother of the overflow item also moves one step up,
     * but this does not affect bl_count[max_length]
     */
    overflow -= 2;
  } while (overflow > 0);

  /* Now recompute all bit lengths, scanning in increasing frequency.
   * h is still equal to HEAP_SIZE. (It is simpler to reconstruct all
   * lengths instead of fixing only the wrong ones. This idea is taken
   * from 'ar' written by Haruhiko Okumura.)
   */
  for (bits = max_length; bits !== 0; bits--) {
    n = s.bl_count[bits];
    while (n !== 0) {
      m = s.heap[--h];
      if (m > max_code) { continue; }
      if (tree[m * 2 + 1]/*.Len*/ !== bits) {
        // Trace((stderr,"code %d bits %d->%d\n", m, tree[m].Len, bits));
        s.opt_len += (bits - tree[m * 2 + 1]/*.Len*/) * tree[m * 2]/*.Freq*/;
        tree[m * 2 + 1]/*.Len*/ = bits;
      }
      n--;
    }
  }
}


/* ===========================================================================
 * Generate the codes for a given tree and bit counts (which need not be
 * optimal).
 * IN assertion: the array bl_count contains the bit length statistics for
 * the given tree and the field len is set for all tree elements.
 * OUT assertion: the field code is set for all tree elements of non
 *     zero code length.
 */
function gen_codes(tree, max_code, bl_count)
//    ct_data *tree;             /* the tree to decorate */
//    int max_code;              /* largest code with non zero frequency */
//    ushf *bl_count;            /* number of codes at each bit length */
{
  var next_code = new Array(MAX_BITS + 1); /* next code value for each bit length */
  var code = 0;              /* running code value */
  var bits;                  /* bit index */
  var n;                     /* code index */

  /* The distribution counts are first used to generate the code values
   * without bit reversal.
   */
  for (bits = 1; bits <= MAX_BITS; bits++) {
    next_code[bits] = code = (code + bl_count[bits - 1]) << 1;
  }
  /* Check that the bit counts in bl_count are consistent. The last code
   * must be all ones.
   */
  //Assert (code + bl_count[MAX_BITS]-1 == (1<<MAX_BITS)-1,
  //        "inconsistent bit counts");
  //Tracev((stderr,"\ngen_codes: max_code %d ", max_code));

  for (n = 0;  n <= max_code; n++) {
    var len = tree[n * 2 + 1]/*.Len*/;
    if (len === 0) { continue; }
    /* Now reverse the bits */
    tree[n * 2]/*.Code*/ = bi_reverse(next_code[len]++, len);

    //Tracecv(tree != static_ltree, (stderr,"\nn %3d %c l %2d c %4x (%x) ",
    //     n, (isgraph(n) ? n : ' '), len, tree[n].Code, next_code[len]-1));
  }
}


/* ===========================================================================
 * Initialize the various 'constant' tables.
 */
function tr_static_init() {
  var n;        /* iterates over tree elements */
  var bits;     /* bit counter */
  var length;   /* length value */
  var code;     /* code value */
  var dist;     /* distance index */
  var bl_count = new Array(MAX_BITS + 1);
  /* number of codes at each bit length for an optimal tree */

  // do check in _tr_init()
  //if (static_init_done) return;

  /* For some embedded targets, global variables are not initialized: */
/*#ifdef NO_INIT_GLOBAL_POINTERS
  static_l_desc.static_tree = static_ltree;
  static_l_desc.extra_bits = extra_lbits;
  static_d_desc.static_tree = static_dtree;
  static_d_desc.extra_bits = extra_dbits;
  static_bl_desc.extra_bits = extra_blbits;
#endif*/

  /* Initialize the mapping length (0..255) -> length code (0..28) */
  length = 0;
  for (code = 0; code < LENGTH_CODES - 1; code++) {
    base_length[code] = length;
    for (n = 0; n < (1 << extra_lbits[code]); n++) {
      _length_code[length++] = code;
    }
  }
  //Assert (length == 256, "tr_static_init: length != 256");
  /* Note that the length 255 (match length 258) can be represented
   * in two different ways: code 284 + 5 bits or code 285, so we
   * overwrite length_code[255] to use the best encoding:
   */
  _length_code[length - 1] = code;

  /* Initialize the mapping dist (0..32K) -> dist code (0..29) */
  dist = 0;
  for (code = 0; code < 16; code++) {
    base_dist[code] = dist;
    for (n = 0; n < (1 << extra_dbits[code]); n++) {
      _dist_code[dist++] = code;
    }
  }
  //Assert (dist == 256, "tr_static_init: dist != 256");
  dist >>= 7; /* from now on, all distances are divided by 128 */
  for (; code < D_CODES; code++) {
    base_dist[code] = dist << 7;
    for (n = 0; n < (1 << (extra_dbits[code] - 7)); n++) {
      _dist_code[256 + dist++] = code;
    }
  }
  //Assert (dist == 256, "tr_static_init: 256+dist != 512");

  /* Construct the codes of the static literal tree */
  for (bits = 0; bits <= MAX_BITS; bits++) {
    bl_count[bits] = 0;
  }

  n = 0;
  while (n <= 143) {
    static_ltree[n * 2 + 1]/*.Len*/ = 8;
    n++;
    bl_count[8]++;
  }
  while (n <= 255) {
    static_ltree[n * 2 + 1]/*.Len*/ = 9;
    n++;
    bl_count[9]++;
  }
  while (n <= 279) {
    static_ltree[n * 2 + 1]/*.Len*/ = 7;
    n++;
    bl_count[7]++;
  }
  while (n <= 287) {
    static_ltree[n * 2 + 1]/*.Len*/ = 8;
    n++;
    bl_count[8]++;
  }
  /* Codes 286 and 287 do not exist, but we must include them in the
   * tree construction to get a canonical Huffman tree (longest code
   * all ones)
   */
  gen_codes(static_ltree, L_CODES + 1, bl_count);

  /* The static distance tree is trivial: */
  for (n = 0; n < D_CODES; n++) {
    static_dtree[n * 2 + 1]/*.Len*/ = 5;
    static_dtree[n * 2]/*.Code*/ = bi_reverse(n, 5);
  }

  // Now data ready and we can init static trees
  static_l_desc = new StaticTreeDesc(static_ltree, extra_lbits, LITERALS + 1, L_CODES, MAX_BITS);
  static_d_desc = new StaticTreeDesc(static_dtree, extra_dbits, 0,          D_CODES, MAX_BITS);
  static_bl_desc = new StaticTreeDesc(new Array(0), extra_blbits, 0,         BL_CODES, MAX_BL_BITS);

  //static_init_done = true;
}


/* ===========================================================================
 * Initialize a new block.
 */
function init_block(s) {
  var n; /* iterates over tree elements */

  /* Initialize the trees. */
  for (n = 0; n < L_CODES;  n++) { s.dyn_ltree[n * 2]/*.Freq*/ = 0; }
  for (n = 0; n < D_CODES;  n++) { s.dyn_dtree[n * 2]/*.Freq*/ = 0; }
  for (n = 0; n < BL_CODES; n++) { s.bl_tree[n * 2]/*.Freq*/ = 0; }

  s.dyn_ltree[END_BLOCK * 2]/*.Freq*/ = 1;
  s.opt_len = s.static_len = 0;
  s.last_lit = s.matches = 0;
}


/* ===========================================================================
 * Flush the bit buffer and align the output on a byte boundary
 */
function bi_windup(s)
{
  if (s.bi_valid > 8) {
    put_short(s, s.bi_buf);
  } else if (s.bi_valid > 0) {
    //put_byte(s, (Byte)s->bi_buf);
    s.pending_buf[s.pending++] = s.bi_buf;
  }
  s.bi_buf = 0;
  s.bi_valid = 0;
}

/* ===========================================================================
 * Copy a stored block, storing first the length and its
 * one's complement if requested.
 */
function copy_block(s, buf, len, header)
//DeflateState *s;
//charf    *buf;    /* the input data */
//unsigned len;     /* its length */
//int      header;  /* true if block header must be written */
{
  bi_windup(s);        /* align on byte boundary */

  if (header) {
    put_short(s, len);
    put_short(s, ~len);
  }
//  while (len--) {
//    put_byte(s, *buf++);
//  }
  common.arraySet(s.pending_buf, s.window, buf, len, s.pending);
  s.pending += len;
}

/* ===========================================================================
 * Compares to subtrees, using the tree depth as tie breaker when
 * the subtrees have equal frequency. This minimizes the worst case length.
 */
function smaller(tree, n, m, depth) {
  var _n2 = n * 2;
  var _m2 = m * 2;
  return (tree[_n2]/*.Freq*/ < tree[_m2]/*.Freq*/ ||
         (tree[_n2]/*.Freq*/ === tree[_m2]/*.Freq*/ && depth[n] <= depth[m]));
}

/* ===========================================================================
 * Restore the heap property by moving down the tree starting at node k,
 * exchanging a node with the smallest of its two sons if necessary, stopping
 * when the heap property is re-established (each father smaller than its
 * two sons).
 */
function pqdownheap(s, tree, k)
//    deflate_state *s;
//    ct_data *tree;  /* the tree to restore */
//    int k;               /* node to move down */
{
  var v = s.heap[k];
  var j = k << 1;  /* left son of k */
  while (j <= s.heap_len) {
    /* Set j to the smallest of the two sons: */
    if (j < s.heap_len &&
      smaller(tree, s.heap[j + 1], s.heap[j], s.depth)) {
      j++;
    }
    /* Exit if v is smaller than both sons */
    if (smaller(tree, v, s.heap[j], s.depth)) { break; }

    /* Exchange v with the smallest son */
    s.heap[k] = s.heap[j];
    k = j;

    /* And continue down the tree, setting j to the left son of k */
    j <<= 1;
  }
  s.heap[k] = v;
}


// inlined manually
// var SMALLEST = 1;

/* ===========================================================================
 * Send the block data compressed using the given Huffman trees
 */
function compress_block(s, ltree, dtree)
//    deflate_state *s;
//    const ct_data *ltree; /* literal tree */
//    const ct_data *dtree; /* distance tree */
{
  var dist;           /* distance of matched string */
  var lc;             /* match length or unmatched char (if dist == 0) */
  var lx = 0;         /* running index in l_buf */
  var code;           /* the code to send */
  var extra;          /* number of extra bits to send */

  if (s.last_lit !== 0) {
    do {
      dist = (s.pending_buf[s.d_buf + lx * 2] << 8) | (s.pending_buf[s.d_buf + lx * 2 + 1]);
      lc = s.pending_buf[s.l_buf + lx];
      lx++;

      if (dist === 0) {
        send_code(s, lc, ltree); /* send a literal byte */
        //Tracecv(isgraph(lc), (stderr," '%c' ", lc));
      } else {
        /* Here, lc is the match length - MIN_MATCH */
        code = _length_code[lc];
        send_code(s, code + LITERALS + 1, ltree); /* send the length code */
        extra = extra_lbits[code];
        if (extra !== 0) {
          lc -= base_length[code];
          send_bits(s, lc, extra);       /* send the extra length bits */
        }
        dist--; /* dist is now the match distance - 1 */
        code = d_code(dist);
        //Assert (code < D_CODES, "bad d_code");

        send_code(s, code, dtree);       /* send the distance code */
        extra = extra_dbits[code];
        if (extra !== 0) {
          dist -= base_dist[code];
          send_bits(s, dist, extra);   /* send the extra distance bits */
        }
      } /* literal or match pair ? */

      /* Check that the overlay between pending_buf and d_buf+l_buf is ok: */
      //Assert((uInt)(s->pending) < s->lit_bufsize + 2*lx,
      //       "pendingBuf overflow");

    } while (lx < s.last_lit);
  }

  send_code(s, END_BLOCK, ltree);
}


/* ===========================================================================
 * Construct one Huffman tree and assigns the code bit strings and lengths.
 * Update the total bit length for the current block.
 * IN assertion: the field freq is set for all tree elements.
 * OUT assertions: the fields len and code are set to the optimal bit length
 *     and corresponding code. The length opt_len is updated; static_len is
 *     also updated if stree is not null. The field max_code is set.
 */
function build_tree(s, desc)
//    deflate_state *s;
//    tree_desc *desc; /* the tree descriptor */
{
  var tree     = desc.dyn_tree;
  var stree    = desc.stat_desc.static_tree;
  var has_stree = desc.stat_desc.has_stree;
  var elems    = desc.stat_desc.elems;
  var n, m;          /* iterate over heap elements */
  var max_code = -1; /* largest code with non zero frequency */
  var node;          /* new node being created */

  /* Construct the initial heap, with least frequent element in
   * heap[SMALLEST]. The sons of heap[n] are heap[2*n] and heap[2*n+1].
   * heap[0] is not used.
   */
  s.heap_len = 0;
  s.heap_max = HEAP_SIZE;

  for (n = 0; n < elems; n++) {
    if (tree[n * 2]/*.Freq*/ !== 0) {
      s.heap[++s.heap_len] = max_code = n;
      s.depth[n] = 0;

    } else {
      tree[n * 2 + 1]/*.Len*/ = 0;
    }
  }

  /* The pkzip format requires that at least one distance code exists,
   * and that at least one bit should be sent even if there is only one
   * possible code. So to avoid special checks later on we force at least
   * two codes of non zero frequency.
   */
  while (s.heap_len < 2) {
    node = s.heap[++s.heap_len] = (max_code < 2 ? ++max_code : 0);
    tree[node * 2]/*.Freq*/ = 1;
    s.depth[node] = 0;
    s.opt_len--;

    if (has_stree) {
      s.static_len -= stree[node * 2 + 1]/*.Len*/;
    }
    /* node is 0 or 1 so it does not have extra bits */
  }
  desc.max_code = max_code;

  /* The elements heap[heap_len/2+1 .. heap_len] are leaves of the tree,
   * establish sub-heaps of increasing lengths:
   */
  for (n = (s.heap_len >> 1/*int /2*/); n >= 1; n--) { pqdownheap(s, tree, n); }

  /* Construct the Huffman tree by repeatedly combining the least two
   * frequent nodes.
   */
  node = elems;              /* next internal node of the tree */
  do {
    //pqremove(s, tree, n);  /* n = node of least frequency */
    /*** pqremove ***/
    n = s.heap[1/*SMALLEST*/];
    s.heap[1/*SMALLEST*/] = s.heap[s.heap_len--];
    pqdownheap(s, tree, 1/*SMALLEST*/);
    /***/

    m = s.heap[1/*SMALLEST*/]; /* m = node of next least frequency */

    s.heap[--s.heap_max] = n; /* keep the nodes sorted by frequency */
    s.heap[--s.heap_max] = m;

    /* Create a new node father of n and m */
    tree[node * 2]/*.Freq*/ = tree[n * 2]/*.Freq*/ + tree[m * 2]/*.Freq*/;
    s.depth[node] = (s.depth[n] >= s.depth[m] ? s.depth[n] : s.depth[m]) + 1;
    tree[n * 2 + 1]/*.Dad*/ = tree[m * 2 + 1]/*.Dad*/ = node;

    /* and insert the new node in the heap */
    s.heap[1/*SMALLEST*/] = node++;
    pqdownheap(s, tree, 1/*SMALLEST*/);

  } while (s.heap_len >= 2);

  s.heap[--s.heap_max] = s.heap[1/*SMALLEST*/];

  /* At this point, the fields freq and dad are set. We can now
   * generate the bit lengths.
   */
  gen_bitlen(s, desc);

  /* The field len is now set, we can generate the bit codes */
  gen_codes(tree, max_code, s.bl_count);
}


/* ===========================================================================
 * Scan a literal or distance tree to determine the frequencies of the codes
 * in the bit length tree.
 */
function scan_tree(s, tree, max_code)
//    deflate_state *s;
//    ct_data *tree;   /* the tree to be scanned */
//    int max_code;    /* and its largest code of non zero frequency */
{
  var n;                     /* iterates over all tree elements */
  var prevlen = -1;          /* last emitted length */
  var curlen;                /* length of current code */

  var nextlen = tree[0 * 2 + 1]/*.Len*/; /* length of next code */

  var count = 0;             /* repeat count of the current code */
  var max_count = 7;         /* max repeat count */
  var min_count = 4;         /* min repeat count */

  if (nextlen === 0) {
    max_count = 138;
    min_count = 3;
  }
  tree[(max_code + 1) * 2 + 1]/*.Len*/ = 0xffff; /* guard */

  for (n = 0; n <= max_code; n++) {
    curlen = nextlen;
    nextlen = tree[(n + 1) * 2 + 1]/*.Len*/;

    if (++count < max_count && curlen === nextlen) {
      continue;

    } else if (count < min_count) {
      s.bl_tree[curlen * 2]/*.Freq*/ += count;

    } else if (curlen !== 0) {

      if (curlen !== prevlen) { s.bl_tree[curlen * 2]/*.Freq*/++; }
      s.bl_tree[REP_3_6 * 2]/*.Freq*/++;

    } else if (count <= 10) {
      s.bl_tree[REPZ_3_10 * 2]/*.Freq*/++;

    } else {
      s.bl_tree[REPZ_11_138 * 2]/*.Freq*/++;
    }

    count = 0;
    prevlen = curlen;

    if (nextlen === 0) {
      max_count = 138;
      min_count = 3;

    } else if (curlen === nextlen) {
      max_count = 6;
      min_count = 3;

    } else {
      max_count = 7;
      min_count = 4;
    }
  }
}


/* ===========================================================================
 * Send a literal or distance tree in compressed form, using the codes in
 * bl_tree.
 */
function send_tree(s, tree, max_code)
//    deflate_state *s;
//    ct_data *tree; /* the tree to be scanned */
//    int max_code;       /* and its largest code of non zero frequency */
{
  var n;                     /* iterates over all tree elements */
  var prevlen = -1;          /* last emitted length */
  var curlen;                /* length of current code */

  var nextlen = tree[0 * 2 + 1]/*.Len*/; /* length of next code */

  var count = 0;             /* repeat count of the current code */
  var max_count = 7;         /* max repeat count */
  var min_count = 4;         /* min repeat count */

  /* tree[max_code+1].Len = -1; */  /* guard already set */
  if (nextlen === 0) {
    max_count = 138;
    min_count = 3;
  }

  for (n = 0; n <= max_code; n++) {
    curlen = nextlen;
    nextlen = tree[(n + 1) * 2 + 1]/*.Len*/;

    if (++count < max_count && curlen === nextlen) {
      continue;

    } else if (count < min_count) {
      do { send_code(s, curlen, s.bl_tree); } while (--count !== 0);

    } else if (curlen !== 0) {
      if (curlen !== prevlen) {
        send_code(s, curlen, s.bl_tree);
        count--;
      }
      //Assert(count >= 3 && count <= 6, " 3_6?");
      send_code(s, REP_3_6, s.bl_tree);
      send_bits(s, count - 3, 2);

    } else if (count <= 10) {
      send_code(s, REPZ_3_10, s.bl_tree);
      send_bits(s, count - 3, 3);

    } else {
      send_code(s, REPZ_11_138, s.bl_tree);
      send_bits(s, count - 11, 7);
    }

    count = 0;
    prevlen = curlen;
    if (nextlen === 0) {
      max_count = 138;
      min_count = 3;

    } else if (curlen === nextlen) {
      max_count = 6;
      min_count = 3;

    } else {
      max_count = 7;
      min_count = 4;
    }
  }
}


/* ===========================================================================
 * Construct the Huffman tree for the bit lengths and return the index in
 * bl_order of the last bit length code to send.
 */
function build_bl_tree(s) {
  var max_blindex;  /* index of last bit length code of non zero freq */

  /* Determine the bit length frequencies for literal and distance trees */
  scan_tree(s, s.dyn_ltree, s.l_desc.max_code);
  scan_tree(s, s.dyn_dtree, s.d_desc.max_code);

  /* Build the bit length tree: */
  build_tree(s, s.bl_desc);
  /* opt_len now includes the length of the tree representations, except
   * the lengths of the bit lengths codes and the 5+5+4 bits for the counts.
   */

  /* Determine the number of bit length codes to send. The pkzip format
   * requires that at least 4 bit length codes be sent. (appnote.txt says
   * 3 but the actual value used is 4.)
   */
  for (max_blindex = BL_CODES - 1; max_blindex >= 3; max_blindex--) {
    if (s.bl_tree[bl_order[max_blindex] * 2 + 1]/*.Len*/ !== 0) {
      break;
    }
  }
  /* Update opt_len to include the bit length tree and counts */
  s.opt_len += 3 * (max_blindex + 1) + 5 + 5 + 4;
  //Tracev((stderr, "\ndyn trees: dyn %ld, stat %ld",
  //        s->opt_len, s->static_len));

  return max_blindex;
}


/* ===========================================================================
 * Send the header for a block using dynamic Huffman trees: the counts, the
 * lengths of the bit length codes, the literal tree and the distance tree.
 * IN assertion: lcodes >= 257, dcodes >= 1, blcodes >= 4.
 */
function send_all_trees(s, lcodes, dcodes, blcodes)
//    deflate_state *s;
//    int lcodes, dcodes, blcodes; /* number of codes for each tree */
{
  var rank;                    /* index in bl_order */

  //Assert (lcodes >= 257 && dcodes >= 1 && blcodes >= 4, "not enough codes");
  //Assert (lcodes <= L_CODES && dcodes <= D_CODES && blcodes <= BL_CODES,
  //        "too many codes");
  //Tracev((stderr, "\nbl counts: "));
  send_bits(s, lcodes - 257, 5); /* not +255 as stated in appnote.txt */
  send_bits(s, dcodes - 1,   5);
  send_bits(s, blcodes - 4,  4); /* not -3 as stated in appnote.txt */
  for (rank = 0; rank < blcodes; rank++) {
    //Tracev((stderr, "\nbl code %2d ", bl_order[rank]));
    send_bits(s, s.bl_tree[bl_order[rank] * 2 + 1]/*.Len*/, 3);
  }
  //Tracev((stderr, "\nbl tree: sent %ld", s->bits_sent));

  send_tree(s, s.dyn_ltree, lcodes - 1); /* literal tree */
  //Tracev((stderr, "\nlit tree: sent %ld", s->bits_sent));

  send_tree(s, s.dyn_dtree, dcodes - 1); /* distance tree */
  //Tracev((stderr, "\ndist tree: sent %ld", s->bits_sent));
}


/* ===========================================================================
 * Check if the data type is TEXT or BINARY, using the following algorithm:
 * - TEXT if the two conditions below are satisfied:
 *    a) There are no non-portable control characters belonging to the
 *       "black list" (0..6, 14..25, 28..31).
 *    b) There is at least one printable character belonging to the
 *       "white list" (9 {TAB}, 10 {LF}, 13 {CR}, 32..255).
 * - BINARY otherwise.
 * - The following partially-portable control characters form a
 *   "gray list" that is ignored in this detection algorithm:
 *   (7 {BEL}, 8 {BS}, 11 {VT}, 12 {FF}, 26 {SUB}, 27 {ESC}).
 * IN assertion: the fields Freq of dyn_ltree are set.
 */
function detect_data_type(s) {
  /* black_mask is the bit mask of black-listed bytes
   * set bits 0..6, 14..25, and 28..31
   * 0xf3ffc07f = binary 11110011111111111100000001111111
   */
  var black_mask = 0xf3ffc07f;
  var n;

  /* Check for non-textual ("black-listed") bytes. */
  for (n = 0; n <= 31; n++, black_mask >>>= 1) {
    if ((black_mask & 1) && (s.dyn_ltree[n * 2]/*.Freq*/ !== 0)) {
      return Z_BINARY;
    }
  }

  /* Check for textual ("white-listed") bytes. */
  if (s.dyn_ltree[9 * 2]/*.Freq*/ !== 0 || s.dyn_ltree[10 * 2]/*.Freq*/ !== 0 ||
      s.dyn_ltree[13 * 2]/*.Freq*/ !== 0) {
    return Z_TEXT;
  }
  for (n = 32; n < LITERALS; n++) {
    if (s.dyn_ltree[n * 2]/*.Freq*/ !== 0) {
      return Z_TEXT;
    }
  }

  /* There are no "black-listed" or "white-listed" bytes:
   * this stream either is empty or has tolerated ("gray-listed") bytes only.
   */
  return Z_BINARY;
}


var static_init_done = false;

/* ===========================================================================
 * Initialize the tree data structures for a new zlib stream.
 */
function _tr_init(s)
{

  if (!static_init_done) {
    tr_static_init();
    static_init_done = true;
  }

  s.l_desc  = new TreeDesc(s.dyn_ltree, static_l_desc);
  s.d_desc  = new TreeDesc(s.dyn_dtree, static_d_desc);
  s.bl_desc = new TreeDesc(s.bl_tree, static_bl_desc);

  s.bi_buf = 0;
  s.bi_valid = 0;

  /* Initialize the first block of the first file: */
  init_block(s);
}


/* ===========================================================================
 * Send a stored block
 */
function _tr_stored_block(s, buf, stored_len, last)
//DeflateState *s;
//charf *buf;       /* input block */
//ulg stored_len;   /* length of input block */
//int last;         /* one if this is the last block for a file */
{
  send_bits(s, (STORED_BLOCK << 1) + (last ? 1 : 0), 3);    /* send block type */
  copy_block(s, buf, stored_len, true); /* with header */
}


/* ===========================================================================
 * Send one empty static block to give enough lookahead for inflate.
 * This takes 10 bits, of which 7 may remain in the bit buffer.
 */
function _tr_align(s) {
  send_bits(s, STATIC_TREES << 1, 3);
  send_code(s, END_BLOCK, static_ltree);
  bi_flush(s);
}


/* ===========================================================================
 * Determine the best encoding for the current block: dynamic trees, static
 * trees or store, and output the encoded block to the zip file.
 */
function _tr_flush_block(s, buf, stored_len, last)
//DeflateState *s;
//charf *buf;       /* input block, or NULL if too old */
//ulg stored_len;   /* length of input block */
//int last;         /* one if this is the last block for a file */
{
  var opt_lenb, static_lenb;  /* opt_len and static_len in bytes */
  var max_blindex = 0;        /* index of last bit length code of non zero freq */

  /* Build the Huffman trees unless a stored block is forced */
  if (s.level > 0) {

    /* Check if the file is binary or text */
    if (s.strm.data_type === Z_UNKNOWN) {
      s.strm.data_type = detect_data_type(s);
    }

    /* Construct the literal and distance trees */
    build_tree(s, s.l_desc);
    // Tracev((stderr, "\nlit data: dyn %ld, stat %ld", s->opt_len,
    //        s->static_len));

    build_tree(s, s.d_desc);
    // Tracev((stderr, "\ndist data: dyn %ld, stat %ld", s->opt_len,
    //        s->static_len));
    /* At this point, opt_len and static_len are the total bit lengths of
     * the compressed block data, excluding the tree representations.
     */

    /* Build the bit length tree for the above two trees, and get the index
     * in bl_order of the last bit length code to send.
     */
    max_blindex = build_bl_tree(s);

    /* Determine the best encoding. Compute the block lengths in bytes. */
    opt_lenb = (s.opt_len + 3 + 7) >>> 3;
    static_lenb = (s.static_len + 3 + 7) >>> 3;

    // Tracev((stderr, "\nopt %lu(%lu) stat %lu(%lu) stored %lu lit %u ",
    //        opt_lenb, s->opt_len, static_lenb, s->static_len, stored_len,
    //        s->last_lit));

    if (static_lenb <= opt_lenb) { opt_lenb = static_lenb; }

  } else {
    // Assert(buf != (char*)0, "lost buf");
    opt_lenb = static_lenb = stored_len + 5; /* force a stored block */
  }

  if ((stored_len + 4 <= opt_lenb) && (buf !== -1)) {
    /* 4: two words for the lengths */

    /* The test buf != NULL is only necessary if LIT_BUFSIZE > WSIZE.
     * Otherwise we can't have processed more than WSIZE input bytes since
     * the last block flush, because compression would have been
     * successful. If LIT_BUFSIZE <= WSIZE, it is never too late to
     * transform a block into a stored block.
     */
    _tr_stored_block(s, buf, stored_len, last);

  } else if (s.strategy === Z_FIXED || static_lenb === opt_lenb) {

    send_bits(s, (STATIC_TREES << 1) + (last ? 1 : 0), 3);
    compress_block(s, static_ltree, static_dtree);

  } else {
    send_bits(s, (DYN_TREES << 1) + (last ? 1 : 0), 3);
    send_all_trees(s, s.l_desc.max_code + 1, s.d_desc.max_code + 1, max_blindex + 1);
    compress_block(s, s.dyn_ltree, s.dyn_dtree);
  }
  // Assert (s->compressed_len == s->bits_sent, "bad compressed size");
  /* The above check is made mod 2^32, for files larger than 512 MB
   * and uLong implemented on 32 bits.
   */
  init_block(s);

  if (last) {
    bi_windup(s);
  }
  // Tracev((stderr,"\ncomprlen %lu(%lu) ", s->compressed_len>>3,
  //       s->compressed_len-7*last));
}

/* ===========================================================================
 * Save the match info and tally the frequency counts. Return true if
 * the current block must be flushed.
 */
function _tr_tally(s, dist, lc)
//    deflate_state *s;
//    unsigned dist;  /* distance of matched string */
//    unsigned lc;    /* match length-MIN_MATCH or unmatched char (if dist==0) */
{
  //var out_length, in_length, dcode;

  s.pending_buf[s.d_buf + s.last_lit * 2]     = (dist >>> 8) & 0xff;
  s.pending_buf[s.d_buf + s.last_lit * 2 + 1] = dist & 0xff;

  s.pending_buf[s.l_buf + s.last_lit] = lc & 0xff;
  s.last_lit++;

  if (dist === 0) {
    /* lc is the unmatched char */
    s.dyn_ltree[lc * 2]/*.Freq*/++;
  } else {
    s.matches++;
    /* Here, lc is the match length - MIN_MATCH */
    dist--;             /* dist = match distance - 1 */
    //Assert((ush)dist < (ush)MAX_DIST(s) &&
    //       (ush)lc <= (ush)(MAX_MATCH-MIN_MATCH) &&
    //       (ush)d_code(dist) < (ush)D_CODES,  "_tr_tally: bad match");

    s.dyn_ltree[(_length_code[lc] + LITERALS + 1) * 2]/*.Freq*/++;
    s.dyn_dtree[d_code(dist) * 2]/*.Freq*/++;
  }

// (!) This block is disabled in zlib defaults,
// don't enable it for binary compatibility

//#ifdef TRUNCATE_BLOCK
//  /* Try to guess if it is profitable to stop the current block here */
//  if ((s.last_lit & 0x1fff) === 0 && s.level > 2) {
//    /* Compute an upper bound for the compressed length */
//    out_length = s.last_lit*8;
//    in_length = s.strstart - s.block_start;
//
//    for (dcode = 0; dcode < D_CODES; dcode++) {
//      out_length += s.dyn_dtree[dcode*2]/*.Freq*/ * (5 + extra_dbits[dcode]);
//    }
//    out_length >>>= 3;
//    //Tracev((stderr,"\nlast_lit %u, in %ld, out ~%ld(%ld%%) ",
//    //       s->last_lit, in_length, out_length,
//    //       100L - out_length*100L/in_length));
//    if (s.matches < (s.last_lit>>1)/*int /2*/ && out_length < (in_length>>1)/*int /2*/) {
//      return true;
//    }
//  }
//#endif

  return (s.last_lit === s.lit_bufsize - 1);
  /* We avoid equality with lit_bufsize because of wraparound at 64K
   * on 16 bit machines and because stored blocks are restricted to
   * 64K-1 bytes.
   */
}

var _tr_init_1  = _tr_init;
var _tr_stored_block_1 = _tr_stored_block;
var _tr_flush_block_1  = _tr_flush_block;
var _tr_tally_1 = _tr_tally;
var _tr_align_1 = _tr_align;

var trees = {
	_tr_init: _tr_init_1,
	_tr_stored_block: _tr_stored_block_1,
	_tr_flush_block: _tr_flush_block_1,
	_tr_tally: _tr_tally_1,
	_tr_align: _tr_align_1
};

// Note: adler32 takes 12% for level 0 and 2% for level 6.
// It isn't worth it to make additional optimizations as in original.
// Small size is preferable.

// (C) 1995-2013 Jean-loup Gailly and Mark Adler
// (C) 2014-2017 Vitaly Puzrin and Andrey Tupitsin
//
// This software is provided 'as-is', without any express or implied
// warranty. In no event will the authors be held liable for any damages
// arising from the use of this software.
//
// Permission is granted to anyone to use this software for any purpose,
// including commercial applications, and to alter it and redistribute it
// freely, subject to the following restrictions:
//
// 1. The origin of this software must not be misrepresented; you must not
//   claim that you wrote the original software. If you use this software
//   in a product, an acknowledgment in the product documentation would be
//   appreciated but is not required.
// 2. Altered source versions must be plainly marked as such, and must not be
//   misrepresented as being the original software.
// 3. This notice may not be removed or altered from any source distribution.

function adler32(adler, buf, len, pos) {
  var s1 = (adler & 0xffff) |0,
      s2 = ((adler >>> 16) & 0xffff) |0,
      n = 0;

  while (len !== 0) {
    // Set limit ~ twice less than 5552, to keep
    // s2 in 31-bits, because we force signed ints.
    // in other case %= will fail.
    n = len > 2000 ? 2000 : len;
    len -= n;

    do {
      s1 = (s1 + buf[pos++]) |0;
      s2 = (s2 + s1) |0;
    } while (--n);

    s1 %= 65521;
    s2 %= 65521;
  }

  return (s1 | (s2 << 16)) |0;
}


var adler32_1 = adler32;

// Note: we can't get significant speed boost here.
// So write code to minimize size - no pregenerated tables
// and array tools dependencies.

// (C) 1995-2013 Jean-loup Gailly and Mark Adler
// (C) 2014-2017 Vitaly Puzrin and Andrey Tupitsin
//
// This software is provided 'as-is', without any express or implied
// warranty. In no event will the authors be held liable for any damages
// arising from the use of this software.
//
// Permission is granted to anyone to use this software for any purpose,
// including commercial applications, and to alter it and redistribute it
// freely, subject to the following restrictions:
//
// 1. The origin of this software must not be misrepresented; you must not
//   claim that you wrote the original software. If you use this software
//   in a product, an acknowledgment in the product documentation would be
//   appreciated but is not required.
// 2. Altered source versions must be plainly marked as such, and must not be
//   misrepresented as being the original software.
// 3. This notice may not be removed or altered from any source distribution.

// Use ordinary array, since untyped makes no boost here
function makeTable() {
  var c, table = [];

  for (var n = 0; n < 256; n++) {
    c = n;
    for (var k = 0; k < 8; k++) {
      c = ((c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));
    }
    table[n] = c;
  }

  return table;
}

// Create table on load. Just 255 signed longs. Not a problem.
var crcTable = makeTable();


function crc32(crc, buf, len, pos) {
  var t = crcTable,
      end = pos + len;

  crc ^= -1;

  for (var i = pos; i < end; i++) {
    crc = (crc >>> 8) ^ t[(crc ^ buf[i]) & 0xFF];
  }

  return (crc ^ (-1)); // >>> 0;
}


var crc32_1 = crc32;

// (C) 1995-2013 Jean-loup Gailly and Mark Adler
// (C) 2014-2017 Vitaly Puzrin and Andrey Tupitsin
//
// This software is provided 'as-is', without any express or implied
// warranty. In no event will the authors be held liable for any damages
// arising from the use of this software.
//
// Permission is granted to anyone to use this software for any purpose,
// including commercial applications, and to alter it and redistribute it
// freely, subject to the following restrictions:
//
// 1. The origin of this software must not be misrepresented; you must not
//   claim that you wrote the original software. If you use this software
//   in a product, an acknowledgment in the product documentation would be
//   appreciated but is not required.
// 2. Altered source versions must be plainly marked as such, and must not be
//   misrepresented as being the original software.
// 3. This notice may not be removed or altered from any source distribution.

var messages = {
  2:      'need dictionary',     /* Z_NEED_DICT       2  */
  1:      'stream end',          /* Z_STREAM_END      1  */
  0:      '',                    /* Z_OK              0  */
  '-1':   'file error',          /* Z_ERRNO         (-1) */
  '-2':   'stream error',        /* Z_STREAM_ERROR  (-2) */
  '-3':   'data error',          /* Z_DATA_ERROR    (-3) */
  '-4':   'insufficient memory', /* Z_MEM_ERROR     (-4) */
  '-5':   'buffer error',        /* Z_BUF_ERROR     (-5) */
  '-6':   'incompatible version' /* Z_VERSION_ERROR (-6) */
};

// (C) 1995-2013 Jean-loup Gailly and Mark Adler
// (C) 2014-2017 Vitaly Puzrin and Andrey Tupitsin
//
// This software is provided 'as-is', without any express or implied
// warranty. In no event will the authors be held liable for any damages
// arising from the use of this software.
//
// Permission is granted to anyone to use this software for any purpose,
// including commercial applications, and to alter it and redistribute it
// freely, subject to the following restrictions:
//
// 1. The origin of this software must not be misrepresented; you must not
//   claim that you wrote the original software. If you use this software
//   in a product, an acknowledgment in the product documentation would be
//   appreciated but is not required.
// 2. Altered source versions must be plainly marked as such, and must not be
//   misrepresented as being the original software.
// 3. This notice may not be removed or altered from any source distribution.







/* Public constants ==========================================================*/
/* ===========================================================================*/


/* Allowed flush values; see deflate() and inflate() below for details */
var Z_NO_FLUSH      = 0;
var Z_PARTIAL_FLUSH = 1;
//var Z_SYNC_FLUSH    = 2;
var Z_FULL_FLUSH    = 3;
var Z_FINISH        = 4;
var Z_BLOCK         = 5;
//var Z_TREES         = 6;


/* Return codes for the compression/decompression functions. Negative values
 * are errors, positive values are used for special but normal events.
 */
var Z_OK            = 0;
var Z_STREAM_END    = 1;
//var Z_NEED_DICT     = 2;
//var Z_ERRNO         = -1;
var Z_STREAM_ERROR  = -2;
var Z_DATA_ERROR    = -3;
//var Z_MEM_ERROR     = -4;
var Z_BUF_ERROR     = -5;
//var Z_VERSION_ERROR = -6;


/* compression levels */
//var Z_NO_COMPRESSION      = 0;
//var Z_BEST_SPEED          = 1;
//var Z_BEST_COMPRESSION    = 9;
var Z_DEFAULT_COMPRESSION = -1;


var Z_FILTERED            = 1;
var Z_HUFFMAN_ONLY        = 2;
var Z_RLE                 = 3;
var Z_FIXED$1               = 4;
var Z_DEFAULT_STRATEGY    = 0;

/* Possible values of the data_type field (though see inflate()) */
//var Z_BINARY              = 0;
//var Z_TEXT                = 1;
//var Z_ASCII               = 1; // = Z_TEXT
var Z_UNKNOWN$1             = 2;


/* The deflate compression method */
var Z_DEFLATED  = 8;

/*============================================================================*/


var MAX_MEM_LEVEL = 9;
/* Maximum value for memLevel in deflateInit2 */
var MAX_WBITS = 15;
/* 32K LZ77 window */
var DEF_MEM_LEVEL = 8;


var LENGTH_CODES$1  = 29;
/* number of length codes, not counting the special END_BLOCK code */
var LITERALS$1      = 256;
/* number of literal bytes 0..255 */
var L_CODES$1       = LITERALS$1 + 1 + LENGTH_CODES$1;
/* number of Literal or Length codes, including the END_BLOCK code */
var D_CODES$1       = 30;
/* number of distance codes */
var BL_CODES$1      = 19;
/* number of codes used to transfer the bit lengths */
var HEAP_SIZE$1     = 2 * L_CODES$1 + 1;
/* maximum heap size */
var MAX_BITS$1  = 15;
/* All codes must not exceed MAX_BITS bits */

var MIN_MATCH$1 = 3;
var MAX_MATCH$1 = 258;
var MIN_LOOKAHEAD = (MAX_MATCH$1 + MIN_MATCH$1 + 1);

var PRESET_DICT = 0x20;

var INIT_STATE = 42;
var EXTRA_STATE = 69;
var NAME_STATE = 73;
var COMMENT_STATE = 91;
var HCRC_STATE = 103;
var BUSY_STATE = 113;
var FINISH_STATE = 666;

var BS_NEED_MORE      = 1; /* block not completed, need more input or more output */
var BS_BLOCK_DONE     = 2; /* block flush performed */
var BS_FINISH_STARTED = 3; /* finish started, need only more output at next deflate */
var BS_FINISH_DONE    = 4; /* finish done, accept no more input or output */

var OS_CODE = 0x03; // Unix :) . Don't detect, use this default.

function err(strm, errorCode) {
  strm.msg = messages[errorCode];
  return errorCode;
}

function rank(f) {
  return ((f) << 1) - ((f) > 4 ? 9 : 0);
}

function zero$1(buf) { var len = buf.length; while (--len >= 0) { buf[len] = 0; } }


/* =========================================================================
 * Flush as much pending output as possible. All deflate() output goes
 * through this function so some applications may wish to modify it
 * to avoid allocating a large strm->output buffer and copying into it.
 * (See also read_buf()).
 */
function flush_pending(strm) {
  var s = strm.state;

  //_tr_flush_bits(s);
  var len = s.pending;
  if (len > strm.avail_out) {
    len = strm.avail_out;
  }
  if (len === 0) { return; }

  common.arraySet(strm.output, s.pending_buf, s.pending_out, len, strm.next_out);
  strm.next_out += len;
  s.pending_out += len;
  strm.total_out += len;
  strm.avail_out -= len;
  s.pending -= len;
  if (s.pending === 0) {
    s.pending_out = 0;
  }
}


function flush_block_only(s, last) {
  trees._tr_flush_block(s, (s.block_start >= 0 ? s.block_start : -1), s.strstart - s.block_start, last);
  s.block_start = s.strstart;
  flush_pending(s.strm);
}


function put_byte(s, b) {
  s.pending_buf[s.pending++] = b;
}


/* =========================================================================
 * Put a short in the pending buffer. The 16-bit value is put in MSB order.
 * IN assertion: the stream state is correct and there is enough room in
 * pending_buf.
 */
function putShortMSB(s, b) {
//  put_byte(s, (Byte)(b >> 8));
//  put_byte(s, (Byte)(b & 0xff));
  s.pending_buf[s.pending++] = (b >>> 8) & 0xff;
  s.pending_buf[s.pending++] = b & 0xff;
}


/* ===========================================================================
 * Read a new buffer from the current input stream, update the adler32
 * and total number of bytes read.  All deflate() input goes through
 * this function so some applications may wish to modify it to avoid
 * allocating a large strm->input buffer and copying from it.
 * (See also flush_pending()).
 */
function read_buf(strm, buf, start, size) {
  var len = strm.avail_in;

  if (len > size) { len = size; }
  if (len === 0) { return 0; }

  strm.avail_in -= len;

  // zmemcpy(buf, strm->next_in, len);
  common.arraySet(buf, strm.input, strm.next_in, len, start);
  if (strm.state.wrap === 1) {
    strm.adler = adler32_1(strm.adler, buf, len, start);
  }

  else if (strm.state.wrap === 2) {
    strm.adler = crc32_1(strm.adler, buf, len, start);
  }

  strm.next_in += len;
  strm.total_in += len;

  return len;
}


/* ===========================================================================
 * Set match_start to the longest match starting at the given string and
 * return its length. Matches shorter or equal to prev_length are discarded,
 * in which case the result is equal to prev_length and match_start is
 * garbage.
 * IN assertions: cur_match is the head of the hash chain for the current
 *   string (strstart) and its distance is <= MAX_DIST, and prev_length >= 1
 * OUT assertion: the match length is not greater than s->lookahead.
 */
function longest_match(s, cur_match) {
  var chain_length = s.max_chain_length;      /* max hash chain length */
  var scan = s.strstart; /* current string */
  var match;                       /* matched string */
  var len;                           /* length of current match */
  var best_len = s.prev_length;              /* best match length so far */
  var nice_match = s.nice_match;             /* stop if match long enough */
  var limit = (s.strstart > (s.w_size - MIN_LOOKAHEAD)) ?
      s.strstart - (s.w_size - MIN_LOOKAHEAD) : 0/*NIL*/;

  var _win = s.window; // shortcut

  var wmask = s.w_mask;
  var prev  = s.prev;

  /* Stop when cur_match becomes <= limit. To simplify the code,
   * we prevent matches with the string of window index 0.
   */

  var strend = s.strstart + MAX_MATCH$1;
  var scan_end1  = _win[scan + best_len - 1];
  var scan_end   = _win[scan + best_len];

  /* The code is optimized for HASH_BITS >= 8 and MAX_MATCH-2 multiple of 16.
   * It is easy to get rid of this optimization if necessary.
   */
  // Assert(s->hash_bits >= 8 && MAX_MATCH == 258, "Code too clever");

  /* Do not waste too much time if we already have a good match: */
  if (s.prev_length >= s.good_match) {
    chain_length >>= 2;
  }
  /* Do not look for matches beyond the end of the input. This is necessary
   * to make deflate deterministic.
   */
  if (nice_match > s.lookahead) { nice_match = s.lookahead; }

  // Assert((ulg)s->strstart <= s->window_size-MIN_LOOKAHEAD, "need lookahead");

  do {
    // Assert(cur_match < s->strstart, "no future");
    match = cur_match;

    /* Skip to next match if the match length cannot increase
     * or if the match length is less than 2.  Note that the checks below
     * for insufficient lookahead only occur occasionally for performance
     * reasons.  Therefore uninitialized memory will be accessed, and
     * conditional jumps will be made that depend on those values.
     * However the length of the match is limited to the lookahead, so
     * the output of deflate is not affected by the uninitialized values.
     */

    if (_win[match + best_len]     !== scan_end  ||
        _win[match + best_len - 1] !== scan_end1 ||
        _win[match]                !== _win[scan] ||
        _win[++match]              !== _win[scan + 1]) {
      continue;
    }

    /* The check at best_len-1 can be removed because it will be made
     * again later. (This heuristic is not always a win.)
     * It is not necessary to compare scan[2] and match[2] since they
     * are always equal when the other bytes match, given that
     * the hash keys are equal and that HASH_BITS >= 8.
     */
    scan += 2;
    match++;
    // Assert(*scan == *match, "match[2]?");

    /* We check for insufficient lookahead only every 8th comparison;
     * the 256th check will be made at strstart+258.
     */
    do {
      /*jshint noempty:false*/
    } while (_win[++scan] === _win[++match] && _win[++scan] === _win[++match] &&
             _win[++scan] === _win[++match] && _win[++scan] === _win[++match] &&
             _win[++scan] === _win[++match] && _win[++scan] === _win[++match] &&
             _win[++scan] === _win[++match] && _win[++scan] === _win[++match] &&
             scan < strend);

    // Assert(scan <= s->window+(unsigned)(s->window_size-1), "wild scan");

    len = MAX_MATCH$1 - (strend - scan);
    scan = strend - MAX_MATCH$1;

    if (len > best_len) {
      s.match_start = cur_match;
      best_len = len;
      if (len >= nice_match) {
        break;
      }
      scan_end1  = _win[scan + best_len - 1];
      scan_end   = _win[scan + best_len];
    }
  } while ((cur_match = prev[cur_match & wmask]) > limit && --chain_length !== 0);

  if (best_len <= s.lookahead) {
    return best_len;
  }
  return s.lookahead;
}


/* ===========================================================================
 * Fill the window when the lookahead becomes insufficient.
 * Updates strstart and lookahead.
 *
 * IN assertion: lookahead < MIN_LOOKAHEAD
 * OUT assertions: strstart <= window_size-MIN_LOOKAHEAD
 *    At least one byte has been read, or avail_in == 0; reads are
 *    performed for at least two bytes (required for the zip translate_eol
 *    option -- not supported here).
 */
function fill_window(s) {
  var _w_size = s.w_size;
  var p, n, m, more, str;

  //Assert(s->lookahead < MIN_LOOKAHEAD, "already enough lookahead");

  do {
    more = s.window_size - s.lookahead - s.strstart;

    // JS ints have 32 bit, block below not needed
    /* Deal with !@#$% 64K limit: */
    //if (sizeof(int) <= 2) {
    //    if (more == 0 && s->strstart == 0 && s->lookahead == 0) {
    //        more = wsize;
    //
    //  } else if (more == (unsigned)(-1)) {
    //        /* Very unlikely, but possible on 16 bit machine if
    //         * strstart == 0 && lookahead == 1 (input done a byte at time)
    //         */
    //        more--;
    //    }
    //}


    /* If the window is almost full and there is insufficient lookahead,
     * move the upper half to the lower one to make room in the upper half.
     */
    if (s.strstart >= _w_size + (_w_size - MIN_LOOKAHEAD)) {

      common.arraySet(s.window, s.window, _w_size, _w_size, 0);
      s.match_start -= _w_size;
      s.strstart -= _w_size;
      /* we now have strstart >= MAX_DIST */
      s.block_start -= _w_size;

      /* Slide the hash table (could be avoided with 32 bit values
       at the expense of memory usage). We slide even when level == 0
       to keep the hash table consistent if we switch back to level > 0
       later. (Using level 0 permanently is not an optimal usage of
       zlib, so we don't care about this pathological case.)
       */

      n = s.hash_size;
      p = n;
      do {
        m = s.head[--p];
        s.head[p] = (m >= _w_size ? m - _w_size : 0);
      } while (--n);

      n = _w_size;
      p = n;
      do {
        m = s.prev[--p];
        s.prev[p] = (m >= _w_size ? m - _w_size : 0);
        /* If n is not on any hash chain, prev[n] is garbage but
         * its value will never be used.
         */
      } while (--n);

      more += _w_size;
    }
    if (s.strm.avail_in === 0) {
      break;
    }

    /* If there was no sliding:
     *    strstart <= WSIZE+MAX_DIST-1 && lookahead <= MIN_LOOKAHEAD - 1 &&
     *    more == window_size - lookahead - strstart
     * => more >= window_size - (MIN_LOOKAHEAD-1 + WSIZE + MAX_DIST-1)
     * => more >= window_size - 2*WSIZE + 2
     * In the BIG_MEM or MMAP case (not yet supported),
     *   window_size == input_size + MIN_LOOKAHEAD  &&
     *   strstart + s->lookahead <= input_size => more >= MIN_LOOKAHEAD.
     * Otherwise, window_size == 2*WSIZE so more >= 2.
     * If there was sliding, more >= WSIZE. So in all cases, more >= 2.
     */
    //Assert(more >= 2, "more < 2");
    n = read_buf(s.strm, s.window, s.strstart + s.lookahead, more);
    s.lookahead += n;

    /* Initialize the hash value now that we have some input: */
    if (s.lookahead + s.insert >= MIN_MATCH$1) {
      str = s.strstart - s.insert;
      s.ins_h = s.window[str];

      /* UPDATE_HASH(s, s->ins_h, s->window[str + 1]); */
      s.ins_h = ((s.ins_h << s.hash_shift) ^ s.window[str + 1]) & s.hash_mask;
//#if MIN_MATCH != 3
//        Call update_hash() MIN_MATCH-3 more times
//#endif
      while (s.insert) {
        /* UPDATE_HASH(s, s->ins_h, s->window[str + MIN_MATCH-1]); */
        s.ins_h = ((s.ins_h << s.hash_shift) ^ s.window[str + MIN_MATCH$1 - 1]) & s.hash_mask;

        s.prev[str & s.w_mask] = s.head[s.ins_h];
        s.head[s.ins_h] = str;
        str++;
        s.insert--;
        if (s.lookahead + s.insert < MIN_MATCH$1) {
          break;
        }
      }
    }
    /* If the whole input has less than MIN_MATCH bytes, ins_h is garbage,
     * but this is not important since only literal bytes will be emitted.
     */

  } while (s.lookahead < MIN_LOOKAHEAD && s.strm.avail_in !== 0);

  /* If the WIN_INIT bytes after the end of the current data have never been
   * written, then zero those bytes in order to avoid memory check reports of
   * the use of uninitialized (or uninitialised as Julian writes) bytes by
   * the longest match routines.  Update the high water mark for the next
   * time through here.  WIN_INIT is set to MAX_MATCH since the longest match
   * routines allow scanning to strstart + MAX_MATCH, ignoring lookahead.
   */
//  if (s.high_water < s.window_size) {
//    var curr = s.strstart + s.lookahead;
//    var init = 0;
//
//    if (s.high_water < curr) {
//      /* Previous high water mark below current data -- zero WIN_INIT
//       * bytes or up to end of window, whichever is less.
//       */
//      init = s.window_size - curr;
//      if (init > WIN_INIT)
//        init = WIN_INIT;
//      zmemzero(s->window + curr, (unsigned)init);
//      s->high_water = curr + init;
//    }
//    else if (s->high_water < (ulg)curr + WIN_INIT) {
//      /* High water mark at or above current data, but below current data
//       * plus WIN_INIT -- zero out to current data plus WIN_INIT, or up
//       * to end of window, whichever is less.
//       */
//      init = (ulg)curr + WIN_INIT - s->high_water;
//      if (init > s->window_size - s->high_water)
//        init = s->window_size - s->high_water;
//      zmemzero(s->window + s->high_water, (unsigned)init);
//      s->high_water += init;
//    }
//  }
//
//  Assert((ulg)s->strstart <= s->window_size - MIN_LOOKAHEAD,
//    "not enough room for search");
}

/* ===========================================================================
 * Copy without compression as much as possible from the input stream, return
 * the current block state.
 * This function does not insert new strings in the dictionary since
 * uncompressible data is probably not useful. This function is used
 * only for the level=0 compression option.
 * NOTE: this function should be optimized to avoid extra copying from
 * window to pending_buf.
 */
function deflate_stored(s, flush) {
  /* Stored blocks are limited to 0xffff bytes, pending_buf is limited
   * to pending_buf_size, and each stored block has a 5 byte header:
   */
  var max_block_size = 0xffff;

  if (max_block_size > s.pending_buf_size - 5) {
    max_block_size = s.pending_buf_size - 5;
  }

  /* Copy as much as possible from input to output: */
  for (;;) {
    /* Fill the window as much as possible: */
    if (s.lookahead <= 1) {

      //Assert(s->strstart < s->w_size+MAX_DIST(s) ||
      //  s->block_start >= (long)s->w_size, "slide too late");
//      if (!(s.strstart < s.w_size + (s.w_size - MIN_LOOKAHEAD) ||
//        s.block_start >= s.w_size)) {
//        throw  new Error("slide too late");
//      }

      fill_window(s);
      if (s.lookahead === 0 && flush === Z_NO_FLUSH) {
        return BS_NEED_MORE;
      }

      if (s.lookahead === 0) {
        break;
      }
      /* flush the current block */
    }
    //Assert(s->block_start >= 0L, "block gone");
//    if (s.block_start < 0) throw new Error("block gone");

    s.strstart += s.lookahead;
    s.lookahead = 0;

    /* Emit a stored block if pending_buf will be full: */
    var max_start = s.block_start + max_block_size;

    if (s.strstart === 0 || s.strstart >= max_start) {
      /* strstart == 0 is possible when wraparound on 16-bit machine */
      s.lookahead = s.strstart - max_start;
      s.strstart = max_start;
      /*** FLUSH_BLOCK(s, 0); ***/
      flush_block_only(s, false);
      if (s.strm.avail_out === 0) {
        return BS_NEED_MORE;
      }
      /***/


    }
    /* Flush if we may have to slide, otherwise block_start may become
     * negative and the data will be gone:
     */
    if (s.strstart - s.block_start >= (s.w_size - MIN_LOOKAHEAD)) {
      /*** FLUSH_BLOCK(s, 0); ***/
      flush_block_only(s, false);
      if (s.strm.avail_out === 0) {
        return BS_NEED_MORE;
      }
      /***/
    }
  }

  s.insert = 0;

  if (flush === Z_FINISH) {
    /*** FLUSH_BLOCK(s, 1); ***/
    flush_block_only(s, true);
    if (s.strm.avail_out === 0) {
      return BS_FINISH_STARTED;
    }
    /***/
    return BS_FINISH_DONE;
  }

  if (s.strstart > s.block_start) {
    /*** FLUSH_BLOCK(s, 0); ***/
    flush_block_only(s, false);
    if (s.strm.avail_out === 0) {
      return BS_NEED_MORE;
    }
    /***/
  }

  return BS_NEED_MORE;
}

/* ===========================================================================
 * Compress as much as possible from the input stream, return the current
 * block state.
 * This function does not perform lazy evaluation of matches and inserts
 * new strings in the dictionary only for unmatched strings or for short
 * matches. It is used only for the fast compression options.
 */
function deflate_fast(s, flush) {
  var hash_head;        /* head of the hash chain */
  var bflush;           /* set if current block must be flushed */

  for (;;) {
    /* Make sure that we always have enough lookahead, except
     * at the end of the input file. We need MAX_MATCH bytes
     * for the next match, plus MIN_MATCH bytes to insert the
     * string following the next match.
     */
    if (s.lookahead < MIN_LOOKAHEAD) {
      fill_window(s);
      if (s.lookahead < MIN_LOOKAHEAD && flush === Z_NO_FLUSH) {
        return BS_NEED_MORE;
      }
      if (s.lookahead === 0) {
        break; /* flush the current block */
      }
    }

    /* Insert the string window[strstart .. strstart+2] in the
     * dictionary, and set hash_head to the head of the hash chain:
     */
    hash_head = 0/*NIL*/;
    if (s.lookahead >= MIN_MATCH$1) {
      /*** INSERT_STRING(s, s.strstart, hash_head); ***/
      s.ins_h = ((s.ins_h << s.hash_shift) ^ s.window[s.strstart + MIN_MATCH$1 - 1]) & s.hash_mask;
      hash_head = s.prev[s.strstart & s.w_mask] = s.head[s.ins_h];
      s.head[s.ins_h] = s.strstart;
      /***/
    }

    /* Find the longest match, discarding those <= prev_length.
     * At this point we have always match_length < MIN_MATCH
     */
    if (hash_head !== 0/*NIL*/ && ((s.strstart - hash_head) <= (s.w_size - MIN_LOOKAHEAD))) {
      /* To simplify the code, we prevent matches with the string
       * of window index 0 (in particular we have to avoid a match
       * of the string with itself at the start of the input file).
       */
      s.match_length = longest_match(s, hash_head);
      /* longest_match() sets match_start */
    }
    if (s.match_length >= MIN_MATCH$1) {
      // check_match(s, s.strstart, s.match_start, s.match_length); // for debug only

      /*** _tr_tally_dist(s, s.strstart - s.match_start,
                     s.match_length - MIN_MATCH, bflush); ***/
      bflush = trees._tr_tally(s, s.strstart - s.match_start, s.match_length - MIN_MATCH$1);

      s.lookahead -= s.match_length;

      /* Insert new strings in the hash table only if the match length
       * is not too large. This saves time but degrades compression.
       */
      if (s.match_length <= s.max_lazy_match/*max_insert_length*/ && s.lookahead >= MIN_MATCH$1) {
        s.match_length--; /* string at strstart already in table */
        do {
          s.strstart++;
          /*** INSERT_STRING(s, s.strstart, hash_head); ***/
          s.ins_h = ((s.ins_h << s.hash_shift) ^ s.window[s.strstart + MIN_MATCH$1 - 1]) & s.hash_mask;
          hash_head = s.prev[s.strstart & s.w_mask] = s.head[s.ins_h];
          s.head[s.ins_h] = s.strstart;
          /***/
          /* strstart never exceeds WSIZE-MAX_MATCH, so there are
           * always MIN_MATCH bytes ahead.
           */
        } while (--s.match_length !== 0);
        s.strstart++;
      } else
      {
        s.strstart += s.match_length;
        s.match_length = 0;
        s.ins_h = s.window[s.strstart];
        /* UPDATE_HASH(s, s.ins_h, s.window[s.strstart+1]); */
        s.ins_h = ((s.ins_h << s.hash_shift) ^ s.window[s.strstart + 1]) & s.hash_mask;

//#if MIN_MATCH != 3
//                Call UPDATE_HASH() MIN_MATCH-3 more times
//#endif
        /* If lookahead < MIN_MATCH, ins_h is garbage, but it does not
         * matter since it will be recomputed at next deflate call.
         */
      }
    } else {
      /* No match, output a literal byte */
      //Tracevv((stderr,"%c", s.window[s.strstart]));
      /*** _tr_tally_lit(s, s.window[s.strstart], bflush); ***/
      bflush = trees._tr_tally(s, 0, s.window[s.strstart]);

      s.lookahead--;
      s.strstart++;
    }
    if (bflush) {
      /*** FLUSH_BLOCK(s, 0); ***/
      flush_block_only(s, false);
      if (s.strm.avail_out === 0) {
        return BS_NEED_MORE;
      }
      /***/
    }
  }
  s.insert = ((s.strstart < (MIN_MATCH$1 - 1)) ? s.strstart : MIN_MATCH$1 - 1);
  if (flush === Z_FINISH) {
    /*** FLUSH_BLOCK(s, 1); ***/
    flush_block_only(s, true);
    if (s.strm.avail_out === 0) {
      return BS_FINISH_STARTED;
    }
    /***/
    return BS_FINISH_DONE;
  }
  if (s.last_lit) {
    /*** FLUSH_BLOCK(s, 0); ***/
    flush_block_only(s, false);
    if (s.strm.avail_out === 0) {
      return BS_NEED_MORE;
    }
    /***/
  }
  return BS_BLOCK_DONE;
}

/* ===========================================================================
 * Same as above, but achieves better compression. We use a lazy
 * evaluation for matches: a match is finally adopted only if there is
 * no better match at the next window position.
 */
function deflate_slow(s, flush) {
  var hash_head;          /* head of hash chain */
  var bflush;              /* set if current block must be flushed */

  var max_insert;

  /* Process the input block. */
  for (;;) {
    /* Make sure that we always have enough lookahead, except
     * at the end of the input file. We need MAX_MATCH bytes
     * for the next match, plus MIN_MATCH bytes to insert the
     * string following the next match.
     */
    if (s.lookahead < MIN_LOOKAHEAD) {
      fill_window(s);
      if (s.lookahead < MIN_LOOKAHEAD && flush === Z_NO_FLUSH) {
        return BS_NEED_MORE;
      }
      if (s.lookahead === 0) { break; } /* flush the current block */
    }

    /* Insert the string window[strstart .. strstart+2] in the
     * dictionary, and set hash_head to the head of the hash chain:
     */
    hash_head = 0/*NIL*/;
    if (s.lookahead >= MIN_MATCH$1) {
      /*** INSERT_STRING(s, s.strstart, hash_head); ***/
      s.ins_h = ((s.ins_h << s.hash_shift) ^ s.window[s.strstart + MIN_MATCH$1 - 1]) & s.hash_mask;
      hash_head = s.prev[s.strstart & s.w_mask] = s.head[s.ins_h];
      s.head[s.ins_h] = s.strstart;
      /***/
    }

    /* Find the longest match, discarding those <= prev_length.
     */
    s.prev_length = s.match_length;
    s.prev_match = s.match_start;
    s.match_length = MIN_MATCH$1 - 1;

    if (hash_head !== 0/*NIL*/ && s.prev_length < s.max_lazy_match &&
        s.strstart - hash_head <= (s.w_size - MIN_LOOKAHEAD)/*MAX_DIST(s)*/) {
      /* To simplify the code, we prevent matches with the string
       * of window index 0 (in particular we have to avoid a match
       * of the string with itself at the start of the input file).
       */
      s.match_length = longest_match(s, hash_head);
      /* longest_match() sets match_start */

      if (s.match_length <= 5 &&
         (s.strategy === Z_FILTERED || (s.match_length === MIN_MATCH$1 && s.strstart - s.match_start > 4096/*TOO_FAR*/))) {

        /* If prev_match is also MIN_MATCH, match_start is garbage
         * but we will ignore the current match anyway.
         */
        s.match_length = MIN_MATCH$1 - 1;
      }
    }
    /* If there was a match at the previous step and the current
     * match is not better, output the previous match:
     */
    if (s.prev_length >= MIN_MATCH$1 && s.match_length <= s.prev_length) {
      max_insert = s.strstart + s.lookahead - MIN_MATCH$1;
      /* Do not insert strings in hash table beyond this. */

      //check_match(s, s.strstart-1, s.prev_match, s.prev_length);

      /***_tr_tally_dist(s, s.strstart - 1 - s.prev_match,
                     s.prev_length - MIN_MATCH, bflush);***/
      bflush = trees._tr_tally(s, s.strstart - 1 - s.prev_match, s.prev_length - MIN_MATCH$1);
      /* Insert in hash table all strings up to the end of the match.
       * strstart-1 and strstart are already inserted. If there is not
       * enough lookahead, the last two strings are not inserted in
       * the hash table.
       */
      s.lookahead -= s.prev_length - 1;
      s.prev_length -= 2;
      do {
        if (++s.strstart <= max_insert) {
          /*** INSERT_STRING(s, s.strstart, hash_head); ***/
          s.ins_h = ((s.ins_h << s.hash_shift) ^ s.window[s.strstart + MIN_MATCH$1 - 1]) & s.hash_mask;
          hash_head = s.prev[s.strstart & s.w_mask] = s.head[s.ins_h];
          s.head[s.ins_h] = s.strstart;
          /***/
        }
      } while (--s.prev_length !== 0);
      s.match_available = 0;
      s.match_length = MIN_MATCH$1 - 1;
      s.strstart++;

      if (bflush) {
        /*** FLUSH_BLOCK(s, 0); ***/
        flush_block_only(s, false);
        if (s.strm.avail_out === 0) {
          return BS_NEED_MORE;
        }
        /***/
      }

    } else if (s.match_available) {
      /* If there was no match at the previous position, output a
       * single literal. If there was a match but the current match
       * is longer, truncate the previous match to a single literal.
       */
      //Tracevv((stderr,"%c", s->window[s->strstart-1]));
      /*** _tr_tally_lit(s, s.window[s.strstart-1], bflush); ***/
      bflush = trees._tr_tally(s, 0, s.window[s.strstart - 1]);

      if (bflush) {
        /*** FLUSH_BLOCK_ONLY(s, 0) ***/
        flush_block_only(s, false);
        /***/
      }
      s.strstart++;
      s.lookahead--;
      if (s.strm.avail_out === 0) {
        return BS_NEED_MORE;
      }
    } else {
      /* There is no previous match to compare with, wait for
       * the next step to decide.
       */
      s.match_available = 1;
      s.strstart++;
      s.lookahead--;
    }
  }
  //Assert (flush != Z_NO_FLUSH, "no flush?");
  if (s.match_available) {
    //Tracevv((stderr,"%c", s->window[s->strstart-1]));
    /*** _tr_tally_lit(s, s.window[s.strstart-1], bflush); ***/
    bflush = trees._tr_tally(s, 0, s.window[s.strstart - 1]);

    s.match_available = 0;
  }
  s.insert = s.strstart < MIN_MATCH$1 - 1 ? s.strstart : MIN_MATCH$1 - 1;
  if (flush === Z_FINISH) {
    /*** FLUSH_BLOCK(s, 1); ***/
    flush_block_only(s, true);
    if (s.strm.avail_out === 0) {
      return BS_FINISH_STARTED;
    }
    /***/
    return BS_FINISH_DONE;
  }
  if (s.last_lit) {
    /*** FLUSH_BLOCK(s, 0); ***/
    flush_block_only(s, false);
    if (s.strm.avail_out === 0) {
      return BS_NEED_MORE;
    }
    /***/
  }

  return BS_BLOCK_DONE;
}


/* ===========================================================================
 * For Z_RLE, simply look for runs of bytes, generate matches only of distance
 * one.  Do not maintain a hash table.  (It will be regenerated if this run of
 * deflate switches away from Z_RLE.)
 */
function deflate_rle(s, flush) {
  var bflush;            /* set if current block must be flushed */
  var prev;              /* byte at distance one to match */
  var scan, strend;      /* scan goes up to strend for length of run */

  var _win = s.window;

  for (;;) {
    /* Make sure that we always have enough lookahead, except
     * at the end of the input file. We need MAX_MATCH bytes
     * for the longest run, plus one for the unrolled loop.
     */
    if (s.lookahead <= MAX_MATCH$1) {
      fill_window(s);
      if (s.lookahead <= MAX_MATCH$1 && flush === Z_NO_FLUSH) {
        return BS_NEED_MORE;
      }
      if (s.lookahead === 0) { break; } /* flush the current block */
    }

    /* See how many times the previous byte repeats */
    s.match_length = 0;
    if (s.lookahead >= MIN_MATCH$1 && s.strstart > 0) {
      scan = s.strstart - 1;
      prev = _win[scan];
      if (prev === _win[++scan] && prev === _win[++scan] && prev === _win[++scan]) {
        strend = s.strstart + MAX_MATCH$1;
        do {
          /*jshint noempty:false*/
        } while (prev === _win[++scan] && prev === _win[++scan] &&
                 prev === _win[++scan] && prev === _win[++scan] &&
                 prev === _win[++scan] && prev === _win[++scan] &&
                 prev === _win[++scan] && prev === _win[++scan] &&
                 scan < strend);
        s.match_length = MAX_MATCH$1 - (strend - scan);
        if (s.match_length > s.lookahead) {
          s.match_length = s.lookahead;
        }
      }
      //Assert(scan <= s->window+(uInt)(s->window_size-1), "wild scan");
    }

    /* Emit match if have run of MIN_MATCH or longer, else emit literal */
    if (s.match_length >= MIN_MATCH$1) {
      //check_match(s, s.strstart, s.strstart - 1, s.match_length);

      /*** _tr_tally_dist(s, 1, s.match_length - MIN_MATCH, bflush); ***/
      bflush = trees._tr_tally(s, 1, s.match_length - MIN_MATCH$1);

      s.lookahead -= s.match_length;
      s.strstart += s.match_length;
      s.match_length = 0;
    } else {
      /* No match, output a literal byte */
      //Tracevv((stderr,"%c", s->window[s->strstart]));
      /*** _tr_tally_lit(s, s.window[s.strstart], bflush); ***/
      bflush = trees._tr_tally(s, 0, s.window[s.strstart]);

      s.lookahead--;
      s.strstart++;
    }
    if (bflush) {
      /*** FLUSH_BLOCK(s, 0); ***/
      flush_block_only(s, false);
      if (s.strm.avail_out === 0) {
        return BS_NEED_MORE;
      }
      /***/
    }
  }
  s.insert = 0;
  if (flush === Z_FINISH) {
    /*** FLUSH_BLOCK(s, 1); ***/
    flush_block_only(s, true);
    if (s.strm.avail_out === 0) {
      return BS_FINISH_STARTED;
    }
    /***/
    return BS_FINISH_DONE;
  }
  if (s.last_lit) {
    /*** FLUSH_BLOCK(s, 0); ***/
    flush_block_only(s, false);
    if (s.strm.avail_out === 0) {
      return BS_NEED_MORE;
    }
    /***/
  }
  return BS_BLOCK_DONE;
}

/* ===========================================================================
 * For Z_HUFFMAN_ONLY, do not look for matches.  Do not maintain a hash table.
 * (It will be regenerated if this run of deflate switches away from Huffman.)
 */
function deflate_huff(s, flush) {
  var bflush;             /* set if current block must be flushed */

  for (;;) {
    /* Make sure that we have a literal to write. */
    if (s.lookahead === 0) {
      fill_window(s);
      if (s.lookahead === 0) {
        if (flush === Z_NO_FLUSH) {
          return BS_NEED_MORE;
        }
        break;      /* flush the current block */
      }
    }

    /* Output a literal byte */
    s.match_length = 0;
    //Tracevv((stderr,"%c", s->window[s->strstart]));
    /*** _tr_tally_lit(s, s.window[s.strstart], bflush); ***/
    bflush = trees._tr_tally(s, 0, s.window[s.strstart]);
    s.lookahead--;
    s.strstart++;
    if (bflush) {
      /*** FLUSH_BLOCK(s, 0); ***/
      flush_block_only(s, false);
      if (s.strm.avail_out === 0) {
        return BS_NEED_MORE;
      }
      /***/
    }
  }
  s.insert = 0;
  if (flush === Z_FINISH) {
    /*** FLUSH_BLOCK(s, 1); ***/
    flush_block_only(s, true);
    if (s.strm.avail_out === 0) {
      return BS_FINISH_STARTED;
    }
    /***/
    return BS_FINISH_DONE;
  }
  if (s.last_lit) {
    /*** FLUSH_BLOCK(s, 0); ***/
    flush_block_only(s, false);
    if (s.strm.avail_out === 0) {
      return BS_NEED_MORE;
    }
    /***/
  }
  return BS_BLOCK_DONE;
}

/* Values for max_lazy_match, good_match and max_chain_length, depending on
 * the desired pack level (0..9). The values given below have been tuned to
 * exclude worst case performance for pathological files. Better values may be
 * found for specific files.
 */
function Config(good_length, max_lazy, nice_length, max_chain, func) {
  this.good_length = good_length;
  this.max_lazy = max_lazy;
  this.nice_length = nice_length;
  this.max_chain = max_chain;
  this.func = func;
}

var configuration_table;

configuration_table = [
  /*      good lazy nice chain */
  new Config(0, 0, 0, 0, deflate_stored),          /* 0 store only */
  new Config(4, 4, 8, 4, deflate_fast),            /* 1 max speed, no lazy matches */
  new Config(4, 5, 16, 8, deflate_fast),           /* 2 */
  new Config(4, 6, 32, 32, deflate_fast),          /* 3 */

  new Config(4, 4, 16, 16, deflate_slow),          /* 4 lazy matches */
  new Config(8, 16, 32, 32, deflate_slow),         /* 5 */
  new Config(8, 16, 128, 128, deflate_slow),       /* 6 */
  new Config(8, 32, 128, 256, deflate_slow),       /* 7 */
  new Config(32, 128, 258, 1024, deflate_slow),    /* 8 */
  new Config(32, 258, 258, 4096, deflate_slow)     /* 9 max compression */
];


/* ===========================================================================
 * Initialize the "longest match" routines for a new zlib stream
 */
function lm_init(s) {
  s.window_size = 2 * s.w_size;

  /*** CLEAR_HASH(s); ***/
  zero$1(s.head); // Fill with NIL (= 0);

  /* Set the default configuration parameters:
   */
  s.max_lazy_match = configuration_table[s.level].max_lazy;
  s.good_match = configuration_table[s.level].good_length;
  s.nice_match = configuration_table[s.level].nice_length;
  s.max_chain_length = configuration_table[s.level].max_chain;

  s.strstart = 0;
  s.block_start = 0;
  s.lookahead = 0;
  s.insert = 0;
  s.match_length = s.prev_length = MIN_MATCH$1 - 1;
  s.match_available = 0;
  s.ins_h = 0;
}


function DeflateState() {
  this.strm = null;            /* pointer back to this zlib stream */
  this.status = 0;            /* as the name implies */
  this.pending_buf = null;      /* output still pending */
  this.pending_buf_size = 0;  /* size of pending_buf */
  this.pending_out = 0;       /* next pending byte to output to the stream */
  this.pending = 0;           /* nb of bytes in the pending buffer */
  this.wrap = 0;              /* bit 0 true for zlib, bit 1 true for gzip */
  this.gzhead = null;         /* gzip header information to write */
  this.gzindex = 0;           /* where in extra, name, or comment */
  this.method = Z_DEFLATED; /* can only be DEFLATED */
  this.last_flush = -1;   /* value of flush param for previous deflate call */

  this.w_size = 0;  /* LZ77 window size (32K by default) */
  this.w_bits = 0;  /* log2(w_size)  (8..16) */
  this.w_mask = 0;  /* w_size - 1 */

  this.window = null;
  /* Sliding window. Input bytes are read into the second half of the window,
   * and move to the first half later to keep a dictionary of at least wSize
   * bytes. With this organization, matches are limited to a distance of
   * wSize-MAX_MATCH bytes, but this ensures that IO is always
   * performed with a length multiple of the block size.
   */

  this.window_size = 0;
  /* Actual size of window: 2*wSize, except when the user input buffer
   * is directly used as sliding window.
   */

  this.prev = null;
  /* Link to older string with same hash index. To limit the size of this
   * array to 64K, this link is maintained only for the last 32K strings.
   * An index in this array is thus a window index modulo 32K.
   */

  this.head = null;   /* Heads of the hash chains or NIL. */

  this.ins_h = 0;       /* hash index of string to be inserted */
  this.hash_size = 0;   /* number of elements in hash table */
  this.hash_bits = 0;   /* log2(hash_size) */
  this.hash_mask = 0;   /* hash_size-1 */

  this.hash_shift = 0;
  /* Number of bits by which ins_h must be shifted at each input
   * step. It must be such that after MIN_MATCH steps, the oldest
   * byte no longer takes part in the hash key, that is:
   *   hash_shift * MIN_MATCH >= hash_bits
   */

  this.block_start = 0;
  /* Window position at the beginning of the current output block. Gets
   * negative when the window is moved backwards.
   */

  this.match_length = 0;      /* length of best match */
  this.prev_match = 0;        /* previous match */
  this.match_available = 0;   /* set if previous match exists */
  this.strstart = 0;          /* start of string to insert */
  this.match_start = 0;       /* start of matching string */
  this.lookahead = 0;         /* number of valid bytes ahead in window */

  this.prev_length = 0;
  /* Length of the best match at previous step. Matches not greater than this
   * are discarded. This is used in the lazy match evaluation.
   */

  this.max_chain_length = 0;
  /* To speed up deflation, hash chains are never searched beyond this
   * length.  A higher limit improves compression ratio but degrades the
   * speed.
   */

  this.max_lazy_match = 0;
  /* Attempt to find a better match only when the current match is strictly
   * smaller than this value. This mechanism is used only for compression
   * levels >= 4.
   */
  // That's alias to max_lazy_match, don't use directly
  //this.max_insert_length = 0;
  /* Insert new strings in the hash table only if the match length is not
   * greater than this length. This saves time but degrades compression.
   * max_insert_length is used only for compression levels <= 3.
   */

  this.level = 0;     /* compression level (1..9) */
  this.strategy = 0;  /* favor or force Huffman coding*/

  this.good_match = 0;
  /* Use a faster search when the previous match is longer than this */

  this.nice_match = 0; /* Stop searching when current match exceeds this */

              /* used by trees.c: */

  /* Didn't use ct_data typedef below to suppress compiler warning */

  // struct ct_data_s dyn_ltree[HEAP_SIZE];   /* literal and length tree */
  // struct ct_data_s dyn_dtree[2*D_CODES+1]; /* distance tree */
  // struct ct_data_s bl_tree[2*BL_CODES+1];  /* Huffman tree for bit lengths */

  // Use flat array of DOUBLE size, with interleaved fata,
  // because JS does not support effective
  this.dyn_ltree  = new common.Buf16(HEAP_SIZE$1 * 2);
  this.dyn_dtree  = new common.Buf16((2 * D_CODES$1 + 1) * 2);
  this.bl_tree    = new common.Buf16((2 * BL_CODES$1 + 1) * 2);
  zero$1(this.dyn_ltree);
  zero$1(this.dyn_dtree);
  zero$1(this.bl_tree);

  this.l_desc   = null;         /* desc. for literal tree */
  this.d_desc   = null;         /* desc. for distance tree */
  this.bl_desc  = null;         /* desc. for bit length tree */

  //ush bl_count[MAX_BITS+1];
  this.bl_count = new common.Buf16(MAX_BITS$1 + 1);
  /* number of codes at each bit length for an optimal tree */

  //int heap[2*L_CODES+1];      /* heap used to build the Huffman trees */
  this.heap = new common.Buf16(2 * L_CODES$1 + 1);  /* heap used to build the Huffman trees */
  zero$1(this.heap);

  this.heap_len = 0;               /* number of elements in the heap */
  this.heap_max = 0;               /* element of largest frequency */
  /* The sons of heap[n] are heap[2*n] and heap[2*n+1]. heap[0] is not used.
   * The same heap array is used to build all trees.
   */

  this.depth = new common.Buf16(2 * L_CODES$1 + 1); //uch depth[2*L_CODES+1];
  zero$1(this.depth);
  /* Depth of each subtree used as tie breaker for trees of equal frequency
   */

  this.l_buf = 0;          /* buffer index for literals or lengths */

  this.lit_bufsize = 0;
  /* Size of match buffer for literals/lengths.  There are 4 reasons for
   * limiting lit_bufsize to 64K:
   *   - frequencies can be kept in 16 bit counters
   *   - if compression is not successful for the first block, all input
   *     data is still in the window so we can still emit a stored block even
   *     when input comes from standard input.  (This can also be done for
   *     all blocks if lit_bufsize is not greater than 32K.)
   *   - if compression is not successful for a file smaller than 64K, we can
   *     even emit a stored file instead of a stored block (saving 5 bytes).
   *     This is applicable only for zip (not gzip or zlib).
   *   - creating new Huffman trees less frequently may not provide fast
   *     adaptation to changes in the input data statistics. (Take for
   *     example a binary file with poorly compressible code followed by
   *     a highly compressible string table.) Smaller buffer sizes give
   *     fast adaptation but have of course the overhead of transmitting
   *     trees more frequently.
   *   - I can't count above 4
   */

  this.last_lit = 0;      /* running index in l_buf */

  this.d_buf = 0;
  /* Buffer index for distances. To simplify the code, d_buf and l_buf have
   * the same number of elements. To use different lengths, an extra flag
   * array would be necessary.
   */

  this.opt_len = 0;       /* bit length of current block with optimal trees */
  this.static_len = 0;    /* bit length of current block with static trees */
  this.matches = 0;       /* number of string matches in current block */
  this.insert = 0;        /* bytes at end of window left to insert */


  this.bi_buf = 0;
  /* Output buffer. bits are inserted starting at the bottom (least
   * significant bits).
   */
  this.bi_valid = 0;
  /* Number of valid bits in bi_buf.  All bits above the last valid bit
   * are always zero.
   */

  // Used for window memory init. We safely ignore it for JS. That makes
  // sense only for pointers and memory check tools.
  //this.high_water = 0;
  /* High water mark offset in window for initialized bytes -- bytes above
   * this are set to zero in order to avoid memory check warnings when
   * longest match routines access bytes past the input.  This is then
   * updated to the new high water mark.
   */
}


function deflateResetKeep(strm) {
  var s;

  if (!strm || !strm.state) {
    return err(strm, Z_STREAM_ERROR);
  }

  strm.total_in = strm.total_out = 0;
  strm.data_type = Z_UNKNOWN$1;

  s = strm.state;
  s.pending = 0;
  s.pending_out = 0;

  if (s.wrap < 0) {
    s.wrap = -s.wrap;
    /* was made negative by deflate(..., Z_FINISH); */
  }
  s.status = (s.wrap ? INIT_STATE : BUSY_STATE);
  strm.adler = (s.wrap === 2) ?
    0  // crc32(0, Z_NULL, 0)
  :
    1; // adler32(0, Z_NULL, 0)
  s.last_flush = Z_NO_FLUSH;
  trees._tr_init(s);
  return Z_OK;
}


function deflateReset(strm) {
  var ret = deflateResetKeep(strm);
  if (ret === Z_OK) {
    lm_init(strm.state);
  }
  return ret;
}


function deflateSetHeader(strm, head) {
  if (!strm || !strm.state) { return Z_STREAM_ERROR; }
  if (strm.state.wrap !== 2) { return Z_STREAM_ERROR; }
  strm.state.gzhead = head;
  return Z_OK;
}


function deflateInit2(strm, level, method, windowBits, memLevel, strategy) {
  if (!strm) { // === Z_NULL
    return Z_STREAM_ERROR;
  }
  var wrap = 1;

  if (level === Z_DEFAULT_COMPRESSION) {
    level = 6;
  }

  if (windowBits < 0) { /* suppress zlib wrapper */
    wrap = 0;
    windowBits = -windowBits;
  }

  else if (windowBits > 15) {
    wrap = 2;           /* write gzip wrapper instead */
    windowBits -= 16;
  }


  if (memLevel < 1 || memLevel > MAX_MEM_LEVEL || method !== Z_DEFLATED ||
    windowBits < 8 || windowBits > 15 || level < 0 || level > 9 ||
    strategy < 0 || strategy > Z_FIXED$1) {
    return err(strm, Z_STREAM_ERROR);
  }


  if (windowBits === 8) {
    windowBits = 9;
  }
  /* until 256-byte window bug fixed */

  var s = new DeflateState();

  strm.state = s;
  s.strm = strm;

  s.wrap = wrap;
  s.gzhead = null;
  s.w_bits = windowBits;
  s.w_size = 1 << s.w_bits;
  s.w_mask = s.w_size - 1;

  s.hash_bits = memLevel + 7;
  s.hash_size = 1 << s.hash_bits;
  s.hash_mask = s.hash_size - 1;
  s.hash_shift = ~~((s.hash_bits + MIN_MATCH$1 - 1) / MIN_MATCH$1);

  s.window = new common.Buf8(s.w_size * 2);
  s.head = new common.Buf16(s.hash_size);
  s.prev = new common.Buf16(s.w_size);

  // Don't need mem init magic for JS.
  //s.high_water = 0;  /* nothing written to s->window yet */

  s.lit_bufsize = 1 << (memLevel + 6); /* 16K elements by default */

  s.pending_buf_size = s.lit_bufsize * 4;

  //overlay = (ushf *) ZALLOC(strm, s->lit_bufsize, sizeof(ush)+2);
  //s->pending_buf = (uchf *) overlay;
  s.pending_buf = new common.Buf8(s.pending_buf_size);

  // It is offset from `s.pending_buf` (size is `s.lit_bufsize * 2`)
  //s->d_buf = overlay + s->lit_bufsize/sizeof(ush);
  s.d_buf = 1 * s.lit_bufsize;

  //s->l_buf = s->pending_buf + (1+sizeof(ush))*s->lit_bufsize;
  s.l_buf = (1 + 2) * s.lit_bufsize;

  s.level = level;
  s.strategy = strategy;
  s.method = method;

  return deflateReset(strm);
}

function deflateInit(strm, level) {
  return deflateInit2(strm, level, Z_DEFLATED, MAX_WBITS, DEF_MEM_LEVEL, Z_DEFAULT_STRATEGY);
}


function deflate(strm, flush) {
  var old_flush, s;
  var beg, val; // for gzip header write only

  if (!strm || !strm.state ||
    flush > Z_BLOCK || flush < 0) {
    return strm ? err(strm, Z_STREAM_ERROR) : Z_STREAM_ERROR;
  }

  s = strm.state;

  if (!strm.output ||
      (!strm.input && strm.avail_in !== 0) ||
      (s.status === FINISH_STATE && flush !== Z_FINISH)) {
    return err(strm, (strm.avail_out === 0) ? Z_BUF_ERROR : Z_STREAM_ERROR);
  }

  s.strm = strm; /* just in case */
  old_flush = s.last_flush;
  s.last_flush = flush;

  /* Write the header */
  if (s.status === INIT_STATE) {

    if (s.wrap === 2) { // GZIP header
      strm.adler = 0;  //crc32(0L, Z_NULL, 0);
      put_byte(s, 31);
      put_byte(s, 139);
      put_byte(s, 8);
      if (!s.gzhead) { // s->gzhead == Z_NULL
        put_byte(s, 0);
        put_byte(s, 0);
        put_byte(s, 0);
        put_byte(s, 0);
        put_byte(s, 0);
        put_byte(s, s.level === 9 ? 2 :
                    (s.strategy >= Z_HUFFMAN_ONLY || s.level < 2 ?
                     4 : 0));
        put_byte(s, OS_CODE);
        s.status = BUSY_STATE;
      }
      else {
        put_byte(s, (s.gzhead.text ? 1 : 0) +
                    (s.gzhead.hcrc ? 2 : 0) +
                    (!s.gzhead.extra ? 0 : 4) +
                    (!s.gzhead.name ? 0 : 8) +
                    (!s.gzhead.comment ? 0 : 16)
        );
        put_byte(s, s.gzhead.time & 0xff);
        put_byte(s, (s.gzhead.time >> 8) & 0xff);
        put_byte(s, (s.gzhead.time >> 16) & 0xff);
        put_byte(s, (s.gzhead.time >> 24) & 0xff);
        put_byte(s, s.level === 9 ? 2 :
                    (s.strategy >= Z_HUFFMAN_ONLY || s.level < 2 ?
                     4 : 0));
        put_byte(s, s.gzhead.os & 0xff);
        if (s.gzhead.extra && s.gzhead.extra.length) {
          put_byte(s, s.gzhead.extra.length & 0xff);
          put_byte(s, (s.gzhead.extra.length >> 8) & 0xff);
        }
        if (s.gzhead.hcrc) {
          strm.adler = crc32_1(strm.adler, s.pending_buf, s.pending, 0);
        }
        s.gzindex = 0;
        s.status = EXTRA_STATE;
      }
    }
    else // DEFLATE header
    {
      var header = (Z_DEFLATED + ((s.w_bits - 8) << 4)) << 8;
      var level_flags = -1;

      if (s.strategy >= Z_HUFFMAN_ONLY || s.level < 2) {
        level_flags = 0;
      } else if (s.level < 6) {
        level_flags = 1;
      } else if (s.level === 6) {
        level_flags = 2;
      } else {
        level_flags = 3;
      }
      header |= (level_flags << 6);
      if (s.strstart !== 0) { header |= PRESET_DICT; }
      header += 31 - (header % 31);

      s.status = BUSY_STATE;
      putShortMSB(s, header);

      /* Save the adler32 of the preset dictionary: */
      if (s.strstart !== 0) {
        putShortMSB(s, strm.adler >>> 16);
        putShortMSB(s, strm.adler & 0xffff);
      }
      strm.adler = 1; // adler32(0L, Z_NULL, 0);
    }
  }

//#ifdef GZIP
  if (s.status === EXTRA_STATE) {
    if (s.gzhead.extra/* != Z_NULL*/) {
      beg = s.pending;  /* start of bytes to update crc */

      while (s.gzindex < (s.gzhead.extra.length & 0xffff)) {
        if (s.pending === s.pending_buf_size) {
          if (s.gzhead.hcrc && s.pending > beg) {
            strm.adler = crc32_1(strm.adler, s.pending_buf, s.pending - beg, beg);
          }
          flush_pending(strm);
          beg = s.pending;
          if (s.pending === s.pending_buf_size) {
            break;
          }
        }
        put_byte(s, s.gzhead.extra[s.gzindex] & 0xff);
        s.gzindex++;
      }
      if (s.gzhead.hcrc && s.pending > beg) {
        strm.adler = crc32_1(strm.adler, s.pending_buf, s.pending - beg, beg);
      }
      if (s.gzindex === s.gzhead.extra.length) {
        s.gzindex = 0;
        s.status = NAME_STATE;
      }
    }
    else {
      s.status = NAME_STATE;
    }
  }
  if (s.status === NAME_STATE) {
    if (s.gzhead.name/* != Z_NULL*/) {
      beg = s.pending;  /* start of bytes to update crc */
      //int val;

      do {
        if (s.pending === s.pending_buf_size) {
          if (s.gzhead.hcrc && s.pending > beg) {
            strm.adler = crc32_1(strm.adler, s.pending_buf, s.pending - beg, beg);
          }
          flush_pending(strm);
          beg = s.pending;
          if (s.pending === s.pending_buf_size) {
            val = 1;
            break;
          }
        }
        // JS specific: little magic to add zero terminator to end of string
        if (s.gzindex < s.gzhead.name.length) {
          val = s.gzhead.name.charCodeAt(s.gzindex++) & 0xff;
        } else {
          val = 0;
        }
        put_byte(s, val);
      } while (val !== 0);

      if (s.gzhead.hcrc && s.pending > beg) {
        strm.adler = crc32_1(strm.adler, s.pending_buf, s.pending - beg, beg);
      }
      if (val === 0) {
        s.gzindex = 0;
        s.status = COMMENT_STATE;
      }
    }
    else {
      s.status = COMMENT_STATE;
    }
  }
  if (s.status === COMMENT_STATE) {
    if (s.gzhead.comment/* != Z_NULL*/) {
      beg = s.pending;  /* start of bytes to update crc */
      //int val;

      do {
        if (s.pending === s.pending_buf_size) {
          if (s.gzhead.hcrc && s.pending > beg) {
            strm.adler = crc32_1(strm.adler, s.pending_buf, s.pending - beg, beg);
          }
          flush_pending(strm);
          beg = s.pending;
          if (s.pending === s.pending_buf_size) {
            val = 1;
            break;
          }
        }
        // JS specific: little magic to add zero terminator to end of string
        if (s.gzindex < s.gzhead.comment.length) {
          val = s.gzhead.comment.charCodeAt(s.gzindex++) & 0xff;
        } else {
          val = 0;
        }
        put_byte(s, val);
      } while (val !== 0);

      if (s.gzhead.hcrc && s.pending > beg) {
        strm.adler = crc32_1(strm.adler, s.pending_buf, s.pending - beg, beg);
      }
      if (val === 0) {
        s.status = HCRC_STATE;
      }
    }
    else {
      s.status = HCRC_STATE;
    }
  }
  if (s.status === HCRC_STATE) {
    if (s.gzhead.hcrc) {
      if (s.pending + 2 > s.pending_buf_size) {
        flush_pending(strm);
      }
      if (s.pending + 2 <= s.pending_buf_size) {
        put_byte(s, strm.adler & 0xff);
        put_byte(s, (strm.adler >> 8) & 0xff);
        strm.adler = 0; //crc32(0L, Z_NULL, 0);
        s.status = BUSY_STATE;
      }
    }
    else {
      s.status = BUSY_STATE;
    }
  }
//#endif

  /* Flush as much pending output as possible */
  if (s.pending !== 0) {
    flush_pending(strm);
    if (strm.avail_out === 0) {
      /* Since avail_out is 0, deflate will be called again with
       * more output space, but possibly with both pending and
       * avail_in equal to zero. There won't be anything to do,
       * but this is not an error situation so make sure we
       * return OK instead of BUF_ERROR at next call of deflate:
       */
      s.last_flush = -1;
      return Z_OK;
    }

    /* Make sure there is something to do and avoid duplicate consecutive
     * flushes. For repeated and useless calls with Z_FINISH, we keep
     * returning Z_STREAM_END instead of Z_BUF_ERROR.
     */
  } else if (strm.avail_in === 0 && rank(flush) <= rank(old_flush) &&
    flush !== Z_FINISH) {
    return err(strm, Z_BUF_ERROR);
  }

  /* User must not provide more input after the first FINISH: */
  if (s.status === FINISH_STATE && strm.avail_in !== 0) {
    return err(strm, Z_BUF_ERROR);
  }

  /* Start a new block or continue the current one.
   */
  if (strm.avail_in !== 0 || s.lookahead !== 0 ||
    (flush !== Z_NO_FLUSH && s.status !== FINISH_STATE)) {
    var bstate = (s.strategy === Z_HUFFMAN_ONLY) ? deflate_huff(s, flush) :
      (s.strategy === Z_RLE ? deflate_rle(s, flush) :
        configuration_table[s.level].func(s, flush));

    if (bstate === BS_FINISH_STARTED || bstate === BS_FINISH_DONE) {
      s.status = FINISH_STATE;
    }
    if (bstate === BS_NEED_MORE || bstate === BS_FINISH_STARTED) {
      if (strm.avail_out === 0) {
        s.last_flush = -1;
        /* avoid BUF_ERROR next call, see above */
      }
      return Z_OK;
      /* If flush != Z_NO_FLUSH && avail_out == 0, the next call
       * of deflate should use the same flush parameter to make sure
       * that the flush is complete. So we don't have to output an
       * empty block here, this will be done at next call. This also
       * ensures that for a very small output buffer, we emit at most
       * one empty block.
       */
    }
    if (bstate === BS_BLOCK_DONE) {
      if (flush === Z_PARTIAL_FLUSH) {
        trees._tr_align(s);
      }
      else if (flush !== Z_BLOCK) { /* FULL_FLUSH or SYNC_FLUSH */

        trees._tr_stored_block(s, 0, 0, false);
        /* For a full flush, this empty block will be recognized
         * as a special marker by inflate_sync().
         */
        if (flush === Z_FULL_FLUSH) {
          /*** CLEAR_HASH(s); ***/             /* forget history */
          zero$1(s.head); // Fill with NIL (= 0);

          if (s.lookahead === 0) {
            s.strstart = 0;
            s.block_start = 0;
            s.insert = 0;
          }
        }
      }
      flush_pending(strm);
      if (strm.avail_out === 0) {
        s.last_flush = -1; /* avoid BUF_ERROR at next call, see above */
        return Z_OK;
      }
    }
  }
  //Assert(strm->avail_out > 0, "bug2");
  //if (strm.avail_out <= 0) { throw new Error("bug2");}

  if (flush !== Z_FINISH) { return Z_OK; }
  if (s.wrap <= 0) { return Z_STREAM_END; }

  /* Write the trailer */
  if (s.wrap === 2) {
    put_byte(s, strm.adler & 0xff);
    put_byte(s, (strm.adler >> 8) & 0xff);
    put_byte(s, (strm.adler >> 16) & 0xff);
    put_byte(s, (strm.adler >> 24) & 0xff);
    put_byte(s, strm.total_in & 0xff);
    put_byte(s, (strm.total_in >> 8) & 0xff);
    put_byte(s, (strm.total_in >> 16) & 0xff);
    put_byte(s, (strm.total_in >> 24) & 0xff);
  }
  else
  {
    putShortMSB(s, strm.adler >>> 16);
    putShortMSB(s, strm.adler & 0xffff);
  }

  flush_pending(strm);
  /* If avail_out is zero, the application will call deflate again
   * to flush the rest.
   */
  if (s.wrap > 0) { s.wrap = -s.wrap; }
  /* write the trailer only once! */
  return s.pending !== 0 ? Z_OK : Z_STREAM_END;
}

function deflateEnd(strm) {
  var status;

  if (!strm/*== Z_NULL*/ || !strm.state/*== Z_NULL*/) {
    return Z_STREAM_ERROR;
  }

  status = strm.state.status;
  if (status !== INIT_STATE &&
    status !== EXTRA_STATE &&
    status !== NAME_STATE &&
    status !== COMMENT_STATE &&
    status !== HCRC_STATE &&
    status !== BUSY_STATE &&
    status !== FINISH_STATE
  ) {
    return err(strm, Z_STREAM_ERROR);
  }

  strm.state = null;

  return status === BUSY_STATE ? err(strm, Z_DATA_ERROR) : Z_OK;
}


/* =========================================================================
 * Initializes the compression dictionary from the given byte
 * sequence without producing any compressed output.
 */
function deflateSetDictionary(strm, dictionary) {
  var dictLength = dictionary.length;

  var s;
  var str, n;
  var wrap;
  var avail;
  var next;
  var input;
  var tmpDict;

  if (!strm/*== Z_NULL*/ || !strm.state/*== Z_NULL*/) {
    return Z_STREAM_ERROR;
  }

  s = strm.state;
  wrap = s.wrap;

  if (wrap === 2 || (wrap === 1 && s.status !== INIT_STATE) || s.lookahead) {
    return Z_STREAM_ERROR;
  }

  /* when using zlib wrappers, compute Adler-32 for provided dictionary */
  if (wrap === 1) {
    /* adler32(strm->adler, dictionary, dictLength); */
    strm.adler = adler32_1(strm.adler, dictionary, dictLength, 0);
  }

  s.wrap = 0;   /* avoid computing Adler-32 in read_buf */

  /* if dictionary would fill window, just replace the history */
  if (dictLength >= s.w_size) {
    if (wrap === 0) {            /* already empty otherwise */
      /*** CLEAR_HASH(s); ***/
      zero$1(s.head); // Fill with NIL (= 0);
      s.strstart = 0;
      s.block_start = 0;
      s.insert = 0;
    }
    /* use the tail */
    // dictionary = dictionary.slice(dictLength - s.w_size);
    tmpDict = new common.Buf8(s.w_size);
    common.arraySet(tmpDict, dictionary, dictLength - s.w_size, s.w_size, 0);
    dictionary = tmpDict;
    dictLength = s.w_size;
  }
  /* insert dictionary into window and hash */
  avail = strm.avail_in;
  next = strm.next_in;
  input = strm.input;
  strm.avail_in = dictLength;
  strm.next_in = 0;
  strm.input = dictionary;
  fill_window(s);
  while (s.lookahead >= MIN_MATCH$1) {
    str = s.strstart;
    n = s.lookahead - (MIN_MATCH$1 - 1);
    do {
      /* UPDATE_HASH(s, s->ins_h, s->window[str + MIN_MATCH-1]); */
      s.ins_h = ((s.ins_h << s.hash_shift) ^ s.window[str + MIN_MATCH$1 - 1]) & s.hash_mask;

      s.prev[str & s.w_mask] = s.head[s.ins_h];

      s.head[s.ins_h] = str;
      str++;
    } while (--n);
    s.strstart = str;
    s.lookahead = MIN_MATCH$1 - 1;
    fill_window(s);
  }
  s.strstart += s.lookahead;
  s.block_start = s.strstart;
  s.insert = s.lookahead;
  s.lookahead = 0;
  s.match_length = s.prev_length = MIN_MATCH$1 - 1;
  s.match_available = 0;
  strm.next_in = next;
  strm.input = input;
  strm.avail_in = avail;
  s.wrap = wrap;
  return Z_OK;
}


var deflateInit_1 = deflateInit;
var deflateInit2_1 = deflateInit2;
var deflateReset_1 = deflateReset;
var deflateResetKeep_1 = deflateResetKeep;
var deflateSetHeader_1 = deflateSetHeader;
var deflate_2 = deflate;
var deflateEnd_1 = deflateEnd;
var deflateSetDictionary_1 = deflateSetDictionary;
var deflateInfo = 'pako deflate (from Nodeca project)';

/* Not implemented
exports.deflateBound = deflateBound;
exports.deflateCopy = deflateCopy;
exports.deflateParams = deflateParams;
exports.deflatePending = deflatePending;
exports.deflatePrime = deflatePrime;
exports.deflateTune = deflateTune;
*/

var deflate_1 = {
	deflateInit: deflateInit_1,
	deflateInit2: deflateInit2_1,
	deflateReset: deflateReset_1,
	deflateResetKeep: deflateResetKeep_1,
	deflateSetHeader: deflateSetHeader_1,
	deflate: deflate_2,
	deflateEnd: deflateEnd_1,
	deflateSetDictionary: deflateSetDictionary_1,
	deflateInfo: deflateInfo
};

// Quick check if we can use fast array to bin string conversion
//
// - apply(Array) can fail on Android 2.2
// - apply(Uint8Array) can fail on iOS 5.1 Safari
//
var STR_APPLY_OK = true;
var STR_APPLY_UIA_OK = true;

try { String.fromCharCode.apply(null, [ 0 ]); } catch (__) { STR_APPLY_OK = false; }
try { String.fromCharCode.apply(null, new Uint8Array(1)); } catch (__) { STR_APPLY_UIA_OK = false; }


// Table with utf8 lengths (calculated by first byte of sequence)
// Note, that 5 & 6-byte values and some 4-byte values can not be represented in JS,
// because max possible codepoint is 0x10ffff
var _utf8len = new common.Buf8(256);
for (var q = 0; q < 256; q++) {
  _utf8len[q] = (q >= 252 ? 6 : q >= 248 ? 5 : q >= 240 ? 4 : q >= 224 ? 3 : q >= 192 ? 2 : 1);
}
_utf8len[254] = _utf8len[254] = 1; // Invalid sequence start


// convert string to array (typed, when possible)
var string2buf = function (str) {
  var buf, c, c2, m_pos, i, str_len = str.length, buf_len = 0;

  // count binary size
  for (m_pos = 0; m_pos < str_len; m_pos++) {
    c = str.charCodeAt(m_pos);
    if ((c & 0xfc00) === 0xd800 && (m_pos + 1 < str_len)) {
      c2 = str.charCodeAt(m_pos + 1);
      if ((c2 & 0xfc00) === 0xdc00) {
        c = 0x10000 + ((c - 0xd800) << 10) + (c2 - 0xdc00);
        m_pos++;
      }
    }
    buf_len += c < 0x80 ? 1 : c < 0x800 ? 2 : c < 0x10000 ? 3 : 4;
  }

  // allocate buffer
  buf = new common.Buf8(buf_len);

  // convert
  for (i = 0, m_pos = 0; i < buf_len; m_pos++) {
    c = str.charCodeAt(m_pos);
    if ((c & 0xfc00) === 0xd800 && (m_pos + 1 < str_len)) {
      c2 = str.charCodeAt(m_pos + 1);
      if ((c2 & 0xfc00) === 0xdc00) {
        c = 0x10000 + ((c - 0xd800) << 10) + (c2 - 0xdc00);
        m_pos++;
      }
    }
    if (c < 0x80) {
      /* one byte */
      buf[i++] = c;
    } else if (c < 0x800) {
      /* two bytes */
      buf[i++] = 0xC0 | (c >>> 6);
      buf[i++] = 0x80 | (c & 0x3f);
    } else if (c < 0x10000) {
      /* three bytes */
      buf[i++] = 0xE0 | (c >>> 12);
      buf[i++] = 0x80 | (c >>> 6 & 0x3f);
      buf[i++] = 0x80 | (c & 0x3f);
    } else {
      /* four bytes */
      buf[i++] = 0xf0 | (c >>> 18);
      buf[i++] = 0x80 | (c >>> 12 & 0x3f);
      buf[i++] = 0x80 | (c >>> 6 & 0x3f);
      buf[i++] = 0x80 | (c & 0x3f);
    }
  }

  return buf;
};

// Helper (used in 2 places)
function buf2binstring(buf, len) {
  // On Chrome, the arguments in a function call that are allowed is `65534`.
  // If the length of the buffer is smaller than that, we can use this optimization,
  // otherwise we will take a slower path.
  if (len < 65534) {
    if ((buf.subarray && STR_APPLY_UIA_OK) || (!buf.subarray && STR_APPLY_OK)) {
      return String.fromCharCode.apply(null, common.shrinkBuf(buf, len));
    }
  }

  var result = '';
  for (var i = 0; i < len; i++) {
    result += String.fromCharCode(buf[i]);
  }
  return result;
}


// Convert byte array to binary string
var buf2binstring_1 = function (buf) {
  return buf2binstring(buf, buf.length);
};


// Convert binary string (typed, when possible)
var binstring2buf = function (str) {
  var buf = new common.Buf8(str.length);
  for (var i = 0, len = buf.length; i < len; i++) {
    buf[i] = str.charCodeAt(i);
  }
  return buf;
};


// convert array to string
var buf2string = function (buf, max) {
  var i, out, c, c_len;
  var len = max || buf.length;

  // Reserve max possible length (2 words per char)
  // NB: by unknown reasons, Array is significantly faster for
  //     String.fromCharCode.apply than Uint16Array.
  var utf16buf = new Array(len * 2);

  for (out = 0, i = 0; i < len;) {
    c = buf[i++];
    // quick process ascii
    if (c < 0x80) { utf16buf[out++] = c; continue; }

    c_len = _utf8len[c];
    // skip 5 & 6 byte codes
    if (c_len > 4) { utf16buf[out++] = 0xfffd; i += c_len - 1; continue; }

    // apply mask on first byte
    c &= c_len === 2 ? 0x1f : c_len === 3 ? 0x0f : 0x07;
    // join the rest
    while (c_len > 1 && i < len) {
      c = (c << 6) | (buf[i++] & 0x3f);
      c_len--;
    }

    // terminated by end of string?
    if (c_len > 1) { utf16buf[out++] = 0xfffd; continue; }

    if (c < 0x10000) {
      utf16buf[out++] = c;
    } else {
      c -= 0x10000;
      utf16buf[out++] = 0xd800 | ((c >> 10) & 0x3ff);
      utf16buf[out++] = 0xdc00 | (c & 0x3ff);
    }
  }

  return buf2binstring(utf16buf, out);
};


// Calculate max possible position in utf8 buffer,
// that will not break sequence. If that's not possible
// - (very small limits) return max size as is.
//
// buf[] - utf8 bytes array
// max   - length limit (mandatory);
var utf8border = function (buf, max) {
  var pos;

  max = max || buf.length;
  if (max > buf.length) { max = buf.length; }

  // go back from last position, until start of sequence found
  pos = max - 1;
  while (pos >= 0 && (buf[pos] & 0xC0) === 0x80) { pos--; }

  // Very small and broken sequence,
  // return max, because we should return something anyway.
  if (pos < 0) { return max; }

  // If we came to start of buffer - that means buffer is too small,
  // return max too.
  if (pos === 0) { return max; }

  return (pos + _utf8len[buf[pos]] > max) ? pos : max;
};

var strings = {
	string2buf: string2buf,
	buf2binstring: buf2binstring_1,
	binstring2buf: binstring2buf,
	buf2string: buf2string,
	utf8border: utf8border
};

// (C) 1995-2013 Jean-loup Gailly and Mark Adler
// (C) 2014-2017 Vitaly Puzrin and Andrey Tupitsin
//
// This software is provided 'as-is', without any express or implied
// warranty. In no event will the authors be held liable for any damages
// arising from the use of this software.
//
// Permission is granted to anyone to use this software for any purpose,
// including commercial applications, and to alter it and redistribute it
// freely, subject to the following restrictions:
//
// 1. The origin of this software must not be misrepresented; you must not
//   claim that you wrote the original software. If you use this software
//   in a product, an acknowledgment in the product documentation would be
//   appreciated but is not required.
// 2. Altered source versions must be plainly marked as such, and must not be
//   misrepresented as being the original software.
// 3. This notice may not be removed or altered from any source distribution.

function ZStream() {
  /* next input byte */
  this.input = null; // JS specific, because we have no pointers
  this.next_in = 0;
  /* number of bytes available at input */
  this.avail_in = 0;
  /* total number of input bytes read so far */
  this.total_in = 0;
  /* next output byte should be put there */
  this.output = null; // JS specific, because we have no pointers
  this.next_out = 0;
  /* remaining free space at output */
  this.avail_out = 0;
  /* total number of bytes output so far */
  this.total_out = 0;
  /* last error message, NULL if no error */
  this.msg = ''/*Z_NULL*/;
  /* not visible by applications */
  this.state = null;
  /* best guess about the data type: binary or text */
  this.data_type = 2/*Z_UNKNOWN*/;
  /* adler32 value of the uncompressed data */
  this.adler = 0;
}

var zstream = ZStream;

var toString = Object.prototype.toString;

/* Public constants ==========================================================*/
/* ===========================================================================*/

var Z_NO_FLUSH$1      = 0;
var Z_FINISH$1        = 4;

var Z_OK$1            = 0;
var Z_STREAM_END$1    = 1;
var Z_SYNC_FLUSH    = 2;

var Z_DEFAULT_COMPRESSION$1 = -1;

var Z_DEFAULT_STRATEGY$1    = 0;

var Z_DEFLATED$1  = 8;

/* ===========================================================================*/


/**
 * class Deflate
 *
 * Generic JS-style wrapper for zlib calls. If you don't need
 * streaming behaviour - use more simple functions: [[deflate]],
 * [[deflateRaw]] and [[gzip]].
 **/

/* internal
 * Deflate.chunks -> Array
 *
 * Chunks of output data, if [[Deflate#onData]] not overridden.
 **/

/**
 * Deflate.result -> Uint8Array|Array
 *
 * Compressed result, generated by default [[Deflate#onData]]
 * and [[Deflate#onEnd]] handlers. Filled after you push last chunk
 * (call [[Deflate#push]] with `Z_FINISH` / `true` param)  or if you
 * push a chunk with explicit flush (call [[Deflate#push]] with
 * `Z_SYNC_FLUSH` param).
 **/

/**
 * Deflate.err -> Number
 *
 * Error code after deflate finished. 0 (Z_OK) on success.
 * You will not need it in real life, because deflate errors
 * are possible only on wrong options or bad `onData` / `onEnd`
 * custom handlers.
 **/

/**
 * Deflate.msg -> String
 *
 * Error message, if [[Deflate.err]] != 0
 **/


/**
 * new Deflate(options)
 * - options (Object): zlib deflate options.
 *
 * Creates new deflator instance with specified params. Throws exception
 * on bad params. Supported options:
 *
 * - `level`
 * - `windowBits`
 * - `memLevel`
 * - `strategy`
 * - `dictionary`
 *
 * [http://zlib.net/manual.html#Advanced](http://zlib.net/manual.html#Advanced)
 * for more information on these.
 *
 * Additional options, for internal needs:
 *
 * - `chunkSize` - size of generated data chunks (16K by default)
 * - `raw` (Boolean) - do raw deflate
 * - `gzip` (Boolean) - create gzip wrapper
 * - `to` (String) - if equal to 'string', then result will be "binary string"
 *    (each char code [0..255])
 * - `header` (Object) - custom header for gzip
 *   - `text` (Boolean) - true if compressed data believed to be text
 *   - `time` (Number) - modification time, unix timestamp
 *   - `os` (Number) - operation system code
 *   - `extra` (Array) - array of bytes with extra data (max 65536)
 *   - `name` (String) - file name (binary string)
 *   - `comment` (String) - comment (binary string)
 *   - `hcrc` (Boolean) - true if header crc should be added
 *
 * ##### Example:
 *
 * ```javascript
 * var pako = require('pako')
 *   , chunk1 = Uint8Array([1,2,3,4,5,6,7,8,9])
 *   , chunk2 = Uint8Array([10,11,12,13,14,15,16,17,18,19]);
 *
 * var deflate = new pako.Deflate({ level: 3});
 *
 * deflate.push(chunk1, false);
 * deflate.push(chunk2, true);  // true -> last chunk
 *
 * if (deflate.err) { throw new Error(deflate.err); }
 *
 * console.log(deflate.result);
 * ```
 **/
function Deflate(options) {
  if (!(this instanceof Deflate)) return new Deflate(options);

  this.options = common.assign({
    level: Z_DEFAULT_COMPRESSION$1,
    method: Z_DEFLATED$1,
    chunkSize: 16384,
    windowBits: 15,
    memLevel: 8,
    strategy: Z_DEFAULT_STRATEGY$1,
    to: ''
  }, options || {});

  var opt = this.options;

  if (opt.raw && (opt.windowBits > 0)) {
    opt.windowBits = -opt.windowBits;
  }

  else if (opt.gzip && (opt.windowBits > 0) && (opt.windowBits < 16)) {
    opt.windowBits += 16;
  }

  this.err    = 0;      // error code, if happens (0 = Z_OK)
  this.msg    = '';     // error message
  this.ended  = false;  // used to avoid multiple onEnd() calls
  this.chunks = [];     // chunks of compressed data

  this.strm = new zstream();
  this.strm.avail_out = 0;

  var status = deflate_1.deflateInit2(
    this.strm,
    opt.level,
    opt.method,
    opt.windowBits,
    opt.memLevel,
    opt.strategy
  );

  if (status !== Z_OK$1) {
    throw new Error(messages[status]);
  }

  if (opt.header) {
    deflate_1.deflateSetHeader(this.strm, opt.header);
  }

  if (opt.dictionary) {
    var dict;
    // Convert data if needed
    if (typeof opt.dictionary === 'string') {
      // If we need to compress text, change encoding to utf8.
      dict = strings.string2buf(opt.dictionary);
    } else if (toString.call(opt.dictionary) === '[object ArrayBuffer]') {
      dict = new Uint8Array(opt.dictionary);
    } else {
      dict = opt.dictionary;
    }

    status = deflate_1.deflateSetDictionary(this.strm, dict);

    if (status !== Z_OK$1) {
      throw new Error(messages[status]);
    }

    this._dict_set = true;
  }
}

/**
 * Deflate#push(data[, mode]) -> Boolean
 * - data (Uint8Array|Array|ArrayBuffer|String): input data. Strings will be
 *   converted to utf8 byte sequence.
 * - mode (Number|Boolean): 0..6 for corresponding Z_NO_FLUSH..Z_TREE modes.
 *   See constants. Skipped or `false` means Z_NO_FLUSH, `true` means Z_FINISH.
 *
 * Sends input data to deflate pipe, generating [[Deflate#onData]] calls with
 * new compressed chunks. Returns `true` on success. The last data block must have
 * mode Z_FINISH (or `true`). That will flush internal pending buffers and call
 * [[Deflate#onEnd]]. For interim explicit flushes (without ending the stream) you
 * can use mode Z_SYNC_FLUSH, keeping the compression context.
 *
 * On fail call [[Deflate#onEnd]] with error code and return false.
 *
 * We strongly recommend to use `Uint8Array` on input for best speed (output
 * array format is detected automatically). Also, don't skip last param and always
 * use the same type in your code (boolean or number). That will improve JS speed.
 *
 * For regular `Array`-s make sure all elements are [0..255].
 *
 * ##### Example
 *
 * ```javascript
 * push(chunk, false); // push one of data chunks
 * ...
 * push(chunk, true);  // push last chunk
 * ```
 **/
Deflate.prototype.push = function (data, mode) {
  var strm = this.strm;
  var chunkSize = this.options.chunkSize;
  var status, _mode;

  if (this.ended) { return false; }

  _mode = (mode === ~~mode) ? mode : ((mode === true) ? Z_FINISH$1 : Z_NO_FLUSH$1);

  // Convert data if needed
  if (typeof data === 'string') {
    // If we need to compress text, change encoding to utf8.
    strm.input = strings.string2buf(data);
  } else if (toString.call(data) === '[object ArrayBuffer]') {
    strm.input = new Uint8Array(data);
  } else {
    strm.input = data;
  }

  strm.next_in = 0;
  strm.avail_in = strm.input.length;

  do {
    if (strm.avail_out === 0) {
      strm.output = new common.Buf8(chunkSize);
      strm.next_out = 0;
      strm.avail_out = chunkSize;
    }
    status = deflate_1.deflate(strm, _mode);    /* no bad return value */

    if (status !== Z_STREAM_END$1 && status !== Z_OK$1) {
      this.onEnd(status);
      this.ended = true;
      return false;
    }
    if (strm.avail_out === 0 || (strm.avail_in === 0 && (_mode === Z_FINISH$1 || _mode === Z_SYNC_FLUSH))) {
      if (this.options.to === 'string') {
        this.onData(strings.buf2binstring(common.shrinkBuf(strm.output, strm.next_out)));
      } else {
        this.onData(common.shrinkBuf(strm.output, strm.next_out));
      }
    }
  } while ((strm.avail_in > 0 || strm.avail_out === 0) && status !== Z_STREAM_END$1);

  // Finalize on the last chunk.
  if (_mode === Z_FINISH$1) {
    status = deflate_1.deflateEnd(this.strm);
    this.onEnd(status);
    this.ended = true;
    return status === Z_OK$1;
  }

  // callback interim results if Z_SYNC_FLUSH.
  if (_mode === Z_SYNC_FLUSH) {
    this.onEnd(Z_OK$1);
    strm.avail_out = 0;
    return true;
  }

  return true;
};


/**
 * Deflate#onData(chunk) -> Void
 * - chunk (Uint8Array|Array|String): output data. Type of array depends
 *   on js engine support. When string output requested, each chunk
 *   will be string.
 *
 * By default, stores data blocks in `chunks[]` property and glue
 * those in `onEnd`. Override this handler, if you need another behaviour.
 **/
Deflate.prototype.onData = function (chunk) {
  this.chunks.push(chunk);
};


/**
 * Deflate#onEnd(status) -> Void
 * - status (Number): deflate status. 0 (Z_OK) on success,
 *   other if not.
 *
 * Called once after you tell deflate that the input stream is
 * complete (Z_FINISH) or should be flushed (Z_SYNC_FLUSH)
 * or if an error happened. By default - join collected chunks,
 * free memory and fill `results` / `err` properties.
 **/
Deflate.prototype.onEnd = function (status) {
  // On success - join
  if (status === Z_OK$1) {
    if (this.options.to === 'string') {
      this.result = this.chunks.join('');
    } else {
      this.result = common.flattenChunks(this.chunks);
    }
  }
  this.chunks = [];
  this.err = status;
  this.msg = this.strm.msg;
};


/**
 * deflate(data[, options]) -> Uint8Array|Array|String
 * - data (Uint8Array|Array|String): input data to compress.
 * - options (Object): zlib deflate options.
 *
 * Compress `data` with deflate algorithm and `options`.
 *
 * Supported options are:
 *
 * - level
 * - windowBits
 * - memLevel
 * - strategy
 * - dictionary
 *
 * [http://zlib.net/manual.html#Advanced](http://zlib.net/manual.html#Advanced)
 * for more information on these.
 *
 * Sugar (options):
 *
 * - `raw` (Boolean) - say that we work with raw stream, if you don't wish to specify
 *   negative windowBits implicitly.
 * - `to` (String) - if equal to 'string', then result will be "binary string"
 *    (each char code [0..255])
 *
 * ##### Example:
 *
 * ```javascript
 * var pako = require('pako')
 *   , data = Uint8Array([1,2,3,4,5,6,7,8,9]);
 *
 * console.log(pako.deflate(data));
 * ```
 **/
function deflate$1(input, options) {
  var deflator = new Deflate(options);

  deflator.push(input, true);

  // That will never happens, if you don't cheat with options :)
  if (deflator.err) { throw deflator.msg || messages[deflator.err]; }

  return deflator.result;
}


/**
 * deflateRaw(data[, options]) -> Uint8Array|Array|String
 * - data (Uint8Array|Array|String): input data to compress.
 * - options (Object): zlib deflate options.
 *
 * The same as [[deflate]], but creates raw data, without wrapper
 * (header and adler32 crc).
 **/
function deflateRaw(input, options) {
  options = options || {};
  options.raw = true;
  return deflate$1(input, options);
}


/**
 * gzip(data[, options]) -> Uint8Array|Array|String
 * - data (Uint8Array|Array|String): input data to compress.
 * - options (Object): zlib deflate options.
 *
 * The same as [[deflate]], but create gzip wrapper instead of
 * deflate one.
 **/
function gzip(input, options) {
  options = options || {};
  options.gzip = true;
  return deflate$1(input, options);
}


var Deflate_1 = Deflate;
var deflate_2$1 = deflate$1;
var deflateRaw_1 = deflateRaw;
var gzip_1 = gzip;

var deflate_1$1 = {
	Deflate: Deflate_1,
	deflate: deflate_2$1,
	deflateRaw: deflateRaw_1,
	gzip: gzip_1
};

// (C) 1995-2013 Jean-loup Gailly and Mark Adler
// (C) 2014-2017 Vitaly Puzrin and Andrey Tupitsin
//
// This software is provided 'as-is', without any express or implied
// warranty. In no event will the authors be held liable for any damages
// arising from the use of this software.
//
// Permission is granted to anyone to use this software for any purpose,
// including commercial applications, and to alter it and redistribute it
// freely, subject to the following restrictions:
//
// 1. The origin of this software must not be misrepresented; you must not
//   claim that you wrote the original software. If you use this software
//   in a product, an acknowledgment in the product documentation would be
//   appreciated but is not required.
// 2. Altered source versions must be plainly marked as such, and must not be
//   misrepresented as being the original software.
// 3. This notice may not be removed or altered from any source distribution.

// See state defs from inflate.js
var BAD = 30;       /* got a data error -- remain here until reset */
var TYPE = 12;      /* i: waiting for type bits, including last-flag bit */

/*
   Decode literal, length, and distance codes and write out the resulting
   literal and match bytes until either not enough input or output is
   available, an end-of-block is encountered, or a data error is encountered.
   When large enough input and output buffers are supplied to inflate(), for
   example, a 16K input buffer and a 64K output buffer, more than 95% of the
   inflate execution time is spent in this routine.

   Entry assumptions:

        state.mode === LEN
        strm.avail_in >= 6
        strm.avail_out >= 258
        start >= strm.avail_out
        state.bits < 8

   On return, state.mode is one of:

        LEN -- ran out of enough output space or enough available input
        TYPE -- reached end of block code, inflate() to interpret next block
        BAD -- error in block data

   Notes:

    - The maximum input bits used by a length/distance pair is 15 bits for the
      length code, 5 bits for the length extra, 15 bits for the distance code,
      and 13 bits for the distance extra.  This totals 48 bits, or six bytes.
      Therefore if strm.avail_in >= 6, then there is enough input to avoid
      checking for available input while decoding.

    - The maximum bytes that a single length/distance pair can output is 258
      bytes, which is the maximum length that can be coded.  inflate_fast()
      requires strm.avail_out >= 258 for each loop to avoid checking for
      output space.
 */
var inffast = function inflate_fast(strm, start) {
  var state;
  var _in;                    /* local strm.input */
  var last;                   /* have enough input while in < last */
  var _out;                   /* local strm.output */
  var beg;                    /* inflate()'s initial strm.output */
  var end;                    /* while out < end, enough space available */
//#ifdef INFLATE_STRICT
  var dmax;                   /* maximum distance from zlib header */
//#endif
  var wsize;                  /* window size or zero if not using window */
  var whave;                  /* valid bytes in the window */
  var wnext;                  /* window write index */
  // Use `s_window` instead `window`, avoid conflict with instrumentation tools
  var s_window;               /* allocated sliding window, if wsize != 0 */
  var hold;                   /* local strm.hold */
  var bits;                   /* local strm.bits */
  var lcode;                  /* local strm.lencode */
  var dcode;                  /* local strm.distcode */
  var lmask;                  /* mask for first level of length codes */
  var dmask;                  /* mask for first level of distance codes */
  var here;                   /* retrieved table entry */
  var op;                     /* code bits, operation, extra bits, or */
                              /*  window position, window bytes to copy */
  var len;                    /* match length, unused bytes */
  var dist;                   /* match distance */
  var from;                   /* where to copy match from */
  var from_source;


  var input, output; // JS specific, because we have no pointers

  /* copy state to local variables */
  state = strm.state;
  //here = state.here;
  _in = strm.next_in;
  input = strm.input;
  last = _in + (strm.avail_in - 5);
  _out = strm.next_out;
  output = strm.output;
  beg = _out - (start - strm.avail_out);
  end = _out + (strm.avail_out - 257);
//#ifdef INFLATE_STRICT
  dmax = state.dmax;
//#endif
  wsize = state.wsize;
  whave = state.whave;
  wnext = state.wnext;
  s_window = state.window;
  hold = state.hold;
  bits = state.bits;
  lcode = state.lencode;
  dcode = state.distcode;
  lmask = (1 << state.lenbits) - 1;
  dmask = (1 << state.distbits) - 1;


  /* decode literals and length/distances until end-of-block or not enough
     input data or output space */

  top:
  do {
    if (bits < 15) {
      hold += input[_in++] << bits;
      bits += 8;
      hold += input[_in++] << bits;
      bits += 8;
    }

    here = lcode[hold & lmask];

    dolen:
    for (;;) { // Goto emulation
      op = here >>> 24/*here.bits*/;
      hold >>>= op;
      bits -= op;
      op = (here >>> 16) & 0xff/*here.op*/;
      if (op === 0) {                          /* literal */
        //Tracevv((stderr, here.val >= 0x20 && here.val < 0x7f ?
        //        "inflate:         literal '%c'\n" :
        //        "inflate:         literal 0x%02x\n", here.val));
        output[_out++] = here & 0xffff/*here.val*/;
      }
      else if (op & 16) {                     /* length base */
        len = here & 0xffff/*here.val*/;
        op &= 15;                           /* number of extra bits */
        if (op) {
          if (bits < op) {
            hold += input[_in++] << bits;
            bits += 8;
          }
          len += hold & ((1 << op) - 1);
          hold >>>= op;
          bits -= op;
        }
        //Tracevv((stderr, "inflate:         length %u\n", len));
        if (bits < 15) {
          hold += input[_in++] << bits;
          bits += 8;
          hold += input[_in++] << bits;
          bits += 8;
        }
        here = dcode[hold & dmask];

        dodist:
        for (;;) { // goto emulation
          op = here >>> 24/*here.bits*/;
          hold >>>= op;
          bits -= op;
          op = (here >>> 16) & 0xff/*here.op*/;

          if (op & 16) {                      /* distance base */
            dist = here & 0xffff/*here.val*/;
            op &= 15;                       /* number of extra bits */
            if (bits < op) {
              hold += input[_in++] << bits;
              bits += 8;
              if (bits < op) {
                hold += input[_in++] << bits;
                bits += 8;
              }
            }
            dist += hold & ((1 << op) - 1);
//#ifdef INFLATE_STRICT
            if (dist > dmax) {
              strm.msg = 'invalid distance too far back';
              state.mode = BAD;
              break top;
            }
//#endif
            hold >>>= op;
            bits -= op;
            //Tracevv((stderr, "inflate:         distance %u\n", dist));
            op = _out - beg;                /* max distance in output */
            if (dist > op) {                /* see if copy from window */
              op = dist - op;               /* distance back in window */
              if (op > whave) {
                if (state.sane) {
                  strm.msg = 'invalid distance too far back';
                  state.mode = BAD;
                  break top;
                }

// (!) This block is disabled in zlib defaults,
// don't enable it for binary compatibility
//#ifdef INFLATE_ALLOW_INVALID_DISTANCE_TOOFAR_ARRR
//                if (len <= op - whave) {
//                  do {
//                    output[_out++] = 0;
//                  } while (--len);
//                  continue top;
//                }
//                len -= op - whave;
//                do {
//                  output[_out++] = 0;
//                } while (--op > whave);
//                if (op === 0) {
//                  from = _out - dist;
//                  do {
//                    output[_out++] = output[from++];
//                  } while (--len);
//                  continue top;
//                }
//#endif
              }
              from = 0; // window index
              from_source = s_window;
              if (wnext === 0) {           /* very common case */
                from += wsize - op;
                if (op < len) {         /* some from window */
                  len -= op;
                  do {
                    output[_out++] = s_window[from++];
                  } while (--op);
                  from = _out - dist;  /* rest from output */
                  from_source = output;
                }
              }
              else if (wnext < op) {      /* wrap around window */
                from += wsize + wnext - op;
                op -= wnext;
                if (op < len) {         /* some from end of window */
                  len -= op;
                  do {
                    output[_out++] = s_window[from++];
                  } while (--op);
                  from = 0;
                  if (wnext < len) {  /* some from start of window */
                    op = wnext;
                    len -= op;
                    do {
                      output[_out++] = s_window[from++];
                    } while (--op);
                    from = _out - dist;      /* rest from output */
                    from_source = output;
                  }
                }
              }
              else {                      /* contiguous in window */
                from += wnext - op;
                if (op < len) {         /* some from window */
                  len -= op;
                  do {
                    output[_out++] = s_window[from++];
                  } while (--op);
                  from = _out - dist;  /* rest from output */
                  from_source = output;
                }
              }
              while (len > 2) {
                output[_out++] = from_source[from++];
                output[_out++] = from_source[from++];
                output[_out++] = from_source[from++];
                len -= 3;
              }
              if (len) {
                output[_out++] = from_source[from++];
                if (len > 1) {
                  output[_out++] = from_source[from++];
                }
              }
            }
            else {
              from = _out - dist;          /* copy direct from output */
              do {                        /* minimum length is three */
                output[_out++] = output[from++];
                output[_out++] = output[from++];
                output[_out++] = output[from++];
                len -= 3;
              } while (len > 2);
              if (len) {
                output[_out++] = output[from++];
                if (len > 1) {
                  output[_out++] = output[from++];
                }
              }
            }
          }
          else if ((op & 64) === 0) {          /* 2nd level distance code */
            here = dcode[(here & 0xffff)/*here.val*/ + (hold & ((1 << op) - 1))];
            continue dodist;
          }
          else {
            strm.msg = 'invalid distance code';
            state.mode = BAD;
            break top;
          }

          break; // need to emulate goto via "continue"
        }
      }
      else if ((op & 64) === 0) {              /* 2nd level length code */
        here = lcode[(here & 0xffff)/*here.val*/ + (hold & ((1 << op) - 1))];
        continue dolen;
      }
      else if (op & 32) {                     /* end-of-block */
        //Tracevv((stderr, "inflate:         end of block\n"));
        state.mode = TYPE;
        break top;
      }
      else {
        strm.msg = 'invalid literal/length code';
        state.mode = BAD;
        break top;
      }

      break; // need to emulate goto via "continue"
    }
  } while (_in < last && _out < end);

  /* return unused bytes (on entry, bits < 8, so in won't go too far back) */
  len = bits >> 3;
  _in -= len;
  bits -= len << 3;
  hold &= (1 << bits) - 1;

  /* update state and return */
  strm.next_in = _in;
  strm.next_out = _out;
  strm.avail_in = (_in < last ? 5 + (last - _in) : 5 - (_in - last));
  strm.avail_out = (_out < end ? 257 + (end - _out) : 257 - (_out - end));
  state.hold = hold;
  state.bits = bits;
  return;
};

// (C) 1995-2013 Jean-loup Gailly and Mark Adler
// (C) 2014-2017 Vitaly Puzrin and Andrey Tupitsin
//
// This software is provided 'as-is', without any express or implied
// warranty. In no event will the authors be held liable for any damages
// arising from the use of this software.
//
// Permission is granted to anyone to use this software for any purpose,
// including commercial applications, and to alter it and redistribute it
// freely, subject to the following restrictions:
//
// 1. The origin of this software must not be misrepresented; you must not
//   claim that you wrote the original software. If you use this software
//   in a product, an acknowledgment in the product documentation would be
//   appreciated but is not required.
// 2. Altered source versions must be plainly marked as such, and must not be
//   misrepresented as being the original software.
// 3. This notice may not be removed or altered from any source distribution.



var MAXBITS = 15;
var ENOUGH_LENS = 852;
var ENOUGH_DISTS = 592;
//var ENOUGH = (ENOUGH_LENS+ENOUGH_DISTS);

var CODES = 0;
var LENS = 1;
var DISTS = 2;

var lbase = [ /* Length codes 257..285 base */
  3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15, 17, 19, 23, 27, 31,
  35, 43, 51, 59, 67, 83, 99, 115, 131, 163, 195, 227, 258, 0, 0
];

var lext = [ /* Length codes 257..285 extra */
  16, 16, 16, 16, 16, 16, 16, 16, 17, 17, 17, 17, 18, 18, 18, 18,
  19, 19, 19, 19, 20, 20, 20, 20, 21, 21, 21, 21, 16, 72, 78
];

var dbase = [ /* Distance codes 0..29 base */
  1, 2, 3, 4, 5, 7, 9, 13, 17, 25, 33, 49, 65, 97, 129, 193,
  257, 385, 513, 769, 1025, 1537, 2049, 3073, 4097, 6145,
  8193, 12289, 16385, 24577, 0, 0
];

var dext = [ /* Distance codes 0..29 extra */
  16, 16, 16, 16, 17, 17, 18, 18, 19, 19, 20, 20, 21, 21, 22, 22,
  23, 23, 24, 24, 25, 25, 26, 26, 27, 27,
  28, 28, 29, 29, 64, 64
];

var inftrees = function inflate_table(type, lens, lens_index, codes, table, table_index, work, opts)
{
  var bits = opts.bits;
      //here = opts.here; /* table entry for duplication */

  var len = 0;               /* a code's length in bits */
  var sym = 0;               /* index of code symbols */
  var min = 0, max = 0;          /* minimum and maximum code lengths */
  var root = 0;              /* number of index bits for root table */
  var curr = 0;              /* number of index bits for current table */
  var drop = 0;              /* code bits to drop for sub-table */
  var left = 0;                   /* number of prefix codes available */
  var used = 0;              /* code entries in table used */
  var huff = 0;              /* Huffman code */
  var incr;              /* for incrementing code, index */
  var fill;              /* index for replicating entries */
  var low;               /* low bits for current root entry */
  var mask;              /* mask for low root bits */
  var next;             /* next available space in table */
  var base = null;     /* base value table to use */
  var base_index = 0;
//  var shoextra;    /* extra bits table to use */
  var end;                    /* use base and extra for symbol > end */
  var count = new common.Buf16(MAXBITS + 1); //[MAXBITS+1];    /* number of codes of each length */
  var offs = new common.Buf16(MAXBITS + 1); //[MAXBITS+1];     /* offsets in table for each length */
  var extra = null;
  var extra_index = 0;

  var here_bits, here_op, here_val;

  /*
   Process a set of code lengths to create a canonical Huffman code.  The
   code lengths are lens[0..codes-1].  Each length corresponds to the
   symbols 0..codes-1.  The Huffman code is generated by first sorting the
   symbols by length from short to long, and retaining the symbol order
   for codes with equal lengths.  Then the code starts with all zero bits
   for the first code of the shortest length, and the codes are integer
   increments for the same length, and zeros are appended as the length
   increases.  For the deflate format, these bits are stored backwards
   from their more natural integer increment ordering, and so when the
   decoding tables are built in the large loop below, the integer codes
   are incremented backwards.

   This routine assumes, but does not check, that all of the entries in
   lens[] are in the range 0..MAXBITS.  The caller must assure this.
   1..MAXBITS is interpreted as that code length.  zero means that that
   symbol does not occur in this code.

   The codes are sorted by computing a count of codes for each length,
   creating from that a table of starting indices for each length in the
   sorted table, and then entering the symbols in order in the sorted
   table.  The sorted table is work[], with that space being provided by
   the caller.

   The length counts are used for other purposes as well, i.e. finding
   the minimum and maximum length codes, determining if there are any
   codes at all, checking for a valid set of lengths, and looking ahead
   at length counts to determine sub-table sizes when building the
   decoding tables.
   */

  /* accumulate lengths for codes (assumes lens[] all in 0..MAXBITS) */
  for (len = 0; len <= MAXBITS; len++) {
    count[len] = 0;
  }
  for (sym = 0; sym < codes; sym++) {
    count[lens[lens_index + sym]]++;
  }

  /* bound code lengths, force root to be within code lengths */
  root = bits;
  for (max = MAXBITS; max >= 1; max--) {
    if (count[max] !== 0) { break; }
  }
  if (root > max) {
    root = max;
  }
  if (max === 0) {                     /* no symbols to code at all */
    //table.op[opts.table_index] = 64;  //here.op = (var char)64;    /* invalid code marker */
    //table.bits[opts.table_index] = 1;   //here.bits = (var char)1;
    //table.val[opts.table_index++] = 0;   //here.val = (var short)0;
    table[table_index++] = (1 << 24) | (64 << 16) | 0;


    //table.op[opts.table_index] = 64;
    //table.bits[opts.table_index] = 1;
    //table.val[opts.table_index++] = 0;
    table[table_index++] = (1 << 24) | (64 << 16) | 0;

    opts.bits = 1;
    return 0;     /* no symbols, but wait for decoding to report error */
  }
  for (min = 1; min < max; min++) {
    if (count[min] !== 0) { break; }
  }
  if (root < min) {
    root = min;
  }

  /* check for an over-subscribed or incomplete set of lengths */
  left = 1;
  for (len = 1; len <= MAXBITS; len++) {
    left <<= 1;
    left -= count[len];
    if (left < 0) {
      return -1;
    }        /* over-subscribed */
  }
  if (left > 0 && (type === CODES || max !== 1)) {
    return -1;                      /* incomplete set */
  }

  /* generate offsets into symbol table for each length for sorting */
  offs[1] = 0;
  for (len = 1; len < MAXBITS; len++) {
    offs[len + 1] = offs[len] + count[len];
  }

  /* sort symbols by length, by symbol order within each length */
  for (sym = 0; sym < codes; sym++) {
    if (lens[lens_index + sym] !== 0) {
      work[offs[lens[lens_index + sym]]++] = sym;
    }
  }

  /*
   Create and fill in decoding tables.  In this loop, the table being
   filled is at next and has curr index bits.  The code being used is huff
   with length len.  That code is converted to an index by dropping drop
   bits off of the bottom.  For codes where len is less than drop + curr,
   those top drop + curr - len bits are incremented through all values to
   fill the table with replicated entries.

   root is the number of index bits for the root table.  When len exceeds
   root, sub-tables are created pointed to by the root entry with an index
   of the low root bits of huff.  This is saved in low to check for when a
   new sub-table should be started.  drop is zero when the root table is
   being filled, and drop is root when sub-tables are being filled.

   When a new sub-table is needed, it is necessary to look ahead in the
   code lengths to determine what size sub-table is needed.  The length
   counts are used for this, and so count[] is decremented as codes are
   entered in the tables.

   used keeps track of how many table entries have been allocated from the
   provided *table space.  It is checked for LENS and DIST tables against
   the constants ENOUGH_LENS and ENOUGH_DISTS to guard against changes in
   the initial root table size constants.  See the comments in inftrees.h
   for more information.

   sym increments through all symbols, and the loop terminates when
   all codes of length max, i.e. all codes, have been processed.  This
   routine permits incomplete codes, so another loop after this one fills
   in the rest of the decoding tables with invalid code markers.
   */

  /* set up for code type */
  // poor man optimization - use if-else instead of switch,
  // to avoid deopts in old v8
  if (type === CODES) {
    base = extra = work;    /* dummy value--not used */
    end = 19;

  } else if (type === LENS) {
    base = lbase;
    base_index -= 257;
    extra = lext;
    extra_index -= 257;
    end = 256;

  } else {                    /* DISTS */
    base = dbase;
    extra = dext;
    end = -1;
  }

  /* initialize opts for loop */
  huff = 0;                   /* starting code */
  sym = 0;                    /* starting code symbol */
  len = min;                  /* starting code length */
  next = table_index;              /* current table to fill in */
  curr = root;                /* current table index bits */
  drop = 0;                   /* current bits to drop from code for index */
  low = -1;                   /* trigger new sub-table when len > root */
  used = 1 << root;          /* use root table entries */
  mask = used - 1;            /* mask for comparing low */

  /* check available table space */
  if ((type === LENS && used > ENOUGH_LENS) ||
    (type === DISTS && used > ENOUGH_DISTS)) {
    return 1;
  }

  /* process all codes and make table entries */
  for (;;) {
    /* create table entry */
    here_bits = len - drop;
    if (work[sym] < end) {
      here_op = 0;
      here_val = work[sym];
    }
    else if (work[sym] > end) {
      here_op = extra[extra_index + work[sym]];
      here_val = base[base_index + work[sym]];
    }
    else {
      here_op = 32 + 64;         /* end of block */
      here_val = 0;
    }

    /* replicate for those indices with low len bits equal to huff */
    incr = 1 << (len - drop);
    fill = 1 << curr;
    min = fill;                 /* save offset to next table */
    do {
      fill -= incr;
      table[next + (huff >> drop) + fill] = (here_bits << 24) | (here_op << 16) | here_val |0;
    } while (fill !== 0);

    /* backwards increment the len-bit code huff */
    incr = 1 << (len - 1);
    while (huff & incr) {
      incr >>= 1;
    }
    if (incr !== 0) {
      huff &= incr - 1;
      huff += incr;
    } else {
      huff = 0;
    }

    /* go to next symbol, update count, len */
    sym++;
    if (--count[len] === 0) {
      if (len === max) { break; }
      len = lens[lens_index + work[sym]];
    }

    /* create new sub-table if needed */
    if (len > root && (huff & mask) !== low) {
      /* if first time, transition to sub-tables */
      if (drop === 0) {
        drop = root;
      }

      /* increment past last table */
      next += min;            /* here min is 1 << curr */

      /* determine length of next table */
      curr = len - drop;
      left = 1 << curr;
      while (curr + drop < max) {
        left -= count[curr + drop];
        if (left <= 0) { break; }
        curr++;
        left <<= 1;
      }

      /* check for enough space */
      used += 1 << curr;
      if ((type === LENS && used > ENOUGH_LENS) ||
        (type === DISTS && used > ENOUGH_DISTS)) {
        return 1;
      }

      /* point entry in root table to sub-table */
      low = huff & mask;
      /*table.op[low] = curr;
      table.bits[low] = root;
      table.val[low] = next - opts.table_index;*/
      table[low] = (root << 24) | (curr << 16) | (next - table_index) |0;
    }
  }

  /* fill in remaining table entry if code is incomplete (guaranteed to have
   at most one remaining entry, since if the code is incomplete, the
   maximum code length that was allowed to get this far is one bit) */
  if (huff !== 0) {
    //table.op[next + huff] = 64;            /* invalid code marker */
    //table.bits[next + huff] = len - drop;
    //table.val[next + huff] = 0;
    table[next + huff] = ((len - drop) << 24) | (64 << 16) |0;
  }

  /* set return parameters */
  //opts.table_index += used;
  opts.bits = root;
  return 0;
};

// (C) 1995-2013 Jean-loup Gailly and Mark Adler
// (C) 2014-2017 Vitaly Puzrin and Andrey Tupitsin
//
// This software is provided 'as-is', without any express or implied
// warranty. In no event will the authors be held liable for any damages
// arising from the use of this software.
//
// Permission is granted to anyone to use this software for any purpose,
// including commercial applications, and to alter it and redistribute it
// freely, subject to the following restrictions:
//
// 1. The origin of this software must not be misrepresented; you must not
//   claim that you wrote the original software. If you use this software
//   in a product, an acknowledgment in the product documentation would be
//   appreciated but is not required.
// 2. Altered source versions must be plainly marked as such, and must not be
//   misrepresented as being the original software.
// 3. This notice may not be removed or altered from any source distribution.







var CODES$1 = 0;
var LENS$1 = 1;
var DISTS$1 = 2;

/* Public constants ==========================================================*/
/* ===========================================================================*/


/* Allowed flush values; see deflate() and inflate() below for details */
//var Z_NO_FLUSH      = 0;
//var Z_PARTIAL_FLUSH = 1;
//var Z_SYNC_FLUSH    = 2;
//var Z_FULL_FLUSH    = 3;
var Z_FINISH$2        = 4;
var Z_BLOCK$1         = 5;
var Z_TREES         = 6;


/* Return codes for the compression/decompression functions. Negative values
 * are errors, positive values are used for special but normal events.
 */
var Z_OK$2            = 0;
var Z_STREAM_END$2    = 1;
var Z_NEED_DICT     = 2;
//var Z_ERRNO         = -1;
var Z_STREAM_ERROR$1  = -2;
var Z_DATA_ERROR$1    = -3;
var Z_MEM_ERROR     = -4;
var Z_BUF_ERROR$1     = -5;
//var Z_VERSION_ERROR = -6;

/* The deflate compression method */
var Z_DEFLATED$2  = 8;


/* STATES ====================================================================*/
/* ===========================================================================*/


var    HEAD = 1;       /* i: waiting for magic header */
var    FLAGS = 2;      /* i: waiting for method and flags (gzip) */
var    TIME = 3;       /* i: waiting for modification time (gzip) */
var    OS = 4;         /* i: waiting for extra flags and operating system (gzip) */
var    EXLEN = 5;      /* i: waiting for extra length (gzip) */
var    EXTRA = 6;      /* i: waiting for extra bytes (gzip) */
var    NAME = 7;       /* i: waiting for end of file name (gzip) */
var    COMMENT = 8;    /* i: waiting for end of comment (gzip) */
var    HCRC = 9;       /* i: waiting for header crc (gzip) */
var    DICTID = 10;    /* i: waiting for dictionary check value */
var    DICT = 11;      /* waiting for inflateSetDictionary() call */
var        TYPE$1 = 12;      /* i: waiting for type bits, including last-flag bit */
var        TYPEDO = 13;    /* i: same, but skip check to exit inflate on new block */
var        STORED = 14;    /* i: waiting for stored size (length and complement) */
var        COPY_ = 15;     /* i/o: same as COPY below, but only first time in */
var        COPY = 16;      /* i/o: waiting for input or output to copy stored block */
var        TABLE = 17;     /* i: waiting for dynamic block table lengths */
var        LENLENS = 18;   /* i: waiting for code length code lengths */
var        CODELENS = 19;  /* i: waiting for length/lit and distance code lengths */
var            LEN_ = 20;      /* i: same as LEN below, but only first time in */
var            LEN = 21;       /* i: waiting for length/lit/eob code */
var            LENEXT = 22;    /* i: waiting for length extra bits */
var            DIST = 23;      /* i: waiting for distance code */
var            DISTEXT = 24;   /* i: waiting for distance extra bits */
var            MATCH = 25;     /* o: waiting for output space to copy string */
var            LIT = 26;       /* o: waiting for output space to write literal */
var    CHECK = 27;     /* i: waiting for 32-bit check value */
var    LENGTH = 28;    /* i: waiting for 32-bit length (gzip) */
var    DONE = 29;      /* finished check, done -- remain here until reset */
var    BAD$1 = 30;       /* got a data error -- remain here until reset */
var    MEM = 31;       /* got an inflate() memory error -- remain here until reset */
var    SYNC = 32;      /* looking for synchronization bytes to restart inflate() */

/* ===========================================================================*/



var ENOUGH_LENS$1 = 852;
var ENOUGH_DISTS$1 = 592;
//var ENOUGH =  (ENOUGH_LENS+ENOUGH_DISTS);

var MAX_WBITS$1 = 15;
/* 32K LZ77 window */
var DEF_WBITS = MAX_WBITS$1;


function zswap32(q) {
  return  (((q >>> 24) & 0xff) +
          ((q >>> 8) & 0xff00) +
          ((q & 0xff00) << 8) +
          ((q & 0xff) << 24));
}


function InflateState() {
  this.mode = 0;             /* current inflate mode */
  this.last = false;          /* true if processing last block */
  this.wrap = 0;              /* bit 0 true for zlib, bit 1 true for gzip */
  this.havedict = false;      /* true if dictionary provided */
  this.flags = 0;             /* gzip header method and flags (0 if zlib) */
  this.dmax = 0;              /* zlib header max distance (INFLATE_STRICT) */
  this.check = 0;             /* protected copy of check value */
  this.total = 0;             /* protected copy of output count */
  // TODO: may be {}
  this.head = null;           /* where to save gzip header information */

  /* sliding window */
  this.wbits = 0;             /* log base 2 of requested window size */
  this.wsize = 0;             /* window size or zero if not using window */
  this.whave = 0;             /* valid bytes in the window */
  this.wnext = 0;             /* window write index */
  this.window = null;         /* allocated sliding window, if needed */

  /* bit accumulator */
  this.hold = 0;              /* input bit accumulator */
  this.bits = 0;              /* number of bits in "in" */

  /* for string and stored block copying */
  this.length = 0;            /* literal or length of data to copy */
  this.offset = 0;            /* distance back to copy string from */

  /* for table and code decoding */
  this.extra = 0;             /* extra bits needed */

  /* fixed and dynamic code tables */
  this.lencode = null;          /* starting table for length/literal codes */
  this.distcode = null;         /* starting table for distance codes */
  this.lenbits = 0;           /* index bits for lencode */
  this.distbits = 0;          /* index bits for distcode */

  /* dynamic table building */
  this.ncode = 0;             /* number of code length code lengths */
  this.nlen = 0;              /* number of length code lengths */
  this.ndist = 0;             /* number of distance code lengths */
  this.have = 0;              /* number of code lengths in lens[] */
  this.next = null;              /* next available space in codes[] */

  this.lens = new common.Buf16(320); /* temporary storage for code lengths */
  this.work = new common.Buf16(288); /* work area for code table building */

  /*
   because we don't have pointers in js, we use lencode and distcode directly
   as buffers so we don't need codes
  */
  //this.codes = new utils.Buf32(ENOUGH);       /* space for code tables */
  this.lendyn = null;              /* dynamic table for length/literal codes (JS specific) */
  this.distdyn = null;             /* dynamic table for distance codes (JS specific) */
  this.sane = 0;                   /* if false, allow invalid distance too far */
  this.back = 0;                   /* bits back of last unprocessed length/lit */
  this.was = 0;                    /* initial length of match */
}

function inflateResetKeep(strm) {
  var state;

  if (!strm || !strm.state) { return Z_STREAM_ERROR$1; }
  state = strm.state;
  strm.total_in = strm.total_out = state.total = 0;
  strm.msg = ''; /*Z_NULL*/
  if (state.wrap) {       /* to support ill-conceived Java test suite */
    strm.adler = state.wrap & 1;
  }
  state.mode = HEAD;
  state.last = 0;
  state.havedict = 0;
  state.dmax = 32768;
  state.head = null/*Z_NULL*/;
  state.hold = 0;
  state.bits = 0;
  //state.lencode = state.distcode = state.next = state.codes;
  state.lencode = state.lendyn = new common.Buf32(ENOUGH_LENS$1);
  state.distcode = state.distdyn = new common.Buf32(ENOUGH_DISTS$1);

  state.sane = 1;
  state.back = -1;
  //Tracev((stderr, "inflate: reset\n"));
  return Z_OK$2;
}

function inflateReset(strm) {
  var state;

  if (!strm || !strm.state) { return Z_STREAM_ERROR$1; }
  state = strm.state;
  state.wsize = 0;
  state.whave = 0;
  state.wnext = 0;
  return inflateResetKeep(strm);

}

function inflateReset2(strm, windowBits) {
  var wrap;
  var state;

  /* get the state */
  if (!strm || !strm.state) { return Z_STREAM_ERROR$1; }
  state = strm.state;

  /* extract wrap request from windowBits parameter */
  if (windowBits < 0) {
    wrap = 0;
    windowBits = -windowBits;
  }
  else {
    wrap = (windowBits >> 4) + 1;
    if (windowBits < 48) {
      windowBits &= 15;
    }
  }

  /* set number of window bits, free window if different */
  if (windowBits && (windowBits < 8 || windowBits > 15)) {
    return Z_STREAM_ERROR$1;
  }
  if (state.window !== null && state.wbits !== windowBits) {
    state.window = null;
  }

  /* update state and reset the rest of it */
  state.wrap = wrap;
  state.wbits = windowBits;
  return inflateReset(strm);
}

function inflateInit2(strm, windowBits) {
  var ret;
  var state;

  if (!strm) { return Z_STREAM_ERROR$1; }
  //strm.msg = Z_NULL;                 /* in case we return an error */

  state = new InflateState();

  //if (state === Z_NULL) return Z_MEM_ERROR;
  //Tracev((stderr, "inflate: allocated\n"));
  strm.state = state;
  state.window = null/*Z_NULL*/;
  ret = inflateReset2(strm, windowBits);
  if (ret !== Z_OK$2) {
    strm.state = null/*Z_NULL*/;
  }
  return ret;
}

function inflateInit(strm) {
  return inflateInit2(strm, DEF_WBITS);
}


/*
 Return state with length and distance decoding tables and index sizes set to
 fixed code decoding.  Normally this returns fixed tables from inffixed.h.
 If BUILDFIXED is defined, then instead this routine builds the tables the
 first time it's called, and returns those tables the first time and
 thereafter.  This reduces the size of the code by about 2K bytes, in
 exchange for a little execution time.  However, BUILDFIXED should not be
 used for threaded applications, since the rewriting of the tables and virgin
 may not be thread-safe.
 */
var virgin = true;

var lenfix, distfix; // We have no pointers in JS, so keep tables separate

function fixedtables(state) {
  /* build fixed huffman tables if first call (may not be thread safe) */
  if (virgin) {
    var sym;

    lenfix = new common.Buf32(512);
    distfix = new common.Buf32(32);

    /* literal/length table */
    sym = 0;
    while (sym < 144) { state.lens[sym++] = 8; }
    while (sym < 256) { state.lens[sym++] = 9; }
    while (sym < 280) { state.lens[sym++] = 7; }
    while (sym < 288) { state.lens[sym++] = 8; }

    inftrees(LENS$1,  state.lens, 0, 288, lenfix,   0, state.work, { bits: 9 });

    /* distance table */
    sym = 0;
    while (sym < 32) { state.lens[sym++] = 5; }

    inftrees(DISTS$1, state.lens, 0, 32,   distfix, 0, state.work, { bits: 5 });

    /* do this just once */
    virgin = false;
  }

  state.lencode = lenfix;
  state.lenbits = 9;
  state.distcode = distfix;
  state.distbits = 5;
}


/*
 Update the window with the last wsize (normally 32K) bytes written before
 returning.  If window does not exist yet, create it.  This is only called
 when a window is already in use, or when output has been written during this
 inflate call, but the end of the deflate stream has not been reached yet.
 It is also called to create a window for dictionary data when a dictionary
 is loaded.

 Providing output buffers larger than 32K to inflate() should provide a speed
 advantage, since only the last 32K of output is copied to the sliding window
 upon return from inflate(), and since all distances after the first 32K of
 output will fall in the output data, making match copies simpler and faster.
 The advantage may be dependent on the size of the processor's data caches.
 */
function updatewindow(strm, src, end, copy) {
  var dist;
  var state = strm.state;

  /* if it hasn't been done already, allocate space for the window */
  if (state.window === null) {
    state.wsize = 1 << state.wbits;
    state.wnext = 0;
    state.whave = 0;

    state.window = new common.Buf8(state.wsize);
  }

  /* copy state->wsize or less output bytes into the circular window */
  if (copy >= state.wsize) {
    common.arraySet(state.window, src, end - state.wsize, state.wsize, 0);
    state.wnext = 0;
    state.whave = state.wsize;
  }
  else {
    dist = state.wsize - state.wnext;
    if (dist > copy) {
      dist = copy;
    }
    //zmemcpy(state->window + state->wnext, end - copy, dist);
    common.arraySet(state.window, src, end - copy, dist, state.wnext);
    copy -= dist;
    if (copy) {
      //zmemcpy(state->window, end - copy, copy);
      common.arraySet(state.window, src, end - copy, copy, 0);
      state.wnext = copy;
      state.whave = state.wsize;
    }
    else {
      state.wnext += dist;
      if (state.wnext === state.wsize) { state.wnext = 0; }
      if (state.whave < state.wsize) { state.whave += dist; }
    }
  }
  return 0;
}

function inflate(strm, flush) {
  var state;
  var input, output;          // input/output buffers
  var next;                   /* next input INDEX */
  var put;                    /* next output INDEX */
  var have, left;             /* available input and output */
  var hold;                   /* bit buffer */
  var bits;                   /* bits in bit buffer */
  var _in, _out;              /* save starting available input and output */
  var copy;                   /* number of stored or match bytes to copy */
  var from;                   /* where to copy match bytes from */
  var from_source;
  var here = 0;               /* current decoding table entry */
  var here_bits, here_op, here_val; // paked "here" denormalized (JS specific)
  //var last;                   /* parent table entry */
  var last_bits, last_op, last_val; // paked "last" denormalized (JS specific)
  var len;                    /* length to copy for repeats, bits to drop */
  var ret;                    /* return code */
  var hbuf = new common.Buf8(4);    /* buffer for gzip header crc calculation */
  var opts;

  var n; // temporary var for NEED_BITS

  var order = /* permutation of code lengths */
    [ 16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15 ];


  if (!strm || !strm.state || !strm.output ||
      (!strm.input && strm.avail_in !== 0)) {
    return Z_STREAM_ERROR$1;
  }

  state = strm.state;
  if (state.mode === TYPE$1) { state.mode = TYPEDO; }    /* skip check */


  //--- LOAD() ---
  put = strm.next_out;
  output = strm.output;
  left = strm.avail_out;
  next = strm.next_in;
  input = strm.input;
  have = strm.avail_in;
  hold = state.hold;
  bits = state.bits;
  //---

  _in = have;
  _out = left;
  ret = Z_OK$2;

  inf_leave: // goto emulation
  for (;;) {
    switch (state.mode) {
      case HEAD:
        if (state.wrap === 0) {
          state.mode = TYPEDO;
          break;
        }
        //=== NEEDBITS(16);
        while (bits < 16) {
          if (have === 0) { break inf_leave; }
          have--;
          hold += input[next++] << bits;
          bits += 8;
        }
        //===//
        if ((state.wrap & 2) && hold === 0x8b1f) {  /* gzip header */
          state.check = 0/*crc32(0L, Z_NULL, 0)*/;
          //=== CRC2(state.check, hold);
          hbuf[0] = hold & 0xff;
          hbuf[1] = (hold >>> 8) & 0xff;
          state.check = crc32_1(state.check, hbuf, 2, 0);
          //===//

          //=== INITBITS();
          hold = 0;
          bits = 0;
          //===//
          state.mode = FLAGS;
          break;
        }
        state.flags = 0;           /* expect zlib header */
        if (state.head) {
          state.head.done = false;
        }
        if (!(state.wrap & 1) ||   /* check if zlib header allowed */
          (((hold & 0xff)/*BITS(8)*/ << 8) + (hold >> 8)) % 31) {
          strm.msg = 'incorrect header check';
          state.mode = BAD$1;
          break;
        }
        if ((hold & 0x0f)/*BITS(4)*/ !== Z_DEFLATED$2) {
          strm.msg = 'unknown compression method';
          state.mode = BAD$1;
          break;
        }
        //--- DROPBITS(4) ---//
        hold >>>= 4;
        bits -= 4;
        //---//
        len = (hold & 0x0f)/*BITS(4)*/ + 8;
        if (state.wbits === 0) {
          state.wbits = len;
        }
        else if (len > state.wbits) {
          strm.msg = 'invalid window size';
          state.mode = BAD$1;
          break;
        }
        state.dmax = 1 << len;
        //Tracev((stderr, "inflate:   zlib header ok\n"));
        strm.adler = state.check = 1/*adler32(0L, Z_NULL, 0)*/;
        state.mode = hold & 0x200 ? DICTID : TYPE$1;
        //=== INITBITS();
        hold = 0;
        bits = 0;
        //===//
        break;
      case FLAGS:
        //=== NEEDBITS(16); */
        while (bits < 16) {
          if (have === 0) { break inf_leave; }
          have--;
          hold += input[next++] << bits;
          bits += 8;
        }
        //===//
        state.flags = hold;
        if ((state.flags & 0xff) !== Z_DEFLATED$2) {
          strm.msg = 'unknown compression method';
          state.mode = BAD$1;
          break;
        }
        if (state.flags & 0xe000) {
          strm.msg = 'unknown header flags set';
          state.mode = BAD$1;
          break;
        }
        if (state.head) {
          state.head.text = ((hold >> 8) & 1);
        }
        if (state.flags & 0x0200) {
          //=== CRC2(state.check, hold);
          hbuf[0] = hold & 0xff;
          hbuf[1] = (hold >>> 8) & 0xff;
          state.check = crc32_1(state.check, hbuf, 2, 0);
          //===//
        }
        //=== INITBITS();
        hold = 0;
        bits = 0;
        //===//
        state.mode = TIME;
        /* falls through */
      case TIME:
        //=== NEEDBITS(32); */
        while (bits < 32) {
          if (have === 0) { break inf_leave; }
          have--;
          hold += input[next++] << bits;
          bits += 8;
        }
        //===//
        if (state.head) {
          state.head.time = hold;
        }
        if (state.flags & 0x0200) {
          //=== CRC4(state.check, hold)
          hbuf[0] = hold & 0xff;
          hbuf[1] = (hold >>> 8) & 0xff;
          hbuf[2] = (hold >>> 16) & 0xff;
          hbuf[3] = (hold >>> 24) & 0xff;
          state.check = crc32_1(state.check, hbuf, 4, 0);
          //===
        }
        //=== INITBITS();
        hold = 0;
        bits = 0;
        //===//
        state.mode = OS;
        /* falls through */
      case OS:
        //=== NEEDBITS(16); */
        while (bits < 16) {
          if (have === 0) { break inf_leave; }
          have--;
          hold += input[next++] << bits;
          bits += 8;
        }
        //===//
        if (state.head) {
          state.head.xflags = (hold & 0xff);
          state.head.os = (hold >> 8);
        }
        if (state.flags & 0x0200) {
          //=== CRC2(state.check, hold);
          hbuf[0] = hold & 0xff;
          hbuf[1] = (hold >>> 8) & 0xff;
          state.check = crc32_1(state.check, hbuf, 2, 0);
          //===//
        }
        //=== INITBITS();
        hold = 0;
        bits = 0;
        //===//
        state.mode = EXLEN;
        /* falls through */
      case EXLEN:
        if (state.flags & 0x0400) {
          //=== NEEDBITS(16); */
          while (bits < 16) {
            if (have === 0) { break inf_leave; }
            have--;
            hold += input[next++] << bits;
            bits += 8;
          }
          //===//
          state.length = hold;
          if (state.head) {
            state.head.extra_len = hold;
          }
          if (state.flags & 0x0200) {
            //=== CRC2(state.check, hold);
            hbuf[0] = hold & 0xff;
            hbuf[1] = (hold >>> 8) & 0xff;
            state.check = crc32_1(state.check, hbuf, 2, 0);
            //===//
          }
          //=== INITBITS();
          hold = 0;
          bits = 0;
          //===//
        }
        else if (state.head) {
          state.head.extra = null/*Z_NULL*/;
        }
        state.mode = EXTRA;
        /* falls through */
      case EXTRA:
        if (state.flags & 0x0400) {
          copy = state.length;
          if (copy > have) { copy = have; }
          if (copy) {
            if (state.head) {
              len = state.head.extra_len - state.length;
              if (!state.head.extra) {
                // Use untyped array for more convenient processing later
                state.head.extra = new Array(state.head.extra_len);
              }
              common.arraySet(
                state.head.extra,
                input,
                next,
                // extra field is limited to 65536 bytes
                // - no need for additional size check
                copy,
                /*len + copy > state.head.extra_max - len ? state.head.extra_max : copy,*/
                len
              );
              //zmemcpy(state.head.extra + len, next,
              //        len + copy > state.head.extra_max ?
              //        state.head.extra_max - len : copy);
            }
            if (state.flags & 0x0200) {
              state.check = crc32_1(state.check, input, copy, next);
            }
            have -= copy;
            next += copy;
            state.length -= copy;
          }
          if (state.length) { break inf_leave; }
        }
        state.length = 0;
        state.mode = NAME;
        /* falls through */
      case NAME:
        if (state.flags & 0x0800) {
          if (have === 0) { break inf_leave; }
          copy = 0;
          do {
            // TODO: 2 or 1 bytes?
            len = input[next + copy++];
            /* use constant limit because in js we should not preallocate memory */
            if (state.head && len &&
                (state.length < 65536 /*state.head.name_max*/)) {
              state.head.name += String.fromCharCode(len);
            }
          } while (len && copy < have);

          if (state.flags & 0x0200) {
            state.check = crc32_1(state.check, input, copy, next);
          }
          have -= copy;
          next += copy;
          if (len) { break inf_leave; }
        }
        else if (state.head) {
          state.head.name = null;
        }
        state.length = 0;
        state.mode = COMMENT;
        /* falls through */
      case COMMENT:
        if (state.flags & 0x1000) {
          if (have === 0) { break inf_leave; }
          copy = 0;
          do {
            len = input[next + copy++];
            /* use constant limit because in js we should not preallocate memory */
            if (state.head && len &&
                (state.length < 65536 /*state.head.comm_max*/)) {
              state.head.comment += String.fromCharCode(len);
            }
          } while (len && copy < have);
          if (state.flags & 0x0200) {
            state.check = crc32_1(state.check, input, copy, next);
          }
          have -= copy;
          next += copy;
          if (len) { break inf_leave; }
        }
        else if (state.head) {
          state.head.comment = null;
        }
        state.mode = HCRC;
        /* falls through */
      case HCRC:
        if (state.flags & 0x0200) {
          //=== NEEDBITS(16); */
          while (bits < 16) {
            if (have === 0) { break inf_leave; }
            have--;
            hold += input[next++] << bits;
            bits += 8;
          }
          //===//
          if (hold !== (state.check & 0xffff)) {
            strm.msg = 'header crc mismatch';
            state.mode = BAD$1;
            break;
          }
          //=== INITBITS();
          hold = 0;
          bits = 0;
          //===//
        }
        if (state.head) {
          state.head.hcrc = ((state.flags >> 9) & 1);
          state.head.done = true;
        }
        strm.adler = state.check = 0;
        state.mode = TYPE$1;
        break;
      case DICTID:
        //=== NEEDBITS(32); */
        while (bits < 32) {
          if (have === 0) { break inf_leave; }
          have--;
          hold += input[next++] << bits;
          bits += 8;
        }
        //===//
        strm.adler = state.check = zswap32(hold);
        //=== INITBITS();
        hold = 0;
        bits = 0;
        //===//
        state.mode = DICT;
        /* falls through */
      case DICT:
        if (state.havedict === 0) {
          //--- RESTORE() ---
          strm.next_out = put;
          strm.avail_out = left;
          strm.next_in = next;
          strm.avail_in = have;
          state.hold = hold;
          state.bits = bits;
          //---
          return Z_NEED_DICT;
        }
        strm.adler = state.check = 1/*adler32(0L, Z_NULL, 0)*/;
        state.mode = TYPE$1;
        /* falls through */
      case TYPE$1:
        if (flush === Z_BLOCK$1 || flush === Z_TREES) { break inf_leave; }
        /* falls through */
      case TYPEDO:
        if (state.last) {
          //--- BYTEBITS() ---//
          hold >>>= bits & 7;
          bits -= bits & 7;
          //---//
          state.mode = CHECK;
          break;
        }
        //=== NEEDBITS(3); */
        while (bits < 3) {
          if (have === 0) { break inf_leave; }
          have--;
          hold += input[next++] << bits;
          bits += 8;
        }
        //===//
        state.last = (hold & 0x01)/*BITS(1)*/;
        //--- DROPBITS(1) ---//
        hold >>>= 1;
        bits -= 1;
        //---//

        switch ((hold & 0x03)/*BITS(2)*/) {
          case 0:                             /* stored block */
            //Tracev((stderr, "inflate:     stored block%s\n",
            //        state.last ? " (last)" : ""));
            state.mode = STORED;
            break;
          case 1:                             /* fixed block */
            fixedtables(state);
            //Tracev((stderr, "inflate:     fixed codes block%s\n",
            //        state.last ? " (last)" : ""));
            state.mode = LEN_;             /* decode codes */
            if (flush === Z_TREES) {
              //--- DROPBITS(2) ---//
              hold >>>= 2;
              bits -= 2;
              //---//
              break inf_leave;
            }
            break;
          case 2:                             /* dynamic block */
            //Tracev((stderr, "inflate:     dynamic codes block%s\n",
            //        state.last ? " (last)" : ""));
            state.mode = TABLE;
            break;
          case 3:
            strm.msg = 'invalid block type';
            state.mode = BAD$1;
        }
        //--- DROPBITS(2) ---//
        hold >>>= 2;
        bits -= 2;
        //---//
        break;
      case STORED:
        //--- BYTEBITS() ---// /* go to byte boundary */
        hold >>>= bits & 7;
        bits -= bits & 7;
        //---//
        //=== NEEDBITS(32); */
        while (bits < 32) {
          if (have === 0) { break inf_leave; }
          have--;
          hold += input[next++] << bits;
          bits += 8;
        }
        //===//
        if ((hold & 0xffff) !== ((hold >>> 16) ^ 0xffff)) {
          strm.msg = 'invalid stored block lengths';
          state.mode = BAD$1;
          break;
        }
        state.length = hold & 0xffff;
        //Tracev((stderr, "inflate:       stored length %u\n",
        //        state.length));
        //=== INITBITS();
        hold = 0;
        bits = 0;
        //===//
        state.mode = COPY_;
        if (flush === Z_TREES) { break inf_leave; }
        /* falls through */
      case COPY_:
        state.mode = COPY;
        /* falls through */
      case COPY:
        copy = state.length;
        if (copy) {
          if (copy > have) { copy = have; }
          if (copy > left) { copy = left; }
          if (copy === 0) { break inf_leave; }
          //--- zmemcpy(put, next, copy); ---
          common.arraySet(output, input, next, copy, put);
          //---//
          have -= copy;
          next += copy;
          left -= copy;
          put += copy;
          state.length -= copy;
          break;
        }
        //Tracev((stderr, "inflate:       stored end\n"));
        state.mode = TYPE$1;
        break;
      case TABLE:
        //=== NEEDBITS(14); */
        while (bits < 14) {
          if (have === 0) { break inf_leave; }
          have--;
          hold += input[next++] << bits;
          bits += 8;
        }
        //===//
        state.nlen = (hold & 0x1f)/*BITS(5)*/ + 257;
        //--- DROPBITS(5) ---//
        hold >>>= 5;
        bits -= 5;
        //---//
        state.ndist = (hold & 0x1f)/*BITS(5)*/ + 1;
        //--- DROPBITS(5) ---//
        hold >>>= 5;
        bits -= 5;
        //---//
        state.ncode = (hold & 0x0f)/*BITS(4)*/ + 4;
        //--- DROPBITS(4) ---//
        hold >>>= 4;
        bits -= 4;
        //---//
//#ifndef PKZIP_BUG_WORKAROUND
        if (state.nlen > 286 || state.ndist > 30) {
          strm.msg = 'too many length or distance symbols';
          state.mode = BAD$1;
          break;
        }
//#endif
        //Tracev((stderr, "inflate:       table sizes ok\n"));
        state.have = 0;
        state.mode = LENLENS;
        /* falls through */
      case LENLENS:
        while (state.have < state.ncode) {
          //=== NEEDBITS(3);
          while (bits < 3) {
            if (have === 0) { break inf_leave; }
            have--;
            hold += input[next++] << bits;
            bits += 8;
          }
          //===//
          state.lens[order[state.have++]] = (hold & 0x07);//BITS(3);
          //--- DROPBITS(3) ---//
          hold >>>= 3;
          bits -= 3;
          //---//
        }
        while (state.have < 19) {
          state.lens[order[state.have++]] = 0;
        }
        // We have separate tables & no pointers. 2 commented lines below not needed.
        //state.next = state.codes;
        //state.lencode = state.next;
        // Switch to use dynamic table
        state.lencode = state.lendyn;
        state.lenbits = 7;

        opts = { bits: state.lenbits };
        ret = inftrees(CODES$1, state.lens, 0, 19, state.lencode, 0, state.work, opts);
        state.lenbits = opts.bits;

        if (ret) {
          strm.msg = 'invalid code lengths set';
          state.mode = BAD$1;
          break;
        }
        //Tracev((stderr, "inflate:       code lengths ok\n"));
        state.have = 0;
        state.mode = CODELENS;
        /* falls through */
      case CODELENS:
        while (state.have < state.nlen + state.ndist) {
          for (;;) {
            here = state.lencode[hold & ((1 << state.lenbits) - 1)];/*BITS(state.lenbits)*/
            here_bits = here >>> 24;
            here_op = (here >>> 16) & 0xff;
            here_val = here & 0xffff;

            if ((here_bits) <= bits) { break; }
            //--- PULLBYTE() ---//
            if (have === 0) { break inf_leave; }
            have--;
            hold += input[next++] << bits;
            bits += 8;
            //---//
          }
          if (here_val < 16) {
            //--- DROPBITS(here.bits) ---//
            hold >>>= here_bits;
            bits -= here_bits;
            //---//
            state.lens[state.have++] = here_val;
          }
          else {
            if (here_val === 16) {
              //=== NEEDBITS(here.bits + 2);
              n = here_bits + 2;
              while (bits < n) {
                if (have === 0) { break inf_leave; }
                have--;
                hold += input[next++] << bits;
                bits += 8;
              }
              //===//
              //--- DROPBITS(here.bits) ---//
              hold >>>= here_bits;
              bits -= here_bits;
              //---//
              if (state.have === 0) {
                strm.msg = 'invalid bit length repeat';
                state.mode = BAD$1;
                break;
              }
              len = state.lens[state.have - 1];
              copy = 3 + (hold & 0x03);//BITS(2);
              //--- DROPBITS(2) ---//
              hold >>>= 2;
              bits -= 2;
              //---//
            }
            else if (here_val === 17) {
              //=== NEEDBITS(here.bits + 3);
              n = here_bits + 3;
              while (bits < n) {
                if (have === 0) { break inf_leave; }
                have--;
                hold += input[next++] << bits;
                bits += 8;
              }
              //===//
              //--- DROPBITS(here.bits) ---//
              hold >>>= here_bits;
              bits -= here_bits;
              //---//
              len = 0;
              copy = 3 + (hold & 0x07);//BITS(3);
              //--- DROPBITS(3) ---//
              hold >>>= 3;
              bits -= 3;
              //---//
            }
            else {
              //=== NEEDBITS(here.bits + 7);
              n = here_bits + 7;
              while (bits < n) {
                if (have === 0) { break inf_leave; }
                have--;
                hold += input[next++] << bits;
                bits += 8;
              }
              //===//
              //--- DROPBITS(here.bits) ---//
              hold >>>= here_bits;
              bits -= here_bits;
              //---//
              len = 0;
              copy = 11 + (hold & 0x7f);//BITS(7);
              //--- DROPBITS(7) ---//
              hold >>>= 7;
              bits -= 7;
              //---//
            }
            if (state.have + copy > state.nlen + state.ndist) {
              strm.msg = 'invalid bit length repeat';
              state.mode = BAD$1;
              break;
            }
            while (copy--) {
              state.lens[state.have++] = len;
            }
          }
        }

        /* handle error breaks in while */
        if (state.mode === BAD$1) { break; }

        /* check for end-of-block code (better have one) */
        if (state.lens[256] === 0) {
          strm.msg = 'invalid code -- missing end-of-block';
          state.mode = BAD$1;
          break;
        }

        /* build code tables -- note: do not change the lenbits or distbits
           values here (9 and 6) without reading the comments in inftrees.h
           concerning the ENOUGH constants, which depend on those values */
        state.lenbits = 9;

        opts = { bits: state.lenbits };
        ret = inftrees(LENS$1, state.lens, 0, state.nlen, state.lencode, 0, state.work, opts);
        // We have separate tables & no pointers. 2 commented lines below not needed.
        // state.next_index = opts.table_index;
        state.lenbits = opts.bits;
        // state.lencode = state.next;

        if (ret) {
          strm.msg = 'invalid literal/lengths set';
          state.mode = BAD$1;
          break;
        }

        state.distbits = 6;
        //state.distcode.copy(state.codes);
        // Switch to use dynamic table
        state.distcode = state.distdyn;
        opts = { bits: state.distbits };
        ret = inftrees(DISTS$1, state.lens, state.nlen, state.ndist, state.distcode, 0, state.work, opts);
        // We have separate tables & no pointers. 2 commented lines below not needed.
        // state.next_index = opts.table_index;
        state.distbits = opts.bits;
        // state.distcode = state.next;

        if (ret) {
          strm.msg = 'invalid distances set';
          state.mode = BAD$1;
          break;
        }
        //Tracev((stderr, 'inflate:       codes ok\n'));
        state.mode = LEN_;
        if (flush === Z_TREES) { break inf_leave; }
        /* falls through */
      case LEN_:
        state.mode = LEN;
        /* falls through */
      case LEN:
        if (have >= 6 && left >= 258) {
          //--- RESTORE() ---
          strm.next_out = put;
          strm.avail_out = left;
          strm.next_in = next;
          strm.avail_in = have;
          state.hold = hold;
          state.bits = bits;
          //---
          inffast(strm, _out);
          //--- LOAD() ---
          put = strm.next_out;
          output = strm.output;
          left = strm.avail_out;
          next = strm.next_in;
          input = strm.input;
          have = strm.avail_in;
          hold = state.hold;
          bits = state.bits;
          //---

          if (state.mode === TYPE$1) {
            state.back = -1;
          }
          break;
        }
        state.back = 0;
        for (;;) {
          here = state.lencode[hold & ((1 << state.lenbits) - 1)];  /*BITS(state.lenbits)*/
          here_bits = here >>> 24;
          here_op = (here >>> 16) & 0xff;
          here_val = here & 0xffff;

          if (here_bits <= bits) { break; }
          //--- PULLBYTE() ---//
          if (have === 0) { break inf_leave; }
          have--;
          hold += input[next++] << bits;
          bits += 8;
          //---//
        }
        if (here_op && (here_op & 0xf0) === 0) {
          last_bits = here_bits;
          last_op = here_op;
          last_val = here_val;
          for (;;) {
            here = state.lencode[last_val +
                    ((hold & ((1 << (last_bits + last_op)) - 1))/*BITS(last.bits + last.op)*/ >> last_bits)];
            here_bits = here >>> 24;
            here_op = (here >>> 16) & 0xff;
            here_val = here & 0xffff;

            if ((last_bits + here_bits) <= bits) { break; }
            //--- PULLBYTE() ---//
            if (have === 0) { break inf_leave; }
            have--;
            hold += input[next++] << bits;
            bits += 8;
            //---//
          }
          //--- DROPBITS(last.bits) ---//
          hold >>>= last_bits;
          bits -= last_bits;
          //---//
          state.back += last_bits;
        }
        //--- DROPBITS(here.bits) ---//
        hold >>>= here_bits;
        bits -= here_bits;
        //---//
        state.back += here_bits;
        state.length = here_val;
        if (here_op === 0) {
          //Tracevv((stderr, here.val >= 0x20 && here.val < 0x7f ?
          //        "inflate:         literal '%c'\n" :
          //        "inflate:         literal 0x%02x\n", here.val));
          state.mode = LIT;
          break;
        }
        if (here_op & 32) {
          //Tracevv((stderr, "inflate:         end of block\n"));
          state.back = -1;
          state.mode = TYPE$1;
          break;
        }
        if (here_op & 64) {
          strm.msg = 'invalid literal/length code';
          state.mode = BAD$1;
          break;
        }
        state.extra = here_op & 15;
        state.mode = LENEXT;
        /* falls through */
      case LENEXT:
        if (state.extra) {
          //=== NEEDBITS(state.extra);
          n = state.extra;
          while (bits < n) {
            if (have === 0) { break inf_leave; }
            have--;
            hold += input[next++] << bits;
            bits += 8;
          }
          //===//
          state.length += hold & ((1 << state.extra) - 1)/*BITS(state.extra)*/;
          //--- DROPBITS(state.extra) ---//
          hold >>>= state.extra;
          bits -= state.extra;
          //---//
          state.back += state.extra;
        }
        //Tracevv((stderr, "inflate:         length %u\n", state.length));
        state.was = state.length;
        state.mode = DIST;
        /* falls through */
      case DIST:
        for (;;) {
          here = state.distcode[hold & ((1 << state.distbits) - 1)];/*BITS(state.distbits)*/
          here_bits = here >>> 24;
          here_op = (here >>> 16) & 0xff;
          here_val = here & 0xffff;

          if ((here_bits) <= bits) { break; }
          //--- PULLBYTE() ---//
          if (have === 0) { break inf_leave; }
          have--;
          hold += input[next++] << bits;
          bits += 8;
          //---//
        }
        if ((here_op & 0xf0) === 0) {
          last_bits = here_bits;
          last_op = here_op;
          last_val = here_val;
          for (;;) {
            here = state.distcode[last_val +
                    ((hold & ((1 << (last_bits + last_op)) - 1))/*BITS(last.bits + last.op)*/ >> last_bits)];
            here_bits = here >>> 24;
            here_op = (here >>> 16) & 0xff;
            here_val = here & 0xffff;

            if ((last_bits + here_bits) <= bits) { break; }
            //--- PULLBYTE() ---//
            if (have === 0) { break inf_leave; }
            have--;
            hold += input[next++] << bits;
            bits += 8;
            //---//
          }
          //--- DROPBITS(last.bits) ---//
          hold >>>= last_bits;
          bits -= last_bits;
          //---//
          state.back += last_bits;
        }
        //--- DROPBITS(here.bits) ---//
        hold >>>= here_bits;
        bits -= here_bits;
        //---//
        state.back += here_bits;
        if (here_op & 64) {
          strm.msg = 'invalid distance code';
          state.mode = BAD$1;
          break;
        }
        state.offset = here_val;
        state.extra = (here_op) & 15;
        state.mode = DISTEXT;
        /* falls through */
      case DISTEXT:
        if (state.extra) {
          //=== NEEDBITS(state.extra);
          n = state.extra;
          while (bits < n) {
            if (have === 0) { break inf_leave; }
            have--;
            hold += input[next++] << bits;
            bits += 8;
          }
          //===//
          state.offset += hold & ((1 << state.extra) - 1)/*BITS(state.extra)*/;
          //--- DROPBITS(state.extra) ---//
          hold >>>= state.extra;
          bits -= state.extra;
          //---//
          state.back += state.extra;
        }
//#ifdef INFLATE_STRICT
        if (state.offset > state.dmax) {
          strm.msg = 'invalid distance too far back';
          state.mode = BAD$1;
          break;
        }
//#endif
        //Tracevv((stderr, "inflate:         distance %u\n", state.offset));
        state.mode = MATCH;
        /* falls through */
      case MATCH:
        if (left === 0) { break inf_leave; }
        copy = _out - left;
        if (state.offset > copy) {         /* copy from window */
          copy = state.offset - copy;
          if (copy > state.whave) {
            if (state.sane) {
              strm.msg = 'invalid distance too far back';
              state.mode = BAD$1;
              break;
            }
// (!) This block is disabled in zlib defaults,
// don't enable it for binary compatibility
//#ifdef INFLATE_ALLOW_INVALID_DISTANCE_TOOFAR_ARRR
//          Trace((stderr, "inflate.c too far\n"));
//          copy -= state.whave;
//          if (copy > state.length) { copy = state.length; }
//          if (copy > left) { copy = left; }
//          left -= copy;
//          state.length -= copy;
//          do {
//            output[put++] = 0;
//          } while (--copy);
//          if (state.length === 0) { state.mode = LEN; }
//          break;
//#endif
          }
          if (copy > state.wnext) {
            copy -= state.wnext;
            from = state.wsize - copy;
          }
          else {
            from = state.wnext - copy;
          }
          if (copy > state.length) { copy = state.length; }
          from_source = state.window;
        }
        else {                              /* copy from output */
          from_source = output;
          from = put - state.offset;
          copy = state.length;
        }
        if (copy > left) { copy = left; }
        left -= copy;
        state.length -= copy;
        do {
          output[put++] = from_source[from++];
        } while (--copy);
        if (state.length === 0) { state.mode = LEN; }
        break;
      case LIT:
        if (left === 0) { break inf_leave; }
        output[put++] = state.length;
        left--;
        state.mode = LEN;
        break;
      case CHECK:
        if (state.wrap) {
          //=== NEEDBITS(32);
          while (bits < 32) {
            if (have === 0) { break inf_leave; }
            have--;
            // Use '|' instead of '+' to make sure that result is signed
            hold |= input[next++] << bits;
            bits += 8;
          }
          //===//
          _out -= left;
          strm.total_out += _out;
          state.total += _out;
          if (_out) {
            strm.adler = state.check =
                /*UPDATE(state.check, put - _out, _out);*/
                (state.flags ? crc32_1(state.check, output, _out, put - _out) : adler32_1(state.check, output, _out, put - _out));

          }
          _out = left;
          // NB: crc32 stored as signed 32-bit int, zswap32 returns signed too
          if ((state.flags ? hold : zswap32(hold)) !== state.check) {
            strm.msg = 'incorrect data check';
            state.mode = BAD$1;
            break;
          }
          //=== INITBITS();
          hold = 0;
          bits = 0;
          //===//
          //Tracev((stderr, "inflate:   check matches trailer\n"));
        }
        state.mode = LENGTH;
        /* falls through */
      case LENGTH:
        if (state.wrap && state.flags) {
          //=== NEEDBITS(32);
          while (bits < 32) {
            if (have === 0) { break inf_leave; }
            have--;
            hold += input[next++] << bits;
            bits += 8;
          }
          //===//
          if (hold !== (state.total & 0xffffffff)) {
            strm.msg = 'incorrect length check';
            state.mode = BAD$1;
            break;
          }
          //=== INITBITS();
          hold = 0;
          bits = 0;
          //===//
          //Tracev((stderr, "inflate:   length matches trailer\n"));
        }
        state.mode = DONE;
        /* falls through */
      case DONE:
        ret = Z_STREAM_END$2;
        break inf_leave;
      case BAD$1:
        ret = Z_DATA_ERROR$1;
        break inf_leave;
      case MEM:
        return Z_MEM_ERROR;
      case SYNC:
        /* falls through */
      default:
        return Z_STREAM_ERROR$1;
    }
  }

  // inf_leave <- here is real place for "goto inf_leave", emulated via "break inf_leave"

  /*
     Return from inflate(), updating the total counts and the check value.
     If there was no progress during the inflate() call, return a buffer
     error.  Call updatewindow() to create and/or update the window state.
     Note: a memory error from inflate() is non-recoverable.
   */

  //--- RESTORE() ---
  strm.next_out = put;
  strm.avail_out = left;
  strm.next_in = next;
  strm.avail_in = have;
  state.hold = hold;
  state.bits = bits;
  //---

  if (state.wsize || (_out !== strm.avail_out && state.mode < BAD$1 &&
                      (state.mode < CHECK || flush !== Z_FINISH$2))) {
    if (updatewindow(strm, strm.output, strm.next_out, _out - strm.avail_out)) ;
  }
  _in -= strm.avail_in;
  _out -= strm.avail_out;
  strm.total_in += _in;
  strm.total_out += _out;
  state.total += _out;
  if (state.wrap && _out) {
    strm.adler = state.check = /*UPDATE(state.check, strm.next_out - _out, _out);*/
      (state.flags ? crc32_1(state.check, output, _out, strm.next_out - _out) : adler32_1(state.check, output, _out, strm.next_out - _out));
  }
  strm.data_type = state.bits + (state.last ? 64 : 0) +
                    (state.mode === TYPE$1 ? 128 : 0) +
                    (state.mode === LEN_ || state.mode === COPY_ ? 256 : 0);
  if (((_in === 0 && _out === 0) || flush === Z_FINISH$2) && ret === Z_OK$2) {
    ret = Z_BUF_ERROR$1;
  }
  return ret;
}

function inflateEnd(strm) {

  if (!strm || !strm.state /*|| strm->zfree == (free_func)0*/) {
    return Z_STREAM_ERROR$1;
  }

  var state = strm.state;
  if (state.window) {
    state.window = null;
  }
  strm.state = null;
  return Z_OK$2;
}

function inflateGetHeader(strm, head) {
  var state;

  /* check state */
  if (!strm || !strm.state) { return Z_STREAM_ERROR$1; }
  state = strm.state;
  if ((state.wrap & 2) === 0) { return Z_STREAM_ERROR$1; }

  /* save header structure */
  state.head = head;
  head.done = false;
  return Z_OK$2;
}

function inflateSetDictionary(strm, dictionary) {
  var dictLength = dictionary.length;

  var state;
  var dictid;
  var ret;

  /* check state */
  if (!strm /* == Z_NULL */ || !strm.state /* == Z_NULL */) { return Z_STREAM_ERROR$1; }
  state = strm.state;

  if (state.wrap !== 0 && state.mode !== DICT) {
    return Z_STREAM_ERROR$1;
  }

  /* check for correct dictionary identifier */
  if (state.mode === DICT) {
    dictid = 1; /* adler32(0, null, 0)*/
    /* dictid = adler32(dictid, dictionary, dictLength); */
    dictid = adler32_1(dictid, dictionary, dictLength, 0);
    if (dictid !== state.check) {
      return Z_DATA_ERROR$1;
    }
  }
  /* copy dictionary to window using updatewindow(), which will amend the
   existing dictionary if appropriate */
  ret = updatewindow(strm, dictionary, dictLength, dictLength);
  if (ret) {
    state.mode = MEM;
    return Z_MEM_ERROR;
  }
  state.havedict = 1;
  // Tracev((stderr, "inflate:   dictionary set\n"));
  return Z_OK$2;
}

var inflateReset_1 = inflateReset;
var inflateReset2_1 = inflateReset2;
var inflateResetKeep_1 = inflateResetKeep;
var inflateInit_1 = inflateInit;
var inflateInit2_1 = inflateInit2;
var inflate_2 = inflate;
var inflateEnd_1 = inflateEnd;
var inflateGetHeader_1 = inflateGetHeader;
var inflateSetDictionary_1 = inflateSetDictionary;
var inflateInfo = 'pako inflate (from Nodeca project)';

/* Not implemented
exports.inflateCopy = inflateCopy;
exports.inflateGetDictionary = inflateGetDictionary;
exports.inflateMark = inflateMark;
exports.inflatePrime = inflatePrime;
exports.inflateSync = inflateSync;
exports.inflateSyncPoint = inflateSyncPoint;
exports.inflateUndermine = inflateUndermine;
*/

var inflate_1 = {
	inflateReset: inflateReset_1,
	inflateReset2: inflateReset2_1,
	inflateResetKeep: inflateResetKeep_1,
	inflateInit: inflateInit_1,
	inflateInit2: inflateInit2_1,
	inflate: inflate_2,
	inflateEnd: inflateEnd_1,
	inflateGetHeader: inflateGetHeader_1,
	inflateSetDictionary: inflateSetDictionary_1,
	inflateInfo: inflateInfo
};

// (C) 1995-2013 Jean-loup Gailly and Mark Adler
// (C) 2014-2017 Vitaly Puzrin and Andrey Tupitsin
//
// This software is provided 'as-is', without any express or implied
// warranty. In no event will the authors be held liable for any damages
// arising from the use of this software.
//
// Permission is granted to anyone to use this software for any purpose,
// including commercial applications, and to alter it and redistribute it
// freely, subject to the following restrictions:
//
// 1. The origin of this software must not be misrepresented; you must not
//   claim that you wrote the original software. If you use this software
//   in a product, an acknowledgment in the product documentation would be
//   appreciated but is not required.
// 2. Altered source versions must be plainly marked as such, and must not be
//   misrepresented as being the original software.
// 3. This notice may not be removed or altered from any source distribution.

var constants = {

  /* Allowed flush values; see deflate() and inflate() below for details */
  Z_NO_FLUSH:         0,
  Z_PARTIAL_FLUSH:    1,
  Z_SYNC_FLUSH:       2,
  Z_FULL_FLUSH:       3,
  Z_FINISH:           4,
  Z_BLOCK:            5,
  Z_TREES:            6,

  /* Return codes for the compression/decompression functions. Negative values
  * are errors, positive values are used for special but normal events.
  */
  Z_OK:               0,
  Z_STREAM_END:       1,
  Z_NEED_DICT:        2,
  Z_ERRNO:           -1,
  Z_STREAM_ERROR:    -2,
  Z_DATA_ERROR:      -3,
  //Z_MEM_ERROR:     -4,
  Z_BUF_ERROR:       -5,
  //Z_VERSION_ERROR: -6,

  /* compression levels */
  Z_NO_COMPRESSION:         0,
  Z_BEST_SPEED:             1,
  Z_BEST_COMPRESSION:       9,
  Z_DEFAULT_COMPRESSION:   -1,


  Z_FILTERED:               1,
  Z_HUFFMAN_ONLY:           2,
  Z_RLE:                    3,
  Z_FIXED:                  4,
  Z_DEFAULT_STRATEGY:       0,

  /* Possible values of the data_type field (though see inflate()) */
  Z_BINARY:                 0,
  Z_TEXT:                   1,
  //Z_ASCII:                1, // = Z_TEXT (deprecated)
  Z_UNKNOWN:                2,

  /* The deflate compression method */
  Z_DEFLATED:               8
  //Z_NULL:                 null // Use -1 or null inline, depending on var type
};

// (C) 1995-2013 Jean-loup Gailly and Mark Adler
// (C) 2014-2017 Vitaly Puzrin and Andrey Tupitsin
//
// This software is provided 'as-is', without any express or implied
// warranty. In no event will the authors be held liable for any damages
// arising from the use of this software.
//
// Permission is granted to anyone to use this software for any purpose,
// including commercial applications, and to alter it and redistribute it
// freely, subject to the following restrictions:
//
// 1. The origin of this software must not be misrepresented; you must not
//   claim that you wrote the original software. If you use this software
//   in a product, an acknowledgment in the product documentation would be
//   appreciated but is not required.
// 2. Altered source versions must be plainly marked as such, and must not be
//   misrepresented as being the original software.
// 3. This notice may not be removed or altered from any source distribution.

function GZheader() {
  /* true if compressed data believed to be text */
  this.text       = 0;
  /* modification time */
  this.time       = 0;
  /* extra flags (not used when writing a gzip file) */
  this.xflags     = 0;
  /* operating system */
  this.os         = 0;
  /* pointer to extra field or Z_NULL if none */
  this.extra      = null;
  /* extra field length (valid if extra != Z_NULL) */
  this.extra_len  = 0; // Actually, we don't need it in JS,
                       // but leave for few code modifications

  //
  // Setup limits is not necessary because in js we should not preallocate memory
  // for inflate use constant limit in 65536 bytes
  //

  /* space at extra (only when reading header) */
  // this.extra_max  = 0;
  /* pointer to zero-terminated file name or Z_NULL */
  this.name       = '';
  /* space at name (only when reading header) */
  // this.name_max   = 0;
  /* pointer to zero-terminated comment or Z_NULL */
  this.comment    = '';
  /* space at comment (only when reading header) */
  // this.comm_max   = 0;
  /* true if there was or will be a header crc */
  this.hcrc       = 0;
  /* true when done reading gzip header (not used when writing a gzip file) */
  this.done       = false;
}

var gzheader = GZheader;

var toString$1 = Object.prototype.toString;

/**
 * class Inflate
 *
 * Generic JS-style wrapper for zlib calls. If you don't need
 * streaming behaviour - use more simple functions: [[inflate]]
 * and [[inflateRaw]].
 **/

/* internal
 * inflate.chunks -> Array
 *
 * Chunks of output data, if [[Inflate#onData]] not overridden.
 **/

/**
 * Inflate.result -> Uint8Array|Array|String
 *
 * Uncompressed result, generated by default [[Inflate#onData]]
 * and [[Inflate#onEnd]] handlers. Filled after you push last chunk
 * (call [[Inflate#push]] with `Z_FINISH` / `true` param) or if you
 * push a chunk with explicit flush (call [[Inflate#push]] with
 * `Z_SYNC_FLUSH` param).
 **/

/**
 * Inflate.err -> Number
 *
 * Error code after inflate finished. 0 (Z_OK) on success.
 * Should be checked if broken data possible.
 **/

/**
 * Inflate.msg -> String
 *
 * Error message, if [[Inflate.err]] != 0
 **/


/**
 * new Inflate(options)
 * - options (Object): zlib inflate options.
 *
 * Creates new inflator instance with specified params. Throws exception
 * on bad params. Supported options:
 *
 * - `windowBits`
 * - `dictionary`
 *
 * [http://zlib.net/manual.html#Advanced](http://zlib.net/manual.html#Advanced)
 * for more information on these.
 *
 * Additional options, for internal needs:
 *
 * - `chunkSize` - size of generated data chunks (16K by default)
 * - `raw` (Boolean) - do raw inflate
 * - `to` (String) - if equal to 'string', then result will be converted
 *   from utf8 to utf16 (javascript) string. When string output requested,
 *   chunk length can differ from `chunkSize`, depending on content.
 *
 * By default, when no options set, autodetect deflate/gzip data format via
 * wrapper header.
 *
 * ##### Example:
 *
 * ```javascript
 * var pako = require('pako')
 *   , chunk1 = Uint8Array([1,2,3,4,5,6,7,8,9])
 *   , chunk2 = Uint8Array([10,11,12,13,14,15,16,17,18,19]);
 *
 * var inflate = new pako.Inflate({ level: 3});
 *
 * inflate.push(chunk1, false);
 * inflate.push(chunk2, true);  // true -> last chunk
 *
 * if (inflate.err) { throw new Error(inflate.err); }
 *
 * console.log(inflate.result);
 * ```
 **/
function Inflate(options) {
  if (!(this instanceof Inflate)) return new Inflate(options);

  this.options = common.assign({
    chunkSize: 16384,
    windowBits: 0,
    to: ''
  }, options || {});

  var opt = this.options;

  // Force window size for `raw` data, if not set directly,
  // because we have no header for autodetect.
  if (opt.raw && (opt.windowBits >= 0) && (opt.windowBits < 16)) {
    opt.windowBits = -opt.windowBits;
    if (opt.windowBits === 0) { opt.windowBits = -15; }
  }

  // If `windowBits` not defined (and mode not raw) - set autodetect flag for gzip/deflate
  if ((opt.windowBits >= 0) && (opt.windowBits < 16) &&
      !(options && options.windowBits)) {
    opt.windowBits += 32;
  }

  // Gzip header has no info about windows size, we can do autodetect only
  // for deflate. So, if window size not set, force it to max when gzip possible
  if ((opt.windowBits > 15) && (opt.windowBits < 48)) {
    // bit 3 (16) -> gzipped data
    // bit 4 (32) -> autodetect gzip/deflate
    if ((opt.windowBits & 15) === 0) {
      opt.windowBits |= 15;
    }
  }

  this.err    = 0;      // error code, if happens (0 = Z_OK)
  this.msg    = '';     // error message
  this.ended  = false;  // used to avoid multiple onEnd() calls
  this.chunks = [];     // chunks of compressed data

  this.strm   = new zstream();
  this.strm.avail_out = 0;

  var status  = inflate_1.inflateInit2(
    this.strm,
    opt.windowBits
  );

  if (status !== constants.Z_OK) {
    throw new Error(messages[status]);
  }

  this.header = new gzheader();

  inflate_1.inflateGetHeader(this.strm, this.header);

  // Setup dictionary
  if (opt.dictionary) {
    // Convert data if needed
    if (typeof opt.dictionary === 'string') {
      opt.dictionary = strings.string2buf(opt.dictionary);
    } else if (toString$1.call(opt.dictionary) === '[object ArrayBuffer]') {
      opt.dictionary = new Uint8Array(opt.dictionary);
    }
    if (opt.raw) { //In raw mode we need to set the dictionary early
      status = inflate_1.inflateSetDictionary(this.strm, opt.dictionary);
      if (status !== constants.Z_OK) {
        throw new Error(messages[status]);
      }
    }
  }
}

/**
 * Inflate#push(data[, mode]) -> Boolean
 * - data (Uint8Array|Array|ArrayBuffer|String): input data
 * - mode (Number|Boolean): 0..6 for corresponding Z_NO_FLUSH..Z_TREE modes.
 *   See constants. Skipped or `false` means Z_NO_FLUSH, `true` means Z_FINISH.
 *
 * Sends input data to inflate pipe, generating [[Inflate#onData]] calls with
 * new output chunks. Returns `true` on success. The last data block must have
 * mode Z_FINISH (or `true`). That will flush internal pending buffers and call
 * [[Inflate#onEnd]]. For interim explicit flushes (without ending the stream) you
 * can use mode Z_SYNC_FLUSH, keeping the decompression context.
 *
 * On fail call [[Inflate#onEnd]] with error code and return false.
 *
 * We strongly recommend to use `Uint8Array` on input for best speed (output
 * format is detected automatically). Also, don't skip last param and always
 * use the same type in your code (boolean or number). That will improve JS speed.
 *
 * For regular `Array`-s make sure all elements are [0..255].
 *
 * ##### Example
 *
 * ```javascript
 * push(chunk, false); // push one of data chunks
 * ...
 * push(chunk, true);  // push last chunk
 * ```
 **/
Inflate.prototype.push = function (data, mode) {
  var strm = this.strm;
  var chunkSize = this.options.chunkSize;
  var dictionary = this.options.dictionary;
  var status, _mode;
  var next_out_utf8, tail, utf8str;

  // Flag to properly process Z_BUF_ERROR on testing inflate call
  // when we check that all output data was flushed.
  var allowBufError = false;

  if (this.ended) { return false; }
  _mode = (mode === ~~mode) ? mode : ((mode === true) ? constants.Z_FINISH : constants.Z_NO_FLUSH);

  // Convert data if needed
  if (typeof data === 'string') {
    // Only binary strings can be decompressed on practice
    strm.input = strings.binstring2buf(data);
  } else if (toString$1.call(data) === '[object ArrayBuffer]') {
    strm.input = new Uint8Array(data);
  } else {
    strm.input = data;
  }

  strm.next_in = 0;
  strm.avail_in = strm.input.length;

  do {
    if (strm.avail_out === 0) {
      strm.output = new common.Buf8(chunkSize);
      strm.next_out = 0;
      strm.avail_out = chunkSize;
    }

    status = inflate_1.inflate(strm, constants.Z_NO_FLUSH);    /* no bad return value */

    if (status === constants.Z_NEED_DICT && dictionary) {
      status = inflate_1.inflateSetDictionary(this.strm, dictionary);
    }

    if (status === constants.Z_BUF_ERROR && allowBufError === true) {
      status = constants.Z_OK;
      allowBufError = false;
    }

    if (status !== constants.Z_STREAM_END && status !== constants.Z_OK) {
      this.onEnd(status);
      this.ended = true;
      return false;
    }

    if (strm.next_out) {
      if (strm.avail_out === 0 || status === constants.Z_STREAM_END || (strm.avail_in === 0 && (_mode === constants.Z_FINISH || _mode === constants.Z_SYNC_FLUSH))) {

        if (this.options.to === 'string') {

          next_out_utf8 = strings.utf8border(strm.output, strm.next_out);

          tail = strm.next_out - next_out_utf8;
          utf8str = strings.buf2string(strm.output, next_out_utf8);

          // move tail
          strm.next_out = tail;
          strm.avail_out = chunkSize - tail;
          if (tail) { common.arraySet(strm.output, strm.output, next_out_utf8, tail, 0); }

          this.onData(utf8str);

        } else {
          this.onData(common.shrinkBuf(strm.output, strm.next_out));
        }
      }
    }

    // When no more input data, we should check that internal inflate buffers
    // are flushed. The only way to do it when avail_out = 0 - run one more
    // inflate pass. But if output data not exists, inflate return Z_BUF_ERROR.
    // Here we set flag to process this error properly.
    //
    // NOTE. Deflate does not return error in this case and does not needs such
    // logic.
    if (strm.avail_in === 0 && strm.avail_out === 0) {
      allowBufError = true;
    }

  } while ((strm.avail_in > 0 || strm.avail_out === 0) && status !== constants.Z_STREAM_END);

  if (status === constants.Z_STREAM_END) {
    _mode = constants.Z_FINISH;
  }

  // Finalize on the last chunk.
  if (_mode === constants.Z_FINISH) {
    status = inflate_1.inflateEnd(this.strm);
    this.onEnd(status);
    this.ended = true;
    return status === constants.Z_OK;
  }

  // callback interim results if Z_SYNC_FLUSH.
  if (_mode === constants.Z_SYNC_FLUSH) {
    this.onEnd(constants.Z_OK);
    strm.avail_out = 0;
    return true;
  }

  return true;
};


/**
 * Inflate#onData(chunk) -> Void
 * - chunk (Uint8Array|Array|String): output data. Type of array depends
 *   on js engine support. When string output requested, each chunk
 *   will be string.
 *
 * By default, stores data blocks in `chunks[]` property and glue
 * those in `onEnd`. Override this handler, if you need another behaviour.
 **/
Inflate.prototype.onData = function (chunk) {
  this.chunks.push(chunk);
};


/**
 * Inflate#onEnd(status) -> Void
 * - status (Number): inflate status. 0 (Z_OK) on success,
 *   other if not.
 *
 * Called either after you tell inflate that the input stream is
 * complete (Z_FINISH) or should be flushed (Z_SYNC_FLUSH)
 * or if an error happened. By default - join collected chunks,
 * free memory and fill `results` / `err` properties.
 **/
Inflate.prototype.onEnd = function (status) {
  // On success - join
  if (status === constants.Z_OK) {
    if (this.options.to === 'string') {
      // Glue & convert here, until we teach pako to send
      // utf8 aligned strings to onData
      this.result = this.chunks.join('');
    } else {
      this.result = common.flattenChunks(this.chunks);
    }
  }
  this.chunks = [];
  this.err = status;
  this.msg = this.strm.msg;
};


/**
 * inflate(data[, options]) -> Uint8Array|Array|String
 * - data (Uint8Array|Array|String): input data to decompress.
 * - options (Object): zlib inflate options.
 *
 * Decompress `data` with inflate/ungzip and `options`. Autodetect
 * format via wrapper header by default. That's why we don't provide
 * separate `ungzip` method.
 *
 * Supported options are:
 *
 * - windowBits
 *
 * [http://zlib.net/manual.html#Advanced](http://zlib.net/manual.html#Advanced)
 * for more information.
 *
 * Sugar (options):
 *
 * - `raw` (Boolean) - say that we work with raw stream, if you don't wish to specify
 *   negative windowBits implicitly.
 * - `to` (String) - if equal to 'string', then result will be converted
 *   from utf8 to utf16 (javascript) string. When string output requested,
 *   chunk length can differ from `chunkSize`, depending on content.
 *
 *
 * ##### Example:
 *
 * ```javascript
 * var pako = require('pako')
 *   , input = pako.deflate([1,2,3,4,5,6,7,8,9])
 *   , output;
 *
 * try {
 *   output = pako.inflate(input);
 * } catch (err)
 *   console.log(err);
 * }
 * ```
 **/
function inflate$1(input, options) {
  var inflator = new Inflate(options);

  inflator.push(input, true);

  // That will never happens, if you don't cheat with options :)
  if (inflator.err) { throw inflator.msg || messages[inflator.err]; }

  return inflator.result;
}


/**
 * inflateRaw(data[, options]) -> Uint8Array|Array|String
 * - data (Uint8Array|Array|String): input data to decompress.
 * - options (Object): zlib inflate options.
 *
 * The same as [[inflate]], but creates raw data, without wrapper
 * (header and adler32 crc).
 **/
function inflateRaw(input, options) {
  options = options || {};
  options.raw = true;
  return inflate$1(input, options);
}


/**
 * ungzip(data[, options]) -> Uint8Array|Array|String
 * - data (Uint8Array|Array|String): input data to decompress.
 * - options (Object): zlib inflate options.
 *
 * Just shortcut to [[inflate]], because it autodetects format
 * by header.content. Done for convenience.
 **/


var Inflate_1 = Inflate;
var inflate_2$1 = inflate$1;
var inflateRaw_1 = inflateRaw;
var ungzip  = inflate$1;

var inflate_1$1 = {
	Inflate: Inflate_1,
	inflate: inflate_2$1,
	inflateRaw: inflateRaw_1,
	ungzip: ungzip
};

var assign    = common.assign;





var pako = {};

assign(pako, deflate_1$1, inflate_1$1, constants);

var pako_1 = pako;

let GZip = /** @class */ (() => {
    class GZip {
        constructor(level = 1) {
            if (level < 0 || level > 9) {
                throw new Error('Invalid gzip compression level, it should be between 0 and 9');
            }
            this.level = level;
        }
        static fromConfig({ level }) {
            return new GZip(level);
        }
        encode(data) {
            const gzipped = pako_1.gzip(data, { level: this.level });
            return gzipped;
        }
        decode(data, out) {
            const uncompressed = pako_1.ungzip(data);
            if (out !== undefined) {
                out.set(uncompressed);
                return out;
            }
            return uncompressed;
        }
    }
    GZip.codecId = 'gzip';
    return GZip;
})();

let Zlib = /** @class */ (() => {
    class Zlib {
        constructor(level = 1) {
            if (level < -1 || level > 9) {
                throw new Error('Invalid zlib compression level, it should be between -1 and 9');
            }
            this.level = level;
        }
        static fromConfig({ level }) {
            return new Zlib(level);
        }
        encode(data) {
            const gzipped = pako_1.deflate(data, { level: this.level });
            return gzipped;
        }
        decode(data, out) {
            const uncompressed = pako_1.inflate(data);
            if (out !== undefined) {
                out.set(uncompressed);
                return out;
            }
            return uncompressed;
        }
    }
    Zlib.codecId = 'zlib';
    return Zlib;
})();

function base64ToBytes(src) {
    const isNode = typeof process !== 'undefined' &&
        process.versions != null &&
        process.versions.node != null;
    if (isNode) {
        return Buffer.from(src, 'base64');
    }
    const raw = globalThis.atob(src);
    const len = raw.length;
    const buffer = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        buffer[i] = raw.charCodeAt(i);
    }
    return buffer;
}
function initEmscriptenModule(moduleFactory, src) {
    const wasmBinary = base64ToBytes(src);
    return new Promise((resolve) => {
        const module = moduleFactory({
            // Just to be safe, don't automatically invoke any wasm functions
            noInitialRun: true,
            onRuntimeInitialized() {
                // An Emscripten is a then-able that resolves with itself, causing an infite loop when you
                // wrap it in a real promise. Delete the `then` prop solves this for now.
                // https://github.com/kripken/emscripten/issues/5820
                delete module.then;
                resolve(module);
            },
            wasmBinary,
        });
    });
}

var blosc_codec = (function() {
  var _scriptDir = typeof document !== 'undefined' && document.currentScript ? document.currentScript.src : undefined;
  
  return (
function(blosc_codec) {
  blosc_codec = blosc_codec || {};


var d;d||(d=typeof blosc_codec !== 'undefined' ? blosc_codec : {});var r={},t;for(t in d)d.hasOwnProperty(t)&&(r[t]=d[t]);var aa="./this.program",ba=d.print||console.log.bind(console),u=d.printErr||console.warn.bind(console);for(t in r)r.hasOwnProperty(t)&&(d[t]=r[t]);r=null;d.thisProgram&&(aa=d.thisProgram);var v;d.wasmBinary&&(v=d.wasmBinary);var noExitRuntime;d.noExitRuntime&&(noExitRuntime=d.noExitRuntime);"object"!==typeof WebAssembly&&u("no native wasm support detected");
var w,ca=new WebAssembly.Table({initial:86,maximum:86,element:"anyfunc"}),da=!1,ea="undefined"!==typeof TextDecoder?new TextDecoder("utf8"):void 0;
function fa(a,b,c){var e=b+c;for(c=b;a[c]&&!(c>=e);)++c;if(16<c-b&&a.subarray&&ea)return ea.decode(a.subarray(b,c));for(e="";b<c;){var f=a[b++];if(f&128){var g=a[b++]&63;if(192==(f&224))e+=String.fromCharCode((f&31)<<6|g);else {var m=a[b++]&63;f=224==(f&240)?(f&15)<<12|g<<6|m:(f&7)<<18|g<<12|m<<6|a[b++]&63;65536>f?e+=String.fromCharCode(f):(f-=65536,e+=String.fromCharCode(55296|f>>10,56320|f&1023));}}else e+=String.fromCharCode(f);}return e}
function ha(a,b,c){var e=y;if(0<c){c=b+c-1;for(var f=0;f<a.length;++f){var g=a.charCodeAt(f);if(55296<=g&&57343>=g){var m=a.charCodeAt(++f);g=65536+((g&1023)<<10)|m&1023;}if(127>=g){if(b>=c)break;e[b++]=g;}else {if(2047>=g){if(b+1>=c)break;e[b++]=192|g>>6;}else {if(65535>=g){if(b+2>=c)break;e[b++]=224|g>>12;}else {if(b+3>=c)break;e[b++]=240|g>>18;e[b++]=128|g>>12&63;}e[b++]=128|g>>6&63;}e[b++]=128|g&63;}}e[b]=0;}}var ia="undefined"!==typeof TextDecoder?new TextDecoder("utf-16le"):void 0;
function ja(a){var b;for(b=a>>1;z[b];)++b;b<<=1;if(32<b-a&&ia)return ia.decode(y.subarray(a,b));b=0;for(var c="";;){var e=z[a+2*b>>1];if(0==e)return c;++b;c+=String.fromCharCode(e);}}function ka(a,b,c){void 0===c&&(c=2147483647);if(2>c)return 0;c-=2;var e=b;c=c<2*a.length?c/2:a.length;for(var f=0;f<c;++f)z[b>>1]=a.charCodeAt(f),b+=2;z[b>>1]=0;return b-e}function la(a){return 2*a.length}
function ma(a){for(var b=0,c="";;){var e=A[a+4*b>>2];if(0==e)return c;++b;65536<=e?(e-=65536,c+=String.fromCharCode(55296|e>>10,56320|e&1023)):c+=String.fromCharCode(e);}}function na(a,b,c){void 0===c&&(c=2147483647);if(4>c)return 0;var e=b;c=e+c-4;for(var f=0;f<a.length;++f){var g=a.charCodeAt(f);if(55296<=g&&57343>=g){var m=a.charCodeAt(++f);g=65536+((g&1023)<<10)|m&1023;}A[b>>2]=g;b+=4;if(b+4>c)break}A[b>>2]=0;return b-e}
function oa(a){for(var b=0,c=0;c<a.length;++c){var e=a.charCodeAt(c);55296<=e&&57343>=e&&++c;b+=4;}return b}var B,C,y,z,D,A,E,pa,qa;function ra(a){B=a;d.HEAP8=C=new Int8Array(a);d.HEAP16=z=new Int16Array(a);d.HEAP32=A=new Int32Array(a);d.HEAPU8=y=new Uint8Array(a);d.HEAPU16=D=new Uint16Array(a);d.HEAPU32=E=new Uint32Array(a);d.HEAPF32=pa=new Float32Array(a);d.HEAPF64=qa=new Float64Array(a);}var sa=d.INITIAL_MEMORY||16777216;d.wasmMemory?w=d.wasmMemory:w=new WebAssembly.Memory({initial:sa/65536,maximum:32768});
w&&(B=w.buffer);sa=B.byteLength;ra(B);A[8104]=5275456;function F(a){for(;0<a.length;){var b=a.shift();if("function"==typeof b)b(d);else {var c=b.ba;"number"===typeof c?void 0===b.Y?d.dynCall_v(c):d.dynCall_vi(c,b.Y):c(void 0===b.Y?null:b.Y);}}}var ta=[],ua=[],va=[],wa=[];function xa(){var a=d.preRun.shift();ta.unshift(a);}var G=0,L=null;d.preloadedImages={};d.preloadedAudios={};
function ya(a){if(d.onAbort)d.onAbort(a);ba(a);u(a);da=!0;throw new WebAssembly.RuntimeError("abort("+a+"). Build with -s ASSERTIONS=1 for more info.");}function za(a){var b=N;return String.prototype.startsWith?b.startsWith(a):0===b.indexOf(a)}function Aa(){return za("data:application/octet-stream;base64,")}var N="blosc_codec.wasm";if(!Aa()){var Ba=N;N=d.locateFile?d.locateFile(Ba,""):""+Ba;}
function Ca(){return new Promise(function(a){a:{try{if(v){var b=new Uint8Array(v);break a}throw "both async and sync fetching of the wasm failed";}catch(c){ya(c);}b=void 0;}a(b);})}ua.push({ba:function(){Da();}});function Ea(a){switch(a){case 1:return 0;case 2:return 1;case 4:return 2;case 8:return 3;default:throw new TypeError("Unknown type size: "+a);}}var Fa=void 0;function P(a){for(var b="";y[a];)b+=Fa[y[a++]];return b}var Q={},R={},S={};
function Ga(a){if(void 0===a)return "_unknown";a=a.replace(/[^a-zA-Z0-9_]/g,"$");var b=a.charCodeAt(0);return 48<=b&&57>=b?"_"+a:a}function Ha(a,b){a=Ga(a);return (new Function("body","return function "+a+'() {\n    "use strict";    return body.apply(this, arguments);\n};\n'))(b)}
function Ia(a){var b=Error,c=Ha(a,function(e){this.name=a;this.message=e;e=Error(e).stack;void 0!==e&&(this.stack=this.toString()+"\n"+e.replace(/^Error(:[^\n]*)?\n/,""));});c.prototype=Object.create(b.prototype);c.prototype.constructor=c;c.prototype.toString=function(){return void 0===this.message?this.name:this.name+": "+this.message};return c}var Ja=void 0;function T(a){throw new Ja(a);}var Ka=void 0;
function La(a,b){function c(h){h=b(h);if(h.length!==e.length)throw new Ka("Mismatched type converter count");for(var l=0;l<e.length;++l)U(e[l],h[l]);}var e=[];e.forEach(function(h){S[h]=a;});var f=Array(a.length),g=[],m=0;a.forEach(function(h,l){R.hasOwnProperty(h)?f[l]=R[h]:(g.push(h),Q.hasOwnProperty(h)||(Q[h]=[]),Q[h].push(function(){f[l]=R[h];++m;m===g.length&&c(f);}));});0===g.length&&c(f);}
function U(a,b,c){c=c||{};if(!("argPackAdvance"in b))throw new TypeError("registerType registeredInstance requires argPackAdvance");var e=b.name;a||T('type "'+e+'" must have a positive integer typeid pointer');if(R.hasOwnProperty(a)){if(c.ca)return;T("Cannot register type '"+e+"' twice");}R[a]=b;delete S[a];Q.hasOwnProperty(a)&&(b=Q[a],delete Q[a],b.forEach(function(f){f();}));}var Ma=[],V=[{},{value:void 0},{value:null},{value:!0},{value:!1}];
function Oa(a){4<a&&0===--V[a].Z&&(V[a]=void 0,Ma.push(a));}function Pa(a){switch(a){case void 0:return 1;case null:return 2;case !0:return 3;case !1:return 4;default:var b=Ma.length?Ma.pop():V.length;V[b]={Z:1,value:a};return b}}function Qa(a){return this.fromWireType(E[a>>2])}function Ra(a){if(null===a)return "null";var b=typeof a;return "object"===b||"array"===b||"function"===b?a.toString():""+a}
function Sa(a,b){switch(b){case 2:return function(c){return this.fromWireType(pa[c>>2])};case 3:return function(c){return this.fromWireType(qa[c>>3])};default:throw new TypeError("Unknown float type: "+a);}}function Ta(a){var b=Function;if(!(b instanceof Function))throw new TypeError("new_ called with constructor type "+typeof b+" which is not a function");var c=Ha(b.name||"unknownFunctionName",function(){});c.prototype=b.prototype;c=new c;a=b.apply(c,a);return a instanceof Object?a:c}
function Ua(a){for(;a.length;){var b=a.pop();a.pop()(b);}}function Va(a,b){var c=d;if(void 0===c[a].W){var e=c[a];c[a]=function(){c[a].W.hasOwnProperty(arguments.length)||T("Function '"+b+"' called with an invalid number of arguments ("+arguments.length+") - expects one of ("+c[a].W+")!");return c[a].W[arguments.length].apply(this,arguments)};c[a].W=[];c[a].W[e.aa]=e;}}
function Wa(a,b,c){d.hasOwnProperty(a)?((void 0===c||void 0!==d[a].W&&void 0!==d[a].W[c])&&T("Cannot register public name '"+a+"' twice"),Va(a,a),d.hasOwnProperty(c)&&T("Cannot register multiple overloads of a function with the same number of arguments ("+c+")!"),d[a].W[c]=b):(d[a]=b,void 0!==c&&(d[a].ea=c));}function Xa(a,b){for(var c=[],e=0;e<a;e++)c.push(A[(b>>2)+e]);return c}
function Ya(a,b){a=P(a);var c=d["dynCall_"+a];for(var e=[],f=1;f<a.length;++f)e.push("a"+f);f="return function dynCall_"+(a+"_"+b)+"("+e.join(", ")+") {\n";f+="    return dynCall(rawFunction"+(e.length?", ":"")+e.join(", ")+");\n";c=(new Function("dynCall","rawFunction",f+"};\n"))(c,b);"function"!==typeof c&&T("unknown function pointer with signature "+a+": "+b);return c}var Za=void 0;function $a(a){a=ab(a);var b=P(a);W(a);return b}
function bb(a,b){function c(g){f[g]||R[g]||(S[g]?S[g].forEach(c):(e.push(g),f[g]=!0));}var e=[],f={};b.forEach(c);throw new Za(a+": "+e.map($a).join([", "]));}function cb(a,b,c){switch(b){case 0:return c?function(e){return C[e]}:function(e){return y[e]};case 1:return c?function(e){return z[e>>1]}:function(e){return D[e>>1]};case 2:return c?function(e){return A[e>>2]}:function(e){return E[e>>2]};default:throw new TypeError("Unknown integer type: "+a);}}var db={};
function eb(){if(!fb){var a={USER:"web_user",LOGNAME:"web_user",PATH:"/",PWD:"/",HOME:"/home/web_user",LANG:("object"===typeof navigator&&navigator.languages&&navigator.languages[0]||"C").replace("-","_")+".UTF-8",_:aa||"./this.program"},b;for(b in db)a[b]=db[b];var c=[];for(b in a)c.push(b+"="+a[b]);fb=c;}return fb}for(var fb,gb=[null,[],[]],hb=Array(256),X=0;256>X;++X)hb[X]=String.fromCharCode(X);Fa=hb;Ja=d.BindingError=Ia("BindingError");Ka=d.InternalError=Ia("InternalError");
d.count_emval_handles=function(){for(var a=0,b=5;b<V.length;++b)void 0!==V[b]&&++a;return a};d.get_first_emval=function(){for(var a=5;a<V.length;++a)if(void 0!==V[a])return V[a];return null};Za=d.UnboundTypeError=Ia("UnboundTypeError");
var ib={o:function(a){return Y(a)},n:function(a){throw a;},u:function(a,b,c,e,f){var g=Ea(c);b=P(b);U(a,{name:b,fromWireType:function(m){return !!m},toWireType:function(m,h){return h?e:f},argPackAdvance:8,readValueFromPointer:function(m){if(1===c)var h=C;else if(2===c)h=z;else if(4===c)h=A;else throw new TypeError("Unknown boolean type size: "+b);return this.fromWireType(h[m>>g])},X:null});},s:function(a,b){b=P(b);U(a,{name:b,fromWireType:function(c){var e=V[c].value;
Oa(c);return e},toWireType:function(c,e){return Pa(e)},argPackAdvance:8,readValueFromPointer:Qa,X:null});},f:function(a,b,c){c=Ea(c);b=P(b);U(a,{name:b,fromWireType:function(e){return e},toWireType:function(e,f){if("number"!==typeof f&&"boolean"!==typeof f)throw new TypeError('Cannot convert "'+Ra(f)+'" to '+this.name);return f},argPackAdvance:8,readValueFromPointer:Sa(b,c),X:null});},d:function(a,b,c,e,f,g){var m=Xa(b,c);a=P(a);f=Ya(e,f);Wa(a,function(){bb("Cannot call "+a+" due to unbound types",
m);},b-1);La(m,function(h){var l=a,k=a;h=[h[0],null].concat(h.slice(1));var p=f,q=h.length;2>q&&T("argTypes array size mismatch! Must at least get return value and 'this' types!");for(var H=null!==h[1]&&!1,x=!1,n=1;n<h.length;++n)if(null!==h[n]&&void 0===h[n].X){x=!0;break}var I="void"!==h[0].name,J="",M="";for(n=0;n<q-2;++n)J+=(0!==n?", ":"")+"arg"+n,M+=(0!==n?", ":"")+"arg"+n+"Wired";k="return function "+Ga(k)+"("+J+") {\nif (arguments.length !== "+(q-2)+") {\nthrowBindingError('function "+k+" called with ' + arguments.length + ' arguments, expected "+
(q-2)+" args!');\n}\n";x&&(k+="var destructors = [];\n");var Na=x?"destructors":"null";J="throwBindingError invoker fn runDestructors retType classParam".split(" ");p=[T,p,g,Ua,h[0],h[1]];H&&(k+="var thisWired = classParam.toWireType("+Na+", this);\n");for(n=0;n<q-2;++n)k+="var arg"+n+"Wired = argType"+n+".toWireType("+Na+", arg"+n+"); // "+h[n+2].name+"\n",J.push("argType"+n),p.push(h[n+2]);H&&(M="thisWired"+(0<M.length?", ":"")+M);k+=(I?"var rv = ":"")+"invoker(fn"+(0<M.length?", ":"")+M+");\n";
if(x)k+="runDestructors(destructors);\n";else for(n=H?1:2;n<h.length;++n)q=1===n?"thisWired":"arg"+(n-2)+"Wired",null!==h[n].X&&(k+=q+"_dtor("+q+"); // "+h[n].name+"\n",J.push(q+"_dtor"),p.push(h[n].X));I&&(k+="var ret = retType.fromWireType(rv);\nreturn ret;\n");J.push(k+"}\n");h=Ta(J).apply(null,p);n=b-1;if(!d.hasOwnProperty(l))throw new Ka("Replacing nonexistant public symbol");void 0!==d[l].W&&void 0!==n?d[l].W[n]=h:(d[l]=h,d[l].aa=n);return []});},b:function(a,b,c,e,f){function g(k){return k}b=
P(b);-1===f&&(f=4294967295);var m=Ea(c);if(0===e){var h=32-8*c;g=function(k){return k<<h>>>h};}var l=-1!=b.indexOf("unsigned");U(a,{name:b,fromWireType:g,toWireType:function(k,p){if("number"!==typeof p&&"boolean"!==typeof p)throw new TypeError('Cannot convert "'+Ra(p)+'" to '+this.name);if(p<e||p>f)throw new TypeError('Passing a number "'+Ra(p)+'" from JS side to C/C++ side to an argument of type "'+b+'", which is outside the valid range ['+e+", "+f+"]!");return l?p>>>0:p|0},argPackAdvance:8,readValueFromPointer:cb(b,
m,0!==e),X:null});},a:function(a,b,c){function e(g){g>>=2;var m=E;return new f(B,m[g+1],m[g])}var f=[Int8Array,Uint8Array,Int16Array,Uint16Array,Int32Array,Uint32Array,Float32Array,Float64Array][b];c=P(c);U(a,{name:c,fromWireType:e,argPackAdvance:8,readValueFromPointer:e},{ca:!0});},g:function(a,b){b=P(b);var c="std::string"===b;U(a,{name:b,fromWireType:function(e){var f=E[e>>2];if(c){var g=y[e+4+f],m=0;0!=g&&(m=g,y[e+4+f]=0);var h=e+4;for(g=0;g<=f;++g){var l=e+4+g;if(0==y[l]){h=h?fa(y,h,void 0):"";
if(void 0===k)var k=h;else k+=String.fromCharCode(0),k+=h;h=l+1;}}0!=m&&(y[e+4+f]=m);}else {k=Array(f);for(g=0;g<f;++g)k[g]=String.fromCharCode(y[e+4+g]);k=k.join("");}W(e);return k},toWireType:function(e,f){f instanceof ArrayBuffer&&(f=new Uint8Array(f));var g="string"===typeof f;g||f instanceof Uint8Array||f instanceof Uint8ClampedArray||f instanceof Int8Array||T("Cannot pass non-string to std::string");var m=(c&&g?function(){for(var k=0,p=0;p<f.length;++p){var q=f.charCodeAt(p);55296<=q&&57343>=q&&
(q=65536+((q&1023)<<10)|f.charCodeAt(++p)&1023);127>=q?++k:k=2047>=q?k+2:65535>=q?k+3:k+4;}return k}:function(){return f.length})(),h=Y(4+m+1);E[h>>2]=m;if(c&&g)ha(f,h+4,m+1);else if(g)for(g=0;g<m;++g){var l=f.charCodeAt(g);255<l&&(W(h),T("String has UTF-16 code units that do not fit in 8 bits"));y[h+4+g]=l;}else for(g=0;g<m;++g)y[h+4+g]=f[g];null!==e&&e.push(W,h);return h},argPackAdvance:8,readValueFromPointer:Qa,X:function(e){W(e);}});},c:function(a,b,c){c=P(c);if(2===b){var e=ja;var f=ka;var g=la;
var m=function(){return D};var h=1;}else 4===b&&(e=ma,f=na,g=oa,m=function(){return E},h=2);U(a,{name:c,fromWireType:function(l){var k=E[l>>2],p=m(),q=p[l+4+k*b>>h],H=0;0!=q&&(H=q,p[l+4+k*b>>h]=0);var x=l+4;for(q=0;q<=k;++q){var n=l+4+q*b;if(0==p[n>>h]){x=e(x);if(void 0===I)var I=x;else I+=String.fromCharCode(0),I+=x;x=n+b;}}0!=H&&(p[l+4+k*b>>h]=H);W(l);return I},toWireType:function(l,k){"string"!==typeof k&&T("Cannot pass non-string to C++ string type "+c);var p=g(k),q=Y(4+p+b);E[q>>2]=p>>h;f(k,q+
4,p+b);null!==l&&l.push(W,q);return q},argPackAdvance:8,readValueFromPointer:Qa,X:function(l){W(l);}});},v:function(a,b){b=P(b);U(a,{da:!0,name:b,argPackAdvance:0,fromWireType:function(){},toWireType:function(){}});},m:Oa,t:function(a){4<a&&(V[a].Z+=1);},B:function(a,b){var c=R[a];void 0===c&&T("_emval_take_value has unknown type "+$a(a));a=c.readValueFromPointer(b);return Pa(a)},w:function(){ya();},q:function(a,b,c){y.copyWithin(a,b,b+c);},r:function(a){a>>>=0;var b=y.length;if(2147483648<a)return !1;for(var c=
1;4>=c;c*=2){var e=b*(1+.2/c);e=Math.min(e,a+100663296);e=Math.max(16777216,a,e);0<e%65536&&(e+=65536-e%65536);a:{try{w.grow(Math.min(2147483648,e)-B.byteLength+65535>>>16);ra(w.buffer);var f=1;break a}catch(g){}f=void 0;}if(f)return !0}return !1},x:function(a,b){var c=0;eb().forEach(function(e,f){var g=b+c;f=A[a+4*f>>2]=g;for(g=0;g<e.length;++g)C[f++>>0]=e.charCodeAt(g);C[f>>0]=0;c+=e.length+1;});return 0},y:function(a,b){var c=eb();A[a>>2]=c.length;var e=0;c.forEach(function(f){e+=f.length+1;});A[b>>
2]=e;return 0},z:function(){return 0},p:function(){},h:function(a,b,c,e){for(var f=0,g=0;g<c;g++){for(var m=A[b+8*g>>2],h=A[b+(8*g+4)>>2],l=0;l<h;l++){var k=y[m+l],p=gb[a];0===k||10===k?((1===a?ba:u)(fa(p,0)),p.length=0):p.push(k);}f+=h;}A[e>>2]=f;return 0},memory:w,k:function(){return 0},j:function(){return 0},i:function(){},A:function(){return 6},l:function(){},e:function(){},table:ca},jb=function(){function a(f){d.asm=f.exports;G--;d.monitorRunDependencies&&d.monitorRunDependencies(G);0==G&&(L&&(f=L,L=null,f()));}function b(f){a(f.instance);}function c(f){return Ca().then(function(g){return WebAssembly.instantiate(g,e)}).then(f,function(g){u("failed to asynchronously prepare wasm: "+g);ya(g);})}var e={a:ib};G++;d.monitorRunDependencies&&d.monitorRunDependencies(G);if(d.instantiateWasm)try{return d.instantiateWasm(e,a)}catch(f){return u("Module.instantiateWasm callback failed with error: "+f),!1}(function(){if(v||"function"!==typeof WebAssembly.instantiateStreaming||
Aa()||za("file://")||"function"!==typeof fetch)return c(b);fetch(N,{credentials:"same-origin"}).then(function(f){return WebAssembly.instantiateStreaming(f,e).then(b,function(g){u("wasm streaming compile failed: "+g);u("falling back to ArrayBuffer instantiation");c(b);})});})();return {}}();d.asm=jb;
var Da=d.___wasm_call_ctors=function(){return (Da=d.___wasm_call_ctors=d.asm.C).apply(null,arguments)},Y=d._malloc=function(){return (Y=d._malloc=d.asm.D).apply(null,arguments)},W=d._free=function(){return (W=d._free=d.asm.E).apply(null,arguments)},ab=d.___getTypeName=function(){return (ab=d.___getTypeName=d.asm.F).apply(null,arguments)};d.___embind_register_native_and_builtin_types=function(){return (d.___embind_register_native_and_builtin_types=d.asm.G).apply(null,arguments)};
d.dynCall_ii=function(){return (d.dynCall_ii=d.asm.H).apply(null,arguments)};d.dynCall_vi=function(){return (d.dynCall_vi=d.asm.I).apply(null,arguments)};d.dynCall_iii=function(){return (d.dynCall_iii=d.asm.J).apply(null,arguments)};d.dynCall_vii=function(){return (d.dynCall_vii=d.asm.K).apply(null,arguments)};d.dynCall_viii=function(){return (d.dynCall_viii=d.asm.L).apply(null,arguments)};d.dynCall_iiii=function(){return (d.dynCall_iiii=d.asm.M).apply(null,arguments)};
d.dynCall_iiiiiii=function(){return (d.dynCall_iiiiiii=d.asm.N).apply(null,arguments)};d.dynCall_viiiiii=function(){return (d.dynCall_viiiiii=d.asm.O).apply(null,arguments)};d.dynCall_v=function(){return (d.dynCall_v=d.asm.P).apply(null,arguments)};d.dynCall_iiiii=function(){return (d.dynCall_iiiii=d.asm.Q).apply(null,arguments)};d.dynCall_jiiiii=function(){return (d.dynCall_jiiiii=d.asm.R).apply(null,arguments)};d.dynCall_viiii=function(){return (d.dynCall_viiii=d.asm.S).apply(null,arguments)};
d.dynCall_iiiiii=function(){return (d.dynCall_iiiiii=d.asm.T).apply(null,arguments)};d.dynCall_jiji=function(){return (d.dynCall_jiji=d.asm.U).apply(null,arguments)};d.dynCall_viiiii=function(){return (d.dynCall_viiiii=d.asm.V).apply(null,arguments)};d.asm=jb;var Z;d.then=function(a){if(Z)a(d);else {var b=d.onRuntimeInitialized;d.onRuntimeInitialized=function(){b&&b();a(d);};}return d};L=function kb(){Z||lb();Z||(L=kb);};
function lb(){function a(){if(!Z&&(Z=!0,d.calledRun=!0,!da)){F(ua);F(va);if(d.onRuntimeInitialized)d.onRuntimeInitialized();if(d.postRun)for("function"==typeof d.postRun&&(d.postRun=[d.postRun]);d.postRun.length;){var b=d.postRun.shift();wa.unshift(b);}F(wa);}}if(!(0<G)){if(d.preRun)for("function"==typeof d.preRun&&(d.preRun=[d.preRun]);d.preRun.length;)xa();F(ta);0<G||(d.setStatus?(d.setStatus("Running..."),setTimeout(function(){setTimeout(function(){d.setStatus("");},1);a();},1)):a());}}d.run=lb;
if(d.preInit)for("function"==typeof d.preInit&&(d.preInit=[d.preInit]);0<d.preInit.length;)d.preInit.pop()();noExitRuntime=!0;lb();


  return blosc_codec
}
);
})();

const wasmBase64 = `AGFzbQEAAAABygInYAF/AX9gA39/fwF/YAV/f39/fwF/YAJ/fwBgAn9/AX9gAX8AYAN/f38AYAR/f39/AX9gBH9/f38AYAAAYAZ/f39/f38Bf2AFf39/f38AYAZ/f39/f38AYAd/f39/f39/AX9gBH9/f38BfmAFf39/f38BfmAIf39/f39/f38Bf2AJf39/f39/f39/AX9gAn5/AX9gC39/f39/f39/f39/AX9gA39+fwF+YAN/f34AYAN/f34Bf2ADfn9/AX9gAn5+AX5gB39/f39/f38AYAh/f39/f39/fwBgCX9/f39/f39/fwBgBX9+f39/AGAAAX9gDX9/f39/f39/f39/f38Bf2APf39/f39/f39/f39/f39/AX9gBX9/f35/AX9gBn98f39/fwF/YAF/AX5gAn9/AX5gB39+f39/f38BfmABfgF+YAR+f39+AX4CxQEeAWEBYQAGAWEBYgALAWEBYwAGAWEBZAAMAWEBZQAFAWEBZgAGAWEBZwADAWEBaAAHAWEBaQAEAWEBagAAAWEBawAAAWEBbAAEAWEBbQAFAWEBbgAGAWEBbwAAAWEBcAACAWEBcQABAWEBcgAAAWEBcwADAWEBdAAFAWEBdQALAWEBdgADAWEBdwAJAWEBeAAEAWEBeQAEAWEBegAAAWEBQQAHAWEBQgAEAWEGbWVtb3J5AgGAAoCAAgFhBXRhYmxlAXAAVgOyBLAEAwEBBAIACAAAAAMHAQEBAAIBAAMEBAEDAQUEBQUABgABBAAIAgIEAQgBBAYBCwEBAAMYAwEDBwoGBAQLBwgGCAQLBQQEBAYIAQYDBgAHAgYAAAEAAgMDBgMFBAQACwAGDAQAAA0GAhgECQABDAYGCAACABAeAAAFAQMEHAcHBwcEBAYfEwMIAQECAQIKBwYKBgMAAwAEARARBAAFBQUFBQUJCAYEBgAACwYFBQUCAAICBwcFBAMDBxIBEhcmAAMABQMGAQAEBQUABAYKAAUFBAEgBQQEBQUBEQQHCgMABQQHCgoiBgUBAAYGBgUFCAQTDQAAAAEBAQcHBwcHBwEHBwAIBgcEEQIGAgICAggKAgIHAgMIAAUFBQQAAgoMCgsCGQANBwgGAQMEFAAJAAkACQkJCQMJCQkJCQkJCQkJBAkJDAwLCwgICAsMAAEAAQUABQAFCQQAEhcSBAAGAQAUBg0N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aiICQQNLDQACQCACQQFrDgMBAQADCyABKAIAIgNBf2oMAQsgASgCACEDIAEgAkECdGooAgALIQQgAUEEQQggAkEBSxtqKAIAIQEgACADNgIEIAAgATYCCCAAIAQ2AgAPCyAAIAEpAgA3AgAgACABKAIINgIIC1UBAn8gBCABENABIQYgAygCACIFIAQgAGsiBEkEQANAIAIgACAFaiABENABQQJ0aiAFNgIAIAVBAWoiBSAESQ0ACwsgAyAENgIAIAIgBkECdGooAgALtAQBFX8jAEEQayIOJAAgACgCICABIAAoAnwgAxAeQQJ0aiIFKAIAIQMgACgCeCEGIAAoAgghDyAAKAIMIQwgACgCKCESIAAoAoABIQggACgCECETIAUgASAAKAIEIg1rIgk2AgAgEiAJQX8gBkF/anRBf3MiFHFBA3RqIQcgCUEJaiEKAn8gAyATSQRAIAdCADcCAEEADAELQQAgCSAUayIAIAAgCUsbIRUgB0EEaiEGIAwgDWohFiAMIA9qIRdBfyAIdEF/cyERQQghC0EAIQgDQAJ/IARBACAQIAggECAISRsiACADaiAMSRtFBEAgACABaiADIA1qIABqIAIQHSAAaiIAIANqIQUgDQwBCyAPIA0gACABaiADIA9qIABqIAIgFyAWECAgAGoiACADaiIFIAxJGwshGCAFIAogACAKIANrSxsgCiAAIAtLIgUbIQogACALIAUbIQsCQCAAIAFqIhkgAkYNACASIAMgFHFBA3RqIQUCQAJAIAMgGGogAGotAAAgGS0AAEkEQCAHIAM2AgAgAyAVSw0BIA5BDGohBwwDCyAGIAM2AgAgAyAVSwRAIAAhCCAFIQYMAgsgDkEMaiEGDAILIAAhECAFQQRqIgchBQsgEUUNACARQX9qIREgBSgCACIDIBNPDQELCyAGQQA2AgAgB0EANgIAIAtBgH1qIgBBwAEgAEHAAUkbQQAgC0GAA0sbCyEDIA5BEGokACADIAogCWtBeGoiACADIABLGwscAQF/IAAoAgAgACgCBCABECkhAiAAIAEQJiACCywAIAJFBEAgACgCBCABKAIERg8LIAAgAUYEQEEBDwsgACgCBCABKAIEEFxFC6QEAQN/QQEhBgJAIAFFIAJBBGoCfyAAKAKEAUEBTgRAIAAoAgAiBCgCLEECRgRAIAQgABCeBDYC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AQEBAQEBAQEAAQEBAQEBAQEBAQEAAQEBAQEBAQEBAAsCfwJ/An8gASgCCCICBEAgACgCKCACIAAoAiQRAwAgACgCHCEBCyABKAJEIgILBEAgACgCKCACIAAoAiQRAwAgACgCHCEBCyABKAJAIgILBEAgACgCKCACIAAoAiQRAwAgACgCHCEBCyABKAI4IgILBEAgACgCKCACIAAoAiQRAwAgACgCHCEBCyAAKAIoIAEgACgCJBEDACAAQQA2AhxBfUEAIANB8QBGGyECCyACCx0AIABBCSABIAFBAUgbIgBBDCAAQQxIGzsBmIAQC6IDAQZ/IwBBEGsiAyQAAn8gACgCBCIBIAAoAggiAkYEQCAAKAIAIgIgACgCDCACKAIAKAIQEQMAIAAoAgAiAiADQQxqIAIoAgAoAgwRBAAhASAAIAMoAgwiAjYCDCACRQRAIABBAToAEEEADAILIAAgASACaiICNgIICwJAIAIgAWsiAiABLQAAQQF0QcAJai8BAEELdkEBaiIESQRAIABBEWogASACEEohBiAAKAIAIgEgACgCDCABKAIAKAIQEQMAIABBADYCDANAIAAoAgAiASADQQhqIAEoAgAoAgwRBAAhBUEAIAMoAggiAUUNAxogACACakERaiAFIAEgBCACayIFIAEgBUkbIgEQKhogACgCACIFIAEgBSgCACgCEBEDACABIAJqIgIgBEkNAAsgACAGNgIEIAAgACAEakERajYCCAwBCyACQQRNBEAgAEERaiABIAIQSiEBIAAoAgAiBCAAKAIMIAQoAgAoAhARAwAgACABIAJqNgIIIAAgATYCBCAAQQA2AgwMAQsgACABNgIEC0EBCyECIANBEGokACACC8cCACAAIAEtAAA6AAAgACABLQABOgABIAAgAS0AAjoAAiAAIAEtAAM6AAMgACABLQAEOgAEIAAgAS0ABToABSAAIAEtAAY6AAYgACABLQAHOgAHIAAgAS0ACDoACCAAIAEtAAk6AAkgACABLQAKOgAKIAAgAS0ACzoACyAAIAEtAAw6AAwgACABLQANOgANIAAgAS0ADjoADiAAIAEtAA86AA8gACABLQAQOgAQIAAgAS0AEToAESAAIAEtABI6ABIgACABLQATOgATIAAgAS0AFDoAFCAAIAEtABU6ABUgACABLQAWOgAWIAAgAS0AFzoA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ASACEPcCCxIAIABFBEBBAA8LIAAgARDwAgujAgACQAJAIAFBFEsNACABQXdqIgFBCUsNAAJAAkACQAJAAkACQAJAAkAgAUEBaw4JAQIJAwQFBgkHAAsgAiACKAIAIgFBBGo2AgAgACABKAIANgIADwsgAiACKAIAIgFBBGo2AgAgACABNAIANwMADwsgAiACKAIAIgFBBGo2AgAgACABNQIANwMADwsgAiACKAIAIgFBBGo2AgAgACABMgEANwMADwsgAiACKAIAIgFBBGo2AgAgACABMwEANwMADwsgAiACKAIAIgFBBGo2AgAgACABMAAANwMADwsgAiACKAIAIgFBBGo2AgAgACABMQAANwMADwsgACACQQARAwALDwsgAiACKAIAQQdqQXhxIgFBCGo2AgAgACABKQMANwMAC0QBBH8gACgCACICLAAAIgMQbQRAA0AgACACQQFqIgQ2AgAgAUEKbCADakFQaiEBIAIsAAEhAyAEIQIgAxBtDQALCyABC3UBA38CQAJAA0AgACABQbDEAWotAABHBEBB1wAhAiABQQFqIgFB1wBHDQEMAgsLIAEhAiABDQBBkMUBIQAMAQtBkMUBIQEDQCABLQAAIQMgAUEBaiIAIQEgAw0AIAAhASACQX9qIgINAAsLQeDsASgCABogAAuPBAEDfyMAQRBrIgUkACAFIAI2AgggBSAANgIMIAAgA2ohBgJAIANBB0wEQCADQQFIDQEDQCAAIAItAAA6AAAgAkEBaiECIABBAWoiACAGRw0ACyAFIAY2AgwgBSACNgIIDAELIARBAUYEQCAFQQxqIAVBCGogACACaxB7IAUoAgwhAAsgBiABTQRAIAAgA2ohByAEQQFHIAAgBSgCCCICa0EPSnJFBEADQCAAIAIQZiACQQhqIQIgAEEIaiIAIAdJDQAMAwALAAsgACACEBwgAEEQaiACQRBqEBwgA0EhSA0BIABBIGohAANAIAAgAkEgaiIBEBwgAEEQaiACQTBqEBwgASECIABBIGoiACAHSQ0ACwwBCwJAIAAgAUsEQCAAIQEMAQsCQCAEQQFHIAAgBSgCCCIEa0EPSnJFBEAgACECIAQhAwNAIAIgAxBmIANBCGohAyACQQhqIgIgAUkNAAsMAQsgACAEEBwgAEEQaiAEQRBqEBwgASAAa0EhSA0AIABBIGohAiAE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akEAOwEAIABBhBVqQQA7AQAgAEGAFWpBADsBACAAQfwTakEAOwEAIABB+BNqQQA7AQAgAEH0E2pBADsBACAAQfATakEAOwEAIABB7BNqQQA7AQAgAEHoE2pBADsBACAAQeQTakEAOwEAIABB4BNqQQA7AQAgAEHcE2pBADsBACAAQdgTakEAOwEAIABB1BNqQQA7AQAgAEHQE2pBADsBACAAQcwTakEAOwEAIABByBNqQQA7AQAgAEHEE2pBADsBACAAQcATakEAOwEAIABBvBNqQQA7AQAgAEG4E2pBADsBACAAQbQTakEAOwEAIABBsBNqQQA7AQAgAEGsE2pBADsBACAAQagTakEAOwEAIABBpBNqQQA7AQAgAEGgE2pBADsBACAAQZwTakEAOwEAIABBmBNqQQA7AQAgAEGUE2pBADsBACAAQZATakEAOwEAIABBjBNqQQA7AQAgAEIANwKsLSAAQZQJakEBOwEAIABBADYCqC0gAEEANgKgLQueAQECfyAAIAAvAbgtIANB//8DcSIEIAAoArwtIgN0ciIFOwG4LSAAAn8gA0EOTgRAIAAgACgCFCIDQQFqNgIUIAMgACgCCGogBToAACAAIAAoAhQiA0EBajYCFCADIAAoAghqIABBuS1qLQAAOgAAIAAgBEEQIAAoArwtIgNrdjsBuC0gA0FzagwBCyADQQNqCzYCvC0gACABIAIQoQQLlwQBEH8gACgCfCIEIARBAnYgACgCeCIEIAAoAowBSRshCUEAIAAoAmwiAiAAKAIsa0GGAmoiAyADIAJLGyEMIAAoAnQiByAAKAKQASIDIAMgB0sbIQ0gACgCOCIOIAJqIgVBggJqIQ8gBCAFaiICLQAAIQogAkF/ai0AACELIAAoAjQhECAAKAJAIREDQAJAAkAgASAOaiIDIARqIgItAAAgCkcNACACQX9qLQAAIAtHDQAgAy0AACAFLQAARw0AQQIhBiADLQABIAUtAAFHDQADQAJAIAUgBmoiAi0AASADLQADRwRAIAJBAWohAgwBCyACLQACIAMtAARHBEAgAkECaiECDAELIAItAAMgAy0ABUcEQCACQQNqIQIMAQsgAi0ABCADLQAGRwRAIAJBBGohAgwBCyACLQAFIAMtAAdHBEAgAkEFaiECDAELIAItAAYgAy0ACEcEQCACQQZqIQIMAQsg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CGogAzoAACABKAIcKAIEIQMgASABKAIUIgRBAWo2AhQgBCABKAIIaiADQQh2OgAAIAEoAhwvAQYhAyABIAEoAhQiBEEBajYCFCAEIAEoAghqIAM6AAAgASgCHC0AByEDIAEgASgCFCIEQQFqNgIUIAQgASgCCGogAzoAACABKAKEASIDQQlHBEBBBCABKAKIAUEBSkECdCADQQJIGyECCyABIAEoAhQiA0EBajYCFCADIAEoAghqIAI6AAAgASgCHCgCDCECIAEgASgCFCIDQQFqNgIUIAMgASgCCGogAjoAAAJ/IAEoAhwiBCgCEARAIAQoAhQhAiABIAEoAhQiA0EBajYCFCADIAEoAghqIAI6AAAgASgCHCgCFCECIAEgASgCFCIDQQFqNgIUIAMgASgCCGogAkEIdjoAACABKAIcIQQLIAQoAiwLBEAgACAAKAIwIAEoAgggASgCFBA0NgIwCyABQcUANgIEIAFBADYCIAwCCyABKAIwQQx0QYCQfmohBEEAIQICQCABKAKIAUEBSg0AIAEoAoQBIgNBAkgNAEHAACECIANBBkgNAEGAAUHAASADQQZGGyECCyABQfEANgIEIAEgAiAEciICQSByIAIgASgCbBsiAkEfcCACckEfcxB0IAEoAmwEQCABIAAvATIQdCABIAAvATAQdAsgAEEAQQBBABBkNgIwIAEoAgQhAgsgAkHFAEcNASABKAIcIQQLAkAgBCgCEARAIAEoAhQhAiABKAIgIgUgBC8BFE8NASACIQMDQCABKAIMIAJGBEACQCACIANNDQAgBCgCLEUNACAAIAAoAjAgASgCCCADaiACIANrEDQ2AjALIAAQNSABKAIcIQQgASgCFCICIAEoAgxGDQMgASgCICEFIAIhAwsgBCgCECAFai0AACEEIAEgAkEBajYCFCABKAIIIAJqIAQ6AAAgASABKAIgQQFqIgU2AiAgBSABKAIcIgQvARRPBEAgAyECDAMFIAEoAhQhAgwBCwAACwALIAFByQA2AgQMAgsCQCAEKAIsRQ0AIAEoAhQiAyACTQ0AIAAgACgCMCABKAIIIAJqIAMgAmsQNDYCMAsgASgCICAEKAIURgRAIAFByQA2AgQgAUEANgIgDAILIAEoAgQhAgsgAkHJAEcNASABKAIcIQQLIAQoAhxFDQIgASgCFCICIQMCfwNA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FCADbCEVQQAhBANAIAEgBSACIARsIgZqaiAAIAQgB2pqLQAAOgAAIAEgBiAUamogACAEIBVqai0AADoAACABIAYgEmpqIAAgBCATamotAAA6AAAgASAGIBBqaiAAIAQgEWpqLQAAOgAAIAEgBiAOamogACAEIA9qai0AADoAACABIAYgDGpqIAAgBCANamotAAA6AAAgASAGIApqaiAAIAQgC2pqLQAAOgAAIAEgBiAIamogACAEIAlqai0AADoAACAEQQFqIgQgA0cNAAsLIAVBD2ohBCAFQQhqIQUgBCACSQ0ACwsgAkF4cSIFIAJPDQADQCADBEAgAyAFbCEGQQAhBANAIAEgAiAEbCAFamogACAEIAZqai0AADoAACAEQQFqIgQgA0cNAAsLIAVBAWoiBSACRw0ACwsgAiADbK0LuAEBA38CQCABQQFIDQAgACwAACIEQf8AcSEDAkAgBEF/Sg0AIAFBAkgNASAALAABIgRBB3RBgP8AcSADciEDIARBf0oNACABQQNIDQEgACwAAiIEQQ50QYCA/wBxIANyIQMgBEF/Sg0AIAFBBEgNASAALAADIgRBFXRBgICA/wBxIANyIQMgBEF/Sg0AIAFBBUgNASAALQAEIgBBD0sNASAAQRx0IANyIQMLIAIgAzYCAEEBIQULIAULggEBBn8gASABIABuIgYgAGxrIQcgACABTQRAIAZBASAGQQFLGyEIA0AgAARAIAAgBGwhCUEAIQUDQCADIAUgCWpqIAIgBSAGbCAEamotAAA6AAAgBUEBaiIFIABHDQALCyAEQQFqIgQgCEcNAAsLIAMgASAHayIAaiAAIAJqIAcQKhoLDQAgACABIAIgAxDEBAuCAQEGfyABIAEgAG4iBiAAbGshByAABEAgBkEBIAZBAUsbIQgDQCAAIAFNBEAgBCAGbCEJQQAhBQNAIAMgBSAJamogAiAAIAVsIARqai0AADoAACAFQQFqIgUgCEcNAAsLIARBAWoiBCAARw0ACwsgAyABIAdrIgBqIAAgAmogBxAqGgsNACAAIAEgAiADEMYEC6ICAQJ/IAAgARA2GiACQQN2IgRB+P///wFxIQMgASACQQdxIgJqIQEgACACaiEAAn8gASAEQQdxQX9qIgJBBksNABoCQAJAAkACQAJAAkACQCACQQFrDgYFBAMCAQAGCyAAIAEQNiEAIAFBCGohAQsgACABEDYhACABQQhqIQELIAAgARA2IQAgAUEIaiEBCyAAIAEQNiEAIAFBCGohAQsgACABEDYhACABQQhqIQELIAAgARA2IQAgAUEIaiEBCyAAIAEQNiEAIAFBCGoLIQIgAwRAA0AgACACEDYgAkEIahA2IAJBEGoQNiACQRhqEDYgAkEgahA2IAJBKGoQNiACQTBqEDYgAkE4ahA2IQAgAkFAayECIANBeGoiAw0ACwsgAAstACACBEADQCAAIAEtAAA6AAAgAEEBaiEAIAFBAWohASACQX9qIgINAAsLIAALJgEBf0ECIQQgAygCACABEI8CTwR/IAAgASACIAMQmQRBAAUgBAsLPgAQxwIQ7wJB1A1BAkH4D0HzD0EKQQsQA0HfDUEGQZAOQfwNQQxBDRADQegNQQFB+A1B9A1BDkEPEAMQ3AILC8XcATgAQYAIC4MGTjZzbmFwcHk0U2lua0UAAAxuAAAABAAATjZzbmFwcHk2U291cmNlRQAAAAAMbgAAGAQAAAAAAABsBAAAAQAAAAIAAAADAAAABAAAAAUAAABONnNuYXBweTE1Qnl0ZUFycmF5U291cmNlRQAAgGwAAFAEAAAsBAAAAAAAALQEAAAGAAAABwAAAAgAAAAJAAAATjZzbmFwcHkyMlVuY2hlY2tlZEJ5dGVBcnJheVNpbmtFAAAAgGwAAJAEAAAQBAAAAQAECAEQASACAAUIAhACIAMABggDEAMgBAAHCAQQBCAFAAgIBRAFIAYACQgGEAYgBwAKCAcQByAIAAsICBAIIAkABAkJEAkgCgAFCQoQCiALAAYJCxALIAwABwkMEAwgDQAICQ0QDSAOAAkJDhAOIA8ACgkPEA8gEAALCRAQECARAAQKERARIBIABQoSEBIgEwAGChMQEyAUAAcKFBAUIBUACAoVEBUgFgAJChYQFiAXAAoKFxAXIBgACwoYEBggGQAECxkQGSAaAAULGhAaIBsABgsbEBsgHAAHCxwQHCAdAAgLHRAdIB4ACQseEB4gHwAKCx8QHyAgAAsLIBAgICEABAwhECEgIgAFDCIQIiAjAAYMIxAjICQABwwkECQgJQAIDCUQJSAmAAkMJhAmICcACgwnECcgKAALDCgQKCApAAQNKRApICoABQ0qECogKwAGDSsQKyAsAAcNLBAsIC0ACA0tEC0gLgAJDS4QLiAvAAoNLxAvIDAACw0wEDAgMQAEDjEQMSAyAAUOMhAyIDMABg4zEDMgNAAHDjQQNCA1AAgONRA1IDYACQ42EDYgNwAKDjcQNyA4AAsOOBA4IDkABA85EDkgOgAFDzoQOiA7AAYPOxA7IDwABw88EDwgAQgIDz0QPSABEAkPPhA+IAEYCg8/ED8gASALD0AQQCAAAAAA/wAAAP//AAD///8A/////2RlY29tcHJlc3MAY29tcHJlc3MAZnJlZV9yZXN1bHQAdmkAAGxtAABpaWlpaWlpAEGQDgvUBigHAAAwBwAAMAcAAMBtAADAbQAAwG0AAAxuAAC2BwAANG4AAEgHAAAAAAAAAQAAAIgHAAAAAAAATlN0M19fMjEyYmFzaWNfc3RyaW5nSWNOU18xMWNoYXJfdHJhaXRzSWNFRU5TXzlhbGxvY2F0b3JJY0VFRUUAAAxuAACQBwAATlN0M19fMjIxX19iYXNpY19zdHJpbmdfY29tbW9uSUxiMUVFRQBOMTBlbXNjcmlwdGVuM3ZhbEUAAAAADG4AANQHAABOMTBlbXNjcmlwdGVuMTFtZW1vcnlfdmlld0loRUUAaWlpAAAoBwAAMAcAABgIAAAgCAAAJAgAACoIAAAxCAAANggAAGJsb3NjbHoAbHo0AGx6NGhjAHNuYXBweQB6bGliAHpzdGQARXJyb3IuICBudGhyZWFkcyBjYW5ub3QgYmUgbGFyZ2VyIHRoYW4gQkxPU0NfTUFYX1RIUkVBRFMgKCVkKQBFcnJvci4gIG50aHJlYWRzIG11c3QgYmUgYSBwb3NpdGl2ZSBpbnRlZ2VyAEVSUk9SOyByZXR1cm4gY29kZSBmcm9tIHB0aHJlYWRfY3JlYXRlKCkgaXMgJWQKAAlFcnJvciBkZXRhaWw6ICVzCgBCbG9zYyBoYXMgbm90IGJlZW4gY29tcGlsZWQgd2l0aCAnJXMnIABjb21wcmVzc2lvbiBzdXBwb3J0LiAgUGxlYXNlIHVzZSBvbmUgaGF2aW5nIGl0LgBFcnJvciBhbGxvY2F0aW5nIG1lbW9yeSEARVJST1I7IHJldHVybiBjb2RlIGZyb20gcHRocmVhZF9qb2luKCkgaXMgJWQKAElucHV0IGJ1ZmZlciBzaXplIGNhbm5vdCBleGNlZWQgJWQgYnl0ZXMK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AAAACQAAAAkAAAAKAAAACgAAAAsAAAALAAAADAAAAAwAAAANAAAADQBBgNsAC/8IDAAIAIwACABMAAgAzAAIACwACACsAAgAbAAIAOwACAAcAAgAnAAIAFwACADcAAgAPAAIALwACAB8AAgA/AAIAAIACACCAAgAQgAIAMIACAAiAAgAogAIAGIACADiAAgAEgAIAJIACABSAAgA0gAIADIACACyAAgAcgAIAPIACAAKAAgAigAIAEoACADKAAgAKgAIAKoACABqAAgA6gAIABoACACaAAgAWgAIANoACAA6AAgAugAIAHoACAD6AAgABgAIAIYACABGAAgAxgAIACYACACmAAgAZgAIAOYACAAWAAgAlgAIAFYACADWAAgANgAIALYACAB2AAgA9gAIAA4ACACOAAgATgAIAM4ACAAuAAgArgAIAG4ACADuAAgAHgAIAJ4ACABeAAgA3gAIAD4ACAC+AAgAfgAIAP4ACAABAAgAgQAIAEEACADBAAgAIQAIAKEACABhAAgA4QAIABEACACRAAgAUQAIANEACAAxAAgAsQAIAHEACADxAAgACQAIAIkACABJAAgAyQAIACkACACpAAgAaQAIAOkACAAZAAgAmQAIAFkACADZAAgAOQAIALkACAB5AAgA+QAIAAUACACFAAgARQAIAMUACAAlAAgApQAIAGUACADlAAgAFQAIAJUACABVAAgA1QAIADUACAC1AAgAdQAIAPUACAANAAgAjQAIAE0ACADNAAgALQAIAK0ACABtAAgA7QAIAB0ACACdAAgAXQAIAN0ACAA9AAgAvQAIAH0ACAD9AAgAEwAJABMBCQCTAAkAkwEJAFMACQBTAQkA0wAJANMBCQAzAAkAMwEJALMACQCzAQkAcwAJAHMBCQDzAAkA8wEJAAsACQALAQkAiwAJAIsBCQBLAAkASwEJAMsACQDLAQkAKwAJACsBCQCrAAkAqwEJAGsACQBrAQkA6wAJAOsBCQAbAAkAGwEJAJsACQCbAQkAWwAJAFsBCQDbAAkA2wEJADsACQA7AQkAuwAJALsBCQB7AAkAewEJAPsACQD7AQkABwAJAAcBCQCHAAkAhwEJAEcACQBHAQkAxwAJAMcBCQAnAAkAJwEJAKcACQCnAQkAZwAJAGcBCQDnAAkA5wEJABcACQAXAQkAlwAJAJcBCQBXAAkA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AAAAAAABAAAAFAAAAA8AAAAQAAAAAQAAAAYAAAAAAAAAAQAAABUAAAAQAAAAEQAAAAEAAAAFAAAAAAAAAAIAAAAVAAAAEgAAABIAAAABAAAABQAAAAAAAAACAAAAFQAAABIAAAATAAAAAgAAAAUAAAACAAAAAwAAABUAAAATAAAAEwAAAAMAAAAFAAAABAAAAAMAAAAVAAAAEwAAABMAAAADAAAABQAAAAgAAAAEAAAAFQAAABMAAAATAAAAAwAAAAUAAAAQAAAABQAAABUAAAATAAAAFAAAAAQAAAAFAAAAEAAAAAUAAAAWAAAAFAAAABUAAAAEAAAABQAAABAAAAAFAAAAFgAAABUAAAAWAAAABAAAAAUAAAAQAAAABQAAABYAAAAVAAAAFgAAAAUAAAAFAAAAEAAAAAUAAAAWAAAAFQAAABYAAAAFAAAABQAAACAAAAAGAAAAFgAAABYAAAAXAAAABQAAAAUAAAAgAAAABgAAABYAAAAXAAAAFwAAAAYAAAAFAAAAIAAAAAYAAAAWAAAAFgAAABYAAAAFAAAABQAAADAAAAAHAAAAFwAAABcAAAAWAAAABQAAAAQAAABAAAAABwAAABcAAAAXAAAAFgAAAAYAAAADAAAAQAAAAAgAAAAXAAAAGAAAABYAAAAHAAAAAwAAAAABAAAJAAAAGQAAABkAAAAXAAAABwAAAAMAAAAAAQAACQAAABoAAAAaAAAAGAAAAAcAAAADAAAAAAIAAAkAAAAbAAAAGwAAABkAAAAJAAAAAwAAAOcDAAAJAAAAEgAAAAwAAAANAAAAAQAAAAUAAAABAAAAAQAAABIAAAANAAAADgAAAAEAAAAGAAAAAAAAAAEAAAASAAAADgAAAA4AAAABAAAABQAAAAAAAAACAAAAEgAAABAAAAAQAAAAAQAAAAQAAAAAAAAAAgAAABIAAAAQAAAAEQAAAAIAAAAFAAAAAgAAAAMAAAASAAAAEgAAABIAAAADAAAABQAAAAIAAAADAAAAEgAAABIAAAATAAAAAwAAAAUAAAAEAAAABAAAABIAAAASAAAAEwAAAAQAAAAEAAAABAAAAAQAAAASAAAAEgAAABMAAAAEAAAABAAAAAgAAAAFAAAAEgAAABIAAAATAAAABQAAAAQAAAAIAAAABQAAABIAAAASAAAAEwAAAAYAAAAEAAAACAAAAAUAAAASAAAAEgAAABMAAAAFAAAABAAAAAwAAAAGAAAAEgAAABMAAAATAAAABwAAAAQAAAAMAAAABgAAABIAAAASAAAAEwAAAAQAAAAEAAAAEAAAAAcAAAASAAAAEgAAABMAAAAEAAAAAwAAACAAAAAHAAAAEgAAABIAAAATAAAABgAAAAMAAACAAAAABwAAABIAAAATAAAAEwAAAAYAAAADAAAAgAAAAAgAAAASAAAAEwAAABMAAAAIAAAAAwAAAAABAAAIAAAAEgAAABMAAAATAAAABgAAAAMAAACAAAAACQAAABIAAAATAAAAEwAAAAgAAAADAAAAAAEAAAkAAAASAAAAEwAAABMAAAAKAAAAAwAAAAACAAAJAAAAEgAAABMAAAATAAAADAAAAAMAAAAAAgAACQAAABIAAAATAAAAEwAAAA0AAAADAAAA5wMAAAkAAAARAAAADAAAAAwAAAABAAAABQAAAAEAAAABAAAAEQAAAAwAAAANAAAAAQAAAAYAAAAAAAAAAQAAABEAAAANAAAADwAAAAEAAAAFAAAAAAAAAAEAAAARAAAADwAAABAAAAACAAAABQAAAAAAAAACAAAAEQAAABEAAAARAAAAAgAAAAQAAAAAAAAAAgAAABEAAAAQAAAAEQAAAAMAAAAEAAAAAgAAAAMAAAARAAAAEQAAABEAAAADAAAABAAAAAQAAAAEAAAAEQAAABEAAAARAAAAAwAAAAQAAAAIAAAABQAAABEAAAARAAAAEQAAAAQAAAAEAAAACAAAAAUAAAARAAAAEQAAABEAAAAFAAAABAAAAAgAAAAFAAAAEQAAABEAAAARAAAABgAAAAQAAAAIAAAABQAAABEAAAARAAAAEQAAAAUAAAAEAAAACAAAAAYAAAARAAAAEgAAABEAAAAHAAAABAAAAAwAAAAGAAAAEQAAABIAAAARAAAAAwAAAAQAAAAMAAAABwAAABEAAAASAAAAEQAAAAQAAAADAAAAIAAAAAcAAAARAAAAEgAAABEAAAAGAAAAAwAAAAABAAAHAAAAEQAAABIAAAARAAAABgAAAAMAAACAAAAACAAAABEAAAASAAAAEQAAAAgAAAADAAAAAAEAAAgAAAARAAAAEgAAABEAAAAKAAAAAwAAAAACAAAIAAAAEQAAABIAAAARAAAABQAAAAMAAAAAAQAACQAAABEAAAASAAAAEQAAAAcAAAADAAAAAAIAAAkAAAARAAAAEgAAABEAAAAJAAAAAwAAAAACAAAJAAAAEQAAABIAAAARAAAACwAAAAMAAADnAwAACQAAAA4AAAAMAAAADQAAAAEAAAAFAAAAAQAAAAEAAAAOAAAADgAAAA8AAAABAAAABQAAAAAAAAABAAAADgAAAA4AAAAPAAAAAQAAAAQAAAAAAAAAAQAAAA4AAAAOAAAADwAAAAIAAAAEAAAAAAAAAAIAAAAOAAAADgAAAA4AAAAEAAAABAAAAAIAAAADAAAADgAAAA4AAAAOAAAAAwAAAAQAAAAEAAAABAAAAA4AAAAOAAAADgAAAAQAAAAEAAAACAAAAAUAAAAOAAAADgAAAA4AAAAGAAAABAAAAAgAAAAFAAAADgAAAA4AAAAOAAAACAAAAAQAAAAIAAAABQAAAA4AAAAPAAAADgAAAAUAAAAEAAAACAAAAAYAAAAOAAAADwAAAA4AAAAJAAAABAAAAAgAAAAGAAAADgAAAA8AAAAOAAAAAwAAAAQAAAAMAAAABwAAAA4AAAAPAAAADgAAAAQAAAADAAAAGAAAAAcAAAAOAAAADwAAAA4AAAAFAAAAAwAAACAAAAAIAAAADgAAAA8AAAAPAAAABgAAAAMAAABAAAAACAAAAA4AAAAPAAAADwAAAAcAAAADAAAAAAEAAAgAAAAOAAAADwAAAA8AAAAFAAAAAwAAADAAAAAJAAAADgAAAA8AAAAPAAAABgAAAAMAAACAAAAACQAAAA4AAAAPAAAADwAAAAcAAAADAAAAAAEAAAkAAAAOAAAADwAAAA8AAAAIAAAAAwAAAAABAAAJAAAADgAAAA8AAAAPAAAACAAAAAMAAAAAAgAACQAAAA4AAAAPAAAADwAAAAkAAAADAAAAAAIAAAkAAAAOAAAADwAAAA8AAAAKAAAAAwAAAOcDAAAJAAAAIAAAACAAAAAhAAAAIgAAACMAAAAkAAAAJQAAACYAAAAnAAAAKAAAACkAAAApAAAAKgAAACsAAAAsAAAALQAAAC4AAAAvAAAAMAAAADAAAAAxAAAAMQAAADIAAAAzAAAANAAAADUAAAA2AAAANwAAADgAAAA4AEGQmgEL+gEEAAMAAgACAAIAAgACAAIAAgACAAIAAgACAAEAAQABAAIAAgACAAIAAgACAAIAAgACAAMAAgABAAEAAQABAAEA//////////8AAAAAAAAAAAEAAQABAAEAAQABAAIAAgACAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAP////////////8AAAAAAAABAAQAAwACAAIAAgACAAIAAgABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAP//////////////////AEGVnAEL+AcIAAAABwAAagYAAAAGAACtBQAAagUAADEFAAAABQAA1AQAAK0EAACKBAAAagQAAEwEAAAxBAAAFwQAAAAEAADpAwAA1AMAAMADAACtAwAAmwMAAIoDAAB5AwAAagMAAFsDAABMAwAAPgMAADEDAAAkAwAAFwMAAAsDAAAAAwAA9AIAAOkCAADeAgAA1AIAAMoCAADAAgAAtgIAAK0CAACkAgAAmwIAAJICAACKAgAAggIAAHkCAAByAgAAagIAAGICAABbAgAAUwIAAEwCAABFAgAAPgIAADcCAAAxAgAAKgIAACQCAAAeAgAAFwIAABECAAALAgAABQIAAAACAAD6AQAA9AEAAO8BAADpAQAA5AEAAN4BAADZAQAA1AEAAM8BAADKAQAAxQEAAMABAAC7AQAAtgEAALIBAACtAQAAqAEAAKQBAACfAQAAmwEAAJcBAACSAQAAjgEAAIoBAACGAQAAggEAAH4BAAB5AQAAdQEAAHIBAABuAQAAagEAAGYBAABiAQAAXgEAAFsBAABXAQAAUwEAAFABAABMAQAASQEAAEUBAABCAQAAPgEAADsBAAA3AQAANAEAADEBAAAuAQAAKgEAACcBAAAkAQAAIQEAAB4BAAAaAQAAFwEAABQBAAARAQAADgEAAAsBAAAIAQAABQEAAAIBAAAAAQAA/QAAAPoAAAD3AAAA9AAAAPEAAADvAAAA7AAAAOkAAADmAAAA5AAAAOEAAADeAAAA3AAAANkAAADXAAAA1AAAANEAAADPAAAAzAAAAMoAAADHAAAAxQAAAMIAAADAAAAAvgAAALsAAAC5AAAAtgAAALQAAACyAAAArwAAAK0AAACrAAAAqAAAAKYAAACkAAAAogAAAJ8AAACdAAAAmwAAAJkAAACXAAAAlQAAAJIAAACQ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AAAAEAAAABIAAAAUAAAAFgAAABgAAAAcAAAAIAAAACgAAAAwAAAAQAAAAIAAAAAAAQAAAAIAAAAEAAAACAAAABAAAAAgAAAAQAAAAIAAAAAAAQBBsLIBC9YEAQAAAAEAAAABAAAAAQAAAAIAAAACAAAAAwAAAAMAAAAEAAAABgAAAAcAAAAIAAAACQAAAAoAAAALAAAADAAAAA0AAAAOAAAADwAAABAAAAABAAEBBgAAAAAAAAQAAAAAEAAABAAAAAAgAAAFAQAAAAAAAAUDAAAAAAAABQQAAAAAAAAFBgAAAAAAAAUHAAAAAAAABQkAAAAAAAAFCgAAAAAAAAUMAAAAAAAABg4AAAAAAAEFEAAAAAAAAQUUAAAAAAABBRYAAAAAAAIFHAAAAAAAAwUgAAAAAAAEBTAAAAAgAAYFQAAAAAAABwWAAAAAAAAIBgABAAAAAAoGAAQAAAAADAYAEAAAIAAABAAAAAAAAAAEAQAAAAAAAAUCAAAAIAAABQQAAAAAAAAFBQAAACAAAAUHAAAAAAAABQgAAAAgAAAFCgAAAAAAAAULAAAAAAAABg0AAAAgAAEFEAAAAAAAAQUSAAAAIAABBRYAAAAAAAIFGAAAACAAAwUgAAAAAAADBSgAAAAAAAYEQAAAABAABgRAAAAAIAAHBYAAAAAAAAkGAAIAAAAACwYACAAAMAAABAAAAAAQAAAEAQAAACAAAAUCAAAAIAAABQMAAAAgAAAFBQAAACAAAAUGAAAAIAAABQgAAAAgAAAFCQAAACAAAAULAAAAIAAABQwAAAAAAAAGDwAAACAAAQUSAAAAIAABBRQAAAAgAAIFGAAAACAAAgUcAAAAIAADBSgAAAAgAAQFMAAAAAAAEAYAAAEAAAAPBgCAAAAAAA4GAEAAAAAADQYAIABBlLcBC4MEAQAAAAEAAAAFAAAADQAAAB0AAAA9AAAAfQAAAP0AAAD9AQAA/QMAAP0HAAD9DwAA/R8AAP0/AAD9fwAA/f8AAP3/AQD9/wMA/f8HAP3/DwD9/x8A/f8/AP3/fwD9//8A/f//Af3//wP9//8H/f//D/3//x/9//8//f//fwAAAAABAAAAAgAAAAMAAAAEAAAABQAAAAYAAAAHAAAACAAAAAkAAAAKAAAACwAAAAwAAAANAAAADgAAAA8AAAAQAAAAEQAAABIAAAATAAAA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ZWN0b3J5IG5vdCBlbXB0eQBDb25uZWN0aW9uIHJlc2V0IGJ5IHBlZXIAT3BlcmF0aW9uIHRpbWVkIG91dABDb25uZWN0aW9uIHJlZnVzZWQASG9zdCBpcyBkb3duAEhvc3QgaXMgdW5yZWFjaGFibGUAQWRkcmVzcyBpbiB1c2UAQnJva2VuIHBpcGUASS9PIGVycm9yAE5vIHN1Y2ggZGV2aWNlIG9yIGFkZHJlc3MAQmxvY2sgZGV2aWNlIHJlcXVpcmVkAE5vIHN1Y2ggZGV2aWNlAE5vdCBhIGRpcmVjdG9yeQBJcyBhIGRpcmVjdG9yeQBUZXh0IGZpbGUgYnVzeQBFeGVjIGZvcm1hdCBlcnJvcgBJbnZhbGlkIGFyZ3VtZW50AEFyZ3VtZW50IGxpc3QgdG9vIGxvbmcAU3ltYm9saWMgbGluayBsb29wAEZpbGVuYW1lIHRvbyBsb25nAFRvbyBtYW55IG9wZW4gZmlsZXMgaW4gc3lzdGVtAE5vIGZpbGUgZGVzY3JpcHRvcnMgYXZhaWxhYmxlAEJhZCBmaWxlIGRlc2NyaXB0b3IATm8gY2hpbGQgcHJvY2VzcwBCYWQgYWRkcmVzcwBGaWxlIHRvbyBsYXJnZQBUb28gbWFueSBsaW5rcwBObyBsb2NrcyBhdmFpbGFibGUAUmVzb3VyY2UgZGVhZGxvY2sgd291bGQgb2NjdXIAU3RhdGUgbm90IHJlY292ZXJhYmxlAFByZXZpb3VzIG93bmVyIGRpZWQAT3BlcmF0aW9uIGNhbmNlbGVkAEZ1bmN0aW9uIG5vdCBpbXBsZW1lbnRlZABObyBtZXNzYWdlIG9mIGRlc2lyZWQgdHlwZQBJZGVudGlmaWVyIHJlbW92ZWQARGV2aWNlIG5vdCBhIHN0cmVhbQBObyBkYXRhIGF2YWlsYWJsZQBEZXZpY2UgdGltZW91dABPdXQgb2Ygc3RyZWFtcyByZXNvdXJjZXMATGluayBoYXMgYmVlbiBzZXZlcmVkAFByb3RvY29sIGVycm9yAEJhZCBtZXNzYWdlAEZpbGUgZGVzY3JpcHRvciBpbiBiYWQgc3RhdGUATm90IGEgc29ja2V0AERlc3RpbmF0aW9uIGFkZHJlc3MgcmVxdWlyZWQATWVzc2FnZSB0b28gbGFyZ2UAUHJvdG9jb2wg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PgBzdGQ6OndzdHJpbmcAc3RkOjp1MTZzdHJpbmcAc3RkOjp1MzJzdHJpbmcAZW1zY3JpcHRlbjo6dmFsAGVtc2NyaXB0ZW46Om1lbW9yeV92aWV3PGNoYXI+AGVtc2NyaXB0ZW46Om1lbW9yeV92aWV3PHNpZ25lZCBjaGFyPgBlbXNjcmlwdGVuOjptZW1vcnlfdmlldzx1bnNpZ25lZCBjaGFyPgBlbXNjcmlwdGVuOjptZW1vcnlfdmlldzxzaG9ydD4AZW1zY3JpcHRlbjo6bWVtb3J5X3ZpZXc8dW5zaWduZWQgc2hvcnQ+AGVtc2NyaXB0ZW46Om1lbW9yeV92aWV3PGludD4AZW1zY3JpcHRlbjo6bWVtb3J5X3ZpZXc8dW5zaWduZWQgaW50PgBlbXNjcmlwdGVuOjptZW1vcnlfdmlldzxsb25nPgBlbXNjcmlwdGVuOjptZW1vcnlfdmlldzx1bnNpZ25lZCBsb25nPgBlbXNjcmlwdGVuOjptZW1vcnlfdmlldzxpbnQ4X3Q+AGVtc2NyaXB0ZW46Om1lbW9yeV92aWV3PHVpbnQ4X3Q+AGVtc2NyaXB0ZW46Om1lbW9yeV92aWV3PGludDE2X3Q+AGVtc2NyaXB0ZW46Om1lbW9yeV92aWV3PHVpbnQxNl90PgBlbXNjcmlwdGVuOjptZW1vcnlfdmlldzxpbnQzMl90PgBlbXNjcmlwdGVuOjptZW1vcnlfdmlldzx1aW50MzJfdD4AZW1zY3JpcHRlbjo6bWVtb3J5X3ZpZXc8ZmxvYXQ+AGVtc2NyaXB0ZW46Om1lbW9yeV92aWV3PGRvdWJsZT4ADG4AAKRxAABOMTBlbXNjcmlwdGVuMTFtZW1vcnlfdmlld0lkRUUAAAxuAADMcQAATjEwZW1zY3JpcHRlbjExbWVtb3J5X3ZpZXdJZkVFAAAMbgAA9HEAAE4xMGVtc2NyaXB0ZW4xMW1lbW9yeV92aWV3SW1FRQAADG4AABxyAABOMTBlbXNjcmlwdGVuMTFtZW1vcnlfdmlld0lsRUUAAAxuAABEcgAATjEwZW1zY3JpcHRlbjExbWVtb3J5X3ZpZXdJakVFAAAMbgAAbHIAAE4xMGVtc2NyaXB0ZW4xMW1lbW9yeV92aWV3SWlFRQAADG4AAJRyAABOMTBlbXNjcmlwdGVuMTFtZW1vcnlfdmlld0l0RUUAAAxuAAC8cgAATjEwZW1zY3JpcHRlbjExbWVtb3J5X3ZpZXdJc0VFAAAMbgAA5HIAAE4xMGVtc2NyaXB0ZW4xMW1lbW9yeV92aWV3SWFFRQAADG4AAAxzAABOMTBlbXNjcmlwdGVuMTFtZW1vcnlfdmlld0ljRUUAADRuAABEcwAAAAAAAAEAAACIBwAAAAAAAE5TdDNfXzIxMmJhc2ljX3N0cmluZ0lEaU5TXzExY2hhcl90cmFpdHNJRGlFRU5TXzlhbGxvY2F0b3JJRGlFRUVFAAAANG4AAKBzAAAAAAAAAQAAAIgHAAAAAAAATlN0M19fMjEyYmFzaWNfc3RyaW5nSURzTlNfMTFjaGFyX3RyYWl0c0lEc0VFTlNfOWFsbG9jYXRvcklEc0VFRUUAAAA0bgAA/HMAAAAAAAABAAAAiAcAAAAAAABOU3QzX18yMTJiYXNpY19zdHJpbmdJd05TXzExY2hhcl90cmFpdHNJd0VFTlNfOWFsbG9jYXRvckl3RUVFRQAANG4AAFR0AAAAAAAAAQAAAIgHAAAAAAAATlN0M19fMjEyYmFzaWNfc3RyaW5nSWhOU18xMWNoYXJfdHJhaXRzSWhFRU5TXzlhbGxvY2F0b3JJaEVFRUUAAGh1AEGY6QELQYAtAAAAMgAAAQEAAB4BAAAPAAAAgCwAAAAtAAAAAAAAHgAAAA8AAAAAAAAAMCwAAAAAAAATAAAABwAAAAAAAAAFAEHk6QELATkAQfzpAQsKOgAAADsAAABsdgBBlOoBCwECAEGj6gELBf//////AEHo6gELAQUAQfTqAQsBVABBjOsBCw46AAAAVQAAAJh6AAAABABBpOsBCwEBAEGz6wELBQr/////`;

var BloscShuffle;
(function (BloscShuffle) {
    BloscShuffle[BloscShuffle["NOSHUFFLE"] = 0] = "NOSHUFFLE";
    BloscShuffle[BloscShuffle["SHUFFLE"] = 1] = "SHUFFLE";
    BloscShuffle[BloscShuffle["BITSHUFFLE"] = 2] = "BITSHUFFLE";
    BloscShuffle[BloscShuffle["AUTOSHUFFLE"] = -1] = "AUTOSHUFFLE";
})(BloscShuffle || (BloscShuffle = {}));
const COMPRESSORS = new Set([
    'blosclz',
    'lz4',
    'lz4hc',
    'snappy',
    'zlib',
    'zstd',
]);
let emscriptenModule;
let Blosc = /** @class */ (() => {
    class Blosc {
        constructor(clevel = 5, cname = 'lz4', shuffle = BloscShuffle.SHUFFLE, blocksize = 0) {
            if (clevel < 0 || clevel > 9) {
                throw new Error(`Invalid compression level: '${clevel}'. It should be between 0 and 9`);
            }
            if (!COMPRESSORS.has(cname)) {
                throw new Error(`Invalid compressor '${cname}'. Valid compressors include
        'blosclz', 'lz4', 'lz4hc','snappy', 'zlib', 'zstd'.`);
            }
            if (shuffle < -1 || shuffle > 2) {
                throw new Error(`Invalid shuffle ${shuffle}. Must be one of 0 (NOSHUFFLE),
        1 (SHUFFLE), 2 (BITSHUFFLE), -1 (AUTOSHUFFLE).`);
            }
            this.blocksize = blocksize;
            this.clevel = clevel;
            this.cname = cname;
            this.shuffle = shuffle;
        }
        static fromConfig({ blocksize, clevel, cname, shuffle, }) {
            return new Blosc(clevel, cname, shuffle, blocksize);
        }
        async encode(data) {
            if (!emscriptenModule) {
                emscriptenModule = initEmscriptenModule(blosc_codec, wasmBase64);
            }
            const module = await emscriptenModule;
            const view = module.compress(data, this.cname, this.clevel, this.shuffle, this.blocksize);
            const result = new Uint8Array(view); // Copy view and free wasm memory
            module.free_result();
            return result;
        }
        async decode(data, out) {
            if (!emscriptenModule) {
                emscriptenModule = initEmscriptenModule(blosc_codec, wasmBase64);
            }
            const module = await emscriptenModule;
            const view = module.decompress(data);
            const result = new Uint8Array(view); // Copy view and free wasm memory
            module.free_result();
            if (out !== undefined) {
                out.set(result);
                return out;
            }
            return result;
        }
    }
    Blosc.codecId = 'blosc';
    Blosc.COMPRESSORS = [...COMPRESSORS];
    Blosc.NOSHUFFLE = BloscShuffle.NOSHUFFLE;
    Blosc.SHUFFLE = BloscShuffle.SHUFFLE;
    Blosc.BITSHUFFLE = BloscShuffle.BITSHUFFLE;
    Blosc.AUTOSHUFFLE = BloscShuffle.AUTOSHUFFLE;
    return Blosc;
})();

const registry = new Map()
    .set(Zlib.codecId, Zlib)
    .set(GZip.codecId, GZip)
    .set(Blosc.codecId, Blosc);
function getCodec(config) {
    if (!registry.has(config.id)) {
        throw new Error(`Compression codec ${config.id} is not supported by Zarr.js yet.`);
    }
    const codec = registry.get(config.id);
    return codec.fromConfig(config);
}

var eventemitter3 = createCommonjsModule(function (module) {

var has = Object.prototype.hasOwnProperty
  , prefix = '~';

/**
 * Constructor to create a storage for our `EE` objects.
 * An `Events` instance is a plain object whose properties are event names.
 *
 * @constructor
 * @private
 */
function Events() {}

//
// We try to not inherit from `Object.prototype`. In some engines creating an
// instance in this way is faster than calling `Object.create(null)` directly.
// If `Object.create(null)` is not supported we prefix the event names with a
// character to make sure that the built-in object properties are not
// overridden or used as an attack vector.
//
if (Object.create) {
  Events.prototype = Object.create(null);

  //
  // This hack is needed because the `__proto__` property is still inherited in
  // some old browsers like Android 4, iPhone 5.1, Opera 11 and Safari 5.
  //
  if (!new Events().__proto__) prefix = false;
}

/**
 * Representation of a single event listener.
 *
 * @param {Function} fn The listener function.
 * @param {*} context The context to invoke the listener with.
 * @param {Boolean} [once=false] Specify if the listener is a one-time listener.
 * @constructor
 * @private
 */
function EE(fn, context, once) {
  this.fn = fn;
  this.context = context;
  this.once = once || false;
}

/**
 * Add a listener for a given event.
 *
 * @param {EventEmitter} emitter Reference to the `EventEmitter` instance.
 * @param {(String|Symbol)} event The event name.
 * @param {Function} fn The listener function.
 * @param {*} context The context to invoke the listener with.
 * @param {Boolean} once Specify if the listener is a one-time listener.
 * @returns {EventEmitter}
 * @private
 */
function addListener(emitter, event, fn, context, once) {
  if (typeof fn !== 'function') {
    throw new TypeError('The listener must be a function');
  }

  var listener = new EE(fn, context || emitter, once)
    , evt = prefix ? prefix + event : event;

  if (!emitter._events[evt]) emitter._events[evt] = listener, emitter._eventsCount++;
  else if (!emitter._events[evt].fn) emitter._events[evt].push(listener);
  else emitter._events[evt] = [emitter._events[evt], listener];

  return emitter;
}

/**
 * Clear event by name.
 *
 * @param {EventEmitter} emitter Reference to the `EventEmitter` instance.
 * @param {(String|Symbol)} evt The Event name.
 * @private
 */
function clearEvent(emitter, evt) {
  if (--emitter._eventsCount === 0) emitter._events = new Events();
  else delete emitter._events[evt];
}

/**
 * Minimal `EventEmitter` interface that is molded against the Node.js
 * `EventEmitter` interface.
 *
 * @constructor
 * @public
 */
function EventEmitter() {
  this._events = new Events();
  this._eventsCount = 0;
}

/**
 * Return an array listing the events for which the emitter has registered
 * listeners.
 *
 * @returns {Array}
 * @public
 */
EventEmitter.prototype.eventNames = function eventNames() {
  var names = []
    , events
    , name;

  if (this._eventsCount === 0) return names;

  for (name in (events = this._events)) {
    if (has.call(events, name)) names.push(prefix ? name.slice(1) : name);
  }

  if (Object.getOwnPropertySymbols) {
    return names.concat(Object.getOwnPropertySymbols(events));
  }

  return names;
};

/**
 * Return the listeners registered for a given event.
 *
 * @param {(String|Symbol)} event The event name.
 * @returns {Array} The registered listeners.
 * @public
 */
EventEmitter.prototype.listeners = function listeners(event) {
  var evt = prefix ? prefix + event : event
    , handlers = this._events[evt];

  if (!handlers) return [];
  if (handlers.fn) return [handlers.fn];

  for (var i = 0, l = handlers.length, ee = new Array(l); i < l; i++) {
    ee[i] = handlers[i].fn;
  }

  return ee;
};

/**
 * Return the number of listeners listening to a given event.
 *
 * @param {(String|Symbol)} event The event name.
 * @returns {Number} The number of listeners.
 * @public
 */
EventEmitter.prototype.listenerCount = function listenerCount(event) {
  var evt = prefix ? prefix + event : event
    , listeners = this._events[evt];

  if (!listeners) return 0;
  if (listeners.fn) return 1;
  return listeners.length;
};

/**
 * Calls each of the listeners registered for a given event.
 *
 * @param {(String|Symbol)} event The event name.
 * @returns {Boolean} `true` if the event had listeners, else `false`.
 * @public
 */
EventEmitter.prototype.emit = function emit(event, a1, a2, a3, a4, a5) {
  var evt = prefix ? prefix + event : event;

  if (!this._events[evt]) return false;

  var listeners = this._events[evt]
    , len = arguments.length
    , args
    , i;

  if (listeners.fn) {
    if (listeners.once) this.removeListener(event, listeners.fn, undefined, true);

    switch (len) {
      case 1: return listeners.fn.call(listeners.context), true;
      case 2: return listeners.fn.call(listeners.context, a1), true;
      case 3: return listeners.fn.call(listeners.context, a1, a2), true;
      case 4: return listeners.fn.call(listeners.context, a1, a2, a3), true;
      case 5: return listeners.fn.call(listeners.context, a1, a2, a3, a4), true;
      case 6: return listeners.fn.call(listeners.context, a1, a2, a3, a4, a5), true;
    }

    for (i = 1, args = new Array(len -1); i < len; i++) {
      args[i - 1] = arguments[i];
    }

    listeners.fn.apply(listeners.context, args);
  } else {
    var length = listeners.length
      , j;

    for (i = 0; i < length; i++) {
      if (listeners[i].once) this.removeListener(event, listeners[i].fn, undefined, true);

      switch (len) {
        case 1: listeners[i].fn.call(listeners[i].context); break;
        case 2: listeners[i].fn.call(listeners[i].context, a1); break;
        case 3: listeners[i].fn.call(listeners[i].context, a1, a2); break;
        case 4: listeners[i].fn.call(listeners[i].context, a1, a2, a3); break;
        default:
          if (!args) for (j = 1, args = new Array(len -1); j < len; j++) {
            args[j - 1] = arguments[j];
          }

          listeners[i].fn.apply(listeners[i].context, args);
      }
    }
  }

  return true;
};

/**
 * Add a listener for a given event.
 *
 * @param {(String|Symbol)} event The event name.
 * @param {Function} fn The listener function.
 * @param {*} [context=this] The context to invoke the listener with.
 * @returns {EventEmitter} `this`.
 * @public
 */
EventEmitter.prototype.on = function on(event, fn, context) {
  return addListener(this, event, fn, context, false);
};

/**
 * Add a one-time listener for a given event.
 *
 * @param {(String|Symbol)} event The event name.
 * @param {Function} fn The listener function.
 * @param {*} [context=this] The context to invoke the listener with.
 * @returns {EventEmitter} `this`.
 * @public
 */
EventEmitter.prototype.once = function once(event, fn, context) {
  return addListener(this, event, fn, context, true);
};

/**
 * Remove the listeners of a given event.
 *
 * @param {(String|Symbol)} event The event name.
 * @param {Function} fn Only remove the listeners that match this function.
 * @param {*} context Only remove the listeners that have this context.
 * @param {Boolean} once Only remove one-time listeners.
 * @returns {EventEmitter} `this`.
 * @public
 */
EventEmitter.prototype.removeListener = function removeListener(event, fn, context, once) {
  var evt = prefix ? prefix + event : event;

  if (!this._events[evt]) return this;
  if (!fn) {
    clearEvent(this, evt);
    return this;
  }

  var listeners = this._events[evt];

  if (listeners.fn) {
    if (
      listeners.fn === fn &&
      (!once || listeners.once) &&
      (!context || listeners.context === context)
    ) {
      clearEvent(this, evt);
    }
  } else {
    for (var i = 0, events = [], length = listeners.length; i < length; i++) {
      if (
        listeners[i].fn !== fn ||
        (once && !listeners[i].once) ||
        (context && listeners[i].context !== context)
      ) {
        events.push(listeners[i]);
      }
    }

    //
    // Reset the array, or remove it completely if we have no more listeners.
    //
    if (events.length) this._events[evt] = events.length === 1 ? events[0] : events;
    else clearEvent(this, evt);
  }

  return this;
};

/**
 * Remove all listeners, or those of the specified event.
 *
 * @param {(String|Symbol)} [event] The event name.
 * @returns {EventEmitter} `this`.
 * @public
 */
EventEmitter.prototype.removeAllListeners = function removeAllListeners(event) {
  var evt;

  if (event) {
    evt = prefix ? prefix + event : event;
    if (this._events[evt]) clearEvent(this, evt);
  } else {
    this._events = new Events();
    this._eventsCount = 0;
  }

  return this;
};

//
// Alias methods names because people roll like that.
//
EventEmitter.prototype.off = EventEmitter.prototype.removeListener;
EventEmitter.prototype.addListener = EventEmitter.prototype.on;

//
// Expose the prefix.
//
EventEmitter.prefixed = prefix;

//
// Allow `EventEmitter` to be imported as module namespace.
//
EventEmitter.EventEmitter = EventEmitter;

//
// Expose the module.
//
{
  module.exports = EventEmitter;
}
});

var pFinally = (promise, onFinally) => {
	onFinally = onFinally || (() => {});

	return promise.then(
		val => new Promise(resolve => {
			resolve(onFinally());
		}).then(() => val),
		err => new Promise(resolve => {
			resolve(onFinally());
		}).then(() => {
			throw err;
		})
	);
};

class TimeoutError extends Error {
	constructor(message) {
		super(message);
		this.name = 'TimeoutError';
	}
}

const pTimeout = (promise, milliseconds, fallback) => new Promise((resolve, reject) => {
	if (typeof milliseconds !== 'number' || milliseconds < 0) {
		throw new TypeError('Expected `milliseconds` to be a positive number');
	}

	if (milliseconds === Infinity) {
		resolve(promise);
		return;
	}

	const timer = setTimeout(() => {
		if (typeof fallback === 'function') {
			try {
				resolve(fallback());
			} catch (error) {
				reject(error);
			}

			return;
		}

		const message = typeof fallback === 'string' ? fallback : `Promise timed out after ${milliseconds} milliseconds`;
		const timeoutError = fallback instanceof Error ? fallback : new TimeoutError(message);

		if (typeof promise.cancel === 'function') {
			promise.cancel();
		}

		reject(timeoutError);
	}, milliseconds);

	// TODO: Use native `finally` keyword when targeting Node.js 10
	pFinally(
		// eslint-disable-next-line promise/prefer-await-to-then
		promise.then(resolve, reject),
		() => {
			clearTimeout(timer);
		}
	);
});

var pTimeout_1 = pTimeout;
// TODO: Remove this for the next major release
var default_1 = pTimeout;

var TimeoutError_1 = TimeoutError;
pTimeout_1.default = default_1;
pTimeout_1.TimeoutError = TimeoutError_1;

var lowerBound_1 = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });
// Port of lower_bound from http://en.cppreference.com/w/cpp/algorithm/lower_bound
// Used to compute insertion index to keep queue sorted after insertion
function lowerBound(array, value, comparator) {
    let first = 0;
    let count = array.length;
    while (count > 0) {
        const step = (count / 2) | 0;
        let it = first + step;
        if (comparator(array[it], value) <= 0) {
            first = ++it;
            count -= step + 1;
        }
        else {
            count = step;
        }
    }
    return first;
}
exports.default = lowerBound;
});

unwrapExports(lowerBound_1);

var priorityQueue = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });

class PriorityQueue {
    constructor() {
        this._queue = [];
    }
    enqueue(run, options) {
        options = Object.assign({ priority: 0 }, options);
        const element = {
            priority: options.priority,
            run
        };
        if (this.size && this._queue[this.size - 1].priority >= options.priority) {
            this._queue.push(element);
            return;
        }
        const index = lowerBound_1.default(this._queue, element, (a, b) => b.priority - a.priority);
        this._queue.splice(index, 0, element);
    }
    dequeue() {
        const item = this._queue.shift();
        return item && item.run;
    }
    get size() {
        return this._queue.length;
    }
}
exports.default = PriorityQueue;
});

unwrapExports(priorityQueue);

var dist$1 = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });



const empty = () => { };
const timeoutError = new pTimeout_1.default.TimeoutError();
/**
Promise queue with concurrency control.
*/
class PQueue extends eventemitter3 {
    constructor(options) {
        super();
        this._intervalCount = 0;
        this._intervalEnd = 0;
        this._pendingCount = 0;
        this._resolveEmpty = empty;
        this._resolveIdle = empty;
        // eslint-disable-next-line @typescript-eslint/no-object-literal-type-assertion
        options = Object.assign({ carryoverConcurrencyCount: false, intervalCap: Infinity, interval: 0, concurrency: Infinity, autoStart: true, queueClass: priorityQueue.default }, options
        // TODO: Remove this `as`.
        );
        if (!(typeof options.intervalCap === 'number' && options.intervalCap >= 1)) {
            throw new TypeError(`Expected \`intervalCap\` to be a number from 1 and up, got \`${options.intervalCap}\` (${typeof options.intervalCap})`);
        }
        if (options.interval === undefined || !(Number.isFinite(options.interval) && options.interval >= 0)) {
            throw new TypeError(`Expected \`interval\` to be a finite number >= 0, got \`${options.interval}\` (${typeof options.interval})`);
        }
        this._carryoverConcurrencyCount = options.carryoverConcurrencyCount;
        this._isIntervalIgnored = options.intervalCap === Infinity || options.interval === 0;
        this._intervalCap = options.intervalCap;
        this._interval = options.interval;
        this._queue = new options.queueClass();
        this._queueClass = options.queueClass;
        this.concurrency = options.concurrency;
        this._timeout = options.timeout;
        this._throwOnTimeout = options.throwOnTimeout === true;
        this._isPaused = options.autoStart === false;
    }
    get _doesIntervalAllowAnother() {
        return this._isIntervalIgnored || this._intervalCount < this._intervalCap;
    }
    get _doesConcurrentAllowAnother() {
        return this._pendingCount < this._concurrency;
    }
    _next() {
        this._pendingCount--;
        this._tryToStartAnother();
    }
    _resolvePromises() {
        this._resolveEmpty();
        this._resolveEmpty = empty;
        if (this._pendingCount === 0) {
            this._resolveIdle();
            this._resolveIdle = empty;
        }
    }
    _onResumeInterval() {
        this._onInterval();
        this._initializeIntervalIfNeeded();
        this._timeoutId = undefined;
    }
    _isIntervalPaused() {
        const now = Date.now();
        if (this._intervalId === undefined) {
            const delay = this._intervalEnd - now;
            if (delay < 0) {
                // Act as the interval was done
                // We don't need to resume it here because it will be resumed on line 160
                this._intervalCount = (this._carryoverConcurrencyCount) ? this._pendingCount : 0;
            }
            else {
                // Act as the interval is pending
                if (this._timeoutId === undefined) {
                    this._timeoutId = setTimeout(() => {
                        this._onResumeInterval();
                    }, delay);
                }
                return true;
            }
        }
        return false;
    }
    _tryToStartAnother() {
        if (this._queue.size === 0) {
            // We can clear the interval ("pause")
            // Because we can redo it later ("resume")
            if (this._intervalId) {
                clearInterval(this._intervalId);
            }
            this._intervalId = undefined;
            this._resolvePromises();
            return false;
        }
        if (!this._isPaused) {
            const canInitializeInterval = !this._isIntervalPaused();
            if (this._doesIntervalAllowAnother && this._doesConcurrentAllowAnother) {
                this.emit('active');
                this._queue.dequeue()();
                if (canInitializeInterval) {
                    this._initializeIntervalIfNeeded();
                }
                return true;
            }
        }
        return false;
    }
    _initializeIntervalIfNeeded() {
        if (this._isIntervalIgnored || this._intervalId !== undefined) {
            return;
        }
        this._intervalId = setInterval(() => {
            this._onInterval();
        }, this._interval);
        this._intervalEnd = Date.now() + this._interval;
    }
    _onInterval() {
        if (this._intervalCount === 0 && this._pendingCount === 0 && this._intervalId) {
            clearInterval(this._intervalId);
            this._intervalId = undefined;
        }
        this._intervalCount = this._carryoverConcurrencyCount ? this._pendingCount : 0;
        this._processQueue();
    }
    /**
    Executes all queued functions until it reaches the limit.
    */
    _processQueue() {
        // eslint-disable-next-line no-empty
        while (this._tryToStartAnother()) { }
    }
    get concurrency() {
        return this._concurrency;
    }
    set concurrency(newConcurrency) {
        if (!(typeof newConcurrency === 'number' && newConcurrency >= 1)) {
            throw new TypeError(`Expected \`concurrency\` to be a number from 1 and up, got \`${newConcurrency}\` (${typeof newConcurrency})`);
        }
        this._concurrency = newConcurrency;
        this._processQueue();
    }
    /**
    Adds a sync or async task to the queue. Always returns a promise.
    */
    async add(fn, options = {}) {
        return new Promise((resolve, reject) => {
            const run = async () => {
                this._pendingCount++;
                this._intervalCount++;
                try {
                    const operation = (this._timeout === undefined && options.timeout === undefined) ? fn() : pTimeout_1.default(Promise.resolve(fn()), (options.timeout === undefined ? this._timeout : options.timeout), () => {
                        if (options.throwOnTimeout === undefined ? this._throwOnTimeout : options.throwOnTimeout) {
                            reject(timeoutError);
                        }
                        return undefined;
                    });
                    resolve(await operation);
                }
                catch (error) {
                    reject(error);
                }
                this._next();
            };
            this._queue.enqueue(run, options);
            this._tryToStartAnother();
        });
    }
    /**
    Same as `.add()`, but accepts an array of sync or async functions.

    @returns A promise that resolves when all functions are resolved.
    */
    async addAll(functions, options) {
        return Promise.all(functions.map(async (function_) => this.add(function_, options)));
    }
    /**
    Start (or resume) executing enqueued tasks within concurrency limit. No need to call this if queue is not paused (via `options.autoStart = false` or by `.pause()` method.)
    */
    start() {
        if (!this._isPaused) {
            return this;
        }
        this._isPaused = false;
        this._processQueue();
        return this;
    }
    /**
    Put queue execution on hold.
    */
    pause() {
        this._isPaused = true;
    }
    /**
    Clear the queue.
    */
    clear() {
        this._queue = new this._queueClass();
    }
    /**
    Can be called multiple times. Useful if you for example add additional items at a later time.

    @returns A promise that settles when the queue becomes empty.
    */
    async onEmpty() {
        // Instantly resolve if the queue is empty
        if (this._queue.size === 0) {
            return;
        }
        return new Promise(resolve => {
            const existingResolve = this._resolveEmpty;
            this._resolveEmpty = () => {
                existingResolve();
                resolve();
            };
        });
    }
    /**
    The difference with `.onEmpty` is that `.onIdle` guarantees that all work from the queue has finished. `.onEmpty` merely signals that the queue is empty, but it could mean that some promises haven't completed yet.

    @returns A promise that settles when the queue becomes empty, and all promises have completed; `queue.size === 0 && queue.pending === 0`.
    */
    async onIdle() {
        // Instantly resolve if none pending and if nothing else is queued
        if (this._pendingCount === 0 && this._queue.size === 0) {
            return;
        }
        return new Promise(resolve => {
            const existingResolve = this._resolveIdle;
            this._resolveIdle = () => {
                existingResolve();
                resolve();
            };
        });
    }
    /**
    Size of the queue.
    */
    get size() {
        return this._queue.size;
    }
    /**
    Number of pending promises.
    */
    get pending() {
        return this._pendingCount;
    }
    /**
    Whether the queue is currently paused.
    */
    get isPaused() {
        return this._isPaused;
    }
    /**
    Set the timeout for future operations.
    */
    set timeout(milliseconds) {
        this._timeout = milliseconds;
    }
    get timeout() {
        return this._timeout;
    }
}
exports.default = PQueue;
});

var PQueue = unwrapExports(dist$1);

class ZarrArray {
    /**
     * Instantiate an array from an initialized store.
     * @param store Array store, already initialized.
     * @param path Storage path.
     * @param metadata The initial value for the metadata
     * @param readOnly True if array should be protected against modification.
     * @param chunkStore Separate storage for chunks. If not provided, `store` will be used for storage of both chunks and metadata.
     * @param cacheMetadata If true (default), array configuration metadata will be cached for the lifetime of the object.
     * If false, array metadata will be reloaded prior to all data access and modification operations (may incur overhead depending on storage and data access pattern).
     * @param cacheAttrs If true (default), user attributes will be cached for attribute read operations.
     * If false, user attributes are reloaded from the store prior to all attribute read operations.
     */
    constructor(store, path = null, metadata, readOnly = false, chunkStore = null, cacheMetadata = true, cacheAttrs = true) {
        // N.B., expect at this point store is fully initialized with all
        // configuration metadata fully specified and normalized
        this.store = store;
        this._chunkStore = chunkStore;
        this.path = normalizeStoragePath(path);
        this.keyPrefix = pathToPrefix(this.path);
        this.readOnly = readOnly;
        this.cacheMetadata = cacheMetadata;
        this.cacheAttrs = cacheAttrs;
        this.meta = metadata;
        if (this.meta.compressor !== null) {
            this.compressor = getCodec(this.meta.compressor);
        }
        else {
            this.compressor = null;
        }
        const attrKey = this.keyPrefix + ATTRS_META_KEY;
        this.attrs = new Attributes(this.store, attrKey, this.readOnly, cacheAttrs);
    }
    /**
     * A `Store` providing the underlying storage for array chunks.
     */
    get chunkStore() {
        if (this._chunkStore) {
            return this._chunkStore;
        }
        return this.store;
    }
    /**
     * Array name following h5py convention.
     */
    get name() {
        if (this.path.length > 0) {
            if (this.path[0] !== "/") {
                return "/" + this.path;
            }
            return this.path;
        }
        return null;
    }
    /**
     * Final component of name.
     */
    get basename() {
        const name = this.name;
        if (name === null) {
            return null;
        }
        const parts = name.split("/");
        return parts[parts.length - 1];
    }
    /**
     * "A list of integers describing the length of each dimension of the array.
     */
    get shape() {
        // this.refreshMetadata();
        return this.meta.shape;
    }
    /**
     * A list of integers describing the length of each dimension of a chunk of the array.
     */
    get chunks() {
        return this.meta.chunks;
    }
    /**
     * Integer describing how many element a chunk contains
     */
    get chunkSize() {
        return this.chunks.reduce((x, y) => x * y, 1);
    }
    /**
     *  The NumPy data type.
     */
    get dtype() {
        return this.meta.dtype;
    }
    /**
     *  A value used for uninitialized portions of the array.
     */
    get fillValue() {
        const fillTypeValue = this.meta.fill_value;
        // TODO extract into function
        if (fillTypeValue === "NaN") {
            return NaN;
        }
        else if (fillTypeValue === "Infinity") {
            return Infinity;
        }
        else if (fillTypeValue === "-Infinity") {
            return -Infinity;
        }
        return this.meta.fill_value;
    }
    /**
     *  Number of dimensions.
     */
    get nDims() {
        return this.meta.shape.length;
    }
    /**
     *  The total number of elements in the array.
     */
    get size() {
        // this.refreshMetadata()
        return this.meta.shape.reduce((x, y) => x * y, 1);
    }
    get length() {
        return this.shape[0];
    }
    get _chunkDataShape() {
        if (this.shape === []) {
            return [1];
        }
        else {
            const s = [];
            for (let i = 0; i < this.shape.length; i++) {
                s[i] = Math.ceil(this.shape[i] / this.chunks[i]);
            }
            return s;
        }
    }
    /**
     * A tuple of integers describing the number of chunks along each
     * dimension of the array.
     */
    get chunkDataShape() {
        // this.refreshMetadata();
        return this._chunkDataShape;
    }
    /**
     * Total number of chunks.
     */
    get numChunks() {
        // this.refreshMetadata();
        return this.chunkDataShape.reduce((x, y) => x * y, 1);
    }
    /**
     * Instantiate an array from an initialized store.
     * @param store Array store, already initialized.
     * @param path Storage path.
     * @param readOnly True if array should be protected against modification.
     * @param chunkStore Separate storage for chunks. If not provided, `store` will be used for storage of both chunks and metadata.
     * @param cacheMetadata If true (default), array configuration metadata will be cached for the lifetime of the object.
     * If false, array metadata will be reloaded prior to all data access and modification operations (may incur overhead depending on storage and data access pattern).
     * @param cacheAttrs If true (default), user attributes will be cached for attribute read operations.
     * If false, user attributes are reloaded from the store prior to all attribute read operations.
     */
    static create(store, path = null, readOnly = false, chunkStore = null, cacheMetadata = true, cacheAttrs = true) {
        return __awaiter(this, void 0, void 0, function* () {
            const metadata = yield this.loadMetadataForConstructor(store, path);
            return new ZarrArray(store, path, metadata, readOnly, chunkStore, cacheMetadata, cacheAttrs);
        });
    }
    static loadMetadataForConstructor(store, path) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                path = normalizeStoragePath(path);
                const keyPrefix = pathToPrefix(path);
                const metaStoreValue = yield store.getItem(keyPrefix + ARRAY_META_KEY);
                return parseMetadata(metaStoreValue);
            }
            catch (error) {
                throw new Error("Failed to load metadata for ZarrArray:" + error.toString());
            }
        });
    }
    /**
     * (Re)load metadata from store
     */
    reloadMetadata() {
        return __awaiter(this, void 0, void 0, function* () {
            const metaKey = this.keyPrefix + ARRAY_META_KEY;
            const metaStoreValue = this.store.getItem(metaKey);
            this.meta = parseMetadata(yield metaStoreValue);
            return this.meta;
        });
    }
    refreshMetadata() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.cacheMetadata) {
                yield this.reloadMetadata();
            }
        });
    }
    get(selection = null, opts = {}) {
        return this.getBasicSelection(selection, false, opts);
    }
    getRaw(selection = null, opts = {}) {
        return this.getBasicSelection(selection, true, opts);
    }
    getBasicSelection(selection, asRaw = false, { concurrencyLimit = 10, progressCallback } = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            // Refresh metadata
            if (!this.cacheMetadata) {
                yield this.reloadMetadata();
            }
            // Check fields (TODO?)
            if (this.shape === []) {
                throw new Error("Shape [] indexing is not supported yet");
            }
            else {
                return this.getBasicSelectionND(selection, asRaw, concurrencyLimit, progressCallback);
            }
        });
    }
    getBasicSelectionND(selection, asRaw, concurrencyLimit, progressCallback) {
        const indexer = new BasicIndexer(selection, this);
        return this.getSelection(indexer, asRaw, concurrencyLimit, progressCallback);
    }
    getSelection(indexer, asRaw, concurrencyLimit, progressCallback) {
        return __awaiter(this, void 0, void 0, function* () {
            // We iterate over all chunks which overlap the selection and thus contain data
            // that needs to be extracted. Each chunk is processed in turn, extracting the
            // necessary data and storing into the correct location in the output array.
            // N.B., it is an important optimisation that we only visit chunks which overlap
            // the selection. This minimises the number of iterations in the main for loop.
            // check fields are sensible (TODO?)
            const outDtype = this.dtype;
            const outShape = indexer.shape;
            const outSize = indexer.shape.reduce((x, y) => x * y, 1);
            if (asRaw && (outSize === this.chunkSize)) {
                // Optimization: if output strided array _is_ chunk exactly,
                // decode directly as new TypedArray and return
                const itr = indexer.iter();
                const proj = itr.next(); // ensure there is only one projection
                if (proj.done === false && itr.next().done === true) {
                    const chunkProjection = proj.value;
                    const out = yield this.decodeDirectToRawArray(chunkProjection, outShape, outSize);
                    return out;
                }
            }
            const out = asRaw
                ? new RawArray(null, outShape, outDtype)
                : new NestedArray(null, outShape, outDtype);
            if (outSize === 0) {
                return out;
            }
            // create promise queue with concurrency control
            const queue = new PQueue({ concurrency: concurrencyLimit });
            if (progressCallback) {
                let progress = 0;
                let queueSize = 0;
                for (const _ of indexer.iter())
                    queueSize += 1;
                progressCallback({ progress: 0, queueSize: queueSize });
                for (const proj of indexer.iter()) {
                    (() => __awaiter(this, void 0, void 0, function* () {
                        yield queue.add(() => this.chunkGetItem(proj.chunkCoords, proj.chunkSelection, out, proj.outSelection, indexer.dropAxes));
                        progress += 1;
                        progressCallback({ progress: progress, queueSize: queueSize });
                    }))();
                }
            }
            else {
                for (const proj of indexer.iter()) {
                    queue.add(() => this.chunkGetItem(proj.chunkCoords, proj.chunkSelection, out, proj.outSelection, indexer.dropAxes));
                }
            }
            // guarantees that all work on queue has finished
            yield queue.onIdle();
            // Return scalar instead of zero-dimensional array.
            if (out.shape.length === 0) {
                return out.data[0];
            }
            return out;
        });
    }
    /**
     * Obtain part or whole of a chunk.
     * @param chunkCoords Indices of the chunk.
     * @param chunkSelection Location of region within the chunk to extract.
     * @param out Array to store result in.
     * @param outSelection Location of region within output array to store results in.
     * @param dropAxes Axes to squeeze out of the chunk.
     */
    chunkGetItem(chunkCoords, chunkSelection, out, outSelection, dropAxes) {
        return __awaiter(this, void 0, void 0, function* () {
            if (chunkCoords.length !== this._chunkDataShape.length) {
                throw new ValueError(`Inconsistent shapes: chunkCoordsLength: ${chunkCoords.length}, cDataShapeLength: ${this.chunkDataShape.length}`);
            }
            const cKey = this.chunkKey(chunkCoords);
            try {
                const cdata = yield this.chunkStore.getItem(cKey);
                const decodedChunk = yield this.decodeChunk(cdata);
                if (out instanceof NestedArray) {
                    if (isContiguousSelection(outSelection) && isTotalSlice(chunkSelection, this.chunks) && !this.meta.filters) {
                        // Optimization: we want the whole chunk, and the destination is
                        // contiguous, so we can decompress directly from the chunk
                        // into the destination array
                        // TODO check order
                        // TODO filters..
                        out.set(outSelection, this.toNestedArray(decodedChunk));
                        return;
                    }
                    // Decode chunk
                    const chunk = this.toNestedArray(decodedChunk);
                    const tmp = chunk.get(chunkSelection);
                    if (dropAxes !== null) {
                        throw new Error("Drop axes is not supported yet");
                    }
                    out.set(outSelection, tmp);
                }
                else {
                    /* RawArray
                    Copies chunk by index directly into output. Doesn't matter if selection is contiguous
                    since store/output are different shapes/strides.
                    */
                    out.set(outSelection, this.chunkBufferToRawArray(decodedChunk), chunkSelection);
                }
            }
            catch (error) {
                if (error instanceof KeyError) {
                    // fill with scalar if cKey doesn't exist in store
                    if (this.fillValue !== null) {
                        out.set(outSelection, this.fillValue);
                    }
                }
                else {
                    // Different type of error - rethrow
                    throw error;
                }
            }
        });
    }
    getRawChunk(chunkCoords) {
        return __awaiter(this, void 0, void 0, function* () {
            if (chunkCoords.length !== this.shape.length) {
                throw new Error(`Chunk coordinates ${chunkCoords.join(".")} do not correspond to shape ${this.shape}.`);
            }
            try {
                for (let i = 0; i < chunkCoords.length; i++) {
                    const dimLength = Math.ceil(this.shape[i] / this.chunks[i]);
                    chunkCoords[i] = normalizeIntegerSelection(chunkCoords[i], dimLength);
                }
            }
            catch (error) {
                if (error instanceof BoundsCheckError) {
                    throw new BoundsCheckError(`index ${chunkCoords.join(".")} is out of bounds for shape: ${this.shape} and chunks ${this.chunks}`);
                }
                else {
                    throw error;
                }
            }
            const cKey = this.chunkKey(chunkCoords);
            const cdata = this.chunkStore.getItem(cKey);
            const buffer = yield this.decodeChunk(yield cdata);
            const outShape = this.chunks.filter(d => d !== 1); // squeeze chunk dim if 1
            return new RawArray(buffer, outShape, this.dtype);
        });
    }
    chunkKey(chunkCoords) {
        return this.keyPrefix + chunkCoords.join(".");
    }
    ensureByteArray(chunkData) {
        if (typeof chunkData === "string") {
            return new Uint8Array(Buffer.from(chunkData).buffer);
        }
        return new Uint8Array(chunkData);
    }
    toTypedArray(buffer) {
        return new DTYPE_TYPEDARRAY_MAPPING[this.dtype](buffer);
    }
    toNestedArray(data) {
        const buffer = this.ensureByteArray(data).buffer;
        return new NestedArray(buffer, this.chunks, this.dtype);
    }
    decodeChunk(chunkData) {
        return __awaiter(this, void 0, void 0, function* () {
            let bytes = this.ensureByteArray(chunkData);
            if (this.compressor !== null) {
                bytes = yield this.compressor.decode(bytes);
            }
            if (this.dtype.includes('>')) {
                // Need to flip bytes for Javascript TypedArrays
                // We flip bytes in-place to avoid creating an extra copy of the decoded buffer.
                byteSwapInplace(this.toTypedArray(bytes.buffer));
            }
            // TODO filtering etc
            return bytes.buffer;
        });
    }
    chunkBufferToRawArray(buffer) {
        return new RawArray(buffer, this.chunks, this.dtype);
    }
    decodeDirectToRawArray({ chunkCoords }, outShape, outSize) {
        return __awaiter(this, void 0, void 0, function* () {
            const cKey = this.chunkKey(chunkCoords);
            try {
                const cdata = yield this.chunkStore.getItem(cKey);
                return new RawArray(yield this.decodeChunk(cdata), outShape, this.dtype);
            }
            catch (error) {
                if (error instanceof KeyError) {
                    // fill with scalar if item doesn't exist
                    const data = new DTYPE_TYPEDARRAY_MAPPING[this.dtype](outSize);
                    return new RawArray(data.fill(this.fillValue), outShape);
                }
                else {
                    // Different type of error - rethrow
                    throw error;
                }
            }
        });
    }
    set(selection = null, value, opts = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.setBasicSelection(selection, value, opts);
        });
    }
    setBasicSelection(selection, value, { concurrencyLimit = 10, progressCallback } = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.readOnly) {
                throw new PermissionError("Object is read only");
            }
            if (!this.cacheMetadata) {
                yield this.reloadMetadata();
            }
            if (this.shape === []) {
                throw new Error("Shape [] indexing is not supported yet");
            }
            else {
                yield this.setBasicSelectionND(selection, value, concurrencyLimit, progressCallback);
            }
        });
    }
    setBasicSelectionND(selection, value, concurrencyLimit, progressCallback) {
        return __awaiter(this, void 0, void 0, function* () {
            const indexer = new BasicIndexer(selection, this);
            yield this.setSelection(indexer, value, concurrencyLimit, progressCallback);
        });
    }
    getChunkValue(proj, indexer, value, selectionShape) {
        let chunkValue;
        if (selectionShape === []) {
            chunkValue = value;
        }
        else if (typeof value === "number") {
            chunkValue = value;
        }
        else {
            chunkValue = value.get(proj.outSelection);
            // tslint:disable-next-line: strict-type-predicates
            if (indexer.dropAxes !== null) {
                throw new Error("Handling drop axes not supported yet");
            }
        }
        return chunkValue;
    }
    setSelection(indexer, value, concurrencyLimit, progressCallback) {
        return __awaiter(this, void 0, void 0, function* () {
            // We iterate over all chunks which overlap the selection and thus contain data
            // that needs to be replaced. Each chunk is processed in turn, extracting the
            // necessary data from the value array and storing into the chunk array.
            // N.B., it is an important optimisation that we only visit chunks which overlap
            // the selection. This minimises the number of iterations in the main for loop.
            // TODO? check fields are sensible
            // Determine indices of chunks overlapping the selection
            const selectionShape = indexer.shape;
            // Check value shape
            if (selectionShape === []) ;
            else if (typeof value === "number") ;
            else if (value instanceof NestedArray) {
                // TODO: non stringify equality check
                if (!arrayEquals1D(value.shape, selectionShape)) {
                    throw new ValueError(`Shape mismatch in source NestedArray and set selection: ${value.shape} and ${selectionShape}`);
                }
            }
            else {
                // TODO support TypedArrays, buffers, etc
                throw new Error("Unknown data type for setting :(");
            }
            const queue = new PQueue({ concurrency: concurrencyLimit });
            if (progressCallback) {
                let queueSize = 0;
                for (const _ of indexer.iter())
                    queueSize += 1;
                let progress = 0;
                progressCallback({ progress: 0, queueSize: queueSize });
                for (const proj of indexer.iter()) {
                    const chunkValue = this.getChunkValue(proj, indexer, value, selectionShape);
                    (() => __awaiter(this, void 0, void 0, function* () {
                        yield queue.add(() => this.chunkSetItem(proj.chunkCoords, proj.chunkSelection, chunkValue));
                        progress += 1;
                        progressCallback({ progress: progress, queueSize: queueSize });
                    }))();
                }
            }
            else {
                for (const proj of indexer.iter()) {
                    const chunkValue = this.getChunkValue(proj, indexer, value, selectionShape);
                    queue.add(() => this.chunkSetItem(proj.chunkCoords, proj.chunkSelection, chunkValue));
                }
            }
            // guarantees that all work on queue has finished
            yield queue.onIdle();
        });
    }
    chunkSetItem(chunkCoords, chunkSelection, value) {
        return __awaiter(this, void 0, void 0, function* () {
            // Obtain key for chunk storage
            const chunkKey = this.chunkKey(chunkCoords);
            let chunk = null;
            const dtypeConstr = DTYPE_TYPEDARRAY_MAPPING[this.dtype];
            const chunkSize = this.chunkSize;
            if (isTotalSlice(chunkSelection, this.chunks)) {
                // Totally replace chunk
                // Optimization: we are completely replacing the chunk, so no need
                // to access the existing chunk data
                if (typeof value === "number") {
                    // TODO get the right type here
                    chunk = new dtypeConstr(chunkSize);
                    chunk.fill(value);
                }
                else {
                    chunk = value.flatten();
                }
            }
            else {
                // partially replace the contents of this chunk
                // Existing chunk data
                let chunkData;
                try {
                    // Chunk is initialized if this does not error
                    const chunkStoreData = yield this.chunkStore.getItem(chunkKey);
                    const dBytes = yield this.decodeChunk(chunkStoreData);
                    chunkData = this.toTypedArray(dBytes);
                }
                catch (error) {
                    if (error instanceof KeyError) {
                        // Chunk is not initialized
                        chunkData = new dtypeConstr(chunkSize);
                        if (this.fillValue !== null) {
                            chunkData.fill(this.fillValue);
                        }
                    }
                    else {
                        // Different type of error - rethrow
                        throw error;
                    }
                }
                const chunkNestedArray = new NestedArray(chunkData, this.chunks, this.dtype);
                chunkNestedArray.set(chunkSelection, value);
                chunk = chunkNestedArray.flatten();
            }
            const chunkData = yield this.encodeChunk(chunk);
            this.chunkStore.setItem(chunkKey, chunkData);
        });
    }
    encodeChunk(chunk) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.dtype.includes('>')) {
                /*
                 * If big endian, flip bytes before applying compression and setting store.
                 *
                 * Here we create a copy (not in-place byteswapping) to avoid flipping the
                 * bytes in the buffers of user-created Raw- and NestedArrays.
                */
                chunk = byteSwap(chunk);
            }
            if (this.compressor !== null) {
                const bytes = new Uint8Array(chunk.buffer);
                const cbytes = yield this.compressor.encode(bytes);
                return cbytes.buffer;
            }
            // TODO: filters, etc
            return chunk.buffer;
        });
    }
}

class MemoryStore {
    constructor(root = {}) {
        this.root = root;
    }
    proxy() {
        return createProxy(this);
    }
    getParent(item) {
        let parent = this.root;
        const segments = item.split('/');
        // find the parent container
        for (const k of segments.slice(0, segments.length - 1)) {
            parent = parent[k];
            if (!parent) {
                throw Error(item);
            }
            // if not isinstance(parent, self.cls):
            //     raise KeyError(item)
        }
        return [parent, segments[segments.length - 1]];
    }
    requireParent(item) {
        let parent = this.root;
        const segments = item.split('/');
        // require the parent container
        for (const k of segments.slice(0, segments.length - 1)) {
            // TODO: verify correct implementation
            if (parent[k] === undefined) {
                parent[k] = {};
            }
            parent = parent[k];
        }
        return [parent, segments[segments.length - 1]];
    }
    getItem(item) {
        const [parent, key] = this.getParent(item);
        const value = parent[key];
        if (value === undefined) {
            throw new KeyError(item);
        }
        return value;
    }
    setItem(item, value) {
        const [parent, key] = this.requireParent(item);
        parent[key] = value;
        return true;
    }
    deleteItem(item) {
        const [parent, key] = this.getParent(item);
        return delete parent[key];
    }
    containsItem(item) {
        // TODO: more sane implementation
        try {
            return this.getItem(item) !== undefined;
        }
        catch (_a) {
            return false;
        }
    }
    keys() {
        throw new Error("Method not implemented.");
    }
}

var HTTPMethod;
(function (HTTPMethod) {
    HTTPMethod["HEAD"] = "HEAD";
    HTTPMethod["GET"] = "GET";
    HTTPMethod["PUT"] = "PUT";
})(HTTPMethod || (HTTPMethod = {}));
const DEFAULT_METHODS = [HTTPMethod.HEAD, HTTPMethod.GET, HTTPMethod.PUT];
class HTTPStore {
    constructor(url, options = {}) {
        this.url = url;
        const { fetchOptions = {}, supportedMethods = DEFAULT_METHODS } = options;
        this.fetchOptions = fetchOptions;
        this.supportedMethods = new Set(supportedMethods);
    }
    keys() {
        throw new Error('Method not implemented.');
    }
    getItem(item) {
        return __awaiter(this, void 0, void 0, function* () {
            const url = joinUrlParts(this.url, item);
            const value = yield fetch(url, this.fetchOptions);
            if (value.status === 404) {
                // Item is not found
                throw new KeyError(item);
            }
            else if (value.status !== 200) {
                throw new HTTPError(String(value.status));
            }
            // only decode if 200
            if (IS_NODE) {
                return Buffer.from(yield value.arrayBuffer());
            }
            else {
                return value.arrayBuffer(); // Browser
            }
        });
    }
    setItem(item, value) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.supportedMethods.has(HTTPMethod.PUT)) {
                throw new Error('HTTP PUT no a supported method for store.');
            }
            const url = joinUrlParts(this.url, item);
            if (typeof value === 'string') {
                value = new TextEncoder().encode(value).buffer;
            }
            const set = yield fetch(url, Object.assign(Object.assign({}, this.fetchOptions), { method: HTTPMethod.PUT, body: value }));
            return set.status.toString()[0] === '2';
        });
    }
    deleteItem(_item) {
        throw new Error('Method not implemented.');
    }
    containsItem(item) {
        return __awaiter(this, void 0, void 0, function* () {
            const url = joinUrlParts(this.url, item);
            // Just check headers if HEAD method supported
            const method = this.supportedMethods.has(HTTPMethod.HEAD) ? HTTPMethod.HEAD : HTTPMethod.GET;
            const value = yield fetch(url, Object.assign(Object.assign({}, this.fetchOptions), { method }));
            return value.status === 200;
        });
    }
}
function openArray({ shape, mode = "a", chunks = true, dtype = "<i4", compressor = null, fillValue = null, order = "C", store, overwrite = false, path = null, chunkStore, filters, cacheMetadata = true, cacheAttrs = true } = {}) {
    return __awaiter(this, void 0, void 0, function* () {
        store = normalizeStoreArgument(store);
        if (chunkStore === undefined) {
            chunkStore = normalizeStoreArgument(store);
        }
        path = normalizeStoragePath(path);
        if (mode === "r" || mode === "r+") {
            if (yield containsGroup(store, path)) {
                throw new ContainsGroupError(path);
            }
            else if (!(yield containsArray(store, path))) {
                throw new ArrayNotFoundError(path);
            }
        }
        else if (mode === "w") {
            if (shape === undefined) {
                throw new ValueError("Shape can not be undefined when creating a new array");
            }
            yield initArray(store, shape, chunks, dtype, path, compressor, fillValue, order, overwrite, chunkStore, filters);
        }
        else if (mode === "a") {
            if (yield containsGroup(store, path)) {
                throw new ContainsGroupError(path);
            }
            else if (!(yield containsArray(store, path))) {
                if (shape === undefined) {
                    throw new ValueError("Shape can not be undefined when creating a new array");
                }
                yield initArray(store, shape, chunks, dtype, path, compressor, fillValue, order, overwrite, chunkStore, filters);
            }
        }
        else if (mode === "w-" || mode === "x") {
            if (yield containsArray(store, path)) {
                throw new ContainsArrayError(path);
            }
            else if (yield containsGroup(store, path)) {
                throw new ContainsGroupError(path);
            }
            else {
                if (shape === undefined) {
                    throw new ValueError("Shape can not be undefined when creating a new array");
                }
                yield initArray(store, shape, chunks, dtype, path, compressor, fillValue, order, overwrite, chunkStore, filters);
            }
        }
        else {
            throw new ValueError(`Invalid mode argument: ${mode}`);
        }
        const readOnly = mode === "r";
        return ZarrArray.create(store, path, readOnly, chunkStore, cacheMetadata, cacheAttrs);
    });
}
function normalizeStoreArgument(store) {
    if (store === undefined) {
        return new MemoryStore();
    }
    else if (typeof store === "string") {
        return new HTTPStore(store);
    }
    return store;
}

export { BoundsCheckError as B, HTTPError as H, KeyError as K, HTTPStore as a, openArray as o };
