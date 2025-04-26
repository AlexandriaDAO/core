import { getNftManagerActor, getAuthClient } from "@/features/auth/utils/authUtils";
import { Principal } from '@dfinity/principal';
import { store } from "@/store";
import { Nat } from "@dfinity/candid/lib/cjs/idl"; // Import Nat type if needed, agent might use bigint
import { toast } from "sonner";

// Define expected types based on Candid Result<Nat, String>
// Agent typically represents Nat as bigint
type CoordinateMintOk = bigint; // Nat is usually bigint
type CoordinateMintErr = string;
type CoordinateMintResult = 
  | { Ok: CoordinateMintOk } 
  | { Err: CoordinateMintErr };

export const mint_nft = async (transactionId: string): Promise<string | null> => {
  try {
    const client = await getAuthClient();
    if (!await client.isAuthenticated()) {
      throw new Error("You must be authenticated to mint an NFT");
    }

    const state = store.getState();
    const nfts = state.nftData.nfts;
    const arweaveToNftId = state.nftData.arweaveToNftId;
    const nftId = arweaveToNftId[transactionId];
    const nftData = nftId ? nfts[nftId] : undefined;
    const ownerStr = nftData?.principal;
    
    let ownerArg: [] | [Principal] = [];
    if (ownerStr) {
      try {
        const owner = Principal.fromText(ownerStr);
        ownerArg = [owner];
      } catch (error) {
        console.error("Error converting owner string to Principal:", error);
        throw new Error("Invalid owner principal format");
      }
    }
    
    const actorNftManager = await getNftManagerActor();
    // Cast the result to the expected type
    const result = await actorNftManager.coordinate_mint(transactionId, ownerArg) as CoordinateMintResult;
    console.log("coordinate_mint result:", result);

    if ("Err" in result) {
      // Handle specific known errors if needed
      if (result.Err.includes("already own")) {
          toast.info("You already own this NFT.");
      } else if (result.Err.includes("already minted a scion")) {
          toast.info("You have already liked this item.");
      } else {
          toast.error(`Minting failed: ${result.Err}`);
      }
      throw new Error(result.Err); // Re-throw to indicate failure
    }
    
    // --- If Ok, result.Ok should be bigint (Nat) --- 
    const mintedNat: CoordinateMintOk = result.Ok;
    
    // Convert the bigint Nat to a string ID
    const mintedIdString: string = mintedNat.toString();
    
    console.log("Minted ID String:", mintedIdString);
    return mintedIdString; // Return the actual minted ID string

  } catch (error) {
    console.error("Mint NFT error:", error);
    // Don't show generic toast here if specific toasts handled above
    // toast.error(error instanceof Error ? error.message : "An unexpected error occurred"); 
    return null; // Return null on error
  }
};