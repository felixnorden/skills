# Anvil Custom RPC Methods

Anvil exposes non-standard RPC methods for testing. Use via `cast rpc <method> [args...]`
or call directly from JSON-RPC clients.

Live docs: https://www.getfoundry.sh/anvil/custom-methods
Full RPC reference: https://www.getfoundry.sh/reference/anvil/anvil

## Contents

- [Account Impersonation](#account-impersonation) — anvil_impersonateAccount, anvil_stopImpersonatingAccount, auto-impersonate
- [Mining Control](#mining-control) — anvil_mine, evm_mine, evm_setAutomine, evm_setIntervalMining
- [Time Manipulation](#time-manipulation) — evm_increaseTime, evm_setNextBlockTimestamp
- [State Snapshots](#state-snapshots) — evm_snapshot, evm_revert
- [Balance, Nonce, Code, Storage](#balance-nonce-code-storage) — anvil_setBalance, anvil_setNonce, anvil_setCode, anvil_setStorageAt
- [Chain Configuration](#chain-configuration-runtime) — anvil_setChainId, evm_setBlockGasLimit, anvil_setNextBlockBaseFeePerGas
- [Transaction Pool](#transaction-pool) — txpool_content, anvil_dropTransaction
- [Forking](#forking-runtime) — anvil_reset with fork params
- [State Dump/Load](#state-dumpload-runtime) — anvil_dumpState, anvil_loadState, anvil_nodeInfo
- [Tracing](#tracing) — --print-traces, --steps-tracing, debug_trace*

**If a method name or parameter below conflicts with live docs, always prefer the live docs.**

---

## Account Impersonation

Send transactions from any address without its private key.

```bash
# Enable impersonation for an address
cast rpc anvil_impersonateAccount <ADDRESS>

# Send a transaction as the impersonated account
cast send $CONTRACT "fn()" --from $ADDRESS --unlocked --rpc-url http://localhost:8545

# Stop impersonating
cast rpc anvil_stopImpersonatingAccount <ADDRESS>

# Start Anvil with auto-impersonation (impersonate any sender automatically)
anvil --auto-impersonate
# Equivalent runtime method:
cast rpc anvil_autoImpersonateAccount true
cast rpc anvil_autoImpersonateAccount false
```

---

## Mining Control

```bash
# Mine a single block
cast rpc anvil_mine

# Mine N blocks
cast rpc anvil_mine 10

# Mine N blocks with a specific timestamp interval (seconds between blocks)
cast rpc anvil_mine 5 0xc     # 5 blocks, 12 seconds apart (0xc = 12)

# evm_mine — alias, mines one block, optionally at a specific timestamp
cast rpc evm_mine
cast rpc evm_mine 0x64B24A17   # mine at specific timestamp (hex)

# Enable/disable auto-mining (mine a block per tx)
cast rpc evm_setAutomine true
cast rpc evm_setAutomine false

# Set interval mining (mine every N seconds)
cast rpc evm_setIntervalMining 12

# Set block interval to 0 to disable interval mining
cast rpc evm_setIntervalMining 0
```

---

## Time Manipulation

```bash
# Increase time by N seconds (next mined block will have this offset)
cast rpc evm_increaseTime 3600      # advance 1 hour
cast rpc evm_increaseTime 86400     # advance 1 day

# Set exact timestamp for the next block
cast rpc evm_setNextBlockTimestamp 1700000000

# After setting time, mine a block to apply it
cast rpc evm_mine
```

---

## State Snapshots

```bash
# Create snapshot — returns a snapshot ID (hex)
SNAPSHOT_ID=$(cast rpc evm_snapshot)

# ... make state changes ...

# Revert to snapshot — snapshot is DELETED after revert
cast rpc evm_revert $SNAPSHOT_ID

# Note: evm_revert returns true on success, false if snapshot not found
# A snapshot can only be reverted once — save the ID before using
```

---

## Balance, Nonce, Code, Storage

Values passed as hex strings.

```bash
# Set ETH balance (value in wei, as hex)
cast rpc anvil_setBalance $ADDRESS 0xDE0B6B3A7640000     # 1 ETH = 10^18 wei

# Set account nonce (hex)
cast rpc anvil_setNonce $ADDRESS 0x1

# Set contract bytecode
cast rpc anvil_setCode $ADDRESS $BYTECODE_HEX

# Write a storage slot directly
cast rpc anvil_setStorageAt $ADDRESS $SLOT_HEX $VALUE_HEX
```

---

## Chain Configuration (runtime)

```bash
# Set chain ID
cast rpc anvil_setChainId 1337

# Set block gas limit (hex)
cast rpc evm_setBlockGasLimit 0x1C9C380

# Set base fee for next block (hex, in wei)
cast rpc anvil_setNextBlockBaseFeePerGas 0x5F5E100    # 100 gwei = 10^8 wei

# Set coinbase for next block
cast rpc anvil_setCoinbase $ADDRESS

# Set min gas price
cast rpc anvil_setMinGasPrice 0x0

# Reset fork to latest block (when running in fork mode)
cast rpc anvil_reset
# Reset to specific block
cast rpc anvil_reset '{"forking":{"jsonRpcUrl":"https://...","blockNumber":18000000}}'
```

---

## Transaction Pool

```bash
# Inspect pending and queued transactions
cast rpc txpool_content
cast rpc txpool_status
cast rpc txpool_inspect

# Drop a specific pending transaction
cast rpc anvil_dropTransaction $TX_HASH

# Drop all pending transactions
cast rpc anvil_dropAllTransactions

# Remove transactions from a specific address
cast rpc anvil_removePoolTransactions $ADDRESS
```

---

## Forking (runtime)

```bash
# Enable or change fork endpoint at runtime
cast rpc anvil_reset '{"forking":{"jsonRpcUrl":"$RPC_URL"}}'
cast rpc anvil_reset '{"forking":{"jsonRpcUrl":"$RPC_URL","blockNumber":18000000}}'

# Disable forking (revert to empty chain)
cast rpc anvil_reset
```

---

## State Dump/Load (runtime)

```bash
# Dump current state to a file
cast rpc anvil_dumpState
# Returns the state as a hex-encoded bytes string in the response

# Load state from a previously dumped hex string
cast rpc anvil_loadState $STATE_HEX

# Get node info
cast rpc anvil_nodeInfo

# Get metadata
cast rpc anvil_metadata
```

---

## Tracing

```bash
# Enable trace printing at runtime
anvil --print-traces     # on startup

# Enable step tracing for debug_* methods
anvil --steps-tracing    # on startup
```

Standard Ethereum debug methods supported when `--steps-tracing` is enabled:
- `debug_traceTransaction`
- `debug_traceCall`
- `debug_traceBlockByNumber`
- `debug_traceBlockByHash`
