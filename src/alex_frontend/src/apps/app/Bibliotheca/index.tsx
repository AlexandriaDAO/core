import React, { useState, useEffect, useCallback } from "react";
import AppLayout from "@/layouts/AppLayout";
import Search from "../../modules/ArWeave/Search";
import ContentList from "../../modules/ArWeave/ContentList";
import ContentRenderer from "../../modules/ArWeave/ContentRenderer";
import { Transaction } from "../../modules/ArWeave/types/queries";
import { useSelector } from 'react-redux';
import { RootState } from '../../../store';
import { natToArweaveId } from "@/utils/id_convert";
import { Principal } from '@dfinity/principal';
import { icrc7 } from '../../../../../declarations/icrc7';

export default function Bibliotheca() {
	const [transactions, setTransactions] = useState<Transaction[]>([]);
	const [selectedContent, setSelectedContent] = useState<{ id: string, type: string } | null>(null);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const principal = useSelector((state: RootState) => state.auth.user);
	const [userTransactionIds, setUserTransactionIds] = useState<string[]>([]);

	const fetchUserNFTs = useCallback(async () => {
		if (principal) {
			setIsLoading(true);
			try {
				console.log("Fetching user NFTs for principal:", principal);
				const tokenIds = await icrc7.icrc7_tokens_of(
					{
						owner: Principal.fromText(principal),
						subaccount: [],
					},
					[],
					[]
				);

				const arweaveIds = tokenIds.map(id => natToArweaveId(id));
				
				setUserTransactionIds(arweaveIds);
			} catch (error) {
				console.error("Error fetching user NFTs:", error);
			} finally {
				setIsLoading(false);
			}
		}
	}, [principal]);

	useEffect(() => {
		fetchUserNFTs();
	}, [fetchUserNFTs]);

	const handleLoadingChange = (loading: boolean) => {
		setIsLoading(loading);
	};

	const handleSelectContent = (id: string, type: string) => {
		setSelectedContent({ id, type });
		setIsModalOpen(true);
	};

	const closeModal = () => {
		setIsModalOpen(false);
		setSelectedContent(null);
	};

	const handleTransactionsUpdate = (newTransactions: Transaction[]) => {
		console.log("Transactions updated:", newTransactions);
		setTransactions(newTransactions);
	};

	return (
		<AppLayout>
			<div className="relative">
				{principal ? (
					<>
						<Search
							onTransactionsUpdate={handleTransactionsUpdate}
							onLoadingChange={handleLoadingChange}
							mode="user"
							userTransactionIds={userTransactionIds}
						/>
						{isLoading ? (
							<div>Loading...</div>
						) : transactions.length > 0 ? (
							<ContentList
								transactions={transactions}
								onSelectContent={handleSelectContent}
								showMintButton={false}
							/>
						) : (
							<div>No NFTs match the current filters</div>
						)}
					</>
				) : (
					<div>Please connect your wallet to view your library.</div>
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