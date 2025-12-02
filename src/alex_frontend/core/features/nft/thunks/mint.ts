import { ActorSubclass } from '@dfinity/agent';
import { _SERVICE } from '../../../../../declarations/nft_manager/nft_manager.did';
import { createAsyncThunk } from "@reduxjs/toolkit";
import { AppDispatch, RootState } from '@/store';
import { toast } from 'sonner';
import { Principal } from '@dfinity/principal';

const mint = createAsyncThunk<
    string,
    {
        actor: ActorSubclass<_SERVICE>
        transaction: string
        owner?: string // Optional owner principal for scion-from-scion minting
    },
    { rejectValue: string , dispatch: AppDispatch, state: RootState }
>("nft/mint", async ({actor, transaction, owner}, { rejectWithValue, dispatch, getState }) => {
    try {
        const {auth: { user }} = getState();

        if (!user) throw new Error("User not found");
        if (!transaction) throw new Error("Transaction not available");

        toast.info("Minting NFT via ICRC7 Protocol");

        // Use owner parameter if provided, otherwise use empty array for standard minting
        const ownerArg: [] | [Principal] = owner ? [Principal.fromText(owner)] : [];
        const result = await actor.coordinate_mint(transaction, ownerArg);

        if ("Err" in result) {
             if (result.Err.includes("already own")) {
                toast.info("You already own this NFT.");
             } else if (result.Err.includes("already minted")) {
                 toast.info("You have already liked this item.");
             } else {
                toast.error(`Minting failed: ${result.Err}`);
             }
             throw new Error(result.Err);
        }

        toast.success("Minted Successfully");

        return result.Ok.toString();

    } catch (error) {
        if (!(error instanceof Error && error.message.includes("already own")) && !(error instanceof Error && error.message.includes("already minted"))) {
             toast.error("Failed to Mint NFT");
        }
        console.error("Failed to Mint NFT:", error);

        if (error instanceof Error) {
            return rejectWithValue(error.message);
        }
    }
    return rejectWithValue(
        "An unknown error occurred while minting NFT"
    );
});

export default mint;