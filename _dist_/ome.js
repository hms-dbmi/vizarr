import {ZarrPixelSource} from "../_snowpack/pkg/@hms-dbmi/viv.js";
import pMap from "../_snowpack/pkg/p-map.js";
import {HTTPStore, openGroup} from "../_snowpack/pkg/zarr.js";
import {join, loadMultiscales, guessTileSize, range, parseMatrix} from "./utils.js";
export async function loadWell(config, grp, wellAttrs) {
  const acquisitionId = config.acquisition ? parseInt(config.acquisition) : void 0;
  let acquisitions = [];
  if (!wellAttrs?.images) {
    throw Error(`Well .zattrs missing images`);
  }
  if (!(grp.store instanceof HTTPStore)) {
    throw Error("Store must be an HTTPStore to open well.");
  }
  const [row, col] = grp.store.url.split("/").filter(Boolean).slice(-2);
  let {images} = wellAttrs;
  const acqIds = images.flatMap((img) => img.acquisition ? [img.acquisition] : []);
  if (acqIds.length > 1) {
    const plateUrl = grp.store.url.replace(`${row}/${col}`, "");
    const plate = await openGroup(new HTTPStore(plateUrl));
    const plateAttrs = await plate.attrs.asObject();
    acquisitions = plateAttrs?.plate?.acquisitions ?? [];
    if (acquisitionId && acqIds.includes(acquisitionId)) {
      images = images.filter((img) => img.acquisition === acquisitionId);
    }
  }
  const imgPaths = images.map((img) => img.path);
  const cols = Math.ceil(Math.sqrt(imgPaths.length));
  const rows = Math.ceil(imgPaths.length / cols);
  const imgAttrs = await grp.getItem(imgPaths[0]).then((g) => g.attrs.asObject());
  if (!("omero" in imgAttrs)) {
    throw Error("Path for image is not valid.");
  }
  let resolution = imgAttrs.multiscales[0].datasets[0].path;
  const promises = imgPaths.map((p) => grp.getItem(join(p, resolution)));
  const meta = parseOmeroMeta(imgAttrs.omero);
  const data = await Promise.all(promises);
  const tileSize = guessTileSize(data[0]);
  const loaders = range(rows).flatMap((row2) => {
    return range(cols).map((col2) => {
      const offset = col2 + row2 * cols;
      return {name: String(offset), row: row2, col: col2, loader: new ZarrPixelSource(data[offset], meta.axis_labels, tileSize)};
    });
  });
  const sourceData = {
    loaders,
    ...meta,
    loader: [loaders[0].loader],
    model_matrix: parseMatrix(config.model_matrix),
    defaults: {
      selection: meta.defaultSelection,
      colormap: config.colormap ?? "",
      opacity: config.opacity ?? 1
    },
    name: `Well ${row}${col}`
  };
  if (acquisitions.length > 0) {
    sourceData.acquisitions = acquisitions;
    sourceData.acquisitionId = acquisitionId || -1;
  }
  sourceData.rows = rows;
  sourceData.columns = cols;
  sourceData.onClick = (info) => {
    let gridCoord = info.gridCoord;
    if (!gridCoord) {
      return;
    }
    const {row: row2, column} = gridCoord;
    let imgSource = void 0;
    if (grp.store instanceof HTTPStore && !isNaN(row2) && !isNaN(column)) {
      const field = row2 * cols + column;
      imgSource = join(grp.store.url, imgPaths[field]);
    }
    if (config.onClick) {
      delete info.layer;
      info.imageSource = imgSource;
      config.onClick(info);
    } else if (imgSource) {
      window.open(window.location.origin + window.location.pathname + "?source=" + imgSource);
    }
  };
  return sourceData;
}
export async function loadPlate(config, grp, plateAttrs) {
  if (!("columns" in plateAttrs) || !("rows" in plateAttrs)) {
    throw Error(`Plate .zattrs missing columns or rows`);
  }
  const rows = plateAttrs.rows.map((row) => row.name);
  const columns = plateAttrs.columns.map((row) => row.name);
  const wellPaths = plateAttrs.wells.map((well) => well.path);
  const wellAttrs = await grp.getItem(wellPaths[0]).then((g) => g.attrs.asObject());
  if (!("well" in wellAttrs)) {
    throw Error("Path for image is not valid, not a well.");
  }
  const imgPath = wellAttrs.well.images[0].path;
  const imgAttrs = await grp.getItem(join(wellPaths[0], imgPath)).then((g) => g.attrs.asObject());
  if (!("omero" in imgAttrs)) {
    throw Error("Path for image is not valid.");
  }
  const {datasets} = imgAttrs.multiscales[0];
  const resolution = datasets[datasets.length - 1].path;
  const mapper = ([key, path]) => grp.getItem(path).then((arr) => [key, arr]);
  const promises = await pMap(wellPaths.map((p) => [p, join(p, imgPath, resolution)]), mapper, {concurrency: 10});
  const meta = parseOmeroMeta(imgAttrs.omero);
  const data = await Promise.all(promises);
  const tileSize = guessTileSize(data[0][1]);
  const loaders = data.map((d) => {
    const [row, col] = d[0].split("/");
    return {
      name: `${row}${col}`,
      row: rows.indexOf(row),
      col: columns.indexOf(col),
      loader: new ZarrPixelSource(d[1], meta.axis_labels, tileSize)
    };
  });
  const sourceData = {
    loaders,
    ...meta,
    loader: [loaders[0].loader],
    model_matrix: parseMatrix(config.model_matrix),
    defaults: {
      selection: meta.defaultSelection,
      colormap: config.colormap ?? "",
      opacity: config.opacity ?? 1
    },
    name: plateAttrs.name || "Plate",
    rows: rows.length,
    columns: columns.length
  };
  sourceData.onClick = (info) => {
    let gridCoord = info.gridCoord;
    if (!gridCoord) {
      return;
    }
    const {row, column} = gridCoord;
    let imgSource = void 0;
    if (grp.store instanceof HTTPStore && !isNaN(row) && !isNaN(column)) {
      imgSource = join(grp.store.url, rows[row], columns[column]);
    }
    if (config.onClick) {
      delete info.layer;
      info.imageSource = imgSource;
      config.onClick(info);
    } else if (imgSource) {
      window.open(window.location.origin + window.location.pathname + "?source=" + imgSource);
    }
  };
  return sourceData;
}
export async function loadOmeroMultiscales(config, grp, attrs) {
  const {name, opacity = 1, colormap = ""} = config;
  const data = await loadMultiscales(grp, attrs.multiscales);
  const meta = parseOmeroMeta(attrs.omero);
  const tileSize = guessTileSize(data[0]);
  const loader = data.map((arr) => new ZarrPixelSource(arr, meta.axis_labels, tileSize));
  return {
    loader,
    name: meta.name ?? name,
    model_matrix: parseMatrix(config.model_matrix),
    defaults: {
      selection: meta.defaultSelection,
      colormap,
      opacity
    },
    ...meta
  };
}
function parseOmeroMeta({rdefs, channels, name}) {
  const t = rdefs.defaultT ?? 0;
  const z = rdefs.defaultZ ?? 0;
  const colors = [];
  const contrast_limits = [];
  const visibilities = [];
  const names = [];
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
    axis_labels: ["t", "c", "z", "y", "x"]
  };
}
