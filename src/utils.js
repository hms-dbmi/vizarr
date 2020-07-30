import { openArray, HTTPStore } from 'zarr';
import { ZarrLoader } from '@hms-dbmi/viv';

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
      resolutions = datasets.map(d => d.path);
    }
    const promises = resolutions.map(r =>
      openArray({ store: this.zarrStore, path: r })
    );
    const pyramid = await Promise.all(promises);
    const dimensions = ['t', 'c', 'z', 'y', 'x'].map(field => ({ field }));

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

export async function createZarrLoader(store, dimensions) {
  if (typeof store === 'string') {
    store = new HTTPStore(store);
  }

  // If group, check if OME-Zarr
  if (await store.containsItem('.zgroup')) {
    const reader = await OMEZarrReader.fromStore(store);
    const { loader, metadata } = await reader.loadOMEZarr();
    // Contains rendering information if none provided
    return { loader, metadata };
  }

  // Get the dimensions from the store and open the array 
  const data = await openArray({ store });
  // Hack right now, provide dimensions manually for array
  const formatted_dims = dimensions.split('').map(field => ({ field }));
  const loader = new ZarrLoader({ data, dimensions: formatted_dims });
  // No metadata for non OME-Zarr
  return { loader };
}

export function channelsToVivProps(channels) {
  const sliderValues = [];
  const colorValues = []; 
  const channelIsOn = [];
  const loaderSelection = [];
  for (let { color = [255, 255, 255], slider, selection, on = true } of channels) {
    sliderValues.push(slider);
    colorValues.push(color);
    channelIsOn.push(on);
    loaderSelection.push(selection);
  }
  return { sliderValues, colorValues, channelIsOn, loaderSelection };
}

export function OMEMetaToVivProps(omeMeta) {
  const channels = [];
  for (const [i, c] of omeMeta.channels.entries()) {
    if (c.active) {
      const channel = {
        color: hexToRGB(c.color),
        slider: [c.window.start, c.window.end],
        selection: {
          c: i,
          t: omeMeta.rdefs?.defaultT || 0,
          z: omeMeta.rdefs?.defaultZ || 0,
        }
      }
      channels.push(channel);
    }
  }
  return channelsToVivProps(channels);
}

function hexToRGB(hex) {
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  return [r, g, b];
}