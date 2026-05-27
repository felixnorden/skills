# Forge Scripting & Deployment Reference

Forge scripts are Solidity files used to deploy contracts and execute on-chain transactions.
They replace JavaScript deployment scripts.
Docs: https://www.getfoundry.sh/forge/scripting
CLI reference: https://www.getfoundry.sh/reference/forge/script

## Contents

- [Script anatomy](#script-anatomy) — structure, conventions, inheritance
- [forge script CLI](#forge-script-cli) — simulate, broadcast, key management, verification
- [Deployment workflow checklist](#deployment-workflow-checklist)
- [Broadcast mechanics in Solidity](#broadcast-mechanics-in-solidity) — vm.startBroadcast overloads
- [Multi-chain deployment](#multi-chain-deployment) — multiple RPC targets, rpc_endpoints config
- [Broadcast artifacts](#broadcast-artifacts) — broadcast/ directory, run-latest.json structure
- [Common scripting patterns](#common-scripting-patterns) — env vars, JSON config, CREATE2

---

## Script anatomy

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {Script} from "forge-std/Script.sol";
import {console} from "forge-std/console.sol";
import {MyContract} from "../src/MyContract.sol";

contract DeployScript is Script {
    function run() public {
        vm.startBroadcast();

        MyContract c = new MyContract();
        c.initialize(42);

        console.log("Deployed at:", address(c));

        vm.stopBroadcast();
    }
}
```

**Conventions:**
- Script files end with `.s.sol`
- Inherit from `forge-std/Script.sol`
- Entry point is `run()` (can be any public function — specify with `--sig`)
- Wrap deployment logic in `vm.startBroadcast()` / `vm.stopBroadcast()`
- Only calls made inside the broadcast block are sent as real transactions

---

## Deployment workflow checklist

Copy this checklist and track progress for any production deployment:

```
Deployment Progress:
- [ ] Step 1: Write script inheriting from Script.sol, wrap logic in vm.startBroadcast()
- [ ] Step 2: Simulate — forge script script/Deploy.s.sol --rpc-url $RPC_URL (no --broadcast)
- [ ] Step 3: Review simulation output — check contract addresses and call sequence
- [ ] Step 4: Broadcast — add --broadcast (and --account or --private-key)
- [ ] Step 5: Verify — add --verify --etherscan-api-key $KEY, or run forge verify-contract
- [ ] Step 6: Confirm — check broadcast/Deploy.s.sol/<chainId>/run-latest.json for receipts
- [ ] Step 7: If failed mid-run — resume with --resume flag
```

Return to Step 2 if simulation output looks wrong. Return to Step 4 if verification fails.

### Flag reference for production deployments

**`--slow`:**
Waits for each transaction to be confirmed on-chain before sending the next one. Required when:
- Transactions depend on each other (e.g., deploy then initialize)
- Broadcasting through a multisig or timelock where ordering matters
- Network congestion makes nonce estimation unreliable

```bash
forge script script/Deploy.s.sol --broadcast --rpc-url $RPC_URL --slow
```

**`--skip-simulation`:**
Skips the local simulation step and sends transactions directly to the RPC. Use only when:
- The local state cannot replicate the live environment (e.g., complex governance proposals)
- Simulation is prohibitively slow and you have already verified behavior on a fork
- **Risk:** If the transaction reverts on-chain, you still pay gas and may leave a partial broadcast state

```bash
forge script script/Deploy.s.sol --broadcast --rpc-url $RPC_URL --skip-simulation
```

**Resume pattern:**
If a broadcast fails mid-run (e.g., out of gas, nonce conflict, or network error):

1. Identify the failed run:
   ```bash
   ls broadcast/Deploy.s.sol/<chainId>/
   # Look for run-<timestamp>.json files; the latest is also symlinked as run-latest.json
   ```

2. Resume from where it left off:
   ```bash
   forge script script/Deploy.s.sol --broadcast --rpc-url $RPC_URL --resume
   ```

3. Foundry reads `run-latest.json` to determine which transactions already succeeded and continues with the next pending one.

4. If partial state is inconsistent (e.g., a contract was deployed but initialization failed), manually verify on-chain before resuming. Do not resume if you are unsure of the on-chain state — start a fresh script instead.

**CREATE2 complete pattern with on-chain verification:**
```solidity
import {Script} from "forge-std/Script.sol";
import {console} from "forge-std/console.sol";

contract Deploy is Script {
    function run() public {
        bytes32 salt = keccak256("my-deployment-v1");
        bytes32 initcodeHash = keccak256(
            abi.encodePacked(type(MyContract).creationCode, abi.encode(arg1, arg2))
        );
        address predicted = vm.computeCreate2Address(salt, initcodeHash);

        vm.startBroadcast();
        MyContract c = new MyContract{salt: salt}(arg1, arg2);
        vm.stopBroadcast();

        require(address(c) == predicted, "CREATE2 address mismatch");
        console.log("Deployed at:", address(c));

        // Verify on-chain immediately after broadcast
        // forge script handles --verify, or run manually:
        // forge verify-contract <address> src/MyContract.sol:MyContract --etherscan-api-key $KEY
    }
}
```

---

### Simulate (no transactions sent)
```bash
forge script script/Deploy.s.sol
forge script script/Deploy.s.sol --rpc-url $RPC_URL      # simulate against live state
```

### Broadcast
```bash
forge script script/Deploy.s.sol \
  --broadcast \
  --rpc-url $RPC_URL
```

### Key management options
```bash
# Keystore (recommended for production)
forge script ... --account <KEYSTORE_NAME>

# Hardware wallet
forge script ... --ledger
forge script ... --trezor

# Raw private key (dev/CI only — never in production)
forge script ... --private-key $PRIVATE_KEY

# Mnemonic
forge script ... --mnemonic-path $MNEMONIC_FILE

# From sender address (for read-only / --unlocked anvil)
forge script ... --sender $ADDRESS --unlocked
```

### Verification during deployment
```bash
forge script script/Deploy.s.sol \
  --broadcast \
  --rpc-url $RPC_URL \
  --verify \
  --etherscan-api-key $ETHERSCAN_API_KEY
```

### Verify a previously deployed contract
```bash
forge verify-contract $CONTRACT_ADDRESS src/MyContract.sol:MyContract \
  --etherscan-api-key $ETHERSCAN_API_KEY \
  --chain <CHAIN_NAME_OR_ID>

# Check verification status
forge verify-check $GUID --etherscan-api-key $ETHERSCAN_API_KEY

# Verify deployed bytecode
forge verify-bytecode $ADDRESS src/MyContract.sol:MyContract \
  --rpc-url $RPC_URL
```

### Resume a failed broadcast
```bash
forge script script/Deploy.s.sol \
  --broadcast \
  --rpc-url $RPC_URL \
  --resume
```

### Other useful flags
```bash
--sig "myFunction(uint256)" 42    # call a function other than run()
--slow                            # wait for each tx to be confirmed before sending next
--skip-simulation                 # skip local simulation, go straight to broadcast
--gas-estimate-multiplier 130     # gas estimate multiplier in percent (default: 130)
--priority-gas-price $PRICE       # EIP-1559 priority fee (in wei)
--with-gas-price $PRICE           # legacy gas price
--json                            # output results as JSON
--timeout <SECONDS>               # broadcast timeout (default: 300)
```

---

## Broadcast mechanics in Solidity

```solidity
// Broadcast next single call only
vm.broadcast();
vm.broadcast(address signer);
vm.broadcast(uint256 privateKey);

// Broadcast all subsequent external calls
vm.startBroadcast();
vm.startBroadcast(address signer);     // override broadcaster address
vm.startBroadcast(uint256 privateKey); // sign with specific key
vm.stopBroadcast();
```

**What gets broadcast:**
- `new Contract()` calls
- External function calls on other contracts
- ETH transfers via `.call{value: ...}()`

**What does NOT get broadcast:**
- Internal function calls
- `view` / `pure` function calls
- Anything not in the broadcast block

---

## Multi-chain deployment

```bash
forge script script/Deploy.s.sol --broadcast --rpc-url $MAINNET_RPC
forge script script/Deploy.s.sol --broadcast --rpc-url $ARBITRUM_RPC
forge script script/Deploy.s.sol --broadcast --rpc-url $OPTIMISM_RPC
```

To deploy to multiple chains in a single script run, use multiple `--rpc-url` flags
(Foundry supports this via the `Config` module and `vm.createSelectFork`):

```solidity
function run() public {
    uint256 mainnetFork = vm.createSelectFork("mainnet");
    vm.startBroadcast();
    new MyContract();
    vm.stopBroadcast();

    uint256 arbitrumFork = vm.createSelectFork("arbitrum");
    vm.startBroadcast();
    new MyContract();
    vm.stopBroadcast();
}
```

RPC aliases are configured in `foundry.toml`:
```toml
[rpc_endpoints]
mainnet = "${MAINNET_RPC_URL}"
arbitrum = "${ARBITRUM_RPC_URL}"
optimism = "${OPTIMISM_RPC_URL}"
```

---

## Broadcast artifacts

After a broadcast, Foundry writes receipts and deployment info to:
```
broadcast/
└── Deploy.s.sol/
    └── <chainId>/
        ├── run-latest.json    # most recent run
        └── run-<timestamp>.json
```

Read deployed addresses in follow-up scripts:
```solidity
function run() public {
    string memory json = vm.readFile("broadcast/Deploy.s.sol/1/run-latest.json");
    address deployed = vm.parseJsonAddress(json, ".transactions[0].contractAddress");
}
```

`run-latest.json` structure (key fields):
```json
{
  "transactions": [
    {
      "hash": "0x...",
      "type": "CREATE",
      "contractName": "MyContract",
      "contractAddress": "0x...",
      "arguments": null
    }
  ],
  "receipts": [...],
  "libraries": [],
  "timestamp": 1700000000,
  "chain": 1
}
```

---

## Common scripting patterns

### Read env variables
```solidity
uint256 key = vm.envUint("PRIVATE_KEY");
string memory rpc = vm.envString("RPC_URL");
address safe = vm.envAddress("SAFE_ADDRESS");
```

### Parse JSON config
```solidity
string memory config = vm.readFile("config/addresses.json");
address token = vm.parseJsonAddress(config, ".mainnet.token");
```

### Console logging in scripts
```solidity
console.log("Chain ID:", block.chainid);
console.log("Deployer:", msg.sender);
console.log("Contract:", address(myContract));
```

### Deterministic deployment with CREATE2
```solidity
import {Create2} from "@openzeppelin/contracts/utils/Create2.sol";

bytes32 salt = keccak256("my-deployment-salt");
address predicted = computeCreate2Address(salt, keccak256(type(MyContract).creationCode));
MyContract c = new MyContract{salt: salt}();
require(address(c) == predicted, "CREATE2 address mismatch");
```
