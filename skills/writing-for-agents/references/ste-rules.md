# STE rules in detail

Table of contents:
- Why STE
- Sentences
- Verbs
- Vocabulary
- Structure
- Self-containment
- Verifiability
- Before and after
- Checklist

## Why STE

ASD-STE100 (Simplified Technical English) is a controlled language for maintenance documentation. It has two halves: a controlled vocabulary of about 900 approved words and 65 writing rules. Its goal is text with exactly one interpretation, readable by non-native speakers and by machines.

This skill applies the STE rules and a compact offender wordlist. It does not enforce the full dictionary. The dictionary targets aircraft maintenance and is heavy to maintain. The rules transfer directly.

## Sentences

- Max 20 words per sentence. Count clauses, not words. A long sentence with one clause is readable. A short one with three clauses is not.
- One idea per sentence. Two ideas go in two sentences.
- One instruction per sentence. Two instructions in one sentence lose the second one.
- Put the most important word early. "The client sends the request" not "The request is what gets sent by the client".

## Verbs

- Active voice. Name the actor. "The loader parses the file."
- Imperative for instructions. "Validate the token before use."
- Simple tenses: present for facts, imperative for instructions. Avoid progressive and perfect forms when the simple form carries the meaning.
- Avoid "-ing" nouns. "the writing of the docs" becomes "writing the docs".
- One verb per instruction. "Open the file and read the first line" is two instructions.

## Vocabulary

- Use the same term for the same concept. Repeat it. Do not vary for style.
- Use "a", "an", "the" consistently. Articles are part of the meaning. "a token" is any token. "the token" is the one already named.
- Use the plain word. `offender-wordlist.md` gives the common swaps.
- One meaning per word. If a word has two senses in one document, that is two concepts sharing one name. Rename one.
- Expand abbreviations on first use. "the SSE (Server-Sent Events) stream".

## Structure

- Sentence case headings. Title case is decoration, not information.
- Lists for enumerable items: steps, options, constraints. Prose for explanation.
- One idea per bullet. Split bullets that wrap to two sentences.
- Keep paragraphs under 6 sentences. A wall of text hides the structure.
- Use markdown elements for what they mean: code for identifiers, tables for comparisons, lists for sets.

## Self-containment

- Restate dependencies. If a sentence relies on an earlier paragraph, fold the dependency in or cut the sentence.
- Define terms where they first appear, in the same artifact.
- No "as mentioned above", "as we discussed", "as previously stated". Say the thing.
- No "it", "this", "that" with two possible referents. Name the noun.

## Verifiability

- Every factual claim names a number, a name, or a source. No proof, no claim.
- Comparatives need a baseline. "faster than the previous version", not "faster".
- Attribution names the source. "the libp2p docs state", not "experts say".
- "May" and "might" mark a real condition or uncertainty. Known facts use "is".
- If you cannot state the fact a claim stands for, cut the claim.

## Before and after

Before:

"The new query engine is extremely fast and represents a crucial breakthrough in our data pipeline, serving as the backbone of modern analytics. It is important to note that the system leverages advanced caching mechanisms which may potentially significantly improve performance across the board, ensuring a more robust and scalable solution for all our users. Additionally, the integration process has been streamlined to facilitate smoother deployments, and numerous optimizations have been made to enhance overall efficiency."

After:

"The query engine returns results for a 1 GB table in 2 s. It caches intermediate results in memory. Deploy with one command: `deploy query-engine`. The engine uses 40% less memory than the previous version."

Changes mapped to patterns:

- "extremely fast" becomes "returns results for a 1 GB table in 2 s": unproven claim, superlative.
- "crucial breakthrough", "backbone": superlative, metaphor noun. Cut.
- "It is important to note that": filler. Cut.
- "leverages advanced caching mechanisms" becomes "caches intermediate results in memory": fancy synonym, empty claim.
- "may potentially significantly improve" becomes "uses 40% less memory than the previous version": hedging, implied comparative, superlative.
- "robust and scalable": generic statement. Cut.
- "streamlined to facilitate smoother deployments" becomes "Deploy with one command": indirect instruction, filler, fancy synonym.
- "numerous optimizations ... enhance overall efficiency": vague claim. The measure replaces it.

## Checklist

1. Every factual claim carries proof?
2. No generic statements?
3. One term per concept?
4. Sentences under 20 words, one idea?
5. Instructions imperative and first?
6. No superlatives, hedges, filler?
7. Comparatives have baselines?
8. Self-contained without conversation context?
9. Structure matches purpose?
