import { LitElement, html, css } from 'lit';

const debounce = (fn, delay = 200) => {
  let timer;
  const debounced = function (...a) {          // regular fn so its own "this" works
    clearTimeout(timer);
    timer = setTimeout(() => fn.call(this, ...a), delay);
  };
  debounced.cancel = () => clearTimeout(timer);
  return debounced;
};

const showToast = (el, message) => {
  if (!el) return;
  el.dispatchEvent(new CustomEvent('hass-notification', {
    detail: { message }, bubbles: true, composed: true,
  }));
};

const confirmDialog = async (_el, _title, text) =>
  typeof window.confirm === 'function' ? window.confirm(text) : false;

const callService = async (hass, domain, service, data, toastEl, fallbackMsg = 'Fehler') => {
  try {
    await hass.callService(domain, service, data);
  } catch (err) {
    console.error(`Error calling ${domain}.${service}:`, err);
    showToast(toastEl, fallbackMsg);
    throw err;
  }
};

const highlightParts = (text, term) => {
  const source = String(text ?? '');
  const needle = String(term ?? '').trim();
  if (!needle) return [source];

  const lowerSource = source.toLowerCase();
  const lowerNeedle = needle.toLowerCase();
  const len = needle.length;

  const parts = [];
  let pos = 0;
  while (true) {
    const idx = lowerSource.indexOf(lowerNeedle, pos);
    if (idx === -1) break;
    if (idx > pos) parts.push(source.slice(pos, idx));
    parts.push(
      html`<span class="highlight">${source.slice(idx, idx + len)}</span>`
    );
    pos = idx + len;
  }

  if (pos < source.length) parts.push(source.slice(pos));
  return parts.length ? parts : [source];
};

class ItemListCard extends LitElement {
  static properties = {
    hass: {},
    config: {},
    _cachedItems: { state: true },
    _cachedSourceMap: { state: true },
    _filterValue: { state: true },
    _pendingUpdates: { state: true },
    _lastItemsHash: { state: false },
    _lastSourceMapHash: { state: false },
  };

  static styles = css`
    :host {
      display: block;
      font-family: var(--primary-font-family, 'Helvetica Neue', Arial, sans-serif);
      --card-padding: 12px;
    }
    ha-card {
      padding: var(--card-padding);
      border-radius: 10px;
      box-shadow: 0 1px 0 rgba(0,0,0,0.06);
    }
    .card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      margin-bottom: 8px;
    }
    .card-title {
      margin: 0;
      font-size: 1.15rem;
      font-weight: 600;
      color: var(--primary-text-color);
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .count-badge {
      background: var(--accent-color, #03a9f4);
      color: white;
      font-weight: 600;
      padding: 2px 8px;
      border-radius: 999px;
      font-size: 0.82rem;
    }
    .input-row {
      display: flex;
      gap: 8px;
      margin-bottom: 10px;
      height: 40px;
      align-items: center;
    }
    .input-row input {
      flex: 1;
      padding: 8px 10px;
      font-size: 14px;
      border: 1px solid var(--divider-color, #e0e0e0);
      border-radius: 8px;
      color: var(--primary-text-color);
      background: var(--card-background-color);
      transition: box-shadow 0.12s ease, border-color 0.12s ease;
    }
    .input-row input:focus {
      outline: none;
      border-color: var(--accent-color, #03a9f4);
      box-shadow: 0 0 0 4px rgba(3,169,244,0.06);
    }
    .input-row .btn {
      width: 36px;
      height: 36px;
      background: none;
      border: 1px solid transparent;
      cursor: pointer;
      padding: 0;
      color: var(--primary-text-color, #555);
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 8px;
      transition: background 0.12s ease, color 0.12s ease;
    }
    .input-row .btn:hover,
    .btn:hover {
      background: rgba(0,0,0,0.04);
      color: var(--accent-color, #03a9f4);
      transform: translateY(-1px);
    }
    .item-row {
      display: flex;
      align-items: center;
      padding: 10px 0;
      border-bottom: 1px solid var(--divider-color, #f0f0f0);
      gap: 8px;
    }
    .item-summary {
      flex: 1 1 70%;
      font-size: 14px;
      color: var(--primary-text-color, #333);
      white-space: normal;
      overflow: visible;
      user-select: text;
    }
    .info {
      font-size: 13px;
      color: var(--secondary-text-color, #888);
      margin-bottom: 8px;
    }
    .item-controls {
      flex: 0 0 auto;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 6px;
    }
    .btn {
      width: 32px;
      height: 32px;
      background: none;
      border: none;
      cursor: pointer;
      padding: 0;
      color: var(--primary-text-color, #555);
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 6px;
    }
    .btn[title] {
      position: relative;
    }
    .hidden {
      display: none !important;
    }
    .quantity {
      min-width: 26px;
      text-align: center;
      font-weight: 600;
      font-size: 14px;
      color: var(--primary-text-color, #333);
      padding: 2px 6px;
      border-radius: 6px;
      background: rgba(0,0,0,0.03);
    }
    .empty-state {
      padding: 14px 0;
      font-size: 14px;
      color: var(--secondary-text-color, #888);
      text-align: center;
    }
    .item-sublabel {
      font-size: 12px;
      color: var(--secondary-text-color, #9a9a9a);
      margin-top: 4px;
    }
    .highlight {
      background-color: rgba(255, 235, 59, 0.35);
      /* padding: 0 3px; */
      border-radius: 3px;
    }

    /* small screens adjustments */
    @media (max-width: 420px) {
      .input-row { height: 38px; gap: 6px; }
      .btn, .input-row .btn { width: 34px; height: 34px; }
      .quantity { min-width: 22px; }
    }
    
    /* fixed-size centered spinner wrapper to avoid layout shift */
    .loading-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 1.2em;
      height: 1.2em;
      vertical-align: middle;
      pointer-events: none;
    }
    
    /* animate the inner ha-icon and svg explicitly */
    .loading-icon ha-icon,
    .loading-icon ha-icon svg,
    .loading-icon ha-icon * {
      display: block;
      width: 100%;
      height: 100%;
      transform-origin: 50% 50%;
      transform-box: fill-box;
      -webkit-backface-visibility: hidden;
      backface-visibility: hidden;
      will-change: transform;
      animation: spin 1s linear infinite;
    }
    
    /* fallback: animate svg children directly if present */
    .loading-icon svg {
      animation: spin 1s linear infinite;
      transform-origin: 50% 50%;
      transform-box: fill-box;
    }
    
    /* smooth rotation */
    @keyframes spin {
      from { transform: rotate(0deg); }
      to   { transform: rotate(360deg); }
    }
    
    /* make disabled buttons clearly non-interactive and remove focus ring */
    .btn[disabled] {
      opacity: 0.5;
      cursor: default;
      transform: none;
      pointer-events: none;
    }
    .btn[disabled]:focus-visible {
      outline: none;
      box-shadow: none;
    }
    /* key button can reuse .btn but override to be wider and centered */
    /* key buttons: single row that fills full width (no wrap) */
    .key-buttons {
      display: flex;
      gap: 8px;
      align-items: center;
      margin: 8px 0 12px;
      flex-wrap: nowrap;      /* force single row */
      width: 100%;
      overflow: visible;       /* avoid scrollbar if something goes slightly over */
    }
    
    /* make each button share available space equally */
    .key-buttons .key-btn,
    .key-buttons button {
      flex: 1 1 0;            /* grow & shrink equally, no base width forcing wrap */
      padding: 8px 12px;
      height: 40px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      border-radius: 8px;
      background: rgba(0,0,0,0.03);
      border: 1px solid transparent;
      cursor: pointer;
      transition: background 0.12s ease, transform 0.08s ease, color 0.12s ease;
      box-sizing: border-box;
      min-width: 0;           /* allow shrinking below default content width */
    }
    
    /* hover / focus */
    .key-buttons .key-btn:hover,
    .key-buttons .key-btn:focus,
    .key-buttons button:hover,
    .key-buttons button:focus {
      background: rgba(0,0,0,0.06);
      transform: translateY(-1px);
      color: var(--accent-color, #03a9f4);
      outline: none;
      box-shadow: 0 0 0 4px rgba(3,169,244,0.06);
      border-color: var(--accent-color, #03a9f4);
    }
    
    /* icon centering & sizing */
    .key-buttons .key-btn ha-icon,
    .btn ha-icon {
      display: inline-flex !important;
      align-items: center !important;
      justify-content: center !important;
      width: 18px !important;
      height: 18px !important;
      line-height: 0 !important;
      margin: 0 !important;
      padding: 0 !important;
    }
    
    /* For icon-only buttons (if any), keep a minimum tap target without stretching */
    .key-buttons .key-btn.icon-only {
      flex: 0 0 auto;
      min-width: 44px;
      padding: 8px;
    }
  `;

  constructor() {
    super();
    this._cachedItems = [];
    this._cachedSourceMap = {};
    this._filterValue = '';
    this._lastItemsHash = '';
    this._lastSourceMapHash = '';
    this._debouncedUpdateFilterText = debounce(this._updateFilterTextActual, 250);
    this._pendingUpdates = new Set();
  }
  
  get MAX_DISPLAY() {
    return this.config?.max_items_without_filter ?? 20;
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._debouncedUpdateFilterText?.cancel?.();
  }

  setConfig(config) {
    if (!config) throw new Error("Missing config");
    const required = ['filter_items_entity', 'shopping_list_entity', 'filter_entity'];
    const missing = required.filter(k => !config[k]);
    if (missing.length) {
      throw new Error(`Missing required config: ${missing.join(', ')}`);
    }
    this.config = {
      title: 'ToDo List',
      show_origin: false,
      hide_add_button: false,
      max_items_without_filter: 20,
      highlight_matches: false,
      filter_key_buttons: [],
      ...config,
    };
  }

  getCardSize() {
    const base = 4;
    return base + Math.min(this._cachedItems?.length || 0, 6);
  }

  _hash(val) {
    try {
      const s = typeof val === 'string' ? val : JSON.stringify(val);
      let h = 0;
      for (let i = 0; i < s.length; i++) h = ((h << 5) - h) + s.charCodeAt(i) | 0;
      return String(h);
    } catch {
      return '';
    }
  }
  _addPending(uid) {
    // create a new Set so Lit notices the state change
    this._pendingUpdates = new Set(this._pendingUpdates);
    this._pendingUpdates.add(uid);
  }

  _removePending(uid) {
    const s = new Set(this._pendingUpdates);
    s.delete(uid);
    this._pendingUpdates = s;
  }

  shouldUpdate(changedProps) {
    if (!changedProps.has('hass')) return changedProps.size > 0;

    const hass = this.hass;
    if (!hass || !this.config) return true;

    const filterEntity = hass.states?.[this.config.filter_entity];
    const filterItemsEntity = hass.states?.[this.config.filter_items_entity];

    // Update cached filter value
    const nextFilter = filterEntity?.state ?? '';
    if (nextFilter !== this._filterValue) {
      this._filterValue = nextFilter;
      return true;
    }

    // Check filtered_items change
    const itemsAttr = filterItemsEntity?.attributes?.filtered_items;
    const nextItems = typeof itemsAttr === 'string'
      ? this._safeParseJSON(itemsAttr, [])
      : Array.isArray(itemsAttr) ? itemsAttr : [];
    const itemsHash = this._hash(nextItems);

    // Check source_map change
    const mapAttr = filterItemsEntity?.attributes?.source_map;
    const nextMap = typeof mapAttr === 'string'
      ? this._safeParseJSON(mapAttr, {})
      : (mapAttr && typeof mapAttr === 'object') ? mapAttr : {};
    const mapHash = this._hash(nextMap);

    const changed = itemsHash !== this._lastItemsHash || mapHash !== this._lastSourceMapHash;

    if (changed) {
      this._cachedItems = nextFilter.trim()
        ? nextItems
        : nextItems.slice(0, this.config.max_items_without_filter);
      this._cachedSourceMap = nextMap;
      this._lastItemsHash = itemsHash;
      this._lastSourceMapHash = mapHash;
    }

    // Also update when total count (state) changes while no filter applied
    const oldHass = changedProps.get('hass');
    const oldCount = parseInt(oldHass?.states?.[this.config.filter_items_entity]?.state, 10) || 0;
    const newCount = parseInt(filterItemsEntity?.state, 10) || 0;
    const countChanged = oldCount !== newCount;

    return changed || countChanged;
  }

  _safeParseJSON(s, fallback) {
    try {
      return JSON.parse(s);
    } catch {
      return fallback;
    }
  }

  _isNumeric(str) {
    return typeof str === 'string' && /^\d+$/.test(str);
  }

  _onFilterKeyButtonClick(filterKey) {
    if (!filterKey) return;
    const value = `todo:${String(filterKey)}`;
    // Use the immediate update so the input_text value is set right away.
    this._updateFilterTextActual(value);
  }

  _updateFilterTextActual(value) {
    try {
      const entityId = this.config?.filter_entity;
      if (!entityId || !this.hass) {
        return;
      }
      const current = this.hass.states?.[entityId]?.state ?? '';
      const curTrim = String(current).trim();
      const valTrim = String(value ?? '').trim();
      if (curTrim === valTrim) return;

       callService(this.hass, 'input_text', 'set_value',
        { entity_id: entityId, value },
        this,
        'Fehler beim Aktualisieren des Suchfeldes');
    } catch (err) {
      console.error("Error in _updateFilterTextActual:", err);
    }
  }

  _clearFilterPreservingTodoKey() {
    try {
      const entityId = this.config?.filter_entity;
      const current = this.hass?.states?.[entityId]?.state ?? '';
      const trimmed = String(current).trim();
      if (!trimmed) {
        // nothing to do
        this._updateFilterTextActual('');
        return;
      }

      // find token like todo:somekey (no spaces inside)
      const tokens = trimmed.split(/\s+/).filter(Boolean);
      const todoTokenIndex = tokens.findIndex(t => /^todo:[^\s]+$/.test(t));

      if (todoTokenIndex === -1) {
        // no todo:key => clear completely
        this._updateFilterTextActual('');
        return;
      }

      // if only that token present -> clear as well
      if (tokens.length === 1) {
        this._updateFilterTextActual('');
        return;
      }

      // preserve only the todo:key token (keep original case)
      const preserved = tokens[todoTokenIndex];
      this._updateFilterTextActual(preserved);
    } catch (err) {
      console.error('Error while clearing filter:', err);
      this._updateFilterTextActual('');
    }
   }

  _handleFilterInputChange(e) {
    this._debouncedUpdateFilterText(e.target.value);
  }

  _onInputKeydown = (e) => {
    if (e.key === 'Enter') {
      const val = (e.currentTarget?.value || '').trim();
      if (!val) return;
      if (this.config.hide_add_button) return;
      if (val.length > 3) this._addFilterTextToShoppingList();
    } else if (e.key === 'Escape') {
      this._updateFilterTextActual('');
    }
  }

  _normalizeTodoText(raw) {
    let value = (raw || '').trim();
    if (!value) return '';
    if (value.startsWith('todo:')) {
      const parts = value.split(' ');
      if (parts.length > 1) {
        parts.shift();
        value = parts.join(' ');
      } else {
        return '';
      }
    }
    return value;
  }

  _addFilterTextToShoppingList = async () => {
    const raw = this.hass.states[this.config.filter_entity]?.state || '';
    const value = this._normalizeTodoText(raw);
    if (!value) return;

    const ok = await confirmDialog(this, 'Zur Einkaufsliste hinzufügen', `Möchtest du "${value}" zur Einkaufsliste hinzufügen?`);
    if (!ok) return;
    await callService(this.hass, 'todo', 'add_item',
      { entity_id: this.config.shopping_list_entity, item: value, description: '' },
      this,
      'Konnte \''+value+'\' **nicht** zur Einkaufsliste hinzufügen'
    );
  }
  
  async _updateOrCompleteItem(uid, updates, source, sourceMap) {
    const entityId = sourceMap?.[String(source)];
    if (!entityId) {
      console.error('No valid todo entity id for source:', source);
      return;
    }

    const data = {
      entity_id: entityId,
      item: uid,
      ...updates,
    };

    // Optional: coerce numeric description to string if your service requires it
    let newDesc;
    if (updates.description !== undefined) {
      let desc = parseInt(updates.description, 10);
      if (isNaN(desc) || desc < 0) desc = 0;
      data.description = String(desc);
      newDesc = String(desc);
    }

    // --- Optimistic UI update: update cached item description immediately ---
    let previousDesc = null;
    if (newDesc !== undefined && Array.isArray(this._cachedItems)) {
      const idx = this._cachedItems.findIndex(it => String(it.u) === String(uid));
      if (idx >= 0) {
        // copy array and item to trigger reactive update
        const newItems = this._cachedItems.slice();
        previousDesc = newItems[idx].d;
        // set optimistic value (keep numeric-ish as string to match how items store d)
        newItems[idx] = { ...newItems[idx], d: newDesc };
        this._cachedItems = newItems;
      }
    }

    // mark pending so UI can disable controls for this UID (use reassignment
    // so Lit reliably notices the change)
    this._addPending(uid);
    
    try {
      // Use shared callService wrapper (will show toast on failure)
      await callService(
        this.hass,
        'todo',
        'update_item',
        data,
        this,
        'Fehler beim Aktualisieren des Eintrags'
      );
      // success => nothing else to do here
      /* success */
      this._removePending(uid);
    } catch (err) {
      console.error('todo/update_item:', err);
      // revert
      if (previousDesc !== null && Array.isArray(this._cachedItems)) {
        const idx = this._cachedItems.findIndex(it => String(it.u) === String(uid));
        if (idx >= 0) {
          const newItems = this._cachedItems.slice();
          newItems[idx] = { ...newItems[idx], d: previousDesc };
          this._cachedItems = newItems;
        }
      }
      this._removePending(uid);
    }
  }

  _confirmAndComplete = async (item, sourceMap) => {
    const ok = await confirmDialog(
      this,
      'Erledigen',
      `Möchtest du "${item.s}" wirklich als erledigt markieren?`
    );
    if (!ok) return;

    // Uses UID placed in 'item' field as required by your service
    this._updateOrCompleteItem(item.u, { status: 'completed' }, item.c, sourceMap);
  };

  _addToShoppingList(item) {
    const entityId = this.config.shopping_list_entity;
    if (!entityId) {
      console.error('No valid shopping list entity id configured');
      return;
    }
    const text = `Möchtest du "${item.s}" zur Einkaufsliste hinzufügen?`;
    (async () => {
      const ok = await confirmDialog(this, 'Zur Einkaufsliste', text);
      if (!ok) return;
      await callService(this.hass, 'todo', 'add_item',
        { entity_id: entityId, item: item.s, description: '' },
        this,
        'Einkaufsliste aktualisieren fehlgeschlagen'
      );
    })();
  }

  _renderQuantityControls(item, sourceMap) {
    let qStr = String(item.d ?? '');
    if (qStr === '') qStr = '1';

    // if not numeric, just show text
    if (!this._isNumeric(qStr)) {
      return html`<div class="quantity" title="Menge">${qStr}</div>`;
    }
    const quantity = parseInt(qStr, 10);
    const pending = this._pendingUpdates.has(item.u);

    const dec = () => {
      if (pending) return;
      this._updateOrCompleteItem(item.u, { description: Math.max(quantity - 1, 0) }, item.c, sourceMap);
    };
    const inc = () => {
      if (pending) return;
      this._updateOrCompleteItem(item.u, { description: quantity + 1 }, item.c, sourceMap);
    };

    return html`
      ${quantity > 1
        ? html`<button class="btn" type="button" title="Verringern" aria-label="Verringern"
                      ?disabled=${pending}
                      @click=${dec}><ha-icon icon="mdi:minus-circle-outline"></ha-icon></button>`
        : ''}
      <div class="quantity" title="Menge">
        ${pending
          ? html`<span class="loading-icon" aria-hidden="true"><ha-icon icon="mdi:loading"></ha-icon></span>`
          : quantity}
      </div>
      <button class="btn" type="button" title="Erhöhen" aria-label="Erhöhen"
              ?disabled=${pending}
              @click=${inc}><ha-icon icon="mdi:plus-circle-outline"></ha-icon></button>
    `;
  }

  _renderItemRow(item, sourceMap) {
      const showOrigin = !!this.config?.show_origin;
      const sourceId = sourceMap?.[String(item.c)];
      const friendlyName = showOrigin && sourceId
        ? this.hass.states[sourceId]?.attributes?.friendly_name
        : null;
    
      const filterValue = (this._filterValue || '').trim();
      const showHighlight = Boolean(filterValue && this.config.highlight_matches);
      const contentParts = showHighlight
        ? highlightParts(item.s, filterValue)
        : [String(item.s ?? '')];
      return html`
        <div class="item-row" role="listitem">
          <div class="item-summary" title=${item.s}>
            ${contentParts}
            ${friendlyName ? html`<div class="item-sublabel">${friendlyName}</div>` : ''}
          </div>
          <div class="item-controls">
            ${this._renderQuantityControls(item, sourceMap)}
            <button class="btn" type="button" title="Zur Einkaufsliste" aria-label="Zur Einkaufsliste" @click=${() => this._addToShoppingList(item)}>
              <ha-icon icon="mdi:cart-outline"></ha-icon>
            </button>
            <button class="btn" type="button" title="Erledigt" aria-label="Erledigt" @click=${() => this._confirmAndComplete(item, this._cachedSourceMap)}>
              <ha-icon icon="mdi:delete-outline"></ha-icon>
            </button>
          </div>
        </div>
      `;
    }

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

    // If cache not initialized yet, hydrate from entity
    if (!this._lastItemsHash) {
      const attr = itemsEntity.attributes.filtered_items;
      const items = typeof attr === 'string' ? this._safeParseJSON(attr, []) : Array.isArray(attr) ? attr : [];
      const limit = this.MAX_DISPLAY;
      this._cachedItems = filterValue.trim()
        ? items
        : items.slice(0, limit);
      const mapAttr = itemsEntity.attributes.source_map;
      this._cachedSourceMap = typeof mapAttr === 'string'
        ? this._safeParseJSON(mapAttr, {})
        : (mapAttr && typeof mapAttr === 'object') ? mapAttr : {};
      this._lastItemsHash = this._hash(items);
      this._lastSourceMapHash = this._hash(this._cachedSourceMap);
    }

    const totalItemsCount = parseInt(itemsEntity?.state, 10) || 0;
    const displayedItems = this._cachedItems || [];

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
            @click=${() => this._clearFilterPreservingTodoKey('')}
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
              ${this.config.filter_key_buttons.map(btn => {
                const label = btn.name || btn.filter_key || '';
                const icon = btn.icon;
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
          ? html`<div class="info" aria-live="polite">Filter: "${filterValue.trim()}" → ${displayedItems.length} Ergebnis${displayedItems.length !== 1 ? 'se' : ''}</div>`
          : totalItemsCount > (this.config.max_items_without_filter ?? 20)
          ? html`<div class="info" aria-live="polite">${displayedItems.length} von ${totalItemsCount} Einträgen</div>`
          : ''}

        ${displayedItems.length === 0
          ? html`<div class="empty-state" aria-live="polite">Keine Ergebnisse gefunden</div>`
          : html`<div role="list" aria-label="Trefferliste">${displayedItems.map((item) => this._renderItemRow(item, this._cachedSourceMap))}</div>`}
      </ha-card>
    `;
  }

  // Optional: Lovelace UI editor support
  static getConfigElement() {
    return null;
  }
  static getStubConfig() {
    return {
      title: 'ToDo List',
      filter_items_entity: 'sensor.todo_filtered_items',
      shopping_list_entity: 'todo.shopping_list',
      filter_entity: 'input_text.todo_filter',
    };
  }
}

if (!customElements.get('item-list-card')) {
  customElements.define('item-list-card', ItemListCard);
}
