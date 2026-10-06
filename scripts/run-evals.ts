#!/usr/bin/env bun
/**
 * run-evals.ts
 *
 * Execute one skill's eval set in two arms on one or two models.
 *
 * Arms:
 *   baseline = pi with no skills
 *   enabled  = pi with only the skill under test
 *
 * Trigger detection reads the pi JSON event stream for a read tool call whose
 * path ends with the skill's SKILL.md. Each eval runs in a fresh temporary
 * working directory with context files disabled, so the only way to find the
 * skill is its description.
 *
 * Usage:
 *   bun run scripts/run-evals.ts --skill tdd
 *   bun run scripts/run-evals.ts --skill tdd --models opencode-go/deepseek-v4.1-flash --runs 1
 *   bun run scripts/run-evals.ts --evals-dir evals/_selftest --runs 1
 *
 * Flags:
 *   --skill <name>        Skill under skills/<name>. Eval set at skills/<name>/evals/evals.json.
 *   --evals-dir <path>    Directory with evals.json and SKILL.md. Use for fixtures.
 *   --models <a,b>        Model ids. Default: the two repository eval tiers.
 *   --runs <n>            Runs per trigger query. Default: 3.
 *   --phase <p>           trigger, output, or all. Default: all.
 *   --timeout <ms>        Per pi invocation. Default: 240000.
 *   --concurrency <n>     Parallel pi invocations. Default: 4.
 *   --grade-only 1        Skip pi. Rebuild summary.md from results.json and grading.json.
 */

import { existsSync } from "node:fs";
import { cp, mkdir, mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, dirname, join, resolve } from "node:path";

const ROOT = resolve(import.meta.dir, "..");

// The two repository eval tiers: one strong arm and one fast arm.
const DEFAULT_MODELS = ["opencode/qwen3.8-max", "opencode-go/deepseek-v4.1-flash"];

// Runs per trigger query. Three balances cost against model nondeterminism.
const DEFAULT_RUNS = 3;

// A positive case passes above this rate. A negative case passes below it.
const TRIGGER_THRESHOLD = 0.5;

// Per pi invocation. A hung run is killed and reported. Seven minutes covers a
// long baseline answer without hanging the whole batch.
const DEFAULT_TIMEOUT_MS = 420_000;

// Parallel pi invocations. Four balances wall time against provider rate limits.
const DEFAULT_CONCURRENCY = 4;

// Trigger runs restrict tools to read. A baseline run then cannot search the
// filesystem and find the skill. An enabled run reads the skill from its
// injected path. Output runs keep the full tool set.
const TRIGGER_TOOLS = "read";

const PHASES = ["trigger", "output", "all"] as const;
type Phase = (typeof PHASES)[number];

interface TriggerCase {
  query: string;
  should_trigger: boolean;
  split?: "train" | "validation";
}

interface OutputCase {
  id: string;
  prompt: string;
  files?: string[];
  assertions: string[];
}

interface EvalSet {
  skill?: string;
  trigger_cases?: TriggerCase[];
  output_cases?: OutputCase[];
}

interface Config {
  skillName: string;
  skillDir: string;
  evalFile: string;
  outDir: string;
}

interface ToolCall {
  name: string;
  args: unknown;
}

interface RunResult {
  ok: boolean;
  code: number | null;
  stdout: string;
  stderr: string;
  ms: number;
  tokens: number;
  cost: number;
}

/** One model and one arm, aggregated across runs. */
interface ArmCost {
  model: string;
  arm: string;
  runs: number;
  ms: number;
  tokens: number;
  cost: number;
}

function recordCost(map: Map<string, ArmCost>, model: string, arm: string, result: RunResult): void {
  const key = `${model}|${arm}`;
  const row = map.get(key) ?? { model, arm, runs: 0, ms: 0, tokens: 0, cost: 0 };
  row.runs += 1;
  row.ms += result.ms;
  row.tokens += result.tokens;
  row.cost += result.cost;
  map.set(key, row);
}

function usage(message: string): never {
  console.error(`error: ${message}`);
  console.error("see the header of scripts/run-evals.ts for usage");
  process.exit(2);
}

function parseArgs(argv: string[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i] ?? "";
    if (!arg.startsWith("--")) usage(`unexpected argument ${arg}`);
    const key = arg.slice(2);
    const value = argv[i + 1];
    if (value === undefined || value.startsWith("--")) usage(`missing value for ${arg}`);
    out[key] = value;
    i += 1;
  }
  return out;
}

async function resolveConfig(args: Record<string, string>): Promise<Config> {
  if (args["evals-dir"]) {
    const dir = resolve(ROOT, args["evals-dir"]);
    const evalFile = join(dir, "evals.json");
    if (!existsSync(evalFile)) usage(`no evals.json in ${args["evals-dir"]}`);
    return { skillName: basename(dir), skillDir: dir, evalFile, outDir: dir };
  }
  if (!args["skill"]) usage("pass --skill <name> or --evals-dir <path>");
  const name = args["skill"];
  const skillDir = join(ROOT, "skills", name);
  const evalFile = join(skillDir, "evals", "evals.json");
  if (!existsSync(skillDir)) usage(`no skill directory skills/${name}`);
  if (!existsSync(evalFile)) usage(`no eval set at skills/${name}/evals/evals.json`);
  return { skillName: name, skillDir, evalFile, outDir: join(ROOT, "evals", name) };
}

function slug(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

/** Run pi once and return its JSONL stdout. Kills the process on timeout. */
async function runPi(params: {
  model: string;
  enabled: boolean;
  skillDir: string;
  prompt: string;
  cwd: string;
  timeoutMs: number;
  tools?: string;
}): Promise<RunResult> {
  const args = ["-nc", "-ns"];
  if (params.tools) args.push("--tools", params.tools);
  if (params.enabled) args.push("--skill", params.skillDir);
  args.push("--mode", "json", "--model", params.model, params.prompt);

  const start = Date.now();
  const proc = Bun.spawn(["pi", ...args], { cwd: params.cwd, stdout: "pipe", stderr: "pipe" });
  let killed = false;
  const timer = setTimeout(() => {
    killed = true;
    proc.kill();
  }, params.timeoutMs);

  const stdout = await new Response(proc.stdout).text();
  const stderr = await new Response(proc.stderr).text();
  const code = await proc.exited;
  clearTimeout(timer);

  if (killed) {
    console.error(`  pi timed out after ${params.timeoutMs} ms for model ${params.model}`);
  }
  const usage = sumUsage(parseJsonLines(stdout));
  return { ok: !killed && code === 0, code, stdout, stderr, ms: Date.now() - start, tokens: usage.tokens, cost: usage.cost };
}

/** Sum token and cost usage across assistant messages. */
function sumUsage(events: unknown[]): { tokens: number; cost: number } {
  let tokens = 0;
  let cost = 0;
  for (const event of events) {
    if (typeof event !== "object" || event === null) continue;
    const e = event as Record<string, unknown>;
    if (e["type"] !== "message_end") continue;
    const message = e["message"] as Record<string, unknown> | undefined;
    const usage = message?.["usage"] as Record<string, unknown> | undefined;
    if (!usage) continue;
    tokens += Number(usage["totalTokens"] ?? 0);
    const breakdown = usage["cost"] as Record<string, unknown> | undefined;
    cost += Number(breakdown?.["total"] ?? 0);
  }
  return { tokens, cost };
}

function parseJsonLines(stdout: string): unknown[] {
  const out: unknown[] = [];
  for (const line of stdout.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed.startsWith("{")) continue;
    try {
      out.push(JSON.parse(trimmed));
    } catch {
      // The stream can end mid-record when a run is killed. Skip the fragment.
    }
  }
  return out;
}

function toolCalls(events: unknown[]): ToolCall[] {
  const calls: ToolCall[] = [];
  for (const event of events) {
    if (typeof event !== "object" || event === null) continue;
    const e = event as Record<string, unknown>;
    if (e["type"] === "tool_execution_start" && typeof e["toolName"] === "string") {
      calls.push({ name: e["toolName"], args: e["args"] });
    } else if (e["type"] === "toolcall_end" && typeof e["toolCall"] === "object") {
      const tc = e["toolCall"] as Record<string, unknown>;
      if (typeof tc["name"] === "string") calls.push({ name: tc["name"], args: tc["arguments"] });
    }
  }
  return calls;
}

/** True when a read tool call loads the skill's SKILL.md. */
function triggered(events: unknown[], skillFile: string): boolean {
  const wanted = skillFile.replace(/\\/g, "/").toLowerCase();
  for (const call of toolCalls(events)) {
    if (!/^(read|view|cat)$/i.test(call.name)) continue;
    const serialized = JSON.stringify(call.args ?? "").replace(/\\/g, "/").toLowerCase();
    if (serialized.includes(wanted)) return true;
  }
  return false;
}

/** Extract the final assistant text from the JSON stream. */
function assistantText(events: unknown[]): string {
  let text = "";
  for (const event of events) {
    if (typeof event !== "object" || event === null) continue;
    const e = event as Record<string, unknown>;
    if (e["type"] !== "message_end") continue;
    const message = e["message"] as Record<string, unknown> | undefined;
    if (!message || message["role"] !== "assistant") continue;
    const content = message["content"];
    if (!Array.isArray(content)) continue;
    let turn = "";
    for (const block of content) {
      if (typeof block === "object" && block !== null && (block as Record<string, unknown>)["type"] === "text") {
        turn += String((block as Record<string, unknown>)["text"] ?? "");
      }
    }
    if (turn.trim() !== "") text = turn;
  }
  return text;
}

async function saveRaw(dir: string, file: string, stdout: string): Promise<void> {
  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, file), stdout, "utf8");
}

async function freshCwd(caseFiles: string[] | undefined): Promise<string> {
  const dir = await mkdtemp(join(tmpdir(), "skill-eval-"));
  for (const rel of caseFiles ?? []) {
    const src = resolve(ROOT, rel);
    if (!existsSync(src)) usage(`output case file not found: ${rel}`);
    // The path after "fixture/" becomes the path inside the temp cwd, so a
    // source of skills/<name>/evals/fixture/.repos/effect lands at .repos/effect.
    const marker = "fixture/";
    const at = rel.lastIndexOf(marker);
    const destRel = at >= 0 ? rel.slice(at + marker.length) : basename(rel);
    const dest = join(dir, destRel);
    await mkdir(dirname(dest), { recursive: true });
    await cp(src, dest, { recursive: true });
  }
  return dir;
}

/** Run tasks with a fixed concurrency. The result keeps input order. */
async function pool<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const results = new Array<R>(items.length);
  let next = 0;
  const worker = async (): Promise<void> => {
    for (;;) {
      const index = next;
      next += 1;
      if (index >= items.length) return;
      results[index] = await fn(items[index] as T);
    }
  };
  const workers = Array.from({ length: Math.max(1, Math.min(limit, items.length)) }, () => worker());
  await Promise.all(workers);
  return results;
}

interface TriggerScore {
  query: string;
  shouldTrigger: boolean;
  split: string;
  model: string;
  rate: number;
  passed: boolean;
}

interface TriggerTask {
  model: string;
  testCase: TriggerCase;
  run: number;
  arm: "enabled" | "baseline";
}

async function runTriggerPhase(
  config: Config,
  set: EvalSet,
  models: string[],
  runs: number,
  timeoutMs: number,
  concurrency: number,
): Promise<{ scores: TriggerScore[]; costs: ArmCost[] }> {
  const scores: TriggerScore[] = [];
  const costs = new Map<string, ArmCost>();
  const cases = set.trigger_cases ?? [];
  if (cases.length === 0) return { scores, costs: [] };
  const skillFile = resolve(config.skillDir, "SKILL.md");
  if (!existsSync(skillFile)) usage(`no SKILL.md in ${config.skillDir}`);

  for (const model of models) {
    const tasks: TriggerTask[] = [];
    for (const testCase of cases) {
      for (let run = 1; run <= runs; run += 1) {
        for (const arm of ["enabled", "baseline"] as const) tasks.push({ model, testCase, run, arm });
      }
    }
    process.stdout.write(`\ntrigger arm: ${model} (${tasks.length} calls, concurrency ${concurrency})\n`);

    const results = await pool(tasks, concurrency, async (task) => {
      const cwd = await freshCwd(undefined);
      const result = await runPi({
        model: task.model,
        enabled: task.arm === "enabled",
        skillDir: config.skillDir,
        prompt: task.testCase.query,
        cwd,
        timeoutMs,
        tools: TRIGGER_TOOLS,
      });
      const tag = `${slug(task.testCase.query).slice(0, 24)}__${slug(task.model)}__r${task.run}__${task.arm}`;
      await saveRaw(join(config.outDir, "runs", "trigger"), `${tag}.jsonl`, result.stdout);
      recordCost(costs, task.model, task.arm, result);
      return { task, hit: result.ok && triggered(parseJsonLines(result.stdout), skillFile) };
    });

    const hits = new Map<string, number>();
    for (const { task, hit } of results) {
      if (task.arm === "enabled" && hit) hits.set(task.testCase.query, (hits.get(task.testCase.query) ?? 0) + 1);
      if (task.arm === "baseline" && hit) {
        console.error(`  warning: baseline triggered for ${task.model}: ${task.testCase.query}`);
      }
    }

    for (const testCase of cases) {
      const count = hits.get(testCase.query) ?? 0;
      const rate = count / runs;
      const passed = testCase.should_trigger ? rate > TRIGGER_THRESHOLD : rate < TRIGGER_THRESHOLD;
      scores.push({
        query: testCase.query,
        shouldTrigger: testCase.should_trigger,
        split: testCase.split ?? "train",
        model,
        rate,
        passed,
      });
      process.stdout.write(`  ${testCase.should_trigger ? "pos" : "neg"} ${count}/${runs} ${passed ? "PASS" : "FAIL"}  ${testCase.query.slice(0, 60)}\n`);
    }
  }
  return { scores, costs: [...costs.values()] };
}

interface OutputTask {
  model: string;
  testCase: OutputCase;
  arm: "enabled" | "baseline";
}

async function runOutputPhase(
  config: Config,
  set: EvalSet,
  models: string[],
  timeoutMs: number,
  concurrency: number,
): Promise<{ captured: string[]; costs: ArmCost[] }> {
  const captured: string[] = [];
  const costs = new Map<string, ArmCost>();
  const cases = set.output_cases ?? [];
  if (cases.length === 0) return { captured, costs: [] };

  for (const model of models) {
    const tasks: OutputTask[] = [];
    for (const testCase of cases) {
      for (const arm of ["baseline", "enabled"] as const) tasks.push({ model, testCase, arm });
    }
    process.stdout.write(`\noutput arm: ${model} (${tasks.length} calls, concurrency ${concurrency})\n`);

    await pool(tasks, concurrency, async (task) => {
      const cwd = await freshCwd(task.testCase.files);
      const result = await runPi({
        model: task.model,
        enabled: task.arm === "enabled",
        skillDir: config.skillDir,
        prompt: task.testCase.prompt,
        cwd,
        timeoutMs,
      });
      recordCost(costs, task.model, task.arm, result);
      const tag = `${slug(task.testCase.id)}__${slug(task.model)}__${task.arm}`;
      await saveRaw(join(config.outDir, "runs", "output"), `${tag}.jsonl`, result.stdout);
      const text = assistantText(parseJsonLines(result.stdout));
      await mkdir(join(config.outDir, "outputs"), { recursive: true });
      await writeFile(join(config.outDir, "outputs", `${tag}.md`), text, "utf8");
      captured.push(`${task.testCase.id} / ${task.model} / ${task.arm}`);
      process.stdout.write(`  ${task.arm} ${task.testCase.id}  ${result.ms} ms  ${text.length} chars\n`);
    });
  }
  return { captured, costs: [...costs.values()] };
}

interface Grading {
  [caseId: string]: { [assertion: string]: { result: "PASS" | "FAIL"; evidence: string } };
}

async function loadGrading(config: Config): Promise<Grading | null> {
  const file = join(config.outDir, "grading.json");
  if (!existsSync(file)) return null;
  return JSON.parse(await readFile(file, "utf8")) as Grading;
}

function renderSummary(
  config: Config,
  set: EvalSet,
  models: string[],
  runs: number,
  scores: TriggerScore[],
  captured: string[],
  grading: Grading | null,
  costs: ArmCost[],
): string {
  const now = new Date().toISOString();
  const lines: string[] = [];
  lines.push(`# Eval summary: ${config.skillName}`);
  lines.push("");
  lines.push(`Generated: ${now}`);
  lines.push(`Models: ${models.join(", ")}`);
  lines.push(`Runs per trigger query: ${runs}`);
  lines.push("");

  lines.push("## Trigger results");
  lines.push("");
  if (scores.length === 0) {
    lines.push("No trigger cases.");
  } else {
    lines.push("| Model | Case | Should trigger | Split | Rate | Result |");
    lines.push("| --- | --- | --- | --- | --- | --- |");
    for (const s of scores) {
      lines.push(`| ${s.model} | ${s.query.replace(/\|/g, "\\|")} | ${s.shouldTrigger} | ${s.split} | ${s.rate.toFixed(2)} | ${s.passed ? "PASS" : "FAIL"} |`);
    }
    const failed = scores.filter((s) => !s.passed).length;
    lines.push("");
    lines.push(`${scores.length - failed} of ${scores.length} trigger cases pass.`);
  }
  lines.push("");

  lines.push("## Output results");
  lines.push("");
  if (captured.length === 0) {
    lines.push("No output cases.");
  } else if (!grading) {
    lines.push("Outputs captured and ungraded. Add grading.json to score assertions.");
    for (const c of captured) lines.push(`- ${c}`);
  } else {
    let pass = 0;
    let total = 0;
    for (const testCase of set.output_cases ?? []) {
      const graded = grading[testCase.id];
      if (!graded) {
        lines.push(`### ${testCase.id}: ungraded`);
        continue;
      }
      lines.push(`### ${testCase.id}`);
      for (const assertion of testCase.assertions) {
        const result = graded[assertion];
        total += 1;
        if (result?.result === "PASS") pass += 1;
        lines.push(`- ${result?.result ?? "FAIL"}: ${assertion}`);
        if (result?.evidence) lines.push(`  - evidence: ${result.evidence}`);
      }
      lines.push("");
    }
    lines.push(`${pass} of ${total} assertions pass.`);
  }
  lines.push("");

  lines.push("## Cost per arm");
  lines.push("");
  if (costs.length === 0) {
    lines.push("No runs recorded.");
  } else {
    lines.push("| Model | Arm | Runs | Avg time (ms) | Tokens | Est. cost (USD) |");
    lines.push("| --- | --- | --- | --- | --- | --- |");
    for (const c of costs.sort((a, b) => a.model.localeCompare(b.model) || a.arm.localeCompare(b.arm))) {
      lines.push(`| ${c.model} | ${c.arm} | ${c.runs} | ${Math.round(c.ms / c.runs)} | ${c.tokens} | ${c.cost.toFixed(6)} |`);
    }
  }
  lines.push("");
  return lines.join("\n");
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  const config = await resolveConfig(args);
  const set = JSON.parse(await readFile(config.evalFile, "utf8")) as EvalSet;

  const models = (args["models"] ?? DEFAULT_MODELS.join(",")).split(",").map((m) => m.trim()).filter(Boolean);
  const runs = Number(args["runs"] ?? DEFAULT_RUNS);
  const phase = (args["phase"] ?? "all") as Phase;
  const timeoutMs = Number(args["timeout"] ?? DEFAULT_TIMEOUT_MS);
  const concurrency = Number(args["concurrency"] ?? DEFAULT_CONCURRENCY);

  if (!PHASES.includes(phase)) usage(`unknown phase ${phase}`);
  if (!Number.isInteger(runs) || runs < 1) usage(`--runs must be a positive integer`);
  if (!Number.isFinite(timeoutMs) || timeoutMs < 1000) usage(`--timeout must be at least 1000 ms`);
  if (!Number.isInteger(concurrency) || concurrency < 1) usage(`--concurrency must be a positive integer`);
  if (models.length === 0) usage(`--models must list at least one model id`);

  const gradeOnly = (args["grade-only"] ?? "") !== "" && args["grade-only"] !== "0" && args["grade-only"] !== "false";
  process.stdout.write(`eval: ${config.skillName}\nmodels: ${models.join(", ")}\nruns: ${runs}\nphase: ${phase}\nconcurrency: ${concurrency}\n`);

  let scores: TriggerScore[];
  let captured: string[];
  let costs: ArmCost[];

  if (gradeOnly) {
    const resultsFile = join(config.outDir, "results.json");
    if (!existsSync(resultsFile)) usage("--grade-only needs a prior results.json; run the eval first");
    const prior = JSON.parse(await readFile(resultsFile, "utf8")) as { scores: TriggerScore[]; captured: string[]; costs: ArmCost[] };
    scores = prior.scores;
    captured = prior.captured;
    costs = prior.costs;
    process.stdout.write(`grade-only: loaded ${resultsFile}\n`);
  } else {
    const trigger = phase === "output" ? { scores: [], costs: [] as ArmCost[] } : await runTriggerPhase(config, set, models, runs, timeoutMs, concurrency);
    const output = phase === "trigger" ? { captured: [], costs: [] as ArmCost[] } : await runOutputPhase(config, set, models, timeoutMs, concurrency);
    scores = trigger.scores;
    captured = output.captured;
    costs = [...trigger.costs, ...output.costs];
    await mkdir(config.outDir, { recursive: true });
    await writeFile(
      join(config.outDir, "results.json"),
      JSON.stringify({ skill: config.skillName, generated: new Date().toISOString(), models, runs, phase, scores, captured, costs }, null, 2),
      "utf8",
    );
  }

  const grading = await loadGrading(config);
  await mkdir(config.outDir, { recursive: true });
  await writeFile(join(config.outDir, "summary.md"), renderSummary(config, set, models, runs, scores, captured, grading, costs), "utf8");

  const failed = scores.filter((s) => !s.passed).length;
  process.stdout.write(`\nwrote ${join(config.outDir, "summary.md")}\n`);
  process.stdout.write(`trigger: ${scores.length - failed}/${scores.length} pass; output captured: ${captured.length}\n`);
  process.exit(failed > 0 ? 1 : 0);
}

await main();
