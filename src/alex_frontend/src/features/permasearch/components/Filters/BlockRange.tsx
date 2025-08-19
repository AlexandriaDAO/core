import React from "react";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { setFilterRange } from "../../store/slice";

export const FilterBlockRange: React.FC = () => {
	const dispatch = useAppDispatch();
	const { filters } = useAppSelector(state => state.permasearch);

	const blockPresets = [
		{ value: 100, label: "±100 blocks (~3 hours)" },
		{ value: 500, label: "±500 blocks (~17 hours)" },
		{ value: 1000, label: "±1000 blocks (~1.5 days)" },
		{ value: 5000, label: "±5000 blocks (~1 week)" },
		{ value: 10000, label: "±10000 blocks (~2 weeks)" },
	];

	return (
		<div className="space-y-4">
			<div className="space-y-1">
				<h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wide">
					Block Range
				</h4>

				<div className="h-48 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-md">
					<div className="p-3 space-y-3">
						{blockPresets.map((preset) => (
							<label
								key={preset.value}
								className="flex items-center gap-3 cursor-pointer group"
							>
								<input
									type="radio"
									name="blockRange"
									value={preset.value}
									checked={filters.range === preset.value}
									onChange={() => dispatch(setFilterRange(preset.value))}
									className="border-gray-300 text-gray-600 focus:ring-gray-500 h-4 w-4 flex-shrink-0"
								/>
								<span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100">
									{preset.label}
								</span>
							</label>
						))}
					</div>
				</div>
			</div>

			{/* Description */}
			<div className="flex flex-col justify-start">
				<label className="block text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">
					Description
				</label>
				<p className="text-sm text-gray-500 dark:text-gray-400 font-roboto-condensed">
					Block range determines how many blocks before and after the target time to include.
				</p>
			</div>
		</div>
	);
};