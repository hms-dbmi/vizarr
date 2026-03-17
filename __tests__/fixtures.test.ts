import { Matrix4 } from "math.gl";
import { assert, describe, expect, it } from "vitest";

import * as zarr from "zarrita";
import { classifySource, initLayerStateFromSource } from "../src/io";
import { loadOmeMultiscales } from "../src/ome";
import type { LayerState, SourceData } from "../src/state";
import { isMultiscales, resolveAttrs } from "../src/utils";
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
 *     ch 0  LaminB1           ON   rgb(0,0,255)    [0,1500]      sel=[0,0,118,0,0]
 *     ch 1  Dapi              ON   rgb(255,255,0)  [0,1500]      sel=[0,1,118,0,0]
 *     matrix: scale=[0.3604,0.3604,0.5002]
 *     labels: 1
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

function fixtureStore(prefix: string) {
  const store = new Map<string, Uint8Array>();
  const prefixWithSlash = `${prefix}/`;
  for (const [key, value] of Object.entries(manifest)) {
    if (key.startsWith(prefixWithSlash)) {
      const storeKey = `/${key.slice(prefix.length + 1)}`;
      store.set(storeKey, encoder.encode(JSON.stringify(value)));
    }
  }
  return Object.assign(store, {
    // zarrita asserts getRange exists when constructing sharded arrays (v0.5).
    // We only use metadata, never read chunks.
    getRange(): never {
      throw new Error("not implemented: fixture store does not support range requests");
    },
  });
}

async function openFixture(prefix: string) {
  const store = fixtureStore(prefix);
  return zarr.open(zarr.root(store));
}

async function sourceDataFromFixture(prefix: string): Promise<SourceData & { id: string }> {
  const grp = await openFixture(prefix);
  assert(grp instanceof zarr.Group);
  const attrs = resolveAttrs(grp.attrs);
  assert(isMultiscales(attrs));
  const source = await loadOmeMultiscales({ source: "" }, grp, attrs);
  return { id: "test", ...source };
}

describe("classifySource", () => {
  it("v0.1 idr0062 multiscale", async () => {
    const node = await openFixture("v0.1/idr0062-multiscale");
    assert(node instanceof zarr.Group);
    expect(classifySource(node, resolveAttrs(node.attrs)).kind).toMatchInlineSnapshot(`"multiscales"`);
  });

  it("v0.1 idr0001 plate", async () => {
    const node = await openFixture("v0.1/idr0001-plate");
    assert(node instanceof zarr.Group);
    expect(classifySource(node, resolveAttrs(node.attrs)).kind).toMatchInlineSnapshot(`"plate"`);
  });

  it("v0.1 idr0001 well", async () => {
    const root = await openFixture("v0.1/idr0001-plate");
    assert(root instanceof zarr.Group);
    const well = await zarr.open(root.resolve("A/7"), { kind: "group" });
    expect(classifySource(well, resolveAttrs(well.attrs)).kind).toMatchInlineSnapshot(`"well"`);
  });

  it("v0.1 idr0001 well image", async () => {
    const root = await openFixture("v0.1/idr0001-plate");
    assert(root instanceof zarr.Group);
    const img = await zarr.open(root.resolve("A/7/0"), { kind: "group" });
    expect(classifySource(img, resolveAttrs(img.attrs)).kind).toMatchInlineSnapshot(`"multiscales"`);
  });

  it("v0.1 idr0033 plate", async () => {
    const node = await openFixture("v0.1/idr0033-plate");
    assert(node instanceof zarr.Group);
    expect(classifySource(node, resolveAttrs(node.attrs)).kind).toMatchInlineSnapshot(`"plate"`);
  });

  it("v0.4 bioformats2raw layout", async () => {
    const node = await openFixture("v0.4/idr0048-bioformats2raw");
    assert(node instanceof zarr.Group);
    expect(classifySource(node, resolveAttrs(node.attrs)).kind).toMatchInlineSnapshot(`"bioformats2raw"`);
  });

  it("v0.5 idr0047 multiscale", async () => {
    const node = await openFixture("v0.5/idr0047-multiscale");
    assert(node instanceof zarr.Group);
    expect(classifySource(node, resolveAttrs(node.attrs)).kind).toMatchInlineSnapshot(`"multiscales"`);
  });
});

describe("initLayerStateFromSource", () => {
  it("v0.1 idr0062 (2 channels, multiscale)", async () => {
    const source = await sourceDataFromFixture("v0.1/idr0062-multiscale");
    const state = initLayerStateFromSource(source);
    expect(formatLayerState(state, source)).toMatchInlineSnapshot(`
      "multiscale | opacity=1 | colormap="" | on | axes=[t,c,z,y,x]
        ch 0  LaminB1           ON   rgb(0,0,255)    [0,1500]      sel=[0,0,118,0,0]
        ch 1  Dapi              ON   rgb(255,255,0)  [0,1500]      sel=[0,1,118,0,0]
        matrix: none
        labels: 1"
    `);
  });

  it("v0.4 idr0054 (27 channels) — caps at MAX_CHANNELS", async () => {
    const source = await sourceDataFromFixture("v0.4/idr0054-multichannel");
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
    const source = await sourceDataFromFixture("v0.1/idr0062-multiscale");
    source.loader = source.loader.slice(0, 1);
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
    const source = await sourceDataFromFixture("v0.4/idr0062-with-labels");
    source.loader = source.loader.slice(0, 1);
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
    const source = await sourceDataFromFixture("v0.5/idr0047-multiscale");
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
    const source = await sourceDataFromFixture("v0.1/idr0083-singlechannel");
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
    const source = await sourceDataFromFixture("v0.4/idr0050-multiscale");
    const state = initLayerStateFromSource(source);
    expect(formatLayerState(state, source)).toMatchInlineSnapshot(`
      "multiscale | opacity=1 | colormap="" | on | axes=[c,z,y,x]
        ch 0  Actin             ON   rgb(255,0,0)    [52,31890]    sel=[0,0,0,0]
        ch 1  Cell              ON   rgb(255,255,255)[4283,65535]  sel=[1,0,0,0]
        ch 2  Microtubules      ON   rgb(0,255,0)    [15,10391]    sel=[2,0,0,0]
        matrix: scale=[0.1020,0.1020,0.5920]"
    `);
  });

  it("v0.4 idr0076 CYX 50 channels (multiplexed imaging)", async () => {
    const source = await sourceDataFromFixture("v0.4/idr0076-cyx-50ch");
    const state = initLayerStateFromSource(source);
    expect(formatLayerState(state, source)).toMatchInlineSnapshot(`
      "multiscale | opacity=1 | colormap="" | on | axes=[c,y,x]
        ch 0  Total HH3-113In   ON   rgb(0,255,0)    [0,10]        sel=[0,0,0]
        ch 1  Xe126-126Xe       ON   rgb(255,0,0)    [0,10]        sel=[7,0,0]
        ch 2  I127-127I         ON   rgb(0,0,255)    [0,10]        sel=[12,0,0]
        ch 3  Xe131-131Xe       ON   rgb(0,0,255)    [0,34.952999114990234]sel=[14,0,0]
        ch 4  Xe134-134Xe       ON   rgb(255,255,0)  [0,10]        sel=[25,0,0]
        ch 5  H3K27me3-139La    ON   rgb(0,255,255)  [0,10]        sel=[29,0,0]
        matrix: none
        labels: 1"
    `);
  });

  it("v0.4 idr0083 5D single-channel greyscale", async () => {
    const source = await sourceDataFromFixture("v0.4/idr0083-5d-greyscale");
    const state = initLayerStateFromSource(source);
    expect(formatLayerState(state, source)).toMatchInlineSnapshot(`
      "multiscale | opacity=1 | colormap="" | on | axes=[t,c,z,y,x]
        ch 0  0                 ON   rgb(255,255,255)[1500,6000]   sel=[0,0,0,0,0]
        matrix: scale=[1.003,1.003,1.000]"
    `);
  });
});
