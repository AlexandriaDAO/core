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
      
      // Case 1: Browsing all NFTs (the "new" option)
      if (principalId === 'new') {
        // Get total supply first if not provided
        if (!totalItems) {
          totalCount = await (collection === 'NFT' ? icrc7.icrc7_total_supply() : icrc7_scion.icrc7_total_supply());
        }
        
        // Calculate pagination parameters based on sort order
        let start: number;
        if (startFromEnd) {
          // For newest first, start from the end
          start = Number(totalCount) - (page * itemsPerPage);
          start = Math.max(0, start); // Don't go below 0
        } else {
          // For oldest first, start from the beginning
          start = (page - 1) * itemsPerPage;
        }
        
        // Ensure we don't try to fetch more tokens than available
        const adjustedTake = Math.min(itemsPerPage, Number(totalCount) - start);
        
        // Fetch the tokens for this page
        if (adjustedTake > 0) {
          if (collection === 'NFT') {
            allNftIds = await icrc7.icrc7_tokens([BigInt(start)], [BigInt(adjustedTake)]);
          } else {
            allNftIds = await icrc7_scion.icrc7_tokens([BigInt(start)], [BigInt(adjustedTake)]);
          }
          
          // Reverse the results if we want newest first
          if (startFromEnd) {
            allNftIds = allNftIds.reverse();
          }
        }
      } 
      // Case 2: User-specific queries
      else {
        const principal = Principal.fromText(principalId);
        const params = { owner: principal, subaccount: [] as [] };
        
        // Get the total count if not provided
        if (!totalItems) {
          const balanceParams = [{ owner: principal, subaccount: [] as [] }];
          const balance = await (collection === 'NFT' 
            ? icrc7.icrc7_balance_of(balanceParams)
            : icrc7_scion.icrc7_balance_of(balanceParams));
          totalCount = BigInt(balance[0]);
        }
        
        // Simplified pagination approach based on natural token ordering
        
        // For small collections (under 500 tokens), we can optimize differently
        const isSmallCollection = Number(totalCount) <= 500;
        
        if (isSmallCollection) {
          // For small collections, we can fetch all tokens and handle pagination in memory
          // This is more efficient than multiple network calls for small collections
          const allTokens = await (collection === 'NFT' 
            ? icrc7.icrc7_tokens_of(params, [] as [], [totalCount])
            : icrc7_scion.icrc7_tokens_of(params, [] as [], [totalCount]));
          
          // Apply sorting and pagination in memory
          if (startFromEnd) {
            // For newest first, reverse the array
            allTokens.reverse();
          }
          
          // Extract the page we need
          const startIndex = (page - 1) * itemsPerPage;
          const endIndex = Math.min(startIndex + itemsPerPage, allTokens.length);
          allNftIds = allTokens.slice(startIndex, endIndex);
        } 
        else {
          // For larger collections, use cursor-based pagination more efficiently
          
          if (startFromEnd) {
            // For newest first in larger collections:
            // 1. Calculate how many tokens to skip from the end
            const tokensToSkip = Math.max(0, Number(totalCount) - page * itemsPerPage);
            
            // 2. Fetch tokens from the beginning up to the calculated position
            if (tokensToSkip === 0) {
              // We want the last page (from the end), so fetch the remainder
              const remainingTokens = Number(totalCount) % itemsPerPage || itemsPerPage;
              allNftIds = await (collection === 'NFT'
                ? icrc7.icrc7_tokens_of(params, [] as [], [BigInt(remainingTokens)])
                : icrc7_scion.icrc7_tokens_of(params, [] as [], [BigInt(remainingTokens)]));
              
              // Reverse to get newest first
              allNftIds = allNftIds.reverse();
            } 
            else {
              // We need to skip some tokens from the beginning
              // First, fetch tokens up to the point we want to start
              const tokensBeforeStart = await (collection === 'NFT'
                ? icrc7.icrc7_tokens_of(params, [] as [], [BigInt(tokensToSkip)])
                : icrc7_scion.icrc7_tokens_of(params, [] as [], [BigInt(tokensToSkip)]));
              
              // If we got fewer tokens than expected, adjust our approach
              if (tokensBeforeStart.length < tokensToSkip) {
                // We got fewer tokens than expected, so fetch all and paginate in memory
                allNftIds = tokensBeforeStart;
                allNftIds.reverse();
                const startIndex = 0;
                const endIndex = Math.min(itemsPerPage, allNftIds.length);
                allNftIds = allNftIds.slice(startIndex, endIndex);
              } 
              else {
                // Use the last token as cursor to fetch the next page
                const lastToken = tokensBeforeStart[tokensBeforeStart.length - 1];
                allNftIds = await (collection === 'NFT'
                  ? icrc7.icrc7_tokens_of(params, [lastToken], [BigInt(itemsPerPage)])
                  : icrc7_scion.icrc7_tokens_of(params, [lastToken], [BigInt(itemsPerPage)]));
                
                // Reverse to get newest first
                allNftIds = allNftIds.reverse();
              }
            }
          } 
          else {
            // For oldest first in larger collections:
            // Simple cursor-based pagination
            const startIndex = (page - 1) * itemsPerPage;
            
            if (startIndex === 0) {
              // First page - no cursor needed
              allNftIds = await (collection === 'NFT'
                ? icrc7.icrc7_tokens_of(params, [] as [], [BigInt(itemsPerPage)])
                : icrc7_scion.icrc7_tokens_of(params, [] as [], [BigInt(itemsPerPage)]));
            } 
            else {
              // For other pages, we need to navigate to the right position
              // We'll use a more efficient approach with fewer API calls
              
              // Calculate how many tokens to fetch to reach our starting position
              const batchSize = Math.min(startIndex, 100); // Use a reasonable batch size
              let position = 0;
              let lastToken: bigint | null = null;
              
              // Navigate to the position just before our target
              while (position < startIndex) {
                // Determine how many more tokens we need to skip
                const tokensToSkip = Math.min(batchSize, startIndex - position);
                
                // Fetch the next batch
                const navTokens: bigint[] = await (collection === 'NFT'
                  ? icrc7.icrc7_tokens_of(params, lastToken ? [lastToken] : [] as [], [BigInt(tokensToSkip)])
                  : icrc7_scion.icrc7_tokens_of(params, lastToken ? [lastToken] : [] as [], [BigInt(tokensToSkip)]));
                
                // If we couldn't fetch any tokens, we've reached the end
                if (navTokens.length === 0) {
                  break;
                }
                
                // Update our position and last token
                position += navTokens.length;
                lastToken = navTokens[navTokens.length - 1];
                
                console.log(`Navigation: Reached position ${position}/${startIndex}`);
                
                // If we've reached the target, we can stop
                if (position >= startIndex) {
                  break;
                }
              }
              
              // Now fetch the actual page we want
              allNftIds = await (collection === 'NFT'
                ? icrc7.icrc7_tokens_of(params, lastToken ? [lastToken] : [] as [], [BigInt(itemsPerPage)])
                : icrc7_scion.icrc7_tokens_of(params, lastToken ? [lastToken] : [] as [], [BigInt(itemsPerPage)]));
            }
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

