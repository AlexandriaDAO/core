import { createContext } from "react";
import { IAnnotationState } from "../hooks/useAnnotationState";
import { IBookmarkState } from "../hooks/useBookmarkState";
import { IReaderState } from "../hooks/useReaderState";
import { IContentState } from "../hooks/useReaderState/useContentState";
import { ISearchState } from "../hooks/useSearchState";
import { ISidebarState } from "../hooks/useSidebarState";
import { ISettingState } from "../hooks/useSettingState";
import { ICardListState } from "../hooks/useCardListState";

// Define the shape of the context data
export interface ReaderContextData {
	readerState: IReaderState;
	contentState: IContentState;

	annotationState: IAnnotationState;
	bookmarkState: IBookmarkState;
	searchState: ISearchState;
	sidebarState: ISidebarState;
	settingState: ISettingState
	cardListState: ICardListState
}

// Create the context
export const ReaderContext = createContext<ReaderContextData | undefined>(
	undefined
);
