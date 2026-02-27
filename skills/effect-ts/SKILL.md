---
name: effect-typescript
description: Build robust TypeScript programs with Effect - type-safe error handling, dependency injection, concurrency, resource management. Use when writing Effect code, managing services/layers, handling errors, coordinating async operations, or working with Effect data types.
license: MIT
compatibility: TypeScript 5.0+, Node.js 18+, Deno, Bun, Browser
metadata:
  author: effect-community
  version: "2.0"
  effect-version: "4.x"
---

# Effect TypeScript (v4)

> **Migrating from v3?** See [references/migration.md](references/migration.md) for a comprehensive migration guide.

Effect is a powerful TypeScript library for building complex, type-safe programs with composable abstractions for error handling, dependency injection, concurrency, and resource management.

## What's New in v4

- **Unified versioning** - All ecosystem packages share a single version number
- **Package consolidation** - Platform, RPC, Cluster, and more merged into core `effect`
- **ServiceMap** - New dependency injection system replacing Context
- **Yieldable trait** - More explicit type safety for yieldable types
- **Automatic fiber keep-alive** - No need for `runMain` in most cases
- **Layer memoization** - Automatic across `Effect.provide` calls
- **Unstable modules** - New features under `effect/unstable/*` paths

## Quick Start

**Basic Effect Creation**

```ts
import { Effect } from "effect";

// Success
const success = Effect.succeed(42);

// Failure
const failure = Effect.fail("error");

// From sync function
const sync = Effect.sync(() => Math.random());

// From Promise
const async = Effect.promise(() => fetch("/api"));
```

**Generator Style (Recommended)**

```ts
const program = Effect.gen(function* () {
  const a = yield* Effect.succeed(10);
  const b = yield* Effect.succeed(20);
  return a + b;
});
```

**Running Effects**

```ts
// As Promise
Effect.runPromise(program).then(console.log);

// Synchronously (unsafe)
const result = Effect.runSync(program);

// With Fork (concurrent)
Effect.runFork(program);
```

## Core Type

```ts
Effect<Success, Error, Requirements>;
```

- **Success**: Value type on success
- **Error**: Type-tracked errors
- **Requirements**: Services needed (use `never` if none)

## Common Patterns

See detailed patterns in:

- [references/core-patterns.md](references/core-patterns.md) - Essential Effect patterns
- [references/error-handling.md](references/error-handling.md) - Error management strategies
- [references/services-layers.md](references/services-layers.md) - Dependency injection with ServiceMap
- [references/concurrency.md](references/concurrency.md) - Concurrent operations
- [references/data-types.md](references/data-types.md) - Option, Either, Chunk, etc.

## Key Operators

**Transformation**

- `map` - Transform success value
- `flatMap` / `andThen` - Chain effects
- `tap` - Side effects without changing value
- `mapError` - Transform error type

**Error Handling**

- `catch` - Handle all errors (v4: renamed from `catchAll`)
- `catchTag` - Handle specific error types
- `catchFilter` - Handle filtered errors (v4: renamed from `catchSome`)
- `orElse` - Fallback effect
- `retry` - Retry with policy

**Composition**

- `all` - Run multiple effects
- `forEach` - Map over collection
- `zip` / `zipWith` - Combine effects
- `provide` - Supply dependencies

## Best Practices

1. **Use generators** for sequential logic (Effect.gen)
2. **Type errors explicitly** with tagged errors (Data.TaggedError)
3. **Prefer pipe** for composition over method chaining
4. **Use Services** for dependencies, not global state
5. **Leverage Layer** for dependency graphs
6. **Handle interruptions** with `acquireRelease` for resources
7. **Use Schema** for validation and serialization (now in `effect/unstable/schema`)
8. **Enable dual APIs** when appropriate (data-first + data-last)

## Common Workflows

**API Call with Retry**

```ts
const fetchUser = (id: string) =>
  Effect.tryPromise({
    try: () => fetch(`/users/${id}`).then((r) => r.json()),
    catch: () => new FetchError(),
  }).pipe(
    Effect.retry({ times: 3, schedule: Schedule.exponential("100 millis") }),
  );
```

**Service Pattern (v4)**

```ts
import { Effect, ServiceMap, Layer } from "effect";

class UserRepo extends ServiceMap.Service<UserRepo>()("app/UserRepo", {
  make: Effect.gen(function* () {
    const db = yield* Database;
    return {
      find: (id: string) => db.query("SELECT * FROM users WHERE id = ?", [id]),
    };
  }),
}) {
  // Build layer from make effect
  static readonly layer = Layer.effect(this, this.make);
}
```

**Resource Management**

```ts
const program = Effect.acquireUseRelease(
  openFile("data.txt"),
  (file) => processFile(file),
  (file) => closeFile(file),
);
```

## Package Structure (v4)

**Core Package**

```ts
import { Effect } from "effect";
```

**Unstable Modules** (may have breaking changes in minor releases)

```ts
import { Schema } from "effect/unstable/schema";
import { HttpClient } from "effect/unstable/http";
```

**Platform-Specific Packages** (separate, matching v4 version)

```ts
import { NodeRuntime } from "@effect/platform-node";
import { SqlClient } from "@effect/sql-pg";
```

## References

Dive deeper into specific topics:

- **[Core Patterns](references/core-patterns.md)** - Foundational Effect patterns and idioms
- **[Error Handling](references/error-handling.md)** - Expected/unexpected errors, retries, fallbacks
- **[Services & Layers](references/services-layers.md)** - Dependency injection with ServiceMap
- **[Concurrency](references/concurrency.md)** - Fibers, racing, interruption, coordination
- **[Data Types](references/data-types.md)** - Option, Either, Chunk, HashSet, Stream
- **[Resource Management](references/resource-management.md)** - Scope, acquire/release patterns
- **[Schema](references/schema.md)** - Validation, parsing, serialization (v4 API)
- **[Observability](references/observability.md)** - Logging, metrics, tracing
- **[API Comparison](references/api-comparison.md)** - Effect vs Promise, fp-ts, ZIO
- **[Migration Guide](references/migration.md)** - Migrating from Effect v3 to v4

## Anti-Patterns to Avoid

- Using try/catch with Effect (defeats type safety)
- Mixing Promise-based and Effect-based code without conversion
- Not handling all error cases (use catch or match)
- Ignoring resource cleanup (always use acquireRelease)
- Running effects at module level (breaks composability)
- Using global state instead of Services
- Overusing Effect for simple synchronous operations

## Troubleshooting

**Type errors with Requirements**

- Ensure all services are provided via `Effect.provide`
- Check Layer composition matches service dependencies
- Use `Effect.provideService` for quick inline provisions

**Effects not executing**

- Effects are lazy - must be run with `runPromise`, `runSync`, or `runFork`
- Check that effect is actually yielded in generator context

**Performance issues**

- Avoid excessive allocations in hot loops
- Use `Effect.cached` for expensive computations
- Consider `Micro` module for bundle-size sensitive apps

## Learn More

- Official Docs: https://effect.website
- API Reference: https://effect-ts.github.io/effect
- Discord Community: https://discord.gg/effect-ts
- GitHub: https://github.com/Effect-TS/effect
- Migration Guide: [references/migration.md](references/migration.md)
