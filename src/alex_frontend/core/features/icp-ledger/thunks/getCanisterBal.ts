import { createAsyncThunk } from "@reduxjs/toolkit";
import LedgerService from "@/utils/LedgerService";
import { Principal } from "@dfinity/principal";
import { ActorSubclass } from "@dfinity/agent";
import { _SERVICE } from "../../../../../declarations/icp_ledger_canister/icp_ledger_canister.did";
// import { getIcpLedgerActor } from "@/features/auth/utils/authUtils";

// Define the async thunk
const getCanisterBal = createAsyncThunk<
  {formatedAccountBal:string}, // This is the return type of the thunk's payload
  ActorSubclass<_SERVICE>,
  { rejectValue: string }
>("icp_ledger/getCanisterBal", async ( actor ,{ rejectWithValue }) => {
  try {
    const icp_swap_canister_id = process.env.CANISTER_ID_ICP_SWAP!;

    let resultAccountBal = await actor.icrc1_balance_of({
      owner: Principal.fromText(icp_swap_canister_id),
      subaccount: []
    });
    const LedgerServices=LedgerService();
    const formatedAccountBal = (Math.floor(LedgerServices.e8sToIcp(resultAccountBal) * 10 ** 4) / 10 ** 4).toFixed(4);
    return ({formatedAccountBal})
  } catch (error) {
    console.error("Failed to get ICP Balance:", error);

    if (error instanceof Error) {
      return rejectWithValue(error.message);
    }
  }
  return rejectWithValue(
    "An unknown error occurred while fetching ICP balance"
  );
});

export default getCanisterBal;
