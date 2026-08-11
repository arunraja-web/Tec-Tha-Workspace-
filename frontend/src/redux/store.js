import { configureStore } from '@reduxjs/toolkit';
import meetingReducer from './slices/meetingSlice';

export const store = configureStore({
  reducer: {
    meetings: meetingReducer,
  },
});

export default store;
