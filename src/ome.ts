import { ZarrPixelSource } from '@hms-dbmi/viv';
import pMap from 'p-map';
import { Group as ZarrGroup, HTTPStore, openGroup, ZarrArray } from 'zarr';
import type { ImageLayerConfig, SourceData } from './state';
import { join, loadMultiscales, trimPyramid } from './utils';

export async function loadWell(config: ImageLayerConfig, grp: ZarrGroup, wellAttrs: Ome.Well): Promise<SourceData> {
  // Can filter Well fields by URL query ?acquisition=ID
  const acquisitionId: number | undefined = config.acquisition ? parseInt(config.acquisition) : undefined;
  let acquisitions: Ome.Acquisition[] = [];

  if (!wellAttrs?.images) {
    throw Error(`Well .zattrs missing images`);
  }

  if (!(grp.store instanceof HTTPStore)) {
    throw Error('Store must be an HTTPStore to open well.');
  }

  const [row, col] = grp.path.split('/').filter(Boolean).slice(-2);

  let { images } = wellAttrs;

  // Do we have more than 1 Acquisition?
  const acqIds = images.flatMap((img) => (img.acquisition ? [img.acquisition] : []));

  if (acqIds.length > 1) {
    // Need to get acquisitions metadata from parent Plate
    const platePath = grp.path.replace(`${row}/${col}`, '');
    const plate = await openGroup(grp.store, platePath);
    const plateAttrs = (await plate.attrs.asObject()) as { plate: Ome.Plate };
    acquisitions = plateAttrs?.plate?.acquisitions ?? [];

    // filter imagePaths by acquisition
    if (acquisitionId && acqIds.includes(acquisitionId)) {
      images = images.filter((img) => img.acquisition === acquisitionId);
    }
  }

  const imgPaths = images.map((img) => img.path);

  // Use first image for rendering settings, resolutions etc.
  const imgAttrs = (await grp.getItem(imgPaths[0]).then((g) => g.attrs.asObject())) as Ome.Attrs;
  if (!('omero' in imgAttrs)) {
    throw Error('Path for image is not valid.');
  }
  let resolution = imgAttrs.multiscales[0].datasets[0].path;

  // Create loader for every Image.
  const promises = imgPaths.map((p) => grp.getItem(join(p, resolution)));
  const meta = parseOmeroMeta(imgAttrs.omero);

  const loaders = (await Promise.all(promises)).map(
    (d) => new ZarrPixelSource.default(d as ZarrArray, meta.axis_labels)
  );
  const [loader] = loaders;

  const sourceData: SourceData = {
    loaders,
    ...meta,
    loader: [loader],
    defaults: {
      selection: meta.defaultSelection,
      colormap: config.colormap ?? '',
      opacity: config.opacity ?? 1,
    },
    name: `Well ${row}${col}`,
  };
  const cols = Math.ceil(Math.sqrt(imgPaths.length));
  const rows = Math.ceil(imgPaths.length / cols);

  if (acquisitions.length > 0) {
    // To show acquisition chooser in UI
    sourceData.acquisitions = acquisitions;
    sourceData.acquisitionId = acquisitionId || -1;
  }

  sourceData.columns = cols;
  sourceData.rows = rows;
  sourceData.onClick = (info: any) => {
    let gridCoord = info.gridCoord;
    if (!gridCoord) {
      return;
    }
    const { row, column } = gridCoord;
    let imgSource = undefined;
    if (grp.store instanceof HTTPStore && grp.path !== '' && !isNaN(row) && !isNaN(column)) {
      const field = row * cols + column;
      imgSource = join(grp.store.url, grp.path, imgPaths[field]);
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

export async function loadPlate(config: ImageLayerConfig, grp: ZarrGroup, plateAttrs: Ome.Plate): Promise<SourceData> {
  if (!('columns' in plateAttrs) || !('rows' in plateAttrs)) {
    throw Error(`Plate .zattrs missing columns or rows`);
  }

  let rows: number = plateAttrs.rows.length;
  let columns: number = plateAttrs.columns.length;
  let rowNames: string[] = plateAttrs.rows.map((row) => row.name);
  let columnNames: string[] = plateAttrs.columns.map((col) => col.name);

  // Fields are by index and we assume at least 1 per Well
  const imgPaths = plateAttrs.wells.map((well) => well.path);

  // Use first image as proxy for others.
  const imgAttrs = (await grp.getItem(imgPaths[0]).then((g) => g.attrs.asObject())) as Ome.Attrs;
  if (!('omero' in imgAttrs)) {
    throw Error('Path for image is not valid.');
  }

  // Lowest resolution is the 'path' of the last 'dataset' from the first multiscales
  const { datasets } = imgAttrs.multiscales[0];
  const resolution = datasets[datasets.length - 1].path;

  // Create loader for every Well. Some loaders may be undefined if Wells are missing.
  const mapper = (path: string) => grp.getItem(path) as Promise<ZarrArray>;
  const promises = await pMap(
    imgPaths.map((p) => join(p, resolution)),
    mapper,
    { concurrency: 10 }
  );
  const meta = parseOmeroMeta(imgAttrs.omero);
  const loaders = (await Promise.all(promises)).map((d) => new ZarrPixelSource.default(d, meta.axis_labels));
  const [loader] = loaders;

  // Load Image to use for channel names, rendering settings, sizeZ, sizeT etc.
  const sourceData: SourceData = {
    loaders,
    ...meta,
    loader: [loader],
    defaults: {
      selection: meta.defaultSelection,
      colormap: config.colormap ?? '',
      opacity: config.opacity ?? 1,
    },
    name: plateAttrs.name || 'Plate',
    rows,
    columns,
  };
  // Us onClick from image config or Open Well in new window
  sourceData.onClick = (info: any) => {
    let gridCoord = info.gridCoord;
    if (!gridCoord) {
      return;
    }
    const { row, column } = gridCoord;
    let imgSource = undefined;
    // TODO: use a regex for the path??
    if (grp.store instanceof HTTPStore && grp.path !== '' && !isNaN(row) && !isNaN(column)) {
      imgSource = join(grp.store.url, rowNames[row], columnNames[column]);
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

export async function loadOmeroMultiscales(
  config: ImageLayerConfig,
  grp: ZarrGroup,
  attrs: { multiscales: Ome.Multiscale[]; omero: Ome.Omero }
): Promise<SourceData> {
  const { name, opacity = 1, colormap = '' } = config;
  const data = await loadMultiscales(grp, attrs.multiscales);
  const meta = parseOmeroMeta(attrs.omero);
  const loader = data.map((arr) => new ZarrPixelSource.default(arr, meta.axis_labels));
  return {
    loader: trimPyramid(loader),
    name: meta.name ?? name,
    defaults: {
      selection: meta.defaultSelection,
      colormap,
      opacity,
    },
    ...meta,
  };
}

function parseOmeroMeta({ rdefs, channels, name }: Ome.Omero) {
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

  return {
    name,
    names,
    colors,
    contrast_limits,
    visibilities,
    channel_axis: 1,
    defaultSelection: [t, 0, z, 0, 0],
    axis_labels: ['t', 'c', 'z', 'y', 'x'],
  };
}
