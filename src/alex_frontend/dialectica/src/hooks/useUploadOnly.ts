import { useState } from "react";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import useAlexWallet from "@/hooks/actors/useAlexWallet";
import useNftManager from "@/hooks/actors/useNftManager";
import estimateCost from "@/features/pinax/thunks/estimateCost";
import fetchWallets from "@/features/pinax/thunks/fetchWallets";
import selectWallet from "@/features/pinax/thunks/selectWallet";
import processPayment from "@/features/pinax/thunks/processPayment";
import uploadFile from "@/features/pinax/thunks/uploadFile";
import { reset } from "@/features/pinax/pinaxSlice";

/**
 * Hook for uploading files to Arweave WITHOUT minting.
 * Used for uploading media files that will be referenced in a post.
 */
export const useUploadOnly = () => {
	const dispatch = useAppDispatch();
	const { uploading, estimating, progress } = useAppSelector((state) => state.pinax);
	const { actor: walletActor } = useAlexWallet();
	const { actor: nftActor } = useNftManager();

	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);

	const upload = async (file: File): Promise<string> => {
		setError(null);
		setLoading(true);

		try {
			// Step 1: Estimate cost
			await dispatch(estimateCost({ file })).unwrap();

			// Step 2: Fetch wallets
			if (!walletActor) throw new Error("No wallet connection available");
			await dispatch(fetchWallets(walletActor)).unwrap();

			// Step 3: Select suitable wallet
			await dispatch(selectWallet()).unwrap();

			// Step 4: Process payment
			if (!nftActor) throw new Error("No NFT manager connection available");
			await dispatch(processPayment({ fileSizeBytes: file.size, actor: nftActor })).unwrap();

			// Step 5: Upload file (NO minting, NO app tag for media)
			const transactionId = await dispatch(
				uploadFile({ file, actor: walletActor })
			).unwrap();

			return transactionId;
		} catch (err: any) {
			const errorMessage = err.message || err || "An unknown error occurred";
			setError(errorMessage);
			throw new Error(errorMessage);
		} finally {
			setLoading(false);
		}
	};

	const resetUploadState = () => {
		setError(null);
		setLoading(false);
		dispatch(reset());
	};

	const isUploading = uploading || estimating || loading;

	return {
		upload,
		resetUploadState,
		isUploading,
		progress,
		error,
	};
};
