import { Principal } from '@dfinity/principal';
import { icrc7 } from '../../../../../../declarations/icrc7';
import { icrc7_scion } from '../../../../../../declarations/icrc7_scion';
import { user } from '../../../../../../declarations/user';

export interface UserInfo {
  username: string;
  principal: string;
}

export async function getNftOwnerInfo(tokenId: string): Promise<UserInfo | null> {
  try {
    // Determine if this is an SBT by checking tokenId length
    const isSBT = tokenId.length > 80;
    const canister = isSBT ? icrc7_scion : icrc7;
    
    // Query owner from appropriate canister
    const ownerResult = await canister.icrc7_owner_of([BigInt(tokenId)]);
    
    // Check if we have a result
    if (!ownerResult.length) {
      return null;
    }
    
    const firstResult = ownerResult[0];
    if (!firstResult) {
      return null;
    }

    // Handle the case where the result might be wrapped in an optional type
    const ownerRecord = typeof firstResult === 'object' && 'owner' in firstResult
      ? firstResult
      : (firstResult as any)[0];

    if (!ownerRecord || !('owner' in ownerRecord)) {
      console.error('Unexpected owner record structure:', ownerRecord);
      return null;
    }

    const ownerPrincipal = ownerRecord.owner;
    
    // Query user info
    const userResult = await user.get_user(ownerPrincipal);
    
    if ('Ok' in userResult) {
      return {
        username: userResult.Ok.username,
        principal: ownerPrincipal.toString()
      };
    }
    
    return {
      username: 'Unknown',
      principal: ownerPrincipal.toString()
    };
  } catch (error) {
    console.error('Error fetching NFT owner info:', error);
    return null;
  }
} 