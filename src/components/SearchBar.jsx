import React from 'react';

function SearchBar({ searchTerm, onSearchChange }) {
  return (
    <div style={{ margin: '16px 0' }}>
      <input
        className="input-field"
        type="search"
        placeholder="Search items..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
      />
    </div>
  );
}

export default SearchBar;
