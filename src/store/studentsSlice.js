import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const fetchStudents = createAsyncThunk('students/fetch', async () => {
  if (!window?.api || typeof window.api.getStudents !== 'function') {
    // Graceful no-op when running without Electron (e.g., opening Vite URL directly)
    return [];
  }
  const students = await window.api.getStudents();
  return students;
});

export const addStudentAsync = createAsyncThunk('students/add', async (student) => {
  if (!window?.api || typeof window.api.addUser !== 'function') {
    throw new Error('Electron API not available: window.api.addUser');
  }
  const newUser = await window.api.addUser({ name: student.name });
  return newUser;
});

export const clearStudentsAsync = createAsyncThunk('students/clear', async () => {
  if (!window?.api || typeof window.api.clearUsers !== 'function') {
    throw new Error('Electron API not available: window.api.clearUsers');
  }
  await window.api.clearUsers();
  return true;
});

export const deleteStudentAsync = createAsyncThunk('students/delete', async (student) => {
  if (!window?.api || typeof window.api.deleteUser !== 'function') {
    throw new Error('Electron API not available: window.api.deleteUser');
  }
  await window.api.deleteUser(student.id);
  return student.id;
})

const studentsSlice = createSlice({
  name: 'students',
  initialState: { items: [], status: 'idle', error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchStudents.pending, (state) => { state.status = 'loading'; })
      .addCase(fetchStudents.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload || [];
      })
      .addCase(fetchStudents.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(addStudentAsync.fulfilled, (state, action) => {
        if (action.payload) state.items.push(action.payload);
      })
      .addCase(addStudentAsync.rejected, (state, action) => {
        state.error = action.error.message;
      })
      .addCase(clearStudentsAsync.fulfilled, (state) => {
        state.items = [];
      })
      .addCase(clearStudentsAsync.rejected, (state, action) => {
        state.error = action.error.message;
      })
      .addCase(deleteStudentAsync.fulfilled, (state, action) => {
        state.items = state.items.filter(student => student.id !== action.payload);
      })
      .addCase(deleteStudentAsync.rejected, (state, action) => {
        state.error = action.error.message;
      });
  }
});

export default studentsSlice.reducer;
