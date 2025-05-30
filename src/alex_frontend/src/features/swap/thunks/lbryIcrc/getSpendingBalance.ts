import { createAsyncThunk } from "@reduxjs/toolkit";
import { Principal } from "@dfinity/principal";
import LedgerService from "@/utils/LedgerService";
import { _SERVICE as _SERVICE_LBRY } from "../../../../../../declarations/LBRY/LBRY.did";
import { _SERVICE as _SERVICE_NFT_MANAGER } from "../../../../../../declarations/nft_manager/nft_manager.did";
import { ActorSubclass } from "@dfinity/agent";

const getSpendingBalance = createAsyncThunk<
  string,
  {lbryActor: ActorSubclass<_SERVICE_LBRY>, nftManagerActor: ActorSubclass<_SERVICE_NFT_MANAGER> ,userPrincipal: string},
  { rejectValue: string }
>(
  "icp_swap/getSpendingBalance",
  async ({lbryActor, nftManagerActor, userPrincipal}, { rejectWithValue }) => {
    try {
      const nftManagerId = process.env.CANISTER_ID_NFT_MANAGER!;
      
      if (!nftManagerId) {
        throw new Error("NFT Manager canister ID not found in environment variables");
      }

      const subaccount = await nftManagerActor.principal_to_subaccount(
        Principal.fromText(userPrincipal)
      );

      const result = await lbryActor.icrc1_balance_of({
        owner: Principal.fromText(nftManagerId),
        subaccount: [subaccount],
      });

      const LedgerServices = LedgerService();
      return (
        Math.floor(LedgerServices.e8sToIcp(result) * 10 ** 4) /
        10 ** 4
      ).toFixed(4);
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue(
        "An unknown error occurred while getting spending balance"
      );
    }
  }
);

export default getSpendingBalance;
