# Access Control Patterns

## Contents

- [Access Control Hierarchy](#access-control-hierarchy)
- [Single Administrator: Ownable](#single-administrator-ownable)
  - [Basic Ownable Pattern](#basic-ownable-pattern)
  - [Ownable2Step: Safe Ownership Transfer](#ownable2step-safe-ownership-transfer)
- [Multi-Role Systems: AccessControl](#multi-role-systems-accesscontrol)
  - [Basic AccessControl Implementation](#basic-accesscontrol-implementation)
  - [Role Hierarchies](#role-hierarchies)
  - [Multi-Role Requirements](#multi-role-requirements)
  - [Time-Delayed Admin Actions](#time-delayed-admin-actions)
- [Gas-Optimized: OwnableRoles (Solady)](#gas-optimized-ownableroles-solady)
  - [Bitmap Operations](#bitmap-operations)
  - [Gas Comparison: AccessControl vs OwnableRoles](#gas-comparison-accesscontrol-vs-ownableroles)
- [Advanced Patterns](#advanced-patterns)
  - [Pausable with Emergency Admin](#pausable-with-emergency-admin)
  - [Per-Function Access Control](#per-function-access-control)
  - [Delegated Authority with Limits](#delegated-authority-with-limits)
- [Testing Access Control](#testing-access-control)
- [Best Practices Summary](#best-practices-summary)
- [Common Mistakes to Avoid](#common-mistakes-to-avoid)
- [References](#references)

Access control determines who can execute specific functions in a smart contract. Proper access control is critical for preventing unauthorized actions, protecting funds, and maintaining protocol integrity.

## Access Control Hierarchy

Choose the appropriate pattern based on your requirements:

| Pattern | Use Case | Complexity | Gas Cost |
|---------|----------|------------|----------|
| **Ownable** | Single administrator | Low | Lowest |
| **Ownable2Step** | Single admin with transfer safety | Low | Low |
| **OwnableRoles** | Multiple roles, gas-sensitive | Medium | Medium |
| **AccessControl** | Complex role hierarchies | High | Higher |

## Single Administrator: Ownable

### Basic Ownable Pattern

```solidity
import "@openzeppelin/contracts/access/Ownable.sol";

contract SimpleContract is Ownable {
    uint256 public value;
    
    constructor(address initialOwner) Ownable(initialOwner) {}
    
    function setValue(uint256 newValue) external onlyOwner {
        value = newValue;
    }
    
    function transferOwnership(address newOwner) public override onlyOwner {
        require(newOwner != address(0), "Invalid address");
        super.transferOwnership(newOwner);
    }
}
```

**Key Features:**
- Single owner address with exclusive privileges
- `onlyOwner` modifier restricts function access
- Ownership transferable via `transferOwnership()`
- Ownership renounceable via `renounceOwnership()`

**Security Considerations:**

[BAD] **Common Mistake: Forgetting owner initialization**
```solidity
// DANGEROUS: Owner defaults to address(0) in some patterns
constructor() Ownable(msg.sender) {}  // [GOOD] GOOD: Explicit initialization
```

[BAD] **Common Mistake: No validation on transfer**
```solidity
// RISKY: Can accidentally transfer to wrong address
function transferOwnership(address newOwner) public override onlyOwner {
    super.transferOwnership(newOwner);  // [BAD] No validation
}
```

### Ownable2Step: Safe Ownership Transfer

**Problem with Ownable:** Typo in new owner address permanently locks admin functions.

**Solution:** Two-step transfer requiring explicit acceptance.

```solidity
import "@openzeppelin/contracts/access/Ownable2Step.sol";

contract SecureContract is Ownable2Step {
    constructor(address initialOwner) Ownable(initialOwner) {}
    
    // Step 1: Current owner nominates new owner
    function transferOwnership(address newOwner) public override onlyOwner {
        super.transferOwnership(newOwner);
        // Does NOT transfer ownership yet
        emit OwnershipTransferStarted(owner(), newOwner);
    }
    
    // Step 2: New owner accepts ownership
    function acceptOwnership() public override {
        // Only pending owner can call
        require(msg.sender == pendingOwner(), "Not pending owner");
        super.acceptOwnership();
        // Ownership now transferred
    }
}
```

**Benefits:**
- **Prevents accidental lockout** - new owner must prove address control
- **Allows cancellation** - current owner can change pending owner before acceptance
- **Minimal gas overhead** - only small additional storage

**When to use:**
- High-value contracts where ownership loss is catastrophic
- Contracts with irreversible owner-only functions
- Production deployments (recommended default)

## Multi-Role Systems: AccessControl

For contracts requiring multiple administrative roles with different permissions.

### Basic AccessControl Implementation

```solidity
import "@openzeppelin/contracts/access/AccessControl.sol";

contract TokenContract is AccessControl {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant BURNER_ROLE = keccak256("BURNER_ROLE");
    
    constructor(address admin) {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
    }
    
    function mint(address to, uint256 amount) external onlyRole(MINTER_ROLE) {
        _mint(to, amount);
    }
    
    function pause() external onlyRole(PAUSER_ROLE) {
        _pause();
    }
    
    function burn(address from, uint256 amount) external onlyRole(BURNER_ROLE) {
        _burn(from, amount);
    }
}
```

### Role Hierarchies

**DEFAULT_ADMIN_ROLE** can manage all other roles:

```solidity
contract HierarchicalAccess is AccessControl {
    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");
    bytes32 public constant MANAGER_ROLE = keccak256("MANAGER_ROLE");
    
    constructor(address superAdmin) {
        // Super admin can manage all roles
        _grantRole(DEFAULT_ADMIN_ROLE, superAdmin);
        
        // Manager can grant/revoke operator role
        _setRoleAdmin(OPERATOR_ROLE, MANAGER_ROLE);
        
        // Only DEFAULT_ADMIN_ROLE can manage managers
        _setRoleAdmin(MANAGER_ROLE, DEFAULT_ADMIN_ROLE);
    }
    
    function operatorAction() external onlyRole(OPERATOR_ROLE) {
        // Operator-level action
    }
    
    function managerAction() external onlyRole(MANAGER_ROLE) {
        // Manager-level action
    }
}
```

### Multi-Role Requirements

Require **multiple roles** for sensitive operations:

```solidity
contract SecureVault is AccessControl {
    bytes32 public constant INITIATOR_ROLE = keccak256("INITIATOR_ROLE");
    bytes32 public constant APPROVER_ROLE = keccak256("APPROVER_ROLE");
    
    function criticalOperation() 
        external 
        onlyRole(INITIATOR_ROLE)
        onlyRole(APPROVER_ROLE)  // Must have BOTH roles
    {
        // High-security operation
    }
    
    // Better: Separate initiation and approval
    mapping(bytes32 => bool) public pendingOperations;
    
    function initiateOperation(bytes32 operationId) 
        external 
        onlyRole(INITIATOR_ROLE) 
    {
        pendingOperations[operationId] = true;
    }
    
    function approveOperation(bytes32 operationId) 
        external 
        onlyRole(APPROVER_ROLE) 
    {
        require(pendingOperations[operationId], "Not initiated");
        delete pendingOperations[operationId];
        _executeOperation(operationId);
    }
}
```

### Time-Delayed Admin Actions

Protect against compromised admin keys with **time delays**:

```solidity
import "@openzeppelin/contracts/access/AccessControl.sol";

contract TimelockAccess is AccessControl {
    bytes32 public constant PROPOSER_ROLE = keccak256("PROPOSER_ROLE");
    bytes32 public constant EXECUTOR_ROLE = keccak256("EXECUTOR_ROLE");
    
    uint256 public constant MIN_DELAY = 2 days;
    
    struct Proposal {
        bytes32 id;
        uint256 timestamp;
        bool executed;
    }
    
    mapping(bytes32 => Proposal) public proposals;
    
    function proposeAction(bytes32 proposalId) 
        external 
        onlyRole(PROPOSER_ROLE) 
    {
        proposals[proposalId] = Proposal({
            id: proposalId,
            timestamp: block.timestamp,
            executed: false
        });
        
        emit ActionProposed(proposalId, block.timestamp + MIN_DELAY);
    }
    
    function executeAction(bytes32 proposalId) 
        external 
        onlyRole(EXECUTOR_ROLE) 
    {
        Proposal storage proposal = proposals[proposalId];
        require(!proposal.executed, "Already executed");
        require(
            block.timestamp >= proposal.timestamp + MIN_DELAY,
            "Timelock not expired"
        );
        
        proposal.executed = true;
        _executeProposal(proposalId);
    }
}
```

## Gas-Optimized: OwnableRoles (Solady)

Combine single owner with **bitmap-based roles** for gas efficiency.

```solidity
import {OwnableRoles} from "solady/auth/OwnableRoles.sol";

contract GasEfficientContract is OwnableRoles {
    // Define roles as bit positions (2^n)
    uint256 public constant MINTER_ROLE = 1 << 0;   // 0b0001
    uint256 public constant PAUSER_ROLE = 1 << 1;   // 0b0010
    uint256 public constant BURNER_ROLE = 1 << 2;   // 0b0100
    
    constructor() {
        _initializeOwner(msg.sender);  // Required initialization
    }
    
    function mint(address to, uint256 amount) external onlyRoles(MINTER_ROLE) {
        _mint(to, amount);
    }
    
    function pause() external onlyRoles(PAUSER_ROLE) {
        _pause();
    }
    
    // Owner can grant/revoke roles
    function grantMinterRole(address account) external onlyOwner {
        _grantRoles(account, MINTER_ROLE);
    }
    
    function revokeMinterRole(address account) external onlyOwner {
        _removeRoles(account, MINTER_ROLE);
    }
    
    // Grant multiple roles at once (gas efficient)
    function grantMultipleRoles(address account) external onlyOwner {
        _grantRoles(account, MINTER_ROLE | PAUSER_ROLE);
    }
}
```

### Bitmap Operations

```solidity
// Check if account has specific role
function hasRole(address account, uint256 role) public view returns (bool) {
    return rolesOf(account) & role != 0;
}

// Check if account has ANY of multiple roles
function hasAnyRole(address account, uint256 roles) public view returns (bool) {
    return rolesOf(account) & roles != 0;
}

// Check if account has ALL of multiple roles
function hasAllRoles(address account, uint256 roles) public view returns (bool) {
    return (rolesOf(account) & roles) == roles;
}
```

### Gas Comparison: AccessControl vs OwnableRoles

| Operation | AccessControl | OwnableRoles | Savings |
|-----------|---------------|--------------|---------|
| Grant Role | ~45,000 gas | ~25,000 gas | **44%** |
| Revoke Role | ~8,000 gas | ~5,000 gas | **37%** |
| Check Role | ~2,600 gas | ~800 gas | **69%** |
| Deploy | ~1,200,000 gas | ~600,000 gas | **50%** |

**When to use OwnableRoles:**
- High-frequency role checks
- Multiple contract instances (factory patterns)
- L2 deployments where gas matters
- Simple role hierarchies (owner manages all roles)

**When to use AccessControl:**
- Complex role hierarchies with delegation
- Need role enumeration (list all role members)
- Enterprise contracts requiring comprehensive auditing
- Multiple independent role administrators

## Advanced Patterns

### Pausable with Emergency Admin

```solidity
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract EmergencyProtection is AccessControl, Pausable {
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant EMERGENCY_ROLE = keccak256("EMERGENCY_ROLE");
    
    constructor(address admin) {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(PAUSER_ROLE, admin);
    }
    
    function pause() external onlyRole(PAUSER_ROLE) {
        _pause();
    }
    
    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }
    
    // Emergency admin can pause but NOT unpause
    function emergencyPause() external onlyRole(EMERGENCY_ROLE) {
        _pause();
    }
    
    function criticalFunction() external whenNotPaused {
        // Can be paused in emergency
    }
}
```

### Per-Function Access Control

```solidity
contract GranularAccess is AccessControl {
    mapping(bytes4 => bytes32) public functionRoles;
    
    modifier onlyFunctionRole() {
        bytes4 selector = msg.sig;
        bytes32 requiredRole = functionRoles[selector];
        
        require(
            requiredRole == bytes32(0) || hasRole(requiredRole, msg.sender),
            "Unauthorized"
        );
        _;
    }
    
    function setFunctionRole(bytes4 selector, bytes32 role) 
        external 
        onlyRole(DEFAULT_ADMIN_ROLE) 
    {
        functionRoles[selector] = role;
    }
    
    function restrictedFunction() external onlyFunctionRole {
        // Access controlled by functionRoles mapping
    }
}
```

### Delegated Authority with Limits

```solidity
contract LimitedAuthority is AccessControl {
    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");
    
    mapping(address => uint256) public operatorLimits;
    mapping(address => uint256) public operatorSpent;
    
    function setOperatorLimit(address operator, uint256 limit) 
        external 
        onlyRole(DEFAULT_ADMIN_ROLE) 
    {
        operatorLimits[operator] = limit;
    }
    
    function performOperation(uint256 amount) 
        external 
        onlyRole(OPERATOR_ROLE) 
    {
        require(
            operatorSpent[msg.sender] + amount <= operatorLimits[msg.sender],
            "Exceeds operator limit"
        );
        
        operatorSpent[msg.sender] += amount;
        _executeOperation(amount);
    }
}
```

## Testing Access Control

### Comprehensive Test Suite

```solidity
// test/AccessControl.t.sol
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {TokenContract} from "../src/TokenContract.sol";

contract AccessControlTest is Test {
    TokenContract public token;
    
    address public admin = address(1);
    address public minter = address(2);
    address public unauthorized = address(3);
    
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    
    function setUp() public {
        vm.prank(admin);
        token = new TokenContract(admin);
        
        vm.prank(admin);
        token.grantRole(MINTER_ROLE, minter);
    }
    
    function testOnlyMinterCanMint() public {
        vm.prank(minter);
        token.mint(address(this), 100);
        assertEq(token.balanceOf(address(this)), 100);
    }
    
    function testUnauthorizedCannotMint() public {
        vm.prank(unauthorized);
        vm.expectRevert();
        token.mint(address(this), 100);
    }
    
    function testAdminCanGrantRole() public {
        vm.prank(admin);
        token.grantRole(MINTER_ROLE, unauthorized);
        
        assertTrue(token.hasRole(MINTER_ROLE, unauthorized));
    }
    
    function testNonAdminCannotGrantRole() public {
        vm.prank(minter);
        vm.expectRevert();
        token.grantRole(MINTER_ROLE, unauthorized);
    }
    
    function testRoleRevocation() public {
        vm.prank(admin);
        token.revokeRole(MINTER_ROLE, minter);
        
        assertFalse(token.hasRole(MINTER_ROLE, minter));
        
        vm.prank(minter);
        vm.expectRevert();
        token.mint(address(this), 100);
    }
}
```

## Best Practices Summary

1. **Use Ownable2Step** for single-admin contracts in production
2. **Use AccessControl** for complex multi-role systems
3. **Use OwnableRoles** for gas-sensitive multi-role contracts
4. **Always validate addresses** in ownership transfers
5. **Document all roles** with comments explaining permissions
6. **Test unauthorized access** for all restricted functions
7. **Emit events** for all access control changes
8. **Consider time delays** for critical admin functions
9. **Implement emergency pause** with separate role
10. **Audit role grants carefully** - compromised admin can grant attacker roles

## Common Mistakes to Avoid

[BAD] **Forgetting owner initialization in Solady**
```solidity
constructor() {
    // [BAD] WRONG: Owner not initialized
}

constructor() {
    _initializeOwner(msg.sender);  // [GOOD] CORRECT
}
```

[BAD] **Not validating role grants**
```solidity
function grantRole(bytes32 role, address account) public {
    // [BAD] Missing validation
    super.grantRole(role, account);
}
```

[BAD] **Hardcoding roles instead of constants**
```solidity
// [BAD] BAD: Magic numbers
function mint() external onlyRole(0x01) {}

// [GOOD] GOOD: Named constants
bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
function mint() external onlyRole(MINTER_ROLE) {}
```

## References

- [OpenZeppelin Access Control](https://docs.openzeppelin.com/contracts/5.x/api/access)
- [Solady OwnableRoles](https://github.com/Vectorized/solady/blob/main/src/auth/OwnableRoles.sol)
- [Role-Based Access Control Security](https://blog.openzeppelin.com/role-based-access-control-rbac-on-ethereum)
