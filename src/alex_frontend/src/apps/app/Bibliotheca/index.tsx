import React, { useEffect, useCallback, useState } from "react";
import AppLayout from "@/layouts/AppLayout";
import Search from "../../modules/ArWeave/search/Search";
import ContentList from "../../modules/ArWeave/display/ContentList";
import ContentRenderer from "../../modules/ArWeave/display/ContentRenderer";
import { useSelector } from 'react-redux';
import { RootState } from '../../../store';
import { natToArweaveId } from "@/utils/id_convert";
import { Principal } from '@dfinity/principal';
import { icrc7 } from '../../../../../declarations/icrc7';
import { useArweaveSearch } from "../../modules/ArWeave/hooks/useArweaveSearch";

export default function Bibliotheca() {
	const principal = useSelector((state: RootState) => state.auth.user);
	const [userTransactionIds, setUserTransactionIds] = useState<string[]>([]);

	const {
		transactions,
		selectedContent,
		isModalOpen,
		isLoading,
		lastTimestamp,
		contentTypes,
		amount,
		handleSelectContent,
		closeModal,
		handleTransactionsUpdate,
		handleInitialSearch,
		setIsLoading,
	} = useArweaveSearch({ mode: 'user', userTransactionIds });

	const fetchUserNFTs = useCallback(async () => {
		if (principal) {
			setIsLoading(true);
			try {
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
	}, [principal, setIsLoading]);

	useEffect(() => {
		fetchUserNFTs();
	}, [fetchUserNFTs]);

	return (
		<AppLayout>
			<div className="relative">
				{principal ? (
					<>
						<Search
							onTransactionsUpdate={handleInitialSearch}
							onLoadingChange={setIsLoading}
							mode="user"
							userTransactionIds={userTransactionIds}
						/>
						{isLoading ? (
							<div>Loading...</div>
						) : transactions.length > 0 ? (
							<>
								<ContentList
									transactions={transactions}
									onSelectContent={handleSelectContent}
									showMintButton={false}
								/>
							</>
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