# Test Patterns

Patterns for structuring, naming, and asserting in tests. The goal throughout is that each test reads as an unambiguous specification of a behavior, fails with a message that diagnoses the problem without requiring a debugger, and survives refactors that leave the behavior intact.

---

## Structure: Arrange / Act / Assert

Every test has three phases. Keep them visually distinct.

```
test "order total includes tax when region is taxable":
    // Arrange — set up subject and inputs
    repo    = InMemoryProductRepository()
    pricing = StubPricingService(basePrice: 100.00)
    order   = Order(repo: repo, pricing: pricing, region: Region.EU)

    // Act — invoke exactly one behavior
    total = order.calculate()

    // Assert — verify the observable outcome
    assert total == 120.00
```

Each section should be present and identifiable. If the arrange section grows beyond five or six lines, move fixture construction into a builder (see below). If the assert section checks more than one distinct concern, split the test.

**Anti-pattern — multiple acts**: Two calls to the system under test in a single test. When the test fails, you cannot tell which act caused it.

**Anti-pattern — assertion-free tests**: A test that exercises code but asserts nothing. It can only catch exceptions — it is blind to wrong output.

---

## Naming

A test name is a specification statement. It should describe the behavior, the condition, and the expected outcome — not the method being called.

Prefer the form: `[subject] [does what] when [condition]`

Or equivalently: `given [context], [subject] [does what]`

```
// Poor — names the method, not the behavior
test "calculateTotal"
test "getUser returns user"
test "processPayment test"

// Good — specifies behavior under a condition
test "order total includes tax when region is EU"
test "user lookup returns null when id does not exist"
test "payment is declined when card has insufficient funds"
```

The test name is the first thing read when a test fails. It should make the expected behavior obvious without opening the test body.

**Anti-pattern**: Naming tests after implementation units (class names, method names). These names survive refactors that change the behavior they were meant to specify.

---

## One Behavior Per Test

Each test specifies one behavioral claim. Multiple assertions are acceptable when they describe facets of the same observable outcome — but each assertion should be about the same behavior, not about separate behaviors.

```
// Acceptable — both assertions describe the same outcome (confirmed order state)
test "order is marked confirmed and assigned a reference when payment succeeds":
    order = Order(gateway: SucceedingPaymentGateway())
    order.confirm()
    assert order.status == Status.CONFIRMED
    assert order.reference != null

// Problematic — two separate behaviors in one test
test "order confirmation and email":
    order = Order(gateway: SucceedingPaymentGateway(), emailSender: SpyEmailSender())
    order.confirm()
    assert order.status == Status.CONFIRMED       // behavior 1
    assert emailSender.calls.length == 1           // behavior 2 — split this out
```

When two unrelated behaviors are tested together, a failure on the first assertion hides whether the second behavior was correct.

---

## Assertion Quality

An assertion should tell you what the actual value was, what was expected, and in which context — without requiring a debugger.

```
// Weak — tells you a boolean was false; nothing else
assert order.isValid()

// Strong — tells you the field, actual value, and expectation
assert order.status == Status.CONFIRMED,
    message: "expected CONFIRMED after payment but got {order.status}"
```

For collection assertions, assert on specific elements rather than the whole structure unless the entire structure is the contract:

```
// Fragile — breaks if unrelated elements are added to the list
assert notifications == [Notification(type: "SHIPPED", userId: "1")]

// Resilient — asserts on what the behavior guarantees
assert notifications.any(n -> n.type == "SHIPPED" and n.userId == "1")
```

**Anti-pattern**: Catching exceptions in the test body to inspect them without re-throwing. If the assertion fails, the test passes silently.

```
// Wrong
try:
    order.confirm()
catch PaymentError as e:
    assert e.code == "INSUFFICIENT_FUNDS"
// If confirm() does NOT throw, the test passes — the behavior is untested

// Correct — use your framework's assert-throws primitive
assertThrows(PaymentError, code: "INSUFFICIENT_FUNDS"):
    order.confirm()
```

---

## Fixture Patterns

Complex objects required as inputs should be constructed through patterns that keep test bodies readable and resilient to schema changes.

### Object Mother

A factory that produces canonical, pre-configured instances for a domain concept. Good for objects whose exact values rarely matter to the test.

```
class OrderMother:
    static standard() -> Order:
        return Order(
            id:       "order-1",
            items:    [Item(productId: "p-1", quantity: 1)],
            region:   Region.DOMESTIC,
            status:   Status.PENDING
        )

    static withRegion(region: Region) -> Order:
        return Order(
            id:       "order-1",
            items:    [Item(productId: "p-1", quantity: 1)],
            region:   region,
            status:   Status.PENDING
        )

// Usage
test "tax is applied for EU orders":
    order = OrderMother.withRegion(Region.EU)
    ...
```

Use Object Mother when tests share a canonical form and only vary on one or two attributes.

**Anti-pattern**: An Object Mother with dozens of methods for every possible combination. Use a builder instead.

---

### Test Data Builder

A fluent builder that constructs objects incrementally. Each call returns the builder for chaining. Use when tests vary on many combinations of attributes.

```
class OrderBuilder:
    _id:     string  = "order-1"
    _region: Region  = Region.DOMESTIC
    _status: Status  = Status.PENDING
    _items:  List    = [Item(productId: "p-1", quantity: 1)]

    withId(id: string) -> OrderBuilder:
        _id = id; return this

    withRegion(region: Region) -> OrderBuilder:
        _region = region; return this

    withStatus(status: Status) -> OrderBuilder:
        _status = status; return this

    build() -> Order:
        return Order(id: _id, region: _region, status: _status, items: _items)

// Usage
test "cancelled orders cannot be confirmed":
    order = OrderBuilder().withStatus(Status.CANCELLED).build()
    assertThrows(InvalidStateError):
        order.confirm()
```

The builder always has defaults for every field. A test only specifies the fields that are meaningful to its behavior — everything else is noise suppressed by the default.

---

## Test Pyramid

Not all tests operate at the same level. The pyramid describes the recommended distribution: many fast, narrowly-focused tests at the base; fewer, broader tests toward the top.

```
         [ End-to-End ]          few — verify system behavior from the outside
        [  Integration  ]        moderate — verify collaboration across real components
       [    Unit Tests    ]       many — verify behavior of a single component in isolation
```

**Unit tests** — one component, collaborators doubled at boundaries. Fast, deterministic, run on every change. Cover the majority of behavioral cases including edge cases and error paths.

**Integration tests** — two or more real components wired together, typically including one real infrastructure dependency (a database, a message broker). Verify that components collaborate correctly. Slower; run before merge or deploy.

**End-to-end tests** — the full system exercised from its outermost interface (HTTP endpoint, CLI, UI). Verify critical paths work from the user's perspective. Slow, potentially flaky; kept minimal and focused on the behaviors that represent the most risk if broken.

The London school (default here for unit tests) draws the unit boundary at a single class or function, doubling collaborators at module edges. The Chicago school draws the unit boundary at a cluster of related objects, wiring real collaborators and only doubling external infrastructure. Both are valid; the choice determines where your doubles live, not whether you write tests.

**Anti-pattern — inverting the pyramid**: More end-to-end tests than unit tests. End-to-end tests are slow, brittle, and give poor failure diagnostics. Relying on them means behavioral regressions are caught late and are expensive to diagnose.

**Anti-pattern — the ice cream cone**: A large suite of manual or UI tests at the top, almost no automated tests below. Common in codebases where testing was retrofitted rather than practiced from the start.
