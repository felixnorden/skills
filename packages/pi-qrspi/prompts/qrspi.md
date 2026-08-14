---
description: Start a full QRSPI planning workflow. Guides Q → R → D → S → P interactively with a human checkpoint at each phase.
argument-hint: "<topic> [slug] [ticket]"
---
Load the `planning-workflow` skill (read its `SKILL.md`; templates live under `templates/`).

## Arguments

- `$1` — topic to be planned (required). If passed as multiple unquoted words, join them.
- `${2:-}` — slug: short kebab-case identifier for the feature (e.g. `add-payment-flow`). If absent, derive one from the topic after the Q phase.
- `${3:-}` — ticket: issue reference to attach to all artifacts (e.g. `ENG-123`). Optional.

---

## Execution Model

Run each phase in a separate agent session if your environment supports sub-agents — this isolates each phase's context. Otherwise run the phases directly in this session.

Each phase produces an artifact. The artifact path from one phase becomes an input to the next.

The package extension stamps artifact filenames automatically: write to `.qrspi/<kind>/<slug>.md` and the date prefix (`YYYYMMDD-`) is added from the host clock.

---

## Phases

Execute in order. **Ask the user for approval at each checkpoint — do not advance until approved.** If the user requests changes, revise the phase output and re-present it.

**Q — Questions**: Gather goal, hard constraints, and out-of-scope items. Do not save a file. Derive the slug if not provided. Checkpoint.

**R — Research**: Produce a research document for the topic following `planning-workflow` → `templates/research.md`. Write to `<worktree-root>/.qrspi/research/{slug}.md` (the extension stamps the `YYYYMMDD-` prefix). Present the inline summary. Checkpoint.

**D — Design**: Produce a design concept from the research document following `templates/design-concept.md`. Write to `<worktree-root>/.qrspi/designs/{slug}.md` (extension stamps the date). Present the concept. Checkpoint.

**S — Structure**: Produce a component-level outline from the approved design following `templates/outline.md`. Write to `<worktree-root>/.qrspi/outlines/{slug}.md` (extension stamps the date). Present the outline. Checkpoint.

**P — Plan**: Produce a vertically-sliced, TDD-aligned implementation plan from the outline following `templates/plan.md` (load the `tdd` skill for the Tests First sections). Write to `<worktree-root>/.qrspi/plans/{slug}.md` (extension stamps the date). Present the inline summary. Checkpoint.

**I — Iterate** (only on revision request): revise the plan surgically following `templates/iterate.md`, updating only the slices the feedback implicates.

---

On completion, follow the format in `planning-workflow` → `templates/session-summary.md`.
