# HTTP Client & Server

Building HTTP clients and servers with Effect.

See related examples:
- [HTTP Client](https://github.com/Effect-TS/effect-smol/tree/main/ai-docs/src/50_http-client/)
- [HTTP Server](https://github.com/Effect-TS/effect-smol/tree/main/ai-docs/src/51_http-server/)

## HTTP Client

### Basic Setup

```ts
import { Effect, Layer, Schema, ServiceMap, flow } from "effect";
import {
  FetchHttpClient,
  HttpClient,
  HttpClientRequest,
  HttpClientResponse,
} from "effect/unstable/http";

class Todo extends Schema.Class<Todo>("Todo")({
  userId: Schema.Number,
  id: Schema.Number,
  title: Schema.String,
  completed: Schema.Boolean,
}) {}

class JsonPlaceholderError extends Schema.TaggedErrorClass<JsonPlaceholderError>()(
  "JsonPlaceholderError",
  { cause: Schema.Defect },
) {}

export class JsonPlaceholder extends ServiceMap.Service<
  JsonPlaceholder,
  {
    readonly allTodos: Effect.Effect<ReadonlyArray<Todo>, JsonPlaceholderError>;
    getTodo(id: number): Effect.Effect<Todo, JsonPlaceholderError>;
    createTodo(
      todo: Omit<Todo, "id">,
    ): Effect.Effect<Todo, JsonPlaceholderError>;
  }
>()("app/JsonPlaceholder") {
  static readonly layer = Layer.effect(
    JsonPlaceholder,
    Effect.gen(function* () {
      // Get client with middleware
      const client = (yield* HttpClient.HttpClient).pipe(
        // Add base URL and headers
        HttpClient.mapRequest(
          flow(
            HttpClientRequest.prependUrl(
              "https://jsonplaceholder.typicode.com",
            ),
            HttpClientRequest.acceptJson,
          ),
        ),
        // Fail on non-2xx
        HttpClient.filterStatusOk,
        // Retry transient errors
        HttpClient.retryTransient({
          schedule: Schedule.exponential(100),
          times: 3,
        }),
      );

      const allTodos = client.get("/todos").pipe(
        Effect.flatMap(HttpClientResponse.schemaBodyJson(Schema.Array(Todo))),
        Effect.mapError((cause) => new JsonPlaceholderError({ cause })),
        Effect.withSpan("JsonPlaceholder.allTodos"),
      );

      const getTodo = Effect.fn("JsonPlaceholder.getTodo")(function* (
        id: number,
      ) {
        yield* Effect.annotateCurrentSpan({ id });

        return yield* client
          .get(`/todos/${id}`, {
            urlParams: { format: "json" },
          })
          .pipe(
            Effect.flatMap(HttpClientResponse.schemaBodyJson(Todo)),
            Effect.mapError((cause) => new JsonPlaceholderError({ cause })),
          );
      });

      const createTodo = Effect.fn("JsonPlaceholder.createTodo")(function* (
        todo: Omit<Todo, "id">,
      ) {
        yield* Effect.annotateCurrentSpan({ title: todo.title });

        return yield* HttpClientRequest.post("/todos").pipe(
          HttpClientRequest.setUrlParams({ format: "json" }),
          HttpClientRequest.bodyJsonUnsafe(todo),
          client.execute,
          Effect.flatMap(HttpClientResponse.schemaBodyJson(Todo)),
          Effect.mapError((cause) => new JsonPlaceholderError({ cause })),
        );
      });

      return JsonPlaceholder.of({ allTodos, getTodo, createTodo });
    }),
  ).pipe(Layer.provide(FetchHttpClient.layer));
}
```

### Request Building

```ts
import { HttpClientRequest } from "effect/unstable/http";

const request = HttpClientRequest.get("/users").pipe(
  HttpClientRequest.setUrlParams({ page: "1", limit: "10" }),
  HttpClientRequest.setHeaders({ "X-Custom-Header": "value" }),
  HttpClientRequest.bearerToken("my-token"),
  HttpClientRequest.bodyJson({ name: "John" }),
);
```

## HTTP Server (HttpApi)

### Define API

```ts
// fixtures/api/Api.ts
import {
  HttpApi,
  HttpApiEndpoint,
  HttpApiGroup,
} from "effect/unstable/httpapi";
import { Schema } from "effect";

class User extends Schema.Class<User>("User")({
  id: Schema.Number,
  name: Schema.String,
  email: Schema.String,
}) {}

export class Api extends HttpApi.make("myApi").pipe(
  HttpApi.addGroup(
    HttpApiGroup.make("users").pipe(
      HttpApiGroup.addEndpoint(
        HttpApiEndpoint.get("getUser", "/users/:id").pipe(
          HttpApiEndpoint.setPathSchema(Schema.Struct({ id: Schema.Number })),
          HttpApiEndpoint.addSuccess(User),
          HttpApiEndpoint.addError(Schema.String, { status: 404 }),
        ),
      ),
      HttpApiGroup.addEndpoint(
        HttpApiEndpoint.post("createUser", "/users").pipe(
          HttpApiEndpoint.setPayloadSchema(
            Schema.Struct({ name: Schema.String }),
          ),
          HttpApiEndpoint.addSuccess(User, { status: 201 }),
        ),
      ),
    ),
  ),
) {}
```

### Implement Handlers

```ts
// fixtures/server/Users/http.ts
import { HttpApiBuilder } from "effect/unstable/httpapi";
import { Effect } from "effect";

export const UsersApiHandlers = HttpApiBuilder.group(
  Api,
  "users",
  Effect.fn(function* (handlers) {
    return handlers
      .handle("getUser", ({ path: { id } }) =>
        Effect.gen(function* () {
          const user = yield* findUserById(id);
          if (user) return user;
          return yield* Effect.fail("User not found");
        }),
      )
      .handle("createUser", ({ payload }) =>
        Effect.gen(function* () {
          const user = yield* createUser(payload.name);
          return user;
        }),
      );
  }),
);
```

### Serve API

```ts
import { NodeHttpServer, NodeRuntime } from "@effect/platform-node";
import { Effect, Layer } from "effect";
import { HttpRouter, HttpServerResponse } from "effect/unstable/http";
import { HttpApiBuilder, HttpApiScalar } from "effect/unstable/httpapi";
import { createServer } from "node:http";

// Health check endpoint
const SystemApiHandlers = HttpApiBuilder.group(
  Api,
  "system",
  Effect.fn(function* (handlers) {
    return handlers.handle("health", () => Effect.void);
  }),
);

// Build API routes
const ApiRoutes = HttpApiBuilder.layer(Api, {
  openapiPath: "/openapi.json",
}).pipe(Layer.provide([UsersApiHandlers, SystemApiHandlers]));

// Documentation route
const DocsRoute = HttpApiScalar.layer(Api, { path: "/docs" });

// Merge all routes
const AllRoutes = Layer.mergeAll(ApiRoutes, DocsRoute);

// Create server
const HttpServerLayer = HttpRouter.serve(AllRoutes).pipe(
  Layer.provide(NodeHttpServer.layer(createServer, { port: 3000 })),
);

// Run server
Layer.launch(HttpServerLayer).pipe(NodeRuntime.runMain);
```

## HTTP Client (Generated)

### Create Client

```ts
import { HttpApiClient, HttpApiMiddleware } from "effect/unstable/httpapi";
import { HttpClient, HttpClientRequest } from "effect/unstable/http";
import { Effect, flow, Layer, Schedule, ServiceMap } from "effect";

// Client middleware (e.g., auth)
const AuthorizationClient = HttpApiMiddleware.layerClient(
  Authorization,
  Effect.fn(function* ({ next, request }) {
    return yield* next(HttpClientRequest.bearerToken(request, "dev-token"));
  }),
);

// Generated client service
export class ApiClient extends ServiceMap.Service<
  ApiClient,
  HttpApiClient.ForApi<typeof Api>
>()("acme/ApiClient") {
  static readonly layer = Layer.effect(
    ApiClient,
    HttpApiClient.make(Api, {
      transformClient: (client) =>
        client.pipe(
          HttpClient.mapRequest(
            flow(HttpClientRequest.prependUrl("http://localhost:3000")),
          ),
          HttpClient.retryTransient({
            schedule: Schedule.exponential(100),
            times: 3,
          }),
        ),
    }),
  ).pipe(
    Layer.provide(AuthorizationClient),
    Layer.provide(FetchHttpClient.layer),
  );
}

// Usage
const callApi = Effect.gen(function* () {
  const client = yield* ApiClient;
  const user = yield* client.users.getUser({ path: { id: 1 } });
  yield* Effect.logInfo(`Got user: ${user.name}`);
}).pipe(Effect.provide(ApiClient.layer));
```

## Web Handler (Serverless)

```ts
// For serverless environments
export const { handler, dispose } = HttpRouter.toWebHandler(
  AllRoutes.pipe(Layer.provide(HttpServer.layerServices)),
);
```

## Best Practices

1. **Define schemas** for all request/response bodies
2. **Use service pattern** for HTTP clients
3. **Add middleware** for cross-cutting concerns (auth, logging)
4. **Handle errors** with typed error responses
5. **Retry transient failures** with exponential backoff
6. **Add spans** for distributed tracing
7. **Use generated clients** for type-safe API calls
8. **Separate API definition** from implementation

## Testing

```ts
import { assert, describe, it } from "@effect/vitest";

describe("JsonPlaceholder", () => {
  it.effect("fetches todos", () =>
    Effect.gen(function* () {
      const api = yield* JsonPlaceholder;
      const todos = yield* api.allTodos;

      assert.isTrue(todos.length > 0);
      assert.isTrue(todos[0].id > 0);
    }).pipe(Effect.provide(JsonPlaceholder.layer)),
  );
});
```
