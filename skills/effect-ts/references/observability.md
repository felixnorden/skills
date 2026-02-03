# Observability - Logging, Metrics, Tracing

Built-in observability primitives.

## Logging

**Basic logging**
```ts
Effect.log("Application started")
Effect.logDebug("Debug info")
Effect.logInfo("Info message")
Effect.logWarning("Warning")
Effect.logError("Error occurred")
Effect.logFatal("Fatal error")
```

**With context**
```ts
Effect.log("User created", { userId: 123, email: "user@example.com" })
```

**Log levels**
```ts
import { Logger, LogLevel } from "effect"

// Set minimum level
const program = effect.pipe(
  Effect.withLogLevel(LogLevel.Warning)
)
```

**Custom logger**
```ts
const customLogger = Logger.make(({ message, logLevel, annotations }) => {
  console.log(`[${logLevel.label}] ${message}`)
})

const withCustom = Logger.replace(
  Logger.defaultLogger,
  customLogger
)

program.pipe(Effect.provide(withCustom))
```

**Structured logging**
```ts
Effect.logDebug("Processing order").pipe(
  Effect.annotateLogs({
    orderId: order.id,
    customerId: order.customerId,
    amount: order.total
  })
)
```

**Disable logging**
```ts
effect.pipe(Effect.withLogLevel(LogLevel.None))
```

## Metrics

**Counter**
```ts
import { Metric } from "effect"

const requestCount = Metric.counter("http_requests_total", {
  description: "Total HTTP requests"
})

Effect.gen(function* () {
  yield* requestCount.pipe(Metric.increment)
  // Or with amount
  yield* requestCount.pipe(Metric.incrementBy(5))
})
```

**Gauge**
```ts
const activeConnections = Metric.gauge("active_connections")

Effect.gen(function* () {
  yield* activeConnections.pipe(Metric.set(42))
  yield* activeConnections.pipe(Metric.increment)
  yield* activeConnections.pipe(Metric.decrement)
})
```

**Histogram**
```ts
const requestDuration = Metric.histogram("http_request_duration_seconds", {
  boundaries: [0.1, 0.5, 1.0, 2.5, 5.0]
})

Effect.gen(function* () {
  const start = Date.now()
  yield* handleRequest()
  const duration = (Date.now() - start) / 1000
  yield* requestDuration.pipe(Metric.update(duration))
})
```

**Summary**
```ts
const responseSize = Metric.summary("response_size_bytes", {
  maxAge: "1 hour",
  maxSize: 100
})

Effect.gen(function* () {
  const size = response.length
  yield* responseSize.pipe(Metric.update(size))
})
```

**Frequency**
```ts
const errorTypes = Metric.frequency("error_types")

Effect.gen(function* () {
  yield* errorTypes.pipe(Metric.update("NetworkError"))
})
```

**Tagged metrics**
```ts
const requests = Metric.counter("requests").pipe(
  Metric.taggedWith({
    method: "GET",
    path: "/api/users"
  })
)

Effect.gen(function* () {
  yield* requests.pipe(Metric.increment)
})
```

**Track duration**
```ts
const tracked = Effect.gen(function* () {
  // Expensive operation
  yield* Effect.sleep("1 second")
  return "done"
}).pipe(
  Metric.trackDuration(requestDuration)
)
```

## Tracing

**Basic spans**
```ts
const program = Effect.gen(function* () {
  yield* Effect.log("Starting")
  return "done"
}).pipe(
  Effect.withSpan("myOperation", {
    attributes: { userId: "123" }
  })
)
```

**Nested spans**
```ts
const program = Effect.gen(function* () {
  const user = yield* fetchUser().pipe(
    Effect.withSpan("fetchUser")
  )
  
  const orders = yield* fetchOrders(user.id).pipe(
    Effect.withSpan("fetchOrders")
  )
  
  return { user, orders }
}).pipe(
  Effect.withSpan("loadUserData")
)
```

**Add span attributes**
```ts
Effect.gen(function* () {
  yield* Effect.annotateCurrentSpan({
    "user.id": userId,
    "request.method": "GET"
  })
  
  const result = yield* processRequest()
  
  yield* Effect.annotateCurrentSpan({
    "response.status": result.status
  })
})
```

**Links between spans**
```ts
Effect.gen(function* () {
  const parentSpan = yield* Effect.currentSpan
  
  yield* Effect.fork(
    backgroundTask.pipe(
      Effect.linkSpans([parentSpan])
    )
  )
})
```

## OpenTelemetry Integration

**Setup**
```ts
import { NodeSdk } from "@effect/opentelemetry"
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-base"
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http"

const TracingLive = NodeSdk.layer(() => ({
  resource: { serviceName: "my-app" },
  spanProcessor: new BatchSpanProcessor(
    new OTLPTraceExporter({ url: "http://localhost:4318/v1/traces" })
  )
}))

program.pipe(Effect.provide(TracingLive))
```

## FiberRefs (Fiber-local storage)

**Create FiberRef**
```ts
import { FiberRef } from "effect"

const userId = yield* FiberRef.make("unknown")

// Set value
yield* FiberRef.set(userId, "user-123")

// Get value
const id = yield* FiberRef.get(userId)

// Update
yield* FiberRef.update(userId, (id) => `${id}-updated`)
```

**Scoped FiberRef**
```ts
Effect.gen(function* () {
  yield* FiberRef.set(userId, "user-123")
  
  // Nested scope
  yield* FiberRef.locally(userId, "user-456")(
    Effect.gen(function* () {
      const id = yield* FiberRef.get(userId)
      console.log(id)  // "user-456"
    })
  )
  
  const id = yield* FiberRef.get(userId)
  console.log(id)  // "user-123" (restored)
})
```

## Common Patterns

**Request ID tracking**
```ts
const requestId = yield* FiberRef.make<string>("")

const withRequestId = <A, E, R>(
  effect: Effect.Effect<A, E, R>
) =>
  Effect.gen(function* () {
    const id = crypto.randomUUID()
    yield* FiberRef.set(requestId, id)
    yield* Effect.annotateLogs("requestId", id)
    return yield* effect
  })
```

**HTTP request logging**
```ts
const logRequest = (req: Request) =>
  Effect.gen(function* () {
    yield* Effect.log("Request received", {
      method: req.method,
      path: req.url
    })
    
    const start = Date.now()
    const response = yield* handleRequest(req)
    const duration = Date.now() - start
    
    yield* Effect.log("Request completed", {
      status: response.status,
      duration
    })
    
    yield* requestDuration.pipe(Metric.update(duration / 1000))
    
    return response
  }).pipe(
    Effect.withSpan("httpRequest", {
      attributes: {
        "http.method": req.method,
        "http.url": req.url
      }
    })
  )
```

**Error tracking**
```ts
const errorCounter = Metric.counter("errors_total")

const trackErrors = <A, E, R>(
  effect: Effect.Effect<A, E, R>
) =>
  effect.pipe(
    Effect.tapError((error) =>
      Effect.all([
        Effect.logError("Error occurred", { error }),
        errorCounter.pipe(Metric.increment)
      ])
    )
  )
```

## Testing Observability

**Test logger**
```ts
import { Logger } from "effect/Logger"

const testLogger = Logger.make(({ message }) => {
  testLogs.push(message)
})

const TestLogger = Logger.replace(Logger.defaultLogger, testLogger)

const test = program.pipe(Effect.provide(TestLogger))
```

**Inspect spans**
```ts
import { Effect } from "effect"

const spans: Array<Span> = []

const TestTracer = /* custom tracer that captures spans */

Effect.runPromise(
  program.pipe(Effect.provide(TestTracer))
)

expect(spans).toHaveLength(3)
expect(spans[0].name).toBe("operation")
```

## Best Practices

Log at appropriate levels
Add context to logs
Tag metrics with relevant labels
Use spans for async operations
Track errors and latencies
Set up OpenTelemetry early

Avoid:
- Logging sensitive data
- Over-logging in hot paths
- Creating too many metrics
- Forgetting to track failures
- Ignoring span cleanup
