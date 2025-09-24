// Constantes de l'application
export const API_CONFIG = {
  BASE_URL: process.env.EXPO_PUBLIC_API_URL || 'https://your-api.com/api/v1/',
  TIMEOUT: 10000,
  ENDPOINTS: {
    AUTH: {
      LOGIN: 'auth/login',
      SIGNUP: 'auth/signup',
      REFRESH: 'auth/refresh',
      LOGOUT: 'auth/logout',
      PROFILE: 'auth/profile',
      SOCIAL: 'auth/social',
    },
    USERS: {
      PROFILE: (id: number) => `users/${id}`,
      UPDATE: (id: number) => `users/${id}`,
      UPLOAD_AVATAR: (id: number) => `users/${id}/avatar`,
    },
  },
};

export const SOCIAL_PROVIDERS = {
  GOOGLE: 'google',
  FACEBOOK: 'facebook',
  APPLE: 'apple',
} as const;

export const VALIDATION_RULES = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD_MIN_LENGTH: 6,
  PHONE_REGEX: /^[\+]?[1-9][\d]{0,15}$/,
};

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'authToken',
  USER_DATA: 'userData',
  REFRESH_TOKEN: 'refreshToken',
};