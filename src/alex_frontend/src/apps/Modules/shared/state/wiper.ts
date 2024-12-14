import { createAsyncThunk } from '@reduxjs/toolkit';
import { clearTransactions, clearContentData, resetMintableState } from './content/contentDisplaySlice';
import { clearPredictions } from './arweave/arweaveSlice';
import { setNfts, setLoading, setError, clearNfts } from './nftData/nftDataSlice';
import { ContentService } from '@/apps/Modules/LibModules/contentDisplay/services/contentService';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '@/store';

// Consolidated wipe function that handles both content and NFT data
export const wipe = createAsyncThunk(
  'wiper/wipeState',
  async (_, { dispatch }) => {
    // Clear content display state
    dispatch(clearTransactions());
    dispatch(clearContentData());
    dispatch(resetMintableState());
    dispatch(clearPredictions());
    
    // Clear NFT data state
    dispatch(clearNfts());
    
    // Clear service caches
    ContentService.clearCache();
  }
);

// Single hook to handle wiping on unmount or manual triggers
export const useWiper = (triggerDeps: any[] = []) => {
  const dispatch = useDispatch<AppDispatch>();

  // Wipe on specified trigger dependencies
  useEffect(() => {
    dispatch(wipe());
  }, triggerDeps);

  // Wipe on unmount
  useEffect(() => {
    return () => {
      dispatch(wipe());
    };
  }, [dispatch]);

  // Return wipe function for manual triggers
  return () => dispatch(wipe());
};

// Keep the original hook for backward compatibility
export const useWipeOnUnmount = () => {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    return () => {
      dispatch(wipe());
    };
  }, [dispatch]);
};
