---
name: foundry-forge
description: >
  Compiles, tests, fuzzes, debugs, and deploys Solidity smart contracts using Forge — the core
  build and test tool in the Foundry suite. Covers writing and running Forge tests, cheatcodes
  (vm.prank, vm.warp, vm.expectRevert, and the full vm.* API), fuzz and invariant testing,
  forge script deployments and multi-chain broadcasts, contract verification on Etherscan, gas
  snapshots, forge coverage, and all forge CLI subcommands. Also covers forge-std imports:
  Test.sol, Script.sol, StdAssertions, StdCheats, StdStorage. Activates when Solidity test
  code or a forge script is present, or when any Forge or forge-std topic is mentioned.
---

# foundry-forge

Forge is Foundry's build, test, fuzz, debug, and deploy tool for Solidity.
Canonical docs: https://www.getfoundry.sh/forge
CLI reference: https://www.getfoundry.sh/reference/forge/forge

## Reference freshness

Foundry ships frequently. Core APIs in `references/` reflect the stable release as of this
skill's last update. If a user asks about a cheatcode, flag, or forge-std function not found
here, **web-fetch the live docs before answering — never fabricate a signature**:
- Cheatcode: `https://www.getfoundry.sh/reference/cheatcodes/<name>`
- forge-std: `https://www.getfoundry.sh/reference/forge-std/<name>`
- CLI flag: `https://www.getfoundry.sh/reference/forge/<subcommand>`

## Reference file routing

Load the relevant reference file based on the task. Do not load all files at once.

| Task | Load |
|---|---|
| vm.* cheatcodes, vm.prank, vm.warp, vm.expectRevert, forking, EVM state, gas metering | `references/cheatcodes.md` |
| forge-std imports, Test.sol, Script.sol, assertEq, bound, makeAddr, StdStorage | `references/forge-std.md` |
| forge script, --broadcast, --verify, deployment workflows, CREATE2, --resume | `references/scripting.md` |

---

## Project layout

```
project/
├── foundry.toml          # project config
├── src/                  # contract sources
├── test/                 # .t.sol test files
├── script/               # .s.sol script files
└── lib/                  # dependencies (git submodules or soldeer)
```

Standard test contract skeleton:
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {Test} from "forge-std/Test.sol";
import {MyContract} from "../src/MyContract.sol";

contract MyContractTest is Test {
    MyContract target;

    function setUp() public {
        target = new MyContract();
    }

    function test_SomeFeature() public { ... }
    function testFuzz_SomeFeature(uint256 x) public { ... }
}
```

**Naming conventions:**
- Test files: `*.t.sol`
- Test functions: `test_` or `test` prefix (unit), `testFuzz_` prefix (fuzz)
- `setUp()` runs before every test function
- Script files: `*.s.sol`

---

## Core CLI commands

### Build
```bash
forge build                          # compile all contracts
forge build --sizes                  # show contract sizes
forge build --via-ir                 # enable IR pipeline (Yul optimizer)
forge build --watch                  # recompile on file changes
forge clean                          # remove artifacts and cache
```

### Test
```bash
forge test                           # run all tests
forge test -v / -vv / -vvv / -vvvv  # verbosity (see table below)
forge test --match-test <NAME>       # filter by test function name
forge test --match-contract <NAME>   # filter by contract name
forge test --match-path <PATH>       # filter by file path
forge test --no-match-test <NAME>    # exclude by name
forge test --fork-url $RPC_URL       # run tests against a live fork
forge test --gas-report              # show per-function gas table
forge coverage                       # generate coverage report
forge coverage --report lcov         # lcov format for CI
```

**Verbosity levels:**
| Flag | Shows |
|---|---|
| (none) | Pass/fail summary |
| `-v` | Test names |
| `-vv` | Logs emitted during tests |
| `-vvv` | Traces for failing tests |
| `-vvvv` | Traces for all tests including setup |
| `-vvvvv` | Traces with storage changes and backtraces |

### Other key subcommands
```bash
forge init <NAME>                    # create new project
forge install <DEP>                  # install dependency (git submodule)
forge update                         # update dependencies
forge remove <DEP>                   # remove dependency
forge snapshot                       # create gas snapshot (test/*.gas-snapshot)
forge snapshot --check               # diff against existing snapshot
forge fmt                            # format Solidity files
forge lint                           # lint Solidity files
forge doc                            # generate NatSpec documentation
forge inspect <CONTRACT> <FIELD>     # inspect bytecode/abi/storage layout
forge create <CONTRACT>              # deploy a contract (simple, no script)
forge verify-contract <ADDR> <SRC>   # verify on Etherscan
forge flatten <FILE>                 # flatten source + imports into one file
forge coverage                       # code coverage report
```

### forge inspect fields
```
abi | bytecode | deployedBytecode | assembly | methodIdentifiers |
gasEstimates | storageLayout | devdoc | userdoc | metadata | ir |
irOptimized | ewasm
```

**When to use each field:**
- `ir` — Intermediate representation (Yul) before optimization. Use to debug optimizer behavior or verify codegen.
- `irOptimized` — IR after the Yul optimizer runs. Use to inspect the actual code that feeds into bytecode generation.
- `storageLayout` — Slot allocation for all state variables. Use to verify struct packing, mapping slot derivation, and variable ordering for gas optimization.

**--via-ir tradeoffs:**
Enabling the IR pipeline (`forge build --via-ir`) activates the Yul optimizer, which can significantly reduce bytecode size and gas cost for complex contracts. Tradeoffs:
- **Compilation time** is slower (2-5x) because the compiler generates Yul first
- **Bytecode size** is usually smaller, helping stay within the 24KB limit
- **Required for** some advanced optimizer settings, inline assembly edge cases, and certain library patterns
- **Not required for** simple contracts where standard compilation is fast enough

---

## Fuzz and invariant testing

### Fuzz test
Any test function accepting parameters is treated as a fuzz test:
```solidity
function testFuzz_Transfer(uint256 amount) public {
    vm.assume(amount > 0 && amount <= 1000 ether);  // discard invalid inputs
    // OR: clamp with bound (preferred — avoids test rejection)
    amount = bound(amount, 1, 1000 ether);
}
```

Configure fuzz runs in `foundry.toml`:
```toml
[fuzz]
runs = 1000
max_test_rejects = 65536
seed = "0x1234"          # deterministic fuzzing
```

### Invariant test
```solidity
contract InvariantTest is Test {
    function invariant_AlwaysTrue() public view {
        // must always hold
    }
}
```

Configure:
```toml
[invariant]
runs = 256
depth = 15
fail_on_revert = false
```

**Advanced fuzz guidance:**
- `max_test_rejects`: If >10% of fuzz runs are rejected by `vm.assume`, raise this value or switch to `bound()` for numeric ranges. High rejection rates indicate poor input distribution.
- `seed`: Set to a fixed hex string to reproduce a specific failure locally. Remove the seed for non-deterministic exploration in CI.
- Prefer `bound()` over `vm.assume()` for numeric clamping — `bound()` remaps values instead of discarding runs.

**Invariant testing with handler contracts:**
Handler contracts exercise the target contract through realistic call sequences. The invariant test contract defines the property; the handler defines the state-space exploration.

```solidity
contract CounterHandler {
    Counter public counter;
    constructor(Counter _counter) { counter = _counter; }
    function increment() public { counter.increment(); }
    function decrement() public { counter.decrement(); }
}

contract InvariantCounterTest is Test {
    Counter counter;
    CounterHandler handler;

    function setUp() public {
        counter = new Counter();
        handler = new CounterHandler(counter);
    }

    function invariant_CountNeverUnderflows() public view {
        assertGe(counter.getCount(), 0);
    }
}
```

Control handler scope in `foundry.toml`:
```toml
[invariant]
targetArtifact = "Counter"          # only fuzz Counter
excludeArtifacts = ["CounterHandler"] # exclude handler from direct fuzzing
```

---

## Traces — reading output

```
[29808] ContractTest::test_Example()           ← [gas] Contract::function()
  ├─ [2407] Token::balanceOf() [staticcall]    ← staticcall = view/pure
  │   └─ ← [Return] 1000                       ← return value
  ├─ [20460] Token::transfer()
  │   └─ ← [Stop]                              ← void return
  └─ ← [Revert] Unauthorized()                 ← revert with error
```

---

## Test and debug workflow

Copy this checklist when writing or debugging a failing test:

```
Test Progress:
- [ ] Step 1: Run forge test — identify failing test names
- [ ] Step 2: Isolate — forge test --match-test <NAME> -vvv (traces for failures)
- [ ] Step 3: Read the trace — find the exact call that reverted
- [ ] Step 4: Add cheatcodes as needed (vm.prank, vm.warp, vm.deal) — see references/cheatcodes.md
- [ ] Step 5: Re-run — forge test --match-test <NAME> -vvvv (traces for all including setup)
- [ ] Step 6: If assertion fails — check forge-std assertions in references/forge-std.md
- [ ] Step 7: Run full suite — forge test (confirm no regressions)
```

### Trace interpretation guide

Identify the error type from the trace pattern:

| Pattern | Likely cause | Fix approach |
|---|---|---|
| `[Revert] Unauthorized()` inside an external call | Missing access control or wrong `msg.sender` | Check `vm.prank` usage or `onlyOwner` modifier |
| `[Revert] panic(0x11)` | Arithmetic overflow/underflow | Use `bound()` for inputs or add overflow checks |
| `[Revert] <custom error>` propagates up multiple frames | Unhandled revert in a dependency | Mock the failing call or fix the dependency |
| Deep nesting with repeated `[call]` to the same contract | Reentrancy attack or recursive loop | Add reentrancy guards or break the recursion |
| `[Staticcall]` reverts | `view`/`pure` function reads invalid state | Check state initialization or mocking |

### Gas optimization

Establish a gas baseline before optimizing:

```bash
forge snapshot                    # writes .gas-snapshot
forge snapshot --check            # CI: fail if gas increased
```

Common gas waste patterns:
- **Redundant storage reads**: Cache storage variables in memory if used more than once in a function
- **Unbounded loops**: Replace with pagination or mapping-based lookups
- **Poor struct packing**: Order variables by size (uint256, address, bool) to minimize slots
- **Missing `immutable`/`constant`**: Mark one-time-set values to avoid SLOADs

Use `forge inspect <CONTRACT> storageLayout` to verify slot packing.

---

## Cheatcodes and forge-std

For any `vm.*` cheatcode usage, load `references/cheatcodes.md`.
For `forge-std` library usage (Test.sol, Script.sol, assertions, StdCheats), load `references/forge-std.md`.
For scripting and deployment, load `references/scripting.md`.

The cheatcode address is `0x7109709ECfa91a80626fF3989D68f67F5b1DD12D`.
When using fuzzed addresses, exclude it: `vm.assume(addr != 0x7109709ECfa91a80626fF3989D68f67F5b1DD12D)`.
