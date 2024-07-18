import { useState } from "react";
import { getCurLocaleTime } from "../utils";
import { Location } from "epubjs/types/rendition";

export type BookmarkItemObject = {
	name: string;
	location: Location;

	time?: string;
};

export type BookmarksList = Array<BookmarkItemObject>;

export interface addBookmarkFn {
	(bookmark: BookmarkItemObject): void;
}

export interface removeBookmarkFn {
	(location: Location | undefined): void;
}

// Define the shape of the bookmark state
export interface IBookmarkState {
	bookmarks: BookmarksList;
	addBookmark: addBookmarkFn;
	removeBookmark: removeBookmarkFn;
}

export default function useBookmarkState(): IBookmarkState {
	const [bookmarks, setBookmarks] = useState<BookmarksList>([]);

	const addBookmark: addBookmarkFn = (bookmark: BookmarkItemObject) => {
		if (!bookmark.time) bookmark.time = getCurLocaleTime();

		setBookmarks([...bookmarks, bookmark]);
	};

	const removeBookmark: removeBookmarkFn = (
		location: Location | undefined
	) => {
		const bookmarksFilter = bookmarks.filter(
			(bookmark) => bookmark.location.start.cfi !== location?.start.cfi
		);
		setBookmarks(bookmarksFilter);
	};

	return {
		bookmarks,
		addBookmark,
		removeBookmark,
	};
}
