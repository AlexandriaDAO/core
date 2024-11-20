/*
The Plan:

- Case1 already works. 1NFT is burned to mint a new NFT.
- Case 2: User already owns the NFT
  - Do nothing.
- Case 3: User already owns the Scion NFT
  - Do nothing.
- Case 4: Mint Scion NFT
  - Send 1 LBRY to the NFT's wallet
- 


*/


import { arweaveIdToNat, ogToScionId, scionToOgId } from "@/utils/id_convert";
import { getNftManagerActor, getAuthClient } from "@/features/auth/utils/authUtils";
import { icrc7 } from "../../../../declarations/icrc7";
import { icrc7_scion } from "../../../../declarations/icrc7_scion";
import { nft_manager } from "../../../../declarations/nft_manager";
import transferLBRY from "@/features/swap/thunks/lbryIcrc/transferLBRY";
import { store } from "@/store";

const ICP_SWAP = "54fqz-5iaaa-aaaap-qkmqa-cai";
const NFT_MANAGER = "5sh5r-gyaaa-aaaap-qkmra-cai";
const LBRY_MINT_COST = "1";

export const mint_nft = async (transactionId: string): Promise<string> => {
  try {
    // Get necessary actors and client
    const client = await getAuthClient();
    const actorNftManager = await getNftManagerActor();
    const callerPrincipal = client.getIdentity().getPrincipal().toString();

    // Calculate IDs and check ownership
    const mintNumber = BigInt(arweaveIdToNat(transactionId));
    const ogOwner = await icrc7.icrc7_owner_of([mintNumber]);
    const scionOwner = await icrc7_scion.icrc7_owner_of([mintNumber]);
    
    // Get current owner info
    const currentOgOwner = ogOwner[0]?.[0]?.owner;
    const ogOwnerStr = currentOgOwner ? currentOgOwner.toString() : null;

    // Get Scion owner info
    const currentScionOwner = scionOwner[0]?.[0]?.owner;
    const scionOwnerStr = currentScionOwner ? currentScionOwner.toString() : null;

    // Get the subaccount bytes
    const nftWallet = await nft_manager.to_nft_subaccount(mintNumber);

    // Define type to match the candid interface
    type Result = {
      Ok?: string;
      Err?: string;
    };

    let result: Result | undefined;

    if (!(await client.isAuthenticated())) {
      throw new Error("You must be authenticated to mint an NFT");
    }

    // TODO: If user has no LBRY, stop the minting process.

    // Case 1: No owner - mint original NFT
    else if (ogOwnerStr === null && scionOwnerStr === null) {

      // First burn 1 LBRY token
      const burnResult = await store.dispatch(transferLBRY({
        amount: LBRY_MINT_COST,
        destination: ICP_SWAP
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
    else if (ogOwnerStr === callerPrincipal || scionOwnerStr === callerPrincipal) {
      throw new Error("You already own this NFT");
    }

    // Case 3: Og Owner - Mint Scion NFT
    else if (ogOwnerStr !== null) {
      // Send 1 LBRY to the nft's wallet
      const transferResult = await store.dispatch(transferLBRY({
        amount: LBRY_MINT_COST,
        destination: NFT_MANAGER,
        subaccount: Array.from(nftWallet)
      })).unwrap();

      if (transferResult !== "success") {
      console.log("minting scion NFT");
      const newScionId = await ogToScionId(mintNumber, callerPrincipal);
      result = await actorNftManager.mint_scion_nft(newScionId, [""]);
        return "Scion NFT saved successfully!";
      }

    // Case 4: Scion Owner - Pay 2 owners, mint Scion NFT.
    else if (scionOwnerStr !== null) {

      // Send 1/2 LBRY to the scion wallet.
      const scionTransferResult = await store.dispatch(transferLBRY({
        amount: LBRY_MINT_COST.toString(),
        destination: NFT_MANAGER,
        subaccount: Array.from(nftWallet)
      })).unwrap();
      
      const [derivedOgNft] = await scionToOgId(mintNumber);
      const ogNftWallet = await nft_manager.to_nft_subaccount(derivedOgNft);

      // ensure the og nft is not burned before sending LBRY to it.
      if ((await icrc7.icrc7_owner_of([derivedOgNft]))[0]?.[0]?.owner.toString() !== null) {
        const ogTransferResult = await store.dispatch(transferLBRY({
          amount: LBRY_MINT_COST.toString(),
          destination: NFT_MANAGER,
          subaccount: Array.from(ogNftWallet)
        })).unwrap();

        if (ogTransferResult !== "success") {
          throw new Error("Failed to transfer LBRY to the original NFT's wallet");
        }
      } 

      // mint the scion nft
      const newScionId = await ogToScionId(mintNumber, callerPrincipal);
      result = await actorNftManager.mint_scion_nft(newScionId, [""]);
      return "Scion NFT saved successfully!";
    }
      else {
        throw new Error("Some unknown case has been triggered. Please contact support.");
      }
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
