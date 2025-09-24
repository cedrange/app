import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { apiService } from '../../services/apiService';
import { Announcement } from '../../types';

interface AnnouncementState {
  current: Announcement | null;
  loading: boolean;
  error: string | null;
}

interface AnnouncementsState {
  current: Announcement[] | null;
  loading: boolean;
  error: string | null;
}

const initialState: AnnouncementState = {
  current: null,
  loading: false,
  error: null,
};

export const fetchAnnouncementById = createAsyncThunk(
  'announcement/fetchById',
  async (id: number) => {
    return await apiService.getAnnouncementById(id);
  }
);

export const fetchAnnouncements = createAsyncThunk(
  'announcements/fetchAnnouncements',
  async (filters?: any) => {
    const data = await apiService.getAnnouncements(filters);
    return data;
  }
);

const announcementSlice = createSlice({
  name: 'announcement',
  initialState,
  reducers: {
    clearAnnouncement: (state) => {
      state.current = null;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAnnouncementById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAnnouncementById.fulfilled, (state, action) => {
        state.loading = false;
        state.current = action.payload;
      })
      .addCase(fetchAnnouncementById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Erreur lors du chargement';
      });
  },
});

export const { clearAnnouncement } = announcementSlice.actions;
export default announcementSlice.reducer;
