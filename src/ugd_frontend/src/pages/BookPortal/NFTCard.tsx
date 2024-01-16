import Epub, { EpubCFI } from "epubjs";
import React, { useEffect, useRef, useState } from "react";

import { CSVLink } from "react-csv";

import { faStar } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { MdOutlineFileDownload } from "react-icons/md";
import { PiFileCsvThin } from "react-icons/pi";
import { BsCart2, BsFiletypeJson } from "react-icons/bs";
import { Modal } from "antd";
import BookModal from "@/components/BooksCard/BookModal";

function titleToFileName(title: string) {
	return title
		.toLowerCase() // convert to lowercase
		.replace(/['"]/g, "") // remove apostrophes and quotes
		.replace(/\s+/g, "-") // replace spaces with hyphens
		.replace(/[^\w-]/g, ""); // remove any non-word (excluding hyphens) characters
}
function removeNewLines(text: string) {
	return text.replace(/\r?\n|\r/g, "");
}

const NFTCard = ({ bookData, view = "grid" }: any) => {
	const bookAreaRef = useRef(null);

	const [book, setBook] = useState<any>(null);
	const [contents, setContents] = useState<any>([]);
	const [cover, setCover] = useState<any>(null);
	const [isBookModalVisible, setIsBookModalVisible] = useState(false);

	useEffect(() => {
		if (bookAreaRef.current) {
			try {
				let onlineBook = Epub(bookData.url, { openAs: "epub" });
				// Render the book off-scr`een or hidden
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
		if (book) {
			setContents([]);
			setCover(null);

			book.loaded.cover.then((coverPath: any) => {
				book.archive.createUrl(coverPath).then((url: any) => {
					setCover(url); // Set the URL for the cover image
				});
			});

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
		} else {
			console.log("no book");
		}
	}, [book]);

	const handleJSONDownload = () => {
		// <CSVLink filename={} headers={metadataHeaders} data={[metadata]} className="bg-blue-500 hover:bg-blue-700 text-white font-bold px-4 rounded">Export to JSON</CSVLink>

		const blob = new Blob(
			[
				JSON.stringify({
					title: bookData.title,
					creator: bookData.creator,
					description: bookData.description,
					pubdate: bookData.pubdate,
					publisher: bookData.publisher,
					identifier: bookData.identifier,
					language: bookData.language,
					rights: bookData.rights,
					modified_date: bookData.modified_date,
				}),
			],
			{ type: "application/json" }
		);
		const url = URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.href = url;
		link.download = titleToFileName(bookData.title) + "_MetaData.json";
		link.click();
	};

	// Function to show the modal
	const showBookModal = () => {
		setIsBookModalVisible(true);
	};

	// Function to handle when the user clicks Cancel in the modal
	const handleCancel = () => {
		setIsBookModalVisible(false);
	};
	return (
		<>
			{view == "grid" ? (
				<div className="bg-white shadow rounded overflow-hidden flex flex-col justify-between">
					<div ref={bookAreaRef}></div>

					<div className="relative group">
						{cover ? (
							<img
								src={cover}
								alt={bookData.title}
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
								onClick={showBookModal}
								className="absolute left-0 bottom-0 w-full p-2 bg-gray-800 text-white text-base text-center leading-4 flex items-center justify-center"
							>
								<span className="text-white mr-1">
									<svg
										width="20"
										height="20"
										viewBox="0 0 32 32"
									>
										<path
											fill="currentColor"
											d="M16 8C7.664 8 1.25 15.344 1.25 15.344L.656 16l.594.656s5.848 6.668 13.625 7.282c.371.046.742.062 1.125.062s.754-.016 1.125-.063c7.777-.613 13.625-7.28 13.625-7.28l.594-.657l-.594-.656S24.336 8 16 8zm0 2c2.203 0 4.234.602 6 1.406A6.89 6.89 0 0 1 23 15a6.995 6.995 0 0 1-6.219 6.969c-.02.004-.043-.004-.062 0c-.239.011-.477.031-.719.031c-.266 0-.523-.016-.781-.031A6.995 6.995 0 0 1 9 15c0-1.305.352-2.52.969-3.563h-.031C11.717 10.617 13.773 10 16 10zm0 2a3 3 0 1 0 .002 6.002A3 3 0 0 0 16 12zm-8.75.938A9.006 9.006 0 0 0 7 15c0 1.754.5 3.395 1.375 4.781A23.196 23.196 0 0 1 3.531 16a23.93 23.93 0 0 1 3.719-3.063zm17.5 0A23.93 23.93 0 0 1 28.469 16a23.196 23.196 0 0 1-4.844 3.781A8.929 8.929 0 0 0 25 15c0-.715-.094-1.398-.25-2.063z"
										></path>
									</svg>
								</span>
								Quick View
							</button>
							<Modal
								centered
								open={isBookModalVisible}
								onCancel={handleCancel}
								footer={null}
								closable={false}
								width={"70rem"}
								// width={'md:aspect-video aspect-[3/4] w-full h-full'}
								classNames={{ content: "!p-0" }}
							>
								<BookModal bookUrl={bookData.url} />
							</Modal>
						</div>
					</div>
					<div className="py-2 px-4 flex-grow flex flex-col justify-center">
						<h4 className=" font-mono font-semibold text-md pt-1 text-gray-800 hover:text-blue-500 transition">
							{bookData.creator.length > 20
								? bookData.creator.substring(0, 20) + "..."
								: bookData.creator}
						</h4>
						<p className="font-mono font-regular text-base text-gray-600 hover:text-blue-500 transition">
							{bookData.title.length > 40
								? bookData.title.substring(0, 40) + "..."
								: bookData.title}
						</p>
					</div>
					<div className="flex flex-wrap justify-between items-center w-full rounded text-sm font-semibold gap-2 p-2">
						<button
							onClick={handleJSONDownload}
							className="px-2 py-1 rounded-tl rounded-bl transition flex-grow bg-blue-500 hover:bg-blue-700 text-white font-bold rounded flex justify-center items-center gap-1"
						>
							<BsFiletypeJson size={18} />
							Metadata
						</button>
						<CSVLink
							filename={
								titleToFileName(bookData.title) +
								"_Contents.csv"
							}
							headers={[
								{ label: "cfi", key: "cfi" },
								{ label: "text", key: "text" },
							]}
							data={contents}
							className={`px-2 py-1 rounded-tr rounded-br transition flex-grow font-bold rounded flex justify-center items-center gap-1 ${
								contents && contents.length > 0 ? "bg-blue-500 hover:bg-blue-700 text-white" : "pointer-events-none bg-gray-300"
							} `}
						>
							<PiFileCsvThin size={18} />
							Content
						</CSVLink>
						<button
							onClick={() =>
								alert(
									"handle listing the book in the marketplace"
								)
							}
							className="px-2 py-1 rounded-tl rounded-bl transition flex-grow bg-blue-500 hover:bg-blue-700 text-white font-bold rounded flex justify-center items-center gap-1"
						>
							<BsCart2 size={18} />
							Sell in Marketplace
						</button>
					</div>
				</div>
			) : (
				<tr className="bg-white border-b ">
					<td className="py-4 px-6">
						<div ref={bookAreaRef}></div>
						{cover ? (
							<img
								src={cover}
								alt={bookData.title}
								className="w-20 h-20 object-cover"
							/>
						) : (
							<div
								role="status"
								className="flex items-center justify-center w-20 h-20 bg-gray-400 animate-pulse"
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
					</td>
					<td className="py-4 px-6">{bookData.title}</td>
					<td className="py-4 px-6">{bookData.creator}</td>
					<td className="py-4 px-6">
						<div className="relative grid items-center justify-center font-sans font-bold uppercase whitespace-nowrap select-none bg-green-500/20 text-green-900 py-1 px-2 text-xs rounded-md">
							<span className="">Minted</span>
						</div>
					</td>
					<td className="py-4 px-6">
						<div className="flex flex-col justify-between items-stretch w-full rounded text-sm font-semibold gap-2 p-2">
							<button
								onClick={handleJSONDownload}
								className="px-2 py-1 rounded-tl rounded-bl transition flex-grow bg-blue-500 hover:bg-blue-700 text-white font-bold rounded flex justify-center items-center gap-1"
							>
								<BsFiletypeJson size={18} />
								Metadata
							</button>
							<CSVLink
								filename={
									titleToFileName(bookData.title) +
									"_Contents.csv"
								}
								headers={[
									{ label: "cfi", key: "cfi" },
									{ label: "text", key: "text" },
								]}
								data={contents}
								className={`px-2 py-1 rounded-tr rounded-br transition flex-grow  font-bold rounded flex justify-center items-center gap-1  ${
									contents && contents.length > 0 ? "bg-blue-500 hover:bg-blue-700 text-white" : "pointer-events-none bg-gray-300"
								} `}
							>
								<PiFileCsvThin size={18} />
								Content
							</CSVLink>
						</div>
					</td>

					<td className="py-4 px-6">
						<button
							onClick={showBookModal}
							className="hover:text-blue-500"
						>
							<svg
								height="24"
								width="24"
								viewBox="0 0 24 24"
								xmlns="http://www.w3.org/2000/svg"
								fill="currentColor"
							>
								<g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
								<g
									id="SVGRepo_tracerCarrier"
									strokeLinecap="round"
									strokeLinejoin="round"
								></g>
								<g id="SVGRepo_iconCarrier">
									<path d="M12.5 18c-5.708 0-10.212-5.948-10.4-6.201l-.224-.299.224-.299C2.288 10.948 6.792 5 12.5 5s10.212 5.948 10.4 6.201l.224.299-.224.299C22.712 12.052 18.208 18 12.5 18zm-9.36-6.5c.98 1.188 4.85 5.5 9.36 5.5s8.38-4.312 9.36-5.5C20.88 10.312 17.01 6 12.5 6s-8.38 4.312-9.36 5.5zM12.5 8a3.5 3.5 0 1 0 3.5 3.5A3.5 3.5 0 0 0 12.5 8zm0 6a2.5 2.5 0 1 1 2.5-2.5 2.503 2.503 0 0 1-2.5 2.5z"></path>
									<path fill="none" d="M0 0h24v24H0z"></path>
								</g>
							</svg>
						</button>
						<Modal
							centered
							open={isBookModalVisible}
							onCancel={handleCancel}
							footer={null}
							closable={false}
							width={"70rem"}
							// width={'md:aspect-video aspect-[3/4] w-full h-full'}
							classNames={{ content: "!p-0" }}
						>
							<BookModal bookUrl={bookData.url} />
						</Modal>
					</td>
				</tr>
			)}
		</>
	);
};

export default NFTCard;
