---
name: vitest
description: Routes Vitest symptoms to diagnostic references. Use when a test passes locally, fails in CI, fails only in the full suite, or fails at random, mock calls leak, stop recording, or need per-argument returns, `vi.mock` is ignored or throws, one file or project should run alone, the config is ignored, test files fail type checking, fake timers stop moving, assertions are never awaited, snapshots churn, coverage thresholds fail, a slow suite or a wrong benchmark, a browser locator stops matching, or an upgrade from Jest or an earlier major. Not for designing new tests.
---

# Vitest

Each reference holds one diagnosis loop: the symptom, the documented causes in
cost order, the check that separates them, and the fix. The three bullets below
are the defaults that contradict what an agent writes from memory; read them
before writing a fix. The table is the router: match the symptom, read one row,
open one reference. Every reference is one level deep, so nothing links onward.
Row labels name symptoms rather than API names, so an observed failure is enough
to choose one.

## Vitest 5 defaults that contradict memory

- Mock clearing is on: `clearMocks` runs before every test, so calls recorded in an earlier test are gone.
- A hoisted `vi.mock`, `vi.unmock`, or `vi.hoisted` call is legal only at module top level; anywhere else the file throws and lists every offending call, and `vi.doMock` is the unhoisted escape.
- An unawaited `resolves`, `rejects`, or `toMatchFileSnapshot` assertion fails the test instead of printing a warning.

This skill does not teach test design: what deserves a test, where the double
boundary sits, which double to choose, or how to structure a suite. It assumes a
suite exists and that something inside it fails.

## Route by symptom

| Symptom | Read |
| --- | --- |
| A test passes locally and fails in CI | [references/local-vs-ci.md](references/local-vs-ci.md) |
| A test fails only when the whole suite runs | [references/flakiness.md](references/flakiness.md) |
| A test fails some of the time | [references/flakiness.md](references/flakiness.md) |
| A mock keeps calls from an earlier test, or stops recording them | [references/mocking.md](references/mocking.md) |
| `vi.mock` is ignored, or it throws when the file loads | [references/mocking.md](references/mocking.md) |
| One test needs a different return value for a different argument | [references/mocking.md](references/mocking.md) |
| Need one file, one test, or one project, fast | [references/filtering.md](references/filtering.md) |
| The config file is not picked up, or the wrong projects run | [references/config-and-projects.md](references/config-and-projects.md) |
| TypeScript errors in a test file or in a matcher | [references/config-and-projects.md](references/config-and-projects.md) |
| Fake timers do not move the clock | [references/timers-and-async.md](references/timers-and-async.md) |
| A test passed without checking anything | [references/timers-and-async.md](references/timers-and-async.md) |
| Snapshots churn or become obsolete | [references/snapshots.md](references/snapshots.md) |
| Snapshot or assertion output changed after an upgrade | [references/snapshots.md](references/snapshots.md) |
| Coverage percentages or thresholds are wrong | [references/coverage.md](references/coverage.md) |
| The suite is slow, or a benchmark result is wrong | [references/performance.md](references/performance.md) |
| A browser test cannot find the element | [references/browser-mode.md](references/browser-mode.md) |
| A test behaves differently depending on which worker ran it | [references/flakiness.md](references/flakiness.md) |
| Upgrading from Vitest 4, or from Jest | [references/migration.md](references/migration.md) |

Read the row for the symptom you observed, not the API you suspect. Each
reference states what it does not own, so a symptom that belongs elsewhere is
named by its job. A reference never links another reference: return to this table
and match again, and keep the fix inside the job that owns it. The three defaults
above are stated once here and diagnosed in the reference that owns them.
