import React from 'react';
import './Header.css';

export const Header = ({ connectionStatus, user, loginUrl, onLogout }) => {
  const statusText = connectionStatus === 'connected' ? 'Live' : connectionStatus;

  return (
    <header className="header">
      <h1>Real-time Facts Dashboard</h1>
      <div className="header-right">
        <div className="connection-status">
          <span className={`status-dot ${connectionStatus}`}></span>
          <span className="status-text">{statusText}</span>
        </div>
        {user ? (
          <div className="user-info">
            <span className="user-name">{user.displayName}</span>
            <button className="logout-btn" onClick={onLogout}>Logout</button>
          </div>
        ) : (
          <a href={loginUrl} className="login-link">Sign in</a>
        )}
      </div>
    </header>
  );
};
