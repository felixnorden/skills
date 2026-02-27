# Error Handling Patterns

Type-safe error management in Effect v4.

> **Migrating from v3?** Error handling combinators have been renamed: `catchAll` → `catch`, `catchAllCause` → `catchCause`, `catchSome` → `catchFilter`. See [migration.md](migration.md) for complete details.

## Error Types

**Expected errors** - Typed in error channel
```ts
Effect<Success, Error, Requirements>
```

**Defects** - Uncaught runtime errors (like exceptions)

**Interruptions** - Fiber cancellation

## Creating Errors

**Tagged errors (recommended)**
```ts
import { Data } from "effect";

class NetworkError extends Data.TaggedError("NetworkError")<{
  cause: unknown;
}> {}

class ValidationError extends Data.TaggedError("ValidationError")<{
  field: string;
  message: string;
}> {}

// Usage
Effect.fail(new NetworkError({ cause: error }));
```

**Simple errors**
```ts
Effect.fail("Something went wrong");
Effect.fail(new Error("Failed"));
```

## Catching Errors

**Catch all (v4: renamed from `catchAll`)**
```ts
effect.pipe(
  Effect.catch((error) => 
    Effect.succeed(`Recovered from: ${error}`)
  )
);
```

**Catch specific tags**
```ts
program.pipe(
  Effect.catchTag("NetworkError", (e) => 
    Effect.log(`Network error: ${e.cause}`)
  ),
  Effect.catchTag("ValidationError", (e) =>
    Effect.fail(new BadRequest(e.message))
  )
);
```

**Catch multiple tags**
```ts
effect.pipe(
  Effect.catchTags({
    NetworkError: (e) => retry(e),
    TimeoutError: (e) => useCache(e),
    ParseError: (e) => Effect.fail(new BadRequest())
  })
);
```

**Catch filtered errors (v4: renamed from `catchSome`)**
```ts
import { Effect, Filter } from "effect";

effect.pipe(
  Effect.catchFilter(
    Filter.fromPredicate((error: MyError) => error._tag === "Retryable"),
    (error) => Effect.succeed("caught")
  )
);
```

**Catch cause (v4: renamed from `catchAllCause`)**
```ts
import { Cause, Effect } from "effect";

const program = Effect.die("defect").pipe(
  Effect.catchCause((cause) => Effect.succeed("recovered"))
);
```

**Catch defects (v4: renamed from `catchAllDefect`)**
```ts
effect.pipe(
  Effect.catchDefect((defect) =>
    Effect.log(`Defect caught: ${defect}`)
  )
);
```

**New in v4: Catch reason**
```ts
// Catch specific reason within tagged error
Effect.catchReason(
  "AiError",
  "RateLimitError",
  (reason) => Effect.succeed("rate limited")
);

// Catch multiple reasons
Effect.catchReasons("AiError", {
  RateLimitError: () => Effect.succeed("rate limited"),
  QuotaExceededError: () => Effect.succeed("quota exceeded")
});
```

**New in v4: Catch eager**
```ts
// Optimization: evaluates synchronous recovery immediately
effect.pipe(
  Effect.catchEager((error) => Effect.succeed("recovered"))
);
```

## Fallback & Recovery

**orElse**
```ts
primary.pipe(
  Effect.orElse(() => secondary),
  Effect.orElse(() => tertiary)
);
```

**orElseSucceed**
```ts
effect.pipe(
  Effect.orElseSucceed(() => defaultValue)
);
```

**firstSuccessOf**
```ts
Effect.firstSuccessOf([
  fetchFromCache(),
  fetchFromDb(),
  fetchFromApi()
]);
```

## Retrying

**Basic retry**
```ts
effect.pipe(
  Effect.retry({ times: 3 })
);
```

**With schedule**
```ts
import { Schedule } from "effect";

effect.pipe(
  Effect.retry({
    times: 5,
    schedule: Schedule.exponential("100 millis", 2.0)
  })
);
```

**Conditional retry**
```ts
effect.pipe(
  Effect.retry({
    while: (error) => error._tag === "Transient",
    times: 10
  })
);
```

**Retry with delays**
```ts
// Fixed intervals
Schedule.spaced("1 second");

// Exponential backoff  
Schedule.exponential("100 millis", 2.0);

// With jitter
Schedule.exponential("100 millis").pipe(
  Schedule.jittered
);
```

## Cause Analysis (v4)

In v4, `Cause<E>` has been flattened to a wrapper around an array of `Reason` values:

```ts
interface Cause<E> {
  readonly reasons: ReadonlyArray<Reason<E>>;
}

type Reason<E> = Fail<E> | Die | Interrupt;
```

**Full error context**
```ts
Effect.gen(function* () {
  const result = yield* effect.pipe(
    Effect.sandbox,
    Effect.catch((cause) => {
      // cause.reasons contains all errors
      for (const reason of cause.reasons) {
        switch (reason._tag) {
          case "Fail":
            console.log("Failure:", reason.error);
            break;
          case "Die":
            console.log("Defect:", reason.defect);
            break;
          case "Interrupt":
            console.log("Interrupted by:", reason.fiberId);
            break;
        }
      }
      return Effect.succeed(null);
    })
  );
});
```

**Cause helpers (v4)**
```ts
// Check if cause has specific reason types
Cause.hasFails(cause);        // has any Fail reasons
Cause.hasDies(cause);         // has any Die reasons  
Cause.hasInterrupts(cause);   // has any Interrupt reasons
Cause.hasInterruptsOnly(cause); // only Interrupt reasons

// Extract reasons
Cause.findErrorOption(cause);      // Option<E>
Cause.findError(cause);            // Result<E>
Cause.findDefect(cause);           // Result<unknown>
Cause.findInterrupt(cause);        // Result<FiberId>

// Filter reasons
cause.reasons.filter(Cause.isFailReason);
cause.reasons.filter(Cause.isDieReason);
cause.reasons.filter(Cause.isInterruptReason);

// Combine causes
Cause.combine(cause1, cause2);  // replaces sequential/parallel
```

**Die vs Fail**
```ts
// Fail - expected error (in error channel)
Effect.fail(new ValidationError());

// Die - defect (not in error channel, unrecoverable)
Effect.die("Impossible state reached");
```

## Pattern Matching

**Match on result**
```ts
import { Match } from "effect";

const result = yield* effect.pipe(
  Effect.match({
    onFailure: (error) => `Error: ${error}`,
    onSuccess: (value) => `Success: ${value}`
  })
);
```

**Exit matching**
```ts
const exit = yield* Effect.exit(effect);

if (Exit.isSuccess(exit)) {
  console.log(exit.value);
} else if (Exit.isFailure(exit)) {
  // v4: exit.cause.reasons for flattened structure
  console.log(Cause.pretty(exit.cause));
}
```

## Error Accumulation

**Validate all**
```ts
const results = yield* Effect.validateAll(
  [validate1, validate2, validate3],
  { concurrency: "unbounded" }
);
// Collects ALL errors, not just first
```

**Partition**
```ts
const [errors, successes] = yield* Effect.partition(
  items,
  (item) => validate(item)
);
```

## Typed Error Unions

**Combining error types**
```ts
const program: Effect<
  string,
  NetworkError | ValidationError | DatabaseError,
  Database
> = Effect.gen(function* () {
  const data = yield* fetchData();  // NetworkError
  const validated = yield* validate(data);  // ValidationError  
  return yield* save(validated);  // DatabaseError
});
```

**Widening errors**
```ts
const narrow: Effect<string, NetworkError> = fetchData();

const wide: Effect<string, Error> = narrow.pipe(
  Effect.mapError((e) => new Error(e.message))
);
```

## Defect Handling

**Catch defects (use sparingly)**
```ts
effect.pipe(
  Effect.catchDefect((defect) =>
    Effect.log(`Defect caught: ${defect}`)
  )
);
```

**Refail defects as typed errors**
```ts
effect.pipe(
  Effect.catchDefect((defect) =>
    Effect.fail(new UnexpectedError({ cause: defect }))
  )
);
```

## Best Practices

Use tagged errors for domain errors
Keep error types in type signature  
Catch specific error tags when possible
Use retry for transient failures
Log errors with structured data
Match/pattern match for error handling

Avoid:
- Catching all errors indiscriminately
- Losing error type information  
- Using try/catch (breaks type safety)
- Ignoring errors silently
- Retrying non-transient errors

## Error Transformation

**Map error type**
```ts
effect.pipe(
  Effect.mapError((e: DbError) => 
    new ApiError({ status: 500, cause: e })
  )
);
```

**Flatten nested errors**
```ts
Effect.flatten(effectOfEffect);
```

## Testing Errors

```ts
// Expect failure
const test = Effect.gen(function* () {
  const result = yield* failingEffect.pipe(
    Effect.flip  // Swap success/error channels
  );
  expect(result).toBeInstanceOf(MyError);
});

// Flip back
effect.pipe(Effect.flip).pipe(Effect.flip);  // identity
```

## Migration from v3

### Renamed Combinators

| v3 | v4 |
|----|-----|
| `Effect.catchAll` | `Effect.catch` |
| `Effect.catchAllCause` | `Effect.catchCause` |
| `Effect.catchAllDefect` | `Effect.catchDefect` |
| `Effect.catchSome` | `Effect.catchFilter` |
| `Effect.catchSomeCause` | `Effect.catchCauseFilter` |
| `Cause.isFailType` | `Cause.isFailReason` |
| `Cause.isDieType` | `Cause.isDieReason` |
| `Cause.isInterruptType` | `Cause.isInterruptReason` |
| `Cause.isFailure` | `Cause.hasFails` |
| `Cause.isDie` | `Cause.hasDies` |
| `Cause.isInterrupted` | `Cause.hasInterrupts` |
| `Cause.isInterruptedOnly` | `Cause.hasInterruptsOnly` |
| `Cause.failureOption` | `Cause.findErrorOption` |
| `Cause.failureOrCause` | `Cause.findError` |
| `Cause.dieOption` | `Cause.findDefect` |
| `Cause.interruptOption` | `Cause.findInterrupt` |
| `Cause.sequential` | `Cause.combine` |
| `Cause.parallel` | `Cause.combine` |
| `*Exception` classes | `*Error` classes (e.g., `NoSuchElementException` → `NoSuchElementError`) |
