import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Category } from '../../types';
import { apiService } from '../../services/api';

interface CategoriesState {
  data: Category[];
  loading: boolean;
  error: string | null;
}

const initialState: CategoriesState = {
  data: [],
  loading: false,
  error: null,
};

export const fetchCategories = createAsyncThunk(
  'categories/fetchAll',
  async () => {
    const response = await apiService.getCategories(); // à implémenter dans apiService
    return response;
  }
);

const categoriesSlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {
    clearCategories: (state) => {
      state.data = [];
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Erreur lors du chargement des catégories';
      });
  },
});

export const { clearCategories } = categoriesSlice.actions;
export default categoriesSlice.reducer;
