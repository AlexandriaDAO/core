import { createAsyncThunk } from "@reduxjs/toolkit";
import { Principal } from "@dfinity/principal";
import LedgerService from "@/utils/LedgerService";
import { ActorSubclass } from "@dfinity/agent";
import { _SERVICE as _SERVICE_ALEX } from "../../../../../../declarations/ALEX/ALEX.did"
import { _SERVICE as _SERVICE_NFT_MANAGER } from "../../../../../../declarations/nft_manager/nft_manager.did"

const getAlexSpendingBalance = createAsyncThunk<
  string,
  {alexActor: ActorSubclass<_SERVICE_ALEX>, nftManagerActor: ActorSubclass<_SERVICE_NFT_MANAGER> , userPrincipal: string},
  { rejectValue: string }
>(
  "icp_swap/getAlexSpendingBalance",
  async ({alexActor, nftManagerActor, userPrincipal}, { rejectWithValue }) => {
    try {
      const nftManagerId = process.env.CANISTER_ID_NFT_MANAGER!;

      if (!nftManagerId) {
        throw new Error("NFT Manager canister ID not found in environment variables");
      }

      const subaccount = await nftManagerActor.principal_to_subaccount(
        Principal.fromText(userPrincipal)
      );

      const result = await alexActor.icrc1_balance_of({
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
        "An unknown error occurred while getting ALEX spending balance"
      );
    }
  }
);

export default getAlexSpendingBalance; 