import React, { useEffect } from "react";
import { Button } from "@/lib/components/button";
import { Link } from "@tanstack/react-router";
import {
	Store,
	TrendingUp,
	Search,
	Filter,
	ArrowDown,
	FileAudio,
	LoaderPinwheel,
} from "lucide-react";
import { AudioCard } from "@/features/sonora/components/AudioCard";
import { BuyButton } from "@/features/sonora/components/BuyButton";
import { useMarketAudioNFTs } from "@/features/sonora/hooks/useMarketAudioNFTs";
import { MarketAudio } from "@/features/sonora/types";

const SonoraMarketPage: React.FC = () => {
	const {
		audios,
		loading,
		loadingMore,
		error,
		pagination,
		refreshMarketAudioNFTs,
	} = useMarketAudioNFTs();

	// Fetch market audio NFTs on component mount
	useEffect(() => {
		refreshMarketAudioNFTs(1, 8, false); // First page, not append mode
	}, []);

	// Load More handler
	const handleLoadMore = () => {
		if (!loadingMore && pagination.page < pagination.totalPages) {
			refreshMarketAudioNFTs(pagination.page + 1, 8, true); // Next page, append mode
		}
	};

	return (
		<div className="grid grid-cols-5 min-h-full gap-6">
			{/* Left Sidebar */}
			<div className="col-span-1 flex flex-col gap-4 items-center sticky top-0 h-fit">
				<div className="w-full bg-card rounded-lg border p-5">
					<div className="space-y-4">
						<div className="flex items-center gap-2">
							<Store size={20} className="text-primary" />
							<h3 className="font-semibold">Marketplace</h3>
						</div>
						<p className="text-sm text-muted-foreground">
							Discover and purchase audio NFTs from creators
							worldwide.
						</p>
						<div className="space-y-2 text-xs text-muted-foreground">
							<div className="flex items-center gap-2">
								<TrendingUp size={12} />
								<span>Trending content</span>
							</div>
							<div className="flex items-center gap-2">
								<Search size={12} />
								<span>Search by genre</span>
							</div>
							<div className="flex items-center gap-2">
								<Filter size={12} />
								<span>Filter by price</span>
							</div>
						</div>
					</div>
				</div>

				<div className="w-full bg-card rounded-lg border p-5">
					<div className="space-y-4">
						<div className="flex items-center gap-2">
							<FileAudio size={20} className="text-primary" />
							<h3 className="font-semibold">Buy & Own</h3>
						</div>
						<p className="text-sm text-muted-foreground">
							Purchase audio NFTs with ALEX or LBRY tokens and own
							them forever.
						</p>
						<div className="space-y-2">
							<div className="text-xs text-muted-foreground">
								<p className="font-medium text-foreground mb-1">
									How it works:
								</p>
								<ul className="space-y-1">
									<li>• Preview before buying</li>
									<li>• Secure blockchain purchase</li>
									<li>• Instant ownership transfer</li>
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
								items shown
							</p>
							<Link 
								to="/studio" 
								className="text-xs text-primary hover:underline block mt-2"
							>
								→ Manage your listings
							</Link>
						</div>
					</div>
				</div>

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
			<div className="col-span-4 space-y-4 overflow-y-auto">
				{loading ? (
					<div className="flex items-center justify-center py-12">
						<div className="text-center">
							<LoaderPinwheel className="w-8 h-8 animate-spin mx-auto mb-4" />
							<p className="text-muted-foreground">
								Loading marketplace audio NFTs...
							</p>
						</div>
					</div>
				) : error ? (
					<div className="flex items-center justify-center py-12">
						<div className="text-center">
							<p className="text-destructive font-medium">
								Error loading marketplace
							</p>
							<p className="text-muted-foreground text-sm mt-1">
								{error}
							</p>
							<Button
								onClick={() =>
									refreshMarketAudioNFTs(1, 8, false)
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
							<Store className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
							<h3 className="text-lg font-medium mb-2">
								No Items for Sale
							</h3>
							<p className="text-muted-foreground">
								There are currently no audio NFTs listed in the
								marketplace.
							</p>
						</div>
					</div>
				) : (
					audios.map((audio: MarketAudio) => (
						<AudioCard
							key={audio.id}
							item={audio}
							price={audio.price}
							owner={audio.owner}
							actions={
								<BuyButton
									item={audio}
									price={audio.price.replace(" ICP", "")}
									tokenId={audio.token_id}
								/>
							}
						/>
					))
				)}
			</div>
		</div>
	);
};

export default SonoraMarketPage;
