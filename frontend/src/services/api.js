import axios from 'axios';

export const API_URL =
  import.meta.env.VITE_API_URL ||
  'https://cure26-backend-j8wi7z142-revathi1.vercel.app/api';

export const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  'https://cure26-backend-j8wi7z142-revathi1.vercel.app';

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('queueCureToken');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      'Something went wrong';

    return Promise.reject(new Error(message));
  }
);

export default api;