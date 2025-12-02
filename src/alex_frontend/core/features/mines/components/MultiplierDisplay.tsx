import React from "react";
import { cn } from "@/lib/utils";

interface MultiplierDisplayProps {
	currentMultiplier: number;
	revealedCount: number;
	mineCount: number;
	multiplierTable: number[];
}

const MultiplierDisplay: React.FC<MultiplierDisplayProps> = ({
	currentMultiplier,
	revealedCount,
	mineCount,
	multiplierTable,
}) => {
	const safeClicks = 16 - mineCount;

	return (
		<div className="p-4 bg-card border border-border rounded-xl">
			{/* Current Multiplier */}
			<div className="text-center mb-4">
				<div className="text-sm text-muted-foreground">Current Multiplier</div>
				<div className="text-4xl font-bold text-emerald-500 tracking-tight">
					{currentMultiplier.toFixed(2)}×
				</div>
			</div>

			{/* Multiplier Progression */}
			<div className="space-y-1">
				<div className="text-xs text-muted-foreground mb-2">Multiplier Progression</div>
				<div className="grid grid-cols-5 gap-1 text-xs">
					{multiplierTable.slice(0, 10).map((mult, index) => (
						<div
							key={index}
							className={cn(
								"p-1.5 rounded text-center transition-colors",
								index < revealedCount
									? "bg-emerald-500/20 text-emerald-400"
									: index === revealedCount
									? "bg-blue-500/20 text-blue-400 ring-1 ring-blue-500"
									: "bg-muted text-muted-foreground"
							)}
						>
							<div className="font-mono">{mult.toFixed(2)}×</div>
						</div>
					))}
				</div>
				{multiplierTable.length > 10 && (
					<div className="text-xs text-muted-foreground text-center mt-2">
						+{multiplierTable.length - 10} more...
					</div>
				)}
			</div>

			{/* Progress */}
			<div className="mt-4 text-center text-sm text-muted-foreground">
				{revealedCount} / {safeClicks} safe tiles revealed
			</div>
		</div>
	);
};

export default MultiplierDisplay;
