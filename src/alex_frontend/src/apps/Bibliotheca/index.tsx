import React, { useState, useEffect, useCallback } from "react";
import ContentList from "../helpers/ArWeave/ContentList";
import ContentRenderer from "../helpers/ArWeave/ContentRenderer";
import { Transaction } from "../helpers/ArWeave/types/queries";
import { icrc7 } from '../../../../declarations/icrc7';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { natToArweaveId } from "@/utils/id_convert";
import { Principal } from '@dfinity/principal';
import { fetchTransactions } from './query';

export default function Bibliotheca() {
	const [transactions, setTransactions] = useState<Transaction[]>([]);
	const [selectedContent, setSelectedContent] = useState<string | null>(null);
	const [contentType, setContentType] = useState<string>("application/epub+zip");
	const [isModalOpen, setIsModalOpen] = useState(false);
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

				// Fetch transactions based on the token IDs
				const fetchedTransactions = await fetchTransactions(contentType, tokenIds.length);
				setTransactions(fetchedTransactions);
			} catch (error) {
				console.error("Error fetching user NFTs:", error);
			}
		}
	}, [principal, contentType]);

	useEffect(() => {
		fetchUserNFTs();
	}, [fetchUserNFTs]);

	const handleSelectContent = (id: string, type: string) => {
		setSelectedContent(id);
		setIsModalOpen(true);
	};

	const closeModal = () => {
		setIsModalOpen(false);
		setSelectedContent(null);
	};

	return (
		<div className="relative">
			<h1 className="text-2xl font-bold mb-4">Your NFT Collection</h1>
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
