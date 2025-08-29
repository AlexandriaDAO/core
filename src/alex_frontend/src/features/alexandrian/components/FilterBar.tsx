import React from "react";
import {
	SortOrderToggle,
	CollectionTypeToggle,
	UserSelector,
} from "./Filters";
import { Button } from "@/lib/components/button";
import { RotateCw } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/lib/components/tooltip";

interface FilterBarProps {
	disabled?: boolean;
	onRefresh: () => void;
}

const FilterBar: React.FC<FilterBarProps> = ({ disabled, onRefresh }) => {
	return (
        <div className="flex flex-wrap items-stretch justify-between gap-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
			<div className="flex items-center justify-between gap-3 flex-wrap">
				<SortOrderToggle disabled={disabled} />
				<CollectionTypeToggle disabled={disabled} />
				<UserSelector />
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