import React from "react";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import {
	setFilterDateRange,
	setFilterDatePreset,
} from "../../store/slice";
import { datePresets, getDateRangeFromPreset } from "../../utils";

export const FilterDateRange: React.FC = () => {
	const dispatch = useAppDispatch();
	const { filters } = useAppSelector(
		(state: { permasearch: import("../../types").SearchState }) => state.permasearch
	);

	return (
		<div className="space-y-4">
			<h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wide">
				Date Range
			</h4>

			<div className="h-48 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-md">
				<div className="p-3 space-y-3">
					{datePresets
						.filter((p) => p.value !== "custom")
						.map((preset) => (
							<label
								key={preset.value}
								className="flex items-center gap-3 cursor-pointer group"
							>
								<input
									type="radio"
									name="datePreset"
									value={preset.value}
									checked={filters.datePreset === preset.value}
									onChange={() => {
										dispatch(setFilterDatePreset(preset.value));
										const range = getDateRangeFromPreset(preset.value);
										dispatch(setFilterDateRange(range));
									}}
									className="border-gray-300 text-gray-600 focus:ring-gray-500 h-4 w-4 flex-shrink-0"
								/>
								<span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100">
									{preset.label}
								</span>
							</label>
						))}
					<label className="flex items-center gap-3 cursor-pointer group">
						<input
							type="radio"
							name="datePreset"
							value="custom"
							checked={filters.datePreset === "custom"}
							onChange={() => dispatch(setFilterDatePreset("custom"))}
							className="border-gray-300 text-gray-600 focus:ring-gray-500 h-4 w-4 flex-shrink-0"
						/>
						<span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100">
							Custom range
						</span>
					</label>
				</div>
			</div>

			{/* Custom Date Range Inputs */}
			<div className="flex flex-col justify-start">
				<label className="block text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">
					Custom Range
				</label>
				<div className="grid grid-cols-2 gap-2">
					<input
						type="date"
						value={filters.dateRange.from || ""}
						onChange={(e) => {
							dispatch(
								setFilterDateRange({
									...filters.dateRange,
									from: e.target.value || undefined,
								})
							);
						}}
						placeholder="From"
						className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-500 dark:bg-gray-800 dark:text-white"
						onFocus={() => dispatch(setFilterDatePreset("custom"))}
					/>
					<input
						type="date"
						value={filters.dateRange.to || ""}
						onChange={(e) => {
							dispatch(
								setFilterDateRange({
									...filters.dateRange,
									to: e.target.value || undefined,
								})
							);
						}}
						placeholder="To"
						className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-500 dark:bg-gray-800 dark:text-white"
						onFocus={() => dispatch(setFilterDatePreset("custom"))}
					/>
				</div>
			</div>
		</div>
	);
};