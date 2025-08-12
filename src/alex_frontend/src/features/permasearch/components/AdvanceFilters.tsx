import React from "react";
import { FilterContentTypes } from "./Filters";
import { FilterDateRange } from "./Filters";
import { FilterTags } from "./Filters";
import { FilterActions } from "./Filters";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { setContinuousScroll } from "../store/slice";
import ContinuousScrollToggle from "@/components/ContinuousScrollToggle";

const AdvanceFilters: React.FC = () => {
	const dispatch = useAppDispatch();
	const { continuousScroll } = useAppSelector(state => state.permasearch);

	return (
		<div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
			<div className="flex items-center justify-between">
				<h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Advance Filtering</h2>

				<ContinuousScrollToggle
					enabled={continuousScroll}
					setEnabled={() => dispatch(setContinuousScroll(!continuousScroll))}
				/>
			</div>

			<hr className="my-5 border-t border-gray-200 dark:border-gray-700" />

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				<FilterContentTypes />
				<FilterDateRange />
				<FilterTags />
			</div>

			<hr className="my-5 border-t border-gray-200 dark:border-gray-700" />

			<FilterActions />
		</div>
	);
};

export default AdvanceFilters;
