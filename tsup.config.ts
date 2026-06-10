import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["cjs", "esm"],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  external: ["react", "react-dom"],
  // No rollup treeshake pass: it drops the banner directive, and consumer-side
  // tree-shaking is handled by sideEffects:false in package.json.
  banner: {
    js: '"use client";',
  },
  outExtension({ format }) {
    return { js: format === "esm" ? ".mjs" : ".js" };
  },
});
