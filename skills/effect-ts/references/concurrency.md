# Concurrency Patterns

Fibers, parallelism, racing, and coordination.

## Basic Concurrency

**Parallel execution**
```ts
// Array - runs all in parallel
const results = yield* Effect.all([task1, task2, task3])

// Struct - runs all in parallel
const data = yield* Effect.all({
  users: fetchUsers(),
  posts: fetchPosts(),
  comments: fetchComments()
})
```

**Control concurrency**
```ts
// Unbounded (all at once)
Effect.all(effects, { concurrency: "unbounded" })

// Sequential (one at a time)
Effect.all(effects, { concurrency: 1 })

// Limited (max N concurrent)
Effect.all(effects, { concurrency: 5 })
```

**ForEach with concurrency**
```ts
const results = yield* Effect.forEach(
  urls,
  (url) => fetch(url),
  { concurrency: 10 }
)
```

## Fibers

**Fork (background execution)**
```ts
const fiber = yield* Effect.fork(longRunningTask)

// Do other work...

const result = yield* Fiber.join(fiber)
```

**Fork scoped (auto-cleanup)**
```ts
Effect.scoped(
  Effect.gen(function* () {
    const fiber = yield* Effect.forkScoped(task)
    // Fiber auto-interrupted when scope closes
    return yield* doOtherWork()
  })
)
```

**Daemon fiber (detached)**
```ts
yield* Effect.forkDaemon(backgroundTask)
// Continues even if parent completes
```

**Await fiber**
```ts
const fiber = yield* Effect.fork(task)

// Wait for completion
const exit = yield* Fiber.await(fiber)

if (Exit.isSuccess(exit)) {
  console.log(exit.value)
}
```

**Interrupt fiber**
```ts
const fiber = yield* Effect.fork(longTask)

// Cancel it
yield* Fiber.interrupt(fiber)
```

## Racing

**First success**
```ts
const result = yield* Effect.race(slow, fast)
// Returns result of whichever completes first
```

**Race all**
```ts
const winner = yield* Effect.raceAll([e1, e2, e3])
// First to succeed wins, others interrupted
```

**Race with (combine results)**
```ts
const result = yield* Effect.raceWith(task1, task2, {
  onSelfDone: (exit, fiber) => /* ... */,
  onOtherDone: (exit, fiber) => /* ... */
})
```

**Either**
```ts
const result = yield* Effect.either(
  Effect.race(primary, fallback)
)
// Get Either<Success, Error> of first to complete
```

## Coordination

**Deferred (one-time promise-like)**
```ts
const deferred = yield* Deferred.make<string, Error>()

// In one fiber
yield* Deferred.succeed(deferred, "value")

// In another fiber  
const value = yield* Deferred.await(deferred)
```

**Queue**
```ts
const queue = yield* Queue.bounded<number>(100)

// Producer
yield* Queue.offer(queue, 42)

// Consumer
const value = yield* Queue.take(queue)

// Batch operations
yield* Queue.offerAll(queue, [1, 2, 3])
const batch = yield* Queue.takeUpTo(queue, 10)
```

**Ref (shared mutable state)**
```ts
const counter = yield* Ref.make(0)

// Update
yield* Ref.update(counter, (n) => n + 1)

// Get
const value = yield* Ref.get(counter)

// Modify (get + update atomically)
const prev = yield* Ref.modify(counter, (n) => [n, n + 1])
```

**Semaphore**
```ts
const sem = yield* Semaphore.make(5)

// Acquire permits
yield* Semaphore.withPermit(sem, () => 
  criticalSection()
)

// Multiple permits
yield* Semaphore.withPermits(sem, 3, () =>
  heavyOperation()
)
```

**Latch**
```ts
const latch = yield* Latch.make(3)

// Wait until opened
yield* Latch.await(latch)

// Open (can only happen once)
yield* Latch.open(latch)
```

## Interruption

**Make interruptible**
```ts
Effect.interruptible(longRunningTask)
```

**Uninterruptible region**
```ts
Effect.uninterruptible(criticalSection)
```

**Handle interruption**
```ts
task.pipe(
  Effect.onInterrupt(() => cleanup())
)
```

**Ensuring cleanup**
```ts
Effect.acquireUseRelease(
  acquire,
  (resource) => use(resource),
  (resource) => cleanup(resource)
)
// Cleanup runs even if interrupted
```

## Fiber Supervision

**Supervise children**
```ts
Effect.supervised(
  Effect.gen(function* () {
    yield* Effect.fork(child1)
    yield* Effect.fork(child2)
    // Supervisor monitors all forked children
  })
)
```

**Custom supervisor**
```ts
const supervisor = Supervisor.track

Effect.supervised(program, supervisor)
```

## Timeouts

**Basic timeout**
```ts
effect.pipe(
  Effect.timeout("30 seconds")
)
// Returns Option<A>
```

**Timeout with error**
```ts
effect.pipe(
  Effect.timeoutFail({
    duration: "30 seconds",
    onTimeout: () => new TimeoutError()
  })
)
```

**Timeout to result**
```ts
const result = yield* effect.pipe(
  Effect.timeoutTo({
    duration: "5 seconds",
    onSuccess: (a) => `Success: ${a}`,
    onTimeout: () => "Timed out"
  })
)
```

## Scheduling

**Repeat**
```ts
import { Schedule } from "effect"

// Fixed times
effect.pipe(Effect.repeat({ times: 5 }))

// Forever
effect.pipe(Effect.repeat(Schedule.forever))

// With schedule
effect.pipe(
  Effect.repeat(Schedule.spaced("1 second"))
)
```

**Common schedules**
```ts
// Fixed intervals
Schedule.spaced("1 second")

// Exponential backoff
Schedule.exponential("100 millis", 2.0)

// Fibonacci
Schedule.fibonacci("100 millis")

// With max retries
Schedule.spaced("1 second").pipe(
  Schedule.upTo("1 minute")
)
```

**Retry with schedule**
```ts
effect.pipe(
  Effect.retry(Schedule.exponential("100 millis"))
)
```

## Batching

**Request batching**
```ts
import { RequestResolver, Request } from "effect"

interface GetUser extends Request.Request<User, Error> {
  readonly id: string
}

const GetUser = Request.tagged<GetUser>("GetUser")

const resolver = RequestResolver.makeBatched(
  (requests: Array<GetUser>) =>
    Effect.gen(function* () {
      const users = yield* fetchUsersBatch(
        requests.map(r => r.id)
      )
      yield* Effect.forEach(requests, (req, i) =>
        Request.succeed(req, users[i])
      )
    })
)

// Usage
const program = Effect.gen(function* () {
  const users = yield* Effect.all([
    Effect.request(GetUser({ id: "1" }), resolver),
    Effect.request(GetUser({ id: "2" }), resolver),
    Effect.request(GetUser({ id: "3" }), resolver)
  ], { batching: true })
  // All 3 requests batched into single fetchUsersBatch call
})
```

## Patterns

**Worker pool**
```ts
const pool = yield* Effect.forEach(
  Array.range(1, 10),
  () => Effect.fork(worker()),
  { concurrency: "unbounded" }
)

// Send work to pool
yield* Effect.forEach(
  jobs,
  (job) => processJob(job),
  { concurrency: 10 }
)
```

**Pipeline**
```ts
const pipeline = <A, B, C>(input: Array<A>) =>
  Effect.gen(function* () {
    const stage1 = yield* Effect.forEach(
      input,
      process1,
      { concurrency: 5 }
    )
    
    const stage2 = yield* Effect.forEach(
      stage1,
      process2,
      { concurrency: 3 }
    )
    
    return stage2
  })
```

**Circuit breaker**
```ts
class CircuitBreaker {
  private failures = 0
  private isOpen = false
  
  call<A, E>(effect: Effect.Effect<A, E>) {
    return Effect.gen(function* () {
      if (this.isOpen) {
        return yield* Effect.fail(new CircuitOpenError())
      }
      
      const result = yield* Effect.either(effect)
      
      if (Either.isLeft(result)) {
        this.failures++
        if (this.failures >= threshold) {
          this.isOpen = true
        }
      } else {
        this.failures = 0
      }
      
      return yield* result
    })
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
