import axios from 'axios';
import { tokenService } from "./tokenService";

const API_BASE_URL = 'http://10.0.2.2:5000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,  
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});
+

// Ajout du token à chaque requête
api.interceptors.request.use(async (config) => {
  const token = await tokenService.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;