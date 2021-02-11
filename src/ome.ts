import { openArray, HTTPStore, ZarrArray, Group as ZarrGroup } from 'zarr';
import pMap from 'p-map';

import type { SourceData, ImageLayerConfig, Acquisition } from './state';

import { rstrip, join, loadMultiscales } from './utils';
import { ZarrPixelSource } from '@hms-dbmi/viv';


type OmeSourceData = SourceData<['t', 'c', 'z']>;

// Create loader for every Well. Some loaders may be undefined if Wells are missing.
async function createLoaderFromPath(store: HTTPStore, path: string | undefined): Promise<ZarrArray | undefined> {
  if (path === undefined) {
    // Don't even try to load if we know that Well is missing
    return;
  }
  try {
    return await openArray({ store, path });
  } catch (err) {
    console.log(`Failed to create loader: ${path}`);
  }
}

export async function loadWell(
  config: ImageLayerConfig,
  grp: ZarrGroup,
  wellAttrs: Ome.Well
): Promise<OmeSourceData> {
  // Can filter Well fields by URL query ?acquisition=ID
  const acquisitionId: number | undefined = config.acquisition ? parseInt(config.acquisition) : undefined;
  let acquisitions: Acquisition[] = [];

  if (!wellAttrs?.images) {
    throw Error(`Well .zattrs missing images`);
  }

  if (!(grp.store instanceof HTTPStore)) {
    throw Error('Store must be an HTTPStore to open well.');
  }

  const [row, col] = grp.store.url.split('/').filter(Boolean).slice(-2);

  const { images } = wellAttrs;

  // Do we have more than 1 Acquisition?
  const acqIds = images.flatMap((img) => (img.acquisition ? [img.acquisition] : []));
  if (acqIds.length > 1) {
    // Need to get acquisitions metadata from parent Plate
    const plateUrl = grp.store.url.replace(`/${row}/${col}`, '');
    const plateStore = new HTTPStore(plateUrl);
    const plateAttrs = await getJson(plateStore, `.zattrs`);
    acquisitions = plateAttrs?.plate?.acquisitions;

    // filter imagePaths by acquisition
    if (acquisitionId && acqIds.includes(acquisitionId)) {
      images = images.filter((img) => img.acquisition === acquisitionId);
    }
  }

  let imagePaths = images.map((img) => rstrip(img.path, '/'));

  // Use first image for rendering settings, resolutions etc.
  let imageAttrs = await getJson(store, `${imagePaths[0]}/.zattrs`);
  // Lowest resolution is the 'path' of the first 'dataset' from the first multiscales
  let resolution = imageAttrs.multiscales[0].datasets[0].path;

  // Create loader for every Image.
  const promises = imagePaths.map((p) => createLoaderFromPath(store, join(p, resolution)));
  let loaders = await Promise.all(promises);
  const loader = loaders.find(Boolean);

  // Load Image to use for channel names, rendering settings, sizeZ, sizeT etc.
  const sourceData: SourceData = loadOME(config, imageAttrs.omero, loader as ZarrLoader);
  const cols = Math.ceil(Math.sqrt(imagePaths.length));

  if (acquisitions.length > 0) {
    // To show acquisition chooser in UI
    sourceData.acquisitions = acquisitions;
    sourceData.acquisitionId = acquisitionId || -1;
  }

  sourceData.loaders = loaders;
  sourceData.name = `Well ${row}${col}`;
  sourceData.rows = Math.ceil(imagePaths.length / cols);
  sourceData.columns = cols;
  sourceData.onClick = (info: any) => {
    let gridCoord = info.gridCoord;
    if (!gridCoord) {
      return;
    }
    const { row, column } = gridCoord;
    const { source } = sourceData;
    let imgSource = undefined;
    if (typeof source === 'string' && !isNaN(row) && !isNaN(column)) {
      const field = row * cols + column;
      imgSource = join(source, imagePaths[field]);
    }
    if (config.onClick) {
      delete info.layer;
      info.imageSource = imgSource;
      config.onClick(info);
    } else if (imgSource) {
      window.open(window.location.origin + window.location.pathname + '?source=' + imgSource);
    }
  };

  return sourceData;
}

export async function loadOMEPlate(
  config: ImageLayerConfig,
  grp: ZarrGroup,
  plateAttrs: Ome.Plate
): Promise<OmeSourceData> {
  if (!('columns' in plateAttrs) || !('rows' in plateAttrs)) {
    throw Error(`Plate .zattrs missing columns or rows`);
  }

  let rows: number = plateAttrs.rows.length;
  let columns: number = plateAttrs.columns.length;
  let rowNames: string[] = plateAttrs.rows.map((row) => row.name);
  let columnNames: string[] = plateAttrs.columns.map((col) => col.name);
  let wellPaths = plateAttrs.wells.map((well) => rstrip(well.path, '/'));

  // Fields are by index and we assume at least 1 per Well
  let field = '0';

  // TEMP: try to support plates with plate/acquisition/row/column hierarchy
  // Where plate.acquisitions = [{'path': '0'}]
  let acquisitionPath = plateAttrs?.acquisitions?.[0]?.path || '';

  // imagePaths covers whole plate (not sparse) - but some will be '' if no Well
  const imagePaths = rowNames.flatMap((row) => {
    return columnNames.map((col) => {
      const wellPath = join(acquisitionPath, row, col);
      return wellPaths.includes(wellPath) ? join(wellPath, field) : '';
    });
  });

  // Find first valid Image, loading each Well in turn...
  let imageAttrs = undefined;
  async function getImageAttrs(path: string): Promise<any> {
    if (path === '') return;
    try {
      return await getJson(store, join(path, '.zattrs'));
    } catch (err) {}
  }
  for (let i = 0; i < imagePaths.length; i++) {
    imageAttrs = await getImageAttrs(imagePaths[i]);
    if (imageAttrs) {
      break;
    }
  }

  // Lowest resolution is the 'path' of the last 'dataset' from the first multiscales
  let resolution = imageAttrs.multiscales[0].datasets.slice(-1)[0].path;

  // Create loader for every Well. Some loaders may be undefined if Wells are missing.
  const mapper = (path: string) => createLoaderFromPath(store, path ? join(path, resolution) : undefined);
  const promises = await pMap(imagePaths, mapper, { concurrency: 10 });
  let loaders = await Promise.all(promises);

  const loader = loaders.find(Boolean);

  // Load Image to use for channel names, rendering settings, sizeZ, sizeT etc.
  const sourceData: OmeSourceData = loadOmero(config, imageAttrs.omero, loader as ZarrLoader);

  sourceData.loaders = loaders;
  sourceData.name = plateAttrs.name || 'Plate';
  sourceData.rows = rows;
  sourceData.columns = columns;
  // Us onClick from image config or Open Well in new window
  sourceData.onClick = (info: any) => {
    let gridCoord = info.gridCoord;
    if (!gridCoord) {
      return;
    }
    const { row, column } = gridCoord;
    let { source } = sourceData;
    let imgSource = undefined;
    if (typeof source === 'string' && !isNaN(row) && !isNaN(column)) {
      imgSource = join(source, acquisitionPath, rowNames[row], columnNames[column]);
    }
    if (config.onClick) {
      delete info.layer;
      info.imageSource = imgSource;
      config.onClick(info);
    } else if (imgSource) {
      window.open(window.location.origin + window.location.pathname + '?source=' + imgSource);
    }
  };
  return sourceData;
}

export async function loadOmero(
  config: ImageLayerConfig,
  grp: ZarrGroup,
  attrs: { multiscales: Ome.Multiscale[]; omero: Ome.Omero }
): Promise<OmeSourceData> {
  const { name, opacity = 1, colormap = '', translate, source } = config;
  const { rdefs, channels } = attrs.omero;
  const t = rdefs.defaultT ?? 0;
  const z = rdefs.defaultZ ?? 0;

  const colors: string[] = [];
  const contrast_limits: number[][] = [];
  const visibilities: boolean[] = [];
  const names: string[] = [];

  channels.forEach((c) => {
    colors.push(c.color);
    contrast_limits.push([c.window.start, c.window.end]);
    visibilities.push(c.active);
    names.push(c.label);
  });

  const axis_labels = ['t', 'c', 'z', 'y', 'x'] as const;
  const data = await loadMultiscales(grp, attrs.multiscales)
  const loader = data.map(arr => new ZarrPixelSource(arr, axis_labels));

  return {
    loader,
    source,
    name: attrs.omero.name ?? name,
    channel_axis: 1,
    colors,
    names,
    contrast_limits,
    visibilities,
    defaults: {
      selection: [t, 0, z, 0, 0],
      colormap,
      opacity,
    },
    axis_labels: ['t', 'c', 'z', 'y', 'x'],
    translate: translate ?? [0, 0],
  };
}
