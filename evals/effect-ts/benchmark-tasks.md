# Skill Benchmark Tasks

> Benchmark tasks for measuring building-with-effect skill effectiveness.
> Run each task WITHOUT the skill (baseline), then WITH the skill, and compare outputs.

## Task 1: Payment Processor

**Domain**: FinTech — Payment transaction processing

**Task**: Implement a `PaymentService` that processes payments with the following operations:

- `processPayment(amount: number, currency: string): Effect<PaymentResult, PaymentError>`
- `refundPayment(transactionId: string): Effect<RefundResult, PaymentError>`
- `getPaymentStatus(transactionId: string): Effect<PaymentStatus, PaymentError>`

**Required Behaviors**:

- [ ] Defines InsufficientFundsError, TransactionFailedError, CurrencyNotSupportedError using Schema.TaggedErrorClass
- [ ] Creates PaymentService extending ServiceMap.Service with proper type annotations
- [ ] Implements methods using Effect.fn with descriptive span names
- [ ] Handles errors with catchTags for specific error recovery
- [ ] Builds Layer.effect with service implementation
- [ ] Returns errors properly with `return yield* new ErrorType()` pattern
- [ ] Includes logging with Effect.logInfo/Effect.logError

**Quality Criteria**:

- [ ] Uses Effect.fn (not Effect.gen alone for function methods)
- [ ] Error types include relevant context fields (amount, currency, transactionId)
- [ ] Methods have proper Effect type signatures with typed errors
- [ ] Service layer is properly exported with static layer property

---

## Task 2: File Cache Manager

**Domain**: Systems — File-based caching with TTL and eviction

**Task**: Implement a `CacheService` that manages file-based caching:

- `getOrSet(key: string, ttlSeconds: number, generator: () => Effect<string>): Effect<string, CacheError>`
- `invalidate(key: string): Effect<void, CacheError>`
- `clear(): Effect<number, CacheError>` (returns count of cleared entries)

**Required Behaviors**:

- [ ] Defines CacheMissError, CacheWriteError, CacheReadError using Schema.TaggedErrorClass
- [ ] Creates CacheService extending ServiceMap.Service
- [ ] Implements getOrSet using acquireUseRelease for resource safety
- [ ] Uses Scope to manage file handle lifecycle
- [ ] Handles concurrent access with Effect.map
- [ ] Builds Layer.effect with service implementation
- [ ] Provides proper cleanup in finalizer with Effect.addFinalizer

**Quality Criteria**:

- [ ] Uses acquireUseRelease or addFinalizer for resource cleanup
- [ ] TTL handling is correct (expires after ttlSeconds)
- [ ] Cache operations are atomic where needed
- [ ] Error context includes key name for debugging
- [ ] Layer composition follows ServiceMap.Service pattern

---

## Task 3: Data Transformer Pipeline

**Domain**: ETL — Data validation and transformation pipeline

**Task**: Implement a `TransformService` that validates and transforms data:

- `transformUserData(raw: unknown): Effect<ParsedUser, TransformError>`
- `transformBatch(items: unknown[]): Effect<ParsedUser[], TransformError>`
- `validateSchema(data: unknown, schema: Schema): Effect<ValidData, TransformError>`

**Required Behaviors**:

- [ ] Defines ParseError, ValidationError, TransformationError using Schema.TaggedErrorClass
- [ ] Uses Schema.decode for input validation
- [ ] Implements transformBatch with Effect.forEach and concurrency option
- [ ] Collects all errors (not fails fast) for batch operations
- [ ] Implements retry with Schedule for transient failures
- [ ] Uses Effect.catch to handle schema validation failures
- [ ] Builds Layer.effect with service implementation

**Quality Criteria**:

- [ ] Schema validation uses effect's Schema module (not manual validation)
- [ ] Batch processing uses appropriate concurrency (e.g., 10 at a time)
- [ ] Error aggregation preserves all validation errors in batch mode
- [ ] Retry schedule is appropriate for transient failures (exponential backoff)
- [ ] Pipeline is composable with clear separation of concerns

---

## Task 4: Configuration Loader

**Domain**: DevOps — Multi-format configuration loading with defaults

**Task**: Implement a `ConfigService` that loads configuration:

- `loadConfig(path: string): Effect<AppConfig, ConfigError>`
- `loadWithDefaults(path: string, defaults: Partial<AppConfig>): Effect<AppConfig, never>` (never fails)
- `validateConfig(config: unknown): Effect<AppConfig, ConfigError>`

**Required Behaviors**:

- [ ] Defines ConfigFileNotFoundError, ConfigParseError, ConfigValidationError using Schema.TaggedErrorClass
- [ ] Uses Schema.decode for configuration validation
- [ ] Implements loadWithDefaults using orElse/succeed for fallback
- [ ] Provides sensible defaults via Effect.succeed
- [ ] Logs configuration loading with Effect.logInfo
- [ ] Builds Layer.effect with service implementation
- [ ] Uses mapError to convert Schema errors to domain errors

**Quality Criteria**:

- [ ] Configuration schema is defined using Schema.Struct
- [ ] Error messages include file path and parsing context
- [ ] loadWithDefaults returns Effect<..., never> (guaranteed success)
- [ ] Default values are applied correctly before validation
- [ ] Service follows ServiceMap.Service pattern with static layer

---

## Task 5: Background Worker

**Domain**: Systems — Concurrent task processing with graceful shutdown

**Task**: Implement a `WorkerService` that processes tasks concurrently:

- `enqueue(task: WorkTask): Effect<void, WorkerError>`
- `processQueue(): Effect<ProcessResult, WorkerError>`
- `shutdown(): Effect<void, WorkerError>` (graceful drain)
- `getStatus(): Effect<WorkerStatus, never>`

**Required Behaviors**:

- [ ] Defines QueueFullError, TaskProcessingError, ShutdownError using Schema.TaggedErrorClass
- [ ] Uses Ref to maintain mutable worker state safely
- [ ] Implements processQueue using Effect.fork for concurrent processing
- [ ] Uses Fiber interruption for graceful shutdown
- [ ] Implements withTimeout for task processing deadlines
- [ ] Uses Effect.catch for error recovery in individual tasks
- [ ] Builds Layer.effect with service implementation

**Quality Criteria**:

- [ ] Uses Ref for state (not global variables)
- [ ] Fork/join pattern for concurrent task processing
- [ ] Timeout applied appropriately to prevent runaway tasks
- [ ] Shutdown waits for in-flight tasks to complete
- [ ] Status reporting is non-blocking (succeeds even if queue is unhealthy)
- [ ] Service uses Effect.fn with span names for observability
