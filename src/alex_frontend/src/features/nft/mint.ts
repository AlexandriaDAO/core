import { arweaveIdToNat } from "@/utils/id_convert";
import { getNftManagerActor } from "@/features/auth/utils/authUtils";

export const mint_nft = async (transactionId: string): Promise<void> => {
  try {
    const actorNftManager = await getNftManagerActor();
    console.log("Actor NFT Manager:", actorNftManager);
    
    if (!actorNftManager) {
      throw new Error("NFT Manager Actor not initialized");
    }

    const mintNumber = BigInt(arweaveIdToNat(transactionId));
    const description = "";
    
    const result: { Ok?: any; Err?: any } = await actorNftManager.mint_nft(mintNumber, [description]);
    
    if (!result) {
      throw new Error("Mint operation returned null or undefined");
    }
    
    if ("Err" in result) {
      throw new Error(`Mint failed: ${JSON.stringify(result.Err)}`);
    }

    console.log("Mint successful:", result.Ok);
    return;
  } catch (error) {
    console.error("Mint NFT error:", error);
    throw error;
  }
};
