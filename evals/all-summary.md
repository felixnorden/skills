# Final gate: all skills

Models: opencode/qwen3.8-max,opencode-go/deepseek-v4.1-flash
Runs per trigger case: 3

| Skill | Trigger | Output |
| --- | --- | --- |
| effect-ts | 32 of 34 trigger cases pass | 7 of 7 assertions pass |
| foundry-anvil | 31 of 34 trigger cases pass | 4 of 4 assertions pass |
| foundry-cast | 28 of 34 trigger cases pass | 6 of 6 assertions pass |
| foundry-chisel | 24 of 34 trigger cases pass | 5 of 5 assertions pass |
| foundry-forge | 33 of 34 trigger cases pass | 8 of 8 assertions pass |
| planning-workflow | 31 of 32 trigger cases pass | 6 of 6 assertions pass |
| solidity-development | 34 of 34 trigger cases pass | 6 of 6 assertions pass |
| tdd | 32 of 32 trigger cases pass | 7 of 7 assertions pass |
| writing-for-agents | 35 of 36 trigger cases pass | 8 of 8 assertions pass |

Per-skill detail lives in `evals/<skill>/summary.md`.

## Note on writing-for-agents

The gate first reported 33 of 36. The description then changed `design documents`
to `design docs` and added `meeting notes`, and the skill was re-run at 3 runs on
both tiers. The re-run reports 35 of 36. The row above shows the re-run result.

The one remaining failure is `Turn these meeting notes into a design doc.` on
`opencode/qwen3.8-max` at rate 0.33, that is one of three runs. The fast tier
passes the same case at 0.67.
