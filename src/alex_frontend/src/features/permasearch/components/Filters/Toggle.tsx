import React from "react";
import { Button } from "@/lib/components/button";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { toggleShowFilters } from "../../store/slice";
import { SlidersHorizontal } from "lucide-react";
import { useFilterCount } from "../../hooks/useFilterCount";

interface FilterToggleProps {
	isLoading: boolean;
}

export const FilterToggle: React.FC<FilterToggleProps> = ({ isLoading }) => {
	const dispatch = useAppDispatch();
	const { applied } = useFilterCount();

	return (
		<Button
			onClick={() => dispatch(toggleShowFilters())}
			disabled={isLoading}
			variant="outline"
			scale="icon"
			rounded="full"
			className="relative"
			title={applied > 0 ? `Filters (${applied} active)` : 'Filters'}
		>
			<SlidersHorizontal size={28} className="p-1" />
			{applied > 0 && <span className="absolute -top-2 -right-2 bg-emerald-500 text-white rounded-full h-5 w-5 flex justify-center items-center">{applied}</span>}
		</Button>
	)
};