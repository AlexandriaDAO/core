import { createAsyncThunk } from "@reduxjs/toolkit";
import { SerializedWallet } from '@/features/wallets/walletsSlice';
import arweaveClient, { isHtmlResponse } from "@/utils/arweaveClient";

// Define the async thunk
const fetchBalance = createAsyncThunk<
    string, // This is the return type of the thunk's payload
    SerializedWallet, //Argument that we pass to initialize
    { rejectValue: string }
>("wallets/fetchBalance", async (wallet, { rejectWithValue }) => {
    try {
        let balance;
        try {
            balance = await arweaveClient.wallets.getBalance(wallet.address);
            
            // Check if it looks like HTML
            if (isHtmlResponse(balance)) {
                console.error("Received HTML instead of balance!");
                return rejectWithValue("Received HTML instead of balance");
            }
            
            return balance;
        } catch (error) {
            console.error("Balance fetch error details:", error);
            throw error;
        }
    } catch (error) {
        console.error("Failed to Fetch Balance:", error);

        if (error instanceof Error) {
            return rejectWithValue(error.message);
        }
        
        return rejectWithValue(
            "An unknown error occurred while fetching balance"
        );
    }
});


export default fetchBalance;