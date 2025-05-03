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
    // Use the endpoint as specified in the API docs (finance/dashboard/summary)
    const res = await api.get('/dashboard/summary');
    console.log('Dashboard summary response:', res.data);
    return res.data;
  } catch (error) {
    console.error('Error fetching dashboard summary:', error);
    // Try alternative endpoint format if the first one fails
    try {
      console.log('Trying alternative endpoint...');
      const res = await api.get('/finance/dashboard/summary');
      console.log('Alternative dashboard summary response:', res.data);
      return res.data;
    } catch (altError) {
      console.error('Alternative endpoint also failed:', altError);
      throw error; // Throw the original error
    }
  }
};

export const getDashboardTrends = async () => {
  try {
    console.log('Fetching dashboard trends...');
    // Use the endpoint as specified in the API docs
    const res = await api.get('/dashboard/trends');
    console.log('Dashboard trends response:', res.data);
    return res.data;
  } catch (error) {
    console.error('Error fetching dashboard trends:', error);
    // Try alternative endpoint format if the first one fails
    try {
      console.log('Trying alternative endpoint...');
      const res = await api.get('/finance/dashboard/trends');
      console.log('Alternative dashboard trends response:', res.data);
      return res.data;
    } catch (altError) {
      console.error('Alternative endpoint also failed:', altError);
      throw error; // Throw the original error
    }
  }
};
