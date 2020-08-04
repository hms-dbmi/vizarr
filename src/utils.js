import { openArray, HTTPStore } from 'zarr';
import { ZarrLoader, DTYPE_VALUES } from '@hms-dbmi/viv';

async function getJson(store, key) {
  const bytes = new Uint8Array(await store.getItem(key));
  const decoder = new TextDecoder('utf-8');
  const json = JSON.parse(decoder.decode(bytes));
  return json;
}

export class OMEZarrReader {
  constructor(zarrStore, rootAttrs) {
    this.zarrStore = zarrStore;
    this.rootAttrs = rootAttrs;
    if (!('omero' in rootAttrs)) {
      throw Error('Remote zarr is not ome-zarr format.');
    }
    this.imageData = rootAttrs.omero;
  }

  static async fromStore(store) {
    const rootAttrs = await getJson(store, '.zattrs');
    return new OMEZarrReader(store, rootAttrs);
  }

  async loadOMEZarr() {
    let resolutions = ['0']; // TODO: could be first alphanumeric dataset on err
    if ('multiscales' in this.rootAttrs) {
      const { datasets } = this.rootAttrs.multiscales[0];
      resolutions = datasets.map((d) => d.path);
    }
    const promises = resolutions.map((r) => openArray({ store: this.zarrStore, path: r }));
    const pyramid = await Promise.all(promises);
    const dimensions = ['t', 'c', 'z', 'y', 'x'].map((field) => ({
      field,
    }));

    // TODO: There should be a much better way to do this.
    // If base image is small, we don't need to fetch data for the
    // top levels of the pyramid. For large images, the tile sizes (chunks)
    // will be the same size for x/y. We check the chunksize here for this edge case.

    const { chunks } = pyramid[0];
    const shouldUseBase = chunks[4] !== chunks[3];

    const data = pyramid.length === 1 || shouldUseBase ? pyramid[0] : pyramid;
    return {
      loader: new ZarrLoader({ data, dimensions }),
      metadata: this.imageData,
    };
  }
}

export function normalizeStore(store) {
  if (typeof store === 'string') {
    return new HTTPStore(store);
  }
  return store;
}

export async function createZarrLoader(store, dimensions) {
  // If group, check if OME-Zarr
  if (await store.containsItem('.zgroup')) {
    const reader = await OMEZarrReader.fromStore(store);
    const { loader, metadata } = await reader.loadOMEZarr();
    // Contains rendering information if none provided
    return loader;
  }

  // Get the dimensions from the store and open the array
  const data = await openArray({ store });
  // Hack right now, provide dimensions manually for array
  const formatted_dims = dimensions.split('').map((field) => ({ field }));
  const loader = new ZarrLoader({ data, dimensions: formatted_dims });
  // No metadata for non OME-Zarr
  return loader;
}

export function layersToVivProps(layers) {
  const sliderValues = [];
  const colorValues = [];
  const channelIsOn = [];
  const loaderSelection = [];
  const contrastLimits = [];
  const labels = [];

  layers.forEach((l, i) => {
    sliderValues.push(l.contrast_limits);
    contrastLimits.push(l.contrast_limits);
    colorValues.push(hexToRGB(l.color || '#FFFFFF'));
    channelIsOn.push(l.on || true);
    labels.push(l.label || `channel_${i}`);
    loaderSelection.push(l.selection);
  });

  return {
    sliderValues,
    colorValues,
    channelIsOn,
    loaderSelection,
    contrastLimits,
    labels,
  };
}

export function OMEMetaToVivProps(imageData) {
  const layers = [];
  const { rdefs } = imageData;
  for (const [i, c] of imageData.channels.entries()) {
    if (c.active) {
      const selection = { c: i };
      if (rdefs.defaultT) selection.t = rdefs.defaultT;
      if (rdefs.defaultZ) selection.z = rdefs.defaultZ;
      const layer = {
        color: c.color,
        contrast_limits: [c.window.start, c.window.end],
        selection,
        label: c.label,
      };
      layers.push(layer);
    }
  }
  return layersToVivProps(layers);
}

function hexToRGB(hex) {
  if (hex.startsWith('#')) hex = hex.slice(1);
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  return [r, g, b];
}

export async function isOMEZarr(store) {
  if (await store.containsItem('.zattrs')) {
    const metadata = await getJson(store, '.zattrs');
    if ('omero' in metadata) {
      return true;
    }
  }
  return false;
}

export function range(len) {
  return [...Array(len).keys()];
}

export async function createSourceData({
  source,
  name,
  dimensions,
  channelDim = 'c',
  layers = [],
  colormap = '',
  opacity = 1,
}) {
  let imageData;

  const store = normalizeStore(source);

  if (await isOMEZarr(store)) {
    const reader = await OMEZarrReader.fromStore(store);
    if (!name && 'name' in reader.imageData) {
      name = reader.imageData.name;
    }
    imageData = reader.imageData;
  } else {
    if (!dimensions) {
      throw Error('Must supply dimensions if not OME-Zarr');
    }

    const channelAxis = dimensions.indexOf(channelDim);
    if (channelAxis < 0) {
      throw Error(`Channel dimension ${channelDim} not found in dimensions ${dimensions}`);
    }

    if (await store.containsItem('.zgroup')) {
      // Should support multiscale group but for now throw and only handle arrays.
      throw Error('Source must be a zarr.Array if not OME-Zarr; found zarr.Group.');
    }

    const z = await openArray({ store });

    // Internal to how viv (doesn't) handle endianness;
    // https://github.com/hubmapconsortium/vitessce-image-viewer/issues/203
    const dtype = `<${z.dtype.slice(1)}`;
    if (!(dtype in DTYPE_VALUES)) {
      throw Error('Dtype not supported, must be u1, u2, u4, or f4');
    }

    const channels = range(z.shape[channelAxis]).map((i) => {
      return {
        active: true,
        color: 'FFFFFF',
        label: `channel_${i}`,
        window: {
          start: 0,
          end: dtype === '<f4' ? 1 : DTYPE_VALUES[dtype].max,
        },
      };
    });

    imageData = {
      channels,
      rdefs: {
        model: 'color',
      },
    };
  }

  return {
    store,
    name,
    imageData,
    dimensions,
    renderSettings: {
      layers,
      colormap,
      opacity,
    },
  };
}
