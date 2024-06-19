import React, { ReactNode } from "react";
import { ReaderContext } from "../contexts/ReaderContext";
import useAnnotationState from "../hooks/useAnnotationState";
import useBookmarkState from "../hooks/useBookmarkState";
import { useReaderState } from "../hooks/useReaderState/index";
import { useContentState } from "../hooks/useReaderState/useContentState";
import useSearch from "../hooks/useSearchState";
import useSidebar from "../hooks/useSidebarState";
import useSetting from "../hooks/useSettingState";
import useCardList from "../hooks/useCardListState";

// Define the props for the provider
interface ReaderProviderProps {
	children: ReactNode;
}

export const ReaderProvider: React.FC<ReaderProviderProps> = ({ children }) => {
	const readerState = useReaderState();
	const contentState = useContentState();

	const annotationState = useAnnotationState();
	const bookmarkState = useBookmarkState();
	const searchState = useSearch();
	const sidebarState = useSidebar();

	const settingState = useSetting();
	const cardListState = useCardList();

	return (
		<ReaderContext.Provider
			value={{
				readerState,
				contentState,
				annotationState,
				bookmarkState,
				searchState,
				sidebarState,
				settingState,
				cardListState
			}}
		>
			{children}
		</ReaderContext.Provider>
	);
};
