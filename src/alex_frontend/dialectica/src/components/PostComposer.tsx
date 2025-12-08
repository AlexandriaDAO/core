import React, { useState, useRef, useCallback } from "react";
import { Image, Film, FileText, X, Loader2, Send, Sparkles } from "lucide-react";
import { Button } from "@/lib/components/button";
import { Card, CardContent } from "@/lib/components/card";
import { useUploadAndMint, ArweaveTag } from "@/features/pinax/hooks/useUploadAndMint";
import { useUploadOnly } from "../hooks/useUploadOnly";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { toast } from "sonner";
import { PostData, APPLICATION_NAME, POST_VERSION } from "../types/post";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/lib/components/tooltip";

interface PostComposerProps {
	onPostCreated?: (arweaveId: string) => void;
	className?: string;
}

type MediaType = "image" | "video" | "document";

const ACCEPTED_TYPES: Record<MediaType, string> = {
	image: ".jpg,.jpeg,.png,.gif,.webp,.svg",
	video: ".mp4,.webm,.mov",
	document: ".pdf",
};

const MAX_CONTENT_LENGTH = 5000;

const PostComposer: React.FC<PostComposerProps> = ({
	onPostCreated,
	className = "",
}) => {
	const [content, setContent] = useState("");
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [mediaPreviewUrl, setMediaPreviewUrl] = useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [uploadingMedia, setUploadingMedia] = useState(false);
	const [isDragOver, setIsDragOver] = useState(false);
	const [isFocused, setIsFocused] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const textareaRef = useRef<HTMLTextAreaElement>(null);

	const { uploadAndMint, isProcessing, progress, uploading, minting, resetUpload } = useUploadAndMint();
	const { upload: uploadMedia, isUploading: isMediaUploading, progress: mediaProgress } = useUploadOnly();
	const { user } = useAppSelector((state) => state.auth);

	const handleFileSelect = (type: MediaType) => {
		if (fileInputRef.current) {
			fileInputRef.current.accept = ACCEPTED_TYPES[type];
			fileInputRef.current.click();
		}
	};

	const processFile = useCallback((file: File) => {
		// Validate file type
		const isImage = file.type.startsWith("image/");
		const isVideo = file.type.startsWith("video/");
		const isPdf = file.type === "application/pdf";

		if (!isImage && !isVideo && !isPdf) {
			toast.error("Unsupported file type. Please use images, videos, or PDFs.");
			return;
		}

		// Validate file size (50MB max)
		if (file.size > 50 * 1024 * 1024) {
			toast.error("File is too large. Maximum size is 50MB.");
			return;
		}

		setSelectedFile(file);
		if (isImage || isVideo) {
			setMediaPreviewUrl(URL.createObjectURL(file));
		} else {
			setMediaPreviewUrl(null);
		}
	}, []);

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			processFile(file);
		}
	};

	const handleDragOver = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		setIsDragOver(true);
	}, []);

	const handleDragLeave = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		setIsDragOver(false);
	}, []);

	const handleDrop = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		setIsDragOver(false);
		const file = e.dataTransfer.files?.[0];
		if (file) {
			processFile(file);
		}
	}, [processFile]);

	const removeMedia = () => {
		setSelectedFile(null);
		if (mediaPreviewUrl) {
			URL.revokeObjectURL(mediaPreviewUrl);
			setMediaPreviewUrl(null);
		}
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	};

	const handleSubmit = async () => {
		if (!user || (!content.trim() && !selectedFile)) return;

		setIsSubmitting(true);
		resetUpload();

		try {
			let mediaArweaveId: string | undefined;
			let mediaType: string | undefined;
			let mediaFilename: string | undefined;

			// Step 1: Upload media first if present (without minting)
			if (selectedFile) {
				setUploadingMedia(true);
				mediaArweaveId = await uploadMedia(selectedFile);
				mediaType = selectedFile.type;
				mediaFilename = selectedFile.name;
				setUploadingMedia(false);
			}

			// Step 2: Create post JSON
			const postData: PostData = {
				content: content.trim(),
				createdAt: Date.now(),
				version: POST_VERSION,
				...(mediaArweaveId && {
					mediaArweaveId,
					mediaType,
					mediaFilename,
				}),
			};

			// Step 3: Create JSON file and upload + mint with tags
			const jsonBlob = new Blob([JSON.stringify(postData)], { type: "application/json" });
			const jsonFile = new File([jsonBlob], "post.json", { type: "application/json" });

			const tags: ArweaveTag[] = [
				{ name: "Application-Name", value: APPLICATION_NAME },
				{ name: "Environment", value: process.env.DFX_NETWORK === "ic" ? "production" : "local" },
			];

			const transactionId = await uploadAndMint(jsonFile, tags);

			// Reset form
			setContent("");
			removeMedia();
			toast.success("Post created successfully!");

			if (transactionId) {
				onPostCreated?.(transactionId);
			}
		} catch (error: any) {
			console.error("Failed to create post:", error);
			toast.error(error.message || "Failed to create post");
		} finally {
			setIsSubmitting(false);
			setUploadingMedia(false);
		}
	};

	const renderMediaPreview = () => {
		if (!selectedFile) return null;

		return (
			<div className="relative rounded-xl overflow-hidden border-2 border-border/50 bg-muted/20">
				{selectedFile.type.startsWith("image/") && mediaPreviewUrl && (
					<div className="relative">
						<img
							src={mediaPreviewUrl}
							alt="Preview"
							className="w-full max-h-80 object-contain bg-black/5"
						/>
						<div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
					</div>
				)}

				{selectedFile.type.startsWith("video/") && mediaPreviewUrl && (
					<video
						src={mediaPreviewUrl}
						controls
						className="w-full max-h-80 bg-black"
						preload="metadata"
					/>
				)}

				{selectedFile.type === "application/pdf" && (
					<div className="flex items-center gap-4 p-5 bg-gradient-to-r from-red-500/5 to-transparent">
						<div className="h-14 w-14 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
							<FileText className="h-7 w-7 text-red-500" />
						</div>
						<div className="flex-1 min-w-0">
							<p className="font-roboto-condensed font-medium truncate text-foreground">{selectedFile.name}</p>
							<p className="text-sm text-muted-foreground font-roboto-condensed mt-0.5">
								PDF Document • {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
							</p>
						</div>
					</div>
				)}

				<button
					type="button"
					className="absolute top-3 right-3 h-8 w-8 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition-colors backdrop-blur-sm"
					onClick={removeMedia}
					disabled={isSubmitting}
				>
					<X className="h-4 w-4" />
				</button>
			</div>
		);
	};

	const isDisabled = isSubmitting || isProcessing || isMediaUploading;
	const canSubmit = (content.trim() || selectedFile) && !isDisabled;
	const contentLength = content.length;
	const isNearLimit = contentLength > MAX_CONTENT_LENGTH * 0.9;
	const isOverLimit = contentLength > MAX_CONTENT_LENGTH;

	const getProgressInfo = () => {
		if (uploadingMedia) return { text: "Uploading media...", progress: mediaProgress, step: 1 };
		if (uploading) return { text: "Uploading post...", progress: progress, step: 2 };
		if (minting) return { text: "Minting on-chain...", progress: 100, step: 3 };
		return { text: "Processing...", progress: 0, step: 0 };
	};

	if (!user) {
		return (
			<Card className={`overflow-hidden ${className}`}>
				<CardContent className="p-8 text-center">
					<div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 mb-4">
						<Sparkles className="h-8 w-8 text-primary" />
					</div>
					<h3 className="font-roboto-condensed font-semibold text-lg mb-2">Join the conversation</h3>
					<p className="text-muted-foreground font-roboto-condensed">Sign in to share your thoughts with the community</p>
				</CardContent>
			</Card>
		);
	}

	const progressInfo = getProgressInfo();

	return (
		<Card
			className={`overflow-hidden transition-all duration-200 ${
				isFocused ? "ring-2 ring-primary/20 shadow-lg" : ""
			} ${isDragOver ? "ring-2 ring-primary border-primary" : ""} ${className}`}
			onDragOver={handleDragOver}
			onDragLeave={handleDragLeave}
			onDrop={handleDrop}
		>
			<CardContent className="p-0">
				{/* Main input area */}
				<div className="p-4 pb-3">
					<textarea
						ref={textareaRef}
						placeholder="What's happening?"
						value={content}
						onChange={(e) => setContent(e.target.value)}
						onFocus={() => setIsFocused(true)}
						onBlur={() => setIsFocused(false)}
						className="w-full min-h-[100px] resize-none bg-transparent text-base font-roboto-condensed placeholder:text-muted-foreground/60 focus:outline-none leading-snug"
						maxLength={MAX_CONTENT_LENGTH + 100}
						disabled={isDisabled}
					/>

					{/* Media Preview */}
					{selectedFile && (
						<div className="mt-3">
							{renderMediaPreview()}
						</div>
					)}

					{/* Drag overlay hint */}
					{isDragOver && !selectedFile && (
						<div className="mt-3 p-8 border-2 border-dashed border-primary rounded-xl bg-primary/5 text-center">
							<p className="text-primary font-roboto-condensed font-medium">Drop your file here</p>
							<p className="text-sm text-muted-foreground font-roboto-condensed mt-1">Images, videos, or PDFs</p>
						</div>
					)}
				</div>

				{/* Progress indicator */}
				{isDisabled && (
					<div className="px-4 pb-3">
						<div className="p-4 rounded-xl bg-muted/50 space-y-3">
							{/* Step indicators */}
							<div className="flex items-center gap-2">
								{[1, 2, 3].map((step) => (
									<div
										key={step}
										className={`h-2 flex-1 rounded-full transition-colors ${
											step < progressInfo.step
												? "bg-green-500"
												: step === progressInfo.step
												? "bg-primary"
												: "bg-muted-foreground/20"
										}`}
									/>
								))}
							</div>

							<div className="flex items-center gap-3">
								<Loader2 className="h-5 w-5 animate-spin text-primary" />
								<div className="flex-1">
									<p className="text-sm font-roboto-condensed font-medium">{progressInfo.text}</p>
									{(uploadingMedia || uploading) && (
										<div className="mt-2 w-full bg-muted rounded-full h-1.5 overflow-hidden">
											<div
												className="bg-primary h-full rounded-full transition-all duration-300"
												style={{ width: `${progressInfo.progress}%` }}
											/>
										</div>
									)}
								</div>
							</div>
						</div>
					</div>
				)}

				{/* Actions bar */}
				<div className="px-4 py-3 border-t bg-muted/30">
					<div className="flex items-center justify-between">
						{/* Media buttons */}
						<div className="flex items-center gap-1">
							<TooltipProvider>
								<Tooltip>
									<TooltipTrigger asChild>
										<Button
											variant="ghost"
											scale="sm"
											className={`h-9 w-9 p-0 rounded-full transition-colors ${
												selectedFile ? "opacity-50" : "hover:bg-green-500/10 hover:text-green-600"
											}`}
											onClick={() => handleFileSelect("image")}
											disabled={isDisabled || !!selectedFile}
										>
											<Image className="h-5 w-5" />
										</Button>
									</TooltipTrigger>
									<TooltipContent side="bottom">
										<p>Add image</p>
									</TooltipContent>
								</Tooltip>
							</TooltipProvider>

							<TooltipProvider>
								<Tooltip>
									<TooltipTrigger asChild>
										<Button
											variant="ghost"
											scale="sm"
											className={`h-9 w-9 p-0 rounded-full transition-colors ${
												selectedFile ? "opacity-50" : "hover:bg-blue-500/10 hover:text-blue-600"
											}`}
											onClick={() => handleFileSelect("video")}
											disabled={isDisabled || !!selectedFile}
										>
											<Film className="h-5 w-5" />
										</Button>
									</TooltipTrigger>
									<TooltipContent side="bottom">
										<p>Add video</p>
									</TooltipContent>
								</Tooltip>
							</TooltipProvider>

							<TooltipProvider>
								<Tooltip>
									<TooltipTrigger asChild>
										<Button
											variant="ghost"
											scale="sm"
											className={`h-9 w-9 p-0 rounded-full transition-colors ${
												selectedFile ? "opacity-50" : "hover:bg-red-500/10 hover:text-red-600"
											}`}
											onClick={() => handleFileSelect("document")}
											disabled={isDisabled || !!selectedFile}
										>
											<FileText className="h-5 w-5" />
										</Button>
									</TooltipTrigger>
									<TooltipContent side="bottom">
										<p>Add PDF</p>
									</TooltipContent>
								</Tooltip>
							</TooltipProvider>
						</div>

						{/* Character count & Submit */}
						<div className="flex items-center gap-3">
							{contentLength > 0 && (
								<span className={`text-xs font-roboto-condensed ${
									isOverLimit
										? "text-red-500 font-medium"
										: isNearLimit
										? "text-yellow-500"
										: "text-muted-foreground"
								}`}>
									{contentLength}/{MAX_CONTENT_LENGTH}
								</span>
							)}

							<Button
								onClick={handleSubmit}
								disabled={!canSubmit || isOverLimit}
								className="rounded-full px-5 gap-2 font-roboto-condensed font-semibold"
							>
								{isDisabled ? (
									<Loader2 className="h-4 w-4 animate-spin" />
								) : (
									<Send className="h-4 w-4" />
								)}
								Post
							</Button>
						</div>
					</div>
				</div>

				{/* Hidden file input */}
				<input
					ref={fileInputRef}
					type="file"
					onChange={handleFileChange}
					className="hidden"
					disabled={isDisabled}
				/>
			</CardContent>
		</Card>
	);
};

export default PostComposer;
