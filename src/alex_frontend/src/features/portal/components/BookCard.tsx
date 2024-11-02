import React, { useEffect, useCallback, useState } from "react";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { Book, setSelectedBook } from "../portalSlice";
import BookInfo from "./BookInfo";
import { getCover } from "@/utils/epub";

interface IBookCardProps {
	book: Book;
}

const BookCard: React.FC<IBookCardProps> = ({ book }: IBookCardProps) => {
	if(!book || !book.manifest) return <></>;

	const dispatch = useAppDispatch();
	const { selectedBook } = useAppSelector((state) => state.portal);
	const [imageLoaded, setImageLoaded] = useState(false);

	const handleBookClick = (book: Book) => {
		if (selectedBook && selectedBook.manifest === book.manifest) {
			dispatch(setSelectedBook(null));
		} else {
			dispatch(setSelectedBook(book));
		}
	};

	return (
		<div
			className={`flex justify-center items-center cursor-pointer transition-all duration-500 p-2 ${
				selectedBook && selectedBook.manifest === book.manifest
					? "bg-black text-white"
					: "hover:border hover:border-solid hover:border-gray-300 hover:scale-[98%] hover:shadow-2xl hover:rounded-lg"
			}`}
			onClick={() => handleBookClick(book)}
		>
			<div className="flex-grow flex flex-col justify-between gap-3 items-stretch relative">
				{!imageLoaded && (
                    <img
                        className="rounded-lg h-80 object-fill animate-pulse"
                        src="/images/default-cover.jpg"
                        alt="Loading..."
                    />
                )}
                <img
                    className={`rounded-lg h-80 object-fill ${imageLoaded ? '' : 'hidden'}`}
                    src={`https://gateway.irys.xyz/${book.manifest}/cover`}
                    alt={book.title}
                    onLoad={() => setImageLoaded(true)}
                    onError={() => {
                        console.error("Error loading image for "+book.manifest);
                        setImageLoaded(true);
                    }}
                />
				<span
					className={`font-roboto-condensed font-normal text-base leading-[18px] ${
						selectedBook && selectedBook.manifest === book.manifest
							? "pb-0.5 text-gray-300"
							: ""
					}`}
				>
					{book.author_first + " " + book.author_last}
				</span>

				<BookInfo book={book} />
			</div>
		</div>
	);
};

export default BookCard;
