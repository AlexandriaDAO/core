import React, { useEffect, useCallback } from "react";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { setSelectedBook, updateBookCover } from "../portalSlice";
import BookInfo from "./BookInfo";
import { getCover } from "@/utils/epub";
import { Book } from "@/components/BookModal";

interface IBookCardProps {
	book: Book;
}

const BookCard: React.FC<IBookCardProps> = ({ book }: IBookCardProps) => {
	if (!book) return <></>;

	const dispatch = useAppDispatch();
	const { selectedBook } = useAppSelector((state) => state.portal);

    const extractCover = useCallback(async () => {
        if (book.cover !== '') return; // If cover is not empty, we've already fetched it

        try {
            const coverUrl = await getCover(`https://gateway.irys.xyz/${book.id}`);

			if(!coverUrl) throw new Error('Cover not available');

            dispatch(updateBookCover({
                id: book.id,
                cover: coverUrl || 'images/default-cover.jpg'
            }));

        } catch (error) {
            console.error("Error fetching cover URL:", error);
        }
    }, [book.id, book.cover, dispatch]);

    useEffect(() => {
        extractCover();
    }, [extractCover]);

	const handleBookClick = (book: Book) => {
		if (selectedBook && selectedBook.id === book.id) {
			dispatch(setSelectedBook(null));
		} else {
			dispatch(setSelectedBook(book));
		}
	};

	return (
		<div
			className={`flex justify-center items-center cursor-pointer transition-all duration-500 p-2 ${
				selectedBook && selectedBook.id === book.id
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
						selectedBook && selectedBook.id === book.id
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
