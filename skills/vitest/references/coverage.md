# Coverage

Covers what a report includes and how a threshold is evaluated. Instrumentation
cost belongs to the performance reference, and test design is outside this skill.

## Contents

- What is counted
- Thresholds
- Reading a truncated report
- Coverage is not a quality goal

## What is counted

Symptom: a file that the tests exercise is missing from the report, or a file that
no test imports appears in it.

`coverage.include` and `coverage.exclude` decide the file set, and patterns are
matched against each file's path relative to the project root. A pattern with no
wildcard is treated as a directory and covers everything inside it, so `src` means
`src/**`. See `vitest.dev/config/coverage`.

By default only files that a test imported are counted, which is why an untouched
module never appears. Add an include pattern for the directories the report must
cover, and an exclude pattern for generated or vendored files.

Check the resolved include list before concluding that instrumentation is broken.
Fix a missing file with an include pattern; fix an unwanted file with an exclude
pattern. Raising the include surface also moves every percentage, because an
uncounted file becomes a counted one.

Coverage output is separate from the test reporters: `coverage.reporter` decides
the coverage format, and `test.reporters` does not affect it. A coverage setting
added to the reporter list therefore has no effect. See
`vitest.dev/config/reporters` and `vitest.dev/guide/coverage`.

## Thresholds

Symptom: a threshold failure whose percentage does not match the printed table.

Thresholds are compared per project and per threshold type, with a global value and
optional glob-pattern overrides. Two rules explain most surprises:

- A glob-pattern threshold does not inherit the top-level `perFile` flag. Set
  `perFile` on each glob explicitly when it should apply there.
- `perFile` accepts an object as well as a boolean, so one file kind can hold a
  stricter bound than another.

See `vitest.dev/config/coverage`.

Check which project produced the failure, then which glob matched the file. Fix by
setting the threshold at the narrowest scope that expresses the intent, and by
keeping the top-level value as the floor for everything else.

## Reading a truncated report

Symptom: the text report lists a summary but almost no files, and no setting was
changed.

When Vitest detects it is running inside an AI coding agent, it trims the default
text report: `skipFull` is set, so files at 100 percent are omitted, and a
`text-summary` reporter is added automatically so the totals survive the trimming.
See `vitest.dev/guide/coverage` and `vitest.dev/config/coverage`.

The trimming applies only when the `text` reporter is already active, and an
explicitly configured reporter list is never rewritten. A short report is therefore
expected behaviour in an agent environment, not a bug.

Check the active reporter list before adding a reporter. Fix by reading the summary
row for totals, or by asking for one extra format such as `json-summary` when a
machine has to parse the result.

Coverage of code that runs in a subprocess needs its own setting, because a
subprocess starts without the parent's instrumentation. See
`vitest.dev/config/coverage`.

## Coverage is not a quality goal

A coverage number says which lines ran, not whether a test would notice a wrong
result. A suite can reach a high percentage with assertions that pass on any value,
and a threshold cannot tell the two apart.

When a threshold fails on a passing suite, the useful fix is to name the file that
lost coverage and read the test that was meant to cover it. A threshold raised
without that reading buys a number, not evidence.

Use the report to find untested paths, then decide by risk which paths deserve a
test. A path that no test can reach, such as a defensive branch, is better excluded
from the include set than covered by a test written for the number.
