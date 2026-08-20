# Planning Workflow

Guides structured software planning through reusable templates. Covers design concepts, implementation plans with vertical slices, and agent configuration. Use when starting a new feature, designing a solution before implementation, producing a phased plan for a build agent, or when the user mentions planning, design phase, implementation plan, QRSPI, or vertical slices.

## What it does

The skill turns a new feature into a sequence of planning artifacts a build agent can execute without ambiguity. Templates enforce order: design decisions before structure, structure before implementation tasks, and each phase independently verifiable. Implementation plans decompose work into vertical slices, units of change that deliver one complete observable behavior end-to-end.

## What problem it solves

Planning without order produces plans that cannot be verified incrementally. The skill enforces one core constraint across all templates: no implementation detail in the design phase, no design decisions in the plan phase, no new behavior in a verification gate. Horizontal slicing, grouping changes by technical layer, is the primary anti-pattern because it produces no working software until the final phase.

## How it is structured

```
skills/planning-workflow/
├── SKILL.md                            # instructions agents load
└── templates/
    ├── research.md                     # research document schema and summary format
    ├── design-concept.md               # design phase template
    ├── outline.md                      # structure outline component schema
    ├── plan.md                         # implementation plan with vertical slices
    ├── iterate.md                      # surgical revision workflow
    └── session-summary.md              # orchestrated session summary format
```

## How to use it

Run the skill when starting a new feature, designing a solution before implementation, producing a phased plan for a build agent, or when the user mentions planning, design phase, implementation plan, QRSPI, or vertical slices.

A QRSPI session follows the phases Q, R, D, S, P, I, one at a time. Every phase ends at a human checkpoint. An orchestrator runs the session, relays user answers, and previews each artifact. Phase agents load only the current phase's template and write the artifact to .qrspi/<kind>/<slug>.md. Load relevant skills before authoring any Tests First section. A plan requires an approved design concept; if none exists, complete the Design phase first.

See SKILL.md for the full agent-facing instructions.
