import React, { useEffect } from "react";
import { Button } from "@/lib/components/button";
import { Database, Globe, ArrowDown, FileAudio, Coins, AlertCircle, Loader2 } from "lucide-react";
import { AudioCard } from "@/features/sonora/components/AudioCard";
import { MintButton } from "@/features/sonora/components/MintButton";
import { useArweaveAudios } from "@/features/sonora/hooks/useArweaveAudios";
import { fetchAudios } from "@/features/sonora/browse/thunks/fetchAudios";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { ArweaveAudio, Audio } from "@/features/sonora/types";

const SonoraPage: React.FC = () => {
	const dispatch = useAppDispatch();
	const { audios, loading, error, hasNext, loadMore, isEmpty } = useArweaveAudios();

	// Convert ArweaveAudio to Audio format for AudioCard
	const convertToAudio = (arweaveAudio: ArweaveAudio): Audio => {
		// Try to get content type from data.type or Content-Type tag
		let contentType = arweaveAudio.data?.type;
		if (!contentType) {
			const contentTypeTag = arweaveAudio.tags?.find(tag => tag.name === "Content-Type");
			contentType = contentTypeTag?.value || '';
		}
		
		return {
			id: arweaveAudio.id,
			type: contentType,
			size: arweaveAudio.data?.size || null,
			timestamp: new Date(arweaveAudio.block.timestamp * 1000).toISOString()
		};
	};

	// Fetch initial data on mount
	useEffect(() => {
		if (audios.length === 0 && !loading && !error) {
			dispatch(fetchAudios({ reset: true }));
		}
	}, [dispatch, audios.length, loading, error]);

	const formatFileSize = (sizeString: string | null) => {
		if (!sizeString) return 'Unknown size';
		const size = parseInt(sizeString);
		if (isNaN(size)) return 'Unknown size';
		if (size < 1024 * 1024) {
			return `${(size / 1024).toFixed(1)} KB`;
		}
		return `${(size / (1024 * 1024)).toFixed(1)} MB`;
	};

	return (
		<div className="grid grid-cols-5 min-h-full">
			{/* Left Sidebar */}
			<div className="col-span-1 flex flex-col gap-4 items-center sticky top-0 h-fit">
				<div className="w-full bg-card rounded-lg border p-5">
					<div className="space-y-4">
						<div className="flex items-center gap-2">
							<Database size={20} className="text-primary" />
							<h3 className="font-semibold">From Arweave</h3>
						</div>
						<p className="text-sm text-muted-foreground">
							Audio files from the permanent web, ready to discover and mint.
						</p>
						<div className="space-y-2 text-xs text-muted-foreground">
							<div className="flex items-center gap-2">
								<Globe size={12} />
								<span>Permanent storage</span>
							</div>
							<div className="flex items-center gap-2">
								<FileAudio size={12} />
								<span>Always accessible</span>
							</div>
							<div className="flex items-center gap-2">
								<Coins size={12} />
								<span>Ready to mint</span>
							</div>
						</div>
					</div>
				</div>

				<div className="w-full bg-card rounded-lg border p-5">
					<div className="space-y-4">
						<div className="flex items-center gap-2">
							<Coins size={20} className="text-primary" />
							<h3 className="font-semibold">Create NFTs</h3>
						</div>
						<p className="text-sm text-muted-foreground">
							Transform any audio into a tradeable NFT on Alexandria.
						</p>
						<div className="space-y-2">
							<div className="text-xs text-muted-foreground">
								<p className="font-medium text-foreground mb-1">Quick steps:</p>
								<ul className="space-y-1">
									<li>• Click mint icon on any audio</li>
									<li>• Confirm the transaction</li>
									<li>• Own the NFT permanently</li>
								</ul>
							</div>
						</div>
						<div className="pt-2 border-t">
							<p className="text-xs text-muted-foreground">
								{loading && audios.length === 0 ? (
									"Loading files..."
								) : (
									<>
										<span className="font-medium">{audios.length}</span> files available
									</>
								)}
							</p>
						</div>
					</div>
				</div>

				{/* Load More */}
				{hasNext && (
					<Button 
						variant="outline" 
						className="gap-2"
						onClick={loadMore}
						disabled={loading}
					>
						{loading ? (
							<Loader2 size={16} className="animate-spin" />
						) : (
							<ArrowDown size={16} />
						)}
						{loading ? "Loading..." : "Load More"}
					</Button>
				)}
			</div>

			{/* Audio Grid */}
			<div className="col-span-4 space-y-4 overflow-y-auto px-6">
				{error && (
					<div className="flex items-center gap-2 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
						<AlertCircle size={16} className="text-destructive" />
						<span className="text-destructive text-sm">{error}</span>
					</div>
				)}

				{loading && audios.length === 0 && (
					<div className="flex items-center justify-center py-8">
						<Loader2 size={24} className="animate-spin text-muted-foreground" />
						<span className="ml-2 text-muted-foreground">Loading audio files from Arweave...</span>
					</div>
				)}

				{isEmpty && !loading && (
					<div className="flex flex-col items-center justify-center py-8 text-center">
						<FileAudio size={48} className="text-muted-foreground mb-4" />
						<p className="text-muted-foreground">No audio files found</p>
						<p className="text-sm text-muted-foreground mt-1">Try refreshing the page</p>
					</div>
				)}

				{audios.map((arweaveAudio) => {
					const audioItem = convertToAudio(arweaveAudio);
					// Format size better
					audioItem.size = formatFileSize(audioItem.size);
					
					return (
						<AudioCard 
							key={arweaveAudio.id} 
							item={audioItem}
							actions={
								<MintButton item={audioItem} />
							}
						/>
					);
				})}
			</div>

		</div>
	);
};

export default SonoraPage;