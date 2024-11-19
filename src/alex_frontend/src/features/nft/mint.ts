import { arweaveIdToNat, ogToScionId, scionToOgId } from "@/utils/id_convert";
import { getNftManagerActor, getAuthClient } from "@/features/auth/utils/authUtils";
import { icrc7 } from "../../../../declarations/icrc7";
import { icrc7_scion } from "../../../../declarations/icrc7_scion";
import { nft_manager } from "../../../../declarations/nft_manager";
import transferLBRY from "@/features/swap/thunks/lbryIcrc/transferLBRY";
import { store } from "@/store";

const BURN_ADDRESS = "54fqz-5iaaa-aaaap-qkmqa-cai";
const LBRY_MINT_COST = "1";

export const mint_nft = async (transactionId: string): Promise<string> => {
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

    if (!(await client.isAuthenticated())) {
      throw new Error("You must be authenticated to mint an NFT");
    }
    // Case 1: No owner - mint original NFT
    else if (ownerPrincipalStr === null) {
      // First burn 1 LBRY token
      const burnResult = await store.dispatch(transferLBRY({
        amount: LBRY_MINT_COST,
        destination: BURN_ADDRESS
      })).unwrap();
      console.log("burnResult", burnResult);
      if (burnResult !== "success") {
        throw new Error("Failed to burn LBRY tokens");
      }

      console.log("LBRY burned successfully, minting original NFT");
      result = await actorNftManager.mint_nft(mintNumber, [""]);
      return "Original NFT minted successfully!";
    }
    // Case 2: User already owns the NFT
    else if (ownerPrincipalStr === callerPrincipal) {
      throw new Error("You already own this NFT");
    }
    // Case 3: User already owns the Scion NFT
    else if (scionOwnerStr === callerPrincipal) {
      throw new Error("You already saved this NFT");
    }
    // Case 4: Mint Scion NFT
    else if (scionOwnerStr === null) {
      console.log("minting scion NFT");
      result = await actorNftManager.mint_scion_nft(scionId, [""]);
      return "Scion NFT saved successfully!";
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

    return `NFT minted successfully with ID: ${mintedId}`;
  } catch (error) {
    console.error("Mint NFT error:", error);
    throw error;
  }
};
