import React, { lazy, Suspense, useState, useRef } from "react";
import {
	Dialog,
	DialogTrigger,
	DialogHeader,
	DialogTitle,
	DialogDescription,
} from "@/lib/components/dialog";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { Upload, XIcon, LoaderPinwheel } from "lucide-react";
import { Button } from "@/lib/components/button";
import { Alert } from "@/components/Alert";
import Processing from "@/components/Processing";
import { getFileTypeInfo } from "./constants";
import { formatFileSize } from "./utils";
import estimateCost from "./thunks/estimateCost";
import processPayment from "./thunks/processPayment";
import uploadFile from "./thunks/uploadFile";
import mint from "../nft/thunks/mint";
import fetchWallets from "./thunks/fetchWallets";
import selectWallet from "./thunks/selectWallet";
import { reset } from "./pinaxSlice";
import useAlexWallet from "@/hooks/actors/useAlexWallet";
import useNftManager from "@/hooks/actors/useNftManager";

// DialogContent will be loaded when it can be loaded, not blocking the ui
const DialogContent = lazy(() =>
	import("@/lib/components/dialog").then((module) => ({
		default: module.DialogContent,
	}))
);

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

const Pinax: React.FC = () => {
	const dispatch = useAppDispatch();
	const { uploading, minting, estimating, progress } = useAppSelector(
		(state) => state.pinax
	);
	const { actor: walletActor } = useAlexWallet();
	const { actor: nftActor } = useNftManager();

	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState<string | null>(null);
	const [isDragging, setIsDragging] = useState(false);
	const [loading, setLoading] = useState(false);
	const [open, setOpen] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const handleCreate = async (file: File) => {
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
			setSelectedFile(null);
			if (fileInputRef.current) fileInputRef.current.value = '';
		} catch (err: any) {
			setError(err.message || err || "An unknown error occurred");
		} finally {
			setLoading(false);
		}
	};

	const handleFileSelect = (file: File) => {
		setSelectedFile(file);
		setError(null);
		setSuccess(null);
		handleCreate(file);
	};

	const handleDragOver = (e: React.DragEvent) => {
		e.preventDefault();
		setIsDragging(true);
	};

	const handleDragLeave = (e: React.DragEvent) => {
		e.preventDefault();
		setIsDragging(false);
	};

	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault();
		setIsDragging(false);
		const file = e.dataTransfer.files[0];
		if (file) handleFileSelect(file);
	};

	const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) handleFileSelect(file);
	};

	const isProcessing = uploading || minting || estimating;

	const resetState = () => {
		setSelectedFile(null);
		setError(null);
		setSuccess(null);
		setLoading(false);
		if (fileInputRef.current) fileInputRef.current.value = '';
		dispatch(reset());
	};

	const handleOpenChange = (newOpen: boolean) => {
		// Prevent closing if currently processing
		if (!newOpen && loading) {
			return;
		}
		setOpen(newOpen);
		if (!newOpen) {
			resetState();
		}
	};

	return (
		<Suspense fallback={<Processing message="Opening..." />}>
			<Dialog open={open} onOpenChange={handleOpenChange}>
				<DialogTrigger>
					<div className="flex-shrink h-auto flex justify-between gap-1 px-3 py-1.5 sm:px-4 sm:py-2 items-center bg-gradient-to-r from-gray-800 to-gray-700 border border-gray-600 text-white hover:text-white hover:border-white hover:from-gray-600 hover:to-gray-500 rounded-full cursor-pointer transition-all duration-300 font-medium">
						<span className="text-sm sm:text-base font-normal font-roboto-condensed tracking-wider">
							Create
						</span>
					</div>
				</DialogTrigger>
				<DialogContent
					onOpenAutoFocus={(e) => e.preventDefault()}
					className="block max-w-3xl w-full max-h-full place-content-center font-roboto-condensed px-4 py-4 animate-in animate-out"
					closeIcon={
						<XIcon
							size={30}
							className="text-primary dark:text-muted-foreground"
						/>
					}
				>
					<DialogHeader className="sr-only">
						<DialogTitle>Upload File</DialogTitle>
						<DialogDescription className="sr-only">
							Upload your file to the decentralized web with secure storage and NFT minting
						</DialogDescription>
					</DialogHeader>

					<div className="p-10">
						{error && (
							<Alert
								variant="danger"
								title="Error"
								className="text-left"
							>
								{error}
							</Alert>
						)}

						{success && (
							<Alert
								variant="success"
								title="Success"
								className="text-left"
							>
								{success}
							</Alert>
						)}

						<div className="relative space-y-6">
							{loading && (
								<div className="absolute inset-0 bg-black z-10 flex items-center justify-center rounded-lg">
									<div className="text-center space-y-3">
										<LoaderPinwheel className="w-8 h-8 text-white animate-spin mx-auto" />
										<p className="text-sm font-medium text-white">
											{estimating
												? "Calculating cost..."
												: uploading
													? `Uploading... ${Math.round(progress)}%`
													: minting
														? "Minting NFT..."
														: "Processing..."}
										</p>
										{uploading && (
											<div className="w-32 bg-gray-200 rounded-full h-2 mx-auto">
												<div
													className="bg-blue-600 h-2 rounded-full transition-all duration-300"
													style={{
														width: `${progress}%`,
													}}
												/>
											</div>
										)}
									</div>
								</div>
							)}

							<div
								className={`w-full min-h-[400px] border-2 border-dashed rounded-lg place-content-center text-center transition-colors ${
									isDragging
										? "border-blue-400 bg-blue-50 dark:bg-blue-900/20"
										: "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
								}`}
								onDragOver={handleDragOver}
								onDragLeave={handleDragLeave}
								onDrop={handleDrop}
							>
								<Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
								<div className="space-y-2">
									<p className="text-lg font-medium">
										Drop your file here
									</p>
									<p className="text-sm text-gray-500">
										or click to browse
									</p>
									<input
										ref={fileInputRef}
										type="file"
										onChange={handleFileInput}
										className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
										accept=".jpg,.jpeg,.png,.gif,.webp,.svg,.pdf,.txt,.md,.html,.json,.mp4,.webm,.mp3,.wav,.ogg,.epub"
									/>
								</div>
								<Button className="mt-4" variant="outline">
									Choose File
								</Button>
							</div>
						</div>

					</div>
				</DialogContent>
			</Dialog>
		</Suspense>
	);
};

export default Pinax;
