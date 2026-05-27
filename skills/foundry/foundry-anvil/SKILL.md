---
name: foundry-anvil
description: >
  Runs and configures a local Ethereum development node using Anvil — Foundry's fast in-process
  EVM. Covers starting Anvil with custom flags, forking mainnet or other networks at a specific
  block (anvil --fork-url), state persistence (dump/load state), mining control (anvil_mine,
  interval mining, no-mining mode), account impersonation (anvil_impersonateAccount), time
  manipulation (evm_increaseTime, evm_setNextBlockTimestamp), balance and storage manipulation
  via custom RPC methods, and all anvil_ and evm_ namespace JSON-RPC methods. Activates when
  a user needs a local EVM node, wants to fork a live network for testing, or asks about any
  Anvil startup flag or custom RPC method.
---

# foundry-anvil

Anvil is a fast local Ethereum development node — the Foundry equivalent of Hardhat Network
or Ganache. It starts a fully-featured EVM node on `localhost:8545` with pre-funded test accounts.

Canonical docs: https://www.getfoundry.sh/anvil
CLI reference: https://www.getfoundry.sh/reference/anvil/anvil

## Reference freshness

Custom RPC methods are documented in `references/custom-methods.md`. For any method not found
there, web-fetch before answering: `https://www.getfoundry.sh/anvil/custom-methods`
**Never fabricate a method name or parameter signature.**

---

## Starting Anvil

```bash
anvil                              # start with defaults (localhost:8545, 10 accounts)
anvil -p 8546                      # use different port
anvil --accounts 20                # more dev accounts
anvil --balance 100000             # starting balance in ETH per account
anvil --hardfork cancun            # specific EVM version (default: latest)
anvil --chain-id 31337             # custom chain ID (default: 31337)
anvil --block-time 12              # mine blocks every N seconds (interval mining)
anvil --no-mining                  # mine on demand only
anvil --json                       # output as JSON (useful for CI)
```

Default dev accounts are derived from mnemonic:
`test test test test test test test test test test test junk`
(derivation path: `m/44'/60'/0'/0/`)

---

## Forking

### At latest block
```bash
anvil --fork-url $RPC_URL
# or alias:
anvil -f $RPC_URL
```

### At a specific block
```bash
anvil --fork-url $RPC_URL --fork-block-number 19000000
# URL syntax shortcut:
anvil --fork-url http://localhost:8545@19000000
```

### At a specific transaction (state after tx applied)
```bash
anvil --fork-url $RPC_URL --fork-transaction-hash $TX_HASH
```

### Fork caching
Fetched state is cached at `~/.foundry/cache/rpc/<chain>/<block>/`.
Subsequent forks at the same block are served from cache.

```bash
anvil --no-storage-caching          # disable RPC cache, always fetch fresh
```

### Multiple fork endpoints (round-robin load balancing)
```bash
anvil --fork-url $RPC1 --fork-url $RPC2 --fork-url $RPC3
```

---

## State persistence

```bash
# Save state to file on exit, load it on next start
anvil --state ./anvil-state.json

# Dump state to file on exit only
anvil --dump-state ./state.json

# Load previously dumped state on start
anvil --load-state ./state.json

# Dump state every N seconds (auto-save interval)
anvil -s 30 --state ./state.json

# Dump with historical block states (for replay)
anvil --state ./state.json --preserve-historical-states

# Initialize genesis block from file
anvil --init ./genesis.json
```

---

## Mining modes

| Mode | Command | Behavior |
|---|---|---|
| Auto-mining (default) | `anvil` | Block mined per transaction |
| Interval mining | `anvil --block-time 12` | Block mined every N seconds |
| On-demand | `anvil --no-mining` | Only mined when `anvil_mine` called |
| Mixed | `anvil --mixed-mining` | Auto + on-demand |

---

## Key startup flags

### Account setup
```bash
--accounts <N>                    # number of dev accounts (default: 10)
--balance <ETH>                   # starting balance per account (default: 10000)
--mnemonic <PHRASE>               # custom mnemonic
--mnemonic-random [<WORDS>]       # random mnemonic (optionally N words, default 12)
--derivation-path <PATH>          # BIP32 path (default: m/44'/60'/0'/0/)
--fund-accounts <ADDR:AMT>...     # fund specific addresses on startup
```

### Network
```bash
--port / -p <NUM>                 # port (default: 8545)
--host <IP>                       # bind address (default: 127.0.0.1)
--ipc [<PATH>]                    # enable IPC (default: /tmp/anvil.ipc)
--allow-origin <ORIGIN>           # CORS allow origin (default: *)
--no-cors                         # disable CORS
```

### EVM environment
```bash
--chain-id <ID>                   # chain ID (default: 31337)
--hardfork <NAME>                 # prague, cancun, shanghai, paris, london, etc.
--gas-limit <LIMIT>               # block gas limit
--gas-price <PRICE>               # gas price (wei)
--block-base-fee-per-gas <FEE>    # base fee (aliases: --base-fee)
--code-size-limit <BYTES>         # EIP-170 limit (default: 0x6000 ~25kb)
--disable-code-size-limit         # disable EIP-170
--disable-block-gas-limit         # disable gas limit check
```

### EVM behavior
```bash
--auto-impersonate                # enable account impersonation on all senders
--steps-tracing                   # enable geth-style debug traces
--print-traces                    # print tx traces to stdout
--disable-console-log             # suppress console.log output
--disable-default-create2-deployer # disable the default CREATE2 factory
```

### State management
```bash
--max-persisted-states <N>        # max states to persist on disk
--prune-history [<N>]             # keep only N block states in memory
--transaction-block-keeper <N>    # N blocks with txs to keep in memory
```

---

## Custom RPC methods

Load `references/custom-methods.md` for the full method listing with exact call signatures.
These are the method categories:

- **Account impersonation**: `anvil_impersonateAccount`, `anvil_stopImpersonatingAccount`
- **Mining control**: `anvil_mine`, `evm_mine`, `evm_setAutomine`, `evm_setIntervalMining`
- **Time manipulation**: `evm_increaseTime`, `evm_setNextBlockTimestamp`
- **State snapshots**: `evm_snapshot`, `evm_revert`
- **Balance/nonce/code**: `anvil_setBalance`, `anvil_setNonce`, `anvil_setCode`, `anvil_setStorageAt`
- **Chain config**: `anvil_setChainId`, `evm_setBlockGasLimit`, `anvil_setNextBlockBaseFeePerGas`
- **Transaction pool**: `txpool_content`, `anvil_dropTransaction`, `anvil_dropAllTransactions`

---

## Using with cast

Anvil integrates directly with cast for state manipulation:

```bash
# Start Anvil
anvil --fork-url $MAINNET_RPC &

# Impersonate a whale
cast rpc anvil_impersonateAccount $WHALE_ADDR
cast send $TOKEN "transfer(address,uint256)" $MY_ADDR 1000000e18 \
  --from $WHALE_ADDR --unlocked --rpc-url http://localhost:8545

# Mine a block
cast rpc anvil_mine

# Advance time by 1 day
cast rpc evm_increaseTime 86400
cast rpc evm_mine
```
