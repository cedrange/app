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
  }
};