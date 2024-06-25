import React, { useEffect } from "react";
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";
import Card from "./components/Card";
import Read from "./components/Read";
import { useAppSelector } from "src/ucg_frontend/src/store/hooks/useAppSelector";

const SearchResult = () => {
	const { selectedSearchedBook } = useAppSelector((state) => state.home);
	const { searchResults } = useAppSelector((state) => state.search);
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
									card.id !== selectedSearchedBook?.id && (
										<Card key={card.id} item={card} />
									)
							)}
						</Masonry>
					</ResponsiveMasonry>
				</div>
			)}
		</>
	);
};

export default SearchResult;
