import React, { useState } from "react";
import { Badge } from "@/lib/components/badge";
import Preview from "./components/Asset/Preview";
import useInit from "./hooks/useInit";
import { ErrorBoundary } from "react-error-boundary";
import AssetCard from "./components/Asset/Card";
import { AlexandrianToken } from "../alexandrian/types";
import AssetSkeleton from "@/layouts/skeletons/emporium/components/AssetSkeleton";
import { useNftContext } from "@/components/NftProvider";
import { Loader, TriangleAlert } from 'lucide-react';
import { useInView } from "react-intersection-observer";
interface NftProps {
	id: string;
	action?: React.ReactNode;
	price?: string;

	// token comes from alexandrian page
	token?: AlexandrianToken
}

const Nft: React.FC<NftProps> = ({ id, action, price, token }) => {
	const { ref, inView } = useInView({
		triggerOnce: true, // Only render once, never unmount
		threshold: 0.1,
		rootMargin: '200px' // Start loading 200px before entering viewport
    });

	const { safe, setModal} = useNftContext();
	const [ nsfw, setNsfw] = useState<boolean>(false);

	return (
		<ErrorBoundary fallback={<Preview title="Asset failed to load" />}>
			<div ref={ref} onClick={()=>setModal({ id , token})} className="min-h-28 min-w-40 max-w-lg place-content-center place-items-center relative inline-block border-2 border-transparent hover:border-info rounded-lg overflow-hidden cursor-pointer group/nft transition-all">
				{inView ? (
					<>
						{/* NSFW Frosted Glass Overlay */}
						{safe && nsfw && (
							<div className="absolute inset-0 z-20 backdrop-blur-lg bg-white/30 dark:bg-black/30 shadow-inner border border-white/40 dark:border-gray-600/40 rounded-md flex items-center justify-center">
								<div className="bg-white/90 dark:bg-black/80 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg border border-white/60 dark:border-gray-500/60">
									<div className="text-gray-800 dark:text-gray-200 text-xs font-medium flex items-center gap-2">
										<div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
										Content Filtered
									</div>
								</div>
							</div>
						)}

						{action && (
							<div className="absolute top-0 right-2 z-10 flex gap-1 flex-col items-center justify-center transform -translate-y-full group-hover/nft:translate-y-0 transition-transform duration-400 ease-in-out" onClick={event=>event.stopPropagation()}>
								{action}
							</div>
						)}

						<div className="font-roboto-condensed absolute top-0 left-1 pt-1 z-10 flex gap-0.5 flex-col items-start" onClick={event=>event.stopPropagation()}>
							{price && (
								<Badge variant="outline" className="px-2 text-xs bg-background text-foreground transition-colors">
									{price} ICP
								</Badge>
							)}
							{token && token.alex > 0 && (
								<Badge variant="outline" className="px-2 text-xs bg-background text-foreground transition-colors">
									{token.alex.toFixed(2)} ALEX
								</Badge>
							)}
							{token && token.lbry > 0 && (
								<Badge variant="outline" className="px-2 text-xs bg-background text-foreground transition-colors">
									{token.lbry.toFixed(2)} LBRY
								</Badge>
							)}
							{token && token.rank && (
								<Badge variant="outline" className="px-2 text-xs bg-background text-foreground transition-colors">
									{`${(token.rank / 100).toFixed(2)}%`} Rare
								</Badge>
							)}
						</div>

						<AssetCard id={id} checkNsfw={safe} setIsNsfw={setNsfw} />
					</>
				) : (
					<Preview icon={<Loader className="animate-spin"/>} />
				)}
			</div>
		</ErrorBoundary>
	);
};

export default Nft;
