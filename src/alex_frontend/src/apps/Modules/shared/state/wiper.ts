import { createAsyncThunk } from '@reduxjs/toolkit';
import { clearTransactions, clearContentData, resetMintableState } from './content/contentDisplaySlice';
import { clearPredictions } from './arweave/arweaveSlice';
import { ContentService } from '@/apps/Modules/LibModules/contentDisplay/services/contentService';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '@/store';

export const wipe = createAsyncThunk(
  'wiper/wipeContentDisplayState',
  async (_, { dispatch }) => {
    // Clear all transactions
    dispatch(clearTransactions());
    
    // Clear all content data
    dispatch(clearContentData());
    
    // Reset mintable state
    dispatch(resetMintableState());

    // Clear predictions
    dispatch(clearPredictions());
    
    // Clear the ContentService cache
    ContentService.clearCache();

  }
);

// Custom hook to handle unmount wiping
export const useWipeOnUnmount = () => {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    return () => {
      dispatch(wipe());
    };
  }, [dispatch]);
};
