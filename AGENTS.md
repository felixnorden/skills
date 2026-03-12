# AGENTS.md — Skill Authoring Standards

## SKILL.md Frontmatter

Required fields with hard constraints:

```yaml
---
name: processing-pdfs # gerund form preferred; lowercase, hyphens, numbers only; max 64 chars; no "anthropic" or "claude"
description: [what it does and when to use it — third person; max 1024 chars]
---
```

**Description rules:**

- Third person only — it is injected into the system prompt (`"Processes X"` not `"I can help with X"`)
- Include both capability and trigger: `"Extracts text from PDFs. Use when working with PDF files or when the user mentions document extraction."`
- Be specific — Claude selects from 100+ skills using this field alone

## File Structure

```
skill-name/
├── SKILL.md              # Overview and entry point; max 500 lines
├── reference.md          # Loaded on demand — link from SKILL.md
├── advanced.md           # Loaded on demand — link from SKILL.md
└── scripts/
    └── helper.py         # Executed, not loaded into context
```

**Rules:**

- Keep all references one level deep from SKILL.md — nested references may be partially read
- Use forward slashes in all paths — no backslashes
- Name files descriptively: `form_validation_rules.md` not `doc2.md`
- Add a table of contents to any reference file over 100 lines

## Content Standards

**Conciseness** — only add context Agent doesn't already have. Challenge every section: does Agent need this? Each token competes with conversation history once the skill loads.

**Degrees of freedom** — match specificity to fragility:

- High freedom (text instructions): multiple valid approaches, context-dependent decisions
- Medium freedom (pseudocode with parameters): preferred pattern exists, some variation acceptable
- Low freedom (exact scripts, no parameters): fragile operations, consistency critical

**No time-sensitive information** — move deprecated patterns to a collapsed `<details>` section rather than inline conditionals.

**Consistent terminology** — pick one term per concept and use it throughout (`field` not `field/box/element/control`).

## Scripts

- Handle errors explicitly — do not punt failures to Agent
- Document all constants — no magic numbers or unexplained values
- List all required packages and verify they are available in the execution environment
- Clarify intent per script: `"Run analyze.py to extract fields"` (execute) vs `"See analyze.py for the algorithm"` (read)
- Use MCP tools with fully qualified names: `ServerName:tool_name`

## Naming

Use gerund form: `processing-pdfs`, `analyzing-spreadsheets`, `managing-databases`.
Avoid: `helper`, `utils`, `tools`, `documents`, `data`.

## Checklist Before Committing

- [ ] `name` and `description` meet field constraints
- [ ] Description is third person and includes a trigger condition
- [ ] SKILL.md body is under 500 lines
- [ ] All file references are one level deep from SKILL.md
- [ ] No Windows-style paths
- [ ] No time-sensitive conditionals
- [ ] Terminology is consistent throughout
- [ ] Scripts handle errors explicitly and document all constants
- [ ] Required packages are listed
