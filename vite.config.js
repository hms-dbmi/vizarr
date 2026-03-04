// @ts-check
import * as path from "node:path";
import * as fs from "node:fs/promises";

import react from "@vitejs/plugin-react";
import * as vite from "vite";

/**
 * Make an assertion.
 *
 * @param {unknown} expression - The expression to test.
 * @param {string=} msg - The optional message to display if the assertion fails.
 * @returns {asserts expression}
 * @throws an {@link Error} if `expression` is not truthy.
 */
function assert(expression, msg = "") {
  if (!expression) throw new Error(msg);
}

/**
 * Writes a new entry point that exports contents of an existing chunk.
 * @param {string} entryPointName - Name of the new entry point
 * @param {RegExp} chunkName - Name of the existing chunk
 * @returns {vite.Plugin}
 */
function writeEntryPoint(entryPointName, chunkName) {
  /** @type {string | undefined} */
  let outDir;
  return {
    name: "write-entry-point",
    configResolved(config) {
      outDir = path.resolve(config.root, config.build.outDir);
    },
    async writeBundle(_, bundle) {
      const chunk = Object.keys(bundle).find((key) => key.match(chunkName));
      assert(chunk, `Could not find chunk matching ${chunkName}`);
      assert(outDir, `Exepcted outDir to be set in "configResolved" hook`);
      await fs.writeFile(path.join(outDir, entryPointName), `export * from './${chunk}';\n`);
    },
  };
}

export default vite.defineConfig({
  plugins: [react(), writeEntryPoint("index.js", /^vizarr-/)],
  base: process.env.VIZARR_PREFIX || "./",
  publicDir: path.resolve(__dirname, "assets"),
  build: {
    assetsDir: "",
    sourcemap: true,
    rolldownOptions: {
      output: {
        minifyInternalExports: false,
        manualChunks(id) {
          if (id === path.resolve(__dirname, "src/index.tsx")) {
            return "vizarr";
          }
        },
      },
    },
  },
  server: {
    open: `?source=${process.env.VIZARR_DATA || "https://uk1s3.embassy.ebi.ac.uk/idr/zarr/v0.1/6001253.zarr"}`,
  },
});
