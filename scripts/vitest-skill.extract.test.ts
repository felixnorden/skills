#!/usr/bin/env bun
/**
 * vitest-skill.extract.test.ts
 *
 * The repository's test file for the vitest-skill generator. Runs offline against
 * the committed fixture pages under __fixtures__/vitest-docs, so no test needs
 * the network.
 *
 * Run: bun test
 */

import { describe, expect, test } from "bun:test";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { citationFor, extractFactSheet, jobFor, lockProblems, type Lock } from "./vitest-skill.extract.ts";
import { MANIFEST } from "./vitest-skill.manifest.ts";
import { renderSkeleton } from "./vitest-skill.render.ts";

const FIXTURES = join(import.meta.dir, "__fixtures__", "vitest-docs");

// The house-banned vocabulary from G4. A fact bullet never carries it.
const BANNED_PATTERN =
  /(^|[^0-9])20[0-9][0-9]([^0-9]|$)|deprecated|currently|as of|latest version/i;

describe("extract", () => {
  test("extracts a fact sheet for one leaf from the pinned docs", async () => {
    const sheet = await extractFactSheet("local-vs-ci", FIXTURES);
    const job = MANIFEST.find((entry) => entry.leaf === "local-vs-ci");
    expect(job).toBeDefined();
    expect(sheet.leaf).toBe("local-vs-ci");
    expect(sheet.docs.map((doc) => doc.path)).toEqual(job?.docs ?? []);
    for (const doc of sheet.docs) {
      // A page with a fixture carries a real digest; a page without one is
      // marked absent with an empty string, never a fake digest.
      if (existsSync(join(FIXTURES, doc.path))) {
        expect(doc.sha256).toMatch(/^sha256:[0-9a-f]{64}$/);
      } else {
        expect(doc.sha256).toBe("");
      }
    }
    expect(sheet.facts.length).toBeGreaterThan(0);
  });

  test("orders headings as the manifest declares, with a contents heading for every leaf", async () => {
    for (const job of MANIFEST) {
      const sheet = await extractFactSheet(job.leaf, FIXTURES);
      expect(sheet.headings).toEqual(job.headings);
      expect(sheet.headings[1]).toBe("## Contents");
    }
  });

  test("cites a page for every fact bullet", async () => {
    const sheet = await extractFactSheet("local-vs-ci", FIXTURES);
    const paths = new Set(sheet.docs.map((doc) => doc.path));
    for (const fact of sheet.facts) {
      expect(fact.citation.startsWith("vitest.dev/")).toBe(true);
      expect(paths.has(fact.source)).toBe(true);
      expect(citationFor(fact.source)).toBe(fact.citation);
    }
  });

  test("drops banned house vocabulary from fact bullets", async () => {
    const sheet = await extractFactSheet("migration", FIXTURES);
    expect(sheet.facts.length).toBeGreaterThan(0);
    for (const fact of sheet.facts) {
      expect(BANNED_PATTERN.test(fact.text)).toBe(false);
    }
  });
});

describe("render", () => {
  test("renders a skeleton with no local markdown link", async () => {
    const sheet = await extractFactSheet("local-vs-ci", FIXTURES);
    const skeleton = renderSkeleton(sheet, jobFor("local-vs-ci"));
    expect(/\]\([^)]*\.md/.test(skeleton)).toBe(false);
    expect(skeleton).toContain("vitest.dev/");
  });

  test("renders ## Contents as the second heading, and the skeleton passes 100 lines", async () => {
    const sheet = await extractFactSheet("local-vs-ci", FIXTURES);
    const skeleton = renderSkeleton(sheet, jobFor("local-vs-ci"));
    const lines = skeleton.split("\n");
    const headings = lines.filter((line) => /^#{1,2}\s/.test(line));
    expect(headings[1]).toBe("## Contents");
    expect(lines.filter((line) => line !== "").length).toBeGreaterThanOrEqual(100);
  });

  test("renders no banned house vocabulary", async () => {
    const sheet = await extractFactSheet("migration", FIXTURES);
    const skeleton = renderSkeleton(sheet, jobFor("migration"));
    expect(BANNED_PATTERN.test(skeleton)).toBe(false);
    expect(skeleton).toContain("vitest.dev/guide/migration");
  });
});

const LOCK_FILE = join(import.meta.dir, "vitest-skill.lock.json");

describe("lock", () => {
  test("accepts the committed lock against its own commit", async () => {
    const lock = JSON.parse(await readFile(LOCK_FILE, "utf8")) as Lock;
    expect(lockProblems(lock, lock.commit)).toEqual([]);
  });

  test("reports a stale commit, a missing doc, and an unmatched leaf list", async () => {
    const lock = JSON.parse(await readFile(LOCK_FILE, "utf8")) as Lock;
    const stale = { ...lock, commit: "0".repeat(40) };
    expect(lockProblems(stale, lock.commit)).toHaveLength(1);
    expect(lockProblems(stale, lock.commit)[0]).toContain("lock commit");

    const dropped = { ...lock, docs: lock.docs.slice(1) };
    const droppedProblems = lockProblems(dropped, lock.commit);
    expect(droppedProblems).toHaveLength(1);
    expect(droppedProblems[0]).toContain("lock is missing manifest doc");

    const leaves = { ...lock, leaves: lock.leaves.slice(1) };
    expect(lockProblems(leaves, lock.commit)[0]).toContain("lock leaves do not match the manifest");
  });
});
