# Eval summary: effect-ts

Generated: 2026-10-06T20:57:45.989Z
Models: opencode/qwen3.8-max, opencode-go/deepseek-v4.1-flash
Runs per trigger query: 3

## Trigger results

| Model | Case | Should trigger | Split | Rate | Result |
| --- | --- | --- | --- | --- | --- |
| opencode/qwen3.8-max | Add a new service to my Effect project. | true | train | 1.00 | PASS |
| opencode/qwen3.8-max | How do I structure layers for this dependency? | true | train | 1.00 | PASS |
| opencode/qwen3.8-max | My Effect program has a type error about requirements. | true | train | 1.00 | PASS |
| opencode/qwen3.8-max | Write a test for this Effect service. | true | train | 1.00 | PASS |
| opencode/qwen3.8-max | Convert this try/catch code to Effect. | true | train | 1.00 | PASS |
| opencode/qwen3.8-max | Define a tagged error for this service. | true | train | 1.00 | PASS |
| opencode/qwen3.8-max | Work in this repo and follow the existing Effect patterns. | true | train | 1.00 | PASS |
| opencode/qwen3.8-max | How do I stream rows from this database with Effect? | true | validation | 1.00 | PASS |
| opencode/qwen3.8-max | Set up retries with a schedule for this call. | true | validation | 1.00 | PASS |
| opencode/qwen3.8-max | Write a React component for the dashboard. | false | train | 0.00 | PASS |
| opencode/qwen3.8-max | Fix this CSS layout. | false | train | 0.00 | PASS |
| opencode/qwen3.8-max | Explain how TCP works. | false | train | 0.00 | PASS |
| opencode/qwen3.8-max | Write a Python script to parse a CSV. | false | train | 0.00 | PASS |
| opencode/qwen3.8-max | Set up a Postgres database. | false | train | 0.33 | PASS |
| opencode/qwen3.8-max | Explain Kubernetes autoscaling. | false | validation | 0.00 | PASS |
| opencode/qwen3.8-max | Write a Rust CLI tool. | false | validation | 0.00 | PASS |
| opencode/qwen3.8-max | Draft a marketing email. | false | validation | 0.00 | PASS |
| opencode-go/deepseek-v4.1-flash | Add a new service to my Effect project. | true | train | 1.00 | PASS |
| opencode-go/deepseek-v4.1-flash | How do I structure layers for this dependency? | true | train | 1.00 | PASS |
| opencode-go/deepseek-v4.1-flash | My Effect program has a type error about requirements. | true | train | 1.00 | PASS |
| opencode-go/deepseek-v4.1-flash | Write a test for this Effect service. | true | train | 1.00 | PASS |
| opencode-go/deepseek-v4.1-flash | Convert this try/catch code to Effect. | true | train | 1.00 | PASS |
| opencode-go/deepseek-v4.1-flash | Define a tagged error for this service. | true | train | 1.00 | PASS |
| opencode-go/deepseek-v4.1-flash | Work in this repo and follow the existing Effect patterns. | true | train | 1.00 | PASS |
| opencode-go/deepseek-v4.1-flash | How do I stream rows from this database with Effect? | true | validation | 1.00 | PASS |
| opencode-go/deepseek-v4.1-flash | Set up retries with a schedule for this call. | true | validation | 1.00 | PASS |
| opencode-go/deepseek-v4.1-flash | Write a React component for the dashboard. | false | train | 1.00 | FAIL |
| opencode-go/deepseek-v4.1-flash | Fix this CSS layout. | false | train | 0.00 | PASS |
| opencode-go/deepseek-v4.1-flash | Explain how TCP works. | false | train | 0.33 | PASS |
| opencode-go/deepseek-v4.1-flash | Write a Python script to parse a CSV. | false | train | 0.00 | PASS |
| opencode-go/deepseek-v4.1-flash | Set up a Postgres database. | false | train | 0.67 | FAIL |
| opencode-go/deepseek-v4.1-flash | Explain Kubernetes autoscaling. | false | validation | 0.00 | PASS |
| opencode-go/deepseek-v4.1-flash | Write a Rust CLI tool. | false | validation | 0.00 | PASS |
| opencode-go/deepseek-v4.1-flash | Draft a marketing email. | false | validation | 0.00 | PASS |

32 of 34 trigger cases pass.

## Output results

### new-service
- PASS: The answer defines the service with Context.Service.
  - evidence: 'export class Database extends Context.Service<...>' and 'export class UserRepository extends Context.Service<...>'.
- PASS: The answer defines the error with Schema.TaggedErrorClass.
  - evidence: 'export class DatabaseError extends Schema.TaggedErrorClass<DatabaseError>()' and 'UserNotFoundError'.
- PASS: The answer builds the implementation with Layer.effect.
  - evidence: 'static readonly layer: Layer.Layer<Database> = Layer.effect(...)' and Layer.effect for UserRepository.

### catch-tags
- PASS: The answer uses Effect.catchTags for the specific errors.
  - evidence: 'Effect.catchTags({ NotFoundError: ..., RateLimitError: ... })'.
- PASS: The answer adds a final fallback with Effect.catch.
  - evidence: 'Effect.catch((error) => Effect.succeed(defaultUser))' as step 2 after catchTags.

### test-service
- PASS: The answer provides the test layer with Effect.provide.
  - evidence: '.pipe(Effect.provide(CheckoutTestLayer))' and 'Provide the test layer at the test boundary with Effect.provide'.
- PASS: The answer uses Effect.gen or the @effect/vitest it.effect helper in the test.
  - evidence: 'it.effect("charges the full total", () => ...)' and 'layer(CheckoutTestLayer)("Checkout", (it) => ...)'.

7 of 7 assertions pass.

## Cost per arm

| Model | Arm | Runs | Avg time (ms) | Tokens | Est. cost (USD) |
| --- | --- | --- | --- | --- | --- |
| opencode-go/deepseek-v4.1-flash | baseline | 51 | 20250 | 1458836 | 0.116794 |
| opencode-go/deepseek-v4.1-flash | baseline | 3 | 52005 | 1062976 | 0.022072 |
| opencode-go/deepseek-v4.1-flash | enabled | 51 | 14653 | 933431 | 0.101335 |
| opencode-go/deepseek-v4.1-flash | enabled | 3 | 26792 | 261960 | 0.015091 |
| opencode/qwen3.8-max | baseline | 51 | 25873 | 314847 | 0.635357 |
| opencode/qwen3.8-max | baseline | 3 | 254674 | 1722277 | 0.835982 |
| opencode/qwen3.8-max | enabled | 51 | 26972 | 607400 | 0.938966 |
| opencode/qwen3.8-max | enabled | 3 | 118713 | 751185 | 0.451713 |
