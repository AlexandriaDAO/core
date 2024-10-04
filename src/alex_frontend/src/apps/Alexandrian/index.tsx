import React, { useState, useEffect } from "react";
import { fetchTransactions } from "./query";
import ContentList from "./ContentList";
import { Reader } from "@/features/reader";
import { Transaction } from "./types/queries";
import { ReaderProvider } from "@/features/reader/lib/providers/ReaderProvider";

export default function Alexandrian() {
	const [transactions, setTransactions] = useState<Transaction[]>([]);
	const [selectedContent, setSelectedContent] = useState<string | null>(null);
	const [contentType, setContentType] = useState<string>("application/epub+zip");
	const [amount, setAmount] = useState<number>(10);

	useEffect(() => {
		const loadTransactions = async () => {
			const fetchedTransactions = await fetchTransactions(contentType, amount);
			setTransactions(fetchedTransactions);
		};

		loadTransactions();
	}, [contentType, amount]);

	const handleSelectContent = (id: string, type: string) => {
		setSelectedContent(id);
	};

	return (
		<div>
			<div>
				<select value={contentType} onChange={(e) => setContentType(e.target.value)}>
					<option value="application/epub+zip">EPUB</option>
					<option value="image/png">PNG</option>
					<option value="image/jpeg">JPEG</option>
					<option value="image/gif">GIF</option>
				</select>
				<input 
					type="number" 
					value={amount} 
					onChange={(e) => setAmount(Math.min(parseInt(e.target.value), 100))}
					min="1"
					max="100"
				/>
			</div>
			<ContentList 
				transactions={transactions} 
				onSelectContent={handleSelectContent}
				contentType={contentType}
			/>
			{selectedContent && contentType === "application/epub+zip" && (
				<ReaderProvider>
					<Reader bookUrl={`https://arweave.net/${selectedContent}`} />
				</ReaderProvider>
			)}
		</div>
	);
}
