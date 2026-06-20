export function groupRulesByCategory(categories = []) {
  return categories.reduce((map, category) => {
    map[category.id] = category.rules || [];
    return map;
  }, {});
}
