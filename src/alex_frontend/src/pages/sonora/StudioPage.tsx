import React from "react";
import { Button } from "@/lib/components/button";
import { Palette, Settings, TrendingUp, BarChart3, ArrowDown, FileAudio } from "lucide-react";
import { mockAudio } from "@/features/sonora/data";
import { AudioCard } from "@/features/sonora/components/AudioCard";
import { PlayPauseButton } from "@/features/sonora/components/PlayPauseButton";
import { EditButton } from "@/features/sonora/components/EditButton";
import { UnlistButton } from "@/features/sonora/components/UnlistButton";

const SonoraStudioPage: React.FC = () => {
	return (
		<div className="h-[62vh] grid grid-cols-5 grid-rows-1">
			{/* Left Sidebar */}
			<div className="col-span-1 flex flex-col gap-4 items-center">
				<div className="w-full bg-card rounded-lg border p-5">
					<div className="space-y-4">
						<div className="flex items-center gap-2">
							<Palette size={20} className="text-primary" />
							<h3 className="font-semibold">Creator Studio</h3>
						</div>
						<p className="text-sm text-muted-foreground">
							Manage your listed audio NFTs and marketplace presence.
						</p>
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
					</div>
				</div>

				<div className="w-full bg-card rounded-lg border p-5">
					<div className="space-y-4">
						<div className="flex items-center gap-2">
							<FileAudio size={20} className="text-primary" />
							<h3 className="font-semibold">Manage Listings</h3>
						</div>
						<p className="text-sm text-muted-foreground">
							Edit metadata, pricing, and availability of your audio NFTs.
						</p>
						<div className="space-y-2">
							<div className="text-xs text-muted-foreground">
								<p className="font-medium text-foreground mb-1">Available actions:</p>
								<ul className="space-y-1">
									<li>• Edit titles and descriptions</li>
									<li>• Update pricing</li>
									<li>• Remove from marketplace</li>
								</ul>
							</div>
						</div>
						<div className="pt-2 border-t">
							<p className="text-xs text-muted-foreground">
								<span className="font-medium">{mockAudio.length}</span> active listings
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
								<EditButton item={item} />
								<UnlistButton item={item} />
								<PlayPauseButton item={item} />
							</>
						}
					/>
				))}
			</div>
		</div>
	);
};

export default SonoraStudioPage;