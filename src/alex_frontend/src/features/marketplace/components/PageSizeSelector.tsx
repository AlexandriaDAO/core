import React from "react";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/lib/components/select";
import { useAppSelector } from "@/store/hooks/useAppSelector";

interface PageSizeSelectorProps {
	onPageSizeChange: (size: number) => void;
	disabled?: boolean;
}

const PAGE_SIZE_OPTIONS = [12, 24, 48, 96];

export function PageSizeSelector({ onPageSizeChange, disabled }: PageSizeSelectorProps) {
	const { pageSize } = useAppSelector((state) => state.marketplace);

	const handleValueChange = (value: string) => {
		onPageSizeChange(parseInt(value, 10));
	};

	return (
		<Select
			value={pageSize.toString()}
			onValueChange={handleValueChange}
			disabled={disabled}
		>
			<SelectTrigger className="w-[180px] h-10">
				<SelectValue placeholder="Items per page" />
			</SelectTrigger>
			<SelectContent>
				{PAGE_SIZE_OPTIONS.map((size) => (
					<SelectItem key={size} value={size.toString()}>
						{size} items per page
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}