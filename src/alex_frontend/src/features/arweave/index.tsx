import React, { useState } from "react";
import { useSelector, useDispatch } from 'react-redux';
import AppLayout from "@/layouts/AppLayout";
import SearchForm from "./components/SearchForm";
import ContentList from "./components/ContentList";
import ContentRenderer from "./components/ContentRenderer";
import { RootState } from '@/store';
import { useHandleSearch } from './hooks/useSearchHandlers';
import { setSelectedContent } from './redux/arweaveSlice';

export default function Permasearch() {
	const dispatch = useDispatch();
	const { transactions, isLoading, selectedContent } = useSelector((state: RootState) => state.arweave);
	const [isModalOpen, setIsModalOpen] = useState(false);

	const { handleSearch } = useHandleSearch();

	const handleSelectContent = (id: string, type: string) => {
		dispatch(setSelectedContent({ id, type }));
		setIsModalOpen(true);
	};

	const closeModal = () => {
		setIsModalOpen(false);
		dispatch(setSelectedContent(null));
	};

	return (
		<AppLayout>
			<div className="relative">
				<SearchForm 
					mode="general" 
					onSearch={handleSearch}
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
