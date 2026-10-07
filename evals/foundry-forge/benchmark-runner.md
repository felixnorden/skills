# Benchmark Runner

> Instructions for running the foundry-forge skill benchmark.
> This is a manual process to allow human oversight of outputs.

## Prerequisites

- Access to two fresh agent conversations (or ability to reset conversations)
- foundry-forge skill installed
- Ability to save/compare agent outputs

## Process Overview

```
┌─────────────────────────────────────────────────────────────┐
│ Phase 1: Baseline Run (Without Skill)                      │
│ ├── Copy task prompts 1-5                                   │
│ ├── Disable foundry-forge skill                             │
│ ├── Run each task, save outputs                            │
│ └── Score against rubric (Completeness + Quality)           │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ Phase 2: Skill-Enabled Run (With Skill)                     │
│ ├── Copy task prompts 1-5                                   │
│ ├── Enable foundry-forge skill                              │
│ ├── Run each task, save outputs                            │
│ └── Score against rubric (Completeness + Quality)           │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ Phase 3: Comparison                                         │
│ ├── Calculate improvement per task                         │
│ ├── Calculate total improvement                            │
│ └── Document findings                                      │
└─────────────────────────────────────────────────────────────┘
```

## Phase 1: Baseline Run

### Step 1: Prepare Environment

1. Open a **new conversation** (or reset current conversation context completely)
2. **Verify the foundry-forge skill is NOT active**:
   - Check skill list — skill should not be loaded
   - Ask a test question: "How do I use `vm.expectEmit` with a specific emitter address?"
   - If the response references `references/cheatcodes.md` or other skill-specific content, the skill is still active
   - **If loaded, the baseline results will be invalid. Start over with a completely fresh conversation.**

### Step 2: Run Task 1 (Writing and Running Forge Tests)

Copy the following prompt and paste into the agent:

```
Task: Implement a complete test suite for a minimal ERC-20 contract with the following interface:

interface IERC20 {
    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address to, uint256 amount) external returns (bool);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
}

The ERC-20 contract reverts with InsufficientBalance() when a transfer exceeds balance and emits standard Transfer and Approval events.

Requirements:
- Implement setUp() that deploys the ERC-20 contract
- Write test_ and testFuzz_ functions for transfers
- Use vm.expectRevert for the InsufficientBalance() custom error
- Use vm.expectEmit with the correct emitter address for Transfer events
- Configure foundry.toml with [fuzz] settings including runs and max_test_rejects
- Use vm.pauseGasMetering / vm.resumeGasMetering in at least one test
- Explain when --via-ir is appropriate and its tradeoffs

Provide complete Solidity test code and configuration.
```

Save the output as `baseline-task-1.md`.

### Step 3: Run Tasks 2-5

Repeat Step 2 for each remaining task. Use the prompts below.

**Task 2 (Cheatcode Mastery)**:

```
Task: Write tests for a Vault contract that holds user deposits and delegates yield farming to an external strategy contract.

Vault interface:
function deposit(uint256 amount) external;
function withdraw(uint256 amount) external;
function harvest() external; // calls strategy.harvest()
function balanceOf(address user) external view returns (uint256);

The strategy contract lives on mainnet at a known address.

Requirements:
- Use vm.createSelectFork to fork mainnet at a specific block
- Use vm.deal to fund test accounts
- Use vm.prank / vm.startPrank / vm.stopPrank for multiple users
- Use changePrank to switch callers mid-test
- Use vm.store and vm.load to inspect/modify Vault storage
- Use vm.mockCall to simulate strategy harvest() return value
- Use vm.mockFunction to redirect strategy calls to a local mock
- Use stdstore with .depth(N) to read a struct field inside a mapping

Provide complete Solidity test code.
```

**Task 3 (Fuzz and Invariant Testing)**:

```
Task: Implement fuzz and invariant tests for a Counter contract.

Counter interface:
function increment() external;
function decrement() external;
function getCount() external view returns (uint256);

decrement() reverts with Underflow() if count is zero.

Requirements:
- Write testFuzz_Increment(uint256 n) using bound()
- Write testFuzz_Decrement(uint256 n) using vm.assume
- Configure foundry.toml [fuzz] with runs, max_test_rejects, and seed
- Configure foundry.toml [invariant] with runs, depth, fail_on_revert
- Create a CounterHandler contract that calls increment() and decrement()
- Use targetArtifact or excludeArtifacts to control handler scope
- Explain the difference between vm.assume and bound()
- Explain how max_test_rejects affects fuzz validity

Provide complete Solidity test code, foundry.toml config, and explanations.
```

**Task 4 (Deployment Scripts and Verification)**:

```
Task: Write a forge script that deploys a TokenFactory contract using CREATE2.

TokenFactory has no constructor arguments.

Requirements:
- Script must inherit Script.sol and wrap deployment in vm.startBroadcast() / vm.stopBroadcast()
- Compute CREATE2 predicted address using computeCreate2Address before deployment
- Deploy with new TokenFactory{salt: salt}() and verify address matches prediction
- Include --broadcast, --verify, and --etherscan-api-key in the broadcast command
- Explain the --slow flag and when it is needed
- Explain --skip-simulation risks
- Describe the --resume pattern: how to identify which run to resume and handle partial failures
- Read the deployed address from broadcast/TokenFactory.s.sol/<chainId>/run-latest.json in a follow-up script

Provide complete Solidity script, CLI commands, and explanations.
```

**Task 5 (Debugging and Gas Optimization)**:

```
Task: Given the following failing test trace, diagnose the issue, optimize the function, and inspect the contract.

Trace:
[29808] VaultTest::test_WithdrawAfterDeposit()
  ├─ [2407] Vault::balanceOf(user) [staticcall]
  │   └─ ← [Return] 1000
  ├─ [20460] Vault::withdraw(1000)
  │   ├─ [1840] Strategy::harvest() [call]
  │   │   └─ ← [Revert] Unauthorized()
  │   └─ ← [Revert] Unauthorized()
  └─ ← [Revert] Unauthorized()

Gas snapshot diff after optimization:
- VaultTest::test_Deposit  124,503
+ VaultTest::test_Deposit   98,210

Requirements:
- Interpret the trace accurately and identify the revert cause
- Suggest a concrete fix for the Unauthorized revert
- Use forge snapshot to establish a gas baseline and explain how to read diffs
- Identify a common gas waste pattern (e.g., redundant storage reads)
- Use forge inspect Vault storageLayout to analyze storage slots
- Use forge inspect Vault irOptimized and explain when irOptimized vs ir is appropriate
- Explain what storageLayout reveals about struct and mapping slot allocation
- Describe --via-ir tradeoffs (optimizer runs, compilation time, bytecode size)

Provide your analysis, suggested fixes, and explanations.
```

### Step 4: Score Baseline Outputs

For each saved output, open `benchmark-rubric.md` and mark pass/fail:

1. Check each completeness criterion (8 per task)
2. Check each quality criterion (shared across all tasks, 5 per task where applicable)
3. Record scores in the Score Summary Table

Save completed scores as `baseline-results.md`.

## Phase 2: Skill-Enabled Run

### Step 1: Prepare Environment

1. Open a **NEW conversation** (critical — no cross-contamination with baseline context)
2. **Enable the foundry-forge skill**:
   - Load skill or activate in conversation
   - Verify skill is active before proceeding:
     - Ask: "How do I use `vm.expectEmit` with a specific emitter address?"
     - Confirm response references `references/cheatcodes.md` or skill-specific checklists
3. **Confirm isolation**: The new conversation must not have any baseline task outputs or context

### Step 2: Run All Tasks

Repeat Phase 1, Steps 2-3 with the skill enabled.
Save outputs as `skill-task-1.md`, `skill-task-2.md`, etc.

### Step 3: Score Skill-Enabled Outputs

Using the same rubric, score each skill-enabled output.
Save completed scores as `skill-enabled-results.md`.

## Phase 3: Comparison

### Step 1: Calculate Improvement

For each task:

```
Completeness Improvement = Skill Completeness - Baseline Completeness
Quality Improvement = Skill Quality - Baseline Quality
```

Calculate percentage improvement:
```
Completeness Improvement % = ((Skill Completeness - Baseline Completeness) / Baseline Completeness) * 100
Quality Improvement % = ((Skill Quality - Baseline Quality) / Baseline Quality) * 100
```

If baseline score is 0, report absolute improvement.

### Step 2: Document Findings

Create a comparison document (`improvement-comparison.md`) with:

1. **Per-Task Scores**: Table showing baseline vs skill scores per task
2. **Total Scores**: Combined totals
3. **Key Observations**: Which patterns improved most?
4. **Failure Analysis**: Where did the skill not help?

### Example Score Summary

| Metric | Baseline | With Skill | Improvement |
|--------|----------|------------|-------------|
| Total Completeness | 12/40 | 32/40 | +20 (+167%) |
| Total Quality | 8/25 | 20/25 | +12 (+150%) |

## Expected Outcomes

Based on the skill's design, the benchmark should show improvement in:

- **Cheatcode usage**: Skill provides specific cheatcode patterns and examples
- **Test structure**: Skill enforces setUp/test_/testFuzz_ conventions
- **Error handling**: Skill documents vm.expectRevert with custom errors
- **Event testing**: Skill shows vm.expectEmit with emitter specification
- **Fork configuration**: Skill provides fork URL and block pinning patterns
- **Fuzz configuration**: Skill explains runs, depth, max_test_rejects, and seed
- **Script structure**: Skill enforces Script.sol inheritance and broadcast wrapping
- **Deployment verification**: Skill documents CREATE2 and verification patterns
- **Gas awareness**: Skill provides snapshot interpretation and optimization patterns
- **Debug trace reading**: Skill explains trace interpretation for specific error types

## Troubleshooting

**Q: Skill appears active during baseline run**
A: Invalidate the baseline results. Start completely fresh with verification.

**Q: Outputs are very similar**
A: This may indicate the agent already knew Forge patterns well. Consider:
- Using less experienced agents for baseline
- Adding more specific quality criteria
- Checking if tasks are too easy

**Q: Skill output is worse**
A: Investigate. Possible causes:
- Skill conflict with agent's existing knowledge
- Skill suggesting patterns not appropriate for tasks
- Scoring bias in human evaluation
- Skill content is outdated or incorrect

**Q: Baseline scores are unexpectedly high (>50%)**
A: The tasks may be too easy. Redesign tasks to stress the identified gaps more aggressively.
