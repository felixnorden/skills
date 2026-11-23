# Mocking behaviour

Covers a mock that keeps calls from another test, stops recording, or never
replaces the module. Isolation and shuffle belong to the reference on intermittent
failures; clock faking belongs to the timers reference.

## Contents

- Mock lifecycle
- Hoisting
- Per-argument return values
- Module and class mocks
- When it is not a mock problem

## Mock lifecycle

The symptom names the verb that was never called. Three verbs do different work,
and the difference is the whole diagnosis:

- `clear` empties the recorded calls and leaves the implementation in place.
- `reset` also drops the queued implementation, so the mock returns `undefined`.
- `restore` puts the original implementation back on a spy.

Read the mock's recorded calls first. An empty history in a test that just called
the function is a clear running too late; a call history full of another test's
arguments is a clear that never ran.

`clearMocks` is on by default and calls `vi.clearAllMocks()` before every test, so
a mock no longer carries calls from the previous test unless a file clears it
manually after that point. See `vitest.dev/config/clearmocks`.

`mockReset`, `restoreMocks`, `unstubGlobals`, and `unstubEnvs` are all off by
default. Turn on only the one the failure needs: `mockReset` also drops queued
implementations, and the unstub options restore stubs created with
`vi.stubGlobal` and `vi.stubEnv`. See `vitest.dev/config/mockreset`,
`vitest.dev/config/restoremocks`, `vitest.dev/config/unstubglobals`, and
`vitest.dev/config/unstubenvs`.

One trap is worth naming here: the automatic clear runs before each test and is
unsafe with concurrent tests, because one test's completion clears the history
that another test is still using. A file that mixes `test.concurrent` with call
assertions should keep `clearMocks` off and clear explicitly.

## Hoisting

Symptom: the mock factory sees `undefined` for a variable defined beside it, the
mock silently has no effect, or the file throws while listing calls.

`vi.mock` and `vi.unmock` are hoisted above every import, so a factory runs before
any module-level variable exists. `vi.hoisted` defines a value in that same early
position, which is the supported way to share one with a factory. See
`vitest.dev/api/vi`.

Hoisted calls are legal only at module top level. A call inside a function, block,
or `describe`/`test` callback now throws and the error lists every offending call,
because the call does not execute where it is written. See
`vitest.dev/guide/migration`. `vi.doMock` and
`vi.doUnmock` are the unhoisted variants: they mock only imports that happen after
the call, which is what a per-test mock needs. See `vitest.dev/api/vi`.

Check the call site before the factory: a `vi.mock` nested in a test is the most
common cause in both directions. Fix by moving the hoisted call to module top
level and, when a variable must cross into the factory, define it with
`vi.hoisted`. Keep `vi.doMock` for the case that genuinely changes per test.

## Per-argument return values

Symptom: one mock returns the same value for different arguments, so a test cannot
cover both branches, or a queued implementation runs out mid-test.

`vi.when(spy).calledWith(...)` registers a behaviour for an argument list, and
chaining `then*` methods gives each match its own return, throw, or resolution.
Arguments are matched with the same deep equality as `toEqual`, so asymmetric
matchers work. See `vitest.dev/api/vi`.

- `thenReturnOnce` answers one call and then falls back.
- `onUnmatched: 'throw'` turns an unexpected argument list into a failure instead
  of a silent fallback to the original implementation.
- `toHaveBeenExhausted` passes only after every registered behaviour was used, so
  a branch the test never reached fails instead of passing unexercised.

Check which behaviour answered by exhausting the chain with
`toHaveBeenExhausted`, then add the missing argument list. Fix a wrong value by
narrowing `calledWith` rather than adding more `mockReturnValueOnce` calls, which
depend on call order rather than on arguments.

## Module and class mocks

Module mocks come in three shapes, and they fail differently:

- `vi.mock('./mod')` replaces the whole module, and every export returns
  `undefined` unless the factory provides it.
- `vi.mock('./mod', { spy: true })` keeps the original implementation and records
  calls instead of replacing it.
- A factory may only provide exports the original module declares; an export the
  factory omits is `undefined`, and one it adds cannot be imported. See
  `vitest.dev/config/browser/importmapmocks`.

In browser mode a module mock that replaces exports returns `undefined` for every
method and getter, because the module namespace cannot be reconfigured. Pass
`{ spy: true }` to that mock to spy on the original exports instead of replacing
them. This reference states the rule once; the browser reference states it again
in its own words for the reader who starts there.

A class mock chains `prototype` to the current implementation, so instances find
their prototype methods and pass `instanceof` against the mocked class and the
original one. The chain is re-pointed when a new implementation is set and when
the mock is reset, so an instance created under an earlier implementation loses
those methods. Assigning a mock on `MockedClass.prototype` shadows the original
method for every instance and shares one call history. See
`vitest.dev/guide/mocking/classes`.

Check `instanceof` before mocking a method: a class field mock gives each instance
its own function, while a prototype assignment is shared. Fix a broken instance
method by asserting on the prototype or by spying on that one instance. See
`vitest.dev/guide/mocking/modules` and `vitest.dev/guide/mocking/functions`.

## When it is not a mock problem

- Shared module state across files points at isolation, not at mocking. The mock
  lifecycle reference is the place to check a leaked call; order and isolation are
  a different diagnosis.
- A clock that does not advance makes a mock look stale, because the code under
  test never reaches the call. Check the clock before adding an implementation.
- A test that downloads or fetches a real resource is not a mock failure even when
  a mock exists in the file. `vitest.dev/guide/mocking` covers the request
  patterns; the diagnosis is whether the network call happened at all.

One more boundary: a mock that still records calls after a clear can be a leftover
handler from a stubbed environment rather than from the mock itself. Restore the
stub before concluding the lifecycle is wrong.
