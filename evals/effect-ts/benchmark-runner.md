# Benchmark Runner

> Instructions for running the building-with-effect skill benchmark.
> This is a manual process to allow human oversight of outputs.

## Prerequisites

- Access to two fresh agent conversations (or reset conversations)
- building-with-effect skill installed
- Ability to save/compare agent outputs

## Process Overview

```
┌─────────────────────────────────────────────────────────────┐
│ Phase 1: Baseline Run (Without Skill)                      │
│ ├── Copy task prompts 1-5                                   │
│ ├── Disable building-with-effect skill                      │
│ ├── Run each task, save outputs                            │
│ └── Score against rubric (Completeness + Quality)           │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ Phase 2: Skill-Enabled Run (With Skill)                     │
│ ├── Copy task prompts 1-5                                   │
│ ├── Enable building-with-effect skill                       │
│ ├── Run each task, save outputs                            │
│ └── Score against rubric (Completeness + Quality)           │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ Phase 3: Comparison                                         │
│ ├── Calculate improvement per task                         │
│ ├── Calculate total improvement                            │
│ └── Document findings                                      │
└─────────────────────────────────────────────────────────────┘
```

## Phase 1: Baseline Run

### Step 1: Prepare Environment

1. Open a new conversation (or reset current conversation context)
2. Verify the building-with-effect skill is NOT active:
   - Check skill list - skill should not be loaded
   - If loaded, the baseline results will be invalid

### Step 2: Run Task 1 (Payment Processor)

Copy the following prompt and paste into the agent:

```

Task: Implement a PaymentService using the Effect library.

Requirements:

- Define three error types: InsufficientFundsError, TransactionFailedError, CurrencyNotSupportedError
- Create PaymentService extending ServiceMap.Service
- Implement methods: processPayment, refundPayment, getPaymentStatus
- Handle errors with catchTags
- Include logging

Provide complete TypeScript code with proper Effect patterns.

```

Save the output as `baseline-task-1.md`.

### Step 3: Run Tasks 2-5

Repeat Step 2 for each remaining task:

**Task 2 (File Cache Manager)**:

```

Task: Implement a CacheService for file-based caching with TTL.

Requirements:

- Define error types: CacheMissError, CacheWriteError, CacheReadError
- Create CacheService extending ServiceMap.Service
- Implement methods: getOrSet, invalidate, clear
- Use acquireUseRelease for resource safety
- Include proper cleanup

Provide complete TypeScript code with proper Effect patterns.

```

**Task 3 (Data Transformer)**:

```

Task: Implement a TransformService for data validation and transformation.

Requirements:

- Define error types: ParseError, ValidationError, TransformationError
- Create TransformService extending ServiceMap.Service
- Implement methods: transformUserData, transformBatch, validateSchema
- Use Schema.decode for validation
- Implement batch processing with concurrency

Provide complete TypeScript code with proper Effect patterns.

```

**Task 4 (Config Loader)**:

```

Task: Implement a ConfigService for loading configuration with defaults.

Requirements:

- Define error types: ConfigFileNotFoundError, ConfigParseError, ConfigValidationError
- Create ConfigService extending ServiceMap.Service
- Implement methods: loadConfig, loadWithDefaults, validateConfig
- loadWithDefaults should never fail (return Effect<..., never>)
- Use Schema.decode for validation

Provide complete TypeScript code with proper Effect patterns.

```

**Task 5 (Background Worker)**:

```

Task: Implement a WorkerService for concurrent task processing with graceful shutdown.

Requirements:

- Define error types: QueueFullError, TaskProcessingError, ShutdownError
- Create WorkerService extending ServiceMap.Service
- Implement methods: enqueue, processQueue, shutdown, getStatus
- Use Effect.fork for concurrency
- Implement graceful shutdown

Provide complete TypeScript code with proper Effect patterns.

```

### Step 4: Score Baseline Outputs

For each saved output, open `benchmark-rubric.md` and mark pass/fail:

1. Check each completeness criterion (10 per task)
2. Check each quality criterion (shared across all tasks)
3. Record scores in the Score Summary Table

## Phase 2: Skill-Enabled Run

### Step 1: Prepare Environment

1. Open a NEW conversation (critical - no cross-contamination)
2. Enable the building-with-effect skill:
   - Load skill or activate in conversation
   - Verify skill is active before proceeding

### Step 2: Run All Tasks

Repeat Phase 1, Steps 2-3 with the skill enabled.
Save outputs as `skill-task-1.md`, `skill-task-2.md`, etc.

### Step 3: Score Skill-Enabled Outputs

Using the same rubric, score each skill-enabled output.

## Phase 3: Comparison

### Step 1: Calculate Improvement

For each task:

```

Completeness Improvement = Skill Completeness - Baseline Completeness
Quality Improvement = Skill Quality - Baseline Quality

```

### Step 2: Document Findings

Create a comparison document with:

1. **Per-Task Scores**: Table showing baseline vs skill scores per task
2. **Total Scores**: Combined totals
3. **Key Observations**: Which patterns improved most?
4. **Failure Analysis**: Where did the skill not help?

### Example Score Summary

| Metric             | Baseline | With Skill | Improvement |
| ------------------ | -------- | ---------- | ----------- |
| Total Completeness | 32/50    | 45/50      | +13 (+26%)  |
| Total Quality      | 28/50    | 43/50      | +15 (+30%)  |

## Expected Outcomes

Based on the skill's design, the benchmark should show improvement in:

- **Effect.fn usage**: Skill enforces recommended patterns
- **Error type definition**: Skill provides TaggedErrorClass templates
- **Service structure**: Skill enforces ServiceMap.Service pattern
- **Layer composition**: Skill shows proper dependency injection
- **Resource management**: Skill emphasizes acquireUseRelease patterns

## Troubleshooting

**Q: Skill appears active during baseline run**
A: Invalidate the baseline results. Start completely fresh with verification.

**Q: Outputs are very similar**
A: This may indicate the agent already knew Effect patterns well. Consider:

- Using less experienced agents for baseline
- Adding more specific quality criteria

**Q: Skill output is worse**
A: Investigate. Possible causes:

- Skill conflict with agent's existing knowledge
- Skill suggesting patterns not appropriate for tasks
- Scoring bias in human evaluation
