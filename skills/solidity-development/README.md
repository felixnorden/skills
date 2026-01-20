# Solidity Development Agent Skill

Comprehensive Solidity smart contract development best practices for Claude Agent Skills, covering security, performance, and documentation standards.

## Overview

This Agent Skill provides production-grade patterns for Solidity smart contract development based on industry-leading implementations from OpenZeppelin and Solady. It helps Claude write, review, and audit smart contracts with best practices for security, gas optimization, and professional documentation.

## File Structure

```
solidity-development/
├── SKILL.md                                # Main skill file (core patterns)
├── README.md                               # This file
├── security/
│   ├── reentrancy.md                      # Reentrancy protection patterns
│   ├── access-control.md                  # Access control implementations
│   └── upgrades.md                        # Upgradeable contract security
├── performance/
│   ├── gas-optimization.md                # Gas optimization techniques
│   └── solady-patterns.md                 # Solady-specific patterns
└── documentation/
    └── natspec-standards.md               # NatSpec documentation standards
```

## Content Overview

### SKILL.md (Main Entry Point)

- Core security patterns (reentrancy, access control, upgrades)
- Gas optimization fundamentals (custom errors, storage packing)
- Documentation standards (NatSpec requirements)
- Quick reference for library selection (OpenZeppelin vs Solady)
- Common pitfalls and testing standards

### Security Files

**reentrancy.md**

- Checks-Effects-Interactions pattern
- ReentrancyGuard implementations (OpenZeppelin & Solady)
- Transient storage optimization (EIP-1153)
- Cross-contract and read-only reentrancy
- Pull-over-push pattern

**access-control.md**

- Ownable vs Ownable2Step vs AccessControl
- OwnableRoles (Solady) for gas efficiency
- Role hierarchies and multi-role requirements
- Time-delayed admin actions
- Gas comparison tables

**upgrades.md**

- UUPS vs Transparent Proxy patterns
- Critical security requirements (disable initializers, \_authorizeUpgrade)
- Storage layout preservation
- ERC-7201 namespaced storage
- Multi-step upgrades and testing

### Performance Files

**gas-optimization.md**

- Custom errors (mandatory 2025)
- Storage optimization (variable packing, structs)
- Loop optimization (unchecked arithmetic)
- Assembly patterns and transient storage
- Real-world gas benchmarks

**solady-patterns.md**

- SafeTransferLib (11,000 gas savings)
- ERC20 (66% deployment cost reduction)
- OwnableRoles (44% role operations savings)
- FixedPointMathLib, SignatureCheckerLib
- When to use Solady vs OpenZeppelin

### Documentation Files

**natspec-standards.md**

- Complete NatSpec tag reference
- Contract, function, event, error documentation
- Inheritance documentation patterns
- Warning and note conventions
- Assembly documentation requirements

## Trigger Terms

This skill activates when users mention:

- Smart contracts, Solidity, EVM, Ethereum
- Gas optimization, security audits
- OpenZeppelin, Solady
- Upgradeable contracts, proxies
- Reentrancy, access control
- NatSpec, documentation

## Key Features

### Security Focus

- Reentrancy protection with CEI pattern and guards
- Access control patterns from simple to complex
- Upgradeable contract safety (implementation protection, storage layout)
- Historical vulnerability awareness (September 2021 OpenZeppelin incident)

### Performance Optimization

- Quantified gas savings with real-world benchmarks
- Custom errors (99% savings over strings)
- Storage packing examples (20,000+ gas per slot)
- Assembly patterns with safety annotations
- Transient storage (EIP-1153) for 95% storage cost reduction

### Production Standards

- Complete NatSpec documentation examples
- Testing patterns with Foundry
- Code organization conventions
- Upgrade checklists and ADRs

## Usage Examples

### For Writing Smart Contracts

Claude will:

- Apply appropriate security patterns (reentrancy guards, access control)
- Optimize gas usage (custom errors, storage packing, unchecked loops)
- Generate complete NatSpec documentation
- Include proper error handling and events

### For Code Review

Claude will:

- Identify security vulnerabilities
- Suggest gas optimizations with quantified savings
- Check documentation completeness
- Verify upgrade safety for proxy contracts

### For Auditing

Claude will:

- Flag common vulnerability patterns
- Analyze storage layout for upgradeable contracts
- Review access control implementation
- Assess test coverage and quality

## Best Practices Highlighted

1. **Security First**: Multiple defense layers, proven patterns
2. **Quantified Optimization**: Real-world gas measurements guide decisions
3. **Clear Documentation**: Every public function documented with NatSpec
4. **Testing Standards**: Unit, integration, fuzz, and invariant tests
5. **Upgrade Safety**: Proper initialization, storage preservation

## Version Compatibility

- Solidity 0.8.20+ (0.8.24+ for transient storage)
- OpenZeppelin Contracts v5.x
- Solady latest version
- Foundry for testing and development

## Contributing

When updating this skill:

1. Keep SKILL.md under 500 lines (core patterns only)
2. Include concrete code examples in reference files
3. Provide quantified gas savings when discussing optimizations
4. Add references to official documentation
5. Update version compatibility as standards evolve

## References

- [OpenZeppelin Contracts](https://github.com/OpenZeppelin/openzeppelin-contracts)
- [OpenZeppelin Upgradeable](https://github.com/OpenZeppelin/openzeppelin-contracts-upgradeable)
- [Solady](https://github.com/Vectorized/solady)
- [Solidity Documentation](https://docs.soliditylang.org/)
- [EIPs](https://eips.ethereum.org/)

## License

This Agent Skill is provided for educational and development purposes. Code examples derived from OpenZeppelin and Solady maintain their original licenses.
