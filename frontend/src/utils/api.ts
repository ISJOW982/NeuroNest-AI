import axios from 'axios';
import { getUserSettings } from './firebase';

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
  async (config) => {
    // Add auth token if available
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add API settings if available
    try {
      const userId = localStorage.getItem('user_id');
      if (userId) {
        const settings = await getUserSettings(userId);
        if (settings) {
          if (settings.apiProvider) {
            config.headers['X-AI-Provider'] = settings.apiProvider;
          }
          if (settings.apiKey) {
            config.headers['X-API-Key'] = settings.apiKey;
          }
        }
      }
    } catch (error) {
      console.error('Error getting user settings for API request:', error);
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
    providers: '/api/agents/providers',
  },

  // Execution endpoints
  execution: {
    createProject: '/api/execution/projects',
    createFile: '/api/execution/files',
    execute: '/api/execution/execute',
    stopExecution: (containerId: string) => `/api/execution/containers/${containerId}`,
    getLogs: (containerId: string) => `/api/execution/logs/${containerId}`,
  },
  
  // User endpoints
  user: {
    settings: '/api/user/settings',
    projects: '/api/user/projects',
    conversations: '/api/user/conversations',
  },
};

// Helper function to process a message with context and API settings
export const processMessage = async (message: string, context: any = {}) => {
  try {
    // Get user settings for API configuration
    let apiSettings = {};
    
    const userId = localStorage.getItem('user_id');
    if (userId) {
      try {
        const settings = await getUserSettings(userId);
        if (settings) {
          apiSettings = {
            provider: settings.apiProvider,
            apiKey: settings.apiKey,
          };
        }
      } catch (error) {
        console.error('Error getting user settings:', error);
      }
    }
    
    // Add API settings to context
    const enrichedContext = {
      ...context,
      apiSettings,
    };
    
    // Make the API request
    const response = await api.post(endpoints.agents.process, {
      message,
      context: enrichedContext,
    });
    
    return response.data;
  } catch (error) {
    console.error('Error processing message:', error);
    throw error;
  }
};

export default api;