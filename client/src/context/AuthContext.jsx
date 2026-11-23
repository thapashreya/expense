import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { apiRequest } from '../lib/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refreshUser = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { user: currentUser } = await apiRequest('/auth/me');
      setUser(currentUser);
    } catch (requestError) {
      setUser(null);
      if (requestError.status !== 401) setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const register = useCallback(async (details) => {
    const result = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(details),
    });
    setUser(result.user);
    setError('');
    return result.user;
  }, []);

  const login = useCallback(async (credentials) => {
    const result = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    setUser(result.user);
    setError('');
    return result.user;
  }, []);

  const logout = useCallback(async () => {
    await apiRequest('/auth/logout', { method: 'POST' });
    setUser(null);
    setError('');
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, error, refreshUser, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
