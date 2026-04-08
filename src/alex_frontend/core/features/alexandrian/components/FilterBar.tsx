import React, { useState } from "react";
import {
	SortOrderToggle,
	CollectionTypeToggle,
	UserSelector,
} from "./Filters";
import { Input } from "@/lib/components/input";
import { Button } from "@/lib/components/button";
import { RotateCw, Search, X } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/lib/components/tooltip";

interface FilterBarProps {
	disabled?: boolean;
	onRefresh: () => void;
	onSearch?: (query: string) => void;
	onClearSearch?: () => void;
	searching?: boolean;
}

const FilterBar: React.FC<FilterBarProps> = ({ disabled, onRefresh, onSearch, onClearSearch, searching }) => {
	const [query, setQuery] = useState("");

	const handleSearch = () => {
		if (query.trim() && onSearch) onSearch(query.trim());
	};

	const handleClear = () => {
		setQuery("");
		if (onClearSearch) onClearSearch();
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Enter") handleSearch();
	};

	return (
        <div className="flex flex-wrap items-stretch justify-between gap-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
			<div className="flex items-center justify-between gap-3 flex-wrap">
				<SortOrderToggle disabled={disabled} />
				<CollectionTypeToggle disabled={disabled} />
				<UserSelector />
			</div>

			<div className="flex-1 flex items-center gap-2 min-w-40">
				<div className="relative flex-1">
					<Input
						type="text"
						placeholder="Search nfts by description..."
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						onKeyDown={handleKeyDown}
						disabled={disabled || searching}
						className="pr-8 h-10"
						variant="default"
						scale="default"
						rounded="md"
					/>
					{query && (
						<button
							type="button"
							onClick={handleClear}
							className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
						>
							<X className="h-4 w-4" />
						</button>
					)}
				</div>
					<Button
					onClick={handleSearch}
					disabled={disabled || searching || !query.trim()}
					variant="outline"
					className="flex items-center gap-2 h-10"
				>
					<Search className={`h-4 w-4 ${searching ? "animate-pulse" : ""}`} />
					Search
				</Button>
			</div>

			<Tooltip delayDuration={0}>
				<TooltipTrigger asChild>
					<Button
						onClick={onRefresh}
						variant="outline"
						scale="icon"
						rounded="full"
						className="self-stretch place-content-center place-items-center w-10"
					>
						<RotateCw className={`${disabled ? "animate-spin" : ""}`}/>
					</Button>
				</TooltipTrigger>
				<TooltipContent side="right" sideOffset={16}>Refresh results</TooltipContent>
			</Tooltip>
		</div>
	)
}

export default FilterBar;