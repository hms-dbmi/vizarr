// @ts-check
/// <reference lib="esnext" />

/**
 * @param {string} template
 * @param {RegExp=} re
 */
function parse(template, re = /{{(.*?)}}/) {
  let result = re.exec(template);
  const parts = [];
  let pos;

  while (result) {
    pos = result.index;
    if (pos !== 0) {
      parts.push({ match: false, str: template.substring(0, pos) });
      template = template.slice(pos);
    }
    parts.push({ match: true, str: result[0] });
    template = template.slice(result[0].length);
    result = re.exec(template);
  }

  if (template) {
    parts.push({ match: false, str: template });
  }

  return parts;
}

/** @param {string} str */
function matchFn(str) {
  const match = str.match(/(?<fname>[A-Z_][A-Z_1-9]*)\((?<args>[^)]+)\)/i);
  if (!match?.groups) return;

  const { fname, args } = match.groups;
  const ctx = Object.fromEntries(args.split(',').map(kwarg => {
    const { key, num, str } = kwarg.match(/(?<key>[a-z_0-9]*)\s*=\s*((?<num>[0-9.]+)|('|")(?<str>.*)('|"))/i)?.groups ?? {};
    if (!key || !(num || str)) {
      throw Error(`Failed to match fn kwarg: ${kwarg}`);
    }
    return [key, num ? Number(num) : str];
  }));

  return { fname, ctx };
}

const alphabet = "abcdefghijklmnopqrstuvwxyz";
const numbers = "01234569789";
const expr = "()*/+-";
const space = " ";
const valid = new Set(alphabet + alphabet.toUpperCase() + numbers + expr + space);
/** @param {string} str */
function matchMathEval(str) {
  for (let i = 0; i < str.length; i++) {
    if (!valid.has(str.charAt(i))) return;
  }
  return parse(str, /[A-Za-z_][A-Za-z0-9_]*/ig);
}

/** @type {import('../types').RenderFn} */
function render(template, context) {
  const grps = parse(template);
  return grps.map(grp => {
    if (!grp.match) {
      return grp.str;
    }

    let inner = grp.str.split(/{{|}}/).filter(Boolean)[0].trim();
    if (inner in context) {
      return context[inner];
    }

    const fnMatch = matchFn(inner);
    if (fnMatch) {
      const { fname, ctx } = fnMatch;
      const fn = context[fname];
      if (typeof fn === 'function') {
        return fn(ctx);
      }
      throw Error(`Cannot find function named ${fname} in rendering context.`);
    }

    const matches = matchMathEval(inner);
    if (matches) {
      const exprParts = matches.map(match => {
        if (!match.match) return match.str;
        const value = context[match.str];
        if (value == null) {
          throw Error(`Cannot find number named ${match.str} in rendering context.`);
        }
        if (typeof value !== 'number') {
          throw Error(`The provided value for ${match.str} must be a number.`);
        }
        return value;
      });
      return Function('"use strict";return (' + exprParts.join('') + ')')();
    }

    throw new Error(`Unable to match ${grp.str}`);
  }).join('');
}

// @ts-check


/**
 * @param {import('../types').ReferencesV0 | import('../types').ReferencesV1} spec
 * @param {import('../types').RenderFn=} renderString
 */
function parse$1(spec, renderString = render) {
  // @ts-ignore
  return "version" in spec ? parseV1(spec, renderString) : parseV0(spec);
}

/**
 * @param {import('../types').ReferencesV0} spec
 * @returns {Map<string, import('../types').Ref>}
 */
function parseV0(spec) {
  return new Map(Object.entries(spec));
}

/**
 * @param {import('../types').ReferencesV1} spec
 * @param {import('../types').RenderFn} renderString
 * @returns {Map<string, import('../types').Ref>}
 */
function parseV1(spec, renderString) {
  /** @type {import('../types').RenderContext} */
  const context = {};
  for (const [key, template] of Object.entries(spec.templates)) {
    // TODO: better check for whether a template or not
    if (template.includes("{{")) {
      // Need to register filter in environment
      context[key] = (ctx) => renderString(template, ctx);
    } else {
      context[key] = template;
    }
  }

  /** @type {(t: string, o?: Record<string, string | number>) => string} */
  const render = (t, o) => {
    return renderString(t, { ...context, ...o });
  };

  /** @type {Map<string, import('../types').Ref>} */
  const refs = new Map();

  for (const [key, ref] of Object.entries(spec.refs)) {
    if (typeof ref === "string") {
      refs.set(key, ref);
    } else {
      const url = ref[0]?.includes("{{") ? render(ref[0]) : ref[0];
      refs.set(key, ref.length === 1 ? [url] : [url, ref[1], ref[2]]);
    }
  }

  for (const g of spec.gen) {
    for (const dims of iterDims(g.dimensions)) {
      const key = render(g.key, dims);
      const url = render(g.url, dims);
      const offset = render(g.offset, dims);
      const length = render(g.length, dims);
      refs.set(key, [url, parseInt(offset), parseInt(length)]);
    }
  }

  return refs;
}

/**
 * @param {Record<string, import('../types').Range | number[]>} dimensions
 * @returns {Generator<Record<string, number>>}
 */
function* iterDims(dimensions) {
  const keys = Object.keys(dimensions);
  const iterables = Object.values(dimensions).map((i) => (Array.isArray(i) ? i : [...range(i)]));
  for (const values of product(...iterables)) {
    yield Object.fromEntries(keys.map((key, i) => [key, values[i]]));
  }
}

/** @param {...any[]} iterables */
function* product(...iterables) {
  if (iterables.length === 0) {
    return;
  }
  // make a list of iterators from the iterables
  const iterators = iterables.map((it) => it[Symbol.iterator]());
  const results = iterators.map((it) => it.next());
  if (results.some((r) => r.done)) {
    throw new Error("Input contains an empty iterator.");
  }
  for (let i = 0; ;) {
    if (results[i].done) {
      // reset the current iterator
      iterators[i] = iterables[i][Symbol.iterator]();
      results[i] = iterators[i].next();
      // advance, and exit if we've reached the end
      if (++i >= iterators.length) {
        return;
      }
    } else {
      yield results.map(({ value }) => value);
      i = 0;
    }
    results[i] = iterators[i].next();
  }
}

/** @param {import('../types').Range} rng */
function* range({ stop, start = 0, step = 1 }) {
  for (let i = start; i < stop; i += step) {
    yield i;
  }
}

// @ts-check

class KeyError extends Error {
  __zarr__ = "KeyError";
  /** @param {string} msg */
  constructor(msg) {
    super(msg);
    this.name = "KeyError";
  }
}

class ReferenceStore {

  /** 
   * @param {Map<string, import('../types').Ref>} references
   * @param {{ target?: string }=} opts
   */
  constructor(references, opts = {}) {
    this.ref = references;
    this.target = opts.target;
  }

  /**
   * @param {string | import('../types').ReferencesV0 | import('../types').ReferencesV1} data
   * @param {{
   *   target?: string;
   *   renderString?: import('../types').RenderFn;
   * }=} opts
   */
  static fromJSON(data, opts = {}) {
    const spec = typeof data === 'string' ? JSON.parse(data) : data;
    const ref = parse$1(spec, opts.renderString);
    return new ReferenceStore(ref, opts);
  }

  /** @param {string} url */
  _url(url) {
    const [protocol, _path] = url.split('://');
    if (protocol === 'https' || protocol === 'http') {
      return url;
    }
    throw Error('Protocol not supported, got: ' + JSON.stringify(protocol));
  }

  /**
   * @param {{ url: string, offset?: number, size?: number }} props
   * @param {RequestInit} opts
   */
  _fetch({ url, offset, size }, opts) {
    if (offset !== undefined && size !== undefined) {
      // add range headers to request options
      opts = { ...opts, headers: { ...opts.headers, Range: `bytes=${offset}-${offset + size - 1}` } };
    }
    return fetch(this._url(url), opts);
  }

  /**
   * @param {string} key 
   * @param {RequestInit} opts 
   */
  async getItem(key, opts = {}) {
    const entry = this.ref.get(key);

    if (!entry) {
      throw new KeyError(key);
    }

    if (typeof entry === 'string') {
      if (entry.startsWith('base64:')) {
        return __toBinary(entry.slice(7)).buffer;
      }
      return __encoder.encode(entry).buffer;
    }

    const [urlOrNull, offset, size] = entry;
    const url = urlOrNull ?? this.target;
    if (!url) {
      throw Error(`No url for key ${key}, and no target url provided.`);
    }
    const res = await this._fetch({ url, offset, size }, opts);

    if (res.status === 200 || res.status === 206) {
      return res.arrayBuffer();
    }

    throw new Error(`Request unsuccessful for key ${key}. Response status: ${res.status}.`);
  }

  /** @param {string} key */
  async containsItem(key) {
    return this.ref.has(key);
  }

  async keys() {
    return [...this.ref.keys()];
  }

  /**
   * @param {string} key 
   * @param {ArrayBuffer} value 
   * @returns {never}
   */
  setItem(key, value) {
    throw Error('FileReferenceStore.setItem is not implemented.');
  }

  /**
   * @param {string} key 
   * @returns {never}
   */
  deleteItem(key) {
    throw Error('FileReferenceStore.deleteItem is not implemented.');
  }
}

/**
 * This is for the "binary" loader (custom code is ~2x faster than "atob") from esbuild.
 * https://github.com/evanw/esbuild/blob/150a01844d47127c007c2b1973158d69c560ca21/internal/runtime/runtime.go#L185
 * @type {(str: string) => Uint8Array}
 */
const __toBinary = (() => {
  var table = new Uint8Array(128);
  for (var i = 0; i < 64; i++) table[i < 26 ? i + 65 : i < 52 ? i + 71 : i < 62 ? i - 4 : i * 4 - 205] = i;
  // @ts-ignore
  return base64 => {
    // @ts-ignore
    var n = base64.length, bytes = new Uint8Array((n - (base64[n - 1] == '=') - (base64[n - 2] == '=')) * 3 / 4 | 0);
    for (var i = 0, j = 0; i < n;) {
      var c0 = table[base64.charCodeAt(i++)], c1 = table[base64.charCodeAt(i++)];
      var c2 = table[base64.charCodeAt(i++)], c3 = table[base64.charCodeAt(i++)];
      bytes[j++] = (c0 << 2) | (c1 >> 4);
      bytes[j++] = (c1 << 4) | (c2 >> 2);
      bytes[j++] = (c2 << 6) | c3;
    }
    return bytes
  }
})();

const __encoder = new TextEncoder();

export { ReferenceStore, parse$1 as parse };
