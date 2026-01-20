# AGENTS.md - Skills Repository Guidelines

## Repository Overview

This repository contains AI agent skills - documentation packages that enhance Claude's capabilities for specific domains. Skills are markdown files loaded by Claude AI when triggered by relevant keywords.

## Structure

```
skills/
└── skill-name/
    ├── SKILL.md              # Main entry point, loaded by OpenCode/Claude
    ├── README.md             # Overview and usage guide
    └── topic-folders/        # Detailed documentation by category
        ├── topic1.md
        ├── topic2.md
        └── topic3.md
```

## Build/Lint/Test Commands

**This is a documentation repository with no build/test/lint commands.**

Skills are markdown files loaded by Claude AI. No compilation or execution required.

When working with projects that use these skills, consult the specific skill documentation for relevant commands.

## Skill Development Guidelines

### SKILL.md Requirements

- **Length limit**: Keep under 500 lines for core content
- **Frontmatter**: Required YAML header with name and description
- **Quick references**: Use tables for comparisons where applicable
- **Code examples**: All patterns must include working code in the relevant language
- **File references**: Link to detailed docs (e.g., `See [topic/topic1.md]`)
- **Trigger terms**: Include keywords that activate the skill

Example frontmatter:

```yaml
---
name: skill-name
description: Brief description explaining when to activate this skill. Include relevant trigger terms.
---
```

### Documentation Standards

**Markdown Conventions:**

- Use level 1 (`#`) only for main title
- Use level 2 (`##`) for major sections
- Use level 3 (`###`) for subsections
- Code blocks specify language: `solidity, `python, etc.
- Tables for comparisons (2-4 columns max)
- Bullet points for lists, numbered for steps

**File Organization:**

- SKILL.md: Core patterns only (~500 lines, quick reference)
- Topic folders: Detailed deep dives organized by category
- README.md: User-facing overview with triggers and examples
- FILE_STRUCTURE.md: Content map with line counts and statistics

**Content Guidelines:**

- Provide concrete, actionable examples
- Include quantified benefits when discussing optimizations
- Reference official documentation and standards
- Maintain version compatibility notes
- Keep explanations clear and concise

### Adding New Skills

1. Create folder: `skills/skill-name/`
2. Create `SKILL.md` with YAML frontmatter and trigger terms
3. Add `README.md` for overview and usage examples
4. Create topic folders for detailed content
5. Update `FILE_STRUCTURE.md` with file statistics
6. Add working code examples throughout
7. Include relevant trigger terms in description

### Quality Checklist

Before finalizing skill updates:

- [ ] SKILL.md under 500 lines
- [ ] YAML frontmatter complete with name and description
- [ ] All code examples are valid and tested
- [ ] Documentation on all public functions/applicable items
- [ ] Links to reference files work correctly
- [ ] README.md updated with new content and triggers
- [ ] FILE_STRUCTURE.md statistics current
- [ ] Trigger terms clearly identified
- [ ] Version compatibility noted where applicable
