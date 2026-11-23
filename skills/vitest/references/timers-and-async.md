# Timers and async assertions

Covers a clock that will not move and an assertion that never ran. Repetition and
ordering belong to the reference on intermittent failures; the mock lifecycle
belongs to the mocking reference.

## Contents

- The clock does not move
- What is faked
- Proving an async outcome
- Assertions that pass without checking anything
- When the nondeterminism is not the clock

## The clock does not move

Symptom: a test hangs, or a callback scheduled with `setTimeout` never runs, after
fake timers were enabled.

Fake timers replace the timer functions, so time only advances when the test asks
for it. The timer API that advances the clock is the one installed by
`vi.useFakeTimers()`; a real `await new Promise((resolve) => setTimeout(resolve, 0))`
never resolves while it is active.

Check by advancing explicitly and asserting the side effect, not by adding a sleep.
Fix with the advance call that matches the code under test: advance by a known
amount for a scheduled callback, or run all pending timers when the test does not
depend on the delay.

Two further rules save a debugging session:

- `vi.useRealTimers()` at the end of a file stops the fake clock from leaking into
  the next file when isolation is off.
- A promise chain still needs an await after the clock advances, because
  microtasks are not timers.

## What is faked

`fakeTimers.toFake` lists what to replace and `fakeTimers.toNotFake` lists what to
leave alone; the two cannot be combined. By default everything available globally
is faked except `nextTick` and `queueMicrotask`. See
`vitest.dev/config/faketimers`.

`Temporal` is faked only when it exists on the global object, either natively or
through a polyfill loaded before the run. A date assertion that behaves
differently in one environment is usually this rule.

`nextTick` cannot be faked under the `forks` pool, because Node uses
`process.nextTick` internally there and hangs when it is replaced. The `threads`
pool supports it. Check the pool before adding `nextTick` to `toFake`.

## Proving an async outcome

A sleep is not proof. The supported helpers poll and fail with a message:

- `expect.poll(callback, options)` reruns a whole assertion at an interval until it
  passes, with `timeout`, `interval`, and a `message` that prefixes the failure.
  The callback receives an `AbortSignal` that is aborted when the timeout is
  reached. See `vitest.dev/api/expect`.
- When fake timers are installed, `expect.poll` advances the clock by the poll
  interval after each failed attempt, so a poll over a scheduled callback ends
  without an explicit advance. See `vitest.dev/guide/mocking/timers`.
- `vi.waitFor(callback)` runs a callback that throws on failure and resolves with
  its return value on the first pass. It is the right tool when the wait condition
  is work rather than an assertion, and it is required for matchers that
  `expect.poll` does not support. See `vitest.dev/guide/recipes/wait-for`.

The default timeouts are the cause of a surprising number of flakes: a test body
gets `5_000` ms in Node and `15_000` ms in a browser, and a hook gets `10_000` ms
and `30_000` ms. A browser test that passes locally and times out in a slower
environment is often the hook timeout, not the assertion. See
`vitest.dev/config/testtimeout` and `vitest.dev/config/hooktimeout`.

Check whether the failure reports a timeout before it reports a value. A timeout
message means the wait never saw the condition; fix by raising the specific
timeout or by polling the condition instead of sleeping.

## Assertions that pass without checking anything

An unawaited assertion now fails the test instead of printing a warning: it
applies to `resolves`, `rejects`, `toMatchFileSnapshot`, and every matcher on an
async expectation.

An unawaited file snapshot continues after a mismatch and is checked when the test
ends, so a green step can hide one. An unawaited `resolves` or `rejects` chain is
marked as failed at the end of the test. See `vitest.dev/api/expect`.

Symptom: a test reported as failing at teardown with no assertion message, or a
test that passed while the diff printed a mismatch.

Check every `expect` that returns a promise for an `await`. Fix by awaiting the
assertion; when the value is used twice, assign the awaited result once.

`expect.poll` is asynchronous too and must be awaited. Since it reruns the
assertion, a forgotten await fails the test at the end rather than at the line.

`guide/learn/async` states the pattern that avoids both: make the test `async`,
await the code under test, then assert. See `vitest.dev/guide/learn/async`.

## When the nondeterminism is not the clock

- A failure that appears only in a full run and each file passes alone is order or
  shared state, not time. A repeat with a fixed seed separates the two.
- A callback scheduled with a real timer but asserted immediately is a wait
  problem, not a fake-timer problem: the clock is real and the test is too early.
- A leak reported after the run is an asynchronous resource outliving its test.
  Leak detection is a flakiness check, not a clock setting.
- An intermittent timing failure that survives an explicit wait belongs with the
  repeat-and-shuffle diagnosis: reproduce it before naming the clock again.

Fix by naming which of the two conditions changed: the time the test waited, or
the order the test ran in. A fix that adds a sleep satisfies neither.
