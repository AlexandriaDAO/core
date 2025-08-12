import React from "react";
import { Button } from "@/lib/components/button";
import { SortAsc } from "lucide-react";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { setSortOrder } from "@/features/marketplace/marketplaceSlice";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/lib/components/tooltip";

interface SortOrderToggleProps {
	disabled?: boolean;
}

export function SortOrderToggle({ disabled }: SortOrderToggleProps) {
	const dispatch = useAppDispatch();
	const { sortOrder } = useAppSelector((state) => state.marketplace);

	const handleToggle = () => {
		dispatch(setSortOrder(sortOrder === 'Desc' ? 'Asc' : 'Desc'));
	};

	return (
		<Tooltip delayDuration={0}>
			<TooltipTrigger asChild>
				<Button
					onClick={handleToggle}
					disabled={disabled}
					variant="outline"
					rounded="full"
					scale="icon"
					className="self-stretch flex items-center w-10"
				>
					<SortAsc className={`${sortOrder === "Desc" ? "" : " rotate-180"}`} />
				</Button>
			</TooltipTrigger>
			<TooltipContent side="left" sideOffset={16}>{sortOrder === "Desc" ? 'Latest Reseults' : 'Oldest Results'}</TooltipContent>
		</Tooltip>

	);
}