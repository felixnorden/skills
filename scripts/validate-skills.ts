#!/usr/bin/env bun
/**
 * validate-skills.ts
 *
 * Mechanical checks for the skills in this repository.
 *
 * Error class: a rule that affects the Agent Skills spec or cross-harness
 * portability. Any error makes the run exit non-zero.
 *
 * Warning class: a style rule. A warning prints but does not fail the run.
 *
 * Run: bun run scripts/validate-skills.ts
 */

import { existsSync, statSync } from "node:fs";
import { readdir, readFile } from "node:fs/promises";
import { basename, dirname, join, relative, resolve } from "node:path";

const ROOT = resolve(import.meta.dir, "..");
const SKILLS_DIR = join(ROOT, "skills");

// Description length that triggers a style warning. The spec cap is 1024.
// 600 leaves room for the trigger clause to survive Codex shortening.
const DESCRIPTION_WARN_LENGTH = 600;

// Description hard cap from the Agent Skills specification.
const DESCRIPTION_MAX_LENGTH = 1024;

// Body length that triggers a style warning. The spec cap is 500 lines.
const BODY_WARN_LINES = 300;

// Body hard cap from the Agent Skills specification.
const BODY_MAX_LINES = 500;

// A reference file over this many lines must open with a table of contents.
const TOC_MIN_LINES = 100;

// A directly linked file that names this many other local markdown files is a
// second-level index. One or two cross-references are tolerated.
const INDEX_MENTION_THRESHOLD = 3;

// Frontmatter keys that no target harness reads. A value here is dead weight.
const UNUSED_METADATA_KEYS = ["aliases"];

type Level = "error" | "warning";

interface Finding {
  file: string;
  line: number;
  level: Level;
  message: string;
}

const findings: Finding[] = [];

function add(file: string, line: number, level: Level, message: string): void {
  findings.push({ file: relative(ROOT, file), line, level, message });
}

interface Frontmatter {
  /** Raw lines between the opening and closing marker. */
  lines: string[];
  /** Zero-based index in the file of the first body line. */
  bodyStart: number;
}

function parseFrontmatter(text: string): Frontmatter | null {
  const lines = text.split("\n");
  if ((lines[0] ?? "").trim() !== "---") return null;
  for (let i = 1; i < lines.length; i += 1) {
    if ((lines[i] ?? "").trim() === "---") {
      return { lines: lines.slice(1, i), bodyStart: i + 1 };
    }
  }
  return null;
}

/** File line number (zero-based) for a frontmatter line index. */
function fmLine(index: number): number {
  return index;
}

interface ScalarResult {
  value: string;
  /** Zero-based frontmatter index of the key line. */
  index: number;
}

/** Read a scalar or block scalar value for one top-level key. */
function readScalar(fm: Frontmatter, key: string): ScalarResult | null {
  const index = fm.lines.findIndex((l) => new RegExp(`^${key}\\s*:`).test(l));
  if (index < 0) return null;
  const raw = (fm.lines[index] ?? "").replace(new RegExp(`^${key}\\s*:`), "").trim();
  if (raw === ">" || raw === "|" || raw === ">-" || raw === "|-") {
    const parts: string[] = [];
    for (let i = index + 1; i < fm.lines.length; i += 1) {
      const line = fm.lines[i] ?? "";
      if (line.trim() === "") {
        parts.push("");
        continue;
      }
      if (/^\s+\S/.test(line)) parts.push(line.trim());
      else break;
    }
    return { value: parts.join(" ").trim(), index };
  }
  return { value: raw.replace(/^["']|["']$/g, ""), index };
}

interface Link {
  target: string;
  line: number;
}

function markdownLinks(text: string, bodyStart: number): Link[] {
  const out: Link[] = [];
  const lines = text.split("\n");
  const re = /\]\(([^)]+)\)/g;
  for (let i = bodyStart; i < lines.length; i += 1) {
    const line = lines[i] ?? "";
    let match: RegExpExecArray | null;
    re.lastIndex = 0;
    while ((match = re.exec(line)) !== null) {
      out.push({ target: (match[1] ?? "").trim(), line: i + 1 });
    }
  }
  return out;
}

function localMarkdownTarget(link: string): string | null {
  if (/^(https?:|mailto:|#)/i.test(link)) return null;
  const withoutAnchor = link.split("#")[0] ?? "";
  if (!withoutAnchor.toLowerCase().endsWith(".md")) return null;
  return withoutAnchor;
}

function lineCount(text: string): number {
  const lines = text.split("\n");
  if (lines.length > 0 && lines[lines.length - 1] === "") lines.pop();
  return lines.length;
}

async function listMarkdownFiles(dir: string): Promise<string[]> {
  const out: string[] = [];
  if (!existsSync(dir)) return out;
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await listMarkdownFiles(full)));
    else if (entry.isFile() && entry.name.endsWith(".md")) out.push(full);
  }
  return out;
}

function hasTableOfContents(text: string): boolean {
  return /^#{1,3}\s+(contents|table of contents)\s*$/im.test(text);
}

async function validateSkill(skillDir: string): Promise<void> {
  const skillFile = join(skillDir, "SKILL.md");
  if (!existsSync(skillFile)) {
    add(skillDir, 1, "error", "missing SKILL.md");
    return;
  }

  const text = await readFile(skillFile, "utf8");
  const fm = parseFrontmatter(text);
  if (!fm) {
    add(skillFile, 1, "error", "missing or unclosed YAML frontmatter");
    return;
  }

  // name
  const dirName = basename(skillDir);
  const name = readScalar(fm, "name");
  if (!name || name.value === "") {
    add(skillFile, 1, "error", "frontmatter name is required");
  } else {
    if (name.value.length > 64) add(skillFile, fmLine(name.index), "error", "name exceeds 64 characters");
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(name.value)) {
      add(skillFile, fmLine(name.index), "error", `name "${name.value}" must be lowercase alphanumeric with single hyphens`);
    }
    if (name.value !== dirName) {
      add(skillFile, fmLine(name.index), "error", `name "${name.value}" must match directory "${dirName}"`);
    }
  }

  // description
  const description = readScalar(fm, "description");
  if (!description || description.value === "") {
    add(skillFile, 1, "error", "frontmatter description is required");
  } else {
    const value = description.value;
    if (value.length > DESCRIPTION_MAX_LENGTH) {
      add(skillFile, fmLine(description.index), "error", `description is ${value.length} characters, over the ${DESCRIPTION_MAX_LENGTH} cap`);
    } else if (value.length > DESCRIPTION_WARN_LENGTH) {
      add(skillFile, fmLine(description.index), "warning", `description is ${value.length} characters, over the ${DESCRIPTION_WARN_LENGTH} style target`);
    }
    if (/(^|\s)(use this skill|you can|you will|you'll|your|you|i can|i'll)\b/i.test(value)) {
      add(skillFile, fmLine(description.index), "error", "description uses first or second person; use a verb phrase plus \"Use when\"");
    }
  }

  // An unquoted ": " inside a plain scalar breaks YAML: the value becomes a
  // nested mapping and harnesses drop the field.
  for (const key of ["name", "description"]) {
    const index = fm.lines.findIndex((l) => new RegExp(`^${key}\\s*:`).test(l));
    if (index < 0) continue;
    const rawValue = (fm.lines[index] ?? "").replace(new RegExp(`^${key}\\s*:`), "").trim();
    if (!/^["'|>]/.test(rawValue) && /:\s/.test(rawValue)) {
      add(skillFile, fmLine(index), "error", `frontmatter ${key} has an unquoted ": "; quote the value or remove the colon`);
    }
  }

  // metadata keys no harness reads
  for (const key of UNUSED_METADATA_KEYS) {
    const index = fm.lines.findIndex((l) => new RegExp(`^\\s+${key}\\s*:`).test(l));
    if (index >= 0) {
      add(skillFile, fmLine(index), "warning", `metadata.${key} is not read by any target harness`);
    }
  }

  // body
  const lines = text.split("\n");
  const bodyText = lines.slice(fm.bodyStart).join("\n");
  const bodyLines = lineCount(bodyText);
  if (bodyLines > BODY_MAX_LINES) {
    add(skillFile, fm.bodyStart + 1, "error", `body is ${bodyLines} lines, over the ${BODY_MAX_LINES} cap`);
  } else if (bodyLines > BODY_WARN_LINES) {
    add(skillFile, fm.bodyStart + 1, "warning", `body is ${bodyLines} lines, over the ${BODY_WARN_LINES} style target`);
  }

  // time-sensitive phrasing
  const timeRe = /\b20\d{2}\b|\blatest version\b|\bas of\b|\bdeprecated\b|\bcurrently\b/i;
  for (let i = fm.bodyStart; i < lines.length; i += 1) {
    const line = lines[i] ?? "";
    if (timeRe.test(line)) {
      add(skillFile, i + 1, "error", "time-sensitive phrasing; move it to an \"old patterns\" section");
    }
  }

  // local links
  const links = markdownLinks(text, fm.bodyStart);
  const directlyLinked = new Set<string>();
  for (const link of links) {
    if (/\\/.test(link.target)) {
      add(skillFile, link.line, "error", `Windows-style path in link: ${link.target}`);
    }
    const target = localMarkdownTarget(link.target);
    if (!target) continue;
    const resolved = resolve(dirname(skillFile), target);
    if (!existsSync(resolved)) {
      add(skillFile, link.line, "error", `link target does not resolve: ${target}`);
      continue;
    }
    directlyLinked.add(resolved);
  }

  // second-level references
  for (const refFile of await listMarkdownFiles(skillDir)) {
    if (refFile === skillFile) continue;
    if (basename(refFile) === "README.md") continue;
    const refText = await readFile(refFile, "utf8");
    if (!directlyLinked.has(refFile)) continue;

    const refLinks = markdownLinks(refText, 0).filter((l) => localMarkdownTarget(l.target));
    if (refLinks.length > 0) {
      for (const l of refLinks) {
        add(refFile, l.line, "error", `second-level reference link to ${l.target}`);
      }
    }

    const mentions = new Set<string>();
    const mentionRe = /[A-Za-z0-9_./-]+\.md\b/g;
    let m: RegExpExecArray | null;
    while ((m = mentionRe.exec(refText)) !== null) {
      const name = basename(m[0]);
      if (name === "SKILL.md" || name === basename(refFile)) continue;
      mentions.add(name);
    }
    if (mentions.size >= INDEX_MENTION_THRESHOLD && refLinks.length === 0) {
      add(refFile, 1, "error", `second-level reference index; names ${mentions.size} other markdown files`);
    }

    if (lineCount(refText) > TOC_MIN_LINES && !hasTableOfContents(refText)) {
      add(refFile, 1, "warning", `reference over ${TOC_MIN_LINES} lines has no table of contents`);
    }
  }
}

async function main(): Promise<void> {
  const entries = await readdir(SKILLS_DIR, { withFileTypes: true });
  const skillDirs = entries
    .filter((e) => e.isDirectory())
    .map((e) => join(SKILLS_DIR, e.name))
    .sort();

  for (const dir of skillDirs) {
    await validateSkill(dir);
  }

  findings.sort((a, b) => (a.file === b.file ? a.line - b.line : a.file.localeCompare(b.file)));

  for (const f of findings) {
    console.log(`${f.file}:${f.line}: ${f.level}: ${f.message}`);
  }

  const errors = findings.filter((f) => f.level === "error").length;
  const warnings = findings.length - errors;
  console.error(`\n${errors} error(s), ${warnings} warning(s), ${skillDirs.length} skill(s) checked`);
  process.exit(errors > 0 ? 1 : 0);
}

await main();
