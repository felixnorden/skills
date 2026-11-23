# Running and filtering

Covers selecting what runs: one file, one test, one project, or the tests a change
affects. It selects an existing project and does not explain why the project set is
what it is; why a suite is slow belongs to the performance reference.

## Contents

- One file
- One test
- One project
- Changed, last-failed, and since-last-run
- List without running
- When the filter matches nothing

## One file

A positional argument matches a substring of the file path, and it is a plain
inclusion check rather than a pattern, so `vitest utils` selects every file whose
path contains that text. See `vitest.dev/guide/cli`.

To run one test at one place in a file, append the line number to the full filename:

```bash
npx vitest basic/foo.test.ts:10
```

The filename must be complete: a partial name, a missing extension, or a line range
is not accepted. Several positions can be passed as separate arguments.

Check the selection before reading a failure: a positional filter that matched one
file makes a full-suite failure look like a single-file failure. Fix by quoting the
path when it contains a space, and by adding `-t` to narrow inside the file instead
of relying on a filename substring. See `vitest.dev/guide/filtering`.

## One test

`-t` and `--testNamePattern` filter by test name and accept a regular expression.
The name they match is the full name: the enclosing suite names and the test name
joined with ` > `, so a substring that ignores the suite can match more than one
test. See `vitest.dev/config/testnamepattern`.

Symptom: a name filter matches nothing, or matches far more than expected.

Check the full name in the reporter output, then quote the pattern. A dot in a test
name is a regular-expression wildcard unless it is escaped, which is the usual
reason a pattern matches too much.

Fix by anchoring the pattern or by combining it with a file filter. A file filter
and a name filter narrow together, so the cheapest correct selection names both.

## One project

`--project` selects one or more projects by name and accepts a glob or a negation.
Nested projects are prefixed with the name of the config that declares them, and the
filter matches that prefix as well, so `--project app` runs every project of one
config while a parenthesized name runs one. See `vitest.dev/guide/projects` and
`vitest.dev/config/projects`.

Check the resolved project list before changing the filter: the debug variable for
project resolution prints every project, which glob matched, and why a project was
dropped by the filter.

Fix a project that is silently skipped by correcting its name in the config or by
widening the filter. A config file that declares projects runs no tests of its own,
so selecting the declaring config by name selects only its children.

## Changed, last-failed, and since-last-run

Three flags select a subset without naming it, and they differ in what they compare
against:

- `--changed` compares the working tree with a Git reference. With no value it uses
  uncommitted changes; `--changed HEAD~1` or a branch name moves the baseline. The
  run selects test files whose import graph reaches a changed file. See
  `vitest.dev/config/changed`.
- `--since-last-run` records the files each test loaded and selects a test when one
  of them is newer than its last run. A test that failed last time runs again until
  it passes. See `vitest.dev/guide/recipes/affected-tests`.
- `--last-failed` reads the results cache and selects the files that failed. It
  combines with a name filter, which is how one failing test in a large file is
  rerun. See `vitest.dev/guide/cli`.

Check which baseline the flag compares against before trusting a green run:
`--changed` needs a Git repository, and a committed change stops counting as
changed even when the tests never ran against it.

Fix a selection that misses an affected test by looking at what the tool can see.
A file a test never loaded, such as a new environment file, is not detected, so a
pipeline check that must be complete runs the full suite rather than a selection.

`vitest related <paths>` answers the same question from the other side: given source
files, it runs the test files that cover them. It follows static imports only, so a
dynamic import loop does not join the graph. See `vitest.dev/guide/cli`.

## List without running

`vitest list` prints what a selection would run. It inherits the same filters,
ignores the reporter option, and accepts `--filesOnly` to print test files instead of
test names. See `vitest.dev/guide/cli`.

In this major the listing parses test files statically instead of running them, so a
file with a top-level side effect is no longer executed to produce the list. A list
that differs from a run therefore points at collection, not at execution.

Check a filter with `list` before a long run: it answers "did the selector match
anything" in seconds. Fix a wrong list by correcting the filter rather than the
file, since the list and the run share one collection step.

## When the filter matches nothing

Symptom: the process reports no test files, exits successfully, and the change looks
verified.

A filter that matches nothing collects nothing. Whether that passes depends on the
setting that decides how an empty run is treated, so a pipeline can be green on an
empty selection. See `vitest.dev/guide/cli`.

Check the collected count, not only the exit code, in a pipeline step that relies on
a selection. Fix by running the selector through the listing command first, and by
keeping one full run as the check that a selection is not silently empty.

The same trap exists inside a file: a name filter that matches nothing leaves the
file collected and every test skipped, which reads as a passing file. A reporter that
shows skipped tests makes the difference visible.
