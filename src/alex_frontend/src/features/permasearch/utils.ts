import { FILE_TYPES } from "@/features/pinax/constants";

// Get categories for filtering
export const categoryOptions = Object.entries(FILE_TYPES).map(([key, category]) => ({
	value: key,
	label: category.label,
	icon: category.icon,
	description: category.description,
	types: category.types,
}));

// Date presets for quick filtering
export const datePresets = [
	{ value: "last7days", label: "Last 7 days" },
	{ value: "last30days", label: "Last 30 days" },
	{ value: "last6months", label: "Last 6 months" },
	{ value: "lastyear", label: "Last year" },
	{ value: "custom", label: "Custom range" },
];


// Helper function to get date range from preset
export const getDateRangeFromPreset = (preset: string) => {
	const now = new Date();
	const from = new Date();

	switch (preset) {
		case "last7days":
			from.setDate(now.getDate() - 7);
			return {
				from: from.toISOString().split("T")[0],
				to: now.toISOString().split("T")[0],
			};
		case "last30days":
			from.setDate(now.getDate() - 30);
			return {
				from: from.toISOString().split("T")[0],
				to: now.toISOString().split("T")[0],
			};
		case "last6months":
			from.setMonth(now.getMonth() - 6);
			return {
				from: from.toISOString().split("T")[0],
				to: now.toISOString().split("T")[0],
			};
		case "lastyear":
			from.setFullYear(now.getFullYear() - 1);
			return {
				from: from.toISOString().split("T")[0],
				to: now.toISOString().split("T")[0],
			};
		default:
			return {};
	}
};



// Helper function to fetch current block height from Arweave
export const getCurrentBlockHeight = async (): Promise<number> => {
    try {
        const response = await fetch('https://arweave.net/info');
        if (!response.ok) {
            throw new Error('Failed to fetch Arweave info');
        }
        const data = await response.json();
        return data.height;
    } catch (error) {
        console.warn('Failed to fetch current block height, using fallback:', error);
        // Fallback to a reasonable estimate if API fails
        return 1500000; // Updated fallback estimate
    }
};

// Helper function to estimate block height using four-tier approach
export const estimateBlockHeight = (timestamp: number, currentBlockHeight: number) => {
    const genesisTimestamp = 1529020800; // June 15, 2018 UTC - Block 0
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const block10kTimestamp = 1529743090; // Block 10,000 timestamp
    const block100kTimestamp = 1544572455; // Block 100,000 timestamp
    const block1MTimestamp = 1661080544; // Block 1,000,000 timestamp (Aug 2022)

    if (timestamp < genesisTimestamp) return 0;
    if (timestamp > currentTimestamp) return currentBlockHeight;

    // Tier 1: Blocks 0-10k (very early network)
    if (timestamp <= block10kTimestamp) {
        const avgBlockTime = (block10kTimestamp - genesisTimestamp) / 10000; // 72.2 seconds
        const secondsSinceGenesis = timestamp - genesisTimestamp;
        const estimatedBlocks = Math.floor(secondsSinceGenesis / avgBlockTime);
        return Math.min(estimatedBlocks, 10000);
    }

    // Tier 2: Blocks 10k-100k (early network stabilization)
    if (timestamp <= block100kTimestamp) {
        const avgBlockTime = (block100kTimestamp - block10kTimestamp) / 90000; // 164.8 seconds
        const secondsSince10k = timestamp - block10kTimestamp;
        const estimatedBlocksSince10k = Math.floor(secondsSince10k / avgBlockTime);
        const estimatedBlocks = 10000 + estimatedBlocksSince10k;
        return Math.min(estimatedBlocks, 100000);
    }

    // Tier 3: Blocks 100k-1M (mature early network)
    if (timestamp <= block1MTimestamp) {
        const avgBlockTime = (block1MTimestamp - block100kTimestamp) / 900000; // 129.5 seconds
        const secondsSince100k = timestamp - block100kTimestamp;
        const estimatedBlocksSince100k = Math.floor(secondsSince100k / avgBlockTime);
        const estimatedBlocks = 100000 + estimatedBlocksSince100k;
        return Math.min(estimatedBlocks, 1000000);
    }

    // Tier 4: Blocks 1M+ (current network - dynamic)
    const timeSince1M = currentTimestamp - block1MTimestamp;
    const blocksSince1M = currentBlockHeight - 1000000;
    const avgBlockTime = timeSince1M / blocksSince1M;

    const secondsSince1M = timestamp - block1MTimestamp;
    const estimatedBlocksSince1M = Math.floor(secondsSince1M / avgBlockTime);
    const estimatedBlocks = 1000000 + estimatedBlocksSince1M;

    // Ensure we don't exceed current block height
    return Math.min(estimatedBlocks, currentBlockHeight);
};

// Function to get the block height closest to a given timestamp using binary search
export async function getBlockHeightForTimestamp(timestamp: number): Promise<number> {
    const ARWEAVE_GATEWAY_URL = 'https://arweave.net';

    // Get the current network info to determine the max block height
    const response = await fetch(`${ARWEAVE_GATEWAY_URL}/info`);
    if (!response.ok) throw new Error('Failed to fetch Arweave info');

    const networkInfo = await response.json();
    let minHeight = 0;
    let maxHeight = parseInt(networkInfo.height, 10);

    let closestBlockHeight = -1;

    while (minHeight <= maxHeight) {
        const midHeight = Math.floor((minHeight + maxHeight) / 2);

        // Fetch the block at midHeight
        try {
            const blockResponse = await fetch(`${ARWEAVE_GATEWAY_URL}/block/height/${midHeight}`);
            if (!blockResponse.ok) throw new Error(`Failed to fetch block at height ${midHeight}`);

            const block = await blockResponse.json();

            if (block.timestamp < timestamp) {
                minHeight = midHeight + 1;
            } else if (block.timestamp > timestamp) {
                maxHeight = midHeight - 1;
            } else {
                // Exact match found
                closestBlockHeight = midHeight;
                break;
            }
        } catch (error) {
            console.error(`Error fetching block at height ${midHeight}:`, error);
            break; // Exit if there's an error fetching the block
        }
    }

    // If exact timestamp not found, use the closest block height
    if (closestBlockHeight === -1) {
        closestBlockHeight = maxHeight;
    }

    return closestBlockHeight;
}

// Helper function to convert date or datetime string to timestamp
export function dateStringToTimestamp(dateString: string): number {
    let date: Date;
    
    // Check if it's already a datetime string (contains 'T')
    if (dateString.includes('T')) {
        // It's already a datetime string like "2023-12-25T14:30"
        date = new Date(dateString + ':00Z'); // Add seconds and Z for UTC
    } else {
        // It's a date string like "2023-12-25", convert to start of day UTC
        date = new Date(dateString + 'T00:00:00Z');
    }
    
    return Math.floor(date.getTime() / 1000); // Convert to seconds (Arweave format)
}

