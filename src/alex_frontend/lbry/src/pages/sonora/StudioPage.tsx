import React, { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Button } from "@/lib/components/button";
import { Link } from "@tanstack/react-router";
import {
	Palette,
	Settings,
	TrendingUp,
	BarChart3,
	ArrowDown,
	ArrowLeft,
	FileAudio,
	LoaderPinwheel,
} from "lucide-react";
import { AudioCard } from "@/features/sonora/components/AudioCard";
import { EditButton } from "@/features/sonora/components/EditButton";
import { UnlistButton } from "@/features/sonora/components/UnlistButton";
import { useStudioAudioNFTs } from "@/features/sonora/hooks/useStudioAudioNFTs";
import { useSonoraProfileTarget } from "@/features/sonora/hooks/useSonoraProfileTarget";
import { StudioAudio } from "@/features/sonora/types";
import { shortenPrincipal } from "@/features/perpetua";

const SonoraStudioPage: React.FC = () => {
	const { targetPrincipal, isOwner } = useSonoraProfileTarget();
	const {
		audios,
		loading,
		loadingMore,
		error,
		pagination,
		refreshStudioAudioNFTs,
	} = useStudioAudioNFTs();

	useEffect(() => {
		if (targetPrincipal) {
			refreshStudioAudioNFTs(targetPrincipal, 1, 8, false);
		}
	}, [targetPrincipal, refreshStudioAudioNFTs]);

	const handleLoadMore = () => {
		if (
			targetPrincipal &&
			!loadingMore &&
			pagination.page < pagination.totalPages
		) {
			refreshStudioAudioNFTs(
				targetPrincipal,
				pagination.page + 1,
				8,
				true
			);
		}
	};

	return (
		<>
			<Helmet>
				<title>{isOwner ? "My Studio" : `${shortenPrincipal(targetPrincipal ?? "")}'s Studio`} | Sonora | Alexandria</title>
				<meta name="description" content={isOwner ? "Manage your listed audio NFTs, edit pricing, and track sales on Alexandria." : "View another user's listed audio NFTs on Alexandria."} />
			</Helmet>
			{!isOwner && (
				<div className="mb-4">
					<Link
						to="/app/sonora/studio"
						className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
					>
						<ArrowLeft size={14} />
						Back to my studio
					</Link>
				</div>
			)}
			<div className="grid grid-cols-5 min-h-full gap-6">
				{/* Left Sidebar */}
				<div className="col-span-1 flex flex-col gap-4 items-center sticky top-0 h-fit">
					<div className="w-full bg-card rounded-lg border p-5">
						<div className="space-y-4">
							<div className="flex items-center gap-2">
								<Palette size={20} className="text-primary" />
								<h3 className="font-semibold">{isOwner ? "Creator Studio" : "Studio"}</h3>
							</div>
							<p className="text-sm text-muted-foreground">
								{isOwner
									? "Manage your listed audio NFTs and marketplace presence."
									: `Viewing ${shortenPrincipal(targetPrincipal ?? "")}'s listed audio NFTs.`}
							</p>
							{isOwner && (
								<div className="space-y-2 text-xs text-muted-foreground">
									<div className="flex items-center gap-2">
										<TrendingUp size={12} />
										<span>Track sales</span>
									</div>
									<div className="flex items-center gap-2">
										<Settings size={12} />
										<span>Edit listings</span>
									</div>
									<div className="flex items-center gap-2">
										<BarChart3 size={12} />
										<span>View analytics</span>
									</div>
								</div>
							)}
						</div>
					</div>

					{isOwner && (
						<div className="w-full bg-card rounded-lg border p-5">
							<div className="space-y-4">
								<div className="flex items-center gap-2">
									<FileAudio size={20} className="text-primary" />
									<h3 className="font-semibold">Manage Listings</h3>
								</div>
								<p className="text-sm text-muted-foreground">
									Edit metadata, pricing, and availability of your
									audio NFTs.
								</p>
								<div className="space-y-2">
									<div className="text-xs text-muted-foreground">
										<p className="font-medium text-foreground mb-1">
											Available actions:
										</p>
										<ul className="space-y-1">
											<li>• Edit titles and descriptions</li>
											<li>• Update pricing</li>
											<li>• Remove from marketplace</li>
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
										listings shown
									</p>
								</div>
							</div>
						</div>
					)}

					{/* Load More */}
					{pagination.page < pagination.totalPages && (
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
									Loading your listed audio NFTs...
								</p>
							</div>
						</div>
					) : error ? (
						<div className="flex items-center justify-center py-12">
							<div className="text-center">
								<p className="text-destructive font-medium">
									Error loading listed audio NFTs
								</p>
								<p className="text-muted-foreground text-sm mt-1">
									{error}
								</p>
								<Button
									onClick={() =>
										targetPrincipal &&
										refreshStudioAudioNFTs(
											targetPrincipal,
											1,
											8,
											false
										)
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
								<Palette className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
								<h3 className="text-lg font-medium mb-2">
									No Active Listings
								</h3>
								<p className="text-muted-foreground">
									{isOwner
										? "You don't have any audio NFTs listed for sale yet."
										: "This user doesn't have any audio NFTs listed for sale."}
								</p>
							</div>
						</div>
					) : (
						audios.map((item: StudioAudio) => (
							<AudioCard
								key={item.id}
								item={item}
								price={item.price}
								actions={
									isOwner ? (
										<>
											<EditButton
												item={item}
												currentPrice={item.price.replace(
													" ICP",
													""
												)}
												tokenId={item.token_id}
											/>
											<UnlistButton
												item={item}
												tokenId={item.token_id}
											/>
										</>
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

export default SonoraStudioPage;
