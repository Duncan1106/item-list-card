# Item List Card for Home Assistant

A custom Lovelace card that displays filtered and aggregated items from multiple `todo.*` lists. It provides an interactive, UI-first experience for managing shopping lists, inventory, or tasks in Home Assistant.

This frontend card requires a backend template sensor to aggregate and filter data from your todo lists. See [Backend Setup](#backend-setup) for details.

[![HACS](https://img.shields.io/badge/HACS-Custom%20Lovelace%20Cards-blue.svg)](https://github.com/hacs/integration)

## Features

- **Dynamic Filtering**: Search across todo items using an `input_text` helper. Supports keyword matching and category-based filters (e.g., "todo:kellervorrate apples").
- **Aggregated Views**: Combine items from multiple todo lists (e.g., pantry, freezer, pet food) into a single, unified display.
- **Interactive UI**: Add items to a shopping list with one click, show origins, highlight matches, and customize "show more" options.
- **Customizable**: Configure titles, max items, buttons for quick filters, icons, and more.
- **Lightweight**: Built with [Lit](https://lit.dev/) for efficient rendering in Lovelace dashboards.
- **Responsive**: Adapts to dashboard layouts, with options for hiding add buttons or showing origins.

## Screenshots

*(Add screenshots here to demonstrate the card in action, e.g., default view, filtered results, adding to shopping list. Use tools like browser dev tools or HA's screenshot feature to capture.)*

Example: A dashboard showing the card with filtered "kellervorrate" items.

## Installation

### Option A: Via HACS (Recommended)

1. In HACS > Frontend, search for "Item List Card" or add this repository as a custom repository:
   - Go to HACS > Integrations > Custom repositories.
   - Add `https://github.com/Duncan1106/item-list-card` with category "Lovelace / Dashboards".
   - Click "Add".

2. Install "Item List Card".

3. Add the resource to Lovelace resources (Settings > Dashboards > Resources):
   ```yaml
   url: /hacsfiles/item-list-card/dist/item-list-card.js
   type: module
   ```

### Option B: Manual Installation

1. Download the latest release or build the project (see [Development Guide](DEVELOPMENT.md)).
2. Copy `dist/item-list-card.js` to your Home Assistant `/config/www/` folder (create if needed).

3. Add the resource to Lovelace:
   ```yaml
   url: /local/item-list-card.js
   type: module
   ```

Restart Home Assistant after installation.

## Configuration

Add the card to your Lovelace dashboard using the UI editor or YAML.

### Minimal Configuration

```yaml
type: custom:item-list-card
filter_items_entity: sensor.kellervorrate_combined_filtered_items
hash_entity: sensor.kellervorrate_combined_filtered_items_hash
shopping_list_entity: todo.einkaufsliste
filter_entity: input_text.search_todo_list
```

### Full Configuration

```yaml
type: custom:item-list-card
title: Kellervorräte
filter_items_entity: sensor.kellervorrate_combined_filtered_items
hash_entity: sensor.kellervorrate_combined_filtered_items_hash
shopping_list_entity: todo.einkaufsliste
filter_entity: input_text.search_todo_list
max_items_without_filter: 15
max_items_with_filter: 15
show_more_buttons: 10,15,20,25
show_origin: true
hide_add_button: false
highlight_matches: true
filter_key_buttons:
  - name: Kellervorräte
    icon: mdi:warehouse
    filter_key: kellervorrate
  - name: Kellervorrat (Safe)
    icon: mdi:safe
    filter_key: safe
  - name: Katzenfutter
    icon: mdi:cat
    filter_key: katzen
  - name: Marmelade & Eingemachtes
    icon: mdi:fruit-cherries
    filter_key: marmelade
  - name: Kühltruhe (Keller)
    icon: mdi:fridge
    filter_key: kuhltruhe_k
  - name: Kühltruhe (Garage)
    icon: mdi:garage
    filter_key: kuhltruhe_g
```

#### Configuration Options

- `title` (string, optional): Card title.
- `filter_items_entity` (required): Template sensor providing `filtered_items` attribute (array of `{id, name, quantity, origin}`).
- `hash_entity` (required): Sensor for stable hashing to prevent unnecessary re-renders.
- `shopping_list_entity` (required): Todo entity to add items to (e.g., shopping list).
- `filter_entity` (required): `input_text` helper for search input.
- `max_items_without_filter` (int, optional, default: 15): Max items shown without filter.
- `max_items_with_filter` (int, optional, default: 15): Max items shown with filter.
- `show_more_buttons` (array of ints, optional): Options for "Show More" buttons (e.g., 10,15,20,25).
- `show_origin` (bool, optional, default: false): Display item source (e.g., list name).
- `hide_add_button` (bool, optional, default: false): Hide the "Add to Shopping" button.
- `highlight_matches` (bool, optional, default: true): Highlight search matches in item names.
- `filter_key_buttons` (array of objects, optional): Quick filter buttons with `name`, `icon` (mdi icon), `filter_key`.

## Backend Setup (Required)

The card relies on a template sensor to fetch, filter, and aggregate todo items. Create the following entities:

1. **Todo Lists**: Create multiple `todo.*` entities (e.g., `todo.kellervorrate`, `todo.kellervorrate_safe`).

2. **Input Text Helper**: For filtering (e.g., `input_text.search_todo_list`).

3. **Template Sensor**: Use the configuration in [TEMPLATE.md](TEMPLATE.md) to create:
   - `sensor.kellervorrate_combined_filtered_items`: Provides state (count) and attributes (`filtered_items`, `source_map`).
   - `sensor.kellervorrate_combined_filtered_items_hash`: MD5 hash for stability.

Triggers on input changes, todo updates, or every second. Adjust entity IDs to match your setup.

## Usage Examples

- **Basic Inventory View**: Configure with pantry and freezer todos. Use the search input for "milk" to show matches.
- **Category Filtering**: Type "todo:katzen" to filter cat food items only.
- **Shopping Integration**: Click "+" on an item to add it to `todo.einkaufsliste`.
- **Dashboard Integration**: Embed in a vertical stack with the filter input above the card.

For advanced usage, customize `filter_key_buttons` for one-click category switches.

## Troubleshooting

If the card doesn't render or behaves unexpectedly:

1. **Resource Loading Issues**:
   - Check browser console (F12) for 404 errors on the JS file.
   - Verify the resource is added in Lovelace Resources and restart HA.

2. **Empty or Incorrect Data**:
   - In HA Developer Tools > States, inspect `filter_items_entity`.
   - Ensure `attributes.filtered_items` is a valid JSON array of objects with `id`, `name`, etc.
   - Test by manually setting the attribute to static JSON: `[{"id":1,"name":"Test Item","quantity":1}]`.

3. **Flickering or Re-renders**:
   - Check `hash_entity` state. It should stabilize after initial load.
   - Ensure backend triggers aren't firing excessively (e.g., optimize time_pattern).

4. **Service Calls Not Working**:
   - Verify the shopping list entity accepts `todo.add_item` services.
   - Check automation logs for errors in adding items.

5. **Filter Not Responding**:
   - Confirm `filter_entity` state changes trigger the template sensor.
   - Test input with simple terms like "apple".

For backend issues, review template errors in HA logs.

## Contributing

Contributions are welcome! See the [Development Guide](DEVELOPMENT.md) for setup, building, and workflow details.

- Fork the repo.
- Create a feature branch.
- Build and test changes.
- Submit a pull request.

Report bugs or request features via GitHub Issues.

## License

MIT License. See [LICENSE](LICENSE) for details.

---

*Built with ❤️ for Home Assistant users. Questions? Open an issue!*
