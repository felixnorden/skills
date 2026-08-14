# pi-qrspi

A [Pi](https://pi.dev) package that implements the **QRSPI framework** — a structured planning workflow for coding agents.

QRSPI stands for **Q**uestions → **R**esearch → **D**esign → **S**tructure → **P**lan → **I**terate. It is a phased approach to software planning that separates design decisions from implementation, ensuring each phase produces verifiable artifacts before the next begins.

This package is the Pi counterpart of the [opencode-qrspi](https://github.com/felixnorden/skills/tree/main/packages/opencode-qrspi) plugin for OpenCode. It ships the same workflow as **prompt templates** and **skills** instead of plugin-registered commands and agents.

---

## Installation

Install from npm, git, or a local path:

```bash
pi install npm:@ftrdotdev/pi-qrspi
pi install git:github.com/felixnorden/skills
pi install /absolute/path/to/packages/pi-qrspi
pi install ./packages/pi-qrspi   # local checkout
```

---

## Usage

### Full Workflow

Run the complete QRSPI workflow with a single command:

```bash
/qrspi add-payment-flow "Implement Stripe payment processing"
```

This interactively guides you through each phase with a human checkpoint at every step:

| Phase             | Command             | What it does                                                 |
| ----------------- | ------------------- | ------------------------------------------------------------ |
| **Q** — Questions | `qrspi`             | Gathers goals, constraints, and out-of-scope items           |
| **R** — Research  | `qrspi-research`    | Maps the codebase and documents existing implementations     |
| **D** — Design    | `qrspi-design`      | Evaluates options and produces a design concept              |
| **S** — Structure | `qrspi-structure`   | Produces a component-level structural outline                |
| **P** — Plan      | `qrspi-plan`        | Creates a vertically-sliced, TDD-aligned implementation plan |
| **I** — Iterate   | `qrspi-iterate`     | Surgically revises an existing plan based on feedback        |

### Individual Phases

You can also run phases independently. Arguments are positional:

```bash
# Research only
/qrspi-research "Authentication system" auth-refactor

# Design from research
/qrspi-design .qrspi/research/auth-refactor.md auth-refactor

# Structure from design
/qrspi-structure .qrspi/designs/20260101-auth-refactor.md .qrspi/research/auth-refactor.md

# Plan from outline and research
/qrspi-plan .qrspi/outlines/20260101-auth-refactor.md .qrspi/research/auth-refactor.md

# Iterate on an existing plan
/qrspi-iterate .qrspi/plans/20260101-auth-refactor.md "Add OAuth2 support"
```

The OpenCode plugin equivalents use flags (`--slug`, `--research`, `--design`, `--outline`, `--plan`, `--scope`, `--ticket`) instead of positional arguments.

---

## What's Included

### Prompt Templates

Six prompt templates in `prompts/`, one per QRSPI phase. The `/qrspi` orchestrator delegates each phase to a subagent (fresh context) so intermediate noise does not pollute the parent session's context window.

| Template                     | Command             | Phase |
| ---------------------------- | ------------------- | ----- |
| `prompts/qrspi.md`           | `/qrspi`            | Q → R → D → S → P |
| `prompts/qrspi-research.md`  | `/qrspi-research`   | R — Research |
| `prompts/qrspi-design.md`    | `/qrspi-design`     | D — Design |
| `prompts/qrspi-structure.md` | `/qrspi-structure`  | S — Structure |
| `prompts/qrspi-plan.md`      | `/qrspi-plan`       | P — Plan |
| `prompts/qrspi-iterate.md`   | `/qrspi-iterate`    | I — Iterate |

### Extension

`extensions/qrspi-artifacts.ts` enforces the artifact naming convention at the tool layer. It intercepts every `write` and `edit` call and, for paths under `.qrspi/<artifact>/`:

- **Stamps the date** — filenames without a `YYYYMMDD-` prefix get today's date from the host clock (not the model's guess), so `Write to .qrspi/plans/add-payment-flow.md` becomes `.qrspi/plans/20260814-add-payment-flow.md`
- **Stamps frontmatter dates** — a `date:` key in the YAML frontmatter of a new artifact is set to the real ISO datetime
- **Stamps git metadata** — `git_commit`, `branch`, and `repository` keys in the frontmatter of a new artifact are filled from the real repository at `cwd` (research template requires them). Values are resolved lazily on the first artifact write and cached per working directory for 60s — the orchestrator session and every subagent share the cache through the extension process, so later writes (including from subagents) never re-spawn git. The cache is invalidated automatically when a bash command mutates git state (`commit`, `checkout`, `rebase`, `pull`, …)
- **Slugifies** — `Add Payment Flow.md` → `20260814-add-payment-flow.md`, and replaces malformed date prefixes (`2026-8-14-…`) with the canonical form
- **Respects existing files** — iterate-overwrite writes to an existing artifact path are left untouched
- **Blocks traversal** — `..` escapes out of the `.qrspi/` namespace are rejected

### Skills

- **`planning-workflow`** — Templates for each QRSPI phase (research, design-concept, outline, plan, iterate). Enforces the constraint: _no implementation detail in the design phase, no design decisions in the plan phase._
- **`tdd`** — Test-driven development guidance including red-green-refactor workflow, test doubles, dependency injection, and the London/Chicago school mock boundaries.

Artifacts are written to `.qrspi/` directories (`.qrspi/research/`, `.qrspi/designs/`, `.qrspi/outlines/`, `.qrspi/plans/`), so they stay interchangeable between the pi and opencode packages. Unlike the tool-specific `.opencode/` convention, `.qrspi/` is meant to be committed — research and plans are project knowledge, not ephemeral state.

---

## Development

The package bundles the shared skills from the repo root (`skills/planning-workflow`, `skills/tdd`) via a symlink during development. When publishing, the `prepack` script copies the real skill directories into the tarball (npm and bun pack skip symlinks), and `postpack` restores the symlink:

```bash
bun run pack   # or: npm pack
bun test       # extension + prompt template tests
bun run typecheck
```
