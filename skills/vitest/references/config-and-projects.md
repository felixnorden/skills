# Configuration and projects

Covers why a setting does not apply: which file is read, how projects inherit,
where a shared server comes from, how globals and matcher types resolve, and how one
file overrides its environment. It defines what applies and where; it does not
diagnose order dependence, tune pool cost, or manage browser keys.

## Contents

- Which config is read
- Projects
- Inheritance and the shared server
- Globals and matcher types
- Environment per file
- Keys answered elsewhere

## Which config is read

Symptom: an option has no effect, or two projects behave differently from one file.

Configuration lookup starts at the project `root` and does not walk up the tree. A
run looks for `vitest.config.*` first and `vite.config.*` second, and a run that
finds neither proceeds without a config file. See `vitest.dev/config`.

- `--config` points at a specific file and skips the search.
- `VITEST` is set for the run and exposed on `import.meta.env`, so one config file
  can branch on it.
- `mode` is `test` unless `--mode` overrides it.

Check the working directory before the file: a command started from a package
subdirectory selects a different config, or none, from the same commit.

Fix by keeping the config at the root and by passing `--config` explicitly from a
script that changes directory. A config that must extend another one starts from
the same root for the same reason.

## Projects

Symptom: a run reports zero tests, or a project's tests run twice.

A config file that declares `projects` runs none of its own tests; it only provides
the projects that do. That rule applies to a referenced config as well, which
becomes a container for nested projects. See `vitest.dev/config/projects`.

- An inline project cannot declare `projects` itself.
- Nested project names are prefixed with the name of the config that declares them,
  so one config produces several individually addressable projects.
- The `--project` filter matches the prefix, which is why selecting a config name
  runs all of its projects. See `vitest.dev/guide/projects`.

Check the resolved project list with the debug variable that prints how every
project resolved: which glob matched, how browser instances expanded, and why a
project was dropped by the filter.

Fix a project that runs no tests by checking its globs against the project root, not
against the config file's directory. Fix a project that runs twice by removing the
overlapping pattern from the other project.

## Inheritance and the shared server

An inline project inherits the root Vite and test options unless it overrides the
same key. An inherited array is appended to rather than replaced, so a root `include`
still applies inside a project that adds its own globs.

`setupFiles` runs before each test file, in the same process as that file, and the
order is the order the paths are declared. The same array rule applies: a project
that adds a setup file keeps the root ones and appends its own. See
`vitest.dev/config/setupfiles`.

Symptom: a setup file runs twice, or a project misses a setup the root declares.

Check which config declares the setup file and whether the project is inline or
referenced. A referenced config or directory resolves its own Vite config and its
own server, while an inline project reuses the declaring config's server and
transform cache. See `vitest.dev/config/sharedviteserver`.

Fix a duplicated setup by deleting the inherited entry in the project that overrides
it, or by moving the shared part into the root. Fix a missing setup by adding it at
the level the project actually reads.

Two cautions finish this section:

- A project that changes Vite-level options such as `plugins` or `resolve` gets its
  own server, so the cache reuse disappears and a slow transform phase returns.
- `server` options exist to inline or externalize a dependency that the automatic
  resolution gets wrong. They are a last resort, not a tuning surface. See
  `vitest.dev/config/server`.

## Globals and matcher types

`globals` is off by default, so a test file that calls `describe` or `expect` without
an import fails at collection. Turning it on provides the APIs globally, and typed
code then needs `vitest/globals` in the `types` field of the TypeScript config. See
`vitest.dev/config/globals`.

Symptom: a test file fails with "describe is not defined", or the editor reports
`expect` as an unknown name while the run passes.

Check both halves: the runtime option and the TypeScript `types` entry. Fix by
importing the APIs from the package entry point, which needs no global typing, or by
setting both the option and the types entry.

For a test whose subject is a type, `typecheck.enabled` turns on the type test
environment, and files named `*.test-d.ts` are collected as type tests by default.
`expectTypeOf` and `assertType` are the assertion helpers, and they run under the
TypeScript compiler rather than at runtime. See `vitest.dev/config/typecheck` and
`vitest.dev/guide/testing-types`.

Check whether a matcher error is a runtime failure or a type failure before editing
the test: a type error printed against a `.test-d.ts` file comes from the assertion
helper, not from the runtime matcher.

## Environment per file

`environment` selects the globals a test file sees and defaults to `node`. One file
can override it with a `@vitest-environment` comment at the top, without changing the
project option. See `vitest.dev/config/environment` and `vitest.dev/guide/environment`.

Symptom: a DOM assertion works in one file and fails at collection in another.

Check the comment at the top of the failing file first, then the project option.
Fix by adding the comment for the one file that needs a DOM, or by moving the file
into the project whose environment matches.

Environment setup is per file under an isolating pool, because each file gets a
fresh environment. With isolation off, files in one worker share the environment, so
a test that depends on a clean DOM has to declare the environment and keep isolation
on for its project.

## Keys answered elsewhere

Four groups of keys are diagnosed by another reference, and this one names none of
their settings:

- Order, isolation, and repeat keys belong to the reference that reproduces an
  intermittent failure.
- Pool, worker, and module-cache keys belong to the reference that measures where a
  run's time goes.
- Every key under the browser namespace belongs to the browser reference, locator
  strictness and browser timeouts included.
- Coverage keys belong to the coverage reference, thresholds and report format
  included.

The split is by diagnosis, not by file: this reference defines what applies and
where, and each other reference explains what to change when its symptom appears.
