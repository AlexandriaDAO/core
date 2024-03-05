import { configureStore } from '@reduxjs/toolkit';
import portalReducer from '@/features/portal/portalSlice';

const store = configureStore({
  reducer: {
    portal: portalReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
