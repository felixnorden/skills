# Skill Benchmark Tasks

> Benchmark tasks for measuring foundry-forge skill effectiveness.
> Run each task WITHOUT the skill (baseline), then WITH the skill, and compare outputs.

---

## Task 1: Writing and Running Forge Tests

**Domain**: Smart Contract Testing — ERC-20 test suite with cheatcodes

**Task**: Implement a complete test suite for a minimal ERC-20 contract with the following interface:

```solidity
interface IERC20 {
    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address to, uint256 amount) external returns (bool);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
}
```

The ERC-20 contract reverts with `InsufficientBalance()` when a transfer exceeds balance and emits standard `Transfer` and `Approval` events.

**Required Behaviors**:

- [ ] Implements a `setUp()` function that deploys the ERC-20 contract
- [ ] Writes at least one `test_` function verifying a successful transfer
- [ ] Writes at least one `testFuzz_` function for fuzzed transfer amounts
- [ ] Uses `vm.expectRevert` to test the `InsufficientBalance()` custom error
- [ ] Uses `vm.expectEmit` to verify `Transfer` event emission with the correct emitter address
- [ ] Configures `foundry.toml` with at least `[fuzz]` section including `runs` and `max_test_rejects`
- [ ] Uses `vm.pauseGasMetering` / `vm.resumeGasMetering` in at least one test to isolate setup gas
- [ ] Explains when `--via-ir` is appropriate and its tradeoffs (compilation time, optimizer)

**Quality Criteria**:

- [ ] `vm.expectEmit` specifies the emitter address, not just the blanket form
- [ ] Fuzz test uses `bound()` rather than `vm.assume()` for numeric clamping
- [ ] `setUp()` is minimal and does not perform unnecessary external calls
- [ ] Gas metering is paused only around non-test setup logic (not the assertion itself)
- [ ] `--via-ir` explanation mentions IR pipeline, Yul optimizer, and when it is required

---

## Task 2: Cheatcode Mastery

**Domain**: EVM State Manipulation — Forking, pranks, storage, and mocks

**Task**: Write tests for a `Vault` contract that holds user deposits and delegates yield farming to an external strategy contract. The Vault has:

```solidity
function deposit(uint256 amount) external;
function withdraw(uint256 amount) external;
function harvest() external; // calls strategy.harvest()
function balanceOf(address user) external view returns (uint256);
```

The strategy contract lives on mainnet at a known address. You must test deposit/withdraw logic, simulate a strategy harvest, and verify storage manipulation.

**Required Behaviors**:

- [ ] Uses `vm.createSelectFork` to fork mainnet and sets a specific block number
- [ ] Uses `vm.deal` to fund test accounts with ETH before deposits
- [ ] Uses `vm.prank` or `vm.startPrank` / `vm.stopPrank` to simulate multiple users
- [ ] Uses `changePrank` at least once to switch callers mid-test without explicit stop/start
- [ ] Uses `vm.store` and `vm.load` to directly inspect or modify a storage slot in the Vault
- [ ] Uses `vm.mockCall` to simulate a strategy `harvest()` return value without deploying a real strategy
- [ ] Uses `vm.mockFunction` to redirect strategy calls to a local mock implementation
- [ ] Uses `stdstore` (StdStorage) with `.depth(N)` to read a struct field inside a mapping

**Quality Criteria**:

- [ ] Fork configuration includes a realistic RPC URL placeholder and a pinned block number
- [ ] Prank usage is cleaned up properly (no leaked prank state between tests)
- [ ] `changePrank` is used in a context where it actually simplifies the test flow
- [ ] `stdstore` `.depth(N)` explanation includes why the specific depth value was chosen
- [ ] `vm.mockFunction` is used for a realistic redirection (not just a trivial return value)

---

## Task 3: Fuzz and Invariant Testing

**Domain**: Property-Based Testing — Fuzz constraints and invariant handlers

**Task**: Implement fuzz and invariant tests for a `Counter` contract that supports `increment()`, `decrement()`, and `getCount()`. `decrement()` reverts with `Underflow()` if count is zero.

Additionally, write an invariant test with a handler contract that calls `increment()` and `decrement()` through various paths.

**Required Behaviors**:

- [ ] Writes a `testFuzz_Increment(uint256 n)` that uses `bound()` to clamp `n` to a reasonable range
- [ ] Writes a `testFuzz_Decrement(uint256 n)` that uses `vm.assume` to ensure count does not underflow
- [ ] Configures `foundry.toml` `[fuzz]` section with `runs`, `max_test_rejects`, and a deterministic `seed`
- [ ] Configures `foundry.toml` `[invariant]` section with `runs`, `depth`, and `fail_on_revert`
- [ ] Creates a `CounterHandler` contract that calls `increment()` and `decrement()`
- [ ] Uses `targetArtifact` or `excludeArtifacts` in the invariant test contract to control handler scope
- [ ] Explains the difference between `vm.assume` and `bound()` and when each is preferred
- [ ] Explains how `max_test_rejects` affects fuzz run validity and when to tune it

**Quality Criteria**:

- [ ] `foundry.toml` fuzz config includes `seed` for reproducibility
- [ ] `foundry.toml` invariant config includes `depth` appropriate for the handler complexity
- [ ] Handler contract exercises both increment and decrement paths
- [ ] Invariant test targets the correct contract artifact (no accidental targeting of the handler)
- [ ] `max_test_rejects` tuning rationale is provided (e.g., high reject rate indicates bad input distribution)

---

## Task 4: Deployment Scripts and Verification

**Domain**: On-Chain Deployment — CREATE2, broadcast, verification, and resumption

**Task**: Write a `forge script` that deploys a `TokenFactory` contract using CREATE2 with a salt, broadcasts the deployment to a live network, verifies the contract on Etherscan, and handles partial broadcast failures.

The `TokenFactory` constructor takes no arguments. You must predict the deployment address before broadcasting.

**Required Behaviors**:

- [ ] Script inherits from `Script.sol` and wraps deployment in `vm.startBroadcast()` / `vm.stopBroadcast()`
- [ ] Computes CREATE2 predicted address using `computeCreate2Address` before deployment
- [ ] Deploys with `new TokenFactory{salt: salt}()` and verifies the deployed address matches prediction
- [ ] Includes `--broadcast`, `--verify`, and `--etherscan-api-key` flags in the broadcast command
- [ ] Explains the `--slow` flag and when it is needed (e.g., multisig or sequential tx dependencies)
- [ ] Explains `--skip-simulation` risks and when it might be used
- [ ] Describes the `--resume` pattern: how to identify which run to resume and how to handle partial failures
- [ ] Reads the deployed address from `broadcast/TokenFactory.s.sol/<chainId>/run-latest.json` in a follow-up script

**Quality Criteria**:

- [ ] CREATE2 salt is generated deterministically (e.g., `keccak256("...")`) and documented
- [ ] Broadcast command includes all necessary flags for a production deployment
- [ ] `--slow` explanation includes the confirmation-wait behavior
- [ ] `--resume` explanation references the run-latest.json or run-timestamp.json file to identify the correct run
- [ ] Follow-up script correctly parses the JSON artifact path and extracts the contract address

---

## Task 5: Debugging and Gas Optimization

**Domain**: Diagnostics — Trace interpretation, gas snapshots, and bytecode inspection

**Task**: Given the following failing test trace, diagnose the issue, optimize the function, and inspect the contract:

```
[29808] VaultTest::test_WithdrawAfterDeposit()
  ├─ [2407] Vault::balanceOf(user) [staticcall]
  │   └─ ← [Return] 1000
  ├─ [20460] Vault::withdraw(1000)
  │   ├─ [1840] Strategy::harvest() [call]
  │   │   └─ ← [Revert] Unauthorized()
  │   └─ ← [Revert] Unauthorized()
  └─ ← [Revert] Unauthorized()
```

Also given this gas snapshot diff after optimization:

```diff
- VaultTest::test_Deposit  124,503
+ VaultTest::test_Deposit   98,210
```

**Required Behaviors**:

- [ ] Accurately interprets the trace: identifies that `Strategy::harvest()` reverts with `Unauthorized()` and propagates
- [ ] Suggests a fix for the Unauthorized revert (e.g., missing access control, incorrect prank, or strategy not whitelisted)
- [ ] Uses `forge snapshot` to establish a gas baseline and explains how to read snapshot diffs
- [ ] Identifies at least one common gas waste pattern in the provided code (e.g., redundant storage reads, unbounded loops)
- [ ] Uses `forge inspect Vault storageLayout` to analyze storage slots and suggest packing improvements
- [ ] Uses `forge inspect Vault irOptimized` (or `ir`) and explains when `irOptimized` vs `ir` is appropriate
- [ ] Explains what `storageLayout` reveals about struct and mapping slot allocation
- [ ] Describes `--via-ir` tradeoffs: optimizer runs, compilation time, and bytecode size impact

**Quality Criteria**:

- [ ] Trace interpretation pinpoints the exact call frame causing the revert
- [ ] Gas optimization suggestion is concrete and actionable (not just "use less storage")
- [ ] `forge inspect` usage includes the correct field and a plausible output interpretation
- [ ] `storageLayout` explanation mentions slot packing and variable ordering
- [ ] `--via-ir` explanation distinguishes between `ir` (intermediate) and `irOptimized` (optimized) output

---

## Gap Coverage Matrix

| Identified Gap | Covered By Task | Criterion Location |
|---|---|---|
| 1. Missing advanced fuzz configuration | Task 3 | Required Behaviors 3, 4; Quality Criteria 1, 2, 5 |
| 2. Incomplete debugging workflow | Task 5 | Required Behaviors 1, 2; Quality Criteria 1 |
| 3. No gas optimization content | Task 5 | Required Behaviors 3, 4; Quality Criteria 2, 3 |
| 4. Missing forge inspect field explanations | Task 5 | Required Behaviors 5, 6; Quality Criteria 3, 4, 5 |
| 5. Thin invariant testing coverage | Task 3 | Required Behaviors 5, 6; Quality Criteria 3, 4 |
| 6. No documentation of --via-ir tradeoffs | Task 1, Task 5 | Task 1 RB 8 / QC 5; Task 5 RB 8 / QC 5 |
| 7. Scripting resume pattern incomplete | Task 4 | Required Behaviors 7; Quality Criteria 4 |
| 8. Missing expectEmit emitter specification | Task 1 | Required Behaviors 5; Quality Criteria 1 |
| 9. No guidance on test isolation (gas metering) | Task 1 | Required Behaviors 7; Quality Criteria 4 |
| 10. Missing StdStorage depth explanation | Task 2 | Required Behaviors 8; Quality Criteria 4 |
