# Eval summary: foundry-anvil

Generated: 2026-10-06T21:30:00.426Z
Models: opencode/qwen3.8-max, opencode-go/deepseek-v4.1-flash
Runs per trigger query: 3

## Trigger results

| Model | Case | Should trigger | Split | Rate | Result |
| --- | --- | --- | --- | --- | --- |
| opencode/qwen3.8-max | Start a local Ethereum node for my tests. | true | train | 1.00 | PASS |
| opencode/qwen3.8-max | Fork mainnet at block 19000000. | true | train | 1.00 | PASS |
| opencode/qwen3.8-max | How do I impersonate a whale account locally? | true | train | 1.00 | PASS |
| opencode/qwen3.8-max | Advance the block timestamp by one day. | true | train | 1.00 | PASS |
| opencode/qwen3.8-max | Dump and load Anvil state between test runs. | true | train | 1.00 | PASS |
| opencode/qwen3.8-max | Mine a block on demand instead of per transaction. | true | train | 1.00 | PASS |
| opencode/qwen3.8-max | Set a custom balance for an address on the dev node. | true | train | 1.00 | PASS |
| opencode/qwen3.8-max | What does the anvil_setStorageAt RPC method do? | true | validation | 1.00 | PASS |
| opencode/qwen3.8-max | Use interval mining with a 12 second block time. | true | validation | 1.00 | PASS |
| opencode/qwen3.8-max | Write a Solidity contract for an ERC-20 token. | false | train | 0.00 | PASS |
| opencode/qwen3.8-max | Deploy my contract to mainnet with forge script. | false | train | 0.33 | PASS |
| opencode/qwen3.8-max | Explain how proof of stake consensus works. | false | train | 0.00 | PASS |
| opencode/qwen3.8-max | Configure my Hardhat Network node. | false | train | 0.00 | PASS |
| opencode/qwen3.8-max | Read the balance of an address on mainnet with cast. | false | train | 0.67 | FAIL |
| opencode/qwen3.8-max | Optimize this Postgres query. | false | validation | 0.00 | PASS |
| opencode/qwen3.8-max | Write a React hook for wallet connection. | false | validation | 0.67 | FAIL |
| opencode/qwen3.8-max | Explain EIP-1559 fee mechanics. | false | validation | 0.00 | PASS |
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
| opencode-go/deepseek-v4.1-flash | Deploy my contract to mainnet with forge script. | false | train | 0.33 | PASS |
| opencode-go/deepseek-v4.1-flash | Explain how proof of stake consensus works. | false | train | 0.00 | PASS |
| opencode-go/deepseek-v4.1-flash | Configure my Hardhat Network node. | false | train | 0.67 | FAIL |
| opencode-go/deepseek-v4.1-flash | Read the balance of an address on mainnet with cast. | false | train | 0.33 | PASS |
| opencode-go/deepseek-v4.1-flash | Optimize this Postgres query. | false | validation | 0.00 | PASS |
| opencode-go/deepseek-v4.1-flash | Write a React hook for wallet connection. | false | validation | 0.00 | PASS |
| opencode-go/deepseek-v4.1-flash | Explain EIP-1559 fee mechanics. | false | validation | 0.33 | PASS |

31 of 34 trigger cases pass.

## Output results

### impersonate-whale
- PASS: The answer calls anvil_impersonateAccount for the whale address.
  - evidence: 'cast rpc anvil_impersonateAccount 0x28C6...1d60'.
- PASS: The answer sends the transaction with --unlocked and --from set to the whale.
  - evidence: 'cast send $USDC "transfer(address,uint256)" $RECIP 1000000000 --from 0x28C6...1d60 --unlocked'.

### fork-at-block
- PASS: The answer uses anvil --fork-url together with --fork-block-number.
  - evidence: 'anvil --fork-url "$MAINNET_RPC" --fork-block-number "$FORK_BLOCK"' and a cast block-number check.

### state-between-runs
- PASS: The answer uses anvil --dump-state and --load-state, or --state.
  - evidence: 'Use --state. Anvil loads that file on start and writes it on exit.' Also lists --dump-state and --load-state.

4 of 4 assertions pass.

## Cost per arm

| Model | Arm | Runs | Avg time (ms) | Tokens | Est. cost (USD) |
| --- | --- | --- | --- | --- | --- |
| opencode-go/deepseek-v4.1-flash | baseline | 51 | 69598 | 7847041 | 0.304153 |
| opencode-go/deepseek-v4.1-flash | baseline | 3 | 98838 | 1513225 | 0.038378 |
| opencode-go/deepseek-v4.1-flash | enabled | 51 | 12175 | 374176 | 0.052140 |
| opencode-go/deepseek-v4.1-flash | enabled | 3 | 19936 | 181089 | 0.009436 |
| opencode/qwen3.8-max | baseline | 51 | 38482 | 388400 | 0.930894 |
| opencode/qwen3.8-max | baseline | 3 | 317606 | 1227145 | 0.716851 |
| opencode/qwen3.8-max | enabled | 51 | 21891 | 381489 | 0.761541 |
| opencode/qwen3.8-max | enabled | 3 | 200182 | 1191000 | 0.663830 |
