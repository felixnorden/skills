---
name: schema
description: Quick-start guide and index for Effect Schema - type-safe parsing, validation, and transformation.
---

# Schema - Quick Start & Index

Type-safe parsing, validation, and transformation with Effect Schema v4.

See related examples in [effect-smol/ai-docs/src/](https://github.com/Effect-TS/effect-smol/tree/main/ai-docs/src/)

> **Important:** In v4, Schema is in `effect/unstable/schema`. APIs may change in minor releases until stabilized. See [migration.md](migration.md) for v3→v4 migration details.

## Table of Contents

- [Quick Start](#quick-start)
- [Topic Index](#topic-index)
- [See Also](#see-also)
- [Migration from v3](#migration-from-v3)

## Quick Start

**Define and parse a schema**

```ts
import { Schema } from "effect/unstable/schema";

const User = Schema.Struct({
  id: Schema.Number,
  name: Schema.String,
  email: Schema.String,
});

type User = typeof User.Type;

// Decode
const result = yield * Schema.decode(User)(unknown);

// Decode unknown (safe)
const parseUser = Schema.decodeUnknown(User);
const result = yield * parseUser(input);
```

**Validate primitives**

```ts
// String validation (v4: check method)
Schema.String.check(Schema.isMinLength(1));
Schema.String.check(Schema.isPattern(/^[a-z]+$/));
Schema.String.check(Schema.isUUID());

// Number validation
Schema.Number.check(Schema.isBetween({ minimum: 5, maximum: 10 }));
Schema.Number.check(Schema.isInt());
```

**Define structs with optional fields**

```ts
const User = Schema.Struct({
  id: Schema.Number,
  name: Schema.String,
  email: Schema.optionalKey(Schema.String),  // can be absent
  phone: Schema.optional(Schema.String),      // undefined allowed
  tags: Schema.mutableKey(Schema.Array(Schema.String)),  // writable
});
```

**Transform between types**

```ts
import { Schema, SchemaGetter } from "effect/unstable/schema";

// Date from string
const DateFromString = Schema.Date.pipe(
  Schema.encodeTo(Schema.String, {
    decode: SchemaGetter.Date(),
    encode: SchemaGetter.String(),
  }),
);
```

**Create branded/opaque types**

```ts
class UserId extends Schema.Opaque<UserId>()(
  Schema.String.check(Schema.isUUID()),
) {}

const id = UserId.make("550e8400-e29b-41d4-a716-446655440000");
```

## Topic Index

| Topic | File |
|-------|------|
| Primitives, Literals, Strings, Numbers, Dates, Template Literals | [schema-elementary.md](schema-elementary.md) |
| Structs, Tuples, Arrays, Records, Unions | [schema-composite.md](schema-composite.md) |
| Recursive schemas, suspend | [schema-recursive.md](schema-recursive.md) |
| declare, declareConstructor | [schema-custom-types.md](schema-custom-types.md) |
| Filters, refinements, branding | [schema-validation.md](schema-validation.md) |
| makeUnsafe, defaults | [schema-constructors.md](schema-constructors.md) |
| decodeTo/encodeTo, SchemaTransformation | [schema-transformations.md](schema-transformations.md) |
| Schema.flip | [schema-flipping.md](schema-flipping.md) |
| Opaque, Class, TaggedClass, ErrorClass, TaggedErrorClass | [schema-classes.md](schema-classes.md) |
| JSON, FormData, URLSearchParams, XML codecs | [schema-serialization.md](schema-serialization.md) |
| JSON Schema, Arbitraries, Equivalence, Optics, Differ | [schema-tooling.md](schema-tooling.md) |
| Portable representation, AST | [schema-representation.md](schema-representation.md) |
| Formatters, hooks, i18n | [schema-error-handling.md](schema-error-handling.md) |
| catchDecoding, fallbacks | [schema-middlewares.md](schema-middlewares.md) |
| Type model, hierarchy | [schema-advanced.md](schema-advanced.md) |
| TanStack Form, Elysia | [schema-integrations.md](schema-integrations.md) |

## See Also

- [error-handling.md](error-handling.md) - Schema.TaggedErrorClass for error definitions
- [core-patterns.md](core-patterns.md) - Effect+Schema patterns
- [migration.md](migration.md) - v3→v4 API migration

## Migration from v3

### Import Changes

| v3               | v4                                          |
| ---------------- | ------------------------------------------- |
| `@effect/schema` | `effect/unstable/schema` or `effect/schema` |

### Refinements → Checks

| v3                                   | v4                                                                   |
| ------------------------------------ | -------------------------------------------------------------------- |
| `Schema.pipe(Schema.minLength(5))`   | `Schema.String.check(Schema.isMinLength(5))`                         |
| `Schema.pipe(Schema.maxLength(5))`   | `Schema.String.check(Schema.isMaxLength(5))`                         |
| `Schema.pipe(Schema.pattern(/.../))` | `Schema.String.check(Schema.isPattern(/.../))`                       |
| `Schema.pipe(Schema.positive())`     | `Schema.Number.check(Schema.isPositive())`                           |
| `Schema.pipe(Schema.int())`          | `Schema.Number.check(Schema.isInt())`                                |
| `Schema.pipe(Schema.between(1, 10))` | `Schema.Number.check(Schema.isBetween({ minimum: 1, maximum: 10 }))` |

### Transformations

| v3                                               | v4                                            |
| ------------------------------------------------ | --------------------------------------------- |
| `Schema.transform(from, to, { decode, encode })` | `Schema.decodeTo(target, { decode, encode })` |
| `Schema.parseJson(schema)`                       | Use transformation with JSON parsing          |

### Struct Fields

| v3                              | v4                                                                                        |
| ------------------------------- | ----------------------------------------------------------------------------------------- |
| `Schema.optional(field)`        | `Schema.optionalKey(field)` (exact optional) or `Schema.optional(field)` (with undefined) |
| `Schema.mutable(field)`         | `Schema.mutableKey(field)`                                                                |
| `Schema.propertySignature`      | Removed - use `Schema.optional`                                                           |
| `Schema.withConstructorDefault` | `Schema.withDecodingDefault`                                                              |

### Other Changes

| v3                         | v4                                         |
| -------------------------- | ------------------------------------------ |
| `Schema.partial(struct)`   | Use `Schema.optional` on fields            |
| `Schema.required(partial)` | Use field spreading                        |
| `Schema.brand`             | Use `Schema.Opaque` for distinct types     |
| `Schema.message`           | Use `annotateKey` or custom error handling |
| `Schema.Class`             | `Schema.Opaque`                            |
