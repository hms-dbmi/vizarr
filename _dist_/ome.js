import {openArray, HTTPStore} from "../web_modules/zarr.js";
import pMap from "../web_modules/p-map.js";
import {getJson, rstrip, join} from "./utils.js";
import {createLoader} from "./io.js";
async function createLoaderFromPath(store, path) {
  if (path === void 0) {
    return;
  }
  try {
    const data = await openArray({store, path});
    let l = createLoader([data]);
    return l;
  } catch (err) {
    console.log(`Failed to create loader: ${path}`);
  }
}
export async function loadOMEWell(config, store, rootAttrs) {
  const acquisitionId = config.acquisition ? parseInt(config.acquisition) : void 0;
  let acquisitions = [];
  const wellAttrs = rootAttrs.well;
  if (!wellAttrs.images) {
    throw Error(`Well .zattrs missing images`);
  }
  const [row, col] = store.url.split("/").filter(Boolean).slice(-2);
  let images = wellAttrs.images;
  const acqIds = images.flatMap((img) => img.acquisition ? [img.acquisition] : []);
  if (acqIds.length > 1) {
    const plateUrl = store.url.replace(`/${row}/${col}`, "");
    const plateStore = new HTTPStore(plateUrl);
    const plateAttrs = await getJson(plateStore, `.zattrs`);
    acquisitions = plateAttrs?.plate?.acquisitions;
    if (acquisitionId && acqIds.includes(acquisitionId)) {
      images = images.filter((img) => img.acquisition === acquisitionId);
    }
  }
  let imagePaths = images.map((img) => rstrip(img.path, "/"));
  let imageAttrs = await getJson(store, `${imagePaths[0]}/.zattrs`);
  let resolution = imageAttrs.multiscales[0].datasets[0].path;
  const promises = imagePaths.map((p) => createLoaderFromPath(store, join(p, resolution)));
  let loaders = await Promise.all(promises);
  const loader = loaders.find(Boolean);
  const sourceData = loadOME(config, imageAttrs.omero, loader);
  const cols = Math.ceil(Math.sqrt(imagePaths.length));
  if (acquisitions.length > 0) {
    sourceData.acquisitions = acquisitions;
    sourceData.acquisitionId = acquisitionId || -1;
  }
  sourceData.loaders = loaders;
  sourceData.name = `Well ${row}${col}`;
  sourceData.rows = Math.ceil(imagePaths.length / cols);
  sourceData.columns = cols;
  sourceData.onClick = (info) => {
    let gridCoord = info.gridCoord;
    if (!gridCoord) {
      return;
    }
    const {row: row2, column} = gridCoord;
    const {source} = sourceData;
    let imgSource = void 0;
    if (typeof source === "string" && !isNaN(row2) && !isNaN(column)) {
      const field = row2 * cols + column;
      imgSource = join(source, imagePaths[field]);
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
export async function loadOMEPlate(config, store, rootAttrs) {
  const plateAttrs = rootAttrs.plate;
  if (!("columns" in plateAttrs) || !("rows" in plateAttrs)) {
    throw Error(`Plate .zattrs missing columns or rows`);
  }
  let rows = plateAttrs.rows.length;
  let columns = plateAttrs.columns.length;
  let rowNames = plateAttrs.rows.map((row) => row.name);
  let columnNames = plateAttrs.columns.map((col) => col.name);
  let wellPaths = plateAttrs.wells.map((well) => rstrip(well.path, "/"));
  let field = "0";
  let acquisitionPath = plateAttrs?.acquisitions?.[0]?.path || "";
  const imagePaths = rowNames.flatMap((row) => {
    return columnNames.map((col) => {
      const wellPath = join(acquisitionPath, row, col);
      return wellPaths.includes(wellPath) ? join(wellPath, field) : "";
    });
  });
  let imageAttrs = void 0;
  async function getImageAttrs(path) {
    if (path === "")
      return;
    try {
      return await getJson(store, join(path, ".zattrs"));
    } catch (err) {
    }
  }
  for (let i = 0; i < imagePaths.length; i++) {
    imageAttrs = await getImageAttrs(imagePaths[i]);
    if (imageAttrs) {
      break;
    }
  }
  let resolution = imageAttrs.multiscales[0].datasets.slice(-1)[0].path;
  const mapper = (path) => createLoaderFromPath(store, path ? join(path, resolution) : void 0);
  const promises = await pMap(imagePaths, mapper, {concurrency: 10});
  let loaders = await Promise.all(promises);
  const loader = loaders.find(Boolean);
  const sourceData = loadOME(config, imageAttrs.omero, loader);
  sourceData.loaders = loaders;
  sourceData.name = plateAttrs.name || "Plate";
  sourceData.rows = rows;
  sourceData.columns = columns;
  sourceData.onClick = (info) => {
    let gridCoord = info.gridCoord;
    if (!gridCoord) {
      return;
    }
    const {row, column} = gridCoord;
    let {source} = sourceData;
    let imgSource = void 0;
    if (typeof source === "string" && !isNaN(row) && !isNaN(column)) {
      imgSource = join(source, acquisitionPath, rowNames[row], columnNames[column]);
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
export function loadOME(config, imageData, loader) {
  const {name, opacity = 1, colormap = "", translate, source} = config;
  const {rdefs, channels} = imageData;
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
    loader,
    source,
    name: imageData.name ?? name,
    channel_axis: 1,
    colors,
    names,
    contrast_limits,
    visibilities,
    defaults: {
      selection: [t, 0, z, 0, 0],
      colormap,
      opacity
    },
    axis_labels: ["t", "c", "z", "y", "x"],
    translate: translate ?? [0, 0]
  };
}
