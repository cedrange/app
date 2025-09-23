import { configureStore } from '@reduxjs/toolkit';
import announcementReducer from './slices/announcementSlice';
import announcementsReducer from './slices/announcementsSlice';
import userReducer from './slices/userSlice';
import userAnnouncementsReducer from './slices/userAnnouncementsSlice';
import categoriesReducer from './slices/categoriesSliceNew';
import { setupListeners } from '@reduxjs/toolkit/query';
import authReducer from './slices/authSlice';
import { authApi } from '../services/authApi';


export const store = configureStore({
  reducer: {
    announcement: announcementReducer,
    announcements: announcementsReducer,
    user: userReducer,
    userAnnouncements: userAnnouncementsReducer,
    categories: categoriesReducer,
    auth: authReducer,
    [authApi.reducerPath]: authApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }).concat(authApi.middleware),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
