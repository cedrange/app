import { configureStore } from '@reduxjs/toolkit';
import announcementReducer from './slices/announcementSlice';
import announcementsReducer from './slices/announcementsSlice';
import authReducer from './slices/authSlice';
import categoriesReducer from './slices/categoriesSliceNew';
import userAnnouncementsReducer from './slices/userAnnouncementsSlice';
import userReducer from './slices/userSlice';
import { authApi } from './api/authApi';


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
    getDefaultMiddleware().concat(authApi.middleware), // Ajout du middleware RTK Query
  
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
