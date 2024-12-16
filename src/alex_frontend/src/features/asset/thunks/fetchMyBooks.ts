import { createAsyncThunk } from "@reduxjs/toolkit";
import { fetchAssets, getAssets } from '@/services/assetService';
import { RootState } from "@/store";
import { AssetType } from "@/features/upload/uploadSlice";
import { Book } from "../types";
// Define the async thunk
const fetchMyBooks = createAsyncThunk<
    {
        books: Book[],
        cursor: string,
    }, // This is the return type of the thunk's payload
    void, //Argument that we pass to initialize
    { rejectValue: string, state: RootState }
>("asset/fetchMyBooks", async (_, { rejectWithValue, getState }) => {
    try {
        const {asset: {cursor, books }, auth: {user}} = getState();

        if(!user || !user.principal) return { books, cursor }

        const txs = await fetchAssets({after: cursor, owner: user.principal, type: AssetType.Book});

        const newBooks = await getAssets<Book>(txs);

        const newCursor = txs[txs.length-1]?.cursor ?? '';

        return {
            books: [...books, ...newBooks],
            cursor: newCursor
        }
    } catch (error) {
        console.error("Failed to Fetch My Books:", error);

        if (error instanceof Error) {
            return rejectWithValue(error.message);
        }
    }
    return rejectWithValue(
        "An unknown error occurred while fetching My Books"
    );
});


export default fetchMyBooks;