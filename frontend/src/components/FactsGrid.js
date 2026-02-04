import React from 'react';
import { FactCard } from './FactCard';
import './FactsGrid.css';

export const FactsGrid = ({ facts }) => {
  if (facts.length === 0) {
    return (
      <div className="no-facts">
        <p>Waiting for facts...</p>
        <div className="loader"></div>
      </div>
    );
  }

  return (
    <div className="facts-grid">
      {facts.map((fact, index) => (
        <FactCard
          key={fact._id || index}
          fact={fact}
          isNew={index === 0}
        />
      ))}
    </div>
  );
};
