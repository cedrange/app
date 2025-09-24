import { LoginCredentials, SignupCredentials, User } from '../types';
import api from './api';

const API_BASE_URL = 'YOUR_BACKEND_URL'; // Remplacer par votre URL

class AuthService {
  async login(credentials: LoginCredentials): Promise<{ user: User; token: string }> {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  }

  async signup(credentials: SignupCredentials): Promise<{ user: User; token: string }> {
    const response = await api.post('/auth/signup', credentials);
    return response.data;
  }

  async socialLogin(provider: string, accessToken: string): Promise<{ user: User; token: string }> {
    const response = await api.post('/auth/social', {
      provider,
      accessToken,
    });
    return response.data;
  }

  /*setAuthToken(token: string) {
    this.apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  removeAuthToken() {
    delete this.apiClient.defaults.headers.common['Authorization'];
  }*/
}

export const authService = new AuthService();