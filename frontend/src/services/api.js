import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Create instance
const api = axios.create({
  baseURL: API_URL,
});

// Add interceptor to include token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const login = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  return response.data;
};

export const register = async (userData) => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};

export const getMe = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

export const checkPlagiarism = async (text, reference, checkAI = false, excludeQuotes = false, excludeBibliography = false, checkWeb = true) => {
  try {
    const response = await api.post('/check', { 
      text, 
      reference: reference || null,
      checkAI,
      excludeQuotes,
      excludeBibliography,
      checkWeb
    });
    return response.data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};