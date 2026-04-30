---
name: tdd
description: Guides test-driven development of software components using the red-green-refactor loop. Covers test doubles, dependency injection, test structure, and naming. Use when writing new features test-first, adding tests to existing code, designing a component's interface through tests, or when the user mentions TDD, unit tests, mocks, stubs, or test structure.
---

# Test-Driven Development

TDD is a design practice as much as a testing practice. Tests written before implementation force the interface to be designed from the caller's perspective. Painful test setup signals a design problem — too many dependencies, responsibilities, or the wrong abstraction boundary. Let the tests tell you.

---

## Schools

Two schools differ on what constitutes a "unit" and where to draw the mock boundary.

**London school (default here):** A unit is a single class or function. Double all collaborators at module boundaries. Preferred for new code — drives interface design and keeps feedback fast.

**Chicago school:** A unit is a cluster of related objects. Wire real collaborators; only double external infrastructure (databases, HTTP, clocks). Preferred when retrofitting tests onto existing code with stable internal structure.

Both are valid. The choice determines where doubles live, not whether you test.

---

## Red-Green-Refactor

### Red — write a failing test

Write a test that specifies one behavior that does not yet exist. Run it. Confirm it fails **for the right reason**: the behavior is absent, not a compilation error or misconfigured test harness. A test that fails for the wrong reason gives false confidence when it later passes.

```
test "order total includes 20% tax when region is EU":
    order = Order(region: Region.EU, pricing: StubPricingService(basePrice: 100.00))
    assert order.calculate() == 120.00
// Fails: Order.calculate() does not exist yet — correct red
```

### Green — write the minimum passing implementation

Write the simplest generalisation that satisfies all current tests. "Minimum" means the simplest correct implementation — not a hardcoded return value, unless you are deliberately triangulating (see below). Do not add behavior not yet specified by a test.

**Triangulation** is a valid incremental technique: return a hardcode on the first test, write a second test that contradicts it, then generalise. Use it consciously, not reflexively.

```
// First test: order with one item at 100.00 in EU → 120.00
calculate() -> decimal:
    return 120.00   // hardcode to pass first test only

// Second test: order with one item at 200.00 in EU → 240.00
// Hardcode no longer works — now generalise:
calculate() -> decimal:
    return this.pricing.getPrice(this.item) * (1 + this.region.taxRate())
```

### Checkpoint

Before refactoring: commit or checkpoint the moment all tests are green. If a refactor breaks tests, revert to the checkpoint rather than debugging a mixed change. This preserves the diagnostic value of the loop.

### Refactor — improve structure, not behavior

In the refactor phase: no new behavior enters. Rename, extract, consolidate, simplify. If you discover a missing case during refactor, stop — write a test for it (red), pass it (green), then resume the refactor.

Watch for design signals during refactor:

- Arrange section requires more than five or six lines → component has too many responsibilities
- Hard to find a meaningful assertion → interface does not expose the right behavior
- Must mock many collaborators → dependency structure needs redesign

When the arrange section is painful, read [references/dependency-injection.md](references/dependency-injection.md).
When choosing the right double is unclear, read [references/test-doubles.md](references/test-doubles.md).

---

## Test Structure

Use Arrange / Act / Assert. Keep the sections visually distinct.

```
test "payment is declined when card has insufficient funds":
    // Arrange
    gateway = StubPaymentGateway(response: DeclinedResult(code: "INSUFFICIENT_FUNDS"))
    order   = Order(gateway: gateway)

    // Act / Assert
    assertThrows(PaymentDeclined, code: "INSUFFICIENT_FUNDS"):
        order.confirm()
```

One behavior per test. Multiple assertions are acceptable when they describe facets of the same outcome — not when they cover separate behaviors. If the first assertion failing would hide whether a second behavior is correct, split the test.

For naming, fixture setup, assertion quality, Object Mother, Test Data Builder, and test pyramid guidance: read [references/test-patterns.md](references/test-patterns.md).

---

## Dependency Injection

The subject under test must not instantiate its own collaborators that cross a boundary. If it does, doubles cannot be substituted.

**Constructor injection** — default for object-oriented code. Declare dependencies as constructor parameters.

```
// Untestable — creates its own dependency
class OrderService:
    confirm(orderId: string) -> void:
        SmtpClient.send(...)   // hard-coded

// Testable — dependency is substitutable
class OrderService:
    emailSender: EmailSender

    constructor(emailSender: EmailSender):
        this.emailSender = emailSender

    confirm(orderId: string) -> void:
        this.emailSender.send(...)
```

**Argument injection** — default for functional or stateless code. Pass the dependency as a function parameter.

```
function confirmOrder(
    orderId:   string,
    sendEmail: (to: string, body: string) -> void
) -> void:
    sendEmail(lookupEmail(orderId), buildBody(orderId))
```

Inject one level deep. The test wires the subject's direct dependencies only. Those dependencies' own dependencies are their internal concern.

For factory injection, DI containers, and when to prefer each pattern: read [references/dependency-injection.md](references/dependency-injection.md).

---

## Mock Boundary Rule

Mock at the edge of what you own. A boundary is any dependency your code calls but does not define:

- External services: HTTP APIs, payment gateways, identity providers
- Infrastructure: databases, file systems, message queues
- Non-determinism: system clock, random number generation

Do not mock:

- Classes and functions within the same module as the code under test
- Value objects and domain entities
- Pure functions with no I/O

The test: _if I refactor the internal structure without changing observable behavior, would this double break?_ If yes, it is coupled to an implementation detail, not a boundary.

For the full test doubles taxonomy (stub, spy, fake, mock, dummy) and a decision guide: read [references/test-doubles.md](references/test-doubles.md).

---

## Workflow Checklist

Copy and track progress through each cycle:

```
TDD cycle:
- [ ] Write one failing test — confirm it fails for the right reason (Red)
- [ ] Write minimum generalisation to pass all tests (Green)
- [ ] Checkpoint: commit or stage before touching structure
- [ ] Refactor structure only — no new behavior
- [ ] If a missing case is found during refactor: stop, write a test, then resume
- [ ] Repeat for the next behavior
```

---

## Reference Files

Read these on demand — do not load all at once.

| File                                                                     | Read when                                                                                                                                               |
| ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [references/test-doubles.md](references/test-doubles.md)                 | Choosing between stub, spy, fake, mock, or dummy; deciding where to draw the mock boundary                                                              |
| [references/dependency-injection.md](references/dependency-injection.md) | Arrange section is complex; too many collaborators; choosing constructor vs argument vs factory injection                                               |
| [references/test-patterns.md](references/test-patterns.md)               | Naming a test; structuring fixture data; writing assertions that diagnose failures; understanding the test pyramid                                      |
| [assets/test-template.md](assets/test-template.md)                       | Generating a test suite from scratch; need a concrete scaffold showing London vs Chicago school wiring, builder setup, and Arrange/Act/Assert structure |
