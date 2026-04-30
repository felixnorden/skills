# Design Concept Template

**Usage**: Produced during the QRSPI Design (D) phase. The design-discussant sub-agent authors this after the engineer approves a direction.
Status remains `draft` until the orchestrator advances the checkpoint to `approved`.

**Constraints**:

- 150–250 lines
- No file paths, no function names, no pseudo-code, no code blocks
- Architecture and boundaries only — no implementation detail
- Stop when the solution shape is unambiguous; do not pad

---

```markdown
# Design Concept: {slug}

**Date**: {YYYY-MM-DD}
**Status**: draft
**Session**: {qrspi-session-id}
**Research artifact**: {path to research document}

---

## Problem Statement

{What we are solving, in the engineer's own terms. Taken directly from the scope goal — do not reframe or interpret. 2–4 sentences.}

---

## Design Direction Chosen

**Option selected**: {Name of the chosen option}

{Why this option was selected: what it optimises for, which constraints from the scope it satisfies, and what trade-offs are accepted. 3–6 sentences.}

---

## Alternatives Considered

### {Option A name}

{What it optimised for and why it was ruled out. 2–3 sentences.}

### {Option B name}

{What it optimised for and why it was ruled out. 2–3 sentences.}

---

## Solution Shape

{High-level description of the solution: components, their responsibilities, the boundaries between them, and the primary data or control flow. Written as prose — no code, no file paths.}

{Each paragraph covers one component or one significant boundary. A boundary is a point where ownership or technology changes — between services, between infrastructure and domain logic, between synchronous and asynchronous processing.}

{End with a statement of the observable outputs: what a user or caller sees when the solution is working correctly.}

---

## Key Decisions

| Decision                         | Choice                                      | Rationale                    |
| -------------------------------- | ------------------------------------------- | ---------------------------- |
| {e.g., persistence strategy}     | {e.g., append-only event log}               | {why this over alternatives} |
| {e.g., sync vs async processing} | {e.g., synchronous with async notification} | {why}                        |
| {e.g., where validation lives}   | {e.g., at the boundary, not in the domain}  | {why}                        |

---

## What This Explicitly Does Not Do

{List behaviors, integrations, or concerns that are out of scope for this solution. Be specific — "no pagination" is better than "limited scope". Each item prevents scope creep during the outline and plan phases.}

- {Excluded behavior or concern}
- {Excluded behavior or concern}

---

## Open Questions for the Outline Phase

{Questions the structure outline must resolve before a plan can be produced. These are structural unknowns — unknowns about component interfaces, sequencing constraints, or external dependencies — not design unknowns. Design unknowns should have been resolved before this document was written.}

- {e.g., Does the notification component own its retry logic or delegate to infrastructure?}
- {e.g., What is the wire format between the gateway and the processing service?}
```
