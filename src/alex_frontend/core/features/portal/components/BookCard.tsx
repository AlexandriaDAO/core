import React, { useEffect, useState } from "react";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { Book, setSelectedBook } from "../portalSlice";
import BookInfo from "./BookInfo";
import { TriangleAlert } from "lucide-react";
import BookMint from "./BookMint";

interface IBookCardProps {
	book: Book;
}

const BookCard: React.FC<IBookCardProps> = ({ book }: IBookCardProps) => {
	if(!book || !book.manifest) return <></>;

	const dispatch = useAppDispatch();
	const { selectedBook } = useAppSelector((state) => state.portal);
	const [imageLoaded, setImageLoaded] = useState(false);
	const [imageError, setImageError] = useState(false);

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
			<div className="flex-grow flex flex-col justify-between items-stretch relative">
				<BookInfo book={book} />
				{imageLoaded && <BookMint book={book} /> }
				{!imageLoaded && !imageError && (
                    <img
                        className="rounded-lg h-80 object-fill animate-pulse"
                        src="/images/default-cover.jpg"
                        alt="Loading..."
                    />
                )}
                {imageError && (
					<div className="rounded-lg text-muted-foreground h-80 flex justify-center items-center">
						<TriangleAlert size={64} />
					</div>
                )}
                <img
                    className={`rounded-lg h-80 object-fill ${!imageError && imageLoaded ? '' : 'hidden'}`}
                    src={`https://gateway.irys.xyz/${book.manifest}/cover`}
                    alt={book.title}
                    onLoad={() => setImageLoaded(true)}
                    onError={(e) => {
                        console.error("Error loading image for "+book.manifest);
                        setImageError(true);
                        setImageLoaded(true);
                    }}
                />
				<span
					className={`mt-2 font-roboto-condensed font-normal text-base leading-[18px] ${
						selectedBook && selectedBook.manifest === book.manifest
							? "text-muted-foreground"
							: ""
					}`}
				>
					{book.author_first + " " + book.author_last}
				</span>
			</div>
		</div>
	);
};

export default BookCard;
