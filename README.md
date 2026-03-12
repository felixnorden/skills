# Open Agent Skills

Open knowledge for agentic development.

## What Are Agent Skills?

Agent skills are documentation packages that enhance AI agents with domain-specific knowledge and capabilities. Skills contain best practices, patterns, code examples, and guidelines that help agents perform specialized tasks more effectively.

Think of agent skills as expert knowledge bases that agents can access when working in specific domains. A Solidity Development skill helps agents write secure smart contracts. A Python Development skill guides agents through Python best practices. Each skill represents accumulated wisdom from experts, refined into actionable guidance.

## Skill Format

Skills follow the [Agent Skills specification](SPECIFICATION.md). Each skill is a directory containing at minimum a `SKILL.md` file:

```
skill-name/
├── SKILL.md          # Required
├── scripts/          # Optional - executable code (inside skill folder)
├── references/       # Optional - additional documentation (inside skill folder)
└── assets/           # Optional - templates and static resources (inside skill folder)
```

These optional directories must be nested inside the skill folder itself, not placed at the same level as the skill folder.

The `SKILL.md` file contains YAML frontmatter with skill metadata and Markdown instructions.

## Best Practices

This repository follows best practices provided by Anthropic to ensure high-quality skill development. The [AGENTS.md](AGENTS.md) file provides detailed guidelines for:

- Structuring skills for optimal agent performance
- Writing clear, actionable instructions
- Including reference material for key libraries and frameworks
- Capturing maintainer knowledge and domain expertise
- Following consistent naming and formatting conventions

Use AGENTS.md as your guide when creating new skills to ensure they meet quality standards and provide maximum value to agents.

## Available Skills

### Solidity Development

Comprehensive smart contract development best practices:

- Security patterns (reentrancy protection, access control, upgrade safety)
- Gas optimization techniques (custom errors, storage packing, assembly patterns)
- Documentation standards (complete NatSpec coverage)
- Production deployment guidelines

## For Users

Agent skills integrate with compatible AI agents and enhance their capabilities in specific domains. When you work with an agent on a relevant task, the agent automatically accesses the appropriate skill knowledge.

Skills work behind the scenes to improve agent quality without requiring user configuration.

## For Contributors

We welcome contributions from developers, domain experts, and AI researchers:

1. **Choose your domain** - Areas of expertise with established best practices
2. **Follow the guidelines** - See [AGENTS.md](AGENTS.md) for skill structure and standards
3. **Create comprehensive content** - Patterns, examples, and practical guidance backed by reference material
4. **Submit your skill** - Share knowledge with the community

## License

This repository is licensed under the MIT License. See the LICENSE file for details.

## Getting Started

1. **Browse existing skills** in the skills/ directory
2. **Read skill documentation** to understand patterns and best practices
3. **Contribute your expertise** by adding new skills following [AGENTS.md](AGENTS.md)

Welcome to open agentic development.
