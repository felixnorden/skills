#!/usr/bin/env bun
/**
 * vitest-skill.extract.ts
 *
 * Deterministic extractor for the vitest skill. Reads one leaf's pinned docs and
 * returns a fact sheet: every doc with a sha256 digest, the leaf's heading order,
 * and one fact bullet per documented behaviour, each carrying a vitest.dev/
 * citation. Fact sheets are cache-only; nothing here is committed.
 *
 * Run:
 *   bun run scripts/vitest-skill.extract.ts --fetch
 *   bun run scripts/vitest-skill.extract.ts --leaf <leaf> [--docs-dir <dir>]
 *   bun run scripts/vitest-skill.extract.ts --facts <leaf>
 *   bun run scripts/vitest-skill.extract.ts --write-lock scripts/vitest-skill.lock.json
 *   bun run scripts/vitest-skill.extract.ts --check
 *
 * Flags:
 *   --fetch            resolve the pinned tag, verify every manifest doc path
 *                      against the pinned tree, and fill the docs cache
 *   --leaf <leaf>      print one fact sheet as JSON
 *   --facts <leaf>     print one fact sheet for review
 *   --docs-dir <dir>   read docs from <dir> instead of the cache (offline runs)
 *   --write-lock <p>   write the provenance lock from the cache, sorted by path
 *   --check            re-fetch the pin, compare digests, exit 1 on drift
 *   --changed-leaves   name the leaves a pin bump makes stale, exit 1 on drift
 */

import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";

import { MANIFEST, PIN, type LeafJob } from "./vitest-skill.manifest.ts";

const ROOT = resolve(import.meta.dir, "..");

// Fetched docs live here and are never committed. The cache also records the
// resolved commit, so a later --write-lock needs no network.
const CACHE_DIR = join(ROOT, ".vitest-docs");
const CACHE_DOCS = join(CACHE_DIR, "docs");
const PIN_FILE = join(CACHE_DIR, "pin.json");

// The default provenance lock, at repository level so it sits next to the code
// that reads it and outside the skill, where G4 bans four-digit years.
const LOCK_FILE = join(ROOT, "scripts", "vitest-skill.lock.json");

const API_BASE = "https://api.github.com";
const RAW_BASE = "https://raw.githubusercontent.com";

// House-banned vocabulary, the same expression G4 scans the skill with. A doc
// line that carries one of these words never becomes a fact bullet.
const BANNED_PATTERN =
  /(^|[^0-9])20[0-9][0-9]([^0-9]|$)|deprecated|currently|as of|latest version/i;

// Shorter lines are markup leftovers (tables, labels, anchors), not behaviours.
const MIN_FACT_CHARS = 20;

// One fact bullet per documented behaviour, capped per page so a skeleton stays
// reviewable. 48 keeps a padded page long enough to exercise the table-of-contents
// rule while staying reviewable by hand.
const MAX_FACTS_PER_DOC = 48;

export interface FactDoc {
  path: string;
  /** `sha256:<hex>` for a doc that was read; empty for a doc that is absent. */
  sha256: string;
}

export interface Fact {
  text: string;
  /** Heading of the doc section the fact came from. */
  section: string;
  /** Doc path relative to docs/. */
  source: string;
  citation: string;
}

export interface CodeBlock {
  lang: string;
  body: string;
  section: string;
  source: string;
}

export interface FactSheet {
  leaf: string;
  docs: FactDoc[];
  headings: string[];
  facts: Fact[];
  code: CodeBlock[];
}

/** Every distinct doc path across the eleven manifest jobs, sorted. */
export function pinnedDocs(): string[] {
  return [...new Set(MANIFEST.flatMap((job) => job.docs))].sort();
}

/** The manifest job for one leaf, or a message naming the valid leaves. */
export function jobFor(leaf: string): LeafJob {
  const job = MANIFEST.find((entry) => entry.leaf === leaf);
  if (!job) {
    const known = MANIFEST.map((entry) => entry.leaf).join(", ");
    throw new Error(`no manifest job for leaf "${leaf}"; leaves are ${known}`);
  }
  return job;
}

/**
 * Citation form of a doc path: `docs/config/index.md` is `vitest.dev/config`,
 * `docs/guide/cli.md` is `vitest.dev/guide/cli`. Anchors are never part of it.
 */
export function citationFor(path: string): string {
  const withoutSuffix = path.replace(/\.md$/, "");
  const withoutIndex = withoutSuffix.replace(/\/index$/, "");
  return `vitest.dev/${withoutIndex}`;
}

interface RawSection {
  heading: string;
  facts: string[];
  code: { lang: string; body: string }[];
}

/** Strip list markers, link syntax, and heading anchors from one doc line. */
function cleanLine(raw: string): string {
  return raw
    .trim()
    .replace(/^[-*+]\s+/, "")
    .replace(/^>\s*/, "")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\{#[^}]*\}/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** True when a line is documentation prose, not markup, a table, or a label. */
function isProseLine(raw: string): boolean {
  const line = raw.trim();
  if (line === "") return false;
  if (/^#{1,6}\s/.test(line)) return false;
  if (/^(:::|<|\||!\[|---|```)/.test(line)) return false;
  return true;
}

/** True when a line is a standalone list item rather than a paragraph line. */
function isListLine(raw: string): boolean {
  return /^(?:[-*+]|\d+\.)\s+/.test(raw.trim());
}

/**
 * Split one doc page into sections of fact lines and fenced code blocks. Prose
 * lines are joined into paragraphs, so a wrapped sentence stays one fact.
 */
function parseDoc(text: string): RawSection[] {
  const lines = text.split("\n");
  const sections: RawSection[] = [];
  const seen = new Set<string>();
  let current: RawSection = { heading: "", facts: [], code: [] };
  sections.push(current);
  let fence: { lang: string; body: string[] } | null = null;
  let paragraphs: string[] = [];

  const addFact = (raw: string): void => {
    const fact = cleanLine(raw);
    if (fact.length < MIN_FACT_CHARS) return;
    if (BANNED_PATTERN.test(fact)) return;
    if (seen.has(fact)) return;
    seen.add(fact);
    current.facts.push(fact);
  };
  const flush = (): void => {
    if (paragraphs.length === 0) return;
    const paragraph = paragraphs.join(" ");
    paragraphs = [];
    addFact(paragraph);
  };

  let body = 0;
  while (body < lines.length) {
    const line = lines[body] ?? "";
    if (body === 0 && line.trim() === "---") {
      body += 1;
      while (body < lines.length && (lines[body] ?? "").trim() !== "---") body += 1;
      body += 1;
      continue;
    }
    const fenceMatch = /^```(\S*)/.exec(line.trim());
    if (fenceMatch) {
      flush();
      if (fence) {
        current.code.push({ lang: fence.lang, body: fence.body.join("\n") });
        fence = null;
      } else {
        fence = { lang: fenceMatch[1] ?? "", body: [] };
      }
      body += 1;
      continue;
    }
    if (fence) {
      fence.body.push(line);
      body += 1;
      continue;
    }
    const headingMatch = /^#{1,4}\s+(.*)$/.exec(line.trim());
    if (headingMatch) {
      flush();
      current = {
        heading: (headingMatch[1] ?? "").replace(/\{#[^}]*\}/g, "").trim(),
        facts: [],
        code: [],
      };
      sections.push(current);
      body += 1;
      continue;
    }
    if (!isProseLine(line)) {
      flush();
      body += 1;
      continue;
    }
    if (isListLine(line)) {
      flush();
      addFact(line);
      body += 1;
      continue;
    }
    paragraphs.push(line.trim());
    body += 1;
  }
  flush();
  return sections.filter((section) => section.facts.length > 0 || section.code.length > 0);
}

/** Read one leaf's doc set into a fact sheet. Pure file reads, no network. */
export async function extractFactSheet(leaf: string, docsDir: string): Promise<FactSheet> {
  const job = jobFor(leaf);
  const docs: FactDoc[] = [];
  const facts: Fact[] = [];
  const code: CodeBlock[] = [];
  for (const path of job.docs) {
    const file = join(docsDir, path);
    if (!existsSync(file)) {
      docs.push({ path, sha256: "" });
      continue;
    }
    const bytes = await readFile(file);
    docs.push({
      path,
      sha256: `sha256:${createHash("sha256").update(bytes).digest("hex")}`,
    });
    for (const section of parseDoc(bytes.toString("utf8"))) {
      for (const text of section.facts) {
        if (facts.filter((fact) => fact.source === path).length >= MAX_FACTS_PER_DOC) break;
        facts.push({ text, section: section.heading, source: path, citation: citationFor(path) });
      }
      for (const block of section.code) {
        code.push({ ...block, section: section.heading, source: path });
      }
    }
  }
  return { leaf: job.leaf, docs, headings: job.headings, facts, code };
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    headers: { accept: "application/vnd.github+json", "user-agent": "vitest-skill-generator" },
  });
  if (!response.ok) {
    throw new Error(`${url} returned ${response.status} ${response.statusText}`);
  }
  return (await response.json()) as T;
}

/** Resolve the pinned tag to the commit it points at. */
async function resolveCommit(): Promise<string> {
  const ref = await fetchJson<{ object: { sha: string; type: string; url: string } }>(
    `${API_BASE}/repos/${PIN.repo}/git/refs/tags/${PIN.tag}`,
  );
  let commit = ref.object.sha;
  if (ref.object.type === "tag") {
    const tag = await fetchJson<{ object: { sha: string } }>(ref.object.url);
    commit = tag.object.sha;
  }
  if (!/^[0-9a-f]{40}$/.test(commit)) {
    throw new Error(`tag ${PIN.tag} did not resolve to a commit; got "${commit}"`);
  }
  return commit;
}

/** sha256 digest of one document, in the lock's `sha256:<hex>` form. */
function digest(bytes: Uint8Array): string {
  return `sha256:${createHash("sha256").update(bytes).digest("hex")}`;
}

export interface Lock {
  tag: string;
  commit: string;
  docs: { path: string; sha256: string }[];
  leaves: string[];
}

/**
 * Differences between a lock and the pin and manifest the generator reads
 * today. Empty when the lock still describes this manifest. Pure: the commit
 * is passed in, because only the caller resolves it over the network.
 */
export function lockProblems(lock: Lock, commit: string): string[] {
  const out: string[] = [];
  if (lock.tag !== PIN.tag) {
    out.push(`lock tag ${lock.tag} does not match PIN.tag ${PIN.tag}`);
  }
  if (lock.commit !== commit) {
    out.push(`lock commit ${lock.commit} does not match ${commit.slice(0, 7)}`);
  }
  const wanted = pinnedDocs();
  const locked = lock.docs.map((doc) => doc.path);
  for (const doc of wanted) {
    if (!locked.includes(doc)) out.push(`lock is missing manifest doc: docs/${doc}`);
  }
  for (const doc of locked) {
    if (!wanted.includes(doc)) out.push(`lock names a doc outside the manifest: docs/${doc}`);
  }
  const leaves = MANIFEST.map((job) => `skills/vitest/references/${job.leaf}.md`).sort();
  if (lock.leaves.join("\n") !== leaves.join("\n")) {
    out.push(
      `lock leaves do not match the manifest: ${lock.leaves.length} in the lock, ${leaves.length} in the manifest`,
    );
  }
  return out;
}

/** Write the provenance lock from the cache. Deterministic: docs are sorted. */
export async function writeLock(path: string): Promise<void> {
  const pin = JSON.parse(await readFile(PIN_FILE, "utf8")) as { tag: string; commit: string };
  const docs: { path: string; sha256: string }[] = [];
  for (const doc of pinnedDocs()) {
    const file = join(CACHE_DOCS, doc);
    if (!existsSync(file)) {
      throw new Error(`cache is missing docs/${doc}; run --fetch first`);
    }
    docs.push({ path: doc, sha256: digest(await readFile(file)) });
  }
  const leaves = MANIFEST.map((job) => `skills/vitest/references/${job.leaf}.md`).sort();
  const lock: Lock = { tag: pin.tag, commit: pin.commit, docs, leaves };
  await writeFile(path, `${JSON.stringify(lock, null, 2)}\n`);
  console.log(`wrote ${path}: tag=${lock.tag} commit=${lock.commit} docs=${docs.length} leaves=${leaves.length}`);
}

/** Locked docs whose bytes at the resolved commit no longer match. */
interface Drift {
  changed: string[];
  missing: string[];
}

/** Compare every locked doc against the bytes served for one commit. */
async function driftAgainstPin(lock: Lock, commit: string): Promise<Drift> {
  const changed: string[] = [];
  const missing: string[] = [];
  // The bytes are read through the commit, not the tag, so a moved tag cannot
  // pass by serving the same bytes under a different SHA.
  for (const doc of lock.docs) {
    const response = await fetch(`${RAW_BASE}/${PIN.repo}/${commit}/docs/${doc.path}`);
    if (!response.ok) {
      missing.push(doc.path);
      continue;
    }
    if (digest(new Uint8Array(await response.arrayBuffer())) !== doc.sha256) {
      changed.push(doc.path);
    }
  }
  return { changed, missing };
}

/** Leaves that read one pinned doc, in manifest order. */
export function leavesForDoc(path: string): string[] {
  return MANIFEST.filter((job) => job.docs.includes(path)).map((job) => job.leaf);
}

/**
 * Report the leaves a pin bump makes stale. One line per changed or missing doc,
 * naming the leaves that cite it, so a resync re-curates only what moved.
 */
async function reportChangedLeaves(path: string): Promise<boolean> {
  const lock = JSON.parse(await readFile(path, "utf8")) as Lock;
  const commit = await resolveCommit();
  const drift = await driftAgainstPin(lock, commit);
  const leaves = new Set<string>();
  for (const [kind, docs] of [
    ["changed", drift.changed],
    ["missing", drift.missing],
  ] as const) {
    for (const doc of docs) {
      const owners = leavesForDoc(doc);
      for (const leaf of owners) leaves.add(leaf);
      const target = owners.length > 0 ? owners.join(", ") : "no manifest leaf";
      console.log(`${kind}: docs/${doc} -> ${target}`);
    }
  }
  console.log(`changed=${drift.changed.length} missing=${drift.missing.length} leaves=${leaves.size}`);
  for (const leaf of leaves) console.log(`re-curate: skills/vitest/references/${leaf}.md`);
  return drift.changed.length + drift.missing.length === 0;
}

/**
 * Re-fetch the pinned docs and report drift against the lock. Drift covers a
 * moved tag (the commit changed), a doc whose bytes changed, a doc that the
 * lock names but the pinned tree lacks, and any difference between the lock's
 * doc set and leaves and the manifest the generator reads today.
 */
export async function checkLock(path: string): Promise<boolean> {
  const lock = JSON.parse(await readFile(path, "utf8")) as Lock;
  const commit = await resolveCommit();
  const problems = lockProblems(lock, commit);
  let ok = problems.length === 0;
  for (const problem of problems) console.error(problem);

  const drift = await driftAgainstPin(lock, commit);
  console.log(
    `${lock.tag}: docs=${lock.docs.length} changed=${drift.changed.length} missing=${drift.missing.length}`,
  );
  for (const doc of drift.changed) console.error(`changed: docs/${doc}`);
  for (const doc of drift.missing) console.error(`missing: docs/${doc}`);
  return ok && drift.changed.length + drift.missing.length === 0;
}

/** Resolve the pinned tag to a commit SHA and fill the docs cache. */
export async function fetchDocs(): Promise<void> {
  const commit = await resolveCommit();

  const tree = await fetchJson<{ tree: { path: string; type: string }[] }>(
    `${API_BASE}/repos/${PIN.repo}/git/trees/${commit}?recursive=1`,
  );
  const present = new Set(
    tree.tree
      .filter((entry) => entry.type === "blob" && entry.path.startsWith("docs/"))
      .map((entry) => entry.path),
  );

  const wanted = pinnedDocs();
  const missing = wanted.filter((path) => !present.has(`docs/${path}`));
  for (const path of wanted) {
    if (missing.includes(path)) continue;
    const response = await fetch(`${RAW_BASE}/${PIN.repo}/${PIN.tag}/docs/${path}`);
    if (!response.ok) {
      throw new Error(`docs/${path} returned ${response.status} ${response.statusText}`);
    }
    const file = join(CACHE_DOCS, path);
    await mkdir(dirname(file), { recursive: true });
    await writeFile(file, await response.text());
  }
  await mkdir(CACHE_DIR, { recursive: true });
  await writeFile(PIN_FILE, `${JSON.stringify({ tag: PIN.tag, commit }, null, 2)}\n`);

  console.log(`pinned ${PIN.tag} ${commit} docs=${wanted.length} missing=${missing.length}`);
  if (missing.length > 0) {
    for (const path of missing) console.error(`missing manifest doc: docs/${path}`);
    process.exit(1);
  }
}

function printFactSheet(sheet: FactSheet): void {
  console.log(`leaf=${sheet.leaf} headings=${sheet.headings.length} docs=${sheet.docs.length} facts=${sheet.facts.length}`);
  console.log("docs:");
  for (const doc of sheet.docs) {
    console.log(`  ${doc.path} ${doc.sha256 === "" ? "(absent)" : doc.sha256}`);
  }
  console.log("facts:");
  for (const fact of sheet.facts) {
    console.log(`- [${fact.source}] ${fact.text} (${fact.citation})`);
  }
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const flag = (name: string): string | undefined => {
    const index = args.indexOf(name);
    if (index < 0) return undefined;
    const value = args[index + 1];
    if (!value || value.startsWith("--")) return undefined;
    return value;
  };

  if (args.includes("--fetch")) {
    await fetchDocs();
    return;
  }

  if (args.includes("--write-lock")) {
    await writeLock(flag("--write-lock") ?? LOCK_FILE);
    return;
  }

  if (args.includes("--changed-leaves")) {
    process.exit((await reportChangedLeaves(flag("--changed-leaves") ?? LOCK_FILE)) ? 0 : 1);
  }

  if (args.includes("--check")) {
    process.exit((await checkLock(flag("--check") ?? LOCK_FILE)) ? 0 : 1);
  }

  const leaf = flag("--facts") ?? flag("--leaf");
  if (!leaf) {
    console.error(
      "usage: --fetch | --leaf <leaf> | --facts <leaf> [--docs-dir <dir>] | --write-lock <path> | --check | --changed-leaves",
    );
    process.exit(1);
  }
  const sheet = await extractFactSheet(leaf, flag("--docs-dir") ?? CACHE_DOCS);
  if (flag("--facts")) {
    printFactSheet(sheet);
    return;
  }
  console.log(JSON.stringify(sheet, null, 2));
}

if (import.meta.main) {
  await main();
}
