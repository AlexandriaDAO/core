import React from "react";
import {
	BookmarksStyle as defaultBookmarksStyles,
	type IBookmarksStyle,
} from "./style";
import { useBookmark } from "../../lib/hooks/useReaderContext";
import { BookmarkItem } from "../../lib/components/BookmarkItem";

interface IBookmarksProps {
	bookmarksStyle?: IBookmarksStyle;
}

export const Bookmarks: React.FC<IBookmarksProps> = ({
	bookmarksStyle = defaultBookmarksStyles,
}) => {
	const { bookmarks } = useBookmark();

	return (
		<div className="h-full overflow-hidden flex flex-col">
			<p className="font-semibold text-lg text-center py-2">Bookmarks</p>
			<div className="p-4 flex-grow overflow-auto">
				{bookmarks?.map((item, i) => (
					<BookmarkItem key={i} bookmarkItem={item} />
				))}
				{bookmarks.length === 0 && <div>No Bookmark found</div>}
			</div>
		</div>
	);
};
