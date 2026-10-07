# Eval summary: foundry-forge

Generated: 2026-10-06T12:25:27.006Z
Models: opencode-go/deepseek-v4.1-flash
Runs per trigger query: 3

## Trigger results

| Model | Case | Should trigger | Split | Rate | Result |
| --- | --- | --- | --- | --- | --- |
| opencode-go/deepseek-v4.1-flash | Write a Forge test for my ERC-20 contract. | true | train | 1.00 | PASS |
| opencode-go/deepseek-v4.1-flash | How do I prank a caller in a Foundry test? | true | train | 1.00 | PASS |
| opencode-go/deepseek-v4.1-flash | Set up fuzz testing with a fixed seed. | true | train | 1.00 | PASS |
| opencode-go/deepseek-v4.1-flash | Write an invariant test with a handler contract. | true | train | 1.00 | PASS |
| opencode-go/deepseek-v4.1-flash | Deploy this contract with forge script and verify it on Etherscan. | true | train | 1.00 | PASS |
| opencode-go/deepseek-v4.1-flash | Why does my forge test revert with panic(0x11)? | true | train | 1.00 | PASS |
| opencode-go/deepseek-v4.1-flash | Generate a gas snapshot and check it in CI. | true | train | 1.00 | PASS |
| opencode-go/deepseek-v4.1-flash | How do I use StdStorage to set a mapping value? | true | validation | 1.00 | PASS |
| opencode-go/deepseek-v4.1-flash | Add a CREATE2 deployment to my forge script. | true | validation | 1.00 | PASS |
| opencode-go/deepseek-v4.1-flash | Write a React component for the dashboard. | false | train | 0.00 | PASS |
| opencode-go/deepseek-v4.1-flash | Explain how the EVM gas model works. | false | train | 0.67 | FAIL |
| opencode-go/deepseek-v4.1-flash | Set up a CI pipeline with GitHub Actions. | false | train | 1.00 | FAIL |
| opencode-go/deepseek-v4.1-flash | Write a Hardhat deployment script. | false | train | 1.00 | FAIL |
| opencode-go/deepseek-v4.1-flash | Optimize this SQL query. | false | train | 0.00 | PASS |
| opencode-go/deepseek-v4.1-flash | Write a Rust unit test. | false | validation | 0.00 | PASS |
| opencode-go/deepseek-v4.1-flash | Explain EIP-1559. | false | validation | 0.00 | PASS |
| opencode-go/deepseek-v4.1-flash | Format my JSON config. | false | validation | 0.00 | PASS |

14 of 17 trigger cases pass.

## Output results

Outputs captured and ungraded. Add grading.json to score assertions.
- panic-0x11 / opencode-go/deepseek-v4.1-flash / enabled
- deploy-and-verify / opencode-go/deepseek-v4.1-flash / baseline
- panic-0x11 / opencode-go/deepseek-v4.1-flash / baseline
- deploy-and-verify / opencode-go/deepseek-v4.1-flash / enabled
- erc20-test-suite / opencode-go/deepseek-v4.1-flash / baseline
- erc20-test-suite / opencode-go/deepseek-v4.1-flash / enabled

## Cost per arm

| Model | Arm | Runs | Avg time (ms) | Tokens | Est. cost (USD) |
| --- | --- | --- | --- | --- | --- |
| opencode-go/deepseek-v4.1-flash | baseline | 51 | 25322 | 2384193 | 0.140003 |
| opencode-go/deepseek-v4.1-flash | baseline | 3 | 30596 | 282162 | 0.012484 |
| opencode-go/deepseek-v4.1-flash | enabled | 51 | 16107 | 789345 | 0.092621 |
| opencode-go/deepseek-v4.1-flash | enabled | 3 | 34687 | 403143 | 0.018068 |
