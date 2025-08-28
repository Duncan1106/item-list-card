- 

Install via HACS:


	1. Add this repository as a Custom Repository in HACS (category "Frontend").
	2. Install "Item List Card" in HACS.
	3. In Lovelace -> Resources add the module if HACS didn't already:
URL: /hacsfiles/item-list-card/dist/item-list-card.js
Type: module
	4. Use the card in Lovelace:
type: 'custom:item-list-card'
filter_items_entity: sensor.todo_filtered_items
shopping_list_entity: todo.shopping_list
filter_entity: input_text.todo_filter
- 
Manual install:


	1. Copy dist/item-list-card.js to your Home Assistant /www/ folder.
	2. Add resource /local/item-list-card.js as type module.
	3. Add the card config.
