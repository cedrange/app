import { configureStore } from '@reduxjs/toolkit';
import announcementReducer from './slices/announcementSlice';
import announcementsReducer from './slices/announcementsSlice';
import userReducer from './slices/userSlice';
import userAnnouncementsReducer from './slices/userAnnouncementsSlice';
import categoriesReducer from './slices/categoriesSliceNew';
import authReducer from './slices/authSlice';

export const store = configureStore({
  reducer: {
    announcement: announcementReducer,
    announcements: announcementsReducer,
    user: userReducer,
    userAnnouncements: userAnnouncementsReducer,
    categories: categoriesReducer,
    auth: authReducer,
  }
  
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
