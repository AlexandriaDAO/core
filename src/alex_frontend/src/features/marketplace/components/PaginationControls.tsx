import React from "react";
import ReactPaginate from "react-paginate";
import { PageSizeSelector } from "./PageSizeSelector";
import { PriceSortSelector } from "./PriceSortSelector";
import { useAppSelector } from "@/store/hooks/useAppSelector";

interface PaginationControlsProps {
	totalPages: number;
	onPageClick: (event: { selected: number }) => void;
	onPageSizeChange: (size: number) => void;
	disabled?: boolean;
}

export function PaginationControls({
	totalPages,
	onPageClick,
	onPageSizeChange,
	disabled,
}: PaginationControlsProps) {
	const { page } = useAppSelector((state) => state.marketplace);
	if (totalPages <= 1) {
		return (
			<div className="flex justify-between items-center flex-wrap gap-4">
				<PageSizeSelector onPageSizeChange={onPageSizeChange} disabled={disabled} />
				<div></div> {/* Empty space for center */}
				<PriceSortSelector disabled={disabled} />
			</div>
		);
	}

	return (
		<div className="flex justify-between items-center flex-wrap gap-4">
			<PageSizeSelector onPageSizeChange={onPageSizeChange} disabled={disabled} />

			{/* Pagination */}
			<ReactPaginate
				previousLabel="←"
				nextLabel="→"
				breakLabel="..."
				pageCount={totalPages}
				marginPagesDisplayed={2}
				pageRangeDisplayed={3}
				onPageChange={disabled ? () => {} : onPageClick}
				forcePage={page - 1} // ReactPaginate uses 0-based index
				containerClassName={`flex items-center gap-1 ${disabled ? "pointer-events-none opacity-50" : ""}`}
				pageLinkClassName="flex items-center justify-center w-10 h-10 rounded-lg border border-border hover:bg-accent transition-colors duration-200"
				previousLinkClassName="flex items-center justify-center w-10 h-10 rounded-lg border border-border hover:bg-accent transition-colors duration-200"
				nextLinkClassName="flex items-center justify-center w-10 h-10 rounded-lg border border-border hover:bg-accent transition-colors duration-200"
				breakLinkClassName="flex items-center justify-center w-10 h-10 text-muted-foreground"
				activeLinkClassName="!bg-primary text-white hover:!bg-primary/90"
				disabledLinkClassName="opacity-50 cursor-not-allowed hover:bg-transparent"
			/>

			<PriceSortSelector disabled={disabled} />
		</div>
	);
}