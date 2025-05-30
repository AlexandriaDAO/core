import { createAsyncThunk } from "@reduxjs/toolkit";
import LedgerService from "@/utils/LedgerService";
import { Principal } from "@dfinity/principal";
import { ActorSubclass } from "@dfinity/agent";
import { _SERVICE } from "../../../../../declarations/icp_ledger_canister/icp_ledger_canister.did";

// Define the async thunk
const getIcpBal = createAsyncThunk<
  {formatedAccountBal:string}, // This is the return type of the thunk's payload
  {actor: ActorSubclass<_SERVICE>, account: string},
  { rejectValue: string }
>("icp_ledger/getIcpBal", async ({actor, account}, { rejectWithValue }) => {
  try {
    let resultAccountBal = await actor.icrc1_balance_of({
      owner: Principal.fromText(account),
      subaccount: []
    });
    const LedgerServices=LedgerService();
    // const formatedAccountBal=LedgerServices.e8sToIcp(resultAccountBal).toFixed(4);
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

export default getIcpBal;
