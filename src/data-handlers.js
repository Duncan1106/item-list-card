import { callService, confirmDialog } from './utils.js';

/**
 * Data manipulation and state management functions for the item-list-card component
 */

/**
 * Tries to parse the given string as JSON and returns the result. If the
 * parsing fails, it returns the given fallback value instead.
 * @param {string} s The string to parse
 * @param {*} fallback The value to return if the parsing fails
 * @returns {*} The parsed JSON or the fallback value
 */
export const safeParseJSON = (s, fallback) => {
  try {
    return JSON.parse(s);
  } catch {
    return fallback;
  }
};

/**
 * Computes a fingerprint (string) from the given entity that represents the
 * current state of the items (filtered_items) and their source map.
 * This fingerprint is used to detect changes in the items or source map.
 * @param {Object} entity The entity to compute the fingerprint for.
 * @returns {string|null} The computed fingerprint or null if the entity is null.
 */
export const computeItemsFingerprint = (entity) => {
  if (!entity) return null;
  const itemsAttr = entity.attributes?.filtered_items;
  const itemsPart = typeof itemsAttr === 'string' ? itemsAttr : JSON.stringify(itemsAttr ?? []);
  const mapAttr = entity.attributes?.source_map;
  const mapPart = typeof mapAttr === 'string' ? mapAttr : JSON.stringify(mapAttr ?? {});
  // Include the numeric state (total count) to catch count-only changes too.
  return `${entity.state}|${itemsPart}|${mapPart}`;
};

/**
 * Returns true if the given string consists only of digits.
 * @param {string} str The string to check
 * @returns {boolean} Whether the string consists only of digits
 */
export const isNumeric = (str) => {
  return typeof str === 'string' && /^\d+$/.test(str);
};

/**
 * Normalize the given text by removing any leading "todo:" prefix and
 * trimming the resulting string. If the text does not start with "todo:"
 * or if it is empty, it is returned as-is.
 * @param {string} raw - The text to normalize.
 * @returns {string} The normalized text.
 */
export const normalizeTodoText = (raw) => {
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
};

/**
 * Parse the comma separated config string this.config.show_more_buttons
 * into an array of positive integers (deduplicated and sorted ascending).
 * Returns [] when none available.
 * @param {string} configString - The comma-separated string of button values
 * @returns {number[]}
 */
export const parseShowMoreButtons = (configString) => {
  const raw = String(configString ?? '').trim();
  if (!raw) return [];
  const parts = raw.split(',').map((s) => s.trim()).filter(Boolean);
  const nums = parts
    .map((p) => {
      const n = Number(p);
      return Number.isFinite(n) && n > 0 ? Math.floor(n) : null;
    })
    .filter((n) => n !== null);
  // dedupe and sort
  return Array.from(new Set(nums)).sort((a, b) => a - b);
};

/**
 * Updates an item in the given todo list, identified by the given `uid`.
 * The `updates` object contains the new values for the item, such as a new
 * description or a new completed state.
 * If the item is updated successfully, the cached item description is
 * updated immediately to reflect the new state.
 * If the update fails, the cached item description is reverted to its
 * previous value.
 * @param {string} uid - The unique id of the item to update.
 * @param {Object} updates - The new values for the item.
 * @param {number} source - The source of the item to update.
 * @param {Object} sourceMap - A map of source numbers to the
 * corresponding todo list entity ids.
 * @param {HomeAssistant} hass - The Home Assistant instance.
 * @param {Element} toastEl - Element to dispatch error notifications on.
 * @param {Array} cachedItems - The cached items array to update optimistically.
 * @param {function} addPending - Function to add pending update.
 * @param {function} removePending - Function to remove pending update.
 * @returns {Promise<void>} A promise that resolves when the update is
 * done, or rejects if the update fails.
 */
export const updateOrCompleteItem = async (uid, updates, source, sourceMap, hass, toastEl, cachedItems, addPending, removePending) => {
  // const entityId = sourceMap?.[String(source)];
  const entityId = sourceMap?.[String(source)]?.entity_id;
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
  if (newDesc !== undefined && Array.isArray(cachedItems)) {
    const idx = cachedItems.findIndex(it => String(it.u) === String(uid));
    if (idx >= 0) {
      // copy array and item to trigger reactive update
      const newItems = cachedItems.slice();
      previousDesc = newItems[idx].d;
      // set optimistic value (keep numeric-ish as string to match how items store d)
      newItems[idx] = { ...newItems[idx], d: newDesc };
      // Update the cachedItems reference
      cachedItems.splice(0, cachedItems.length, ...newItems);
    }
  }

  // mark pending so UI can disable controls for this UID (use reassignment
  // so Lit reliably notices the change)
  addPending(uid);

  try {
    // Use shared callService wrapper (will show toast on failure)
    await callService(
      hass,
      'todo',
      'update_item',
      data,
      toastEl,
      'Fehler beim Aktualisieren des Eintrags'
    );
    // success => nothing else to do here
    /* success */
    removePending(uid);
  } catch (err) {
    console.error('todo/update_item:', err);
    // revert
    if (previousDesc !== null && Array.isArray(cachedItems)) {
      const idx = cachedItems.findIndex(it => String(it.u) === String(uid));
      if (idx >= 0) {
        const newItems = cachedItems.slice();
        newItems[idx] = { ...newItems[idx], d: previousDesc };
        cachedItems.splice(0, cachedItems.length, ...newItems);
      }
    }
    removePending(uid);
  }
};

/**
 * Confirms and completes an item.
 * @param {Object} item - The todo item to complete.
 * @param {Object} sourceMap - A map of source numbers to entity ids.
 * @param {HomeAssistant} hass - The Home Assistant instance.
 * @param {Element} toastEl - Element to dispatch error notifications on.
 * @param {Array} cachedItems - The cached items array.
 * @param {function} addPending - Function to add pending update.
 * @param {function} removePending - Function to remove pending update.
 */
export const confirmAndComplete = async (item, sourceMap, hass, toastEl, cachedItems, addPending, removePending) => {
  const ok = await confirmDialog(toastEl, `Möchtest du "${item.s}" wirklich als erledigt markieren?`);
  if (!ok) return;
  // Uses UID placed in 'item' field as required by your service
  await updateOrCompleteItem(item.u, { status: 'completed' }, item.c, sourceMap, hass, toastEl, cachedItems, addPending, removePending);
};

/**
 * Adds an item to the shopping list if the user confirms the dialog.
 * @param {Object} item - The todo item to add.
 * @param {string} shoppingListEntity - The shopping list entity ID.
 * @param {HomeAssistant} hass - The Home Assistant instance.
 * @param {Element} toastEl - Element to dispatch error notifications on.
 */
export const addToShoppingList = async (item, shoppingListEntity, hass, toastEl) => {
  const entityId = String(shoppingListEntity);
  if (!entityId) {
    console.error('No valid shopping list entity id configured');
    return;
  }
  const ok = await confirmDialog(toastEl, `Möchtest du "${item.s}" zur Einkaufsliste hinzufügen?`);
  if (!ok) return;
  await callService(hass, 'todo', 'add_item',
    { entity_id: entityId, item: String(item.s), description: '' },
    toastEl,
    'Einkaufsliste aktualisieren fehlgeschlagen'
  );
};

/**
 * Updates the value of the input_text entity specified in the config
 * (filter_entity) to the given value. If the value is falsy, the
 * filter text is cleared. If the value is the same as the current
 * value, nothing is done. If there is an error, it is logged to the
 * console.
 * @param {string} entityId - The entity ID to update.
 * @param {HomeAssistant} hass - The Home Assistant instance.
 * @param {string} previous - The previous value.
 * @param {string} value - The value to set.
 * @param {Element} toastEl - Element to dispatch error notifications on.
 * @param {function} setFilterValue - Function to update the filter value state.
 * @param {function} requestUpdate - Function to request component update.
 */
export const setFilterService = async (entityId, hass, previous, value, toastEl, setFilterValue, requestUpdate) => {
  if (!entityId || !hass) {
    return;
  }
  const current = hass.states?.[entityId]?.state ?? '';
  // compare raw values so trailing spaces cause an update
  const curRaw = String(current);
  const valRaw = String(value ?? '');
  if (curRaw === valRaw) return;

  try {
    await callService(hass, 'input_text', 'set_value',
      { entity_id: String(entityId), value: String(value ?? '') },
      toastEl,
      'Fehler beim Aktualisieren des Suchfeldes');
  } catch (err) {
    console.error("Error in setFilterService:", err);
    // Revert on failure to previous value
    setFilterValue(previous);
    requestUpdate();
  }
};

/**
 * Clears the filter text completely if there is no token in the current filter text
 * that matches the pattern "todo:<filterKey>" or if the only token is exactly
 * "todo:<filterKey>". If there is a token like "todo:<filterKey>" present, only
 * this token is preserved and the rest of the text is cleared. This is useful
 * when the user clicks on the "clear filter" button and we want to keep the
 * currently selected filter key.
 * @param {string} filterEntity - The filter entity ID.
 * @param {HomeAssistant} hass - The Home Assistant instance.
 * @param {function} setFilterValue - Function to update the filter value state.
 * @param {function} requestUpdate - Function to request component update.
 * @param {function} setFilterService - Function to call the filter service.
 */
export const clearFilterPreservingTodoKey = async (filterEntity, hass, setFilterValue, requestUpdate, setFilterService) => {
  try {
    const entityId = String(filterEntity);
    const current = hass?.states?.[entityId]?.state ?? '';
    const trimmed = String(current).trim();
    if (!trimmed) {
      // nothing to do
      const previous = setFilterValue();
      const value = '';
      setFilterValue(value);
      requestUpdate();
      await setFilterService(entityId, hass, previous, value, null, setFilterValue, requestUpdate);
      return;
    }

    // find token like todo:somekey (no spaces inside)
    const tokens = trimmed.split(/\s+/).filter(Boolean);
    const todoTokenIndex = tokens.findIndex(t => /^todo:[^\s]+$/.test(t));

    if (todoTokenIndex === -1) {
      // no todo:key => clear completely
      const previous = setFilterValue();
      const value = '';
      setFilterValue(value);
      requestUpdate();
      await setFilterService(entityId, hass, previous, value, null, setFilterValue, requestUpdate);
      return;
    }

    // If the todo token is the only token present, clear it completely.
    if (tokens.length === 1) {
      const previous = setFilterValue();
      const value = '';
      setFilterValue(value);
      requestUpdate();
      await setFilterService(entityId, hass, previous, value, null, setFilterValue, requestUpdate);
      return;
    }

    // preserve only the todo:key token (keep original case)
    const preserved = tokens[todoTokenIndex];

    // If the todo token is the only token, set it with a trailing space.
    // Also when preserving from multiple tokens we add a trailing space so the
    // user can continue typing after the key.
    const previous = setFilterValue();
    const value = preserved + ' ';
    setFilterValue(value);
    requestUpdate();
    await setFilterService(entityId, hass, previous, value, null, setFilterValue, requestUpdate);
  } catch (err) {
    console.error('Error while clearing filter:', err);
    const prev = setFilterValue();
    const val = '';
    setFilterValue(val);
    requestUpdate();
    await setFilterService(null, hass, prev, val, null, setFilterValue, requestUpdate);
  }
};

/**
 * Handles a click on one of the filter key buttons. The value in the
 * input_text entity is updated immediately to the corresponding
 * "todo:<filterKey>" string. If the filterKey is falsy, nothing is done.
 * @param {string} filterKey - The key to filter by.
 * @param {string} filterEntity - The filter entity ID.
 * @param {HomeAssistant} hass - The Home Assistant instance.
 * @param {function} setFilterValue - Function to update the filter value state.
 * @param {function} requestUpdate - Function to request component update.
 * @param {function} setFilterService - Function to call the filter service.
 */
export const onFilterKeyButtonClick = async (filterKey, filterEntity, hass, setFilterValue, requestUpdate, setFilterService) => {
  if (!filterKey) return;
  const value = `todo:${String(filterKey)} `;
  const previous = setFilterValue();
  setFilterValue(value);
  requestUpdate();
  await setFilterService(String(filterEntity), hass, previous, value, null, setFilterValue, requestUpdate);
};

/**
 * Handles the input event of the filter input field by calling the
 * debounced version of `updateFilterTextActual` with the current value
 * of the input field. This is necessary because the input event is
 * triggered on every key press, but we don't want to update the filter
 * on every key press, but only after the user has stopped typing for
 * a short period of time.
 * @param {Event} e - The input event.
 * @param {function} setFilterValue - Function to update the filter value state.
 * @param {function} requestUpdate - Function to request component update.
 * @param {function} debouncedSetFilter - The debounced filter setter.
 */
export const handleFilterInputChange = (e, setFilterValue, requestUpdate, debouncedSetFilter) => {
  const newValue = e.target.value;
  if (newValue !== setFilterValue()) {
    const previous = setFilterValue();
    setFilterValue(newValue);
    requestUpdate();
    debouncedSetFilter(previous, newValue);
  }
};

/**
 * Handles keydown events on the filter input.
 * @param {Event} e - The keydown event.
 * @param {string} filterValue - The current filter value.
 * @param {function} setFilterValue - Function to update the filter value state.
 * @param {function} requestUpdate - Function to request component update.
 * @param {function} setFilterService - Function to call the filter service.
 * @param {function} addFilterTextToShoppingList - Function to add filter text to shopping list.
 */
export const onInputKeydown = async (e, filterValue, setFilterValue, requestUpdate, setFilterService, addFilterTextToShoppingList) => {
  if (e.key === 'Enter') {
    const val = (e.currentTarget?.value || '').trim();
    if (!val) return;
    if (val.length > 3) await addFilterTextToShoppingList();
  } else if (e.key === 'Escape') {
    const previous = filterValue;
    const value = '';
    setFilterValue(value);
    requestUpdate();
    await setFilterService(String(null), null, previous, value, null, setFilterValue, requestUpdate);
  }
};

/**
 * Adds the current filter text to the shopping list.
 * @param {string} filterValue - The current filter value.
 * @param {string} shoppingListEntity - The shopping list entity ID.
 * @param {HomeAssistant} hass - The Home Assistant instance.
 * @param {Element} toastEl - Element to dispatch error notifications on.
 */
export const addFilterTextToShoppingList = async (filterValue, shoppingListEntity, hass, toastEl) => {
  const raw = filterValue || '';
  const value = normalizeTodoText(raw);
  if (!value) return;

  const ok = await confirmDialog(toastEl, `Möchtest du "${value}" zur Einkaufsliste hinzufügen?`);
  if (!ok) return;
  await callService(hass, 'todo', 'add_item',
    { entity_id: String(shoppingListEntity), item: String(value), description: '' },
    toastEl,
    'Konnte \''+value+'\' **nicht** zur Einkaufsliste hinzufügen'
  );
};

/**
 * Increases the display limit of the list by the given amount.
 * @param {number|string|undefined} option - Number of items to add to the
 *   display limit, or a string that can be parsed as a number. If `'all'` or
 *   `'rest'`, the list will show all items. If `undefined`, the default is
 *   10. If any other value, the default is 10.
 * @param {Array} items - The full items list.
 * @param {number} displayLimit - The current display limit.
 * @param {function} setDisplayLimit - Function to set the display limit.
 * @param {function} setCachedItems - Function to set the cached items.
 */
export const showMore = (option, items, displayLimit, setDisplayLimit, setCachedItems) => {
  // ensure displayLimit initialized
  if (displayLimit === undefined || displayLimit === null) {
    displayLimit = 50; // Default to MAX_WITH_FILTER
  }

  // Determine the new limit
  let newLimit = displayLimit;

  if (typeof option === 'string') {
    const lower = option.toLowerCase().trim();
    if (lower === 'all' || lower === 'rest') {
      // show everything
      newLimit = items.length;
    } else {
      // try parsing string as number
      const parsed = Number(option);
      if (Number.isFinite(parsed) && parsed > 0) {
        newLimit = Math.min(displayLimit + Math.floor(parsed), items.length);
      } else {
        // default when invalid string
        newLimit = Math.min(displayLimit + 10, items.length);
      }
    }
  } else if (typeof option === 'number') {
    if (Number.isFinite(option) && option > 0) {
      newLimit = Math.min(displayLimit + Math.floor(option), items.length);
    } else {
      // default when non-positive/invalid number
      newLimit = Math.min(displayLimit + 10, items.length);
    }
  } else if (typeof option === 'undefined') {
    // no argument -> default 10
    newLimit = Math.min(displayLimit + 10, items.length);
  } else {
    // fallback for other types
    newLimit = Math.min(displayLimit + 10, items.length);
  }

  // Apply new limit and update cached items
  setDisplayLimit(newLimit);
  setCachedItems(items.slice(0, newLimit));
};