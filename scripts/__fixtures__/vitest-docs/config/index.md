---
title: index | Config
---

# Config {#config}

Configuration is read from the current working directory only, so a run started
from a nested package does not pick up a config file higher in the tree.

## allowOnly

The `allowOnly` option decides whether a focused test (`.only`) is allowed to run.

- **Type:** `boolean`
- **Default:** `!process.env.CI`

A stray `.only` therefore narrows the run on a developer machine and produces no
tests or a failure in a pipeline, where the default forbids a focused run.

The value is resolved once per project, so an inline project can flip it without
touching the root configuration object.

When the option is false and a file still calls `.only`, the focused cases are
ignored and the rest of the file runs normally, which looks like a selection bug.

## update

The `update` option decides whether snapshot files are rewritten during a run.

- **Type:** `boolean | 'new' | 'none' | 'all'`
- **Default:** `false`

With the default, a snapshot whose content differs is reported as a failure and
no snapshot file is touched, which is the behaviour a pipeline depends on.

The string form lets a run write only new snapshots while leaving existing ones
alone, so a first pipeline run can create files without rewriting old output.

This is the setting that differs between a developer machine and a pipeline when
the command line passes an update flag in one place and not the other.

## watch

The `watch` option decides whether the process stays alive and re-runs on change.

- **Type:** `boolean`
- **Default:** `!process.env.CI && process.stdin.isTTY`

When watch mode is disabled, a single run starts and the process exits as soon as
the last test file finishes, so a pipeline step never waits for input.

A pipeline that allocates no terminal sees the default resolve to false even when
the configuration file never mentions the key.

Watch mode reads the terminal state at startup, so redirecting output to a file
inside a terminal session does not by itself turn watch mode off.

## reporters

The `reporters` option selects how results are written and defaults to the default
terminal reporter, which streams the whole result set to standard output.

A reporter that writes a file, such as the JSON or JUnit reporter, places its
output under the artifacts directory instead of printing every result line.

The `stdout` option on a reporter entry restores piping, so a report can be both
written to a file and streamed for a log viewer to collect.

Switching the reporter changes where a pipeline must look for the result, and an
empty terminal after a passing run usually means the report went to a file.

## include

The `include` option lists the globs a project collects and defaults to the test
file patterns under the project root.

A pattern is matched against the path relative to the project root, so a leading
`**/` is only needed when the files sit in nested directories.

A file outside every include glob is never collected, and a run that reports zero
files usually selected a project whose include list does not reach the file.

## exclude

The `exclude` option removes paths from collection and defaults to the dependency
directory plus the artifact directory.

Exclusion is applied after inclusion, so a file matched by an include glob is
still skipped when an exclude glob matches it.

## setupFiles

The `setupFiles` option lists modules that run before every test file, and the
modules run inside the same worker as the file they precede.

A setup module that mutates a global leaves the mutation visible to every test in
that worker, which is the usual source of state that leaks between files.

## environment

The `environment` option selects the globals a test file sees and defaults to the
node environment.

A per-file doc comment can override the environment for one file without changing
the project option or the configuration file.

## isolate

The `isolate` option decides whether each test file gets a fresh module registry.

- **Type:** `boolean`
- **Default:** `true`

With isolation on, a module imported by two test files is evaluated twice, so a
module-level counter starts from its initial value in each file.

Turning isolation off is a speed trade and makes module state shared between the
files that one worker runs in sequence.

## retry

The `retry` option repeats a failing test a fixed number of times and defaults to
zero, so a failure is reported on the first attempt.

A retry of one or more hides an intermittent failure rather than diagnosing it,
because the report shows only the final attempt's result.

## testTimeout

The `testTimeout` option bounds one test body and defaults to a value large enough
for most synchronous assertions.

An asynchronous test that waits on a promise without a timeout fails with the test
timeout message rather than the assertion message the author expected.

## Project defaults

A test's project is resolved from the config file that declares it, and a project
inherits the root options unless it overrides the same key in its own object.

An inline project that overrides an array option appends to the inherited array
rather than replacing it, which is why a root `include` still applies inside a
project that adds its own globs.

A config file that declares projects runs none of its own tests, so a pipeline
that reports zero tests usually selected a project name that does not exist.

The artifact directory is shared by every project, and each project writes its
own report file under the directory rather than replacing the root one.

## Environment

The configuration object is evaluated once, before any test file is collected, so
a value read from the environment at that moment is the value every test sees.

A pipeline that exports a different value between the build step and the test step
gets two different configurations from the same commit.

Every option that reads `process.env` at configuration time is therefore a place
where local and pipeline behaviour can diverge without a code change.

The resolved configuration can be printed with a debug environment variable, which
shows the value each option took after defaults were applied.

## Artifacts

The artifact directory holds reports, snapshots that were written, and the cache
that later runs read for changed-file and last-failed selection.

A pipeline that keeps the artifact directory between runs keeps the results cache,
so a last-failed selection on the next run starts from the previous result set.

Removing the artifact directory between runs is safe and costs only the selection
history that the cache would have supplied.
