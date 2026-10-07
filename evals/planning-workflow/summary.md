# Eval summary: planning-workflow

Generated: 2026-10-06T23:06:18.314Z
Models: opencode/qwen3.8-max, opencode-go/deepseek-v4.1-flash
Runs per trigger query: 3

## Trigger results

| Model | Case | Should trigger | Split | Rate | Result |
| --- | --- | --- | --- | --- | --- |
| opencode/qwen3.8-max | I want to plan a new feature before writing any code. | true | train | 1.00 | PASS |
| opencode/qwen3.8-max | Help me design the solution for our sync engine. | true | train | 1.00 | PASS |
| opencode/qwen3.8-max | Produce a phased plan I can hand to a build agent. | true | train | 1.00 | PASS |
| opencode/qwen3.8-max | Split this work into vertical slices. | true | train | 1.00 | PASS |
| opencode/qwen3.8-max | Run a QRSPI session for this refactor. | true | train | 1.00 | PASS |
| opencode/qwen3.8-max | Write a design concept for the new auth model. | true | train | 1.00 | PASS |
| opencode/qwen3.8-max | I need a structure outline before planning the implementation. | true | train | 1.00 | PASS |
| opencode/qwen3.8-max | What should the research document cover for this change? | true | validation | 1.00 | PASS |
| opencode/qwen3.8-max | Turn this approved design into an implementation plan. | true | validation | 1.00 | PASS |
| opencode/qwen3.8-max | Implement the login feature now. | false | train | 0.00 | PASS |
| opencode/qwen3.8-max | Fix the failing test in the payment service. | false | train | 0.00 | PASS |
| opencode/qwen3.8-max | Write unit tests for this parser. | false | train | 0.00 | PASS |
| opencode/qwen3.8-max | Review my pull request. | false | train | 0.00 | PASS |
| opencode/qwen3.8-max | Rename these variables to match our style guide. | false | train | 0.00 | PASS |
| opencode/qwen3.8-max | Deploy the current build to staging. | false | validation | 0.00 | PASS |
| opencode/qwen3.8-max | Summarize the architecture document for me. | false | validation | 0.00 | PASS |
| opencode-go/deepseek-v4.1-flash | I want to plan a new feature before writing any code. | true | train | 1.00 | PASS |
| opencode-go/deepseek-v4.1-flash | Help me design the solution for our sync engine. | true | train | 1.00 | PASS |
| opencode-go/deepseek-v4.1-flash | Produce a phased plan I can hand to a build agent. | true | train | 1.00 | PASS |
| opencode-go/deepseek-v4.1-flash | Split this work into vertical slices. | true | train | 1.00 | PASS |
| opencode-go/deepseek-v4.1-flash | Run a QRSPI session for this refactor. | true | train | 1.00 | PASS |
| opencode-go/deepseek-v4.1-flash | Write a design concept for the new auth model. | true | train | 1.00 | PASS |
| opencode-go/deepseek-v4.1-flash | I need a structure outline before planning the implementation. | true | train | 1.00 | PASS |
| opencode-go/deepseek-v4.1-flash | What should the research document cover for this change? | true | validation | 1.00 | PASS |
| opencode-go/deepseek-v4.1-flash | Turn this approved design into an implementation plan. | true | validation | 1.00 | PASS |
| opencode-go/deepseek-v4.1-flash | Implement the login feature now. | false | train | 0.00 | PASS |
| opencode-go/deepseek-v4.1-flash | Fix the failing test in the payment service. | false | train | 0.00 | PASS |
| opencode-go/deepseek-v4.1-flash | Write unit tests for this parser. | false | train | 0.00 | PASS |
| opencode-go/deepseek-v4.1-flash | Review my pull request. | false | train | 0.33 | PASS |
| opencode-go/deepseek-v4.1-flash | Rename these variables to match our style guide. | false | train | 0.00 | PASS |
| opencode-go/deepseek-v4.1-flash | Deploy the current build to staging. | false | validation | 0.00 | PASS |
| opencode-go/deepseek-v4.1-flash | Summarize the architecture document for me. | false | validation | 0.67 | FAIL |

31 of 32 trigger cases pass.

## Output results

### layer-vs-slice
- PASS: The answer identifies the plan as horizontal, layer-by-layer slicing.
  - evidence: 'the plan is horizontally sliced' and 'The names are layer names, not behavior names.'
- PASS: The answer asks for behavior-level vertical slices instead.
  - evidence: 'Cut vertical slices: one complete, observable behavior, end-to-end.'

### no-design-in-plan
- PASS: The answer keeps the schema choice out of the plan or flags it as a design-phase decision.
  - evidence: 'A database schema choice is a design decision. The plan phase forbids design decisions. So the schema choice went into the design concept's Key Decisions table.'
- PASS: The answer records the schema decision in the design artifact, not in the plan.
  - evidence: 'My schema recommendation (in the design concept)' and 'Slice 3 realizes this schema; it does not re-decide it.'

### test-first-section
- PASS: The answer writes the test before the implementation and states that it fails first.
  - evidence: 'Before writing implementation, Build Agent writes these tests' and 'confirm each test fails on the missing behavior.'
- PASS: The answer points to the tdd skill for the test structure.
  - evidence: 'Skill conventions loaded (planning-workflow, plan.md template, tdd).' Uses the tdd school and double selection.

6 of 6 assertions pass.

## Cost per arm

| Model | Arm | Runs | Avg time (ms) | Tokens | Est. cost (USD) |
| --- | --- | --- | --- | --- | --- |
| opencode-go/deepseek-v4.1-flash | baseline | 48 | 18410 | 1868996 | 0.122355 |
| opencode-go/deepseek-v4.1-flash | baseline | 3 | 37369 | 182991 | 0.012251 |
| opencode-go/deepseek-v4.1-flash | enabled | 48 | 14366 | 945168 | 0.087172 |
| opencode-go/deepseek-v4.1-flash | enabled | 3 | 33113 | 285509 | 0.017947 |
| opencode/qwen3.8-max | baseline | 48 | 22023 | 375228 | 0.649593 |
| opencode/qwen3.8-max | baseline | 3 | 120607 | 612334 | 0.388821 |
| opencode/qwen3.8-max | enabled | 48 | 20190 | 472528 | 0.735480 |
| opencode/qwen3.8-max | enabled | 3 | 176577 | 743528 | 0.592656 |
