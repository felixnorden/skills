# Session Summary Template

**Usage**: Produced by the orchestrator after all phases are approved. Lists all artifact paths produced in the session.

---

```
QRSPI session complete.

Slug:     {slug}
Ticket:   {ticket reference, or "none"}
Date:     {YYYY-MM-DD}

Artifacts:
  Research: <worktree-root>/.qrspi/research/YYYYMMDD-{slug}.md
  Design:   <worktree-root>/.qrspi/designs/YYYYMMDD-{slug}.md
  Outline:  <worktree-root>/.qrspi/outlines/YYYYMMDD-{slug}.md
  Plan:     <worktree-root>/.qrspi/plans/YYYYMMDD-{slug}.md

Next step: pass the plan path to Build Agent.
```
