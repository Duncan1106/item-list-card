```yaml
template:
  - sensor:
      - name: "Todo Lists Config"
        unique_id: todo_lists_config
        state: "static"
        attributes:
          todo_lists: >-
            ['todo.kellervorrate', 'todo.kellervorrate_katzenfutter', 'todo.kellervorrate_safe', 'todo.kellervorrate_marmelade_selbstgemachtes', 'todo.kuhltruhe_keller', 'todo.kuhltruhe_garage']
  - trigger:
      - platform: state
        entity_id: input_text.search_todo_list
      - platform: time_pattern
        seconds: "/1"
      - platform: state
        entity_id: &todo_lists
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
          entity_id: *todo_lists
        response_variable: all_todo_items
    sensor:
      - name: "Kellervorrate Combined Filtered Items"
        unique_id: kellervorrate_combined_filtered_items
        state: >
            {% set input = states('input_text.search_todo_list') | default('') | lower %}
            {% set has_filter = 'todo:' in input %}
            {% set filter_key = (input.split('todo:')[1].split(' ')[0]) if has_filter else '' %}
            {% set search_term = input.split('todo:' ~ filter_key)[1] | trim if has_filter else input %}
            
            {% set lists = state_attr('sensor.todo_lists_config', 'todo_lists') | default([]) %}
            
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
            {% set lists = state_attr('sensor.todo_lists_config', 'todo_lists') | default([]) %}

            {% set ns = namespace(source_map={}) %}

            {% for entity_id in lists %}
              {# get raw friendly name (or build fallback from entity_id) #}
              {% set fn_raw = state_attr(entity_id, 'friendly_name')
                | default(entity_id.split('.')[-1] | replace('_', ' ') | title, true) %}

              {# remove straight and smart quotes, collapse double spaces and trim #}
              {% set fn = fn_raw
                | replace('"', '')
                | replace("'", '')
                | replace('“', '')
                | replace('”', '')
                | replace('’', '')
                | regex_replace('\\s+', ' ')
                | trim %}

              {% set ns.source_map = ns.source_map | combine({
                (loop.index|string): {
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

            {% set lists = state_attr('sensor.todo_lists_config', 'todo_lists') | default([]) %}
            
            {% set ns2 = namespace(index_map={}) %}
            {% for entity_id in lists %}
              {% set ns2.index_map = ns2.index_map | combine({ (entity_id): loop.index }) %}
            {% endfor %}
            {% set list_index = ns2.index_map %}

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
                        'c': list_index[list_id]
                      } %}
                      {% set combined.items = combined.items + [minimal_item] %}
                    {% endif %}
                  {% endif %}
                {% endfor %}
              {% endfor %}
            
              {# combined.items #}
              
              {# ---- SORTING STEP ---- #}
              {% set sorted_items = combined.items | sort(attribute='s', case_sensitive=False) %}
              {{ sorted_items | to_json}}
              
            {% else %}
              []
            {% endif %}

  - trigger: 
      - platform: state
        entity_id: sensor.kellervorrate_combined_filtered_items
      - platform: state
        entity_id: sensor.kellervorrate_combined_filtered_items
        attribute: filtered_items
      - platform: homeassistant
        event: start
    sensor:
      - name: "Kellervorrate Combined Filtered Items Hash"
        unique_id: kellervorrate_combined_filtered_items_hash
        state: >-
            {{ 
                (
                  (state_attr('sensor.kellervorrate_combined_filtered_items', 'filtered_items') | default([]) | to_json) 
                    ~
                  (state_attr('sensor.kellervorrate_combined_filtered_items', 'source_map') | default({}) | to_json) 
                ) | md5
            }}
```
