import axios from 'axios';
import * as authApi from './authApi';

const API_BASE = 'https://dash.unclutter.com.ng/wp-json/api/v1/finance';

// Create axios instance
export const api = axios.create({
  baseURL: API_BASE,
});

// Request interceptor to add Bearer token
api.interceptors.request.use(
  (config) => {
    console.log(`API Request to: ${config.url}`);
    
    // Do not attach token for auth endpoints
    if (config.url?.includes('/auth/')) {
      return config;
    }
    
    // Get token from localStorage
    const token = localStorage.getItem('token');
    console.log('Token from localStorage:', token ? 'Found' : 'Not found');
    
    if (token) {
      if (config.headers) {
        config.headers['Authorization'] = `Bearer ${token}`;
      } else {
        config.headers = { Authorization: `Bearer ${token}` };
      }
      console.log('Token attached to request');
    } else {
      console.warn('No token found in localStorage');
    }
    
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If error is 401 Unauthorized and we haven't tried to refresh the token yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Try to refresh the token
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token');
        }
        
        // Call auth refresh endpoint
        const response = await authApi.refreshToken(refreshToken);
        
        if (response.success) {
          // Update token in localStorage
          localStorage.setItem('token', response.data.token);
          localStorage.setItem('refreshToken', response.data.refreshToken);
          
          // Update the Authorization header
          originalRequest.headers['Authorization'] = `Bearer ${response.data.token}`;
          
          // Retry the original request
          return api(originalRequest);
        } else {
          throw new Error('Token refresh failed');
        }
      } catch (refreshError) {
        // If refresh fails, log out the user
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        
        // Redirect to login page
        window.location.href = '/login';
        
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);
