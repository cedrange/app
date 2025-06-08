// store/announcementSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Announcement } from '../types'; // Assure-toi que le type existe

interface AnnouncementState {
  selected: Announcement | null;
}

const initialState: AnnouncementState = {
  selected: null,
};

const announcementSlice = createSlice({
  name: 'announcement',
  initialState,
  reducers: {
    setSelectedAnnouncement: (state, action: PayloadAction<Announcement>) => {
      state.selected = action.payload;
    },
    clearSelectedAnnouncement: (state) => {
      state.selected = null;
    },
  },
});

export const { setSelectedAnnouncement, clearSelectedAnnouncement } = announcementSlice.actions;
export default announcementSlice.reducer;
