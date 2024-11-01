import { _SERVICE as _SERVICESWAP } from "../../../../../declarations/icp_swap/icp_swap.did";
import { createAsyncThunk } from "@reduxjs/toolkit";
import LedgerService from "@/utils/LedgerService";
import { getActorSwap } from "@/features/auth/utils/authUtils";
import { CanisterArchived } from "../swapSlice";

// Define the async thunk
const getCanisterArchivedBal = createAsyncThunk<
  CanisterArchived, // This is the return type of the thunk's payload
  void,
  { rejectValue: string }
>("icp_swap/getCanisterArchivedBal", async (_, { rejectWithValue }) => {
  try {
    const LedgerServices = LedgerService();
    const actor = await getActorSwap();
    const resultArchived = await actor.get_total_archived_balance();
    const resultUnclaimed = await actor.get_total_unclaimed_icp_reward();
    const resultArchivedNumber = LedgerServices.e8sToIcp(resultArchived);
    const resultUnclaimedNumber = LedgerServices.e8sToIcp(resultUnclaimed);
    return {
      canisterArchivedBal: resultArchivedNumber,
      canisterUnClaimedIcp: resultUnclaimedNumber,
    };
  } catch (error) {
    console.error("Failed to get canister archived balances:", error);

    if (error instanceof Error) {
      return rejectWithValue(error.message);
    }
  }
  return rejectWithValue(
    "An unknown error occurred while fetching canister archived balances"
  );
});
export default getCanisterArchivedBal;
