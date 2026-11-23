---
title: Locators | Browser
---

# Locators {#locators}

Locators are the query API a browser test uses to find an element on the page.

## Locator exactness

`browser.locators.exact` controls whether text passed to a locator must match the
element's whole text content or only a part of it.

- **Type:** `boolean`
- **Default:** `true`

Because exactness defaults on, `getByText('Item')` no longer matches an element
whose text is `Item 1`, and the locator fails instead of matching loosely.

Pass a partial matcher or set `browser.locators.exact` to `false` when a partial
text match is the intent of the query.

## Text assertions

`toHaveTextContent` compares the whole text content of the matched element for
equality, while `toMatchTextContent` accepts a partial string or a `RegExp`.

## Failure output

`browser.locators.errorFormat` accepts `'html'`, `'aria'`, or `'all'` and decides
what a failed locator prints, with `'aria'` showing the accessibility tree.
