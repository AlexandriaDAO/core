import React from "react";
import { Switch } from "@/lib/components/switch";
import { ScrollText } from "lucide-react";

interface ContinuousScrollToggleProps {
	enabled: boolean;
	setEnabled: () => void;
}

const ContinuousScrollToggle: React.FC<ContinuousScrollToggleProps> = ({
	enabled,
	setEnabled,
}) => {
	return (
		<div className="flex items-center gap-2">
			{enabled ? (
				<>
					<ScrollText className="h-4 min-h-4 w-4 min-w-4 text-constructive" />
					<span className="font-medium text-constructive whitespace-nowrap">
						Continuous Scroll
					</span>
				</>
			) : (
				<>
					<ScrollText className="h-4 min-h-4 w-4 min-w-4 text-warning" />
					<span className="font-medium text-warning whitespace-nowrap">
						Continuous Scroll Disabled
					</span>
				</>
			)}

			<Switch
				checked={enabled}
				onCheckedChange={setEnabled}
				className="data-[state=checked]:bg-constructive data-[state=unchecked]:bg-destructive"
			/>
		</div>
	);
};

export default ContinuousScrollToggle;
