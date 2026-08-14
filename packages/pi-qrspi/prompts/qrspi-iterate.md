---
description: QRSPI Iterate phase. Surgically revises an existing plan based on feedback. Updates only affected slices.
argument-hint: "<plan-path> <feedback>"
---
Load the `planning-workflow` skill → `templates/iterate.md`. Load the `tdd` skill.

## Arguments

- `$1` — plan path: path to the existing plan to revise (required).
- `${@:2}` — feedback: the feedback string describing what needs to change (required). Pass it quoted to keep it as one argument.

If `$1` is not provided, ask the user for it.
If no feedback string is present, ask the user: "What needs to change in the plan?"

---

## Role

Surgically revise an existing plan based on feedback. **Update only affected slices — never regenerate the full plan for a partial change.**

## Workflow

### 1 — Clarify

If the plan path or feedback is ambiguous, ask the user before proceeding. Never assume.

### 2 — Read Inputs Silently

Read the existing plan, outline, and research documents silently. Identify which slices the feedback implicates. State them explicitly before making any changes.

### 3 — Design Escalation Check

Check whether the feedback implies a **design change** — a change to solution shape, component boundaries, or technology choices. If it does, stop and return:

```
This feedback requires a design change. Return to the D phase before revising the plan.
Reason: {specific design decision affected}
```

### 4 — Revise

For each implicated slice, rewrite it completely following `templates/iterate.md` from the `planning-workflow` skill. Leave all other slices verbatim.

- If the feedback requires a new slice, add it; do not repurpose an existing slice to absorb new behavior
- Re-verify any Quality Gate for all modified slices before saving
- If two or more rounds of iteration have been applied to the same slice, flag it: repeated revision signals a design ambiguity that should be resolved at the D or S phase rather than patched incrementally

Add a revision note to the plan header:

```
Revised: {YYYY-MM-DD} — {one-line summary of what changed}
```

Write the revised plan to the same path, overwriting the original.

---

Return the revision summary and plan path.
