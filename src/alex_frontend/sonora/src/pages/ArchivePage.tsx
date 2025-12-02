import React, { useEffect } from "react";
import { Button } from "@/lib/components/button";
import { Link } from "@tanstack/react-router";
import {
	Archive,
	User,
	FileAudio,
	Download,
	ArrowDown,
	LoaderPinwheel,
} from "lucide-react";
import { AudioCard } from "@/features/sonora/components/AudioCard";
import { SellButton } from "@/features/sonora/components/SellButton";
import { useUserAudioNFTs } from "@/features/sonora/hooks/useUserAudioNFTs";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { ArchiveAudio } from "@/features/sonora/types";

const SonoraArchivePage: React.FC = () => {
	const { user } = useAppSelector((state) => state.auth);
	const {
		audios,
		loading,
		loadingMore,
		error,
		pagination,
		refreshAudioNFTs,
	} = useUserAudioNFTs();

	// Fetch user's audio NFTs when component mounts or user changes
	useEffect(() => {
		if (user?.principal) {
			refreshAudioNFTs(user.principal, 1, false); // First page, not append mode
		}
	}, [user?.principal, refreshAudioNFTs]);

	// Load More handler
	const handleLoadMore = () => {
		if (user?.principal && !loadingMore && pagination.hasMore) {
			refreshAudioNFTs(user.principal, pagination.page + 1, true); // Next page, append mode
		}
	};

	return (
		<div className="grid grid-cols-5 min-h-full gap-6">
			{/* Left Sidebar */}
			<div className="col-span-1 flex flex-col gap-4 items-center sticky top-0 h-fit">
				<div className="w-full bg-card rounded-lg border p-5">
					<div className="space-y-4">
						<div className="flex items-center gap-2">
							<Archive size={20} className="text-primary" />
							<h3 className="font-semibold">Your Collection</h3>
						</div>
						<p className="text-sm text-muted-foreground">
							Your personal audio NFT collection and uploaded
							content.
						</p>
						<div className="space-y-2 text-xs text-muted-foreground">
							<div className="flex items-center gap-2">
								<User size={12} />
								<span>Owned by you</span>
							</div>
							<div className="flex items-center gap-2">
								<FileAudio size={12} />
								<span>Ready to trade</span>
							</div>
							<div className="flex items-center gap-2">
								<Download size={12} />
								<span>Download anytime</span>
							</div>
						</div>
					</div>
				</div>

				<div className="w-full bg-card rounded-lg border p-5">
					<div className="space-y-4">
						<div className="flex items-center gap-2">
							<FileAudio size={20} className="text-primary" />
							<h3 className="font-semibold">Manage Content</h3>
						</div>
						<p className="text-sm text-muted-foreground">
							Download, share, or list your audio NFTs for sale.
						</p>
						<div className="space-y-2">
							<div className="text-xs text-muted-foreground">
								<p className="font-medium text-foreground mb-1">
									Available actions:
								</p>
								<ul className="space-y-1">
									<li>• Download original files</li>
									<li>• Share with others</li>
									<li>• List on marketplace</li>
								</ul>
							</div>
						</div>
						<div className="pt-2 border-t">
							<p className="text-xs text-muted-foreground">
								<span className="font-medium">
									{audios.length}
								</span>{" "}
								of{" "}
								<span className="font-medium">
									{pagination.totalCount}
								</span>{" "}
								items
							</p>
							<Link
								to="/studio"
								className="text-xs text-primary hover:underline block mt-2"
							>
								→ View your listings
							</Link>
						</div>
					</div>
				</div>

				{/* Load More */}
				{pagination.hasMore && (
					<Button
						variant="outline"
						className="gap-2"
						onClick={handleLoadMore}
						disabled={loadingMore}
					>
						{loadingMore ? (
							<LoaderPinwheel
								size={16}
								className="animate-spin"
							/>
						) : (
							<ArrowDown size={16} />
						)}
						{loadingMore ? "Loading..." : "Load More"}
					</Button>
				)}
			</div>

			{/* Audio Grid */}
			<div className="col-span-4 space-y-4 overflow-y-auto">
				{loading ? (
					<div className="flex items-center justify-center py-12">
						<div className="text-center">
							<LoaderPinwheel className="w-8 h-8 animate-spin mx-auto mb-4" />
							<p className="text-muted-foreground">
								Loading your audio NFTs...
							</p>
						</div>
					</div>
				) : error ? (
					<div className="flex items-center justify-center py-12">
						<div className="text-center">
							<p className="text-destructive font-medium">
								Error loading NFTs
							</p>
							<p className="text-muted-foreground text-sm mt-1">
								{error}
							</p>
							<Button
								onClick={() =>
									user?.principal &&
									refreshAudioNFTs(user.principal, 1, false)
								}
								className="mt-4"
								variant="outline"
							>
								Try Again
							</Button>
						</div>
					</div>
				) : audios.length === 0 ? (
					<div className="flex items-center justify-center py-12">
						<div className="text-center">
							<FileAudio className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
							<h3 className="text-lg font-medium mb-2">
								No Audio NFTs Found
							</h3>
							<p className="text-muted-foreground">
								You haven't minted any audio NFTs yet.
							</p>
						</div>
					</div>
				) : (
					audios.map((item: ArchiveAudio) => (
						<AudioCard
							key={item.id}
							item={item}
							actions={
								<SellButton
									item={item}
									tokenId={item.token_id}
								/>
							}
						/>
					))
				)}
			</div>
		</div>
	);
};

export default SonoraArchivePage;
