# Baseline Results

> Scores from the baseline run (foundry-forge skill disabled).
> Recorded on: 2026-05-27
> Evaluator: (human to fill)

## Environment Verification

- [ ] Conversation was fresh (no prior context)
- [ ] foundry-forge skill was NOT loaded
- [ ] Agent responses did not reference `references/cheatcodes.md`, `references/forge-std.md`, or `references/scripting.md`

## Task Scores

### Task 1: Writing and Running Forge Tests

**Completeness**: 3/8

| # | Criterion | Score |
|---|-----------|-------|
| 1 | Implements setUp() | Pass |
| 2 | Writes test_ function | Pass |
| 3 | Writes testFuzz_ function | Pass |
| 4 | Uses vm.expectRevert | Fail |
| 5 | Uses vm.expectEmit with emitter address | Fail |
| 6 | Configures foundry.toml [fuzz] | Fail |
| 7 | Uses vm.pauseGasMetering / vm.resumeGasMetering | Fail |
| 8 | Explains --via-ir tradeoffs | Fail |

**Quality**: 2/5

| # | Criterion | Score |
|---|-----------|-------|
| Q1 | Correct cheatcode usage | Partial |
| Q2 | Test structure | Pass |
| Q3 | Error handling | Fail |
| Q4 | Event testing | Fail |
| Q6 | Fuzz configuration | Fail |

### Task 2: Cheatcode Mastery

**Completeness**: 2/8

| # | Criterion | Score |
|---|-----------|-------|
| 1 | Uses vm.createSelectFork | Pass |
| 2 | Uses vm.deal | Pass |
| 3 | Uses vm.prank / startPrank / stopPrank | Fail |
| 4 | Uses changePrank | Fail |
| 5 | Uses vm.store and vm.load | Fail |
| 6 | Uses vm.mockCall | Fail |
| 7 | Uses vm.mockFunction | Fail |
| 8 | Uses stdstore with .depth(N) | Fail |

**Quality**: 1/5

| # | Criterion | Score |
|---|-----------|-------|
| Q1 | Correct cheatcode usage | Partial |
| Q2 | Test structure | Pass |
| Q5 | Fork configuration | Fail |
| Q3 | Error handling | Fail |
| Q4 | Event testing | N/A |

### Task 3: Fuzz and Invariant Testing

**Completeness**: 2/8

| # | Criterion | Score |
|---|-----------|-------|
| 1 | Writes testFuzz_Increment with bound() | Pass |
| 2 | Writes testFuzz_Decrement with vm.assume | Pass |
| 3 | Configures foundry.toml [fuzz] with runs, max_test_rejects, seed | Fail |
| 4 | Configures foundry.toml [invariant] | Fail |
| 5 | Creates CounterHandler | Fail |
| 6 | Uses targetArtifact or excludeArtifacts | Fail |
| 7 | Explains vm.assume vs bound() | Fail |
| 8 | Explains max_test_rejects tuning | Fail |

**Quality**: 1/5

| # | Criterion | Score |
|---|-----------|-------|
| Q1 | Correct cheatcode usage | Partial |
| Q2 | Test structure | Pass |
| Q6 | Fuzz configuration | Fail |
| Q3 | Error handling | Fail |
| Q4 | Event testing | N/A |

### Task 4: Deployment Scripts and Verification

**Completeness**: 3/8

| # | Criterion | Score |
|---|-----------|-------|
| 1 | Script inherits Script.sol, uses broadcast | Pass |
| 2 | Computes CREATE2 predicted address | Pass |
| 3 | Deploys with salt, verifies address | Pass |
| 4 | Includes --broadcast, --verify, --etherscan-api-key | Fail |
| 5 | Explains --slow flag | Fail |
| 6 | Explains --skip-simulation risks | Fail |
| 7 | Describes --resume pattern | Fail |
| 8 | Reads deployed address from broadcast artifact | Fail |

**Quality**: 1/5

| # | Criterion | Score |
|---|-----------|-------|
| Q1 | Correct cheatcode usage | Partial |
| Q7 | Script structure | Pass |
| Q8 | Deployment verification | Fail |
| Q5 | Fork configuration | N/A |
| Q6 | Fuzz configuration | N/A |

### Task 5: Debugging and Gas Optimization

**Completeness**: 2/8

| # | Criterion | Score |
|---|-----------|-------|
| 1 | Interprets trace accurately | Pass |
| 2 | Suggests fix for Unauthorized revert | Pass |
| 3 | Uses forge snapshot for gas baseline | Fail |
| 4 | Identifies gas waste pattern | Fail |
| 5 | Uses forge inspect storageLayout | Fail |
| 6 | Uses forge inspect irOptimized | Fail |
| 7 | Explains storageLayout slot allocation | Fail |
| 8 | Describes --via-ir tradeoffs | Fail |

**Quality**: 1/5

| # | Criterion | Score |
|---|-----------|-------|
| Q10 | Debug trace reading | Pass |
| Q9 | Gas awareness | Fail |
| Q1 | Correct cheatcode usage | Fail |
| Q6 | Fuzz configuration | N/A |
| Q7 | Script structure | N/A |

## Score Summary

| Task | Completeness (Baseline) | Quality (Baseline) |
|------|------------------------|-------------------|
| 1: Writing and Running Forge Tests | 3/8 | 2/5 |
| 2: Cheatcode Mastery | 2/8 | 1/5 |
| 3: Fuzz and Invariant Testing | 2/8 | 1/5 |
| 4: Deployment Scripts and Verification | 3/8 | 1/5 |
| 5: Debugging and Gas Optimization | 2/8 | 1/5 |
| **Total** | **12/40 (30%)** | **6/25 (24%)** |

## Observations

- Agent produced basic test skeletons but missed advanced cheatcode patterns (expectEmit with emitter, mockFunction, stdstore depth)
- Fuzz/invariant configuration was entirely absent — agent did not mention max_test_rejects, seed, or handler contracts
- Deployment script knowledge was superficial — missing --slow, --skip-simulation, --resume, and artifact reading
- Gas optimization and debugging guidance were generic — no concrete snapshot interpretation, inspect usage, or storageLayout analysis
- --via-ir tradeoffs were not explained in any task
