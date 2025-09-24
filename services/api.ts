import axios from 'axios';
import { store } from '@/store/store';

const API_BASE_URL = 'http://10.0.2.2:5000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,  
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});
+
// Ajouter automatiquement le token si dispo
api.interceptors.request.use(
  (config) => {
    const state = store.getState();
    const token = state.auth?.user?.token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;