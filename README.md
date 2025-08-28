- In Lovelace Configuration > Resources add:
URL: /local/item-list-card.js
Type: module
- Add card YAML:
type: 'custom:item-list-card'
filter_items_entity: sensor.todo_filtered_items
shopping_list_entity: todo.shopping_list
filter_entity: input_text.todo_filter
title: 'ToDo List'
