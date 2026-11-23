# Snapshots and inspected output

Covers a snapshot that churns, an obsolete entry, and inspected output whose shape
changed. It states present behaviour only: the rename inventory belongs to the
migration reference, and why a setting resolves differently in a pipeline belongs
to the local-versus-pipeline reference.

## Contents

- Update modes
- Obsolete snapshots
- Inspected output shape
- File and image snapshots
- When the output changed because behaviour changed

## Update modes

Symptom: a snapshot failure that nobody asked for, or a snapshot file that changes
without a code change.

`update` decides what a run writes, and its default `false` resolves by
environment: a local run behaves like `new`, a run with `CI` set behaves like
`none`. See `vitest.dev/config/update`.

- `true` or `'all'` rewrites every changed snapshot and deletes obsolete entries.
- `'new'` writes snapshots that do not exist yet and leaves existing files alone.
- `'none'` writes nothing and fails on a mismatch, a missing snapshot, or an
  obsolete entry.

Check the flag a command passes before reading the test: `-u` and `--update` are
easy to leave in a package script. Fix by writing snapshots deliberately on the
machine and committing them, and by keeping the default in a pipeline so a
mismatch fails instead of silently rewriting.

A test can also update without a flag: pressing `u` in watch mode updates failed
snapshots. That is a machine-only convenience and never a pipeline setting. See
`vitest.dev/guide/learn/snapshots`.

## Obsolete snapshots

Symptom: a snapshot file mentions a test that no longer exists, or a rename leaves
an entry behind that nobody reads.

An obsolete snapshot is an entry, or a whole file, that matches no collected test.
It is reported as a failure while the update mode is `none`, and an update run
removes it. See `vitest.dev/guide/snapshot`.

Check the failure text for the word obsolete before editing any expectation: an
obsolete entry is not a mismatch, so changing a value will not clear it.

Fix by running an update locally so the entry is removed, then reviewing the diff:
the deletion is the evidence that the test was renamed or deleted rather than
silently dropped.

One setting changes what the failure looks like: `expandSnapshotDiff` prints the
full diff instead of a patch, which is the difference between a readable and an
unreadable CI log for one changed value. See `vitest.dev/config/expandsnapshotdiff`.

## Inspected output shape

Snapshots are rendered by `@vitest/pretty-format`, with Vitest defaults applied
before any `snapshotFormat` override: `printBasicPrototype` is off, strings are not
escaped, regular expressions are escaped, and function names are not printed. See
`vitest.dev/config/snapshotformat`.

Symptom: an inspected object gained or lost a prototype line, or a diff moved when
nothing in the code changed. Check whether the value crosses a formatter option
before rewriting the snapshot.

The formatter also decides how a generated test title looks. Values interpolated
into a title by `test.each` and `test.for` are truncated at 40 characters by
default through `taskTitleValueFormatTruncate`, and `0` disables the truncation.
A snapshot whose key changed without a code change is usually a title that got
shorter or longer. See `vitest.dev/config/tasktitlevalueformattruncate`.

Two further formatter settings apply per project:

- `snapshotSerializers` adds serializer modules, which is how a class or a
  framework value gets a stable representation. See
  `vitest.dev/config/snapshotserializers`.
- `resolveSnapshotPath` moves where snapshot files live; the default is a
  `__snapshots__` directory beside the test. A file that appears in the wrong
  place is this function, not the matcher. See `vitest.dev/config/resolvesnapshotpath`.

## File and image snapshots

`toMatchFileSnapshot` compares against a file of any extension, which is the form
for HTML, JSON, or generated output that a reader should open directly. It returns
a promise, so it must be awaited; an unawaited call fails the test at the end
instead of at the line. See `vitest.dev/guide/snapshot`.

Do not point `toMatchFileSnapshot` at a path Vitest manages, such as a `.snap` file
beside the test. Choose a separate path pattern for file snapshots so an update run
cannot rewrite one through the other.

Image snapshots need browser mode and `toMatchScreenshot`, which captures a
screenshot, compares it against a reference image, and writes references into its
own directory. The assertion is asynchronous as well. See
`vitest.dev/guide/browser/visual-regression-testing`.

Check whether a new file appeared where the assertion writes before assuming the
comparison failed: a first run writes the reference, and a second run compares
against it.

## When the output changed because behaviour changed

A snapshot is evidence, not a specification. When the diff is intended, update the
snapshot and keep the code change in the same commit, so the reviewer sees one
reason for both.

When the diff is not intended, the snapshot is doing its job: read the diff, find
the code path that changed the value, and fix that. An update run that clears the
diff without a code change removes the only signal the test had.

Symptom: a snapshot that passes alone and fails in a full run, or the reverse. That
is order or shared state, not a snapshot problem; reproduce it with a fixed seed
before touching the snapshot.
