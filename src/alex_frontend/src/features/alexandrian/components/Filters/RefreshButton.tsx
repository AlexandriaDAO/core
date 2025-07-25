import React from "react";
import { Button } from "@/lib/components/button";
import { RefreshCw } from "lucide-react";

interface RefreshButtonProps {
	onRefresh: () => void;
	disabled?: boolean;
}

export function RefreshButton({ onRefresh, disabled }: RefreshButtonProps) {
	return (
		<Button
			onClick={onRefresh}
			disabled={disabled}
			variant="outline"
			className="flex items-center gap-2 h-10"
		>
			<RefreshCw
				className={`h-4 w-4 ${disabled ? "animate-spin" : ""}`}
			/>
			Refresh
		</Button>
	);
}