import { ActorSubclass } from "@dfinity/agent";
import { _SERVICE } from "../../../../../../declarations/ALEX/ALEX.did";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { Principal } from "@dfinity/principal";
import LedgerService from "@/utils/LedgerService";

// Define the asyn thunk
const getAccountAlexBalance = createAsyncThunk<
  string, // This is the return type of the thunk's payload
  {actor: ActorSubclass<_SERVICE>, account: string},
  { rejectValue: string }
>(
  "alex/getAccountAlexBalance",
  async ({actor, account}, { rejectWithValue }) => {
    try {
      const result = await actor.icrc1_balance_of({
        owner: Principal.fromText(account),
        subaccount: [],
      });
      const LedgerServices = LedgerService();
      // const fromatedBal = LedgerServices.e8sToIcp(result).toFixed(4);
      const fromatedBal = (
        Math.floor(LedgerServices.e8sToIcp(result) * 10 ** 4) /
        10 ** 4
      ).toFixed(4);

      return fromatedBal;
    } catch (error) {
      console.error("Failed to get ALEX balance:", error);

      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
    }
    return rejectWithValue(
      "An unknown error occurred while fetching ALEX balance"
    );
  }
);

export default getAccountAlexBalance;
