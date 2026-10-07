# Benchmark Rubric

> Scoring criteria for evaluating foundry-forge benchmark tasks.
> Use this rubric to score outputs from both baseline and skill-enabled runs.

## Scoring Overview

For each task, score:

1. **Completeness** (0-100%): What percentage of required behaviors were implemented?
2. **Quality** (0-100%): What percentage of quality criteria were met?

**Improvement** = Skill-enabled score - Baseline score

### Handling Not Applicable (N/A) Items

Some quality criteria may not apply to certain tasks. When scoring:

- **N/A items are EXCLUDED from the denominator** (they do not count as failures)
- Example: If a task does not involve forking, Q5 (Fork Configuration) is marked N/A and excluded
- Example: If a task does not involve deployment scripts, Q7 (Script Structure) is marked N/A and excluded
- The score is calculated as: `(Pass + Partial) / (Total - N/A)`

This ensures fair comparison between implementations that may have different numbers of applicable criteria.

## Quality Criteria Definitions

### Q1: Correct Cheatcode Usage

- **Pass**: Agent uses appropriate `vm.*` cheatcodes for the task (e.g., `vm.prank`, `vm.expectRevert`, `vm.mockCall`)
- **Fail**: Uses incorrect cheatcodes, misspelled names, or omits necessary cheatcodes

### Q2: Test Structure

- **Pass**: Tests follow `setUp()` / `test_` / `testFuzz_` conventions, inherit from `Test.sol`, and use proper visibility
- **Fail**: Missing `setUp()`, incorrect naming, or tests that do not compile under Forge conventions

### Q3: Error Handling

- **Pass**: Agent uses `vm.expectRevert` correctly (with selector, error instance, or string) before the call that should revert
- **Fail**: Misplaces `expectRevert`, uses wrong revert data, or omits error testing entirely

### Q4: Event Testing

- **Pass**: Agent uses `vm.expectEmit` correctly, specifying topics/data checks and the emitter address when relevant
- **Fail**: Omits event testing, uses blanket `expectEmit()` without parameters inappropriately, or forgets to specify emitter

### Q5: Fork Configuration

- **Pass**: Fork URLs and chain IDs are configured properly with pinned block numbers; RPC placeholders are realistic
- **Fail**: Missing block pin, invalid URL format, or no fork configuration where required

### Q6: Fuzz Configuration

- **Pass**: `foundry.toml` has appropriate `runs`, `depth`, `max_test_rejects`, and `seed` values; explains tuning rationale
- **Fail**: Missing config, default values with no explanation, or inappropriate values (e.g., `runs = 1`)

### Q7: Script Structure

- **Pass**: Scripts inherit `Script.sol`, use `vm.startBroadcast()` / `vm.stopBroadcast()` correctly, and have a clear entry point
- **Fail**: Missing broadcast wrapping, wrong inheritance, or external calls outside broadcast blocks

### Q8: Deployment Verification

- **Pass**: CREATE2 address prediction is correct, verification flags are present, and artifact reading logic is accurate
- **Fail**: Wrong CREATE2 formula, missing `--verify`, or incorrect JSON artifact path

### Q9: Gas Awareness

- **Pass**: Gas optimization patterns are present (e.g., snapshot diffs, storage packing, redundant read elimination)
- **Fail**: No mention of gas, generic advice ("use less storage"), or incorrect snapshot interpretation

### Q10: Debug Trace Reading

- **Pass**: Trace interpretation is accurate — identifies the exact call frame, revert reason, and propagation path
- **Fail**: Misidentifies the reverting call, ignores propagation, or provides no trace analysis

## Task-Specific Completeness Criteria

### Task 1: Writing and Running Forge Tests

- [ ] Implements a `setUp()` function that deploys the ERC-20 contract
- [ ] Writes at least one `test_` function verifying a successful transfer
- [ ] Writes at least one `testFuzz_` function for fuzzed transfer amounts
- [ ] Uses `vm.expectRevert` to test the `InsufficientBalance()` custom error
- [ ] Uses `vm.expectEmit` to verify `Transfer` event emission with the correct emitter address
- [ ] Configures `foundry.toml` with at least `[fuzz]` section including `runs` and `max_test_rejects`
- [ ] Uses `vm.pauseGasMetering` / `vm.resumeGasMetering` in at least one test to isolate setup gas
- [ ] Explains when `--via-ir` is appropriate and its tradeoffs (compilation time, optimizer)

### Task 2: Cheatcode Mastery

- [ ] Uses `vm.createSelectFork` to fork mainnet and sets a specific block number
- [ ] Uses `vm.deal` to fund test accounts with ETH before deposits
- [ ] Uses `vm.prank` or `vm.startPrank` / `vm.stopPrank` to simulate multiple users
- [ ] Uses `changePrank` at least once to switch callers mid-test without explicit stop/start
- [ ] Uses `vm.store` and `vm.load` to directly inspect or modify a storage slot in the Vault
- [ ] Uses `vm.mockCall` to simulate a strategy `harvest()` return value without deploying a real strategy
- [ ] Uses `vm.mockFunction` to redirect strategy calls to a local mock implementation
- [ ] Uses `stdstore` (StdStorage) with `.depth(N)` to read a struct field inside a mapping

### Task 3: Fuzz and Invariant Testing

- [ ] Writes a `testFuzz_Increment(uint256 n)` that uses `bound()` to clamp `n` to a reasonable range
- [ ] Writes a `testFuzz_Decrement(uint256 n)` that uses `vm.assume` to ensure count does not underflow
- [ ] Configures `foundry.toml` `[fuzz]` section with `runs`, `max_test_rejects`, and a deterministic `seed`
- [ ] Configures `foundry.toml` `[invariant]` section with `runs`, `depth`, and `fail_on_revert`
- [ ] Creates a `CounterHandler` contract that calls `increment()` and `decrement()`
- [ ] Uses `targetArtifact` or `excludeArtifacts` in the invariant test contract to control handler scope
- [ ] Explains the difference between `vm.assume` and `bound()` and when each is preferred
- [ ] Explains how `max_test_rejects` affects fuzz run validity and when to tune it

### Task 4: Deployment Scripts and Verification

- [ ] Script inherits from `Script.sol` and wraps deployment in `vm.startBroadcast()` / `vm.stopBroadcast()`
- [ ] Computes CREATE2 predicted address using `computeCreate2Address` before deployment
- [ ] Deploys with `new TokenFactory{salt: salt}()` and verifies the deployed address matches prediction
- [ ] Includes `--broadcast`, `--verify`, and `--etherscan-api-key` flags in the broadcast command
- [ ] Explains the `--slow` flag and when it is needed (e.g., multisig or sequential tx dependencies)
- [ ] Explains `--skip-simulation` risks and when it might be used
- [ ] Describes the `--resume` pattern: how to identify which run to resume and how to handle partial failures
- [ ] Reads the deployed address from `broadcast/TokenFactory.s.sol/<chainId>/run-latest.json` in a follow-up script

### Task 5: Debugging and Gas Optimization

- [ ] Accurately interprets the trace: identifies that `Strategy::harvest()` reverts with `Unauthorized()` and propagates
- [ ] Suggests a fix for the Unauthorized revert (e.g., missing access control, incorrect prank, or strategy not whitelisted)
- [ ] Uses `forge snapshot` to establish a gas baseline and explains how to read snapshot diffs
- [ ] Identifies at least one common gas waste pattern in the provided code (e.g., redundant storage reads, unbounded loops)
- [ ] Uses `forge inspect Vault storageLayout` to analyze storage slots and suggest packing improvements
- [ ] Uses `forge inspect Vault irOptimized` (or `ir`) and explains when `irOptimized` vs `ir` is appropriate
- [ ] Explains what `storageLayout` reveals about struct and mapping slot allocation
- [ ] Describes `--via-ir` tradeoffs: optimizer runs, compilation time, and bytecode size impact

## Score Summary Table

| Task | Completeness (Baseline) | Completeness (Skill) | Quality (Baseline) | Quality (Skill) | Improvement |
|------|------------------------|---------------------|-------------------|----------------|-------------|
| 1: Writing and Running Forge Tests | /8 | /8 | /5 | /5 | |
| 2: Cheatcode Mastery | /8 | /8 | /5 | /5 | |
| 3: Fuzz and Invariant Testing | /8 | /8 | /5 | /5 | |
| 4: Deployment Scripts and Verification | /8 | /8 | /5 | /5 | |
| 5: Debugging and Gas Optimization | /8 | /8 | /5 | /5 | |
| **Total** | **/40** | **/40** | **/25** | **/25** | |

## Interpreting Results

- **Improvement > 0**: Skill improves output quality/completeness
- **Improvement = 0**: No measurable improvement
- **Improvement < 0**: Skill degraded output (investigate cause)

**Target**: Skill should improve completeness by >30% and quality by >40% on average.

### Calculating Percentage Improvement

```
Completeness Improvement % = ((Skill Completeness - Baseline Completeness) / Baseline Completeness) * 100
Quality Improvement % = ((Skill Quality - Baseline Quality) / Baseline Quality) * 100
```

If baseline score is 0, use absolute improvement instead of percentage.
