import { _SERVICE } from '../../../../../declarations/user/user.did';
import { createAsyncThunk } from "@reduxjs/toolkit";
import { SerializedWallet } from '@/features/wallets/walletsSlice';
import { arweaveClient } from "@/utils/arweaveClient";
import { RootState } from '@/store';

// Define the async thunk
const selectWallet = createAsyncThunk<
    SerializedWallet, // This is the return type of the thunk's payload
    void, //Argument that we pass to initialize
    { rejectValue: string, state: RootState }
>("upload/selectWallet", async (_, { rejectWithValue, getState }) => {
    try {
        const cost = getState().upload.cost;
        const wallets = getState().upload.wallets;

        if (!cost) return rejectWithValue("Uploading cost is not available.");

        if (wallets.length === 0) return rejectWithValue("No wallets available.");

        const wallet = wallets.find(wallet => arweaveClient.ar.isGreaterThan(wallet.balance, cost));

        if(!wallet) return rejectWithValue("No suitable wallet found");

        return wallet;
    } catch (error) {
        console.error("Failed to select suitable wallet:", error);

        if (error instanceof Error) return rejectWithValue(error.message);
    }

    return rejectWithValue("An unknown error occurred while selecting a suitable wallet");
});


export default selectWallet;