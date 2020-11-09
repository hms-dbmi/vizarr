import { openArray, HTTPStore } from 'zarr';
import { ZarrLoader } from 'viv';
import pMap from 'p-map';

import type { RootAttrs, OmeroImageData, OmeWellData, OmePlateData } from './types/rootAttrs';
import type { SourceData, ImageLayerConfig } from './state';

import { getJson } from './utils';
import { createLoader } from './io';


// Create loader for every Well. Some loaders may be undefined if Wells are missing.
async function createLoaderFromPath(store: HTTPStore, path: string): Promise<ZarrLoader | undefined> {
    try {
        const data = await openArray({ store, path });
        let l = createLoader([data]);
        return l;
    } catch (err) {
        console.log(`Missing Well at ${path}`);
    }
}

export async function loadOMEWell(config: ImageLayerConfig, store: HTTPStore, rootAttrs: RootAttrs): Promise<SourceData> {
    const wellAttrs = rootAttrs.well as OmeWellData;
    if (!wellAttrs.images) {
        throw Error(`Well .zattrs missing images`);
    }
    const [row, col] = store.url.split('/').filter(Boolean).slice(-2);

    const imagePaths = wellAttrs.images.map(img => img.path + (img.path.endsWith('/') ? '' : '/'));
    // Use first image for rendering settings, resolutions etc.
    let imageAttrs = await getJson(store, `${imagePaths[0]}.zattrs`)
    // Lowest resolution is the 'path' of the first 'dataset' from the first multiscales
    let resolution = imageAttrs.multiscales[0].datasets[0].path;

    // Create loader for every Image.
    const promises = imagePaths.map(p => createLoaderFromPath(store, `${p}${resolution}/`));
    let loaders = await Promise.all(promises);
    const loader = loaders.find(Boolean);

    // Load Image to use for channel names, rendering settings, sizeZ, sizeT etc.
    const sourceData: SourceData = loadOME(config, imageAttrs.omero, loader as ZarrLoader);
    const cols = Math.ceil(Math.sqrt(imagePaths.length));

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
        let { source } = sourceData;
        if (typeof source === 'string' && !isNaN(row) && !isNaN(column)) {
            const field = (row * cols) + column;
            if (source.endsWith('/')) {
                source = source.slice(0, -1);
            }
            let imgSource = `${source}/${imagePaths[field]}`;
            window.open(window.location.origin + '?source=' + imgSource);
        }
    }

    return sourceData;
}

export async function loadOMEPlate(config: ImageLayerConfig, store: HTTPStore, rootAttrs: RootAttrs): Promise<SourceData> {
    const plateAttrs = rootAttrs.plate as OmePlateData;
    if (!('columns' in plateAttrs) || !('rows' in plateAttrs)) {
        throw Error(`Plate .zattrs missing columns or rows`);
    }

    let rows: number = plateAttrs.rows.length;
    let columns: number = plateAttrs.columns.length;
    let rowNames: string[] = plateAttrs.rows.map(row => row.name);
    let columnNames: string[] = plateAttrs.columns.map(col => col.name);
    let wellPaths = plateAttrs.wells.map(well => well.path);

    let acquisitions = ['0'];
    if (plateAttrs?.acquisitions) {
        acquisitions = plateAttrs.acquisitions.map(pa => pa.path);
    }

    let acquisition = acquisitions[0];
    // Fields are by index and we assume at least 1 per Well
    let field = '0';

    // imagePaths covers whole plate (not sparse) - but some will be '' if no Well
    const imagePaths = rowNames.flatMap(row => {
        return columnNames.map(col => {
            let wellPath = `${acquisition}/${row}/${col}/`;
            return wellPaths.includes(wellPath) ? `${wellPath}${field}/` : '';
        });
    })

    // Find first valid Image, loading each Well in turn...
    let imageAttrs = undefined;
    async function getImageAttrs(path: string): Promise<any> {
        if (path === '') return
        try {
            return await getJson(store, `${path}.zattrs`);
        } catch (err) {
        }
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
    async function createLoaderFromPath(path: string): Promise<ZarrLoader | undefined> {
        try {
            const data = await openArray({ store, path: `${path}${resolution}/` });
            let l = createLoader([data]);
            return l;
        } catch (err) {
            console.log(`Missing Well at ${path}`);
        }
    }
    const promises = await pMap(imagePaths, createLoaderFromPath, { concurrency: 10 });
    let loaders = await Promise.all(promises);

    const loader = loaders.find(Boolean);

    // Load Image to use for channel names, rendering settings, sizeZ, sizeT etc.
    const sourceData: SourceData = loadOME(config, imageAttrs.omero, loader as ZarrLoader);

    sourceData.loaders = loaders;
    sourceData.name = plateAttrs.name || "Plate";
    sourceData.rows = rows;
    sourceData.columns = columns;
    // Us onClick from image config or Open Well in new window
    sourceData.onClick = config.onClick || ((info: any) => {
        let gridCoord = info.gridCoord;
        if (!gridCoord) {
            return;
        }
        const { row, column } = gridCoord;
        let { source } = sourceData;
        if (typeof source === 'string' && !isNaN(row) && !isNaN(column) && acquisitions) {
            if (source.endsWith('/')) {
                source = source.slice(0, -1);
            }
            let imgSource = `${source}/${acquisitions[0]}/${rowNames[row]}/${columnNames[column]}/`;
            window.open(window.location.origin + '?source=' + imgSource);
        }
    })
    return sourceData;
}

export function loadOME(config: ImageLayerConfig, imageData: OmeroImageData, loader: ZarrLoader): SourceData {
    const { name, opacity = 1, colormap = '', translate, source } = config;
    const { rdefs, channels } = imageData;
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
            opacity,
        },
        axis_labels: ["t", "c", "z", "y", "x"],
        translate: translate ?? [0, 0],
    };
}


