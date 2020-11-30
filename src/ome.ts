import { openArray, HTTPStore } from 'zarr';
import { ZarrLoader } from 'viv';
import pMap from 'p-map';

import type { RootAttrs, OmeroImageData, OmeWellData, OmePlateData } from './types/rootAttrs';
import type { SourceData, ImageLayerConfig, Acquisition } from './state';

import { getJson, rstrip, join } from './utils';
import { createLoader } from './io';


// Create loader for every Well. Some loaders may be undefined if Wells are missing.
async function createLoaderFromPath(store: HTTPStore, path: string | undefined): Promise<ZarrLoader | undefined> {
    if (path === undefined) {
        // Don't even try to load if we know that Well is missing
        return;
    }
    try {
        const data = await openArray({ store, path });
        let l = createLoader([data]);
        return l;
    } catch (err) {
        console.log(`Failed to create loader: ${path}`);
    }
}

export async function loadOMEWell(config: ImageLayerConfig, store: HTTPStore, rootAttrs: RootAttrs): Promise<SourceData> {
    // Can filter Well fields by URL query ?acquisition=ID
    const acquisitionId: number | undefined = config.acquisition ? parseInt(config.acquisition) : undefined;
    let acquisitions: Acquisition[] = [];

    const wellAttrs = rootAttrs.well as OmeWellData;
    if (!wellAttrs.images) {
        throw Error(`Well .zattrs missing images`);
    }
    const [row, col] = store.url.split('/').filter(Boolean).slice(-2);

    let images = wellAttrs.images;

    // Do we have more than 1 Acquisition?
    const acqIds = images.flatMap(img => img.acquisition ? [img.acquisition] : []);
    if (acqIds.length > 1) {
        // Need to get acquisitions metadata from parent Plate
        const plateUrl = store.url.replace(`/${row}/${col}`, '');
        const plateStore = new HTTPStore(plateUrl);
        const plateAttrs = await getJson(plateStore, `.zattrs`);
        acquisitions = plateAttrs?.plate?.acquisitions;

        // filter imagePaths by acquisition
        if (acquisitionId && acqIds.includes(acquisitionId)) {
            images = images.filter(img => img.acquisition === acquisitionId);
        }
    }

    let imagePaths = images.map(img => rstrip(img.path, '/'));

    // Use first image for rendering settings, resolutions etc.
    let imageAttrs = await getJson(store, `${imagePaths[0]}/.zattrs`)
    // Lowest resolution is the 'path' of the first 'dataset' from the first multiscales
    let resolution = imageAttrs.multiscales[0].datasets[0].path;

    // Create loader for every Image.
    const promises = imagePaths.map(p => createLoaderFromPath(store, join(p, resolution)));
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
            const field = (row * cols) + column;
            imgSource = join(source, imagePaths[field]);
        }
        if (config.onClick) {
            delete info.layer;
            info.imageSource = imgSource;
            config.onClick(info);
        }
        else if (imgSource){
            window.open(window.location.origin + window.location.pathname + '?source=' + imgSource);
        }
    }

    return sourceData;
}

export async function loadOMEPlate(
        config: ImageLayerConfig,
        store: HTTPStore,
        rootAttrs: RootAttrs
    ): Promise<SourceData> {
    const plateAttrs = rootAttrs.plate as OmePlateData;
    if (!('columns' in plateAttrs) || !('rows' in plateAttrs)) {
        throw Error(`Plate .zattrs missing columns or rows`);
    }

    let rows: number = plateAttrs.rows.length;
    let columns: number = plateAttrs.columns.length;
    let rowNames: string[] = plateAttrs.rows.map(row => row.name);
    let columnNames: string[] = plateAttrs.columns.map(col => col.name);
    let wellPaths = plateAttrs.wells.map(well => rstrip(well.path, '/'));

    // Fields are by index and we assume at least 1 per Well
    let field = '0';

    // TEMP: try to support plates with plate/acquisition/row/column hierarchy
    // Where plate.acquisitions = [{'path': '0'}]
    let acquisitionPath = plateAttrs?.acquisitions?.[0]?.path || '';

    // imagePaths covers whole plate (not sparse) - but some will be '' if no Well
    const imagePaths = rowNames.flatMap(row => {
        return columnNames.map(col => {
            const wellPath = join(acquisitionPath, row, col);
            return wellPaths.includes(wellPath) ? join(wellPath, field) : '';
        });
    });

    // Find first valid Image, loading each Well in turn...
    let imageAttrs = undefined;
    async function getImageAttrs(path: string): Promise<any> {
        if (path === '') return
        try {
            return await getJson(store, join(path, '.zattrs'));
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
    const mapper = (path:string) => createLoaderFromPath(store, path ? join(path, resolution): undefined);
    const promises = await pMap(imagePaths, mapper, { concurrency: 10 });
    let loaders = await Promise.all(promises);

    const loader = loaders.find(Boolean);

    // Load Image to use for channel names, rendering settings, sizeZ, sizeT etc.
    const sourceData: SourceData = loadOME(config, imageAttrs.omero, loader as ZarrLoader);

    sourceData.loaders = loaders;
    sourceData.name = plateAttrs.name || "Plate";
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
        }
        else if (imgSource){
            window.open(window.location.origin + window.location.pathname + '?source=' + imgSource);
        }

    }
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


