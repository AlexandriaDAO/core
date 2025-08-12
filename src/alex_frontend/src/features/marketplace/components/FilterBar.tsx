import React from "react";
import { UserSelector } from "./filters/UserSelector";
import SearchBox from "./filters/SearchBox";
import { SortOrderToggle } from "./filters/SortOrderToggle";
import { Button } from "@/lib/components/button";
import { RefreshCw, RotateCw } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/lib/components/tooltip";

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

			<Tooltip delayDuration={0}>
				<TooltipTrigger asChild>
					<Button
						onClick={onRefresh}
						disabled={disabled}
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
	);
};

export default FilterBar;
