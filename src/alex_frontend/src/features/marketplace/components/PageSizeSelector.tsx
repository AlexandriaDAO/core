import React from "react";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/lib/components/select";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { PAGE_SIZE_OPTIONS } from "../types";

interface PageSizeSelectorProps {
	onPageSizeChange: (size: number) => void;
	disabled?: boolean;
}

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
			<SelectTrigger className="w-24 h-7 text-xs font-roboto-condensed">
				<SelectValue />
			</SelectTrigger>
			<SelectContent>
				{PAGE_SIZE_OPTIONS.map((size) => (
					<SelectItem key={size} value={size.toString()}>
						{size} Items
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}