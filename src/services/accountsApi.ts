import { api } from './apiClient';

export const getAccounts = async () => {
  const res = await api.get('/accounts');
  return res.data;
};

export const getAccount = async (id: string) => {
  const res = await api.get(`/accounts/${id}`);
  return res.data;
};

export const createAccount = async (data: any) => {
  const res = await api.post('/accounts', data);
  return res.data;
};

export const updateAccount = async (id: string, data: any) => {
  const res = await api.put(`/accounts/${id}`, data);
  return res.data;
};

export const deleteAccount = async (id: string) => {
  const res = await api.delete(`/accounts/${id}`);
  return res.data;
};

export const getAccountBalanceHistory = async (
  id: string,
  params: { start_date: string; end_date: string }
) => {
  const res = await axios.get(`${API_BASE}/accounts/${id}/balance-history`, { params });
  return res.data;
};

export const searchAccounts = async (search: string) => {
  const res = await axios.get(`${API_BASE}/accounts/search`, { params: { search } });
  return res.data;
};

export const getAccountTransactions = async (
  account_id: string,
  params: { start_date: string; end_date: string; per_page?: number; page?: number; order?: string; order_by?: string }
) => {
  const res = await axios.get(`${API_BASE}/transactions`, {
    params: { account_id, ...params },
  });
  return res.data;
};
