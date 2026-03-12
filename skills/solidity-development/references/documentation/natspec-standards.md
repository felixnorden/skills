# NatSpec Documentation Standards

## Contents

- [NatSpec Tags Overview](#natspec-tags-overview)
- [Contract-Level Documentation](#contract-level-documentation)
  - [Complete Contract Example](#complete-contract-example)
  - [Custom Tags (OpenZeppelin Conventions)](#custom-tags-openzeppelin-conventions)
- [Function Documentation](#function-documentation)
  - [Standard Function Pattern](#standard-function-pattern)
  - [Multiple Return Values](#multiple-return-values)
  - [Complex Parameters](#complex-parameters)
- [Events Documentation](#events-documentation)
- [Errors Documentation](#errors-documentation)
- [State Variables Documentation](#state-variables-documentation)
- [Modifier Documentation](#modifier-documentation)
- [Inheritance Documentation](#inheritance-documentation)
  - [Inheriting Interface Documentation](#inheriting-interface-documentation)
  - [Extending Inherited Documentation](#extending-inherited-documentation)
- [Warning and Note Patterns](#warning-and-note-patterns)
  - [Warning Documentation](#warning-documentation)
  - [Important Notes](#important-notes)
  - [Tips and Recommendations](#tips-and-recommendations)
- [Section Organization](#section-organization)
  - [Solady Style (ASCII Art Separators)](#solady-style-ascii-art-separators)
  - [OpenZeppelin Style (Comment Headers)](#openzeppelin-style-comment-headers)
- [Upgradeable Contracts Documentation](#upgradeable-contracts-documentation)
- [Assembly Documentation](#assembly-documentation)
- [Security Considerations Section](#security-considerations-section)
- [Testing Documentation](#testing-documentation)
- [Documentation Generation](#documentation-generation)
  - [Generate NatSpec JSON](#generate-natspec-json)
  - [Integration with Tools](#integration-with-tools)
- [Best Practices Summary](#best-practices-summary)
- [Common Mistakes to Avoid](#common-mistakes-to-avoid)
- [References](#references)

NatSpec (Natural Specification) provides structured documentation for Solidity smart contracts. Proper documentation enables audits, integrations, and maintenance while serving as a contract specification.

## NatSpec Tags Overview

| Tag           | Applies To | Purpose                              |
| ------------- | ---------- | ------------------------------------ |
| `@title`      | Contract   | High-level contract purpose          |
| `@author`     | Contract   | Author information                   |
| `@notice`     | All        | User-facing description              |
| `@dev`        | All        | Developer technical details          |
| `@param`      | Function   | Parameter description                |
| `@return`     | Function   | Return value description             |
| `@inheritdoc` | Function   | Inherit documentation from interface |
| `@custom:*`   | All        | Custom documentation fields          |

## Contract-Level Documentation

### Complete Contract Example

```solidity
/**
 * @title ERC20 Token with Pause Functionality
 * @author Alice Smith (alice@example.com)
 * @notice This contract implements a standard ERC20 token with emergency pause capability
 * @dev Implements ERC20, Ownable, and Pausable from OpenZeppelin
 *
 * The contract allows:
 * - Standard ERC20 transfers and approvals
 * - Owner can pause all token transfers
 * - Owner can mint new tokens
 *
 * @custom:security-contact security@example.com
 * @custom:oz-upgrades This contract is intended to be deployed behind a UUPS proxy
 */
contract PausableToken is ERC20, Ownable, Pausable {
    // Implementation
}
```

### Custom Tags (OpenZeppelin Conventions)

```solidity
/**
 * @custom:security-contact security@myproject.com
 * @custom:oz-upgrades Implements UUPS upgrade pattern
 * @custom:oz-upgrades-unsafe-allow constructor
 * @custom:storage-location erc7201:myproject.storage.MyContract
 */
```

## Function Documentation

### Standard Function Pattern

```solidity
/**
 * @notice Transfers tokens from sender to recipient
 * @dev Implements ERC20 transfer with additional pause check
 *
 * Requirements:
 * - Contract must not be paused
 * - `to` cannot be zero address
 * - Caller must have balance >= `amount`
 *
 * Emits a {Transfer} event
 *
 * @param to The address to receive tokens
 * @param amount The number of tokens to transfer
 * @return success True if transfer succeeded, false otherwise
 */
function transfer(address to, uint256 amount)
    public
    virtual
    override
    whenNotPaused
    returns (bool success)
{
    _transfer(msg.sender, to, amount);
    return true;
}
```

### Multiple Return Values

```solidity
/**
 * @notice Calculates user's share and rewards
 * @dev Uses fixed-point arithmetic for precision
 *
 * @param user Address to calculate for
 * @return shares User's current shares in the pool
 * @return pendingRewards Unclaimed rewards for the user
 */
function getUserInfo(address user)
    external
    view
    returns (uint256 shares, uint256 pendingRewards)
{
    shares = balanceOf(user);
    pendingRewards = _calculateRewards(user);
}
```

### Complex Parameters

```solidity
/**
 * @notice Batch mints tokens to multiple recipients
 * @dev Only callable by addresses with MINTER_ROLE
 *
 * This function processes multiple mints atomically. If any mint fails,
 * the entire transaction reverts. Use with caution for large batches
 * due to gas limitations.
 *
 * @param recipients Array of addresses to receive tokens
 * @param amounts Array of token amounts corresponding to each recipient
 *
 * Requirements:
 * - `recipients` and `amounts` must have equal length
 * - Each recipient address must be non-zero
 * - Total amount must not exceed MAX_BATCH_MINT
 *
 * Emits multiple {Transfer} events
 */
function batchMint(
    address[] calldata recipients,
    uint256[] calldata amounts
) external onlyRole(MINTER_ROLE) {
    require(recipients.length == amounts.length, "Length mismatch");
    // Implementation
}
```

## Events Documentation

```solidity
/**
 * @notice Emitted when tokens are transferred
 * @dev Standard ERC20 Transfer event
 *
 * @param from Address tokens are transferred from
 * @param to Address tokens are transferred to
 * @param value Amount of tokens transferred
 */
event Transfer(address indexed from, address indexed to, uint256 value);

/**
 * @notice Emitted when contract pause state changes
 * @dev Used for monitoring and alerting systems
 *
 * @param account Address that triggered the pause/unpause
 * @param paused New pause state (true = paused, false = unpaused)
 */
event PauseStateChanged(address indexed account, bool paused);
```

## Errors Documentation

```solidity
/**
 * @notice Thrown when caller is not authorized for the operation
 * @dev Used for access control violations
 *
 * @param caller Address that attempted the operation
 * @param requiredRole Role needed for the operation
 */
error UnauthorizedAccess(address caller, bytes32 requiredRole);

/**
 * @notice Thrown when attempting to transfer more tokens than available
 * @dev Provides context for debugging balance issues
 *
 * @param available Current balance available
 * @param required Amount attempted to transfer
 */
error InsufficientBalance(uint256 available, uint256 required);
```

## State Variables Documentation

```solidity
/**
 * @notice Maximum number of tokens that can be minted
 * @dev Set during contract deployment and cannot be changed
 */
uint256 public immutable MAX_SUPPLY;

/**
 * @notice Tracks total tokens minted so far
 * @dev Updated atomically with each mint operation
 */
uint256 public totalMinted;

/**
 * @notice Mapping of user addresses to their token balances
 * @dev Standard ERC20 balance tracking
 */
mapping(address => uint256) private _balances;
```

## Modifier Documentation

```solidity
/**
 * @notice Ensures function is only called when contract is not paused
 * @dev Reverts with "Pausable: paused" if contract is paused
 */
modifier whenNotPaused() {
    require(!paused(), "Pausable: paused");
    _;
}

/**
 * @notice Restricts function access to addresses with specific role
 * @dev Uses AccessControl for role verification
 *
 * @param role Required role bytes32 identifier
 */
modifier onlyRole(bytes32 role) {
    _checkRole(role);
    _;
}
```

## Inheritance Documentation

### Inheriting Interface Documentation

```solidity
// Interface definition
interface IERC20 {
    /**
     * @notice Returns the amount of tokens owned by `account`
     * @param account Address to query
     * @return balance Token balance of the account
     */
    function balanceOf(address account) external view returns (uint256 balance);
}

// Implementation inheriting documentation
contract MyToken is IERC20 {
    /**
     * @inheritdoc IERC20
     */
    function balanceOf(address account)
        public
        view
        override
        returns (uint256)
    {
        return _balances[account];
    }
}
```

### Extending Inherited Documentation

```solidity
/**
 * @inheritdoc ERC20
 * @dev Adds pause check to standard ERC20 transfer
 */
function transfer(address to, uint256 amount)
    public
    virtual
    override
    whenNotPaused
    returns (bool)
{
    return super.transfer(to, amount);
}
```

## Warning and Note Patterns

### Warning Documentation

```solidity
/**
 * @notice Withdraws all funds from the contract
 * @dev Only callable by owner
 *
 * WARNING: This function transfers the entire contract balance.
 * Ensure all pending transactions are settled before calling.
 * This action is irreversible.
 *
 * @param recipient Address to receive funds
 */
function emergencyWithdraw(address recipient) external onlyOwner {
    payable(recipient).transfer(address(this).balance);
}
```

### Important Notes

```solidity
/**
 * @notice Updates the reward distribution rate
 * @dev Only callable by owner
 *
 * NOTE: This change takes effect immediately for all users.
 * Consider calling updateAllRewards() first to settle pending rewards
 * at the current rate.
 *
 * @param newRate New reward rate in tokens per second
 */
function setRewardRate(uint256 newRate) external onlyOwner {
    rewardRate = newRate;
}
```

### Tips and Recommendations

```solidity
/**
 * @notice Stakes tokens in the reward pool
 * @dev User must approve this contract before staking
 *
 * TIP: Call approve(address(this), amount) before calling stake()
 * to authorize the token transfer in a single transaction.
 *
 * @param amount Number of tokens to stake
 */
function stake(uint256 amount) external {
    token.transferFrom(msg.sender, address(this), amount);
    _updateStake(msg.sender, amount);
}
```

## Section Organization

### Solady Style (ASCII Art Separators)

```solidity
/*´:°•.°+.*•´.*:˚.°*.˚•´.°:°•.°•.*•´.*:˚.°*.˚•´.°:°•.°+.*•´.*:*/
/*                       CUSTOM ERRORS                        */
/*.•°:°.´+˚.*°.˚:*.´•*.+°.•°:´*.´•*.•°.•°:°.´:•˚°.*°.˚:*.´+°.•*/

error Unauthorized();
error InsufficientBalance();

/*´:°•.°+.*•´.*:˚.°*.˚•´.°:°•.°•.*•´.*:˚.°*.˚•´.°:°•.°+.*•´.*:*/
/*                          STORAGE                           */
/*.•°:°.´+˚.*°.˚:*.´•*.+°.•°:´*.´•*.•°.•°:°.´:•˚°.*°.˚:*.´+°.•*/

uint256 private _totalSupply;
mapping(address => uint256) private _balances;

/*´:°•.°+.*•´.*:˚.°*.˚•´.°:°•.°•.*•´.*:˚.°*.˚•´.°:°•.°+.*•´.*:*/
/*                      PUBLIC FUNCTIONS                      */
/*.•°:°.´+˚.*°.˚:*.´•*.+°.•°:´*.´•*.•°.•°:°.´:•˚°.*°.˚:*.´+°.•*/
```

### OpenZeppelin Style (Comment Headers)

```solidity
// =============================================================================
// CUSTOM ERRORS
// =============================================================================

error Unauthorized();
error InsufficientBalance();

// =============================================================================
// STATE VARIABLES
// =============================================================================

uint256 private _totalSupply;
mapping(address => uint256) private _balances;

// =============================================================================
// PUBLIC FUNCTIONS
// =============================================================================
```

## Upgradeable Contracts Documentation

```solidity
/**
 * @title Upgradeable Token Contract
 * @author Alice Smith
 * @notice ERC20 token with UUPS upgrade capability
 * @dev Implements UUPS proxy pattern from OpenZeppelin
 *
 * This contract is designed to be deployed behind an ERC1967 proxy.
 * The implementation contract should never be used directly.
 *
 * Storage Layout (ERC-7201):
 * - Main storage: erc7201:myproject.storage.Token
 * - Inherited OpenZeppelin storage uses standard namespaces
 *
 * @custom:oz-upgrades-unsafe-allow constructor
 * @custom:storage-location erc7201:myproject.storage.Token
 */
contract UpgradeableToken is
    Initializable,
    ERC20Upgradeable,
    UUPSUpgradeable
{
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    /**
     * @notice Initializes the token contract
     * @dev Can only be called once due to initializer modifier
     *
     * @param name Token name
     * @param symbol Token symbol
     * @param initialOwner Address that will own the contract
     */
    function initialize(
        string memory name,
        string memory symbol,
        address initialOwner
    ) public initializer {
        __ERC20_init(name, symbol);
        __Ownable_init(initialOwner);
        __UUPSUpgradeable_init();
    }

    /**
     * @dev Authorizes contract upgrades
     * @param newImplementation Address of new implementation
     *
     * WARNING: Ensure new implementation maintains storage layout compatibility.
     * Always test upgrades on testnet before production deployment.
     */
    function _authorizeUpgrade(address newImplementation)
        internal
        override
        onlyOwner
    {
        // Additional validation could be added here
    }
}
```

## Assembly Documentation

```solidity
/**
 * @notice Efficient token transfer using assembly
 * @dev Uses scratch space for memory efficiency
 *
 * Assembly implementation:
 * 1. Writes transfer selector and parameters to memory
 * 2. Calls token contract
 * 3. Validates return value (true or no return data)
 *
 * Memory Layout:
 * 0x00-0x1b: Function selector (transfer)
 * 0x1c-0x3f: Recipient address
 * 0x40-0x5f: Amount
 *
 * @param token ERC20 token address
 * @param to Recipient address
 * @param amount Token amount to transfer
 */
function safeTransfer(address token, address to, uint256 amount) internal {
    /// @solidity memory-safe-assembly
    assembly {
        // Layout and logic explanation
        mstore(0x00, 0xa9059cbb)  // transfer(address,uint256)
        mstore(0x20, to)
        mstore(0x40, amount)

        let success := call(gas(), token, 0, 0x1c, 0x44, 0x00, 0x20)

        // Validate: success AND (returndata == true OR no returndata)
        if iszero(and(eq(mload(0x00), 1), success)) {
            revert(0x00, 0x04)
        }
    }
}
```

## Security Considerations Section

```solidity
/**
 * @notice Claims accumulated rewards
 * @dev Uses pull-over-push pattern for security
 *
 * Security Considerations:
 * - Reentrancy protection via nonReentrant modifier
 * - State updates before external calls (CEI pattern)
 * - Zero address checks on transfer recipient
 * - Reward calculation overflow protection
 *
 * @return amount Amount of rewards claimed
 */
function claimRewards() external nonReentrant returns (uint256 amount) {
    amount = _calculatePendingRewards(msg.sender);
    require(amount > 0, "No rewards");

    _lastClaimTime[msg.sender] = block.timestamp;

    rewardToken.safeTransfer(msg.sender, amount);
}
```

## Testing Documentation

```solidity
/**
 * @dev Test helper function - not included in production deployment
 *
 * This function is marked as testing-only and should be removed
 * or restricted in production deployments.
 *
 * @custom:testing-only Do not deploy to mainnet with this function
 */
function _setBalanceForTesting(address account, uint256 balance)
    external
{
    require(block.chainid != 1, "Testing function called on mainnet");
    _balances[account] = balance;
}
```

## Documentation Generation

### Generate NatSpec JSON

```bash
# Compile with NatSpec output
solc --userdoc --devdoc MyContract.sol

# Using Foundry
forge doc

# Generate documentation site
forge doc --build
```

### Integration with Tools

**Etherscan Verification:**

- NatSpec automatically displayed on verified contracts
- User documentation shown in UI
- Developer documentation in "Read Contract" section

**Development Tools:**

- **VS Code Solidity**: Hover tooltips from NatSpec
- **Hardhat**: Documentation generation plugins
- **Foundry**: Built-in documentation generator

## Best Practices Summary

1. **Every public/external function** must have `@notice` and `@dev`
2. **Document all parameters** with `@param` tags
3. **Document return values** with `@return` tags
4. **Include requirements** in `@dev` section
5. **Document emitted events** with references
6. **Add security warnings** where appropriate
7. **Explain complex logic** in `@dev` sections
8. **Document storage layout** for upgradeable contracts
9. **Use consistent formatting** across the project
10. **Generate and review** documentation regularly

## Common Mistakes to Avoid

[BAD] **Missing function documentation**

```solidity
function transfer(address to, uint256 amount) external {
    // No documentation
}
```

[BAD] **Vague descriptions**

```solidity
/**
 * @notice Does something with tokens
 */
```

[BAD] **Undocumented parameters**

```solidity
/**
 * @notice Transfers tokens
 */
function transfer(address to, uint256 amount) external {
```

[GOOD] **Complete documentation**

```solidity
/**
 * @notice Transfers tokens from sender to recipient
 * @dev Implements ERC20 transfer with pause check
 *
 * Requirements:
 * - `to` cannot be zero address
 * - Caller must have balance >= `amount`
 *
 * Emits a {Transfer} event
 *
 * @param to Recipient address
 * @param amount Number of tokens to transfer
 * @return success True if transfer succeeded
 */
function transfer(address to, uint256 amount)
    external
    whenNotPaused
    returns (bool success)
{
    _transfer(msg.sender, to, amount);
    return true;
}
```

## References

- [NatSpec Format](https://docs.soliditylang.org/en/latest/natspec-format.html)
- [OpenZeppelin Documentation Standards](https://docs.openzeppelin.com/contracts/)
- [Ethereum Natural Specification Format](https://github.com/ethereum/wiki/wiki/Ethereum-Natural-Specification-Format)
