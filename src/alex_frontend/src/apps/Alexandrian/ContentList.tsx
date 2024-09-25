import React, { useState, useCallback, useRef } from "react";
import { Transaction } from "./query";
import { getCover } from "@/utils/epub";

interface ContentListProps {
  transactions: Transaction[];
  onSelectEpub: (id: string) => void;
}

export default function ContentList({ transactions, onSelectEpub }: ContentListProps) {
	const [hoveredId, setHoveredId] = useState<string | null>(null);
	const [coverUrls, setCoverUrls] = useState<Record<string, string>>({});
	const hoverTimerRef = useRef<NodeJS.Timeout | null>(null);

	const handleMouseEnter = useCallback((id: string) => {
		// Clear any existing timer
		if (hoverTimerRef.current) {
			clearTimeout(hoverTimerRef.current);
		}

		// Set a new timer with a 300ms delay
		hoverTimerRef.current = setTimeout(() => {
			setHoveredId(id);
			if (!coverUrls[id]) {
				getCover(`https://arweave.net/${id}`)
					.then(url => {
						setCoverUrls(prev => ({ ...prev, [id]: url || "/images/default-cover.jpg" }));
					})
					.catch(error => {
						console.error("Error loading cover for " + id);
						setCoverUrls(prev => ({ ...prev, [id]: "/images/default-cover.jpg" }));
					});
			}
		}, 300);
	}, [coverUrls]);

	const handleMouseLeave = () => {
		if (hoverTimerRef.current) {
			clearTimeout(hoverTimerRef.current);
		}
		setHoveredId(null);
	};

	return (
		<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
			{transactions.map((transaction) => {
				const title = transaction.tags.find((tag) => tag.name === "title")?.value || "Untitled";
				const author = transaction.tags.find((tag) => tag.name === "author")?.value || "Unknown Author";
				const coverUrl = coverUrls[transaction.id] || "/images/default-cover.jpg";

				return (
					<div
						key={transaction.id}
						className="aspect-square border border-white rounded-lg p-4 cursor-pointer hover:bg-gray-900 flex flex-col items-center justify-center text-center relative overflow-hidden"
						onClick={() => onSelectEpub(transaction.id)}
						onMouseEnter={() => handleMouseEnter(transaction.id)}
						onMouseLeave={handleMouseLeave}
					>
						<h3 className="text-lg font-semibold text-white">{title}</h3>
						<p className="text-sm text-gray-400">{author}</p>
						<p className="text-xs text-gray-500 mt-2">
							{new Date(transaction.block.timestamp * 1000).toLocaleDateString()}
						</p>
						<div 
							className={`absolute inset-0 flex items-center justify-center bg-black bg-opacity-75 transition-opacity duration-500 ${
								hoveredId === transaction.id ? 'opacity-100' : 'opacity-0'
							}`}
						>
							<img 
								src={coverUrl} 
								alt="Book cover" 
								className="max-w-full max-h-full object-contain"
								onError={(e) => {
									e.currentTarget.src = "/images/default-cover.jpg";
								}}
							/>
						</div>
					</div>
				);
			})}
		</div>
	);
}