import React, { useState, useEffect } from "react";
import { PageSizeSelector } from "./PageSizeSelector";
import { PriceSortSelector } from "./PriceSortSelector";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { Button } from "@/lib/components/button";
import { Input } from "@/lib/components/input";
import { toast } from "sonner";

interface PaginationControlsProps {
	totalPages: number;
	totalItems?: number;
	onPageClick: (event: { selected: number }) => void;
	onPageSizeChange: (size: number) => void;
	disabled?: boolean;
}

export function PaginationControls({
	totalPages,
	totalItems,
	onPageClick,
	onPageSizeChange,
	disabled,
}: PaginationControlsProps) {
	const { page } = useAppSelector((state) => state.marketplace);
	const [inputValue, setInputValue] = useState("");
	const [showGoButton, setShowGoButton] = useState(false);

	// Sync input with current page (marketplace uses 1-based indexing)
	useEffect(() => {
		const displayPage = page.toString();
		setInputValue(displayPage);
		setShowGoButton(false);
	}, [page]);

	const goToPrevious = () => {
		if (!disabled && page > 1) {
			onPageClick({ selected: page - 2 }); // Convert to 0-based for handler
		}
	};

	const goToNext = () => {
		if (!disabled && page < totalPages) {
			onPageClick({ selected: page }); // Convert to 0-based for handler
		}
	};

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		setInputValue(value);
		
		// Show Go button only if input is different and not empty
		const currentPage = page.toString();
		setShowGoButton(value.trim() !== "" && value !== currentPage);
	};

	const goToPage = () => {
		if (disabled) return;

		const pageNum = parseInt(inputValue.trim(), 10);
		
		// Validation
		if (isNaN(pageNum) || pageNum < 1) {
			toast.error("Please enter a valid page number");
			resetInput();
			return;
		}

		if (pageNum > totalPages) {
			toast.error(`Page cannot exceed ${totalPages}`);
			resetInput();
			return;
		}

		// Navigate to page (convert to 0-based index for handler)
		onPageClick({ selected: pageNum - 1 });
	};

	const resetInput = () => {
		setInputValue(page.toString());
		setShowGoButton(false);
	};

	const handleKeyPress = (e: React.KeyboardEvent) => {
		if (e.key === "Enter") {
			goToPage();
		}
	};

	// Layout for single page
	if (totalPages <= 1) {
		return (
			<div className="flex justify-between items-center flex-wrap gap-6">
				<PageSizeSelector onPageSizeChange={onPageSizeChange} disabled={disabled} />
				<PriceSortSelector disabled={disabled} />
			</div>
		);
	}

	return (
		<div className="flex justify-between items-center flex-wrap gap-6">
			<div className="flex items-center flex-wrap gap-1 font-roboto-condensed text-sm">
				<PageSizeSelector onPageSizeChange={onPageSizeChange} disabled={disabled} />
				<Button
					variant="outline"
					scale="sm"
					onClick={goToPrevious}
					disabled={disabled || page === 1}
					className="h-7 px-2 font-roboto-condensed text-xs"
				>
					Previous
				</Button>

				<div className="flex items-center gap-1 px-1">
					<span className="text-muted-foreground font-medium text-xs">Showing Page</span>
					<Input
						type="text"
						value={inputValue}
						onChange={handleInputChange}
						onKeyDown={handleKeyPress}
						disabled={disabled}
						className="w-10 h-7 text-center text-xs font-roboto-condensed font-medium"
					/>
					<span className="text-muted-foreground font-medium text-xs">of {totalPages}</span>
				</div>

				<Button
					variant="outline"
					scale="sm"
					onClick={goToNext}
					disabled={disabled || page >= totalPages}
					className="h-7 px-2 font-roboto-condensed text-xs"
				>
					Next
				</Button>

				{totalItems && (
					<span className="text-muted-foreground font-medium text-xs px-2">
						({totalItems} total items)
					</span>
				)}

				{showGoButton && (
					<Button
						scale="sm"
						onClick={goToPage}
						disabled={disabled}
						className="h-7 px-2 ml-1 font-roboto-condensed font-medium text-xs"
					>
						Go
					</Button>
				)}
			</div>

			<PriceSortSelector disabled={disabled} />
		</div>
	);
}