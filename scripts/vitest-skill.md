# Vitest skill runbook

The generator reads the pinned Vitest docs, emits a skeleton per leaf, and checks
the shipped leaves against the pin. It never writes into
`skills/vitest/references/`: the leaves are curated, and the skeleton carries raw
doc lines that must not ship.

## Gates

Run all four after any change to a leaf, the manifest, or the pin.

```bash
bun run scripts/vitest-skill.manifest.ts             # shape: jobs, leaves, docs, headings
bun run scripts/vitest-skill.extract.ts --check      # pin: tag, commit, digests, doc set, leaf list
bun run scripts/vitest-skill.render.ts --verify      # citations: both directions, per leaf
bun test && bunx tsc --noEmit && bun run scripts/validate-skills.ts
```

`--check` needs network. `--verify` and `bun test` run offline. `--fetch`,
`--write-lock`, and `--leaf` need the `.vitest-docs/` cache, which is not
committed.

## Resync after a new release

1. Change `PIN.tag` in `scripts/vitest-skill.manifest.ts`.
2. `bun run scripts/vitest-skill.extract.ts --changed-leaves` prints one line per
   moved page with the leaves that cite it, then the files to re-curate. It exits
   1 while anything moved.
3. For each named leaf: `bun run scripts/vitest-skill.render.ts --leaf <leaf>
   --out /tmp/skeleton-<leaf>.md`, then diff the skeleton against the leaf and
   move what is missing.
4. `bun run scripts/vitest-skill.extract.ts --fetch` fills the cache for the new
   pin and fails on a page whose path moved.
5. `bun run scripts/vitest-skill.extract.ts --write-lock scripts/vitest-skill.lock.json`
   rewrites the lock; `--changed-leaves` and `--check` must both exit 0.
6. Re-run the gates above. Re-run the evals only when a trigger or output case
   changed, and regrade `evals/vitest/grading.json` before `--grade-only 1`.

## Add a page to a leaf

1. Add the path to that job's `documents` in the manifest.
2. `--fetch` verifies the path at the pin and exits 1 when it is wrong.
3. Render that leaf, curate, then `--verify` fails until the new page is cited.

## Add a symptom

1. Add the routing row to `skills/vitest/SKILL.md`.
2. Add the row number to an existing job's `rows`, or add a job with its leaf,
   docs, headings, and boundary.
3. Render the leaf if it is new, curate, then run the gates. `--check` fails on a
   leaf list that left the lock, so `--write-lock` follows a new job.
