import React from "react";
import { X } from "lucide-react";
import { toast } from "sonner";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import {
	setFilterTypes,
	setFilterDateRange,
	setFilterDatePreset,
	removeFilterTag,
	resetFilters,
	applyFilters,
	toggleSortOrder,
} from "../../store/slice";
import { useInvalidateSearchQuery } from "../../api/queries";
import { useNftManager } from "@/hooks/actors";
import { useAppSelector } from "@/store/hooks/useAppSelector";

const AppliedFilters: React.FC = () => {
	const {actor} = useNftManager();
	const dispatch = useAppDispatch();
	const { appliedFilters, sortOrder } = useAppSelector(state=>state.permasearch);
	const invalidateQueries = useInvalidateSearchQuery();

	const activeFilters = [];

	const handleApplyChanges = () => {
		if (actor) {
			dispatch(applyFilters());
			invalidateQueries();
		} else {
			toast.warning("Actor is not ready yet, try again");
		}
	};

	const handleResetAll = () => {
		if (actor) {
			dispatch(resetFilters());
			invalidateQueries();
		} else {
			toast.warning("Actor is not ready yet, try again");
		}
	};

	if (sortOrder !== "HEIGHT_DESC") {
		activeFilters.push({
			label: `Sort: ${sortOrder === "HEIGHT_ASC" ? "Oldest First" : "Newest First"}`,
			key: "sort",
			clear: () => {
				if (actor) {
					dispatch(toggleSortOrder());
				} else {
					toast.warning("Actor is not ready yet, try again");
				}
			},
		});
	}

	if (appliedFilters.types.length > 0) {
		activeFilters.push({
			label: `${appliedFilters.types.length} File Type(s)`,
			key: "types",
			clear: () => {
				dispatch(setFilterTypes([]));
				handleApplyChanges();
			},
		});
	}


	if (appliedFilters.dateRange.from || appliedFilters.dateRange.to) {
		// Get the date range label based on preset
		let dateLabel = "Date Range";
		if (appliedFilters.datePreset) {
			const presetLabels = {
				last7days: "Last 7 days",
				last30days: "Last 30 days",
				last6months: "Last 6 months",
				lastyear: "Last year",
				custom: "Custom range",
			};
			dateLabel =
				presetLabels[
					appliedFilters.datePreset as keyof typeof presetLabels
				] || "Date Range";
		}

		activeFilters.push({
			label: dateLabel,
			key: "date",
			clear: () => {
				dispatch(setFilterDateRange({ from: "", to: "" }));
				dispatch(setFilterDatePreset(""));
				handleApplyChanges();
			},
		});
	}

	appliedFilters.tags.forEach(
		(tag: { name: string; value: string }, index: number) => {
			activeFilters.push({
				label: `${tag.name}: ${tag.value}`,
				key: `tag-${index}`,
				clear: () => {
					dispatch(removeFilterTag(tag));
					handleApplyChanges();
				},
			});
		}
	);

	if (activeFilters.length === 0) {
		return null;
	}

	return (
		<div className="flex-grow flex flex-wrap gap-2">
			{activeFilters.map((filter) => (
				<div
					key={filter.key}
					className="flex items-center gap-1 px-3 py-1 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-full text-sm border border-gray-400 dark:border-gray-500"
				>
					<span className="whitespace-nowrap">{filter.label}</span>
					<button
						onClick={filter.clear}
						className="ml-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full p-0.5"
					>
						<X className="h-3 w-3" />
					</button>
				</div>
			))}
			<button
				onClick={handleResetAll}
				className="px-3 py-1 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-full text-sm hover:bg-gray-400 dark:hover:bg-gray-500 border border-gray-400 dark:border-gray-500"
			>
				Reset All
			</button>
		</div>
	);
}

export default AppliedFilters;