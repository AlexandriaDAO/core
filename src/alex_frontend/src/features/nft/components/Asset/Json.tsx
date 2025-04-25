import { Badge } from "@/lib/components/badge";
import React, { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

interface JsonProps {
	data?: string;
	fullscreen?: boolean;
}

const Json: React.FC<JsonProps> = ({ data, fullscreen = false }) => {
	if (!data) return <div>No content available</div>;

	// Common scrollbar and height classes
	const scrollClasses = "overflow-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400";

	try {
		const jsonObj = JSON.parse(data);
		const formattedJson = JSON.stringify(jsonObj, null, 4);

		return (
			<SyntaxHighlighter
				language="json"
				style={vscDarkPlus}
				className={`font-mono text-xs w-full h-full m-0 rounded-md border border-input ${scrollClasses}`}
			>
				{formattedJson}
			</SyntaxHighlighter>
		);
	} catch (error) {
		console.error("Error parsing JSON:", error);
		return (
			<div className={`relative font-mono text-xs w-full h-full bg-gray-50 dark:bg-gray-800 p-3 rounded-md border border-destructive`}>
				Invalid JSON content: {(error as Error).message}
			</div>
		);
	}
};

export default Json;
