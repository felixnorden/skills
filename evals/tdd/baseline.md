# Eval summary: tdd

Generated: 2026-10-06T10:04:13.559Z
Models: opencode-go/deepseek-v4.1-flash
Runs per trigger query: 1

## Trigger results

| Model | Case | Should trigger | Split | Rate | Result |
| --- | --- | --- | --- | --- | --- |
| opencode-go/deepseek-v4.1-flash | Add a feature to the invoice service test-first. | true | train | 1.00 | PASS |
| opencode-go/deepseek-v4.1-flash | Write unit tests for this parser before the implementation. | true | train | 1.00 | PASS |
| opencode-go/deepseek-v4.1-flash | Design the interface for a new notifier by writing tests. | true | train | 1.00 | PASS |
| opencode-go/deepseek-v4.1-flash | Where should the mock boundary be for the payment gateway? | true | train | 1.00 | PASS |
| opencode-go/deepseek-v4.1-flash | This test setup is painful; help me refactor it. | true | train | 1.00 | PASS |
| opencode-go/deepseek-v4.1-flash | I keep writing tests that pass for the wrong reason. | true | train | 1.00 | PASS |
| opencode-go/deepseek-v4.1-flash | How should I structure the arrange section for this service? | true | validation | 1.00 | PASS |
| opencode-go/deepseek-v4.1-flash | Should I mock the clock in this unit test? | true | validation | 1.00 | PASS |
| opencode-go/deepseek-v4.1-flash | Walk me through red green refactor for this change. | true | validation | 1.00 | PASS |
| opencode-go/deepseek-v4.1-flash | Run the existing test suite and fix the failures. | false | train | 0.00 | PASS |
| opencode-go/deepseek-v4.1-flash | Write a Playwright end-to-end test for the login flow. | false | train | 1.00 | FAIL |
| opencode-go/deepseek-v4.1-flash | What is the difference between TDD and BDD? | false | train | 1.00 | FAIL |
| opencode-go/deepseek-v4.1-flash | Set up continuous integration for this repository. | false | train | 0.00 | PASS |
| opencode-go/deepseek-v4.1-flash | Increase the test coverage number for this module. | false | train | 1.00 | FAIL |
| opencode-go/deepseek-v4.1-flash | Write a database migration for the new column. | false | validation | 0.00 | PASS |
| opencode-go/deepseek-v4.1-flash | Fix this flaky integration test against the real database. | false | validation | 1.00 | FAIL |

12 of 16 trigger cases pass.

## Output results

Outputs captured and ungraded. Add grading.json to score assertions.
- which-double / opencode-go/deepseek-v4.1-flash / baseline
- five-mocks / opencode-go/deepseek-v4.1-flash / enabled
- five-mocks / opencode-go/deepseek-v4.1-flash / baseline
- which-double / opencode-go/deepseek-v4.1-flash / enabled
- order-tax / opencode-go/deepseek-v4.1-flash / enabled
- order-tax / opencode-go/deepseek-v4.1-flash / baseline

## Cost per arm

| Model | Arm | Runs | Avg time (ms) | Tokens | Est. cost (USD) |
| --- | --- | --- | --- | --- | --- |
| opencode-go/deepseek-v4.1-flash | baseline | 16 | 18640 | 159403 | 0.026030 |
| opencode-go/deepseek-v4.1-flash | baseline | 3 | 28698 | 191351 | 0.010733 |
| opencode-go/deepseek-v4.1-flash | enabled | 16 | 21425 | 287524 | 0.036374 |
| opencode-go/deepseek-v4.1-flash | enabled | 3 | 24487 | 144378 | 0.010108 |
