---
name: solidity-development
description: Comprehensive Solidity smart contract development best practices covering security patterns, gas optimization, and professional documentation standards. Use when writing, reviewing, or auditing Solidity smart contracts, or when the user mentions EVM, Ethereum, blockchain development, smart contracts, Solidity, gas optimization, or security audits.
---

# Solidity Development Best Practices

This skill provides production-grade patterns for Solidity smart contract development based on industry-leading implementations from OpenZeppelin and Solady. Apply these practices when developing, reviewing, or auditing smart contracts.

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

Libraries in detail:

- **OpenZeppelin**: high-value protocols (DeFi, DAOs), standard token implementations (ERC20, ERC721, ERC1155), and upgradeability (UUPS, Transparent Proxy).
- **Solady**: layer 2 applications, account abstraction, high-frequency operations, and factory patterns that deploy many instances.
- **Hybrid**: OpenZeppelin for security-critical patterns and Solady for gas-sensitive operations, such as SafeTransferLib.

## Degrees of Freedom

Match the level of specificity to the task's fragility:

**Low Freedom** (strict patterns - follow exactly)

These operations have narrow safe paths:
- **Reentrancy protection**: Always follow CEI pattern, use ReentrancyGuard for complex flows
- **Access control**: Use Ownable2Step for single admin, validate all ownership transfers
- **Upgradeable contracts**: Always disable initializers in constructors, implement _authorizeUpgrade
- **Custom errors**: Replace require strings with custom errors

**Medium Freedom** (preferred patterns, context matters)

These have recommended approaches but depend on context:
- **Library selection**: OpenZeppelin for security-critical, Solady for gas-critical
- **Storage optimization**: Pack variables when frequently accessed together
- **Assembly usage**: Only when gas savings justify complexity and team has expertise
- **Testing strategy**: Unit + integration minimum, add fuzz/invariant for high-value contracts

**High Freedom** (multiple valid approaches, context-dependent)

These depend on specific requirements:
- **Contract architecture**: Inheritance patterns, module organization
- **Documentation detail**: Level of NatSpec based on contract complexity
- **Optimization priority**: Balance gas savings vs. code clarity
- **Tool selection**: Foundry, Hardhat, or Truffle based on team preference

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

### Custom Errors

Replace expensive `require` strings with custom errors for 50-100 gas savings per revert. Custom errors use minimal 4-byte selectors.

### Storage Optimization

**Pack variables** to minimize storage slots - frequently accessed data should use packed structs to reduce SLOAD operations.

### Function Optimization

**Use unchecked arithmetic** when overflow is impossible to save 30-40 gas per increment.

**Prefer calldata over memory** for external function parameters to avoid expensive data copying.

### Quantified Gas Savings

| Optimization | Gas Saved | When to Apply |
| ------------------------ | ------------------ | ------------------------- |
| Custom errors vs strings | ~50-100 per revert | Always |
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

## Testing Standards

**Minimum test coverage requirements**:

- **Unit tests**: Each function, all branches
- **Integration tests**: Contract interactions
- **Fuzz tests**: Input validation, edge cases
- **Invariant tests**: Protocol invariants
- **Gas benchmarks**: Performance regression prevention

Use Foundry/Forge for testing with patterns including `vm.expectRevert`, fuzz testing with `testFuzz_*`, and invariant testing.

## Workflows

Use these checklists for complex multi-step tasks.

### Smart Contract Security Audit

```
Security Audit Progress:
- [ ] Step 1: Review access control implementation
- [ ] Step 2: Check for reentrancy vulnerabilities
- [ ] Step 3: Verify upgradeable contract safety
- [ ] Step 4: Analyze gas optimization opportunities
- [ ] Step 5: Review documentation completeness
- [ ] Step 6: Validate error handling
- [ ] Step 7: Check for common pitfalls
```

**Step 1: Access control.** Ownable2Step for a single admin, a modifier on every restricted function, role hierarchies configured, no missing checks. See [references/security/access-control.md](references/security/access-control.md).

**Step 2: Reentrancy.** CEI in every function that makes an external call, state updates before calls, a guard where CEI is insufficient, no unprotected external calls in loops. See [references/security/reentrancy.md](references/security/reentrancy.md).

**Step 3: Upgrade safety.** `_disableInitializers()` in the constructor, `_authorizeUpgrade` with access control, append-only storage layout, ERC-7201 namespaced storage. See [references/security/upgrades.md](references/security/upgrades.md).

**Step 4: Gas.** Custom errors instead of require strings, packed storage, calldata for external parameters, unchecked arithmetic where safe. See [references/performance/gas-optimization.md](references/performance/gas-optimization.md).

**Step 5: Documentation.** NatSpec on every public and external function, complete `@notice`, `@dev`, `@param`, and `@return` tags, a security contact, and complex logic explained in `@dev`. See [references/documentation/natspec-standards.md](references/documentation/natspec-standards.md).

### Gas Optimization Review

```
Gas Optimization Progress:
- [ ] Step 1: Replace require strings with custom errors
- [ ] Step 2: Optimize storage layout and packing
- [ ] Step 3: Use calldata for external parameters
- [ ] Step 4: Add unchecked arithmetic where safe
- [ ] Step 5: Optimize loops with cached lengths
- [ ] Step 6: Review assembly optimization opportunities
- [ ] Step 7: Benchmark and compare gas usage
```

See [references/performance/gas-optimization.md](references/performance/gas-optimization.md).

### Upgradeable Contract Deployment

```
Deployment Progress:
- [ ] Step 1: Deploy implementation contract
- [ ] Step 2: Verify _disableInitializers() in constructor
- [ ] Step 3: Prepare initialization calldata
- [ ] Step 4: Deploy proxy contract
- [ ] Step 5: Verify proxy points to implementation
- [ ] Step 6: Test initialization via proxy
- [ ] Step 7: Verify _authorizeUpgrade access control
```

See [references/security/upgrades.md](references/security/upgrades.md).

## Common Pitfalls and Anti-Patterns

- **External calls before state updates** - Violates CEI pattern, enables reentrancy
- **Missing access control** - Functions that should be restricted are public
- **Unprotected initializers** - Implementation contracts can be initialized by attackers
- **Storage layout changes in upgrades** - Inserting/deleting variables corrupts data
- **Unbounded loops** - Can exceed block gas limits, causing DoS
- **Assembly without expertise** - Complex, error-prone, hard to audit
- **Missing NatSpec** - Undocumented functions hinder integration and audits
- **Magic numbers** - Hardcoded values without explanation
- **No events for state changes** - Makes monitoring and debugging difficult
- **Ignoring return values** - Silent failures from external calls
- **Expensive require strings** - Use custom errors instead

## Reference Files

- **Security**: [references/security/reentrancy.md](references/security/reentrancy.md), [references/security/access-control.md](references/security/access-control.md), [references/security/upgrades.md](references/security/upgrades.md)
- **Performance**: [references/performance/gas-optimization.md](references/performance/gas-optimization.md), [references/performance/solady-patterns.md](references/performance/solady-patterns.md)
- **Documentation**: [references/documentation/natspec-standards.md](references/documentation/natspec-standards.md)
- **Workflows**: [references/workflows/refactoring-patterns.md](references/workflows/refactoring-patterns.md) (before/after fixes), [references/workflows/troubleshooting.md](references/workflows/troubleshooting.md) (compiler, deployment, runtime, gas, and test failures)

## Version Compatibility

This skill assumes:

- Solidity 0.8.20+ (or 0.8.24+ for transient storage)
- OpenZeppelin Contracts v5.x
- Solady (recent release)
- Foundry for testing and development

Always verify compatibility for your specific use case.
