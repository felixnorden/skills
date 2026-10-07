# Eval summary: foundry-chisel

Generated: 2026-10-06T22:27:31.601Z
Models: opencode/qwen3.8-max, opencode-go/deepseek-v4.1-flash
Runs per trigger query: 3

## Trigger results

| Model | Case | Should trigger | Split | Rate | Result |
| --- | --- | --- | --- | --- | --- |
| opencode/qwen3.8-max | Try out this Solidity snippet in a REPL. | true | train | 1.00 | PASS |
| opencode/qwen3.8-max | Save my Chisel session and load it later. | true | train | 1.00 | PASS |
| opencode/qwen3.8-max | Fork mainnet inside the REPL. | true | train | 1.00 | PASS |
| opencode/qwen3.8-max | Fetch a verified contract interface from Etherscan in Chisel. | true | train | 1.00 | PASS |
| opencode/qwen3.8-max | Inspect the stack and memory after a call. | true | train | 1.00 | PASS |
| opencode/qwen3.8-max | Export my Chisel session as a script. | true | train | 1.00 | PASS |
| opencode/qwen3.8-max | What does the !traces command do? | true | train | 1.00 | PASS |
| opencode/qwen3.8-max | Prototype this math expression in Solidity. | true | validation | 1.00 | PASS |
| opencode/qwen3.8-max | Use vm.prank inside Chisel. | true | validation | 1.00 | PASS |
| opencode/qwen3.8-max | Write a Forge test for the transfer function. | false | train | 0.67 | FAIL |
| opencode/qwen3.8-max | Start a local node and impersonate an account. | false | train | 1.00 | FAIL |
| opencode/qwen3.8-max | Write a Solidity contract for staking. | false | train | 0.33 | PASS |
| opencode/qwen3.8-max | Deploy my contract with forge script. | false | train | 0.67 | FAIL |
| opencode/qwen3.8-max | Read the balance of an address on mainnet. | false | train | 1.00 | FAIL |
| opencode/qwen3.8-max | Explain EIP-1559. | false | validation | 0.00 | PASS |
| opencode/qwen3.8-max | Set up CI for my repository. | false | validation | 0.00 | PASS |
| opencode/qwen3.8-max | Write a React hook for wallet connection. | false | validation | 0.00 | PASS |
| opencode-go/deepseek-v4.1-flash | Try out this Solidity snippet in a REPL. | true | train | 1.00 | PASS |
| opencode-go/deepseek-v4.1-flash | Save my Chisel session and load it later. | true | train | 1.00 | PASS |
| opencode-go/deepseek-v4.1-flash | Fork mainnet inside the REPL. | true | train | 1.00 | PASS |
| opencode-go/deepseek-v4.1-flash | Fetch a verified contract interface from Etherscan in Chisel. | true | train | 1.00 | PASS |
| opencode-go/deepseek-v4.1-flash | Inspect the stack and memory after a call. | true | train | 1.00 | PASS |
| opencode-go/deepseek-v4.1-flash | Export my Chisel session as a script. | true | train | 1.00 | PASS |
| opencode-go/deepseek-v4.1-flash | What does the !traces command do? | true | train | 1.00 | PASS |
| opencode-go/deepseek-v4.1-flash | Prototype this math expression in Solidity. | true | validation | 1.00 | PASS |
| opencode-go/deepseek-v4.1-flash | Use vm.prank inside Chisel. | true | validation | 1.00 | PASS |
| opencode-go/deepseek-v4.1-flash | Write a Forge test for the transfer function. | false | train | 1.00 | FAIL |
| opencode-go/deepseek-v4.1-flash | Start a local node and impersonate an account. | false | train | 1.00 | FAIL |
| opencode-go/deepseek-v4.1-flash | Write a Solidity contract for staking. | false | train | 0.67 | FAIL |
| opencode-go/deepseek-v4.1-flash | Deploy my contract with forge script. | false | train | 1.00 | FAIL |
| opencode-go/deepseek-v4.1-flash | Read the balance of an address on mainnet. | false | train | 1.00 | FAIL |
| opencode-go/deepseek-v4.1-flash | Explain EIP-1559. | false | validation | 0.00 | PASS |
| opencode-go/deepseek-v4.1-flash | Set up CI for my repository. | false | validation | 0.00 | PASS |
| opencode-go/deepseek-v4.1-flash | Write a React hook for wallet connection. | false | validation | 0.67 | FAIL |

24 of 34 trigger cases pass.

## Output results

### session-roundtrip
- PASS: The answer uses !save to write the session.
  - evidence: '!save demo-session' and 'Saved session to cache with ID = demo-session'.
- PASS: The answer uses !load to restore the session.
  - evidence: '!load demo-session' then 'x + 1' returns 43, plus the on-disk cache path.

### fork-in-repl
- PASS: The answer uses !fork with an RPC URL.
  - evidence: '!fork https://eth-mainnet.g.alchemy.com/v2/<KEY>', plus chisel --fork-url --fork-block-number as option A.
- PASS: The answer calls the deployed contract from the REPL after forking.
  - evidence: '!fetch 0x6B17... IERC20' then 'dai.totalSupply()' and 'dai.balanceOf(...)' in the REPL.

### export-session
- PASS: The answer exports the session to a Script file.
  - evidence: '!export (alias !ex) writes a forge-std Script file. The default path is script/ChiselScript.s.sol' with the generated contract shown.

5 of 5 assertions pass.

## Cost per arm

| Model | Arm | Runs | Avg time (ms) | Tokens | Est. cost (USD) |
| --- | --- | --- | --- | --- | --- |
| opencode-go/deepseek-v4.1-flash | baseline | 51 | 74603 | 13201175 | 0.485442 |
| opencode-go/deepseek-v4.1-flash | baseline | 3 | 115841 | 2323006 | 0.045663 |
| opencode-go/deepseek-v4.1-flash | enabled | 51 | 11449 | 470752 | 0.073248 |
| opencode-go/deepseek-v4.1-flash | enabled | 3 | 36052 | 491826 | 0.015646 |
| opencode/qwen3.8-max | baseline | 51 | 32849 | 734005 | 1.231365 |
| opencode/qwen3.8-max | baseline | 3 | 269683 | 1836338 | 0.845252 |
| opencode/qwen3.8-max | enabled | 51 | 24206 | 441221 | 0.893348 |
| opencode/qwen3.8-max | enabled | 3 | 158584 | 850198 | 0.404246 |
