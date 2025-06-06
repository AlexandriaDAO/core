import { ActorSubclass } from "@dfinity/agent";
import { _SERVICE } from "../../../../declarations/nft_manager/nft_manager.did";

// Define collection type for better type safety
export type NftCollection = 'icrc7' | 'icrc7_scion';

export const withdraw_nft = async (
  actor: ActorSubclass<_SERVICE>,
  mintNumber: string,
  collection?: NftCollection
): Promise<[bigint | null, bigint | null]> => {
  console.log("withdraw_nft called with mintNumber:", mintNumber, "collection:", collection);
  try {
    // Validate and convert mintNumber to bigint
    if (!mintNumber || mintNumber.trim() === '') {
      throw new Error("Mint number cannot be empty");
    }

    // Remove any non-numeric characters and leading zeros
    const cleanedNumber = mintNumber.replace(/[^0-9]/g, '').replace(/^0+/, '') || '0';
    const mintNumberBigInt = BigInt(cleanedNumber);

    // Call the backend withdraw function with collection
    const result = await actor.withdraw(
      mintNumberBigInt, 
      collection ? [collection] : [] // Convert to optional array for Candid
    );

    // Handle the result
    if ("Err" in result) {
      throw new Error(`Withdrawal failed: ${result.Err}`);
    }

    // Extract LBRY and ALEX block indices from the result
    const [lbryBlockIndex, alexBlockIndex] = result.Ok;
    
    // Convert the optional arrays to the expected type, handling undefined case
    return [
      lbryBlockIndex?.[0] ?? null,
      alexBlockIndex?.[0] ?? null
    ];

  } catch (error) {
    console.error("Withdraw NFT error:", error);
    throw error instanceof Error 
      ? error 
      : new Error("Unknown error during NFT withdrawal");
  }
};
