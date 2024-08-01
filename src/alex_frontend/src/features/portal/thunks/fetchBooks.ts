import { ActorSubclass } from '@dfinity/agent';
import { _SERVICE } from '../../../../../declarations/alex_backend/alex_backend.did';
import { createAsyncThunk } from "@reduxjs/toolkit";
import { getMultipleIrysBooks } from '@/utils/irys';
import { Book } from '@/components/BookModal';


// Define the async thunk
const fetchBooks = createAsyncThunk<
    Book[], // This is the return type of the thunk's payload
    ActorSubclass<_SERVICE>, //Argument that we pass to initialize
    { rejectValue: string }
>("portal/fetchBooks", async (actor, { rejectWithValue }) => {
    try {

        const results = await actor.get_nfts();

        if ('Err' in results) {
            console.log('Error fetching NFTs', results.Err);
            throw new Error('Error fetching NFTs');
        }

        const ids = results.Ok.map(nft=>nft.description);

        const formattedBooks = await getMultipleIrysBooks(ids);

        return formattedBooks;
    } catch (error) {
        console.error("Failed to Fetch Books:", error);

        if (error instanceof Error) {
            return rejectWithValue(error.message);
        }
    }
    return rejectWithValue(
        "An unknown error occurred while fetching All Books"
    );
});


export default fetchBooks;