import React from "react";
import type { SerializableTile } from "../types";
import { cn } from "@/lib/utils";
import { Bomb, Gem } from "lucide-react";

interface MinesTileProps {
	tile: SerializableTile;
	onClick: () => void;
	disabled: boolean;
	isClickable: boolean;
	isLoading?: boolean;
}

const MinesTile: React.FC<MinesTileProps> = ({
	tile,
	onClick,
	disabled,
	isClickable,
	isLoading = false,
}) => {
	const isRevealed = "Revealed" in tile.state;
	const isMine = "Mine" in tile.state;
	const isHidden = "Hidden" in tile.state;

	const getBackgroundClass = () => {
		if (isLoading) return "border-emerald-500 bg-emerald-500/20";
		if (isRevealed) return "bg-emerald-500/20 border-emerald-500 shadow-lg shadow-emerald-500/20";
		if (isMine) return "bg-red-500/20 border-red-500 shadow-lg shadow-red-500/30";
		return "bg-muted border-border hover:border-muted-foreground hover:bg-muted/80";
	};

	const renderContent = () => {
		if (isLoading) {
			return (
				<div className="flex items-center justify-center gap-1.5">
					<div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: "0ms" }} />
					<div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: "150ms" }} />
					<div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: "300ms" }} />
				</div>
			);
		}
		if (isRevealed) {
			return (
				<Gem className="w-12 h-12 text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)] animate-in zoom-in-50 duration-300" />
			);
		}
		if (isMine) {
			return (
				<Bomb className="w-12 h-12 text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)] animate-in zoom-in-50 duration-300" />
			);
		}
		return null;
	};

	return (
		<button
			onClick={onClick}
			disabled={disabled || !isClickable || !isHidden || isLoading}
			className={cn(
				"aspect-square rounded-xl border-2 transition-all duration-200",
				"flex items-center justify-center relative overflow-hidden",
				"focus:outline-none focus:ring-2 focus:ring-emerald-500/50",
				getBackgroundClass(),
				isLoading && "cursor-wait",
				isClickable &&
					isHidden &&
					!disabled &&
					!isLoading &&
					"cursor-pointer hover:scale-105 active:scale-95 hover:shadow-md",
				(!isClickable || !isHidden || disabled) &&
					!isLoading &&
					"cursor-default"
			)}
		>
			{renderContent()}
		</button>
	);
};

export default MinesTile;
