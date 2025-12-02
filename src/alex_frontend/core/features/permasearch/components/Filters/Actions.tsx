import React, { useCallback, useState } from "react";
import { Button } from "@/lib/components/button";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { X, RotateCcw, Check } from "lucide-react";
import {
	applyFilters,
	resetFilters,
	setShowFilters,
	setFilters,
} from "../../store/slice";
import { useInvalidate } from "../../hooks/useInvalidate";
import { useFilterCount } from "../../hooks/useFilterCount";
import AppliedFilters from "./Applied";

export const FilterActions: React.FC = () => {
	const dispatch = useAppDispatch();
	const { appliedFilters } = useAppSelector(state => state.permasearch);
	const invalidate = useInvalidate();
	const { applied, dirty } = useFilterCount();
	const [showAppliedFilters, setShowAppliedFilters] = useState(false);


	const handleResetClick = useCallback(() => {
		dispatch(resetFilters());
		// Invalidate queries to trigger refetch with new filters
		invalidate();
	}, [dispatch, invalidate]);

	const handleApplyClick = useCallback(() => {
		dispatch(applyFilters());
		// Hide filters after applying
		dispatch(setShowFilters(false));
		// Invalidate queries to trigger refetch with new filters
		invalidate();
	}, [dispatch, invalidate]);

	const handleCancelClick = useCallback(() => {
		// Revert any dirty changes back to applied filters
		if (dirty > 0) {
			dispatch(setFilters(appliedFilters));
		}
		// Hide filters
		dispatch(setShowFilters(false));
	}, [dispatch, dirty, appliedFilters]);

	return (
		<>
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-4">
					<Button
						onClick={handleResetClick}
						variant="outline"
						scale="sm"
						disabled={applied === 0}
						className="flex items-center gap-1"
					>
						<RotateCcw className="h-4 w-4" />
						Reset
					</Button>
					{applied > 0 && (
						<span
							onClick={() => setShowAppliedFilters(!showAppliedFilters)}
							className="cursor-pointer text-info dark:text-primary"
						>
							{applied} active
						</span>
					)}
				</div>
				<div className="flex items-center gap-4">
					{dirty > 0 && (
						<span className="text-sm text-gray-600 dark:text-gray-400">
							{dirty} pending
						</span>
					)}
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
							disabled={dirty === 0}
							className="flex items-center gap-1"
						>
							<Check className="h-4 w-4" />
							Apply
						</Button>
					</div>
				</div>
			</div>

			{showAppliedFilters && applied > 0 && (
				<>
					<hr className="my-5 border-t border-gray-200 dark:border-gray-700" />

					<div className="mt-4">
						<AppliedFilters />
					</div>
				</>
			)}
		</>
	);
};