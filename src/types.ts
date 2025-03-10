declare namespace Ome {
  type Version = "0.1";

  interface Channel {
    active: boolean;
    coefficient: number;
    color: string;
    family: string;
    inverted: boolean;
    label?: string;
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
      model: "color" | "greyscale";
    };
  }

  interface Axis {
    name: string;
    type?: string;
  }

  type CoordinateTransformation =
    | {
        type: "scale";
        scale: Array<number>;
      }
    | {
        type: "translation";
        translation: Array<number>;
      };

  interface Dataset {
    path: string;
    coordinateTransformations?: Array<CoordinateTransformation>;
  }

  interface Multiscale {
    datasets: Array<Dataset>;
    version?: string;
    axes?: string[] | Axis[];
  }

  interface Bioformats2rawlayout {
    "bioformats2raw.layout": 3;
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

  interface ImageLabel {
    version: Version;
    colors?: Array<{
      "label-value": number;
      rgba: [r: number, g: number, b: number, a: number];
    }>;
    properties?: Array<{
      "label-value": number;
      "omero:roiId": number;
      "omero:shapeId": number;
    }>;
    /** Location of source image */
    source: {
      image: string;
    };
  }

  type Attrs =
    | { multiscales: Multiscale[] }
    | { omero: Omero; multiscales: Multiscale[] }
    | { plate: Plate }
    | { well: Well }
    | { "image-label": ImageLabel; multiscales: Multiscale[] };
}
