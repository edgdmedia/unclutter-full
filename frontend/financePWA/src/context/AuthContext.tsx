import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import * as authApi from '@/services/authApi';
import * as userApi from '@/services/userApi';
import { toast } from '@/components/ui/sonner';

// Define user profile interface
export interface UserProfile {
  profile_id: string;
  email: string;
  first_name: string;
  last_name: string;
  display_name: string;
  avatar_url: string;
}

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  updateUserProfile: (userData: Partial<UserProfile>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // On mount, check for token in localStorage
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      setIsAuthenticated(true);
      
      // Load user data from localStorage if available
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          setUser(userData);
        } catch (error) {
          console.error('Error parsing stored user data:', error);
        }
      }
    }
  }, []);

  const login = async (email: string, password: string) => {
    const data = await authApi.login(email, password);
    
    // Store token
    setToken(data.access_token);
    localStorage.setItem('token', data.access_token);
    
    if (data.refresh_token) {
      localStorage.setItem('refresh_token', data.refresh_token);
    }
    
    // Create user object from response
    const userProfile: UserProfile = {
      profile_id: data.profile_id,
      email: data.email,
      first_name: data.first_name,
      last_name: data.last_name,
      display_name: data.display_name,
      avatar_url: data.avatar_url
    };
    
    // Store user data
    setUser(userProfile);
    localStorage.setItem('user', JSON.stringify(userProfile));
    setIsAuthenticated(true);
    
    // Display welcome notification
    toast.success(`Welcome back, ${data.first_name}!`);
  };

  const logout = async () => {
    try {
      // Call logout API if we have a token
      if (token) await authApi.logout(token);
      
      // Clear state
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
      
      // Clear localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Error during logout:', error);
      
      // Still clear local state even if API call fails
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
    }
  };

  const refreshToken = async () => {
    if (!token) return;
    const data = await authApi.refreshToken(token);
    setToken(data.token);
    setIsAuthenticated(true);
  };

  const updateUserProfile = (userData: Partial<UserProfile>) => {
    if (!user) return;
    
    // Update the user object with new data
    const updatedUser = {
      ...user,
      ...userData
    };
    
    // Update state
    setUser(updatedUser);
    
    // Update localStorage
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, login, logout, refreshToken, updateUserProfile }}>
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
