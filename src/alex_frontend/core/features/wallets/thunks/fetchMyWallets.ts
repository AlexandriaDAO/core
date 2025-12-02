import { ActorSubclass } from '@dfinity/agent';
import { _SERVICE } from '../../../../../declarations/alex_wallet/alex_wallet.did';
import { createAsyncThunk } from "@reduxjs/toolkit";
import { serializeWallet } from '@/features/wallets/utils';
import { SerializedWallet } from '@/features/wallets/walletsSlice';

// Define the async thunk
const fetchMyWallets = createAsyncThunk<
    SerializedWallet[], // This is the return type of the thunk's payload
    ActorSubclass<_SERVICE>, //Argument that we pass to initialize
    { rejectValue: string }
>("wallets/fetchMyWallets", async (actor, { rejectWithValue }) => {
    try {
        const result = await actor.get_my_wallets();
        const serializedWallets = await Promise.all(result.map(wallet => serializeWallet(wallet)));
        return serializedWallets;
    } catch (error) {
        console.error("Failed to Fetch My Wallets:", error);

        if (error instanceof Error) {
            return rejectWithValue(error.message);
        }
    }
    return rejectWithValue(
        "An unknown error occurred while fetching My Wallets"
    );
});


export default fetchMyWallets;