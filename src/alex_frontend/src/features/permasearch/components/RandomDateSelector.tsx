import React, { useState, useRef } from "react";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { Button } from "@/lib/components/button";
import { X, Shuffle, Check, Calendar as CalendarIcon } from "lucide-react";
import { setRandomDate, clearRandomDate } from "../store/slice";
import { Input } from "@/lib/components/input";
import { toast } from "sonner";

interface RandomDateSelectorProps {
	isRefreshing: boolean;
}

const RandomDateSelector: React.FC<RandomDateSelectorProps> = ({ isRefreshing }) => {
	const dispatch = useAppDispatch();
	const { randomDate } = useAppSelector(state => state.permasearch);
	const [tempDateTime, setTempDateTime] = useState<string>('');
	const dateTimeInputRef = useRef<HTMLInputElement>(null);

	// DateTime constraints
	const ARWEAVE_LAUNCH_DATETIME = '2018-06-13T00:00'; // Arweave mainnet launch
	const TODAY_DATETIME = new Date().toISOString().slice(0, 16); // YYYY-MM-DDTHH:MM

	// Validate datetime is within allowed range
	const validateDateTime = (dateTimeString: string): boolean => {
		return dateTimeString >= ARWEAVE_LAUNCH_DATETIME && dateTimeString <= TODAY_DATETIME;
	};

	// Generate random datetime
	const generateRandomDateTime = () => {
		const startDate = new Date(ARWEAVE_LAUNCH_DATETIME);
		const endDate = new Date(TODAY_DATETIME);

		// Generate random datetime between Arweave launch and now
		const randomTimestamp = startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime());
		const randomDateObj = new Date(randomTimestamp);

		// Format as YYYY-MM-DDTHH:MM
		const dateTimeString = randomDateObj.toISOString().slice(0, 16);

		setTempDateTime(dateTimeString);
	};

	// Clear random datetime
	const clearDateTime = () => {
		dispatch(clearRandomDate());
		setTempDateTime('');
	};

	// Apply the selected/generated datetime
	const applyDateTime = () => {
		if (tempDateTime) {
			dispatch(setRandomDate(tempDateTime));
			setTempDateTime('');
		}
	};

	// Handle manual datetime change in input
	const handleDateTimeChange = (value: string) => {
		if (value && !validateDateTime(value)) {
			toast.error("DateTime must be between June 13, 2018 (Arweave launch) and now");
			return;
		}
		setTempDateTime(value);
	};

	// Trigger datetime picker
	const openDateTimePicker = () => {
		if (dateTimeInputRef.current) {
			dateTimeInputRef.current.showPicker();
		}
	};

	// Check if temp datetime is different from applied datetime
	const hasChanges = tempDateTime && tempDateTime !== randomDate;
	const showPlaceholderButton = !randomDate && !tempDateTime;

	return (
		<div className="flex items-stretch">
			<div className={`h-full flex justify-center items-stretch ${showPlaceholderButton ? 'opacity-0 w-0 invisible' : 'opacity-100 w-full visible gap-1'}`}>
				{/* Calendar Icon - triggers datetime picker */}
				<Button
					variant="outline"
					scale="sm"
					className={`p-1 ${showPlaceholderButton ? 'w-0 h-0 opacity-0 invisible':'w-auto h-auto opacity-100 visible'}`}
					onClick={openDateTimePicker}
					title="Open date time picker"
				>
					<CalendarIcon size={18}/>
				</Button>

				{/* DateTime Input with hidden picker */}
				<Input
					ref={dateTimeInputRef}
					scale="sm"
					type="datetime-local"
					value={tempDateTime || randomDate || ''}
					onChange={(e) => handleDateTimeChange(e.target.value)}
					min={ARWEAVE_LAUNCH_DATETIME}
					max={TODAY_DATETIME}
					placeholder="Select date and time"
					className="[&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-datetime-local-picker-indicator]:hidden"
				/>

			</div>

			{showPlaceholderButton &&
				<Button
					variant="outline"
					scale="sm"
					onClick={openDateTimePicker}
					title="Select date and time"
				>
					<CalendarIcon size={16} />
					Select date & time or randomize
				</Button>
			}

			<div className="mx-2 flex justify-center items-stretch h-full w-full gap-1">
				{/* Randomize Button */}
				<Button
					variant="outline"
					scale="icon"
					rounded="full"
					onClick={generateRandomDateTime}
					title="Generate random date and time"
					className="p-1"
				>
					<Shuffle size={20} />
				</Button>

				{/* Apply Button (shows when temp datetime is different) */}
				{hasChanges && (
					<Button
						variant="outline"
						scale="icon"
						rounded="full"
						onClick={isRefreshing ? undefined : applyDateTime}
						title={isRefreshing ? "Fetching results, please wait" : "Apply selected date and time"}
						className={`p-1 ${isRefreshing ? 'cursor-not-allowed opacity-70' : 'cursor-pointer opacity-100'}`}
					>
						<Check size={22} />
					</Button>
				)}

				{/* Clear Button (shows when random datetime is applied) */}
				{randomDate && !hasChanges && (
					<Button
						variant="outline"
						scale="icon"
						rounded="full"
						onClick={isRefreshing ? undefined : clearDateTime}
						title={isRefreshing ? "Fetching results, please wait" : "Clear random date and time"}
						className={`p-1 ${isRefreshing ? 'cursor-not-allowed opacity-70' : 'cursor-pointer opacity-100'}`}
					>
						<X size={22} />
					</Button>
				)}
			</div>
		</div>
	);
};

export default RandomDateSelector;