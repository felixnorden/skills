# Eval summary: foundry-cast

Generated: 2026-10-06T21:54:01.272Z
Models: opencode/qwen3.8-max, opencode-go/deepseek-v4.1-flash
Runs per trigger query: 3

## Trigger results

| Model | Case | Should trigger | Split | Rate | Result |
| --- | --- | --- | --- | --- | --- |
| opencode/qwen3.8-max | Read the balance of an address on mainnet. | true | train | 1.00 | PASS |
| opencode/qwen3.8-max | Decode this transaction calldata. | true | train | 1.00 | PASS |
| opencode/qwen3.8-max | Send a transaction from the command line. | true | train | 1.00 | PASS |
| opencode/qwen3.8-max | Look up a contract's ABI on Etherscan. | true | train | 1.00 | PASS |
| opencode/qwen3.8-max | Convert wei to ether in the shell. | true | train | 1.00 | PASS |
| opencode/qwen3.8-max | Sign a message with my local keystore account. | true | train | 1.00 | PASS |
| opencode/qwen3.8-max | Read a storage slot from a deployed contract. | true | train | 1.00 | PASS |
| opencode/qwen3.8-max | Compute the keccak256 of this string from the CLI. | true | validation | 1.00 | PASS |
| opencode/qwen3.8-max | Resolve an ENS name from the command line. | true | validation | 1.00 | PASS |
| opencode/qwen3.8-max | Write a Forge test for the transfer function. | false | train | 0.00 | PASS |
| opencode/qwen3.8-max | Start a local node and impersonate an account. | false | train | 1.00 | FAIL |
| opencode/qwen3.8-max | Write a Solidity contract for staking. | false | train | 0.00 | PASS |
| opencode/qwen3.8-max | Explain how the EVM stack machine works. | false | train | 0.33 | PASS |
| opencode/qwen3.8-max | Set up CI for my repository. | false | train | 0.00 | PASS |
| opencode/qwen3.8-max | Deploy my contract with forge script. | false | validation | 1.00 | FAIL |
| opencode/qwen3.8-max | Explain EIP-1559. | false | validation | 0.33 | PASS |
| opencode/qwen3.8-max | Write a React hook for wallet connection. | false | validation | 0.00 | PASS |
| opencode-go/deepseek-v4.1-flash | Read the balance of an address on mainnet. | true | train | 1.00 | PASS |
| opencode-go/deepseek-v4.1-flash | Decode this transaction calldata. | true | train | 1.00 | PASS |
| opencode-go/deepseek-v4.1-flash | Send a transaction from the command line. | true | train | 1.00 | PASS |
| opencode-go/deepseek-v4.1-flash | Look up a contract's ABI on Etherscan. | true | train | 1.00 | PASS |
| opencode-go/deepseek-v4.1-flash | Convert wei to ether in the shell. | true | train | 1.00 | PASS |
| opencode-go/deepseek-v4.1-flash | Sign a message with my local keystore account. | true | train | 1.00 | PASS |
| opencode-go/deepseek-v4.1-flash | Read a storage slot from a deployed contract. | true | train | 1.00 | PASS |
| opencode-go/deepseek-v4.1-flash | Compute the keccak256 of this string from the CLI. | true | validation | 1.00 | PASS |
| opencode-go/deepseek-v4.1-flash | Resolve an ENS name from the command line. | true | validation | 1.00 | PASS |
| opencode-go/deepseek-v4.1-flash | Write a Forge test for the transfer function. | false | train | 0.67 | FAIL |
| opencode-go/deepseek-v4.1-flash | Start a local node and impersonate an account. | false | train | 1.00 | FAIL |
| opencode-go/deepseek-v4.1-flash | Write a Solidity contract for staking. | false | train | 0.00 | PASS |
| opencode-go/deepseek-v4.1-flash | Explain how the EVM stack machine works. | false | train | 0.33 | PASS |
| opencode-go/deepseek-v4.1-flash | Set up CI for my repository. | false | train | 0.67 | FAIL |
| opencode-go/deepseek-v4.1-flash | Deploy my contract with forge script. | false | validation | 1.00 | FAIL |
| opencode-go/deepseek-v4.1-flash | Explain EIP-1559. | false | validation | 0.33 | PASS |
| opencode-go/deepseek-v4.1-flash | Write a React hook for wallet connection. | false | validation | 0.33 | PASS |

28 of 34 trigger cases pass.

## Output results

### decode-calldata
- PASS: The answer uses cast decode-calldata or cast 4byte-calldata for the selector.
  - evidence: 'cast decode-calldata "transfer(address,uint256)" 0xa9059cbb...' and 'cast 4byte-calldata 0xa9059cbb...' to look the selector up.
- PASS: The answer names cast calldata or cast abi-encode for the encoding side.
  - evidence: 'DATA=$(cast calldata "transfer(address,uint256)" 0xd8dA... 1ether)' and the note that cast abi-encode omits the selector.

### read-storage
- PASS: The answer uses cast storage for the slot.
  - evidence: 'cast storage <ADDR> <SLOT>' with --rpc-url and --block variants.
- PASS: The answer uses cast balance for the balance.
  - evidence: 'cast balance <ADDR>' and 'cast balance <ADDR> --ether'.

### sign-message
- PASS: The answer uses cast wallet sign.
  - evidence: 'cast wallet sign "hello" --keystore /tmp/ks/test-signer --password ...'.
- PASS: The answer checks the signature with cast wallet verify or an equivalent recovery step.
  - evidence: 'cast wallet verify --address 0x4D40... "hello" 0x254c...' with exit codes 0 and 1.

6 of 6 assertions pass.

## Cost per arm

| Model | Arm | Runs | Avg time (ms) | Tokens | Est. cost (USD) |
| --- | --- | --- | --- | --- | --- |
| opencode-go/deepseek-v4.1-flash | baseline | 51 | 56694 | 6743798 | 0.268019 |
| opencode-go/deepseek-v4.1-flash | baseline | 3 | 21082 | 338974 | 0.012398 |
| opencode-go/deepseek-v4.1-flash | enabled | 51 | 13231 | 566477 | 0.077179 |
| opencode-go/deepseek-v4.1-flash | enabled | 3 | 29666 | 318771 | 0.011997 |
| opencode/qwen3.8-max | baseline | 51 | 20855 | 333620 | 0.851034 |
| opencode/qwen3.8-max | baseline | 3 | 129032 | 1110945 | 0.586466 |
| opencode/qwen3.8-max | enabled | 51 | 18874 | 553802 | 1.024504 |
| opencode/qwen3.8-max | enabled | 3 | 65362 | 615450 | 0.322943 |
