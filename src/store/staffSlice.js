import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const fetchStaff = createAsyncThunk('staff/fetch', async () => {
  const staff = await window.api.getStaff();
  return staff;
});

export const addStaffAsync = createAsyncThunk('staff/add', async (staff) => {
  const created = await window.api.addStaff(staff);
  return created;
});

const staffSlice = createSlice({
  name: 'staff',
  initialState: { items: [], status: 'idle', error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchStaff.pending, (state) => { state.status = 'loading'; })
      .addCase(fetchStaff.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload || [];
      })
      .addCase(fetchStaff.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(addStaffAsync.fulfilled, (state, action) => {
        if (action.payload) state.items.push(action.payload);
      });
  }
});

export default staffSlice.reducer;
