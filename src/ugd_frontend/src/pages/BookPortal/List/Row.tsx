import Epub, { EpubCFI } from "epubjs";
import React, { useEffect, useRef, useState } from "react";

import { CSVLink } from "react-csv";

import { PiFileCsvThin } from "react-icons/pi";
import { BsFiletypeJson } from "react-icons/bs";
import { Modal } from "antd";
import BookModal from "@/components/BooksCard/BookModal";
import { handleJSONDownload, removeNewLines, titleToFileName } from "@/utils/BookPortal";

const Row = ({ bookData }: any) => {
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
        setContents([]);
        setCover(null);
		if (book) {
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
		}
	}, [book]);

	// Function to show the modal
	const showBookModal = () => {
		setIsBookModalVisible(true);
	};

	// Function to handle when the user clicks Cancel in the modal
	const handleCancel = () => {
		setIsBookModalVisible(false);
	};
	return (
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
            <td className="py-4 px-6">{bookData.author}</td>
            <td className="py-4 px-6">
                <div className="relative grid items-center justify-center font-sans font-bold uppercase whitespace-nowrap select-none bg-green-500/20 text-green-900 py-1 px-2 text-xs rounded-md">
                    <span className="">Minted</span>
                </div>
            </td>
            <td className="py-4 px-6">
                <div className="flex flex-col justify-between items-stretch w-full rounded text-sm font-semibold gap-2 p-2">
                    <button
                        onClick={()=>handleJSONDownload(bookData)}
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
	);
};

export default Row;
