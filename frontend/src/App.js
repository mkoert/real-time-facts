import React, { useState, useMemo } from 'react';
import { Header, StatsBar, FilterBar, FactsGrid, Footer } from './components';
import { useFacts } from './hooks';
import './App.css';

function App() {
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

  return (
    <div className="app">
      <Header connectionStatus={connectionStatus} />
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
