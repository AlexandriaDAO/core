import { Dispatch, SetStateAction, useState } from "react";
import { Searches } from "./useReaderState/useContentState";

// Define the shape of the search state
export interface ISearchState {
	searchText: string;
	setSearchText: Dispatch<SetStateAction<string>>;

	searches: Searches;
	setSearches: Dispatch<SetStateAction<Searches>>;
}

export default function useSearchState(): ISearchState {
	const [searchText, setSearchText] = useState("");
	const [searches, setSearches] = useState<Searches>([]);

	return {
		searchText,
		setSearchText,
		searches,
		setSearches,
	};
}
