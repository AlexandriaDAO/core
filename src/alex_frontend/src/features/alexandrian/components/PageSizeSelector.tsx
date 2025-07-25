import React from "react";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/lib/components/select";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { setPageSize } from "../alexandrianSlice";
import { PAGE_SIZE_OPTIONS } from "../types";

interface PageSizeSelectorProps {
	disabled?: boolean;
}

export function PageSizeSelector({ disabled }: PageSizeSelectorProps) {
	const dispatch = useAppDispatch();
	const { pageSize } = useAppSelector((state) => state.alexandrian);

	const handlePageSizeChange = (newSize: string) => {
		dispatch(setPageSize(parseInt(newSize, 10)));
	};
	return (
		<div className="flex items-center gap-2">
			<span className="text-sm text-muted-foreground">Items per page:</span>
			<Select
				disabled={disabled}
				value={pageSize.toString()}
				onValueChange={handlePageSizeChange}
			>
				<SelectTrigger className="w-20">
					<SelectValue />
				</SelectTrigger>
				<SelectContent>
					{PAGE_SIZE_OPTIONS.map((size) => (
						<SelectItem key={size} value={size.toString()}>
							{size}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</div>
	);
}