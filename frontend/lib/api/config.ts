import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { auth } from '../firebase';

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Get user ID from Firebase auth
    const currentUser = auth.currentUser;
    
    if (currentUser?.uid) {
      config.headers.set('user-id', currentUser.uid);
    }
    
    console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('❌ Response Error:', error.response?.data || error.message);
    
    // Handle specific error cases
    if (error.response?.status === 401) {
      // Handle unauthorized
      console.error('Unauthorized access');
    } else if (error.response?.status === 404) {
      // Handle not found
      console.error('Resource not found');
    } else if (error.response?.status >= 500) {
      // Handle server errors
      console.error('Server error occurred');
    }
    
    return Promise.reject(error);
  }
);

// API endpoints
export const API_ENDPOINTS = {
  PROJECTS: {
    BASE: '/api/projects',
    STATS: '/api/projects/stats',
    SEARCH: '/api/projects/search',
    BY_STATUS: (status: string) => `/api/projects/status/${status}`,
    BY_ID: (id: string) => `/api/projects/${id}`,
    PROGRESS: (id: string) => `/api/projects/${id}/progress`,
  },
  PAYMENTS: {
    BASE: '/api/payments',
    BALANCE: '/api/payments/balance',
    CREATE_PAYMENT_INTENT: '/api/payments/create-payment-intent',
    TRANSACTIONS: '/api/payments/transactions',
    CHECK_ELIGIBILITY: '/api/payments/check-project-eligibility',
    WEBHOOK: '/api/payments/webhook',
  },
  QUOTES: {
    BASE: '/api/quotes',
    RANDOM: '/api/quotes/random',
  },
  HEALTH: '/health',
} as const;

// API response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  count?: number;
}

// Nested API response (for when data is nested under another data property)
export interface NestedApiResponse<T = any> {
  success: boolean;
  data?: {
    data: T;
    message?: string;
    count?: number;
  };
  message?: string;
  count?: number;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  count: number;
  page?: number;
  limit?: number;
  totalPages?: number;
}

// Export the configured client
export default apiClient; 