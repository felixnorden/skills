# Implementation Plan Template

**Usage**: Produced during the QRSPI Plan (P) phase. Load `skill:tdd` before authoring any "Tests First" section. Each phase is a vertical slice — one complete, observable behavior end-to-end. Build Agent executes phases in order; each Verification Gate must pass before the next phase begins.

**Constraints**:
- Prose under 800 words, excluding code blocks
- Code samples are illustrative (locate insertion point, show pattern) — not complete implementations
- Each phase must deliver something demonstrable at its verification gate
- No phase may be a technical layer (e.g., "implement all models") — each phase is a behavior
- In verification gates, use tools over bash commands where available

---

````markdown
# {Feature/Task Name} — Implementation Plan
**Date**: {ISO date}
**Status**: ready
**Design concept**: {path to design concept artifact}
**Research artifact**: {path to research artifact}
**Issue**: {link — omit if no issue is referenced}

---

## Overview

{What we are implementing and why — 2–4 sentences. Reference the design concept by name, not by repeating its content.}

## Skills Consulted

- `{skill-name}` — {what it contributed}
- _(none relevant)_ — if no skills were loaded

## Research Summary

{Findings from the Research Gate: libraries, APIs, patterns verified. One source per claim. If nothing needed research, state "No external research required."}

## Current State Analysis

{What exists now, what is missing, key constraints. File:line references for every relevant finding.}

## Desired End State

{Specification of the completed feature and how to verify it is correct from the outside — what a caller or user observes.}

## Slice Order Rationale

{Why the slices are ordered as they are. Identify the highest-risk or highest-uncertainty slice and confirm it appears early. Identify any hard dependency ordering between slices (Slice 2 depends on the interface established in Slice 1, etc.).}

## Out of Scope

{Explicitly list what we are NOT doing. Taken from the design concept's exclusions. Prevents scope creep during implementation.}

---

## Slice 1 — {Behavior Name, not Layer Name}

### What this slice delivers

{One paragraph: what Build Agent will be able to demonstrate at the end of this slice. Written as an observable outcome — what a caller sees, not what code was written.}

### Tests First (Red)

{Before writing any implementation, Build Agent writes these tests. They must fail at the start of this slice for the right behavioral reason — not a compilation error.}

Load `skill:tdd` → `references/test-doubles.md` and `assets/test-template.md` for double selection and scaffold.

- **{Test name following "subject does what when condition" convention}**
  - Arrange: {what to set up — subject, doubles, inputs}
  - Act: {what to invoke}
  - Assert: {what observable outcome to verify}

- **{Test name}**
  - Arrange: {…}
  - Act: {…}
  - Assert: {…}

- **{Edge case or error path test}**
  - Arrange: {…}
  - Act: {…}
  - Assert: {expected error or boundary behavior}

### Implementation (Green)

#### {Component or file}

**File**: `path/to/file.ext`
**Action**: create / modify / delete
**Reason**: {why this change is needed to make the tests above pass}

```language
// Enough context to locate the insertion point:
// include enclosing function signature or surrounding block.
// Do not write the full implementation.
```

#### {Next component or file}

**File**: `path/to/file.ext`
**Action**: create / modify / delete
**Reason**: {why}

```language
// Insertion point context only
```

### Patterns to Follow

- {Pattern name}: `file:line` — {description and why Build Agent must match it}

### Refactor (if needed)

{Identify any structural improvements that are safe once tests are green. No new behavior. If none, state "No refactor needed for this slice."}

### Verification Gate — Slice 1

**Build Agent must complete every item before starting Slice 2.**

Automated:
- [ ] All tests written in "Tests First" above pass
- [ ] `{additional command}` — {expected outcome}
- [ ] `{lint or type-check command}` — zero errors

Manual:
- [ ] {Observable behavior to confirm from the outside — what a caller or user sees}

---

## Slice 2 — {Behavior Name}

### What this slice delivers

{…}

### Tests First (Red)

{…}

### Implementation (Green)

{…}

### Patterns to Follow

{…}

### Refactor (if needed)

{…}

### Verification Gate — Slice 2

**Build Agent must complete every item before starting Slice 3.**

Automated:
- [ ] All tests written in "Tests First" above pass
- [ ] `{command}` — {expected outcome}

Manual:
- [ ] {Observable behavior}

---

## Risk Register

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| {risk} | low / med / high | low / med / high | {mitigation} |

---

## Final Verification

After all slices and their Verification Gates pass:

- [ ] All plan requirements implemented
- [ ] All Verification Gates passed
- [ ] No regressions in adjacent functionality
- [ ] Each slice's tests pass in isolation (no cross-slice test pollution)
- [ ] {Any deployment or migration step}
````
