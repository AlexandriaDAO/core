import React from "react";
import { ChevronDown, ChevronUp, X } from "lucide-react";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { FILE_TYPES, getFileTypeName } from "@/features/pinax/constants";
import {
	setFilterTypes,
	setFilterCategories,
	setFilterCustomType,
	toggleExpanded,
} from "../../store/slice";
import { categoryOptions } from "../../utils";

export const FilterContentTypes: React.FC = () => {
	const dispatch = useAppDispatch();
	const { filters, expanded } = useAppSelector(
		(state: { permasearch: import("../../types").SearchState }) => state.permasearch
	);

	const handleCategoryToggle = (categoryKey: string) => {
		const newCategories = filters.categories.includes(categoryKey)
			? filters.categories.filter((c: string) => c !== categoryKey)
			: [...filters.categories, categoryKey];

		dispatch(setFilterCategories(newCategories));

		// Update content types based on selected categories
		const typesFromCategories = newCategories.flatMap(
			(category: string) =>
				FILE_TYPES[category as keyof typeof FILE_TYPES]?.types || []
		);
		dispatch(setFilterTypes(typesFromCategories));
	};

	const handleFileTypeToggle = (fileType: string) => {
		const newTypes = filters.types.includes(fileType)
			? filters.types.filter((t: string) => t !== fileType)
			: [...filters.types, fileType];

		dispatch(setFilterTypes(newTypes));
	};

	return (
		<div className="space-y-4">
			<h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wide">
				Content Types
			</h4>

			<div className="h-48 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-md">
				<div className="p-3 space-y-3">
					{categoryOptions.map((category) => (
						<div key={category.value} className="space-y-2">
							<label className="flex items-center gap-3 cursor-pointer group">
								<input
									type="checkbox"
									checked={filters.categories.includes(category.value)}
									onChange={() => handleCategoryToggle(category.value)}
									className="rounded border-gray-300 text-gray-600 focus:ring-gray-500 h-4 w-4 flex-shrink-0"
								/>
								<div className="flex items-center gap-2 flex-1 min-w-0">
									<span className="text-lg flex-shrink-0">
										{category.icon}
									</span>
									<span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100 truncate">
										{category.label}
									</span>
								</div>
								<button
									onClick={(e) => {
										e.preventDefault();
										dispatch(toggleExpanded(category.value));
									}}
									className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 flex-shrink-0"
								>
									{expanded[category.value] ? (
										<ChevronUp className="h-3 w-3 text-gray-400" />
									) : (
										<ChevronDown className="h-3 w-3 text-gray-400" />
									)}
								</button>
							</label>

							{expanded[category.value] && (
								<div className="ml-7 pl-4 border-l border-gray-200 dark:border-gray-700 space-y-2">
									{category.types.map((type: string) => (
										<label
											key={type}
											className="flex items-center gap-2 cursor-pointer"
										>
											<input
												type="checkbox"
												checked={filters.types.includes(type)}
												onChange={() => handleFileTypeToggle(type)}
												className="rounded border-gray-300 text-gray-600 focus:ring-gray-500 h-3 w-3 flex-shrink-0"
											/>
											<span className="text-xs text-gray-600 dark:text-gray-400 truncate">
												{getFileTypeName(type)}
											</span>
										</label>
									))}
								</div>
							)}
						</div>
					))}
				</div>
			</div>

			{/* Custom Content Type Input */}
			<div className="flex flex-col justify-start">
				<label className="block text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">
					Custom Type
				</label>
				<div className="relative">
					<input
						type="text"
						value={filters.customType}
						onChange={(e) => dispatch(setFilterCustomType(e.target.value))}
						placeholder="e.g., application/json"
						className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-500 dark:bg-gray-800 dark:text-white placeholder-gray-400"
					/>
					{filters.customType.trim() && (
						<button
							onClick={() => dispatch(setFilterCustomType(""))}
							className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
						>
							<X className="h-3 w-3" />
						</button>
					)}
				</div>
			</div>
		</div>
	);
};