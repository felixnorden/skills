# Core Effect Patterns

Essential patterns for Effect v4 development.

> **Migrating from v3?** Types like `Ref`, `Deferred`, and `Fiber` are no longer Effect subtypes. Use explicit methods like `Ref.get`, `Deferred.await`, and `Fiber.join`. See [migration.md](migration.md) for details.

## Effect Creation

**Success values**

```ts
Effect.succeed(value); // Immediate success
Effect.sync(() => compute()); // Lazy evaluation
Effect.promise(() => fetch()); // From Promise
```

**Failures**

```ts
Effect.fail(error); // Expected error
Effect.die(defect); // Unexpected error (defect)
Effect.failCause(cause); // Full cause chain
```

**Conditional**

```ts
Effect.if(condition, {
  onTrue: () => Effect.succeed("yes"),
  onFalse: () => Effect.succeed("no"),
});

// Or simpler
condition ? effect1 : effect2;
```

## Generator Pattern (Preferred)

**Sequential composition**

```ts
const program = Effect.gen(function* () {
  const user = yield* fetchUser(id);
  const posts = yield* fetchPosts(user.id);
  const comments = yield* fetchComments(posts[0].id);
  return { user, posts, comments };
});
```

**Early returns**

```ts
Effect.gen(function* () {
  const value = yield* compute();
  if (value < 0) return yield* Effect.fail(new NegativeError());
  return value * 2;
});
```

**Error handling in generator**

```ts
Effect.gen(function* () {
  const result = yield* riskyOperation().pipe(
    Effect.catchTag("NotFound", () => Effect.succeed(null)),
  );
  return result;
});
```

## Yieldable Trait (v4)

In v4, many types implement the `Yieldable` trait, allowing them to be used with `yield*` in generators, but they are **not** Effect subtypes.

**Types that are Yieldable:**
- `Effect` itself
- `Option` - yields value or fails with `NoSuchElementError`
- `Either` (now `Result` in v4) - yields success or fails with error
- `Config` - yields config value or fails with `ConfigError`
- `ServiceMap.Service` - yields the service from environment

**Using Yieldable types:**

```ts
import { Effect, Option } from "effect";

// Works in generators - same as v3
const program = Effect.gen(function* () {
  const value = yield* Option.some(42);
  return value; // 42
});

// Option.none() fails with NoSuchElementError
const failing = Effect.gen(function* () {
  const value = yield* Option.none<number>();
  return value;
});
```

**Important v4 change:** For Effect combinators, you must convert Yieldable types explicitly:

```ts
import { Effect, Option } from "effect";

// v4: Must use .asEffect() for combinators
const program = Effect.map(
  Option.some(42).asEffect(), 
  (n) => n + 1
);

// Or use a generator (recommended)
const program2 = Effect.gen(function* () {
  const n = yield* Option.some(42);
  return n + 1;
});
```

## Pipe Composition

**Chaining transformations**

```ts
const result = Effect.succeed(10).pipe(
  Effect.map((x) => x * 2),
  Effect.flatMap((x) => Effect.succeed(x + 5)),
  Effect.tap((x) => Effect.log(`Value: ${x}`)),
);
```

**Error channel operations**

```ts
effect.pipe(
  Effect.mapError((e) => new CustomError(e)),
  Effect.catchTag("NotFound", () => Effect.succeed(defaultValue)),
  Effect.retry({ times: 3 }),
);
```

## Combining Effects

**All (parallel by default)**

```ts
// Array
const results = yield * Effect.all([effect1, effect2, effect3]);

// Struct
const data =
  yield *
  Effect.all({
    user: fetchUser(id),
    posts: fetchPosts(id),
    settings: fetchSettings(id),
  });

// Sequential
Effect.all([e1, e2, e3], { concurrency: 1 });
```

**ForEach**

```ts
// Parallel
const results =
  yield *
  Effect.forEach([1, 2, 3], (n) => processItem(n), {
    concurrency: "unbounded",
  });

// Sequential
Effect.forEach(items, process, { concurrency: 1 });

// Batched
Effect.forEach(items, process, { concurrency: 5 });
```

## Conditional Execution

**if/else chains**

```ts
const program = Effect.gen(function* () {
  const value = yield* getValue();

  if (value > 100) {
    return yield* handleLarge(value);
  } else if (value > 50) {
    return yield* handleMedium(value);
  } else {
    return yield* handleSmall(value);
  }
});
```

**when/unless**

```ts
const maybeLog = Effect.when(shouldLog, () => Effect.log("Logging enabled"));

const skipIfZero = Effect.unless(value === 0, () => process(value));
```

## Do Notation (Avoid Nesting)

**Simplifying nested flatMaps**

```ts
// Without Do
Effect.succeed(1).pipe(
  Effect.flatMap((a) =>
    Effect.succeed(2).pipe(
      Effect.flatMap((b) =>
        Effect.succeed(3).pipe(Effect.map((c) => a + b + c)),
      ),
    ),
  ),
);

// With Do (alternative to generators)
Effect.Do.pipe(
  Effect.bind("a", () => Effect.succeed(1)),
  Effect.bind("b", () => Effect.succeed(2)),
  Effect.bind("c", () => Effect.succeed(3)),
  Effect.map(({ a, b, c }) => a + b + c),
);

// Best: Use generators
Effect.gen(function* () {
  const a = yield* Effect.succeed(1);
  const b = yield* Effect.succeed(2);
  const c = yield* Effect.succeed(3);
  return a + b + c;
});
```

## Dual APIs

Many Effect functions support both data-first and data-last:

```ts
// Data-last (pipe-friendly)
effect.pipe(Effect.map(fn));

// Data-first
Effect.map(effect, fn);

// Both work identically
```

## Resource Safety

**Basic pattern**

```ts
Effect.acquireRelease(
  acquire,   // Effect that gets resource
  release    // Cleanup (runs even if interrupted)
);
```

**With usage**

```ts
Effect.acquireUseRelease(
  openConnection(),
  (conn) => query(conn),
  (conn) => closeConnection(conn),
);
```

**Scoped resources**

```ts
const scoped = Effect.acquireRelease(openFile("data.txt"), (file) =>
  closeFile(file),
);

const program = Effect.scoped(
  Effect.gen(function* () {
    const file = yield* scoped;
    return yield* readFile(file);
  }),
);
```

## Scope (v4: `extend` renamed to `provide`)

**Provide scope to effect**

```ts
import { Effect, Scope } from "effect";

const program = Effect.gen(function* () {
  const scope = yield* Scope.make();
  yield* Scope.provide(scope)(myEffect);
});

// Or data-first
Scope.provide(myEffect, scope);
```

## Testing Patterns

**Mock services (v4: ServiceMap pattern)**

```ts
import { Layer, ServiceMap } from "effect";

const MockUserRepo = Layer.succeed(
  UserRepo,
  ServiceMap.make(UserRepo, {
    find: (id) => Effect.succeed({ id, name: "Test" }),
  })
);

const test = program.pipe(Effect.provide(MockUserRepo));
```

**TestContext**

```ts
import { TestClock, TestRandom } from "effect";

const test = Effect.gen(function* () {
  yield* TestClock.adjust("1 hour");
  const value = yield* Effect.sleep("30 minutes").pipe(Effect.as(42));
});
```

## Common Idioms

**Optional chaining**

```ts
const user =
  yield *
  fetchUser(id).pipe(
    Effect.flatMap((u) =>
      u.email ? sendEmail(u.email) : Effect.succeed(null),
    ),
  );
```

**Fallback chain**

```ts
const data =
  yield *
  primary.pipe(
    Effect.orElse(() => secondary),
    Effect.orElse(() => tertiary),
    Effect.orElse(() => Effect.succeed(defaultValue)),
  );
```

**Racing effects**

```ts
const fastest = yield * Effect.race(slow, fast);
const all = yield * Effect.raceAll([e1, e2, e3]);
```

**Timeout**

```ts
const result =
  yield *
  longOperation.pipe(
    Effect.timeout("30 seconds"),
    Effect.catchTag("TimeoutError", () => Effect.succeed("timeout")),
  );
```

## Runtime (v4: `Runtime<R>` removed)

In v4, the `Runtime<R>` type no longer exists. Use `ServiceMap<R>` instead:

```ts
// v4: No Runtime type
// Run functions live directly on Effect
Effect.runPromise(program);
Effect.runSync(program);
Effect.runFork(program);
```

**Automatic fiber keep-alive (v4)**

In v4, the Effect fiber runtime automatically manages process lifetime. No need for `runMain` in most cases:

```ts
import { Deferred, Effect } from "effect";

const program = Effect.gen(function* () {
  const deferred = yield* Deferred.make<string>();
  
  // Process stays alive while waiting - no runMain needed
  yield* Deferred.await(deferred);
});

Effect.runPromise(program);
```

**Signal handling with platform runMain (still recommended)**

```ts
import { NodeRuntime } from "@effect/platform-node";

NodeRuntime.runMain(program);
// Provides: signal handling, exit codes, error reporting
```

## Performance Tips

Use `Effect.cached` for expensive reusable computations
Prefer `Effect.suspend` over `Effect.sync` for heavy lazy work  
Use `Effect.withConcurrency` to limit parallel operations
Batch operations with `Effect.forEach(..., { batching: true })`
Consider `Micro` module for bundle-sensitive scenarios

## Migration from v3

### Non-Yieldable Types

In v4, these types are no longer Effect subtypes:

| v3 (yieldable) | v4 (use explicit methods) |
|----------------|---------------------------|
| `yield* ref` | `yield* Ref.get(ref)` |
| `yield* deferred` | `yield* Deferred.await(deferred)` |
| `yield* fiber` | `yield* Fiber.join(fiber)` |

**v3:**
```ts
const ref = yield* Ref.make(0);
const value = yield* ref;  // Ref was an Effect

const deferred = yield* Deferred.make<string>();
const value = yield* deferred;  // Deferred was an Effect
```

**v4:**
```ts
const ref = yield* Ref.make(0);
const value = yield* Ref.get(ref);  // Use Ref.get

const deferred = yield* Deferred.make<string>();
const value = yield* Deferred.await(deferred);  // Use Deferred.await
```

### Runtime Changes

| v3 | v4 |
|----|-----|
| `Runtime<R>` | Removed - use `ServiceMap<R>` |
| `Runtime.runPromise(runtime, effect)` | `Effect.runPromise(effect)` |
| `Runtime.runSync(runtime, effect)` | `Effect.runSync(effect)` |

### Scope Changes

| v3 | v4 |
|----|-----|
| `Scope.extend(effect, scope)` | `Scope.provide(scope)(effect)` |

### Yieldable in Combinators

**v3:**
```ts
// Option was Effect subtype
Effect.map(Option.some(42), (n) => n + 1);
```

**v4:**
```ts
// Must convert explicitly
Effect.map(Option.some(42).asEffect(), (n) => n + 1);

// Or use generator
Effect.gen(function* () {
  const n = yield* Option.some(42);
  return n + 1;
});
```
