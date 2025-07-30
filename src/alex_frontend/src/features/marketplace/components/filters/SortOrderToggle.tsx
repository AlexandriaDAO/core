import React from "react";
import { Button } from "@/lib/components/button";
import { SortAsc } from "lucide-react";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { setSortOrder } from "@/features/marketplace/marketplaceSlice";

interface SortOrderToggleProps {
	disabled?: boolean;
}

export function SortOrderToggle({ disabled }: SortOrderToggleProps) {
	const dispatch = useAppDispatch();
	const { sortOrder } = useAppSelector((state) => state.marketplace);

	const handleToggle = () => {
		dispatch(setSortOrder(sortOrder === 'Desc' ? 'Asc' : 'Desc'));
	};

	return (
		<Button
			onClick={handleToggle}
			disabled={disabled}
			variant="outline"
			className="flex items-center gap-2 h-10"
		>
			{sortOrder === 'Desc' ? (
				<>
					<SortAsc className="h-4 w-4" /> Newest
				</>
			) : (
				<>
					<SortAsc className="h-4 w-4 rotate-180" /> Oldest
				</>
			)}
		</Button>
	);
}