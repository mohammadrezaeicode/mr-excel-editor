import terser from "@rollup/plugin-terser";

export default {
  input: "src/mr-excel-editor.js",
  output: [
    {
      file: "dist/mr-excel-editor.min.js",
      format: "iife",
      name: "version",
      plugins: [terser()],
    },
  ],
};