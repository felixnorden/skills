---
name: planning-workflow
description: Guides structured software planning through reusable templates. Covers design concept authoring and implementation plan authoring with vertical slices. Use when starting a new feature, designing a solution before implementation, producing a phased plan for a build agent, or when the user mentions planning, design phase, implementation plan, QRSPI, or vertical slices.
---

# Planning Workflow

Planning produces artifacts that a build agent can execute without ambiguity.
The templates in this skill enforce the discipline that separates planning from implementation: design decisions are made before structure is committed, structure is committed before implementation is tasked, and each implementation phase is independently verifiable.

The core constraint across all templates: **no implementation detail in the design phase, no design decisions in the plan phase, no new behavior in a verification gate.**

---

## Vertical Slicing

All implementation plans produced with this skill decompose work into **vertical slices** — units of change that deliver one complete, observable behavior end-to-end, from the outermost interface to the innermost dependency.

A vertical slice is not a layer (not "implement the database layer"). It is a behavior (e.g., "a user can place an order and receive a confirmation"). Each slice:

- Has a failing test written before any implementation begins (TDD red phase)
- Delivers something demonstrable at its verification gate
- Can be deployed or rolled back independently of other slices

Horizontal slicing — grouping changes by technical layer across multiple behaviors — is the primary anti-pattern. A plan where Phase 1 is "all models", Phase 2 is "all services", Phase 3 is "all controllers" cannot be verified incrementally and produces no working software until the final phase.

For TDD integration within each slice, load `skill:tdd` before authoring the Tests First section of any phase.

---

## Templates

Load the appropriate template on demand. Do not load all templates at once.

| Template                                                   | Load when                                                                                                                                         |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| [templates/research.md](templates/research.md)             | Producing a research document during the R phase; need the document schema, frontmatter fields, and inline summary format                         |
| [templates/design-concept.md](templates/design-concept.md) | Starting the design phase of a QRSPI workflow; need to document solution shape, direction chosen, and alternatives before committing to structure |
| [templates/plan.md](templates/plan.md)                     | Producing an implementation plan for a build agent; need phased, vertically-sliced, TDD-aligned plan with verification gates                      |

---

## Workflow Position

Templates map to QRSPI phases:

```
Q — Questions    → scope document (no template; freeform)
R — Research     → templates/research.md
D — Design       → templates/design-concept.md
S — Structure    → structure outline (no template; component declarations)
P — Plan         → templates/plan.md
I — Iterate      → templates/plan.md (surgical revision)
```

A design concept must exist and be approved before a plan is authored. If the design concept is absent, pause and complete the design phase first.
