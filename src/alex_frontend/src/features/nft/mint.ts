import { arweaveIdToNat } from "@/utils/id_convert";
import { getNftManagerActor, getAuthClient } from "@/features/auth/utils/authUtils";

export const mint_nft = async (transactionId: string): Promise<string> => {
  try {
    // Get necessary actors and client
    const client = await getAuthClient();
    if (!await client.isAuthenticated()) {
      throw new Error("You must be authenticated to mint an NFT");
    }

    // Calculate mint number from Arweave ID
    const mintNumber = BigInt(arweaveIdToNat(transactionId));

    // Call the backend coordinate_mint function
    const actorNftManager = await getNftManagerActor();
    const result = await actorNftManager.coordinate_mint(mintNumber);

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