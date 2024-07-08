import Epub, { EpubCFI } from "epubjs";
import React, { useEffect, useRef, useState } from "react";

import { CSVLink } from "react-csv";

import { PiFileCsvThin } from "react-icons/pi";
import { BsCart2, BsFiletypeJson } from "react-icons/bs";
import { FaRegTrashCan } from "react-icons/fa6";
import { Modal } from "antd";
import { removeNewLines, titleToFileName } from "@/utils/Portal";
import { deleteAsset, deleteDoc, listDocs } from "@junobuild/core";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import BookModal from "@/components/BookModal";
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { setSelectedBook, setIsModalOpen } from '@/features/home/homeSlice';


const Card = ({ item }: any) => {
	const { data: bookData } = item;
	const dispatch = useDispatch();
	const { isModalOpen } = useSelector((state: RootState) => state.home);
	const bookAreaRef = useRef(null);

	const [book, setBook] = useState<any>(null);
	const [deleting, setDeleting] = useState(false);
	const [contents, setContents] = useState<any>([]);
	const [cover, setCover] = useState<any>(null);

	useEffect(() => {
			if (bookAreaRef.current) {
					try {
							let onlineBook = Epub(bookData.url, { openAs: "epub" });
							// Render the book off-screen or hidden
							onlineBook.renderTo(bookAreaRef.current, {
									width: 0,
									height: 0,
							});
							setBook(onlineBook);
					} catch (error) {
							console.error("error", error);
					}
			}
	}, []);

	useEffect(() => {
			setContents([]);
			setCover(null);

			if (book) {
					book.coverUrl().then((cover: any) => setCover(cover));

					book.loaded.spine.then(async (spine: any) => {
							const contents: any = [];

							for (let item of (spine as any).items) {
									if (!item.href) return;
									const doc = await book.load(item.href);
									const innerHTML = (doc as Document).documentElement
											.innerHTML;
									const parsedDoc = new DOMParser().parseFromString(
											innerHTML,
											"text/html"
									);

									const paragraphs = parsedDoc.querySelectorAll("p");

									paragraphs.forEach((paragraph) => {
											const text = paragraph.textContent?.trim() ?? "";
											if (text.length < 1) return;

											const cfi = new EpubCFI(paragraph, item.cfiBase);
											const content: any = {
													cfi,
													text: removeNewLines(text),
											};
											contents.push(content);
									});
							}

							setContents(contents);
					});
			}
	}, [book]);

	const handleQuickView = () => {
			dispatch(setSelectedBook({
					key: item.key,
					title: bookData.title,
					author: bookData.author,
					image: cover,
					transactionId: bookData.url.split("icp0.io")[1],
					bookUrl: `https://node1.irys.xyz/${bookData.url.split("icp0.io")[1]}`,
			}));
			dispatch(setIsModalOpen(true));
	};

	const deleteBook = async () => {
			setDeleting(true);

			try {
					const books = await listDocs({
							collection: "books",
					});
					let related: any = [];
					if (books.items.length > 0) {
							related = books.items.filter(
									(book: any) => book.data.url == bookData.url
							);
					}

					if (related.length <= 1) {
							await deleteAsset({
									collection: "uploads",
									fullPath: bookData.url.split("icp0.io")[1],
							});
					}

					await deleteDoc({
							collection: "books",
							doc: item,
					});

					alert("book deleted");
					window.location.reload();
			} catch (error) {
					alert("an error occurred while deleting");
					console.error(error);
			} finally {
					setDeleting(false);
			}
	};

	return (
		<div className="bg-white shadow rounded overflow-hidden flex flex-col justify-between">
			<div ref={bookAreaRef}></div>

			<div className="relative group">
				{cover ? (
					<img
						src={cover}
						alt={bookData?.title}
						className="w-full h-52 object-cover"
					/>
				) : (
					<div
						role="status"
						className="flex items-center justify-center w-full h-52 bg-gray-400 animate-pulse"
					>
						<svg
							className="w-10 h-10 text-gray-200 dark:text-gray-600"
							aria-hidden="true"
							xmlns="http://www.w3.org/2000/svg"
							fill="currentColor"
							viewBox="0 0 20 18"
						>
							<path d="M18 0H2a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2Zm-5.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm4.376 10.481A1 1 0 0 1 16 15H4a1 1 0 0 1-.895-1.447l3.5-7A1 1 0 0 1 7.468 6a.965.965 0 0 1 .9.5l2.775 4.757 1.546-1.887a1 1 0 0 1 1.618.1l2.541 4a1 1 0 0 1 .028 1.011Z" />
						</svg>
						<span className="sr-only">Loading...</span>
					</div>
				)}
				<div className="w-full h-full absolute inset-0 bg-gray-400 bg-opacity-40 opacity-0 group-hover:opacity-100 transition-all duration-500">
					<button
                onClick={handleQuickView}
                className="absolute left-0 bottom-0 w-full p-2 bg-gray-800 text-white text-base text-center leading-4 flex items-center justify-center"
            >
                <span className="text-white mr-1">
                    <svg width="20" height="20" viewBox="0 0 32 32">
                        <path
                            fill="currentColor"
                            d="M16...3z"
                        ></path>
                    </svg>
                </span>
                Quick View
            </button>
					<Modal
						centered
						open={isModalOpen}
						onCancel={() => setIsModalOpen(false)}
						footer={null}
						closable={false}
						width={"70rem"}
						// width={'md:aspect-video aspect-[3/4] w-full h-full'}
						classNames={{ content: "!p-0" }}
					>
						<BookModal />
					</Modal>
				</div>
			</div>
			<div className="py-2 px-4 flex-grow flex flex-col justify-center">
				<h4 className=" font-mono font-semibold text-md pt-1 text-gray-800 hover:text-blue-500 transition">
					{bookData.author && bookData.author.length > 20
						? bookData.author.substring(0, 20) + "..."
						: bookData.author}
				</h4>
				<p className="font-mono font-regular text-base text-gray-600 hover:text-blue-500 transition">
					{bookData.title && bookData.title.length > 40
						? bookData.title.substring(0, 40) + "..."
						: bookData?.title}
				</p>
			</div>
			<div className="flex flex-wrap justify-between items-center w-full rounded text-sm font-semibold gap-2 p-2">
				{deleting ? (
					<button
						disabled
						className="spin px-2 py-1 rounded-tl rounded-bl transition flex-grow bg-red-300 text-white font-bold rounded flex justify-center items-center gap-1"
					>
						<AiOutlineLoading3Quarters className="animate-spin" />{" "}
						Deleting Book
					</button>
				) : (
					<button
						onClick={deleteBook}
						className="px-2 py-1 rounded-tl rounded-bl transition flex-grow bg-red-500 hover:bg-red-700 text-white font-bold rounded flex justify-center items-center gap-1"
					>
						<FaRegTrashCan size={18} /> Delete Book
					</button>
				)}
				<CSVLink
					filename={titleToFileName(bookData.title) + "_Contents.csv"}
					headers={[
						{ label: "metadata", key: "cfi" },
						{ label: JSON.stringify(bookData), key: "text" },
					]}
					data={contents}
					className={`px-2 py-1 rounded-tr rounded-br transition flex-grow font-bold rounded flex justify-center items-center gap-1 ${
						contents && contents.length > 0
							? "bg-blue-500 hover:bg-blue-700 text-white"
							: "pointer-events-none bg-gray-300"
					} `}
				>
					<PiFileCsvThin size={18} />
					Content
				</CSVLink>
				<button
					onClick={() =>
						alert("handle listing the book in the marketplace")
					}
					className="px-2 py-1 rounded-tl rounded-bl transition flex-grow bg-blue-500 hover:bg-blue-700 text-white font-bold rounded flex justify-center items-center gap-1"
				>
					<BsCart2 size={18} />
					Sell in Marketplace
				</button>
			</div>
		</div>
	);
};

export default Card;