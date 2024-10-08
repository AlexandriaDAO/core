import React from "react";
import AppLayout from "@/layouts/AppLayout";
import Search from "../../modules/ArWeave/search/Search";
import ContentList from "../../modules/ArWeave/display/ContentList";
import ContentRenderer from "../../modules/ArWeave/display/ContentRenderer";
import { useArweaveSearch } from "../../modules/ArWeave/hooks/useArweaveSearch";

export default function Permasearch() {
	const {
		transactions,
		selectedContent,
		isModalOpen,
		isLoading,
		lastTimestamp,
		contentTypes,
		amount,
		ownerFilter,
		minBlock,
		maxBlock,
		handleSelectContent,
		closeModal,
		handleTransactionsUpdate,
		handleInitialSearch,
		setIsLoading,
	} = useArweaveSearch({ mode: 'general' });

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
