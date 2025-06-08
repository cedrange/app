// store/index.ts
import { configureStore } from '@reduxjs/toolkit';
import announcementReducer from './announcementSlice';

export const store = configureStore({
  reducer: {
    announcement: announcementReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
