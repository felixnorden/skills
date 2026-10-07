# Eval summary: foundry-cast

Generated: 2026-10-06T14:06:10.663Z
Models: opencode-go/deepseek-v4.1-flash
Runs per trigger query: 3

## Trigger results

| Model | Case | Should trigger | Split | Rate | Result |
| --- | --- | --- | --- | --- | --- |
| opencode-go/deepseek-v4.1-flash | Read the balance of an address on mainnet. | true | train | 1.00 | PASS |
| opencode-go/deepseek-v4.1-flash | Decode this transaction calldata. | true | train | 1.00 | PASS |
| opencode-go/deepseek-v4.1-flash | Send a transaction from the command line. | true | train | 1.00 | PASS |
| opencode-go/deepseek-v4.1-flash | Look up a contract's ABI on Etherscan. | true | train | 1.00 | PASS |
| opencode-go/deepseek-v4.1-flash | Convert wei to ether in the shell. | true | train | 1.00 | PASS |
| opencode-go/deepseek-v4.1-flash | Sign a message with my local keystore account. | true | train | 1.00 | PASS |
| opencode-go/deepseek-v4.1-flash | Read a storage slot from a deployed contract. | true | train | 1.00 | PASS |
| opencode-go/deepseek-v4.1-flash | Compute the keccak256 of this string from the CLI. | true | validation | 1.00 | PASS |
| opencode-go/deepseek-v4.1-flash | Resolve an ENS name from the command line. | true | validation | 1.00 | PASS |
| opencode-go/deepseek-v4.1-flash | Write a Forge test for the transfer function. | false | train | 1.00 | FAIL |
| opencode-go/deepseek-v4.1-flash | Start a local node and impersonate an account. | false | train | 1.00 | FAIL |
| opencode-go/deepseek-v4.1-flash | Write a Solidity contract for staking. | false | train | 0.33 | PASS |
| opencode-go/deepseek-v4.1-flash | Explain how the EVM stack machine works. | false | train | 0.00 | PASS |
| opencode-go/deepseek-v4.1-flash | Set up CI for my repository. | false | train | 0.67 | FAIL |
| opencode-go/deepseek-v4.1-flash | Deploy my contract with forge script. | false | validation | 1.00 | FAIL |
| opencode-go/deepseek-v4.1-flash | Explain EIP-1559. | false | validation | 0.33 | PASS |
| opencode-go/deepseek-v4.1-flash | Write a React hook for wallet connection. | false | validation | 0.67 | FAIL |

12 of 17 trigger cases pass.

## Output results

Outputs captured and ungraded. Add grading.json to score assertions.
- decode-calldata / opencode-go/deepseek-v4.1-flash / baseline
- read-storage / opencode-go/deepseek-v4.1-flash / baseline
- read-storage / opencode-go/deepseek-v4.1-flash / enabled
- sign-message / opencode-go/deepseek-v4.1-flash / enabled
- decode-calldata / opencode-go/deepseek-v4.1-flash / enabled
- sign-message / opencode-go/deepseek-v4.1-flash / baseline

## Cost per arm

| Model | Arm | Runs | Avg time (ms) | Tokens | Est. cost (USD) |
| --- | --- | --- | --- | --- | --- |
| opencode-go/deepseek-v4.1-flash | baseline | 51 | 60276 | 7439548 | 0.430699 |
| opencode-go/deepseek-v4.1-flash | baseline | 3 | 91610 | 791023 | 0.022397 |
| opencode-go/deepseek-v4.1-flash | enabled | 51 | 13623 | 590228 | 0.087006 |
| opencode-go/deepseek-v4.1-flash | enabled | 3 | 41213 | 396769 | 0.015159 |
