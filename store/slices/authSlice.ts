import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AuthState, User } from '../../types';
import { authApi } from '../../services/authApi';

const initialState: AuthState = {
  user: null,
  accesToken: null,
  isAuthenticated: false,
  isLoading: true, // Commencer avec true pour éviter les redirections prématurées
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    loginSuccess: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.user = action.payload.user;
      state.accesToken = action.payload.token;
      state.isAuthenticated = true;
      state.isLoading = false;
    },
    loginFailure: (state) => {
      state.user = null;
      state.accesToken = null;
      state.isAuthenticated = false;
      state.isLoading = false;
    },
    logout: (state) => {
      state.user = null;
      state.accesToken = null;
      state.isAuthenticated = false;
      state.isLoading = false;
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
    restoreAuth: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.user = action.payload.user;
      state.accesToken = action.payload.token;
      state.isAuthenticated = true;
      state.isLoading = false;
    },
    clearAuth: (state) => {
      state.user = null;
      state.accesToken = null;
      state.isAuthenticated = false;
      state.isLoading = false;
    },
  },
  extraReducers: (builder) => {
    // Gérer les réponses des mutations RTK Query
    builder
      .addMatcher(authApi.endpoints.login.matchPending, (state) => {
        state.isLoading = true;
      })
      .addMatcher(authApi.endpoints.login.matchFulfilled, (state, action) => {
        const { user, token } = action.payload;
        state.user = user;
        state.accesToken = token;
        state.isAuthenticated = true;
        state.isLoading = false;
      })
      .addMatcher(authApi.endpoints.login.matchRejected, (state) => {
        state.user = null;
        state.accesToken = null;
        state.isAuthenticated = false;
        state.isLoading = false;
      })
      .addMatcher(authApi.endpoints.signup.matchPending, (state) => {
        state.isLoading = true;
      })
      .addMatcher(authApi.endpoints.signup.matchFulfilled, (state, action) => {
        const { user, token } = action.payload;
        state.user = user;
        state.accesToken = token;
        state.isAuthenticated = true;
        state.isLoading = false;
      })
      .addMatcher(authApi.endpoints.signup.matchRejected, (state) => {
        state.user = null;
        state.accesToken = null;
        state.isAuthenticated = false;
        state.isLoading = false;
      })
      .addMatcher(authApi.endpoints.socialAuth.matchFulfilled, (state, action) => {
        const { user, token } = action.payload;
        state.user = user;
        state.accesToken = token;
        state.isAuthenticated = true;
        state.isLoading = false;
      });
  },
});

export const {
  setLoading,
  loginSuccess,
  loginFailure,
  logout,
  updateUser,
  restoreAuth,
  clearAuth,
} = authSlice.actions;

export default authSlice.reducer;