TODO — Item List Card (todo.md)

> Master task list for the item-list-card Home Assistant Lovelace custom card. Built to be exhaustive, prioritized, and actionable. Use this as a living checklist when polishing, releasing, and maintaining the card.




---

Quick overview

This document captures everything that needs to get done to take the card from its current repo state to a polished, production-ready, well-documented, translated and test-covered project suitable for HACS and broad user adoption.

It is split into milestones (MVP, v1, v2), and then grouped tasks: development, UI/UX, localisation (i18n), docs/screenshots, testing & CI, packaging & release, accessibility & performance, community & maintenance, and nice-to-haves.


---

Assumptions (what I'm assuming about the project)

The card is a Lit-based custom Lovelace card (repo README says Lit).

Core interactive functionality (render list, plus/minus buttons, add-to-shopping action) works but needs hardening, editor support, i18n and documentation.

The project is built with a bundler that outputs dist/item-list-card.js and already has package.json and manifest.json.


If any of those assumptions are wrong, adjust the corresponding sections below (marked VERIFY).


---

How to use this TODO

1. Start with the MVP checklist and polish until all boxes are checked.


2. Open a new branch per high-level task (editor, i18n, tests, docs, CI, build). Keep PRs small and reviewable.


3. Create issues for multi-step tasks and link them to this TODO.


4. Mark items DONE as you accomplish them. Use the checklist syntax to track progress.




---

Milestones

MVP: Stable core features, docs (README + examples), screenshots, compliance with HACS manifest, basic tests, publishable to HACS.

v1: Lovelace UI editor integration, i18n (English + German min), CI for tests/builds, accessibility improvements, unit + integration tests, automated releases.

v2: Visual regression tests, optional features (drag & drop reorder, inline quantity edit), community translations, Storybook / demo page.



---

✅ MVP checklist (must have)

[ ] Code health

[ ] Linting configured (ESLint) and run in CI.

[ ] Prettier or equivalent formatting configured.

[ ] package.json scripts: build, dev, lint, test, format.


[ ] Build & packaging

[ ] Build outputs dist/item-list-card.js (bundled ES module). Verify tree-shaking/minification.

[ ] Provide dist/item-list-card.js.map sourcemap for debugging.

[ ] manifest.json updated with correct name, version, url, config_flow if needed, and documentation fields.

[ ] HACS metadata (hacs.json) up to date.


[ ] Documentation

[ ] README: clear installation (HACS + manual), minimal and full configuration examples, backend template sensor example, and screenshots.

[ ] Add DEVELOPMENT.md (exists) — update with build & dev instructions.

[ ] Add CHANGELOG.md or follow semantic-release.

[ ] Example YAML templates for the required template sensor(s).


[ ] Examples & screenshots

[ ] Capture and commit screenshots: default view, filtered view, add-to-shopping action, empty state, editor view (if applicable). Place under /docs/images.

[ ] Provide a small example-lovelace.yaml snippet and a demo/ HTML page (optional) that can load the card locally for testing.


[ ] Core features & bug fixes

[ ] Ensure card re-renders predictably when the hash_entity updates; fix race-conditions.

[ ] Verify plus/minus buttons call the correct todo.update_item service with predictable payloads and optimistic UI update (or rolling back on error).

[ ] Correct handling of quantity types (strings vs numbers). Normalize internally to number.

[ ] Empty-state message is clear: "No items found" with hint about filter entity.

[ ] Loading state while entity data is not available.


[ ] Compatibility

[ ] Verify compatibility with the Home Assistant versions supported by HACS (document required minimum HA release).

[ ] Ensure CSS respects both light & dark themes and uses HA design tokens where possible.


[ ] License & legal

[ ] Confirm LICENSE is MIT and that all included code respects licenses.




---

🚀 v1 (high priority after MVP)

[ ] Lovelace visual editor (card editor)

[ ] Implement editor.js so the card can be configured via the Lovelace UI editor (supports all configuration keys and validation).

[ ] Use @polymer or native editor patterns used by modern custom cards (follow examples from popular cards). VERIFY against current HA editor examples.

[ ] Provide field descriptions and default values in the editor.

[ ] Test the editor in HA UI to ensure editing works without YAML mode.


[ ] Localization / i18n

[ ] Add translations/en.json and translations/de.json with every user-facing string (README will list strings to translate).

[ ] Ensure runtime lookup of localized strings used in the card UI via this.hass.localize(...) or equivalent pattern. VERIFY editor strings availability — editor localization may be limited (research required).

[ ] Provide guidelines for community translations and a translations/README.md explaining keys.


[ ] Unit & integration tests

[ ] Set up unit tests (web-test-runner / @open-wc/testing or Vitest with @testing-library/web) for critical rendering logic.

[ ] Tests for: rendering list rows, highlight matches, show_more logic, correct action calls for buttons, hash-entity based re-rendering, and config validation.


[ ] End-to-end tests

[ ] Add Playwright (or Cypress) smoke test that loads a minimal HA UI and checks the card renders and buttons trigger actions.

[ ] Add visual snapshot test for the main states (desktop & mobile widths).


[ ] CI pipeline

[ ] GitHub Actions: lint, test, build on PRs; build & release on tags.

[ ] Automatic build artifact upload (optional) and dist/ generation.


[ ] Accessibility

[ ] Keyboard support for row actions (tabFocusable, Enter/Space triggers).

[ ] ARIA attributes for buttons and lists (aria-label, role where appropriate).

[ ] Focus management for incremental actions (e.g., keep focus on button after action).


[ ] Performance

[ ] Ensure rendering is efficient for large lists (virtualization considered for >100 items).

[ ] Avoid expensive DOM operations on each property update; use Lit's reactive properties correctly.




---

🔧 Development & Implementation details (actionable)

[ ] Editor

[ ] src/editor.ts (or .js) that exports a ItemListCardEditor element using LovelaceElement conventions.

[ ] Map all config options to editor controls: title, entity ids, max items, show_more_buttons, filter_key_buttons, show_origin, hide_add_button, highlight_matches.

[ ] Validate numeric fields and show helpful errors.


[ ] Config validation

[ ] Add a runtime config validator (small function) with helpful thrown errors.

[ ] Optionally use ajv JSON schema for editor validation.


[ ] Translations

[ ] Create translations/en.json with keys (e.g. title, no_items, add_to_shopping, show_more, show_less, origin_label, filter_placeholder).

[ ] Add de.json (German) as minimum second language.

[ ] Document how to add more languages and submit PRs.


[ ] Services and actions

[ ] Centralize all HA service calls into a helper utility (e.g., services.ts).

[ ] Implement optimistic UI updates on button click and revert on failure with error toast.


[ ] Theming & styling

[ ] Expose CSS custom properties for color, row spacing, font-size, icon-size.

[ ] Support card-mod friendly structure and minimal class names.


[ ] State handling

[ ] Use a hash_entity to detect list changes efficiently. Document why both filter_items_entity and hash_entity are required.

[ ] Debounce user-initiated changes if necessary.


[ ] Edge cases

[ ] Missing entities — show helpful card warning.

[ ] Invalid filtered_items format — document expected schema and show debug hint.

[ ] Large quantity values (scientific notation / null / negative) — sanitize and clamp.




---

🌍 Localization (i18n) tasks (detailed)

[ ] Research & verify how Lovelace card/editor localization works for the current HA version and document any limitations (editor may not have full access to hass.localize). (RESEARCH TASK)

[ ] Implement translations under translations/ with en.json and de.json files.

[ ] Localize UI strings in both card and editor (if possible) using this.hass.localize('component.custom_component.key') or this.hass.localize('ui.card.custom.item_list.key') pattern.

[ ] Fallback: Ensure the card defaults to English if a translation is missing.

[ ] Provide translation CONTRIBUTING guide: instruct contributors how to add languages and how to structure keys.


> Note: Custom-integration and Lovelace translation details differ slightly; do a quick read of the Home Assistant developer docs and community posts to ensure the right translations layout and keys. (See developer docs and community discussion.)




---

📚 Documentation & screenshots

[ ] Screenshots (place in /docs/images/)

[ ] Default view (no filter).

[ ] Filtered view (highlighted match).

[ ] Mobile (narrow) view.

[ ] Empty list view.

[ ] Editor view (once editor exists).

[ ] Error / missing entity warning.


[ ] README improvements

[ ] Short intro and one-liner.

[ ] Features (bullet list).

[ ] Example configurations (minimal + full). Keep one copy in README and a examples/ folder with example.yaml files for common set-ups.

[ ] Backend template sensor instructions — copyable full YAML for common use-cases.

[ ] Troubleshooting section: common issues and fixes (e.g. filtered_items schema mismatch).

[ ] Changelog / Releases link.


[ ] DEMO

[ ] Add a demo/ directory with a small static HTML that imports dist/item-list-card.js and demonstrates the card with mock hass object for quick visual checks.




---

🧪 Testing (unit, integration, e2e, visual)

[ ] Unit tests

[ ] Install @open-wc/testing or vitest + @testing-library/web.

[ ] Tests for pure functions (formatters, highlight logic, filter matching).

[ ] Component tests for rendering states and button service calls (mock hass object).


[ ] E2E / Playwright

[ ] Write a Playwright test that launches the demo page and validates core behavior: render list, click plus/minus, open add dialog.


[ ] Visual regression tests

[ ] Add Percy or Playwright snapshot checks for main states.


[ ] CI test runs

[ ] Run unit tests and e2e in GitHub Actions. Fail PRs that break tests.




---

⚙️ CI/CD & release

[ ] GitHub Actions

[ ] lint job.

[ ] test job with Node 20+ matrix (or Node versions you support).

[ ] build job creating dist artifacts and caching node_modules.

[ ] release job integrated with semantic-release or manual tag-based release. Optionally attach dist to the release.


[ ] HACS publishing

[ ] Ensure hacs.json is correct and includes name, content_in_root, issues, repository, zip_release etc.

[ ] Add a short HACS installation blurb to README.


[ ] Releases

[ ] Adopt semantic versioning and keep CHANGELOG.md up to date.

[ ] Draft standard release notes template in TEMPLATE.md (exists) and use it for releases.




---

♿ Accessibility

[ ] Keyboard navigation for interactive controls.

[ ] ARIA labels on buttons (use localized text where applicable).

[ ] Contrast checks for text, icons and highlight backgrounds.

[ ] Screen reader smoke test using NVDA/VoiceOver guidelines.



---

📈 Performance & large lists

[ ] Benchmark rendering with 100/500/1000 items.

[ ] Virtualize or use lazy rendering if necessary for extremely large lists.

[ ] Avoid expensive operations (regex on every render) — memoize where possible.



---

🧑‍🤝‍🧑 Community & contributor experience

[ ] Issue templates for bug, feature, and question.

[ ] PR template with checklist linking to this TODO (automatically runs the checks mentally).

[ ] CONTRIBUTING.md describing setup, how to run tests, how to add translations, coding style.

[ ] Roadmap in ROADMAP.md or GitHub Projects board.



---

✨ Nice-to-haves / Stretch goals (v2+)

[ ] Inline quantity editing (spinbox) instead of just plus/minus.

[ ] Drag-and-drop reordering of filtered results (if meaningful).

[ ] Export / import list view as CSV.

[ ] Smart suggestions (predict next item) using historical data (privacy careful).

[ ] Integrate with other list-like entities (not just todo.*) like shopping_list, input_selects, MQTT, external APIs.

[ ] Storybook for component showcase.



---

🔎 Risks / open questions

[ ] Editor localization: Some community posts indicate the editor might have limitations pulling translated strings. Research and verify for the HA version targeted. (RESEARCH).

[ ] API drift: HA frontend APIs change; pin expected compatibility and test against multiple HA versions.

[ ] Template sensor requirement: Card requires a backend template sensor — how can we make this easier for non-technical users? Provide templates and a step-by-step guide.



---

✅ Acceptance criteria (what "done" looks like)

[ ] Users can install via HACS and manual method and the dist works out of the box.

[ ] Card is configurable via the Lovelace UI editor (fields cover all options).

[ ] English + German translations present and used in UI; fallback to English works.

[ ] Unit and at least one E2E test exist and run in CI.

[ ] README has usage examples, screenshots, and troubleshooting tips.

[ ] CI builds on push & PR; releases are automated/manual-per-tag and include a changelog.



---

Staging roadmap (recommended order)

1. Fix critical bugs & ensure dist build is correct.


2. Implement editor (makes adoption far easier).


3. Add README screenshots and example YAMLs.


4. Implement translations (en + de) and document how to contribute languages.


5. Add unit tests and basic Playwright smoke test.


6. Add GitHub Actions and lint/test/build pipeline.


7. Polish accessibility and performance.


8. Publish to HACS and announce in community channels.
