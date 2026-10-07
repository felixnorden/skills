# Gap Analysis

> Analysis of baseline failures mapped to the 10 identified skill gaps.
> This document drives the priority and content of skill refinement in Slice 4.

## Summary

| Gap | Failures | Priority |
|-----|----------|----------|
| 1. Missing advanced fuzz configuration | 6 | **High** |
| 2. Incomplete debugging workflow | 4 | **High** |
| 3. No gas optimization content | 5 | **High** |
| 4. Missing forge inspect field explanations | 5 | **High** |
| 5. Thin invariant testing coverage | 5 | **High** |
| 6. No documentation of --via-ir tradeoffs | 3 | Medium |
| 7. Scripting resume pattern incomplete | 4 | **High** |
| 8. Missing expectEmit emitter specification | 3 | Medium |
| 9. No guidance on test isolation (gas metering) | 2 | Medium |
| 10. Missing StdStorage depth explanation | 3 | Medium |

---

## Gap 1: Missing advanced fuzz configuration

**Failure count**: 6

**Affected tasks**:
- Task 1: Missing foundry.toml [fuzz] with runs and max_test_rejects (RB 6)
- Task 3: Missing foundry.toml [fuzz] with runs, max_test_rejects, seed (RB 3)
- Task 3: Missing foundry.toml [invariant] with runs, depth, fail_on_revert (RB 4)
- Task 3: Missing max_test_rejects tuning explanation (RB 8)
- Task 3: Missing seed for reproducibility (QC 1)
- Task 1: Missing fuzz configuration guidance (QC 6)

**Root cause**: The skill mentions fuzz config in SKILL.md but does not explain max_test_rejects tuning, seed-based reproducibility, or when to adjust runs vs depth.

**Content to add**:
- Advanced fuzz configuration section in `references/cheatcodes.md`
- Invariant config guidance in `SKILL.md`
- max_test_rejects tuning rationale with examples

---

## Gap 2: Incomplete debugging workflow

**Failure count**: 4

**Affected tasks**:
- Task 5: Trace interpretation was generic, did not identify specific error patterns (RB 1, QC 1)
- Task 5: Missing guidance on interpreting reentrancy vs overflow vs custom error traces (QC 10)
- Task 1: Debug checklist in SKILL.md is too generic to help with specific errors
- Task 5: No structured approach to trace diagnosis

**Root cause**: SKILL.md has a debug checklist but no trace interpretation guide for specific error types.

**Content to add**:
- Trace interpretation guide in `SKILL.md` for reentrancy, overflow, custom errors
- Specific error pattern examples in debug checklist

---

## Gap 3: No gas optimization content

**Failure count**: 5

**Affected tasks**:
- Task 5: Missing forge snapshot baseline and diff explanation (RB 3)
- Task 5: Missing gas waste pattern identification (RB 4)
- Task 5: Missing gas optimization guidance (QC 2)
- Task 1: Missing vm.pauseGasMetering / vm.resumeGasMetering usage (RB 7)
- Task 1: Missing gas metering isolation guidance (QC 4)

**Root cause**: No dedicated gas optimization section in any skill file. `forge snapshot` is mentioned but not explained.

**Content to add**:
- Gas optimization section in `SKILL.md`
- vm.pauseGasMetering / vm.resumeGasMetering use cases in `references/cheatcodes.md`
- Common gas waste patterns and snapshot interpretation

---

## Gap 4: Missing forge inspect field explanations

**Failure count**: 5

**Affected tasks**:
- Task 5: Missing forge inspect storageLayout usage (RB 5)
- Task 5: Missing forge inspect irOptimized explanation (RB 6)
- Task 5: Missing storageLayout slot allocation explanation (RB 7)
- Task 5: Missing irOptimized vs ir distinction (QC 5)
- Task 5: Missing storageLayout slot packing explanation (QC 4)

**Root cause**: SKILL.md lists inspect fields but does not explain when to use irOptimized vs ir or what storageLayout reveals.

**Content to add**:
- Forge inspect field explanations in `SKILL.md`
- storageLayout interpretation guide
- irOptimized vs ir usage context

---

## Gap 5: Thin invariant testing coverage

**Failure count**: 5

**Affected tasks**:
- Task 3: Missing CounterHandler contract (RB 5)
- Task 3: Missing targetArtifact / excludeArtifacts usage (RB 6)
- Task 3: Missing invariant test structure (QC 3)
- Task 3: Missing handler path coverage (QC 3)
- Task 3: Missing artifact targeting correctness (QC 4)

**Root cause**: SKILL.md shows basic invariant test structure but lacks guidance on handler contracts, targetArtifact, and excludeArtifacts.

**Content to add**:
- Invariant testing handler contract guidance in `SKILL.md`
- targetArtifact and excludeArtifacts examples
- Handler pattern documentation

---

## Gap 6: No documentation of --via-ir tradeoffs

**Failure count**: 3

**Affected tasks**:
- Task 1: Missing --via-ir explanation (RB 8)
- Task 1: Missing IR pipeline / Yul optimizer / compilation time explanation (QC 5)
- Task 5: Missing --via-ir tradeoffs (RB 8, QC 5)

**Root cause**: SKILL.md mentions --via-ir in CLI commands but never explains when it is needed or its cost.

**Content to add**:
- --via-ir tradeoffs section in `SKILL.md`
- When to enable IR pipeline with examples

---

## Gap 7: Scripting resume pattern incomplete

**Failure count**: 4

**Affected tasks**:
- Task 4: Missing --slow flag explanation (RB 5)
- Task 4: Missing --skip-simulation risks (RB 6)
- Task 4: Missing --resume pattern description (RB 7)
- Task 4: Missing resume explanation referencing run-latest.json (QC 4)

**Root cause**: `references/scripting.md` shows --resume but does not explain how to identify which run to resume or handle partial failures.

**Content to add**:
- --slow flag behavior in `references/scripting.md`
- --skip-simulation usage context and risks
- Resume pattern with run identification and partial failure handling

---

## Gap 8: Missing expectEmit emitter specification

**Failure count**: 3

**Affected tasks**:
- Task 1: Missing vm.expectEmit with emitter address (RB 5)
- Task 1: Missing emitter specification in quality (QC 1)
- Task 2: No event testing requiring emitter spec (indirect)

**Root cause**: `references/cheatcodes.md` shows the blanket `vm.expectEmit()` but lacks a clear pattern for `vm.expectEmit(address emitter)`.

**Content to add**:
- vm.expectEmit(address emitter) pattern with example in `references/cheatcodes.md`

---

## Gap 9: No guidance on test isolation (gas metering)

**Failure count**: 2

**Affected tasks**:
- Task 1: Missing vm.pauseGasMetering / vm.resumeGasMetering (RB 7)
- Task 1: Missing gas metering isolation guidance (QC 4)

**Root cause**: `references/cheatcodes.md` lists the cheatcodes but provides no use cases or examples.

**Content to add**:
- vm.pauseGasMetering / vm.resumeGasMetering use cases with example in `references/cheatcodes.md`

---

## Gap 10: Missing StdStorage depth explanation

**Failure count**: 3

**Affected tasks**:
- Task 2: Missing stdstore with .depth(N) (RB 8)
- Task 2: Missing depth explanation in quality (QC 4)
- Task 2: No struct field offset example (indirect)

**Root cause**: `references/forge-std.md` shows `.depth(N)` but does not explain struct field offset calculation or when to use it.

**Content to add**:
- StdStorage depth(N) explanation with struct field offset example in `references/forge-std.md`

---

## Content Addition Priority

1. **High priority** (≥4 failures): Gaps 1, 2, 3, 4, 5, 7
2. **Medium priority** (2-3 failures): Gaps 6, 8, 9, 10

All gaps will be addressed in Slice 4. High-priority gaps receive more detailed examples and multiple concrete patterns.
