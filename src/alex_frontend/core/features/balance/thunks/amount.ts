import { createAsyncThunk } from "@reduxjs/toolkit";
import { Principal } from "@dfinity/principal";
import { icp_ledger_canister } from "../../../../../declarations/icp_ledger_canister";

const amount = createAsyncThunk<
  number,
  void,
  { rejectValue: string }
>("balance/amount", async (_, { rejectWithValue }) => {
  try {
    const icp_swap_canister_id = process.env.CANISTER_ID_ICP_SWAP!;

    let resultAccountBal = await icp_ledger_canister.icrc1_balance_of({
      owner: Principal.fromText(icp_swap_canister_id),
      subaccount: []
    });

    const formatedAccountBal = Number(resultAccountBal) / 100000000; // Convert e8s to ICP
    return formatedAccountBal;
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

export default amount;