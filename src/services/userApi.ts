import { api } from './apiClient';
import axios, { AxiosError } from 'axios';

// Create a separate axios instance for non-finance endpoints
const profileApi = axios.create({
  baseURL: 'https://dash.unclutter.com.ng/wp-json/api/v1'
});

// Add auth token to profileApi requests
profileApi.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers = config.headers || {};
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

// User profile interface
export interface UserProfile {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
}

// User preferences interface
export interface UserPreferences {
  currency: string;
  dateFormat: string;
  startOfMonth: string;
  language: string;
}

// User notification settings interface
export interface UserNotifications {
  emailNotifications: boolean;
  pushNotifications: boolean;
  budgetAlerts: boolean;
  goalReminders: boolean;
  weeklyReports: boolean;
}

// Get user profile
export const getUserProfile = async () => {
  try {
    // Use profileApi instance for profile endpoints
    const res = await profileApi.get('/profile/me');
    return res.data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

// Update user profile
export const updateUserProfile = async (profile: UserProfile) => {
  try {
    // Use profileApi instance for profile endpoints
    const res = await profileApi.put('/profile/me', profile);
    return res.data;
  } catch (error) {
    console.error('Error updating user profile:', error);
    // Enhance error handling
    if ((error as AxiosError)?.response?.status === 401) {
      throw new Error('Authentication required. Please log in again.');
    } else if ((error as AxiosError)?.response?.status === 400) {
      const message = (error as AxiosError)?.response?.data?.message || 'Invalid profile data';
      throw new Error(message);
    } else if ((error as AxiosError)?.response?.status === 409) {
      throw new Error('Email already in use by another account');
    }
    throw error;
  }
};

// Change user password
export const changePassword = async (data: { currentPassword: string; newPassword: string }) => {
  try {
    // Use profileApi instance for auth endpoints
    const res = await profileApi.put('/auth/change-password', data);
    return res.data;
  } catch (error) {
    console.error('Error changing password:', error);
    // Enhance error handling
    if ((error as AxiosError)?.response?.status === 401) {
      throw new Error('Current password is incorrect');
    } else if ((error as AxiosError)?.response?.status === 400) {
      const message = (error as AxiosError)?.response?.data?.message || 'Invalid password format';
      throw new Error(message);
    }
    throw error;
  }
};

// Get user preferences
export const getUserPreferences = async () => {
  try {
    // Use profileApi instance for profile endpoints
    const res = await profileApi.get('/profile/preferences');
    return res.data;
  } catch (error) {
    console.error('Error fetching user preferences:', error);
    throw error;
  }
};

// Update user preferences
export const updateUserPreferences = async (preferences: UserPreferences) => {
  try {
    // Use profileApi instance for profile endpoints
    const res = await profileApi.put('/profile/preferences', preferences);
    return res.data;
  } catch (error) {
    console.error('Error updating user preferences:', error);
    throw error;
  }
};

// Get user notification settings
export const getUserNotifications = async () => {
  try {
    // Use profileApi instance for profile endpoints
    const res = await profileApi.get('/profile/notifications');
    return res.data;
  } catch (error) {
    console.error('Error fetching user notifications:', error);
    throw error;
  }
};

// Update user notification settings
export const updateUserNotifications = async (notifications: UserNotifications) => {
  try {
    // Use profileApi instance for profile endpoints
    const res = await profileApi.put('/profile/notifications', notifications);
    return res.data;
  } catch (error) {
    console.error('Error updating user notifications:', error);
    throw error;
  }
};
