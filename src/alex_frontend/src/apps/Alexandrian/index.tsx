import React, { useEffect, useState } from "react";
import MainLayout from "@/layouts/MainLayout";
import { Reader } from "@/features/reader";
import { ReaderProvider } from "@/features/reader/lib/providers/ReaderProvider";
import ArweaveInfo from "./ArweaveInfo";
import { fetchTransactions, Transaction } from "./query";
import ContentList from "./ContentList";

function Alexandrian() {
	const [transactions, setTransactions] = useState<Transaction[]>([]);
	const [selectedEpub, setSelectedEpub] = useState<string | null>(null);

	useEffect(() => {
		const loadTransactions = async () => {
			try {
				const fetchedTransactions = await fetchTransactions();
				console.log("Fetched transactions:", fetchedTransactions);
				setTransactions(fetchedTransactions);
			} catch (error) {
				console.error("Error loading transactions:", error);
			}
		};

		loadTransactions();
	}, []);

	console.log("Current transactions state:", transactions);

	return (
		<MainLayout>
			<div className="w-full h-full">
				<ArweaveInfo />
				{selectedEpub ? (
					<ReaderProvider>
						<Reader bookUrl={`https://arweave.net/${selectedEpub}`} />
					</ReaderProvider>
				) : (
					<ContentList
						transactions={transactions}
						onSelectEpub={(id) => setSelectedEpub(id)}
					/>
				)}
			</div>
		</MainLayout>
	);
}

export default Alexandrian;
