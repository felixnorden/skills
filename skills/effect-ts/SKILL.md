---
name: effect-typescript
description: Build robust TypeScript programs with Effect - type-safe error handling, dependency injection, concurrency, resource management. Use when writing Effect code, managing services/layers, handling errors, coordinating async operations, or working with Effect data types.
license: MIT
compatibility: TypeScript 5.0+, Node.js 18+, Deno, Bun, Browser
metadata:
  author: effect-community
  version: "3.0"
  effect-version: "4.x"
---

# Effect TypeScript (v4)

Effect is a powerful TypeScript library for building complex, type-safe programs with composable abstractions for error handling, dependency injection, concurrency, and resource management.

## Quick Start

**Using Effect.fn (Recommended)**

```ts
import { Effect, Schema } from "effect";

// Define errors with Schema.TaggedErrorClass
class FetchError extends Schema.TaggedErrorClass<FetchError>()("FetchError", {
  message: Schema.String,
}) {}

// Create functions with Effect.fn
export const fetchUser = Effect.fn("fetchUser")(
  function* (id: number) {
    yield* Effect.logInfo("Fetching user:", id);

    // Always return when raising an error
    return yield* new FetchError({ message: "Failed to fetch" });
  },
  // Add combinators as additional arguments (no .pipe needed)
  Effect.catch((error) => Effect.logError(`Error: ${error}`)),
  Effect.withSpan("fetchUser", { attributes: { method: "Effect.fn" } }),
);
```

**Generator Style**

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

// With NodeRuntime (recommended for apps)
import { NodeRuntime } from "@effect/platform-node";
NodeRuntime.runMain(program);

// Using Layer.launch as entry point
Layer.launch(WorkerLayer).pipe(NodeRuntime.runMain);
```

## What's New in v4

- **Effect.fn** - Recommended way to write functions that return Effects
- **Schema.TaggedErrorClass** - Type-safe error definitions with Schema
- **ServiceMap.Service** - Simplified service definition with class extension
- **Layer.unwrap** - Dynamic layer creation from Effects/Config
- **LayerMap** - Dynamic resource management keyed by identifiers
- **PubSub** - In-process event broadcasting
- **AI modules** - Provider-agnostic LLM integration (effect/unstable/ai)
- **ExecutionPlan** - Provider fallback strategies for AI
- **Unified versioning** - All ecosystem packages share a single version number
- **Package consolidation** - Platform, RPC, Cluster merged into core `effect`
- **Automatic fiber keep-alive** - No need for `runMain` in most cases
- **Layer memoization** - Automatic across `Effect.provide` calls
- **Unstable modules** - New features under `effect/unstable/*` paths

## Core Type

```ts
Effect<Success, Error, Requirements>;
```

- **Success**: Value type on success
- **Error**: Type-tracked errors
- **Requirements**: Services needed (use `never` if none)

## Key Operators

**Transformation**

- `map` - Transform success value
- `flatMap` / `andThen` - Chain effects
- `tap` - Side effects without changing value
- `mapError` - Transform error type

**Error Handling**

- `catch` - Handle all errors (v4: renamed from `catchAll`)
- `catchTag` - Handle specific error types
- `catchTags` - Handle multiple tagged errors at once
- `catchReason` / `catchReasons` - Handle errors with reasons
- `catchFilter` - Handle filtered errors (v4: renamed from `catchSome`)
- `orElse` - Fallback effect
- `retry` - Retry with policy

**Composition**

- `all` - Run multiple effects
- `forEach` - Map over collection
- `zip` / `zipWith` - Combine effects
- `provide` - Supply dependencies

## Best Practices

1. **Use Effect.fn** for functions that return Effects (not Effect.gen alone)
2. **Define errors with Schema.TaggedErrorClass** for type safety
3. **Use ServiceMap.Service** for dependency injection
4. **Build layers explicitly** with `Layer.effect` and compose with `Layer.provide`
5. **Use ExecutionPlan** for AI provider fallback strategies
6. **Handle interruptions** with `acquireRelease` for resources
7. **Use Layer.launch** as application entry point for long-running apps
8. **Enable dual APIs** when appropriate (data-first + data-last)

## Common Workflows

**Service with Effect.fn**

```ts
import { Effect, ServiceMap, Layer, Schema } from "effect";

class DatabaseError extends Schema.TaggedErrorClass<DatabaseError>()(
  "DatabaseError",
  { cause: Schema.Defect },
) {}

export class Database extends ServiceMap.Service<
  Database,
  {
    query(sql: string): Effect.Effect<unknown[], DatabaseError>;
  }
>()("app/Database") {
  static readonly layer = Layer.effect(
    Database,
    Effect.gen(function* () {
      const query = Effect.fn("Database.query")(function* (sql: string) {
        yield* Effect.log("Executing SQL:", sql);
        return [{ id: 1, name: "Alice" }];
      });
      return Database.of({ query });
    }),
  );
}
```

**AI Service with ExecutionPlan**

```ts
import { Effect, Layer, Schema, ServiceMap, ExecutionPlan } from "effect";
import { OpenAiLanguageModel } from "@effect/ai-openai";
import { AnthropicLanguageModel } from "@effect/ai-anthropic";
import { LanguageModel } from "effect/unstable/ai";

class AiWriterError extends Schema.TaggedErrorClass<AiWriterError>()(
  "AiWriterError",
  { reason: Schema.String },
) {}

export class AiWriter extends ServiceMap.Service<
  AiWriter,
  {
    draftAnnouncement(product: string): Effect.Effect<string, AiWriterError>;
  }
>()("docs/AiWriter") {
  static readonly layer = Layer.effect(
    AiWriter,
    Effect.gen(function* () {
      // Define fallback strategy
      const DraftPlan = ExecutionPlan.make(
        { provide: OpenAiLanguageModel.model("gpt-4"), attempts: 3 },
        { provide: AnthropicLanguageModel.model("claude-opus"), attempts: 2 },
      );

      const draftModel = yield* DraftPlan.withRequirements;

      const draftAnnouncement = Effect.fn("AiWriter.draftAnnouncement")(
        function* (product: string) {
          const model = yield* LanguageModel.LanguageModel;
          const response = yield* model.generateText({
            prompt: `Write a launch announcement for ${product}`,
          });
          return response.text;
        },
        Effect.withExecutionPlan(draftModel),
        Effect.mapError((error) => new AiWriterError({ reason: error.reason })),
      );

      return AiWriter.of({ draftAnnouncement });
    }),
  ).pipe(Layer.provide([OpenAiClientLayer, AnthropicClientLayer]));
}
```

**PubSub for Event Broadcasting**

```ts
import { Effect, Layer, PubSub, ServiceMap, Stream } from "effect";

export type OrderEvent =
  | { readonly _tag: "OrderPlaced"; readonly orderId: string }
  | { readonly _tag: "PaymentCaptured"; readonly orderId: string };

export class OrderEvents extends ServiceMap.Service<
  OrderEvents,
  {
    publish(event: OrderEvent): Effect.Effect<void>;
    readonly subscribe: Stream.Stream<OrderEvent>;
  }
>()("acme/OrderEvents") {
  static readonly layer = Layer.effect(
    OrderEvents,
    Effect.gen(function* () {
      const pubsub = yield* PubSub.bounded<OrderEvent>({
        capacity: 256,
        replay: 50, // Allow late subscribers to catch up
      });

      yield* Effect.addFinalizer(() => PubSub.shutdown(pubsub));

      const publish = Effect.fn("OrderEvents.publish")(function* (
        event: OrderEvent,
      ) {
        yield* PubSub.publish(pubsub, event);
      });

      const subscribe = Stream.fromPubSub(pubsub);

      return OrderEvents.of({ publish, subscribe });
    }),
  );
}
```

**Resource Management with acquireRelease**

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
import { LanguageModel } from "effect/unstable/ai";
import { PubSub } from "effect/unstable/pubsub";
```

**Platform-Specific Packages** (separate, matching v4 version)

```ts
import { NodeRuntime } from "@effect/platform-node";
import { SqlClient } from "@effect/sql-pg";
import { OpenAiClient } from "@effect/ai-openai";
```

## References

Dive deeper into specific topics and patterns:

- **[Core Patterns](references/core-patterns.md)** - Foundational Effect patterns with Effect.fn
- **[Error Handling](references/error-handling.md)** - Schema.TaggedErrorClass, catchTags, catchReason
- **[Services & Layers](references/services-layers.md)** - Dependency injection with ServiceMap
- **[Concurrency](references/concurrency.md)** - Fibers, racing, interruption, coordination
- **[Data Types](references/data-types.md)** - Option, Either, Chunk, HashSet, Stream
- **[Streams](references/streams.md)** - Creating and consuming streams
- **[PubSub](references/pubsub.md)** - Event broadcasting and subscription
- **[Schedules](references/schedules.md)** - Retry, repeat, and scheduling patterns
- **[AI Modules](references/ai-modules.md)** - LLM integration with tools and chat
- **[HTTP Client/Server](references/http-client-server.md)** - HttpClient and HttpApi
- **[Resource Management](references/resource-management.md)** - Scope, acquire/release patterns
- **[Schema](references/schema.md)** - Validation, parsing, serialization
- **[Observability](references/observability.md)** - Logging, metrics, tracing with Otlp
- **[Testing](references/testing.md)** - @effect/vitest patterns
- **[Integration](references/integration.md)** - ManagedRuntime for non-Effect code
- **[Batching](references/batching.md)** - RequestResolver for batching
- **[Child Process](references/child-process.md)** - Process management
- **[CLI](references/cli.md)** - CLI application building
- **[Cluster](references/cluster.md)** - Distributed entities
- **[Migration Guide](references/migration.md)** - Migrating from Effect v3 to v4

## Anti-Patterns to Avoid

- Using try/catch with Effect (defeats type safety)
- Mixing Promise-based and Effect-based code without conversion
- Not handling all error cases (use catch or match)
- Ignoring resource cleanup (always use acquireRelease)
- Running effects at module level (breaks composability)
- Using global state instead of Services
- Overusing Effect for simple synchronous operations
- Using Effect.gen alone instead of Effect.fn for functions

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

- Official Docs: <https://effect.website>
- API Reference: <https://effect-ts.github.io/effect>
- Discord Community: <https://discord.gg/effect-ts>
- GitHub: <https://github.com/Effect-TS/effect>
- Migration Guide: [references/migration.md](references/migration.md)
