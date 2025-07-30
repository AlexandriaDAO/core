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
		<Select
			value={sortBy}
			onValueChange={handleValueChange}
			disabled={disabled}
		>
			<SelectTrigger className="w-[140px] h-10">
				<SelectValue placeholder="Sort by" />
			</SelectTrigger>
			<SelectContent>
				<SelectItem value="Time">By Time</SelectItem>
				<SelectItem value="Price">By Price</SelectItem>
			</SelectContent>
		</Select>
	);
}