# Performance

Covers where a run's time goes, which single axis to change, and how to read a
benchmark result. Selecting which tests run belongs to the filtering reference, and
coverage thresholds belong to the coverage reference.

## Contents

- Find where the time goes
- One axis at a time
- Benchmarks
- Reading a benchmark result
- When selection is the real fix

## Find where the time goes

Symptom: a suite that got slower with no obvious new test.

Start from the measured breakdown, not from a guess. The duration report separates
import, environment, and test execution, and the import breakdown names the slowest
modules. See `vitest.dev/guide/profiling-test-performance`.

- Import time is dominated by evaluating the same module graph per file, which is
  what isolation costs.
- Environment time is dominated by creating a DOM: a simulated DOM is expensive per
  file, and an isolating pool pays it for every file.
- Test execution time is the code under test and the waits inside it.

`vitest doctor` measures the alternatives instead of estimating them: it runs the
suite under candidate configurations and reports the comparison, including whether
the suite passes with isolation off. See `vitest.dev/guide/improving-performance`.

Check the breakdown before changing a setting. A suite that spends its time in the
environment will not get faster from a worker count change.

## One axis at a time

Change one of these per run, and keep the pass or fail result beside the timing:

- `pool` decides the worker mechanism and defaults to `forks`. `threads` is faster
  to communicate with; `vmThreads` and `vmForks` give each file a VM context. See
  `vitest.dev/config/pool`.
- `maxWorkers` is the bound on simultaneous workers, accepts a number or a
  percentage, and defaults to all available parallelism outside watch mode. See
  `vitest.dev/config/maxworkers`.
- `isolate: false` trades a fresh module graph for speed and makes module state
  shared between the files one worker runs. Trade it only for files that mutate no
  module state, stub no global, and patch no prototype.
- `fsModuleCache` persists transformed modules across runs, which shortens the
  import phase of a later run. It is on by default here, and `VITEST_FS_MODULE_CACHE`
  can disable it without a config edit. See `vitest.dev/config/fsmodulecache`.
- The shared Vite server serves inline projects, so their transform work happens
  once instead of once per project. See `vitest.dev/guide/advanced/pool`.

Check each axis by rerunning the same selection, not the whole suite, so the number
measures the change rather than a different workload.

One caution: `vitest doctor` prefers the candidate that keeps per-file isolation
when two candidates are close, and it validates `isolate: false` by running the
suite twice with a shuffled order. A faster candidate that fails the shuffle is not
a recommendation.

## Benchmarks

Benchmarks live in their own files and their own project. The `bench` fixture comes
from the test context rather than from a top-level import, and it is only available
in files matched by `benchmark.include`, whose default is
`**/*.{bench,benchmark}.?(c|m)[jt]s?(x)`. Using it in a regular test file throws.
See `vitest.dev/guide/benchmarking`.

Without `benchmark.enabled`, the plain command runs only regular tests and ignores
benchmark files. Three ways to run them exist: enable benchmarks for the run, use
the `bench` subcommand for benchmarks only, or filter by file and by name. See
`vitest.dev/config/benchmark`.

A benchmark that measures nothing is the common false result. If the callback has no
observable side effect, the engine may remove the work. Return or use the value so
the computation has to happen.

## Reading a benchmark result

The report prints operations per second, mean time, and percentiles for each
benchmark, plus a comparison table when several benchmarks run together.

- A result that varies more between runs than between libraries is noise. Repeat
  the run before reading a winner.
- A comparison needs the same environment and the same input size; a benchmark that
  allocates differs from one that reuses a buffer.
- The benchmark provider decides how samples are collected and how the result is
  rendered. See `vitest.dev/guide/advanced/benchmark-provider`.

Persisting a result makes a regression visible across runs: `writeResult` on one
benchmark writes a JSON file under the project root, and `bench.from()` reads a
stored result back for comparison. The file is overwritten on every successful run,
so it is a baseline, not a history. See `vitest.dev/guide/benchmarking`.

Check whether the stored baseline came from the same machine and the same pool. Fix
a suspicious result by rerunning the stored comparison before changing the code.

## When selection is the real fix

A slow run is sometimes a run that executes more than the change touches. Before
turning a performance knob, ask whether the same feedback arrives from a narrower
selection:

- One file, one test name, or one project cuts the work without changing the
  configuration.
- Changed-file and last-failed selection reuse the results cache to run what a
  change affects.

Those selections belong to the filtering reference; this reference measures what a
run costs. If the whole suite must run, the axis changes above are the levers. If
only a part must run, selection is cheaper and carries no state hazard.
