import React from 'react';
import { getCategoryColor } from '../utils';
import './FilterBar.css';

export const FilterBar = ({ categories, activeFilter, onFilterChange }) => {
  return (
    <div className="filter-bar">
      {categories.map(cat => (
        <button
          key={cat}
          className={`filter-btn ${activeFilter === cat ? 'active' : ''}`}
          onClick={() => onFilterChange(cat)}
          style={
            activeFilter === cat && cat !== 'all'
              ? { backgroundColor: getCategoryColor(cat) }
              : {}
          }
        >
          {cat}
        </button>
      ))}
    </div>
  );
};
