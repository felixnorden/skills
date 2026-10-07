# Eval summary: solidity-development

Generated: 2026-10-06T17:34:24.712Z
Models: opencode-go/deepseek-v4.1-flash
Runs per trigger query: 3

## Trigger results

| Model | Case | Should trigger | Split | Rate | Result |
| --- | --- | --- | --- | --- | --- |
| opencode-go/deepseek-v4.1-flash | Review this Solidity contract for security issues. | true | train | 1.00 | PASS |
| opencode-go/deepseek-v4.1-flash | Add reentrancy protection to my withdrawal function. | true | train | 1.00 | PASS |
| opencode-go/deepseek-v4.1-flash | Should I use OpenZeppelin or Solady here? | true | train | 1.00 | PASS |
| opencode-go/deepseek-v4.1-flash | Make my ERC-20 upgradeable. | true | train | 1.00 | PASS |
| opencode-go/deepseek-v4.1-flash | Write NatSpec for this public function. | true | train | 1.00 | PASS |
| opencode-go/deepseek-v4.1-flash | How do I optimize gas in this loop? | true | train | 0.67 | PASS |
| opencode-go/deepseek-v4.1-flash | Audit the access control on this contract. | true | train | 1.00 | PASS |
| opencode-go/deepseek-v4.1-flash | Convert these require strings to custom errors. | true | validation | 1.00 | PASS |
| opencode-go/deepseek-v4.1-flash | Explain the checks-effects-interactions pattern. | true | validation | 1.00 | PASS |
| opencode-go/deepseek-v4.1-flash | Write a React component for the dashboard. | false | train | 0.00 | PASS |
| opencode-go/deepseek-v4.1-flash | Explain how TCP handshakes work. | false | train | 0.00 | PASS |
| opencode-go/deepseek-v4.1-flash | Set up a Postgres database. | false | train | 0.33 | PASS |
| opencode-go/deepseek-v4.1-flash | Write a Python script to parse a CSV. | false | train | 0.00 | PASS |
| opencode-go/deepseek-v4.1-flash | Fix this CSS layout. | false | train | 0.33 | PASS |
| opencode-go/deepseek-v4.1-flash | Explain Kubernetes pod autoscaling. | false | validation | 0.00 | PASS |
| opencode-go/deepseek-v4.1-flash | Write a Rust CLI tool. | false | validation | 0.00 | PASS |
| opencode-go/deepseek-v4.1-flash | Draft a marketing email. | false | validation | 0.00 | PASS |

17 of 17 trigger cases pass.

## Output results

Outputs captured and ungraded. Add grading.json to score assertions.
- natspec / opencode-go/deepseek-v4.1-flash / enabled
- reentrancy-fix / opencode-go/deepseek-v4.1-flash / baseline
- library-choice / opencode-go/deepseek-v4.1-flash / enabled
- library-choice / opencode-go/deepseek-v4.1-flash / baseline
- natspec / opencode-go/deepseek-v4.1-flash / baseline
- reentrancy-fix / opencode-go/deepseek-v4.1-flash / enabled

## Cost per arm

| Model | Arm | Runs | Avg time (ms) | Tokens | Est. cost (USD) |
| --- | --- | --- | --- | --- | --- |
| opencode-go/deepseek-v4.1-flash | baseline | 51 | 12624 | 339731 | 0.059998 |
| opencode-go/deepseek-v4.1-flash | baseline | 3 | 21552 | 173813 | 0.013511 |
| opencode-go/deepseek-v4.1-flash | enabled | 51 | 18377 | 1146307 | 0.118042 |
| opencode-go/deepseek-v4.1-flash | enabled | 3 | 21435 | 223929 | 0.011229 |
