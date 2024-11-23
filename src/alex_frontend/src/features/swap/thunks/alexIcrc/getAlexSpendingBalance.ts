import { createAsyncThunk } from "@reduxjs/toolkit";
import { Principal } from "@dfinity/principal";
import LedgerService from "@/utils/LedgerService";
import { getNftManagerActor, getAlexActor } from "@/features/auth/utils/authUtils";

const getAlexSpendingBalance = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>(
  "icp_swap/getAlexSpendingBalance",
  async (userPrincipal, { rejectWithValue }) => {
    try {
      const actor = await getAlexActor();
      const nftManagerId = process.env.CANISTER_ID_NFT_MANAGER!;
      
      if (!nftManagerId) {
        throw new Error("NFT Manager canister ID not found in environment variables");
      }

      const nftManagerActor = await getNftManagerActor();
      const subaccount = await nftManagerActor.principal_to_subaccount(
        Principal.fromText(userPrincipal)
      );

      const result = await actor.icrc1_balance_of({
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