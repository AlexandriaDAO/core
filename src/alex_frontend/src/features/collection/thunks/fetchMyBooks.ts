import { createAsyncThunk } from "@reduxjs/toolkit";
import { fetchAssets, getAssets } from '@/services/assetService';
import { RootState } from "@/store";
import { AssetType } from "@/features/upload/uploadSlice";
import { Book } from "@/features/asset/types";
import { ActorSubclass } from "@dfinity/agent";
import { _SERVICE } from "../../../../../../src/declarations/nft_manager/nft_manager.did";

// Define the async thunk
const fetchMyBooks = createAsyncThunk<
    {
        books: Book[],
        cursor: string,
    }, // This is the return type of the thunk's payload
    {actor: ActorSubclass<_SERVICE>}, //Argument that we pass to initialize
    { rejectValue: string, state: RootState }
>("collection/fetchMyBooks", async ({actor}, { rejectWithValue, getState }) => {
    try {

        const {collection: {collection, cursor, books }, auth: {user}} = getState();

        if(!user || !user.principal) return { books, cursor }

        if (collection.length > 0) {

            const txs = await fetchAssets({after: cursor, owner: user.principal, type: AssetType.Book, ids: collection});

            const newBooks = await getAssets<Book>(txs);

            const newCursor = txs[txs.length-1]?.cursor ?? '';

            return {
                books: [...books, ...newBooks],
                cursor: newCursor
            }

        }

        return { books, cursor }

    } catch (error) {
        console.error("Failed to Fetch My Minted Books:", error);

        if (error instanceof Error) {
            return rejectWithValue(error.message);
        }
    }
    return rejectWithValue(
        "An unknown error occurred while fetching My Minted Books"
    );
});


export default fetchMyBooks;