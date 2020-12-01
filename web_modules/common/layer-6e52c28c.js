import { c as createCommonjsModule, a as commonjsGlobal } from './_commonjsHelpers-37fa8da4.js';
import { p as process } from './process-2545f00a.js';
import { _ as _typeof } from './typeof-c65245d2.js';
import { _ as _defineProperty } from './defineProperty-1b0b77a2.js';
import { _ as _classCallCheck } from './classCallCheck-4eda545c.js';
import { _ as _createClass, a as _toConsumableArray, b as _assertThisInitialized } from './assertThisInitialized-87ceda02.js';
import { n as node } from './_node-resolve:empty-0f7f843d.js';
import { _ as _slicedToArray } from './slicedToArray-14e71088.js';

var runtime_1 = createCommonjsModule(function (module) {
/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

var runtime = (function (exports) {

  var Op = Object.prototype;
  var hasOwn = Op.hasOwnProperty;
  var undefined$1; // More compressible than void 0.
  var $Symbol = typeof Symbol === "function" ? Symbol : {};
  var iteratorSymbol = $Symbol.iterator || "@@iterator";
  var asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator";
  var toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag";

  function define(obj, key, value) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
    return obj[key];
  }
  try {
    // IE 8 has a broken Object.defineProperty that only works on DOM objects.
    define({}, "");
  } catch (err) {
    define = function(obj, key, value) {
      return obj[key] = value;
    };
  }

  function wrap(innerFn, outerFn, self, tryLocsList) {
    // If outerFn provided and outerFn.prototype is a Generator, then outerFn.prototype instanceof Generator.
    var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator;
    var generator = Object.create(protoGenerator.prototype);
    var context = new Context(tryLocsList || []);

    // The ._invoke method unifies the implementations of the .next,
    // .throw, and .return methods.
    generator._invoke = makeInvokeMethod(innerFn, self, context);

    return generator;
  }
  exports.wrap = wrap;

  // Try/catch helper to minimize deoptimizations. Returns a completion
  // record like context.tryEntries[i].completion. This interface could
  // have been (and was previously) designed to take a closure to be
  // invoked without arguments, but in all the cases we care about we
  // already have an existing method we want to call, so there's no need
  // to create a new function object. We can even get away with assuming
  // the method takes exactly one argument, since that happens to be true
  // in every case, so we don't have to touch the arguments object. The
  // only additional allocation required is the completion record, which
  // has a stable shape and so hopefully should be cheap to allocate.
  function tryCatch(fn, obj, arg) {
    try {
      return { type: "normal", arg: fn.call(obj, arg) };
    } catch (err) {
      return { type: "throw", arg: err };
    }
  }

  var GenStateSuspendedStart = "suspendedStart";
  var GenStateSuspendedYield = "suspendedYield";
  var GenStateExecuting = "executing";
  var GenStateCompleted = "completed";

  // Returning this object from the innerFn has the same effect as
  // breaking out of the dispatch switch statement.
  var ContinueSentinel = {};

  // Dummy constructor functions that we use as the .constructor and
  // .constructor.prototype properties for functions that return Generator
  // objects. For full spec compliance, you may wish to configure your
  // minifier not to mangle the names of these two functions.
  function Generator() {}
  function GeneratorFunction() {}
  function GeneratorFunctionPrototype() {}

  // This is a polyfill for %IteratorPrototype% for environments that
  // don't natively support it.
  var IteratorPrototype = {};
  IteratorPrototype[iteratorSymbol] = function () {
    return this;
  };

  var getProto = Object.getPrototypeOf;
  var NativeIteratorPrototype = getProto && getProto(getProto(values([])));
  if (NativeIteratorPrototype &&
      NativeIteratorPrototype !== Op &&
      hasOwn.call(NativeIteratorPrototype, iteratorSymbol)) {
    // This environment has a native %IteratorPrototype%; use it instead
    // of the polyfill.
    IteratorPrototype = NativeIteratorPrototype;
  }

  var Gp = GeneratorFunctionPrototype.prototype =
    Generator.prototype = Object.create(IteratorPrototype);
  GeneratorFunction.prototype = Gp.constructor = GeneratorFunctionPrototype;
  GeneratorFunctionPrototype.constructor = GeneratorFunction;
  GeneratorFunction.displayName = define(
    GeneratorFunctionPrototype,
    toStringTagSymbol,
    "GeneratorFunction"
  );

  // Helper for defining the .next, .throw, and .return methods of the
  // Iterator interface in terms of a single ._invoke method.
  function defineIteratorMethods(prototype) {
    ["next", "throw", "return"].forEach(function(method) {
      define(prototype, method, function(arg) {
        return this._invoke(method, arg);
      });
    });
  }

  exports.isGeneratorFunction = function(genFun) {
    var ctor = typeof genFun === "function" && genFun.constructor;
    return ctor
      ? ctor === GeneratorFunction ||
        // For the native GeneratorFunction constructor, the best we can
        // do is to check its .name property.
        (ctor.displayName || ctor.name) === "GeneratorFunction"
      : false;
  };

  exports.mark = function(genFun) {
    if (Object.setPrototypeOf) {
      Object.setPrototypeOf(genFun, GeneratorFunctionPrototype);
    } else {
      genFun.__proto__ = GeneratorFunctionPrototype;
      define(genFun, toStringTagSymbol, "GeneratorFunction");
    }
    genFun.prototype = Object.create(Gp);
    return genFun;
  };

  // Within the body of any async function, `await x` is transformed to
  // `yield regeneratorRuntime.awrap(x)`, so that the runtime can test
  // `hasOwn.call(value, "__await")` to determine if the yielded value is
  // meant to be awaited.
  exports.awrap = function(arg) {
    return { __await: arg };
  };

  function AsyncIterator(generator, PromiseImpl) {
    function invoke(method, arg, resolve, reject) {
      var record = tryCatch(generator[method], generator, arg);
      if (record.type === "throw") {
        reject(record.arg);
      } else {
        var result = record.arg;
        var value = result.value;
        if (value &&
            typeof value === "object" &&
            hasOwn.call(value, "__await")) {
          return PromiseImpl.resolve(value.__await).then(function(value) {
            invoke("next", value, resolve, reject);
          }, function(err) {
            invoke("throw", err, resolve, reject);
          });
        }

        return PromiseImpl.resolve(value).then(function(unwrapped) {
          // When a yielded Promise is resolved, its final value becomes
          // the .value of the Promise<{value,done}> result for the
          // current iteration.
          result.value = unwrapped;
          resolve(result);
        }, function(error) {
          // If a rejected Promise was yielded, throw the rejection back
          // into the async generator function so it can be handled there.
          return invoke("throw", error, resolve, reject);
        });
      }
    }

    var previousPromise;

    function enqueue(method, arg) {
      function callInvokeWithMethodAndArg() {
        return new PromiseImpl(function(resolve, reject) {
          invoke(method, arg, resolve, reject);
        });
      }

      return previousPromise =
        // If enqueue has been called before, then we want to wait until
        // all previous Promises have been resolved before calling invoke,
        // so that results are always delivered in the correct order. If
        // enqueue has not been called before, then it is important to
        // call invoke immediately, without waiting on a callback to fire,
        // so that the async generator function has the opportunity to do
        // any necessary setup in a predictable way. This predictability
        // is why the Promise constructor synchronously invokes its
        // executor callback, and why async functions synchronously
        // execute code before the first await. Since we implement simple
        // async functions in terms of async generators, it is especially
        // important to get this right, even though it requires care.
        previousPromise ? previousPromise.then(
          callInvokeWithMethodAndArg,
          // Avoid propagating failures to Promises returned by later
          // invocations of the iterator.
          callInvokeWithMethodAndArg
        ) : callInvokeWithMethodAndArg();
    }

    // Define the unified helper method that is used to implement .next,
    // .throw, and .return (see defineIteratorMethods).
    this._invoke = enqueue;
  }

  defineIteratorMethods(AsyncIterator.prototype);
  AsyncIterator.prototype[asyncIteratorSymbol] = function () {
    return this;
  };
  exports.AsyncIterator = AsyncIterator;

  // Note that simple async functions are implemented on top of
  // AsyncIterator objects; they just return a Promise for the value of
  // the final result produced by the iterator.
  exports.async = function(innerFn, outerFn, self, tryLocsList, PromiseImpl) {
    if (PromiseImpl === void 0) PromiseImpl = Promise;

    var iter = new AsyncIterator(
      wrap(innerFn, outerFn, self, tryLocsList),
      PromiseImpl
    );

    return exports.isGeneratorFunction(outerFn)
      ? iter // If outerFn is a generator, return the full iterator.
      : iter.next().then(function(result) {
          return result.done ? result.value : iter.next();
        });
  };

  function makeInvokeMethod(innerFn, self, context) {
    var state = GenStateSuspendedStart;

    return function invoke(method, arg) {
      if (state === GenStateExecuting) {
        throw new Error("Generator is already running");
      }

      if (state === GenStateCompleted) {
        if (method === "throw") {
          throw arg;
        }

        // Be forgiving, per 25.3.3.3.3 of the spec:
        // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-generatorresume
        return doneResult();
      }

      context.method = method;
      context.arg = arg;

      while (true) {
        var delegate = context.delegate;
        if (delegate) {
          var delegateResult = maybeInvokeDelegate(delegate, context);
          if (delegateResult) {
            if (delegateResult === ContinueSentinel) continue;
            return delegateResult;
          }
        }

        if (context.method === "next") {
          // Setting context._sent for legacy support of Babel's
          // function.sent implementation.
          context.sent = context._sent = context.arg;

        } else if (context.method === "throw") {
          if (state === GenStateSuspendedStart) {
            state = GenStateCompleted;
            throw context.arg;
          }

          context.dispatchException(context.arg);

        } else if (context.method === "return") {
          context.abrupt("return", context.arg);
        }

        state = GenStateExecuting;

        var record = tryCatch(innerFn, self, context);
        if (record.type === "normal") {
          // If an exception is thrown from innerFn, we leave state ===
          // GenStateExecuting and loop back for another invocation.
          state = context.done
            ? GenStateCompleted
            : GenStateSuspendedYield;

          if (record.arg === ContinueSentinel) {
            continue;
          }

          return {
            value: record.arg,
            done: context.done
          };

        } else if (record.type === "throw") {
          state = GenStateCompleted;
          // Dispatch the exception by looping back around to the
          // context.dispatchException(context.arg) call above.
          context.method = "throw";
          context.arg = record.arg;
        }
      }
    };
  }

  // Call delegate.iterator[context.method](context.arg) and handle the
  // result, either by returning a { value, done } result from the
  // delegate iterator, or by modifying context.method and context.arg,
  // setting context.delegate to null, and returning the ContinueSentinel.
  function maybeInvokeDelegate(delegate, context) {
    var method = delegate.iterator[context.method];
    if (method === undefined$1) {
      // A .throw or .return when the delegate iterator has no .throw
      // method always terminates the yield* loop.
      context.delegate = null;

      if (context.method === "throw") {
        // Note: ["return"] must be used for ES3 parsing compatibility.
        if (delegate.iterator["return"]) {
          // If the delegate iterator has a return method, give it a
          // chance to clean up.
          context.method = "return";
          context.arg = undefined$1;
          maybeInvokeDelegate(delegate, context);

          if (context.method === "throw") {
            // If maybeInvokeDelegate(context) changed context.method from
            // "return" to "throw", let that override the TypeError below.
            return ContinueSentinel;
          }
        }

        context.method = "throw";
        context.arg = new TypeError(
          "The iterator does not provide a 'throw' method");
      }

      return ContinueSentinel;
    }

    var record = tryCatch(method, delegate.iterator, context.arg);

    if (record.type === "throw") {
      context.method = "throw";
      context.arg = record.arg;
      context.delegate = null;
      return ContinueSentinel;
    }

    var info = record.arg;

    if (! info) {
      context.method = "throw";
      context.arg = new TypeError("iterator result is not an object");
      context.delegate = null;
      return ContinueSentinel;
    }

    if (info.done) {
      // Assign the result of the finished delegate to the temporary
      // variable specified by delegate.resultName (see delegateYield).
      context[delegate.resultName] = info.value;

      // Resume execution at the desired location (see delegateYield).
      context.next = delegate.nextLoc;

      // If context.method was "throw" but the delegate handled the
      // exception, let the outer generator proceed normally. If
      // context.method was "next", forget context.arg since it has been
      // "consumed" by the delegate iterator. If context.method was
      // "return", allow the original .return call to continue in the
      // outer generator.
      if (context.method !== "return") {
        context.method = "next";
        context.arg = undefined$1;
      }

    } else {
      // Re-yield the result returned by the delegate method.
      return info;
    }

    // The delegate iterator is finished, so forget it and continue with
    // the outer generator.
    context.delegate = null;
    return ContinueSentinel;
  }

  // Define Generator.prototype.{next,throw,return} in terms of the
  // unified ._invoke helper method.
  defineIteratorMethods(Gp);

  define(Gp, toStringTagSymbol, "Generator");

  // A Generator should always return itself as the iterator object when the
  // @@iterator function is called on it. Some browsers' implementations of the
  // iterator prototype chain incorrectly implement this, causing the Generator
  // object to not be returned from this call. This ensures that doesn't happen.
  // See https://github.com/facebook/regenerator/issues/274 for more details.
  Gp[iteratorSymbol] = function() {
    return this;
  };

  Gp.toString = function() {
    return "[object Generator]";
  };

  function pushTryEntry(locs) {
    var entry = { tryLoc: locs[0] };

    if (1 in locs) {
      entry.catchLoc = locs[1];
    }

    if (2 in locs) {
      entry.finallyLoc = locs[2];
      entry.afterLoc = locs[3];
    }

    this.tryEntries.push(entry);
  }

  function resetTryEntry(entry) {
    var record = entry.completion || {};
    record.type = "normal";
    delete record.arg;
    entry.completion = record;
  }

  function Context(tryLocsList) {
    // The root entry object (effectively a try statement without a catch
    // or a finally block) gives us a place to store values thrown from
    // locations where there is no enclosing try statement.
    this.tryEntries = [{ tryLoc: "root" }];
    tryLocsList.forEach(pushTryEntry, this);
    this.reset(true);
  }

  exports.keys = function(object) {
    var keys = [];
    for (var key in object) {
      keys.push(key);
    }
    keys.reverse();

    // Rather than returning an object with a next method, we keep
    // things simple and return the next function itself.
    return function next() {
      while (keys.length) {
        var key = keys.pop();
        if (key in object) {
          next.value = key;
          next.done = false;
          return next;
        }
      }

      // To avoid creating an additional object, we just hang the .value
      // and .done properties off the next function object itself. This
      // also ensures that the minifier will not anonymize the function.
      next.done = true;
      return next;
    };
  };

  function values(iterable) {
    if (iterable) {
      var iteratorMethod = iterable[iteratorSymbol];
      if (iteratorMethod) {
        return iteratorMethod.call(iterable);
      }

      if (typeof iterable.next === "function") {
        return iterable;
      }

      if (!isNaN(iterable.length)) {
        var i = -1, next = function next() {
          while (++i < iterable.length) {
            if (hasOwn.call(iterable, i)) {
              next.value = iterable[i];
              next.done = false;
              return next;
            }
          }

          next.value = undefined$1;
          next.done = true;

          return next;
        };

        return next.next = next;
      }
    }

    // Return an iterator with no values.
    return { next: doneResult };
  }
  exports.values = values;

  function doneResult() {
    return { value: undefined$1, done: true };
  }

  Context.prototype = {
    constructor: Context,

    reset: function(skipTempReset) {
      this.prev = 0;
      this.next = 0;
      // Resetting context._sent for legacy support of Babel's
      // function.sent implementation.
      this.sent = this._sent = undefined$1;
      this.done = false;
      this.delegate = null;

      this.method = "next";
      this.arg = undefined$1;

      this.tryEntries.forEach(resetTryEntry);

      if (!skipTempReset) {
        for (var name in this) {
          // Not sure about the optimal order of these conditions:
          if (name.charAt(0) === "t" &&
              hasOwn.call(this, name) &&
              !isNaN(+name.slice(1))) {
            this[name] = undefined$1;
          }
        }
      }
    },

    stop: function() {
      this.done = true;

      var rootEntry = this.tryEntries[0];
      var rootRecord = rootEntry.completion;
      if (rootRecord.type === "throw") {
        throw rootRecord.arg;
      }

      return this.rval;
    },

    dispatchException: function(exception) {
      if (this.done) {
        throw exception;
      }

      var context = this;
      function handle(loc, caught) {
        record.type = "throw";
        record.arg = exception;
        context.next = loc;

        if (caught) {
          // If the dispatched exception was caught by a catch block,
          // then let that catch block handle the exception normally.
          context.method = "next";
          context.arg = undefined$1;
        }

        return !! caught;
      }

      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        var record = entry.completion;

        if (entry.tryLoc === "root") {
          // Exception thrown outside of any try block that could handle
          // it, so set the completion value of the entire function to
          // throw the exception.
          return handle("end");
        }

        if (entry.tryLoc <= this.prev) {
          var hasCatch = hasOwn.call(entry, "catchLoc");
          var hasFinally = hasOwn.call(entry, "finallyLoc");

          if (hasCatch && hasFinally) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            } else if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }

          } else if (hasCatch) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            }

          } else if (hasFinally) {
            if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }

          } else {
            throw new Error("try statement without catch or finally");
          }
        }
      }
    },

    abrupt: function(type, arg) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc <= this.prev &&
            hasOwn.call(entry, "finallyLoc") &&
            this.prev < entry.finallyLoc) {
          var finallyEntry = entry;
          break;
        }
      }

      if (finallyEntry &&
          (type === "break" ||
           type === "continue") &&
          finallyEntry.tryLoc <= arg &&
          arg <= finallyEntry.finallyLoc) {
        // Ignore the finally entry if control is not jumping to a
        // location outside the try/catch block.
        finallyEntry = null;
      }

      var record = finallyEntry ? finallyEntry.completion : {};
      record.type = type;
      record.arg = arg;

      if (finallyEntry) {
        this.method = "next";
        this.next = finallyEntry.finallyLoc;
        return ContinueSentinel;
      }

      return this.complete(record);
    },

    complete: function(record, afterLoc) {
      if (record.type === "throw") {
        throw record.arg;
      }

      if (record.type === "break" ||
          record.type === "continue") {
        this.next = record.arg;
      } else if (record.type === "return") {
        this.rval = this.arg = record.arg;
        this.method = "return";
        this.next = "end";
      } else if (record.type === "normal" && afterLoc) {
        this.next = afterLoc;
      }

      return ContinueSentinel;
    },

    finish: function(finallyLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.finallyLoc === finallyLoc) {
          this.complete(entry.completion, entry.afterLoc);
          resetTryEntry(entry);
          return ContinueSentinel;
        }
      }
    },

    "catch": function(tryLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc === tryLoc) {
          var record = entry.completion;
          if (record.type === "throw") {
            var thrown = record.arg;
            resetTryEntry(entry);
          }
          return thrown;
        }
      }

      // The context.catch method must only be called with a location
      // argument that corresponds to a known catch block.
      throw new Error("illegal catch attempt");
    },

    delegateYield: function(iterable, resultName, nextLoc) {
      this.delegate = {
        iterator: values(iterable),
        resultName: resultName,
        nextLoc: nextLoc
      };

      if (this.method === "next") {
        // Deliberately forget the last sent value so that we don't
        // accidentally pass it on to the delegate.
        this.arg = undefined$1;
      }

      return ContinueSentinel;
    }
  };

  // Regardless of whether this script is executing as a CommonJS module
  // or not, return the runtime object so that we can declare the variable
  // regeneratorRuntime in the outer scope, which allows this module to be
  // injected easily by `bin/regenerator --include-runtime script.js`.
  return exports;

}(
  // If this script is executing as a CommonJS module, use module.exports
  // as the regeneratorRuntime namespace. Otherwise create a new empty
  // object. Either way, the resulting object will be used to initialize
  // the regeneratorRuntime variable at the top of this file.
   module.exports 
));

try {
  regeneratorRuntime = runtime;
} catch (accidentalStrictMode) {
  // This module should not be running in strict mode, so the above
  // assignment should always work unless something is misconfigured. Just
  // in case runtime.js accidentally runs in strict mode, we can escape
  // strict mode using a global Function call. This could conceivably fail
  // if a Content Security Policy forbids using Function, but in that case
  // the proper solution is to fix the accidental strict mode problem. If
  // you've misconfigured your bundler to force strict mode and applied a
  // CSP to forbid Function, and you're not willing to fix either of those
  // problems, please detail your unique predicament in a GitHub issue.
  Function("r", "regeneratorRuntime = r")(runtime);
}
});

var regenerator = runtime_1;

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
  try {
    var info = gen[key](arg);
    var value = info.value;
  } catch (error) {
    reject(error);
    return;
  }

  if (info.done) {
    resolve(value);
  } else {
    Promise.resolve(value).then(_next, _throw);
  }
}

function _asyncToGenerator(fn) {
  return function () {
    var self = this,
        args = arguments;
    return new Promise(function (resolve, reject) {
      var gen = fn.apply(self, args);

      function _next(value) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
      }

      function _throw(err) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
      }

      _next(undefined);
    });
  };
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'loader assertion failed.');
  }
}

var globals = {
  self: typeof self !== 'undefined' && self,
  window: typeof window !== 'undefined' && window,
  global: typeof global !== 'undefined' && global,
  document: typeof document !== 'undefined' && document
};
var global_ = globals.global || globals.self || globals.window;
var isBrowser = (typeof process === "undefined" ? "undefined" : _typeof(process)) !== 'object' || String(process) !== '[object process]' || process.browser;
var matches = typeof process !== 'undefined' && process.version && process.version.match(/v([0-9]*)/);
var nodeVersion = matches && parseFloat(matches[1]) || 0;

function getTransferList(object) {
  var recursive = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
  var transfers = arguments.length > 2 ? arguments[2] : undefined;
  var transfersSet = transfers || new Set();

  if (!object) ; else if (isTransferable(object)) {
    transfersSet.add(object);
  } else if (isTransferable(object.buffer)) {
    transfersSet.add(object.buffer);
  } else if (ArrayBuffer.isView(object)) ; else if (recursive && _typeof(object) === 'object') {
    for (var key in object) {
      getTransferList(object[key], recursive, transfersSet);
    }
  }

  return transfers === undefined ? Array.from(transfersSet) : [];
}

function isTransferable(object) {
  if (!object) {
    return false;
  }

  if (object instanceof ArrayBuffer) {
    return true;
  }

  if (typeof MessagePort !== 'undefined' && object instanceof MessagePort) {
    return true;
  }

  if (typeof ImageBitmap !== 'undefined' && object instanceof ImageBitmap) {
    return true;
  }

  if (typeof OffscreenCanvas !== 'undefined' && object instanceof OffscreenCanvas) {
    return true;
  }

  return false;
}

var VERSION =  "2.3.6" ;
function validateLoaderVersion(loader) {
  var coreVersion = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : VERSION;
  assert(loader, 'no loader provided');
  var loaderVersion = loader.version;

  if (!coreVersion || !loaderVersion) {
    return;
  }

  coreVersion = parseVersion(coreVersion);
  loaderVersion = parseVersion(loaderVersion);
}

function parseVersion(version) {
  var parts = version.split('.').map(Number);
  return {
    major: parts[0],
    minor: parts[1]
  };
}

function _AwaitValue(value) {
  this.wrapped = value;
}

function _awaitAsyncGenerator(value) {
  return new _AwaitValue(value);
}

function AsyncGenerator(gen) {
  var front, back;

  function send(key, arg) {
    return new Promise(function (resolve, reject) {
      var request = {
        key: key,
        arg: arg,
        resolve: resolve,
        reject: reject,
        next: null
      };

      if (back) {
        back = back.next = request;
      } else {
        front = back = request;
        resume(key, arg);
      }
    });
  }

  function resume(key, arg) {
    try {
      var result = gen[key](arg);
      var value = result.value;
      var wrappedAwait = value instanceof _AwaitValue;
      Promise.resolve(wrappedAwait ? value.wrapped : value).then(function (arg) {
        if (wrappedAwait) {
          resume(key === "return" ? "return" : "next", arg);
          return;
        }

        settle(result.done ? "return" : "normal", arg);
      }, function (err) {
        resume("throw", err);
      });
    } catch (err) {
      settle("throw", err);
    }
  }

  function settle(type, value) {
    switch (type) {
      case "return":
        front.resolve({
          value: value,
          done: true
        });
        break;

      case "throw":
        front.reject(value);
        break;

      default:
        front.resolve({
          value: value,
          done: false
        });
        break;
    }

    front = front.next;

    if (front) {
      resume(front.key, front.arg);
    } else {
      back = null;
    }
  }

  this._invoke = send;

  if (typeof gen["return"] !== "function") {
    this["return"] = undefined;
  }
}

if (typeof Symbol === "function" && Symbol.asyncIterator) {
  AsyncGenerator.prototype[Symbol.asyncIterator] = function () {
    return this;
  };
}

AsyncGenerator.prototype.next = function (arg) {
  return this._invoke("next", arg);
};

AsyncGenerator.prototype["throw"] = function (arg) {
  return this._invoke("throw", arg);
};

AsyncGenerator.prototype["return"] = function (arg) {
  return this._invoke("return", arg);
};

function _wrapAsyncGenerator(fn) {
  return function () {
    return new AsyncGenerator(fn.apply(this, arguments));
  };
}

function _asyncIterator(iterable) {
  var method;

  if (typeof Symbol !== "undefined") {
    if (Symbol.asyncIterator) {
      method = iterable[Symbol.asyncIterator];
      if (method != null) return method.call(iterable);
    }

    if (Symbol.iterator) {
      method = iterable[Symbol.iterator];
      if (method != null) return method.call(iterable);
    }
  }

  throw new TypeError("Object is not async iterable");
}

var workerURLCache = new Map();
function getWorkerURL(workerSource) {
  assert(typeof workerSource === 'string', 'worker source');

  if (workerSource.startsWith('url(') && workerSource.endsWith(')')) {
    var workerUrl = workerSource.match(/^url\((.*)\)$/)[1];

    if (workerUrl && !workerUrl.startsWith('http')) {
      return workerUrl;
    }

    workerSource = buildScript(workerUrl);
  }

  var workerURL = workerURLCache.get(workerSource);

  if (!workerURL) {
    var blob = new Blob([workerSource], {
      type: 'application/javascript'
    });
    workerURL = URL.createObjectURL(blob);
    workerURLCache.set(workerSource, workerURL);
  }

  return workerURL;
}

function buildScript(workerUrl) {
  return "try {\n  importScripts('".concat(workerUrl, "');\n} catch (error) {\n  console.error(error);\n}");
}

var count = 0;

function defaultOnMessage(_ref) {
  var data = _ref.data,
      resolve = _ref.resolve;
  resolve(data);
}

var WorkerThread = function () {
  function WorkerThread(_ref2) {
    var source = _ref2.source,
        _ref2$name = _ref2.name,
        name = _ref2$name === void 0 ? "web-worker-".concat(count++) : _ref2$name,
        onMessage = _ref2.onMessage;

    _classCallCheck(this, WorkerThread);

    var url = getWorkerURL(source);
    this.worker = new Worker(url, {
      name: name
    });
    this.name = name;
    this.onMessage = onMessage || defaultOnMessage;
  }

  _createClass(WorkerThread, [{
    key: "process",
    value: function () {
      var _process = _asyncToGenerator(regenerator.mark(function _callee(data) {
        var _this = this;

        return regenerator.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                return _context.abrupt("return", new Promise(function (resolve, reject) {
                  _this.worker.onmessage = function (event) {
                    _this.onMessage({
                      worker: _this.worker,
                      data: event.data,
                      resolve: resolve,
                      reject: reject
                    });
                  };

                  _this.worker.onerror = function (error) {
                    var message = "".concat(_this.name, ": WorkerThread.process() failed");

                    if (error.message) {
                      message += " ".concat(error.message, " ").concat(error.filename, ":").concat(error.lineno, ":").concat(error.colno);
                    }

                    var betterError = new Error(message);
                    console.error(error);
                    reject(betterError);
                  };

                  var transferList = getTransferList(data);

                  _this.worker.postMessage(data, transferList);
                }));

              case 1:
              case "end":
                return _context.stop();
            }
          }
        }, _callee);
      }));

      function process(_x) {
        return _process.apply(this, arguments);
      }

      return process;
    }()
  }, {
    key: "destroy",
    value: function destroy() {
      this.worker.terminate();
      this.worker = null;
    }
  }]);

  return WorkerThread;
}();

var WorkerPool = function () {
  function WorkerPool(_ref) {
    var source = _ref.source,
        _ref$name = _ref.name,
        name = _ref$name === void 0 ? 'unnamed' : _ref$name,
        _ref$maxConcurrency = _ref.maxConcurrency,
        maxConcurrency = _ref$maxConcurrency === void 0 ? 1 : _ref$maxConcurrency,
        onMessage = _ref.onMessage,
        _ref$onDebug = _ref.onDebug,
        onDebug = _ref$onDebug === void 0 ? function () {} : _ref$onDebug;

    _classCallCheck(this, WorkerPool);

    this.source = source;
    this.name = name;
    this.maxConcurrency = maxConcurrency;
    this.onMessage = onMessage;
    this.onDebug = onDebug;
    this.jobQueue = [];
    this.idleQueue = [];
    this.count = 0;
    this.isDestroyed = false;
  }

  _createClass(WorkerPool, [{
    key: "destroy",
    value: function destroy() {
      this.idleQueue.forEach(function (worker) {
        return worker.destroy();
      });
      this.isDestroyed = true;
    }
  }, {
    key: "process",
    value: function process(data, jobName) {
      var _this = this;

      return new Promise(function (resolve, reject) {
        _this.jobQueue.push({
          data: data,
          jobName: jobName,
          resolve: resolve,
          reject: reject
        });

        _this._startQueuedJob();
      });
    }
  }, {
    key: "_startQueuedJob",
    value: function () {
      var _startQueuedJob2 = _asyncToGenerator(regenerator.mark(function _callee() {
        var worker, job;
        return regenerator.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                if (this.jobQueue.length) {
                  _context.next = 2;
                  break;
                }

                return _context.abrupt("return");

              case 2:
                worker = this._getAvailableWorker();

                if (worker) {
                  _context.next = 5;
                  break;
                }

                return _context.abrupt("return");

              case 5:
                job = this.jobQueue.shift();
                this.onDebug({
                  message: 'processing',
                  worker: worker.name,
                  job: job.jobName,
                  backlog: this.jobQueue.length
                });
                _context.prev = 7;
                _context.t0 = job;
                _context.next = 11;
                return worker.process(job.data);

              case 11:
                _context.t1 = _context.sent;

                _context.t0.resolve.call(_context.t0, _context.t1);

                _context.next = 18;
                break;

              case 15:
                _context.prev = 15;
                _context.t2 = _context["catch"](7);
                job.reject(_context.t2);

              case 18:
                _context.prev = 18;

                this._onWorkerDone(worker);

                return _context.finish(18);

              case 21:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this, [[7, 15, 18, 21]]);
      }));

      function _startQueuedJob() {
        return _startQueuedJob2.apply(this, arguments);
      }

      return _startQueuedJob;
    }()
  }, {
    key: "_onWorkerDone",
    value: function _onWorkerDone(worker) {
      if (this.isDestroyed) {
        worker.destroy();
      } else {
        this.idleQueue.push(worker);

        this._startQueuedJob();
      }
    }
  }, {
    key: "_getAvailableWorker",
    value: function _getAvailableWorker() {
      if (this.idleQueue.length > 0) {
        return this.idleQueue.shift();
      }

      if (this.count < this.maxConcurrency) {
        this.count++;
        var name = "".concat(this.name.toLowerCase(), " (#").concat(this.count, " of ").concat(this.maxConcurrency, ")");
        return new WorkerThread({
          source: this.source,
          onMessage: this.onMessage,
          name: name
        });
      }

      return null;
    }
  }]);

  return WorkerPool;
}();

var DEFAULT_MAX_CONCURRENCY = 5;

var WorkerFarm = function () {
  _createClass(WorkerFarm, null, [{
    key: "isSupported",
    value: function isSupported() {
      return typeof Worker !== 'undefined';
    }
  }]);

  function WorkerFarm(_ref) {
    var _ref$maxConcurrency = _ref.maxConcurrency,
        maxConcurrency = _ref$maxConcurrency === void 0 ? DEFAULT_MAX_CONCURRENCY : _ref$maxConcurrency,
        _ref$onMessage = _ref.onMessage,
        onMessage = _ref$onMessage === void 0 ? null : _ref$onMessage,
        _ref$onDebug = _ref.onDebug,
        onDebug = _ref$onDebug === void 0 ? function () {} : _ref$onDebug;

    _classCallCheck(this, WorkerFarm);

    this.maxConcurrency = maxConcurrency;
    this.onMessage = onMessage;
    this.onDebug = onDebug;
    this.workerPools = new Map();
  }

  _createClass(WorkerFarm, [{
    key: "setProps",
    value: function setProps(props) {
      if ('maxConcurrency' in props) {
        this.maxConcurrency = props.maxConcurrency;
      }

      if ('onDebug' in props) {
        this.onDebug = props.onDebug;
      }
    }
  }, {
    key: "destroy",
    value: function destroy() {
      this.workerPools.forEach(function (workerPool) {
        return workerPool.destroy();
      });
    }
  }, {
    key: "process",
    value: function () {
      var _process = _asyncToGenerator(regenerator.mark(function _callee(workerSource, workerName, data) {
        var workerPool;
        return regenerator.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                workerPool = this._getWorkerPool(workerSource, workerName);
                return _context.abrupt("return", workerPool.process(data));

              case 2:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function process(_x, _x2, _x3) {
        return _process.apply(this, arguments);
      }

      return process;
    }()
  }, {
    key: "_getWorkerPool",
    value: function _getWorkerPool(workerSource, workerName) {
      var workerPool = this.workerPools.get(workerName);

      if (!workerPool) {
        workerPool = new WorkerPool({
          source: workerSource,
          name: workerName,
          onMessage: onWorkerMessage.bind(null, this.onMessage),
          maxConcurrency: this.maxConcurrency,
          onDebug: this.onDebug
        });
        this.workerPools.set(workerName, workerPool);
      }

      return workerPool;
    }
  }]);

  return WorkerFarm;
}();

function onWorkerMessage(onMessage, _ref2) {
  var worker = _ref2.worker,
      data = _ref2.data,
      resolve = _ref2.resolve,
      reject = _ref2.reject;

  if (onMessage) {
    onMessage({
      worker: worker,
      data: data,
      resolve: resolve,
      reject: reject
    });
    return;
  }

  switch (data.type) {
    case 'done':
      resolve(data.result);
      break;

    case 'error':
      reject(data.message);
      break;
  }
}

function _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }
function toArrayBuffer(data) {
  if (undefined) {
    data = undefined(data);
  }

  if (data instanceof ArrayBuffer) {
    return data;
  }

  if (ArrayBuffer.isView(data)) {
    return data.buffer;
  }

  if (typeof data === 'string') {
    var text = data;
    var uint8Array = new TextEncoder().encode(text);
    return uint8Array.buffer;
  }

  if (data && _typeof(data) === 'object' && data._toArrayBuffer) {
    return data._toArrayBuffer();
  }

  return assert(false);
}
function compareArrayBuffers(arrayBuffer1, arrayBuffer2, byteLength) {
  byteLength = byteLength || arrayBuffer1.byteLength;

  if (arrayBuffer1.byteLength < byteLength || arrayBuffer2.byteLength < byteLength) {
    return false;
  }

  var array1 = new Uint8Array(arrayBuffer1);
  var array2 = new Uint8Array(arrayBuffer2);

  for (var i = 0; i < array1.length; ++i) {
    if (array1[i] !== array2[i]) {
      return false;
    }
  }

  return true;
}
function concatenateArrayBuffers() {
  for (var _len = arguments.length, sources = new Array(_len), _key = 0; _key < _len; _key++) {
    sources[_key] = arguments[_key];
  }

  var sourceArrays = sources.map(function (source2) {
    return source2 instanceof ArrayBuffer ? new Uint8Array(source2) : source2;
  });
  var byteLength = sourceArrays.reduce(function (length, typedArray) {
    return length + typedArray.byteLength;
  }, 0);
  var result = new Uint8Array(byteLength);
  var offset = 0;

  var _iterator = _createForOfIteratorHelper(sourceArrays),
      _step;

  try {
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      var sourceArray = _step.value;
      result.set(sourceArray, offset);
      offset += sourceArray.byteLength;
    }
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }

  return result.buffer;
}

var pathPrefix = '';
var fileAliases = {};
function resolvePath(filename) {
  for (var alias in fileAliases) {
    if (filename.startsWith(alias)) {
      var replacement = fileAliases[alias];
      filename = filename.replace(alias, replacement);
    }
  }

  if (!filename.startsWith('http://') && !filename.startsWith('https://')) {
    filename = "".concat(pathPrefix).concat(filename);
  }

  return filename;
}

function concatenateChunksAsync(_x3) {
  return _concatenateChunksAsync.apply(this, arguments);
}

function _concatenateChunksAsync() {
  _concatenateChunksAsync = _asyncToGenerator(regenerator.mark(function _callee2(asyncIterator) {
    var arrayBuffers, strings, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, _value, chunk;

    return regenerator.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            arrayBuffers = [];
            strings = [];
            _iteratorNormalCompletion = true;
            _didIteratorError = false;
            _context2.prev = 4;
            _iterator = _asyncIterator(asyncIterator);

          case 6:
            _context2.next = 8;
            return _iterator.next();

          case 8:
            _step = _context2.sent;
            _iteratorNormalCompletion = _step.done;
            _context2.next = 12;
            return _step.value;

          case 12:
            _value = _context2.sent;

            if (_iteratorNormalCompletion) {
              _context2.next = 19;
              break;
            }

            chunk = _value;

            if (typeof chunk === 'string') {
              strings.push(chunk);
            } else {
              arrayBuffers.push(chunk);
            }

          case 16:
            _iteratorNormalCompletion = true;
            _context2.next = 6;
            break;

          case 19:
            _context2.next = 25;
            break;

          case 21:
            _context2.prev = 21;
            _context2.t0 = _context2["catch"](4);
            _didIteratorError = true;
            _iteratorError = _context2.t0;

          case 25:
            _context2.prev = 25;
            _context2.prev = 26;

            if (!(!_iteratorNormalCompletion && _iterator["return"] != null)) {
              _context2.next = 30;
              break;
            }

            _context2.next = 30;
            return _iterator["return"]();

          case 30:
            _context2.prev = 30;

            if (!_didIteratorError) {
              _context2.next = 33;
              break;
            }

            throw _iteratorError;

          case 33:
            return _context2.finish(30);

          case 34:
            return _context2.finish(25);

          case 35:
            if (!(strings.length > 0)) {
              _context2.next = 38;
              break;
            }

            assert(arrayBuffers.length === 0);
            return _context2.abrupt("return", strings.join(''));

          case 38:
            return _context2.abrupt("return", concatenateArrayBuffers.apply(void 0, arrayBuffers));

          case 39:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, null, [[4, 21, 25, 35], [26,, 30, 34]]);
  }));
  return _concatenateChunksAsync.apply(this, arguments);
}

function getHiResTimestamp() {
  var timestamp;

  if (typeof window !== 'undefined' && window.performance) {
    timestamp = window.performance.now();
  } else if (typeof process !== 'undefined' && process.hrtime) {
    var timeParts = process.hrtime();
    timestamp = timeParts[0] * 1000 + timeParts[1] / 1e6;
  } else {
    timestamp = Date.now();
  }

  return timestamp;
}

var Stat = function () {
  function Stat(name, type) {
    _classCallCheck(this, Stat);

    this.name = name;
    this.type = type;
    this.sampleSize = 1;
    this.reset();
  }

  _createClass(Stat, [{
    key: "setSampleSize",
    value: function setSampleSize(samples) {
      this.sampleSize = samples;
      return this;
    }
  }, {
    key: "incrementCount",
    value: function incrementCount() {
      this.addCount(1);
      return this;
    }
  }, {
    key: "decrementCount",
    value: function decrementCount() {
      this.subtractCount(1);
      return this;
    }
  }, {
    key: "addCount",
    value: function addCount(value) {
      this._count += value;
      this._samples++;

      this._checkSampling();

      return this;
    }
  }, {
    key: "subtractCount",
    value: function subtractCount(value) {
      this._count -= value;
      this._samples++;

      this._checkSampling();

      return this;
    }
  }, {
    key: "addTime",
    value: function addTime(time) {
      this._time += time;
      this.lastTiming = time;
      this._samples++;

      this._checkSampling();

      return this;
    }
  }, {
    key: "timeStart",
    value: function timeStart() {
      this._startTime = getHiResTimestamp();
      this._timerPending = true;
      return this;
    }
  }, {
    key: "timeEnd",
    value: function timeEnd() {
      if (!this._timerPending) {
        return this;
      }

      this.addTime(getHiResTimestamp() - this._startTime);
      this._timerPending = false;

      this._checkSampling();

      return this;
    }
  }, {
    key: "getSampleAverageCount",
    value: function getSampleAverageCount() {
      return this.sampleSize > 0 ? this.lastSampleCount / this.sampleSize : 0;
    }
  }, {
    key: "getSampleAverageTime",
    value: function getSampleAverageTime() {
      return this.sampleSize > 0 ? this.lastSampleTime / this.sampleSize : 0;
    }
  }, {
    key: "getSampleHz",
    value: function getSampleHz() {
      return this.lastSampleTime > 0 ? this.sampleSize / (this.lastSampleTime / 1000) : 0;
    }
  }, {
    key: "getAverageCount",
    value: function getAverageCount() {
      return this.samples > 0 ? this.count / this.samples : 0;
    }
  }, {
    key: "getAverageTime",
    value: function getAverageTime() {
      return this.samples > 0 ? this.time / this.samples : 0;
    }
  }, {
    key: "getHz",
    value: function getHz() {
      return this.time > 0 ? this.samples / (this.time / 1000) : 0;
    }
  }, {
    key: "reset",
    value: function reset() {
      this.time = 0;
      this.count = 0;
      this.samples = 0;
      this.lastTiming = 0;
      this.lastSampleTime = 0;
      this.lastSampleCount = 0;
      this._count = 0;
      this._time = 0;
      this._samples = 0;
      this._startTime = 0;
      this._timerPending = false;
      return this;
    }
  }, {
    key: "_checkSampling",
    value: function _checkSampling() {
      if (this._samples === this.sampleSize) {
        this.lastSampleTime = this._time;
        this.lastSampleCount = this._count;
        this.count += this._count;
        this.time += this._time;
        this.samples += this._samples;
        this._time = 0;
        this._count = 0;
        this._samples = 0;
      }
    }
  }]);

  return Stat;
}();

var Stats = function () {
  function Stats(_ref) {
    var id = _ref.id,
        stats = _ref.stats;

    _classCallCheck(this, Stats);

    this.id = id;
    this.stats = {};

    this._initializeStats(stats);

    Object.seal(this);
  }

  _createClass(Stats, [{
    key: "get",
    value: function get(name) {
      var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'count';
      return this._getOrCreate({
        name: name,
        type: type
      });
    }
  }, {
    key: "reset",
    value: function reset() {
      for (var key in this.stats) {
        this.stats[key].reset();
      }

      return this;
    }
  }, {
    key: "forEach",
    value: function forEach(fn) {
      for (var key in this.stats) {
        fn(this.stats[key]);
      }
    }
  }, {
    key: "getTable",
    value: function getTable() {
      var table = {};
      this.forEach(function (stat) {
        table[stat.name] = {
          time: stat.time || 0,
          count: stat.count || 0,
          average: stat.getAverageTime() || 0,
          hz: stat.getHz() || 0
        };
      });
      return table;
    }
  }, {
    key: "_initializeStats",
    value: function _initializeStats() {
      var _this = this;

      var stats = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
      stats.forEach(function (stat) {
        return _this._getOrCreate(stat);
      });
    }
  }, {
    key: "_getOrCreate",
    value: function _getOrCreate(stat) {
      if (!stat || !stat.name) {
        return null;
      }

      var name = stat.name,
          type = stat.type;

      if (!this.stats[name]) {
        if (stat instanceof Stat) {
          this.stats[name] = stat;
        } else {
          this.stats[name] = new Stat(name, type);
        }
      }

      return this.stats[name];
    }
  }, {
    key: "size",
    get: function get() {
      return Object.keys(this.stats).length;
    }
  }]);

  return Stats;
}();

var isBoolean = function isBoolean(x) {
  return typeof x === 'boolean';
};

var isFunction = function isFunction(x) {
  return typeof x === 'function';
};

var isObject = function isObject(x) {
  return x !== null && _typeof(x) === 'object';
};
var isPureObject = function isPureObject(x) {
  return isObject(x) && x.constructor === {}.constructor;
};
var isIterable = function isIterable(x) {
  return x && typeof x[Symbol.iterator] === 'function';
};
var isAsyncIterable = function isAsyncIterable(x) {
  return x && typeof x[Symbol.asyncIterator] === 'function';
};
var isResponse = function isResponse(x) {
  return typeof Response !== 'undefined' && x instanceof Response || x && x.arrayBuffer && x.text && x.json;
};
var isBlob = function isBlob(x) {
  return typeof Blob !== 'undefined' && x instanceof Blob;
};
var isReadableDOMStream = function isReadableDOMStream(x) {
  return typeof ReadableStream !== 'undefined' && x instanceof ReadableStream || isObject(x) && isFunction(x.tee) && isFunction(x.cancel) && isFunction(x.getReader);
};
var isBuffer = function isBuffer(x) {
  return x && _typeof(x) === 'object' && x.isBuffer;
};
var isReadableNodeStream = function isReadableNodeStream(x) {
  return isObject(x) && isFunction(x.read) && isFunction(x.pipe) && isBoolean(x.readable);
};
var isReadableStream = function isReadableStream(x) {
  return isReadableDOMStream(x) || isReadableNodeStream(x);
};

var DATA_URL_PATTERN = /^data:([-\w.]+\/[-\w.+]+)(;|,)/;
var MIME_TYPE_PATTERN = /^([-\w.]+\/[-\w.+]+)/;
function parseMIMEType(mimeString) {
  if (typeof mimeString !== 'string') {
    return '';
  }

  var matches = mimeString.match(MIME_TYPE_PATTERN);

  if (matches) {
    return matches[1];
  }

  return mimeString;
}
function parseMIMETypeFromURL(dataUrl) {
  if (typeof dataUrl !== 'string') {
    return '';
  }

  var matches = dataUrl.match(DATA_URL_PATTERN);

  if (matches) {
    return matches[1];
  }

  return '';
}

var QUERY_STRING_PATTERN = /\?.*/;
function getResourceUrlAndType(resource) {
  if (isResponse(resource)) {
    var contentType = parseMIMEType(resource.headers.get('content-type'));
    var urlType = parseMIMETypeFromURL(resource.url);
    return {
      url: stripQueryString(resource.url || ''),
      type: contentType || urlType || null
    };
  }

  if (isBlob(resource)) {
    return {
      url: stripQueryString(resource.name || ''),
      type: resource.type || ''
    };
  }

  if (typeof resource === 'string') {
    return {
      url: stripQueryString(resource),
      type: parseMIMETypeFromURL(resource)
    };
  }

  return {
    url: '',
    type: ''
  };
}
function getResourceContentLength(resource) {
  if (isResponse(resource)) {
    return resource.headers['content-length'] || -1;
  }

  if (isBlob(resource)) {
    return resource.size;
  }

  if (typeof resource === 'string') {
    return resource.length;
  }

  if (resource instanceof ArrayBuffer) {
    return resource.byteLength;
  }

  if (ArrayBuffer.isView(resource)) {
    return resource.byteLength;
  }

  return -1;
}

function stripQueryString(url) {
  return url.replace(QUERY_STRING_PATTERN, '');
}

function makeResponse(_x) {
  return _makeResponse.apply(this, arguments);
}

function _makeResponse() {
  _makeResponse = _asyncToGenerator(regenerator.mark(function _callee(resource) {
    var headers, contentLength, _getResourceUrlAndTyp, url, type, initialDataUrl, response;

    return regenerator.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            if (!isResponse(resource)) {
              _context.next = 2;
              break;
            }

            return _context.abrupt("return", resource);

          case 2:
            headers = {};
            contentLength = getResourceContentLength(resource);

            if (contentLength >= 0) {
              headers['content-length'] = String(contentLength);
            }

            _getResourceUrlAndTyp = getResourceUrlAndType(resource), url = _getResourceUrlAndTyp.url, type = _getResourceUrlAndTyp.type;

            if (type) {
              headers['content-type'] = type;
            }

            _context.next = 9;
            return getInitialDataUrl(resource);

          case 9:
            initialDataUrl = _context.sent;

            if (initialDataUrl) {
              headers['x-first-bytes'] = initialDataUrl;
            }

            if (typeof resource === 'string') {
              resource = new TextEncoder().encode(resource);
            }

            response = new Response(resource, {
              headers: headers
            });
            Object.defineProperty(response, 'url', {
              value: url
            });
            return _context.abrupt("return", response);

          case 15:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));
  return _makeResponse.apply(this, arguments);
}

function checkResponse(_x2) {
  return _checkResponse.apply(this, arguments);
}

function _checkResponse() {
  _checkResponse = _asyncToGenerator(regenerator.mark(function _callee2(response) {
    var message;
    return regenerator.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            if (response.ok) {
              _context2.next = 5;
              break;
            }

            _context2.next = 3;
            return getResponseError(response);

          case 3:
            message = _context2.sent;
            throw new Error(message);

          case 5:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  }));
  return _checkResponse.apply(this, arguments);
}

function getResponseError(_x3) {
  return _getResponseError.apply(this, arguments);
}

function _getResponseError() {
  _getResponseError = _asyncToGenerator(regenerator.mark(function _callee3(response) {
    var message, contentType, text;
    return regenerator.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            message = "Failed to fetch resource ".concat(response.url, " (").concat(response.status, "): ");
            _context3.prev = 1;
            contentType = response.headers.get('Content-Type');
            text = response.statusText;

            if (!contentType.includes('application/json')) {
              _context3.next = 11;
              break;
            }

            _context3.t0 = text;
            _context3.t1 = " ";
            _context3.next = 9;
            return response.text();

          case 9:
            _context3.t2 = _context3.sent;
            text = _context3.t0 += _context3.t1.concat.call(_context3.t1, _context3.t2);

          case 11:
            message += text;
            message = message.length > 60 ? "".concat(message.slice(60), "...") : message;
            _context3.next = 17;
            break;

          case 15:
            _context3.prev = 15;
            _context3.t3 = _context3["catch"](1);

          case 17:
            return _context3.abrupt("return", message);

          case 18:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3, null, [[1, 15]]);
  }));
  return _getResponseError.apply(this, arguments);
}

function getInitialDataUrl(_x4) {
  return _getInitialDataUrl.apply(this, arguments);
}

function _getInitialDataUrl() {
  _getInitialDataUrl = _asyncToGenerator(regenerator.mark(function _callee4(resource) {
    var INITIAL_DATA_LENGTH, blobSlice, slice, base64;
    return regenerator.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            INITIAL_DATA_LENGTH = 5;

            if (!(typeof resource === 'string')) {
              _context4.next = 3;
              break;
            }

            return _context4.abrupt("return", "data:,".concat(resource.slice(0, INITIAL_DATA_LENGTH)));

          case 3:
            if (!(resource instanceof Blob)) {
              _context4.next = 8;
              break;
            }

            blobSlice = resource.slice(0, 5);
            _context4.next = 7;
            return new Promise(function (resolve) {
              var reader = new FileReader();

              reader.onload = function (event) {
                return resolve(event.target && event.target.result);
              };

              reader.readAsDataURL(blobSlice);
            });

          case 7:
            return _context4.abrupt("return", _context4.sent);

          case 8:
            if (!(resource instanceof ArrayBuffer)) {
              _context4.next = 12;
              break;
            }

            slice = resource.slice(0, INITIAL_DATA_LENGTH);
            base64 = arrayBufferToBase64(slice);
            return _context4.abrupt("return", "data:base64,".concat(base64));

          case 12:
            return _context4.abrupt("return", null);

          case 13:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4);
  }));
  return _getInitialDataUrl.apply(this, arguments);
}

function arrayBufferToBase64(buffer) {
  var binary = '';
  var bytes = new Uint8Array(buffer);

  for (var i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }

  return btoa(binary);
}

function getErrorMessageFromResponse(_x) {
  return _getErrorMessageFromResponse.apply(this, arguments);
}

function _getErrorMessageFromResponse() {
  _getErrorMessageFromResponse = _asyncToGenerator(regenerator.mark(function _callee(response) {
    var message, contentType;
    return regenerator.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            message = "Failed to fetch resource ".concat(response.url, " (").concat(response.status, "): ");
            _context.prev = 1;
            contentType = response.headers.get('Content-Type');

            if (!contentType.includes('application/json')) {
              _context.next = 10;
              break;
            }

            _context.t0 = message;
            _context.next = 7;
            return response.text();

          case 7:
            message = _context.t0 += _context.sent;
            _context.next = 11;
            break;

          case 10:
            message += response.statusText;

          case 11:
            _context.next = 16;
            break;

          case 13:
            _context.prev = 13;
            _context.t1 = _context["catch"](1);
            return _context.abrupt("return", message);

          case 16:
            return _context.abrupt("return", message);

          case 17:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, null, [[1, 13]]);
  }));
  return _getErrorMessageFromResponse.apply(this, arguments);
}

function fetchFile(_x) {
  return _fetchFile.apply(this, arguments);
}

function _fetchFile() {
  _fetchFile = _asyncToGenerator(regenerator.mark(function _callee(url) {
    var options,
        response,
        _args = arguments;
    return regenerator.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            options = _args.length > 1 && _args[1] !== undefined ? _args[1] : {};

            if (!(typeof url !== 'string')) {
              _context.next = 5;
              break;
            }

            _context.next = 4;
            return makeResponse(url);

          case 4:
            return _context.abrupt("return", _context.sent);

          case 5:
            url = resolvePath(url);
            _context.next = 8;
            return fetch(url, options);

          case 8:
            response = _context.sent;

            if (!(!response.ok && options["throws"])) {
              _context.next = 15;
              break;
            }

            _context.t0 = Error;
            _context.next = 13;
            return getErrorMessageFromResponse(response);

          case 13:
            _context.t1 = _context.sent;
            throw new _context.t0(_context.t1);

          case 15:
            return _context.abrupt("return", response);

          case 16:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));
  return _fetchFile.apply(this, arguments);
}

var NullLog = function () {
  function NullLog() {
    _classCallCheck(this, NullLog);
  }

  _createClass(NullLog, [{
    key: "log",
    value: function log() {
      return function (_) {};
    }
  }, {
    key: "info",
    value: function info() {
      return function (_) {};
    }
  }, {
    key: "warn",
    value: function warn() {
      return function (_) {};
    }
  }, {
    key: "error",
    value: function error() {
      return function (_) {};
    }
  }]);

  return NullLog;
}();
var ConsoleLog = function () {
  function ConsoleLog() {
    _classCallCheck(this, ConsoleLog);

    this.console = console;
  }

  _createClass(ConsoleLog, [{
    key: "log",
    value: function log() {
      var _this$console$log;

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      return (_this$console$log = this.console.log).bind.apply(_this$console$log, [this.console].concat(args));
    }
  }, {
    key: "info",
    value: function info() {
      var _this$console$info;

      for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }

      return (_this$console$info = this.console.info).bind.apply(_this$console$info, [this.console].concat(args));
    }
  }, {
    key: "warn",
    value: function warn() {
      var _this$console$warn;

      for (var _len3 = arguments.length, args = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
        args[_key3] = arguments[_key3];
      }

      return (_this$console$warn = this.console.warn).bind.apply(_this$console$warn, [this.console].concat(args));
    }
  }, {
    key: "error",
    value: function error() {
      var _this$console$error;

      for (var _len4 = arguments.length, args = new Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
        args[_key4] = arguments[_key4];
      }

      return (_this$console$error = this.console.error).bind.apply(_this$console$error, [this.console].concat(args));
    }
  }]);

  return ConsoleLog;
}();

function _createForOfIteratorHelper$1(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray$1(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray$1(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray$1(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray$1(o, minLen); }

function _arrayLikeToArray$1(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }
var DEFAULT_LOADER_OPTIONS = {
  fetch: null,
  CDN: 'https://unpkg.com/@loaders.gl',
  worker: true,
  log: new ConsoleLog(),
  metadata: false,
  transforms: []
};
var DEPRECATED_LOADER_OPTIONS = {
  dataType: '(no longer used)',
  uri: 'baseUri',
  method: 'fetch.method',
  headers: 'fetch.headers',
  body: 'fetch.body',
  mode: 'fetch.mode',
  credentials: 'fetch.credentials',
  cache: 'fetch.cache',
  redirect: 'fetch.redirect',
  referrer: 'fetch.referrer',
  referrerPolicy: 'fetch.referrerPolicy',
  integrity: 'fetch.integrity',
  keepalive: 'fetch.keepalive',
  signal: 'fetch.signal'
};
var getGlobalLoaderState = function getGlobalLoaderState() {
  global_.loaders = global_.loaders || {};
  var loaders = global_.loaders;
  loaders._state = loaders._state || {};
  return loaders._state;
};

var getGlobalLoaderOptions = function getGlobalLoaderOptions() {
  var state = getGlobalLoaderState();
  state.globalOptions = state.globalOptions || _objectSpread({}, DEFAULT_LOADER_OPTIONS);
  return state.globalOptions;
};
function normalizeOptions(options, loader, loaders, url) {
  loaders = loaders || [];
  loaders = Array.isArray(loaders) ? loaders : [loaders];
  validateOptions(options, loaders);
  return normalizeOptionsInternal(loader, options, url);
}
function getFetchFunction(options, context) {
  var globalOptions = getGlobalLoaderOptions();
  var fetch = options.fetch || globalOptions.fetch;

  if (typeof fetch === 'function') {
    return fetch;
  }

  if (isObject(fetch)) {
    return function (url) {
      return fetchFile(url, fetch);
    };
  }

  if (context && context.fetch) {
    return context.fetch;
  }

  return function (url) {
    return fetchFile(url, options);
  };
}

function validateOptions(options, loaders) {
  var log = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : console;
  validateOptionsObject(options, null, log, DEFAULT_LOADER_OPTIONS, DEPRECATED_LOADER_OPTIONS, loaders);

  var _iterator = _createForOfIteratorHelper$1(loaders),
      _step;

  try {
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      var loader = _step.value;
      var idOptions = options && options[loader.id] || {};
      var loaderOptions = loader.options && loader.options[loader.id] || {};
      var deprecatedOptions = loader.defaultOptions && loader.defaultOptions[loader.id] || {};
      validateOptionsObject(idOptions, loader.id, log, loaderOptions, deprecatedOptions, loaders);
    }
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }
}

function validateOptionsObject(options, id, log, defaultOptions, deprecatedOptions, loaders) {
  var loaderName = id || 'Top level';
  var prefix = id ? "".concat(id, ".") : '';

  for (var key in options) {
    var isSubOptions = !id && isObject(options[key]);

    if (!(key in defaultOptions)) {
      if (key in deprecatedOptions) {
        log.warn("".concat(loaderName, " loader option '").concat(prefix).concat(key, "' deprecated, use '").concat(deprecatedOptions[key], "'"));
      } else if (!isSubOptions) {
        var suggestion = findSimilarOption(key, loaders);
        log.warn("".concat(loaderName, " loader option '").concat(prefix).concat(key, "' not recognized. ").concat(suggestion));
      }
    }
  }
}

function findSimilarOption(optionKey, loaders) {
  var lowerCaseOptionKey = optionKey.toLowerCase();
  var bestSuggestion = '';

  var _iterator2 = _createForOfIteratorHelper$1(loaders),
      _step2;

  try {
    for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
      var loader = _step2.value;

      for (var key in loader.options) {
        if (optionKey === key) {
          return "Did you mean '".concat(loader.id, ".").concat(key, "'?");
        }

        var lowerCaseKey = key.toLowerCase();
        var isPartialMatch = lowerCaseOptionKey.startsWith(lowerCaseKey) || lowerCaseKey.startsWith(lowerCaseOptionKey);

        if (isPartialMatch) {
          bestSuggestion = bestSuggestion || "Did you mean '".concat(loader.id, ".").concat(key, "'?");
        }
      }
    }
  } catch (err) {
    _iterator2.e(err);
  } finally {
    _iterator2.f();
  }

  return bestSuggestion;
}

function normalizeOptionsInternal(loader, options, url) {
  var loaderDefaultOptions = loader.options || {};

  var mergedOptions = _objectSpread({}, loaderDefaultOptions);

  addUrlOptions(mergedOptions, url);

  if (mergedOptions.log === null) {
    mergedOptions.log = new NullLog();
  }

  mergeNestedFields(mergedOptions, getGlobalLoaderOptions());
  mergeNestedFields(mergedOptions, options);
  return mergedOptions;
}

function mergeNestedFields(mergedOptions, options) {
  for (var key in options) {
    if (key in options) {
      var value = options[key];

      if (isPureObject(value) && isPureObject(mergedOptions[key])) {
        mergedOptions[key] = _objectSpread(_objectSpread({}, mergedOptions[key]), options[key]);
      } else {
        mergedOptions[key] = options[key];
      }
    }
  }
}

function addUrlOptions(options, url) {
  if (url && !('baseUri' in options)) {
    options.baseUri = url;
  }
}

function ownKeys$1(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread$1(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys$1(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys$1(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }
function isLoaderObject(loader) {
  if (!loader) {
    return false;
  }

  if (Array.isArray(loader)) {
    loader = loader[0];
  }

  var hasParser = loader.parseTextSync || loader.parseSync || loader.parse || loader.parseStream || loader.parseInBatches;
  var loaderOptions = loader.options && loader.options[loader.id];
  hasParser = hasParser || loaderOptions && loaderOptions.workerUrl;
  return hasParser;
}
function normalizeLoader(loader) {
  assert(loader, 'null loader');
  assert(isLoaderObject(loader), 'invalid loader');
  var options;

  if (Array.isArray(loader)) {
    options = loader[1];
    loader = loader[0];
    loader = _objectSpread$1(_objectSpread$1({}, loader), {}, {
      options: _objectSpread$1(_objectSpread$1({}, loader.options), options)
    });
  }

  if (loader.extension) {
    loader.extensions = loader.extensions || loader.extension;
    delete loader.extension;
  }

  if (!Array.isArray(loader.extensions)) {
    loader.extensions = [loader.extensions];
  }

  assert(loader.extensions && loader.extensions.length > 0 && loader.extensions[0]);

  if (loader.parseTextSync || loader.parseText) {
    loader.text = true;
  }

  if (!loader.text) {
    loader.binary = true;
  }

  return loader;
}

function _createForOfIteratorHelper$2(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray$2(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray$2(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray$2(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray$2(o, minLen); }

function _arrayLikeToArray$2(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

var getGlobalLoaderRegistry = function getGlobalLoaderRegistry() {
  var state = getGlobalLoaderState();
  state.loaderRegistry = state.loaderRegistry || [];
  return state.loaderRegistry;
};

function registerLoaders(loaders) {
  var loaderRegistry = getGlobalLoaderRegistry();
  loaders = Array.isArray(loaders) ? loaders : [loaders];

  var _iterator = _createForOfIteratorHelper$2(loaders),
      _step;

  try {
    var _loop = function _loop() {
      var loader = _step.value;
      var normalizedLoader = normalizeLoader(loader);

      if (!loaderRegistry.find(function (registeredLoader) {
        return normalizedLoader === registeredLoader;
      })) {
        loaderRegistry.unshift(normalizedLoader);
      }
    };

    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      _loop();
    }
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }
}
function getRegisteredLoaders() {
  return getGlobalLoaderRegistry();
}

var _marked = regenerator.mark(makeStringIterator);

function makeStringIterator(string) {
  var options,
      _options$chunkSize,
      chunkSize,
      offset,
      textEncoder,
      chunkLength,
      chunk,
      _args = arguments;

  return regenerator.wrap(function makeStringIterator$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          options = _args.length > 1 && _args[1] !== undefined ? _args[1] : {};
          _options$chunkSize = options.chunkSize, chunkSize = _options$chunkSize === void 0 ? 256 * 1024 : _options$chunkSize;
          offset = 0;
          textEncoder = new TextEncoder();

        case 4:
          if (!(offset < string.length)) {
            _context.next = 12;
            break;
          }

          chunkLength = Math.min(string.length - offset, chunkSize);
          chunk = string.slice(offset, offset + chunkLength);
          offset += chunkLength;
          _context.next = 10;
          return textEncoder.encode(chunk);

        case 10:
          _context.next = 4;
          break;

        case 12:
        case "end":
          return _context.stop();
      }
    }
  }, _marked);
}

var _marked$1 = regenerator.mark(makeArrayBufferIterator);

function makeArrayBufferIterator(arrayBuffer) {
  var options,
      _options$chunkSize,
      chunkSize,
      byteOffset,
      chunkByteLength,
      chunk,
      sourceArray,
      chunkArray,
      _args = arguments;

  return regenerator.wrap(function makeArrayBufferIterator$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          options = _args.length > 1 && _args[1] !== undefined ? _args[1] : {};
          _options$chunkSize = options.chunkSize, chunkSize = _options$chunkSize === void 0 ? 256 * 1024 : _options$chunkSize;
          byteOffset = 0;

        case 3:
          if (!(byteOffset < arrayBuffer.byteLength)) {
            _context.next = 14;
            break;
          }

          chunkByteLength = Math.min(arrayBuffer.byteLength - byteOffset, chunkSize);
          chunk = new ArrayBuffer(chunkByteLength);
          sourceArray = new Uint8Array(arrayBuffer, byteOffset, chunkByteLength);
          chunkArray = new Uint8Array(chunk);
          chunkArray.set(sourceArray);
          byteOffset += chunkByteLength;
          _context.next = 12;
          return chunk;

        case 12:
          _context.next = 3;
          break;

        case 14:
        case "end":
          return _context.stop();
      }
    }
  }, _marked$1);
}

var DEFAULT_CHUNK_SIZE = 1024 * 1024;
function makeBlobIterator(_x) {
  return _makeBlobIterator.apply(this, arguments);
}

function _makeBlobIterator() {
  _makeBlobIterator = _wrapAsyncGenerator(regenerator.mark(function _callee(file) {
    var options,
        chunkSize,
        offset,
        end,
        chunk,
        _args = arguments;
    return regenerator.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            options = _args.length > 1 && _args[1] !== undefined ? _args[1] : {};
            chunkSize = options.chunkSize || DEFAULT_CHUNK_SIZE;
            offset = 0;

          case 3:
            if (!(offset < file.size)) {
              _context.next = 13;
              break;
            }

            end = offset + chunkSize;
            _context.next = 7;
            return _awaitAsyncGenerator(readFileSlice(file, offset, end));

          case 7:
            chunk = _context.sent;
            offset = end;
            _context.next = 11;
            return chunk;

          case 11:
            _context.next = 3;
            break;

          case 13:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));
  return _makeBlobIterator.apply(this, arguments);
}

function readFileSlice(_x2, _x3, _x4) {
  return _readFileSlice.apply(this, arguments);
}

function _readFileSlice() {
  _readFileSlice = _asyncToGenerator(regenerator.mark(function _callee2(file, offset, end) {
    return regenerator.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.next = 2;
            return new Promise(function (resolve, reject) {
              var slice = file.slice(offset, end);
              var fileReader = new FileReader();

              fileReader.onload = function (event) {
                return resolve(event.target && event.target.result);
              };

              fileReader.onerror = function (error) {
                return reject(error);
              };

              fileReader.readAsArrayBuffer(slice);
            });

          case 2:
            return _context2.abrupt("return", _context2.sent);

          case 3:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  }));
  return _readFileSlice.apply(this, arguments);
}

function makeStreamIterator(stream) {
  if (isBrowser || nodeVersion >= 10) {
    if (typeof stream[Symbol.asyncIterator] === 'function') {
      return makeToArrayBufferIterator(stream);
    }

    if (typeof stream.getIterator === 'function') {
      return stream.getIterator();
    }
  }

  return isBrowser ? makeBrowserStreamIterator(stream) : makeNodeStreamIterator(stream);
}

function makeToArrayBufferIterator(_x) {
  return _makeToArrayBufferIterator.apply(this, arguments);
}

function _makeToArrayBufferIterator() {
  _makeToArrayBufferIterator = _wrapAsyncGenerator(regenerator.mark(function _callee(asyncIterator) {
    var _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, _value, chunk;

    return regenerator.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _iteratorNormalCompletion = true;
            _didIteratorError = false;
            _context.prev = 2;
            _iterator = _asyncIterator(asyncIterator);

          case 4:
            _context.next = 6;
            return _awaitAsyncGenerator(_iterator.next());

          case 6:
            _step = _context.sent;
            _iteratorNormalCompletion = _step.done;
            _context.next = 10;
            return _awaitAsyncGenerator(_step.value);

          case 10:
            _value = _context.sent;

            if (_iteratorNormalCompletion) {
              _context.next = 18;
              break;
            }

            chunk = _value;
            _context.next = 15;
            return toArrayBuffer(chunk);

          case 15:
            _iteratorNormalCompletion = true;
            _context.next = 4;
            break;

          case 18:
            _context.next = 24;
            break;

          case 20:
            _context.prev = 20;
            _context.t0 = _context["catch"](2);
            _didIteratorError = true;
            _iteratorError = _context.t0;

          case 24:
            _context.prev = 24;
            _context.prev = 25;

            if (!(!_iteratorNormalCompletion && _iterator["return"] != null)) {
              _context.next = 29;
              break;
            }

            _context.next = 29;
            return _awaitAsyncGenerator(_iterator["return"]());

          case 29:
            _context.prev = 29;

            if (!_didIteratorError) {
              _context.next = 32;
              break;
            }

            throw _iteratorError;

          case 32:
            return _context.finish(29);

          case 33:
            return _context.finish(24);

          case 34:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, null, [[2, 20, 24, 34], [25,, 29, 33]]);
  }));
  return _makeToArrayBufferIterator.apply(this, arguments);
}

function makeBrowserStreamIterator(_x2) {
  return _makeBrowserStreamIterator.apply(this, arguments);
}

function _makeBrowserStreamIterator() {
  _makeBrowserStreamIterator = _wrapAsyncGenerator(regenerator.mark(function _callee2(stream) {
    var reader, _yield$_awaitAsyncGen, done, value;

    return regenerator.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            reader = stream.getReader();
            _context2.prev = 1;

          case 2:

            _context2.next = 5;
            return _awaitAsyncGenerator(reader.read());

          case 5:
            _yield$_awaitAsyncGen = _context2.sent;
            done = _yield$_awaitAsyncGen.done;
            value = _yield$_awaitAsyncGen.value;

            if (!done) {
              _context2.next = 10;
              break;
            }

            return _context2.abrupt("return");

          case 10:
            _context2.next = 12;
            return toArrayBuffer(value);

          case 12:
            _context2.next = 2;
            break;

          case 14:
            _context2.next = 19;
            break;

          case 16:
            _context2.prev = 16;
            _context2.t0 = _context2["catch"](1);
            reader.releaseLock();

          case 19:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, null, [[1, 16]]);
  }));
  return _makeBrowserStreamIterator.apply(this, arguments);
}

function makeNodeStreamIterator(_x3) {
  return _makeNodeStreamIterator.apply(this, arguments);
}

function _makeNodeStreamIterator() {
  _makeNodeStreamIterator = _wrapAsyncGenerator(regenerator.mark(function _callee3(stream) {
    var data;
    return regenerator.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            _context3.next = 2;
            return _awaitAsyncGenerator(stream);

          case 2:
            stream = _context3.sent;

          case 3:

            data = stream.read();

            if (!(data !== null)) {
              _context3.next = 9;
              break;
            }

            _context3.next = 8;
            return toArrayBuffer(data);

          case 8:
            return _context3.abrupt("continue", 3);

          case 9:
            if (!stream._readableState.ended) {
              _context3.next = 11;
              break;
            }

            return _context3.abrupt("return");

          case 11:
            _context3.next = 13;
            return _awaitAsyncGenerator(onceReadable(stream));

          case 13:
            _context3.next = 3;
            break;

          case 15:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3);
  }));
  return _makeNodeStreamIterator.apply(this, arguments);
}

function onceReadable(_x4) {
  return _onceReadable.apply(this, arguments);
}

function _onceReadable() {
  _onceReadable = _asyncToGenerator(regenerator.mark(function _callee4(stream) {
    return regenerator.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            return _context4.abrupt("return", new Promise(function (resolve) {
              stream.once('readable', resolve);
            }));

          case 1:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4);
  }));
  return _onceReadable.apply(this, arguments);
}

function makeIterator(data) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  if (typeof data === 'string') {
    return makeStringIterator(data, options);
  }

  if (data instanceof ArrayBuffer) {
    return makeArrayBufferIterator(data, options);
  }

  if (isBlob(data)) {
    return makeBlobIterator(data, options);
  }

  if (isReadableStream(data)) {
    return makeStreamIterator(data);
  }

  if (isResponse(data)) {
    return makeStreamIterator(data.body);
  }

  return assert(false);
}

var ERR_DATA = 'Cannot convert supplied data type';
function getArrayBufferOrStringFromDataSync(data, loader) {
  if (loader.text && typeof data === 'string') {
    return data;
  }

  if (data instanceof ArrayBuffer) {
    var arrayBuffer = data;

    if (loader.text && !loader.binary) {
      var textDecoder = new TextDecoder('utf8');
      return textDecoder.decode(arrayBuffer);
    }

    return arrayBuffer;
  }

  if (ArrayBuffer.isView(data) || isBuffer(data)) {
    if (loader.text && !loader.binary) {
      var _textDecoder = new TextDecoder('utf8');

      return _textDecoder.decode(data);
    }

    var _arrayBuffer = data.buffer;
    var byteLength = data.byteLength || data.length;

    if (data.byteOffset !== 0 || byteLength !== _arrayBuffer.byteLength) {
      _arrayBuffer = _arrayBuffer.slice(data.byteOffset, data.byteOffset + byteLength);
    }

    return _arrayBuffer;
  }

  throw new Error(ERR_DATA);
}
function getArrayBufferOrStringFromData(_x, _x2) {
  return _getArrayBufferOrStringFromData.apply(this, arguments);
}

function _getArrayBufferOrStringFromData() {
  _getArrayBufferOrStringFromData = _asyncToGenerator(regenerator.mark(function _callee(data, loader) {
    var isArrayBuffer, response;
    return regenerator.wrap(function _callee$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            isArrayBuffer = data instanceof ArrayBuffer || ArrayBuffer.isView(data);

            if (!(typeof data === 'string' || isArrayBuffer)) {
              _context3.next = 3;
              break;
            }

            return _context3.abrupt("return", getArrayBufferOrStringFromDataSync(data, loader));

          case 3:
            if (!isBlob(data)) {
              _context3.next = 7;
              break;
            }

            _context3.next = 6;
            return makeResponse(data);

          case 6:
            data = _context3.sent;

          case 7:
            if (!isResponse(data)) {
              _context3.next = 21;
              break;
            }

            response = data;
            _context3.next = 11;
            return checkResponse(response);

          case 11:
            if (!loader.binary) {
              _context3.next = 17;
              break;
            }

            _context3.next = 14;
            return response.arrayBuffer();

          case 14:
            _context3.t0 = _context3.sent;
            _context3.next = 20;
            break;

          case 17:
            _context3.next = 19;
            return response.text();

          case 19:
            _context3.t0 = _context3.sent;

          case 20:
            return _context3.abrupt("return", _context3.t0);

          case 21:
            if (isReadableStream(data)) {
              data = makeIterator(data);
            }

            if (!(isIterable(data) || isAsyncIterable(data))) {
              _context3.next = 24;
              break;
            }

            return _context3.abrupt("return", concatenateChunksAsync(data));

          case 24:
            throw new Error(ERR_DATA);

          case 25:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee);
  }));
  return _getArrayBufferOrStringFromData.apply(this, arguments);
}

function ownKeys$2(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread$2(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys$2(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys$2(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }
function getLoaderContext(context, options) {
  var previousContext = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

  if (previousContext) {
    return previousContext;
  }

  context = _objectSpread$2({
    fetch: getFetchFunction(options || {}, context)
  }, context);

  if (!Array.isArray(context.loaders)) {
    context.loaders = null;
  }

  return context;
}
function getLoaders(loaders, context) {
  if (!context && loaders && !Array.isArray(loaders)) {
    return loaders;
  }

  var candidateLoaders;

  if (loaders) {
    candidateLoaders = Array.isArray(loaders) ? loaders : [loaders];
  }

  if (context && context.loaders) {
    var contextLoaders = Array.isArray(context.loaders) ? context.loaders : [context.loaders];
    candidateLoaders = candidateLoaders ? [].concat(_toConsumableArray(candidateLoaders), _toConsumableArray(contextLoaders)) : contextLoaders;
  }

  return candidateLoaders && candidateLoaders.length ? candidateLoaders : null;
}

var VERSION$1 =  "2.3.6" ;
function canParseWithWorker(loader, data, options, context) {
  if (!WorkerFarm.isSupported()) {
    return false;
  }

  var loaderOptions = options && options[loader.id];

  if (options.worker === 'local' && loaderOptions && loaderOptions.localWorkerUrl || options.worker && loaderOptions && loaderOptions.workerUrl) {
    return loader.useWorker ? loader.useWorker(options) : true;
  }

  return false;
}
function parseWithWorker(loader, data, options, context) {
  var _ref = options || {},
      worker = _ref.worker;

  var loaderOptions = options && options[loader.id] || {};
  var workerUrl = worker === 'local' ? loaderOptions.localWorkerUrl : loaderOptions.workerUrl;
  var workerSource = "url(".concat(workerUrl, ")");
  var workerName = loader.name;
  var workerFarm = getWorkerFarm(options);
  options = JSON.parse(JSON.stringify(options));
  var warning = loader.version !== VERSION$1 ? "(core version ".concat(VERSION$1, ")") : '';
  return workerFarm.process(workerSource, "".concat(workerName, "-worker@").concat(loader.version).concat(warning), {
    arraybuffer: toArrayBuffer(data),
    options: options,
    source: "loaders.gl@".concat(VERSION$1),
    type: 'parse'
  });
}
var _workerFarm = null;

function getWorkerFarm() {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var props = {};

  if (options.maxConcurrency) {
    props.maxConcurrency = options.maxConcurrency;
  }

  if (options.onDebug) {
    props.onDebug = options.onDebug;
  }

  if (!_workerFarm) {
    _workerFarm = new WorkerFarm({
      onMessage: onWorkerMessage$1
    });
  }

  _workerFarm.setProps(props);

  return _workerFarm;
}

function onWorkerMessage$1(_x) {
  return _onWorkerMessage.apply(this, arguments);
}

function _onWorkerMessage() {
  _onWorkerMessage = _asyncToGenerator(regenerator.mark(function _callee(_ref2) {
    var worker, data, resolve, reject, result;
    return regenerator.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            worker = _ref2.worker, data = _ref2.data, resolve = _ref2.resolve, reject = _ref2.reject;
            _context.t0 = data.type;
            _context.next = _context.t0 === 'done' ? 4 : _context.t0 === 'parse' ? 6 : _context.t0 === 'error' ? 17 : 19;
            break;

          case 4:
            resolve(data.result);
            return _context.abrupt("break", 19);

          case 6:
            _context.prev = 6;
            _context.next = 9;
            return parse(data.arraybuffer, data.options, data.url);

          case 9:
            result = _context.sent;
            worker.postMessage({
              type: 'parse-done',
              id: data.id,
              result: result
            }, getTransferList(result));
            _context.next = 16;
            break;

          case 13:
            _context.prev = 13;
            _context.t1 = _context["catch"](6);
            worker.postMessage({
              type: 'parse-error',
              id: data.id,
              message: _context.t1.message
            });

          case 16:
            return _context.abrupt("break", 19);

          case 17:
            reject(data.message);
            return _context.abrupt("break", 19);

          case 19:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, null, [[6, 13]]);
  }));
  return _onWorkerMessage.apply(this, arguments);
}

function ownKeys$3(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread$3(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys$3(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys$3(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _createForOfIteratorHelper$3(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray$3(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray$3(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray$3(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray$3(o, minLen); }

function _arrayLikeToArray$3(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }
var EXT_PATTERN = /\.([^.]+)$/;
function selectLoader(_x) {
  return _selectLoader.apply(this, arguments);
}

function _selectLoader() {
  _selectLoader = _asyncToGenerator(regenerator.mark(function _callee(data) {
    var loaders,
        options,
        context,
        loader,
        _args = arguments;
    return regenerator.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            loaders = _args.length > 1 && _args[1] !== undefined ? _args[1] : [];
            options = _args.length > 2 && _args[2] !== undefined ? _args[2] : {};
            context = _args.length > 3 && _args[3] !== undefined ? _args[3] : {};
            loader = selectLoaderSync(data, loaders, _objectSpread$3(_objectSpread$3({}, options), {}, {
              nothrow: true
            }), context);

            if (!loader) {
              _context.next = 6;
              break;
            }

            return _context.abrupt("return", loader);

          case 6:
            if (!isBlob(data)) {
              _context.next = 11;
              break;
            }

            _context.next = 9;
            return readFileSlice(data, 0, 10);

          case 9:
            data = _context.sent;
            loader = selectLoaderSync(data, loaders, options, context);

          case 11:
            if (!(!loader && !options.nothrow)) {
              _context.next = 13;
              break;
            }

            throw new Error(getNoValidLoaderMessage(data));

          case 13:
            return _context.abrupt("return", loader);

          case 14:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));
  return _selectLoader.apply(this, arguments);
}

function selectLoaderSync(data) {
  var loaders = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  var context = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

  if (loaders && !Array.isArray(loaders)) {
    return normalizeLoader(loaders);
  }

  loaders = [].concat(_toConsumableArray(loaders || []), _toConsumableArray(getRegisteredLoaders()));
  normalizeLoaders(loaders);

  var _getResourceUrlAndTyp = getResourceUrlAndType(data),
      url = _getResourceUrlAndTyp.url,
      type = _getResourceUrlAndTyp.type;

  var loader = findLoaderByUrl(loaders, url || context.url);
  loader = loader || findLoaderByContentType(loaders, type);
  loader = loader || findLoaderByExamingInitialData(loaders, data);

  if (!loader && !options.nothrow) {
    throw new Error(getNoValidLoaderMessage(data));
  }

  return loader;
}

function getNoValidLoaderMessage(data) {
  var _getResourceUrlAndTyp2 = getResourceUrlAndType(data),
      url = _getResourceUrlAndTyp2.url,
      type = _getResourceUrlAndTyp2.type;

  var message = 'No valid loader found';

  if (data) {
    message += " data: \"".concat(getFirstCharacters(data), "\", contentType: \"").concat(type, "\"");
  }

  if (url) {
    message += " url: ".concat(url);
  }

  return message;
}

function normalizeLoaders(loaders) {
  var _iterator = _createForOfIteratorHelper$3(loaders),
      _step;

  try {
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      var loader = _step.value;
      normalizeLoader(loader);
    }
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }
}

function findLoaderByUrl(loaders, url) {
  var match = url && url.match(EXT_PATTERN);
  var extension = match && match[1];
  return extension && findLoaderByExtension(loaders, extension);
}

function findLoaderByExtension(loaders, extension) {
  extension = extension.toLowerCase();

  var _iterator2 = _createForOfIteratorHelper$3(loaders),
      _step2;

  try {
    for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
      var loader = _step2.value;

      var _iterator3 = _createForOfIteratorHelper$3(loader.extensions),
          _step3;

      try {
        for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
          var loaderExtension = _step3.value;

          if (loaderExtension.toLowerCase() === extension) {
            return loader;
          }
        }
      } catch (err) {
        _iterator3.e(err);
      } finally {
        _iterator3.f();
      }
    }
  } catch (err) {
    _iterator2.e(err);
  } finally {
    _iterator2.f();
  }

  return null;
}

function findLoaderByContentType(loaders, mimeType) {
  var _iterator4 = _createForOfIteratorHelper$3(loaders),
      _step4;

  try {
    for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
      var loader = _step4.value;

      if (loader.mimeTypes && loader.mimeTypes.includes(mimeType)) {
        return loader;
      }

      if (mimeType === "application/x.".concat(loader.id)) {
        return loader;
      }
    }
  } catch (err) {
    _iterator4.e(err);
  } finally {
    _iterator4.f();
  }

  return null;
}

function findLoaderByExamingInitialData(loaders, data) {
  if (!data) {
    return null;
  }

  var _iterator5 = _createForOfIteratorHelper$3(loaders),
      _step5;

  try {
    for (_iterator5.s(); !(_step5 = _iterator5.n()).done;) {
      var loader = _step5.value;

      if (typeof data === 'string') {
        if (testDataAgainstText(data, loader)) {
          return loader;
        }
      } else if (ArrayBuffer.isView(data)) {
        if (testDataAgainstBinary(data.buffer, data.byteOffset, loader)) {
          return loader;
        }
      } else if (data instanceof ArrayBuffer) {
        var byteOffset = 0;

        if (testDataAgainstBinary(data, byteOffset, loader)) {
          return loader;
        }
      }
    }
  } catch (err) {
    _iterator5.e(err);
  } finally {
    _iterator5.f();
  }

  return null;
}

function testDataAgainstText(data, loader) {
  return loader.testText && loader.testText(data);
}

function testDataAgainstBinary(data, byteOffset, loader) {
  var tests = Array.isArray(loader.tests) ? loader.tests : [loader.tests];
  return tests.some(function (test) {
    return testBinary(data, byteOffset, loader, test);
  });
}

function testBinary(data, byteOffset, loader, test) {
  if (test instanceof ArrayBuffer) {
    return compareArrayBuffers(test, data, test.byteLength);
  }

  switch (_typeof(test)) {
    case 'function':
      return test(data, loader);

    case 'string':
      var magic = getMagicString(data, byteOffset, test.length);
      return test === magic;

    default:
      return false;
  }
}

function getFirstCharacters(data) {
  var length = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 5;

  if (typeof data === 'string') {
    return data.slice(0, length);
  } else if (ArrayBuffer.isView(data)) {
    return getMagicString(data.buffer, data.byteOffset, length);
  } else if (data instanceof ArrayBuffer) {
    var byteOffset = 0;
    return getMagicString(data, byteOffset, length);
  }

  return '';
}

function getMagicString(arrayBuffer, byteOffset, length) {
  if (arrayBuffer.byteLength < byteOffset + length) {
    return '';
  }

  var dataView = new DataView(arrayBuffer);
  var magic = '';

  for (var i = 0; i < length; i++) {
    magic += String.fromCharCode(dataView.getUint8(byteOffset + i));
  }

  return magic;
}

function parse(_x, _x2, _x3, _x4) {
  return _parse.apply(this, arguments);
}

function _parse() {
  _parse = _asyncToGenerator(regenerator.mark(function _callee(data, loaders, options, context) {
    var _getResourceUrlAndTyp, url, candidateLoaders, loader;

    return regenerator.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            assert(!context || typeof context !== 'string', 'parse no longer accepts final url');

            if (loaders && !Array.isArray(loaders) && !isLoaderObject(loaders)) {
              context = options;
              options = loaders;
              loaders = null;
            }

            _context.next = 4;
            return data;

          case 4:
            data = _context.sent;
            options = options || {};
            _getResourceUrlAndTyp = getResourceUrlAndType(data), url = _getResourceUrlAndTyp.url;
            candidateLoaders = getLoaders(loaders, context);
            _context.next = 10;
            return selectLoader(data, candidateLoaders, options);

          case 10:
            loader = _context.sent;

            if (loader) {
              _context.next = 13;
              break;
            }

            return _context.abrupt("return", null);

          case 13:
            options = normalizeOptions(options, loader, candidateLoaders, url);
            context = getLoaderContext({
              url: url,
              parse: parse,
              loaders: candidateLoaders
            }, options, context);
            _context.next = 17;
            return parseWithLoader(loader, data, options, context);

          case 17:
            return _context.abrupt("return", _context.sent);

          case 18:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));
  return _parse.apply(this, arguments);
}

function parseWithLoader(_x5, _x6, _x7, _x8) {
  return _parseWithLoader.apply(this, arguments);
}

function _parseWithLoader() {
  _parseWithLoader = _asyncToGenerator(regenerator.mark(function _callee2(loader, data, options, context) {
    return regenerator.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            validateLoaderVersion(loader);
            _context2.next = 3;
            return getArrayBufferOrStringFromData(data, loader);

          case 3:
            data = _context2.sent;

            if (!(loader.parseTextSync && typeof data === 'string')) {
              _context2.next = 7;
              break;
            }

            options.dataType = 'text';
            return _context2.abrupt("return", loader.parseTextSync(data, options, context, loader));

          case 7:
            if (!canParseWithWorker(loader, data, options)) {
              _context2.next = 11;
              break;
            }

            _context2.next = 10;
            return parseWithWorker(loader, data, options);

          case 10:
            return _context2.abrupt("return", _context2.sent);

          case 11:
            if (!(loader.parseText && typeof data === 'string')) {
              _context2.next = 15;
              break;
            }

            _context2.next = 14;
            return loader.parseText(data, options, context, loader);

          case 14:
            return _context2.abrupt("return", _context2.sent);

          case 15:
            if (!loader.parse) {
              _context2.next = 19;
              break;
            }

            _context2.next = 18;
            return loader.parse(data, options, context, loader);

          case 18:
            return _context2.abrupt("return", _context2.sent);

          case 19:
            assert(!loader.parseSync);
            return _context2.abrupt("return", assert(false));

          case 21:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  }));
  return _parseWithLoader.apply(this, arguments);
}

function load(_x, _x2, _x3) {
  return _load.apply(this, arguments);
}

function _load() {
  _load = _asyncToGenerator(regenerator.mark(function _callee(url, loaders, options) {
    var fetch, data;
    return regenerator.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            if (!Array.isArray(loaders) && !isLoaderObject(loaders)) {
              options = loaders;
              loaders = null;
            }

            fetch = getFetchFunction(options || {});
            data = url;

            if (!(typeof url === 'string')) {
              _context.next = 9;
              break;
            }

            _context.next = 6;
            return fetch(url);

          case 6:
            data = _context.sent;
            _context.next = 10;
            break;

          case 9:
            url = null;

          case 10:
            if (!isBlob(url)) {
              _context.next = 15;
              break;
            }

            _context.next = 13;
            return fetch(url);

          case 13:
            data = _context.sent;
            url = null;

          case 15:
            _context.next = 17;
            return parse(data, loaders, options);

          case 17:
            return _context.abrupt("return", _context.sent);

          case 18:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));
  return _load.apply(this, arguments);
}

var interopRequireDefault = createCommonjsModule(function (module) {
function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {
    "default": obj
  };
}

module.exports = _interopRequireDefault;
});

var _typeof_1 = createCommonjsModule(function (module) {
function _typeof(obj) {
  "@babel/helpers - typeof";

  if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
    module.exports = _typeof = function _typeof(obj) {
      return typeof obj;
    };
  } else {
    module.exports = _typeof = function _typeof(obj) {
      return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };
  }

  return _typeof(obj);
}

module.exports = _typeof;
});

var interopRequireWildcard = createCommonjsModule(function (module) {
function _getRequireWildcardCache() {
  if (typeof WeakMap !== "function") return null;
  var cache = new WeakMap();

  _getRequireWildcardCache = function _getRequireWildcardCache() {
    return cache;
  };

  return cache;
}

function _interopRequireWildcard(obj) {
  if (obj && obj.__esModule) {
    return obj;
  }

  if (obj === null || _typeof_1(obj) !== "object" && typeof obj !== "function") {
    return {
      "default": obj
    };
  }

  var cache = _getRequireWildcardCache();

  if (cache && cache.has(obj)) {
    return cache.get(obj);
  }

  var newObj = {};
  var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor;

  for (var key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null;

      if (desc && (desc.get || desc.set)) {
        Object.defineProperty(newObj, key, desc);
      } else {
        newObj[key] = obj[key];
      }
    }
  }

  newObj["default"] = obj;

  if (cache) {
    cache.set(obj, newObj);
  }

  return newObj;
}

module.exports = _interopRequireWildcard;
});

var globals_1 = createCommonjsModule(function (module, exports) {



Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.console = exports.process = exports.document = exports.global = exports.window = exports.self = void 0;

var _typeof2 = interopRequireDefault(_typeof_1);

var globals = {
  self: typeof self !== 'undefined' && self,
  window: typeof window !== 'undefined' && window,
  global: typeof commonjsGlobal !== 'undefined' && commonjsGlobal,
  document: typeof document !== 'undefined' && document,
  process: (typeof process === "undefined" ? "undefined" : (0, _typeof2["default"])(process)) === 'object' && process
};
var self_ = globals.self || globals.window || globals.global;
exports.self = self_;
var window_ = globals.window || globals.self || globals.global;
exports.window = window_;
var global_ = globals.global || globals.self || globals.window;
exports.global = global_;
var document_ = globals.document || {};
exports.document = document_;
var process_ = globals.process || {};
exports.process = process_;
var console_ = console;
exports.console = console_;

});

var isElectron_1 = createCommonjsModule(function (module, exports) {



Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = isElectron;

var _typeof2 = interopRequireDefault(_typeof_1);

function isElectron(mockUserAgent) {
  if (typeof window !== 'undefined' && (0, _typeof2["default"])(window.process) === 'object' && window.process.type === 'renderer') {
    return true;
  }

  if (typeof process !== 'undefined' && (0, _typeof2["default"])(process.versions) === 'object' && Boolean(process.versions.electron)) {
    return true;
  }

  var realUserAgent = (typeof navigator === "undefined" ? "undefined" : (0, _typeof2["default"])(navigator)) === 'object' && typeof navigator.userAgent === 'string' && navigator.userAgent;
  var userAgent = mockUserAgent || realUserAgent;

  if (userAgent && userAgent.indexOf('Electron') >= 0) {
    return true;
  }

  return false;
}

});

var isBrowser_1 = createCommonjsModule(function (module, exports) {



Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = isBrowser;
exports.isBrowserMainThread = isBrowserMainThread;

var _typeof2 = interopRequireDefault(_typeof_1);

var _isElectron = interopRequireDefault(isElectron_1);

function isBrowser() {
  var isNode = (typeof process === "undefined" ? "undefined" : (0, _typeof2["default"])(process)) === 'object' && String(process) === '[object process]' && !process.browser;
  return !isNode || (0, _isElectron["default"])();
}

function isBrowserMainThread() {
  return isBrowser() && typeof document !== 'undefined';
}

});

var getBrowser_1 = createCommonjsModule(function (module, exports) {



Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isMobile = isMobile;
exports["default"] = getBrowser;



var _isBrowser = interopRequireDefault(isBrowser_1);

var _isElectron = interopRequireDefault(isElectron_1);

function isMobile() {
  return typeof globals_1.window.orientation !== 'undefined';
}

function getBrowser(mockUserAgent) {
  if (!mockUserAgent && !(0, _isBrowser["default"])()) {
    return 'Node';
  }

  if ((0, _isElectron["default"])(mockUserAgent)) {
    return 'Electron';
  }

  var navigator_ = typeof navigator !== 'undefined' ? navigator : {};
  var userAgent = mockUserAgent || navigator_.userAgent || '';

  if (userAgent.indexOf('Edge') > -1) {
    return 'Edge';
  }

  var isMSIE = userAgent.indexOf('MSIE ') !== -1;
  var isTrident = userAgent.indexOf('Trident/') !== -1;

  if (isMSIE || isTrident) {
    return 'IE';
  }

  if (globals_1.window.chrome) {
    return 'Chrome';
  }

  if (globals_1.window.safari) {
    return 'Safari';
  }

  if (globals_1.window.mozInnerScreenX) {
    return 'Firefox';
  }

  return 'Unknown';
}

});

var env = createCommonjsModule(function (module, exports) {





Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "self", {
  enumerable: true,
  get: function get() {
    return globals_1.self;
  }
});
Object.defineProperty(exports, "window", {
  enumerable: true,
  get: function get() {
    return globals_1.window;
  }
});
Object.defineProperty(exports, "global", {
  enumerable: true,
  get: function get() {
    return globals_1.global;
  }
});
Object.defineProperty(exports, "document", {
  enumerable: true,
  get: function get() {
    return globals_1.document;
  }
});
Object.defineProperty(exports, "process", {
  enumerable: true,
  get: function get() {
    return globals_1.process;
  }
});
Object.defineProperty(exports, "console", {
  enumerable: true,
  get: function get() {
    return globals_1.console;
  }
});
Object.defineProperty(exports, "isBrowser", {
  enumerable: true,
  get: function get() {
    return _isBrowser["default"];
  }
});
Object.defineProperty(exports, "isBrowserMainThread", {
  enumerable: true,
  get: function get() {
    return _isBrowser.isBrowserMainThread;
  }
});
Object.defineProperty(exports, "getBrowser", {
  enumerable: true,
  get: function get() {
    return _getBrowser["default"];
  }
});
Object.defineProperty(exports, "isMobile", {
  enumerable: true,
  get: function get() {
    return _getBrowser.isMobile;
  }
});
Object.defineProperty(exports, "isElectron", {
  enumerable: true,
  get: function get() {
    return _isElectron["default"];
  }
});



var _isBrowser = interopRequireWildcard(isBrowser_1);

var _getBrowser = interopRequireWildcard(getBrowser_1);

var _isElectron = interopRequireDefault(isElectron_1);

});

// This file enables: import 'probe.gl/bench'.
// Note: Must be published using package.json "files" field
var env$1 = env;

function isElectron(mockUserAgent) {
  if (typeof window !== 'undefined' && _typeof(window.process) === 'object' && window.process.type === 'renderer') {
    return true;
  }

  if (typeof process !== 'undefined' && _typeof(process.versions) === 'object' && Boolean(process.versions.electron)) {
    return true;
  }

  var realUserAgent = (typeof navigator === "undefined" ? "undefined" : _typeof(navigator)) === 'object' && typeof navigator.userAgent === 'string' && navigator.userAgent;
  var userAgent = mockUserAgent || realUserAgent;

  if (userAgent && userAgent.indexOf('Electron') >= 0) {
    return true;
  }

  return false;
}

function isBrowser$1() {
  var isNode = (typeof process === "undefined" ? "undefined" : _typeof(process)) === 'object' && String(process) === '[object process]' && !process.browser;
  return !isNode || isElectron();
}

var globals$1 = {
  self: typeof self !== 'undefined' && self,
  window: typeof window !== 'undefined' && window,
  global: typeof global !== 'undefined' && global,
  document: typeof document !== 'undefined' && document,
  process: (typeof process === "undefined" ? "undefined" : _typeof(process)) === 'object' && process
};
var window_ = globals$1.window || globals$1.self || globals$1.global;
var process_ = globals$1.process || {};

var VERSION$2 = typeof __VERSION__ !== 'undefined' ? __VERSION__ : 'untranspiled source';
var isBrowser$2 = isBrowser$1();

function getStorage(type) {
  try {
    var storage = window[type];
    var x = '__storage_test__';
    storage.setItem(x, x);
    storage.removeItem(x);
    return storage;
  } catch (e) {
    return null;
  }
}

var LocalStorage = function () {
  function LocalStorage(id, defaultSettings) {
    var type = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'sessionStorage';

    _classCallCheck(this, LocalStorage);

    this.storage = getStorage(type);
    this.id = id;
    this.config = {};
    Object.assign(this.config, defaultSettings);

    this._loadConfiguration();
  }

  _createClass(LocalStorage, [{
    key: "getConfiguration",
    value: function getConfiguration() {
      return this.config;
    }
  }, {
    key: "setConfiguration",
    value: function setConfiguration(configuration) {
      this.config = {};
      return this.updateConfiguration(configuration);
    }
  }, {
    key: "updateConfiguration",
    value: function updateConfiguration(configuration) {
      Object.assign(this.config, configuration);

      if (this.storage) {
        var serialized = JSON.stringify(this.config);
        this.storage.setItem(this.id, serialized);
      }

      return this;
    }
  }, {
    key: "_loadConfiguration",
    value: function _loadConfiguration() {
      var configuration = {};

      if (this.storage) {
        var serializedConfiguration = this.storage.getItem(this.id);
        configuration = serializedConfiguration ? JSON.parse(serializedConfiguration) : {};
      }

      Object.assign(this.config, configuration);
      return this;
    }
  }]);

  return LocalStorage;
}();

function formatTime(ms) {
  var formatted;

  if (ms < 10) {
    formatted = "".concat(ms.toFixed(2), "ms");
  } else if (ms < 100) {
    formatted = "".concat(ms.toFixed(1), "ms");
  } else if (ms < 1000) {
    formatted = "".concat(ms.toFixed(0), "ms");
  } else {
    formatted = "".concat((ms / 1000).toFixed(2), "s");
  }

  return formatted;
}
function leftPad(string) {
  var length = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 8;
  var padLength = Math.max(length - string.length, 0);
  return "".concat(' '.repeat(padLength)).concat(string);
}

function formatImage(image, message, scale) {
  var maxWidth = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 600;
  var imageUrl = image.src.replace(/\(/g, '%28').replace(/\)/g, '%29');

  if (image.width > maxWidth) {
    scale = Math.min(scale, maxWidth / image.width);
  }

  var width = image.width * scale;
  var height = image.height * scale;
  var style = ['font-size:1px;', "padding:".concat(Math.floor(height / 2), "px ").concat(Math.floor(width / 2), "px;"), "line-height:".concat(height, "px;"), "background:url(".concat(imageUrl, ");"), "background-size:".concat(width, "px ").concat(height, "px;"), 'color:transparent;'].join('');
  return ["".concat(message, " %c+"), style];
}

var COLOR = {
  BLACK: 30,
  RED: 31,
  GREEN: 32,
  YELLOW: 33,
  BLUE: 34,
  MAGENTA: 35,
  CYAN: 36,
  WHITE: 37,
  BRIGHT_BLACK: 90,
  BRIGHT_RED: 91,
  BRIGHT_GREEN: 92,
  BRIGHT_YELLOW: 93,
  BRIGHT_BLUE: 94,
  BRIGHT_MAGENTA: 95,
  BRIGHT_CYAN: 96,
  BRIGHT_WHITE: 97
};

function getColor(color) {
  return typeof color === 'string' ? COLOR[color.toUpperCase()] || COLOR.WHITE : color;
}

function addColor(string, color, background) {
  if (!isBrowser$2 && typeof string === 'string') {
    if (color) {
      color = getColor(color);
      string = "\x1B[".concat(color, "m").concat(string, "\x1B[39m");
    }

    if (background) {
      color = getColor(background);
      string = "\x1B[".concat(background + 10, "m").concat(string, "\x1B[49m");
    }
  }

  return string;
}

function _createForOfIteratorHelper$4(o) { if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (o = _unsupportedIterableToArray$4(o))) { var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var it, normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray$4(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray$4(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(n); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray$4(o, minLen); }

function _arrayLikeToArray$4(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function autobind(obj) {
  var predefined = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : ['constructor'];
  var proto = Object.getPrototypeOf(obj);
  var propNames = Object.getOwnPropertyNames(proto);

  var _iterator = _createForOfIteratorHelper$4(propNames),
      _step;

  try {
    var _loop = function _loop() {
      var key = _step.value;

      if (typeof obj[key] === 'function') {
        if (!predefined.find(function (name) {
          return key === name;
        })) {
          obj[key] = obj[key].bind(obj);
        }
      }
    };

    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      _loop();
    }
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }
}

function assert$1(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

function getHiResTimestamp$1() {
  var timestamp;

  if (isBrowser$2 && window_.performance) {
    timestamp = window_.performance.now();
  } else if (process_.hrtime) {
    var timeParts = process_.hrtime();
    timestamp = timeParts[0] * 1000 + timeParts[1] / 1e6;
  } else {
    timestamp = Date.now();
  }

  return timestamp;
}

var originalConsole = {
  debug: isBrowser$2 ? console.debug || console.log : console.log,
  log: console.log,
  info: console.info,
  warn: console.warn,
  error: console.error
};
var DEFAULT_SETTINGS = {
  enabled: true,
  level: 0
};

function noop() {}

var cache = {};
var ONCE = {
  once: true
};

function getTableHeader(table) {
  for (var key in table) {
    for (var title in table[key]) {
      return title || 'untitled';
    }
  }

  return 'empty';
}

var Log = function () {
  function Log() {
    var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        id = _ref.id;

    _classCallCheck(this, Log);

    this.id = id;
    this.VERSION = VERSION$2;
    this._startTs = getHiResTimestamp$1();
    this._deltaTs = getHiResTimestamp$1();
    this.LOG_THROTTLE_TIMEOUT = 0;
    this._storage = new LocalStorage("__probe-".concat(this.id, "__"), DEFAULT_SETTINGS);
    this.userData = {};
    this.timeStamp("".concat(this.id, " started"));
    autobind(this);
    Object.seal(this);
  }

  _createClass(Log, [{
    key: "isEnabled",
    value: function isEnabled() {
      return this._storage.config.enabled;
    }
  }, {
    key: "getLevel",
    value: function getLevel() {
      return this._storage.config.level;
    }
  }, {
    key: "getTotal",
    value: function getTotal() {
      return Number((getHiResTimestamp$1() - this._startTs).toPrecision(10));
    }
  }, {
    key: "getDelta",
    value: function getDelta() {
      return Number((getHiResTimestamp$1() - this._deltaTs).toPrecision(10));
    }
  }, {
    key: "getPriority",
    value: function getPriority() {
      return this.level;
    }
  }, {
    key: "enable",
    value: function enable() {
      var enabled = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;

      this._storage.updateConfiguration({
        enabled: enabled
      });

      return this;
    }
  }, {
    key: "setLevel",
    value: function setLevel(level) {
      this._storage.updateConfiguration({
        level: level
      });

      return this;
    }
  }, {
    key: "assert",
    value: function assert(condition, message) {
      assert$1(condition, message);
    }
  }, {
    key: "warn",
    value: function warn(message) {
      return this._getLogFunction(0, message, originalConsole.warn, arguments, ONCE);
    }
  }, {
    key: "error",
    value: function error(message) {
      return this._getLogFunction(0, message, originalConsole.error, arguments);
    }
  }, {
    key: "deprecated",
    value: function deprecated(oldUsage, newUsage) {
      return this.warn("`".concat(oldUsage, "` is deprecated and will be removed in a later version. Use `").concat(newUsage, "` instead"));
    }
  }, {
    key: "removed",
    value: function removed(oldUsage, newUsage) {
      return this.error("`".concat(oldUsage, "` has been removed. Use `").concat(newUsage, "` instead"));
    }
  }, {
    key: "probe",
    value: function probe(logLevel, message) {
      return this._getLogFunction(logLevel, message, originalConsole.log, arguments, {
        time: true,
        once: true
      });
    }
  }, {
    key: "log",
    value: function log(logLevel, message) {
      return this._getLogFunction(logLevel, message, originalConsole.debug, arguments);
    }
  }, {
    key: "info",
    value: function info(logLevel, message) {
      return this._getLogFunction(logLevel, message, console.info, arguments);
    }
  }, {
    key: "once",
    value: function once(logLevel, message) {
      return this._getLogFunction(logLevel, message, originalConsole.debug || originalConsole.info, arguments, ONCE);
    }
  }, {
    key: "table",
    value: function table(logLevel, _table, columns) {
      if (_table) {
        return this._getLogFunction(logLevel, _table, console.table || noop, columns && [columns], {
          tag: getTableHeader(_table)
        });
      }

      return noop;
    }
  }, {
    key: "image",
    value: function image(_ref2) {
      var logLevel = _ref2.logLevel,
          priority = _ref2.priority,
          _image = _ref2.image,
          _ref2$message = _ref2.message,
          message = _ref2$message === void 0 ? '' : _ref2$message,
          _ref2$scale = _ref2.scale,
          scale = _ref2$scale === void 0 ? 1 : _ref2$scale;

      if (!this._shouldLog(logLevel || priority)) {
        return noop;
      }

      return isBrowser$2 ? logImageInBrowser({
        image: _image,
        message: message,
        scale: scale
      }) : logImageInNode({
        image: _image,
        message: message,
        scale: scale
      });
    }
  }, {
    key: "settings",
    value: function settings() {
      if (console.table) {
        console.table(this._storage.config);
      } else {
        console.log(this._storage.config);
      }
    }
  }, {
    key: "get",
    value: function get(setting) {
      return this._storage.config[setting];
    }
  }, {
    key: "set",
    value: function set(setting, value) {
      this._storage.updateConfiguration(_defineProperty({}, setting, value));
    }
  }, {
    key: "time",
    value: function time(logLevel, message) {
      return this._getLogFunction(logLevel, message, console.time ? console.time : console.info);
    }
  }, {
    key: "timeEnd",
    value: function timeEnd(logLevel, message) {
      return this._getLogFunction(logLevel, message, console.timeEnd ? console.timeEnd : console.info);
    }
  }, {
    key: "timeStamp",
    value: function timeStamp(logLevel, message) {
      return this._getLogFunction(logLevel, message, console.timeStamp || noop);
    }
  }, {
    key: "group",
    value: function group(logLevel, message) {
      var opts = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {
        collapsed: false
      };
      opts = normalizeArguments({
        logLevel: logLevel,
        message: message,
        opts: opts
      });
      var _opts = opts,
          collapsed = _opts.collapsed;
      opts.method = (collapsed ? console.groupCollapsed : console.group) || console.info;
      return this._getLogFunction(opts);
    }
  }, {
    key: "groupCollapsed",
    value: function groupCollapsed(logLevel, message) {
      var opts = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
      return this.group(logLevel, message, Object.assign({}, opts, {
        collapsed: true
      }));
    }
  }, {
    key: "groupEnd",
    value: function groupEnd(logLevel) {
      return this._getLogFunction(logLevel, '', console.groupEnd || noop);
    }
  }, {
    key: "withGroup",
    value: function withGroup(logLevel, message, func) {
      this.group(logLevel, message)();

      try {
        func();
      } finally {
        this.groupEnd(logLevel)();
      }
    }
  }, {
    key: "trace",
    value: function trace() {
      if (console.trace) {
        console.trace();
      }
    }
  }, {
    key: "_shouldLog",
    value: function _shouldLog(logLevel) {
      return this.isEnabled() && this.getLevel() >= normalizeLogLevel(logLevel);
    }
  }, {
    key: "_getLogFunction",
    value: function _getLogFunction(logLevel, message, method) {
      var args = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : [];
      var opts = arguments.length > 4 ? arguments[4] : undefined;

      if (this._shouldLog(logLevel)) {
        var _method;

        opts = normalizeArguments({
          logLevel: logLevel,
          message: message,
          args: args,
          opts: opts
        });
        method = method || opts.method;

        assert$1(method);

        opts.total = this.getTotal();
        opts.delta = this.getDelta();
        this._deltaTs = getHiResTimestamp$1();
        var tag = opts.tag || opts.message;

        if (opts.once) {
          if (!cache[tag]) {
            cache[tag] = getHiResTimestamp$1();
          } else {
            return noop;
          }
        }

        message = decorateMessage(this.id, opts.message, opts);
        return (_method = method).bind.apply(_method, [console, message].concat(_toConsumableArray(opts.args)));
      }

      return noop;
    }
  }, {
    key: "level",
    set: function set(newLevel) {
      this.setLevel(newLevel);
    },
    get: function get() {
      return this.getLevel();
    }
  }, {
    key: "priority",
    set: function set(newPriority) {
      this.level = newPriority;
    },
    get: function get() {
      return this.level;
    }
  }]);

  return Log;
}();
Log.VERSION = VERSION$2;

function normalizeLogLevel(logLevel) {
  if (!logLevel) {
    return 0;
  }

  var resolvedLevel;

  switch (_typeof(logLevel)) {
    case 'number':
      resolvedLevel = logLevel;
      break;

    case 'object':
      resolvedLevel = logLevel.logLevel || logLevel.priority || 0;
      break;

    default:
      return 0;
  }

  assert$1(Number.isFinite(resolvedLevel) && resolvedLevel >= 0);

  return resolvedLevel;
}

function normalizeArguments(opts) {
  var logLevel = opts.logLevel,
      message = opts.message;
  opts.logLevel = normalizeLogLevel(logLevel);
  var args = opts.args ? Array.from(opts.args) : [];

  while (args.length && args.shift() !== message) {}

  opts.args = args;

  switch (_typeof(logLevel)) {
    case 'string':
    case 'function':
      if (message !== undefined) {
        args.unshift(message);
      }

      opts.message = logLevel;
      break;

    case 'object':
      Object.assign(opts, logLevel);
      break;
  }

  if (typeof opts.message === 'function') {
    opts.message = opts.message();
  }

  var messageType = _typeof(opts.message);

  assert$1(messageType === 'string' || messageType === 'object');

  return Object.assign(opts, opts.opts);
}

function decorateMessage(id, message, opts) {
  if (typeof message === 'string') {
    var time = opts.time ? leftPad(formatTime(opts.total)) : '';
    message = opts.time ? "".concat(id, ": ").concat(time, "  ").concat(message) : "".concat(id, ": ").concat(message);
    message = addColor(message, opts.color, opts.background);
  }

  return message;
}

function logImageInNode(_ref3) {
  var image = _ref3.image,
      _ref3$message = _ref3.message,
      _ref3$scale = _ref3.scale,
      scale = _ref3$scale === void 0 ? 1 : _ref3$scale;
  var asciify = null;

  try {
    asciify = module.require('asciify-image');
  } catch (error) {}

  if (asciify) {
    return function () {
      return asciify(image, {
        fit: 'box',
        width: "".concat(Math.round(80 * scale), "%")
      }).then(function (data) {
        return console.log(data);
      });
    };
  }

  return noop;
}

function logImageInBrowser(_ref4) {
  var image = _ref4.image,
      _ref4$message = _ref4.message,
      message = _ref4$message === void 0 ? '' : _ref4$message,
      _ref4$scale = _ref4.scale,
      scale = _ref4$scale === void 0 ? 1 : _ref4$scale;

  if (typeof image === 'string') {
    var img = new Image();

    img.onload = function () {
      var _console;

      var args = formatImage(img, message, scale);

      (_console = console).log.apply(_console, _toConsumableArray(args));
    };

    img.src = image;
    return noop;
  }

  var element = image.nodeName || '';

  if (element.toLowerCase() === 'img') {
    var _console2;

    (_console2 = console).log.apply(_console2, _toConsumableArray(formatImage(image, message, scale)));

    return noop;
  }

  if (element.toLowerCase() === 'canvas') {
    var _img = new Image();

    _img.onload = function () {
      var _console3;

      return (_console3 = console).log.apply(_console3, _toConsumableArray(formatImage(_img, message, scale)));
    };

    _img.src = image.toDataURL();
    return noop;
  }

  return noop;
}

function getBrowser(mockUserAgent) {
  if (!mockUserAgent && !isBrowser$1()) {
    return 'Node';
  }

  if (isElectron(mockUserAgent)) {
    return 'Electron';
  }

  var navigator_ = typeof navigator !== 'undefined' ? navigator : {};
  var userAgent = mockUserAgent || navigator_.userAgent || '';

  if (userAgent.indexOf('Edge') > -1) {
    return 'Edge';
  }

  var isMSIE = userAgent.indexOf('MSIE ') !== -1;
  var isTrident = userAgent.indexOf('Trident/') !== -1;

  if (isMSIE || isTrident) {
    return 'IE';
  }

  if (window_.chrome) {
    return 'Chrome';
  }

  if (window_.safari) {
    return 'Safari';
  }

  if (window_.mozInnerScreenX) {
    return 'Firefox';
  }

  return 'Unknown';
}

var log = new Log({
  id: 'deck'
});

var loggers = {};

function register(handlers) {
  loggers = handlers;
}
function debug(eventType) {
  if (log.level > 0 && loggers[eventType]) {
    var _loggers$eventType;

    (_loggers$eventType = loggers[eventType]).call.apply(_loggers$eventType, arguments);
  }
}

var glErrorShadow = {};

function error(msg) {
  if (env$1.global.console && env$1.global.console.error) {
    env$1.global.console.error(msg);
  }
}

function log$1(msg) {
  if (env$1.global.console && env$1.global.console.log) {
    env$1.global.console.log(msg);
  }
}

function synthesizeGLError(err, opt_msg) {
  glErrorShadow[err] = true;

  if (opt_msg !== undefined) {
    error(opt_msg);
  }
}

function wrapGLError(gl) {
  var f = gl.getError;

  gl.getError = function getError() {
    var err;

    do {
      err = f.apply(gl);

      if (err !== 0) {
        glErrorShadow[err] = true;
      }
    } while (err !== 0);

    for (err in glErrorShadow) {
      if (glErrorShadow[err]) {
        delete glErrorShadow[err];
        return parseInt(err, 10);
      }
    }

    return 0;
  };
}

var WebGLVertexArrayObjectOES = function WebGLVertexArrayObjectOES(ext) {
  var gl = ext.gl;
  this.ext = ext;
  this.isAlive = true;
  this.hasBeenBound = false;
  this.elementArrayBuffer = null;
  this.attribs = new Array(ext.maxVertexAttribs);

  for (var n = 0; n < this.attribs.length; n++) {
    var attrib = new WebGLVertexArrayObjectOES.VertexAttrib(gl);
    this.attribs[n] = attrib;
  }

  this.maxAttrib = 0;
};

WebGLVertexArrayObjectOES.VertexAttrib = function VertexAttrib(gl) {
  this.enabled = false;
  this.buffer = null;
  this.size = 4;
  this.type = 5126;
  this.normalized = false;
  this.stride = 16;
  this.offset = 0;
  this.cached = '';
  this.recache();
};

WebGLVertexArrayObjectOES.VertexAttrib.prototype.recache = function recache() {
  this.cached = [this.size, this.type, this.normalized, this.stride, this.offset].join(':');
};

var OESVertexArrayObject = function OESVertexArrayObject(gl) {
  var self = this;
  this.gl = gl;
  wrapGLError(gl);
  var original = this.original = {
    getParameter: gl.getParameter,
    enableVertexAttribArray: gl.enableVertexAttribArray,
    disableVertexAttribArray: gl.disableVertexAttribArray,
    bindBuffer: gl.bindBuffer,
    getVertexAttrib: gl.getVertexAttrib,
    vertexAttribPointer: gl.vertexAttribPointer
  };

  gl.getParameter = function getParameter(pname) {
    if (pname === self.VERTEX_ARRAY_BINDING_OES) {
      if (self.currentVertexArrayObject === self.defaultVertexArrayObject) {
        return null;
      }

      return self.currentVertexArrayObject;
    }

    return original.getParameter.apply(this, arguments);
  };

  gl.enableVertexAttribArray = function enableVertexAttribArray(index) {
    var vao = self.currentVertexArrayObject;
    vao.maxAttrib = Math.max(vao.maxAttrib, index);
    var attrib = vao.attribs[index];
    attrib.enabled = true;
    return original.enableVertexAttribArray.apply(this, arguments);
  };

  gl.disableVertexAttribArray = function disableVertexAttribArray(index) {
    var vao = self.currentVertexArrayObject;
    vao.maxAttrib = Math.max(vao.maxAttrib, index);
    var attrib = vao.attribs[index];
    attrib.enabled = false;
    return original.disableVertexAttribArray.apply(this, arguments);
  };

  gl.bindBuffer = function bindBuffer(target, buffer) {
    switch (target) {
      case 34962:
        self.currentArrayBuffer = buffer;
        break;

      case 34963:
        self.currentVertexArrayObject.elementArrayBuffer = buffer;
        break;
    }

    return original.bindBuffer.apply(this, arguments);
  };

  gl.getVertexAttrib = function getVertexAttrib(index, pname) {
    var vao = self.currentVertexArrayObject;
    var attrib = vao.attribs[index];

    switch (pname) {
      case 34975:
        return attrib.buffer;

      case 34338:
        return attrib.enabled;

      case 34339:
        return attrib.size;

      case 34340:
        return attrib.stride;

      case 34341:
        return attrib.type;

      case 34922:
        return attrib.normalized;

      default:
        return original.getVertexAttrib.apply(this, arguments);
    }
  };

  gl.vertexAttribPointer = function vertexAttribPointer(indx, size, type, normalized, stride, offset) {
    var vao = self.currentVertexArrayObject;
    vao.maxAttrib = Math.max(vao.maxAttrib, indx);
    var attrib = vao.attribs[indx];
    attrib.buffer = self.currentArrayBuffer;
    attrib.size = size;
    attrib.type = type;
    attrib.normalized = normalized;
    attrib.stride = stride;
    attrib.offset = offset;
    attrib.recache();
    return original.vertexAttribPointer.apply(this, arguments);
  };

  if (gl.instrumentExtension) {
    gl.instrumentExtension(this, 'OES_vertex_array_object');
  }

  if (gl.canvas) {
    gl.canvas.addEventListener('webglcontextrestored', function () {
      log$1('OESVertexArrayObject emulation library context restored');
      self.reset_();
    }, true);
  }

  this.reset_();
};

OESVertexArrayObject.prototype.VERTEX_ARRAY_BINDING_OES = 0x85b5;

OESVertexArrayObject.prototype.reset_ = function reset_() {
  var contextWasLost = this.vertexArrayObjects !== undefined;

  if (contextWasLost) {
    for (var ii = 0; ii < this.vertexArrayObjects.length; ++ii) {
      this.vertexArrayObjects.isAlive = false;
    }
  }

  var gl = this.gl;
  this.maxVertexAttribs = gl.getParameter(34921);
  this.defaultVertexArrayObject = new WebGLVertexArrayObjectOES(this);
  this.currentVertexArrayObject = null;
  this.currentArrayBuffer = null;
  this.vertexArrayObjects = [this.defaultVertexArrayObject];
  this.bindVertexArrayOES(null);
};

OESVertexArrayObject.prototype.createVertexArrayOES = function createVertexArrayOES() {
  var arrayObject = new WebGLVertexArrayObjectOES(this);
  this.vertexArrayObjects.push(arrayObject);
  return arrayObject;
};

OESVertexArrayObject.prototype.deleteVertexArrayOES = function deleteVertexArrayOES(arrayObject) {
  arrayObject.isAlive = false;
  this.vertexArrayObjects.splice(this.vertexArrayObjects.indexOf(arrayObject), 1);

  if (this.currentVertexArrayObject === arrayObject) {
    this.bindVertexArrayOES(null);
  }
};

OESVertexArrayObject.prototype.isVertexArrayOES = function isVertexArrayOES(arrayObject) {
  if (arrayObject && arrayObject instanceof WebGLVertexArrayObjectOES) {
    if (arrayObject.hasBeenBound && arrayObject.ext === this) {
      return true;
    }
  }

  return false;
};

OESVertexArrayObject.prototype.bindVertexArrayOES = function bindVertexArrayOES(arrayObject) {
  var gl = this.gl;

  if (arrayObject && !arrayObject.isAlive) {
    synthesizeGLError(1282, 'bindVertexArrayOES: attempt to bind deleted arrayObject');
    return;
  }

  var original = this.original;
  var oldVAO = this.currentVertexArrayObject;
  this.currentVertexArrayObject = arrayObject || this.defaultVertexArrayObject;
  this.currentVertexArrayObject.hasBeenBound = true;
  var newVAO = this.currentVertexArrayObject;

  if (oldVAO === newVAO) {
    return;
  }

  if (!oldVAO || newVAO.elementArrayBuffer !== oldVAO.elementArrayBuffer) {
    original.bindBuffer.call(gl, 34963, newVAO.elementArrayBuffer);
  }

  var currentBinding = this.currentArrayBuffer;
  var maxAttrib = Math.max(oldVAO ? oldVAO.maxAttrib : 0, newVAO.maxAttrib);

  for (var n = 0; n <= maxAttrib; n++) {
    var attrib = newVAO.attribs[n];
    var oldAttrib = oldVAO ? oldVAO.attribs[n] : null;

    if (!oldVAO || attrib.enabled !== oldAttrib.enabled) {
      if (attrib.enabled) {
        original.enableVertexAttribArray.call(gl, n);
      } else {
        original.disableVertexAttribArray.call(gl, n);
      }
    }

    if (attrib.enabled) {
      var bufferChanged = false;

      if (!oldVAO || attrib.buffer !== oldAttrib.buffer) {
        if (currentBinding !== attrib.buffer) {
          original.bindBuffer.call(gl, 34962, attrib.buffer);
          currentBinding = attrib.buffer;
        }

        bufferChanged = true;
      }

      if (bufferChanged || attrib.cached !== oldAttrib.cached) {
        original.vertexAttribPointer.call(gl, n, attrib.size, attrib.type, attrib.normalized, attrib.stride, attrib.offset);
      }
    }
  }

  if (this.currentArrayBuffer !== currentBinding) {
    original.bindBuffer.call(gl, 34962, this.currentArrayBuffer);
  }
};

function polyfillVertexArrayObject(gl) {
  if (typeof gl.createVertexArray === 'function') {
    return;
  }

  var original_getSupportedExtensions = gl.getSupportedExtensions;

  gl.getSupportedExtensions = function getSupportedExtensions() {
    var list = original_getSupportedExtensions.call(this) || [];

    if (list.indexOf('OES_vertex_array_object') < 0) {
      list.push('OES_vertex_array_object');
    }

    return list;
  };

  var original_getExtension = gl.getExtension;

  gl.getExtension = function getExtension(name) {
    var ext = original_getExtension.call(this, name);

    if (ext) {
      return ext;
    }

    if (name !== 'OES_vertex_array_object') {
      return null;
    }

    if (!gl.__OESVertexArrayObject) {
      this.__OESVertexArrayObject = new OESVertexArrayObject(this);
    }

    return this.__OESVertexArrayObject;
  };
}

function assert$2(condition, message) {
  if (!condition) {
    throw new Error(message || 'luma.gl: assertion failed.');
  }
}
function isObjectEmpty(object) {
  for (var key in object) {
    return false;
  }

  return true;
}
function deepArrayEqual(x, y) {
  if (x === y) {
    return true;
  }

  var isArrayX = Array.isArray(x) || ArrayBuffer.isView(x);
  var isArrayY = Array.isArray(y) || ArrayBuffer.isView(y);

  if (isArrayX && isArrayY && x.length === y.length) {
    for (var i = 0; i < x.length; ++i) {
      if (x[i] !== y[i]) {
        return false;
      }
    }

    return true;
  }

  return false;
}

function cssToDeviceRatio(gl) {
  if (gl.canvas && gl.luma) {
    var clientWidth = gl.luma.canvasSizeInfo.clientWidth;
    return clientWidth ? gl.drawingBufferWidth / clientWidth : 1;
  }

  return 1;
}
function cssToDevicePixels(gl, cssPixel) {
  var yInvert = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
  var ratio = cssToDeviceRatio(gl);
  var width = gl.drawingBufferWidth;
  var height = gl.drawingBufferHeight;
  return scalePixels(cssPixel, ratio, width, height, yInvert);
}
function getDevicePixelRatio(useDevicePixels) {
  var windowRatio = typeof window === 'undefined' ? 1 : window.devicePixelRatio || 1;

  if (Number.isFinite(useDevicePixels)) {
    return useDevicePixels <= 0 ? 1 : useDevicePixels;
  }

  return useDevicePixels ? windowRatio : 1;
}

function scalePixels(pixel, ratio, width, height, yInvert) {
  var x = scaleX(pixel[0], ratio, width);
  var y = scaleY(pixel[1], ratio, height, yInvert);
  var t = scaleX(pixel[0] + 1, ratio, width);
  var xHigh = t === width - 1 ? t : t - 1;
  t = scaleY(pixel[1] + 1, ratio, height, yInvert);
  var yHigh;

  if (yInvert) {
    t = t === 0 ? t : t + 1;
    yHigh = y;
    y = t;
  } else {
    yHigh = t === height - 1 ? t : t - 1;
  }

  return {
    x: x,
    y: y,
    width: Math.max(xHigh - x + 1, 1),
    height: Math.max(yHigh - y + 1, 1)
  };
}

function scaleX(x, ratio, width) {
  var r = Math.min(Math.round(x * ratio), width - 1);
  return r;
}

function scaleY(y, ratio, height, yInvert) {
  return yInvert ? Math.max(0, height - 1 - Math.round(y * ratio)) : Math.min(Math.round(y * ratio), height - 1);
}

function isWebGL(gl) {
  return Boolean(gl && Number.isFinite(gl._version));
}
function isWebGL2(gl) {
  return Boolean(gl && gl._version === 2);
}

var log$2 = new Log({
  id: 'luma.gl'
});

var _WEBGL_PARAMETERS;
var OES_element_index = 'OES_element_index';
var WEBGL_draw_buffers = 'WEBGL_draw_buffers';
var EXT_disjoint_timer_query = 'EXT_disjoint_timer_query';
var EXT_disjoint_timer_query_webgl2 = 'EXT_disjoint_timer_query_webgl2';
var EXT_texture_filter_anisotropic = 'EXT_texture_filter_anisotropic';
var WEBGL_debug_renderer_info = 'WEBGL_debug_renderer_info';
var GL_FRAGMENT_SHADER_DERIVATIVE_HINT = 0x8b8b;
var GL_DONT_CARE = 0x1100;
var GL_GPU_DISJOINT_EXT = 0x8fbb;
var GL_MAX_TEXTURE_MAX_ANISOTROPY_EXT = 0x84ff;
var GL_UNMASKED_VENDOR_WEBGL = 0x9245;
var GL_UNMASKED_RENDERER_WEBGL = 0x9246;

var getWebGL2ValueOrZero = function getWebGL2ValueOrZero(gl) {
  return !isWebGL2(gl) ? 0 : undefined;
};

var WEBGL_PARAMETERS = (_WEBGL_PARAMETERS = {}, _defineProperty(_WEBGL_PARAMETERS, 3074, function (gl) {
  return !isWebGL2(gl) ? 36064 : undefined;
}), _defineProperty(_WEBGL_PARAMETERS, GL_FRAGMENT_SHADER_DERIVATIVE_HINT, function (gl) {
  return !isWebGL2(gl) ? GL_DONT_CARE : undefined;
}), _defineProperty(_WEBGL_PARAMETERS, 35977, getWebGL2ValueOrZero), _defineProperty(_WEBGL_PARAMETERS, 32937, getWebGL2ValueOrZero), _defineProperty(_WEBGL_PARAMETERS, GL_GPU_DISJOINT_EXT, function (gl, getParameter) {
  var ext = isWebGL2(gl) ? gl.getExtension(EXT_disjoint_timer_query_webgl2) : gl.getExtension(EXT_disjoint_timer_query);
  return ext && ext.GPU_DISJOINT_EXT ? getParameter(ext.GPU_DISJOINT_EXT) : 0;
}), _defineProperty(_WEBGL_PARAMETERS, GL_UNMASKED_VENDOR_WEBGL, function (gl, getParameter) {
  var ext = gl.getExtension(WEBGL_debug_renderer_info);
  return getParameter(ext && ext.UNMASKED_VENDOR_WEBGL || 7936);
}), _defineProperty(_WEBGL_PARAMETERS, GL_UNMASKED_RENDERER_WEBGL, function (gl, getParameter) {
  var ext = gl.getExtension(WEBGL_debug_renderer_info);
  return getParameter(ext && ext.UNMASKED_RENDERER_WEBGL || 7937);
}), _defineProperty(_WEBGL_PARAMETERS, GL_MAX_TEXTURE_MAX_ANISOTROPY_EXT, function (gl, getParameter) {
  var ext = gl.luma.extensions[EXT_texture_filter_anisotropic];
  return ext ? getParameter(ext.MAX_TEXTURE_MAX_ANISOTROPY_EXT) : 1.0;
}), _defineProperty(_WEBGL_PARAMETERS, 32883, getWebGL2ValueOrZero), _defineProperty(_WEBGL_PARAMETERS, 35071, getWebGL2ValueOrZero), _defineProperty(_WEBGL_PARAMETERS, 37447, getWebGL2ValueOrZero), _defineProperty(_WEBGL_PARAMETERS, 36063, function (gl, getParameter) {
  if (!isWebGL2(gl)) {
    var ext = gl.getExtension(WEBGL_draw_buffers);
    return ext ? getParameter(ext.MAX_COLOR_ATTACHMENTS_WEBGL) : 0;
  }

  return undefined;
}), _defineProperty(_WEBGL_PARAMETERS, 35379, getWebGL2ValueOrZero), _defineProperty(_WEBGL_PARAMETERS, 35374, getWebGL2ValueOrZero), _defineProperty(_WEBGL_PARAMETERS, 35377, getWebGL2ValueOrZero), _defineProperty(_WEBGL_PARAMETERS, 34852, function (gl) {
  if (!isWebGL2(gl)) {
    var ext = gl.getExtension(WEBGL_draw_buffers);
    return ext ? ext.MAX_DRAW_BUFFERS_WEBGL : 0;
  }

  return undefined;
}), _defineProperty(_WEBGL_PARAMETERS, 36203, function (gl) {
  return gl.getExtension(OES_element_index) ? 2147483647 : 65535;
}), _defineProperty(_WEBGL_PARAMETERS, 33001, function (gl) {
  return gl.getExtension(OES_element_index) ? 16777216 : 65535;
}), _defineProperty(_WEBGL_PARAMETERS, 33000, function (gl) {
  return 16777216;
}), _defineProperty(_WEBGL_PARAMETERS, 37157, getWebGL2ValueOrZero), _defineProperty(_WEBGL_PARAMETERS, 35373, getWebGL2ValueOrZero), _defineProperty(_WEBGL_PARAMETERS, 35657, getWebGL2ValueOrZero), _defineProperty(_WEBGL_PARAMETERS, 36183, getWebGL2ValueOrZero), _defineProperty(_WEBGL_PARAMETERS, 37137, getWebGL2ValueOrZero), _defineProperty(_WEBGL_PARAMETERS, 34045, getWebGL2ValueOrZero), _defineProperty(_WEBGL_PARAMETERS, 35978, getWebGL2ValueOrZero), _defineProperty(_WEBGL_PARAMETERS, 35979, getWebGL2ValueOrZero), _defineProperty(_WEBGL_PARAMETERS, 35968, getWebGL2ValueOrZero), _defineProperty(_WEBGL_PARAMETERS, 35376, getWebGL2ValueOrZero), _defineProperty(_WEBGL_PARAMETERS, 35375, getWebGL2ValueOrZero), _defineProperty(_WEBGL_PARAMETERS, 35659, getWebGL2ValueOrZero), _defineProperty(_WEBGL_PARAMETERS, 37154, getWebGL2ValueOrZero), _defineProperty(_WEBGL_PARAMETERS, 35371, getWebGL2ValueOrZero), _defineProperty(_WEBGL_PARAMETERS, 35658, getWebGL2ValueOrZero), _defineProperty(_WEBGL_PARAMETERS, 35076, getWebGL2ValueOrZero), _defineProperty(_WEBGL_PARAMETERS, 35077, getWebGL2ValueOrZero), _defineProperty(_WEBGL_PARAMETERS, 35380, getWebGL2ValueOrZero), _WEBGL_PARAMETERS);
function getParameterPolyfill(gl, originalGetParameter, pname) {
  var limit = WEBGL_PARAMETERS[pname];
  var value = typeof limit === 'function' ? limit(gl, originalGetParameter, pname) : limit;
  var result = value !== undefined ? value : originalGetParameter(pname);
  return result;
}

var _WEBGL2_CONTEXT_POLYF;
var OES_vertex_array_object = 'OES_vertex_array_object';
var ANGLE_instanced_arrays = 'ANGLE_instanced_arrays';
var WEBGL_draw_buffers$1 = 'WEBGL_draw_buffers';
var EXT_disjoint_timer_query$1 = 'EXT_disjoint_timer_query';
var EXT_texture_filter_anisotropic$1 = 'EXT_texture_filter_anisotropic';
var ERR_VAO_NOT_SUPPORTED = 'VertexArray requires WebGL2 or OES_vertex_array_object extension';

function getExtensionData(gl, extension) {
  return {
    webgl2: isWebGL2(gl),
    ext: gl.getExtension(extension)
  };
}

var WEBGL2_CONTEXT_POLYFILLS = (_WEBGL2_CONTEXT_POLYF = {}, _defineProperty(_WEBGL2_CONTEXT_POLYF, OES_vertex_array_object, {
  meta: {
    suffix: 'OES'
  },
  createVertexArray: function createVertexArray() {
    assert$2(false, ERR_VAO_NOT_SUPPORTED);
  },
  deleteVertexArray: function deleteVertexArray() {},
  bindVertexArray: function bindVertexArray() {},
  isVertexArray: function isVertexArray() {
    return false;
  }
}), _defineProperty(_WEBGL2_CONTEXT_POLYF, ANGLE_instanced_arrays, {
  meta: {
    suffix: 'ANGLE'
  },
  vertexAttribDivisor: function vertexAttribDivisor(location, divisor) {
    assert$2(divisor === 0, 'WebGL instanced rendering not supported');
  },
  drawElementsInstanced: function drawElementsInstanced() {},
  drawArraysInstanced: function drawArraysInstanced() {}
}), _defineProperty(_WEBGL2_CONTEXT_POLYF, WEBGL_draw_buffers$1, {
  meta: {
    suffix: 'WEBGL'
  },
  drawBuffers: function drawBuffers() {
    assert$2(false);
  }
}), _defineProperty(_WEBGL2_CONTEXT_POLYF, EXT_disjoint_timer_query$1, {
  meta: {
    suffix: 'EXT'
  },
  createQuery: function createQuery() {
    assert$2(false);
  },
  deleteQuery: function deleteQuery() {
    assert$2(false);
  },
  beginQuery: function beginQuery() {
    assert$2(false);
  },
  endQuery: function endQuery() {},
  getQuery: function getQuery(handle, pname) {
    return this.getQueryObject(handle, pname);
  },
  getQueryParameter: function getQueryParameter(handle, pname) {
    return this.getQueryObject(handle, pname);
  },
  getQueryObject: function getQueryObject() {}
}), _WEBGL2_CONTEXT_POLYF);
var WEBGL2_CONTEXT_OVERRIDES = {
  readBuffer: function readBuffer(gl, originalFunc, attachment) {
    if (isWebGL2(gl)) {
      originalFunc(attachment);
    }
  },
  getVertexAttrib: function getVertexAttrib(gl, originalFunc, location, pname) {
    var _getExtensionData = getExtensionData(gl, ANGLE_instanced_arrays),
        webgl2 = _getExtensionData.webgl2,
        ext = _getExtensionData.ext;

    var result;

    switch (pname) {
      case 35069:
        result = !webgl2 ? false : undefined;
        break;

      case 35070:
        result = !webgl2 && !ext ? 0 : undefined;
        break;
    }

    return result !== undefined ? result : originalFunc(location, pname);
  },
  getProgramParameter: function getProgramParameter(gl, originalFunc, program, pname) {
    if (!isWebGL2(gl)) {
      switch (pname) {
        case 35967:
          return 35981;

        case 35971:
          return 0;

        case 35382:
          return 0;
      }
    }

    return originalFunc(program, pname);
  },
  getInternalformatParameter: function getInternalformatParameter(gl, originalFunc, target, format, pname) {
    if (!isWebGL2(gl)) {
      switch (pname) {
        case 32937:
          return new Int32Array([0]);
      }
    }

    return gl.getInternalformatParameter(target, format, pname);
  },
  getTexParameter: function getTexParameter(gl, originalFunc, target, pname) {
    switch (pname) {
      case 34046:
        var extensions = gl.luma.extensions;
        var ext = extensions[EXT_texture_filter_anisotropic$1];
        pname = ext && ext.TEXTURE_MAX_ANISOTROPY_EXT || 34046;
        break;
    }

    return originalFunc(target, pname);
  },
  getParameter: getParameterPolyfill,
  hint: function hint(gl, originalFunc, pname, value) {
    return originalFunc(pname, value);
  }
};

function polyfillContext(gl) {
  gl.luma = gl.luma || {};

  if (!gl.luma.polyfilled) {
    polyfillVertexArrayObject(gl);
    initializeExtensions(gl);
    installPolyfills(gl, WEBGL2_CONTEXT_POLYFILLS);
    installOverrides(gl, {
      target: gl.luma,
      target2: gl
    });
    gl.luma.polyfilled = true;
  }

  return gl;
}
var global_$1 = typeof global !== 'undefined' ? global : window;
global_$1.polyfillContext = polyfillContext;

function initializeExtensions(gl) {
  gl.luma.extensions = {};
  var EXTENSIONS = gl.getSupportedExtensions() || [];
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = EXTENSIONS[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var extension = _step.value;
      gl.luma[extension] = gl.getExtension(extension);
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
}

function installOverrides(gl, _ref) {
  var target = _ref.target,
      target2 = _ref.target2;
  Object.keys(WEBGL2_CONTEXT_OVERRIDES).forEach(function (key) {
    if (typeof WEBGL2_CONTEXT_OVERRIDES[key] === 'function') {
      var originalFunc = gl[key] ? gl[key].bind(gl) : function () {};
      var polyfill = WEBGL2_CONTEXT_OVERRIDES[key].bind(null, gl, originalFunc);
      target[key] = polyfill;
      target2[key] = polyfill;
    }
  });
}

function installPolyfills(gl, polyfills) {
  var _iteratorNormalCompletion2 = true;
  var _didIteratorError2 = false;
  var _iteratorError2 = undefined;

  try {
    for (var _iterator2 = Object.getOwnPropertyNames(polyfills)[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
      var extension = _step2.value;

      if (extension !== 'overrides') {
        polyfillExtension(gl, {
          extension: extension,
          target: gl.luma,
          target2: gl
        });
      }
    }
  } catch (err) {
    _didIteratorError2 = true;
    _iteratorError2 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion2 && _iterator2["return"] != null) {
        _iterator2["return"]();
      }
    } finally {
      if (_didIteratorError2) {
        throw _iteratorError2;
      }
    }
  }
}

function polyfillExtension(gl, _ref2) {
  var extension = _ref2.extension,
      target = _ref2.target,
      target2 = _ref2.target2;
  var defaults = WEBGL2_CONTEXT_POLYFILLS[extension];
  assert$2(defaults);
  var _defaults$meta = defaults.meta,
      meta = _defaults$meta === void 0 ? {} : _defaults$meta;
  var _meta$suffix = meta.suffix,
      suffix = _meta$suffix === void 0 ? '' : _meta$suffix;
  var ext = gl.getExtension(extension);

  var _loop = function _loop() {
    var key = _Object$keys[_i];
    var extKey = "".concat(key).concat(suffix);
    var polyfill = null;

    if (key === 'meta') ; else if (typeof gl[key] === 'function') ; else if (ext && typeof ext[extKey] === 'function') {
      polyfill = function polyfill() {
        return ext[extKey].apply(ext, arguments);
      };
    } else if (typeof defaults[key] === 'function') {
      polyfill = defaults[key].bind(target);
    }

    if (polyfill) {
      target[key] = polyfill;
      target2[key] = polyfill;
    }
  };

  for (var _i = 0, _Object$keys = Object.keys(defaults); _i < _Object$keys.length; _i++) {
    _loop();
  }
}

var _GL_PARAMETER_DEFAULT, _GL_PARAMETER_SETTERS, _GL_PARAMETER_GETTERS;
var GL_PARAMETER_DEFAULTS = (_GL_PARAMETER_DEFAULT = {}, _defineProperty(_GL_PARAMETER_DEFAULT, 3042, false), _defineProperty(_GL_PARAMETER_DEFAULT, 32773, new Float32Array([0, 0, 0, 0])), _defineProperty(_GL_PARAMETER_DEFAULT, 32777, 32774), _defineProperty(_GL_PARAMETER_DEFAULT, 34877, 32774), _defineProperty(_GL_PARAMETER_DEFAULT, 32969, 1), _defineProperty(_GL_PARAMETER_DEFAULT, 32968, 0), _defineProperty(_GL_PARAMETER_DEFAULT, 32971, 1), _defineProperty(_GL_PARAMETER_DEFAULT, 32970, 0), _defineProperty(_GL_PARAMETER_DEFAULT, 3106, new Float32Array([0, 0, 0, 0])), _defineProperty(_GL_PARAMETER_DEFAULT, 3107, [true, true, true, true]), _defineProperty(_GL_PARAMETER_DEFAULT, 2884, false), _defineProperty(_GL_PARAMETER_DEFAULT, 2885, 1029), _defineProperty(_GL_PARAMETER_DEFAULT, 2929, false), _defineProperty(_GL_PARAMETER_DEFAULT, 2931, 1), _defineProperty(_GL_PARAMETER_DEFAULT, 2932, 513), _defineProperty(_GL_PARAMETER_DEFAULT, 2928, new Float32Array([0, 1])), _defineProperty(_GL_PARAMETER_DEFAULT, 2930, true), _defineProperty(_GL_PARAMETER_DEFAULT, 3024, true), _defineProperty(_GL_PARAMETER_DEFAULT, 36006, null), _defineProperty(_GL_PARAMETER_DEFAULT, 2886, 2305), _defineProperty(_GL_PARAMETER_DEFAULT, 33170, 4352), _defineProperty(_GL_PARAMETER_DEFAULT, 2849, 1), _defineProperty(_GL_PARAMETER_DEFAULT, 32823, false), _defineProperty(_GL_PARAMETER_DEFAULT, 32824, 0), _defineProperty(_GL_PARAMETER_DEFAULT, 10752, 0), _defineProperty(_GL_PARAMETER_DEFAULT, 32938, 1.0), _defineProperty(_GL_PARAMETER_DEFAULT, 32939, false), _defineProperty(_GL_PARAMETER_DEFAULT, 3089, false), _defineProperty(_GL_PARAMETER_DEFAULT, 3088, new Int32Array([0, 0, 1024, 1024])), _defineProperty(_GL_PARAMETER_DEFAULT, 2960, false), _defineProperty(_GL_PARAMETER_DEFAULT, 2961, 0), _defineProperty(_GL_PARAMETER_DEFAULT, 2968, 0xffffffff), _defineProperty(_GL_PARAMETER_DEFAULT, 36005, 0xffffffff), _defineProperty(_GL_PARAMETER_DEFAULT, 2962, 519), _defineProperty(_GL_PARAMETER_DEFAULT, 2967, 0), _defineProperty(_GL_PARAMETER_DEFAULT, 2963, 0xffffffff), _defineProperty(_GL_PARAMETER_DEFAULT, 34816, 519), _defineProperty(_GL_PARAMETER_DEFAULT, 36003, 0), _defineProperty(_GL_PARAMETER_DEFAULT, 36004, 0xffffffff), _defineProperty(_GL_PARAMETER_DEFAULT, 2964, 7680), _defineProperty(_GL_PARAMETER_DEFAULT, 2965, 7680), _defineProperty(_GL_PARAMETER_DEFAULT, 2966, 7680), _defineProperty(_GL_PARAMETER_DEFAULT, 34817, 7680), _defineProperty(_GL_PARAMETER_DEFAULT, 34818, 7680), _defineProperty(_GL_PARAMETER_DEFAULT, 34819, 7680), _defineProperty(_GL_PARAMETER_DEFAULT, 2978, [0, 0, 1024, 1024]), _defineProperty(_GL_PARAMETER_DEFAULT, 3333, 4), _defineProperty(_GL_PARAMETER_DEFAULT, 3317, 4), _defineProperty(_GL_PARAMETER_DEFAULT, 37440, false), _defineProperty(_GL_PARAMETER_DEFAULT, 37441, false), _defineProperty(_GL_PARAMETER_DEFAULT, 37443, 37444), _defineProperty(_GL_PARAMETER_DEFAULT, 35723, 4352), _defineProperty(_GL_PARAMETER_DEFAULT, 36010, null), _defineProperty(_GL_PARAMETER_DEFAULT, 35977, false), _defineProperty(_GL_PARAMETER_DEFAULT, 3330, 0), _defineProperty(_GL_PARAMETER_DEFAULT, 3332, 0), _defineProperty(_GL_PARAMETER_DEFAULT, 3331, 0), _defineProperty(_GL_PARAMETER_DEFAULT, 3314, 0), _defineProperty(_GL_PARAMETER_DEFAULT, 32878, 0), _defineProperty(_GL_PARAMETER_DEFAULT, 3316, 0), _defineProperty(_GL_PARAMETER_DEFAULT, 3315, 0), _defineProperty(_GL_PARAMETER_DEFAULT, 32877, 0), _GL_PARAMETER_DEFAULT);

var enable = function enable(gl, value, key) {
  return value ? gl.enable(key) : gl.disable(key);
};

var hint = function hint(gl, value, key) {
  return gl.hint(key, value);
};

var pixelStorei = function pixelStorei(gl, value, key) {
  return gl.pixelStorei(key, value);
};

var drawFramebuffer = function drawFramebuffer(gl, value) {
  var target = isWebGL2(gl) ? 36009 : 36160;
  return gl.bindFramebuffer(target, value);
};

var readFramebuffer = function readFramebuffer(gl, value) {
  return gl.bindFramebuffer(36008, value);
};

function isArray(array) {
  return Array.isArray(array) || ArrayBuffer.isView(array);
}

var GL_PARAMETER_SETTERS = (_GL_PARAMETER_SETTERS = {}, _defineProperty(_GL_PARAMETER_SETTERS, 3042, enable), _defineProperty(_GL_PARAMETER_SETTERS, 32773, function (gl, value) {
  return gl.blendColor.apply(gl, _toConsumableArray(value));
}), _defineProperty(_GL_PARAMETER_SETTERS, 32777, 'blendEquation'), _defineProperty(_GL_PARAMETER_SETTERS, 34877, 'blendEquation'), _defineProperty(_GL_PARAMETER_SETTERS, 32969, 'blendFunc'), _defineProperty(_GL_PARAMETER_SETTERS, 32968, 'blendFunc'), _defineProperty(_GL_PARAMETER_SETTERS, 32971, 'blendFunc'), _defineProperty(_GL_PARAMETER_SETTERS, 32970, 'blendFunc'), _defineProperty(_GL_PARAMETER_SETTERS, 3106, function (gl, value) {
  return gl.clearColor.apply(gl, _toConsumableArray(value));
}), _defineProperty(_GL_PARAMETER_SETTERS, 3107, function (gl, value) {
  return gl.colorMask.apply(gl, _toConsumableArray(value));
}), _defineProperty(_GL_PARAMETER_SETTERS, 2884, enable), _defineProperty(_GL_PARAMETER_SETTERS, 2885, function (gl, value) {
  return gl.cullFace(value);
}), _defineProperty(_GL_PARAMETER_SETTERS, 2929, enable), _defineProperty(_GL_PARAMETER_SETTERS, 2931, function (gl, value) {
  return gl.clearDepth(value);
}), _defineProperty(_GL_PARAMETER_SETTERS, 2932, function (gl, value) {
  return gl.depthFunc(value);
}), _defineProperty(_GL_PARAMETER_SETTERS, 2928, function (gl, value) {
  return gl.depthRange.apply(gl, _toConsumableArray(value));
}), _defineProperty(_GL_PARAMETER_SETTERS, 2930, function (gl, value) {
  return gl.depthMask(value);
}), _defineProperty(_GL_PARAMETER_SETTERS, 3024, enable), _defineProperty(_GL_PARAMETER_SETTERS, 35723, hint), _defineProperty(_GL_PARAMETER_SETTERS, 36006, drawFramebuffer), _defineProperty(_GL_PARAMETER_SETTERS, 2886, function (gl, value) {
  return gl.frontFace(value);
}), _defineProperty(_GL_PARAMETER_SETTERS, 33170, hint), _defineProperty(_GL_PARAMETER_SETTERS, 2849, function (gl, value) {
  return gl.lineWidth(value);
}), _defineProperty(_GL_PARAMETER_SETTERS, 32823, enable), _defineProperty(_GL_PARAMETER_SETTERS, 32824, 'polygonOffset'), _defineProperty(_GL_PARAMETER_SETTERS, 10752, 'polygonOffset'), _defineProperty(_GL_PARAMETER_SETTERS, 35977, enable), _defineProperty(_GL_PARAMETER_SETTERS, 32938, 'sampleCoverage'), _defineProperty(_GL_PARAMETER_SETTERS, 32939, 'sampleCoverage'), _defineProperty(_GL_PARAMETER_SETTERS, 3089, enable), _defineProperty(_GL_PARAMETER_SETTERS, 3088, function (gl, value) {
  return gl.scissor.apply(gl, _toConsumableArray(value));
}), _defineProperty(_GL_PARAMETER_SETTERS, 2960, enable), _defineProperty(_GL_PARAMETER_SETTERS, 2961, function (gl, value) {
  return gl.clearStencil(value);
}), _defineProperty(_GL_PARAMETER_SETTERS, 2968, function (gl, value) {
  return gl.stencilMaskSeparate(1028, value);
}), _defineProperty(_GL_PARAMETER_SETTERS, 36005, function (gl, value) {
  return gl.stencilMaskSeparate(1029, value);
}), _defineProperty(_GL_PARAMETER_SETTERS, 2962, 'stencilFuncFront'), _defineProperty(_GL_PARAMETER_SETTERS, 2967, 'stencilFuncFront'), _defineProperty(_GL_PARAMETER_SETTERS, 2963, 'stencilFuncFront'), _defineProperty(_GL_PARAMETER_SETTERS, 34816, 'stencilFuncBack'), _defineProperty(_GL_PARAMETER_SETTERS, 36003, 'stencilFuncBack'), _defineProperty(_GL_PARAMETER_SETTERS, 36004, 'stencilFuncBack'), _defineProperty(_GL_PARAMETER_SETTERS, 2964, 'stencilOpFront'), _defineProperty(_GL_PARAMETER_SETTERS, 2965, 'stencilOpFront'), _defineProperty(_GL_PARAMETER_SETTERS, 2966, 'stencilOpFront'), _defineProperty(_GL_PARAMETER_SETTERS, 34817, 'stencilOpBack'), _defineProperty(_GL_PARAMETER_SETTERS, 34818, 'stencilOpBack'), _defineProperty(_GL_PARAMETER_SETTERS, 34819, 'stencilOpBack'), _defineProperty(_GL_PARAMETER_SETTERS, 2978, function (gl, value) {
  return gl.viewport.apply(gl, _toConsumableArray(value));
}), _defineProperty(_GL_PARAMETER_SETTERS, 3333, pixelStorei), _defineProperty(_GL_PARAMETER_SETTERS, 3317, pixelStorei), _defineProperty(_GL_PARAMETER_SETTERS, 37440, pixelStorei), _defineProperty(_GL_PARAMETER_SETTERS, 37441, pixelStorei), _defineProperty(_GL_PARAMETER_SETTERS, 37443, pixelStorei), _defineProperty(_GL_PARAMETER_SETTERS, 3330, pixelStorei), _defineProperty(_GL_PARAMETER_SETTERS, 3332, pixelStorei), _defineProperty(_GL_PARAMETER_SETTERS, 3331, pixelStorei), _defineProperty(_GL_PARAMETER_SETTERS, 36010, readFramebuffer), _defineProperty(_GL_PARAMETER_SETTERS, 3314, pixelStorei), _defineProperty(_GL_PARAMETER_SETTERS, 32878, pixelStorei), _defineProperty(_GL_PARAMETER_SETTERS, 3316, pixelStorei), _defineProperty(_GL_PARAMETER_SETTERS, 3315, pixelStorei), _defineProperty(_GL_PARAMETER_SETTERS, 32877, pixelStorei), _defineProperty(_GL_PARAMETER_SETTERS, "framebuffer", function framebuffer(gl, _framebuffer) {
  var handle = _framebuffer && 'handle' in _framebuffer ? _framebuffer.handle : _framebuffer;
  return gl.bindFramebuffer(36160, handle);
}), _defineProperty(_GL_PARAMETER_SETTERS, "blend", function blend(gl, value) {
  return value ? gl.enable(3042) : gl.disable(3042);
}), _defineProperty(_GL_PARAMETER_SETTERS, "blendColor", function blendColor(gl, value) {
  return gl.blendColor.apply(gl, _toConsumableArray(value));
}), _defineProperty(_GL_PARAMETER_SETTERS, "blendEquation", function blendEquation(gl, args) {
  args = isArray(args) ? args : [args, args];
  gl.blendEquationSeparate.apply(gl, _toConsumableArray(args));
}), _defineProperty(_GL_PARAMETER_SETTERS, "blendFunc", function blendFunc(gl, args) {
  args = isArray(args) && args.length === 2 ? [].concat(_toConsumableArray(args), _toConsumableArray(args)) : args;
  gl.blendFuncSeparate.apply(gl, _toConsumableArray(args));
}), _defineProperty(_GL_PARAMETER_SETTERS, "clearColor", function clearColor(gl, value) {
  return gl.clearColor.apply(gl, _toConsumableArray(value));
}), _defineProperty(_GL_PARAMETER_SETTERS, "clearDepth", function clearDepth(gl, value) {
  return gl.clearDepth(value);
}), _defineProperty(_GL_PARAMETER_SETTERS, "clearStencil", function clearStencil(gl, value) {
  return gl.clearStencil(value);
}), _defineProperty(_GL_PARAMETER_SETTERS, "colorMask", function colorMask(gl, value) {
  return gl.colorMask.apply(gl, _toConsumableArray(value));
}), _defineProperty(_GL_PARAMETER_SETTERS, "cull", function cull(gl, value) {
  return value ? gl.enable(2884) : gl.disable(2884);
}), _defineProperty(_GL_PARAMETER_SETTERS, "cullFace", function cullFace(gl, value) {
  return gl.cullFace(value);
}), _defineProperty(_GL_PARAMETER_SETTERS, "depthTest", function depthTest(gl, value) {
  return value ? gl.enable(2929) : gl.disable(2929);
}), _defineProperty(_GL_PARAMETER_SETTERS, "depthFunc", function depthFunc(gl, value) {
  return gl.depthFunc(value);
}), _defineProperty(_GL_PARAMETER_SETTERS, "depthMask", function depthMask(gl, value) {
  return gl.depthMask(value);
}), _defineProperty(_GL_PARAMETER_SETTERS, "depthRange", function depthRange(gl, value) {
  return gl.depthRange.apply(gl, _toConsumableArray(value));
}), _defineProperty(_GL_PARAMETER_SETTERS, "dither", function dither(gl, value) {
  return value ? gl.enable(3024) : gl.disable(3024);
}), _defineProperty(_GL_PARAMETER_SETTERS, "derivativeHint", function derivativeHint(gl, value) {
  gl.hint(35723, value);
}), _defineProperty(_GL_PARAMETER_SETTERS, "frontFace", function frontFace(gl, value) {
  return gl.frontFace(value);
}), _defineProperty(_GL_PARAMETER_SETTERS, "mipmapHint", function mipmapHint(gl, value) {
  return gl.hint(33170, value);
}), _defineProperty(_GL_PARAMETER_SETTERS, "lineWidth", function lineWidth(gl, value) {
  return gl.lineWidth(value);
}), _defineProperty(_GL_PARAMETER_SETTERS, "polygonOffsetFill", function polygonOffsetFill(gl, value) {
  return value ? gl.enable(32823) : gl.disable(32823);
}), _defineProperty(_GL_PARAMETER_SETTERS, "polygonOffset", function polygonOffset(gl, value) {
  return gl.polygonOffset.apply(gl, _toConsumableArray(value));
}), _defineProperty(_GL_PARAMETER_SETTERS, "sampleCoverage", function sampleCoverage(gl, value) {
  return gl.sampleCoverage.apply(gl, _toConsumableArray(value));
}), _defineProperty(_GL_PARAMETER_SETTERS, "scissorTest", function scissorTest(gl, value) {
  return value ? gl.enable(3089) : gl.disable(3089);
}), _defineProperty(_GL_PARAMETER_SETTERS, "scissor", function scissor(gl, value) {
  return gl.scissor.apply(gl, _toConsumableArray(value));
}), _defineProperty(_GL_PARAMETER_SETTERS, "stencilTest", function stencilTest(gl, value) {
  return value ? gl.enable(2960) : gl.disable(2960);
}), _defineProperty(_GL_PARAMETER_SETTERS, "stencilMask", function stencilMask(gl, value) {
  value = isArray(value) ? value : [value, value];

  var _value = value,
      _value2 = _slicedToArray(_value, 2),
      mask = _value2[0],
      backMask = _value2[1];

  gl.stencilMaskSeparate(1028, mask);
  gl.stencilMaskSeparate(1029, backMask);
}), _defineProperty(_GL_PARAMETER_SETTERS, "stencilFunc", function stencilFunc(gl, args) {
  args = isArray(args) && args.length === 3 ? [].concat(_toConsumableArray(args), _toConsumableArray(args)) : args;

  var _args = args,
      _args2 = _slicedToArray(_args, 6),
      func = _args2[0],
      ref = _args2[1],
      mask = _args2[2],
      backFunc = _args2[3],
      backRef = _args2[4],
      backMask = _args2[5];

  gl.stencilFuncSeparate(1028, func, ref, mask);
  gl.stencilFuncSeparate(1029, backFunc, backRef, backMask);
}), _defineProperty(_GL_PARAMETER_SETTERS, "stencilOp", function stencilOp(gl, args) {
  args = isArray(args) && args.length === 3 ? [].concat(_toConsumableArray(args), _toConsumableArray(args)) : args;

  var _args3 = args,
      _args4 = _slicedToArray(_args3, 6),
      sfail = _args4[0],
      dpfail = _args4[1],
      dppass = _args4[2],
      backSfail = _args4[3],
      backDpfail = _args4[4],
      backDppass = _args4[5];

  gl.stencilOpSeparate(1028, sfail, dpfail, dppass);
  gl.stencilOpSeparate(1029, backSfail, backDpfail, backDppass);
}), _defineProperty(_GL_PARAMETER_SETTERS, "viewport", function viewport(gl, value) {
  return gl.viewport.apply(gl, _toConsumableArray(value));
}), _GL_PARAMETER_SETTERS);

function getValue(glEnum, values, cache) {
  return values[glEnum] !== undefined ? values[glEnum] : cache[glEnum];
}

var GL_COMPOSITE_PARAMETER_SETTERS = {
  blendEquation: function blendEquation(gl, values, cache) {
    return gl.blendEquationSeparate(getValue(32777, values, cache), getValue(34877, values, cache));
  },
  blendFunc: function blendFunc(gl, values, cache) {
    return gl.blendFuncSeparate(getValue(32969, values, cache), getValue(32968, values, cache), getValue(32971, values, cache), getValue(32970, values, cache));
  },
  polygonOffset: function polygonOffset(gl, values, cache) {
    return gl.polygonOffset(getValue(32824, values, cache), getValue(10752, values, cache));
  },
  sampleCoverage: function sampleCoverage(gl, values, cache) {
    return gl.sampleCoverage(getValue(32938, values, cache), getValue(32939, values, cache));
  },
  stencilFuncFront: function stencilFuncFront(gl, values, cache) {
    return gl.stencilFuncSeparate(1028, getValue(2962, values, cache), getValue(2967, values, cache), getValue(2963, values, cache));
  },
  stencilFuncBack: function stencilFuncBack(gl, values, cache) {
    return gl.stencilFuncSeparate(1029, getValue(34816, values, cache), getValue(36003, values, cache), getValue(36004, values, cache));
  },
  stencilOpFront: function stencilOpFront(gl, values, cache) {
    return gl.stencilOpSeparate(1028, getValue(2964, values, cache), getValue(2965, values, cache), getValue(2966, values, cache));
  },
  stencilOpBack: function stencilOpBack(gl, values, cache) {
    return gl.stencilOpSeparate(1029, getValue(34817, values, cache), getValue(34818, values, cache), getValue(34819, values, cache));
  }
};
var GL_HOOKED_SETTERS = {
  enable: function enable(update, capability) {
    return update(_defineProperty({}, capability, true));
  },
  disable: function disable(update, capability) {
    return update(_defineProperty({}, capability, false));
  },
  pixelStorei: function pixelStorei(update, pname, value) {
    return update(_defineProperty({}, pname, value));
  },
  hint: function hint(update, pname, _hint) {
    return update(_defineProperty({}, pname, _hint));
  },
  bindFramebuffer: function bindFramebuffer(update, target, framebuffer) {
    var _update5;

    switch (target) {
      case 36160:
        return update((_update5 = {}, _defineProperty(_update5, 36006, framebuffer), _defineProperty(_update5, 36010, framebuffer), _update5));

      case 36009:
        return update(_defineProperty({}, 36006, framebuffer));

      case 36008:
        return update(_defineProperty({}, 36010, framebuffer));

      default:
        return null;
    }
  },
  blendColor: function blendColor(update, r, g, b, a) {
    return update(_defineProperty({}, 32773, new Float32Array([r, g, b, a])));
  },
  blendEquation: function blendEquation(update, mode) {
    var _update9;

    return update((_update9 = {}, _defineProperty(_update9, 32777, mode), _defineProperty(_update9, 34877, mode), _update9));
  },
  blendEquationSeparate: function blendEquationSeparate(update, modeRGB, modeAlpha) {
    var _update10;

    return update((_update10 = {}, _defineProperty(_update10, 32777, modeRGB), _defineProperty(_update10, 34877, modeAlpha), _update10));
  },
  blendFunc: function blendFunc(update, src, dst) {
    var _update11;

    return update((_update11 = {}, _defineProperty(_update11, 32969, src), _defineProperty(_update11, 32968, dst), _defineProperty(_update11, 32971, src), _defineProperty(_update11, 32970, dst), _update11));
  },
  blendFuncSeparate: function blendFuncSeparate(update, srcRGB, dstRGB, srcAlpha, dstAlpha) {
    var _update12;

    return update((_update12 = {}, _defineProperty(_update12, 32969, srcRGB), _defineProperty(_update12, 32968, dstRGB), _defineProperty(_update12, 32971, srcAlpha), _defineProperty(_update12, 32970, dstAlpha), _update12));
  },
  clearColor: function clearColor(update, r, g, b, a) {
    return update(_defineProperty({}, 3106, new Float32Array([r, g, b, a])));
  },
  clearDepth: function clearDepth(update, depth) {
    return update(_defineProperty({}, 2931, depth));
  },
  clearStencil: function clearStencil(update, s) {
    return update(_defineProperty({}, 2961, s));
  },
  colorMask: function colorMask(update, r, g, b, a) {
    return update(_defineProperty({}, 3107, [r, g, b, a]));
  },
  cullFace: function cullFace(update, mode) {
    return update(_defineProperty({}, 2885, mode));
  },
  depthFunc: function depthFunc(update, func) {
    return update(_defineProperty({}, 2932, func));
  },
  depthRange: function depthRange(update, zNear, zFar) {
    return update(_defineProperty({}, 2928, new Float32Array([zNear, zFar])));
  },
  depthMask: function depthMask(update, mask) {
    return update(_defineProperty({}, 2930, mask));
  },
  frontFace: function frontFace(update, face) {
    return update(_defineProperty({}, 2886, face));
  },
  lineWidth: function lineWidth(update, width) {
    return update(_defineProperty({}, 2849, width));
  },
  polygonOffset: function polygonOffset(update, factor, units) {
    var _update23;

    return update((_update23 = {}, _defineProperty(_update23, 32824, factor), _defineProperty(_update23, 10752, units), _update23));
  },
  sampleCoverage: function sampleCoverage(update, value, invert) {
    var _update24;

    return update((_update24 = {}, _defineProperty(_update24, 32938, value), _defineProperty(_update24, 32939, invert), _update24));
  },
  scissor: function scissor(update, x, y, width, height) {
    return update(_defineProperty({}, 3088, new Int32Array([x, y, width, height])));
  },
  stencilMask: function stencilMask(update, mask) {
    var _update26;

    return update((_update26 = {}, _defineProperty(_update26, 2968, mask), _defineProperty(_update26, 36005, mask), _update26));
  },
  stencilMaskSeparate: function stencilMaskSeparate(update, face, mask) {
    return update(_defineProperty({}, face === 1028 ? 2968 : 36005, mask));
  },
  stencilFunc: function stencilFunc(update, func, ref, mask) {
    var _update28;

    return update((_update28 = {}, _defineProperty(_update28, 2962, func), _defineProperty(_update28, 2967, ref), _defineProperty(_update28, 2963, mask), _defineProperty(_update28, 34816, func), _defineProperty(_update28, 36003, ref), _defineProperty(_update28, 36004, mask), _update28));
  },
  stencilFuncSeparate: function stencilFuncSeparate(update, face, func, ref, mask) {
    var _update29;

    return update((_update29 = {}, _defineProperty(_update29, face === 1028 ? 2962 : 34816, func), _defineProperty(_update29, face === 1028 ? 2967 : 36003, ref), _defineProperty(_update29, face === 1028 ? 2963 : 36004, mask), _update29));
  },
  stencilOp: function stencilOp(update, fail, zfail, zpass) {
    var _update30;

    return update((_update30 = {}, _defineProperty(_update30, 2964, fail), _defineProperty(_update30, 2965, zfail), _defineProperty(_update30, 2966, zpass), _defineProperty(_update30, 34817, fail), _defineProperty(_update30, 34818, zfail), _defineProperty(_update30, 34819, zpass), _update30));
  },
  stencilOpSeparate: function stencilOpSeparate(update, face, fail, zfail, zpass) {
    var _update31;

    return update((_update31 = {}, _defineProperty(_update31, face === 1028 ? 2964 : 34817, fail), _defineProperty(_update31, face === 1028 ? 2965 : 34818, zfail), _defineProperty(_update31, face === 1028 ? 2966 : 34819, zpass), _update31));
  },
  viewport: function viewport(update, x, y, width, height) {
    return update(_defineProperty({}, 2978, [x, y, width, height]));
  }
};

var isEnabled = function isEnabled(gl, key) {
  return gl.isEnabled(key);
};

var GL_PARAMETER_GETTERS = (_GL_PARAMETER_GETTERS = {}, _defineProperty(_GL_PARAMETER_GETTERS, 3042, isEnabled), _defineProperty(_GL_PARAMETER_GETTERS, 2884, isEnabled), _defineProperty(_GL_PARAMETER_GETTERS, 2929, isEnabled), _defineProperty(_GL_PARAMETER_GETTERS, 3024, isEnabled), _defineProperty(_GL_PARAMETER_GETTERS, 32823, isEnabled), _defineProperty(_GL_PARAMETER_GETTERS, 32926, isEnabled), _defineProperty(_GL_PARAMETER_GETTERS, 32928, isEnabled), _defineProperty(_GL_PARAMETER_GETTERS, 3089, isEnabled), _defineProperty(_GL_PARAMETER_GETTERS, 2960, isEnabled), _defineProperty(_GL_PARAMETER_GETTERS, 35977, isEnabled), _GL_PARAMETER_GETTERS);

function installGetterOverride(gl, functionName) {
  var originalGetterFunc = gl[functionName].bind(gl);

  gl[functionName] = function get() {
    var pname = arguments.length <= 0 ? undefined : arguments[0];

    if (!(pname in gl.state.cache)) {
      gl.state.cache[pname] = originalGetterFunc.apply(void 0, arguments);
    }

    return gl.state.enable ? gl.state.cache[pname] : originalGetterFunc.apply(void 0, arguments);
  };

  Object.defineProperty(gl[functionName], 'name', {
    value: "".concat(functionName, "-from-cache"),
    configurable: false
  });
}

function installSetterSpy(gl, functionName, setter) {
  var originalSetterFunc = gl[functionName].bind(gl);

  gl[functionName] = function set() {
    for (var _len = arguments.length, params = new Array(_len), _key = 0; _key < _len; _key++) {
      params[_key] = arguments[_key];
    }

    var _setter = setter.apply(void 0, [gl.state._updateCache].concat(params)),
        valueChanged = _setter.valueChanged,
        oldValue = _setter.oldValue;

    if (valueChanged) {
      originalSetterFunc.apply(void 0, params);
    }

    return oldValue;
  };

  Object.defineProperty(gl[functionName], 'name', {
    value: "".concat(functionName, "-to-cache"),
    configurable: false
  });
}

function installProgramSpy(gl) {
  var originalUseProgram = gl.useProgram.bind(gl);

  gl.useProgram = function useProgramLuma(handle) {
    if (gl.state.program !== handle) {
      originalUseProgram(handle);
      gl.state.program = handle;
    }
  };
}

var GLState = function () {
  function GLState(gl) {
    var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
        _ref$copyState = _ref.copyState,
        copyState = _ref$copyState === void 0 ? false : _ref$copyState,
        _ref$log = _ref.log,
        log = _ref$log === void 0 ? function () {} : _ref$log;

    _classCallCheck(this, GLState);

    this.gl = gl;
    this.program = null;
    this.stateStack = [];
    this.enable = true;
    this.cache = copyState ? getParameters(gl) : Object.assign({}, GL_PARAMETER_DEFAULTS);
    this.log = log;
    this._updateCache = this._updateCache.bind(this);
    Object.seal(this);
  }

  _createClass(GLState, [{
    key: "push",
    value: function push() {
      this.stateStack.push({});
    }
  }, {
    key: "pop",
    value: function pop() {
      assert$2(this.stateStack.length > 0);
      var oldValues = this.stateStack[this.stateStack.length - 1];
      setParameters(this.gl, oldValues, this.cache);
      this.stateStack.pop();
    }
  }, {
    key: "_updateCache",
    value: function _updateCache(values) {
      var valueChanged = false;
      var oldValue;
      var oldValues = this.stateStack.length > 0 && this.stateStack[this.stateStack.length - 1];

      for (var key in values) {
        assert$2(key !== undefined);
        var value = values[key];
        var cached = this.cache[key];

        if (!deepArrayEqual(value, cached)) {
          valueChanged = true;
          oldValue = cached;

          if (oldValues && !(key in oldValues)) {
            oldValues[key] = cached;
          }

          this.cache[key] = value;
        }
      }

      return {
        valueChanged: valueChanged,
        oldValue: oldValue
      };
    }
  }]);

  return GLState;
}();

function trackContextState(gl) {
  var _ref2 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
      _ref2$enable = _ref2.enable,
      enable = _ref2$enable === void 0 ? true : _ref2$enable,
      copyState = _ref2.copyState;

  assert$2(copyState !== undefined);

  if (!gl.state) {
    var global_ = typeof global !== 'undefined' ? global : window;

    if (global_.polyfillContext) {
      global_.polyfillContext(gl);
    }

    gl.state = new GLState(gl, {
      copyState: copyState,
      enable: enable
    });
    installProgramSpy(gl);

    for (var key in GL_HOOKED_SETTERS) {
      var setter = GL_HOOKED_SETTERS[key];
      installSetterSpy(gl, key, setter);
    }

    installGetterOverride(gl, 'getParameter');
    installGetterOverride(gl, 'isEnabled');
  }

  gl.state.enable = enable;
  return gl;
}
function pushContextState(gl) {
  if (!gl.state) {
    trackContextState(gl, {
      copyState: false
    });
  }

  gl.state.push();
}
function popContextState(gl) {
  assert$2(gl.state);
  gl.state.pop();
}

function setParameters(gl, values) {
  assert$2(isWebGL(gl), 'setParameters requires a WebGL context');

  if (isObjectEmpty(values)) {
    return;
  }

  var compositeSetters = {};

  for (var key in values) {
    var glConstant = Number(key);
    var setter = GL_PARAMETER_SETTERS[key];

    if (setter) {
      if (typeof setter === 'string') {
        compositeSetters[setter] = true;
      } else {
        setter(gl, values[key], glConstant);
      }
    }
  }

  var cache = gl.state && gl.state.cache;

  if (cache) {
    for (var _key in compositeSetters) {
      var compositeSetter = GL_COMPOSITE_PARAMETER_SETTERS[_key];
      compositeSetter(gl, values, cache);
    }
  }
}
function getParameters(gl, parameters) {
  parameters = parameters || GL_PARAMETER_DEFAULTS;

  if (typeof parameters === 'number') {
    var key = parameters;
    var getter = GL_PARAMETER_GETTERS[key];
    return getter ? getter(gl, key) : gl.getParameter(key);
  }

  var parameterKeys = Array.isArray(parameters) ? parameters : Object.keys(parameters);
  var state = {};
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = parameterKeys[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var _key2 = _step.value;
      var _getter = GL_PARAMETER_GETTERS[_key2];
      state[_key2] = _getter ? _getter(gl, Number(_key2)) : gl.getParameter(Number(_key2));
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

  return state;
}
function resetParameters(gl) {
  setParameters(gl, GL_PARAMETER_DEFAULTS);
}
function withParameters(gl, parameters, func) {
  if (isObjectEmpty(parameters)) {
    return func(gl);
  }

  var _parameters$nocatch = parameters.nocatch,
      nocatch = _parameters$nocatch === void 0 ? true : _parameters$nocatch;
  pushContextState(gl);
  setParameters(gl, parameters);
  var value;

  if (nocatch) {
    value = func(gl);
    popContextState(gl);
  } else {
    try {
      value = func(gl);
    } finally {
      popContextState(gl);
    }
  }

  return value;
}

var isBrowser$3 = env$1.isBrowser();
var isPage = isBrowser$3 && typeof document !== 'undefined';
var CONTEXT_DEFAULTS = {
  webgl2: true,
  webgl1: true,
  throwOnError: true,
  manageState: true,
  canvas: null,
  debug: false,
  width: 800,
  height: 600
};
function createGLContext() {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  assert$2(isBrowser$3, "createGLContext on available in the browser.\nCreate your own headless context or use 'createHeadlessContext' from @luma.gl/test-utils");
  options = Object.assign({}, CONTEXT_DEFAULTS, options);
  var _options = options,
      width = _options.width,
      height = _options.height;

  function onError(message) {
    if (options.throwOnError) {
      throw new Error(message);
    }

    console.error(message);
    return null;
  }

  options.onError = onError;
  var gl;
  var _options2 = options,
      canvas = _options2.canvas;
  var targetCanvas = getCanvas({
    canvas: canvas,
    width: width,
    height: height,
    onError: onError
  });
  gl = createBrowserContext(targetCanvas, options);

  if (!gl) {
    return null;
  }

  gl = instrumentGLContext(gl, options);
  logInfo(gl);
  return gl;
}
function instrumentGLContext(gl) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  if (!gl || gl._instrumented) {
    return gl;
  }

  gl._version = gl._version || getVersion(gl);
  gl.luma = gl.luma || {};
  gl.luma.canvasSizeInfo = gl.luma.canvasSizeInfo || {};
  options = Object.assign({}, CONTEXT_DEFAULTS, options);
  var _options3 = options,
      manageState = _options3.manageState,
      debug = _options3.debug;

  if (manageState) {
    trackContextState(gl, {
      copyState: false,
      log: function log() {
        for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }

        return log$2.log.apply(log$2, [1].concat(args))();
      }
    });
  }

  if (isBrowser$3 && debug) {
    if (!env$1.global.makeDebugContext) {
      log$2.warn('WebGL debug mode not activated. import "@luma.gl/debug" to enable.')();
    } else {
      gl = env$1.global.makeDebugContext(gl, options);
      log$2.level = Math.max(log$2.level, 1);
    }
  }

  gl._instrumented = true;
  return gl;
}
function getContextDebugInfo(gl) {
  var vendorMasked = gl.getParameter(7936);
  var rendererMasked = gl.getParameter(7937);
  var ext = gl.getExtension('WEBGL_debug_renderer_info');
  var vendorUnmasked = ext && gl.getParameter(ext.UNMASKED_VENDOR_WEBGL || 7936);
  var rendererUnmasked = ext && gl.getParameter(ext.UNMASKED_RENDERER_WEBGL || 7937);
  return {
    vendor: vendorUnmasked || vendorMasked,
    renderer: rendererUnmasked || rendererMasked,
    vendorMasked: vendorMasked,
    rendererMasked: rendererMasked,
    version: gl.getParameter(7938),
    shadingLanguageVersion: gl.getParameter(35724)
  };
}
function resizeGLContext(gl) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  if (gl.canvas) {
    var devicePixelRatio = getDevicePixelRatio(options.useDevicePixels);
    setDevicePixelRatio(gl, devicePixelRatio, options);
    return;
  }

  var ext = gl.getExtension('STACKGL_resize_drawingbuffer');

  if (ext && "width" in options && "height" in options) {
    ext.resize(options.width, options.height);
  }
}

function createBrowserContext(canvas, options) {
  var onError = options.onError;

  var onCreateError = function onCreateError(error) {
    return onError("WebGL context: ".concat(error.statusMessage || 'error'));
  };

  canvas.addEventListener('webglcontextcreationerror', onCreateError, false);
  var _options$webgl = options.webgl1,
      webgl1 = _options$webgl === void 0 ? true : _options$webgl,
      _options$webgl2 = options.webgl2,
      webgl2 = _options$webgl2 === void 0 ? true : _options$webgl2;
  var gl = null;

  if (webgl2) {
    gl = gl || canvas.getContext('webgl2', options);
    gl = gl || canvas.getContext('experimental-webgl2', options);
  }

  if (webgl1) {
    gl = gl || canvas.getContext('webgl', options);
    gl = gl || canvas.getContext('experimental-webgl', options);
  }

  canvas.removeEventListener('webglcontextcreationerror', onCreateError, false);

  if (!gl) {
    return onError("Failed to create ".concat(webgl2 && !webgl1 ? 'WebGL2' : 'WebGL', " context"));
  }

  return gl;
}

function getCanvas(_ref) {
  var canvas = _ref.canvas,
      _ref$width = _ref.width,
      width = _ref$width === void 0 ? 800 : _ref$width,
      _ref$height = _ref.height,
      height = _ref$height === void 0 ? 600 : _ref$height,
      onError = _ref.onError;
  var targetCanvas;

  if (typeof canvas === 'string') {
    var isPageLoaded = isPage && document.readyState === 'complete';

    if (!isPageLoaded) {
      onError("createGLContext called on canvas '".concat(canvas, "' before page was loaded"));
    }

    targetCanvas = document.getElementById(canvas);
  } else if (canvas) {
    targetCanvas = canvas;
  } else {
    targetCanvas = document.createElement('canvas');
    targetCanvas.id = 'lumagl-canvas';
    targetCanvas.style.width = Number.isFinite(width) ? "".concat(width, "px") : '100%';
    targetCanvas.style.height = Number.isFinite(height) ? "".concat(height, "px") : '100%';
    document.body.insertBefore(targetCanvas, document.body.firstChild);
  }

  return targetCanvas;
}

function logInfo(gl) {
  var webGL = isWebGL2(gl) ? 'WebGL2' : 'WebGL1';
  var info = getContextDebugInfo(gl);
  var driver = info ? "(".concat(info.vendor, ",").concat(info.renderer, ")") : '';
  var debug = gl.debug ? ' debug' : '';

  log$2.info(1, "".concat(webGL).concat(debug, " context ").concat(driver))();
}

function getVersion(gl) {
  if (typeof WebGL2RenderingContext !== 'undefined' && gl instanceof WebGL2RenderingContext) {
    return 2;
  }

  return 1;
}

function setDevicePixelRatio(gl, devicePixelRatio, options) {
  var clientWidth = 'width' in options ? options.width : gl.canvas.clientWidth;
  var clientHeight = 'height' in options ? options.height : gl.canvas.clientHeight;

  if (!clientWidth || !clientHeight) {
    log$2.log(1, 'Canvas clientWidth/clientHeight is 0')();

    devicePixelRatio = 1;
    clientWidth = gl.canvas.width || 1;
    clientHeight = gl.canvas.height || 1;
  }

  gl.luma = gl.luma || {};
  gl.luma.canvasSizeInfo = gl.luma.canvasSizeInfo || {};
  var cachedSize = gl.luma.canvasSizeInfo;

  if (cachedSize.clientWidth !== clientWidth || cachedSize.clientHeight !== clientHeight || cachedSize.devicePixelRatio !== devicePixelRatio) {
    var clampedPixelRatio = devicePixelRatio;
    var canvasWidth = Math.floor(clientWidth * clampedPixelRatio);
    var canvasHeight = Math.floor(clientHeight * clampedPixelRatio);
    gl.canvas.width = canvasWidth;
    gl.canvas.height = canvasHeight;

    if (gl.drawingBufferWidth !== canvasWidth || gl.drawingBufferHeight !== canvasHeight) {
      log$2.warn("Device pixel ratio clamped")();

      clampedPixelRatio = Math.min(gl.drawingBufferWidth / clientWidth, gl.drawingBufferHeight / clientHeight);
      gl.canvas.width = Math.floor(clientWidth * clampedPixelRatio);
      gl.canvas.height = Math.floor(clientHeight * clampedPixelRatio);
    }

    Object.assign(gl.luma.canvasSizeInfo, {
      clientWidth: clientWidth,
      clientHeight: clientHeight,
      devicePixelRatio: devicePixelRatio
    });
  }
}

var VERSION$3 =  "8.3.1" ;
var STARTUP_MESSAGE = 'set luma.log.level=1 (or higher) to trace rendering';

var StatsManager = function () {
  function StatsManager() {
    _classCallCheck(this, StatsManager);

    this.stats = new Map();
  }

  _createClass(StatsManager, [{
    key: "get",
    value: function get(name) {
      if (!this.stats.has(name)) {
        this.stats.set(name, new Stats({
          id: name
        }));
      }

      return this.stats.get(name);
    }
  }]);

  return StatsManager;
}();

var lumaStats = new StatsManager();

if (env$1.global.luma && env$1.global.luma.VERSION !== VERSION$3) {
  throw new Error("luma.gl - multiple VERSIONs detected: ".concat(env$1.global.luma.VERSION, " vs ").concat(VERSION$3));
}

if (!env$1.global.luma) {
  if (env$1.isBrowser()) {
    log$2.log(1, "luma.gl ".concat(VERSION$3, " - ").concat(STARTUP_MESSAGE))();
  }

  env$1.global.luma = env$1.global.luma || {
    VERSION: VERSION$3,
    version: VERSION$3,
    log: log$2,
    stats: lumaStats,
    globals: {
      modules: {},
      nodeIO: {}
    }
  };
}
env$1.global.luma;

function _possibleConstructorReturn(self, call) {
  if (call && (_typeof(call) === "object" || typeof call === "function")) {
    return call;
  }

  return _assertThisInitialized(self);
}

function _getPrototypeOf(o) {
  _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
    return o.__proto__ || Object.getPrototypeOf(o);
  };
  return _getPrototypeOf(o);
}

function _setPrototypeOf(o, p) {
  _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
    o.__proto__ = p;
    return o;
  };

  return _setPrototypeOf(o, p);
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function");
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      writable: true,
      configurable: true
    }
  });
  if (superClass) _setPrototypeOf(subClass, superClass);
}

function assert$3(condition, message) {
  if (!condition) {
    throw new Error(message || 'luma.gl: assertion failed.');
  }
}

var uidCounters = {};
function uid() {
  var id = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'id';
  uidCounters[id] = uidCounters[id] || 1;
  var count = uidCounters[id]++;
  return "".concat(id, "-").concat(count);
}
function isPowerOfTwo(n) {
  assert$3(typeof n === 'number', 'Input must be a number');
  return n && (n & n - 1) === 0;
}
function isObjectEmpty$1(obj) {
  var isEmpty = true;

  for (var key in obj) {
    isEmpty = false;
    break;
  }

  return isEmpty;
}

function formatArrayValue(v, opts) {
  var _opts$maxElts = opts.maxElts,
      maxElts = _opts$maxElts === void 0 ? 16 : _opts$maxElts,
      _opts$size = opts.size,
      size = _opts$size === void 0 ? 1 : _opts$size;
  var string = '[';

  for (var i = 0; i < v.length && i < maxElts; ++i) {
    if (i > 0) {
      string += ",".concat(i % size === 0 ? ' ' : '');
    }

    string += formatValue(v[i], opts);
  }

  var terminator = v.length > maxElts ? '...' : ']';
  return "".concat(string).concat(terminator);
}

function formatValue(v) {
  var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var EPSILON = 1e-16;
  var _opts$isInteger = opts.isInteger,
      isInteger = _opts$isInteger === void 0 ? false : _opts$isInteger;

  if (Array.isArray(v) || ArrayBuffer.isView(v)) {
    return formatArrayValue(v, opts);
  }

  if (!Number.isFinite(v)) {
    return String(v);
  }

  if (Math.abs(v) < EPSILON) {
    return isInteger ? '0' : '0.';
  }

  if (isInteger) {
    return v.toFixed(0);
  }

  if (Math.abs(v) > 100 && Math.abs(v) < 10000) {
    return v.toFixed(0);
  }

  var string = v.toPrecision(2);
  var decimal = string.indexOf('.0');
  return decimal === string.length - 2 ? string.slice(0, -1) : string;
}

function stubRemovedMethods(instance, className, version, methodNames) {
  var upgradeMessage = "See luma.gl ".concat(version, " Upgrade Guide at https://luma.gl/docs/upgrade-guide");
  var prototype = Object.getPrototypeOf(instance);
  methodNames.forEach(function (methodName) {
    if (prototype.methodName) {
      return;
    }

    prototype[methodName] = function () {
      log$2.removed("Calling removed method ".concat(className, ".").concat(methodName, ": "), upgradeMessage)();
      throw new Error(methodName);
    };
  });
}

function checkProps(className, props, propChecks) {
  var _propChecks$removedPr = propChecks.removedProps,
      removedProps = _propChecks$removedPr === void 0 ? {} : _propChecks$removedPr,
      _propChecks$deprecate = propChecks.deprecatedProps,
      deprecatedProps = _propChecks$deprecate === void 0 ? {} : _propChecks$deprecate,
      _propChecks$replacedP = propChecks.replacedProps,
      replacedProps = _propChecks$replacedP === void 0 ? {} : _propChecks$replacedP;

  for (var propName in removedProps) {
    if (propName in props) {
      var replacementProp = removedProps[propName];
      var replacement = replacementProp ? "".concat(className, ".").concat(removedProps[propName]) : 'N/A';
      log$2.removed("".concat(className, ".").concat(propName), replacement)();
    }
  }

  for (var _propName in deprecatedProps) {
    if (_propName in props) {
      var _replacementProp = deprecatedProps[_propName];
      log$2.deprecated("".concat(className, ".").concat(_propName), "".concat(className, ".").concat(_replacementProp))();
    }
  }

  var newProps = null;

  for (var _propName2 in replacedProps) {
    if (_propName2 in props) {
      var _replacementProp2 = replacedProps[_propName2];
      log$2.deprecated("".concat(className, ".").concat(_propName2), "".concat(className, ".").concat(_replacementProp2))();
      newProps = newProps || Object.assign({}, props);
      newProps[_replacementProp2] = props[_propName2];
      delete newProps[_propName2];
    }
  }

  return newProps || props;
}

var ERR_CONTEXT = 'Invalid WebGLRenderingContext';
var ERR_WEBGL2 = 'Requires WebGL2';
function assertWebGLContext(gl) {
  assert$3(isWebGL(gl), ERR_CONTEXT);
}
function assertWebGL2Context(gl) {
  assert$3(isWebGL2(gl), ERR_WEBGL2);
}

var ERR_TYPE_DEDUCTION = 'Failed to deduce GL constant from typed array';
function getGLTypeFromTypedArray(arrayOrType) {
  var type = ArrayBuffer.isView(arrayOrType) ? arrayOrType.constructor : arrayOrType;

  switch (type) {
    case Float32Array:
      return 5126;

    case Uint16Array:
      return 5123;

    case Uint32Array:
      return 5125;

    case Uint8Array:
      return 5121;

    case Uint8ClampedArray:
      return 5121;

    case Int8Array:
      return 5120;

    case Int16Array:
      return 5122;

    case Int32Array:
      return 5124;

    default:
      throw new Error(ERR_TYPE_DEDUCTION);
  }
}
function getTypedArrayFromGLType(glType) {
  var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
      _ref$clamped = _ref.clamped,
      clamped = _ref$clamped === void 0 ? true : _ref$clamped;

  switch (glType) {
    case 5126:
      return Float32Array;

    case 5123:
    case 33635:
    case 32819:
    case 32820:
      return Uint16Array;

    case 5125:
      return Uint32Array;

    case 5121:
      return clamped ? Uint8ClampedArray : Uint8Array;

    case 5120:
      return Int8Array;

    case 5122:
      return Int16Array;

    case 5124:
      return Int32Array;

    default:
      throw new Error('Failed to deduce typed array type from GL constant');
  }
}
function flipRows(_ref2) {
  var data = _ref2.data,
      width = _ref2.width,
      height = _ref2.height,
      _ref2$bytesPerPixel = _ref2.bytesPerPixel,
      bytesPerPixel = _ref2$bytesPerPixel === void 0 ? 4 : _ref2$bytesPerPixel,
      temp = _ref2.temp;
  var bytesPerRow = width * bytesPerPixel;
  temp = temp || new Uint8Array(bytesPerRow);

  for (var y = 0; y < height / 2; ++y) {
    var topOffset = y * bytesPerRow;
    var bottomOffset = (height - y - 1) * bytesPerRow;
    temp.set(data.subarray(topOffset, topOffset + bytesPerRow));
    data.copyWithin(topOffset, bottomOffset, bottomOffset + bytesPerRow);
    data.set(temp, bottomOffset);
  }
}
function scalePixels$1(_ref3) {
  var data = _ref3.data,
      width = _ref3.width,
      height = _ref3.height;
  var newWidth = Math.round(width / 2);
  var newHeight = Math.round(height / 2);
  var newData = new Uint8Array(newWidth * newHeight * 4);

  for (var y = 0; y < newHeight; y++) {
    for (var x = 0; x < newWidth; x++) {
      for (var c = 0; c < 4; c++) {
        newData[(y * newWidth + x) * 4 + c] = data[(y * 2 * width + x * 2) * 4 + c];
      }
    }
  }

  return {
    data: newData,
    width: newWidth,
    height: newHeight
  };
}

function getKeyValue(gl, name) {
  if (typeof name !== 'string') {
    return name;
  }

  var number = Number(name);

  if (!isNaN(number)) {
    return number;
  }

  name = name.replace(/^.*\./, '');
  var value = gl[name];
  assert$3(value !== undefined, "Accessing undefined constant GL.".concat(name));
  return value;
}
function getKey(gl, value) {
  value = Number(value);

  for (var key in gl) {
    if (gl[key] === value) {
      return "GL.".concat(key);
    }
  }

  return String(value);
}

var ERR_RESOURCE_METHOD_UNDEFINED = 'Resource subclass must define virtual methods';

var Resource = function () {
  function Resource(gl) {
    var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    _classCallCheck(this, Resource);

    assertWebGLContext(gl);
    var id = opts.id,
        _opts$userData = opts.userData,
        userData = _opts$userData === void 0 ? {} : _opts$userData;
    this.gl = gl;
    this.id = id || uid(this.constructor.name);
    this.userData = userData;
    this._bound = false;
    this._handle = opts.handle;

    if (this._handle === undefined) {
      this._handle = this._createHandle();
    }

    this.byteLength = 0;

    this._addStats();
  }

  _createClass(Resource, [{
    key: "toString",
    value: function toString() {
      return "".concat(this.constructor.name, "(").concat(this.id, ")");
    }
  }, {
    key: "delete",
    value: function _delete() {
      var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          _ref$deleteChildren = _ref.deleteChildren,
          deleteChildren = _ref$deleteChildren === void 0 ? false : _ref$deleteChildren;

      var children = this._handle && this._deleteHandle(this._handle);

      if (this._handle) {
        this._removeStats();
      }

      this._handle = null;

      if (children && deleteChildren) {
        children.filter(Boolean).forEach(function (child) {
          child["delete"]();
        });
      }

      return this;
    }
  }, {
    key: "bind",
    value: function bind() {
      var funcOrHandle = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.handle;

      if (typeof funcOrHandle !== 'function') {
        this._bindHandle(funcOrHandle);

        return this;
      }

      var value;

      if (!this._bound) {
        this._bindHandle(this.handle);

        this._bound = true;
        value = funcOrHandle();
        this._bound = false;

        this._bindHandle(null);
      } else {
        value = funcOrHandle();
      }

      return value;
    }
  }, {
    key: "unbind",
    value: function unbind() {
      this.bind(null);
    }
  }, {
    key: "getParameter",
    value: function getParameter(pname) {
      var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      pname = getKeyValue(this.gl, pname);
      assert$3(pname);
      var parameters = this.constructor.PARAMETERS || {};
      var parameter = parameters[pname];

      if (parameter) {
        var isWebgl2 = isWebGL2(this.gl);
        var parameterAvailable = (!('webgl2' in parameter) || isWebgl2) && (!('extension' in parameter) || this.gl.getExtension(parameter.extension));

        if (!parameterAvailable) {
          var webgl1Default = parameter.webgl1;
          var webgl2Default = 'webgl2' in parameter ? parameter.webgl2 : parameter.webgl1;
          var defaultValue = isWebgl2 ? webgl2Default : webgl1Default;
          return defaultValue;
        }
      }

      return this._getParameter(pname, opts);
    }
  }, {
    key: "getParameters",
    value: function getParameters() {
      var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var _ref2 = {},
          keys = _ref2.keys;
      var PARAMETERS = this.constructor.PARAMETERS || {};
      var isWebgl2 = isWebGL2(this.gl);
      var values = {};
      var parameterKeys =  Object.keys(PARAMETERS);
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = parameterKeys[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var pname = _step.value;
          var parameter = PARAMETERS[pname];
          var parameterAvailable = parameter && (!('webgl2' in parameter) || isWebgl2) && (!('extension' in parameter) || this.gl.getExtension(parameter.extension));

          if (parameterAvailable) {
            var key = keys ? getKey(this.gl, pname) : pname;
            values[key] = this.getParameter(pname, opts);

            if (keys && parameter.type === 'GLenum') ;
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

      return values;
    }
  }, {
    key: "setParameter",
    value: function setParameter(pname, value) {
      pname = getKeyValue(this.gl, pname);
      assert$3(pname);
      var parameters = this.constructor.PARAMETERS || {};
      var parameter = parameters[pname];

      if (parameter) {
        var isWebgl2 = isWebGL2(this.gl);
        var parameterAvailable = (!('webgl2' in parameter) || isWebgl2) && (!('extension' in parameter) || this.gl.getExtension(parameter.extension));

        if (!parameterAvailable) {
          throw new Error('Parameter not available on this platform');
        }

        if (parameter.type === 'GLenum') {
          value = getKeyValue(value);
        }
      }

      this._setParameter(pname, value);

      return this;
    }
  }, {
    key: "setParameters",
    value: function setParameters(parameters) {
      for (var pname in parameters) {
        this.setParameter(pname, parameters[pname]);
      }

      return this;
    }
  }, {
    key: "stubRemovedMethods",
    value: function stubRemovedMethods$1(className, version, methodNames) {
      return stubRemovedMethods(this, className, version, methodNames);
    }
  }, {
    key: "initialize",
    value: function initialize(opts) {}
  }, {
    key: "_createHandle",
    value: function _createHandle() {
      throw new Error(ERR_RESOURCE_METHOD_UNDEFINED);
    }
  }, {
    key: "_deleteHandle",
    value: function _deleteHandle() {
      throw new Error(ERR_RESOURCE_METHOD_UNDEFINED);
    }
  }, {
    key: "_bindHandle",
    value: function _bindHandle() {
      throw new Error(ERR_RESOURCE_METHOD_UNDEFINED);
    }
  }, {
    key: "_getOptsFromHandle",
    value: function _getOptsFromHandle() {
      throw new Error(ERR_RESOURCE_METHOD_UNDEFINED);
    }
  }, {
    key: "_getParameter",
    value: function _getParameter(pname, opts) {
      throw new Error(ERR_RESOURCE_METHOD_UNDEFINED);
    }
  }, {
    key: "_setParameter",
    value: function _setParameter(pname, value) {
      throw new Error(ERR_RESOURCE_METHOD_UNDEFINED);
    }
  }, {
    key: "_context",
    value: function _context() {
      this.gl.luma = this.gl.luma || {};
      return this.gl.luma;
    }
  }, {
    key: "_addStats",
    value: function _addStats() {
      var name = this.constructor.name;
      var stats = lumaStats.get('Resource Counts');
      stats.get('Resources Created').incrementCount();
      stats.get("".concat(name, "s Created")).incrementCount();
      stats.get("".concat(name, "s Active")).incrementCount();
    }
  }, {
    key: "_removeStats",
    value: function _removeStats() {
      var name = this.constructor.name;
      var stats = lumaStats.get('Resource Counts');
      stats.get("".concat(name, "s Active")).decrementCount();
    }
  }, {
    key: "_trackAllocatedMemory",
    value: function _trackAllocatedMemory(bytes) {
      var name = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.constructor.name;
      var stats = lumaStats.get('Memory Usage');
      stats.get('GPU Memory').addCount(bytes);
      stats.get("".concat(name, " Memory")).addCount(bytes);
      this.byteLength = bytes;
    }
  }, {
    key: "_trackDeallocatedMemory",
    value: function _trackDeallocatedMemory() {
      var name = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.constructor.name;
      var stats = lumaStats.get('Memory Usage');
      stats.get('GPU Memory').subtractCount(this.byteLength);
      stats.get("".concat(name, " Memory")).subtractCount(this.byteLength);
      this.byteLength = 0;
    }
  }, {
    key: "handle",
    get: function get() {
      return this._handle;
    }
  }]);

  return Resource;
}();

function _isNativeReflectConstruct() {
  if (typeof Reflect === "undefined" || !Reflect.construct) return false;
  if (Reflect.construct.sham) return false;
  if (typeof Proxy === "function") return true;

  try {
    Date.prototype.toString.call(Reflect.construct(Date, [], function () {}));
    return true;
  } catch (e) {
    return false;
  }
}

function _construct(Parent, args, Class) {
  if (_isNativeReflectConstruct()) {
    _construct = Reflect.construct;
  } else {
    _construct = function _construct(Parent, args, Class) {
      var a = [null];
      a.push.apply(a, args);
      var Constructor = Function.bind.apply(Parent, a);
      var instance = new Constructor();
      if (Class) _setPrototypeOf(instance, Class.prototype);
      return instance;
    };
  }

  return _construct.apply(null, arguments);
}

var DEFAULT_ACCESSOR_VALUES = {
  offset: 0,
  stride: 0,
  type: 5126,
  size: 1,
  divisor: 0,
  normalized: false,
  integer: false
};
var PROP_CHECKS = {
  deprecatedProps: {
    instanced: 'divisor',
    isInstanced: 'divisor'
  }
};

var Accessor = function () {
  _createClass(Accessor, null, [{
    key: "getBytesPerElement",
    value: function getBytesPerElement(accessor) {
      var ArrayType = getTypedArrayFromGLType(accessor.type || 5126);
      return ArrayType.BYTES_PER_ELEMENT;
    }
  }, {
    key: "getBytesPerVertex",
    value: function getBytesPerVertex(accessor) {
      assert$3(accessor.size);
      var ArrayType = getTypedArrayFromGLType(accessor.type || 5126);
      return ArrayType.BYTES_PER_ELEMENT * accessor.size;
    }
  }, {
    key: "resolve",
    value: function resolve() {
      for (var _len = arguments.length, accessors = new Array(_len), _key = 0; _key < _len; _key++) {
        accessors[_key] = arguments[_key];
      }

      return _construct(Accessor, [DEFAULT_ACCESSOR_VALUES].concat(accessors));
    }
  }]);

  function Accessor() {
    var _this = this;

    _classCallCheck(this, Accessor);

    for (var _len2 = arguments.length, accessors = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      accessors[_key2] = arguments[_key2];
    }

    accessors.forEach(function (accessor) {
      return _this._assign(accessor);
    });
    Object.freeze(this);
  }

  _createClass(Accessor, [{
    key: "toString",
    value: function toString() {
      return JSON.stringify(this);
    }
  }, {
    key: "_assign",
    value: function _assign() {
      var props = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      props = checkProps('Accessor', props, PROP_CHECKS);

      if (props.type !== undefined) {
        this.type = props.type;

        if (props.type === 5124 || props.type === 5125) {
          this.integer = true;
        }
      }

      if (props.size !== undefined) {
        this.size = props.size;
      }

      if (props.offset !== undefined) {
        this.offset = props.offset;
      }

      if (props.stride !== undefined) {
        this.stride = props.stride;
      }

      if (props.normalized !== undefined) {
        this.normalized = props.normalized;
      }

      if (props.integer !== undefined) {
        this.integer = props.integer;
      }

      if (props.divisor !== undefined) {
        this.divisor = props.divisor;
      }

      if (props.buffer !== undefined) {
        this.buffer = props.buffer;
      }

      if (props.index !== undefined) {
        if (typeof index === 'boolean') {
          this.index = props.index ? 1 : 0;
        } else {
          this.index = props.index;
        }
      }

      if (props.instanced !== undefined) {
        this.divisor = props.instanced ? 1 : 0;
      }

      if (props.isInstanced !== undefined) {
        this.divisor = props.isInstanced ? 1 : 0;
      }

      return this;
    }
  }, {
    key: "BYTES_PER_ELEMENT",
    get: function get() {
      return Accessor.getBytesPerElement(this);
    }
  }, {
    key: "BYTES_PER_VERTEX",
    get: function get() {
      return Accessor.getBytesPerVertex(this);
    }
  }]);

  return Accessor;
}();

var DEBUG_DATA_LENGTH = 10;
var DEPRECATED_PROPS = {
  offset: 'accessor.offset',
  stride: 'accessor.stride',
  type: 'accessor.type',
  size: 'accessor.size',
  divisor: 'accessor.divisor',
  normalized: 'accessor.normalized',
  integer: 'accessor.integer',
  instanced: 'accessor.divisor',
  isInstanced: 'accessor.divisor'
};
var PROP_CHECKS_INITIALIZE = {
  removedProps: {},
  replacedProps: {
    bytes: 'byteLength'
  },
  deprecatedProps: DEPRECATED_PROPS
};
var PROP_CHECKS_SET_PROPS = {
  removedProps: DEPRECATED_PROPS
};

var Buffer = function (_Resource) {
  _inherits(Buffer, _Resource);

  function Buffer(gl) {
    var _this;

    var props = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    _classCallCheck(this, Buffer);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(Buffer).call(this, gl, props));

    _this.stubRemovedMethods('Buffer', 'v6.0', ['layout', 'setLayout', 'getIndexedParameter']);

    _this.target = props.target || (_this.gl.webgl2 ? 36662 : 34962);

    _this.initialize(props);

    Object.seal(_assertThisInitialized(_this));
    return _this;
  }

  _createClass(Buffer, [{
    key: "getElementCount",
    value: function getElementCount() {
      var accessor = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.accessor;
      return Math.round(this.byteLength / Accessor.getBytesPerElement(accessor));
    }
  }, {
    key: "getVertexCount",
    value: function getVertexCount() {
      var accessor = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.accessor;
      return Math.round(this.byteLength / Accessor.getBytesPerVertex(accessor));
    }
  }, {
    key: "initialize",
    value: function initialize() {
      var props = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      if (ArrayBuffer.isView(props)) {
        props = {
          data: props
        };
      }

      if (Number.isFinite(props)) {
        props = {
          byteLength: props
        };
      }

      props = checkProps('Buffer', props, PROP_CHECKS_INITIALIZE);
      this.usage = props.usage || 35044;
      this.debugData = null;
      this.setAccessor(Object.assign({}, props, props.accessor));

      if (props.data) {
        this._setData(props.data, props.offset, props.byteLength);
      } else {
        this._setByteLength(props.byteLength || 0);
      }

      return this;
    }
  }, {
    key: "setProps",
    value: function setProps(props) {
      props = checkProps('Buffer', props, PROP_CHECKS_SET_PROPS);

      if ('accessor' in props) {
        this.setAccessor(props.accessor);
      }

      return this;
    }
  }, {
    key: "setAccessor",
    value: function setAccessor(accessor) {
      accessor = Object.assign({}, accessor);
      delete accessor.buffer;
      this.accessor = new Accessor(accessor);
      return this;
    }
  }, {
    key: "reallocate",
    value: function reallocate(byteLength) {
      if (byteLength > this.byteLength) {
        this._setByteLength(byteLength);

        return true;
      }

      this.bytesUsed = byteLength;
      return false;
    }
  }, {
    key: "setData",
    value: function setData(props) {
      return this.initialize(props);
    }
  }, {
    key: "subData",
    value: function subData(props) {
      if (ArrayBuffer.isView(props)) {
        props = {
          data: props
        };
      }

      var _props = props,
          data = _props.data,
          _props$offset = _props.offset,
          offset = _props$offset === void 0 ? 0 : _props$offset,
          _props$srcOffset = _props.srcOffset,
          srcOffset = _props$srcOffset === void 0 ? 0 : _props$srcOffset;
      var byteLength = props.byteLength || props.length;
      assert$3(data);
      var target = this.gl.webgl2 ? 36663 : this.target;
      this.gl.bindBuffer(target, this.handle);

      if (srcOffset !== 0 || byteLength !== undefined) {
        assertWebGL2Context(this.gl);
        this.gl.bufferSubData(this.target, offset, data, srcOffset, byteLength);
      } else {
        this.gl.bufferSubData(target, offset, data);
      }

      this.gl.bindBuffer(target, null);
      this.debugData = null;

      this._inferType(data);

      return this;
    }
  }, {
    key: "copyData",
    value: function copyData(_ref) {
      var sourceBuffer = _ref.sourceBuffer,
          _ref$readOffset = _ref.readOffset,
          readOffset = _ref$readOffset === void 0 ? 0 : _ref$readOffset,
          _ref$writeOffset = _ref.writeOffset,
          writeOffset = _ref$writeOffset === void 0 ? 0 : _ref$writeOffset,
          size = _ref.size;
      var gl = this.gl;
      assertWebGL2Context(gl);
      gl.bindBuffer(36662, sourceBuffer.handle);
      gl.bindBuffer(36663, this.handle);
      gl.copyBufferSubData(36662, 36663, readOffset, writeOffset, size);
      gl.bindBuffer(36662, null);
      gl.bindBuffer(36663, null);
      this.debugData = null;
      return this;
    }
  }, {
    key: "getData",
    value: function getData() {
      var _ref2 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          _ref2$dstData = _ref2.dstData,
          dstData = _ref2$dstData === void 0 ? null : _ref2$dstData,
          _ref2$srcByteOffset = _ref2.srcByteOffset,
          srcByteOffset = _ref2$srcByteOffset === void 0 ? 0 : _ref2$srcByteOffset,
          _ref2$dstOffset = _ref2.dstOffset,
          dstOffset = _ref2$dstOffset === void 0 ? 0 : _ref2$dstOffset,
          _ref2$length = _ref2.length,
          length = _ref2$length === void 0 ? 0 : _ref2$length;

      assertWebGL2Context(this.gl);
      var ArrayType = getTypedArrayFromGLType(this.accessor.type || 5126, {
        clamped: false
      });

      var sourceAvailableElementCount = this._getAvailableElementCount(srcByteOffset);

      var dstElementOffset = dstOffset;
      var dstAvailableElementCount;
      var dstElementCount;

      if (dstData) {
        dstElementCount = dstData.length;
        dstAvailableElementCount = dstElementCount - dstElementOffset;
      } else {
        dstAvailableElementCount = Math.min(sourceAvailableElementCount, length || sourceAvailableElementCount);
        dstElementCount = dstElementOffset + dstAvailableElementCount;
      }

      var copyElementCount = Math.min(sourceAvailableElementCount, dstAvailableElementCount);
      length = length || copyElementCount;
      assert$3(length <= copyElementCount);
      dstData = dstData || new ArrayType(dstElementCount);
      this.gl.bindBuffer(36662, this.handle);
      this.gl.getBufferSubData(36662, srcByteOffset, dstData, dstOffset, length);
      this.gl.bindBuffer(36662, null);
      return dstData;
    }
  }, {
    key: "bind",
    value: function bind() {
      var _ref3 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          _ref3$target = _ref3.target,
          target = _ref3$target === void 0 ? this.target : _ref3$target,
          _ref3$index = _ref3.index,
          index = _ref3$index === void 0 ? this.accessor && this.accessor.index : _ref3$index,
          _ref3$offset = _ref3.offset,
          offset = _ref3$offset === void 0 ? 0 : _ref3$offset,
          size = _ref3.size;

      if (target === 35345 || target === 35982) {
        if (size !== undefined) {
          this.gl.bindBufferRange(target, index, this.handle, offset, size);
        } else {
          assert$3(offset === 0);
          this.gl.bindBufferBase(target, index, this.handle);
        }
      } else {
        this.gl.bindBuffer(target, this.handle);
      }

      return this;
    }
  }, {
    key: "unbind",
    value: function unbind() {
      var _ref4 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          _ref4$target = _ref4.target,
          target = _ref4$target === void 0 ? this.target : _ref4$target,
          _ref4$index = _ref4.index,
          index = _ref4$index === void 0 ? this.accessor && this.accessor.index : _ref4$index;

      var isIndexedBuffer = target === 35345 || target === 35982;

      if (isIndexedBuffer) {
        this.gl.bindBufferBase(target, index, null);
      } else {
        this.gl.bindBuffer(target, null);
      }

      return this;
    }
  }, {
    key: "getDebugData",
    value: function getDebugData() {
      if (!this.debugData) {
        this.debugData = this.getData({
          length: Math.min(DEBUG_DATA_LENGTH, this.byteLength)
        });
        return {
          data: this.debugData,
          changed: true
        };
      }

      return {
        data: this.debugData,
        changed: false
      };
    }
  }, {
    key: "invalidateDebugData",
    value: function invalidateDebugData() {
      this.debugData = null;
    }
  }, {
    key: "_setData",
    value: function _setData(data) {
      var offset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
      var byteLength = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : data.byteLength + offset;
      assert$3(ArrayBuffer.isView(data));

      this._trackDeallocatedMemory();

      var target = this._getTarget();

      this.gl.bindBuffer(target, this.handle);
      this.gl.bufferData(target, byteLength, this.usage);
      this.gl.bufferSubData(target, offset, data);
      this.gl.bindBuffer(target, null);
      this.debugData = data.slice(0, DEBUG_DATA_LENGTH);
      this.bytesUsed = byteLength;

      this._trackAllocatedMemory(byteLength);

      var type = getGLTypeFromTypedArray(data);
      assert$3(type);
      this.setAccessor(new Accessor(this.accessor, {
        type: type
      }));
      return this;
    }
  }, {
    key: "_setByteLength",
    value: function _setByteLength(byteLength) {
      var usage = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.usage;
      assert$3(byteLength >= 0);

      this._trackDeallocatedMemory();

      var data = byteLength;

      if (byteLength === 0) {
        data = new Float32Array(0);
      }

      var target = this._getTarget();

      this.gl.bindBuffer(target, this.handle);
      this.gl.bufferData(target, data, usage);
      this.gl.bindBuffer(target, null);
      this.usage = usage;
      this.debugData = null;
      this.bytesUsed = byteLength;

      this._trackAllocatedMemory(byteLength);

      return this;
    }
  }, {
    key: "_getTarget",
    value: function _getTarget() {
      return this.gl.webgl2 ? 36663 : this.target;
    }
  }, {
    key: "_getAvailableElementCount",
    value: function _getAvailableElementCount(srcByteOffset) {
      var ArrayType = getTypedArrayFromGLType(this.accessor.type || 5126, {
        clamped: false
      });
      var sourceElementOffset = srcByteOffset / ArrayType.BYTES_PER_ELEMENT;
      return this.getElementCount() - sourceElementOffset;
    }
  }, {
    key: "_inferType",
    value: function _inferType(data) {
      if (!this.accessor.type) {
        this.setAccessor(new Accessor(this.accessor, {
          type: getGLTypeFromTypedArray(data)
        }));
      }
    }
  }, {
    key: "_createHandle",
    value: function _createHandle() {
      return this.gl.createBuffer();
    }
  }, {
    key: "_deleteHandle",
    value: function _deleteHandle() {
      this.gl.deleteBuffer(this.handle);

      this._trackDeallocatedMemory();
    }
  }, {
    key: "_getParameter",
    value: function _getParameter(pname) {
      this.gl.bindBuffer(this.target, this.handle);
      var value = this.gl.getBufferParameter(this.target, pname);
      this.gl.bindBuffer(this.target, null);
      return value;
    }
  }, {
    key: "setByteLength",
    value: function setByteLength(byteLength) {
      log$2.deprecated('setByteLength', 'reallocate')();
      return this.reallocate(byteLength);
    }
  }, {
    key: "updateAccessor",
    value: function updateAccessor(opts) {
      log$2.deprecated('updateAccessor(...)', 'setAccessor(new Accessor(buffer.accessor, ...)')();
      this.accessor = new Accessor(this.accessor, opts);
      return this;
    }
  }, {
    key: "type",
    get: function get() {
      log$2.deprecated('Buffer.type', 'Buffer.accessor.type')();
      return this.accessor.type;
    }
  }, {
    key: "bytes",
    get: function get() {
      log$2.deprecated('Buffer.bytes', 'Buffer.byteLength')();
      return this.byteLength;
    }
  }]);

  return Buffer;
}(Resource);

var _TEXTURE_FORMATS, _DATA_FORMAT_CHANNELS, _TYPE_SIZES;
var TEXTURE_FORMATS = (_TEXTURE_FORMATS = {}, _defineProperty(_TEXTURE_FORMATS, 6407, {
  dataFormat: 6407,
  types: [5121, 33635]
}), _defineProperty(_TEXTURE_FORMATS, 6408, {
  dataFormat: 6408,
  types: [5121, 32819, 32820]
}), _defineProperty(_TEXTURE_FORMATS, 6406, {
  dataFormat: 6406,
  types: [5121]
}), _defineProperty(_TEXTURE_FORMATS, 6409, {
  dataFormat: 6409,
  types: [5121]
}), _defineProperty(_TEXTURE_FORMATS, 6410, {
  dataFormat: 6410,
  types: [5121]
}), _defineProperty(_TEXTURE_FORMATS, 33326, {
  dataFormat: 6403,
  types: [5126],
  gl2: true
}), _defineProperty(_TEXTURE_FORMATS, 33328, {
  dataFormat: 33319,
  types: [5126],
  gl2: true
}), _defineProperty(_TEXTURE_FORMATS, 34837, {
  dataFormat: 6407,
  types: [5126],
  gl2: true
}), _defineProperty(_TEXTURE_FORMATS, 34836, {
  dataFormat: 6408,
  types: [5126],
  gl2: true
}), _TEXTURE_FORMATS);
var DATA_FORMAT_CHANNELS = (_DATA_FORMAT_CHANNELS = {}, _defineProperty(_DATA_FORMAT_CHANNELS, 6403, 1), _defineProperty(_DATA_FORMAT_CHANNELS, 36244, 1), _defineProperty(_DATA_FORMAT_CHANNELS, 33319, 2), _defineProperty(_DATA_FORMAT_CHANNELS, 33320, 2), _defineProperty(_DATA_FORMAT_CHANNELS, 6407, 3), _defineProperty(_DATA_FORMAT_CHANNELS, 36248, 3), _defineProperty(_DATA_FORMAT_CHANNELS, 6408, 4), _defineProperty(_DATA_FORMAT_CHANNELS, 36249, 4), _defineProperty(_DATA_FORMAT_CHANNELS, 6402, 1), _defineProperty(_DATA_FORMAT_CHANNELS, 34041, 1), _defineProperty(_DATA_FORMAT_CHANNELS, 6406, 1), _defineProperty(_DATA_FORMAT_CHANNELS, 6409, 1), _defineProperty(_DATA_FORMAT_CHANNELS, 6410, 2), _DATA_FORMAT_CHANNELS);
var TYPE_SIZES = (_TYPE_SIZES = {}, _defineProperty(_TYPE_SIZES, 5126, 4), _defineProperty(_TYPE_SIZES, 5125, 4), _defineProperty(_TYPE_SIZES, 5124, 4), _defineProperty(_TYPE_SIZES, 5123, 2), _defineProperty(_TYPE_SIZES, 5122, 2), _defineProperty(_TYPE_SIZES, 5131, 2), _defineProperty(_TYPE_SIZES, 5120, 1), _defineProperty(_TYPE_SIZES, 5121, 1), _TYPE_SIZES);
function isFormatSupported(gl, format) {
  var info = TEXTURE_FORMATS[format];

  if (!info) {
    return false;
  }

  if (info.gl1 === undefined && info.gl2 === undefined) {
    return true;
  }

  var value = isWebGL2(gl) ? info.gl2 || info.gl1 : info.gl1;
  return typeof value === 'string' ? gl.getExtension(value) : value;
}
function isLinearFilteringSupported(gl, format) {
  var info = TEXTURE_FORMATS[format];

  switch (info && info.types[0]) {
    case 5126:
      return gl.getExtension('OES_texture_float_linear');

    case 5131:
      return gl.getExtension('OES_texture_half_float_linear');

    default:
      return true;
  }
}

var NPOT_MIN_FILTERS = [9729, 9728];

var WebGLBuffer = env$1.global.WebGLBuffer || function WebGLBuffer() {};

var Texture = function (_Resource) {
  _inherits(Texture, _Resource);

  _createClass(Texture, null, [{
    key: "isSupported",
    value: function isSupported(gl) {
      var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
          format = _ref.format,
          linearFiltering = _ref.linearFiltering;

      var supported = true;

      if (format) {
        supported = supported && isFormatSupported(gl, format);
        supported = supported && (!linearFiltering || isLinearFilteringSupported(gl, format));
      }

      return supported;
    }
  }]);

  function Texture(gl, props) {
    var _this;

    _classCallCheck(this, Texture);

    var _props$id = props.id,
        id = _props$id === void 0 ? uid('texture') : _props$id,
        handle = props.handle,
        target = props.target;
    _this = _possibleConstructorReturn(this, _getPrototypeOf(Texture).call(this, gl, {
      id: id,
      handle: handle
    }));
    _this.target = target;
    _this.textureUnit = undefined;
    _this.loaded = false;
    _this.width = undefined;
    _this.height = undefined;
    _this.depth = undefined;
    _this.format = undefined;
    _this.type = undefined;
    _this.dataFormat = undefined;
    _this.border = undefined;
    _this.textureUnit = undefined;
    _this.mipmaps = undefined;
    return _this;
  }

  _createClass(Texture, [{
    key: "toString",
    value: function toString() {
      return "Texture(".concat(this.id, ",").concat(this.width, "x").concat(this.height, ")");
    }
  }, {
    key: "initialize",
    value: function initialize() {
      var _this2 = this;

      var props = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var data = props.data;

      if (data instanceof Promise) {
        data.then(function (resolvedImageData) {
          return _this2.initialize(Object.assign({}, props, {
            pixels: resolvedImageData,
            data: resolvedImageData
          }));
        });
        return this;
      }

      var _props$pixels = props.pixels,
          pixels = _props$pixels === void 0 ? null : _props$pixels,
          _props$format = props.format,
          format = _props$format === void 0 ? 6408 : _props$format,
          _props$border = props.border,
          border = _props$border === void 0 ? 0 : _props$border,
          _props$recreate = props.recreate,
          recreate = _props$recreate === void 0 ? false : _props$recreate,
          _props$parameters = props.parameters,
          parameters = _props$parameters === void 0 ? {} : _props$parameters,
          _props$pixelStore = props.pixelStore,
          pixelStore = _props$pixelStore === void 0 ? {} : _props$pixelStore,
          _props$textureUnit = props.textureUnit,
          textureUnit = _props$textureUnit === void 0 ? undefined : _props$textureUnit;
      var _props$mipmaps = props.mipmaps,
          mipmaps = _props$mipmaps === void 0 ? true : _props$mipmaps;

      if (!data) {
        data = pixels;
      }

      var width = props.width,
          height = props.height,
          dataFormat = props.dataFormat,
          type = props.type;
      var _props$depth = props.depth,
          depth = _props$depth === void 0 ? 0 : _props$depth;

      var _this$_deduceParamete = this._deduceParameters({
        format: format,
        type: type,
        dataFormat: dataFormat,
        compressed: false,
        data: data,
        width: width,
        height: height
      });

      width = _this$_deduceParamete.width;
      height = _this$_deduceParamete.height;
      dataFormat = _this$_deduceParamete.dataFormat;
      type = _this$_deduceParamete.type;
      this.width = width;
      this.height = height;
      this.depth = depth;
      this.format = format;
      this.type = type;
      this.dataFormat = dataFormat;
      this.border = border;
      this.textureUnit = textureUnit;

      if (Number.isFinite(this.textureUnit)) {
        this.gl.activeTexture(33984 + this.textureUnit);
        this.gl.bindTexture(this.target, this.handle);
      }

      if (mipmaps && this._isNPOT()) {
        log$2.warn("texture: ".concat(this, " is Non-Power-Of-Two, disabling mipmaping"))();
        mipmaps = false;

        this._updateForNPOT(parameters);
      }

      this.mipmaps = mipmaps;
      this.setImageData({
        data: data,
        width: width,
        height: height,
        depth: depth,
        format: format,
        type: type,
        dataFormat: dataFormat,
        border: border,
        mipmaps: mipmaps,
        parameters: pixelStore
      });

      if (mipmaps) {
        this.generateMipmap();
      }

      this.setParameters(parameters);

      if (recreate) {
        this.data = data;
      }

      return this;
    }
  }, {
    key: "resize",
    value: function resize(_ref2) {
      var height = _ref2.height,
          width = _ref2.width,
          _ref2$mipmaps = _ref2.mipmaps,
          mipmaps = _ref2$mipmaps === void 0 ? false : _ref2$mipmaps;

      if (width !== this.width || height !== this.height) {
        return this.initialize({
          width: width,
          height: height,
          format: this.format,
          type: this.type,
          dataFormat: this.dataFormat,
          border: this.border,
          mipmaps: mipmaps
        });
      }

      return this;
    }
  }, {
    key: "generateMipmap",
    value: function generateMipmap() {
      var _this3 = this;

      var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      if (this._isNPOT()) {
        log$2.warn("texture: ".concat(this, " is Non-Power-Of-Two, disabling mipmaping"))();
        return this;
      }

      this.mipmaps = true;
      this.gl.bindTexture(this.target, this.handle);
      withParameters(this.gl, params, function () {
        _this3.gl.generateMipmap(_this3.target);
      });
      this.gl.bindTexture(this.target, null);
      return this;
    }
  }, {
    key: "setImageData",
    value: function setImageData(options) {
      this._trackDeallocatedMemory('Texture');

      var _options$target = options.target,
          target = _options$target === void 0 ? this.target : _options$target,
          _options$pixels = options.pixels,
          pixels = _options$pixels === void 0 ? null : _options$pixels,
          _options$level = options.level,
          level = _options$level === void 0 ? 0 : _options$level,
          _options$format = options.format,
          format = _options$format === void 0 ? this.format : _options$format,
          _options$border = options.border,
          border = _options$border === void 0 ? this.border : _options$border,
          _options$offset = options.offset,
          offset = _options$offset === void 0 ? 0 : _options$offset,
          _options$parameters = options.parameters,
          parameters = _options$parameters === void 0 ? {} : _options$parameters;
      var _options$data = options.data,
          data = _options$data === void 0 ? null : _options$data,
          _options$type = options.type,
          type = _options$type === void 0 ? this.type : _options$type,
          _options$width = options.width,
          width = _options$width === void 0 ? this.width : _options$width,
          _options$height = options.height,
          height = _options$height === void 0 ? this.height : _options$height,
          _options$dataFormat = options.dataFormat,
          dataFormat = _options$dataFormat === void 0 ? this.dataFormat : _options$dataFormat,
          _options$compressed = options.compressed,
          compressed = _options$compressed === void 0 ? false : _options$compressed;

      if (!data) {
        data = pixels;
      }

      var _this$_deduceParamete2 = this._deduceParameters({
        format: format,
        type: type,
        dataFormat: dataFormat,
        compressed: compressed,
        data: data,
        width: width,
        height: height
      });

      type = _this$_deduceParamete2.type;
      dataFormat = _this$_deduceParamete2.dataFormat;
      compressed = _this$_deduceParamete2.compressed;
      width = _this$_deduceParamete2.width;
      height = _this$_deduceParamete2.height;
      var gl = this.gl;
      gl.bindTexture(this.target, this.handle);
      var dataType = null;

      var _this$_getDataType = this._getDataType({
        data: data,
        compressed: compressed
      });

      data = _this$_getDataType.data;
      dataType = _this$_getDataType.dataType;
      withParameters(this.gl, parameters, function () {
        switch (dataType) {
          case 'null':
            gl.texImage2D(target, level, format, width, height, border, dataFormat, type, data);
            break;

          case 'typed-array':
            gl.texImage2D(target, level, format, width, height, border, dataFormat, type, data, offset);
            break;

          case 'buffer':
            assertWebGL2Context(gl);
            gl.bindBuffer(35052, data.handle || data);
            gl.texImage2D(target, level, format, width, height, border, dataFormat, type, offset);
            gl.bindBuffer(35052, null);
            break;

          case 'browser-object':
            if (isWebGL2(gl)) {
              gl.texImage2D(target, level, format, width, height, border, dataFormat, type, data);
            } else {
              gl.texImage2D(target, level, format, dataFormat, type, data);
            }

            break;

          case 'compressed':
            gl.compressedTexImage2D(target, level, format, width, height, border, data);
            break;

          default:
            assert$3(false, 'Unknown image data type');
        }
      });

      if (data && data.byteLength) {
        this._trackAllocatedMemory(data.byteLength, 'Texture');
      } else {
        var channels = DATA_FORMAT_CHANNELS[this.dataFormat] || 4;
        var channelSize = TYPE_SIZES[this.type] || 1;

        this._trackAllocatedMemory(this.width * this.height * channels * channelSize, 'Texture');
      }

      this.loaded = true;
      return this;
    }
  }, {
    key: "setSubImageData",
    value: function setSubImageData(_ref3) {
      var _this4 = this;

      var _ref3$target = _ref3.target,
          target = _ref3$target === void 0 ? this.target : _ref3$target,
          _ref3$pixels = _ref3.pixels,
          pixels = _ref3$pixels === void 0 ? null : _ref3$pixels,
          _ref3$data = _ref3.data,
          data = _ref3$data === void 0 ? null : _ref3$data,
          _ref3$x = _ref3.x,
          x = _ref3$x === void 0 ? 0 : _ref3$x,
          _ref3$y = _ref3.y,
          y = _ref3$y === void 0 ? 0 : _ref3$y,
          _ref3$width = _ref3.width,
          width = _ref3$width === void 0 ? this.width : _ref3$width,
          _ref3$height = _ref3.height,
          height = _ref3$height === void 0 ? this.height : _ref3$height,
          _ref3$level = _ref3.level,
          level = _ref3$level === void 0 ? 0 : _ref3$level,
          _ref3$format = _ref3.format,
          format = _ref3$format === void 0 ? this.format : _ref3$format,
          _ref3$type = _ref3.type,
          type = _ref3$type === void 0 ? this.type : _ref3$type,
          _ref3$dataFormat = _ref3.dataFormat,
          dataFormat = _ref3$dataFormat === void 0 ? this.dataFormat : _ref3$dataFormat,
          _ref3$compressed = _ref3.compressed,
          compressed = _ref3$compressed === void 0 ? false : _ref3$compressed,
          _ref3$offset = _ref3.offset,
          offset = _ref3$offset === void 0 ? 0 : _ref3$offset,
          _ref3$border = _ref3.border,
          border = _ref3$border === void 0 ? this.border : _ref3$border,
          _ref3$parameters = _ref3.parameters,
          parameters = _ref3$parameters === void 0 ? {} : _ref3$parameters;

      var _this$_deduceParamete3 = this._deduceParameters({
        format: format,
        type: type,
        dataFormat: dataFormat,
        compressed: compressed,
        data: data,
        width: width,
        height: height
      });

      type = _this$_deduceParamete3.type;
      dataFormat = _this$_deduceParamete3.dataFormat;
      compressed = _this$_deduceParamete3.compressed;
      width = _this$_deduceParamete3.width;
      height = _this$_deduceParamete3.height;
      assert$3(this.depth === 0, 'texSubImage not supported for 3D textures');

      if (!data) {
        data = pixels;
      }

      if (data && data.data) {
        var ndarray = data;
        data = ndarray.data;
        width = ndarray.shape[0];
        height = ndarray.shape[1];
      }

      if (data instanceof Buffer) {
        data = data.handle;
      }

      this.gl.bindTexture(this.target, this.handle);
      withParameters(this.gl, parameters, function () {
        if (compressed) {
          _this4.gl.compressedTexSubImage2D(target, level, x, y, width, height, format, data);
        } else if (data === null) {
          _this4.gl.texSubImage2D(target, level, x, y, width, height, dataFormat, type, null);
        } else if (ArrayBuffer.isView(data)) {
          _this4.gl.texSubImage2D(target, level, x, y, width, height, dataFormat, type, data, offset);
        } else if (data instanceof WebGLBuffer) {
          assertWebGL2Context(_this4.gl);

          _this4.gl.bindBuffer(35052, data);

          _this4.gl.texSubImage2D(target, level, x, y, width, height, dataFormat, type, offset);

          _this4.gl.bindBuffer(35052, null);
        } else if (isWebGL2(_this4.gl)) {
          _this4.gl.texSubImage2D(target, level, x, y, width, height, dataFormat, type, data);
        } else {
          _this4.gl.texSubImage2D(target, level, x, y, dataFormat, type, data);
        }
      });
      this.gl.bindTexture(this.target, null);
    }
  }, {
    key: "copyFramebuffer",
    value: function copyFramebuffer() {
      log$2.error('Texture.copyFramebuffer({...}) is no logner supported, use copyToTexture(source, target, opts})')();
      return null;
    }
  }, {
    key: "getActiveUnit",
    value: function getActiveUnit() {
      return this.gl.getParameter(34016) - 33984;
    }
  }, {
    key: "bind",
    value: function bind() {
      var textureUnit = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.textureUnit;
      var gl = this.gl;

      if (textureUnit !== undefined) {
        this.textureUnit = textureUnit;
        gl.activeTexture(33984 + textureUnit);
      }

      gl.bindTexture(this.target, this.handle);
      return textureUnit;
    }
  }, {
    key: "unbind",
    value: function unbind() {
      var textureUnit = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.textureUnit;
      var gl = this.gl;

      if (textureUnit !== undefined) {
        this.textureUnit = textureUnit;
        gl.activeTexture(33984 + textureUnit);
      }

      gl.bindTexture(this.target, null);
      return textureUnit;
    }
  }, {
    key: "_getDataType",
    value: function _getDataType(_ref4) {
      var data = _ref4.data,
          _ref4$compressed = _ref4.compressed,
          compressed = _ref4$compressed === void 0 ? false : _ref4$compressed;

      if (compressed) {
        return {
          data: data,
          dataType: 'compressed'
        };
      }

      if (data === null) {
        return {
          data: data,
          dataType: 'null'
        };
      }

      if (ArrayBuffer.isView(data)) {
        return {
          data: data,
          dataType: 'typed-array'
        };
      }

      if (data instanceof Buffer) {
        return {
          data: data.handle,
          dataType: 'buffer'
        };
      }

      if (data instanceof WebGLBuffer) {
        return {
          data: data,
          dataType: 'buffer'
        };
      }

      return {
        data: data,
        dataType: 'browser-object'
      };
    }
  }, {
    key: "_deduceParameters",
    value: function _deduceParameters(opts) {
      var format = opts.format,
          data = opts.data;
      var width = opts.width,
          height = opts.height,
          dataFormat = opts.dataFormat,
          type = opts.type,
          compressed = opts.compressed;
      var textureFormat = TEXTURE_FORMATS[format];
      dataFormat = dataFormat || textureFormat && textureFormat.dataFormat;
      type = type || textureFormat && textureFormat.types[0];
      compressed = compressed || textureFormat && textureFormat.compressed;

      var _this$_deduceImageSiz = this._deduceImageSize(data, width, height);

      width = _this$_deduceImageSiz.width;
      height = _this$_deduceImageSiz.height;
      return {
        dataFormat: dataFormat,
        type: type,
        compressed: compressed,
        width: width,
        height: height,
        format: format,
        data: data
      };
    }
  }, {
    key: "_deduceImageSize",
    value: function _deduceImageSize(data, width, height) {
      var size;

      if (typeof ImageData !== 'undefined' && data instanceof ImageData) {
        size = {
          width: data.width,
          height: data.height
        };
      } else if (typeof HTMLImageElement !== 'undefined' && data instanceof HTMLImageElement) {
        size = {
          width: data.naturalWidth,
          height: data.naturalHeight
        };
      } else if (typeof HTMLCanvasElement !== 'undefined' && data instanceof HTMLCanvasElement) {
        size = {
          width: data.width,
          height: data.height
        };
      } else if (typeof ImageBitmap !== 'undefined' && data instanceof ImageBitmap) {
        size = {
          width: data.width,
          height: data.height
        };
      } else if (typeof HTMLVideoElement !== 'undefined' && data instanceof HTMLVideoElement) {
        size = {
          width: data.videoWidth,
          height: data.videoHeight
        };
      } else if (!data) {
        size = {
          width: width >= 0 ? width : 1,
          height: height >= 0 ? height : 1
        };
      } else {
        size = {
          width: width,
          height: height
        };
      }

      assert$3(size, 'Could not deduced texture size');
      assert$3(width === undefined || size.width === width, 'Deduced texture width does not match supplied width');
      assert$3(height === undefined || size.height === height, 'Deduced texture height does not match supplied height');
      return size;
    }
  }, {
    key: "_createHandle",
    value: function _createHandle() {
      return this.gl.createTexture();
    }
  }, {
    key: "_deleteHandle",
    value: function _deleteHandle() {
      this.gl.deleteTexture(this.handle);

      this._trackDeallocatedMemory('Texture');
    }
  }, {
    key: "_getParameter",
    value: function _getParameter(pname) {
      switch (pname) {
        case 4096:
          return this.width;

        case 4097:
          return this.height;

        default:
          this.gl.bindTexture(this.target, this.handle);
          var value = this.gl.getTexParameter(this.target, pname);
          this.gl.bindTexture(this.target, null);
          return value;
      }
    }
  }, {
    key: "_setParameter",
    value: function _setParameter(pname, param) {
      this.gl.bindTexture(this.target, this.handle);
      param = this._getNPOTParam(pname, param);

      switch (pname) {
        case 33082:
        case 33083:
          this.gl.texParameterf(this.handle, pname, param);
          break;

        case 4096:
        case 4097:
          assert$3(false);
          break;

        default:
          this.gl.texParameteri(this.target, pname, param);
          break;
      }

      this.gl.bindTexture(this.target, null);
      return this;
    }
  }, {
    key: "_isNPOT",
    value: function _isNPOT() {
      if (isWebGL2(this.gl)) {
        return false;
      }

      if (!this.width || !this.height) {
        return false;
      }

      return !isPowerOfTwo(this.width) || !isPowerOfTwo(this.height);
    }
  }, {
    key: "_updateForNPOT",
    value: function _updateForNPOT(parameters) {
      if (parameters[this.gl.TEXTURE_MIN_FILTER] === undefined) {
        parameters[this.gl.TEXTURE_MIN_FILTER] = this.gl.LINEAR;
      }

      if (parameters[this.gl.TEXTURE_WRAP_S] === undefined) {
        parameters[this.gl.TEXTURE_WRAP_S] = this.gl.CLAMP_TO_EDGE;
      }

      if (parameters[this.gl.TEXTURE_WRAP_T] === undefined) {
        parameters[this.gl.TEXTURE_WRAP_T] = this.gl.CLAMP_TO_EDGE;
      }
    }
  }, {
    key: "_getNPOTParam",
    value: function _getNPOTParam(pname, param) {
      if (this._isNPOT()) {
        switch (pname) {
          case 10241:
            if (NPOT_MIN_FILTERS.indexOf(param) === -1) {
              param = 9729;
            }

            break;

          case 10242:
          case 10243:
            if (param !== 33071) {
              param = 33071;
            }

            break;
        }
      }

      return param;
    }
  }]);

  return Texture;
}(Resource);

var pathPrefix$1 = '';
function loadImage(url, opts) {
  assert$3(typeof url === 'string');
  url = pathPrefix$1 + url;
  return new Promise(function (resolve, reject) {
    try {
      var image = new Image();

      image.onload = function () {
        return resolve(image);
      };

      image.onerror = function () {
        return reject(new Error("Could not load image ".concat(url, ".")));
      };

      image.crossOrigin = opts && opts.crossOrigin || 'anonymous';
      image.src = url;
    } catch (error) {
      reject(error);
    }
  });
}

var Texture2D = function (_Texture) {
  _inherits(Texture2D, _Texture);

  _createClass(Texture2D, null, [{
    key: "isSupported",
    value: function isSupported(gl, opts) {
      return Texture.isSupported(gl, opts);
    }
  }]);

  function Texture2D(gl) {
    var _this;

    var props = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    _classCallCheck(this, Texture2D);

    assertWebGLContext(gl);

    if (props instanceof Promise || typeof props === 'string') {
      props = {
        data: props
      };
    }

    if (typeof props.data === 'string') {
      props = Object.assign({}, props, {
        data: loadImage(props.data)
      });
    }

    _this = _possibleConstructorReturn(this, _getPrototypeOf(Texture2D).call(this, gl, Object.assign({}, props, {
      target: 3553
    })));

    _this.initialize(props);

    Object.seal(_assertThisInitialized(_this));
    return _this;
  }

  return Texture2D;
}(Texture);

var FACES = [34069, 34070, 34071, 34072, 34073, 34074];

var TextureCube = function (_Texture) {
  _inherits(TextureCube, _Texture);

  function TextureCube(gl) {
    var _this;

    var props = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    _classCallCheck(this, TextureCube);

    assertWebGLContext(gl);
    _this = _possibleConstructorReturn(this, _getPrototypeOf(TextureCube).call(this, gl, Object.assign({}, props, {
      target: 34067
    })));

    _this.initialize(props);

    Object.seal(_assertThisInitialized(_this));
    return _this;
  }

  _createClass(TextureCube, [{
    key: "initialize",
    value: function initialize() {
      var _this2 = this;

      var props = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var _props$mipmaps = props.mipmaps,
          mipmaps = _props$mipmaps === void 0 ? true : _props$mipmaps,
          _props$parameters = props.parameters,
          parameters = _props$parameters === void 0 ? {} : _props$parameters;
      this.opts = props;
      this.setCubeMapImageData(props).then(function () {
        _this2.loaded = true;

        if (mipmaps) {
          _this2.generateMipmap(props);
        }

        _this2.setParameters(parameters);
      });
    }
  }, {
    key: "subImage",
    value: function subImage(_ref) {
      var face = _ref.face,
          data = _ref.data,
          _ref$x = _ref.x,
          x = _ref$x === void 0 ? 0 : _ref$x,
          _ref$y = _ref.y,
          y = _ref$y === void 0 ? 0 : _ref$y,
          _ref$mipmapLevel = _ref.mipmapLevel,
          mipmapLevel = _ref$mipmapLevel === void 0 ? 0 : _ref$mipmapLevel;
      return this._subImage({
        target: face,
        data: data,
        x: x,
        y: y,
        mipmapLevel: mipmapLevel
      });
    }
  }, {
    key: "setCubeMapImageData",
    value: function () {
      var _setCubeMapImageData = _asyncToGenerator(regenerator.mark(function _callee(_ref2) {
        var _this3 = this;

        var width, height, pixels, data, _ref2$border, border, _ref2$format, format, _ref2$type, type, gl, imageDataMap, resolvedFaces;

        return regenerator.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                width = _ref2.width, height = _ref2.height, pixels = _ref2.pixels, data = _ref2.data, _ref2$border = _ref2.border, border = _ref2$border === void 0 ? 0 : _ref2$border, _ref2$format = _ref2.format, format = _ref2$format === void 0 ? 6408 : _ref2$format, _ref2$type = _ref2.type, type = _ref2$type === void 0 ? 5121 : _ref2$type;
                gl = this.gl;
                imageDataMap = pixels || data;
                _context.next = 5;
                return Promise.all(FACES.map(function (face) {
                  var facePixels = imageDataMap[face];
                  return Promise.all(Array.isArray(facePixels) ? facePixels : [facePixels]);
                }));

              case 5:
                resolvedFaces = _context.sent;
                this.bind();
                FACES.forEach(function (face, index) {
                  if (resolvedFaces[index].length > 1 && _this3.opts.mipmaps !== false) {
                    log$2.warn("".concat(_this3.id, " has mipmap and multiple LODs."))();
                  }

                  resolvedFaces[index].forEach(function (image, lodLevel) {
                    if (width && height) {
                      gl.texImage2D(face, lodLevel, format, width, height, border, format, type, image);
                    } else {
                      gl.texImage2D(face, lodLevel, format, format, type, image);
                    }
                  });
                });
                this.unbind();

              case 9:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function setCubeMapImageData(_x) {
        return _setCubeMapImageData.apply(this, arguments);
      }

      return setCubeMapImageData;
    }()
  }, {
    key: "setImageDataForFace",
    value: function setImageDataForFace(options) {
      var _this4 = this;

      var face = options.face,
          width = options.width,
          height = options.height,
          pixels = options.pixels,
          data = options.data,
          _options$border = options.border,
          border = _options$border === void 0 ? 0 : _options$border,
          _options$format = options.format,
          format = _options$format === void 0 ? 6408 : _options$format,
          _options$type = options.type,
          type = _options$type === void 0 ? 5121 : _options$type;
      var gl = this.gl;
      var imageData = pixels || data;
      this.bind();

      if (imageData instanceof Promise) {
        imageData.then(function (resolvedImageData) {
          return _this4.setImageDataForFace(Object.assign({}, options, {
            face: face,
            data: resolvedImageData,
            pixels: resolvedImageData
          }));
        });
      } else if (this.width || this.height) {
        gl.texImage2D(face, 0, format, width, height, border, format, type, imageData);
      } else {
        gl.texImage2D(face, 0, format, format, type, imageData);
      }

      return this;
    }
  }]);

  return TextureCube;
}(Texture);
TextureCube.FACES = FACES;

var Texture3D = function (_Texture) {
  _inherits(Texture3D, _Texture);

  _createClass(Texture3D, null, [{
    key: "isSupported",
    value: function isSupported(gl) {
      return isWebGL2(gl);
    }
  }]);

  function Texture3D(gl) {
    var _this;

    var props = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    _classCallCheck(this, Texture3D);

    assertWebGL2Context(gl);
    props = Object.assign({
      depth: 1
    }, props, {
      target: 32879,
      unpackFlipY: false
    });
    _this = _possibleConstructorReturn(this, _getPrototypeOf(Texture3D).call(this, gl, props));

    _this.initialize(props);

    Object.seal(_assertThisInitialized(_this));
    return _this;
  }

  _createClass(Texture3D, [{
    key: "setImageData",
    value: function setImageData(_ref) {
      var _this2 = this;

      var _ref$level = _ref.level,
          level = _ref$level === void 0 ? 0 : _ref$level,
          _ref$dataFormat = _ref.dataFormat,
          dataFormat = _ref$dataFormat === void 0 ? 6408 : _ref$dataFormat,
          width = _ref.width,
          height = _ref.height,
          _ref$depth = _ref.depth,
          depth = _ref$depth === void 0 ? 1 : _ref$depth,
          _ref$border = _ref.border,
          border = _ref$border === void 0 ? 0 : _ref$border,
          format = _ref.format,
          _ref$type = _ref.type,
          type = _ref$type === void 0 ? 5121 : _ref$type,
          _ref$offset = _ref.offset,
          offset = _ref$offset === void 0 ? 0 : _ref$offset,
          data = _ref.data,
          _ref$parameters = _ref.parameters,
          parameters = _ref$parameters === void 0 ? {} : _ref$parameters;

      this._trackDeallocatedMemory('Texture');

      this.gl.bindTexture(this.target, this.handle);
      withParameters(this.gl, parameters, function () {
        if (ArrayBuffer.isView(data)) {
          _this2.gl.texImage3D(_this2.target, level, dataFormat, width, height, depth, border, format, type, data);
        }

        if (data instanceof Buffer) {
          _this2.gl.bindBuffer(35052, data.handle);

          _this2.gl.texImage3D(_this2.target, level, dataFormat, width, height, depth, border, format, type, offset);
        }
      });

      if (data && data.byteLength) {
        this._trackAllocatedMemory(data.byteLength, 'Texture');
      } else {
        var channels = DATA_FORMAT_CHANNELS[this.dataFormat] || 4;
        var channelSize = TYPE_SIZES[this.type] || 1;

        this._trackAllocatedMemory(this.width * this.height * this.depth * channels * channelSize, 'Texture');
      }

      this.loaded = true;
      return this;
    }
  }]);

  return Texture3D;
}(Texture);

function _superPropBase(object, property) {
  while (!Object.prototype.hasOwnProperty.call(object, property)) {
    object = _getPrototypeOf(object);
    if (object === null) break;
  }

  return object;
}

function _get(target, property, receiver) {
  if (typeof Reflect !== "undefined" && Reflect.get) {
    _get = Reflect.get;
  } else {
    _get = function _get(target, property, receiver) {
      var base = _superPropBase(target, property);
      if (!base) return;
      var desc = Object.getOwnPropertyDescriptor(base, property);

      if (desc.get) {
        return desc.get.call(receiver);
      }

      return desc.value;
    };
  }

  return _get(target, property, receiver || target);
}

var _$33190$36012$;

var EXT_FLOAT_WEBGL2 = 'EXT_color_buffer_float';
var RENDERBUFFER_FORMATS = (_$33190$36012$ = {}, _defineProperty(_$33190$36012$, 33189, {
  bpp: 2
}), _defineProperty(_$33190$36012$, 33190, {
  gl2: true,
  bpp: 3
}), _defineProperty(_$33190$36012$, 36012, {
  gl2: true,
  bpp: 4
}), _defineProperty(_$33190$36012$, 36168, {
  bpp: 1
}), _defineProperty(_$33190$36012$, 34041, {
  bpp: 4
}), _defineProperty(_$33190$36012$, 35056, {
  gl2: true,
  bpp: 4
}), _defineProperty(_$33190$36012$, 36013, {
  gl2: true,
  bpp: 5
}), _defineProperty(_$33190$36012$, 32854, {
  bpp: 2
}), _defineProperty(_$33190$36012$, 36194, {
  bpp: 2
}), _defineProperty(_$33190$36012$, 32855, {
  bpp: 2
}), _defineProperty(_$33190$36012$, 33321, {
  gl2: true,
  bpp: 1
}), _defineProperty(_$33190$36012$, 33330, {
  gl2: true,
  bpp: 1
}), _defineProperty(_$33190$36012$, 33329, {
  gl2: true,
  bpp: 1
}), _defineProperty(_$33190$36012$, 33332, {
  gl2: true,
  bpp: 2
}), _defineProperty(_$33190$36012$, 33331, {
  gl2: true,
  bpp: 2
}), _defineProperty(_$33190$36012$, 33334, {
  gl2: true,
  bpp: 4
}), _defineProperty(_$33190$36012$, 33333, {
  gl2: true,
  bpp: 4
}), _defineProperty(_$33190$36012$, 33323, {
  gl2: true,
  bpp: 2
}), _defineProperty(_$33190$36012$, 33336, {
  gl2: true,
  bpp: 2
}), _defineProperty(_$33190$36012$, 33335, {
  gl2: true,
  bpp: 2
}), _defineProperty(_$33190$36012$, 33338, {
  gl2: true,
  bpp: 4
}), _defineProperty(_$33190$36012$, 33337, {
  gl2: true,
  bpp: 4
}), _defineProperty(_$33190$36012$, 33340, {
  gl2: true,
  bpp: 8
}), _defineProperty(_$33190$36012$, 33339, {
  gl2: true,
  bpp: 8
}), _defineProperty(_$33190$36012$, 32849, {
  gl2: true,
  bpp: 3
}), _defineProperty(_$33190$36012$, 32856, {
  gl2: true,
  bpp: 4
}), _defineProperty(_$33190$36012$, 32857, {
  gl2: true,
  bpp: 4
}), _defineProperty(_$33190$36012$, 36220, {
  gl2: true,
  bpp: 4
}), _defineProperty(_$33190$36012$, 36238, {
  gl2: true,
  bpp: 4
}), _defineProperty(_$33190$36012$, 36975, {
  gl2: true,
  bpp: 4
}), _defineProperty(_$33190$36012$, 36214, {
  gl2: true,
  bpp: 8
}), _defineProperty(_$33190$36012$, 36232, {
  gl2: true,
  bpp: 8
}), _defineProperty(_$33190$36012$, 36226, {
  gl2: true,
  bpp: 16
}), _defineProperty(_$33190$36012$, 36208, {
  gl2: true,
  bpp: 16
}), _defineProperty(_$33190$36012$, 33325, {
  gl2: EXT_FLOAT_WEBGL2,
  bpp: 2
}), _defineProperty(_$33190$36012$, 33327, {
  gl2: EXT_FLOAT_WEBGL2,
  bpp: 4
}), _defineProperty(_$33190$36012$, 34842, {
  gl2: EXT_FLOAT_WEBGL2,
  bpp: 8
}), _defineProperty(_$33190$36012$, 33326, {
  gl2: EXT_FLOAT_WEBGL2,
  bpp: 4
}), _defineProperty(_$33190$36012$, 33328, {
  gl2: EXT_FLOAT_WEBGL2,
  bpp: 8
}), _defineProperty(_$33190$36012$, 34836, {
  gl2: EXT_FLOAT_WEBGL2,
  bpp: 16
}), _defineProperty(_$33190$36012$, 35898, {
  gl2: EXT_FLOAT_WEBGL2,
  bpp: 4
}), _$33190$36012$);

function isFormatSupported$1(gl, format, formats) {
  var info = formats[format];

  if (!info) {
    return false;
  }

  var value = isWebGL2(gl) ? info.gl2 || info.gl1 : info.gl1;

  if (typeof value === 'string') {
    return gl.getExtension(value);
  }

  return value;
}

var Renderbuffer = function (_Resource) {
  _inherits(Renderbuffer, _Resource);

  _createClass(Renderbuffer, null, [{
    key: "isSupported",
    value: function isSupported(gl) {
      var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {
        format: null
      },
          format = _ref.format;

      return !format || isFormatSupported$1(gl, format, RENDERBUFFER_FORMATS);
    }
  }, {
    key: "getSamplesForFormat",
    value: function getSamplesForFormat(gl, _ref2) {
      var format = _ref2.format;
      return gl.getInternalformatParameter(36161, format, 32937);
    }
  }]);

  function Renderbuffer(gl) {
    var _this;

    var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    _classCallCheck(this, Renderbuffer);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(Renderbuffer).call(this, gl, opts));

    _this.initialize(opts);

    Object.seal(_assertThisInitialized(_this));
    return _this;
  }

  _createClass(Renderbuffer, [{
    key: "initialize",
    value: function initialize(_ref3) {
      var format = _ref3.format,
          _ref3$width = _ref3.width,
          width = _ref3$width === void 0 ? 1 : _ref3$width,
          _ref3$height = _ref3.height,
          height = _ref3$height === void 0 ? 1 : _ref3$height,
          _ref3$samples = _ref3.samples,
          samples = _ref3$samples === void 0 ? 0 : _ref3$samples;
      assert$3(format, 'Needs format');

      this._trackDeallocatedMemory();

      this.gl.bindRenderbuffer(36161, this.handle);

      if (samples !== 0 && isWebGL2(this.gl)) {
        this.gl.renderbufferStorageMultisample(36161, samples, format, width, height);
      } else {
        this.gl.renderbufferStorage(36161, format, width, height);
      }

      this.format = format;
      this.width = width;
      this.height = height;
      this.samples = samples;

      this._trackAllocatedMemory(this.width * this.height * (this.samples || 1) * RENDERBUFFER_FORMATS[this.format].bpp);

      return this;
    }
  }, {
    key: "resize",
    value: function resize(_ref4) {
      var width = _ref4.width,
          height = _ref4.height;

      if (width !== this.width || height !== this.height) {
        return this.initialize({
          width: width,
          height: height,
          format: this.format,
          samples: this.samples
        });
      }

      return this;
    }
  }, {
    key: "_createHandle",
    value: function _createHandle() {
      return this.gl.createRenderbuffer();
    }
  }, {
    key: "_deleteHandle",
    value: function _deleteHandle() {
      this.gl.deleteRenderbuffer(this.handle);

      this._trackDeallocatedMemory();
    }
  }, {
    key: "_bindHandle",
    value: function _bindHandle(handle) {
      this.gl.bindRenderbuffer(36161, handle);
    }
  }, {
    key: "_syncHandle",
    value: function _syncHandle(handle) {
      this.format = this.getParameter(36164);
      this.width = this.getParameter(36162);
      this.height = this.getParameter(36163);
      this.samples = this.getParameter(36011);
    }
  }, {
    key: "_getParameter",
    value: function _getParameter(pname) {
      this.gl.bindRenderbuffer(36161, this.handle);
      var value = this.gl.getRenderbufferParameter(36161, pname);
      return value;
    }
  }]);

  return Renderbuffer;
}(Resource);

var GL_DEPTH_BUFFER_BIT = 0x00000100;
var GL_STENCIL_BUFFER_BIT = 0x00000400;
var GL_COLOR_BUFFER_BIT = 0x00004000;
var GL_COLOR = 0x1800;
var GL_DEPTH = 0x1801;
var GL_STENCIL = 0x1802;
var GL_DEPTH_STENCIL = 0x84f9;
var ERR_ARGUMENTS = 'clear: bad arguments';
function clear(gl) {
  var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
      _ref$framebuffer = _ref.framebuffer,
      framebuffer = _ref$framebuffer === void 0 ? null : _ref$framebuffer,
      _ref$color = _ref.color,
      color = _ref$color === void 0 ? null : _ref$color,
      _ref$depth = _ref.depth,
      depth = _ref$depth === void 0 ? null : _ref$depth,
      _ref$stencil = _ref.stencil,
      stencil = _ref$stencil === void 0 ? null : _ref$stencil;

  var parameters = {};

  if (framebuffer) {
    parameters.framebuffer = framebuffer;
  }

  var clearFlags = 0;

  if (color) {
    clearFlags |= GL_COLOR_BUFFER_BIT;

    if (color !== true) {
      parameters.clearColor = color;
    }
  }

  if (depth) {
    clearFlags |= GL_DEPTH_BUFFER_BIT;

    if (depth !== true) {
      parameters.clearDepth = depth;
    }
  }

  if (stencil) {
    clearFlags |= GL_STENCIL_BUFFER_BIT;

    if (depth !== true) {
      parameters.clearStencil = depth;
    }
  }

  assert$3(clearFlags !== 0, ERR_ARGUMENTS);
  withParameters(gl, parameters, function () {
    gl.clear(clearFlags);
  });
}
function clearBuffer(gl) {
  var _ref2 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
      _ref2$framebuffer = _ref2.framebuffer,
      framebuffer = _ref2$framebuffer === void 0 ? null : _ref2$framebuffer,
      _ref2$buffer = _ref2.buffer,
      buffer = _ref2$buffer === void 0 ? GL_COLOR : _ref2$buffer,
      _ref2$drawBuffer = _ref2.drawBuffer,
      drawBuffer = _ref2$drawBuffer === void 0 ? 0 : _ref2$drawBuffer,
      _ref2$value = _ref2.value,
      value = _ref2$value === void 0 ? [0, 0, 0, 0] : _ref2$value;

  assertWebGL2Context(gl);
  withParameters(gl, {
    framebuffer: framebuffer
  }, function () {
    switch (buffer) {
      case GL_COLOR:
        switch (value.constructor) {
          case Int32Array:
            gl.clearBufferiv(buffer, drawBuffer, value);
            break;

          case Uint32Array:
            gl.clearBufferuiv(buffer, drawBuffer, value);
            break;

          case Float32Array:
          default:
            gl.clearBufferfv(buffer, drawBuffer, value);
        }

        break;

      case GL_DEPTH:
        gl.clearBufferfv(GL_DEPTH, 0, [value]);
        break;

      case GL_STENCIL:
        gl.clearBufferiv(GL_STENCIL, 0, [value]);
        break;

      case GL_DEPTH_STENCIL:
        var _value = _slicedToArray(value, 2),
            depth = _value[0],
            stencil = _value[1];

        gl.clearBufferfi(GL_DEPTH_STENCIL, 0, depth, stencil);
        break;

      default:
        assert$3(false, ERR_ARGUMENTS);
    }
  });
}

function glFormatToComponents(format) {
  switch (format) {
    case 6406:
    case 33326:
    case 6403:
      return 1;

    case 33328:
    case 33319:
      return 2;

    case 6407:
    case 34837:
      return 3;

    case 6408:
    case 34836:
      return 4;

    default:
      assert$3(false);
      return 0;
  }
}

function readPixelsToArray(source) {
  var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
      _ref$sourceX = _ref.sourceX,
      sourceX = _ref$sourceX === void 0 ? 0 : _ref$sourceX,
      _ref$sourceY = _ref.sourceY,
      sourceY = _ref$sourceY === void 0 ? 0 : _ref$sourceY,
      _ref$sourceFormat = _ref.sourceFormat,
      sourceFormat = _ref$sourceFormat === void 0 ? 6408 : _ref$sourceFormat,
      _ref$sourceAttachment = _ref.sourceAttachment,
      sourceAttachment = _ref$sourceAttachment === void 0 ? 36064 : _ref$sourceAttachment,
      _ref$target = _ref.target,
      target = _ref$target === void 0 ? null : _ref$target,
      sourceWidth = _ref.sourceWidth,
      sourceHeight = _ref.sourceHeight,
      sourceType = _ref.sourceType;

  var _getFramebuffer = getFramebuffer(source),
      framebuffer = _getFramebuffer.framebuffer,
      deleteFramebuffer = _getFramebuffer.deleteFramebuffer;

  assert$3(framebuffer);
  var gl = framebuffer.gl,
      handle = framebuffer.handle,
      attachments = framebuffer.attachments;
  sourceWidth = sourceWidth || framebuffer.width;
  sourceHeight = sourceHeight || framebuffer.height;

  if (sourceAttachment === 36064 && handle === null) {
    sourceAttachment = 1028;
  }

  assert$3(attachments[sourceAttachment]);
  sourceType = sourceType || attachments[sourceAttachment].type;
  target = getPixelArray(target, sourceType, sourceFormat, sourceWidth, sourceHeight);
  sourceType = sourceType || getGLTypeFromTypedArray(target);
  var prevHandle = gl.bindFramebuffer(36160, handle);
  gl.readPixels(sourceX, sourceY, sourceWidth, sourceHeight, sourceFormat, sourceType, target);
  gl.bindFramebuffer(36160, prevHandle || null);

  if (deleteFramebuffer) {
    framebuffer["delete"]();
  }

  return target;
}
function copyToDataUrl(source) {
  var _ref3 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
      _ref3$sourceAttachmen = _ref3.sourceAttachment,
      sourceAttachment = _ref3$sourceAttachmen === void 0 ? 36064 : _ref3$sourceAttachmen,
      _ref3$targetMaxHeight = _ref3.targetMaxHeight,
      targetMaxHeight = _ref3$targetMaxHeight === void 0 ? Number.MAX_SAFE_INTEGER : _ref3$targetMaxHeight;

  var data = readPixelsToArray(source, {
    sourceAttachment: sourceAttachment
  });
  var width = source.width,
      height = source.height;

  while (height > targetMaxHeight) {
    var _scalePixels = scalePixels$1({
      data: data,
      width: width,
      height: height
    });

    data = _scalePixels.data;
    width = _scalePixels.width;
    height = _scalePixels.height;
  }

  flipRows({
    data: data,
    width: width,
    height: height
  });
  var canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  var context = canvas.getContext('2d');
  var imageData = context.createImageData(width, height);
  imageData.data.set(data);
  context.putImageData(imageData, 0, 0);
  return canvas.toDataURL();
}

function getFramebuffer(source) {
  if (!(source instanceof Framebuffer)) {
    return {
      framebuffer: toFramebuffer(source),
      deleteFramebuffer: true
    };
  }

  return {
    framebuffer: source,
    deleteFramebuffer: false
  };
}

function getPixelArray(pixelArray, type, format, width, height) {
  if (pixelArray) {
    return pixelArray;
  }

  type = type || 5121;
  var ArrayType = getTypedArrayFromGLType(type, {
    clamped: false
  });
  var components = glFormatToComponents(format);
  return new ArrayType(width * height * components);
}

var _FEATURES$WEBGL2$FEAT;
var FEATURES = {
  WEBGL2: 'WEBGL2',
  VERTEX_ARRAY_OBJECT: 'VERTEX_ARRAY_OBJECT',
  TIMER_QUERY: 'TIMER_QUERY',
  INSTANCED_RENDERING: 'INSTANCED_RENDERING',
  MULTIPLE_RENDER_TARGETS: 'MULTIPLE_RENDER_TARGETS',
  ELEMENT_INDEX_UINT32: 'ELEMENT_INDEX_UINT32',
  BLEND_EQUATION_MINMAX: 'BLEND_EQUATION_MINMAX',
  FLOAT_BLEND: 'FLOAT_BLEND',
  COLOR_ENCODING_SRGB: 'COLOR_ENCODING_SRGB',
  TEXTURE_DEPTH: 'TEXTURE_DEPTH',
  TEXTURE_FLOAT: 'TEXTURE_FLOAT',
  TEXTURE_HALF_FLOAT: 'TEXTURE_HALF_FLOAT',
  TEXTURE_FILTER_LINEAR_FLOAT: 'TEXTURE_FILTER_LINEAR_FLOAT',
  TEXTURE_FILTER_LINEAR_HALF_FLOAT: 'TEXTURE_FILTER_LINEAR_HALF_FLOAT',
  TEXTURE_FILTER_ANISOTROPIC: 'TEXTURE_FILTER_ANISOTROPIC',
  COLOR_ATTACHMENT_RGBA32F: 'COLOR_ATTACHMENT_RGBA32F',
  COLOR_ATTACHMENT_FLOAT: 'COLOR_ATTACHMENT_FLOAT',
  COLOR_ATTACHMENT_HALF_FLOAT: 'COLOR_ATTACHMENT_HALF_FLOAT',
  GLSL_FRAG_DATA: 'GLSL_FRAG_DATA',
  GLSL_FRAG_DEPTH: 'GLSL_FRAG_DEPTH',
  GLSL_DERIVATIVES: 'GLSL_DERIVATIVES',
  GLSL_TEXTURE_LOD: 'GLSL_TEXTURE_LOD'
};

function checkFloat32ColorAttachment(gl) {
  var testTexture = new Texture2D(gl, {
    format: 6408,
    type: 5126,
    dataFormat: 6408
  });
  var testFb = new Framebuffer(gl, {
    id: "test-framebuffer",
    check: false,
    attachments: _defineProperty({}, 36064, testTexture)
  });
  var status = testFb.getStatus();
  testTexture["delete"]();
  testFb["delete"]();
  return status === 36053;
}

var WEBGL_FEATURES = (_FEATURES$WEBGL2$FEAT = {}, _defineProperty(_FEATURES$WEBGL2$FEAT, FEATURES.WEBGL2, [false, true]), _defineProperty(_FEATURES$WEBGL2$FEAT, FEATURES.VERTEX_ARRAY_OBJECT, ['OES_vertex_array_object', true]), _defineProperty(_FEATURES$WEBGL2$FEAT, FEATURES.TIMER_QUERY, ['EXT_disjoint_timer_query', 'EXT_disjoint_timer_query_webgl2']), _defineProperty(_FEATURES$WEBGL2$FEAT, FEATURES.INSTANCED_RENDERING, ['ANGLE_instanced_arrays', true]), _defineProperty(_FEATURES$WEBGL2$FEAT, FEATURES.MULTIPLE_RENDER_TARGETS, ['WEBGL_draw_buffers', true]), _defineProperty(_FEATURES$WEBGL2$FEAT, FEATURES.ELEMENT_INDEX_UINT32, ['OES_element_index_uint', true]), _defineProperty(_FEATURES$WEBGL2$FEAT, FEATURES.BLEND_EQUATION_MINMAX, ['EXT_blend_minmax', true]), _defineProperty(_FEATURES$WEBGL2$FEAT, FEATURES.FLOAT_BLEND, ['EXT_float_blend']), _defineProperty(_FEATURES$WEBGL2$FEAT, FEATURES.COLOR_ENCODING_SRGB, ['EXT_sRGB', true]), _defineProperty(_FEATURES$WEBGL2$FEAT, FEATURES.TEXTURE_DEPTH, ['WEBGL_depth_texture', true]), _defineProperty(_FEATURES$WEBGL2$FEAT, FEATURES.TEXTURE_FLOAT, ['OES_texture_float', true]), _defineProperty(_FEATURES$WEBGL2$FEAT, FEATURES.TEXTURE_HALF_FLOAT, ['OES_texture_half_float', true]), _defineProperty(_FEATURES$WEBGL2$FEAT, FEATURES.TEXTURE_FILTER_LINEAR_FLOAT, ['OES_texture_float_linear']), _defineProperty(_FEATURES$WEBGL2$FEAT, FEATURES.TEXTURE_FILTER_LINEAR_HALF_FLOAT, ['OES_texture_half_float_linear']), _defineProperty(_FEATURES$WEBGL2$FEAT, FEATURES.TEXTURE_FILTER_ANISOTROPIC, ['EXT_texture_filter_anisotropic']), _defineProperty(_FEATURES$WEBGL2$FEAT, FEATURES.COLOR_ATTACHMENT_RGBA32F, [checkFloat32ColorAttachment, 'EXT_color_buffer_float']), _defineProperty(_FEATURES$WEBGL2$FEAT, FEATURES.COLOR_ATTACHMENT_FLOAT, [false, 'EXT_color_buffer_float']), _defineProperty(_FEATURES$WEBGL2$FEAT, FEATURES.COLOR_ATTACHMENT_HALF_FLOAT, ['EXT_color_buffer_half_float']), _defineProperty(_FEATURES$WEBGL2$FEAT, FEATURES.GLSL_FRAG_DATA, ['WEBGL_draw_buffers', true]), _defineProperty(_FEATURES$WEBGL2$FEAT, FEATURES.GLSL_FRAG_DEPTH, ['EXT_frag_depth', true]), _defineProperty(_FEATURES$WEBGL2$FEAT, FEATURES.GLSL_DERIVATIVES, ['OES_standard_derivatives', true]), _defineProperty(_FEATURES$WEBGL2$FEAT, FEATURES.GLSL_TEXTURE_LOD, ['EXT_shader_texture_lod', true]), _FEATURES$WEBGL2$FEAT);

var LOG_UNSUPPORTED_FEATURE = 2;
function hasFeature(gl, feature) {
  return hasFeatures(gl, feature);
}
function hasFeatures(gl, features) {
  features = Array.isArray(features) ? features : [features];
  return features.every(function (feature) {
    return isFeatureSupported(gl, feature);
  });
}
function getFeatures(gl) {
  gl.luma = gl.luma || {};
  gl.luma.caps = gl.luma.caps || {};

  for (var cap in WEBGL_FEATURES) {
    if (gl.luma.caps[cap] === undefined) {
      gl.luma.caps[cap] = isFeatureSupported(gl, cap);
    }
  }

  return gl.luma.caps;
}

function isFeatureSupported(gl, cap) {
  gl.luma = gl.luma || {};
  gl.luma.caps = gl.luma.caps || {};

  if (gl.luma.caps[cap] === undefined) {
    gl.luma.caps[cap] = queryFeature(gl, cap);
  }

  if (!gl.luma.caps[cap]) {
    log$2.log(LOG_UNSUPPORTED_FEATURE, "Feature: ".concat(cap, " not supported"))();
  }

  return gl.luma.caps[cap];
}

function queryFeature(gl, cap) {
  var feature = WEBGL_FEATURES[cap];
  assert$3(feature, cap);
  var isSupported;
  var featureDefinition = isWebGL2(gl) ? feature[1] || feature[0] : feature[0];

  if (typeof featureDefinition === 'function') {
    isSupported = featureDefinition(gl);
  } else if (Array.isArray(featureDefinition)) {
    isSupported = true;
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = featureDefinition[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var extension = _step.value;
        isSupported = isSupported && Boolean(gl.getExtension(extension));
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
  } else if (typeof featureDefinition === 'string') {
    isSupported = Boolean(gl.getExtension(featureDefinition));
  } else if (typeof featureDefinition === 'boolean') {
    isSupported = featureDefinition;
  } else {
    assert$3(false);
  }

  return isSupported;
}

var ERR_MULTIPLE_RENDERTARGETS = 'Multiple render targets not supported';

var Framebuffer = function (_Resource) {
  _inherits(Framebuffer, _Resource);

  _createClass(Framebuffer, [{
    key: "MAX_COLOR_ATTACHMENTS",
    get: function get() {
      return this.gl.getParameter(this.gl.MAX_COLOR_ATTACHMENTS);
    }
  }, {
    key: "MAX_DRAW_BUFFERS",
    get: function get() {
      return this.gl.getParameter(this.gl.MAX_DRAW_BUFFERS);
    }
  }], [{
    key: "isSupported",
    value: function isSupported(gl) {
      var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
          colorBufferFloat = _ref.colorBufferFloat,
          colorBufferHalfFloat = _ref.colorBufferHalfFloat;

      var supported = true;

      if (colorBufferFloat) {
        supported = Boolean(gl.getExtension('EXT_color_buffer_float') || gl.getExtension('WEBGL_color_buffer_float') || gl.getExtension('OES_texture_float'));
      }

      if (colorBufferHalfFloat) {
        supported = supported && Boolean(gl.getExtension('EXT_color_buffer_float') || gl.getExtension('EXT_color_buffer_half_float'));
      }

      return supported;
    }
  }, {
    key: "getDefaultFramebuffer",
    value: function getDefaultFramebuffer(gl) {
      gl.luma = gl.luma || {};
      gl.luma.defaultFramebuffer = gl.luma.defaultFramebuffer || new Framebuffer(gl, {
        id: 'default-framebuffer',
        handle: null,
        attachments: {}
      });
      return gl.luma.defaultFramebuffer;
    }
  }]);

  function Framebuffer(gl) {
    var _this;

    var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    _classCallCheck(this, Framebuffer);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(Framebuffer).call(this, gl, opts));
    _this.width = null;
    _this.height = null;
    _this.attachments = {};
    _this.readBuffer = 36064;
    _this.drawBuffers = [36064];
    _this.ownResources = [];

    _this.initialize(opts);

    Object.seal(_assertThisInitialized(_this));
    return _this;
  }

  _createClass(Framebuffer, [{
    key: "initialize",
    value: function initialize(_ref2) {
      var _ref2$width = _ref2.width,
          width = _ref2$width === void 0 ? 1 : _ref2$width,
          _ref2$height = _ref2.height,
          height = _ref2$height === void 0 ? 1 : _ref2$height,
          _ref2$attachments = _ref2.attachments,
          attachments = _ref2$attachments === void 0 ? null : _ref2$attachments,
          _ref2$color = _ref2.color,
          color = _ref2$color === void 0 ? true : _ref2$color,
          _ref2$depth = _ref2.depth,
          depth = _ref2$depth === void 0 ? true : _ref2$depth,
          _ref2$stencil = _ref2.stencil,
          stencil = _ref2$stencil === void 0 ? false : _ref2$stencil,
          _ref2$check = _ref2.check,
          check = _ref2$check === void 0 ? true : _ref2$check,
          readBuffer = _ref2.readBuffer,
          drawBuffers = _ref2.drawBuffers;
      assert$3(width >= 0 && height >= 0, 'Width and height need to be integers');
      this.width = width;
      this.height = height;

      if (attachments) {
        for (var attachment in attachments) {
          var target = attachments[attachment];
          var object = Array.isArray(target) ? target[0] : target;
          object.resize({
            width: width,
            height: height
          });
        }
      } else {
        attachments = this._createDefaultAttachments(color, depth, stencil, width, height);
      }

      this.update({
        clearAttachments: true,
        attachments: attachments,
        readBuffer: readBuffer,
        drawBuffers: drawBuffers
      });

      if (attachments && check) {
        this.checkStatus();
      }
    }
  }, {
    key: "delete",
    value: function _delete() {
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = this.ownResources[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var resource = _step.value;
          resource["delete"]();
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

      _get(_getPrototypeOf(Framebuffer.prototype), "delete", this).call(this);
    }
  }, {
    key: "update",
    value: function update(_ref3) {
      var _ref3$attachments = _ref3.attachments,
          attachments = _ref3$attachments === void 0 ? {} : _ref3$attachments,
          readBuffer = _ref3.readBuffer,
          drawBuffers = _ref3.drawBuffers,
          _ref3$clearAttachment = _ref3.clearAttachments,
          clearAttachments = _ref3$clearAttachment === void 0 ? false : _ref3$clearAttachment,
          _ref3$resizeAttachmen = _ref3.resizeAttachments,
          resizeAttachments = _ref3$resizeAttachmen === void 0 ? true : _ref3$resizeAttachmen;
      this.attach(attachments, {
        clearAttachments: clearAttachments,
        resizeAttachments: resizeAttachments
      });
      var gl = this.gl;
      var prevHandle = gl.bindFramebuffer(36160, this.handle);

      if (readBuffer) {
        this._setReadBuffer(readBuffer);
      }

      if (drawBuffers) {
        this._setDrawBuffers(drawBuffers);
      }

      gl.bindFramebuffer(36160, prevHandle || null);
      return this;
    }
  }, {
    key: "resize",
    value: function resize() {
      var _ref4 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          width = _ref4.width,
          height = _ref4.height;

      if (this.handle === null) {
        assert$3(width === undefined && height === undefined);
        this.width = this.gl.drawingBufferWidth;
        this.height = this.gl.drawingBufferHeight;
        return this;
      }

      if (width === undefined) {
        width = this.gl.drawingBufferWidth;
      }

      if (height === undefined) {
        height = this.gl.drawingBufferHeight;
      }

      if (width !== this.width && height !== this.height) {
        log$2.log(2, "Resizing framebuffer ".concat(this.id, " to ").concat(width, "x").concat(height))();
      }

      for (var attachmentPoint in this.attachments) {
        this.attachments[attachmentPoint].resize({
          width: width,
          height: height
        });
      }

      this.width = width;
      this.height = height;
      return this;
    }
  }, {
    key: "attach",
    value: function attach(attachments) {
      var _this2 = this;

      var _ref5 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
          _ref5$clearAttachment = _ref5.clearAttachments,
          clearAttachments = _ref5$clearAttachment === void 0 ? false : _ref5$clearAttachment,
          _ref5$resizeAttachmen = _ref5.resizeAttachments,
          resizeAttachments = _ref5$resizeAttachmen === void 0 ? true : _ref5$resizeAttachmen;

      var newAttachments = {};

      if (clearAttachments) {
        Object.keys(this.attachments).forEach(function (key) {
          newAttachments[key] = null;
        });
      }

      Object.assign(newAttachments, attachments);
      var prevHandle = this.gl.bindFramebuffer(36160, this.handle);

      for (var key in newAttachments) {
        assert$3(key !== undefined, 'Misspelled framebuffer binding point?');
        var attachment = Number(key);
        var descriptor = newAttachments[attachment];
        var object = descriptor;

        if (!object) {
          this._unattach(attachment);
        } else if (object instanceof Renderbuffer) {
          this._attachRenderbuffer({
            attachment: attachment,
            renderbuffer: object
          });
        } else if (Array.isArray(descriptor)) {
          var _descriptor = _slicedToArray(descriptor, 3),
              texture = _descriptor[0],
              _descriptor$ = _descriptor[1],
              layer = _descriptor$ === void 0 ? 0 : _descriptor$,
              _descriptor$2 = _descriptor[2],
              level = _descriptor$2 === void 0 ? 0 : _descriptor$2;

          object = texture;

          this._attachTexture({
            attachment: attachment,
            texture: texture,
            layer: layer,
            level: level
          });
        } else {
          this._attachTexture({
            attachment: attachment,
            texture: object,
            layer: 0,
            level: 0
          });
        }

        if (resizeAttachments && object) {
          object.resize({
            width: this.width,
            height: this.height
          });
        }
      }

      this.gl.bindFramebuffer(36160, prevHandle || null);
      Object.assign(this.attachments, attachments);
      Object.keys(this.attachments).filter(function (key) {
        return !_this2.attachments[key];
      }).forEach(function (key) {
        delete _this2.attachments[key];
      });
    }
  }, {
    key: "checkStatus",
    value: function checkStatus() {
      var gl = this.gl;
      var status = this.getStatus();

      if (status !== 36053) {
        throw new Error(_getFrameBufferStatus(status));
      }

      return this;
    }
  }, {
    key: "getStatus",
    value: function getStatus() {
      var gl = this.gl;
      var prevHandle = gl.bindFramebuffer(36160, this.handle);
      var status = gl.checkFramebufferStatus(36160);
      gl.bindFramebuffer(36160, prevHandle || null);
      return status;
    }
  }, {
    key: "clear",
    value: function clear$1() {
      var _ref6 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          color = _ref6.color,
          depth = _ref6.depth,
          stencil = _ref6.stencil,
          _ref6$drawBuffers = _ref6.drawBuffers,
          drawBuffers = _ref6$drawBuffers === void 0 ? [] : _ref6$drawBuffers;

      var prevHandle = this.gl.bindFramebuffer(36160, this.handle);

      if (color || depth || stencil) {
        clear(this.gl, {
          color: color,
          depth: depth,
          stencil: stencil
        });
      }

      drawBuffers.forEach(function (value, drawBuffer) {
        clearBuffer({
          drawBuffer: drawBuffer,
          value: value
        });
      });
      this.gl.bindFramebuffer(36160, prevHandle || null);
      return this;
    }
  }, {
    key: "readPixels",
    value: function readPixels() {

      log$2.error('Framebuffer.readPixels() is no logner supported, use readPixelsToArray(framebuffer)')();

      return null;
    }
  }, {
    key: "readPixelsToBuffer",
    value: function readPixelsToBuffer() {

      log$2.error('Framebuffer.readPixelsToBuffer()is no logner supported, use readPixelsToBuffer(framebuffer)')();

      return null;
    }
  }, {
    key: "copyToDataUrl",
    value: function copyToDataUrl() {

      log$2.error('Framebuffer.copyToDataUrl() is no logner supported, use copyToDataUrl(framebuffer)')();

      return null;
    }
  }, {
    key: "copyToImage",
    value: function copyToImage() {

      log$2.error('Framebuffer.copyToImage() is no logner supported, use copyToImage(framebuffer)')();

      return null;
    }
  }, {
    key: "copyToTexture",
    value: function copyToTexture() {

      log$2.error('Framebuffer.copyToTexture({...}) is no logner supported, use copyToTexture(source, target, opts})')();

      return null;
    }
  }, {
    key: "blit",
    value: function blit() {

      log$2.error('Framebuffer.blit({...}) is no logner supported, use blit(source, target, opts)')();

      return null;
    }
  }, {
    key: "invalidate",
    value: function invalidate(_ref7) {
      var _ref7$attachments = _ref7.attachments,
          attachments = _ref7$attachments === void 0 ? [] : _ref7$attachments,
          _ref7$x = _ref7.x,
          x = _ref7$x === void 0 ? 0 : _ref7$x,
          _ref7$y = _ref7.y,
          y = _ref7$y === void 0 ? 0 : _ref7$y,
          width = _ref7.width,
          height = _ref7.height;
      var gl = this.gl;
      assertWebGL2Context(gl);
      var prevHandle = gl.bindFramebuffer(36008, this.handle);
      var invalidateAll = x === 0 && y === 0 && width === undefined && height === undefined;

      if (invalidateAll) {
        gl.invalidateFramebuffer(36008, attachments);
      } else {
        gl.invalidateFramebuffer(36008, attachments, x, y, width, height);
      }

      gl.bindFramebuffer(36008, prevHandle);
      return this;
    }
  }, {
    key: "getAttachmentParameter",
    value: function getAttachmentParameter(attachment, pname, keys) {
      var value = this._getAttachmentParameterFallback(pname);

      if (value === null) {
        this.gl.bindFramebuffer(36160, this.handle);
        value = this.gl.getFramebufferAttachmentParameter(36160, attachment, pname);
        this.gl.bindFramebuffer(36160, null);
      }

      if (keys && value > 1000) {
        value = getKey(this.gl, value);
      }

      return value;
    }
  }, {
    key: "getAttachmentParameters",
    value: function getAttachmentParameters() {
      var attachment = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 36064;
      var keys = arguments.length > 1 ? arguments[1] : undefined;
      var parameters = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : this.constructor.ATTACHMENT_PARAMETERS || [];
      var values = {};
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = parameters[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var pname = _step2.value;
          var key = keys ? getKey(this.gl, pname) : pname;
          values[key] = this.getAttachmentParameter(attachment, pname, keys);
        }
      } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion2 && _iterator2["return"] != null) {
            _iterator2["return"]();
          }
        } finally {
          if (_didIteratorError2) {
            throw _iteratorError2;
          }
        }
      }

      return values;
    }
  }, {
    key: "getParameters",
    value: function getParameters() {
      var keys = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
      var attachments = Object.keys(this.attachments);
      var parameters = {};

      for (var _i = 0, _attachments = attachments; _i < _attachments.length; _i++) {
        var attachmentName = _attachments[_i];
        var attachment = Number(attachmentName);
        var key = keys ? getKey(this.gl, attachment) : attachment;
        parameters[key] = this.getAttachmentParameters(attachment, keys);
      }

      return parameters;
    }
  }, {
    key: "show",
    value: function show() {
      if (typeof window !== 'undefined') {
        window.open(copyToDataUrl(this), 'luma-debug-texture');
      }

      return this;
    }
  }, {
    key: "log",
    value: function log() {
      var logLevel = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
      var message = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';

      if (logLevel > log$2.level || typeof window === 'undefined') {
        return this;
      }

      message = message || "Framebuffer ".concat(this.id);
      var image = copyToDataUrl(this, {
        maxHeight: 100
      });

      log$2.image({
        logLevel: logLevel,
        message: message,
        image: image
      }, message)();

      return this;
    }
  }, {
    key: "bind",
    value: function bind() {
      var _ref8 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          _ref8$target = _ref8.target,
          target = _ref8$target === void 0 ? 36160 : _ref8$target;

      this.gl.bindFramebuffer(target, this.handle);
      return this;
    }
  }, {
    key: "unbind",
    value: function unbind() {
      var _ref9 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          _ref9$target = _ref9.target,
          target = _ref9$target === void 0 ? 36160 : _ref9$target;

      this.gl.bindFramebuffer(target, null);
      return this;
    }
  }, {
    key: "_createDefaultAttachments",
    value: function _createDefaultAttachments(color, depth, stencil, width, height) {
      var defaultAttachments = null;

      if (color) {
        var _parameters;

        defaultAttachments = defaultAttachments || {};
        defaultAttachments[36064] = new Texture2D(this.gl, {
          id: "".concat(this.id, "-color0"),
          pixels: null,
          format: 6408,
          type: 5121,
          width: width,
          height: height,
          mipmaps: false,
          parameters: (_parameters = {}, _defineProperty(_parameters, 10241, 9729), _defineProperty(_parameters, 10240, 9729), _defineProperty(_parameters, 10242, 33071), _defineProperty(_parameters, 10243, 33071), _parameters)
        });
        this.ownResources.push(defaultAttachments[36064]);
      }

      if (depth && stencil) {
        defaultAttachments = defaultAttachments || {};
        defaultAttachments[33306] = new Renderbuffer(this.gl, {
          id: "".concat(this.id, "-depth-stencil"),
          format: 35056,
          width: width,
          height: 111
        });
        this.ownResources.push(defaultAttachments[33306]);
      } else if (depth) {
        defaultAttachments = defaultAttachments || {};
        defaultAttachments[36096] = new Renderbuffer(this.gl, {
          id: "".concat(this.id, "-depth"),
          format: 33189,
          width: width,
          height: height
        });
        this.ownResources.push(defaultAttachments[36096]);
      } else if (stencil) {
        assert$3(false);
      }

      return defaultAttachments;
    }
  }, {
    key: "_unattach",
    value: function _unattach(attachment) {
      var oldAttachment = this.attachments[attachment];

      if (!oldAttachment) {
        return;
      }

      if (oldAttachment instanceof Renderbuffer) {
        this.gl.framebufferRenderbuffer(36160, attachment, 36161, null);
      } else {
        this.gl.framebufferTexture2D(36160, attachment, 3553, null, 0);
      }

      delete this.attachments[attachment];
    }
  }, {
    key: "_attachRenderbuffer",
    value: function _attachRenderbuffer(_ref10) {
      var _ref10$attachment = _ref10.attachment,
          attachment = _ref10$attachment === void 0 ? 36064 : _ref10$attachment,
          renderbuffer = _ref10.renderbuffer;
      var gl = this.gl;
      gl.framebufferRenderbuffer(36160, attachment, 36161, renderbuffer.handle);
      this.attachments[attachment] = renderbuffer;
    }
  }, {
    key: "_attachTexture",
    value: function _attachTexture(_ref11) {
      var _ref11$attachment = _ref11.attachment,
          attachment = _ref11$attachment === void 0 ? 36064 : _ref11$attachment,
          texture = _ref11.texture,
          layer = _ref11.layer,
          level = _ref11.level;
      var gl = this.gl;
      gl.bindTexture(texture.target, texture.handle);

      switch (texture.target) {
        case 35866:
        case 32879:
          gl.framebufferTextureLayer(36160, attachment, texture.target, level, layer);
          break;

        case 34067:
          var face = mapIndexToCubeMapFace(layer);
          gl.framebufferTexture2D(36160, attachment, face, texture.handle, level);
          break;

        case 3553:
          gl.framebufferTexture2D(36160, attachment, 3553, texture.handle, level);
          break;

        default:
          assert$3(false, 'Illegal texture type');
      }

      gl.bindTexture(texture.target, null);
      this.attachments[attachment] = texture;
    }
  }, {
    key: "_setReadBuffer",
    value: function _setReadBuffer(readBuffer) {
      var gl = this.gl;

      if (isWebGL2(gl)) {
        gl.readBuffer(readBuffer);
      } else {
        assert$3(readBuffer === 36064 || readBuffer === 1029, ERR_MULTIPLE_RENDERTARGETS);
      }

      this.readBuffer = readBuffer;
    }
  }, {
    key: "_setDrawBuffers",
    value: function _setDrawBuffers(drawBuffers) {
      var gl = this.gl;

      if (isWebGL2(gl)) {
        gl.drawBuffers(drawBuffers);
      } else {
        var ext = gl.getExtension('WEBGL.draw_buffers');

        if (ext) {
          ext.drawBuffersWEBGL(drawBuffers);
        } else {
          assert$3(drawBuffers.length === 1 && (drawBuffers[0] === 36064 || drawBuffers[0] === 1029), ERR_MULTIPLE_RENDERTARGETS);
        }
      }

      this.drawBuffers = drawBuffers;
    }
  }, {
    key: "_getAttachmentParameterFallback",
    value: function _getAttachmentParameterFallback(pname) {
      var caps = getFeatures(this.gl);

      switch (pname) {
        case 36052:
          return !caps.WEBGL2 ? 0 : null;

        case 33298:
        case 33299:
        case 33300:
        case 33301:
        case 33302:
        case 33303:
          return !caps.WEBGL2 ? 8 : null;

        case 33297:
          return !caps.WEBGL2 ? 5125 : null;

        case 33296:
          return !caps.WEBGL2 && !caps.EXT_sRGB ? 9729 : null;

        default:
          return null;
      }
    }
  }, {
    key: "_createHandle",
    value: function _createHandle() {
      return this.gl.createFramebuffer();
    }
  }, {
    key: "_deleteHandle",
    value: function _deleteHandle() {
      this.gl.deleteFramebuffer(this.handle);
    }
  }, {
    key: "_bindHandle",
    value: function _bindHandle(handle) {
      return this.gl.bindFramebuffer(36160, handle);
    }
  }, {
    key: "color",
    get: function get() {
      return this.attachments[36064] || null;
    }
  }, {
    key: "texture",
    get: function get() {
      return this.attachments[36064] || null;
    }
  }, {
    key: "depth",
    get: function get() {
      return this.attachments[36096] || this.attachments[33306] || null;
    }
  }, {
    key: "stencil",
    get: function get() {
      return this.attachments[36128] || this.attachments[33306] || null;
    }
  }]);

  return Framebuffer;
}(Resource);

function mapIndexToCubeMapFace(layer) {
  return layer < 34069 ? layer + 34069 : layer;
}

function _getFrameBufferStatus(status) {
  var STATUS = Framebuffer.STATUS || {};
  return STATUS[status] || "Framebuffer error ".concat(status);
}

var FRAMEBUFFER_ATTACHMENT_PARAMETERS = [36049, 36048, 33296, 33298, 33299, 33300, 33301, 33302, 33303];
Framebuffer.ATTACHMENT_PARAMETERS = FRAMEBUFFER_ATTACHMENT_PARAMETERS;

function cloneTextureFrom(refTexture, overrides) {
  assert$3(refTexture instanceof Texture2D || refTexture instanceof TextureCube || refTexture instanceof Texture3D);
  var TextureType = refTexture.constructor;
  var gl = refTexture.gl,
      width = refTexture.width,
      height = refTexture.height,
      format = refTexture.format,
      type = refTexture.type,
      dataFormat = refTexture.dataFormat,
      border = refTexture.border,
      mipmaps = refTexture.mipmaps;
  var textureOptions = Object.assign({
    width: width,
    height: height,
    format: format,
    type: type,
    dataFormat: dataFormat,
    border: border,
    mipmaps: mipmaps
  }, overrides);
  return new TextureType(gl, textureOptions);
}
function toFramebuffer(texture, opts) {
  var gl = texture.gl,
      width = texture.width,
      height = texture.height,
      id = texture.id;
  var framebuffer = new Framebuffer(gl, Object.assign({}, opts, {
    id: "framebuffer-for-".concat(id),
    width: width,
    height: height,
    attachments: _defineProperty({}, 36064, texture)
  }));
  return framebuffer;
}

function getShaderName(shader) {
  var defaultName = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'unnamed';
  var SHADER_NAME_REGEXP = /#define[\s*]SHADER_NAME[\s*]([A-Za-z0-9_-]+)[\s*]/;
  var match = shader.match(SHADER_NAME_REGEXP);
  return match ? match[1] : defaultName;
}

var GL_FRAGMENT_SHADER = 0x8b30;
var GL_VERTEX_SHADER = 0x8b31;
function getShaderTypeName(type) {
  switch (type) {
    case GL_FRAGMENT_SHADER:
      return 'fragment';

    case GL_VERTEX_SHADER:
      return 'vertex';

    default:
      return 'unknown type';
  }
}

function parseGLSLCompilerError(errLog, src, shaderType, shaderName) {
  var errorStrings = errLog.split(/\r?\n/);
  var errors = {};
  var warnings = {};
  var name = shaderName || getShaderName(src) || '(unnamed)';
  var shaderDescription = "".concat(getShaderTypeName(shaderType), " shader ").concat(name);

  for (var i = 0; i < errorStrings.length; i++) {
    var errorString = errorStrings[i];

    if (errorString.length <= 1) {
      continue;
    }

    var segments = errorString.split(':');
    var type = segments[0];
    var line = parseInt(segments[2], 10);

    if (isNaN(line)) {
      throw new Error("GLSL compilation error in ".concat(shaderDescription, ": ").concat(errLog));
    }

    if (type !== 'WARNING') {
      errors[line] = errorString;
    } else {
      warnings[line] = errorString;
    }
  }

  var lines = addLineNumbers(src);
  return {
    shaderName: shaderDescription,
    errors: formatErrors(errors, lines),
    warnings: formatErrors(warnings, lines)
  };
}

function formatErrors(errors, lines) {
  var message = '';

  for (var i = 0; i < lines.length; i++) {
    var line = lines[i];

    if (!errors[i + 3] && !errors[i + 2] && !errors[i + 1]) {
      continue;
    }

    message += "".concat(line, "\n");

    if (errors[i + 1]) {
      var error = errors[i + 1];
      var segments = error.split(':', 3);
      var type = segments[0];
      var column = parseInt(segments[1], 10) || 0;
      var err = error.substring(segments.join(':').length + 1).trim();
      message += padLeft("^^^ ".concat(type, ": ").concat(err, "\n\n"), column);
    }
  }

  return message;
}

function addLineNumbers(string) {
  var start = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
  var delim = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : ': ';
  var lines = string.split(/\r?\n/);
  var maxDigits = String(lines.length + start - 1).length;
  return lines.map(function (line, i) {
    var lineNumber = i + start;
    var digits = String(lineNumber).length;
    var prefix = padLeft(lineNumber, maxDigits - digits);
    return prefix + delim + line;
  });
}

function padLeft(string, digits) {
  var result = '';

  for (var i = 0; i < digits; ++i) {
    result += ' ';
  }

  return "".concat(result).concat(string);
}

function getShaderVersion(source) {
  var version = 100;
  var words = source.match(/[^\s]+/g);

  if (words.length >= 2 && words[0] === '#version') {
    var v = parseInt(words[1], 10);

    if (Number.isFinite(v)) {
      version = v;
    }
  }

  return version;
}

var ERR_SOURCE = 'Shader: GLSL source code must be a JavaScript string';
var Shader = function (_Resource) {
  _inherits(Shader, _Resource);

  _createClass(Shader, null, [{
    key: "getTypeName",
    value: function getTypeName(shaderType) {
      switch (shaderType) {
        case 35633:
          return 'vertex-shader';

        case 35632:
          return 'fragment-shader';

        default:
          assert$3(false);
          return 'unknown';
      }
    }
  }]);

  function Shader(gl, props) {
    var _this;

    _classCallCheck(this, Shader);

    assertWebGLContext(gl);
    assert$3(typeof props.source === 'string', ERR_SOURCE);
    var id = getShaderName(props.source, null) || props.id || uid("unnamed ".concat(Shader.getTypeName(props.shaderType)));
    _this = _possibleConstructorReturn(this, _getPrototypeOf(Shader).call(this, gl, {
      id: id
    }));
    _this.shaderType = props.shaderType;
    _this.source = props.source;

    _this.initialize(props);

    return _this;
  }

  _createClass(Shader, [{
    key: "initialize",
    value: function initialize(_ref) {
      var source = _ref.source;
      var shaderName = getShaderName(source, null);

      if (shaderName) {
        this.id = uid(shaderName);
      }

      this._compile(source);
    }
  }, {
    key: "getParameter",
    value: function getParameter(pname) {
      return this.gl.getShaderParameter(this.handle, pname);
    }
  }, {
    key: "toString",
    value: function toString() {
      return "".concat(Shader.getTypeName(this.shaderType), ":").concat(this.id);
    }
  }, {
    key: "getName",
    value: function getName() {
      return getShaderName(this.source) || 'unnamed-shader';
    }
  }, {
    key: "getSource",
    value: function getSource() {
      return this.gl.getShaderSource(this.handle);
    }
  }, {
    key: "getTranslatedSource",
    value: function getTranslatedSource() {
      var extension = this.gl.getExtension('WEBGL.debug_shaders');
      return extension ? extension.getTranslatedShaderSource(this.handle) : 'No translated source available. WEBGL.debug_shaders not implemented';
    }
  }, {
    key: "_compile",
    value: function _compile() {
      var source = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.source;

      if (!source.startsWith('#version ')) {
        source = "#version 100\n".concat(source);
      }

      this.source = source;
      this.gl.shaderSource(this.handle, this.source);
      this.gl.compileShader(this.handle);
      var compileStatus = this.getParameter(35713);

      if (!compileStatus) {
        var infoLog = this.gl.getShaderInfoLog(this.handle);

        var _parseGLSLCompilerErr = parseGLSLCompilerError(infoLog, this.source, this.shaderType, this.id),
            shaderName = _parseGLSLCompilerErr.shaderName,
            errors = _parseGLSLCompilerErr.errors,
            warnings = _parseGLSLCompilerErr.warnings;

        log$2.error("GLSL compilation errors in ".concat(shaderName, "\n").concat(errors))();
        log$2.warn("GLSL compilation warnings in ".concat(shaderName, "\n").concat(warnings))();
        throw new Error("GLSL compilation errors in ".concat(shaderName));
      }
    }
  }, {
    key: "_deleteHandle",
    value: function _deleteHandle() {
      this.gl.deleteShader(this.handle);
    }
  }, {
    key: "_getOptsFromHandle",
    value: function _getOptsFromHandle() {
      return {
        type: this.getParameter(35663),
        source: this.getSource()
      };
    }
  }]);

  return Shader;
}(Resource);
var VertexShader = function (_Shader) {
  _inherits(VertexShader, _Shader);

  function VertexShader(gl, props) {
    _classCallCheck(this, VertexShader);

    if (typeof props === 'string') {
      props = {
        source: props
      };
    }

    return _possibleConstructorReturn(this, _getPrototypeOf(VertexShader).call(this, gl, Object.assign({}, props, {
      shaderType: 35633
    })));
  }

  _createClass(VertexShader, [{
    key: "_createHandle",
    value: function _createHandle() {
      return this.gl.createShader(35633);
    }
  }]);

  return VertexShader;
}(Shader);
var FragmentShader = function (_Shader2) {
  _inherits(FragmentShader, _Shader2);

  function FragmentShader(gl, props) {
    _classCallCheck(this, FragmentShader);

    if (typeof props === 'string') {
      props = {
        source: props
      };
    }

    return _possibleConstructorReturn(this, _getPrototypeOf(FragmentShader).call(this, gl, Object.assign({}, props, {
      shaderType: 35632
    })));
  }

  _createClass(FragmentShader, [{
    key: "_createHandle",
    value: function _createHandle() {
      return this.gl.createShader(35632);
    }
  }]);

  return FragmentShader;
}(Shader);

var _UNIFORM_SETTERS;
var UNIFORM_SETTERS = (_UNIFORM_SETTERS = {}, _defineProperty(_UNIFORM_SETTERS, 5126, getArraySetter.bind(null, 'uniform1fv', toFloatArray, 1, setVectorUniform)), _defineProperty(_UNIFORM_SETTERS, 35664, getArraySetter.bind(null, 'uniform2fv', toFloatArray, 2, setVectorUniform)), _defineProperty(_UNIFORM_SETTERS, 35665, getArraySetter.bind(null, 'uniform3fv', toFloatArray, 3, setVectorUniform)), _defineProperty(_UNIFORM_SETTERS, 35666, getArraySetter.bind(null, 'uniform4fv', toFloatArray, 4, setVectorUniform)), _defineProperty(_UNIFORM_SETTERS, 5124, getArraySetter.bind(null, 'uniform1iv', toIntArray, 1, setVectorUniform)), _defineProperty(_UNIFORM_SETTERS, 35667, getArraySetter.bind(null, 'uniform2iv', toIntArray, 2, setVectorUniform)), _defineProperty(_UNIFORM_SETTERS, 35668, getArraySetter.bind(null, 'uniform3iv', toIntArray, 3, setVectorUniform)), _defineProperty(_UNIFORM_SETTERS, 35669, getArraySetter.bind(null, 'uniform4iv', toIntArray, 4, setVectorUniform)), _defineProperty(_UNIFORM_SETTERS, 35670, getArraySetter.bind(null, 'uniform1iv', toIntArray, 1, setVectorUniform)), _defineProperty(_UNIFORM_SETTERS, 35671, getArraySetter.bind(null, 'uniform2iv', toIntArray, 2, setVectorUniform)), _defineProperty(_UNIFORM_SETTERS, 35672, getArraySetter.bind(null, 'uniform3iv', toIntArray, 3, setVectorUniform)), _defineProperty(_UNIFORM_SETTERS, 35673, getArraySetter.bind(null, 'uniform4iv', toIntArray, 4, setVectorUniform)), _defineProperty(_UNIFORM_SETTERS, 35674, getArraySetter.bind(null, 'uniformMatrix2fv', toFloatArray, 4, setMatrixUniform)), _defineProperty(_UNIFORM_SETTERS, 35675, getArraySetter.bind(null, 'uniformMatrix3fv', toFloatArray, 9, setMatrixUniform)), _defineProperty(_UNIFORM_SETTERS, 35676, getArraySetter.bind(null, 'uniformMatrix4fv', toFloatArray, 16, setMatrixUniform)), _defineProperty(_UNIFORM_SETTERS, 35678, getSamplerSetter), _defineProperty(_UNIFORM_SETTERS, 35680, getSamplerSetter), _defineProperty(_UNIFORM_SETTERS, 5125, getArraySetter.bind(null, 'uniform1uiv', toUIntArray, 1, setVectorUniform)), _defineProperty(_UNIFORM_SETTERS, 36294, getArraySetter.bind(null, 'uniform2uiv', toUIntArray, 2, setVectorUniform)), _defineProperty(_UNIFORM_SETTERS, 36295, getArraySetter.bind(null, 'uniform3uiv', toUIntArray, 3, setVectorUniform)), _defineProperty(_UNIFORM_SETTERS, 36296, getArraySetter.bind(null, 'uniform4uiv', toUIntArray, 4, setVectorUniform)), _defineProperty(_UNIFORM_SETTERS, 35685, getArraySetter.bind(null, 'uniformMatrix2x3fv', toFloatArray, 6, setMatrixUniform)), _defineProperty(_UNIFORM_SETTERS, 35686, getArraySetter.bind(null, 'uniformMatrix2x4fv', toFloatArray, 8, setMatrixUniform)), _defineProperty(_UNIFORM_SETTERS, 35687, getArraySetter.bind(null, 'uniformMatrix3x2fv', toFloatArray, 6, setMatrixUniform)), _defineProperty(_UNIFORM_SETTERS, 35688, getArraySetter.bind(null, 'uniformMatrix3x4fv', toFloatArray, 12, setMatrixUniform)), _defineProperty(_UNIFORM_SETTERS, 35689, getArraySetter.bind(null, 'uniformMatrix4x2fv', toFloatArray, 8, setMatrixUniform)), _defineProperty(_UNIFORM_SETTERS, 35690, getArraySetter.bind(null, 'uniformMatrix4x3fv', toFloatArray, 12, setMatrixUniform)), _defineProperty(_UNIFORM_SETTERS, 35679, getSamplerSetter), _defineProperty(_UNIFORM_SETTERS, 35682, getSamplerSetter), _defineProperty(_UNIFORM_SETTERS, 36289, getSamplerSetter), _defineProperty(_UNIFORM_SETTERS, 36292, getSamplerSetter), _defineProperty(_UNIFORM_SETTERS, 36293, getSamplerSetter), _defineProperty(_UNIFORM_SETTERS, 36298, getSamplerSetter), _defineProperty(_UNIFORM_SETTERS, 36299, getSamplerSetter), _defineProperty(_UNIFORM_SETTERS, 36300, getSamplerSetter), _defineProperty(_UNIFORM_SETTERS, 36303, getSamplerSetter), _defineProperty(_UNIFORM_SETTERS, 36306, getSamplerSetter), _defineProperty(_UNIFORM_SETTERS, 36307, getSamplerSetter), _defineProperty(_UNIFORM_SETTERS, 36308, getSamplerSetter), _defineProperty(_UNIFORM_SETTERS, 36311, getSamplerSetter), _UNIFORM_SETTERS);
var FLOAT_ARRAY = {};
var INT_ARRAY = {};
var UINT_ARRAY = {};
var array1 = [0];

function toTypedArray(value, uniformLength, Type, cache) {
  if (uniformLength === 1 && typeof value === 'boolean') {
    value = value ? 1 : 0;
  }

  if (Number.isFinite(value)) {
    array1[0] = value;
    value = array1;
  }

  var length = value.length;

  if (length % uniformLength) {
    log$2.warn("Uniform size should be multiples of ".concat(uniformLength), value)();
  }

  if (value instanceof Type) {
    return value;
  }

  var result = cache[length];

  if (!result) {
    result = new Type(length);
    cache[length] = result;
  }

  for (var i = 0; i < length; i++) {
    result[i] = value[i];
  }

  return result;
}

function toFloatArray(value, uniformLength) {
  return toTypedArray(value, uniformLength, Float32Array, FLOAT_ARRAY);
}

function toIntArray(value, uniformLength) {
  return toTypedArray(value, uniformLength, Int32Array, INT_ARRAY);
}

function toUIntArray(value, uniformLength) {
  return toTypedArray(value, uniformLength, Uint32Array, UINT_ARRAY);
}

function parseUniformName(name) {
  if (name[name.length - 1] !== ']') {
    return {
      name: name,
      length: 1,
      isArray: false
    };
  }

  var UNIFORM_NAME_REGEXP = /([^[]*)(\[[0-9]+\])?/;
  var matches = name.match(UNIFORM_NAME_REGEXP);

  if (!matches || matches.length < 2) {
    throw new Error("Failed to parse GLSL uniform name ".concat(name));
  }

  return {
    name: matches[1],
    length: matches[2] || 1,
    isArray: Boolean(matches[2])
  };
}
function getUniformSetter(gl, location, info) {
  var setter = UNIFORM_SETTERS[info.type];

  if (!setter) {
    throw new Error("Unknown GLSL uniform type ".concat(info.type));
  }

  return setter().bind(null, gl, location);
}
function checkUniformValues(uniforms, source, uniformMap) {
  for (var uniformName in uniforms) {
    var value = uniforms[uniformName];
    var shouldCheck = !uniformMap || Boolean(uniformMap[uniformName]);

    if (shouldCheck && !checkUniformValue(value)) {
      source = source ? "".concat(source, " ") : '';
      console.error("".concat(source, " Bad uniform ").concat(uniformName), value);
      throw new Error("".concat(source, " Bad uniform ").concat(uniformName));
    }
  }

  return true;
}

function checkUniformValue(value) {
  if (Array.isArray(value) || ArrayBuffer.isView(value)) {
    return checkUniformArray(value);
  }

  if (isFinite(value)) {
    return true;
  } else if (value === true || value === false) {
    return true;
  } else if (value instanceof Texture) {
    return true;
  } else if (value instanceof Renderbuffer) {
    return true;
  } else if (value instanceof Framebuffer) {
    return Boolean(value.texture);
  }

  return false;
}

function checkUniformArray(value) {
  if (value.length === 0) {
    return false;
  }

  var checkLength = Math.min(value.length, 16);

  for (var i = 0; i < checkLength; ++i) {
    if (!Number.isFinite(value[i])) {
      return false;
    }
  }

  return true;
}

function copyUniform(uniforms, key, value) {
  if (Array.isArray(value) || ArrayBuffer.isView(value)) {
    if (uniforms[key]) {
      var dest = uniforms[key];

      for (var i = 0, len = value.length; i < len; ++i) {
        dest[i] = value[i];
      }
    } else {
      uniforms[key] = value.slice();
    }
  } else {
    uniforms[key] = value;
  }
}

function getSamplerSetter() {
  var cache = null;
  return function (gl, location, value) {
    var update = cache !== value;

    if (update) {
      gl.uniform1i(location, value);
      cache = value;
    }

    return update;
  };
}

function getArraySetter(functionName, toArray, size, uniformSetter) {
  var cache = null;
  var cacheLength = null;
  return function (gl, location, value) {
    var arrayValue = toArray(value, size);
    var length = arrayValue.length;
    var update = false;

    if (cache === null) {
      cache = new Float32Array(length);
      cacheLength = length;
      update = true;
    } else {
      assert$3(cacheLength === length, 'Uniform length cannot change.');

      for (var i = 0; i < length; ++i) {
        if (arrayValue[i] !== cache[i]) {
          update = true;
          break;
        }
      }
    }

    if (update) {
      uniformSetter(gl, functionName, location, arrayValue);
      cache.set(arrayValue);
    }

    return update;
  };
}

function setVectorUniform(gl, functionName, location, value) {
  gl[functionName](location, value);
}

function setMatrixUniform(gl, functionName, location, value) {
  gl[functionName](location, false, value);
}

var _COMPOSITE_GL_TYPES;
var GL_BYTE = 0x1400;
var GL_UNSIGNED_BYTE = 0x1401;
var GL_SHORT = 0x1402;
var GL_UNSIGNED_SHORT = 0x1403;
var GL_POINTS = 0x0;
var GL_LINES = 0x1;
var GL_LINE_LOOP = 0x2;
var GL_LINE_STRIP = 0x3;
var GL_TRIANGLES = 0x4;
var GL_TRIANGLE_STRIP = 0x5;
var GL_TRIANGLE_FAN = 0x6;
var GL_FLOAT = 0x1406;
var GL_FLOAT_VEC2 = 0x8b50;
var GL_FLOAT_VEC3 = 0x8b51;
var GL_FLOAT_VEC4 = 0x8b52;
var GL_INT = 0x1404;
var GL_INT_VEC2 = 0x8b53;
var GL_INT_VEC3 = 0x8b54;
var GL_INT_VEC4 = 0x8b55;
var GL_UNSIGNED_INT = 0x1405;
var GL_UNSIGNED_INT_VEC2 = 0x8dc6;
var GL_UNSIGNED_INT_VEC3 = 0x8dc7;
var GL_UNSIGNED_INT_VEC4 = 0x8dc8;
var GL_BOOL = 0x8b56;
var GL_BOOL_VEC2 = 0x8b57;
var GL_BOOL_VEC3 = 0x8b58;
var GL_BOOL_VEC4 = 0x8b59;
var GL_FLOAT_MAT2 = 0x8b5a;
var GL_FLOAT_MAT3 = 0x8b5b;
var GL_FLOAT_MAT4 = 0x8b5c;
var GL_FLOAT_MAT2x3 = 0x8b65;
var GL_FLOAT_MAT2x4 = 0x8b66;
var GL_FLOAT_MAT3x2 = 0x8b67;
var GL_FLOAT_MAT3x4 = 0x8b68;
var GL_FLOAT_MAT4x2 = 0x8b69;
var GL_FLOAT_MAT4x3 = 0x8b6a;
var COMPOSITE_GL_TYPES = (_COMPOSITE_GL_TYPES = {}, _defineProperty(_COMPOSITE_GL_TYPES, GL_FLOAT, [GL_FLOAT, 1, 'float']), _defineProperty(_COMPOSITE_GL_TYPES, GL_FLOAT_VEC2, [GL_FLOAT, 2, 'vec2']), _defineProperty(_COMPOSITE_GL_TYPES, GL_FLOAT_VEC3, [GL_FLOAT, 3, 'vec3']), _defineProperty(_COMPOSITE_GL_TYPES, GL_FLOAT_VEC4, [GL_FLOAT, 4, 'vec4']), _defineProperty(_COMPOSITE_GL_TYPES, GL_INT, [GL_INT, 1, 'int']), _defineProperty(_COMPOSITE_GL_TYPES, GL_INT_VEC2, [GL_INT, 2, 'ivec2']), _defineProperty(_COMPOSITE_GL_TYPES, GL_INT_VEC3, [GL_INT, 3, 'ivec3']), _defineProperty(_COMPOSITE_GL_TYPES, GL_INT_VEC4, [GL_INT, 4, 'ivec4']), _defineProperty(_COMPOSITE_GL_TYPES, GL_UNSIGNED_INT, [GL_UNSIGNED_INT, 1, 'uint']), _defineProperty(_COMPOSITE_GL_TYPES, GL_UNSIGNED_INT_VEC2, [GL_UNSIGNED_INT, 2, 'uvec2']), _defineProperty(_COMPOSITE_GL_TYPES, GL_UNSIGNED_INT_VEC3, [GL_UNSIGNED_INT, 3, 'uvec3']), _defineProperty(_COMPOSITE_GL_TYPES, GL_UNSIGNED_INT_VEC4, [GL_UNSIGNED_INT, 4, 'uvec4']), _defineProperty(_COMPOSITE_GL_TYPES, GL_BOOL, [GL_FLOAT, 1, 'bool']), _defineProperty(_COMPOSITE_GL_TYPES, GL_BOOL_VEC2, [GL_FLOAT, 2, 'bvec2']), _defineProperty(_COMPOSITE_GL_TYPES, GL_BOOL_VEC3, [GL_FLOAT, 3, 'bvec3']), _defineProperty(_COMPOSITE_GL_TYPES, GL_BOOL_VEC4, [GL_FLOAT, 4, 'bvec4']), _defineProperty(_COMPOSITE_GL_TYPES, GL_FLOAT_MAT2, [GL_FLOAT, 8, 'mat2']), _defineProperty(_COMPOSITE_GL_TYPES, GL_FLOAT_MAT2x3, [GL_FLOAT, 8, 'mat2x3']), _defineProperty(_COMPOSITE_GL_TYPES, GL_FLOAT_MAT2x4, [GL_FLOAT, 8, 'mat2x4']), _defineProperty(_COMPOSITE_GL_TYPES, GL_FLOAT_MAT3, [GL_FLOAT, 12, 'mat3']), _defineProperty(_COMPOSITE_GL_TYPES, GL_FLOAT_MAT3x2, [GL_FLOAT, 12, 'mat3x2']), _defineProperty(_COMPOSITE_GL_TYPES, GL_FLOAT_MAT3x4, [GL_FLOAT, 12, 'mat3x4']), _defineProperty(_COMPOSITE_GL_TYPES, GL_FLOAT_MAT4, [GL_FLOAT, 16, 'mat4']), _defineProperty(_COMPOSITE_GL_TYPES, GL_FLOAT_MAT4x2, [GL_FLOAT, 16, 'mat4x2']), _defineProperty(_COMPOSITE_GL_TYPES, GL_FLOAT_MAT4x3, [GL_FLOAT, 16, 'mat4x3']), _COMPOSITE_GL_TYPES);
function getPrimitiveDrawMode(drawMode) {
  switch (drawMode) {
    case GL_POINTS:
      return GL_POINTS;

    case GL_LINES:
      return GL_LINES;

    case GL_LINE_STRIP:
      return GL_LINES;

    case GL_LINE_LOOP:
      return GL_LINES;

    case GL_TRIANGLES:
      return GL_TRIANGLES;

    case GL_TRIANGLE_STRIP:
      return GL_TRIANGLES;

    case GL_TRIANGLE_FAN:
      return GL_TRIANGLES;

    default:
      assert$3(false);
      return 0;
  }
}
function decomposeCompositeGLType(compositeGLType) {
  var typeAndSize = COMPOSITE_GL_TYPES[compositeGLType];

  if (!typeAndSize) {
    return null;
  }

  var _typeAndSize = _slicedToArray(typeAndSize, 2),
      type = _typeAndSize[0],
      components = _typeAndSize[1];

  return {
    type: type,
    components: components
  };
}
function getCompositeGLType(type, components) {
  switch (type) {
    case GL_BYTE:
    case GL_UNSIGNED_BYTE:
    case GL_SHORT:
    case GL_UNSIGNED_SHORT:
      type = GL_FLOAT;
      break;
  }

  for (var glType in COMPOSITE_GL_TYPES) {
    var _COMPOSITE_GL_TYPES$g = _slicedToArray(COMPOSITE_GL_TYPES[glType], 3),
        compType = _COMPOSITE_GL_TYPES$g[0],
        compComponents = _COMPOSITE_GL_TYPES$g[1],
        name = _COMPOSITE_GL_TYPES$g[2];

    if (compType === type && compComponents === components) {
      return {
        glType: glType,
        name: name
      };
    }
  }

  return null;
}

var ProgramConfiguration = function () {
  function ProgramConfiguration(program) {
    _classCallCheck(this, ProgramConfiguration);

    this.id = program.id;
    this.attributeInfos = [];
    this.attributeInfosByName = {};
    this.attributeInfosByLocation = [];
    this.varyingInfos = [];
    this.varyingInfosByName = {};
    Object.seal(this);

    this._readAttributesFromProgram(program);

    this._readVaryingsFromProgram(program);
  }

  _createClass(ProgramConfiguration, [{
    key: "getAttributeInfo",
    value: function getAttributeInfo(locationOrName) {
      var location = Number(locationOrName);

      if (Number.isFinite(location)) {
        return this.attributeInfosByLocation[location];
      }

      return this.attributeInfosByName[locationOrName] || null;
    }
  }, {
    key: "getAttributeLocation",
    value: function getAttributeLocation(locationOrName) {
      var attributeInfo = this.getAttributeInfo(locationOrName);
      return attributeInfo ? attributeInfo.location : -1;
    }
  }, {
    key: "getAttributeAccessor",
    value: function getAttributeAccessor(locationOrName) {
      var attributeInfo = this.getAttributeInfo(locationOrName);
      return attributeInfo ? attributeInfo.accessor : null;
    }
  }, {
    key: "getVaryingInfo",
    value: function getVaryingInfo(locationOrName) {
      var location = Number(locationOrName);

      if (Number.isFinite(location)) {
        return this.varyingInfos[location];
      }

      return this.varyingInfosByName[locationOrName] || null;
    }
  }, {
    key: "getVaryingIndex",
    value: function getVaryingIndex(locationOrName) {
      var varying = this.getVaryingInfo();
      return varying ? varying.location : -1;
    }
  }, {
    key: "getVaryingAccessor",
    value: function getVaryingAccessor(locationOrName) {
      var varying = this.getVaryingInfo();
      return varying ? varying.accessor : null;
    }
  }, {
    key: "_readAttributesFromProgram",
    value: function _readAttributesFromProgram(program) {
      var gl = program.gl;
      var count = gl.getProgramParameter(program.handle, 35721);

      for (var index = 0; index < count; index++) {
        var _gl$getActiveAttrib = gl.getActiveAttrib(program.handle, index),
            name = _gl$getActiveAttrib.name,
            type = _gl$getActiveAttrib.type,
            size = _gl$getActiveAttrib.size;

        var location = gl.getAttribLocation(program.handle, name);

        if (location >= 0) {
          this._addAttribute(location, name, type, size);
        }
      }

      this.attributeInfos.sort(function (a, b) {
        return a.location - b.location;
      });
    }
  }, {
    key: "_readVaryingsFromProgram",
    value: function _readVaryingsFromProgram(program) {
      var gl = program.gl;

      if (!isWebGL2(gl)) {
        return;
      }

      var count = gl.getProgramParameter(program.handle, 35971);

      for (var location = 0; location < count; location++) {
        var _gl$getTransformFeedb = gl.getTransformFeedbackVarying(program.handle, location),
            name = _gl$getTransformFeedb.name,
            type = _gl$getTransformFeedb.type,
            size = _gl$getTransformFeedb.size;

        this._addVarying(location, name, type, size);
      }

      this.varyingInfos.sort(function (a, b) {
        return a.location - b.location;
      });
    }
  }, {
    key: "_addAttribute",
    value: function _addAttribute(location, name, compositeType, size) {
      var _decomposeCompositeGL = decomposeCompositeGLType(compositeType),
          type = _decomposeCompositeGL.type,
          components = _decomposeCompositeGL.components;

      var accessor = {
        type: type,
        size: size * components
      };

      this._inferProperties(location, name, accessor);

      var attributeInfo = {
        location: location,
        name: name,
        accessor: new Accessor(accessor)
      };
      this.attributeInfos.push(attributeInfo);
      this.attributeInfosByLocation[location] = attributeInfo;
      this.attributeInfosByName[attributeInfo.name] = attributeInfo;
    }
  }, {
    key: "_inferProperties",
    value: function _inferProperties(location, name, accessor) {
      if (/instance/i.test(name)) {
        accessor.divisor = 1;
      }
    }
  }, {
    key: "_addVarying",
    value: function _addVarying(location, name, compositeType, size) {
      var _decomposeCompositeGL2 = decomposeCompositeGLType(compositeType),
          type = _decomposeCompositeGL2.type,
          components = _decomposeCompositeGL2.components;

      var accessor = new Accessor({
        type: type,
        size: size * components
      });
      var varying = {
        location: location,
        name: name,
        accessor: accessor
      };
      this.varyingInfos.push(varying);
      this.varyingInfosByName[varying.name] = varying;
    }
  }]);

  return ProgramConfiguration;
}();

var LOG_PROGRAM_PERF_PRIORITY = 4;
var GL_SEPARATE_ATTRIBS = 0x8c8d;
var V6_DEPRECATED_METHODS = ['setVertexArray', 'setAttributes', 'setBuffers', 'unsetBuffers', 'use', 'getUniformCount', 'getUniformInfo', 'getUniformLocation', 'getUniformValue', 'getVarying', 'getFragDataLocation', 'getAttachedShaders', 'getAttributeCount', 'getAttributeLocation', 'getAttributeInfo'];

var Program = function (_Resource) {
  _inherits(Program, _Resource);

  function Program(gl) {
    var _this;

    var props = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    _classCallCheck(this, Program);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(Program).call(this, gl, props));

    _this.stubRemovedMethods('Program', 'v6.0', V6_DEPRECATED_METHODS);

    _this._isCached = false;

    _this.initialize(props);

    Object.seal(_assertThisInitialized(_this));

    _this._setId(props.id);

    return _this;
  }

  _createClass(Program, [{
    key: "initialize",
    value: function initialize() {
      var props = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var hash = props.hash,
          vs = props.vs,
          fs = props.fs,
          varyings = props.varyings,
          _props$bufferMode = props.bufferMode,
          bufferMode = _props$bufferMode === void 0 ? GL_SEPARATE_ATTRIBS : _props$bufferMode;
      this.hash = hash || '';
      this.vs = typeof vs === 'string' ? new VertexShader(this.gl, {
        id: "".concat(props.id, "-vs"),
        source: vs
      }) : vs;
      this.fs = typeof fs === 'string' ? new FragmentShader(this.gl, {
        id: "".concat(props.id, "-fs"),
        source: fs
      }) : fs;
      assert$3(this.vs instanceof VertexShader);
      assert$3(this.fs instanceof FragmentShader);
      this.uniforms = {};
      this._textureUniforms = {};
      this._texturesRenderable = true;

      if (varyings && varyings.length > 0) {
        assertWebGL2Context(this.gl);
        this.varyings = varyings;
        this.gl.transformFeedbackVaryings(this.handle, varyings, bufferMode);
      }

      this._compileAndLink();

      this._readUniformLocationsFromLinkedProgram();

      this.configuration = new ProgramConfiguration(this);
      return this.setProps(props);
    }
  }, {
    key: "delete",
    value: function _delete() {
      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      if (this._isCached) {
        return this;
      }

      return _get(_getPrototypeOf(Program.prototype), "delete", this).call(this, options);
    }
  }, {
    key: "setProps",
    value: function setProps(props) {
      if ('uniforms' in props) {
        this.setUniforms(props.uniforms);
      }

      return this;
    }
  }, {
    key: "draw",
    value: function draw(_ref) {
      var _this2 = this;

      var logPriority = _ref.logPriority,
          _ref$drawMode = _ref.drawMode,
          drawMode = _ref$drawMode === void 0 ? 4 : _ref$drawMode,
          vertexCount = _ref.vertexCount,
          _ref$offset = _ref.offset,
          offset = _ref$offset === void 0 ? 0 : _ref$offset,
          start = _ref.start,
          end = _ref.end,
          _ref$isIndexed = _ref.isIndexed,
          isIndexed = _ref$isIndexed === void 0 ? false : _ref$isIndexed,
          _ref$indexType = _ref.indexType,
          indexType = _ref$indexType === void 0 ? 5123 : _ref$indexType,
          _ref$instanceCount = _ref.instanceCount,
          instanceCount = _ref$instanceCount === void 0 ? 0 : _ref$instanceCount,
          _ref$isInstanced = _ref.isInstanced,
          isInstanced = _ref$isInstanced === void 0 ? instanceCount > 0 : _ref$isInstanced,
          _ref$vertexArray = _ref.vertexArray,
          vertexArray = _ref$vertexArray === void 0 ? null : _ref$vertexArray,
          transformFeedback = _ref.transformFeedback,
          framebuffer = _ref.framebuffer,
          _ref$parameters = _ref.parameters,
          parameters = _ref$parameters === void 0 ? {} : _ref$parameters,
          uniforms = _ref.uniforms,
          samplers = _ref.samplers;

      if (uniforms || samplers) {
        log$2.deprecated('Program.draw({uniforms})', 'Program.setUniforms(uniforms)')();
        this.setUniforms(uniforms || {});
      }

      if (log$2.priority >= logPriority) {
        var fb = framebuffer ? framebuffer.id : 'default';
        var message = "mode=".concat(getKey(this.gl, drawMode), " verts=").concat(vertexCount, " ") + "instances=".concat(instanceCount, " indexType=").concat(getKey(this.gl, indexType), " ") + "isInstanced=".concat(isInstanced, " isIndexed=").concat(isIndexed, " ") + "Framebuffer=".concat(fb);
        log$2.log(logPriority, message)();
      }

      assert$3(vertexArray);
      this.gl.useProgram(this.handle);

      if (!this._areTexturesRenderable() || vertexCount === 0 || isInstanced && instanceCount === 0) {
        return false;
      }

      vertexArray.bindForDraw(vertexCount, instanceCount, function () {
        if (framebuffer !== undefined) {
          parameters = Object.assign({}, parameters, {
            framebuffer: framebuffer
          });
        }

        if (transformFeedback) {
          var primitiveMode = getPrimitiveDrawMode(drawMode);
          transformFeedback.begin(primitiveMode);
        }

        _this2._bindTextures();

        withParameters(_this2.gl, parameters, function () {
          if (isIndexed && isInstanced) {
            _this2.gl.drawElementsInstanced(drawMode, vertexCount, indexType, offset, instanceCount);
          } else if (isIndexed && isWebGL2(_this2.gl) && !isNaN(start) && !isNaN(end)) {
            _this2.gl.drawRangeElements(drawMode, start, end, vertexCount, indexType, offset);
          } else if (isIndexed) {
            _this2.gl.drawElements(drawMode, vertexCount, indexType, offset);
          } else if (isInstanced) {
            _this2.gl.drawArraysInstanced(drawMode, offset, vertexCount, instanceCount);
          } else {
            _this2.gl.drawArrays(drawMode, offset, vertexCount);
          }
        });

        if (transformFeedback) {
          transformFeedback.end();
        }
      });
      return true;
    }
  }, {
    key: "setUniforms",
    value: function setUniforms() {
      var uniforms = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      if (log$2.priority >= 2) {
        checkUniformValues(uniforms, this.id, this._uniformSetters);
      }

      this.gl.useProgram(this.handle);

      for (var uniformName in uniforms) {
        var uniform = uniforms[uniformName];
        var uniformSetter = this._uniformSetters[uniformName];

        if (uniformSetter) {
          var value = uniform;
          var textureUpdate = false;

          if (value instanceof Framebuffer) {
            value = value.texture;
          }

          if (value instanceof Texture) {
            textureUpdate = this.uniforms[uniformName] !== uniform;

            if (textureUpdate) {
              if (uniformSetter.textureIndex === undefined) {
                uniformSetter.textureIndex = this._textureIndexCounter++;
              }

              var texture = value;
              var textureIndex = uniformSetter.textureIndex;
              texture.bind(textureIndex);
              value = textureIndex;

              if (!texture.loaded) {
                this._texturesRenderable = false;
              }

              this._textureUniforms[uniformName] = texture;
            } else {
              value = uniformSetter.textureIndex;
            }
          } else if (this._textureUniforms[uniformName]) {
            delete this._textureUniforms[uniformName];
          }

          if (uniformSetter(value) || textureUpdate) {
            copyUniform(this.uniforms, uniformName, uniform);
          }
        }
      }

      return this;
    }
  }, {
    key: "_areTexturesRenderable",
    value: function _areTexturesRenderable() {
      if (this._texturesRenderable) {
        return true;
      }

      this._texturesRenderable = true;

      for (var uniformName in this._textureUniforms) {
        var texture = this._textureUniforms[uniformName];
        this._texturesRenderable = this._texturesRenderable && texture.loaded;
      }

      return this._texturesRenderable;
    }
  }, {
    key: "_bindTextures",
    value: function _bindTextures() {
      for (var uniformName in this._textureUniforms) {
        var textureIndex = this._uniformSetters[uniformName].textureIndex;

        this._textureUniforms[uniformName].bind(textureIndex);
      }
    }
  }, {
    key: "_createHandle",
    value: function _createHandle() {
      return this.gl.createProgram();
    }
  }, {
    key: "_deleteHandle",
    value: function _deleteHandle() {
      this.gl.deleteProgram(this.handle);
    }
  }, {
    key: "_getOptionsFromHandle",
    value: function _getOptionsFromHandle(handle) {
      var shaderHandles = this.gl.getAttachedShaders(handle);
      var opts = {};
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = shaderHandles[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var shaderHandle = _step.value;
          var type = this.gl.getShaderParameter(this.handle, 35663);

          switch (type) {
            case 35633:
              opts.vs = new VertexShader({
                handle: shaderHandle
              });
              break;

            case 35632:
              opts.fs = new FragmentShader({
                handle: shaderHandle
              });
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

      return opts;
    }
  }, {
    key: "_getParameter",
    value: function _getParameter(pname) {
      return this.gl.getProgramParameter(this.handle, pname);
    }
  }, {
    key: "_setId",
    value: function _setId(id) {
      if (!id) {
        var programName = this._getName();

        this.id = uid(programName);
      }
    }
  }, {
    key: "_getName",
    value: function _getName() {
      var programName = this.vs.getName() || this.fs.getName();
      programName = programName.replace(/shader/i, '');
      programName = programName ? "".concat(programName, "-program") : 'program';
      return programName;
    }
  }, {
    key: "_compileAndLink",
    value: function _compileAndLink() {
      var gl = this.gl;
      gl.attachShader(this.handle, this.vs.handle);
      gl.attachShader(this.handle, this.fs.handle);
      log$2.time(LOG_PROGRAM_PERF_PRIORITY, "linkProgram for ".concat(this._getName()))();
      gl.linkProgram(this.handle);
      log$2.timeEnd(LOG_PROGRAM_PERF_PRIORITY, "linkProgram for ".concat(this._getName()))();

      if (gl.debug || log$2.level > 0) {
        var linked = gl.getProgramParameter(this.handle, 35714);

        if (!linked) {
          throw new Error("Error linking: ".concat(gl.getProgramInfoLog(this.handle)));
        }

        gl.validateProgram(this.handle);
        var validated = gl.getProgramParameter(this.handle, 35715);

        if (!validated) {
          throw new Error("Error validating: ".concat(gl.getProgramInfoLog(this.handle)));
        }
      }
    }
  }, {
    key: "_readUniformLocationsFromLinkedProgram",
    value: function _readUniformLocationsFromLinkedProgram() {
      var gl = this.gl;
      this._uniformSetters = {};
      this._uniformCount = this._getParameter(35718);

      for (var i = 0; i < this._uniformCount; i++) {
        var info = this.gl.getActiveUniform(this.handle, i);

        var _parseUniformName = parseUniformName(info.name),
            name = _parseUniformName.name,
            isArray = _parseUniformName.isArray;

        var location = gl.getUniformLocation(this.handle, name);
        this._uniformSetters[name] = getUniformSetter(gl, location, info);

        if (info.size > 1) {
          for (var l = 0; l < info.size; l++) {
            location = gl.getUniformLocation(this.handle, "".concat(name, "[").concat(l, "]"));
            this._uniformSetters["".concat(name, "[").concat(l, "]")] = getUniformSetter(gl, location, info);
          }
        }
      }

      this._textureIndexCounter = 0;
    }
  }, {
    key: "getActiveUniforms",
    value: function getActiveUniforms(uniformIndices, pname) {
      return this.gl.getActiveUniforms(this.handle, uniformIndices, pname);
    }
  }, {
    key: "getUniformBlockIndex",
    value: function getUniformBlockIndex(blockName) {
      return this.gl.getUniformBlockIndex(this.handle, blockName);
    }
  }, {
    key: "getActiveUniformBlockParameter",
    value: function getActiveUniformBlockParameter(blockIndex, pname) {
      return this.gl.getActiveUniformBlockParameter(this.handle, blockIndex, pname);
    }
  }, {
    key: "uniformBlockBinding",
    value: function uniformBlockBinding(blockIndex, blockBinding) {
      this.gl.uniformBlockBinding(this.handle, blockIndex, blockBinding);
    }
  }]);

  return Program;
}(Resource);

var TransformFeedback = function (_Resource) {
  _inherits(TransformFeedback, _Resource);

  _createClass(TransformFeedback, null, [{
    key: "isSupported",
    value: function isSupported(gl) {
      return isWebGL2(gl);
    }
  }]);

  function TransformFeedback(gl) {
    var _this;

    var props = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    _classCallCheck(this, TransformFeedback);

    assertWebGL2Context(gl);
    _this = _possibleConstructorReturn(this, _getPrototypeOf(TransformFeedback).call(this, gl, props));

    _this.initialize(props);

    _this.stubRemovedMethods('TransformFeedback', 'v6.0', ['pause', 'resume']);

    Object.seal(_assertThisInitialized(_this));
    return _this;
  }

  _createClass(TransformFeedback, [{
    key: "initialize",
    value: function initialize() {
      var _this2 = this;

      var props = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      this.buffers = {};
      this.unused = {};
      this.configuration = null;
      this.bindOnUse = true;

      if (!isObjectEmpty$1(this.buffers)) {
        this.bind(function () {
          return _this2._unbindBuffers();
        });
      }

      this.setProps(props);
      return this;
    }
  }, {
    key: "setProps",
    value: function setProps(props) {
      if ('program' in props) {
        this.configuration = props.program && props.program.configuration;
      }

      if ('configuration' in props) {
        this.configuration = props.configuration;
      }

      if ('bindOnUse' in props) {
        props = props.bindOnUse;
      }

      if ('buffers' in props) {
        this.setBuffers(props.buffers);
      }
    }
  }, {
    key: "setBuffers",
    value: function setBuffers() {
      var _this3 = this;

      var buffers = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      this.bind(function () {
        for (var bufferName in buffers) {
          _this3.setBuffer(bufferName, buffers[bufferName]);
        }
      });
      return this;
    }
  }, {
    key: "setBuffer",
    value: function setBuffer(locationOrName, bufferOrParams) {
      var _this4 = this;

      var location = this._getVaryingIndex(locationOrName);

      var _this$_getBufferParam = this._getBufferParams(bufferOrParams),
          buffer = _this$_getBufferParam.buffer,
          byteSize = _this$_getBufferParam.byteSize,
          byteOffset = _this$_getBufferParam.byteOffset;

      if (location < 0) {
        this.unused[locationOrName] = buffer;
        log$2.warn(function () {
          return "".concat(_this4.id, " unused varying buffer ").concat(locationOrName);
        })();
        return this;
      }

      this.buffers[location] = bufferOrParams;

      if (!this.bindOnUse) {
        this._bindBuffer(location, buffer, byteOffset, byteSize);
      }

      return this;
    }
  }, {
    key: "begin",
    value: function begin() {
      var primitiveMode = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
      this.gl.bindTransformFeedback(36386, this.handle);

      this._bindBuffers();

      this.gl.beginTransformFeedback(primitiveMode);
      return this;
    }
  }, {
    key: "end",
    value: function end() {
      this.gl.endTransformFeedback();

      this._unbindBuffers();

      this.gl.bindTransformFeedback(36386, null);
      return this;
    }
  }, {
    key: "_getBufferParams",
    value: function _getBufferParams(bufferOrParams) {
      var byteOffset;
      var byteSize;
      var buffer;

      if (bufferOrParams instanceof Buffer === false) {
        buffer = bufferOrParams.buffer;
        byteSize = bufferOrParams.byteSize;
        byteOffset = bufferOrParams.byteOffset;
      } else {
        buffer = bufferOrParams;
      }

      if (byteOffset !== undefined || byteSize !== undefined) {
        byteOffset = byteOffset || 0;
        byteSize = byteSize || buffer.byteLength - byteOffset;
      }

      return {
        buffer: buffer,
        byteOffset: byteOffset,
        byteSize: byteSize
      };
    }
  }, {
    key: "_getVaryingInfo",
    value: function _getVaryingInfo(locationOrName) {
      return this.configuration && this.configuration.getVaryingInfo(locationOrName);
    }
  }, {
    key: "_getVaryingIndex",
    value: function _getVaryingIndex(locationOrName) {
      if (this.configuration) {
        return this.configuration.getVaryingInfo(locationOrName).location;
      }

      var location = Number(locationOrName);
      return Number.isFinite(location) ? location : -1;
    }
  }, {
    key: "_bindBuffers",
    value: function _bindBuffers() {
      if (this.bindOnUse) {
        for (var bufferIndex in this.buffers) {
          var _this$_getBufferParam2 = this._getBufferParams(this.buffers[bufferIndex]),
              buffer = _this$_getBufferParam2.buffer,
              byteSize = _this$_getBufferParam2.byteSize,
              byteOffset = _this$_getBufferParam2.byteOffset;

          this._bindBuffer(bufferIndex, buffer, byteOffset, byteSize);
        }
      }
    }
  }, {
    key: "_unbindBuffers",
    value: function _unbindBuffers() {
      if (this.bindOnUse) {
        for (var bufferIndex in this.buffers) {
          this._bindBuffer(bufferIndex, null);
        }
      }
    }
  }, {
    key: "_bindBuffer",
    value: function _bindBuffer(index, buffer) {
      var byteOffset = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
      var byteSize = arguments.length > 3 ? arguments[3] : undefined;
      var handle = buffer && buffer.handle;

      if (!handle || byteSize === undefined) {
        this.gl.bindBufferBase(35982, index, handle);
      } else {
        this.gl.bindBufferRange(35982, index, handle, byteOffset, byteSize);
      }

      return this;
    }
  }, {
    key: "_createHandle",
    value: function _createHandle() {
      return this.gl.createTransformFeedback();
    }
  }, {
    key: "_deleteHandle",
    value: function _deleteHandle() {
      this.gl.deleteTransformFeedback(this.handle);
    }
  }, {
    key: "_bindHandle",
    value: function _bindHandle(handle) {
      this.gl.bindTransformFeedback(36386, this.handle);
    }
  }]);

  return TransformFeedback;
}(Resource);

var arrayBuffer = null;
function getScratchArrayBuffer(byteLength) {
  if (!arrayBuffer || arrayBuffer.byteLength < byteLength) {
    arrayBuffer = new ArrayBuffer(byteLength);
  }

  return arrayBuffer;
}
function getScratchArray(Type, length) {
  var scratchArrayBuffer = getScratchArrayBuffer(Type.BYTES_PER_ELEMENT * length);
  return new Type(scratchArrayBuffer, 0, length);
}
function fillArray(_ref) {
  var target = _ref.target,
      source = _ref.source,
      _ref$start = _ref.start,
      start = _ref$start === void 0 ? 0 : _ref$start,
      _ref$count = _ref.count,
      count = _ref$count === void 0 ? 1 : _ref$count;
  var length = source.length;
  var total = count * length;
  var copied = 0;

  for (var i = start; copied < length; copied++) {
    target[i++] = source[copied];
  }

  while (copied < total) {
    if (copied < total - copied) {
      target.copyWithin(start + copied, start, start + copied);
      copied *= 2;
    } else {
      target.copyWithin(start + copied, start, start + total - copied);
      copied = total;
    }
  }

  return target;
}

var ERR_ELEMENTS = 'elements must be GL.ELEMENT_ARRAY_BUFFER';

var VertexArrayObject = function (_Resource) {
  _inherits(VertexArrayObject, _Resource);

  _createClass(VertexArrayObject, null, [{
    key: "isSupported",
    value: function isSupported(gl) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      if (options.constantAttributeZero) {
        return isWebGL2(gl) || getBrowser() === 'Chrome';
      }

      return true;
    }
  }, {
    key: "getDefaultArray",
    value: function getDefaultArray(gl) {
      gl.luma = gl.luma || {};

      if (!gl.luma.defaultVertexArray) {
        gl.luma.defaultVertexArray = new VertexArrayObject(gl, {
          handle: null,
          isDefaultArray: true
        });
      }

      return gl.luma.defaultVertexArray;
    }
  }, {
    key: "getMaxAttributes",
    value: function getMaxAttributes(gl) {
      VertexArrayObject.MAX_ATTRIBUTES = VertexArrayObject.MAX_ATTRIBUTES || gl.getParameter(34921);
      return VertexArrayObject.MAX_ATTRIBUTES;
    }
  }, {
    key: "setConstant",
    value: function setConstant(gl, location, array) {
      switch (array.constructor) {
        case Float32Array:
          VertexArrayObject._setConstantFloatArray(gl, location, array);

          break;

        case Int32Array:
          VertexArrayObject._setConstantIntArray(gl, location, array);

          break;

        case Uint32Array:
          VertexArrayObject._setConstantUintArray(gl, location, array);

          break;

        default:
          assert$3(false);
      }
    }
  }]);

  function VertexArrayObject(gl) {
    var _this;

    var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    _classCallCheck(this, VertexArrayObject);

    var id = opts.id || opts.program && opts.program.id;
    _this = _possibleConstructorReturn(this, _getPrototypeOf(VertexArrayObject).call(this, gl, Object.assign({}, opts, {
      id: id
    })));
    _this.buffer = null;
    _this.bufferValue = null;
    _this.isDefaultArray = opts.isDefaultArray || false;

    _this.initialize(opts);

    Object.seal(_assertThisInitialized(_this));
    return _this;
  }

  _createClass(VertexArrayObject, [{
    key: "delete",
    value: function _delete() {
      _get(_getPrototypeOf(VertexArrayObject.prototype), "delete", this).call(this);

      if (this.buffer) {
        this.buffer["delete"]();
      }
    }
  }, {
    key: "initialize",
    value: function initialize() {
      var props = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      return this.setProps(props);
    }
  }, {
    key: "setProps",
    value: function setProps(props) {
      return this;
    }
  }, {
    key: "setElementBuffer",
    value: function setElementBuffer() {
      var _this2 = this;

      var elementBuffer = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
      assert$3(!elementBuffer || elementBuffer.target === 34963, ERR_ELEMENTS);
      this.bind(function () {
        _this2.gl.bindBuffer(34963, elementBuffer ? elementBuffer.handle : null);
      });
      return this;
    }
  }, {
    key: "setBuffer",
    value: function setBuffer(location, buffer, accessor) {
      if (buffer.target === 34963) {
        return this.setElementBuffer(buffer, accessor);
      }

      var size = accessor.size,
          type = accessor.type,
          stride = accessor.stride,
          offset = accessor.offset,
          normalized = accessor.normalized,
          integer = accessor.integer,
          divisor = accessor.divisor;
      var gl = this.gl;
      location = Number(location);
      this.bind(function () {
        gl.bindBuffer(34962, buffer.handle);

        if (integer) {
          assert$3(isWebGL2(gl));
          gl.vertexAttribIPointer(location, size, type, stride, offset);
        } else {
          gl.vertexAttribPointer(location, size, type, normalized, stride, offset);
        }

        gl.enableVertexAttribArray(location);
        gl.vertexAttribDivisor(location, divisor || 0);
      });
      return this;
    }
  }, {
    key: "enable",
    value: function enable(location) {
      var _this3 = this;

      var _enable = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

      var disablingAttributeZero = !_enable && location === 0 && !VertexArrayObject.isSupported(this.gl, {
        constantAttributeZero: true
      });

      if (!disablingAttributeZero) {
        location = Number(location);
        this.bind(function () {
          return _enable ? _this3.gl.enableVertexAttribArray(location) : _this3.gl.disableVertexAttribArray(location);
        });
      }

      return this;
    }
  }, {
    key: "getConstantBuffer",
    value: function getConstantBuffer(elementCount, value, accessor) {
      var constantValue = this._normalizeConstantArrayValue(value, accessor);

      var byteLength = constantValue.byteLength * elementCount;
      var length = constantValue.length * elementCount;
      var updateNeeded = !this.buffer;
      this.buffer = this.buffer || new Buffer(this.gl, byteLength);
      updateNeeded = updateNeeded || this.buffer.reallocate(byteLength);
      updateNeeded = updateNeeded || !this._compareConstantArrayValues(constantValue, this.bufferValue);

      if (updateNeeded) {
        var typedArray = getScratchArray(value.constructor, length);
        fillArray({
          target: typedArray,
          source: constantValue,
          start: 0,
          count: length
        });
        this.buffer.subData(typedArray);
        this.bufferValue = value;
      }

      return this.buffer;
    }
  }, {
    key: "_normalizeConstantArrayValue",
    value: function _normalizeConstantArrayValue(arrayValue, accessor) {
      if (Array.isArray(arrayValue)) {
        return new Float32Array(arrayValue);
      }

      return arrayValue;
    }
  }, {
    key: "_compareConstantArrayValues",
    value: function _compareConstantArrayValues(v1, v2) {
      if (!v1 || !v2 || v1.length !== v2.length || v1.constructor !== v2.constructor) {
        return false;
      }

      for (var i = 0; i < v1.length; ++i) {
        if (v1[i] !== v2[i]) {
          return false;
        }
      }

      return true;
    }
  }, {
    key: "_createHandle",
    value: function _createHandle() {
      return this.gl.createVertexArray();
    }
  }, {
    key: "_deleteHandle",
    value: function _deleteHandle(handle) {
      this.gl.deleteVertexArray(handle);
      return [this.elements];
    }
  }, {
    key: "_bindHandle",
    value: function _bindHandle(handle) {
      this.gl.bindVertexArray(handle);
    }
  }, {
    key: "_getParameter",
    value: function _getParameter(pname, _ref) {
      var _this4 = this;

      var location = _ref.location;
      assert$3(Number.isFinite(location));
      return this.bind(function () {
        switch (pname) {
          case 34373:
            return _this4.gl.getVertexAttribOffset(location, pname);

          default:
            return _this4.gl.getVertexAttrib(location, pname);
        }
      });
    }
  }, {
    key: "MAX_ATTRIBUTES",
    get: function get() {
      return VertexArrayObject.getMaxAttributes(this.gl);
    }
  }], [{
    key: "_setConstantFloatArray",
    value: function _setConstantFloatArray(gl, location, array) {
      switch (array.length) {
        case 1:
          gl.vertexAttrib1fv(location, array);
          break;

        case 2:
          gl.vertexAttrib2fv(location, array);
          break;

        case 3:
          gl.vertexAttrib3fv(location, array);
          break;

        case 4:
          gl.vertexAttrib4fv(location, array);
          break;

        default:
          assert$3(false);
      }
    }
  }, {
    key: "_setConstantIntArray",
    value: function _setConstantIntArray(gl, location, array) {
      assert$3(isWebGL2(gl));

      switch (array.length) {
        case 1:
          gl.vertexAttribI1iv(location, array);
          break;

        case 2:
          gl.vertexAttribI2iv(location, array);
          break;

        case 3:
          gl.vertexAttribI3iv(location, array);
          break;

        case 4:
          gl.vertexAttribI4iv(location, array);
          break;

        default:
          assert$3(false);
      }
    }
  }, {
    key: "_setConstantUintArray",
    value: function _setConstantUintArray(gl, location, array) {
      assert$3(isWebGL2(gl));

      switch (array.length) {
        case 1:
          gl.vertexAttribI1uiv(location, array);
          break;

        case 2:
          gl.vertexAttribI2uiv(location, array);
          break;

        case 3:
          gl.vertexAttribI3uiv(location, array);
          break;

        case 4:
          gl.vertexAttribI4uiv(location, array);
          break;

        default:
          assert$3(false);
      }
    }
  }]);

  return VertexArrayObject;
}(Resource);

var ERR_ATTRIBUTE_TYPE = 'VertexArray: attributes must be Buffers or constants (i.e. typed array)';
var MULTI_LOCATION_ATTRIBUTE_REGEXP = /^(.+)__LOCATION_([0-9]+)$/;
var DEPRECATIONS_V6 = ['setBuffers', 'setGeneric', 'clearBindings', 'setLocations', 'setGenericValues', 'setDivisor', 'enable', 'disable'];

var VertexArray = function () {
  function VertexArray(gl) {
    var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    _classCallCheck(this, VertexArray);

    var id = opts.id || opts.program && opts.program.id;
    this.id = id;
    this.gl = gl;
    this.configuration = null;
    this.elements = null;
    this.elementsAccessor = null;
    this.values = null;
    this.accessors = null;
    this.unused = null;
    this.drawParams = null;
    this.buffer = null;
    this.attributes = {};
    this.vertexArrayObject = new VertexArrayObject(gl);
    stubRemovedMethods(this, 'VertexArray', 'v6.0', DEPRECATIONS_V6);
    this.initialize(opts);
    Object.seal(this);
  }

  _createClass(VertexArray, [{
    key: "delete",
    value: function _delete() {
      if (this.buffer) {
        this.buffer["delete"]();
      }

      this.vertexArrayObject["delete"]();
    }
  }, {
    key: "initialize",
    value: function initialize() {
      var props = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      this.reset();
      this.configuration = null;
      this.bindOnUse = false;
      return this.setProps(props);
    }
  }, {
    key: "reset",
    value: function reset() {
      this.elements = null;
      this.elementsAccessor = null;
      var MAX_ATTRIBUTES = this.vertexArrayObject.MAX_ATTRIBUTES;
      this.values = new Array(MAX_ATTRIBUTES).fill(null);
      this.accessors = new Array(MAX_ATTRIBUTES).fill(null);
      this.unused = {};
      this.drawParams = null;
      return this;
    }
  }, {
    key: "setProps",
    value: function setProps(props) {
      if ('program' in props) {
        this.configuration = props.program && props.program.configuration;
      }

      if ('configuration' in props) {
        this.configuration = props.configuration;
      }

      if ('attributes' in props) {
        this.setAttributes(props.attributes);
      }

      if ('elements' in props) {
        this.setElementBuffer(props.elements);
      }

      if ('bindOnUse' in props) {
        props = props.bindOnUse;
      }

      return this;
    }
  }, {
    key: "clearDrawParams",
    value: function clearDrawParams() {
      this.drawParams = null;
    }
  }, {
    key: "getDrawParams",
    value: function getDrawParams() {
      this.drawParams = this.drawParams || this._updateDrawParams();
      return this.drawParams;
    }
  }, {
    key: "setAttributes",
    value: function setAttributes(attributes) {
      var _this = this;

      Object.assign(this.attributes, attributes);
      this.vertexArrayObject.bind(function () {
        for (var locationOrName in attributes) {
          var value = attributes[locationOrName];

          _this._setAttribute(locationOrName, value);
        }

        _this.gl.bindBuffer(34962, null);
      });
      return this;
    }
  }, {
    key: "setElementBuffer",
    value: function setElementBuffer() {
      var elementBuffer = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
      var accessor = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      this.elements = elementBuffer;
      this.elementsAccessor = accessor;
      this.clearDrawParams();
      this.vertexArrayObject.setElementBuffer(elementBuffer, accessor);
      return this;
    }
  }, {
    key: "setBuffer",
    value: function setBuffer(locationOrName, buffer) {
      var appAccessor = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

      if (buffer.target === 34963) {
        return this.setElementBuffer(buffer, appAccessor);
      }

      var _this$_resolveLocatio = this._resolveLocationAndAccessor(locationOrName, buffer, buffer.accessor, appAccessor),
          location = _this$_resolveLocatio.location,
          accessor = _this$_resolveLocatio.accessor;

      if (location >= 0) {
        this.values[location] = buffer;
        this.accessors[location] = accessor;
        this.clearDrawParams();
        this.vertexArrayObject.setBuffer(location, buffer, accessor);
      }

      return this;
    }
  }, {
    key: "setConstant",
    value: function setConstant(locationOrName, arrayValue) {
      var appAccessor = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

      var _this$_resolveLocatio2 = this._resolveLocationAndAccessor(locationOrName, arrayValue, Object.assign({
        size: arrayValue.length
      }, appAccessor)),
          location = _this$_resolveLocatio2.location,
          accessor = _this$_resolveLocatio2.accessor;

      if (location >= 0) {
        arrayValue = this.vertexArrayObject._normalizeConstantArrayValue(arrayValue, accessor);
        this.values[location] = arrayValue;
        this.accessors[location] = accessor;
        this.clearDrawParams();
        this.vertexArrayObject.enable(location, false);
      }

      return this;
    }
  }, {
    key: "unbindBuffers",
    value: function unbindBuffers() {
      var _this2 = this;

      this.vertexArrayObject.bind(function () {
        if (_this2.elements) {
          _this2.vertexArrayObject.setElementBuffer(null);
        }

        _this2.buffer = _this2.buffer || new Buffer(_this2.gl, {
          accessor: {
            size: 4
          }
        });

        for (var location = 0; location < _this2.vertexArrayObject.MAX_ATTRIBUTES; location++) {
          if (_this2.values[location] instanceof Buffer) {
            _this2.gl.disableVertexAttribArray(location);

            _this2.gl.bindBuffer(34962, _this2.buffer.handle);

            _this2.gl.vertexAttribPointer(location, 1, 5126, false, 0, 0);
          }
        }
      });
      return this;
    }
  }, {
    key: "bindBuffers",
    value: function bindBuffers() {
      var _this3 = this;

      this.vertexArrayObject.bind(function () {
        if (_this3.elements) {
          _this3.setElementBuffer(_this3.elements);
        }

        for (var location = 0; location < _this3.vertexArrayObject.MAX_ATTRIBUTES; location++) {
          var buffer = _this3.values[location];

          if (buffer instanceof Buffer) {
            _this3.setBuffer(location, buffer);
          }
        }
      });
      return this;
    }
  }, {
    key: "bindForDraw",
    value: function bindForDraw(vertexCount, instanceCount, func) {
      var _this4 = this;

      var value;
      this.vertexArrayObject.bind(function () {
        _this4._setConstantAttributes(vertexCount, instanceCount);

        value = func();
      });
      return value;
    }
  }, {
    key: "_resolveLocationAndAccessor",
    value: function _resolveLocationAndAccessor(locationOrName, value, valueAccessor, appAccessor) {
      var _this5 = this;

      var _this$_getAttributeIn = this._getAttributeIndex(locationOrName),
          location = _this$_getAttributeIn.location,
          name = _this$_getAttributeIn.name;

      if (!Number.isFinite(location) || location < 0) {
        this.unused[locationOrName] = value;
        log$2.once(3, function () {
          return "unused value ".concat(locationOrName, " in ").concat(_this5.id);
        })();
        return this;
      }

      var accessInfo = this._getAttributeInfo(name || location);

      if (!accessInfo) {
        return {
          location: -1,
          accessor: null
        };
      }

      var currentAccessor = this.accessors[location] || {};
      var accessor = Accessor.resolve(accessInfo.accessor, currentAccessor, valueAccessor, appAccessor);
      var size = accessor.size,
          type = accessor.type;
      assert$3(Number.isFinite(size) && Number.isFinite(type));
      return {
        location: location,
        accessor: accessor
      };
    }
  }, {
    key: "_getAttributeInfo",
    value: function _getAttributeInfo(attributeName) {
      return this.configuration && this.configuration.getAttributeInfo(attributeName);
    }
  }, {
    key: "_getAttributeIndex",
    value: function _getAttributeIndex(locationOrName) {
      var location = Number(locationOrName);

      if (Number.isFinite(location)) {
        return {
          location: location
        };
      }

      var multiLocation = MULTI_LOCATION_ATTRIBUTE_REGEXP.exec(locationOrName);
      var name = multiLocation ? multiLocation[1] : locationOrName;
      var locationOffset = multiLocation ? Number(multiLocation[2]) : 0;

      if (this.configuration) {
        return {
          location: this.configuration.getAttributeLocation(name) + locationOffset,
          name: name
        };
      }

      return {
        location: -1
      };
    }
  }, {
    key: "_setAttribute",
    value: function _setAttribute(locationOrName, value) {
      if (value instanceof Buffer) {
        this.setBuffer(locationOrName, value);
      } else if (Array.isArray(value) && value.length && value[0] instanceof Buffer) {
        var buffer = value[0];
        var accessor = value[1];
        this.setBuffer(locationOrName, buffer, accessor);
      } else if (ArrayBuffer.isView(value) || Array.isArray(value)) {
        var constant = value;
        this.setConstant(locationOrName, constant);
      } else if (value.buffer instanceof Buffer) {
        var _accessor = value;
        this.setBuffer(locationOrName, _accessor.buffer, _accessor);
      } else {
        throw new Error(ERR_ATTRIBUTE_TYPE);
      }
    }
  }, {
    key: "_setConstantAttributes",
    value: function _setConstantAttributes(vertexCount, instanceCount) {
      var elementCount = Math.max(vertexCount | 0, instanceCount | 0);
      var constant = this.values[0];

      if (ArrayBuffer.isView(constant)) {
        this._setConstantAttributeZero(constant, elementCount);
      }

      for (var location = 1; location < this.vertexArrayObject.MAX_ATTRIBUTES; location++) {
        constant = this.values[location];

        if (ArrayBuffer.isView(constant)) {
          this._setConstantAttribute(location, constant);
        }
      }
    }
  }, {
    key: "_setConstantAttributeZero",
    value: function _setConstantAttributeZero(constant, elementCount) {
      if (VertexArrayObject.isSupported(this.gl, {
        constantAttributeZero: true
      })) {
        this._setConstantAttribute(0, constant);

        return;
      }

      var buffer = this.vertexArrayObject.getConstantBuffer(elementCount, constant);
      this.vertexArrayObject.setBuffer(0, buffer, this.accessors[0]);
    }
  }, {
    key: "_setConstantAttribute",
    value: function _setConstantAttribute(location, constant) {
      VertexArrayObject.setConstant(this.gl, location, constant);
    }
  }, {
    key: "_updateDrawParams",
    value: function _updateDrawParams() {
      var drawParams = {
        isIndexed: false,
        isInstanced: false,
        indexCount: Infinity,
        vertexCount: Infinity,
        instanceCount: Infinity
      };

      for (var location = 0; location < this.vertexArrayObject.MAX_ATTRIBUTES; location++) {
        this._updateDrawParamsForLocation(drawParams, location);
      }

      if (this.elements) {
        drawParams.elementCount = this.elements.getElementCount(this.elements.accessor);
        drawParams.isIndexed = true;
        drawParams.indexType = this.elementsAccessor.type || this.elements.accessor.type;
        drawParams.indexOffset = this.elementsAccessor.offset || 0;
      }

      if (drawParams.indexCount === Infinity) {
        drawParams.indexCount = 0;
      }

      if (drawParams.vertexCount === Infinity) {
        drawParams.vertexCount = 0;
      }

      if (drawParams.instanceCount === Infinity) {
        drawParams.instanceCount = 0;
      }

      return drawParams;
    }
  }, {
    key: "_updateDrawParamsForLocation",
    value: function _updateDrawParamsForLocation(drawParams, location) {
      var value = this.values[location];
      var accessor = this.accessors[location];

      if (!value) {
        return;
      }

      var divisor = accessor.divisor;
      var isInstanced = divisor > 0;
      drawParams.isInstanced = drawParams.isInstanced || isInstanced;

      if (value instanceof Buffer) {
        var buffer = value;

        if (isInstanced) {
          var instanceCount = buffer.getVertexCount(accessor);
          drawParams.instanceCount = Math.min(drawParams.instanceCount, instanceCount);
        } else {
          var vertexCount = buffer.getVertexCount(accessor);
          drawParams.vertexCount = Math.min(drawParams.vertexCount, vertexCount);
        }
      }
    }
  }, {
    key: "setElements",
    value: function setElements() {
      var elementBuffer = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
      var accessor = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      log$2.deprecated('setElements', 'setElementBuffer')();
      return this.setElementBuffer(elementBuffer, accessor);
    }
  }]);

  return VertexArray;
}();

function getDebugTableForUniforms() {
  var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
      _ref$header = _ref.header,
      header = _ref$header === void 0 ? 'Uniforms' : _ref$header,
      program = _ref.program,
      uniforms = _ref.uniforms,
      _ref$undefinedOnly = _ref.undefinedOnly,
      undefinedOnly = _ref$undefinedOnly === void 0 ? false : _ref$undefinedOnly;

  assert$3(program);
  var SHADER_MODULE_UNIFORM_REGEXP = '.*_.*';
  var PROJECT_MODULE_UNIFORM_REGEXP = '.*Matrix';
  var uniformLocations = program._uniformSetters;
  var table = {};
  var uniformNames = Object.keys(uniformLocations).sort();
  var count = 0;
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = uniformNames[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var _uniformName = _step.value;

      if (!_uniformName.match(SHADER_MODULE_UNIFORM_REGEXP) && !_uniformName.match(PROJECT_MODULE_UNIFORM_REGEXP)) {
        if (addUniformToTable({
          table: table,
          header: header,
          uniforms: uniforms,
          uniformName: _uniformName,
          undefinedOnly: undefinedOnly
        })) {
          count++;
        }
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

  var _iteratorNormalCompletion2 = true;
  var _didIteratorError2 = false;
  var _iteratorError2 = undefined;

  try {
    for (var _iterator2 = uniformNames[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
      var _uniformName2 = _step2.value;

      if (_uniformName2.match(PROJECT_MODULE_UNIFORM_REGEXP)) {
        if (addUniformToTable({
          table: table,
          header: header,
          uniforms: uniforms,
          uniformName: _uniformName2,
          undefinedOnly: undefinedOnly
        })) {
          count++;
        }
      }
    }
  } catch (err) {
    _didIteratorError2 = true;
    _iteratorError2 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion2 && _iterator2["return"] != null) {
        _iterator2["return"]();
      }
    } finally {
      if (_didIteratorError2) {
        throw _iteratorError2;
      }
    }
  }

  var _iteratorNormalCompletion3 = true;
  var _didIteratorError3 = false;
  var _iteratorError3 = undefined;

  try {
    for (var _iterator3 = uniformNames[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
      var _uniformName3 = _step3.value;

      if (!table[_uniformName3]) {
        if (addUniformToTable({
          table: table,
          header: header,
          uniforms: uniforms,
          uniformName: _uniformName3,
          undefinedOnly: undefinedOnly
        })) {
          count++;
        }
      }
    }
  } catch (err) {
    _didIteratorError3 = true;
    _iteratorError3 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion3 && _iterator3["return"] != null) {
        _iterator3["return"]();
      }
    } finally {
      if (_didIteratorError3) {
        throw _iteratorError3;
      }
    }
  }

  var unusedCount = 0;
  var unusedTable = {};

  if (!undefinedOnly) {
    for (var uniformName in uniforms) {
      var uniform = uniforms[uniformName];

      if (!table[uniformName]) {
        unusedCount++;
        unusedTable[uniformName] = _defineProperty({
          Type: "NOT USED: ".concat(uniform)
        }, header, formatValue(uniform));
      }
    }
  }

  return {
    table: table,
    count: count,
    unusedTable: unusedTable,
    unusedCount: unusedCount
  };
}

function addUniformToTable(_ref2) {
  var table = _ref2.table,
      header = _ref2.header,
      uniforms = _ref2.uniforms,
      uniformName = _ref2.uniformName,
      undefinedOnly = _ref2.undefinedOnly;
  var value = uniforms[uniformName];
  var isDefined = isUniformDefined(value);

  if (!undefinedOnly || !isDefined) {
    var _table$uniformName;

    table[uniformName] = (_table$uniformName = {}, _defineProperty(_table$uniformName, header, isDefined ? formatValue(value) : 'N/A'), _defineProperty(_table$uniformName, 'Uniform Type', isDefined ? value : 'NOT PROVIDED'), _table$uniformName);
    return true;
  }

  return false;
}

function isUniformDefined(value) {
  return value !== undefined && value !== null;
}

function getDebugTableForVertexArray() {
  var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
      vertexArray = _ref.vertexArray,
      _ref$header = _ref.header,
      header = _ref$header === void 0 ? 'Attributes' : _ref$header;

  if (!vertexArray.configuration) {
    return {};
  }

  var table = {};

  if (vertexArray.elements) {
    table.ELEMENT_ARRAY_BUFFER = getDebugTableRow(vertexArray, vertexArray.elements, null, header);
  }

  var attributes = vertexArray.values;

  for (var attributeLocation in attributes) {
    var info = vertexArray._getAttributeInfo(attributeLocation);

    if (info) {
      var rowHeader = "".concat(attributeLocation, ": ").concat(info.name);
      var accessor = vertexArray.accessors[info.location];

      if (accessor) {
        rowHeader = "".concat(attributeLocation, ": ").concat(getGLSLDeclaration(info.name, accessor));
      }

      table[rowHeader] = getDebugTableRow(vertexArray, attributes[attributeLocation], accessor, header);
    }
  }

  return table;
}

function getDebugTableRow(vertexArray, attribute, accessor, header) {
  var _ref4;

  var gl = vertexArray.gl;

  if (!attribute) {
    var _ref2;

    return _ref2 = {}, _defineProperty(_ref2, header, 'null'), _defineProperty(_ref2, 'Format ', 'N/A'), _ref2;
  }

  var type = 'NOT PROVIDED';
  var size = 'N/A';
  var verts = 'N/A';
  var bytes = 'N/A';
  var isInteger;
  var marker;
  var value;

  if (accessor) {
    type = accessor.type;
    size = accessor.size;
    type = String(type).replace('Array', '');
    isInteger = type.indexOf('nt') !== -1;
  }

  if (attribute instanceof Buffer) {
    var _ref3;

    var buffer = attribute;

    var _buffer$getDebugData = buffer.getDebugData(),
        data = _buffer$getDebugData.data,
        modified = _buffer$getDebugData.modified;

    marker = modified ? '*' : '';
    value = data;
    bytes = buffer.byteLength;
    verts = bytes / data.BYTES_PER_ELEMENT / size;
    var format;

    if (accessor) {
      var instanced = accessor.divisor > 0;
      format = "".concat(instanced ? 'I ' : 'P ', " ").concat(verts, " (x").concat(size, "=").concat(bytes, " bytes ").concat(getKey(gl, type), ")");
    } else {
      isInteger = true;
      format = "".concat(bytes, " bytes");
    }

    return _ref3 = {}, _defineProperty(_ref3, header, "".concat(marker).concat(formatValue(value, {
      size: size,
      isInteger: isInteger
    }))), _defineProperty(_ref3, 'Format ', format), _ref3;
  }

  value = attribute;
  size = attribute.length;
  type = String(attribute.constructor.name).replace('Array', '');
  isInteger = type.indexOf('nt') !== -1;
  return _ref4 = {}, _defineProperty(_ref4, header, "".concat(formatValue(value, {
    size: size,
    isInteger: isInteger
  }), " (constant)")), _defineProperty(_ref4, 'Format ', "".concat(size, "x").concat(type, " (constant)")), _ref4;
}

function getGLSLDeclaration(name, accessor) {
  var type = accessor.type,
      size = accessor.size;
  var typeAndName = getCompositeGLType(type, size);
  return typeAndName ? "".concat(name, " (").concat(typeAndName.name, ")") : name;
}

function getDebugTableForProgramConfiguration(config) {
  var table = {};
  var header = "Accessors for ".concat(config.id);
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = config.attributeInfos[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var attributeInfo = _step.value;

      if (attributeInfo) {
        var glslDeclaration = getGLSLDeclaration$1(attributeInfo);
        table["in ".concat(glslDeclaration)] = _defineProperty({}, header, JSON.stringify(attributeInfo.accessor));
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

  var _iteratorNormalCompletion2 = true;
  var _didIteratorError2 = false;
  var _iteratorError2 = undefined;

  try {
    for (var _iterator2 = config.varyingInfos[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
      var varyingInfo = _step2.value;

      if (varyingInfo) {
        var _glslDeclaration = getGLSLDeclaration$1(varyingInfo);

        table["out ".concat(_glslDeclaration)] = _defineProperty({}, header, JSON.stringify(varyingInfo.accessor));
      }
    }
  } catch (err) {
    _didIteratorError2 = true;
    _iteratorError2 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion2 && _iterator2["return"] != null) {
        _iterator2["return"]();
      }
    } finally {
      if (_didIteratorError2) {
        throw _iteratorError2;
      }
    }
  }

  return table;
}

function getGLSLDeclaration$1(attributeInfo) {
  var _attributeInfo$access = attributeInfo.accessor,
      type = _attributeInfo$access.type,
      size = _attributeInfo$access.size;
  var typeAndName = getCompositeGLType(type, size);

  if (typeAndName) {
    return "".concat(typeAndName.name, " ").concat(attributeInfo.name);
  }

  return attributeInfo.name;
}

var VERTEX_SHADER = 'vs';
var FRAGMENT_SHADER = 'fs';

function assert$4(condition, message) {
  if (!condition) {
    throw new Error(message || 'shadertools: assertion failed.');
  }
}

var TYPE_DEFINITIONS = {
  number: {
    validate: function validate(value, propType) {
      return Number.isFinite(value) && (!('max' in propType) || value <= propType.max) && (!('min' in propType) || value >= propType.min);
    }
  },
  array: {
    validate: function validate(value, propType) {
      return Array.isArray(value) || ArrayBuffer.isView(value);
    }
  }
};
function parsePropTypes(propDefs) {
  var propTypes = {};

  for (var propName in propDefs) {
    var propDef = propDefs[propName];
    var propType = parsePropType(propDef);
    propTypes[propName] = propType;
  }

  return propTypes;
}

function parsePropType(propDef) {
  var type = getTypeOf(propDef);

  if (type === 'object') {
    if (!propDef) {
      return {
        type: 'object',
        value: null
      };
    }

    if ('type' in propDef) {
      return Object.assign({}, propDef, TYPE_DEFINITIONS[propDef.type]);
    }

    if (!('value' in propDef)) {
      return {
        type: 'object',
        value: propDef
      };
    }

    type = getTypeOf(propDef.value);
    return Object.assign({
      type: type
    }, propDef, TYPE_DEFINITIONS[type]);
  }

  return Object.assign({
    type: type,
    value: propDef
  }, TYPE_DEFINITIONS[type]);
}

function getTypeOf(value) {
  if (Array.isArray(value) || ArrayBuffer.isView(value)) {
    return 'array';
  }

  return _typeof(value);
}

var VERTEX_SHADER$1 = 'vs';
var FRAGMENT_SHADER$1 = 'fs';

var ShaderModule = function () {
  function ShaderModule(_ref) {
    var name = _ref.name,
        vs = _ref.vs,
        fs = _ref.fs,
        _ref$dependencies = _ref.dependencies,
        dependencies = _ref$dependencies === void 0 ? [] : _ref$dependencies,
        uniforms = _ref.uniforms,
        getUniforms = _ref.getUniforms,
        _ref$deprecations = _ref.deprecations,
        deprecations = _ref$deprecations === void 0 ? [] : _ref$deprecations,
        _ref$defines = _ref.defines,
        defines = _ref$defines === void 0 ? {} : _ref$defines,
        _ref$inject = _ref.inject,
        inject = _ref$inject === void 0 ? {} : _ref$inject,
        vertexShader = _ref.vertexShader,
        fragmentShader = _ref.fragmentShader;

    _classCallCheck(this, ShaderModule);

    assert$4(typeof name === 'string');
    this.name = name;
    this.vs = vs || vertexShader;
    this.fs = fs || fragmentShader;
    this.getModuleUniforms = getUniforms;
    this.dependencies = dependencies;
    this.deprecations = this._parseDeprecationDefinitions(deprecations);
    this.defines = defines;
    this.injections = normalizeInjections(inject);

    if (uniforms) {
      this.uniforms = parsePropTypes(uniforms);
    }
  }

  _createClass(ShaderModule, [{
    key: "getModuleSource",
    value: function getModuleSource(type) {
      var moduleSource;

      switch (type) {
        case VERTEX_SHADER$1:
          moduleSource = this.vs || '';
          break;

        case FRAGMENT_SHADER$1:
          moduleSource = this.fs || '';
          break;

        default:
          assert$4(false);
      }

      return "#define MODULE_".concat(this.name.toUpperCase().replace(/[^0-9a-z]/gi, '_'), "\n").concat(moduleSource, "// END MODULE_").concat(this.name, "\n\n");
    }
  }, {
    key: "getUniforms",
    value: function getUniforms(opts, uniforms) {
      if (this.getModuleUniforms) {
        return this.getModuleUniforms(opts, uniforms);
      }

      if (this.uniforms) {
        return this._defaultGetUniforms(opts);
      }

      return {};
    }
  }, {
    key: "getDefines",
    value: function getDefines() {
      return this.defines;
    }
  }, {
    key: "checkDeprecations",
    value: function checkDeprecations(shaderSource, log) {
      this.deprecations.forEach(function (def) {
        if (def.regex.test(shaderSource)) {
          if (def.deprecated) {
            log.deprecated(def.old, def["new"])();
          } else {
            log.removed(def.old, def["new"])();
          }
        }
      });
    }
  }, {
    key: "_parseDeprecationDefinitions",
    value: function _parseDeprecationDefinitions(deprecations) {
      deprecations.forEach(function (def) {
        switch (def.type) {
          case 'function':
            def.regex = new RegExp("\\b".concat(def.old, "\\("));
            break;

          default:
            def.regex = new RegExp("".concat(def.type, " ").concat(def.old, ";"));
        }
      });
      return deprecations;
    }
  }, {
    key: "_defaultGetUniforms",
    value: function _defaultGetUniforms() {
      var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var uniforms = {};
      var propTypes = this.uniforms;

      for (var key in propTypes) {
        var propDef = propTypes[key];

        if (key in opts && !propDef["private"]) {
          if (propDef.validate) {
            assert$4(propDef.validate(opts[key], propDef), "".concat(this.name, ": invalid ").concat(key));
          }

          uniforms[key] = opts[key];
        } else {
          uniforms[key] = propDef.value;
        }
      }

      return uniforms;
    }
  }]);

  return ShaderModule;
}();

function normalizeInjections(injections) {
  var result = {
    vs: {},
    fs: {}
  };

  for (var hook in injections) {
    var injection = injections[hook];
    var stage = hook.slice(0, 2);

    if (typeof injection === 'string') {
      injection = {
        injection: injection
      };
    }

    result[stage][hook] = injection;
  }

  return result;
}

function resolveModules(modules) {
  return getShaderDependencies(instantiateModules(modules));
}

function getShaderDependencies(modules) {
  var moduleMap = {};
  var moduleDepth = {};
  getDependencyGraph({
    modules: modules,
    level: 0,
    moduleMap: moduleMap,
    moduleDepth: moduleDepth
  });
  return Object.keys(moduleDepth).sort(function (a, b) {
    return moduleDepth[b] - moduleDepth[a];
  }).map(function (name) {
    return moduleMap[name];
  });
}

function getDependencyGraph(_ref) {
  var modules = _ref.modules,
      level = _ref.level,
      moduleMap = _ref.moduleMap,
      moduleDepth = _ref.moduleDepth;

  if (level >= 5) {
    throw new Error('Possible loop in shader dependency graph');
  }

  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = modules[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var module = _step.value;
      moduleMap[module.name] = module;

      if (moduleDepth[module.name] === undefined || moduleDepth[module.name] < level) {
        moduleDepth[module.name] = level;
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

  var _iteratorNormalCompletion2 = true;
  var _didIteratorError2 = false;
  var _iteratorError2 = undefined;

  try {
    for (var _iterator2 = modules[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
      var _module = _step2.value;

      if (_module.dependencies) {
        getDependencyGraph({
          modules: _module.dependencies,
          level: level + 1,
          moduleMap: moduleMap,
          moduleDepth: moduleDepth
        });
      }
    }
  } catch (err) {
    _didIteratorError2 = true;
    _iteratorError2 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion2 && _iterator2["return"] != null) {
        _iterator2["return"]();
      }
    } finally {
      if (_didIteratorError2) {
        throw _iteratorError2;
      }
    }
  }
}

function instantiateModules(modules, seen) {
  return modules.map(function (module) {
    if (module instanceof ShaderModule) {
      return module;
    }

    assert$4(typeof module !== 'string', "Shader module use by name is deprecated. Import shader module '".concat(module, "' and use it directly."));
    assert$4(module.name, 'shader module has no name');
    module = new ShaderModule(module);
    module.dependencies = instantiateModules(module.dependencies);
    return module;
  });
}

function isOldIE() {
  var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var navigator = typeof window !== 'undefined' ? window.navigator || {} : {};
  var userAgent = opts.userAgent || navigator.userAgent || '';
  var isMSIE = userAgent.indexOf('MSIE ') !== -1;
  var isTrident = userAgent.indexOf('Trident/') !== -1;
  return isMSIE || isTrident;
}

var GL_VENDOR = 0x1f00;
var GL_RENDERER = 0x1f01;
var GL_VERSION = 0x1f02;
var GL_SHADING_LANGUAGE_VERSION = 0x8b8c;
var WEBGL_FEATURES$1 = {
  GLSL_FRAG_DATA: ['WEBGL_draw_buffers', true],
  GLSL_FRAG_DEPTH: ['EXT_frag_depth', true],
  GLSL_DERIVATIVES: ['OES_standard_derivatives', true],
  GLSL_TEXTURE_LOD: ['EXT_shader_texture_lod', true]
};
var FEATURES$1 = {};
Object.keys(WEBGL_FEATURES$1).forEach(function (key) {
  FEATURES$1[key] = key;
});

function isWebGL2$1(gl) {
  return Boolean(gl && gl._version === 2);
}

function getContextInfo(gl) {
  var info = gl.getExtension('WEBGL_debug_renderer_info');
  var vendor = gl.getParameter(info && info.UNMASKED_VENDOR_WEBGL || GL_VENDOR);
  var renderer = gl.getParameter(info && info.UNMASKED_RENDERER_WEBGL || GL_RENDERER);
  var gpuVendor = identifyGPUVendor(vendor, renderer);
  var gpuInfo = {
    gpuVendor: gpuVendor,
    vendor: vendor,
    renderer: renderer,
    version: gl.getParameter(GL_VERSION),
    shadingLanguageVersion: gl.getParameter(GL_SHADING_LANGUAGE_VERSION)
  };
  return gpuInfo;
}

function identifyGPUVendor(vendor, renderer) {
  if (vendor.match(/NVIDIA/i) || renderer.match(/NVIDIA/i)) {
    return 'NVIDIA';
  }

  if (vendor.match(/INTEL/i) || renderer.match(/INTEL/i)) {
    return 'INTEL';
  }

  if (vendor.match(/AMD/i) || renderer.match(/AMD/i) || vendor.match(/ATI/i) || renderer.match(/ATI/i)) {
    return 'AMD';
  }

  return 'UNKNOWN GPU';
}

var compiledGlslExtensions = {};
function canCompileGLGSExtension(gl, cap) {
  var opts = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  var feature = WEBGL_FEATURES$1[cap];
  assert$4(feature, cap);

  if (!isOldIE(opts)) {
    return true;
  }

  if (cap in compiledGlslExtensions) {
    return compiledGlslExtensions[cap];
  }

  var extensionName = feature[0];
  var behavior = opts.behavior || 'enable';
  var source = "#extension GL_".concat(extensionName, " : ").concat(behavior, "\nvoid main(void) {}");
  var shader = gl.createShader(35633);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  var canCompile = gl.getShaderParameter(shader, 35713);
  gl.deleteShader(shader);
  compiledGlslExtensions[cap] = canCompile;
  return canCompile;
}

function getFeature(gl, cap) {
  var feature = WEBGL_FEATURES$1[cap];
  assert$4(feature, cap);
  var extensionName = isWebGL2$1(gl) ? feature[1] || feature[0] : feature[0];
  var value = typeof extensionName === 'string' ? Boolean(gl.getExtension(extensionName)) : extensionName;
  assert$4(value === false || value === true);
  return value;
}

function hasFeatures$1(gl, features) {
  features = Array.isArray(features) ? features : [features];
  return features.every(function (feature) {
    return getFeature(gl, feature);
  });
}

function getPlatformShaderDefines(gl) {
  var debugInfo = getContextInfo(gl);

  switch (debugInfo.gpuVendor.toLowerCase()) {
    case 'nvidia':
      return "#define NVIDIA_GPU\n// Nvidia optimizes away the calculation necessary for emulated fp64\n#define LUMA_FP64_CODE_ELIMINATION_WORKAROUND 1\n";

    case 'intel':
      return "#define INTEL_GPU\n// Intel optimizes away the calculation necessary for emulated fp64\n#define LUMA_FP64_CODE_ELIMINATION_WORKAROUND 1\n// Intel's built-in 'tan' function doesn't have acceptable precision\n#define LUMA_FP32_TAN_PRECISION_WORKAROUND 1\n// Intel GPU doesn't have full 32 bits precision in same cases, causes overflow\n#define LUMA_FP64_HIGH_BITS_OVERFLOW_WORKAROUND 1\n";

    case 'amd':
      return "#define AMD_GPU\n";

    default:
      return "#define DEFAULT_GPU\n// Prevent driver from optimizing away the calculation necessary for emulated fp64\n#define LUMA_FP64_CODE_ELIMINATION_WORKAROUND 1\n// Intel's built-in 'tan' function doesn't have acceptable precision\n#define LUMA_FP32_TAN_PRECISION_WORKAROUND 1\n// Intel GPU doesn't have full 32 bits precision in same cases, causes overflow\n#define LUMA_FP64_HIGH_BITS_OVERFLOW_WORKAROUND 1\n";
  }
}
function getVersionDefines(gl, glslVersion, isFragment) {
  var versionDefines = "#if (__VERSION__ > 120)\n\n# define FRAG_DEPTH\n# define DERIVATIVES\n# define DRAW_BUFFERS\n# define TEXTURE_LOD\n\n#endif // __VERSION\n";

  if (hasFeatures$1(gl, FEATURES$1.GLSL_FRAG_DEPTH)) {
    versionDefines += "// FRAG_DEPTH => gl_FragDepth is available\n#ifdef GL_EXT_frag_depth\n#extension GL_EXT_frag_depth : enable\n# define FRAG_DEPTH\n# define gl_FragDepth gl_FragDepthEXT\n#endif\n";
  }

  if (hasFeatures$1(gl, FEATURES$1.GLSL_DERIVATIVES) && canCompileGLGSExtension(gl, FEATURES$1.GLSL_DERIVATIVES)) {
    versionDefines += "// DERIVATIVES => dxdF, dxdY and fwidth are available\n#ifdef GL_OES_standard_derivatives\n#extension GL_OES_standard_derivatives : enable\n# define DERIVATIVES\n#endif\n";
  }

  if (hasFeatures$1(gl, FEATURES$1.GLSL_FRAG_DATA) && canCompileGLGSExtension(gl, FEATURES$1.GLSL_FRAG_DATA, {
    behavior: 'require'
  })) {
    versionDefines += "// DRAW_BUFFERS => gl_FragData[] is available\n#ifdef GL_EXT_draw_buffers\n#extension GL_EXT_draw_buffers : require\n#define DRAW_BUFFERS\n#endif\n";
  }

  if (hasFeatures$1(gl, FEATURES$1.GLSL_TEXTURE_LOD)) {
    versionDefines += "// TEXTURE_LOD => texture2DLod etc are available\n#ifdef GL_EXT_shader_texture_lod\n#extension GL_EXT_shader_texture_lod : enable\n# define TEXTURE_LOD\n#define texture2DLod texture2DLodEXT\n#define texture2DProjLod texture2DProjLodEXT\n#define texture2DProjLod texture2DProjLodEXT\n#define textureCubeLod textureCubeLodEXT\n#define texture2DGrad texture2DGradEXT\n#define texture2DProjGrad texture2DProjGradEXT\n#define texture2DProjGrad texture2DProjGradEXT\n#define textureCubeGrad textureCubeGradEXT\n#endif\n";
  }

  return versionDefines;
}

var MODULE_INJECTORS_VS = "#ifdef MODULE_LOGDEPTH\n  logdepth_adjustPosition(gl_Position);\n#endif\n";
var MODULE_INJECTORS_FS = "#ifdef MODULE_MATERIAL\n  gl_FragColor = material_filterColor(gl_FragColor);\n#endif\n\n#ifdef MODULE_LIGHTING\n  gl_FragColor = lighting_filterColor(gl_FragColor);\n#endif\n\n#ifdef MODULE_FOG\n  gl_FragColor = fog_filterColor(gl_FragColor);\n#endif\n\n#ifdef MODULE_PICKING\n  gl_FragColor = picking_filterHighlightColor(gl_FragColor);\n  gl_FragColor = picking_filterPickingColor(gl_FragColor);\n#endif\n\n#ifdef MODULE_LOGDEPTH\n  logdepth_setFragDepth();\n#endif\n";

var _MODULE_INJECTORS;
var MODULE_INJECTORS = (_MODULE_INJECTORS = {}, _defineProperty(_MODULE_INJECTORS, VERTEX_SHADER, MODULE_INJECTORS_VS), _defineProperty(_MODULE_INJECTORS, FRAGMENT_SHADER, MODULE_INJECTORS_FS), _MODULE_INJECTORS);
var DECLARATION_INJECT_MARKER = '__LUMA_INJECT_DECLARATIONS__';
var REGEX_START_OF_MAIN = /void\s+main\s*\([^)]*\)\s*\{\n?/;
var REGEX_END_OF_MAIN = /}\n?[^{}]*$/;
var fragments = [];
function injectShader(source, type, inject, injectStandardStubs) {
  var isVertex = type === VERTEX_SHADER;

  var _loop = function _loop(key) {
    var fragmentData = inject[key];
    fragmentData.sort(function (a, b) {
      return a.order - b.order;
    });
    fragments.length = fragmentData.length;

    for (var i = 0, len = fragmentData.length; i < len; ++i) {
      fragments[i] = fragmentData[i].injection;
    }

    var fragmentString = "".concat(fragments.join('\n'), "\n");

    switch (key) {
      case 'vs:#decl':
        if (isVertex) {
          source = source.replace(DECLARATION_INJECT_MARKER, fragmentString);
        }

        break;

      case 'vs:#main-start':
        if (isVertex) {
          source = source.replace(REGEX_START_OF_MAIN, function (match) {
            return match + fragmentString;
          });
        }

        break;

      case 'vs:#main-end':
        if (isVertex) {
          source = source.replace(REGEX_END_OF_MAIN, function (match) {
            return fragmentString + match;
          });
        }

        break;

      case 'fs:#decl':
        if (!isVertex) {
          source = source.replace(DECLARATION_INJECT_MARKER, fragmentString);
        }

        break;

      case 'fs:#main-start':
        if (!isVertex) {
          source = source.replace(REGEX_START_OF_MAIN, function (match) {
            return match + fragmentString;
          });
        }

        break;

      case 'fs:#main-end':
        if (!isVertex) {
          source = source.replace(REGEX_END_OF_MAIN, function (match) {
            return fragmentString + match;
          });
        }

        break;

      default:
        source = source.replace(key, function (match) {
          return match + fragmentString;
        });
    }
  };

  for (var key in inject) {
    _loop(key);
  }

  source = source.replace(DECLARATION_INJECT_MARKER, '');

  if (injectStandardStubs) {
    source = source.replace(/\}\s*$/, function (match) {
      return match + MODULE_INJECTORS[type];
    });
  }

  return source;
}
function combineInjects(injects) {
  var result = {};
  assert$4(Array.isArray(injects) && injects.length > 1);
  injects.forEach(function (inject) {
    for (var key in inject) {
      result[key] = result[key] ? "".concat(result[key], "\n").concat(inject[key]) : inject[key];
    }
  });
  return result;
}

function transpileShader(source, targetGLSLVersion, isVertex) {
  switch (targetGLSLVersion) {
    case 300:
      return isVertex ? convertVertexShaderTo300(source) : convertFragmentShaderTo300(source);

    case 100:
      return isVertex ? convertVertexShaderTo100(source) : convertFragmentShaderTo100(source);

    default:
      throw new Error("unknown GLSL version ".concat(targetGLSLVersion));
  }
}
var FS_OUTPUT_REGEX = /^[ \t]*out[ \t]+vec4[ \t]+(\w+)[ \t]*;\s+/m;

function convertVertexShaderTo300(source) {
  return source.replace(/^(#version[ \t]+(100|300[ \t]+es))?[ \t]*\n/, '#version 300 es\n').replace(/^[ \t]*attribute[ \t]+(.+;)/gm, 'in $1').replace(/^[ \t]*varying[ \t]+(.+;)/gm, 'out $1').replace(/\btexture2D\(/g, 'texture(').replace(/\btextureCube\(+/g, 'texture(').replace(/\btexture2DLodEXT\(/g, 'textureLod(').replace(/\btextureCubeLodEXT\(/g, 'textureLod(');
}

function convertFragmentShaderTo300(source) {
  return source.replace(/^(#version[ \t]+(100|300[ \t]+es))?[ \t]*\n/, '#version 300 es\n').replace(/^[ \t]*varying[ \t]+(.+;)/gm, 'in $1').replace(/\btexture2D\(/g, 'texture(').replace(/\btextureCube\(/g, 'texture(').replace(/\btexture2DLodEXT\(/g, 'textureLod(').replace(/\btextureCubeLodEXT\(/g, 'textureLod(');
}

function convertVertexShaderTo100(source) {
  return source.replace(/^#version[ \t]+300[ \t]+es/, '#version 100').replace(/^[ \t]*in[ \t]+(.+;)/gm, 'attribute $1').replace(/^[ \t]*out[ \t]+(.+;)/gm, 'varying $1').replace(/\btexture\(/g, 'texture2D(').replace(/\btextureLod\(/g, 'texture2DLodEXT(');
}

function convertFragmentShaderTo100(source) {
  source = source.replace(/^#version[ \t]+300[ \t]+es/, '#version 100').replace(/^[ \t]*in[ \t]+/gm, 'varying ').replace(/\btexture\(/g, 'texture2D(').replace(/\btextureLod\(/g, 'texture2DLodEXT(');
  var outputMatch = source.match(FS_OUTPUT_REGEX);

  if (outputMatch) {
    var outputName = outputMatch[1];
    source = source.replace(FS_OUTPUT_REGEX, '').replace(new RegExp("\\b".concat(outputName, "\\b"), 'g'), 'gl_FragColor');
  }

  return source;
}

var _SHADER_TYPE;
var INJECT_SHADER_DECLARATIONS = "\n\n".concat(DECLARATION_INJECT_MARKER, "\n\n");
var SHADER_TYPE = (_SHADER_TYPE = {}, _defineProperty(_SHADER_TYPE, VERTEX_SHADER, 'vertex'), _defineProperty(_SHADER_TYPE, FRAGMENT_SHADER, 'fragment'), _SHADER_TYPE);
var FRAGMENT_SHADER_PROLOGUE = "precision highp float;\n\n";
function assembleShaders(gl, opts) {
  var vs = opts.vs,
      fs = opts.fs;
  var modules = resolveModules(opts.modules || []);
  return {
    gl: gl,
    vs: assembleShader(gl, Object.assign({}, opts, {
      source: vs,
      type: VERTEX_SHADER,
      modules: modules
    })),
    fs: assembleShader(gl, Object.assign({}, opts, {
      source: fs,
      type: FRAGMENT_SHADER,
      modules: modules
    })),
    getUniforms: assembleGetUniforms(modules)
  };
}

function assembleShader(gl, _ref) {
  var id = _ref.id,
      source = _ref.source,
      type = _ref.type,
      modules = _ref.modules,
      _ref$defines = _ref.defines,
      defines = _ref$defines === void 0 ? {} : _ref$defines,
      _ref$hookFunctions = _ref.hookFunctions,
      hookFunctions = _ref$hookFunctions === void 0 ? [] : _ref$hookFunctions,
      _ref$inject = _ref.inject,
      inject = _ref$inject === void 0 ? {} : _ref$inject,
      _ref$transpileToGLSL = _ref.transpileToGLSL100,
      transpileToGLSL100 = _ref$transpileToGLSL === void 0 ? false : _ref$transpileToGLSL,
      _ref$prologue = _ref.prologue,
      prologue = _ref$prologue === void 0 ? true : _ref$prologue,
      log = _ref.log;
  assert$4(typeof source === 'string', 'shader source must be a string');
  var isVertex = type === VERTEX_SHADER;
  var sourceLines = source.split('\n');
  var glslVersion = 100;
  var versionLine = '';
  var coreSource = source;

  if (sourceLines[0].indexOf('#version ') === 0) {
    glslVersion = 300;
    versionLine = sourceLines[0];
    coreSource = sourceLines.slice(1).join('\n');
  } else {
    versionLine = "#version ".concat(glslVersion);
  }

  var allDefines = {};
  modules.forEach(function (module) {
    Object.assign(allDefines, module.getDefines());
  });
  Object.assign(allDefines, defines);
  var assembledSource = prologue ? "".concat(versionLine, "\n").concat(getShaderName$1({
    id: id,
    source: source,
    type: type
  }), "\n").concat(getShaderType({
    type: type
  }), "\n").concat(getPlatformShaderDefines(gl), "\n").concat(getVersionDefines(gl), "\n").concat(getApplicationDefines(allDefines), "\n").concat(isVertex ? '' : FRAGMENT_SHADER_PROLOGUE, "\n") : "".concat(versionLine, "\n");
  hookFunctions = normalizeHookFunctions(hookFunctions);
  var hookInjections = {};
  var declInjections = {};
  var mainInjections = {};

  for (var key in inject) {
    var injection = typeof inject[key] === 'string' ? {
      injection: inject[key],
      order: 0
    } : inject[key];
    var match = key.match(/^(v|f)s:(#)?([\w-]+)$/);

    if (match) {
      var hash = match[2];
      var name = match[3];

      if (hash) {
        if (name === 'decl') {
          declInjections[key] = [injection];
        } else {
          mainInjections[key] = [injection];
        }
      } else {
        hookInjections[key] = [injection];
      }
    } else {
      mainInjections[key] = [injection];
    }
  }

  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = modules[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var module = _step.value;

      if (log) {
        module.checkDeprecations(coreSource, log);
      }

      var moduleSource = module.getModuleSource(type, glslVersion);
      assembledSource += moduleSource;
      var injections = module.injections[type];

      for (var _key in injections) {
        var _match = _key.match(/^(v|f)s:#([\w-]+)$/);

        if (_match) {
          var _name = _match[2];
          var injectionType = _name === 'decl' ? declInjections : mainInjections;
          injectionType[_key] = injectionType[_key] || [];

          injectionType[_key].push(injections[_key]);
        } else {
          hookInjections[_key] = hookInjections[_key] || [];

          hookInjections[_key].push(injections[_key]);
        }
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

  assembledSource += INJECT_SHADER_DECLARATIONS;
  assembledSource = injectShader(assembledSource, type, declInjections);
  assembledSource += getHookFunctions(hookFunctions[type], hookInjections);
  assembledSource += coreSource;
  assembledSource = injectShader(assembledSource, type, mainInjections);
  assembledSource = transpileShader(assembledSource, transpileToGLSL100 ? 100 : glslVersion, isVertex);
  return assembledSource;
}

function assembleGetUniforms(modules) {
  return function getUniforms(opts) {
    var uniforms = {};
    var _iteratorNormalCompletion2 = true;
    var _didIteratorError2 = false;
    var _iteratorError2 = undefined;

    try {
      for (var _iterator2 = modules[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
        var module = _step2.value;
        var moduleUniforms = module.getUniforms(opts, uniforms);
        Object.assign(uniforms, moduleUniforms);
      }
    } catch (err) {
      _didIteratorError2 = true;
      _iteratorError2 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion2 && _iterator2["return"] != null) {
          _iterator2["return"]();
        }
      } finally {
        if (_didIteratorError2) {
          throw _iteratorError2;
        }
      }
    }

    return uniforms;
  };
}

function getShaderType(_ref2) {
  var type = _ref2.type;
  return "\n#define SHADER_TYPE_".concat(SHADER_TYPE[type].toUpperCase(), "\n");
}

function getShaderName$1(_ref3) {
  var id = _ref3.id,
      source = _ref3.source,
      type = _ref3.type;
  var injectShaderName = id && typeof id === 'string' && source.indexOf('SHADER_NAME') === -1;
  return injectShaderName ? "\n#define SHADER_NAME ".concat(id, "_").concat(SHADER_TYPE[type], "\n\n") : '';
}

function getApplicationDefines() {
  var defines = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var count = 0;
  var sourceText = '';

  for (var define in defines) {
    if (count === 0) {
      sourceText += '\n// APPLICATION DEFINES\n';
    }

    count++;
    var value = defines[define];

    if (value || Number.isFinite(value)) {
      sourceText += "#define ".concat(define.toUpperCase(), " ").concat(defines[define], "\n");
    }
  }

  if (count === 0) {
    sourceText += '\n';
  }

  return sourceText;
}

function getHookFunctions(hookFunctions, hookInjections) {
  var result = '';

  for (var hookName in hookFunctions) {
    var hookFunction = hookFunctions[hookName];
    result += "void ".concat(hookFunction.signature, " {\n");

    if (hookFunction.header) {
      result += "  ".concat(hookFunction.header);
    }

    if (hookInjections[hookName]) {
      var injections = hookInjections[hookName];
      injections.sort(function (a, b) {
        return a.order - b.order;
      });
      var _iteratorNormalCompletion3 = true;
      var _didIteratorError3 = false;
      var _iteratorError3 = undefined;

      try {
        for (var _iterator3 = injections[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
          var injection = _step3.value;
          result += "  ".concat(injection.injection, "\n");
        }
      } catch (err) {
        _didIteratorError3 = true;
        _iteratorError3 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion3 && _iterator3["return"] != null) {
            _iterator3["return"]();
          }
        } finally {
          if (_didIteratorError3) {
            throw _iteratorError3;
          }
        }
      }
    }

    if (hookFunction.footer) {
      result += "  ".concat(hookFunction.footer);
    }

    result += '}\n';
  }

  return result;
}

function normalizeHookFunctions(hookFunctions) {
  var result = {
    vs: {},
    fs: {}
  };
  hookFunctions.forEach(function (hook) {
    var opts;

    if (typeof hook !== 'string') {
      opts = hook;
      hook = opts.hook;
    } else {
      opts = {};
    }

    hook = hook.trim();

    var _hook$split = hook.split(':'),
        _hook$split2 = _slicedToArray(_hook$split, 2),
        stage = _hook$split2[0],
        signature = _hook$split2[1];

    var name = hook.replace(/\(.+/, '');
    result[stage][name] = Object.assign(opts, {
      signature: signature
    });
  });
  return result;
}

var FS100 = "void main() {gl_FragColor = vec4(0);}";
var FS_GLES = "out vec4 transform_output;\nvoid main() {\n  transform_output = vec4(0);\n}";
var FS300 = "#version 300 es\n".concat(FS_GLES);
function getQualifierDetails(line, qualifiers) {
  qualifiers = Array.isArray(qualifiers) ? qualifiers : [qualifiers];
  var words = line.replace(/^\s+/, '').split(/\s+/);

  var _words = _slicedToArray(words, 3),
      qualifier = _words[0],
      type = _words[1],
      definition = _words[2];

  if (!qualifiers.includes(qualifier) || !type || !definition) {
    return null;
  }

  var name = definition.split(';')[0];
  return {
    qualifier: qualifier,
    type: type,
    name: name
  };
}
function getPassthroughFS() {
  var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
      _ref$version = _ref.version,
      version = _ref$version === void 0 ? 100 : _ref$version,
      input = _ref.input,
      inputType = _ref.inputType,
      output = _ref.output;

  if (!input) {
    if (version === 300) {
      return FS300;
    } else if (version > 300) {
      return "#version ".concat(version, "\n").concat(FS_GLES);
    }

    return FS100;
  }

  var outputValue = convertToVec4(input, inputType);

  if (version >= 300) {
    return "#version ".concat(version, " ").concat(version === 300 ? 'es' : '', "\nin ").concat(inputType, " ").concat(input, ";\nout vec4 ").concat(output, ";\nvoid main() {\n  ").concat(output, " = ").concat(outputValue, ";\n}");
  }

  return "varying ".concat(inputType, " ").concat(input, ";\nvoid main() {\n  gl_FragColor = ").concat(outputValue, ";\n}");
}
function typeToChannelSuffix(type) {
  switch (type) {
    case 'float':
      return 'x';

    case 'vec2':
      return 'xy';

    case 'vec3':
      return 'xyz';

    case 'vec4':
      return 'xyzw';

    default:
      assert$4(false);
      return null;
  }
}
function typeToChannelCount(type) {
  switch (type) {
    case 'float':
      return 1;

    case 'vec2':
      return 2;

    case 'vec3':
      return 3;

    case 'vec4':
      return 4;

    default:
      assert$4(false);
      return null;
  }
}
function convertToVec4(variable, type) {
  switch (type) {
    case 'float':
      return "vec4(".concat(variable, ", 0.0, 0.0, 1.0)");

    case 'vec2':
      return "vec4(".concat(variable, ", 0.0, 1.0)");

    case 'vec3':
      return "vec4(".concat(variable, ", 1.0)");

    case 'vec4':
      return variable;

    default:
      assert$4(false);
      return null;
  }
}

function assert$5(condition, message) {
  if (!condition) {
    throw new Error("math.gl assertion ".concat(message));
  }
}

var config = {};
config.EPSILON = 1e-12;
config.debug = false;
config.precision = 4;
config.printTypes = false;
config.printDegrees = false;
config.printRowMajor = true;

function round(value) {
  return Math.round(value / config.EPSILON) * config.EPSILON;
}

function formatValue$1(value) {
  var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
      _ref$precision = _ref.precision,
      precision = _ref$precision === void 0 ? config.precision || 4 : _ref$precision;

  value = round(value);
  return "".concat(parseFloat(value.toPrecision(precision)));
}
function isArray$1(value) {
  return Array.isArray(value) || ArrayBuffer.isView(value) && !(value instanceof DataView);
}

function duplicateArray(array) {
  return array.clone ? array.clone() : new Array(array.length);
}

function map(value, func, result) {
  if (isArray$1(value)) {
    result = result || duplicateArray(value);

    for (var i = 0; i < result.length && i < value.length; ++i) {
      result[i] = func(value[i], i, result);
    }

    return result;
  }

  return func(value);
}
function clamp(value, min, max) {
  return map(value, function (value) {
    return Math.max(min, Math.min(max, value));
  });
}
function lerp(a, b, t) {
  if (isArray$1(a)) {
    return a.map(function (ai, i) {
      return lerp(ai, b[i], t);
    });
  }

  return t * b + (1 - t) * a;
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

    if (isArray$1(a) && isArray$1(b)) {
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

function _isNativeFunction(fn) {
  return Function.toString.call(fn).indexOf("[native code]") !== -1;
}

function _wrapNativeSuper(Class) {
  var _cache = typeof Map === "function" ? new Map() : undefined;

  _wrapNativeSuper = function _wrapNativeSuper(Class) {
    if (Class === null || !_isNativeFunction(Class)) return Class;

    if (typeof Class !== "function") {
      throw new TypeError("Super expression must either be null or a function");
    }

    if (typeof _cache !== "undefined") {
      if (_cache.has(Class)) return _cache.get(Class);

      _cache.set(Class, Wrapper);
    }

    function Wrapper() {
      return _construct(Class, arguments, _getPrototypeOf(this).constructor);
    }

    Wrapper.prototype = Object.create(Class.prototype, {
      constructor: {
        value: Wrapper,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
    return _setPrototypeOf(Wrapper, Class);
  };

  return _wrapNativeSuper(Class);
}

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct$1(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _isNativeReflectConstruct$1() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

var MathArray = function (_Array) {
  _inherits(MathArray, _Array);

  var _super = _createSuper(MathArray);

  function MathArray() {
    _classCallCheck(this, MathArray);

    return _super.apply(this, arguments);
  }

  _createClass(MathArray, [{
    key: "clone",
    value: function clone() {
      return new this.constructor().copy(this);
    }
  }, {
    key: "from",
    value: function from(arrayOrObject) {
      return Array.isArray(arrayOrObject) ? this.copy(arrayOrObject) : this.fromObject(arrayOrObject);
    }
  }, {
    key: "fromArray",
    value: function fromArray(array) {
      var offset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

      for (var i = 0; i < this.ELEMENTS; ++i) {
        this[i] = array[i + offset];
      }

      return this.check();
    }
  }, {
    key: "to",
    value: function to(arrayOrObject) {
      if (arrayOrObject === this) {
        return this;
      }

      return isArray$1(arrayOrObject) ? this.toArray(arrayOrObject) : this.toObject(arrayOrObject);
    }
  }, {
    key: "toTarget",
    value: function toTarget(target) {
      return target ? this.to(target) : this;
    }
  }, {
    key: "toArray",
    value: function toArray() {
      var array = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
      var offset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

      for (var i = 0; i < this.ELEMENTS; ++i) {
        array[offset + i] = this[i];
      }

      return array;
    }
  }, {
    key: "toFloat32Array",
    value: function toFloat32Array() {
      return new Float32Array(this);
    }
  }, {
    key: "toString",
    value: function toString() {
      return this.formatString(config);
    }
  }, {
    key: "formatString",
    value: function formatString(opts) {
      var string = '';

      for (var i = 0; i < this.ELEMENTS; ++i) {
        string += (i > 0 ? ', ' : '') + formatValue$1(this[i], opts);
      }

      return "".concat(opts.printTypes ? this.constructor.name : '', "[").concat(string, "]");
    }
  }, {
    key: "equals",
    value: function equals$1(array) {
      if (!array || this.length !== array.length) {
        return false;
      }

      for (var i = 0; i < this.ELEMENTS; ++i) {
        if (!equals(this[i], array[i])) {
          return false;
        }
      }

      return true;
    }
  }, {
    key: "exactEquals",
    value: function exactEquals(array) {
      if (!array || this.length !== array.length) {
        return false;
      }

      for (var i = 0; i < this.ELEMENTS; ++i) {
        if (this[i] !== array[i]) {
          return false;
        }
      }

      return true;
    }
  }, {
    key: "negate",
    value: function negate() {
      for (var i = 0; i < this.ELEMENTS; ++i) {
        this[i] = -this[i];
      }

      return this.check();
    }
  }, {
    key: "lerp",
    value: function lerp(a, b, t) {
      if (t === undefined) {
        t = b;
        b = a;
        a = this;
      }

      for (var i = 0; i < this.ELEMENTS; ++i) {
        var ai = a[i];
        this[i] = ai + t * (b[i] - ai);
      }

      return this.check();
    }
  }, {
    key: "min",
    value: function min(vector) {
      for (var i = 0; i < this.ELEMENTS; ++i) {
        this[i] = Math.min(vector[i], this[i]);
      }

      return this.check();
    }
  }, {
    key: "max",
    value: function max(vector) {
      for (var i = 0; i < this.ELEMENTS; ++i) {
        this[i] = Math.max(vector[i], this[i]);
      }

      return this.check();
    }
  }, {
    key: "clamp",
    value: function clamp(minVector, maxVector) {
      for (var i = 0; i < this.ELEMENTS; ++i) {
        this[i] = Math.min(Math.max(this[i], minVector[i]), maxVector[i]);
      }

      return this.check();
    }
  }, {
    key: "add",
    value: function add() {
      for (var _len = arguments.length, vectors = new Array(_len), _key = 0; _key < _len; _key++) {
        vectors[_key] = arguments[_key];
      }

      for (var _i = 0, _vectors = vectors; _i < _vectors.length; _i++) {
        var vector = _vectors[_i];

        for (var i = 0; i < this.ELEMENTS; ++i) {
          this[i] += vector[i];
        }
      }

      return this.check();
    }
  }, {
    key: "subtract",
    value: function subtract() {
      for (var _len2 = arguments.length, vectors = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        vectors[_key2] = arguments[_key2];
      }

      for (var _i2 = 0, _vectors2 = vectors; _i2 < _vectors2.length; _i2++) {
        var vector = _vectors2[_i2];

        for (var i = 0; i < this.ELEMENTS; ++i) {
          this[i] -= vector[i];
        }
      }

      return this.check();
    }
  }, {
    key: "scale",
    value: function scale(_scale) {
      if (Array.isArray(_scale)) {
        return this.multiply(_scale);
      }

      for (var i = 0; i < this.ELEMENTS; ++i) {
        this[i] *= _scale;
      }

      return this.check();
    }
  }, {
    key: "sub",
    value: function sub(a) {
      return this.subtract(a);
    }
  }, {
    key: "setScalar",
    value: function setScalar(a) {
      for (var i = 0; i < this.ELEMENTS; ++i) {
        this[i] = a;
      }

      return this.check();
    }
  }, {
    key: "addScalar",
    value: function addScalar(a) {
      for (var i = 0; i < this.ELEMENTS; ++i) {
        this[i] += a;
      }

      return this.check();
    }
  }, {
    key: "subScalar",
    value: function subScalar(a) {
      return this.addScalar(-a);
    }
  }, {
    key: "multiplyScalar",
    value: function multiplyScalar(scalar) {
      for (var i = 0; i < this.ELEMENTS; ++i) {
        this[i] *= scalar;
      }

      return this.check();
    }
  }, {
    key: "divideScalar",
    value: function divideScalar(a) {
      return this.scale(1 / a);
    }
  }, {
    key: "clampScalar",
    value: function clampScalar(min, max) {
      for (var i = 0; i < this.ELEMENTS; ++i) {
        this[i] = Math.min(Math.max(this[i], min), max);
      }

      return this.check();
    }
  }, {
    key: "multiplyByScalar",
    value: function multiplyByScalar(scalar) {
      return this.scale(scalar);
    }
  }, {
    key: "check",
    value: function check() {
      if (config.debug && !this.validate()) {
        throw new Error("math.gl: ".concat(this.constructor.name, " some fields set to invalid numbers'"));
      }

      return this;
    }
  }, {
    key: "validate",
    value: function validate() {
      var valid = this.length === this.ELEMENTS;

      for (var i = 0; i < this.ELEMENTS; ++i) {
        valid = valid && Number.isFinite(this[i]);
      }

      return valid;
    }
  }, {
    key: "ELEMENTS",
    get: function get() {
      assert$5(false);
      return 0;
    }
  }, {
    key: "RANK",
    get: function get() {
      assert$5(false);
      return 0;
    }
  }, {
    key: "elements",
    get: function get() {
      return this;
    }
  }]);

  return MathArray;
}(_wrapNativeSuper(Array));

function validateVector(v, length) {
  if (v.length !== length) {
    return false;
  }

  for (var i = 0; i < v.length; ++i) {
    if (!Number.isFinite(v[i])) {
      return false;
    }
  }

  return true;
}
function checkNumber(value) {
  if (!Number.isFinite(value)) {
    throw new Error("Invalid number ".concat(value));
  }

  return value;
}
function checkVector(v, length) {
  var callerName = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '';

  if (config.debug && !validateVector(v, length)) {
    throw new Error("math.gl: ".concat(callerName, " some fields set to invalid numbers'"));
  }

  return v;
}
var map$1 = {};
function deprecated(method, version) {
  if (!map$1[method]) {
    map$1[method] = true;
    console.warn("".concat(method, " has been removed in version ").concat(version, ", see upgrade guide for more information"));
  }
}

function _createSuper$1(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct$2(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _isNativeReflectConstruct$2() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

var Vector = function (_MathArray) {
  _inherits(Vector, _MathArray);

  var _super = _createSuper$1(Vector);

  function Vector() {
    _classCallCheck(this, Vector);

    return _super.apply(this, arguments);
  }

  _createClass(Vector, [{
    key: "copy",
    value: function copy(vector) {
      assert$5(false);
      return this;
    }
  }, {
    key: "len",
    value: function len() {
      return Math.sqrt(this.lengthSquared());
    }
  }, {
    key: "magnitude",
    value: function magnitude() {
      return this.len();
    }
  }, {
    key: "lengthSquared",
    value: function lengthSquared() {
      var length = 0;

      for (var i = 0; i < this.ELEMENTS; ++i) {
        length += this[i] * this[i];
      }

      return length;
    }
  }, {
    key: "magnitudeSquared",
    value: function magnitudeSquared() {
      return this.lengthSquared();
    }
  }, {
    key: "distance",
    value: function distance(mathArray) {
      return Math.sqrt(this.distanceSquared(mathArray));
    }
  }, {
    key: "distanceSquared",
    value: function distanceSquared(mathArray) {
      var length = 0;

      for (var i = 0; i < this.ELEMENTS; ++i) {
        var dist = this[i] - mathArray[i];
        length += dist * dist;
      }

      return checkNumber(length);
    }
  }, {
    key: "dot",
    value: function dot(mathArray) {
      var product = 0;

      for (var i = 0; i < this.ELEMENTS; ++i) {
        product += this[i] * mathArray[i];
      }

      return checkNumber(product);
    }
  }, {
    key: "normalize",
    value: function normalize() {
      var length = this.magnitude();

      if (length !== 0) {
        for (var i = 0; i < this.ELEMENTS; ++i) {
          this[i] /= length;
        }
      }

      return this.check();
    }
  }, {
    key: "multiply",
    value: function multiply() {
      for (var _len = arguments.length, vectors = new Array(_len), _key = 0; _key < _len; _key++) {
        vectors[_key] = arguments[_key];
      }

      for (var _i = 0, _vectors = vectors; _i < _vectors.length; _i++) {
        var vector = _vectors[_i];

        for (var i = 0; i < this.ELEMENTS; ++i) {
          this[i] *= vector[i];
        }
      }

      return this.check();
    }
  }, {
    key: "divide",
    value: function divide() {
      for (var _len2 = arguments.length, vectors = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        vectors[_key2] = arguments[_key2];
      }

      for (var _i2 = 0, _vectors2 = vectors; _i2 < _vectors2.length; _i2++) {
        var vector = _vectors2[_i2];

        for (var i = 0; i < this.ELEMENTS; ++i) {
          this[i] /= vector[i];
        }
      }

      return this.check();
    }
  }, {
    key: "lengthSq",
    value: function lengthSq() {
      return this.lengthSquared();
    }
  }, {
    key: "distanceTo",
    value: function distanceTo(vector) {
      return this.distance(vector);
    }
  }, {
    key: "distanceToSquared",
    value: function distanceToSquared(vector) {
      return this.distanceSquared(vector);
    }
  }, {
    key: "getComponent",
    value: function getComponent(i) {
      assert$5(i >= 0 && i < this.ELEMENTS, 'index is out of range');
      return checkNumber(this[i]);
    }
  }, {
    key: "setComponent",
    value: function setComponent(i, value) {
      assert$5(i >= 0 && i < this.ELEMENTS, 'index is out of range');
      this[i] = value;
      return this.check();
    }
  }, {
    key: "addVectors",
    value: function addVectors(a, b) {
      return this.copy(a).add(b);
    }
  }, {
    key: "subVectors",
    value: function subVectors(a, b) {
      return this.copy(a).subtract(b);
    }
  }, {
    key: "multiplyVectors",
    value: function multiplyVectors(a, b) {
      return this.copy(a).multiply(b);
    }
  }, {
    key: "addScaledVector",
    value: function addScaledVector(a, b) {
      return this.add(new this.constructor(a).multiplyScalar(b));
    }
  }, {
    key: "x",
    get: function get() {
      return this[0];
    },
    set: function set(value) {
      this[0] = checkNumber(value);
    }
  }, {
    key: "y",
    get: function get() {
      return this[1];
    },
    set: function set(value) {
      this[1] = checkNumber(value);
    }
  }]);

  return Vector;
}(MathArray);

/**
 * Common utilities
 * @module glMatrix
 */
// Configuration Constants
var EPSILON = 0.000001;
var ARRAY_TYPE = typeof Float32Array !== 'undefined' ? Float32Array : Array;
if (!Math.hypot) Math.hypot = function () {
  var y = 0,
      i = arguments.length;

  while (i--) {
    y += arguments[i] * arguments[i];
  }

  return Math.sqrt(y);
};

/**
 * 2 Dimensional Vector
 * @module vec2
 */

/**
 * Creates a new, empty vec2
 *
 * @returns {vec2} a new 2D vector
 */

function create() {
  var out = new ARRAY_TYPE(2);

  if (ARRAY_TYPE != Float32Array) {
    out[0] = 0;
    out[1] = 0;
  }

  return out;
}
/**
 * Adds two vec2's
 *
 * @param {vec2} out the receiving vector
 * @param {ReadonlyVec2} a the first operand
 * @param {ReadonlyVec2} b the second operand
 * @returns {vec2} out
 */

function add(out, a, b) {
  out[0] = a[0] + b[0];
  out[1] = a[1] + b[1];
  return out;
}
/**
 * Negates the components of a vec2
 *
 * @param {vec2} out the receiving vector
 * @param {ReadonlyVec2} a vector to negate
 * @returns {vec2} out
 */

function negate(out, a) {
  out[0] = -a[0];
  out[1] = -a[1];
  return out;
}
/**
 * Performs a linear interpolation between two vec2's
 *
 * @param {vec2} out the receiving vector
 * @param {ReadonlyVec2} a the first operand
 * @param {ReadonlyVec2} b the second operand
 * @param {Number} t interpolation amount, in the range [0-1], between the two inputs
 * @returns {vec2} out
 */

function lerp$1(out, a, b, t) {
  var ax = a[0],
      ay = a[1];
  out[0] = ax + t * (b[0] - ax);
  out[1] = ay + t * (b[1] - ay);
  return out;
}
/**
 * Transforms the vec2 with a mat2
 *
 * @param {vec2} out the receiving vector
 * @param {ReadonlyVec2} a the vector to transform
 * @param {ReadonlyMat2} m matrix to transform with
 * @returns {vec2} out
 */

function transformMat2(out, a, m) {
  var x = a[0],
      y = a[1];
  out[0] = m[0] * x + m[2] * y;
  out[1] = m[1] * x + m[3] * y;
  return out;
}
/**
 * Transforms the vec2 with a mat2d
 *
 * @param {vec2} out the receiving vector
 * @param {ReadonlyVec2} a the vector to transform
 * @param {ReadonlyMat2d} m matrix to transform with
 * @returns {vec2} out
 */

function transformMat2d(out, a, m) {
  var x = a[0],
      y = a[1];
  out[0] = m[0] * x + m[2] * y + m[4];
  out[1] = m[1] * x + m[3] * y + m[5];
  return out;
}
/**
 * Transforms the vec2 with a mat3
 * 3rd vector component is implicitly '1'
 *
 * @param {vec2} out the receiving vector
 * @param {ReadonlyVec2} a the vector to transform
 * @param {ReadonlyMat3} m matrix to transform with
 * @returns {vec2} out
 */

function transformMat3(out, a, m) {
  var x = a[0],
      y = a[1];
  out[0] = m[0] * x + m[3] * y + m[6];
  out[1] = m[1] * x + m[4] * y + m[7];
  return out;
}
/**
 * Transforms the vec2 with a mat4
 * 3rd vector component is implicitly '0'
 * 4th vector component is implicitly '1'
 *
 * @param {vec2} out the receiving vector
 * @param {ReadonlyVec2} a the vector to transform
 * @param {ReadonlyMat4} m matrix to transform with
 * @returns {vec2} out
 */

function transformMat4(out, a, m) {
  var x = a[0];
  var y = a[1];
  out[0] = m[0] * x + m[4] * y + m[12];
  out[1] = m[1] * x + m[5] * y + m[13];
  return out;
}
/**
 * Perform some operation over an array of vec2s.
 *
 * @param {Array} a the array of vectors to iterate over
 * @param {Number} stride Number of elements between the start of each vec2. If 0 assumes tightly packed
 * @param {Number} offset Number of elements to skip at the beginning of the array
 * @param {Number} count Number of vec2s to iterate over. If 0 iterates over entire array
 * @param {Function} fn Function to call for each vector in the array
 * @param {Object} [arg] additional argument to pass to fn
 * @returns {Array} a
 * @function
 */

var forEach = function () {
  var vec = create();
  return function (a, stride, offset, count, fn, arg) {
    var i, l;

    if (!stride) {
      stride = 2;
    }

    if (!offset) {
      offset = 0;
    }

    if (count) {
      l = Math.min(count * stride + offset, a.length);
    } else {
      l = a.length;
    }

    for (i = offset; i < l; i += stride) {
      vec[0] = a[i];
      vec[1] = a[i + 1];
      fn(vec, vec, arg);
      a[i] = vec[0];
      a[i + 1] = vec[1];
    }

    return a;
  };
}();

function vec2_transformMat4AsVector(out, a, m) {
  var x = a[0];
  var y = a[1];
  var w = m[3] * x + m[7] * y || 1.0;
  out[0] = (m[0] * x + m[4] * y) / w;
  out[1] = (m[1] * x + m[5] * y) / w;
  return out;
}
function vec3_transformMat4AsVector(out, a, m) {
  var x = a[0];
  var y = a[1];
  var z = a[2];
  var w = m[3] * x + m[7] * y + m[11] * z || 1.0;
  out[0] = (m[0] * x + m[4] * y + m[8] * z) / w;
  out[1] = (m[1] * x + m[5] * y + m[9] * z) / w;
  out[2] = (m[2] * x + m[6] * y + m[10] * z) / w;
  return out;
}
function vec3_transformMat2(out, a, m) {
  var x = a[0];
  var y = a[1];
  out[0] = m[0] * x + m[2] * y;
  out[1] = m[1] * x + m[3] * y;
  out[2] = a[2];
  return out;
}
function vec4_transformMat3(out, a, m) {
  var x = a[0];
  var y = a[1];
  var z = a[2];
  out[0] = m[0] * x + m[3] * y + m[6] * z;
  out[1] = m[1] * x + m[4] * y + m[7] * z;
  out[2] = m[2] * x + m[5] * y + m[8] * z;
  out[3] = a[3];
  return out;
}

/**
 * 3 Dimensional Vector
 * @module vec3
 */

/**
 * Creates a new, empty vec3
 *
 * @returns {vec3} a new 3D vector
 */

function create$1() {
  var out = new ARRAY_TYPE(3);

  if (ARRAY_TYPE != Float32Array) {
    out[0] = 0;
    out[1] = 0;
    out[2] = 0;
  }

  return out;
}
/**
 * Calculates the length of a vec3
 *
 * @param {ReadonlyVec3} a vector to calculate length of
 * @returns {Number} length of a
 */

function length(a) {
  var x = a[0];
  var y = a[1];
  var z = a[2];
  return Math.hypot(x, y, z);
}
/**
 * Creates a new vec3 initialized with the given values
 *
 * @param {Number} x X component
 * @param {Number} y Y component
 * @param {Number} z Z component
 * @returns {vec3} a new 3D vector
 */

function fromValues(x, y, z) {
  var out = new ARRAY_TYPE(3);
  out[0] = x;
  out[1] = y;
  out[2] = z;
  return out;
}
/**
 * Subtracts vector b from vector a
 *
 * @param {vec3} out the receiving vector
 * @param {ReadonlyVec3} a the first operand
 * @param {ReadonlyVec3} b the second operand
 * @returns {vec3} out
 */

function subtract(out, a, b) {
  out[0] = a[0] - b[0];
  out[1] = a[1] - b[1];
  out[2] = a[2] - b[2];
  return out;
}
/**
 * Negates the components of a vec3
 *
 * @param {vec3} out the receiving vector
 * @param {ReadonlyVec3} a vector to negate
 * @returns {vec3} out
 */

function negate$1(out, a) {
  out[0] = -a[0];
  out[1] = -a[1];
  out[2] = -a[2];
  return out;
}
/**
 * Normalize a vec3
 *
 * @param {vec3} out the receiving vector
 * @param {ReadonlyVec3} a vector to normalize
 * @returns {vec3} out
 */

function normalize(out, a) {
  var x = a[0];
  var y = a[1];
  var z = a[2];
  var len = x * x + y * y + z * z;

  if (len > 0) {
    //TODO: evaluate use of glm_invsqrt here?
    len = 1 / Math.sqrt(len);
  }

  out[0] = a[0] * len;
  out[1] = a[1] * len;
  out[2] = a[2] * len;
  return out;
}
/**
 * Calculates the dot product of two vec3's
 *
 * @param {ReadonlyVec3} a the first operand
 * @param {ReadonlyVec3} b the second operand
 * @returns {Number} dot product of a and b
 */

function dot(a, b) {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}
/**
 * Computes the cross product of two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {ReadonlyVec3} a the first operand
 * @param {ReadonlyVec3} b the second operand
 * @returns {vec3} out
 */

function cross(out, a, b) {
  var ax = a[0],
      ay = a[1],
      az = a[2];
  var bx = b[0],
      by = b[1],
      bz = b[2];
  out[0] = ay * bz - az * by;
  out[1] = az * bx - ax * bz;
  out[2] = ax * by - ay * bx;
  return out;
}
/**
 * Transforms the vec3 with a mat4.
 * 4th vector component is implicitly '1'
 *
 * @param {vec3} out the receiving vector
 * @param {ReadonlyVec3} a the vector to transform
 * @param {ReadonlyMat4} m matrix to transform with
 * @returns {vec3} out
 */

function transformMat4$1(out, a, m) {
  var x = a[0],
      y = a[1],
      z = a[2];
  var w = m[3] * x + m[7] * y + m[11] * z + m[15];
  w = w || 1.0;
  out[0] = (m[0] * x + m[4] * y + m[8] * z + m[12]) / w;
  out[1] = (m[1] * x + m[5] * y + m[9] * z + m[13]) / w;
  out[2] = (m[2] * x + m[6] * y + m[10] * z + m[14]) / w;
  return out;
}
/**
 * Transforms the vec3 with a mat3.
 *
 * @param {vec3} out the receiving vector
 * @param {ReadonlyVec3} a the vector to transform
 * @param {ReadonlyMat3} m the 3x3 matrix to transform with
 * @returns {vec3} out
 */

function transformMat3$1(out, a, m) {
  var x = a[0],
      y = a[1],
      z = a[2];
  out[0] = x * m[0] + y * m[3] + z * m[6];
  out[1] = x * m[1] + y * m[4] + z * m[7];
  out[2] = x * m[2] + y * m[5] + z * m[8];
  return out;
}
/**
 * Transforms the vec3 with a quat
 * Can also be used for dual quaternions. (Multiply it with the real part)
 *
 * @param {vec3} out the receiving vector
 * @param {ReadonlyVec3} a the vector to transform
 * @param {ReadonlyQuat} q quaternion to transform with
 * @returns {vec3} out
 */

function transformQuat(out, a, q) {
  // benchmarks: https://jsperf.com/quaternion-transform-vec3-implementations-fixed
  var qx = q[0],
      qy = q[1],
      qz = q[2],
      qw = q[3];
  var x = a[0],
      y = a[1],
      z = a[2]; // var qvec = [qx, qy, qz];
  // var uv = vec3.cross([], qvec, a);

  var uvx = qy * z - qz * y,
      uvy = qz * x - qx * z,
      uvz = qx * y - qy * x; // var uuv = vec3.cross([], qvec, uv);

  var uuvx = qy * uvz - qz * uvy,
      uuvy = qz * uvx - qx * uvz,
      uuvz = qx * uvy - qy * uvx; // vec3.scale(uv, uv, 2 * w);

  var w2 = qw * 2;
  uvx *= w2;
  uvy *= w2;
  uvz *= w2; // vec3.scale(uuv, uuv, 2);

  uuvx *= 2;
  uuvy *= 2;
  uuvz *= 2; // return vec3.add(out, a, vec3.add(out, uv, uuv));

  out[0] = x + uvx + uuvx;
  out[1] = y + uvy + uuvy;
  out[2] = z + uvz + uuvz;
  return out;
}
/**
 * Rotate a 3D vector around the x-axis
 * @param {vec3} out The receiving vec3
 * @param {ReadonlyVec3} a The vec3 point to rotate
 * @param {ReadonlyVec3} b The origin of the rotation
 * @param {Number} rad The angle of rotation in radians
 * @returns {vec3} out
 */

function rotateX(out, a, b, rad) {
  var p = [],
      r = []; //Translate point to the origin

  p[0] = a[0] - b[0];
  p[1] = a[1] - b[1];
  p[2] = a[2] - b[2]; //perform rotation

  r[0] = p[0];
  r[1] = p[1] * Math.cos(rad) - p[2] * Math.sin(rad);
  r[2] = p[1] * Math.sin(rad) + p[2] * Math.cos(rad); //translate to correct position

  out[0] = r[0] + b[0];
  out[1] = r[1] + b[1];
  out[2] = r[2] + b[2];
  return out;
}
/**
 * Rotate a 3D vector around the y-axis
 * @param {vec3} out The receiving vec3
 * @param {ReadonlyVec3} a The vec3 point to rotate
 * @param {ReadonlyVec3} b The origin of the rotation
 * @param {Number} rad The angle of rotation in radians
 * @returns {vec3} out
 */

function rotateY(out, a, b, rad) {
  var p = [],
      r = []; //Translate point to the origin

  p[0] = a[0] - b[0];
  p[1] = a[1] - b[1];
  p[2] = a[2] - b[2]; //perform rotation

  r[0] = p[2] * Math.sin(rad) + p[0] * Math.cos(rad);
  r[1] = p[1];
  r[2] = p[2] * Math.cos(rad) - p[0] * Math.sin(rad); //translate to correct position

  out[0] = r[0] + b[0];
  out[1] = r[1] + b[1];
  out[2] = r[2] + b[2];
  return out;
}
/**
 * Rotate a 3D vector around the z-axis
 * @param {vec3} out The receiving vec3
 * @param {ReadonlyVec3} a The vec3 point to rotate
 * @param {ReadonlyVec3} b The origin of the rotation
 * @param {Number} rad The angle of rotation in radians
 * @returns {vec3} out
 */

function rotateZ(out, a, b, rad) {
  var p = [],
      r = []; //Translate point to the origin

  p[0] = a[0] - b[0];
  p[1] = a[1] - b[1];
  p[2] = a[2] - b[2]; //perform rotation

  r[0] = p[0] * Math.cos(rad) - p[1] * Math.sin(rad);
  r[1] = p[0] * Math.sin(rad) + p[1] * Math.cos(rad);
  r[2] = p[2]; //translate to correct position

  out[0] = r[0] + b[0];
  out[1] = r[1] + b[1];
  out[2] = r[2] + b[2];
  return out;
}
/**
 * Get the angle between two 3D vectors
 * @param {ReadonlyVec3} a The first operand
 * @param {ReadonlyVec3} b The second operand
 * @returns {Number} The angle in radians
 */

function angle(a, b) {
  var ax = a[0],
      ay = a[1],
      az = a[2],
      bx = b[0],
      by = b[1],
      bz = b[2],
      mag1 = Math.sqrt(ax * ax + ay * ay + az * az),
      mag2 = Math.sqrt(bx * bx + by * by + bz * bz),
      mag = mag1 * mag2,
      cosine = mag && dot(a, b) / mag;
  return Math.acos(Math.min(Math.max(cosine, -1), 1));
}
/**
 * Alias for {@link vec3.subtract}
 * @function
 */

var sub = subtract;
/**
 * Alias for {@link vec3.length}
 * @function
 */

var len = length;
/**
 * Perform some operation over an array of vec3s.
 *
 * @param {Array} a the array of vectors to iterate over
 * @param {Number} stride Number of elements between the start of each vec3. If 0 assumes tightly packed
 * @param {Number} offset Number of elements to skip at the beginning of the array
 * @param {Number} count Number of vec3s to iterate over. If 0 iterates over entire array
 * @param {Function} fn Function to call for each vector in the array
 * @param {Object} [arg] additional argument to pass to fn
 * @returns {Array} a
 * @function
 */

var forEach$1 = function () {
  var vec = create$1();
  return function (a, stride, offset, count, fn, arg) {
    var i, l;

    if (!stride) {
      stride = 3;
    }

    if (!offset) {
      offset = 0;
    }

    if (count) {
      l = Math.min(count * stride + offset, a.length);
    } else {
      l = a.length;
    }

    for (i = offset; i < l; i += stride) {
      vec[0] = a[i];
      vec[1] = a[i + 1];
      vec[2] = a[i + 2];
      fn(vec, vec, arg);
      a[i] = vec[0];
      a[i + 1] = vec[1];
      a[i + 2] = vec[2];
    }

    return a;
  };
}();

function _createSuper$2(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct$3(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _isNativeReflectConstruct$3() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }
var ORIGIN = [0, 0, 0];
var constants = {};

var Vector3 = function (_Vector) {
  _inherits(Vector3, _Vector);

  var _super = _createSuper$2(Vector3);

  _createClass(Vector3, null, [{
    key: "ZERO",
    get: function get() {
      return constants.ZERO = constants.ZERO || Object.freeze(new Vector3(0, 0, 0, 0));
    }
  }]);

  function Vector3() {
    var _this;

    var x = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
    var y = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
    var z = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;

    _classCallCheck(this, Vector3);

    _this = _super.call(this, -0, -0, -0);

    if (arguments.length === 1 && isArray$1(x)) {
      _this.copy(x);
    } else {
      if (config.debug) {
        checkNumber(x);
        checkNumber(y);
        checkNumber(z);
      }

      _this[0] = x;
      _this[1] = y;
      _this[2] = z;
    }

    return _this;
  }

  _createClass(Vector3, [{
    key: "set",
    value: function set(x, y, z) {
      this[0] = x;
      this[1] = y;
      this[2] = z;
      return this.check();
    }
  }, {
    key: "copy",
    value: function copy(array) {
      this[0] = array[0];
      this[1] = array[1];
      this[2] = array[2];
      return this.check();
    }
  }, {
    key: "fromObject",
    value: function fromObject(object) {
      if (config.debug) {
        checkNumber(object.x);
        checkNumber(object.y);
        checkNumber(object.z);
      }

      this[0] = object.x;
      this[1] = object.y;
      this[2] = object.z;
      return this.check();
    }
  }, {
    key: "toObject",
    value: function toObject(object) {
      object.x = this[0];
      object.y = this[1];
      object.z = this[2];
      return object;
    }
  }, {
    key: "angle",
    value: function angle$1(vector) {
      return angle(this, vector);
    }
  }, {
    key: "cross",
    value: function cross$1(vector) {
      cross(this, this, vector);
      return this.check();
    }
  }, {
    key: "rotateX",
    value: function rotateX$1(_ref) {
      var radians = _ref.radians,
          _ref$origin = _ref.origin,
          origin = _ref$origin === void 0 ? ORIGIN : _ref$origin;
      rotateX(this, this, origin, radians);
      return this.check();
    }
  }, {
    key: "rotateY",
    value: function rotateY$1(_ref2) {
      var radians = _ref2.radians,
          _ref2$origin = _ref2.origin,
          origin = _ref2$origin === void 0 ? ORIGIN : _ref2$origin;
      rotateY(this, this, origin, radians);
      return this.check();
    }
  }, {
    key: "rotateZ",
    value: function rotateZ$1(_ref3) {
      var radians = _ref3.radians,
          _ref3$origin = _ref3.origin,
          origin = _ref3$origin === void 0 ? ORIGIN : _ref3$origin;
      rotateZ(this, this, origin, radians);
      return this.check();
    }
  }, {
    key: "transform",
    value: function transform(matrix4) {
      return this.transformAsPoint(matrix4);
    }
  }, {
    key: "transformAsPoint",
    value: function transformAsPoint(matrix4) {
      transformMat4$1(this, this, matrix4);
      return this.check();
    }
  }, {
    key: "transformAsVector",
    value: function transformAsVector(matrix4) {
      vec3_transformMat4AsVector(this, this, matrix4);
      return this.check();
    }
  }, {
    key: "transformByMatrix3",
    value: function transformByMatrix3(matrix3) {
      transformMat3$1(this, this, matrix3);
      return this.check();
    }
  }, {
    key: "transformByMatrix2",
    value: function transformByMatrix2(matrix2) {
      vec3_transformMat2(this, this, matrix2);
      return this.check();
    }
  }, {
    key: "transformByQuaternion",
    value: function transformByQuaternion(quaternion) {
      transformQuat(this, this, quaternion);
      return this.check();
    }
  }, {
    key: "ELEMENTS",
    get: function get() {
      return 3;
    }
  }, {
    key: "z",
    get: function get() {
      return this[2];
    },
    set: function set(value) {
      this[2] = checkNumber(value);
    }
  }]);

  return Vector3;
}(Vector);

function _createSuper$3(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct$4(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _isNativeReflectConstruct$4() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

var Matrix = function (_MathArray) {
  _inherits(Matrix, _MathArray);

  var _super = _createSuper$3(Matrix);

  function Matrix() {
    _classCallCheck(this, Matrix);

    return _super.apply(this, arguments);
  }

  _createClass(Matrix, [{
    key: "toString",
    value: function toString() {
      var string = '[';

      if (config.printRowMajor) {
        string += 'row-major:';

        for (var row = 0; row < this.RANK; ++row) {
          for (var col = 0; col < this.RANK; ++col) {
            string += " ".concat(this[col * this.RANK + row]);
          }
        }
      } else {
        string += 'column-major:';

        for (var i = 0; i < this.ELEMENTS; ++i) {
          string += " ".concat(this[i]);
        }
      }

      string += ']';
      return string;
    }
  }, {
    key: "getElementIndex",
    value: function getElementIndex(row, col) {
      return col * this.RANK + row;
    }
  }, {
    key: "getElement",
    value: function getElement(row, col) {
      return this[col * this.RANK + row];
    }
  }, {
    key: "setElement",
    value: function setElement(row, col, value) {
      this[col * this.RANK + row] = checkNumber(value);
      return this;
    }
  }, {
    key: "getColumn",
    value: function getColumn(columnIndex) {
      var result = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : new Array(this.RANK).fill(-0);
      var firstIndex = columnIndex * this.RANK;

      for (var i = 0; i < this.RANK; ++i) {
        result[i] = this[firstIndex + i];
      }

      return result;
    }
  }, {
    key: "setColumn",
    value: function setColumn(columnIndex, columnVector) {
      var firstIndex = columnIndex * this.RANK;

      for (var i = 0; i < this.RANK; ++i) {
        this[firstIndex + i] = columnVector[i];
      }

      return this;
    }
  }]);

  return Matrix;
}(MathArray);

/**
 * Set a mat4 to the identity matrix
 *
 * @param {mat4} out the receiving matrix
 * @returns {mat4} out
 */

function identity(out) {
  out[0] = 1;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 0;
  out[5] = 1;
  out[6] = 0;
  out[7] = 0;
  out[8] = 0;
  out[9] = 0;
  out[10] = 1;
  out[11] = 0;
  out[12] = 0;
  out[13] = 0;
  out[14] = 0;
  out[15] = 1;
  return out;
}
/**
 * Transpose the values of a mat4
 *
 * @param {mat4} out the receiving matrix
 * @param {ReadonlyMat4} a the source matrix
 * @returns {mat4} out
 */

function transpose(out, a) {
  // If we are transposing ourselves we can skip a few steps but have to cache some values
  if (out === a) {
    var a01 = a[1],
        a02 = a[2],
        a03 = a[3];
    var a12 = a[6],
        a13 = a[7];
    var a23 = a[11];
    out[1] = a[4];
    out[2] = a[8];
    out[3] = a[12];
    out[4] = a01;
    out[6] = a[9];
    out[7] = a[13];
    out[8] = a02;
    out[9] = a12;
    out[11] = a[14];
    out[12] = a03;
    out[13] = a13;
    out[14] = a23;
  } else {
    out[0] = a[0];
    out[1] = a[4];
    out[2] = a[8];
    out[3] = a[12];
    out[4] = a[1];
    out[5] = a[5];
    out[6] = a[9];
    out[7] = a[13];
    out[8] = a[2];
    out[9] = a[6];
    out[10] = a[10];
    out[11] = a[14];
    out[12] = a[3];
    out[13] = a[7];
    out[14] = a[11];
    out[15] = a[15];
  }

  return out;
}
/**
 * Inverts a mat4
 *
 * @param {mat4} out the receiving matrix
 * @param {ReadonlyMat4} a the source matrix
 * @returns {mat4} out
 */

function invert(out, a) {
  var a00 = a[0],
      a01 = a[1],
      a02 = a[2],
      a03 = a[3];
  var a10 = a[4],
      a11 = a[5],
      a12 = a[6],
      a13 = a[7];
  var a20 = a[8],
      a21 = a[9],
      a22 = a[10],
      a23 = a[11];
  var a30 = a[12],
      a31 = a[13],
      a32 = a[14],
      a33 = a[15];
  var b00 = a00 * a11 - a01 * a10;
  var b01 = a00 * a12 - a02 * a10;
  var b02 = a00 * a13 - a03 * a10;
  var b03 = a01 * a12 - a02 * a11;
  var b04 = a01 * a13 - a03 * a11;
  var b05 = a02 * a13 - a03 * a12;
  var b06 = a20 * a31 - a21 * a30;
  var b07 = a20 * a32 - a22 * a30;
  var b08 = a20 * a33 - a23 * a30;
  var b09 = a21 * a32 - a22 * a31;
  var b10 = a21 * a33 - a23 * a31;
  var b11 = a22 * a33 - a23 * a32; // Calculate the determinant

  var det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;

  if (!det) {
    return null;
  }

  det = 1.0 / det;
  out[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
  out[1] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
  out[2] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
  out[3] = (a22 * b04 - a21 * b05 - a23 * b03) * det;
  out[4] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
  out[5] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
  out[6] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
  out[7] = (a20 * b05 - a22 * b02 + a23 * b01) * det;
  out[8] = (a10 * b10 - a11 * b08 + a13 * b06) * det;
  out[9] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
  out[10] = (a30 * b04 - a31 * b02 + a33 * b00) * det;
  out[11] = (a21 * b02 - a20 * b04 - a23 * b00) * det;
  out[12] = (a11 * b07 - a10 * b09 - a12 * b06) * det;
  out[13] = (a00 * b09 - a01 * b07 + a02 * b06) * det;
  out[14] = (a31 * b01 - a30 * b03 - a32 * b00) * det;
  out[15] = (a20 * b03 - a21 * b01 + a22 * b00) * det;
  return out;
}
/**
 * Calculates the determinant of a mat4
 *
 * @param {ReadonlyMat4} a the source matrix
 * @returns {Number} determinant of a
 */

function determinant(a) {
  var a00 = a[0],
      a01 = a[1],
      a02 = a[2],
      a03 = a[3];
  var a10 = a[4],
      a11 = a[5],
      a12 = a[6],
      a13 = a[7];
  var a20 = a[8],
      a21 = a[9],
      a22 = a[10],
      a23 = a[11];
  var a30 = a[12],
      a31 = a[13],
      a32 = a[14],
      a33 = a[15];
  var b00 = a00 * a11 - a01 * a10;
  var b01 = a00 * a12 - a02 * a10;
  var b02 = a00 * a13 - a03 * a10;
  var b03 = a01 * a12 - a02 * a11;
  var b04 = a01 * a13 - a03 * a11;
  var b05 = a02 * a13 - a03 * a12;
  var b06 = a20 * a31 - a21 * a30;
  var b07 = a20 * a32 - a22 * a30;
  var b08 = a20 * a33 - a23 * a30;
  var b09 = a21 * a32 - a22 * a31;
  var b10 = a21 * a33 - a23 * a31;
  var b11 = a22 * a33 - a23 * a32; // Calculate the determinant

  return b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
}
/**
 * Multiplies two mat4s
 *
 * @param {mat4} out the receiving matrix
 * @param {ReadonlyMat4} a the first operand
 * @param {ReadonlyMat4} b the second operand
 * @returns {mat4} out
 */

function multiply(out, a, b) {
  var a00 = a[0],
      a01 = a[1],
      a02 = a[2],
      a03 = a[3];
  var a10 = a[4],
      a11 = a[5],
      a12 = a[6],
      a13 = a[7];
  var a20 = a[8],
      a21 = a[9],
      a22 = a[10],
      a23 = a[11];
  var a30 = a[12],
      a31 = a[13],
      a32 = a[14],
      a33 = a[15]; // Cache only the current line of the second matrix

  var b0 = b[0],
      b1 = b[1],
      b2 = b[2],
      b3 = b[3];
  out[0] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
  out[1] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
  out[2] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
  out[3] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
  b0 = b[4];
  b1 = b[5];
  b2 = b[6];
  b3 = b[7];
  out[4] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
  out[5] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
  out[6] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
  out[7] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
  b0 = b[8];
  b1 = b[9];
  b2 = b[10];
  b3 = b[11];
  out[8] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
  out[9] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
  out[10] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
  out[11] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
  b0 = b[12];
  b1 = b[13];
  b2 = b[14];
  b3 = b[15];
  out[12] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
  out[13] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
  out[14] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
  out[15] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
  return out;
}
/**
 * Translate a mat4 by the given vector
 *
 * @param {mat4} out the receiving matrix
 * @param {ReadonlyMat4} a the matrix to translate
 * @param {ReadonlyVec3} v vector to translate by
 * @returns {mat4} out
 */

function translate(out, a, v) {
  var x = v[0],
      y = v[1],
      z = v[2];
  var a00, a01, a02, a03;
  var a10, a11, a12, a13;
  var a20, a21, a22, a23;

  if (a === out) {
    out[12] = a[0] * x + a[4] * y + a[8] * z + a[12];
    out[13] = a[1] * x + a[5] * y + a[9] * z + a[13];
    out[14] = a[2] * x + a[6] * y + a[10] * z + a[14];
    out[15] = a[3] * x + a[7] * y + a[11] * z + a[15];
  } else {
    a00 = a[0];
    a01 = a[1];
    a02 = a[2];
    a03 = a[3];
    a10 = a[4];
    a11 = a[5];
    a12 = a[6];
    a13 = a[7];
    a20 = a[8];
    a21 = a[9];
    a22 = a[10];
    a23 = a[11];
    out[0] = a00;
    out[1] = a01;
    out[2] = a02;
    out[3] = a03;
    out[4] = a10;
    out[5] = a11;
    out[6] = a12;
    out[7] = a13;
    out[8] = a20;
    out[9] = a21;
    out[10] = a22;
    out[11] = a23;
    out[12] = a00 * x + a10 * y + a20 * z + a[12];
    out[13] = a01 * x + a11 * y + a21 * z + a[13];
    out[14] = a02 * x + a12 * y + a22 * z + a[14];
    out[15] = a03 * x + a13 * y + a23 * z + a[15];
  }

  return out;
}
/**
 * Scales the mat4 by the dimensions in the given vec3 not using vectorization
 *
 * @param {mat4} out the receiving matrix
 * @param {ReadonlyMat4} a the matrix to scale
 * @param {ReadonlyVec3} v the vec3 to scale the matrix by
 * @returns {mat4} out
 **/

function scale(out, a, v) {
  var x = v[0],
      y = v[1],
      z = v[2];
  out[0] = a[0] * x;
  out[1] = a[1] * x;
  out[2] = a[2] * x;
  out[3] = a[3] * x;
  out[4] = a[4] * y;
  out[5] = a[5] * y;
  out[6] = a[6] * y;
  out[7] = a[7] * y;
  out[8] = a[8] * z;
  out[9] = a[9] * z;
  out[10] = a[10] * z;
  out[11] = a[11] * z;
  out[12] = a[12];
  out[13] = a[13];
  out[14] = a[14];
  out[15] = a[15];
  return out;
}
/**
 * Rotates a mat4 by the given angle around the given axis
 *
 * @param {mat4} out the receiving matrix
 * @param {ReadonlyMat4} a the matrix to rotate
 * @param {Number} rad the angle to rotate the matrix by
 * @param {ReadonlyVec3} axis the axis to rotate around
 * @returns {mat4} out
 */

function rotate(out, a, rad, axis) {
  var x = axis[0],
      y = axis[1],
      z = axis[2];
  var len = Math.hypot(x, y, z);
  var s, c, t;
  var a00, a01, a02, a03;
  var a10, a11, a12, a13;
  var a20, a21, a22, a23;
  var b00, b01, b02;
  var b10, b11, b12;
  var b20, b21, b22;

  if (len < EPSILON) {
    return null;
  }

  len = 1 / len;
  x *= len;
  y *= len;
  z *= len;
  s = Math.sin(rad);
  c = Math.cos(rad);
  t = 1 - c;
  a00 = a[0];
  a01 = a[1];
  a02 = a[2];
  a03 = a[3];
  a10 = a[4];
  a11 = a[5];
  a12 = a[6];
  a13 = a[7];
  a20 = a[8];
  a21 = a[9];
  a22 = a[10];
  a23 = a[11]; // Construct the elements of the rotation matrix

  b00 = x * x * t + c;
  b01 = y * x * t + z * s;
  b02 = z * x * t - y * s;
  b10 = x * y * t - z * s;
  b11 = y * y * t + c;
  b12 = z * y * t + x * s;
  b20 = x * z * t + y * s;
  b21 = y * z * t - x * s;
  b22 = z * z * t + c; // Perform rotation-specific matrix multiplication

  out[0] = a00 * b00 + a10 * b01 + a20 * b02;
  out[1] = a01 * b00 + a11 * b01 + a21 * b02;
  out[2] = a02 * b00 + a12 * b01 + a22 * b02;
  out[3] = a03 * b00 + a13 * b01 + a23 * b02;
  out[4] = a00 * b10 + a10 * b11 + a20 * b12;
  out[5] = a01 * b10 + a11 * b11 + a21 * b12;
  out[6] = a02 * b10 + a12 * b11 + a22 * b12;
  out[7] = a03 * b10 + a13 * b11 + a23 * b12;
  out[8] = a00 * b20 + a10 * b21 + a20 * b22;
  out[9] = a01 * b20 + a11 * b21 + a21 * b22;
  out[10] = a02 * b20 + a12 * b21 + a22 * b22;
  out[11] = a03 * b20 + a13 * b21 + a23 * b22;

  if (a !== out) {
    // If the source and destination differ, copy the unchanged last row
    out[12] = a[12];
    out[13] = a[13];
    out[14] = a[14];
    out[15] = a[15];
  }

  return out;
}
/**
 * Rotates a matrix by the given angle around the X axis
 *
 * @param {mat4} out the receiving matrix
 * @param {ReadonlyMat4} a the matrix to rotate
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat4} out
 */

function rotateX$1(out, a, rad) {
  var s = Math.sin(rad);
  var c = Math.cos(rad);
  var a10 = a[4];
  var a11 = a[5];
  var a12 = a[6];
  var a13 = a[7];
  var a20 = a[8];
  var a21 = a[9];
  var a22 = a[10];
  var a23 = a[11];

  if (a !== out) {
    // If the source and destination differ, copy the unchanged rows
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[3];
    out[12] = a[12];
    out[13] = a[13];
    out[14] = a[14];
    out[15] = a[15];
  } // Perform axis-specific matrix multiplication


  out[4] = a10 * c + a20 * s;
  out[5] = a11 * c + a21 * s;
  out[6] = a12 * c + a22 * s;
  out[7] = a13 * c + a23 * s;
  out[8] = a20 * c - a10 * s;
  out[9] = a21 * c - a11 * s;
  out[10] = a22 * c - a12 * s;
  out[11] = a23 * c - a13 * s;
  return out;
}
/**
 * Rotates a matrix by the given angle around the Y axis
 *
 * @param {mat4} out the receiving matrix
 * @param {ReadonlyMat4} a the matrix to rotate
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat4} out
 */

function rotateY$1(out, a, rad) {
  var s = Math.sin(rad);
  var c = Math.cos(rad);
  var a00 = a[0];
  var a01 = a[1];
  var a02 = a[2];
  var a03 = a[3];
  var a20 = a[8];
  var a21 = a[9];
  var a22 = a[10];
  var a23 = a[11];

  if (a !== out) {
    // If the source and destination differ, copy the unchanged rows
    out[4] = a[4];
    out[5] = a[5];
    out[6] = a[6];
    out[7] = a[7];
    out[12] = a[12];
    out[13] = a[13];
    out[14] = a[14];
    out[15] = a[15];
  } // Perform axis-specific matrix multiplication


  out[0] = a00 * c - a20 * s;
  out[1] = a01 * c - a21 * s;
  out[2] = a02 * c - a22 * s;
  out[3] = a03 * c - a23 * s;
  out[8] = a00 * s + a20 * c;
  out[9] = a01 * s + a21 * c;
  out[10] = a02 * s + a22 * c;
  out[11] = a03 * s + a23 * c;
  return out;
}
/**
 * Rotates a matrix by the given angle around the Z axis
 *
 * @param {mat4} out the receiving matrix
 * @param {ReadonlyMat4} a the matrix to rotate
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat4} out
 */

function rotateZ$1(out, a, rad) {
  var s = Math.sin(rad);
  var c = Math.cos(rad);
  var a00 = a[0];
  var a01 = a[1];
  var a02 = a[2];
  var a03 = a[3];
  var a10 = a[4];
  var a11 = a[5];
  var a12 = a[6];
  var a13 = a[7];

  if (a !== out) {
    // If the source and destination differ, copy the unchanged last row
    out[8] = a[8];
    out[9] = a[9];
    out[10] = a[10];
    out[11] = a[11];
    out[12] = a[12];
    out[13] = a[13];
    out[14] = a[14];
    out[15] = a[15];
  } // Perform axis-specific matrix multiplication


  out[0] = a00 * c + a10 * s;
  out[1] = a01 * c + a11 * s;
  out[2] = a02 * c + a12 * s;
  out[3] = a03 * c + a13 * s;
  out[4] = a10 * c - a00 * s;
  out[5] = a11 * c - a01 * s;
  out[6] = a12 * c - a02 * s;
  out[7] = a13 * c - a03 * s;
  return out;
}
/**
 * Returns the scaling factor component of a transformation
 *  matrix. If a matrix is built with fromRotationTranslationScale
 *  with a normalized Quaternion paramter, the returned vector will be
 *  the same as the scaling vector
 *  originally supplied.
 * @param  {vec3} out Vector to receive scaling factor component
 * @param  {ReadonlyMat4} mat Matrix to be decomposed (input)
 * @return {vec3} out
 */

function getScaling(out, mat) {
  var m11 = mat[0];
  var m12 = mat[1];
  var m13 = mat[2];
  var m21 = mat[4];
  var m22 = mat[5];
  var m23 = mat[6];
  var m31 = mat[8];
  var m32 = mat[9];
  var m33 = mat[10];
  out[0] = Math.hypot(m11, m12, m13);
  out[1] = Math.hypot(m21, m22, m23);
  out[2] = Math.hypot(m31, m32, m33);
  return out;
}
/**
 * Calculates a 4x4 matrix from the given quaternion
 *
 * @param {mat4} out mat4 receiving operation result
 * @param {ReadonlyQuat} q Quaternion to create matrix from
 *
 * @returns {mat4} out
 */

function fromQuat(out, q) {
  var x = q[0],
      y = q[1],
      z = q[2],
      w = q[3];
  var x2 = x + x;
  var y2 = y + y;
  var z2 = z + z;
  var xx = x * x2;
  var yx = y * x2;
  var yy = y * y2;
  var zx = z * x2;
  var zy = z * y2;
  var zz = z * z2;
  var wx = w * x2;
  var wy = w * y2;
  var wz = w * z2;
  out[0] = 1 - yy - zz;
  out[1] = yx + wz;
  out[2] = zx - wy;
  out[3] = 0;
  out[4] = yx - wz;
  out[5] = 1 - xx - zz;
  out[6] = zy + wx;
  out[7] = 0;
  out[8] = zx + wy;
  out[9] = zy - wx;
  out[10] = 1 - xx - yy;
  out[11] = 0;
  out[12] = 0;
  out[13] = 0;
  out[14] = 0;
  out[15] = 1;
  return out;
}
/**
 * Generates a frustum matrix with the given bounds
 *
 * @param {mat4} out mat4 frustum matrix will be written into
 * @param {Number} left Left bound of the frustum
 * @param {Number} right Right bound of the frustum
 * @param {Number} bottom Bottom bound of the frustum
 * @param {Number} top Top bound of the frustum
 * @param {Number} near Near bound of the frustum
 * @param {Number} far Far bound of the frustum
 * @returns {mat4} out
 */

function frustum(out, left, right, bottom, top, near, far) {
  var rl = 1 / (right - left);
  var tb = 1 / (top - bottom);
  var nf = 1 / (near - far);
  out[0] = near * 2 * rl;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 0;
  out[5] = near * 2 * tb;
  out[6] = 0;
  out[7] = 0;
  out[8] = (right + left) * rl;
  out[9] = (top + bottom) * tb;
  out[10] = (far + near) * nf;
  out[11] = -1;
  out[12] = 0;
  out[13] = 0;
  out[14] = far * near * 2 * nf;
  out[15] = 0;
  return out;
}
/**
 * Generates a perspective projection matrix with the given bounds.
 * Passing null/undefined/no value for far will generate infinite projection matrix.
 *
 * @param {mat4} out mat4 frustum matrix will be written into
 * @param {number} fovy Vertical field of view in radians
 * @param {number} aspect Aspect ratio. typically viewport width/height
 * @param {number} near Near bound of the frustum
 * @param {number} far Far bound of the frustum, can be null or Infinity
 * @returns {mat4} out
 */

function perspective(out, fovy, aspect, near, far) {
  var f = 1.0 / Math.tan(fovy / 2),
      nf;
  out[0] = f / aspect;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 0;
  out[5] = f;
  out[6] = 0;
  out[7] = 0;
  out[8] = 0;
  out[9] = 0;
  out[11] = -1;
  out[12] = 0;
  out[13] = 0;
  out[15] = 0;

  if (far != null && far !== Infinity) {
    nf = 1 / (near - far);
    out[10] = (far + near) * nf;
    out[14] = 2 * far * near * nf;
  } else {
    out[10] = -1;
    out[14] = -2 * near;
  }

  return out;
}
/**
 * Generates a orthogonal projection matrix with the given bounds
 *
 * @param {mat4} out mat4 frustum matrix will be written into
 * @param {number} left Left bound of the frustum
 * @param {number} right Right bound of the frustum
 * @param {number} bottom Bottom bound of the frustum
 * @param {number} top Top bound of the frustum
 * @param {number} near Near bound of the frustum
 * @param {number} far Far bound of the frustum
 * @returns {mat4} out
 */

function ortho(out, left, right, bottom, top, near, far) {
  var lr = 1 / (left - right);
  var bt = 1 / (bottom - top);
  var nf = 1 / (near - far);
  out[0] = -2 * lr;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 0;
  out[5] = -2 * bt;
  out[6] = 0;
  out[7] = 0;
  out[8] = 0;
  out[9] = 0;
  out[10] = 2 * nf;
  out[11] = 0;
  out[12] = (left + right) * lr;
  out[13] = (top + bottom) * bt;
  out[14] = (far + near) * nf;
  out[15] = 1;
  return out;
}
/**
 * Generates a look-at matrix with the given eye position, focal point, and up axis.
 * If you want a matrix that actually makes an object look at another object, you should use targetTo instead.
 *
 * @param {mat4} out mat4 frustum matrix will be written into
 * @param {ReadonlyVec3} eye Position of the viewer
 * @param {ReadonlyVec3} center Point the viewer is looking at
 * @param {ReadonlyVec3} up vec3 pointing up
 * @returns {mat4} out
 */

function lookAt(out, eye, center, up) {
  var x0, x1, x2, y0, y1, y2, z0, z1, z2, len;
  var eyex = eye[0];
  var eyey = eye[1];
  var eyez = eye[2];
  var upx = up[0];
  var upy = up[1];
  var upz = up[2];
  var centerx = center[0];
  var centery = center[1];
  var centerz = center[2];

  if (Math.abs(eyex - centerx) < EPSILON && Math.abs(eyey - centery) < EPSILON && Math.abs(eyez - centerz) < EPSILON) {
    return identity(out);
  }

  z0 = eyex - centerx;
  z1 = eyey - centery;
  z2 = eyez - centerz;
  len = 1 / Math.hypot(z0, z1, z2);
  z0 *= len;
  z1 *= len;
  z2 *= len;
  x0 = upy * z2 - upz * z1;
  x1 = upz * z0 - upx * z2;
  x2 = upx * z1 - upy * z0;
  len = Math.hypot(x0, x1, x2);

  if (!len) {
    x0 = 0;
    x1 = 0;
    x2 = 0;
  } else {
    len = 1 / len;
    x0 *= len;
    x1 *= len;
    x2 *= len;
  }

  y0 = z1 * x2 - z2 * x1;
  y1 = z2 * x0 - z0 * x2;
  y2 = z0 * x1 - z1 * x0;
  len = Math.hypot(y0, y1, y2);

  if (!len) {
    y0 = 0;
    y1 = 0;
    y2 = 0;
  } else {
    len = 1 / len;
    y0 *= len;
    y1 *= len;
    y2 *= len;
  }

  out[0] = x0;
  out[1] = y0;
  out[2] = z0;
  out[3] = 0;
  out[4] = x1;
  out[5] = y1;
  out[6] = z1;
  out[7] = 0;
  out[8] = x2;
  out[9] = y2;
  out[10] = z2;
  out[11] = 0;
  out[12] = -(x0 * eyex + x1 * eyey + x2 * eyez);
  out[13] = -(y0 * eyex + y1 * eyey + y2 * eyez);
  out[14] = -(z0 * eyex + z1 * eyey + z2 * eyez);
  out[15] = 1;
  return out;
}
/**
 * Returns whether or not the matrices have approximately the same elements in the same position.
 *
 * @param {ReadonlyMat4} a The first matrix.
 * @param {ReadonlyMat4} b The second matrix.
 * @returns {Boolean} True if the matrices are equal, false otherwise.
 */

function equals$1(a, b) {
  var a0 = a[0],
      a1 = a[1],
      a2 = a[2],
      a3 = a[3];
  var a4 = a[4],
      a5 = a[5],
      a6 = a[6],
      a7 = a[7];
  var a8 = a[8],
      a9 = a[9],
      a10 = a[10],
      a11 = a[11];
  var a12 = a[12],
      a13 = a[13],
      a14 = a[14],
      a15 = a[15];
  var b0 = b[0],
      b1 = b[1],
      b2 = b[2],
      b3 = b[3];
  var b4 = b[4],
      b5 = b[5],
      b6 = b[6],
      b7 = b[7];
  var b8 = b[8],
      b9 = b[9],
      b10 = b[10],
      b11 = b[11];
  var b12 = b[12],
      b13 = b[13],
      b14 = b[14],
      b15 = b[15];
  return Math.abs(a0 - b0) <= EPSILON * Math.max(1.0, Math.abs(a0), Math.abs(b0)) && Math.abs(a1 - b1) <= EPSILON * Math.max(1.0, Math.abs(a1), Math.abs(b1)) && Math.abs(a2 - b2) <= EPSILON * Math.max(1.0, Math.abs(a2), Math.abs(b2)) && Math.abs(a3 - b3) <= EPSILON * Math.max(1.0, Math.abs(a3), Math.abs(b3)) && Math.abs(a4 - b4) <= EPSILON * Math.max(1.0, Math.abs(a4), Math.abs(b4)) && Math.abs(a5 - b5) <= EPSILON * Math.max(1.0, Math.abs(a5), Math.abs(b5)) && Math.abs(a6 - b6) <= EPSILON * Math.max(1.0, Math.abs(a6), Math.abs(b6)) && Math.abs(a7 - b7) <= EPSILON * Math.max(1.0, Math.abs(a7), Math.abs(b7)) && Math.abs(a8 - b8) <= EPSILON * Math.max(1.0, Math.abs(a8), Math.abs(b8)) && Math.abs(a9 - b9) <= EPSILON * Math.max(1.0, Math.abs(a9), Math.abs(b9)) && Math.abs(a10 - b10) <= EPSILON * Math.max(1.0, Math.abs(a10), Math.abs(b10)) && Math.abs(a11 - b11) <= EPSILON * Math.max(1.0, Math.abs(a11), Math.abs(b11)) && Math.abs(a12 - b12) <= EPSILON * Math.max(1.0, Math.abs(a12), Math.abs(b12)) && Math.abs(a13 - b13) <= EPSILON * Math.max(1.0, Math.abs(a13), Math.abs(b13)) && Math.abs(a14 - b14) <= EPSILON * Math.max(1.0, Math.abs(a14), Math.abs(b14)) && Math.abs(a15 - b15) <= EPSILON * Math.max(1.0, Math.abs(a15), Math.abs(b15));
}

/**
 * 4 Dimensional Vector
 * @module vec4
 */

/**
 * Creates a new, empty vec4
 *
 * @returns {vec4} a new 4D vector
 */

function create$2() {
  var out = new ARRAY_TYPE(4);

  if (ARRAY_TYPE != Float32Array) {
    out[0] = 0;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
  }

  return out;
}
/**
 * Adds two vec4's
 *
 * @param {vec4} out the receiving vector
 * @param {ReadonlyVec4} a the first operand
 * @param {ReadonlyVec4} b the second operand
 * @returns {vec4} out
 */

function add$1(out, a, b) {
  out[0] = a[0] + b[0];
  out[1] = a[1] + b[1];
  out[2] = a[2] + b[2];
  out[3] = a[3] + b[3];
  return out;
}
/**
 * Scales a vec4 by a scalar number
 *
 * @param {vec4} out the receiving vector
 * @param {ReadonlyVec4} a the vector to scale
 * @param {Number} b amount to scale the vector by
 * @returns {vec4} out
 */

function scale$1(out, a, b) {
  out[0] = a[0] * b;
  out[1] = a[1] * b;
  out[2] = a[2] * b;
  out[3] = a[3] * b;
  return out;
}
/**
 * Calculates the length of a vec4
 *
 * @param {ReadonlyVec4} a vector to calculate length of
 * @returns {Number} length of a
 */

function length$1(a) {
  var x = a[0];
  var y = a[1];
  var z = a[2];
  var w = a[3];
  return Math.hypot(x, y, z, w);
}
/**
 * Calculates the squared length of a vec4
 *
 * @param {ReadonlyVec4} a vector to calculate squared length of
 * @returns {Number} squared length of a
 */

function squaredLength(a) {
  var x = a[0];
  var y = a[1];
  var z = a[2];
  var w = a[3];
  return x * x + y * y + z * z + w * w;
}
/**
 * Normalize a vec4
 *
 * @param {vec4} out the receiving vector
 * @param {ReadonlyVec4} a vector to normalize
 * @returns {vec4} out
 */

function normalize$1(out, a) {
  var x = a[0];
  var y = a[1];
  var z = a[2];
  var w = a[3];
  var len = x * x + y * y + z * z + w * w;

  if (len > 0) {
    len = 1 / Math.sqrt(len);
  }

  out[0] = x * len;
  out[1] = y * len;
  out[2] = z * len;
  out[3] = w * len;
  return out;
}
/**
 * Calculates the dot product of two vec4's
 *
 * @param {ReadonlyVec4} a the first operand
 * @param {ReadonlyVec4} b the second operand
 * @returns {Number} dot product of a and b
 */

function dot$1(a, b) {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3];
}
/**
 * Performs a linear interpolation between two vec4's
 *
 * @param {vec4} out the receiving vector
 * @param {ReadonlyVec4} a the first operand
 * @param {ReadonlyVec4} b the second operand
 * @param {Number} t interpolation amount, in the range [0-1], between the two inputs
 * @returns {vec4} out
 */

function lerp$2(out, a, b, t) {
  var ax = a[0];
  var ay = a[1];
  var az = a[2];
  var aw = a[3];
  out[0] = ax + t * (b[0] - ax);
  out[1] = ay + t * (b[1] - ay);
  out[2] = az + t * (b[2] - az);
  out[3] = aw + t * (b[3] - aw);
  return out;
}
/**
 * Transforms the vec4 with a mat4.
 *
 * @param {vec4} out the receiving vector
 * @param {ReadonlyVec4} a the vector to transform
 * @param {ReadonlyMat4} m matrix to transform with
 * @returns {vec4} out
 */

function transformMat4$2(out, a, m) {
  var x = a[0],
      y = a[1],
      z = a[2],
      w = a[3];
  out[0] = m[0] * x + m[4] * y + m[8] * z + m[12] * w;
  out[1] = m[1] * x + m[5] * y + m[9] * z + m[13] * w;
  out[2] = m[2] * x + m[6] * y + m[10] * z + m[14] * w;
  out[3] = m[3] * x + m[7] * y + m[11] * z + m[15] * w;
  return out;
}
/**
 * Transforms the vec4 with a quat
 *
 * @param {vec4} out the receiving vector
 * @param {ReadonlyVec4} a the vector to transform
 * @param {ReadonlyQuat} q quaternion to transform with
 * @returns {vec4} out
 */

function transformQuat$1(out, a, q) {
  var x = a[0],
      y = a[1],
      z = a[2];
  var qx = q[0],
      qy = q[1],
      qz = q[2],
      qw = q[3]; // calculate quat * vec

  var ix = qw * x + qy * z - qz * y;
  var iy = qw * y + qz * x - qx * z;
  var iz = qw * z + qx * y - qy * x;
  var iw = -qx * x - qy * y - qz * z; // calculate result * inverse quat

  out[0] = ix * qw + iw * -qx + iy * -qz - iz * -qy;
  out[1] = iy * qw + iw * -qy + iz * -qx - ix * -qz;
  out[2] = iz * qw + iw * -qz + ix * -qy - iy * -qx;
  out[3] = a[3];
  return out;
}
/**
 * Perform some operation over an array of vec4s.
 *
 * @param {Array} a the array of vectors to iterate over
 * @param {Number} stride Number of elements between the start of each vec4. If 0 assumes tightly packed
 * @param {Number} offset Number of elements to skip at the beginning of the array
 * @param {Number} count Number of vec4s to iterate over. If 0 iterates over entire array
 * @param {Function} fn Function to call for each vector in the array
 * @param {Object} [arg] additional argument to pass to fn
 * @returns {Array} a
 * @function
 */

var forEach$2 = function () {
  var vec = create$2();
  return function (a, stride, offset, count, fn, arg) {
    var i, l;

    if (!stride) {
      stride = 4;
    }

    if (!offset) {
      offset = 0;
    }

    if (count) {
      l = Math.min(count * stride + offset, a.length);
    } else {
      l = a.length;
    }

    for (i = offset; i < l; i += stride) {
      vec[0] = a[i];
      vec[1] = a[i + 1];
      vec[2] = a[i + 2];
      vec[3] = a[i + 3];
      fn(vec, vec, arg);
      a[i] = vec[0];
      a[i + 1] = vec[1];
      a[i + 2] = vec[2];
      a[i + 3] = vec[3];
    }

    return a;
  };
}();

function _createSuper$4(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct$5(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _isNativeReflectConstruct$5() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }
var IDENTITY = Object.freeze([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
var ZERO = Object.freeze([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
var INDICES = Object.freeze({
  COL0ROW0: 0,
  COL0ROW1: 1,
  COL0ROW2: 2,
  COL0ROW3: 3,
  COL1ROW0: 4,
  COL1ROW1: 5,
  COL1ROW2: 6,
  COL1ROW3: 7,
  COL2ROW0: 8,
  COL2ROW1: 9,
  COL2ROW2: 10,
  COL2ROW3: 11,
  COL3ROW0: 12,
  COL3ROW1: 13,
  COL3ROW2: 14,
  COL3ROW3: 15
});
var constants$1 = {};

var Matrix4 = function (_Matrix) {
  _inherits(Matrix4, _Matrix);

  var _super = _createSuper$4(Matrix4);

  _createClass(Matrix4, [{
    key: "INDICES",
    get: function get() {
      return INDICES;
    }
  }, {
    key: "ELEMENTS",
    get: function get() {
      return 16;
    }
  }, {
    key: "RANK",
    get: function get() {
      return 4;
    }
  }], [{
    key: "IDENTITY",
    get: function get() {
      constants$1.IDENTITY = constants$1.IDENTITY || Object.freeze(new Matrix4(IDENTITY));
      return constants$1.IDENTITY;
    }
  }, {
    key: "ZERO",
    get: function get() {
      constants$1.ZERO = constants$1.ZERO || Object.freeze(new Matrix4(ZERO));
      return constants$1.ZERO;
    }
  }]);

  function Matrix4(array) {
    var _this;

    _classCallCheck(this, Matrix4);

    _this = _super.call(this, -0, -0, -0, -0, -0, -0, -0, -0, -0, -0, -0, -0, -0, -0, -0, -0);

    if (arguments.length === 1 && Array.isArray(array)) {
      _this.copy(array);
    } else {
      _this.identity();
    }

    return _this;
  }

  _createClass(Matrix4, [{
    key: "copy",
    value: function copy(array) {
      this[0] = array[0];
      this[1] = array[1];
      this[2] = array[2];
      this[3] = array[3];
      this[4] = array[4];
      this[5] = array[5];
      this[6] = array[6];
      this[7] = array[7];
      this[8] = array[8];
      this[9] = array[9];
      this[10] = array[10];
      this[11] = array[11];
      this[12] = array[12];
      this[13] = array[13];
      this[14] = array[14];
      this[15] = array[15];
      return this.check();
    }
  }, {
    key: "set",
    value: function set(m00, m10, m20, m30, m01, m11, m21, m31, m02, m12, m22, m32, m03, m13, m23, m33) {
      this[0] = m00;
      this[1] = m10;
      this[2] = m20;
      this[3] = m30;
      this[4] = m01;
      this[5] = m11;
      this[6] = m21;
      this[7] = m31;
      this[8] = m02;
      this[9] = m12;
      this[10] = m22;
      this[11] = m32;
      this[12] = m03;
      this[13] = m13;
      this[14] = m23;
      this[15] = m33;
      return this.check();
    }
  }, {
    key: "setRowMajor",
    value: function setRowMajor(m00, m01, m02, m03, m10, m11, m12, m13, m20, m21, m22, m23, m30, m31, m32, m33) {
      this[0] = m00;
      this[1] = m10;
      this[2] = m20;
      this[3] = m30;
      this[4] = m01;
      this[5] = m11;
      this[6] = m21;
      this[7] = m31;
      this[8] = m02;
      this[9] = m12;
      this[10] = m22;
      this[11] = m32;
      this[12] = m03;
      this[13] = m13;
      this[14] = m23;
      this[15] = m33;
      return this.check();
    }
  }, {
    key: "toRowMajor",
    value: function toRowMajor(result) {
      result[0] = this[0];
      result[1] = this[4];
      result[2] = this[8];
      result[3] = this[12];
      result[4] = this[1];
      result[5] = this[5];
      result[6] = this[9];
      result[7] = this[13];
      result[8] = this[2];
      result[9] = this[6];
      result[10] = this[10];
      result[11] = this[14];
      result[12] = this[3];
      result[13] = this[7];
      result[14] = this[11];
      result[15] = this[15];
      return result;
    }
  }, {
    key: "identity",
    value: function identity() {
      return this.copy(IDENTITY);
    }
  }, {
    key: "fromQuaternion",
    value: function fromQuaternion(q) {
      fromQuat(this, q);
      return this.check();
    }
  }, {
    key: "frustum",
    value: function frustum$1(_ref) {
      var left = _ref.left,
          right = _ref.right,
          bottom = _ref.bottom,
          top = _ref.top,
          near = _ref.near,
          far = _ref.far;

      if (far === Infinity) {
        Matrix4._computeInfinitePerspectiveOffCenter(this, left, right, bottom, top, near);
      } else {
        frustum(this, left, right, bottom, top, near, far);
      }

      return this.check();
    }
  }, {
    key: "lookAt",
    value: function lookAt$1(eye, center, up) {
      if (arguments.length === 1) {
        var _eye = eye;
        eye = _eye.eye;
        center = _eye.center;
        up = _eye.up;
      }

      center = center || [0, 0, 0];
      up = up || [0, 1, 0];
      lookAt(this, eye, center, up);
      return this.check();
    }
  }, {
    key: "ortho",
    value: function ortho$1(_ref2) {
      var left = _ref2.left,
          right = _ref2.right,
          bottom = _ref2.bottom,
          top = _ref2.top,
          _ref2$near = _ref2.near,
          near = _ref2$near === void 0 ? 0.1 : _ref2$near,
          _ref2$far = _ref2.far,
          far = _ref2$far === void 0 ? 500 : _ref2$far;
      ortho(this, left, right, bottom, top, near, far);
      return this.check();
    }
  }, {
    key: "orthographic",
    value: function orthographic(_ref3) {
      var _ref3$fovy = _ref3.fovy,
          fovy = _ref3$fovy === void 0 ? 45 * Math.PI / 180 : _ref3$fovy,
          _ref3$aspect = _ref3.aspect,
          aspect = _ref3$aspect === void 0 ? 1 : _ref3$aspect,
          _ref3$focalDistance = _ref3.focalDistance,
          focalDistance = _ref3$focalDistance === void 0 ? 1 : _ref3$focalDistance,
          _ref3$near = _ref3.near,
          near = _ref3$near === void 0 ? 0.1 : _ref3$near,
          _ref3$far = _ref3.far,
          far = _ref3$far === void 0 ? 500 : _ref3$far;

      if (fovy > Math.PI * 2) {
        throw Error('radians');
      }

      var halfY = fovy / 2;
      var top = focalDistance * Math.tan(halfY);
      var right = top * aspect;
      return new Matrix4().ortho({
        left: -right,
        right: right,
        bottom: -top,
        top: top,
        near: near,
        far: far
      });
    }
  }, {
    key: "perspective",
    value: function perspective$1() {
      var _ref4 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          _ref4$fovy = _ref4.fovy,
          fovy = _ref4$fovy === void 0 ? undefined : _ref4$fovy,
          _ref4$fov = _ref4.fov,
          fov = _ref4$fov === void 0 ? 45 * Math.PI / 180 : _ref4$fov,
          _ref4$aspect = _ref4.aspect,
          aspect = _ref4$aspect === void 0 ? 1 : _ref4$aspect,
          _ref4$near = _ref4.near,
          near = _ref4$near === void 0 ? 0.1 : _ref4$near,
          _ref4$far = _ref4.far,
          far = _ref4$far === void 0 ? 500 : _ref4$far;

      fovy = fovy || fov;

      if (fovy > Math.PI * 2) {
        throw Error('radians');
      }

      perspective(this, fovy, aspect, near, far);
      return this.check();
    }
  }, {
    key: "determinant",
    value: function determinant$1() {
      return determinant(this);
    }
  }, {
    key: "getScale",
    value: function getScale() {
      var result = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [-0, -0, -0];
      result[0] = Math.sqrt(this[0] * this[0] + this[1] * this[1] + this[2] * this[2]);
      result[1] = Math.sqrt(this[4] * this[4] + this[5] * this[5] + this[6] * this[6]);
      result[2] = Math.sqrt(this[8] * this[8] + this[9] * this[9] + this[10] * this[10]);
      return result;
    }
  }, {
    key: "getTranslation",
    value: function getTranslation() {
      var result = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [-0, -0, -0];
      result[0] = this[12];
      result[1] = this[13];
      result[2] = this[14];
      return result;
    }
  }, {
    key: "getRotation",
    value: function getRotation() {
      var result = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [-0, -0, -0, -0, -0, -0, -0, -0, -0, -0, -0, -0, -0, -0, -0, -0];
      var scaleResult = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
      var scale = this.getScale(scaleResult || [-0, -0, -0]);
      var inverseScale0 = 1 / scale[0];
      var inverseScale1 = 1 / scale[1];
      var inverseScale2 = 1 / scale[2];
      result[0] = this[0] * inverseScale0;
      result[1] = this[1] * inverseScale1;
      result[2] = this[2] * inverseScale2;
      result[3] = 0;
      result[4] = this[4] * inverseScale0;
      result[5] = this[5] * inverseScale1;
      result[6] = this[6] * inverseScale2;
      result[7] = 0;
      result[8] = this[8] * inverseScale0;
      result[9] = this[9] * inverseScale1;
      result[10] = this[10] * inverseScale2;
      result[11] = 0;
      result[12] = 0;
      result[13] = 0;
      result[14] = 0;
      result[15] = 1;
      return result;
    }
  }, {
    key: "getRotationMatrix3",
    value: function getRotationMatrix3() {
      var result = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [-0, -0, -0, -0, -0, -0, -0, -0, -0];
      var scaleResult = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
      var scale = this.getScale(scaleResult || [-0, -0, -0]);
      var inverseScale0 = 1 / scale[0];
      var inverseScale1 = 1 / scale[1];
      var inverseScale2 = 1 / scale[2];
      result[0] = this[0] * inverseScale0;
      result[1] = this[1] * inverseScale1;
      result[2] = this[2] * inverseScale2;
      result[3] = this[4] * inverseScale0;
      result[4] = this[5] * inverseScale1;
      result[5] = this[6] * inverseScale2;
      result[6] = this[8] * inverseScale0;
      result[7] = this[9] * inverseScale1;
      result[8] = this[10] * inverseScale2;
      return result;
    }
  }, {
    key: "transpose",
    value: function transpose$1() {
      transpose(this, this);
      return this.check();
    }
  }, {
    key: "invert",
    value: function invert$1() {
      invert(this, this);
      return this.check();
    }
  }, {
    key: "multiplyLeft",
    value: function multiplyLeft(a) {
      multiply(this, a, this);
      return this.check();
    }
  }, {
    key: "multiplyRight",
    value: function multiplyRight(a) {
      multiply(this, this, a);
      return this.check();
    }
  }, {
    key: "rotateX",
    value: function rotateX(radians) {
      rotateX$1(this, this, radians);
      return this.check();
    }
  }, {
    key: "rotateY",
    value: function rotateY(radians) {
      rotateY$1(this, this, radians);
      return this.check();
    }
  }, {
    key: "rotateZ",
    value: function rotateZ(radians) {
      rotateZ$1(this, this, radians);
      return this.check();
    }
  }, {
    key: "rotateXYZ",
    value: function rotateXYZ(_ref5) {
      var _ref6 = _slicedToArray(_ref5, 3),
          rx = _ref6[0],
          ry = _ref6[1],
          rz = _ref6[2];

      return this.rotateX(rx).rotateY(ry).rotateZ(rz);
    }
  }, {
    key: "rotateAxis",
    value: function rotateAxis(radians, axis) {
      rotate(this, this, radians, axis);
      return this.check();
    }
  }, {
    key: "scale",
    value: function scale$1(factor) {
      if (Array.isArray(factor)) {
        scale(this, this, factor);
      } else {
        scale(this, this, [factor, factor, factor]);
      }

      return this.check();
    }
  }, {
    key: "translate",
    value: function translate$1(vec) {
      translate(this, this, vec);
      return this.check();
    }
  }, {
    key: "transform",
    value: function transform(vector, result) {
      if (vector.length === 4) {
        result = transformMat4$2(result || [-0, -0, -0, -0], vector, this);
        checkVector(result, 4);
        return result;
      }

      return this.transformAsPoint(vector, result);
    }
  }, {
    key: "transformAsPoint",
    value: function transformAsPoint(vector, result) {
      var length = vector.length;

      switch (length) {
        case 2:
          result = transformMat4(result || [-0, -0], vector, this);
          break;

        case 3:
          result = transformMat4$1(result || [-0, -0, -0], vector, this);
          break;

        default:
          throw new Error('Illegal vector');
      }

      checkVector(result, vector.length);
      return result;
    }
  }, {
    key: "transformAsVector",
    value: function transformAsVector(vector, result) {
      switch (vector.length) {
        case 2:
          result = vec2_transformMat4AsVector(result || [-0, -0], vector, this);
          break;

        case 3:
          result = vec3_transformMat4AsVector(result || [-0, -0, -0], vector, this);
          break;

        default:
          throw new Error('Illegal vector');
      }

      checkVector(result, vector.length);
      return result;
    }
  }, {
    key: "makeRotationX",
    value: function makeRotationX(radians) {
      return this.identity().rotateX(radians);
    }
  }, {
    key: "makeTranslation",
    value: function makeTranslation(x, y, z) {
      return this.identity().translate([x, y, z]);
    }
  }, {
    key: "transformPoint",
    value: function transformPoint(vector, result) {
      deprecated('Matrix4.transformPoint', '3.0');
      return this.transformAsPoint(vector, result);
    }
  }, {
    key: "transformVector",
    value: function transformVector(vector, result) {
      deprecated('Matrix4.transformVector', '3.0');
      return this.transformAsPoint(vector, result);
    }
  }, {
    key: "transformDirection",
    value: function transformDirection(vector, result) {
      deprecated('Matrix4.transformDirection', '3.0');
      return this.transformAsVector(vector, result);
    }
  }], [{
    key: "_computeInfinitePerspectiveOffCenter",
    value: function _computeInfinitePerspectiveOffCenter(result, left, right, bottom, top, near) {
      var column0Row0 = 2.0 * near / (right - left);
      var column1Row1 = 2.0 * near / (top - bottom);
      var column2Row0 = (right + left) / (right - left);
      var column2Row1 = (top + bottom) / (top - bottom);
      var column2Row2 = -1.0;
      var column2Row3 = -1.0;
      var column3Row2 = -2.0 * near;
      result[0] = column0Row0;
      result[1] = 0.0;
      result[2] = 0.0;
      result[3] = 0.0;
      result[4] = 0.0;
      result[5] = column1Row1;
      result[6] = 0.0;
      result[7] = 0.0;
      result[8] = column2Row0;
      result[9] = column2Row1;
      result[10] = column2Row2;
      result[11] = column2Row3;
      result[12] = 0.0;
      result[13] = 0.0;
      result[14] = column3Row2;
      result[15] = 0.0;
      return result;
    }
  }]);

  return Matrix4;
}(Matrix);

var vs = "attribute float transform_elementID;\nvec2 transform_getPixelSizeHalf(vec2 size) {\n  return vec2(1.) / (2. * size);\n}\n\nvec2 transform_getPixelIndices(vec2 texSize, vec2 pixelSizeHalf) {\n  float yIndex = floor((transform_elementID / texSize[0]) + pixelSizeHalf[1]);\n  float xIndex = transform_elementID - (yIndex * texSize[0]);\n  return vec2(xIndex, yIndex);\n}\nvec2 transform_getTexCoord(vec2 size) {\n  vec2 pixelSizeHalf = transform_getPixelSizeHalf(size);\n  vec2 indices = transform_getPixelIndices(size, pixelSizeHalf);\n  vec2 coord = indices / size + pixelSizeHalf;\n  return coord;\n}\nvec2 transform_getPos(vec2 size) {\n  vec2 texCoord = transform_getTexCoord(size);\n  vec2 pos = (texCoord * (2.0, 2.0)) - (1., 1.);\n  return pos;\n}\nvec4 transform_getInput(sampler2D texSampler, vec2 size) {\n  vec2 texCoord = transform_getTexCoord(size);\n  vec4 textureColor = texture2D(texSampler, texCoord);\n  return textureColor;\n}\n";
var transformModule = {
  name: 'transform',
  vs: vs,
  fs: null
};

var ProgramManager = function () {
  _createClass(ProgramManager, null, [{
    key: "getDefaultProgramManager",
    value: function getDefaultProgramManager(gl) {
      gl.luma = gl.luma || {};
      gl.luma.defaultProgramManager = gl.luma.defaultProgramManager || new ProgramManager(gl);
      return gl.luma.defaultProgramManager;
    }
  }]);

  function ProgramManager(gl) {
    _classCallCheck(this, ProgramManager);

    this.gl = gl;
    this._programCache = {};
    this._getUniforms = {};
    this._registeredModules = {};
    this._hookFunctions = [];
    this._defaultModules = [];
    this._hashes = {};
    this._hashCounter = 0;
    this.stateHash = 0;
    this._useCounts = {};
  }

  _createClass(ProgramManager, [{
    key: "addDefaultModule",
    value: function addDefaultModule(module) {
      if (!this._defaultModules.find(function (m) {
        return m.name === module.name;
      })) {
        this._defaultModules.push(module);
      }

      this.stateHash++;
    }
  }, {
    key: "removeDefaultModule",
    value: function removeDefaultModule(module) {
      var moduleName = typeof module === 'string' ? module : module.name;
      this._defaultModules = this._defaultModules.filter(function (m) {
        return m.name !== moduleName;
      });
      this.stateHash++;
    }
  }, {
    key: "addShaderHook",
    value: function addShaderHook(hook, opts) {
      if (opts) {
        hook = Object.assign(opts, {
          hook: hook
        });
      }

      this._hookFunctions.push(hook);

      this.stateHash++;
    }
  }, {
    key: "get",
    value: function get() {
      var _this = this;

      var props = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var _props$vs = props.vs,
          vs = _props$vs === void 0 ? '' : _props$vs,
          _props$fs = props.fs,
          fs = _props$fs === void 0 ? '' : _props$fs,
          _props$defines = props.defines,
          defines = _props$defines === void 0 ? {} : _props$defines,
          _props$inject = props.inject,
          inject = _props$inject === void 0 ? {} : _props$inject,
          _props$varyings = props.varyings,
          varyings = _props$varyings === void 0 ? [] : _props$varyings,
          _props$bufferMode = props.bufferMode,
          bufferMode = _props$bufferMode === void 0 ? 0x8c8d : _props$bufferMode,
          _props$transpileToGLS = props.transpileToGLSL100,
          transpileToGLSL100 = _props$transpileToGLS === void 0 ? false : _props$transpileToGLS;

      var modules = this._getModuleList(props.modules);

      var vsHash = this._getHash(vs);

      var fsHash = this._getHash(fs);

      var moduleHashes = modules.map(function (m) {
        return _this._getHash(m.name);
      }).sort();
      var varyingHashes = varyings.map(function (v) {
        return _this._getHash(v);
      });
      var defineKeys = Object.keys(defines).sort();
      var injectKeys = Object.keys(inject).sort();
      var defineHashes = [];
      var injectHashes = [];
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = defineKeys[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var key = _step.value;
          defineHashes.push(this._getHash(key));
          defineHashes.push(this._getHash(defines[key]));
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

      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = injectKeys[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var _key = _step2.value;
          injectHashes.push(this._getHash(_key));
          injectHashes.push(this._getHash(inject[_key]));
        }
      } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion2 && _iterator2["return"] != null) {
            _iterator2["return"]();
          }
        } finally {
          if (_didIteratorError2) {
            throw _iteratorError2;
          }
        }
      }

      var hash = "".concat(vsHash, "/").concat(fsHash, "D").concat(defineHashes.join('/'), "M").concat(moduleHashes.join('/'), "I").concat(injectHashes.join('/'), "V").concat(varyingHashes.join('/'), "H").concat(this.stateHash, "B").concat(bufferMode).concat(transpileToGLSL100 ? 'T' : '');

      if (!this._programCache[hash]) {
        var assembled = assembleShaders(this.gl, {
          vs: vs,
          fs: fs,
          modules: modules,
          inject: inject,
          defines: defines,
          hookFunctions: this._hookFunctions,
          transpileToGLSL100: transpileToGLSL100
        });
        this._programCache[hash] = new Program(this.gl, {
          hash: hash,
          vs: assembled.vs,
          fs: assembled.fs,
          varyings: varyings,
          bufferMode: bufferMode
        });

        this._getUniforms[hash] = assembled.getUniforms || function (x) {};

        this._useCounts[hash] = 0;
      }

      this._useCounts[hash]++;
      return this._programCache[hash];
    }
  }, {
    key: "getUniforms",
    value: function getUniforms(program) {
      return this._getUniforms[program.hash] || null;
    }
  }, {
    key: "release",
    value: function release(program) {
      var hash = program.hash;
      this._useCounts[hash]--;

      if (this._useCounts[hash] === 0) {
        this._programCache[hash]["delete"]();

        delete this._programCache[hash];
        delete this._getUniforms[hash];
        delete this._useCounts[hash];
      }
    }
  }, {
    key: "_getHash",
    value: function _getHash(key) {
      if (this._hashes[key] === undefined) {
        this._hashes[key] = this._hashCounter++;
      }

      return this._hashes[key];
    }
  }, {
    key: "_getModuleList",
    value: function _getModuleList() {
      var appModules = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
      var modules = new Array(this._defaultModules.length + appModules.length);
      var seen = {};
      var count = 0;

      for (var i = 0, len = this._defaultModules.length; i < len; ++i) {
        var module = this._defaultModules[i];
        var name = module.name;
        modules[count++] = module;
        seen[name] = true;
      }

      for (var _i = 0, _len = appModules.length; _i < _len; ++_i) {
        var _module = appModules[_i];
        var _name = _module.name;

        if (!seen[_name]) {
          modules[count++] = _module;
          seen[_name] = true;
        }
      }

      modules.length = count;
      return modules;
    }
  }]);

  return ProgramManager;
}();

function _objectSpread$4(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i] != null ? Object(arguments[i]) : {};
    var ownKeys = Object.keys(source);

    if (typeof Object.getOwnPropertySymbols === 'function') {
      ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) {
        return Object.getOwnPropertyDescriptor(source, sym).enumerable;
      }));
    }

    ownKeys.forEach(function (key) {
      _defineProperty(target, key, source[key]);
    });
  }

  return target;
}

var GLTF_TO_LUMA_ATTRIBUTE_MAP = {
  POSITION: 'positions',
  NORMAL: 'normals',
  COLOR_0: 'colors',
  TEXCOORD_0: 'texCoords',
  TEXCOORD_1: 'texCoords1',
  TEXCOORD_2: 'texCoords2'
};
function getBuffersFromGeometry(gl, geometry, options) {
  var buffers = {};
  var indices = geometry.indices;

  for (var name in geometry.attributes) {
    var attribute = geometry.attributes[name];
    var remappedName = mapAttributeName(name, options);

    if (name === 'indices') {
      indices = attribute;
    } else if (attribute.constant) {
      buffers[remappedName] = attribute.value;
    } else {
      var typedArray = attribute.value;

      var accessor = _objectSpread$4({}, attribute);

      delete accessor.value;
      buffers[remappedName] = [new Buffer(gl, typedArray), accessor];
      inferAttributeAccessor(name, accessor);
    }
  }

  if (indices) {
    var data = indices.value || indices;
    assert$3(data instanceof Uint16Array || data instanceof Uint32Array, 'attribute array for "indices" must be of integer type');
    var _accessor = {
      size: 1,
      isIndexed: indices.isIndexed === undefined ? true : indices.isIndexed
    };
    buffers.indices = [new Buffer(gl, {
      data: data,
      target: 34963
    }), _accessor];
  }

  return buffers;
}

function mapAttributeName(name, options) {
  var _ref = options || {},
      _ref$attributeMap = _ref.attributeMap,
      attributeMap = _ref$attributeMap === void 0 ? GLTF_TO_LUMA_ATTRIBUTE_MAP : _ref$attributeMap;

  return attributeMap && attributeMap[name] || name;
}

function inferAttributeAccessor(attributeName, attribute) {
  var category;

  switch (attributeName) {
    case 'texCoords':
    case 'texCoord1':
    case 'texCoord2':
    case 'texCoord3':
      category = 'uvs';
      break;

    case 'vertices':
    case 'positions':
    case 'normals':
    case 'pickingColors':
      category = 'vectors';
      break;
  }

  switch (category) {
    case 'vectors':
      attribute.size = attribute.size || 3;
      break;

    case 'uvs':
      attribute.size = attribute.size || 2;
      break;
  }

  assert$3(Number.isFinite(attribute.size), "attribute ".concat(attributeName, " needs size"));
}

var LOG_DRAW_PRIORITY = 2;
var LOG_DRAW_TIMEOUT = 10000;
var ERR_MODEL_PARAMS = 'Model needs drawMode and vertexCount';

var NOOP = function NOOP() {};

var DRAW_PARAMS = {};

var Model = function () {
  function Model(gl) {
    var props = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    _classCallCheck(this, Model);

    var _props$id = props.id,
        id = _props$id === void 0 ? uid('model') : _props$id;
    assert$3(isWebGL(gl));
    this.id = id;
    this.gl = gl;
    this.id = props.id || uid('Model');
    this.lastLogTime = 0;
    this.initialize(props);
  }

  _createClass(Model, [{
    key: "initialize",
    value: function initialize(props) {
      this.props = {};
      this.programManager = props.programManager || ProgramManager.getDefaultProgramManager(this.gl);
      this._programManagerState = -1;
      this._managedProgram = false;
      var _props$program = props.program,
          program = _props$program === void 0 ? null : _props$program,
          vs = props.vs,
          fs = props.fs,
          modules = props.modules,
          defines = props.defines,
          inject = props.inject,
          varyings = props.varyings,
          bufferMode = props.bufferMode,
          transpileToGLSL100 = props.transpileToGLSL100;
      this.programProps = {
        program: program,
        vs: vs,
        fs: fs,
        modules: modules,
        defines: defines,
        inject: inject,
        varyings: varyings,
        bufferMode: bufferMode,
        transpileToGLSL100: transpileToGLSL100
      };
      this.program = null;
      this.vertexArray = null;
      this._programDirty = true;
      this.userData = {};
      this.needsRedraw = true;
      this._attributes = {};
      this.attributes = {};
      this.uniforms = {};
      this.pickable = true;

      this._checkProgram();

      this.setUniforms(Object.assign({}, this.getModuleUniforms(props.moduleSettings)));
      this.drawMode = props.drawMode !== undefined ? props.drawMode : 4;
      this.vertexCount = props.vertexCount || 0;
      this.geometryBuffers = {};
      this.isInstanced = props.isInstanced || props.instanced || props.instanceCount > 0;

      this._setModelProps(props);

      this.geometry = {};
      assert$3(this.drawMode !== undefined && Number.isFinite(this.vertexCount), ERR_MODEL_PARAMS);
    }
  }, {
    key: "setProps",
    value: function setProps(props) {
      this._setModelProps(props);
    }
  }, {
    key: "delete",
    value: function _delete() {
      for (var key in this._attributes) {
        if (this._attributes[key] !== this.attributes[key]) {
          this._attributes[key]["delete"]();
        }
      }

      if (this._managedProgram) {
        this.programManager.release(this.program);
        this._managedProgram = false;
      }

      this.vertexArray["delete"]();

      this._deleteGeometryBuffers();
    }
  }, {
    key: "getDrawMode",
    value: function getDrawMode() {
      return this.drawMode;
    }
  }, {
    key: "getVertexCount",
    value: function getVertexCount() {
      return this.vertexCount;
    }
  }, {
    key: "getInstanceCount",
    value: function getInstanceCount() {
      return this.instanceCount;
    }
  }, {
    key: "getAttributes",
    value: function getAttributes() {
      return this.attributes;
    }
  }, {
    key: "getProgram",
    value: function getProgram() {
      return this.program;
    }
  }, {
    key: "setProgram",
    value: function setProgram(props) {
      var program = props.program,
          vs = props.vs,
          fs = props.fs,
          modules = props.modules,
          defines = props.defines,
          inject = props.inject,
          varyings = props.varyings,
          bufferMode = props.bufferMode,
          transpileToGLSL100 = props.transpileToGLSL100;
      this.programProps = {
        program: program,
        vs: vs,
        fs: fs,
        modules: modules,
        defines: defines,
        inject: inject,
        varyings: varyings,
        bufferMode: bufferMode,
        transpileToGLSL100: transpileToGLSL100
      };
      this._programDirty = true;
    }
  }, {
    key: "getUniforms",
    value: function getUniforms() {
      return this.uniforms;
    }
  }, {
    key: "setDrawMode",
    value: function setDrawMode(drawMode) {
      this.drawMode = drawMode;
      return this;
    }
  }, {
    key: "setVertexCount",
    value: function setVertexCount(vertexCount) {
      assert$3(Number.isFinite(vertexCount));
      this.vertexCount = vertexCount;
      return this;
    }
  }, {
    key: "setInstanceCount",
    value: function setInstanceCount(instanceCount) {
      assert$3(Number.isFinite(instanceCount));
      this.instanceCount = instanceCount;
      return this;
    }
  }, {
    key: "setGeometry",
    value: function setGeometry(geometry) {
      this.drawMode = geometry.drawMode;
      this.vertexCount = geometry.getVertexCount();

      this._deleteGeometryBuffers();

      this.geometryBuffers = getBuffersFromGeometry(this.gl, geometry);
      this.vertexArray.setAttributes(this.geometryBuffers);
      return this;
    }
  }, {
    key: "setAttributes",
    value: function setAttributes() {
      var attributes = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      if (isObjectEmpty$1(attributes)) {
        return this;
      }

      var normalizedAttributes = {};

      for (var name in attributes) {
        var attribute = attributes[name];
        normalizedAttributes[name] = attribute.getValue ? attribute.getValue() : attribute;
      }

      this.vertexArray.setAttributes(normalizedAttributes);
      return this;
    }
  }, {
    key: "setUniforms",
    value: function setUniforms() {
      var uniforms = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      Object.assign(this.uniforms, uniforms);
      return this;
    }
  }, {
    key: "getModuleUniforms",
    value: function getModuleUniforms(opts) {
      this._checkProgram();

      var getUniforms = this.programManager.getUniforms(this.program);

      if (getUniforms) {
        return getUniforms(opts);
      }

      return {};
    }
  }, {
    key: "updateModuleSettings",
    value: function updateModuleSettings(opts) {
      var uniforms = this.getModuleUniforms(opts || {});
      return this.setUniforms(uniforms);
    }
  }, {
    key: "clear",
    value: function clear$1(opts) {
      clear(this.program.gl, opts);

      return this;
    }
  }, {
    key: "draw",
    value: function draw() {
      var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      this._checkProgram();

      var _opts$moduleSettings = opts.moduleSettings,
          moduleSettings = _opts$moduleSettings === void 0 ? null : _opts$moduleSettings,
          framebuffer = opts.framebuffer,
          _opts$uniforms = opts.uniforms,
          uniforms = _opts$uniforms === void 0 ? {} : _opts$uniforms,
          _opts$attributes = opts.attributes,
          attributes = _opts$attributes === void 0 ? {} : _opts$attributes,
          _opts$transformFeedba = opts.transformFeedback,
          transformFeedback = _opts$transformFeedba === void 0 ? this.transformFeedback : _opts$transformFeedba,
          _opts$parameters = opts.parameters,
          parameters = _opts$parameters === void 0 ? {} : _opts$parameters,
          _opts$vertexArray = opts.vertexArray,
          vertexArray = _opts$vertexArray === void 0 ? this.vertexArray : _opts$vertexArray;
      this.setAttributes(attributes);
      this.updateModuleSettings(moduleSettings);
      this.setUniforms(uniforms);
      var logPriority;

      if (log$2.priority >= LOG_DRAW_PRIORITY) {
        logPriority = this._logDrawCallStart(LOG_DRAW_PRIORITY);
      }

      var drawParams = this.vertexArray.getDrawParams();
      var _this$props = this.props,
          _this$props$isIndexed = _this$props.isIndexed,
          isIndexed = _this$props$isIndexed === void 0 ? drawParams.isIndexed : _this$props$isIndexed,
          _this$props$indexType = _this$props.indexType,
          indexType = _this$props$indexType === void 0 ? drawParams.indexType : _this$props$indexType,
          _this$props$indexOffs = _this$props.indexOffset,
          indexOffset = _this$props$indexOffs === void 0 ? drawParams.indexOffset : _this$props$indexOffs,
          _this$props$vertexArr = _this$props.vertexArrayInstanced,
          vertexArrayInstanced = _this$props$vertexArr === void 0 ? drawParams.isInstanced : _this$props$vertexArr;

      if (vertexArrayInstanced && !this.isInstanced) {
        log$2.warn('Found instanced attributes on non-instanced model', this.id)();
      }

      var isInstanced = this.isInstanced,
          instanceCount = this.instanceCount;
      var _this$props2 = this.props,
          _this$props2$onBefore = _this$props2.onBeforeRender,
          onBeforeRender = _this$props2$onBefore === void 0 ? NOOP : _this$props2$onBefore,
          _this$props2$onAfterR = _this$props2.onAfterRender,
          onAfterRender = _this$props2$onAfterR === void 0 ? NOOP : _this$props2$onAfterR;
      onBeforeRender();
      this.program.setUniforms(this.uniforms);
      var didDraw = this.program.draw(Object.assign(DRAW_PARAMS, opts, {
        logPriority: logPriority,
        uniforms: null,
        framebuffer: framebuffer,
        parameters: parameters,
        drawMode: this.getDrawMode(),
        vertexCount: this.getVertexCount(),
        vertexArray: vertexArray,
        transformFeedback: transformFeedback,
        isIndexed: isIndexed,
        indexType: indexType,
        isInstanced: isInstanced,
        instanceCount: instanceCount,
        offset: isIndexed ? indexOffset : 0
      }));
      onAfterRender();

      if (log$2.priority >= LOG_DRAW_PRIORITY) {
        this._logDrawCallEnd(logPriority, vertexArray, framebuffer);
      }

      return didDraw;
    }
  }, {
    key: "transform",
    value: function transform() {
      var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var _opts$discard = opts.discard,
          discard = _opts$discard === void 0 ? true : _opts$discard,
          feedbackBuffers = opts.feedbackBuffers,
          _opts$unbindModels = opts.unbindModels,
          unbindModels = _opts$unbindModels === void 0 ? [] : _opts$unbindModels;
      var parameters = opts.parameters;

      if (feedbackBuffers) {
        this._setFeedbackBuffers(feedbackBuffers);
      }

      if (discard) {
        parameters = Object.assign({}, parameters, _defineProperty({}, 35977, discard));
      }

      unbindModels.forEach(function (model) {
        return model.vertexArray.unbindBuffers();
      });

      try {
        this.draw(Object.assign({}, opts, {
          parameters: parameters
        }));
      } finally {
        unbindModels.forEach(function (model) {
          return model.vertexArray.bindBuffers();
        });
      }

      return this;
    }
  }, {
    key: "render",
    value: function render() {
      var uniforms = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      log$2.warn('Model.render() is deprecated. Use Model.setUniforms() and Model.draw()')();
      return this.setUniforms(uniforms).draw();
    }
  }, {
    key: "_setModelProps",
    value: function _setModelProps(props) {
      Object.assign(this.props, props);

      if ('uniforms' in props) {
        this.setUniforms(props.uniforms);
      }

      if ('pickable' in props) {
        this.pickable = props.pickable;
      }

      if ('instanceCount' in props) {
        this.instanceCount = props.instanceCount;
      }

      if ('geometry' in props) {
        this.setGeometry(props.geometry);
      }

      if ('attributes' in props) {
        this.setAttributes(props.attributes);
      }

      if ('_feedbackBuffers' in props) {
        this._setFeedbackBuffers(props._feedbackBuffers);
      }
    }
  }, {
    key: "_checkProgram",
    value: function _checkProgram() {
      var needsUpdate = this._programDirty || this.programManager.stateHash !== this._programManagerState;

      if (!needsUpdate) {
        return;
      }

      var program = this.programProps.program;

      if (program) {
        this._managedProgram = false;
      } else {
        var _this$programProps = this.programProps,
            vs = _this$programProps.vs,
            fs = _this$programProps.fs,
            modules = _this$programProps.modules,
            inject = _this$programProps.inject,
            defines = _this$programProps.defines,
            varyings = _this$programProps.varyings,
            bufferMode = _this$programProps.bufferMode,
            transpileToGLSL100 = _this$programProps.transpileToGLSL100;
        program = this.programManager.get({
          vs: vs,
          fs: fs,
          modules: modules,
          inject: inject,
          defines: defines,
          varyings: varyings,
          bufferMode: bufferMode,
          transpileToGLSL100: transpileToGLSL100
        });

        if (this.program && this._managedProgram) {
          this.programManager.release(this.program);
        }

        this._programManagerState = this.programManager.stateHash;
        this._managedProgram = true;
      }

      assert$3(program instanceof Program, 'Model needs a program');
      this._programDirty = false;

      if (program === this.program) {
        return;
      }

      this.program = program;

      if (this.vertexArray) {
        this.vertexArray.setProps({
          program: this.program,
          attributes: this.vertexArray.attributes
        });
      } else {
        this.vertexArray = new VertexArray(this.gl, {
          program: this.program
        });
      }

      this.setUniforms(Object.assign({}, this.getModuleUniforms()));
    }
  }, {
    key: "_deleteGeometryBuffers",
    value: function _deleteGeometryBuffers() {
      for (var name in this.geometryBuffers) {
        var buffer = this.geometryBuffers[name][0] || this.geometryBuffers[name];

        if (buffer instanceof Buffer) {
          buffer["delete"]();
        }
      }
    }
  }, {
    key: "_setAnimationProps",
    value: function _setAnimationProps(animationProps) {
      if (this.animated) {
        assert$3(animationProps, 'Model.draw(): animated uniforms but no animationProps');

        var animatedUniforms = this._evaluateAnimateUniforms(animationProps);

        Object.assign(this.uniforms, animatedUniforms);
      }
    }
  }, {
    key: "_setFeedbackBuffers",
    value: function _setFeedbackBuffers() {
      var feedbackBuffers = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      if (isObjectEmpty$1(feedbackBuffers)) {
        return this;
      }

      var gl = this.program.gl;
      this.transformFeedback = this.transformFeedback || new TransformFeedback(gl, {
        program: this.program
      });
      this.transformFeedback.setBuffers(feedbackBuffers);
      return this;
    }
  }, {
    key: "_logDrawCallStart",
    value: function _logDrawCallStart(logLevel) {
      var logDrawTimeout = logLevel > 3 ? 0 : LOG_DRAW_TIMEOUT;

      if (Date.now() - this.lastLogTime < logDrawTimeout) {
        return undefined;
      }

      this.lastLogTime = Date.now();
      log$2.group(LOG_DRAW_PRIORITY, ">>> DRAWING MODEL ".concat(this.id), {
        collapsed: log$2.level <= 2
      })();
      return logLevel;
    }
  }, {
    key: "_logDrawCallEnd",
    value: function _logDrawCallEnd(logLevel, vertexArray, uniforms, framebuffer) {
      if (logLevel === undefined) {
        return;
      }

      var attributeTable = getDebugTableForVertexArray({
        vertexArray: vertexArray,
        header: "".concat(this.id, " attributes"),
        attributes: this._attributes
      });

      var _getDebugTableForUnif = getDebugTableForUniforms({
        header: "".concat(this.id, " uniforms"),
        program: this.program,
        uniforms: Object.assign({}, this.program.uniforms, uniforms)
      }),
          uniformTable = _getDebugTableForUnif.table,
          unusedTable = _getDebugTableForUnif.unusedTable,
          unusedCount = _getDebugTableForUnif.unusedCount;

      var _getDebugTableForUnif2 = getDebugTableForUniforms({
        header: "".concat(this.id, " uniforms"),
        program: this.program,
        uniforms: Object.assign({}, this.program.uniforms, uniforms),
        undefinedOnly: true
      }),
          missingTable = _getDebugTableForUnif2.table,
          missingCount = _getDebugTableForUnif2.count;

      if (missingCount > 0) {
        log$2.log('MISSING UNIFORMS', Object.keys(missingTable))();
      }

      if (unusedCount > 0) {
        log$2.log('UNUSED UNIFORMS', Object.keys(unusedTable))();
      }

      var configTable = getDebugTableForProgramConfiguration(this.vertexArray.configuration);
      log$2.table(logLevel, attributeTable)();
      log$2.table(logLevel, uniformTable)();
      log$2.table(logLevel + 1, configTable)();

      if (framebuffer) {
        framebuffer.log({
          logLevel: LOG_DRAW_PRIORITY,
          message: "Rendered to ".concat(framebuffer.id)
        });
      }

      log$2.groupEnd(LOG_DRAW_PRIORITY, ">>> DRAWING MODEL ".concat(this.id))();
    }
  }]);

  return Model;
}();

var BufferTransform = function () {
  function BufferTransform(gl) {
    var props = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    _classCallCheck(this, BufferTransform);

    this.gl = gl;
    this.currentIndex = 0;
    this.feedbackMap = {};
    this.varyings = null;
    this.bindings = [];
    this.resources = {};

    this._initialize(props);

    Object.seal(this);
  }

  _createClass(BufferTransform, [{
    key: "setupResources",
    value: function setupResources(opts) {
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = this.bindings[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var binding = _step.value;

          this._setupTransformFeedback(binding, opts);
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
    }
  }, {
    key: "updateModelProps",
    value: function updateModelProps() {
      var props = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var varyings = this.varyings;

      if (varyings.length > 0) {
        props = Object.assign({}, props, {
          varyings: varyings
        });
      }

      return props;
    }
  }, {
    key: "getDrawOptions",
    value: function getDrawOptions() {
      var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var binding = this.bindings[this.currentIndex];
      var sourceBuffers = binding.sourceBuffers,
          transformFeedback = binding.transformFeedback;
      var attributes = Object.assign({}, sourceBuffers, opts.attributes);
      return {
        attributes: attributes,
        transformFeedback: transformFeedback
      };
    }
  }, {
    key: "swap",
    value: function swap() {
      if (this.feedbackMap) {
        this.currentIndex = this._getNextIndex();
        return true;
      }

      return false;
    }
  }, {
    key: "update",
    value: function update() {
      var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      this._setupBuffers(opts);
    }
  }, {
    key: "getBuffer",
    value: function getBuffer(varyingName) {
      var feedbackBuffers = this.bindings[this.currentIndex].feedbackBuffers;
      var bufferOrParams = varyingName ? feedbackBuffers[varyingName] : null;

      if (!bufferOrParams) {
        return null;
      }

      return bufferOrParams instanceof Buffer ? bufferOrParams : bufferOrParams.buffer;
    }
  }, {
    key: "getData",
    value: function getData() {
      var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          varyingName = _ref.varyingName;

      var buffer = this.getBuffer(varyingName);

      if (buffer) {
        return buffer.getData();
      }

      return null;
    }
  }, {
    key: "delete",
    value: function _delete() {
      for (var name in this.resources) {
        this.resources[name]["delete"]();
      }
    }
  }, {
    key: "_initialize",
    value: function _initialize() {
      var props = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      this._setupBuffers(props);

      this.varyings = props.varyings || Object.keys(this.bindings[this.currentIndex].feedbackBuffers);

      if (this.varyings.length > 0) {
        assert$3(isWebGL2(this.gl));
      }
    }
  }, {
    key: "_getFeedbackBuffers",
    value: function _getFeedbackBuffers(props) {
      var _props$sourceBuffers = props.sourceBuffers,
          sourceBuffers = _props$sourceBuffers === void 0 ? {} : _props$sourceBuffers;
      var feedbackBuffers = {};

      if (this.bindings[this.currentIndex]) {
        Object.assign(feedbackBuffers, this.bindings[this.currentIndex].feedbackBuffers);
      }

      if (this.feedbackMap) {
        for (var sourceName in this.feedbackMap) {
          var feedbackName = this.feedbackMap[sourceName];

          if (sourceName in sourceBuffers) {
            feedbackBuffers[feedbackName] = sourceName;
          }
        }
      }

      Object.assign(feedbackBuffers, props.feedbackBuffers);

      for (var bufferName in feedbackBuffers) {
        var bufferOrRef = feedbackBuffers[bufferName];

        if (typeof bufferOrRef === 'string') {
          var sourceBuffer = sourceBuffers[bufferOrRef];
          var byteLength = sourceBuffer.byteLength,
              usage = sourceBuffer.usage,
              accessor = sourceBuffer.accessor;
          feedbackBuffers[bufferName] = this._createNewBuffer(bufferName, {
            byteLength: byteLength,
            usage: usage,
            accessor: accessor
          });
        }
      }

      return feedbackBuffers;
    }
  }, {
    key: "_setupBuffers",
    value: function _setupBuffers() {
      var props = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var _props$sourceBuffers2 = props.sourceBuffers,
          sourceBuffers = _props$sourceBuffers2 === void 0 ? null : _props$sourceBuffers2;
      Object.assign(this.feedbackMap, props.feedbackMap);

      var feedbackBuffers = this._getFeedbackBuffers(props);

      this._updateBindings({
        sourceBuffers: sourceBuffers,
        feedbackBuffers: feedbackBuffers
      });
    }
  }, {
    key: "_setupTransformFeedback",
    value: function _setupTransformFeedback(binding, _ref2) {
      var model = _ref2.model;
      var program = model.program;
      binding.transformFeedback = new TransformFeedback(this.gl, {
        program: program,
        buffers: binding.feedbackBuffers
      });
    }
  }, {
    key: "_updateBindings",
    value: function _updateBindings(opts) {
      this.bindings[this.currentIndex] = this._updateBinding(this.bindings[this.currentIndex], opts);

      if (this.feedbackMap) {
        var _this$_swapBuffers = this._swapBuffers(this.bindings[this.currentIndex]),
            sourceBuffers = _this$_swapBuffers.sourceBuffers,
            feedbackBuffers = _this$_swapBuffers.feedbackBuffers;

        var nextIndex = this._getNextIndex();

        this.bindings[nextIndex] = this._updateBinding(this.bindings[nextIndex], {
          sourceBuffers: sourceBuffers,
          feedbackBuffers: feedbackBuffers
        });
      }
    }
  }, {
    key: "_updateBinding",
    value: function _updateBinding(binding, opts) {
      if (!binding) {
        return {
          sourceBuffers: Object.assign({}, opts.sourceBuffers),
          feedbackBuffers: Object.assign({}, opts.feedbackBuffers)
        };
      }

      Object.assign(binding.sourceBuffers, opts.sourceBuffers);
      Object.assign(binding.feedbackBuffers, opts.feedbackBuffers);

      if (binding.transformFeedback) {
        binding.transformFeedback.setBuffers(binding.feedbackBuffers);
      }

      return binding;
    }
  }, {
    key: "_swapBuffers",
    value: function _swapBuffers(opts) {
      if (!this.feedbackMap) {
        return null;
      }

      var sourceBuffers = Object.assign({}, opts.sourceBuffers);
      var feedbackBuffers = Object.assign({}, opts.feedbackBuffers);

      for (var srcName in this.feedbackMap) {
        var dstName = this.feedbackMap[srcName];
        sourceBuffers[srcName] = opts.feedbackBuffers[dstName];
        feedbackBuffers[dstName] = opts.sourceBuffers[srcName];
        assert$3(feedbackBuffers[dstName] instanceof Buffer);
      }

      return {
        sourceBuffers: sourceBuffers,
        feedbackBuffers: feedbackBuffers
      };
    }
  }, {
    key: "_createNewBuffer",
    value: function _createNewBuffer(name, opts) {
      var buffer = new Buffer(this.gl, opts);

      if (this.resources[name]) {
        this.resources[name]["delete"]();
      }

      this.resources[name] = buffer;
      return buffer;
    }
  }, {
    key: "_getNextIndex",
    value: function _getNextIndex() {
      return (this.currentIndex + 1) % 2;
    }
  }]);

  return BufferTransform;
}();

var SAMPLER_UNIFORM_PREFIX = 'transform_uSampler_';
var SIZE_UNIFORM_PREFIX = 'transform_uSize_';
var VS_POS_VARIABLE = 'transform_position';
function updateForTextures(_ref) {
  var vs = _ref.vs,
      sourceTextureMap = _ref.sourceTextureMap,
      targetTextureVarying = _ref.targetTextureVarying,
      targetTexture = _ref.targetTexture;
  var texAttributeNames = Object.keys(sourceTextureMap);
  var sourceCount = texAttributeNames.length;
  var targetTextureType = null;
  var samplerTextureMap = {};
  var updatedVs = vs;
  var finalInject = {};

  if (sourceCount > 0 || targetTextureVarying) {
    var vsLines = updatedVs.split('\n');
    var updateVsLines = vsLines.slice();
    vsLines.forEach(function (line, index, lines) {
      if (sourceCount > 0) {
        var updated = processAttributeDefinition(line, sourceTextureMap);

        if (updated) {
          var updatedLine = updated.updatedLine,
              inject = updated.inject;
          updateVsLines[index] = updatedLine;
          finalInject = combineInjects([finalInject, inject]);
          Object.assign(samplerTextureMap, updated.samplerTextureMap);
          sourceCount--;
        }
      }

      if (targetTextureVarying && !targetTextureType) {
        targetTextureType = getVaryingType(line, targetTextureVarying);
      }
    });

    if (targetTextureVarying) {
      assert$3(targetTexture);
      var sizeName = "".concat(SIZE_UNIFORM_PREFIX).concat(targetTextureVarying);
      var uniformDeclaration = "uniform vec2 ".concat(sizeName, ";\n");
      var posInstructions = "     vec2 ".concat(VS_POS_VARIABLE, " = transform_getPos(").concat(sizeName, ");\n     gl_Position = vec4(").concat(VS_POS_VARIABLE, ", 0, 1.);\n");
      var inject = {
        'vs:#decl': uniformDeclaration,
        'vs:#main-start': posInstructions
      };
      finalInject = combineInjects([finalInject, inject]);
    }

    updatedVs = updateVsLines.join('\n');
  }

  return {
    vs: updatedVs,
    targetTextureType: targetTextureType,
    inject: finalInject,
    samplerTextureMap: samplerTextureMap
  };
}
function getSizeUniforms(_ref2) {
  var sourceTextureMap = _ref2.sourceTextureMap,
      targetTextureVarying = _ref2.targetTextureVarying,
      targetTexture = _ref2.targetTexture;
  var uniforms = {};
  var width;
  var height;

  if (targetTextureVarying) {
    width = targetTexture.width;
    height = targetTexture.height;
    uniforms["".concat(SIZE_UNIFORM_PREFIX).concat(targetTextureVarying)] = [width, height];
  }

  for (var textureName in sourceTextureMap) {
    var _sourceTextureMap$tex = sourceTextureMap[textureName];
    width = _sourceTextureMap$tex.width;
    height = _sourceTextureMap$tex.height;
    uniforms["".concat(SIZE_UNIFORM_PREFIX).concat(textureName)] = [width, height];
  }

  return uniforms;
}

function getAttributeDefinition(line) {
  return getQualifierDetails(line, ['attribute', 'in']);
}

function getSamplerDeclerations(textureName) {
  var samplerName = "".concat(SAMPLER_UNIFORM_PREFIX).concat(textureName);
  var sizeName = "".concat(SIZE_UNIFORM_PREFIX).concat(textureName);
  var uniformDeclerations = "  uniform sampler2D ".concat(samplerName, ";\n  uniform vec2 ").concat(sizeName, ";");
  return {
    samplerName: samplerName,
    sizeName: sizeName,
    uniformDeclerations: uniformDeclerations
  };
}

function getVaryingType(line, varying) {
  var qualaiferDetails = getQualifierDetails(line, ['varying', 'out']);

  if (!qualaiferDetails) {
    return null;
  }

  return qualaiferDetails.name === varying ? qualaiferDetails.type : null;
}
function processAttributeDefinition(line, textureMap) {
  var samplerTextureMap = {};
  var attributeData = getAttributeDefinition(line);

  if (!attributeData) {
    return null;
  }

  var type = attributeData.type,
      name = attributeData.name;

  if (name && textureMap[name]) {
    var updatedLine = "// ".concat(line, " => Replaced by Transform with a sampler");

    var _getSamplerDecleratio = getSamplerDeclerations(name),
        samplerName = _getSamplerDecleratio.samplerName,
        sizeName = _getSamplerDecleratio.sizeName,
        uniformDeclerations = _getSamplerDecleratio.uniformDeclerations;

    var channels = typeToChannelSuffix(type);
    var sampleInstruction = "  ".concat(type, " ").concat(name, " = transform_getInput(").concat(samplerName, ", ").concat(sizeName, ").").concat(channels, ";\n");
    samplerTextureMap[samplerName] = name;
    var inject = {
      'vs:#decl': uniformDeclerations,
      'vs:#main-start': sampleInstruction
    };
    return {
      updatedLine: updatedLine,
      inject: inject,
      samplerTextureMap: samplerTextureMap
    };
  }

  return null;
}

var _SRC_TEX_PARAMETER_OV;
var SRC_TEX_PARAMETER_OVERRIDES = (_SRC_TEX_PARAMETER_OV = {}, _defineProperty(_SRC_TEX_PARAMETER_OV, 10241, 9728), _defineProperty(_SRC_TEX_PARAMETER_OV, 10240, 9728), _defineProperty(_SRC_TEX_PARAMETER_OV, 10242, 33071), _defineProperty(_SRC_TEX_PARAMETER_OV, 10243, 33071), _SRC_TEX_PARAMETER_OV);
var FS_OUTPUT_VARIABLE = 'transform_output';

var TextureTransform = function () {
  function TextureTransform(gl) {
    var props = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    _classCallCheck(this, TextureTransform);

    this.gl = gl;
    this.currentIndex = 0;
    this._swapTexture = null;
    this.targetTextureVarying = null;
    this.targetTextureType = null;
    this.samplerTextureMap = null;
    this.bindings = [];
    this.resources = {};

    this._initialize(props);

    Object.seal(this);
  }

  _createClass(TextureTransform, [{
    key: "updateModelProps",
    value: function updateModelProps() {
      var props = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      var updatedModelProps = this._processVertexShader(props);

      return Object.assign({}, props, updatedModelProps);
    }
  }, {
    key: "getDrawOptions",
    value: function getDrawOptions() {
      var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var _this$bindings$this$c = this.bindings[this.currentIndex],
          sourceBuffers = _this$bindings$this$c.sourceBuffers,
          sourceTextures = _this$bindings$this$c.sourceTextures,
          framebuffer = _this$bindings$this$c.framebuffer,
          targetTexture = _this$bindings$this$c.targetTexture;
      var attributes = Object.assign({}, sourceBuffers, opts.attributes);
      var uniforms = Object.assign({}, opts.uniforms);
      var parameters = Object.assign({}, opts.parameters);
      var discard = opts.discard;

      if (this.hasSourceTextures || this.hasTargetTexture) {
        attributes.transform_elementID = this.elementIDBuffer;

        for (var sampler in this.samplerTextureMap) {
          var textureName = this.samplerTextureMap[sampler];
          uniforms[sampler] = sourceTextures[textureName];
        }

        this._setSourceTextureParameters();

        var sizeUniforms = getSizeUniforms({
          sourceTextureMap: sourceTextures,
          targetTextureVarying: this.targetTextureVarying,
          targetTexture: targetTexture
        });
        Object.assign(uniforms, sizeUniforms);
      }

      if (this.hasTargetTexture) {
        discard = false;
        parameters.viewport = [0, 0, framebuffer.width, framebuffer.height];
      }

      return {
        attributes: attributes,
        framebuffer: framebuffer,
        uniforms: uniforms,
        discard: discard,
        parameters: parameters
      };
    }
  }, {
    key: "swap",
    value: function swap() {
      if (this._swapTexture) {
        this.currentIndex = this._getNextIndex();
        return true;
      }

      return false;
    }
  }, {
    key: "update",
    value: function update() {
      var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      this._setupTextures(opts);
    }
  }, {
    key: "getTargetTexture",
    value: function getTargetTexture() {
      var targetTexture = this.bindings[this.currentIndex].targetTexture;
      return targetTexture;
    }
  }, {
    key: "getData",
    value: function getData() {
      var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          _ref$packed = _ref.packed,
          packed = _ref$packed === void 0 ? false : _ref$packed;

      var framebuffer = this.bindings[this.currentIndex].framebuffer;
      var pixels = readPixelsToArray(framebuffer);

      if (!packed) {
        return pixels;
      }

      var ArrayType = pixels.constructor;
      var channelCount = typeToChannelCount(this.targetTextureType);
      var packedPixels = new ArrayType(pixels.length * channelCount / 4);
      var packCount = 0;

      for (var i = 0; i < pixels.length; i += 4) {
        for (var j = 0; j < channelCount; j++) {
          packedPixels[packCount++] = pixels[i + j];
        }
      }

      return packedPixels;
    }
  }, {
    key: "getFramebuffer",
    value: function getFramebuffer() {
      var currentResources = this.bindings[this.currentIndex];
      return currentResources.framebuffer;
    }
  }, {
    key: "delete",
    value: function _delete() {
      if (this.ownTexture) {
        this.ownTexture["delete"]();
      }

      if (this.elementIDBuffer) {
        this.elementIDBuffer["delete"]();
      }
    }
  }, {
    key: "_initialize",
    value: function _initialize() {
      var props = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var _targetTextureVarying = props._targetTextureVarying,
          _swapTexture = props._swapTexture;
      this._swapTexture = _swapTexture;
      this.targetTextureVarying = _targetTextureVarying;
      this.hasTargetTexture = _targetTextureVarying;

      this._setupTextures(props);
    }
  }, {
    key: "_createTargetTexture",
    value: function _createTargetTexture(props) {
      var sourceTextures = props.sourceTextures,
          textureOrReference = props.textureOrReference;

      if (textureOrReference instanceof Texture2D) {
        return textureOrReference;
      }

      var refTexture = sourceTextures[textureOrReference];

      if (!refTexture) {
        return null;
      }

      this._targetRefTexName = textureOrReference;
      return this._createNewTexture(refTexture);
    }
  }, {
    key: "_setupTextures",
    value: function _setupTextures() {
      var props = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      var sourceBuffers = props.sourceBuffers,
          _props$_sourceTexture = props._sourceTextures,
          _sourceTextures = _props$_sourceTexture === void 0 ? {} : _props$_sourceTexture,
          _targetTexture = props._targetTexture;

      var targetTexture = this._createTargetTexture({
        sourceTextures: _sourceTextures,
        textureOrReference: _targetTexture
      });

      this.hasSourceTextures = this.hasSourceTextures || _sourceTextures && Object.keys(_sourceTextures).length > 0;

      this._updateBindings({
        sourceBuffers: sourceBuffers,
        sourceTextures: _sourceTextures,
        targetTexture: targetTexture
      });

      if ('elementCount' in props) {
        this._updateElementIDBuffer(props.elementCount);
      }
    }
  }, {
    key: "_updateElementIDBuffer",
    value: function _updateElementIDBuffer(elementCount) {
      if (typeof elementCount !== 'number' || this.elementCount >= elementCount) {
        return;
      }

      var elementIds = new Float32Array(elementCount);
      elementIds.forEach(function (_, index, array) {
        array[index] = index;
      });

      if (!this.elementIDBuffer) {
        this.elementIDBuffer = new Buffer(this.gl, {
          data: elementIds,
          accessor: {
            size: 1
          }
        });
      } else {
        this.elementIDBuffer.setData({
          data: elementIds
        });
      }

      this.elementCount = elementCount;
    }
  }, {
    key: "_updateBindings",
    value: function _updateBindings(opts) {
      this.bindings[this.currentIndex] = this._updateBinding(this.bindings[this.currentIndex], opts);

      if (this._swapTexture) {
        var _this$_swapTextures = this._swapTextures(this.bindings[this.currentIndex]),
            sourceTextures = _this$_swapTextures.sourceTextures,
            targetTexture = _this$_swapTextures.targetTexture;

        var nextIndex = this._getNextIndex();

        this.bindings[nextIndex] = this._updateBinding(this.bindings[nextIndex], {
          sourceTextures: sourceTextures,
          targetTexture: targetTexture
        });
      }
    }
  }, {
    key: "_updateBinding",
    value: function _updateBinding(binding, opts) {
      var sourceBuffers = opts.sourceBuffers,
          sourceTextures = opts.sourceTextures,
          targetTexture = opts.targetTexture;

      if (!binding) {
        binding = {
          sourceBuffers: {},
          sourceTextures: {},
          targetTexture: null
        };
      }

      Object.assign(binding.sourceTextures, sourceTextures);
      Object.assign(binding.sourceBuffers, sourceBuffers);

      if (targetTexture) {
        binding.targetTexture = targetTexture;
        var width = targetTexture.width,
            height = targetTexture.height;
        var _binding = binding,
            framebuffer = _binding.framebuffer;

        if (framebuffer) {
          framebuffer.update({
            attachments: _defineProperty({}, 36064, targetTexture),
            resizeAttachments: false
          });
          framebuffer.resize({
            width: width,
            height: height
          });
        } else {
          binding.framebuffer = new Framebuffer(this.gl, {
            id: "".concat(this.id || 'transform', "-framebuffer"),
            width: width,
            height: height,
            attachments: _defineProperty({}, 36064, targetTexture)
          });
        }
      }

      return binding;
    }
  }, {
    key: "_setSourceTextureParameters",
    value: function _setSourceTextureParameters() {
      var index = this.currentIndex;
      var sourceTextures = this.bindings[index].sourceTextures;

      for (var name in sourceTextures) {
        sourceTextures[name].setParameters(SRC_TEX_PARAMETER_OVERRIDES);
      }
    }
  }, {
    key: "_swapTextures",
    value: function _swapTextures(opts) {
      if (!this._swapTexture) {
        return null;
      }

      var sourceTextures = Object.assign({}, opts.sourceTextures);
      sourceTextures[this._swapTexture] = opts.targetTexture;
      var targetTexture = opts.sourceTextures[this._swapTexture];
      return {
        sourceTextures: sourceTextures,
        targetTexture: targetTexture
      };
    }
  }, {
    key: "_createNewTexture",
    value: function _createNewTexture(refTexture) {
      var _parameters;

      var texture = cloneTextureFrom(refTexture, {
        parameters: (_parameters = {}, _defineProperty(_parameters, 10241, 9728), _defineProperty(_parameters, 10240, 9728), _defineProperty(_parameters, 10242, 33071), _defineProperty(_parameters, 10243, 33071), _parameters),
        pixelStore: _defineProperty({}, 37440, false)
      });

      if (this.ownTexture) {
        this.ownTexture["delete"]();
      }

      this.ownTexture = texture;
      return texture;
    }
  }, {
    key: "_getNextIndex",
    value: function _getNextIndex() {
      return (this.currentIndex + 1) % 2;
    }
  }, {
    key: "_processVertexShader",
    value: function _processVertexShader() {
      var props = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var _this$bindings$this$c2 = this.bindings[this.currentIndex],
          sourceTextures = _this$bindings$this$c2.sourceTextures,
          targetTexture = _this$bindings$this$c2.targetTexture;

      var _updateForTextures = updateForTextures({
        vs: props.vs,
        sourceTextureMap: sourceTextures,
        targetTextureVarying: this.targetTextureVarying,
        targetTexture: targetTexture
      }),
          vs = _updateForTextures.vs,
          uniforms = _updateForTextures.uniforms,
          targetTextureType = _updateForTextures.targetTextureType,
          inject = _updateForTextures.inject,
          samplerTextureMap = _updateForTextures.samplerTextureMap;

      var combinedInject = combineInjects([props.inject || {}, inject]);
      this.targetTextureType = targetTextureType;
      this.samplerTextureMap = samplerTextureMap;
      var fs = props._fs || getPassthroughFS({
        version: getShaderVersion(vs),
        input: this.targetTextureVarying,
        inputType: targetTextureType,
        output: FS_OUTPUT_VARIABLE
      });
      var modules = this.hasSourceTextures || this.targetTextureVarying ? [transformModule].concat(props.modules || []) : props.modules;
      return {
        vs: vs,
        fs: fs,
        modules: modules,
        uniforms: uniforms,
        inject: combinedInject
      };
    }
  }]);

  return TextureTransform;
}();

var Transform = function () {
  _createClass(Transform, null, [{
    key: "isSupported",
    value: function isSupported(gl) {
      return isWebGL2(gl);
    }
  }]);

  function Transform(gl) {
    var props = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    _classCallCheck(this, Transform);

    this.gl = gl;
    this.model = null;
    this.elementCount = 0;
    this.bufferTransform = null;
    this.textureTransform = null;
    this.elementIDBuffer = null;

    this._initialize(props);

    Object.seal(this);
  }

  _createClass(Transform, [{
    key: "delete",
    value: function _delete() {
      var model = this.model,
          bufferTransform = this.bufferTransform,
          textureTransform = this.textureTransform;

      if (model) {
        model["delete"]();
      }

      if (bufferTransform) {
        bufferTransform["delete"]();
      }

      if (textureTransform) {
        textureTransform["delete"]();
      }
    }
  }, {
    key: "run",
    value: function run() {
      var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var _opts$clearRenderTarg = opts.clearRenderTarget,
          clearRenderTarget = _opts$clearRenderTarg === void 0 ? true : _opts$clearRenderTarg;

      var updatedOpts = this._updateDrawOptions(opts);

      if (clearRenderTarget && updatedOpts.framebuffer) {
        updatedOpts.framebuffer.clear({
          color: true
        });
      }

      this.model.transform(updatedOpts);
    }
  }, {
    key: "swap",
    value: function swap() {
      var swapped = false;
      var resourceTransforms = [this.bufferTransform, this.textureTransform].filter(Boolean);
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = resourceTransforms[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var resourceTransform = _step.value;
          swapped = swapped || resourceTransform.swap();
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

      assert$3(swapped, 'Nothing to swap');
    }
  }, {
    key: "getBuffer",
    value: function getBuffer() {
      var varyingName = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
      return this.bufferTransform && this.bufferTransform.getBuffer(varyingName);
    }
  }, {
    key: "getData",
    value: function getData() {
      var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var resourceTransforms = [this.bufferTransform, this.textureTransform].filter(Boolean);
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = resourceTransforms[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var resourceTransform = _step2.value;
          var data = resourceTransform.getData(opts);

          if (data) {
            return data;
          }
        }
      } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion2 && _iterator2["return"] != null) {
            _iterator2["return"]();
          }
        } finally {
          if (_didIteratorError2) {
            throw _iteratorError2;
          }
        }
      }

      return null;
    }
  }, {
    key: "getFramebuffer",
    value: function getFramebuffer() {
      return this.textureTransform && this.textureTransform.getFramebuffer();
    }
  }, {
    key: "update",
    value: function update() {
      var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      if ('elementCount' in opts) {
        this.model.setVertexCount(opts.elementCount);
      }

      var resourceTransforms = [this.bufferTransform, this.textureTransform].filter(Boolean);
      var _iteratorNormalCompletion3 = true;
      var _didIteratorError3 = false;
      var _iteratorError3 = undefined;

      try {
        for (var _iterator3 = resourceTransforms[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
          var resourceTransform = _step3.value;
          resourceTransform.update(opts);
        }
      } catch (err) {
        _didIteratorError3 = true;
        _iteratorError3 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion3 && _iterator3["return"] != null) {
            _iterator3["return"]();
          }
        } finally {
          if (_didIteratorError3) {
            throw _iteratorError3;
          }
        }
      }
    }
  }, {
    key: "_initialize",
    value: function _initialize() {
      var props = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var gl = this.gl;

      this._buildResourceTransforms(gl, props);

      props = this._updateModelProps(props);
      this.model = new Model(gl, Object.assign({}, props, {
        fs: props.fs || getPassthroughFS({
          version: getShaderVersion(props.vs)
        }),
        id: props.id || 'transform-model',
        drawMode: props.drawMode || 0,
        vertexCount: props.elementCount
      }));
      this.bufferTransform && this.bufferTransform.setupResources({
        model: this.model
      });
    }
  }, {
    key: "_updateModelProps",
    value: function _updateModelProps(props) {
      var updatedProps = Object.assign({}, props);
      var resourceTransforms = [this.bufferTransform, this.textureTransform].filter(Boolean);
      var _iteratorNormalCompletion4 = true;
      var _didIteratorError4 = false;
      var _iteratorError4 = undefined;

      try {
        for (var _iterator4 = resourceTransforms[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
          var resourceTransform = _step4.value;
          updatedProps = resourceTransform.updateModelProps(updatedProps);
        }
      } catch (err) {
        _didIteratorError4 = true;
        _iteratorError4 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion4 && _iterator4["return"] != null) {
            _iterator4["return"]();
          }
        } finally {
          if (_didIteratorError4) {
            throw _iteratorError4;
          }
        }
      }

      return updatedProps;
    }
  }, {
    key: "_buildResourceTransforms",
    value: function _buildResourceTransforms(gl, props) {
      if (canCreateBufferTransform(props)) {
        this.bufferTransform = new BufferTransform(gl, props);
      }

      if (canCreateTextureTransform(props)) {
        this.textureTransform = new TextureTransform(gl, props);
      }

      assert$3(this.bufferTransform || this.textureTransform, 'must provide source/feedback buffers or source/target textures');
    }
  }, {
    key: "_updateDrawOptions",
    value: function _updateDrawOptions(opts) {
      var updatedOpts = Object.assign({}, opts);
      var resourceTransforms = [this.bufferTransform, this.textureTransform].filter(Boolean);
      var _iteratorNormalCompletion5 = true;
      var _didIteratorError5 = false;
      var _iteratorError5 = undefined;

      try {
        for (var _iterator5 = resourceTransforms[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
          var resourceTransform = _step5.value;
          updatedOpts = Object.assign(updatedOpts, resourceTransform.getDrawOptions(updatedOpts));
        }
      } catch (err) {
        _didIteratorError5 = true;
        _iteratorError5 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion5 && _iterator5["return"] != null) {
            _iterator5["return"]();
          }
        } finally {
          if (_didIteratorError5) {
            throw _iteratorError5;
          }
        }
      }

      return updatedOpts;
    }
  }]);

  return Transform;
}();

function canCreateBufferTransform(props) {
  if (!isObjectEmpty$1(props.feedbackBuffers) || !isObjectEmpty$1(props.feedbackMap) || props.varyings && props.varyings.length > 0) {
    return true;
  }

  return false;
}

function canCreateTextureTransform(props) {
  if (!isObjectEmpty$1(props._sourceTextures) || props._targetTexture || props._targetTextureVarying) {
    return true;
  }

  return false;
}

var COORDINATE_SYSTEM = {
  DEFAULT: -1,
  LNGLAT: 1,
  METER_OFFSETS: 2,
  LNGLAT_OFFSETS: 3,
  CARTESIAN: 0
};
Object.defineProperty(COORDINATE_SYSTEM, 'IDENTITY', {
  get: function get() {
    return log.deprecated('COORDINATE_SYSTEM.IDENTITY', 'COORDINATE_SYSTEM.CARTESIAN')() || 0;
  }
});
var PROJECTION_MODE = {
  WEB_MERCATOR: 1,
  GLOBE: 2,
  WEB_MERCATOR_AUTO_OFFSET: 4,
  IDENTITY: 0
};
var EVENTS = {
  click: {
    handler: 'onClick'
  },
  panstart: {
    handler: 'onDragStart'
  },
  panmove: {
    handler: 'onDrag'
  },
  panend: {
    handler: 'onDragEnd'
  }
};

function isEqual(a, b) {
  if (a === b) {
    return true;
  }

  if (Array.isArray(a)) {
    var len = a.length;

    if (!b || b.length !== len) {
      return false;
    }

    for (var i = 0; i < len; i++) {
      if (a[i] !== b[i]) {
        return false;
      }
    }

    return true;
  }

  return false;
}

function memoize(compute) {
  var cachedArgs = {};
  var cachedResult;
  return function (args) {
    for (var key in args) {
      if (!isEqual(args[key], cachedArgs[key])) {
        cachedResult = compute(args);
        cachedArgs = args;
        break;
      }
    }

    return cachedResult;
  };
}

function assert$6(condition, message) {
  if (!condition) {
    throw new Error(message || 'deck.gl: assertion failed.');
  }
}

var ZERO_VECTOR = [0, 0, 0, 0];
var VECTOR_TO_POINT_MATRIX = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0];
var IDENTITY_MATRIX = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
var DEFAULT_PIXELS_PER_UNIT2 = [0, 0, 0];
var DEFAULT_COORDINATE_ORIGIN = [0, 0, 0];
var getMemoizedViewportUniforms = memoize(calculateViewportUniforms);
function getOffsetOrigin(viewport, coordinateSystem) {
  var coordinateOrigin = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : DEFAULT_COORDINATE_ORIGIN;
  var shaderCoordinateOrigin = coordinateOrigin;
  var geospatialOrigin;
  var offsetMode = true;

  if (coordinateSystem === COORDINATE_SYSTEM.LNGLAT_OFFSETS || coordinateSystem === COORDINATE_SYSTEM.METER_OFFSETS) {
    geospatialOrigin = coordinateOrigin;
  } else {
    geospatialOrigin = viewport.isGeospatial ? [Math.fround(viewport.longitude), Math.fround(viewport.latitude), 0] : null;
  }

  switch (viewport.projectionMode) {
    case PROJECTION_MODE.WEB_MERCATOR:
      if (coordinateSystem === COORDINATE_SYSTEM.LNGLAT || coordinateSystem === COORDINATE_SYSTEM.CARTESIAN) {
        offsetMode = false;
      }

      break;

    case PROJECTION_MODE.WEB_MERCATOR_AUTO_OFFSET:
      if (coordinateSystem === COORDINATE_SYSTEM.LNGLAT) {
        shaderCoordinateOrigin = geospatialOrigin;
      } else if (coordinateSystem === COORDINATE_SYSTEM.CARTESIAN) {
        shaderCoordinateOrigin = [Math.fround(viewport.center[0]), Math.fround(viewport.center[1]), 0];
        geospatialOrigin = viewport.unprojectPosition(shaderCoordinateOrigin);
        shaderCoordinateOrigin[0] -= coordinateOrigin[0];
        shaderCoordinateOrigin[1] -= coordinateOrigin[1];
        shaderCoordinateOrigin[2] -= coordinateOrigin[2];
      }

      break;

    case PROJECTION_MODE.IDENTITY:
      shaderCoordinateOrigin = viewport.position.map(Math.fround);
      break;

    case PROJECTION_MODE.GLOBE:
      offsetMode = false;
      geospatialOrigin = null;
      break;

    default:
      offsetMode = false;
  }

  shaderCoordinateOrigin[2] = shaderCoordinateOrigin[2] || 0;
  return {
    geospatialOrigin: geospatialOrigin,
    shaderCoordinateOrigin: shaderCoordinateOrigin,
    offsetMode: offsetMode
  };
}

function calculateMatrixAndOffset(viewport, coordinateSystem, coordinateOrigin) {
  var viewMatrixUncentered = viewport.viewMatrixUncentered,
      projectionMatrix = viewport.projectionMatrix;
  var viewMatrix = viewport.viewMatrix,
      viewProjectionMatrix = viewport.viewProjectionMatrix;
  var projectionCenter = ZERO_VECTOR;
  var cameraPosCommon = viewport.cameraPosition;

  var _getOffsetOrigin = getOffsetOrigin(viewport, coordinateSystem, coordinateOrigin),
      geospatialOrigin = _getOffsetOrigin.geospatialOrigin,
      shaderCoordinateOrigin = _getOffsetOrigin.shaderCoordinateOrigin,
      offsetMode = _getOffsetOrigin.offsetMode;

  if (offsetMode) {
    var positionCommonSpace = viewport.projectPosition(geospatialOrigin || shaderCoordinateOrigin);
    cameraPosCommon = [cameraPosCommon[0] - positionCommonSpace[0], cameraPosCommon[1] - positionCommonSpace[1], cameraPosCommon[2] - positionCommonSpace[2]];
    positionCommonSpace[3] = 1;
    projectionCenter = transformMat4$2([], positionCommonSpace, viewProjectionMatrix);
    viewMatrix = viewMatrixUncentered || viewMatrix;
    viewProjectionMatrix = multiply([], projectionMatrix, viewMatrix);
    viewProjectionMatrix = multiply([], viewProjectionMatrix, VECTOR_TO_POINT_MATRIX);
  }

  return {
    viewMatrix: viewMatrix,
    viewProjectionMatrix: viewProjectionMatrix,
    projectionCenter: projectionCenter,
    cameraPosCommon: cameraPosCommon,
    shaderCoordinateOrigin: shaderCoordinateOrigin,
    geospatialOrigin: geospatialOrigin
  };
}

function getUniformsFromViewport() {
  var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
      viewport = _ref.viewport,
      _ref$devicePixelRatio = _ref.devicePixelRatio,
      devicePixelRatio = _ref$devicePixelRatio === void 0 ? 1 : _ref$devicePixelRatio,
      _ref$modelMatrix = _ref.modelMatrix,
      modelMatrix = _ref$modelMatrix === void 0 ? null : _ref$modelMatrix,
      _ref$coordinateSystem = _ref.coordinateSystem,
      coordinateSystem = _ref$coordinateSystem === void 0 ? COORDINATE_SYSTEM.DEFAULT : _ref$coordinateSystem,
      coordinateOrigin = _ref.coordinateOrigin,
      _ref$autoWrapLongitud = _ref.autoWrapLongitude,
      autoWrapLongitude = _ref$autoWrapLongitud === void 0 ? false : _ref$autoWrapLongitud,
      projectionMode = _ref.projectionMode,
      positionOrigin = _ref.positionOrigin;

  assert$6(viewport);

  if (coordinateSystem === COORDINATE_SYSTEM.DEFAULT) {
    coordinateSystem = viewport.isGeospatial ? COORDINATE_SYSTEM.LNGLAT : COORDINATE_SYSTEM.CARTESIAN;
  }

  var uniforms = getMemoizedViewportUniforms({
    viewport: viewport,
    devicePixelRatio: devicePixelRatio,
    coordinateSystem: coordinateSystem,
    coordinateOrigin: coordinateOrigin
  });
  uniforms.project_uWrapLongitude = autoWrapLongitude;
  uniforms.project_uModelMatrix = modelMatrix || IDENTITY_MATRIX;
  return uniforms;
}

function calculateViewportUniforms(_ref2) {
  var viewport = _ref2.viewport,
      devicePixelRatio = _ref2.devicePixelRatio,
      coordinateSystem = _ref2.coordinateSystem,
      coordinateOrigin = _ref2.coordinateOrigin;

  var _calculateMatrixAndOf = calculateMatrixAndOffset(viewport, coordinateSystem, coordinateOrigin),
      projectionCenter = _calculateMatrixAndOf.projectionCenter,
      viewProjectionMatrix = _calculateMatrixAndOf.viewProjectionMatrix,
      cameraPosCommon = _calculateMatrixAndOf.cameraPosCommon,
      shaderCoordinateOrigin = _calculateMatrixAndOf.shaderCoordinateOrigin,
      geospatialOrigin = _calculateMatrixAndOf.geospatialOrigin;

  var distanceScales = viewport.getDistanceScales();
  var viewportSize = [viewport.width * devicePixelRatio, viewport.height * devicePixelRatio];
  var uniforms = {
    project_uCoordinateSystem: coordinateSystem,
    project_uProjectionMode: viewport.projectionMode,
    project_uCoordinateOrigin: shaderCoordinateOrigin,
    project_uCenter: projectionCenter,
    project_uAntimeridian: (viewport.longitude || 0) - 180,
    project_uViewportSize: viewportSize,
    project_uDevicePixelRatio: devicePixelRatio,
    project_uFocalDistance: viewport.focalDistance || 1,
    project_uCommonUnitsPerMeter: distanceScales.unitsPerMeter,
    project_uCommonUnitsPerWorldUnit: distanceScales.unitsPerMeter,
    project_uCommonUnitsPerWorldUnit2: DEFAULT_PIXELS_PER_UNIT2,
    project_uScale: viewport.scale,
    project_uViewProjectionMatrix: viewProjectionMatrix,
    project_uCameraPosition: cameraPosCommon
  };

  if (geospatialOrigin) {
    var distanceScalesAtOrigin = viewport.getDistanceScales(geospatialOrigin);

    switch (coordinateSystem) {
      case COORDINATE_SYSTEM.METER_OFFSETS:
        uniforms.project_uCommonUnitsPerWorldUnit = distanceScalesAtOrigin.unitsPerMeter;
        uniforms.project_uCommonUnitsPerWorldUnit2 = distanceScalesAtOrigin.unitsPerMeter2;
        break;

      case COORDINATE_SYSTEM.LNGLAT:
      case COORDINATE_SYSTEM.LNGLAT_OFFSETS:
        uniforms.project_uCommonUnitsPerWorldUnit = distanceScalesAtOrigin.unitsPerDegree;
        uniforms.project_uCommonUnitsPerWorldUnit2 = distanceScalesAtOrigin.unitsPerDegree2;
        break;

      case COORDINATE_SYSTEM.CARTESIAN:
        uniforms.project_uCommonUnitsPerWorldUnit = [1, 1, distanceScalesAtOrigin.unitsPerMeter[2]];
        uniforms.project_uCommonUnitsPerWorldUnit2 = [0, 0, distanceScalesAtOrigin.unitsPerMeter2[2]];
        break;
    }
  }

  return uniforms;
}

function createMat4() {
  return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
}
function transformVector(matrix, vector) {
  var result = transformMat4$2([], vector, matrix);
  scale$1(result, result, 1 / result[3]);
  return result;
}
function mod(value, divisor) {
  var modulus = value % divisor;
  return modulus < 0 ? divisor + modulus : modulus;
}

function assert$7(condition, message) {
  if (!condition) {
    throw new Error(message || '@math.gl/web-mercator: assertion failed.');
  }
}

var PI = Math.PI;
var PI_4 = PI / 4;
var DEGREES_TO_RADIANS = PI / 180;
var RADIANS_TO_DEGREES = 180 / PI;
var TILE_SIZE = 512;
var EARTH_CIRCUMFERENCE = 40.03e6;
var DEFAULT_ALTITUDE = 1.5;
function zoomToScale(zoom) {
  return Math.pow(2, zoom);
}
function scaleToZoom(scale) {
  return Math.log2(scale);
}
function lngLatToWorld(_ref) {
  var _ref2 = _slicedToArray(_ref, 2),
      lng = _ref2[0],
      lat = _ref2[1];

  assert$7(Number.isFinite(lng));
  assert$7(Number.isFinite(lat) && lat >= -90 && lat <= 90, 'invalid latitude');
  var lambda2 = lng * DEGREES_TO_RADIANS;
  var phi2 = lat * DEGREES_TO_RADIANS;
  var x = TILE_SIZE * (lambda2 + PI) / (2 * PI);
  var y = TILE_SIZE * (PI + Math.log(Math.tan(PI_4 + phi2 * 0.5))) / (2 * PI);
  return [x, y];
}
function worldToLngLat(_ref3) {
  var _ref4 = _slicedToArray(_ref3, 2),
      x = _ref4[0],
      y = _ref4[1];

  var lambda2 = x / TILE_SIZE * (2 * PI) - PI;
  var phi2 = 2 * (Math.atan(Math.exp(y / TILE_SIZE * (2 * PI) - PI)) - PI_4);
  return [lambda2 * RADIANS_TO_DEGREES, phi2 * RADIANS_TO_DEGREES];
}
function getMeterZoom(_ref5) {
  var latitude = _ref5.latitude;
  assert$7(Number.isFinite(latitude));
  var latCosine = Math.cos(latitude * DEGREES_TO_RADIANS);
  return scaleToZoom(EARTH_CIRCUMFERENCE * latCosine) - 9;
}
function getDistanceScales(_ref6) {
  var latitude = _ref6.latitude,
      longitude = _ref6.longitude,
      _ref6$highPrecision = _ref6.highPrecision,
      highPrecision = _ref6$highPrecision === void 0 ? false : _ref6$highPrecision;
  assert$7(Number.isFinite(latitude) && Number.isFinite(longitude));
  var result = {};
  var worldSize = TILE_SIZE;
  var latCosine = Math.cos(latitude * DEGREES_TO_RADIANS);
  var unitsPerDegreeX = worldSize / 360;
  var unitsPerDegreeY = unitsPerDegreeX / latCosine;
  var altUnitsPerMeter = worldSize / EARTH_CIRCUMFERENCE / latCosine;
  result.unitsPerMeter = [altUnitsPerMeter, altUnitsPerMeter, altUnitsPerMeter];
  result.metersPerUnit = [1 / altUnitsPerMeter, 1 / altUnitsPerMeter, 1 / altUnitsPerMeter];
  result.unitsPerDegree = [unitsPerDegreeX, unitsPerDegreeY, altUnitsPerMeter];
  result.degreesPerUnit = [1 / unitsPerDegreeX, 1 / unitsPerDegreeY, 1 / altUnitsPerMeter];

  if (highPrecision) {
    var latCosine2 = DEGREES_TO_RADIANS * Math.tan(latitude * DEGREES_TO_RADIANS) / latCosine;
    var unitsPerDegreeY2 = unitsPerDegreeX * latCosine2 / 2;
    var altUnitsPerDegree2 = worldSize / EARTH_CIRCUMFERENCE * latCosine2;
    var altUnitsPerMeter2 = altUnitsPerDegree2 / unitsPerDegreeY * altUnitsPerMeter;
    result.unitsPerDegree2 = [0, unitsPerDegreeY2, altUnitsPerDegree2];
    result.unitsPerMeter2 = [altUnitsPerMeter2, 0, altUnitsPerMeter2];
  }

  return result;
}
function addMetersToLngLat(lngLatZ, xyz) {
  var _lngLatZ = _slicedToArray(lngLatZ, 3),
      longitude = _lngLatZ[0],
      latitude = _lngLatZ[1],
      z0 = _lngLatZ[2];

  var _xyz = _slicedToArray(xyz, 3),
      x = _xyz[0],
      y = _xyz[1],
      z = _xyz[2];

  var _getDistanceScales = getDistanceScales({
    longitude: longitude,
    latitude: latitude,
    highPrecision: true
  }),
      unitsPerMeter = _getDistanceScales.unitsPerMeter,
      unitsPerMeter2 = _getDistanceScales.unitsPerMeter2;

  var worldspace = lngLatToWorld(lngLatZ);
  worldspace[0] += x * (unitsPerMeter[0] + unitsPerMeter2[0] * y);
  worldspace[1] += y * (unitsPerMeter[1] + unitsPerMeter2[1] * y);
  var newLngLat = worldToLngLat(worldspace);
  var newZ = (z0 || 0) + (z || 0);
  return Number.isFinite(z0) || Number.isFinite(z) ? [newLngLat[0], newLngLat[1], newZ] : newLngLat;
}
function getViewMatrix(_ref7) {
  var height = _ref7.height,
      pitch = _ref7.pitch,
      bearing = _ref7.bearing,
      altitude = _ref7.altitude,
      scale$1 = _ref7.scale,
      _ref7$center = _ref7.center,
      center = _ref7$center === void 0 ? null : _ref7$center;
  var vm = createMat4();
  translate(vm, vm, [0, 0, -altitude]);
  rotateX$1(vm, vm, -pitch * DEGREES_TO_RADIANS);
  rotateZ$1(vm, vm, bearing * DEGREES_TO_RADIANS);
  scale$1 /= height;
  scale(vm, vm, [scale$1, scale$1, scale$1]);

  if (center) {
    translate(vm, vm, negate$1([], center));
  }

  return vm;
}
function getProjectionParameters(_ref8) {
  var width = _ref8.width,
      height = _ref8.height,
      _ref8$altitude = _ref8.altitude,
      altitude = _ref8$altitude === void 0 ? DEFAULT_ALTITUDE : _ref8$altitude,
      _ref8$pitch = _ref8.pitch,
      pitch = _ref8$pitch === void 0 ? 0 : _ref8$pitch,
      _ref8$nearZMultiplier = _ref8.nearZMultiplier,
      nearZMultiplier = _ref8$nearZMultiplier === void 0 ? 1 : _ref8$nearZMultiplier,
      _ref8$farZMultiplier = _ref8.farZMultiplier,
      farZMultiplier = _ref8$farZMultiplier === void 0 ? 1 : _ref8$farZMultiplier;
  var pitchRadians = pitch * DEGREES_TO_RADIANS;
  var halfFov = Math.atan(0.5 / altitude);
  var topHalfSurfaceDistance = Math.sin(halfFov) * altitude / Math.sin(Math.min(Math.max(Math.PI / 2 - pitchRadians - halfFov, 0.01), Math.PI - 0.01));
  var farZ = Math.sin(pitchRadians) * topHalfSurfaceDistance + altitude;
  return {
    fov: 2 * halfFov,
    aspect: width / height,
    focalDistance: altitude,
    near: nearZMultiplier,
    far: farZ * farZMultiplier
  };
}
function getProjectionMatrix(_ref9) {
  var width = _ref9.width,
      height = _ref9.height,
      pitch = _ref9.pitch,
      altitude = _ref9.altitude,
      nearZMultiplier = _ref9.nearZMultiplier,
      farZMultiplier = _ref9.farZMultiplier;

  var _getProjectionParamet = getProjectionParameters({
    width: width,
    height: height,
    altitude: altitude,
    pitch: pitch,
    nearZMultiplier: nearZMultiplier,
    farZMultiplier: farZMultiplier
  }),
      fov = _getProjectionParamet.fov,
      aspect = _getProjectionParamet.aspect,
      near = _getProjectionParamet.near,
      far = _getProjectionParamet.far;

  var projectionMatrix = perspective([], fov, aspect, near, far);
  return projectionMatrix;
}
function worldToPixels(xyz, pixelProjectionMatrix) {
  var _xyz2 = _slicedToArray(xyz, 3),
      x = _xyz2[0],
      y = _xyz2[1],
      _xyz2$ = _xyz2[2],
      z = _xyz2$ === void 0 ? 0 : _xyz2$;

  assert$7(Number.isFinite(x) && Number.isFinite(y) && Number.isFinite(z));
  return transformVector(pixelProjectionMatrix, [x, y, z, 1]);
}
function pixelsToWorld(xyz, pixelUnprojectionMatrix) {
  var targetZ = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;

  var _xyz3 = _slicedToArray(xyz, 3),
      x = _xyz3[0],
      y = _xyz3[1],
      z = _xyz3[2];

  assert$7(Number.isFinite(x) && Number.isFinite(y), 'invalid pixel coordinate');

  if (Number.isFinite(z)) {
    var coord = transformVector(pixelUnprojectionMatrix, [x, y, z, 1]);
    return coord;
  }

  var coord0 = transformVector(pixelUnprojectionMatrix, [x, y, 0, 1]);
  var coord1 = transformVector(pixelUnprojectionMatrix, [x, y, 1, 1]);
  var z0 = coord0[2];
  var z1 = coord1[2];
  var t = z0 === z1 ? 0 : ((targetZ || 0) - z0) / (z1 - z0);
  return lerp$1([], coord0, coord1, t);
}

function fitBounds(_ref) {
  var width = _ref.width,
      height = _ref.height,
      bounds = _ref.bounds,
      _ref$minExtent = _ref.minExtent,
      minExtent = _ref$minExtent === void 0 ? 0 : _ref$minExtent,
      _ref$maxZoom = _ref.maxZoom,
      maxZoom = _ref$maxZoom === void 0 ? 24 : _ref$maxZoom,
      _ref$padding = _ref.padding,
      padding = _ref$padding === void 0 ? 0 : _ref$padding,
      _ref$offset = _ref.offset,
      offset = _ref$offset === void 0 ? [0, 0] : _ref$offset;

  var _bounds = _slicedToArray(bounds, 2),
      _bounds$ = _slicedToArray(_bounds[0], 2),
      west = _bounds$[0],
      south = _bounds$[1],
      _bounds$2 = _slicedToArray(_bounds[1], 2),
      east = _bounds$2[0],
      north = _bounds$2[1];

  if (Number.isFinite(padding)) {
    var p = padding;
    padding = {
      top: p,
      bottom: p,
      left: p,
      right: p
    };
  } else {
    assert$7(Number.isFinite(padding.top) && Number.isFinite(padding.bottom) && Number.isFinite(padding.left) && Number.isFinite(padding.right));
  }

  var viewport = new WebMercatorViewport({
    width: width,
    height: height,
    longitude: 0,
    latitude: 0,
    zoom: 0
  });
  var nw = viewport.project([west, north]);
  var se = viewport.project([east, south]);
  var size = [Math.max(Math.abs(se[0] - nw[0]), minExtent), Math.max(Math.abs(se[1] - nw[1]), minExtent)];
  var targetSize = [width - padding.left - padding.right - Math.abs(offset[0]) * 2, height - padding.top - padding.bottom - Math.abs(offset[1]) * 2];
  assert$7(targetSize[0] > 0 && targetSize[1] > 0);
  var scaleX = targetSize[0] / size[0];
  var scaleY = targetSize[1] / size[1];
  var offsetX = (padding.right - padding.left) / 2 / scaleX;
  var offsetY = (padding.bottom - padding.top) / 2 / scaleY;
  var center = [(se[0] + nw[0]) / 2 + offsetX, (se[1] + nw[1]) / 2 + offsetY];
  var centerLngLat = viewport.unproject(center);
  var zoom = Math.min(maxZoom, viewport.zoom + Math.log2(Math.abs(Math.min(scaleX, scaleY))));
  assert$7(Number.isFinite(zoom));
  return {
    longitude: centerLngLat[0],
    latitude: centerLngLat[1],
    zoom: zoom
  };
}

var DEGREES_TO_RADIANS$1 = Math.PI / 180;
function getBounds(viewport) {
  var z = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
  var width = viewport.width,
      height = viewport.height,
      unproject = viewport.unproject;
  var unprojectOps = {
    targetZ: z
  };
  var bottomLeft = unproject([0, height], unprojectOps);
  var bottomRight = unproject([width, height], unprojectOps);
  var topLeft;
  var topRight;
  var halfFov = Math.atan(0.5 / viewport.altitude);
  var angleToGround = (90 - viewport.pitch) * DEGREES_TO_RADIANS$1;

  if (halfFov > angleToGround - 0.01) {
    topLeft = unprojectOnFarPlane(viewport, 0, z);
    topRight = unprojectOnFarPlane(viewport, width, z);
  } else {
    topLeft = unproject([0, 0], unprojectOps);
    topRight = unproject([width, 0], unprojectOps);
  }

  return [bottomLeft, bottomRight, topRight, topLeft];
}

function unprojectOnFarPlane(viewport, x, targetZ) {
  var pixelUnprojectionMatrix = viewport.pixelUnprojectionMatrix;
  var coord0 = transformVector(pixelUnprojectionMatrix, [x, 0, 1, 1]);
  var coord1 = transformVector(pixelUnprojectionMatrix, [x, viewport.height, 1, 1]);
  var z = targetZ * viewport.distanceScales.unitsPerMeter[2];
  var t = (z - coord0[2]) / (coord1[2] - coord0[2]);
  var coord = lerp$1([], coord0, coord1, t);
  var result = worldToLngLat(coord);
  result[2] = targetZ;
  return result;
}

var WebMercatorViewport = function () {
  function WebMercatorViewport() {
    var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {
      width: 1,
      height: 1
    },
        width = _ref.width,
        height = _ref.height,
        _ref$latitude = _ref.latitude,
        latitude = _ref$latitude === void 0 ? 0 : _ref$latitude,
        _ref$longitude = _ref.longitude,
        longitude = _ref$longitude === void 0 ? 0 : _ref$longitude,
        _ref$zoom = _ref.zoom,
        zoom = _ref$zoom === void 0 ? 0 : _ref$zoom,
        _ref$pitch = _ref.pitch,
        pitch = _ref$pitch === void 0 ? 0 : _ref$pitch,
        _ref$bearing = _ref.bearing,
        bearing = _ref$bearing === void 0 ? 0 : _ref$bearing,
        _ref$altitude = _ref.altitude,
        altitude = _ref$altitude === void 0 ? 1.5 : _ref$altitude,
        _ref$nearZMultiplier = _ref.nearZMultiplier,
        nearZMultiplier = _ref$nearZMultiplier === void 0 ? 0.02 : _ref$nearZMultiplier,
        _ref$farZMultiplier = _ref.farZMultiplier,
        farZMultiplier = _ref$farZMultiplier === void 0 ? 1.01 : _ref$farZMultiplier;

    _classCallCheck(this, WebMercatorViewport);

    width = width || 1;
    height = height || 1;
    var scale = zoomToScale(zoom);
    altitude = Math.max(0.75, altitude);
    var center = lngLatToWorld([longitude, latitude]);
    center[2] = 0;
    this.projectionMatrix = getProjectionMatrix({
      width: width,
      height: height,
      pitch: pitch,
      altitude: altitude,
      nearZMultiplier: nearZMultiplier,
      farZMultiplier: farZMultiplier
    });
    this.viewMatrix = getViewMatrix({
      height: height,
      scale: scale,
      center: center,
      pitch: pitch,
      bearing: bearing,
      altitude: altitude
    });
    this.width = width;
    this.height = height;
    this.scale = scale;
    this.latitude = latitude;
    this.longitude = longitude;
    this.zoom = zoom;
    this.pitch = pitch;
    this.bearing = bearing;
    this.altitude = altitude;
    this.center = center;
    this.distanceScales = getDistanceScales(this);

    this._initMatrices();

    this.equals = this.equals.bind(this);
    this.project = this.project.bind(this);
    this.unproject = this.unproject.bind(this);
    this.projectPosition = this.projectPosition.bind(this);
    this.unprojectPosition = this.unprojectPosition.bind(this);
    Object.freeze(this);
  }

  _createClass(WebMercatorViewport, [{
    key: "_initMatrices",
    value: function _initMatrices() {
      var width = this.width,
          height = this.height,
          projectionMatrix = this.projectionMatrix,
          viewMatrix = this.viewMatrix;
      var vpm = createMat4();
      multiply(vpm, vpm, projectionMatrix);
      multiply(vpm, vpm, viewMatrix);
      this.viewProjectionMatrix = vpm;
      var m = createMat4();
      scale(m, m, [width / 2, -height / 2, 1]);
      translate(m, m, [1, -1, 0]);
      multiply(m, m, vpm);
      var mInverse = invert(createMat4(), m);

      if (!mInverse) {
        throw new Error('Pixel project matrix not invertible');
      }

      this.pixelProjectionMatrix = m;
      this.pixelUnprojectionMatrix = mInverse;
    }
  }, {
    key: "equals",
    value: function equals(viewport) {
      if (!(viewport instanceof WebMercatorViewport)) {
        return false;
      }

      return viewport.width === this.width && viewport.height === this.height && equals$1(viewport.projectionMatrix, this.projectionMatrix) && equals$1(viewport.viewMatrix, this.viewMatrix);
    }
  }, {
    key: "project",
    value: function project(xyz) {
      var _ref2 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
          _ref2$topLeft = _ref2.topLeft,
          topLeft = _ref2$topLeft === void 0 ? true : _ref2$topLeft;

      var worldPosition = this.projectPosition(xyz);
      var coord = worldToPixels(worldPosition, this.pixelProjectionMatrix);

      var _coord = _slicedToArray(coord, 2),
          x = _coord[0],
          y = _coord[1];

      var y2 = topLeft ? y : this.height - y;
      return xyz.length === 2 ? [x, y2] : [x, y2, coord[2]];
    }
  }, {
    key: "unproject",
    value: function unproject(xyz) {
      var _ref3 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
          _ref3$topLeft = _ref3.topLeft,
          topLeft = _ref3$topLeft === void 0 ? true : _ref3$topLeft,
          _ref3$targetZ = _ref3.targetZ,
          targetZ = _ref3$targetZ === void 0 ? undefined : _ref3$targetZ;

      var _xyz = _slicedToArray(xyz, 3),
          x = _xyz[0],
          y = _xyz[1],
          z = _xyz[2];

      var y2 = topLeft ? y : this.height - y;
      var targetZWorld = targetZ && targetZ * this.distanceScales.unitsPerMeter[2];
      var coord = pixelsToWorld([x, y2, z], this.pixelUnprojectionMatrix, targetZWorld);

      var _this$unprojectPositi = this.unprojectPosition(coord),
          _this$unprojectPositi2 = _slicedToArray(_this$unprojectPositi, 3),
          X = _this$unprojectPositi2[0],
          Y = _this$unprojectPositi2[1],
          Z = _this$unprojectPositi2[2];

      if (Number.isFinite(z)) {
        return [X, Y, Z];
      }

      return Number.isFinite(targetZ) ? [X, Y, targetZ] : [X, Y];
    }
  }, {
    key: "projectPosition",
    value: function projectPosition(xyz) {
      var _lngLatToWorld = lngLatToWorld(xyz),
          _lngLatToWorld2 = _slicedToArray(_lngLatToWorld, 2),
          X = _lngLatToWorld2[0],
          Y = _lngLatToWorld2[1];

      var Z = (xyz[2] || 0) * this.distanceScales.unitsPerMeter[2];
      return [X, Y, Z];
    }
  }, {
    key: "unprojectPosition",
    value: function unprojectPosition(xyz) {
      var _worldToLngLat = worldToLngLat(xyz),
          _worldToLngLat2 = _slicedToArray(_worldToLngLat, 2),
          X = _worldToLngLat2[0],
          Y = _worldToLngLat2[1];

      var Z = (xyz[2] || 0) * this.distanceScales.metersPerUnit[2];
      return [X, Y, Z];
    }
  }, {
    key: "projectFlat",
    value: function projectFlat(lngLat) {
      return lngLatToWorld(lngLat);
    }
  }, {
    key: "unprojectFlat",
    value: function unprojectFlat(xy) {
      return worldToLngLat(xy);
    }
  }, {
    key: "getMapCenterByLngLatPosition",
    value: function getMapCenterByLngLatPosition(_ref4) {
      var lngLat = _ref4.lngLat,
          pos = _ref4.pos;
      var fromLocation = pixelsToWorld(pos, this.pixelUnprojectionMatrix);
      var toLocation = lngLatToWorld(lngLat);
      var translate = add([], toLocation, negate([], fromLocation));
      var newCenter = add([], this.center, translate);
      return worldToLngLat(newCenter);
    }
  }, {
    key: "getLocationAtPoint",
    value: function getLocationAtPoint(_ref5) {
      var lngLat = _ref5.lngLat,
          pos = _ref5.pos;
      return this.getMapCenterByLngLatPosition({
        lngLat: lngLat,
        pos: pos
      });
    }
  }, {
    key: "fitBounds",
    value: function fitBounds$1(bounds) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var width = this.width,
          height = this.height;

      var _fitBounds2 = fitBounds(Object.assign({
        width: width,
        height: height,
        bounds: bounds
      }, options)),
          longitude = _fitBounds2.longitude,
          latitude = _fitBounds2.latitude,
          zoom = _fitBounds2.zoom;

      return new WebMercatorViewport({
        width: width,
        height: height,
        longitude: longitude,
        latitude: latitude,
        zoom: zoom
      });
    }
  }, {
    key: "getBounds",
    value: function getBounds(options) {
      var corners = this.getBoundingRegion(options);
      var west = Math.min.apply(Math, _toConsumableArray(corners.map(function (p) {
        return p[0];
      })));
      var east = Math.max.apply(Math, _toConsumableArray(corners.map(function (p) {
        return p[0];
      })));
      var south = Math.min.apply(Math, _toConsumableArray(corners.map(function (p) {
        return p[1];
      })));
      var north = Math.max.apply(Math, _toConsumableArray(corners.map(function (p) {
        return p[1];
      })));
      return [[west, south], [east, north]];
    }
  }, {
    key: "getBoundingRegion",
    value: function getBoundingRegion() {
      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      return getBounds(this, options.z || 0);
    }
  }]);

  return WebMercatorViewport;
}();

var TypedArrayManager = function () {
  function TypedArrayManager(props) {
    _classCallCheck(this, TypedArrayManager);

    this._pool = [];
    this.props = {
      overAlloc: 2,
      poolSize: 100
    };
    this.setProps(props);
  }

  _createClass(TypedArrayManager, [{
    key: "setProps",
    value: function setProps(props) {
      Object.assign(this.props, props);
    }
  }, {
    key: "allocate",
    value: function allocate(typedArray, count, _ref) {
      var _ref$size = _ref.size,
          size = _ref$size === void 0 ? 1 : _ref$size,
          type = _ref.type,
          _ref$padding = _ref.padding,
          padding = _ref$padding === void 0 ? 0 : _ref$padding,
          _ref$copy = _ref.copy,
          copy = _ref$copy === void 0 ? false : _ref$copy,
          _ref$initialize = _ref.initialize,
          initialize = _ref$initialize === void 0 ? false : _ref$initialize,
          maxCount = _ref.maxCount;
      var Type = type || typedArray && typedArray.constructor || Float32Array;
      var newSize = count * size + padding;

      if (ArrayBuffer.isView(typedArray)) {
        if (newSize <= typedArray.length) {
          return typedArray;
        }

        if (newSize * typedArray.BYTES_PER_ELEMENT <= typedArray.buffer.byteLength) {
          return new Type(typedArray.buffer, 0, newSize);
        }
      }

      var maxSize;

      if (maxCount) {
        maxSize = maxCount * size + padding;
      }

      var newArray = this._allocate(Type, newSize, initialize, maxSize);

      if (typedArray && copy) {
        newArray.set(typedArray);
      } else if (!initialize) {
        newArray.fill(0, 0, 4);
      }

      this._release(typedArray);

      return newArray;
    }
  }, {
    key: "release",
    value: function release(typedArray) {
      this._release(typedArray);
    }
  }, {
    key: "_allocate",
    value: function _allocate(Type, size, initialize, maxSize) {
      var sizeToAllocate = Math.max(Math.ceil(size * this.props.overAlloc), 1);

      if (sizeToAllocate > maxSize) {
        sizeToAllocate = maxSize;
      }

      var pool = this._pool;
      var byteLength = Type.BYTES_PER_ELEMENT * sizeToAllocate;
      var i = pool.findIndex(function (b) {
        return b.byteLength >= byteLength;
      });

      if (i >= 0) {
        var array = new Type(pool.splice(i, 1)[0], 0, sizeToAllocate);

        if (initialize) {
          array.fill(0);
        }

        return array;
      }

      return new Type(sizeToAllocate);
    }
  }, {
    key: "_release",
    value: function _release(typedArray) {
      if (!ArrayBuffer.isView(typedArray)) {
        return;
      }

      var pool = this._pool;
      var buffer = typedArray.buffer;
      var byteLength = buffer.byteLength;
      var i = pool.findIndex(function (b) {
        return b.byteLength >= byteLength;
      });

      if (i < 0) {
        pool.push(buffer);
      } else if (i > 0 || pool.length < this.props.poolSize) {
        pool.splice(i, 0, buffer);
      }

      if (pool.length > this.props.poolSize) {
        pool.shift();
      }
    }
  }]);

  return TypedArrayManager;
}();
var defaultTypedArrayManager = new TypedArrayManager();

function createMat4$1() {
  return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
}
function mod$1(value, divisor) {
  var modulus = value % divisor;
  return modulus < 0 ? divisor + modulus : modulus;
}
function extractCameraVectors(_ref) {
  var viewMatrix = _ref.viewMatrix,
      viewMatrixInverse = _ref.viewMatrixInverse;
  return {
    eye: [viewMatrixInverse[12], viewMatrixInverse[13], viewMatrixInverse[14]],
    direction: [-viewMatrix[2], -viewMatrix[6], -viewMatrix[10]],
    up: [viewMatrix[1], viewMatrix[5], viewMatrix[9]],
    right: [viewMatrix[0], viewMatrix[4], viewMatrix[8]]
  };
}
var cameraPosition = new Vector3();
var cameraDirection = new Vector3();
var cameraUp = new Vector3();
var cameraRight = new Vector3();
var nearCenter = new Vector3();
var farCenter = new Vector3();
var a = new Vector3();
function getFrustumPlanes(_ref2) {
  var aspect = _ref2.aspect,
      near = _ref2.near,
      far = _ref2.far,
      fovyRadians = _ref2.fovyRadians,
      position = _ref2.position,
      direction = _ref2.direction,
      up = _ref2.up,
      right = _ref2.right;
  cameraDirection.copy(direction);
  var nearFarScale = 1 / cameraDirection.len();
  cameraDirection.normalize();
  cameraPosition.copy(position);
  cameraUp.copy(up);
  var widthScale = 1 / cameraUp.len();
  cameraUp.normalize();
  cameraRight.copy(right).normalize();
  var nearHeight = 2 * Math.tan(fovyRadians / 2) * near * widthScale;
  var nearWidth = nearHeight * aspect;
  nearCenter.copy(cameraDirection).scale(near * nearFarScale).add(cameraPosition);
  farCenter.copy(cameraDirection).scale(far * nearFarScale).add(cameraPosition);
  var normal = cameraDirection.clone().negate();
  var distance = normal.dot(nearCenter);
  var planes = {
    near: {
      distance: distance,
      normal: normal
    },
    far: {
      distance: cameraDirection.dot(farCenter),
      normal: cameraDirection.clone()
    }
  };
  a.copy(cameraRight).scale(nearWidth * 0.5).add(nearCenter).subtract(cameraPosition).normalize();
  normal = new Vector3(a).cross(cameraUp);
  distance = cameraPosition.dot(normal);
  planes.right = {
    normal: normal,
    distance: distance
  };
  a.copy(cameraRight).scale(-nearWidth * 0.5).add(nearCenter).subtract(cameraPosition).normalize();
  normal = new Vector3(cameraUp).cross(a);
  distance = cameraPosition.dot(normal);
  planes.left = {
    normal: normal,
    distance: distance
  };
  a.copy(cameraUp).scale(nearHeight * 0.5).add(nearCenter).subtract(cameraPosition).normalize();
  normal = new Vector3(cameraRight).cross(a);
  distance = cameraPosition.dot(normal);
  planes.top = {
    normal: normal,
    distance: distance
  };
  a.copy(cameraUp).scale(-nearHeight * 0.5).add(nearCenter).subtract(cameraPosition).normalize();
  normal = new Vector3(a).cross(cameraRight);
  distance = cameraPosition.dot(normal);
  planes.bottom = {
    normal: normal,
    distance: distance
  };
  return planes;
}
function fp64LowPart(x) {
  return x - Math.fround(x);
}
var scratchArray;
function toDoublePrecisionArray(typedArray, _ref3) {
  var _ref3$size = _ref3.size,
      size = _ref3$size === void 0 ? 1 : _ref3$size,
      _ref3$startIndex = _ref3.startIndex,
      startIndex = _ref3$startIndex === void 0 ? 0 : _ref3$startIndex,
      endIndex = _ref3.endIndex;

  if (!Number.isFinite(endIndex)) {
    endIndex = typedArray.length;
  }

  var count = (endIndex - startIndex) / size;
  scratchArray = defaultTypedArrayManager.allocate(scratchArray, count, {
    type: Float32Array,
    size: size * 2
  });
  var sourceIndex = startIndex;
  var targetIndex = 0;

  while (sourceIndex < endIndex) {
    for (var j = 0; j < size; j++) {
      var value = typedArray[sourceIndex++];
      scratchArray[targetIndex + j] = value;
      scratchArray[targetIndex + j + size] = fp64LowPart(value);
    }

    targetIndex += size * 2;
  }

  return scratchArray.subarray(0, count * size * 2);
}

var DEGREES_TO_RADIANS$2 = Math.PI / 180;
var IDENTITY$1 = createMat4$1();
var ZERO_VECTOR$1 = [0, 0, 0];
var DEFAULT_ZOOM = 0;
var DEFAULT_DISTANCE_SCALES = {
  unitsPerMeter: [1, 1, 1],
  metersPerUnit: [1, 1, 1]
};

var Viewport = function () {
  function Viewport() {
    var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, Viewport);

    var _opts$id = opts.id,
        id = _opts$id === void 0 ? null : _opts$id,
        _opts$x = opts.x,
        x = _opts$x === void 0 ? 0 : _opts$x,
        _opts$y = opts.y,
        y = _opts$y === void 0 ? 0 : _opts$y,
        _opts$width = opts.width,
        width = _opts$width === void 0 ? 1 : _opts$width,
        _opts$height = opts.height,
        height = _opts$height === void 0 ? 1 : _opts$height;
    this.id = id || this.constructor.displayName || 'viewport';
    this.x = x;
    this.y = y;
    this.width = width || 1;
    this.height = height || 1;
    this._frustumPlanes = {};

    this._initViewMatrix(opts);

    this._initProjectionMatrix(opts);

    this._initPixelMatrices();

    this.equals = this.equals.bind(this);
    this.project = this.project.bind(this);
    this.unproject = this.unproject.bind(this);
    this.projectPosition = this.projectPosition.bind(this);
    this.unprojectPosition = this.unprojectPosition.bind(this);
    this.projectFlat = this.projectFlat.bind(this);
    this.unprojectFlat = this.unprojectFlat.bind(this);
  }

  _createClass(Viewport, [{
    key: "equals",
    value: function equals$1(viewport) {
      if (!(viewport instanceof Viewport)) {
        return false;
      }

      if (this === viewport) {
        return true;
      }

      return viewport.width === this.width && viewport.height === this.height && viewport.scale === this.scale && equals(viewport.projectionMatrix, this.projectionMatrix) && equals(viewport.viewMatrix, this.viewMatrix);
    }
  }, {
    key: "project",
    value: function project(xyz) {
      var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
          _ref$topLeft = _ref.topLeft,
          topLeft = _ref$topLeft === void 0 ? true : _ref$topLeft;

      var worldPosition = this.projectPosition(xyz);
      var coord = worldToPixels(worldPosition, this.pixelProjectionMatrix);

      var _coord = _slicedToArray(coord, 2),
          x = _coord[0],
          y = _coord[1];

      var y2 = topLeft ? y : this.height - y;
      return xyz.length === 2 ? [x, y2] : [x, y2, coord[2]];
    }
  }, {
    key: "unproject",
    value: function unproject(xyz) {
      var _ref2 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
          _ref2$topLeft = _ref2.topLeft,
          topLeft = _ref2$topLeft === void 0 ? true : _ref2$topLeft,
          targetZ = _ref2.targetZ;

      var _xyz = _slicedToArray(xyz, 3),
          x = _xyz[0],
          y = _xyz[1],
          z = _xyz[2];

      var y2 = topLeft ? y : this.height - y;
      var targetZWorld = targetZ && targetZ * this.distanceScales.unitsPerMeter[2];
      var coord = pixelsToWorld([x, y2, z], this.pixelUnprojectionMatrix, targetZWorld);

      var _this$unprojectPositi = this.unprojectPosition(coord),
          _this$unprojectPositi2 = _slicedToArray(_this$unprojectPositi, 3),
          X = _this$unprojectPositi2[0],
          Y = _this$unprojectPositi2[1],
          Z = _this$unprojectPositi2[2];

      if (Number.isFinite(z)) {
        return [X, Y, Z];
      }

      return Number.isFinite(targetZ) ? [X, Y, targetZ] : [X, Y];
    }
  }, {
    key: "projectPosition",
    value: function projectPosition(xyz) {
      var _this$projectFlat = this.projectFlat(xyz),
          _this$projectFlat2 = _slicedToArray(_this$projectFlat, 2),
          X = _this$projectFlat2[0],
          Y = _this$projectFlat2[1];

      var Z = (xyz[2] || 0) * this.distanceScales.unitsPerMeter[2];
      return [X, Y, Z];
    }
  }, {
    key: "unprojectPosition",
    value: function unprojectPosition(xyz) {
      var _this$unprojectFlat = this.unprojectFlat(xyz),
          _this$unprojectFlat2 = _slicedToArray(_this$unprojectFlat, 2),
          X = _this$unprojectFlat2[0],
          Y = _this$unprojectFlat2[1];

      var Z = (xyz[2] || 0) * this.distanceScales.metersPerUnit[2];
      return [X, Y, Z];
    }
  }, {
    key: "projectFlat",
    value: function projectFlat(xyz) {
      if (this.isGeospatial) {
        return lngLatToWorld(xyz);
      }

      return xyz;
    }
  }, {
    key: "unprojectFlat",
    value: function unprojectFlat(xyz) {
      if (this.isGeospatial) {
        return worldToLngLat(xyz);
      }

      return xyz;
    }
  }, {
    key: "getBounds",
    value: function getBounds() {
      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var unprojectOption = {
        targetZ: options.z || 0
      };
      var topLeft = this.unproject([0, 0], unprojectOption);
      var topRight = this.unproject([this.width, 0], unprojectOption);
      var bottomLeft = this.unproject([0, this.height], unprojectOption);
      var bottomRight = this.unproject([this.width, this.height], unprojectOption);
      return [Math.min(topLeft[0], topRight[0], bottomLeft[0], bottomRight[0]), Math.min(topLeft[1], topRight[1], bottomLeft[1], bottomRight[1]), Math.max(topLeft[0], topRight[0], bottomLeft[0], bottomRight[0]), Math.max(topLeft[1], topRight[1], bottomLeft[1], bottomRight[1])];
    }
  }, {
    key: "getDistanceScales",
    value: function getDistanceScales$1() {
      var coordinateOrigin = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

      if (coordinateOrigin) {
        return getDistanceScales({
          longitude: coordinateOrigin[0],
          latitude: coordinateOrigin[1],
          highPrecision: true
        });
      }

      return this.distanceScales;
    }
  }, {
    key: "containsPixel",
    value: function containsPixel(_ref3) {
      var x = _ref3.x,
          y = _ref3.y,
          _ref3$width = _ref3.width,
          width = _ref3$width === void 0 ? 1 : _ref3$width,
          _ref3$height = _ref3.height,
          height = _ref3$height === void 0 ? 1 : _ref3$height;
      return x < this.x + this.width && this.x < x + width && y < this.y + this.height && this.y < y + height;
    }
  }, {
    key: "getFrustumPlanes",
    value: function getFrustumPlanes$1() {
      if (this._frustumPlanes.near) {
        return this._frustumPlanes;
      }

      var _this$projectionProps = this.projectionProps,
          near = _this$projectionProps.near,
          far = _this$projectionProps.far,
          fovyRadians = _this$projectionProps.fovyRadians,
          aspect = _this$projectionProps.aspect;
      Object.assign(this._frustumPlanes, getFrustumPlanes({
        aspect: aspect,
        near: near,
        far: far,
        fovyRadians: fovyRadians,
        position: this.cameraPosition,
        direction: this.cameraDirection,
        up: this.cameraUp,
        right: this.cameraRight
      }));
      return this._frustumPlanes;
    }
  }, {
    key: "getCameraPosition",
    value: function getCameraPosition() {
      return this.cameraPosition;
    }
  }, {
    key: "getCameraDirection",
    value: function getCameraDirection() {
      return this.cameraDirection;
    }
  }, {
    key: "getCameraUp",
    value: function getCameraUp() {
      return this.cameraUp;
    }
  }, {
    key: "_createProjectionMatrix",
    value: function _createProjectionMatrix(_ref4) {
      var orthographic = _ref4.orthographic,
          fovyRadians = _ref4.fovyRadians,
          aspect = _ref4.aspect,
          focalDistance = _ref4.focalDistance,
          near = _ref4.near,
          far = _ref4.far;
      return orthographic ? new Matrix4().orthographic({
        fovy: fovyRadians,
        aspect: aspect,
        focalDistance: focalDistance,
        near: near,
        far: far
      }) : new Matrix4().perspective({
        fovy: fovyRadians,
        aspect: aspect,
        near: near,
        far: far
      });
    }
  }, {
    key: "_initViewMatrix",
    value: function _initViewMatrix(opts) {
      var _opts$viewMatrix = opts.viewMatrix,
          viewMatrix = _opts$viewMatrix === void 0 ? IDENTITY$1 : _opts$viewMatrix,
          _opts$longitude = opts.longitude,
          longitude = _opts$longitude === void 0 ? null : _opts$longitude,
          _opts$latitude = opts.latitude,
          latitude = _opts$latitude === void 0 ? null : _opts$latitude,
          _opts$zoom = opts.zoom,
          zoom = _opts$zoom === void 0 ? null : _opts$zoom,
          _opts$position = opts.position,
          position = _opts$position === void 0 ? null : _opts$position,
          _opts$modelMatrix = opts.modelMatrix,
          modelMatrix = _opts$modelMatrix === void 0 ? null : _opts$modelMatrix,
          _opts$focalDistance = opts.focalDistance,
          focalDistance = _opts$focalDistance === void 0 ? 1 : _opts$focalDistance,
          _opts$distanceScales = opts.distanceScales,
          distanceScales = _opts$distanceScales === void 0 ? null : _opts$distanceScales;
      this.isGeospatial = Number.isFinite(latitude) && Number.isFinite(longitude);
      this.zoom = zoom;

      if (!Number.isFinite(this.zoom)) {
        this.zoom = this.isGeospatial ? getMeterZoom({
          latitude: latitude
        }) + Math.log2(focalDistance) : DEFAULT_ZOOM;
      }

      var scale = Math.pow(2, this.zoom);
      this.scale = scale;
      this.distanceScales = this.isGeospatial ? getDistanceScales({
        latitude: latitude,
        longitude: longitude
      }) : distanceScales || DEFAULT_DISTANCE_SCALES;
      this.focalDistance = focalDistance;
      this.distanceScales.metersPerUnit = new Vector3(this.distanceScales.metersPerUnit);
      this.distanceScales.unitsPerMeter = new Vector3(this.distanceScales.unitsPerMeter);
      this.position = ZERO_VECTOR$1;
      this.meterOffset = ZERO_VECTOR$1;

      if (position) {
        this.position = position;
        this.modelMatrix = modelMatrix;
        this.meterOffset = modelMatrix ? modelMatrix.transformVector(position) : position;
      }

      if (this.isGeospatial) {
        this.longitude = longitude;
        this.latitude = latitude;
        this.center = this._getCenterInWorld({
          longitude: longitude,
          latitude: latitude
        });
      } else {
        this.center = position ? this.projectPosition(position) : [0, 0, 0];
      }

      this.viewMatrixUncentered = viewMatrix;
      this.viewMatrix = new Matrix4().multiplyRight(this.viewMatrixUncentered).translate(new Vector3(this.center || ZERO_VECTOR$1).negate());
    }
  }, {
    key: "_getCenterInWorld",
    value: function _getCenterInWorld(_ref5) {
      var longitude = _ref5.longitude,
          latitude = _ref5.latitude;
      var meterOffset = this.meterOffset,
          distanceScales = this.distanceScales;
      var center = new Vector3(this.projectPosition([longitude, latitude, 0]));

      if (meterOffset) {
        var commonPosition = new Vector3(meterOffset).scale(distanceScales.unitsPerMeter);
        center.add(commonPosition);
      }

      return center;
    }
  }, {
    key: "_initProjectionMatrix",
    value: function _initProjectionMatrix(opts) {
      var _opts$projectionMatri = opts.projectionMatrix,
          projectionMatrix = _opts$projectionMatri === void 0 ? null : _opts$projectionMatri,
          _opts$orthographic = opts.orthographic,
          orthographic = _opts$orthographic === void 0 ? false : _opts$orthographic,
          fovyRadians = opts.fovyRadians,
          _opts$fovy = opts.fovy,
          fovy = _opts$fovy === void 0 ? 75 : _opts$fovy,
          _opts$near = opts.near,
          near = _opts$near === void 0 ? 0.1 : _opts$near,
          _opts$far = opts.far,
          far = _opts$far === void 0 ? 1000 : _opts$far,
          _opts$focalDistance2 = opts.focalDistance,
          focalDistance = _opts$focalDistance2 === void 0 ? 1 : _opts$focalDistance2;
      this.projectionProps = {
        orthographic: orthographic,
        fovyRadians: fovyRadians || fovy * DEGREES_TO_RADIANS$2,
        aspect: this.width / this.height,
        focalDistance: focalDistance,
        near: near,
        far: far
      };
      this.projectionMatrix = projectionMatrix || this._createProjectionMatrix(this.projectionProps);
    }
  }, {
    key: "_initPixelMatrices",
    value: function _initPixelMatrices() {
      var vpm = createMat4$1();
      multiply(vpm, vpm, this.projectionMatrix);
      multiply(vpm, vpm, this.viewMatrix);
      this.viewProjectionMatrix = vpm;
      this.viewMatrixInverse = invert([], this.viewMatrix) || this.viewMatrix;

      var _extractCameraVectors = extractCameraVectors({
        viewMatrix: this.viewMatrix,
        viewMatrixInverse: this.viewMatrixInverse
      }),
          eye = _extractCameraVectors.eye,
          direction = _extractCameraVectors.direction,
          up = _extractCameraVectors.up,
          right = _extractCameraVectors.right;

      this.cameraPosition = eye;
      this.cameraDirection = direction;
      this.cameraUp = up;
      this.cameraRight = right;
      var viewportMatrix = createMat4$1();
      var pixelProjectionMatrix = createMat4$1();
      scale(viewportMatrix, viewportMatrix, [this.width / 2, -this.height / 2, 1]);
      translate(viewportMatrix, viewportMatrix, [1, -1, 0]);
      multiply(pixelProjectionMatrix, viewportMatrix, this.viewProjectionMatrix);
      this.pixelProjectionMatrix = pixelProjectionMatrix;
      this.viewportMatrix = viewportMatrix;
      this.pixelUnprojectionMatrix = invert(createMat4$1(), this.pixelProjectionMatrix);

      if (!this.pixelUnprojectionMatrix) {
        log.warn('Pixel project matrix not invertible')();
      }
    }
  }, {
    key: "metersPerPixel",
    get: function get() {
      return this.distanceScales.metersPerUnit[2] / this.scale;
    }
  }, {
    key: "projectionMode",
    get: function get() {
      if (this.isGeospatial) {
        return this.zoom < 12 ? PROJECTION_MODE.WEB_MERCATOR : PROJECTION_MODE.WEB_MERCATOR_AUTO_OFFSET;
      }

      return PROJECTION_MODE.IDENTITY;
    }
  }]);

  return Viewport;
}();
Viewport.displayName = 'Viewport';

function ownKeys$4(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread$5(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys$4(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys$4(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _createSuper$5(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct$6(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _isNativeReflectConstruct$6() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

var WebMercatorViewport$1 = function (_Viewport) {
  _inherits(WebMercatorViewport, _Viewport);

  var _super = _createSuper$5(WebMercatorViewport);

  function WebMercatorViewport() {
    var _this;

    var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, WebMercatorViewport);

    var _opts$latitude = opts.latitude,
        latitude = _opts$latitude === void 0 ? 0 : _opts$latitude,
        _opts$longitude = opts.longitude,
        longitude = _opts$longitude === void 0 ? 0 : _opts$longitude,
        _opts$zoom = opts.zoom,
        zoom = _opts$zoom === void 0 ? 11 : _opts$zoom,
        _opts$pitch = opts.pitch,
        pitch = _opts$pitch === void 0 ? 0 : _opts$pitch,
        _opts$bearing = opts.bearing,
        bearing = _opts$bearing === void 0 ? 0 : _opts$bearing,
        _opts$nearZMultiplier = opts.nearZMultiplier,
        nearZMultiplier = _opts$nearZMultiplier === void 0 ? 0.1 : _opts$nearZMultiplier,
        _opts$farZMultiplier = opts.farZMultiplier,
        farZMultiplier = _opts$farZMultiplier === void 0 ? 1.01 : _opts$farZMultiplier,
        _opts$orthographic = opts.orthographic,
        orthographic = _opts$orthographic === void 0 ? false : _opts$orthographic,
        _opts$repeat = opts.repeat,
        repeat = _opts$repeat === void 0 ? false : _opts$repeat,
        _opts$worldOffset = opts.worldOffset,
        worldOffset = _opts$worldOffset === void 0 ? 0 : _opts$worldOffset;
    var width = opts.width,
        height = opts.height,
        _opts$altitude = opts.altitude,
        altitude = _opts$altitude === void 0 ? 1.5 : _opts$altitude;
    var scale = Math.pow(2, zoom);
    width = width || 1;
    height = height || 1;
    altitude = Math.max(0.75, altitude);

    var _getProjectionParamet = getProjectionParameters({
      width: width,
      height: height,
      pitch: pitch,
      altitude: altitude,
      nearZMultiplier: nearZMultiplier,
      farZMultiplier: farZMultiplier
    }),
        fov = _getProjectionParamet.fov,
        aspect = _getProjectionParamet.aspect,
        focalDistance = _getProjectionParamet.focalDistance,
        near = _getProjectionParamet.near,
        far = _getProjectionParamet.far;

    var viewMatrixUncentered = getViewMatrix({
      height: height,
      pitch: pitch,
      bearing: bearing,
      scale: scale,
      altitude: altitude
    });

    if (worldOffset) {
      var viewOffset = new Matrix4().translate([512 * worldOffset, 0, 0]);
      viewMatrixUncentered = viewOffset.multiplyLeft(viewMatrixUncentered);
    }

    var viewportOpts = Object.assign({}, opts, {
      width: width,
      height: height,
      viewMatrix: viewMatrixUncentered,
      longitude: longitude,
      latitude: latitude,
      zoom: zoom,
      orthographic: orthographic,
      fovyRadians: fov,
      aspect: aspect,
      focalDistance: orthographic ? focalDistance : 1,
      near: near,
      far: far
    });
    _this = _super.call(this, viewportOpts);
    _this.latitude = latitude;
    _this.longitude = longitude;
    _this.zoom = zoom;
    _this.pitch = pitch;
    _this.bearing = bearing;
    _this.altitude = altitude;
    _this.orthographic = orthographic;
    _this._subViewports = repeat ? [] : null;
    Object.freeze(_assertThisInitialized(_this));
    return _this;
  }

  _createClass(WebMercatorViewport, [{
    key: "addMetersToLngLat",
    value: function addMetersToLngLat$1(lngLatZ, xyz) {
      return addMetersToLngLat(lngLatZ, xyz);
    }
  }, {
    key: "getMapCenterByLngLatPosition",
    value: function getMapCenterByLngLatPosition(_ref) {
      var lngLat = _ref.lngLat,
          pos = _ref.pos;
      var fromLocation = pixelsToWorld(pos, this.pixelUnprojectionMatrix);
      var toLocation = this.projectFlat(lngLat);
      var translate = add([], toLocation, negate([], fromLocation));
      var newCenter = add([], this.center, translate);
      return this.unprojectFlat(newCenter);
    }
  }, {
    key: "getBounds",
    value: function getBounds$1() {
      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      var corners = getBounds(this, options.z || 0);

      return [Math.min(corners[0][0], corners[1][0], corners[2][0], corners[3][0]), Math.min(corners[0][1], corners[1][1], corners[2][1], corners[3][1]), Math.max(corners[0][0], corners[1][0], corners[2][0], corners[3][0]), Math.max(corners[0][1], corners[1][1], corners[2][1], corners[3][1])];
    }
  }, {
    key: "fitBounds",
    value: function fitBounds$1(bounds) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var width = this.width,
          height = this.height;

      var _fitBounds2 = fitBounds(Object.assign({
        width: width,
        height: height,
        bounds: bounds
      }, options)),
          longitude = _fitBounds2.longitude,
          latitude = _fitBounds2.latitude,
          zoom = _fitBounds2.zoom;

      return new WebMercatorViewport({
        width: width,
        height: height,
        longitude: longitude,
        latitude: latitude,
        zoom: zoom
      });
    }
  }, {
    key: "subViewports",
    get: function get() {
      if (this._subViewports && !this._subViewports.length) {
        var bounds = this.getBounds();
        var minOffset = Math.floor((bounds[0] + 180) / 360);
        var maxOffset = Math.ceil((bounds[2] - 180) / 360);

        for (var x = minOffset; x <= maxOffset; x++) {
          var offsetViewport = x ? new WebMercatorViewport(_objectSpread$5(_objectSpread$5({}, this), {}, {
            worldOffset: x
          })) : this;

          this._subViewports.push(offsetViewport);
        }
      }

      return this._subViewports;
    }
  }]);

  return WebMercatorViewport;
}(Viewport);
WebMercatorViewport$1.displayName = 'WebMercatorViewport';

function lngLatZToWorldPosition(lngLatZ, viewport) {
  var offsetMode = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
  var p = viewport.projectPosition(lngLatZ);

  if (offsetMode && viewport instanceof WebMercatorViewport$1) {
    var _lngLatZ = _slicedToArray(lngLatZ, 3),
        longitude = _lngLatZ[0],
        latitude = _lngLatZ[1],
        _lngLatZ$ = _lngLatZ[2],
        z = _lngLatZ$ === void 0 ? 0 : _lngLatZ$;

    var distanceScales = viewport.getDistanceScales([longitude, latitude]);
    p[2] = z * distanceScales.unitsPerMeter[2];
  }

  return p;
}

function normalizeParameters(opts) {
  var normalizedParams = Object.assign({}, opts);
  var coordinateSystem = opts.coordinateSystem;
  var viewport = opts.viewport,
      coordinateOrigin = opts.coordinateOrigin,
      fromCoordinateSystem = opts.fromCoordinateSystem,
      fromCoordinateOrigin = opts.fromCoordinateOrigin;

  if (coordinateSystem === COORDINATE_SYSTEM.DEFAULT) {
    coordinateSystem = viewport.isGeospatial ? COORDINATE_SYSTEM.LNGLAT : COORDINATE_SYSTEM.CARTESIAN;
  }

  if (fromCoordinateSystem === undefined) {
    normalizedParams.fromCoordinateSystem = coordinateSystem;
  }

  if (fromCoordinateOrigin === undefined) {
    normalizedParams.fromCoordinateOrigin = coordinateOrigin;
  }

  normalizedParams.coordinateSystem = coordinateSystem;
  return normalizedParams;
}

function getWorldPosition(position, _ref) {
  var viewport = _ref.viewport,
      modelMatrix = _ref.modelMatrix,
      coordinateSystem = _ref.coordinateSystem,
      coordinateOrigin = _ref.coordinateOrigin,
      offsetMode = _ref.offsetMode;

  var _position = _slicedToArray(position, 3),
      x = _position[0],
      y = _position[1],
      _position$ = _position[2],
      z = _position$ === void 0 ? 0 : _position$;

  if (modelMatrix) {
    var _vec4$transformMat = transformMat4$2([], [x, y, z, 1.0], modelMatrix);

    var _vec4$transformMat2 = _slicedToArray(_vec4$transformMat, 3);

    x = _vec4$transformMat2[0];
    y = _vec4$transformMat2[1];
    z = _vec4$transformMat2[2];
  }

  switch (coordinateSystem) {
    case COORDINATE_SYSTEM.LNGLAT:
      return lngLatZToWorldPosition([x, y, z], viewport, offsetMode);

    case COORDINATE_SYSTEM.LNGLAT_OFFSETS:
      return lngLatZToWorldPosition([x + coordinateOrigin[0], y + coordinateOrigin[1], z + (coordinateOrigin[2] || 0)], viewport, offsetMode);

    case COORDINATE_SYSTEM.METER_OFFSETS:
      return lngLatZToWorldPosition(addMetersToLngLat(coordinateOrigin, [x, y, z]), viewport, offsetMode);

    case COORDINATE_SYSTEM.CARTESIAN:
    default:
      return viewport.isGeospatial ? [x + coordinateOrigin[0], y + coordinateOrigin[1], z + coordinateOrigin[2]] : viewport.projectPosition([x, y, z]);
  }
}
function projectPosition(position, params) {
  var _normalizeParameters = normalizeParameters(params),
      viewport = _normalizeParameters.viewport,
      coordinateSystem = _normalizeParameters.coordinateSystem,
      coordinateOrigin = _normalizeParameters.coordinateOrigin,
      modelMatrix = _normalizeParameters.modelMatrix,
      fromCoordinateSystem = _normalizeParameters.fromCoordinateSystem,
      fromCoordinateOrigin = _normalizeParameters.fromCoordinateOrigin;

  var _getOffsetOrigin = getOffsetOrigin(viewport, coordinateSystem, coordinateOrigin),
      geospatialOrigin = _getOffsetOrigin.geospatialOrigin,
      shaderCoordinateOrigin = _getOffsetOrigin.shaderCoordinateOrigin,
      offsetMode = _getOffsetOrigin.offsetMode;

  var worldPosition = getWorldPosition(position, {
    viewport: viewport,
    modelMatrix: modelMatrix,
    coordinateSystem: fromCoordinateSystem,
    coordinateOrigin: fromCoordinateOrigin,
    offsetMode: offsetMode
  });

  if (offsetMode) {
    var positionCommonSpace = viewport.projectPosition(geospatialOrigin || shaderCoordinateOrigin);
    sub(worldPosition, worldPosition, positionCommonSpace);
  }

  return worldPosition;
}

function ownKeys$5(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread$6(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys$5(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys$5(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

var ShaderAttribute = function () {
  function ShaderAttribute(dataColumn, opts) {
    _classCallCheck(this, ShaderAttribute);

    this.opts = opts;
    this.source = dataColumn;
  }

  _createClass(ShaderAttribute, [{
    key: "getValue",
    value: function getValue() {
      var buffer = this.source.getBuffer();
      var accessor = this.getAccessor();

      if (buffer) {
        return [buffer, accessor];
      }

      var value = this.source.value;
      var size = accessor.size;
      var constantValue = value;

      if (value && value.length !== size) {
        constantValue = new Float32Array(size);
        var index = accessor.elementOffset || 0;

        for (var i = 0; i < size; ++i) {
          constantValue[i] = value[index + i];
        }
      }

      return constantValue;
    }
  }, {
    key: "getAccessor",
    value: function getAccessor() {
      return _objectSpread$6(_objectSpread$6({}, this.source.getAccessor()), this.opts);
    }
  }, {
    key: "value",
    get: function get() {
      return this.source.value;
    }
  }]);

  return ShaderAttribute;
}();

function glArrayFromType(glType) {
  switch (glType) {
    case 5126:
      return Float32Array;

    case 5130:
      return Float64Array;

    case 5123:
    case 33635:
    case 32819:
    case 32820:
      return Uint16Array;

    case 5125:
      return Uint32Array;

    case 5121:
      return Uint8ClampedArray;

    case 5120:
      return Int8Array;

    case 5122:
      return Int16Array;

    case 5124:
      return Int32Array;

    default:
      throw new Error('Unknown GL type');
  }
}

function ownKeys$6(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread$7(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys$6(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys$6(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function getStride(accessor) {
  return accessor.stride || accessor.size * accessor.bytesPerElement;
}

function resolveShaderAttribute(baseAccessor, shaderAttributeOptions) {
  if (shaderAttributeOptions.offset) {
    log.removed('shaderAttribute.offset', 'vertexOffset, elementOffset')();
  }

  var stride = getStride(baseAccessor);
  var vertexOffset = 'vertexOffset' in shaderAttributeOptions ? shaderAttributeOptions.vertexOffset : baseAccessor.vertexOffset || 0;
  var elementOffset = shaderAttributeOptions.elementOffset || 0;
  var offset = vertexOffset * stride + elementOffset * baseAccessor.bytesPerElement + (baseAccessor.offset || 0);
  return _objectSpread$7(_objectSpread$7({}, shaderAttributeOptions), {}, {
    offset: offset,
    stride: stride
  });
}

function resolveDoublePrecisionShaderAttributes(baseAccessor, shaderAttributeOptions) {
  var resolvedOptions = resolveShaderAttribute(baseAccessor, shaderAttributeOptions);
  return {
    high: resolvedOptions,
    low: _objectSpread$7(_objectSpread$7({}, resolvedOptions), {}, {
      offset: resolvedOptions.offset + baseAccessor.size * 4
    })
  };
}

var DataColumn = function () {
  function DataColumn(gl, opts) {
    _classCallCheck(this, DataColumn);

    this.gl = gl;
    this.id = opts.id;
    this.size = opts.size;
    var logicalType = opts.logicalType || opts.type;
    var doublePrecision = logicalType === 5130;
    var defaultValue = opts.defaultValue;
    defaultValue = Number.isFinite(defaultValue) ? [defaultValue] : defaultValue || new Array(this.size).fill(0);
    opts.defaultValue = defaultValue;
    var bufferType = logicalType;

    if (doublePrecision) {
      bufferType = 5126;
    } else if (!bufferType && opts.isIndexed) {
      bufferType = gl && hasFeature(gl, FEATURES.ELEMENT_INDEX_UINT32) ? 5125 : 5123;
    } else if (!bufferType) {
      bufferType = 5126;
    }

    opts.logicalType = logicalType;
    opts.type = bufferType;
    var defaultType = glArrayFromType(logicalType || bufferType || 5126);
    this.shaderAttributes = {};
    this.doublePrecision = doublePrecision;

    if (doublePrecision && opts.fp64 === false) {
      defaultType = Float32Array;
    }

    opts.bytesPerElement = defaultType.BYTES_PER_ELEMENT;
    this.defaultType = defaultType;
    this.value = null;
    this.settings = opts;
    this.state = {
      externalBuffer: null,
      bufferAccessor: opts,
      allocatedValue: null,
      constant: false
    };
    this._buffer = null;
    this.setData(opts);
  }

  _createClass(DataColumn, [{
    key: "delete",
    value: function _delete() {
      if (this._buffer) {
        this._buffer["delete"]();

        this._buffer = null;
      }

      defaultTypedArrayManager.release(this.state.allocatedValue);
    }
  }, {
    key: "getShaderAttributes",
    value: function getShaderAttributes(id, options) {
      if (this.doublePrecision) {
        var shaderAttributes = {};
        var isBuffer64Bit = this.value instanceof Float64Array;
        var doubleShaderAttributeDefs = resolveDoublePrecisionShaderAttributes(this.getAccessor(), options || {});
        shaderAttributes[id] = new ShaderAttribute(this, doubleShaderAttributeDefs.high);
        shaderAttributes["".concat(id, "64Low")] = isBuffer64Bit ? new ShaderAttribute(this, doubleShaderAttributeDefs.low) : new Float32Array(this.size);
        return shaderAttributes;
      }

      if (options) {
        var shaderAttributeDef = resolveShaderAttribute(this.getAccessor(), options);
        return _defineProperty({}, id, new ShaderAttribute(this, shaderAttributeDef));
      }

      return _defineProperty({}, id, this);
    }
  }, {
    key: "getBuffer",
    value: function getBuffer() {
      if (this.state.constant) {
        return null;
      }

      return this.state.externalBuffer || this._buffer;
    }
  }, {
    key: "getValue",
    value: function getValue() {
      if (this.state.constant) {
        return this.value;
      }

      return [this.getBuffer(), this.getAccessor()];
    }
  }, {
    key: "getAccessor",
    value: function getAccessor() {
      return this.state.bufferAccessor;
    }
  }, {
    key: "setData",
    value: function setData(opts) {
      var state = this.state;

      if (ArrayBuffer.isView(opts)) {
        opts = {
          value: opts
        };
      } else if (opts instanceof Buffer) {
        opts = {
          buffer: opts
        };
      }

      var accessor = _objectSpread$7(_objectSpread$7({}, this.settings), opts);

      state.bufferAccessor = accessor;

      if (opts.constant) {
        var value = opts.value;
        value = this._normalizeValue(value, [], 0);

        if (this.settings.normalized) {
          value = this._normalizeConstant(value);
        }

        var hasChanged = !state.constant || !this._areValuesEqual(value, this.value);

        if (!hasChanged) {
          return false;
        }

        state.externalBuffer = null;
        state.constant = true;
        this.value = value;
      } else if (opts.buffer) {
        var buffer = opts.buffer;
        state.externalBuffer = buffer;
        state.constant = false;
        this.value = opts.value;
        var isBuffer64Bit = opts.value instanceof Float64Array;
        accessor.type = opts.type || buffer.accessor.type;
        accessor.bytesPerElement = buffer.accessor.BYTES_PER_ELEMENT * (isBuffer64Bit ? 2 : 1);
        accessor.stride = getStride(accessor);
      } else if (opts.value) {
        this._checkExternalBuffer(opts);

        var _value = opts.value;
        state.externalBuffer = null;
        state.constant = false;
        this.value = _value;
        accessor.bytesPerElement = _value.BYTES_PER_ELEMENT;
        accessor.stride = getStride(accessor);
        var _buffer = this.buffer,
            byteOffset = this.byteOffset;

        if (this.doublePrecision && _value instanceof Float64Array) {
          _value = toDoublePrecisionArray(_value, accessor);
        }

        var requiredBufferSize = _value.byteLength + byteOffset + accessor.stride * 2;

        if (_buffer.byteLength < requiredBufferSize) {
          _buffer.reallocate(requiredBufferSize);
        }

        _buffer.setAccessor(null);

        _buffer.subData({
          data: _value,
          offset: byteOffset
        });

        accessor.type = opts.type || _buffer.accessor.type;
      }

      return true;
    }
  }, {
    key: "updateSubBuffer",
    value: function updateSubBuffer() {
      var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var value = this.value;
      var _opts$startOffset = opts.startOffset,
          startOffset = _opts$startOffset === void 0 ? 0 : _opts$startOffset,
          endOffset = opts.endOffset;
      this.buffer.subData({
        data: this.doublePrecision && value instanceof Float64Array ? toDoublePrecisionArray(value, {
          size: this.size,
          startIndex: startOffset,
          endIndex: endOffset
        }) : value.subarray(startOffset, endOffset),
        offset: startOffset * value.BYTES_PER_ELEMENT + this.byteOffset
      });
    }
  }, {
    key: "allocate",
    value: function allocate(_ref3) {
      var numInstances = _ref3.numInstances,
          _ref3$copy = _ref3.copy,
          copy = _ref3$copy === void 0 ? false : _ref3$copy;
      var state = this.state;
      var oldValue = state.allocatedValue;
      var value = defaultTypedArrayManager.allocate(oldValue, numInstances + 1, {
        size: this.size,
        type: this.defaultType,
        copy: copy
      });
      this.value = value;
      var buffer = this.buffer,
          byteOffset = this.byteOffset;

      if (buffer.byteLength < value.byteLength + byteOffset) {
        buffer.reallocate(value.byteLength + byteOffset);

        if (copy && oldValue) {
          buffer.subData({
            data: oldValue instanceof Float64Array ? toDoublePrecisionArray(oldValue, this) : oldValue,
            offset: byteOffset
          });
        }
      }

      state.allocatedValue = value;
      state.constant = false;
      state.externalBuffer = null;
      state.bufferAccessor = this.settings;
      return true;
    }
  }, {
    key: "_checkExternalBuffer",
    value: function _checkExternalBuffer(opts) {
      var value = opts.value;

      if (!opts.constant && value) {
        var ArrayType = this.defaultType;
        var illegalArrayType = false;

        if (this.doublePrecision) {
          illegalArrayType = value.BYTES_PER_ELEMENT < 4;
        }

        if (illegalArrayType) {
          throw new Error("Attribute ".concat(this.id, " does not support ").concat(value.constructor.name));
        }

        if (!(value instanceof ArrayType) && this.settings.normalized && !('normalized' in opts)) {
          log.warn("Attribute ".concat(this.id, " is normalized"))();
        }
      }
    }
  }, {
    key: "_normalizeConstant",
    value: function _normalizeConstant(value) {
      switch (this.settings.type) {
        case 5120:
          return new Float32Array(value).map(function (x) {
            return (x + 128) / 255 * 2 - 1;
          });

        case 5122:
          return new Float32Array(value).map(function (x) {
            return (x + 32768) / 65535 * 2 - 1;
          });

        case 5121:
          return new Float32Array(value).map(function (x) {
            return x / 255;
          });

        case 5123:
          return new Float32Array(value).map(function (x) {
            return x / 65535;
          });

        default:
          return value;
      }
    }
  }, {
    key: "_normalizeValue",
    value: function _normalizeValue(value, out, start) {
      var _this$settings = this.settings,
          defaultValue = _this$settings.defaultValue,
          size = _this$settings.size;

      if (Number.isFinite(value)) {
        out[start] = value;
        return out;
      }

      if (!value) {
        out[start] = defaultValue[0];
        return out;
      }

      switch (size) {
        case 4:
          out[start + 3] = Number.isFinite(value[3]) ? value[3] : defaultValue[3];

        case 3:
          out[start + 2] = Number.isFinite(value[2]) ? value[2] : defaultValue[2];

        case 2:
          out[start + 1] = Number.isFinite(value[1]) ? value[1] : defaultValue[1];

        case 1:
          out[start + 0] = Number.isFinite(value[0]) ? value[0] : defaultValue[0];
          break;

        default:
          var i = size;

          while (--i >= 0) {
            out[start + i] = Number.isFinite(value[i]) ? value[i] : defaultValue[i];
          }

      }

      return out;
    }
  }, {
    key: "_areValuesEqual",
    value: function _areValuesEqual(value1, value2) {
      if (!value1 || !value2) {
        return false;
      }

      var size = this.size;

      for (var i = 0; i < size; i++) {
        if (value1[i] !== value2[i]) {
          return false;
        }
      }

      return true;
    }
  }, {
    key: "buffer",
    get: function get() {
      if (!this._buffer) {
        var _this$settings2 = this.settings,
            isIndexed = _this$settings2.isIndexed,
            type = _this$settings2.type;
        this._buffer = new Buffer(this.gl, {
          id: this.id,
          target: isIndexed ? 34963 : 34962,
          accessor: {
            type: type
          }
        });
      }

      return this._buffer;
    }
  }, {
    key: "byteOffset",
    get: function get() {
      var accessor = this.getAccessor();

      if (accessor.vertexOffset) {
        return accessor.vertexOffset * getStride(accessor);
      }

      return 0;
    }
  }]);

  return DataColumn;
}();

var EMPTY_ARRAY = [];
var placeholderArray = [];
function createIterable(data) {
  var startRow = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
  var endRow = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : Infinity;
  var iterable = EMPTY_ARRAY;
  var objectInfo = {
    index: -1,
    data: data,
    target: []
  };

  if (!data) {
    iterable = EMPTY_ARRAY;
  } else if (typeof data[Symbol.iterator] === 'function') {
    iterable = data;
  } else if (data.length > 0) {
    placeholderArray.length = data.length;
    iterable = placeholderArray;
  }

  if (startRow > 0 || Number.isFinite(endRow)) {
    iterable = (Array.isArray(iterable) ? iterable : Array.from(iterable)).slice(startRow, endRow);
    objectInfo.index = startRow - 1;
  }

  return {
    iterable: iterable,
    objectInfo: objectInfo
  };
}
function isAsyncIterable$1(data) {
  return data && data[Symbol.asyncIterator];
}
function getAccessorFromBuffer(typedArray, _ref) {
  var size = _ref.size,
      stride = _ref.stride,
      offset = _ref.offset,
      startIndices = _ref.startIndices,
      nested = _ref.nested;
  var bytesPerElement = typedArray.BYTES_PER_ELEMENT;
  var elementStride = stride ? stride / bytesPerElement : size;
  var elementOffset = offset ? offset / bytesPerElement : 0;
  var vertexCount = Math.floor((typedArray.length - elementOffset) / elementStride);
  return function (_, _ref2) {
    var index = _ref2.index,
        target = _ref2.target;

    if (!startIndices) {
      var sourceIndex = index * elementStride + elementOffset;

      for (var j = 0; j < size; j++) {
        target[j] = typedArray[sourceIndex + j];
      }

      return target;
    }

    var startIndex = startIndices[index];
    var endIndex = startIndices[index + 1] || vertexCount;
    var result;

    if (nested) {
      result = new Array(endIndex - startIndex);

      for (var i = startIndex; i < endIndex; i++) {
        var _sourceIndex = i * elementStride + elementOffset;

        target = new Array(size);

        for (var _j = 0; _j < size; _j++) {
          target[_j] = typedArray[_sourceIndex + _j];
        }

        result[i - startIndex] = target;
      }
    } else if (elementStride === size) {
      result = typedArray.subarray(startIndex * size + elementOffset, endIndex * size + elementOffset);
    } else {
      result = new typedArray.constructor((endIndex - startIndex) * size);
      var targetIndex = 0;

      for (var _i = startIndex; _i < endIndex; _i++) {
        var _sourceIndex2 = _i * elementStride + elementOffset;

        for (var _j2 = 0; _j2 < size; _j2++) {
          result[targetIndex++] = typedArray[_sourceIndex2 + _j2];
        }
      }
    }

    return result;
  };
}

function flatten(array) {
  var filter = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : function () {
    return true;
  };

  if (!Array.isArray(array)) {
    return filter(array) ? [array] : [];
  }

  return flattenArray(array, filter, []);
}

function flattenArray(array, filter, result) {
  var index = -1;

  while (++index < array.length) {
    var value = array[index];

    if (Array.isArray(value)) {
      flattenArray(value, filter, result);
    } else if (filter(value)) {
      result.push(value);
    }
  }

  return result;
}

function fillArray$1(_ref) {
  var target = _ref.target,
      source = _ref.source,
      _ref$start = _ref.start,
      start = _ref$start === void 0 ? 0 : _ref$start,
      _ref$count = _ref.count,
      count = _ref$count === void 0 ? 1 : _ref$count;
  var length = source.length;
  var total = count * length;
  var copied = 0;

  for (var i = start; copied < length; copied++) {
    target[i++] = source[copied];
  }

  while (copied < total) {
    if (copied < total - copied) {
      target.copyWithin(start + copied, start, start + copied);
      copied *= 2;
    } else {
      target.copyWithin(start + copied, start, start + total - copied);
      copied = total;
    }
  }

  return target;
}

var EMPTY = [];
var FULL = [[0, Infinity]];
function add$2(rangeList, range) {
  if (rangeList === FULL) {
    return rangeList;
  }

  if (range[0] < 0) {
    range[0] = 0;
  }

  if (range[0] >= range[1]) {
    return rangeList;
  }

  var newRangeList = [];
  var len = rangeList.length;
  var insertPosition = 0;

  for (var i = 0; i < len; i++) {
    var range0 = rangeList[i];

    if (range0[1] < range[0]) {
      newRangeList.push(range0);
      insertPosition = i + 1;
    } else if (range0[0] > range[1]) {
      newRangeList.push(range0);
    } else {
      range = [Math.min(range0[0], range[0]), Math.max(range0[1], range[1])];
    }
  }

  newRangeList.splice(insertPosition, 0, range);
  return newRangeList;
}

function padArrayChunk(_ref) {
  var source = _ref.source,
      target = _ref.target,
      _ref$start = _ref.start,
      start = _ref$start === void 0 ? 0 : _ref$start,
      end = _ref.end,
      size = _ref.size,
      getData = _ref.getData;
  end = end || target.length;
  var sourceLength = source.length;
  var targetLength = end - start;

  if (sourceLength > targetLength) {
    target.set(source.subarray(0, targetLength), start);
    return;
  }

  target.set(source, start);

  if (!getData) {
    return;
  }

  var i = sourceLength;

  while (i < targetLength) {
    var datum = getData(i, source);

    for (var j = 0; j < size; j++) {
      target[start + i] = datum[j] || 0;
      i++;
    }
  }
}

function padArray(_ref2) {
  var source = _ref2.source,
      target = _ref2.target,
      size = _ref2.size,
      getData = _ref2.getData,
      sourceStartIndices = _ref2.sourceStartIndices,
      targetStartIndices = _ref2.targetStartIndices;

  if (!Array.isArray(targetStartIndices)) {
    padArrayChunk({
      source: source,
      target: target,
      size: size,
      getData: getData
    });
    return target;
  }

  var sourceIndex = 0;
  var targetIndex = 0;

  var getChunkData = getData && function (i, chunk) {
    return getData(i + targetIndex, chunk);
  };

  var n = Math.min(sourceStartIndices.length, targetStartIndices.length);

  for (var i = 1; i < n; i++) {
    var nextSourceIndex = sourceStartIndices[i] * size;
    var nextTargetIndex = targetStartIndices[i] * size;
    padArrayChunk({
      source: source.subarray(sourceIndex, nextSourceIndex),
      target: target,
      start: targetIndex,
      end: nextTargetIndex,
      size: size,
      getData: getChunkData
    });
    sourceIndex = nextSourceIndex;
    targetIndex = nextTargetIndex;
  }

  if (targetIndex < target.length) {
    padArrayChunk({
      source: [],
      target: target,
      start: targetIndex,
      size: size,
      getData: getChunkData
    });
  }

  return target;
}

var DEFAULT_TRANSITION_SETTINGS = {
  interpolation: {
    duration: 0,
    easing: function easing(t) {
      return t;
    }
  },
  spring: {
    stiffness: 0.05,
    damping: 0.5
  }
};
function normalizeTransitionSettings(userSettings, layerSettings) {
  if (!userSettings) {
    return null;
  }

  if (Number.isFinite(userSettings)) {
    userSettings = {
      duration: userSettings
    };
  }

  userSettings.type = userSettings.type || 'interpolation';
  return Object.assign({}, DEFAULT_TRANSITION_SETTINGS[userSettings.type], layerSettings, userSettings);
}
function getSourceBufferAttribute(gl, attribute) {
  var buffer = attribute.getBuffer();

  if (buffer) {
    return [attribute.getBuffer(), {
      divisor: 0,
      size: attribute.size,
      normalized: attribute.settings.normalized
    }];
  }

  return attribute.value;
}
function getAttributeTypeFromSize(size) {
  switch (size) {
    case 1:
      return 'float';

    case 2:
      return 'vec2';

    case 3:
      return 'vec3';

    case 4:
      return 'vec4';

    default:
      throw new Error("No defined attribute type for size \"".concat(size, "\""));
  }
}
function cycleBuffers(buffers) {
  buffers.push(buffers.shift());
}
function getAttributeBufferLength(attribute, numInstances) {
  var doublePrecision = attribute.doublePrecision,
      settings = attribute.settings,
      value = attribute.value,
      size = attribute.size;
  var multiplier = doublePrecision && value instanceof Float64Array ? 2 : 1;
  return (settings.noAlloc ? value.length : numInstances * size) * multiplier;
}
function padBuffer(_ref) {
  var buffer = _ref.buffer,
      numInstances = _ref.numInstances,
      attribute = _ref.attribute,
      fromLength = _ref.fromLength,
      fromStartIndices = _ref.fromStartIndices,
      _ref$getData = _ref.getData,
      getData = _ref$getData === void 0 ? function (x) {
    return x;
  } : _ref$getData;
  var precisionMultiplier = attribute.doublePrecision && attribute.value instanceof Float64Array ? 2 : 1;
  var size = attribute.size * precisionMultiplier;
  var byteOffset = attribute.byteOffset;
  var toStartIndices = attribute.startIndices;
  var hasStartIndices = fromStartIndices && toStartIndices;
  var toLength = getAttributeBufferLength(attribute, numInstances);
  var isConstant = attribute.state.constant;

  if (!hasStartIndices && fromLength >= toLength) {
    return;
  }

  var toData = isConstant ? attribute.value : attribute.getBuffer().getData({
    srcByteOffset: byteOffset
  });

  if (attribute.settings.normalized && !isConstant) {
    var getter = getData;

    getData = function getData(value, chunk) {
      return attribute._normalizeConstant(getter(value, chunk));
    };
  }

  var getMissingData = isConstant ? function (i, chunk) {
    return getData(toData, chunk);
  } : function (i, chunk) {
    return getData(toData.subarray(i, i + size), chunk);
  };
  var source = buffer.getData({
    length: fromLength
  });
  var data = new Float32Array(toLength);
  padArray({
    source: source,
    target: data,
    sourceStartIndices: fromStartIndices,
    targetStartIndices: toStartIndices,
    size: size,
    getData: getMissingData
  });

  if (buffer.byteLength < data.byteLength + byteOffset) {
    buffer.reallocate(data.byteLength + byteOffset);
  }

  buffer.subData({
    data: data,
    offset: byteOffset
  });
}

function _createForOfIteratorHelper$5(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray$5(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray$5(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray$5(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray$5(o, minLen); }

function _arrayLikeToArray$5(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _createSuper$6(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct$7(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _isNativeReflectConstruct$7() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

var Attribute = function (_DataColumn) {
  _inherits(Attribute, _DataColumn);

  var _super = _createSuper$6(Attribute);

  function Attribute(gl) {
    var _this;

    var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    _classCallCheck(this, Attribute);

    _this = _super.call(this, gl, opts);
    var _opts$transition = opts.transition,
        transition = _opts$transition === void 0 ? false : _opts$transition,
        _opts$noAlloc = opts.noAlloc,
        noAlloc = _opts$noAlloc === void 0 ? false : _opts$noAlloc,
        _opts$update = opts.update,
        update = _opts$update === void 0 ? null : _opts$update,
        _opts$accessor = opts.accessor,
        accessor = _opts$accessor === void 0 ? null : _opts$accessor,
        _opts$transform = opts.transform,
        transform = _opts$transform === void 0 ? null : _opts$transform,
        _opts$startIndices = opts.startIndices,
        startIndices = _opts$startIndices === void 0 ? null : _opts$startIndices;
    Object.assign(_this.settings, {
      transition: transition,
      noAlloc: noAlloc,
      update: update || accessor && _this._autoUpdater,
      accessor: accessor,
      transform: transform
    });
    Object.assign(_this.state, {
      lastExternalBuffer: null,
      binaryValue: null,
      binaryAccessor: null,
      needsUpdate: true,
      needsRedraw: false,
      updateRanges: FULL,
      startIndices: startIndices
    });
    Object.seal(_this.settings);
    Object.seal(_this.state);

    _this._validateAttributeUpdaters();

    return _this;
  }

  _createClass(Attribute, [{
    key: "needsUpdate",
    value: function needsUpdate() {
      return this.state.needsUpdate;
    }
  }, {
    key: "needsRedraw",
    value: function needsRedraw() {
      var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          _ref$clearChangedFlag = _ref.clearChangedFlags,
          clearChangedFlags = _ref$clearChangedFlag === void 0 ? false : _ref$clearChangedFlag;

      var needsRedraw = this.state.needsRedraw;
      this.state.needsRedraw = needsRedraw && !clearChangedFlags;
      return needsRedraw;
    }
  }, {
    key: "getUpdateTriggers",
    value: function getUpdateTriggers() {
      var accessor = this.settings.accessor;
      return [this.id].concat(typeof accessor !== 'function' && accessor || []);
    }
  }, {
    key: "supportsTransition",
    value: function supportsTransition() {
      return Boolean(this.settings.transition);
    }
  }, {
    key: "getTransitionSetting",
    value: function getTransitionSetting(opts) {
      var accessor = this.settings.accessor;
      var layerSettings = this.settings.transition;

      if (!this.supportsTransition()) {
        return null;
      }

      var userSettings = Array.isArray(accessor) ? opts[accessor.find(function (a) {
        return opts[a];
      })] : opts[accessor];
      return normalizeTransitionSettings(userSettings, layerSettings);
    }
  }, {
    key: "setNeedsUpdate",
    value: function setNeedsUpdate() {
      var reason = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.id;
      var dataRange = arguments.length > 1 ? arguments[1] : undefined;
      this.state.needsUpdate = this.state.needsUpdate || reason;
      this.setNeedsRedraw(reason);

      if (dataRange) {
        var _dataRange$startRow = dataRange.startRow,
            startRow = _dataRange$startRow === void 0 ? 0 : _dataRange$startRow,
            _dataRange$endRow = dataRange.endRow,
            endRow = _dataRange$endRow === void 0 ? Infinity : _dataRange$endRow;
        this.state.updateRanges = add$2(this.state.updateRanges, [startRow, endRow]);
      } else {
        this.state.updateRanges = FULL;
      }
    }
  }, {
    key: "clearNeedsUpdate",
    value: function clearNeedsUpdate() {
      this.state.needsUpdate = false;
      this.state.updateRanges = EMPTY;
    }
  }, {
    key: "setNeedsRedraw",
    value: function setNeedsRedraw() {
      var reason = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.id;
      this.state.needsRedraw = this.state.needsRedraw || reason;
    }
  }, {
    key: "update",
    value: function update(opts) {
      this.setData(opts);
    }
  }, {
    key: "allocate",
    value: function allocate(numInstances) {
      var state = this.state,
          settings = this.settings;

      if (settings.noAlloc) {
        return false;
      }

      if (settings.update) {
        assert$6(Number.isFinite(numInstances));

        _get(_getPrototypeOf(Attribute.prototype), "allocate", this).call(this, {
          numInstances: numInstances,
          copy: state.updateRanges !== FULL
        });

        return true;
      }

      return false;
    }
  }, {
    key: "updateBuffer",
    value: function updateBuffer(_ref2) {
      var numInstances = _ref2.numInstances,
          data = _ref2.data,
          props = _ref2.props,
          context = _ref2.context;

      if (!this.needsUpdate()) {
        return false;
      }

      var updateRanges = this.state.updateRanges,
          _this$settings = this.settings,
          update = _this$settings.update,
          noAlloc = _this$settings.noAlloc;
      var updated = true;

      if (update) {
        var _iterator = _createForOfIteratorHelper$5(updateRanges),
            _step;

        try {
          for (_iterator.s(); !(_step = _iterator.n()).done;) {
            var _step$value = _slicedToArray(_step.value, 2),
                _startRow = _step$value[0],
                _endRow = _step$value[1];

            update.call(context, this, {
              data: data,
              startRow: _startRow,
              endRow: _endRow,
              props: props,
              numInstances: numInstances
            });
          }
        } catch (err) {
          _iterator.e(err);
        } finally {
          _iterator.f();
        }

        if (!this.value) ; else if (this.constant || this.buffer.byteLength < this.value.byteLength + this.byteOffset) {
          this.setData({
            value: this.value,
            constant: this.constant
          });
        } else {
          var _iterator2 = _createForOfIteratorHelper$5(updateRanges),
              _step2;

          try {
            for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
              var _step2$value = _slicedToArray(_step2.value, 2),
                  startRow = _step2$value[0],
                  endRow = _step2$value[1];

              var startOffset = Number.isFinite(startRow) ? this.getVertexOffset(startRow) : 0;
              var endOffset = Number.isFinite(endRow) ? this.getVertexOffset(endRow) : noAlloc || !Number.isFinite(numInstances) ? this.value.length : numInstances * this.size;

              _get(_getPrototypeOf(Attribute.prototype), "updateSubBuffer", this).call(this, {
                startOffset: startOffset,
                endOffset: endOffset
              });
            }
          } catch (err) {
            _iterator2.e(err);
          } finally {
            _iterator2.f();
          }
        }

        this._checkAttributeArray();
      } else {
        updated = false;
      }

      this.clearNeedsUpdate();
      this.setNeedsRedraw();
      return updated;
    }
  }, {
    key: "setConstantValue",
    value: function setConstantValue(value) {
      if (value === undefined || typeof value === 'function') {
        return false;
      }

      var hasChanged = this.setData({
        constant: true,
        value: value
      });

      if (hasChanged) {
        this.setNeedsRedraw();
      }

      this.clearNeedsUpdate();
      return true;
    }
  }, {
    key: "setExternalBuffer",
    value: function setExternalBuffer(buffer) {
      var state = this.state;

      if (!buffer) {
        state.lastExternalBuffer = null;
        return false;
      }

      this.clearNeedsUpdate();

      if (state.lastExternalBuffer === buffer) {
        return true;
      }

      state.lastExternalBuffer = buffer;
      this.setNeedsRedraw();
      this.setData(buffer);
      return true;
    }
  }, {
    key: "setBinaryValue",
    value: function setBinaryValue(buffer) {
      var startIndices = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
      var state = this.state,
          settings = this.settings;

      if (!buffer) {
        state.binaryValue = null;
        state.binaryAccessor = null;
        return false;
      }

      if (settings.noAlloc) {
        return false;
      }

      if (state.binaryValue === buffer) {
        this.clearNeedsUpdate();
        return true;
      }

      state.binaryValue = buffer;
      this.setNeedsRedraw();

      if (ArrayBuffer.isView(buffer)) {
        buffer = {
          value: buffer
        };
      }

      var needsUpdate = settings.transform || startIndices !== this.startIndices;

      if (needsUpdate) {
        assert$6(ArrayBuffer.isView(buffer.value), "invalid ".concat(settings.accessor));
        var needsNormalize = buffer.size && buffer.size !== this.size;
        state.binaryAccessor = getAccessorFromBuffer(buffer.value, {
          size: buffer.size || this.size,
          stride: buffer.stride,
          offset: buffer.offset,
          startIndices: startIndices,
          nested: needsNormalize
        });
        return false;
      }

      this.clearNeedsUpdate();
      this.setData(buffer);
      return true;
    }
  }, {
    key: "getVertexOffset",
    value: function getVertexOffset(row) {
      var startIndices = this.startIndices;
      var vertexIndex = startIndices ? startIndices[row] : row;
      return vertexIndex * this.size;
    }
  }, {
    key: "getShaderAttributes",
    value: function getShaderAttributes() {
      var shaderAttributeDefs = this.settings.shaderAttributes || _defineProperty({}, this.id, null);

      var shaderAttributes = {};

      for (var shaderAttributeName in shaderAttributeDefs) {
        Object.assign(shaderAttributes, _get(_getPrototypeOf(Attribute.prototype), "getShaderAttributes", this).call(this, shaderAttributeName, shaderAttributeDefs[shaderAttributeName]));
      }

      return shaderAttributes;
    }
  }, {
    key: "_autoUpdater",
    value: function _autoUpdater(attribute, _ref4) {
      var data = _ref4.data,
          startRow = _ref4.startRow,
          endRow = _ref4.endRow,
          props = _ref4.props,
          numInstances = _ref4.numInstances;

      if (attribute.constant) {
        return;
      }

      var settings = attribute.settings,
          state = attribute.state,
          value = attribute.value,
          size = attribute.size,
          startIndices = attribute.startIndices;
      var accessor = settings.accessor,
          transform = settings.transform;
      var accessorFunc = state.binaryAccessor || (typeof accessor === 'function' ? accessor : props[accessor]);
      assert$6(typeof accessorFunc === 'function', "accessor \"".concat(accessor, "\" is not a function"));
      var i = attribute.getVertexOffset(startRow);

      var _createIterable = createIterable(data, startRow, endRow),
          iterable = _createIterable.iterable,
          objectInfo = _createIterable.objectInfo;

      var _iterator3 = _createForOfIteratorHelper$5(iterable),
          _step3;

      try {
        for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
          var object = _step3.value;
          objectInfo.index++;
          var objectValue = accessorFunc(object, objectInfo);

          if (transform) {
            objectValue = transform.call(this, objectValue);
          }

          if (startIndices) {
            var numVertices = (objectInfo.index < startIndices.length - 1 ? startIndices[objectInfo.index + 1] : numInstances) - startIndices[objectInfo.index];

            if (objectValue && Array.isArray(objectValue[0])) {
              var startIndex = i;

              var _iterator4 = _createForOfIteratorHelper$5(objectValue),
                  _step4;

              try {
                for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
                  var item = _step4.value;

                  attribute._normalizeValue(item, value, startIndex);

                  startIndex += size;
                }
              } catch (err) {
                _iterator4.e(err);
              } finally {
                _iterator4.f();
              }
            } else if (objectValue && objectValue.length > size) {
              value.set(objectValue, i);
            } else {
              attribute._normalizeValue(objectValue, objectInfo.target, 0);

              fillArray$1({
                target: value,
                source: objectInfo.target,
                start: i,
                count: numVertices
              });
            }

            i += numVertices * size;
          } else {
            attribute._normalizeValue(objectValue, value, i);

            i += size;
          }
        }
      } catch (err) {
        _iterator3.e(err);
      } finally {
        _iterator3.f();
      }
    }
  }, {
    key: "_validateAttributeUpdaters",
    value: function _validateAttributeUpdaters() {
      var settings = this.settings;
      var hasUpdater = settings.noAlloc || typeof settings.update === 'function';

      if (!hasUpdater) {
        throw new Error("Attribute ".concat(this.id, " missing update or accessor"));
      }
    }
  }, {
    key: "_checkAttributeArray",
    value: function _checkAttributeArray() {
      var value = this.value;
      var limit = Math.min(4, this.size);

      if (value && value.length >= limit) {
        var valid = true;

        switch (limit) {
          case 4:
            valid = valid && Number.isFinite(value[3]);

          case 3:
            valid = valid && Number.isFinite(value[2]);

          case 2:
            valid = valid && Number.isFinite(value[1]);

          case 1:
            valid = valid && Number.isFinite(value[0]);
            break;

          default:
            valid = false;
        }

        if (!valid) {
          throw new Error("Illegal attribute generated for ".concat(this.id));
        }
      }
    }
  }, {
    key: "startIndices",
    get: function get() {
      return this.state.startIndices;
    },
    set: function set(layout) {
      this.state.startIndices = layout;
    }
  }]);

  return Attribute;
}(DataColumn);

function noop$1() {}

var DEFAULT_SETTINGS$1 = {
  onStart: noop$1,
  onUpdate: noop$1,
  onInterrupt: noop$1,
  onEnd: noop$1
};

var Transition = function () {
  function Transition(timeline) {
    _classCallCheck(this, Transition);

    this._inProgress = false;
    this._handle = null;
    this.timeline = timeline;
    this.settings = {};
  }

  _createClass(Transition, [{
    key: "start",
    value: function start(props) {
      this.cancel();
      this.settings = Object.assign({}, DEFAULT_SETTINGS$1, props);
      this._inProgress = true;
      this.settings.onStart(this);
    }
  }, {
    key: "end",
    value: function end() {
      if (this._inProgress) {
        this.timeline.removeChannel(this._handle);
        this._handle = null;
        this._inProgress = false;
        this.settings.onEnd(this);
      }
    }
  }, {
    key: "cancel",
    value: function cancel() {
      if (this._inProgress) {
        this.settings.onInterrupt(this);
        this.timeline.removeChannel(this._handle);
        this._handle = null;
        this._inProgress = false;
      }
    }
  }, {
    key: "update",
    value: function update() {
      if (!this._inProgress) {
        return false;
      }

      if (this._handle === null) {
        var timeline = this.timeline,
            settings = this.settings;
        this._handle = timeline.addChannel({
          delay: timeline.getTime(),
          duration: settings.duration
        });
      }

      this.time = this.timeline.getTime(this._handle);

      this._onUpdate();

      this.settings.onUpdate(this);

      if (this.timeline.isFinished(this._handle)) {
        this.end();
      }

      return true;
    }
  }, {
    key: "_onUpdate",
    value: function _onUpdate() {}
  }, {
    key: "inProgress",
    get: function get() {
      return this._inProgress;
    }
  }]);

  return Transition;
}();

function ownKeys$7(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread$8(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys$7(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys$7(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _createForOfIteratorHelper$6(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray$6(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray$6(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray$6(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray$6(o, minLen); }

function _arrayLikeToArray$6(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

var GPUInterpolationTransition = function () {
  function GPUInterpolationTransition(_ref) {
    var gl = _ref.gl,
        attribute = _ref.attribute,
        timeline = _ref.timeline;

    _classCallCheck(this, GPUInterpolationTransition);

    this.gl = gl;
    this.type = 'interpolation';
    this.transition = new Transition(timeline);
    this.attribute = attribute;
    this.attributeInTransition = new Attribute(gl, attribute.settings);
    this.currentStartIndices = attribute.startIndices;
    this.currentLength = 0;
    this.transform = getTransform(gl, attribute);
    var bufferOpts = {
      byteLength: 0,
      usage: 35050
    };
    this.buffers = [new Buffer(gl, bufferOpts), new Buffer(gl, bufferOpts)];
  }

  _createClass(GPUInterpolationTransition, [{
    key: "start",
    value: function start(transitionSettings, numInstances) {
      if (transitionSettings.duration <= 0) {
        this.transition.cancel();
        return;
      }

      var gl = this.gl,
          buffers = this.buffers,
          attribute = this.attribute;
      cycleBuffers(buffers);
      var padBufferOpts = {
        numInstances: numInstances,
        attribute: attribute,
        fromLength: this.currentLength,
        fromStartIndices: this.currentStartIndices,
        getData: transitionSettings.enter
      };

      var _iterator = _createForOfIteratorHelper$6(buffers),
          _step;

      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var buffer = _step.value;
          padBuffer(_objectSpread$8({
            buffer: buffer
          }, padBufferOpts));
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }

      this.currentStartIndices = attribute.startIndices;
      this.currentLength = getAttributeBufferLength(attribute, numInstances);
      this.attributeInTransition.update({
        buffer: buffers[1],
        value: attribute.value
      });
      this.transition.start(transitionSettings);
      this.transform.update({
        elementCount: Math.floor(this.currentLength / attribute.size),
        sourceBuffers: {
          aFrom: buffers[0],
          aTo: getSourceBufferAttribute(gl, attribute)
        },
        feedbackBuffers: {
          vCurrent: buffers[1]
        }
      });
    }
  }, {
    key: "update",
    value: function update() {
      var updated = this.transition.update();

      if (updated) {
        var _this$transition = this.transition,
            time = _this$transition.time,
            _this$transition$sett = _this$transition.settings,
            duration = _this$transition$sett.duration,
            easing = _this$transition$sett.easing;
        var t = easing(time / duration);
        this.transform.run({
          uniforms: {
            time: t
          }
        });
      }

      return updated;
    }
  }, {
    key: "cancel",
    value: function cancel() {
      this.transition.cancel();
      this.transform["delete"]();

      while (this.buffers.length) {
        this.buffers.pop()["delete"]();
      }
    }
  }, {
    key: "inProgress",
    get: function get() {
      return this.transition.inProgress;
    }
  }]);

  return GPUInterpolationTransition;
}();
var vs$1 = "\n#define SHADER_NAME interpolation-transition-vertex-shader\n\nuniform float time;\nattribute ATTRIBUTE_TYPE aFrom;\nattribute ATTRIBUTE_TYPE aTo;\nvarying ATTRIBUTE_TYPE vCurrent;\n\nvoid main(void) {\n  vCurrent = mix(aFrom, aTo, time);\n  gl_Position = vec4(0.0);\n}\n";

function getTransform(gl, attribute) {
  var attributeType = getAttributeTypeFromSize(attribute.size);
  return new Transform(gl, {
    vs: vs$1,
    defines: {
      ATTRIBUTE_TYPE: attributeType
    },
    varyings: ['vCurrent']
  });
}

function ownKeys$8(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread$9(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys$8(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys$8(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _createForOfIteratorHelper$7(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray$7(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray$7(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray$7(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray$7(o, minLen); }

function _arrayLikeToArray$7(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

var GPUSpringTransition = function () {
  function GPUSpringTransition(_ref) {
    var gl = _ref.gl,
        attribute = _ref.attribute,
        timeline = _ref.timeline;

    _classCallCheck(this, GPUSpringTransition);

    this.gl = gl;
    this.type = 'spring';
    this.transition = new Transition(timeline);
    this.attribute = attribute;
    this.attributeInTransition = new Attribute(gl, Object.assign({}, attribute.settings, {
      normalized: false
    }));
    this.currentStartIndices = attribute.startIndices;
    this.currentLength = 0;
    this.texture = getTexture(gl);
    this.framebuffer = getFramebuffer$1(gl, this.texture);
    this.transform = getTransform$1(gl, attribute, this.framebuffer);
    var bufferOpts = {
      byteLength: 0,
      usage: 35050
    };
    this.buffers = [new Buffer(gl, bufferOpts), new Buffer(gl, bufferOpts), new Buffer(gl, bufferOpts)];
  }

  _createClass(GPUSpringTransition, [{
    key: "start",
    value: function start(transitionSettings, numInstances) {
      var gl = this.gl,
          buffers = this.buffers,
          attribute = this.attribute;
      var padBufferOpts = {
        numInstances: numInstances,
        attribute: attribute,
        fromLength: this.currentLength,
        fromStartIndices: this.currentStartIndices,
        getData: transitionSettings.enter
      };

      var _iterator = _createForOfIteratorHelper$7(buffers),
          _step;

      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var buffer = _step.value;
          padBuffer(_objectSpread$9({
            buffer: buffer
          }, padBufferOpts));
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }

      this.currentStartIndices = attribute.startIndices;
      this.currentLength = getAttributeBufferLength(attribute, numInstances);
      this.attributeInTransition.update({
        buffer: buffers[1],
        value: attribute.value
      });
      this.transition.start(transitionSettings);
      this.transform.update({
        elementCount: Math.floor(this.currentLength / attribute.size),
        sourceBuffers: {
          aTo: getSourceBufferAttribute(gl, attribute)
        }
      });
    }
  }, {
    key: "update",
    value: function update() {
      var buffers = this.buffers,
          transform = this.transform,
          framebuffer = this.framebuffer,
          transition = this.transition;
      var updated = transition.update();

      if (!updated) {
        return false;
      }

      transform.update({
        sourceBuffers: {
          aPrev: buffers[0],
          aCur: buffers[1]
        },
        feedbackBuffers: {
          vNext: buffers[2]
        }
      });
      transform.run({
        framebuffer: framebuffer,
        discard: false,
        clearRenderTarget: true,
        uniforms: {
          stiffness: transition.settings.stiffness,
          damping: transition.settings.damping
        },
        parameters: {
          depthTest: false,
          blend: true,
          viewport: [0, 0, 1, 1],
          blendFunc: [1, 1],
          blendEquation: [32776, 32776]
        }
      });
      cycleBuffers(buffers);
      this.attributeInTransition.update({
        buffer: buffers[1],
        value: this.attribute.value
      });
      var isTransitioning = readPixelsToArray(framebuffer)[0] > 0;

      if (!isTransitioning) {
        transition.end();
      }

      return true;
    }
  }, {
    key: "cancel",
    value: function cancel() {
      this.transition.cancel();
      this.transform["delete"]();

      while (this.buffers.length) {
        this.buffers.pop()["delete"]();
      }

      this.texture["delete"]();
      this.texture = null;
      this.framebuffer["delete"]();
      this.framebuffer = null;
    }
  }, {
    key: "inProgress",
    get: function get() {
      return this.transition.inProgress;
    }
  }]);

  return GPUSpringTransition;
}();

function getTransform$1(gl, attribute, framebuffer) {
  var attributeType = getAttributeTypeFromSize(attribute.size);
  return new Transform(gl, {
    framebuffer: framebuffer,
    vs: "\n#define SHADER_NAME spring-transition-vertex-shader\n\n#define EPSILON 0.00001\n\nuniform float stiffness;\nuniform float damping;\nattribute ATTRIBUTE_TYPE aPrev;\nattribute ATTRIBUTE_TYPE aCur;\nattribute ATTRIBUTE_TYPE aTo;\nvarying ATTRIBUTE_TYPE vNext;\nvarying float vIsTransitioningFlag;\n\nATTRIBUTE_TYPE getNextValue(ATTRIBUTE_TYPE cur, ATTRIBUTE_TYPE prev, ATTRIBUTE_TYPE dest) {\n  ATTRIBUTE_TYPE velocity = cur - prev;\n  ATTRIBUTE_TYPE delta = dest - cur;\n  ATTRIBUTE_TYPE spring = delta * stiffness;\n  ATTRIBUTE_TYPE damper = velocity * -1.0 * damping;\n  return spring + damper + velocity + cur;\n}\n\nvoid main(void) {\n  bool isTransitioning = length(aCur - aPrev) > EPSILON || length(aTo - aCur) > EPSILON;\n  vIsTransitioningFlag = isTransitioning ? 1.0 : 0.0;\n\n  vNext = getNextValue(aCur, aPrev, aTo);\n  gl_Position = vec4(0, 0, 0, 1);\n  gl_PointSize = 100.0;\n}\n",
    fs: "\n#define SHADER_NAME spring-transition-is-transitioning-fragment-shader\n\nvarying float vIsTransitioningFlag;\n\nvoid main(void) {\n  if (vIsTransitioningFlag == 0.0) {\n    discard;\n  }\n  gl_FragColor = vec4(1.0);\n}",
    defines: {
      ATTRIBUTE_TYPE: attributeType
    },
    varyings: ['vNext']
  });
}

function getTexture(gl) {
  return new Texture2D(gl, {
    data: new Uint8Array(4),
    format: 6408,
    type: 5121,
    border: 0,
    mipmaps: false,
    dataFormat: 6408,
    width: 1,
    height: 1
  });
}

function getFramebuffer$1(gl, texture) {
  return new Framebuffer(gl, {
    id: 'spring-transition-is-transitioning-framebuffer',
    width: 1,
    height: 1,
    attachments: _defineProperty({}, 36064, texture)
  });
}

var TRANSITION_TYPES = {
  interpolation: GPUInterpolationTransition,
  spring: GPUSpringTransition
};

var AttributeTransitionManager = function () {
  function AttributeTransitionManager(gl, _ref) {
    var id = _ref.id,
        timeline = _ref.timeline;

    _classCallCheck(this, AttributeTransitionManager);

    this.id = id;
    this.gl = gl;
    this.timeline = timeline;
    this.transitions = {};
    this.needsRedraw = false;
    this.numInstances = 1;
    this.isSupported = Transform.isSupported(gl);
  }

  _createClass(AttributeTransitionManager, [{
    key: "finalize",
    value: function finalize() {
      for (var attributeName in this.transitions) {
        this._removeTransition(attributeName);
      }
    }
  }, {
    key: "update",
    value: function update(_ref2) {
      var attributes = _ref2.attributes,
          _ref2$transitions = _ref2.transitions,
          transitions = _ref2$transitions === void 0 ? {} : _ref2$transitions,
          numInstances = _ref2.numInstances;
      this.numInstances = numInstances || 1;

      for (var attributeName in attributes) {
        var attribute = attributes[attributeName];
        var settings = attribute.getTransitionSetting(transitions);
        if (!settings) continue;

        this._updateAttribute(attributeName, attribute, settings);
      }

      for (var _attributeName in this.transitions) {
        var _attribute = attributes[_attributeName];

        if (!_attribute || !_attribute.getTransitionSetting(transitions)) {
          this._removeTransition(_attributeName);
        }
      }
    }
  }, {
    key: "hasAttribute",
    value: function hasAttribute(attributeName) {
      var transition = this.transitions[attributeName];
      return transition && transition.inProgress;
    }
  }, {
    key: "getAttributes",
    value: function getAttributes() {
      var animatedAttributes = {};

      for (var attributeName in this.transitions) {
        var transition = this.transitions[attributeName];

        if (transition.inProgress) {
          animatedAttributes[attributeName] = transition.attributeInTransition;
        }
      }

      return animatedAttributes;
    }
  }, {
    key: "run",
    value: function run() {
      if (!this.isSupported || this.numInstances === 0) {
        return false;
      }

      for (var attributeName in this.transitions) {
        var updated = this.transitions[attributeName].update();

        if (updated) {
          this.needsRedraw = true;
        }
      }

      var needsRedraw = this.needsRedraw;
      this.needsRedraw = false;
      return needsRedraw;
    }
  }, {
    key: "_removeTransition",
    value: function _removeTransition(attributeName) {
      this.transitions[attributeName].cancel();
      delete this.transitions[attributeName];
    }
  }, {
    key: "_updateAttribute",
    value: function _updateAttribute(attributeName, attribute, settings) {
      var transition = this.transitions[attributeName];
      var isNew = !transition || transition.type !== settings.type;

      if (isNew) {
        if (!this.isSupported) {
          log.warn("WebGL2 not supported by this browser. Transition for ".concat(attributeName, " is disabled."))();
          return;
        }

        if (transition) {
          this._removeTransition(attributeName);
        }

        var TransitionType = TRANSITION_TYPES[settings.type];

        if (TransitionType) {
          this.transitions[attributeName] = new TransitionType({
            attribute: attribute,
            timeline: this.timeline,
            gl: this.gl
          });
        } else {
          log.error("unsupported transition type '".concat(settings.type, "'"))();
          isNew = false;
        }
      }

      if (isNew || attribute.needsRedraw()) {
        this.needsRedraw = true;
        this.transitions[attributeName].start(settings, this.numInstances);
      }
    }
  }]);

  return AttributeTransitionManager;
}();

var TRACE_INVALIDATE = 'attributeManager.invalidate';
var TRACE_UPDATE_START = 'attributeManager.updateStart';
var TRACE_UPDATE_END = 'attributeManager.updateEnd';
var TRACE_ATTRIBUTE_UPDATE_START = 'attribute.updateStart';
var TRACE_ATTRIBUTE_ALLOCATE = 'attribute.allocate';
var TRACE_ATTRIBUTE_UPDATE_END = 'attribute.updateEnd';

var AttributeManager = function () {
  function AttributeManager(gl) {
    var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
        _ref$id = _ref.id,
        id = _ref$id === void 0 ? 'attribute-manager' : _ref$id,
        stats = _ref.stats,
        timeline = _ref.timeline;

    _classCallCheck(this, AttributeManager);

    this.id = id;
    this.gl = gl;
    this.attributes = {};
    this.updateTriggers = {};
    this.accessors = {};
    this.needsRedraw = true;
    this.userData = {};
    this.stats = stats;
    this.attributeTransitionManager = new AttributeTransitionManager(gl, {
      id: "".concat(id, "-transitions"),
      timeline: timeline
    });
    Object.seal(this);
  }

  _createClass(AttributeManager, [{
    key: "finalize",
    value: function finalize() {
      for (var attributeName in this.attributes) {
        this.attributes[attributeName]["delete"]();
      }

      this.attributeTransitionManager.finalize();
    }
  }, {
    key: "getNeedsRedraw",
    value: function getNeedsRedraw() {
      var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {
        clearRedrawFlags: false
      };
      var redraw = this.needsRedraw;
      this.needsRedraw = this.needsRedraw && !opts.clearRedrawFlags;
      return redraw && this.id;
    }
  }, {
    key: "setNeedsRedraw",
    value: function setNeedsRedraw() {
      this.needsRedraw = true;
      return this;
    }
  }, {
    key: "add",
    value: function add(attributes, updaters) {
      this._add(attributes, updaters);
    }
  }, {
    key: "addInstanced",
    value: function addInstanced(attributes, updaters) {
      this._add(attributes, updaters, {
        instanced: 1
      });
    }
  }, {
    key: "remove",
    value: function remove(attributeNameArray) {
      for (var i = 0; i < attributeNameArray.length; i++) {
        var name = attributeNameArray[i];

        if (this.attributes[name] !== undefined) {
          this.attributes[name]["delete"]();
          delete this.attributes[name];
        }
      }
    }
  }, {
    key: "invalidate",
    value: function invalidate(triggerName, dataRange) {
      var invalidatedAttributes = this._invalidateTrigger(triggerName, dataRange);

      debug(TRACE_INVALIDATE, this, triggerName, invalidatedAttributes);
    }
  }, {
    key: "invalidateAll",
    value: function invalidateAll(dataRange) {
      for (var attributeName in this.attributes) {
        this.attributes[attributeName].setNeedsUpdate(attributeName, dataRange);
      }

      debug(TRACE_INVALIDATE, this, 'all');
    }
  }, {
    key: "update",
    value: function update() {
      var _ref2 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          data = _ref2.data,
          numInstances = _ref2.numInstances,
          _ref2$startIndices = _ref2.startIndices,
          startIndices = _ref2$startIndices === void 0 ? null : _ref2$startIndices,
          transitions = _ref2.transitions,
          _ref2$props = _ref2.props,
          props = _ref2$props === void 0 ? {} : _ref2$props,
          _ref2$buffers = _ref2.buffers,
          buffers = _ref2$buffers === void 0 ? {} : _ref2$buffers,
          _ref2$context = _ref2.context,
          context = _ref2$context === void 0 ? {} : _ref2$context;

      var updated = false;
      debug(TRACE_UPDATE_START, this);

      if (this.stats) {
        this.stats.get('Update Attributes').timeStart();
      }

      for (var attributeName in this.attributes) {
        var attribute = this.attributes[attributeName];
        var accessorName = attribute.settings.accessor;
        attribute.startIndices = startIndices;

        if (props[attributeName]) {
          log.removed("props.".concat(attributeName), "data.attributes.".concat(attributeName))();
        }

        if (attribute.setExternalBuffer(buffers[attributeName])) ; else if (attribute.setBinaryValue(buffers[accessorName], data.startIndices)) ; else if (!buffers[accessorName] && attribute.setConstantValue(props[accessorName])) ; else if (attribute.needsUpdate()) {
          updated = true;

          this._updateAttribute({
            attribute: attribute,
            numInstances: numInstances,
            data: data,
            props: props,
            context: context
          });
        }

        this.needsRedraw |= attribute.needsRedraw();
      }

      if (updated) {
        debug(TRACE_UPDATE_END, this, numInstances);
      }

      if (this.stats) {
        this.stats.get('Update Attributes').timeEnd();
      }

      this.attributeTransitionManager.update({
        attributes: this.attributes,
        numInstances: numInstances,
        transitions: transitions
      });
    }
  }, {
    key: "updateTransition",
    value: function updateTransition() {
      var attributeTransitionManager = this.attributeTransitionManager;
      var transitionUpdated = attributeTransitionManager.run();
      this.needsRedraw = this.needsRedraw || transitionUpdated;
      return transitionUpdated;
    }
  }, {
    key: "getAttributes",
    value: function getAttributes() {
      return this.attributes;
    }
  }, {
    key: "getChangedAttributes",
    value: function getChangedAttributes() {
      var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {
        clearChangedFlags: false
      };
      var attributes = this.attributes,
          attributeTransitionManager = this.attributeTransitionManager;
      var changedAttributes = Object.assign({}, attributeTransitionManager.getAttributes());

      for (var attributeName in attributes) {
        var attribute = attributes[attributeName];

        if (attribute.needsRedraw(opts) && !attributeTransitionManager.hasAttribute(attributeName)) {
          changedAttributes[attributeName] = attribute;
        }
      }

      return changedAttributes;
    }
  }, {
    key: "getShaderAttributes",
    value: function getShaderAttributes(attributes) {
      var excludeAttributes = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      if (!attributes) {
        attributes = this.getAttributes();
      }

      var shaderAttributes = {};

      for (var attributeName in attributes) {
        if (!excludeAttributes[attributeName]) {
          Object.assign(shaderAttributes, attributes[attributeName].getShaderAttributes());
        }
      }

      return shaderAttributes;
    }
  }, {
    key: "getAccessors",
    value: function getAccessors() {
      return this.updateTriggers;
    }
  }, {
    key: "_add",
    value: function _add(attributes, updaters) {
      var extraProps = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

      if (updaters) {
        log.warn('AttributeManager.add({updaters}) - updater map no longer supported')();
      }

      var newAttributes = {};

      for (var attributeName in attributes) {
        var attribute = attributes[attributeName];

        var newAttribute = this._createAttribute(attributeName, attribute, extraProps);

        newAttributes[attributeName] = newAttribute;
      }

      Object.assign(this.attributes, newAttributes);

      this._mapUpdateTriggersToAttributes();
    }
  }, {
    key: "_createAttribute",
    value: function _createAttribute(name, attribute, extraProps) {
      var props = {
        id: name,
        constant: attribute.constant || false,
        isIndexed: attribute.isIndexed || attribute.elements,
        size: attribute.elements && 1 || attribute.size,
        value: attribute.value || null,
        divisor: attribute.instanced || extraProps.instanced ? 1 : attribute.divisor
      };
      return new Attribute(this.gl, Object.assign({}, attribute, props));
    }
  }, {
    key: "_mapUpdateTriggersToAttributes",
    value: function _mapUpdateTriggersToAttributes() {
      var _this = this;

      var triggers = {};

      var _loop = function _loop(attributeName) {
        var attribute = _this.attributes[attributeName];
        attribute.getUpdateTriggers().forEach(function (triggerName) {
          if (!triggers[triggerName]) {
            triggers[triggerName] = [];
          }

          triggers[triggerName].push(attributeName);
        });
      };

      for (var attributeName in this.attributes) {
        _loop(attributeName);
      }

      this.updateTriggers = triggers;
    }
  }, {
    key: "_invalidateTrigger",
    value: function _invalidateTrigger(triggerName, dataRange) {
      var attributes = this.attributes,
          updateTriggers = this.updateTriggers;
      var invalidatedAttributes = updateTriggers[triggerName];

      if (invalidatedAttributes) {
        invalidatedAttributes.forEach(function (name) {
          var attribute = attributes[name];

          if (attribute) {
            attribute.setNeedsUpdate(attribute.id, dataRange);
          }
        });
      }

      return invalidatedAttributes;
    }
  }, {
    key: "_updateAttribute",
    value: function _updateAttribute(opts) {
      var attribute = opts.attribute,
          numInstances = opts.numInstances;
      debug(TRACE_ATTRIBUTE_UPDATE_START, attribute);

      if (attribute.allocate(numInstances)) {
        debug(TRACE_ATTRIBUTE_ALLOCATE, attribute, numInstances);
      }

      var updated = attribute.updateBuffer(opts);

      if (updated) {
        this.needsRedraw = true;
        debug(TRACE_ATTRIBUTE_UPDATE_END, attribute, numInstances);
      }
    }
  }]);

  return AttributeManager;
}();

function _createSuper$7(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct$8(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _isNativeReflectConstruct$8() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

var CPUInterpolationTransition = function (_Transition) {
  _inherits(CPUInterpolationTransition, _Transition);

  var _super = _createSuper$7(CPUInterpolationTransition);

  function CPUInterpolationTransition() {
    _classCallCheck(this, CPUInterpolationTransition);

    return _super.apply(this, arguments);
  }

  _createClass(CPUInterpolationTransition, [{
    key: "_onUpdate",
    value: function _onUpdate() {
      var time = this.time,
          _this$settings = this.settings,
          fromValue = _this$settings.fromValue,
          toValue = _this$settings.toValue,
          duration = _this$settings.duration,
          easing = _this$settings.easing;
      var t = easing(time / duration);
      this._value = lerp(fromValue, toValue, t);
    }
  }, {
    key: "value",
    get: function get() {
      return this._value;
    }
  }]);

  return CPUInterpolationTransition;
}(Transition);

function _createSuper$8(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct$9(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _isNativeReflectConstruct$9() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }
var EPSILON$1 = 1e-5;

function updateSpringElement(prev, cur, dest, damping, stiffness) {
  var velocity = cur - prev;
  var delta = dest - cur;
  var spring = delta * stiffness;
  var damper = -velocity * damping;
  return spring + damper + velocity + cur;
}

function updateSpring(prev, cur, dest, damping, stiffness) {
  if (Array.isArray(dest)) {
    var next = [];

    for (var i = 0; i < dest.length; i++) {
      next[i] = updateSpringElement(prev[i], cur[i], dest[i], damping, stiffness);
    }

    return next;
  }

  return updateSpringElement(prev, cur, dest, damping, stiffness);
}

function distance(value1, value2) {
  if (Array.isArray(value1)) {
    var distanceSquare = 0;

    for (var i = 0; i < value1.length; i++) {
      var d = value1[i] - value2[i];
      distanceSquare += d * d;
    }

    return Math.sqrt(distanceSquare);
  }

  return Math.abs(value1 - value2);
}

var CPUSpringTransition = function (_Transition) {
  _inherits(CPUSpringTransition, _Transition);

  var _super = _createSuper$8(CPUSpringTransition);

  function CPUSpringTransition() {
    _classCallCheck(this, CPUSpringTransition);

    return _super.apply(this, arguments);
  }

  _createClass(CPUSpringTransition, [{
    key: "_onUpdate",
    value: function _onUpdate() {
      var _this$settings = this.settings,
          fromValue = _this$settings.fromValue,
          toValue = _this$settings.toValue,
          damping = _this$settings.damping,
          stiffness = _this$settings.stiffness;

      var _this$_prevValue = this._prevValue,
          _prevValue = _this$_prevValue === void 0 ? fromValue : _this$_prevValue,
          _this$_currValue = this._currValue,
          _currValue = _this$_currValue === void 0 ? fromValue : _this$_currValue;

      var nextValue = updateSpring(_prevValue, _currValue, toValue, damping, stiffness);
      var delta = distance(nextValue, toValue);
      var velocity = distance(nextValue, _currValue);

      if (delta < EPSILON$1 && velocity < EPSILON$1) {
        nextValue = toValue;
        this.end();
      }

      this._prevValue = _currValue;
      this._currValue = nextValue;
    }
  }, {
    key: "value",
    get: function get() {
      return this._currValue;
    }
  }]);

  return CPUSpringTransition;
}(Transition);

function _createForOfIteratorHelper$8(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray$8(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray$8(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray$8(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray$8(o, minLen); }

function _arrayLikeToArray$8(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function ownKeys$9(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread$a(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys$9(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys$9(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }
var TRANSITION_TYPES$1 = {
  interpolation: CPUInterpolationTransition,
  spring: CPUSpringTransition
};

var UniformTransitionManager = function () {
  function UniformTransitionManager(timeline) {
    _classCallCheck(this, UniformTransitionManager);

    this.transitions = new Map();
    this.timeline = timeline;
  }

  _createClass(UniformTransitionManager, [{
    key: "add",
    value: function add(key, fromValue, toValue, settings) {
      var transitions = this.transitions;

      if (transitions.has(key)) {
        var _transition = transitions.get(key);

        var _transition$value = _transition.value,
            value = _transition$value === void 0 ? _transition.settings.fromValue : _transition$value;
        fromValue = value;
        this.remove(key);
      }

      settings = normalizeTransitionSettings(settings);

      if (!settings) {
        return;
      }

      var TransitionType = TRANSITION_TYPES$1[settings.type];

      if (!TransitionType) {
        log.error("unsupported transition type '".concat(settings.type, "'"))();
        return;
      }

      var transition = new TransitionType(this.timeline);
      transition.start(_objectSpread$a(_objectSpread$a({}, settings), {}, {
        fromValue: fromValue,
        toValue: toValue
      }));
      transitions.set(key, transition);
    }
  }, {
    key: "remove",
    value: function remove(key) {
      var transitions = this.transitions;

      if (transitions.has(key)) {
        transitions.get(key).cancel();
        transitions["delete"](key);
      }
    }
  }, {
    key: "update",
    value: function update() {
      var propsInTransition = {};

      var _iterator = _createForOfIteratorHelper$8(this.transitions),
          _step;

      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var _step$value = _slicedToArray(_step.value, 2),
              key = _step$value[0],
              transition = _step$value[1];

          transition.update();
          propsInTransition[key] = transition.value;

          if (!transition.inProgress) {
            this.remove(key);
          }
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }

      return propsInTransition;
    }
  }, {
    key: "clear",
    value: function clear() {
      var _iterator2 = _createForOfIteratorHelper$8(this.transitions.keys()),
          _step2;

      try {
        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
          var key = _step2.value;
          this.remove(key);
        }
      } catch (err) {
        _iterator2.e(err);
      } finally {
        _iterator2.f();
      }
    }
  }, {
    key: "active",
    get: function get() {
      return this.transitions.size > 0;
    }
  }]);

  return UniformTransitionManager;
}();

var LIFECYCLE = {
  NO_STATE: 'Awaiting state',
  MATCHED: 'Matched. State transferred from previous layer',
  INITIALIZED: 'Initialized',
  AWAITING_GC: 'Discarded. Awaiting garbage collection',
  AWAITING_FINALIZATION: 'No longer matched. Awaiting garbage collection',
  FINALIZED: 'Finalized! Awaiting garbage collection'
};
var PROP_SYMBOLS = {
  COMPONENT: Symbol["for"]('component'),
  ASYNC_DEFAULTS: Symbol["for"]('asyncPropDefaults'),
  ASYNC_ORIGINAL: Symbol["for"]('asyncPropOriginal'),
  ASYNC_RESOLVED: Symbol["for"]('asyncPropResolved')
};

var COMPONENT = PROP_SYMBOLS.COMPONENT;
function validateProps(props) {
  var propTypes = getPropTypes(props);

  for (var propName in propTypes) {
    var propType = propTypes[propName];
    var validate = propType.validate;

    if (validate && !validate(props[propName], propType)) {
      throw new Error("Invalid prop ".concat(propName, ": ").concat(props[propName]));
    }
  }
}
function diffProps(props, oldProps) {
  var propsChangedReason = compareProps({
    newProps: props,
    oldProps: oldProps,
    propTypes: getPropTypes(props),
    ignoreProps: {
      data: null,
      updateTriggers: null,
      extensions: null,
      transitions: null
    }
  });
  var dataChangedReason = diffDataProps(props, oldProps);
  var updateTriggersChangedReason = false;

  if (!dataChangedReason) {
    updateTriggersChangedReason = diffUpdateTriggers(props, oldProps);
  }

  return {
    dataChanged: dataChangedReason,
    propsChanged: propsChangedReason,
    updateTriggersChanged: updateTriggersChangedReason,
    extensionsChanged: diffExtensions(props, oldProps),
    transitionsChanged: diffTransitions(props, oldProps)
  };
}

function diffTransitions(props, oldProps) {
  if (!props.transitions) {
    return null;
  }

  var result = {};
  var propTypes = getPropTypes(props);

  for (var key in props.transitions) {
    var propType = propTypes[key];
    var type = propType && propType.type;
    var isTransitionable = type === 'number' || type === 'color' || type === 'array';

    if (isTransitionable && comparePropValues(props[key], oldProps[key], propType)) {
      result[key] = true;
    }
  }

  return result;
}

function compareProps() {
  var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
      newProps = _ref.newProps,
      oldProps = _ref.oldProps,
      _ref$ignoreProps = _ref.ignoreProps,
      ignoreProps = _ref$ignoreProps === void 0 ? {} : _ref$ignoreProps,
      _ref$propTypes = _ref.propTypes,
      propTypes = _ref$propTypes === void 0 ? {} : _ref$propTypes,
      _ref$triggerName = _ref.triggerName,
      triggerName = _ref$triggerName === void 0 ? 'props' : _ref$triggerName;

  if (oldProps === newProps) {
    return null;
  }

  if (_typeof(newProps) !== 'object' || newProps === null) {
    return "".concat(triggerName, " changed shallowly");
  }

  if (_typeof(oldProps) !== 'object' || oldProps === null) {
    return "".concat(triggerName, " changed shallowly");
  }

  for (var _i = 0, _Object$keys = Object.keys(newProps); _i < _Object$keys.length; _i++) {
    var key = _Object$keys[_i];

    if (!(key in ignoreProps)) {
      if (!(key in oldProps)) {
        return "".concat(triggerName, ".").concat(key, " added");
      }

      var changed = comparePropValues(newProps[key], oldProps[key], propTypes[key]);

      if (changed) {
        return "".concat(triggerName, ".").concat(key, " ").concat(changed);
      }
    }
  }

  for (var _i2 = 0, _Object$keys2 = Object.keys(oldProps); _i2 < _Object$keys2.length; _i2++) {
    var _key = _Object$keys2[_i2];

    if (!(_key in ignoreProps)) {
      if (!(_key in newProps)) {
        return "".concat(triggerName, ".").concat(_key, " dropped");
      }

      if (!Object.hasOwnProperty.call(newProps, _key)) {
        var _changed = comparePropValues(newProps[_key], oldProps[_key], propTypes[_key]);

        if (_changed) {
          return "".concat(triggerName, ".").concat(_key, " ").concat(_changed);
        }
      }
    }
  }

  return null;
}

function comparePropValues(newProp, oldProp, propType) {
  var equal = propType && propType.equal;

  if (equal && !equal(newProp, oldProp, propType)) {
    return 'changed deeply';
  }

  if (!equal) {
    equal = newProp && oldProp && newProp.equals;

    if (equal && !equal.call(newProp, oldProp)) {
      return 'changed deeply';
    }
  }

  if (!equal && oldProp !== newProp) {
    return 'changed shallowly';
  }

  return null;
}

function diffDataProps(props, oldProps) {
  if (oldProps === null) {
    return 'oldProps is null, initial diff';
  }

  var dataChanged = null;
  var dataComparator = props.dataComparator,
      _dataDiff = props._dataDiff;

  if (dataComparator) {
    if (!dataComparator(props.data, oldProps.data)) {
      dataChanged = 'Data comparator detected a change';
    }
  } else if (props.data !== oldProps.data) {
    dataChanged = 'A new data container was supplied';
  }

  if (dataChanged && _dataDiff) {
    dataChanged = _dataDiff(props.data, oldProps.data) || dataChanged;
  }

  return dataChanged;
}

function diffUpdateTriggers(props, oldProps) {
  if (oldProps === null) {
    return 'oldProps is null, initial diff';
  }

  if ('all' in props.updateTriggers) {
    var diffReason = diffUpdateTrigger(props, oldProps, 'all');

    if (diffReason) {
      return {
        all: true
      };
    }
  }

  var triggerChanged = {};
  var reason = false;

  for (var triggerName in props.updateTriggers) {
    if (triggerName !== 'all') {
      var _diffReason = diffUpdateTrigger(props, oldProps, triggerName);

      if (_diffReason) {
        triggerChanged[triggerName] = true;
        reason = triggerChanged;
      }
    }
  }

  return reason;
}

function diffExtensions(props, oldProps) {
  if (oldProps === null) {
    return 'oldProps is null, initial diff';
  }

  var oldExtensions = oldProps.extensions;
  var extensions = props.extensions;

  if (extensions === oldExtensions) {
    return false;
  }

  if (extensions.length !== oldExtensions.length) {
    return true;
  }

  for (var i = 0; i < extensions.length; i++) {
    if (!extensions[i].equals(oldExtensions[i])) {
      return true;
    }
  }

  return false;
}

function diffUpdateTrigger(props, oldProps, triggerName) {
  var newTriggers = props.updateTriggers[triggerName];
  newTriggers = newTriggers === undefined || newTriggers === null ? {} : newTriggers;
  var oldTriggers = oldProps.updateTriggers[triggerName];
  oldTriggers = oldTriggers === undefined || oldTriggers === null ? {} : oldTriggers;
  var diffReason = compareProps({
    oldProps: oldTriggers,
    newProps: newTriggers,
    triggerName: triggerName
  });
  return diffReason;
}

function getPropTypes(props) {
  var layer = props[COMPONENT];
  var LayerType = layer && layer.constructor;
  return LayerType ? LayerType._propTypes : {};
}

var ERR_NOT_OBJECT = 'count(): argument not an object';
var ERR_NOT_CONTAINER = 'count(): argument not a container';
function count$1(container) {
  if (!isObject$1(container)) {
    throw new Error(ERR_NOT_OBJECT);
  }

  if (typeof container.count === 'function') {
    return container.count();
  }

  if (Number.isFinite(container.size)) {
    return container.size;
  }

  if (Number.isFinite(container.length)) {
    return container.length;
  }

  if (isPlainObject(container)) {
    return Object.keys(container).length;
  }

  throw new Error(ERR_NOT_CONTAINER);
}

function isPlainObject(value) {
  return value !== null && _typeof(value) === 'object' && value.constructor === Object;
}

function isObject$1(value) {
  return value !== null && _typeof(value) === 'object';
}

function ownKeys$a(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread$b(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys$a(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys$a(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function mergeShaders(target, source) {
  if (!source) {
    return target;
  }

  var result = Object.assign({}, target, source);

  if ('defines' in source) {
    result.defines = Object.assign({}, target.defines, source.defines);
  }

  if ('modules' in source) {
    result.modules = (target.modules || []).concat(source.modules);

    if (source.modules.some(function (module) {
      return module.name === 'project64';
    })) {
      var index = result.modules.findIndex(function (module) {
        return module.name === 'project32';
      });

      if (index >= 0) {
        result.modules.splice(index, 1);
      }
    }
  }

  if ('inject' in source) {
    if (!target.inject) {
      result.inject = source.inject;
    } else {
      var mergedInjection = _objectSpread$b({}, target.inject);

      for (var key in source.inject) {
        mergedInjection[key] = (mergedInjection[key] || '') + source.inject[key];
      }

      result.inject = mergedInjection;
    }
  }

  return result;
}

var TYPE_DEFINITIONS$1 = {
  "boolean": {
    validate: function validate(value, propType) {
      return true;
    },
    equal: function equal(value1, value2, propType) {
      return Boolean(value1) === Boolean(value2);
    }
  },
  number: {
    validate: function validate(value, propType) {
      return Number.isFinite(value) && (!('max' in propType) || value <= propType.max) && (!('min' in propType) || value >= propType.min);
    }
  },
  color: {
    validate: function validate(value, propType) {
      return propType.optional && !value || isArray$2(value) && (value.length === 3 || value.length === 4);
    },
    equal: function equal(value1, value2, propType) {
      return arrayEqual(value1, value2);
    }
  },
  accessor: {
    validate: function validate(value, propType) {
      var valueType = getTypeOf$1(value);
      return valueType === 'function' || valueType === getTypeOf$1(propType.value);
    },
    equal: function equal(value1, value2, propType) {
      if (typeof value2 === 'function') {
        return true;
      }

      return arrayEqual(value1, value2);
    }
  },
  array: {
    validate: function validate(value, propType) {
      return propType.optional && !value || isArray$2(value);
    },
    equal: function equal(value1, value2, propType) {
      return propType.compare ? arrayEqual(value1, value2) : value1 === value2;
    }
  },
  "function": {
    validate: function validate(value, propType) {
      return propType.optional && !value || typeof value === 'function';
    },
    equal: function equal(value1, value2, propType) {
      return !propType.compare || value1 === value2;
    }
  }
};

function arrayEqual(array1, array2) {
  if (array1 === array2) {
    return true;
  }

  if (!isArray$2(array1) || !isArray$2(array2)) {
    return false;
  }

  var len = array1.length;

  if (len !== array2.length) {
    return false;
  }

  for (var i = 0; i < len; i++) {
    if (array1[i] !== array2[i]) {
      return false;
    }
  }

  return true;
}

function parsePropTypes$1(propDefs) {
  var propTypes = {};
  var defaultProps = {};
  var deprecatedProps = {};

  for (var _i = 0, _Object$entries = Object.entries(propDefs); _i < _Object$entries.length; _i++) {
    var _Object$entries$_i = _slicedToArray(_Object$entries[_i], 2),
        propName = _Object$entries$_i[0],
        propDef = _Object$entries$_i[1];

    if (propDef && propDef.deprecatedFor) {
      deprecatedProps[propName] = Array.isArray(propDef.deprecatedFor) ? propDef.deprecatedFor : [propDef.deprecatedFor];
    } else {
      var propType = parsePropType$1(propName, propDef);
      propTypes[propName] = propType;
      defaultProps[propName] = propType.value;
    }
  }

  return {
    propTypes: propTypes,
    defaultProps: defaultProps,
    deprecatedProps: deprecatedProps
  };
}

function parsePropType$1(name, propDef) {
  switch (getTypeOf$1(propDef)) {
    case 'object':
      return normalizePropDefinition(name, propDef);

    case 'array':
      return normalizePropDefinition(name, {
        type: 'array',
        value: propDef,
        compare: false
      });

    case 'boolean':
      return normalizePropDefinition(name, {
        type: 'boolean',
        value: propDef
      });

    case 'number':
      return normalizePropDefinition(name, {
        type: 'number',
        value: propDef
      });

    case 'function':
      return normalizePropDefinition(name, {
        type: 'function',
        value: propDef,
        compare: true
      });

    default:
      return {
        name: name,
        type: 'unknown',
        value: propDef
      };
  }
}

function normalizePropDefinition(name, propDef) {
  if (!('type' in propDef)) {
    if (!('value' in propDef)) {
      return {
        name: name,
        type: 'object',
        value: propDef
      };
    }

    return Object.assign({
      name: name,
      type: getTypeOf$1(propDef.value)
    }, propDef);
  }

  return Object.assign({
    name: name
  }, TYPE_DEFINITIONS$1[propDef.type], propDef);
}

function isArray$2(value) {
  return Array.isArray(value) || ArrayBuffer.isView(value);
}

function getTypeOf$1(value) {
  if (isArray$2(value)) {
    return 'array';
  }

  if (value === null) {
    return 'null';
  }

  return _typeof(value);
}

function _createForOfIteratorHelper$9(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray$9(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray$9(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray$9(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray$9(o, minLen); }

function _arrayLikeToArray$9(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }
var COMPONENT$1 = PROP_SYMBOLS.COMPONENT,
    ASYNC_ORIGINAL = PROP_SYMBOLS.ASYNC_ORIGINAL,
    ASYNC_RESOLVED = PROP_SYMBOLS.ASYNC_RESOLVED,
    ASYNC_DEFAULTS = PROP_SYMBOLS.ASYNC_DEFAULTS;
function createProps() {
  var component = this;
  var propsPrototype = getPropsPrototype(component.constructor);
  var propsInstance = Object.create(propsPrototype);
  propsInstance[COMPONENT$1] = component;
  propsInstance[ASYNC_ORIGINAL] = {};
  propsInstance[ASYNC_RESOLVED] = {};

  for (var i = 0; i < arguments.length; ++i) {
    var props = arguments[i];

    for (var key in props) {
      propsInstance[key] = props[key];
    }
  }

  Object.freeze(propsInstance);
  return propsInstance;
}

function getPropsPrototype(componentClass) {
  var defaultProps = getOwnProperty(componentClass, '_mergedDefaultProps');

  if (!defaultProps) {
    createPropsPrototypeAndTypes(componentClass);
    return componentClass._mergedDefaultProps;
  }

  return defaultProps;
}

function createPropsPrototypeAndTypes(componentClass) {
  var parent = componentClass.prototype;

  if (!parent) {
    return;
  }

  var parentClass = Object.getPrototypeOf(componentClass);
  var parentDefaultProps = getPropsPrototype(parentClass);
  var componentDefaultProps = getOwnProperty(componentClass, 'defaultProps') || {};
  var componentPropDefs = parsePropTypes$1(componentDefaultProps);
  var defaultProps = createPropsPrototype(componentPropDefs.defaultProps, parentDefaultProps, componentClass);
  var propTypes = Object.assign({}, parentClass._propTypes, componentPropDefs.propTypes);
  addAsyncPropsToPropPrototype(defaultProps, propTypes);
  var deprecatedProps = Object.assign({}, parentClass._deprecatedProps, componentPropDefs.deprecatedProps);
  addDeprecatedPropsToPropPrototype(defaultProps, deprecatedProps);
  componentClass._mergedDefaultProps = defaultProps;
  componentClass._propTypes = propTypes;
  componentClass._deprecatedProps = deprecatedProps;
}

function createPropsPrototype(props, parentProps, componentClass) {
  var defaultProps = Object.create(null);
  Object.assign(defaultProps, parentProps, props);
  var id = getComponentName(componentClass);
  delete props.id;
  Object.defineProperties(defaultProps, {
    id: {
      writable: true,
      value: id
    }
  });
  return defaultProps;
}

function addDeprecatedPropsToPropPrototype(defaultProps, deprecatedProps) {
  var _loop = function _loop(propName) {
    Object.defineProperty(defaultProps, propName, {
      enumerable: false,
      set: function set(newValue) {
        var nameStr = "".concat(this.id, ": ").concat(propName);

        var _iterator = _createForOfIteratorHelper$9(deprecatedProps[propName]),
            _step;

        try {
          for (_iterator.s(); !(_step = _iterator.n()).done;) {
            var newPropName = _step.value;

            if (!hasOwnProperty(this, newPropName)) {
              this[newPropName] = newValue;
            }
          }
        } catch (err) {
          _iterator.e(err);
        } finally {
          _iterator.f();
        }

        log.deprecated(nameStr, deprecatedProps[propName].join('/'))();
      }
    });
  };

  for (var propName in deprecatedProps) {
    _loop(propName);
  }
}

function addAsyncPropsToPropPrototype(defaultProps, propTypes) {
  var defaultValues = {};
  var descriptors = {};

  for (var propName in propTypes) {
    var propType = propTypes[propName];
    var name = propType.name,
        value = propType.value;

    if (propType.async) {
      defaultValues[name] = value;
      descriptors[name] = getDescriptorForAsyncProp(name);
    }
  }

  defaultProps[ASYNC_DEFAULTS] = defaultValues;
  defaultProps[ASYNC_ORIGINAL] = {};
  Object.defineProperties(defaultProps, descriptors);
}

function getDescriptorForAsyncProp(name) {
  return {
    enumerable: true,
    set: function set(newValue) {
      if (typeof newValue === 'string' || newValue instanceof Promise || isAsyncIterable$1(newValue)) {
        this[ASYNC_ORIGINAL][name] = newValue;
      } else {
        this[ASYNC_RESOLVED][name] = newValue;
      }
    },
    get: function get() {
      if (this[ASYNC_RESOLVED]) {
        if (name in this[ASYNC_RESOLVED]) {
          var value = this[ASYNC_RESOLVED][name];
          return value || this[ASYNC_DEFAULTS][name];
        }

        if (name in this[ASYNC_ORIGINAL]) {
          var state = this[COMPONENT$1] && this[COMPONENT$1].internalState;

          if (state && state.hasAsyncProp(name)) {
            return state.getAsyncProp(name) || this[ASYNC_DEFAULTS][name];
          }
        }
      }

      return this[ASYNC_DEFAULTS][name];
    }
  };
}

function hasOwnProperty(object, prop) {
  return Object.prototype.hasOwnProperty.call(object, prop);
}

function getOwnProperty(object, prop) {
  return hasOwnProperty(object, prop) && object[prop];
}

function getComponentName(componentClass) {
  var componentName = getOwnProperty(componentClass, 'layerName') || getOwnProperty(componentClass, 'componentName');

  if (!componentName) {
    log.once(0, "".concat(componentClass.name, ".componentName not specified"))();
  }

  return componentName || componentClass.name;
}

var ASYNC_ORIGINAL$1 = PROP_SYMBOLS.ASYNC_ORIGINAL,
    ASYNC_RESOLVED$1 = PROP_SYMBOLS.ASYNC_RESOLVED,
    ASYNC_DEFAULTS$1 = PROP_SYMBOLS.ASYNC_DEFAULTS;
var EMPTY_PROPS = Object.freeze({});

var ComponentState = function () {
  function ComponentState() {
    var component = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

    _classCallCheck(this, ComponentState);

    this.component = component;
    this.asyncProps = {};

    this.onAsyncPropUpdated = function () {};

    this.oldProps = EMPTY_PROPS;
    this.oldAsyncProps = null;
  }

  _createClass(ComponentState, [{
    key: "getOldProps",
    value: function getOldProps() {
      return this.oldAsyncProps || this.oldProps;
    }
  }, {
    key: "resetOldProps",
    value: function resetOldProps() {
      this.oldAsyncProps = null;
      this.oldProps = this.component.props;
    }
  }, {
    key: "freezeAsyncOldProps",
    value: function freezeAsyncOldProps() {
      if (!this.oldAsyncProps) {
        this.oldProps = this.oldProps || this.component.props;
        this.oldAsyncProps = Object.create(this.oldProps);

        for (var propName in this.asyncProps) {
          Object.defineProperty(this.oldAsyncProps, propName, {
            enumerable: true,
            value: this.oldProps[propName]
          });
        }
      }
    }
  }, {
    key: "hasAsyncProp",
    value: function hasAsyncProp(propName) {
      return propName in this.asyncProps;
    }
  }, {
    key: "getAsyncProp",
    value: function getAsyncProp(propName) {
      var asyncProp = this.asyncProps[propName];
      return asyncProp && asyncProp.resolvedValue;
    }
  }, {
    key: "isAsyncPropLoading",
    value: function isAsyncPropLoading(propName) {
      if (propName) {
        var asyncProp = this.asyncProps[propName];
        return Boolean(asyncProp && asyncProp.pendingLoadCount > 0 && asyncProp.pendingLoadCount !== asyncProp.resolvedLoadCount);
      }

      for (var key in this.asyncProps) {
        if (this.isAsyncPropLoading(key)) {
          return true;
        }
      }

      return false;
    }
  }, {
    key: "reloadAsyncProp",
    value: function reloadAsyncProp(propName, value) {
      this._watchPromise(propName, Promise.resolve(value));
    }
  }, {
    key: "setAsyncProps",
    value: function setAsyncProps(props) {
      var resolvedValues = props[ASYNC_RESOLVED$1] || {};
      var originalValues = props[ASYNC_ORIGINAL$1] || props;
      var defaultValues = props[ASYNC_DEFAULTS$1] || {};

      for (var propName in resolvedValues) {
        var value = resolvedValues[propName];

        this._createAsyncPropData(propName, value, defaultValues[propName]);

        this._updateAsyncProp(propName, value);
      }

      for (var _propName in originalValues) {
        var _value2 = originalValues[_propName];

        this._createAsyncPropData(_propName, _value2, defaultValues[_propName]);

        this._updateAsyncProp(_propName, _value2);
      }
    }
  }, {
    key: "_updateAsyncProp",
    value: function _updateAsyncProp(propName, value) {
      if (!this._didAsyncInputValueChange(propName, value)) {
        return;
      }

      if (typeof value === 'string') {
        var fetch = this.layer && this.layer.props.fetch;
        var url = value;

        if (fetch) {
          value = fetch(url, {
            propName: propName,
            layer: this.layer
          });
        }
      }

      if (value instanceof Promise) {
        this._watchPromise(propName, value);

        return;
      }

      if (isAsyncIterable$1(value)) {
        this._resolveAsyncIterable(propName, value);

        return;
      }

      this._setPropValue(propName, value);
    }
  }, {
    key: "_didAsyncInputValueChange",
    value: function _didAsyncInputValueChange(propName, value) {
      var asyncProp = this.asyncProps[propName];

      if (value === asyncProp.lastValue) {
        return false;
      }

      asyncProp.lastValue = value;
      return true;
    }
  }, {
    key: "_setPropValue",
    value: function _setPropValue(propName, value) {
      var asyncProp = this.asyncProps[propName];
      asyncProp.value = value;
      asyncProp.resolvedValue = value;
      asyncProp.pendingLoadCount++;
      asyncProp.resolvedLoadCount = asyncProp.pendingLoadCount;
    }
  }, {
    key: "_setAsyncPropValue",
    value: function _setAsyncPropValue(propName, value, loadCount) {
      var asyncProp = this.asyncProps[propName];

      if (asyncProp && loadCount >= asyncProp.resolvedLoadCount && value !== undefined) {
        this.freezeAsyncOldProps();
        asyncProp.resolvedValue = value;
        asyncProp.resolvedLoadCount = loadCount;
        this.onAsyncPropUpdated(propName, value);
      }
    }
  }, {
    key: "_watchPromise",
    value: function _watchPromise(propName, promise) {
      var _this = this;

      var asyncProp = this.asyncProps[propName];
      asyncProp.pendingLoadCount++;
      var loadCount = asyncProp.pendingLoadCount;
      promise.then(function (data) {
        data = _this._postProcessValue(propName, data);

        _this._setAsyncPropValue(propName, data, loadCount);

        var onDataLoad = _this.layer && _this.layer.props.onDataLoad;

        if (propName === 'data' && onDataLoad) {
          onDataLoad(data, {
            propName: propName,
            layer: _this.layer
          });
        }
      })["catch"](function (error) {
        return log.error(error)();
      });
    }
  }, {
    key: "_resolveAsyncIterable",
    value: function () {
      var _resolveAsyncIterable2 = _asyncToGenerator(regenerator.mark(function _callee(propName, iterable) {
        var asyncProp, loadCount, data, count, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, _value, chunk, onDataLoad;

        return regenerator.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                if (propName !== 'data') {
                  this._setPropValue(propName, iterable);
                }

                asyncProp = this.asyncProps[propName];
                asyncProp.pendingLoadCount++;
                loadCount = asyncProp.pendingLoadCount;
                data = [];
                count = 0;
                _iteratorNormalCompletion = true;
                _didIteratorError = false;
                _context.prev = 8;
                _iterator = _asyncIterator(iterable);

              case 10:
                _context.next = 12;
                return _iterator.next();

              case 12:
                _step = _context.sent;
                _iteratorNormalCompletion = _step.done;
                _context.next = 16;
                return _step.value;

              case 16:
                _value = _context.sent;

                if (_iteratorNormalCompletion) {
                  _context.next = 26;
                  break;
                }

                chunk = _value;
                data = this._postProcessValue(propName, chunk, data);
                Object.defineProperty(data, '__diff', {
                  enumerable: false,
                  value: [{
                    startRow: count,
                    endRow: data.length
                  }]
                });
                count = data.length;

                this._setAsyncPropValue(propName, data, loadCount);

              case 23:
                _iteratorNormalCompletion = true;
                _context.next = 10;
                break;

              case 26:
                _context.next = 32;
                break;

              case 28:
                _context.prev = 28;
                _context.t0 = _context["catch"](8);
                _didIteratorError = true;
                _iteratorError = _context.t0;

              case 32:
                _context.prev = 32;
                _context.prev = 33;

                if (!(!_iteratorNormalCompletion && _iterator["return"] != null)) {
                  _context.next = 37;
                  break;
                }

                _context.next = 37;
                return _iterator["return"]();

              case 37:
                _context.prev = 37;

                if (!_didIteratorError) {
                  _context.next = 40;
                  break;
                }

                throw _iteratorError;

              case 40:
                return _context.finish(37);

              case 41:
                return _context.finish(32);

              case 42:
                onDataLoad = this.layer && this.layer.props.onDataLoad;

                if (onDataLoad) {
                  onDataLoad(data, {
                    propName: propName,
                    layer: this.layer
                  });
                }

              case 44:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this, [[8, 28, 32, 42], [33,, 37, 41]]);
      }));

      function _resolveAsyncIterable(_x, _x2) {
        return _resolveAsyncIterable2.apply(this, arguments);
      }

      return _resolveAsyncIterable;
    }()
  }, {
    key: "_postProcessValue",
    value: function _postProcessValue(propName, value, previousValue) {
      var _ref = this.component ? this.component.props : {},
          dataTransform = _ref.dataTransform;

      if (propName !== 'data') {
        return value;
      }

      if (dataTransform) {
        return dataTransform(value, previousValue);
      }

      return previousValue ? previousValue.concat(value) : value;
    }
  }, {
    key: "_createAsyncPropData",
    value: function _createAsyncPropData(propName, value, defaultValue) {
      var asyncProp = this.asyncProps[propName];

      if (!asyncProp) {
        this.asyncProps[propName] = {
          lastValue: null,
          resolvedValue: defaultValue,
          pendingLoadCount: 0,
          resolvedLoadCount: 0
        };
      }
    }
  }]);

  return ComponentState;
}();

var ASYNC_ORIGINAL$2 = PROP_SYMBOLS.ASYNC_ORIGINAL,
    ASYNC_RESOLVED$2 = PROP_SYMBOLS.ASYNC_RESOLVED,
    ASYNC_DEFAULTS$2 = PROP_SYMBOLS.ASYNC_DEFAULTS;
var defaultProps = {};
var counter = 0;

var Component = function () {
  function Component() {
    _classCallCheck(this, Component);

    this.props = createProps.apply(this, arguments);
    this.id = this.props.id;
    this.count = counter++;
    this.lifecycle = LIFECYCLE.NO_STATE;
    this.parent = null;
    this.context = null;
    this.state = null;
    this.internalState = null;
    Object.seal(this);
  }

  _createClass(Component, [{
    key: "clone",
    value: function clone(newProps) {
      var props = this.props;
      var asyncProps = {};

      for (var key in props[ASYNC_DEFAULTS$2]) {
        if (key in props[ASYNC_RESOLVED$2]) {
          asyncProps[key] = props[ASYNC_RESOLVED$2][key];
        } else if (key in props[ASYNC_ORIGINAL$2]) {
          asyncProps[key] = props[ASYNC_ORIGINAL$2][key];
        }
      }

      return new this.constructor(Object.assign({}, props, asyncProps, newProps));
    }
  }, {
    key: "_initState",
    value: function _initState() {
      this.internalState = new ComponentState({});
    }
  }, {
    key: "stats",
    get: function get() {
      return this.internalState.stats;
    }
  }]);

  return Component;
}();
Component.componentName = 'Component';
Component.defaultProps = defaultProps;

function _createSuper$9(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct$a(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _isNativeReflectConstruct$a() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

var LayerState = function (_ComponentState) {
  _inherits(LayerState, _ComponentState);

  var _super = _createSuper$9(LayerState);

  function LayerState(_ref) {
    var _this;

    var attributeManager = _ref.attributeManager,
        layer = _ref.layer;

    _classCallCheck(this, LayerState);

    _this = _super.call(this, layer);
    _this.attributeManager = attributeManager;
    _this.model = null;
    _this.needsRedraw = true;
    _this.subLayers = null;
    return _this;
  }

  _createClass(LayerState, [{
    key: "layer",
    get: function get() {
      return this.component;
    },
    set: function set(layer) {
      this.component = layer;
    }
  }]);

  return LayerState;
}(ComponentState);

function _createForOfIteratorHelper$a(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray$a(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray$a(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray$a(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray$a(o, minLen); }

function _arrayLikeToArray$a(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _createSuper$a(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct$b(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _isNativeReflectConstruct$b() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }
var TRACE_CHANGE_FLAG = 'layer.changeFlag';
var TRACE_INITIALIZE = 'layer.initialize';
var TRACE_UPDATE = 'layer.update';
var TRACE_FINALIZE = 'layer.finalize';
var TRACE_MATCHED = 'layer.matched';
var MAX_PICKING_COLOR_CACHE_SIZE = Math.pow(2, 24) - 1;
var EMPTY_ARRAY$1 = Object.freeze([]);
var areViewportsEqual = memoize(function (_ref) {
  var oldViewport = _ref.oldViewport,
      viewport = _ref.viewport;
  return oldViewport.equals(viewport);
});
var pickingColorCache = new Uint8ClampedArray(0);
var defaultProps$1 = {
  data: {
    type: 'data',
    value: EMPTY_ARRAY$1,
    async: true
  },
  dataComparator: null,
  _dataDiff: {
    type: 'function',
    value: function value(data) {
      return data && data.__diff;
    },
    compare: false,
    optional: true
  },
  dataTransform: {
    type: 'function',
    value: null,
    compare: false,
    optional: true
  },
  onDataLoad: {
    type: 'function',
    value: null,
    compare: false,
    optional: true
  },
  fetch: {
    type: 'function',
    value: function value(url, _ref2) {
      var propName = _ref2.propName,
          layer = _ref2.layer;
      var resourceManager = layer.context.resourceManager;
      var loadOptions = layer.getLoadOptions();
      var inResourceManager = resourceManager.contains(url);

      if (!inResourceManager && !loadOptions) {
        resourceManager.add({
          resourceId: url,
          data: url,
          persistent: false
        });
        inResourceManager = true;
      }

      if (inResourceManager) {
        return resourceManager.subscribe({
          resourceId: url,
          onChange: function onChange(data) {
            return layer.internalState.reloadAsyncProp(propName, data);
          },
          consumerId: layer.id,
          requestId: propName
        });
      }

      return load(url, loadOptions);
    },
    compare: false
  },
  updateTriggers: {},
  visible: true,
  pickable: false,
  opacity: {
    type: 'number',
    min: 0,
    max: 1,
    value: 1
  },
  onHover: {
    type: 'function',
    value: null,
    compare: false,
    optional: true
  },
  onClick: {
    type: 'function',
    value: null,
    compare: false,
    optional: true
  },
  onDragStart: {
    type: 'function',
    value: null,
    compare: false,
    optional: true
  },
  onDrag: {
    type: 'function',
    value: null,
    compare: false,
    optional: true
  },
  onDragEnd: {
    type: 'function',
    value: null,
    compare: false,
    optional: true
  },
  coordinateSystem: COORDINATE_SYSTEM.DEFAULT,
  coordinateOrigin: {
    type: 'array',
    value: [0, 0, 0],
    compare: true
  },
  modelMatrix: {
    type: 'array',
    value: null,
    compare: true,
    optional: true
  },
  wrapLongitude: false,
  positionFormat: 'XYZ',
  colorFormat: 'RGBA',
  parameters: {},
  uniforms: {},
  extensions: [],
  getPolygonOffset: {
    type: 'function',
    value: function value(_ref3) {
      var layerIndex = _ref3.layerIndex;
      return [0, -layerIndex * 100];
    },
    compare: false
  },
  highlightedObjectIndex: -1,
  autoHighlight: false,
  highlightColor: {
    type: 'accessor',
    value: [0, 0, 128, 128]
  }
};

var Layer = function (_Component) {
  _inherits(Layer, _Component);

  var _super = _createSuper$a(Layer);

  function Layer() {
    _classCallCheck(this, Layer);

    return _super.apply(this, arguments);
  }

  _createClass(Layer, [{
    key: "toString",
    value: function toString() {
      var className = this.constructor.layerName || this.constructor.name;
      return "".concat(className, "({id: '").concat(this.props.id, "'})");
    }
  }, {
    key: "setState",
    value: function setState(updateObject) {
      this.setChangeFlags({
        stateChanged: true
      });
      Object.assign(this.state, updateObject);
      this.setNeedsRedraw();
    }
  }, {
    key: "setNeedsRedraw",
    value: function setNeedsRedraw() {
      var redraw = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;

      if (this.internalState) {
        this.internalState.needsRedraw = redraw;
      }
    }
  }, {
    key: "setNeedsUpdate",
    value: function setNeedsUpdate() {
      this.context.layerManager.setNeedsUpdate(String(this));
      this.internalState.needsUpdate = true;
    }
  }, {
    key: "getNeedsRedraw",
    value: function getNeedsRedraw() {
      var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {
        clearRedrawFlags: false
      };
      return this._getNeedsRedraw(opts);
    }
  }, {
    key: "needsUpdate",
    value: function needsUpdate() {
      return this.internalState.needsUpdate || this.hasUniformTransition() || this.shouldUpdateState(this._getUpdateParams());
    }
  }, {
    key: "hasUniformTransition",
    value: function hasUniformTransition() {
      return this.internalState.uniformTransitions.active;
    }
  }, {
    key: "isPickable",
    value: function isPickable() {
      return this.props.pickable && this.props.visible;
    }
  }, {
    key: "getModels",
    value: function getModels() {
      return this.state && (this.state.models || (this.state.model ? [this.state.model] : []));
    }
  }, {
    key: "getAttributeManager",
    value: function getAttributeManager() {
      return this.internalState && this.internalState.attributeManager;
    }
  }, {
    key: "getCurrentLayer",
    value: function getCurrentLayer() {
      return this.internalState && this.internalState.layer;
    }
  }, {
    key: "getLoadOptions",
    value: function getLoadOptions() {
      return this.props.loadOptions;
    }
  }, {
    key: "project",
    value: function project(xyz) {
      var viewport = this.context.viewport;
      var worldPosition = getWorldPosition(xyz, {
        viewport: viewport,
        modelMatrix: this.props.modelMatrix,
        coordinateOrigin: this.props.coordinateOrigin,
        coordinateSystem: this.props.coordinateSystem
      });

      var _worldToPixels = worldToPixels(worldPosition, viewport.pixelProjectionMatrix),
          _worldToPixels2 = _slicedToArray(_worldToPixels, 3),
          x = _worldToPixels2[0],
          y = _worldToPixels2[1],
          z = _worldToPixels2[2];

      return xyz.length === 2 ? [x, y] : [x, y, z];
    }
  }, {
    key: "unproject",
    value: function unproject(xy) {
      var viewport = this.context.viewport;
      return viewport.unproject(xy);
    }
  }, {
    key: "projectPosition",
    value: function projectPosition$1(xyz) {
      return projectPosition(xyz, {
        viewport: this.context.viewport,
        modelMatrix: this.props.modelMatrix,
        coordinateOrigin: this.props.coordinateOrigin,
        coordinateSystem: this.props.coordinateSystem
      });
    }
  }, {
    key: "use64bitPositions",
    value: function use64bitPositions() {
      var coordinateSystem = this.props.coordinateSystem;
      return coordinateSystem === COORDINATE_SYSTEM.DEFAULT || coordinateSystem === COORDINATE_SYSTEM.LNGLAT || coordinateSystem === COORDINATE_SYSTEM.CARTESIAN;
    }
  }, {
    key: "onHover",
    value: function onHover(info, pickingEvent) {
      if (this.props.onHover) {
        return this.props.onHover(info, pickingEvent);
      }

      return false;
    }
  }, {
    key: "onClick",
    value: function onClick(info, pickingEvent) {
      if (this.props.onClick) {
        return this.props.onClick(info, pickingEvent);
      }

      return false;
    }
  }, {
    key: "nullPickingColor",
    value: function nullPickingColor() {
      return [0, 0, 0];
    }
  }, {
    key: "encodePickingColor",
    value: function encodePickingColor(i) {
      var target = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
      target[0] = i + 1 & 255;
      target[1] = i + 1 >> 8 & 255;
      target[2] = i + 1 >> 8 >> 8 & 255;
      return target;
    }
  }, {
    key: "decodePickingColor",
    value: function decodePickingColor(color) {
      assert$6(color instanceof Uint8Array);

      var _color = _slicedToArray(color, 3),
          i1 = _color[0],
          i2 = _color[1],
          i3 = _color[2];

      var index = i1 + i2 * 256 + i3 * 65536 - 1;
      return index;
    }
  }, {
    key: "initializeState",
    value: function initializeState() {
      throw new Error("Layer ".concat(this, " has not defined initializeState"));
    }
  }, {
    key: "getShaders",
    value: function getShaders(shaders) {
      var _iterator = _createForOfIteratorHelper$a(this.props.extensions),
          _step;

      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var extension = _step.value;
          shaders = mergeShaders(shaders, extension.getShaders.call(this, extension));
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }

      return shaders;
    }
  }, {
    key: "shouldUpdateState",
    value: function shouldUpdateState(_ref4) {
      var oldProps = _ref4.oldProps,
          props = _ref4.props,
          context = _ref4.context,
          changeFlags = _ref4.changeFlags;
      return changeFlags.propsOrDataChanged;
    }
  }, {
    key: "updateState",
    value: function updateState(_ref5) {
      var oldProps = _ref5.oldProps,
          props = _ref5.props,
          context = _ref5.context,
          changeFlags = _ref5.changeFlags;
      var attributeManager = this.getAttributeManager();

      if (changeFlags.dataChanged && attributeManager) {
        var dataChanged = changeFlags.dataChanged;

        if (Array.isArray(dataChanged)) {
          var _iterator2 = _createForOfIteratorHelper$a(dataChanged),
              _step2;

          try {
            for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
              var dataRange = _step2.value;
              attributeManager.invalidateAll(dataRange);
            }
          } catch (err) {
            _iterator2.e(err);
          } finally {
            _iterator2.f();
          }
        } else {
          attributeManager.invalidateAll();
        }
      }

      var neededPickingBuffer = oldProps.highlightedObjectIndex >= 0 || oldProps.pickable;
      var needPickingBuffer = props.highlightedObjectIndex >= 0 || props.pickable;

      if (neededPickingBuffer !== needPickingBuffer && attributeManager) {
        var _attributeManager$att = attributeManager.attributes,
            pickingColors = _attributeManager$att.pickingColors,
            instancePickingColors = _attributeManager$att.instancePickingColors;
        var pickingColorsAttribute = pickingColors || instancePickingColors;

        if (pickingColorsAttribute) {
          if (needPickingBuffer && pickingColorsAttribute.constant) {
            pickingColorsAttribute.constant = false;
            attributeManager.invalidate(pickingColorsAttribute.id);
          }

          if (!pickingColorsAttribute.value && !needPickingBuffer) {
            pickingColorsAttribute.constant = true;
            pickingColorsAttribute.value = [0, 0, 0];
          }
        }
      }
    }
  }, {
    key: "finalizeState",
    value: function finalizeState() {
      var _iterator3 = _createForOfIteratorHelper$a(this.getModels()),
          _step3;

      try {
        for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
          var model = _step3.value;
          model["delete"]();
        }
      } catch (err) {
        _iterator3.e(err);
      } finally {
        _iterator3.f();
      }

      var attributeManager = this.getAttributeManager();

      if (attributeManager) {
        attributeManager.finalize();
      }

      this.context.resourceManager.unsubscribe({
        consumerId: this.id
      });
      this.internalState.uniformTransitions.clear();
    }
  }, {
    key: "draw",
    value: function draw(opts) {
      var _iterator4 = _createForOfIteratorHelper$a(this.getModels()),
          _step4;

      try {
        for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
          var model = _step4.value;
          model.draw(opts);
        }
      } catch (err) {
        _iterator4.e(err);
      } finally {
        _iterator4.f();
      }
    }
  }, {
    key: "getPickingInfo",
    value: function getPickingInfo(_ref6) {
      var info = _ref6.info,
          mode = _ref6.mode;
      var index = info.index;

      if (index >= 0) {
        if (Array.isArray(this.props.data)) {
          info.object = this.props.data[index];
        }
      }

      return info;
    }
  }, {
    key: "activateViewport",
    value: function activateViewport(viewport) {
      var oldViewport = this.internalState.viewport;
      this.internalState.viewport = viewport;

      if (!oldViewport || !areViewportsEqual({
        oldViewport: oldViewport,
        viewport: viewport
      })) {
        this.setChangeFlags({
          viewportChanged: true
        });

        this._update();
      }
    }
  }, {
    key: "invalidateAttribute",
    value: function invalidateAttribute() {
      var name = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'all';
      var attributeManager = this.getAttributeManager();

      if (!attributeManager) {
        return;
      }

      if (name === 'all') {
        attributeManager.invalidateAll();
      } else {
        attributeManager.invalidate(name);
      }
    }
  }, {
    key: "updateAttributes",
    value: function updateAttributes(changedAttributes) {
      var _iterator5 = _createForOfIteratorHelper$a(this.getModels()),
          _step5;

      try {
        for (_iterator5.s(); !(_step5 = _iterator5.n()).done;) {
          var model = _step5.value;

          this._setModelAttributes(model, changedAttributes);
        }
      } catch (err) {
        _iterator5.e(err);
      } finally {
        _iterator5.f();
      }
    }
  }, {
    key: "_updateAttributes",
    value: function _updateAttributes(props) {
      var attributeManager = this.getAttributeManager();

      if (!attributeManager) {
        return;
      }

      var numInstances = this.getNumInstances(props);
      var startIndices = this.getStartIndices(props);
      attributeManager.update({
        data: props.data,
        numInstances: numInstances,
        startIndices: startIndices,
        props: props,
        transitions: props.transitions,
        buffers: props.data.attributes,
        context: this,
        ignoreUnknownAttributes: true
      });
      var changedAttributes = attributeManager.getChangedAttributes({
        clearChangedFlags: true
      });
      this.updateAttributes(changedAttributes);
    }
  }, {
    key: "_updateAttributeTransition",
    value: function _updateAttributeTransition() {
      var attributeManager = this.getAttributeManager();

      if (attributeManager) {
        attributeManager.updateTransition();
      }
    }
  }, {
    key: "_updateUniformTransition",
    value: function _updateUniformTransition() {
      var uniformTransitions = this.internalState.uniformTransitions;

      if (uniformTransitions.active) {
        var propsInTransition = uniformTransitions.update();
        var props = Object.create(this.props);

        for (var key in propsInTransition) {
          Object.defineProperty(props, key, {
            value: propsInTransition[key]
          });
        }

        return props;
      }

      return this.props;
    }
  }, {
    key: "calculateInstancePickingColors",
    value: function calculateInstancePickingColors(attribute, _ref7) {
      var numInstances = _ref7.numInstances;

      if (attribute.constant) {
        return;
      }

      var cacheSize = pickingColorCache.length / 3;

      if (cacheSize < numInstances) {
        if (numInstances > MAX_PICKING_COLOR_CACHE_SIZE) {
          log.warn('Layer has too many data objects. Picking might not be able to distinguish all objects.')();
        }

        pickingColorCache = defaultTypedArrayManager.allocate(pickingColorCache, numInstances, {
          size: 3,
          copy: true,
          maxCount: Math.max(numInstances, MAX_PICKING_COLOR_CACHE_SIZE)
        });
        var newCacheSize = pickingColorCache.length / 3;
        var pickingColor = [];

        for (var i = cacheSize; i < newCacheSize; i++) {
          this.encodePickingColor(i, pickingColor);
          pickingColorCache[i * 3 + 0] = pickingColor[0];
          pickingColorCache[i * 3 + 1] = pickingColor[1];
          pickingColorCache[i * 3 + 2] = pickingColor[2];
        }
      }

      attribute.value = pickingColorCache.subarray(0, numInstances * 3);
    }
  }, {
    key: "_setModelAttributes",
    value: function _setModelAttributes(model, changedAttributes) {
      var attributeManager = this.getAttributeManager();
      var excludeAttributes = model.userData.excludeAttributes || {};
      var shaderAttributes = attributeManager.getShaderAttributes(changedAttributes, excludeAttributes);
      model.setAttributes(shaderAttributes);
    }
  }, {
    key: "clearPickingColor",
    value: function clearPickingColor(color) {
      var _this$getAttributeMan = this.getAttributeManager().attributes,
          pickingColors = _this$getAttributeMan.pickingColors,
          instancePickingColors = _this$getAttributeMan.instancePickingColors;
      var colors = pickingColors || instancePickingColors;
      var i = this.decodePickingColor(color);
      var start = colors.getVertexOffset(i);
      var end = colors.getVertexOffset(i + 1);
      colors.buffer.subData({
        data: new Uint8Array(end - start),
        offset: start
      });
    }
  }, {
    key: "restorePickingColors",
    value: function restorePickingColors() {
      var _this$getAttributeMan2 = this.getAttributeManager().attributes,
          pickingColors = _this$getAttributeMan2.pickingColors,
          instancePickingColors = _this$getAttributeMan2.instancePickingColors;
      var colors = pickingColors || instancePickingColors;
      colors.updateSubBuffer({
        startOffset: 0
      });
    }
  }, {
    key: "getNumInstances",
    value: function getNumInstances(props) {
      props = props || this.props;

      if (props.numInstances !== undefined) {
        return props.numInstances;
      }

      if (this.state && this.state.numInstances !== undefined) {
        return this.state.numInstances;
      }

      return count$1(props.data);
    }
  }, {
    key: "getStartIndices",
    value: function getStartIndices(props) {
      props = props || this.props;

      if (props.startIndices !== undefined) {
        return props.startIndices;
      }

      if (this.state && this.state.startIndices) {
        return this.state.startIndices;
      }

      return null;
    }
  }, {
    key: "_initialize",
    value: function _initialize() {
      debug(TRACE_INITIALIZE, this);

      this._initState();

      this.initializeState(this.context);

      var _iterator6 = _createForOfIteratorHelper$a(this.props.extensions),
          _step6;

      try {
        for (_iterator6.s(); !(_step6 = _iterator6.n()).done;) {
          var extension = _step6.value;
          extension.initializeState.call(this, this.context, extension);
        }
      } catch (err) {
        _iterator6.e(err);
      } finally {
        _iterator6.f();
      }

      this.setChangeFlags({
        dataChanged: true,
        propsChanged: true,
        viewportChanged: true,
        extensionsChanged: true
      });

      this._updateState();
    }
  }, {
    key: "_update",
    value: function _update() {
      var stateNeedsUpdate = this.needsUpdate();
      debug(TRACE_UPDATE, this, stateNeedsUpdate);

      if (stateNeedsUpdate) {
        this._updateState();
      }
    }
  }, {
    key: "_updateState",
    value: function _updateState() {
      var currentProps = this.props;
      var currentViewport = this.context.viewport;

      var propsInTransition = this._updateUniformTransition();

      this.internalState.propsInTransition = propsInTransition;
      this.context.viewport = this.internalState.viewport || currentViewport;
      this.props = propsInTransition;

      var updateParams = this._getUpdateParams();

      var oldModels = this.getModels();

      if (this.context.gl) {
        this.updateState(updateParams);
      } else {
        try {
          this.updateState(updateParams);
        } catch (error) {}
      }

      var _iterator7 = _createForOfIteratorHelper$a(this.props.extensions),
          _step7;

      try {
        for (_iterator7.s(); !(_step7 = _iterator7.n()).done;) {
          var extension = _step7.value;
          extension.updateState.call(this, updateParams, extension);
        }
      } catch (err) {
        _iterator7.e(err);
      } finally {
        _iterator7.f();
      }

      var modelChanged = this.getModels()[0] !== oldModels[0];

      this._updateModules(updateParams, modelChanged);

      if (this.isComposite) {
        this._renderLayers(updateParams);
      } else {
        this.setNeedsRedraw();

        this._updateAttributes(this.props);

        if (this.state.model) {
          this.state.model.setInstanceCount(this.getNumInstances());
        }
      }

      this.context.viewport = currentViewport;
      this.props = currentProps;
      this.clearChangeFlags();
      this.internalState.needsUpdate = false;
      this.internalState.resetOldProps();
    }
  }, {
    key: "_finalize",
    value: function _finalize() {
      debug(TRACE_FINALIZE, this);
      assert$6(this.internalState && this.state);
      this.finalizeState(this.context);

      var _iterator8 = _createForOfIteratorHelper$a(this.props.extensions),
          _step8;

      try {
        for (_iterator8.s(); !(_step8 = _iterator8.n()).done;) {
          var extension = _step8.value;
          extension.finalizeState.call(this, extension);
        }
      } catch (err) {
        _iterator8.e(err);
      } finally {
        _iterator8.f();
      }
    }
  }, {
    key: "drawLayer",
    value: function drawLayer(_ref8) {
      var _this = this;

      var _ref8$moduleParameter = _ref8.moduleParameters,
          moduleParameters = _ref8$moduleParameter === void 0 ? null : _ref8$moduleParameter,
          _ref8$uniforms = _ref8.uniforms,
          uniforms = _ref8$uniforms === void 0 ? {} : _ref8$uniforms,
          _ref8$parameters = _ref8.parameters,
          parameters = _ref8$parameters === void 0 ? {} : _ref8$parameters;

      this._updateAttributeTransition();

      var currentProps = this.props;
      this.props = this.internalState.propsInTransition || currentProps;
      var opacity = this.props.opacity;
      uniforms.opacity = Math.pow(opacity, 1 / 2.2);

      if (moduleParameters) {
        this.setModuleParameters(moduleParameters);
      }

      var getPolygonOffset = this.props.getPolygonOffset;
      var offsets = getPolygonOffset && getPolygonOffset(uniforms) || [0, 0];
      setParameters(this.context.gl, {
        polygonOffset: offsets
      });
      withParameters(this.context.gl, parameters, function () {
        var opts = {
          moduleParameters: moduleParameters,
          uniforms: uniforms,
          parameters: parameters,
          context: _this.context
        };

        var _iterator9 = _createForOfIteratorHelper$a(_this.props.extensions),
            _step9;

        try {
          for (_iterator9.s(); !(_step9 = _iterator9.n()).done;) {
            var extension = _step9.value;
            extension.draw.call(_this, opts, extension);
          }
        } catch (err) {
          _iterator9.e(err);
        } finally {
          _iterator9.f();
        }

        _this.draw(opts);
      });
      this.props = currentProps;
    }
  }, {
    key: "getChangeFlags",
    value: function getChangeFlags() {
      return this.internalState.changeFlags;
    }
  }, {
    key: "setChangeFlags",
    value: function setChangeFlags(flags) {
      var changeFlags = this.internalState.changeFlags;

      for (var key in flags) {
        if (flags[key]) {
          var flagChanged = false;

          switch (key) {
            case 'dataChanged':
              if (Array.isArray(changeFlags[key])) {
                changeFlags[key] = Array.isArray(flags[key]) ? changeFlags[key].concat(flags[key]) : flags[key];
                flagChanged = true;
              }

            default:
              if (!changeFlags[key]) {
                changeFlags[key] = flags[key];
                flagChanged = true;
              }

          }

          if (flagChanged) {
            debug(TRACE_CHANGE_FLAG, this, key, flags);
          }
        }
      }

      var propsOrDataChanged = changeFlags.dataChanged || changeFlags.updateTriggersChanged || changeFlags.propsChanged || changeFlags.extensionsChanged;
      changeFlags.propsOrDataChanged = propsOrDataChanged;
      changeFlags.somethingChanged = propsOrDataChanged || flags.viewportChanged || flags.stateChanged;
    }
  }, {
    key: "clearChangeFlags",
    value: function clearChangeFlags() {
      this.internalState.changeFlags = {
        dataChanged: false,
        propsChanged: false,
        updateTriggersChanged: false,
        viewportChanged: false,
        stateChanged: false,
        extensionsChanged: false,
        propsOrDataChanged: false,
        somethingChanged: false
      };
    }
  }, {
    key: "diffProps",
    value: function diffProps$1(newProps, oldProps) {
      var changeFlags = diffProps(newProps, oldProps);

      if (changeFlags.updateTriggersChanged) {
        for (var key in changeFlags.updateTriggersChanged) {
          if (changeFlags.updateTriggersChanged[key]) {
            this.invalidateAttribute(key);
          }
        }
      }

      if (changeFlags.transitionsChanged) {
        for (var _key in changeFlags.transitionsChanged) {
          this.internalState.uniformTransitions.add(_key, oldProps[_key], newProps[_key], newProps.transitions[_key]);
        }
      }

      return this.setChangeFlags(changeFlags);
    }
  }, {
    key: "validateProps",
    value: function validateProps$1() {
      validateProps(this.props);
    }
  }, {
    key: "setModuleParameters",
    value: function setModuleParameters(moduleParameters) {
      var _iterator10 = _createForOfIteratorHelper$a(this.getModels()),
          _step10;

      try {
        for (_iterator10.s(); !(_step10 = _iterator10.n()).done;) {
          var model = _step10.value;
          model.updateModuleSettings(moduleParameters);
        }
      } catch (err) {
        _iterator10.e(err);
      } finally {
        _iterator10.f();
      }
    }
  }, {
    key: "_updateModules",
    value: function _updateModules(_ref9, forceUpdate) {
      var props = _ref9.props,
          oldProps = _ref9.oldProps;
      var autoHighlight = props.autoHighlight,
          highlightedObjectIndex = props.highlightedObjectIndex,
          highlightColor = props.highlightColor;

      if (forceUpdate || oldProps.autoHighlight !== autoHighlight || oldProps.highlightedObjectIndex !== highlightedObjectIndex || oldProps.highlightColor !== highlightColor) {
        var parameters = {};

        if (!autoHighlight) {
          parameters.pickingSelectedColor = null;
        }

        if (Array.isArray(highlightColor)) {
          parameters.pickingHighlightColor = highlightColor;
        }

        if (Number.isInteger(highlightedObjectIndex)) {
          parameters.pickingSelectedColor = highlightedObjectIndex >= 0 ? this.encodePickingColor(highlightedObjectIndex) : null;
        }

        this.setModuleParameters(parameters);
      }
    }
  }, {
    key: "_getUpdateParams",
    value: function _getUpdateParams() {
      return {
        props: this.props,
        oldProps: this.internalState.getOldProps(),
        context: this.context,
        changeFlags: this.internalState.changeFlags
      };
    }
  }, {
    key: "_getNeedsRedraw",
    value: function _getNeedsRedraw(opts) {
      if (!this.internalState) {
        return false;
      }

      var redraw = false;
      redraw = redraw || this.internalState.needsRedraw && this.id;
      this.internalState.needsRedraw = this.internalState.needsRedraw && !opts.clearRedrawFlags;
      var attributeManager = this.getAttributeManager();
      var attributeManagerNeedsRedraw = attributeManager && attributeManager.getNeedsRedraw(opts);
      redraw = redraw || attributeManagerNeedsRedraw;
      return redraw;
    }
  }, {
    key: "_getAttributeManager",
    value: function _getAttributeManager() {
      return new AttributeManager(this.context.gl, {
        id: this.props.id,
        stats: this.context.stats,
        timeline: this.context.timeline
      });
    }
  }, {
    key: "_initState",
    value: function _initState() {
      assert$6(!this.internalState && !this.state);
      assert$6(isFinite(this.props.coordinateSystem), "".concat(this.id, ": invalid coordinateSystem"));

      var attributeManager = this._getAttributeManager();

      if (attributeManager) {
        attributeManager.addInstanced({
          instancePickingColors: {
            type: 5121,
            size: 3,
            noAlloc: true,
            update: this.calculateInstancePickingColors
          }
        });
      }

      this.internalState = new LayerState({
        attributeManager: attributeManager,
        layer: this
      });
      this.clearChangeFlags();
      this.state = {};
      Object.defineProperty(this.state, 'attributeManager', {
        get: function get() {
          log.deprecated('layer.state.attributeManager', 'layer.getAttributeManager()');
          return attributeManager;
        }
      });
      this.internalState.layer = this;
      this.internalState.uniformTransitions = new UniformTransitionManager(this.context.timeline);
      this.internalState.onAsyncPropUpdated = this._onAsyncPropUpdated.bind(this);
      this.internalState.setAsyncProps(this.props);
    }
  }, {
    key: "_transferState",
    value: function _transferState(oldLayer) {
      debug(TRACE_MATCHED, this, this === oldLayer);
      var state = oldLayer.state,
          internalState = oldLayer.internalState;
      assert$6(state && internalState);

      if (this === oldLayer) {
        return;
      }

      this.internalState = internalState;
      this.internalState.layer = this;
      this.state = state;
      this.internalState.setAsyncProps(this.props);
      this.diffProps(this.props, this.internalState.getOldProps());
    }
  }, {
    key: "_onAsyncPropUpdated",
    value: function _onAsyncPropUpdated() {
      this.diffProps(this.props, this.internalState.getOldProps());
      this.setNeedsUpdate();
    }
  }, {
    key: "isLoaded",
    get: function get() {
      return this.internalState && !this.internalState.isAsyncPropLoading();
    }
  }, {
    key: "wrapLongitude",
    get: function get() {
      return this.props.wrapLongitude;
    }
  }]);

  return Layer;
}(Component);
Layer.layerName = 'Layer';
Layer.defaultProps = defaultProps$1;

export { lerp$2 as $, Model as A, Buffer as B, COORDINATE_SYSTEM as C, getUniformsFromViewport as D, ARRAY_TYPE as E, FEATURES as F, vec4_transformMat3 as G, transformMat3$1 as H, checkVector as I, deprecated as J, Matrix as K, Layer as L, Matrix4 as M, create$1 as N, fromValues as O, PROJECTION_MODE as P, dot as Q, cross as R, Stats as S, Transition as T, len as U, Vector as V, normalize as W, add$1 as X, scale$1 as Y, dot$1 as Z, _inherits as _, _getPrototypeOf as a, length$1 as a0, squaredLength as a1, normalize$1 as a2, EPSILON as a3, assert$5 as a4, transformQuat$1 as a5, MathArray as a6, log as a7, _asyncToGenerator as a8, regenerator as a9, Renderbuffer as aA, LIFECYCLE as aB, WebMercatorViewport$1 as aC, cssToDevicePixels as aD, readPixelsToArray as aE, EVENTS as aF, Vector3 as aa, getScaling as ab, load as ac, isWebGL2 as ad, Texture2D as ae, env$1 as af, register as ag, registerLoaders as ah, Resource as ai, log$2 as aj, instrumentGLContext as ak, isWebGL as al, resetParameters as am, resizeGLContext as an, Framebuffer as ao, lumaStats as ap, createGLContext as aq, mod as ar, WebMercatorViewport as as, memoize as at, pixelsToWorld as au, ProgramManager as av, setParameters as aw, withParameters as ax, clear as ay, cssToDeviceRatio as az, _possibleConstructorReturn as b, config as c, checkNumber as d, transformMat3 as e, transformMat2d as f, transformMat2 as g, clamp as h, isArray$1 as i, Viewport as j, _get as k, flatten as l, mod$1 as m, debug as n, assert$6 as o, equals as p, lerp as q, _objectSpread$4 as r, assert$3 as s, transformMat4 as t, uid as u, vec2_transformMat4AsVector as v, getAccessorFromBuffer as w, createIterable as x, defaultTypedArrayManager as y, hasFeatures as z };
