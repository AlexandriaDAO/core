import { ActorSubclass } from '@dfinity/agent';
import { _SERVICE } from '../../../../../declarations/alex_wallet/alex_wallet.did';
import { createAsyncThunk } from "@reduxjs/toolkit";
import { serializeWallet } from '@/features/wallets/utils';
import { RootState } from '@/store';
import arweaveClient from '@/utils/arweaveClient';

// Define the async thunk
const checkEligibility = createAsyncThunk<
    boolean, // This is the return type of the thunk's payload
    ActorSubclass<_SERVICE>, //Argument that we pass to initialize
    { rejectValue: string, state: RootState }
>("upload/checkEligibility", async (actor, { rejectWithValue, getState }) => {
    try {

        // fetch all active wallets
        const result = await actor.get_active_wallets([])

        const serializedWallets = await Promise.all(result.map(wallet => serializeWallet(wallet)));

        if(serializedWallets.length === 0) return rejectWithValue("No wallets available");

        // check if any wallet has enough balance

        const cost = getState().upload.cost;

        if (!cost) return rejectWithValue("Uploading cost is not available.");

        const wallet = serializedWallets.find(wallet => arweaveClient.ar.isGreaterThan(wallet.balance, cost));

        if(!wallet) return rejectWithValue("No suitable wallet found");

        return true;
    } catch (error) {
        console.error("Failed to Check Eligibility:", error);

        if (error instanceof Error) {
            return rejectWithValue(error.message);
        }
    }
    return rejectWithValue(
        "An unknown error occurred while checking eligibility"
    );
});


export default checkEligibility;