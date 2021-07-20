declare module Ome {
  type Version = '0.1';

  interface Channel {
    active: boolean;
    coefficient: number;
    color: string;
    family: string;
    inverted: boolean;
    label: string;
    window: {
      end: number;
      max?: number;
      min?: number;
      start: number;
    };
  }

  interface Omero {
    id: number;
    name?: string;
    version: Version;
    channels: Channel[];
    rdefs: {
      defaultT?: number;
      defaultZ?: number;
      model: 'color' | 'greyscale';
    };
  }

  interface Multiscale {
    datasets: { path: string }[];
    version?: string;
    axes?: string[];
  }

  interface Acquisition {
    id: number;
    name?: string;
    maximumfieldcount?: number;
    description?: string;
    starttime?: number;
    /**
     * @deprecated
     */
    path?: string;
  }

  interface Plate {
    acquisitions?: Acquisition[];
    columns: { name: string }[];
    field_count: 4;
    name: string;
    rows: { name: string }[];
    version: Version;
    wells: { path: string }[];
  }

  interface Well {
    images: { path: string; acquisition?: number }[];
    version: Version;
  }

  type Attrs =
    | { multiscales: Multiscale[] }
    | { omero: Omero; multiscales: Multiscale[] }
    | { plate: Plate }
    | { well: Well };
}
