import React from "react";

import { ImageModal } from "./Image";
import { AudioModal } from "./Audio";
import { VideoModal } from "./Video";
import {TextModal} from "./Text";
import { BookModal } from "./Book";
import { PdfModal } from "./Pdf";
import Preview from "./Preview";
import useInit from "../../hooks/useInit";
import { Loader, TriangleAlert } from "lucide-react";

interface AssetModalProps {
	id: string;
}

const AssetModal: React.FC<AssetModalProps> = ({ id }) => {
	const {initializing, initError, type} = useInit(id);

	if(initializing) return <div className="relative min-h-40 h-full w-full place-items-center place-content-center">
		<Loader className="animate-spin" />
	</div>

	if(initError) return <Preview icon={<TriangleAlert size={48} className="text-warning"/>} title="Loading Error" description={initError.message}/>

	if(!type) return <Preview title="No Preview" description={'File type is not supported'}/>

	const url = `https://arweave.net/${id}`;

	// Binary files - use direct URL
	if(type.startsWith("image/")) return <ImageModal url={url} />
	if(type.startsWith("video/")) return <VideoModal url={url} contentType={type} />
	if(type.startsWith("audio/")) return <AudioModal url={url} contentType={type} />

	// if epub book
	if(type === "application/epub+zip") return <BookModal url={url} />

	// PDF files - use dedicated PDF modal
	if(type === "application/pdf") return <PdfModal url={url} />

	// Text files - let TextModal handle full data fetching
	if(type.startsWith("text/") || type.startsWith("application/json")) return <TextModal url={url} />

	return <Preview title="Preview not available" description={type} />
};

export default AssetModal;
