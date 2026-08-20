# Writing for agents

I wrote this skill out of mild frustration. Every agent-facing doc I read padded its claims with "crucial" and "groundbreaking", hedged them with "may potentially", and buried the instruction under filler. Humans can't verify that. Agents can't parse it. This skill is the clean-up: prose a machine reads once and a human can check line by line.

It follows Simplified Technical English (STE) in a light form.

SKILL.md is the instruction file agents load at runtime. This README is for you. It explains why the skill exists, how it is built, and how to extend it. Read it before you edit the skill.

## The problem

Writing for humans and writing for machines overlap, but they are not the same job.

People tolerate padding. We fill in meaning from context and tone. Agents don't. Give an agent "request", "call", "invocation", and "query" for one concept, and it has to guess or learn the mapping by extra training. A person checking machine behavior faces the same wall: a claim with no number, no name, and no source cannot be checked at all.

This skill sits in the overlap: text that agents parse reliably and that humans can audit. It treats the two readers as one need, not a trade-off.

## Two readers, one need

The skill is written for two readers.

- Agents ingest the content first. They need consistent terms, short sentences, and statements that carry their own context.
- Humans verify it second. They need proof on every claim.

Both want the same thing: specific, unambiguous, consistent text. The skill never trades one reader for the other. If a line only works when a human reads it emotionally, out it goes.

## The standard: STE

Simplified Technical English (ASD-STE100) is a controlled language built for maintenance manuals. It has two halves: a controlled vocabulary of about 900 approved words and 65 writing rules. ASD, the AeroSpace and Defence Industries Association of Europe, publishes it.

This skill takes the rules, not the dictionary:

- Max 20 words per sentence.
- One instruction per sentence, imperative mood.
- One meaning per word; repeat the same term for the same concept.
- Active voice.
- Plain words over fancy synonyms.

Why not the full dictionary? It is tuned to aircraft maintenance and it is heavy to maintain. The rules are the part that transfers. The word list is not.

`references/ste-rules.md` holds the rules in detail plus a worked before/after rewrite. `references/offender-wordlist.md` holds the word tables. Read ste-rules first; it is the one that teaches the standard.

## What it has to do with unslop

Unslop is a sibling skill by the same author. It cuts AI tells from writing meant for humans and adds human voice. The two skills share a plain-speech core: both ban filler, em dashes, hedging, synonym cycling, and fancy synonyms. They part ways on one axis: voice.

- Unslop adds soul: opinions, rhythm, first person. It wants the writing to sound like a person wrote it.
- This skill does not add soul. For prose an agent will ingest, flatness is a feature, not a tell. Predictable beats charming.

So they complement each other. Human-facing text gets both: this skill for clarity and proof, unslop for voice. Agent-internal text gets this skill alone. There is no case where they fight.

## Design decisions

Four choices were settled before I wrote the skill, and each was confirmed during planning.

| Decision | Choice | Why |
|---|---|---|
| Scope | Agent-facing artifacts only | Matches "ingested by agents"; keeps the skill focused |
| STE strictness | Principles plus a compact wordlist | The full dictionary is heavy; the rules transfer, the word list doesn't |
| Relationship to unslop | Complementary | Same plain-speech core, different goal for voice |
| Verifiability | A hard rule | "Every claim carries proof" is core principle 4, and it is the rule I care about most |

## Name and aliases

The canonical name is `writing-for-agents`. Four alternatives sit in `metadata.aliases`: `agent-facing-writing`, `clear-agent-prose`, `ste-style-writing`, and `plain-agent-writing`. Honest caveat: the agent skills spec does not read aliases. Loaders match on keywords in the description, so treat the aliases as a courtesy, not a promise.

## File layout

```
skills/writing-for-agents/
├── SKILL.md                        # what agents load; under 500 lines
├── README.md                       # this file
└── references/
    ├── ste-rules.md                # STE rules in detail, before/after rewrite
    └── offender-wordlist.md        # word tables: superlatives, hedging, filler, synonyms
```

Repo rules apply: references one level deep, forward slashes, sentence case headings, and a table of contents for any reference over 100 lines.

## Using the skill

Invoke it when writing or editing skill files, documentation, tool descriptions, prompts, or handoff notes.

The process in SKILL.md is short:

1. Draft the content.
2. Scan for the 22 patterns, grouped as verifiability, language, and style.
3. Rewrite. Preserve meaning.
4. Audit against the 9-point checklist.

Three audit questions matter more than the rest. Does every claim carry proof? Is each concept named by exactly one term? Would any sentence survive unchanged in an unrelated project? If yes to that last one, cut it.

## Extending the skill

Most changes land in one of two files.

- `references/offender-wordlist.md`: add a row to the matching table. Word on the left, plain fix on the right.
- `SKILL.md`: add a numbered pattern under the right group, then add a matching checklist line.

Then keep it consistent. One term per concept applies to the skill's own prose too. When you add a word, use it only in the sense you listed.

## How the skill was verified

I ran the skill on its own text. The checks are in the record.

- The frontmatter YAML parses. The description is double-quoted because ": " inside it is a YAML mapping separator. The unquoted original would have broken every strict loader.
- The description is 315 chars, under the 1024 cap.
- SKILL.md is 95 lines, under the 500 cap.
- References are one level deep.
- No em dashes, en dashes, or curly quotes.
- An offender scan of the skill's own prose found nothing. One scanner hit was a false positive: "very" inside "every".
- An unslop pass over the body caught four things I then fixed: a parenthetical, a passive construction, a "not just" phrase, and a second passive construction.

The skill audits its own writing. That is the point, and it makes the skill trustworthy: it either follows its rules or it does not ship.

## Origin

The standard this skill adapts: ASD-STE100, Simplified Technical English, published by ASD. The skill uses its rules. It leaves the controlled dictionary alone.
