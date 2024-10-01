import { ActorSubclass } from "@dfinity/agent";
import { _SERVICE as NftManager } from "../../../../../declarations/nft_manager/nft_manager.did";
import { arweaveIdToNat } from "@/utils/id_convert";

export const mint_nft = async (
  transactionId: string,
  actorNftManager: ActorSubclass<NftManager>,
) => {

  const mintNumber = BigInt(arweaveIdToNat(transactionId));
  const description = "";
  const result = await actorNftManager.mint_nft(mintNumber, [description]);
  if ("Err" in result) throw new Error(result.Err);

};
