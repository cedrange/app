import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { apiService } from '../../services/api';
import { Announcement } from '../../types';

interface UserAnnouncementsState {
  data: Announcement[];
  loading: boolean;
  error: string | null;
}

const initialState: UserAnnouncementsState = {
  data: [],
  loading: false,
  error: null,
};

export const fetchUserAnnouncements = createAsyncThunk(
  'userAnnouncements/fetch',
  async (userId: number) => {
    return await apiService.getUserAnnouncements(userId);
  }
);

const userAnnouncementsSlice = createSlice({
  name: 'userAnnouncements',
  initialState,
  reducers: {
    clearUserAnnouncements: (state) => {
      state.data = [];
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserAnnouncements.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserAnnouncements.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchUserAnnouncements.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'Erreur lors du chargement';
      });
  },
});

export const { clearUserAnnouncements } = userAnnouncementsSlice.actions;
export default userAnnouncementsSlice.reducer;
