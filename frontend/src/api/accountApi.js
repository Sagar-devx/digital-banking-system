import apiClient from './axios';

export const accountApi = {
  createAccount: async (data) => {
    const response = await apiClient.post('/api/v1/accounts', data);
    return response.data;
  },
  getAccountByNumber: async (accountNumber) => {
    const response = await apiClient.get(`/api/v1/accounts/${accountNumber}`);
    return response.data;
  },
  getBalance: async (accountNumber) => {
    const response = await apiClient.get(`/api/v1/accounts/${accountNumber}/balance`);
    return response.data;
  },
};
