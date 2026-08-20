# Solidity Development Best Practices

Production-grade patterns for Solidity smart contracts, based on implementations from OpenZeppelin and Solady. Covers security patterns, gas optimization, and documentation standards. Use when writing, reviewing, or auditing Solidity smart contracts.

## What it does

The skill sets out the security, performance, and documentation practices for production Solidity code. It covers reentrancy protection, access control, and upgradeable contract safety. It quantifies gas savings for each optimization. It defines NatSpec and testing standards, and provides checklists for audits, gas reviews, and deployments.

## What problem it solves

Smart contracts run permanently on a public blockchain. Exploits cost real money, and gas costs fall on users. A contract that skips accepted patterns, such as the Checks-Effects-Interactions order or access control, becomes hard to secure and hard to audit. The skill gathers the field's accepted patterns in one place, so a developer or reviewer applies them without rediscovering them.

## How it is structured

```
skills/solidity-development/
├── SKILL.md                          # the skill instructions
└── references/
    ├── REFERENCES.md                 # index of the reference files
    ├── security/
    │   ├── reentrancy.md             # CEI pattern and reentrancy guards
    │   ├── access-control.md         # ownership and role patterns
    │   └── upgrades.md               # upgradeable contract safety
    ├── performance/
    │   ├── gas-optimization.md       # quantified gas savings
    │   └── solady-patterns.md        # assembly and library patterns
    └── documentation/
        └── natspec-standards.md      # NatSpec tag requirements
```

## How to use it

Apply the skill when writing, reviewing, or auditing Solidity contracts, or when the user mentions EVM, Ethereum, blockchain development, smart contracts, gas optimization, or security audits. Start with the library table: OpenZeppelin for security-critical code, Solady for gas-critical code. Follow the low-freedom patterns exactly, especially the CEI order and custom errors. Use the workflow checklists for audits, gas reviews, and upgradeable deployments. Test with Foundry: unit, integration, fuzz, and invariant tests, plus gas benchmarks.

## Provenance

Original skill in this repository.

See SKILL.md for the full agent-facing instructions.
