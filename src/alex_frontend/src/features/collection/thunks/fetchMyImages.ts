import { createAsyncThunk } from "@reduxjs/toolkit";
import { fetchAssets, getAssets } from '@/services/assetService';
import { RootState } from "@/store";
import { AssetType } from "@/features/upload/uploadSlice";
import { Image } from "@/features/asset/types";
import { ActorSubclass } from "@dfinity/agent";
import { _SERVICE } from "../../../../../../src/declarations/nft_manager/nft_manager.did";
import { Principal } from "@dfinity/principal";
import { natToArweaveId } from "@/utils/id_convert";

// Define the async thunk
const fetchMyImages = createAsyncThunk<
    {
        images: Image[],
        cursor: string,
    }, // This is the return type of the thunk's payload
    {actor: ActorSubclass<_SERVICE>}, //Argument that we pass to initialize
    { rejectValue: string, state: RootState }
>("collection/fetchMyImages", async ({actor}, { rejectWithValue, getState }) => {
    try {

        const {collection: {cursor, images }, auth: {user}} = getState();

        if(!user || !user.principal) return { images, cursor }

        const result = await actor.get_nfts_of(Principal.fromText(user.principal));

        if ('Ok' in result) {
            const ids = result.Ok.map((token) => natToArweaveId(token[0]));

            const txs = await fetchAssets({after: cursor, owner: user.principal, type: AssetType.Image, ids});

            const newImages = await getAssets<Image>(txs);

            const newCursor = txs[txs.length-1]?.cursor ?? '';

            return {
                images: [...images, ...newImages],
                cursor: newCursor
            }

        } else if ('Err' in result) {
            console.log('Error fetching NFTs', result.Err);
            // this will error out and eventually set books to [] array
            throw new Error('Error fetching NFTs');
        }

        return { images, cursor }

    } catch (error) {
        console.error("Failed to Fetch My Minted Images:", error);

        if (error instanceof Error) {
            return rejectWithValue(error.message);
        }
    }
    return rejectWithValue(
        "An unknown error occurred while fetching My Minted Images"
    );
});


export default fetchMyImages;