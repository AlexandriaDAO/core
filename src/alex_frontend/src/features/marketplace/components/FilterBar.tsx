import React from "react";
import { UserSelector } from "./filters/UserSelector";
import SearchBox from "./filters/SearchBox";
import { SortOrderToggle } from "./filters/SortOrderToggle";
import { Button } from "@/lib/components/button";
import { RefreshCw } from "lucide-react";

interface FilterBarProps {
	onRefresh: () => void;
	disabled?: boolean;
}

const FilterBar: React.FC<FilterBarProps> = ({
	onRefresh,
	disabled = false,
}) => {
	return (
		// flex flex-wrap items-stretch gap-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4
		<div className="flex flex-wrap items-stretch gap-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
			<SortOrderToggle disabled={disabled} />

			<UserSelector disabled={disabled} />

			<SearchBox disabled={disabled} />

			<Button
				onClick={onRefresh}
				disabled={disabled}
				variant="outline"
				className="flex items-center gap-2 h-10"
			>
				<RefreshCw className={`h-4 w-4 ${disabled ? "animate-spin" : ""}`} /> Refresh
			</Button>
		</div>
	);
};

export default FilterBar;
