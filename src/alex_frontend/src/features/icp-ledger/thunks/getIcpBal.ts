import { ActorSubclass } from "@dfinity/agent";
import { _SERVICE as _SERVICEICPLEDGER } from "../../../../../declarations/icp_ledger_canister/icp_ledger_canister.did";
import { createAsyncThunk } from "@reduxjs/toolkit";
import LedgerService from "@/utils/LedgerService";
import { Principal } from "@dfinity/principal";

// Define the async thunk
const getIcpBal = createAsyncThunk<
  {formatedAccountBal:string,formatedSubAccountBal:string}, // This is the return type of the thunk's payload
  {
    actor: ActorSubclass<_SERVICEICPLEDGER>;
    subaccount: string;
    account: string;
  },
  { rejectValue: string }
>("icp_ledger/getIcpBal", async ({ actor, subaccount,account }, { rejectWithValue }) => {
  try {
    let resultAccountBal = await actor.icrc1_balance_of({
      owner: Principal.fromText(account),
      subaccount: []
    });
    const resultSubAccountBal = await actor.account_balance_dfx({ account: subaccount });
    const LedgerServices=LedgerService();
    const formatedAccountBal=LedgerServices.e8sToIcp(resultAccountBal).toString();
    const formatedSubAccountBal=LedgerServices.e8sToIcp(resultSubAccountBal.e8s).toFixed(8).toString();
    return ({formatedAccountBal,formatedSubAccountBal})
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
