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
import { setSortBy } from "../../alexandrianSlice";

interface SortBySelectorProps {
	disabled?: boolean;
}

export function SortBySelector({ disabled }: SortBySelectorProps) {
	const dispatch = useAppDispatch();
	const { sortBy } = useAppSelector((state) => state.alexandrian);

	const handleSortByChange = (value: string) => {
		if (value === "default" || value === "alex" || value === "lbry") {
			dispatch(setSortBy(value));
		}
	};
	return (
		<Select
			value={sortBy}
			disabled={disabled}
			onValueChange={handleSortByChange}
		>
			<SelectTrigger className="w-20 h-7 text-xs font-roboto-condensed"><SelectValue /></SelectTrigger>
			<SelectContent>
				<SelectItem value="default">Sort By</SelectItem>
				<SelectItem value="alex">ALEX</SelectItem>
				<SelectItem value="lbry">LBRY</SelectItem>
			</SelectContent>
		</Select>
	);
}