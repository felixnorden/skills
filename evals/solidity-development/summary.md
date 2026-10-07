# Eval summary: solidity-development

Generated: 2026-10-06T23:27:51.561Z
Models: opencode/qwen3.8-max, opencode-go/deepseek-v4.1-flash
Runs per trigger query: 3

## Trigger results

| Model | Case | Should trigger | Split | Rate | Result |
| --- | --- | --- | --- | --- | --- |
| opencode/qwen3.8-max | Review this Solidity contract for security issues. | true | train | 1.00 | PASS |
| opencode/qwen3.8-max | Add reentrancy protection to my withdrawal function. | true | train | 1.00 | PASS |
| opencode/qwen3.8-max | Should I use OpenZeppelin or Solady here? | true | train | 1.00 | PASS |
| opencode/qwen3.8-max | Make my ERC-20 upgradeable. | true | train | 1.00 | PASS |
| opencode/qwen3.8-max | Write NatSpec for this public function. | true | train | 1.00 | PASS |
| opencode/qwen3.8-max | How do I optimize gas in this loop? | true | train | 1.00 | PASS |
| opencode/qwen3.8-max | Audit the access control on this contract. | true | train | 1.00 | PASS |
| opencode/qwen3.8-max | Convert these require strings to custom errors. | true | validation | 1.00 | PASS |
| opencode/qwen3.8-max | Explain the checks-effects-interactions pattern. | true | validation | 1.00 | PASS |
| opencode/qwen3.8-max | Write a React component for the dashboard. | false | train | 0.00 | PASS |
| opencode/qwen3.8-max | Explain how TCP handshakes work. | false | train | 0.00 | PASS |
| opencode/qwen3.8-max | Set up a Postgres database. | false | train | 0.00 | PASS |
| opencode/qwen3.8-max | Write a Python script to parse a CSV. | false | train | 0.00 | PASS |
| opencode/qwen3.8-max | Fix this CSS layout. | false | train | 0.00 | PASS |
| opencode/qwen3.8-max | Explain Kubernetes pod autoscaling. | false | validation | 0.00 | PASS |
| opencode/qwen3.8-max | Write a Rust CLI tool. | false | validation | 0.00 | PASS |
| opencode/qwen3.8-max | Draft a marketing email. | false | validation | 0.00 | PASS |
| opencode-go/deepseek-v4.1-flash | Review this Solidity contract for security issues. | true | train | 1.00 | PASS |
| opencode-go/deepseek-v4.1-flash | Add reentrancy protection to my withdrawal function. | true | train | 1.00 | PASS |
| opencode-go/deepseek-v4.1-flash | Should I use OpenZeppelin or Solady here? | true | train | 1.00 | PASS |
| opencode-go/deepseek-v4.1-flash | Make my ERC-20 upgradeable. | true | train | 1.00 | PASS |
| opencode-go/deepseek-v4.1-flash | Write NatSpec for this public function. | true | train | 1.00 | PASS |
| opencode-go/deepseek-v4.1-flash | How do I optimize gas in this loop? | true | train | 1.00 | PASS |
| opencode-go/deepseek-v4.1-flash | Audit the access control on this contract. | true | train | 1.00 | PASS |
| opencode-go/deepseek-v4.1-flash | Convert these require strings to custom errors. | true | validation | 1.00 | PASS |
| opencode-go/deepseek-v4.1-flash | Explain the checks-effects-interactions pattern. | true | validation | 1.00 | PASS |
| opencode-go/deepseek-v4.1-flash | Write a React component for the dashboard. | false | train | 0.33 | PASS |
| opencode-go/deepseek-v4.1-flash | Explain how TCP handshakes work. | false | train | 0.00 | PASS |
| opencode-go/deepseek-v4.1-flash | Set up a Postgres database. | false | train | 0.00 | PASS |
| opencode-go/deepseek-v4.1-flash | Write a Python script to parse a CSV. | false | train | 0.00 | PASS |
| opencode-go/deepseek-v4.1-flash | Fix this CSS layout. | false | train | 0.00 | PASS |
| opencode-go/deepseek-v4.1-flash | Explain Kubernetes pod autoscaling. | false | validation | 0.00 | PASS |
| opencode-go/deepseek-v4.1-flash | Write a Rust CLI tool. | false | validation | 0.00 | PASS |
| opencode-go/deepseek-v4.1-flash | Draft a marketing email. | false | validation | 0.33 | PASS |

34 of 34 trigger cases pass.

## Output results

### reentrancy-fix
- PASS: The answer applies the Checks-Effects-Interactions order, updating state before the external call.
  - evidence: '2. EFFECTS: debit before any external call' placed ahead of '3. INTERACTIONS', with the bug named as a CEI violation.
- PASS: The answer adds a reentrancy guard or explains when CEI alone is sufficient.
  - evidence: 'nonReentrant' on the function and 'Keep CEI as the primary defense. The guard is a second layer, not a replacement.'

### library-choice
- PASS: The answer recommends OpenZeppelin for a high-value protocol.
  - evidence: 'Recommendation: OpenZeppelin' and 'High-value protocols (>$10M TVL) | OpenZeppelin'.
- PASS: The answer gives audits or battle-tested security as the reason.
  - evidence: 'Extensive audits and battle-tested code. Solady optimizes for gas, not for maximum audit coverage.'

### natspec
- PASS: The answer includes the @notice and @dev tags.
  - evidence: '@notice Transfers amount tokens from the caller to to' and '@dev Implements an ERC20 transfer with a pause check'.
- PASS: The answer documents each parameter and the return value.
  - evidence: '@param to', '@param amount', and '@return success True if the transfer succeeded'.

6 of 6 assertions pass.

## Cost per arm

| Model | Arm | Runs | Avg time (ms) | Tokens | Est. cost (USD) |
| --- | --- | --- | --- | --- | --- |
| opencode-go/deepseek-v4.1-flash | baseline | 51 | 18126 | 977204 | 0.095543 |
| opencode-go/deepseek-v4.1-flash | baseline | 3 | 9422 | 38169 | 0.006878 |
| opencode-go/deepseek-v4.1-flash | enabled | 51 | 17478 | 1082977 | 0.117168 |
| opencode-go/deepseek-v4.1-flash | enabled | 3 | 15155 | 167888 | 0.009140 |
| opencode/qwen3.8-max | baseline | 51 | 24197 | 347431 | 0.723086 |
| opencode/qwen3.8-max | baseline | 3 | 78832 | 367972 | 0.302544 |
| opencode/qwen3.8-max | enabled | 51 | 30675 | 798775 | 1.274811 |
| opencode/qwen3.8-max | enabled | 3 | 165129 | 1369495 | 0.672199 |
