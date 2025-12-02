import React, { useState, useCallback, useEffect } from "react";
import { Search, X } from "lucide-react";
import { Button } from "@/lib/components/button";
import { Input } from "@/lib/components/input";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { setSearchTerm } from "@/features/marketplace/marketplaceSlice";

interface SearchInputProps {
	disabled?: boolean;
}

const SearchBox: React.FC<SearchInputProps> = ({ disabled = false }) => {
	const dispatch = useAppDispatch();
	const { searchTerm } = useAppSelector((state) => state.marketplace);
	const [inputValue, setInputValue] = useState(searchTerm || "");

	useEffect(() => {
		setInputValue(searchTerm || "");
	}, [searchTerm]);

	// Clear search when input is manually emptied
	useEffect(() => {
		if (!inputValue.trim() && searchTerm) {
			dispatch(setSearchTerm(undefined));
		}
	}, [inputValue, searchTerm, dispatch]);

	const handleSubmit = useCallback((e: React.FormEvent) => {
		e.preventDefault();

		const trimmedValue = inputValue.trim();

		if (trimmedValue) {
			dispatch(setSearchTerm(trimmedValue));
		}
	}, [inputValue, dispatch]);

	const handleClear = useCallback(() => {
		setInputValue("");
		dispatch(setSearchTerm(undefined));
	}, [dispatch]);

	const searchTitle = inputValue.trim().length > 0 ? "Search NFTs by Token ID or Arweave ID" : "Search NFTs";

	return (
		<form onSubmit={handleSubmit} className="flex-grow flex flex-wrap gap-2">
			<div className="relative flex-1">
				<Input
					type="text"
					placeholder="Search by Token ID or Arweave ID..."
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
				disabled={disabled || !inputValue.trim()}
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