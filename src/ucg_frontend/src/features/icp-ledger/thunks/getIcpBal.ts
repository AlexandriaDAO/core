import { ActorSubclass } from "@dfinity/agent";
import { _SERVICE as _SERVICEICPLEDGER } from "../../../../../declarations/icp_ledger_canister/icp_ledger_canister.did";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { number } from "yup";

// Define the async thunk
const getIcpBal = createAsyncThunk<
  string, // This is the return type of the thunk's payload
  {
    actor: ActorSubclass<_SERVICEICPLEDGER>;
    account:string
  },
  { rejectValue: string }
>("icp_ledger/getIcpBal", async ( {actor,account} , { rejectWithValue }) => {
  try {
    const result = await actor.account_balance_dfx({ account: account });
    return ( Number( result.e8s) /(Number(100000000))).toString(); // Return the e8s value of the Tokens

  } catch (error) {
    console.error("Failed to get LBRY_ratio:", error);

    if (error instanceof Error) {
      return rejectWithValue(error.message);
    }
  }
  return rejectWithValue("An unknown error occurred while fetching ICP balance");
});

export default getIcpBal;
