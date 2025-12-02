import { createAsyncThunk } from '@reduxjs/toolkit';
import { 
  clearTransactions, 
  clearContentData,
} from './transactions/transactionSlice';
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
      
      // Clear content cache
      ContentService.clearCache();
      
      return true;
    } catch (error) {
      console.error('Error wiping state:', error);
      return rejectWithValue('Failed to wipe state');
    }
  }
);

/**
 * Configuration options for useWiper hook
 */
type WipeConfig = {
  wipeOnUnmount?: boolean;
  triggerDeps?: unknown[];
};

/**
 * Hook that provides state wiping functionality
 * It can be configured to automatically wipe state when the component unmounts
 * and can be triggered when specific dependencies change
 */
export const useWiper = (config: WipeConfig = {}) => {
  const { wipeOnUnmount = false, triggerDeps = [] } = config;
  const dispatch = useDispatch<AppDispatch>();
  
  const wipeState = useCallback(() => {
    return dispatch(wipe());
  }, [dispatch]);
  
  // If triggerDeps are provided, wipe state when they change
  useEffect(() => {
    if (triggerDeps.length > 0) {
      wipeState();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...triggerDeps]);
  
  // Wipe state on unmount if wipeOnUnmount is true
  useEffect(() => {
    return () => {
      if (wipeOnUnmount) {
        wipeState();
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wipeOnUnmount]);
  
  // For backward compatibility, make the function itself callable
  // while still providing the object API
  const wiperFunction = Object.assign(wipeState, { wipeState });
  
  return wiperFunction;
};

/**
 * Simplified hook that always wipes state on component unmount
 */
export const useWipeOnUnmount = () => {
  const dispatch = useDispatch<AppDispatch>();
  
  useEffect(() => {
    return () => {
      dispatch(wipe());
    };
  }, [dispatch]);
  
  // For backward compatibility, return a function
  const wipeFunction = () => dispatch(wipe());
  return wipeFunction;
};
