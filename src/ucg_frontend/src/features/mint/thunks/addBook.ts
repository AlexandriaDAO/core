import { ActorSubclass } from "@dfinity/agent";
import {
	Book,
	_SERVICE,
} from "../../../../../declarations/ucg_backend/ucg_backend.did";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { NewBook } from "../mintSlice";
import { getSigningWebIrys } from "@/features/my-nodes/utils/irys";

// Define the async thunk
const addBook = createAsyncThunk<
	{
		id: string,
		asset_id: string
	}, // This is the return type of the thunk's payload
	{
		actor: ActorSubclass<_SERVICE>;
		book: NewBook;
		file: File
	}, //Argument that we pass to initialize
	{ rejectValue: string }
>(
	"mint/addBook",
	async (
		{
			actor,
			book: { engine_id, asset_node_id  },
			file
		},
		{ rejectWithValue }
	) => {
		try {
            const irys = await getSigningWebIrys(asset_node_id);
            // const irys = await getSigningWebIrys(asset_node_id);
            if(!irys) throw new Error('Unable to get Irys')

			const tx = await irys.uploadFile(file)

			const result = await actor.add_book(engine_id, tx.id, asset_node_id);

            if('Ok' in result) {
				let newBook = result.Ok;

				let asset_id = Array.isArray(newBook.asset_id) && newBook.asset_id.length>0 && typeof newBook.asset_id === 'string' ?  newBook.asset_id[0]:''

				return {id: newBook.id, asset_id}
			};

            if('Err' in result) throw new Error(result.Err)
		} catch (error) {
			console.error("Failed to Add Book:", error);

			if (error instanceof Error) {
				return rejectWithValue(error.message);
			}
		}
		return rejectWithValue(
			"An unknown error occurred while adding Book"
		);
	}
);

export default addBook;
