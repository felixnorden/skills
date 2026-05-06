# Session Summary Template

**Usage**: Output by the QRSPI orchestration command after all phases are approved. Provides a single reference point for all artifact paths produced in the session.

---

```
QRSPI session complete.

Slug:     {slug}
Ticket:   {ticket reference, or "none"}
Date:     {YYYY-MM-DD}

Artifacts:
  Research: <worktree-root>/.opencode/research/{YYYYMMDD-slug.md}
  Design:   <worktree-root>/.opencode/design/{YYYYMMDD-slug.md}
  Outline:  <worktree-root>/.opencode/outline/{YYYYMMDD-slug.md}
  Plan:     <worktree-root>/.opencode/plans/{YYYYMMDD-slug.md}

Next step: pass the plan path to Build Agent.
```
