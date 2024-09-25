import React, { useState, useEffect } from "react";
import { Transaction } from "./query";
import { getCover } from "@/utils/epub";

interface ContentListProps {
  transactions: Transaction[];
  onSelectEpub: (id: string) => void;
}

export default function ContentList({ transactions, onSelectEpub }: ContentListProps) {
	const [coverUrls, setCoverUrls] = useState<Record<string, string>>({});

	useEffect(() => {
		const loadCovers = async () => {
			for (const transaction of transactions) {
				try {
					const url = await getCover(`https://arweave.net/${transaction.id}`);
					if (url) {
						setCoverUrls(prev => ({ ...prev, [transaction.id]: url }));
					}
				} catch (error) {
					console.error("Error loading cover for " + transaction.id);
				}
			}
		};

		loadCovers();
	}, [transactions]);

	return (
		<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
			{transactions.map((transaction) => {
				const title = transaction.tags.find((tag) => tag.name === "title")?.value || "Untitled";
				const author = transaction.tags.find((tag) => tag.name === "author")?.value || "Unknown Author";
				const hasCover = transaction.id in coverUrls;

				return (
					<div
						key={transaction.id}
						className="aspect-square border border-white rounded-lg p-4 cursor-pointer hover:bg-gray-900 flex flex-col items-center justify-center text-center relative overflow-hidden"
						onClick={() => onSelectEpub(transaction.id)}
					>
						{!hasCover && (
							<>
								<h3 className="text-lg font-semibold text-white">{title}</h3>
									<p className="text-sm text-gray-400">{author}</p>
									<p className="text-xs text-gray-500 mt-2">
										{new Date(transaction.block.timestamp * 1000).toLocaleDateString()}
									</p>
							</>
						)}
						{hasCover && (
							<img 
								src={coverUrls[transaction.id]} 
								alt="Book cover" 
								className="absolute inset-0 w-full h-full object-cover"
							/>
						)}
					</div>
				);
			})}
		</div>
	);
}