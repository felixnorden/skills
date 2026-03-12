# Upgradeable Contract Security

## Contents

- [Understanding Proxy Patterns](#understanding-proxy-patterns)
  - [How Proxies Work](#how-proxies-work)
  - [Common Proxy Patterns](#common-proxy-patterns)
- [UUPS (Universal Upgradeable Proxy Standard)](#uups-universal-upgradeable-proxy-standard)
  - [Basic UUPS Implementation](#basic-uups-implementation)
  - [Deployment Pattern](#deployment-pattern)
- [Critical Security Requirements](#critical-security-requirements)
  - [1. Disable Implementation Initializers](#1-disable-implementation-initializers)
  - [2. Implement _authorizeUpgrade](#2-implement-_authorizeupgrade)
  - [3. Storage Layout Preservation](#3-storage-layout-preservation)
  - [4. ERC-7201 Namespaced Storage](#4-erc-7201-namespaced-storage)
- [Initialization Patterns](#initialization-patterns)
  - [Single Initialization](#single-initialization)
  - [Reinitializer for Upgrades](#reinitializer-for-upgrades)
  - [Initializer Chain](#initializer-chain)
- [Transparent Proxy Pattern](#transparent-proxy-pattern)
- [Advanced Patterns](#advanced-patterns)
  - [Multi-Step Upgrades](#multi-step-upgrades)
  - [Version Tracking](#version-tracking)
  - [Emergency Pause on Upgrade](#emergency-pause-on-upgrade)
- [Testing Upgradeable Contracts](#testing-upgradeable-contracts)
- [Common Pitfalls & Solutions](#common-pitfalls--solutions)
- [Best Practices Summary](#best-practices-summary)
- [Upgrade Checklist](#upgrade-checklist)
- [References](#references)

Upgradeable contracts enable bug fixes and feature additions without migrating state to new contracts. However, they introduce complex security considerations around initialization, storage layout, and upgrade authorization.

## Understanding Proxy Patterns

### How Proxies Work

```
User Transaction
       ↓
   Proxy Contract (holds state)
       ↓ delegatecall
Implementation Contract (holds logic)
```

**delegatecall** executes implementation logic in proxy's storage context:
- Storage modifications affect **proxy contract**
- `msg.sender` and `msg.value` preserved from original call
- Implementation can be swapped while preserving state

### Common Proxy Patterns

| Pattern | Upgrade Control | Gas Cost | Complexity |
|---------|----------------|----------|------------|
| **Transparent Proxy** | Admin-controlled | Medium | Low |
| **UUPS** | Implementation-controlled | Low | Medium |
| **Beacon Proxy** | Shared implementation | Medium | High |
| **Diamond (EIP-2535)** | Facet-based upgrades | High | Very High |

## UUPS (Universal Upgradeable Proxy Standard)

**Recommended pattern** for most use cases - lower gas costs and cleaner separation.

### Basic UUPS Implementation

```solidity
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

contract MyUpgradeableContract is 
    Initializable, 
    UUPSUpgradeable, 
    OwnableUpgradeable 
{
    uint256 public value;
    
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();  // CRITICAL: Prevents implementation takeover
    }
    
    function initialize(address initialOwner) public initializer {
        __Ownable_init(initialOwner);
        __UUPSUpgradeable_init();
        value = 42;
    }
    
    function setValue(uint256 newValue) external onlyOwner {
        value = newValue;
    }
    
    // CRITICAL: Must implement to enable upgrades
    function _authorizeUpgrade(address newImplementation) 
        internal 
        override 
        onlyOwner 
    {
        // Additional validation if needed
    }
    
    function getImplementation() external view returns (address) {
        return _getImplementation();
    }
}
```

### Deployment Pattern

```solidity
import "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";

// 1. Deploy implementation
MyUpgradeableContract implementation = new MyUpgradeableContract();

// 2. Encode initialization call
bytes memory data = abi.encodeWithSelector(
    MyUpgradeableContract.initialize.selector,
    msg.sender  // initialOwner
);

// 3. Deploy proxy pointing to implementation
ERC1967Proxy proxy = new ERC1967Proxy(
    address(implementation),
    data
);

// 4. Interact through proxy
MyUpgradeableContract instance = MyUpgradeableContract(address(proxy));
```

## Critical Security Requirements

### 1. Disable Implementation Initializers

**Problem:** Unprotected implementation contracts can be initialized by attackers, potentially calling `selfdestruct` and bricking all proxies.

**Historical Vulnerability:** September 2021 - OpenZeppelin v4.1.0-4.3.1

```solidity
// [BAD] VULNERABLE: Implementation can be initialized
contract Vulnerable is Initializable {
    function initialize() public initializer {
        // Attacker can call this on implementation
    }
}

// [GOOD] SECURE: Implementation initialization disabled
contract Secure is Initializable {
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();  // Locks implementation permanently
    }
    
    function initialize() public initializer {
        // Can only be called on proxy
    }
}
```

### 2. Implement _authorizeUpgrade

**Forgetting this function permanently locks the contract.**

```solidity
// [BAD] DANGEROUS: Missing _authorizeUpgrade
contract LockedContract is UUPSUpgradeable {
    // No _authorizeUpgrade implementation
    // Upgrades permanently disabled!
}

// [GOOD] CORRECT: Proper authorization
contract UpgradeableContract is UUPSUpgradeable, OwnableUpgradeable {
    function _authorizeUpgrade(address newImplementation) 
        internal 
        override 
        onlyOwner 
    {
        // Optional: Add implementation validation
        require(newImplementation != address(0), "Invalid implementation");
    }
}
```

### 3. Storage Layout Preservation

**Violating storage layout in upgrades causes catastrophic data corruption.**

#### Safe Storage Evolution

```solidity
// V1 - Initial implementation
contract MyContractV1 {
    uint256 public value;           // Slot 0
    address public owner;           // Slot 1
    mapping(address => uint256) public balances;  // Slot 2
}

// [GOOD] V2 - Safe: Appending new storage
contract MyContractV2 {
    uint256 public value;           // Slot 0 (unchanged)
    address public owner;           // Slot 1 (unchanged)
    mapping(address => uint256) public balances;  // Slot 2 (unchanged)
    
    // NEW: Appended at end
    uint256 public newValue;        // Slot 3 (safe)
    address public newOwner;        // Slot 4 (safe)
}

// [BAD] V2 - DANGEROUS: Inserting or reordering
contract MyContractV2Broken {
    uint256 public newValue;        // Slot 0 (CORRUPTS value!)
    uint256 public value;           // Slot 1 (CORRUPTS owner!)
    address public owner;           // Slot 2 (CORRUPTS balances!)
    mapping(address => uint256) public balances;  // Slot 3
}
```

#### Deletion is Forbidden

```solidity
// V1
contract MyContractV1 {
    uint256 public value;
    address public owner;
}

// [BAD] V2 - DANGEROUS: Removed variable
contract MyContractV2 {
    uint256 public value;
    // owner removed - storage corrupted!
}

// [GOOD] V2 - Safe: Keep variable, mark unused
contract MyContractV2Safe {
    uint256 public value;
    address private __deprecated_owner;  // Preserves storage layout
}
```

### 4. ERC-7201 Namespaced Storage

**Prevents storage collisions** between contract and inherited dependencies.

```solidity
/// @custom:storage-location erc7201:myproject.storage.MyContract
struct MyContractStorage {
    uint256 value;
    address owner;
    mapping(address => uint256) balances;
}

contract MyContract is Initializable {
    // Slot calculation:
    // keccak256(abi.encode(uint256(keccak256("myproject.storage.MyContract")) - 1)) 
    // & ~bytes32(uint256(0xff))
    bytes32 private constant STORAGE_LOCATION =
        0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcd00;
    
    function _getStorage() 
        private 
        pure 
        returns (MyContractStorage storage $) 
    {
        assembly {
            $.slot := STORAGE_LOCATION
        }
    }
    
    function setValue(uint256 newValue) external {
        MyContractStorage storage $ = _getStorage();
        $.value = newValue;
    }
    
    function getValue() external view returns (uint256) {
        MyContractStorage storage $ = _getStorage();
        return $.value;
    }
}
```

**Benefits:**
- **Collision-free** - Namespace isolated from inherited contracts
- **Upgrade-safe** - Adding dependencies won't corrupt storage
- **Future-proof** - OpenZeppelin v5+ standard

## Initialization Patterns

### Single Initialization

```solidity
contract MyContract is Initializable {
    uint256 public value;
    
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }
    
    function initialize(uint256 initialValue) public initializer {
        value = initialValue;
    }
}
```

### Reinitializer for Upgrades

```solidity
contract MyContractV2 is Initializable {
    uint256 public value;
    uint256 public newValue;
    
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }
    
    // V1 initialization
    function initialize(uint256 initialValue) public initializer {
        value = initialValue;
    }
    
    // V2 initialization - only callable once on upgrade
    function initializeV2(uint256 initialNewValue) public reinitializer(2) {
        newValue = initialNewValue;
    }
}
```

### Initializer Chain

```solidity
contract MyContract is 
    Initializable,
    OwnableUpgradeable,
    PausableUpgradeable,
    ReentrancyGuardUpgradeable
{
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }
    
    function initialize(address initialOwner) public initializer {
        __Ownable_init(initialOwner);       // Calls __Context_init_unchained
        __Pausable_init();                   // Calls __Pausable_init_unchained
        __ReentrancyGuard_init();           // Calls __ReentrancyGuard_init_unchained
    }
}
```

## Transparent Proxy Pattern

**Alternative when implementation shouldn't control upgrades.**

```solidity
import "@openzeppelin/contracts/proxy/transparent/TransparentUpgradeableProxy.sol";
import "@openzeppelin/contracts/proxy/transparent/ProxyAdmin.sol";

// Deployment
ProxyAdmin admin = new ProxyAdmin(msg.sender);

MyContract implementation = new MyContract();

bytes memory data = abi.encodeWithSelector(
    MyContract.initialize.selector,
    initialOwner
);

TransparentUpgradeableProxy proxy = new TransparentUpgradeableProxy(
    address(implementation),
    address(admin),
    data
);

// Upgrade
admin.upgradeAndCall(
    ITransparentUpgradeableProxy(address(proxy)),
    address(newImplementation),
    upgradeData
);
```

**Differences from UUPS:**
- **ProxyAdmin contract** controls upgrades (not implementation)
- **Higher gas costs** due to admin check on every call
- **Simpler implementation** - no `_authorizeUpgrade` needed
- **Better for** contracts where implementation shouldn't control upgrades

## Advanced Patterns

### Multi-Step Upgrades

```solidity
contract SafeUpgrade is UUPSUpgradeable, OwnableUpgradeable {
    address public pendingImplementation;
    uint256 public upgradeTimestamp;
    uint256 public constant UPGRADE_DELAY = 2 days;
    
    function proposeUpgrade(address newImplementation) external onlyOwner {
        require(newImplementation != address(0), "Invalid implementation");
        
        pendingImplementation = newImplementation;
        upgradeTimestamp = block.timestamp + UPGRADE_DELAY;
        
        emit UpgradeProposed(newImplementation, upgradeTimestamp);
    }
    
    function _authorizeUpgrade(address newImplementation) 
        internal 
        override 
        onlyOwner 
    {
        require(newImplementation == pendingImplementation, "Not proposed");
        require(block.timestamp >= upgradeTimestamp, "Timelock active");
        
        delete pendingImplementation;
        delete upgradeTimestamp;
    }
    
    function cancelUpgrade() external onlyOwner {
        delete pendingImplementation;
        delete upgradeTimestamp;
        
        emit UpgradeCancelled();
    }
}
```

### Version Tracking

```solidity
contract VersionedContract is UUPSUpgradeable {
    uint256 public version;
    
    function initialize() public initializer {
        version = 1;
    }
    
    function initializeV2() public reinitializer(2) {
        version = 2;
        // V2 specific initialization
    }
    
    function getVersion() external view returns (uint256) {
        return version;
    }
}
```

### Emergency Pause on Upgrade

```solidity
contract PausableUpgrade is 
    UUPSUpgradeable, 
    PausableUpgradeable,
    OwnableUpgradeable 
{
    function _authorizeUpgrade(address newImplementation) 
        internal 
        override 
        onlyOwner 
    {
        // Automatically pause during upgrade
        _pause();
    }
    
    function resumeAfterUpgrade() external onlyOwner whenPaused {
        // Verify upgrade successful
        require(_getImplementation() != address(0), "Invalid implementation");
        _unpause();
    }
}
```

## Testing Upgradeable Contracts

### Foundry Upgrade Tests

```solidity
// test/Upgrade.t.sol
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {ERC1967Proxy} from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import {MyContractV1} from "../src/MyContractV1.sol";
import {MyContractV2} from "../src/MyContractV2.sol";

contract UpgradeTest is Test {
    MyContractV1 public implementationV1;
    MyContractV2 public implementationV2;
    ERC1967Proxy public proxy;
    MyContractV1 public wrappedProxy;
    
    address public owner = address(1);
    
    function setUp() public {
        // Deploy V1
        implementationV1 = new MyContractV1();
        
        bytes memory data = abi.encodeWithSelector(
            MyContractV1.initialize.selector,
            owner
        );
        
        proxy = new ERC1967Proxy(address(implementationV1), data);
        wrappedProxy = MyContractV1(address(proxy));
    }
    
    function testUpgradeToV2() public {
        // Set value in V1
        vm.prank(owner);
        wrappedProxy.setValue(42);
        
        // Deploy V2
        implementationV2 = new MyContractV2();
        
        // Upgrade
        vm.prank(owner);
        wrappedProxy.upgradeToAndCall(
            address(implementationV2),
            abi.encodeWithSelector(MyContractV2.initializeV2.selector, 100)
        );
        
        // Verify storage preserved
        MyContractV2 wrappedProxyV2 = MyContractV2(address(proxy));
        assertEq(wrappedProxyV2.value(), 42, "Storage corrupted");
        assertEq(wrappedProxyV2.newValue(), 100, "New storage not set");
    }
    
    function testStorageLayout() public {
        vm.prank(owner);
        wrappedProxy.setValue(42);
        
        // Check storage slot directly
        bytes32 slot0 = vm.load(address(proxy), bytes32(uint256(0)));
        assertEq(uint256(slot0), 42, "Storage slot mismatch");
    }
}
```

## Common Pitfalls & Solutions

### Pitfall 1: Unprotected Implementation

```solidity
// [BAD] VULNERABLE
contract Vulnerable is Initializable {
    function initialize() public initializer {
        // Attacker can initialize implementation
    }
}

// [GOOD] SECURE
contract Secure is Initializable {
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }
}
```

### Pitfall 2: Storage Corruption

```solidity
// V1
contract V1 {
    uint256 public a;
    uint256 public b;
}

// [BAD] V2 - Corrupted
contract V2 {
    uint256 public b;  // Now in slot 0, corrupts 'a'
    uint256 public c;  // Now in slot 1, corrupts 'b'
}

// [GOOD] V2 - Correct
contract V2 {
    uint256 public a;  // Slot 0 preserved
    uint256 public b;  // Slot 1 preserved
    uint256 public c;  // Slot 2 new variable
}
```

### Pitfall 3: Constructor State

```solidity
// [BAD] WRONG: Constructor state not preserved in proxy
contract Wrong {
    uint256 public immutable x;
    
    constructor() {
        x = 42;  // Only set in implementation, not proxy
    }
}

// [GOOD] CORRECT: Initialize in initializer
contract Correct is Initializable {
    uint256 public x;
    
    function initialize() public initializer {
        x = 42;  // Set in proxy storage
    }
}
```

## Best Practices Summary

1. **Always disable implementation initializers** with `_disableInitializers()`
2. **Implement _authorizeUpgrade** with proper access control
3. **Never modify existing storage layout** - only append
4. **Use ERC-7201 namespaced storage** for collision prevention
5. **Test upgrades thoroughly** - verify storage preservation
6. **Document storage layout** with comments and `@custom` annotations
7. **Consider time delays** for critical upgrades
8. **Emit events** for all upgrade actions
9. **Validate new implementations** before upgrading
10. **Have rollback plan** if upgrade fails

## Upgrade Checklist

Before deploying an upgrade:

- [ ] Storage layout matches previous version (no insertions/deletions)
- [ ] New variables only appended at end
- [ ] `_authorizeUpgrade` properly restricted
- [ ] Implementation initializers disabled
- [ ] Initializer/reinitializer functions correct
- [ ] Tests verify storage preservation
- [ ] Tests verify new functionality
- [ ] Gas costs analyzed
- [ ] Security audit completed
- [ ] Rollback strategy prepared

## References

- [OpenZeppelin Upgrades](https://docs.openzeppelin.com/upgrades-plugins)
- [EIP-1967: Proxy Storage Slots](https://eips.ethereum.org/EIPS/eip-1967)
- [ERC-7201: Namespaced Storage Layout](https://eips.ethereum.org/EIPS/eip-7201)
- [UUPS vs Transparent Proxies](https://docs.openzeppelin.com/contracts/5.x/api/proxy)
- [September 2021 Vulnerability Postmortem](https://forum.openzeppelin.com/t/security-advisory-initialize-uups-implementation-contracts/15301)
