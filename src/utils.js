import { openArray, HTTPStore } from 'zarr';
import { ZarrLoader, DTYPE_VALUES } from '@hms-dbmi/viv';

const colors = {
  cyan: [0, 255, 255],
  yellow: [255, 255, 0],
  magenta: [255, 0, 255],
  red: [255, 0, 0],
  green: [0, 255, 0],
  blue: [0, 0, 255],
}
const MAGENTA_GREEN = [colors.magenta, colors.green];
const RGB = [colors.red, colors.green, colors.blue];
const CYMRGB = Object.values(colors);

async function getJson(store, key) {
  const bytes = new Uint8Array(await store.getItem(key));
  const decoder = new TextDecoder('utf-8');
  const json = JSON.parse(decoder.decode(bytes));
  return json;
}

export function normalizeStore(store) {
  if (typeof store === 'string') {
    return new HTTPStore(store);
  }
  return store;
}

export function omeroToVivProps(imageData) {
  const { rdefs, channels } = imageData;
  const t = rdefs?.defaultT ? rdefs.defaultT : 0;
  const z = rdefs?.defaultZ ? rdefs.defaultZ : 0;
  const loaderSelection = range(channels.length).map((c) => {
    return [t, c, z, 0, 0];
  });
  const colorValues = [];
  const sliderValues = [];
  const channelIsOn = [];
  const labels = [];
  channels.forEach((c) => {
    colorValues.push(hexToRGB(c.color));
    sliderValues.push([c.window.start, c.window.end]);
    channelIsOn.push(c.active);
    labels.push(c.label);
  });
  return {
    channel_axis: 1,
    loaderSelection,
    colorValues,
    sliderValues,
    contrastLimits: [...sliderValues],
    channelIsOn,
    labels,
  };
}

function hexToRGB(hex) {
  if (hex.startsWith('#')) hex = hex.slice(1);
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  return [r, g, b];
}

export function range(len) {
  return [...Array(len).keys()];
}

export async function createSourceData({
  source,
  name,
  channel_axis,
  colors,
  contrast_limits,
  names,
  visibilities,
  colormap,
  opacity = 1,
}) {
  let data;
  let rootAttrs;
  let meta;
  const store = normalizeStore(source);

  if (await store.containsItem('.zgroup')) {
    try {
      let resolutions = ['0'];
      rootAttrs = await getJson(store, '.zattrs');
      if ('multiscales' in rootAttrs) {
        const { datasets } = rootAttrs.multiscales[0];
        resolutions = datasets.map((d) => d.path);
      }
      const promises = resolutions.map((path) => openArray({ store, path }));
      data = await Promise.all(promises);
    } catch (err) {
      throw Error(`Failed to open arrays in zarr.Group. Make sure group implements multiscales extension.`);
    }
  } else {
    // Try to open as zarr.Array
    data = [await openArray({ store })];
  }
  const base = data[0];
  const dtype = `<${base.dtype.slice(1)}`;
  if (!(dtype in DTYPE_VALUES)) {
    throw Error('Dtype not supported, must be u1, u2, u4, or f4');
  }
  // IF contrast_limits not provided or are missing from omero metadata
  const max = dtype === '<f4' ? 1 : DTYPE_VALUES[dtype].max;
  // Now that we have data, try to figure out how to render initially.

  if (base.shape.length === 2) {
    // 2D case
    meta = {
      loaderSelection: [[0, 0]],
      channel_axis: null,
      colorValues: [colors ? hexToRGB(colors) : [255, 255, 255]],
      sliderValues: [contrast_limits ?? [0, max]],
      contrastLimits: [contrast_limits ?? [0, max]],
      channelIsOn: [visibilities ?? true],
      labels: [names ?? 'channel_0'],
    };
  } else if (Number.isInteger(channel_axis)) {

    // If explicit channel axis is provided, other metadata is necessary.
    const n = base.shape[channel_axis];
    const diffSize = (m) => m?.length !== n;
    if ([contrast_limits, visibilities, names, colors].filter(d => d).some(diffSize)) {
      throw Error(
        `Channel axis is of length ${n} and rendering metadata ${meta} is different size.`
      );
    }
    const loaderSelection = range(n).map((i) => {
      const sel = Array(base.shape.length).fill(0);
      sel[channel_axis] = i;
      return sel;
    });

    let colorValues;
    if (colors) {
      colorValues = colors.map(hexToRGB);
    } else if (n === 2) {
      colorValues = MAGENTA_GREEN;
    } else if (n === 3) {
      colorValues = RGB;
    } else {
      colorValues = CYMRGB.slice(0, n);
    }

    meta = {
      loaderSelection,
      channel_axis,
      colorValues,
      sliderValues: contrast_limits ?? Array(n).fill([0, max]),
      contrastLimits: contrast_limits ?? Array(n).fill([0, max]),
      channelIsOn: visibilities ?? Array(n).fill(true),
      labels: names ?? range(n).map((i) => `channel_${i}`),
    };

  } else {
    // Try to load OME-Zarr
    if (!(`omero` in rootAttrs)) {
      throw Error(`Not an OME-Zarr`);
    }
    const imageData = rootAttrs.omero;
    if (!name && 'name' in imageData) {
      name = imageData.name;
    }
    meta = omeroToVivProps(imageData);
  }

  // TODO: There should be a much better way to do this.
  // If base image is small, we don't need to fetch data for the
  // top levels of the pyramid. For large images, the tile sizes (chunks)
  // will be the same size for x/y. We check the chunksize here for this edge case.
  const { chunks, shape } = base;
  const [tileHeight, tileWidth] = chunks.slice(-2);
  // TODO: Need function to trim pyramidal levels that aren't chunked w/ even tile sizes.
  // Lowest resolution doesn't need to have square chunks, but all others do.
  data = data.length === 1 || tileHeight !== tileWidth ? base : data;
  // need to make dimensions to use ZarrLoader, but not necessary
  const dimensions = [...range(shape.length - 2), 'y', 'x'].map((field) => ({ field }));
  const loader = new ZarrLoader({ data, dimensions });
  loader.dtype = dtype;
  return {
    loader,
    name,
    colormap,
    opacity,
    ...meta,
  };
}
