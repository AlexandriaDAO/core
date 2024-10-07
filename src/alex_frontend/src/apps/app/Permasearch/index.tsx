import React, { useState } from "react";
import AppLayout from "@/layouts/AppLayout";
import Search from "../../modules/ArWeave/Search";
import ContentList from "../../modules/ArWeave/ContentList";
import ContentRenderer from "../../modules/ArWeave/ContentRenderer";
import { Transaction } from "../../modules/ArWeave/types/queries";

export default function Permasearch() {
	const [transactions, setTransactions] = useState<Transaction[]>([]);
	const [selectedContent, setSelectedContent] = useState<{ id: string, type: string } | null>(null);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isLoading, setIsLoading] = useState<boolean>(false);

	const handleSelectContent = (id: string, type: string) => {
		setSelectedContent({ id, type });
		setIsModalOpen(true);
	};

	const closeModal = () => {
		setIsModalOpen(false);
		setSelectedContent(null);
	};

	const handleTransactionsUpdate = (newTransactions: Transaction[]) => {
		setTransactions(newTransactions);
	};

	return (
		<AppLayout>
			<div className="relative">
				<Search 
					onTransactionsUpdate={handleTransactionsUpdate}
					onLoadingChange={setIsLoading}
					mode="general"
				/>
				{isLoading ? (
					<div>Loading...</div>
				) : (
					<ContentList 
						transactions={transactions} 
						onSelectContent={handleSelectContent}
						showMintButton={true}
					/>
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
