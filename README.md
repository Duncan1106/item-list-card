# Item List Card for Home Assistant

Give your Home Assistant dashboards some clarity with `custom:item-list-card`—a sleek Lovelace card that lets you filter and view list items on demand.

##  Why use this card?

Imagine focusing only on what matters:
-  **Live filter power**: Filter your list with real-time text input (via an `input_text` entity).
-  **Dashboard clarity**: Show your shopping list only when an item matches the filter.
-  **Full Lovelace control**: No extra integrations required—just Home Assistant and your todo/shopping list entity.
-  **Flexible install**: Comes with both HACS and manual install options.

##  Installation

### Option A: via HACS
1. Add this repo as a **Frontend Custom Repository** in HACS.
2. Install the **Item List Card**.
3. HACS should auto-add the resource. If not:
    ```yaml
    url: /hacsfiles/item-list-card/dist/item-list-card.js
    type: module
    ```
4. Use the card in your dashboard:
    ```yaml
    type: 'custom:item-list-card'
    filter_items_entity: sensor.todo_filtered_items
    shopping_list_entity: todo.shopping_list
    filter_entity: input_text.todo_filter
    ```

### Option B: Manual install
1. Copy `dist/item-list-card.js` to your Home Assistant's `/www/` folder.
2. Add to Lovelace resources:
    ```yaml
    url: /local/item-list-card.js
    type: module
    ```
3. Add card config to your dashboard (same as above).

##  Configuration Options

| Option                | Type   | Required | Description                                 |
|----------------------|--------|----------|---------------------------------------------|
| `type`               | string | Yes      | Must be `custom:item-list-card`              |
| `filter_items_entity`| entity | Yes      | Entity that provides the filtered list       |
| `shopping_list_entity` | entity | Yes    | Target to-do or shopping list entity         |
| `filter_entity`      | entity | Yes      | `input_text` entity used to input filter     |

##  Example Usage
You could mix and match your entities like this:
```yaml
type: 'custom:item-list-card'
filter_items_entity: sensor.grocery_filter_list
shopping_list_entity: todo.grocery
filter_entity: input_text.grocery_filter
