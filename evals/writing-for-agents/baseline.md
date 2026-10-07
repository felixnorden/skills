# Eval summary: writing-for-agents

Generated: 2026-10-06T09:45:04.732Z
Models: opencode-go/deepseek-v4.1-flash
Runs per trigger query: 1

## Trigger results

| Model | Case | Should trigger | Split | Rate | Result |
| --- | --- | --- | --- | --- | --- |
| opencode-go/deepseek-v4.1-flash | Write the README for this CLI tool. | true | train | 1.00 | PASS |
| opencode-go/deepseek-v4.1-flash | Draft a PRD for the billing feature. | true | train | 1.00 | PASS |
| opencode-go/deepseek-v4.1-flash | Turn these meeting notes into a design doc. | true | train | 0.00 | FAIL |
| opencode-go/deepseek-v4.1-flash | Rewrite the tool descriptions for our MCP server. | true | train | 1.00 | PASS |
| opencode-go/deepseek-v4.1-flash | Add a changelog entry for v2.1. | true | train | 1.00 | PASS |
| opencode-go/deepseek-v4.1-flash | Clean up the wording in this API reference. | true | train | 1.00 | PASS |
| opencode-go/deepseek-v4.1-flash | Write a handoff note for the next agent that picks this up. | true | validation | 1.00 | PASS |
| opencode-go/deepseek-v4.1-flash | Tighten the prompt in this skill file. | true | validation | 1.00 | PASS |
| opencode-go/deepseek-v4.1-flash | Make this spec read more clearly for the next agent. | true | validation | 1.00 | PASS |
| opencode-go/deepseek-v4.1-flash | Polish the wording of our contribution guide. | true | validation | 0.00 | FAIL |
| opencode-go/deepseek-v4.1-flash | Give me a quick summary of this repository. | false | train | 1.00 | FAIL |
| opencode-go/deepseek-v4.1-flash | Write a launch tweet announcing the release. | false | train | 0.00 | PASS |
| opencode-go/deepseek-v4.1-flash | Fix the grammar in my personal essay. | false | train | 0.00 | PASS |
| opencode-go/deepseek-v4.1-flash | Explain what Simplified Technical English means. | false | train | 0.00 | PASS |
| opencode-go/deepseek-v4.1-flash | Summarize this pull request for me. | false | train | 0.00 | PASS |
| opencode-go/deepseek-v4.1-flash | Write a short story about a robot. | false | validation | 0.00 | PASS |
| opencode-go/deepseek-v4.1-flash | Draft a reply to this customer email. | false | validation | 0.00 | PASS |
| opencode-go/deepseek-v4.1-flash | Translate this README into French. | false | validation | 0.00 | PASS |

15 of 18 trigger cases pass.

## Output results

Outputs captured and ungraded. Add grading.json to score assertions.
- slop-paragraph / opencode-go/deepseek-v4.1-flash / baseline
- install-section / opencode-go/deepseek-v4.1-flash / baseline
- install-section / opencode-go/deepseek-v4.1-flash / enabled
- term-consistency / opencode-go/deepseek-v4.1-flash / baseline
- slop-paragraph / opencode-go/deepseek-v4.1-flash / enabled
- term-consistency / opencode-go/deepseek-v4.1-flash / enabled

## Cost per arm

| Model | Arm | Runs | Avg time (ms) | Tokens | Est. cost (USD) |
| --- | --- | --- | --- | --- | --- |
| opencode-go/deepseek-v4.1-flash | baseline | 18 | 53790 | 1240972 | 0.071038 |
| opencode-go/deepseek-v4.1-flash | baseline | 3 | 9822 | 49269 | 0.006724 |
| opencode-go/deepseek-v4.1-flash | enabled | 18 | 30370 | 503754 | 0.048099 |
| opencode-go/deepseek-v4.1-flash | enabled | 3 | 15548 | 121933 | 0.007763 |
