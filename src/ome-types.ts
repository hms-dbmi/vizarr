import * as t from 'io-ts';

const Version = t.literal('0.1');

export const Channel = t.type({
  active: t.boolean,
  coefficient: t.number,
  color: t.string,
  family: t.string,
  inverted: t.boolean,
  label: t.string,
  window: t.intersection([t.type({ end: t.number, start: t.number }), t.partial({ max: t.number, min: t.number })]),
});

export const Omero = t.intersection([
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
]);

export const Multiscale = t.intersection([
  t.type({ datasets: t.array(t.type({ path: t.string })) }),
  t.partial({ version: Version, axes: t.array(t.string) }),
]);

export const Acquisition = t.intersection([
  t.type({ id: t.number }),
  t.partial({
    name: t.string,
    maximumfieldcount: t.number,
    description: t.string,
    starttime: t.number,
  }),
]);

export const Plate = t.intersection([
  t.type({
    columns: t.array(t.type({ name: t.string })),
    field_count: t.literal(4),
    name: t.string,
    rows: t.array(t.type({ name: t.string })),
    wells: t.array(t.type({ path: t.string })),
    version: Version,
  }),
  t.partial({ acquisitions: t.array(Acquisition) }),
]);

export const Well = t.type({
  images: t.array(t.intersection([t.type({ path: t.string }), t.partial({ acquisition: t.number })])),
  version: Version,
});

export const Attrs = t.union([
  t.type({ multiscales: t.array(Multiscale) }),
  t.type({ omero: Omero, multiscales: t.array(Multiscale) }),
  t.type({ plate: Plate }),
  t.type({ well: Well }),
]);
