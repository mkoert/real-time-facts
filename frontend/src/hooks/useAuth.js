import { useState, useEffect, useCallback } from 'react';
import { API_URL } from '../utils';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    try {
      const baseUrl = new URL(API_URL).origin;
      const response = await fetch(`${baseUrl}/auth/me`, { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setUser(data);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const loginUrl = (() => {
    const baseUrl = new URL(API_URL).origin;
    return `${baseUrl}/auth/google`;
  })();

  const logout = useCallback(async () => {
    try {
      const baseUrl = new URL(API_URL).origin;
      await fetch(`${baseUrl}/auth/logout`, { credentials: 'include' });
      setUser(null);
    } catch {
      setUser(null);
    }
  }, []);

  return { user, loading, loginUrl, logout };
};
