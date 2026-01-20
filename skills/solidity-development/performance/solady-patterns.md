# Solady Optimization Patterns

Solady (Solidity Library for Advanced DeFi Yield) represents the cutting edge of gas optimization in Solidity. This guide covers Solady-specific patterns that achieve extreme gas efficiency through pure assembly implementation.

## Philosophy: Optimization Without Compromise

Solady's approach:
- **Pure assembly** for maximum gas efficiency
- **Battle-tested patterns** from production use
- **Safety through testing** rather than verbose checks
- **Developer responsibility** for correct usage

**When to use Solady:**
- Layer 2 deployments where gas matters
- Account abstraction (every opcode counts)
- High-frequency operations (DEX, payment systems)
- Factory contracts deploying many instances

**When to use OpenZeppelin:**
- High-value protocols requiring maximum security assurance
- Teams without assembly expertise
- Complex access control hierarchies
- Educational purposes or prototyping

## SafeTransferLib: Assembly Token Transfers

Solady's `SafeTransferLib` demonstrates idiomatic assembly for ERC20 operations.

### Basic Usage

```solidity
import {SafeTransferLib} from "solady/utils/SafeTransferLib.sol";

contract PaymentProcessor {
    using SafeTransferLib for address;
    
    function processPayment(
        address token,
        address from,
        address to,
        uint256 amount
    ) external {
        // Gas-optimized transfer
        token.safeTransferFrom(from, to, amount);
        
        // Alternative: Direct transfer
        token.safeTransfer(to, amount);
    }
}
```

### Implementation Analysis

```solidity
function safeTransferFrom(
    address token,
    address from,
    address to,
    uint256 amount
) internal {
    /// @solidity memory-safe-assembly
    assembly {
        // Use scratch space (0x00-0x3f) for efficiency
        mstore(0x0c, 0x23b872dd000000000000000000000000)  // transferFrom selector
        mstore(0x20, from)
        mstore(0x40, to)
        mstore(0x60, amount)
        
        // call(gas, address, value, argsOffset, argsSize, retOffset, retSize)
        let success := call(gas(), token, 0, 0x1c, 0x64, 0x00, 0x20)
        
        // Validation: success AND (returndata == true OR no returndata)
        if iszero(and(eq(mload(0x00), 1), success)) {
            // Check for non-contract or zero returndata
            if iszero(lt(or(iszero(extcodesize(token)), returndatasize()), success)) {
                mstore(0x00, 0x7939f424)  // TransferFromFailed() selector
                revert(0x1c, 0x04)
            }
        }
    }
}
```

**Key Optimizations:**
1. **Scratch space usage** (0x00-0x3f) avoids free memory pointer management
2. **returndatasize()** returns 0 before external calls (cheaper than PUSH1 0x00)
3. **Pre-computed selectors** eliminate runtime keccak256 computation
4. **Combined validation** reduces branching overhead

**Gas Savings: ~11,000 gas per transfer vs OpenZeppelin**

## ERC20: Minimal Token Implementation

### Complete Implementation

```solidity
import {ERC20} from "solady/tokens/ERC20.sol";

contract MyToken is ERC20 {
    function name() public pure override returns (string memory) {
        return "My Token";
    }
    
    function symbol() public pure override returns (string memory) {
        return "MTK";
    }
    
    function decimals() public pure override returns (uint8) {
        return 18;
    }
    
    constructor() {
        _mint(msg.sender, 1_000_000 * 10**18);
    }
}
```

**Implementation Highlights:**

```solidity
// Solady ERC20 uses assembly for all operations
function transfer(address to, uint256 amount) public virtual returns (bool) {
    /// @solidity memory-safe-assembly
    assembly {
        // Load balance from storage
        mstore(0x0c, _BALANCE_SLOT_SEED)
        mstore(0x00, caller())
        let fromBalanceSlot := keccak256(0x0c, 0x20)
        let fromBalance := sload(fromBalanceSlot)
        
        // Check sufficient balance
        if gt(amount, fromBalance) {
            mstore(0x00, 0xf4d678b8)  // InsufficientBalance()
            revert(0x1c, 0x04)
        }
        
        // Update balances
        sstore(fromBalanceSlot, sub(fromBalance, amount))
        
        mstore(0x00, to)
        let toBalanceSlot := keccak256(0x0c, 0x20)
        sstore(toBalanceSlot, add(sload(toBalanceSlot), amount))
        
        // Emit Transfer event
        mstore(0x20, amount)
        log3(0x20, 0x20, _TRANSFER_EVENT_SIGNATURE, caller(), shr(96, mload(0x0c)))
    }
    return true;
}
```

### Gas Comparison

| Operation | OpenZeppelin | Solady | Savings |
|-----------|-------------|--------|---------|
| Deploy | ~1,500,000 | ~500,000 | **66%** |
| Transfer | ~51,000 | ~40,000 | **22%** |
| Approve | ~46,000 | ~36,000 | **22%** |
| TransferFrom | ~54,000 | ~43,000 | **20%** |

## OwnableRoles: Bitmap Access Control

### Implementation

```solidity
import {OwnableRoles} from "solady/auth/OwnableRoles.sol";

contract AccessControlledContract is OwnableRoles {
    // Roles defined as bit positions (powers of 2)
    uint256 public constant ADMIN_ROLE = 1 << 0;      // 0b0001
    uint256 public constant MINTER_ROLE = 1 << 1;     // 0b0010
    uint256 public constant BURNER_ROLE = 1 << 2;     // 0b0100
    uint256 public constant PAUSER_ROLE = 1 << 3;     // 0b1000
    
    constructor() {
        _initializeOwner(msg.sender);  // CRITICAL: Required initialization
    }
    
    function mint(address to, uint256 amount) external onlyRoles(MINTER_ROLE) {
        _mint(to, amount);
    }
    
    function burn(address from, uint256 amount) external onlyRoles(BURNER_ROLE) {
        _burn(from, amount);
    }
    
    // Require BOTH admin and minter roles
    function emergencyMint(address to, uint256 amount) 
        external 
        onlyRoles(ADMIN_ROLE | MINTER_ROLE)  // OR operation
    {
        _mint(to, amount);
    }
    
    // Owner functions for role management
    function grantRoles(address user, uint256 roles) external onlyOwner {
        _grantRoles(user, roles);
    }
    
    function revokeRoles(address user, uint256 roles) external onlyOwner {
        _removeRoles(user, roles);
    }
}
```

### Bitmap Operations

```solidity
// Internal assembly implementation (simplified)
function _grantRoles(address user, uint256 roles) internal virtual {
    /// @solidity memory-safe-assembly
    assembly {
        // Load current roles
        mstore(0x0c, _ROLE_SLOT_SEED)
        mstore(0x00, user)
        let roleSlot := keccak256(0x0c, 0x20)
        let currentRoles := sload(roleSlot)
        
        // Set bits with OR operation
        let newRoles := or(currentRoles, roles)
        sstore(roleSlot, newRoles)
        
        // Emit RolesUpdated event
        mstore(0x00, user)
        mstore(0x20, newRoles)
        log1(0x00, 0x40, _ROLES_UPDATED_EVENT_SIGNATURE)
    }
}

function hasAllRoles(address user, uint256 roles) public view returns (bool) {
    uint256 userRoles = rolesOf(user);
    return (userRoles & roles) == roles;
}

function hasAnyRole(address user, uint256 roles) public view returns (bool) {
    uint256 userRoles = rolesOf(user);
    return (userRoles & roles) != 0;
}
```

**Gas Savings: ~44% vs OpenZeppelin AccessControl**

## ReentrancyGuard: Transient Storage

```solidity
import {ReentrancyGuardTransient} from "solady/utils/ReentrancyGuardTransient.sol";

contract SecureVault is ReentrancyGuardTransient {
    mapping(address => uint256) public balances;
    
    function withdraw(uint256 amount) external nonReentrantView {
        require(balances[msg.sender] >= amount, "Insufficient balance");
        
        balances[msg.sender] -= amount;
        
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Transfer failed");
    }
}
```

**Implementation with transient storage:**

```solidity
// Solidity 0.8.24+
modifier nonReentrantView() {
    /// @solidity memory-safe-assembly
    assembly {
        // TLOAD: ~5 gas vs SLOAD: 2,100 gas
        if tload(_REENTRANCY_GUARD_SLOT) {
            mstore(0x00, 0xab143c06)  // Reentrancy()
            revert(0x1c, 0x04)
        }
        
        // TSTORE: ~20 gas vs SSTORE: 20,000 gas
        tstore(_REENTRANCY_GUARD_SLOT, 1)
    }
    _;
    /// @solidity memory-safe-assembly
    assembly {
        tstore(_REENTRANCY_GUARD_SLOT, 0)
    }
}
```

**Gas Savings: ~5,000 gas vs persistent storage ReentrancyGuard**

## FixedPointMathLib: Mathematical Operations

### Common Operations

```solidity
import {FixedPointMathLib} from "solady/utils/FixedPointMathLib.sol";

contract DeFiProtocol {
    using FixedPointMathLib for uint256;
    
    function calculateShare(uint256 assets, uint256 totalAssets, uint256 totalShares) 
        public 
        pure 
        returns (uint256) 
    {
        // (assets * totalShares) / totalAssets with full precision
        return assets.fullMulDiv(totalShares, totalAssets);
    }
    
    function calculateInterest(uint256 principal, uint256 rateWAD) 
        public 
        pure 
        returns (uint256) 
    {
        // principal * rate (where rate is in WAD format: 1e18 = 100%)
        return principal.mulWad(rateWAD);
    }
    
    function sqrt(uint256 x) public pure returns (uint256) {
        return x.sqrt();
    }
}
```

### Gas Benchmarks

| Operation | Solady | OpenZeppelin | Savings |
|-----------|--------|--------------|---------|
| sqrt | 683 gas | 1,146 gas | **40%** |
| mulWad | ~50 gas | ~80 gas | **37%** |
| fullMulDiv | ~200 gas | ~350 gas | **43%** |

## LibString: String Operations

```solidity
import {LibString} from "solady/utils/LibString.sol";

contract NFTContract {
    using LibString for uint256;
    using LibString for address;
    
    function tokenURI(uint256 tokenId) public pure returns (string memory) {
        // Efficient uint256 to string conversion
        return string.concat(
            "https://api.example.com/token/",
            tokenId.toString()
        );
    }
    
    function ownerString(address owner) public pure returns (string memory) {
        // Address to checksummed string
        return owner.toHexStringChecksummed();
    }
}
```

**Gas Savings: ~30% vs traditional string conversion**

## MerkleProofLib: Efficient Verification

```solidity
import {MerkleProofLib} from "solady/utils/MerkleProofLib.sol";

contract Airdrop {
    bytes32 public immutable merkleRoot;
    
    constructor(bytes32 _merkleRoot) {
        merkleRoot = _merkleRoot;
    }
    
    function claim(
        address account,
        uint256 amount,
        bytes32[] calldata proof
    ) external {
        // Verify merkle proof
        bytes32 leaf = keccak256(abi.encodePacked(account, amount));
        require(
            MerkleProofLib.verify(proof, merkleRoot, leaf),
            "Invalid proof"
        );
        
        // Process claim
    }
    
    // Multi-proof verification (more efficient for multiple claims)
    function batchClaim(
        bytes32[] calldata leaves,
        bytes32[] calldata proof,
        bool[] calldata flags
    ) external {
        require(
            MerkleProofLib.verifyMultiProof(proof, merkleRoot, leaves, flags),
            "Invalid multi-proof"
        );
        
        // Process batch claims
    }
}
```

## SignatureCheckerLib: Signature Validation

```solidity
import {SignatureCheckerLib} from "solady/utils/SignatureCheckerLib.sol";

contract SignatureValidator {
    using SignatureCheckerLib for address;
    
    function validateSignature(
        address signer,
        bytes32 hash,
        bytes calldata signature
    ) public view returns (bool) {
        // Supports both EOA (ECDSA) and ERC1271 contract signatures
        return signer.isValidSignatureNow(hash, signature);
    }
    
    function validateEOASignature(
        address signer,
        bytes32 hash,
        bytes calldata signature
    ) public pure returns (bool) {
        // Only ECDSA signatures
        return SignatureCheckerLib.isValidSignatureNowCalldata(
            signer,
            hash,
            signature
        );
    }
}
```

## ECDSA: Signature Recovery

```solidity
import {ECDSA} from "solady/utils/ECDSA.sol";

contract MessageSigner {
    using ECDSA for bytes32;
    
    function recoverSigner(
        bytes32 hash,
        bytes calldata signature
    ) public pure returns (address) {
        // Recover signer address from signature
        return hash.recover(signature);
    }
    
    function recoverSignerWithPrefix(
        bytes memory message,
        bytes calldata signature
    ) public pure returns (address) {
        // Add Ethereum signed message prefix
        bytes32 hash = keccak256(message).toEthSignedMessageHash();
        return hash.recover(signature);
    }
}
```

**Gas Savings: -282 gas vs OpenZeppelin (yes, negative - it's cheaper!)**

## ERC1967Factory: Efficient Proxy Deployment

```solidity
import {ERC1967Factory} from "solady/utils/ERC1967Factory.sol";

contract TokenFactory {
    ERC1967Factory public immutable factory;
    address public immutable implementation;
    
    constructor(address _implementation) {
        factory = new ERC1967Factory();
        implementation = _implementation;
    }
    
    function createToken(
        string calldata name,
        string calldata symbol
    ) external returns (address token) {
        bytes memory initData = abi.encodeCall(
            Token.initialize,
            (name, symbol, msg.sender)
        );
        
        // Deploy proxy with implementation
        token = factory.deployAndCall(implementation, msg.sender, initData);
    }
    
    function createDeterministicToken(
        string calldata name,
        string calldata symbol,
        bytes32 salt
    ) external returns (address token) {
        bytes memory initData = abi.encodeCall(
            Token.initialize,
            (name, symbol, msg.sender)
        );
        
        // Deploy with CREATE2 for deterministic address
        token = factory.deployDeterministicAndCall(
            implementation,
            msg.sender,
            salt,
            initData
        );
    }
}
```

**Optimizations:**
- Vanity address for implementation (0x000...0 leading bytes)
- Optimized proxy bytecode
- **118 gas per UserOp** saved (ZeroDev benchmark)
- **82 bytes per deployment** saved

## Best Practices

### When to Use Assembly

**[GOOD] Good candidates:**
- High-frequency operations (transfers, mints)
- Well-tested patterns (Solady implementations)
- Performance-critical paths (account abstraction)
- Factory contracts with many instances

**[BAD] Avoid assembly for:**
- Complex business logic
- Unaudited patterns
- Code requiring frequent changes
- Teams without assembly expertise

### Safety Patterns

```solidity
// Always use memory-safe annotation
/// @solidity memory-safe-assembly
assembly {
    // Assembly code
}

// Document assembly behavior
/**
 * @dev Uses assembly to optimize gas costs.
 * Assembly pattern verified in Solady implementation.
 * 
 * Layout:
 * 0x00-0x1f: Function selector
 * 0x20-0x3f: First parameter
 * ...
 */
function optimizedFunction() internal {
    /// @solidity memory-safe-assembly
    assembly { }
}

// Test thoroughly
function testAssemblyBehavior() public {
    // Verify assembly implementation matches Solidity equivalent
}
```

### Migration Strategy

**From OpenZeppelin to Solady:**

1. **Start with utilities**: SafeTransferLib, FixedPointMathLib
2. **Add access control**: OwnableRoles for simple cases
3. **Optimize tokens**: ERC20, ERC721 implementations
4. **Advanced patterns**: Custom assembly only when needed

**Hybrid approach:**
```solidity
// Security-critical: OpenZeppelin
import "@openzeppelin/contracts/access/AccessControl.sol";

// Performance-critical: Solady
import {SafeTransferLib} from "solady/utils/SafeTransferLib.sol";
import {FixedPointMathLib} from "solady/utils/FixedPointMathLib.sol";

contract HybridContract is AccessControl {
    using SafeTransferLib for address;
    using FixedPointMathLib for uint256;
    
    // Best of both worlds
}
```

## Testing Solady Integrations

```solidity
// test/Solady.t.sol
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {SafeTransferLib} from "solady/utils/SafeTransferLib.sol";

contract SoladyTest is Test {
    using SafeTransferLib for address;
    
    MockERC20 public token;
    
    function setUp() public {
        token = new MockERC20();
    }
    
    function testSafeTransfer() public {
        address(token).safeTransfer(address(this), 100);
        assertEq(token.balanceOf(address(this)), 100);
    }
    
    function testGasComparison() public {
        uint256 gasBefore = gasleft();
        address(token).safeTransfer(address(this), 100);
        uint256 gasUsed = gasBefore - gasleft();
        
        // Verify gas savings
        assertLt(gasUsed, 30000, "Transfer too expensive");
    }
}
```

## Resources

- [Solady Repository](https://github.com/Vectorized/solady)
- [Solady Documentation](https://solady.readthedocs.io/)
- [ZeroDev Kernel Case Study](https://docs-v4.zerodev.app/blog/solady-case-study)
- [Yieldoor Optimization Report](https://dacian.me/the-yieldoor-gas-optimizoor)
- [Assembly Best Practices](https://docs.soliditylang.org/en/latest/assembly.html)
