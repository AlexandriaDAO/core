import Epub, { EpubCFI } from "epubjs";
import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

import { FaGripVertical } from "react-icons/fa";
import { FaGripHorizontal } from "react-icons/fa";
import { ImSpinner11 } from "react-icons/im";
import { CSVLink } from "react-csv";
import BookUpload from "./BookUpload";
import { initJuno, listDocs } from "@junobuild/core";
import NFTCard from "./NFTCard";

const BookPortal = () => {
	const [limit, setLimit] = useState<any>(1);
	const [view, setView] = useState("grid");
	const [data, setData] = useState<any>(undefined);
	const [currentPage, setCurrentPage] = useState<any>(undefined);
	const [loading, setLoading] = useState(true);

	const getBooks = async (from: any = null) => {
		setLoading(true);
		let paginate: any = { limit };
		if (from) paginate.startAfter = from;
		const collection: any = await listDocs({
			collection: "books",
			filter: { paginate },
		});
		setCurrentPage(Number(collection.items_page) + 1);
		setData(collection);
		setLoading(false);
	};

	useEffect(() => {
		const init = async () => {
			await initJuno({ satelliteId: "kh5oj-myaaa-aaaal-admga-cai" });
		};
		init();
	}, []);

	useEffect(() => {
		getBooks();
	}, [limit]);

	const getTotalPages = () => Math.ceil(Number(data.matches_length) / limit);

	return (
		<div className="relative h-full w-full min-h-screen p-4 font-sans">
			<div className="max-w-6xl mx-auto grid grid-cols-1 gap-4">
				<div className="col-span-3">
					<div className="flex items-center mb-4">
						<select
							onChange={(e) => setLimit(e.target.value)}
							className="w-44 text-sm text-gray-600 py-3 px-4 cursor-pointer border-r-8 border-r-transparent shadow-sm rounded focus:ring-0 focus:outline-0"
						>
							<option value="1">1 Record Per Page</option>
							<option value="3">3 Records Per Page</option>
							<option value="5">5 Records Per Page</option>
							<option value="10">10 Records Per Page</option>
						</select>

						<div className="flex gap-2 ml-auto">
							<BookUpload />

							<FaGripVertical
								onClick={() => setView("grid")}
								className={`border w-9 h-9 p-2 flex items-center justify-center rounded cursor-pointer border-blue-500 ${
									view == "grid"
										? "text-white bg-blue-500"
										: "text-blue-500 bg-transparent"
								}`}
							/>
							<FaGripHorizontal
								onClick={() => setView("list")}
								className={`border w-9 h-9 p-2 flex items-center justify-center rounded cursor-pointer border-blue-500 ${
									view == "list"
										? "text-white bg-blue-500"
										: "text-blue-500 bg-transparent"
								}`}
							/>
						</div>
					</div>
					{loading ? (
						<div className="flex items-center mt-6 text-center border border-gray-800 rounded-lg h-auto py-10 bg-blue-200">
							<div className="flex flex-col w-full px-4 mx-auto">
								<div className="p-3 mx-auto text-blue-500 bg-blue-100 rounded-full ">
									<ImSpinner11 className="animate-spin" />
								</div>
								<h1 className="mt-3 text-lg font-semibold text-gray-800 ">
									Loading
								</h1>
								<p className="mt-2 text-base text-gray-500 ">
									Please wait while we are loading your NFT's
								</p>
							</div>
						</div>
					) : data?.items.length > 0 ? (
						<div className="transition duration-300">
							{view == "grid" ? (
								<div className="grid md:grid-cols-4 grid-cols-2 gap-6">
									{data &&
										data.items.length > 0 &&
										data.items.map(
											(
												{ data: book }: any,
												index: number
											) => (
												<NFTCard
													bookData={book}
													key={index}
												/>
											)
										)}
								</div>
							) : (
								<div className="flex items-start mt-6 justify-center border rounded overflow-x-auto h-auto">
									<table className="w-full text-sm text-left text-gray-500 h-full">
										<thead className="text-xs text-gray-700 uppercase bg-gray-50 ">
											<tr>
												<th
													scope="col"
													className="py-3 px-6"
												>
												
												</th>
												<th
													scope="col"
													className="py-3 px-6"
												>
													Title
												</th>
												<th
													scope="col"
													className="py-3 px-6"
												>
													Author
												</th>
												<th
													scope="col"
													className="py-3 px-6 text-center"
												>
													Status
												</th>
												<th
													scope="col"
													className="py-3 px-6 text-center"
												>
													Data
												</th>
												<th
													scope="col"
													className="py-3 px-6"
												>
													Actions
												</th>
											</tr>
										</thead>
										<tbody>
										{data &&
											data.items.length > 0 &&
											data.items.map(
												(
													{ data: book }: any,
													index: number
												) => (
													<NFTCard
														bookData={book}
														view="list"
														key={index}
													/>
												)
											)}
										</tbody>
									</table>
								</div>
							)}
						</div>
					) : (
						<div className="flex items-center mt-6 text-center border border-gray-800 rounded-lg h-auto py-10 bg-blue-200">
							<div className="flex flex-col w-full px-4 mx-auto">
								<div className="p-3 mx-auto text-blue-500 bg-blue-100 rounded-full ">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										fill="none"
										viewBox="0 0 24 24"
										strokeWidth="1.5"
										stroke="currentColor"
										className="w-6 h-6"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
										/>
									</svg>
								</div>
								<h1 className="mt-3 text-lg font-semibold text-gray-800 ">
									No Books found
								</h1>
								<p className="mt-2 text-base text-gray-500 ">
									You haven't uploaded any file yet. Feel
									free to upload an ebook. Thank You!
								</p>
							</div>
						</div>
					)}

					{data && data?.items.length > 0 && (
						<div className="mt-6 sm:flex gap-4 sm:items-center sm:justify-between ">
							{!loading && (
								<>
									<div className="text-sm text-gray-500 ">
										Page &nbsp;
										<span className="font-medium text-gray-700 ">
											{currentPage} of {getTotalPages()}
										</span>
									</div>
									<div className="text-sm text-gray-500 ">
										Total &nbsp;
										<span className="font-medium text-gray-700 ">
											{data.matches_length.toString()}
										</span>
										&nbsp;Records
									</div>
								</>
							)}

							<div className="flex items-center ml-auto mt-4 gap-x-4 sm:mt-0">
								<button
									className={`flex items-center justify-center w-1/2 px-5 py-2 text-sm capitalize transition-colors duration-200 border border-gray-300  rounded-md sm:w-auto gap-x-2  ${
										currentPage >= getTotalPages() || loading
											? "text-gray-800 bg-gray-300 "
											: "text-gray-800 bg-white hover:bg-gray-100"
									}`}
									onClick={() =>
										getBooks(
											data.items[data.items.length - 1]
												?.key
										)
									}
									disabled={currentPage >= getTotalPages() || loading}
								>
									<span>Go To Next Page</span>

									<svg
										xmlns="http://www.w3.org/2000/svg"
										fill="none"
										viewBox="0 0 24 24"
										strokeWidth="1.5"
										stroke="currentColor"
										className="w-5 h-5 rtl:-scale-x-100"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3"
										/>
									</svg>
								</button>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default BookPortal;
