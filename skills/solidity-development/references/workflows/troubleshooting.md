# Troubleshooting

Common Solidity failures and their causes.

## Compilation Errors

- "Stack too deep" - Use structs or scoping to reduce local variables
- "Contract size exceeds limit" - Enable optimizer, split into libraries
- "Identifier not found" - Check imports and version compatibility

## Deployment Failures

- "Out of gas" - Increase gas limit, optimize contract size
- "Invalid opcode" - Check constructor arguments and initialization
- "Proxy implementation not set" - Verify deployment order for upgradeable contracts

## Runtime Issues

- "Reentrancy detected" - Ensure CEI pattern and proper guard usage
- "Access control violation" - Verify role/ownership assignments
- "Storage corruption after upgrade" - Check storage layout compatibility

## Gas Estimation Problems

- Use `forge test --gas-report` for accurate measurements
- Enable optimizer with `optimizer: true` and `optimizerRuns: 200`
- Test on target network (L1 vs L2 have different costs)

## Testing Failures

- "Assertion failed" - Check test setup and state initialization
- "Revert reason mismatch" - Verify exact error message or custom error selector
- "Fork test fails" - Ensure RPC endpoint is valid and block number exists
