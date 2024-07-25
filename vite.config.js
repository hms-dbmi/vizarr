import * as path from "node:path";

import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

/**
 * Writes a new entry point that exports contents of an existing chunk.
 * @param {string} entryPointName - Name of the new entry point
 * @param {RegExp} chunkName - Name of the existing chunk
 * @return {import("vite").Plugin}
 */
function writeEntryPoint(entryPointName, chunkName) {
  const jsFile = `${entryPointName}.js`;
  const cssFile = `${entryPointName}.css`;
  return {
    name: "write-entry-point",
    async generateBundle(_, bundle) {
      const chunk = Object.values(bundle).find((key) => key.type === "chunk" && key.fileName.match(chunkName));
      const styles = Object.values(bundle).find((key) => key.type === "asset" && key.fileName.match(chunkName));
      if (!chunk || !styles) {
        throw new Error(`Could not find chunk matching ${chunkName}`);
      }
      bundle[jsFile] = {
        fileName: jsFile,
        type: "chunk",
        code: `export * from './${chunk.fileName}';`,
      };
      bundle[cssFile] = {
        fileName: cssFile,
        type: "asset",
        source: styles.source,
      };
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), writeEntryPoint("index", /^vizarr-/)],
  base: process.env.VIZARR_PREFIX || "./",
  publicDir: path.resolve(__dirname, "assets"),
  build: {
    assetsDir: "",
    sourcemap: true,
    rollupOptions: {
      output: {
        minifyInternalExports: false,
        manualChunks: {
          vizarr: [path.resolve(__dirname, "./src/index.tsx")],
        },
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    open: `?source=${process.env.VIZARR_DATA || "https://uk1s3.embassy.ebi.ac.uk/idr/zarr/v0.1/6001253.zarr"}`,
  },
});
