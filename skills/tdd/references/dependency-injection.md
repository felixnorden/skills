# Dependency Injection

Dependency injection (DI) is the practice of supplying a component's dependencies from outside rather than having the component create or locate them itself. It is the primary mechanism that makes code testable without resorting to global state, monkey-patching, or mocking internals.

The core rule: a unit under test should never instantiate its own collaborators that cross a boundary. If it does, you cannot substitute a double in tests.

---

## Patterns

### Constructor Injection

Dependencies are declared as constructor parameters and stored for use across all methods. This is the default pattern in object-oriented code.

```
// Without DI — untestable, EmailSender is hard-coded
class OrderService:
    confirmOrder(orderId: string) -> void:
        sender = new SmtpEmailSender()   // creates its own dependency
        sender.send(...)

// With constructor injection — EmailSender is a substitutable parameter
class OrderService:
    emailSender: EmailSender

    constructor(emailSender: EmailSender):
        this.emailSender = emailSender

    confirmOrder(orderId: string) -> void:
        this.emailSender.send(...)

// In production
service = OrderService(emailSender: SmtpEmailSender())

// In tests
service = OrderService(emailSender: SpyEmailSender())
```

Use constructor injection when:

- The dependency is required for the object to function at all
- The same dependency is used across multiple methods
- You want the object's dependencies to be explicit and visible at instantiation

**Anti-pattern**: Injecting every possible collaborator regardless of whether it crosses a boundary. Injecting a pure utility class that has no I/O and no external state adds noise without testability benefit. Only inject what needs to be substitutable.

---

### Functional (Argument) Injection

Dependencies are passed as parameters to the function that needs them. This is the natural pattern in functional code and for stateless operations.

```
// Without DI
function sendWelcomeEmail(userId: string) -> void:
    user = DatabaseClient.findById(userId)   // global, untestable
    SmtpClient.send(user.email, ...)

// With argument injection
function sendWelcomeEmail(
    userId:     string,
    findUser:   (id: string) -> User,
    sendEmail:  (to: string, subject: string, body: string) -> void
) -> void:
    user = findUser(userId)
    sendEmail(user.email, ...)

// In production
sendWelcomeEmail(
    userId:    "123",
    findUser:  db.findById,
    sendEmail: smtp.send
)

// In tests
calls = []
sendWelcomeEmail(
    userId:    "123",
    findUser:  (_) -> User(email: "a@b.com"),
    sendEmail: (to, subj, body) -> calls.append({to, subj, body})
)
assert calls[0].to == "a@b.com"
```

Use argument injection when:

- The function is stateless and the dependency is only needed for that call
- You are working in a functional style where objects with persistent state are uncommon
- The dependency varies per call rather than per instance

**Anti-pattern**: Passing so many function arguments that the signature becomes a configuration object. When a function needs more than two or three injected dependencies, it is doing too much and should be decomposed.

---

### Factory Injection

A factory — a function or object that creates instances — is injected rather than the instance itself. Used when a new instance must be created per operation rather than shared.

```
interface ConnectionFactory:
    create() -> DatabaseConnection

class ReportService:
    connectionFactory: ConnectionFactory

    constructor(connectionFactory: ConnectionFactory):
        this.connectionFactory = connectionFactory

    generateReport(params: ReportParams) -> Report:
        conn = this.connectionFactory.create()
        // conn is scoped to this operation
        ...

// In tests
class FakeConnectionFactory implements ConnectionFactory:
    create() -> DatabaseConnection:
        return InMemoryConnection()
```

Use factory injection when the dependency has a lifecycle tied to an individual operation, not to the service itself — open/close semantics, request-scoped resources, or objects that carry operation-specific context.

---

### DI Containers

A DI container is a runtime registry that resolves and wires dependencies automatically based on configuration. Useful in large applications where manually wiring the full object graph at startup becomes unwieldy.

```
// Registration
container.register(EmailSender, SmtpEmailSender)
container.register(OrderRepository, PostgresOrderRepository)
container.register(OrderService, OrderService)  // container infers its deps

// Resolution
service = container.resolve(OrderService)
// OrderService is constructed with its declared dependencies automatically
```

Use a DI container when:

- The application has a large number of services with deep dependency graphs
- You want lifecycle management (singleton, transient, scoped) handled centrally

Do not reach for a container in tests. Tests should wire their subjects manually — this keeps the test's intent explicit and avoids hidden wiring that obscures what is being exercised. The container is a production convenience, not a test tool.

**Anti-pattern**: Using a DI container in unit or integration tests to resolve the subject under test. If a test relies on the container, it is testing the container's wiring as much as the behavior, and failing tests become harder to diagnose.

---

## Choosing a Pattern

```
Is the dependency used across multiple methods on the same object?
  Yes → Constructor injection

Is the dependency only needed for a single stateless function call?
  Yes → Argument injection

Does the dependency need to be created fresh per operation?
  Yes → Factory injection

Is the object graph large enough that manual wiring is unmanageable?
  Yes → DI container (production only; wire manually in tests)
```

---

## Depth of Injection

Inject one level deep. The subject under test receives its direct dependencies. Those dependencies may themselves have dependencies, but the test does not need to know about them — it only wires what the subject directly declares.

```
// OrderService depends on PaymentGateway and EmailSender
// PaymentGateway depends on HttpClient — the test does not see HttpClient

service = OrderService(
    gateway: FakePaymentGateway(),   // boundary double
    emailSender: SpyEmailSender()    // boundary double
)
// HttpClient is FakePaymentGateway's internal concern
```

If a test needs to wire three or more levels of the dependency tree to exercise a single behavior, the abstraction boundaries between those levels are probably not earning their keep.
