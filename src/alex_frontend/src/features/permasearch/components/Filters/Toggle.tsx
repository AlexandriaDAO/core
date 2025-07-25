import React, { useMemo } from "react";
import { Button } from "@/lib/components/button";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { toggleShowFilters } from "../../store/slice";
import { Filter } from "lucide-react";

interface FilterToggleProps {
	isLoading: boolean;
}

const FilterToggle: React.FC<FilterToggleProps> = ({ isLoading }) => {
	const dispatch = useAppDispatch();
	const { query, appliedFilters } = useAppSelector(state => state.permasearch);

	const count = useMemo(() => {
		let count = 0;

		// Count active content types
		if (
			appliedFilters.types.length > 0 ||
			appliedFilters.customType.trim()
		) {
			count++;
		}


		// Count date range
		if (appliedFilters.dateRange.from || appliedFilters.dateRange.to) {
			count++;
		}

		// Count tags
		if (appliedFilters.tags.length > 0) {
			count++;
		}

		return count;
	}, [appliedFilters]);

	return (
		<Button
			onClick={() => dispatch(toggleShowFilters())}
			disabled={isLoading || !!query}
			variant="outline"
			className="flex items-center gap-2 h-10"
		>
			<Filter className="h-4 w-4" /> Filters
			{count > 0 && <span className="bg-emerald-500 text-white rounded-full px-2 py-0.5 text-xs ml-1">{count}</span>}
		</Button>
	)
};

export default FilterToggle;