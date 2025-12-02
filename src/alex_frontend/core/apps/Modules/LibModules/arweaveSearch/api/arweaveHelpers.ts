import axios from 'axios';
import { ARWEAVE_CONFIG } from '../config/arweaveConfig';

// Function to get the block height closest to a given timestamp
export async function getBlockHeightForTimestamp(timestamp: number): Promise<number> {
  // Get the current network info to determine the max block height
  const { data: networkInfo } = await axios.get(`${ARWEAVE_CONFIG.GATEWAY_URL}/info`);
  let minHeight = 0;
  let maxHeight = parseInt(networkInfo.height, 10);

  let closestBlockHeight = -1;

  while (minHeight <= maxHeight) {
    const midHeight = Math.floor((minHeight + maxHeight) / 2);

    // Fetch the block at midHeight
    try {
      const { data: block } = await axios.get(`${ARWEAVE_CONFIG.GATEWAY_URL}/block/height/${midHeight}`);

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
