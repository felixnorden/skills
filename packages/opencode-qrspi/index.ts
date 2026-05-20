import type { Config, Plugin } from "@opencode-ai/plugin";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { commands } from "./commands";
import { agents, mergePermission } from "./agents";
import { isSome, redirect, matchQrspiPath } from "./events";

const currentDir = dirname(fileURLToPath(import.meta.url));

export const qrspi: Plugin = async ({ worktree, client }) => {
  return {
    async config(input) {
      loadCommands(input);
      loadSkills(input);
      loadAgents(input);
    },
    "tool.execute.before": async ({ tool }, output) => {
      // Redirect all QRSPI document paths to always live in the root `.opencode/<artifact>` directory
      if (tool === "write" || tool === "edit" || tool === "read") {
        const filePath = String(output.args.filePath);
        const newPath = redirect(filePath, worktree, matchQrspiPath);
        if (isSome(newPath)) {
          client.app.log({
            body: {
              service: "qrspi",
              level: "info",
              message: `Redirecting ${tool} to ${newPath.value}`,
            },
          });
          output.args.filePath = join(newPath.value);
        }
      }
    },
  };
};

function loadCommands(input: Config) {
  input.command ??= {};
  for (const [cmd, cfg] of Object.entries(commands)) {
    input.command[cmd] = cfg;
  }
}

function loadSkills(input: Config) {
  // @ts-expect-error - Missing skills types in Config
  input.skills ??= {};
  // @ts-expect-error - Missing skills types in Config
  input.skills.paths ??= [];

  const planningSkillDir = join(currentDir, "../../skills/planning-workflow/");
  // @ts-expect-error - Missing skills types in Config
  input.skills.paths.push(planningSkillDir);

  const tddSkillDir = join(currentDir, "../../skills/tdd/");
  // @ts-expect-error - Missing skills types in Config
  input.skills.paths.push(tddSkillDir);
}

function loadAgents(input: Config) {
  input.agent ??= {};
  for (const [agent, cfg] of Object.entries(agents)) {
    const { permission, ...rest } = cfg;
    // Prioritise existing configs for non-intrusive overrides
    const config = { ...rest, ...input.agent[agent] };
    config.permission ??= {};
    // Add in permissions to ensure that QRSPI works as expected
    for (const [p, v] of Object.entries(permission)) {
      // @ts-expect-error - Outdated type for permissions and tools
      config.permission[p] = mergePermission(config.permission?.[p], v);
    }
    input.agent[agent] = config;
  }
}
