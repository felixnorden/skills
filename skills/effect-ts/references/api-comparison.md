# API Comparison

Effect vs Promise, fp-ts, and ZIO.

## Effect vs Promise

**Creation**
```ts
// Promise
const p = Promise.resolve(42)

// Effect
const e = Effect.succeed(42)
```

**Chaining**
```ts
// Promise
promise.then(x => x * 2)

// Effect
effect.pipe(Effect.map(x => x * 2))
```

**Error handling**
```ts
// Promise (untyped)
promise.catch(err => handle(err))

// Effect (typed)
effect.pipe(
  Effect.catchAll((err: MyError) => handle(err))
)
```

**Async/await vs gen**
```ts
// Promise
async function program() {
  const a = await fetchA()
  const b = await fetchB()
  return a + b
}

// Effect
const program = Effect.gen(function* () {
  const a = yield* fetchA()
  const b = yield* fetchB()
  return a + b
})
```

**Key differences**
- Promises eager, Effects lazy
- Promises one-shot, Effects multi-shot
- Promises untyped errors, Effects typed
- Promises no interruption, Effects interruptible
- Promises no requirements tracking

## Effect vs fp-ts

**Type representation**
```ts
// fp-ts
TaskEither<Error, Value>
ReaderTaskEither<Context, Error, Value>

// Effect
Effect<Value, Error, Context>
```

**Basic operations**
```ts
// fp-ts
import * as TE from "fp-ts/TaskEither"

pipe(
  TE.right(42),
  TE.map(x => x * 2)
)

// Effect
Effect.succeed(42).pipe(
  Effect.map(x => x * 2)
)
```

**Error handling**
```ts
// fp-ts
pipe(
  effect,
  TE.mapLeft(e => new CustomError(e))
)

// Effect
effect.pipe(
  Effect.mapError(e => new CustomError(e))
)
```

**Services**
```ts
// fp-ts (manual)
interface Has<T> { _tag: unique symbol }
type AppEnv = Has<Database> & Has<Logger>

// Effect (built-in)
class Database extends Effect.Service<Database>()("Database", {
  effect: /* ... */
}) {}
```

**Key differences**
- Effect has native services/layers
- Effect has runtime system
- Effect has concurrency primitives
- Effect has resource management
- fp-ts more lightweight

## Effect vs ZIO

**Environment**
```scala
// ZIO (Scala)
ZIO[Console with Logger, Error, Value]

// Effect
Effect<Value, Error, Console | Logger>
```

**Type parameter order**
```scala
// ZIO
ZIO[R, E, A]

// Effect  
Effect<A, E, R>
```

**Service pattern**
```scala
// ZIO
trait UserRepo {
  def find(id: String): IO[Error, User]
}

object UserRepo {
  def find(id: String): ZIO[UserRepo, Error, User] =
    ZIO.serviceWithZIO[UserRepo](_.find(id))
}

// Effect
class UserRepo extends Effect.Service<UserRepo>()("UserRepo", {
  effect: Effect.succeed({
    find: (id: string) => Effect.succeed(user)
  })
}) {}
```

**For comprehension vs gen**
```scala
// ZIO
for {
  a <- fetchA()
  b <- fetchB()
} yield a + b

// Effect
Effect.gen(function* () {
  const a = yield* fetchA()
  const b = yield* fetchB()
  return a + b
})
```

**Key differences**
- Environment: intersection (ZIO) vs union (Effect)
- Type params reversed
- ZIO in Scala, Effect in TypeScript
- Similar concepts, different ecosystems

## Common Equivalents

| fp-ts | Effect |
|-------|--------|
| `TaskEither<E, A>` | `Effect<A, E>` |
| `ReaderTaskEither<R, E, A>` | `Effect<A, E, R>` |
| `Task<A>` | `Effect<A>` |
| `IO<A>` | `Effect.sync(() => A)` |
| `Option<A>` | `Option<A>` |
| `Either<E, A>` | `Either<A, E>` |
| `map` | `map` |
| `chain` | `flatMap` / `andThen` |
| `mapLeft` | `mapError` |
| `fold` | `match` |

| Promise | Effect |
|---------|--------|
| `Promise.resolve(a)` | `Effect.succeed(a)` |
| `Promise.reject(e)` | `Effect.fail(e)` |
| `promise.then(f)` | `effect.pipe(Effect.map(f))` |
| `promise.catch(f)` | `effect.pipe(Effect.catchAll(f))` |
| `Promise.all([...])` | `Effect.all([...])` |
| `Promise.race([...])` | `Effect.race(...)` |
| `async/await` | `Effect.gen` |
