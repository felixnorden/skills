#!/usr/bin/env bun
/**
 * vitest-skill.manifest.ts
 *
 * The input contract for the vitest-skill generator: for each of the eleven
 * diagnosis jobs, the leaf it produces, the routing rows it serves, the pinned
 * docs it reads, the heading order of the leaf, and the boundary clause.
 *
 * Run: bun run scripts/vitest-skill.manifest.ts
 *
 * Prints one self-check line and exits 1 when the manifest is not a valid
 * generator input.
 */

// The pinned documentation surface. The tag is resolved to a commit by the
// extractor's --fetch mode, never by this file, so the pin stays a tag here.
export const PIN = { repo: "vitest-dev/vitest", tag: "v5.1.1" };

// One diagnosis job. `docs` are pinned-tree paths relative to docs/, verified
// against the tag by --fetch. `rows` are the SKILL.md routing rows the leaf
// serves, so a row number appears in exactly one job.
export interface LeafJob {
  leaf: string;
  rows: number[];
  docs: string[];
  headings: string[];
  boundary: string;
}

// Fewer docs than this and a leaf states a behaviour without a citable page.
const MIN_DOCS_PER_JOB = 3;

// Fewer headings than this and a leaf cannot reach the four sections G3 needs.
const MIN_HEADINGS_PER_JOB = 4;

// The outline sizes the manifest at 36 distinct docs across the eleven jobs.
// The per-job floor alone allows 33, so the total is asserted separately.
const MIN_DISTINCT_DOCS = 36;

export const MANIFEST: LeafJob[] = [
  {
    leaf: "local-vs-ci",
    rows: [1],
    docs: [
      "config/index.md",
      "config/allowonly.md",
      "config/update.md",
      "config/watch.md",
      "config/reporters.md",
      "guide/cli.md",
      "guide/reporters.md",
    ],
    headings: [
      "# Local and CI",
      "## Contents",
      "## Checks in cost order",
      "## Selection differs in CI",
      "## Update mode differs in CI",
      "## Watch mode falls back to a run",
      "## Where reports and artifacts land",
      "## Defaults that read the environment",
    ],
    boundary:
      "Explains that a setting resolves differently in a pipeline; does not act on a stale snapshot and does not diagnose order dependence.",
  },
  {
    leaf: "flakiness",
    rows: [2, 3, 17],
    docs: [
      "config/sequence.md",
      "config/isolate.md",
      "config/repeats.md",
      "config/cache.md",
      "config/detectasyncleaks.md",
      "config/fileparallelism.md",
      "config/setupfiles.md",
      "guide/parallelism.md",
      "guide/recipes/disable-isolation.md",
      "guide/recipes/db-transaction.md",
      "guide/migration/index.md",
    ],
    headings: [
      "# Flakiness and order dependence",
      "## Contents",
      "## Reproduce before diagnosing",
      "## Order dependence",
      "## Isolation and shared module state",
      "## Per-worker state",
      "## When it is not order",
      "## Schedule knobs and what each one hides",
    ],
    boundary:
      "Diagnoses order and state only; the mock lifecycle appears as a check, clock control is not covered, and worker-count tuning is not covered.",
  },
  {
    leaf: "mocking",
    rows: [4, 5, 6],
    docs: [
      "guide/mocking.md",
      "guide/mocking/modules.md",
      "guide/mocking/classes.md",
      "guide/mocking/functions.md",
      "config/clearmocks.md",
      "config/mockreset.md",
      "config/restoremocks.md",
      "config/unstubglobals.md",
      "config/unstubenvs.md",
      "config/browser/importmapmocks.md",
      "api/vi.md",
      "guide/migration/index.md",
    ],
    headings: [
      "# Mocking behaviour",
      "## Contents",
      "## Mock lifecycle",
      "## Hoisting",
      "## Per-argument return values",
      "## Module and class mocks",
      "## When it is not a mock problem",
    ],
    boundary:
      "Diagnoses the mock lifecycle and hoisting only; isolation and shuffle are not covered, and clock faking belongs to the timers job.",
  },
  {
    leaf: "filtering",
    rows: [7],
    docs: [
      "guide/filtering.md",
      "guide/cli.md",
      "config/testnamepattern.md",
      "config/projects.md",
      "config/changed.md",
      "guide/projects.md",
      "guide/recipes/affected-tests.md",
    ],
    headings: [
      "# Running and filtering",
      "## Contents",
      "## One file",
      "## One test",
      "## One project",
      "## Changed, last-failed, and since-last-run",
      "## List without running",
      "## When the filter matches nothing",
    ],
    boundary:
      "Selects an existing project; does not explain why the project set is what it is and does not measure what a run costs.",
  },
  {
    leaf: "config-and-projects",
    rows: [8, 9],
    docs: [
      "config/index.md",
      "config/projects.md",
      "config/setupfiles.md",
      "config/sharedviteserver.md",
      "config/globals.md",
      "config/environment.md",
      "config/typecheck.md",
      "config/server.md",
      "guide/projects.md",
      "guide/environment.md",
      "guide/testing-types.md",
    ],
    headings: [
      "# Configuration and projects",
      "## Contents",
      "## Which config is read",
      "## Projects",
      "## Inheritance and the shared server",
      "## Globals and matcher types",
      "## Environment per file",
      "## Keys answered elsewhere",
    ],
    boundary:
      "Defines what applies and where; does not diagnose order dependence, does not tune pool or worker cost, and does not manage browser keys.",
  },
  {
    leaf: "timers-and-async",
    rows: [10, 11],
    docs: [
      "guide/mocking/timers.md",
      "config/faketimers.md",
      "guide/recipes/wait-for.md",
      "api/expect.md",
      "config/testtimeout.md",
      "config/hooktimeout.md",
      "guide/learn/async.md",
    ],
    headings: [
      "# Timers and async assertions",
      "## Contents",
      "## The clock does not move",
      "## What is faked",
      "## Proving an async outcome",
      "## Assertions that pass without checking anything",
      "## When the nondeterminism is not the clock",
    ],
    boundary:
      "Diagnoses clock control and awaited proof; repetition and ordering are not covered, and the mock lifecycle is not covered.",
  },
  {
    leaf: "snapshots",
    rows: [12, 13],
    docs: [
      "guide/snapshot.md",
      "config/update.md",
      "config/snapshotformat.md",
      "config/snapshotserializers.md",
      "config/resolvesnapshotpath.md",
      "config/expandsnapshotdiff.md",
      "config/tasktitlevalueformattruncate.md",
      "guide/browser/visual-regression-testing.md",
      "guide/learn/snapshots.md",
    ],
    headings: [
      "# Snapshots and inspected output",
      "## Contents",
      "## Update modes",
      "## Obsolete snapshots",
      "## Inspected output shape",
      "## File and image snapshots",
      "## When the output changed because behaviour changed",
    ],
    boundary:
      "States present lifecycle behaviour only; carries no rename inventory and does not explain why a setting resolves differently in a pipeline.",
  },
  {
    leaf: "coverage",
    rows: [14],
    docs: ["guide/coverage.md", "config/coverage.md", "config/reporters.md"],
    headings: [
      "# Coverage",
      "## Contents",
      "## What is counted",
      "## Thresholds",
      "## Reading a truncated report",
      "## Coverage is not a quality goal",
    ],
    boundary:
      "Diagnoses report contents and thresholds; does not measure instrumentation cost and does not teach what deserves a test.",
  },
  {
    leaf: "performance",
    rows: [15],
    docs: [
      "guide/improving-performance.md",
      "guide/profiling-test-performance.md",
      "guide/advanced/pool.md",
      "guide/benchmarking.md",
      "guide/advanced/benchmark-provider.md",
      "config/pool.md",
      "config/maxworkers.md",
      "config/fsmodulecache.md",
      "config/benchmark.md",
    ],
    headings: [
      "# Performance",
      "## Contents",
      "## Find where the time goes",
      "## One axis at a time",
      "## Benchmarks",
      "## Reading a benchmark result",
      "## When selection is the real fix",
    ],
    boundary:
      "Measures per-run cost and benchmark output; does not select tests and does not diagnose coverage thresholds.",
  },
  {
    leaf: "browser-mode",
    rows: [16],
    docs: [
      "guide/browser/index.md",
      "guide/browser/component-testing.md",
      "guide/browser/multiple-setups.md",
      "guide/browser/playwright-traces.md",
      "guide/browser/trace-view.md",
      "guide/browser/why.md",
      "api/browser/locators.md",
      "api/browser/assertions.md",
      "api/browser/context.md",
      "api/browser/commands.md",
      "config/browser/provider.md",
      "config/browser/locators.md",
      "config/browser/playwright.md",
      "config/browser/preview.md",
      "config/browser/trace.md",
      "guide/recipes/browser-locators.md",
    ],
    headings: [
      "# Browser mode",
      "## Contents",
      "## Install a provider",
      "## Instance and API",
      "## Locators",
      "## Locator strictness",
      "## Browser assertions",
      "## Component setup",
      "## Inspect the failure",
      "## What this leaf does not cover",
    ],
    boundary:
      "Diagnoses element lookup and its assertions; does not configure projects or environments, and teaches no framework-specific component setup.",
  },
  {
    leaf: "migration",
    rows: [18],
    docs: [
      "guide/migration/index.md",
      "guide/migration/jest.md",
      "guide/migration/mocha.md",
      "guide/common-errors.md",
      "releases.md",
      "config/browser/webdriverio.md",
    ],
    headings: [
      "# Migration",
      "## Contents",
      "## Prerequisites",
      "## Defaults that flipped",
      "## Renames and removals",
      "## Behaviour changes with no key",
      "## Packages that moved",
      "## From Jest",
    ],
    boundary:
      "States each change with its replacement in one line; runs no check-and-fix loop and does not diagnose a symptom.",
  },
];

function documents(): string[] {
  return [...new Set(MANIFEST.flatMap((job) => job.docs))].sort();
}

function problems(): string[] {
  const out: string[] = [];
  const leaves = new Set<string>();
  for (const job of MANIFEST) {
    if (leaves.has(job.leaf)) out.push(`duplicate leaf ${job.leaf}`);
    leaves.add(job.leaf);
    if (job.docs.length < MIN_DOCS_PER_JOB) out.push(`${job.leaf} has ${job.docs.length} docs`);
    if (job.headings.length < MIN_HEADINGS_PER_JOB) out.push(`${job.leaf} has ${job.headings.length} headings`);
    if (job.boundary.trim() === "") out.push(`${job.leaf} has an empty boundary`);
  }
  const docs = documents().length;
  if (docs < MIN_DISTINCT_DOCS) out.push(`${docs} distinct docs, under ${MIN_DISTINCT_DOCS}`);
  return out;
}

if (import.meta.main) {
  const jobs = MANIFEST.length;
  const leaves = new Set(MANIFEST.map((job) => job.leaf)).size;
  const headings = MANIFEST.reduce((sum, job) => sum + job.headings.length, 0);
  const contents = MANIFEST.filter((job) => job.headings.includes("## Contents")).length;
  const boundaries = MANIFEST.filter((job) => job.boundary.trim() !== "").length;
  console.log(
    `jobs=${jobs} leaves=${leaves} docs=${documents().length} headings=${headings} contents=${contents} boundary=${boundaries}`,
  );
  const found = problems();
  if (found.length > 0) {
    for (const problem of found) console.error(problem);
    process.exit(1);
  }
}
