# Test Doubles

Test doubles are controlled replacements for real dependencies in tests. The word "mock" is colloquially used for all of them, but the types are meaningfully distinct — using the wrong one produces tests that are either too brittle or too blind.

Taxonomy from Meszaros, _xUnit Test Patterns_.

---

## The Five Types

### Dummy

Satisfies a required parameter signature but is never actually invoked in the code path under test.

```
interface Logger:
    log(message: string) -> void

class DummyLogger implements Logger:
    log(message: string) -> void:
        // no-op

order = Order(id: "123", logger: DummyLogger())
// Logger is structurally required but never called for this behavior
assert order.total() == 42.00
```

Use when a dependency is required by the constructor or function signature but is not exercised by the behavior you are testing.

**Anti-pattern**: Using a dummy when the dependency _is_ exercised. Calls silently disappear, hiding behavior from the test.

---

### Stub

Returns a pre-configured response to a specific call. Does not verify whether or how often it was called.

```
interface PricingService:
    getPrice(productId: string) -> decimal

class StubPricingService implements PricingService:
    getPrice(productId: string) -> decimal:
        return 9.99

checkout = Checkout(pricing: StubPricingService())
total = checkout.calculate(cartWith(productId: "ABC"))
assert total == 9.99
```

Use when the test needs a dependency to return a specific value to exercise a code path, and you do not care whether or how often it was called.

**Anti-pattern**: Returning the same value for all inputs when the system under test uses the input to branch. The stub then hides a real contract your code depends on.

---

### Fake

A working lightweight implementation, not suitable for production. Has real behavior — it processes inputs and maintains state — just simplified.

```
interface UserRepository:
    save(user: User) -> void
    findById(id: string) -> User | null

class InMemoryUserRepository implements UserRepository:
    store: Map<string, User> = {}

    save(user: User) -> void:
        store[user.id] = user

    findById(id: string) -> User | null:
        return store[id] ?? null

repo = InMemoryUserRepository()
service = UserService(repo)
service.register(User(id: "1", name: "Alice"))
found = service.findById("1")
assert found.name == "Alice"
```

Use when behavior of the dependency matters across multiple interactions — state needs to persist between calls within a test or across a suite. Prefer fakes over chains of stubs when a test involves multiple reads and writes through the same dependency.

**Anti-pattern**: A fake that replicates production logic rather than simplifying it. If it can fail in the same ways as the real implementation, you have a second production system to maintain.

---

### Spy

Records calls made to it for assertion after the fact. Can wrap a real or stub implementation.

```
interface EmailSender:
    send(to: string, subject: string, body: string) -> void

class SpyEmailSender implements EmailSender:
    calls: List<{to, subject, body}> = []

    send(to: string, subject: string, body: string) -> void:
        calls.append({to, subject, body})

sender = SpyEmailSender()
notifications = NotificationService(emailSender: sender)
notifications.notifyShipped(orderId: "99")

assert sender.calls.length == 1
assert sender.calls[0].to == "customer@example.com"
```

Use when you want to verify a side effect occurred — something was sent, published, logged — without caring about how the dependency processed it internally. The observable outcome is the fact of the call.

**Anti-pattern**: Asserting on every argument of every call regardless of whether it is contractually meaningful. This locks the test to implementation specifics. Assert on what the behavior guarantees, not the full call signature.

---

### Mock

Pre-programmed with expectations verified at end of test. Combines stub (return values) with spy (call verification) but defines expectations upfront rather than asserting after.

```
mock = Mock(PaymentGateway)
mock.expect(charge(amount: 49.99, currency: "EUR")).returns(SuccessResult).once()

order = Order(gateway: mock)
order.confirm()

mock.verify() // fails if charge was not called exactly as specified
```

Use when the interaction with the dependency _is_ the behavior under test — not just a side effect, but the core observable outcome. Payment gateways called with correct parameters, events published to a message broker, audit logs written with specific content.

**Anti-pattern — over-mocking**: Mocking every collaborator regardless of whether the interaction is the behavior under test. Over-mocked tests verify _how_ code works, not _what_ it does. They break on every internal refactor even when behavior is unchanged.

**Anti-pattern — mocking internals**: Only mock at the boundary of what you own. Never mock a collaborator that lives inside the same module as the code under test. If you need to, the module boundary is in the wrong place.

---

## Decision Guide

```
Does the dependency need to return a value the code under test consumes?
  └─ Does state need to persist across multiple calls in the same test?
       Yes → Fake
       No  → Stub

Is the interaction with the dependency itself the observable outcome?
  └─ Does the exact call sequence or count matter to the behavior?
       Yes → Mock
       No  → Spy

Is the dependency required by the signature but never invoked?
       Yes → Dummy
```

---

## Where to Draw the Mock Boundary

Mock at the edge of what you own. A boundary is any dependency your code calls but does not define:

- External services — HTTP APIs, payment gateways, identity providers
- Infrastructure — databases, file systems, caches, message queues
- Non-determinism — system clock, random number generation, environment variables
- Modules you do not control in this test

Do not mock:

- Classes and functions within the same module as the code under test
- Value objects and domain entities
- Pure functions

The test for "should I mock this?" is: _if I refactor the internal structure without changing observable behavior, would this double break?_ If yes, it is coupled to an implementation detail, not a boundary.
