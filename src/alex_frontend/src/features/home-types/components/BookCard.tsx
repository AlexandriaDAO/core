import { setSelectedBook } from "@/features/home/homeSlice";
import { Book } from "@/features/portal/portalSlice";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import React, { useState } from "react";

interface IBookCardProps {
	book: Book;
}

const BookCard: React.FC<IBookCardProps> = ({ book }: IBookCardProps) => {
	if (!book) return <></>;

	const dispatch = useAppDispatch();
	const { selectedBook } = useAppSelector((state) => state.home);

	const [imageLoaded, setImageLoaded] = useState(false);

	const handleBookClick = (book: Book) => {
		if (selectedBook && selectedBook.manifest === book.manifest) {
			dispatch(setSelectedBook(null));
		} else {
			dispatch(setSelectedBook(book));
		}
	};

	return (
		<div className={`flex flex-col justify-between gap-3 items-start cursor-pointer transition-all duration-500 ${selectedBook && selectedBook.manifest === book.manifest ? 'p-2 bg-black text-white':''}`} onClick={()=>handleBookClick(book)}>
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

			<span className="font-syne font-semibold text-xl leading-7">{book.title}</span>
			<span className={`font-roboto-condensed font-normal text-base leading-[18px]  ${selectedBook && selectedBook.manifest === book.manifest ? 'pb-0.5 text-gray-300':''}`}>{book.author_first + " " + book.author_last}</span>
		</div>
	);
};

export default BookCard;
