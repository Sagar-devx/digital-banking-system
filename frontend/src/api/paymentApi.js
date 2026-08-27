import apiClient from './axios';

export const paymentApi = {
  createOrder: async (data) => {
    const response = await apiClient.post('/api/v1/payments/create-order', data);
    return response.data;
  },
  confirmPayment: async (data) => {
    const response = await apiClient.post('/api/v1/payments/confirm', data);
    return response.data;
  }
};
