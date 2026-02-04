import React from 'react';
import { getCategoryColor } from '../utils';
import './StatsBar.css';

export const StatsBar = ({ stats }) => {
  return (
    <div className="stats-bar">
      <div className="stat-item">
        <span className="stat-value">{stats.total}</span>
        <span className="stat-label">Total Facts</span>
      </div>
      {stats.byCategory.slice(0, 5).map(cat => (
        <div key={cat._id} className="stat-item">
          <span
            className="stat-value"
            style={{ color: getCategoryColor(cat._id) }}
          >
            {cat.count}
          </span>
          <span className="stat-label">{cat._id}</span>
        </div>
      ))}
    </div>
  );
};
