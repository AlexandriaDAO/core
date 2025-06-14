import React from "react";
import { X, ExternalLink, Info as InfoIcon } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogHeader, DialogTrigger, DialogFooter } from "@/lib/components/dialog";
import Asset from "./Asset";
import Tags from "./Tags";
import Metadata from "./Metadata";
import CollectionLink from "./CollectionLink";
import { Badge } from "@/lib/components/badge";

import useStatus from "../hooks/useStatus";
import useSize from "../hooks/useSize";
import useTags from "../hooks/useTags";
import useTimestamp from "../hooks/useTimestamp";
import { getFileTypeInfo } from "@/features/pinax/constants";
import { Button } from "@/lib/components/button";


interface InfoProps {
	id: string;
	owner?: string;
	data: Uint8Array | null;
	loading: boolean;
	progress: number;
	type: string | null;
	setFullscreen: (fullscreen: boolean) => void;
	action: React.ReactNode;
}

const Info: React.FC<InfoProps> = ({ id, owner, data, loading, progress, type, setFullscreen, action }) => {
	const { status } = useStatus(id);
	const { readableTimestamp } = useTimestamp(status);
	const { readableSize } = useSize(id, status);
	const { tags, loading: tagsLoading, error: tagsError } = useTags(id, status);

	const contentType = tags.find(tag => tag.name.toLowerCase() === "content-type")?.value || '';

	const assetType = contentType ? getFileTypeInfo(contentType)?.label : undefined;

	return (
		<Dialog open={true}>
			<DialogTrigger asChild>
				<InfoIcon strokeWidth={2} size={20} className="p-0.5 text-muted-foreground hover:text-muted-foreground/50 cursor-pointer flex-shrink-0"/>
			</DialogTrigger>
			<DialogContent className="max-w-4xl w-full p-4" closeIcon={null} onOpenAutoFocus={(e) => e.preventDefault()}>
				<DialogHeader className="flex flex-col space-y-0">
					<DialogTitle className="flex items-center justify-between gap-2">
						<span>{id}</span>
						<div className="flex items-center justify-between gap-3">
							{assetType && <Badge variant="outline">{assetType}</Badge>}
							<ExternalLink xlinkTitle="View on ViewBlock" strokeWidth={1} onClick={()=>window.open(`https://viewblock.io/arweave/tx/${id}`, "_blank")} size={22} className="text-muted-foreground hover:text-black dark:hover:text-white transition-all cursor-pointer" />
							<X xlinkTitle="Close fullscreen view" strokeWidth={1} onClick={()=>setFullscreen(false)} size={26} className="text-muted-foreground hover:text-black dark:hover:text-white transition-all cursor-pointer"/>
						</div>
					</DialogTitle>
					<DialogDescription>
						Here you can view the general Information about your NFT.
					</DialogDescription>
				</DialogHeader>

				<Asset data={data} loading={loading} progress={progress} type={type} fullscreen />
				<CollectionLink owner={owner} />
				<Tags tags={tags} loading={tagsLoading} error={tagsError} />
				<div className="flex items-center justify-between gap-2">
					<Metadata
						readableTimestamp={readableTimestamp}
						readableSize={readableSize}
						status={status}
					/>
					<DialogFooter className="flex items-center justify-between gap-2">
						{action}
						<Button variant="primary" scale="sm" onClick={()=>setFullscreen(false)}>
							Close
						</Button>
					</DialogFooter>
				</div>
			</DialogContent>
		</Dialog>
	)
};

export default Info;
