import { arweaveIdToNat } from "@/utils/id_convert";
import { getNftManagerActor } from "@/features/auth/utils/authUtils";

export const mint_nft = async ( transactionId: string ) => {
  const actorNftManager = await getNftManagerActor();

  console.log("transactionId", transactionId);
  const mintNumber = BigInt(arweaveIdToNat(transactionId));
  console.log("mintNumber", mintNumber);
  const description = "";
  const result = await actorNftManager.mint_nft(mintNumber, [description]);
  if ("Err" in result) throw new Error(result.Err);

};
