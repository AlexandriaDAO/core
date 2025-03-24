import { useDispatch, useSelector } from "react-redux";
import { useCallback } from "react";
import { RootState } from "@/store";
import { ALEX } from "../../../../../../declarations/ALEX";
import { LBRY } from "../../../../../../declarations/LBRY";
import { nft_manager } from "../../../../../../declarations/nft_manager";
import { Principal } from "@dfinity/principal";
import { updateNftBalances } from "../state/nftData/nftDataSlice";

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
          const subaccount = await nft_manager.to_nft_subaccount(tokenId);

          // Correct Account structure for ICRC-1 balance_of
          const balanceParams = {
            owner: Principal.fromText(NFT_MANAGER_PRINCIPAL),
            subaccount: [Array.from(subaccount)],
          };

          //Get balances from both ALEX and LBRY
          const [alexBalance, lbryBalance] = await Promise.all([
            ALEX.icrc1_balance_of({
              owner: balanceParams.owner,
              subaccount: balanceParams.subaccount as [number[]],
            }),
            LBRY.icrc1_balance_of({
              owner: balanceParams.owner,
              subaccount: balanceParams.subaccount as [number[]],
            }),
          ]);
          dispatch(
            updateNftBalances({
              tokenId: tokenId.toString(),
              alex: convertE8sToToken(alexBalance),
              lbry: convertE8sToToken(lbryBalance),
            })
          );

          return {
            principal: nftEntry[1].principal,
            collection: nftEntry[1].collection,
            balances: {
              alex: convertE8sToToken(alexBalance),
              lbry: convertE8sToToken(lbryBalance),
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
