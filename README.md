# Item List Card for Home Assistant

A custom Lovelace card to display filtered items aggregated from multiple `todo.*` lists—all handled with finesse by your setup.

This repository contains a sleek, reactive frontend, but it leans on a robust backend to truly shine. You'll need a template trigger sensor (example provided below) to collect, filter, and surface the data.

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

## Frontend Setup

### Minimal config

```yaml
type: custom:item-list-card
filter_items_entity: sensor.kellervorrate_combined_filtered_items
hash_entity: sensor.kellervorrate_combined_filtered_items_hash
shopping_list_entity: todo.einkaufsliste
filter_entity: input_text.search_todo_list
```

### Full config

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

## Backend Setup (Required)

This card is purely frontend. Without the backend aggregation and filtering, it’s just an empty shell. Expand below for the full YAML magic:

<details>
<summary>Click to expand the full template trigger sensor example</summary>

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
            {% set lists = {
              "1": "todo.kellervorrate",
              "2": "todo.kellervorrate_safe",
              "3": "todo.kellervorrate_katzenfutter",
              "4": "todo.kellervorrate_marmelade_selbstgemachtes",
              "5": "todo.kuhltruhe_keller",
              "6": "todo.kuhltruhe_garage"
            } %}

            {% set ns = namespace(source_map={}) %}

            {% for key, entity_id in lists.items() %}
              {# get raw friendly name (or build fallback from entity_id) #}
              {% set fn_raw = state_attr(entity_id, 'friendly_name')
                | default(entity_id.split('.')[-1] | replace('_', ' ') | title) %}

              {# remove straight and smart quotes, collapse double spaces and trim #}
              {% set fn = fn_raw
                | replace('"', '')
                | replace("'", '')
                | replace('“', '')
                | replace('”', '')
                | replace('  ', ' ')
                | replace('’', '')
                | trim %}

              {% set ns.source_map = ns.source_map | combine({
                key: {
                  'entity_id': entity_id,
                  'friendly_name': fn
                }
              }) %}
            {% endfor %}

            {{ ns.source_map | to_json }}
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

  - trigger: 
      - platform: state
        entity_id: sensor.kellervorrate_combined_filtered_items
      - platform: homeassistant
        event: start
    sensor:
      - name: "Kellervorrate Combined Filtered Items Hash"
        unique_id: kellervorrate_combined_filtered_items_hash
        state: >-
            {{ 
                (
                  (state_attr('sensor.kellervorrate_combined_filtered_items', 'filtered_items') | default({}, true) | to_json) 
                    ~
                  (state_attr('sensor.kellervorrate_combined_filtered_items', 'source_map') | default({}, true) | to_json) 
                ) | md5
            }}
```

</details>
