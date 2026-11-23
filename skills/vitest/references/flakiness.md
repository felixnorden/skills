# Flakiness and order dependence

Covers a failure that appears only in a full run, only sometimes, or only in one
worker. The mock lifecycle is a check to run here, not a mechanism explained here;
clock control and worker-count tuning belong to other references.

## Contents

- Reproduce before diagnosing
- Order dependence
- Isolation and shared module state
- Per-worker state
- When it is not order
- Schedule knobs and what each one hides

## Reproduce before diagnosing

Turn "sometimes" into "always" before reading a cause. A repeat that fails
reliably is a diagnosis; a repeat that passes is evidence of a schedule cause, not
proof that the bug is gone.

- `--repeats=<n>` runs every test n more times and fails the test if any
  repetition fails. See `vitest.dev/config/repeats`.
- `test({ repeats: n })` does the same for one test and takes precedence over the
  option.
- `--sequence.shuffle` randomizes order and prints nothing about the seed, so pass
  `--sequence.seed=<n>` to make the failing order reproducible. See
  `vitest.dev/config/sequence`.

Cheapest loop once a failing order exists: run the single file with the recorded
seed, then run it in the full suite with the same seed. A failure that needs the
full suite is order or state; a failure that reproduces alone is neither.

## Order dependence

Symptom: the suite fails together, each file passes alone, and a shuffled run
changes which test fails.

- `sequence.shuffle.files` randomizes file order and is resolved from the root
  config only, because file order is shared across projects.
- `sequence.shuffle.tests` randomizes the order inside one file.
- `sequence.seed` fixes the order for a rerun.
- `sequence.hooks` changes hook order. `stack` reverses "after" hooks, `list`
  keeps definition order, `parallel` runs hooks in one group at the same time. See
  `vitest.dev/config/sequence`.

Check whether the failing test depends on another test's work by running it alone
with the same seed, then running it after the file that usually precedes it.

Fix the dependency, not the schedule: a test that reads state another test wrote
belongs in the same file with an explicit setup, or the shared setup belongs in a
hook that both files run.

## Isolation and shared module state

`isolate` defaults to `true`: each test file gets a fresh module graph, so a
module-level counter starts from its initial value in every file. Shared module
state can only leak when isolation is off. The option has no effect on the
`vmThreads` and `vmForks` pools. See `vitest.dev/config/isolate`.

Isolation is safe to turn off for a file that does none of these:

- mutate module-level state, such as counters, caches, or top-level bindings
- stub a global or an environment variable
- patch a prototype such as `Date.prototype`
- register listeners on `process` or another long-lived emitter
- depend on a fresh module instance for a mock factory

If any applies, isolation is doing real work. Apply `isolate: false` to the unit
suite through a project rather than to the whole config, so the integration suite
stays isolated. See `vitest.dev/guide/recipes/disable-isolation`.

Files run in parallel by default, so two files can meet inside a shared resource
even when neither leaks module state. `fileParallelism: false` runs one file at a
time and overrides `maxWorkers` to `1`. See `vitest.dev/config/fileparallelism`
and `vitest.dev/guide/parallelism`.

## Per-worker state

Symptom for this section: a test behaves differently depending on which worker ran
it. It passes alone, fails beside other files, or two files disagree about a
shared resource such as a database or a temporary directory.

Each worker has an identity, and the ids now start at `1` rather than `0`, so
arithmetic written against a zero-based id is off by one:

- `VITEST_POOL_ID` is a pool slot number, always at most the worker count.
- `VITEST_WORKER_ID` is unique per created worker and keeps increasing when a
  worker is replaced.

The pool id is the one a setup module reads to spread work across workers. See
`vitest.dev/config/setupfiles` and `vitest.dev/guide/migration`.

Check by logging both ids from a setup module, then rerun the failing file alone:
the same failure in a single worker is state, and a failure only under parallelism
is a per-worker collision.

Fix a per-worker database with a file-scoped fixture and a transaction around each
test: the fixture opens one connection per file, `onCleanup` closes it, and
`aroundEach` rolls each test back so no test sees another's writes. Switch the
fixture to `worker` scope only together with `isolate: false`, which is what lets
several files share one connection. See `vitest.dev/guide/recipes/db-transaction`.

## When it is not order

- A mock that keeps calls from an earlier test looks like order dependence.
  Check it first: read the file for a manual clear or reset, and run the suspect
  test alone in a fresh worker. The lifecycle itself belongs to the mocking
  reference.
- An asynchronous resource that outlives the test shows up as a failure in a
  neighbouring file. `--detectAsyncLeaks` logs the leaking resource after the run
  and is slow, so enable it for one debug run. See
  `vitest.dev/config/detectasyncleaks`.
- A cached result can make a rerun disagree with a clean run. The cache stores
  whether a file failed, which tests failed, and how long it ran, and a filtered
  run can mark a file failed but never passed. `--clearCache` removes it. See
  `vitest.dev/config/cache`.
- A clock that does not advance fails in a pattern that looks random. A test that
  passes with a longer timeout is a timing cause, not an order cause.

## Schedule knobs and what each one hides

| Knob | What it changes | What it hides |
| --- | --- | --- |
| `repeats` | Runs one test more times | A failure that needs another file |
| `sequence.shuffle` | Order of files or tests | A dependency on definition order |
| `sequence.seed` | Reproduces one shuffled order | Nothing; it is the diagnostic |
| `sequence.hooks` | Order of lifecycle hooks | A hook that assumes another ran first |
| `isolate` | Fresh module graph per file | Module-level state shared between files |
| `fileParallelism` | One file at a time | A collision inside a shared resource |

Each knob either reproduces a failure or removes the condition that causes it.
Use the first to diagnose, and change the second only after the cause is named:
turning off parallelism to make a suite green hides the collision that a pipeline
will still hit at a different worker count.
