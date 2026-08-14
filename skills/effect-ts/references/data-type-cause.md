---
name: data-type-cause
description: Comprehensive reference for Effect Cause and Exit modules - structured failure representation and effect completion results. Use when inspecting failures, handling errors, or working with Effect sandboxing and exit values.
---

# Cause & Exit - Failure Representation

> **Reference for Effect v4.0.0-beta.76.** APIs may change before the final v4 release.

## Cause

`Cause<E>` is a structured representation of how an Effect can fail. In v4 it has been flattened to a simple wrapper around an array of `Reason` values.

```ts
interface Cause<E> {
  readonly reasons: ReadonlyArray<Reason<E>>;
}

type Reason<E> = Fail<E> | Die | Interrupt;
```

### Creating Causes

```ts
import { Cause } from "effect";

// Individual reasons
Cause.fail(error);
Cause.die(defect);
Cause.interrupt(fiberId);

// Create reason values directly
Cause.makeFailReason(error); // Fail<E>
Cause.makeDieReason(defect); // Die
Cause.makeInterruptReason(fiberId); // Interrupt

// Combine causes (replaces sequential/parallel)
Cause.combine(cause1, cause2);

// Empty cause
Cause.empty;

// Build from array of reasons
Cause.fromReasons([Cause.makeFailReason("err1"), Cause.makeDieReason("defect")]);
```

### Accessing Reasons

```ts
const handle = (cause: Cause.Cause<string>) => {
  // Iterate over flat reasons array
  for (const reason of cause.reasons) {
    switch (reason._tag) {
      case "Fail":
        return reason.error;
      case "Die":
        return reason.defect;
      case "Interrupt":
        return reason.fiberId;
    }
  }
};
```

### Type Guards

```ts
Cause.isCause(value); // check if value is a Cause
Cause.isReason(value); // check if value is a Reason
Cause.isFailReason(reason); // narrow to Fail<E>
Cause.isDieReason(reason); // narrow to Die
Cause.isInterruptReason(reason); // narrow to Interrupt
```

### Cause-Level Predicates

```ts
Cause.hasFails(cause); // has any Fail reasons
Cause.hasDies(cause); // has any Die reasons
Cause.hasInterrupts(cause); // has any Interrupt reasons
Cause.hasInterruptsOnly(cause); // only Interrupt reasons
Cause.isEmpty(cause); // no reasons
```

### Extractors

```ts
// Find specific reason types
Cause.findErrorOption(cause); // Option<E>
Cause.findError(cause); // Result<E>
Cause.findDefect(cause); // Result<unknown>
Cause.findInterrupt(cause); // Result<FiberId>
Cause.findFail(cause); // Result<Fail<E>>
Cause.findDie(cause); // Result<Die>

// Get all of specific type
Cause.failures(cause); // all Fail reasons

// Interruptor fiber IDs
Cause.interruptors(cause); // ReadonlySet<number>
Cause.filterInterruptors(cause); // Result<Set<number>>
```

### Transform

```ts
Cause.map(cause, (error) => newError); // map Fail errors
Cause.squash(cause); // collapse to single thrown value
Cause.annotate(cause, key, value); // attach tracing metadata
Cause.annotations(cause); // Context<never> from all reasons
Cause.reasonAnnotations(reason); // Context<never> from single reason
```

### Display

```ts
Cause.pretty(cause); // human-readable string
Cause.prettyErrors(cause); // Array<Error>
```

### Built-in Error Types

v4 provides yieldable error classes that implement `Cause.YieldableError`:

```ts
import { Cause } from "effect";

// Missing element (used by Option.getOrThrow, etc.)
new Cause.NoSuchElementError("item not found");
Cause.isNoSuchElementError(error);

// Timeout (used by Effect.timeout, etc.)
new Cause.TimeoutError("request timed out");
Cause.isTimeoutError(error);

// Invalid argument (used by internal validation)
new Cause.IllegalArgumentError("expected positive number");
Cause.isIllegalArgumentError(error);

// Capacity exceeded (used by bounded queues, pools, etc.)
new Cause.ExceededCapacityError("queue full");
Cause.isExceededCapacityError(error);

// Async boundary crossing (used by async runtime)
new Cause.AsyncFiberError(fiber);
Cause.isAsyncFiberError(error);

// Unknown / catch-all wrapping
new Cause.UnknownError(originalError, "something went wrong");
Cause.isUnknownError(error);

// Completion signal (used by queues, streams)
Cause.Done(); // void completion
Cause.Done(value); // valued completion
Cause.isDone(signal);
```

## Exit

`Exit<A, E>` represents the completion result of an Effect — either success with a value or failure with a Cause.

### Inspecting Exits

```ts
import { Exit, Cause } from "effect";

// Get from effect
const exit = yield* Effect.exit(effect);

// Check
if (Exit.isSuccess(exit)) {
  console.log(exit.value);
} else if (Exit.isFailure(exit)) {
  // v4: exit.cause.reasons for flattened structure
  console.log(Cause.pretty(exit.cause));
}
```

### Type Guards

```ts
Exit.isExit(value);
Exit.isSuccess(exit);
Exit.isFailure(exit);
Exit.hasFails(exit); // contains Fail reasons
Exit.hasDies(exit); // contains Die reasons
Exit.hasInterrupts(exit); // contains Interrupt reasons
```

### Extract

```ts
Exit.getSuccess(exit); // Option<A>
Exit.getCause(exit); // Option<Cause<E>>
Exit.findError(exit); // Result<E, Exit<A, E>>
Exit.findDefect(exit); // Result<unknown, Exit<A, E>>
Exit.findErrorOption(exit); // Option<E>
```

### Filter

```ts
Exit.filterSuccess(exit); // Result<Success<A>, Failure<A, E>>
Exit.filterValue(exit); // Result<A, Failure<never, E>>
Exit.filterFailure(exit); // Result<Failure<never, E>, Success<A>>
Exit.filterCause(exit); // Result<Cause<E>, Success<A>>
```

### Match

```ts
Exit.match(exit, {
  onFailure: (cause) => /* ... */,
  onSuccess: (value) => /* ... */
});
```

### Create

```ts
Exit.succeed(value);
Exit.fail(error);
Exit.failCause(cause); // create from a Cause
Exit.die(defect);
Exit.interrupt(fiberId);
```

## See Also

- [data-types.md](data-types.md) - Overview of all Effect data types
- [error-handling.md](error-handling.md) - Error handling patterns with Effect
