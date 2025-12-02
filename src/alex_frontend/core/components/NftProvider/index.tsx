import React, { Fragment, createContext, useContext, useState } from "react";
import { Skeleton } from "@/lib/components/skeleton";
import { AlexandrianToken } from "@/features/alexandrian/types";
import { NFTModal } from "@/features/nft";

export interface Modal {
	id: string;
	token?: AlexandrianToken;
}

interface NftContextType {
	safe: boolean;
	modal: Modal | null;
	setModal: (value: Modal | null) => void;
}

const NftContext = createContext<NftContextType | undefined>(undefined);

export const useNftContext = () => {
	const context = useContext(NftContext);
	if (!context) throw new Error("useNftContext must be used within a NftProvider");
	return context;
};

interface NftProviderProps<T> {
	safe: boolean;
	loading: boolean;
	items: T[];
	children: (item: T) => React.ReactNode;
	empty?: React.ReactNode;
}

const NftProvider = <T,>({ safe, loading, items, children, empty }: NftProviderProps<T>) => {
	const [modal, setModal] = useState<Modal|null>(null);

	// Navigation logic using modal state
	const getIndexOf = (id: string) => items.findIndex((item: any) =>
		// from alexandrian Token
		item.arweaveId == id ||
		// form marketplace listing
		item.arweave_id == id ||
		// from permasearch
		item.id == id
	);

	const getCurrentIndex = () => modal ? getIndexOf(modal.id) : -1;

	const goToPrevious = () => {
		if (!modal) return;
		const currentIndex = getCurrentIndex();
		if (currentIndex > 0) {
			const prevItem = items[currentIndex - 1] as any;
			const prevArweaveId = prevItem.arweaveId || prevItem.arweave_id || prevItem.id;
			setModal({ id: prevArweaveId });
		}
	};

	const goToNext = () => {
		if (!modal) return;
		const currentIndex = getCurrentIndex();
		if (currentIndex < items.length - 1) {
			const nextItem = items[currentIndex + 1] as any;
			const nextArweaveId = nextItem.arweaveId || nextItem.arweave_id || nextItem.id;
			setModal({ id: nextArweaveId });
		}
	};

	const canGoPrevious = getCurrentIndex() > 0;
	const canGoNext = getCurrentIndex() < items.length - 1;

	if (items.length === 0) {
		if (loading)
			return (
				<div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
					{[...Array(8)].map((_, i) => (
						<Skeleton key={i} className="h-64 rounded-lg" />
					))}
				</div>
			);

		return (
			<div className="text-center py-12">
				{empty || (
					<p className="text-gray-500 dark:text-gray-400">
						No items found
					</p>
				)}
			</div>
		);
	}

	return (
		<NftContext.Provider value={{ safe, modal, setModal }}>
			<div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 items-center justify-items-center">
				{items.map((item, index) => (
					<Fragment key={index}>{children(item)}</Fragment>
				))}
			</div>

			<NFTModal
				goToPrevious={goToPrevious}
				goToNext={goToNext}
				canGoPrevious={canGoPrevious}
				canGoNext={canGoNext}
			/>
		</NftContext.Provider>
	);
};

export default NftProvider;