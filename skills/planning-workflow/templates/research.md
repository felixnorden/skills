# Research Document Template

**Usage**: Produced during the QRSPI Research (R) phase by the Research Agent. Plan Agent reads this before entering the Design phase. Do not suggest improvements, critique, or plan — document only what exists.

**Constraints**:
- Document prose: 300–500 words
- Detailed Findings: capped at 5 subsections
- Code References: capped at 10 entries
- Inline summary: 5–10 lines, no duplication of document body

---

## Document

**Path**: `<worktree-root>/.opencode/research/YYYYMMDD-{topic-slug}.md`

````markdown
---
date: {ISO datetime}
git_commit: {hash}
branch: {branch}
repository: {repo name}
topic: "{topic}"
subagents_used: [{roles invoked: locator | analyzer | pattern-finder}]
skills_consulted: [{skill names loaded, or "none"}]
status: complete
---

# Research: {topic}

## Research Question

{Original topic as stated — verbatim, not reframed.}

## Summary

{3–5 sentences: key components, their connections, and what matters for planning. Written for Plan Agent — what does a planner need to know about this area before designing a solution?}

## Detailed Findings

### {Component or Subsystem}

{Responsibilities, interfaces, data structures, control flow, and integration points with file:line references. One subsection per distinct component. Cap at 5 subsections total.}

## Key Patterns

{Conventions with file:line examples. Omit this section entirely if Pattern Finder was not invoked.}

## Code References

- `path/to/file:line` — {description}
- {… up to 10 entries}

## Open Questions

{Gaps and ambiguities that could not be resolved from the codebase. Each item is either a plan-time assumption for Plan Agent to make explicit, or a trigger for further research.}
````

---

## Inline Summary

Output this inline immediately after writing the document:

```
Research complete: .opencode/research/{filename}.md

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
