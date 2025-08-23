import React from "react";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { setFilterInclude, applyFilters } from "../store/slice";
import { useInvalidate } from "../hooks/useInvalidate";
import { INCLUDE_PRESETS } from "../constants/blockRangePresets";
import { Button } from "@/lib/components/button";

interface PermaSearchEmptyStateProps {
	disabled?: boolean;
}

export const PermaSearchEmptyState: React.FC<PermaSearchEmptyStateProps> = ({disabled = false}) => {
	const dispatch = useAppDispatch();
	const { appliedFilters } = useAppSelector(state => state.permasearch);
	const invalidate = useInvalidate();

	const handleApplyChanges = () => {
		dispatch(applyFilters());
		invalidate();
	};

	const increaseRange = () => {
		const currentIndex = INCLUDE_PRESETS.findIndex(preset => preset.value === appliedFilters.include);
		const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % INCLUDE_PRESETS.length;
		console.log(`Increasing range to: ${INCLUDE_PRESETS[nextIndex].label}`);
		dispatch(setFilterInclude(INCLUDE_PRESETS[nextIndex].value));
		handleApplyChanges();
	};

	const removeRange = () => {
		dispatch(setFilterInclude(undefined));
		handleApplyChanges();
	};

	return (
		<div className="text-center py-12 max-w-md mx-auto">
			<h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
				No Results Found
			</h3>

			<div className="text-sm text-gray-600 dark:text-gray-400 mb-6">
				<p>Try expanding your search range to find more results.</p>
				<p className="mt-2">Including Previous: <span className="font-medium">{INCLUDE_PRESETS.find(p => p.value === appliedFilters.include)?.label}</span></p>
			</div>

			{
				appliedFilters.include !== undefined && (
					<div className="flex flex-col sm:flex-row gap-3 justify-center">
						{ appliedFilters.include !== INCLUDE_PRESETS[INCLUDE_PRESETS.length - 1].value &&

							<Button
								onClick={increaseRange}
								variant="link"
								disabled={disabled}
								className="flex-1 sm:flex-initial"
							>
								Increase Range
							</Button>
						}

						<Button
							onClick={removeRange}
							variant="link"
							disabled={disabled}
							className="flex-1 sm:flex-initial"
						>
							Remove Range
						</Button>
					</div>
				)
			}
		</div>
	);
};