import { ActorSubclass } from "@dfinity/agent";
import {
  _SERVICE as _SERVICEICPLEDGER,
  TransferArgs,
} from "../../../../../declarations/icp_ledger_canister/icp_ledger_canister.did";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { AccountIdentifier } from "@dfinity/ledger-icp";
import { Principal } from "@dfinity/principal";

// Define the async thunk
const transferICP = createAsyncThunk<
  string, // This is the return type of the thunk's payload
  {
    actor: ActorSubclass<_SERVICEICPLEDGER>;
    amount: string;
    destination: string;
    accountType: string;
  },
  { rejectValue: string }
>(
  "icp_ledger/transferICP",
  async ({ actor, amount, destination, accountType }, { rejectWithValue }) => {
    try {
      const amountFormat = {
        e8s: BigInt(Math.floor(Number(amount) * 10 ** 8)),
      };
      let recipientAccountId: AccountIdentifier;
      if (accountType === "principal") {
        const recipientPrincipal = Principal.fromText(destination);
        recipientAccountId = AccountIdentifier.fromPrincipal({
          principal: recipientPrincipal,
        });
      } else {
        recipientAccountId = AccountIdentifier.fromHex(destination); //account id
      }
      const transferArg: TransferArgs = {
        to: recipientAccountId.toUint8Array(),
        fee: { e8s: BigInt(10000) },
        memo: BigInt(250),
        from_subaccount: [],
        created_at_time: [],
        amount: amountFormat,
      };

      const result = await actor.transfer(transferArg);
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
    return rejectWithValue("An unknown error occurred while Swaping");
  }
);

export default transferICP;
