# Forge Cheatcodes Reference

Cheatcodes are available via the `vm` instance in any contract that inherits `forge-std/Test.sol`.
Cheatcode address: `0x7109709ECfa91a80626fF3989D68f67F5b1DD12D`
Full interface (authoritative): https://github.com/foundry-rs/forge-std/blob/master/src/Vm.sol
Live reference: https://www.getfoundry.sh/reference/cheatcodes/overview

**If a signature below conflicts with the live docs, always prefer the live docs.**

---

## Table of Contents

1. [Environment — EVM state manipulation](#1-environment)
2. [Assertions — expect reverts, events, calls](#2-assertions)
3. [Fuzzer — constrain fuzz inputs](#3-fuzzer)
4. [Forking — create and switch forks](#4-forking)
5. [External — FFI, env vars, JSON/TOML](#5-external)
6. [Signing — sign messages and delegations](#6-signing)
7. [Utilities — addresses, labels, wallets, parsing](#7-utilities)
8. [Files — read/write filesystem](#8-files)
9. [RPC — raw JSON-RPC calls](#9-rpc)
10. [State Snapshots — snapshot and restore EVM](#10-state-snapshots)

---

## 1. Environment

EVM block and account state manipulation.

### Block fields
```solidity
vm.warp(uint256 timestamp);                  // set block.timestamp
// Note: with --via-ir, use vm.getBlockTimestamp() after warp instead of block.timestamp directly
vm.getBlockTimestamp() returns (uint256);    // read current block.timestamp (IR-safe)
vm.roll(uint256 blockNumber);               // set block.number
vm.getBlockNumber() returns (uint256);      // read current block.number (IR-safe)
vm.fee(uint256 newBasefee);                 // set block.basefee
vm.difficulty(uint256 newDifficulty);       // set block.difficulty (pre-merge)
vm.prevrandao(bytes32 newPrevrandao);       // set block.prevrandao (post-merge)
vm.chainId(uint256 newChainId);             // set block.chainid
vm.coinbase(address newCoinbase);           // set block.coinbase
vm.txGasPrice(uint256 newGasPrice);         // set tx.gasprice
```

### Caller manipulation (prank)
```solidity
// Single-call prank — affects only the immediately following external call
vm.prank(address msgSender);
vm.prank(address msgSender, address txOrigin);

// Multi-call prank — affects all subsequent external calls until stopPrank
vm.startPrank(address msgSender);
vm.startPrank(address msgSender, address txOrigin);
vm.stopPrank();

// Read current prank state
// CallerMode: 0=None, 1=Broadcast, 2=RecurrentBroadcast, 3=Prank, 4=RecurrentPrank
vm.readCallers() returns (VmSafe.CallerMode callerMode, address msgSender, address txOrigin);
```

### Account state
```solidity
vm.deal(address target, uint256 newBalance);                  // set ETH balance
vm.store(address target, bytes32 slot, bytes32 value);        // write storage slot
vm.load(address target, bytes32 slot) returns (bytes32);      // read storage slot
vm.etch(address target, bytes calldata newRuntimeBytecode);   // set code at address
vm.setNonce(address account, uint64 newNonce);                // set account nonce
vm.getNonce(address account) returns (uint64);                // get account nonce
```

### Mocking calls
```solidity
// Mock return value for a call
vm.mockCall(address callee, bytes calldata data, bytes calldata returnData);
vm.mockCall(address callee, uint256 msgValue, bytes calldata data, bytes calldata returnData);

// Mock multiple sequential return values
vm.mockCalls(address callee, bytes calldata data, bytes[] calldata returnData);

// Mock a call to revert
vm.mockCallRevert(address callee, bytes calldata data, bytes calldata revertData);
vm.mockCallRevert(address callee, uint256 msgValue, bytes calldata data, bytes calldata revertData);

// Redirect calls to a different implementation
vm.mockFunction(address callee, address target, bytes calldata data);

// Clear all active mocks
vm.clearMockedCalls();
```

**`vm.mockFunction` example:**
Redirect all calls matching a selector to a different implementation contract. Useful for testing upgrade paths or swapping dependencies without redeploying.

```solidity
// Redirect all MyToken.transfer calls to MockToken's implementation
vm.mockFunction(
    address(myToken),               // callee whose calls are intercepted
    address(mockToken),             // target implementation to execute instead
    abi.encodeWithSelector(IERC20.transfer.selector) // selector to match
);

// Now myToken.transfer(to, amount) executes mockToken's code
myToken.transfer(to, amount);        // runs mockToken.transfer under the hood
```
```

### Storage access recording
```solidity
vm.record();                                                           // start recording
vm.accesses(address target) returns (bytes32[] memory reads,
                                     bytes32[] memory writes);         // get accesses
```

### Log recording
```solidity
vm.recordLogs();                                                       // start recording
vm.getRecordedLogs() returns (VmSafe.Log[] memory logs);               // get logs
// VmSafe.Log: { bytes32[] topics, bytes data, address emitter }
```

### State diff recording
```solidity
vm.startStateDiffRecording();
vm.stopAndReturnStateDiff() returns (VmSafe.AccountAccess[] memory accountAccesses);
```

**Example:**
```solidity
vm.startStateDiffRecording();

// Execute the call whose state changes you want to inspect
vault.deposit(1000);

VmSafe.AccountAccess[] memory diffs = vm.stopAndReturnStateDiff();

// diffs[i] contains: { address account, bytes32[] storageAccesses, VmSafe.StorageAccess[] }
// Use this to verify which external contracts were touched and what slots changed
for (uint256 i = 0; i < diffs.length; i++) {
    console.log("Account:", diffs[i].account);
    for (uint256 j = 0; j < diffs[i].storageAccesses.length; j++) {
        console.log("Slot:", diffs[i].storageAccesses[j].slot);
    }
}
```

### Broadcast (scripting)
```solidity
vm.broadcast();                         // broadcast next call only
vm.broadcast(address signer);
vm.broadcast(uint256 privateKey);
vm.startBroadcast();                    // broadcast all subsequent calls
vm.startBroadcast(address signer);
vm.startBroadcast(uint256 privateKey);
vm.stopBroadcast();
```

### Gas metering
```solidity
vm.pauseGasMetering();
vm.resumeGasMetering();
vm.resetGasMetering();
```

**Use cases:**
- **Isolate setup gas**: Pause metering before heavy `setUp()` logic so gas snapshots reflect only the test body.
- **Exclude helper calls**: Pause before calling utility functions that are not part of the function under test.

**Example:**
```solidity
function test_DepositGas() public {
    vm.pauseGasMetering();           // stop counting
    vault.deposit(1 ether);          // warm-up / setup deposit
    vm.resumeGasMetering();          // resume counting

    vault.deposit(1 ether);          // only this call is metered
    // assert gas snapshot here
}
```

### Context
```solidity
// VmSafe.ForgeContext: 0=None, 1=Test, 2=Coverage, 3=Snapshot, 4=ScriptDryRun,
//                      5=ScriptBroadcast, 6=ScriptResume, 7=Unknown
vm.isContext(VmSafe.ForgeContext context) returns (bool);
```

---

## 2. Assertions

Used to assert expected outcomes before/around a call.

```solidity
// Expect the next call to revert
vm.expectRevert();
vm.expectRevert(bytes calldata revertData);       // exact revert data (ABI-encoded)
vm.expectRevert(bytes4 selector);                  // custom error selector
vm.expectRevert(string calldata revertMessage);    // string revert message

// Expect an event to be emitted by the next call
// Must call vm.expectEmit() then emit the expected event, then make the call
vm.expectEmit();
vm.expectEmit(bool checkTopic1, bool checkTopic2, bool checkTopic3, bool checkData);
vm.expectEmit(bool checkTopic1, bool checkTopic2, bool checkTopic3, bool checkData, address emitter);
vm.expectEmit(address emitter);

// Expect a call to be made (at least once)
vm.expectCall(address callee, bytes calldata data);
vm.expectCall(address callee, uint256 msgValue, bytes calldata data);
vm.expectCall(address callee, bytes calldata data, uint64 count);          // exactly N times
vm.expectCall(address callee, uint256 msgValue, bytes calldata data, uint64 count);
vm.expectCallMinGas(address callee, uint256 msgValue, uint64 minGas, bytes calldata data);
vm.expectCallMinGas(address callee, uint256 msgValue, uint64 minGas, bytes calldata data, uint64 count);

// Expect no call to be made to callee with data
vm.expectNoCall(address callee, bytes calldata data);
vm.expectNoCall(address callee, uint256 msgValue, bytes calldata data);
```

**expectEmit pattern:**
```solidity
// Check all topics and data, from any emitter
vm.expectEmit();
emit Transfer(from, to, amount);   // define expected event
myToken.transfer(to, amount);      // actual call — must emit matching event
```

**expectEmit with specific emitter:**
```solidity
// Verify that ONLY myToken emits the Transfer event
vm.expectEmit(address(myToken));
emit Transfer(from, to, amount);
myToken.transfer(to, amount);

// Full control: check topic1, topic2, topic3, data, and specific emitter
vm.expectEmit(true, true, true, true, address(myToken));
emit Transfer(from, to, amount);
myToken.transfer(to, amount);
```

---

```solidity
// Advanced fuzz configuration
toml
[fuzz]
runs = 1000                // default: 256
max_test_rejects = 65536   // default: 65536; raise if reject rate is high
seed = "0x1234"            // deterministic fuzzing — same seed = same inputs
```

**Tuning guidance:**
- `runs`: Increase for high-assurance contracts (10 000+). Decrease for CI speed (256-500).
- `max_test_rejects`: If >10% of runs are rejected, raise this or switch from `vm.assume` to `bound()`.
- `seed`: Set to a fixed hex string to reproduce a specific fuzz failure locally. Remove or change the seed for non-deterministic exploration.

---

## 3. Fuzzer

Control fuzz input generation.

```solidity
// Discard the current fuzz run if condition is false (use sparingly — prefer bound())
vm.assume(bool condition);

// Discard if next call reverts (useful for invariant test handlers)
vm.assumeNoRevert();
```

**Prefer `bound()` over `vm.assume()`** for numeric ranges — it remaps values instead of discarding runs:
```solidity
// In forge-std/Test.sol (not a vm cheatcode — inherited from StdUtils)
uint256 clamped = bound(rawValue, min, max);
```

---

## 4. Forking

Create and manage forks of live networks.

```solidity
// Create a fork (does not switch to it)
vm.createFork(string calldata urlOrAlias) returns (uint256 forkId);
vm.createFork(string calldata urlOrAlias, uint256 blockNumber) returns (uint256 forkId);
vm.createFork(string calldata urlOrAlias, bytes32 txHash) returns (uint256 forkId);

// Create and immediately switch to a fork
vm.createSelectFork(string calldata urlOrAlias) returns (uint256 forkId);
vm.createSelectFork(string calldata urlOrAlias, uint256 blockNumber) returns (uint256 forkId);
vm.createSelectFork(string calldata urlOrAlias, bytes32 txHash) returns (uint256 forkId);

// Switch between forks
vm.selectFork(uint256 forkId);
vm.activeFork() returns (uint256 forkId);

// Roll fork to a different block or tx
vm.rollFork(uint256 blockNumber);
vm.rollFork(uint256 forkId, uint256 blockNumber);
vm.rollFork(bytes32 txHash);
vm.rollFork(uint256 forkId, bytes32 txHash);

// Persistence across forks — account state survives fork switches
vm.makePersistent(address account);
vm.makePersistent(address account0, address account1);
vm.makePersistent(address account0, address account1, address account2);
vm.makePersistent(address[] calldata accounts);
vm.revokePersistent(address account);
vm.revokePersistent(address[] calldata accounts);
vm.isPersistent(address account) returns (bool);

// Allow a non-test contract to use cheatcodes on the active fork
vm.allowCheatcodes(address account);
```

---

## 5. External

FFI, environment variables, JSON/TOML parsing.

### FFI
```solidity
vm.ffi(string[] calldata commandInput) returns (bytes memory result);
vm.tryFfi(string[] calldata commandInput) returns (VmSafe.FfiResult memory);
// FfiResult: { int32 exitCode, bytes stdout, bytes stderr }
```

FFI must be enabled: `ffi = true` in `foundry.toml` or `--ffi` flag.

### Environment variables
```solidity
// Required — revert if not set
vm.envBool(string calldata name) returns (bool);
vm.envUint(string calldata name) returns (uint256);
vm.envInt(string calldata name) returns (int256);
vm.envAddress(string calldata name) returns (address);
vm.envBytes32(string calldata name) returns (bytes32);
vm.envString(string calldata name) returns (string memory);
vm.envBytes(string calldata name) returns (bytes memory);

// Arrays — delimiter-separated values
vm.envBool(string calldata name, string calldata delim) returns (bool[] memory);
vm.envUint(string calldata name, string calldata delim) returns (uint256[] memory);
vm.envInt(string calldata name, string calldata delim) returns (int256[] memory);
vm.envAddress(string calldata name, string calldata delim) returns (address[] memory);
vm.envBytes32(string calldata name, string calldata delim) returns (bytes32[] memory);
vm.envString(string calldata name, string calldata delim) returns (string[] memory);
vm.envBytes(string calldata name, string calldata delim) returns (bytes[] memory);

// With default — return default if var not set
vm.envOr(string calldata name, bool defaultValue) returns (bool);
vm.envOr(string calldata name, uint256 defaultValue) returns (uint256);
vm.envOr(string calldata name, int256 defaultValue) returns (int256);
vm.envOr(string calldata name, address defaultValue) returns (address);
vm.envOr(string calldata name, bytes32 defaultValue) returns (bytes32);
vm.envOr(string calldata name, string calldata defaultValue) returns (string memory);
vm.envOr(string calldata name, bytes calldata defaultValue) returns (bytes memory);
```

### JSON
```solidity
// Parse entire JSON to ABI-encoded bytes, then abi.decode
vm.parseJson(string calldata json) returns (bytes memory abiEncodedData);
vm.parseJson(string calldata json, string calldata key) returns (bytes memory abiEncodedData);

// Typed parsing at a JSON key path
vm.parseJsonBool(string calldata json, string calldata key) returns (bool);
vm.parseJsonUint(string calldata json, string calldata key) returns (uint256);
vm.parseJsonInt(string calldata json, string calldata key) returns (int256);
vm.parseJsonAddress(string calldata json, string calldata key) returns (address);
vm.parseJsonString(string calldata json, string calldata key) returns (string memory);
vm.parseJsonBytes(string calldata json, string calldata key) returns (bytes memory);
vm.parseJsonBytes32(string calldata json, string calldata key) returns (bytes32);

// Array variants (append Array to any typed function above)
vm.parseJsonBoolArray(string calldata json, string calldata key) returns (bool[] memory);
vm.parseJsonUintArray(string calldata json, string calldata key) returns (uint256[] memory);
vm.parseJsonIntArray(string calldata json, string calldata key) returns (int256[] memory);
vm.parseJsonAddressArray(string calldata json, string calldata key) returns (address[] memory);
vm.parseJsonStringArray(string calldata json, string calldata key) returns (string[] memory);
vm.parseJsonBytes32Array(string calldata json, string calldata key) returns (bytes32[] memory);

// Get all keys at a path
vm.parseJsonKeys(string calldata json, string calldata key) returns (string[] memory keys);

// Build JSON via serialization (returns accumulated JSON string)
vm.serializeBool(string calldata objectKey, string calldata valueKey, bool value) returns (string memory json);
vm.serializeUint(string calldata objectKey, string calldata valueKey, uint256 value) returns (string memory json);
vm.serializeInt(string calldata objectKey, string calldata valueKey, int256 value) returns (string memory json);
vm.serializeAddress(string calldata objectKey, string calldata valueKey, address value) returns (string memory json);
vm.serializeBytes32(string calldata objectKey, string calldata valueKey, bytes32 value) returns (string memory json);
vm.serializeString(string calldata objectKey, string calldata valueKey, string calldata value) returns (string memory json);
vm.serializeBytes(string calldata objectKey, string calldata valueKey, bytes calldata value) returns (string memory json);
// Array variants exist for all types above (valueKey accepts array)

// Write JSON to file
vm.writeJson(string calldata json, string calldata path);
vm.writeJson(string calldata json, string calldata path, string calldata valueKey);  // write at key
```

### TOML
```solidity
vm.parseToml(string calldata toml) returns (bytes memory abiEncodedData);
vm.parseToml(string calldata toml, string calldata key) returns (bytes memory abiEncodedData);
// Typed parseToml* variants mirror parseJson* — replace parseJson with parseToml
```

---

## 6. Signing

```solidity
// Sign with private key (secp256k1)
vm.sign(uint256 privateKey, bytes32 digest) returns (uint8 v, bytes32 r, bytes32 s);

// Sign with wallet (from vm.createWallet or keystore)
vm.sign(Vm.Wallet memory wallet, bytes32 digest) returns (uint8 v, bytes32 r, bytes32 s);

// Sign with address (requires wallet to be registered)
vm.sign(address signer, bytes32 digest) returns (uint8 v, bytes32 r, bytes32 s);

// P256 / secp256r1
vm.signP256(uint256 privateKey, bytes32 digest) returns (bytes32 r, bytes32 s);

// EIP-7702 delegation
vm.signDelegation(address implementation, uint256 privateKey) returns (Vm.SignedDelegation memory);
vm.attachDelegation(Vm.SignedDelegation memory signedDelegation);
```

---

## 7. Utilities

Address, label, wallet, and type conversion helpers.

```solidity
// Derive address from private key
vm.addr(uint256 privateKey) returns (address);

// Address labels (shown in traces)
vm.label(address account, string calldata newLabel);
vm.getLabel(address account) returns (string memory);

// Wallets
vm.createWallet(string calldata walletLabel) returns (Vm.Wallet memory);
vm.createWallet(uint256 privateKey) returns (Vm.Wallet memory);
vm.createWallet(uint256 privateKey, string calldata walletLabel) returns (Vm.Wallet memory);
// Vm.Wallet: { address addr, uint256 publicKeyX, uint256 publicKeyY, uint256 privateKey }

// Type conversions: any primitive → string
vm.toString(address value) returns (string memory);
vm.toString(bool value) returns (string memory);
vm.toString(uint256 value) returns (string memory);
vm.toString(int256 value) returns (string memory);
vm.toString(bytes32 value) returns (string memory);
vm.toString(bytes memory value) returns (string memory);

// Parse string → primitive
vm.parseAddress(string calldata) returns (address);
vm.parseBool(string calldata) returns (bool);
vm.parseUint(string calldata) returns (uint256);
vm.parseInt(string calldata) returns (int256);
vm.parseBytes32(string calldata) returns (bytes32);
vm.parseBytes(string calldata) returns (bytes memory);

// Randomness (for use in tests — not cryptographically secure)
vm.randomUint() returns (uint256);
vm.randomUint(uint256 min, uint256 max) returns (uint256);
vm.randomAddress() returns (address);
vm.randomBytes(uint256 len) returns (bytes memory);
vm.randomBytes4() returns (bytes4);
vm.randomBytes8() returns (bytes8);

// Bytecode access
vm.getCode(string calldata artifactPath) returns (bytes memory creationBytecode);
vm.getDeployedCode(string calldata artifactPath) returns (bytes memory runtimeBytecode);
// artifactPath format: "ContractName.sol" or "ContractName.sol:ContractName"
```

---

## 8. Files

All file operations are gated by `fs_permissions` in `foundry.toml`.

```solidity
vm.readFile(string calldata path) returns (string memory data);
vm.readFileBinary(string calldata path) returns (bytes memory data);
vm.readLine(string calldata path) returns (string memory line);
vm.writeFile(string calldata path, string calldata data);
vm.writeFileBinary(string calldata path, bytes calldata data);
vm.writeLine(string calldata path, string calldata data);
vm.closeFile(string calldata path);
vm.removeFile(string calldata path);
vm.createDir(string calldata path, bool recursive);
vm.removeDir(string calldata path, bool recursive);
vm.readDir(string calldata path) returns (VmSafe.DirEntry[] memory entries);
vm.readDir(string calldata path, uint64 maxDepth) returns (VmSafe.DirEntry[] memory entries);
vm.readDir(string calldata path, uint64 maxDepth, bool followLinks) returns (VmSafe.DirEntry[] memory entries);
vm.exists(string calldata path) returns (bool);
vm.isFile(string calldata path) returns (bool);
vm.isDir(string calldata path) returns (bool);
vm.fsMetadata(string calldata path) returns (VmSafe.FsMetadata memory);
vm.projectRoot() returns (string memory);
```

---

## 9. RPC

```solidity
vm.rpc(string calldata method, string calldata params) returns (bytes memory data);
vm.rpcUrl(string calldata rpcAlias) returns (string memory);
vm.rpcUrls() returns (string[2][] memory);          // [[alias, url], ...]
vm.rpcUrlStructs() returns (VmSafe.Rpc[] memory);   // { string key, string url }[]
```

---

## 10. State Snapshots

```solidity
// EVM state snapshots
vm.snapshotState() returns (uint256 snapshotId);
vm.revertToState(uint256 snapshotId) returns (bool);             // keeps snapshot
vm.revertToStateAndDelete(uint256 snapshotId) returns (bool);    // removes snapshot
vm.deleteStateSnapshot(uint256 snapshotId) returns (bool);
vm.deleteStateSnapshots();

// Gas snapshots (used with forge snapshot)
vm.startSnapshotGas(string calldata name);
vm.startSnapshotGas(string calldata group, string calldata name);
vm.stopSnapshotGas() returns (uint256 gasUsed);
vm.stopSnapshotGas(string calldata name) returns (uint256 gasUsed);
vm.stopSnapshotGas(string calldata group, string calldata name) returns (uint256 gasUsed);
vm.snapshotGas(string calldata name, uint256 gasUsed);           // record manually
vm.snapshotGas(string calldata group, string calldata name, uint256 gasUsed);
```
