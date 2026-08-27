import axios from 'axios';

// The API Gateway runs on 8080
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// We are not using real Auth/JWT in the backend, but we'll setup interceptors 
// to simulate passing headers if it ever gets added.
apiClient.interceptors.request.use(
  (config) => {
    // Optionally add simulated token here if needed in future
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Global error handler
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default apiClient;
