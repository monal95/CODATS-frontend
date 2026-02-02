import axios from 'axios';

// Use empty string for baseURL to leverage Vite's proxy in development
// In production, set VITE_API_URL to the actual backend URL
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    console.log(`🌐 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('🌐 API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('❌ API Response Error:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message
    });
    return Promise.reject(error);
  }
);

/**
 * Scan code for vulnerabilities
 * @param {string} code - Source code to scan
 * @param {string} language - Programming language
 * @returns {Promise} - Scan results
 */
export const scanCode = async (code, language = 'javascript') => {
  try {
    console.log('🔍 Starting code scan...');
    const response = await api.post('/api/scan', { code, language });
    console.log('✅ Scan response received:', {
      vulnerabilities: response.data.vulnerabilities?.length || 0,
      riskScore: response.data.riskScore
    });
    return response.data;
  } catch (error) {
    console.error('❌ Scan error:', error);
    throw error.response?.data || { 
      error: 'Failed to scan code',
      details: error.message 
    };
  }
};

/**
 * Upload and scan a file
 * @param {File} file - File to upload
 * @returns {Promise} - Scan results
 */
export const scanFile = async (file) => {
  try {
    console.log('📁 Starting file scan:', file.name);
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/api/scan/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    console.log('✅ File scan complete:', {
      vulnerabilities: response.data.vulnerabilities?.length || 0
    });
    
    return response.data;
  } catch (error) {
    console.error('❌ File scan error:', error);
    throw error.response?.data || { 
      error: 'Failed to scan file',
      details: error.message 
    };
  }
};

/**
 * Get AI fixes for multiple vulnerabilities
 * @param {Array} vulnerabilities - Array of vulnerabilities
 * @param {string} code - Source code
 * @param {string} language - Programming language
 * @returns {Promise} - AI analysis results
 */
export const getAIFixes = async (vulnerabilities, code, language = 'javascript') => {
  try {
    console.log('🤖 Requesting AI analysis for:', vulnerabilities.length, 'vulnerabilities');
    
    const response = await api.post('/api/fix', {
      vulnerabilities,
      code,
      language
    }, {
      timeout: 120000 // 2 minute timeout for AI analysis
    });
    
    console.log('✅ AI analysis received:', {
      analysis: response.data.analysis?.length || 0,
      success: response.data.success
    });
    
    return response.data;
  } catch (error) {
    console.error('❌ Get AI fixes error:', error);
    
    // Provide fallback response
    return {
      success: false,
      analysis: [],
      error: error.response?.data?.error || 'AI analysis service unavailable',
      fallback: true
    };
  }
};

/**
 * Get AI fix for a single vulnerability
 * @param {Object} vulnerability - Vulnerability details
 * @param {string} code - Source code
 * @param {string} language - Programming language
 * @returns {Promise} - Fix recommendation
 */
export const getFix = async (vulnerability, code, language = 'javascript') => {
  try {
    console.log('🤖 Requesting AI fix for:', vulnerability.type);
    
    const response = await api.post('/api/fix/single', {
      vulnerability,
      code,
      language
    });
    
    return response.data;
  } catch (error) {
    console.error('❌ Get fix error:', error);
    throw error.response?.data || { 
      error: 'Failed to get fix',
      details: error.message 
    };
  }
};

/**
 * Get supported languages
 * @returns {Promise} - List of languages
 */
export const getLanguages = async () => {
  try {
    const response = await api.get('/api/languages');
    return response.data;
  } catch (error) {
    console.error('❌ Get languages error:', error);
    throw error.response?.data || { 
      error: 'Failed to get languages',
      details: error.message 
    };
  }
};

/**
 * Get vulnerability rules
 * @returns {Promise} - List of rules
 */
export const getRules = async () => {
  try {
    const response = await api.get('/api/rules');
    return response.data;
  } catch (error) {
    console.error('❌ Get rules error:', error);
    throw error.response?.data || { 
      error: 'Failed to get rules',
      details: error.message 
    };
  }
};

/**
 * AI Health check
 * @returns {Promise} - AI service status
 */
export const checkAIHealth = async () => {
  try {
    const response = await api.get('/api/ai-health');
    return response.data;
  } catch (error) {
    console.error('❌ AI Health check error:', error);
    return {
      healthy: false,
      message: 'AI service is unavailable',
      error: error.message
    };
  }
};

/**
 * API Health check
 * @returns {Promise} - Health status
 */
export const healthCheck = async () => {
  try {
    const response = await api.get('/api/health');
    return response.data;
  } catch (error) {
    console.error('❌ Health check error:', error);
    throw error.response?.data || { 
      error: 'API is not available',
      details: error.message 
    };
  }
};

/**
 * Auth: register a new user
 * Body: { name, email, password }
 */
export const registerUser = async ({ firstName, lastName, phone, email, password }) => {
  try {
    const response = await api.post('/api/auth/register', { firstName, lastName, phone, email, password });
    return response.data;
  } catch (error) {
    console.error('❌ Register error:', error);
    throw error.response?.data || { error: 'Registration failed', details: error.message };
  }
};

/**
 * Auth: login
 * Body: { email, password }
 */
export const loginUser = async ({ email, password }) => {
  try {
    const response = await api.post('/api/auth/login', { email, password });
    return response.data;
  } catch (error) {
    console.error('❌ Login error:', error);
    throw error.response?.data || { error: 'Login failed', details: error.message };
  }
};

export default api;