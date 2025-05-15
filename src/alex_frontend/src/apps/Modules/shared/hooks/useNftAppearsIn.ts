import { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { fetchShelvesContainingNft } from '../state/nftData/nftDataThunks';
import { NFTData } from '../types/nft';

export const useNftAppearsIn = (nft: NFTData | null | undefined) => {
  const dispatch = useDispatch<AppDispatch>();
  const arweaveIdFromProp = nft?.arweaveId;
  const [fetchInitiatedForArweaveId, setFetchInitiatedForArweaveId] = useState<string | null>(null);

  console.log('[useNftAppearsIn] Hook called. NFT prop:', nft);
  console.log('[useNftAppearsIn] arweaveIdFromProp:', arweaveIdFromProp);

  const { appearsIn, nftStoreKey } = useSelector((state: RootState) => {
    if (!arweaveIdFromProp) {
      console.log('[useNftAppearsIn useSelector] No arweaveIdFromProp, returning undefineds');
      return { appearsIn: undefined, nftStoreKey: undefined };
    }
    
    const storeKey = state.nftData.arweaveToNftId[arweaveIdFromProp];
    const appears_in = storeKey ? state.nftData.nfts[storeKey]?.appears_in : undefined;
    
    console.log(`[useNftAppearsIn useSelector] arweaveId: ${arweaveIdFromProp}, Found storeKey: ${storeKey}, Selected appears_in:`, appears_in);
    return { appearsIn: appears_in, nftStoreKey: storeKey };
  });

  console.log(`[useNftAppearsIn] Data from useSelector - nftStoreKey: ${nftStoreKey}, appearsIn:`, appearsIn);

  useEffect(() => {
    console.log(`[useNftAppearsIn useEffect] Evaluating. arweaveIdFromProp: ${arweaveIdFromProp}, nftStoreKey: ${nftStoreKey}, typeof appearsIn: ${typeof appearsIn}, fetchInitiatedForArweaveId: ${fetchInitiatedForArweaveId}`);
    
    if (arweaveIdFromProp && nftStoreKey && (typeof appearsIn === 'undefined' || fetchInitiatedForArweaveId !== arweaveIdFromProp)) {
      console.log(`[useNftAppearsIn useEffect] Dispatching fetchShelvesContainingNft with nftId (storeKey): ${nftStoreKey}, arweaveId: ${arweaveIdFromProp}`);
      dispatch(fetchShelvesContainingNft({ nftId: nftStoreKey, arweaveId: arweaveIdFromProp }));
      setFetchInitiatedForArweaveId(arweaveIdFromProp);
    } else if (arweaveIdFromProp && !nftStoreKey) {
        console.warn(`[useNftAppearsIn useEffect] Arweave ID "${arweaveIdFromProp}" present, but no nftStoreKey found in arweaveToNftId map. Cannot fetch appearsIn data. Full map:`, useSelector((state: RootState) => state.nftData.arweaveToNftId));
    } else if (arweaveIdFromProp && nftStoreKey && typeof appearsIn !== 'undefined') {
        console.log(`[useNftAppearsIn useEffect] AppearsIn data already present or fetched (type: ${typeof appearsIn}), not dispatching. Data:`, appearsIn);
    }
  }, [dispatch, arweaveIdFromProp, nftStoreKey, appearsIn, fetchInitiatedForArweaveId]);

  // Reset fetchInitiated state if the arweaveIdFromProp changes
  useEffect(() => {
    // Only reset if arweaveIdFromProp is defined, to avoid resetting on initial mount when it might be null/undefined briefly
    if (arweaveIdFromProp) {
        // console.log(`[useNftAppearsIn] arweaveIdFromProp changed to ${arweaveIdFromProp}, resetting fetchInitiatedForArweaveId from ${fetchInitiatedForArweaveId}`);
        setFetchInitiatedForArweaveId(null); 
    }
  }, [arweaveIdFromProp]);

  const loading = useSelector((state: RootState) => state.nftData.loading);
  const error = useSelector((state: RootState) => state.nftData.error);

  console.log(`[useNftAppearsIn] Returning: appearsIn:`, appearsIn, `loading: ${loading}, error: ${error}`);
  return { appearsIn, loading, error }; 
};
