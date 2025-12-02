import React, { useState, useRef } from "react";
import { Upload, X, Image, Type, Film, Music } from "lucide-react";
import { Button } from "@/lib/components/button";
import { Textarea } from "@/lib/components/textarea";
import { Card, CardContent } from "@/lib/components/card";
import { useUploadAndMint } from "@/features/pinax/hooks/useUploadAndMint";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { toast } from "sonner";

interface PostComposerProps {
	onPostCreated?: () => void;
	className?: string;
}

const PostComposer: React.FC<PostComposerProps> = ({
	onPostCreated,
	className = "",
}) => {
	const [postType, setPostType] = useState<'text' | 'media'>('text');
	const [textContent, setTextContent] = useState('');
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [isDragging, setIsDragging] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);
	
	const { uploadAndMint, isProcessing, progress, uploading, minting, resetUpload } = useUploadAndMint();
	const { user } = useAppSelector((state) => state.auth);

	const handleTextPost = async () => {
		if (!textContent.trim() || !user) return;

		try {
			// Create a text file blob
			const textBlob = new Blob([textContent], { type: 'text/plain' });
			const textFile = new File([textBlob], 'post.txt', { type: 'text/plain' });
			
			await uploadAndMint(textFile);
			
			// Reset form
			setTextContent('');
			toast.success('Post created successfully!');
			onPostCreated?.();
		} catch (error) {
			console.error('Failed to create text post:', error);
			toast.error('Failed to create post');
		}
	};

	const handleMediaPost = async (file: File) => {
		if (!user) return;

		try {
			await uploadAndMint(file);
			
			// Reset form
			setSelectedFile(null);
			if (fileInputRef.current) fileInputRef.current.value = '';
			toast.success('Post created successfully!');
			onPostCreated?.();
		} catch (error) {
			console.error('Failed to create media post:', error);
			toast.error('Failed to create post');
		}
	};

	const handleFileSelect = (file: File) => {
		setSelectedFile(file);
		resetUpload();
		handleMediaPost(file);
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

	const getFilePreview = (file: File) => {
		if (file.type.startsWith('image/')) {
			return (
				<div className="relative">
					<img
						src={URL.createObjectURL(file)}
						alt="Preview"
						className="w-full max-h-48 object-cover rounded-lg"
					/>
					<Button
						variant="destructive"
						scale="sm"
						className="absolute top-2 right-2"
						onClick={() => {
							setSelectedFile(null);
							if (fileInputRef.current) fileInputRef.current.value = '';
						}}
					>
						<X className="h-4 w-4" />
					</Button>
				</div>
			);
		}

		return (
			<div className="flex items-center gap-3 p-3 border rounded-lg bg-muted">
				<div className="p-2 rounded-lg bg-background">
					{file.type.startsWith('video/') ? (
						<Film className="h-6 w-6" />
					) : file.type.startsWith('audio/') ? (
						<Music className="h-6 w-6" />
					) : (
						<Upload className="h-6 w-6" />
					)}
				</div>
				<div className="flex-1">
					<p className="text-sm font-medium">{file.name}</p>
					<p className="text-xs text-muted-foreground">
						{file.type} • {(file.size / 1024 / 1024).toFixed(2)} MB
					</p>
				</div>
				<Button
					variant="outline"
					scale="sm"
					onClick={() => {
						setSelectedFile(null);
						if (fileInputRef.current) fileInputRef.current.value = '';
					}}
				>
					<X className="h-4 w-4" />
				</Button>
			</div>
		);
	};

	if (!user) {
		return (
			<Card className={className}>
				<CardContent className="p-6 text-center">
					<p className="text-muted-foreground">
						Please sign in to create posts
					</p>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card className={className}>
			<CardContent className="p-6 space-y-4">
				{/* Post Type Toggle */}
				<div className="flex gap-2">
					<Button
						variant={postType === 'text' ? 'primary' : 'outline'}
						scale="sm"
						onClick={() => setPostType('text')}
						disabled={isProcessing}
					>
						<Type className="h-4 w-4 mr-2" />
						Text
					</Button>
					<Button
						variant={postType === 'media' ? 'primary' : 'outline'}
						scale="sm"
						onClick={() => setPostType('media')}
						disabled={isProcessing}
					>
						<Image className="h-4 w-4 mr-2" />
						Media
					</Button>
				</div>

				{/* Text Post Interface */}
				{postType === 'text' && (
					<div className="space-y-3">
						<Textarea
							placeholder="What's on your mind?"
							value={textContent}
							onChange={(e) => setTextContent(e.target.value)}
							className="min-h-[120px] resize-none"
							maxLength={2000}
							disabled={isProcessing}
						/>
						<div className="flex justify-between items-center">
							<span className="text-xs text-muted-foreground">
								{textContent.length}/2000 characters
							</span>
							<Button
								onClick={handleTextPost}
								disabled={!textContent.trim() || isProcessing}
								scale="sm"
							>
								{isProcessing ? (
									uploading ? `Uploading... ${Math.round(progress)}%` :
									minting ? 'Creating...' : 'Processing...'
								) : 'Post'}
							</Button>
						</div>
					</div>
				)}

				{/* Media Post Interface */}
				{postType === 'media' && (
					<div className="space-y-3">
						{selectedFile ? (
							<div className="space-y-3">
								{getFilePreview(selectedFile)}
								{isProcessing && (
									<div className="text-center space-y-2">
										<p className="text-sm text-muted-foreground">
											{uploading ? `Uploading... ${Math.round(progress)}%` :
											 minting ? 'Creating post...' : 'Processing...'}
										</p>
										{uploading && (
											<div className="w-full bg-muted rounded-full h-2">
												<div
													className="bg-primary h-2 rounded-full transition-all duration-300"
													style={{ width: `${progress}%` }}
												/>
											</div>
										)}
									</div>
								)}
							</div>
						) : (
							<div
								className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
									isDragging
										? 'border-primary bg-primary/5'
										: 'border-muted-foreground/25 hover:border-muted-foreground/50'
								} ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
								onDragOver={handleDragOver}
								onDragLeave={handleDragLeave}
								onDrop={handleDrop}
								onClick={() => !isProcessing && fileInputRef.current?.click()}
							>
								<Upload className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
								<p className="text-sm font-medium mb-1">
									Drop your media here or click to browse
								</p>
								<p className="text-xs text-muted-foreground">
									Images, videos, audio files supported
								</p>
								<input
									ref={fileInputRef}
									type="file"
									onChange={handleFileInput}
									className="hidden"
									accept=".jpg,.jpeg,.png,.gif,.webp,.svg,.mp4,.webm,.mp3,.wav,.ogg"
									disabled={isProcessing}
								/>
							</div>
						)}
					</div>
				)}
			</CardContent>
		</Card>
	);
};

export default PostComposer;