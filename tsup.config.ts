/**
 * @see https://tsup.egoist.dev/
 */
import { defineConfig } from "tsup";
import { basePreset } from "@stackra/tsup-config";

export default defineConfig({
  ...basePreset,
  entry: ["src/index.ts"],
  external: [
    ...Array.isArray(basePreset.external) ? basePreset.external : [],
    "@stackra/contracts",
    "@stackra/ts-container",
    "@stackra/ts-container/react",
    "@stackra/ts-support",
    "@vivtel/metadata",
    "react",
  ],
});
