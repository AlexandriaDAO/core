import React, { useState } from "react";
import Search from "./Search";
import ContentList from "./ContentList";
import ContentRenderer from "./ContentRenderer";
import { Transaction } from "./types/queries";

export default function Alexandrian() {
	const [transactions, setTransactions] = useState<Transaction[]>([]);
	const [selectedContent, setSelectedContent] = useState<string | null>(null);
	const [contentType, setContentType] = useState<string>("application/epub+zip");
	const [isModalOpen, setIsModalOpen] = useState(false);

	const handleSelectContent = (id: string, type: string) => {
		setSelectedContent(id);
		setIsModalOpen(true);
	};

	const handleContentTypeChange = (newContentType: string) => {
		setContentType(newContentType);
		setSelectedContent(null);
		setIsModalOpen(false);
	};

	const closeModal = () => {
		setIsModalOpen(false);
		setSelectedContent(null);
	};

	return (
		<div className="relative">
			<Search 
				onTransactionsUpdate={setTransactions} 
				onContentTypeChange={handleContentTypeChange}
			/>
			<ContentList 
				transactions={transactions} 
				onSelectContent={handleSelectContent}
				contentType={contentType}
			/>
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
							<ContentRenderer contentId={selectedContent} contentType={contentType} />
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
