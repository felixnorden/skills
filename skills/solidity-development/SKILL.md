---
name: solidity-development
description: Comprehensive Solidity smart contract development best practices covering security patterns, gas optimization, and professional documentation standards. Use when writing, reviewing, or auditing Solidity smart contracts, or when the user mentions EVM, Ethereum, blockchain development, smart contracts, Solidity, gas optimization, or security audits.
---

# Solidity Development Best Practices

This skill provides production-grade patterns for Solidity smart contract development based on industry-leading implementations from OpenZeppelin and Solady. Apply these practices when developing, reviewing, or auditing smart contracts.

## When to Use This Skill

Activate this knowledge when the user:

- Writes or reviews Solidity smart contracts
- Discusses Ethereum, EVM, or blockchain development
- Mentions gas optimization, security audits, or upgradeable contracts
- References OpenZeppelin, Solady, or standard token implementations
- Asks about smart contract best practices or security patterns

## Core Philosophy: Security, Performance, Documentation

Production smart contract development balances three pillars:

1. **Security First**: Prevent vulnerabilities through proven patterns
2. **Gas Efficiency**: Optimize for user costs and network resources
3. **Clear Documentation**: Enable audits, maintenance, and integrations

The choice between OpenZeppelin (security-first) and Solady (optimization-first) depends on your priorities:

| Priority                         | Recommended Approach   | Rationale                                          |
| -------------------------------- | ---------------------- | -------------------------------------------------- |
| High-value protocols (>$10M TVL) | OpenZeppelin           | Extensive audits, battle-tested security           |
| Layer 2 applications             | Solady                 | 66% deployment cost savings, optimized for scaling |
| Account abstraction              | Solady                 | Minimal gas per operation critical for UX          |
| DeFi protocols (new)             | OpenZeppelin           | Security paramount, gas costs secondary            |
| NFT collections                  | OpenZeppelin or Solady | Depends on mint volume and optimization needs      |

## Critical Security Patterns

### Reentrancy Protection

**Always follow Checks-Effects-Interactions (CEI) pattern:**

```solidity
function withdraw(uint256 amount) external {
    // 1. CHECKS: Validate conditions
    require(balances[msg.sender] >= amount, "Insufficient balance");

    // 2. EFFECTS: Update state BEFORE external calls
    balances[msg.sender] -= amount;

    // 3. INTERACTIONS: External calls last
    (bool success, ) = msg.sender.call{value: amount}("");
    require(success, "Transfer failed");
}
```

**For additional protection, use ReentrancyGuard:**

```solidity
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract SecureVault is ReentrancyGuard {
    function withdraw(uint256 amount) external nonReentrant {
        // State changes and external calls
    }
}
```

**Modern optimization with transient storage (EIP-1153):**

```solidity
// Solady pattern - use transient storage on supported chains
import {ReentrancyGuardTransient} from "solady/utils/ReentrancyGuardTransient.sol";

// Gas-efficient: uses TLOAD/TSTORE instead of SLOAD/SSTORE
// Storage automatically cleared at end of transaction
```

See [security/reentrancy.md](security/reentrancy.md) for comprehensive patterns.

### Access Control

**Single administrator - use Ownable2Step for safety:**

```solidity
import "@openzeppelin/contracts/access/Ownable2Step.sol";

contract MyContract is Ownable2Step {
    constructor(address initialOwner) Ownable(initialOwner) {}

    function criticalFunction() external onlyOwner {
        // Only owner can call
    }
}
```

**Multi-role systems - use AccessControl:**

```solidity
import "@openzeppelin/contracts/access/AccessControl.sol";

contract TokenContract is AccessControl {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

    constructor(address admin) {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
    }

    function mint(address to, uint256 amount) external onlyRole(MINTER_ROLE) {
        _mint(to, amount);
    }
}
```

**Gas-optimized alternative - Solady OwnableRoles:**

```solidity
import {OwnableRoles} from "solady/auth/OwnableRoles.sol";

contract GasEfficientContract is OwnableRoles {
    uint256 public constant MINTER_ROLE = 1 << 0;  // Bitmap: 0b0001
    uint256 public constant PAUSER_ROLE = 1 << 1;  // Bitmap: 0b0010

    function mint(address to, uint256 amount) external onlyRoles(MINTER_ROLE) {
        // 40% cheaper than AccessControl
    }
}
```

See [security/access-control.md](security/access-control.md) for detailed patterns.

### Upgradeable Contract Safety

**Critical: Always disable initializers in implementation constructors:**

```solidity
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

contract MyUpgradeableContract is Initializable, OwnableUpgradeable {
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();  // CRITICAL: Prevents implementation takeover
    }

    function initialize(address initialOwner) public initializer {
        __Ownable_init(initialOwner);
        // Additional initialization
    }
}
```

**Use ERC-7201 namespaced storage to prevent collisions:**

```solidity
/// @custom:storage-location erc7201:myproject.storage.MyContract
struct MyContractStorage {
    uint256 value;
    mapping(address => uint256) balances;
}

// keccak256(abi.encode(uint256(keccak256("myproject.storage.MyContract")) - 1))
// & ~bytes32(uint256(0xff))
bytes32 private constant STORAGE_LOCATION = 0x...;

function _getStorage() private pure returns (MyContractStorage storage $) {
    assembly {
        $.slot := STORAGE_LOCATION
    }
}
```

**UUPS: Implement `_authorizeUpgrade` with access control:**

```solidity
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

contract MyUUPSContract is UUPSUpgradeable, OwnableUpgradeable {
    function _authorizeUpgrade(address newImplementation)
        internal
        override
        onlyOwner
    {
        // Forgetting this function permanently locks the contract
    }
}
```

See [security/upgrades.md](security/upgrades.md) for comprehensive upgrade patterns.

## Gas Optimization Fundamentals

### Custom Errors (Mandatory in 2025)

**Replace require strings with custom errors:**

```solidity
// [BAD] OLD: Expensive string encoding
require(balance >= amount, "Insufficient balance");

// [GOOD] NEW: 4-byte selector only
error InsufficientBalance(uint256 available, uint256 required);

if (balance < amount) {
    revert InsufficientBalance(balance, amount);
}
```

**Solady pattern - minimal selectors:**

```solidity
// Solady style: minimal 4-byte revert
error Unauthorized();  // selector: 0x82b42900

// In assembly for maximum efficiency
assembly {
    mstore(0x00, 0x82b42900)
    revert(0x1c, 0x04)
}
```

### Storage Optimization

**Pack variables to minimize storage slots:**

```solidity
// [BAD] BAD: Uses 3 storage slots (96 bytes)
contract Inefficient {
    uint128 balance;     // Slot 0
    uint64 timestamp;    // Slot 1
    uint64 nonce;        // Slot 2
}

// [GOOD] GOOD: Uses 1 storage slot (32 bytes)
contract Efficient {
    uint128 balance;     // Slot 0 (bytes 0-15)
    uint64 timestamp;    // Slot 0 (bytes 16-23)
    uint64 nonce;        // Slot 0 (bytes 24-31)
}
```

**Struct packing:**

```solidity
struct PackedData {
    address owner;       // 20 bytes
    uint64 timestamp;    // 8 bytes
    uint32 id;           // 4 bytes
    // Total: 32 bytes = 1 slot
}
```

### Function Optimization

**Unchecked arithmetic when overflow impossible:**

```solidity
function processItems(uint256[] calldata items) external {
    uint256 length = items.length;

    // Safe: i cannot overflow uint256
    for (uint256 i = 0; i < length;) {
        // Process items[i]

        unchecked {
            ++i;  // Cheaper than i++
        }
    }
}
```

**Calldata vs memory for external functions:**

```solidity
// [GOOD] GOOD: calldata for read-only parameters
function processData(uint256[] calldata data) external {
    // No copying, direct stack access
}

// [BAD] BAD: memory copies data from calldata
function processData(uint256[] memory data) external {
    // Expensive memory allocation
}
```

### Quantified Gas Savings

Real-world measurements guide optimization priorities:

| Optimization             | Gas Saved          | When to Apply             |
| ------------------------ | ------------------ | ------------------------- |
| Custom errors vs strings | ~50-100 per revert | Always (mandatory 2025)   |
| Unchecked increment      | ~30-40 per loop    | Safe arithmetic only      |
| Calldata vs memory       | ~60 per 32 bytes   | External functions        |
| Storage packing          | 20,000 per slot    | Frequently accessed data  |
| Assembly token transfer  | ~11,000 per call   | High-frequency operations |

See [performance/gas-optimization.md](performance/gas-optimization.md) for comprehensive techniques.

## Assembly Best Practices

**Only use assembly when:**

1. Gas savings justify complexity (typically >10% improvement)
2. Team has expertise to maintain assembly code
3. Operation is well-tested and audited

**Assembly safety checklist:**

```solidity
function safeAssemblyExample(address token, address to, uint256 amount) internal {
    /// @solidity memory-safe-assembly
    assembly {
        // 1. Document memory layout
        // 2. Use well-known patterns
        // 3. Validate return values
        // 4. Handle all edge cases

        mstore(0x00, 0xa9059cbb)  // transfer(address,uint256)
        mstore(0x20, to)
        mstore(0x40, amount)

        let success := call(gas(), token, 0, 0x1c, 0x44, 0x00, 0x20)

        // Validate: success AND (returndata == true OR no returndata)
        if iszero(and(eq(mload(0x00), 1), success)) {
            if iszero(lt(or(iszero(extcodesize(token)), returndatasize()), success)) {
                revert(0x00, 0x04)
            }
        }
    }
}
```

See [performance/solady-patterns.md](performance/solady-patterns.md) for advanced assembly patterns.

## Documentation Standards

### NatSpec Requirements

**Every public/external function must have:**

```solidity
/**
 * @notice User-friendly description of what the function does
 * @dev Technical details for developers implementing/extending
 * @param paramName Description of the parameter
 * @return returnName Description of the return value
 * @custom:security-contact security@example.com
 */
function complexOperation(uint256 paramName)
    external
    returns (uint256 returnName)
{
    // Implementation
}
```

**Contract-level documentation:**

```solidity
/**
 * @title MyContract
 * @author Your Name (yourname@example.com)
 * @notice Brief description for end users
 * @dev Detailed technical documentation
 *
 * @custom:security-contact security@example.com
 * @custom:oz-upgrades Implements UUPS upgrade pattern
 */
contract MyContract {
    // Implementation
}
```

### Common NatSpec Patterns

**Inheritance documentation:**

```solidity
/**
 * @dev See {IERC20-transfer}.
 *
 * Requirements:
 * - `to` cannot be the zero address
 * - caller must have balance >= `amount`
 */
function transfer(address to, uint256 amount) public override returns (bool) {
    // Implementation
}
```

**Warning sections:**

```solidity
/**
 * @notice Withdraws funds from the contract
 *
 * WARNING: This function transfers all contract balance.
 * Only call after verifying the balance is expected.
 *
 * @dev Uses low-level call for transfer to handle gas limits
 */
```

See [documentation/natspec-standards.md](documentation/natspec-standards.md) for comprehensive standards.

## Common Pitfalls to Avoid

### Security

[BAD] **Unprotected initializers**

```solidity
// VULNERABLE: Anyone can initialize
function initialize() public {
    owner = msg.sender;
}
```

[GOOD] **Protected initialization**

```solidity
function initialize() public initializer {
    __Ownable_init(msg.sender);
}
```

[BAD] **Unsafe external calls**

```solidity
// VULNERABLE: State change after external call
(bool success, ) = recipient.call{value: amount}("");
balances[msg.sender] -= amount;
```

[GOOD] **CEI pattern**

```solidity
balances[msg.sender] -= amount;
(bool success, ) = recipient.call{value: amount}("");
```

### Performance

[BAD] **Unbounded loops**

```solidity
// DANGEROUS: Can exceed gas limit
for (uint256 i = 0; i < unboundedArray.length; i++) {
    // Process
}
```

[GOOD] **Bounded iterations with pagination**

```solidity
function processBatch(uint256 start, uint256 end) external {
    require(end - start <= 100, "Batch too large");
    for (uint256 i = start; i < end; i++) {
        // Process
    }
}
```

### Documentation

[BAD] **Missing NatSpec**

```solidity
function transfer(address to, uint256 amount) external returns (bool) {
    // No documentation
}
```

[GOOD] **Complete NatSpec**

```solidity
/**
 * @notice Transfers tokens to recipient
 * @param to Recipient address
 * @param amount Number of tokens to transfer
 * @return success True if transfer succeeded
 */
function transfer(address to, uint256 amount) external returns (bool success) {
    // Implementation
}
```

## Testing Standards

**Minimum test coverage requirements:**

```solidity
// File: test/MyContract.t.sol
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {MyContract} from "../src/MyContract.sol";

contract MyContractTest is Test {
    MyContract public myContract;

    function setUp() public {
        myContract = new MyContract();
    }

    function testNormalOperation() public {
        // Test happy path
    }

    function testRevertConditions() public {
        // Test all revert conditions
        vm.expectRevert(MyContract.Unauthorized.selector);
        myContract.restrictedFunction();
    }

    function testFuzz_InputValidation(uint256 amount) public {
        // Fuzz testing for input validation
    }

    function testInvariant_BalanceConsistency() public {
        // Invariant testing
    }
}
```

**Required test categories:**

1. **Unit tests**: Each function, all branches
2. **Integration tests**: Contract interactions
3. **Fuzz tests**: Input validation, edge cases
4. **Invariant tests**: Protocol invariants
5. **Gas benchmarks**: Performance regression prevention

## Quick Reference: Which Library to Use

### OpenZeppelin

- Building high-value protocols (DeFi, DAOs)
- Team prioritizes security over gas costs
- Extensive documentation and audits required
- Standard token implementations (ERC20, ERC721, ERC1155)
- Upgradeability required (UUPS, Transparent Proxy)

### Solady

- Building Layer 2 applications
- Gas optimization critical (account abstraction, high-frequency operations)
- Team has assembly expertise
- Deploying many instances (factory patterns)
- Already secured through other means (battle-tested patterns)

### Hybrid Approach

```solidity
// Use OpenZeppelin for security-critical access control
import "@openzeppelin/contracts/access/AccessControl.sol";

// Use Solady for gas-sensitive operations
import {SafeTransferLib} from "solady/utils/SafeTransferLib.sol";

contract HybridContract is AccessControl {
    using SafeTransferLib for address;

    function processPayment(address token, address to, uint256 amount)
        external
        onlyRole(PROCESSOR_ROLE)  // OpenZeppelin security
    {
        token.safeTransfer(to, amount);  // Solady efficiency
    }
}
```

## Reference Files

For detailed guidance on specific topics:

- **Security**: [security/reentrancy.md](security/reentrancy.md), [security/access-control.md](security/access-control.md), [security/upgrades.md](security/upgrades.md)
- **Performance**: [performance/gas-optimization.md](performance/gas-optimization.md), [performance/solady-patterns.md](performance/solady-patterns.md)
- **Documentation**: [documentation/natspec-standards.md](documentation/natspec-standards.md)

## Version Compatibility

This skill assumes:

- Solidity 0.8.20+ (or 0.8.24+ for transient storage)
- OpenZeppelin Contracts v5.x
- Solady latest version
- Foundry for testing and development

Always verify compatibility for your specific use case.
