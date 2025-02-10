import { getNftManagerActor, getAuthClient } from "@/features/auth/utils/authUtils";
import { Principal } from '@dfinity/principal';
import { store } from "@/store";

export const mint_nft = async (transactionId: string): Promise<string> => {
  try {
    // Get necessary actors and client
    const client = await getAuthClient();
    if (!await client.isAuthenticated()) {
      throw new Error("You must be authenticated to mint an NFT");
    }

    // Get the owner from NFT data
    const state = store.getState();
    const nfts = state.nftData.nfts;
    const arweaveToNftId = state.nftData.arweaveToNftId;
    const nftId = arweaveToNftId[transactionId];
    const nftData = nftId ? nfts[nftId] : undefined;
    const ownerStr = nftData?.principal;
    
    // Convert owner string to Principal if it exists
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
    
    // Call the backend coordinate_mint function
    const actorNftManager = await getNftManagerActor();
    const result = await actorNftManager.coordinate_mint(transactionId, ownerArg);
    console.log("OwnerArg", ownerArg);

    // Handle the result
    if ("Err" in result) {
      throw new Error(result.Err);
    }
    
    return result.Ok;

  } catch (error) {
    console.error("Mint NFT error:", error);
    throw error;
  }
};