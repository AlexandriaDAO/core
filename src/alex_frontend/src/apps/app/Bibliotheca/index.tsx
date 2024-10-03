import React, { useState, useEffect, useCallback } from "react";
import AppLayout from "@/layouts/AppLayout";
import ContentList from "../../modules/ArWeave/ContentList";
import ContentRenderer from "../../modules/ArWeave/ContentRenderer";
import { Transaction } from "../../modules/ArWeave/types/queries";
import { icrc7 } from '../../../../../declarations/icrc7';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store';
import { natToArweaveId } from "@/utils/id_convert";
import { Principal } from '@dfinity/principal';
import { fetchTransactionsByIds } from '../../modules/ArWeave/ArweaveQueries';
import Search from "../../modules/ArWeave/Search";

export default function Bibliotheca() {
	const [transactions, setTransactions] = useState<Transaction[]>([]);
	const [arweaveIds, setArweaveIds] = useState<string[]>([]);
	const [selectedContent, setSelectedContent] = useState<{ id: string, type: string } | null>(null);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [contentType, setContentType] = useState<string>("application/epub+zip");
	const principal = useSelector((state: RootState) => state.auth.user);

	const fetchUserNFTs = useCallback(async () => {
		if (principal) {
			try {
				const tokenIds = await icrc7.icrc7_tokens_of(
					{
						owner: Principal.fromText(principal),
						subaccount: [], // Empty array represents null in Candid
					},
					[], // Empty array represents null in Candid
					[] // Empty array represents null in Candid
				);

				console.log("Token IDs:", tokenIds);

				// Convert NFT IDs to Arweave transaction IDs
				const newArweaveIds = tokenIds.map(id => natToArweaveId(id));
				console.log("Arweave Transaction IDs:", newArweaveIds);
				setArweaveIds(newArweaveIds);

				// Fetch transactions based on the Arweave transaction IDs
				const fetchedTransactions = await fetchTransactionsByIds(newArweaveIds);
				console.log("Fetched Transactions:", fetchedTransactions);
				setTransactions(fetchedTransactions);
			} catch (error) {
				console.error("Error fetching user NFTs:", error);
			}
		}
	}, [principal]);

	useEffect(() => {
		fetchUserNFTs();
	}, [fetchUserNFTs]);

	const handleSelectContent = (id: string, type: string) => {
		setSelectedContent({ id, type });
		setIsModalOpen(true);
	};

	const closeModal = () => {
		setIsModalOpen(false);
		setSelectedContent(null);
	};

	const handleContentTypeChange = (newContentType: string) => {
		setContentType(newContentType);
	};

	return (
		<AppLayout>
			<div className="relative">
				<h1 className="text-2xl font-bold mb-4">Your NFT Collection</h1>
				<Search 
					onTransactionsUpdate={setTransactions}
					onContentTypeChange={handleContentTypeChange}
					mode="user"
					userTransactionIds={arweaveIds}
					initialSearch={true}
				/>
				<ContentList 
					transactions={transactions} 
					onSelectContent={handleSelectContent}
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
								<ContentRenderer contentId={selectedContent.id} contentType={selectedContent.type} />
							</div>
						</div>
					</div>
				)}
			</div>
		</AppLayout>
	);
}
