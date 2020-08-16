export interface OmeroChannel {
  active: boolean;
  color: string;
  label: string;
  window: {
    min?: number;
    max?: number;
    start: number;
    end: number;
  };
}

export interface OmeroImageData {
  channels: OmeroChannel[];
  rdefs: {
    defaultT?: number;
    defaultZ?: number;
    model: string;
  };
  name?: string;
}

export interface Multiscale {
  datasets: { path: string }[];
  version?: string;
}

export interface RootAttrs {
  omero: OmeroImageData;
  multiscales: Multiscale[];
}
