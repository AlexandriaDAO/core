import { createAsyncThunk } from '@reduxjs/toolkit';
import { 
  setNFTs as setNfts,
  updateNftBalances,
  setLoading,
  setError,
  setTotalNfts
} from './nftDataSlice';
import { RootState } from '@/store';
import { icrc7 } from '../../../../../../../declarations/icrc7';
import { icrc7_scion } from '../../../../../../../declarations/icrc7_scion';
import { nft_manager } from '../../../../../../../declarations/nft_manager';
import { ALEX } from '../../../../../../../declarations/ALEX';
import { LBRY } from '../../../../../../../declarations/LBRY';
import { Principal } from '@dfinity/principal';
import { natToArweaveId } from '@/utils/id_convert';
import type { NFTData } from '../../types/nft';
import { setNoResults } from '../librarySearch/librarySlice';
import { fetchNFTTransactions } from './nftTransactionsThunks';

const NFT_MANAGER_PRINCIPAL = "5sh5r-gyaaa-aaaap-qkmra-cai";

// Add this interface for the batch function
interface BatchFetchParams {
  tokenId: bigint;
  collection: 'NFT' | 'SBT';
  principalId: string;
}

const fetchNFTBatch = async (params: BatchFetchParams[]) => {
  const batchSize = 10;
  const results: [string, NFTData][] = [];
  
  for (let i = 0; i < params.length; i += batchSize) {
    const batch = params.slice(i, i + batchSize);
    
    // Group tokens by collection for batch owner lookup
    const nftTokens: bigint[] = [];
    const sbtTokens: bigint[] = [];
    const tokenMap = new Map<string, { index: number, collection: 'NFT' | 'SBT' }>();
    
    batch.forEach(({ tokenId, collection }, index) => {
      if (collection === 'NFT') {
        nftTokens.push(tokenId);
      } else {
        sbtTokens.push(tokenId);
      }
      tokenMap.set(tokenId.toString(), { index, collection });
    });
    
    // Fetch owners in batch
    const nftOwners = nftTokens.length > 0 ? await icrc7.icrc7_owner_of(nftTokens) : [];
    const sbtOwners = sbtTokens.length > 0 ? await icrc7_scion.icrc7_owner_of(sbtTokens) : [];
    
    // Process batch with owner information
    const batchResults = await Promise.all(
      batch.map(async ({ tokenId, collection, principalId }, index) => {
        // Determine the owner principal
        let ownerPrincipal = principalId;
        
        // If principalId is empty (for 'new' option), get it from the owner lookup
        if (!principalId || principalId === 'new') {
          const ownerInfo = collection === 'NFT' 
            ? nftOwners[nftTokens.indexOf(tokenId)]
            : sbtOwners[sbtTokens.indexOf(tokenId)];
            
          if (ownerInfo && ownerInfo.length > 0 && ownerInfo[0]) {
            ownerPrincipal = ownerInfo[0].owner.toString();
          } else {
            // If we can't get the owner from the lookup, try a direct call as fallback
            try {
              const ownerResult = await (collection === 'NFT' 
                ? icrc7.icrc7_owner_of([tokenId]) 
                : icrc7_scion.icrc7_owner_of([tokenId]));
                
              if (ownerResult && ownerResult.length > 0 && ownerResult[0] && ownerResult[0].length > 0 && ownerResult[0][0]) {
                ownerPrincipal = ownerResult[0][0].owner.toString();
              } else {
                console.warn(`Could not determine owner for token ${tokenId.toString()}`);
                ownerPrincipal = ''; // Default to empty string if owner not found
              }
            } catch (error) {
              console.error(`Error fetching owner for token ${tokenId.toString()}:`, error);
              ownerPrincipal = ''; // Default to empty string on error
            }
          }
        }
        
        if (collection === 'NFT') {
          return [
            tokenId.toString(),
            {
              collection: 'NFT',
              principal: ownerPrincipal,
              arweaveId: natToArweaveId(tokenId)
            }
          ] as [string, NFTData];
        } else {
          const ogId = await nft_manager.scion_to_og_id(tokenId);
          return [
            tokenId.toString(),
            {
              collection: 'SBT',
              principal: ownerPrincipal,
              arweaveId: natToArweaveId(ogId)
            }
          ] as [string, NFTData];
        }
      })
    );
    results.push(...batchResults);
  }
  
  return results;
};

// Export the interface so it can be imported by other files
export interface FetchTokensParams {
  principalId: string;
  collection: 'NFT' | 'SBT';
  page: number;
  itemsPerPage: number;
  startFromEnd?: boolean; // Optional parameter to start from end of supply
  totalItems?: number; // Optional parameter to specify total items for pagination
}

export const fetchTokensForPrincipal = createAsyncThunk<
  Record<string, NFTData>,
  FetchTokensParams,
  { state: RootState }
>(
  'nftData/fetchTokensForPrincipal',
  async (
    { principalId, collection, page, itemsPerPage, startFromEnd = true, totalItems }, // Add totalItems to destructuring
    { dispatch }
  ) => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));
      dispatch(setNoResults(false));
      
      // Add debug logging
      console.log('NFT Search:', { 
        principalId, 
        collection, 
        page, 
        itemsPerPage, 
        sortOrder: startFromEnd ? 'Newest first' : 'Oldest first',
        totalItems,
        range: `${(page - 1) * itemsPerPage + 1}-${Math.min(page * itemsPerPage, totalItems || 0)} of ${totalItems || 'unknown'}`
      });
      
      let allNftIds: bigint[] = [];
      let totalCount: bigint = totalItems ? BigInt(totalItems) : BigInt(0);
      
      if (principalId === 'new') {
        // For 'new' option, get total supply first if not provided
        if (!totalItems) {
          totalCount = await (collection === 'NFT' ? icrc7.icrc7_total_supply() : icrc7_scion.icrc7_total_supply());
        }
        
        // Calculate the start index based on whether we want newest or oldest first
        let start: number;
        if (startFromEnd) {
          // Start from end to get newest first
          start = Number(totalCount) - (page * itemsPerPage);
          start = Math.max(0, start); // Don't go below 0
        } else {
          // Start from beginning to get oldest first
          start = (page - 1) * itemsPerPage;
        }
        
        const adjustedTake = Math.min(itemsPerPage, Number(totalCount) - start);
        
        // Get paginated results
        if (collection === 'NFT') {
          allNftIds = await icrc7.icrc7_tokens([BigInt(start)], [BigInt(adjustedTake)]);
        } else {
          allNftIds = await icrc7_scion.icrc7_tokens([BigInt(start)], [BigInt(adjustedTake)]);
        }
        
        // Only reverse if we're getting newest first
        if (startFromEnd) {
          allNftIds = allNftIds.reverse();
        }
      } else {
        const principal = Principal.fromText(principalId);
        const params = { owner: principal, subaccount: [] as [] };
        
        // For user-specific queries, use server-side pagination instead of fetching all tokens
        // First, get the total count if not provided
        if (!totalItems) {
          const balanceParams = [{ owner: principal, subaccount: [] as [] }];
          const balance = await (collection === 'NFT' 
            ? icrc7.icrc7_balance_of(balanceParams)
            : icrc7_scion.icrc7_balance_of(balanceParams));
          totalCount = BigInt(balance[0]);
        }
        
        // ICRC7 uses cursor-based pagination, not index-based pagination
        // We need a more efficient approach to find tokens at specific positions
        
        // Function to fetch a batch of tokens after a specific cursor
        const fetchTokensBatch = async (prevToken: bigint | null, batchSize: number): Promise<bigint[]> => {
          if (collection === 'NFT') {
            return await icrc7.icrc7_tokens_of(
              params, 
              prevToken ? [prevToken] : [] as [], 
              [BigInt(batchSize)]
            );
          } else {
            return await icrc7_scion.icrc7_tokens_of(
              params, 
              prevToken ? [prevToken] : [] as [], 
              [BigInt(batchSize)]
            );
          }
        };
        
        // Determine the target position based on page and sort order
        let targetPosition: number;
        if (startFromEnd) {
          // For newest first, we need to count from the end
          // This is tricky with cursor-based pagination, so we'll use a different approach
          targetPosition = Math.max(0, Number(totalCount) - page * itemsPerPage);
        } else {
          // For oldest first, we can count from the beginning
          targetPosition = (page - 1) * itemsPerPage;
        }
        
        console.log(`Targeting position ${targetPosition} of ${Number(totalCount)} total tokens`);
        
        // If we're requesting the first page or there are very few tokens, just fetch directly
        if (targetPosition === 0 || Number(totalCount) <= itemsPerPage) {
          allNftIds = await fetchTokensBatch(null, itemsPerPage);
          
          // If we want newest first and we have all tokens, reverse them
          if (startFromEnd && allNftIds.length === Number(totalCount)) {
            allNftIds = allNftIds.reverse();
          }
        } 
        // If we're requesting the last page and want newest first, we can optimize
        else if (startFromEnd && targetPosition < itemsPerPage) {
          // Fetch the first batch which will contain the tokens we need
          const firstBatch = await fetchTokensBatch(null, targetPosition + itemsPerPage);
          
          // Reverse and take the first itemsPerPage tokens
          allNftIds = firstBatch.reverse().slice(0, itemsPerPage);
        }
        // For other cases, we need to navigate to the right position
        else {
          // For large collections, we'll use an exponential search approach
          // This is more efficient than linear navigation for finding distant positions
          
          if (Number(totalCount) > 1000) {
            console.log("Large collection detected, using exponential search strategy");
            
            // Start with a small jump size and double it each time
            let jumpSize = 10;
            let position = 0;
            let lastToken: bigint | null = null;
            let lastPosition = 0;
            
            // Jump forward until we overshoot or reach the target
            while (position < targetPosition) {
              // Calculate the next jump, but don't go beyond the target
              const nextJumpSize = Math.min(jumpSize, targetPosition - position);
              
              // Fetch tokens for this jump
              const jumpTokens = await fetchTokensBatch(lastToken, nextJumpSize);
              
              // If we couldn't fetch any tokens, we've reached the end
              if (jumpTokens.length === 0) {
                break;
              }
              
              // Update our position and last token
              position += jumpTokens.length;
              lastToken = jumpTokens[jumpTokens.length - 1];
              lastPosition = position;
              
              // Double the jump size for next iteration, but cap it at a reasonable value
              jumpSize = Math.min(jumpSize * 2, 500);
              
              console.log(`Exponential search: Reached position ${position}/${targetPosition}`);
              
              // If we've reached or passed the target, we can stop jumping
              if (position >= targetPosition) {
                break;
              }
            }
            
            // Now we're either at or past the target position
            // If we're at the exact position, fetch the next page
            if (position === targetPosition) {
              allNftIds = await fetchTokensBatch(lastToken, itemsPerPage);
            }
            // If we're past the target, we need to start over and navigate more precisely
            else {
              console.log(`Overshot target (at ${position}, need ${targetPosition}), refining search`);
              
              // Start from the beginning and navigate linearly to the target
              position = 0;
              lastToken = null;
              
              // Use a larger batch size for efficiency, but not too large
              const navBatchSize = 100;
              
              while (position < targetPosition) {
                // Calculate how many more tokens we need to skip
                const tokensToSkip = Math.min(navBatchSize, targetPosition - position);
                
                // Fetch the next batch
                const navTokens = await fetchTokensBatch(lastToken, tokensToSkip);
                
                // If we couldn't fetch any tokens, we've reached the end
                if (navTokens.length === 0) {
                  break;
                }
                
                // Update our position and last token
                position += navTokens.length;
                lastToken = navTokens[navTokens.length - 1];
                
                console.log(`Linear navigation: Reached position ${position}/${targetPosition}`);
                
                // If we've reached the target, we can stop
                if (position >= targetPosition) {
                  break;
                }
              }
              
              // Now fetch the actual page we want
              allNftIds = await fetchTokensBatch(lastToken, itemsPerPage);
            }
          } 
          // For smaller collections, use a simpler linear approach
          else {
            console.log("Using linear navigation strategy");
            
            let position = 0;
            let lastToken: bigint | null = null;
            
            // Navigate to the position just before our target
            while (position < targetPosition) {
              // Determine batch size - try to get there in fewer jumps
              const batchSize = Math.min(100, targetPosition - position);
              
              // Fetch the next batch
              const navTokens = await fetchTokensBatch(lastToken, batchSize);
              
              // If we couldn't fetch any tokens, we've reached the end
              if (navTokens.length === 0) {
                break;
              }
              
              // Update our position and last token
              position += navTokens.length;
              lastToken = navTokens[navTokens.length - 1];
              
              console.log(`Navigation: Reached position ${position}/${targetPosition}`);
            }
            
            // Now fetch the actual page we want
            allNftIds = await fetchTokensBatch(lastToken, itemsPerPage);
          }
          
          // If we want newest first and we're not at the beginning, we need a different approach
          if (startFromEnd && targetPosition > 0) {
            // This is a limitation of cursor-based pagination - we can't easily get "newest first"
            // for arbitrary positions without fetching everything and reversing
            console.log("Warning: Newest-first pagination for middle pages is not optimal with cursor-based pagination");
            
            // We'll fetch a larger batch that includes our target range, then reverse and slice
            const extraTokensToFetch = Math.min(500, targetPosition); // Limit how far back we go
            
            // Start from a position that's extraTokensToFetch before our current position
            let position = targetPosition; // Define position variable for this scope
            let backPosition = Math.max(0, position - extraTokensToFetch);
            let backToken: bigint | null = null;
            
            // Navigate to this earlier position
            if (backPosition > 0) {
              let currentPos = 0;
              while (currentPos < backPosition) {
                const batchSize = Math.min(100, backPosition - currentPos);
                const navTokens = await fetchTokensBatch(backToken, batchSize);
                
                if (navTokens.length === 0) break;
                
                currentPos += navTokens.length;
                backToken = navTokens[navTokens.length - 1];
              }
            }
            
            // Fetch a larger batch from this position
            const largerBatch = await fetchTokensBatch(backToken, extraTokensToFetch + itemsPerPage);
            
            // Reverse the batch and take the items we need
            const startSlice = Math.max(0, largerBatch.length - position + backPosition - itemsPerPage);
            const endSlice = Math.min(largerBatch.length, largerBatch.length - position + backPosition);
            
            console.log(`Slicing reversed batch from ${startSlice} to ${endSlice} (batch size: ${largerBatch.length})`);
            allNftIds = largerBatch.reverse().slice(startSlice, endSlice);
          }
        }
      }

      // Set no results state if the search returned empty
      if (allNftIds.length === 0) {
        dispatch(setNoResults(true));
      }

      dispatch(setTotalNfts(Number(totalCount)));
      
      // Add debug logging for results
      console.log('NFT Search Results:', {
        totalNFTs: Number(totalCount),
        fetchedCount: allNftIds.length,
        displayRange: `Showing ${allNftIds.length} NFTs`,
        firstFewTokenIds: allNftIds.slice(0, 5).map(id => id.toString()),
        hasMore: allNftIds.length > 5 ? `...and ${allNftIds.length - 5} more` : ''
      });
      
      // Prepare batch params - for 'new' option, we'll fetch owner info in the batch function
      const batchParams = allNftIds.map(tokenId => ({
        tokenId,
        collection,
        principalId: principalId
      }));

      // Use batched fetching
      const nftEntries = await fetchNFTBatch(batchParams);
      const nftRecord = Object.fromEntries(nftEntries);
      
      dispatch(setNfts(nftRecord));

      // Fetch transactions for the NFTs
      const arweaveIds = Object.values(nftRecord).map(nft => nft.arweaveId);
      await dispatch(fetchNFTTransactions(arweaveIds)).unwrap();

      // If we're using the 'new' option, make sure all tokens have owner information
      if (principalId === 'new') {
        await dispatch(fetchMissingOwnerInfo()).unwrap();
      }

      // Fetch balances for the current page
      const convertE8sToToken = (e8sAmount: bigint): string => {
        return (Number(e8sAmount) / 1e8).toString();
      };

      await Promise.all(
        nftEntries.map(async ([tokenId]) => {
          const subaccount = await nft_manager.to_nft_subaccount(BigInt(tokenId));
          const balanceParams = {
            owner: Principal.fromText(NFT_MANAGER_PRINCIPAL),
            subaccount: [Array.from(subaccount)] as [number[]]
          };

          const [alexBalance, lbryBalance] = await Promise.all([
            ALEX.icrc1_balance_of(balanceParams),
            LBRY.icrc1_balance_of(balanceParams)
          ]);

          dispatch(updateNftBalances({
            tokenId,
            alex: convertE8sToToken(alexBalance),
            lbry: convertE8sToToken(lbryBalance)
          }));
        })
      );
      
      return nftRecord;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      dispatch(setError(errorMessage));
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  }
);

// New thunk to fetch owner information for tokens that don't have a principal
export const fetchMissingOwnerInfo = createAsyncThunk<
  void,
  void,
  { state: RootState }
>(
  'nftData/fetchMissingOwnerInfo',
  async (_, { dispatch, getState }) => {
    try {
      const state = getState();
      const nfts = state.nftData.nfts;
      
      // Find tokens without principal information
      const tokensWithoutPrincipal = Object.entries(nfts)
        .filter(([_, nft]) => !nft.principal || nft.principal === '')
        .map(([tokenId, nft]) => ({
          tokenId: BigInt(tokenId),
          collection: nft.collection
        }));
      
      if (tokensWithoutPrincipal.length === 0) {
        return; // No tokens need owner information
      }
      
      // Group tokens by collection
      const nftTokens = tokensWithoutPrincipal
        .filter(token => token.collection === 'NFT')
        .map(token => token.tokenId);
        
      const sbtTokens = tokensWithoutPrincipal
        .filter(token => token.collection === 'SBT')
        .map(token => token.tokenId);
      
      // Fetch owners in batch
      const nftOwners = nftTokens.length > 0 ? await icrc7.icrc7_owner_of(nftTokens) : [];
      const sbtOwners = sbtTokens.length > 0 ? await icrc7_scion.icrc7_owner_of(sbtTokens) : [];
      
      // Process results and update Redux store
      const updatedNfts: Record<string, NFTData> = {};
      
      // Process NFT tokens
      nftTokens.forEach((tokenId, index) => {
        const ownerInfo = nftOwners[index];
        if (ownerInfo && ownerInfo.length > 0 && ownerInfo[0]) {
          const principal = ownerInfo[0].owner.toString();
          const tokenIdStr = tokenId.toString();
          
          if (nfts[tokenIdStr]) {
            updatedNfts[tokenIdStr] = {
              ...nfts[tokenIdStr],
              principal
            };
          }
        }
      });
      
      // Process SBT tokens
      sbtTokens.forEach((tokenId, index) => {
        const ownerInfo = sbtOwners[index];
        if (ownerInfo && ownerInfo.length > 0 && ownerInfo[0]) {
          const principal = ownerInfo[0].owner.toString();
          const tokenIdStr = tokenId.toString();
          
          if (nfts[tokenIdStr]) {
            updatedNfts[tokenIdStr] = {
              ...nfts[tokenIdStr],
              principal
            };
          }
        }
      });
      
      // Update Redux store with the new owner information
      if (Object.keys(updatedNfts).length > 0) {
        dispatch(setNfts(updatedNfts));
      }
    } catch (error) {
      console.error("Error fetching missing owner information:", error);
    }
  }
);

