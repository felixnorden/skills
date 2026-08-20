# foundry-anvil

Runs and configures a local Ethereum development node using Anvil, Foundry's fast in-process EVM. Covers startup flags, network forking, state persistence, mining control, account impersonation, time manipulation, and the anvil_ and evm_ namespace RPC methods.

## What it does

Anvil is the Foundry equivalent of Hardhat Network or Ganache. It starts a fully-featured EVM on localhost:8545 with pre-funded test accounts derived from a fixed mnemonic. The skill documents startup flags for accounts, network, EVM environment, and state. It documents forking a live network at a block or transaction, mining modes, and custom RPC methods for testing.

## What problem it solves

Testing contracts needs a local EVM that is fast and free to use. Anvil provides one, and forking lets tests run against real network state. The skill also removes guesswork: every flag and method is documented, and it forbids fabricating a method name or parameter signature.

## How it is structured

```
skills/foundry-anvil/
├── SKILL.md                        # startup flags, forking, mining modes, RPC methods
└── references/
    └── custom-methods.md           # full custom RPC method listing with call signatures
```

## How to use it

Use the skill when you need a local EVM node, want to fork a live network for testing, or ask about an Anvil startup flag or custom RPC method.

The skill covers four areas:

- Starting Anvil with defaults or custom flags for accounts, chain, gas, and mining.
- Forking mainnet or another network at a block or after a transaction.
- Persisting state between runs with --state, --dump-state, and --load-state.
- Manipulating the chain with custom RPC methods, such as anvil_impersonateAccount, anvil_mine, and evm_increaseTime.

Anvil integrates with cast for state manipulation, and the skill shows cast rpc examples.

For custom RPC methods, load references/custom-methods.md. For any method not listed there, fetch the live docs at https://www.getfoundry.sh/anvil/custom-methods before answering. Never fabricate a method name or parameter signature.

## Provenance

Original skill in this repository.

See SKILL.md for the full agent-facing instructions.
