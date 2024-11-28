import { createAsyncThunk } from "@reduxjs/toolkit";
import { Principal } from "@dfinity/principal";
import { getActorSwap, getIcpLedgerActor } from "@/features/auth/utils/authUtils";
// Define the async thunk
const swapLbry = createAsyncThunk<
  string, // This is the return type of the thunk's payload
  string,
  { rejectValue: string }
>(
  "icp_swap/swapLbry",
  async ( amount, { rejectWithValue }) => {
    try {
      const actorSwap = await getActorSwap();
      const actorIcpLedger = await getIcpLedgerActor();
      let amountFormat: bigint = BigInt(
        Number(Number(amount) * 10 ** 8).toFixed(0)
      );
      let amountFormatApprove: bigint = BigInt(
        Number((Number(amount) + 0.0001) * 10 ** 8).toFixed(0)
      );

      const icp_swap_canister_id = process.env.CANISTER_ID_ICP_SWAP!;
      const resultIcpApprove = await actorIcpLedger.icrc2_approve({
        spender: {
          owner: Principal.fromText(icp_swap_canister_id),
          subaccount: [],
        },
        amount: amountFormatApprove,
        fee: [BigInt(10000)],
        memo: [],
        from_subaccount: [],
        created_at_time: [],
        expected_allowance: [],
        expires_at: [],
      });
      if ("Err" in resultIcpApprove) {
        const error = resultIcpApprove.Err;
        let errorMessage = "Unknown error"; // Default error message
        if ("TemporarilyUnavailable" in error) {
          errorMessage = "Service is temporarily unavailable";
        }
        throw new Error(errorMessage);
      }
      const result = await actorSwap.swap(amountFormat, []);
      if ("Ok" in result) return "success";
      if ("Err" in result) throw new Error(result.Err);
    } catch (error) {
      console.error(error);

      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
    }
    return rejectWithValue("An unknown error occurred while Swaping");
  }
);

export default swapLbry;
