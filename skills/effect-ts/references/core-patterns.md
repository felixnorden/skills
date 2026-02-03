# Core Effect Patterns

Essential patterns for Effect development.

## Effect Creation

**Success values**
```ts
Effect.succeed(value)           // Immediate success
Effect.sync(() => compute())    // Lazy evaluation
Effect.promise(() => fetch())   // From Promise
```

**Failures**
```ts
Effect.fail(error)              // Expected error
Effect.die(defect)              // Unexpected error (defect)
Effect.failCause(cause)         // Full cause chain
```

**Conditional**
```ts
Effect.if(condition, {
  onTrue: () => Effect.succeed("yes"),
  onFalse: () => Effect.succeed("no")
})

// Or simpler
condition ? effect1 : effect2
```

## Generator Pattern (Preferred)

**Sequential composition**
```ts
const program = Effect.gen(function* () {
  const user = yield* fetchUser(id)
  const posts = yield* fetchPosts(user.id)
  const comments = yield* fetchComments(posts[0].id)
  return { user, posts, comments }
})
```

**Early returns**
```ts
Effect.gen(function* () {
  const value = yield* compute()
  if (value < 0) return yield* Effect.fail(new NegativeError())
  return value * 2
})
```

**Error handling in generator**
```ts
Effect.gen(function* () {
  const result = yield* riskyOperation().pipe(
    Effect.catchTag("NotFound", () => Effect.succeed(null))
  )
  return result
})
```

## Pipe Composition

**Chaining transformations**
```ts
const result = Effect.succeed(10).pipe(
  Effect.map(x => x * 2),
  Effect.flatMap(x => Effect.succeed(x + 5)),
  Effect.tap(x => Effect.log(`Value: ${x}`))
)
```

**Error channel operations**
```ts
effect.pipe(
  Effect.mapError(e => new CustomError(e)),
  Effect.catchTag("NotFound", () => Effect.succeed(defaultValue)),
  Effect.retry({ times: 3 })
)
```

## Combining Effects

**All (parallel by default)**
```ts
// Array
const results = yield* Effect.all([effect1, effect2, effect3])

// Struct  
const data = yield* Effect.all({
  user: fetchUser(id),
  posts: fetchPosts(id),
  settings: fetchSettings(id)
})

// Sequential
Effect.all([e1, e2, e3], { concurrency: 1 })
```

**ForEach**
```ts
// Parallel
const results = yield* Effect.forEach(
  [1, 2, 3],
  (n) => processItem(n),
  { concurrency: "unbounded" }
)

// Sequential
Effect.forEach(items, process, { concurrency: 1 })

// Batched
Effect.forEach(items, process, { concurrency: 5 })
```

## Conditional Execution

**if/else chains**
```ts
const program = Effect.gen(function* () {
  const value = yield* getValue()
  
  if (value > 100) {
    return yield* handleLarge(value)
  } else if (value > 50) {
    return yield* handleMedium(value)
  } else {
    return yield* handleSmall(value)
  }
})
```

**when/unless**
```ts
const maybeLog = Effect.when(
  shouldLog,
  () => Effect.log("Logging enabled")
)

const skipIfZero = Effect.unless(
  value === 0,
  () => process(value)
)
```

## Do Notation (Avoid Nesting)

**Simplifying nested flatMaps**
```ts
// Without Do
Effect.succeed(1).pipe(
  Effect.flatMap(a =>
    Effect.succeed(2).pipe(
      Effect.flatMap(b =>
        Effect.succeed(3).pipe(
          Effect.map(c => a + b + c)
        )
      )
    )
  )
)

// With Do (alternative to generators)
Effect.Do.pipe(
  Effect.bind("a", () => Effect.succeed(1)),
  Effect.bind("b", () => Effect.succeed(2)),
  Effect.bind("c", () => Effect.succeed(3)),
  Effect.map(({ a, b, c }) => a + b + c)
)

// Best: Use generators
Effect.gen(function* () {
  const a = yield* Effect.succeed(1)
  const b = yield* Effect.succeed(2)
  const c = yield* Effect.succeed(3)
  return a + b + c
})
```

## Dual APIs

Many Effect functions support both data-first and data-last:

```ts
// Data-last (pipe-friendly)
effect.pipe(Effect.map(fn))

// Data-first
Effect.map(effect, fn)

// Both work identically
```

## Resource Safety

**Basic pattern**
```ts
Effect.acquireRelease(
  acquire,  // Effect to get resource
  release   // Effect to clean up
)
```

**With usage**
```ts
Effect.acquireUseRelease(
  openConnection(),
  (conn) => query(conn),
  (conn) => closeConnection(conn)
)
```

**Scoped resources**
```ts
const scoped = Effect.acquireRelease(
  openFile("data.txt"),
  (file) => closeFile(file)
)

const program = Effect.scoped(
  Effect.gen(function* () {
    const file = yield* scoped
    return yield* readFile(file)
  })
)
```

## Testing Patterns

**Mock services**
```ts
const MockUserRepo = Layer.succeed(
  UserRepo,
  UserRepo.of({
    find: (id) => Effect.succeed({ id, name: "Test" })
  })
)

const test = program.pipe(
  Effect.provide(MockUserRepo)
)
```

**TestContext**
```ts
import { TestClock, TestRandom } from "effect"

const test = Effect.gen(function* () {
  yield* TestClock.adjust("1 hour")
  const value = yield* Effect.sleep("30 minutes").pipe(
    Effect.as(42)
  )
})
```

## Common Idioms

**Optional chaining**
```ts
const user = yield* fetchUser(id).pipe(
  Effect.flatMap(u => u.email 
    ? sendEmail(u.email) 
    : Effect.succeed(null)
  )
)
```

**Fallback chain**
```ts
const data = yield* primary.pipe(
  Effect.orElse(() => secondary),
  Effect.orElse(() => tertiary),
  Effect.orElse(() => Effect.succeed(defaultValue))
)
```

**Racing effects**
```ts
const fastest = yield* Effect.race(slow, fast)
const all = yield* Effect.raceAll([e1, e2, e3])
```

**Timeout**
```ts
const result = yield* longOperation.pipe(
  Effect.timeout("30 seconds"),
  Effect.catchTag("TimeoutException", () => 
    Effect.succeed("timeout")
  )
)
```

## Performance Tips

Use `Effect.cached` for expensive reusable computations
Prefer `Effect.suspend` over `Effect.sync` for heavy lazy work  
Use `Effect.withConcurrency` to limit parallel operations
Batch operations with `Effect.forEach(..., { batching: true })`
Consider `Micro` module for bundle-sensitive scenarios
