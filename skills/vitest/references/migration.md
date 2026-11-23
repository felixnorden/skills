# Migration

The inventory for a move from an earlier major or from another runner: every
flipped default, rename, removal, and moved package, one line each. Every
check-and-fix loop belongs to a diagnostic reference, so this one states the change
and stops.

## Contents

- Prerequisites
- Defaults that flipped
- Renames and removals
- Behaviour changes with no key
- Packages that moved
- From Jest

## Prerequisites

Two engine floors decide whether anything else applies:

- Vite `>= 6.4.0`.
- Node.js `>= 22.12.0`.

`vite` is a peer dependency rather than a direct one, so the version your project
installs is the version the runner uses. npm, pnpm, Bun, and Deno install peer
dependencies automatically; Yarn does not, so a Yarn project must add `vite`
explicitly after the upgrade. See `vitest.dev/guide/migration`.

Check the two versions before reading any other line here. A run on an older Vite
fails in ways this inventory does not describe, and the failure looks like a
configuration problem.

The support window for an older major is on the releases page, which also states how
patch, minor, and major releases are scheduled. See `vitest.dev/releases`.

## Defaults that flipped

| Default | Now | Effect |
| --- | --- | --- |
| `clearMocks` | `true` | Recorded calls are cleared before every test |
| Inline project `extends` | `true` | A project inherits the root config, arrays merged |
| `sharedViteServer` | `true` | Inline projects reuse the declaring config's server |
| `browser.locators.exact` | `true` | Locator text must match the whole string |
| Fake timers | includes `Temporal` | The mocked clock controls `Temporal.Now` too |
| Config lookup | current directory | Parent directories are no longer searched |
| Artifact root | `.vitest/` | Reports and attachments share one directory |
| `browser.api` | top-level `api` | One Vite server serves browser mode |
| `browser.isolate` | top-level `isolate` | The browser key only warns and forwards |

Each row has a reference that diagnoses the symptom it causes: the mock lifecycle,
configuration and projects, the browser reference for locator strictness, and the
timers reference for the clock.

Two rows change a report's location rather than its content. The JSON, JUnit, and
HTML reporters now write under `.vitest/`, and the HTML reporter's option moved from
a file to a directory. See `vitest.dev/guide/migration`.

## Renames and removals

- `test.sequential`, `describe.sequential`, and the `sequential` option are removed.
  Use `{ concurrent: false }` on the test or suite that must opt out of concurrency.
- `bench` is no longer a top-level import. It is a fixture from the test context.
- `bench.skip`, `bench.only`, and `bench.todo` are removed. Use the regular test
  modifiers on the surrounding test.
- `benchmark.reporters` and `benchmark.outputFile` are removed. Configure
  `test.reporters` instead.
- `benchmark.compare` and `--compare` are removed. Persist a result with the
  per-bench `writeResult` option and read it back with `bench.from()`.
- `benchmark.outputJson` and `--outputJson` are removed. Use
  `--reporter=json --outputFile=<path>`.
- The `Vitest` instance `mode` property is always `'test'`.
- Removed entrypoints: `vitest/coverage` and `vitest/reporters` are replaced by
  `vitest/node`; `vitest/environments` and `vitest/snapshot` by `vitest/runtime`;
  `vitest/runners`, `vitest/suite`, `vitest/mocker`, and `vitest/internal/module-runner`
  by `TestRunner` from `vitest` or by the `@vitest/mocker` package.
- `resolveConfig` returns the resolved Vite config, with the Vitest config on its
  `test` property, instead of a pair of configs.
- Assertion types take two parameters: `R` for the matcher return type and `T` for
  the received value. A synchronous assertion uses `void`, an asynchronous one
  `Promise<void>`.
- The `html` reporter's option is `outputDir`, not `outputFile`.

Check the entrypoint row first after an upgrade: a module-resolution error appears
before any test runs, and it names the import that must change. See
`vitest.dev/guide/migration`.

## Behaviour changes with no key

- A hoisted `vi.mock`, `vi.unmock`, or `vi.hoisted` call outside module top level
  throws and lists every offending call. `vi.doMock` and `vi.doUnmock` are the
  unhoisted variants.
- An automocked module in browser mode returns `undefined` for its exports unless the
  mock passes `{ spy: true }`.
- A class mock chains `prototype` to the current implementation, so prototype methods
  resolve on instances and `instanceof` passes.
- `toThrow('')` matches any error message, because an empty string is a substring of
  every message. Match `/^$/` to assert an empty message.
- `expect.poll` rejects when the callback or assertion does not settle in time, and
  the callback receives an `AbortSignal` that aborts at the deadline.
- An unawaited `resolves`, `rejects`, or `toMatchFileSnapshot` assertion fails the
  test instead of warning.
- `testNamePattern` matches the full name joined by ` > `, so a pattern that spans
  two segments must use that separator or a wildcard.
- A referenced config that declares `projects` now provides nested projects instead
  of running as one project.
- The JSON and JUnit reporters write a file by default instead of printing to stdout.
- `vitest list` parses files statically instead of running them.
- `VITEST_POOL_ID` and `VITEST_WORKER_ID` start at `1`, so any arithmetic written
  against a zero-based id is off by one.
- `toHaveTextContent` is exact string equality and rejects a regular expression;
  `toMatchTextContent` is the partial and regular-expression matcher.
- A locator forwarded to a browser command arrives as an object with a `selector`
  field and a readable `locator` field.
- `render` returns a promise in the Vue and Svelte companion packages, so the call
  must be awaited.
- Coverage thresholds set on a glob no longer inherit the top-level `perFile` flag,
  and coverage include and exclude patterns are matched relative to the project root
  without a substring match.
- `populateGlobal` returns property descriptors in `originals` rather than values.
- The browser orchestrator URL is session-bound and must include the session id.
- Reference screenshots for `toMatchScreenshot` read their own directory option.

Check the value-shape rows before the value rows: the formatter and the assertion
types change a diff or a type error, and neither is a behaviour change in the code
under test. See `vitest.dev/guide/migration`.

## Packages that moved

- `@vitest/runner` and `@vitest/ws-client` are superseded: they keep security fixes
  but receive no new features.
- Assertion code is bundled into `vitest`, which no longer depends on
  `@vitest/expect`. That package still publishes and works alone, but state is not
  shared with the runner's `expect`; use the `vitest` entry point.
- The WebdriverIO provider is community-maintained in the `vitest-community`
  organization as its own package. See `vitest.dev/config/browser/webdriverio`.

Check which package a type or a helper came from before adding a dependency: a
direct import from a superseded package compiles, then loses shared state at runtime.

An error that survives the entrypoint change is often a path or a working-directory
assumption. The common-errors page names the frequent ones, including a relative
import that no longer resolves and a worker thread whose time zone does not change.
See `vitest.dev/guide/common-errors`.

## From Jest

- Globals are off by default, where Jest enables them. Turn on `globals` or import
  the APIs explicitly. Auto DOM cleanup in some testing libraries depends on that
  setting.
- There is no `jest` namespace for types. Import them from `vitest` instead, and
  augment `vitest.Matchers` rather than the global `jest.Matchers`.
- Snapshot composables come from `Snapshots` in `vitest` instead of `jest-snapshot`,
  and a framework serializer is added through the snapshot serializer option.
- `JEST_WORKER_ID` has the counterpart `VITEST_POOL_ID`, and the pool id is bounded
  by the worker count.

See `vitest.dev/guide/migration/jest`.

Mocha projects move the same way at the level of structure and assertions: the test
shape maps directly, while Chai assertions, Sinon spies, and the `done` callback have
documented counterparts. See `vitest.dev/guide/migration/mocha`.

Check the global setting before the first run, because it decides whether every file
fails at collection or at its first assertion. Fix it once, then read failures one
file at a time.

Boundary: this reference carries the inventory only. When a flipped default produces
a failure, the diagnostic reference for that symptom holds the reproduction, the
check, and the fix.
