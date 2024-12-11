import { arweaveIdToNat } from "@/utils/id_convert";
import { icrc7 } from '../../../../../../declarations/icrc7';
import { icrc7_scion } from '../../../../../../declarations/icrc7_scion';

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

  return { checkOwnership };
}; 