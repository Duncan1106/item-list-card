# Item List Card for Home Assistant

A custom Lovelace card to display filtered items aggregated from multiple `todo.*` lists—all handled with finesse by your setup.

This repository contains a sleek, reactive frontend, but it leans on a robust backend to truly shine. You'll need a template sensor and automation to collect, filter, and surface the data. The full working backend example is tucked away below.

---

##  Why this card?

- **Effortless filtering**: Type into an `input_text` helper to slice through your todo items.
- **Unified view**: Aggregate multiple lists—pantry, freezer, cat food—into one dynamic sensor.
- **UI-first design**: Lightweight, flexible, and tailor-made for dashboards.

---

##  Installation

### Option A: via HACS

1. Add this repo as a **Frontend Custom Repository** in HACS.
2. Install **Item List Card**.
3. Confirm the resource is loaded in Lovelace:
    ```yaml
    url: /hacsfiles/item-list-card/dist/item-list-card.js
    type: module
    ```

### Option B: Manual Install

1. Copy `dist/item-list-card.js` to your `/www/` folder.
2. Add to Lovelace:
    ```yaml
    url: /local/item-list-card.js
    type: module
    ```

---

##  Backend Setup (Required)

This card is purely frontend. Without the backend aggregation and filtering, it’s just an empty shell. Expand below for the full YAML magic:

<details>
<summary>Click to expand the full template sensor example</summary>

```yaml
template:
    - trigger:
          - platform: state
            entity_id: input_text.search_todo_list
          - platform: time_pattern
            seconds: "/1"
          - platform: state
            entity_id:
              - todo.kellervorrate
              - todo.kellervorrate_katzenfutter
              - todo.kellervorrate_safe
              - todo.kellervorrate_marmelade_selbstgemachtes
              - todo.kuhltruhe_keller
              - todo.kuhltruhe_garage
        action:
          - action: todo.get_items
            data:
              status: needs_action
            target:
              entity_id:
                - todo.kellervorrate
                - todo.kellervorrate_safe
                - todo.kellervorrate_katzenfutter
                - todo.kellervorrate_marmelade_selbstgemachtes
                - todo.kuhltruhe_keller
                - todo.kuhltruhe_garage
            response_variable: all_todo_items
        sensor:
          - name: "Kellervorrate Combined Filtered Items"
            unique_id: kellervorrate_combined_filtered_items
            state: >
                {% set input = states('input_text.search_todo_list') | default('') | lower %}
                {% set has_filter = 'todo:' in input %}
                {% set filter_key = (input.split('todo:')[1].split(' ')[0]) if has_filter else '' %}
                {% set search_term = input.split('todo:' ~ filter_key)[1] | trim if has_filter else input %}
                
                {% set lists = [
                  'todo.kellervorrate',
                  'todo.kellervorrate_safe',
                  'todo.kellervorrate_katzenfutter',
                  'todo.kellervorrate_marmelade_selbstgemachtes',
                  'todo.kuhltruhe_keller',
                  'todo.kuhltruhe_garage'
                ] %}
                
                {% set filtered_lists = lists  
                  | select('search', filter_key)  
                  | list if filter_key else lists %}  
                
                {% if filtered_lists | length == 0 %}
                  {% set filtered_lists = lists %}
                {% endif %}
                
                {% if all_todo_items is defined %}
                  {% set count = namespace(total=0) %}
                  {% for list_id in filtered_lists %}
                    {% set items = all_todo_items[list_id]['items'] | default([], true) %}
                    {% for item in items %}
                      {% set terms = search_term.split() %}
                      {% if search_term == '' or (terms | select('in', (item.summary | lower)) | list | count == terms | count) %}
                        {% set count.total = count.total + 1 %}
                      {% endif %}
                    {% endfor %}
                  {% endfor %}
                
                  {{ count.total }}
                {% else %}
                  0
                {% endif %}
            attributes:
              source_map: >
                {
                  "1": "todo.kellervorrate",
                  "2": "todo.kellervorrate_safe",
                  "3": "todo.kellervorrate_katzenfutter",
                  "4": "todo.kellervorrate_marmelade_selbstgemachtes",
                  "5": "todo.kuhltruhe_keller",
                  "6": "todo.kuhltruhe_garage"
                }
              filtered_items: >
                {% set input = states('input_text.search_todo_list') | default('') | lower %}
                {% set has_filter = 'todo:' in input %}
                {% set filter_key = (input.split('todo:')[1].split(' ')[0]) if has_filter else '' %}
                {% set search_term = input.split('todo:' ~ filter_key)[1] | trim if has_filter else input %}
    
                {% set lists = [
                  'todo.kellervorrate',
                  'todo.kellervorrate_safe',
                  'todo.kellervorrate_katzenfutter',
                  'todo.kellervorrate_marmelade_selbstgemachtes',
                  'todo.kuhltruhe_keller',
                  'todo.kuhltruhe_garage'
                ] %}
                
                {% set source_map = {
                  'todo.kellervorrate': 1,
                  'todo.kellervorrate_safe': 2,
                  'todo.kellervorrate_katzenfutter': 3,
                  'todo.kellervorrate_marmelade_selbstgemachtes': 4,
                  'todo.kuhltruhe_keller': 5,
                  'todo.kuhltruhe_garage': 6
                } %}
                
                {% set filtered_lists = lists
                  | select('search', filter_key)
                  | list if filter_key else lists %}
                
                {% if filtered_lists | length == 0 %}
                  {% set filtered_lists = lists %}
                {% endif %}
                            
                {% set combined = namespace(items=[]) %}
                
                {% if all_todo_items is defined %}
                  {% for list_id in filtered_lists %}
                    {% set items = all_todo_items[list_id]['items'] | default([], true) %}
                    {% for item in items %}
                      {% if item.summary is defined and item.summary is string %}
                        {% set terms = search_term.split() %}
                        {% if (search_term == '' or (terms | select('in', (item.summary | lower)) | list | count == terms | count)) %}
                          {% set minimal_item = {
                            'u': item.uid,
                            's': item.summary,
                            'd': item.description,
                            'c': source_map[list_id]
                          } %}
                          {% set combined.items = combined.items + [minimal_item] %}
                        {% endif %}
                      {% endif %}
                    {% endfor %}
                  {% endfor %}
                
                  {# combined.items #}
                  
                  {# ---- SORTING STEP ---- #}
                  {% set sorted_items = combined.items | sort(attribute='s', case_sensitive=False) %}
                  {{ sorted_items }}
                  
                {% else %}
                  []
                {% endif %}
