import { ActorSubclass } from '@dfinity/agent';
import { _SERVICE } from '../../../../../declarations/nft_manager/nft_manager.did';
import { createAsyncThunk } from "@reduxjs/toolkit";
import { AppDispatch, RootState } from '@/store';
import { toast } from 'sonner';
import { Principal } from '@dfinity/principal';

// Define the async thunk
const mintNFT = createAsyncThunk<
    string, // This is the return type of the thunk's payload
    {
        actor: ActorSubclass<_SERVICE>
    }, //Argument that we pass to initialize
    { rejectValue: string , dispatch: AppDispatch, state: RootState }
>("upload/mintNFT", async ({actor}, { rejectWithValue, dispatch, getState }) => {
    try {

        const {auth: { user }, upload: {transaction}} = getState();

        if(!user) throw new Error("User not found");

        if(!transaction) throw new Error("Transaction not available");

        toast.info("Minting NFT via ICRC7 Protocol");

        const result = await actor.coordinate_mint(transaction, [Principal.fromText(user.principal)]);

        if ("Err" in result) throw new Error(result.Err);

        toast.success("Minted Successfully");

        return result.Ok[0];
    } catch (error) {
        toast.error("Failed to Mint NFT");
        console.error("Failed to Mint NFT:", error);

        if (error instanceof Error) {
            return rejectWithValue(error.message);
        }
    }
    return rejectWithValue(
        "An unknown error occurred while minting NFT"
    );
});


export default mintNFT;
