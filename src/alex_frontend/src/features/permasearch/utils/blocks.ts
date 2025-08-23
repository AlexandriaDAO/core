import { BLOCK_AVERAGES, BLOCK_TIMESTAMPS } from "./constants";

export const getAverageBetweenBlocks = async (start: number, end: number): Promise<number> => {
    try {
        // Fetch block data concurrently for better performance
        const [startResponse, endResponse] = await Promise.all([
            fetch(`https://arweave.net/block/height/${start}`),
            fetch(`https://arweave.net/block/height/${end}`)
        ]);

        // Check response status
        if (!startResponse.ok) throw new Error(`Failed to fetch block ${start}: ${startResponse.status} ${startResponse.statusText}`);
        if (!endResponse.ok) throw new Error(`Failed to fetch block ${end}: ${endResponse.status} ${endResponse.statusText}`);

        // Parse JSON responses
        const [startBlock, endBlock] = await Promise.all([ startResponse.json(), endResponse.json()]);

        // Validate response data
        if (!startBlock.timestamp || !endBlock.timestamp) throw new Error('Invalid block data: missing timestamp');

        const timeDifference = endBlock.timestamp - startBlock.timestamp;
        const blockDifference = end - start;

        // Calculate average block time
        return timeDifference / blockDifference;
    } catch (error) {
        if (error instanceof Error) {
            console.log(`Failed to calculate average between blocks ${start}-${end}: ${error.message}`);
        }
        console.log(`Unexpected error calculating average between blocks ${start}-${end}`);
    }
    return BLOCK_AVERAGES[1500000];
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

// get latest average from 1.5m blocks to latest block
export const getLatestAverage = (current:number) => {
    // Dynamic calculation for blocks > 1.5M
    const currentTimestamp = Math.floor(Date.now() / 1000);

    const timeSince1_5M = currentTimestamp - BLOCK_TIMESTAMPS[1500000];
    const blocksSince1_5M = current - 1500000;
    return timeSince1_5M / blocksSince1_5M;
}

// Get era-appropriate average block time based on timestamp
export const estimateBlockAverage = (timestamp: number, currentBlockHeight: number): number => {
    // Find appropriate era based on timestamp
    if (timestamp <= BLOCK_TIMESTAMPS[1000]) {
        return BLOCK_AVERAGES[0]; // 123.8s
    } else if (timestamp <= BLOCK_TIMESTAMPS[5000]) {
        return BLOCK_AVERAGES[1000]; // 127.7s
    } else if (timestamp <= BLOCK_TIMESTAMPS[10000]) {
        return BLOCK_AVERAGES[5000]; // 123.4s
    } else if (timestamp <= BLOCK_TIMESTAMPS[25000]) {
        return BLOCK_AVERAGES[10000]; // 135.0s
    } else if (timestamp <= BLOCK_TIMESTAMPS[50000]) {
        return BLOCK_AVERAGES[25000]; // 185.9s
    } else if (timestamp <= BLOCK_TIMESTAMPS[75000]) {
        return BLOCK_AVERAGES[50000]; // 191.4s
    } else if (timestamp <= BLOCK_TIMESTAMPS[100000]) {
        return BLOCK_AVERAGES[75000]; // 134.9s
    } else if (timestamp <= BLOCK_TIMESTAMPS[250000]) {
        return BLOCK_AVERAGES[100000]; // 133.0s
    } else if (timestamp <= BLOCK_TIMESTAMPS[500000]) {
        return BLOCK_AVERAGES[250000]; // 127.9s
    } else if (timestamp <= BLOCK_TIMESTAMPS[750000]) {
        return BLOCK_AVERAGES[500000]; // 130.6s
    } else if (timestamp <= BLOCK_TIMESTAMPS[1000000]) {
        return BLOCK_AVERAGES[750000]; // 127.8s
    } else if (timestamp <= BLOCK_TIMESTAMPS[1250000]) {
        return BLOCK_AVERAGES[1000000]; // 128.6s
    } else if (timestamp <= BLOCK_TIMESTAMPS[1500000]) {
        return BLOCK_AVERAGES[1250000]; // 129.0s
    } else {
        return getLatestAverage(currentBlockHeight);
    }
};


// Estimate block height using actual network milestone data
export const estimateBlockHeight = (timestamp: number, currentBlockHeight: number) => {
    const currentTimestamp = Math.floor(Date.now() / 1000);

    if (timestamp < BLOCK_TIMESTAMPS[0]) return 0;
    if (timestamp > currentTimestamp) return currentBlockHeight;

    // Use actual milestone data with correct era averages
    if (timestamp <= BLOCK_TIMESTAMPS[1000]) {
        const secondsSinceGenesis = timestamp - BLOCK_TIMESTAMPS[0];
        return Math.floor(secondsSinceGenesis / BLOCK_AVERAGES[0]); // Genesis to 1k average
    }

    if (timestamp <= BLOCK_TIMESTAMPS[5000]) {
        const secondsSince1k = timestamp - BLOCK_TIMESTAMPS[1000];
        return 1000 + Math.floor(secondsSince1k / BLOCK_AVERAGES[1000]); // 1k to 5k average
    }

    if (timestamp <= BLOCK_TIMESTAMPS[10000]) {
        const secondsSince5k = timestamp - BLOCK_TIMESTAMPS[5000];
        return 5000 + Math.floor(secondsSince5k / BLOCK_AVERAGES[5000]); // 5k to 10k average
    }

    if (timestamp <= BLOCK_TIMESTAMPS[25000]) {
        const secondsSince10k = timestamp - BLOCK_TIMESTAMPS[10000];
        return 10000 + Math.floor(secondsSince10k / BLOCK_AVERAGES[10000]); // 10k to 25k average
    }

    if (timestamp <= BLOCK_TIMESTAMPS[50000]) {
        const secondsSince25k = timestamp - BLOCK_TIMESTAMPS[25000];
        return 25000 + Math.floor(secondsSince25k / BLOCK_AVERAGES[25000]); // 25k to 50k average
    }

    if (timestamp <= BLOCK_TIMESTAMPS[75000]) {
        const secondsSince50k = timestamp - BLOCK_TIMESTAMPS[50000];
        return 50000 + Math.floor(secondsSince50k / BLOCK_AVERAGES[50000]); // 50k to 75k average
    }

    if (timestamp <= BLOCK_TIMESTAMPS[100000]) {
        const secondsSince75k = timestamp - BLOCK_TIMESTAMPS[75000];
        return 75000 + Math.floor(secondsSince75k / BLOCK_AVERAGES[75000]); // 75k to 100k average
    }

    if (timestamp <= BLOCK_TIMESTAMPS[250000]) {
        const secondsSince100k = timestamp - BLOCK_TIMESTAMPS[100000];
        return 100000 + Math.floor(secondsSince100k / BLOCK_AVERAGES[100000]); // 100k to 250k average
    }

    if (timestamp <= BLOCK_TIMESTAMPS[500000]) {
        const secondsSince250k = timestamp - BLOCK_TIMESTAMPS[250000];
        return 250000 + Math.floor(secondsSince250k / BLOCK_AVERAGES[250000]); // 250k to 500k average
    }

    if (timestamp <= BLOCK_TIMESTAMPS[750000]) {
        const secondsSince500k = timestamp - BLOCK_TIMESTAMPS[500000];
        return 500000 + Math.floor(secondsSince500k / BLOCK_AVERAGES[500000]); // 500k to 750k average
    }

    if (timestamp <= BLOCK_TIMESTAMPS[1000000]) {
        const secondsSince750k = timestamp - BLOCK_TIMESTAMPS[750000];
        return 750000 + Math.floor(secondsSince750k / BLOCK_AVERAGES[750000]); // 750k to 1M average
    }

    if (timestamp <= BLOCK_TIMESTAMPS[1250000]) {
        const secondsSince1M = timestamp - BLOCK_TIMESTAMPS[1000000];
        return 1000000 + Math.floor(secondsSince1M / BLOCK_AVERAGES[1000000]); // 1M to 1.25M average
    }

    if (timestamp <= BLOCK_TIMESTAMPS[1500000]) {
        const secondsSince1_25M = timestamp - BLOCK_TIMESTAMPS[1250000];
        return 1250000 + Math.floor(secondsSince1_25M / BLOCK_AVERAGES[1250000]); // 1.25M to 1.5M average
    }

    // For blocks above 1.5m
    const dynamicAvgBlockTime = getLatestAverage(currentBlockHeight);

    const secondsSince1_5M = timestamp - BLOCK_TIMESTAMPS[1500000];
    const estimatedBlocksSince1_5M = Math.floor(secondsSince1_5M / dynamicAvgBlockTime);
    const estimatedBlocks = 1500000 + estimatedBlocksSince1_5M;

    return Math.min(estimatedBlocks, currentBlockHeight);
};

// Function to get the block height closest to a given timestamp using binary search
export async function getBlockHeightForTimestamp(timestamp: number, minimum: number, maximum: number): Promise<number> {
    let closestBlockHeight = -1;

    while (minimum <= maximum) {
        const midHeight = Math.floor((minimum + maximum) / 2);

        // Fetch the block at midHeight
        try {
            const blockResponse = await fetch(`https://arweave.net/block/height/${midHeight}`);
            if (!blockResponse.ok) throw new Error(`Failed to fetch block at height ${midHeight}`);

            const block = await blockResponse.json();

            if (block.timestamp < timestamp) {
                minimum = midHeight + 1;
            } else if (block.timestamp > timestamp) {
                maximum = midHeight - 1;
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
        closestBlockHeight = maximum;
    }

    return closestBlockHeight;
}

export async function fetchBlockHeightForTimestamp(timestamp: number, currentBlockHeight: number): Promise<number> {
    const TOLERANCE_SECONDS = 600; // 10 minutes tolerance
    const SINGLE_CALL_THRESHOLD = 5; // Block difference threshold for single call

    // Step 1: Get reference point using multi-tier estimation
    const referenceHeight = estimateBlockHeight(timestamp, currentBlockHeight);

    try {

        // Step 2: Fetch actual timestamp for reference block (API Call 1)
        const response = await fetch(`https://arweave.net/block/height/${referenceHeight}`);
        if (!response.ok) {
            console.warn("Reference fetch failed, using estimation only");
            return referenceHeight;
        }

        const { timestamp: referenceTimestamp } = await response.json();

        // Step 3: Calculate precise historical average block time
        // const avgBlockTime = (referenceTimestamp - GENESIS_TIMESTAMP) / referenceHeight;
        const avgBlockTime = estimateBlockAverage(referenceTimestamp, currentBlockHeight)

        // Step 4: Calculate mathematical adjustment
        const blockDifference = Math.round((timestamp - referenceTimestamp) / avgBlockTime);
        let adjustedHeight = Math.max(0, Math.min(currentBlockHeight, referenceHeight + blockDifference));

        // Step 5: Early return for high-confidence single-call results
        if (Math.abs(blockDifference) <= SINGLE_CALL_THRESHOLD) {
            console.log(`[DEBUG] Single call result: ${adjustedHeight} (diff: ${blockDifference} blocks)`);
            return adjustedHeight;
        }

        // Step 6: Validate adjustment with second API call
        const validationResponse = await fetch(`https://arweave.net/block/height/${adjustedHeight}`);
        if (!validationResponse.ok) {
            console.log(`[DEBUG] Validation failed, using calculated: ${adjustedHeight}`);
            return adjustedHeight;
        }

        const { timestamp: validationTimestamp } = await validationResponse.json();
        const timeDifference = Math.abs(validationTimestamp - timestamp);

        // Step 7: Return if within tolerance
        if (timeDifference <= TOLERANCE_SECONDS) {
            console.log(`[DEBUG] Validated result: ${adjustedHeight} (error: ${timeDifference}s)`);
            return adjustedHeight;
        }

        // Step 8: Apply micro-adjustment using local average
        const localAvgBlockTime = Math.abs(validationTimestamp - referenceTimestamp) / Math.abs(adjustedHeight - referenceHeight);
        const microAdjustment = Math.round((timestamp - validationTimestamp) / localAvgBlockTime);
        const finalHeight = Math.max(0, Math.min(currentBlockHeight, adjustedHeight + microAdjustment));

        console.log(`[DEBUG] Final adjustment: ${adjustedHeight} -> ${finalHeight}`);
        return finalHeight;

    } catch (error) {
        console.error("Block height optimization failed:", error);

        return referenceHeight;
    }
}