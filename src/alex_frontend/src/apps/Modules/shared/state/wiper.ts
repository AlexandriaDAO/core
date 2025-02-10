import { createAsyncThunk } from '@reduxjs/toolkit';
import { 
  clearTransactions, 
  clearContentData,
} from './content/contentDisplaySlice';
import { clearPredictions } from './arweave/arweaveSlice';
import { 
  clearNfts 
} from './nftData/nftDataSlice';
import { ContentService } from '@/apps/Modules/LibModules/contentDisplay/services/contentService';
import { useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '@/store';

// Group related state clearing operations
const contentStateOperations = [
  clearTransactions,
  clearContentData,
];

const nftStateOperations = [
  clearNfts
];

const predictionStateOperations = [
  clearPredictions
];

export const wipe = createAsyncThunk(
  'wiper/wipeState',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      // Clear content state
      contentStateOperations.forEach(operation => dispatch(operation()));
      
      // Clear NFT state
      nftStateOperations.forEach(operation => dispatch(operation()));
      
      // Clear prediction state
      predictionStateOperations.forEach(operation => dispatch(operation()));
      
      // Clear service caches
      ContentService.clearCache();
      
      return true;
    } catch (error) {
      return rejectWithValue('Failed to wipe state: ' + error);
    }
  }
);

type WipeConfig = {
  wipeOnUnmount?: boolean;
  triggerDeps?: unknown[];
};

/**
 * Unified hook for state wiping functionality
 * @param config - Configuration object for wiping behavior
 * @returns Function to manually trigger wipe
 */
export const useWiper = (config: WipeConfig = {}) => {
  const { wipeOnUnmount = true, triggerDeps = [] } = config;
  const dispatch = useDispatch<AppDispatch>();

  const wipeFunction = useCallback(() => {
    return dispatch(wipe());
  }, [dispatch]);

  // Wipe on trigger dependencies if provided
  useEffect(() => {
    if (triggerDeps.length > 0) {
      wipeFunction();
    }
  }, triggerDeps);

  // Wipe on unmount if enabled
  useEffect(() => {
    if (wipeOnUnmount) {
      return () => {
        wipeFunction();
      };
    }
  }, [wipeOnUnmount, wipeFunction]);

  return wipeFunction;
};

// Deprecated - use useWiper instead
export const useWipeOnUnmount = () => {
  return useWiper({ wipeOnUnmount: true });
};
