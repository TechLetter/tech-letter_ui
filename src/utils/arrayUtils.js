export function mergeUniqueByKey(existingItems, newItems, key = "id") {
  const seenKeys = new Set();
  const merged = [];

  [...existingItems, ...newItems].forEach((item) => {
    const keyValue = item?.[key];
    if (keyValue === undefined || keyValue === null || seenKeys.has(keyValue)) {
      return;
    }
    seenKeys.add(keyValue);
    merged.push(item);
  });

  return merged;
}
