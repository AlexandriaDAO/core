import React, { useRef, useEffect } from "react";
import BookCard from "./components/BookCard";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import BookModal from "@/components/BookModal";
import { LoaderCircle } from "lucide-react";

const ITEMS_PER_ROW = 6;

const Collection: React.FC = () => {

	const { books, selectedBook, loading, error } = useAppSelector(
		(state) => state.collection
	);
	const bookModalRef = useRef<HTMLDivElement>(null);


	const renderBookModal = (index: number) => {
		if (selectedBook) {
			const selectedBookIndex = books.findIndex(
				(b) => b.manifest === selectedBook.manifest
			);
			const isLastItem = index === books.length - 1;
			const isEndOfRow = (index + 1) % ITEMS_PER_ROW === 0;

			if (isLastItem || isEndOfRow) {
				const rowStart = Math.floor(selectedBookIndex / ITEMS_PER_ROW) * ITEMS_PER_ROW;
				const rowEnd = Math.min(rowStart + (ITEMS_PER_ROW - 1), books.length - 1);

				if (index >= rowStart && index <= rowEnd) {
					return (
						<div
							key="book-modal"
							ref={bookModalRef}
							className={`col-start-1 col-end-${ITEMS_PER_ROW + 1}`}
							style={{
								gridColumnStart: 1,
								gridColumnEnd: ITEMS_PER_ROW + 1
							}}
						>
							<BookModal book={selectedBook} />
						</div>
					);
				}
			}
		}
		return null;
	};

	return (
		<div className="flex-grow flex flex-col items-start">
			{loading ?
				<div className="flex gap-1 justify-start items-center font-roboto-condensed text-base leading-[18px] text-black font-normal">
					<span>Loading Books</span>
					<LoaderCircle
						size={14}
						className="animate animate-spin"
					/>
				</div> :
				books.length <= 0 && <div className="col-span-6 font-roboto-condensed font-normal text-base flex items-center justify-between p-2 border-b last:border-0 text-black">
					No Results to show
				</div>
			}

			{error && <div className="flex flex-col gap-2 justify-start items-start font-roboto-condensed text-base leading-[18px] text-black font-normal">
				<span>Error loading books</span>
				<span>{error}</span>
			</div>}
			<div
				className="w-full grid py-4 gap-4"
				style={{
					gridTemplateColumns: `repeat(${ITEMS_PER_ROW}, minmax(0, 1fr))`,
					gridTemplateRows: `repeat(${Math.ceil(books.length/ITEMS_PER_ROW)}, minmax(0, auto))`,
					// grid-cols-${ITEMS_PER_ROW} grid-rows-[repeat(${books.length%ITEMS_PER_ROW}, minmax(0,auto))]
				}}
				>
				{books.map((book, index) => (
					<React.Fragment key={book.manifest}>
						<BookCard book={book} />
						{renderBookModal(index)}
					</React.Fragment>
				))}
			</div>
		</div>
	);
};

export default Collection;
