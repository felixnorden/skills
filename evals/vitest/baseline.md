# Eval summary: vitest

Generated: 2026-11-23T17:05:58.355Z
Models: opencode-go/deepseek-v4.1-flash
Runs per trigger query: 3

## Trigger results

| Model | Case | Should trigger | Split | Rate | Result |
| --- | --- | --- | --- | --- | --- |
| opencode-go/deepseek-v4.1-flash | A test passes locally but fails in CI and nothing changed. | true | train | 1.00 | PASS |
| opencode-go/deepseek-v4.1-flash | The suite only fails when every test runs together. | true | train | 1.00 | PASS |
| opencode-go/deepseek-v4.1-flash | A mock stops recording calls after the first test in the file. | true | train | 1.00 | PASS |
| opencode-go/deepseek-v4.1-flash | I need to run one test file in one project without editing the config. | true | train | 1.00 | PASS |
| opencode-go/deepseek-v4.1-flash | The config file is ignored and the wrong projects run. | true | train | 1.00 | PASS |
| opencode-go/deepseek-v4.1-flash | Fake timers stop moving, and an async assertion is never awaited. | true | train | 1.00 | PASS |
| opencode-go/deepseek-v4.1-flash | Snapshots churn after we upgraded from Jest, and some are obsolete. | true | validation | 1.00 | PASS |
| opencode-go/deepseek-v4.1-flash | Coverage thresholds fail even though every test passes. | true | validation | 1.00 | PASS |
| opencode-go/deepseek-v4.1-flash | The suite takes twenty minutes, and one benchmark result looks wrong. | true | validation | 1.00 | PASS |
| opencode-go/deepseek-v4.1-flash | A browser test stopped finding the element it used to match. | true | validation | 1.00 | PASS |
| opencode-go/deepseek-v4.1-flash | Where should the double boundary sit when a function talks to a database: mock the repository or fake it? | false | train | 0.00 | PASS |
| opencode-go/deepseek-v4.1-flash | Should I choose a stub or a spy for the payments client in this unit? | false | train | 0.33 | PASS |
| opencode-go/deepseek-v4.1-flash | Write a Playwright end-to-end test that logs in and checks the dashboard heading. | false | train | 0.33 | PASS |
| opencode-go/deepseek-v4.1-flash | How do we raise the coverage number so the dashboard looks better? | false | train | 1.00 | FAIL |
| opencode-go/deepseek-v4.1-flash | Add a GitHub Actions workflow that builds and publishes the package. | false | train | 0.00 | PASS |
| opencode-go/deepseek-v4.1-flash | Configure Jest to collect coverage for a Node package. | false | train | 0.00 | PASS |
| opencode-go/deepseek-v4.1-flash | Fix the Vite build so it emits sourcemaps for a production bundle. | false | validation | 0.00 | PASS |
| opencode-go/deepseek-v4.1-flash | Write a pytest fixture that returns a database connection. | false | validation | 0.00 | PASS |
| opencode-go/deepseek-v4.1-flash | Resolve this TypeScript error about a missing property on an interface. | false | validation | 0.33 | PASS |
| opencode-go/deepseek-v4.1-flash | Explain the theory behind test doubles and when isolation hides a real bug. | false | validation | 0.00 | PASS |

19 of 20 trigger cases pass.

## Output results

No output cases.

## Cost per arm

| Model | Arm | Runs | Avg time (ms) | Tokens | Est. cost (USD) |
| --- | --- | --- | --- | --- | --- |
| opencode-go/deepseek-v4.1-flash | baseline | 60 | 23615 | 361291 | 0.058890 |
| opencode-go/deepseek-v4.1-flash | enabled | 60 | 31942 | 882544 | 0.094398 |

## Pre-tuning note

This is the unmodified summary of the first trigger run on the fast tier at three
runs. Ten of ten positive cases passed. One negative case failed 3/3: "How do we
raise the coverage number so the dashboard looks better?" That query is answerable
from the coverage reference, whose own section states that coverage is not a
quality goal, so it was not a true near-miss. With operator approval the case was
reworded to "How do we make the quality dashboard look better for management?",
which keeps the quality-goal near-miss and carries no coverage vocabulary. The
shipped description was not changed.

## Variance note

A second and third trigger run with the same shipped description scored 18/20.
The failures were different each time, and every one was a near-miss negative the
model read the router for and then declined: `Write a Playwright end-to-end test`
scored 0/3, then 2/3; `Configure Jest to collect coverage` scored 3/3, then 0/3.
Trigger detection counts a read of the reference file, so a model checking
whether the skill applies registers as a hit. Negatives close to the domain sit
on the 0.5 threshold and flip between samples. Positive cases scored 10/10 in
every run. Two near-miss cases were reworded with operator approval; the
variance persisted on other cases.

## Final set

Three rounds of rewording then went through the operator, each reworded in place
and each recorded in `notes.md`. The shipped set keeps three double-family
negatives; one of them was never reworded. The measured result of the shipped set
is in `summary.md` (36 of 40, with 10 of 10 positives on both models), and the
reason the gate is stated at that value is in `notes.md`.
