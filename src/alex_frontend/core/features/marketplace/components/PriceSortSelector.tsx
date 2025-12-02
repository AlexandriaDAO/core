import React from "react";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/lib/components/select";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { setSortBy } from "@/features/marketplace/marketplaceSlice";

interface PriceSortSelectorProps {
	disabled?: boolean;
}

export function PriceSortSelector({ disabled }: PriceSortSelectorProps) {
	const dispatch = useAppDispatch();
	const { sortBy } = useAppSelector((state) => state.marketplace);

	const handleValueChange = (value: string) => {
		dispatch(setSortBy(value as 'Price' | 'Time'));
	};

	return (
		<div className="flex gap-1 items-center text-xs font-roboto-condensed">
			<span>Sort By</span>
			<Select
				value={sortBy}
				onValueChange={handleValueChange}
				disabled={disabled}
			>
				<SelectTrigger className="w-20 h-7 text-xs">
					<SelectValue />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="Time">Time</SelectItem>
					<SelectItem value="Price">Price</SelectItem>
				</SelectContent>
			</Select>
		</div>
	);
}