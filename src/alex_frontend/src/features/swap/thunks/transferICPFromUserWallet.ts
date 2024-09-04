import { ActorSubclass } from "@dfinity/agent";
import { _SERVICE as _SERVICESWAP } from "../../../../../declarations/icp_swap/icp_swap.did";

import { createAsyncThunk } from "@reduxjs/toolkit";
import LedgerService from "@/utils/LedgerService";


// Define the async thunk
const transferICPFromUserWalletcanister = createAsyncThunk<
  string, // This is the return type of the thunk's payload
  {
    actorSwap: ActorSubclass<_SERVICESWAP>;
    destination:string;
    amount:string
  },
  { rejectValue: string }
>("icp_swap/transferICPFromUserWalletcanister", async ( {actorSwap,destination,amount} , { rejectWithValue }) => {
  try {
    
    let amountFormatted8s: bigint = BigInt(Math.floor(Number(amount) * 10 ** 8));
    let fee= BigInt(10000);
    amountFormatted8s=amountFormatted8s-fee;
    const result = await actorSwap.transfer_from_user_wallet(amountFormatted8s,destination);
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

export default transferICPFromUserWalletcanister;

