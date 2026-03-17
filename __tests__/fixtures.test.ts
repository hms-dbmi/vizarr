import { assert, describe, expect, it } from "vitest";

import * as zarr from "zarrita";
import { classifySource } from "../src/io";
import { parseOmeroMeta } from "../src/ome";
import { getNgffAxes, isMultiscales, isOmeMultiscales, resolveAttrs } from "../src/utils";
import manifest from "./fixtures.json";

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
    expect(meta.channel_axis).toMatchInlineSnapshot(`1`);
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
    expect(meta.channel_axis).toMatchInlineSnapshot(`1`);
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
    expect(meta.channel_axis).toMatchInlineSnapshot(`1`);
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
    expect(meta.names.length).toMatchInlineSnapshot(`27`);
    expect(meta.channel_axis).toMatchInlineSnapshot(`1`);
    expect(meta.visibilities.filter(Boolean).length).toMatchInlineSnapshot(`7`);
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
    expect(meta.channel_axis).toMatchInlineSnapshot(`0`);
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
