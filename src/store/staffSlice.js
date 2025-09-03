import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const fetchStaff = createAsyncThunk('staff/fetch', async () => {
  if (!window?.api || typeof window.api.getStaff !== 'function') {
    // Graceful no-op when running without Electron (e.g., opening Vite URL directly)
    return [];
  }
  const staff = await window.api.getStaff();
  return staff;
});

export const addStaffAsync = createAsyncThunk('staff/add', async (staff) => {
  if (!window?.api || typeof window.api.addStaff !== 'function') {
    throw new Error('Electron API not available: window.api.addStaff');
  }
  const created = await window.api.addStaff(staff);
  return created;
});

export const deleteStaffAsync = createAsyncThunk('staff/delete', async (id) => {
  if (!window?.api || typeof window.api.deleteStaff !== 'function') {
    throw new Error('Electron API not available: window.api.deleteStaff');
  }
  const ok = await window.api.deleteStaff(id);
  if (!ok) throw new Error('Failed to delete staff');
  return id;
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
      })
      .addCase(deleteStaffAsync.fulfilled, (state, action) => {
        const id = action.payload;
        state.items = state.items.filter(s => s.id !== id);
      })
      .addCase(deleteStaffAsync.rejected, (state, action) => {
        state.error = action.error.message;
      });
  }
});

export default staffSlice.reducer;
