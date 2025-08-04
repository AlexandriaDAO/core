import React, { useCallback } from "react";
import { Button } from "@/lib/components/button";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { X, RotateCcw, Check } from "lucide-react";
import {
	applyFilters,
	resetFilters,
	setShowFilters,
} from "../../store/slice";
import { useInvalidateSearchQuery } from "../../api/queries";

export const FilterActions: React.FC = () => {
	const dispatch = useAppDispatch();
	const { filters, appliedFilters } = useAppSelector(state => state.permasearch);
	const invalidateQueries = useInvalidateSearchQuery();

	// Check if selected filters differ from applied filters
	const hasFilterChanges = useCallback(() => {
		// Check content types
		if (filters.types.length !== appliedFilters.types.length) return true;
		if (filters.types.some((type: string) => !appliedFilters.types.includes(type)))
			return true;

		// Check custom content type
		if (filters.customType.trim() !== appliedFilters.customType.trim())
			return true;


		// Check tags
		if (filters.tags.length !== appliedFilters.tags.length) return true;
		if (
			filters.tags.some(
				(tag: { name: string; value: string }) =>
					!appliedFilters.tags.some(
						(appliedTag: { name: string; value: string }) =>
							appliedTag.name === tag.name &&
							appliedTag.value === tag.value
					)
			)
		)
			return true;

		// Check date range
		const currentFromStr = filters.dateRange.from || "";
		const appliedFromStr = appliedFilters.dateRange.from || "";
		const currentToStr = filters.dateRange.to || "";
		const appliedToStr = appliedFilters.dateRange.to || "";

		if (currentFromStr !== appliedFromStr || currentToStr !== appliedToStr)
			return true;

		return false;
	}, [filters, appliedFilters]);

	// Get active filter count
	const getActiveFilterCount = useCallback(() => {
		let count = 0;
		if (filters.types.length > 0 || filters.customType.trim()) count++;
		if (filters.dateRange.from || filters.dateRange.to) count++;
		if (filters.tags.length > 0) count++;
		return count;
	}, [filters]);

	const handleResetClick = useCallback(() => {
		dispatch(resetFilters());
		// Invalidate queries to trigger refetch with new filters
		invalidateQueries();
	}, [dispatch, invalidateQueries]);

	const handleApplyClick = useCallback(() => {
		dispatch(applyFilters());
		// Hide filters after applying
		dispatch(setShowFilters(false));
		// Invalidate queries to trigger refetch with new filters
		invalidateQueries();
	}, [dispatch, invalidateQueries]);

	const handleCancelClick = useCallback(() => {
		// Just hide filters without applying changes
		dispatch(setShowFilters(false));
	}, [dispatch]);

	return (
		<div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
			<div className="flex items-center gap-4">
				<Button
					onClick={handleResetClick}
					variant="outline"
					scale="sm"
					disabled={getActiveFilterCount() === 0}
					className="flex items-center gap-1"
				>
					<RotateCcw className="h-4 w-4" />
					Reset
				</Button>
				{getActiveFilterCount() > 0 && (
					<span className="text-sm text-gray-600 dark:text-gray-400">
						{getActiveFilterCount()} active
					</span>
				)}
			</div>
			<div className="flex items-center gap-2">
				<Button
					onClick={handleCancelClick}
					variant="outline"
					scale="sm"
					className="flex items-center gap-1"
				>
					<X className="h-4 w-4" />
					Cancel
				</Button>
				<Button
					onClick={handleApplyClick}
					variant="outline"
					scale="sm"
					disabled={!hasFilterChanges()}
					className="flex items-center gap-1"
				>
					<Check className="h-4 w-4" />
					Apply
				</Button>
			</div>
		</div>
	);
};