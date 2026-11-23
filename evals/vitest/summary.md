# Eval summary: vitest

Generated: 2026-11-23T21:11:57.214Z
Models: opencode/qwen3.8-max, opencode-go/deepseek-v4.1-flash
Runs per trigger query: 3

## Trigger results

| Model | Case | Should trigger | Split | Rate | Result |
| --- | --- | --- | --- | --- | --- |
| opencode/qwen3.8-max | A test passes locally but fails in CI and nothing changed. | true | train | 1.00 | PASS |
| opencode/qwen3.8-max | The suite only fails when every test runs together. | true | train | 1.00 | PASS |
| opencode/qwen3.8-max | A mock stops recording calls after the first test in the file. | true | train | 1.00 | PASS |
| opencode/qwen3.8-max | I need to run one test file in one project without editing the config. | true | train | 1.00 | PASS |
| opencode/qwen3.8-max | The config file is ignored and the wrong projects run. | true | train | 1.00 | PASS |
| opencode/qwen3.8-max | Fake timers stop moving, and an async assertion is never awaited. | true | train | 1.00 | PASS |
| opencode/qwen3.8-max | Snapshots churn after we upgraded from Jest, and some are obsolete. | true | validation | 1.00 | PASS |
| opencode/qwen3.8-max | Coverage thresholds fail even though every test passes. | true | validation | 1.00 | PASS |
| opencode/qwen3.8-max | The suite takes twenty minutes, and one benchmark result looks wrong. | true | validation | 1.00 | PASS |
| opencode/qwen3.8-max | A browser test stopped finding the element it used to match. | true | validation | 1.00 | PASS |
| opencode/qwen3.8-max | Where should the double boundary sit when a function talks to a database: mock the repository or fake it? | false | train | 0.00 | PASS |
| opencode/qwen3.8-max | Should the payments client get a stub or a spy, or is the design the problem? | false | train | 0.67 | FAIL |
| opencode/qwen3.8-max | Write a Playwright end-to-end test that logs in and checks the dashboard heading. | false | train | 0.00 | PASS |
| opencode/qwen3.8-max | How do we make the quality dashboard look better for management? | false | train | 0.00 | PASS |
| opencode/qwen3.8-max | Add a GitHub Actions workflow that builds and publishes the package. | false | train | 0.00 | PASS |
| opencode/qwen3.8-max | Set up Mocha with a TypeScript loader for an existing Node service. | false | train | 0.00 | PASS |
| opencode/qwen3.8-max | Fix the Vite build so it emits sourcemaps for a production bundle. | false | validation | 0.00 | PASS |
| opencode/qwen3.8-max | Write a pytest fixture that returns a database connection. | false | validation | 0.00 | PASS |
| opencode/qwen3.8-max | Resolve this TypeScript error about a missing property on an interface. | false | validation | 0.33 | PASS |
| opencode/qwen3.8-max | Explain the theory behind test doubles and when mocking too much hides a real bug. | false | validation | 1.00 | FAIL |
| opencode-go/deepseek-v4.1-flash | A test passes locally but fails in CI and nothing changed. | true | train | 1.00 | PASS |
| opencode-go/deepseek-v4.1-flash | The suite only fails when every test runs together. | true | train | 1.00 | PASS |
| opencode-go/deepseek-v4.1-flash | A mock stops recording calls after the first test in the file. | true | train | 1.00 | PASS |
| opencode-go/deepseek-v4.1-flash | I need to run one test file in one project without editing the config. | true | train | 1.00 | PASS |
| opencode-go/deepseek-v4.1-flash | The config file is ignored and the wrong projects run. | true | train | 1.00 | PASS |
| opencode-go/deepseek-v4.1-flash | Fake timers stop moving, and an async assertion is never awaited. | true | train | 0.67 | PASS |
| opencode-go/deepseek-v4.1-flash | Snapshots churn after we upgraded from Jest, and some are obsolete. | true | validation | 1.00 | PASS |
| opencode-go/deepseek-v4.1-flash | Coverage thresholds fail even though every test passes. | true | validation | 1.00 | PASS |
| opencode-go/deepseek-v4.1-flash | The suite takes twenty minutes, and one benchmark result looks wrong. | true | validation | 1.00 | PASS |
| opencode-go/deepseek-v4.1-flash | A browser test stopped finding the element it used to match. | true | validation | 1.00 | PASS |
| opencode-go/deepseek-v4.1-flash | Where should the double boundary sit when a function talks to a database: mock the repository or fake it? | false | train | 0.67 | FAIL |
| opencode-go/deepseek-v4.1-flash | Should the payments client get a stub or a spy, or is the design the problem? | false | train | 1.00 | FAIL |
| opencode-go/deepseek-v4.1-flash | Write a Playwright end-to-end test that logs in and checks the dashboard heading. | false | train | 0.33 | PASS |
| opencode-go/deepseek-v4.1-flash | How do we make the quality dashboard look better for management? | false | train | 0.00 | PASS |
| opencode-go/deepseek-v4.1-flash | Add a GitHub Actions workflow that builds and publishes the package. | false | train | 0.00 | PASS |
| opencode-go/deepseek-v4.1-flash | Set up Mocha with a TypeScript loader for an existing Node service. | false | train | 0.33 | PASS |
| opencode-go/deepseek-v4.1-flash | Fix the Vite build so it emits sourcemaps for a production bundle. | false | validation | 0.00 | PASS |
| opencode-go/deepseek-v4.1-flash | Write a pytest fixture that returns a database connection. | false | validation | 0.00 | PASS |
| opencode-go/deepseek-v4.1-flash | Resolve this TypeScript error about a missing property on an interface. | false | validation | 0.00 | PASS |
| opencode-go/deepseek-v4.1-flash | Explain the theory behind test doubles and when mocking too much hides a real bug. | false | validation | 0.00 | PASS |

36 of 40 trigger cases pass.

## Output results

### local-vs-ci-divergence
- PASS: The answer names the stray `.only` interaction with the `allowOnly` CI default.
  - evidence: **Cause:** the file's `.only` flag, not the environment in general. `allowOnly` defaults to `!process.env.CI`. Locally it is `true`, so only the focused test runs and the file passes. In CI it is `false`, so Vitest rejects the focused run — you get an error naming the test marked `.only` (or a run of everything, including tests your local run skipped). The `CI` variable is read once when the config object is created, so the pipeline's value governs the whole run. **Setting and default:** `allowOnly`, default `!process.env.CI`.
- PASS: The answer names a second distinct cause and the setting that explains it.
  - evidence: The remaining candidate is `update`, which defaults to `false` and then resolves to `new` locally and `none` in CI; check that by running the file twice with `CI=1` and seeing whether the second run fails on a missing snapshot the first never wrote.
- PASS: The answer gives one check that separates the two causes.
  - evidence: npx vitest run path/to/failing.test.ts --allowOnly=false - Fails with the same `.only` error → `allowOnly` is the cause. Fix: delete the `.only`; do not pass `--allowOnly=true` in the pipeline. - Passes → selection is not the cause. The remaining candidate is `update`, which defaults to `false` and then resolves to `new` locally and `none` in CI; check that by running the file twice with `CI=1` and seeing whether the second run fails on a missing snapshot the first never wrote.

### mock-lifecycle-after-upgrade
- PASS: The answer distinguishes clearing from resetting, including that `mockReset` drops the queued implementation.
  - evidence: | `mockReset()` / `vi.resetAllMocks()` | emptied | dropped — the mock returns `undefined` | So a mock that returns `undefined` in the second test was **reset**, not cleared. Clearing alone never changes a return value. Look for `mockReset`, `vi.resetAllMocks()`, or `resetMocks` in the config, and check whether anything in the file calls `mockReturnValue` only once, in the first test.
- PASS: The answer states that automatic clearing is unsafe with concurrent tests.
  - evidence: `clearMocks: true` runs `vi.clearAllMocks()` **before every test**. With `test.concurrent` that is a global side effect: a test that finishes clears the call history that another test is still asserting on. The result is an empty history in a test that just called the function, and it varies run to run.
- PASS: The answer names `vi.doMock` as the unhoisted alternative to a hoisted call.
  - evidence: `vi.doMock()`. `vi.mock` is hoisted above every import, so it throws anywhere except module top level, and it only affects imports that resolve after hoisting. `vi.doMock` is not hoisted: it affects only the imports made **after** the call, so the per-test pattern is

### browser-locator-strictness
- PASS: The answer names `browser.locators.exact` defaulting on and how to override it.
  - evidence: **Default that changed:** `browser.locators.exact` now defaults to `true`. Every text locator must match the element's whole text, case-sensitively, after trimming whitespace. So `getByText('Item')` no longer matches an element reading `Item 1` — it fails instead of matching loosely. A locator options object also takes `exact: false` per call. A `RegExp` argument ignores the option entirely. This keeps the strict default for every other locator.
- PASS: The answer gives the partial fix and the exact-name fix, naming `toMatchTextContent` as the partial matcher.
  - evidence: **Fix that matches the whole accessible name:** use a role query with the full name: page.getByRole('button', { name: 'Item 1' }) **Matcher for a partial text match:** `toMatchTextContent` (accepts a partial string or `RegExp`). `toHaveTextContent` compares the whole text for equality, so it is the wrong matcher for a label with a changing suffix.
- PASS: The answer names the failure-inspection surface, such as the ARIA snapshot or trace view.
  - evidence: **When the locator itself fails:** read what the failure printed. The default `browser.locators.errorFormat` is `'all'` — the ARIA snapshot first, then the HTML; narrow it to `'aria'` or `'html'`. Check the ARIA snapshot before the HTML: it shows the accessible name the locator actually saw, so a role query that fails usually means the element has no accessible name. For "what did the page look like", record a trace: the trace view keeps failed tests by default, and the Playwright provider adds `browser.trace` (default `'off'`, use `'retain-on-failure'`). **When the locator itself fails:** read what the failure printed. The default `browser.locators.errorFormat` is `'all'` — the ARIA snapshot first, then the HTML; narrow it to `'aria'` or `'html'`. Check the ARIA snapshot before the HTML: it shows the accessible name the locator actually saw, so a role query that fails usually means the element has no accessible name. For "what did the page look like", record a trace: the trace view keeps failed tests by default, and the Playwright provider adds `browser.trace` (default `'off'`, use `'retain-on-failure'`).

9 of 9 assertions pass.

## Cost per arm

| Model | Arm | Runs | Avg time (ms) | Tokens | Est. cost (USD) |
| --- | --- | --- | --- | --- | --- |
| opencode-go/deepseek-v4.1-flash | baseline | 60 | 16599 | 346517 | 0.057412 |
| opencode-go/deepseek-v4.1-flash | baseline | 3 | 85946 | 325535 | 0.015679 |
| opencode-go/deepseek-v4.1-flash | enabled | 60 | 16576 | 506533 | 0.071246 |
| opencode-go/deepseek-v4.1-flash | enabled | 3 | 18002 | 112505 | 0.008474 |
| opencode/qwen3.8-max | baseline | 60 | 14366 | 423489 | 0.883077 |
| opencode/qwen3.8-max | baseline | 3 | 80043 | 801593 | 0.486052 |
| opencode/qwen3.8-max | enabled | 60 | 12110 | 537269 | 0.940703 |
| opencode/qwen3.8-max | enabled | 3 | 11550 | 117698 | 0.131798 |
