# Research Document Template

**Usage**: Produced during the QRSPI Research (R) phase by the Research Agent.
Plan Agent reads this before the Design phase.
Document only what exists. Do not suggest improvements, critique, or plan.

**Constraints**:

- Document prose: ~100 words per subsection (guide, not a hard cap), excluding the **Research Question** and **Summary** sections
- Detailed Findings:
  - succinct prose, sacrifice grammar for concision
  - one line per sentence
- Code References:
  - capped at 3 entries per finding
  - order entries based on importance High -> Low
- Inline summary: 5–10 lines, no duplication of document body

---

## Document

**Path**: `<worktree-root>/.qrspi/research/YYYYMMDD-{topic-slug}.md`

```markdown
---
date: { ISO datetime }
git_commit: { hash }
branch: { branch }
repository: { repo name }
topic: "{topic}"
skills_consulted: [{ skill names loaded, or "none" }]
status: complete
---

# Research: {topic}

## Research Question

{Original topic verbatim, not reframed.}

## Summary

{3–5 sentences: key components, their connections, what matters for planning. Written for Plan Agent: what must a planner know before designing a solution?}

## Detailed Findings

### {Component or Subsystem}

{Responsibilities, interfaces, data structures, control flow, and integration points with file:line references. One subsection per distinct component.}

## Key Patterns

{Conventions with file:line examples. Omit this section if Pattern Finder was not invoked.}

## Code References

- `path/to/file:line` — {description}
- {…}

## Open Questions

{Gaps and ambiguities that could not be resolved from the codebase. Each item is either a plan-time assumption for Plan Agent to make explicit, or a trigger for further research.}
```

---

## Inline Summary

Output this inline immediately after writing the document:

```
Research complete: .qrspi/research/{filename}.md

Key files:
- {path} — {one line}

Key patterns (if applicable):
- {pattern with file:line}

Skills consulted:
- {skill name} — {what it contributed, or "none relevant found"}

Open questions:
- {question}

Plan Agent: read the full document before planning.
```
