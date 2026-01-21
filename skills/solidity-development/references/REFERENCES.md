# Solidity Development References

This document outlines the reference materials available for Solidity development, organized by domain.

## Reference Structure

### Security References (`references/security/`)

- **access-control.md** - Comprehensive guide to access control patterns including role-based access control, ownership patterns, and permission management
- **reentrancy.md** - Detailed coverage of reentrancy vulnerabilities, protection patterns, and security best practices
- **upgrades.md** - Smart contract upgrade patterns, proxy patterns, and migration strategies

### Performance References (`references/performance/`)

- **gas-optimization.md** - Gas optimization techniques, patterns, and benchmarks for efficient Solidity code
- **solady-patterns.md** - Advanced patterns using Solady library components and gas-efficient implementations

### Documentation References (`references/documentation/`)

- **natspec-standards.md** - NatSpec documentation standards, annotations, and best practices for contract documentation

## Navigation Guide

### For Security Concerns
When addressing security vulnerabilities or implementing secure patterns:
1. Start with `security/access-control.md` for permission management
2. Reference `security/reentrancy.md` for call protection patterns
3. Consult `security/upgrades.md` for upgradeable contract security

### For Performance Optimization
When optimizing gas usage or improving contract efficiency:
1. Review `performance/gas-optimization.md` for general optimization techniques
2. Reference `performance/solady-patterns.md` for library-based optimizations

### For Documentation
When creating comprehensive contract documentation:
1. Follow guidelines in `documentation/natspec-standards.md`

## Usage Notes

- All reference files contain detailed code examples and explanations
- Security references include critical warning sections for known vulnerabilities
- Performance references provide benchmarking data where applicable
- Reference files are loaded on-demand when the skill is activated for specific tasks

## File Dependencies

- Security references may reference patterns documented in performance references
- All references assume familiarity with concepts covered in the main SKILL.md
