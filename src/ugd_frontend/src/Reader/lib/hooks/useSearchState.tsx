import { Dispatch, SetStateAction, useState } from "react";
import { ContentList } from "./useReaderState/useContentState";

// Define the shape of the search state
export interface ISearchState {
	searchText: string;
	setSearchText: Dispatch<SetStateAction<string>>;

	searches: ContentList;
	setSearches: Dispatch<SetStateAction<ContentList>>;
}

export default function useSearchState(): ISearchState {
	const [searchText, setSearchText] = useState("");
	const [searches, setSearches] = useState<ContentList>([]);

	return {
		searchText,
		setSearchText,
		searches,
		setSearches,
	};
}
