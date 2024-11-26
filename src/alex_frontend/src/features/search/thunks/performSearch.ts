import { ActorSubclass } from '@dfinity/agent';
import { Engine, _SERVICE } from '../../../../../declarations/user/user.did';
import { createAsyncThunk } from "@reduxjs/toolkit";
import MeiliSearch, { Index } from 'meilisearch';
import { RootState } from '@/store';

// Define the async thunk
const performSearch = createAsyncThunk<
    any[], // This is the return type of the thunk's payload
    {indices:Index[]}, //Argument that we pass to initialize
    { rejectValue: string, state: RootState }
>("search/performSearch", async ({indices}, { rejectWithValue, getState }) => {
    try {

        const {search: {searchText, limit}, filter: {types, subTypes}} = getState();

        const filter = [];
        if(types.length > 0){
            filter.push('type IN ['+ types.join(',')+']')
        }
        if(subTypes.length>0){
            filter.push('subtype IN ['+ subTypes.join() + ']')
        }

        const config:any = {
            attributesToHighlight: ['text', 'title'],
            highlightPreTag: '<span style="background:yellow;">',
            highlightPostTag: '</span>',

            limit,
        }

        if(filter.length>0 ){
            config.filter = filter;
        }

        // if(index){
        //     const results = await index.search(searchText, config)

        //     return results.hits;
        // }

        const searchResults = await Promise.all(
            indices.map(async (index: Index) => await index.search(searchText, config) )
        );

        // Flatten the results
        const allHits = searchResults.flatMap((result: { hits: any; }) => result.hits);

        return allHits;
    } catch (error) {
        console.error("Unable to perform search:", error);

        if (error instanceof Error) {
            return rejectWithValue(error.message);
        }
    }
    return rejectWithValue(
        "An unknown error occurred while performing search"
    );
});


export default performSearch;