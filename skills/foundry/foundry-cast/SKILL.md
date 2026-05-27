---
name: foundry-cast
description: >
  Interacts with Ethereum and EVM-compatible chains from the command line using Cast — Foundry's
  Swiss Army knife CLI. Covers reading on-chain data (cast call, cast balance, cast block,
  cast storage, cast code), sending transactions (cast send, cast publish, cast mktx), ABI
  encoding and decoding (cast calldata, cast decode-calldata, cast abi-encode, cast 4byte),
  wallet operations (cast wallet new, cast wallet sign, cast wallet import), type conversions
  (cast keccak, cast from-wei, cast to-hex, cast format-units), ENS resolution, Etherscan
  lookups, and all 80+ cast subcommands. Activates when a user wants to inspect chain state,
  craft or decode a transaction, or interact with a deployed contract without writing Solidity.
---

# foundry-cast

Cast is a Swiss Army knife for interacting with Ethereum from the command line.
Canonical docs: https://www.getfoundry.sh/cast
CLI reference: https://www.getfoundry.sh/reference/cast/cast

## Reference freshness

Cast has 80+ subcommands and evolves frequently. Core commands are in `references/commands.md`.
For an unfamiliar subcommand or flag, web-fetch before answering:
`https://www.getfoundry.sh/reference/cast/<subcommand-name>`
**Never fabricate a flag or argument signature.**

## Reference routing

For full command details organized by category, load `references/commands.md`.

---

## Global flags

```bash
--rpc-url <URL>              # RPC endpoint (or set ETH_RPC_URL env var)
--chain <NAME_OR_ID>         # chain name or ID
--etherscan-api-key <KEY>    # Etherscan API key (or set ETHERSCAN_API_KEY)
--json                       # JSON output
-v / --verbose               # verbose output
```

Most commands also accept `--block <TAG|NUMBER>` where relevant.
Block tags: `latest`, `earliest`, `pending`, `safe`, `finalized`.

---

## Quick reference by task

### Read chain data
```bash
cast call <CONTRACT> "balanceOf(address)" <ADDR>        # call view function
cast balance <ADDR>                                      # ETH balance in wei
cast balance <ADDR> --ether                             # in ETH
cast block                                               # latest block
cast block <NUMBER|TAG>                                  # specific block
cast block-number                                        # latest block number
cast code <ADDR>                                         # runtime bytecode
cast storage <ADDR> <SLOT>                               # read storage slot
cast nonce <ADDR>                                        # account nonce
cast tx <HASH>                                           # transaction details
cast receipt <HASH>                                      # transaction receipt
cast logs --address <ADDR> --from-block <N> --to-block <N>  # filter logs
```

### Send transactions
```bash
cast send <CONTRACT> "transfer(address,uint256)" <TO> <AMOUNT> \
  --private-key $PK \
  --rpc-url $RPC_URL

cast send <CONTRACT> "deposit()" --value 1ether \
  --private-key $PK \
  --rpc-url $RPC_URL
```

### ABI encode/decode
```bash
cast calldata "transfer(address,uint256)" <TO> <AMOUNT>   # encode calldata
cast decode-calldata "transfer(address,uint256)" <DATA>    # decode calldata
cast abi-encode "f(address,uint256)" <ADDR> <AMT>         # ABI-encode args (no selector)
cast decode-abi "(address,uint256)" <DATA>                 # ABI-decode
cast 4byte <SELECTOR>                                      # lookup selector signature
cast 4byte-calldata <CALLDATA>                            # decode via openchain.xyz
```

### Type conversions
```bash
cast to-hex <DECIMAL>
cast to-dec <HEX>
cast to-unit <AMOUNT> <UNIT>         # e.g.: cast to-unit 1ether wei
cast from-wei <WEI_AMOUNT>          # convert wei → ETH
cast to-wei <ETH_AMOUNT>            # convert ETH → wei
cast keccak <DATA>                   # keccak256 hash
cast keccak "Transfer(address,address,uint256)"  # event/function topic
cast format-bytes32-string <STR>     # string → bytes32
cast parse-bytes32-string <BYTES32>  # bytes32 → string
cast to-checksummed-address <ADDR>   # EIP-55 checksum
cast concat-hex <HEX1> <HEX2>       # concatenate hex values
cast from-utf8 <TEXT>               # UTF-8 → hex
```

### Wallet
```bash
cast wallet new                           # generate new keypair
cast wallet new-mnemonic                  # generate mnemonic
cast wallet address --private-key $PK    # derive address from key
cast wallet sign <MESSAGE> --private-key $PK      # sign message
cast wallet sign --data <HEX> --private-key $PK  # sign raw bytes
cast wallet verify --address <ADDR> <MESSAGE> <SIG>  # verify signature
cast wallet import <KEYSTORE_NAME> --private-key $PK  # import to keystore
cast wallet list                          # list keystores
```

### ENS
```bash
cast resolve-name <ENS_NAME>             # ENS → address
cast lookup-address <ADDR>               # address → ENS name
```

### Utility
```bash
cast estimate <CONTRACT> "fn()" <ARGS>   # estimate gas
cast access-list <CONTRACT> "fn()" <ARGS>  # generate EIP-2930 access list
cast compute-address <DEPLOYER> --nonce <N>  # predict CREATE address
cast create2 --starts-with <PREFIX>       # find CREATE2 salt
cast index <TYPE> <VALUE> <SLOT>         # compute mapping storage slot
cast storage <ADDR> <SLOT>               # read raw storage slot
cast implementation <PROXY>             # EIP-1967 implementation address
cast admin <PROXY>                       # EIP-1967 admin address
cast age <BLOCK>                         # block timestamp
cast find-block <TIMESTAMP>             # find block by timestamp
cast gas-price                           # current gas price
cast base-fee                            # current base fee
cast chain                               # chain name
cast chain-id                            # chain ID
cast client                              # node client version
cast disassemble <BYTECODE>             # disassemble bytecode
cast interface <ADDR>                    # generate Solidity interface from ABI
```

### Sending raw transactions
```bash
cast publish <SIGNED_TX>                            # broadcast a signed tx
cast mktx <CONTRACT> "fn()" <ARGS> --private-key $PK  # build and sign (don't send)
```

---

## Common patterns

### Call a contract function and decode the result
```bash
cast call 0x... "totalSupply()(uint256)" --rpc-url $RPC_URL
# Parenthesized return types trigger automatic ABI decoding
```

### Read an ERC-20 balance
```bash
cast call $TOKEN "balanceOf(address)(uint256)" $HOLDER --rpc-url $RPC_URL
```

### Decode an unknown transaction
```bash
cast tx $HASH --rpc-url $RPC_URL
cast 4byte-calldata $(cast tx $HASH input)
```

### Read a log/event from a block range
```bash
cast logs \
  --address $CONTRACT \
  --from-block $START \
  --to-block $END \
  "Transfer(address indexed,address indexed,uint256)" \
  --rpc-url $RPC_URL
```

### Set up environment for repeated calls
```bash
export ETH_RPC_URL=https://...
export ETHERSCAN_API_KEY=...
# Now cast commands work without --rpc-url or --etherscan-api-key
```
