import { createAsyncThunk } from "@reduxjs/toolkit";
import { AppDispatch, RootState } from '@/store';
import { toast } from "sonner";
import { Principal } from "@dfinity/principal";

// Return type for the thunk
interface BalanceCheckResult {
    hasEnoughBalance: boolean;
    currentBalance: number;
    requiredAmount: number;
}

const checkLbryBalance = createAsyncThunk<
    BalanceCheckResult,
    {
        actor: any; // This should be the NFT manager actor
    },
    { rejectValue: string, dispatch: AppDispatch, state: RootState }
>("upload/checkLbryBalance", async ({ actor }, { rejectWithValue, getState }) => {
    try {
        const user = getState().auth.user;
        if (!user?.principal) {
            throw new Error('User principal not found');
        }
        
        const requiredAmount = getState().upload.lbryFee || 0;
        
        // Convert user principal to a Principal type if needed
        const userPrincipal = Principal.fromText(user.principal);
        
        // Call the canister to get the user's LBRY balance
        const balanceResult = await actor.get_lbry_balance(userPrincipal);
        
        // Check if there was an error getting the balance
        if ('Err' in balanceResult) {
            throw new Error(balanceResult.Err);
        }
        
        // Parse the balance (assuming it returns a BigInt or similar)
        const currentBalance = Number(balanceResult.Ok) / 100_000_000; // Convert from E8S to LBRY tokens
        
        const hasEnoughBalance = currentBalance >= requiredAmount;
        
        // If balance is insufficient, show a warning
        if (!hasEnoughBalance) {
            toast.warning(`Insufficient LBRY balance. Need ${requiredAmount} LBRY but only have ${currentBalance.toFixed(2)} LBRY.`);
        }
        
        return {
            hasEnoughBalance,
            currentBalance,
            requiredAmount
        };
        
    } catch (error) {
        console.error("Failed to check LBRY balance:", error);
        
        if (error instanceof Error) {
            return rejectWithValue(error.message);
        }
        return rejectWithValue("An unknown error occurred while checking balance");
    }
});

export default checkLbryBalance; 