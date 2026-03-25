# Concurrency Patterns

Fibers, parallelism, racing, and coordination in Effect v4.

See related examples in [effect-smol/ai-docs/src/](https://github.com/Effect-TS/effect-smol/tree/main/ai-docs/src/)

> **Migrating from v3?** Forking combinators have been renamed: `fork` → `forkChild`, `forkDaemon` → `forkDetach`. `FiberRef` has been replaced by `ServiceMap.Reference`. See [migration.md](migration.md) for details.

## Basic Concurrency

**Parallel execution**

```ts
// Array - runs all in parallel
const results = yield * Effect.all([task1, task2, task3]);

// Struct - runs all in parallel
const data =
  yield *
  Effect.all({
    users: fetchUsers(),
    posts: fetchPosts(),
    comments: fetchComments(),
  });
```

**Control concurrency**

```ts
// Unbounded (all at once)
Effect.all(effects, { concurrency: "unbounded" });

// Sequential (one at a time)
Effect.all(effects, { concurrency: 1 });

// Limited (max N concurrent)
Effect.all(effects, { concurrency: 5 });
```

**ForEach with concurrency**

```ts
const results =
  yield * Effect.forEach(urls, (url) => fetch(url), { concurrency: 10 });
```

## Fibers

### Fork

**Fork as child of current fiber**

```ts
const fiber = yield * Effect.forkChild(longRunningTask);

// Do other work...

const result = yield * Fiber.join(fiber);
```

**Fork options (v4)**

```ts
const fiber = myEffect.pipe(
  Effect.forkChild({
    startImmediately: true, // Execute immediately vs deferred
    uninterruptible: true, // Make uninterruptible
  }),
);
```

### Fork Scoped (unchanged)

**Fork tied to current Scope**

```ts
Effect.scoped(
  Effect.gen(function* () {
    const fiber = yield* Effect.forkScoped(task);
    // Fiber auto-interrupted when scope closes
    return yield* doOtherWork();
  }),
);
```

### Fork Detach (v4: renamed from `forkDaemon`)

**Fork detached from parent lifecycle**

```ts
yield * Effect.forkDetach(backgroundTask);
// Continues even if parent completes
```

### Fork in Scope (unchanged)

**Fork in specific Scope**

```ts
const fiber = yield * Effect.forkIn(task, scope);
```

### Await Fiber

**Important v4 change:** `Fiber` is no longer a subtype of `Effect`. Use explicit methods:

```ts
const fiber = yield * Effect.forkChild(task);

// Wait for completion
const exit = yield * Fiber.await(fiber);

if (Exit.isSuccess(exit)) {
  console.log(exit.value);
}

// Or join directly
const result = yield * Fiber.join(fiber);
```

### Interrupt Fiber

```ts
const fiber = yield * Effect.forkChild(longTask);

// Cancel it
yield * Fiber.interrupt(fiber);
```

### Fork All (removed in v4)

`Effect.forkAll` has been removed. Use individual `forkChild` calls or higher-level combinators:

```ts
// v4 replacement for forkAll
const fibers =
  yield *
  Effect.all(
    [task1, task2, task3].map((t) => Effect.forkChild(t)),
    { concurrency: "unbounded" },
  );
```

## Racing

**First success**

```ts
const result = yield * Effect.race(slow, fast);
// Returns result of whichever completes first
```

**Race all**

```ts
const winner = yield * Effect.raceAll([e1, e2, e3]);
// First to succeed wins, others interrupted
```

**Race with (combine results)**

```ts
const result = yield* Effect.raceWith(task1, task2, {
  onSelfDone: (exit, fiber) => /* ... */,
  onOtherDone: (exit, fiber) => /* ... */
});
```

**Either**

```ts
const result = yield * Effect.either(Effect.race(primary, fallback));
// Get Either<Success, Error> of first to complete
```

## Coordination

### Deferred (v4: not yieldable, use explicit methods)

**Important v4 change:** `Deferred` is no longer yieldable. Use `Deferred.await`:

```ts
const deferred = yield * Deferred.make<string, Error>();

// In one fiber
yield * Deferred.succeed(deferred, "value");

// In another fiber
const value = yield * Deferred.await(deferred);
```

### Queue

```ts
const queue = yield * Queue.bounded<number>(100);

// Producer
yield * Queue.offer(queue, 42);

// Consumer
const value = yield * Queue.take(queue);

// Batch operations
yield * Queue.offerAll(queue, [1, 2, 3]);
const batch = yield * Queue.takeUpTo(queue, 10);
```

### Ref (v4: not yieldable, use explicit methods)

**Important v4 change:** `Ref` is no longer yieldable. Use `Ref.get`, `Ref.set`, etc.:

```ts
const counter = yield * Ref.make(0);

// Update
yield * Ref.update(counter, (n) => n + 1);

// Get
const value = yield * Ref.get(counter);

// Modify (get + update atomically)
const prev = yield * Ref.modify(counter, (n) => [n, n + 1]);
```

### Semaphore

```ts
const sem = yield * Semaphore.make(5);

// Acquire permits
yield * Semaphore.withPermit(sem, () => criticalSection());

// Multiple permits
yield * Semaphore.withPermits(sem, 3, () => heavyOperation());
```

### Latch

```ts
const latch = yield * Latch.make(3);

// Wait until opened
yield * Latch.await(latch);

// Open (can only happen once)
yield * Latch.open(latch);
```

## Interruption

**Make interruptible**

```ts
Effect.interruptible(longRunningTask);
```

**Uninterruptible region**

```ts
Effect.uninterruptible(criticalSection);
```

**Handle interruption**

```ts
task.pipe(Effect.onInterrupt(() => cleanup()));
```

**Ensuring cleanup**

```ts
Effect.acquireUseRelease(
  acquire,
  (resource) => use(resource),
  (resource) => cleanup(resource),
);
// Cleanup runs even if interrupted
```

## Fiber Supervision

**Supervise children**

```ts
Effect.supervised(
  Effect.gen(function* () {
    yield* Effect.forkChild(child1);
    yield* Effect.forkChild(child2);
    // Supervisor monitors all forked children
  }),
);
```

**Custom supervisor**

```ts
const supervisor = Supervisor.track;

Effect.supervised(program, supervisor);
```

## Timeouts

**Basic timeout**

```ts
effect.pipe(Effect.timeout("30 seconds"));
// Returns Option<A>
```

**Timeout with error**

```ts
effect.pipe(
  Effect.timeoutFail({
    duration: "30 seconds",
    onTimeout: () => new TimeoutError(),
  }),
);
```

**Timeout to result**

```ts
const result =
  yield *
  effect.pipe(
    Effect.timeoutTo({
      duration: "5 seconds",
      onSuccess: (a) => `Success: ${a}`,
      onTimeout: () => "Timed out",
    }),
  );
```

## Scheduling

**Repeat**

```ts
import { Schedule } from "effect";

// Fixed times
effect.pipe(Effect.repeat({ times: 5 }));

// Forever
effect.pipe(Effect.repeat(Schedule.forever));

// With schedule
effect.pipe(Effect.repeat(Schedule.spaced("1 second")));
```

**Common schedules**

```ts
// Fixed intervals
Schedule.spaced("1 second");

// Exponential backoff
Schedule.exponential("100 millis", 2.0);

// Fibonacci
Schedule.fibonacci("100 millis");

// With max retries
Schedule.spaced("1 second").pipe(Schedule.upTo("1 minute"));
```

**Retry with schedule**

```ts
effect.pipe(Effect.retry(Schedule.exponential("100 millis")));
```

## ServiceMap References

Fiber-local state is now handled by `ServiceMap.Reference`:

```ts
import { Effect, ServiceMap, References } from "effect";

// Built-in references
const program = Effect.gen(function* () {
  const level = yield* References.CurrentLogLevel;
  const concurrency = yield* References.CurrentConcurrency;
  console.log(level, concurrency);
});

// Custom reference
const RequestId = ServiceMap.Reference<string>("RequestId", {
  defaultValue: () => "",
});

// Override scoped value
const withRequestId = Effect.provideService(program, RequestId, "req-123");
```

## Batching

**Request batching**

```ts
import { RequestResolver, Request } from "effect";

interface GetUser extends Request.Request<User, Error> {
  readonly id: string;
}

const GetUser = Request.tagged<GetUser>("GetUser");

const resolver = RequestResolver.makeBatched((requests: Array<GetUser>) =>
  Effect.gen(function* () {
    const users = yield* fetchUsersBatch(requests.map((r) => r.id));
    yield* Effect.forEach(requests, (req, i) => Request.succeed(req, users[i]));
  }),
);

// Usage
const program = Effect.gen(function* () {
  const users = yield* Effect.all(
    [
      Effect.request(GetUser({ id: "1" }), resolver),
      Effect.request(GetUser({ id: "2" }), resolver),
      Effect.request(GetUser({ id: "3" }), resolver),
    ],
    { batching: true },
  );
  // All 3 requests batched into single fetchUsersBatch call
});
```

## Patterns

**Worker pool**

```ts
const pool =
  yield *
  Effect.forEach(Array.range(1, 10), () => Effect.forkChild(worker()), {
    concurrency: "unbounded",
  });

// Send work to pool
yield * Effect.forEach(jobs, (job) => processJob(job), { concurrency: 10 });
```

**Pipeline**

```ts
const pipeline = <A, B, C>(input: Array<A>) =>
  Effect.gen(function* () {
    const stage1 = yield* Effect.forEach(input, process1, { concurrency: 5 });

    const stage2 = yield* Effect.forEach(stage1, process2, { concurrency: 3 });

    return stage2;
  });
```

**Circuit breaker**

```ts
class CircuitBreaker {
  private failures = 0;
  private isOpen = false;

  call<A, E>(effect: Effect.Effect<A, E>) {
    return Effect.gen(function* () {
      if (this.isOpen) {
        return yield* Effect.fail(new CircuitOpenError());
      }

      const result = yield* Effect.either(effect);

      if (Either.isLeft(result)) {
        this.failures++;
        if (this.failures >= threshold) {
          this.isOpen = true;
        }
      } else {
        this.failures = 0;
      }

      return yield* result;
    });
  }
}
```

## Best Practices

Fork long-running tasks
Use bounded queues for backpressure
Clean up forked fibers (forkScoped)
Handle interruption in critical sections
Use Semaphore for resource pools
Batch similar requests together

Avoid:

- Blocking fibers unnecessarily
- Forgetting to interrupt unused fibers
- Using unbounded parallelism for large datasets
- Ignoring backpressure signals
- Racing effects that should run sequentially

## Migration from v3

### Forking Changes

| v3                            | v4                                             |
| ----------------------------- | ---------------------------------------------- |
| `Effect.fork`                 | `Effect.forkChild`                             |
| `Effect.forkDaemon`           | `Effect.forkDetach`                            |
| `Effect.forkAll`              | Removed - use `Effect.all` with `forkChild`    |
| `Effect.forkWithErrorHandler` | Removed - use `Fiber.join` with error handling |

### Non-Yieldable Types (v4)

In v4, these types are no longer Effect subtypes. Use explicit methods:

**v3:**

```ts
const ref = yield * Ref.make(0);
const value = yield * ref; // Ref was yieldable

const deferred = yield * Deferred.make<string>();
const value = yield * deferred; // Deferred was yieldable

const fiber = yield * Effect.fork(task);
const result = yield * fiber; // Fiber was yieldable
```

**v4:**

```ts
const ref = yield * Ref.make(0);
const value = yield * Ref.get(ref); // Use Ref.get

const deferred = yield * Deferred.make<string>();
const value = yield * Deferred.await(deferred); // Use Deferred.await

const fiber = yield * Effect.forkChild(task);
const result = yield * Fiber.join(fiber); // Use Fiber.join
```

### FiberRef → ServiceMap.Reference

**v3:**

```ts
import { Effect, FiberRef } from "effect";

const program = Effect.gen(function* () {
  const level = yield* FiberRef.get(FiberRef.currentLogLevel);
  yield* FiberRef.set(FiberRef.currentLogLevel, "Debug");
});

Effect.locally(program, FiberRef.currentLogLevel, "Debug");
```

**v4:**

```ts
import { Effect, References } from "effect";

const program = Effect.gen(function* () {
  const level = yield* References.CurrentLogLevel;
  // References are services - use provideService for scoped changes
});

Effect.provideService(program, References.CurrentLogLevel, "Debug");
```
