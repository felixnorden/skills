# Test Template

Language-agnostic pseudo-code scaffold for a well-formed test suite. Two variants are shown: London school (doubles at boundaries) and Chicago school (real collaborators, double only external infrastructure). Choose based on the guidance in SKILL.md.

---

## London School — Double at Module Boundaries

Preferred for new code. Each collaborator that crosses a module or infrastructure boundary is replaced with a double. Only the subject under test runs real code.

```
// --- Doubles ---

class FakeOrderRepository implements OrderRepository:
    store: Map<string, Order> = {}

    save(order: Order) -> void:
        store[order.id] = order

    findById(id: string) -> Order | null:
        return store[id] ?? null

class SpyEmailSender implements EmailSender:
    calls: List<{to, subject}> = []

    send(to: string, subject: string, body: string) -> void:
        calls.append({to, subject})

class StubPricingService implements PricingService:
    constructor(private basePrice: decimal) {}

    getPrice(productId: string) -> decimal:
        return basePrice


// --- Subject wiring helper ---

function makeOrderService(overrides = {}) -> {service, repo, emailSender}:
    repo        = overrides.repo        ?? FakeOrderRepository()
    emailSender = overrides.emailSender ?? SpyEmailSender()
    pricing     = overrides.pricing     ?? StubPricingService(basePrice: 10.00)

    service = OrderService(
        repo:        repo,
        emailSender: emailSender,
        pricing:     pricing
    )
    return {service, repo, emailSender}


// --- Tests ---

test "confirmed order is persisted":
    // Arrange
    {service, repo} = makeOrderService()

    // Act
    service.confirm(orderId: "order-1")

    // Assert
    saved = repo.findById("order-1")
    assert saved != null
    assert saved.status == Status.CONFIRMED


test "confirmation email is sent to customer on confirm":
    // Arrange
    {service, emailSender} = makeOrderService()

    // Act
    service.confirm(orderId: "order-1")

    // Assert
    assert emailSender.calls.length == 1
    assert emailSender.calls[0].to == "customer@example.com"


test "confirm throws when order is already cancelled":
    // Arrange
    cancelledOrder = OrderBuilder().withStatus(Status.CANCELLED).build()
    repo = FakeOrderRepository()
    repo.save(cancelledOrder)
    {service} = makeOrderService(overrides: {repo})

    // Act / Assert
    assertThrows(InvalidStateError):
        service.confirm(orderId: cancelledOrder.id)
```

**What to observe:**

- Each double replaces exactly one boundary dependency
- `makeOrderService` keeps arrange sections short; only the field relevant to the test is overridden
- Each test exercises one behavior; assertions are scoped to that behavior
- `SpyEmailSender` records calls for after-the-fact assertion; no upfront expectation needed

---

## Chicago School — Real Collaborators, Double Only Infrastructure

Preferred when retrofitting tests onto existing code with stable internal structure, or when the interactions between real collaborators are themselves the thing being verified.

```
// --- Only external infrastructure is doubled ---

class InMemoryDatabase implements Database:
    tables: Map<string, List<Row>> = {}

    query(sql: string, params: List) -> List<Row>:
        // simplified in-memory SQL execution
        ...

    execute(sql: string, params: List) -> void:
        ...

class FakeEmailProvider implements EmailProvider:
    sent: List<EmailMessage> = []

    deliver(message: EmailMessage) -> void:
        sent.append(message)


// --- Real internal collaborators are wired ---

function makeSystem(overrides = {}) -> {orderService, emailService, db, emailProvider}:
    db            = overrides.db            ?? InMemoryDatabase()
    emailProvider = overrides.emailProvider ?? FakeEmailProvider()

    // Real internal components — not doubled
    orderRepo     = SqlOrderRepository(db: db)
    emailService  = EmailService(provider: emailProvider)
    pricing       = PricingService(db: db)

    orderService  = OrderService(
        repo:         orderRepo,
        emailService: emailService,
        pricing:      pricing
    )
    return {orderService, emailService, db, emailProvider}


// --- Tests verify observable state, not interaction details ---

test "confirmed order is persisted and customer notified":
    // Arrange
    {orderService, db, emailProvider} = makeSystem()
    db.seed("orders", [Order(id: "order-1", status: Status.PENDING, customerEmail: "a@b.com")])

    // Act
    orderService.confirm(orderId: "order-1")

    // Assert — state-based, not interaction-based
    row = db.query("SELECT status FROM orders WHERE id = ?", ["order-1"])[0]
    assert row.status == "CONFIRMED"
    assert emailProvider.sent.any(m -> m.to == "a@b.com")


test "total includes tax for EU orders":
    // Arrange
    {orderService, db} = makeSystem()
    db.seed("products", [Product(id: "p-1", basePrice: 100.00)])
    db.seed("orders", [Order(id: "order-1", productId: "p-1", region: "EU")])

    // Act
    total = orderService.calculateTotal(orderId: "order-1")

    // Assert
    assert total == 120.00
```

**What to observe:**

- Only `Database` and `EmailProvider` — the external infrastructure — are doubled
- `OrderRepository`, `EmailService`, `PricingService` are real; their interactions are part of what is being tested
- Assertions are on persisted state and delivered messages, not on which internal methods were called
- Arrange seeds data into the fake database rather than constructing object graphs directly

---

## Builder Reference

Both variants benefit from a builder for constructing domain objects with varying attributes.

```
class OrderBuilder:
    _id:     string  = "order-1"
    _status: Status  = Status.PENDING
    _region: Region  = Region.DOMESTIC
    _items:  List    = [Item(productId: "p-1", qty: 1)]

    withId(id: string)         -> OrderBuilder: _id = id;         return this
    withStatus(s: Status)      -> OrderBuilder: _status = s;      return this
    withRegion(r: Region)      -> OrderBuilder: _region = r;      return this
    withItems(items: List)     -> OrderBuilder: _items = items;   return this
    build()                    -> Order:
        return Order(id: _id, status: _status, region: _region, items: _items)
```

Always provide defaults for every field. A test sets only the fields that are meaningful to its behavior — all others are noise suppressed by the builder's defaults.
