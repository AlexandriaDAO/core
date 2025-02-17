import { ActorSubclass } from "@dfinity/agent";
import { _SERVICE } from "../../../../../declarations/user/user.did";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { AppDispatch, RootState } from "@/store";
import { setProgress } from "../arinaxSlice";
import { readFileAsBuffer } from "@/features/irys/utils/gaslessFundAndUpload";
import { SerializedWallet } from "@/features/wallets/walletsSlice";
import Arweave from "arweave";

const uploadFile = createAsyncThunk<
	string, // This is the return type of the thunk's payload
	{
		file: File;
		wallet: SerializedWallet;
		actor: ActorSubclass<_SERVICE>;
	}, //Argument that we pass to initialize
	{ rejectValue: string; dispatch: AppDispatch; state: RootState }
>(
	"arinaxSlice/uploadFile",
	async (
		{ file, wallet, actor },
		{ rejectWithValue, dispatch, getState }
	) => {
		try {
			const { auth: { user } } = getState();

			const buffer = await readFileAsBuffer(file);

			const arweave = Arweave.init({});

			let transaction = await arweave.createTransaction({ data: buffer });

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

				const valid = await arweave.transactions.verify(transaction);

				if(!valid){
					return rejectWithValue("Failed to verify transaction");
				}

				let uploader = await arweave.transactions.getUploader(transaction);

				while (!uploader.isComplete) {
					await uploader.uploadChunk();
					const progress = uploader.pctComplete;
					dispatch(setProgress(progress));
					console.log(
						`${progress}% complete, ${uploader.uploadedChunks}/${uploader.totalChunks}`
					);
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
