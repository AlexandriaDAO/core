import React from "react";

import { ImageModal } from "./Image";
import { AudioModal } from "./Audio";
import { VideoModal } from "./Video";
import {TextModal} from "./Text";
import { BookModal } from "./Book";
import { PdfModal } from "./Pdf";
import Preview from "./Preview";

interface AssetModalProps {
	type?: string;
	url: string;
}

const AssetModal: React.FC<AssetModalProps> = ({
	type,
	url,
}) => {
	if(!type) return <Preview message="Preview not available"/>

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

	return <Preview message="Preview not available" contentType={type} />
};

export default AssetModal;
