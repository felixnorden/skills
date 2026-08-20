# Iterate Template

**Usage**: Used during the QRSPI Iterate (I) phase to revise an existing plan. Updates only the affected slices; never regenerates the full plan. Load the test-writing skill (see the plan template) when you must regenerate a Tests First section.

**Constraints**:

- Never regenerate the full plan for a partial change; make surgical edits only
- If the feedback requires a new slice, add it; do not repurpose an existing slice to absorb new behavior
- Re-verify every Verification Gate for modified slices before saving
- If two or more rounds of iteration hit the same slice, flag it: repeated revision signals a design ambiguity; resolve it at the D or S phase, not by patching

---

## How to Execute a Revision

1. Read the existing plan, outline, and research documents silently.
2. Identify which slices the feedback implicates. State them explicitly before making any changes.
3. Check whether the feedback implies a **design change**: a change to solution shape, component boundaries, or technology choices. If it does, stop and return:
   ```
   This feedback requires a design change. Return to the D phase before revising the plan.
   Reason: {specific design decision affected}
   ```
4. For each implicated slice, rewrite it completely, regenerating its Tests First section and Verification Gate for the new behavior. Leave all other slices verbatim.
5. Add a revision note to the plan header:
   ```
   Revised: {YYYY-MM-DD} — {one-line summary of what changed}
   ```
6. Write the revised plan to the same path.
7. Return the output below.

---

## Output

```
Plan revised: {plan path}

Slices updated:
- {Slice name} — {one line: what changed}

Reason: {feedback summary}
```
