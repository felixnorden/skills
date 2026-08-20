# foundry-forge

Forge is Foundry's build, test, fuzz, debug, and deploy tool for Solidity. This skill documents how to use it. It covers tests, cheatcodes, fuzz and invariant testing, script deployments, verification, gas snapshots, and coverage. It activates when Solidity test code or a forge script is present, or when a Forge or forge-std topic is mentioned.

## What it does

The skill documents every forge CLI subcommand: build, test, coverage, snapshot, fmt, inspect, create, verify-contract, and more. It explains cheatcodes, fuzz and invariant testing, and forge script deployments. Three reference files hold the details: cheatcodes.md, forge-std.md, and scripting.md.

## What problem it solves

Foundry ships frequently, and core APIs change. The skill pins the stable release as of its last update so answers stay current. When a cheatcode, flag, or forge-std function is missing from the references, the skill says to fetch the live docs instead of inventing a signature. For failing tests, the skill provides a step-by-step debugging workflow and a trace reading guide, so the exact reverting call is found instead of guessed.

## How it is structured

```
skills/foundry-forge/
├── SKILL.md                  # the instructions agents load
└── references/
    ├── cheatcodes.md         # vm.* cheatcodes, forks, EVM state, gas metering
    ├── forge-std.md          # Test.sol, Script.sol, assertions, StdCheats, StdStorage
    └── scripting.md          # forge script, broadcasts, verification, CREATE2
```

## How to use it

Route the task to the right reference file: cheatcodes.md for vm.* cheatcodes and forks, forge-std.md for imports and assertions, scripting.md for deployments. For a failing test, follow the checklist in SKILL.md: run forge test, isolate the failure with --match-test and -vvv, read the trace, add cheatcodes, re-run, then run the full suite. If a cheatcode, flag, or forge-std function is missing from the references, fetch the live docs first. Never fabricate a signature.

## Provenance

Original skill in this repository.

See SKILL.md for the full agent-facing instructions.
