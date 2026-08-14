import { defineConfig } from "oxlint";

/**
 * oxlint configuration.
 *
 * Correctness failures break the build; suspicious and perf issues warn.
 * The `skills/` symlink and build output are excluded.
 */
export default defineConfig({
  categories: {
    correctness: "error",
    suspicious: "warn",
    perf: "warn",
  },
  ignorePatterns: ["dist/**", "node_modules/**", "skills/**"],
});
