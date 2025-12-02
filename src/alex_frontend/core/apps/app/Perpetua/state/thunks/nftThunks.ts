import { createAsyncThunk } from '@reduxjs/toolkit';
import { RootState, AppDispatch } from '@/store';
import { Transaction } from '@/apps/Modules/shared/types/queries';
import { fetchTransactionsByIds } from '@/apps/Modules/LibModules/arweaveSearch/api/directArweaveClient';
import { determineTokenType, createTokenAdapter, TokenType } from '@/apps/Modules/shared/adapters/TokenAdapter';
import { setArweaveTxsInCache } from '@/apps/Modules/shared/state/transactions/transactionSlice';
import { setNFTs } from '@/apps/Modules/shared/state/nftData/nftDataSlice';
import { nft_manager } from '@/../../declarations/nft_manager'; // For scion_to_og_id
import { natToArweaveId } from '@/utils/id_convert';

interface NftMetadataInfo {
  tokenId: string;
  arweaveId: string;
  collection: TokenType;
}

export const fetchNftMetadataBatch = createAsyncThunk<
  void,
  { tokenIds: string[] },
  { dispatch: AppDispatch; state: RootState; rejectValue: string }
>(
  'nft/fetchMetadataBatch',
  async ({ tokenIds }, { dispatch, getState, rejectWithValue }) => {
    if (!tokenIds || tokenIds.length === 0) {
      return;
    }

    console.log('[fetchNftMetadataBatch] Starting for tokenIds:', tokenIds);

    const { arweaveTxCache } = getState().transactions;
    const { nfts: nftsInState } = getState().nftData;
    
    const arweaveIdsToFetch: string[] = [];
    const nftMetadataPayload: Record<string, { arweaveId: string; collection: TokenType, principal?: string, balances?: any }> = {}; // For setNFTs

    try {
      for (const tokenId of tokenIds) {
        if (!tokenId) continue;

        // Determine token type and derive Arweave ID
        const tokenType = determineTokenType(tokenId);
        let arweaveId: string | null = null;
        let displayTokenIdBigInt = BigInt(tokenId);

        if (nftsInState[tokenId]?.arweaveId) {
            arweaveId = nftsInState[tokenId].arweaveId;
            console.log(`[fetchNftMetadataBatch] TokenId ${tokenId} already has arweaveId ${arweaveId} in nftDataSlice.`);
        } else {
            const tokenAdapter = createTokenAdapter(tokenType);
            // We need the original ID (for NFT) or OG ID (for SBT) to get arweaveId
            let idForArweaveDerivation = displayTokenIdBigInt;
            if (tokenType === 'SBT') {
                try {
                    const ogNftIdBigInt = await nft_manager.scion_to_og_id(displayTokenIdBigInt);
                    idForArweaveDerivation = ogNftIdBigInt;
                    console.log(`[fetchNftMetadataBatch] SBT ${tokenId} mapped to OG ID ${ogNftIdBigInt.toString()}`);
                } catch (err) {
                    console.error(`[fetchNftMetadataBatch] Error converting SBT ${tokenId} to OG ID:`, err);
                    // Cannot proceed for this token if conversion fails
                    nftMetadataPayload[tokenId] = { ...nftsInState[tokenId], collection: tokenType, arweaveId: '' }; // Mark as processed with empty arweaveId
                    continue;
                }
            }
            arweaveId = natToArweaveId(idForArweaveDerivation);
            console.log(`[fetchNftMetadataBatch] TokenId ${tokenId} (type: ${tokenType}) derived arweaveId: ${arweaveId}`);
        }
        
        if (!arweaveId) {
            console.warn(`[fetchNftMetadataBatch] Could not determine arweaveId for tokenId: ${tokenId}`);
            nftMetadataPayload[tokenId] = { ...nftsInState[tokenId], collection: tokenType, arweaveId: '' };
            continue;
        }

        // Prepare payload for setNFTs, preserving existing data if any
        nftMetadataPayload[tokenId] = {
          ...nftsInState[tokenId], // Preserve existing balances, principal etc.
          arweaveId: arweaveId,
          collection: tokenType,
        };
        
        // Check if Arweave metadata is already cached
        if (!arweaveTxCache[arweaveId] && !arweaveIdsToFetch.includes(arweaveId)) {
          console.log(`[fetchNftMetadataBatch] Arweave ID ${arweaveId} for token ${tokenId} needs fetching.`);
          arweaveIdsToFetch.push(arweaveId);
        } else {
          console.log(`[fetchNftMetadataBatch] Arweave ID ${arweaveId} for token ${tokenId} is already cached or queued for fetch.`);
        }
      }

      // Dispatch setNFTs to update arweaveId and collection type for all tokens being processed
      // This ensures that nftDataSlice is up-to-date even if metadata was already cached.
      if (Object.keys(nftMetadataPayload).length > 0) {
        dispatch(setNFTs(nftMetadataPayload as any)); // Type assertion needed due to partial nature of payload
      }

      if (arweaveIdsToFetch.length > 0) {
        console.log('[fetchNftMetadataBatch] Fetching Arweave metadata for IDs:', arweaveIdsToFetch);
        const fetchedTransactionsArray: Transaction[] = await fetchTransactionsByIds(arweaveIdsToFetch);
        
        if (fetchedTransactionsArray.length > 0) {
          const newTxsToCache: Record<string, Transaction> = {};
          fetchedTransactionsArray.forEach(tx => {
            if (tx && tx.id) { // Ensure transaction and id are valid
              newTxsToCache[tx.id] = tx;
            }
          });
          if (Object.keys(newTxsToCache).length > 0) {
            console.log('[fetchNftMetadataBatch] Dispatching setArweaveTxsInCache with new transactions:', newTxsToCache);
            dispatch(setArweaveTxsInCache(newTxsToCache));
          } else {
            console.log('[fetchNftMetadataBatch] No valid new transactions to cache from Arweave.');
          }
        } else {
          console.log('[fetchNftMetadataBatch] No transactions returned from Arweave for IDs:', arweaveIdsToFetch);
        }
      } else {
        console.log('[fetchNftMetadataBatch] No new Arweave metadata to fetch.');
      }
      console.log('[fetchNftMetadataBatch] Finished successfully.');

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error in fetchNftMetadataBatch';
      console.error('[fetchNftMetadataBatch] CRITICAL ERROR:', errorMessage, error);
      return rejectWithValue(errorMessage);
    }
  }
); 