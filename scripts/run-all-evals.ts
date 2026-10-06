/**
 * run-all-evals.ts — final gate batch.
 *
 * Runs the eval set for every skill in skills/, on both model tiers, at the
 * configured run count, then writes a combined report to evals/all-summary.md.
 *
 * A non-zero exit from one skill does not stop the batch. Per-skill pass rates
 * are collected instead, because a failed trigger case is a result, not an
 * error.
 *
 * Usage:
 *   bun run scripts/run-all-evals.ts
 *   bun run scripts/run-all-evals.ts --runs 3 --models opencode/qwen3.8-max,opencode-go/deepseek-v4.1-flash
 *   bun run scripts/run-all-evals.ts --only tdd,writing-for-agents
 *
 * Flags:
 *   --runs <n>          Runs per trigger query. Default: 3.
 *   --models <a,b>      Model ids. Default: the two repository eval tiers.
 *   --concurrency <n>   Parallel pi invocations per skill. Default: 6.
 *   --phase <p>         trigger, output, or all. Default: all.
 *   --only <a,b>        Restrict the batch to these skills.
 *   --timeout <ms>      Per pi invocation. Forwarded to run-evals.ts.
 */

import { readdirSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";

const ROOT = resolve(import.meta.dir, "..");
const SKILLS_DIR = join(ROOT, "skills");
const EVALS_DIR = join(ROOT, "evals");

// The two repository eval tiers: one strong arm and one fast arm.
const DEFAULT_MODELS = "opencode/qwen3.8-max,opencode-go/deepseek-v4.1-flash";

const DEFAULT_RUNS = 3;
const DEFAULT_CONCURRENCY = 6;

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

interface SkillOutcome {
  skill: string;
  exitCode: number;
  trigger: string;
  output: string;
  summaryPath: string;
}

/** Read the trigger and assertion totals from a generated summary. */
async function readOutcome(skill: string, exitCode: number): Promise<SkillOutcome> {
  const summaryPath = join(EVALS_DIR, skill, "summary.md");
  let trigger = "no summary";
  let output = "no summary";
  try {
    const text = await readFile(summaryPath, "utf8");
    trigger = text.match(/(\d+ of \d+ trigger cases pass)/)?.[1] ?? "not run";
    output = text.match(/(\d+ of \d+ assertions pass)/)?.[1] ?? "not run";
  } catch {
    // Summary missing: keep the placeholders above.
  }
  return { skill, exitCode, trigger, output, summaryPath };
}

async function runSkill(skill: string, models: string, runs: number, concurrency: number, phase: string, timeoutMs?: string): Promise<SkillOutcome> {
  const args = [
    "run",
    join(ROOT, "scripts", "run-evals.ts"),
    "--skill",
    skill,
    "--models",
    models,
    "--runs",
    String(runs),
    "--concurrency",
    String(concurrency),
    "--phase",
    phase,
  ];
  if (timeoutMs) args.push("--timeout", timeoutMs);
  process.stdout.write(`\n=== ${skill} ===\n`);
  const proc = Bun.spawn(["bun", ...args], {
    cwd: ROOT,
    stdout: "inherit",
    stderr: "inherit",
  });
  const exitCode = await proc.exited;
  return readOutcome(skill, exitCode);
}

async function main(): Promise<void> {
  const runs = Number(arg("runs") ?? DEFAULT_RUNS);
  const concurrency = Number(arg("concurrency") ?? DEFAULT_CONCURRENCY);
  const models = arg("models") ?? DEFAULT_MODELS;
  const phase = arg("phase") ?? "all";
  const timeoutMs = arg("timeout");
  const only = arg("only")
    ?.split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  let skills = readdirSync(SKILLS_DIR, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .sort();
  if (only && only.length > 0) skills = skills.filter((s) => only.includes(s));

  process.stdout.write(
    `final gate: ${skills.length} skill(s), models ${models}, runs ${runs}, phase ${phase}\n`,
  );

  const outcomes: SkillOutcome[] = [];
  for (const skill of skills) {
    outcomes.push(await runSkill(skill, models, runs, concurrency, phase, timeoutMs));
  }

  const lines = [
    "# Final gate: all skills",
    "",
    `Models: ${models}`,
    `Runs per trigger case: ${runs}`,
    "",
    "| Skill | Trigger | Output |",
    "| --- | --- | --- |",
    ...outcomes.map((o) => `| ${o.skill} | ${o.trigger} | ${o.output} |`),
    "",
    "Per-skill detail lives in `evals/<skill>/summary.md`.",
    "",
  ];
  await writeFile(join(EVALS_DIR, "all-summary.md"), lines.join("\n"), "utf8");

  process.stdout.write("\n=== final gate summary ===\n");
  for (const o of outcomes) {
    process.stdout.write(`${o.skill.padEnd(22)} trigger ${o.trigger}  |  ${o.output}\n`);
  }
  process.stdout.write(`\nwrote ${join(EVALS_DIR, "all-summary.md")}\n`);
}

await main();
