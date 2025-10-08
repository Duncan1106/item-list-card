import { confirmDialog } from './utils.js';
import { normalizeTodoText } from './dataUtils.js';

/**
 * Dispatches a hass-notification event on the given element (if it exists),
 * creating a toast notification with the given message.
 *
 * @param {Element} el - Element to dispatch the event on.
 * @param {string} message - Message to show in the toast.
 */
const showToast = (el, message) => {
  if (!el) return;
  el.dispatchEvent(new CustomEvent('hass-notification', {
    detail: { message }, bubbles: true, composed: true,
  }));
};

/**
 * Calls the given Home Assistant service with the given data, and shows a
 * toast notification on the given element if the call fails. If no element
 * is given, the error is only logged to the console.
 *
 * @param {HomeAssistant} hass - The Home Assistant instance to call the service on.
 * @param {string} domain - The domain of the service to call.
 * @param {string} service - The service to call.
 * @param {object} data - The data to pass to the service.
 * @param {Element} [toastEl] - Element to dispatch the error notification on. If not given, the error is only logged.
 * @param {string} [fallbackMsg='Fehler'] - The message to show in the toast if the call fails.
 * @throws The error that occurred during the service call if it fails.
 */
const callService = async (hass, domain, service, data, toastEl, fallbackMsg = 'Fehler') => {
  try {
    await hass.callService(domain, service, data);
  } catch (err) {
    console.error(`Error calling ${domain}.${service}:`, err);
    showToast(toastEl, fallbackMsg);
    throw err;
  }
};

/**
 * Updates the value of the input_text entity specified in the config
 * (filter_entity) to the given value. If the value is falsy, the
 * filter text is cleared. If the value is the same as the current
 * value, nothing is done. If there is an error, it is logged to the
 * console.
 * @param {HomeAssistant} hass - The Home Assistant instance.
 * @param {Object} config - The configuration object.
 * @param {string} value - The value to set the filter text to.
 * @param {Element} element - The element to dispatch error notifications on.
 * @returns {Promise<void>}
 */
export const setFilterService = async (hass, config, value, element) => {
  const entityId = config?.filter_entity;
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
      { entity_id: entityId, value: value ?? '' },
      element,
      'Fehler beim Aktualisieren des Suchfeldes');
  } catch (err) {
    console.error("Error in setFilterService:", err);
    // Revert on failure to previous value - but since it's a function, caller handles
    throw err;
  }
};

/**
 * Updates an item in the given todo list, identified by the given `uid`.
 * The `updates` object contains the new values for the item, such as a new
 * description or a new completed state.
 * If the item is updated successfully, the cached item description is
 * updated immediately to reflect the new state.
 * If the update fails, the cached item description is reverted to its
 * previous value.
 * @param {HomeAssistant} hass - The Home Assistant instance.
 * @param {string} uid - The unique id of the item to update.
 * @param {Object} updates - The new values for the item.
 * @param {number} source - The source of the item to update.
 * @param {Object} sourceMap - A map of source numbers to the
 * corresponding todo list entity ids.
 * @param {Element} element - The element to dispatch error notifications on.
 * @param {Function} addPending - Function to add pending update.
 * @param {Function} removePending - Function to remove pending update.
 * @param {Array} cachedItems - The cached items array.
 * @param {Function} updateCachedItems - Function to update cached items.
 * @returns {Promise<void>} A promise that resolves when the update is
 * done, or rejects if the update fails.
 */
export const updateOrCompleteItem = async (hass, uid, updates, source, sourceMap, element, addPending, removePending, cachedItems, updateCachedItems) => {
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
      updateCachedItems(newItems);
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
      element,
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
        updateCachedItems(newItems);
      }
    }
    removePending(uid);
  }
};

/**
 * Adds the normalized filter text to the shopping list after confirmation.
 * @param {HomeAssistant} hass - The Home Assistant instance.
 * @param {Object} config - The configuration object.
 * @param {string} filterValue - The current filter value.
 * @param {Element} element - The element to dispatch notifications on.
 * @returns {Promise<void>}
 */
export const addFilterTextToShoppingList = async (hass, config, filterValue, element) => {
  const raw = filterValue || '';
  const value = normalizeTodoText(raw);
  if (!value) return;

  const ok = await confirmDialog(element, `Möchtest du "${value}" zur Einkaufsliste hinzufügen?`);
  if (!ok) return;
  await callService(hass, 'todo', 'add_item',
    { entity_id: config.shopping_list_entity, item: value, description: '' },
    element,
    'Konnte \''+value+'\' **nicht** zur Einkaufsliste hinzufügen'
  );
};

/**
 * Adds an item to the shopping list if the user confirms the dialog
 * @param {HomeAssistant} hass - The Home Assistant instance.
 * @param {Object} config - The configuration object.
 * @param {Object} item - The todo item to add.
 * @param {Element} element - The element to dispatch notifications on.
 * @returns {Promise<void>}
 */
export const addToShoppingList = async (hass, config, item, element) => {
  const entityId = config.shopping_list_entity;
  if (!entityId) {
    console.error('No valid shopping list entity id configured');
    return;
  }
  const ok = await confirmDialog(element, `Möchtest du "${item.s}" zur Einkaufsliste hinzufügen?`);
  if (!ok) return;
  await callService(hass, 'todo', 'add_item',
    { entity_id: entityId, item: item.s, description: '' },
    element,
    'Einkaufsliste aktualisieren fehlgeschlagen'
  );
};