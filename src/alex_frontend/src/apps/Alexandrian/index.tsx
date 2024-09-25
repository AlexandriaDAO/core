import React, { useEffect, useState } from "react";
import MainLayout from "@/layouts/MainLayout";
import { Reader } from "@/features/reader";
import { ReaderProvider } from "@/features/reader/lib/providers/ReaderProvider";
import { fetchTransactions, Transaction } from "./query";
import ContentList from "./ContentList";
import { getCover } from "@/utils/epub";

function Alexandrian() {
	const [transactions, setTransactions] = useState<Transaction[]>([]);
	const [selectedEpub, setSelectedEpub] = useState<string | null>(null);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [coverUrl, setCoverUrl] = useState<string | null>(null);

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

	const handleSelectEpub = async (id: string) => {
		setSelectedEpub(id);
		setIsModalOpen(true);
		try {
			const cover = await getCover(`https://arweave.net/${id}`);
			setCoverUrl(cover);
		} catch (error) {
			console.error("Error fetching cover:", error);
			setCoverUrl(null);
		}
	};

	const closeModal = () => {
		setIsModalOpen(false);
		setSelectedEpub(null);
		setCoverUrl(null);
	};

	return (
		<MainLayout>
			<div className="w-full h-full bg-black text-white">
				<ContentList
					transactions={transactions}
					onSelectEpub={handleSelectEpub}
				/>
				{isModalOpen && selectedEpub && (
					<div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
						<div className="bg-white rounded-lg p-4 w-full h-full md:w-3/4 md:h-3/4 overflow-hidden">
							<div className="flex justify-end mb-2">
								<button
									onClick={closeModal}
									className="text-black hover:text-gray-700"
								>
									Close
								</button>
							</div>
							<div className="h-full overflow-auto flex">
									<ReaderProvider>
										<Reader bookUrl={`https://arweave.net/${selectedEpub}`} />
									</ReaderProvider>
							</div>
						</div>
					</div>
				)}
			</div>
		</MainLayout>
	);
}

export default Alexandrian;
