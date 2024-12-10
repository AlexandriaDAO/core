import { Principal } from "@dfinity/principal";
import { icrc7 } from '../../../../../../declarations/icrc7';
import { icrc7_scion } from '../../../../../../declarations/icrc7_scion';
import { nft_manager } from '../../../../../../declarations/nft_manager';
import { arweaveIdToNat, natToArweaveId } from "@/utils/id_convert";

export const getNftOwner = () => {
  const checkOwnership = async (transactionId: string, collection: string) => {
    try {
      const tokenIds = [BigInt(arweaveIdToNat(transactionId))];
      let ownerPrincipals;

      if (collection === 'icrc7') {
        ownerPrincipals = await icrc7.icrc7_owner_of(tokenIds);
      } else if (collection === 'icrc7_scion') {
        ownerPrincipals = await icrc7_scion.icrc7_owner_of(tokenIds);
      } else {
        throw new Error('Invalid collection');
      }

      if (ownerPrincipals && ownerPrincipals.length > 0 && ownerPrincipals[0].length > 0) {
        return ownerPrincipals[0].toString();
      }
      return null;
    } catch (error) {
      console.error("Error fetching owner:", error);
      return null;
    }
  };

  const getTokensForPrincipal = async (principalId: string, collection: string) => {
    try {
      console.log(`Fetching tokens for collection: ${collection}`);
      const principal = Principal.fromText(principalId);
      const params = { owner: principal, subaccount: [] as [] };
      const limit = [BigInt(10000)] as [bigint];

      let nftIds;
      if (collection === 'icrc7') {
        nftIds = await icrc7.icrc7_tokens_of(params, [], limit);
        console.log('ICRC7 NFT IDs:', nftIds);
      } else if (collection === 'icrc7_scion') {
        const scionNftIds = await icrc7_scion.icrc7_tokens_of(params, [], limit);
        console.log('ICRC7 Scion NFT IDs:', scionNftIds);
        // Convert scion NFTs to original NFT IDs
        nftIds = await Promise.all(
          scionNftIds.map(async (scionId) => {
            return await nft_manager.scion_to_og_id(scionId);
          })
        );
        console.log('Converted to original NFT IDs:', nftIds);
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

  return { checkOwnership, getTokensForPrincipal };
}; 