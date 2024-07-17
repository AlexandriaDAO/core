import { Dispatch, SetStateAction, useState } from "react";

// Define the shape of the card list state
export interface ICardListState {
	showCardList: boolean;
	setShowCardList: Dispatch<SetStateAction<boolean>>;
}

export default function useCardListState(): ICardListState {
	const [showCardList, setShowCardList] = useState<boolean>(false);

	return {
		showCardList,
		setShowCardList,
	};
}
