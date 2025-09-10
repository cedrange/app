import { configureStore } from '@reduxjs/toolkit';
import announcementReducer from './slices/announcementSlice';
import announcementsReducer from './slices/announcementsSlice';
import userReducer from './slices/userSlice';
import categoriesReducer from './slices/categoriesSlice'
import userAnnouncementsReducer from './slices/userAnnouncementsSlice';

export const store = configureStore({
  reducer: {
    announcement: announcementReducer,
    announcements: announcementsReducer,
    user: userReducer,
    userAnnouncements: userAnnouncementsReducer,
    categories: categoriesReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
