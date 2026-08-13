import { configureStore } from '@reduxjs/toolkit';
import meetingReducer from './slices/meetingSlice';
import attendanceReducer from './slices/attendanceSlice';
import groupReducer from './slices/groupSlice';
import chatReducer from './slices/chatSlice';
import taskReducer from './slices/taskSlice';

export const store = configureStore({
  reducer: {
    meetings: meetingReducer,
    attendance: attendanceReducer,
    groups: groupReducer,
    chat: chatReducer,
    tasks: taskReducer,
  },
});

export default store;
