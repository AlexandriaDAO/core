import { Principal } from '@dfinity/principal';
import { store } from "@/store";
import { nft_manager } from "@/../../declarations/nft_manager";
import { createTokenAdapter } from "@/apps/Modules/shared/adapters/TokenAdapter";
import { ActorSubclass } from '@dfinity/agent';
import { _SERVICE } from '../../../../declarations/nft_manager/nft_manager.did';

// Define expected types based on Candid Result<Nat, String>
// Agent typically represents Nat as bigint
type CoordinateMintOk = bigint; // Nat is usually bigints
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
  const {arweaveToNftId, nfts} = store.getState().nftData;
  const {user} = store.getState().auth;

  if(!user) {
    throw new Error("You must be authenticated to mint NFTs");
  }

  const currentUserPrincipalText = user.principal
  const currentUserPrincipal = Principal.fromText(currentUserPrincipalText);

  // --- Step 1: Check Redux Cache ---
  const cachedNftId = arweaveToNftId[transactionId];
  if (cachedNftId && nfts[cachedNftId]) {
    const cachedOwner = nfts[cachedNftId]?.principal;
    if (cachedOwner === currentUserPrincipalText) {
      console.log(`[mint.ts] Found existing ID in Redux state: ${cachedNftId} owned by current user`);
      return cachedNftId;
    } else {
       console.log(`[mint.ts] Found ID ${cachedNftId} in Redux for tx ${transactionId}, but owner (${cachedOwner}) doesn't match current user (${currentUserPrincipalText}).`);
    }
  } else {
     console.log(`[mint.ts] Did not find owned ID for tx ${transactionId} in Redux cache.`);
  }

  // --- Step 2: Fallback - Query Canisters Directly ---
  console.log(`[mint.ts] Redux check failed for tx ${transactionId}, querying canisters...`);
  try {
    // Convert Arweave ID to the base minting number (Nat/bigint)
    // Assuming nft_manager actor can do this conversion, or use a local utility if available
    const mintingNumber: bigint = await nft_manager.arweave_id_to_nat(transactionId);

    // Check ownership of the original NFT
    const nftAdapter = createTokenAdapter("NFT");
    const nftOwnerResult = await nftAdapter.getOwnerOf([mintingNumber]);
    if (nftOwnerResult && nftOwnerResult.length > 0 && nftOwnerResult[0] && nftOwnerResult[0].length > 0 && nftOwnerResult[0][0]) {
        const nftOwnerPrincipal = nftOwnerResult[0][0].owner;
        if (nftOwnerPrincipal.toText() === currentUserPrincipalText) {
             console.log(`[mint.ts] Found owned original NFT via canister query: ID ${mintingNumber.toString()}`);
             return mintingNumber.toString();
        }
    }

    // If not original NFT owner, check ownership of the Scion SBT
    // Calculate the Scion ID for the current user
    const scionId: bigint = await nft_manager.og_to_scion_id(mintingNumber, currentUserPrincipal);

    const sbtAdapter = createTokenAdapter("SBT");
    const sbtOwnerResult = await sbtAdapter.getOwnerOf([scionId]);
     if (sbtOwnerResult && sbtOwnerResult.length > 0 && sbtOwnerResult[0] && sbtOwnerResult[0].length > 0 && sbtOwnerResult[0][0]) {
        const sbtOwnerPrincipal = sbtOwnerResult[0][0].owner;
         if (sbtOwnerPrincipal.toText() === currentUserPrincipalText) {
             console.log(`[mint.ts] Found owned Scion SBT via canister query: ID ${scionId.toString()}`);
             return scionId.toString();
         }
     }

    // If neither is found owned by the user after checking canisters
    console.log(`[mint.ts] No owned NFT or SBT found for tx ${transactionId} after canister query.`);
    return null;

  } catch (error) {
     console.error(`[mint.ts] Error during canister query fallback for tx ${transactionId}:`, error);
     return null; // Return null on error during fallback
  }
}

export const mint_nft = async (actor: ActorSubclass<_SERVICE>, transactionId: string): Promise<MintResult> => {
  try {
    const {user} = store.getState().auth;

    if(!user) {
      throw new Error("You must be authenticated to mint NFTs");
    }

    const currentUserPrincipalText = user.principal;

    // --- Optimization: Check Redux cache *before* calling backend ---
    // This avoids backend call if user clearly owns it according to cache
    const {nfts, arweaveToNftId} = store.getState().nftData;
    const cachedNftId = arweaveToNftId[transactionId];
    const nftData = cachedNftId ? nfts[cachedNftId] : undefined;
    const ownerStr = nftData?.principal;

    if (cachedNftId && ownerStr === currentUserPrincipalText) {
      console.log(`[mint.ts] User already owns NFT with ID ${cachedNftId} for tx ${transactionId} (checked Redux before backend call)`);
      return { status: 'already_exists', id: cachedNftId };
    }
    // --- End Optimization ---

    let ownerArg: [] | [Principal] = []; // Keep ownerArg logic if needed for specific mint flows

    // Use the existing coordinate_mint call
    const result = await actor.coordinate_mint(transactionId, ownerArg) as CoordinateMintResultBackend;
    console.log("coordinate_mint backend result:", result);

    if ("Err" in result) {
      const errorMsg = result.Err;

      // Check for "already owns" type errors
      if (errorMsg.includes("already own") ||
          errorMsg.includes("already minted") ||
          errorMsg.includes("already exists") || // Added "already exists" just in case
          errorMsg.includes("You have already minted a scion")) { // Added Scion specific error

        console.log(`[mint.ts] Backend indicates user already owns item for tx: ${transactionId}`);

        // Attempt to retrieve the existing ID using the *updated* function
        const existingId = await getExistingNftIdForTransaction(transactionId);

        if (existingId) {
          // Successfully found the ID (either from cache or canister query)
          return { status: 'already_exists', id: existingId };
        } else {
          // This should now only happen if the backend says owned, but the direct query fails
          // (e.g., network issue during query, unexpected state mismatch)
          console.error(`[mint.ts] Backend indicated ownership for tx ${transactionId}, but failed to retrieve existing ID even after direct canister query.`);
          // Return a more specific error perhaps?
          return {
            status: 'error',
            message: "Could not retrieve your existing item ID. Please try again or contact support if the issue persists."
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