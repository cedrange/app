import { store } from '@/store/store';
import { LoginCredentials, SignupCredentials, User } from '../types';
import api from './api';
import { tokenService } from './tokenService';

export const authService = {
  login: async (credentials: LoginCredentials) => {
    const response = await api.post("/auth/login", credentials);
    const { accessToken, user } = response.data.data;
    console.log("la reponse du serveur pour le login: ",accessToken);
    await tokenService.setToken(accessToken);
    return { token: accessToken, user };
  },
  signup: async (credentials: SignupCredentials) => {
    const response = await api.post("/auth/signup", credentials);
    const { accessToken, user } = response.data.data;

    await tokenService.setToken(accessToken);

    return { token: accessToken, user };
  },
  logout: async () => {
    await tokenService.clearToken();
  },

  socialLogin: async (provider: string, accessToken: string): Promise<{ user: User; token: string }> => {
    const response = await api.post('/auth/social', {
      provider,
      accessToken,
    });
    return response.data;
  },

  getCurrentUser: async (): Promise<User | null> => {
    try {
      const token = store.getState().auth.token;
      const response = await api.get(`/users/.${token}`); // ← Remplace par l’ID réel ou utilise /users/me si ton API le supporte
      return response.data;
    } catch (error) {
      console.log("Erreur getCurrentUser, fallback mock");
      return Promise.resolve(null);
    }
  },

  updateUser: async (data: Partial<User>): Promise<User| null> => {
    try {
      const response = await api.put('/users/me', data);
      return response.data;
    } catch (error) {
      console.log("Erreur updateUser, fallback mock");
      return Promise.resolve(null);
    }
  }
};