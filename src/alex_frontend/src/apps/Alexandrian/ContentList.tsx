import React, { useState, useEffect } from "react";
import { Transaction, ContentListProps } from "./types/queries";
import { getCover } from "@/utils/epub";
import ContentGrid from "./ContentGrid";
import { supportedFileTypes } from "./types/files";

// Remove the Tag import as it's not exported from ./types/files

const contentTypeHandlers: Record<string, (id: string) => Promise<string | null> | string> = {
  "application/epub+zip": async (id: string) => {
    const url = await getCover(`https://arweave.net/${id}`);
    return url || null;
  },
};

supportedFileTypes.forEach(type => {
  if (type.mimeType.startsWith("image/")) {
    contentTypeHandlers[type.mimeType] = (id: string) => `https://arweave.net/${id}`;
  }
});

export default function ContentList({ transactions, onSelectContent, contentType }: ContentListProps) {
	const [contentUrls, setContentUrls] = useState<Record<string, string | null>>({});

	useEffect(() => {
		const loadContent = async () => {
			for (const transaction of transactions) {
				try {
					const handler = contentTypeHandlers[contentType as keyof typeof contentTypeHandlers];
					if (handler) {
						const url = await handler(transaction.id);
						setContentUrls(prev => ({ ...prev, [transaction.id]: url }));
					}
				} catch (error) {
					console.warn(`Error loading content for ${transaction.id}:`, error);
					setContentUrls(prev => ({ ...prev, [transaction.id]: null }));
				}
			}
		};

		loadContent();
	}, [transactions, contentType]);

	const renderDetails = (transaction: Transaction) => (
		<div className="absolute inset-0 bg-black bg-opacity-80 p-2 overflow-y-auto opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-xs text-gray-300">
			<p><span className="font-semibold">ID:</span> {transaction.id}</p>
			<p><span className="font-semibold">Size:</span> {transaction.data.size} bytes</p>
			<p><span className="font-semibold">Date:</span> {new Date(transaction.block.timestamp * 1000).toLocaleString()}</p>
			<p className="font-semibold mt-2">Tags:</p>
			{transaction.tags.map((tag, index) => (
				<p key={index} className="ml-2">
					<span className="font-semibold">{tag.name}:</span> {tag.value}
				</p>
			))}
		</div>
	);

	return (
		<ContentGrid>
			{transactions.map((transaction) => {
				const contentUrl = contentUrls[transaction.id];

				return (
					<ContentGrid.Item
						key={transaction.id}
						onClick={() => onSelectContent(transaction.id, contentType)}
					>
						<div className="group relative w-full h-full">
							{contentUrl ? (
								<>
									<img 
										src={contentUrl} 
										alt={contentType === "application/epub+zip" ? "Book cover" : "Content image"}
										className="absolute inset-0 w-full h-full object-cover"
									/>
									{renderDetails(transaction)}
								</>
							) : (
								<div className="flex flex-col justify-center items-center h-full">
									<p className="text-sm text-gray-400">No cover available</p>
									{renderDetails(transaction)}
								</div>
							)}
						</div>
					</ContentGrid.Item>
				);
			})}
		</ContentGrid>
	);
}