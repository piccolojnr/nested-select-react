import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import terser from "@rollup/plugin-terser";
import { createRequire } from "module";

// Use createRequire to import JSON in ESM context
const require = createRequire(import.meta.url);
const pkg = require("./package.json");
// console.log(pkg);

export default {
  input: "src/index.ts",
  output: [
    {
      file: pkg.main,
      format: "cjs",
      sourcemap: true,
    },
    {
      file: pkg.module,
      format: "esm",
      sourcemap: true,
    },
  ],
  external: ["react", "react-dom", "lucide-react"],
  plugins: [
    resolve(),
    commonjs(),
    typescript({
      tsconfig: "./tsconfig.rollup.json", // Use Rollup-specific config
      declaration: false,
      declarationDir: undefined,
    }),
    terser(),
  ],
};
