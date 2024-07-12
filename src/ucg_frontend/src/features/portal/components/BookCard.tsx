import React, { useEffect, useCallback } from "react";
import Epub from "epubjs";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { Book, setSelectedBook, updateBookCover } from "../portalSlice";
import BookInfo from "./BookInfo";

interface IBookCardProps {
	book: Book;
}

const BookCard: React.FC<IBookCardProps> = ({ book }: IBookCardProps) => {
	if (!book) return <></>;

	const dispatch = useAppDispatch();
	const { selectedBook } = useAppSelector((state) => state.portal);

    const getCover = useCallback(async () => {
        if (book.cover !== '') return; // If cover is not empty, we've already fetched it

        try {
            const bookUrl = `https://node1.irys.xyz/${book.transactionId}`;
            const ebook = Epub(bookUrl, { openAs: "epub" });

            const coverUrl = await ebook.coverUrl();

            if(!coverUrl) throw new Error('Cover not available');

            dispatch(updateBookCover({
                key: book.key,
                cover: coverUrl || 'images/default-cover.jpg'
            }));

            // throws error in console.
            ebook.destroy();
        } catch (error) {
            console.error("Error fetching cover URL:", error);
        }
    }, [book.key, book.cover, book.transactionId, dispatch]);

    useEffect(() => {
        getCover();
    }, [getCover]);

	const handleBookClick = (book: Book) => {
		if (selectedBook && selectedBook.key === book.key) {
			dispatch(setSelectedBook(null));
		} else {
			dispatch(setSelectedBook(book));
		}
	};

	return (
		<div
			className={`flex justify-center items-center cursor-pointer transition-all duration-500 p-2 ${
				selectedBook && selectedBook.key === book.key
					? "bg-black text-white"
					: "hover:border hover:border-solid hover:border-gray-300 hover:scale-[98%] hover:shadow-2xl hover:rounded-lg"
			}`}
			onClick={() => handleBookClick(book)}
		>
			<div className="flex flex-col justify-between gap-3 items-start relative">
				<img
					className={`rounded-lg h-80 object-cover ${!book.cover && 'animate-pulse'}`}
                    src={book.cover || 'images/default-cover.jpg'}
                    alt={book.title}
                    onError={() => console.error("Error loading image for "+book)}
				/>
				<span
					className={`font-roboto-condensed font-normal text-base leading-[18px] ${
						selectedBook && selectedBook.key === book.key
							? "pb-0.5 text-gray-300"
							: ""
					}`}
				>
					{book?.author}
				</span>

				<BookInfo book={book} />
			</div>
		</div>
	);
};

export default BookCard;
