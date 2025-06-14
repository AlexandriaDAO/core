import React, { useMemo } from "react";
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
	loading: boolean;
	progress: number;
	type: string | null;
	fullscreen?: boolean;
}

const Asset: React.FC<AssetProps> = ({
	data,
	loading,
	progress,
	type,
	fullscreen = false,
}) => {
	const { dataUrl, processedData } = useMemo(() => {
		if (!data || !type)
			return { dataUrl: undefined, processedData: undefined };

		let dataUrl;
		let processedData;

		if ( type.startsWith("text/") || type.startsWith("application/json")) {
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
				new Blob([data], { type: type })
			);
		}

		return { dataUrl, processedData };
	}, [data, type]);

	if (loading) return <AssetSkeleton progress={progress} />;

	// const assetType = type
	// 	? getFileTypeInfo(type)?.label
	// 	: undefined;

	const scrollClasses = "overflow-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400";

	const render = () => {
		if(!type) return <Preview message="Preview not available"/>

		if(type.startsWith("image/")) return <Image url={dataUrl} fullscreen={fullscreen} />
		if(type.startsWith("video/")) return <Video url={dataUrl} contentType={type} />
		if(type.startsWith("audio/")) return <Audio url={dataUrl} contentType={type} />

		if(type.startsWith("text/html")) {
			if(fullscreen) return <HyperText data={processedData} />
			return <Text data={processedData} />
		}


		if(type.startsWith("application/epub")) {
			if(fullscreen) return <Book url={dataUrl} />
			return <BookCover url={dataUrl} />
		}

		if(type.startsWith("text/markdown") || type.startsWith("text/md")) {
			if(fullscreen) return <Markdown data={processedData} />
			return <Text data={processedData} />
		}

		if(type.startsWith("application/json")) {
			if(fullscreen) return <Json data={processedData} />
			return <Text data={processedData} />
		}

		if(type.startsWith("text/")) return <Text data={processedData} />

		return <Preview message="Preview not available" contentType={type} />
	}

	return (
		<div
			className={`w-full ${fullscreen ? "max-h-[60vh]":"max-h-80 bg-muted p-2"} flex-grow flex flex-col items-center justify-center ${scrollClasses}`}
		>
			{render()}
		</div>
	);
};

export default Asset;
