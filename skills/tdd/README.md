# Test-Driven Development

Guides test-driven development of software components using the red-green-refactor loop. Covers test doubles, dependency injection, test structure, and naming.

## What it does

Leads a development cycle in three phases: write a failing test (red), write the minimum implementation to pass it (green), and refactor structure without adding behavior. Explains two schools of unit testing, the London school and the Chicago school, and picks London as the default. Covers test doubles, dependency injection, test structure, and test naming through a main file and three reference files.

## What problem it solves

Tests written before implementation force the interface to be designed from the caller's perspective. Painful test setup signals a design problem: too many dependencies, too many responsibilities, or the wrong abstraction boundary. The skill gives a rule for where to mock, so doubles do not couple to implementation details. It also keeps the loop diagnostic: a failing test must fail for the right reason, and refactors must never mix in new behavior.

## How it is structured

```
skills/tdd/
├── SKILL.md                     # the instruction file agents load
├── assets/
│   └── test-template.md         # concrete scaffold for a test suite
└── references/
    ├── test-doubles.md          # stub, spy, fake, mock, dummy taxonomy
    ├── dependency-injection.md  # constructor, argument, and factory injection
    └── test-patterns.md         # naming, fixtures, assertions, test pyramid
```

## How to use it

Use it when writing new features test-first, adding tests to existing code, designing a component's interface through tests, or when the user mentions TDD, unit tests, mocks, stubs, or test structure.

Run one TDD cycle at a time, and track it with the workflow checklist: write one failing test and confirm it fails for the right reason, write the minimum generalization to pass all tests, checkpoint before touching structure, refactor structure only, and stop to write a test if refactoring reveals a missing case. Read the reference files on demand: test doubles when choosing a double, dependency injection when the arrange section is complex, and test patterns when naming tests or structuring fixtures.

## Provenance

Vendored from the npm package @ftrdotdev/pi-qrspi.

See SKILL.md for the full agent-facing instructions.
