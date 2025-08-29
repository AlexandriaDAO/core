import React, { useRef } from "react";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { Button } from "@/lib/components/button";
import { Shuffle, Calendar } from "lucide-react";
import { setTimestamp } from "../store/slice";
import { convertTimestamp } from "@/utils/general";
import { Input } from "@/lib/components/input";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/lib/components/tooltip";
import { useTheme } from "@/providers/ThemeProvider";

interface RandomDateSelectorProps {
	isRefreshing: boolean;
}

const RandomDateSelector: React.FC<RandomDateSelectorProps> = ({ isRefreshing }) => {
	const dispatch = useAppDispatch();
	const {theme} = useTheme();
	const { filters } = useAppSelector(state => state.permasearch);
	const dateTimeInputRef = useRef<HTMLInputElement>(null);

	// Timestamp constraints
	const ARWEAVE_LAUNCH_TIMESTAMP = Math.floor(new Date('2018-06-13T00:00:00Z').getTime() / 1000);
	const MAX_TIMESTAMP = Math.floor(Date.now() / 1000); // Current time

	// Convert timestamp to datetime-local format for display
	const timestampToLocalString = (timestamp: number | undefined): string => {
		if (timestamp === undefined) {
			// Show current datetime minus 1 hour as default display
			const defaultTimestamp = Math.floor((Date.now() - 60 * 60 * 1000) / 1000);
			return convertTimestamp(defaultTimestamp, 'local');
		}
		return convertTimestamp(timestamp, 'local');
	};

	// Convert datetime-local string to timestamp
	const localStringToTimestamp = (localString: string): number => {
		return Math.floor(new Date(localString).getTime() / 1000);
	};

	// Validate timestamp is within allowed range
	const validateTimestamp = (timestamp: number): boolean => {
		return timestamp >= ARWEAVE_LAUNCH_TIMESTAMP && timestamp <= MAX_TIMESTAMP;
	};

	// Trigger datetime picker
	const openDateTimePicker = () => {
		if (dateTimeInputRef.current) {
			dateTimeInputRef.current.showPicker();
		}
	};

	// Generate random timestamp
	const generateRandomDateTime = () => {
		const randomTimestamp = ARWEAVE_LAUNCH_TIMESTAMP + Math.random() * (MAX_TIMESTAMP - ARWEAVE_LAUNCH_TIMESTAMP);
		dispatch(setTimestamp(Math.floor(randomTimestamp)));
	};

	// Handle manual datetime change in input
	const handleDateTimeChange = (value: string) => {
		// Handle empty value (when user clicks "Clear" in date picker)
		if (value === '') {
			dispatch(setTimestamp(undefined));
			return;
		}
		const timestamp = localStringToTimestamp(value);
		if (!validateTimestamp(timestamp)) {
			toast.error("DateTime must be between June 13, 2018 (Arweave launch) and now");
			return;
		}
		dispatch(setTimestamp(timestamp));
	};

	return (
		<div className="relative flex items-center">
			{/* Random Button - Left Side */}
			<Tooltip>
				<TooltipTrigger asChild>
					<Button
						type="button"
						variant="muted"
						scale="icon"
						rounded="full"
						onClick={generateRandomDateTime}
						disabled={isRefreshing}
						className="absolute left-1 z-10"
					>
						<Shuffle size={16} />
					</Button>
				</TooltipTrigger>
				<TooltipContent side="left" sideOffset={8}>Generate random date & time</TooltipContent>
			</Tooltip>

			{/* DateTime Input */}
			<Input
				variant="default"
				scale="default"
				rounded="md"
				ref={dateTimeInputRef}
				type="datetime-local"
				value={timestampToLocalString(filters.timestamp)}
				onChange={(e) => handleDateTimeChange(e.target.value)}
				min={ARWEAVE_LAUNCH_TIMESTAMP}
				max={MAX_TIMESTAMP}
				className="text-muted-foreground dark:text-white h-10 pl-6 cursor-pointer text-center 
					[&::-webkit-calendar-picker-indicator]:cursor-pointer 
					[&::-webkit-calendar-picker-indicator]:opacity-60 
					[&::-webkit-calendar-picker-indicator]:mr-2"
				style={{ colorScheme: theme }}
				title="Select date and time"
			/>
		</div>
	);
};

export default RandomDateSelector;