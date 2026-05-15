import type { Config } from "@opencode-ai/plugin";

type Command = NonNullable<Config["command"]>[string];

export const commands: Record<string, Command> = {
  qrspi: {
    description:
      "Start a full QRSPI planning workflow. Guides Q → R → D → S → P interactively with a human checkpoint at each phase.",
    agent: "plan",
    subtask: false,
    template: `Load \`skill:planning-workflow\` before proceeding.

## Arguments

$ARGUMENTS

- \`--ticket\` — issue reference to attach to all artifacts (e.g., \`ENG-123\`)
- \`--slug\` — short kebab-case identifier for the feature (e.g., \`add-payment-flow\`)
- Any remaining information is context for the topic to be planned

If \`--slug\` is absent, derive one from the user's description after the Q phase.

---

## Phases

Execute in order. Use \`tool:question\` at each checkpoint — do not advance until human approves.

**Q — Questions**: Gather goal, hard constraints, and out-of-scope items. Do not save a file.

**R — Research**: Spawn \`task:research --template research.md --slug {slug} {scope summary}\` as a subtask. Present inline summary. Checkpoint.

**D — Design**: Spawn \`task:plan --template design-concept.md --slug {slug} --research {research-path}\` as a subtask. Present concept. Checkpoint.

**S — Structure**: Spawn \`task:plan --template outline.md --slug {slug} --design {design-path} --research {research-path}\` as a subtask. Present outline. Checkpoint.

**P — Plan**: Spawn \`task:plan --template plan.md --slug {slug} --outline {outline-path} --research {research-path}\` as a subtask. Present inline summary. Checkpoint.

If revision is needed at P, spawn \`task:plan --template iterate.md --plan {plan-path} "{feedback}"\`.

---

On completion, follow the format in \`skill:planning-workflow\` → \`templates/session-summary.md\`.`,
  },
  "qrspi:research": {
    description:
      "QRSPI Research phase. Documents what exists in the codebase for a given topic. Produces a research document and inline summary.",
    agent: "research",
    subtask: true,
    template: `Load \`skill:planning-workflow\` → \`templates/research.md\`.

## Arguments

$ARGUMENTS

- \`--slug\` — session identifier for artifact naming
- \`--scope\` — path to an existing scope document
- Any remaining text is the research topic directly

If invoked without arguments, use \`tool:question\`: "What area of the codebase should I research?"

---

## Invocation

**As primary agent**: clarify topic with \`tool:question\` if ambiguous, then follow \`templates/agent-research.md\`.

**As subagent**: skip Clarify. Treat provided scope as confirmed. Follow \`templates/agent-research.md\`.`,
  },
  "qrspi:structure": {
    description:
      "QRSPI Structure phase. Produces a component-level structural outline from the approved design concept.",
    agent: "plan",
    subtask: true,
    template: `Load \`skill:planning-workflow\` → \`templates/outline.md\`.

## Arguments

$ARGUMENTS

- \`--slug\` — session identifier for artifact naming
- \`--design\` — path to the approved design concept from the D phase
- \`--research\` — path to the research document from the R phase

If \`--design\` is not provided, use \`tool:question\` to ask for it before proceeding.

---

## Invocation

**As primary agent**: clarify with \`tool:question\` if ambiguous, then follow the production instructions in \`templates/outline.md\`.

**As subagent**: skip Clarify. Read both documents silently, then follow the production instructions in \`templates/outline.md\`.`,
  },
  "qrspi:design": {
    description:
      "QRSPI Design phase. Facilitates solution design discussion, evaluates options, and produces a design concept document.",
    agent: "plan",
    subtask: true,
    template: `Load \`skill:planning-workflow\` → \`templates/design-concept.md\`.

## Arguments

$ARGUMENTS

- \`--slug\` — session identifier for artifact naming
- \`--research\` — path to the research document from the R phase
- \`--scope\` — path to the scope document (optional if research document contains scope summary)

If \`--research\` is not provided, use \`tool:question\` to ask for it before proceeding.

---

## Invocation

**As primary agent**: clarify with \`tool:question\` if ambiguous, then follow the production instructions in \`templates/design-concept.md\`.

**As subagent**: skip Clarify. Read research document silently, then follow the production instructions in \`templates/design-concept.md\`.`,
  },
  "qrspi:plan": {
    description:
      "QRSPI Plan phase. Produces a vertically-sliced, TDD-aligned implementation plan for Build Agent.",
    agent: "plan",
    subtask: true,
    template: `Load \`skill:planning-workflow\` → \`templates/plan.md\`. Load \`skill:tdd\`.

## Arguments

$ARGUMENTS

- \`--slug\` — session identifier for artifact naming
- \`--outline\` — path to the structure outline from the S phase
- \`--research\` — path to the research document from the R phase
- \`--design\` — path to the design concept (optional; for additional context)

If \`--outline\` is not provided, use \`tool:question\` to ask for it before proceeding.

---

## Invocation

**As primary agent**: clarify with \`tool:question\` if ambiguous, then follow \`templates/agent-plan.md\`.

**As subagent**: skip Clarify. Read all provided documents silently, then follow \`templates/agent-plan.md\`.`,
  },
  "qrspi:iterate": {
    description:
      "QRSPI Iterate phase. Surgically revises an existing plan based on feedback. Updates only affected slices.",
    agent: "plan",
    subtask: true,
    template: `Load \`skill:planning-workflow\` → \`templates/iterate.md\`. Load \`skill:tdd\`.

## Arguments

$ARGUMENTS

- \`--plan\` — path to the existing plan to revise
- \`--outline\` — path to the structure outline (for structural reference)
- \`--research\` — path to the research document (for findings reference)
- Any remaining text after flags is the feedback string

If \`--plan\` is not provided, use \`tool:question\` to ask for it.
If no feedback string is present, use \`tool:question\`: "What needs to change in the plan?"

---

## Invocation

**As primary agent**: gather plan path and feedback, then follow \`templates/iterate.md\`.

**As subagent**: skip Clarify. Plan path and feedback provided by the orchestrator. Follow \`templates/iterate.md\`.`,
  },
};
