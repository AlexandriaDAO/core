import React, { useRef, useEffect } from "react";
import BookCard from "./components/BookCard";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import BookModal from "@/components/BookModal";
import { LoaderCircle } from "lucide-react";
import fetchMyBooks from "./thunks/fetchMyBooks";
import useNftManager from "@/hooks/actors/useNftManager";

const ITEMS_PER_ROW = 6;

const Collection: React.FC = () => {
	const {actor} = useNftManager();
	const dispatch = useAppDispatch();
	const bookModalRef = useRef<HTMLDivElement>(null);

	const { user } = useAppSelector((state) => state.auth);
	const { books, selectedBook, loading, error } = useAppSelector(
		(state) => state.collection
	);

	useEffect(() => {
		if(!actor || !user) return;
		dispatch(fetchMyBooks({actor, user}));
	}, [user, dispatch]);

	if(loading) return (
		<div className="flex justify-start items-center gap-1">
			<span>Loading Collection</span>
			<LoaderCircle size={20} className="animate animate-spin" />
		</div>
	)

	if(error) return(
		<div className="flex flex-col gap-2 justify-start items-start font-roboto-condensed text-base leading-[18px] text-black font-normal">
			<span>Error loading books</span>
			<span>{error}</span>
		</div>
	)

	if(books.length <= 0) return (
		<div className="flex flex-col items-center justify-start p-8 rounded-xl border border-ring">
			<h2 className="font-syne text-2xl font-bold mb-4">
				Empty Collection
			</h2>
			<p className="font-roboto-condensed text-lg">
				Please visit our Shop Page to add assets to your collection.
			</p>
		</div>
	)


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
							// ref={bookModalRef}
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
