# Reentrancy Protection Patterns

Reentrancy attacks occur when an external contract call allows malicious code to re-enter the calling contract before the first invocation completes. This can lead to state manipulation and fund drainage.

## Understanding Reentrancy

### How Reentrancy Works

```solidity
// VULNERABLE CONTRACT
contract VulnerableBank {
    mapping(address => uint256) public balances;
    
    function withdraw() external {
        uint256 balance = balances[msg.sender];
        
        // [BAD] VULNERABLE: External call before state update
        (bool success, ) = msg.sender.call{value: balance}("");
        require(success);
        
        balances[msg.sender] = 0;  // State update AFTER external call
    }
}

// ATTACKER CONTRACT
contract Attacker {
    VulnerableBank public bank;
    
    constructor(address _bank) {
        bank = VulnerableBank(_bank);
    }
    
    receive() external payable {
        // Re-enter withdraw() before balance is zeroed
        if (address(bank).balance > 0) {
            bank.withdraw();
        }
    }
    
    function attack() external payable {
        bank.deposit{value: msg.value}();
        bank.withdraw();  // Drains entire contract
    }
}
```

## Primary Defense: Checks-Effects-Interactions

The CEI pattern is the **foundational defense** against reentrancy:

1. **CHECKS**: Validate conditions and permissions
2. **EFFECTS**: Update contract state
3. **INTERACTIONS**: Make external calls

### Correct Implementation

```solidity
contract SecureBank {
    mapping(address => uint256) public balances;
    
    function withdraw() external {
        // 1. CHECKS: Validate conditions
        uint256 balance = balances[msg.sender];
        require(balance > 0, "No balance");
        
        // 2. EFFECTS: Update state FIRST
        balances[msg.sender] = 0;
        
        // 3. INTERACTIONS: External call LAST
        (bool success, ) = msg.sender.call{value: balance}("");
        require(success, "Transfer failed");
    }
}
```

## Secondary Defense: ReentrancyGuard

Use `ReentrancyGuard` as an **additional layer** when CEI pattern is insufficient or complex.

### OpenZeppelin Implementation

```solidity
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract SecureVault is ReentrancyGuard {
    mapping(address => uint256) public balances;
    
    function withdraw(uint256 amount) external nonReentrant {
        require(balances[msg.sender] >= amount, "Insufficient balance");
        
        balances[msg.sender] -= amount;
        
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Transfer failed");
    }
    
    // Can safely call other nonReentrant functions
    function transfer(address to, uint256 amount) external nonReentrant {
        require(balances[msg.sender] >= amount, "Insufficient balance");
        
        balances[msg.sender] -= amount;
        balances[to] += amount;
        
        emit Transfer(msg.sender, to, amount);
    }
}
```

### How ReentrancyGuard Works

```solidity
// OpenZeppelin v5.x implementation (simplified)
abstract contract ReentrancyGuard {
    // Storage slot for reentrancy status
    bytes32 private constant REENTRANCY_GUARD_STORAGE = 
        0x9b779b17422d0df92223018b32b4d1fa46e071723d6817e2486d003becc55f00;
    
    uint256 private constant NOT_ENTERED = 1;
    uint256 private constant ENTERED = 2;
    
    modifier nonReentrant() {
        ReentrancyGuardStorage storage $ = _getReentrancyGuardStorage();
        
        // Check if already entered
        require($._status != ENTERED, "ReentrancyGuard: reentrant call");
        
        // Set entered status
        $._status = ENTERED;
        
        _;  // Execute function
        
        // Reset status
        $._status = NOT_ENTERED;
    }
    
    function _getReentrancyGuardStorage() 
        private 
        pure 
        returns (ReentrancyGuardStorage storage $) 
    {
        assembly {
            $.slot := REENTRANCY_GUARD_STORAGE
        }
    }
}
```

## Modern Optimization: Transient Storage

EIP-1153 introduces transient storage (TLOAD/TSTORE) that automatically clears at transaction end.

### Transient ReentrancyGuard

```solidity
import {ReentrancyGuardTransient} from "solady/utils/ReentrancyGuardTransient.sol";

contract GasEfficientVault is ReentrancyGuardTransient {
    mapping(address => uint256) public balances;
    
    function withdraw(uint256 amount) external nonReentrantView {
        require(balances[msg.sender] >= amount);
        
        balances[msg.sender] -= amount;
        
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success);
    }
}
```

**Advantages:**
- **~5,000 gas cheaper** than persistent storage
- **No cleanup needed** - automatically cleared after transaction
- **Simpler code** - no manual reset required

**Requirements:**
- Solidity 0.8.24+
- Supported chains (Ethereum post-Cancun, major L2s)

### Gas Comparison

| Implementation | First Call | Subsequent Calls | Cleanup |
|---------------|------------|------------------|---------|
| Standard SSTORE | ~20,000 gas | ~5,000 gas | Required |
| Transient TSTORE | ~15,000 gas | ~5,000 gas | Automatic |

## Cross-Function Reentrancy

Guard against reentrancy across **multiple functions** in the same contract.

```solidity
contract MultiFunction is ReentrancyGuard {
    mapping(address => uint256) public balances;
    
    // Both functions share same reentrancy lock
    function withdraw(uint256 amount) external nonReentrant {
        balances[msg.sender] -= amount;
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success);
    }
    
    function transfer(address to, uint256 amount) external nonReentrant {
        // Safe: cannot be reentered during withdraw()
        balances[msg.sender] -= amount;
        balances[to] += amount;
    }
}
```

## Cross-Contract Reentrancy

Protect against attacks via **different contracts** in the same protocol.

```solidity
// Shared base contract for protocol-wide protection
abstract contract ProtocolReentrancyGuard is ReentrancyGuard {
    // All contracts in protocol share same lock
}

contract PoolA is ProtocolReentrancyGuard {
    function depositToPoolB(address poolB, uint256 amount) 
        external 
        nonReentrant 
    {
        // Protected against PoolB reentering this contract
        PoolB(poolB).deposit{value: amount}();
    }
}

contract PoolB is ProtocolReentrancyGuard {
    function deposit() external payable nonReentrant {
        // Cannot reenter PoolA during its transaction
    }
}
```

## Read-Only Reentrancy

**View functions** can be vulnerable if they rely on stale state.

### Vulnerable Pattern

```solidity
contract VulnerableOracle {
    uint256 public totalAssets;
    mapping(address => uint256) public userAssets;
    
    // [BAD] VULNERABLE: Returns stale data during reentrancy
    function getSharePrice() public view returns (uint256) {
        return totalAssets / totalShares;
    }
    
    function withdraw(uint256 shares) external {
        uint256 assets = shares * getSharePrice();  // Correct price
        
        totalAssets -= assets;  // State updated
        
        // During this call, getSharePrice() returns STALE data
        (bool success, ) = msg.sender.call{value: assets}("");
        require(success);
        
        totalShares -= shares;  // State updated
    }
}

// ATTACKER
contract ReadOnlyAttacker {
    VulnerableOracle public oracle;
    
    receive() external payable {
        // getSharePrice() still uses OLD totalAssets
        uint256 stalePrice = oracle.getSharePrice();
        // Can exploit in another contract using this stale data
    }
}
```

### Protection Pattern

```solidity
contract SecureOracle is ReentrancyGuard {
    uint256 public totalAssets;
    
    // [GOOD] PROTECTED: View modifier prevents reentrancy
    function getSharePrice() public view nonReentrantView returns (uint256) {
        return totalAssets / totalShares;
    }
    
    function withdraw(uint256 shares) external nonReentrant {
        // Implementation
    }
}
```

## Pull Over Push Pattern

Prefer **pull** (withdrawal) over **push** (direct transfer) to avoid reentrancy.

### Push Pattern (Vulnerable)

```solidity
// [BAD] RISKY: External call in loop
function distributeRewards(address[] calldata recipients) external {
    for (uint256 i = 0; i < recipients.length; i++) {
        uint256 reward = calculateReward(recipients[i]);
        (bool success, ) = recipients[i].call{value: reward}("");
        // If one call fails, entire transaction reverts
        // Malicious recipient can reenter or block distribution
        require(success);
    }
}
```

### Pull Pattern (Secure)

```solidity
// [GOOD] SAFE: Users pull their own rewards
contract SecureRewards is ReentrancyGuard {
    mapping(address => uint256) public pendingRewards;
    
    function updateRewards(address[] calldata users) external {
        for (uint256 i = 0; i < users.length; i++) {
            pendingRewards[users[i]] += calculateReward(users[i]);
        }
    }
    
    function claimReward() external nonReentrant {
        uint256 reward = pendingRewards[msg.sender];
        require(reward > 0, "No rewards");
        
        pendingRewards[msg.sender] = 0;  // CEI pattern
        
        (bool success, ) = msg.sender.call{value: reward}("");
        require(success);
    }
}
```

## Testing for Reentrancy

### Foundry Test Example

```solidity
// test/Reentrancy.t.sol
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";

contract ReentrancyTest is Test {
    SecureBank public bank;
    Attacker public attacker;
    
    function setUp() public {
        bank = new SecureBank();
        attacker = new Attacker(address(bank));
        
        // Fund bank
        vm.deal(address(bank), 10 ether);
    }
    
    function testReentrancyPrevention() public {
        // Deposit
        vm.deal(address(attacker), 1 ether);
        attacker.deposit{value: 1 ether}();
        
        // Attempt reentrancy attack
        vm.expectRevert("ReentrancyGuard: reentrant call");
        attacker.attack();
    }
    
    function testNormalWithdrawal() public {
        // Normal withdrawal should work
        vm.deal(address(this), 1 ether);
        bank.deposit{value: 1 ether}();
        
        uint256 balanceBefore = address(this).balance;
        bank.withdraw(1 ether);
        assertEq(address(this).balance, balanceBefore + 1 ether);
    }
}
```

## Best Practices Summary

1. **Always use CEI pattern** - Primary defense
2. **Add ReentrancyGuard** - Secondary defense for complex flows
3. **Use transient storage** - When available for gas savings
4. **Prefer pull over push** - Especially in loops
5. **Protect view functions** - Use `nonReentrantView` for price oracles
6. **Test thoroughly** - Include reentrancy attack scenarios
7. **Consider cross-contract risks** - Protocol-wide protection when needed

## Common Mistakes to Avoid

[BAD] **Relying only on ReentrancyGuard without CEI**
```solidity
function bad() external nonReentrant {
    (bool success, ) = msg.sender.call{value: balance}("");
    balance = 0;  // Still wrong order
}
```

[BAD] **Forgetting to protect view functions**
```solidity
function getPrice() public view returns (uint256) {
    return totalAssets / totalShares;  // Vulnerable to read-only reentrancy
}
```

[BAD] **External calls in loops without protection**
```solidity
for (uint256 i = 0; i < users.length; i++) {
    payable(users[i]).call{value: amounts[i]}("");  // Vulnerable
}
```

## References

- [Reentrancy After Istanbul](https://blog.openzeppelin.com/reentrancy-after-istanbul/)
- [EIP-1153: Transient Storage](https://eips.ethereum.org/EIPS/eip-1153)
- [Curve Finance Read-Only Reentrancy](https://chainsecurity.com/curve-lp-oracle-manipulation-post-mortem/)
- [OpenZeppelin ReentrancyGuard](https://docs.openzeppelin.com/contracts/5.x/api/utils#ReentrancyGuard)
