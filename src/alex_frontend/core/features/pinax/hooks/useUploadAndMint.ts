import { useState } from 'react';
import { useAppDispatch } from '@/store/hooks/useAppDispatch';
import { useAppSelector } from '@/store/hooks/useAppSelector';
import useAlexWallet from '@/hooks/actors/useAlexWallet';
import useNftManager from '@/hooks/actors/useNftManager';
import { getFileTypeInfo } from '../constants';
import { formatFileSize } from '../utils';
import estimateCost from '../thunks/estimateCost';
import fetchWallets from '../thunks/fetchWallets';
import selectWallet from '../thunks/selectWallet';
import processPayment from '../thunks/processPayment';
import uploadFile from '../thunks/uploadFile';
import mint from '../../nft/thunks/mint';
import { reset } from '../pinaxSlice';

const validateFileType = (file: File) => {
	const typeInfo = getFileTypeInfo(file.type);
	if (!typeInfo) {
		throw new Error(`File type ${file.type} is not supported.`);
	}
};

const validateFileSize = (file: File) => {
	const typeInfo = getFileTypeInfo(file.type);
	if (!typeInfo) throw new Error("Invalid file type");

	if (file.size > typeInfo.maxSize) {
		throw new Error(
			`File size ${formatFileSize(file.size)} exceeds ${formatFileSize(typeInfo.maxSize)} limit for ${typeInfo.label.toLowerCase()}.`
		);
	}
};

export const useUploadAndMint = () => {
	const dispatch = useAppDispatch();
	const { uploading, minting, estimating, progress, cost, lbryFee } = useAppSelector(
		(state) => state.pinax
	);
	const { actor: walletActor } = useAlexWallet();
	const { actor: nftActor } = useNftManager();

	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);

	const uploadAndMint = async (file: File) => {
		setError(null);
		setSuccess(null);
		setLoading(true);

		try {
			// Step 1: Validate file type
			validateFileType(file);

			// Step 2: Validate file size
			validateFileSize(file);

			// Step 3: Estimate cost
			await dispatch(estimateCost({ file })).unwrap();

			// Step 4: Fetch wallets
			if (!walletActor) throw new Error("No wallet connection available");
			await dispatch(fetchWallets(walletActor)).unwrap();

			// Step 5: Select suitable wallet
			await dispatch(selectWallet()).unwrap();

			// Step 6: Process payment
			if (!nftActor)
				throw new Error("No NFT manager connection available");
			await dispatch(
				processPayment({ fileSizeBytes: file.size, actor: nftActor })
			).unwrap();

			// Step 7: Upload file
			const transaction = await dispatch(
				uploadFile({ file, actor: walletActor })
			).unwrap();

			// Step 8: Mint NFT
			await dispatch(mint({ transaction, actor: nftActor })).unwrap();

			setSuccess(
				`File uploaded successfully! Transaction ID: ${transaction}`
			);
			
			return transaction;
		} catch (err: any) {
			setError(err.message || err || "An unknown error occurred");
			throw err;
		} finally {
			setLoading(false);
		}
	};

	const resetUpload = () => {
		setError(null);
		setSuccess(null);
		setLoading(false);
		dispatch(reset());
	};

	const isProcessing = uploading || minting || estimating || loading;

	return {
		uploadAndMint,
		resetUpload,
		isProcessing,
		uploading,
		minting,
		estimating,
		progress,
		cost,
		lbryFee,
		error,
		success,
		loading
	};
};