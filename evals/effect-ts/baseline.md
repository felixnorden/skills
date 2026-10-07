# Eval summary: effect-ts

Generated: 2026-10-06T18:03:28.889Z
Models: opencode-go/deepseek-v4.1-flash
Runs per trigger query: 3

## Trigger results

| Model | Case | Should trigger | Split | Rate | Result |
| --- | --- | --- | --- | --- | --- |
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
| opencode-go/deepseek-v4.1-flash | Explain how TCP works. | false | train | 0.00 | PASS |
| opencode-go/deepseek-v4.1-flash | Write a Python script to parse a CSV. | false | train | 0.00 | PASS |
| opencode-go/deepseek-v4.1-flash | Set up a Postgres database. | false | train | 0.67 | FAIL |
| opencode-go/deepseek-v4.1-flash | Explain Kubernetes autoscaling. | false | validation | 0.00 | PASS |
| opencode-go/deepseek-v4.1-flash | Write a Rust CLI tool. | false | validation | 0.00 | PASS |
| opencode-go/deepseek-v4.1-flash | Draft a marketing email. | false | validation | 0.00 | PASS |

15 of 17 trigger cases pass.

## Output results

Outputs captured and ungraded. Add grading.json to score assertions.
- catch-tags / opencode-go/deepseek-v4.1-flash / enabled
- catch-tags / opencode-go/deepseek-v4.1-flash / baseline
- new-service / opencode-go/deepseek-v4.1-flash / enabled
- test-service / opencode-go/deepseek-v4.1-flash / enabled
- new-service / opencode-go/deepseek-v4.1-flash / baseline
- test-service / opencode-go/deepseek-v4.1-flash / baseline

## Cost per arm

| Model | Arm | Runs | Avg time (ms) | Tokens | Est. cost (USD) |
| --- | --- | --- | --- | --- | --- |
| opencode-go/deepseek-v4.1-flash | baseline | 51 | 26379 | 1679399 | 0.111275 |
| opencode-go/deepseek-v4.1-flash | baseline | 3 | 111452 | 1217582 | 0.032841 |
| opencode-go/deepseek-v4.1-flash | enabled | 51 | 17527 | 1021372 | 0.103807 |
| opencode-go/deepseek-v4.1-flash | enabled | 3 | 34665 | 244449 | 0.014510 |
