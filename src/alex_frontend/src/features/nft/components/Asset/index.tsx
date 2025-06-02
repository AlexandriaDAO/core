import React, { useMemo } from "react";
import { getFileTypeInfo } from "@/features/pinax/constants";
import AssetSkeleton from "@/layouts/skeletons/emporium/components/AssetSkeleton";

import Image from "./Image";
import Audio from "./Audio";
import Video from "./Video";
import Text from "./Text";
import HyperText from "./HyperText";
import BookCover from "./Book/Cover";
import Book from "./Book";
import Markdown from "./Markdown";
import Json from "./Json";

import Preview from "./Preview";

interface AssetProps {
	data: Uint8Array | null;
	dataLoading: boolean;
	tagsLoading: boolean;
	progress: number;
	contentType: string;
	fullscreen?: boolean;
}

const Asset: React.FC<AssetProps> = ({
	data,
	contentType,
	dataLoading,
	tagsLoading,
	progress,
	fullscreen = false,
}) => {
	const { dataUrl, processedData } = useMemo(() => {
		if (!data || !contentType)
			return { dataUrl: undefined, processedData: undefined };

		let dataUrl;
		let processedData;

		if ( contentType.startsWith("text/") || contentType.startsWith("application/json")) {
			// Convert to text for display
			try {
				const textDecoder = new TextDecoder();
				processedData = textDecoder.decode(data);
			} catch (error) {
				console.error("Error decoding text:", error);
			}
		} else {
			// Convert Uint8Array to Blob URL for binary data
			dataUrl = URL.createObjectURL(
				new Blob([data], { type: contentType })
			);
		}

		return { dataUrl, processedData };
	}, [data, contentType]);

	if (dataLoading) return <AssetSkeleton progress={progress} />;

	if (tagsLoading) return <AssetSkeleton />;

	const assetType = contentType
		? getFileTypeInfo(contentType)?.label
		: undefined;

	const scrollClasses = "overflow-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400";

	const render = () => {

		if(contentType.startsWith("image/")) return <Image url={dataUrl} fullscreen={fullscreen} />
		if(contentType.startsWith("video/")) return <Video url={dataUrl} contentType={contentType} />
		if(contentType.startsWith("audio/")) return <Audio url={dataUrl} contentType={contentType} />

		if(contentType.startsWith("text/html")) {
			if(fullscreen) return <HyperText data={processedData} />
			return <Text data={processedData} />
		}


		if(contentType.startsWith("application/epub")) {
			if(fullscreen) return <Book url={dataUrl} />
			return <BookCover url={dataUrl} />
		}

		if(contentType.startsWith("text/markdown") || contentType.startsWith("text/md")) {
			if(fullscreen) return <Markdown data={processedData} />
			return <Text data={processedData} />
		}

		if(contentType.startsWith("application/json")) {
			if(fullscreen) return <Json data={processedData} />
			return <Text data={processedData} />
		}

		if(contentType.startsWith("text/")) return <Text data={processedData} />

		return <Preview message="Preview not available" contentType={contentType} />
	}

	return (
		<div
			// className={`w-full flex-grow ${fullscreen ? "h-auto max-h-[70vh]" : "h-60"} flex flex-col items-center justify-center bg-muted rounded-t-lg overflow-hidden p-2`}
			className={`w-full ${fullscreen ? "max-h-[60vh]":"max-h-80 bg-muted p-2"} flex-grow flex flex-col items-center justify-center ${scrollClasses}`}
		>
			{render()}
		</div>
	);
};

export default Asset;
