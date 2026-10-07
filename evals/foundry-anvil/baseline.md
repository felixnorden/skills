# Eval summary: foundry-anvil

Generated: 2026-10-06T13:14:50.859Z
Models: opencode-go/deepseek-v4.1-flash
Runs per trigger query: 3

## Trigger results

| Model | Case | Should trigger | Split | Rate | Result |
| --- | --- | --- | --- | --- | --- |
| opencode-go/deepseek-v4.1-flash | Start a local Ethereum node for my tests. | true | train | 1.00 | PASS |
| opencode-go/deepseek-v4.1-flash | Fork mainnet at block 19000000. | true | train | 1.00 | PASS |
| opencode-go/deepseek-v4.1-flash | How do I impersonate a whale account locally? | true | train | 1.00 | PASS |
| opencode-go/deepseek-v4.1-flash | Advance the block timestamp by one day. | true | train | 1.00 | PASS |
| opencode-go/deepseek-v4.1-flash | Dump and load Anvil state between test runs. | true | train | 1.00 | PASS |
| opencode-go/deepseek-v4.1-flash | Mine a block on demand instead of per transaction. | true | train | 1.00 | PASS |
| opencode-go/deepseek-v4.1-flash | Set a custom balance for an address on the dev node. | true | train | 1.00 | PASS |
| opencode-go/deepseek-v4.1-flash | What does the anvil_setStorageAt RPC method do? | true | validation | 1.00 | PASS |
| opencode-go/deepseek-v4.1-flash | Use interval mining with a 12 second block time. | true | validation | 1.00 | PASS |
| opencode-go/deepseek-v4.1-flash | Write a Solidity contract for an ERC-20 token. | false | train | 0.00 | PASS |
| opencode-go/deepseek-v4.1-flash | Deploy my contract to mainnet with forge script. | false | train | 0.67 | FAIL |
| opencode-go/deepseek-v4.1-flash | Explain how proof of stake consensus works. | false | train | 0.00 | PASS |
| opencode-go/deepseek-v4.1-flash | Configure my Hardhat Network node. | false | train | 1.00 | FAIL |
| opencode-go/deepseek-v4.1-flash | Read the balance of an address on mainnet with cast. | false | train | 1.00 | FAIL |
| opencode-go/deepseek-v4.1-flash | Optimize this Postgres query. | false | validation | 0.00 | PASS |
| opencode-go/deepseek-v4.1-flash | Write a React hook for wallet connection. | false | validation | 0.67 | FAIL |
| opencode-go/deepseek-v4.1-flash | Explain EIP-1559 fee mechanics. | false | validation | 0.00 | PASS |

13 of 17 trigger cases pass.

## Output results

Outputs captured and ungraded. Add grading.json to score assertions.
- fork-at-block / opencode-go/deepseek-v4.1-flash / enabled
- state-between-runs / opencode-go/deepseek-v4.1-flash / baseline
- state-between-runs / opencode-go/deepseek-v4.1-flash / enabled
- fork-at-block / opencode-go/deepseek-v4.1-flash / baseline
- impersonate-whale / opencode-go/deepseek-v4.1-flash / enabled
- impersonate-whale / opencode-go/deepseek-v4.1-flash / baseline

## Cost per arm

| Model | Arm | Runs | Avg time (ms) | Tokens | Est. cost (USD) |
| --- | --- | --- | --- | --- | --- |
| opencode-go/deepseek-v4.1-flash | baseline | 51 | 21736 | 2646783 | 0.137968 |
| opencode-go/deepseek-v4.1-flash | baseline | 3 | 158691 | 1072834 | 0.031131 |
| opencode-go/deepseek-v4.1-flash | enabled | 51 | 10017 | 452055 | 0.058228 |
| opencode-go/deepseek-v4.1-flash | enabled | 3 | 35705 | 399972 | 0.015095 |
