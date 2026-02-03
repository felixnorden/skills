# Services & Layers

Dependency injection and context management.

## Services

**Define service**
```ts
class Database extends Effect.Service<Database>()("app/Database", {
  effect: Effect.gen(function* () {
    const config = yield* Config.string("DB_URL")
    return {
      query: (sql: string) => Effect.succeed([]),
      close: () => Effect.succeed(void 0)
    }
  })
}) {}
```

**Use service**
```ts
const program = Effect.gen(function* () {
  const db = yield* Database
  const results = yield* db.query("SELECT * FROM users")
  return results
})
```

**Service with Tag**
```ts
class UserRepo extends Effect.Tag("app/UserRepo")<
  UserRepo,
  {
    findById: (id: string) => Effect.Effect<User, NotFound>
    create: (user: User) => Effect.Effect<User>
  }
>() {}

// Provide implementation
const LiveUserRepo = Layer.succeed(
  UserRepo,
  UserRepo.of({
    findById: (id) => /* ... */,
    create: (user) => /* ... */
  })
)
```

## Layers

**Create layer**
```ts
// From value
const ConfigLayer = Layer.succeed(Config, { apiKey: "xxx" })

// From effect
const DbLayer = Layer.effect(
  Database,
  Effect.gen(function* () {
    const pool = yield* createPool()
    return { query: pool.query, close: pool.close }
  })
)

// From scoped (auto cleanup)
const DbLayerScoped = Layer.scoped(
  Database,
  Effect.gen(function* () {
    const pool = yield* Effect.acquireRelease(
      createPool(),
      (p) => p.close()
    )
    return { query: pool.query, close: pool.close }
  })
)
```

**Compose layers**
```ts
// Merge
const AppLayer = Layer.merge(DbLayer, CacheLayer)

// Dependency chain
const UserRepoLayer = DbLayer.pipe(
  Layer.provide(UserRepo.Default)
)

// Provide to layer
Layer.provide(UserRepoLayer, DbLayer)
```

**Provide to effect**
```ts
program.pipe(
  Effect.provide(AppLayer)
)

// Multiple layers
Effect.provide(program, [DbLayer, CacheLayer, LoggerLayer])
```

## Context

**Direct service provision**
```ts
Effect.provideService(program, Database, {
  query: () => Effect.succeed([]),
  close: () => Effect.succeed(void 0)
})
```

**Build context manually**
```ts
import { Context } from "effect"

const ctx = Context.empty().pipe(
  Context.add(Database, dbImpl),
  Context.add(Cache, cacheImpl)
)

Effect.provide(program, ctx)
```

## Service Dependencies

**Service requiring another service**
```ts
class UserRepo extends Effect.Service<UserRepo>()("app/UserRepo", {
  dependencies: [Database.Default],
  effect: Effect.gen(function* () {
    const db = yield* Database
    return {
      findById: (id) => db.query(`SELECT * FROM users WHERE id = '${id}'`)
    }
  })
}) {}
```

## Layer Patterns

**Singleton layer (memoized)**
```ts
const DbPoolLayer = Layer.scoped(
  DbPool,
  Effect.acquireRelease(
    createPool(),
    (pool) => pool.close()
  )
)
// Automatically memoized - created once per dependency graph
```

**Fresh layer (not memoized)**
```ts
const FreshConnection = Layer.scoped(
  Connection,
  Effect.acquireRelease(
    openConnection(),
    (conn) => conn.close()
  )
).pipe(Layer.fresh)
// Created fresh each time it's needed
```

**Layer with resource cleanup**
```ts
const ResourceLayer = Layer.scoped(
  ResourceService,
  Effect.gen(function* () {
    const resource = yield* Effect.acquireRelease(
      acquire,
      (r) => release(r)
    )
    return { use: () => Effect.succeed(resource) }
  })
)
```

## Testing Patterns

**Mock layer**
```ts
const MockDb = Layer.succeed(Database, {
  query: () => Effect.succeed([{ id: 1, name: "Test" }]),
  close: () => Effect.succeed(void 0)
})

const test = program.pipe(Effect.provide(MockDb))
```

**Test environment**
```ts
const TestEnv = Layer.mergeAll(MockDb, MockCache, MockLogger)

describe("tests", () => {
  it("runs with test env", () =>
    Effect.runPromise(
      program.pipe(Effect.provide(TestEnv))
    )
  )
})
```

## Advanced Patterns

**Optional service**
```ts
Effect.gen(function* () {
  const maybeCache = yield* Effect.serviceOption(Cache)
  
  if (Option.isSome(maybeCache)) {
    return yield* maybeCache.value.get(key)
  }
  return yield* fetchFromDb(key)
})
```

**Service with initialization**
```ts
class EmailService extends Effect.Service<EmailService>()("app/Email", {
  effect: Effect.gen(function* () {
    const config = yield* EmailConfig
    const client = yield* createSmtpClient(config)
    
    // Warm up connection
    yield* client.connect()
    
    return {
      send: (to, subject, body) => client.sendMail({ to, subject, body })
    }
  })
}) {}
```

**Conditional layers**
```ts
const ProductionLayers = Layer.mergeAll(
  RealDb,
  RedisCache,
  CloudLogger
)

const DevLayers = Layer.mergeAll(
  LocalDb,
  MemoryCache,
  ConsoleLogger
)

const AppLayer = process.env.NODE_ENV === "production"
  ? ProductionLayers
  : DevLayers
```

## Best Practices

Use Effect.Service for service definition
Name services with app namespace
Compose layers at app boundary
Use scoped layers for resources
Keep service interfaces small
Separate layer construction from usage

Avoid:
- Accessing services outside Effect
- Creating circular dependencies  
- Putting business logic in layers
- Over-layering simple values
- Skipping Layer.memoize for singletons

## Common Service Patterns

**Repository pattern**
```ts
class UserRepository extends Effect.Service<UserRepository>()(
  "app/UserRepository",
  {
    effect: Effect.gen(function* () {
      const db = yield* Database
      return {
        findById: (id) => db.query("..."),
        findAll: () => db.query("..."),
        create: (user) => db.execute("..."),
        update: (id, user) => db.execute("..."),
        delete: (id) => db.execute("...")
      }
    })
  }
) {}
```

**Gateway pattern**
```ts
class PaymentGateway extends Effect.Service<PaymentGateway>()(
  "app/PaymentGateway",
  {
    effect: Effect.gen(function* () {
      const http = yield* HttpClient
      const config = yield* PaymentConfig
      
      return {
        charge: (amount, token) => 
          http.post("/charge", { amount, token }),
        refund: (chargeId) =>
          http.post("/refund", { chargeId })
      }
    })
  }
) {}
```

**Factory service**
```ts
class ConnectionFactory extends Effect.Service<ConnectionFactory>()(
  "app/ConnectionFactory",
  {
    effect: Effect.gen(function* () {
      const pool = yield* DbPool
      
      return {
        getConnection: () =>
          Effect.acquireRelease(
            pool.acquire(),
            (conn) => pool.release(conn)
          )
      }
    })
  }
) {}
```
