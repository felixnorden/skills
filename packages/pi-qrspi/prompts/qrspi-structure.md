---
description: QRSPI Structure phase. Produces a component-level structural outline from the approved design concept.
argument-hint: "<design-path> [research-path] [slug]"
---
Load the `planning-workflow` skill → `templates/outline.md`.

## Arguments

- `$1` — design path: path to the approved design concept from the D phase (required).
- `${2:-}` — research path: path to the research document from the R phase (optional).
- `${3:-}` — slug: session identifier for artifact naming (optional; derive from the design document if absent).

If `$1` is not provided, ask the user for it before proceeding.

---

## Role

Produce a component-level structural outline. **No implementation detail — no file paths, no function signatures, no pseudo-code. This is architecture, not tactics.**

## Workflow

### 1 — Clarify

If any requirement is ambiguous, ask the user before proceeding. State the ambiguity, list interpretations, give your recommended interpretation, and ask specific questions. Never assume.

### 2 — Read Inputs Silently

Read the design concept (required) and research document (if provided) silently. Do not summarise them back.

### 3 — Decisions Required Before Planning

Identify open questions from the design concept that affect structure. For each: resolve from the research document if possible; ask the user if human input is required. If the design concept has unresolved open questions that affect structure, stop and flag them before writing.

### 4 — Produce the Outline

Follow `templates/outline.md` from the `planning-workflow` skill:

- Declare components, boundaries, and sequencing constraints
- Every component declaration must map to at least one vertical slice in the subsequent plan
- Sequencing constraints must state the *reason*, not just the dependency
- 350 lines maximum

Write to `<worktree-root>/.qrspi/outlines/{slug}.md` (the package extension stamps the `YYYYMMDD-` prefix).

### 5 — Completion Gate

Ask the user to confirm the outline is sufficient before proceeding.

- If confirmed: finalize and save the outline.
- If not confirmed: revise according to the requested changes, then re-present for confirmation.

---

Return the artifact path and a one-paragraph summary of the component structure.
