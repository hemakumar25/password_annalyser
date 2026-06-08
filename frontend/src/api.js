const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const authRequest = async (endpoint, data) => {
  const response = await fetch(`${API_URL}/${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return response.json();
};

export const analyzePassword = async (password, token) => {
  const response = await fetch(`${API_URL}/analysis`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ password }),
  });
  return response.json();
};

export const fetchHistory = async (token) => {
  const response = await fetch(`${API_URL}/analysis`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.json();
};
