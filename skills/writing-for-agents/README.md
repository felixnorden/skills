# Writing for agents

A skill for writing content that other agents ingest and that humans can verify. It removes superlatives, hedges, filler, ambiguous terminology, and unverifiable claims. It follows Simplified Technical English (STE) in a light form.

SKILL.md is the instruction file agents load when the skill runs. This README is for a person who wants to understand the skill without reading the full agent-facing instructions. It explains why the skill exists, how it is built, and how to extend it. Read it before changing the skill.

## What it does

The skill writes prose that a machine parses once and a human checks line by line. It produces short sentences in the active voice, one meaning per word, no superlatives, and no filler. Every factual claim carries proof: a number, a name, or a source. It covers 22 patterns grouped as verifiability, language, and style, and audits output against a 9-point checklist.

## What problem it solves

Writing for humans and writing for machines overlap, but they are not the same job. People tolerate padding and infer meaning from context and tone. Agents do not. An agent that reads "request", "call", "invocation", and "query" for one concept must guess or learn the mapping. A person cannot check a claim that carries no number, name, or source.

The skill targets the overlap: text that agents parse reliably and that humans can audit. It treats the two readers as one need, not a trade-off. If a line only works when a human reads it emotionally, it is removed.

## The standard: STE

Simplified Technical English (ASD-STE100) is a controlled language built for maintenance manuals. It has two halves: a controlled vocabulary of about 900 approved words and 65 writing rules. ASD, the AeroSpace and Defence Industries Association of Europe, publishes it.

The skill takes the rules, not the dictionary:

- Max 20 words per sentence.
- One instruction per sentence, imperative mood.
- One meaning per word; repeat the same term for the same concept.
- Active voice.
- Plain words over fancy synonyms.

The full dictionary is tuned to aircraft maintenance and heavy to maintain. The rules transfer; the word list does not.

`references/ste-rules.md` holds the rules in detail plus a worked before/after rewrite. `references/offender-wordlist.md` holds the word tables. Start with ste-rules.md; it explains the standard.

## How it relates to unslop

Unslop is a related skill that cuts AI tells from writing meant for humans and adds human voice. The two skills share a plain-speech core: both ban filler, em dashes, hedging, synonym cycling, and fancy synonyms. They part ways on one axis: voice.

- Unslop adds soul: opinions, rhythm, first person. It wants the writing to sound like a person wrote it.
- This skill does not add soul. For prose an agent will ingest, flatness is a feature, not a tell.

So the skills complement each other. Human-facing text gets both: this skill for clarity and proof, unslop for voice. Agent-internal text gets this skill alone.

## Design decisions

Four choices were fixed before the skill was written.

| Decision | Choice | Why |
|---|---|---|
| Scope | Agent-facing artifacts only | Matches "ingested by agents"; keeps the skill focused |
| STE strictness | Principles plus a compact wordlist | The full dictionary is heavy; the rules transfer, the word list does not |
| Relationship to unslop | Complementary | Same plain-speech core, different goal for voice |
| Verifiability | A hard rule | "Every claim carries proof" is core principle 4 |

## Name and aliases

The canonical name is `writing-for-agents`. Four alternatives sit in `metadata.aliases`: `agent-facing-writing`, `clear-agent-prose`, `ste-style-writing`, and `plain-agent-writing`. The agent skills spec does not read aliases. Loaders match on keywords in the description, so the aliases are a courtesy, not a promise.

## How it is structured

```
skills/writing-for-agents/
├── SKILL.md                        # what agents load; under 500 lines
├── README.md                       # this file
└── references/
    ├── ste-rules.md                # STE rules in detail, before/after rewrite
    └── offender-wordlist.md        # word tables: superlatives, hedging, filler, synonyms
```

Repo rules apply: references one level deep, forward slashes, sentence case headings, and a table of contents for any reference over 100 lines.

## How to use it

Invoke the skill when writing or editing skill files, documentation, tool descriptions, prompts, or handoff notes.

The process in SKILL.md is short:

1. Draft the content.
2. Scan for the 22 patterns, grouped as verifiability, language, and style.
3. Rewrite. Preserve meaning.
4. Audit against the 9-point checklist.

Three audit questions carry the most weight. Does every claim carry proof? Is each concept named by exactly one term? Would any sentence survive unchanged in an unrelated project? If yes to the last one, cut it.

## How to extend it

Most changes land in one of two files.

- `references/offender-wordlist.md`: add a row to the matching table. Word on the left, plain fix on the right.
- `SKILL.md`: add a numbered pattern under the right group, then add a matching checklist line.

Keep the skill consistent. One term per concept applies to the skill's own prose too. When a word is added, use it only in the sense it is listed.

## How the skill was verified

The skill is written against its own rules. These checks ran during authoring.

- The frontmatter YAML parses. The description is double-quoted because ": " inside it is a YAML mapping separator. An unquoted description would break a strict loader.
- The description is 315 chars, under the 1024 cap.
- SKILL.md is 95 lines, under the 500 cap.
- References are one level deep.
- No em dashes, en dashes, or curly quotes.
- An offender scan of the skill's own prose found nothing. One scanner hit was a false positive: "very" inside "every".
- An unslop pass over the body caught four items that were then fixed: a parenthetical, a passive construction, a "not just" phrase, and a second passive construction.

The skill audits its own writing. That is the point.

## Provenance

Original skill in this repository.

See SKILL.md for the full agent-facing instructions.
