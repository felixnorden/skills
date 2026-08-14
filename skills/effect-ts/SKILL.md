---
name: effect-ts
description: Use this skill whenever working in a repository that uses Effect, even if the current task is in a new file or the user does not explicitly ask for Effect help. Apply it to any work that should follow the repository's Effect patterns, conventions, architecture, or supporting tooling. Also use it for questions about Effect patterns, services, layers, schemas, streams, runtimes, or typed error handling.
---

# Effect Expert

Expert guidance for programming with the Effect library, covering error handling, dependency injection, composability, and testing patterns.

## Prerequisite

Before doing any other Effect-related work, check that `./.repos/effect` exists at the root of the repository where the skill is being used.

If it does not exist, stop and prompt the user with the setup task documented in `./references/setup.md`.

## Research Strategy

Effect has many ways to accomplish the same task. Proactively research best practices when working with Effect patterns, especially for moderate to high complexity tasks.

Use the local guides in `./references/` first. They are the preferred source for best practices, conventions, and common implementation patterns.

Only go directly to the vendored Effect repo when:

- the guides do not cover the question
- you need exact API details or signatures
- you need deeper implementation details
- you need to verify a behavior against the source

### Research Sources

1. Local skill guides first. Start with the relevant files in `./references/` before doing deeper research.
2. Codebase patterns second. Examine similar patterns in the current project before implementing. If Effect patterns already exist, follow them for consistency. If no patterns exist, skip this step.
3. Effect source code last. For gaps in the guides, complex type errors, unclear behavior, or implementation details, examine the vendored Effect source at `./.repos/effect/packages/effect/src/`.

### When To Research

- Always research for services, layers, or complex dependency injection.
- Always research for error handling with multiple error types or complex error hierarchies.
- Always research for stream-based operations and reactive patterns.
- Always research for resource management with scoped effects and cleanup.
- Always research for concurrent or performance-critical code.
- Always research for unfamiliar testing patterns.
- Research when needed for complex refactors from promises or try/catch into Effect.
- Research when needed for new service dependencies or layer restructuring.
- Research when needed for custom error types or extensions of existing error hierarchies.
- Research when needed for integrations with external systems such as databases, APIs, or third-party services.

### Research Approach

- Focus on canonical, readable, and maintainable solutions rather than clever optimizations.
- Verify suggested approaches against existing codebase patterns when those patterns exist.
- When multiple approaches are possible, prefer the most idiomatic Effect solution supported by the codebase and the vendored source.

### Codebase Pattern Discovery

When working in a project that uses Effect, check for existing patterns before implementing new code:

1. Search for Effect imports and existing module usage to understand current conventions.
2. Identify how services and layers are structured in the project.
3. Note how errors are defined and propagated.
4. Examine how Effect code is tested in the project.

If no Effect patterns exist in the codebase, proceed using canonical patterns from the vendored Effect source and examples. Do not block on missing codebase patterns.

### Feature Discovery

When you need to discover available Effect modules, packages, or capabilities, search `./references/features.md` first.

- Use it to identify the right package or module for a task.
- Use the listed repo paths to jump directly into the vendored source under `./.repos/effect`.
- Use it before inventing custom abstractions when Effect may already provide the functionality.

### Creating a New Service

Copy this checklist and track progress:

```
Service Creation Progress:
- [ ] Step 1: Define error types with Schema.TaggedErrorClass
- [ ] Step 2: Create service class extending Context.Service
- [ ] Step 3: Implement methods using Effect.fn
- [ ] Step 4: Build Layer.effect with service implementation
- [ ] Step 5: Provide dependencies via Layer.provide
- [ ] Step 6: Test the service layer
```

**Step 1: Define error types**

```ts
class ServiceError extends Schema.TaggedErrorClass<ServiceError>()(
  "ServiceError",
  { cause: Schema.Defect() },
) {}
```

**Step 2: Create service class**

```ts
export class MyService extends Context.Service<
  MyService,
  {
    method(): Effect.Effect<ReturnType, ServiceError>;
  }
>()("namespace/MyService") {}
```

**Step 3: Implement methods**

```ts
const method = Effect.fn("MyService.method")(function* () {
  // Implementation
});
```

**Step 4-6: Build and test layer**

See [Services & Layers](references/services-layers.md) for complete examples.

### Setting Up AI Integration

Copy this checklist and track progress:

```
AI Setup Progress:
- [ ] Step 1: Install provider packages (@effect/ai-openai, @effect/ai-anthropic)
- [ ] Step 2: Configure client layers with API keys
- [ ] Step 3: Define ExecutionPlan for fallback strategy
- [ ] Step 4: Create AI service with Effect.fn
- [ ] Step 5: Implement error handling with mapError
- [ ] Step 6: Provide client layers to service layer
```

See [AI Modules](references/ai-modules.md) for detailed implementation.

### Error Handling Strategy

Copy this checklist and track progress:

```
Error Handling Progress:
- [ ] Step 1: Define all error types with Schema.TaggedErrorClass
- [ ] Step 2: Use catchTags for multiple specific error handlers
- [ ] Step 3: Add catch for final fallback if needed
- [ ] Step 4: Consider retry with Schedule for transient failures
- [ ] Step 5: Log errors at appropriate layers
- [ ] Step 6: Test error scenarios
```

See [Error Handling](references/error-handling.md) for patterns and examples.

## Common Patterns

### Service with Effect.fn

```ts
import { Effect, Context, Layer, Schema } from "effect";

class DatabaseError extends Schema.TaggedErrorClass<DatabaseError>()(
  "DatabaseError",
  { cause: Schema.Defect() },
) {}

export class Database extends Context.Service<
  Database,
  {
    query(sql: string): Effect.Effect<unknown[], DatabaseError>;
  }
>()("app/Database") {
  static readonly layer = Layer.effect(
    Database,
    Effect.gen(function* () {
      const query = Effect.fn("Database.query")(function* (sql: string) {
        yield* Effect.logInfo("Executing SQL:", sql);
        return [{ id: 1, name: "Alice" }];
      });
      return Database.of({ query });
    }),
  );
}

// Exported type with proper inference
export type DatabaseService = Database["Service"];
```

### Error Handling with catchTags

```ts
const configWithFallback = loadConfig().pipe(
  Effect.catchTags({
    ParseError: () => Effect.succeed(defaultConfig),
    FileError: () => Effect.succeed(defaultConfig),
  }),
);
```

### Resource Safety

```ts
const program = Effect.acquireUseRelease(
  openFile("data.txt"),
  (file) => processFile(file),
  (file) => closeFile(file),
);
```

## Package Structure

**Core Package**

```ts
import { Effect } from "effect";
```

**Unstable Modules** (may have breaking changes in minor releases)

```ts
import { HttpClient } from "effect/unstable/http";
import { LanguageModel } from "effect/unstable/ai";
import { PubSub } from "effect/unstable/pubsub";
// Note: effect/unstable/schema only exports Model and VariantSchema submodules
```

**Platform-Specific Packages** (separate packages)

```ts
import { NodeRuntime } from "@effect/platform-node";
import { SqlClient } from "@effect/sql-pg";
import { OpenAiClient } from "@effect/ai-openai";
```

## References

Dive deeper into specific topics and patterns:

- **[Core Patterns](references/core-patterns.md)** - Foundational Effect patterns with Effect.fn
- **[Error Handling](references/error-handling.md)** - Schema.TaggedErrorClass, catchTags, catchReason
- **[Services & Layers](references/services-layers.md)** - Dependency injection with Context
- **[Concurrency](references/concurrency.md)** - Fibers, racing, interruption, coordination
- **[Data Types](references/data-types.md)** - Option, Either, Chunk, HashSet, Stream
- **[Streams](references/streams.md)** - Creating and consuming streams
- **[PubSub](references/pubsub.md)** - Event broadcasting and subscription
- **[Schedules](references/schedules.md)** - Retry, repeat, and scheduling patterns
- **[AI Modules](references/ai-modules.md)** - LLM integration with tools and chat
- **[HTTP Client/Server](references/http-client-server.md)** - HttpClient and HttpApi
- **[Resource Management](references/resource-management.md)** - Scope, acquire/release patterns
- **[Schema](references/schema.md)** - Quick start & index
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

## Example Files

Browse detailed examples in the [effect-smol/ai-docs/src/](https://github.com/Effect-TS/effect-smol/tree/main/ai-docs/src/) directory:

- **[Effect Basics](https://github.com/Effect-TS/effect-smol/tree/main/ai-docs/src/01_effect/01_basics/)** - Creating effects, pipe composition
- **[Services](https://github.com/Effect-TS/effect-smol/tree/main/ai-docs/src/01_effect/02_services/)** - Context.Service, Layer composition
- **[Error Handling](https://github.com/Effect-TS/effect-smol/tree/main/ai-docs/src/01_effect/03_errors/)** - catchTags, catchReason, error hierarchies
- **[Resources](https://github.com/Effect-TS/effect-smol/tree/main/ai-docs/src/01_effect/04_resources/)** - acquireRelease, Scope
- **[PubSub](https://github.com/Effect-TS/effect-smol/tree/main/ai-docs/src/01_effect/06_pubsub/)** - Event broadcasting
- **[Streams](https://github.com/Effect-TS/effect-smol/tree/main/ai-docs/src/02_stream/)** - Creating, consuming, encoding
- **[Integration](https://github.com/Effect-TS/effect-smol/tree/main/ai-docs/src/03_integration/)** - ManagedRuntime for non-Effect code
- **[Batching](https://github.com/Effect-TS/effect-smol/tree/main/ai-docs/src/05_batching/)** - RequestResolver patterns
- **[Schedules](https://github.com/Effect-TS/effect-smol/tree/main/ai-docs/src/06_schedule/)** - Retry and repeat strategies
- **[Observability](https://github.com/Effect-TS/effect-smol/tree/main/ai-docs/src/08_observability/)** - Logging, tracing, metrics
- **[Testing](https://github.com/Effect-TS/effect-smol/tree/main/ai-docs/src/09_testing/)** - @effect/vitest patterns
- **[HTTP](https://github.com/Effect-TS/effect-smol/tree/main/ai-docs/src/50_http-client/)** - HttpClient and HttpApi
- **[Child Process](https://github.com/Effect-TS/effect-smol/tree/main/ai-docs/src/60_child-process/)** - Process management
- **[CLI](https://github.com/Effect-TS/effect-smol/tree/main/ai-docs/src/70_cli/)** - CLI application building
- **[AI](https://github.com/Effect-TS/effect-smol/tree/main/ai-docs/src/71_ai/)** - Language models, tools, chat
- **[Cluster](https://github.com/Effect-TS/effect-smol/tree/main/ai-docs/src/80_cluster/)** - Distributed entities
