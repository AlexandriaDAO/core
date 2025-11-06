import React from "react";
import { Button } from "@/lib/components/button";
import { Database, Globe, ArrowDown, FileAudio, Coins } from "lucide-react";
import { mockAudio } from "@/features/sonora/data";
import { AudioCard } from "@/features/sonora/components/AudioCard";
import { PlayPauseButton } from "@/features/sonora/components/PlayPauseButton";
import { MintButton } from "@/features/sonora/components/MintButton";

const SonoraPage: React.FC = () => {

	return (
		<div className="h-[62vh] grid grid-cols-5 grid-rows-1">
			{/* Left Sidebar */}
			<div className="col-span-1 flex flex-col gap-4 items-center">
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
								<span className="font-medium">{mockAudio.length}</span> files available
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
								<MintButton item={item} />
								<PlayPauseButton item={item} />
							</>
						}
					/>
				))}
			</div>

		</div>
	);
};

export default SonoraPage;