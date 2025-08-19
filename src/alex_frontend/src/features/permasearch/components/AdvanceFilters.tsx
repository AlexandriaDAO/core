import React from "react";
import { FilterContentTypes } from "./Filters";
import { FilterBlockRange } from "./Filters";
import { FilterTags } from "./Filters";
import { FilterActions } from "./Filters";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { setContinuousScroll, setSafeSearch } from "../store/slice";
import ContinuousScrollToggle from "@/components/ContinuousScrollToggle";
import SafeSearchToggle from "@/components/SafeSearchToggle";

const AdvanceFilters: React.FC = () => {
	const dispatch = useAppDispatch();
	const { continuousScroll, safeSearch } = useAppSelector(state => state.permasearch);

	return (
		<div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
			<div className="flex justify-between flex-wrap">
				<h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Advance Filtering</h2>

				<div className="flex items-center gap-2 flex-wrap">
					<ContinuousScrollToggle
						enabled={continuousScroll}
						setEnabled={() => dispatch(setContinuousScroll(!continuousScroll))}
					/>
					<SafeSearchToggle enabled={safeSearch} setEnabled={() => dispatch(setSafeSearch(!safeSearch))}/>
				</div>

			</div>

			<hr className="my-5 border-t border-gray-200 dark:border-gray-700" />

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				<FilterContentTypes />
				<FilterBlockRange />
				<FilterTags />
			</div>

			<hr className="my-5 border-t border-gray-200 dark:border-gray-700" />

			<FilterActions />
		</div>
	);
};

export default AdvanceFilters;
