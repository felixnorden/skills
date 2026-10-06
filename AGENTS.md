# AGENTS.md: Skill Authoring Standards

Normative rules for every skill in this repository. A contributor reads this
file before authoring or editing a skill. `scripts/validate-skills.ts` enforces
the mechanical rules.

Run the validator before every commit:

```bash
bun run scripts/validate-skills.ts
```

It prints `path:line: level: message`, one finding per line. An error exits
non-zero. A warning does not.

## Description: the trigger spec

The description is the only text every harness loads at startup. It carries the
full triggering burden. Write it in this house style:

```
<Verb phrase: what the skill does>. Use when <triggers, including one non-obvious context>. <Optional exclusion to hold down false triggers>.
```

Rules:

- Front-load the key use case. Codex shortens descriptions under a context
  budget, and Claude Code truncates the combined listing.
- State both what the skill does and when to use it.
- Name the non-obvious context. The skill must trigger when the user does not
  name the domain directly.
- Add a short exclusion when a near-miss is likely.
- Write no first person and no second person. "Writes prose that agents verify"
  is correct. "Use this skill if you write prose" is wrong.
- Do not open with "Use this skill".
- Keep the description under 600 characters. The hard cap is 1,024.
- Never put an unquoted colon followed by a space inside the value. YAML reads it
  as a nested mapping and the harness drops the field. Quote the value or remove
  the colon. The validator rejects this.
- Exclusions can backfire. A model may match the words inside the exclusion. Add
  an exclusion only when the near-miss shares no wording with the trigger.

Anthropic asks for third person. The agentskills.io guide asks for imperative
phrasing. This house style satisfies both: a bare task verb plus a "Use when"
clause addressed to the agent.

## Frontmatter

Two required fields:

```yaml
---
name: processing-pdfs
description: Extracts text from PDF files. Use when reading or converting a PDF.
---
```

| Field | Rule |
| --- | --- |
| `name` | 1 to 64 characters. Lowercase letters, numbers, and single hyphens. No leading, trailing, or doubled hyphen. Must match the parent directory name. |
| `description` | 1 to 1,024 characters. Non-empty. House style above. |
| `license` | Optional. Rarely needed. |
| `compatibility` | Optional. Include only for a real environment requirement. |
| `metadata` | Optional string map. Add a key only when repository tooling reads it. |

Portability rules:

- Use spec fields only. OpenCode ignores unknown fields. The claude.ai packager
  rejects them with a hard error.
- Do not add a harness-only field. Claude Code, Codex, and pi accept extra
  fields, but a shared skill does not depend on one. An extension lives in a
  harness-specific file, and only after an eval shows that it matters.
- A skill without a description fails to load.

## Structure and progressive disclosure

```
skill-name/
├── SKILL.md          # Overview and router. Loaded on match.
├── references/       # Loaded on demand. One level deep from SKILL.md.
├── assets/           # Templates and static resources.
├── scripts/          # Executed, not loaded into context.
└── evals/            # The skill's evidence.
```

Rules:

- Keep `SKILL.md` under 300 lines. The hard cap is 500.
- Keep every reference one level deep from `SKILL.md`. A reference that links to
  another reference creates a chain, and an agent may read it in part.
- Do not create an index reference. Route every leaf file directly from
  `SKILL.md`. Subdirectories are fine: a directory is not a level.
- Add a table of contents to any reference file over 100 lines.
- Use forward slashes in every path. No backslashes.
- Name files for their content: `form_validation_rules.md`, not `doc2.md`.
- Group references by domain when a skill has many.

## Content

- **Concise.** Add only what the agent lacks. Challenge each section. Once the
  skill loads, each token competes with the conversation.
- **Degrees of freedom.** Match specificity to fragility. Use exact commands for
  fragile steps. Use guidance where several approaches work.
- **No time-sensitive content.** Do not write years, "as of", "latest version",
  "currently", or "deprecated". State the rule. If history matters, move it to a
  collapsed `<details>` block.
- **Consistent terminology.** Pick one term per concept and repeat it.
- **Concrete examples.** Show input and output pairs. Do not describe them.
- **Workflows.** Break a complex task into ordered steps. Provide a copyable
  checklist for multi-step work.
- **Feedback loops.** For a quality-critical step, add a validate, fix, repeat
  loop.
- **Defaults, not menus.** Give one recommended approach plus an escape hatch.

## Evaluations

Every skill has `evals/evals.json`. An eval-first change authors the evals
before the edit.

- Trigger cases: 8 to 12 positive and 8 to 10 negative queries, split 60/40 into
  a train set and a held-out validation set. Run each query 3 times. A positive
  case passes above a trigger rate of one half. A negative case passes below it.
- Output cases: at least 3. Each case has a prompt, optional input files, and 2
  to 3 objective assertions. An assertion passes only with quoted evidence.
- Arms: baseline with no skills, and enabled with only the skill under test.
- Models: `opencode/qwen3.8-max` and `opencode-go/deepseek-v4.1-flash`.
- Record results in `evals/<skill>/summary.md`.

## Scripts

- Solve the problem in the script. Do not defer a failure to the agent.
- Handle errors explicitly with a helpful message.
- Document every constant. No unexplained magic numbers.
- State the intent: "Run `analyze.py` to extract fields" (execute) or "See
  `analyze.py` for the algorithm" (read as reference).
- List required packages and confirm they exist in the execution environment.
- Use fully qualified MCP tool names: `ServerName:tool_name`.

## Naming

Gerund form is preferred: `processing-pdfs`, `analyzing-spreadsheets`.
Noun and action forms are acceptable. Avoid vague names: `helper`, `utils`,
`tools`, `documents`, `data`. Avoid the reserved words `anthropic` and `claude`.

Existing names are stable. A rename breaks cross-references and distribution.

## Checklist Before Committing

- [ ] `name` matches the directory and meets the field rules.
- [ ] The description follows the house style and states a trigger.
- [ ] No first or second person in the description.
- [ ] `SKILL.md` is under 300 lines.
- [ ] Every reference is one level deep from `SKILL.md` and resolves.
- [ ] No index reference file.
- [ ] Every reference over 100 lines has a table of contents.
- [ ] No Windows-style paths.
- [ ] No time-sensitive phrasing.
- [ ] Terminology is consistent.
- [ ] The eval set exists and a baseline was measured before the edit.
- [ ] `bun run scripts/validate-skills.ts` reports no error.

<!-- opensrc:start -->

## Source Code Reference

Source code for dependencies is available in `opensrc/` for deeper understanding of implementation details.

See `opensrc/sources.json` for the list of available packages and their versions.

Use this source code when you need to understand how a package works internally, not just its types/interface.

### Fetching Additional Source Code

To fetch source code for a package or repository you need to understand, run:

```bash
npx opensrc <package>           # npm package (e.g., npx opensrc zod)
npx opensrc pypi:<package>      # Python package (e.g., npx opensrc pypi:requests)
npx opensrc crates:<package>    # Rust crate (e.g., npx opensrc crates:serde)
npx opensrc <owner>/<repo>      # GitHub repo (e.g., npx opensrc vercel/ai)
```

<!-- opensrc:end -->
