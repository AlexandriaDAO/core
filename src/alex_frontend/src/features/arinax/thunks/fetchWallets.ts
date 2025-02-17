import { ActorSubclass } from '@dfinity/agent';
import { _SERVICE } from '../../../../../declarations/user/user.did';
import { createAsyncThunk } from "@reduxjs/toolkit";
import { serializeWallet } from '@/features/wallets/utils';
import { SerializedWallet } from '@/features/wallets/walletsSlice';

// Define the async thunk
const fetchWallets = createAsyncThunk<
    SerializedWallet[], // This is the return type of the thunk's payload
    ActorSubclass<_SERVICE>, //Argument that we pass to initialize
    { rejectValue: string }
>("arinaxSlice/fetchWallets", async (actor, { rejectWithValue }) => {
    try {
        const result = await actor.get_active_wallets([])

        const serializedWallets = await Promise.all(result.map(wallet => serializeWallet(wallet)));

        return serializedWallets;
    } catch (error) {
        console.error("Failed to Fetch Wallets:", error);

        if (error instanceof Error) {
            return rejectWithValue(error.message);
        }
    }
    return rejectWithValue(
        "An unknown error occurred while fetching Wallets"
    );
});


export default fetchWallets;