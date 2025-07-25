import { useAppSelector } from "@/store/hooks/useAppSelector";
import React from "react";

interface SearchBannerProps {
	count: number;
}

const SearchBanner:React.FC<SearchBannerProps> = ({ count }) => {
	const { query } = useAppSelector((state) => state.permasearch);

	const resultText = count === 0 ? "No results found" : `${count} result${count === 1 ? "" : "s"} found`;

	return (
		<p className="flex-grow text-sm text-gray-600 dark:text-gray-400">
			{resultText + ` for "${query}"`}
		</p>
	);
}
export default SearchBanner;