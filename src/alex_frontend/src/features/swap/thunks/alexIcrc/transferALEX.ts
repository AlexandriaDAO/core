import { TransferArg } from "../../../../../../declarations/ALEX/ALEX.did";

import { createAsyncThunk } from "@reduxjs/toolkit";
import { Principal } from "@dfinity/principal";
import { Account } from "@dfinity/ledger-icp";
import { getAlexActor } from "@/features/auth/utils/authUtils";

// Define the async thunk
const transferALEX = createAsyncThunk<
  string, // This is the return type of the thunk's payload
  {
    amount: string;
    destination: string;
  },
  { rejectValue: string }
>(
  "alex/transferALEX",
  async (
    { amount, destination },
    { rejectWithValue }
  ) => {
    try {
      const actorAlex = await getAlexActor();
      const amountFormat =  BigInt(Math.floor(Number(amount) * 10 ** 8));
      let recipientAccount: Account;
      recipientAccount = {
        owner: Principal.fromText(destination),
        subaccount: [],
      };

      const transferArg: TransferArg = {
        to: recipientAccount,
        fee: [],//default fee
        memo: [],
        from_subaccount: [],
        created_at_time: [],
        amount: amountFormat
      };
      const result= await actorAlex.icrc1_transfer(transferArg);
      if ("Ok" in result) return "success";
      else {
        console.log("error is ", result.Err);
        throw result.Err;
      }
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
    }
    return rejectWithValue(
      "An unknown error occurred while transfering ALEX"
    );
  }
);

export default transferALEX;
