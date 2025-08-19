import React from "react";
import { X } from "lucide-react";
import { toast } from "sonner";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import {
	setFilterTypes,
	setFilterRange,
	removeFilterTag,
	applyFilters,
	toggleSortOrder,
} from "../../store/slice";
import { useInvalidate } from "../../hooks/useInvalidate";
import { useNftManager } from "@/hooks/actors";
import { useAppSelector } from "@/store/hooks/useAppSelector";

const AppliedFilters: React.FC = () => {
	const {actor} = useNftManager();
	const dispatch = useAppDispatch();
	const { appliedFilters, sortOrder } = useAppSelector(state=>state.permasearch);
	const invalidate = useInvalidate();

	const activeFilters = [];

	const handleApplyChanges = () => {
		if (actor) {
			dispatch(applyFilters());
			invalidate();
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


	if (appliedFilters.range !== 500) {
		activeFilters.push({
			label: `Block Range: ±${appliedFilters.range}`,
			key: "range",
			clear: () => {
				dispatch(setFilterRange(500)); // Reset to default
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
		</div>
	);
}

export default AppliedFilters;