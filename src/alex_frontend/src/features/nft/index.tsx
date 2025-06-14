import React, { lazy, Suspense, useState } from "react";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
} from "@/lib/components/card";
import { Info as InfoIcon, RotateCw } from "lucide-react";
import { Badge } from "@/lib/components/badge";
import CardSkeleton from "@/layouts/skeletons/emporium/components/CardSkeleton";
import Asset from "./components/Asset";
import useData from "./hooks/useData";
import Copy from "@/components/Copy";
import CollectionLink from "./components/CollectionLink";

const Info = lazy(() => import("./components/Info"));

interface NftProps {
	id: string;
	action: React.ReactNode;
	price?: string;
	owner?: string;
	canister?: string
}

const Nft: React.FC<NftProps> = ({ id, action, price, owner, canister }) => {
	const [fullscreen, setFullscreen] = useState<boolean>(false);
	const {data, loading, error, progress, inCanister, type} = useData(id, canister);

	if (loading) return <CardSkeleton />;

	if (error) {
		return (
			<Card className="overflow-hidden border-destructive/40">
				<div className="h-56 w-full bg-destructive/10 flex items-center justify-center">
					<p className="text-destructive/70">Error loading NFT</p>
				</div>
				<CardContent className="p-4 flex justify-center items-center">
					<p className="text-destructive text-sm">{error}</p>
				</CardContent>
			</Card>
		);
	}

	return (
		<>
			<Card className="w-full overflow-hidden relative group border border-ring/50 hover:shadow-md hover:border-ring flex flex-col self-start">
				<CardHeader className="bg-muted pt-2 px-2 pb-0 space-y-0 grid grid-cols-[minmax(0,1fr)_auto_auto] items-center justify-center gap-1.5">
					<div className="relative">
						<code className="block w-full border-b border-b-transparent group-hover:border-b-ring text-muted-foreground p-0.5 text-left font-light text-sm font-roboto-condensed whitespace-nowrap overflow-x-auto scrollbar-none">{id}</code>
						<div className="hidden group-hover:block absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-muted to-transparent pointer-events-none"></div>
					</div>
					<Copy text={id} size="sm"/>
					{
						fullscreen ?
							<Suspense fallback={<RotateCw strokeWidth={2} size={20} className="p-0.5 text-muted-foreground/50 cursor-not-allowed pointer-events-none animate-spin"/>}>
								<Info id={id} owner={owner} data={data} loading={loading} progress={progress} type={type} setFullscreen={setFullscreen} action={action}/>
							</Suspense> :
							<InfoIcon strokeWidth={2} size={20} className="p-0.5 text-muted-foreground hover:text-muted-foreground/50 cursor-pointer flex-shrink-0" onClick={() => setFullscreen(true)}/>
					}
				</CardHeader>

				<Asset data={data} loading={loading} progress={progress} type={type} />

				<CardContent className="p-2 flex items-center justify-between gap-1 overflow-x-auto scrollbar-none border-b border-b-muted-foreground/20">
					{price && <div className="flex items-center gap-1 flex-grow">
						<Badge variant="outline" className="flex items-center gap-1 flex-nowrap">
							<span>Price:</span>
							<span>{price}</span>
							<span>ICP</span>
						</Badge>
					</div>}
					<div className={`flex-grow flex ${price ? 'justify-end':'justify-between'} items-center gap-1`}>
						<div className="flex gap-1 justify-between items-center">
							{inCanister && <Badge variant="outline">ICP</Badge>}
							<Badge variant="outline">AR</Badge>
						</div>
					</div>
				</CardContent>

				<CardFooter className="p-2 flex flex-wrap items-center justify-start gap-2">
					{action}
					<CollectionLink owner={owner} compact/>
				</CardFooter>
			</Card>
		</>
	);
};

export default Nft;
