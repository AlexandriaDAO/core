import React from "react";

import { ImageCard } from "./Image";
import { AudioCard } from "./Audio";
import { VideoCard } from "./Video";
import { TextCard } from "./Text";
import { BookCard } from "./Book";
import { PdfCard } from "./Pdf";

import Preview from "./Preview";

interface AssetCardProps {
	id: string;
	type?: string;
	checkNsfw: boolean;
	setIsNsfw: (isNsfw: boolean) => void;
}

const AssetCard: React.FC<AssetCardProps> = ({ id, type, checkNsfw, setIsNsfw }) => {
	const url = `https://arweave.net/${id}`;

	if(!type) return <Preview title="No Preview" description={'File type is not supported'}/>

	// Binary files - use direct URL
	if(type.startsWith("image/")) return <ImageCard url={url} checkNsfw={checkNsfw} setIsNsfw={setIsNsfw} />
	if(type.startsWith("video/")) return <VideoCard url={url} contentType={type} checkNsfw={checkNsfw} setIsNsfw={setIsNsfw} />
	if(type.startsWith("audio/")) return <AudioCard url={url} contentType={type} />

	// if epub book
	if(type === "application/epub+zip") return <BookCard url={url} checkNsfw={checkNsfw} setIsNsfw={setIsNsfw} />

	// PDF files - show first page preview
	if(type === "application/pdf") return <PdfCard url={url} />

	// Text files - let TextCard handle partial data fetching
	if(type.startsWith("text/") || type.startsWith("application/json")) return <TextCard url={url} />

	return <Preview title="Preview not available" description={type} />
};

export default AssetCard;
