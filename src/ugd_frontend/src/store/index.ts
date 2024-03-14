import { configureStore } from '@reduxjs/toolkit';
import portalReducer from '@/features/portal/portalSlice';
import homeReducer from '@/features/home/homeSlice';

const store = configureStore({
  reducer: {
    portal: portalReducer,
    home: homeReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
