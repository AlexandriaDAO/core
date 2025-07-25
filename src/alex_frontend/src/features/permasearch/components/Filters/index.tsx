import React from "react";
import { FilterContentTypes } from "./ContentTypes";
import { FilterDateRange } from "./DateRange";
import { FilterTags } from "./Tags";
import { FilterActions } from "./Actions";

const SearchFilters: React.FC = () => {
	return (
		<div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
				<FilterContentTypes />
				<FilterDateRange />
				<FilterTags />
			</div>

			<FilterActions />
		</div>
	);
};

export default SearchFilters;
