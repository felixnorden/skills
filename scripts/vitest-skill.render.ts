#!/usr/bin/env bun
/**
 * vitest-skill.render.ts
 *
 * Thin assembler for the vitest skill. Turns one leaf's fact sheet into a leaf
 * skeleton: the manifest's heading order, a fact bullet per extracted behaviour,
 * the page's own code block where it has one, and a vitest.dev/ citation on every
 * bullet. Skeletons live in the cache; only the curated leaf is committed.
 *
 * Run:
 *   bun run scripts/vitest-skill.render.ts --leaf <leaf> [--docs-dir <dir>] [--out <path>]
 *   bun run scripts/vitest-skill.render.ts --verify
 *
 * Flags:
 *   --leaf <leaf>      print one skeleton to stdout
 *   --docs-dir <dir>   read docs from <dir> instead of the cache (offline runs)
 *   --out <path>       write the skeleton to <path> instead of stdout
 *   --verify           check every existing leaf's citations against its manifest
 *                      doc set in both directions (G11)
 */

import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";

import {
  citationFor,
  extractFactSheet,
  jobFor,
  type CodeBlock,
  type Fact,
  type FactSheet,
} from "./vitest-skill.extract.ts";
import { MANIFEST, type LeafJob } from "./vitest-skill.manifest.ts";

const ROOT = resolve(import.meta.dir, "..");
const CACHE_DOCS = join(ROOT, ".vitest-docs", "docs");
const REFERENCES_DIR = join(ROOT, "skills", "vitest", "references");

// Words that carry no meaning for matching a fact to a leaf section.
const STOPWORDS = new Set([
  "and",
  "the",
  "for",
  "with",
  "what",
  "when",
  "this",
  "that",
  "from",
  "does",
  "one",
  "not",
  "are",
  "its",
  "into",
  "each",
  "them",
  "they",
]);

/** Meaningful lowercase words of a heading, a fact, or a doc path. */
function tokens(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((word) => word.length > 2 && !STOPWORDS.has(word));
}

/** The sections of a leaf: every manifest heading after the contents list. */
export function sectionsOf(job: LeafJob): string[] {
  const contents = job.headings.indexOf("## Contents");
  return job.headings.slice(contents + 1);
}

/** Placeholder bullet for a doc that produced no fact; keeps every page cited. */
function placeholder(docPath: string): Fact {
  return {
    text: `No extracted fact from the pinned page; read it before curating`,
    section: docPath,
    source: docPath,
    citation: citationFor(docPath),
  };
}

/** Best-matching section index for a piece of text. */
function bestSection(words: string[][], text: string): number {
  let best = 0;
  let bestScore = -1;
  words.forEach((sectionWords, index) => {
    const haystack = text.toLowerCase();
    const score = (sectionWords ?? []).reduce(
      (sum, word) => sum + (haystack.includes(word) ? 1 : 0),
      0,
    );
    if (score > bestScore) {
      bestScore = score;
      best = index;
    }
  });
  return best;
}

/** Group facts under the section that matches them best. */
export function groupFacts(sheet: FactSheet, job: LeafJob): Fact[][] {
  const titles = sectionsOf(job);
  const words = titles.map((title) => tokens(title));
  const groups: Fact[][] = titles.map(() => []);
  for (const fact of sheet.facts) {
    const index = bestSection(words, `${fact.section} ${fact.text}`);
    (groups[index] ??= []).push(fact);
  }
  for (const doc of sheet.docs) {
    if (sheet.facts.some((fact) => fact.source === doc.path)) continue;
    const index = bestSection(words, doc.path);
    (groups[index] ??= []).push(placeholder(doc.path));
  }
  // Every section carries at least one bullet: a donor group with a spare fact
  // gives one up, so a section never renders empty.
  for (let i = 0; i < groups.length; i += 1) {
    const group = groups[i];
    if (!group || group.length > 0) continue;
    let donor = -1;
    for (let j = 0; j < groups.length; j += 1) {
      const candidate = groups[j];
      if (!candidate || candidate.length < 2) continue;
      if (donor < 0 || candidate.length > (groups[donor]?.length ?? 0)) donor = j;
    }
    const moved = donor >= 0 ? groups[donor]?.pop() : undefined;
    if (moved) group.push(moved);
  }
  return groups;
}

/** First unused code block whose doc section matches the leaf section. */
function takeCode(blocks: CodeBlock[], used: Set<number>, title: string): CodeBlock | null {
  const words = tokens(title);
  for (let i = 0; i < blocks.length; i += 1) {
    if (used.has(i)) continue;
    const block = blocks[i];
    if (!block) continue;
    if (words.some((word) => block.section.toLowerCase().includes(word))) {
      used.add(i);
      return block;
    }
  }
  return null;
}

/** Assemble one leaf skeleton. Mechanical: no prose is invented here. */
export function renderSkeleton(sheet: FactSheet, job: LeafJob): string {
  const titles = sectionsOf(job);
  const groups = groupFacts(sheet, job);
  const used = new Set<number>();
  const lines: string[] = [];
  lines.push(job.headings[0] ?? `# ${job.leaf}`);
  lines.push("");
  lines.push("## Contents");
  lines.push("");
  for (const title of titles) lines.push(`- ${title.replace(/^## /, "")}`);
  lines.push("");
  titles.forEach((title, index) => {
    lines.push(title);
    lines.push("");
    for (const fact of groups[index] ?? []) lines.push(`- ${fact.text} \`${fact.citation}\``);
    const block = takeCode(sheet.code, used, title);
    if (block) {
      lines.push("");
      lines.push(`\`\`\`${block.lang}`);
      lines.push(block.body);
      lines.push("```");
    }
    lines.push("");
  });
  return `${lines.join("\n").replace(/\n+$/, "")}\n`;
}

/** Citations in a curated leaf, normalised the way G11 compares them. */
export function citationsIn(text: string): string[] {
  const out: string[] = [];
  for (const match of text.matchAll(/vitest\.dev\/[A-Za-z0-9_./-]*/g)) {
    const citation = (match[0] ?? "").replace(/[.,]+$/, "").replace(/\/+$/, "");
    if (citation !== "vitest.dev") out.push(citation);
  }
  return out;
}

/** G11: compare every existing leaf's citations with its manifest doc set. */
async function verify(): Promise<boolean> {
  let leaves = 0;
  let mismatches = 0;
  let absent = 0;
  for (const job of MANIFEST) {
    const file = join(REFERENCES_DIR, `${job.leaf}.md`);
    if (!existsSync(file)) {
      absent += 1;
      console.error(`${job.leaf}: leaf file is missing`);
      continue;
    }
    leaves += 1;
    const expected = new Set(job.docs.map((doc) => citationFor(doc)));
    const cited = new Set(citationsIn(await readFile(file, "utf8")));
    const unmatched = [...cited].filter((citation) => !expected.has(citation));
    const missing = [...expected].filter((citation) => !cited.has(citation));
    const good = [...expected].filter((citation) => cited.has(citation)).length;
    if (unmatched.length > 0 || missing.length > 0) mismatches += 1;
    console.log(
      `${job.leaf} cited=${good}/${expected.size} unmatched=${unmatched.length} missing=${missing.length}`,
    );
    for (const citation of unmatched) console.error(`  ${job.leaf}: unmatched citation ${citation}`);
    for (const citation of missing) console.error(`  ${job.leaf}: missing citation ${citation}`);
  }
  console.log(`leaves=${leaves} mismatches=${mismatches} absent=${absent}`);
  return mismatches === 0 && absent === 0;
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const flag = (name: string): string | undefined => {
    const index = args.indexOf(name);
    if (index < 0) return undefined;
    const value = args[index + 1];
    if (!value || value.startsWith("--")) throw new Error(`${name} needs a value`);
    return value;
  };

  if (args.includes("--verify")) {
    process.exit((await verify()) ? 0 : 1);
  }

  const leaf = flag("--leaf");
  if (!leaf) {
    console.error("usage: --leaf <leaf> [--docs-dir <dir>] [--out <path>] | --verify");
    process.exit(1);
  }
  const job = jobFor(leaf);
  const sheet = await extractFactSheet(leaf, flag("--docs-dir") ?? CACHE_DOCS);
  const skeleton = renderSkeleton(sheet, job);
  const out = flag("--out");
  if (out) {
    await mkdir(dirname(resolve(out)), { recursive: true });
    await writeFile(out, skeleton);
    console.error(`wrote ${out} (${skeleton.split("\n").length - 1} lines)`);
    return;
  }
  process.stdout.write(skeleton);
}

if (import.meta.main) {
  await main();
}
