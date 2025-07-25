import React from "react";
import ReactPaginate from "react-paginate";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { PageSizeSelector } from "./PageSizeSelector";
import { SortBySelector } from "./Filters";

interface PaginationControlsProps {
	// Computed values from TanStack Query
	totalPages: number;

	// State
	disabled?: boolean;

	// Actions
	onPageClick: (event: { selected: number }) => void;
}

export function PaginationControls({
	totalPages,
	disabled,
	onPageClick,
}: PaginationControlsProps) {
	// Get Redux states directly
	const { page } = useAppSelector((state) => state.alexandrian);
	if (totalPages <= 1) {
		return null;
	}

	return (
		<div className="flex justify-between items-center flex-wrap gap-4">
			<PageSizeSelector disabled={disabled} />

			{/* Pagination */}
			<ReactPaginate
				previousLabel="←"
				nextLabel="→"
				breakLabel="..."
				pageCount={totalPages}
				marginPagesDisplayed={2}
				pageRangeDisplayed={3}
				onPageChange={disabled ? () => {} : onPageClick}
				forcePage={page}
				containerClassName={`flex items-center gap-1 ${disabled ? "pointer-events-none opacity-50" : ""}`}
				pageLinkClassName="flex items-center justify-center w-10 h-10 rounded-lg border border-border hover:bg-accent transition-colors duration-200"
				previousLinkClassName="flex items-center justify-center w-10 h-10 rounded-lg border border-border hover:bg-accent transition-colors duration-200"
				nextLinkClassName="flex items-center justify-center w-10 h-10 rounded-lg border border-border hover:bg-accent transition-colors duration-200"
				breakLinkClassName="flex items-center justify-center w-10 h-10 text-muted-foreground"
				activeLinkClassName="!bg-primary text-white hover:!bg-primary/90"
				disabledLinkClassName="opacity-50 cursor-not-allowed hover:bg-transparent"
			/>

			<SortBySelector disabled={disabled} />
		</div>
	);
}