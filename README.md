# Item List Card for Home Assistant

A custom Lovelace card to display filtered items aggregated from multiple `todo.*` lists—all handled with finesse by your setup.

This repository contains a sleek, reactive frontend, but it leans on a robust backend to truly shine. You'll need a template trigger sensor (example provided below) to collect, filter, and surface the data.

---

## Table of Contents

1. [Why this card?](#why-this-card)  
2. [Installation](#installation)  
   - [Option A: via HACS](#option-a-via-hacs)  
   - [Option B: Manual Install](#option-b-manual-install)  
3. [Frontend Setup](#frontend-setup)  
   - [Minimal config](#minimal-config)  
   - [Full config](#full-config)  
4. [Backend Setup (Required)](#backend-setup-required)  
5. [Troubleshooting checklist (fast debug)](#troubleshooting-checklist-fast-debug)  



## Why this card?

- **Effortless filtering**: Type into an `input_text` helper to slice through your todo items.
- **Unified view**: Aggregate multiple lists—pantry, freezer, cat food—into one dynamic sensor.
- **UI-first design**: Lightweight, flexible, and tailor-made for dashboards.

---

## Installation

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

This card is purely frontend. Without the backend aggregation and filtering, it’s just an empty shell:

[Template Code](TEMPLATE.md)



## Troubleshooting checklist (fast debug)
If the card renders blank or misbehaves, walk this checklist:

1. **Resource not loaded**  
   - Check Browser Developer Tools → Console for 404 or module load errors.  
   - Confirm Card is loaded in the Resource Tab in Homeassistant

2. **Sensor shape incorrect**  
   - Developer Tools → States → open the configured `filter_items_entity`.  
   - Verify `attributes.filtered_items` exists and is an array of objects with `id`, `name`, `quantity`.

3. **Hash flicker**  
   - Check `hash_entity` value stability. If it changes every update, the frontend will re-render unnecessarily.

4. **Service calls not reflected**  
   - Confirm the service call updates the underlying data source. If it mutates something else, the card won't see the change.

Developer tip: temporarily set `attributes.items` to a small static JSON in Developer Tools to test rendering independent of templates.
