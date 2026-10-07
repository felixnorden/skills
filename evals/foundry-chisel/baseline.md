# Eval summary: foundry-chisel

Generated: 2026-10-06T16:12:08.736Z
Models: opencode-go/deepseek-v4.1-flash
Runs per trigger query: 3

## Trigger results

| Model | Case | Should trigger | Split | Rate | Result |
| --- | --- | --- | --- | --- | --- |
| opencode-go/deepseek-v4.1-flash | Try out this Solidity snippet in a REPL. | true | train | 1.00 | PASS |
| opencode-go/deepseek-v4.1-flash | Save my Chisel session and load it later. | true | train | 1.00 | PASS |
| opencode-go/deepseek-v4.1-flash | Fork mainnet inside the REPL. | true | train | 1.00 | PASS |
| opencode-go/deepseek-v4.1-flash | Fetch a verified contract interface from Etherscan in Chisel. | true | train | 1.00 | PASS |
| opencode-go/deepseek-v4.1-flash | Inspect the stack and memory after a call. | true | train | 1.00 | PASS |
| opencode-go/deepseek-v4.1-flash | Export my Chisel session as a script. | true | train | 1.00 | PASS |
| opencode-go/deepseek-v4.1-flash | What does the !traces command do? | true | train | 1.00 | PASS |
| opencode-go/deepseek-v4.1-flash | Prototype this math expression in Solidity. | true | validation | 1.00 | PASS |
| opencode-go/deepseek-v4.1-flash | Use vm.prank inside Chisel. | true | validation | 1.00 | PASS |
| opencode-go/deepseek-v4.1-flash | Write a Forge test for the transfer function. | false | train | 0.67 | FAIL |
| opencode-go/deepseek-v4.1-flash | Start a local node and impersonate an account. | false | train | 1.00 | FAIL |
| opencode-go/deepseek-v4.1-flash | Write a Solidity contract for staking. | false | train | 0.00 | PASS |
| opencode-go/deepseek-v4.1-flash | Deploy my contract with forge script. | false | train | 0.33 | PASS |
| opencode-go/deepseek-v4.1-flash | Read the balance of an address on mainnet. | false | train | 1.00 | FAIL |
| opencode-go/deepseek-v4.1-flash | Explain EIP-1559. | false | validation | 0.00 | PASS |
| opencode-go/deepseek-v4.1-flash | Set up CI for my repository. | false | validation | 0.00 | PASS |
| opencode-go/deepseek-v4.1-flash | Write a React hook for wallet connection. | false | validation | 0.00 | PASS |

14 of 17 trigger cases pass.

## Output results

Outputs captured and ungraded. Add grading.json to score assertions.
- session-roundtrip / opencode-go/deepseek-v4.1-flash / baseline
- export-session / opencode-go/deepseek-v4.1-flash / enabled
- session-roundtrip / opencode-go/deepseek-v4.1-flash / enabled
- fork-in-repl / opencode-go/deepseek-v4.1-flash / enabled
- export-session / opencode-go/deepseek-v4.1-flash / baseline
- fork-in-repl / opencode-go/deepseek-v4.1-flash / baseline

## Cost per arm

| Model | Arm | Runs | Avg time (ms) | Tokens | Est. cost (USD) |
| --- | --- | --- | --- | --- | --- |
| opencode-go/deepseek-v4.1-flash | baseline | 51 | 118828 | 15040664 | 0.578477 |
| opencode-go/deepseek-v4.1-flash | baseline | 3 | 279835 | 1520663 | 0.034830 |
| opencode-go/deepseek-v4.1-flash | enabled | 51 | 15149 | 370176 | 0.061864 |
| opencode-go/deepseek-v4.1-flash | enabled | 3 | 138215 | 603473 | 0.018979 |
