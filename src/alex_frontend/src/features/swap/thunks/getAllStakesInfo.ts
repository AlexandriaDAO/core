import { ActorSubclass } from "@dfinity/agent";
import { _SERVICE } from "../../../../../declarations/ALEX/ALEX.did";
import { createAsyncThunk } from "@reduxjs/toolkit";
import LedgerService from "@/utils/LedgerService";
import { Principal } from "@dfinity/principal";

// Define the async thunk
const getALlStakesInfo = createAsyncThunk<
  string,
  ActorSubclass<_SERVICE>,
  { rejectValue: string }
>("icp_swap/getALlStakesInfo", async (actor, { rejectWithValue }) => {
  try {
    const icp_swap_canister_id = process.env.CANISTER_ID_ICP_SWAP!;
    const LedgerServices = LedgerService();

    const result = await actor.icrc1_balance_of({
      owner: Principal.fromText(icp_swap_canister_id),
      subaccount: [],
    });
    const fromatedBal = (
      Math.floor(LedgerServices.e8sToIcp(result) * 10 ** 4) /
      10 ** 4
    ).toFixed(4);
    return fromatedBal;
  } catch (error) {
    if (error instanceof Error) {
      return rejectWithValue(error.message);
    }
  }
  return rejectWithValue(
    "An unknown error occurred while fetching  all staked info"
  );
});

export default getALlStakesInfo;
