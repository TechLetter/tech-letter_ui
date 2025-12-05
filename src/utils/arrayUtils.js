export function mergeUniqueByKey(existingItems, newItems, key = "id") {
  const seenKeys = new Set();
  const merged = [];

  existingItems.forEach((item) => {
    if (!item) {
      return;
    }
    const keyValue = item[key];
    if (keyValue === undefined || keyValue === null) {
      return;
    }
    if (seenKeys.has(keyValue)) {
      return;
    }
    seenKeys.add(keyValue);
    merged.push(item);
  });

  newItems.forEach((item) => {
    if (!item) {
      return;
    }
    const keyValue = item[key];
    if (keyValue === undefined || keyValue === null) {
      return;
    }
    if (seenKeys.has(keyValue)) {
      return;
    }
    seenKeys.add(keyValue);
    merged.push(item);
  });

  return merged;
}

const arrayUtils = {
  mergeUniqueByKey,
};

export default arrayUtils;
