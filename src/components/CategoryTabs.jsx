import React from 'react';

function CategoryTabs({ categories, selectedCategoryId, onSelectCategory }) {
  return (
    <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px' }}>
      {categories.map((category) => (
        <button
          key={category.categoryId}
          type="button"
          onClick={() => onSelectCategory(category.categoryId)}
          className="button"
          style={{
            background: category.categoryId === selectedCategoryId ? '#4f46e5' : '#f3f4f6',
            color: category.categoryId === selectedCategoryId ? '#ffffff' : '#111827',
            padding: '10px 14px',
          }}
        >
          {category.categoryName}
        </button>
      ))}
    </div>
  );
}

export default CategoryTabs;
