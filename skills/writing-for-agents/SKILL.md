---
name: writing-for-agents
description: "Writes clear, concise, verifiable prose for content other agents ingest. Use when writing or editing skill files, documentation, tool descriptions, prompts, or handoff notes. Follows Simplified Technical English (STE): short sentences, one meaning per word, active voice, no superlatives, every claim carries proof."
metadata:
  aliases: agent-facing-writing, clear-agent-prose, ste-style-writing, plain-agent-writing
---

# Writing for agents

Write prose that other agents parse reliably and that humans can verify. Both audiences need the same thing: specific facts, consistent terms, and short sentences.

This skill applies STE principles in a light form. It does not enforce the full ASD-STE100 controlled vocabulary. `references/ste-rules.md` has the rules in detail. `references/offender-wordlist.md` has the word tables.

When the same text also reaches humans, pair this skill with unslop. Unslop adds human voice. This skill adds agent clarity. The two share a plain-speech core and do not conflict.

## Core principles

1. **One term per concept.** Pick one term for each concept and repeat it. Never cycle synonyms for style. An agent that maps "request", "call", "invocation", and "query" to one thing must guess or learn the mapping. Remove the guess.
2. **One idea per sentence.** Max 20 words per sentence. Split any sentence that needs a backtrack to parse.
3. **Instructions are imperative.** "Validate the token before use." Not "It may be worth validating the token before use." Put the instruction first.
4. **Every claim carries proof.** Each factual claim names a number, a name, or a source. That detail is its proof. No proof, no claim: add the proof or cut the claim. This is the hard rule for verifiability.
5. **Plain words.** "Use" not "utilize". "Help" not "facilitate". "Many" not "numerous". The small word wins.
6. **No superlatives, no hyperbole.** "extremely", "crucial", "groundbreaking", "massive", "unprecedented" state a feeling, not a fact. The sentence either works without the word or needs a real measure.
7. **Active voice.** Name the actor. "The loader parses the file." Use passive only when the actor is unknown or irrelevant.
8. **Self-contained.** Do not rely on conversation context, earlier paragraphs, or reader memory. An agent reads a chunk, not the whole corpus. Restate what each sentence depends on.

## Process

1. Draft the content.
2. Scan for the patterns below.
3. Rewrite. Preserve meaning.
4. Audit against the checklist. Fix every failure.

## Patterns to detect and fix

### Verifiability

1. **Unproven claims.** "The parser is fast" becomes "The parser handles 4 MB/s". A claim without a number or a comparison is uncheckable.
2. **Implied comparatives.** "better", "improved", "faster", "more robust" without a baseline. State the baseline or cut the word.
3. **Vague attribution.** "experts believe", "the industry says", "some tools". Name the source or delete.
4. **Generic statements.** If a sentence could appear unchanged in an unrelated project's docs, it says nothing about this one. Cut it. "high-quality", "production-ready", "robust", "seamless" are giveaway words.
5. **Empty claims.** "comprehensive", "powerful", "flexible", "scalable" describe a feeling. State the fact the word stands in for: which features, which scale.

### Language

6. **Superlatives and intensifiers.** extremely, very, highly, significantly, dramatically, incredibly, absolutely, crucial, vital, essential, critical, key, core, major, massive, huge, enormous, unprecedented, groundbreaking, revolutionary, world-class, state-of-the-art, cutting-edge. Cut them or replace with a measure. Keep "essential" and "critical" only when they mean "needed for this step".
7. **Filler phrases.** "in order to" becomes "to". "due to the fact that" becomes "because". "it is important to note that" is deleted. "in the event that" becomes "if". "at this point in time" becomes "now".
8. **Hedging.** "could possibly be" becomes "is" when the fact is known. Keep "may" only for a real condition. "The token may expire" is a fact about a condition. "The file may be large" is a hedge.
9. **Synonym cycling.** request/call/invocation/query: pick one term, repeat it.
10. **Fancy synonyms.** utilize→use, leverage→use, facilitate→help, numerous→many, prior to→before, subsequent→after, commence→start, terminate→stop, endeavor→try.
11. **"Is" variants.** "serves as", "stands as", "boasts", "features" become "is" or "has".
12. **Adverbs propping weak verbs.** "runs quickly" becomes "runs in 2 s" or "is fast". Cut the adverb, fix the verb, or add the measure.
13. **Metaphor nouns.** substrate→base, wedge→add, vector→way, surface→the real name, paradigm→way, leverage→use. If a word reads as a metaphor, it has a plainer word. See unslop's jargon list for the longer set.
14. **Rule of three.** Do not force ideas into groups of three. Use the natural count.
15. **False ranges.** "from X to Y" where X and Y are not on one scale. List the items.

### Style

16. **Em dashes.** Avoid entirely. End the sentence or use a comma. No parentheses or en dashes as substitutes.
17. **Colons mid-sentence.** Fine before a list or example. Not as connectors.
18. **"-ing" nouns.** "the writing of the docs" becomes "writing the docs". Use simple verb forms.
19. **Indirect instructions.** "It may be worth noting that X should be done" becomes "Do X". If the sentence tells the reader to do something, say it as an imperative.
20. **Vague enumeration.** "etc.", "and more", "among others": list the items or state the set.
21. **Ambiguous pronouns.** "it", "this", "that" with two possible referents. Name the noun. An agent cannot resolve implied referents.
22. **Buried context.** Terms first used without definition, abbreviations first used unexpanded. Expand on first use: "the SSE (Server-Sent Events) stream".

## STE rules to steal

ASD-STE100 is the full standard for maintenance manuals. These parts transfer to agent-facing prose:

- Max 20 words per sentence.
- One instruction per sentence, imperative mood.
- Use "a", "an", "the" consistently. Articles are required, not optional.
- Simple tenses: present for facts, imperative for instructions.
- Repeat the noun. Do not replace it with a pronoun mid-paragraph when the referent can shift.
- One meaning per word. If one word has two senses in a document, that is two concepts sharing one name. Rename one.

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
