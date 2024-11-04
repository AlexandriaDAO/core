import { createAsyncThunk } from "@reduxjs/toolkit";
import { RootState } from '@/store';
import { getBooks, Manifest } from '@/services/bookService';
import { Book } from '@/features/portal/portalSlice';
import { getAuthClient, getNftManagerActor } from '@/features/auth/utils/authUtils';
import { natToArweaveId } from '@/utils/id_convert';

// Define the async thunk
const fetchMyBooks = createAsyncThunk<
    Book[], // This is the return type of the thunk's payload
    void, //Argument that we pass to initialize
    { rejectValue: string, state: RootState }
>("engineBooks/fetchEngineBooks", async (_, { rejectWithValue, getState }) => {
    try {
        const actorNftManager = await getNftManagerActor();

        const authClient = await getAuthClient();
        if (!await authClient.isAuthenticated()) {
            throw new Error('You are not logged in.');
        }

        const result = await actorNftManager.get_nfts_of(authClient.getIdentity().getPrincipal());

        if ('Ok' in result) {
            const manifests:Manifest[] = result.Ok.map((token) => ({id: natToArweaveId(token[0]) }) );

            return await getBooks(manifests);
        } else if ('Err' in result) {
            console.log('Error fetching NFTs', result.Err);
            // this will error out and eventually set books to [] array
            throw new Error('Error fetching NFTs');
        }else{
            // won't print errors
            return [];
        }
    } catch (error) {
        console.error("Failed to Fetch My Books:", error);

        if (error instanceof Error) {
            return rejectWithValue(error.message);
        }
    }
    return rejectWithValue(
        "An unknown error occurred while fetching a user's books"
    );
});


export default fetchMyBooks;