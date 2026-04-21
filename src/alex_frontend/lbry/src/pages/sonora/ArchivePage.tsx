import React, { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Button } from "@/lib/components/button";
import { Link } from "@tanstack/react-router";
import {
	Archive,
	User,
	FileAudio,
	Download,
	ArrowDown,
	ArrowLeft,
	LoaderPinwheel,
} from "lucide-react";
import { AudioCard } from "@/features/sonora/components/AudioCard";
import { SellButton } from "@/features/sonora/components/SellButton";
import { useUserAudioNFTs } from "@/features/sonora/hooks/useUserAudioNFTs";
import { useSonoraProfileTarget } from "@/features/sonora/hooks/useSonoraProfileTarget";
import { ArchiveAudio } from "@/features/sonora/types";
import { shortenPrincipal } from "@/features/perpetua";

const SonoraArchivePage: React.FC = () => {
	const { targetPrincipal, isOwner } = useSonoraProfileTarget();
	const {
		audios,
		loading,
		loadingMore,
		error,
		pagination,
		refreshAudioNFTs,
	} = useUserAudioNFTs();

	useEffect(() => {
		if (targetPrincipal) {
			refreshAudioNFTs(targetPrincipal, 1, false);
		}
	}, [targetPrincipal, refreshAudioNFTs]);

	const handleLoadMore = () => {
		if (targetPrincipal && !loadingMore && pagination.hasMore) {
			refreshAudioNFTs(targetPrincipal, pagination.page + 1, true);
		}
	};

	return (
		<>
			<Helmet>
				<title>{isOwner ? "My Archive" : `${shortenPrincipal(targetPrincipal ?? "")}'s Archive`} | Sonora | Alexandria</title>
				<meta name="description" content={isOwner ? "View and manage your personal audio NFT collection on Alexandria." : "View another user's audio NFT collection on Alexandria."} />
			</Helmet>
			{!isOwner && (
				<div className="mb-4">
					<Link
						to="/app/sonora/archive"
						className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
					>
						<ArrowLeft size={14} />
						Back to my archive
					</Link>
				</div>
			)}
			<div className="grid grid-cols-5 min-h-full gap-6">
				{/* Left Sidebar */}
				<div className="col-span-1 flex flex-col gap-4 items-center sticky top-0 h-fit">
					<div className="w-full bg-card rounded-lg border p-5">
						<div className="space-y-4">
							<div className="flex items-center gap-2">
								<Archive size={20} className="text-primary" />
								<h3 className="font-semibold">{isOwner ? "Your Archive" : "Archive"}</h3>
							</div>
							<p className="text-sm text-muted-foreground">
								{isOwner
									? "Your personal audio NFT collection and uploaded content."
									: `Viewing ${shortenPrincipal(targetPrincipal ?? "")}'s audio NFT collection.`}
							</p>
							<div className="space-y-2 text-xs text-muted-foreground">
								<div className="flex items-center gap-2">
									<User size={12} />
									<span>{isOwner ? "Owned by you" : "Owned by this user"}</span>
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
								<h3 className="font-semibold">{isOwner ? "Manage Content" : "Collection Info"}</h3>
							</div>
							<p className="text-sm text-muted-foreground">
								{isOwner
									? "Download, share, or list your audio NFTs for sale."
									: "Audio NFTs minted by this user on Alexandria."}
							</p>
							{isOwner && (
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
							)}
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
								{isOwner ? (
									<Link
										to="/app/sonora/studio"
										className="text-xs text-primary hover:underline block mt-2"
									>
										→ View your listings
									</Link>
								) : (
									<Link
										to="/app/sonora/studio/$principal"
										params={{ principal: targetPrincipal ?? "" }}
										className="text-xs text-primary hover:underline block mt-2"
									>
										→ View their listings
									</Link>
								)}
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
				<div className="col-span-4 space-y-4 overflow-y-auto px-2">
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
										targetPrincipal &&
										refreshAudioNFTs(targetPrincipal, 1, false)
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
									{isOwner
										? "You haven't minted any audio NFTs yet."
										: "This user hasn't minted any audio NFTs yet."}
								</p>
							</div>
						</div>
					) : (
						audios.map((item: ArchiveAudio) => (
							<AudioCard
								key={item.id}
								item={item}
								actions={
									isOwner ? (
										<SellButton
											item={item}
											tokenId={item.token_id}
										/>
									) : undefined
								}
							/>
						))
					)}
				</div>
			</div>
		</>
	);
};

export default SonoraArchivePage;
