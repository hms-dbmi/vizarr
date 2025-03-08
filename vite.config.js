import * as path from "node:path";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

/**
 * Writes a new entry point that exports contents of an existing chunk.
 * @param {string} entryPointName - Name of the new entry point
 * @param {RegExp} chunkName - Name of the existing chunk
 */
function writeEntryPoint(entryPointName, chunkName) {
  return {
    name: "write-entry-point",
    async generateBundle(_, bundle) {
      const chunk = Object.keys(bundle).find((key) => key.match(chunkName));
      if (!chunk) {
        throw new Error(`Could not find chunk matching ${chunkName}`);
      }
      bundle[entryPointName] = {
        fileName: entryPointName,
        type: "chunk",
        code: `export * from './${chunk}';`,
      };
    },
  };
}

export default defineConfig({
  plugins: [react(), writeEntryPoint("index.js", /^vizarr-/)],
  base: process.env.VIZARR_PREFIX || "./",
  publicDir: path.resolve(__dirname, "assets"),
  build: {
    assetsDir: "",
    sourcemap: true,
    rollupOptions: {
      output: {
        minifyInternalExports: false,
        manualChunks: {
          vizarr: [path.resolve(__dirname, "src/index.tsx")],
        },
      },
    },
  },
  server: {
    open: `?source=${process.env.VIZARR_DATA || "https://uk1s3.embassy.ebi.ac.uk/idr/zarr/v0.1/6001253.zarr"}`,
  },
});
