import * as SecureStore from 'expo-secure-store';
import { STORAGE_KEYS } from './constants';

export const secureStorage = {
  // Token d'authentification
  async setAuthToken(token: string): Promise<void> {
    await SecureStore.setItemAsync(STORAGE_KEYS.AUTH_TOKEN, token);
  },

  async getAuthToken(): Promise<string | null> {
    return await SecureStore.getItemAsync(STORAGE_KEYS.AUTH_TOKEN);
  },

  async removeAuthToken(): Promise<void> {
    await SecureStore.deleteItemAsync(STORAGE_KEYS.AUTH_TOKEN);
  },

  // Données utilisateur
  async setUserData(userData: any): Promise<void> {
    await SecureStore.setItemAsync(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
  },

  async getUserData(): Promise<any | null> {
    const data = await SecureStore.getItemAsync(STORAGE_KEYS.USER_DATA);
    return data ? JSON.parse(data) : null;
  },

  async removeUserData(): Promise<void> {
    await SecureStore.deleteItemAsync(STORAGE_KEYS.USER_DATA);
  },

  // Token de rafraîchissement
  async setRefreshToken(token: string): Promise<void> {
    await SecureStore.setItemAsync(STORAGE_KEYS.REFRESH_TOKEN, token);
  },

  async getRefreshToken(): Promise<string | null> {
    return await SecureStore.getItemAsync(STORAGE_KEYS.REFRESH_TOKEN);
  },

  async removeRefreshToken(): Promise<void> {
    await SecureStore.deleteItemAsync(STORAGE_KEYS.REFRESH_TOKEN);
  },

  // Nettoyage complet
  async clearAll(): Promise<void> {
    await Promise.all([
      this.removeAuthToken(),
      this.removeUserData(),
      this.removeRefreshToken(),
    ]);
  },
};