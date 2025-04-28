import axios from 'axios';

// Create an Axios instance with default configuration
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds
});

// Add a request interceptor
api.interceptors.request.use(
  (config) => {
    // You can add auth tokens here if needed
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle errors globally
    console.error('API Error:', error);
    
    // You can handle specific error codes here
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received:', error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Request error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// API endpoints
export const endpoints = {
  // Agent endpoints
  agents: {
    process: '/api/agents/process',
    list: '/api/agents',
  },
  
  // Execution endpoints
  execution: {
    createProject: '/api/execution/projects',
    createFile: '/api/execution/files',
    execute: '/api/execution/execute',
    stopExecution: (containerId: string) => `/api/execution/containers/${containerId}`,
    getLogs: (containerId: string) => `/api/execution/logs/${containerId}`,
  },
};

export default api;