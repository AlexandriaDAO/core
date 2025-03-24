import { createAsyncThunk } from "@reduxjs/toolkit";
import { SerializedWallet } from '@/features/wallets/walletsSlice';
import { arweaveClient } from "@/utils/arweaveClient";

// Define the async thunk
const fetchBalance = createAsyncThunk<
    string, // This is the return type of the thunk's payload
    SerializedWallet, //Argument that we pass to initialize
    { rejectValue: string }
>("upload/fetchBalance", async (wallet, { rejectWithValue }) => {
    try {
        const balance = await arweaveClient.wallets.getBalance(wallet.address)

        return balance;
    } catch (error) {
        console.error("Failed to Fetch Balance:", error);

        if (error instanceof Error) {
            return rejectWithValue(error.message);
        }
    }
    return rejectWithValue(
        "An unknown error occurred while fetching balance"
    );
});


export default fetchBalance;