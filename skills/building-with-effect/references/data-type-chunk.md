---
name: data-type-chunk
description: Comprehensive reference for Effect Chunk module - immutable, high-performance arrays. Use when working with immutable sequences, functional array operations, or replacing native arrays with a persistent data structure.
---

# Chunk - Immutable, Performant Arrays

> **Reference for Effect v4.0.0-beta.76.** APIs may change before the final v4 release.

An immutable, high-performance sequence data structure optimized for functional programming patterns. A `Chunk<A>` is a persistent data structure that supports efficient append, prepend, and concatenation operations.

## Quickstart

```ts
import { Chunk } from "effect";

const numbers = Chunk.range(1, 5); // [1, 2, 3, 4, 5]
const doubled = Chunk.map(numbers, (n) => n * 2); // [2, 4, 6, 8, 10]
const evens = Chunk.filter(doubled, (n) => n % 4 === 0); // [4, 8]
const sum = Chunk.reduce(evens, 0, (acc, n) => acc + n); // 12
```

## Constructors

```ts
import { Chunk } from "effect";

const chunk = Chunk.make(1, 2, 3); // variadic, non-empty
Chunk.of(42); // single-element non-empty chunk
Chunk.fromIterable([1, 2, 3]);
Chunk.empty();
Chunk.fromArrayUnsafe(arr); // wrap readonly array without copying
Chunk.fromNonEmptyArrayUnsafe(arr); // wrap non-empty readonly array
```

## Operations

```ts
// Element insertion (all return new Chunk)
Chunk.append(chunk, 4);
Chunk.prepend(chunk, 0);
Chunk.appendAll(chunk1, chunk2); // concat
Chunk.prependAll(chunk1, chunk2);

// Slice and dice
Chunk.take(chunk, 2);
Chunk.drop(chunk, 1);
Chunk.takeWhile(chunk, (n) => n < 3);
Chunk.dropWhile(chunk, (n) => n < 3);
Chunk.takeRight(chunk, 2);
Chunk.dropRight(chunk, 1);
Chunk.splitAt(chunk, 2); // [Chunk<A>, Chunk<A>]
```

## Transform

```ts
Chunk.map(chunk, (n) => n * 2);
Chunk.filter(chunk, (n) => n > 1);
Chunk.filterMap(chunk, (n) => n > 1 ? Option.some(n * 2) : Option.none());
Chunk.compact(chunkOfOptions); // Chunk<Option<A>> -> Chunk<A>
Chunk.flatMap(chunk, (n) => Chunk.make(n, n));
Chunk.flatten(chunkOfChunks); // Chunk<Chunk<A>> -> Chunk<A>
Chunk.sort(chunk, Order.number);
Chunk.sortWith(chunk, (a, b) => a - b);
Chunk.dedupe(chunk); // remove all duplicates
Chunk.dedupeAdjacent(chunk); // remove consecutive duplicates
Chunk.reverse(chunk);
Chunk.chunksOf(chunk, 2); // split into chunks of fixed size
```

## Access

```ts
Chunk.get(chunk, 0); // Option<A>
Chunk.getUnsafe(chunk, 0); // A (unsafe)
Chunk.head(chunk); // Option<A>
Chunk.headUnsafe(chunk); // A
Chunk.headNonEmpty(nonEmptyChunk); // A (guaranteed)
Chunk.last(chunk); // Option<A>
Chunk.lastUnsafe(chunk); // A
Chunk.lastNonEmpty(nonEmptyChunk); // A (guaranteed)
Chunk.tail(chunk); // Option<Chunk<A>> — all except head
Chunk.tailNonEmpty(nonEmptyChunk); // Chunk<A>
```

## Queries

```ts
Chunk.isChunk(value); // type guard
Chunk.isEmpty(chunk);
Chunk.isNonEmpty(chunk);
Chunk.size(chunk); // alias for .length
Chunk.contains(chunk, 42); // check with Equal.equals
Chunk.containsWith(chunk, customEq)(42); // check with custom equality
```

## Utilities

```ts
Chunk.partition(chunk, (n) => n > 1); // [Chunk<A>, Chunk<A>]
Chunk.unzip(chunkOfTuples); // [Chunk<A>, Chunk<B>]
Chunk.zip(chunk1, chunk2); // Chunk<[A, B]>
Chunk.zipWith(chunk1, chunk2, (a, b) => a + b);
Chunk.remove(chunk, 0); // remove element at index
Chunk.modify(chunk, 0, (n) => n * 2); // update element at index
Chunk.replace(chunk, 0, 99); // set element at index
Chunk.split(chunk, (n) => n > 3); // split by predicate
Chunk.splitWhere(chunk, (n) => n > 3); // split at first matching element
Chunk.splitNonEmptyAt(nonEmptyChunk, 2); // split non-empty at index
```

## Reduce / Fold

```ts
Chunk.reduce(chunk, 0, (acc, n) => acc + n);
Chunk.reduceRight(chunk, "", (n, acc) => `${n},${acc}`);
Chunk.forEach(chunk, (n) => console.log(n));
Chunk.findFirst(chunk, (n) => n > 1); // Option<A>
Chunk.findLast(chunk, (n) => n > 1); // Option<A>
Chunk.findFirstIndex(chunk, (n) => n > 1); // Option<number>
Chunk.findLastIndex(chunk, (n) => n > 1); // Option<number>
Chunk.every(chunk, (n) => n > 0);
Chunk.some(chunk, (n) => n > 2);
Chunk.join(chunk, ","); // string
Chunk.mapAccum(chunk, 0, (acc, n) => [acc + n, n * 2]); // [number, Chunk<number>]
Chunk.separate(chunkOfResults); // [Chunk<A>, Chunk<B>] from Chunk<Result<B, A>>
```

## Generation

```ts
Chunk.range(1, 5); // [1, 2, 3, 4, 5]
Chunk.makeBy(3, (i) => i * 10); // [0, 10, 20]
```

## Set Operations

```ts
Chunk.difference(chunk1, chunk2); // remove chunk2 elements from chunk1
Chunk.differenceWith(eq)(chunk1, chunk2); // difference with custom equality
Chunk.intersection(chunk1, chunk2); // common elements
Chunk.union(chunk1, chunk2); // all unique elements
```

## Convert

```ts
Chunk.toArray(chunk); // Array<A>
Chunk.toReadonlyArray(chunk); // ReadonlyArray<A>
```

## Equivalence

```ts
const eq = Chunk.makeEquivalence(Equivalence.strictEqual<number>());
eq(chunk1, chunk2); // boolean
```

## See Also

- [data-types.md](data-types.md) - Overview of all Effect data types
