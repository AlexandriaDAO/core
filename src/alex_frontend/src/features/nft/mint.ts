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
    if (!await client.isAuthenticated()) {
      throw new Error("You must be authenticated to mint an NFT");
    }

    const callerPrincipal = client.getIdentity().getPrincipal().toString();

    // Calculate IDs and check ownership
    const mintNumber = BigInt(arweaveIdToNat(transactionId));
    const [ogOwnerResult, scionOwnerResult] = await Promise.all([
      icrc7.icrc7_owner_of([mintNumber]),
      icrc7_scion.icrc7_owner_of([mintNumber])
    ]);
    
    const ogOwnerStr = ogOwnerResult[0]?.[0]?.owner?.toString() ?? null;
    const scionOwnerStr = scionOwnerResult[0]?.[0]?.owner?.toString() ?? null;

    // Get the subaccount bytes for NFT wallet
    const nftWallet = await nft_manager.to_nft_subaccount(mintNumber);

    // Check if user already owns the NFT
    if (ogOwnerStr === callerPrincipal || scionOwnerStr === callerPrincipal) {
      throw new Error("You already own this NFT");
    }

    // Handle different minting scenarios
    if (ogOwnerStr === null && scionOwnerStr === null) {
      return await mintOriginalNFT(mintNumber);
    } else if (ogOwnerStr !== null) {
      return await mintScionFromOriginal(mintNumber, nftWallet, callerPrincipal);
    } else if (scionOwnerStr !== null) {
      return await mintScionFromScion(mintNumber, nftWallet, callerPrincipal);
    }

    throw new Error("Some unknown case has been triggered. Please contact support.");
  } catch (error) {
    console.error("Mint NFT error:", error);
    throw error;
  }
};

// Helper functions to handle different minting scenarios
async function mintOriginalNFT(mintNumber: bigint): Promise<string> {
  const burnResult = await store.dispatch(transferLBRY({
    amount: LBRY_MINT_COST,
    destination: ICP_SWAP
  })).unwrap();

  if (burnResult !== "success") {
    throw new Error("Failed to burn LBRY tokens");
  }

  const actorNftManager = await getNftManagerActor();
  const client = await getAuthClient();
  const callerPrincipal = client.getIdentity().getPrincipal();
  
  const result = await actorNftManager.mint_nft(mintNumber, callerPrincipal, [""]);
  handleMintResult(result);
  return "Original NFT minted successfully!";
}

async function mintScionFromOriginal(
  mintNumber: bigint, 
  nftWallet: number[] | Uint8Array,
  callerPrincipal: string
): Promise<string> {
  const transferResult = await store.dispatch(transferLBRY({
    amount: LBRY_MINT_COST,
    destination: NFT_MANAGER,
    subaccount: Array.isArray(nftWallet) ? nftWallet : Array.from(nftWallet)
  })).unwrap();

  if (transferResult !== "success") {
    throw new Error("Failed to transfer LBRY");
  }

  const actorNftManager = await getNftManagerActor();
  const newScionId = await ogToScionId(mintNumber, callerPrincipal);
  const client = await getAuthClient();
  const principal = client.getIdentity().getPrincipal();
  
  const result = await actorNftManager.mint_scion_nft(newScionId, principal, [""]);
  handleMintResult(result);
  return "Scion NFT saved successfully!";
}

async function mintScionFromScion(
  mintNumber: bigint, 
  nftWallet: number[] | Uint8Array,
  callerPrincipal: string
): Promise<string> {
  const scionTransferResult = await store.dispatch(transferLBRY({
    amount: LBRY_MINT_COST,
    destination: NFT_MANAGER,
    subaccount: Array.isArray(nftWallet) ? nftWallet : Array.from(nftWallet)
  })).unwrap();

  if (scionTransferResult !== "success") {
    throw new Error("Failed to transfer LBRY to the Scion NFT's wallet");
  }

  const [derivedOgNft] = await scionToOgId(mintNumber);
  const ogNftWallet = await nft_manager.to_nft_subaccount(derivedOgNft);
  
  const ogOwnerExists = (await icrc7.icrc7_owner_of([derivedOgNft]))[0]?.[0]?.owner !== null;
  if (ogOwnerExists) {
    const ogTransferResult = await store.dispatch(transferLBRY({
      amount: LBRY_MINT_COST,
      destination: NFT_MANAGER,
      subaccount: Array.from(ogNftWallet)
    })).unwrap();

    if (ogTransferResult !== "success") {
      throw new Error("Failed to transfer LBRY to the original NFT's wallet");
    }
  }

  const actorNftManager = await getNftManagerActor();
  const newScionId = await ogToScionId(mintNumber, callerPrincipal);
  const client = await getAuthClient();
  const principal = client.getIdentity().getPrincipal();
  
  const result = await actorNftManager.mint_scion_nft(newScionId, principal, [""]);
  handleMintResult(result);
  return "Scion NFT saved successfully!";
}

function handleMintResult(result: { Ok?: string; Err?: string } | undefined) {
  if (!result) {
    throw new Error("Mint operation returned null or undefined");
  }
  if ("Err" in result && result.Err) {
    throw new Error(`Mint failed: ${result.Err}`);
  }
  if (!result.Ok) {
    throw new Error("Mint operation succeeded but returned no ID");
  }
}
