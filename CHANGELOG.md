# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project uses date-based tags (YYYY.MM.DD) for releases.

## [2025.10.3] - 2025-10-03

### Added
- Overhauled README.md with comprehensive structure: introduction, features list, screenshots placeholder, HACS/manual installation guides, minimal/full configuration examples for frontend (with options like max_items, filter_key_buttons), backend setup referencing TEMPLATE.md, usage examples, troubleshooting checklist, and contributing section linking to DEVELOPMENT.md.
- Created DEVELOPMENT.md as dedicated developer guide: prerequisites (Node.js, HA, Git), setup (clone, npm install), building (dev/prod scripts from package.json), testing (local, unit, integration), code structure (Lit-based, key files like src/item-list-card.js, src/styles.js), contribution workflow (fork, branch, PR), and releasing.
- Created GitHub Actions workflow in .github/workflows/release.yml for production builds on release (minified JS upload).
- Implemented automatic changelog appending in release workflow using release notes.

### Fixed
- Key button active/pressed state styling (issue #46): _isActiveButton now correctly detects matching filters (e.g., "todo:marmelade " activates 'marmelade' button), applying 'active' class and visual styles (darker background, translateY(1px) sink effect) via CSS in src/styles.js.
- Variable scoping in _updateFilterTextActual to prevent ReferenceError on error revert.
- Markdown linting issues (MD031/MD040) in DEVELOPMENT.md: added language tags (```bash, ```yaml) to fenced code blocks and ensured blank lines around them in list items.

### Other
- Removed temporary debug logs/alerts/placeholder from src/item-list-card.js.
- Updated release workflow to use 'npm run build' for minified production releases (removes logs).

## [2025.10.03] - 2025-10-03

### Added

### Changed

### Fixed

### Removed

[2025.10.03]: https://github.com/Duncan1106/item-list-card/releases/tag/2025.10.03

### Release Notes
## What's Changed
* add logs to _isActiveButton for debug by @Duncan1106 in https://github.com/Duncan1106/item-list-card/pull/64
* use alert istaed of console.log by @Duncan1106 in https://github.com/Duncan1106/item-list-card/pull/65
* Add 2025-10-03 CHANGELOG; update item-list-card logs and highlighting by @Duncan1106 in https://github.com/Duncan1106/item-list-card/pull/66


**Full Changelog**: https://github.com/Duncan1106/item-list-card/compare/2025.10.3...2025.10.03

## [Unreleased]

### Added

### Changed

### Fixed

### Removed

[2025.10.03]: https://github.com/Duncan1106/item-list-card/releases/tag/2025.10.03
