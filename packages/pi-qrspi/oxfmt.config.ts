import { defineConfig } from "oxfmt";

export default defineConfig({
  semi: true,
  trailingComma: "all",
  ignorePatterns: ["skills/**", "dist/**", "node_modules/**"],
});
