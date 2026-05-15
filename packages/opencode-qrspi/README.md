# opencode-qrspi

A plugin for [OpenCode](https://opencode.ai) that implements the **QRSPI framework** — a structured planning workflow for coding agents.

## What is QRSPI?

QRSPI stands for **Q**uestions → **R**esearch → **D**esign → **S**tructure → **P**lan → **I**terate. It is a phased approach to software planning that separates design decisions from implementation, ensuring each phase produces verifiable artifacts before the next begins.

The framework is inspired by **Harness Engineering** — the practice of customizing a coding agent's configuration (skills, agents, commands, hooks) to improve reliability and output quality. This concept was coined by [Viv Trivedy](https://x.com/Vtrivedy10) and popularized by [Dex Horthy](https://x.com/dexhorthy) and the team at [HumanLayer](https://humanlayer.dev).

- **Blog post**: [Skill Issue: Harness Engineering for Coding Agents](https://humanlayer.dev/blog/skill-issue-harness-engineering-for-coding-agents)
- **Talk**: Dex Horthy on context engineering and agent harnesses ([YouTube](https://www.youtube.com/watch?v=YwZR6tc7qYg))

QRSPI applies harness engineering principles by providing specialized sub-agents, skills, and commands that act as a "context firewall" — isolating planning work into discrete, focused sessions so intermediate noise does not pollute the parent agent's context window.

---

## Installation

Add the plugin to your OpenCode configuration (e.g., `.opencode/opencode.json`):

```json
{
  "plugins": ["opencode-qrspi"]
}
```

---

## Usage

### Full Workflow

Run the complete QRSPI workflow with a single command:

```bash
/qrspi --slug add-payment-flow "Implement Stripe payment processing"
```

This interactively guides you through each phase with a human checkpoint at every step:

| Phase             | Command           | What it does                                                 |
| ----------------- | ----------------- | ------------------------------------------------------------ |
| **Q** — Questions | `qrspi`           | Gathers goals, constraints, and out-of-scope items           |
| **R** — Research  | `qrspi:research`  | Maps the codebase and documents existing implementations     |
| **D** — Design    | `qrspi:design`    | Evaluates options and produces a design concept              |
| **S** — Structure | `qrspi:structure` | Produces a component-level structural outline                |
| **P** — Plan      | `qrspi:plan`      | Creates a vertically-sliced, TDD-aligned implementation plan |
| **I** — Iterate   | `qrspi:iterate`   | Surgically revises an existing plan based on feedback        |

### Individual Phases

You can also run phases independently:

```bash
# Research only
/qrspi:research --slug auth-refactor "Authentication system"

# Design from research
/qrspi:design --slug auth-refactor --research .opencode/research/auth-refactor.md

# Plan from outline and research
/qrspi:plan --slug auth-refactor --outline .opencode/outlines/auth-refactor.md --research .opencode/research/auth-refactor.md

# Iterate on an existing plan
/qrspi:iterate --plan .opencode/plans/auth-refactor.md "Add OAuth2 support"
```

---

## What's Included

### Agents

- **`research`** — Codebase research agent. Maps unfamiliar repository areas, documents existing implementations, and produces a structured research document. Uses parallel `explore` sub-agents with scoped mandates (Locator, Analyzer, Pattern Finder).
- **`plan`** — Strategic analysis and implementation planning agent. Produces vertically-sliced plans with TDD-aligned "Tests First" sections. Enforces Skill Gate and Research Gate before any design work begins.

### Skills

- **`planning-workflow`** — Templates for each QRSPI phase (research, design-concept, outline, plan, iterate). Enforces the constraint: _no implementation detail in the design phase, no design decisions in the plan phase._
- **`tdd`** — Test-driven development guidance including red-green-refactor workflow, test doubles, dependency injection, and the London/Chicago school mock boundaries.

### Commands

All commands are registered under the `qrspi:` namespace and can be invoked via the OpenCode CLI or as sub-agents from other agents.

---

## Philosophy

QRSPI treats planning as a first-class activity, not a preamble to coding. By forcing design concepts to exist before plans, and plans to exist before implementation, it reduces the likelihood of agents making implicit decisions mid-implementation.

The workflow also embraces **progressive disclosure** — agents only load the skills and context they need for the current phase, keeping context windows small and relevant.

---

## License

MIT
