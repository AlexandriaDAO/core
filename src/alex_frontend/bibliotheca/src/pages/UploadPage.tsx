import React, { useState, useRef } from "react";
import { Button } from "@/lib/components/button";
import { Upload, Mic, X, LoaderPinwheel } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import {
	setUploadPreview,
	clearUploadPreview,
} from "@/features/bibliotheca/bibliothecaSlice";
import { Book } from "@/features/bibliotheca/types";
import { BookCard } from "@/features/bibliotheca/components/BookCard";
import { BookModal } from "@/features/bibliotheca/components/BookModal";
import { useUploadAndMint } from "@/features/pinax/hooks/useUploadAndMint";
import { AudioBook } from "@/features/bibliotheca/components/AudioBook";

const BibliothecaUploadPage: React.FC = () => {
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [bookUrl, setBookUrl] = useState<string>("");
	const [isDragging, setIsDragging] = useState(false);
	const [modalBookUrl, setModalBookUrl] = useState<string>("");
	const [isModalOpen, setIsModalOpen] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const dispatch = useAppDispatch();
	const { uploadPreview } = useAppSelector((state) => state.bibliotheca);
	const {
		uploadAndMint,
		isProcessing,
		error,
		success,
		progress,
		estimating,
		uploading,
		minting,
		resetUpload,
	} = useUploadAndMint();

	const handleFileSelect = (file: File) => {
		// Validate EPUB file only
		if (
			!file.type.includes("epub") &&
			!file.name.toLowerCase().endsWith(".epub")
		) {
			alert("Please select an EPUB file (.epub)");
			return;
		}

		setSelectedFile(file);
		// Create object URL for preview
		const url = URL.createObjectURL(file);
		setBookUrl(url);

		// Create Book object for Redux
		const bookData: Book = {
			id: url, // Use object URL as ID for local files
			type: file.type,
			size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
			timestamp: new Date().toISOString(),
		};

		// Set book in global state for preview
		dispatch(setUploadPreview(bookData));
	};

	const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) handleFileSelect(file);
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

	const handleRemoveFile = () => {
		if (bookUrl) {
			URL.revokeObjectURL(bookUrl);
		}
		setSelectedFile(null);
		setBookUrl("");
		if (fileInputRef.current) fileInputRef.current.value = "";
		// Clear book from global state
		dispatch(clearUploadPreview());
		// Reset upload state
		resetUpload();
	};

	const handleUpload = async () => {
		if (selectedFile) {
			try {
				const transactionId = await uploadAndMint(selectedFile);
				// Replace blob URL with Arweave transaction URL
				if (bookUrl) {
					URL.revokeObjectURL(bookUrl);
				}
				const arweaveUrl = `https://arweave.net/${transactionId}`;
				setBookUrl(arweaveUrl);

				// Update the book data with Arweave URL
				const bookData: Book = {
					id: transactionId, // Use transaction ID as the ID
					type: selectedFile.type,
					size: `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB`,
					timestamp: new Date().toISOString(),
				};
				dispatch(setUploadPreview(bookData));
			} catch (error) {
				// Error handling is done in the hook, keep file for retry
			}
		}
	};

	// Modal handlers
	const handleBookClick = () => {
		setModalBookUrl(bookUrl);
		setIsModalOpen(true);
	};

	const handleCloseModal = () => {
		setIsModalOpen(false);
		setModalBookUrl("");
	};

	return (
		<div className="flex-grow flex flex-col justify-center">
			<div className="max-w-4xl mx-auto space-y-8">
				<div className="text-center space-y-4">
					<p className="text-lg text-muted-foreground">
						Share your book content with the world
					</p>
				</div>

				{/* File Upload Area */}
				<div>
					<div
						className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
							isDragging
								? "border-primary bg-primary/5"
								: "border-muted-foreground/25 hover:border-primary/50"
						}`}
						onDragOver={handleDragOver}
						onDragLeave={handleDragLeave}
						onDrop={handleDrop}
					>
						<input
							ref={fileInputRef}
							type="file"
							accept=".epub"
							onChange={handleFileInput}
							className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
						/>

						<div className="space-y-4">
							<Upload className="w-12 h-12 text-muted-foreground mx-auto" />
							<div className="space-y-2">
								<p className="text-lg font-medium">
									{selectedFile
										? selectedFile.name
										: "Drop your book file here"}
								</p>
								<p className="text-sm text-muted-foreground">
									or click to browse • EPUB files only
								</p>
							</div>
						</div>
					</div>
				</div>

				{/* Book Preview */}
				{selectedFile && uploadPreview && (
					<div className="space-y-4">
						<div className="flex items-center justify-between">
							<h3 className="text-lg font-medium">
								{bookUrl.startsWith("blob:")
									? "Preview"
									: "Uploaded to Arweave"}
							</h3>
							<Button
								variant="ghost"
								scale="sm"
								onClick={handleRemoveFile}
								className="text-muted-foreground hover:text-foreground"
							>
								<X size={16} />
								{bookUrl.startsWith("blob:")
									? "Remove"
									: "Clear"}
							</Button>
						</div>
						<BookCard
							item={uploadPreview}
							onClick={handleBookClick}
							actions={<AudioBook url={bookUrl} />}
						/>
					</div>
				)}

				{/* Error and Success Messages */}
				{error && (
					<div className="text-center p-4 bg-destructive/10 border border-destructive rounded-lg">
						<p className="text-destructive font-medium">{error}</p>
					</div>
				)}

				{success && (
					<div className="text-center p-4 bg-green-500/10 border border-green-500 rounded-lg">
						<p className="text-green-600 font-medium">{success}</p>
					</div>
				)}

				{/* Upload Button */}
				{selectedFile && bookUrl.startsWith("blob:") && (
					<div className="flex justify-center">
						<Button
							onClick={handleUpload}
							className="gap-2"
							disabled={isProcessing}
						>
							{isProcessing ? (
								<>
									<LoaderPinwheel
										size={16}
										className="animate-spin"
									/>
									{estimating
										? "Estimating..."
										: uploading
											? `Uploading ${Math.round(progress)}%`
											: minting
												? "Minting..."
												: "Processing..."}
								</>
							) : (
								<>
									<Upload size={16} />
									Upload & Mint NFT
								</>
							)}
						</Button>
					</div>
				)}
			</div>

			{/* Book Modal */}
			<BookModal
				url={modalBookUrl}
				isOpen={isModalOpen}
				onClose={handleCloseModal}
			/>
		</div>
	);
};

export default BibliothecaUploadPage;
