import React, { useCallback } from "react";
import { Search, X } from "lucide-react";
import { Button } from "@/lib/components/button";
import { Input } from "@/lib/components/input";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { clearQuery, setQuery, applyFilters } from "../store/slice";
import RandomDateSelector from "./RandomDateSelector";

interface SearchBoxProps {
	disabled?: boolean;
	isRefreshing?: boolean;
}

const SearchBox: React.FC<SearchBoxProps> = ({ disabled = false, isRefreshing = false }) => {
	const dispatch = useAppDispatch();
	const { filters, appliedFilters } = useAppSelector((state) => state.permasearch);

	// Check if query or timestamp have changed
	const queryChanged = filters.query.trim() !== appliedFilters.query.trim();
	const timestampChanged = filters.timestamp !== appliedFilters.timestamp;
	const hasChanges = queryChanged || timestampChanged;

	const handleSubmit = useCallback((e: React.FormEvent) => {
		e.preventDefault();

		dispatch(applyFilters());
	}, []);

	const handleClearSearch = useCallback(()=>{
		dispatch(clearQuery());

		dispatch(applyFilters());
	},[])

	const searchTitle = filters.query.trim().length > 0 && filters.query.trim().length < 43 ? "Search query must be at least 43 characters" : "Search transactions";

	return (
		<form onSubmit={handleSubmit} className="flex-grow flex flex-wrap gap-2">
			<div className="relative flex-1">
				<Input
					type="text"
					placeholder="Search by transaction ID or owner (min 43 chars)..."
					value={filters.query}
					onChange={(e) => dispatch(setQuery(e.target.value))}
					disabled={disabled}
					className="pr-10 h-10 min-w-40"
					variant="default"
					scale="default"
					rounded="md"
				/>
				{filters.query && (
					<button
						type="button"
						onClick={handleClearSearch}
						className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
						disabled={disabled}
						title="Clear search"
					>
						<X className="h-4 w-4" />
					</button>
				)}
			</div>
			<RandomDateSelector isRefreshing={isRefreshing} />
			<Button
				type="submit"
				disabled={ disabled || !hasChanges }
				variant="outline"
				className="flex items-center gap-2 h-10"
				title={hasChanges ? searchTitle : "No changes to apply"}
			>
				<Search className="h-4 w-4" />
				Search
			</Button>
		</form>
	);
};

export default SearchBox;
