import { Principal } from "@dfinity/principal";
import { icrc7 } from '../../../../../../declarations/icrc7';
import { icrc7_scion } from '../../../../../../declarations/icrc7_scion';
import { nft_manager } from '../../../../../../declarations/nft_manager';
import { natToArweaveId } from "@/utils/id_convert";
import { useSelector } from 'react-redux';
import { RootState } from '@/store';

export const getNfts = () => {
  const nfts = useSelector((state: RootState) => state.nftData.nfts);

  const getTokensForPrincipal = async (principalId: string, collection: string) => {
    try {
      console.log(`Fetching tokens for collection: ${collection}`);
      
      // Get stored NFTs for this principal and collection
      const relevantNfts = Object.values(nfts)
        .filter(nft => nft.principal === principalId && nft.collection === collection);

      let nftIds: bigint[] = [];
      
      if (collection === 'icrc7') {
        nftIds = relevantNfts.map(nft => BigInt(nft.tokenId));
      } else if (collection === 'icrc7_scion') {
        // Convert stored scion NFTs to original NFT IDs
        nftIds = await Promise.all(
          relevantNfts.map(async (nft) => {
            return await nft_manager.scion_to_og_id(BigInt(nft.tokenId));
          })
        );
      } else {
        throw new Error('Invalid collection');
      }
      
      const arweaveIds = nftIds.map(natToArweaveId);
      console.log('Converted Arweave IDs:', arweaveIds);
      return arweaveIds;
    } catch (error) {
      console.error('Error fetching tokens for principal:', error);
      throw error;
    }
  };

  return { getTokensForPrincipal };
};
