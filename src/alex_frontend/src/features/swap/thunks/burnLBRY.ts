import { createAsyncThunk } from "@reduxjs/toolkit";
import { Principal } from "@dfinity/principal";
import LedgerService from "@/utils/LedgerService";
import { getActorSwap, getLbryActor } from "@/features/auth/utils/authUtils";


// Define the async thunk
const burnLbry = createAsyncThunk<
  string, // This is the return type of the thunk's payload
  Number,
  { rejectValue: string }
>("icp_swap/burnLBRY", async (amount , { rejectWithValue }) => {
  try {
    const actorLbry = await getLbryActor();
    const icp_swap_canister_id = process.env.CANISTER_ID_ICP_SWAP!;
    const ledgerServices=LedgerService();
    let amountFormat: bigint = BigInt(Number(amount));
    let amountFormate8s :bigint= BigInt(Number(amount) * 10 ** 8);

    const resultLbryApprove =await actorLbry.icrc2_approve({
      spender: {
        owner: Principal.fromText(icp_swap_canister_id),
        subaccount: []
      },
      amount: amountFormate8s,
      fee: [],
      memo: [],
      from_subaccount: [],
      created_at_time: [],
      expected_allowance: [],
      expires_at: []
    });
    const actorSwap = await getActorSwap();
    const result = await actorSwap.burn_LBRY(amountFormat);
    if('Ok' in result) return "success";
    if('Err' in result) throw new Error(result.Err)
  } catch (error) {
    console.error( error);
    if (error instanceof Error) {
      return rejectWithValue(error.message);
    }
  }
  return rejectWithValue("An unknown error occurred while burning LBRY");
});

export default burnLbry;







