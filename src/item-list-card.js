import { LitElement, html, css } from 'lit';
import { styles } from './styles.js';
import { debounce, highlightParts } from './utils.js';
import {
  safeParseJSON,
  computeItemsFingerprint,
  parseShowMoreButtons,
  normalizeTodoText,
  updateOrCompleteItem,
  confirmAndComplete,
  addToShoppingList,
  setFilterService,
  clearFilterPreservingTodoKey,
  onFilterKeyButtonClick,
  handleFilterInputChange,
  onInputKeydown,
  addFilterTextToShoppingList,
  showMore
} from './data-handlers.js';
import { renderItemRow } from './render-helpers.js';

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
    this._debouncedSetFilter = debounce((prev, val) => this._setFilterServiceBound(prev, val), 250);
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
   * Wrapper for updateOrCompleteItem that binds component context.
   * @private
   */
  _updateOrCompleteItemBound = (uid, updates, source, sourceMap) =>
    updateOrCompleteItem(uid, updates, source, sourceMap, this.hass, this, this._cachedItems, this._addPending.bind(this), this._removePending.bind(this));

  /**
   * Wrapper for confirmAndComplete that binds component context.
   * @private
   */
  _confirmAndCompleteBound = (item, sourceMap) =>
    confirmAndComplete(item, sourceMap, this.hass, this, this._cachedItems, this._addPending.bind(this), this._removePending.bind(this));

  /**
   * Wrapper for addToShoppingList that binds component context.
   * @private
   */
  _addToShoppingListBound = (item) =>
    addToShoppingList(item, this.config.shopping_list_entity, this.hass, this);

  /**
   * Wrapper for setFilterService that binds component context.
   * @private
   */
  _setFilterServiceBound = (previous, value) =>
    setFilterService(this.config?.filter_entity, this.hass, previous, value, this, (val) => this._filterValue = val, this.requestUpdate.bind(this));

  /**
   * Wrapper for clearFilterPreservingTodoKey that binds component context.
   * @private
   */
  _clearFilterPreservingTodoKeyBound = () =>
    clearFilterPreservingTodoKey(this.config?.filter_entity, this.hass, () => this._filterValue, this.requestUpdate.bind(this), (prev, val) => this._setFilterServiceBound(prev, val));

  /**
   * Wrapper for onFilterKeyButtonClick that binds component context.
   * @private
   */
  _onFilterKeyButtonClickBound = (filterKey) =>
    onFilterKeyButtonClick(filterKey, this.config?.filter_entity, this.hass, () => this._filterValue, this.requestUpdate.bind(this), (prev, val) => this._setFilterServiceBound(prev, val));

  /**
   * Wrapper for handleFilterInputChange that binds component context.
   * @private
   */
  _handleFilterInputChangeBound = (e) =>
    handleFilterInputChange(e, () => this._filterValue, this.requestUpdate.bind(this), (prev, val) => this._debouncedSetFilter(prev, val));

  /**
   * Wrapper for onInputKeydown that binds component context.
   * @private
   */
  _onInputKeydownBound = (e) =>
    onInputKeydown(e, this._filterValue, (value) => this._filterValue = value, this.requestUpdate.bind(this), (prev, val) => this._setFilterServiceBound(prev, val), this._addFilterTextToShoppingListBound);

  /**
   * Wrapper for addFilterTextToShoppingList that binds component context.
   * @private
   */
  _addFilterTextToShoppingListBound = () =>
    addFilterTextToShoppingList(this._filterValue, this.config.shopping_list_entity, this.hass, this);

  /**
   * Wrapper for showMore that binds component context.
   * @private
   */
  _showMoreBound = (option) =>
    showMore(option, this._fullItemsList || this._cachedItems || [], this._displayLimit, (limit) => this._displayLimit = limit, (items) => this._cachedItems = items);

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


  /**
   * Parse the comma separated config string this.config.show_more_buttons
   * into an array of positive integers (deduplicated and sorted ascending).
   * Returns [] when none available.
   * @returns {number[]}
   * @private
   */
  _parseShowMoreButtons() {
    return parseShowMoreButtons(this.config?.show_more_buttons);
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
            @input=${this._handleFilterInputChangeBound}
            @keydown=${this._onInputKeydownBound}
            aria-label="Filter"
          />
          <button
            class="btn ${!filterValue ? 'hidden' : ''}"
            type="button"
            @click=${this._clearFilterPreservingTodoKeyBound}
            title="Eingabe leeren"
            aria-label="Eingabe leeren"
          >
            <ha-icon icon="mdi:close-circle-outline"></ha-icon>
          </button>
          <button
            class="btn ${!showAddButton ? 'hidden' : ''}"
            type="button"
            @click=${this._addFilterTextToShoppingListBound}
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
                    @click=${() => this._onFilterKeyButtonClickBound(fk)}
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
           : html`<div role="list" aria-label="Trefferliste">${displayedItems.map((item) => renderItemRow(item, this._cachedSourceMap, this._pendingUpdates, this._updateOrCompleteItemBound, this._addToShoppingListBound, this._confirmAndCompleteBound, this.config?.show_origin, normalizeTodoText(this._filterValue), this.config.highlight_matches, highlightParts))}</div>`}

        ${this._fullItemsList && this._fullItemsList.length > (displayedItems?.length || 0)
          ? (() => {
              const remaining = Math.max(0, this._fullItemsList.length - displayedItems.length);
              const configured = this._parseShowMoreButtons();
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
                            @click=${() => this._showMoreBound(n)}
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
                    @click=${() => this._showMoreBound('all')}
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
