import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    // The arcade games drive canvas rendering from a mutable useRef game
    // state inside a requestAnimationFrame loop (see lib/useGameLoop.ts) —
    // the standard, performant pattern for this, but incompatible with the
    // React Compiler's strict immutability assumptions. These components
    // are plain client-side game loops, not compiler memoization targets.
    files: ["components/games/**/*.tsx"],
    rules: {
      "react-hooks/immutability": "off",
    },
  },
]);

export default eslintConfig;
