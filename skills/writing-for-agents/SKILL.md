---
name: writing-for-agents
description: "Writes and edits prose that agents and humans both verify: short sentences, one term per concept, active voice, and proof for every claim. Use when writing or editing plans, specs, design documents, PRDs, API docs, READMEs, changelogs, handoff notes, guides, tool descriptions, or prompts. Do not use for chat replies, summaries, translations, or marketing copy."
---

# Writing for agents

Write prose that agents parse and humans verify. Both need specific facts, one term per concept, and short sentences.

Apply STE in light form, not the full ASD-STE100 vocabulary. `references/ste-rules.md` holds the rules; `references/offender-wordlist.md` holds the word tables. For text that also reaches humans, pair this skill with unslop. Unslop adds human voice; this skill adds agent clarity.

## Core principles

1. **One term per concept.** Pick one term and repeat it. Never cycle synonyms for style. An agent that maps "request", "call", "invocation", and "query" to one concept must guess the mapping. Remove the guess.
2. **One idea per sentence.** Keep each under 20 words. Split any sentence that needs a backtrack to parse.
3. **Instructions are imperative.** Write "Validate the token before use," not "It may be worth validating the token before use." Put the instruction first.
4. **Every claim carries proof.** Each factual claim names a number, a name, or a source. No proof, no claim: add the proof or cut the claim.
5. **Plain words.** "Use" not "utilize". "Help" not "facilitate". "Many" not "numerous". The small word wins.
6. **No superlatives.** "extremely", "crucial", "groundbreaking", "massive", "unprecedented" state a feeling, not a fact. The sentence works without the word or needs a measure.
7. **Active voice.** Name the actor: "The loader parses the file." Use passive only when the actor is unknown or irrelevant.
8. **Self-contained.** Do not rely on conversation context, earlier paragraphs, or reader memory. An agent reads a chunk, not the whole corpus. Restate what each sentence depends on.

## Process

1. Draft the content.
2. Scan for the patterns below.
3. Rewrite. Preserve meaning.
4. Audit against the checklist. Fix every failure.

## Patterns to fix

### Verifiability

1. **Unproven claims.** "The parser is fast" becomes "The parser handles 4 MB/s". A claim without a number or comparison is uncheckable.
2. **Implied comparatives.** "better", "improved", "faster", "more robust" need a baseline. State it or cut the word.
3. **Vague attribution.** "experts believe", "the industry says", "some tools" name no source. Name the source or delete.
4. **Generic statements.** Cut any sentence that could appear unchanged in an unrelated project's docs. "high-quality", "production-ready", "robust", "seamless" are giveaway words.
5. **Empty claims.** "comprehensive", "powerful", "flexible", "scalable" describe a feeling. State the fact the word hides: which features, which scale.

### Language

6. **Superlatives and intensifiers.** Cut extremely, very, crucial, key, massive, groundbreaking, cutting-edge, and their kind. Replace each with a measure. Keep "essential" and "critical" only when they mean "needed for this step". Full list: `references/offender-wordlist.md`.
7. **Filler phrases.** "in order to" becomes "to". "due to the fact that" becomes "because". Delete "it is important to note that". "in the event that" becomes "if". "at this point in time" becomes "now".
8. **Hedging.** "could possibly be" becomes "is" when the fact is known. Keep "may" only for a real condition. "The token may expire" states a condition. "The file may be large" is a hedge.
9. **Synonym cycling.** request/call/invocation/query: pick one term, repeat it.
10. **Fancy synonyms.** utilize→use, leverage→use, facilitate→help, numerous→many, prior to→before, subsequent→after, commence→start, terminate→stop, endeavor→try. Full list: `references/offender-wordlist.md`.
11. **"Is" variants.** "serves as", "stands as", "boasts", "features" become "is" or "has".
12. **Weak verb plus adverb.** "runs quickly" becomes "runs in 2 s" or "is fast". Cut the adverb, fix the verb, or add the measure.
13. **Metaphor nouns.** substrate→base, wedge→add, vector→way, surface→the real name, paradigm→way, leverage→use. A metaphor always has a plainer word. Longer set: unslop's jargon list.
14. **Rule of three.** Do not force ideas into triples. Use the natural count.
15. **False ranges.** "from X to Y" where X and Y are not on one scale. List the items.

### Style

16. **Em dashes.** Avoid entirely. End the sentence or use a comma. No parentheses or en dashes as substitutes.
17. **Colons mid-sentence.** Fine before a list or example. Not as connectors.
18. **"-ing" nouns.** "the writing of the docs" becomes "writing the docs". Use simple verb forms.
19. **Indirect instructions.** "It may be worth noting that X should be done" becomes "Do X". State every instruction as an imperative.
20. **Vague enumeration.** "etc.", "and more", "among others": list the items or state the set.
21. **Ambiguous pronouns.** "it", "this", "that" with two possible referents. Name the noun. An agent cannot resolve implied referents.
22. **Buried context.** Define each term on first use and expand each abbreviation: "the SSE (Server-Sent Events) stream".

## STE rules to steal

Beyond the principles above, ASD-STE100 adds these rules:

- Use "a", "an", "the" consistently. Articles are required, not optional.
- Use simple tenses: present for facts, imperative for instructions.
- Repeat the noun instead of a pronoun when the referent can shift.
- Keep one meaning per word. Two senses for one word means two concepts share one name. Rename one.

Full rules and examples: `references/ste-rules.md`.

## Self-audit checklist

Run after rewriting. Fix every failure.

1. Does every factual claim carry proof?
2. Would any sentence survive unchanged in an unrelated project? Cut it.
3. Is each concept named by exactly one term?
4. Is every sentence under 20 words with one idea?
5. Is every instruction imperative and first in its sentence?
6. Are there superlatives, hedges, or filler left?
7. Are there comparatives without a baseline?
8. Can an agent parse this without conversation context?
9. Does the structure match the artifact's purpose: steps as steps, options as options?

## References

- `references/ste-rules.md`: STE rules in detail with before/after examples.
- `references/offender-wordlist.md`: word tables for superlatives, hedging, filler, fancy synonyms.
