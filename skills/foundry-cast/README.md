# foundry-cast

Cast is Foundry's Swiss Army knife for interacting with Ethereum from the command line. It reads chain data, sends transactions, encodes and decodes ABIs, and manages wallets, all without writing Solidity.

## What it does

The skill covers Cast's 80+ subcommands, organized by task. It reads chain data with cast call, cast balance, cast block, cast storage, and cast code. It sends transactions with cast send, cast publish, and cast mktx. It encodes and decodes ABIs with cast calldata, cast decode-calldata, cast abi-encode, and cast 4byte. It also covers wallet operations, type conversions, ENS resolution, and Etherscan lookups.

## What problem it solves

Cast has 80+ subcommands and evolves often. Guessing a flag or an argument signature produces wrong commands. The skill keeps the correct syntax in reach by task, and it directs the agent to the official docs before answering on an unfamiliar subcommand.

## How it is structured

```
skills/foundry-cast/
├── SKILL.md                  # global flags, quick reference by task, common patterns
└── references/
    └── commands.md           # full command details by category
```

## How to use it

Use the skill when the user wants to inspect chain state, craft or decode a transaction, or interact with a deployed contract without writing Solidity.

Start with the quick reference in SKILL.md, grouped by task: read chain data, send transactions, encode and decode ABIs, convert types, manage wallets, and resolve ENS names. For an unfamiliar subcommand or flag, fetch the official reference page before answering. Never fabricate a flag or argument signature. For full details by category, load references/commands.md.

Set ETH_RPC_URL and ETHERSCAN_API_KEY as environment variables so commands run without repeating flags.

## Provenance

Original skill in this repository.

See SKILL.md for the full agent-facing instructions.
