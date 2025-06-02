import { ActorSubclass } from '@dfinity/agent';
import { _SERVICE } from '../../../../../declarations/nft_manager/nft_manager.did';
import { createAsyncThunk } from "@reduxjs/toolkit";
import { AppDispatch, RootState } from '@/store';
import { toast } from 'sonner';
import { Principal } from '@dfinity/principal';

// Define the async thunk
const mintNFT = createAsyncThunk<
    string, // Expecting string ID as return
    {
        actor: ActorSubclass<_SERVICE>
    },
    { rejectValue: string , dispatch: AppDispatch, state: RootState }
>("pinax/mintNFT", async ({actor}, { rejectWithValue, dispatch, getState }) => {
    try {
        const {auth: { user }, pinax: {transaction}} = getState();

        if (!user) throw new Error("User not found");
        if (!transaction) throw new Error("Transaction not available");

        toast.info("Minting NFT via ICRC7 Protocol");

        // Assuming transaction is the arweaveId string here
        const result = await actor.coordinate_mint(transaction, [Principal.fromText(user.principal)]);

        // Type guard for error
        if ("Err" in result) {
            // Handle specific errors if needed, e.g., already owned/minted
             if (result.Err.includes("already own")) {
                toast.info("You already own this NFT.");
             } else if (result.Err.includes("already minted")) {
                 toast.info("You have already liked this item.");
             } else {
                toast.error(`Minting failed: ${result.Err}`);
             }
             throw new Error(result.Err); // Propagate error to be caught below
        }

        // If Ok, result.Ok is the bigint (Nat)
        toast.success("Minted Successfully");

        // Convert the bigint Nat ID to a string before returning
        return result.Ok.toString();

    } catch (error) {
        // Avoid double-toasting if specific error handled above
        if (!(error instanceof Error && error.message.includes("already own")) && !(error instanceof Error && error.message.includes("already minted"))) {
             toast.error("Failed to Mint NFT");
        }
        console.error("Failed to Mint NFT:", error);

        if (error instanceof Error) {
            return rejectWithValue(error.message);
        }
    }
    // Generic fallback rejection
    return rejectWithValue(
        "An unknown error occurred while minting NFT"
    );
});


export default mintNFT;
