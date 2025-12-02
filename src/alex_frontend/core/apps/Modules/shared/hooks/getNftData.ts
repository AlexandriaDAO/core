import { useDispatch, useSelector } from "react-redux";
import { useCallback } from "react";
import { RootState } from "@/store";
import { ALEX } from "../../../../../../declarations/ALEX";
import { LBRY } from "../../../../../../declarations/LBRY";
import { nft_manager } from "../../../../../../declarations/nft_manager";
import { feed } from "../../../../../../declarations/feed";
import { Principal } from "@dfinity/principal";
import { updateNftBalances, updateNftRarityPercentage } from "../state/nftData/nftDataSlice";

const NFT_MANAGER_PRINCIPAL = "5sh5r-gyaaa-aaaap-qkmra-cai";

export interface NftDataResult {
  principal: string | null;
  collection?: string;
  balances?: {
    alex: string;
    lbry: string;
  };
  orderIndex?: number;
}

const convertE8sToToken = (e8sAmount: bigint): string => {
  return (Number(e8sAmount) / 1e8).toString();
};

export const useNftData = () => {
  const nfts = useSelector((state: RootState) => state.nftData.nfts);
  const dispatch = useDispatch();

  const getNftData = useCallback(
    async (transactionId: string): Promise<NftDataResult> => {
      try {
        const nftEntry = Object.entries(nfts).find(
          ([_, nft]) => nft.arweaveId === transactionId
        );

        if (nftEntry) {
          const tokenId = BigInt(nftEntry[0]);
          // Subaccount must be fetched first as it's needed for balance calls.
          const subaccount = await nft_manager.to_nft_subaccount(tokenId);

          const balanceParams = {
            owner: Principal.fromText(NFT_MANAGER_PRINCIPAL),
            subaccount: [Array.from(subaccount)],
          };

          // Create promises for balance fetching
          const alexBalancePromise = ALEX.icrc1_balance_of({
            owner: balanceParams.owner,
            subaccount: balanceParams.subaccount as [number[]],
          });
          const lbryBalancePromise = LBRY.icrc1_balance_of({
            owner: balanceParams.owner,
            subaccount: balanceParams.subaccount as [number[]],
          });

          // Create promise for rarity fetching (conditional)
          let rarityPromise;
          if (nftEntry[1].collection === 'NFT') {
            const nftIdNat = BigInt(tokenId.toString());
            rarityPromise = feed.get_rarity_percentages_for_og_nfts([nftIdNat])
              .then(rarityData => {
                if (rarityData && rarityData.length > 0 && rarityData[0]) {
                  // rarityData[0][1] is the nat32 rarity value
                  return { success: true, value: Number(rarityData[0][1]) };
                }
                return { success: true, value: -1 }; // No data found, treat as "not ranked"
              })
              .catch(error => {
                console.error("Error fetching NFT rarity percentage:", error);
                return { success: false, value: -1 }; // Error occurred
              });
          } else {
            rarityPromise = Promise.resolve({ success: false, value: -1, skipped: true }); // Not an NFT, or fetch not applicable
          }

          // Await all promises concurrently
          const [
            alexBalanceResult, 
            lbryBalanceResult, 
            rarityFetchOutcome
          ] = await Promise.all([
            alexBalancePromise, 
            lbryBalancePromise, 
            rarityPromise
          ]);
          
          // Dispatch balance updates
          dispatch(
            updateNftBalances({
              tokenId: tokenId.toString(),
              alex: convertE8sToToken(alexBalanceResult),
              lbry: convertE8sToToken(lbryBalanceResult),
            })
          );

          // Dispatch rarity percentage update if it was an NFT and fetch was attempted
          if (nftEntry[1].collection === 'NFT' && !('skipped' in rarityFetchOutcome && rarityFetchOutcome.skipped)) {
            dispatch(
              updateNftRarityPercentage({
                nftId: tokenId.toString(),
                rarityPercentage: rarityFetchOutcome.value, // This will be the rarity or -1
              })
            );
          }

          return {
            principal: nftEntry[1].principal,
            collection: nftEntry[1].collection,
            balances: {
              alex: convertE8sToToken(alexBalanceResult),
              lbry: convertE8sToToken(lbryBalanceResult),
            },
            orderIndex: nftEntry[1].orderIndex,
          };
        }

        return {
          principal: null,
          collection: undefined,
        };
      } catch (error) {
        console.error("Error finding NFT data in state:", error);
        return {
          principal: null,
          collection: undefined,
        };
      }
    },
    []
  );

  return { getNftData };
};
