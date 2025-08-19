import React from "react";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { Button } from "@/lib/components/button";
import { Shuffle, RotateCcw } from "lucide-react";
import { setTimestamp } from "../store/slice";
import { Input } from "@/lib/components/input";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/lib/components/tooltip";

interface RandomDateSelectorProps {
	isRefreshing: boolean;
}

const RandomDateSelector: React.FC<RandomDateSelectorProps> = ({ isRefreshing }) => {
	const dispatch = useAppDispatch();
	const { filters } = useAppSelector(state => state.permasearch);

	// Timestamp constraints
	const ARWEAVE_LAUNCH_TIMESTAMP = Math.floor(new Date('2018-06-13T00:00:00Z').getTime() / 1000);
	const MAX_TIMESTAMP = Math.floor((Date.now() - 60 * 60 * 1000) / 1000); // Current time minus 1 hour

	// Convert timestamp to datetime-local format for display
	const timestampToLocalString = (timestamp: number | undefined): string => {
		if (timestamp === undefined) {
			// Show current datetime minus 1 hour as default display
			const defaultDate = new Date(Date.now() - 60 * 60 * 1000);
			const year = defaultDate.getFullYear();
			const month = String(defaultDate.getMonth() + 1).padStart(2, '0');
			const day = String(defaultDate.getDate()).padStart(2, '0');
			const hours = String(defaultDate.getHours()).padStart(2, '0');
			const minutes = String(defaultDate.getMinutes()).padStart(2, '0');
			return `${year}-${month}-${day}T${hours}:${minutes}`;
		}

		const date = new Date(timestamp * 1000);
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, '0');
		const day = String(date.getDate()).padStart(2, '0');
		const hours = String(date.getHours()).padStart(2, '0');
		const minutes = String(date.getMinutes()).padStart(2, '0');
		return `${year}-${month}-${day}T${hours}:${minutes}`;
	};

	// Convert datetime-local string to timestamp
	const localStringToTimestamp = (localString: string): number => {
		return Math.floor(new Date(localString).getTime() / 1000);
	};

	// Validate timestamp is within allowed range
	const validateTimestamp = (timestamp: number): boolean => {
		return timestamp >= ARWEAVE_LAUNCH_TIMESTAMP && timestamp <= MAX_TIMESTAMP;
	};

	// Reset to default timestamp (undefined)
	const resetTimestamp = () => {
		dispatch(setTimestamp(undefined));
	};

	// Generate random timestamp
	const generateRandomDateTime = () => {
		const randomTimestamp = ARWEAVE_LAUNCH_TIMESTAMP + Math.random() * (MAX_TIMESTAMP - ARWEAVE_LAUNCH_TIMESTAMP);
		dispatch(setTimestamp(Math.floor(randomTimestamp)));
	};

	// Handle manual datetime change in input
	const handleDateTimeChange = (value: string) => {
		const timestamp = localStringToTimestamp(value);
		if (!validateTimestamp(timestamp)) {
			toast.error("DateTime must be between June 13, 2018 (Arweave launch) and 1 hour ago");
			return;
		}
		dispatch(setTimestamp(timestamp));
	};

	return (
		<div className="relative flex items-stretch">
			{/* Reset Button - Left Side */}
			<Tooltip>
				<TooltipTrigger asChild>
					<Button
						type="button"
						variant="muted"
						scale="icon"
						rounded="full"
						onClick={resetTimestamp}
						disabled={isRefreshing || !filters.timestamp}
						className="p-0 absolute left-2 top-1/2 transform -translate-y-1/2 z-10"
					>
						<RotateCcw size={20} />
					</Button>
				</TooltipTrigger>
				<TooltipContent side="left" sideOffset={8}>
					<p>Reset to default time (1 hour ago)</p>
				</TooltipContent>
			</Tooltip>

			{/* DateTime Input */}
			<Tooltip>
				<TooltipTrigger asChild>
					<Input
						scale="sm"
						type="datetime-local"
						value={timestampToLocalString(filters.timestamp)}
						onChange={(e) => handleDateTimeChange(e.target.value)}
						onClick={(e)=>e.currentTarget.showPicker()}
						className="h-10 px-6 cursor-pointer text-center [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-datetime-local-picker-indicator]:hidden"
					/>
				</TooltipTrigger>
				<TooltipContent side="top" sideOffset={0}>
					<p>Click to select date & time for search</p>
				</TooltipContent>
			</Tooltip>

			{/* Random Button - Right Side */}
			<Tooltip>
				<TooltipTrigger asChild>
					<Button
						type="button"
						variant="muted"
						scale="icon"
						rounded="full"
						onClick={generateRandomDateTime}
						disabled={isRefreshing}
						className="p-0 absolute right-2 top-1/2 transform -translate-y-1/2 z-10"
					>
						<Shuffle size={20} />
					</Button>
				</TooltipTrigger>
				<TooltipContent side="right" sideOffset={8}>
					<p>Generate random date & time</p>
				</TooltipContent>
			</Tooltip>
		</div>
	);
};

export default RandomDateSelector;