import React, { useCallback } from "react";
import {
	SortOrderToggle,
	CollectionTypeToggle,
	UserSelector,
	RefreshButton,
} from "./Filters";
import SafeSearchToggle from "@/components/SafeSearchToggle";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { setSafe } from "../alexandrianSlice";

interface FilterBarProps {
	disabled?: boolean;
	onRefresh: () => void;
}

const FilterBar: React.FC<FilterBarProps> = ({ disabled, onRefresh }) => {
	const dispatch = useAppDispatch();
	const { safe } = useAppSelector((state) => state.alexandrian);

	const handleToggle = useCallback(() => {
		dispatch(setSafe(!safe));
	}, [safe]);
	return (
		<div className="flex items-center justify-between gap-3 flex-wrap sticky top-2 z-40 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-4">
			<div className="flex items-center justify-between gap-3 flex-wrap">
				<SortOrderToggle disabled={disabled} />
				<CollectionTypeToggle disabled={disabled} />
				<UserSelector />
			</div>

			{/* Right side controls */}
			<div className="flex items-center gap-3">
				<SafeSearchToggle
					enabled={safe}
					setEnabled={handleToggle}
				/>
				<RefreshButton
					onRefresh={onRefresh}
					disabled={disabled}
				/>
			</div>
		</div>
	)
}

export default FilterBar;