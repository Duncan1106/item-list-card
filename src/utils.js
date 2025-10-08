import { html } from 'lit';

/**
 * Returns a debounced version of the given function `fn`.
 * The `fn` function will not be called until after `delay` milliseconds
 * have passed since the last time `debounced` was called.
 *
 * @param {function} fn - The function to debounce.
 * @param {number} [delay=200] - The delay between invocations of `fn`.
 * @returns {function} A new function that will debounce invocations of `fn`.
 * @property {function} cancel - Cancels the scheduled invocation of `fn`.
 */
export const debounce = (fn, delay = 200) => {
  let timer;
  const debounced = function (...a) {          // regular fn so its own "this" works
    clearTimeout(timer);
    timer = setTimeout(() => fn.call(this, ...a), delay);
  };
  debounced.cancel = () => clearTimeout(timer);
  return debounced;
};


/**
 * Shows a confirmation dialog with the given text to the user, and returns true if they confirmed.
 * If the browser does not support window.confirm, it will return false.
 * @param {Element} _el - Element to dispatch the event on. (ignored)
 * @param {string} text - Text to show in the confirmation dialog.
 * @returns {Promise<boolean>} Whether the user confirmed.
 */
export const confirmDialog = async (_el,  text) =>
  typeof window.confirm === 'function' ? window.confirm(text) : false;


/**
 * Splits the given text into an array of strings, where each string is either
 * a part of the original text that doesn't contain any search word, or a
 * `<span class="highlight">` element containing a matched search word.
 *
 * Implementation uses only string operations (no dynamic RegExp for matching; uses string ops and a whitespace split).
 * Matches words independently (case-insensitive) and prefers the longest match at any position to avoid overlaps.
 *
 * @param {string} text - The text to split.
 * @param {string} [term=''] - The search term (may contain multiple words, split on whitespace).
 * @returns {Array<string | TemplateResult>} Array of plain strings and html parts (via `html` template).
 */
export const highlightParts = (text, term) => {
  const src = String(text ?? '');
  const needle = String(term ?? '').trim();
  if (!needle) return [src];

  // Split on whitespace (static RegExp)
  const tokens = needle.split(/\s+/).map(w => w.trim()).filter(Boolean);
  if (!tokens.length) return [src];

  // Lowercase once for matching; dedupe by lowercase.
  // Note: For better Unicode/i18n support (e.g., Turkish), consider w.toLocaleLowerCase() if needed,
  // but toLowerCase() is faster for ASCII and matches original intent.
  const lowSrc = src.toLowerCase();
  // Search set, longest-first
  const sortedWords = Array.from(new Set(tokens.map(w => w.toLowerCase())))
    .sort((a, b) => b.length - a.length);

  // Helper: longest word length matching at exact index.
  const getLongestAtIndex = (index) => {
    for (const low of sortedWords) {
      if (lowSrc.startsWith(low, index)) return low.length; // longest-first
    }
    return 0;
  };

  const parts = [];
  let pos = 0;
  const N = src.length;

  while (pos < N) {
    // Step 1: Find the earliest next match position across all words.
    let minIndex = -1;
    for (const low of sortedWords) {
      const found = lowSrc.indexOf(low, pos);
      if (found === -1) continue;
      if (found === pos) {
        minIndex = pos;
        break; // Earliest possible—no need to check further.
      }
      if (minIndex === -1 || found < minIndex) {
        minIndex = found;
      }
    }

    if (minIndex === -1) {
      // No more matches.
      parts.push(src.slice(pos));
      break;
    }

    // Step 2: At minIndex, select the longest word that starts there.
    const matchLen = getLongestAtIndex(minIndex);

    // Push non-matching text before (if any).
    if (minIndex > pos) {
      parts.push(src.slice(pos, minIndex));
    }

    // Highlight the matched text (preserves original casing).
    const matchedText = src.slice(minIndex, minIndex + matchLen);
    parts.push(html`<span class="highlight">${matchedText}</span>`);

    pos = minIndex + matchLen;
  }

  return parts.length ? parts : [src];
};