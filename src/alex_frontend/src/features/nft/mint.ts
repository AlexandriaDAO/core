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
import { Principal } from "@dfinity/principal";
import { store } from "@/store";

const BURN_ADDRESS = "54fqz-5iaaa-aaaap-qkmqa-cai";
const NFT_MANAGER = "5sh5r-gyaaa-aaaap-qkmra-cai";
const LBRY_MINT_COST = "1";

export const mint_nft = async (transactionId: string): Promise<string> => {
  try {
    // Get necessary actors and client
    const client = await getAuthClient();
    const actorNftManager = await getNftManagerActor();
    const callerPrincipal = client.getIdentity().getPrincipal().toString();

    if (!(await client.isAuthenticated())) {
      throw new Error("You must be authenticated to mint an NFT");
    }

    // Calculate IDs and check ownership
    const mintNumber = BigInt(arweaveIdToNat(transactionId));
    const ogOwner = await icrc7.icrc7_owner_of([mintNumber]);
    
    // First determine if this is an OG or Scion NFT mint attempt
    const currentOgOwner = ogOwner[0]?.[0]?.owner;
    const ogOwnerStr = currentOgOwner ? currentOgOwner.toString() : null;

    // If OG NFT exists, this might be a Scion NFT mint
    if (ogOwnerStr !== null) {
      // First check if user owns the original NFT
      if (ogOwnerStr === callerPrincipal) {
        throw new Error("You already own the original NFT");
      }

      const scionId = await ogToScionId(mintNumber, callerPrincipal);
      const scionOwner = await icrc7_scion.icrc7_owner_of([scionId]);
      const currentScionOwner = scionOwner[0]?.[0]?.owner;
      const scionOwnerStr = currentScionOwner ? currentScionOwner.toString() : null;

      // Check if user already owns this Scion NFT
      if (scionOwnerStr === callerPrincipal) {
        throw new Error("You already saved this NFT");
      }

      // Get subaccounts for both NFT wallets
      const ogNftWallet = await nft_manager.to_nft_subaccount(mintNumber);
      const scionNftWallet = await nft_manager.to_nft_subaccount(scionId);

      // Send LBRY to OG NFT wallet
      const transferResult1 = await store.dispatch(transferLBRY({
        amount: LBRY_MINT_COST,
        destination: NFT_MANAGER,
        account: {
          owner: Principal.fromText(NFT_MANAGER),
          subaccount: [Array.from(ogNftWallet)]
        }
      })).unwrap();

      // Send LBRY to Scion NFT wallet
      const transferResult2 = await store.dispatch(transferLBRY({
        amount: LBRY_MINT_COST,
        destination: NFT_MANAGER,
        account: {
          owner: Principal.fromText(NFT_MANAGER),
          subaccount: [Array.from(scionNftWallet)]
        }
      })).unwrap();

      if (transferResult1 !== "success" || transferResult2 !== "success") {
        throw new Error("Failed to transfer LBRY tokens to NFT wallets");
      }

      const result = await actorNftManager.mint_scion_nft(scionId, [""]);
      return "Scion NFT saved successfully!";
    } 
    // This is an OG NFT mint attempt
    else {
      // Burn 1 LBRY token
      const burnResult = await store.dispatch(transferLBRY({
        amount: LBRY_MINT_COST,
        destination: BURN_ADDRESS
      })).unwrap();

      if (burnResult !== "success") {
        throw new Error("Failed to burn LBRY tokens");
      }

      const result = await actorNftManager.mint_nft(mintNumber, [""]);
      return "Original NFT minted successfully!";
    }

  } catch (error) {
    console.error("Mint NFT error:", error);
    throw error;
  }
};
