# Effect Data Types

Common data structures in Effect v4.0.0-beta.76.

See related examples in [effect-smol/ai-docs/src/](https://github.com/Effect-TS/effect-smol/tree/main/ai-docs/src/)

## Option

**Represents optional values**

```ts
import { Option } from "effect";

// Create
const some = Option.some(42);
const none = Option.none();

// From nullable / nullish values
Option.fromNullishOr(value, () => "fallback"); // null|undefined -> fallback
Option.fromUndefinedOr(value, () => "fallback"); // undefined -> fallback
Option.fromNullOr(value, () => "fallback"); // null -> fallback

// Check
Option.isOption(value); // type guard
Option.isSome(opt);
Option.isNone(opt);

// Access value
Option.getOrElse(opt, () => defaultValue);
Option.getOrThrow(opt); // throws if None
Option.getOrThrowWith(opt, () => new Error("missing"));
Option.getOrNull(opt);
Option.getOrUndefined(opt);

// Transform
Option.map(opt, (n) => n * 2);
Option.flatMap(opt, (n) => Option.some(n + 1));
Option.filter(opt, (n) => n > 0); // Some -> None if predicate fails
Option.filterMap(opt, (n) => n > 0 ? Option.some(n * 2) : Option.none());
Option.liftPredicate((n: number) => n > 0)(5); // Option<number>
Option.liftThrowable(() => JSON.parse(input)); // Option<unknown>
Option.as(opt, "fixed"); // replace value
Option.asVoid(opt); // Option<void>

// Zip / product
Option.zipWith(opt1, opt2, (a, b) => a + b);
Option.product(opt1, opt2); // Option<[A, B]>

// Match
Option.match(opt, {
  onNone: () => "empty",
  onSome: (value) => `value: ${value}`,
});

// Gen
Option.gen(function* () {
  const a = yield* Option.some(10);
  const b = yield* Option.some(20);
  return a + b;
});

// Recovery
Option.orElse(opt, () => Option.some(99));
Option.orElseSome(opt, () => 99); // convenience: wraps fallback in Some
Option.orElseResult(opt, () => Result.fail("missing")); // Option<A> -> Result<A, E>
Option.firstSomeOf([opt1, opt2, opt3]); // first Some from iterable

// Query
Option.contains(opt, 42); // true if Some(42)
Option.exists(opt, (n) => n > 0); // true if Some and predicate passes
Option.toArray(opt); // [] or [value]
```

**Important v4 change:** Option is Yieldable but not an Effect subtype:

```ts
// In generators - works as before
Effect.gen(function* () {
  const value = yield* Option.some(42);
  return value;
});

// In combinators - must convert explicitly
Effect.map(Option.some(42).asEffect(), (n) => n + 1);
```

## Result (formerly Either in v3)

**Represents success or failure with eager, pure evaluation**

In v4, `Either` has been renamed to `Result`. Unlike `Effect`, `Result` evaluates **eagerly and synchronously** with no side effects.

```ts
import { Result } from "effect";

// Create
const ok = Result.succeed(42);
const err = Result.fail("error");

// Check
Result.isSuccess(result);
Result.isFailure(result);

// Transform
Result.map(result, (n) => n * 2);
Result.flatMap(result, (n) => Result.succeed(n + 1));

// Match
Result.match(result, {
  onFailure: (error) => `Error: ${error}`,
  onSuccess: (value) => `Success: ${value}`,
});
```

**See [data-type-result.md](data-type-result.md) for comprehensive reference** — covering all API surface including generators, do notation, filtering, transposing, Effect interoperability, and more.

## Chunk

**Immutable, performant array**

```ts
import { Chunk } from "effect";

const chunk = Chunk.make(1, 2, 3);
Chunk.append(chunk, 4);
Chunk.map(chunk, (n) => n * 2);
Chunk.toArray(chunk);
```

**See [data-type-chunk.md](data-type-chunk.md) for comprehensive reference** — covering 60+ APIs including constructors, transforms, access, queries, set operations, and extended reference tables.

## HashSet

**Immutable set with value equality**

```ts
import { HashSet } from "effect";

// Create
const set = HashSet.fromIterable([1, 2, 3, 2]); // {1,2,3}
HashSet.make(1, 2, 3);
HashSet.empty();

// Operations
HashSet.add(set, 4);
HashSet.remove(set, 2);
HashSet.has(set, 2);
HashSet.size(set);

// Queries
HashSet.isHashSet(value); // type guard
HashSet.isEmpty(set);
HashSet.some(set, (n) => n > 2); // exists matching element
HashSet.every(set, (n) => n > 0); // all elements match
HashSet.isSubset(set1, set2); // set1 is subset of set2

// Set operations
HashSet.union(set1, set2);
HashSet.intersection(set1, set2);
HashSet.difference(set1, set2);

// Transform
HashSet.map(set, (n) => n * 2);
HashSet.filter(set, (n) => n > 1);
HashSet.reduce(set, 0, (acc, n) => acc + n);
```

## HashMap

**Immutable map with value equality**

```ts
import { HashMap } from "effect";

// Create
const map = HashMap.make(["key1", "value1"], ["key2", "value2"]);
HashMap.empty();
HashMap.fromIterable([["a", 1], ["b", 2]]);

// Operations
HashMap.set(map, "key3", "value3");
HashMap.remove(map, "key1");
HashMap.removeMany(map, ["key1", "key2"]);
HashMap.setMany(map, [["key3", "value3"], ["key4", "value4"]]);
HashMap.get(map, "key1"); // Option<V>
HashMap.getUnsafe(map, "key1"); // V (throws if missing)
HashMap.has(map, "key1");
HashMap.size(map);
HashMap.isEmpty(map);
HashMap.isHashMap(value); // type guard

// Iteration
HashMap.keys(map);
HashMap.values(map);
HashMap.entries(map);
HashMap.toValues(map); // Array<V>
HashMap.toEntries(map); // Array<[K, V]>

// Transform
HashMap.map(map, (v, k) => v.toUpperCase());
HashMap.filter(map, (v, k) => v.length > 3);
HashMap.filterMap(map, (v, k) => v.length > 3 ? Option.some(v.toUpperCase()) : Option.none());
HashMap.flatMap(map, (v, k) => HashMap.make([[v, k]]));
HashMap.forEach(map, (v, k) => console.log(k, v));
HashMap.reduce(map, 0, (acc, v, k) => acc + v.length);
HashMap.compact(mapOfOptions); // HashMap<K, Option<A>> -> HashMap<K, A>

// Queries
HashMap.some(map, (v, k) => v.length > 3);
HashMap.every(map, (v, k) => v.length > 3);
HashMap.findFirst(map, (v, k) => v.length > 3); // Option<V>

// Mutation helpers (batch multiple updates efficiently)
HashMap.mutate(map, (mutable) => {
  mutable.set("key3", "value3");
  mutable.remove("key1");
});
HashMap.beginMutation(map); // start mutable window
HashMap.endMutation(map); // freeze back to immutable
HashMap.modify(map, "key", (v) => v.toUpperCase()); // modify existing value
HashMap.modifyAt(map, "key", Option.some("new")); // set/remove via Option
HashMap.modifyHash(map, hash, "key", (v) => v.toUpperCase()); // modify with known hash

// Merge
HashMap.union(map1, map2); // right-biased merge
```

## Cause & Exit

**Structured failure representation and effect completion**

```ts
import { Cause, Exit } from "effect";

// Cause holds an array of failure reasons
const cause = Cause.fail("something went wrong");
Cause.hasFails(cause);
Cause.pretty(cause);

// Exit is the completion result of an Effect
const exit = yield* Effect.exit(effect);
Exit.isSuccess(exit);
Exit.isFailure(exit);
```

**See [data-type-cause.md](data-type-cause.md) for comprehensive reference** — covering all Cause and Exit APIs including built-in error types (`NoSuchElementError`, `TimeoutError`, etc.), reason guards, extractors, transforms, and Exit filtering.

## Duration

**Time spans**

```ts
import { Duration, Option } from "effect";

// Constructors
Duration.millis(100);
Duration.seconds(5);
Duration.minutes(2);
Duration.hours(1);
Duration.nanos(BigInt(1_000_000)); // nanoseconds
Duration.micros(BigInt(500)); // microseconds
Duration.days(7);
Duration.weeks(2);
Duration.zero;
Duration.infinity;
Duration.negativeInfinity;

// Decode from flexible input
Duration.fromInputUnsafe("100 millis");
Duration.fromInputUnsafe("5 seconds");
Duration.fromInputUnsafe("2 minutes");
Duration.fromInputUnsafe(1000); // number = millis
Duration.fromInputUnsafe(BigInt(1e9)); // bigint = nanos
Duration.fromInputUnsafe([2, 500_000_000]); // [seconds, nanos]
Duration.fromInputUnsafe({ days: 1, hours: 12 }); // DurationObject
// Safe variant returns Option<Duration>
Duration.fromInput(input); // Option<Duration>

// Operations
Duration.sum(d1, d2);
Duration.subtract(d1, d2);
Duration.times(duration, 3);
Duration.divide(duration, 2); // Option<Duration>
Duration.divideUnsafe(duration, 2); // Duration (throws on invalid)
Duration.abs(duration);
Duration.negate(duration);

// Comparison
Duration.isLessThan(d1, d2);
Duration.isGreaterThan(d1, d2);
Duration.equals(d1, d2);
Duration.isFinite(duration);
Duration.isZero(duration);
Duration.isNegative(duration);
Duration.isPositive(duration);

// Convert
Duration.toMillis(duration);
Duration.toSeconds(duration);
Duration.toMinutes(duration);
Duration.toHours(duration);
Duration.toDays(duration);
Duration.toWeeks(duration);
Duration.toNanos(duration); // Option<bigint>
Duration.toNanosUnsafe(duration); // bigint (throws on infinite)
Duration.toHrTime(duration); // [seconds, nanos]
Duration.parts(duration); // { days, hours, minutes, seconds, milliseconds, microseconds, nanoseconds }
Duration.format(duration); // human-readable string

// Pattern matching
Duration.match(duration, {
  onMillis: (millis) => `${millis}ms`,
  onNanos: (nanos) => `${nanos}ns`,
  onInfinity: () => "forever",
  onNegativeInfinity: () => "negative forever",
});

// Instances
Duration.Order; // Order<Duration>
Duration.Equivalence; // Equivalence<Duration>
Duration.min(d1, d2);
Duration.max(d1, d2);
Duration.clamp({ minimum: min, maximum: max })(duration);
Duration.between({ minimum: min, maximum: max })(duration);
```

## Stream

**Lazy, effectful sequences**

```ts
import { Stream } from "effect";

// Create
Stream.make(1, 2, 3);
Stream.fromIterable([1, 2, 3]);
Stream.range(0, 10);
Stream.repeatValue(42);

// From Effect
Stream.fromEffect(effect);
Stream.unfold(0, (n) => Option.some([n, n + 1]));

// From queues / pubsub / schedules
Stream.fromQueue(queue); // Stream<A, Exclude<E, Done>>
Stream.fromPubSub(pubsub); // Stream<A>
Stream.fromSchedule(schedule); // Stream<Output, E, R>

// From context
Stream.service(ServiceTag); // Stream<S, never, I>
Stream.serviceOption(ServiceTag); // Stream<Option<S>>

// Transform
Stream.map(stream, (n) => n * 2);
Stream.filter(stream, (n) => n > 5);
Stream.flatMap(stream, (n) => Stream.range(0, n));
Stream.take(stream, 10);
Stream.drop(stream, 5);

// Combine
Stream.concat(s1, s2);
Stream.merge(s1, s2);
Stream.zip(s1, s2);

// Consume
Stream.runCollect(stream); // Chunk<A>
Stream.runForEach(stream, (item) => Console.log(item));
Stream.runFold(stream, 0, (acc, n) => acc + n);
```

## Data

**Immutable data constructors with discriminated-union support**

```ts
import { Data, Equal } from "effect";

// Plain immutable class with value equality
class User extends Data.Class<{
  readonly id: number;
  readonly name: string;
}> {}

const user1 = new User({ id: 1, name: "Alice" });
const user2 = new User({ id: 1, name: "Alice" });
console.log(user1 === user2); // false
console.log(Equal.equals(user1, user2)); // true

// Tagged class (single-variant with _tag)
class Person extends Data.TaggedClass("Person")<{
  readonly name: string;
}> {}

const person = new Person({ name: "Alice" });
console.log(person._tag); // "Person"

// Tagged enum (multi-variant discriminated union)
type Shape = Data.TaggedEnum<{
  Circle: { readonly radius: number };
  Rect: { readonly width: number; readonly height: number };
}>;

const { Circle, Rect, $match } = Data.taggedEnum<Shape>();

const area = $match({
  Circle: ({ radius }) => Math.PI * radius ** 2,
  Rect: ({ width, height }) => width * height,
});

console.log(area(Circle({ radius: 5 }))); // 78.5398...
console.log(area(Rect({ width: 3, height: 4 }))); // 12

// Yieldable error (no _tag)
class NetworkError extends Data.Error<{
  readonly code: number;
  readonly message: string;
}> {}

// Yieldable tagged error (with _tag for catchTag)
class NotFound extends Data.TaggedError("NotFound")<{
  readonly resource: string;
}> {}

class Forbidden extends Data.TaggedError("Forbidden")<{
  readonly reason: string;
}> {}
```

## Redacted

**Hide sensitive values in logs**

```ts
import { Redacted } from "effect";

// Create
const secret = Redacted.make("my-secret-key");

// Hides in logs
console.log(secret); // <redacted>

// Access value
const value = Redacted.value(secret); // "my-secret-key"

// Type guard
Redacted.isRedacted(value);

// Wipe from internal registry (unsafe)
Redacted.wipeUnsafe(secret);

// Create equivalence for redacted values
Redacted.makeEquivalence(Equivalence.strictEqual<string>());
```

## Match

**Pattern matching**

```ts
import { Match } from "effect";

const result = Match.value(input).pipe(
  Match.when({ _tag: "Success" }, ({ value }) => `Success: ${value}`),
  Match.when({ _tag: "Error" }, ({ error }) => `Error: ${error}`),
  Match.orElse(() => "Unknown"),
);

// Type-safe exhaustive matching
Match.type<User | Admin | Guest>().pipe(
  Match.tag("User", (user) => user.name),
  Match.tag("Admin", (admin) => `Admin: ${admin.name}`),
  Match.tag("Guest", () => "Guest"),
  Match.exhaustive,
);
```

**See [data-type-match.md](data-type-match.md) for comprehensive reference** — covering all Match APIs including `whenOr`, `whenAnd`, `discriminator`, `type refinements`, and more.

## Queue

**FIFO async coordination**

```ts
import { Queue } from "effect";

// Create
const queue = yield * Queue.bounded<number>(100);
const slidingQueue = yield * Queue.sliding<number>(100); // drops oldest when full
const droppingQueue = yield * Queue.dropping<number>(100); // drops new when full
const unboundedQueue = yield * Queue.unbounded<number>();

// Type guards
Queue.isQueue(value);
Queue.isEnqueue(value);
Queue.isDequeue(value);
Queue.asEnqueue(queue); // narrow to Enqueue side
Queue.asDequeue(queue); // narrow to Dequeue side

// Producer
yield * Queue.offer(queue, 42);
Queue.offerUnsafe(queue, 42); // synchronous, returns boolean
yield * Queue.offerAll(queue, [1, 2, 3]);
Queue.offerAllUnsafe(queue, [1, 2, 3]); // synchronous, returns unoffered items

// Signal completion / failure
yield * Queue.end(queue); // signal normal completion
yield * Queue.fail(queue, error); // signal failure
yield * Queue.failCause(queue, cause); // signal with Cause
yield * Queue.interrupt(queue); // signal interruption

// Consumer
const item = yield * Queue.take(queue);
const batch = yield * Queue.takeAll(queue); // all available items
const collected = yield * Queue.collect(queue); // takeAll excluding Done signals
const nItems = yield * Queue.takeN(queue, 5); // up to N items
const rangeItems = yield * Queue.takeBetween(queue, 2, 10); // between min and max
const peeked = yield * Queue.peek(queue); // first without removing
const polled = yield * Queue.poll(queue); // Option<A>
Queue.takeUnsafe(queue); // synchronous, returns Exit<A, E> | undefined

// Check
const size = yield * Queue.size(queue);
const isFull = yield * Queue.isFull(queue);
Queue.sizeUnsafe(queue); // synchronous
Queue.isFullUnsafe(queue); // synchronous

// Clear
yield * Queue.clear(queue); // remove all messages

// Shutdown
yield * Queue.shutdown(queue);

// Into (pipe queue into another)
Queue.into(queue, otherQueue);
```

## Deferred

**One-time async variable**

**Important v4 change:** Deferred is no longer yieldable. Use `Deferred.await`:

```ts
import { Deferred } from "effect";

const deferred = yield * Deferred.make<string, Error>();
const unsafeDeferred = Deferred.makeUnsafe<string, Error>();

// Type guard
Deferred.isDeferred(value);

// Set value (only once)
yield * Deferred.succeed(deferred, "value");
Deferred.sync(deferred, () => expensive()); // set via lazy function

// Complete with an existing Effect
yield * Deferred.complete(deferred, Effect.succeed("value"));
yield * Deferred.completeWith(deferred, effect); // alias

// Set with done signal
yield * Deferred.done(deferred, Exit.succeed("value"));
Deferred.doneUnsafe(deferred, Exit.succeed("value")); // synchronous

// Or fail
yield * Deferred.fail(deferred, new Error("failed"));
Deferred.failSync(deferred, () => new Error("failed")); // lazy
yield * Deferred.failCause(deferred, Cause.fail("failed"));

// Defect
yield * Deferred.die(deferred, "defect");
Deferred.dieSync(deferred, () => "defect"); // lazy

// Interrupt
yield * Deferred.interrupt(deferred);
yield * Deferred.interruptWith(deferred, fiberId);

// Await result (v4: use explicit method)
const value = yield * Deferred.await(deferred);

// Poll (non-blocking)
const opt = yield * Deferred.poll(deferred); // Option<Effect<A, E>>

// Check state
const done = yield * Deferred.isDone(deferred);
Deferred.isDoneUnsafe(deferred); // synchronous

// Into (pipe into another Deferred)
Deferred.into(deferred, otherDeferred);
```

## Ref

**Mutable reference**

**Important v4 change:** Ref is no longer yieldable. Use `Ref.get`, `Ref.set`, etc.:

```ts
import { Ref } from "effect";

const counter = yield * Ref.make(0);
const unsafeRef = Ref.makeUnsafe(0);

// Get (v4: use explicit method)
const value = yield * Ref.get(counter);
const valueUnsafe = Ref.getUnsafe(counter); // synchronous read

// Set
yield * Ref.set(counter, 42);

// Get and set (returns old value)
const oldValue = yield * Ref.getAndSet(counter, 99);

// Get and update (returns old value)
const oldValue2 = yield * Ref.getAndUpdate(counter, (n) => n + 1);

// Get and update some (returns Option<old value>)
const oldOpt = yield * Ref.getAndUpdateSome(counter, {
  onNone: () => Option.some(1),
  onSome: (n) => n < 10 ? Option.some(n + 1) : Option.none(),
});

// Set and get (returns new value)
const newValue = yield * Ref.setAndGet(counter, 42);

// Update atomically
yield * Ref.update(counter, (n) => n + 1);

// Update and get (returns new value)
const updated = yield * Ref.updateAndGet(counter, (n) => n + 1);

// Update some (conditional)
yield * Ref.updateSome(counter, {
  onNone: () => 1,
  onSome: (n) => n < 10 ? n + 1 : n,
});

// Update some and get (returns new value)
const updatedSome = yield * Ref.updateSomeAndGet(counter, {
  onNone: () => 1,
  onSome: (n) => n < 10 ? n + 1 : n,
});

// Modify (get old + update)
const prev = yield * Ref.modify(counter, (n) => [n, n + 1]);

// Modify some (conditional modify)
const modifiedOpt = yield * Ref.modifySome(counter, Option.some(0), (n) => {
  if (n > 0) return Option.some([n, n + 1]);
  return Option.none();
});
```

## Equality (v4: Structural by Default)

In v4, `Equal.equals` uses structural equality by default:

```ts
import { Equal } from "effect";

// v4: Structural equality by default
Equal.equals({ a: 1 }, { a: 1 }); // true
Equal.equals([1, 2], [1, 2]); // true
Equal.equals(new Map([["a", 1]]), new Map([["a", 1]])); // true

// NaN equality
Equal.equals(NaN, NaN); // true

// Opt out: reference equality
const obj = Equal.byReference({ a: 1 });
Equal.equals(obj, { a: 1 }); // false

// Equivalence (renamed in v4)
Equal.asEquivalence<number>(); // v4: was equivalence()

// Type guard
Equal.isEqual(value); // check if value implements Equal

// Compare collections with custom equivalence
const mapEq = Equal.makeCompareMap(keyEq, valueEq);
const setEq = Equal.makeCompareSet(elementEq);
```

## Best Practices

Use Option for nullable values
Use Result (Either) for explicit error handling
Use Chunk for immutable arrays
Use HashSet/HashMap for value equality
Use Stream for large/infinite sequences
Use Data.TaggedError for domain errors

Avoid:

- Using null/undefined (use Option)
- Mutating Chunk/HashSet/HashMap
- Using Array methods on Chunk directly
- Ignoring Stream backpressure
