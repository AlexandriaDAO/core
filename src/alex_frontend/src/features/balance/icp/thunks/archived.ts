import { createAsyncThunk } from "@reduxjs/toolkit";
import { Principal } from "@dfinity/principal";
import { icp_swap } from "../../../../../../declarations/icp_swap";
import { wait } from "@/utils/lazyLoad";
import { RootState } from "@/store";

const archived = createAsyncThunk<
  number,
  void,
  { rejectValue: string, state: RootState }
>("balance/icp/archived", async (_, { rejectWithValue, getState }) => {
  try {
    await wait(10000)

    const {user} = getState().auth;
    if(!user?.principal) throw new Error('User is unaunthenticated');

    const result = await icp_swap.get_user_archive_balance(Principal.fromText(user.principal));

    if (result[0] && result.length > 0) {
      const archiveBalance = BigInt(result[0].icp);
      const formattedBal = Number(archiveBalance) / 100000000; // Convert e8s to ICP
      return formattedBal;
    } else {
      return 0;
    }
  } catch (error) {
    if (error instanceof Error) {
      return rejectWithValue(error.message);
    }
    return rejectWithValue(
      "An unknown error occurred while fetching archived balance"
    );
  }
});

export default archived;