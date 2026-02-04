import { CATEGORY_COLORS, DEFAULT_COLOR } from './constants';

export const getCategoryColor = (category) => {
  return CATEGORY_COLORS[category] || DEFAULT_COLOR;
};

export const formatTime = (dateString) => {
  return new Date(dateString).toLocaleTimeString();
};

export const updateCategoryCount = (categories, newCategory) => {
  const existing = categories.find(c => c._id === newCategory);
  if (existing) {
    return categories.map(c =>
      c._id === newCategory ? { ...c, count: c.count + 1 } : c
    );
  }
  return [...categories, { _id: newCategory, count: 1 }];
};
