import { IncludePreset } from "../types/filters";

// Block calculations based on ~30 blocks per hour (2 minute average block time)
// 1 hour = 30 blocks
// 1 day = 720 blocks
// 1 week = 5040 blocks
// 1 month (30 days) = 21600 blocks
// 6 months = 129600 blocks
// 1 year = 262800 blocks
// 3 years = 788400 blocks

export const INCLUDE_PRESETS: IncludePreset[] = [
	{
		value: undefined,
		label: "All blocks",
		description: "Includes all blocks from genesis to present",
		info: 'From genesis block'
	},

	{
		value: 720,
		label: "24 hours",
		description: "Includes 24 hours of previous data from target datetime",
		info: "~720 blocks"
	},
	{
		value: 5040,
		label: "1 week",
		description: "Includes 1 week of previous data from target datetime",
		info: "~5040 blocks"
	},
	{
		value: 21600,
		label: "1 month",
		description: "Includes 1 month of previous data from target datetime",
		info: "~21600 blocks"
	},
	{
		value: 129600,
		label: "6 months",
		description: "Includes 6 months of previous data from target datetime",
		info: "~129600 blocks"
	},
];