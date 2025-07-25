import React, { useState, useCallback, useEffect } from "react";
import { Search, X } from "lucide-react";
import { Button } from "@/lib/components/button";
import { Input } from "@/lib/components/input";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { clearQuery, setQuery } from "../../store/slice";

interface SearchBoxProps {
	disabled?: boolean;
}

const SearchBox: React.FC<SearchBoxProps> = ({ disabled = false }) => {
	const dispatch = useAppDispatch();
	const { query } = useAppSelector((state) => state.permasearch);

	const [inputValue, setInputValue] = useState(query);

	useEffect(() => {
		setInputValue(query);
	}, [query]);

	// Clear query when input is manually emptied
	useEffect(() => {
		if (!inputValue.trim() && query) {
			dispatch(clearQuery());
		}
	}, [inputValue, query]);

	const handleSubmit = useCallback((e: React.FormEvent) => {
		e.preventDefault();

		const trimmedValue = inputValue.trim();

		if (trimmedValue) {
			dispatch(setQuery(trimmedValue));
		}
	}, [inputValue]);

	const handleClear = useCallback(() => {
		setInputValue("");
		dispatch(clearQuery());
	}, []);

	const searchTitle = inputValue.trim().length > 0 && inputValue.trim().length < 43 ? "Search query must be at least 43 characters" : "Search transactions";

	return (
		<form onSubmit={handleSubmit} className="flex-grow flex flex-wrap gap-2">
			<div className="relative flex-1">
				<Input
					type="text"
					placeholder="Search by transaction ID or owner (min 43 chars)..."
					value={inputValue}
					onChange={(e) => setInputValue(e.target.value)}
					disabled={disabled}
					className="pr-10 h-10 min-w-40"
					variant="default"
					scale="default"
					rounded="md"
				/>
				{inputValue && (
					<button
						type="button"
						onClick={handleClear}
						className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
						disabled={disabled}
						title="Clear search"
					>
						<X className="h-4 w-4" />
					</button>
				)}
			</div>
			<Button
				type="submit"
				disabled={
					disabled ||
					!inputValue.trim() ||
					inputValue.trim().length < 43
				}
				variant="outline"
				className="flex items-center gap-2 h-10"
				title={searchTitle}
			>
				<Search className="h-4 w-4" />
				Search
			</Button>
		</form>
	);
};

export default SearchBox;
