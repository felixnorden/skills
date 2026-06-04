---
name: data-type-match
description: Comprehensive reference for Effect Match module - type-safe pattern matching. Use when working with discriminated unions, type guards, or replacing if/else/switch with exhaustive pattern matching.
---

# Match - Pattern Matching

> **Reference for Effect v4.0.0-beta.76.** APIs may change before the final v4 release.

Type-safe, exhaustive pattern matching for TypeScript. Replaces fragile `if/else` chains and `switch` statements with a composable, data-last API that narrows types at every step.

## Quickstart

Match on a discriminated union exhaustively:

```ts
import { Match } from "effect";

interface User { readonly _tag: "User"; readonly name: string }
interface Admin { readonly _tag: "Admin"; readonly name: string }
interface Guest { readonly _tag: "Guest" }

type Person = User | Admin | Guest;

const describe = Match.type<Person>().pipe(
  Match.tag("User", (u) => `User: ${u.name}`),
  Match.tag("Admin", (a) => `Admin: ${a.name}`),
  Match.tag("Guest", () => "Guest"),
  Match.exhaustive,
);

describe({ _tag: "User", name: "Alice" }); // "User: Alice"
```

Match on a plain value with a fallback:

```ts
const classify = Match.value(42).pipe(
  Match.when(Match.number, (n) => `number: ${n}`),
  Match.when("hello", () => "greeting"),
  Match.orElse(() => "something else"),
);
```

## Core API

### value / type

Start a matcher from a concrete value or a type:

```ts
// Value matcher — the input is already known
Match.value(input).pipe(...);

// Type matcher — the input is provided later
const matcher = Match.type<Shape>().pipe(...);
matcher(shapeInstance);
```

### when / whenOr / whenAnd

Add pattern conditions:

```ts
Match.value(input).pipe(
  // Exact match or predicate
  Match.when(42, (n) => "forty-two"),
  Match.when((n) => n > 0, (n) => "positive"),

  // Match any of several patterns (OR)
  Match.whenOr(1, 2, 3, (n) => "small number"),

  // Match only if ALL predicates pass (AND)
  Match.whenAnd(
    Match.number,
    (n) => n > 10,
    (n) => n < 20,
    (n) => "between 10 and 20",
  ),
);
```

### tag / tags / tagStartsWith

Match on discriminated-union `_tag` fields:

```ts
Match.type<Shape>().pipe(
  Match.tag("Circle", (c) => Math.PI * c.radius ** 2),
  Match.tag("Rect", (r) => r.width * r.height),
  Match.exhaustive,
);
```

Match multiple tags at once:

```ts
Match.type<Shape>().pipe(
  Match.tags("Circle", "Rect", (s) => "has area"),
  Match.tag("Point", () => "no area"),
  Match.exhaustive,
);
```

Match tags by prefix:

```ts
Match.type<Event>().pipe(
  Match.tagStartsWith("User", (e) => "user event"),
  Match.orElse(() => "other"),
);
```

### orElse / orElseAbsurd

Provide fallbacks for unmatched cases:

```ts
Match.value(input).pipe(
  Match.when(42, () => "found"),
  Match.orElse(() => "not found"), // default fallback
);
```

Use `orElseAbsurd` when the compiler can prove all cases are handled (for type narrowing):

```ts
Match.type<A | B>().pipe(
  Match.when(Match.is(A), (a) => "A"),
  Match.when(Match.is(B), (b) => "B"),
  Match.orElseAbsurd, // compiler proves exhaustiveness
);
```

### exhaustive / result / option

Complete a matcher and extract the result:

```ts
// Exhaustive — throws at runtime if any case is unhandled
Match.type<Shape>().pipe(
  Match.tag("Circle", (c) => c.radius),
  Match.exhaustive,
);

// result — returns Result<Output, NoSuchElementError>
Match.value(input).pipe(
  Match.when(42, () => "found"),
  Match.result, // Result<string, NoSuchElementError>
);

// option — returns Option<Output>
Match.value(input).pipe(
  Match.when(42, () => "found"),
  Match.option, // Option<string>
);
```

## Extended API Reference

### Tag-based constructors

| API | Description |
| --- | --- |
| `Match.valueTags` | // Create a matcher from a value with a `_tag` field directly |
| `Match.typeTags` | // Create a type matcher for tagged unions without calling `.pipe()` |
| `Match.withReturnType<Ret>()` | // Constrain the return type of all branches |

### Custom discriminators

| API | Description |
| --- | --- |
| `Match.discriminator("key")` | // Match on a custom discriminant property (not `_tag`) |
| `Match.discriminatorStartsWith("key")` | // Match custom discriminant by prefix |
| `Match.discriminators("key", ["a", "b"])` | // Match multiple custom discriminant values |
| `Match.discriminatorsExhaustive("key")` | // Exhaustive custom discriminant matching |

### Refinements and predicates

| API | Description |
| --- | --- |
| `Match.not(pattern)` | // Negate a pattern (match when it does NOT match) |
| `Match.nonEmptyString` | // Refinement: string with length > 0 |
| `Match.is(Constructor)` | // Match values created by a specific class/constructor |

### Type refinements

| API | Description |
| --- | --- |
| `Match.string` | // Refinement: value is `string` |
| `Match.number` | // Refinement: value is `number` |
| `Match.boolean` | // Refinement: value is `boolean` |
| `Match.bigint` | // Refinement: value is `bigint` |
| `Match.symbol` | // Refinement: value is `symbol` |
| `Match.date` | // Refinement: value is `Date` |
| `Match.record` | // Refinement: value is a plain object |
| `Match.instanceOf(Class)` | // Refinement: value is instance of class |
| `Match.instanceOfUnsafe(Class)` | // instanceOf without type inference |
| `Match.any` | // Matches any value (useful in combinators) |
| `Match.defined` | // Refinement: value is not null or undefined |

## Examples

### Replacing switch with exhaustive matching

```ts
import { Match } from "effect";

type HttpResponse =
  | { readonly _tag: "Ok"; readonly body: string }
  | { readonly _tag: "NotFound"; readonly path: string }
  | { readonly _tag: "Error"; readonly status: number };

const getMessage = Match.type<HttpResponse>().pipe(
  Match.tag("Ok", (r) => `Success: ${r.body}`),
  Match.tag("NotFound", (r) => `Missing: ${r.path}`),
  Match.tag("Error", (r) => `Failed with ${r.status}`),
  Match.exhaustive,
);
```

### Value matching with fallback

```ts
const grade = Match.value(score).pipe(
  Match.when((n) => n >= 90, () => "A"),
  Match.when((n) => n >= 80, () => "B"),
  Match.when((n) => n >= 70, () => "C"),
  Match.when((n) => n >= 60, () => "D"),
  Match.orElse(() => "F"),
);
```

### Using type refinements

```ts
const process = Match.value(unknownValue).pipe(
  Match.when(Match.string, (s) => s.toUpperCase()),
  Match.when(Match.number, (n) => n * 2),
  Match.when(Match.boolean, (b) => (b ? "yes" : "no")),
  Match.orElse(() => "unknown"),
);
```

### Combining with Result

```ts
const parse = Match.value(input).pipe(
  Match.when(Match.number, (n) => Result.succeed(n)),
  Match.when(Match.string, (s) => {
    const parsed = Number(s);
    return isNaN(parsed) ? Result.fail("not a number") : Result.succeed(parsed);
  }),
  Match.result, // Result<number, NoSuchElementError>
);
```

## See Also

- [data-types.md](data-types.md) - Overview of all Effect data types
