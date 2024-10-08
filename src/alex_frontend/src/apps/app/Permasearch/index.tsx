import React, { useState } from "react";
import AppLayout from "@/layouts/AppLayout";
import Search from "../../modules/ArWeave/Search";
import ContentList from "../../modules/ArWeave/ContentList";
import ContentRenderer from "../../modules/ArWeave/ContentRenderer";
import LoadMore from "../../modules/ArWeave/LoadMore";
import { Transaction } from "../../modules/ArWeave/types/queries";

export default function Permasearch() {
	const [transactions, setTransactions] = useState<Transaction[]>([]);
	const [selectedContent, setSelectedContent] = useState<{ id: string, type: string } | null>(null);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [lastTimestamp, setLastTimestamp] = useState<number>(0);
	const [contentTypes, setContentTypes] = useState<string[]>([]);
	const [amount, setAmount] = useState<number>(12);
	const [ownerFilter, setOwnerFilter] = useState<string>("");
	const [minBlock, setMinBlock] = useState<number | undefined>();
	const [maxBlock, setMaxBlock] = useState<number | undefined>();

	const handleSelectContent = (id: string, type: string) => {
		setSelectedContent({ id, type });
		setIsModalOpen(true);
	};

	const closeModal = () => {
		setIsModalOpen(false);
		setSelectedContent(null);
	};

	const handleTransactionsUpdate = (newTransactions: Transaction[], timestamp: number) => {
		setTransactions(prevTransactions => [...prevTransactions, ...newTransactions]);
		setLastTimestamp(timestamp);
	};

	const handleInitialSearch = (newTransactions: Transaction[], timestamp: number, newContentTypes: string[], newAmount: number, newOwnerFilter: string, newMinBlock?: number, newMaxBlock?: number) => {
		setTransactions(newTransactions);
		setLastTimestamp(timestamp);
		setContentTypes(newContentTypes);
		setAmount(newAmount);
		setOwnerFilter(newOwnerFilter);
		setMinBlock(newMinBlock);
		setMaxBlock(newMaxBlock);
	};

	return (
		<AppLayout>
			<div className="relative">
				<Search 
					onTransactionsUpdate={handleInitialSearch}
					onLoadingChange={setIsLoading}
					mode="general"
				/>
				{isLoading ? (
					<div>Loading...</div>
				) : (
					<>
						<ContentList 
							transactions={transactions} 
							onSelectContent={handleSelectContent}
							showMintButton={true}
						/>
						{transactions.length > 0 && (
							<LoadMore
								onTransactionsUpdate={handleTransactionsUpdate}
								contentTypes={contentTypes}
								amount={amount}
								lastTimestamp={lastTimestamp}
								ownerFilter={ownerFilter}
								minBlock={minBlock}
								maxBlock={maxBlock}
								mode="general"
							/>
						)}
					</>
				)}
				{isModalOpen && selectedContent && (
					<div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
						<div className="bg-gray-800 p-4 rounded-lg w-11/12 h-5/6 relative">
							<button 
								onClick={closeModal}
								className="absolute top-2 right-2 text-white hover:text-gray-300 z-10"
							>
								Close
							</button>
							<div className="h-full overflow-auto">
								<ContentRenderer contentId={selectedContent.id} contentType={selectedContent.type} />
							</div>
						</div>
					</div>
				)}
			</div>
		</AppLayout>
	);
}
