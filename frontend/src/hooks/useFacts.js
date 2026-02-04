import { useState, useEffect, useCallback } from 'react';
import { API_URL, updateCategoryCount } from '../utils';
import { useWebSocket } from './useWebSocket';

export const useFacts = () => {
  const [facts, setFacts] = useState([]);
  const [stats, setStats] = useState({ total: 0, byCategory: [] });

  const handleWebSocketMessage = useCallback((message) => {
    if (message.type === 'NEW_FACT') {
      setFacts(prev => [message.payload, ...prev].slice(0, 100));
      setStats(prev => ({
        ...prev,
        total: prev.total + 1,
        byCategory: updateCategoryCount(prev.byCategory, message.payload.category)
      }));
    }
  }, []);

  const { connectionStatus } = useWebSocket(handleWebSocketMessage);

  const fetchInitialFacts = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/facts?limit=50`);
      const data = await response.json();
      setFacts(data);
    } catch (error) {
      console.error('Failed to fetch initial facts:', error);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/facts/stats`);
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  }, []);

  useEffect(() => {
    fetchInitialFacts();
    fetchStats();
  }, [fetchInitialFacts, fetchStats]);

  return { facts, stats, connectionStatus };
};
