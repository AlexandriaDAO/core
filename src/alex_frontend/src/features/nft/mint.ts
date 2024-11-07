import { arweaveIdToNat, ogToScionId, scionToOgId, demonstrateConversions } from "@/utils/id_convert";
import { getNftManagerActor } from "@/features/auth/utils/authUtils";
import { icrc7 } from "../../../../declarations/icrc7";
import { icrc7_scion } from "../../../../declarations/icrc7_scion";
import { getAuthClient } from "@/features/auth/utils/authUtils";

/*
// TODO:

- If the NFT already exists
  - If it does, check if the parallel NFT exists.
    - If it does, mint a copy.
  - Else, mint the original as usual.
*/


export const mint_nft = async (transactionId: string): Promise<void> => {
  try {
    demonstrateConversions();
    
    // Get necessary actors and client
    const client = await getAuthClient();
    const actorNftManager = await getNftManagerActor();
    const callerPrincipal = client.getIdentity().getPrincipal().toString();

    // Calculate IDs and check ownership
    const mintNumber = BigInt(arweaveIdToNat(transactionId));
    const isOwned = await icrc7.icrc7_owner_of([mintNumber]);
    const scionId = await ogToScionId(mintNumber, callerPrincipal);
    const ownsScion = await icrc7_scion.icrc7_owner_of([scionId]);
    
    // Get current owner info
    const currentOwner = isOwned[0]?.[0]?.owner;
    const ownerPrincipalStr = currentOwner ? currentOwner.toString() : null;

    // Handle different minting scenarios
    let result: { Ok?: any; Err?: any };

    // Case 1: No owner - mint original NFT
    console.log("ownerPrincipalStr", ownerPrincipalStr);
    if (ownerPrincipalStr === null) {
      console.log("minting original NFT");
      result = await actorNftManager.mint_nft(mintNumber, [""]);
    }
    // Case 2: User already owns the NFT
    else if (ownerPrincipalStr === callerPrincipal) {
      console.log("You already own this NFT.");
      throw new Error("You already own this NFT.");
    }
    // Case 3: User already owns the Scion NFT
    else if (ownsScion) {
      console.log("You already saved this NFT.");
      throw new Error("You already saved this NFT.");
    }
    // Case 4: Mint Scion NFT
    else if (!ownsScion) {
      console.log("minting scion NFT");
      // result = await actorNftManager.mint_scion_nft(scionId, [""]);
      result = result = await actorNftManager.mint_nft(mintNumber, [""]); // This is bogus to avoid the type issue before redeploying nft_manager with new candid.
    }
    // Fallback case
    else {
      console.log("Invalid minting scenario");
      throw new Error("Invalid minting scenario");
    }

    // Handle mint result
    if (!result) {
      throw new Error("Mint operation returned null or undefined");
    }

    if ("Err" in result) {
      throw new Error(`Mint failed: ${JSON.stringify(result.Err)}`);
    }

    console.log("Mint successful:", result.Ok);
  } catch (error) {
    console.error("Mint NFT error:", error);
    throw error;
  }
};
