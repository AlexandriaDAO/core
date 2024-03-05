import React, { useEffect, useState } from "react";

import { FaGripVertical } from "react-icons/fa";
import { FaGripHorizontal } from "react-icons/fa";
import { initJuno, listDocs } from "@junobuild/core";
import Grid from "./Grid";
import List from "./List";
import NoBooks from "./NoBooks";
import Loading from "./Loading";
import Mint from "./Mint";
import { RootState } from "@/store";
import { fetchBooks, setLimit, setView } from "@/features/portal/portalSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

const BookPortalRedux = () => {
	const dispatch = useAppDispatch();
	const {
		data, // The fetched books
		limit,
		view,
		loading, // Boolean indicating loading state
		error, // Error information
		currentPage, // Current page of the book list
	} = useAppSelector((state: RootState) => state.portal);

	useEffect(() => {
		const init = async () => {
			await initJuno({ satelliteId: "kh5oj-myaaa-aaaal-admga-cai" });
		};
		init();
	}, []);

	// Trigger fetchBooks on component mount
	useEffect(() => {
		dispatch(fetchBooks()); // If you have a 'from' parameter, pass it here
	}, [dispatch, limit]);

	const getTotalPages = () =>
		data ? Math.ceil(Number(data.matches_length) / limit) : 0;

	const renderContent = () => {
		// If there was an error, show an error message
		if (error) {
			return <div>Error fetching books: {error}</div>;
		}
		// Show loading component while data is being fetched
		if (loading) return <Loading />;

		// Check if there are items to display
		if (data && data?.items?.length > 0) {
			// Choose between grid or list view based on the 'view' state
			return view === "grid" ? (
				<Grid books={data.items} />
			) : (
				<List books={data.items} />
			);
		}

		// Display NoBooks component if there are no items
		return <NoBooks />;
	};

	return (
		<div className="relative h-full w-full min-h-screen p-4 font-sans">
			<div className="max-w-6xl mx-auto grid grid-cols-1 gap-4">
				<div className="col-span-3">
					<div className="flex items-center mb-4">
						<select
							defaultValue="10"
							onChange={(e) => dispatch(setLimit(parseInt(e.target.value)))}
							className="w-44 text-sm text-gray-600 py-3 px-4 cursor-pointer border-r-8 border-r-transparent shadow-sm rounded focus:ring-0 focus:outline-0"
						>
							<option value="5">5 Record Per Page</option>
							<option value="10">10 Records Per Page</option>
							<option value="20">20 Records Per Page</option>
						</select>

						<div className="flex gap-2 ml-auto">
							<Mint />

							<FaGripVertical
								onClick={() => dispatch(setView("grid"))}
								className={`border w-9 h-9 p-2 flex items-center justify-center rounded cursor-pointer border-blue-500 ${
									view == "grid"
										? "text-white bg-blue-500"
										: "text-blue-500 bg-transparent"
								}`}
							/>
							<FaGripHorizontal
								onClick={() => dispatch(setView("list"))}
								className={`border w-9 h-9 p-2 flex items-center justify-center rounded cursor-pointer border-blue-500 ${
									view == "list"
										? "text-white bg-blue-500"
										: "text-blue-500 bg-transparent"
								}`}
							/>
						</div>
					</div>
					{renderContent()}

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
										currentPage >= getTotalPages() ||
										loading
											? "text-gray-800 bg-gray-300 "
											: "text-gray-800 bg-white hover:bg-gray-100"
									}`}
									onClick={() =>
										dispatch(
											fetchBooks(
												data.items[
													data.items.length - 1
												]?.key
											)
										)
									}
									disabled={
										currentPage >= getTotalPages() ||
										loading
									}
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

export default BookPortalRedux;
