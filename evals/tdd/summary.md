# Eval summary: tdd

Generated: 2026-10-06T23:43:24.493Z
Models: opencode/qwen3.8-max, opencode-go/deepseek-v4.1-flash
Runs per trigger query: 3

## Trigger results

| Model | Case | Should trigger | Split | Rate | Result |
| --- | --- | --- | --- | --- | --- |
| opencode/qwen3.8-max | Add a feature to the invoice service test-first. | true | train | 1.00 | PASS |
| opencode/qwen3.8-max | Write unit tests for this parser before the implementation. | true | train | 1.00 | PASS |
| opencode/qwen3.8-max | Design the interface for a new notifier by writing tests. | true | train | 1.00 | PASS |
| opencode/qwen3.8-max | Where should the mock boundary be for the payment gateway? | true | train | 1.00 | PASS |
| opencode/qwen3.8-max | This test setup is painful; help me refactor it. | true | train | 1.00 | PASS |
| opencode/qwen3.8-max | I keep writing tests that pass for the wrong reason. | true | train | 1.00 | PASS |
| opencode/qwen3.8-max | How should I structure the arrange section for this service? | true | validation | 1.00 | PASS |
| opencode/qwen3.8-max | Should I mock the clock in this unit test? | true | validation | 1.00 | PASS |
| opencode/qwen3.8-max | Walk me through red green refactor for this change. | true | validation | 1.00 | PASS |
| opencode/qwen3.8-max | Run the existing test suite and fix the failures. | false | train | 0.00 | PASS |
| opencode/qwen3.8-max | Write a Playwright end-to-end test for the login flow. | false | train | 0.00 | PASS |
| opencode/qwen3.8-max | What is the difference between TDD and BDD? | false | train | 0.00 | PASS |
| opencode/qwen3.8-max | Set up continuous integration for this repository. | false | train | 0.00 | PASS |
| opencode/qwen3.8-max | Increase the test coverage number for this module. | false | train | 0.00 | PASS |
| opencode/qwen3.8-max | Write a database migration for the new column. | false | validation | 0.00 | PASS |
| opencode/qwen3.8-max | Fix this flaky integration test against the real database. | false | validation | 0.00 | PASS |
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
| opencode-go/deepseek-v4.1-flash | Write a Playwright end-to-end test for the login flow. | false | train | 0.00 | PASS |
| opencode-go/deepseek-v4.1-flash | What is the difference between TDD and BDD? | false | train | 0.00 | PASS |
| opencode-go/deepseek-v4.1-flash | Set up continuous integration for this repository. | false | train | 0.00 | PASS |
| opencode-go/deepseek-v4.1-flash | Increase the test coverage number for this module. | false | train | 0.33 | PASS |
| opencode-go/deepseek-v4.1-flash | Write a database migration for the new column. | false | validation | 0.00 | PASS |
| opencode-go/deepseek-v4.1-flash | Fix this flaky integration test against the real database. | false | validation | 0.33 | PASS |

32 of 32 trigger cases pass.

## Output results

### order-tax
- PASS: The test fails first for a behavioral reason, not a compile error or a harness error.
  - evidence: 'Expected red reason: Order.calculateTotal is not implemented ... This is the missing-behavior failure, not a harness fault.'
- PASS: The test uses Arrange, Act, Assert.
  - evidence: 'Asserts calculateTotal() returns 120.00: one behavior, Arrange/Act/Assert.'
- PASS: No internal class is mocked; only a boundary collaborator is doubled.
  - evidence: 'Stubs PricingService at the boundary so the price is fixed at 100.00.'

### five-mocks
- PASS: The answer names a design signal, such as too many responsibilities or the wrong boundary.
  - evidence: 'The class has too many responsibilities.'
- PASS: The answer names the dependency-structure signal and a design remedy, such as decompose the class or move the boundary.
  - evidence: 'Decompose the class.' and 'Push the boundary out.'

### which-double
- PASS: The answer injects a clock abstraction at a boundary.
  - evidence: 'Define a Clock interface (one method, now()), inject it, and in tests pass the double.'
- PASS: The answer does not mock a domain entity.
  - evidence: 'Never a mock' and 'Avoid patching global time.'

7 of 7 assertions pass.

## Cost per arm

| Model | Arm | Runs | Avg time (ms) | Tokens | Est. cost (USD) |
| --- | --- | --- | --- | --- | --- |
| opencode-go/deepseek-v4.1-flash | baseline | 48 | 16426 | 928682 | 0.093977 |
| opencode-go/deepseek-v4.1-flash | baseline | 3 | 16324 | 149978 | 0.010295 |
| opencode-go/deepseek-v4.1-flash | enabled | 48 | 15250 | 682358 | 0.088105 |
| opencode-go/deepseek-v4.1-flash | enabled | 3 | 17737 | 148220 | 0.011697 |
| opencode/qwen3.8-max | baseline | 48 | 28271 | 357367 | 0.726501 |
| opencode/qwen3.8-max | baseline | 3 | 34718 | 242877 | 0.192806 |
| opencode/qwen3.8-max | enabled | 48 | 30511 | 632768 | 1.062124 |
| opencode/qwen3.8-max | enabled | 3 | 45095 | 403473 | 0.274271 |
