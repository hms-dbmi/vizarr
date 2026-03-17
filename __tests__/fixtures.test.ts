import { Matrix4 } from "math.gl";
import { assert, describe, expect, it } from "vitest";

import * as zarr from "zarrita";
import { classifySource, initLayerStateFromSource } from "../src/io";
import { parseOmeroMeta } from "../src/ome";
import type { LayerState, SourceData } from "../src/state";
import {
  coordinateTransformationsToMatrix,
  getNgffAxes,
  getNgffAxisLabels,
  isMultiscales,
  isOmeMultiscales,
  parseMatrix,
  resolveAttrs,
} from "../src/utils";
import manifest from "./fixtures.json";

function rgb(c: [number, number, number]) {
  return `rgb(${c.join(",")})`;
}

function arr(s: number[] | string[]) {
  return `[${s.join(",")}]`;
}

function truncate(s: string, max: number) {
  return s.length <= max ? s : `${s.slice(0, max - 1)}…`;
}

/**
 * Format a LayerState into a compact, human-readable string for snapshots.
 *
 * Example output:
 *   multiscale | "LaminB1" | opacity=1 | colormap="" | on | axes=[t,c,z,y,x]
 *     ch 0 "LaminB1"      ON   rgb(0,0,255)    [0,1500]      sel=[0,0,118,0,0]
 *     ch 1 "Dapi"          ON   rgb(255,255,0)  [0,1500]      sel=[0,1,118,0,0]
 */
function formatLayerState(state: LayerState, source?: SourceData): string {
  const NAME_WIDTH = 18;
  const { kind, layerProps, on } = state;
  const lines: string[] = [];
  const header = [
    kind,
    `opacity=${layerProps.opacity}`,
    `colormap=${JSON.stringify(layerProps.colormap)}`,
    on ? "on" : "off",
  ];
  if (source?.name) header.splice(1, 0, JSON.stringify(truncate(source.name, 24)));
  if (source?.axis_labels) header.push(`axes=${arr(source.axis_labels)}`);
  lines.push(header.join(" | "));

  const n = layerProps.selections.length;
  for (let i = 0; i < n; i++) {
    const vis = layerProps.channelsVisible[i] ? "ON " : "OFF";
    const color = rgb(layerProps.colors[i]);
    const limits = arr(layerProps.contrastLimits[i]);
    const selection = arr(layerProps.selections[i]);
    const name = source?.names[i] ? truncate(source.names[i], 16).padEnd(NAME_WIDTH) : "".padEnd(NAME_WIDTH);
    lines.push(`  ch ${i}  ${name}${vis}  ${color.padEnd(16)}${limits.padEnd(14)}sel=${selection}`);
  }
  const m = layerProps.modelMatrix;
  if (m && !m.equals(Matrix4.IDENTITY)) {
    const sx = m[0].toPrecision(4);
    const sy = m[5].toPrecision(4);
    const sz = m[10].toPrecision(4);
    const tx = m[12];
    const ty = m[13];
    const tz = m[14];
    const parts = [`scale=[${sx},${sy},${sz}]`];
    if (tx || ty || tz) parts.push(`translate=[${tx},${ty},${tz}]`);
    lines.push(`  matrix: ${parts.join(" ")}`);
  } else {
    lines.push("  matrix: none");
  }
  if (state.labels) {
    lines.push(`  labels: ${state.labels.length}`);
  }
  return lines.join("\n");
}

const encoder = new TextEncoder();

/**
 * Build a zarr-compatible Map store from the JSON manifest,
 * scoped to a fixture prefix (e.g. "v0.1/idr0062-multiscale").
 *
 * Keys in the manifest are like "v0.1/idr0062-multiscale/.zattrs".
 * The store strips the prefix so zarrita sees "/.zattrs".
 */
function fixtureStore(prefix: string): Map<string, Uint8Array> {
  const store = new Map<string, Uint8Array>();
  const prefixWithSlash = `${prefix}/`;
  for (const [key, value] of Object.entries(manifest)) {
    if (key.startsWith(prefixWithSlash)) {
      const storeKey = `/${key.slice(prefix.length + 1)}`;
      store.set(storeKey, encoder.encode(JSON.stringify(value)));
    }
  }
  return store;
}

async function openFixture(prefix: string) {
  const store = fixtureStore(prefix);
  return zarr.open(zarr.root(store));
}

describe("classifySource with IDR fixtures", () => {
  it("idr0062 multiscale image", async () => {
    const node = await openFixture("v0.1/idr0062-multiscale");
    assert(node instanceof zarr.Group);
    const result = classifySource(node, resolveAttrs(node.attrs));
    expect(result.kind).toMatchInlineSnapshot(`"multiscales"`);
  });

  it("idr0001 plate root", async () => {
    const node = await openFixture("v0.1/idr0001-plate");
    assert(node instanceof zarr.Group);
    const result = classifySource(node, resolveAttrs(node.attrs));
    expect(result.kind).toMatchInlineSnapshot(`"plate"`);
  });

  it("idr0001 well", async () => {
    const root = await openFixture("v0.1/idr0001-plate");
    assert(root instanceof zarr.Group);
    const well = await zarr.open(root.resolve("A/7"), { kind: "group" });
    const result = classifySource(well, resolveAttrs(well.attrs));
    expect(result.kind).toMatchInlineSnapshot(`"well"`);
  });

  it("idr0001 well image is multiscales", async () => {
    const root = await openFixture("v0.1/idr0001-plate");
    assert(root instanceof zarr.Group);
    const img = await zarr.open(root.resolve("A/7/0"), { kind: "group" });
    const result = classifySource(img, resolveAttrs(img.attrs));
    expect(result.kind).toMatchInlineSnapshot(`"multiscales"`);
  });

  it("idr0033 plate root", async () => {
    const node = await openFixture("v0.1/idr0033-plate");
    assert(node instanceof zarr.Group);
    const result = classifySource(node, resolveAttrs(node.attrs));
    expect(result.kind).toMatchInlineSnapshot(`"plate"`);
  });

  it("idr0033 well", async () => {
    const root = await openFixture("v0.1/idr0033-plate");
    assert(root instanceof zarr.Group);
    const well = await zarr.open(root.resolve("P/8"), { kind: "group" });
    const result = classifySource(well, resolveAttrs(well.attrs));
    expect(result.kind).toMatchInlineSnapshot(`"well"`);
  });
});

describe("parseOmeroMeta with IDR fixtures", () => {
  it("idr0062 multiscale (v0.1, 2 channels)", async () => {
    const node = await openFixture("v0.1/idr0062-multiscale");
    assert(node instanceof zarr.Group);
    const attrs = resolveAttrs(node.attrs);
    assert(isOmeMultiscales(attrs));
    const axes = getNgffAxes(attrs.multiscales);
    const meta = parseOmeroMeta(attrs.omero, axes);

    expect(meta.names).toMatchInlineSnapshot(`
      [
        "LaminB1",
        "Dapi",
      ]
    `);
    expect(meta.colors).toMatchInlineSnapshot(`
      [
        "0000FF",
        "FFFF00",
      ]
    `);
    expect(meta.contrast_limits).toMatchInlineSnapshot(`
      [
        [
          0,
          1500,
        ],
        [
          0,
          1500,
        ],
      ]
    `);
    expect(meta.channel_axis).toMatchInlineSnapshot("1");
    expect(meta.defaultSelection).toMatchInlineSnapshot(`
      [
        0,
        0,
        118,
        0,
        0,
      ]
    `);
  });

  it("idr0001 well image (v0.1, 2 channels)", async () => {
    const root = await openFixture("v0.1/idr0001-plate");
    assert(root instanceof zarr.Group);
    const img = await zarr.open(root.resolve("A/7/0"), { kind: "group" });
    const attrs = resolveAttrs(img.attrs);
    assert(isOmeMultiscales(attrs));
    const axes = getNgffAxes(attrs.multiscales);
    const meta = parseOmeroMeta(attrs.omero, axes);

    expect(meta.names).toMatchInlineSnapshot(`
      [
        "Cy3",
        "eGFP",
      ]
    `);
    expect(meta.colors).toMatchInlineSnapshot(`
      [
        "FF0000",
        "00FF00",
      ]
    `);
    expect(meta.channel_axis).toMatchInlineSnapshot("1");
  });

  it("idr0033 well image (v0.1, 5 channels, color)", async () => {
    const root = await openFixture("v0.1/idr0033-plate");
    assert(root instanceof zarr.Group);
    const img = await zarr.open(root.resolve("P/8/0"), { kind: "group" });
    const attrs = resolveAttrs(img.attrs);
    assert(isOmeMultiscales(attrs));
    const axes = getNgffAxes(attrs.multiscales);
    const meta = parseOmeroMeta(attrs.omero, axes);

    expect(meta.names).toMatchInlineSnapshot(`
      [
        "Hoechst",
        "ERSyto",
        "ERSytoBleed",
        "PhGolgi",
        "Mito",
      ]
    `);
    expect(meta.visibilities).toMatchInlineSnapshot(`
      [
        true,
        true,
        true,
        false,
        false,
      ]
    `);
    expect(meta.channel_axis).toMatchInlineSnapshot("1");
  });
});

describe("v0.4 fixtures", () => {
  it("idr0062 v0.4 classifies as multiscales", async () => {
    const node = await openFixture("v0.4/idr0062-multiscale");
    assert(node instanceof zarr.Group);
    const result = classifySource(node, resolveAttrs(node.attrs));
    expect(result.kind).toMatchInlineSnapshot(`"multiscales"`);
  });

  it("idr0062 v0.4 has typed axes", async () => {
    const node = await openFixture("v0.4/idr0062-multiscale");
    assert(node instanceof zarr.Group);
    const attrs = resolveAttrs(node.attrs);
    assert(isMultiscales(attrs));
    const axes = getNgffAxes(attrs.multiscales);
    expect(axes).toMatchInlineSnapshot(`
      [
        {
          "name": "c",
          "type": "channel",
        },
        {
          "name": "z",
          "type": "space",
        },
        {
          "name": "y",
          "type": "space",
        },
        {
          "name": "x",
          "type": "space",
        },
      ]
    `);
  });

  it("idr0054 v0.4 multichannel (27 channels, from issue #153)", async () => {
    const node = await openFixture("v0.4/idr0054-multichannel");
    assert(node instanceof zarr.Group);
    const attrs = resolveAttrs(node.attrs);
    assert(isOmeMultiscales(attrs));
    const axes = getNgffAxes(attrs.multiscales);
    const meta = parseOmeroMeta(attrs.omero, axes);
    expect(meta.names.length).toMatchInlineSnapshot("27");
    expect(meta.channel_axis).toMatchInlineSnapshot("1");
    expect(meta.visibilities.filter(Boolean).length).toMatchInlineSnapshot("7");
  });
});

describe("v0.5 fixtures (zarr v3, ome wrapper)", () => {
  it("idr0047 v0.5 classifies as multiscales", async () => {
    const node = await openFixture("v0.5/idr0047-multiscale");
    assert(node instanceof zarr.Group);
    const attrs = resolveAttrs(node.attrs);
    const result = classifySource(node, attrs);
    expect(result.kind).toMatchInlineSnapshot(`"multiscales"`);
  });

  it("idr0047 v0.5 resolveAttrs unwraps ome wrapper", async () => {
    const node = await openFixture("v0.5/idr0047-multiscale");
    assert(node instanceof zarr.Group);
    const attrs = resolveAttrs(node.attrs);
    assert(isOmeMultiscales(attrs));
  });

  it("idr0047 v0.5 parses omero metadata", async () => {
    const node = await openFixture("v0.5/idr0047-multiscale");
    assert(node instanceof zarr.Group);
    const attrs = resolveAttrs(node.attrs);
    assert(isOmeMultiscales(attrs));
    const axes = getNgffAxes(attrs.multiscales);
    const meta = parseOmeroMeta(attrs.omero, axes);
    expect(meta.names).toMatchInlineSnapshot(`
      [
        "3-CY5",
        "5-TMR",
        "1-DAPI",
        "7-TRANS",
      ]
    `);
    expect(meta.channel_axis).toMatchInlineSnapshot("0");
    expect(meta.defaultSelection).toMatchInlineSnapshot(`
      [
        0,
        12,
        0,
        0,
      ]
    `);
  });

  it("idr0047 v0.5 axes have types", async () => {
    const node = await openFixture("v0.5/idr0047-multiscale");
    assert(node instanceof zarr.Group);
    const attrs = resolveAttrs(node.attrs);
    assert(isMultiscales(attrs));
    const axes = getNgffAxes(attrs.multiscales);
    expect(axes).toMatchInlineSnapshot(`
      [
        {
          "name": "c",
          "type": "channel",
        },
        {
          "name": "z",
          "type": "space",
        },
        {
          "name": "y",
          "type": "space",
        },
        {
          "name": "x",
          "type": "space",
        },
      ]
    `);
  });
});

describe("coordinateTransformationsToMatrix with fixtures", () => {
  it("v0.4 idr0062 produces scale matrix from coordinateTransformations", async () => {
    const node = await openFixture("v0.4/idr0062-multiscale");
    assert(node instanceof zarr.Group);
    const attrs = resolveAttrs(node.attrs);
    assert(isMultiscales(attrs));
    const mat = coordinateTransformationsToMatrix(attrs.multiscales);
    // Should be a scale-only transform — extract the diagonal
    expect([mat[0], mat[5], mat[10]]).toMatchInlineSnapshot(`
      [
        0.3603981534640209,
        0.3603981534640209,
        0.5002025531914894,
      ]
    `);
  });

  it("v0.1 idr0062 returns identity (no coordinateTransformations)", async () => {
    const node = await openFixture("v0.1/idr0062-multiscale");
    assert(node instanceof zarr.Group);
    const attrs = resolveAttrs(node.attrs);
    assert(isMultiscales(attrs));
    const mat = coordinateTransformationsToMatrix(attrs.multiscales);
    expect(mat).toEqual(Matrix4.IDENTITY);
  });
});

describe("initLayerStateFromSource", () => {
  /** Build a minimal SourceData from fixture metadata for testing initLayerStateFromSource. */
  /** Build SourceData from fixture attrs end-to-end, like the real loader would. */
  function buildSourceData(
    attrs: { omero: Ome.Omero; multiscales: Ome.Multiscale[] },
    options?: { loaderCount?: number },
  ): SourceData & { id: string } {
    const loaderCount = options?.loaderCount ?? 2;
    const axes = getNgffAxes(attrs.multiscales);
    const meta = parseOmeroMeta(attrs.omero, axes);
    const fakeLoader = Array.from({ length: loaderCount }, () => ({}) as SourceData["loader"][number]);
    return {
      id: "test",
      loader: fakeLoader,
      name: meta.name,
      channel_axis: meta.channel_axis,
      colors: meta.colors,
      names: meta.names,
      contrast_limits: meta.contrast_limits,
      visibilities: meta.visibilities,
      model_matrix: coordinateTransformationsToMatrix(attrs.multiscales),
      axis_labels: getNgffAxisLabels(axes),
      defaults: {
        selection: meta.defaultSelection,
        colormap: "",
        opacity: 1,
      },
    };
  }

  it("v0.1 idr0062 (2 channels, multiscale)", async () => {
    const node = await openFixture("v0.1/idr0062-multiscale");
    assert(node instanceof zarr.Group);
    const attrs = resolveAttrs(node.attrs);
    assert(isOmeMultiscales(attrs));
    const source = buildSourceData(attrs);
    const state = initLayerStateFromSource(source);

    expect(formatLayerState(state, source)).toMatchInlineSnapshot(`
      "multiscale | opacity=1 | colormap="" | on | axes=[t,c,z,y,x]
        ch 0  LaminB1           ON   rgb(0,0,255)    [0,1500]      sel=[0,0,118,0,0]
        ch 1  Dapi              ON   rgb(255,255,0)  [0,1500]      sel=[0,1,118,0,0]
        matrix: none"
    `);
  });

  it("v0.4 idr0054 (27 channels) — caps at MAX_CHANNELS", async () => {
    const node = await openFixture("v0.4/idr0054-multichannel");
    assert(node instanceof zarr.Group);
    const attrs = resolveAttrs(node.attrs);
    assert(isOmeMultiscales(attrs));
    const source = buildSourceData(attrs);
    const state = initLayerStateFromSource(source);

    expect(formatLayerState(state, source)).toMatchInlineSnapshot(`
      "multiscale | opacity=1 | colormap="" | on | axes=[t,c,z,y,x]
        ch 0  CD3-170Er         ON   rgb(255,0,0)    [0,150]       sel=[0,0,0,0,0]
        ch 1  CD19-169Tm        ON   rgb(0,255,0)    [0,255]       sel=[0,1,0,0,0]
        ch 2  CD324/E-Cadheri…  ON   rgb(0,0,255)    [0,150]       sel=[0,2,0,0,0]
        ch 3  CD206-168Er       ON   rgb(0,255,255)  [0,50]        sel=[0,3,0,0,0]
        ch 4  Bcl6-163Dy        ON   rgb(255,0,255)  [0,100]       sel=[0,4,0,0,0]
        ch 5  CD141/BDCA3-165…  ON   rgb(255,255,0)  [0,50]        sel=[0,5,0,0,0]
        matrix: none"
    `);
  });

  it("single-resolution image gets kind 'image'", async () => {
    const node = await openFixture("v0.1/idr0062-multiscale");
    assert(node instanceof zarr.Group);
    const attrs = resolveAttrs(node.attrs);
    assert(isOmeMultiscales(attrs));
    const source = buildSourceData(attrs, { loaderCount: 1 });
    const state = initLayerStateFromSource(source);

    expect(formatLayerState(state, source)).toMatchInlineSnapshot(`
      "image | opacity=1 | colormap="" | on | axes=[t,c,z,y,x]
        ch 0  LaminB1           ON   rgb(0,0,255)    [0,1500]      sel=[0,0,118,0,0]
        ch 1  Dapi              ON   rgb(255,255,0)  [0,1500]      sel=[0,1,118,0,0]
        matrix: none"
    `);
  });

  // https://github.com/hms-dbmi/vizarr/pull/273
  it("v0.4 idr0062 single-resolution with labels", async () => {
    const node = await openFixture("v0.4/idr0062-with-labels");
    assert(node instanceof zarr.Group);
    const attrs = resolveAttrs(node.attrs);
    assert(isOmeMultiscales(attrs));
    const source = buildSourceData(attrs, { loaderCount: 1 });
    source.labels = [
      {
        name: "0",
        loader: source.loader,
        modelMatrix: source.model_matrix,
      },
    ];
    const state = initLayerStateFromSource(source);

    expect(formatLayerState(state, source)).toMatchInlineSnapshot(`
      "image | opacity=1 | colormap="" | on | axes=[c,z,y,x]
        ch 0  LaminB1           ON   rgb(0,0,255)    [0,1500]      sel=[0,118,0,0]
        ch 1  Dapi              ON   rgb(255,255,0)  [0,1500]      sel=[1,118,0,0]
        matrix: scale=[0.3604,0.3604,0.5002]"
    `);
  });

  it("v0.5 idr0047 (4 channels)", async () => {
    const node = await openFixture("v0.5/idr0047-multiscale");
    assert(node instanceof zarr.Group);
    const attrs = resolveAttrs(node.attrs);
    assert(isOmeMultiscales(attrs));
    const source = buildSourceData(attrs);
    const state = initLayerStateFromSource(source);

    expect(formatLayerState(state, source)).toMatchInlineSnapshot(`
      "multiscale | opacity=1 | colormap="" | on | axes=[c,z,y,x]
        ch 0  3-CY5             ON   rgb(255,0,204)  [400,2300]    sel=[0,12,0,0]
        ch 1  5-TMR             ON   rgb(255,255,0)  [1400,3600]   sel=[1,12,0,0]
        ch 2  1-DAPI            ON   rgb(0,255,255)  [1400,14000]  sel=[2,12,0,0]
        matrix: scale=[1.000,1.000,0.2000]"
    `);
  });

  it("v0.1 idr0083 single-channel greyscale", async () => {
    const node = await openFixture("v0.1/idr0083-singlechannel");
    assert(node instanceof zarr.Group);
    const attrs = resolveAttrs(node.attrs);
    assert(isOmeMultiscales(attrs));
    const source = buildSourceData(attrs);
    const state = initLayerStateFromSource(source);

    expect(formatLayerState(state, source)).toMatchInlineSnapshot(`
      "multiscale | "2018-12-18 ASY H2B bud …" | opacity=1 | colormap="" | on | axes=[t,c,z,y,x]
        ch 0  Cam2-T1           ON   rgb(255,0,0)    [138,3110]    sel=[0,0,129,0,0]
        ch 1  Cam1-T2           ON   rgb(0,192,0)    [140,2738]    sel=[0,1,129,0,0]
        ch 2  2                 ON   rgb(255,255,255)[138,3090]    sel=[0,2,129,0,0]
        matrix: none"
    `);
  });

  it("v0.4 idr0050 with physical scale transforms", async () => {
    const node = await openFixture("v0.4/idr0050-multiscale");
    assert(node instanceof zarr.Group);
    const attrs = resolveAttrs(node.attrs);
    assert(isOmeMultiscales(attrs));
    const source = buildSourceData(attrs);
    const state = initLayerStateFromSource(source);

    expect(formatLayerState(state, source)).toMatchInlineSnapshot(`
      "multiscale | opacity=1 | colormap="" | on | axes=[c,z,y,x]
        ch 0  Actin             ON   rgb(255,0,0)    [52,31890]    sel=[0,0,0,0]
        ch 1  Cell              ON   rgb(255,255,255)[4283,65535]  sel=[1,0,0,0]
        ch 2  Microtubules      ON   rgb(0,255,0)    [15,10391]    sel=[2,0,0,0]
        matrix: scale=[0.1020,0.1020,0.5920]"
    `);
  });
});

describe("classifySource — new fixtures", () => {
  it("v0.4 bioformats2raw layout", async () => {
    const node = await openFixture("v0.4/idr0048-bioformats2raw");
    assert(node instanceof zarr.Group);
    const result = classifySource(node, resolveAttrs(node.attrs));
    expect(result.kind).toMatchInlineSnapshot(`"bioformats2raw"`);
  });

  it("v0.4 labels group", async () => {
    const root = await openFixture("v0.4/idr0062-with-labels");
    assert(root instanceof zarr.Group);
    const labelsGroup = await zarr.open(root.resolve("labels/0"), { kind: "group" });
    const attrs = resolveAttrs(labelsGroup.attrs);
    expect("image-label" in attrs).toBe(true);
    expect("multiscales" in attrs).toBe(true);
  });

  it("v0.1 single channel", async () => {
    const node = await openFixture("v0.1/idr0083-singlechannel");
    assert(node instanceof zarr.Group);
    const result = classifySource(node, resolveAttrs(node.attrs));
    expect(result.kind).toMatchInlineSnapshot(`"multiscales"`);
  });
});

describe("coordinateTransformationsToMatrix", () => {
  it("v0.4 idr0050 — physical scale from micrometer units", async () => {
    const node = await openFixture("v0.4/idr0050-multiscale");
    assert(node instanceof zarr.Group);
    const attrs = resolveAttrs(node.attrs);
    assert(isMultiscales(attrs));
    const mat = coordinateTransformationsToMatrix(attrs.multiscales);
    // Extract x/y/z scale from the diagonal
    expect([mat[0], mat[5], mat[10]]).toMatchInlineSnapshot(`
      [
        0.10202959397405088,
        0.10202959397405088,
        0.5920416817598223,
      ]
    `);
  });

  it("v0.4 idr0062 — scale transform", async () => {
    const node = await openFixture("v0.4/idr0062-multiscale");
    assert(node instanceof zarr.Group);
    const attrs = resolveAttrs(node.attrs);
    assert(isMultiscales(attrs));
    const mat = coordinateTransformationsToMatrix(attrs.multiscales);
    expect([mat[0], mat[5], mat[10]]).toMatchInlineSnapshot(`
      [
        0.3603981534640209,
        0.3603981534640209,
        0.5002025531914894,
      ]
    `);
  });

  it("v0.1 — identity (no transforms)", async () => {
    const node = await openFixture("v0.1/idr0062-multiscale");
    assert(node instanceof zarr.Group);
    const attrs = resolveAttrs(node.attrs);
    assert(isMultiscales(attrs));
    const mat = coordinateTransformationsToMatrix(attrs.multiscales);
    expect(mat).toEqual(Matrix4.IDENTITY);
  });
});

describe("getNgffAxes across versions", () => {
  it("v0.1 returns 5D defaults (no axes field)", async () => {
    const node = await openFixture("v0.1/idr0062-multiscale");
    assert(node instanceof zarr.Group);
    const attrs = resolveAttrs(node.attrs);
    assert(isMultiscales(attrs));
    expect(getNgffAxes(attrs.multiscales).map((a) => a.name)).toMatchInlineSnapshot(`
      [
        "t",
        "c",
        "z",
        "y",
        "x",
      ]
    `);
  });

  it("v0.4 uses explicit axes from metadata", async () => {
    const node = await openFixture("v0.4/idr0062-multiscale");
    assert(node instanceof zarr.Group);
    const attrs = resolveAttrs(node.attrs);
    assert(isMultiscales(attrs));
    expect(getNgffAxes(attrs.multiscales).map((a) => a.name)).toMatchInlineSnapshot(`
      [
        "c",
        "z",
        "y",
        "x",
      ]
    `);
  });

  it("v0.5 uses explicit axes from metadata", async () => {
    const node = await openFixture("v0.5/idr0047-multiscale");
    assert(node instanceof zarr.Group);
    const attrs = resolveAttrs(node.attrs);
    assert(isMultiscales(attrs));
    expect(getNgffAxes(attrs.multiscales).map((a) => a.name)).toMatchInlineSnapshot(`
      [
        "c",
        "z",
        "y",
        "x",
      ]
    `);
  });
});
