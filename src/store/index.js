import { configureStore } from '@reduxjs/toolkit';
import studentsReducer from './studentsSlice';
import staffReducer from './staffSlice';

export const store = configureStore({
  reducer: {
  students: studentsReducer,
  staff: staffReducer,
  },
});
