import React, { useState } from "react";

import { ImageModal } from "./Image";
import { AudioModal } from "./Audio";
import { VideoModal } from "./Video";
import {TextModal} from "./Text";
import { BookModal } from "./Book";
import Preview from "./Preview";
import useInit from "../../hooks/useInit";
import { Badge } from "@/lib/components/badge";
import { Loader, TriangleAlert } from "lucide-react";
import Rendered from "./Rendered";

interface AssetModalProps {
	id: string;
}

const AssetModal: React.FC<AssetModalProps> = ({ id }) => {
	const [raw, setRaw] = useState(true);

	const {initializing, initError, type} = useInit(id);

	if(initializing) return <Preview icon={<Loader className="animate-spin"/>} />

	if(initError) return <Preview icon={<TriangleAlert size={48} className="text-warning"/>} title="Loading Error" description={initError.message}/>

	if(!type) return <Preview title="No Preview" description="Unknown Type" />

	const url = `https://arweave.net/${id}`;

	// Binary files - use direct URL
	if(type.startsWith("image/")) return <ImageModal url={url} />
	if(type.startsWith("video/")) return <VideoModal url={url} contentType={type} />
	if(type.startsWith("audio/")) return <AudioModal url={url} contentType={type} />

	// if epub book
	if(type === "application/epub+zip") return <BookModal url={url} />

	// Text files - let TextModal handle full data fetching
	if(type.startsWith("text/") || type.startsWith("application/json") || type === "application/pdf") return (
		<div className="relative overflow-hidden w-full h-full bg-gray-50 dark:bg-gray-800 rounded-lg border border-border/30">
			<Badge className={`text-base absolute z-10 top-1 px-4 right-4 cursor-pointer border border-info bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm rounded-lg shadow-lg`} variant="secondary" onClick={() => setRaw(!raw)}>
				{raw ? "View Rendered" : "View Raw"}
			</Badge>
			{raw ? <TextModal url={url} /> : <Rendered url={url} />}
		</div>
	)

	return <Preview title="Preview not available" description={type} />
};

export default AssetModal;
