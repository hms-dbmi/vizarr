import * as t from 'io-ts';

const Version = t.keyof({ '0.1': null, '0.2': null, '0.3': null }, 'Ome.Version');

const Channel = t.type(
  {
    active: t.boolean,
    coefficient: t.number,
    color: t.string,
    family: t.string,
    inverted: t.boolean,
    label: t.string,
    window: t.intersection([t.type({ end: t.number, start: t.number }), t.partial({ max: t.number, min: t.number })]),
  },
  'Ome.Channel'
);

export const Omero = t.intersection(
  [
    t.type({
      id: t.number,
      version: Version,
      channels: t.array(Channel),
      rdefs: t.partial({
        defaultT: t.Int,
        defaultZ: t.Int,
        model: t.keyof({ color: null, greyscale: null }),
      }),
    }),
    t.partial({ name: t.string }),
  ],
  'Ome.Omero'
);

export const Multiscale = t.intersection(
  [t.type({ datasets: t.array(t.type({ path: t.string })) }), t.partial({ version: Version, axes: t.array(t.string) })],
  'Ome.Multiscale'
);

export const Acquisition = t.intersection(
  [
    t.type({ id: t.number }),
    t.partial({
      name: t.string,
      maximumfieldcount: t.number,
      description: t.string,
      starttime: t.number,
    }),
  ],
  'Ome.Acquisition'
);

export const Plate = t.intersection(
  [
    t.type({
      columns: t.array(t.type({ name: t.string })),
      field_count: t.literal(4),
      name: t.string,
      rows: t.array(t.type({ name: t.string })),
      wells: t.array(t.type({ path: t.string })),
      version: Version,
    }),
    t.partial({ acquisitions: t.array(Acquisition) }),
  ],
  'Ome.Plate'
);

export const Well = t.type(
  {
    images: t.array(t.intersection([t.type({ path: t.string }), t.partial({ acquisition: t.number })])),
    version: Version,
  },
  'Ome.Well'
);

export const Attrs = t.union(
  [
    t.type({ multiscales: t.array(Multiscale) }),
    t.type({ omero: Omero, multiscales: t.array(Multiscale) }),
    t.type({ plate: Plate }),
    t.type({ well: Well }),
  ],
  'Ome.Attrs'
);
