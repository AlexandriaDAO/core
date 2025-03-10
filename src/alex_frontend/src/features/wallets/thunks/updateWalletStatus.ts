import { createAsyncThunk } from "@reduxjs/toolkit";
import { _SERVICE } from "../../../../../../src/declarations/alex_wallet/alex_wallet.did";
import { ActorSubclass } from "@dfinity/agent";
import { serializeWallet } from "../utils";
import { SerializedWallet } from "../walletsSlice";

// Define the async thunk
const updateWalletStatus = createAsyncThunk<
    SerializedWallet, // This is the return type of the thunk's payload
    {
        actor: ActorSubclass<_SERVICE>,
        id: string,
        active: boolean,
    },
    { rejectValue: string }
>("wallets/updateWalletStatus", async ({actor, id, active}, { rejectWithValue }) => {
    try {
        const result = await actor.update_wallet_status({id: BigInt(id), active});

        if('Ok' in result) return serializeWallet(result.Ok);

        if('Err' in result) throw new Error(result.Err)
    } catch (error) {
        console.error("Failed to retrieve or authenticate client:", error);

        if (error instanceof Error) {
            return rejectWithValue(error.message);
        }
    }
    return rejectWithValue(
        "An unknown error occurred while initializing Authentication"
    );
});


export default updateWalletStatus;
