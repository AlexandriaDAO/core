import React from "react";

import {
	BookmarkItemStyle as defaultBookmarkItemStyles,
	type IBookmarkItemStyle,
} from "./style";
import { useReader, useSidebar } from "../../hooks/useReaderContext";
import { BookmarkItemObject } from "../../hooks/useBookmarkState";

type IBookmarkItemProps = {
	bookmarkItem: BookmarkItemObject;
	bookmarkItemStyles?: IBookmarkItemStyle;
};

export const BookmarkItem: React.FC<IBookmarkItemProps> = ({
	bookmarkItem,
	bookmarkItemStyles = defaultBookmarkItemStyles,
}: IBookmarkItemProps) => {
	const { rendition } = useReader();
	const { setSidebar } = useSidebar();

	const handleBookmarkItemClick = (i: BookmarkItemObject) => {
		rendition.current && rendition.current.display(i.location.start.cfi);
		setSidebar(null);
	};

	return (
		<div className="py-3">
			<button
				onClick={() => handleBookmarkItemClick(bookmarkItem)}
				style={bookmarkItemStyles.itemButton}
				className="text-gray-500 hover:text-gray-700 px-0"
			>
				{bookmarkItem.name}
			</button>
			<p className="text-indigo-500">Added on: {bookmarkItem.time}</p>
		</div>
	);
};
