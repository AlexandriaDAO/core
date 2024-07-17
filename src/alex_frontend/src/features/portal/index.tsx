import React, { useRef, useEffect, useState } from "react";
import { Pagination, PaginationProps } from "antd";
import { Book, setCurrentPage } from "./portalSlice";
import BookModal from "./components/BookModal";
import BookCard from "./components/BookCard";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import fetchBooks from "./thunks/fetchBooks";

const ITEMS_PER_PAGE = 12;

const Portal: React.FC = () => {
	const dispatch = useAppDispatch();
	const { types, languages, categories, years, visible } = useAppSelector(
		(state) => state.portalFilter
	);
	const { books, selectedBook, currentPage, searchTerm } = useAppSelector(
		(state) => state.portal
	);
	const bookModalRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		dispatch(fetchBooks());
	}, [dispatch]);



	const filteredBooks = books.filter(book =>{

		if(book.title.toLowerCase().includes(searchTerm.toLowerCase())){
			return true
		}

		// console.log(book);
		// {
		// 	"key": 29,
		// 	"title": "Peter Pan",
		// 	"author": "Unknown Author",
		// 	"cover": "",
		// 	"transactionId": "IoGPBqct_PHdtLf-Uo9dqVbvgxhYVNwAkLv6lWeaE1Q",
		// 	"tags": [
		// 		{
		// 			"__typename": "Tag",
		// 			"name": "Content-Type",
		// 			"value": "application/epub+zip"
		// 		},
		// 		{
		// 			"__typename": "Tag",
		// 			"name": "application-id",
		// 			"value": "UncensoredGreats"
		// 		},
		// 		{
		// 			"__typename": "Tag",
		// 			"name": "minting_number",
		// 			"value": "10"
		// 		},
		// 		{
		// 			"__typename": "Tag",
		// 			"name": "title",
		// 			"value": "Peter Pan"
		// 		},
		// 		{
		// 			"__typename": "Tag",
		// 			"name": "fiction",
		// 			"value": "null"
		// 		},
		// 		{
		// 			"__typename": "Tag",
		// 			"name": "language",
		// 			"value": "en"
		// 		},
		// 		{
		// 			"__typename": "Tag",
		// 			"name": "era",
		// 			"value": "14"
		// 		},
		// 		{
		// 			"__typename": "Tag",
		// 			"name": "type",
		// 			"value": "3"
		// 		},
		// 		{
		// 			"__typename": "Tag",
		// 			"name": "type0",
		// 			"value": "0"
		// 		},
		// 		{
		// 			"__typename": "Tag",
		// 			"name": "type1",
		// 			"value": "0"
		// 		},
		// 		{
		// 			"__typename": "Tag",
		// 			"name": "type2",
		// 			"value": "0"
		// 		},
		// 		{
		// 			"__typename": "Tag",
		// 			"name": "type3",
		// 			"value": "0"
		// 		},
		// 		{
		// 			"__typename": "Tag",
		// 			"name": "type4",
		// 			"value": "0"
		// 		},
		// 		{
		// 			"__typename": "Tag",
		// 			"name": "type5",
		// 			"value": "1"
		// 		},
		// 		{
		// 			"__typename": "Tag",
		// 			"name": "type6",
		// 			"value": "0"
		// 		},
		// 		{
		// 			"__typename": "Tag",
		// 			"name": "type7",
		// 			"value": "0"
		// 		},
		// 		{
		// 			"__typename": "Tag",
		// 			"name": "type8",
		// 			"value": "0"
		// 		},
		// 		{
		// 			"__typename": "Tag",
		// 			"name": "type9",
		// 			"value": "0"
		// 		}
		// 	]
		// }


		// TODO: Categories Filter

		// TODO: Types Filter

		// TODO: Languages Filter

		// TODO: Publication Filter

		return false;
	});

	const totalPages = Math.ceil(filteredBooks.length / ITEMS_PER_PAGE);
	const paginatedBooks = filteredBooks.slice(
		(currentPage - 1) * ITEMS_PER_PAGE,
		currentPage * ITEMS_PER_PAGE
	);

	const handlePageChange = (page: number) => {
		dispatch(setCurrentPage(page));
	};

	const renderPaginationItem: PaginationProps["itemRender"] = (
		_,
		type,
		originalElement
	) => {
		if (type === "prev") return <a className="px-2">Previous</a>;
		if (type === "next") return <a className="px-2">Next</a>;
		return originalElement;
	};

	const renderBookModal = (index: number) => {
		if (selectedBook && (index + 1) % 6 === 0) {
			const selectedBookIndex = paginatedBooks.findIndex(
				(b) => b.key === selectedBook.key
			);
			const rowStart = Math.floor(selectedBookIndex / 6) * 6;
			const rowEnd = rowStart + 5;

			if (index >= rowStart && index <= rowEnd) {
				return (
					<div
						key="book-modal"
						ref={bookModalRef}
						className="col-span-6"
					>
						<BookModal />
					</div>
				);
			}
		}
		return null;
	};

	return (
		<>
			<div className="flex-grow grid grid-cols-6 grid-rows-[repeat(3, minmax(0,auto))] py-4 gap-4">
				{filteredBooks.length === 0 ? (
					<div className="col-span-6 font-roboto-condensed font-normal text-base flex items-center justify-between p-2 border-b last:border-0 text-black">
						No Results to show
					</div>
				) : (
					paginatedBooks.map((book, index) => (
						<React.Fragment key={book.key}>
							<BookCard book={book} />
							{renderBookModal(index)}
						</React.Fragment>
					))
				)}
			</div>
			{totalPages > 1 && (
				<div className="flex justify-center items-center my-10">
					<Pagination
						total={filteredBooks.length}
						current={currentPage}
						pageSize={ITEMS_PER_PAGE}
						showLessItems={true}
						onChange={handlePageChange}
						itemRender={renderPaginationItem}
					/>
				</div>
			)}
		</>
	);
};

export default Portal;
