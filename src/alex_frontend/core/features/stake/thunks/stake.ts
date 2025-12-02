import { ActorSubclass } from "@dfinity/agent";
import { _SERVICE as _SERVICESWAP } from "../../../../../declarations/icp_swap/icp_swap.did";
import { _SERVICE as _SERVICEALEX } from "../../../../../declarations/ALEX/ALEX.did";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { Principal } from "@dfinity/principal";

const stake = createAsyncThunk<
  void,
  { actorSwap: ActorSubclass<_SERVICESWAP>, actorAlex: ActorSubclass<_SERVICEALEX>, amount: string; userPrincipal: string },
  { rejectValue: string }
>(
  "stake/stake",
  async ({ actorSwap, actorAlex, amount, userPrincipal }, { rejectWithValue }) => {
    try {
      const icp_swap_canister_id = process.env.CANISTER_ID_ICP_SWAP!;
      
      // Convert amount to e8s (multiply by 10^8)
      const amountE8s: bigint = BigInt(
        Number(Number(amount) * 1e8).toFixed(0)
      );

      // Check current allowance
      const checkApproval = await actorAlex.icrc2_allowance({
        account: {
          owner: Principal.fromText(userPrincipal),
          subaccount: [],
        },
        spender: {
          owner: Principal.fromText(icp_swap_canister_id),
          subaccount: [],
        },
      });

      // Approve if allowance is insufficient
      if (checkApproval.allowance < amountE8s) {
        const approvalResult = await actorAlex.icrc2_approve({
          spender: {
            owner: Principal.fromText(icp_swap_canister_id),
            subaccount: [],
          },
          amount: amountE8s,
          fee: [],
          memo: [],
          from_subaccount: [],
          created_at_time: [],
          expected_allowance: [],
          expires_at: [],
        });

        if ("Err" in approvalResult) {
          const error = approvalResult.Err;
          if ("InsufficientFunds" in error) throw new Error("Insufficient ALEX balance for approval");
          if ("TemporarilyUnavailable" in error) throw new Error("ALEX service is temporarily unavailable");
          throw new Error("Failed to approve ALEX tokens");
        }
      }

      // Execute stake transaction
      const stakeResult = await actorSwap.stake_ALEX(amountE8s, []);

      if ("Ok" in stakeResult) return

      if ("Err" in stakeResult) {
        const error = stakeResult.Err;
        if ("InsufficientFunds" in error) {
          throw new Error("Insufficient funds for staking");
        }
        if ("InvalidAmount" in error) {
          throw new Error("Invalid stake amount");
        }
        throw new Error("Staking transaction failed");
      }
      throw new Error("Unexpected response from stake transaction");
    } catch (error) {
      console.error("Error during staking:", error);

      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("An unknown error occurred while staking");
    }
  }
);

export default stake;