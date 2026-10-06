# Refactoring Patterns

Before/after examples for common Solidity fixes. Each pair shows the input contract and the corrected output.

## Contents

- Converting from Require Strings to Custom Errors
- Adding Reentrancy Protection
- Implementing Access Control
- Making Contract Upgradeable

## Converting from Require Strings to Custom Errors

**Input**: Existing contract with require strings

```solidity
function transfer(address to, uint256 amount) external {
    require(balanceOf[msg.sender] >= amount, "Insufficient balance");
    require(to != address(0), "Invalid address");
    // ...
}
```

**Output**: Optimized contract with custom errors

```solidity
error InsufficientBalance(uint256 available, uint256 required);
error InvalidAddress();

function transfer(address to, uint256 amount) external {
    if (balanceOf[msg.sender] < amount) {
        revert InsufficientBalance(balanceOf[msg.sender], amount);
    }
    if (to == address(0)) {
        revert InvalidAddress();
    }
    // ...
}
```

## Adding Reentrancy Protection

**Input**: Vulnerable withdrawal function

```solidity
function withdraw(uint256 amount) external {
    require(balances[msg.sender] >= amount);
    (bool success, ) = msg.sender.call{value: amount}("");
    require(success);
    balances[msg.sender] -= amount; // State update after external call!
}
```

**Output**: Protected function with CEI pattern

```solidity
function withdraw(uint256 amount) external nonReentrant {
    uint256 balance = balances[msg.sender];
    require(balance >= amount, "Insufficient balance");

    balances[msg.sender] = balance - amount; // Effects before interactions

    (bool success, ) = msg.sender.call{value: amount}("");
    require(success, "Transfer failed");
}
```

## Implementing Access Control

**Input**: Contract with no access control

```solidity
contract Unprotected {
    uint256 public value;

    function setValue(uint256 newValue) external {
        value = newValue; // Anyone can call!
    }
}
```

**Output**: Protected contract with Ownable2Step

```solidity
import "@openzeppelin/contracts/access/Ownable2Step.sol";

contract Protected is Ownable2Step {
    uint256 public value;

    constructor(address initialOwner) Ownable(initialOwner) {}

    function setValue(uint256 newValue) external onlyOwner {
        value = newValue;
    }
}
```

## Making Contract Upgradeable

**Input**: Standard contract

```solidity
contract Token is ERC20 {
    constructor() ERC20("MyToken", "MTK") {
        _mint(msg.sender, 1000000 * 10**18);
    }
}
```

**Output**: UUPS upgradeable contract

```solidity
import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

contract Token is ERC20Upgradeable, OwnableUpgradeable, UUPSUpgradeable {
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(address initialOwner) public initializer {
        __ERC20_init("MyToken", "MTK");
        __Ownable_init(initialOwner);
        __UUPSUpgradeable_init();
        _mint(initialOwner, 1000000 * 10**18);
    }

    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}
}
```
