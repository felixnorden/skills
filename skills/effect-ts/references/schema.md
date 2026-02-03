# Schema - Validation & Serialization

Type-safe parsing, validation, and transformation with `@effect/schema`.

## Basic Usage

**Install**
```bash
npm install @effect/schema
```

**Define schema**
```ts
import { Schema } from "@effect/schema"

const User = Schema.Struct({
  id: Schema.Number,
  name: Schema.String,
  email: Schema.String
})
```

**Parse (decode)**
```ts
const result = yield* Schema.decode(User)(unknown)
// Effect<User, ParseError>
```

**Encode**
```ts
const encoded = yield* Schema.encode(User)(user)
```

## Primitive Types

```ts
Schema.String
Schema.Number  
Schema.Boolean
Schema.BigInt
Schema.Date
Schema.Null
Schema.Undefined
Schema.Unknown
Schema.Never
```

## Combinators

**Struct**
```ts
const Person = Schema.Struct({
  name: Schema.String,
  age: Schema.Number
})
```

**Partial**
```ts
const PartialPerson = Schema.partial(Person)
```

**Required**
```ts
const RequiredPerson = Schema.required(PartialPerson)
```

**Array**
```ts
const Numbers = Schema.Array(Schema.Number)
```

**Tuple**
```ts
const Pair = Schema.Tuple(Schema.String, Schema.Number)
```

**Union**
```ts
const StringOrNumber = Schema.Union(Schema.String, Schema.Number)
```

**Record**
```ts
const StringRecord = Schema.Record(Schema.String, Schema.Number)
```

**Optional fields**
```ts
const User = Schema.Struct({
  id: Schema.Number,
  name: Schema.String,
  email: Schema.optional(Schema.String)
})
```

## Refinements

**Brand (opaque types)**
```ts
const PositiveNumber = Schema.Number.pipe(
  Schema.positive(),
  Schema.brand("PositiveNumber")
)

type PositiveNumber = Schema.Schema.Type<typeof PositiveNumber>
```

**Filter**
```ts
const Email = Schema.String.pipe(
  Schema.filter((s) => s.includes("@"), {
    message: () => "Invalid email"
  })
)
```

**Min/Max**
```ts
const Age = Schema.Number.pipe(
  Schema.greaterThanOrEqualTo(0),
  Schema.lessThanOrEqualTo(120)
)
```

**String constraints**
```ts
Schema.String.pipe(
  Schema.minLength(3),
  Schema.maxLength(50),
  Schema.pattern(/^[a-zA-Z]+$/)
)
```

## Transformations

**Transform**
```ts
const DateFromString = Schema.transform(
  Schema.String,
  Schema.Date,
  {
    decode: (s) => new Date(s),
    encode: (d) => d.toISOString()
  }
)
```

**ParseJson**
```ts
const UserFromJson = Schema.parseJson(User)

// Decode JSON string to User
const user = yield* Schema.decode(UserFromJson)('{"id":1,"name":"Alice"}')
```

## Tagged Unions

**Discriminated unions**
```ts
const Success = Schema.Struct({
  _tag: Schema.Literal("Success"),
  value: Schema.Number
})

const Failure = Schema.Struct({
  _tag: Schema.Literal("Failure"),
  error: Schema.String
})

const Result = Schema.Union(Success, Failure)
```

## Class Schemas

**Extend Schema.Class**
```ts
class User extends Schema.Class<User>("User")({
  id: Schema.Number,
  name: Schema.String,
  email: Schema.String
}) {
  get displayName() {
    return `User: ${this.name}`
  }
}

// Auto-generated constructor
const user = new User({ id: 1, name: "Alice", email: "a@b.com" })
```

## Annotations

**Custom messages**
```ts
const Email = Schema.String.pipe(
  Schema.pattern(/^[^@]+@[^@]+\.[^@]+$/),
  Schema.message(() => "Please enter a valid email address")
)
```

**Description**
```ts
const User = Schema.Struct({
  id: Schema.Number.pipe(
    Schema.description("Unique user identifier")
  ),
  name: Schema.String.pipe(
    Schema.description("Full name of the user")
  )
})
```

**Examples**
```ts
const Email = Schema.String.pipe(
  Schema.examples(["user@example.com", "admin@test.org"])
)
```

## Validation

**Decode with Effect**
```ts
Effect.gen(function* () {
  const data = yield* Schema.decode(User)(input)
  // data is validated User
}).pipe(
  Effect.catchTag("ParseError", (error) =>
    Console.error(TreeFormatter.formatErrorSync(error))
  )
)
```

**DecodeUnknown (safe)**
```ts
const parseUser = Schema.decodeUnknown(User)

const result = yield* parseUser(input)
```

**Asserts**
```ts
Schema.asserts(User)(input)
// Throws if invalid
```

## Default Values

**With defaults**
```ts
const Config = Schema.Struct({
  port: Schema.Number.pipe(
    Schema.propertySignature,
    Schema.withConstructorDefault(() => 8080)
  ),
  host: Schema.String.pipe(
    Schema.propertySignature,
    Schema.withConstructorDefault(() => "localhost")
  )
})

// Creates with defaults
const config = new Config({})  // { port: 8080, host: "localhost" }
```

## Common Patterns

**API request validation**
```ts
const CreateUserRequest = Schema.Struct({
  name: Schema.String.pipe(Schema.minLength(1)),
  email: Schema.String.pipe(Schema.pattern(/^[^@]+@[^@]+$/)),
  age: Schema.Number.pipe(Schema.int(), Schema.positive())
})

const validateRequest = (body: unknown) =>
  Schema.decodeUnknown(CreateUserRequest)(body)
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
    key: Schema.String.pipe(Schema.minLength(10)),
    timeout: Schema.Number.pipe(Schema.positive())
  })
})

const config = yield* Schema.decodeUnknown(AppConfig)(
  JSON.parse(fs.readFileSync("config.json", "utf-8"))
)
```

**Schema from Config**
```ts
import { Config } from "effect"

const port = Schema.Config(
  "PORT",
  Schema.Number.pipe(Schema.int(), Schema.positive())
)

const config = yield* port
```

**DTO transformation**
```ts
const DbUser = Schema.Struct({
  user_id: Schema.Number,
  user_name: Schema.String
})

const ApiUser = Schema.Struct({
  id: Schema.Number,
  name: Schema.String
})

const DbToApi = Schema.transform(
  DbUser,
  ApiUser,
  {
    decode: (db) => ({ id: db.user_id, name: db.user_name }),
    encode: (api) => ({ user_id: api.id, user_name: api.name })
  }
)
```

## Error Handling

**Format errors**
```ts
import { TreeFormatter } from "@effect/schema"

Schema.decode(User)(input).pipe(
  Effect.catchTag("ParseError", (error) =>
    Effect.log(TreeFormatter.formatErrorSync(error))
  )
)
```

**Custom error handling**
```ts
Schema.decodeUnknown(User)(input).pipe(
  Effect.catchTag("ParseError", (error) =>
    Effect.fail(new ValidationError({
      message: "Invalid user data",
      errors: error.message
    }))
  )
)
```

## Arbitrary (Testing)

**Generate test data**
```ts
import { Arbitrary } from "@effect/schema"

const userArbitrary = Arbitrary.make(User)

// Generate random valid users
import * as fc from "fast-check"
fc.sample(userArbitrary(fc))
```

## JSON Schema

**Export JSON Schema**
```ts
import { JSONSchema } from "@effect/schema"

const schema = JSONSchema.make(User)
console.log(JSON.stringify(schema, null, 2))
```

## Best Practices

Use Schema for all external data
Validate at system boundaries
Use branded types for primitives
Add descriptive error messages
Transform near data source/sink
Use Class schemas for domain models

Avoid:
- Skipping validation on "trusted" data
- Using any/unknown without schema
- Validating same data multiple times
- Ignoring parse errors
- Manually writing validators
