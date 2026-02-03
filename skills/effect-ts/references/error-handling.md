# Error Handling Patterns

Type-safe error management in Effect.

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
import { Data } from "effect"

class NetworkError extends Data.TaggedError("NetworkError")<{
  cause: unknown
}> {}

class ValidationError extends Data.TaggedError("ValidationError")<{
  field: string
  message: string
}> {}

// Usage
Effect.fail(new NetworkError({ cause: error }))
```

**Simple errors**
```ts
Effect.fail("Something went wrong")
Effect.fail(new Error("Failed"))
```

## Catching Errors

**Catch all**
```ts
effect.pipe(
  Effect.catchAll((error) => 
    Effect.succeed(`Recovered from: ${error}`)
  )
)
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
)
```

**Catch multiple tags**
```ts
effect.pipe(
  Effect.catchTags({
    NetworkError: (e) => retry(e),
    TimeoutError: (e) => useCache(e),
    ParseError: (e) => Effect.fail(new BadRequest())
  })
)
```

**Catch some errors**
```ts
effect.pipe(
  Effect.catchSome((error) =>
    error._tag === "Retryable"
      ? Option.some(retry())
      : Option.none()
  )
)
```

## Fallback & Recovery

**orElse**
```ts
primary.pipe(
  Effect.orElse(() => secondary),
  Effect.orElse(() => tertiary)
)
```

**orElseSucceed**
```ts
effect.pipe(
  Effect.orElseSucceed(() => defaultValue)
)
```

**firstSuccessOf**
```ts
Effect.firstSuccessOf([
  fetchFromCache(),
  fetchFromDb(),
  fetchFromApi()
])
```

## Retrying

**Basic retry**
```ts
effect.pipe(
  Effect.retry({ times: 3 })
)
```

**With schedule**
```ts
import { Schedule } from "effect"

effect.pipe(
  Effect.retry({
    times: 5,
    schedule: Schedule.exponential("100 millis", 2.0)
  })
)
```

**Conditional retry**
```ts
effect.pipe(
  Effect.retry({
    while: (error) => error._tag === "Transient",
    times: 10
  })
)
```

**Retry with delays**
```ts
// Fixed intervals
Schedule.spaced("1 second")

// Exponential backoff  
Schedule.exponential("100 millis", 2.0)

// With jitter
Schedule.exponential("100 millis").pipe(
  Schedule.jittered
)
```

## Cause Analysis

**Full error context**
```ts
Effect.gen(function* () {
  const result = yield* effect.pipe(
    Effect.sandbox,
    Effect.catchAll((cause) => {
      // cause contains full error history
      console.log(Cause.pretty(cause))
      return Effect.succeed(null)
    })
  )
})
```

**Die vs Fail**
```ts
// Fail - expected error (in error channel)
Effect.fail(new ValidationError())

// Die - defect (not in error channel, unrecoverable)
Effect.die("Impossible state reached")
```

## Pattern Matching

**Match on result**
```ts
import { Match } from "effect"

const result = yield* effect.pipe(
  Effect.match({
    onFailure: (error) => `Error: ${error}`,
    onSuccess: (value) => `Success: ${value}`
  })
)
```

**Exit matching**
```ts
const exit = yield* Effect.exit(effect)

if (Exit.isSuccess(exit)) {
  console.log(exit.value)
} else if (Exit.isFailure(exit)) {
  console.log(Cause.pretty(exit.cause))
}
```

## Error Accumulation

**Validate all**
```ts
const results = yield* Effect.validateAll(
  [validate1, validate2, validate3],
  { concurrency: "unbounded" }
)
// Collects ALL errors, not just first
```

**Partition**
```ts
const [errors, successes] = yield* Effect.partition(
  items,
  (item) => validate(item)
)
```

## Typed Error Unions

**Combining error types**
```ts
const program: Effect<
  string,
  NetworkError | ValidationError | DatabaseError,
  Database
> = Effect.gen(function* () {
  const data = yield* fetchData()  // NetworkError
  const validated = yield* validate(data)  // ValidationError  
  return yield* save(validated)  // DatabaseError
})
```

**Widening errors**
```ts
const narrow: Effect<string, NetworkError> = fetchData()

const wide: Effect<string, Error> = narrow.pipe(
  Effect.mapError((e) => new Error(e.message))
)
```

## Defect Handling

**Catch defects (use sparingly)**
```ts
effect.pipe(
  Effect.catchAllDefect((defect) =>
    Effect.log(`Defect caught: ${defect}`)
  )
)
```

**Refail defects as typed errors**
```ts
effect.pipe(
  Effect.catchAllDefect((defect) =>
    Effect.fail(new UnexpectedError({ cause: defect }))
  )
)
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
)
```

**Flatten nested errors**
```ts
Effect.flatten(effectOfEffect)
```

## Testing Errors

```ts
// Expect failure
const test = Effect.gen(function* () {
  const result = yield* failingEffect.pipe(
    Effect.flip  // Swap success/error channels
  )
  expect(result).toBeInstanceOf(MyError)
})

// Flip back
effect.pipe(Effect.flip).pipe(Effect.flip)  // identity
```
