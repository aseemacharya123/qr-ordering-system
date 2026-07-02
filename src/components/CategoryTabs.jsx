import React from 'react';

function CategoryTabs({ categories, selectedCategoryId, onSelectCategory }) {
  return (
    <div className="category-tabs">
      {categories.map((category) => (
        <button
          key={category.categoryId}
          type="button"
          onClick={() => onSelectCategory(category.categoryId)}
          className={
            'category-tab' +
            (category.categoryId === selectedCategoryId ? ' active' : '')
          }
        >
          {category.categoryName}
        </button>
      ))}
    </div>
  );
}

export default CategoryTabs;
