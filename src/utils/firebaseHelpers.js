/**
 * Firebase Realtime Database Utility Helpers for AstroMed Sentinel
 */

// Replace characters not allowed in Firebase keys: . $ # [ ] /
export const safeId = (id) => {
  if (id === undefined || id === null) {
    return `id_${Date.now()}`;
  }
  return String(id).replace(/[.#$\[\]\/]/g, '_');
};

// Strips undefined values because Firebase RTDB rejects them
export const clean = (obj) => {
  if (obj === undefined) return null;
  try {
    return JSON.parse(JSON.stringify(obj));
  } catch (err) {
    console.error('Error cleaning object for Firebase:', err);
    return obj;
  }
};

// Converts Firebase snapshot value (object keyed by ID, or array) to a list of items
export const toList = (snapshotValue) => {
  if (!snapshotValue) return null;

  if (Array.isArray(snapshotValue)) {
    return snapshotValue
      .filter((item) => item !== null && item !== undefined)
      .map((item, idx) => {
        if (typeof item === 'object' && item !== null) {
          return { ...item, id: item.id !== undefined ? item.id : idx };
        }
        return item;
      });
  }

  if (typeof snapshotValue === 'object') {
    return Object.entries(snapshotValue)
      .filter(([_, val]) => val !== null && val !== undefined)
      .map(([key, val]) => {
        if (typeof val === 'object' && val !== null) {
          return { ...val, id: val.id !== undefined ? val.id : key };
        }
        return val;
      });
  }

  return [];
};

// Converts an array of items into an object keyed by safeId(item.id)
export const toObjectMap = (list) => {
  if (!Array.isArray(list)) return {};
  const map = {};
  for (const item of list) {
    if (!item) continue;
    const key = safeId(item.id);
    map[key] = clean(item);
  }
  return map;
};
