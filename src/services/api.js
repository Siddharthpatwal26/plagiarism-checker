import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export const checkPlagiarism = async (text, reference) => {
  try {
    const response = await axios.post(`${API_URL}/check`, { 
      text, 
      reference: reference || null 
    });
    return response.data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};