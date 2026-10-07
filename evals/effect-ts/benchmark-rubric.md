# Benchmark Rubric

> Scoring criteria for evaluating building-with-effect benchmark tasks.
> Use this rubric to score outputs from both baseline and skill-enabled runs.

## Scoring Overview

For each task, score:

1. **Completeness** (0-100%): What percentage of required behaviors were implemented?
2. **Quality** (0-100%): What percentage of quality criteria were met?

**Improvement** = Skill-enabled score - Baseline score

### Handling Not Applicable (N/A) Items

Some quality criteria may not apply to certain services. When scoring:

- **N/A items are EXCLUDED from the denominator** (they don't count as failures)
- Example: If a service has no external resources, Q5 (Resource Management) is marked N/A and excluded
- Example: If a service doesn't need concurrency, Q8 is marked N/A and excluded
- The score is calculated as: `(Pass + Partial) / (Total - N/A)`

This ensures fair comparison between implementations that may have different numbers of applicable criteria.

## Quality Criteria Definitions

### Q1: Effect.fn Usage (for function methods)

- **Pass**: Function methods use `Effect.fn("Name.method")` pattern
- **Fail**: Uses `Effect.gen` alone without Effect.fn wrapper for methods

### Q2: Error Type Definition

- **Pass**: All errors use `Schema.TaggedErrorClass` with descriptive `_tag` and context fields
- **Fail**: Uses plain `class Error` or `new Error()` without Schema integration

### Q3: Service Structure

- **Pass**: Service extends `ServiceMap.Service` with proper type annotations and static `layer` property
- **Fail**: Uses global state, manual dependency injection, or incorrect service pattern

### Q4: Layer Composition

- **Pass**: Uses `Layer.effect` and `Layer.provide` for dependency injection
- **Fail**: Manual dependency passing or no layer system usage

### Q5: Resource Management

- **Pass**: Uses `acquireUseRelease` or `addFinalizer` for resource cleanup
- **Fail**: Missing cleanup, try/catch, or no resource management

### Q6: Schema Usage

- **Pass**: Uses `Schema.decode`/`Schema.encode` for validation/transformation
- **Fail**: Manual validation code or no schema usage where appropriate

### Q7: Error Handling

- **Pass**: Uses `catchTags`/`catch` for specific error handling with recovery
- **Fail**: Catches all errors with single handler or no error recovery

### Q8: Concurrency Pattern

- **Pass**: Uses `Effect.all`/`Effect.forEach` with appropriate concurrency, `fork`/`join`
- **Fail**: Sequential processing where concurrency is appropriate, or missing fiber management

### Q9: Logging/Observability

- **Pass**: Uses `Effect.logInfo`/`Effect.logError` with contextual data
- **Fail**: No logging or uses console.log

### Q10: Type Signature Correctness

- **Pass**: Effect type signatures include all success/error types
- **Fail**: Missing error types in signature, or `any` types

## Task-Specific Completeness Criteria

### Task 1: Payment Processor

- [ ] InsufficientFundsError defined with Schema.TaggedErrorClass
- [ ] TransactionFailedError defined with Schema.TaggedErrorClass
- [ ] CurrencyNotSupportedError defined with Schema.TaggedErrorClass
- [ ] PaymentService extends ServiceMap.Service
- [ ] processPayment implemented with Effect.fn
- [ ] refundPayment implemented with Effect.fn
- [ ] getPaymentStatus implemented with Effect.fn
- [ ] Error handling with catchTags
- [ ] Layer.effect with implementation
- [ ] Logging present

### Task 2: File Cache Manager

- [ ] CacheMissError defined with Schema.TaggedErrorClass
- [ ] CacheWriteError defined with Schema.TaggedErrorClass
- [ ] CacheReadError defined with Schema.TaggedErrorClass
- [ ] CacheService extends ServiceMap.Service
- [ ] getOrSet implemented with acquireUseRelease
- [ ] invalidate implemented
- [ ] clear implemented returning count
- [ ] Scope usage for file handles
- [ ] Layer.effect with implementation
- [ ] Effect.addFinalizer for cleanup

### Task 3: Data Transformer Pipeline

- [ ] ParseError defined with Schema.TaggedErrorClass
- [ ] ValidationError defined with Schema.TaggedErrorClass
- [ ] TransformationError defined with Schema.TaggedErrorClass
- [ ] TransformService extends ServiceMap.Service
- [ ] transformUserData implemented
- [ ] transformBatch implemented with Effect.forEach
- [ ] Schema.decode usage for validation
- [ ] Concurrency option set (e.g., 10)
- [ ] Retry with Schedule implemented
- [ ] Layer.effect with implementation

### Task 4: Configuration Loader

- [ ] ConfigFileNotFoundError defined with Schema.TaggedErrorClass
- [ ] ConfigParseError defined with Schema.TaggedErrorClass
- [ ] ConfigValidationError defined with Schema.TaggedErrorClass
- [ ] ConfigService extends ServiceMap.Service
- [ ] loadConfig implemented
- [ ] loadWithDefaults implemented returning Effect<..., never>
- [ ] validateConfig implemented using Schema.decode
- [ ] Default value fallback via orElse/succeed
- [ ] mapError for Schema error conversion
- [ ] Layer.effect with implementation

### Task 5: Background Worker

- [ ] QueueFullError defined with Schema.TaggedErrorClass
- [ ] TaskProcessingError defined with Schema.TaggedErrorClass
- [ ] ShutdownError defined with Schema.TaggedErrorClass
- [ ] WorkerService extends ServiceMap.Service
- [ ] enqueue implemented
- [ ] processQueue implemented with Effect.fork
- [ ] shutdown implemented with graceful drain
- [ ] getStatus implemented returning Effect<..., never>
- [ ] Ref usage for state
- [ ] Layer.effect with implementation

## Score Summary Table

| Task                  | Completeness (Baseline) | Completeness (Skill) | Quality (Baseline) | Quality (Skill) | Improvement |
| --------------------- | ----------------------- | -------------------- | ------------------ | --------------- | ----------- |
| 1: Payment Processor  | /10                     | /10                  | /10                | /10             |             |
| 2: File Cache Manager | /10                     | /10                  | /10                | /10             |             |
| 3: Data Transformer   | /10                     | /10                  | /10                | /10             |             |
| 4: Config Loader      | /10                     | /10                  | /10                | /10             |             |
| 5: Background Worker  | /10                     | /10                  | /10                | /10             |             |
| **Total**             | **/50**                 | **/50**              | **/50**            | **/50**         |             |

## Interpreting Results

- **Improvement > 0**: Skill improves output quality/completeness
- **Improvement = 0**: No measurable improvement
- **Improvement < 0**: Skill degraded output (investigate cause)

**Target**: Skill should improve completeness by >20% and quality by >30% on average.
