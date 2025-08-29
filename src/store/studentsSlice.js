import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const fetchStudents = createAsyncThunk('students/fetch', async () => {
  const students = await window.api.getStudents();
  return students;
});

export const addStudentAsync = createAsyncThunk('students/add', async (student) => {
  const newUser = await window.api.addUser(student);
  return newUser;
});

export const clearStudentsAsync = createAsyncThunk('students/clear', async () => {
  await window.api.clearUsers();
  return true;
});

export const deleteStudentAsync = createAsyncThunk('students/delete', async (student) => {
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
        state.items = action.payload;
      })
      .addCase(fetchStudents.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(addStudentAsync.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(clearStudentsAsync.fulfilled, (state) => {
        state.items = [];
      })
      .addCase(deleteStudentAsync.fulfilled, (state, action) => {
        state.items = state.items.filter(student => student.id !== action.payload);
      });
  }
});

export default studentsSlice.reducer;
