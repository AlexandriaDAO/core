import { ActorSubclass } from "@dfinity/agent";
import { _SERVICE } from "../../../../../declarations/alex_wallet/alex_wallet.did";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { AppDispatch, RootState } from "@/store";
import { setProgress } from "../uploadSlice";
import { readFileAsBuffer } from "../utils";
import { arweaveClient } from "@/utils/arweaveClient";

const uploadFile = createAsyncThunk<
	string, // This is the return type of the thunk's payload
	{
		file: File;
		actor: ActorSubclass<_SERVICE>;
	}, //Argument that we pass to initialize
	{ rejectValue: string; dispatch: AppDispatch; state: RootState }
>(
	"upload/uploadFile",
	async (
		{ file, actor },
		{ rejectWithValue, dispatch, getState }
	) => {
		try {
			const user = getState().auth.user;
			const wallet = getState().upload.wallet;

			if(!wallet) return rejectWithValue("No wallet available");

			const buffer = await readFileAsBuffer(file);

			let transaction = await arweaveClient.createTransaction({ data: buffer });

			transaction.setOwner(wallet.public.n);

			transaction.addTag("Content-Type", file.type);
            transaction.addTag("Application-Id", process.env.REACT_MAINNET_APP_ID!);
            transaction.addTag("User-Principal", user?.principal || '2vxsx-fae');
            transaction.addTag("Version", "1.0");

			const dataToSign = await transaction.getSignatureData();

			const result = await actor.sign(dataToSign, BigInt(wallet.id));

			if("Ok" in result){
				const {id, owner, signature} = result.Ok;
				transaction.setSignature({
					id: id,
					owner: owner,
					signature: signature,
				});

				const valid = await arweaveClient.transactions.verify(transaction);

				if(!valid){
					return rejectWithValue("Failed to verify transaction");
				}

				let uploader = await arweaveClient.transactions.getUploader(transaction);

				while (!uploader.isComplete) {
					await uploader.uploadChunk();
					const progress = uploader.pctComplete;
					dispatch(setProgress(progress));
				}

				if (uploader.isComplete) {
					return transaction.id;
				}
			}


			return rejectWithValue("Failed to upload file");

		} catch (error) {
			console.error("Failed to Upload File:", error);

			if (error instanceof Error) {
				return rejectWithValue(error.message);
			}
		}
		return rejectWithValue(
			"An unknown error occurred while uploading file"
		);
	}
);


export default uploadFile;
