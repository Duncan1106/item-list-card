# Development Guide for Item List Card

This guide covers setting up the development environment, building the project, testing, understanding the code structure, and contributing to the repository.

## Prerequisites

- **Node.js**: Version 14 or higher. Install from [nodejs.org](https://nodejs.org/).
- **Home Assistant**: A running instance for testing the card. Recommended to use a development environment like a Docker container or virtual environment.
- **Git**: For cloning the repository.
- **VS Code** (optional but recommended): With extensions for JavaScript/TypeScript and YAML for Home Assistant configuration.

## Setup

1. **Clone the Repository**:

   ```bash
   git clone https://github.com/Duncan1106/item-list-card.git
   cd item-list-card
   ```

2. **Install Dependencies**:

   Run the following command to install Node.js dependencies:

   ```bash
   npm install
   ```

3. **Home Assistant Development Setup**:
   - Add the repository as a custom repository in HACS (for testing via HACS).
   - Or, manually copy the built `dist/item-list-card.js` to your HA `/www/` folder.
   - Ensure you have the required backend entities (todo lists, input_text helper, template sensors) set up as described in [TEMPLATE.md](TEMPLATE.md).

## Building the Project

The project uses [esbuild](https://esbuild.github.io/) for bundling and minification.

- **Development Build** (unminified, with sourcemaps):

  ```bash
  npm run build:dev
  ```

  Outputs to `dist/item-list-card.js`.

- **Production Build** (minified):

  ```bash
  npm run build
  ```

  Outputs to `dist/item-list-card.js`.

- **Clean Dist Folder**:

  ```bash
  npm run clean
  ```

After building, add the JS file as a resource in Home Assistant Lovelace:

```yaml
url: /hacsfiles/item-list-card/dist/item-list-card.js  # If using HACS
# or
url: /local/item-list-card.js  # If manual install
type: module
```

## Testing

1. **Local Testing**:
    - Build the project (`npm run build:dev`).
    - Add the card to a Lovelace dashboard.
    - Use the Developer Tools in HA to mock sensor states (e.g., set `sensor.kellervorrate_combined_filtered_items` attributes).
    - Interact with the card and check browser console for errors.

2. **Unit Testing**:
    The modular architecture enables comprehensive unit testing of individual functions. Tests are organized by module:

    - **utils.test.js**: Test utility functions (`debounce`, `highlightParts`, `safeParseJSON`, etc.)
    - **data-handlers.test.js**: Test data manipulation logic (`updateOrCompleteItem`, `setFilterService`, etc.)
    - **render-helpers.test.js**: Test rendering utilities (`renderQuantityControls`, `renderItemRow`)

    Run tests with:
    ```bash
    npm test
    ```

    Example test structure:
    ```javascript
    // utils.test.js
    import { debounce, highlightParts } from './src/utils.js';

    describe('debounce', () => {
      it('should delay function execution', (done) => {
        const fn = jest.fn();
        const debounced = debounce(fn, 100);
        debounced();
        expect(fn).not.toHaveBeenCalled();
        setTimeout(() => {
          expect(fn).toHaveBeenCalled();
          done();
        }, 150);
      });
    });
    ```

3. **Integration Testing**:
    - Set up the full backend (todo entities, template sensors).
    - Test filtering, adding items, and UI interactions.
    - Use browser dev tools to inspect rendering and performance.

## Code Structure

### Core Components

- **src/item-list-card.js** [`src/item-list-card.js`](src/item-list-card.js): Main entry point. Defines the custom Lit element `ItemListCard`. Handles configuration, state management, and orchestrates interactions between modules.
  - Key methods: `render()`, `shouldUpdate()`, `setConfig()`.
  - Uses Lit directives for reactive updates.
  - Reduced from ~1075 lines to ~512 lines after modularization.

### Modular Architecture

The codebase has been refactored into focused modules for better maintainability:

- **src/utils.js** [`src/utils.js`](src/utils.js): Shared utility functions used across the application.
  - `debounce()`: Function debouncing utility
  - `showToast()`: Home Assistant toast notification helper
  - `confirmDialog()`: User confirmation dialog wrapper
  - `callService()`: Home Assistant service call wrapper with error handling
  - `highlightParts()`: Text highlighting for search matches

- **src/data-handlers.js** [`src/data-handlers.js`](src/data-handlers.js): Data manipulation and state management logic.
  - `safeParseJSON()`: Safe JSON parsing with fallback
  - `computeItemsFingerprint()`: Generate hash for change detection
  - `isNumeric()`: Numeric string validation
  - `normalizeTodoText()`: Text normalization for todo items
  - `parseShowMoreButtons()`: Parse comma-separated button configuration
  - Item update functions: `updateOrCompleteItem()`, `confirmAndComplete()`, `addToShoppingList()`
  - Filter management: `setFilterService()`, `clearFilterPreservingTodoKey()`, `onFilterKeyButtonClick()`
  - Input handling: `handleFilterInputChange()`, `onInputKeydown()`, `addFilterTextToShoppingList()`
  - Display management: `showMore()`

- **src/render-helpers.js** [`src/render-helpers.js`](src/render-helpers.js): UI rendering utilities.
  - `renderQuantityControls()`: Increment/decrement controls for numeric items
  - `renderItemRow()`: Individual item row rendering with all controls

- **src/styles.js** [`src/styles.js`](src/styles.js): CSS styles for the card, including layout, buttons, and highlighting.

### Build Output

- **dist/item-list-card.js**: Bundled output for production.

### Other Files

- [package.json](package.json): Dependencies (Lit for web components) and build scripts.
- [hacs.json](hacs.json): HACS integration metadata.
- [manifest.json](manifest.json): Home Assistant integration info.
- [TEMPLATE.md](TEMPLATE.md): Backend template sensor configuration.

The card is built with [Lit](https://lit.dev/) for lightweight web components, targeting ES2020. The modular architecture improves testability, maintainability, and reusability of individual components.

## Contribution Workflow

1. **Fork the Repository**: Create a fork on GitHub.

2. **Create a Branch**:

   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make Changes**:
   - Implement features or fixes.
   - Build and test locally.
   - Update documentation if needed (README.md, DEVELOPMENT.md).

4. **Commit Changes**:
   - Use descriptive commit messages.
   - Follow conventional commits if possible (e.g., `feat: add new filter option`).

5. **Push and Pull Request**:

   ```bash
   git push origin feature/your-feature-name
   ```

   - Open a PR against the main branch.
   - Describe the changes, reference issues if applicable.
   - Ensure CI passes (add if not present).

6. **Code Style**:
   - Use ESLint/JSHint (configured in [.jshintrc](src/.jshintrc)).
   - Keep code modular and reactive with Lit.

## Releasing

- Update version in [package.json](package.json) and [manifest.json](manifest.json).
- Run `npm run build`.
- Create a Git tag and push.
- HACS will handle distribution if configured.

For questions, open an issue on GitHub.
