import { ActorSubclass } from "@dfinity/agent";
import { _SERVICE as _SERVICELBRY } from "../../../../../../declarations/LBRY/LBRY.did";

import { createAsyncThunk } from "@reduxjs/toolkit";
import { Principal } from "@dfinity/principal";
import LedgerService from "@/utils/LedgerService";

// Define the async thunk
const getLbryBalance = createAsyncThunk<
  string, // This is the return type of the thunk's payload
  {
    actorLbry: ActorSubclass<_SERVICELBRY>;
    account: string;
  },
  { rejectValue: string }
>("icp_swap/getLbryBalance", async ({ actorLbry, account }, { rejectWithValue }) => {
  try {
    const result = await actorLbry.icrc1_balance_of({
      owner: Principal.fromText(account),
      subaccount: [],
    });
    const LedgerServices=LedgerService();
    const fromatedBal=LedgerServices.e8sToIcp(result).toString();
  return fromatedBal;
  } catch (error) {
    console.error(error);
    if (error instanceof Error) {
      return rejectWithValue(error.message);
    }
  }
  return rejectWithValue("An unknown error occurred while getting LBRY balance");
});

export default getLbryBalance;
