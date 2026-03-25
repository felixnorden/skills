# Resource Management

Safe resource acquisition and cleanup in Effect v4.

See related examples in [effect-smol/ai-docs/src/01_effect/04_resources/](https://github.com/Effect-TS/effect-smol/tree/main/ai-docs/src/01_effect/04_resources/)

> **Migrating from v3?** `Scope.extend` has been renamed to `Scope.provide`. Service patterns use `ServiceMap.Service`. See [migration.md](migration.md) for details.

## Basic Pattern

**acquireRelease**

```ts
Effect.acquireRelease(
  acquire, // Effect that gets resource
  release, // Cleanup (runs even if interrupted)
);
```

**acquireUseRelease**

```ts
Effect.acquireUseRelease(
  openConnection(),
  (conn) => query(conn),
  (conn) => conn.close(),
);
```

## Scope

**Scoped resources**

```ts
const scoped = Effect.acquireRelease(openFile("data.txt"), (file) =>
  file.close(),
);

// Use within scope
Effect.scoped(
  Effect.gen(function* () {
    const file = yield* scoped;
    const data = yield* file.read();
    return data;
  }),
);
// File automatically closed when scope exits
```

**Multiple resources**

```ts
Effect.scoped(
  Effect.gen(function* () {
    const db = yield* Effect.acquireRelease(openDb(), (d) => d.close());

    const cache = yield* Effect.acquireRelease(openCache(), (c) => c.close());

    // Use both resources
    const result = yield* processData(db, cache);
    return result;
  }),
);
// Both cleaned up in reverse order
```

## Scope.provide

**Provide scope to effect**

```ts
import { Effect, Scope } from "effect";

const program = Effect.gen(function* () {
  const scope = yield* Scope.make();

  yield* Scope.provide(scope)(myEffect);
});

// Data-first form
Scope.provide(myEffect, scope);

// Curried form (data-last)
myEffect.pipe(Scope.provide(scope));
```

## Additive Scopes

**Add cleanup to existing scope**

```ts
Effect.gen(function* () {
  const scope = yield* Scope.make();

  // Add resources to scope
  const file = yield* pipe(
    openFile("data.txt"),
    Effect.tap((f) => Scope.addFinalizer(scope, () => f.close())),
  );

  // Use file...

  // Close scope (runs finalizers)
  yield* Scope.close(scope, Exit.succeed(void 0));
});
```

## Pool Pattern

**Connection pool**

```ts
class ConnectionPool {
  private readonly pool: Array<Connection> = [];

  acquire() {
    return Effect.acquireRelease(
      Effect.sync(() => this.pool.pop() ?? createConnection()),
      (conn) => Effect.sync(() => this.pool.push(conn)),
    );
  }
}

// Usage
const pool = new ConnectionPool();

Effect.scoped(
  Effect.gen(function* () {
    const conn = yield* pool.acquire();
    return yield* query(conn);
  }),
);
```

## Layers with Resources (v4: ServiceMap pattern)

**Scoped layer**

```ts
import { Effect, Layer, ServiceMap } from "effect";

const DbLayer = Layer.effect(
  Database,
  Effect.gen(function* () {
    const pool = yield* Effect.acquireRelease(createPool(), (p) => p.close());

    return {
      query: (sql) => pool.query(sql),
      close: () => Effect.void,
    };
  }),
);
// Pool automatically closed when layer is released
```

**Service with scoped resources (v4)**

```ts
class HttpClient extends ServiceMap.Service<HttpClient>()("HttpClient", {
  make: Effect.gen(function* () {
    const client = yield* Effect.acquireRelease(
      Effect.sync(() => new Client()),
      (c) => Effect.sync(() => c.close()),
    );

    return {
      get: (url) => Effect.tryPromise(() => client.fetch(url)),
    };
  }),
}) {
  static readonly layer = Layer.scoped(this, this.make);
}
```

## Finalizers

**Add cleanup actions**

```ts
Effect.gen(function* () {
  yield* Effect.addFinalizer(() => Console.log("Cleanup 1"));

  yield* Effect.addFinalizer(() => Console.log("Cleanup 2"));

  return "done";
});
// Finalizers run in reverse order on success/failure/interruption
```

**Conditional finalizers**

```ts
Effect.gen(function* () {
  const resource = yield* allocateResource();

  if (shouldCleanup) {
    yield* Effect.addFinalizer(() => cleanup(resource));
  }

  return resource;
});
```

## Ensuring Cleanup

**onExit**

```ts
effect.pipe(
  Effect.onExit((exit) =>
    Exit.match(exit, {
      onFailure: (cause) => logError(cause),
      onSuccess: (value) => logSuccess(value),
    }),
  ),
);
```

**onError**

```ts
effect.pipe(
  Effect.onError((cause) => Console.error(`Failed: ${Cause.pretty(cause)}`)),
);
```

**onInterrupt**

```ts
effect.pipe(Effect.onInterrupt(() => Console.log("Task was interrupted")));
```

## Common Patterns

**File operations**

```ts
const processFile = (path: string) =>
  Effect.acquireUseRelease(
    Effect.sync(() => fs.openSync(path, "r")),
    (fd) => Effect.sync(() => fs.readFileSync(fd, "utf-8")),
    (fd) => Effect.sync(() => fs.closeSync(fd)),
  );
```

**Database transaction**

```ts
const transaction = <A, E>(effect: Effect.Effect<A, E, Database>) =>
  Effect.acquireUseRelease(
    Effect.gen(function* () {
      const db = yield* Database;
      yield* db.beginTransaction();
      return db;
    }),
    () => effect,
    (db, exit) => (Exit.isSuccess(exit) ? db.commit() : db.rollback()),
  );
```

**Lock/Mutex pattern**

```ts
class Mutex {
  private locked = false;

  acquire() {
    return Effect.acquireRelease(
      Effect.gen(function* () {
        while (this.locked) {
          yield* Effect.sleep("10 millis");
        }
        this.locked = true;
      }),
      () =>
        Effect.sync(() => {
          this.locked = false;
        }),
    );
  }
}

// Usage
Effect.scoped(
  Effect.gen(function* () {
    yield* mutex.acquire();
    // Critical section
  }),
);
```

## Resource Leak Prevention

**Always use acquireRelease**

```ts
// ❌ Bad - resource may leak
Effect.gen(function* () {
  const resource = yield* allocate();
  const result = yield* use(resource);
  yield* cleanup(resource); // May not run if error/interrupt
  return result;
});

// ✅ Good - cleanup guaranteed
Effect.acquireUseRelease(
  allocate(),
  (resource) => use(resource),
  (resource) => cleanup(resource),
);
```

**Nested resources**

```ts
Effect.scoped(
  Effect.gen(function* () {
    const db = yield* Effect.acquireRelease(openDb(), (d) => d.close());

    const cache = yield* Effect.acquireRelease(openCache(), (c) => c.close());

    const session = yield* Effect.acquireRelease(createSession(db), (s) =>
      s.destroy(),
    );

    return yield* process(db, cache, session);
  }),
);
// Cleanup order: session, cache, db
```

## Best Practices

Use acquireRelease for resource management
Put cleanup in finally-like finalizers  
Use scoped for multiple resources
Release in reverse acquisition order
Make cleanup idempotent
Use layers for app-level resources

Avoid:

- Manually managing cleanup
- Forgetting interruption cases
- Leaking scoped resources
- Ignoring cleanup failures
- Nesting try/finally (use acquireRelease)

## Migration from v3

### Scope.extend → Scope.provide

**v3:**

```ts
import { Effect, Scope } from "effect";

const program = Effect.gen(function* () {
  const scope = yield* Scope.make();
  yield* Scope.extend(myEffect, scope);
});
```

**v4:**

```ts
import { Effect, Scope } from "effect";

const program = Effect.gen(function* () {
  const scope = yield* Scope.make();
  yield* Scope.provide(scope)(myEffect);
  // Or: Scope.provide(myEffect, scope)
});
```

### Effect.Service → ServiceMap.Service

**v3:**

```ts
class HttpClient extends Effect.Service<HttpClient>()("HttpClient", {
  scoped: Effect.gen(function* () {
    const client = yield* Effect.acquireRelease(
      Effect.sync(() => new Client()),
      (c) => Effect.sync(() => c.close()),
    );
    return { get: (url) => Effect.tryPromise(() => client.fetch(url)) };
  }),
}) {}
```

**v4:**

```ts
class HttpClient extends ServiceMap.Service<HttpClient>()("HttpClient", {
  make: Effect.gen(function* () {
    const client = yield* Effect.acquireRelease(
      Effect.sync(() => new Client()),
      (c) => Effect.sync(() => c.close()),
    );
    return { get: (url) => Effect.tryPromise(() => client.fetch(url)) };
  }),
}) {
  static readonly layer = Layer.scoped(this, this.make);
}
```

## Quick Reference

| v3                                | v4                                                               |
| --------------------------------- | ---------------------------------------------------------------- |
| `Scope.extend(effect, scope)`     | `Scope.provide(scope)(effect)` or `Scope.provide(effect, scope)` |
| `Effect.Service` with `scoped`    | `ServiceMap.Service` with `make` + `Layer.scoped`                |
| `Logger.Default` (auto-generated) | `Logger.layer` (explicitly defined)                              |
| `dependencies: [X.Default]`       | Wire via `Layer.provide`                                         |
