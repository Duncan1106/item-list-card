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