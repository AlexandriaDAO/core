import { useMemo } from "react";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import type { Filters } from "../types";

function calculateFilterCount(filters: Filters): number {
	let count = 0;

	// Count each content type individually
	count += filters.types.length;
	
	// Count custom type if present
	if (filters.customType.trim()) {
		count++;
	}

	// Count block range as 1 if different from default (500)
	if (filters.range !== 500) {
		count++;
	}

	// Count each tag individually
	count += filters.tags.length;

	return count;
}

function calculateDirtyCount(filters: Filters, appliedFilters: Filters): number {
	let dirtyCount = 0;

	// Check content types - count changed types
	const removedTypes = appliedFilters.types.filter(type => !filters.types.includes(type));
	const addedTypes = filters.types.filter(type => !appliedFilters.types.includes(type));
	dirtyCount += removedTypes.length + addedTypes.length;

	// Check custom content type
	if (filters.customType.trim() !== appliedFilters.customType.trim()) {
		dirtyCount++;
	}

	// Check block range
	if (filters.range !== appliedFilters.range) {
		dirtyCount++;
	}

	// Check tags - count changed tags
	const removedTags = appliedFilters.tags.filter(
		tag => !filters.tags.some(
			filterTag => filterTag.name === tag.name && filterTag.value === tag.value
		)
	);
	const addedTags = filters.tags.filter(
		tag => !appliedFilters.tags.some(
			appliedTag => appliedTag.name === tag.name && appliedTag.value === tag.value
		)
	);
	dirtyCount += removedTags.length + addedTags.length;

	return dirtyCount;
}

export function useFilterCount() {
	const { filters, appliedFilters } = useAppSelector(state => state.permasearch);

	const applied = useMemo(() => {
		return calculateFilterCount(appliedFilters);
	}, [appliedFilters]);

	const dirty = useMemo(() => {
		return calculateDirtyCount(filters, appliedFilters);
	}, [filters, appliedFilters]);

	return { applied, dirty };
}