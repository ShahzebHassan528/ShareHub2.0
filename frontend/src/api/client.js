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
    console.log('🔐 API Request:', config.method?.toUpperCase(), config.url);
    console.log('   Token present:', !!token);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('   Authorization header set');
    } else {
      console.warn('⚠️  No token found in storage!');
    }
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
apiClient.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', response.config.url);
    console.log('   Status:', response.status);
    console.log('   Data:', response.data);
    // Return data directly
    return response.data;
  },
  (error) => {
    console.error('❌ API Error:', error.config?.url);
    console.error('   Error:', error.response?.data || error.message);
    
    // Handle different error scenarios
    if (error.response) {
      const { status, data } = error.response;

      // Unauthorized - Token expired or invalid
      if (status === 401) {
        console.error('❌ 401 Unauthorized - Clearing auth and redirecting to login');
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
      console.error('❌ Network error - no response received');
      return Promise.reject(new Error('Network error. Please check your connection.'));
    }

    // Other errors
    return Promise.reject(error);
  }
);

export default apiClient;
