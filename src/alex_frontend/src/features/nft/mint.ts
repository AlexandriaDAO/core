import { arweaveIdToNat, ogToScionId, scionToOgId } from "@/utils/id_convert";
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

    // Get Scion owner info
    const scionOwner = ownsScion[0]?.[0]?.owner;
    const scionOwnerStr = scionOwner ? scionOwner.toString() : null;

    // Define type to match the candid interface
    type Result = {
      Ok?: string;
      Err?: string;
    };

    let result: Result | undefined;

    console.log("ownerPrincipalStr", ownerPrincipalStr);
    console.log("callerPrincipal", callerPrincipal);
    console.log("scionId", scionId);
    console.log("scionOwnerStr", scionOwnerStr);
    
    // Case 1: No owner - mint original NFT
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
    else if (scionOwnerStr === callerPrincipal) {
      console.log("You already saved this NFT.");
      throw new Error("You already saved this NFT.");
    }
    // Case 4: Mint Scion NFT
    else if (scionOwnerStr === null) {
      console.log("minting scion NFT");
      result = await actorNftManager.mint_scion_nft(scionId, [""]);
      console.log("scion minting result", result);
    }

    // Handle mint result
    if (!result) {
      throw new Error("Mint operation returned null or undefined");
    }

    if ("Err" in result && result.Err) {
      throw new Error(`Mint failed: ${result.Err}`);
    }

    if (!result.Ok) {
      throw new Error("Mint operation succeeded but returned no ID");
    }

    // Extract just the ID number from the success message
    const idMatch = result.Ok.match(/token ID: ([\d_]+)/);
    if (!idMatch) {
      throw new Error("Could not extract token ID from response");
    }

    // Remove underscores and convert to BigInt
    const mintedId = BigInt(idMatch[1].replace(/_/g, ''));
    console.log("Mint successful:", mintedId);
  } catch (error) {
    console.error("Mint NFT error:", error);
    throw error;
  }
};
