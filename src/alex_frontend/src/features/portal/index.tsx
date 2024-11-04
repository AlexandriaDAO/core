import React, { useRef, useEffect, useState } from "react";
import { Book, setBooks } from "./portalSlice";
import BookCard from "./components/BookCard";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import BookModal from "@/components/BookModal";
import { LoaderCircle } from "lucide-react";
import { Button } from "@/lib/components/button";
import fetchBooks from "./thunks/fetchBooks";

const ITEMS_PER_ROW = 6;

const Portal: React.FC = () => {
	const dispatch = useAppDispatch();
	const { types, categories, languages, eras } = useAppSelector(
		(state) => state.portalFilter
	);
	const { books, selectedBook, searchTerm, cursor, load, loading, error } = useAppSelector(
		(state) => state.portal
	);
	const bookModalRef = useRef<HTMLDivElement>(null);

	// State to hold filtered books
    const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);

	useEffect(() => {
		dispatch(fetchBooks());
		// return ()=>{
		// 	dispatch(setBooks([]))
		// }
    }, []);

	useEffect(() => {

        // Filter books based on searchTerm, eras, languages, etc.
        const newFilteredBooks = books.filter((book:Book) => {
            // if search is empty, allow all books
            const matchesTitle = searchTerm.trim() === '' || book.title.toLowerCase().includes(searchTerm.toLowerCase());

            // if type is empty allow books with any type
            const matchesType = types.length === 0 || types.some(type => book.type === type.id);

			// if categories is empty allow books with any category
			const matchesCategory =
				categories.length === 0 || (
					Array.isArray(book.categories) &&
					book.categories.length > 0 &&
					book.categories.some(bookCategory => categories.some(category => category.id === bookCategory))
				);

			// if eras is empty allow books with any era
			const matchesEra = eras.length === 0 || eras.some(era => book.era === era.value);

			// if languages is empty allow books with any language
			const matchesLanguage = languages.length === 0 || languages.some(lang => book.language === lang.code);

            // Return true if any of the conditions match
            return matchesTitle && matchesType && matchesCategory && matchesEra && matchesLanguage;
        });

        setFilteredBooks(newFilteredBooks);
    }, [books, searchTerm, types, categories, languages, eras]); // Dependencies include all relevant filter criteria

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
			{books.length > 0 && load && (
				<Button
					className="self-center"
					onClick={()=>dispatch(fetchBooks())}
					disabled={loading}
					scale="sm">
					{loading ? <div className="flex gap-2 justify-center items-center">
						<LoaderCircle size={18} className="animate-spin" />
						<span>Loading</span>
					</div> : 'Show More'}
				</Button>
			)}
		</div>
	);
};

export default Portal;
