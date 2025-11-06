import React from "react";
import { Button } from "@/lib/components/button";
import { Archive, User, FileAudio, Download, ArrowDown } from "lucide-react";
import { mockAudio } from "@/features/sonora/data";
import { AudioCard } from "@/features/sonora/components/AudioCard";
import { PlayPauseButton } from "@/features/sonora/components/PlayPauseButton";
import { SellButton } from "@/features/sonora/components/SellButton";

const SonoraArchivePage: React.FC = () => {
	return (
		<div className="h-[62vh] grid grid-cols-5 grid-rows-1">
			{/* Left Sidebar */}
			<div className="col-span-1 flex flex-col gap-4 items-center">
				<div className="w-full bg-card rounded-lg border p-5">
					<div className="space-y-4">
						<div className="flex items-center gap-2">
							<Archive size={20} className="text-primary" />
							<h3 className="font-semibold">Your Collection</h3>
						</div>
						<p className="text-sm text-muted-foreground">
							Your personal audio NFT collection and uploaded content.
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
								<p className="font-medium text-foreground mb-1">Available actions:</p>
								<ul className="space-y-1">
									<li>• Download original files</li>
									<li>• Share with others</li>
									<li>• List on marketplace</li>
								</ul>
							</div>
						</div>
						<div className="pt-2 border-t">
							<p className="text-xs text-muted-foreground">
								<span className="font-medium">{mockAudio.length}</span> items in collection
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
								<SellButton item={item} />
								<PlayPauseButton item={item} />
							</>
						}
					/>
				))}
			</div>
		</div>
	);
};

export default SonoraArchivePage;