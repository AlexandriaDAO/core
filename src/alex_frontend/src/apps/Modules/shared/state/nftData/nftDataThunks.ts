import { createAsyncThunk, AnyAction } from "@reduxjs/toolkit";
import {
  setNFTs as setNfts,
  updateNftBalances,
  setLoading,
  setError,
  setTotalNfts,
} from "./nftDataSlice";
import { RootState } from "@/store";
import { nft_manager } from "../../../../../../../declarations/nft_manager";
import { ALEX } from "../../../../../../../declarations/ALEX";
import { LBRY } from "../../../../../../../declarations/LBRY";
import { Principal } from "@dfinity/principal";
import type { NFTData } from "../../types/nft";
import { setNoResults } from "../librarySearch/librarySlice";
import { fetchNftTransactions } from "../transactions/transactionThunks";
import {
  createTokenAdapter,
  TokenType,
  TokenAdapter,
} from "../../adapters/TokenAdapter";

const NFT_MANAGER_PRINCIPAL = "5sh5r-gyaaa-aaaap-qkmra-cai";

// Add this interface for the batch function
interface BatchFetchParams {
  tokenId: bigint;
  collection: "NFT" | "SBT";
  principalId: string;
  orderIndex?: number; // Add optional order index
}

// Define AppDispatch type
type AppDispatch = any; // Replace with your actual AppDispatch type if available

// Helper function for batch fetching NFTs
const fetchNFTBatchHelper = async (params: BatchFetchParams[]) => {
  const batchSize = 10;
  const results: [string, NFTData][] = [];

  // Create a cache of adapters to avoid creating new ones for each token
  const adapterCache = new Map<TokenType, TokenAdapter>();

  const getAdapter = (collection: "NFT" | "SBT"): TokenAdapter => {
    if (!adapterCache.has(collection)) {
      adapterCache.set(collection, createTokenAdapter(collection));
    }
    return adapterCache.get(collection)!;
  };

  for (let i = 0; i < params.length; i += batchSize) {
    const batch = params.slice(i, i + batchSize);

    // Group tokens by collection
    const tokensByCollection = new Map<
      TokenType,
      {
        tokens: bigint[];
        indices: number[];
      }
    >();

    batch.forEach(({ tokenId, collection }, index) => {
      if (!tokensByCollection.has(collection)) {
        tokensByCollection.set(collection, { tokens: [], indices: [] });
      }
      const collectionData = tokensByCollection.get(collection)!;
      collectionData.tokens.push(tokenId);
      collectionData.indices.push(index);
    });

    // Fetch owners for each collection in parallel
    const ownersByCollection = new Map<
      TokenType,
      Array<
        [] | [{ owner: Principal; subaccount: [] | [Uint8Array | number[]] }]
      >
    >();

    await Promise.all(
      Array.from(tokensByCollection.entries()).map(
        async ([collection, { tokens }]) => {
          const adapter = getAdapter(collection);
          if (tokens.length > 0) {
            const owners = await adapter.getOwnerOf(tokens);
            ownersByCollection.set(collection, owners);
          }
        }
      )
    );

    // Process batch with owner information
    const batchResults = await Promise.all(
      batch.map(
        async ({ tokenId, collection, principalId, orderIndex }, index) => {
          const adapter = getAdapter(collection);

          // Determine the owner principal
          let ownerPrincipal = principalId;

          // If principalId is empty (for 'new' option), get it from the owner lookup
          if (!principalId || principalId === "new") {
            const collectionData = tokensByCollection.get(collection)!;
            const tokenIndex = collectionData.tokens.indexOf(tokenId);
            const owners = ownersByCollection.get(collection) || [];

            const ownerInfo =
              tokenIndex >= 0 && tokenIndex < owners.length
                ? owners[tokenIndex]
                : null;

            if (ownerInfo && ownerInfo.length > 0 && ownerInfo[0]) {
              ownerPrincipal = ownerInfo[0].owner.toString();
            } else {
              // If we can't get the owner from the lookup, try a direct call as fallback
              try {
                const ownerResult = await adapter.getOwnerOf([tokenId]);

                if (
                  ownerResult &&
                  ownerResult.length > 0 &&
                  ownerResult[0] &&
                  ownerResult[0].length > 0 &&
                  ownerResult[0][0]
                ) {
                  ownerPrincipal = ownerResult[0][0].owner.toString();
                } else {
                  console.warn(
                    `Could not determine owner for token ${tokenId.toString()}`
                  );
                  ownerPrincipal = ""; // Default to empty string if owner not found
                }
              } catch (error) {
                console.error(
                  `Error fetching owner for token ${tokenId.toString()}:`,
                  error
                );
                ownerPrincipal = ""; // Default to empty string on error
              }
            }
          }

          // Use the adapter to convert token to NFTData
          const nftData = await adapter.tokenToNFTData(tokenId, ownerPrincipal);

          // Add order index to NFT data if provided
          if (orderIndex !== undefined) {
            nftData.orderIndex = orderIndex;
          }

          return [tokenId.toString(), nftData] as [string, NFTData];
        }
      )
    );
    results.push(...batchResults);
  }

  return results;
};

// Export the interface so it can be imported by other files
export interface FetchTokensParams {
  principalId: string;
  collection: "NFT" | "SBT";
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
  "nftData/fetchTokensForPrincipal",
  async (
    {
      principalId,
      collection,
      page,
      itemsPerPage,
      startFromEnd = true,
      totalItems,
    }, // Add totalItems to destructuring
    { dispatch, getState }
  ) => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));
      dispatch(setNoResults(false));
      //for sorting by balance
      let nftWithBalances: {
        tokenId: bigint;
        alex: bigint;
        lbry: bigint;
      }[];
      // Create the appropriate token adapter
      const tokenAdapter = createTokenAdapter(collection as TokenType);
      const state = getState();
      const sortKey = state.library.sortBalanceBy;
      let allNftIds: bigint[] = [];
      let totalCount: bigint = totalItems ? BigInt(totalItems) : BigInt(0);

      // Case 1: Browsing all NFTs (the "new" option)
      if (principalId === "new") {
        // Get total supply first if not provided
        if (!totalItems) {
          totalCount = await tokenAdapter.getTotalSupply();
        }

        // Calculate pagination parameters based on sort order
        let start: number;
        if (startFromEnd) {
          // For newest first, start from the end
          start = Number(totalCount) - page * itemsPerPage;
          start = Math.max(0, start); // Don't go below 0
        } else {
          // For oldest first, start from the beginning
          start = (page - 1) * itemsPerPage;
        }

        // Ensure we don't try to fetch more tokens than available
        const adjustedTake = Math.min(itemsPerPage, Number(totalCount) - start);

        // Fetch the tokens for this page
        if (adjustedTake > 0) {
          allNftIds = await tokenAdapter.getTokens(
            BigInt(start),
            BigInt(adjustedTake)
          );

          // Reverse the results if we want newest first
          if (startFromEnd) {
            allNftIds = allNftIds.reverse();
          }
        }
      } else if (sortKey === "ALEX" || sortKey === "LBRY") {
        const principal = Principal.fromText(principalId);
        totalCount = await tokenAdapter.getBalanceOf(principal);

        const allTokens = await tokenAdapter.getTokensOf(
          principal,
          undefined,
          totalCount
        );
        // console.log("Time Before ", Date.now());
        // nftWithBalances = await Promise.all(
        //   allTokens.map(async (tokenId) => {
        //     let alexBalance: [bigint] = [BigInt(0)];
        //     let lbryBalance: [bigint] = [BigInt(0)];
        //     const subaccount = await nft_manager.to_nft_subaccount(
        //       BigInt(tokenId)
        //     );
        //     const balanceParams = {
        //       owner: Principal.fromText(NFT_MANAGER_PRINCIPAL),
        //       subaccount: [Array.from(subaccount)] as [number[]],
        //     };
        //     if (sortKey === "ALEX") {
        //       alexBalance = await Promise.all([
        //         ALEX.icrc1_balance_of(balanceParams),
        //       ]);
        //     } else {
        //       lbryBalance = await Promise.all([
        //         LBRY.icrc1_balance_of(balanceParams),
        //       ]);
        //     }

        //     return {
        //       tokenId,
        //       alex: BigInt(alexBalance[0]),
        //       lbry: BigInt(lbryBalance[0]),
        //     };
        //   })
        // );
        // console.log("Time After ", Date.now());

        console.log("Time Before ", Date.now());

        const subaccountPromises = allTokens.map((tokenId) =>
          nft_manager.to_nft_subaccount(BigInt(tokenId)).then((subaccount) => ({
            tokenId,
            subaccount,
          }))
        );
        const subaccounts = await Promise.all(subaccountPromises);

        const balancePromises = subaccounts.map(async ({ tokenId, subaccount }) => {
          const balanceParams = {
            owner: Principal.fromText(NFT_MANAGER_PRINCIPAL),
            subaccount: [Array.from(subaccount)] as [number[]],
          };
          const [alexBalance, lbryBalance] = await Promise.all([
            sortKey === "ALEX"
              ? ALEX.icrc1_balance_of(balanceParams)
              : BigInt(0),
            sortKey === "LBRY"
              ? LBRY.icrc1_balance_of(balanceParams)
              :BigInt(0) ,
          ]);
          return ({
            tokenId,
            alex: BigInt(alexBalance),
            lbry: BigInt(lbryBalance),
          });
        });

        nftWithBalances = await Promise.all(balancePromises);

        console.log("Time After ", Date.now());

        if (sortKey === "ALEX") {
          nftWithBalances.sort((a, b) => Number(b.alex) - Number(a.alex));
        } else if (sortKey === "LBRY") {
          nftWithBalances.sort((a, b) => Number(b.lbry) - Number(a.lbry));
        }
        console.log("nftWithBalances", nftWithBalances);
        // nftWithBalances.sort((a, b) => Number(b.alex) - Number(a.alex));
        const sortedNftIds = nftWithBalances.map((item) => item.tokenId);
        const startIndex = (page - 1) * itemsPerPage;
        const endIndex = Math.min(
          startIndex + itemsPerPage,
          sortedNftIds.length
        );
        allNftIds = sortedNftIds.slice(startIndex, endIndex);
        console.log("nftWithBalances", nftWithBalances);
      } else {
        const principal = Principal.fromText(principalId);

        // Get the total count if not provided
        if (!totalItems) {
          totalCount = await tokenAdapter.getBalanceOf(principal);
        }

        // Simplified pagination approach based on natural token ordering

        // For small collections (under 500 tokens), we can optimize differently
        const isSmallCollection = Number(totalCount) <= 500;

        if (isSmallCollection) {
          // For small collections, we can fetch all tokens and handle pagination in memory
          // This is more efficient than multiple network calls for small collections
          const allTokens = await tokenAdapter.getTokensOf(
            principal,
            undefined,
            totalCount
          );

          // Apply sorting and pagination in memory
          if (startFromEnd) {
            // For newest first, reverse the array
            allTokens.reverse();
          }

          // Extract the page we need
          const startIndex = (page - 1) * itemsPerPage;
          const endIndex = Math.min(
            startIndex + itemsPerPage,
            allTokens.length
          );
          allNftIds = allTokens.slice(startIndex, endIndex);
        } else {
          // For larger collections, use cursor-based pagination more efficiently

          if (startFromEnd) {
            // For newest first in larger collections:
            // 1. Calculate how many tokens to skip from the end
            const tokensToSkip = Math.max(
              0,
              Number(totalCount) - page * itemsPerPage
            );

            // 2. Fetch tokens from the beginning up to the calculated position
            if (tokensToSkip === 0) {
              // We want the last page (from the end), so fetch the remainder
              const remainingTokens =
                Number(totalCount) % itemsPerPage || itemsPerPage;
              allNftIds = await tokenAdapter.getTokensOf(
                principal,
                undefined,
                BigInt(remainingTokens)
              );

              // Reverse to get newest first
              allNftIds = allNftIds.reverse();
            } else {
              // We need to skip some tokens from the beginning
              // First, fetch tokens up to the point we want to start
              const tokensBeforeStart = await tokenAdapter.getTokensOf(
                principal,
                undefined,
                BigInt(tokensToSkip)
              );

              // If we got fewer tokens than expected, adjust our approach
              if (tokensBeforeStart.length < tokensToSkip) {
                // We got fewer tokens than expected, so fetch all and paginate in memory
                allNftIds = tokensBeforeStart;
                allNftIds.reverse();
                const startIndex = 0;
                const endIndex = Math.min(itemsPerPage, allNftIds.length);
                allNftIds = allNftIds.slice(startIndex, endIndex);
              } else {
                // Use the last token as cursor to fetch the next page
                const lastToken =
                  tokensBeforeStart[tokensBeforeStart.length - 1];
                allNftIds = await tokenAdapter.getTokensOf(
                  principal,
                  lastToken,
                  BigInt(itemsPerPage)
                );

                // Reverse to get newest first
                allNftIds = allNftIds.reverse();
              }
            }
          } else {
            // For oldest first in larger collections:
            // Simple cursor-based pagination
            const startIndex = (page - 1) * itemsPerPage;

            if (startIndex === 0) {
              // First page - no cursor needed
              allNftIds = await tokenAdapter.getTokensOf(
                principal,
                undefined,
                BigInt(itemsPerPage)
              );
            } else {
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
                const batch = await tokenAdapter.getTokensOf(
                  principal,
                  lastToken || undefined,
                  BigInt(tokensToSkip)
                );

                // If we got fewer tokens than requested, we've reached the end
                if (batch.length === 0) {
                  break;
                }

                // Update our position and cursor
                position += batch.length;
                lastToken = batch[batch.length - 1];
              }

              // Now fetch the actual page we want
              if (lastToken) {
                allNftIds = await tokenAdapter.getTokensOf(
                  principal,
                  lastToken,
                  BigInt(itemsPerPage)
                );
              } else {
                // If we couldn't navigate to the position, start from the beginning
                allNftIds = await tokenAdapter.getTokensOf(
                  principal,
                  undefined,
                  BigInt(itemsPerPage)
                );
              }
            }
          }
        }
      }
      // Set no results state if the search returned empty
      if (allNftIds.length === 0) {
        dispatch(setNoResults(true));
      }
      dispatch(setTotalNfts(Number(totalCount)));

      // Prepare batch params - for 'new' option, we'll fetch owner info in the batch function
      const batchParams = allNftIds.map((tokenId, index) => ({
        tokenId,
        collection,
        principalId: principalId,
        orderIndex: index, // Add order index to track original sequence
      }));

      // Use batched fetching
      const nftEntries = await fetchNFTBatchHelper(batchParams);
      console.log("nftEntries", nftEntries);
      const nftRecord = Object.fromEntries(nftEntries);

      dispatch(setNfts(nftRecord));

      // Fetch transactions for the NFTs
      // Create an array of objects with arweaveId and orderIndex
      const arweaveIdsWithOrder = Object.entries(nftRecord).map(
        ([tokenId, nft], index) => ({
          arweaveId: nft.arweaveId,
          orderIndex:
            batchParams.find((param) => param.tokenId.toString() === tokenId)
              ?.orderIndex ?? index,
        })
      );

      // Sort by orderIndex to maintain original order
      arweaveIdsWithOrder.sort((a, b) => a.orderIndex - b.orderIndex);

      // Extract just the arweaveIds in the correct order
      const arweaveIds = arweaveIdsWithOrder.map((item) => item.arweaveId);
      // fetchNftTransactions call here 1
      // load loadContentForTransactions in child
      console.log("arweaveIds", arweaveIds);

      await dispatch(
        fetchNftTransactions(arweaveIds) as unknown as AnyAction
      ).unwrap();

      // If we're using the 'new' option, make sure all tokens have owner information
      if (principalId === "new") {
        await dispatch(fetchMissingOwnerInfo()).unwrap();
      }

      // we dont need to fetch nft balance here we are already fetching balance in getnft data
      // Will optimize this later only fetch the required balance
      // fetching here would add unnecessary overhead

      // const convertE8sToToken = (e8sAmount: bigint): string => {
      //   return (Number(e8sAmount) / 1e8).toString();
      // };

      // await Promise.all(
      //   nftEntries.map(async ([tokenId]) => {
      //     const subaccount = await nft_manager.to_nft_subaccount(BigInt(tokenId));
      //     const balanceParams = {
      //       owner: Principal.fromText(NFT_MANAGER_PRINCIPAL),
      //       subaccount: [Array.from(subaccount)] as [number[]]
      //     };

      //     const [alexBalance, lbryBalance] = await Promise.all([
      //       ALEX.icrc1_balance_of(balanceParams),
      //       LBRY.icrc1_balance_of(balanceParams)
      //     ]);

      //     dispatch(updateNftBalances({
      //       tokenId,
      //       alex: convertE8sToToken(alexBalance),
      //       lbry: convertE8sToToken(lbryBalance)
      //     }));
      //   })
      // );
      return nftRecord;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An error occurred";
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
>("nftData/fetchMissingOwnerInfo", async (_, { dispatch, getState }) => {
  try {
    const state = getState();
    const nfts = state.nftData.nfts;

    // Find tokens without principal information
    const tokensWithoutPrincipal = Object.entries(nfts)
      .filter(([_, nft]) => !nft.principal || nft.principal === "")
      .map(([tokenId, nft]) => ({
        tokenId: BigInt(tokenId),
        collection: nft.collection,
      }));

    if (tokensWithoutPrincipal.length === 0) {
      return; // No tokens need owner information
    }

    // Create a cache for TokenAdapter instances
    const adapterCache = new Map<"NFT" | "SBT", TokenAdapter>();

    // Helper function to get the appropriate adapter
    const getAdapter = (collection: "NFT" | "SBT") => {
      if (!adapterCache.has(collection)) {
        adapterCache.set(collection, createTokenAdapter(collection));
      }
      return adapterCache.get(collection)!;
    };

    // Group tokens by collection
    const tokensByCollection = new Map<"NFT" | "SBT", bigint[]>();

    tokensWithoutPrincipal.forEach((token) => {
      const collection = token.collection as "NFT" | "SBT";
      if (!tokensByCollection.has(collection)) {
        tokensByCollection.set(collection, []);
      }

      tokensByCollection.get(collection)!.push(token.tokenId);
    });

    // Fetch owners for each collection in parallel
    const ownerPromises = Array.from(tokensByCollection.entries()).map(
      async ([collection, tokenIds]) => {
        const adapter = getAdapter(collection);
        return {
          collection,
          tokenIds,
          owners: await adapter.getOwnerOf(tokenIds),
        };
      }
    );

    const ownerResults = await Promise.all(ownerPromises);

    // Process results and update Redux store
    const updatedNfts: Record<string, NFTData> = {};

    // Process tokens from each collection
    ownerResults.forEach(({ collection, tokenIds, owners }) => {
      tokenIds.forEach((tokenId, idx) => {
        const ownerInfo = owners[idx];
        if (ownerInfo && ownerInfo.length > 0 && ownerInfo[0]) {
          const principal = ownerInfo[0].owner.toString();
          const tokenIdStr = tokenId.toString();

          if (nfts[tokenIdStr]) {
            updatedNfts[tokenIdStr] = {
              ...nfts[tokenIdStr],
              principal,
            };
          }
        }
      });
    });

    // Update Redux store with the new owner information
    if (Object.keys(updatedNfts).length > 0) {
      dispatch(setNfts(updatedNfts));
    }
  } catch (error) {
    console.error("Error fetching missing owner info:", error);
  }
});

// Thunk to fetch NFT batch information
export const fetchNFTBatch = createAsyncThunk<void, void, { state: RootState }>(
  "nftData/fetchNFTBatch",
  async (_, { getState, dispatch }) => {
    try {
      const state = getState();
      const { nfts } = state.nftData;

      // Find tokens without principal information
      const tokensWithoutPrincipal = Object.entries(nfts)
        .filter(([_, nft]) => !nft.principal || nft.principal === "")
        .map(([tokenId, nft]) => ({
          tokenId: BigInt(tokenId),
          collection: nft.collection,
        }));

      if (tokensWithoutPrincipal.length === 0) {
        return; // No tokens need owner information
      }

      // Create a cache for TokenAdapter instances
      const adapterCache = new Map<"NFT" | "SBT", TokenAdapter>();

      // Helper function to get the appropriate adapter
      const getAdapter = (collection: "NFT" | "SBT") => {
        if (!adapterCache.has(collection)) {
          adapterCache.set(collection, createTokenAdapter(collection));
        }
        return adapterCache.get(collection)!;
      };

      // Group tokens by collection
      const tokensByCollection = new Map<
        "NFT" | "SBT",
        { tokenIds: bigint[]; indices: number[] }
      >();

      tokensWithoutPrincipal.forEach((token, index) => {
        const collection = token.collection as "NFT" | "SBT";
        if (!tokensByCollection.has(collection)) {
          tokensByCollection.set(collection, { tokenIds: [], indices: [] });
        }

        const collectionData = tokensByCollection.get(collection)!;
        collectionData.tokenIds.push(token.tokenId);
        collectionData.indices.push(index);
      });

      // Fetch owners for each collection in parallel
      const ownerPromises = Array.from(tokensByCollection.entries()).map(
        async ([collection, { tokenIds }]) => {
          const adapter = getAdapter(collection);
          return {
            collection,
            owners: await adapter.getOwnerOf(tokenIds),
          };
        }
      );

      const ownerResults = await Promise.all(ownerPromises);

      // Process results and update Redux store
      const updatedNfts: Record<string, NFTData> = {};

      // Process tokens from each collection
      ownerResults.forEach(({ collection, owners }) => {
        const { tokenIds, indices } = tokensByCollection.get(collection)!;

        tokenIds.forEach((tokenId, idx) => {
          const ownerInfo = owners[idx];
          if (ownerInfo && ownerInfo.length > 0 && ownerInfo[0]) {
            const principal = ownerInfo[0].owner.toString();
            const tokenIdStr = tokenId.toString();

            if (nfts[tokenIdStr]) {
              updatedNfts[tokenIdStr] = {
                ...nfts[tokenIdStr],
                principal,
              };
            }
          }
        });
      });

      // Update Redux store with the new owner information
      if (Object.keys(updatedNfts).length > 0) {
        dispatch(setNfts(updatedNfts));
      }
    } catch (error) {
      console.error("Error fetching NFT batch:", error);
    }
  }
);
