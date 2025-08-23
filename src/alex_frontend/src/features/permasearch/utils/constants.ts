// Arweave network block timestamps at key milestones (actual network data)
export const BLOCK_TIMESTAMPS = {
    0: 1528491597,      // Genesis block - June 8, 2018
    1000: 1528615440,   // Block 1,000
    5000: 1529126259,   // Block 5,000
    10000: 1529743090,  // Block 10,000
    25000: 1531767523,  // Block 25,000
    50000: 1536415539,  // Block 50,000
    75000: 1541200068,  // Block 75,000
    100000: 1544572455, // Block 100,000
    250000: 1564519784, // Block 250,000
    500000: 1596497259, // Block 500,000
    750000: 1629136957, // Block 750,000
    1000000: 1661080544, // Block 1,000,000
    1250000: 1693237740, // Block 1,250,000
    1500000: 1725479116  // Block 1,500,000
} as const;

// Actual average block times for each era (in seconds) - based on real network data
export const BLOCK_AVERAGES = {
    0: 123.8,       // Genesis to 1k: early network
    1000: 127.7,    // 1k to 5k: stabilization
    5000: 123.4,    // 5k to 10k: continued early phase
    10000: 135.0,   // 10k to 25k: network growth
    25000: 185.9,   // 25k to 50k: slower period
    50000: 191.4,   // 50k to 75k: slowest period
    75000: 134.9,   // 75k to 100k: recovery
    100000: 133.0,  // 100k to 250k: optimized network
    250000: 127.9,  // 250k to 500k: stable period
    500000: 130.6,  // 500k to 750k: pre-modern network
    750000: 127.8,  // 750k to 1M: stabilization
    1000000: 128.6, // 1M to 1.25M: modern stable
    1250000: 129.0, // 1.25M to 1.5M: current era
    1500000: 127.7  // 1.5M+: latest measured
} as const;