import { createAsyncThunk } from "@reduxjs/toolkit";
import LedgerService from "@/utils/LedgerService";
import { Principal } from "@dfinity/principal";
import { getIcpLedgerActor } from "@/features/auth/utils/authUtils";
import { AccountIdentifier } from "@dfinity/ledger-icp";

// Define the async thunk
const getAccountId = createAsyncThunk<
  string, // This is the return type of the thunk's payload
  string,
  { rejectValue: string }
>("icp_ledger/getAccountId", async (account, { rejectWithValue }) => {
  try {
    const principal = Principal.fromText(account);
    const accountId = AccountIdentifier.fromPrincipal({principal});
    const accountIdHex = accountId.toHex().toString();
    return accountIdHex;

  } catch (error) {
    console.error("Failed to get account id:", error);

    if (error instanceof Error) {
      return rejectWithValue(error.message);
    }
  }
  return rejectWithValue(
    "An unknown error occurred while account id."
  );
});

export default getAccountId;
