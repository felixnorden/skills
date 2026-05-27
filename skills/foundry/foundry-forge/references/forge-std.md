# Forge Standard Library Reference

Forge Std is the preferred way to write tests and scripts with Foundry.
Full reference: https://www.getfoundry.sh/reference/forge-std/overview
Source: https://github.com/foundry-rs/forge-std

## Contents

- [Imports](#imports) — what to import and from where
- [StdAssertions](#stdassertions) — assertEq, assertLt, assertApproxEqRel, and all overloads
- [StdCheats](#stdcheats) — skip, hoax, deal, bound, makeAddr, deployCode, and more
- [StdStorage](#stdstorage) — read/write contract storage without knowing slot layout
- [StdErrors](#stderrors) — panic selectors for use with vm.expectRevert
- [StdMath](#stdmath) — abs, delta, percentDelta
- [ScriptUtils](#scriptutils) — computeCreateAddress, computeCreate2Address
- [console / console2](#console--console2) — Hardhat-compatible logging
- [Config.sol](#configsol) — multi-chain config management

---

## Imports

```solidity
import {Test} from "forge-std/Test.sol";         // tests — includes everything below
import {Script} from "forge-std/Script.sol";     // scripts — vm + console + ScriptUtils
import {console} from "forge-std/console.sol";   // Hardhat-compatible logging
import {console2} from "forge-std/console2.sol"; // decoded traces (not Hardhat-compatible)
import {Vm} from "forge-std/Vm.sol";             // cheatcodes interface directly
import {Config} from "forge-std/Config.sol";     // multi-chain config management
```

`Test.sol` re-exports: `Vm`, `StdAssertions`, `StdCheats`, `StdConfig`, `StdErrors`,
`StdStorage`, `StdMath`, `ScriptUtils`, `console`, `DSTest`.

---

## StdAssertions

All assertions accept an optional trailing `string memory message` parameter for failure messages.

```solidity
// Boolean
assertTrue(bool condition);
assertTrue(bool condition, string memory message);
assertFalse(bool condition);

// Equality — assertEq supports: uint256, int256, bool, address, bytes32,
//             string, bytes, and their [] array variants
assertEq(T a, T b);
assertEq(T a, T b, string memory message);
assertNotEq(T a, T b);
assertNotEq(T a, T b, string memory message);

// Decimal display — for uint256/int256 with a decimal denominator (e.g. 1e18)
assertEqDecimal(uint256 a, uint256 b, uint256 decimals);
assertEqDecimal(int256 a, int256 b, uint256 decimals);
assertNotEqDecimal(uint256 a, uint256 b, uint256 decimals);
assertNotEqDecimal(int256 a, int256 b, uint256 decimals);

// Ordering — supports uint256 and int256
assertLt(T a, T b);         // a < b
assertLtDecimal(T a, T b, uint256 decimals);
assertGt(T a, T b);         // a > b
assertGtDecimal(T a, T b, uint256 decimals);
assertLe(T a, T b);         // a <= b
assertLeDecimal(T a, T b, uint256 decimals);
assertGe(T a, T b);         // a >= b
assertGeDecimal(T a, T b, uint256 decimals);

// Approximate equality
assertApproxEqAbs(uint256 a, uint256 b, uint256 maxDelta);
assertApproxEqAbs(uint256 a, uint256 b, uint256 maxDelta, string memory message);
assertApproxEqAbsDecimal(uint256 a, uint256 b, uint256 maxDelta, uint256 decimals);

// Relative tolerance — maxPercentDelta in WAD (1e18 = 100%)
assertApproxEqRel(uint256 a, uint256 b, uint256 maxPercentDelta);
assertApproxEqRel(uint256 a, uint256 b, uint256 maxPercentDelta, string memory message);
assertApproxEqRelDecimal(uint256 a, uint256 b, uint256 maxPercentDelta, uint256 decimals);

// Explicit failure
fail(string memory message);
```

---

## StdCheats

Higher-level helpers that wrap raw cheatcodes.

```solidity
// Time helpers
skip(uint256 time);    // vm.warp(block.timestamp + time)
rewind(uint256 time);  // vm.warp(block.timestamp - time)

// Prank + deal combined (sets msg.sender and funds the address)
hoax(address who);
hoax(address who, uint256 give);
hoax(address who, address origin);
hoax(address who, address origin, uint256 give);

startHoax(address who);
startHoax(address who, uint256 give);
startHoax(address who, address origin);
startHoax(address who, address origin, uint256 give);

// ERC-20 deal (uses storage manipulation)
deal(address token, address to, uint256 give);
deal(address token, address to, uint256 give, bool adjust);  // adjust adjusts totalSupply

// Deploy code from artifact
deployCode(string memory what) returns (address);
deployCode(string memory what, bytes memory args) returns (address);
deployCodeTo(string memory what, address where);
deployCodeTo(string memory what, bytes memory args, address where);
deployCodeTo(string memory what, bytes memory args, uint256 value, address where);

// Fuzz helpers
bound(uint256 x, uint256 min, uint256 max) returns (uint256);   // clamp x into [min, max]
bound(int256 x, int256 min, int256 max) returns (int256);

// Prank switching mid-test without stopPrank/startPrank
changePrank(address who);
changePrank(address who, address origin);

// Address generation
makeAddr(string memory name) returns (address addr);
makeAddrAndKey(string memory name) returns (address addr, uint256 privateKey);

// Disable gas metering for a function via modifier
modifier noGasMetering();
```

**`noGasMetering` usage:**
Apply the modifier to a test function when you want to exclude its entire execution from gas snapshots. Useful for tests that exist only to verify correctness, not to measure gas.

```solidity
function test_CorrectnessOnly() public noGasMetering {
    // This test's gas is not recorded in forge snapshot
    vault.complexOperation();
}
```

**`changePrank` context:**
Use `changePrank` when you need to switch `msg.sender` multiple times in a single test without the boilerplate of `stopPrank()` / `startPrank()`. It is equivalent to stopping the current prank and starting a new one in a single call.

```solidity
vm.startPrank(alice);
vault.deposit(1 ether);

// Switch to bob without explicit stop/start
changePrank(bob);
vault.deposit(2 ether);

// Switch back to alice
changePrank(alice);
vault.withdraw(1 ether);

vm.stopPrank();
```

---

## StdStorage

Directly read and write contract storage slots without knowing their layout.

```solidity
// Usage pattern — use the `stdstore` instance provided by Test
using stdStorage for StdStorage;

// Write to storage: find slot matching sig/args, write value
stdstore.target(address).sig("balanceOf(address)").with_key(user).checked_write(1000);

// Read from storage
uint256 slot  = stdstore.target(address).sig(sig).find();
bytes32 value = stdstore.target(address).sig(sig).with_key(key).read_bytes32();
uint256 val   = stdstore.target(address).sig(sig).with_key(key).read_uint();
int256 val    = stdstore.target(address).sig(sig).with_key(key).read_int();
address val   = stdstore.target(address).sig(sig).with_key(key).read_address();
bool val      = stdstore.target(address).sig(sig).with_key(key).read_bool();

// Chaining
stdstore
  .target(contractAddress)   // contract to operate on
  .sig("myMapping(address)") // function signature or bytes4 selector
  .with_key(keyArg)          // mapping key (call multiple times for nested maps)
  .depth(N)                  // struct field offset (0-indexed)
  .checked_write(value);     // write and verify the write worked
```

**`depth(N)` explanation:**
`depth(N)` selects the Nth slot offset within a struct stored at a mapping location. Solidity lays out struct fields sequentially starting from the base slot. `depth(0)` targets the first field, `depth(1)` the second, and so on.

```solidity
struct UserInfo {
    uint256 balance;   // depth(0) — slot offset 0
    uint256 reward;    // depth(1) — slot offset 1
    address vault;     // depth(2) — slot offset 2
}
mapping(address => UserInfo) public userInfo;

// Read the reward field (depth 1) for a specific user
uint256 reward = stdstore
    .target(address(vault))
    .sig("userInfo(address)")
    .with_key(alice)
    .depth(1)
    .read_uint();

// Write the vault address field (depth 2)
stdstore
    .target(address(vault))
    .sig("userInfo(address)")
    .with_key(alice)
    .depth(2)
    .checked_write(address(newVault));
```

---

## StdErrors

Selectors for common Solidity panics — use with `vm.expectRevert`:

```solidity
import {stdError} from "forge-std/StdError.sol"; // or via Test.sol

stdError.assertionError       // 0x01 — assert() failed
stdError.arithmeticError      // 0x11 — overflow/underflow
stdError.divisionError        // 0x12 — division by zero
stdError.enumConversionError  // 0x21 — enum out of range
stdError.encodeStorageError   // 0x22 — bad storage encoding
stdError.popError             // 0x31 — .pop() on empty array
stdError.indexOOBError        // 0x32 — array index out of bounds
stdError.memOverflowError     // 0x41 — memory allocation overflow
stdError.zeroVarError         // 0x51 — zero-initialized function pointer

// Usage
vm.expectRevert(stdError.arithmeticError);
myContract.triggerOverflow();
```

---

## StdMath

```solidity
import {stdMath} from "forge-std/StdMath.sol";  // or via Test.sol

stdMath.abs(int256 a) returns (uint256);
stdMath.delta(uint256 a, uint256 b) returns (uint256);   // |a - b|
stdMath.delta(int256 a, int256 b) returns (uint256);
stdMath.percentDelta(uint256 a, uint256 b) returns (uint256);  // |a-b|/b in WAD
stdMath.percentDelta(int256 a, int256 b) returns (uint256);
```

---

## ScriptUtils (available in both Test and Script)

```solidity
// Compute CREATE address for a deployer at a given nonce
computeCreateAddress(address deployer, uint256 nonce) returns (address);

// Compute CREATE2 address
computeCreate2Address(bytes32 salt, bytes32 initcodeHash) returns (address);
computeCreate2Address(bytes32 salt, bytes32 initcodeHash, address deployer) returns (address);
```

---

## console / console2

Hardhat-compatible logging. Output appears at `-vv` and above.

```solidity
console.log(string memory message);
console.log(string memory message, uint256 value);
console.log(string memory message, address value);
console.log(string memory message, bool value);
console.log(uint256 value);
console.log(address value);
console.log(bool value);
// console.logInt, console.logBytes, console.logBytes32 also available
```

`console2` is identical but produces decoded traces. Do not use `console2` in contracts
that will be tested with Hardhat (it is not compatible).

---

## Config.sol — multi-chain config management

```solidity
import {Config} from "forge-std/Config.sol";

// Read a value from the active chain's config section in foundry.toml
// Config reads from [rpc_endpoints] and [profile.<name>] by chainId
string memory url = Config.getRpcUrl("mainnet");
```
