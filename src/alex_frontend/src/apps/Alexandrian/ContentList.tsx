import React, { useState } from "react";
import { Transaction } from "./query";
import { getCover } from "@/utils/epub";


interface ContentListProps {
  transactions: Transaction[];
  onSelectEpub: (id: string) => void;
}

export default function ContentList({ transactions, onSelectEpub }: ContentListProps) {
	const [hoveredId, setHoveredId] = useState<string | null>(null);
	const [coverUrl, setCoverUrl] = useState<string | null>(null);

	const handleMouseEnter = async (id: string) => {
		setHoveredId(id);
		const url = await getCover(`https://arweave.net/${id}`);
		setCoverUrl(url);
	};

	const handleMouseLeave = () => {
		setHoveredId(null);
		setCoverUrl(null);
	};

	return (
		<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
			{transactions.map((transaction) => {
				const title = transaction.tags.find((tag) => tag.name === "title")?.value || "Untitled";
				const author = transaction.tags.find((tag) => tag.name === "author")?.value || "Unknown Author";

				return (
					<div
						key={transaction.id}
						className="aspect-square border border-white rounded-lg p-4 cursor-pointer hover:bg-gray-900 flex flex-col items-center justify-center text-center relative"
						onClick={() => onSelectEpub(transaction.id)}
						onMouseEnter={() => handleMouseEnter(transaction.id)}
						onMouseLeave={handleMouseLeave}
					>
						<h3 className="text-lg font-semibold text-white">{title}</h3>
						<p className="text-sm text-gray-400">{author}</p>
						<p className="text-xs text-gray-500 mt-2">
							{new Date(transaction.block.timestamp * 1000).toLocaleDateString()}
						</p>
						{hoveredId === transaction.id && coverUrl && (
							<div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75">
								<img src={coverUrl} alt="Book cover" className="max-w-full max-h-full object-contain" />
							</div>
						)}
					</div>
				);
			})}
		</div>
	);
}