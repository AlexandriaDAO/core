import React from "react";
import { Button } from "@/lib/components/button";
import { Store, TrendingUp, Search, Filter, ArrowDown, FileAudio } from "lucide-react";
import { mockAudio } from "@/features/sonora/data";
import { AudioCard } from "@/features/sonora/components/AudioCard";
import { PlayPauseButton } from "@/features/sonora/components/PlayPauseButton";
import { BuyButton } from "@/features/sonora/components/BuyButton";

const SonoraMarketPage: React.FC = () => {
	return (
		<div className="h-[62vh] grid grid-cols-5 grid-rows-1">
			{/* Left Sidebar */}
			<div className="col-span-1 flex flex-col gap-4 items-center">
				<div className="w-full bg-card rounded-lg border p-5">
					<div className="space-y-4">
						<div className="flex items-center gap-2">
							<Store size={20} className="text-primary" />
							<h3 className="font-semibold">Marketplace</h3>
						</div>
						<p className="text-sm text-muted-foreground">
							Discover and purchase audio NFTs from creators worldwide.
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
							Purchase audio NFTs with ALEX or LBRY tokens and own them forever.
						</p>
						<div className="space-y-2">
							<div className="text-xs text-muted-foreground">
								<p className="font-medium text-foreground mb-1">How it works:</p>
								<ul className="space-y-1">
									<li>• Preview before buying</li>
									<li>• Secure blockchain purchase</li>
									<li>• Instant ownership transfer</li>
								</ul>
							</div>
						</div>
						<div className="pt-2 border-t">
							<p className="text-xs text-muted-foreground">
								<span className="font-medium">{mockAudio.length}</span> items for sale
							</p>
						</div>
					</div>
				</div>

				{/* Load More */}
				<Button variant="outline" className="gap-2">
					<ArrowDown size={16} />
					Load More
				</Button>
			</div>

			{/* Audio Grid */}
			<div className="col-span-4 space-y-4 overflow-y-auto px-6">
				{mockAudio.map((item) => (
					<AudioCard 
						key={item.id} 
						item={item}
						actions={
							<>
								<BuyButton item={item} />
								<PlayPauseButton item={item} />
							</>
						}
					/>
				))}
			</div>
		</div>
	);
};

export default SonoraMarketPage;