import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import * as authApi from '@/services/authApi';

interface AuthContextType {
  user: any;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // On mount, check for token in localStorage
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      setIsAuthenticated(true);
      // Optionally, verify token and fetch user info here
    }
  }, []);

  const login = async (email: string, password: string) => {
    const data = await authApi.login(email, password);
    setToken(data.token);
    setIsAuthenticated(true);
    // Optionally, set user info if returned
    setUser(data.user || null);
  };

  const logout = async () => {
    if (token) await authApi.logout(token);
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('token');
  };

  const refreshToken = async () => {
    if (!token) return;
    const data = await authApi.refreshToken(token);
    setToken(data.token);
    setIsAuthenticated(true);
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, login, logout, refreshToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
