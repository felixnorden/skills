# Eval summary: foundry-forge

Generated: 2026-10-06T22:48:31.970Z
Models: opencode/qwen3.8-max, opencode-go/deepseek-v4.1-flash
Runs per trigger query: 3

## Trigger results

| Model | Case | Should trigger | Split | Rate | Result |
| --- | --- | --- | --- | --- | --- |
| opencode/qwen3.8-max | Write a Forge test for my ERC-20 contract. | true | train | 1.00 | PASS |
| opencode/qwen3.8-max | How do I prank a caller in a Foundry test? | true | train | 1.00 | PASS |
| opencode/qwen3.8-max | Set up fuzz testing with a fixed seed. | true | train | 1.00 | PASS |
| opencode/qwen3.8-max | Write an invariant test with a handler contract. | true | train | 1.00 | PASS |
| opencode/qwen3.8-max | Deploy this contract with forge script and verify it on Etherscan. | true | train | 1.00 | PASS |
| opencode/qwen3.8-max | Why does my forge test revert with panic(0x11)? | true | train | 1.00 | PASS |
| opencode/qwen3.8-max | Generate a gas snapshot and check it in CI. | true | train | 1.00 | PASS |
| opencode/qwen3.8-max | How do I use StdStorage to set a mapping value? | true | validation | 1.00 | PASS |
| opencode/qwen3.8-max | Add a CREATE2 deployment to my forge script. | true | validation | 1.00 | PASS |
| opencode/qwen3.8-max | Write a React component for the dashboard. | false | train | 0.00 | PASS |
| opencode/qwen3.8-max | Explain how the EVM gas model works. | false | train | 0.00 | PASS |
| opencode/qwen3.8-max | Set up a CI pipeline with GitHub Actions. | false | train | 0.00 | PASS |
| opencode/qwen3.8-max | Write a Hardhat deployment script. | false | train | 0.00 | PASS |
| opencode/qwen3.8-max | Optimize this SQL query. | false | train | 0.00 | PASS |
| opencode/qwen3.8-max | Write a Rust unit test. | false | validation | 0.00 | PASS |
| opencode/qwen3.8-max | Explain EIP-1559. | false | validation | 0.00 | PASS |
| opencode/qwen3.8-max | Format my JSON config. | false | validation | 0.00 | PASS |
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
| opencode-go/deepseek-v4.1-flash | Explain how the EVM gas model works. | false | train | 0.00 | PASS |
| opencode-go/deepseek-v4.1-flash | Set up a CI pipeline with GitHub Actions. | false | train | 0.67 | FAIL |
| opencode-go/deepseek-v4.1-flash | Write a Hardhat deployment script. | false | train | 0.00 | PASS |
| opencode-go/deepseek-v4.1-flash | Optimize this SQL query. | false | train | 0.00 | PASS |
| opencode-go/deepseek-v4.1-flash | Write a Rust unit test. | false | validation | 0.00 | PASS |
| opencode-go/deepseek-v4.1-flash | Explain EIP-1559. | false | validation | 0.00 | PASS |
| opencode-go/deepseek-v4.1-flash | Format my JSON config. | false | validation | 0.00 | PASS |

33 of 34 trigger cases pass.

## Output results

### erc20-test-suite
- PASS: The answer delivers a Forge test file that covers transfer and approve.
  - evidence: 'test/MinimalERC20.t.sol | 13 tests: unit, fuzz, revert', with unit tests for transfer and for approve.
- PASS: The revert test uses vm.expectRevert.
  - evidence: 'Each uses vm.expectRevert with the exact custom error and arguments.'
- PASS: The fuzz test constrains inputs with bound() or vm.assume().
  - evidence: 'input clamped with bound(), then asserts exact debit/credit' and 'I used bound() instead of vm.assume() for numeric ranges.'

### panic-0x11
- PASS: The answer tells the user to re-run with -vvv or -vvvv to read the trace.
  - evidence: 'forge test --match-test <NAME> -vvv' and 'Use -vvvv if the failure happens in setUp().'
- PASS: The answer names arithmetic overflow or underflow as the cause of panic(0x11).
  - evidence: 'panic code 0x11 = arithmetic overflow or underflow'.
- PASS: The answer suggests bound() for numeric fuzz inputs.
  - evidence: 'Clamp the input with bound()' and 'amount = bound(amount, 1, 1000 ether).'

### deploy-and-verify
- PASS: The answer runs forge script with --broadcast.
  - evidence: 'forge script script/Deploy.s.sol --broadcast --slow --rpc-url $RPC_URL'.
- PASS: The answer includes --verify for Etherscan verification.
  - evidence: '--verify --etherscan-api-key $ETHERSCAN_API_KEY' and the separate forge verify-contract fallback.

8 of 8 assertions pass.

## Cost per arm

| Model | Arm | Runs | Avg time (ms) | Tokens | Est. cost (USD) |
| --- | --- | --- | --- | --- | --- |
| opencode-go/deepseek-v4.1-flash | baseline | 51 | 19341 | 1548379 | 0.121572 |
| opencode-go/deepseek-v4.1-flash | baseline | 3 | 40045 | 412246 | 0.016416 |
| opencode-go/deepseek-v4.1-flash | enabled | 51 | 11598 | 706537 | 0.089190 |
| opencode-go/deepseek-v4.1-flash | enabled | 3 | 58760 | 1253537 | 0.032439 |
| opencode/qwen3.8-max | baseline | 51 | 30343 | 351900 | 0.885297 |
| opencode/qwen3.8-max | baseline | 3 | 170685 | 1105656 | 0.579533 |
| opencode/qwen3.8-max | enabled | 51 | 34328 | 792375 | 1.396961 |
| opencode/qwen3.8-max | enabled | 3 | 74190 | 513510 | 0.339210 |
