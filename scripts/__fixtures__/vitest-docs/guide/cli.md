---
title: CLI | Guide
---

# Command Line Interface {#cli}

## Commands

- **`vitest`** starts a run in watch mode when the terminal is interactive.
- **`vitest run`** forces a single run and exits when the last file finishes.
- **`vitest list`** parses test files statically and prints the collected names.
- **`vitest bench`** runs only the benchmark files a project collects.
- **`vitest init`** writes a starter configuration for a selected provider.

## Options

- **`--project`** selects one project by its name; repeat it to select several.
- **`--reporter`** selects a reporter; pass `--reporter=json` with an output file.
- **`--coverage`** enables coverage collection for the run.
- **`--config`** points at a configuration file outside the project root.
- **`--mode`** sets the mode a configuration file reads through `mode`.
- **`--changed`** limits the run to files changed since a revision.
- **`--shard`** splits the collected files across parallel pipeline jobs.
- **`--bail`** stops after the configured number of failing files.

## Reporter output

The JSON reporter writes one file under the artifacts directory instead of
streaming results, and the `stdout` option on the reporter entry restores piping.

The JUnit reporter behaves the same way, so an empty terminal after a passing run
means the report went to a file rather than to standard output.

A reporter can be repeated on the command line, and each one writes its own output
independently of the others.

## Exit codes

A run exits non-zero when at least one test fails, or when a threshold configured
for the run is not met by the measured value.

A run exits zero when every collected file passes, including a run that collected
no tests at all unless the pass-with-no-tests setting forbids it.

## Filters

A positional argument is treated as a substring of the file path, so it selects
files before any test is collected.

The name filter matches the full name a test reports, which is the suite names and
the test name joined by a separator.

A filter that matches nothing reports no tests, and the exit code depends on the
setting that decides whether an empty run passes.

## Watch

Watch mode re-runs the affected files when a tracked file changes and reads its
initial selection from the command line.

Pressing a key in watch mode opens the interactive filter, which narrows the run
without restarting the process.

## Coverage

Coverage collection is enabled for a run with the coverage flag and configured
under the coverage key of the configuration object.

Passing a coverage threshold on the command line overrides the value in the
configuration for that run only.

## Bail and shard

The bail option stops the run after a number of failing files, which shortens a
pipeline step that would otherwise run every file against a broken change.

The shard option takes an index and a total, and the runner assigns each collected
file to one shard by a stable hash of the file path.

Two pipeline jobs that pass the same total and different indexes therefore cover
every collected file exactly once, without sharing a queue.

## Debugging

A debug environment variable prints the resolved configuration before any file is
collected, which answers why an option took the value it did.

The same variable family prints module resolution, which answers why a dependency
resolves to one copy in a pipeline and another on a developer machine.

Verbose reporter output and the debug variables are both diagnostics for the run
itself; neither changes which files the run collects.

## Configuration flags

Any option in the configuration object can be set from the command line with dot
notation, and a dot-notation flag wins over the file for that run.

An option that takes an object is set one leaf at a time, which keeps a pipeline
override small enough to read in a job definition.
