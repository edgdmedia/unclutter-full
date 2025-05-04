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
        const currentAccessToken = localStorage.getItem('token'); 
        const refreshTokenFromStorage = localStorage.getItem('refreshToken');
        
        if (!refreshTokenFromStorage || !currentAccessToken) {
          throw new Error('Missing tokens for refresh');
        }
        
        // Call updated auth refresh endpoint
        // Pass both current access token and refresh token
        const response = await authApi.refreshToken(currentAccessToken, refreshTokenFromStorage);
        
        if (response.success && response.data) {
          // Update ONLY the access token in localStorage
          localStorage.setItem('token', response.data); 
          // The backend does not return a new refresh token in this case
          // localStorage.setItem('refreshToken', response.data.refreshToken); // REMOVE or COMMENT OUT
          
          // Update the Authorization header for the retried request
          originalRequest.headers['Authorization'] = `Bearer ${response.data}`;
          
          // Retry the original request
          return api(originalRequest);
        } else {
          throw new Error(response.message || 'Token refresh failed');
        }
      } catch (refreshError) {
        console.error('Token refresh error:', refreshError);
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
