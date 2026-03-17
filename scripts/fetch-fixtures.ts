/**
 * Crawls OME-Zarr stores and downloads only zarr metadata files
 * into a single JSON manifest at __tests__/fixtures.json.
 *
 * The manifest maps store-relative paths to their JSON content,
 * e.g. { "v0.1/idr0062-multiscale/.zattrs": { ... }, ... }
 *
 * Usage: node scripts/fetch-fixtures.ts
 */

import * as fs from "node:fs/promises";
import * as path from "node:path";

// Inline the type guards rather than importing from src/utils.ts,
// which pulls in the full app module graph with bundler-style imports
// that Node's native TS stripping can't resolve.
function isMultiscales(
  attrs: Record<string, unknown>,
): attrs is { multiscales: Array<{ datasets: Array<{ path: string }> }> } {
  return "multiscales" in attrs;
}

function isOmePlate(attrs: Record<string, unknown>): attrs is { plate: { wells: Array<{ path: string }> } } {
  return "plate" in attrs;
}

function isOmeWell(attrs: Record<string, unknown>): attrs is { well: { images: Array<{ path: string }> } } {
  return "well" in attrs;
}

const OUT_FILE = path.resolve(import.meta.dirname, "../__tests__/fixtures.json");

/**
 * A representative set of OME-Zarr stores covering different source kinds
 * across spec versions.
 *
 * Sources:
 *   https://www.openmicroscopy.org/2020/11/04/zarr-data.html
 *   https://www.openmicroscopy.org/2020/12/01/zarr-hcs.html
 *   https://github.com/ome/ome2024-ngff-challenge
 */
const SOURCES: Record<string, { url: string; maxDepth: number }> = {
  // A 5D multiscale image (t, c, z, y, x) with omero rendering metadata
  "v0.1/idr0062-multiscale": {
    url: "https://uk1s3.embassy.ebi.ac.uk/idr/zarr/v0.1/6001240.zarr",
    maxDepth: 2,
  },
  // An HCS plate — we only crawl 2 levels deep to get plate + one well
  "v0.1/idr0001-plate": {
    url: "https://uk1s3.embassy.ebi.ac.uk/idr/zarr/v0.1/plates/422.zarr",
    maxDepth: 2,
  },
  // A plate with more fields per well
  "v0.1/idr0033-plate": {
    url: "https://uk1s3.embassy.ebi.ac.uk/idr/zarr/v0.1/plates/5966.zarr",
    maxDepth: 2,
  },
  // v0.4 multiscale with typed axes, units, and coordinateTransformations
  "v0.4/idr0062-multiscale": {
    url: "https://uk1s3.embassy.ebi.ac.uk/idr/zarr/v0.4/idr0062A/6001240.zarr",
    maxDepth: 2,
  },
  // v0.4 multiscale with 27 channels (from issue #153)
  "v0.4/idr0054-multichannel": {
    url: "https://uk1s3.embassy.ebi.ac.uk/idr/zarr/v0.4/idr0054A/5025551.zarr",
    maxDepth: 2,
  },
  // v0.4 with coordinateTransformations including real physical scale
  "v0.4/idr0050-multiscale": {
    url: "https://uk1s3.embassy.ebi.ac.uk/idr/zarr/v0.4/idr0050A/4995115.zarr",
    maxDepth: 2,
  },
  // v0.4 bioformats2raw layout (group with nested image at /0)
  "v0.4/idr0048-bioformats2raw": {
    url: "https://uk1s3.embassy.ebi.ac.uk/idr/zarr/v0.4/idr0048A/9846151.zarr",
    maxDepth: 3,
  },
  // v0.4 multiscale with image-label metadata
  "v0.4/idr0062-with-labels": {
    url: "https://uk1s3.embassy.ebi.ac.uk/idr/zarr/v0.4/idr0062A/6001240.zarr",
    maxDepth: 3,
  },
  // v0.1 single-channel image
  "v0.1/idr0083-singlechannel": {
    url: "https://uk1s3.embassy.ebi.ac.uk/idr/zarr/v0.1/9836831.zarr",
    maxDepth: 2,
  },
  // v0.5 (zarr v3) multiscale with ome wrapper (from ome2024-ngff-challenge)
  "v0.5/idr0047-multiscale": {
    url: "https://uk1s3.embassy.ebi.ac.uk/idr/share/ome2024-ngff-challenge/4496763.zarr",
    maxDepth: 2,
  },
};

/** Zarr metadata filenames to try, in order. First hit wins per directory. */
const META_FILES = ["zarr.json", ".zattrs", ".zgroup", ".zarray"];

async function fetchJson(url: string): Promise<unknown> {
  const res = await fetch(url);
  if (!res.ok) return null;
  return res.json();
}

/** Unwrap v0.5 `ome` wrapper if present, otherwise return attrs as-is. */
function resolveAttrs(attrs: Record<string, unknown>): Record<string, unknown> {
  if ("ome" in attrs && typeof attrs.ome === "object" && attrs.ome !== null) {
    return attrs.ome as Record<string, unknown>;
  }
  return attrs;
}

function isLabelsGroup(attrs: Record<string, unknown>): attrs is { labels: string[] } {
  return "labels" in attrs && Array.isArray(attrs.labels);
}

function discoverChildren(attrs: Record<string, unknown>): string[] {
  const children: string[] = [];

  if (isMultiscales(attrs)) {
    for (const ds of attrs.multiscales[0].datasets) {
      children.push(ds.path);
    }
    // Also crawl labels if present at sibling path
    children.push("labels");
  }

  if (isLabelsGroup(attrs)) {
    for (const name of attrs.labels.slice(0, 1)) {
      children.push(name);
    }
  }

  if (isOmePlate(attrs)) {
    for (const well of attrs.plate.wells.slice(0, 2)) {
      children.push(well.path);
    }
  }

  if (isOmeWell(attrs)) {
    for (const img of attrs.well.images.slice(0, 1)) {
      children.push(img.path);
    }
  }

  // bioformats2raw layout — the image is at /0
  if ("bioformats2raw.layout" in attrs) {
    children.push("0");
  }

  return children;
}

async function crawl(
  baseUrl: string,
  prefix: string,
  depth: number,
  maxDepth: number,
  manifest: Record<string, unknown>,
) {
  let attrs: Record<string, unknown> | null = null;

  for (const file of META_FILES) {
    const data = await fetchJson(`${baseUrl}/${file}`);
    if (data !== null) {
      const key = prefix ? `${prefix}/${file}` : file;
      manifest[key] = data;
      console.log(`  ${key}`);

      // Extract attrs for child discovery
      if (attrs === null) {
        if (file === "zarr.json" && typeof data === "object" && data !== null && "attributes" in data) {
          const raw = (data as Record<string, unknown>).attributes;
          if (typeof raw === "object" && raw !== null) {
            attrs = resolveAttrs(raw as Record<string, unknown>);
          }
        } else if (file === ".zattrs") {
          attrs = resolveAttrs(data as Record<string, unknown>);
        }
      }
    }
  }

  if (depth >= maxDepth || !attrs) return;

  for (const child of discoverChildren(attrs)) {
    const childPrefix = prefix ? `${prefix}/${child}` : child;
    await crawl(`${baseUrl}/${child}`, childPrefix, depth + 1, maxDepth, manifest);
  }
}

async function main() {
  const manifest: Record<string, unknown> = {};

  for (const [name, { url, maxDepth }] of Object.entries(SOURCES)) {
    console.log(`\n${name} (${url})`);
    await crawl(url, name, 0, maxDepth, manifest);
  }

  await fs.writeFile(OUT_FILE, `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(`\nWrote ${Object.keys(manifest).length} entries to ${path.relative(process.cwd(), OUT_FILE)}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
