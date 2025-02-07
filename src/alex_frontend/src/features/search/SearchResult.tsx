import React, { useEffect } from "react";
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";
import Card from "./components/Card";
import Read from "./components/Read";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { setLimit } from "./searchSlice";

const SearchResult = () => {
	const { selectedSearchedBook } = useAppSelector((state) => state.home);
	const { searchResults, limit } = useAppSelector((state) => state.search);

	const dispatch = useAppDispatch();

	const resetLimit = () => {
		dispatch(setLimit(20));
	};
	useEffect(() => resetLimit, []);

	const loadMore = async () => {
		const newLimit = limit + 20; // Increment the limit
		dispatch(setLimit(newLimit)); // Dispatch the new offset
	};
	return (
		<>
			{searchResults.length < 1 ? (
				<div className="p-4 flex flex-col justify-center items-center">
					<span className="font-roboto-condensed text-base">
						No Search results
					</span>
				</div>
			) : (
				<div className="p-4 flex flex-col gap-2">
					{selectedSearchedBook && (
						<Read item={selectedSearchedBook} />
					)}
					<ResponsiveMasonry
						columnsCountBreakPoints={{ 350: 1, 750: 2, 900: 3 }}
					>
						<Masonry gutter="25px">
							{searchResults.map(
								(card) =>
									card.manifest !== selectedSearchedBook?.manifest && (
										<Card key={card.manifest} item={card} />
									)
							)}
						</Masonry>
					</ResponsiveMasonry>
					{limit < 1000 && (
						<button
							onClick={loadMore}
							className="self-center mt-5 cursor-pointer flex justify-center items-center gap-1 px-2 py-1 bg-black rounded text-brightyellow font-medium font-roboto-condensed text-base"
						>
							<span>Load More</span>
						</button>
					)}
				</div>
			)}
		</>
	);
};

export default SearchResult;
