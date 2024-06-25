import React, { useRef, useState } from "react";
import MainLayout from "@/layouts/MainLayout";
import { IoIosSearch } from "react-icons/io";
import PortalType from "@/features/portal-type";
import PortalLanguage from "@/features/portal-language";
import PortalPublicationYear from "@/features/portal-publication-year";
import PortalCategory from "@/features/portal-category";
import PortalFilter from "@/features/portal-filter";
import PortalPagination from "@/features/portal-pagination";
import { Pagination, PaginationProps } from "antd";
import BookModal from "@/features/categories/components/BookModal";

// Sample data for the books
const books = [
	{
		key: 1,
		title: "Sapiens",
		author: "Yuval Noah Harari",
		image: "sapiens.png",
	},
	{
		key: 2,
		title: "Brave New World",
		author: "Aldous Huxley",
		image: "brave-new-world.png",
	},
	{
		key: 3,
		title: "Meditations",
		author: "Marcus Aurelius",
		image: "meditations.png",
	},
	{
		key: 4,
		title: "1984",
		author: "George Orwell",
		image: "1984.png",
	},
	{
		key: 5,
		title: "Sapiens",
		author: "Yuval Noah Harari",
		image: "sapiens.png",
	},
	{
		key: 6,
		title: "1984",
		author: "George Orwell",
		image: "1984.png",
	},
	{
		key: 7,
		title: "lorem",
		author: "Drake Bins",
		image: "brave-new-world.png",
	},
	{
		key: 8,
		title: "Meditations",
		author: "Marcus Aurelius",
		image: "placeholder-cover.png",
	},
	{
		key: 9,
		title: "Sapiens",
		author: "Yuval Noah Harari",
		image: "sapiens.png",
	},
	{
		key: 10,
		title: "Brave New World",
		author: "Aldous Huxley",
		image: "brave-new-world.png",
	},
	{
		key: 11,
		title: "Sapiens",
		author: "Yuval Noah Harari",
		image: "sapiens.png",
	},
	{
		key: 12,
		title: "Brave New World",
		author: "Aldous Huxley",
		image: "brave-new-world.png",
	},
	{
		key: 13,
		title: "Meditations",
		author: "Marcus Aurelius",
		image: "meditations.png",
	},
	{
		key: 14,
		title: "1984",
		author: "George Orwell",
		image: "1984.png",
	},
	{
		key: 15,
		title: "Sapiens",
		author: "Yuval Noah Harari",
		image: "sapiens.png",
	},
	{
		key: 16,
		title: "1984",
		author: "George Orwell",
		image: "1984.png",
	},
	{
		key: 17,
		title: "lorem",
		author: "Drake Bins",
		image: "brave-new-world.png",
	},
	{
		key: 18,
		title: "Meditations",
		author: "Marcus Aurelius",
		image: "placeholder-cover.png",
	},
	{
		key: 19,
		title: "Sapiens",
		author: "Yuval Noah Harari",
		image: "sapiens.png",
	},
	{
		key: 20,
		title: "Brave New World",
		author: "Aldous Huxley",
		image: "brave-new-world.png",
	},
	{
		key: 21,
		title: "Sapiens",
		author: "Yuval Noah Harari",
		image: "sapiens.png",
	},
	{
		key: 22,
		title: "Brave New World",
		author: "Aldous Huxley",
		image: "brave-new-world.png",
	},
	{
		key: 23,
		title: "Meditations",
		author: "Marcus Aurelius",
		image: "meditations.png",
	},
	{
		key: 24,
		title: "1984",
		author: "George Orwell",
		image: "1984.png",
	},
	{
		key: 25,
		title: "Sapiens",
		author: "Yuval Noah Harari",
		image: "sapiens.png",
	},
	{
		key: 26,
		title: "1984",
		author: "George Orwell",
		image: "1984.png",
	},
	{
		key: 27,
		title: "lorem",
		author: "Drake Bins",
		image: "brave-new-world.png",
	},
	{
		key: 28,
		title: "Meditations",
		author: "Marcus Aurelius",
		image: "placeholder-cover.png",
	},
	{
		key: 29,
		title: "Sapiens",
		author: "Yuval Noah Harari",
		image: "sapiens.png",
	},
	{
		key: 30,
		title: "Brave New World",
		author: "Aldous Huxley",
		image: "brave-new-world.png",
	},
	{
		key: 31,
		title: "Sapiens",
		author: "Yuval Noah Harari",
		image: "sapiens.png",
	},
	{
		key: 32,
		title: "Brave New World",
		author: "Aldous Huxley",
		image: "brave-new-world.png",
	},
	{
		key: 33,
		title: "Meditations",
		author: "Marcus Aurelius",
		image: "meditations.png",
	},
	{
		key: 34,
		title: "1984",
		author: "George Orwell",
		image: "1984.png",
	},
	{
		key: 35,
		title: "Sapiens",
		author: "Yuval Noah Harari",
		image: "sapiens.png",
	},
	{
		key: 36,
		title: "1984",
		author: "George Orwell",
		image: "1984.png",
	},
	{
		key: 37,
		title: "lorem",
		author: "Drake Bins",
		image: "brave-new-world.png",
	},
	{
		key: 38,
		title: "Meditations",
		author: "Marcus Aurelius",
		image: "placeholder-cover.png",
	},
	{
		key: 39,
		title: "Sapiens",
		author: "Yuval Noah Harari",
		image: "sapiens.png",
	},
	{
		key: 40,
		title: "Brave New World",
		author: "Aldous Huxley",
		image: "brave-new-world.png",
	},
];

const ITEMS_PER_PAGE = 18;

function BookPortalPage() {
	const [selectedBook, setSelectedBook] = useState<any>(null);
	const handleBookClick = (book: any) => {
		if (selectedBook && selectedBook.key == book.key) {
			setSelectedBook(null);
		} else {
			setSelectedBook(book);
		}
	};
	
	const [currentPage, setCurrentPage] = useState(1);
	const [searchTerm, setSearchTerm] = useState('');
	
	const handlePageChange = (page: number) => {
		setCurrentPage(page);
	};
	
	const filteredBooks = books.filter(({title})=>title.toLowerCase().includes(searchTerm.toLowerCase()));
	const totalPages = Math.ceil(filteredBooks.length / ITEMS_PER_PAGE);
	const paginatedBooks = filteredBooks.slice(
		(currentPage - 1) * ITEMS_PER_PAGE,
		currentPage * ITEMS_PER_PAGE
	);
	const itemRender: PaginationProps["itemRender"] = (
		_,
		type,
		originalElement
	) => {
		if (type === "prev") {
			return <a className="px-2">Previous</a>;
		}
		if (type === "next") {
			return <a className="px-2">Next</a>;
		}
		return originalElement;
	};

	const bookModalRef = useRef<HTMLDivElement>(null); // Ref for the container div
	const generateCards = () => {
		if(filteredBooks.length <= 0 )
			return <div className="font-roboto-condensed font-normal text-base flex items-center justify-between p-2 border-b last:border-0 text-black">
				No Results to show
			</div>
		const content = [];
		let insertedModal = false;

		for (let i = 0; i < paginatedBooks.length; i++) {
			const book = paginatedBooks[i];
			const bookCard = (
				<div
					key={book.key}
					className={`flex justify-center items-center cursor-pointer transition-all duration-500 p-2 ${
						selectedBook && selectedBook.key === book.key
							? "bg-black text-white"
							: "hover:border hover:border-solid hover:border-gray-300 hover:scale-[98%] hover:shadow-2xl hover:rounded-lg"
					}`}
					onClick={() => handleBookClick(book)}
				>
					<div className="flex flex-col justify-between gap-3 items-start">
						<img
							className="rounded-lg h-80 object-fill"
							src={`images/books/${book.image}`}
							alt={book.title}
						/>
						<span className="font-syne font-semibold text-xl leading-7">
							{book.title}
						</span>
						<span
							className={`font-roboto-condensed font-normal text-base leading-[18px] ${
								selectedBook && selectedBook.key === book.key
									? "pb-0.5 text-gray-300"
									: ""
							}`}
						>
							{book.author}
						</span>
					</div>
				</div>
			);
			content.push(bookCard);

			// Check if we've reached the end of the row
			if ((i + 1) % 6 === 0 || i === paginatedBooks.length - 1) {
				// Insert modal after completing the row if selected book is in the row and modal has not been inserted yet
				if (selectedBook && !insertedModal) {
					const selectedBookIndex = paginatedBooks.findIndex(
						(b) => b.key === selectedBook.key
					);
					const rowStart = Math.floor(selectedBookIndex / 6) * 6;
					const rowEnd = rowStart + 5;

					if (i >= rowStart && i <= rowEnd) {
						content.push(
							<div
								key="book-modal"
								ref={bookModalRef}
								className="col-span-6"
							>
								<BookModal />
							</div>
						);
						insertedModal = true;
					}
				}
			}
		}
		return content;
	};

	return (
		<MainLayout>
			<div className="flex-grow p-6">
				<div className="flex justify-between items-center gap-4 font-roboto-condensed text-black">
					<div className="basis-1/2 border-b border-solid border-gray-500 flex items-center gap-2 py-1">
						<IoIosSearch />
						<input
							type="text"
							value={searchTerm}
							onChange={(e)=>setSearchTerm(e.target.value)}
							placeholder="Search"
							className="bg-transparent font-normal text-xl flex-grow rounded border-0 ring-0 focus:ring-0 outline-none"
						/>
					</div>
					<div className="basis-1/2 flex items-center justify-around gap-2 py-2">
						<PortalCategory />
						<PortalLanguage />
						<PortalType />
						<PortalPublicationYear />
					</div>
				</div>
				<div className="font-roboto-condensed font-normal text-xl my-4 flex gap-4 items-center">
					<span> Books: {books.length} </span>
					<PortalFilter />
				</div>
				<div className="flex-grow grid grid-cols-6 grid-rows-[repeat(3, minmax(0,auto))] py-4 gap-4">
					{/* {paginatedBooks.map(book=>(
						<div>
							<div className={`flex justify-center items-center cursor-pointer transition-all duration-500 p-2 ${selectedBook && selectedBook.key === book.key ? 'bg-black text-white':'hover:border hover:border-solid hover:border-gray-300 hover:scale-[98%] hover:shadow-2xl hover:rounded-lg'}`} onClick={()=>handleBookClick(book)}>
								<div className={`flex flex-col justify-between gap-3 items-start`} >
									<img
										className="rounded-lg h-80 object-fill"
										src={`images/books/${book.image}`}
										alt={book.title}
									/>
									<span className="font-syne font-semibold text-xl leading-7">{book.title}</span>
									<span className={`font-roboto-condensed font-normal text-base leading-[18px]  ${selectedBook && selectedBook.key === book.key ? 'pb-0.5 text-gray-300':''}`}>{book.author}</span>
								</div>
							</div>

							{selectedBook && selectedBook.key == book.key && <div ref={bookModalRef}> <BookModal /> </div> }
						</div>
					))} */}
					{ generateCards() }
				</div>
				{
					totalPages > 1 &&
					<div className="flex justify-center items-center my-10">
						<Pagination
							total={filteredBooks.length}
							current={currentPage}
							pageSize={ITEMS_PER_PAGE}
							showLessItems={true}
							onChange={handlePageChange}
							itemRender={itemRender}
						/>
					</div>
				}
			</div>
		</MainLayout>
	);
}

export default BookPortalPage;
