import React from 'react';
import './Header.css';

export const Header = ({ connectionStatus }) => {
  const statusText = connectionStatus === 'connected' ? 'Live' : connectionStatus;

  return (
    <header className="header">
      <h1>Real-time Facts Dashboard</h1>
      <div className="connection-status">
        <span className={`status-dot ${connectionStatus}`}></span>
        <span className="status-text">{statusText}</span>
      </div>
    </header>
  );
};
