# Eval summary: writing-for-agents

Generated: 2026-10-07T00:15:30.770Z
Models: opencode/qwen3.8-max, opencode-go/deepseek-v4.1-flash
Runs per trigger query: 3

## Trigger results

| Model | Case | Should trigger | Split | Rate | Result |
| --- | --- | --- | --- | --- | --- |
| opencode/qwen3.8-max | Write the README for this CLI tool. | true | train | 0.67 | PASS |
| opencode/qwen3.8-max | Draft a PRD for the billing feature. | true | train | 1.00 | PASS |
| opencode/qwen3.8-max | Turn these meeting notes into a design doc. | true | train | 0.33 | FAIL |
| opencode/qwen3.8-max | Rewrite the tool descriptions for our MCP server. | true | train | 0.67 | PASS |
| opencode/qwen3.8-max | Add a changelog entry for v2.1. | true | train | 1.00 | PASS |
| opencode/qwen3.8-max | Clean up the wording in this API reference. | true | train | 1.00 | PASS |
| opencode/qwen3.8-max | Write a handoff note for the next agent that picks this up. | true | validation | 1.00 | PASS |
| opencode/qwen3.8-max | Tighten the prompt in this skill file. | true | validation | 1.00 | PASS |
| opencode/qwen3.8-max | Make this spec read more clearly for the next agent. | true | validation | 1.00 | PASS |
| opencode/qwen3.8-max | Polish the wording of our contribution guide. | true | validation | 1.00 | PASS |
| opencode/qwen3.8-max | Give me a quick summary of this repository. | false | train | 0.00 | PASS |
| opencode/qwen3.8-max | Write a launch tweet announcing the release. | false | train | 0.33 | PASS |
| opencode/qwen3.8-max | Fix the grammar in my personal essay. | false | train | 0.00 | PASS |
| opencode/qwen3.8-max | Explain what Simplified Technical English means. | false | train | 0.33 | PASS |
| opencode/qwen3.8-max | Summarize this pull request for me. | false | train | 0.00 | PASS |
| opencode/qwen3.8-max | Write a short story about a robot. | false | validation | 0.00 | PASS |
| opencode/qwen3.8-max | Draft a reply to this customer email. | false | validation | 0.00 | PASS |
| opencode/qwen3.8-max | Translate this README into French. | false | validation | 0.00 | PASS |
| opencode-go/deepseek-v4.1-flash | Write the README for this CLI tool. | true | train | 1.00 | PASS |
| opencode-go/deepseek-v4.1-flash | Draft a PRD for the billing feature. | true | train | 1.00 | PASS |
| opencode-go/deepseek-v4.1-flash | Turn these meeting notes into a design doc. | true | train | 0.67 | PASS |
| opencode-go/deepseek-v4.1-flash | Rewrite the tool descriptions for our MCP server. | true | train | 1.00 | PASS |
| opencode-go/deepseek-v4.1-flash | Add a changelog entry for v2.1. | true | train | 1.00 | PASS |
| opencode-go/deepseek-v4.1-flash | Clean up the wording in this API reference. | true | train | 1.00 | PASS |
| opencode-go/deepseek-v4.1-flash | Write a handoff note for the next agent that picks this up. | true | validation | 1.00 | PASS |
| opencode-go/deepseek-v4.1-flash | Tighten the prompt in this skill file. | true | validation | 1.00 | PASS |
| opencode-go/deepseek-v4.1-flash | Make this spec read more clearly for the next agent. | true | validation | 1.00 | PASS |
| opencode-go/deepseek-v4.1-flash | Polish the wording of our contribution guide. | true | validation | 0.67 | PASS |
| opencode-go/deepseek-v4.1-flash | Give me a quick summary of this repository. | false | train | 0.00 | PASS |
| opencode-go/deepseek-v4.1-flash | Write a launch tweet announcing the release. | false | train | 0.33 | PASS |
| opencode-go/deepseek-v4.1-flash | Fix the grammar in my personal essay. | false | train | 0.00 | PASS |
| opencode-go/deepseek-v4.1-flash | Explain what Simplified Technical English means. | false | train | 0.00 | PASS |
| opencode-go/deepseek-v4.1-flash | Summarize this pull request for me. | false | train | 0.00 | PASS |
| opencode-go/deepseek-v4.1-flash | Write a short story about a robot. | false | validation | 0.00 | PASS |
| opencode-go/deepseek-v4.1-flash | Draft a reply to this customer email. | false | validation | 0.33 | PASS |
| opencode-go/deepseek-v4.1-flash | Translate this README into French. | false | validation | 0.33 | PASS |

35 of 36 trigger cases pass.

## Output results

### slop-paragraph
- PASS: No superlative or intensifier remains (extremely, cutting-edge, seamless).
  - evidence: The produced rewrite is 'The system processes [N] records per second. It retries a failed write [N] times and recovers within [N] seconds. It scales to [N] nodes.' The three words appear only inside quoted defects.
- PASS: No metaphor noun remains (leverages).
  - evidence: The rewrite names the action directly. 'leverages' appears only in the list of defects to remove.
- PASS: The result replaces each quality claim with a measure or an explicit slot, and invents no fact.
  - evidence: 'processes [N] records per second' and 'It retries a failed write [N] times'. The output refuses to invent a number.

### install-section
- PASS: Every sentence is 20 words or fewer.
  - evidence: The longest sentence is 'The -g flag installs acme globally, so the acme command runs from any directory.' (15 words).
- PASS: Instructions use the imperative mood.
  - evidence: 'Install the acme CLI with npm:' and 'Install npm before you run the command.'
- PASS: The install command is present.
  - evidence: The fenced block contains `npm install -g acme`.

### term-consistency
- PASS: One term is used for one concept throughout.
  - evidence: Case 1 keeps 'request' and drops 'query', 'invocation', and 'caller'.
- PASS: No synonym cycling remains (request, call, invocation, query).
  - evidence: Case 1: 'The client sends a request to the service. The service handles the request.'

8 of 8 assertions pass.

## Cost per arm

| Model | Arm | Runs | Avg time (ms) | Tokens | Est. cost (USD) |
| --- | --- | --- | --- | --- | --- |
| opencode-go/deepseek-v4.1-flash | baseline | 54 | 22780 | 3170765 | 0.170974 |
| opencode-go/deepseek-v4.1-flash | baseline | 3 | 10379 | 64022 | 0.007749 |
| opencode-go/deepseek-v4.1-flash | enabled | 54 | 16870 | 1056103 | 0.128273 |
| opencode-go/deepseek-v4.1-flash | enabled | 3 | 18157 | 121500 | 0.010877 |
| opencode/qwen3.8-max | baseline | 54 | 19122 | 375157 | 0.640463 |
| opencode/qwen3.8-max | baseline | 3 | 26380 | 127178 | 0.104842 |
| opencode/qwen3.8-max | enabled | 54 | 20582 | 577698 | 0.911776 |
| opencode/qwen3.8-max | enabled | 3 | 66472 | 380200 | 0.232337 |
