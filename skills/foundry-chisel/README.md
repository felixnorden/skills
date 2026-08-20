# foundry-chisel

Chisel is Foundry's interactive Solidity REPL. This skill evaluates and prototypes Solidity expressions in it. It covers every REPL command, session management, forking, and the full `vm` cheatcode API.

## What it does

The skill works inside the Chisel REPL. You type Solidity expressions and Chisel compiles and executes them inline. It covers all REPL commands: `!save`, `!load`, `!list`, `!fork`, `!source`, `!traces`, `!rawstack`, and `!memdump`. It covers session saving and caching, forking a live network from inside the REPL, exporting sessions to forge-std Script files, and fetching verified contract interfaces from Etherscan with `!fetch`. The `vm` cheatcode API is available for every expression.

## What problem it solves

Writing a full test file is slow when you only want to check one expression. Chisel runs that check inline and prints the type and data of the result. It also lets you test against a live network: fork a chain, read contract state, and inspect raw EVM memory or stack values when a result looks wrong.

## How it is structured

```
skills/foundry-chisel/
└── SKILL.md    # self-contained instructions; the only file in the skill
```

The file is self-contained. For anything it does not cover, it points to the canonical docs at getfoundry.sh/chisel/commands.

## How to use it

Run this skill when a user wants to test a Solidity snippet, prototype an expression, inspect a live contract interactively, or use a chisel command prefixed with `!`.

Start a session with `chisel`, or fork a network at startup with `chisel --fork-url`. Type expressions directly; the REPL prints the type and data of each result. Manage sessions with `!save`, `!load`, and `!list`. Use `!fork` to switch to a live network mid-session. Use `!export` to write the session to a forge-std Script file. Use `!traces`, `!rawstack`, and `!memdump` to debug execution.

## Provenance

Original skill in this repository.

See SKILL.md for the full agent-facing instructions.
