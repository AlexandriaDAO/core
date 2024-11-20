import { ActorSubclass } from "@dfinity/agent";
import {
  _SERVICE as _SERVICELBRY,
  TransferArg,
} from "../../../../../../declarations/LBRY/LBRY.did";

import { createAsyncThunk } from "@reduxjs/toolkit";
import { Principal } from "@dfinity/principal";
import { Account } from "@dfinity/ledger-icp";
import { getLbryActor } from "@/features/auth/utils/authUtils";

// Define the async thunk
const transferLBRY = createAsyncThunk<
  string,
  {
    amount: string;
    destination: string;
    subaccount?: number[];
  },
  { rejectValue: string }
>(
  "icp_swap/transferLBRY",
  async (
    { amount, destination, subaccount },
    { rejectWithValue }
  ) => {
    try {
      const actorLbry = await getLbryActor();
      const amountFormat = BigInt(Math.floor(Number(amount) * 10 ** 8));
      let recipientAccount: Account;
      
      recipientAccount = {
        owner: Principal.fromText(destination),
        subaccount: subaccount ? [subaccount] : [],
      };

      const transferArg: TransferArg = {
        to: recipientAccount,
        fee: [],
        memo: [],
        from_subaccount: [],
        created_at_time: [],
        amount: amountFormat
      };
      const result = await actorLbry.icrc1_transfer(transferArg);
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
      "An unknown error occurred while transfering LBRY"
    );
  }
);

export default transferLBRY;
