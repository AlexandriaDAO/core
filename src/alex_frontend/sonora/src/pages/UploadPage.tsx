import React, { useState, useRef } from "react";
import { Button } from "@/lib/components/button";
import { Upload, Mic, X, LoaderPinwheel } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { setSelected, clearSelected } from "@/features/sonora/sonoraSlice";
import { Audio } from "@/features/sonora/types";
import { AudioCard } from "@/features/sonora/components/AudioCard";
import { useUploadAndMint } from "@/features/pinax/hooks/useUploadAndMint";

const SonoraUploadPage: React.FC = () => {
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [audioUrl, setAudioUrl] = useState<string>("");
	const [isDragging, setIsDragging] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const dispatch = useAppDispatch();
	const { selected } = useAppSelector((state) => state.sonora);
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
		// Validate audio file
		if (!file.type.startsWith("audio/")) {
			alert("Please select an audio file");
			return;
		}

		setSelectedFile(file);
		// Create object URL for preview
		const url = URL.createObjectURL(file);
		setAudioUrl(url);

		// Create Audio object for Redux
		const audioData: Audio = {
			id: url, // Use object URL as ID for local files
			type: file.type,
			size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
			timestamp: new Date().toISOString(),
		};

		// Set audio in global state for player
		dispatch(setSelected(audioData));
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
		if (audioUrl) {
			URL.revokeObjectURL(audioUrl);
		}
		setSelectedFile(null);
		setAudioUrl("");
		if (fileInputRef.current) fileInputRef.current.value = "";
		// Clear audio from global state
		dispatch(clearSelected());
		// Reset upload state
		resetUpload();
	};

	const handleUpload = async () => {
		if (selectedFile) {
			try {
				const transactionId = await uploadAndMint(selectedFile);
				// Replace blob URL with Arweave transaction URL
				if (audioUrl) {
					URL.revokeObjectURL(audioUrl);
				}
				const arweaveUrl = `https://arweave.net/${transactionId}`;
				setAudioUrl(arweaveUrl);

				// Update the audio data with Arweave URL
				const audioData: Audio = {
					id: transactionId, // Use transaction ID as the ID
					type: selectedFile.type,
					size: `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB`,
					timestamp: new Date().toISOString(),
				};
				dispatch(setSelected(audioData));
			} catch (error) {
				// Error handling is done in the hook, keep file for retry
			}
		}
	};

	return (
		<div className="flex-grow flex flex-col justify-center">
			<div className="max-w-4xl mx-auto space-y-8">
				<div className="text-center space-y-4">
					<p className="text-lg text-muted-foreground">
						Share your audio content with the world
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
							accept="audio/*"
							onChange={handleFileInput}
							className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
						/>

						<div className="space-y-4">
							<Upload className="w-12 h-12 text-muted-foreground mx-auto" />
							<div className="space-y-2">
								<p className="text-lg font-medium">
									{selectedFile
										? selectedFile.name
										: "Drop your audio file here"}
								</p>
								<p className="text-sm text-muted-foreground">
									or click to browse • Supports MP3, WAV, OGG
								</p>
							</div>
						</div>
					</div>

					{/* Record option below upload box */}
					<div className="text-center mt-1">
						<p className="text-sm text-muted-foreground">
							<Link to="/record">
								<Button
									variant="muted"
									scale="sm"
									className="gap-1 py-0 px-1 my-0"
								>
									or
									<Mic size={16} className="p-0" />
									Record a new audio
								</Button>
							</Link>
						</p>
					</div>
				</div>

				{/* Audio Preview */}
				{selectedFile && selected && (
					<div className="space-y-4">
						<div className="flex items-center justify-between">
							<h3 className="text-lg font-medium">
								{audioUrl.startsWith("blob:")
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
								{audioUrl.startsWith("blob:")
									? "Remove"
									: "Clear"}
							</Button>
						</div>
						<AudioCard item={selected} />
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
				{selectedFile && audioUrl.startsWith("blob:") && (
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
		</div>
	);
};

export default SonoraUploadPage;
