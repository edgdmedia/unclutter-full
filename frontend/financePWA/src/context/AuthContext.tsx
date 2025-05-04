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

  // Helper function to clear all cached data - simplified since FinanceContext now handles data fetching
  const clearAllCachedData = async () => {
    console.log('Clearing all cached data');
    
    // 1. Clear localStorage cache - be thorough and clear all possible keys
    const keysToRemove = [
      'dashboardSummary', 'dashboardTrends', 'transactions', 'accounts', 'categories',
      'budgets', 'goals', 'preferences', 'notifications', 'user', 'userProfile'
    ];
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    // 2. Clear IndexedDB cache with proper Promise handling
    try {
      await new Promise<void>((resolve) => {
        const dbPromise = indexedDB.open('financeDB', 1);
        
        dbPromise.onerror = () => {
          console.error('Failed to open IndexedDB');
          resolve(); // Continue even if we can't open the DB
        };
        
        dbPromise.onsuccess = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          const storeNames = Array.from(db.objectStoreNames);
          
          if (storeNames.length === 0) {
            resolve();
            return;
          }
          
          // Create a transaction for all stores
          try {
            const tx = db.transaction(storeNames, 'readwrite');
            
            tx.oncomplete = () => {
              console.log('All IndexedDB stores cleared successfully');
              resolve();
            };
            
            tx.onerror = () => {
              console.error('Error clearing IndexedDB stores');
              resolve(); // Continue even if clearing fails
            };
            
            // Clear each store
            storeNames.forEach(storeName => {
              console.log(`Clearing IndexedDB store: ${storeName}`);
              const store = tx.objectStore(storeName);
              store.clear();
            });
          } catch (txError) {
            console.error('Error creating transaction:', txError);
            resolve(); // Continue even if transaction fails
          }
        };
      });
    } catch (error) {
      console.error('Error clearing IndexedDB cache:', error);
      // Continue even if clearing fails
    }
    
    // 3. Force reload of data by setting flags in sessionStorage
    sessionStorage.setItem('forceRefresh', 'true');
    sessionStorage.setItem('lastCacheReset', Date.now().toString());
  };
  
  // We'll use a simpler approach without direct API imports

  const login = async (email: string, password: string) => {
    try {
      // Always clear all cached data first to ensure fresh data
      console.log('Clearing all cached data before login');
      await clearAllCachedData();
      
      // Then get the login data
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
      // Store the email for future login comparisons - ALWAYS use data.email to ensure consistency
      localStorage.setItem('userEmail', data.email);
      setIsAuthenticated(true);
      
      // Display welcome notification
      toast.success(`Welcome back, ${data.first_name}!`);
      
      // Set a flag to force data refresh in FinanceContext
      console.log('Setting flag to force data refresh after login');
      sessionStorage.setItem('forceRefresh', 'true');
      sessionStorage.setItem('lastCacheReset', Date.now().toString());
      
      // Return the user profile for potential use by the caller
      return userProfile;
    } catch (error) {
      console.error('Login error:', error);
      // Ensure we don't leave partial data if login fails
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
      toast.error(error instanceof Error ? error.message : 'Login failed. Please try again.');
      throw error; // Re-throw to allow caller to handle the error
    }
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
