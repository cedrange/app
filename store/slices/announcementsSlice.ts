import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { apiService } from '../../services/apiService';
import { Announcement } from '../../types';

interface AnnouncementsState {
  data: Announcement[];
  loading: boolean;
  error: string | null;
}

const initialState: AnnouncementsState = {
  data: [],
  loading: false,
  error: null,
};

export const fetchAnnouncements = createAsyncThunk(
  'announcements/fetchAll',
  async (filters?: {
    type?: 'perdu' | 'trouve';
    vile?: string;
    categorieId?: string;
  }) => {
    return await apiService.getAnnouncements(filters);
  }
);

const announcementsSlice = createSlice({
  name: 'announcements',
  initialState,
  reducers: {
    clearAnnouncements: (state) => {
      state.data = [];
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAnnouncements.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAnnouncements.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchAnnouncements.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Erreur lors du chargement des annonces';
      });
  },
});

export const { clearAnnouncements } = announcementsSlice.actions;
export default announcementsSlice.reducer;
