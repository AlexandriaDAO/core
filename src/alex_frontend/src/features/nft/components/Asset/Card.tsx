import React from "react";

import { ImageCard } from "./Image";
import { AudioCard } from "./Audio";
import { VideoCard } from "./Video";
import { TextCard } from "./Text";
import { BookCard } from "./Book";

import Preview from "./Preview";
import useInit from "../../hooks/useInit";
import { FileText, Loader, TriangleAlert } from "lucide-react";

interface AssetCardProps {
	id: string;
}

const AssetCard: React.FC<AssetCardProps> = ({ id }) => {
	const {initializing, initError, type} = useInit(id);

	if(initializing) return <Preview icon={<Loader className="animate-spin"/>} />

	if(initError) return <Preview icon={<TriangleAlert size={48} className="text-warning"/>} title="Loading Error" description={initError.message}/>

	if(!type) return <Preview title="No Preview" description="Unknown Type" />

	const url = `https://arweave.net/${id}`;

	// Binary files - use direct URL
	if(type.startsWith("image/")) return <ImageCard url={url} />
	if(type.startsWith("video/")) return <VideoCard url={url} contentType={type} />
	if(type.startsWith("audio/")) return <AudioCard url={url} contentType={type} />

	// if epub book
	if(type === "application/epub+zip") return <BookCard url={url} />

	// PDF files - show first page preview
	// if(type === "application/pdf") return <PdfCard url={url} />
	if(type === "application/pdf") return <Preview className="" icon={<FileText size={48} className="text-info"/>} title="PDF Document" description="Click to view document"/>

	// Text files - let TextCard handle partial data fetching
	if(type.startsWith("text/") || type.startsWith("application/json")) return <TextCard url={url} />

	return <Preview title="Preview not available" description={type} />
};

export default AssetCard;
