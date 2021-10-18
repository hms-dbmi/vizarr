import { ZarrPixelSource } from '@hms-dbmi/viv';
import pMap from 'p-map';
import { Group as ZarrGroup, openGroup, ZarrArray } from 'zarr';
import type { ImageLayerConfig, SourceData } from './state';
import {
  calcConstrastLimits,
  getAttrsOnly,
  getDefaultColors,
  getDefaultVisibilities,
  getNgffAxes,
  getNgffAxisLabels,
  guessTileSize,
  join,
  loadMultiscales,
  parseMatrix,
  range,
} from './utils';

export async function loadWell(config: ImageLayerConfig, grp: ZarrGroup, wellAttrs: Ome.Well): Promise<SourceData> {
  // Can filter Well fields by URL query ?acquisition=ID
  const acquisitionId: number | undefined = config.acquisition ? parseInt(config.acquisition) : undefined;
  let acquisitions: Ome.Acquisition[] = [];

  if (!wellAttrs?.images) {
    throw Error(`Well .zattrs missing images`);
  }

  if (!grp.path) {
    throw Error('Cannot inspect zarr path to open well.');
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
  const cols = Math.ceil(Math.sqrt(imgPaths.length));
  const rows = Math.ceil(imgPaths.length / cols);

  // Use first image for rendering settings, resolutions etc.
  const imgAttrs = (await grp.getItem(imgPaths[0]).then((g) => g.attrs.asObject())) as Ome.Attrs;
  if (!('multiscales' in imgAttrs)) {
    throw Error('Path for image is not valid.');
  }
  let resolution = imgAttrs.multiscales[0].datasets[0].path;

  // Create loader for every Image.
  const promises = imgPaths.map((p) => grp.getItem(join(p, resolution)));
  const data = (await Promise.all(promises)) as ZarrArray[];
  const axes = getNgffAxes(imgAttrs.multiscales);
  const axis_labels = getNgffAxisLabels(axes);

  const tileSize = guessTileSize(data[0]);
  const loaders = range(rows).flatMap((row) => {
    return range(cols).map((col) => {
      const offset = col + row * cols;
      return { name: String(offset), row, col, loader: new ZarrPixelSource(data[offset], axis_labels, tileSize) };
    });
  });

  let meta;
  if ('omero' in imgAttrs) {
    meta = parseOmeroMeta(imgAttrs.omero, axes);
  } else {
    meta = await defaultMeta(loaders[0].loader, axis_labels);
  }

  const sourceData: SourceData = {
    loaders,
    ...meta,
    axis_labels,
    loader: [loaders[0].loader],
    model_matrix: parseMatrix(config.model_matrix),
    defaults: {
      selection: meta.defaultSelection,
      colormap: config.colormap ?? '',
      opacity: config.opacity ?? 1,
    },
    name: `Well ${row}${col}`,
  };

  if (acquisitions.length > 0) {
    // To show acquisition chooser in UI
    sourceData.acquisitions = acquisitions;
    sourceData.acquisitionId = acquisitionId || -1;
  }

  sourceData.rows = rows;
  sourceData.columns = cols;
  sourceData.onClick = (info: any) => {
    let gridCoord = info.gridCoord;
    if (!gridCoord) {
      return;
    }
    const { row, column } = gridCoord;
    let imgSource = undefined;
    if (typeof config.source === 'string' && grp.path && !isNaN(row) && !isNaN(column)) {
      const field = row * cols + column;
      imgSource = join(config.source, imgPaths[field]);
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

  const rows = plateAttrs.rows.map((row) => row.name);
  const columns = plateAttrs.columns.map((row) => row.name);

  // Fields are by index and we assume at least 1 per Well
  const wellPaths = plateAttrs.wells.map((well) => well.path);

  // Use first image as proxy for others.
  const wellAttrs = await getAttrsOnly<{ well: Ome.Well }>(grp, wellPaths[0]);
  if (!('well' in wellAttrs)) {
    throw Error('Path for image is not valid, not a well.');
  }

  const imgPath = wellAttrs.well.images[0].path;
  const imgAttrs = (await grp.getItem(join(wellPaths[0], imgPath)).then((g) => g.attrs.asObject())) as Ome.Attrs;
  if (!('multiscales' in imgAttrs)) {
    throw Error('Path for image is not valid.');
  }
  // Lowest resolution is the 'path' of the last 'dataset' from the first multiscales
  const { datasets } = imgAttrs.multiscales[0];
  const resolution = datasets[datasets.length - 1].path;

  async function getImgPath(wellPath: string) {
    const wellAttrs = await getAttrsOnly<{ well: Ome.Well }>(grp, wellPath);
    return join(wellPath, wellAttrs.well.images[0].path);
  }
  const wellImagePaths = await Promise.all(wellPaths.map(getImgPath));

  // Create loader for every Well. Some loaders may be undefined if Wells are missing.
  const mapper = ([key, path]: string[]) => grp.getItem(path).then((arr) => [key, arr]) as Promise<[string, ZarrArray]>;
  const promises = await pMap(
    wellImagePaths.map((p) => [p, join(p, resolution)]),
    mapper,
    { concurrency: 10 }
  );
  const data = await Promise.all(promises);
  const axes = getNgffAxes(imgAttrs.multiscales);
  const axis_labels = getNgffAxisLabels(axes);
  const tileSize = guessTileSize(data[0][1]);
  const loaders = data.map((d) => {
    const [row, col] = d[0].split('/');
    return {
      name: `${row}${col}`,
      row: rows.indexOf(row),
      col: columns.indexOf(col),
      loader: new ZarrPixelSource(d[1], axis_labels, tileSize),
    };
  });
  let meta;
  if ('omero' in imgAttrs) {
    meta = parseOmeroMeta(imgAttrs.omero, axes);
  } else {
    meta = await defaultMeta(loaders[0].loader, axis_labels);
  }

  // Load Image to use for channel names, rendering settings, sizeZ, sizeT etc.
  const sourceData: SourceData = {
    loaders,
    ...meta,
    axis_labels,
    loader: [loaders[0].loader],
    model_matrix: parseMatrix(config.model_matrix),
    defaults: {
      selection: meta.defaultSelection,
      colormap: config.colormap ?? '',
      opacity: config.opacity ?? 1,
    },
    name: plateAttrs.name || 'Plate',
    rows: rows.length,
    columns: columns.length,
  };
  // Us onClick from image config or Open Well in new window
  sourceData.onClick = (info: any) => {
    let gridCoord = info.gridCoord;
    if (!gridCoord) {
      return;
    }
    const { row, column } = gridCoord;
    let imgSource = undefined;
    if (typeof config.source === 'string' && grp.path && !isNaN(row) && !isNaN(column)) {
      imgSource = join(config.source, rows[row], columns[column]);
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
  const axes = getNgffAxes(attrs.multiscales);
  const axis_labels = getNgffAxisLabels(axes);
  const meta = parseOmeroMeta(attrs.omero, axes);
  const tileSize = guessTileSize(data[0]);

  const loader = data.map((arr) => new ZarrPixelSource(arr, axis_labels, tileSize));
  return {
    loader: loader,
    axis_labels,
    model_matrix: parseMatrix(config.model_matrix),
    defaults: {
      selection: meta.defaultSelection,
      colormap,
      opacity,
    },
    ...meta,
    name: meta.name ?? name,
  };
}

async function defaultMeta(loader: ZarrPixelSource<string[]>, axis_labels: string[]) {
  const channel_axis = axis_labels.indexOf('c');
  const channel_count = loader.shape[channel_axis];
  const visibilities = getDefaultVisibilities(channel_count);
  const contrast_limits = await calcConstrastLimits(loader, channel_axis, visibilities);
  const colors = getDefaultColors(channel_count, visibilities);
  return {
    name: 'Image',
    names: range(channel_count).map((i) => `channel_${i}`),
    colors,
    contrast_limits,
    visibilities,
    channel_axis: axis_labels.includes('c') ? axis_labels.indexOf('c') : null,
    defaultSelection: axis_labels.map(() => 0),
  };
}

function parseOmeroMeta({ rdefs, channels, name }: Ome.Omero, axes: Ome.Axis[]) {
  const t = rdefs.defaultT ?? 0;
  const z = rdefs.defaultZ ?? 0;

  const colors: string[] = [];
  const contrast_limits: [min: number, max: number][] = [];
  const visibilities: boolean[] = [];
  const names: string[] = [];

  channels.forEach((c) => {
    colors.push(c.color);
    contrast_limits.push([c.window.start, c.window.end]);
    visibilities.push(c.active);
    names.push(c.label);
  });

  const defaultSelection = axes.map((axis) => {
    if (axis.type == 'time') return t;
    if (axis.name == 'z') return z;
    return 0;
  });
  const channel_axis = axes.findIndex((axis) => axis.type === 'channel');

  return {
    name,
    names,
    colors,
    contrast_limits,
    visibilities,
    channel_axis,
    defaultSelection,
  };
}
