import React from "react";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { setFilterInclude } from "../../store/slice";
import { INCLUDE_PRESETS } from "../../constants/blockRangePresets";
import { Input } from "@/lib/components/input";
import { Label } from "@/lib/components/label";

export const FilterBlockRange: React.FC = () => {
	const dispatch = useAppDispatch();
	const { filters } = useAppSelector(state => state.permasearch);

	return (
		<div className="space-y-4">
			<div className="space-y-1">
				<div className="flex gap-2 items-center">
					<h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wide">
						Past Data
					</h4>
					<span className="font-roboto-condensed text-xs text-gray-500 dark:text-gray-400">({'relative to timestamp'})</span>
				</div>

				<div className="h-44 px-2 py-0.5 border border-gray-200 dark:border-gray-700 rounded-md flex flex-col gap-0 justify-between overflow-y-auto">
					{INCLUDE_PRESETS.map((preset, index) => (
						<Label key={index} className="p-1 flex-col gap-1 items-start">
							<div className="w-full flex gap-2 items-center justify-between">
								<div className="flex items-center gap-2">
									<Input
										type="radio"
										name="blocks"
										value={index}
										checked={filters.include == preset.value}
										onChange={() => dispatch(setFilterInclude(preset.value))}
										className="cursor-pointer h-4 w-4 flex-shrink-0"
									/>
									<span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100">{preset.label}</span>
									<span className="text-sm text-gray-500 dark:text-gray-400">({preset.info})</span>
								</div>
							</div>
							{filters.include === preset.value && (
								<span className="text-xs text-gray-700 dark:text-gray-300">
									{preset.description}
								</span>
							)}
						</Label>
					))}
				</div>
			</div>
			{/* Description */}
			<div className="flex flex-col justify-start">
				<Label className="block text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">
					Description
				</Label>
				<p className="text-sm text-gray-500 dark:text-gray-400">
					Controls how much historical data to include before the target timestamp.
				</p>
			</div>
		</div>
	);
};