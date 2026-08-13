import { configureStore } from '@reduxjs/toolkit';
import meetingReducer from './slices/meetingSlice';
import attendanceReducer from './slices/attendanceSlice';

export const store = configureStore({
  reducer: {
    meetings: meetingReducer,
    attendance: attendanceReducer,
  },
});

export default store;
