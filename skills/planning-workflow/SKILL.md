---
name: planning-workflow
description: Guides structured software planning through reusable templates. Covers design concepts, implementation plans with vertical slices, and agent configuration. Use when starting a new feature, designing a solution before implementation, producing a phased plan for a build agent, or when the user mentions planning, design phase, implementation plan, QRSPI, or vertical slices.
---

# Planning Workflow

Planning produces artifacts a build agent can execute without ambiguity. The templates enforce order: design decisions before structure, structure before implementation tasks, and each phase independently verifiable.

The core constraint across all templates: **no implementation detail in the design phase, no design decisions in the plan phase, no new behavior in a verification gate.**

---

## Vertical Slicing

All implementation plans produced with this skill decompose work into **vertical slices**: units of change that deliver one complete, observable behavior end-to-end, from the outermost interface to the innermost dependency.

A vertical slice is not a layer (not "implement the database layer"). It is a behavior (e.g., "a user can place an order and receive a confirmation").

Each slice:

- Has a failing test written before any implementation begins (TDD red phase)
- Delivers something demonstrable at its verification gate
- Can be deployed or rolled back independently of other slices

**IMPORTANT**: Horizontal slicing, grouping changes by technical layer across multiple behaviors, is the primary anti-pattern. A plan where Phase 1 is "all models", Phase 2 is "all services", Phase 3 is "all controllers" cannot be verified incrementally and produces no working software until the final phase.

Load relevant skills before authoring any Tests First section.

---

## Session Structure (Orchestrated)

A QRSPI session runs with one orchestrator and per-phase agents. One phase at a time; every phase ends at a human checkpoint. The orchestrator never drafts artifacts. Phase agents draft in fresh contexts, keeping exploration and drafting out of the orchestrator's context.

**Orchestrator owns**: the Q phase, launching each phase agent, relaying user answers (Design phase), previewing each artifact to the user at its checkpoint, approving or denying advancement, coordinating Iterate, and producing the session summary.

**Phase agent owns**: loading the current phase's template, reading the prior artifacts, drafting and writing the artifact to `.qrspi/<kind>/<slug>.md`, and returning the inline summary.

**Phase agent rules**:

- Load only the template for the current phase. Do not draft artifacts for other phases.
- Do not ask the user questions directly. Return clarifying questions, design options, or unresolved decisions in your final output; the orchestrator relays them.
- Convert unresolved ambiguities into explicit assumptions in the artifact (Open Questions / Decisions Required sections) rather than blocking.
- The package extension stamps the `YYYYMMDD-` prefix and the frontmatter on your write; write to `.qrspi/<kind>/<slug>.md` and let it normalize.

**Artifact visibility**: the orchestrator previews each artifact to the user after the phase agent writes it, full content and stamped frontmatter included, using a user-facing preview tool so the artifact never enters the orchestrator's context. Fall back to `read` only if no user-facing preview tool exists. Do not approve blind.

---

## Templates

One template per phase. Each is self-contained: output schema + production instructions. Load only what the current phase requires.

| Template                                                     | Phase | Load when                                                                                                       |
| ------------------------------------------------------------ | ----- | --------------------------------------------------------------------------------------------------------------- |
| [templates/research.md](templates/research.md)               | R     | Producing a research document; need the schema, frontmatter fields, and inline summary format                   |
| [templates/design-concept.md](templates/design-concept.md)   | D     | Producing a design concept; need the output schema and production instructions                                  |
| [templates/outline.md](templates/outline.md)                 | S     | Producing a structure outline; need the component schema, boundary format, and production instructions          |
| [templates/plan.md](templates/plan.md)                       | P     | Producing an implementation plan; need the vertical slice schema, Tests First structure, and verification gates |
| [templates/iterate.md](templates/iterate.md)                 | I     | Revising an existing plan; need the surgical revision workflow, design escalation rule, and output format       |
| [templates/session-summary.md](templates/session-summary.md) | —     | Completing an orchestrated QRSPI session; need the artifact path summary format                                 |

---

## Workflow Position

```
Q — Questions    → use question tool
R — Research     → templates/research.md
D — Design       → templates/design-concept.md
S — Structure    → templates/outline.md
P — Plan         → templates/plan.md
I — Iterate      → templates/iterate.md
```

A plan requires an approved design concept. If none exists, complete the Design phase first.
