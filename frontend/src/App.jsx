import React, { useState, useMemo } from 'react';
import { Header, StatsBar, FilterBar, FactsGrid, Footer, LoginPage } from './components';
import { useFacts, useAuth } from './hooks';
import './App.css';

function App() {
  const { user, loading, loginUrl, logout } = useAuth();
  const { facts, stats, connectionStatus } = useFacts();
  const [filter, setFilter] = useState('all');

  const categories = useMemo(() => {
    return ['all', ...new Set(facts.map(f => f.category))];
  }, [facts]);

  const filteredFacts = useMemo(() => {
    return filter === 'all'
      ? facts
      : facts.filter(fact => fact.category === filter);
  }, [facts, filter]);

  if (loading) {
    return null;
  }

  if (!user) {
    return <LoginPage loginUrl={loginUrl} />;
  }

  return (
    <div className="app">
      <Header connectionStatus={connectionStatus} user={user} loginUrl={loginUrl} onLogout={logout} />
      <StatsBar stats={stats} />
      <FilterBar
        categories={categories}
        activeFilter={filter}
        onFilterChange={setFilter}
      />
      <main className="facts-container">
        <FactsGrid facts={filteredFacts} />
      </main>
      <Footer />
    </div>
  );
}

export default App;
