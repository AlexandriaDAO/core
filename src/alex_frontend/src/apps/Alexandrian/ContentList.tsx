import React, { useState, useEffect } from "react";
import { Transaction, ContentListProps } from "./types/queries";
import { getCover } from "@/utils/epub";

export default function ContentList({ transactions, onSelectContent, contentType }: ContentListProps) {
	const [contentUrls, setContentUrls] = useState<Record<string, string>>({});

	useEffect(() => {
		const loadContent = async () => {
			for (const transaction of transactions) {
				try {
					if (contentType === "application/epub+zip") {
						const url = await getCover(`https://arweave.net/${transaction.id}`);
						if (url) {
							setContentUrls(prev => ({ ...prev, [transaction.id]: url }));
						}
					} else if (contentType === "image/png") {
						setContentUrls(prev => ({ ...prev, [transaction.id]: `https://arweave.net/${transaction.id}` }));
					} else if (contentType === "image/jpeg") {
						setContentUrls(prev => ({ ...prev, [transaction.id]: `https://arweave.net/${transaction.id}` }));
					} else if (contentType === "image/gif") {
						setContentUrls(prev => ({ ...prev, [transaction.id]: `https://arweave.net/${transaction.id}` }));
					}
				} catch (error) {
					console.error(`Error loading content for ${transaction.id}`);
				}
			}
		};

		loadContent();
	}, [transactions, contentType]);

	return (
		<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
			{transactions.map((transaction) => {
				const hasContent = transaction.id in contentUrls;

				return (
					<div
						key={transaction.id}
						className="aspect-square border border-white rounded-lg p-4 cursor-pointer hover:bg-gray-900 flex flex-col items-center justify-center text-center relative overflow-hidden"
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
					</div>
				);
			})}
		</div>
	);
}