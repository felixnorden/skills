# Browser mode

Covers a browser-mode test that cannot find an element: provider setup, the
instance, locators and their strictness, browser assertions, component setup, and
what a failed locator printed. Project and environment configuration belong to
another reference, and framework-specific component patterns live in each
framework's own documentation.

## Contents

- Install a provider
- Instance and API
- Locators
- Locator strictness
- Browser assertions
- Component setup
- Inspect the failure
- What this leaf does not cover

## Install a provider

Symptom: the run fails before any test with a message about a missing provider or
an unknown `browser.provider` value.

Browser mode needs a provider that launches a real browser. Two first-party
providers ship for it:

- `@vitest/browser-playwright` launches a Playwright browser and is the provider
  that also supports traces.
- `@vitest/browser-preview` serves the page and needs no browser driver.

The one fragile step is the setup command, because it edits configuration as well
as installing packages:

```bash
npx vitest init browser
```

See `vitest.dev/guide/browser`.

Check the `browser.provider` value in the config: it must be a provider instance,
not the string name of a package. Fix a missing driver by installing the provider
package and passing its factory, and keep one provider per project so two
providers do not fight over the same port. See `vitest.dev/config/browser/provider`,
`vitest.dev/config/browser/playwright`, and `vitest.dev/config/browser/preview`.

Browser mode runs tests in a real browser instead of a simulated DOM, which is the
point of the feature and also the reason it starts slower: the provider and the
browser must start before the first test. A suite that is slower than its Node
counterpart is expected, not a misconfiguration. See `vitest.dev/guide/browser/why`.

## Instance and API

A browser test imports its helpers from the browser entry point rather than from a
provider package:

- `page` interacts with the current page. It exposes some utilities from a
  driver's page object but is not the same object, because the test runs in the
  browser and the driver runs on the server.
- `userEvent` dispatches real user interactions such as clicks and typing.
- `server` runs a function on the server and returns its result, which is how a
  test reads or writes a file.

See `vitest.dev/api/browser/context` and `vitest.dev/api/browser/commands`.

Check whether the value came from `page` or from the provider: passing a driver
page object into a browser test fails at serialization rather than at the
assertion. Fix by using the browser helpers and a server command for anything the
browser cannot reach.

One mocking rule is stated here in this reference's own words: in browser mode a
module mock that replaces exports makes every method and getter return `undefined`,
because the module namespace is sealed. A mock created with `{ spy: true }` keeps
the original exports and records calls instead. Reach for that form in a browser
test before concluding the module itself is broken.

## Locators

A locator is a query that can retry. `getByRole` and `getByText` map onto
accessibility attributes; chained filters narrow an existing locator rather than
re-querying the document. See `vitest.dev/api/browser/locators`.

Symptom: `locator.click()` rejects with a message that several elements matched,
or an element that exists is reported as missing.

Check the locator against the accessibility tree, not the DOM source: a role query
that fails usually means the element has no accessible name, not that the selector
is wrong.

Fix by narrowing with a chained filter or by using a `getByRole` name. Where an app
shape has no built-in locator, extend the locator set instead of dropping to
`querySelector`, which loses retry and strict-mode protection:

- `locators.extend` returns a locator from a Playwright locator string, so
  chaining and retry keep working.
- The extended method runs scoped to the locator it is called on, so a parent
  locator narrows the query to its subtree.

See `vitest.dev/guide/recipes/browser-locators`.

## Locator strictness

`browser.locators.exact` defaults to `true`, so text passed to a locator must match
the element's whole text, case-sensitively, after trimming whitespace. With that
default, `getByText('Item')` no longer matches an element whose text is `Item 1`,
and the locator fails instead of matching loosely. See
`vitest.dev/config/browser/locators`.

Check the element's whole text before changing any setting: a label that reads
`Item 1 (` plus a count is a different string from `Item`, which is what the
default is protecting against.

Two fixes, smallest first:

- Pass a partial matcher or a regular expression for that one call, which keeps the
  strict default for every other locator.
- Set `browser.locators.exact` to `false` when the whole suite legitimately matches
  substrings, and accept that a typo in a name no longer fails a call.

A locator options object also accepts `exact` per call, and a regular expression
argument ignores the option entirely. See `vitest.dev/api/browser/locators`.

## Browser assertions

`expect.element(locator)` retries until the assertion passes or the timeout runs
out, which is why it is the default form in a browser test. A plain `expect` on a
locator is available and has no retry. See `vitest.dev/api/browser/assertions`.

Text assertions have two matchers, and picking the wrong one is a common false
failure:

- `toHaveTextContent` compares the whole text content for equality.
- `toMatchTextContent` accepts a partial string or a `RegExp`, which is the right
  matcher for a label that carries a changing suffix.

Symptom: an assertion that passed against a simulated DOM fails in a browser. Check
the rendered text with a partial matcher first; if the partial matcher passes, the
code is right and the assertion was too strict.

Fix by matching the smallest stable fragment, or by asserting on the accessible
name rather than on the rendered text when i18n changes the string.

## Component setup

Component testing runs the component in the real browser, so the setup questions
are which framework plugin transforms the file and which instance serves it:

- Framework support covers Vue, React, Svelte, Lit, Preact, Qwik, Solid, and
  Marko, each through its own plugin in the Vite config. See
  `vitest.dev/guide/browser/component-testing`.
- `browser.instances` declares several browser setups in one config. Every
  instance shares one Vite server, so transform and pre-bundling work happens
  once, which is the reason to prefer instances over separate projects. See
  `vitest.dev/guide/browser/multiple-setups`.

Symptom: a component test fails at import with an unknown JSX pragma or an
untransformed extension. Check the plugin list, not the component: the browser
provider transforms nothing by itself.

Fix by adding the framework plugin once at the root and listing one instance per
browser you intend to support. A test that asserts layout or navigation should run
in the instance a user would use, not in a DOM simulation.

## Inspect the failure

A failed locator prints a subtree, and the default format is `'all'`: the ARIA
snapshot first, then HTML. `browser.locators.errorFormat` narrows that to
`'html'` or `'aria'`. See `vitest.dev/config/browser/locators`.

Two recording surfaces answer "what did the page look like":

- Trace view records steps and DOM snapshots and keeps failed tests by default.
  A passing test is not recorded unless the recording mode includes it. See
  `vitest.dev/guide/browser/trace-view`.
- A Playwright trace is available with the Playwright provider and is configured
  with `browser.trace`, whose default is `'off'`. `'retain-on-failure'` keeps a
  trace only for failing tests, which is the setting that pays for itself. See
  `vitest.dev/config/browser/trace` and `vitest.dev/guide/browser/playwright-traces`.

Check the ARIA snapshot before reading the HTML: a button with no accessible name
is invisible to a role locator, and the ARIA tree shows the name the locator saw.
Fix by giving the element a name, or by querying the attribute the component
actually sets, which `browser.locators.testIdAttribute` names.

## What this leaf does not cover

- Project and environment configuration, including which config file applies and
  how instances inherit options, belongs to the configuration reference.
- Framework-specific component patterns stay out, while this leaf keeps the setup
  question: which plugin transforms the file and which instance serves the test.
- Coverage and reporting of browser runs belong to the coverage and local-versus-
  pipeline references.
- The browser automock rule appears in this reference for the reader who starts
  here; the mocking reference states it again for the reader who starts there.
