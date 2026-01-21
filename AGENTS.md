# AGENTS.md - Skills Repository Guidelines

## Repository Overview

This repository contains AI agent skills - documentation packages that enhance AI agents with domain-specific knowledge and capabilities. Skills follow a standardized format defined in the [SPECIFICATION.md](SPECIFICATION.md) file.

## Directory Structure

A skill is a directory containing at minimum a `SKILL.md` file:

```
skill-name/
└── SKILL.md          # Required
├── scripts/          # Optional - executable code (inside skill folder)
├── references/       # Optional - additional documentation (inside skill folder)
└── assets/           # Optional - templates and static resources (inside skill folder)
```

### Optional Directories

**scripts/** - Contains executable code that agents can run. Scripts should:

- Be self-contained or clearly document dependencies
- Include helpful error messages
- Handle edge cases gracefully
- Supported languages depend on the agent implementation (Python, Bash, JavaScript, etc.)

**references/** - Contains additional documentation that agents can read when needed:

- `REFERENCE.md` - Detailed technical reference
- `FORMS.md` - Form templates or structured data formats
- Domain-specific files (`finance.md`, `legal.md`, etc.)

**assets/** - Contains static resources:

- Templates (document templates, configuration templates)
- Images (diagrams, examples)
- Data files (lookup tables, schemas)

## SKILL.md Format

The `SKILL.md` file must contain YAML frontmatter followed by Markdown content.

### Frontmatter Fields

| Field           | Required | Constraints                                                                                                       |
| --------------- | -------- | ----------------------------------------------------------------------------------------------------------------- |
| `name`          | Yes      | Max 64 characters. Lowercase letters, numbers, and hyphens only. Must not start or end with a hyphen.             |
| `description`   | Yes      | Max 1024 characters. Non-empty. Describes what the skill does and when to use it.                                 |
| `license`       | No       | License name or reference to a bundled license file.                                                              |
| `compatibility` | No       | Max 500 characters. Indicates environment requirements (intended product, system packages, network access, etc.). |
| `metadata`      | No       | Arbitrary key-value mapping for additional metadata.                                                              |
| `allowed-tools` | No       | Space-delimited list of pre-approved tools the skill may use. (Experimental)                                      |

### `name` Field (Required)

The `name` field must:

- Be 1-64 characters
- Contain only unicode lowercase alphanumeric characters and hyphens (`a-z` and `-`)
- Not start or end with `-`
- Not contain consecutive hyphens (`--`)
- Match the parent directory name

Valid examples:

```yaml
name: pdf-processing
name: data-analysis
name: code-review
```

Invalid examples:

```yaml
name: PDF-Processing  # uppercase not allowed
name: -pdf  # cannot start with hyphen
name: pdf--processing  # consecutive hyphens not allowed
```

### `description` Field (Required)

The `description` field must:

- Be 1-1024 characters
- Describe both what the skill does and when to use it
- Include specific keywords that help agents identify relevant tasks

Good example:

```yaml
description: Extracts text and tables from PDF files, fills PDF forms, and merges multiple PDFs. Use when working with PDF documents or when the user mentions PDFs, forms, or document extraction.
```

Poor example:

```yaml
description: Helps with PDFs.
```

### `license` Field (Optional)

The optional `license` field specifies the license applied to the skill. We recommend keeping it short (either the name of a license or the name of a bundled license file).

Example:

```yaml
license: Apache-2.0
```

Or for proprietary licenses:

```yaml
license: Proprietary. LICENSE.txt has complete terms
```

### `compatibility` Field (Optional)

The optional `compatibility` field (1-500 characters if provided) should only be included if your skill has specific environment requirements. It can indicate intended product, required system packages, network access needs, etc.

Examples:

```yaml
compatibility: Designed for Claude Code (or similar products)
compatibility: Requires git, docker, jq, and access to the internet
```

Most skills do not need the `compatibility` field.

### `metadata` Field (Optional)

The optional `metadata` field is a map from string keys to string values. Clients can use this to store additional properties not defined by the Agent Skills spec. We recommend making key names reasonably unique to avoid accidental conflicts.

Example:

```yaml
metadata:
  author: example-org
  version: "1.0"
```

### `allowed-tools` Field (Optional)

The optional `allowed-tools` field is a space-delimited list of tools that are pre-approved to run. This is experimental - support may vary between agent implementations.

Example:

```yaml
allowed-tools: Bash(git:*) Bash(jq:*) Read
```

### Body Content

The Markdown body after the frontmatter contains the skill instructions with no format restrictions. Write whatever helps agents perform the task effectively.

Recommended sections:

- Step-by-step instructions
- Examples of inputs and outputs
- Common edge cases

## Progressive Disclosure

Skills should be structured for efficient use of context:

1. **Metadata** (~100 tokens): The `name` and `description` fields are loaded at startup for all skills
2. **Instructions** (< 5000 tokens recommended): The full `SKILL.md` body is loaded when the skill is activated
3. **Resources** (as needed): Files (e.g. those in `scripts/`, `references/`, or `assets/`) are loaded only when required

Keep your main `SKILL.md` under 500 lines. Move detailed reference material to separate files.

## File References

When referencing other files in your skill, use relative paths from the skill root:

```markdown
See [the reference guide](references/REFERENCE.md) for details.

Run the extraction script:
scripts/extract.py
```

Keep file references one level deep from `SKILL.md`. Avoid deeply nested reference chains.

## Validation

Use the [skills-ref](https://github.com/agentskills/agentskills/tree/main/skills-ref) reference library to validate your skills:

```bash
skills-ref validate ./my-skill
```

This checks that your `SKILL.md` frontmatter is valid and follows all naming conventions.

## Adding New Skills

1. Create folder: `skills/skill-name/`
2. Create `SKILL.md` with YAML frontmatter (name and description required)
3. Add optional directories as needed (scripts/, references/, assets/)
4. Validate your skill with `skills-ref validate`
5. Submit your skill to share knowledge with the community

## Quality Checklist

Before finalizing skill updates:

- [ ] SKILL.md frontmatter valid (name, description present)
- [ ] name field follows naming constraints (lowercase, hyphens, 1-64 chars)
- [ ] description field describes what skill does and when to use it
- [ ] SKILL.md under 500 lines
- [ ] File references one level deep from SKILL.md
- [ ] Validation passes with skills-ref
- [ ] All frontmatter fields documented with examples
- [ ] Optional directories explained with use cases
