import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { User } from "@/types";
import { tokenService } from "@/services/tokenService";

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://10.0.2.2:5000/api/v1", // adapte selon ton backend
    prepareHeaders: async (headers) => {
      const token = await tokenService.getToken();
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    // ⚡ mutation pour changer le mot de passe
    changePassword: builder.mutation<
      { message: string }, // type de la réponse
      { currentPassword: string; newPassword: string } // type des arguments
    >({
      query: (body) => ({
        url: "/auth/reset-password",
        method: "POST",
        body,
      }),
    }),
    resetPassword: builder.mutation<
      { message: string },
      { token: string; newPassword: string }
    >({
      query: (body) => ({
        url: '/auth/reset-password',
        method: 'POST',
        body,
      }),
    }),
    // ⚡ mutation pour le mot de passe oublié
    forgotPassword: builder.mutation<
      { message: string }, // ✅ ce que ton backend renvoie
      {email: string }    // ✅ ce que tu envoies
    >({
      query: (body) => ({
        url: "/forgot_password_link",
        method: "POST",
        body,
      }),
    }),
    // Exemple d’autres endpoints
    getProfile: builder.query<User, void>({
      query: () => "/users/me",
    }),
  }),
});

export const { useChangePasswordMutation, useForgotPasswordMutation,useResetPasswordMutation, useGetProfileQuery } = authApi;
