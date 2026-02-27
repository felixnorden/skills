# Schema - Validation & Serialization

Type-safe parsing, validation, and transformation with Effect Schema v4.

> **Important:** In v4, Schema is in `effect/unstable/schema`. APIs may change in minor releases until stabilized. See [migration.md](migration.md) for v3→v4 migration details.

## Installation & Import

```ts
// v4: Schema is in the unstable namespace
import { Schema } from "effect/unstable/schema";

// Or use the bundled version
import { Schema } from "effect/schema";
```

## Basic Usage

**Define schema**
```ts
import { Schema } from "effect/unstable/schema";

const User = Schema.Struct({
  id: Schema.Number,
  name: Schema.String,
  email: Schema.String
});
```

**Parse (decode)**
```ts
const result = yield* Schema.decode(User)(unknown);
// Effect<User, SchemaError>
```

**Encode**
```ts
const encoded = yield* Schema.encode(User)(user);
```

**Decode unknown (safe)**
```ts
const parseUser = Schema.decodeUnknown(User);
const result = yield* parseUser(input);
```

## Primitive Types

```ts
Schema.String;
Schema.Number;  
Schema.Boolean;
Schema.BigInt;
Schema.Date;
Schema.Null;
Schema.Undefined;
Schema.Unknown;
Schema.Never;
```

## String Validation (v4: `check` method)

In v4, use the `check` method with filter factories:

```ts
import { Schema } from "effect/unstable/schema";

Schema.String.check(Schema.isMaxLength(5));
Schema.String.check(Schema.isMinLength(5));
Schema.String.check(Schema.isLengthBetween(5, 10));
Schema.String.check(Schema.isPattern(/^[a-z]+$/));
Schema.String.check(Schema.isStartsWith("aaa"));
Schema.String.check(Schema.isEndsWith("zzz"));
Schema.String.check(Schema.isIncludes("---"));
Schema.String.check(Schema.isUppercased());
Schema.String.check(Schema.isLowercased());

// Built-in format checks
Schema.String.check(Schema.isUUID());
Schema.String.check(Schema.isBase64());
Schema.String.check(Schema.isBase64Url());
```

**String transformations**
```ts
import { Schema, SchemaTransformation } from "effect/unstable/schema";

Schema.String.decode(SchemaTransformation.trim());
Schema.String.decode(SchemaTransformation.toLowerCase());
Schema.String.decode(SchemaTransformation.toUpperCase());
```

## Number Validation (v4: `check` method)

```ts
Schema.Number.check(Schema.isBetween({ minimum: 5, maximum: 10 }));
Schema.Number.check(Schema.isGreaterThan(5));
Schema.Number.check(Schema.isGreaterThanOrEqualTo(5));
Schema.Number.check(Schema.isLessThan(5));
Schema.Number.check(Schema.isLessThanOrEqualTo(5));
Schema.Number.check(Schema.isMultipleOf(5));

// Integers
Schema.Number.check(Schema.isInt());
Schema.Number.check(Schema.isInt32());
```

## Structs

**Basic struct**
```ts
const Person = Schema.Struct({
  name: Schema.String,
  age: Schema.Number
});
```

**Optional fields (v4: `optionalKey` vs `optional`)**

```ts
const User = Schema.Struct({
  id: Schema.Number,
  name: Schema.String,
  // Optional key (can be absent)
  email: Schema.optionalKey(Schema.String),
  // Optional with undefined
  phone: Schema.optional(Schema.String),
  // Mutable key
  tags: Schema.mutableKey(Schema.Array(Schema.String))
});

// Type: { readonly id: number; readonly name: string; readonly email?: string; phone?: string | undefined; tags: string[] }
```

**With defaults (v4: `withDecodingDefault`)**
```ts
const Config = Schema.Struct({
  port: Schema.Number.pipe(
    Schema.withDecodingDefault(() => 8080)
  ),
  host: Schema.String.pipe(
    Schema.withDecodingDefault(() => "localhost")
  )
});
```

## Arrays

```ts
const Numbers = Schema.Array(Schema.Number);

// Unique array
Schema.UniqueArray(Schema.String);
```

## Unions

```ts
const StringOrNumber = Schema.Union([Schema.String, Schema.Number]);

// Literals
const Status = Schema.Literals(["pending", "active", "completed"]);

// Exclusive union (exactly one matches)
const Exclusive = Schema.Union([
  Schema.Struct({ a: Schema.String }),
  Schema.Struct({ b: Schema.Number })
], { mode: "oneOf" });
```

## Records

```ts
const StringRecord = Schema.Record(Schema.String, Schema.Number);

// With number keys
const NumberRecord = Schema.Record(Schema.Int, Schema.String);
```

## Tagged Structs (v4: new feature)

```ts
// Shorthand for struct with _tag field
const Success = Schema.TaggedStruct("Success", {
  value: Schema.Number
});

// Equivalent to:
const Equivalent = Schema.Struct({
  _tag: Schema.tag("Success"),
  value: Schema.Number
});
```

## Tagged Unions (v4: new feature)

```ts
const Result = Schema.TaggedUnion({
  Success: { value: Schema.Number },
  Failure: { error: Schema.String }
});

// Creates union of tagged structs
```

## Transformations (v4: `decodeTo` / `encodeTo`)

In v4, transformations use `decodeTo` and `encodeTo`:

```ts
import { Schema, SchemaGetter } from "effect/unstable/schema";

// Date from string
const DateFromString = Schema.Date.pipe(
  Schema.encodeTo(Schema.String, {
    decode: SchemaGetter.Date(),
    encode: SchemaGetter.String()
  })
);

// Custom transformation
const NumberFromString = Schema.String.pipe(
  Schema.decodeTo(Schema.Number, {
    decode: (s) => parseFloat(s),
    encode: (n) => String(n)
  })
);
```

## Template Literals (v4: new feature)

```ts
// Email-like pattern with constraints
const Email = Schema.TemplateLiteral([
  Schema.String.check(Schema.isMinLength(1)),
  "@",
  Schema.String.check(Schema.isMaxLength(64))
]);

// Parse into components
const EmailParts = Schema.TemplateLiteralParser([
  Schema.String,
  "@",
  Schema.String
]);
// Type: readonly [string, "@", string]
```

## Opaque Types / Classes (v4: `Schema.Opaque`)

```ts
class UserId extends Schema.Opaque<UserId>()(
  Schema.String.check(Schema.isUUID())
) {}

// Distinct type with validation
const id = UserId.make("550e8400-e29b-41d4-a716-446655440000");
```

## Validation & Error Handling

**Decode with Effect**
```ts
Effect.gen(function* () {
  const data = yield* Schema.decode(User)(input);
}).pipe(
  Effect.catchTag("SchemaError", (error) =>
    Console.error(String(error))
  )
);
```

**Assert (throws on invalid)**
```ts
Schema.asserts(User)(input);
```

**Decode sync (unsafe)**
```ts
const user = Schema.decodeSync(User)(input);
```

## JSON Schema

```ts
import { JSONSchema } from "effect/unstable/schema";

const schema = JSONSchema.make(User);
console.log(JSON.stringify(schema, null, 2));
```

## Common Patterns

**API request validation**
```ts
const CreateUserRequest = Schema.Struct({
  name: Schema.String.check(Schema.isMinLength(1)),
  email: Schema.String.check(Schema.isPattern(/^[^@]+@[^@]+$/)),
  age: Schema.Number.check(Schema.isInt()).check(Schema.isPositive())
});

const validateRequest = (body: unknown) =>
  Schema.decodeUnknown(CreateUserRequest)(body);
```

**Config validation**
```ts
const AppConfig = Schema.Struct({
  database: Schema.Struct({
    host: Schema.String,
    port: Schema.Number,
    ssl: Schema.Boolean
  }),
  api: Schema.Struct({
    key: Schema.String.check(Schema.isMinLength(10)),
    timeout: Schema.Number.check(Schema.isPositive())
  })
});

const config = yield* Schema.decodeUnknown(AppConfig)(
  JSON.parse(fs.readFileSync("config.json", "utf-8"))
);
```

**DTO transformation**
```ts
const DbUser = Schema.Struct({
  user_id: Schema.Number,
  user_name: Schema.String
});

const ApiUser = Schema.Struct({
  id: Schema.Number,
  name: Schema.String
});

const DbToApi = DbUser.pipe(
  Schema.decodeTo(ApiUser, {
    decode: (db) => ({ id: db.user_id, name: db.user_name }),
    encode: (api) => ({ user_id: api.id, user_name: api.name })
  })
);
```

## Best Practices

Use Schema for all external data
Validate at system boundaries
Use checks for primitive validation
Add descriptive error messages
Transform near data source/sink
Use TaggedStruct for discriminated unions

Avoid:
- Skipping validation on "trusted" data
- Using any/unknown without schema
- Validating same data multiple times
- Ignoring parse errors
- Manually writing validators

## Migration from v3

### Import Changes

| v3 | v4 |
|----|-----|
| `@effect/schema` | `effect/unstable/schema` or `effect/schema` |

### Refinements → Checks

| v3 | v4 |
|----|-----|
| `Schema.pipe(Schema.minLength(5))` | `Schema.String.check(Schema.isMinLength(5))` |
| `Schema.pipe(Schema.maxLength(5))` | `Schema.String.check(Schema.isMaxLength(5))` |
| `Schema.pipe(Schema.pattern(/.../))` | `Schema.String.check(Schema.isPattern(/.../))` |
| `Schema.pipe(Schema.positive())` | `Schema.Number.check(Schema.isPositive())` |
| `Schema.pipe(Schema.int())` | `Schema.Number.check(Schema.isInt())` |
| `Schema.pipe(Schema.between(1, 10))` | `Schema.Number.check(Schema.isBetween({ minimum: 1, maximum: 10 }))` |

### Transformations

| v3 | v4 |
|----|-----|
| `Schema.transform(from, to, { decode, encode })` | `Schema.decodeTo(target, { decode, encode })` |
| `Schema.parseJson(schema)` | Use transformation with JSON parsing |

### Struct Fields

| v3 | v4 |
|----|-----|
| `Schema.optional(field)` | `Schema.optionalKey(field)` (exact optional) or `Schema.optional(field)` (with undefined) |
| `Schema.mutable(field)` | `Schema.mutableKey(field)` |
| `Schema.propertySignature` | Removed - use `Schema.optional` |
| `Schema.withConstructorDefault` | `Schema.withDecodingDefault` |

### Other Changes

| v3 | v4 |
|----|-----|
| `Schema.partial(struct)` | Use `Schema.optional` on fields |
| `Schema.required(partial)` | Use field spreading |
| `Schema.brand` | Use `Schema.Opaque` for distinct types |
| `Schema.message` | Use `annotateKey` or custom error handling |
| `Schema.Class` | `Schema.Opaque` |
