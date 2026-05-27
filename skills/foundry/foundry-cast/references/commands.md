# Cast Commands Reference

Full command list organized by category.
Canonical reference: https://www.getfoundry.sh/reference/cast/cast
Live docs per command: `https://www.getfoundry.sh/reference/cast/<subcommand>`

Each entry shows the primary name, its aliases, and a one-line description.

## Contents

- [ABI Commands](#abi-commands) — encode, decode, calldata, 4byte, interface, selectors
- [Account Commands](#account-commands) — balance, nonce, code, storage, codehash
- [Block Commands](#block-commands) — block, block-number, age, base-fee, find-block
- [Chain Commands](#chain-commands) — chain, chain-id, client, gas-price
- [Conversion Commands](#conversion-commands) — unit conversions, hex/dec/utf8, keccak, RLP
- [ENS Commands](#ens-commands) — resolve-name, lookup-address, namehash
- [Etherscan Commands](#etherscan-commands) — source, creation-code, constructor-args
- [General Commands](#general-commands) — completions, help
- [Transaction Commands](#transaction-commands) — call, send, mktx, publish, tx, receipt, logs
- [Utility Commands](#utility-commands) — index, compute-address, create2, implementation, disassemble
- [Wallet Commands](#wallet-commands) — new, sign, verify, import, list, private-key
- [Usage notes](#notes-on-cast-call-vs-cast-send) — cast call vs cast send, return type syntax

---

## ABI Commands

| Command | Aliases | Description |
|---|---|---|
| `cast abi-encode` | `ae` | ABI-encode function arguments (no selector) |
| `cast abi-encode-event` | `aee` | ABI-encode an event and its args into topics + data |
| `cast decode-abi` | `abi-decode, --abi-decode, ad` | Decode ABI-encoded input or output data |
| `cast decode-calldata` | `calldata-decode, --calldata-decode, cdd` | Decode ABI-encoded calldata input |
| `cast decode-error` | `error-decode, --error-decode, erd` | Decode custom error data |
| `cast decode-event` | `event-decode, --event-decode, ed` | Decode event data |
| `cast decode-string` | `string-decode, --string-decode, sd` | Decode ABI-encoded string |
| `cast decode-transaction` | `dt, decode-tx` | Decode a raw signed EIP-2718 typed transaction |
| `cast calldata` | `cd` | ABI-encode a function with arguments (includes selector) |
| `cast 4byte` | `4, 4b` | Get function signatures for a selector (openchain.xyz) |
| `cast 4byte-calldata` | `4c, 4bc` | Decode calldata using openchain.xyz |
| `cast 4byte-event` | `4e, 4be, topic0-event, t0e` | Get event signature for a topic 0 |
| `cast selectors` | `se` | Function selector utilities |
| `cast eip712` | — | Generate EIP-712 struct encodings |
| `cast interface` | `i` | Generate Solidity interface from ABI |
| `cast bind` | `bi` | Generate Rust binding from ABI |

---

## Account Commands

| Command | Aliases | Description |
|---|---|---|
| `cast balance` | `b` | Get account balance in wei |
| `cast nonce` | — | Get account nonce |
| `cast code` | `co` | Get runtime bytecode of a contract |
| `cast codehash` | — | Get codehash for an account |
| `cast codesize` | `cs` | Get runtime bytecode size |
| `cast storage` | — | Get storage value at slot |
| `cast proof` | — | Generate storage proof (EIP-1186) |

---

## Block Commands

| Command | Aliases | Description |
|---|---|---|
| `cast block` | `bl` | Get block info |
| `cast block-number` | `bn` | Get latest block number |
| `cast age` | `a` | Get timestamp of a block |
| `cast base-fee` | `ba, fee, basefee` | Get basefee of a block |
| `cast find-block` | `f` | Find block number closest to a timestamp |

---

## Chain Commands

| Command | Aliases | Description |
|---|---|---|
| `cast chain` | — | Get symbolic chain name |
| `cast chain-id` | `ci, cid` | Get chain ID |
| `cast client` | `cl` | Get client version |
| `cast gas-price` | `g` | Get current gas price |

---

## Conversion Commands

| Command | Aliases | Description |
|---|---|---|
| `cast format-units` | `--format-units, fun` | Format a number from smallest unit to decimal |
| `cast from-bin` | `--from-bin, from-binx, fb` | Binary → hex |
| `cast from-fixed-point` | `--from-fix, ff` | Fixed point → integer |
| `cast from-rlp` | `--from-rlp` | Decode RLP hex-encoded data |
| `cast from-utf8` | `--from-ascii, --from-utf8, from-ascii, fu, fa` | UTF-8 text → hex |
| `cast from-wei` | `--from-wei, fw` | Wei → ETH amount |
| `cast to-ascii` | `--to-ascii, ta` | Hex → ASCII |
| `cast to-base` | `--to-base, --to-radix, to-radix, tb` | Change number base |
| `cast to-bytes32` | `--to-bytes32, tb32` | Pad hex data to 32 bytes |
| `cast to-checksum-address` | `--to-checksum-address, --to-checksummed-address, ta` | EIP-55 checksum |
| `cast to-dec` | `--to-dec, td` | Hex → decimal |
| `cast to-fixed-point` | `--to-fix, tf` | Integer → fixed point |
| `cast to-hex` | `--to-hex, th` | Decimal/text → hex |
| `cast to-hexdata` | `--to-hexdata, thd` | Normalize hex input |
| `cast to-int256` | `--to-int256, ti` | Number → int256 hex |
| `cast to-rlp` | `--to-rlp` | Encode hex data or array as RLP |
| `cast to-uint256` | `--to-uint256, tu` | Number → uint256 hex |
| `cast to-unit` | `--to-unit, tun` | Ether unit conversion |
| `cast to-wei` | `--to-wei, tw` | ETH amount → wei |
| `cast concat-hex` | `--concat-hex, ch` | Concatenate hex strings |
| `cast format-bytes32-string` | `--format-bytes32-string` | String → bytes32 |
| `cast parse-bytes32-string` | `--parse-bytes32-string` | bytes32 → string |
| `cast parse-bytes32-address` | `--parse-bytes32-address` | bytes32 → address |
| `cast keccak` | `k, keccak256` | Keccak-256 hash |
| `cast hash-message` | `--hash-message, hm` | Hash message per EIP-191 |
| `cast hash-zero` | `--hash-zero, hz` | Print zero hash |
| `cast address-zero` | `--address-zero, az` | Print zero address |

---

## ENS Commands

| Command | Aliases | Description |
|---|---|---|
| `cast resolve-name` | `rn` | ENS name → address |
| `cast lookup-address` | `la` | Address → ENS name |
| `cast namehash` | `na, nh` | Get ENS namehash |

---

## Etherscan Commands

| Command | Aliases | Description |
|---|---|---|
| `cast etherscan-source` | `et, src` | Get source code of a contract from Etherscan |
| `cast creation-code` | `cc` | Download contract creation code from Etherscan + RPC |
| `cast constructor-args` | `cra` | Display constructor args used for initialization |

---

## General Commands

| Command | Aliases | Description |
|---|---|---|
| `cast completions` | `com` | Generate shell completions |
| `cast help` | — | Print help |

---

## Transaction Commands

| Command | Aliases | Description |
|---|---|---|
| `cast call` | `c` | Call a contract without sending a transaction |
| `cast send` | `s` | Sign and publish a transaction |
| `cast mktx` | `m` | Build and sign a transaction (don't broadcast) |
| `cast publish` | `p, pb` | Broadcast a raw signed transaction |
| `cast tx` | `t` | Get transaction info by hash |
| `cast receipt` | `re` | Get transaction receipt |
| `cast estimate` | `e` | Estimate gas cost of a transaction |
| `cast access-list` | `ac, acl` | Create EIP-2930 access list |
| `cast run` | `r` | Run a published transaction locally |
| `cast logs` | `lo` | Get logs matching filters |
| `cast batch-mktx` | `bm` | Build and sign a batch transaction (Tempo) |
| `cast batch-send` | `bs` | Sign and publish a batch transaction (Tempo) |

---

## Utility Commands

| Command | Aliases | Description |
|---|---|---|
| `cast index` | `in` | Compute storage slot for a mapping entry |
| `cast index-erc7201` | `index7201, in7201` | Compute ERC-7201 namespaced storage slot |
| `cast compute-address` | `ca` | Compute CREATE address from deployer + nonce |
| `cast create2` | `c2` | Generate deterministic CREATE2 address |
| `cast implementation` | `impl` | Get EIP-1967 implementation address |
| `cast admin` | `adm` | Get EIP-1967 admin address |
| `cast disassemble` | `da` | Disassemble bytecode to human-readable form |
| `cast artifact` | `ar` | Generate artifact file for local deployment |
| `cast b2e-payload` | `b2e` | Convert Beacon payload to execution payload |
| `cast erc20-token` | `erc20` | ERC-20 token operations |

---

## Wallet Commands

| Command | Aliases | Description |
|---|---|---|
| `cast wallet new` | — | Create a new random keypair |
| `cast wallet new-mnemonic` | — | Create a new mnemonic |
| `cast wallet vanity` | — | Generate a vanity address |
| `cast wallet address` | — | Derive address from private key / keystore |
| `cast wallet sign` | — | Sign a message |
| `cast wallet sign-auth` | — | EIP-7702 authorization signing |
| `cast wallet verify` | — | Verify a signature |
| `cast wallet import` | — | Import private key into encrypted keystore |
| `cast wallet list` | — | List keystores in default keystore directory |
| `cast wallet private-key` | — | Derive private key from mnemonic |
| `cast wallet decrypt-keystore` | — | Decrypt a keystore and print private key |

---

## Notes on cast call vs cast send

```bash
# cast call — view/read-only, no state change, no gas used, no signing
cast call $CONTRACT "balanceOf(address)(uint256)" $ADDR --rpc-url $RPC_URL

# cast send — sends a real transaction, state changes, requires key
cast send $CONTRACT "transfer(address,uint256)" $TO $AMT \
  --private-key $PK \
  --rpc-url $RPC_URL

# Return type annotation syntax (for cast call auto-decode):
# "functionName(inputType)(outputType)"
cast call $TOKEN "totalSupply()(uint256)"
cast call $CONTRACT "getValues()(uint256,address,bool)"
```
