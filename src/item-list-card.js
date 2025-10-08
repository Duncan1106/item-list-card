import { LitElement, html } from 'lit';
import { styles } from './styles.js';
import { debounce, confirmDialog } from './utils.js';
import { safeParseJSON, computeItemsFingerprint } from './dataUtils.js';
import { setFilterService, updateOrCompleteItem, addFilterTextToShoppingList, addToShoppingList } from './hassServices.js';
import { parseShowMoreButtons, renderItemRow } from './renderers.js';

class ItemListCard extends LitElement {
  static properties = {
    hass: {},
    config: {},
    _cachedItems: { state: true },
    _cachedSourceMap: { state: true },
    _displayLimit: { state: true },
    _filterValue: { state: true },
    _pendingUpdates: { state: true },
    _lastItemsHash: { state: false },
  };

  static styles = styles;

  constructor() {
    super();
    this._cachedItems = [];
    this._cachedSourceMap = {};
    this._filterValue = '';
    this._lastItemsHash = '';
    this._debouncedSetFilter = debounce(async (prev, val) => {
      try {
        await setFilterService(this.hass, this.config, val, this);
      } catch (err) {
        // Revert on failure
        this._filterValue = prev;
        this.requestUpdate();
      }
    }, 250);
    this._pendingUpdates = new Set();
    this._displayLimit = undefined;
  }
  
  /**
   * Returns the maximum number of items to display when there is no filter
   * active. If not set in the config, defaults to 20.
   * @type {number}
   */
  get MAX_DISPLAY() {
    return this.config?.max_items_without_filter ?? 20;
  }

/**
 * Returns the default maximum number of items to show when a filter is
 * active (initial display limit). Defaults to 50.
 */
  get MAX_WITH_FILTER() {
    return this.config?.max_items_with_filter ?? 50;
  }

  /**
   * Clean up debounced filter text update when this element is no longer in the DOM.
   * This ensures that any pending updates are cancelled and do not trigger after
   * the element is gone.
   */
  disconnectedCallback() {
    super.disconnectedCallback();
    this._debouncedSetFilter?.cancel?.();
  }

  /**
   * Sets the configuration for this element. Throws an error if the required
   * properties are not present in the config object.
   * @param {Object} config - The configuration object
   * @param {string} config.filter_items_entity - The entity ID of the Todo list
   *     to filter
   * @param {string} config.shopping_list_entity - The entity ID of the Todo list
   *     to add items to
   * @param {string} config.filter_entity - The entity ID of the input_text
   *     controlling the filter
   * @param {string} config.hash_entity - Entity providing a backend hash of items/source map (required).
   * @param {string} [config.title='ToDo List'] - The title to display in the
   *     card header
   * @param {boolean} [config.show_origin=false] - If true, show the origin of
   *     each item in the list
   * @param {boolean} [config.hide_add_button=false] - If true, hide the "Add"
   *     button at the bottom of the list
   * @param {number} [config.max_items_without_filter=20] - The maximum number of
   *     items to display when there is no filter active
   * @param {boolean} [config.highlight_matches=false] - If true, highlight the
   *     matches in the filter text
   * @param {Array<Object>} [config.filter_key_buttons=[]] - A list of key button
   *     definitions with the following properties:
   *     - `name`: The text to display in the button (fallback to `filter_key` if missing)
   *     - `filter_key`: The key to send to the filter input when the button is clicked
   *     - `icon`: The icon to display in the button (optional)
   */
  setConfig(config) {
    if (!config) throw new Error("Missing config");
    const required = ['filter_items_entity', 'shopping_list_entity', 'filter_entity', 'hash_entity'];
    const missing = required.filter(k => !config[k]);
    if (missing.length) {
      throw new Error(`Missing required config: ${missing.join(', ')}`);
    }
    this.config = {
      title: 'ToDo List',
      show_origin: false,
      hide_add_button: false,
      highlight_matches: false,
      max_items_without_filter: 20,
      max_items_with_filter: 50,
      show_more_buttons: '',
      filter_key_buttons: [],
      ...config,
    };
  }

  /**
   * Returns the size of the card in "rows". The size is calculated as a base
   * size of 4 plus the minimum of the number of items in the list and 6.
   * @returns {number} The size of the card in "rows"
   */
  getCardSize() {
    const base = 4;
    return base + Math.min(this._cachedItems?.length || 0, 6);
  }


  /**
   * Adds a pending update to the list. This will cause the item with the given
   * `uid` to be re-rendered on the next update.
   * @param {string} uid The uid of the item to add to the pending updates
   * @private
   */
  _addPending(uid) {
    // create a new Set so Lit notices the state change
    this._pendingUpdates = new Set(this._pendingUpdates);
    this._pendingUpdates.add(uid);
  }

  /**
   * Removes a pending update from the list. This will prevent the item with the
   * given `uid` from being re-rendered on the next update.
   * @param {string} uid The uid of the item to remove from the pending updates
   * @private
   */
  _removePending(uid) {
    const s = new Set(this._pendingUpdates);
    s.delete(uid);
    this._pendingUpdates = s;
  }

  /**
   * Decides whether or not to re-render the card based on changed properties.
   * @param {Map<string, unknown>} changedProps The changed properties
   * @returns {boolean} Whether the card should be re-rendered
   */
  shouldUpdate(changedProps) {
    if (!changedProps.has("hass")) return changedProps.size > 0;

    const hass = this.hass;
    if (!hass || !this.config) return true;

    const filterEntity = hass.states?.[this.config.filter_entity];
    const filterItemsEntity = hass.states?.[this.config.filter_items_entity];
    const hashEntity = hass.states?.[this.config.hash_entity];

    // Update cached filter value only if the remote value actually changed on this hass tick
    const oldHass = changedProps.get("hass");
    const prevRemote = oldHass?.states?.[this.config.filter_entity]?.state ?? "";
    const nextFilter = filterEntity?.state ?? "";
    if (nextFilter !== prevRemote && nextFilter !== this._filterValue) {
      this._filterValue = nextFilter;
      this._displayLimit = undefined;
      return true;
    }

    let itemsHash = String(hashEntity?.state ?? '');
    const lower = itemsHash.toLowerCase();
    if (!itemsHash || lower === 'unknown' || lower === 'unavailable') {
      itemsHash = '';
    }
    // Prefer backend hash; if missing/empty, fall back to a local fingerprint so updates still flow.
    const fallbackHash = !itemsHash
      ? computeItemsFingerprint(filterItemsEntity)
      : null;
    const effectiveHash = fallbackHash ?? itemsHash;
    const changed = effectiveHash !== (this._lastItemsHash || '');

    if (changed) {
      this._displayLimit = undefined;
      // still parse data for rendering
      const itemsAttr = filterItemsEntity?.attributes?.filtered_items;
      const nextItems = typeof itemsAttr === "string"
        ? safeParseJSON(itemsAttr, [])
        : Array.isArray(itemsAttr) ? itemsAttr : [];

      const mapAttr = filterItemsEntity?.attributes?.source_map;
      const nextMap = typeof mapAttr === "string"
        ? safeParseJSON(mapAttr, {})
        : (mapAttr && typeof mapAttr === "object") ? mapAttr : {};

      this._cachedItems = nextFilter.trim()
        ? nextItems.slice(0, this.MAX_WITH_FILTER)
        : nextItems.slice(0, this.MAX_DISPLAY);
      this._cachedSourceMap = nextMap;
      this._lastItemsHash = effectiveHash;
    }

    // Also update when total count changes (entity state)
    // oldHass already retrieved above
    const oldCount = parseInt(oldHass?.states?.[this.config.filter_items_entity]?.state, 10) || 0;
    const newCount = parseInt(filterItemsEntity?.state, 10) || 0;
    const countChanged = oldCount !== newCount;

    return changed || countChanged;
  }


  // Data processing methods moved to dataUtils.js

  /**
   * Handles a click on one of the filter key buttons. The value in the
   * input_text entity is updated immediately to the corresponding
   * "todo:<filterKey>" string. If the filterKey is falsy, nothing is done.
   * @param {string} [filterKey] The key to filter by
   * @private
   */
  async _onFilterKeyButtonClick(filterKey) {
    if (!filterKey) return;
    const value = `todo:${String(filterKey)} `;
    const previous = this._filterValue;
    this._filterValue = value;
    this.requestUpdate();
    try {
      await setFilterService(this.hass, this.config, value, this);
    } catch (err) {
      // Revert on failure
      this._filterValue = previous;
      this.requestUpdate();
    }
  }

  
  /**
   * Clears the filter text completely if there is no token in the current filter text
   * that matches the pattern "todo:<filterKey>" or if the only token is exactly
   * "todo:<filterKey>". If there is a token like "todo:<filterKey>" present, only
   * this token is preserved and the rest of the text is cleared. This is useful
   * when the user clicks on the "clear filter" button and we want to keep the
   * currently selected filter key.
   * @private
   */
  async _clearFilterPreservingTodoKey() {
    try {
      const entityId = this.config?.filter_entity;
      const current = this.hass?.states?.[entityId]?.state ?? '';
      const trimmed = String(current).trim();
      if (!trimmed) {
        // nothing to do
        const previous = this._filterValue;
        const value = '';
        this._filterValue = value;
        this.requestUpdate();
        await setFilterService(this.hass, this.config, previous, value, this);
        return;
      }

      // find token like todo:somekey (no spaces inside)
      const tokens = trimmed.split(/\s+/).filter(Boolean);
      const todoTokenIndex = tokens.findIndex(t => /^todo:[^\s]+$/.test(t));

      if (todoTokenIndex === -1) {
        // no todo:key => clear completely
        const previous = this._filterValue;
        const value = '';
        this._filterValue = value;
        this.requestUpdate();
        await setFilterService(this.hass, this.config, value, this);
        return;
      }

      // If the todo token is the only token present, clear it completely.
      if (tokens.length === 1) {
        const previous = this._filterValue;
        const value = '';
        this._filterValue = value;
        this.requestUpdate();
        await setFilterService(this.hass, this.config, value, this);
        return;
      }

      // preserve only the todo:key token (keep original case)
      const preserved = tokens[todoTokenIndex];

      // If the todo token is the only token, set it with a trailing space.
      // Also when preserving from multiple tokens we add a trailing space so the
      // user can continue typing after the key.
      const previous = this._filterValue;
      const value = preserved + ' ';
      this._filterValue = value;
      this.requestUpdate();
      await setFilterService(this.hass, this.config, value, this);
    } catch (err) {
      console.error('Error while clearing filter:', err);
      const prev = this._filterValue;
      const val = '';
      this._filterValue = val;
      this.requestUpdate();
      try {
        await setFilterService(this.hass, this.config, val, this);
      } catch (setErr) {
        console.error('Error setting filter in catch:', setErr);
      }
    }
  }

  /**
   * Handles the input event of the filter input field by calling the
   * debounced version of `_updateFilterTextActual` with the current value
   * of the input field. This is necessary because the input event is
   * triggered on every key press, but we don't want to update the filter
   * on every key press, but only after the user has stopped typing for
   * a short period of time.
   * @private
   * @param {Event} e - The input event.
   */
  _handleFilterInputChange(e) {
    const newValue = e.target.value;
    if (newValue !== this._filterValue) {
      const previous = this._filterValue;
      this._filterValue = newValue;
      this.requestUpdate();
      this._debouncedSetFilter(previous, newValue);
    }
  }

  _onInputKeydown = async (e) => {
    if (e.key === 'Enter') {
      const val = (e.currentTarget?.value || '').trim();
      if (!val) return;
      if (this.config.hide_add_button) return;
      if (val.length > 3) await this._addFilterTextToShoppingList();
    } else if (e.key === 'Escape') {
      const previous = this._filterValue;
      const value = '';
      this._filterValue = value;
      this.requestUpdate();
      try {
        await setFilterService(this.hass, this.config, value, this);
      } catch (err) {
        // Revert on failure
        this._filterValue = previous;
        this.requestUpdate();
      }
    }
  }


  _addFilterTextToShoppingList = async () => {
    await addFilterTextToShoppingList(this.hass, this.config, this._filterValue, this);
  }
  

  _confirmAndComplete = async (item, sourceMap) => {
    const ok = await confirmDialog(this, `Möchtest du "${item.s}" wirklich als erledigt markieren?`);
    if (!ok) return;
    // Uses UID placed in 'item' field as required by your service
    await updateOrCompleteItem(this.hass, item.u, { status: 'completed' }, item.c, sourceMap, this, this._addPending.bind(this), this._removePending.bind(this), this._cachedItems, (newItems) => { this._cachedItems = newItems; });
  };

  /**
   * Adds an item to the shopping list if the user confirms the dialog
   * @param {Object} item The todo item to add
   * @private
   */
  _addToShoppingList = async (item) => {
    await addToShoppingList(this.hass, this.config, item, this);
  }




  /**
   * Increases the display limit of the list by the given amount.
   * @param {number|string|undefined} option - Number of items to add to the
   *   display limit, or a string that can be parsed as a number. If `'all'` or
   *   `'rest'`, the list will show all items. If `undefined`, the default is
   *   10. If any other value, the default is 10.
   * @private
   */
  _showMore(option) {
    const items = this._fullItemsList || this._cachedItems || [];
  
    // ensure displayLimit initialized
    if (this._displayLimit === undefined || this._displayLimit === null) {
      this._displayLimit = this._filterValue?.trim()
        ? this.MAX_WITH_FILTER
        : this.MAX_DISPLAY;
    }
  
    // Determine the new limit
    let newLimit = this._displayLimit;
  
    if (typeof option === 'string') {
      const lower = option.toLowerCase().trim();
      if (lower === 'all' || lower === 'rest') {
        // show everything
        newLimit = items.length;
      } else {
        // try parsing string as number
        const parsed = Number(option);
        if (Number.isFinite(parsed) && parsed > 0) {
          newLimit = Math.min(this._displayLimit + Math.floor(parsed), items.length);
        } else {
          // default when invalid string
          newLimit = Math.min(this._displayLimit + 10, items.length);
        }
      }
    } else if (typeof option === 'number') {
      if (Number.isFinite(option) && option > 0) {
        newLimit = Math.min(this._displayLimit + Math.floor(option), items.length);
      } else {
        // default when non-positive/invalid number
        newLimit = Math.min(this._displayLimit + 10, items.length);
      }
    } else if (typeof option === 'undefined') {
      // no argument -> default 10
      newLimit = Math.min(this._displayLimit + 10, items.length);
    } else {
      // fallback for other types
      newLimit = Math.min(this._displayLimit + 10, items.length);
    }
  
    // Apply new limit and update cached items
    this._displayLimit = newLimit;
    this._cachedItems = items.slice(0, this._displayLimit);
  }


  /**
   * Renders the card content.
   * @returns {TemplateResult} The rendered content.
   * @private
   */
  render() {
    if (!this.hass) {
      return html`<ha-card><div class="empty-state">Home Assistant context not available</div></ha-card>`;
    }

    const itemsEntity = this.hass.states[this.config.filter_items_entity];
    if (!itemsEntity) {
      return html`<ha-card><div class="empty-state">Entity '${this.config.filter_items_entity}' not found</div></ha-card>`;
    }

    const filterValue = this._filterValue ?? '';
    const showAddButton = filterValue.trim().length > 3 && !this.config.hide_add_button;

    if (!this._lastItemsHash) {
      const attr = itemsEntity.attributes.filtered_items;
      const items = typeof attr === 'string'
        ? safeParseJSON(attr, [])
        : Array.isArray(attr) ? attr : [];
      // remember the full list for "show more" handling
      this._fullItemsList = items;
    
      // initialize display limit depending on filter
      if (this._displayLimit === undefined || this._displayLimit === null) {
        this._displayLimit = filterValue.trim() ? this.MAX_WITH_FILTER : this.MAX_DISPLAY;
      }
    
      // set cached items according to display limit
      this._cachedItems = items.slice(0, this._displayLimit);
    
      const mapAttr = itemsEntity.attributes.source_map;
      this._cachedSourceMap = typeof mapAttr === 'string'
        ? safeParseJSON(mapAttr, {})
        : (mapAttr && typeof mapAttr === 'object') ? mapAttr : {};
    
      // initialize last-seen hash from the external hash entity (if present)
      const hashEntity = this.hass.states?.[this.config.hash_entity];
      let extHash = String(hashEntity?.state ?? '');
      const low = extHash.toLowerCase();
      if (!extHash || low === 'unknown' || low === 'unavailable') extHash = '';
      let localFp = '';
      if (!extHash) {
        localFp = computeItemsFingerprint(itemsEntity) || '';
      }
      this._lastItemsHash = extHash || localFp;
    }

    // Always ensure we have the full list cached (useful when not first render)
    {
      const attr = itemsEntity.attributes.filtered_items;
      const items = typeof attr === 'string' ? safeParseJSON(attr, []) : Array.isArray(attr) ? attr : [];
      this._fullItemsList = items;
      // if filter active, ensure cachedItems follows displayLimit
      if (filterValue.trim()) {
        if (this._displayLimit === undefined || this._displayLimit === null) {
          this._displayLimit = this.MAX_WITH_FILTER;
        }
        this._cachedItems = items.slice(0, this._displayLimit);
      } else {
        // unfiltered: use unfiltered limit
        if (this._displayLimit === undefined || this._displayLimit === null) {
          this._displayLimit = this.MAX_DISPLAY;
        }
        this._cachedItems = items.slice(0, this._displayLimit);
      }
    }    

    const totalItemsCount = parseInt(itemsEntity?.state, 10) || 0;
    const displayedItems = this._cachedItems || [];
    const displayedCount = displayedItems.length;
    const remaining = Math.max(0, totalItemsCount - displayedCount);

    return html`
      <ha-card>
        <div class="card-header">
          <div class="card-title">${this.config.title || 'ToDo List'}</div>
          <div class="count-badge" title="Gesamtanzahl Einträge">${totalItemsCount}</div>
        </div>
        <div class="input-row">
          <input
            type="text"
            .value=${filterValue}
            placeholder="Tippe einen Suchfilter ein"
            @input=${this._handleFilterInputChange}
            @keydown=${this._onInputKeydown}
            aria-label="Filter"
          />
          <button
            class="btn ${!filterValue ? 'hidden' : ''}"
            type="button"
            @click=${() => this._clearFilterPreservingTodoKey()}
            title="Eingabe leeren"
            aria-label="Eingabe leeren"
          >
            <ha-icon icon="mdi:close-circle-outline"></ha-icon>
          </button>
          <button
            class="btn ${!showAddButton ? 'hidden' : ''}"
            type="button"
            @click=${this._addFilterTextToShoppingList}
            title="Zur Einkaufsliste hinzufügen"
            aria-label="Zur Einkaufsliste hinzufügen"
          >
            <ha-icon icon="mdi:cart-plus"></ha-icon>
          </button>
        </div>
        
        ${Array.isArray(this.config.filter_key_buttons) && this.config.filter_key_buttons.length
          ? html`<div class="key-buttons" role="toolbar" aria-label="Schnellfilter">
              ${this.config.filter_key_buttons.map((btn) => {
                const label = btn.name || btn.filter_key || '';
                const icon = typeof btn.icon === 'string' && /^mdi:[\w-]+$/.test(btn.icon) ? btn.icon : null;
                const fk = btn.filter_key || '';
                return html`
                  <button
                    class="key-btn"
                    type="button"
                    title=${label}
                    aria-label=${label}
                    @click=${() => this._onFilterKeyButtonClick(fk)}
                  >
                    ${icon ? html`<ha-icon .icon=${icon}></ha-icon>` : html`${label}`}
                  </button>
                `;
              })}
            </div>`
          : ''}


        ${filterValue.trim()
          ? html`<div class="info" aria-live="polite">Filter: "${filterValue.trim()}" → ${ (this._fullItemsList || []).length } Treffer</div>`
          : totalItemsCount > (this.config.max_items_without_filter ?? 20)
          ? html`<div class="info" aria-live="polite">${displayedCount} von ${totalItemsCount} Einträgen</div>`
          : ''}

        ${displayedCount === 0
          ? html`<div class="empty-state" aria-live="polite">Keine Ergebnisse gefunden</div>`
          : html`<div role="list" aria-label="Trefferliste">${displayedItems.map((item) => renderItemRow(item, this._cachedSourceMap, this.config, this._filterValue, this._pendingUpdates, updateOrCompleteItem, addToShoppingList, this._confirmAndComplete.bind(this), this.hass, this, this._addPending.bind(this), this._removePending.bind(this), this._cachedItems, (newItems) => { this._cachedItems = newItems; }))}</div>`}

        ${this._fullItemsList && this._fullItemsList.length > (displayedItems?.length || 0)
          ? (() => {
              const remaining = Math.max(0, this._fullItemsList.length - displayedItems.length);
              const configured = parseShowMoreButtons(this.config);
              return html`
                <div class="key-buttons" role="group" aria-label="Mehr anzeigen Optionen">
                  ${configured.length
                    ? configured.map(
                        (n) => html`
                          <button
                            class="key-btn"
                            type="button"
                            title="Mehr anzeigen ${n}"
                            ?disabled=${n > remaining}
                            @click=${() => this._showMore(n)}
                          >
                            +${n}
                          </button>
                        `
                      )
                    : ''}
        
                  <button
                    class="key-btn"
                    type="button"
                    title="Alles anzeigen"
                    @click=${() => this._showMore('all')}
                  >
                    Alle (${remaining})
                  </button>
                </div>
              `;
            })()
          : ''}
      
          </ha-card>
    `;
  }

  // Optional: Lovelace UI editor support
  static getConfigElement() {
    return null;
  }
  /**
   * Provides a default configuration stub for the editor to use when not
   * given a real configuration.
   *
   * @return {Object} A configuration stub with default values.
   */
  static getStubConfig() {
    return {
      title: 'ToDo List',
      filter_items_entity: 'sensor.todo_filtered_items',
      hash_entity: 'sensor.todo_hash',
      shopping_list_entity: 'todo.shopping_list',
      filter_entity: 'input_text.todo_filter',
    };
  }
}

if (!customElements.get('item-list-card')) {
  customElements.define('item-list-card', ItemListCard);
}
