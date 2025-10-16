import { html } from 'lit';
import { isNumeric } from './data-handlers.js';

/**
 * Rendering helper functions for the item-list-card component
 */

/**
 * Renders the quantity controls for a given todo item, which can be an
 * increment/decrement button pair if the item's description is a numeric
 * string, or just a plain text display if it's not.
 * @param {Object} item The todo item to render.
 * @param {Object} sourceMap A map of source numbers to the corresponding
 * todo list entity ids.
 * @param {Set} pendingUpdates Set of pending update UIDs.
 * @param {function} updateOrCompleteItem Function to update or complete an item.
 * @returns {TemplateResult} The rendered quantity controls.
 */
export const renderQuantityControls = (item, sourceMap, pendingUpdates, updateOrCompleteItem) => {
  // Function returns HTML content as expected
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
    updateOrCompleteItem(item.u, { description: Math.max(quantity - 1, 0) }, item.c, sourceMap);
  };
  const inc = () => {
    if (pending) return;
    updateOrCompleteItem(item.u, { description: quantity + 1 }, item.c, sourceMap);
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
 * @param {Set} pendingUpdates Set of pending update UIDs.
 * @param {function} updateOrCompleteItem Function to update or complete an item.
 * @param {function} addToShoppingList Function to add item to shopping list.
 * @param {function} confirmAndComplete Function to confirm and complete an item.
 * @param {boolean} showOrigin Whether to show the origin.
 * @param {string} search The search term for highlighting.
 * @param {boolean} highlightMatches Whether to highlight matches.
 * @param {function} highlightParts Function to highlight parts of text.
 * @returns {TemplateResult} The rendered item row.
 */
export const renderItemRow = (item, sourceMap, pendingUpdates, updateOrCompleteItem, addToShoppingList, confirmAndComplete, showOrigin, search, highlightMatches, highlightParts) => {
  // Function returns HTML content as expected
  const friendlyName = showOrigin
    ? sourceMap?.[String(item.c)]?.friendly_name
    : null;

  const showHighlight = Boolean(search && highlightMatches);
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
        ${renderQuantityControls(item, sourceMap, pendingUpdates, updateOrCompleteItem)}
        <button class="btn" type="button" title="Zur Einkaufsliste" aria-label="Zur Einkaufsliste" @click=${() => addToShoppingList(item)}>
          <ha-icon icon="mdi:cart-outline"></ha-icon>
        </button>
        <button class="btn" type="button" title="Erledigt" aria-label="Erledigt" @click=${() => confirmAndComplete(item, sourceMap)}>
          <ha-icon icon="mdi:delete-outline"></ha-icon>
        </button>
      </div>
    </div>
  `;
};