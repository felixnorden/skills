---
name: foundry-chisel
description: >
  Evaluates and prototypes Solidity expressions interactively using Chisel — Foundry's
  built-in REPL. Covers all REPL commands (!save, !load, !list, !fork, !source, !traces,
  !rawstack, !memdump), session management and caching, forking a live network from within
  the REPL, exporting sessions to forge-std Script files, and fetching verified contract
  interfaces from Etherscan (!fetch). Gives access to the full vm.* cheatcode API inside
  the REPL. Activates when a user wants to test a Solidity snippet, prototype an expression,
  inspect a live contract interactively, or use any chisel command prefixed with !.
---

# foundry-chisel

Chisel is an interactive Solidity REPL for rapidly prototyping and testing Solidity expressions.
It has access to all Forge cheatcodes via `vm` and supports session persistence and forking.

Canonical docs: https://www.getfoundry.sh/chisel
Commands reference: https://www.getfoundry.sh/chisel/commands

## Reference freshness

Chisel is the smallest Foundry tool. This file is self-contained. For anything not covered here,
web-fetch: `https://www.getfoundry.sh/chisel/commands`

---

## Starting Chisel

```bash
chisel                         # start fresh session
chisel --fork-url $RPC_URL     # start forked against a network
chisel --fork-block-number N   # fork at a specific block
```

---

## Usage basics

In the REPL, type Solidity expressions directly. Chisel compiles and executes them inline:

```
➜ uint256 x = 42
➜ x * 2
Type: uint256
└ Data: 84

➜ address(0xdead).balance
Type: uint256
└ Data: 0

➜ keccak256("hello")
Type: bytes32
└ Data: 0x1c8aff950685c2ed4bc3174f3472287b56d9517b9c948127319a09a7a36deac8
```

The session compiles to a `REPL` contract that exposes `vm` (all Forge cheatcodes):

```
➜ vm.warp(1700000000)
➜ block.timestamp
Type: uint256
└ Data: 1700000000
```

---

## All REPL commands

Commands start with `!`. Type `!help` or `!h` to see them in session.

### General
| Command | Alias | Description |
|---|---|---|
| `!help` | `!h` | Display all available commands |
| `!quit` | `!q` | Quit Chisel |
| `!exec <CMD>` | `!e` | Execute a shell command |

### Session management
| Command | Alias | Description |
|---|---|---|
| `!clear` | `!c` | Clear all variables in current session |
| `!source` | `!so` | Print the generated Solidity source contract |
| `!save [ID]` | `!s` | Save session to cache (optional ID) |
| `!load <ID>` | `!l` | Load a saved session by ID |
| `!list` | `!ls` | List all cached sessions |
| `!clearcache` | `!cc` | Delete all cached sessions |
| `!export` | `!ex` | Export session as a forge-std Script file |
| `!fetch <ADDR> <NAME>` | `!fe` | Fetch verified contract ABI from Etherscan and add interface |
| `!edit` | — | Open the current session source in `$EDITOR` |

### Environment
| Command | Alias | Description |
|---|---|---|
| `!fork [URL]` | `!f` | Fork an RPC endpoint (no URL = disconnect from fork) |
| `!traces` | `!t` | Toggle execution traces on/off |
| `!calldata [DATA]` | `!cd` | Set `msg.data` for the session |

### Debug
| Command | Alias | Description |
|---|---|---|
| `!memdump` | `!md` | Dump raw EVM memory |
| `!stackdump` | `!sd` | Dump raw EVM stack |
| `!rawstack <VAR>` | `!rs` | Display raw stack value for a variable |

---

## Traces

Enable traces to see EVM execution for each expression:

```
➜ !traces
Traces enabled

➜ keccak256("hello")
Traces:
  [191] REPL::run()
    └─ ← [Return]

Type: bytes32
└ 0x1c8aff950685c2ed4bc3174f3472287b56d9517b9c948127319a09a7a36deac8
```

---

## Session management

```bash
# Save the current session
➜ !save my-session

# List saved sessions
➜ !list

# Load a session
➜ !load my-session

# Export to a Forge Script file
➜ !export
# Writes to script/ChiselScript.s.sol
```

---

## Forking

```bash
# Start forked (CLI)
chisel --fork-url https://eth-mainnet.g.alchemy.com/v2/...

# Fork from inside the REPL
➜ !fork https://eth-mainnet.g.alchemy.com/v2/...

# Disconnect fork
➜ !fork
```

While forked, you can interact with any live contract:

```
➜ IERC20 dai = IERC20(0x6B175474E89094C44Da98b954EedeAC495271d0F)
➜ dai.totalSupply()
Type: uint256
└ Data: 3397688407938765098734609858
```

---

## Generated source structure

`!source` prints the compiled contract Chisel uses under the hood:

```solidity
// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import {Vm} from "forge-std/Vm.sol";

contract REPL {
    Vm internal constant vm = Vm(address(uint160(uint256(keccak256("hevm cheat code")))));

    // your session variables here
    uint256 x = 42;

    function run() public {
        // your expressions here
    }
}
```

---

## Inspecting variables

```
➜ uint256 num = 0xdeadbeef
➜ !rawstack num
Type: uint256
├ Hex: 0xdeadbeef
├ Hex (full word): 0x00000000000000000000000000000000000000000000000000000000deadbeef
└ Decimal: 3735928559
```

---

## Common use cases

### Quick hash computation
```
➜ keccak256(abi.encode("Transfer(address,address,uint256)"))
```

### Test a Solidity expression without a full test file
```
➜ uint256 a = 1e18
➜ uint256 b = 3e18
➜ a * 1e18 / b    // fixed-point division
```

### Inspect live contract state (while forked)
```
➜ !fork https://...
➜ address weth = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2
➜ weth.balance
```

### Prototype ABI encoding
```
➜ abi.encode(uint256(1), address(0xdead), true)
```
