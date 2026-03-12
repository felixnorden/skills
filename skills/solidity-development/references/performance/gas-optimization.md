# Gas Optimization Techniques

## Contents

- [Gas Cost Fundamentals](#gas-cost-fundamentals)
  - [EVM Operation Costs](#evm-operation-costs)
- [Custom Errors (Mandatory 2025)](#custom-errors-mandatory-2025)
  - [Gas Comparison](#gas-comparison)
  - [Best Practices](#best-practices)
- [Storage Optimization](#storage-optimization)
  - [Variable Packing](#variable-packing)
  - [Struct Packing](#struct-packing)
  - [Storage vs Memory vs Calldata](#storage-vs-memory-vs-calldata)
- [Loop Optimization](#loop-optimization)
  - [Unchecked Arithmetic](#unchecked-arithmetic)
  - [Loop Patterns](#loop-patterns)
- [Function Optimization](#function-optimization)
  - [Function Selector Optimization](#function-selector-optimization)
  - [Visibility Modifiers](#visibility-modifiers)
  - [Short-Circuit Evaluation](#short-circuit-evaluation)
- [Mapping Optimizations](#mapping-optimizations)
  - [Nested Mappings vs Structs](#nested-mappings-vs-structs)
  - [Existence Checks](#existence-checks)
- [Assembly Optimization](#assembly-optimization)
  - [Safe Assembly Patterns](#safe-assembly-patterns)
  - [Common Assembly Optimizations](#common-assembly-optimizations)
- [Advanced Techniques](#advanced-techniques)
  - [Transient Storage (EIP-1153)](#transient-storage-eip-1153)
  - [Bitmap Storage](#bitmap-storage)
  - [Batch Operations](#batch-operations)
  - [Immutable Variables](#immutable-variables)
- [Real-World Gas Benchmarks](#real-world-gas-benchmarks)
  - [ERC20 Comparisons](#erc20-comparisons)
  - [Common Operations](#common-operations)
- [Optimization Checklist](#optimization-checklist)
- [Best Practices](#best-practices)
- [Testing Gas Costs](#testing-gas-costs)
  - [Foundry Gas Snapshots](#foundry-gas-snapshots)
  - [Gas Profiling](#gas-profiling)
- [When NOT to Optimize](#when-not-to-optimize)
- [References](#references)

Gas optimization reduces transaction costs for users and enables more complex operations within block gas limits. This guide provides quantified strategies based on production measurements from OpenZeppelin and Solady.

## Gas Cost Fundamentals

### EVM Operation Costs (as of 2025)

| Operation | Gas Cost | Notes |
|-----------|----------|-------|
| SLOAD (cold) | 2,100 | First access to storage slot |
| SLOAD (warm) | 100 | Subsequent access to same slot |
| SSTORE (zero→non-zero) | 20,000 | Most expensive storage operation |
| SSTORE (non-zero→non-zero) | 5,000 | Updating existing storage |
| SSTORE (non-zero→zero) | -15,000 refund | Gas refund (capped at 20% of tx gas) |
| TLOAD | ~5 | Transient storage load (EIP-1153) |
| TSTORE | ~20 | Transient storage store (EIP-1153) |
| CALL (cold) | 2,600 | First call to address |
| CALL (warm) | 100 | Subsequent calls to same address |
| Memory expansion | 3 + bytes²/512 | Non-linear growth |

## Custom Errors (Mandatory 2025)

**Replace all `require` strings with custom errors.**

### Gas Comparison

```solidity
// [BAD] EXPENSIVE: String encoding
require(balance >= amount, "Insufficient balance");  // ~50-100 gas overhead

// [GOOD] EFFICIENT: Custom error (4-byte selector only)
error InsufficientBalance(uint256 available, uint256 required);
if (balance < amount) {
    revert InsufficientBalance(balance, amount);  // ~20 gas overhead
}
```

### Best Practices

```solidity
// Descriptive errors with parameters
error TransferFailed(address from, address to, uint256 amount);
error UnauthorizedAccess(address caller, bytes32 requiredRole);
error InvalidParameter(string parameter, uint256 value);

// Minimal errors for gas-critical code
error Unauthorized();  // Just 4 bytes: 0x82b42900
error InvalidInput();
error TransferFailed();

// Solidity 0.8.26+: Error definitions shared across files
// errors.sol
error InsufficientBalance(uint256 available, uint256 required);

// contract.sol
import {InsufficientBalance} from "./errors.sol";
```

**Savings: 50-100 gas per revert**

## Storage Optimization

### Variable Packing

**Pack variables to minimize storage slots (32 bytes each).**

```solidity
// [BAD] INEFFICIENT: 3 storage slots (96 bytes)
contract Inefficient {
    uint128 a;        // Slot 0: [a________][________]
    uint128 b;        // Slot 1: [b________][________]
    uint256 c;        // Slot 2: [c________________]
}
// Total: 3 SSTORE operations (60,000+ gas)

// [GOOD] EFFICIENT: 2 storage slots (64 bytes)
contract Efficient {
    uint128 a;        // Slot 0: [a________][b________]
    uint128 b;        // Slot 0
    uint256 c;        // Slot 1: [c________________]
}
// Total: 2 SSTORE operations (40,000 gas)
// Savings: 20,000 gas
```

### Struct Packing

```solidity
// [BAD] INEFFICIENT: 4 slots
struct User {
    address wallet;      // Slot 0: 20 bytes + 12 bytes unused
    uint256 balance;     // Slot 1: 32 bytes
    uint64 lastUpdate;   // Slot 2: 8 bytes + 24 bytes unused
    bool active;         // Slot 3: 1 byte + 31 bytes unused
}

// [GOOD] EFFICIENT: 2 slots
struct User {
    address wallet;      // Slot 0: 20 bytes
    uint64 lastUpdate;   // Slot 0: 8 bytes (28/32 used)
    uint32 id;           // Slot 0: 4 bytes (32/32 used)
    uint256 balance;     // Slot 1: 32 bytes
    bool active;         // Stored separately if rarely accessed
}
```

**Packing Guidelines:**
- Place smaller types together
- Group frequently accessed variables
- Keep mappings and arrays in separate slots (they compute their own storage)

### Storage vs Memory vs Calldata

```solidity
// STORAGE: Persistent, expensive
uint256[] public items;  // 2,100 gas per SLOAD

// MEMORY: Temporary, moderate cost
function processItems(uint256[] memory items) internal {
    // Allocates memory, cheaper than storage
    uint256[] memory temp = new uint256[](10);
}

// CALLDATA: Read-only, cheapest
function processItems(uint256[] calldata items) external {
    // No copying, direct access to transaction data
    // ~60 gas cheaper per 32 bytes vs memory
}
```

**Best Practice:**
- **External functions**: Use `calldata` for read-only arrays/structs
- **Internal functions**: Use `memory` when modifying data
- **Never** pass large arrays in storage references

## Loop Optimization

### Unchecked Arithmetic

```solidity
// [BAD] EXPENSIVE: Overflow checks in every iteration
function sum(uint256[] calldata values) external pure returns (uint256 total) {
    for (uint256 i = 0; i < values.length; i++) {
        total += values[i];
    }
}

// [GOOD] EFFICIENT: Unchecked when safe
function sum(uint256[] calldata values) external pure returns (uint256 total) {
    uint256 length = values.length;  // Cache length
    
    for (uint256 i = 0; i < length;) {
        total += values[i];
        
        unchecked {
            ++i;  // Cheaper than i++, cannot overflow
        }
    }
}
```

**Savings: ~30-40 gas per iteration**

### Loop Patterns

```solidity
// Cache array length outside loop
uint256 length = array.length;
for (uint256 i = 0; i < length;) {
    // Loop body
    unchecked { ++i; }
}

// Reverse iteration (sometimes more efficient)
for (uint256 i = array.length; i > 0;) {
    unchecked { --i; }
    // Use array[i]
}

// Break early when possible
for (uint256 i = 0; i < length;) {
    if (condition) break;  // Saves gas on remaining iterations
    unchecked { ++i; }
}
```

## Function Optimization

### Function Selector Optimization

Function selectors are the first 4 bytes of `keccak256(functionSignature)`. **Lower selectors cost less gas.**

```solidity
// Solady pattern: Optimize hot path function selectors
// withdraw() selector: 0x3ccfd60b (starts with 0x3c)
// deposit() selector: 0xd0e30db0 (starts with 0xd0)
// deposit() is ~22 gas cheaper due to lower selector

// Generate optimized names with tools
// Example: "withdraw_2c1f" has selector 0x00000001
```

**Savings: Up to 22 gas per call for frequently used functions**

### Visibility Modifiers

```solidity
// [GOOD] MOST EFFICIENT: private/internal (no external call overhead)
function _internalHelper() private pure returns (uint256) {
    return 42;
}

// [WARNING] MODERATE: external (calldata, no memory copying)
function externalFunction(uint256[] calldata data) external {
    // Cheaper for large arrays
}

// [BAD] EXPENSIVE: public (creates external+internal interfaces)
function publicFunction(uint256[] memory data) public {
    // Both external and internal call paths
}
```

### Short-Circuit Evaluation

```solidity
// [GOOD] EFFICIENT: Cheapest checks first
if (msg.sender != owner || balance < amount || !isActive) {
    revert Unauthorized();
}

// [BAD] INEFFICIENT: Expensive check first
if (expensiveStateCheck() || msg.sender != owner) {
    revert Unauthorized();
}
```

## Mapping Optimizations

### Nested Mappings vs Structs

```solidity
// [BAD] LESS EFFICIENT: Struct with multiple fields
struct UserData {
    uint256 balance;
    uint256 lastUpdate;
    bool active;
}
mapping(address => UserData) public users;

// [GOOD] MORE EFFICIENT: Separate mappings (if fields rarely accessed together)
mapping(address => uint256) public balances;
mapping(address => uint256) public lastUpdate;
mapping(address => bool) public active;
```

**Trade-off**: Separate mappings save gas when fields accessed independently, but use more storage slots.

### Existence Checks

```solidity
// [BAD] EXPENSIVE: Double storage access
if (balances[user] != 0) {
    uint256 balance = balances[user];  // Second SLOAD
}

// [GOOD] EFFICIENT: Single storage access
uint256 balance = balances[user];
if (balance != 0) {
    // Use balance
}
```

## Assembly Optimization

### Safe Assembly Patterns

```solidity
function efficientTransfer(address token, address to, uint256 amount) internal {
    /// @solidity memory-safe-assembly
    assembly {
        // Use scratch space (0x00-0x3f) instead of free memory pointer
        mstore(0x00, 0xa9059cbb)  // transfer(address,uint256) selector
        mstore(0x20, to)
        mstore(0x40, amount)
        
        // call(gas, address, value, argsOffset, argsSize, retOffset, retSize)
        let success := call(gas(), token, 0, 0x1c, 0x44, 0x00, 0x20)
        
        // Check return value
        if iszero(and(eq(mload(0x00), 1), success)) {
            revert(0, 0)
        }
    }
}
```

### Common Assembly Optimizations

```solidity
// returndatasize() == 0 before external calls (cheaper than PUSH1 0)
assembly {
    let success := call(gas(), target, 0, 0, 0, 0, returndatasize())
}

// Self-address without CALLER
assembly {
    let self := address()
}

// Efficient zero-check
assembly {
    if iszero(value) {
        revert(0, 0)
    }
}

// Bit manipulation
assembly {
    // Check if bit is set
    let isSet := and(shr(bitPosition, value), 1)
    
    // Set bit
    value := or(value, shl(bitPosition, 1))
    
    // Clear bit
    value := and(value, not(shl(bitPosition, 1)))
}
```

**Savings: 10-50% depending on operation**

## Advanced Techniques

### Transient Storage (EIP-1153)

```solidity
// Solidity 0.8.24+
contract TransientExample {
    // Transient storage automatically cleared after transaction
    function useTransient() external {
        assembly {
            // TSTORE: ~20 gas vs SSTORE: 20,000 gas
            tstore(0, 1)
            
            // TLOAD: ~5 gas vs SLOAD: 2,100 gas
            let value := tload(0)
        }
    }
}
```

**Use cases:**
- Reentrancy guards
- Temporary state within transaction
- Cross-function communication

**Savings: ~95% compared to persistent storage**

### Bitmap Storage

```solidity
// Store 256 boolean flags in single uint256
contract BitmapExample {
    uint256 private flags;
    
    function setFlag(uint8 index) external {
        // Set bit at position
        flags |= (1 << index);
    }
    
    function clearFlag(uint8 index) external {
        // Clear bit at position
        flags &= ~(1 << index);
    }
    
    function hasFlag(uint8 index) external view returns (bool) {
        // Check bit at position
        return (flags & (1 << index)) != 0;
    }
}
```

**Savings: 256 boolean values in 1 storage slot vs 256 slots**

### Batch Operations

```solidity
// [BAD] INEFFICIENT: Individual transactions
function mint(address to, uint256 amount) external {
    _mint(to, amount);
}

// [GOOD] EFFICIENT: Batch operation
function batchMint(address[] calldata recipients, uint256[] calldata amounts) 
    external 
{
    require(recipients.length == amounts.length, "Length mismatch");
    
    uint256 length = recipients.length;
    for (uint256 i = 0; i < length;) {
        _mint(recipients[i], amounts[i]);
        unchecked { ++i; }
    }
}
```

**Savings: ~21,000 gas per transaction in batch (transaction overhead)**

### Immutable Variables

```solidity
// [BAD] EXPENSIVE: Storage variable (2,100 gas per read)
address public owner;

// [GOOD] EFFICIENT: Immutable (copied into bytecode, ~20 gas)
address public immutable owner;

constructor(address _owner) {
    owner = _owner;  // Set once at deployment
}
```

**Savings: ~2,000 gas per read**

## Real-World Gas Benchmarks

### ERC20 Comparisons

| Operation | OpenZeppelin | Solady | Savings |
|-----------|-------------|--------|---------|
| Deploy | ~1,500,000 | ~500,000 | **66%** |
| Transfer | ~51,000 | ~40,000 | **22%** |
| Approve | ~46,000 | ~36,000 | **22%** |
| TransferFrom | ~54,000 | ~43,000 | **20%** |

### Common Operations

| Optimization | Before | After | Savings |
|-------------|--------|-------|---------|
| Custom error vs string | ~24,576 | ~163 | **99%** |
| Calldata vs memory (256 bytes) | ~2,000 | ~1,280 | **36%** |
| Unchecked increment | ~43 | ~13 | **70%** |
| Storage packing (3→2 slots) | ~45,000 | ~25,000 | **44%** |
| Immutable vs storage read | ~2,100 | ~20 | **99%** |

## Optimization Checklist

**High Impact (>100 gas per operation):**
- [ ] Replace `require` strings with custom errors
- [ ] Pack storage variables efficiently
- [ ] Use `calldata` for external function parameters
- [ ] Cache array lengths in loops
- [ ] Use `unchecked` for safe arithmetic

**Medium Impact (20-100 gas):**
- [ ] Use `++i` instead of `i++` in loops
- [ ] Optimize function selectors for hot paths
- [ ] Batch operations instead of individual transactions
- [ ] Use immutable for deployment-set constants
- [ ] Short-circuit boolean expressions

**Low Impact (<20 gas, high complexity):**
- [ ] Assembly optimization for critical paths
- [ ] Transient storage for temporary state
- [ ] Bitmap storage for boolean flags
- [ ] Manual memory management

## Best Practices

1. **Measure before optimizing**: Use Foundry gas snapshots
2. **Optimize hot paths first**: Functions called most frequently
3. **Balance complexity vs savings**: Assembly saves gas but increases audit costs
4. **Document optimizations**: Explain non-obvious patterns
5. **Test thoroughly**: Optimizations shouldn't break functionality
6. **Consider L2s**: Some optimizations matter less on cheaper chains

## Testing Gas Costs

### Foundry Gas Snapshots

```solidity
// test/Gas.t.sol
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";

contract GasTest is Test {
    function testTransferGas() public {
        uint256 gasBefore = gasleft();
        token.transfer(recipient, amount);
        uint256 gasUsed = gasBefore - gasleft();
        
        // Assert gas usage within expected range
        assertLt(gasUsed, 50000, "Transfer too expensive");
    }
    
    // Generate gas snapshot
    // forge snapshot --match-path test/Gas.t.sol
}
```

### Gas Profiling

```bash
# Profile gas usage
forge test --gas-report

# Compare snapshots
forge snapshot --diff .gas-snapshot

# Identify expensive operations
forge test --debug testFunction
```

## When NOT to Optimize

**Avoid premature optimization:**
- Contracts deployed once (factories, registries)
- Low-frequency operations (annual governance votes)
- Code clarity significantly reduced
- Security risks introduced

**L2 Considerations:**
- Optimism/Arbitrum: L2 execution cheap, L1 data expensive
- Focus on calldata size reduction
- zkEVM: Different cost model, some optimizations irrelevant

## References

- [Solidity Gas Optimization Tips](https://coinsbench.com/solidity-gas-optimization-tips-6b2a8c34e1d8)
- [Solady Gas Benchmarks](https://github.com/Vectorized/solady)
- [EIP-1153: Transient Storage](https://eips.ethereum.org/EIPS/eip-1153)
- [Yieldoor Gas Optimization](https://dacian.me/the-yieldoor-gas-optimizoor)
