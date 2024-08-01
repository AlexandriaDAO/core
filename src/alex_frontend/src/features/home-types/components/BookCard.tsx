import { Book } from "@/components/BookModal";
import { setSelectedBook } from "@/features/home/homeSlice";
import { updateBookCover } from "@/features/portal/portalSlice";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { getCover } from "@/utils/epub";
import React, { useEffect, useCallback } from "react";

interface IBookCardProps {
	book: Book;
}

const BookCard: React.FC<IBookCardProps> = ({ book }: IBookCardProps) => {
	if (!book) return <></>;

	const dispatch = useAppDispatch();
	const { selectedBook } = useAppSelector((state) => state.home);

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
		<div className={`flex flex-col justify-between gap-3 items-start cursor-pointer transition-all duration-500 ${selectedBook && selectedBook.id === book.id ? 'p-2 bg-black text-white':''}`} onClick={()=>handleBookClick(book)}>
			<img
				className={`rounded-lg h-80 object-fill ${!book.cover && 'animate-pulse'}`}
				src={book.cover || 'images/default-cover.jpg'}
				alt={book.title}
			/>
			<span className="font-syne font-semibold text-xl leading-7">{book.title}</span>
			<span className={`font-roboto-condensed font-normal text-base leading-[18px]  ${selectedBook && selectedBook.id === book.id ? 'pb-0.5 text-gray-300':''}`}>{book.author}</span>
		</div>
	);
};

export default BookCard;
