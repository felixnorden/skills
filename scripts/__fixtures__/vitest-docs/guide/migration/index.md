---
title: Migration | Guide
---

# Migration {#migration}

## Prerequisites

- **Node** must satisfy the engine floor declared by the package manifest.
- **Vite** must satisfy the version range that the package peer requires.

## Renames and removals

- `sequential` is now expressed as `concurrent: false` on the suite or the test.
- This entrypoint was deprecated in the previous major and no longer loads.
- The `bench` helper is a fixture from the test context, not an import.

## Defaults that flipped

- Mock clearing now runs before every test through the `clearMocks` option.
- A hoisted mocking call outside module top level now throws with every call
  listed in the error message.

## Packages that moved

- Assertion code is bundled into `vitest` and into `@vitest/expect`.
- The WebdriverIO browser provider is community-maintained in its own package.
