# Evaluations

Each skill has an eval set at `skills/<skill>/evals/evals.json`. The runner
`scripts/run-evals.ts` executes a set in two arms and writes results under
`evals/<skill>/`. Authored evidence is committed there; raw run output is not.

## Two arms

- Baseline: `pi -nc -ns --mode json --model <id> "<query>"`.
- Enabled: `pi -nc -ns --skill <skill-dir> --mode json --model <id> "<query>"`.

`-ns` disables every discovered skill. `--skill` loads only the skill under
test. `-nc` disables context files. Each run uses a fresh temporary working
directory. Trigger runs also pass `--tools read`, so a baseline run cannot
search the filesystem and find the skill. An enabled run reads the skill from
the path pi injects.

## Two models

`opencode/qwen3.8-max` (strong) and `opencode-go/deepseek-v4.1-flash` (fast).
Pass one with `--models` for a quick loop.

## `evals.json`

```json
{
  "skill": "tdd",
  "trigger_cases": [
    { "query": "Write unit tests for this parser.", "should_trigger": true, "split": "train" },
    { "query": "Run the existing test suite.", "should_trigger": false, "split": "validation" }
  ],
  "output_cases": [
    {
      "id": "order-tax",
      "prompt": "Write the first test for an order total that adds 20 percent tax.",
      "files": ["skills/tdd/assets/test-template.md"],
      "assertions": [
        "The test fails first for a behavioral reason.",
        "The test uses Arrange, Act, Assert."
      ]
    }
  ]
}
```

- `trigger_cases`: 8 to 12 positive and 8 to 10 negative. Split 60/40 into
  `train` and `validation`. The runner runs each query 3 times by default.
- `output_cases`: at least 3. `files` are paths relative to the repo root and
  are copied into the temporary working directory before the run.

## Scoring

Trigger detection reads the JSON stream for a read tool call whose path ends
with the skill's `SKILL.md`. A positive case passes above a trigger rate of one
half. A negative case passes below it. The runner exits non-zero when a trigger
case fails.

That rule counts a *verification read*: a model that opens the router to check
whether the skill applies and then declines registers as a hit. Near-miss
negatives therefore sit on the threshold and move between runs. Read a negative
failure against the run transcript before rewriting the query; `evals/vitest/`
keeps a worked example in `notes.md`.

Output grading is separate. Add `grading.json` next to the eval set:

```json
{
  "order-tax": {
    "The test fails first for a behavioral reason.": { "result": "PASS", "evidence": "quote from the output" }
  }
}
```

An assertion passes only with quoted evidence from the output. The summary
records the pass count.

## Results

`evals/<skill>/summary.md` holds the trigger table, the output grading, the
models, and the timestamp. Raw JSONL runs sit in `evals/<skill>/runs/`. Extracted
outputs sit in `evals/<skill>/outputs/`. `results.json` holds the last scored
run so `--grade-only` can rebuild the summary without re-running pi.

## Commands

```bash
# Full set on both tiers
bun run scripts/run-evals.ts --skill tdd

# Fast loop on one model, one run
bun run scripts/run-evals.ts --skill tdd --models opencode-go/deepseek-v4.1-flash --runs 1

# Trigger cases only
bun run scripts/run-evals.ts --skill tdd --phase trigger

# Rebuild summary.md after editing grading.json
bun run scripts/run-evals.ts --skill tdd --grade-only 1
```

A skill generated from pinned documentation keeps its own runbook, with its
gates and its resync loop. The worked example is `scripts/vitest-skill.md`.

## Scope note

These evals measure the pi harness. The other target harnesses (Claude Code,
opencode, Codex) are covered by `scripts/validate-skills.ts`, which enforces the
shared frontmatter surface and the name-to-directory match.

## Version control

The repository tracks the authored eval files only: `evals.json`, `README.md`,
`summary.md`, `grading.json`, `baseline.md`, `notes.md`, and the legacy benchmark
notes.

Raw run output stays out of git. The `.gitignore` rules exclude `runs/`,
`outputs/`, and `results.json`. These files are large and reproducible from the
commands above.

The authored files ship with the skill. `evals/vitest/` is the current example:
`baseline.md` keeps the first run unedited, `summary.md` is generated, and
`notes.md` records what the generator cannot say.

## Description tuning

The trigger phase measures one thing: whether the model opens `SKILL.md` from
the description alone. Three lessons:

- A colon followed by a space inside an unquoted frontmatter value breaks YAML.
  The value becomes a nested mapping, the harness drops the field, and every
  positive case fails at once. `scripts/validate-skills.ts` rejects it.
- Negative exclusions can backfire when they repeat a word from the query. The
  exclusion "do not use to implement code" made "implement the login feature"
  trigger more often, not less. Prefer positive trigger phrasing.
- Rewording a near-miss moves the failure to another near-miss. Five runs of the
  `vitest` set kept ten of ten positives and eight of ten negatives, while the
  two failing negatives changed with each rewording. State the gate at the
  measured value and name the artifact; do not tune a three-run rate to zero.

Run the trigger phase at three runs while tuning. One run cannot separate signal
from model noise.

Output prompts must be self-contained. The output arm runs non-interactive, so
the model cannot ask for a missing value. A prompt that omits the address, repo,
or stack yields a stub answer that asks a question instead of doing the task.

A case may supply fixture files with `files`. Each entry is a repository path
that contains a `fixture/` segment; the part after `fixture/` becomes the path
inside the temporary working directory. For example,
`skills/effect-ts/evals/fixture/.repos/effect` lands at `.repos/effect`, which
satisfies a skill prerequisite check for that directory.

## Legacy benchmark notes

`evals/foundry-forge/` and `evals/effect-ts/` hold an older manual benchmark,
written before the `evals.json` format. Those files are historical. The current
result for each skill is `evals/<skill>/summary.md`.
