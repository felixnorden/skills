# Services & Layers

Dependency injection and context management with ServiceMap (v4).

> **Migrating from v3?** Services have changed significantly. See [migration.md](migration.md) for details on migrating from `Context.Tag` and `Effect.Service`.

## Overview

In Effect v4, the dependency injection system uses **ServiceMap** instead of Context. Services are defined using `ServiceMap.Service` and provided via Layers.

Key changes from v3:
- `Context.Tag` → `ServiceMap.Service`
- `Effect.Service` → `ServiceMap.Service` with `make` option
- `Effect.Tag` → `ServiceMap.Service` (accessors removed, use `Service.use` or `yield*`)
- `Context.Reference` → `ServiceMap.Reference`
- No auto-generated `.Default` layer - build layers explicitly with `Layer.effect`

## Services

### Define Service

**Using ServiceMap.Service (recommended)**

```ts
import { Effect, ServiceMap, Layer } from "effect";

class Database extends ServiceMap.Service<Database>()("app/Database", {
  make: Effect.gen(function* () {
    const config = yield* Config.string("DB_URL");
    return {
      query: (sql: string) => Effect.succeed([]),
      close: () => Effect.succeed(void 0)
    };
  })
}) {
  // Build the layer from make effect
  static readonly layer = Layer.effect(this, this.make);
}
```

**Interface + Service pattern**

```ts
import { Effect, ServiceMap } from "effect";

interface Database {
  readonly query: (sql: string) => Effect.Effect<unknown[]>;
  readonly close: () => Effect.Effect<void>;
}

const Database = ServiceMap.Service<Database>("app/Database");
```

### Use Service

**Yield in generators (recommended)**

```ts
const program = Effect.gen(function* () {
  const db = yield* Database;
  const results = yield* db.query("SELECT * FROM users");
  return results;
});
```

**Using Service.use (one-liner)**

```ts
import { Service } from "effect";

// Use for single operations
const program = Database.use((db) => 
  db.query("SELECT * FROM users")
);

// For synchronous access
const getConfig = Config.useSync((c) => c.port);
```

> **Note:** Prefer `yield*` over `use` in most cases. `yield*` makes dependencies visible in the effect type, while `use` hides them in the callback.

### Service with Dependencies

**Wire dependencies via Layer.provide**

```ts
import { Effect, ServiceMap, Layer } from "effect";

class UserRepo extends ServiceMap.Service<UserRepo>()("app/UserRepo", {
  make: Effect.gen(function* () {
    const db = yield* Database;
    return {
      findById: (id: string) => 
        db.query(`SELECT * FROM users WHERE id = '${id}'`),
      findAll: () => db.query("SELECT * FROM users")
    };
  })
}) {
  // Wire dependencies in the layer
  static readonly layer = Layer.effect(this, this.make).pipe(
    Layer.provide(Database.layer)
  );
}
```

## Layers

### Create Layer

**From value**

```ts
const ConfigLayer = Layer.succeed(Config, { apiKey: "xxx" });
```

**From effect**

```ts
const DbLayer = Layer.effect(
  Database,
  Effect.gen(function* () {
    const pool = yield* createPool();
    return { query: pool.query, close: pool.close };
  })
);
```

**From scoped (auto cleanup)**

```ts
const DbLayerScoped = Layer.scoped(
  Database,
  Effect.gen(function* () {
    const pool = yield* Effect.acquireRelease(
      createPool(),
      (p) => p.close()
    );
    return { query: pool.query, close: pool.close };
  })
);
```

### Compose Layers

**Merge**

```ts
const AppLayer = Layer.merge(DbLayer, CacheLayer);
```

**Dependency chain**

```ts
const UserRepoLayer = DbLayer.pipe(
  Layer.provide(Database.layer)
);
```

**Multiple dependencies**

```ts
const AppLayer = Layer.mergeAll(
  Database.layer,
  Cache.layer,
  Logger.layer
);
```

### Provide to Effect

```ts
program.pipe(
  Effect.provide(AppLayer)
);

// Multiple layers (automatically memoized in v4)
Effect.provide(program, [DbLayer, CacheLayer, LoggerLayer]);
```

## ServiceMap (Context Replacement)

### Direct Service Provision

```ts
Effect.provideService(program, Database, {
  query: () => Effect.succeed([]),
  close: () => Effect.succeed(void 0)
});
```

### Build ServiceMap Manually

```ts
import { ServiceMap } from "effect";

const map = ServiceMap.empty().pipe(
  ServiceMap.add(Database, dbImpl),
  ServiceMap.add(Cache, cacheImpl)
);

Effect.provide(program, map);
```

## Service References (FiberRef Replacement)

Services with default values use `ServiceMap.Reference`:

```ts
import { ServiceMap } from "effect";

const LogLevel = ServiceMap.Reference<"info" | "warn" | "error">("LogLevel", {
  defaultValue: () => "info" as const
});

// Use like a service
const program = Effect.gen(function* () {
  const level = yield* LogLevel;
  console.log(level); // "info" (default)
});

// Override with provideService
const withDebug = Effect.provideService(
  program,
  LogLevel,
  "debug"
);
```

## Layer Patterns

### Singleton Layer (memoized)

In v4, layers are automatically memoized across `Effect.provide` calls:

```ts
const DbPoolLayer = Layer.scoped(
  DbPool,
  Effect.acquireRelease(
    createPool(),
    (pool) => pool.close()
  )
);

// Automatically memoized - created once per dependency graph
// Even with multiple Effect.provide calls
```

### Fresh Layer (not memoized)

```ts
const FreshConnection = Layer.scoped(
  Connection,
  Effect.acquireRelease(
    openConnection(),
    (conn) => conn.close()
  )
).pipe(Layer.fresh);
// Created fresh each time it's needed
```

### Local Memoization (v4)

Opt out of shared memoization for isolated layers:

```ts
const main = program.pipe(
  Effect.provide(MyServiceLayer),
  Effect.provide(MyServiceLayer, { local: true })
);
// Second layer built with local memo map - not shared
```

## Testing Patterns

### Mock Layer

```ts
const MockDb = Layer.succeed(Database, {
  query: () => Effect.succeed([{ id: 1, name: "Test" }]),
  close: () => Effect.succeed(void 0)
});

const test = program.pipe(Effect.provide(MockDb));
```

### Test Environment

```ts
const TestEnv = Layer.mergeAll(MockDb, MockCache, MockLogger);

describe("tests", () => {
  it("runs with test env", () =>
    Effect.runPromise(
      program.pipe(Effect.provide(TestEnv))
    )
  );
});
```

## Advanced Patterns

### Optional Service

```ts
Effect.gen(function* () {
  const maybeCache = yield* Effect.serviceOption(Cache);
  
  if (Option.isSome(maybeCache)) {
    return yield* maybeCache.value.get(key);
  }
  return yield* fetchFromDb(key);
});
```

### Service with Initialization

```ts
class EmailService extends ServiceMap.Service<EmailService>()("app/Email", {
  make: Effect.gen(function* () {
    const config = yield* EmailConfig;
    const client = yield* createSmtpClient(config);
    
    // Warm up connection
    yield* client.connect();
    
    return {
      send: (to, subject, body) => 
        client.sendMail({ to, subject, body })
    };
  })
}) {
  static readonly layer = Layer.effect(this, this.make).pipe(
    Layer.provide(EmailConfig.layer)
  );
}
```

### Conditional Layers

```ts
const ProductionLayers = Layer.mergeAll(
  RealDb,
  RedisCache,
  CloudLogger
);

const DevLayers = Layer.mergeAll(
  LocalDb,
  MemoryCache,
  ConsoleLogger
);

const AppLayer = process.env.NODE_ENV === "production"
  ? ProductionLayers
  : DevLayers;
```

## Common Service Patterns

### Repository Pattern

```ts
class UserRepository extends ServiceMap.Service<UserRepository>()(
  "app/UserRepository",
  {
    make: Effect.gen(function* () {
      const db = yield* Database;
      return {
        findById: (id) => db.query("..."),
        findAll: () => db.query("..."),
        create: (user) => db.execute("..."),
        update: (id, user) => db.execute("..."),
        delete: (id) => db.execute("...")
      };
    })
  }
) {
  static readonly layer = Layer.effect(this, this.make).pipe(
    Layer.provide(Database.layer)
  );
}
```

### Gateway Pattern

```ts
class PaymentGateway extends ServiceMap.Service<PaymentGateway>()(
  "app/PaymentGateway",
  {
    make: Effect.gen(function* () {
      const http = yield* HttpClient;
      const config = yield* PaymentConfig;
      
      return {
        charge: (amount, token) => 
          http.post("/charge", { amount, token }),
        refund: (chargeId) =>
          http.post("/refund", { chargeId })
      };
    })
  }
) {
  static readonly layer = Layer.effect(this, this.make).pipe(
    Layer.provide(PaymentConfig.layer)
  );
}
```

### Factory Service

```ts
class ConnectionFactory extends ServiceMap.Service<ConnectionFactory>()(
  "app/ConnectionFactory",
  {
    make: Effect.gen(function* () {
      const pool = yield* DbPool;
      
      return {
        getConnection: () =>
          Effect.acquireRelease(
            pool.acquire(),
            (conn) => pool.release(conn)
          )
      };
    })
  }
) {
  static readonly layer = Layer.effect(this, this.make).pipe(
    Layer.provide(DbPool.layer)
  );
}
```

## Migration from v3

### Context.Tag → ServiceMap.Service

**v3:**
```ts
class Database extends Context.Tag("Database")<
  Database,
  { readonly query: (sql: string) => Effect.Effect<unknown[]> }
>() {}
```

**v4:**
```ts
class Database extends ServiceMap.Service<Database>()(
  "Database",
  { readonly query: (sql: string) => Effect.Effect<unknown[]> }
)() {}
```

### Effect.Service → ServiceMap.Service

**v3:**
```ts
class Logger extends Effect.Service<Logger>()("Logger", {
  effect: Effect.succeed({ log: (msg: string) => Effect.log(msg) }),
  dependencies: [Config.Default]
}) {}
// Logger.Default auto-generated
```

**v4:**
```ts
class Logger extends ServiceMap.Service<Logger>()("Logger", {
  make: Effect.succeed({ log: (msg: string) => Effect.log(msg) })
}) {
  static readonly layer = Layer.effect(this, this.make).pipe(
    Layer.provide(Config.layer)
  );
}
```

### Effect.Tag → ServiceMap.Service

**v3:**
```ts
class Notifications extends Effect.Tag("Notifications")<
  Notifications,
  { readonly notify: (msg: string) => Effect.Effect<void> }
>() {}

// Static accessor
const program = Notifications.notify("hello");
```

**v4:**
```ts
class Notifications extends ServiceMap.Service<Notifications>()(
  "Notifications",
  { readonly notify: (msg: string) => Effect.Effect<void> }
)() {}

// Use yield* or Service.use
const program = Effect.gen(function* () {
  const n = yield* Notifications;
  yield* n.notify("hello");
});
```

## Best Practices

- Use `ServiceMap.Service` for service definition
- Name services with app namespace
- Compose layers at app boundary
- Use scoped layers for resources
- Keep service interfaces small
- Build layers explicitly with `Layer.effect`
- Use `yield*` over `Service.use` for visibility
- Prefer `layer` naming over `.Default`

Avoid:
- Accessing services outside Effect
- Creating circular dependencies  
- Putting business logic in layers
- Over-layering simple values
- Using `Service.use` when `yield*` is clearer

## Quick Reference

| v3 | v4 |
|----|-----|
| `Context.GenericTag<T>(id)` | `ServiceMap.Service<T>(id)` |
| `Context.Tag(id)<Self, Shape>()` | `ServiceMap.Service<Self, Shape>()(id)` |
| `Effect.Tag(id)<Self, Shape>()` | `ServiceMap.Service<Self, Shape>()(id)` |
| `Effect.Service<Self>()(id, opts)` | `ServiceMap.Service<Self>()(id, { make })` |
| `Context.Reference<Self>()(id, opts)` | `ServiceMap.Reference<T>(id, opts)` |
| `Context.make(tag, impl)` | `ServiceMap.make(tag, impl)` |
| `Context.get(ctx, tag)` | `ServiceMap.get(map, tag)` |
| `Context.add(ctx, tag, impl)` | `ServiceMap.add(map, tag, impl)` |
| `Context.mergeAll(...)` | `ServiceMap.mergeAll(...)` |
| `Logger.Default` | `Logger.layer` |
| `Effect.provide(layer)` | `Effect.provide(layer)` (memoization now automatic) |
