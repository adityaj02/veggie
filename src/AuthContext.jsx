import { createContext, useContext, useState, useEffect } from 'react';
import { API_BASE } from './config';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch(`${API_BASE}/api/auth/me`);
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        }
      } catch (err) {
        console.error('Failed to fetch auth status', err);
      } finally {
        setIsLoading(false);
      }
    }
    checkAuth();
  }, []);

  const login = () => {
    // Redirect to backend OAuth route
    // Fallback to localhost if API_BASE is not configured
    const backendUrl = API_BASE || 'http://localhost:5000';
    window.location.href = `${backendUrl}/auth/google`;
  };

  const logout = async () => {
    try {
      await fetch(`${API_BASE}/api/auth/logout`, { method: 'POST' });
      setUser(null);
    } catch (err) {
      console.error('Logout failed', err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
