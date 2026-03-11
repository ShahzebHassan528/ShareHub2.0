/**
 * Axios API Client
 * Configured with interceptors for authentication
 */

import axios from 'axios';
import { getToken, clearAuthData } from '../utils/storage';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5000/api';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add token to requests
apiClient.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
apiClient.interceptors.response.use(
  (response) => {
    // Return data directly
    return response.data;
  },
  (error) => {
    // Handle different error scenarios
    if (error.response) {
      const { status, data } = error.response;

      // Unauthorized - Token expired or invalid
      if (status === 401) {
        clearAuthData();
        window.location.href = '/login';
        return Promise.reject(new Error('Session expired. Please login again.'));
      }

      // Forbidden - No permission
      if (status === 403) {
        return Promise.reject(new Error('You do not have permission to perform this action.'));
      }

      // Server error
      if (status >= 500) {
        return Promise.reject(new Error('Server error. Please try again later.'));
      }

      // Return error message from backend
      return Promise.reject(new Error(data.message || 'An error occurred'));
    }

    // Network error
    if (error.request) {
      return Promise.reject(new Error('Network error. Please check your connection.'));
    }

    // Other errors
    return Promise.reject(error);
  }
);

export default apiClient;
