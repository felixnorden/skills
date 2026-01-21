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

| Priority | Recommended Approach | Rationale |
| -------------------------------- | ---------------------- | -------------------------------------------------- |
| High-value protocols (>$10M TVL) | OpenZeppelin | Extensive audits, battle-tested security |
| Layer 2 applications | Solady | 66% deployment cost savings, optimized for scaling |
| Account abstraction | Solady | Minimal gas per operation critical for UX |
| DeFi protocols (new) | OpenZeppelin | Security paramount, gas costs secondary |
| NFT collections | OpenZeppelin or Solady | Depends on mint volume and optimization needs |

## Critical Security Patterns

### Reentrancy Protection

**Always follow Checks-Effects-Interactions (CEI) pattern** - validate conditions, update state, then make external calls.

**For additional protection, use ReentrancyGuard** from OpenZeppelin with the `nonReentrant` modifier.

**Modern optimization**: Use Solady's `ReentrancyGuardTransient` with EIP-1153 transient storage for gas-efficient protection on supported chains.

See [references/security/reentrancy.md](references/security/reentrancy.md) for comprehensive patterns.

### Access Control

**Single administrator**: Use Ownable2Step for safety with the two-step ownership acceptance pattern.

**Multi-role systems**: Use AccessControl with defined roles and the `onlyRole` modifier for granular permissions.

**Gas-optimized alternative**: Solady's OwnableRoles uses bitmap-based role management for ~40% gas savings over AccessControl.

See [references/security/access-control.md](references/security/access-control.md) for detailed patterns.

### Upgradeable Contract Safety

**Critical**: Always disable initializers in implementation constructors to prevent implementation takeover.

**Use ERC-7201 namespaced storage** to prevent storage collisions in upgradeable contracts.

**UUPS pattern**: Implement `_authorizeUpgrade` with access control - forgetting this permanently locks upgrade capability.

See [references/security/upgrades.md](references/security/upgrades.md) for comprehensive upgrade patterns.

## Gas Optimization Fundamentals

### Custom Errors (Mandatory in 2025)

Replace expensive `require` strings with custom errors for 50-100 gas savings per revert. Custom errors use minimal 4-byte selectors.

### Storage Optimization

**Pack variables** to minimize storage slots - frequently accessed data should use packed structs to reduce SLOAD operations.

### Function Optimization

**Use unchecked arithmetic** when overflow is impossible to save 30-40 gas per increment.

**Prefer calldata over memory** for external function parameters to avoid expensive data copying.

### Quantified Gas Savings

| Optimization | Gas Saved | When to Apply |
| ------------------------ | ------------------ | ------------------------- |
| Custom errors vs strings | ~50-100 per revert | Always (mandatory 2025) |
| Unchecked increment | ~30-40 per loop | Safe arithmetic only |
| Calldata vs memory | ~60 per 32 bytes | External functions |
| Storage packing | 20,000 per slot | Frequently accessed data |
| Assembly token transfer | ~11,000 per call | High-frequency operations |

See [references/performance/gas-optimization.md](references/performance/gas-optimization.md) for comprehensive techniques.

## Assembly Best Practices

**Only use assembly when**:
1. Gas savings justify complexity (typically >10% improvement)
2. Team has expertise to maintain assembly code
3. Operation is well-tested and audited

**Assembly safety checklist**: Document memory layout, use well-known patterns, validate return values, handle all edge cases, and include `/// @solidity memory-safe-assembly` annotation.

See [references/performance/solady-patterns.md](references/performance/solady-patterns.md) for advanced assembly patterns.

## Documentation Standards

### NatSpec Requirements

**Every public/external function must have**:
- `@notice` - User-friendly description
- `@dev` - Technical details for developers
- `@param` and `@return` descriptions
- `@custom:security-contact` for security vulnerability reporting

**Contract-level documentation** should include title, author, notice, dev notes, and custom tags for security and upgrades.

See [references/documentation/natspec-standards.md](references/documentation/natspec-standards.md) for comprehensive standards.

## Common Pitfalls to Avoid

### Security

- **Unprotected initializers**: Always use `initializer` modifier and access control
- **Unsafe external calls**: Follow CEI pattern - state changes before external calls

### Performance

- **Unbounded loops**: Can exceed gas limits - use pagination and bounded iterations
- **Expensive require strings**: Use custom errors instead

### Documentation

- **Missing NatSpec**: Every public/external function requires complete documentation

## Testing Standards

**Minimum test coverage requirements**:

- **Unit tests**: Each function, all branches
- **Integration tests**: Contract interactions
- **Fuzz tests**: Input validation, edge cases
- **Invariant tests**: Protocol invariants
- **Gas benchmarks**: Performance regression prevention

Use Foundry/Forge for testing with patterns including `vm.expectRevert`, fuzz testing with `testFuzz_*`, and invariant testing.

## Quick Reference: Which Library to Use

### OpenZeppelin

- High-value protocols (DeFi, DAOs) where security is paramount
- Extensive documentation and audits required
- Standard token implementations (ERC20, ERC721, ERC1155)
- Upgradeability required (UUPS, Transparent Proxy)

### Solady

- Layer 2 applications where gas optimization is critical
- Account abstraction and high-frequency operations
- Deploying many instances (factory patterns)
- Teams with assembly expertise

### Hybrid Approach

Combine OpenZeppelin for security-critical patterns (AccessControl) with Solady for gas-sensitive operations (SafeTransferLib).

## Reference Files

For detailed guidance on specific topics:

- **Security**: [references/security/reentrancy.md](references/security/reentrancy.md), [references/security/access-control.md](references/security/access-control.md), [references/security/upgrades.md](references/security/upgrades.md)
- **Performance**: [references/performance/gas-optimization.md](references/performance/gas-optimization.md), [references/performance/solady-patterns.md](references/performance/solady-patterns.md)
- **Documentation**: [references/documentation/natspec-standards.md](references/documentation/natspec-standards.md)

See [references/REFERENCES.md](references/REFERENCES.md) for complete documentation structure.

## Version Compatibility

This skill assumes:

- Solidity 0.8.20+ (or 0.8.24+ for transient storage)
- OpenZeppelin Contracts v5.x
- Solady latest version
- Foundry for testing and development

Always verify compatibility for your specific use case.
