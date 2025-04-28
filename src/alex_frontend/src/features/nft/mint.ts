import { getNftManagerActor, getAuthClient } from "@/features/auth/utils/authUtils";
import { Principal } from '@dfinity/principal';
import { store } from "@/store";
import { Nat } from "@dfinity/candid/lib/cjs/idl"; // Import Nat type if needed, agent might use bigint
import { toast } from "sonner";

// Define expected types based on Candid Result<Nat, String>
// Agent typically represents Nat as bigint
type CoordinateMintOk = bigint; // Nat is usually bigint
type CoordinateMintErr = string;
type CoordinateMintResultBackend = 
  | { Ok: CoordinateMintOk } 
  | { Err: CoordinateMintErr };

// Define the structured return type for this function
export type MintResult = 
  | { status: 'success', id: string }          // Newly minted
  | { status: 'already_exists', id: string } // Already owned/minted, ID retrieved
  | { status: 'error', message: string };      // An error occurred

// Function to find existing NFT ID for a given Arweave transaction
const getExistingNftIdForTransaction = async (transactionId: string): Promise<string | null> => {
  console.log(`[mint.ts] Searching for existing NFT ID for Arweave tx: ${transactionId}`);
  
  // First try to find it in the current redux state
  const state = store.getState();
  const nftId = state.nftData.arweaveToNftId[transactionId];
  
  // Verify the NFT is owned by the current user
  if (nftId && state.nftData.nfts[nftId]) {
    const principal = (await getAuthClient()).getIdentity().getPrincipal().toText();
    const owner = state.nftData.nfts[nftId]?.principal;
    
    if (owner === principal) {
      console.log(`[mint.ts] Found existing ID in Redux state: ${nftId} owned by current user`);
      return nftId;
    }
  }
  
  // TODO: If not found in state, could implement a backend call to lookup by transaction
  // const actor = await getSomeOtherActor();
  // const result = await actor.findNftByTx(transactionId);
  // return result.Ok ? result.Ok.toString() : null;
  
  return null;
}

export const mint_nft = async (transactionId: string): Promise<MintResult> => {
  try {
    const client = await getAuthClient();
    if (!await client.isAuthenticated()) {
      return { status: 'error', message: "Authentication required to acquire item." };
    }

    const state = store.getState();
    const nfts = state.nftData.nfts;
    const arweaveToNftId = state.nftData.arweaveToNftId;
    const nftId = arweaveToNftId[transactionId];
    const nftData = nftId ? nfts[nftId] : undefined;
    const ownerStr = nftData?.principal;
    
    // Check if user already owns this NFT before calling backend
    if (nftId && ownerStr === client.getIdentity().getPrincipal().toText()) {
      console.log(`[mint.ts] User already owns NFT with ID ${nftId} for tx ${transactionId}`);
      return { status: 'already_exists', id: nftId };
    }
    
    let ownerArg: [] | [Principal] = [];
    
    const actorNftManager = await getNftManagerActor();
    const result = await actorNftManager.coordinate_mint(transactionId, ownerArg) as CoordinateMintResultBackend;
    console.log("coordinate_mint backend result:", result);

    if ("Err" in result) {
      const errorMsg = result.Err;
      
      // Check for "already owns" type errors
      if (errorMsg.includes("already own") || 
          errorMsg.includes("already minted") || 
          errorMsg.includes("already exists")) {
        
        console.log(`[mint.ts] Backend indicates user already owns item for tx: ${transactionId}`);
        
        // Attempt to retrieve the existing ID
        const existingId = await getExistingNftIdForTransaction(transactionId);
        
        if (existingId) {
          return { status: 'already_exists', id: existingId };
        } else {
          // This is a situation where backend says user owns it but we couldn't find the ID
          console.error(`[mint.ts] Backend indicated ownership for tx ${transactionId}, but failed to retrieve existing ID`);
          
          // Return a proper error that doesn't stop the flow but provides useful information
          return { 
            status: 'error', 
            message: "Could not retrieve your existing item ID. Please try refreshing the page."
          };
        }
      } else {
        // Other backend error
        return { status: 'error', message: `Failed to acquire item: ${errorMsg}` };
      }
    }
    
    // If Ok, result.Ok should be bigint (Nat)
    const mintedNat: CoordinateMintOk = result.Ok;
    const mintedIdString: string = mintedNat.toString();
    
    console.log("[mint.ts] Mint successful. New ID String:", mintedIdString);
    return { status: 'success', id: mintedIdString };

  } catch (error: unknown) {
    console.error("[mint.ts] Unexpected error during mint_nft:", error);
    const message = error instanceof Error ? error.message : "An unexpected error occurred during the minting process.";
    return { status: 'error', message };
  }
};