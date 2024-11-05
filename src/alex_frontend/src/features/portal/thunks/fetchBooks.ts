// import { ActorSubclass } from '@dfinity/agent';
// import { _SERVICE } from '../../../../../declarations/alex_backend/alex_backend.did';
// import { createAsyncThunk } from "@reduxjs/toolkit";
// import { Book } from '../portalSlice';
// import { getBooks } from '@/utils/irys';



// // Define the async thunk
// const fetchBooks = createAsyncThunk<
//     Book[], // This is the return type of the thunk's payload
//     ActorSubclass<_SERVICE>, //Argument that we pass to initialize
//     { rejectValue: string }
// >("portal/fetchBooks", async (actor, { rejectWithValue }) => {
//     try {
//         const result = await actor.get_nfts();

//         if ('Err' in result) {
//             console.log('Error fetching NFTs', result.Err);
//             throw new Error('Error fetching NFTs');
//         }

//         if('Ok' in result){
//             return await getBooks(result.Ok)
//         }

//         return [];

//         // const ids = results.Ok.map(nft=>nft.description);

//         // const formattedBooks = await getMultipleIrysBooks(ids);

//         // return formattedBooks;
//     } catch (error) {
//         console.error("Failed to Fetch Books:", error);

//         if (error instanceof Error) {
//             return rejectWithValue(error.message);
//         }
//     }
//     return rejectWithValue(
//         "An unknown error occurred while fetching All Books"
//     );
// });


// export default fetchBooks;



import { ActorSubclass } from '@dfinity/agent';
import { _SERVICE as _SERVICENFTMANAGER } from '../../../../../declarations/nft_manager/nft_manager.did';
import { createAsyncThunk } from "@reduxjs/toolkit";
import { Book } from '../portalSlice';
import { fetchManifests, getBooks } from '@/services/bookService';
import { getNftManagerActor } from '@/features/auth/utils/authUtils';
import { RootState } from '@/store';


// Define the async thunk
const fetchBooks = createAsyncThunk<
    {
        books: Book[],
        cursor: string,
        load: boolean,
    }, // This is the return type of the thunk's payload
    void, //Argument that we pass to initialize
    { rejectValue: string, state: RootState }
>("portal/fetchBooks", async (_, { rejectWithValue, getState }) => {
    try {
        const {portal: {cursor, books, limit}} = getState();

        const txs = await fetchManifests(cursor, limit);

        const newBooks = await getBooks(txs);

        const newCursor = txs.length > 0 ? (txs[txs.length-1].cursor || '') : '';

        return {
            books: [...books, ...newBooks],
            cursor: newCursor,
            load: txs.length < limit ? false: true
        }

        // const actorNftManager = await getNftManagerActor();
        // const result = await actorNftManager.get_nfts([], []);

        // // if ('Err' in result) {
        // //     console.log('Error fetching NFTs', result.Err);
        // //     throw new Error('Error fetching NFTs');
        // // }

        // // if('Ok' in result){
        // //     return await getBooks(result.Ok)
        // // }

        // return [];

        // // const ids = results.Ok.map(nft=>nft.description);

        // // const formattedBooks = await getMultipleIrysBooks(ids);

        // // return formattedBooks;
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



