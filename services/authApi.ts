import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '../store';
import { AuthResponse, LoginRequest, SignupRequest, SocialAuthRequest } from '../types'

const baseQuery = fetchBaseQuery({
  baseUrl: 'http://10.0.2.2:5000/api/v1/',
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.token;
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    headers.set('Content-Type', 'application/json');
    return headers;
  },
});


export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery,
  tagTypes: ['User'],
  endpoints: (builder) => ({
    login: builder.mutation<AuthResponse, LoginRequest>({
      query: (credentials) => ({
        url: 'auth/login',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['User'],
    }),
    
    signup: builder.mutation<AuthResponse, SignupRequest>({
      query: (userData) => ({
        url: 'auth/signup',
        method: 'POST',
        body: userData,
      }),
      invalidatesTags: ['User'],
    }),
    
    socialAuth: builder.mutation<AuthResponse, SocialAuthRequest>({
      query: (socialData) => ({
        url: 'auth/social',
        method: 'POST',
        body: socialData,
      }),
      invalidatesTags: ['User'],
    }),
    
    refreshToken: builder.mutation<AuthResponse, { refreshToken: string }>({
      query: ({ refreshToken }) => ({
        url: 'auth/refresh',
        method: 'POST',
        body: { refreshToken },
      }),
    }),
    
    logout: builder.mutation<void, void>({
      query: () => ({
        url: 'auth/logout',
        method: 'POST',
      }),
    }),
    
    getProfile: builder.query<AuthResponse, void>({
      query: () => 'auth/profile',
      providesTags: ['User'],
    }),
  }),
});

export const {
  useLoginMutation,
  useSignupMutation,
  useSocialAuthMutation,
  useRefreshTokenMutation,
  useLogoutMutation,
  useGetProfileQuery,
} = authApi;