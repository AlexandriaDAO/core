import React, { useState, useEffect } from "react";
import { Transaction, ContentListProps } from "./types/queries";
import { getCover } from "@/utils/epub";
import ContentGrid from "./ContentGrid";

const contentTypeHandlers = {
  "application/epub+zip": async (id: string) => {
    const url = await getCover(`https://arweave.net/${id}`);
    return url || null;
  },
  "image/png": (id: string) => `https://arweave.net/${id}`,
  "image/jpeg": (id: string) => `https://arweave.net/${id}`,
  "image/gif": (id: string) => `https://arweave.net/${id}`,
};

export default function ContentList({ transactions, onSelectContent, contentType }: ContentListProps) {
	const [contentUrls, setContentUrls] = useState<Record<string, string>>({});

	useEffect(() => {
		const loadContent = async () => {
			for (const transaction of transactions) {
				try {
					const handler = contentTypeHandlers[contentType as keyof typeof contentTypeHandlers];
					if (handler) {
						const url = await handler(transaction.id);
						if (url) {
							setContentUrls(prev => ({ ...prev, [transaction.id]: url }));
						}
					}
				} catch (error) {
					console.error(`Error loading content for ${transaction.id}`);
				}
			}
		};

		loadContent();
	}, [transactions, contentType]);

	return (
		<ContentGrid>
			{transactions.map((transaction) => {
				const hasContent = transaction.id in contentUrls;

				return (
					<ContentGrid.Item
						key={transaction.id}
						onClick={() => onSelectContent(transaction.id, contentType)}
					>
						{!hasContent && (
							<>
								{transaction.tags.map((tag, index) => (
									<p key={index} className="text-sm text-gray-400">
										<span className="font-semibold">{tag.name}:</span> {tag.value}
									</p>
								))}
								<p className="text-xs text-gray-500 mt-2">
									{new Date(transaction.block.timestamp * 1000).toLocaleDateString()}
								</p>
							</>
						)}
						{hasContent && (
							<img 
								src={contentUrls[transaction.id]} 
								alt={contentType === "application/epub+zip" ? "Book cover" : "PNG image"}
								className="absolute inset-0 w-full h-full object-cover"
							/>
						)}
					</ContentGrid.Item>
				);
			})}
		</ContentGrid>
	);
}