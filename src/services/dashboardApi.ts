import axios from 'axios';
import { api } from './apiClient';

// For debugging - log the API base URL
console.log('Dashboard API using base URL:', api.defaults.baseURL);

export interface DashboardSummary {
  total_income: number;
  total_expenses: number;
  net_balance: number;
  accounts: {
    id: string;
    profile_id: string;
    name: string;
    type_id: string;
    balance: string;
    description: string;
    institution: string;
    is_active: string;
    created_at: string;
    updated_at: string;
    type_name: string;
    category_type: string;
  }[];
}

export interface DashboardTrends {
  labels: string[];
  income: number[];
  expenses: number[];
}

export const getDashboardSummary = async () => {
  try {
    console.log('Fetching dashboard summary...');
    // Use the correct endpoint path as registered in the backend
    const res = await api.get('/dashboard/summary');
    console.log('Dashboard summary response:', res.data);
    return res.data;
  } catch (error) {
    console.error('Error fetching dashboard summary:', error);
    throw error;
  }
};

export const getDashboardTrends = async () => {
  try {
    console.log('Fetching dashboard trends...');
    // Use the correct endpoint path as registered in the backend
    const res = await api.get('/dashboard/trends');
    console.log('Dashboard trends response:', res.data);
    return res.data;
  } catch (error) {
    console.error('Error fetching dashboard trends:', error);
    throw error;
  }
};
