export type OmeroChannel = {
  active: boolean;
  color: string;
  label: string;
  window: {
    min?: number;
    max?: number;
    start: number;
    end: number;
  };
};

export type OmeroImageData = {
  channels: OmeroChannel[];
  rdefs: {
    defaultT?: number;
    defaultZ?: number;
    model: string;
  };
  name?: string;
};

export type Multiscale = {
  datasets: { path: string }[];
  version?: string;
};

export type RootAttrs = {
  omero: OmeroImageData;
  multiscales: Multiscale[];
};
