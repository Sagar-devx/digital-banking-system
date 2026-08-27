import apiClient from './axios';

export const transactionApi = {
  transfer: async (data) => {
    const response = await apiClient.post('/api/v1/transactions/transfer', data);
    return response.data;
  },
  getTransaction: async (transactionId) => {
    const response = await apiClient.get(`/api/v1/transactions/${transactionId}`);
    return response.data;
  },
  getAccountTransactions: async (accountNumber) => {
    const response = await apiClient.get(`/api/v1/transactions/account/${accountNumber}`);
    return response.data;
  },
  verifyOtp: async (transactionId, otp) => {
    const response = await apiClient.post(`/api/v1/transactions/${transactionId}/verify?otp=${otp}`);
    return response.data;
  },
};
