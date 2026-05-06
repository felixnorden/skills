# Structure Outline Template

**Usage**: Produced during the QRSPI Structure (S) phase. Declares components, boundaries, and sequencing constraints. Plan Agent reads this before authoring the implementation plan. No implementation detail — this is architecture, not tactics.

**Constraints**:

- 250–350 lines maximum
- No file paths, no function signatures, no pseudo-code
- Every component declaration must map to at least one vertical slice in the subsequent plan
- Sequencing constraints must state the _reason_, not just the dependency — the reason determines whether components can be partially parallelised
- If the design concept has unresolved open questions that affect structure, stop and flag them before writing

## How to Produce This Document

1. Read the design concept and research document silently.
2. Identify `Decisions Required Before Planning` implied by the design concept's open questions. For each: resolve from the research document if possible; use `question` if human input is required.
3. Write the document using the schema below.
4. Write to `<worktree-root>/.opencode/outlines/YYYYMMDD-{slug}.md`.
5. Return the artifact path and a one-paragraph summary of the component structure.

---

## Schema

**Path**: `<worktree-root>/.opencode/outlines/YYYYMMDD-{slug}.md`

```markdown
---
date: { ISO datetime }
slug: { slug }
design: { path to design concept artifact }
research: { path to research artifact }
status: draft
---

# Structure Outline: {slug}

## Components

### {Component name}

**Responsibility**: {one sentence — what this component owns}
**Interface**: {what it exposes — inputs, outputs, events emitted; no implementation detail}
**Dependencies**: {other components it calls or receives from; external dependencies it crosses}

### {Next component}

...

---

## Boundaries

{Where ownership changes. Each boundary is a point where a different component, team, or technology takes over. Boundaries determine where test doubles are placed in the implementation.}

- **{Boundary name}**: {what crosses it, in which direction, and why it is a boundary}

---

## Sequencing Constraints

{Which components must exist — or have their interface defined — before others can be built. This feeds directly into the vertical slice ordering in the plan.}

| Component   | Depends on        | Reason |
| ----------- | ----------------- | ------ |
| {component} | {other component} | {why}  |

---

## Decisions Required Before Planning

{Structural unknowns the planner must either resolve or state as explicit assumptions. These are not design questions — design is closed. These are questions about how the structure maps to implementation.}

- {e.g., Does the notification component own its retry logic or delegate it to the queue infrastructure?}
- {e.g., What is the wire format at the gateway boundary?}
```
