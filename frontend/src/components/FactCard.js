import React from 'react';
import { getCategoryColor, formatTime } from '../utils';
import './FactCard.css';

export const FactCard = ({ fact, isNew }) => {
  const categoryColor = getCategoryColor(fact.category);

  return (
    <article
      className={`fact-card ${isNew ? 'new' : ''}`}
      style={{ borderLeftColor: categoryColor }}
    >
      <div className="fact-header">
        <span
          className="category-badge"
          style={{ backgroundColor: categoryColor }}
        >
          {fact.category}
        </span>
        <span className="fact-time">{formatTime(fact.createdAt)}</span>
      </div>
      <p className="fact-text">{fact.text}</p>
    </article>
  );
};
