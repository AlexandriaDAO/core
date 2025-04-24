import { Badge } from "@/lib/components/badge";
import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

interface MarkdownProps {
	data?: string;
	fullscreen?: boolean;
}

const Markdown: React.FC<MarkdownProps> = ({ data, fullscreen = false }) => {
	const [raw, setRaw] = useState(false);
	if (!data) return <div>No content available</div>;

	// Common scrollbar and height classes
	const scrollClasses = "overflow-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400";

	return (

		<div className={`relative font-mono text-xs w-full h-full ${scrollClasses}`}>
			<Badge className={`absolute top-2 right-2 cursor-pointer hover:opacity-80 border border-info`} variant="secondary" onClick={() => setRaw(!raw)}>
				{raw ? "Formatted" : "Raw"}
			</Badge>

			{raw ? (
				// <pre className={`w-full h-full whitespace-pre`}>
				// 	{data}
				// </pre>
				<SyntaxHighlighter
					language="html"
					style={vscDarkPlus}
					className={`font-mono text-xs w-full h-full !m-0 rounded-md border border-input ${scrollClasses}`}
				>
					{data}
				</SyntaxHighlighter>
			) : (
				<div className={`w-full h-full bg-gray-50 dark:bg-gray-800 p-3 rounded-md border border-input`}>
					<ReactMarkdown>{data}</ReactMarkdown>
				</div>
			)}
		</div>
	);
};

export default Markdown;