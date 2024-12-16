import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { ALEX } from '../../../../../../declarations/ALEX';
import { LBRY } from '../../../../../../declarations/LBRY';
import { nft_manager } from '../../../../../../declarations/nft_manager';
import { Principal } from '@dfinity/principal';

const NFT_MANAGER_PRINCIPAL = "5sh5r-gyaaa-aaaap-qkmra-cai";

export interface NftDataResult {
  principal: string | null;
  collection: string | null;
  balances?: {
    alex: bigint;
    lbry: bigint;
  };
}

export const useNftData = () => {
  const nfts = useSelector((state: RootState) => state.nftData.nfts);

  const getNftData = async (transactionId: string): Promise<NftDataResult> => {
    try {
      const nftEntry = Object.entries(nfts).find(([_, nft]) => 
        nft.arweaveId === transactionId
      );

      if (nftEntry) {
        const tokenId = BigInt(nftEntry[0]);
        const subaccount = await nft_manager.to_nft_subaccount(tokenId);
        
        // Correct Account structure for ICRC-1 balance_of
        const balanceParams = {
          owner: Principal.fromText(NFT_MANAGER_PRINCIPAL),
          subaccount: [Array.from(subaccount)] // Convert to proper subaccount format
        };

        // Get balances from both ALEX and LBRY
        const [alexBalance, lbryBalance] = await Promise.all([
          ALEX.icrc1_balance_of({
            owner: balanceParams.owner,
            subaccount: balanceParams.subaccount as [number[]]
          }),
          LBRY.icrc1_balance_of({
            owner: balanceParams.owner,
            subaccount: balanceParams.subaccount as [number[]]
          })
        ]);

        console.log(`Balances for NFT ${transactionId}:`, {
          alex: alexBalance.toString(),
          lbry: lbryBalance.toString()
        });

        return {
          principal: nftEntry[1].principal,
          collection: nftEntry[1].collection,
          balances: {
            alex: alexBalance,
            lbry: lbryBalance
          }
        };
      }

      return {
        principal: null,
        collection: null
      };
    } catch (error) {
      console.error("Error finding NFT data in state:", error);
      return {
        principal: null,
        collection: null
      };
    }
  };

  return { getNftData };
}; 