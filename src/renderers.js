import { html } from 'lit';
import { highlightParts } from './utils.js';
import { isNumeric, normalizeTodoText } from './dataUtils.js';

/**
 * Parse the comma separated config string this.config.show_more_buttons
 * into an array of positive integers (deduplicated and sorted ascending).
 * Returns [] when none available.
 * @param {Object} config - The configuration object.
 * @returns {number[]}
 */
export const parseShowMoreButtons = (config) => {
  const raw = String(config?.show_more_buttons ?? '').trim();
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
 * Renders the quantity controls for a given todo item, which can be an
 * increment/decrement button pair if the item's description is a numeric
 * string, or just a plain text display if it's not.
 * @param {Object} item The todo item to render.
 * @param {Object} sourceMap A map of source numbers to the corresponding
 * todo list entity ids.
 * @param {Set} pendingUpdates The set of pending updates.
 * @param {Function} updateOrCompleteItem Function to update or complete item.
 * @param {HomeAssistant} hass The Home Assistant instance.
 * @param {Element} element The element for notifications.
 * @param {Function} addPending Function to add pending.
 * @param {Function} removePending Function to remove pending.
 * @param {Array} cachedItems The cached items.
 * @param {Function} updateCachedItems Function to update cached items.
 * @returns {TemplateResult} The rendered quantity controls.
 */
export const renderQuantityControls = (item, sourceMap, pendingUpdates, updateOrCompleteItem, hass, element, addPending, removePending, cachedItems, updateCachedItems) => {
  let qStr = String(item.d ?? '');
  if (qStr === '') qStr = '1';

  // if not numeric, just show text
  if (!isNumeric(qStr)) {
    return html`<div class="quantity" title="Menge">${qStr}</div>`;
  }
  const quantity = parseInt(qStr, 10);
  const pending = pendingUpdates.has(item.u);

  const dec = () => {
    if (pending) return;
    updateOrCompleteItem(hass, item.u, { description: Math.max(quantity - 1, 0) }, item.c, sourceMap, element, addPending, removePending, cachedItems, updateCachedItems);
  };
  const inc = () => {
    if (pending) return;
    updateOrCompleteItem(hass, item.u, { description: quantity + 1 }, item.c, sourceMap, element, addPending, removePending, cachedItems, updateCachedItems);
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
};

/**
 * Renders a single todo item row with quantity controls and a button to add
 * the item to the shopping list. If the item is part of a list that has an
 * origin (i.e. a sourceMap), it will also display the origin's friendly name
 * as a sub-label below the item summary. If the item's description is a
 * numeric string, it will be rendered as a quantity control. If the item's
 * description is not numeric, it will be rendered as plain text.
 * @param {Object} item The todo item to render.
 * @param {Object} sourceMap A map of source numbers to the corresponding
 * todo list entity ids.
 * @param {Object} config The configuration object.
 * @param {string} filterValue The current filter value.
 * @param {Set} pendingUpdates The set of pending updates.
 * @param {Function} updateOrCompleteItem Function to update or complete item.
 * @param {Function} addToShoppingList Function to add to shopping list.
 * @param {Function} confirmAndComplete Function to confirm and complete.
 * @param {HomeAssistant} hass The Home Assistant instance.
 * @param {Element} element The element for notifications.
 * @param {Function} addPending Function to add pending.
 * @param {Function} removePending Function to remove pending.
 * @param {Array} cachedItems The cached items.
 * @param {Function} updateCachedItems Function to update cached items.
 * @returns {TemplateResult} The rendered item row.
 */
export const renderItemRow = (item, sourceMap, config, filterValue, pendingUpdates, updateOrCompleteItem, addToShoppingList, confirmAndComplete, hass, element, addPending, removePending, cachedItems, updateCachedItems) => {
  const showOrigin = !!config?.show_origin;
  const friendlyName = showOrigin
    ? sourceMap?.[String(item.c)]?.friendly_name
    : null;

  const search = normalizeTodoText(filterValue);
  const showHighlight = Boolean(search && config.highlight_matches);
  const contentParts = showHighlight
    ? highlightParts(item.s, search)
    : [String(item.s ?? '')];

  return html`
    <div class="item-row" role="listitem">
      <div class="item-summary" title=${item.s}>
        ${contentParts}
        ${friendlyName ? html`<div class="item-sublabel">${friendlyName}</div>` : ''}
      </div>
      <div class="item-controls">
        ${renderQuantityControls(item, sourceMap, pendingUpdates, updateOrCompleteItem, hass, element, addPending, removePending, cachedItems, updateCachedItems)}
        <button class="btn" type="button" title="Zur Einkaufsliste" aria-label="Zur Einkaufsliste" @click=${() => addToShoppingList(hass, config, item, element)}>
          <ha-icon icon="mdi:cart-outline"></ha-icon>
        </button>
        <button class="btn" type="button" title="Erledigt" aria-label="Erledigt" @click=${() => confirmAndComplete(item, sourceMap, hass, element, updateOrCompleteItem, addPending, removePending, cachedItems, updateCachedItems)}>
          <ha-icon icon="mdi:delete-outline"></ha-icon>
        </button>
      </div>
    </div>
  `;
};