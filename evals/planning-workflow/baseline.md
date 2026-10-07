# Eval summary: planning-workflow

Generated: 2026-10-06T10:50:28.937Z
Models: opencode-go/deepseek-v4.1-flash
Runs per trigger query: 1

## Trigger results

| Model | Case | Should trigger | Split | Rate | Result |
| --- | --- | --- | --- | --- | --- |
| opencode-go/deepseek-v4.1-flash | I want to plan a new feature before writing any code. | true | train | 1.00 | PASS |
| opencode-go/deepseek-v4.1-flash | Help me design the solution for our sync engine. | true | train | 1.00 | PASS |
| opencode-go/deepseek-v4.1-flash | Produce a phased plan I can hand to a build agent. | true | train | 1.00 | PASS |
| opencode-go/deepseek-v4.1-flash | Split this work into vertical slices. | true | train | 1.00 | PASS |
| opencode-go/deepseek-v4.1-flash | Run a QRSPI session for this refactor. | true | train | 1.00 | PASS |
| opencode-go/deepseek-v4.1-flash | Write a design concept for the new auth model. | true | train | 1.00 | PASS |
| opencode-go/deepseek-v4.1-flash | I need a structure outline before planning the implementation. | true | train | 1.00 | PASS |
| opencode-go/deepseek-v4.1-flash | What should the research document cover for this change? | true | validation | 1.00 | PASS |
| opencode-go/deepseek-v4.1-flash | Turn this approved design into an implementation plan. | true | validation | 1.00 | PASS |
| opencode-go/deepseek-v4.1-flash | Implement the login feature now. | false | train | 1.00 | FAIL |
| opencode-go/deepseek-v4.1-flash | Fix the failing test in the payment service. | false | train | 0.00 | PASS |
| opencode-go/deepseek-v4.1-flash | Write unit tests for this parser. | false | train | 0.00 | PASS |
| opencode-go/deepseek-v4.1-flash | Review my pull request. | false | train | 0.00 | PASS |
| opencode-go/deepseek-v4.1-flash | Estimate how long this feature will take. | false | train | 1.00 | FAIL |
| opencode-go/deepseek-v4.1-flash | Deploy the current build to staging. | false | validation | 0.00 | PASS |
| opencode-go/deepseek-v4.1-flash | Summarize the architecture document for me. | false | validation | 0.00 | PASS |

14 of 16 trigger cases pass.

## Output results

Outputs captured and ungraded. Add grading.json to score assertions.
- layer-vs-slice / opencode-go/deepseek-v4.1-flash / enabled
- layer-vs-slice / opencode-go/deepseek-v4.1-flash / baseline
- test-first-section / opencode-go/deepseek-v4.1-flash / enabled
- no-design-in-plan / opencode-go/deepseek-v4.1-flash / baseline
- test-first-section / opencode-go/deepseek-v4.1-flash / baseline
- no-design-in-plan / opencode-go/deepseek-v4.1-flash / enabled

## Cost per arm

| Model | Arm | Runs | Avg time (ms) | Tokens | Est. cost (USD) |
| --- | --- | --- | --- | --- | --- |
| opencode-go/deepseek-v4.1-flash | baseline | 16 | 19440 | 341202 | 0.031577 |
| opencode-go/deepseek-v4.1-flash | baseline | 3 | 34293 | 341171 | 0.016732 |
| opencode-go/deepseek-v4.1-flash | enabled | 16 | 22495 | 386567 | 0.039252 |
| opencode-go/deepseek-v4.1-flash | enabled | 3 | 44511 | 406937 | 0.018890 |
