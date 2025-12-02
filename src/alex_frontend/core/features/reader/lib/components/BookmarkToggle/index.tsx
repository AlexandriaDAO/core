import React from "react";
import {
	BookmarkToggleStyle as defaultBookmarkToggleStyles,
	type IBookmarkToggleStyle,
} from "./style";
import { useBookmark, useReader } from "../../hooks/useReaderContext";
import { BookmarkCheck, BookmarkPlus } from "lucide-react";


interface BookmarkToggleProps {
	bookmarkToggleStyles?: IBookmarkToggleStyle;
}

const BookmarkToggle: React.FC<BookmarkToggleProps> = ({
	bookmarkToggleStyles = defaultBookmarkToggleStyles,
}) => {
	const { book, currentLocation } = useReader();

	const { addBookmark, removeBookmark, bookmarks } = useBookmark();

	const isBookmarkAdded = bookmarks.find((bookmark) => {
		// bookmark.location == currentLocation
		return bookmark.location.start.cfi === currentLocation?.start.cfi;
	});

	const onAddBookmark = async () => {
		if (book && currentLocation) {
			let name = "bookmark";
			const spineItem = book.spine.get(currentLocation.start.cfi);

			if (spineItem.index in book.navigation.toc) {
				const tocItem = book.navigation.toc[spineItem.index];
				name = tocItem.label;
			} else {
				name = currentLocation.start.cfi;
			}

			addBookmark({
				name,
				location: currentLocation,
			});
			console.log("Bookmark Added");
		} else {
			console.error("Bookmark not stored, Book not opened");
		}
	};

	const onRemoveBookmark = () => {
		removeBookmark(currentLocation);
		console.log("Remove bookmark success");
	};

	return (
		<>
			{isBookmarkAdded ? (
				<BookmarkCheck
					onClick={onRemoveBookmark}
					size={30}
					color="#F6F930"
					className={`cursor-pointer border border-solid border-brightyellow p-1 rounded-md`}
				/>
			) : (
				<BookmarkPlus
					onClick={onAddBookmark}
					size={30}
					color="#8E8E8E"
					className={`cursor-pointer border border-solid border-[#8E8E8E] p-1 rounded-md`}
				/>
			)}


		</>
	);
};

export default BookmarkToggle;
