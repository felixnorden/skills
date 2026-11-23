# Local and CI

Explains why one commit behaves differently in a pipeline than on a machine:
which defaults read the environment, which selections differ, and where a report
actually landed. It explains a divergence; it does not act on a stale snapshot
and does not diagnose order dependence.

## Contents

- Checks in cost order
- Selection differs in CI
- Update mode differs in CI
- Watch mode falls back to a run
- Where reports and artifacts land
- Defaults that read the environment

## Checks in cost order

Reproduce the pipeline condition before reading any cause, cheapest first:

1. Run the failing file with the pipeline's environment variable set:
   `CI=1 npx vitest run <file>`. If it fails only with `CI` set, the cause is one
   of the environment-reading defaults below.
2. Run the same file from the same working directory the pipeline uses. Config
   lookup starts at `root` and does not search parent directories, so a job that
   changes directory can pick a different config or none.
3. Run the same file with `--reporter=verbose` and compare the file list with the
   machine run. A differing list is a selection cause, not a timing cause.

Everything below is resolved when the configuration object is created, before any
test file is collected. The value your pipeline exports at that moment is the
value every test in the run sees. See `vitest.dev/config`.

## Selection differs in CI

Symptom: a focused subset runs on the machine, while the pipeline either runs
every test or fails with an error naming a test marked `.only`.

The cause is `allowOnly`, which defaults to `!process.env.CI`: a focused run is
permitted locally and rejected in a pipeline. See `vitest.dev/config/allowonly`.

Check the file for the flag, not the config:

```bash
grep -n '\.only' path/to/failing.test.ts
```

Fix by deleting the `.only`. If a focused run is genuinely wanted in one place,
pass `--allowOnly=true` for that command; if the pipeline must catch the flag
earlier, keep the default and let the suite fail. `--allowOnly=false` reproduces
the pipeline verdict on the machine.

## Update mode differs in CI

Symptom: a snapshot file appears on the machine, while the pipeline fails with a
missing snapshot, or a pipeline run appears to rewrite test-owned files.

The cause is `update`, which defaults to `false` and then resolves by
environment: a local run behaves like `new`, and a run with `CI` set behaves like
`none`. `new` writes snapshots that do not exist yet; `none` writes nothing and
fails on a missing, mismatched, or obsolete snapshot. See `vitest.dev/config/update`.

Check by running the file twice with `CI=1`. If the second run fails on a missing
snapshot that the first run did not create, update mode is `none`.

Fix by committing the snapshot files the run needs. On the machine, `--update=new`
writes new snapshots without touching existing ones; `--update=none` reproduces
the pipeline verdict before you push.

## Watch mode falls back to a run

Symptom: the process stays alive on the machine, or a pipeline step exits after
one run, or a shared script makes a pipeline job hang waiting for input.

The cause is `watch`, which defaults to `!process.env.CI && process.stdin.isTTY`,
and is `false` when Vitest detects an AI coding agent. A pipeline or an agent
shell allocates no interactive terminal, so the plain `vitest` command executes
one run and exits. `vitest run` forces that behaviour anywhere, and `-w` forces
watch mode. See `vitest.dev/config/watch` and `vitest.dev/guide/cli`.

Check the command a job runs before checking the config file: a shared script that
passes `-w` is the usual reason a job waits forever.

Fix by running `vitest run` in pipeline steps. Keep `vitest` for the interactive
machine, where the same command gives you watch mode.

## Where reports and artifacts land

Symptom: the terminal is empty after a passing run, a step that reads stdout finds
no result, or an artifact upload finds no file.

The `json`, `junit`, and `html` reporters write a file under the shared artifact
directory rather than streaming results:

- `json` writes `.vitest/json/output.json`
- `junit` writes `.vitest/junit/output.xml`
- `html` writes `.vitest/index.html`

`outputFile` overrides the JSON and JUnit locations. The `html` reporter uses its
own `outputDir` option instead, and the report entry is written under it. Setting
`stdout: true` on the JSON or JUnit reporter prints the report instead, and that
option is ignored when `outputFile` is set. See `vitest.dev/guide/reporters`.

Check what the last run left behind:

```bash
ls .vitest
```

Fix by uploading `.vitest/` as the step artifact, or by configuring
`reporters: [['json', { stdout: true }]]` when a later step reads stdout. Coverage
output uses `coverage.reporter`, not this option, and the terminal reporter is the
default for ordinary results. See `vitest.dev/config/reporters`.

## Defaults that read the environment

Four values decide most local-versus-pipeline divergence, and each is read once at
configuration time: `allowOnly`, `update`, `watch`, and the config lookup root.
Configuration is looked up as `vitest.config.*` first and `vite.config.*` second
in the project root, and a run with neither proceeds without a config file. The
`VITEST` variable is set for the run and is also exposed on `import.meta.env`, and
`mode` is `test` unless overridden, so one config file can branch on the
environment. See `vitest.dev/config` and `vitest.dev/guide/cli`.

Check the working directory a job starts in, then the `--config` argument, then
the `CI` variable. Fix by passing `--config` explicitly from a pipeline step and
by keeping the config file at the project root.
